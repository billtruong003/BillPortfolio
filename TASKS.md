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

## Phase 2 — Analytics / traffic ✅ code xong 13/09/2026, chờ token

Chọn **A. Cloudflare Web Analytics** (free, không cookie, không cần banner).

- [x] `components/logic/Analytics.tsx`: chèn beacon Cloudflare, **chỉ render khi có** `NEXT_PUBLIC_CF_BEACON_TOKEN` → local/fork không dính gì
- [x] Gắn vào `app/layout.tsx`
- [x] `deploy.yml` truyền `NEXT_PUBLIC_CF_BEACON_TOKEN` vào bước build
- [x] `lib/analytics.ts`: một `track()`/`trackOnce()` cho mọi custom event, tôn trọng Do Not Track, không có endpoint thì im lặng bỏ qua
- [x] Event mới: `game_play` (UnityPlayer), `cv_download` (DownloadBtn). `post_view`/`post_scroll`/`post_read_complete` chuyển từ code lặp trong ScrollTracker sang dùng chung
- [ ] **Bill làm**: Cloudflare Dashboard → Web Analytics → Add site `www.billthedev.com` → copy beacon token → GitHub repo Settings → Secrets → thêm `NEXT_PUBLIC_CF_BEACON_TOKEN`. Không cần đụng code.

**Lưu ý đổi so với kế hoạch cũ**: Cloudflare Web Analytics **không có API custom event** (chỉ page view + Core Web Vitals). Nên pipeline Google Apps Script **giữ lại** để nhận 5 event tuỳ chọn, không bỏ như dự định ban đầu. Muốn bỏ hẳn GAS thì phải đổi sang GA4 hoặc Cloudflare Zaraz — quyết định sau khi xem CF chạy một tuần.

- [ ] Ghi nhớ: GitHub repo → Insights → Traffic chỉ giữ 14 ngày, chỉ tính clone/visit repo, KHÔNG phải traffic của site

---

## Phase 3 — Dọn toàn site ✅ xong 13/09/2026 (trừ mục cần tài khoản của Bill)

### 3.1 Repo / tooling
- [x] `.gitignore`: thêm `.lh/`, `git rm -r --cached .lh`, bỏ 4 dòng trỏ file đã xoá
- [x] Xoá 29 PNG/JPG gốc đã có `.webp` + `hero-model.glb.original` → **13.9 MB**. 31 tham chiếu trong `content/` và `resume.json` đổi sang `.webp`
- [x] Xoá `postcss.config.mjs` (trùng, gọi package không cài)
- [x] Xoá `app/actions/auth.ts`, `app/actions/youtube.ts` (server action chết với `output: export`)
- [x] `.gitattributes` viết lại (rule LFS cũ trỏ file không còn tồn tại)
- [x] Sửa lint: bỏ `eslint.config.mjs` (flat config của ESLint 9) → `.eslintrc.json` cho ESLint 8 đang cài. Sửa hết **7 lỗi**, đáng chú ý là hook gọi sau early-return trong `Hero3D` — sẽ crash React khi GLB load xong giữa chừng
- [x] `deploy.yml` thêm `tsc --noEmit` + `lint` trước build; thêm `ci.yml` chạy trên PR và mọi branch (build không cần secret)
- [x] `.github/dependabot.yml`: npm weekly gộp minor/patch, chặn major của next/react/tailwind/eslint; github-actions monthly
- [x] `npm audit`: sharp 0.34 → 0.35.4 hết CVE libvips (9 → 8)
- [ ] Còn 8 advisory, **không cái nào khai thác được ở đây**, đều cần major:
  - `next` (critical, DoS qua Image Optimizer): site dùng `output: export` + `images.unoptimized` → **không có Image Optimizer để tấn công**. Cần Next 16.
  - `postcss` XSS: chỉ chạy lúc build, không chạy ở runtime người dùng.
  - `glob`/`minimatch`/`@typescript-eslint`: devDependency của eslint, chỉ ảnh hưởng khi chạy glob CLI.
- [ ] Kế hoạch upgrade major (branch riêng): Next 14→16, React 18→19, Tailwind 3→4, ESLint 8→9. Làm gọn được luôn 8 advisory trên.

### 3.2 Data / nội dung
- [x] `data/resume.json` thêm khối `stats` (shippedTitles, openSourceRepos); `ImpactNumbers` đọc từ đó thay vì hard-code, số kênh lấy từ `CHANNELS.length`
- [x] Hero coords `34.0522° N, 118.2437° W` (Los Angeles) → `10.7769° N, 106.7009° E` (HCMC)
- [x] Cert không có `url` render `<div>` thay vì `<a href="">` (IELTS)
- [x] `data/channels.ts` là nguồn duy nhất cho 3 kênh YouTube; `AdminDashboard` hết channel id giả `UCxxx_BillVRGamer` và hết thiếu kênh thứ ba; `YouTubeChannels` và `ImpactNumbers` dùng chung
- [x] README: danh sách game theo registry (9), sửa cú pháp `add-game.mjs`, bỏ "phone" khỏi mô tả Contact CTA, thêm biến `NEXT_PUBLIC_CF_BEACON_TOKEN`

### 3.3 Hạ tầng
- [x] Icon theo convention Next: `apple-touch-icon.png` → `app/apple-icon.png`, `site.webmanifest` → `app/manifest.webmanifest` (điền name/theme/background, trước đó name rỗng và icon trỏ 404). 4 PNG còn lại chuyển sang `public/`. Trước đó **5 file icon không hề ra được build**; giờ `<link rel="manifest">` và `<link rel="apple-touch-icon">` đã xuất hiện
- [ ] **Bill làm**: YouTube API key → Google Cloud Console → restrict HTTP referrer `*.billthedev.com/*`
- [ ] **Bill làm**: R2 gắn custom domain `cdn.billthedev.com` thay `pub-*.r2.dev`, cập nhật `registry.json`
- [ ] **Bill làm**: build Brotli + set `Content-Encoding: br` trên R2 (Merge Fruit 129 MB, shmup 49 MB)
- [ ] (Tuỳ chọn) Fetch YouTube stats lúc build trong GitHub Action + cron redeploy → client không cần key

### 3.4 UX / a11y
- [x] Hero mobile: tên + CTA lên trên fold. Trước đó khung 3D `order-1 h-[500px]` đẩy hết chữ xuống dưới; giờ chữ `order-1`, model `order-2 h-[40vh]`. Đo trên 375×812: nút Download CV ở y 481–539, trong màn hình
- [x] 8 link/button icon-only đã có `aria-label` (side nav Hero, social, ProjectModal prev/next/close, UnityPlayer info/mute/fullscreen/close)
- [x] `cmd-center`: **giữ**, sửa copy sai sự thật "ALL ACCESS ATTEMPTS ARE LOGGED" → "PERSONAL DASHBOARD • SHA-256 CLIENT-SIDE CHECK / SESSION-ONLY, NOTHING IS RECORDED". Bỏ hẳn trang thì tiết kiệm 137 kB, để Bill quyết
- [ ] **Bill quyết**: form liên hệ (Formspree / Web3Forms) thay `mailto:` — cần tạo tài khoản lấy endpoint

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
- [x] Viết 12 bài vào `content/posts/unity-shmup/` (series `shmup`, 62 phút đọc, 80 ảnh WebP)
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
