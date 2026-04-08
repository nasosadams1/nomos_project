import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {
  getAvailabilityWindow,
  getNextAvailableSlot,
  getReservedSlotKeys,
} from '../_shared/availability.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { jsonResponse, sanitizeInlineText } from '../_shared/validators.ts';

type AvailabilityPayload = {
  lawyer_ids?: unknown;
  days?: unknown;
};

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
  const payload = (await request.json().catch(() => null)) as AvailabilityPayload | null;

  if (!payload || typeof payload !== 'object') {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const lawyerIds = Array.isArray(payload.lawyer_ids)
    ? payload.lawyer_ids
        .map((value) => sanitizeInlineText(value))
        .filter(Boolean)
        .slice(0, 50)
    : [];

  if (lawyerIds.length === 0) {
    return jsonResponse(400, { error: 'At least one lawyer id is required' });
  }

  const requestedDays = Number(payload.days);
  const days = Number.isInteger(requestedDays)
    ? Math.min(Math.max(requestedDays, 1), 14)
    : 10;

  const { startIso, endIso } = getAvailabilityWindow(days);

  const { data, error } = await adminClient
    .from('consultations')
    .select('lawyer_id, scheduled_at, status')
    .in('lawyer_id', lawyerIds)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', startIso)
    .lte('scheduled_at', endIso);

  if (error) {
    return jsonResponse(400, { error: error.message });
  }

  const consultationsByLawyer = new Map<
    string,
    Array<{ lawyer_id: string; scheduled_at: string; status: string }>
  >();

  for (const lawyerId of lawyerIds) {
    consultationsByLawyer.set(lawyerId, []);
  }

  for (const row of data ?? []) {
    const nextRows = consultationsByLawyer.get(row.lawyer_id) ?? [];
    nextRows.push(row);
    consultationsByLawyer.set(row.lawyer_id, nextRows);
  }

  const availability = Object.fromEntries(
    lawyerIds.map((lawyerId) => {
      const rows = consultationsByLawyer.get(lawyerId) ?? [];
      const reservedSlotKeys = Array.from(getReservedSlotKeys(rows));
      const nextAvailableSlot = getNextAvailableSlot(new Set(reservedSlotKeys), days);

      return [
        lawyerId,
        {
          reserved_slot_keys: reservedSlotKeys,
          next_available_slot: nextAvailableSlot,
        },
      ];
    }),
  );

  return jsonResponse(200, { availability });
});
