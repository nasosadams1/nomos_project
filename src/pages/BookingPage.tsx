import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, Calendar, Check, Clock, Video } from 'lucide-react';
import LawyerAvatar from '../components/LawyerAvatar';
import Notice from '../components/Notice';
import { requestConsultation } from '../lib/api';
import { useLawyerAvailability } from '../hooks/useLawyerAvailability';
import {
  CONSULTATION_TIME_SLOTS,
  createSlotKey,
  formatLocalDateKey,
  getUpcomingBusinessDates,
} from '../lib/availability';
import {
  formatAvailabilitySlot,
  formatConsultationType,
  formatCurrency,
  formatLongDate,
} from '../lib/formatters';
import { supabase, supabaseConfigError } from '../lib/supabase';
import { getBookingValidationErrors } from '../lib/validation';
import type { Lawyer } from '../types';

type BookingStep = 'type' | 'datetime' | 'details' | 'confirm';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [step, setStep] = useState<BookingStep>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formStartedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'email' | 'phone' | 'notes', string>>
  >({});

  const [booking, setBooking] = useState({
    type: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const {
    availabilityByLawyer,
    loading: loadingAvailability,
    error: availabilityError,
  } = useLawyerAvailability(lawyer ? [lawyer.id] : []);

  useEffect(() => {
    let isMounted = true;

    async function fetchLawyer() {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          setPageError('This consultation request is missing a lawyer id.');
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
        const { data, error } = await supabase.from('lawyers').select('*').eq('id', id).single();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setLawyer(data);
        }
      } catch (error) {
        console.error('Error fetching lawyer:', error);
        if (isMounted) {
          setPageError('We could not load this consultation request form right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchLawyer();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const dates = getUpcomingBusinessDates(10);
  const availability = lawyer ? availabilityByLawyer[lawyer.id] : undefined;
  const reservedSlotKeyList = availability?.reservedSlotKeys ?? [];
  const reservedSlotKeys = new Set(reservedSlotKeyList);
  const nextAvailableSlot = availability?.nextAvailableSlot ?? null;
  const selectedSlotKey =
    booking.date && booking.time ? createSlotKey(booking.date, booking.time) : '';
  const isSelectedSlotReserved = selectedSlotKey
    ? reservedSlotKeyList.includes(selectedSlotKey)
    : false;

  useEffect(() => {
    if (!isSelectedSlotReserved) {
      return;
    }

    setBooking((prev) => ({ ...prev, time: '' }));
  }, [isSelectedSlotReserved]);

  const handleSubmit = async () => {
    if (!lawyer) {
      return;
    }

    const nextFieldErrors = getBookingValidationErrors({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      notes: booking.notes,
    });

    if (!booking.type || !booking.date || !booking.time) {
      setSubmitError('Choose a consultation format, date, and request window first.');
      return;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmitError('Check the contact details before sending the request.');
      return;
    }

    if (!supabase) {
      setSubmitError(supabaseConfigError);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await requestConsultation({
        lawyerId: lawyer.id,
        consultationType: booking.type,
        dateKey: booking.date,
        timeKey: booking.time,
        clientName: booking.name,
        clientEmail: booking.email,
        clientPhone: booking.phone,
        notes: booking.notes,
      }, { startedAt: formStartedAt, website });

      setIsSubmitting(false);
      setStep('confirm');
    } catch (error) {
      console.error('Error creating booking request:', error);
      const nextMessage =
        error instanceof Error
          ? error.message
          : 'We could not save your consultation request. Please try again.';

      if (/slot/i.test(nextMessage)) {
        setStep('datetime');
      }

      setSubmitError(nextMessage);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-r-transparent" />
          <p className="mt-4 text-slate-600">Loading consultation request form...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Notice title="Request form unavailable" tone="error">
            {pageError ?? 'This lawyer profile could not be loaded.'}
          </Notice>
          <button
            type="button"
            onClick={() => navigate('/lawyers')}
            className="mt-8 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Back to directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Consultation request
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Request time with {lawyer.full_name}</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            Choose a request window and send your details. Final confirmation still comes from the
            lawyer or firm.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitError ? (
              <div className="mb-6">
                <Notice title="Consultation request not sent" tone="error">
                  {submitError}
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

            {step !== 'confirm' ? (
              <div className="mb-8 flex items-center justify-center">
                <StepBadge active={step === 'type'} number="1" label="Type" />
                <div className="mx-3 h-0.5 w-14 bg-slate-200" />
                <StepBadge active={step === 'datetime'} number="2" label="Date and time" />
                <div className="mx-3 h-0.5 w-14 bg-slate-200" />
                <StepBadge active={step === 'details'} number="3" label="Details" />
              </div>
            ) : null}

            {step === 'type' ? (
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Choose the consultation format</h2>
                <div className="mt-6 space-y-4">
                  {lawyer.online_consultation ? (
                    <button
                      type="button"
                      onClick={() => {
                        setBooking((prev) => ({ ...prev, type: 'online' }));
                        setStep('datetime');
                      }}
                      className="w-full rounded-2xl border-2 border-slate-200 p-6 text-left transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Video className="h-6 w-6 text-slate-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Online consultation</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Suitable for quick advice, remote clients, or first-pass review.
                          </p>
                        </div>
                      </div>
                    </button>
                  ) : null}

                  {lawyer.in_person_consultation ? (
                    <button
                      type="button"
                      onClick={() => {
                        setBooking((prev) => ({ ...prev, type: 'in-person' }));
                        setStep('datetime');
                      }}
                      className="w-full rounded-2xl border-2 border-slate-200 p-6 text-left transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Building className="h-6 w-6 text-slate-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">In-person meeting</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Request an office meeting in {lawyer.city} if face-to-face discussion
                            matters for the issue.
                          </p>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 'datetime' ? (
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Choose a request window</h2>
                <p className="mt-3 text-slate-600">
                  These slots are request windows, not instant confirmations. The lawyer or firm
                  still confirms the final appointment details.
                </p>

                <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950">
                  <p className="font-semibold">How timing works</p>
                  <p className="mt-2 leading-6">
                    Pick the window that suits you best. Once accepted, the request is visible from
                    signed-in portal access using the same email address. Request windows are shown
                    in Athens time.
                  </p>
                </div>

                {loadingAvailability ? (
                  <p className="mt-4 text-sm text-slate-500">Checking currently requested windows...</p>
                ) : nextAvailableSlot ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                    <p className="font-semibold">Earliest open request window</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p>{formatAvailabilitySlot(nextAvailableSlot.dateKey, nextAvailableSlot.timeKey)}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setBooking((prev) => ({
                            ...prev,
                            date: nextAvailableSlot.dateKey,
                            time: nextAvailableSlot.timeKey,
                          }))
                        }
                        className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100"
                      >
                        Use this window
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  <label className="mb-3 block text-sm font-medium text-slate-700">Date</label>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {dates.map((date) => {
                      const dateKey = formatLocalDateKey(date);
                      const isSelected = booking.date === dateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() =>
                            setBooking((prev) => ({ ...prev, date: dateKey, time: prev.date === dateKey ? prev.time : '' }))
                          }
                          className={`rounded-2xl border-2 p-3 text-center transition-all ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </div>
                          <div className="mt-2 font-semibold text-slate-900">
                            {date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {booking.date ? (
                  <div className="mt-6">
                    <label className="mb-3 block text-sm font-medium text-slate-700">Time</label>
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {CONSULTATION_TIME_SLOTS.map((time) => {
                        const isSelected = booking.time === time;
                        const isReserved = reservedSlotKeys.has(createSlotKey(booking.date, time));

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setBooking((prev) => ({ ...prev, time }))}
                            disabled={isReserved}
                            className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-slate-900 bg-slate-50 text-slate-900'
                                : isReserved
                                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {time}
                            {isReserved ? ' taken' : ''}
                          </button>
                        );
                      })}
                    </div>

                    {CONSULTATION_TIME_SLOTS.every((time) =>
                      reservedSlotKeys.has(createSlotKey(booking.date, time)),
                    ) ? (
                      <p className="mt-3 text-sm text-rose-700">
                        That day is currently full. Choose another date or use the earliest open request window above.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('type')}
                    className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={!booking.date || !booking.time}
                    className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : null}

            {step === 'details' ? (
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Add your details</h2>
                <p className="mt-3 text-slate-600">
                  Use the email address you want tied to follow-up and portal access.
                </p>

                <div className="mt-6 space-y-4">
                  <InputField
                    label="Full name"
                    value={booking.name}
                    error={fieldErrors.name}
                    onChange={(value) => setBooking((prev) => ({ ...prev, name: value }))}
                    placeholder="Your full name"
                  />
                  <InputField
                    label="Email address"
                    type="email"
                    value={booking.email}
                    error={fieldErrors.email}
                    onChange={(value) => setBooking((prev) => ({ ...prev, email: value }))}
                    placeholder="your.email@example.com"
                  />
                  <InputField
                    label="Phone number"
                    type="tel"
                    value={booking.phone}
                    error={fieldErrors.phone}
                    onChange={(value) => setBooking((prev) => ({ ...prev, phone: value }))}
                    placeholder="+30 123 456 7890"
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Additional notes
                    </label>
                    <textarea
                      value={booking.notes}
                      onChange={(event) => setBooking((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Add any important context the lawyer should know before confirming the appointment."
                      rows={5}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
                    />
                    {fieldErrors.notes ? (
                      <p className="mt-2 text-sm text-rose-700">{fieldErrors.notes}</p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Optional, but helpful for context.</p>
                    )}
                  </div>
                  <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="booking-website">Company website</label>
                    <input
                      id="booking-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                  <h3 className="font-semibold text-slate-900">Request summary</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <SummaryRow label="Format" value={formatConsultationType(booking.type)} />
                    <SummaryRow label="Date" value={formatLongDate(booking.date)} />
                    <SummaryRow label="Time window" value={booking.time} />
                    <SummaryRow label="Consultation fee" value={formatCurrency(lawyer.consultation_fee)} />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('datetime')}
                    className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending request...' : 'Send request'}
                  </button>
                </div>
              </div>
            ) : null}

            {step === 'confirm' ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-slate-900">Consultation request received</h2>
                <p className="mt-3 text-lg leading-8 text-slate-600">
                  Your request has been sent to {lawyer.full_name}. Final confirmation still comes
                  from the lawyer or firm.
                </p>

                <div className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-50 p-6 text-left">
                  <div className="space-y-3 text-sm text-slate-700">
                    <SummaryRow label="Date" value={formatLongDate(booking.date)} />
                    <SummaryRow label="Time window" value={booking.time} />
                    <SummaryRow label="Format" value={formatConsultationType(booking.type)} />
                  </div>
                </div>

                <div className="mx-auto mt-6 max-w-md">
                  <Notice title="Next step" tone="success">
                    We will use <strong>{booking.email}</strong> for follow-up. When you sign in to
                    portal access with the same email, you can view consultations tied to your
                    account.
                  </Notice>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/portal')}
                    className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Go to portal access
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/lawyers')}
                    className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Back to directory
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <LawyerAvatar
                  name={lawyer.full_name}
                  photoUrl={lawyer.photo_url}
                  className="h-16 w-16 rounded-2xl"
                  textClassName="text-xl"
                />
                <div>
                  <h2 className="font-semibold text-slate-900">{lawyer.full_name}</h2>
                  <p className="text-sm text-slate-600">
                    {lawyer.city}, {lawyer.jurisdiction}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Typical response time: {lawyer.response_time_hours} hour
                {lawyer.response_time_hours === 1 ? '' : 's'}.
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">What this flow guarantees</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
                  <span>You send a structured request with your preferred date and time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
                  <span>The lawyer or firm confirms the final appointment details afterwards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
                  <span>Submitting a request still does not create an attorney-client relationship.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepBadge({
  active,
  number,
  label,
}: {
  active: boolean;
  number: string;
  label: string;
}) {
  return (
    <div className={`flex items-center ${active ? 'text-slate-900' : 'text-slate-400'}`}>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
          active ? 'bg-slate-900 text-white' : 'bg-slate-200'
        }`}
      >
        {number}
      </div>
      <span className="ml-2 hidden text-sm font-medium sm:inline">{label}</span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
      />
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
