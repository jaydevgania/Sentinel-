import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScrollReveal from "../components/ScrollReveal";
import {
  Mail,
  Briefcase,
  LifeBuoy,
  MapPin,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  CalendarClock,
  MessageSquare,
  ChevronDown,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

const TwitterIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const GithubIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
);
const LinkedinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);

const contactCards = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@sentinel.dev",
    href: "mailto:hello@sentinel.dev",
  },
  {
    icon: Briefcase,
    label: "Sales",
    value: "sales@sentinel.dev",
    href: "mailto:sales@sentinel.dev",
  },
  {
    icon: LifeBuoy,
    label: "Support",
    value: "support@sentinel.dev",
    href: "mailto:support@sentinel.dev",
  },
];

const socialLinks = [
  { icon: TwitterIcon, label: "Twitter / X", href: "#" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: GithubIcon, label: "GitHub", href: "#" },
];

const teamSizeOptions = ["1-5", "6-20", "21-50", "51-200", "200+"];

const subjectOptions = [
  "General Inquiry",
  "Enterprise Plan",
  "Technical Support",
  "Partnership",
  "Press / Media",
];

const faqs = [
  {
    q: "How quickly do you respond?",
    a: "Within 24 hours on business days.",
  },
  {
    q: "Do you offer custom enterprise plans?",
    a: "Yes, contact our sales team for tailored pricing.",
  },
  {
    q: "Can I try Sentinel before committing?",
    a: "Absolutely. Our free tier includes 50 reviews per month with full deterministic checks.",
  },
];

const initialForm = {
  fullName: "",
  email: "",
  company: "",
  teamSize: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      /* graceful fallback for demo */
    } finally {
      setLoading(false);
      setSubmitted(true);
      setForm(initialForm);
    }
  };

  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen text-slate-100">
      {/* ── Breadcrumb & Auth ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Link to="/" className="transition hover:text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sentinel</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-200 font-semibold">Contact Solutions</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs glass-pill px-3 py-1 rounded-xl">
                  <span className="text-slate-400">Hello,</span>
                  <span className="font-bold text-amber-400">{user.name || user.email.split('@')[0]}</span>
                </div>
                <Link to="/app" className="glass-button-primary px-4 py-1.5 text-xs font-bold rounded-xl text-gray-950">
                  Launch App &rarr;
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="glass-button-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="glass-button-primary px-4 py-1.5 text-xs font-bold rounded-xl text-gray-950">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ── Page header ────────────────────────────────────────────── */}
      <header className="mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <ScrollReveal animation="fade-up">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Contact&nbsp;
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Our Solutions Team
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300/80">
            Have a question, need an architecture walkthrough, or want to discuss enterprise features? We&rsquo;re here to help.
          </p>
        </ScrollReveal>
      </header>

      {/* ── Two-column layout ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <ScrollReveal animation="slide-left" className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="text-xl font-bold text-white">
                Get in Touch
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">
                Whether you&rsquo;re exploring Sentinel for your brand team or require private VPC deployment, our engineers respond fast.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-3">
              {contactCards.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 rounded-2xl glass-card p-4 transition-all"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p className="text-xs font-semibold text-slate-200">
                      {value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Office address */}
            <div className="flex items-start gap-4 rounded-2xl glass-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Global Hub
                </p>
                <p className="text-xs font-semibold text-slate-200">
                  Sentinel Systems HQ, Mumbai, India
                </p>
              </div>
            </div>

            {/* Book a Demo card */}
            <div className="rounded-3xl glass-card-glow-amber p-6">
              <div className="mb-2.5 flex items-center gap-2 text-amber-400">
                <CalendarClock className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Interactive Guided Demo</h3>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-300">
                See Sentinel analyze your actual marketing guidelines live with real-time scoring and compliance citations.
              </p>
              <Link
                to="/app"
                className="glass-button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-gray-950 shadow-lg shadow-amber-500/25 transition"
              >
                <span>Launch Interactive Demo</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* ── RIGHT COLUMN — Contact Form ──────────────────────── */}
          <ScrollReveal animation="slide-right" className="lg:col-span-3">
            <div className="rounded-3xl glass-panel p-6 sm:p-9 border border-white/10 shadow-2xl">
              <div className="mb-6 flex items-center gap-2.5 text-white">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold">Send Us a Direct Message</h2>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Message Sent!
                  </h3>
                  <p className="mt-2 max-w-sm text-gray-400">
                    Thanks for reaching out. We&rsquo;ll get back to you
                    within 24 hours on business days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-medium text-amber-400 transition hover:text-amber-300"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Jane Doe"
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-slate-300"
                    >
                      Work Email <span className="text-amber-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      placeholder="jane@company.com"
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Company & Team Size — side by side */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="company"
                        className="mb-1.5 block text-xs font-semibold text-slate-300"
                      >
                        Company Name
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={form.company}
                        onChange={set("company")}
                        placeholder="Acme Inc."
                        className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="teamSize"
                        className="mb-1.5 block text-xs font-semibold text-slate-300"
                      >
                        Team Size
                      </label>
                      <div className="relative">
                        <select
                          id="teamSize"
                          value={form.teamSize}
                          onChange={set("teamSize")}
                          className="glass-input w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-xs text-white outline-none"
                        >
                          <option value="" className="bg-[#0b0f19]">Select&hellip;</option>
                          {teamSizeOptions.map((o) => (
                            <option key={o} value={o} className="bg-[#0b0f19]">
                              {o}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-xs font-semibold text-slate-300"
                    >
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={set("subject")}
                        className="glass-input w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-xs text-white outline-none"
                      >
                        <option value="" className="bg-[#0b0f19]">Select a topic&hellip;</option>
                        {subjectOptions.map((o) => (
                          <option key={o} value={o} className="bg-[#0b0f19]">
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-xs font-semibold text-slate-300"
                    >
                      Message <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Tell us about your brand compliance guidelines or enterprise requirements&hellip;"
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-button-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3 text-xs font-bold text-gray-950 shadow-xl shadow-amber-500/25 transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting Inquiry&hellip;</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ mini-section ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" className="mb-6 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">
            Quick Answers
          </h2>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {faqs.map(({ q, a }, idx) => (
            <ScrollReveal key={q} animation="fade-up" delay={idx * 80}>
              <div
                className="rounded-2xl glass-card p-5 h-full flex flex-col justify-between"
              >
                <h3 className="text-xs font-bold text-white mb-2">{q}</h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  {a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
