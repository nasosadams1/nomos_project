const euroFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) {
    return 'TBD';
  }

  if (amount === 0) {
    return 'Free';
  }

  return euroFormatter.format(amount);
}

export function formatShortDate(dateLike: string | Date) {
  return shortDateFormatter.format(new Date(dateLike));
}

export function formatLongDate(dateLike: string | Date) {
  return longDateFormatter.format(new Date(dateLike));
}

export function formatDateTime(dateLike: string | Date) {
  return dateTimeFormatter.format(new Date(dateLike));
}

export function formatAvailabilitySlot(dateKey: string, timeKey: string) {
  return `${formatShortDate(`${dateKey}T${timeKey}:00`)} at ${timeKey}`;
}

export function formatConsultationType(type: string) {
  if (type === 'in-person') {
    return 'In-person meeting';
  }

  if (type === 'online') {
    return 'Online consultation';
  }

  return 'Consultation';
}

export function formatResponseTime(hours: number) {
  if (hours <= 1) {
    return 'Within 1 hour';
  }

  if (hours < 24) {
    return `Within ${hours} hours`;
  }

  const days = Math.round(hours / 24);
  return `Within ${days} day${days === 1 ? '' : 's'}`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
