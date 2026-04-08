import type { IntakeFormData } from '../types';

export function sanitizeInlineText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function sanitizeTextarea(value: string) {
  return value.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

export function normalizeEmail(value: string) {
  return sanitizeInlineText(value).toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  if (!value.trim()) {
    return true;
  }

  return /^[+\d][\d\s().-]{6,}$/.test(value.trim());
}

export function sanitizeIntakeForm(formData: Partial<IntakeFormData>): IntakeFormData {
  return {
    issue_type: sanitizeInlineText(formData.issue_type ?? ''),
    location: sanitizeInlineText(formData.location ?? ''),
    urgency: sanitizeInlineText(formData.urgency ?? ''),
    preferred_language: sanitizeInlineText(formData.preferred_language ?? ''),
    consultation_format: sanitizeInlineText(formData.consultation_format ?? ''),
    budget: sanitizeInlineText(formData.budget ?? ''),
    description: sanitizeTextarea(formData.description ?? ''),
    client_name: sanitizeInlineText(formData.client_name ?? ''),
    client_email: normalizeEmail(formData.client_email ?? ''),
    client_phone: sanitizeInlineText(formData.client_phone ?? ''),
  };
}

export function getIntakeStepError(step: number, formData: Partial<IntakeFormData>) {
  switch (step) {
    case 1:
      return formData.issue_type ? null : 'Choose the legal issue you want help with.';
    case 2:
      return formData.location ? null : 'Choose the city or region that fits your case.';
    case 3:
      return formData.urgency ? null : 'Tell us how urgent the matter is.';
    case 4:
      return formData.preferred_language ? null : 'Choose the language you want to use.';
    case 5:
      return formData.consultation_format ? null : 'Choose a consultation format.';
    case 6:
      return formData.budget ? null : 'Choose the budget range that fits.';
    case 7: {
      const description = sanitizeTextarea(formData.description ?? '');
      if (description.length < 40) {
        return 'Add a short summary with a little more context so lawyers can triage your request.';
      }

      return null;
    }
    case 8: {
      const name = sanitizeInlineText(formData.client_name ?? '');
      const email = normalizeEmail(formData.client_email ?? '');
      const phone = sanitizeInlineText(formData.client_phone ?? '');

      if (name.length < 2) {
        return 'Add your full name so lawyers know who they are responding to.';
      }

      if (!isValidEmail(email)) {
        return 'Enter a valid email address for follow-up.';
      }

      if (phone && !isValidPhone(phone)) {
        return 'Use a valid phone number or leave the phone field blank.';
      }

      return null;
    }
    default:
      return null;
  }
}

export function getBookingValidationErrors(input: {
  name: string;
  email: string;
  phone: string;
  notes: string;
}) {
  const errors: Partial<Record<'name' | 'email' | 'phone' | 'notes', string>> = {};
  const name = sanitizeInlineText(input.name);
  const email = normalizeEmail(input.email);
  const phone = sanitizeInlineText(input.phone);
  const notes = sanitizeTextarea(input.notes);

  if (name.length < 2) {
    errors.name = 'Add your full name.';
  }

  if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number or leave it blank.';
  }

  if (notes.length > 1500) {
    errors.notes = 'Keep additional notes under 1,500 characters.';
  }

  return errors;
}
