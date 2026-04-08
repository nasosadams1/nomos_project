import { CONTACT_DETAILS, LAST_UPDATED_LABEL } from '../lib/content';
import { usePageMeta } from '../hooks/usePageMeta';

export default function TermsPage() {
  usePageMeta(
    'Terms of service',
    'Review the Nomos platform terms covering legal-marketplace use, lawyer discovery, consultation requests, and platform responsibilities.',
  );

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-3 text-slate-600">Last updated: {LAST_UPDATED_LABEL}</p>

        <div className="prose prose-slate mt-10 max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Platform description</h2>
            <p className="text-slate-700 leading-relaxed">
              Nomos is a legal marketplace product. We provide technology for lawyer discovery,
              intake collection, consultation requests, and signed-in portal access. Nomos is not a
              law firm and does not provide legal advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">No attorney-client relationship</h2>
            <p className="text-slate-700 leading-relaxed">
              Browsing profiles, submitting intake, or sending a consultation request through Nomos
              does not create an attorney-client relationship. That relationship exists only if you
              separately engage a lawyer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">User responsibilities</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>Provide accurate information in intake and consultation request forms</li>
              <li>Use the platform lawfully and respectfully</li>
              <li>Do not attempt to bypass access restrictions or misuse portal features</li>
              <li>Do not rely on Nomos copy or summaries as legal advice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Lawyer profiles and verification</h2>
            <p className="text-slate-700 leading-relaxed">
              Nomos may verify professional credentials before listing a lawyer publicly, but we do
              not guarantee legal outcomes, service quality, or suitability for every matter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Fees</h2>
            <p className="text-slate-700 leading-relaxed">
              Consultation fees shown in the directory are set by the individual lawyer. Nomos may
              charge subscription fees to lawyers or firms that use the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Availability and service changes</h2>
            <p className="text-slate-700 leading-relaxed">
              Product features may change as the service is improved. Consultation requests are also
              subject to lawyer confirmation, operational review, and system availability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              Questions about these terms can be sent to{' '}
              <a href={`mailto:${CONTACT_DETAILS.legalEmail}`}>{CONTACT_DETAILS.legalEmail}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
