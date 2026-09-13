# BillPortfolio — Task Board

Cập nhật: 2026-09-13. Tick `[x]` khi xong. Thứ tự phase là thứ tự làm.

---

## Phase 1 — Dọn Lab (`/lab`) 🔥 đang làm

### 1.1 Lỗi thấy được ngay
- [ ] Bổ sung 2 ảnh cover bị thiếu: `public/images/posts/toon-shader-cover.jpg`, `public/images/posts/biome-shader-cover.jpg` (2 bài featured đang vỡ ảnh, live 404)
- [ ] Kéo ảnh cover hotlink về local (pinimg, vnexpress, m2h.nl) → `public/images/posts/`, đổi frontmatter `coverImage`
- [ ] Quét ảnh trong body các bài (reddit, discourse-cdn, britannica, futurecdn...) → tải về local hoặc bỏ
- [ ] `next.config.mjs`: thêm `trailingSlash: true` (hiện `/lab/`, `/lab/<slug>/` 404 trên GitHub Pages)
- [ ] `app/not-found.tsx` theo theme (đang dùng 404 mặc định của Next)

### 1.2 SEO / share
- [ ] `generateMetadata` từng bài: `openGraph` (title, description, type=article, publishedTime, tags) + `twitter.card=summary_large_image` + `alternates.canonical`
- [ ] OG image mặc định cho site (`app/opengraph-image.png` 1200×630) và cho `/lab`
- [ ] `app/sitemap.ts` + `app/robots.ts` (static export hỗ trợ, live đang 404)
- [ ] RSS feed `/lab/feed.xml` sinh tĩnh lúc build (thêm vào `scripts/compile-posts.mjs` hoặc route handler static)
- [ ] JSON-LD `Article` cho bài viết, `Person` cho trang chủ
- [ ] `lang`: bài tiếng Việt set `lang="vi"` ở `<article>` (hoặc thêm field `lang` vào frontmatter)

### 1.3 Pipeline nội dung
- [ ] Quyết định `data/posts.json`: gitignore (khuyến nghị, vì prebuild sinh lại) HOẶC bỏ khỏi prebuild. Hiện commit + sinh lại → drift mỗi build
- [ ] `scripts/compile-posts.mjs`: fail build nếu `coverImage` local không tồn tại, warn nếu ảnh hotlink
- [ ] Thêm field frontmatter `series` + `order` thay cho regex slug trong `lib/series.ts`
- [ ] Trang danh sách series `/lab/series/<id>` (C#, Unity, Swift, Shader)
- [ ] Bài mới: template `scripts/new-post.mjs` thêm sẵn `lang`, `series`, `coverImage`
- [ ] Chuẩn hoá category: `shader-breakdown` cho toàn bộ bài shader (bài `shader-basic-unity-hlsl` đang là `tutorial`)

### 1.4 UX Lab
- [ ] Trang arcade và `/lab` thiếu `h1`
- [ ] Nút / link chỉ có icon → thêm `aria-label` (LabNav, PostHeader back link)
- [ ] `prefers-reduced-motion`: tắt Lenis + Framer animation khi user bật
- [ ] TOC: highlight heading đang đọc (kiểm tra `TableOfContents.tsx` + `ScrollTracker.tsx` hoạt động sau khi bật `trailingSlash`)

---

## Phase 2 — Analytics / traffic 📊

Chọn 1 trong 2 (khuyến nghị A, đã có tài khoản Cloudflare từ R2):

- [ ] **A. Cloudflare Web Analytics** (free, không cookie, không cần banner)
  - [ ] Tạo site trên CF Dashboard → Web Analytics → lấy beacon token
  - [ ] Thêm secret `NEXT_PUBLIC_CF_BEACON_TOKEN` vào GitHub repo Settings → Secrets, và vào `.github/workflows/deploy.yml`
  - [ ] Component `components/logic/Analytics.tsx` chèn `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"..."}'>` khi có token
  - [ ] Gắn vào `app/layout.tsx`
- [ ] **B. Google Analytics 4** (nếu muốn quen tay): `NEXT_PUBLIC_GA_ID` + `@next/third-parties/google` `<GoogleAnalytics/>`
- [ ] Bỏ pipeline Google Apps Script (`hooks/useAnalyticsPipeline.ts`, `components/logic/PipelineTrigger.tsx`, `NEXT_PUBLIC_GAS_URL`) sau khi A/B chạy ổn, hoặc giữ song song 1 tuần rồi bỏ
- [ ] Event tuỳ chọn: `game_play` (arcade), `cv_download`, `post_read_complete` (ScrollTracker đang gửi về GAS → chuyển sang provider mới)
- [ ] Ghi nhớ: GitHub repo → Insights → Traffic chỉ giữ 14 ngày, chỉ tính clone/visit repo, KHÔNG phải traffic của site

---

## Phase 3 — Dọn toàn site 🧹

### 3.1 Repo / tooling
- [ ] `.gitignore`: thêm `.lh/` rồi `git rm -r --cached .lh`
- [ ] Xoá `public/models/hero-model.glb.original` và các PNG/JPG gốc đã có `.webp` (memecrawler, sketchfabgallery, kindly*, life/*.jpg...)
- [ ] Xoá `postcss.config.mjs` (trùng, gọi `@tailwindcss/postcss` không được cài)
- [ ] Xoá `app/actions/auth.ts`, `app/actions/youtube.ts` (server action chết, không chạy với `output: export`)
- [ ] Xoá rule LFS stale trong `.gitattributes`
- [ ] Sửa lint: hạ `eslint.config.mjs` về `.eslintrc.json` (ESLint 8) HOẶC nâng ESLint 9 + eslint-config-next 15 (`npm run lint` hiện hỏi interactive rồi thoát)
- [ ] `deploy.yml`: thêm step `npx tsc --noEmit` + `npm run lint` trước build; thêm workflow `ci.yml` chạy trên PR
- [ ] Dependabot (`.github/dependabot.yml`, weekly, group minor/patch)
- [ ] `npm audit fix` (20 vuln, chủ yếu picomatch, sharp/libvips)
- [ ] Kế hoạch upgrade major: Next 14→15/16, React 18→19, Tailwind 3→4, drei 9→10, ESLint 8→9 (làm sau Phase 1–2, branch riêng)

### 3.2 Data / nội dung
- [ ] Đưa "6 shipped titles", "8+ repos" vào `data/resume.json` (đang hard-code ở Hero + ImpactNumbers, lệch với 8 game trong registry)
- [ ] Hero coords `34.0522° N, 118.2437° W` là Los Angeles → đổi sang HCMC `10.7769° N, 106.7009° E`
- [ ] Cert IELTS `url: ""` → bỏ link hoặc render `<span>` khi không có url
- [ ] `AdminDashboard.tsx`: channel id placeholder `UCxxx_BillVRGamer`, thiếu kênh thứ 3 → dùng chung 1 const `CHANNELS` với `YouTubeChannels.tsx` / `ImpactNumbers.tsx`
- [ ] README: cập nhật danh sách game (8), bỏ mục phone nếu không hiển thị

### 3.3 Hạ tầng
- [ ] YouTube API key: kiểm tra restrict HTTP referrer `*.billthedev.com/*` trên Google Cloud Console
- [ ] (Tuỳ chọn) Fetch YouTube stats lúc build trong GitHub Action + cron redeploy hằng ngày → client không cần key, không lo quota
- [ ] R2: gắn custom domain (`cdn.billthedev.com`) thay `pub-*.r2.dev`; cập nhật `registry.json`
- [ ] Unity WebGL: build Brotli + set `Content-Encoding: br` metadata trên R2, đổi `compression: "brotli"` trong registry (Merge Fruit đang 129 MB uncompressed)
- [ ] Icon: đổi tên `app/apple-touch-icon.png` → `app/apple-icon.png`, `site.webmanifest` → `manifest.webmanifest` (hoặc khai `metadata.icons` / `metadata.manifest`)

### 3.4 UX / a11y
- [ ] Hero mobile: tên + CTA lên trên fold (thu nhỏ khung 3D còn ~40vh hoặc đảo order trên mobile)
- [ ] 8 link/button icon-only ở trang chủ thiếu `aria-label` (social, side nav)
- [ ] `cmd-center`: quyết định giữ (sửa copy "ALL ACCESS ATTEMPTS ARE LOGGED", ghi rõ là dashboard cá nhân) hoặc bỏ (tiết kiệm 137 kB)
- [ ] Form liên hệ (Formspree / Web3Forms) thay `mailto:`

---

## Phase 4 — Shader Lab + content bằng Unity MCP 🎮

### 4.1 Setup
- [ ] Tạo repo riêng `BillShaderLab` (Unity 6 LTS, URP) — KHÔNG đặt trong repo portfolio
- [ ] Cấu trúc `Assets/_Project/Shaders/<TenBai>/` mỗi bài 1 folder: shader, material, scene demo, script hỗ trợ
- [ ] `.gitignore` Unity + Git LFS cho texture/model
- [ ] Cài MCP for Unity (CoplayDev) vào project, kết nối Claude Code **chạy local** trên máy (session cloud không thấy Unity Editor)
- [ ] Scene template `Demo_Template.unity`: camera cố định, lighting chuẩn, turntable, backdrop tối hợp theme web
- [ ] Script `Editor/CaptureTool.cs`: chụp PNG 1600×900 + sequence frame → ffmpeg thành WebP/MP4 cho bài viết

### 4.2 Quy trình 1 bài (lặp lại)
1. Chốt đề tài + outline (trong repo portfolio: `content/posts/shader/<slug>.md` với `published: false`)
2. Dùng Unity MCP dựng scene + viết shader theo từng bước, screenshot mỗi bước
3. Xuất ảnh/GIF → `public/images/posts/<slug>/`, chạy `npm run optimize`
4. Viết bài, `published: true`, build local kiểm tra, push

### 4.3 Đề tài đợt đầu (mỗi bài 1 demo playable/screenshot)
- [ ] Toon shading URP (viết lại bài hiện có với ảnh thật + code đầy đủ)
- [ ] Outline: inverted hull vs screen-space (nối với Bill SSOutline)
- [ ] Vertex displacement: cỏ/lá gió (nối với Bill Biome Shader)
- [ ] Dissolve / hologram (tái tạo hiệu ứng mascot ở Hero)
- [ ] Triplanar + world-space texturing
- [ ] Shader Graph → HLSL: đọc code Graph sinh ra
- [ ] Custom lighting URP (`Lighting.hlsl`, additional lights, shadows)
- [ ] Mobile/VR shader budget: đo bằng Frame Debugger, Quest profiling

---

## Icebox ❄️
- Trang `/lab/tags/<tag>`
- Dark/light toggle (site hiện dark-only, đang OK)
- i18n en/vi toàn site
- Newsletter
- Comments cho bài viết (giscus, dựa trên GitHub Discussions)
