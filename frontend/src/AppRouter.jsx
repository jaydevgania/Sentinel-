import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LiveBackground from './components/LiveBackground';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import AdminCRMPage from './pages/AdminCRMPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';

export default function AppRouter() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        {/* Global Live Dynamic Thematic Background */}
        <LiveBackground />

        {/* Routed Pages */}
        <div className="relative z-10">
          <Routes>
            {/* Public marketing pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Dedicated Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Admin Customer & CRM Database */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminCRMPage />
                </ProtectedRoute>
              }
            />

            {/* Main Sentinel Application */}
            <Route path="/app" element={<App />} />

            {/* Fallback to landing */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}
