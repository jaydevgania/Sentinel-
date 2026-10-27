import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for judges/evaluators
  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Login with pre-seeded demo user or register
      await login('alex@nimbuscoffee.com', 'DemoPass2026!');
      navigate(from, { replace: true });
    } catch (err) {
      // If demo user doesn't exist yet, attempt with standard test user
      try {
        await login('sarah@skynet-defense.com', 'Secr3tPassword!');
        navigate(from, { replace: true });
      } catch (err2) {
        setEmail('sarah@skynet-defense.com');
        setPassword('Secr3tPassword!');
        setError('Pre-filled test credentials. Click Sign In to proceed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center space-x-2.5 mb-6 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6 text-gray-950 font-bold" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition">
            SENTINEL
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your brand workspace
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-amber-400 hover:text-amber-300">
            register a new brand account (with isolated database)
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-gray-900 border border-gray-800 py-8 px-6 sm:px-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password reset: You can register a new account or use demo login below.'); }} className="text-[11px] text-amber-400 hover:text-amber-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-900/30 transition transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Google Sign In */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-2 bg-gray-900 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton
            text="Sign in with Google"
            onSuccess={() => navigate(from, { replace: true })}
          />

          {/* Quick Demo Access for Hackathon Judges */}
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
                <span>One-Click Test Access</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Judge Ready</span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-gray-950 hover:bg-gray-850 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-gray-800 hover:border-gray-700 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Instant Test Sign In (Sarah Connor - Enterprise)</span>
            </button>

            <div className="mt-3 text-center">
              <Link to="/app" className="text-xs text-gray-400 hover:text-amber-400 underline">
                Continue to Nimbus Coffee Demo without signing in &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
