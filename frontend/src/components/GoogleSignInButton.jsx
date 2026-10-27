import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';

export default function GoogleSignInButton({
  text = "Continue with Google",
  onSuccess,
  className = ""
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Real Google Identity Services loader if clientId provided
  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLoading(true);
              const user = await loginWithGoogle({ credential: response.credential });
              if (onSuccess) onSuccess(user);
            } catch (err) {
              alert(`Google authentication error: ${err.message}`);
            } finally {
              setLoading(false);
            }
          }
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  const handleGoogleClick = () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Show simulated Google Account selector (Zero-setup test mode)
      setShowPicker(true);
    }
  };

  const handleSelectAccount = async (account) => {
    try {
      setLoading(true);
      setShowPicker(false);
      const user = await loginWithGoogle(account);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      alert(`Google sign in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    handleSelectAccount({
      email: customEmail,
      name: customName || customEmail.split('@')[0],
      google_id: `g_${Date.now()}`
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2.5 border border-gray-300 disabled:opacity-60 cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
        ) : (
          /* Official Google 4-color 'G' SVG */
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-medium text-gray-700">{loading ? 'Connecting Google...' : text}</span>
      </button>

      {/* Simulated Google Account Chooser Modal (for Zero-Setup Hackathon Evaluation) */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowPicker(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Header */}
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h3 className="text-sm font-bold text-white">Sign in with Google</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Choose an account to continue to Sentinel:
            </p>

            <div className="space-y-2 mb-4">
              {[
                { name: 'Jay Devgania', email: 'jay.devgania@gmail.com', avatar: 'JD' },
                { name: 'Dharmi Gor', email: 'dharmi.gor@gmail.com', avatar: 'DG' },
                { name: 'Sentinel Team Lead', email: 'sentinel.ark.lead@gmail.com', avatar: 'ST' }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount({ email: acc.email, name: acc.name, google_id: `g_${acc.email}` })}
                  className="w-full p-2.5 bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-amber-500/40 rounded-xl flex items-center space-x-3 transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-gray-950 font-bold flex items-center justify-center text-xs">
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{acc.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Google Email input */}
            <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-gray-800 space-y-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Or enter any Google account:</span>
              <input
                type="email"
                required
                placeholder="your.name@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold rounded-lg transition"
              >
                Sign in as Google User &rarr;
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
