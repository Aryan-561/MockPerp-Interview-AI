'use client';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

function MePageContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {user && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-blue-100 text-sm mt-2">Account Profile</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Name Field */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  📝 Full Name
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  ✉️ Email Address
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Email Verification Status */}
              <div className="mb-8">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  ✔️ Verification Status
                </label>
                <div className={`rounded-lg px-4 py-3 border-2 ${
                  user.isEmailVerfied
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-lg font-bold flex items-center gap-2 ${
                    user.isEmailVerfied ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {user.isEmailVerfied ? (
                      <>
                        <span className="text-2xl">✓</span>
                        Email Verified
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">⚠️</span>
                        Pending Verification
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              >
                Sign Out
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-500">
              Last updated on {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <MePageContent />
    </ProtectedRoute>
  );
} 