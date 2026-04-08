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

const ACTIVE_STATUSES = new Set(['pending', 'confirmed']);
const BUSINESS_DAY_LABELS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
const PLATFORM_TIME_ZONE = 'Europe/Athens';
const athensDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PLATFORM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const athensTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: PLATFORM_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const athensWeekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: PLATFORM_TIME_ZONE,
  weekday: 'short',
});

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatLocalDateKey(date: Date) {
  const parts = athensDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  return `${year}-${month}-${day}`;
}

export function formatLocalTimeKey(date: Date) {
  const parts = athensTimeFormatter.formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

  return `${pad(Number(hour))}:${pad(Number(minute))}`;
}

function getAthensWeekdayLabel(date: Date) {
  return athensWeekdayFormatter.format(date);
}

export function createSlotKey(dateKey: string, timeKey: string) {
  return `${dateKey}|${timeKey}`;
}

export function getUpcomingBusinessDates(days = 10) {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  while (dates.length < days) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);

    if (!BUSINESS_DAY_LABELS.has(getAthensWeekdayLabel(cursor))) {
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
  consultations: Array<{ scheduled_at: string; status: string }>,
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
          dateKey,
          timeKey,
        };
      }
    }
  }

  return null;
}

export function isAllowedConsultationKey(dateKey: string, timeKey: string, days = 10) {
  if (!CONSULTATION_TIME_SLOTS.includes(timeKey)) {
    return false;
  }

  const allowedDateKeys = new Set(getUpcomingBusinessDates(days).map(formatLocalDateKey));

  return allowedDateKeys.has(dateKey);
}
