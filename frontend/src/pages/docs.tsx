import {
  Shield,
  BookOpen,
  AlertTriangle,
  Code2,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/contexts/auth-context";

export default function DocsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10 animate-fade-in">
          {/* Header */}
          <div className="space-y-3 border-b border-white/8 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5" />
              DOCUMENTATION & SPECIFICATIONS
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ClauseLens Documentation
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Learn how ClauseLens processes contract PDFs, extracts key clauses, scores risk, and guarantees verifiable citations.
            </p>
          </div>

          {/* Section 1: Overview */}
          <div className="glass-card-static p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              1. Platform Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ClauseLens is built as an asynchronous AI processing engine using FastAPI (Python 3.11), SQLAlchemy, Neon PostgreSQL, and React 19. When a user uploads a PDF contract:
            </p>
            <ul className="space-y-2 text-sm text-slate-400 pl-4 list-disc">
              <li>PDF pages are extracted and split into structured paragraph blocks with line-offset tracking.</li>
              <li>Dual LLM pipeline (Gemini 2.5 Flash / Groq LLaMA) parses the contract for risk clauses.</li>
              <li>Every finding is verified against verbatim source paragraphs before saving to PostgreSQL.</li>
            </ul>
          </div>

          {/* Section 2: Risk Scoring Matrix */}
          <div className="glass-card-static p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              2. Risk Severity Taxonomy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                <span className="text-xs font-bold text-red-400 uppercase">Critical Severity</span>
                <p className="text-xs text-slate-300">Unlimited liability, uncapped indemnity, or immediate unilateral termination without cause.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase">High Severity</span>
                <p className="text-xs text-slate-300">Broad IP assignment, harsh non-compete clauses, or strict auto-renewal penalties.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <span className="text-xs font-bold text-blue-400 uppercase">Medium Severity</span>
                <p className="text-xs text-slate-300">Unfavorable payment terms (&gt;60 days) or ambiguous warranty disclaimers.</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase">Low Severity</span>
                <p className="text-xs text-slate-300">Standard confidentiality provisions, notice periods, or boilerplates.</p>
              </div>
            </div>
          </div>

          {/* Section 3: REST API Specifications */}
          <div className="glass-card-static p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-400" />
              3. Key API Endpoints
            </h2>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <span className="text-emerald-400 font-bold">POST /v1/contracts/upload</span>
                <p className="text-slate-400 font-sans text-xs">Uploads a PDF file (`multipart/form-data`) and initiates asynchronous LLM analysis.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <span className="text-indigo-400 font-bold">GET /v1/contracts</span>
                <p className="text-slate-400 font-sans text-xs">Lists contracts scoped to the current user's workspace.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <span className="text-violet-400 font-bold">GET /v1/contracts/{`{id}`}/findings</span>
                <p className="text-slate-400 font-sans text-xs">Retrieves structured risk findings with verbatim citation offsets.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/8 py-6 text-center text-xs text-slate-500">
        ClauseLens Documentation Engine © {new Date().getFullYear()} Dabojit Sarkar
      </footer>
    </div>
  );
}
