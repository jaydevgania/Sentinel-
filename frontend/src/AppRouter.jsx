import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

        {/* Main Sentinel Application (accessible to guests for demo + custom workspace when logged in) */}
        <Route path="/app" element={<App />} />

        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}
