import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
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

const MIN_SUBMISSION_AGE_MS = 3_000;
const MAX_RECENT_INTAKES_PER_EMAIL = 3;

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
      eventType: 'submit_intake',
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

  const intake = {
    issue_type: sanitizeInlineText(payload.issue_type),
    location: sanitizeInlineText(payload.location),
    urgency: sanitizeInlineText(payload.urgency),
    preferred_language: sanitizeInlineText(payload.preferred_language),
    consultation_format: sanitizeInlineText(payload.consultation_format),
    budget: sanitizeInlineText(payload.budget),
    description: sanitizeTextarea(payload.description),
    client_name: sanitizeInlineText(payload.client_name),
    client_email: normalizeEmail(payload.client_email),
    client_phone: sanitizeInlineText(payload.client_phone),
  };
  const website = sanitizeInlineText(payload.website);
  const submittedAfterMs = Number(payload.submitted_after_ms);

  if (website) {
    return respondWithEvent(
      400,
      { error: 'Request blocked' },
      {
        status: 'blocked',
        reason: 'honeypot_triggered',
        actorUserId: authUser?.id ?? null,
        actorEmail: intake.client_email || null,
      },
    );
  }

  if (!Number.isFinite(submittedAfterMs) || submittedAfterMs < MIN_SUBMISSION_AGE_MS) {
    return respondWithEvent(
      400,
      {
        error: 'Please take a moment to review the intake before submitting it.',
      },
      {
        status: 'blocked',
        reason: 'submitted_too_quickly',
        actorUserId: authUser?.id ?? null,
        actorEmail: intake.client_email || null,
        metadata: { submitted_after_ms: submittedAfterMs },
      },
    );
  }

  if (
    !intake.issue_type ||
    !intake.location ||
    !intake.urgency ||
    !intake.preferred_language ||
    !intake.consultation_format ||
    !intake.budget
  ) {
    return jsonResponse(400, { error: 'Missing required intake fields' });
  }

  if (intake.description.length < 40 || intake.description.length > 4000) {
    return jsonResponse(400, { error: 'Description must be between 40 and 4000 characters' });
  }

  if (intake.client_name.length < 2) {
    return jsonResponse(400, { error: 'Client name is required' });
  }

  if (!isValidEmail(intake.client_email)) {
    return jsonResponse(400, { error: 'Client email is invalid' });
  }

  if (!isValidPhone(intake.client_phone)) {
    return jsonResponse(400, { error: 'Client phone is invalid' });
  }

  if (authUser?.email && authUser.email.toLowerCase() !== intake.client_email) {
    return jsonResponse(400, {
      error: 'Authenticated email must match the email used for the intake request',
    });
  }

  const recentCutoffIso = new Date(Date.now() - 30 * 60_000).toISOString();
  const duplicateCutoffIso = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

  const [{ count: recentCount, error: recentCountError }, { data: duplicateIntake, error: duplicateError }] =
    await Promise.all([
      adminClient
        .from('intake_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('client_email', intake.client_email)
        .gte('created_at', recentCutoffIso),
      adminClient
        .from('intake_submissions')
        .select('id')
        .eq('client_email', intake.client_email)
        .eq('description', intake.description)
        .gte('created_at', duplicateCutoffIso)
        .limit(1)
        .maybeSingle(),
    ]);

  if (recentCountError) {
    return jsonResponse(400, { error: recentCountError.message });
  }

  if (duplicateError) {
    return jsonResponse(400, { error: duplicateError.message });
  }

  if ((recentCount ?? 0) >= MAX_RECENT_INTAKES_PER_EMAIL) {
    return respondWithEvent(
      429,
      {
        error: 'Too many intake requests were submitted recently for this email. Please try again later.',
      },
      {
        status: 'blocked',
        reason: 'rate_limited_by_email',
        actorUserId: authUser?.id ?? null,
        actorEmail: intake.client_email,
        metadata: { recent_count: recentCount },
      },
    );
  }

  if (duplicateIntake) {
    return respondWithEvent(
      409,
      {
        error: 'A very similar intake request was already submitted recently for this email.',
      },
      {
        status: 'blocked',
        reason: 'duplicate_intake_detected',
        actorUserId: authUser?.id ?? null,
        actorEmail: intake.client_email,
      },
    );
  }

  const { data, error } = await adminClient
    .from('intake_submissions')
    .insert([
      {
        ...intake,
        client_user_id: authUser?.id ?? null,
      },
    ])
    .select('id')
    .single();

  if (error) {
    return respondWithEvent(
      400,
      { error: error.message },
      {
        status: 'error',
        reason: 'insert_failed',
        actorUserId: authUser?.id ?? null,
        actorEmail: intake.client_email,
        metadata: { message: error.message },
      },
    );
  }

  return respondWithEvent(
    200,
    { intake_submission_id: data.id },
    {
      status: 'accepted',
      reason: 'intake_saved',
      actorUserId: authUser?.id ?? null,
      actorEmail: intake.client_email,
      metadata: { intake_submission_id: data.id },
    },
  );
});
