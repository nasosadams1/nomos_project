import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Notice from '../components/Notice';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  clearIntakeDraft,
  loadIntakeDraft,
  saveIntakeDraft,
  saveStoredClientContact,
} from '../lib/browserStorage';
import {
  BUDGET_OPTIONS,
  CITY_OPTIONS,
  CONSULTATION_FORMATS,
  ISSUE_TYPES,
  LANGUAGE_OPTIONS,
  URGENCY_LEVELS,
} from '../lib/content';
import { submitIntakeRequest } from '../lib/api';
import {
  getIntakeStepError,
  normalizeEmail,
  sanitizeInlineText,
  sanitizeIntakeForm,
} from '../lib/validation';
import type { IntakeFormData } from '../types';

const steps = [
  { id: 1, title: 'Issue type' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Urgency' },
  { id: 4, title: 'Language' },
  { id: 5, title: 'Format' },
  { id: 6, title: 'Budget' },
  { id: 7, title: 'Description' },
  { id: 8, title: 'Contact' },
  { id: 9, title: 'Review' },
] as const;

function createEmptyIntakeState(prefilledIssueType = ''): Partial<IntakeFormData> {
  return {
    issue_type: prefilledIssueType,
    location: '',
    urgency: '',
    preferred_language: 'Greek',
    consultation_format: '',
    budget: '',
    description: '',
    client_name: '',
    client_email: '',
    client_phone: '',
  };
}

export default function IntakePage() {
  usePageMeta(
    'Legal intake',
    'Answer structured intake questions so Nomos can surface lawyers who better match your matter, language, urgency, and budget.',
  );

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledIssueType = searchParams.get('issue') || '';
  const savedDraft = loadIntakeDraft();
  const [currentStep, setCurrentStep] = useState(() => {
    const draftStep = savedDraft?.currentStep ?? 1;
    return draftStep >= 1 && draftStep <= steps.length ? draftStep : 1;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formStartedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState('');
  const [draftRestored, setDraftRestored] = useState(Boolean(savedDraft));

  const [formData, setFormData] = useState<Partial<IntakeFormData>>(() => ({
    ...createEmptyIntakeState(prefilledIssueType),
    ...(savedDraft?.formData ?? {}),
    issue_type: prefilledIssueType || savedDraft?.formData?.issue_type || '',
    preferred_language: savedDraft?.formData?.preferred_language || 'Greek',
  }));

  useEffect(() => {
    saveIntakeDraft({
      currentStep,
      formData: Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value ?? '']),
      ) as Record<string, string>,
    });
  }, [currentStep, formData]);

  useEffect(() => {
    saveStoredClientContact({
      name: sanitizeInlineText(formData.client_name ?? ''),
      email: normalizeEmail(formData.client_email ?? ''),
      phone: sanitizeInlineText(formData.client_phone ?? ''),
    });
  }, [formData.client_email, formData.client_name, formData.client_phone]);

  const updateField = (field: keyof IntakeFormData, value: string) => {
    setSubmitError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const chooseValue = (field: keyof IntakeFormData, value: string) => {
    updateField(field, value);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    window.scrollTo(0, 0);
  };

  const nextStep = () => {
    const error = getIntakeStepError(currentStep, formData);
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const resetDraft = () => {
    clearIntakeDraft();
    setDraftRestored(false);
    setSubmitError(null);
    setCurrentStep(1);
    setFormData(createEmptyIntakeState(prefilledIssueType));
  };

  const handleSubmit = async () => {
    const reviewError = getIntakeStepError(8, formData);
    if (reviewError) {
      setCurrentStep(8);
      setSubmitError(reviewError);
      return;
    }

    const payload = sanitizeIntakeForm(formData);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitIntakeRequest(payload, { startedAt: formStartedAt, website });
      saveStoredClientContact({
        name: payload.client_name,
        email: payload.client_email,
        phone: payload.client_phone,
      });
      clearIntakeDraft();
      navigate('/lawyers', { state: { intake: payload } });
    } catch (error) {
      console.error('Error submitting intake:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not save your intake request right now. Please try again in a moment.',
      );
      setIsSubmitting(false);
    }
  };

  const currentStepError = submitError ?? getIntakeStepError(currentStep, formData);
  const sanitizedDescription = sanitizeInlineText(formData.description ?? '');

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Legal intake
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Tell us enough to route this well.
              </h1>
            </div>
            <span className="text-sm text-slate-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {draftRestored ? (
          <div className="mb-6">
            <Notice title="Draft restored" tone="info">
              We restored the intake draft from this browser tab so you can continue where you left
              off.
            </Notice>
            <button
              type="button"
              onClick={resetDraft}
              className="mt-3 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Start over instead
            </button>
          </div>
        ) : null}

        {submitError ? (
          <div className="mb-6">
            <Notice title="Check this step" tone="error">
              {submitError}
            </Notice>
          </div>
        ) : null}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {currentStep === 1 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                What type of legal issue do you need help with?
              </h2>
              <p className="mt-3 text-slate-600">
                Pick the category that is closest to the matter. It does not have to be perfect.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ISSUE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => chooseValue('issue_type', type)}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${
                      formData.issue_type === type
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Where are you located?</h2>
              <p className="mt-3 text-slate-600">
                We use this to prioritize lawyers who can realistically handle the matter.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {CITY_OPTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => chooseValue('location', city)}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${
                      formData.location === city
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">How urgent is the matter?</h2>
              <p className="mt-3 text-slate-600">
                This helps set expectations and route time-sensitive requests appropriately.
              </p>
              <div className="mt-6 space-y-3">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => chooseValue('urgency', level.value)}
                    className={`w-full rounded-xl border-2 px-6 py-4 text-left transition-all ${
                      formData.urgency === level.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{level.label}</div>
                    <div className="mt-1 text-sm text-slate-600">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">What language do you prefer?</h2>
              <p className="mt-3 text-slate-600">
                We will use this to filter lawyers who can communicate clearly with you.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => chooseValue('preferred_language', language)}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${
                      formData.preferred_language === language
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 5 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">How would you like to meet?</h2>
              <p className="mt-3 text-slate-600">
                Choose the consultation format that best fits the situation.
              </p>
              <div className="mt-6 space-y-3">
                {CONSULTATION_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => chooseValue('consultation_format', format.value)}
                    className={`w-full rounded-xl border-2 px-6 py-4 text-left transition-all ${
                      formData.consultation_format === format.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{format.label}</div>
                    <div className="mt-1 text-sm text-slate-600">{format.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 6 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                What is your consultation budget?
              </h2>
              <p className="mt-3 text-slate-600">
                We surface lawyers with transparent consultation fees so you can compare fairly.
              </p>
              <div className="mt-6 space-y-3">
                {BUDGET_OPTIONS.map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => chooseValue('budget', budget)}
                    className={`w-full rounded-xl border-2 px-6 py-4 text-left font-medium transition-all ${
                      formData.budget === budget
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === 7 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Describe the matter clearly.</h2>
              <p className="mt-3 text-slate-600">
                Include the core issue, any deadlines, who is involved, and what outcome you are
                trying to achieve.
              </p>
              <textarea
                value={formData.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="For example: I was dismissed on March 5, my employer says it was performance-related, and I need advice before signing a settlement."
                className="mt-6 min-h-[220px] w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
                rows={8}
              />
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>This summary is shared only with relevant lawyers and operational tooling.</span>
                <span>{sanitizedDescription.length} characters</span>
              </div>
            </div>
          ) : null}

          {currentStep === 8 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                How should lawyers reach you?
              </h2>
              <p className="mt-3 text-slate-600">
                Use the contact details you want tied to the follow-up and portal access flow.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={formData.client_name}
                    onChange={(event) => updateField('client_name', event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={formData.client_email}
                    onChange={(event) => updateField('client_email', event.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={formData.client_phone}
                    onChange={(event) => updateField('client_phone', event.target.value)}
                    placeholder="+30 123 456 7890"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Optional, but useful for urgent matters.
                  </p>
                </div>
                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="intake-website">Company website</label>
                  <input
                    id="intake-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === 9 ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Review your intake request</h2>
              <p className="mt-3 text-slate-600">
                This is the information used to route you to relevant lawyers.
              </p>

              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryField label="Issue type" value={formData.issue_type} />
                  <SummaryField label="Location" value={formData.location} />
                  <SummaryField label="Urgency" value={formData.urgency} />
                  <SummaryField label="Language" value={formData.preferred_language} />
                  <SummaryField label="Format" value={formData.consultation_format} />
                  <SummaryField label="Budget" value={formData.budget} />
                </div>

                <SummaryField label="Description" value={formData.description} multiline />
                <SummaryField
                  label="Contact"
                  value={[formData.client_name, formData.client_email, formData.client_phone]
                    .filter(Boolean)
                    .join(' / ')}
                />
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">What happens next</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      The request is stored and then matched against verified lawyer profiles.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      You review the lawyers, their fees, and their profile details before
                      requesting a consultation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      Submitting this form does not create an attorney-client relationship.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>

          {currentStep < 9 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={Boolean(currentStepError)}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving intake...' : 'Find my matches'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string | undefined;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-500">{label}</div>
      <div className={`text-slate-900 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {value || 'Not provided'}
      </div>
    </div>
  );
}
