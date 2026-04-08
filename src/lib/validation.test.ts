import { describe, expect, it } from 'vitest';
import { getBookingValidationErrors, getIntakeStepError, sanitizeIntakeForm } from './validation';

describe('validation helpers', () => {
  it('validates step-specific intake requirements', () => {
    expect(getIntakeStepError(1, {})).toMatch(/legal issue/i);
    expect(
      getIntakeStepError(8, {
        client_name: 'A',
        client_email: 'bad-email',
      }),
    ).toBeTruthy();
    expect(
      getIntakeStepError(8, {
        client_name: 'Alex Example',
        client_email: 'alex@example.com',
      }),
    ).toBeNull();
  });

  it('normalizes intake payloads before submission', () => {
    const payload = sanitizeIntakeForm({
      issue_type: '  Employment ',
      description: ' Line one\r\n\r\n\r\nLine two ',
      client_name: '  Alex   Example ',
    });

    expect(payload.issue_type).toBe('Employment');
    expect(payload.description).toBe('Line one\n\nLine two');
    expect(payload.client_name).toBe('Alex Example');
  });

  it('returns booking field errors for invalid inputs', () => {
    const errors = getBookingValidationErrors({
      name: 'A',
      email: 'wrong',
      phone: '12',
      notes: 'ok',
    });

    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });
});
