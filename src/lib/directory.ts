import type { IntakeFormData } from '../types';

export type SortKey = 'rating' | 'fee' | 'experience';

export type LawyerFilters = {
  query: string;
  city: string;
  issue: string;
  language: string;
  consultationType: string;
  maxFee: string;
};

export type DirectoryFilterChip = {
  key: keyof LawyerFilters;
  label: string;
  value: string;
};

const DEFAULT_FILTERS: LawyerFilters = {
  query: '',
  city: '',
  issue: '',
  language: '',
  consultationType: '',
  maxFee: '',
};

function sanitizeSearchParam(value: string | null) {
  return value?.trim() ?? '';
}

export function createDefaultLawyerFilters() {
  return { ...DEFAULT_FILTERS };
}

export function createInitialDirectoryState(
  searchParams: URLSearchParams,
  intakeData?: Partial<IntakeFormData>,
) {
  const filters: LawyerFilters = {
    query: sanitizeSearchParam(searchParams.get('q')) || '',
    city: sanitizeSearchParam(searchParams.get('city')) || intakeData?.location || '',
    issue: sanitizeSearchParam(searchParams.get('issue')) || intakeData?.issue_type || '',
    language:
      sanitizeSearchParam(searchParams.get('language')) || intakeData?.preferred_language || '',
    consultationType:
      sanitizeSearchParam(searchParams.get('format')) || intakeData?.consultation_format || '',
    maxFee: sanitizeSearchParam(searchParams.get('maxFee')) || '',
  };

  const sortParam = sanitizeSearchParam(searchParams.get('sort'));
  const sortBy: SortKey =
    sortParam === 'fee' || sortParam === 'experience' || sortParam === 'rating'
      ? sortParam
      : 'rating';

  return {
    filters,
    sortBy,
  };
}

export function buildDirectorySearchParams(filters: LawyerFilters, sortBy: SortKey) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set('q', filters.query);
  }

  if (filters.city) {
    params.set('city', filters.city);
  }

  if (filters.issue) {
    params.set('issue', filters.issue);
  }

  if (filters.language) {
    params.set('language', filters.language);
  }

  if (filters.consultationType) {
    params.set('format', filters.consultationType);
  }

  if (filters.maxFee) {
    params.set('maxFee', filters.maxFee);
  }

  if (sortBy !== 'rating') {
    params.set('sort', sortBy);
  }

  return params;
}

export function getActiveDirectoryFilterChips(filters: LawyerFilters): DirectoryFilterChip[] {
  const chips: DirectoryFilterChip[] = [];

  if (filters.query) {
    chips.push({ key: 'query', label: 'Search', value: filters.query });
  }

  if (filters.city) {
    chips.push({ key: 'city', label: 'City', value: filters.city });
  }

  if (filters.issue) {
    chips.push({ key: 'issue', label: 'Issue', value: filters.issue });
  }

  if (filters.language) {
    chips.push({ key: 'language', label: 'Language', value: filters.language });
  }

  if (filters.consultationType) {
    chips.push({
      key: 'consultationType',
      label: 'Format',
      value: filters.consultationType === 'in-person' ? 'In-person' : filters.consultationType,
    });
  }

  if (filters.maxFee) {
    chips.push({ key: 'maxFee', label: 'Max fee', value: `EUR ${filters.maxFee}` });
  }

  return chips;
}

