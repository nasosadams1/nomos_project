import { Calendar, FileText, MessageSquare, Shield, TrendingUp, Users } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { CONTACT_DETAILS } from '../lib/content';

const features = [
  {
    icon: Users,
    title: 'Qualified intake',
    description:
      'Receive structured requests with jurisdiction, urgency, language, and budget context before anyone books time.',
  },
  {
    icon: Calendar,
    title: 'Consultation requests',
    description:
      'Control how prospective clients request time instead of relying on phone tag and inbox chaos.',
  },
  {
    icon: Shield,
    title: 'Verified listing',
    description:
      'Appear in a public directory only after verification rather than being buried among unvetted profiles.',
  },
  {
    icon: MessageSquare,
    title: 'Signed-in portal access',
    description:
      'Keep sensitive case activity behind authenticated portal access instead of exposing it on public routes.',
  },
  {
    icon: FileText,
    title: 'Better matter triage',
    description:
      'Get a cleaner first pass on the case before deciding whether the matter is a fit for your practice.',
  },
  {
    icon: TrendingUp,
    title: 'Operational clarity',
    description:
      'Use one system for discovery, intake quality, and consultation follow-up rather than patching together forms and spreadsheets.',
  },
];

const benefits = [
  'No commission on legal fees',
  'Transparent profile and consultation pricing',
  'Structured intake before any calendar commitment',
  'Client directory filtering by location, language, and practice area',
  'Portal access tied to signed-in user sessions',
  'Launch feedback collected directly from participating firms',
];

export default function ForLawyersPage() {
  usePageMeta(
    'For lawyers',
    'Learn how Nomos helps firms improve intake quality, consultation operations, and public profile credibility without taking commission on legal fees.',
  );

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(to_bottom,_#f8fafc,_#ffffff)] pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Early access for lawyers and firms
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Grow your practice without turning intake into admin sprawl.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Nomos is designed for firms that want cleaner lead quality, better client triage, and
            a public profile that feels credible instead of generic.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${CONTACT_DETAILS.salesEmail}?subject=Nomos%20early%20access`}
              className="inline-flex items-center rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Request early access
            </a>
            <a
              href={`mailto:${CONTACT_DETAILS.salesEmail}?subject=Nomos%20demo%20request`}
              className="inline-flex items-center rounded-xl border border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              What firms actually get
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              A tighter intake workflow from first request to ongoing client communication.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <feature.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Why firms join
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              Cleaner demand, less inbox noise, better first conversations.
            </h2>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="leading-7">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              The practical pitch
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">Save the time you usually waste before the billable work starts.</h3>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Blank website contact forms</span>
                <span className="font-semibold text-slate-900">Structured matter intake</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Phone tag for scheduling</span>
                <span className="font-semibold text-slate-900">Consultation requests</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Manual profile screening</span>
                <span className="font-semibold text-slate-900">Verified public listing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Publicly exposed client context</span>
                <span className="font-semibold text-slate-900">Signed-in portal access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold">Interested in shaping the launch?</h2>
          <p className="mt-4 text-xl leading-8 text-slate-300">
            Early access firms help define the operational details that matter before broader rollout.
          </p>
          <a
            href={`mailto:${CONTACT_DETAILS.salesEmail}?subject=Nomos%20lawyer%20early%20access`}
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            Email the sales team
          </a>
        </div>
      </section>
    </div>
  );
}
