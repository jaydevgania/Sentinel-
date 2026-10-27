import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Check, ArrowRight, Loader2, KeyRound, ExternalLink, ShieldCheck } from 'lucide-react';

export default function GoogleSignInButton({
  text = "Continue with Google",
  onSuccess,
  className = ""
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [activeClientId, setActiveClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('sentinel_google_client_id') || ''
  );
  const googleBtnContainerRef = useRef(null);

  // Initialize official Google Identity Services whenever activeClientId is present
  useEffect(() => {
    if (!activeClientId) return;

    const initGis = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response) => {
              try {
                setLoading(true);
                const user = await loginWithGoogle({ credential: response.credential });
                if (onSuccess) onSuccess(user);
              } catch (err) {
                alert(`Google sign in failed: ${err.message}`);
              } finally {
                setLoading(false);
              }
            }
          });

          // Also render official Google iframe button if container exists
          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '100%'
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      // Check every 200ms until script loaded
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [activeClientId]);

  // Click Handler: Triggers REAL Google OAuth popup (accounts.google.com)
  const handleGoogleClick = () => {
    if (!activeClientId) {
      // Needs Google Cloud Client ID to open accounts.google.com
      setShowConfigModal(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      alert("Google Identity Services script is loading. Please try again in a moment.");
      return;
    }

    try {
      setLoading(true);
      // Real Google OAuth 2.0 Popup via Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Google OAuth Error:', tokenResponse);
            setLoading(false);
            if (tokenResponse.error !== 'access_denied') {
              alert(`Google Sign-In Error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            return;
          }

          try {
            // Send verified access token to Sentinel backend
            const user = await loginWithGoogle({ access_token: tokenResponse.access_token });
            if (onSuccess) onSuccess(user);
          } catch (err) {
            alert(`Google authentication error: ${err.message}`);
          } finally {
            setLoading(false);
          }
        }
      });

      // Opens accounts.google.com/o/oauth2/v2/auth popup
      tokenClient.requestAccessToken();
    } catch (err) {
      console.error('Failed to trigger Google OAuth popup:', err);
      // Fallback to Google ID One-Tap prompt
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      }
      setLoading(false);
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) return;

    localStorage.setItem('sentinel_google_client_id', cleanId);
    setActiveClientId(cleanId);
    setShowConfigModal(false);

    // Immediately trigger Google login popup with newly provided client ID
    setTimeout(() => {
      try {
        if (window.google?.accounts?.oauth2) {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: cleanId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.access_token) {
                setLoading(true);
                const user = await loginWithGoogle({ access_token: tokenResponse.access_token });
                if (onSuccess) onSuccess(user);
                setLoading(false);
              }
            }
          });
          tokenClient.requestAccessToken();
        }
      } catch (err) {
        console.error('Post-config Google OAuth trigger error:', err);
      }
    }, 300);
  };

  const handleRemoveClientId = () => {
    localStorage.removeItem('sentinel_google_client_id');
    setActiveClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
    setInputClientId('');
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

      {/* Real Google OAuth Setup Modal (Displayed only when Google Client ID is needed) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect Real Google Sign-In</h3>
                <p className="text-xs text-gray-400">Direct OAuth 2.0 integration via Google Identity Services</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-200">
              To trigger the official <strong>accounts.google.com</strong> popup, Google requires a registered <strong>Google Cloud OAuth Client ID</strong>.
            </div>

            <form onSubmit={handleSaveClientId} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Google Client ID (Web Application)
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234567890-abc123xyz.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>Save & Launch Real Google Popup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 2-step Setup Instructions */}
            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-2">
              <div className="font-semibold text-gray-300 flex items-center justify-between">
                <span>How to get your free Google Client ID:</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 underline"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-400">
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>).</li>
                <li>Add to <strong>Authorized JavaScript origins</strong>:
                  <div className="mt-1 font-mono text-[10px] bg-gray-950 p-1.5 rounded border border-gray-800 text-gray-300 select-all">
                    http://localhost:3000<br />
                    http://127.0.0.1:3000
                  </div>
                </li>
                <li>Copy the generated <strong>Client ID</strong> and paste it above!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
