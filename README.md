# 🚀 Hiveclicks Free SEO & AEO Checker & Lead Capture Suite

A high-converting, publicly accessible website audit tool designed to capture qualified inbound leads by analyzing both **Traditional Google SEO** and modern **Answer Engine Optimization (AEO)** readiness (ChatGPT, Perplexity, Claude, and Google AI Overviews).

Visitors can enter any website URL, provide their contact information, receive an instant interactive audit score, and download a branded, executive-grade PDF audit report.

---

## 🌟 Key Features

1. **Dual Audit & Scoring Engine:**
   - **AEO (Answer Engine Optimization):**
     - AI Bot crawling permissions in `robots.txt` (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`).
     - `llms.txt` standard presence for direct LLM ingestion.
     - JSON-LD Schema markup validation (`Organization`, `Article`, `FAQPage`, `Product`).
     - Direct-answer content structures & conversational Q&A pattern detection.
   - **Traditional Google SEO:**
     - Title tag length and keyword positioning.
     - Meta description optimization and SERP preview limits.
     - Heading hierarchy (strict single H1, H2/H3 distribution).
     - Open Graph & Twitter Card social previews.
     - Canonical tag declaration.
     - Image alt tag accessibility audit.
   - **Technical & Speed Signals:**
     - HTTPS & SSL certificate security check.
     - Server Response Time (TTFB latency in milliseconds).
     - Mobile Viewport configuration.
     - Robots.txt accessibility.

2. **Lead Generation & Capture Flow:**
   - Multi-step modal or embedded form capturing **Name, Email, Company, and Website URL**.
   - Saves all submissions with scores and timestamp to `/api/leads`.
   - Optional webhook integration (`LEADS_WEBHOOK_URL`) to forward leads in real-time to Slack, Zapier, Make, HubSpot, or email.

3. **Instant Downloadable PDF Audit Report:**
   - Client-ready, multi-page vector PDF generated directly in the browser via `jspdf`.
   - Customized with visitor's name, company, audited domain, date, overall grade, visual scorecards, itemized checklist findings, and Hiveclicks agency consultation call-to-action.

4. **Private Admin Portal (`/admin`):**
   - Protected dashboard to view all captured leads.
   - Real-time search and filtering.
   - **1-Click "Export Leads (CSV)"** button to load leads into Excel or your CRM.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18 / 19, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Hiveclicks modern tech aesthetic)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Scraper & Analyzer:** [Cheerio](https://cheerio.js.org/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)

---

## 🌐 How to Connect to GitHub and Make It Publicly Accessible

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com/new](https://github.com/new).
2. Name your repository (for example: `hiveclicks-seo-aeo-checker`).
3. Keep it **Public** (or Private) and click **Create repository**.

### Step 2: Push This Code to GitHub
Open your terminal in this directory (`C:\Users\hp\.gemini\antigravity\scratch\hiveclicks-seo-aeo-checker`) and run:

```bash
git init
git add .
git commit -m "Initial commit: Hiveclicks SEO & AEO Checker Lead Generation Tool"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/hiveclicks-seo-aeo-checker.git
git push -u origin main
```

---

## ⚡ 1-Click Online Deployment (Free & Instant Public URL)

Once the code is on GitHub, you can link it to **Vercel** or **Netlify** with zero configuration:

### Option A: Deploy with Vercel (Recommended for Next.js)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New"** ➔ **"Project"**.
3. Select your `hiveclicks-seo-aeo-checker` repository from the list.
4. Click **"Deploy"**.
5. Within 60 seconds, you will receive a free, live public HTTPS address (e.g. `https://hiveclicks-seo-aeo-checker.vercel.app`).
6. *(Optional)* Add your custom domain under **Settings ➔ Domains** (e.g. `audit.hiveclicks.com`).

### Option B: Deploy with Netlify
1. Go to [netlify.com](https://netlify.com) and connect your GitHub repository.
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Click **"Deploy site"**.

---

## 🔗 Adding the "Free SEO Checker" Button to Your Website

You can link to this tool from your main website or navigation header using a button:

```html
<a 
  href="https://your-deployed-url.vercel.app#audit-tool" 
  class="btn-seo-checker"
  style="background: #f59e0b; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 8px; text-decoration: none;"
>
  Free SEO & AEO Checker
</a>
```

When users click the button on your site, it takes them directly to the audit tool, captures their contact information, and generates their audit report!

---

## 🔐 Admin Access

To view captured leads, navigate to:
```
https://your-deployed-url.vercel.app/admin
```
- **Default Passcode:** `hiveclicks` (or `admin123`)
- Click **"Export Leads (CSV)"** at any time to download all submitted contact details and scores.

---

## ⚙️ Environment Variables (Optional)

In your deployment dashboard (or `.env.local`):
```env
# Optional: Webhook URL to receive lead alerts in Slack, Zapier, or Make
LEADS_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Optional: Custom admin passcode
ADMIN_PASSWORD="your-secure-password"
```

---

## 💻 Local Development

To run the application locally on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```
