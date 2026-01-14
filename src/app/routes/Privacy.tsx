import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JasperLogo } from './Landing';

export default function Privacy() {
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
        <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Jasper ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our chemical process design application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Account information (email address, name) when you sign in with Google</li>
              <li>Project data you create within the application</li>
              <li>Communications you send to us via our contact form</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Authenticate your account and enable access to your projects</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send you technical notices and support messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Data Storage</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Your project data is stored locally in your browser by default. If you use cloud sync features (Pro plan), your data is stored securely on our servers using industry-standard encryption. We use Supabase for authentication and data storage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Third-Party Services</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mt-4">
              <li>Google OAuth for authentication</li>
              <li>Supabase for data storage and authentication</li>
              <li>Stripe for payment processing (Pro plan)</li>
              <li>Google Analytics for usage analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You may access, update, or delete your account information at any time through the Settings page. You can also request deletion of all your data by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-3">Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
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
