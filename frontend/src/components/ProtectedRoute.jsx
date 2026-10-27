import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-xs text-gray-400">
        Verifying secure credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Admin Privilege Required</h2>
        <p className="text-xs text-gray-400 mb-4">
          Your current account ({user.email}) does not have administrative rights to view the customer database.
        </p>
      </div>
    );
  }

  return children;
}
