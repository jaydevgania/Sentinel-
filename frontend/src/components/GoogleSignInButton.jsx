import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ExternalLink, Loader2, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';

export default function GoogleSignInButton({
  text = "Continue with Google",
  onSuccess,
  className = ""
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeClientId, setActiveClientId] = useState(
    () => localStorage.getItem('sentinel_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  );
  const [inputClientId, setInputClientId] = useState(activeClientId);
  const googleBtnContainerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Clear loading timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // Listen for OAuth redirect hash (in case popup or redirect returns #access_token=...)
  useEffect(() => {
    const handleHash = async () => {
      if (window.location.hash && window.location.hash.includes('access_token=')) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          try {
            setLoading(true);
            // Clear hash from address bar
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            const user = await loginWithGoogle({ access_token: accessToken });
            if (onSuccess) onSuccess(user);
          } catch (err) {
            setErrorMessage(`Google authentication error: ${err.message}`);
          } finally {
            setLoading(false);
          }
        }
      }
    };
    handleHash();
  }, []);

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!activeClientId) return;

    let mounted = true;

    const setupGis = () => {
      if (!mounted) return;

      // 1. Initialize Google Identity Services (One Tap & Credential response)
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response) => {
              if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
              if (response?.credential) {
                try {
                  setLoading(true);
                  const user = await loginWithGoogle({ credential: response.credential });
                  if (onSuccess) onSuccess(user);
                } catch (err) {
                  setErrorMessage(`Google sign in failed: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render official Google button inside ref if available
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 360
            });
          }
        } catch (e) {
          console.warn('GIS initialize error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGis();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          setupGis();
        }
      }, 200);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [activeClientId]);

  // Handle click on the Google button
  const handleGoogleClick = () => {
    setErrorMessage(null);

    if (!activeClientId) {
      setShowConfigModal(true);
      return;
    }

    setLoading(true);

    // Safety timeout: Never stay stuck on "Connecting Google..." for more than 8 seconds
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setLoading(false);
      setErrorMessage(
        "Google sign-in popup did not complete. If you did not see a popup window, check your browser's popup blocker or verify that your Google Client ID is configured for Web Applications."
      );
    }, 10000);

    // 1. Try Google Identity Services OAuth2 Token Client
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

            if (tokenResponse.error) {
              setLoading(false);
              if (tokenResponse.error === 'access_denied') {
                setErrorMessage('Google sign-in was canceled.');
              } else {
                setErrorMessage(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const user = await loginWithGoogle({ access_token: tokenResponse.access_token });
                if (onSuccess) onSuccess(user);
              } catch (err) {
                setErrorMessage(`Google sign in failed: ${err.message}`);
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: (error) => {
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            setLoading(false);
            if (error.type === 'popup_closed') {
              setErrorMessage('Google sign-in popup was closed.');
            } else if (error.type === 'popup_blocked') {
              setErrorMessage("Google popup was blocked by your browser. Please allow popups for this site in your browser's address bar.");
            } else {
              setErrorMessage(`Google sign-in error (${error.type}): Please verify your Client ID and Authorized Origins in Google Cloud Console.`);
            }
          }
        });

        // Trigger Google's official popup
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('initTokenClient failed, falling back to direct popup:', e);
      }
    }

    // 2. Direct Fallback: Open Google OAuth 2.0 URL in a standard popup window
    try {
      const redirectUri = window.location.origin + window.location.pathname;
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(activeClientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=select_account`;

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        oauthUrl,
        'google_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
        setLoading(false);
        setErrorMessage("Popup blocked! Please allow popups for this website in your browser's address bar.");
        return;
      }

      // Poll popup to detect when user closes it or finishes
      const pollTimer = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            setLoading(false);
            return;
          }

          // Check if popup returned with token
          if (popup.location && popup.location.hash) {
            const hash = popup.location.hash;
            if (hash.includes('access_token=')) {
              clearInterval(pollTimer);
              popup.close();
              if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');
              if (accessToken) {
                loginWithGoogle({ access_token: accessToken })
                  .then((user) => {
                    if (onSuccess) onSuccess(user);
                  })
                  .catch((err) => {
                    setErrorMessage(`Authentication failed: ${err.message}`);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
            }
          }
        } catch (e) {
          // Cross-origin restriction until popup redirects back to our origin
        }
      }, 500);
    } catch (err) {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      setLoading(false);
      setErrorMessage(`Failed to open Google popup: ${err.message}`);
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) return;

    localStorage.setItem('sentinel_google_client_id', cleanId);
    setActiveClientId(cleanId);
    setShowConfigModal(false);
    setErrorMessage(null);
  };

  const handleResetClientId = () => {
    localStorage.removeItem('sentinel_google_client_id');
    setActiveClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
    setInputClientId('');
    setErrorMessage(null);
    setShowConfigModal(true);
  };

  return (
    <div className="w-full space-y-2">
      {/* Official Google-rendered button container (if GIS rendered it) */}
      <div
        ref={googleBtnContainerRef}
        className="w-full flex justify-center [&>div]:w-full"
      />

      {/* Styled Sentinel Google Action Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2.5 border border-gray-300 disabled:opacity-60 cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-600 shrink-0" />
        ) : (
          /* Official Google 4-color 'G' SVG */
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        <span className="font-medium text-gray-700">
          {loading ? 'Opening Google Account...' : text}
        </span>
      </button>

      {/* Error Message with clear guidance */}
      {errorMessage && (
        <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-[11px] text-red-300 flex items-start space-x-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <div className="mt-1 flex items-center space-x-3 text-[10px]">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="text-amber-400 hover:underline font-semibold"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleResetClientId}
                className="text-gray-400 hover:text-white underline"
              >
                Check / Edit Client ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Client ID status & edit link */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
        <span>
          {activeClientId ? (
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
              Google Client ID active
            </span>
          ) : (
            <span className="text-amber-400">Google Client ID required</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => {
            setInputClientId(activeClientId);
            setShowConfigModal(true);
          }}
          className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          {activeClientId ? 'Change Client ID' : 'Configure Client ID'}
        </button>
      </div>

      {/* Google OAuth Setup / Edit Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

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
                <h3 className="text-base font-bold text-white">Google OAuth 2.0 Configuration</h3>
                <p className="text-xs text-gray-400">Enter your Google Cloud Web Client ID</p>
              </div>
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

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-[11px] text-gray-300 space-y-1.5">
                <div className="font-semibold text-amber-400">Important Origin Requirement:</div>
                <p className="text-gray-400">
                  In Google Cloud Console under <strong>Authorized JavaScript origins</strong>, ensure your current origin is added:
                </p>
                <div className="font-mono text-emerald-400 bg-gray-900 p-1.5 rounded border border-gray-800 select-all font-bold">
                  {currentOrigin}
                </div>
                <p className="text-[10px] text-gray-500">
                  (Also add <code>http://localhost:3000</code> and <code>http://127.0.0.1:3000</code>).
                </p>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-bold rounded-xl text-xs shadow-lg transition"
                >
                  Save & Connect
                </button>
                {activeClientId && (
                  <button
                    type="button"
                    onClick={handleResetClientId}
                    className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Google Cloud Console:</span>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>Credentials Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
