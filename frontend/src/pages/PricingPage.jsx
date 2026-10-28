import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import ScrollReveal from '../components/ScrollReveal';
import {
  Check,
  X,
  ChevronRight,
  Shield,
  Zap,
  Building2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Star,
  ShieldCheck
} from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    priceLabel: 'Free forever',
    description: 'Perfect for small teams getting started with brand compliance',
    cta: 'Get Started Free',
    ctaLink: '/app',
    highlighted: false,
    features: [
      { text: '50 reviews per month', included: true },
      { text: '1 brand workspace', included: true },
      { text: 'Deterministic terminology checks', included: true },
      { text: 'WCAG 2.1 AA accessibility checks', included: true },
      { text: 'Flesch readability scoring', included: true },
      { text: 'Basic compliance scoring', included: true },
      { text: 'AI-powered claim verification', included: false },
      { text: 'Gemini tone analysis', included: false },
      { text: 'Guideline-gap detector', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Professional',
    icon: Sparkles,
    monthlyPrice: 49,
    annualPrice: 39,
    badge: 'Most Popular',
    description: 'For growing brand teams that need AI-powered compliance',
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/app',
    highlighted: true,
    features: [
      { text: 'Unlimited reviews', included: true },
      { text: '5 brand workspaces', included: true },
      { text: 'Everything in Starter', included: true },
      { text: 'Gemini AI claim verification', included: true },
      { text: 'Tone & messaging analysis', included: true },
      { text: 'Intent Guard on suggestions', included: true },
      { text: 'PII auto-redaction', included: true },
      { text: 'Guideline-gap detector', included: true },
      { text: 'PDF/DOCX guideline import', included: true },
      { text: 'Priority email support', included: true },
    ],
  },
  {
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: 'Custom',
    priceSubLabel: "Let's talk",
    description: 'For organizations with advanced security and compliance needs',
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlighted: false,
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Unlimited workspaces', included: true },
      { text: 'Custom AI model integration', included: true },
      { text: 'SSO & SAML authentication', included: true },
      { text: 'Role-based access control (RBAC)', included: true },
      { text: 'Dedicated customer success manager', included: true },
      { text: 'Custom SLA guarantee', included: true },
      { text: 'API access & webhooks', included: true },
      { text: 'On-premise deployment option', included: true },
      { text: 'SOC 2 compliance report', included: true },
    ],
  },
];

const comparisonCategories = [
  {
    name: 'Core Features',
    rows: [
      { feature: 'Monthly reviews', starter: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Brand workspaces', starter: '1', pro: '5', enterprise: 'Unlimited' },
      { feature: 'Terminology checks', starter: true, pro: true, enterprise: true },
      { feature: 'Accessibility checks (WCAG 2.1 AA)', starter: true, pro: true, enterprise: true },
      { feature: 'Flesch readability scoring', starter: true, pro: true, enterprise: true },
      { feature: 'Compliance scoring', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
      { feature: 'PDF/DOCX guideline import', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'AI Capabilities',
    rows: [
      { feature: 'AI-powered claim verification', starter: false, pro: true, enterprise: true },
      { feature: 'Gemini tone analysis', starter: false, pro: true, enterprise: true },
      { feature: 'Intent Guard on suggestions', starter: false, pro: true, enterprise: true },
      { feature: 'PII auto-redaction', starter: false, pro: true, enterprise: true },
      { feature: 'Guideline-gap detector', starter: false, pro: true, enterprise: true },
      { feature: 'Custom AI model integration', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    name: 'Security & Compliance',
    rows: [
      { feature: 'SSO & SAML authentication', starter: false, pro: false, enterprise: true },
      { feature: 'Role-based access control (RBAC)', starter: false, pro: false, enterprise: true },
      { feature: 'On-premise deployment', starter: false, pro: false, enterprise: true },
      { feature: 'SOC 2 compliance report', starter: false, pro: false, enterprise: true },
      { feature: 'API access & webhooks', starter: false, pro: false, enterprise: true },
      { feature: 'Custom SLA guarantee', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    name: 'Support',
    rows: [
      { feature: 'Community support', starter: true, pro: true, enterprise: true },
      { feature: 'Priority email support', starter: false, pro: true, enterprise: true },
      { feature: 'Dedicated success manager', starter: false, pro: false, enterprise: true },
      { feature: 'Custom onboarding', starter: false, pro: false, enterprise: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer:
      'Yes! You can upgrade or downgrade your plan instantly at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards including Visa, Mastercard, and American Express. For Enterprise plans, we also support invoicing with NET-30 terms.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer:
      'Yes! The Professional plan includes a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    question: 'Do you offer discounts for nonprofits?',
    answer:
      'Yes, we offer special pricing for registered nonprofit organizations. Contact our sales team to learn more about our nonprofit program.',
  },
  {
    question: 'What happens when I hit the review limit?',
    answer:
      "You'll receive a notification when you're approaching your monthly review limit. Once the limit is reached, reviews will pause until the next billing cycle starts or you upgrade to a higher plan.",
  },
];

function ComparisonCellValue({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-slate-600">
        <X className="w-4 h-4" />
      </span>
    );
  }
  return <span className="text-xs font-semibold text-slate-200">{value}</span>;
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold text-white">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-amber-400 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4 pt-1 border-t border-white/5">
          <p className="text-slate-300 text-xs leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTier, setModalTier] = useState('pro');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-100">
      {/* Breadcrumb & Auth Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sentinel</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 font-medium">Pricing</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs glass-pill px-3 py-1 rounded-xl">
                  <span className="text-slate-400">Hello,</span>
                  <span className="font-bold text-amber-400">{user.name || user.email.split('@')[0]}</span>
                </div>
                <Link to="/app" className="glass-button-primary px-4 py-1.5 font-bold text-xs rounded-xl text-gray-950">
                  Launch App &rarr;
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="glass-button-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="glass-button-primary px-4 py-1.5 font-bold text-xs rounded-xl text-gray-950">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <ScrollReveal animation="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Sentinel Flexible Licensing</span>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={180}>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Start free. Scale when you&apos;re ready. No hidden fees or unexpected overage charges.
          </p>
        </ScrollReveal>

        {/* Billing Toggle */}
        <ScrollReveal animation="fade-up" delay={240}>
          <div className="inline-flex items-center gap-2 glass-panel p-1.5 rounded-full border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isAnnual
                    ? 'bg-black/20 text-gray-950'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isHighlighted = plan.highlighted;

            return (
              <ScrollReveal
                key={plan.name}
                animation={isHighlighted ? 'scale-up' : 'fade-up'}
                delay={index * 120}
              >
                <div
                  className={`h-full p-8 rounded-3xl flex flex-col justify-between relative ${
                    isHighlighted
                      ? 'glass-card-glow-amber scale-[1.03] z-10'
                      : 'glass-card'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                        <Star className="w-3.5 h-3.5 fill-gray-950" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          isHighlighted
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/20'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {price !== null ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-5xl font-black tracking-tight text-white">
                            ${price}
                          </span>
                          <span className="text-slate-400 text-xs font-semibold">/month</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-5xl font-black tracking-tight text-white">Custom</span>
                          <p className="text-amber-400 text-xs font-bold mt-1">
                            {plan.priceSubLabel}
                          </p>
                        </div>
                      )}
                      {plan.priceLabel && price === 0 && (
                        <p className="text-emerald-400 text-xs font-bold mt-1">
                          {plan.priceLabel}
                        </p>
                      )}
                      {isAnnual && price !== null && price > 0 && (
                        <p className="text-emerald-400 text-[11px] font-semibold mt-1">
                          Billed annually at ${price * 12}/year
                        </p>
                      )}
                    </div>

                    <p className="text-slate-300/80 text-xs leading-relaxed mb-6">
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    {plan.name === 'Enterprise' ? (
                      <Link
                        to="/contact"
                        className="glass-button-secondary block w-full text-center py-3 px-6 rounded-2xl font-bold text-xs text-slate-200 hover:text-white transition-all mb-8"
                      >
                        Contact Sales
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setModalTier(plan.name.toLowerCase());
                          setModalOpen(true);
                        }}
                        className={`block w-full text-center py-3 px-6 rounded-2xl font-bold text-xs transition-all mb-8 cursor-pointer ${
                          isHighlighted
                            ? 'glass-button-primary text-gray-950 shadow-xl shadow-amber-500/30'
                            : 'glass-button-secondary text-slate-200 hover:text-white'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    )}

                    {/* Features List */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Included capabilities
                      </p>
                      {plan.features.map((feature) => (
                        <div key={feature.text} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-amber-400" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-3 h-3 text-slate-600" />
                            </div>
                          )}
                          <span
                            className={`text-xs ${
                              feature.included ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ScrollReveal animation="fade-up" className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-white">Compare Plans in Detail</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Exhaustive breakdown of capabilities across all tiers to help you select the ideal match.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="scale-up">
          <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 py-5 px-6 w-[40%]">
                    Feature
                  </th>
                  <th className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-5 px-6 w-[20%]">
                    Starter
                  </th>
                  <th className="text-center text-xs font-bold uppercase tracking-wider py-5 px-6 w-[20%] text-amber-400">
                    Professional
                  </th>
                  <th className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-5 px-6 w-[20%]">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category) => (
                  <tr key={`cat-${category.name}`} className="contents">
                    <td
                      colSpan={4}
                      className="py-3 px-6 bg-white/[0.03] border-b border-white/5"
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90">
                        {category.name}
                      </span>
                    </td>
                    {category.rows.map((row) => (
                      <tr
                        key={row.feature}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-6 text-xs text-slate-300 font-medium">{row.feature}</td>
                        <td className="py-3.5 px-6 text-center">
                          <ComparisonCellValue value={row.starter} />
                        </td>
                        <td className="py-3.5 px-6 text-center bg-amber-500/[0.04]">
                          <ComparisonCellValue value={row.pro} />
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <ComparisonCellValue value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ScrollReveal animation="fade-up" className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-amber-300 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs">
            Everything you need to know about Sentinel plans and billing.
          </p>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.question} animation="fade-up" delay={i * 60}>
              <FAQItem question={faq.question} answer={faq.answer} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ScrollReveal animation="scale-up">
          <div className="glass-panel p-10 sm:p-12 rounded-3xl border border-amber-500/30 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Still have questions?</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto mb-8">
                Our solutions team is ready to design a custom compliance plan for your brand architecture.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="glass-button-primary px-7 py-3 rounded-2xl text-gray-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <span>Contact Solutions Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/app"
                  className="glass-button-secondary px-7 py-3 rounded-2xl text-slate-200 font-semibold text-xs hover:text-white"
                >
                  Test Review Studio Now
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Subscription & Customer Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="register"
        selectedPlan={modalTier}
        onSuccess={() => {
          navigate('/app');
        }}
      />
    </div>
  );
}
