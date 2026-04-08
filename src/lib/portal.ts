import type { CaseFile, Consultation, MessageRecord } from '../types';

export type LawyerMiniProfile = {
  id: string;
  full_name: string;
  city: string;
};

export type PortalState = {
  consultations: Consultation[];
  cases: CaseFile[];
  messages: MessageRecord[];
  lawyersById: Record<string, LawyerMiniProfile>;
};

export function createEmptyPortalState(): PortalState {
  return {
    consultations: [],
    cases: [],
    messages: [],
    lawyersById: {},
  };
}

export function collectPortalLawyerIds(
  consultations: Consultation[],
  cases: CaseFile[],
) {
  return Array.from(
    new Set(
      [...consultations, ...cases]
        .map((entry) => entry.lawyer_id)
        .filter(Boolean),
    ),
  );
}

export function mapLawyersById(lawyers: LawyerMiniProfile[]) {
  return Object.fromEntries(lawyers.map((lawyer) => [lawyer.id, lawyer]));
}

export function getUnreadMessageCount(messages: MessageRecord[]) {
  return messages.filter((message) => !message.read).length;
}

export function isMissingClaimClientRecordsError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? '';

  return (
    message.includes('claim_client_records')
    && (
      message.includes('does not exist')
      || message.includes('could not find the function')
      || message.includes('no function matches the given name')
    )
  );
}
