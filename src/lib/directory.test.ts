import { describe, expect, it } from 'vitest';
import {
  buildDirectorySearchParams,
  createDefaultLawyerFilters,
  createInitialDirectoryState,
  getActiveDirectoryFilterChips,
} from './directory';

describe('directory helpers', () => {
  it('prefills filters from search params before intake state', () => {
    const searchParams = new URLSearchParams({
      issue: 'Employment',
      city: 'Athens',
      sort: 'fee',
    });

    const state = createInitialDirectoryState(searchParams, {
      issue_type: 'Divorce',
      location: 'Patras',
      preferred_language: 'Greek',
    });

    expect(state.filters.issue).toBe('Employment');
    expect(state.filters.city).toBe('Athens');
    expect(state.filters.language).toBe('Greek');
    expect(state.sortBy).toBe('fee');
  });

  it('builds compact search params for the active filters only', () => {
    const params = buildDirectorySearchParams(
      {
        query: 'athens family',
        city: '',
        issue: 'Divorce',
        language: '',
        consultationType: 'online',
        maxFee: '120',
      },
      'experience',
    );

    expect(params.toString()).toBe(
      'q=athens+family&issue=Divorce&format=online&maxFee=120&sort=experience',
    );
  });

  it('returns readable active filter chips', () => {
    const chips = getActiveDirectoryFilterChips({
      ...createDefaultLawyerFilters(),
      query: 'employment',
      consultationType: 'in-person',
      maxFee: '90',
    });

    expect(chips).toEqual([
      { key: 'query', label: 'Search', value: 'employment' },
      { key: 'consultationType', label: 'Format', value: 'In-person' },
      { key: 'maxFee', label: 'Max fee', value: 'EUR 90' },
    ]);
  });
});
