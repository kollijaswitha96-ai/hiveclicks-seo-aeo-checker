"use client";

import { useEffect, useState } from "react";
import { Download, Search, Users, Globe, Lock, ArrowLeft, RefreshCw } from "lucide-react";
import { LeadRecord } from "@/lib/types";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo passcode
    if (password === "hiveclicks" || password === "admin123" || password === "admin") {
      setIsAuthenticated(true);
      setAuthError("");
      fetchLeads();
    } else {
      setAuthError("Incorrect password. (Default is 'hiveclicks')");
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error("Failed to load leads:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.website.toLowerCase().includes(q) ||
      (lead.company && lead.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Audit Tool</span>
        </a>
      </div>

      {!isAuthenticated ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Admin Leads Portal</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter passcode to view and export captured audit leads.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter passcode (default: hiveclicks)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 text-center"
            />
            {authError && (
              <p className="text-xs text-red-400">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 transition-all"
            >
              Sign In to Leads
            </button>
          </form>
        </div>
      ) : (
        <div>
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Hiveclicks Admin
              </span>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-400" />
                <span>Captured Leads ({leads.length})</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchLeads}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <a
                href="/api/leads?format=csv"
                download
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Leads (CSV)</span>
              </a>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, email, company, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Leads Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Website</th>
                    <th className="py-3.5 px-4 text-center">Overall</th>
                    <th className="py-3.5 px-4 text-center">SEO</th>
                    <th className="py-3.5 px-4 text-center">AEO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {isLoading ? "Loading leads..." : "No leads captured yet. Run an audit on the home page!"}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString()}{" "}
                          <span className="text-[10px] text-slate-500">
                            {new Date(lead.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          {lead.name}
                        </td>
                        <td className="py-3.5 px-4 text-amber-400 whitespace-nowrap font-mono">
                          <a href={`mailto:${lead.email}`} className="hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {lead.company || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <a
                            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{lead.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded font-black bg-amber-400/20 text-amber-400">
                            {lead.scores?.overall ?? "—"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-blue-400 font-bold">
                          {lead.scores?.seo ?? "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-bold">
                          {lead.scores?.aeo ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
