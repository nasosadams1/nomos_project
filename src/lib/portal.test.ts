import { describe, expect, it } from 'vitest';
import {
  collectPortalLawyerIds,
  getUnreadMessageCount,
  isMissingClaimClientRecordsError,
  mapLawyersById,
} from './portal';

describe('portal helpers', () => {
  it('deduplicates lawyer ids collected from consultations and cases', () => {
    const lawyerIds = collectPortalLawyerIds(
      [
        { lawyer_id: 'lawyer-1' },
        { lawyer_id: 'lawyer-2' },
      ] as never[],
      [
        { lawyer_id: 'lawyer-2' },
        { lawyer_id: 'lawyer-3' },
      ] as never[],
    );

    expect(lawyerIds).toEqual(['lawyer-1', 'lawyer-2', 'lawyer-3']);
  });

  it('indexes lawyer mini-profiles by id', () => {
    expect(
      mapLawyersById([
        { id: 'lawyer-1', full_name: 'A Lawyer', city: 'Athens' },
        { id: 'lawyer-2', full_name: 'B Lawyer', city: 'Thessaloniki' },
      ]),
    ).toEqual({
      'lawyer-1': { id: 'lawyer-1', full_name: 'A Lawyer', city: 'Athens' },
      'lawyer-2': { id: 'lawyer-2', full_name: 'B Lawyer', city: 'Thessaloniki' },
    });
  });

  it('counts unread messages and detects missing claim RPC errors', () => {
    expect(
      getUnreadMessageCount([
        { read: false },
        { read: true },
        { read: false },
      ] as never[]),
    ).toBe(2);

    expect(
      isMissingClaimClientRecordsError({
        message: 'Could not find the function public.claim_client_records() in the schema cache',
      }),
    ).toBe(true);
    expect(isMissingClaimClientRecordsError({ message: 'permission denied' })).toBe(false);
  });
});
