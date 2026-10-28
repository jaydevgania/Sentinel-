import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Building, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ScrollReveal from '../components/ScrollReveal';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [plan, setPlan] = useState('pro');
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
    <div className="min-h-screen text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <ScrollReveal animation="fade-up" className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center justify-center space-x-2.5 mb-6 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6 text-gray-950 font-bold" />
          </div>
          <span className="font-black text-2xl tracking-wider text-white group-hover:text-amber-400 transition">
            SENTINEL
          </span>
        </Link>
        <h2 className="text-center text-2xl font-black tracking-tight text-white">
          Create your brand workspace
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300">
            Sign in
          </Link>
        </p>
      </ScrollReveal>

      <ScrollReveal animation="scale-up" delay={120} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/60 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="glass-input w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="glass-input w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Global"
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Coffee"
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      plan === p.id
                        ? 'bg-amber-500/20 border-amber-500/70 text-white shadow-md shadow-amber-500/10'
                        : 'glass-panel-subtle text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs capitalize text-white">{p.label}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="glass-button-primary w-full py-3 px-4 font-bold rounded-xl text-xs text-gray-950 shadow-xl shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Provisioning Workspace...' : 'Register & Launch Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Google Quick Sign Up */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="px-2.5 bg-[#0e1422] text-slate-400 rounded-full">Or quick register with</span>
            </div>
          </div>

          <GoogleSignInButton
            text="Sign up with Google"
            onSuccess={() => navigate('/app', { replace: true })}
          />

          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              By registering, an isolated database workspace is provisioned for your brand with automatic cryptographic audit logging.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
