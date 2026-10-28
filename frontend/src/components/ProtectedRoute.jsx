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
  const hasDevAccess = isSoleDev || Boolean(user?.is_admin);

  if (requireDeveloper && !hasDevAccess) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mb-4 shadow-lg shadow-red-950/40">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Developer Access Restricted</h2>
        <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
          The Customer Database and Developer Access Panel can only be accessed by the platform developer (<strong className="text-amber-400 font-mono">{SOLE_DEVELOPER}</strong>) or accounts granted permission by the developer.
          <br /><br />
          Your account (<strong className="text-gray-300 font-mono">{user?.email || 'Customer'}</strong>) has full trial access to the Studio, but does not have developer administrator privileges.
        </p>
        <Link
          to="/app"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black rounded-xl text-xs transition flex items-center space-x-2 shadow-lg shadow-amber-900/30 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-950" />
          <span>Go to Review Studio (Trial Access)</span>
        </Link>
      </div>
    );
  }

  return children;
}
