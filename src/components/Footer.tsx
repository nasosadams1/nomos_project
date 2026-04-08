import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/lawyers" className="text-sm text-slate-600 hover:text-slate-900">
                  Find a Lawyer
                </Link>
              </li>
              <li>
                <Link to="/intake" className="text-sm text-slate-600 hover:text-slate-900">
                  Start Intake
                </Link>
              </li>
              <li>
                <Link to="/portal" className="text-sm text-slate-600 hover:text-slate-900">
                  Portal Access
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">For Lawyers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/for-lawyers" className="text-sm text-slate-600 hover:text-slate-900">
                  Join Nomos
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Trust</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/security" className="text-sm text-slate-600 hover:text-slate-900">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm text-slate-600 hover:text-slate-900">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-slate-600" strokeWidth={2} />
            <span className="text-sm font-medium text-slate-600">Nomos Legal Marketplace</span>
          </div>
          <p className="text-sm text-slate-500">
            Copyright {new Date().getFullYear()} Nomos. All rights reserved.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-3xl text-center text-xs text-slate-500">
          Submitting an intake form or consultation request does not create an
          attorney-client relationship. Lawyers listed on the platform remain independent
          practitioners.
        </div>
      </div>
    </footer>
  );
}
