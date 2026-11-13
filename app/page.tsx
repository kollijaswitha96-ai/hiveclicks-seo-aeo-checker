"use client";

import { useState } from "react";
import {
  Search,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Bot,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  FileText,
  User,
  Mail,
  Building,
} from "lucide-react";
import { AuditResult } from "@/lib/types";
import { generateAuditPdf } from "@/lib/pdfGenerator";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"input" | "leadModal" | "scanning" | "results">("input");
  
  // Lead info
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Audit state
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanError, setScanError] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "aeo" | "seo" | "failed">("all");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const scanSteps = [
    "Connecting to server and measuring response time...",
    "Crawling HTML head, meta tags, and header hierarchy...",
    "Checking robots.txt for AI bots (GPTBot, Perplexity, Claude)...",
    "Analyzing llms.txt and JSON-LD schema entity extraction...",
    "Auditing direct-answer formatting and content depth...",
    "Calculating SEO & AEO scores and building executive report...",
  ];

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setScanError("");
    setStep("leadModal");
  };

  const executeAudit = async (name: string, email: string) => {
    setStep("scanning");
    setScanStepIndex(0);

    // Progress step simulation
    const interval = setInterval(() => {
      setScanStepIndex((prev) => {
        if (prev < scanSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 900);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze website.");
      }

      setAuditResult(data.result);
      setStep("results");

      // Save lead to backend
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          website: url.trim(),
          company: leadCompany,
          phone: leadPhone,
          scores: {
            overall: data.result.overallScore,
            seo: data.result.seoScore,
            aeo: data.result.aeoScore,
          },
        }),
      }).catch((e) => console.warn("Failed to store lead:", e));
    } catch (err: any) {
      clearInterval(interval);
      setScanError(err.message || "An unexpected error occurred.");
      setStep("input");
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;
    executeAudit(leadName, leadEmail);
  };

  const handleDownloadPdf = () => {
    if (!auditResult) return;
    setIsPdfGenerating(true);
    try {
      generateAuditPdf(auditResult, {
        name: leadName || "Visitor",
        email: leadEmail,
        company: leadCompany,
      });
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const filteredChecks = auditResult?.checks.filter((c) => {
    if (activeTab === "aeo") return c.category === "aeo";
    if (activeTab === "seo") return c.category === "seo";
    if (activeTab === "failed") return c.status === "fail";
    return true;
  });

  return (
    <div className="relative">
      {/* Background Decorative Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* ============================================================
          HERO SECTION & INPUT FORM
      ============================================================ */}
      <section id="audit-tool" className="pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Dual SEO + AEO Website Audit Suite
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
          Does Your Website Rank on Google{" "}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            & ChatGPT?
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Traditional SEO gets you ranked on Google. <strong className="text-white">AEO (Answer Engine Optimization)</strong> gets you cited by ChatGPT, Perplexity, Claude, and Google AI Overviews. Audit both in seconds.
        </p>

        {/* Input Bar */}
        {step === "input" && (
          <form
            onSubmit={handleStartAudit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Globe className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                required
                placeholder="Enter website (e.g. example.com or https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Audit Website Free</span>
            </button>
          </form>
        )}

        {/* Error message */}
        {scanError && (
          <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}
      </section>

      {/* ============================================================
          LEAD CAPTURE MODAL
      ============================================================ */}
      {step === "leadModal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#111827] border border-amber-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Unlock Your Full Audit & PDF</h3>
              <p className="text-xs text-slate-300 mt-1">
                Where should we deliver your downloadable SEO & AEO audit report?
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Organization (Optional)
                </label>
                <div className="relative flex items-center">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Generate Free SEO & AEO Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 We respect your privacy. No spam, ever.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          SCANNING ANIMATION
      ============================================================ */}
      {step === "scanning" && (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Analyzing {url}</h3>
          <p className="text-sm text-amber-400 font-medium h-6">
            {scanSteps[scanStepIndex]}
          </p>

          <div className="w-full bg-white/10 h-2 rounded-full mt-6 overflow-hidden max-w-sm mx-auto">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.round(((scanStepIndex + 1) / scanSteps.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ============================================================
          RESULTS VIEW
      ============================================================ */}
      {step === "results" && auditResult && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Top Results Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Audit Completed
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                {auditResult.domain}
              </h2>
              <span className="text-xs text-slate-400">
                Audited {new Date(auditResult.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep("input");
                  setUrl("");
                }}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Audit Another URL</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isPdfGenerating ? "Generating..." : "Download Full PDF Audit"}</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Overall Score */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#111827] to-[#0f172a] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Overall Score
                </span>
                <div className="text-4xl font-black text-white mt-1">
                  {auditResult.overallScore}
                  <span className="text-lg text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Grade: <strong className="text-amber-400 text-sm">{auditResult.overallGrade}</strong>
                </div>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-black text-2xl text-amber-400">
                {auditResult.overallGrade}
              </div>
            </div>

            {/* Traditional SEO */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Google & SEO Score
                </span>
                <div className="text-4xl font-black text-white mt-1">
                  {auditResult.seoScore}
                  <span className="text-lg text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Meta, OpenGraph, Canonical & Headings
                </div>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-lg text-blue-400">
                {auditResult.seoScore}%
              </div>
            </div>

            {/* AEO / AI Readiness */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  AI & AEO Readiness
                </span>
                <div className="text-4xl font-black text-white mt-1">
                  {auditResult.aeoScore}
                  <span className="text-lg text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  ChatGPT, Perplexity & AI Overviews
                </div>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-lg text-amber-400">
                {auditResult.aeoScore}%
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <span className="text-2xl font-black text-green-400">
                {auditResult.stats.passed}
              </span>
              <p className="text-xs text-slate-300 font-medium mt-1">Passed Checks</p>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-2xl font-black text-yellow-400">
                {auditResult.stats.warnings}
              </span>
              <p className="text-xs text-slate-300 font-medium mt-1">Warnings</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <span className="text-2xl font-black text-red-400">
                {auditResult.stats.failed}
              </span>
              <p className="text-xs text-slate-300 font-medium mt-1">Critical Issues</p>
            </div>
          </div>

          {/* Checklist Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Items ({auditResult.checks.length})
            </button>
            <button
              onClick={() => setActiveTab("aeo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "aeo"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AEO & AI Search (
              {auditResult.checks.filter((c) => c.category === "aeo").length})
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "seo"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Traditional SEO (
              {auditResult.checks.filter((c) => c.category === "seo").length})
            </button>
            <button
              onClick={() => setActiveTab("failed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "failed"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Needs Attention ({auditResult.stats.failed})
            </button>
          </div>

          {/* Audit Checks List */}
          <div className="space-y-4 mb-12">
            {filteredChecks?.map((check) => (
              <div
                key={check.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {check.status === "pass" && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {check.status === "warning" && (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                    {check.status === "fail" && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-base">
                        {check.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-slate-400">
                        {check.category}
                      </span>
                      {check.value && (
                        <span className="text-[11px] text-amber-400/90 font-mono">
                          ({String(check.value)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{check.detail}</p>
                    <p className="text-xs text-amber-400/80 italic mt-1.5">
                      💡 <strong>Fix:</strong> {check.recommendation}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      check.status === "pass"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : check.status === "warning"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {check.status === "pass"
                      ? "Passed"
                      : check.status === "warning"
                      ? "Warning"
                      : "Critical"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Download Report Callout Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20 border border-amber-500/40 text-center relative overflow-hidden">
            <h3 className="text-2xl font-black text-white mb-2">
              Ready to Save Your Complete Audit?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
              Download the official branded Hiveclicks PDF audit report with executive summaries and priority fix lists to share with your team or clients.
            </p>
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="px-8 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-xl shadow-amber-500/30 transition-all inline-flex items-center gap-2.5"
            >
              <Download className="w-4 h-4" />
              <span>{isPdfGenerating ? "Generating PDF..." : "Download Full Detailed PDF"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ============================================================
          EDUCATIONAL / VALUE SECTION: WHY AEO?
      ============================================================ */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            The Future of Search
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            Why SEO Alone Is No Longer Enough
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Over 50% of search queries now trigger an AI Overview or conversational direct answer. If your website is not optimized for Answer Engines, you are invisible to millions of AI searchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Generative AI Citations
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              When users ask ChatGPT, Perplexity, or Claude for vendor and service recommendations, our AEO audit reveals whether your site is structured to be the cited answer.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              llms.txt & Open Standards
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Leading organizations are now implementing <code className="text-amber-400">/llms.txt</code> files to feed precise, curated brand context directly to large language model agents.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Google Core Web & Technical SEO
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We continue to audit traditional signals: title tags, meta descriptions, semantic headings, canonicals, OpenGraph previews, and server response times.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
