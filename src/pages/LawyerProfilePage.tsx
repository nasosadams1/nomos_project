import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Languages,
  MapPin,
  Shield,
  Star,
  Video,
} from 'lucide-react';
import LawyerAvatar from '../components/LawyerAvatar';
import Notice from '../components/Notice';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLawyerAvailability } from '../hooks/useLawyerAvailability';
import { formatAvailabilitySlot, formatCurrency, formatResponseTime } from '../lib/formatters';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type { Lawyer, Review } from '../types';

export default function LawyerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const {
    availabilityByLawyer,
    loading: loadingAvailability,
    error: availabilityError,
  } = useLawyerAvailability(lawyer ? [lawyer.id] : []);

  usePageMeta(
    lawyer ? lawyer.full_name : 'Lawyer profile',
    'Review lawyer credentials, languages, consultation fee, and request-window availability before sending a consultation request.',
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          setPageError('This lawyer profile is missing an id.');
        }
        return;
      }

      if (!supabase) {
        if (isMounted) {
          setLoading(false);
          setPageError(supabaseConfigError);
        }
        return;
      }

      try {
        const [{ data: lawyerData, error: lawyerError }, { data: reviewsData, error: reviewsError }] =
          await Promise.all([
            supabase.from('lawyers').select('*').eq('id', id).single(),
            supabase
              .from('reviews')
              .select('*')
              .eq('lawyer_id', id)
              .order('created_at', { ascending: false })
              .limit(10),
          ]);

        if (lawyerError) {
          throw lawyerError;
        }

        if (reviewsError) {
          throw reviewsError;
        }

        if (isMounted) {
          setLawyer(lawyerData);
          setReviews(reviewsData ?? []);
        }
      } catch (error) {
        console.error('Error fetching lawyer profile:', error);
        if (isMounted) {
          setPageError('We could not load this lawyer profile right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-r-transparent" />
          <p className="mt-4 text-slate-600">Loading the lawyer profile...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Notice title="Profile unavailable" tone="error">
            {pageError ?? 'This lawyer profile could not be found.'}
          </Notice>
          <div className="mt-8">
            <Link
              to="/lawyers"
              className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Back to directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      q: 'What happens after I request a consultation?',
      a: 'Nomos records the request and shares the details with the lawyer or firm. Final confirmation and any meeting details are sent after review.',
    },
    {
      q: 'How quickly should I expect a response?',
      a: `${lawyer.full_name.split(' ')[0]} typically responds ${formatResponseTime(
        lawyer.response_time_hours,
      ).toLowerCase()}.`,
    },
    {
      q: 'Can the consultation happen online?',
      a: lawyer.online_consultation
        ? 'Yes. This profile accepts online consultation requests.'
        : 'This profile does not currently list online consultation requests.',
    },
    {
      q: 'Is the consultation fee visible before I send a request?',
      a: `Yes. The listed consultation fee is ${formatCurrency(
        lawyer.consultation_fee,
      )} unless the lawyer updates it.`,
    },
  ];
  const nextAvailableSlot = availabilityByLawyer[lawyer.id]?.nextAvailableSlot ?? null;
  const canRequestConsultation = lawyer.online_consultation || lawyer.in_person_consultation;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {pageError ? (
            <div className="mb-6">
              <Notice title="Some profile details may be incomplete" tone="error">
                {pageError}
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

          <div className="mb-6">
            <Link
              to="/lawyers"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Back to directory
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-6 sm:flex-row">
                <LawyerAvatar
                  name={lawyer.full_name}
                  photoUrl={lawyer.photo_url}
                  className="h-40 w-40 rounded-3xl"
                  textClassName="text-3xl"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold text-slate-900">{lawyer.full_name}</h1>
                    {lawyer.verified ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        <Shield className="mr-1 h-4 w-4" />
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 flex items-center text-lg text-slate-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    {lawyer.city}, {lawyer.jurisdiction}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {lawyer.practice_areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Rating" value={`${lawyer.rating.toFixed(1)} (${lawyer.review_count})`} />
                    <Stat label="Experience" value={`${lawyer.years_experience} years`} />
                    <Stat
                      label="Response time"
                      value={formatResponseTime(lawyer.response_time_hours)}
                      icon={<Clock className="h-4 w-4" />}
                    />
                    <Stat label="Consultation fee" value={formatCurrency(lawyer.consultation_fee)} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-24 rounded-3xl border-2 border-slate-900 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Consultation requests
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatCurrency(lawyer.consultation_fee)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {canRequestConsultation
                    ? 'Request a consultation window and the lawyer or firm will confirm the appointment details directly.'
                    : 'This profile is visible, but consultation formats have not been published yet.'}
                </p>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {loadingAvailability
                    ? 'Checking current request-window availability...'
                    : nextAvailableSlot
                      ? `Next open window: ${formatAvailabilitySlot(
                          nextAvailableSlot.dateKey,
                          nextAvailableSlot.timeKey,
                        )}`
                      : 'No open request windows are visible in the next 10 business days.'}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/booking/${lawyer.id}`)}
                  disabled={!canRequestConsultation}
                  className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {canRequestConsultation ? 'Request consultation' : 'Consultation unavailable'}
                </button>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  Typical first response: {formatResponseTime(lawyer.response_time_hours).toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Profile summary</h2>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
                {lawyer.bio || 'A longer professional summary has not been added to this profile yet.'}
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Consultation options</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {lawyer.online_consultation ? (
                  <ConsultationCard
                    icon={<Video className="h-5 w-5 text-slate-700" />}
                    title="Online consultation"
                    description="Suitable for quick advice, follow-up, or clients outside the lawyer's city."
                  />
                ) : null}
                {lawyer.in_person_consultation ? (
                  <ConsultationCard
                    icon={<Building className="h-5 w-5 text-slate-700" />}
                    title="In-person meeting"
                    description={`Available for office meetings in ${lawyer.city}.`}
                  />
                ) : null}
                {!lawyer.online_consultation && !lawyer.in_person_consultation ? (
                  <Notice title="No consultation formats listed yet">
                    This profile has not published consultation format details.
                  </Notice>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Client reviews</h2>
              {reviews.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-slate-600">
                  No client reviews are visible for this profile yet.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{review.client_name}</p>
                          {review.case_type ? (
                            <p className="text-sm text-slate-600">{review.case_type}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <Star
                              key={index}
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment ? (
                        <p className="mt-3 leading-7 text-slate-700">{review.comment}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
              <div className="mt-6 space-y-4">
                {faqs.map((faq, index) => (
                  <div key={faq.q} className="overflow-hidden rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq((current) => (current === index ? null : index))}
                      className="flex w-full items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="font-semibold text-slate-900">{faq.q}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                    {expandedFaq === index ? (
                      <div className="border-t border-slate-200 px-6 py-4 text-slate-700">
                        {faq.a}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-slate-900">At a glance</h3>
              <ul className="mt-4 space-y-4 text-sm text-slate-700">
                <QuickFact
                  icon={<Languages className="h-5 w-5 text-slate-500" />}
                  label="Languages"
                  value={lawyer.languages.length ? lawyer.languages.join(', ') : 'Not listed'}
                />
                <QuickFact
                  icon={<CalendarClock className="h-5 w-5 text-slate-500" />}
                  label="Booking model"
                  value="Consultation request with confirmation"
                />
                <QuickFact
                  icon={<Check className="h-5 w-5 text-slate-500" />}
                  label="Jurisdiction"
                  value={lawyer.jurisdiction}
                />
              </ul>
            </div>

            <div className="rounded-3xl bg-slate-900 p-6 text-white">
              <h3 className="text-xl font-semibold">Ready to continue?</h3>
              <p className="mt-3 leading-7 text-slate-300">
                {canRequestConsultation
                  ? 'Request a consultation and the lawyer or firm can confirm timing and any meeting details directly.'
                  : 'This profile needs consultation-format details before the request flow can continue.'}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/booking/${lawyer.id}`)}
                disabled={!canRequestConsultation}
                className="mt-5 w-full rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {canRequestConsultation ? 'Request consultation' : 'Consultation unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
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

function ConsultationCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </li>
  );
}
