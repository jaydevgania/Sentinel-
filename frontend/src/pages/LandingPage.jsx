import { Link } from "react-router-dom";
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

/* ───────────────────────────── helpers ───────────────────────────── */

function SectionLabel({ children }) {
  return (
    <span className="inline-block text-amber-400 font-semibold text-sm tracking-widest uppercase mb-4">
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
      {children}
    </h2>
  );
}

function SectionSub({ children }) {
  return (
    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{children}</p>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LANDING PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased">
      {/* ────────────────── NAVBAR ────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <ShieldCheck className="h-7 w-7 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="text-lg font-extrabold tracking-wider text-white">
              SENTINEL
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/app"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              Start Free
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2 text-sm font-semibold rounded-lg border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white transition-all"
            >
              Book Demo
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/60 px-6 pb-6 pt-2 space-y-4">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">How It Works</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Pricing</a>
            <a href="#contact" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Contact</a>
            <div className="flex gap-3 pt-2">
              <Link to="/app" className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950">Start Free</Link>
              <Link to="/contact" className="px-5 py-2 text-sm font-semibold rounded-lg border border-gray-700 text-gray-300">Book Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────── HERO ────────────────── */}
      <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-amber-500/8 blur-[120px]" />
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[100px]" />
          <div className="absolute top-[5%] right-[15%] w-[350px] h-[350px] rounded-full bg-orange-500/5 blur-[100px]" />
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm text-amber-400 mb-8">
            <Zap className="h-3.5 w-3.5" />
            <span>AI-Powered Brand Compliance Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Brand&apos;s Last Line
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              of Defense Before Publish
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Sentinel catches factual errors, tone violations, and compliance
            gaps in your marketing copy&nbsp;&mdash; grounded in your
            brand&apos;s own truth, not AI&nbsp;hallucinations.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Start Reviewing Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white transition-all"
            >
              See How It Works
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
            {[
              { icon: ScanSearch, label: "Grounded AI Citations" },
              { icon: Accessibility, label: "WCAG 2.1 AA" },
              { icon: Lock, label: "SHA-256 Audit Trail" },
              { icon: ShieldCheck, label: "Zero Hallucination Guarantee" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-amber-500/70" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── LOGOS / TRUST BAR ────────────────── */}
      <section className="py-12 border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-gray-600 uppercase tracking-widest mb-8">
            Trusted by brand teams at innovative companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Acme Corp", "CloudBase", "NovaTech", "UrbanBrew", "Meridian", "Stellarion"].map(
              (name) => (
                <span
                  key={name}
                  className="text-xl font-bold tracking-wide text-gray-700 select-none"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ────────────────── FEATURES GRID ────────────────── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Features</SectionLabel>
            <SectionTitle>Everything Your Brand Team Needs</SectionTitle>
            <SectionSub>
              Six pillars of brand compliance, working in concert so nothing
              slips through.
            </SectionSub>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ScanSearch,
                title: "Grounded Claim Verification",
                desc: "Every AI finding cites a verified fact or rule ID from your knowledge base. No unsourced opinions, ever.",
              },
              {
                icon: FileText,
                title: "Deterministic Terminology Enforcement",
                desc: "Word-boundary scanning catches banned terms with zero false negatives. Instant, rule-based, and exhaustive.",
              },
              {
                icon: Accessibility,
                title: "WCAG 2.1 AA Accessibility Checker",
                desc: "Real-time contrast ratio calculation and alt-text validation ensure every asset meets accessibility standards.",
              },
              {
                icon: Link2,
                title: "Tamper-Evident Audit Trail",
                desc: "SHA-256 hash-chained compliance records that detect retroactive tampering. Every change is permanent.",
              },
              {
                icon: Users,
                title: "Human-in-the-Loop Workflow",
                desc: "Creators accept, edit, reject, or dispute findings before manager approval. Your voice stays intact.",
              },
              {
                icon: Lightbulb,
                title: "Guideline-Gap Intelligence",
                desc: "Automatically detects ambiguous rules from dispute patterns and proposes refinements to your guidelines.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-gray-800/60 bg-gray-900/50 p-8 hover:border-amber-500/30 transition-all duration-300"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section
        id="how-it-works"
        className="py-24 sm:py-32 bg-gray-900/40 border-y border-gray-800/50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Process</SectionLabel>
            <SectionTitle>From Draft to Approved in Six Steps</SectionTitle>
            <SectionSub>
              A streamlined pipeline that keeps creators in control while
              ensuring nothing ships out of compliance.
            </SectionSub>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                num: 1,
                title: "Upload Guidelines",
                desc: "Upload your brand guidelines as PDF, DOCX, or enter them manually. Sentinel extracts and indexes every rule.",
              },
              {
                icon: PenLine,
                num: 2,
                title: "Paste Your Copy",
                desc: "Paste or type marketing copy into the review studio. Supports any text-based content format.",
              },
              {
                icon: Cpu,
                num: 3,
                title: "Parallel Compliance Checks",
                desc: "Sentinel runs deterministic rule checks and AI-powered analysis simultaneously for speed and accuracy.",
              },
              {
                icon: ClipboardCheck,
                num: 4,
                title: "Review Findings",
                desc: "Explore interactive findings with grounded citations and suggested fixes, all linked to specific rules.",
              },
              {
                icon: MessageSquare,
                num: 5,
                title: "Respond to Each Finding",
                desc: "Accept, edit, or dispute each finding. Your creative voice stays intact throughout the process.",
              },
              {
                icon: Send,
                num: 6,
                title: "Submit for Approval",
                desc: "Submit for manager approval with full version diff and a tamper-evident audit trail attached.",
              },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="relative flex gap-5 group">
                {/* Number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-amber-500/30 bg-amber-500/5 flex items-center justify-center text-amber-500 font-bold text-lg group-hover:border-amber-500/60 group-hover:bg-amber-500/10 transition-all">
                  {num}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-amber-500/60" />
                    <h3 className="font-semibold text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── COMPLIANCE SCORE PREVIEW ────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Analytics</SectionLabel>
            <SectionTitle>Real-Time Brand Compliance Scoring</SectionTitle>
            <SectionSub>
              Every review generates a 0&ndash;100 compliance score with
              per-category breakdowns, letting your team track brand health
              over time.
            </SectionSub>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Score Gauge */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  {/* Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-800"
                    strokeWidth="10"
                  />
                  {/* Progress — 94% of circumference */}
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
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-white">94</span>
                  <span className="text-sm text-gray-500 -mt-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-5">
              {[
                { label: "Tone", pct: 100 },
                { label: "Terminology", pct: 88 },
                { label: "Claims", pct: 92 },
                { label: "Accessibility", pct: 100 },
                { label: "Messaging", pct: 96 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{label}</span>
                    <span className="text-amber-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── PRICING ────────────────── */}
      <section
        id="pricing"
        className="py-24 sm:py-32 bg-gray-900/40 border-y border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <SectionTitle>Simple, Transparent Pricing</SectionTitle>
            <SectionSub>
              Start free, upgrade when you&apos;re ready. No hidden fees, no
              surprises.
            </SectionSub>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <PricingCard
              title="Starter"
              price="Free"
              desc="For individuals exploring brand compliance."
              features={[
                "50 reviews / month",
                "1 workspace",
                "Deterministic checks only",
                "Community support",
              ]}
              cta="Get Started Free"
              to="/app"
            />

            {/* Pro */}
            <PricingCard
              title="Pro"
              price="$49"
              period="/mo"
              desc="For growing brand teams that need AI power."
              features={[
                "Unlimited reviews",
                "5 workspaces",
                "Full AI + Deterministic",
                "Gemini-powered claim verification",
                "Priority support",
                "Guideline-gap detector",
              ]}
              cta="Start Pro Trial"
              to="/app"
              highlighted
            />

            {/* Enterprise */}
            <PricingCard
              title="Enterprise"
              price="Custom"
              desc="For organizations with complex compliance needs."
              features={[
                "Unlimited everything",
                "Custom AI models",
                "SSO & SAML",
                "Dedicated success manager",
                "SLA guarantee",
                "Custom integrations",
              ]}
              cta="Contact Sales"
              to="/contact"
            />
          </div>
        </div>
      </section>

      {/* ────────────────── CTA SECTION ────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-amber-500/8 blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Stop Publishing
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Non-Compliant Content
            </span>
          </h2>
          <p className="mt-5 text-lg text-gray-400">
            Join brand teams who trust Sentinel to catch what humans miss.
          </p>
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 mt-10 px-10 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            Start Free Review
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer id="contact" className="border-t border-gray-800/60 bg-gray-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
                <span className="text-base font-extrabold tracking-wider text-white">
                  SENTINEL
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered brand compliance
                <br />
                for modern marketing teams.
              </p>
            </div>

            {/* Link columns */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Changelog", "Roadmap"],
              },
              {
                title: "Resources",
                links: ["Documentation", "API Reference", "Blog", "Status"],
              },
              {
                title: "Company",
                links: ["About", "Contact", "Careers", "Press"],
              },
              {
                title: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Service",
                  "Security",
                  "GDPR",
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; 2026 Sentinel. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-600">
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

/* ───────────────────────────── Pricing Card ───────────────────────────── */

function PricingCard({ title, price, period, desc, features, cta, to, highlighted }) {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${
        highlighted
          ? "border-2 border-amber-500/50 bg-gray-900 shadow-2xl shadow-amber-500/10 scale-[1.03] z-10"
          : "border border-gray-800/60 bg-gray-900/50"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold text-gray-950 uppercase tracking-wide">
            <Star className="h-3 w-3" /> Most Popular
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-white">{price}</span>
        {period && <span className="text-gray-500 text-base">{period}</span>}
      </div>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>

      <ul className="mt-8 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to={to}
        className={`mt-8 block text-center px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
          highlighted
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
            : "border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
