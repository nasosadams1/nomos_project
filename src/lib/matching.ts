import { ISSUE_KEYWORDS } from './content';

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function matchesIssue(practiceAreas: string[], issue: string) {
  if (!issue || issue === 'Other') {
    return true;
  }

  const normalizedIssue = normalizeText(issue);
  const keywords = new Set([
    normalizedIssue,
    ...(ISSUE_KEYWORDS[issue] ?? []).map((keyword) => normalizeText(keyword)),
  ]);

  return practiceAreas.some((area) => {
    const normalizedArea = normalizeText(area);
    return [...keywords].some((keyword) => normalizedArea.includes(keyword));
  });
}

export function matchesLanguage(languages: string[], language: string) {
  if (!language) {
    return true;
  }

  const normalizedLanguage = normalizeText(language);
  return languages.some((entry) => normalizeText(entry) === normalizedLanguage);
}

export function matchesCity(city: string, selectedCity: string) {
  if (!selectedCity || selectedCity === 'Other') {
    return true;
  }

  return normalizeText(city) === normalizeText(selectedCity);
}
