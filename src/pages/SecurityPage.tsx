import { Eye, FileText, Lock, Server, Shield } from 'lucide-react';
import { CONTACT_DETAILS, LAST_UPDATED_LABEL } from '../lib/content';

const currentControls = [
  {
    icon: Shield,
    title: 'Verified public directory',
    description:
      'The lawyer directory is scoped to verified profiles instead of exposing every record in the database.',
  },
  {
    icon: Lock,
    title: 'Signed-in portal access',
    description:
      'Portal data is intended to sit behind authenticated access rather than rendering case activity on public routes.',
  },
  {
    icon: Eye,
    title: 'Scoped data policies',
    description:
      'Sensitive tables are protected with row-level policies so reads are tied to the signed-in user context where applicable.',
  },
  {
    icon: Server,
    title: 'Hosted data layer',
    description:
      'Application data is stored in Supabase rather than being embedded directly in the front-end bundle.',
  },
];

const nextMilestones = [
  'Production-grade abuse protection for public forms and consultation requests',
  'Operational incident response and audit review processes',
  'Retention and deletion workflows for intake and case records',
  'Security review before enabling file uploads or richer case collaboration',
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(to_bottom,_#f8fafc,_#ffffff)] pt-16 pb-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Security approach
          </p>
          <h1 className="mt-4 text-5xl font-bold text-slate-900">Trust starts with honest boundaries.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Nomos is handling legal intake and consultation requests, so the bar for access control
            and product honesty is high. This page describes what the current app does today and
            what still needs hardening before a broader launch.
          </p>
          <p className="mt-4 text-sm text-slate-500">Last updated: {LAST_UPDATED_LABEL}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {currentControls.map((control) => (
              <div key={control.title} className="rounded-3xl border border-slate-200 bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <control.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-900">{control.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{control.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              What the current app relies on
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">Current trust model</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              <p className="leading-7">
                The public product surface is the lawyer directory plus intake and consultation
                request flows. Sensitive data is stored in Supabase, and the portal is designed to
                show signed-in users only their own records.
              </p>
              <p className="leading-7">
                That is better than rendering fake private data publicly, but it is not enough to
                call the product “done.” Legal workflows need stronger operational controls than a
                clean landing page.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-slate-700" />
              <h3 className="text-2xl font-semibold text-slate-900">Before full launch</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {nextMilestones.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900">Security questions should get a real answer.</h2>
          <p className="mt-4 text-xl leading-8 text-slate-600">
            If you are evaluating Nomos for a firm or a sensitive matter, contact the team and ask
            for the details you need.
          </p>
          <a
            href={`mailto:${CONTACT_DETAILS.securityEmail}?subject=Nomos%20security%20question`}
            className="mt-8 inline-flex items-center rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Contact the security team
          </a>
        </div>
      </section>
    </div>
  );
}
