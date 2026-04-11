# Bill The Dev — Portfolio

Dark sci-fi portfolio built with **Next.js 14**, **React Three Fiber**, **Framer Motion**, and **Tailwind CSS**.  
Static export (`output: "export"`) — no server required, deployable to GitHub Pages, Vercel, or any CDN.

---

## Quick Start

```bash
# Install dependencies
npm install

# Compile blog posts (markdown → JSON)
npm run compile-posts

# Start dev server
npm run dev

# Production build (static export)
npm run build
```

The `prebuild` script automatically runs `optimize-assets.mjs` and `compile-posts.mjs` before `next build`.

---

## Environment Variables

Create `.env.local` at project root:

```env
# YouTube Data API v3 key (Google Cloud Console)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key

# Admin password hash (SHA-256)
# Generate: node scripts/gen-admin-hash.mjs "YourPassword"
NEXT_PUBLIC_ADMIN_HASH=your_hash

# Google Apps Script URL (analytics endpoint)
NEXT_PUBLIC_GAS_URL=your_gas_url
```

### How to get YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable **YouTube Data API v3**
3. Create Credentials → API Key
4. Restrict key to YouTube Data API v3 only

### How to set Admin Password
```bash
node scripts/gen-admin-hash.mjs "YourSecretPassword"
# Copy output → set as NEXT_PUBLIC_ADMIN_HASH in .env.local
```

---

## Pages

### `/` — Homepage

**File:** `app/page.tsx`

The main landing page — designed for recruiters scanning in 10-15 seconds. Sections load in order of impact:

| Order | Section | Component | Description |
|-------|---------|-----------|-------------|
| 1 | Hero | `components/sections/Hero.tsx` | Name, title, short bio, **Download CV** + **Play My Games** buttons, social links, 3D hologram model |
| 2 | Impact Numbers | `components/sections/ImpactNumbers.tsx` | 4 key stats — YouTube total views (fetched live from 3 channels), 8+ open-source repos, 6 shipped titles, 3-in-1 skillset |
| 3 | Trusted By | `components/sections/TrustedBy.tsx` | Company logos (Gameloft, FPT IS, etc.) — clickable to reveal company stories |
| 4 | Experience | `components/sections/Experience.tsx` | Dev + Teaching experience toggle — timeline cards with role, company, dates, highlights |
| 5 | Big Productions | `components/sections/BigProductions.tsx` | Featured shipped game titles with scroll-to-portfolio links |
| 6 | Testimonials | `components/sections/Testimonials.tsx` | 3-column testimonial cards with animated entrance |
| 7 | YouTube Channels | `components/sections/YouTubeChannels.tsx` | Live stats for 3 channels (@BillTheDev, @BillVRGamer, @BillAITrainer) — subscribers, views, video count |
| 8 | Portfolio | `components/sections/Portfolio.tsx` | Project grid with category filters, load-more pagination, click to open detail modal |
| 9 | Interactive Lab CTA | *(inline in page.tsx)* | Links to `/arcade` (Game Arcade) and `/lab` (Dev Lab) |
| 10 | Certifications | `components/sections/Certifications.tsx` | Credential badges with external verification links |
| 11 | Feed | `components/sections/Feed.tsx` | Social media embeds (Facebook, YouTube, LinkedIn) — date-sorted, iframe sanitized |
| 12 | Contact CTA | `components/sections/ContactCTA.tsx` | Email, LinkedIn, GitHub, phone — direct contact actions |

**Background:** `ParticleBackground` (Three.js animated particle sphere) renders behind all content via a fixed layer.

**Overlay:** `ProjectModal` — full-screen modal triggered from Portfolio cards, shows gallery slider, tags, description, links.

---

### `/arcade` — Game Arcade

**File:** `app/arcade/page.tsx`  
**Main Component:** `components/sections/GameArcade.tsx`

WebGL game library — Unity games playable directly in the browser.

**How it works:**
1. Reads game list from `public/webgl-games/registry.json`
2. Displays game cards with genre icons, status badges (playable/WIP), thumbnails
3. Clicking a game loads the Unity WebGL player (`components/webgl/UnityPlayer.tsx`)
4. Player supports: fullscreen, mute/unmute, reload, loading progress bar, error handling

**Available games** (in `public/webgl-games/`):
- SmulieCatNinja — Ninja platformer
- brush-hit — Paint/drawing game
- food-ping-pong — Pong variant
- mushroom-game — Merge puzzle
- typing-fight — Typing fighter
- zeno — Additional game

**Adding a new game:**
```bash
node scripts/add-game.mjs --name "Game Name" --slug game-slug --path public/webgl-games/game-slug
```
This parses Unity build files, detects loader/data/framework/wasm, and updates `registry.json`.

---

### `/lab` — Dev Lab (Blog)

**File:** `app/lab/page.tsx`  
**Components:** `components/lab/PostGrid.tsx`, `PostCard.tsx`

Technical blog for shader breakdowns, Unity tutorials, and tech art devlogs.

**Features:**
- Search bar — client-side full-text filter on title, excerpt, tags
- Category filter — buttons with post counts (shader-breakdown, tech-art, unity-dev, tools, devlog, tutorial)
- Tag pills — toggle to filter by tag
- Animated grid — Framer Motion AnimatePresence with load-more pagination
- Zustand state — `hooks/useLabStore.ts` manages filter/search state

**Architecture:**
```
content/posts/*.md  →  scripts/compile-posts.mjs  →  data/posts.json  →  Next.js pages
     (source)              (build step)               (generated)         (static HTML)
```

Posts are markdown files with YAML frontmatter. At build time, `compile-posts.mjs` compiles them to HTML with syntax highlighting and outputs `data/posts.json`. Next.js then generates static pages via `generateStaticParams()`.

---

### `/lab/[slug]` — Blog Post Page

**File:** `app/lab/[slug]/page.tsx`  
**Components:** `PostHeader.tsx`, `PostBody.tsx`, `TableOfContents.tsx`, `ScrollTracker.tsx`

Individual blog post with:

| Feature | Component | Description |
|---------|-----------|-------------|
| Header | `PostHeader.tsx` | Cover image, title, category badge, date, reading time, tag list, back link |
| Body | `PostBody.tsx` | Compiled HTML rendered in `.lab-prose` (custom typography in `globals.css`) |
| Table of Contents | `TableOfContents.tsx` | Sticky sidebar (desktop only), IntersectionObserver highlights active heading |
| Navigation | *(inline)* | Previous/Next post links at bottom |
| Analytics | `ScrollTracker.tsx` | Invisible — tracks `post_view`, scroll depth (25/50/75/100%), `post_read_complete` via sendBeacon to GAS |

**Syntax highlighting:** Prism theme in `globals.css` — supports HLSL, C#, GLSL, TypeScript, Python, and more. Dark sci-fi palette (amber keywords, green strings, blue functions on `#0A0A0A`).

**SEO:** `generateMetadata()` sets per-post `<title>` and `<meta description>`.

---

### `/cmd-center` — Admin Dashboard

**File:** `app/cmd-center/page.tsx`  
**Components:** `components/admin/AdminAuth.tsx`, `AdminDashboard.tsx`, `BlogAdmin.tsx`

Hidden admin panel for site management. Access at `yoursite.com/cmd-center`.

**Authentication:**
- Password hashed client-side with SHA-256, compared against `NEXT_PUBLIC_ADMIN_HASH`
- 4-hour session stored in cookies
- Attempt throttling to prevent brute force

**Dashboard sections:**

| Section | Description |
|---------|-------------|
| YouTube Analytics | Live channel stats (subscribers, views, videos) for all 3 channels — auto-refresh with manual sync button |
| Portfolio Overview | Counts from `resume.json` — projects, companies, productions, testimonials, tech stack, certifications |
| Lab Posts | Blog post list with title, date, category, reading time, featured badge, link to view each post |
| Quick Actions | Links to homepage, arcade, dev lab, GitHub, YouTube channels, Google Search Console |

---

## Blog Authoring Workflow

### 1. Create a new post

```bash
node scripts/new-post.mjs "Your Post Title" --category shader-breakdown --tags "HLSL,Unity,URP"
```

Available categories: `shader-breakdown`, `tech-art`, `unity-dev`, `tools`, `devlog`, `tutorial`

This creates `content/posts/your-post-title.md` with frontmatter scaffold:

```markdown
---
title: "Your Post Title"
date: "2026-04-11"
excerpt: ""
coverImage: ""
category: "shader-breakdown"
tags: ["HLSL", "Unity", "URP"]
published: true
featured: false
---

Your content here...
```

### 2. Write content

Write markdown with:
- Standard markdown (headings, bold, italic, lists, links, images)
- GFM extensions (tables, strikethrough)
- Fenced code blocks with language tags (```hlsl, ```csharp, ```glsl, ```typescript, etc.)
- Raw HTML if needed (e.g. embedded iframes)

### 3. Preview locally

```bash
npm run compile-posts && npm run dev
```

Visit `http://localhost:3000/lab/your-post-title` to preview.

### 4. Deploy

Commit the `.md` file and push. CI runs `prebuild` (optimize-assets + compile-posts) → `next build` → static pages generated.

---

## Project Structure

```
BillPortfolio/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout (fonts, smooth scroll, analytics)
│   ├── globals.css                 # Global styles, .lab-prose typography, Prism theme
│   ├── arcade/page.tsx             # Game Arcade
│   ├── lab/
│   │   ├── page.tsx                # Blog listing
│   │   └── [slug]/page.tsx         # Individual blog post
│   ├── cmd-center/page.tsx         # Admin dashboard
│   └── actions/
│       ├── auth.ts                 # Admin auth server action
│       └── youtube.ts              # YouTube API server action
│
├── components/
│   ├── sections/                   # Homepage sections (Hero, Portfolio, Feed, etc.)
│   ├── lab/                        # Blog components (PostCard, PostGrid, TOC, etc.)
│   ├── admin/                      # Admin dashboard components
│   ├── canvas/                     # Three.js/R3F 3D components
│   ├── overlay/                    # ProjectModal
│   ├── webgl/                      # UnityPlayer for game arcade
│   ├── ui/                         # Shared UI (Badge, GlitchText, DownloadBtn, etc.)
│   ├── layout/                     # SmoothScroll wrapper
│   └── logic/                      # PipelineTrigger (analytics init)
│
├── content/
│   └── posts/                      # Markdown blog posts (source)
│       ├── toon-shading-unity-urp.md
│       └── gpu-instancing-interactive-foliage.md
│
├── data/
│   ├── resume.json                 # Master data (experience, portfolio, companies, etc.)
│   ├── resume.ts                   # Typed import wrapper
│   ├── posts.json                  # GENERATED — compiled blog posts (gitignored)
│   └── posts.ts                    # Typed import wrapper for posts
│
├── hooks/
│   ├── useStore.ts                 # Zustand — modal state, active filter
│   ├── useLabStore.ts              # Zustand — blog category, tags, search
│   └── useAnalyticsPipeline.ts     # Privacy-respecting analytics hook
│
├── scripts/
│   ├── compile-posts.mjs           # Markdown → JSON build pipeline
│   ├── new-post.mjs                # Scaffold new blog post
│   ├── add-game.mjs                # Register Unity WebGL game
│   ├── gen-admin-hash.mjs          # Generate admin password hash
│   ├── optimize-assets.mjs         # Image/video optimization (WebP/WebM)
│   └── setup-env.mjs               # Environment config init
│
├── public/
│   ├── webgl-games/                # Unity WebGL game builds + registry.json
│   ├── image/                      # Photos, logos, project screenshots
│   ├── models/                     # 3D models (hero-model.glb)
│   └── Bill_Resume.pdf             # Downloadable CV
│
├── lib/
│   └── utils.ts                    # cn(), getAssetPath(), getYoutubeThumbnail(), etc.
│
├── types/
│   └── index.ts                    # TypeScript types (ResumeData, BlogPost, etc.)
│
├── next.config.mjs                 # Static export, security headers, image remotes
├── tailwind.config.ts              # Primary color (#FFB84D), custom fonts, animations
├── tsconfig.json                   # Strict mode, path alias @/*
└── package.json                    # Scripts, dependencies
```

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Production build (prebuild runs automatically) |
| `prebuild` | `optimize-assets + compile-posts` | Optimize images and compile blog posts before build |
| `compile-posts` | `node scripts/compile-posts.mjs` | Compile markdown posts to `data/posts.json` |
| `optimize` | `node scripts/optimize-assets.mjs` | Convert images to WebP, videos to WebM |
| `add-game` | `node scripts/add-game.mjs` | Register a new Unity WebGL game |
| `start` | `next start` | Start production server (not used for static export) |
| `lint` | `next lint` | Run ESLint |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, static export) |
| UI | React 18, Tailwind CSS 3, Framer Motion |
| 3D | React Three Fiber, Three.js, Drei |
| State | Zustand |
| Scrolling | Lenis (smooth scroll) |
| Blog Pipeline | unified, remark, rehype, gray-matter, rehype-prism-plus |
| Game Hosting | Unity WebGL Player (custom React wrapper) |
| Analytics | Google Apps Script (sendBeacon, privacy-respecting) |
| Icons | Lucide React |
| Fonts | Outfit (sans), JetBrains Mono (mono) |

---

## Analytics

Privacy-respecting analytics via Google Apps Script:

**Page-level** (`useAnalyticsPipeline.ts`):
- Page path, referrer, UTM params
- No IP collection, no User-Agent fingerprinting
- Respects Do Not Track (DNT)

**Blog post-level** (`ScrollTracker.tsx`):
- `post_view` — fires once per session per slug (sessionStorage dedup)
- `post_scroll` — fires at 25%, 50%, 75%, 100% scroll depth
- `post_read_complete` — fires when time on page >= 80% of estimated reading time

All events sent via `navigator.sendBeacon()` to the GAS endpoint.

---

## Security

- **Content Security Policy** and security headers configured in `next.config.mjs`
- **Feed iframes** sanitized with domain whitelist (facebook.com, linkedin.com, youtube.com, vimeo.com)
- **Admin auth** uses SHA-256 hashing with attempt throttling (no plain-text passwords)
- **No IP fingerprinting** — previous ipwho.is tracking removed
- **Static export** — no server-side attack surface
