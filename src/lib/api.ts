import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  type Session,
} from '@supabase/supabase-js';
import type { IntakeFormData } from '../types';
import type { LawyerAvailability } from './availability';
import { supabase, supabaseConfigError } from './supabase';
import {
  normalizeEmail,
  sanitizeInlineText,
  sanitizeIntakeForm,
  sanitizeTextarea,
} from './validation';

type IntakeSubmissionResponse = {
  intake_submission_id: string;
};

type ConsultationRequestResponse = {
  consultation_id: string;
};

type LawyerAvailabilityFunctionResponse = {
  availability: Record<
    string,
    {
      reserved_slot_keys: string[];
      next_available_slot: { dateKey: string; timeKey: string } | null;
    }
  >;
};

export type ConsultationRequestInput = {
  lawyerId: string;
  consultationType: string;
  dateKey: string;
  timeKey: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
};

export type SubmissionMeta = {
  startedAt: number;
  website?: string;
};

type ConsultationRequestPayload = {
  lawyer_id: string;
  consultation_type: string;
  date_key: string;
  time_key: string;
  scheduled_at: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: string;
  website: string;
  submitted_after_ms: number;
};

type IntakeSubmissionPayload = ReturnType<typeof buildIntakeSubmissionPayload> & {
  website: string;
  submitted_after_ms: number;
};

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ??
        'Supabase is not configured. Add the required environment variables to enable live data.',
    );
  }

  return supabase;
}

async function getInvocationHeaders(session?: Session | null) {
  const client = requireSupabaseClient();

  if (session?.access_token) {
    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error('We could not confirm your session state. Please refresh and try again.');
  }

  if (!data.session?.access_token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

export async function getFunctionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.clone().json();

      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
      }
    } catch {
      try {
        const bodyText = await error.context.clone().text();

        if (bodyText) {
          return bodyText;
        }
      } catch {
        return fallbackMessage;
      }
    }

    return fallbackMessage;
  }

  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

async function invokeBackendFunction<TBody extends object, TResponse>({
  functionName,
  body,
  fallbackMessage,
  session,
}: {
  functionName: string;
  body: TBody;
  fallbackMessage: string;
  session?: Session | null;
}) {
  const client = requireSupabaseClient();
  const headers = await getInvocationHeaders(session);
  const { data, error } = await client.functions.invoke(functionName, {
    body,
    headers,
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, fallbackMessage));
  }

  return data as TResponse;
}

export function buildIntakeSubmissionPayload(formData: Partial<IntakeFormData>) {
  return sanitizeIntakeForm(formData);
}

function buildSubmissionMeta(meta?: SubmissionMeta) {
  const startedAt = meta?.startedAt ?? Date.now();

  return {
    website: sanitizeInlineText(meta?.website ?? ''),
    submitted_after_ms: Math.max(Date.now() - startedAt, 0),
  };
}

export function buildScheduledAtIso(dateKey: string, timeKey: string) {
  const normalizedDate = sanitizeInlineText(dateKey);
  const normalizedTime = sanitizeInlineText(timeKey);
  const scheduledAt = new Date(`${normalizedDate}T${normalizedTime}:00`);

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error('Choose a valid consultation date and time window.');
  }

  return scheduledAt.toISOString();
}

export function buildConsultationRequestPayload(
  input: ConsultationRequestInput,
  meta?: SubmissionMeta,
): ConsultationRequestPayload {
  return {
    lawyer_id: sanitizeInlineText(input.lawyerId),
    consultation_type: sanitizeInlineText(input.consultationType),
    date_key: sanitizeInlineText(input.dateKey),
    time_key: sanitizeInlineText(input.timeKey),
    scheduled_at: buildScheduledAtIso(input.dateKey, input.timeKey),
    client_name: sanitizeInlineText(input.clientName),
    client_email: normalizeEmail(input.clientEmail),
    client_phone: sanitizeInlineText(input.clientPhone),
    notes: sanitizeTextarea(input.notes),
    ...buildSubmissionMeta(meta),
  };
}

export async function submitIntakeRequest(
  formData: Partial<IntakeFormData>,
  meta?: SubmissionMeta,
  session?: Session | null,
) {
  return invokeBackendFunction<IntakeSubmissionPayload, IntakeSubmissionResponse>({
    functionName: 'submit-intake',
    body: {
      ...buildIntakeSubmissionPayload(formData),
      ...buildSubmissionMeta(meta),
    },
    fallbackMessage:
      'We could not save your intake request right now. Please try again in a moment.',
    session,
  });
}

export async function requestConsultation(
  input: ConsultationRequestInput,
  meta?: SubmissionMeta,
  session?: Session | null,
) {
  return invokeBackendFunction<ConsultationRequestPayload, ConsultationRequestResponse>({
    functionName: 'request-consultation',
    body: buildConsultationRequestPayload(input, meta),
    fallbackMessage: 'We could not save your consultation request. Please try again.',
    session,
  });
}

export async function fetchLawyerAvailability(lawyerIds: string[], days = 10) {
  const normalizedLawyerIds = lawyerIds.map((lawyerId) => sanitizeInlineText(lawyerId)).filter(Boolean);

  if (normalizedLawyerIds.length === 0) {
    return {} as Record<string, LawyerAvailability>;
  }

  const data = await invokeBackendFunction<
    { lawyer_ids: string[]; days: number },
    LawyerAvailabilityFunctionResponse
  >({
    functionName: 'list-lawyer-availability',
    body: {
      lawyer_ids: normalizedLawyerIds,
      days,
    },
    fallbackMessage: 'We could not load consultation availability right now.',
  });

  return Object.fromEntries(
    Object.entries(data.availability ?? {}).map(([lawyerId, availability]) => [
      lawyerId,
      {
        reservedSlotKeys: availability.reserved_slot_keys ?? [],
        nextAvailableSlot: availability.next_available_slot ?? null,
      },
    ]),
  ) as Record<string, LawyerAvailability>;
}
