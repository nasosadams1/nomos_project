import { useState } from 'react';
import {
  Calendar,
  FileText,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Scale,
  Shield,
} from 'lucide-react';
import Notice from '../components/Notice';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePortalData } from '../hooks/usePortalData';
import { useSupabaseSession } from '../hooks/useSupabaseSession';
import { loadStoredClientContact } from '../lib/browserStorage';
import { CONTACT_DETAILS } from '../lib/content';
import { formatConsultationType, formatCurrency, formatDateTime } from '../lib/formatters';
import { getUnreadMessageCount } from '../lib/portal';
import { supabase, supabaseConfigError } from '../lib/supabase';
import { isValidEmail, normalizeEmail } from '../lib/validation';

export default function ClientPortalPage() {
  usePageMeta(
    'Client portal',
    'Sign in with the same email tied to your intake or consultation requests to view consultations, cases, and messages.',
  );

  const storedClientContact = loadStoredClientContact();
  const [authEmail, setAuthEmail] = useState(storedClientContact?.email ?? '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const { session, loading: loadingSession, error: sessionError } = useSupabaseSession();
  const {
    portalData,
    loading: loadingPortal,
    error: portalError,
    syncNotice,
  } = usePortalData(session);
  const portalSetupError = sessionError ?? portalError ?? supabaseConfigError;
  const unreadMessages = getUnreadMessageCount(portalData.messages);

  const handleMagicLink = async () => {
    const email = normalizeEmail(authEmail);

    if (!supabase) {
      setAuthError(supabaseConfigError);
      return;
    }

    if (!isValidEmail(email)) {
      setAuthError('Enter the same valid email address you used for intake or consultation requests.');
      return;
    }

    setAuthError(null);
    setAuthMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });

      if (error) {
        throw error;
      }

      setAuthEmail(email);
      setAuthMessage('Check your email for the magic link to access the portal.');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setAuthError('We could not send the sign-in email right now. Please try again.');
    }
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      setAuthError('We could not sign you out cleanly. Please try again.');
      return;
    }

    setAuthMessage(null);
    setAuthError(null);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white border-r-transparent" />
          <p className="mt-4 text-slate-300">Loading portal access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-white" strokeWidth={2} />
            <div>
              <p className="text-lg font-semibold">Nomos Portal</p>
              <p className="text-sm text-slate-400">Signed-in access for consultations and case updates</p>
            </div>
          </div>

          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {!session ? (
        <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Portal access
              </p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight">
                Private case activity belongs behind a sign-in wall.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                Use the same email tied to your intake or consultation request. We will send a
                magic link so you can view the consultations, cases, and messages associated with
                that account.
              </p>

              <div className="mt-8 space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span>Portal content is not rendered for anonymous visitors.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span>Use the same email address you used in intake or consultation requests.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span>The app also tries to claim older email-based records once you sign in.</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              {portalSetupError ? (
                <div className="mb-6">
                  <Notice title="Portal setup issue" tone="error">
                    {portalSetupError}
                  </Notice>
                </div>
              ) : null}

              {authMessage ? (
                <div className="mb-6">
                  <Notice title="Check your inbox" tone="success">
                    {authMessage}
                  </Notice>
                </div>
              ) : null}

              {authError ? (
                <div className="mb-6">
                  <Notice title="Sign-in failed" tone="error">
                    {authError}
                  </Notice>
                </div>
              ) : null}

              <h2 className="text-2xl font-semibold">Email magic link</h2>
              <p className="mt-3 text-slate-400">
                If your requests were submitted with a different email address, sign in will not
                show the records you expect. After sign-in, the app attempts to attach older
                matching records to your account.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-white"
                />
              </div>

              <button
                type="button"
                onClick={handleMagicLink}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                Send sign-in link
              </button>

              <a
                href={`mailto:${CONTACT_DETAILS.generalEmail}?subject=Nomos%20portal%20help`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
              >
                Need help accessing the portal?
              </a>
            </div>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {portalError ? (
            <div className="mb-6">
              <Notice title="Portal data unavailable" tone="error">
                {portalError}
              </Notice>
            </div>
          ) : null}

          {syncNotice ? (
            <div className="mb-6">
              <Notice title="Record sync incomplete" tone="info">
                {syncNotice}
              </Notice>
            </div>
          ) : null}

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Signed in as
            </p>
            <h1 className="mt-2 text-3xl font-bold">{session.user.email}</h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              This view shows the consultations, case records, and messages the data layer allows
              this account to access.
            </p>
          </div>

          {loadingPortal ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white border-r-transparent" />
              <p className="mt-4 text-slate-300">Loading your portal data...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <MetricCard label="Consultations" value={String(portalData.consultations.length)} />
                <MetricCard label="Active cases" value={String(portalData.cases.length)} />
                <MetricCard label="Unread messages" value={String(unreadMessages)} />
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-300" />
                    <h2 className="text-xl font-semibold">Consultations</h2>
                  </div>
                  {portalData.consultations.length === 0 ? (
                    <EmptyPanel copy="No consultations are currently visible for this account." />
                  ) : (
                    <div className="mt-6 space-y-4">
                      {portalData.consultations.map((consultation) => {
                        const lawyer = portalData.lawyersById[consultation.lawyer_id];

                        return (
                          <div
                            key={consultation.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold">
                                  {lawyer?.full_name ?? 'Assigned lawyer pending'}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {formatConsultationType(consultation.consultation_type)}
                                </p>
                              </div>
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                {consultation.status}
                              </span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-300">
                              <p>{formatDateTime(consultation.scheduled_at)}</p>
                              <p>{formatCurrency(consultation.fee)}</p>
                              {lawyer?.city ? <p>{lawyer.city}</p> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-300" />
                    <h2 className="text-xl font-semibold">Cases</h2>
                  </div>
                  {portalData.cases.length === 0 ? (
                    <EmptyPanel copy="No case records are visible for this account yet." />
                  ) : (
                    <div className="mt-6 space-y-4">
                      {portalData.cases.map((caseFile) => {
                        const lawyer = portalData.lawyersById[caseFile.lawyer_id];

                        return (
                          <div
                            key={caseFile.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold">{caseFile.case_type ?? 'Legal matter'}</p>
                                <p className="text-sm text-slate-400">
                                  {lawyer?.full_name ?? 'Lawyer assignment not shown'}
                                </p>
                              </div>
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                {caseFile.status}
                              </span>
                            </div>
                            {caseFile.description ? (
                              <p className="mt-4 text-sm leading-6 text-slate-300">
                                {caseFile.description}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-300" />
                  <h2 className="text-xl font-semibold">Recent messages</h2>
                </div>
                {portalData.messages.length === 0 ? (
                  <EmptyPanel copy="No messages are visible for this account." />
                ) : (
                  <div className="mt-6 space-y-4">
                    {portalData.messages.slice(0, 8).map((message) => (
                      <div
                        key={message.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">{message.sender_name}</p>
                            <p className="text-sm text-slate-400">{message.sender_type}</p>
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatDateTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {portalData.consultations.length === 0
              && portalData.cases.length === 0
              && portalData.messages.length === 0 ? (
                <div className="mt-8">
                  <Notice title="No records visible yet" tone="info">
                    If you recently submitted intake or a consultation request, make sure you are
                    signed in with the same email address. If records still do not appear, contact{' '}
                    <a
                      href={`mailto:${CONTACT_DETAILS.generalEmail}`}
                      className="font-semibold underline"
                    >
                      {CONTACT_DETAILS.generalEmail}
                    </a>
                    .
                  </Notice>
                </div>
              ) : null}
            </>
          )}
        </main>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}

function EmptyPanel({ copy }: { copy: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-5 text-sm text-slate-400">
      {copy}
    </div>
  );
}
