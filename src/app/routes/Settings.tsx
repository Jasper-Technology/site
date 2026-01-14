import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { redirectToBillingPortal } from '../../lib/stripe';
import {
  User,
  Mail,
  CreditCard,
  LogOut,
  ArrowLeft,
  Cloud,
  HardDrive,
  Crown,
  ExternalLink,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { JasperLogo } from './Landing';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [managingBilling, setManagingBilling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageBilling = async () => {
    if (!user?.stripeCustomerId) return;

    setManagingBilling(true);
    try {
      await redirectToBillingPortal();
    } catch (error) {
      console.error('Billing portal error:', error);
    } finally {
      setManagingBilling(false);
    }
  };

  const isProUser = user?.subscriptionTier === 'pro';
  const isDemoUser = user?.id.startsWith('demo_');

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Please sign in to view settings</p>
          <Link
            to="/signin"
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <JasperLogo className="w-6 h-6 text-slate-800 dark:text-white" />
              <span className="font-semibold text-slate-800 dark:text-white">Settings</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your account information</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-medium shadow-lg shadow-teal-500/20">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">
                  {user.name || 'User'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </div>
              </div>
            </div>

            {/* Account type badge */}
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDemoUser
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : isProUser
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isDemoUser ? (
                  <>
                    <HardDrive className="w-3.5 h-3.5" />
                    Demo Account
                  </>
                ) : isProUser ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    Pro Plan
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" />
                    Free Plan
                  </>
                )}
              </div>
              {isDemoUser && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Sign in to sync your projects
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Subscription</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your plan and billing</p>
          </div>

          <div className="p-6">
            {isDemoUser ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Demo mode active
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Projects are stored locally. Sign in with Google or email to unlock cloud sync
                      and more features.
                    </p>
                    <Link
                      to="/signin"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
                    >
                      Create an account
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : isProUser ? (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <div>
                        <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                          Pro subscription active
                        </p>
                        <p className="text-xs text-teal-600 dark:text-teal-400">
                          $10/month • Renews automatically
                        </p>
                      </div>
                    </div>
                    <Crown className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                  </div>
                </div>

                {user.stripeCustomerId && (
                  <button
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {managingBilling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Manage billing
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Free plan
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        2 projects • Local storage only
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden">
          <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
            <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>

            {/* Delete account */}
            {!isDemoUser && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete account
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Are you sure?
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          This will permanently delete your account and all associated data. This
                          action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                            Delete my account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
