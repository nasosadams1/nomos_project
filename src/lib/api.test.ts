import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildConsultationRequestPayload,
  buildIntakeSubmissionPayload,
  buildScheduledAtIso,
} from './api';

afterEach(() => {
  vi.useRealTimers();
});

describe('api helpers', () => {
  it('normalizes intake payloads before sending them to the backend', () => {
    const payload = buildIntakeSubmissionPayload({
      issue_type: ' Employment ',
      client_name: ' Alex   Example ',
      client_email: ' Alex@Example.COM ',
      description: ' Line one\r\n\r\n\r\nLine two ',
    });

    expect(payload.issue_type).toBe('Employment');
    expect(payload.client_name).toBe('Alex Example');
    expect(payload.client_email).toBe('alex@example.com');
    expect(payload.description).toBe('Line one\n\nLine two');
  });

  it('builds a consultation request payload with normalized identity fields', () => {
    const payload = buildConsultationRequestPayload({
      lawyerId: ' lawyer-123 ',
      consultationType: ' online ',
      dateKey: '2026-04-10',
      timeKey: '09:00',
      clientName: ' Alex   Example ',
      clientEmail: ' Alex@Example.COM ',
      clientPhone: ' +30 123 456 7890 ',
      notes: ' First line\r\n\r\n\r\nSecond line ',
    });

    expect(payload.lawyer_id).toBe('lawyer-123');
    expect(payload.consultation_type).toBe('online');
    expect(payload.date_key).toBe('2026-04-10');
    expect(payload.time_key).toBe('09:00');
    expect(payload.client_name).toBe('Alex Example');
    expect(payload.client_email).toBe('alex@example.com');
    expect(payload.client_phone).toBe('+30 123 456 7890');
    expect(payload.notes).toBe('First line\n\nSecond line');
    expect(payload.scheduled_at).toBe(new Date('2026-04-10T09:00:00').toISOString());
  });

  it('includes anti-abuse metadata when request timing details are provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:05.000Z'));

    const payload = buildConsultationRequestPayload(
      {
        lawyerId: 'lawyer-123',
        consultationType: 'online',
        dateKey: '2026-04-10',
        timeKey: '09:00',
        clientName: 'Alex Example',
        clientEmail: 'alex@example.com',
        clientPhone: '',
        notes: '',
      },
      {
        startedAt: new Date('2026-04-08T12:00:00.000Z').getTime(),
        website: ' trap ',
      },
    );

    expect(payload.submitted_after_ms).toBe(5000);
    expect(payload.website).toBe('trap');
  });

  it('rejects invalid consultation date values', () => {
    expect(() => buildScheduledAtIso('not-a-date', '09:00')).toThrow(/valid consultation date/i);
  });
});
