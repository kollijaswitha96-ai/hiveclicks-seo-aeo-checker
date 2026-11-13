import fs from "fs";
import path from "path";
import { LeadRecord, LeadSubmission } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

// In-memory fallback if file system is read-only (e.g. serverless functions)
let inMemoryLeads: LeadRecord[] = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
    }
  } catch {
    // Ephemeral environment fallback
  }
}

export async function saveLead(submission: LeadSubmission): Promise<LeadRecord> {
  const newRecord: LeadRecord = {
    ...submission,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  // 1. Try writing to filesystem
  try {
    ensureDataFile();
    let currentLeads: LeadRecord[] = [];
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8");
      currentLeads = JSON.parse(data || "[]");
    }
    currentLeads.unshift(newRecord);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(currentLeads, null, 2));
  } catch (err) {
    console.warn("Filesystem write bypassed, using memory cache:", err);
  }

  // 2. Also keep in memory
  inMemoryLeads.unshift(newRecord);

  // 3. Optional: forward to Webhook (Slack, Zapier, Make, CRM) if configured
  const webhookUrl = process.env.LEADS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_seo_aeo_lead",
          lead: newRecord,
        }),
      });
    } catch (e) {
      console.error("Webhook notification error:", e);
    }
  }

  return newRecord;
}

export async function getAllLeads(): Promise<LeadRecord[]> {
  try {
    ensureDataFile();
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8");
      const fileLeads: LeadRecord[] = JSON.parse(data || "[]");
      // Merge unique
      const ids = new Set(fileLeads.map((l) => l.id));
      const combined = [...fileLeads];
      inMemoryLeads.forEach((l) => {
        if (!ids.has(l.id)) combined.push(l);
      });
      return combined;
    }
  } catch {
    // return memory leads
  }
  return inMemoryLeads;
}

export function convertLeadsToCsv(leads: LeadRecord[]): string {
  const headers = [
    "Date",
    "Name",
    "Email",
    "Company",
    "Phone",
    "Website",
    "Overall Score",
    "SEO Score",
    "AEO Score",
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((l) => [
    escapeCsv(new Date(l.createdAt).toLocaleString()),
    escapeCsv(l.name),
    escapeCsv(l.email),
    escapeCsv(l.company || ""),
    escapeCsv(l.phone || ""),
    escapeCsv(l.website),
    escapeCsv(l.scores?.overall ?? ""),
    escapeCsv(l.scores?.seo ?? ""),
    escapeCsv(l.scores?.aeo ?? ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
