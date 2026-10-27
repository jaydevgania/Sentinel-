import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import App from './App';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Main Sentinel Application */}
      <Route path="/app" element={<App />} />

      {/* Fallback to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
