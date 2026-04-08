import { describe, expect, it } from 'vitest';
import {
  CONSULTATION_TIME_SLOTS,
  createSlotKey,
  formatLocalDateKey,
  getNextAvailableSlot,
  getUpcomingBusinessDates,
} from './availability';

describe('availability helpers', () => {
  it('returns only business days for the request window', () => {
    const dates = getUpcomingBusinessDates(10);

    expect(dates).toHaveLength(10);
    dates.forEach((date) => {
      expect([0, 6]).not.toContain(date.getDay());
    });
  });

  it('finds the next free slot when the earliest one is reserved', () => {
    const firstDate = getUpcomingBusinessDates(1)[0];
    const firstDateKey = formatLocalDateKey(firstDate);
    const reserved = new Set([createSlotKey(firstDateKey, CONSULTATION_TIME_SLOTS[0])]);

    const nextSlot = getNextAvailableSlot(reserved, 1);

    expect(nextSlot).not.toBeNull();
    expect(nextSlot?.dateKey).toBe(firstDateKey);
    expect(nextSlot?.timeKey).toBe(CONSULTATION_TIME_SLOTS[1]);
  });

  it('returns slot keys in the expected date|time format', () => {
    expect(createSlotKey('2026-04-10', '09:00')).toBe('2026-04-10|09:00');
  });
});
