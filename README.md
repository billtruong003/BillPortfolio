# Portfolio Update — Security Fix, YouTube Stats, Admin Panel

## 1. WHY YOUR SITE GETS FLAGGED AS "SUSPICIOUS"

### Root Causes Found:

**A. Aggressive IP Fingerprinting (`useAnalyticsPipeline.ts`)**
- Fetches visitor IP from `ipwho.is` (third-party fingerprinting service)
- Sends collected data via `no-cors` POST to Google Apps Script
- Collects User-Agent, UTM params, path — classic tracking/phishing pattern
- **This is the #1 reason** browsers and antivirus flag your site

**B. `dangerouslySetInnerHTML` with external iframes**  
- Loading Facebook/LinkedIn embeds via raw HTML injection
- Security scanners see this as potential XSS injection vectors

**C. Missing Security Headers**
- No Content-Security-Policy (CSP)
- No X-Content-Type-Options
- No Referrer-Policy

### Solution Applied:
- **Replaced** aggressive IP tracking with a privacy-respecting, lightweight analytics hook
- **Added** security headers in `next.config.mjs`
- **Added** security meta tags in layout

---

## 2. NEW FILES CREATED

### Security Fix:
- `hooks/useAnalyticsPipeline.ts` — **REWRITTEN** (privacy-respecting version)
- `next.config.mjs` — **UPDATED** (added security headers)
- `app/layout.tsx` — **UPDATED** (added security meta tags)

### YouTube Channel Stats:
- `components/sections/YouTubeChannels.tsx` — NEW (real-time stats display)
- `app/page.tsx` — **UPDATED** (added YouTube section)

### Admin Panel:
- `app/cmd-center/page.tsx` — NEW (hidden admin dashboard)
- `components/admin/AdminDashboard.tsx` — NEW (dashboard UI)
- `components/admin/AdminAuth.tsx` — NEW (login gate)

---

## 3. ENVIRONMENT VARIABLES NEEDED

Add these to your `.env.local`:

```env
# YouTube Data API v3 key (get from Google Cloud Console)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Admin password (SHA-256 hash of your password)
# Generate: echo -n "your_password" | sha256sum
NEXT_PUBLIC_ADMIN_HASH=your_sha256_hash_here

# Google Apps Script URL (keep if you still want basic analytics)
NEXT_PUBLIC_GAS_URL=your_gas_url_here
```

### How to get YouTube API Key:
1. Go to https://console.cloud.google.com
2. Create project → Enable "YouTube Data API v3"
3. Create Credentials → API Key
4. Restrict to "YouTube Data API v3" only

### How to set Admin Password:
```bash
# In terminal, generate hash of your desired password:
echo -n "YourSecretPassword123" | sha256sum
# Copy the hash output → set as NEXT_PUBLIC_ADMIN_HASH
```

---

## 4. ACCESS POINTS

- **Admin Panel**: `yoursite.com/cmd-center`
- **YouTube Stats**: Visible on homepage (new section before Experience)