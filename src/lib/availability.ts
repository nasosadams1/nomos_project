import type { Consultation } from '../types';

export const CONSULTATION_TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
] as const;

export type AvailabilitySlot = {
  dateKey: string;
  timeKey: string;
};

export type LawyerAvailability = {
  reservedSlotKeys: string[];
  nextAvailableSlot: AvailabilitySlot | null;
};

const ACTIVE_STATUSES = new Set(['pending', 'confirmed']);
const BUSINESS_DAYS = new Set([1, 2, 3, 4, 5]);

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLocalTimeKey(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createSlotKey(dateKey: string, timeKey: string) {
  return `${dateKey}|${timeKey}`;
}

export function getUpcomingBusinessDates(days = 10) {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < days) {
    cursor.setDate(cursor.getDate() + 1);

    if (!BUSINESS_DAYS.has(cursor.getDay())) {
      continue;
    }

    dates.push(new Date(cursor));
  }

  return dates;
}

export function getAvailabilityWindow(days = 10) {
  const dates = getUpcomingBusinessDates(days);
  const firstDate = new Date(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);
  firstDate.setHours(0, 0, 0, 0);
  lastDate.setHours(23, 59, 59, 999);

  return {
    dates,
    startIso: firstDate.toISOString(),
    endIso: lastDate.toISOString(),
  };
}

export function getReservedSlotKeys(
  consultations: Array<Pick<Consultation, 'scheduled_at' | 'status'>>,
) {
  const reserved = new Set<string>();

  consultations.forEach((consultation) => {
    if (!ACTIVE_STATUSES.has(consultation.status)) {
      return;
    }

    const scheduledAt = new Date(consultation.scheduled_at);
    reserved.add(
      createSlotKey(formatLocalDateKey(scheduledAt), formatLocalTimeKey(scheduledAt)),
    );
  });

  return reserved;
}

export function getNextAvailableSlot(reservedSlots: Set<string>, days = 10) {
  const dates = getUpcomingBusinessDates(days);

  for (const date of dates) {
    const dateKey = formatLocalDateKey(date);

    for (const timeKey of CONSULTATION_TIME_SLOTS) {
      if (!reservedSlots.has(createSlotKey(dateKey, timeKey))) {
        return {
          date,
          dateKey,
          timeKey,
        };
      }
    }
  }

  return null;
}
