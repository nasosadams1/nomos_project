import { Check } from 'lucide-react';
import { CONTACT_DETAILS, PRICING_PLANS } from '../lib/content';

const faqs = [
  {
    q: 'Is this pricing live today?',
    a: 'Treat the plans below as launch pricing guidance. Final commercial terms are confirmed during onboarding.',
  },
  {
    q: 'Do you take commission on legal fees?',
    a: 'No. The model is subscription-based, not a revenue share on legal work.',
  },
  {
    q: 'Can firms with multiple lawyers join?',
    a: 'Yes. Team plans are designed for firms that need routing, shared intake operations, and central account management.',
  },
  {
    q: 'How do we get started?',
    a: 'Contact the sales team, describe your practice, and we will confirm whether Nomos is a fit for your workflow and launch timeline.',
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(to_bottom,_#f8fafc,_#ffffff)] pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Launch pricing guidance
          </p>
          <h1 className="mt-4 text-5xl font-bold text-slate-900">Simple pricing, no commission on legal work.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
            Nomos is priced as workflow software for firms. We are not trying to sit in the middle
            of your legal fees.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border-2 p-8 ${
                  plan.featured ? 'border-slate-900 shadow-xl' : 'border-slate-200'
                }`}
              >
                {plan.featured ? (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-4 py-1 text-sm font-semibold text-white">
                    Recommended
                  </span>
                ) : null}

                <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-3 text-4xl font-bold text-slate-900">{plan.price}</p>
                <p className="mt-3 leading-7 text-slate-600">{plan.summary}</p>

                <a
                  href={`mailto:${CONTACT_DETAILS.salesEmail}?subject=Nomos%20${encodeURIComponent(plan.name)}%20plan`}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-center font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Talk to sales
                </a>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <span className="text-slate-700">{feature}</span>
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Pricing FAQ</h2>
            <p className="mt-3 text-lg text-slate-600">
              The right questions are usually operational, not just financial.
            </p>
          </div>

          <div className="mt-10 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">{faq.q}</h3>
                <p className="mt-3 leading-7 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900">Need a quote for your firm shape?</h2>
          <p className="mt-4 text-xl leading-8 text-slate-600">
            Email the team with your lawyer count, intake volume, and operational requirements.
          </p>
          <a
            href={`mailto:${CONTACT_DETAILS.salesEmail}?subject=Nomos%20pricing%20question`}
            className="mt-8 inline-flex items-center rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Contact sales
          </a>
        </div>
      </section>
    </div>
  );
}
