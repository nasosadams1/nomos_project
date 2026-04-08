import { CONTACT_DETAILS, LAST_UPDATED_LABEL } from '../lib/content';
import { usePageMeta } from '../hooks/usePageMeta';

export default function PrivacyPage() {
  usePageMeta(
    'Privacy policy',
    'Understand what Nomos collects, how intake and consultation-request data is used, and where privacy questions should be directed.',
  );

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-3 text-slate-600">Last updated: {LAST_UPDATED_LABEL}</p>

        <div className="prose prose-slate mt-10 max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              Nomos is a legal marketplace workflow product. We collect only the information needed
              to route intake, support consultation requests, and operate signed-in portal access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>Contact details such as name, email address, and optional phone number</li>
              <li>Legal matter details entered through the intake flow</li>
              <li>Consultation request details, including selected date, time, and format</li>
              <li>Authenticated portal session data needed to show the right records</li>
              <li>Operational metadata such as timestamps and status history</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>To match people with relevant lawyers in the directory</li>
              <li>To create and track consultation requests</li>
              <li>To show signed-in users the records relevant to their account</li>
              <li>To support product operations, troubleshooting, and service improvements</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">How Information Is Shared</h2>
            <p className="text-slate-700 leading-relaxed">
              Information from intake and consultation requests is shared with the lawyers involved
              in that request flow and with service providers that help operate Nomos. We do not
              sell client intake data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Retention</h2>
            <p className="text-slate-700 leading-relaxed">
              Intake and consultation data is retained for operational and legal reasons only as
              long as necessary. We are continuing to harden deletion and retention workflows before
              wider launch.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Your Rights</h2>
            <p className="text-slate-700 leading-relaxed">
              Depending on your jurisdiction, you may have rights to access, correct, delete, or
              export your data, and to object to or restrict some processing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              Privacy questions can be sent to{' '}
              <a href={`mailto:${CONTACT_DETAILS.privacyEmail}`}>{CONTACT_DETAILS.privacyEmail}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
