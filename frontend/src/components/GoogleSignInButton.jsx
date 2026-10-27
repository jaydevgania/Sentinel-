import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function GoogleSignInButton({
  text = "Continue with Google",
  onSuccess,
  className = ""
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const activeClientId = localStorage.getItem('sentinel_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const googleBtnContainerRef = useRef(null);
  const tokenClientRef = useRef(null);
  const loadingTimerRef = useRef(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/login';
  const redirectUri = `${currentOrigin}${currentPath}`;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // Listen for OAuth redirect hash (#access_token=... or #id_token=...)
  useEffect(() => {
    const handleHash = async () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token=') || hash.includes('id_token='))) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');

        try {
          setLoading(true);
          // Clean URL hash without reload
          window.history.replaceState(null, '', window.location.pathname + window.location.search);

          let user;
          if (accessToken) {
            user = await loginWithGoogle({ access_token: accessToken });
          } else if (idToken) {
            user = await loginWithGoogle({ credential: idToken });
          }

          if (user && onSuccess) onSuccess(user);
        } catch (err) {
          setErrorMessage(`Google authentication error: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    };
    handleHash();
  }, []);

  // Pre-initialize Google Identity Services & Token Client ahead of user click
  useEffect(() => {
    if (!activeClientId) return;

    let mounted = true;

    const setupGis = () => {
      if (!mounted) return;

      // 1. Pre-initialize OAuth2 Token Client (MUST be done ahead of click to prevent browser popup blocking)
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: activeClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

              if (tokenResponse.error) {
                setLoading(false);
                if (tokenResponse.error === 'access_denied') {
                  setErrorMessage('Google sign-in was canceled.');
                } else {
                  setErrorMessage(`Google sign-in was not completed: ${tokenResponse.error_description || tokenResponse.error}`);
                }
                return;
              }

              if (tokenResponse.access_token) {
                try {
                  const user = await loginWithGoogle({ access_token: tokenResponse.access_token });
                  if (onSuccess) onSuccess(user);
                } catch (err) {
                  setErrorMessage(`Authentication failed: ${err.message}`);
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
              console.warn('Google Identity error_callback:', error);

              if (error.type === 'popup_failed_to_open') {
                setPopupBlocked(true);
                setErrorMessage('Popup was blocked by your browser. Use the direct redirect button below to continue.');
              } else if (error.type === 'popup_closed') {
                setErrorMessage('Google sign-in popup was closed before completing.');
              } else {
                setErrorMessage('Google sign-in could not be completed. Please try again or use direct redirect.');
              }
            }
          });
        } catch (e) {
          console.warn('Failed to pre-init token client:', e);
        }
      }

      // 2. Initialize GIS ID library & render official Google button
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

          // Render official Google iframe button
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

    if (window.google?.accounts) {
      setupGis();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) {
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

  // Click Handler: Triggers popup synchronously using pre-initialized tokenClient
  const handleGoogleClick = () => {
    setErrorMessage(null);
    setPopupBlocked(false);

    if (!activeClientId) {
      setErrorMessage('Google Sign-In is currently unavailable. Please sign in with email and password.');
      return;
    }

    setLoading(true);

    // Timeout safety
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setLoading(false);
      setPopupBlocked(true);
    }, 8000);

    // Synchronous execution using pre-initialized client
    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Error calling requestAccessToken:', err);
      }
    }

    // Direct redirect fallback
    handleDirectRedirect();
  };

  // Full-Page Redirect Flow: 100% immune to popup blockers
  const handleDirectRedirect = () => {
    if (!activeClientId) {
      setErrorMessage('Google Sign-In is currently unavailable. Please sign in with email and password.');
      return;
    }

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(activeClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&prompt=select_account`;

    // Direct page navigation - impossible for any popup blocker to block
    window.location.href = oauthUrl;
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Official Google-rendered button (iframe hosted directly by accounts.google.com) */}
      <div
        ref={googleBtnContainerRef}
        className="w-full flex justify-center [&>div]:w-full"
      />

      {/* Styled Sentinel Action Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2.5 border border-gray-300 disabled:opacity-60 cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-600 shrink-0" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        )}
        <span className="font-medium text-gray-700">
          {loading ? 'Opening Google Account...' : text}
        </span>
      </button>

      {/* Popup Blocked Banner with 1-Click Direct Redirect */}
      {popupBlocked && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl space-y-2 text-left">
          <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Browser blocked the popup window</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Your browser blocked the popup. Click below to continue directly via Google:
          </p>
          <button
            type="button"
            onClick={handleDirectRedirect}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-bold rounded-lg text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continue with Google</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && !popupBlocked && (
        <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-[11px] text-red-300 flex items-start space-x-2 text-left">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <div className="mt-1 flex items-center space-x-3 text-[10px]">
              <button
                type="button"
                onClick={handleDirectRedirect}
                className="text-amber-400 hover:underline font-bold"
              >
                Try Again via Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
