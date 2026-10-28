import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScrollReveal from "../components/ScrollReveal";
import {
  ShieldCheck,
  FileText,
  ScanSearch,
  Accessibility,
  Link2,
  Users,
  Lightbulb,
  Upload,
  PenLine,
  Cpu,
  ClipboardCheck,
  MessageSquare,
  Send,
  Check,
  ArrowRight,
  Star,
  ChevronRight,
  Zap,
  Lock,
  Eye,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";

const TwitterIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const GithubIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
);
const LinkedinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs tracking-widest uppercase mb-4 shadow-sm shadow-amber-500/10">
      <Sparkles className="w-3.5 h-3.5" />
      <span>{children}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
      {children}
    </h2>
  );
}

function SectionSub({ children }) {
  return (
    <p className="mt-4 text-base sm:text-lg text-slate-300/80 max-w-2xl mx-auto leading-relaxed">
      {children}
    </p>
  );
}

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 antialiased overflow-hidden">
      {/* ────────────────── NAVBAR ────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-panel bg-[#090d16]/80 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-black/40 py-3.5"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all">
              <ShieldCheck className="h-6 w-6 text-gray-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white group-hover:text-amber-400 transition-colors">
                SENTINEL
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80 -mt-1">
                Enterprise Guardrails
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel-subtle text-sm font-medium text-slate-300">
            <a href="#features" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all">
              Features
            </a>
            <a href="#how-it-works" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all">
              How It Works
            </a>
            <Link to="/pricing" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all">
              Pricing
            </Link>
            <Link to="/contact" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all">
              Contact
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 glass-pill py-1.5 px-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 font-bold text-xs flex items-center justify-center">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>

                {user?.email?.toLowerCase()?.trim() === 'devgania1@gmail.com' && (
                  <Link
                    to="/admin"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition"
                  >
                    Customer DB
                  </Link>
                )}
                <Link
                  to="/app"
                  className="glass-button-primary px-5 py-2 text-xs font-bold rounded-xl text-gray-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="glass-button-secondary px-4 py-2 text-xs font-semibold rounded-xl text-slate-200 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glass-button-primary px-5 py-2 text-xs font-bold rounded-xl text-gray-950 shadow-lg shadow-amber-500/25"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass-panel border-t border-white/10 px-6 pb-6 pt-3 mt-3 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white text-sm py-1">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white text-sm py-1">How It Works</a>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white text-sm py-1">Pricing</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white text-sm py-1">Contact</Link>
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <Link to="/app" className="glass-button-primary flex-1 py-2 text-center text-xs font-bold rounded-xl text-gray-950">Start Free</Link>
              <Link to="/contact" className="glass-button-secondary flex-1 py-2 text-center text-xs font-bold rounded-xl text-slate-200">Book Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────── HERO SECTION ────────────────── */}
      <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-32 overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Floating Live Badge */}
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold glass-pill border border-amber-500/30 text-amber-300 mb-8 shadow-lg shadow-amber-500/10 animate-float">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>Grounded AI Brand Guardrails &bull; Zero Hallucinations</span>
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <ScrollReveal animation="fade-up" delay={120}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Your Brand&apos;s Last Line
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                of Defense Before Publish
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Sentinel catches factual errors, tone violations, and compliance gaps in your marketing copy&mdash;grounded in your brand&apos;s own guidelines, with complete human-in-the-loop control.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal animation="fade-up" delay={280}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app"
                className="glass-button-primary group inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold rounded-2xl text-gray-950 shadow-2xl shadow-amber-500/30 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <span>Start Reviewing Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="glass-button-secondary group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-2xl text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <span>See Interactive Process</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform text-amber-400" />
              </a>
            </div>
          </ScrollReveal>

          {/* Trust Badges */}
          <ScrollReveal animation="fade-up" delay={340}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-400">
              {[
                { icon: ScanSearch, label: "Grounded AI Citations" },
                { icon: Accessibility, label: "WCAG 2.1 AA Contrast" },
                { icon: Lock, label: "SHA-256 Audit Trail" },
                { icon: ShieldCheck, label: "Zero Hallucination Guarantee" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-subtle">
                  <Icon className="h-4 w-4 text-amber-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Glass Hero Mockup: Sentinel Studio Live Preview */}
          <ScrollReveal animation="scale-up" delay={400} className="mt-16">
            <div className="glass-panel p-2 rounded-3xl border border-white/15 shadow-2xl shadow-amber-500/10 max-w-4xl mx-auto overflow-hidden">
              <div className="bg-[#0b0f19]/90 rounded-2xl p-5 border border-white/5 space-y-4 text-left">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">sentinel://studio/review-session</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Channel: Instagram
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Score: 94/100
                    </span>
                  </div>
                </div>

                {/* Mock Content & Finding Badge */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Marketing Copy Draft</div>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      &quot;Introducing our revolutionary new blend. Brewed with 100% organic beans sourced directly from Ethiopian high-altitude farms.&quot;
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl glass-card-static border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Grounded Rule Check &bull; Terminology
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Rule #TRM-04</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Term <span className="line-through text-rose-400 font-bold">&quot;revolutionary&quot;</span> violates humble brand tone. Suggested approved fix: <span className="text-emerald-400 font-bold">&quot;signature handcrafted&quot;</span>.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Accept Fix</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-bold">Edit</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px]">Dispute</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ────────────────── TRUST LOGO BAR ────────────────── */}
      <section className="py-12 border-y border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-bold tracking-widest text-slate-500 uppercase mb-8">
            Engineered for enterprise compliance teams, agencies, and high-growth brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Acme Corp", "CloudBase", "NovaTech", "UrbanBrew", "Meridian", "Stellarion"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-extrabold tracking-wider text-slate-600 hover:text-amber-400/60 transition-colors select-none"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ────────────────── FEATURES GRID ────────────────── */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <SectionLabel>Features</SectionLabel>
            <SectionTitle>Everything Your Brand Team Needs</SectionTitle>
            <SectionSub>
              Six core pillars of brand compliance, working simultaneously with zero hallucinations.
            </SectionSub>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ScanSearch,
                title: "Grounded Claim Verification",
                desc: "Every AI finding cites a verified fact or guideline ID from your own database. No unsourced hallucinated opinions, ever.",
                tag: "Grounding"
              },
              {
                icon: FileText,
                title: "Deterministic Terminology Checks",
                desc: "Word-boundary regex scanning catches banned and discouraged terms with zero false negatives. Instant, rule-based, and exhaustive.",
                tag: "Zero Drift"
              },
              {
                icon: Accessibility,
                title: "WCAG 2.1 AA Accessibility",
                desc: "Real-time contrast ratio calculations, text readability metrics, and alt-text validation ensure complete public compliance.",
                tag: "Inclusive"
              },
              {
                icon: Link2,
                title: "Tamper-Evident Audit Trail",
                desc: "SHA-256 hash-chained cryptographic records that detect retroactive tampering. Every decision is transparent and archived.",
                tag: "Security"
              },
              {
                icon: Users,
                title: "Human-in-the-Loop Workflow",
                desc: "Creators accept, edit, or dispute findings before submitting for manager sign-off. Creative voice stays 100% in human control.",
                tag: "Collaborative"
              },
              {
                icon: Lightbulb,
                title: "Guideline-Gap Intelligence",
                desc: "Automatically surfaces ambiguous rules from dispute patterns and proposes concrete refinements to improve your brand playbook.",
                tag: "Self-Healing"
              },
            ].map(({ icon: Icon, title, desc, tag }, index) => (
              <ScrollReveal
                key={title}
                animation="fade-up"
                delay={index * 90}
              >
                <div className="glass-card h-full p-7 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 group-hover:border-amber-400 transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-amber-300 transition-colors">
                      {title}
                    </h3>
                    <p className="text-slate-300/80 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section
        id="how-it-works"
        className="py-24 sm:py-32 border-y border-white/5 bg-black/25 relative"
      >
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <SectionLabel>Workflow</SectionLabel>
            <SectionTitle>From Draft to Published in Six Simple Steps</SectionTitle>
            <SectionSub>
              A clean pipeline keeping creators empowered and brand managers confident.
            </SectionSub>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                num: "01",
                title: "Upload Guidelines",
                desc: "Upload brand books via PDF, DOCX, or direct text. Sentinel parses, vectorizes, and indexes your rules.",
              },
              {
                icon: PenLine,
                num: "02",
                title: "Paste Copy",
                desc: "Paste marketing copy into the studio. Select destination channels like Instagram, Press Release, or Web.",
              },
              {
                icon: Cpu,
                num: "03",
                title: "Parallel Analysis",
                desc: "Sentinel executes deterministic rule checks and grounded AI analysis simultaneously in under 3 seconds.",
              },
              {
                icon: ClipboardCheck,
                num: "04",
                title: "Interactive Findings",
                desc: "Review flagged terms, ungrounded claims, and tone drift with clickable citations back to your original guidelines.",
              },
              {
                icon: MessageSquare,
                num: "05",
                title: "Human Response",
                desc: "Accept suggestions with 1-click, type custom edits, or lodge justified disputes for unusual creative contexts.",
              },
              {
                icon: Send,
                num: "06",
                title: "Manager Approval",
                desc: "Submit for final manager approval with an immutable SHA-256 hash stamp certifying compliance.",
              },
            ].map(({ icon: Icon, num, title, desc }, index) => (
              <ScrollReveal
                key={num}
                animation="fade-up"
                delay={index * 80}
              >
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-black text-amber-500/40 group-hover:text-amber-400 transition-colors">
                        {num}
                      </span>
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2 group-hover:text-amber-300 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-300/80 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── COMPLIANCE SCORE PREVIEW ────────────────── */}
      <section className="py-24 sm:py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <SectionLabel>Analytics & Health</SectionLabel>
            <SectionTitle>Continuous Brand Health Measurement</SectionTitle>
            <SectionSub>
              Track compliance scores across campaigns, creators, and channels to eliminate compliance debt over time.
            </SectionSub>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={150}>
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-56 h-56">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="url(#amberGrad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${0.94 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                        transform="rotate(-90 60 60)"
                      />
                      <defs>
                        <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white">94</span>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">Grade A+ (Safe)</span>
                    </div>
                  </div>
                  <span className="mt-4 text-xs text-slate-400 font-medium">Ready for immediate multi-channel distribution</span>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-4">
                  {[
                    { label: "Brand Tone Consistency", pct: 100, color: "from-amber-400 to-yellow-500" },
                    { label: "Approved Terminology", pct: 88, color: "from-amber-500 to-orange-500" },
                    { label: "Grounded Claim Facts", pct: 92, color: "from-emerald-400 to-teal-500" },
                    { label: "WCAG Contrast & Alt Text", pct: 100, color: "from-cyan-400 to-blue-500" },
                    { label: "Channel Formatting", pct: 96, color: "from-indigo-400 to-purple-500" },
                  ].map(({ label, pct, color }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-amber-400 font-bold">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ────────────────── PRICING SNIPPET ────────────────── */}
      <section id="pricing" className="py-24 sm:py-32 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <SectionTitle>Simple, Transparent Pricing</SectionTitle>
            <SectionSub>
              Start free today, upgrade as your brand library and creative team expands.
            </SectionSub>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <ScrollReveal animation="fade-up" delay={50}>
              <div className="glass-card h-full p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">Free</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">For creators & small brands starting out.</p>

                  <ul className="mt-8 space-y-3">
                    {["50 reviews / month", "1 brand workspace", "Deterministic terminology checks", "WCAG accessibility validation", "Community support"].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/app"
                  className="glass-button-secondary mt-8 block text-center px-6 py-3 text-xs font-bold rounded-xl text-slate-200 hover:text-white"
                >
                  Get Started Free
                </Link>
              </div>
            </ScrollReveal>

            {/* Pro (Highlighted Glass Glow) */}
            <ScrollReveal animation="scale-up" delay={150}>
              <div className="glass-card-glow-amber relative h-full p-8 rounded-3xl flex flex-col justify-between scale-[1.03] z-10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[11px] font-black text-gray-950 uppercase tracking-wider shadow-lg shadow-amber-500/30">
                    <Star className="h-3.5 w-3.5 fill-gray-950" /> Most Popular
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Professional</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$49</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="mt-2 text-xs text-amber-200/80">For growing teams requiring full AI power.</p>

                  <ul className="mt-8 space-y-3">
                    {[
                      "Unlimited reviews",
                      "5 brand workspaces",
                      "Full Grounded AI + Deterministic",
                      "Gemini-powered claim citations",
                      "Guideline-gap intelligence",
                      "PDF / DOCX guideline upload",
                      "Priority email support"
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-white">
                        <Check className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/app"
                  className="glass-button-primary mt-8 block text-center px-6 py-3.5 text-xs font-black rounded-xl text-gray-950 shadow-xl shadow-amber-500/30"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </ScrollReveal>

            {/* Enterprise */}
            <ScrollReveal animation="fade-up" delay={250}>
              <div className="glass-card h-full p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Enterprise</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">Custom</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">For organizations with strict governance.</p>

                  <ul className="mt-8 space-y-3">
                    {["Unlimited workspaces", "Custom AI models & SLA", "SSO / SAML & RBAC", "Dedicated success manager", "SHA-256 Audit vault", "SOC 2 Type II report"].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/contact"
                  className="glass-button-secondary mt-8 block text-center px-6 py-3 text-xs font-bold rounded-xl text-slate-200 hover:text-white"
                >
                  Contact Sales
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ────────────────── CTA BANNER ────────────────── */}
      <section className="py-24 sm:py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="scale-up">
            <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-500/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/15 to-transparent blur-3xl rounded-full pointer-events-none" />

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Stop Publishing
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Non-Compliant Content
                </span>
              </h2>
              <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
                Join modern brand teams who rely on Sentinel to guarantee brand safety and catch what humans miss.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/app"
                  className="glass-button-primary px-8 py-3.5 text-sm font-bold rounded-2xl text-gray-950 shadow-xl shadow-amber-500/25 flex items-center gap-2"
                >
                  <span>Start Free Review Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="glass-button-secondary px-8 py-3.5 text-sm font-semibold rounded-2xl text-slate-200 hover:text-white"
                >
                  Schedule Live Walkthrough
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer id="contact" className="border-t border-white/10 bg-black/40 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-gray-950 font-bold" />
                </div>
                <span className="text-base font-black tracking-wider text-white">
                  SENTINEL
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise AI brand compliance &amp; grounded guardrails for modern marketing organizations.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Security", "Status"] },
              { title: "Company", links: ["About Us", "Contact", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Compliance", "GDPR"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                  {title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; 2026 Sentinel Compliance Engine. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="hover:text-amber-400 transition-colors">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-amber-400 transition-colors">
                <GithubIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-amber-400 transition-colors">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
