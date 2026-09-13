# BillPortfolio — Task Board

Cập nhật: 2026-09-13. Tick `[x]` khi xong. Thứ tự phase là thứ tự làm.

---

## Phase 1 — Dọn Lab (`/lab`) ✅ xong 13/09/2026 (branch claude/stoic-maxwell-h8rb38, chưa merge main)

### 1.1 Lỗi thấy được ngay
- [x] Bổ sung 2 ảnh cover bị thiếu: `public/images/posts/toon-shader-cover.jpg`, `public/images/posts/biome-shader-cover.jpg` (2 bài featured đang vỡ ảnh, live 404)
  - ⚠ Đang dùng placeholder theme (sinh bằng sharp). Thay bằng screenshot thật khi có Unity shader lab (Phase 4)
- [x] Kéo ảnh cover hotlink về local (pinimg, vnexpress, m2h.nl) → `public/images/posts/`, đổi frontmatter `coverImage`
- [x] Quét ảnh trong body các bài (reddit, discourse-cdn, britannica, futurecdn...) → tải về local hoặc bỏ
  - Đã bỏ 6 ảnh không tải được bằng script: 4 ảnh reddit (403 với curl/node, browser vẫn xem được), m2h.nl Profiler.png (410 Gone), docs.unity3d InstallWindow.png (trả HTML)
- [x] `next.config.mjs`: thêm `trailingSlash: true` (hiện `/lab/`, `/lab/<slug>/` 404 trên GitHub Pages)
- [x] `app/not-found.tsx` theo theme (đang dùng 404 mặc định của Next)

### 1.2 SEO / share
- [x] `generateMetadata` từng bài: `openGraph` (title, description, type=article, publishedTime, tags) + `twitter.card=summary_large_image` + `alternates.canonical`
- [x] OG image mặc định cho site (`app/opengraph-image.png` 1200×630) và cho `/lab`
- [x] `app/sitemap.ts` + `app/robots.ts` (static export hỗ trợ, live đang 404)
- [x] RSS feed `/lab/feed.xml` sinh tĩnh lúc build (thêm vào `scripts/compile-posts.mjs` hoặc route handler static)
- [x] JSON-LD `Article` cho bài viết, `Person` cho trang chủ
- [x] `lang`: bài tiếng Việt set `lang="vi"` ở `<article>` (hoặc thêm field `lang` vào frontmatter)

### 1.3 Pipeline nội dung
- [x] Quyết định `data/posts.json`: gitignore (khuyến nghị, vì prebuild sinh lại) HOẶC bỏ khỏi prebuild. Hiện commit + sinh lại → drift mỗi build
- [x] `scripts/compile-posts.mjs`: fail build nếu `coverImage` local không tồn tại, warn nếu ảnh hotlink
- [x] Thêm field frontmatter `series` + `order` thay cho regex slug trong `lib/series.ts`
- [x] Trang danh sách series `/lab/series/<id>` (C#, Unity, Swift, Shader)
- [x] Bài mới: template `scripts/new-post.mjs` thêm sẵn `lang`, `series`, `coverImage`
- [x] Chuẩn hoá category: `shader-breakdown` cho toàn bộ bài shader (bài `shader-basic-unity-hlsl` đang là `tutorial`)

### 1.4 UX Lab
- [x] Trang arcade và `/lab` thiếu `h1`
- [x] Nút / link chỉ có icon → thêm `aria-label` (LabNav, PostHeader back link)
- [x] `prefers-reduced-motion`: tắt Lenis + Framer animation khi user bật
- [x] TOC: highlight heading đang đọc (kiểm tra `TableOfContents.tsx` + `ScrollTracker.tsx` hoạt động sau khi bật `trailingSlash`)
  - Logic IntersectionObserver giữ nguyên, thêm `scroll-margin-top` cho h2/h3. Chưa xem được bằng mắt vì Browser pane ẩn → Bill mở /lab/csharp-01-basics/ cuộn thử

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

## Phase 4 — Unity Lab: series bài viết có dự án thật 🎮

Project Unity riêng: `D:\Projects\Tutorial` (Unity 6000.3.10f1, URP, Input System, MCP AnkleBreaker). Một project chứa nhiều mini game, mỗi game một folder `Assets/_<Game>/`, code chung ở `Assets/_Common/`. Tư liệu viết bài nằm ở `Docs/<Game>/` (plan, features, journal từng bài, captures). Mỗi bài xong đánh git tag `lesson-NN`.

### 4.1 Roadmap series (chốt 13/09/2026)
| # | Series | Game | Trạng thái |
|---|--------|------|-----------|
| 1 | Unity cơ bản | (bài setup đã có) | viết lại theo Unity 6 khi biên tập |
| 2 | 2D Shoot 'em up | `_ShootEmUp` | ✅ **12/12 bài dựng xong** (00–11), journal + ảnh + clip đầy đủ, build WebGL chạy trên /arcade |
| 3 | 2D Platformer | `_Platformer2D` | ⬜ |
| 4 | 3D Movement (kiểu Catlike) | `_Movement3D` | ⬜ |
| 5 | 3D Game nhỏ | `_Arena3D` | ⬜ |
| 6 | Shader (URP) | `_Shader` | ⬜ (bài 10 shmup đã có shader HLSL đầu tiên: SpriteFlash) |

### 4.2 Shoot 'em up — việc còn lại trước khi viết bài
- [ ] Upload `D:\Projects\Tutorial\Builds\WebGL\ShootEmUp\Build` lên R2: `node scripts/upload-r2-assets.mjs <folder> shmup/Build` (cần env R2), rồi đổi `buildPath` trong `registry.json` từ `/webgl-games/shmup/Build` sang URL R2 — Bill làm (hiện chỉ chạy local vì `Build/` gitignore)
- [ ] Chụp tay các ảnh ghi "chụp tay" trong journal (Hub, Package Manager, menu Create, Build Profiles, frame nổ)
- [ ] Ảnh Input Actions editor với Move mở rộng (bản MCP đang gập)
- [ ] Biên tập ảnh (khoanh/mũi tên) theo cột "Edit" trong từng journal
- [ ] Viết 12 bài vào `content/posts/unity-shmup/` theo khung: hôm nay học gì → xong có gì → từng bước → chú ý → code
- [ ] Sau khi series mới lên: unpublish 5 bài "Unity Cho Người Mới" cũ (hoặc giữ, thêm banner link sang series mới)
- [ ] Đổi tên prefab `Enemy_Insect` → `Enemy_Generic` (giờ đóng vai cả thiên thạch)
- [ ] Bật Brotli cho build + header trên R2 (Phase 3.3) để 49 MB → ~12 MB tải xuống

### 4.3 Quy trình 1 bài (đã chạy 12 lần, giữ nguyên)
1. Journal-first: mục tiêu + tính năng khi xong
2. Dựng qua MCP từng bước, chụp Inspector **trước/sau** mỗi lần gắn reference, chụp Hierarchy, Game view (`screenshot/game` để có UI)
3. Play test bằng input tiêm (`InputSystem.QueueStateEvent`), đọc số liệu bằng `editor/execute-code`, ghi bảng vào journal
4. Frame → WebP động bằng sharp (xem `Docs/README.md` trong project Unity)
5. Lỗi gặp ghi nguyên văn + nguyên nhân + sửa
6. Commit + tag

## Icebox ❄️
- Trang `/lab/tags/<tag>`
- Dark/light toggle (site hiện dark-only, đang OK)
- i18n en/vi toàn site
- Newsletter
- Comments cho bài viết (giscus, dựa trên GitHub Discussions)
