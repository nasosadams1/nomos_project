type StoredIntakeDraft = {
  currentStep: number;
  formData: Record<string, string>;
};

type StoredClientContact = {
  name: string;
  email: string;
  phone: string;
};

const INTAKE_DRAFT_KEY = 'nomos:intake-draft';
const CLIENT_CONTACT_KEY = 'nomos:client-contact';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the main product flow continues.
  }
}

function removeValue(key: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures so the main product flow continues.
  }
}

export function loadIntakeDraft() {
  return readJson<StoredIntakeDraft>(INTAKE_DRAFT_KEY);
}

export function saveIntakeDraft(draft: StoredIntakeDraft) {
  writeJson(INTAKE_DRAFT_KEY, draft);
}

export function clearIntakeDraft() {
  removeValue(INTAKE_DRAFT_KEY);
}

export function loadStoredClientContact() {
  return readJson<StoredClientContact>(CLIENT_CONTACT_KEY);
}

export function saveStoredClientContact(contact: StoredClientContact) {
  writeJson(CLIENT_CONTACT_KEY, contact);
}

export function clearStoredClientContact() {
  removeValue(CLIENT_CONTACT_KEY);
}

