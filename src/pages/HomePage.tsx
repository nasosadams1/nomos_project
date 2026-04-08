import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Lock, Scale, Shield, Users } from 'lucide-react';
import { ISSUE_TYPES } from '../lib/content';
import { formatCurrency } from '../lib/formatters';

const featuredLawyers = [
  {
    name: 'Maria Papadopoulos',
    photo:
      'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
    city: 'Athens',
    area: 'Family law',
    rating: 4.9,
    reviews: 47,
    fee: 120,
  },
  {
    name: 'Sofia Dimitriou',
    photo:
      'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=400',
    city: 'Patras',
    area: 'Immigration law',
    rating: 4.9,
    reviews: 62,
    fee: 90,
  },
  {
    name: 'Konstantinos Georgiou',
    photo:
      'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
    city: 'Thessaloniki',
    area: 'Business contracts',
    rating: 4.8,
    reviews: 38,
    fee: 150,
  },
];

const steps = [
  {
    number: '01',
    title: 'Describe the legal issue',
    description:
      'Start with a structured intake so lawyers can understand the matter before anyone books time.',
  },
  {
    number: '02',
    title: 'Review verified profiles',
    description:
      'Compare practice areas, jurisdictions, languages, ratings, and consultation fees in one place.',
  },
  {
    number: '03',
    title: 'Request the right consultation',
    description:
      'Choose a time slot, send the request, and continue the conversation through secure portal access.',
  },
];

const faqs = [
  {
    q: 'What happens after I submit intake?',
    a: 'Nomos stores the request, surfaces matching lawyers, and lets you continue by requesting a consultation with the lawyer you choose.',
  },
  {
    q: 'Does Nomos provide legal advice?',
    a: 'No. Nomos is a marketplace and workflow layer. Legal advice comes only from the lawyer you choose to engage.',
  },
  {
    q: 'How are lawyers shown in the directory?',
    a: 'Profiles are filtered to verified lawyers and sorted by factors such as rating, fee, and experience so clients can compare them more easily.',
  },
  {
    q: 'Can I use the portal without an account?',
    a: 'Portal access is tied to a signed-in email session. Public visitors can browse the directory and submit intake, but case activity is not shown publicly.',
  },
];

const issueCategories = ISSUE_TYPES.filter((issue) => issue !== 'Other');

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_45%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)] pt-16 pb-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Legal intake, directory, and consultation requests
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Find the right lawyer without sending the same story five times.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
              Nomos gives clients a structured intake flow, a verified public lawyer directory,
              transparent consultation fees, and signed-in portal access for ongoing updates.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/intake"
                className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Start Intake
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/lawyers"
                className="inline-flex items-center rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Browse Lawyers
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-500" />
                <span>Verified public profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                <span>Fast comparison and triage</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-slate-500" />
                <span>Signed-in portal access</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Start with the issue
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                What kind of legal matter are you dealing with?
              </h2>
              <p className="mt-2 text-slate-600">
                Choose a category to prefill the intake flow and shorten the path to a good
                match.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {issueCategories.map((category) => (
                <Link
                  key={category}
                  to={`/intake?issue=${encodeURIComponent(category)}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              Built to remove wasted back-and-forth from the first legal conversation.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl border border-slate-200 bg-white p-8">
                <p className="text-5xl font-bold text-slate-200">{step.number}</p>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Directory preview
              </p>
              <h2 className="mt-3 text-4xl font-bold text-slate-900">Featured lawyers</h2>
              <p className="mt-3 text-lg leading-8 text-slate-600">
                Public profiles should help a client narrow the shortlist quickly, not hide the
                basics.
              </p>
            </div>
            <Link
              to="/lawyers"
              className="inline-flex items-center text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
            >
              View all lawyers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {featuredLawyers.map((lawyer) => (
              <Link
                key={lawyer.name}
                to="/lawyers"
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition-transform hover:-translate-y-1 hover:shadow-xl"
              >
                <img src={lawyer.photo} alt={lawyer.name} className="h-64 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{lawyer.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {lawyer.area} · {lawyer.city}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {lawyer.rating} ({lawyer.reviews} reviews)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(lawyer.fee)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Shield className="h-7 w-7 text-slate-700" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900">Verified visibility</h3>
            <p className="mt-3 leading-7 text-slate-600">
              The public directory is limited to verified lawyers so clients are not browsing an
              uncurated list of anyone who can type “attorney” into a profile.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Scale className="h-7 w-7 text-slate-700" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900">Better intake quality</h3>
            <p className="mt-3 leading-7 text-slate-600">
              The intake flow collects the facts lawyers actually need to triage a matter instead
              of relying on a single “tell us more” textarea.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-7 w-7 text-slate-700" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900">Clear next steps</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Clients can move from intake to profile review to consultation requests without
              guessing what happens next or whether anyone has actually received the request.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              The questions people should ask before trusting a legal marketplace
            </h2>
          </div>

          <div className="mt-12 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">{faq.q}</h3>
                <p className="mt-3 leading-7 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold">Ready to stop chasing lawyers over email?</h2>
          <p className="mt-4 text-xl leading-8 text-slate-300">
            Start with intake, compare verified profiles, and send a structured consultation
            request.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/intake"
              className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Start Intake
            </Link>
            <Link
              to="/for-lawyers"
              className="inline-flex items-center rounded-xl border border-slate-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800"
            >
              For lawyers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
