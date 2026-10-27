import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, requireDeveloper = true }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const SOLE_DEVELOPER = 'devgania1@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-xs text-gray-400">
        Verifying developer credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSoleDev = user?.email?.toLowerCase().trim() === SOLE_DEVELOPER;

  if (requireDeveloper && !isSoleDev) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mb-4 shadow-lg shadow-red-950/40">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Developer Access Restricted</h2>
        <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
          The Customer Database and Developer Access Panel can only be accessed by the sole platform developer (<strong className="text-amber-400 font-mono">{SOLE_DEVELOPER}</strong>).
          <br /><br />
          Your account (<strong className="text-gray-300 font-mono">{user?.email || 'Customer'}</strong>) does not have developer privileges to view customer records or grant access.
        </p>
        <Link
          to="/app"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white font-semibold rounded-xl text-xs border border-gray-700 transition flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Review Studio</span>
        </Link>
      </div>
    );
  }

  return children;
}
