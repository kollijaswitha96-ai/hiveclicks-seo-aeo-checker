export type CheckStatus = "pass" | "warning" | "fail";

export interface AuditCheck {
  id: string;
  category: "seo" | "aeo" | "technical";
  title: string;
  status: CheckStatus;
  score: number; // 0 to 100
  detail: string;
  recommendation: string;
  value?: string | number | boolean | null;
}

export interface AuditResult {
  url: string;
  domain: string;
  timestamp: string;
  overallScore: number;
  overallGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  seoScore: number;
  aeoScore: number;
  technicalScore: number;
  stats: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
  overview: {
    title: string;
    description: string;
    h1: string;
    wordCount: number;
    responseTimeMs: number;
    hasHttps: boolean;
    hasRobotsTxt: boolean;
    hasLlmsTxt: boolean;
    aiBotsAllowed: {
      gptBot: boolean;
      perplexityBot: boolean;
      claudeBot: boolean;
      googleExtended: boolean;
    };
    schemasDetected: string[];
  };
  checks: AuditCheck[];
}

export interface LeadSubmission {
  name: string;
  email: string;
  website: string;
  company?: string;
  phone?: string;
  scores?: {
    overall: number;
    seo: number;
    aeo: number;
  };
}

export interface LeadRecord extends LeadSubmission {
  id: string;
  createdAt: string;
}
