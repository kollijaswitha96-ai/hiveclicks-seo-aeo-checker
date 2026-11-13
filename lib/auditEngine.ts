import * as cheerio from "cheerio";
import { AuditCheck, AuditResult } from "./types";

export async function runFullAudit(rawUrl: string): Promise<AuditResult> {
  const startTime = Date.now();

  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  const parsedUrl = new URL(targetUrl);
  const domain = parsedUrl.hostname;
  const origin = parsedUrl.origin;

  // 1. Fetch the main webpage HTML
  let html = "";
  let responseTimeMs = 0;
  let status = 200;
  let headers: Headers | null = null;

  try {
    const fetchStart = Date.now();
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HiveclicksAuditBot/1.0; +https://hiveclicks.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });
    responseTimeMs = Date.now() - fetchStart;
    status = res.status;
    headers = res.headers;
    html = await res.text();
  } catch (err: any) {
    throw new Error(
      `Could not reach ${targetUrl}. Please verify the website address is online and accessible. Error: ${err.message}`
    );
  }

  const $ = cheerio.load(html);

  // 2. Fetch robots.txt & llms.txt in parallel
  let robotsTxtContent = "";
  let hasRobotsTxt = false;
  let hasLlmsTxt = false;

  try {
    const [robotsRes, llmsRes] = await Promise.allSettled([
      fetch(`${origin}/robots.txt`, { cache: "no-store" }),
      fetch(`${origin}/llms.txt`, { cache: "no-store" }),
    ]);

    if (robotsRes.status === "fulfilled" && robotsRes.value.ok) {
      robotsTxtContent = await robotsRes.value.text();
      hasRobotsTxt = true;
    }

    if (llmsRes.status === "fulfilled" && llmsRes.value.ok) {
      const llmsText = await llmsRes.value.text();
      // Verify it's not a generic HTML 404 page
      if (!llmsText.includes("<!DOCTYPE") && !llmsText.includes("<html")) {
        hasLlmsTxt = true;
      }
    }
  } catch {
    // Non-fatal if auxiliary files fail
  }

  // Parse robots.txt for AI bots
  const checkBotDisallowed = (botName: string) => {
    if (!robotsTxtContent) return false;
    const lower = robotsTxtContent.toLowerCase();
    const botLower = botName.toLowerCase();
    if (!lower.includes(botLower)) return false;

    // Check if user-agent block has Disallow: /
    const parts = lower.split(/user-agent:\s*/);
    for (const part of parts) {
      if (part.startsWith(botLower)) {
        if (part.includes("disallow: /") && !part.includes("allow: /")) {
          return true;
        }
      }
    }
    return false;
  };

  const aiBotsAllowed = {
    gptBot: !checkBotDisallowed("gptbot"),
    perplexityBot: !checkBotDisallowed("perplexitybot"),
    claudeBot: !checkBotDisallowed("claudebot"),
    googleExtended: !checkBotDisallowed("google-extended"),
  };

  // 3. Inspect HTML Elements
  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || "";
  const ogDesc =
    $('meta[property="og:description"]').attr("content")?.trim() || "";
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || "";
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || "";

  // Headings
  const h1Elements = $("h1");
  const h1Count = h1Elements.length;
  const h1Text = h1Elements.first().text().trim();
  const h2Count = $("h2").length;
  const h3Count = $("h3").length;

  // Images & Alt Text
  const totalImages = $("img").length;
  let missingAltImages = 0;
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (!alt || alt.trim() === "") {
      missingAltImages++;
    }
  });

  // Body text & word count
  $("script, style, noscript, nav, footer").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  // Schemas (JSON-LD)
  const schemasDetected: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (Array.isArray(json)) {
        json.forEach((item) => {
          if (item["@type"]) schemasDetected.push(String(item["@type"]));
        });
      } else if (json["@graph"]) {
        json["@graph"].forEach((item: any) => {
          if (item["@type"]) schemasDetected.push(String(item["@type"]));
        });
      } else if (json["@type"]) {
        schemasDetected.push(String(json["@type"]));
      }
    } catch {
      // Ignored malformed JSON-LD
    }
  });

  // Detect Question/Answer patterns
  const questionMatches = (
    html.match(/(\?<\/h[1-4]>)|(<dt>)|(class="[^"]*faq[^"]*")/gi) || []
  ).length;

  // 4. Construct Checklist & Score System
  const checks: AuditCheck[] = [];

  // ==================== AEO CHECKS (Answer Engine Optimization) ====================
  // Check 1: AI Crawlers Access (GPTBot, ClaudeBot, PerplexityBot)
  const allBotsAllowed =
    aiBotsAllowed.gptBot &&
    aiBotsAllowed.perplexityBot &&
    aiBotsAllowed.claudeBot;
  checks.push({
    id: "aeo-bot-permissions",
    category: "aeo",
    title: "AI Search Bot Permissions (ChatGPT, Perplexity, Claude)",
    status: allBotsAllowed
      ? "pass"
      : aiBotsAllowed.gptBot || aiBotsAllowed.perplexityBot
      ? "warning"
      : "fail",
    score: allBotsAllowed ? 100 : 40,
    detail: allBotsAllowed
      ? "OpenAI (GPTBot), Perplexity, and Claude are allowed to index your content for AI answers."
      : "One or more leading AI search crawlers are restricted in robots.txt.",
    recommendation: allBotsAllowed
      ? "Maintain open permissions in robots.txt to ensure your brand is cited by generative AI engines."
      : "Ensure robots.txt does not inadvertently block GPTBot, PerplexityBot, or ClaudeBot if you want AI search citations.",
    value: `GPTBot: ${aiBotsAllowed.gptBot ? "Allowed" : "Blocked"}, Perplexity: ${
      aiBotsAllowed.perplexityBot ? "Allowed" : "Blocked"
    }`,
  });

  // Check 2: llms.txt Standard
  checks.push({
    id: "aeo-llms-txt",
    category: "aeo",
    title: "LLMs.txt Standard File",
    status: hasLlmsTxt ? "pass" : "warning",
    score: hasLlmsTxt ? 100 : 45,
    detail: hasLlmsTxt
      ? "Found /llms.txt file! Your site provides structured context specifically for Large Language Models."
      : "No /llms.txt file detected at the root domain.",
    recommendation: hasLlmsTxt
      ? "Keep your llms.txt updated with core company facts, key offerings, and primary documentation."
      : "Create an /llms.txt markdown file that summarizes your business, products, and key links for AI agents to digest with zero friction.",
    value: hasLlmsTxt ? "Present" : "Missing",
  });

  // Check 3: Schema Structured Data (Knowledge Graph & Entity Extraction)
  const hasGoodSchema =
    schemasDetected.length > 0 &&
    schemasDetected.some((s) =>
      /Organization|WebSite|Article|Product|FAQPage|LocalBusiness/i.test(s)
    );
  checks.push({
    id: "aeo-structured-data",
    category: "aeo",
    title: "JSON-LD Semantic Schema (AI Knowledge Graph)",
    status: hasGoodSchema
      ? "pass"
      : schemasDetected.length > 0
      ? "warning"
      : "fail",
    score: hasGoodSchema ? 100 : schemasDetected.length > 0 ? 60 : 20,
    detail: hasGoodSchema
      ? `Found ${schemasDetected.length} schema markup types: [${schemasDetected.slice(0, 3).join(", ")}].`
      : "Missing high-confidence entity schema (Organization, Article, FAQPage, etc.).",
    recommendation: hasGoodSchema
      ? "Keep entity schema updated with sameAs social handles, founder data, and exact service definitions."
      : "Add JSON-LD Schema (Organization, WebSite, and FAQ) so AI models can confidently attribute facts to your brand.",
    value:
      schemasDetected.length > 0 ? schemasDetected.join(", ") : "None detected",
  });

  // Check 4: Direct Answer & FAQ Structure
  const hasFaqSchema = schemasDetected.some((s) => /FAQ/i.test(s));
  const hasQAPatterns = questionMatches > 0 || hasFaqSchema;
  checks.push({
    id: "aeo-direct-answers",
    category: "aeo",
    title: "Direct Answer & Q&A Content Architecture",
    status: hasFaqSchema ? "pass" : hasQAPatterns ? "warning" : "fail",
    score: hasFaqSchema ? 100 : hasQAPatterns ? 65 : 30,
    detail: hasFaqSchema
      ? "FAQ Schema and structured Q&A content detected, primed for Perplexity & Google AI Overviews."
      : hasQAPatterns
      ? "Found conversational question formatting, but missing official FAQPage Schema."
      : "Content lacks direct question-and-answer patterns optimized for generative answer engines.",
    recommendation:
      "Structure key pages with clear question headings (e.g. 'What is X?', 'How does Y work?') followed by concise 40-60 word definitive answers.",
    value: hasFaqSchema
      ? "FAQ Schema Enabled"
      : `${questionMatches} Q&A patterns detected`,
  });

  // ==================== TRADITIONAL SEO CHECKS ====================
  // Check 5: Title Tag
  const titleLength = title.length;
  const titleOk = titleLength >= 30 && titleLength <= 65;
  checks.push({
    id: "seo-title",
    category: "seo",
    title: "Page Title Tag",
    status: titleOk ? "pass" : titleLength > 0 ? "warning" : "fail",
    score: titleOk ? 100 : titleLength > 0 ? 60 : 0,
    detail:
      titleLength > 0
        ? `Title is ${titleLength} characters: "${title.slice(0, 60)}${
            titleLength > 60 ? "..." : ""
          }"`
        : "Missing <title> tag.",
    recommendation: titleOk
      ? "Optimal title length between 30 and 65 characters."
      : "Write a descriptive, keyword-rich title between 40-60 characters with your brand name.",
    value: `${titleLength} characters`,
  });

  // Check 6: Meta Description
  const descLength = description.length;
  const descOk = descLength >= 110 && descLength <= 165;
  checks.push({
    id: "seo-meta-description",
    category: "seo",
    title: "Meta Description",
    status: descOk ? "pass" : descLength > 0 ? "warning" : "fail",
    score: descOk ? 100 : descLength > 0 ? 55 : 0,
    detail:
      descLength > 0
        ? `Meta description is ${descLength} characters.`
        : "Missing meta description tag.",
    recommendation: descOk
      ? "Good length that avoids SERP truncation on desktop and mobile."
      : "Craft a compelling 120-160 character meta description with a clear call-to-action.",
    value: `${descLength} characters`,
  });

  // Check 7: Headings Hierarchy (H1)
  checks.push({
    id: "seo-h1",
    category: "seo",
    title: "H1 Heading Hierarchy",
    status: h1Count === 1 ? "pass" : h1Count > 1 ? "warning" : "fail",
    score: h1Count === 1 ? 100 : h1Count > 1 ? 70 : 10,
    detail:
      h1Count === 1
        ? `Single clear H1 detected: "${h1Text.slice(0, 50)}..."`
        : h1Count > 1
        ? `Found ${h1Count} H1 tags. Recommended best practice is exactly one H1 per page.`
        : "No H1 heading found on the page.",
    recommendation:
      h1Count === 1
        ? "Excellent semantic structure."
        : "Use exactly one primary H1 heading containing your main topic, and use H2/H3 for subsections.",
    value: `${h1Count} H1 tag(s)`,
  });

  // Check 8: OpenGraph Social Tags
  const hasOg = Boolean(ogTitle && ogDesc && ogImage);
  checks.push({
    id: "seo-opengraph",
    category: "seo",
    title: "Social Media & OpenGraph Cards",
    status: hasOg ? "pass" : ogTitle || ogImage ? "warning" : "fail",
    score: hasOg ? 100 : ogTitle || ogImage ? 60 : 10,
    detail: hasOg
      ? "OpenGraph title, description, and preview image are properly configured."
      : "Incomplete OpenGraph tags (missing preview image or description).",
    recommendation:
      "Configure og:title, og:description, and high-resolution og:image (1200x630px) for maximum click-through on LinkedIn, X, and messaging apps.",
    value: hasOg ? "Complete" : "Incomplete",
  });

  // Check 9: Canonical URL
  checks.push({
    id: "seo-canonical",
    category: "seo",
    title: "Canonical Link Tag",
    status: canonical ? "pass" : "warning",
    score: canonical ? 100 : 40,
    detail: canonical
      ? `Canonical tag specifies: ${canonical}`
      : "No canonical tag found in HTML head.",
    recommendation: canonical
      ? "Canonical tag prevents duplicate content issues."
      : "Add a <link rel='canonical'> tag to indicate the preferred URL version to search engines.",
    value: canonical ? "Present" : "Missing",
  });

  // Check 10: Image Alt Attributes
  const altRatio =
    totalImages === 0
      ? 1
      : (totalImages - missingAltImages) / totalImages;
  checks.push({
    id: "seo-image-alt",
    category: "seo",
    title: "Image Alt Attributes & Accessibility",
    status:
      missingAltImages === 0 ? "pass" : altRatio > 0.7 ? "warning" : "fail",
    score: Math.round(altRatio * 100),
    detail:
      totalImages === 0
        ? "No images found."
        : missingAltImages === 0
        ? `All ${totalImages} image(s) have descriptive alt attributes.`
        : `${missingAltImages} of ${totalImages} image(s) are missing alt attributes.`,
    recommendation:
      missingAltImages === 0
        ? "Images are accessible to search engine crawlers and screen readers."
        : "Add descriptive, keyword-relevant alt text to all informative images.",
    value: `${totalImages - missingAltImages}/${totalImages} with alt tags`,
  });

  // ==================== TECHNICAL CHECKS ====================
  // Check 11: HTTPS
  const isHttps = parsedUrl.protocol === "https:";
  checks.push({
    id: "tech-https",
    category: "technical",
    title: "HTTPS Encryption & SSL Certificate",
    status: isHttps ? "pass" : "fail",
    score: isHttps ? 100 : 0,
    detail: isHttps
      ? "Website is served securely over HTTPS with SSL/TLS encryption."
      : "Website is not enforcing secure HTTPS.",
    recommendation: isHttps
      ? "Security certificate is active."
      : "Enforce HTTPS redirect across all URLs to protect users and satisfy Google ranking signals.",
    value: isHttps ? "Active (HTTPS)" : "Insecure (HTTP)",
  });

  // Check 12: Server Response Time (TTFB)
  const isFast = responseTimeMs < 800;
  const isMedium = responseTimeMs < 1800;
  checks.push({
    id: "tech-speed",
    category: "technical",
    title: "Server Response Speed (TTFB)",
    status: isFast ? "pass" : isMedium ? "warning" : "fail",
    score: isFast ? 100 : isMedium ? 65 : 30,
    detail: `Server responded in ${responseTimeMs}ms.`,
    recommendation: isFast
      ? "Fast server response speed keeps visitors and crawlers happy."
      : "Consider CDN caching (Cloudflare, Fastly) and server-side optimization to bring response time under 600ms.",
    value: `${responseTimeMs}ms`,
  });

  // Check 13: Mobile Viewport
  const hasViewport = viewport.includes("width=device-width");
  checks.push({
    id: "tech-mobile",
    category: "technical",
    title: "Mobile Responsiveness & Viewport Meta",
    status: hasViewport ? "pass" : "fail",
    score: hasViewport ? 100 : 0,
    detail: hasViewport
      ? "Mobile viewport tag is properly configured."
      : "Missing standard mobile viewport tag.",
    recommendation: hasViewport
      ? "Page scales correctly for mobile screens."
      : "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'>.",
    value: hasViewport ? "Configured" : "Missing",
  });

  // Check 14: Robots.txt Crawlability
  checks.push({
    id: "tech-robots",
    category: "technical",
    title: "Robots.txt Crawl Directives",
    status: hasRobotsTxt ? "pass" : "warning",
    score: hasRobotsTxt ? 100 : 50,
    detail: hasRobotsTxt
      ? "Robots.txt file is publicly accessible."
      : "Robots.txt file not found at /robots.txt.",
    recommendation: hasRobotsTxt
      ? "Search engines can discover crawl rules and sitemap locations."
      : "Add a robots.txt file with sitemap declarations to guide web crawlers.",
    value: hasRobotsTxt ? "Accessible" : "Missing",
  });

  // Calculate Scores
  const seoChecks = checks.filter((c) => c.category === "seo");
  const aeoChecks = checks.filter((c) => c.category === "aeo");
  const techChecks = checks.filter((c) => c.category === "technical");

  const calcAvg = (arr: AuditCheck[]) =>
    Math.round(arr.reduce((acc, cur) => acc + cur.score, 0) / (arr.length || 1));

  const seoScore = calcAvg(seoChecks);
  const aeoScore = calcAvg(aeoChecks);
  const technicalScore = calcAvg(techChecks);

  // Overall Score weighted: 40% SEO, 40% AEO, 20% Technical
  const overallScore = Math.round(
    seoScore * 0.4 + aeoScore * 0.4 + technicalScore * 0.2
  );

  let overallGrade: "A+" | "A" | "B" | "C" | "D" | "F" = "F";
  if (overallScore >= 93) overallGrade = "A+";
  else if (overallScore >= 85) overallGrade = "A";
  else if (overallScore >= 75) overallGrade = "B";
  else if (overallScore >= 60) overallGrade = "C";
  else if (overallScore >= 45) overallGrade = "D";
  else overallGrade = "F";

  const passed = checks.filter((c) => c.status === "pass").length;
  const warnings = checks.filter((c) => c.status === "warning").length;
  const failed = checks.filter((c) => c.status === "fail").length;

  return {
    url: targetUrl,
    domain,
    timestamp: new Date().toISOString(),
    overallScore,
    overallGrade,
    seoScore,
    aeoScore,
    technicalScore,
    stats: {
      passed,
      warnings,
      failed,
      total: checks.length,
    },
    overview: {
      title,
      description,
      h1: h1Text,
      wordCount,
      responseTimeMs,
      hasHttps: isHttps,
      hasRobotsTxt,
      hasLlmsTxt,
      aiBotsAllowed,
      schemasDetected,
    },
    checks,
  };
}
