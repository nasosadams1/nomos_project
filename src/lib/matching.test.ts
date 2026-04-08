import { describe, expect, it } from 'vitest';
import { matchesCity, matchesIssue, matchesLanguage } from './matching';

describe('matching helpers', () => {
  it('matches issue synonyms rather than exact string equality only', () => {
    expect(matchesIssue(['Family Law', 'Custody'], 'Divorce')).toBe(true);
    expect(matchesIssue(['Immigration'], 'Divorce')).toBe(false);
  });

  it('matches city and language case-insensitively', () => {
    expect(matchesCity('Athens', 'athens')).toBe(true);
    expect(matchesLanguage(['Greek', 'English'], 'english')).toBe(true);
    expect(matchesLanguage(['Greek'], 'German')).toBe(false);
  });
});
