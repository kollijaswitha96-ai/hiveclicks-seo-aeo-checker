import { jsPDF } from "jspdf";
import { AuditResult } from "./types";

export function generateAuditPdf(
  audit: AuditResult,
  leadInfo: { name: string; email: string; company?: string }
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkNavy = [15, 23, 42]; // #0f172a
  const primaryGold = [245, 158, 11]; // #f59e0b
  const slateGray = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc
  const passGreen = [22, 163, 74]; // #16a34a
  const warnYellow = [217, 119, 6]; // #d97706
  const failRed = [220, 38, 38]; // #dc2626

  let y = margin;

  // Helper for page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
      drawHeaderMini();
    }
  };

  const drawHeaderMini = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("HIVECLICKS | SEO & AEO AUDIT REPORT", margin + 10, y + 16);
    doc.setFont("helvetica", "normal");
    doc.text(audit.domain, pageWidth - margin - 10, y + 16, { align: "right" });
    y += 34;
  };

  // ==================== COVER / HEADER ====================
  // Top Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 110, "F");

  // Gold accent line
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.rect(0, 107, pageWidth, 3, "F");

  // Brand Name
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("HIVECLICKS", margin, 46);

  // Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Website SEO & Answer Engine Optimization (AEO) Audit", margin, 70);

  // Metadata in Header
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Prepared for: ${leadInfo.name}${leadInfo.company ? ` (${leadInfo.company})` : ""}`,
    pageWidth - margin,
    44,
    { align: "right" }
  );
  doc.text(`Domain: ${audit.domain}`, pageWidth - margin, 60, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(audit.timestamp).toLocaleDateString()}`,
    pageWidth - margin,
    76,
    { align: "right" }
  );

  y = 135;

  // ==================== EXECUTIVE SCORE CARDS ====================
  const cardWidth = (contentWidth - 24) / 3;
  const cardHeight = 70;

  // Overall Score Card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("OVERALL GRADE", margin + 12, y + 20);

  doc.setFontSize(26);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text(`${audit.overallGrade} (${audit.overallScore}/100)`, margin + 12, y + 52);

  // SEO Score Card
  const seoX = margin + cardWidth + 12;
  doc.roundedRect(seoX, y, cardWidth, cardHeight, 6, 6, "FD");
  doc.setFontSize(10);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("TRADITIONAL SEO", seoX + 12, y + 20);

  doc.setFontSize(26);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${audit.seoScore}/100`, seoX + 12, y + 52);

  // AEO Score Card
  const aeoX = margin + (cardWidth + 12) * 2;
  doc.roundedRect(aeoX, y, cardWidth, cardHeight, 6, 6, "FD");
  doc.setFontSize(10);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("AI / AEO READINESS", aeoX + 12, y + 20);

  doc.setFontSize(26);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${audit.aeoScore}/100`, aeoX + 12, y + 52);

  y += cardHeight + 20;

  // ==================== EXECUTIVE SUMMARY ====================
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("Audit Executive Summary", margin + 14, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Audit evaluated ${audit.stats.total} checkpoints across Traditional SEO, Answer Engine Optimization (AI Overviews, Perplexity, ChatGPT), and Core Web Performance. Total Passed: ${audit.stats.passed} | Warnings: ${audit.stats.warnings} | Critical Action Items: ${audit.stats.failed}`,
    margin + 14,
    y + 38,
    { maxWidth: contentWidth - 28 }
  );

  y += 70;

  // ==================== AEO HIGHLIGHT BOX ====================
  doc.setFillColor(254, 243, 199); // light amber
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.roundedRect(margin, y, contentWidth, 68, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("What is AEO & Why It Matters for Your Business", margin + 14, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15);
  doc.text(
    "Answer Engine Optimization (AEO) ensures your brand is selected, synthesized, and cited by AI engines like ChatGPT Search, Perplexity AI, Claude, and Google AI Overviews. Modern search is shifting from 10 blue links to direct AI answers.",
    margin + 14,
    y + 36,
    { maxWidth: contentWidth - 28 }
  );
  doc.text(
    `AI Crawlers: GPTBot: ${audit.overview.aiBotsAllowed.gptBot ? "Allowed" : "Blocked"} | PerplexityBot: ${audit.overview.aiBotsAllowed.perplexityBot ? "Allowed" : "Blocked"} | LLMs.txt: ${audit.overview.hasLlmsTxt ? "Found" : "Not Found"}`,
    margin + 14,
    y + 58
  );

  y += 84;

  // ==================== DETAILED AUDIT CHECKLIST ====================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("Detailed Findings & Action Plan", margin, y);
  y += 18;

  // Sort checks: fail first, then warning, then pass
  const sortedChecks = [...audit.checks].sort((a, b) => {
    const order = { fail: 0, warning: 1, pass: 2 };
    return order[a.status] - order[b.status];
  });

  for (const check of sortedChecks) {
    checkPageBreak(75);

    // Box for check item
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 62, 4, 4, "FD");

    // Status Pill
    let pillColor = passGreen;
    let pillLabel = "PASS";
    if (check.status === "warning") {
      pillColor = warnYellow;
      pillLabel = "WARNING";
    } else if (check.status === "fail") {
      pillColor = failRed;
      pillLabel = "CRITICAL";
    }

    doc.setFillColor(pillColor[0], pillColor[1], pillColor[2]);
    doc.roundedRect(margin + 10, y + 10, 56, 16, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(pillLabel, margin + 38, y + 21, { align: "center" });

    // Category Tag
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.setFontSize(8.5);
    doc.text(check.category.toUpperCase(), margin + 74, y + 21);

    // Check Title
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(check.title, margin + 130, y + 21, {
      maxWidth: contentWidth - 145,
    });

    // Detail text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(check.detail, margin + 12, y + 38, {
      maxWidth: contentWidth - 24,
    });

    // Recommendation text
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(`Action: ${check.recommendation}`, margin + 12, y + 52, {
      maxWidth: contentWidth - 24,
    });

    y += 70;
  }

  // ==================== FOOTER / CTA ====================
  checkPageBreak(90);

  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 75, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("Need Help Improving Your SEO & AEO Rankings?", margin + 20, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(
    "The Hiveclicks team specializes in high-impact search engine optimization and generative AI search positioning. Contact us today to execute these fixes and capture more high-intent organic leads.",
    margin + 20,
    y + 42,
    { maxWidth: contentWidth - 40 }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("Visit: https://hiveclicks.com  |  Email: contact@hiveclicks.com", margin + 20, y + 62);

  // Save the PDF and trigger download
  const filename = `Hiveclicks_SEO_AEO_Audit_${audit.domain.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
