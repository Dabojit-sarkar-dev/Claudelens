import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  FileCheck,
  Search,
  Database,
  Cpu,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white selection:bg-indigo-500 selection:text-white flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 overflow-hidden">
        {/* Background Glowing Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 text-center space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 shadow-xl shadow-indigo-500/5">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>AI-POWERED CONTRACT RISK PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            The AI engine for contracts, built to audit risks in{" "}
            <span className="gradient-text">seconds.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Upload legal PDFs, audit high-risk clauses automatically, and verify paragraph-aligned citations with zero hallucinations. Powered by Gemini & Groq multi-model LLMs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto shadow-xl shadow-indigo-500/25"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/docs"
              className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto"
            >
              <span>View Architecture & Docs</span>
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Verifiable Paragraph Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Neon Serverless PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Strict Per-User Data Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 border-t border-white/8 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Built for Legal Accuracy & Speed
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Everything you need to audit, review, and evaluate complex contracts automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-card p-6 space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Automated Clause Extraction
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Instantly parses indemnity, termination, governing law, and liability caps from uploaded PDF documents.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 space-y-4 hover:border-violet-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Paragraph Citation Engine
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every AI-generated finding is backed by exact, verified paragraph quotes with page offsets to prevent false claims.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 space-y-4 hover:border-purple-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Gemini & Groq AI Pipeline
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dual LLM orchestration ensures ultra-fast response times and high-precision risk categorization.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-6 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Strict User Data Isolation
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every registered user gets an isolated workspace. Your uploaded contracts and findings are strictly private.
              </p>
            </div>

            {/* Card 5 */}
            <div className="glass-card p-6 space-y-4 hover:border-amber-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Neon Serverless Postgres
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Backed by Neon PostgreSQL for serverless scalability, reliable persistence, and fast indexed queries.
              </p>
            </div>

            {/* Card 6 */}
            <div className="glass-card p-6 space-y-4 hover:border-blue-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Evaluation Benchmarking
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Run evaluation test suites across your contract portfolio to measure model precision, recall, and F1 accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 border-t border-white/8 relative overflow-hidden bg-gradient-to-b from-[#0b0f19] to-[#0f1424]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to audit your legal contracts with AI?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Create your account in seconds and upload your first contract to analyze risks automatically.
          </p>
          <div>
            <Link
              to="/signup"
              className="btn-primary text-base py-3.5 px-8 shadow-xl shadow-indigo-500/25"
            >
              Get Started Free &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/8 py-10 bg-[#070a12]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-slate-300">ClauseLens</span>
            <span>© {new Date().getFullYear()} Dabojit Sarkar</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/docs" className="hover:text-slate-300 transition-colors">
              Docs
            </Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              About Creator
            </Link>
            <a
              href="https://github.com/Dabojit-sarkar-dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
