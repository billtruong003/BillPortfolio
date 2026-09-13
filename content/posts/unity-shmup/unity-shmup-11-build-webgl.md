---
title: "Shmup #11: Build WebGL và đưa game lên web"
date: "2026-09-24"
lang: "vi"
series: "shmup"
order: 11
excerpt: "Player Settings cho WebGL, Build Profiles, vì sao wasm to và Managed Stripping giảm được bao nhiêu, chạy thử local, và cách trang này host build."
coverImage: "/images/posts/unity-shmup/11/cover.webp"
category: "unity-dev"
tags: ["Unity", "WebGL", "Build", "Deploy", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- Player Settings tối thiểu cho WebGL: Company/Product, Compression, Stripping, Run In Background
- Build Profiles: chỉ đưa scene cần thiết vào build
- Cấu trúc thư mục build WebGL và vì sao không mở `index.html` trực tiếp được
- Đưa build vào trang web: `registry.json` + host trên CDN

Kết quả: game chơi được ở [Arcade → Shoot 'em up (Dev Lab)](/arcade?game=shmup).

## 1. Player Settings

**Edit → Project Settings → Player**:

![Player settings](/images/posts/unity-shmup/11/build_01_player-settings-webgl.webp)

| Mục | Giá trị | Vì sao |
|-----|---------|--------|
| Company / Product Name | BillTheDev / ShootEmUp | Thành tên file build, hiện trên tab trình duyệt |
| Resolution → Default Canvas Width/Height | 540 × 960 | Tỉ lệ 9:16 như Game view |
| Run In Background | ✓ | Chuyển tab không dừng game |
| Publishing → Compression Format | **Disabled** | Server mình đang phục vụ file thô; Gzip/Brotli cần header `Content-Encoding` đúng, làm sau |
| Publishing → Decompression Fallback | ✗ | Chỉ cần khi nén mà server không set header |
| Publishing → Data Caching | ✓ | Trình duyệt cache `.data` trong IndexedDB, lần 2 mở nhanh |
| Other → Managed Stripping Level | **High** | Xem mục 3 |
| Publishing → Enable Exceptions | None | Nhỏ hơn, nhanh hơn; khi debug build đặt lại "Explicitly Thrown Exceptions Only" |

## 2. Build

**File → Build Profiles → Web → Switch Platform** (lần đầu reimport mất vài phút). Scene List chỉ tick `SEU_10_Juice`. Build → folder `Builds/WebGL/ShootEmUp` (ngoài Assets, gitignore).

Kết quả:

```
ShootEmUp/
  index.html
  TemplateData/
  Build/
    ShootEmUp.loader.js
    ShootEmUp.framework.js
    ShootEmUp.wasm
    ShootEmUp.data
```

## 3. Vì sao wasm to, và giảm được bao nhiêu

| File | Stripping Minimal | Stripping High + no exceptions |
|------|-------|-------|
| `.wasm` | 48.1 MB | **38.7 MB** |
| `.data` | 13.2 MB | **10.3 MB** |
| Tổng | 62 MB | **49 MB** |
| Thời gian build | 6 phút 20 s | 6 phút 15 s |

Stripping Minimal giữ gần hết engine + TMP + Input System. High cắt code không dùng tới, giảm 21%. Vẫn lớn vì chưa nén: bật Brotli + header trên CDN sẽ đưa wasm về ~8–10 MB tải xuống. `.data` 10 MB chủ yếu là texture sprite NPOT không nén (bài 0) + font TMP; Sprite Atlas xử lý ở series sau.

WebGL build lâu vì compile C# → IL2CPP → Emscripten → wasm. Đừng build mỗi lần sửa nhỏ; test trong editor.

## 4. Chạy thử local

Không mở `index.html` trực tiếp (file://): trình duyệt chặn wasm. Chạy một web server tĩnh trong folder build:

```bash
npx serve Builds/WebGL/ShootEmUp
```

## 5. Đưa lên trang web

Trang này load game từ `public/webgl-games/registry.json`. Mỗi game một entry: `buildPath` (URL folder `Build/`), `buildName`, tỉ lệ hiển thị, controls:

```json
{
  "id": "shmup",
  "title": "Shoot 'em up (Dev Lab)",
  "build": { "buildPath": ".../shmup/Build", "buildName": "ShootEmUp", "compression": "none" },
  "display": { "fixedRatio": true, "ratioWidth": 9, "ratioHeight": 16 },
  "controls": { "keyboard": ["WASD / Arrow Keys — Move", "Space — Fire"] }
}
```

Component `UnityPlayer` đọc entry, tải `loader.js`, gọi `createUnityInstance` với `dataUrl`, `frameworkUrl`, `codeUrl` ghép từ `buildPath`. `Build/` không commit vào git (49 MB), mà upload lên Cloudflare R2 rồi trỏ `buildPath` sang đó.

Kiểm tra trên trang: loader → framework → wasm → data đều 200, console `[UnityCache] ShootEmUp.data successfully downloaded and stored`, game chạy trong khung 9:16.

## Series kết thúc ở đây

12 bài, một game, mọi khái niệm cơ bản của Unity 2D đều đã chạm: scene, sprite, input, physics, prefab, pool, ScriptableObject, coroutine, UI, event, audio, shader, particle, build. Mã nguồn đầy đủ trong repo Unity Lab (link cập nhật sau), mỗi bài một tag `lesson-NN`.

Bài tập tự làm:
- Kẻ địch bắn xuống (layer `EnemyProjectile` đã có sẵn, `Projectile` dùng `transform.up` nên xoay prefab 180° là xong)
- Drone hỗ trợ (`support` sprite) bay theo tàu và bắn thêm một nòng
- Boss cuối wave với `Health` 30 và 3 pha bắn
- Pause menu với Action Map `UI`

Series tiếp theo: **Platformer 2D** — Tilemap, coyote time, Animator, Cinemachine.
