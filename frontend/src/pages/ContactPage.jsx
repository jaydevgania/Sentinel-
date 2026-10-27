import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Breadcrumb & Auth ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Link to="/" className="transition hover:text-amber-400 font-medium">
              Sentinel
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-200">Contact</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-800">
                  <span className="text-gray-400">Hello,</span>
                  <span className="font-bold text-amber-400">{user.name || user.email.split('@')[0]}</span>
                </div>
                <Link to="/app" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition">
                  Launch App &rarr;
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-xs text-gray-400 hover:text-white transition font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ── Page header ────────────────────────────────────────────── */}
      <header className="mx-auto max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Contact&nbsp;
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Us
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-400">
          Have a question, need a demo, or want to discuss enterprise
          features? We&rsquo;re here to help.
        </p>
      </header>

      {/* ── Two-column layout ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="space-y-10 lg:col-span-2">
            {/* Intro */}
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Get in Touch
              </h2>
              <p className="mt-2 text-gray-400">
                Whether you&rsquo;re exploring Sentinel for your brand team
                or need enterprise features, we&rsquo;d love to hear from
                you.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-4">
              {contactCards.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-amber-500/40 hover:bg-gray-900"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-200">
                      {value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Office address */}
            <div className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Office
                </p>
                <p className="text-sm font-medium text-gray-200">
                  Sentinel HQ, Mumbai, India
                </p>
              </div>
            </div>

            {/* Social links */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900/60 text-gray-400 transition hover:border-amber-500/40 hover:text-amber-400"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Book a Demo card */}
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-600/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-amber-400">
                <CalendarClock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Book a Demo</h3>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-gray-400">
                See Sentinel in action with your own brand guidelines. Our
                team will walk you through a personalized demo.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
              >
                Schedule Demo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Contact Form ──────────────────────── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-semibold">Send Us a Message</h2>
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
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
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
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Company & Team Size — side by side */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="company"
                        className="mb-1.5 block text-sm font-medium text-gray-300"
                      >
                        Company Name
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={form.company}
                        onChange={set("company")}
                        placeholder="Acme Inc."
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="teamSize"
                        className="mb-1.5 block text-sm font-medium text-gray-300"
                      >
                        Team Size
                      </label>
                      <div className="relative">
                        <select
                          id="teamSize"
                          value={form.teamSize}
                          onChange={set("teamSize")}
                          className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 pr-10 text-sm text-gray-100 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                        >
                          <option value="">Select&hellip;</option>
                          {teamSizeOptions.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={set("subject")}
                        className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 pr-10 text-sm text-gray-100 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                      >
                        <option value="">Select a topic&hellip;</option>
                        {subjectOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      Message <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Tell us how we can help&hellip;"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-gray-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ mini-section ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 transition hover:border-amber-500/30"
            >
              <h3 className="text-sm font-semibold text-gray-200">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
