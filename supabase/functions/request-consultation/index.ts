import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { isAllowedConsultationKey } from '../_shared/availability.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { recordSecurityEvent } from '../_shared/security.ts';
import {
  isValidEmail,
  isValidPhone,
  jsonResponse,
  normalizeEmail,
  sanitizeInlineText,
  sanitizeTextarea,
} from '../_shared/validators.ts';

const allowedConsultationTypes = new Set(['online', 'in-person']);
const MIN_SUBMISSION_AGE_MS = 2_000;
const MAX_RECENT_REQUESTS_PER_EMAIL = 5;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Missing Supabase function environment variables' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const authHeader = request.headers.get('Authorization');
  const respondWithEvent = async (
    statusCode: number,
    body: Record<string, unknown>,
    event: {
      status: 'accepted' | 'blocked' | 'error' | 'info';
      reason: string;
      actorUserId?: string | null;
      actorEmail?: string | null;
      metadata?: Record<string, unknown>;
    },
  ) => {
    await recordSecurityEvent(adminClient, {
      eventType: 'request_consultation',
      channel: 'edge_function',
      ...event,
    });

    return jsonResponse(statusCode, body);
  };

  let authUser: { id: string; email?: string } | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await adminClient.auth.getUser(token);

    if (error) {
      return respondWithEvent(
        401,
        { error: 'Invalid auth token' },
        {
          status: 'blocked',
          reason: 'invalid_auth_token',
        },
      );
    }

    authUser = data.user;
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== 'object') {
    return respondWithEvent(
      400,
      { error: 'Invalid JSON body' },
      {
        status: 'blocked',
        reason: 'invalid_json_body',
        actorUserId: authUser?.id ?? null,
      },
    );
  }

  const consultationType = sanitizeInlineText(payload.consultation_type);
  const clientEmail = normalizeEmail(payload.client_email);
  const clientName = sanitizeInlineText(payload.client_name);
  const clientPhone = sanitizeInlineText(payload.client_phone);
  const notes = sanitizeTextarea(payload.notes);
  const dateKey = sanitizeInlineText(payload.date_key);
  const timeKey = sanitizeInlineText(payload.time_key);
  const website = sanitizeInlineText(payload.website);
  const submittedAfterMs = Number(payload.submitted_after_ms);
  const scheduledAtRaw = sanitizeInlineText(payload.scheduled_at);

  if (website) {
    return respondWithEvent(
      400,
      { error: 'Request blocked' },
      {
        status: 'blocked',
        reason: 'honeypot_triggered',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail || null,
      },
    );
  }

  if (!Number.isFinite(submittedAfterMs) || submittedAfterMs < MIN_SUBMISSION_AGE_MS) {
    return respondWithEvent(
      400,
      {
        error: 'Please review the request details before sending it.',
      },
      {
        status: 'blocked',
        reason: 'submitted_too_quickly',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail || null,
        metadata: { submitted_after_ms: submittedAfterMs },
      },
    );
  }

  if (!allowedConsultationTypes.has(consultationType)) {
    return jsonResponse(400, { error: 'Consultation type must be online or in-person' });
  }

  if (clientName.length < 2) {
    return jsonResponse(400, { error: 'Client name is required' });
  }

  if (!isValidEmail(clientEmail)) {
    return jsonResponse(400, { error: 'Client email is invalid' });
  }

  if (authUser?.email && authUser.email.toLowerCase() !== clientEmail) {
    return jsonResponse(400, {
      error: 'Authenticated email must match the email used for the consultation request',
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{2}:\d{2}$/.test(timeKey)) {
    return jsonResponse(400, { error: 'Consultation requests must include a valid local date and time window' });
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(scheduledAtRaw)) {
    return jsonResponse(400, { error: 'Consultation time must be sent as an ISO timestamp' });
  }

  const scheduledAt = new Date(scheduledAtRaw);

  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now() - 60_000) {
    return jsonResponse(400, { error: 'Consultation time must be in the future' });
  }

  if (!isAllowedConsultationKey(dateKey, timeKey)) {
    return jsonResponse(400, {
      error: 'Consultation requests must use one of the available business-day request windows.',
    });
  }

  if (!isValidPhone(clientPhone)) {
    return jsonResponse(400, { error: 'Client phone is invalid' });
  }

  if (notes.length > 1500) {
    return jsonResponse(400, { error: 'Additional notes must stay under 1,500 characters' });
  }

  const lawyerId = sanitizeInlineText(payload.lawyer_id);

  if (!lawyerId) {
    return jsonResponse(400, { error: 'Lawyer id is required' });
  }

  const recentCutoffIso = new Date(Date.now() - 30 * 60_000).toISOString();
  const duplicateCutoffIso = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();

  const [
    { count: recentRequestCount, error: recentRequestCountError },
    { data: duplicateRequest, error: duplicateRequestError },
  ] = await Promise.all([
    adminClient
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('client_email', clientEmail)
      .gte('created_at', recentCutoffIso),
    adminClient
      .from('consultations')
      .select('id')
      .eq('lawyer_id', lawyerId)
      .eq('client_email', clientEmail)
      .in('status', ['pending', 'confirmed'])
      .gte('created_at', duplicateCutoffIso)
      .limit(1)
      .maybeSingle(),
  ]);

  if (recentRequestCountError) {
    return jsonResponse(400, { error: recentRequestCountError.message });
  }

  if (duplicateRequestError) {
    return jsonResponse(400, { error: duplicateRequestError.message });
  }

  if ((recentRequestCount ?? 0) >= MAX_RECENT_REQUESTS_PER_EMAIL) {
    return respondWithEvent(
      429,
      {
        error: 'Too many consultation requests were submitted recently for this email. Please try again later.',
      },
      {
        status: 'blocked',
        reason: 'rate_limited_by_email',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail,
        metadata: { recent_count: recentRequestCount },
      },
    );
  }

  if (duplicateRequest) {
    return respondWithEvent(
      409,
      {
        error: 'You already have a recent pending or confirmed request with this lawyer.',
      },
      {
        status: 'blocked',
        reason: 'duplicate_request_detected',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail,
        metadata: { lawyer_id: lawyerId },
      },
    );
  }

  const { data: lawyer, error: lawyerError } = await adminClient
    .from('lawyers')
    .select('id, verified, online_consultation, in_person_consultation, consultation_fee')
    .eq('id', lawyerId)
    .single();

  if (lawyerError || !lawyer) {
    return jsonResponse(404, { error: 'Lawyer not found' });
  }

  if (!lawyer.verified) {
    return jsonResponse(400, { error: 'Consultation requests are only allowed for verified lawyers' });
  }

  if (consultationType === 'online' && !lawyer.online_consultation) {
    return jsonResponse(400, { error: 'This lawyer does not accept online consultation requests' });
  }

  if (consultationType === 'in-person' && !lawyer.in_person_consultation) {
    return jsonResponse(400, { error: 'This lawyer does not accept in-person consultation requests' });
  }

  const { data: existingConsultation } = await adminClient
    .from('consultations')
    .select('id')
    .eq('lawyer_id', lawyerId)
    .eq('scheduled_at', scheduledAt.toISOString())
    .in('status', ['pending', 'confirmed'])
    .maybeSingle();

  if (existingConsultation) {
    return respondWithEvent(
      409,
      { error: 'That slot has already been requested or confirmed' },
      {
        status: 'blocked',
        reason: 'slot_already_reserved',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail,
        metadata: { lawyer_id: lawyerId, scheduled_at: scheduledAt.toISOString() },
      },
    );
  }

  const { data, error } = await adminClient
    .from('consultations')
    .insert([
      {
        lawyer_id: lawyerId,
        client_user_id: authUser?.id ?? null,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        consultation_type: consultationType,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 60,
        fee: lawyer.consultation_fee,
        status: 'pending',
        notes,
      },
    ])
    .select('id')
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;
    return respondWithEvent(
      status,
      { error: error.message },
      {
        status: 'error',
        reason: 'insert_failed',
        actorUserId: authUser?.id ?? null,
        actorEmail: clientEmail,
        metadata: { lawyer_id: lawyerId, message: error.message },
      },
    );
  }

  return respondWithEvent(
    200,
    { consultation_id: data.id },
    {
      status: 'accepted',
      reason: 'consultation_saved',
      actorUserId: authUser?.id ?? null,
      actorEmail: clientEmail,
      metadata: { lawyer_id: lawyerId, consultation_id: data.id },
    },
  );
});
