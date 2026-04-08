import { Eye, Keyboard, Monitor, Volume2 } from 'lucide-react';
import { CONTACT_DETAILS, LAST_UPDATED_LABEL } from '../lib/content';

const currentSupport = [
  {
    icon: Eye,
    title: 'Visible focus states',
    points: [
      'Keyboard focus styling is applied across links, buttons, and form controls.',
      'Primary calls to action have clear contrast and state changes.',
    ],
  },
  {
    icon: Keyboard,
    title: 'Keyboard-first navigation',
    points: [
      'A skip link now lets keyboard users jump directly to the main content.',
      'Navigation, forms, and buttons are reachable without a pointer device.',
    ],
  },
  {
    icon: Monitor,
    title: 'Responsive layouts',
    points: [
      'Main flows are designed for small and large screens.',
      'The header includes a dedicated mobile navigation pattern rather than hiding core links completely.',
    ],
  },
  {
    icon: Volume2,
    title: 'Plain-language content',
    points: [
      'Public-facing copy is being rewritten to be more specific and less misleading.',
      'We prefer explicit status text over vague marketing language in trust-sensitive flows.',
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(to_bottom,_#f8fafc,_#ffffff)] pt-16 pb-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Accessibility
          </p>
          <h1 className="mt-4 text-5xl font-bold text-slate-900">Accessibility should be visible in the product, not just on a policy page.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            We are working toward a more accessible client and lawyer experience, starting with the
            flows people use most: navigation, intake, profile review, and consultation requests.
          </p>
          <p className="mt-4 text-sm text-slate-500">Last updated: {LAST_UPDATED_LABEL}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {currentSupport.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <item.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-900">{item.title}</h2>
                <ul className="mt-4 space-y-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="leading-7">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">What we are still improving</h2>
          <ul className="mt-8 space-y-4 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
              <span className="leading-7">
                Better form error messaging and live validation cues across the whole intake flow.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
              <span className="leading-7">
                Continued screen-reader review of dynamic sections such as filters, accordions, and portal states.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
              <span className="leading-7">
                Additional QA on reduced-motion preferences and cross-device focus behavior.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900">Found an accessibility issue?</h2>
          <p className="mt-4 text-xl leading-8 text-slate-600">
            Send it to us directly. Specific reports help us fix the right thing faster.
          </p>
          <a
            href={`mailto:${CONTACT_DETAILS.accessibilityEmail}?subject=Nomos%20accessibility%20feedback`}
            className="mt-8 inline-flex items-center rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Email accessibility feedback
          </a>
        </div>
      </section>
    </div>
  );
}
