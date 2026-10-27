import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Database,
  FileUp,
  Cpu,
  Search,
  Users,
  ShieldCheck,
  BookOpen,
  Send,
  Zap,
  MessageSquare,
  UserCheck,
  Lock,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  GitCompare,
  Hash,
  Palette,
  FileText,
  Image,
  ScanEye,
  BrainCircuit,
  ShieldAlert,
  ClipboardCheck,
  ScrollText,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Database,
    title: 'Set Up Your Brand Knowledge Base',
    description:
      'Upload your existing brand guidelines in PDF or DOCX format and Sentinel automatically parses them into enforceable rules. Define terminology preferences by mapping banned terms to their approved alternatives, ensuring every piece of content uses consistent language. Register verified facts with source citations so the AI engine can ground-check marketing claims against your own data. Finally, configure your brand color palette and upload approved visual assets to enable automated contrast and visual compliance checks.',
    uiDescription:
      'You see a tabbed dashboard with sections for Guidelines, Terminology, Facts, and Assets. Each tab lets you drag-and-drop files, add entries via forms, and preview the parsed rules before activating them.',
    highlights: [
      { icon: FileText, label: 'PDF / DOCX upload' },
      { icon: BookOpen, label: 'Terminology rules' },
      { icon: CheckCircle2, label: 'Fact registry' },
      { icon: Palette, label: 'Color palette config' },
    ],
  },
  {
    number: 2,
    icon: Send,
    title: 'Submit Content for Review',
    description:
      'Paste any marketing copy, press releases, social media captions, or internal memos directly into the Sentinel editor. Select the target distribution channel such as Instagram, Press Release, Website, or Internal, and specify the campaign purpose so Sentinel can apply channel-specific rules like character limits and tone expectations. Optionally attach banner images or creative assets so the visual compliance engine can verify color contrast and brand mark placement.',
    uiDescription:
      'You see a rich-text editor with a channel selector dropdown, a campaign tag input, and a drag-and-drop zone for image attachments. A "Submit for Review" button initiates the analysis.',
    highlights: [
      { icon: FileUp, label: 'Paste or upload content' },
      { icon: Hash, label: 'Channel selection' },
      { icon: Image, label: 'Image attachments' },
      { icon: Zap, label: 'One-click submit' },
    ],
  },
  {
    number: 3,
    icon: Cpu,
    title: 'Parallel Compliance Analysis',
    description:
      'Sentinel executes two engines simultaneously for maximum coverage and speed. The Deterministic Pipeline handles terminology word-boundary scanning, WCAG 2.1 AA contrast ratio math, Flesch readability scoring, and exclamation mark frequency rules with zero latency and perfect reproducibility. The Grounded AI Engine, powered by Google Gemini, performs claim extraction and fact verification against your knowledge base, tone classification, competitor mention detection, and intent-guarded suggestions. Before any external AI call, PII such as emails and phone numbers is automatically redacted by the built-in PII Redactor.',
    uiDescription:
      'You see a split progress indicator showing both engines running in parallel. A real-time log stream displays each check as it completes, with the deterministic results appearing almost instantly while AI analysis follows shortly after.',
    highlights: [
      { icon: ScanEye, label: 'Deterministic pipeline' },
      { icon: BrainCircuit, label: 'Grounded AI engine' },
      { icon: ShieldAlert, label: 'PII auto-redaction' },
      { icon: Zap, label: 'Parallel execution' },
    ],
  },
  {
    number: 4,
    icon: Search,
    title: 'Interactive Findings Review',
    description:
      'Each compliance finding appears as an interactive card with a color-coded severity badge indicating High, Medium, or Low impact. The exact text span is highlighted directly in your content so you can see precisely where the issue occurs. Every finding includes a plain-language explanation of why it was flagged and cites the specific Rule ID or Fact ID from your knowledge base, ensuring transparency and eliminating black-box AI opinions. A minimal suggested edit is provided that preserves the original author\'s intent while resolving the compliance issue.',
    uiDescription:
      'You see your content displayed with inline highlights in red, amber, and blue for different severity levels. Clicking a highlight opens a detail panel showing the rule citation, explanation, and a one-click "Apply Fix" option.',
    highlights: [
      { icon: AlertTriangle, label: 'Severity badges' },
      { icon: Eye, label: 'Text span highlighting' },
      { icon: BookOpen, label: 'Rule ID citations' },
      { icon: CheckCircle2, label: 'Suggested edits' },
    ],
  },
  {
    number: 5,
    icon: Users,
    title: 'Human Decision & Collaboration',
    description:
      'For every finding, creators choose one of four actions. Accept applies the suggested fix with a single click. Custom Edit opens an inline editor so the creator can write their own rewording. Reject dismisses the finding with an optional reason. Dispute flags the underlying rule for guideline refinement, sending it to the brand team for review. All decisions are logged with timestamps and actor IDs, creating a transparent record of who decided what and when.',
    uiDescription:
      'You see four action buttons beneath each finding card: a green Accept, a blue Edit, a gray Reject, and an amber Dispute. A decision timeline on the sidebar shows every action taken on the current document.',
    highlights: [
      { icon: CheckCircle2, label: 'Accept fix' },
      { icon: MessageSquare, label: 'Custom edit' },
      { icon: XCircle, label: 'Reject finding' },
      { icon: Flag, label: 'Dispute rule' },
    ],
  },
  {
    number: 6,
    icon: ShieldCheck,
    title: 'Manager Approval & Audit Trail',
    description:
      'Managers access a queue of pending reviews sorted by compliance score, making it easy to prioritize the most critical content first. A side-by-side diff view shows the original copy alongside the revised version so managers can evaluate every change in context. Managers approve content or request further changes with inline notes. Every single action across the entire workflow is recorded in a tamper-evident SHA-256 hash chain, where each entry includes the previous entry\'s hash, cryptographically proving that no past decision was altered or deleted.',
    uiDescription:
      'You see a review queue with compliance score bars, a split-pane diff viewer with additions in green and deletions in red, and a collapsible audit log showing the full hash chain for each document.',
    highlights: [
      { icon: ClipboardCheck, label: 'Approval queue' },
      { icon: GitCompare, label: 'Side-by-side diff' },
      { icon: Lock, label: 'SHA-256 hash chain' },
      { icon: ScrollText, label: 'Tamper-evident log' },
    ],
  },
];

const architectureNodes = [
  { label: 'Content Input', color: 'bg-blue-500/20 border-blue-500/50 text-blue-300' },
  { label: 'PII Redactor', color: 'bg-red-500/20 border-red-500/50 text-red-300' },
  {
    label: 'Deterministic Engine + AI Engine',
    color: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    wide: true,
  },
  { label: 'Grounding Validator', color: 'bg-purple-500/20 border-purple-500/50 text-purple-300' },
  { label: 'Compliance Scorer', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' },
  { label: 'Interactive Studio', color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' },
  { label: 'Audit Logger', color: 'bg-orange-500/20 border-orange-500/50 text-orange-300' },
];

const faqs = [
  {
    question: 'What happens if the AI is unavailable?',
    answer:
      'Sentinel\'s deterministic pipeline operates entirely on-device with zero external dependencies. If the AI engine is unreachable, the deterministic fallback automatically kicks in, covering terminology scanning, readability scoring, contrast checks, and structural rules. This guarantees 100% uptime for core compliance checks regardless of network conditions.',
  },
  {
    question: 'Is my content sent to external AI models?',
    answer:
      'Before any content reaches an external AI model, Sentinel\'s PII Redactor strips all personally identifiable information including email addresses, phone numbers, and other sensitive data. You can also run in fully offline deterministic-only mode, which never makes any external calls while still providing comprehensive rule-based compliance analysis.',
  },
  {
    question: 'Can I customize the brand rules?',
    answer:
      'Absolutely. Sentinel provides full CRUD (Create, Read, Update, Delete) capabilities for every aspect of your brand knowledge base. You can add, edit, or remove terminology rules, approved facts, brand guidelines, and visual assets at any time. Changes take effect immediately for all subsequent reviews.',
  },
  {
    question: 'What file formats can I import?',
    answer:
      'Sentinel supports PDF, DOCX, and plain text formats for brand guideline imports. The parser extracts structured rules from these documents automatically, and you can review and refine the parsed output before activating the rules in your knowledge base.',
  },
  {
    question: 'How does the audit trail work?',
    answer:
      'Every action in Sentinel is recorded as an entry in a sequential hash chain. Each entry is hashed with SHA-256 and includes the hash of the previous entry, creating a cryptographic chain. If any past entry were altered, the chain would break, making tampering immediately detectable during verification.',
  },
  {
    question: 'Can creators approve their own content?',
    answer:
      'No. Sentinel enforces role-based access control with strict separation of duties. Creators can submit content and respond to findings, but only users with the Manager role can approve content for publication. This ensures an independent review step is always part of the compliance workflow.',
  },
];

function StepCard({ step, index }) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <div className="relative">
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full h-12 flex items-center justify-center z-10">
          <div className="w-px h-full bg-gradient-to-b from-amber-500/60 to-amber-500/10" />
          <ArrowDown className="absolute bottom-0 w-4 h-4 text-amber-500/60" />
        </div>
      )}

      <div
        className={`group relative rounded-2xl border border-gray-800 bg-gray-900/70 backdrop-blur-sm p-8 lg:p-10 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 ${
          isEven ? '' : ''
        }`}
      >
        {/* Step number badge */}
        <div className="absolute -top-4 left-8 lg:left-10">
          <div className="flex items-center gap-2 bg-amber-500 text-gray-950 font-bold text-sm px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/25">
            Step {step.number}
          </div>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row gap-8">
          {/* Left: Icon and Title */}
          <div className="lg:w-1/3 flex flex-col items-start">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
              <Icon className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>

            {/* Highlight chips */}
            <div className="flex flex-wrap gap-2">
              {step.highlights.map((h, i) => {
                const HIcon = h.icon;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-800/80 border border-gray-700/50 rounded-full px-3 py-1.5"
                  >
                    <HIcon className="w-3.5 h-3.5 text-amber-500/70" />
                    {h.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Description */}
          <div className="lg:w-2/3 space-y-4">
            <p className="text-gray-300 leading-relaxed">{step.description}</p>

            <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                  What You See
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{step.uiDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureNode({ node, isLast }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-xl border-2 px-6 py-4 text-center font-semibold text-sm ${node.color} ${
          node.wide ? 'min-w-[280px]' : 'min-w-[200px]'
        } transition-transform hover:scale-105`}
      >
        {node.label}
      </div>
      {!isLast && (
        <div className="flex flex-col items-center h-10 justify-center">
          <div className="w-px h-full bg-gray-600" />
          <ArrowDown className="w-4 h-4 text-gray-500 -mt-1" />
        </div>
      )}
    </div>
  );
}

function FAQItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden transition-colors hover:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
      >
        <span className="text-white font-medium pr-4">{faq.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 -mt-1">
          <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Breadcrumb Nav */}
      <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="text-gray-400 hover:text-amber-400 transition-colors font-medium"
          >
            Sentinel
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-amber-400 font-medium">How It Works</span>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">End-to-End Compliance Workflow</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Sentinel
            </span>{' '}
            Works
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From uploading brand guidelines to cryptographically sealed audit trails, Sentinel orchestrates
            a fully transparent compliance pipeline that combines deterministic rule engines with
            grounded AI analysis &mdash; keeping humans in control at every step.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              6 Steps
            </span>
            <span className="text-gray-700">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Dual Engine Architecture
            </span>
            <span className="text-gray-700">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Full Audit Trail
            </span>
          </div>
        </div>
      </section>

      {/* Step-by-Step Flow */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </section>

      {/* Architecture Diagram Section */}
      <section className="border-t border-gray-800/60 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Under the Hood</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A look at the internal architecture that powers every compliance review. Each component
              is modular, auditable, and designed for resilience.
            </p>
          </div>

          {/* Architecture flow diagram */}
          <div className="flex flex-col items-center">
            {architectureNodes.map((node, i) => (
              <ArchitectureNode key={i} node={node} isLast={i === architectureNodes.length - 1} />
            ))}
          </div>

          {/* Dual engine detail */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <ScanEye className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-blue-300">Deterministic Engine</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  Word-boundary terminology scanning
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  WCAG 2.1 AA contrast ratio calculation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  Flesch readability scoring
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  Exclamation mark &amp; punctuation rules
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-300">Grounded AI Engine</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  Claim extraction &amp; fact verification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  Tone classification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  Competitor mention detection
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  Intent-guarded suggestions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-gray-800/60">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">
              Common questions about Sentinel&apos;s architecture, security, and capabilities.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to protect your brand?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                Start enforcing brand compliance in minutes with Sentinel&apos;s automated pipeline.
                No integration required to get started.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
                >
                  Talk to Sales
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
