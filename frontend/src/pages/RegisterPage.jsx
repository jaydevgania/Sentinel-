import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Building2, ArrowRight, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'pro';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        company_name: companyName,
        brand_name: brandName || companyName,
        plan
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          Create your brand workspace
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300">
            Sign in
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
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Global"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Coffee"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Selected Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'starter', label: 'Starter', price: '$0/mo' },
                  { id: 'pro', label: 'Pro', price: '$49/mo' },
                  { id: 'enterprise', label: 'Enterprise', price: 'Custom' }
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
                    <div className="font-bold text-xs capitalize text-white">{p.label}</div>
                    <div className="text-[10px] text-amber-400 font-medium">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-900/30 transition transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Brand Workspace...' : 'Register & Launch Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Google Quick Sign Up */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-2 bg-gray-900 text-gray-500 font-medium">Or quick register with</span>
            </div>
          </div>

          <GoogleSignInButton
            text="Sign up with Google"
            onSuccess={() => navigate('/app', { replace: true })}
          />

          <div className="pt-3 border-t border-gray-800 text-center">
            <p className="text-[11px] text-gray-400">
              By registering, an isolated database workspace is provisioned for your brand with automatic SHA-256 audit logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
