import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JasperLogo } from './Landing';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <JasperLogo className="w-5 h-5 text-slate-800 dark:text-white" />
            <span className="font-semibold text-slate-800 dark:text-white">Jasper</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing or using Jasper, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Description of Service</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Jasper is a web-based chemical process design and simulation tool. The service allows users to create process flow diagrams, simulate chemical processes, and analyze results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">User Accounts</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You may use Jasper without an account for basic functionality. To access additional features, you may create an account using Google authentication. You are responsible for maintaining the security of your account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Acceptable Use</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Upload malicious code or content</li>
              <li>Use the service to harm others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The Jasper application, including its design, code, and content, is owned by JasperTech. You retain ownership of any project data you create using the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Disclaimer of Warranties</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Jasper is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Simulation results are for educational and preliminary design purposes only and should not be used as the sole basis for engineering decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To the maximum extent permitted by law, JasperTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes by posting a notice on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@jaspertech.org" className="text-teal-600 dark:text-teal-400 hover:underline">
                support@jaspertech.org
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
