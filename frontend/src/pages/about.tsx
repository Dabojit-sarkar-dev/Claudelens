import {
  Mail,
  Globe,
  Code2,
  Cpu,
  Sparkles,
  Target,
  GraduationCap,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/contexts/auth-context";

export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Banner Card - Centered Large Picture & Info */}
      <div className="glass-card-static p-8 sm:p-10 relative overflow-hidden text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-6 relative z-10">
          {/* Centered Extra Large Profile Picture */}
          <div className="h-44 w-44 sm:h-56 sm:w-56 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-1.5 shadow-2xl shadow-indigo-500/30 shrink-0 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/aboutpic.jpg"
              alt="Dabojit Sarkar"
              className="h-full w-full rounded-full object-cover object-center border-4 border-[#0b0f19]"
            />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Founder & Creator
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Dabojit Sarkar
            </h1>

            <p className="text-base font-medium text-slate-300">
              Founder & Lead · AI/ML Engineer
            </p>

            <p className="text-sm text-slate-400 flex items-center justify-center gap-2 pt-1">
              <GraduationCap className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
              B.Tech CSE Undergrad (Final Year) · Kalinga Institute of Industrial Technology
            </p>
          </div>
        </div>
      </div>

      {/* About & Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card-static p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Mission & Vision
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to <strong className="text-white">ClauseLens</strong>! As a Computer Science & Engineering undergraduate specializing in Artificial Intelligence and Machine Learning, I founded ClauseLens to bridge the gap between complex legal documents and intelligent, automated risk evaluation.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            My mission is to leverage cutting-edge LLMs (Gemini, Groq), advanced NLP techniques, and robust full-stack engineering to empower legal reviewers, businesses, and individuals with real-time clause extraction, precise citation verification, and high-accuracy risk intelligence.
          </p>
        </div>

        {/* Social / Contact Links Card */}
        <div className="glass-card-static p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-violet-400" />
            Connect With Me
          </h2>
          <div className="space-y-3 text-sm">
            <a
              href="https://github.com/Dabojit-sarkar-dev"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors group"
            >
              <svg className="h-4 w-4 fill-current text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="truncate">GitHub Profile</span>
            </a>

            <a
              href="https://www.linkedin.com/in/dabojit-sarkar-9051832a7"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors group"
            >
              <svg className="h-4 w-4 fill-current text-indigo-400 group-hover:text-indigo-300 transition-colors" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span className="truncate">LinkedIn Profile</span>
            </a>

            <a
              href="mailto:debsarkards2002@gmail.com"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors group"
            >
              <Mail className="h-4 w-4 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="truncate">debsarkards2002@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Educational Background Section */}
      <div className="glass-card-static p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-400" />
          Education & Academic Background
        </h2>

        <div className="relative border-l-2 border-indigo-500/20 ml-3 pl-6 space-y-6">
          {/* University */}
          <div className="relative group">
            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 border-4 border-[#0b0f19] group-hover:scale-125 transition-transform" />
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-white">
                  Kalinga Institute of Industrial Technology (KIIT)
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Final Year Undergrad
                </span>
              </div>
              <p className="text-sm font-medium text-slate-300">
                Bachelor of Technology (B.Tech) in Computer Science & Engineering (CSE)
              </p>
              <p className="text-xs text-slate-400">
                Specialization in Artificial Intelligence, Machine Learning & Software Systems
              </p>
            </div>
          </div>

          {/* College */}
          <div className="relative group">
            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-violet-500 border-4 border-[#0b0f19] group-hover:scale-125 transition-transform" />
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-white">
                  Notre Dame College
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  11th & 12th Grade
                </span>
              </div>
              <p className="text-sm font-medium text-slate-300">
                Higher Secondary Certificate (HSC) · Science Stream
              </p>
            </div>
          </div>

          {/* School */}
          <div className="relative group">
            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-500 border-4 border-[#0b0f19] group-hover:scale-125 transition-transform" />
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-white">
                  St. Gregory's High School & College
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  Secondary Schooling
                </span>
              </div>
              <p className="text-sm font-medium text-slate-300">
                Secondary School Certificate (SSC)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack & Core Competencies */}
      <div className="glass-card-static p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Code2 className="h-5 w-5 text-indigo-400" />
          Technical Expertise & Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Artificial Intelligence (AI)",
            "Machine Learning (ML)",
            "Python / PyTorch",
            "FastAPI",
            "Gemini API / Groq LLM",
            "React 19 & TypeScript",
            "PostgreSQL & Neon DB",
            "SQLAlchemy",
            "Docker & Containerization",
            "Tailwind CSS v4",
            "OAuth / Security",
          ].map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Cpu className="h-3 w-3 text-indigo-400" />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </main>
</div>
);
}
