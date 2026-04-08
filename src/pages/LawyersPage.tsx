import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  MapPin,
  Shield,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import LawyerAvatar from '../components/LawyerAvatar';
import Notice from '../components/Notice';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLawyerAvailability } from '../hooks/useLawyerAvailability';
import { CITY_OPTIONS, ISSUE_TYPES, LANGUAGE_OPTIONS } from '../lib/content';
import {
  buildDirectorySearchParams,
  createDefaultLawyerFilters,
  createInitialDirectoryState,
  getActiveDirectoryFilterChips,
  type LawyerFilters,
  type SortKey,
} from '../lib/directory';
import {
  formatAvailabilitySlot,
  formatConsultationType,
  formatCurrency,
  formatResponseTime,
} from '../lib/formatters';
import { matchesCity, matchesIssue, matchesLanguage, normalizeText } from '../lib/matching';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type { IntakeFormData, Lawyer } from '../types';

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'rating', label: 'Rating' },
  { value: 'fee', label: 'Consultation fee' },
  { value: 'experience', label: 'Experience' },
];

export default function LawyersPage() {
  usePageMeta(
    'Lawyer directory',
    'Compare verified lawyers by practice area, city, language, fee, and current consultation-request availability.',
  );

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const intakeData = location.state?.intake as Partial<IntakeFormData> | undefined;
  const initialDirectoryState = createInitialDirectoryState(searchParams, intakeData);

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>(initialDirectoryState.sortBy);
  const [filters, setFilters] = useState<LawyerFilters>(initialDirectoryState.filters);
  const {
    availabilityByLawyer,
    loading: loadingAvailability,
    error: availabilityError,
  } = useLawyerAvailability(lawyers.map((lawyer) => lawyer.id));

  useEffect(() => {
    let isMounted = true;

    async function fetchLawyers() {
      if (!supabase) {
        if (isMounted) {
          setFetchError(supabaseConfigError);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lawyers')
          .select('*')
          .eq('verified', true)
          .order('rating', { ascending: false });

        if (error) {
          throw error;
        }

        if (isMounted) {
          setLawyers(data ?? []);
        }
      } catch (error) {
        console.error('Error fetching lawyers:', error);

        if (isMounted) {
          setFetchError('We could not load the lawyer directory right now. Please try again soon.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchLawyers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let next = [...lawyers];

    if (filters.query.trim()) {
      const query = normalizeText(filters.query);
      next = next.filter((lawyer) => {
        const haystack = [
          lawyer.full_name,
          lawyer.city,
          lawyer.jurisdiction,
          ...lawyer.practice_areas,
          ...lawyer.languages,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    next = next.filter((lawyer) => matchesCity(lawyer.city, filters.city));

    if (filters.issue) {
      next = next.filter((lawyer) => matchesIssue(lawyer.practice_areas, filters.issue));
    }

    if (filters.language) {
      next = next.filter((lawyer) => matchesLanguage(lawyer.languages, filters.language));
    }

    if (filters.consultationType === 'online') {
      next = next.filter((lawyer) => lawyer.online_consultation);
    }

    if (filters.consultationType === 'in-person') {
      next = next.filter((lawyer) => lawyer.in_person_consultation);
    }

    if (filters.maxFee) {
      const maxFee = Number(filters.maxFee);

      if (!Number.isNaN(maxFee)) {
        next = next.filter((lawyer) => lawyer.consultation_fee <= maxFee);
      }
    }

    if (sortBy === 'rating') {
      next.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === 'fee') {
      next.sort((a, b) => a.consultation_fee - b.consultation_fee);
    }

    if (sortBy === 'experience') {
      next.sort((a, b) => b.years_experience - a.years_experience);
    }

    setFilteredLawyers(next);
  }, [filters, lawyers, sortBy]);

  useEffect(() => {
    const nextParams = buildDirectorySearchParams(filters, sortBy);

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams, sortBy]);

  const activeFilterChips = getActiveDirectoryFilterChips(filters);

  const clearFilters = () => {
    setFilters(createDefaultLawyerFilters());
  };

  const clearFilter = (key: keyof LawyerFilters) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  const getMatchReasons = (lawyer: Lawyer) => {
    const reasons: string[] = [];

    if (intakeData?.issue_type && matchesIssue(lawyer.practice_areas, intakeData.issue_type)) {
      reasons.push(`Relevant experience in ${intakeData.issue_type.toLowerCase()}`);
    }

    if (intakeData?.location && matchesCity(lawyer.city, intakeData.location)) {
      reasons.push(`Practices in ${intakeData.location}`);
    }

    if (
      intakeData?.preferred_language
      && matchesLanguage(lawyer.languages, intakeData.preferred_language)
    ) {
      reasons.push(`Can work in ${intakeData.preferred_language}`);
    }

    if (lawyer.response_time_hours <= 8) {
      reasons.push('Fast first response');
    }

    return reasons.slice(0, 3);
  };

  const filterPanel = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="Name, city, language, practice area"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <SelectField
          label="City"
          value={filters.city}
          onChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
          options={CITY_OPTIONS}
          emptyLabel="All cities"
        />

        <SelectField
          label="Issue type"
          value={filters.issue}
          onChange={(value) => setFilters((prev) => ({ ...prev, issue: value }))}
          options={ISSUE_TYPES}
          emptyLabel="All issue types"
        />

        <SelectField
          label="Language"
          value={filters.language}
          onChange={(value) => setFilters((prev) => ({ ...prev, language: value }))}
          options={LANGUAGE_OPTIONS}
          emptyLabel="All languages"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Consultation type
          </label>
          <select
            value={filters.consultationType}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, consultationType: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Any format</option>
            <option value="online">Online only</option>
            <option value="in-person">In-person only</option>
            <option value="either">Either</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Max consultation fee
          </label>
          <input
            type="number"
            min="0"
            value={filters.maxFee}
            onChange={(event) => setFilters((prev) => ({ ...prev, maxFee: event.target.value }))}
            placeholder="Any amount"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-r-transparent" />
          <p className="mt-4 text-slate-600">Loading the verified lawyer directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Lawyer directory
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            {intakeData ? 'Lawyers matched to your intake' : 'Verified lawyers'}
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            {intakeData
              ? 'These results are filtered using the information from your intake request. Review the fit, compare fees, and then send a consultation request.'
              : 'Compare experience, fees, jurisdictions, languages, and consultation options before you reach out.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {intakeData ? (
          <div className="mb-6">
            <Notice title="Prefilled from your intake" tone="info">
              The directory filters were prefilled from the matter details you just submitted. You
              can widen or narrow them before choosing a lawyer.
            </Notice>
          </div>
        ) : null}

        {fetchError ? (
          <div className="mb-6">
            <Notice title="Directory unavailable" tone="error">
              {fetchError}
            </Notice>
          </div>
        ) : null}

        {availabilityError ? (
          <div className="mb-6">
            <Notice title="Live availability unavailable" tone="info">
              {availabilityError}
            </Notice>
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">
              Showing {filteredLawyers.length} of {lawyers.length} verified lawyers
            </p>
            <p className="text-sm text-slate-500">
              {loadingAvailability
                ? 'Checking current request-window availability.'
                : 'Next open request windows reflect current pending and confirmed consultations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              aria-expanded={showFilters}
              aria-controls="lawyer-filters"
            >
              {showFilters ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <SlidersHorizontal className="mr-2 h-4 w-4" />
              )}
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>

            <label className="text-sm font-medium text-slate-700">Sort by</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-slate-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeFilterChips.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="font-medium">{chip.label}:</span>
                <span className="ml-1">{chip.value}</span>
                <X className="ml-2 h-4 w-4" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-4">
          <aside
            id="lawyer-filters"
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <section className="lg:col-span-3">
            {filteredLawyers.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                <h2 className="text-2xl font-semibold text-slate-900">
                  No lawyers match these filters.
                </h2>
                <p className="mt-3 text-slate-600">
                  Reset the filters or widen the intake criteria to see more relevant profiles.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLawyers.map((lawyer) => {
                  const matchReasons = getMatchReasons(lawyer);
                  const formats = [
                    lawyer.online_consultation ? 'Online consultation' : null,
                    lawyer.in_person_consultation ? 'In-person meeting' : null,
                  ].filter(Boolean);
                  const nextAvailableSlot = availabilityByLawyer[lawyer.id]?.nextAvailableSlot;
                  const availabilityLabel = nextAvailableSlot
                    ? `Next open window: ${formatAvailabilitySlot(
                        nextAvailableSlot.dateKey,
                        nextAvailableSlot.timeKey,
                      )}`
                    : loadingAvailability
                      ? 'Checking current request windows...'
                      : 'No open request windows in the next 10 business days';

                  return (
                    <Link
                      key={lawyer.id}
                      to={`/lawyer/${lawyer.id}`}
                      className="block rounded-3xl border border-slate-200 bg-white p-6 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-6 sm:flex-row">
                        <LawyerAvatar
                          name={lawyer.full_name}
                          photoUrl={lawyer.photo_url}
                          className="h-32 w-32 rounded-2xl"
                          textClassName="text-2xl"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-semibold text-slate-900">
                                  {lawyer.full_name}
                                </h2>
                                {lawyer.verified ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    <Shield className="mr-1 h-4 w-4" />
                                    Verified
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 flex items-center text-slate-600">
                                <MapPin className="mr-2 h-4 w-4" />
                                {lawyer.city}, {lawyer.jurisdiction}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                              <div className="flex items-center justify-end">
                                <Star className="mr-1 h-5 w-5 fill-amber-400 text-amber-400" />
                                <span className="text-lg font-semibold text-slate-900">
                                  {lawyer.rating.toFixed(1)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {lawyer.review_count} review{lawyer.review_count === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {lawyer.practice_areas.slice(0, 4).map((area) => (
                              <span
                                key={area}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                {area}
                              </span>
                            ))}
                          </div>

                          {matchReasons.length > 0 ? (
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                              <p className="text-sm font-semibold text-emerald-900">
                                Why this looks relevant
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                                {matchReasons.map((reason) => (
                                  <li key={reason}>- {reason}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <div className="mt-5 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-4">
                            <Fact label="Experience" value={`${lawyer.years_experience} years`} />
                            <Fact
                              label="Languages"
                              value={
                                lawyer.languages.length ? lawyer.languages.join(', ') : 'Not listed'
                              }
                            />
                            <Fact
                              label="Typical response"
                              value={formatResponseTime(lawyer.response_time_hours)}
                              icon={<Clock className="h-4 w-4" />}
                            />
                            <Fact
                              label="Consultation fee"
                              value={formatCurrency(lawyer.consultation_fee)}
                            />
                          </div>

                          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <CalendarClock className="mr-2 h-4 w-4" />
                                <span>{availabilityLabel}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>
                                  {formats.length > 0
                                    ? formats.join(' / ')
                                    : formatConsultationType('consultation')}
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold text-slate-900">View profile</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  emptyLabel: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-slate-900"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-slate-500">{label}</p>
      <p className="flex items-center gap-1 font-medium text-slate-900">
        {icon}
        <span>{value}</span>
      </p>
    </div>
  );
}
