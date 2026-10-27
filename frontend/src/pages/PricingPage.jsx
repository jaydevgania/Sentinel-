import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
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
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15">
        <Check className="w-4 h-4 text-amber-400" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800">
        <X className="w-4 h-4 text-gray-600" />
      </span>
    );
  }
  return <span className="text-sm font-medium text-gray-200">{value}</span>;
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden transition-colors hover:border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <span className="text-base font-medium text-gray-100">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTier, setModalTier] = useState('pro');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-200">Pricing</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Sentinel Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Simple, Transparent{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Start free. Scale when you&apos;re ready. No hidden fees, no surprises.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-full px-2 py-2">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              !isAnnual
                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/25'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              isAnnual
                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/25'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Annual
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isAnnual
                  ? 'bg-gray-950/20 text-gray-950'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  isHighlighted
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/[0.08] to-gray-900/80 scale-[1.02] shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/30">
                      <Star className="w-3.5 h-3.5" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isHighlighted
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight">
                          ${price}
                        </span>
                        <span className="text-gray-400 text-sm">/month</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-5xl font-bold tracking-tight">Custom</span>
                        <p className="text-amber-400 text-sm font-medium mt-1">
                          {plan.priceSubLabel}
                        </p>
                      </div>
                    )}
                    {plan.priceLabel && price === 0 && (
                      <p className="text-emerald-400 text-sm font-medium mt-1">
                        {plan.priceLabel}
                      </p>
                    )}
                    {isAnnual && price !== null && price > 0 && (
                      <p className="text-emerald-400 text-xs mt-1">
                        Billed annually at ${price * 12}/year
                      </p>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* CTA Button */}
                {plan.name === 'Enterprise' ? (
                  <Link
                    to="/contact"
                    className="block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 mb-8 bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
                  >
                    Contact Sales
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setModalTier(plan.name.toLowerCase());
                      setModalOpen(true);
                    }}
                    className={`block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 mb-8 cursor-pointer ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}

                {/* Features List */}
                <div className="space-y-3 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                    What&apos;s included
                  </p>
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Compare Plans in Detail</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A detailed breakdown of features across all plans to help you choose the right one.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="w-full min-w-[640px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="text-left text-sm font-medium text-gray-400 py-5 px-6 w-[40%]">
                  Feature
                </th>
                <th className="text-center text-sm font-medium text-gray-400 py-5 px-6 w-[20%]">
                  Starter
                </th>
                <th className="text-center text-sm font-medium py-5 px-6 w-[20%]">
                  <span className="text-amber-400 font-semibold">Professional</span>
                </th>
                <th className="text-center text-sm font-medium text-gray-400 py-5 px-6 w-[20%]">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonCategories.map((category) => (
                <>
                  <tr key={`cat-${category.name}`} className="border-b border-gray-800/60">
                    <td
                      colSpan={4}
                      className="py-4 px-6 bg-gray-900/40"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-500/80">
                        {category.name}
                      </span>
                    </td>
                  </tr>
                  {category.rows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-gray-800/40 hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-300">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        <ComparisonCellValue value={row.starter} />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-500/[0.03]">
                        <ComparisonCellValue value={row.pro} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <ComparisonCellValue value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900 text-gray-400 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">
            Everything you need to know about Sentinel pricing and plans.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-amber-500/[0.08] px-8 py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Our team is ready to help you find the perfect plan for your organization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-semibold text-sm hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 transition-all"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 text-gray-200 font-semibold text-sm hover:bg-gray-700 border border-gray-700 transition-all"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
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
