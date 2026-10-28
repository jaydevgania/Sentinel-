import React, { useState } from 'react';
import {
  X, ShieldCheck, Mail, Lock, Building2, User, Sparkles, Check, AlertCircle, CreditCard
} from 'lucide-react';
import { loginUser, registerUser, upgradeSubscription } from '../api';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login', 'register', 'subscription'
  selectedPlan = 'pro',
  onSuccess
}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [plan, setPlan] = useState(selectedPlan);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  // Simulated card details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await registerUser({
          name,
          email,
          password,
          company_name: companyName,
          brand_name: brandName,
          plan
        });
        onSuccess(res.user);
        onClose();
      } else if (mode === 'subscription') {
        const res = await upgradeSubscription(plan, billingPeriod);
        alert(res.message);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl shadow-black/80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <ShieldCheck className="w-5 h-5 text-gray-950" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {mode === 'login' ? 'Sign In to Sentinel' :
               mode === 'register' ? 'Create Customer Account' :
               'Upgrade Sentinel Plan'}
            </h3>
            <p className="text-xs text-gray-400">
              {mode === 'login' ? 'Access your brand compliance workspace' :
               mode === 'register' ? 'Get an isolated database workspace for your brand' :
               'Select your subscription plan and activate'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'subscription' && (
          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 mb-5 text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'login' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'register' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register New Brand
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Global"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Acme Coffee"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          {mode !== 'subscription' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Subscription Tier Selection */}
          {(mode === 'subscription' || mode === 'register') && (
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5">Choose Subscription Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'starter', name: 'Starter', price: '$0/mo' },
                  { id: 'pro', name: 'Pro', price: '$49/mo' },
                  { id: 'enterprise', name: 'Enterprise', price: 'Custom' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      plan === p.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs capitalize text-white">{p.name}</div>
                    <div className="text-[10px] text-amber-400 font-medium">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'subscription' && (
            <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Payment Simulator:</span>
                <span className="text-emerald-400 font-bold flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1" /> Ready
                </span>
              </div>
              <input
                type="text"
                readOnly
                value={cardNumber}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-300"
              />
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-400">
                <div className="bg-gray-900 p-1.5 rounded border border-gray-800">Exp: {cardExp}</div>
                <div className="bg-gray-900 p-1.5 rounded border border-gray-800">CVC: {cardCvc}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' :
               mode === 'login' ? 'Sign In to Workspace' :
               mode === 'register' ? 'Register Brand Workspace' :
               `Confirm & Activate ${plan.toUpperCase()}`}
            </button>
          </div>
        </form>

        {mode !== 'subscription' && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <GoogleSignInButton
              text={mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              onSuccess={(user) => {
                if (onSuccess) onSuccess(user);
                onClose();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
