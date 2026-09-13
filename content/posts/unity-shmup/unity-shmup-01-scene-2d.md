---
title: "Shmup #1: Scene 2D đầu tiên — camera, Sorting Layer, nền sao cuộn"
date: "2026-09-14"
lang: "vi"
series: "shmup"
order: 1
excerpt: "Camera orthographic, Game view dọc 1080×1920, Sorting Layer quyết định ai vẽ đè ai, Draw Mode Tiled cho nền lặp vô hạn, và script đầu tiên: ScrollingLayer."
coverImage: "/images/posts/unity-shmup/01/cover.webp"
category: "unity-dev"
tags: ["Unity", "2D", "Camera", "Sorting Layer", "Sprite Renderer", "Shmup"]
published: true
featured: true
---

## Hôm nay học gì

- Camera 2D là gì (orthographic) và cách đặt Game view tỉ lệ dọc
- **Sorting Layer / Order in Layer**: ai vẽ đè lên ai
- Draw Mode **Tiled** để một sprite lặp vô hạn
- Script đầu tiên: `Update`, `Time.deltaTime`, `[SerializeField]`
- Assembly Definition và vì sao project nhiều game cần nó

Xong bài này bạn có: màn hình dọc, nền xanh với 2 lớp sao trôi tốc độ khác nhau (parallax), tàu đứng dưới đáy với lửa động cơ. Bấm Play là thấy sao trôi.

![Kết quả bài 1](/images/posts/unity-shmup/01/scene_08_scrolling-stars.webp)

## 1. Scene mới, Game view dọc

**File → New Scene → Basic (URP)** → Ctrl+S, lưu vào `_ShootEmUp/Scenes/SEU_01_Scene.unity`.

Xoá `Directional Light`. Sprite dùng material `Sprite-Unlit-Default`, không nhận ánh sáng; giữ đèn chỉ tốn một pass render.

Game view → dropdown tỉ lệ (đang là *Free Aspect*) → **+** → Type: Fixed Resolution, 1080 × 1920, label `Portrait`. Chọn nó. Fixed Resolution thay vì Aspect 9:16 để ảnh chụp và UI (bài 8) ra đúng pixel như điện thoại.

## 2. Camera 2D

Chọn `Main Camera`:

![Inspector Main Camera](/images/posts/unity-shmup/01/scene_02_camera-inspector.webp)

| Thuộc tính | Giá trị | Vì sao |
|-----------|---------|--------|
| Position | (0, 0, −10) | Camera nhìn theo +Z, đứng ở z = −10 để sprite ở z = 0 nằm trước mặt |
| Projection | **Orthographic** | 2D không có phối cảnh |
| Size | **8** | Size = nửa chiều cao nhìn thấy (unit). 8 → thấy 16 unit cao, với 9:16 → 9 unit rộng |
| Background Type | Solid Color | Không dùng skybox |
| Background | `#0B0F2A` | Màu lộ ra nếu nền không phủ kín |

Chiều rộng nhìn thấy **không** đặt trực tiếp: nó bằng Size × 2 × aspect. Đổi tỉ lệ Game view là chiều rộng đổi theo. Bài 2 sẽ tính biên từ camera thay vì hard-code số.

## 3. Sorting Layers

**Edit → Project Settings → Tags and Layers → Sorting Layers** → dấu + thêm, kéo thả sắp thứ tự:

![Sorting Layers](/images/posts/unity-shmup/01/scene_03_sorting-layers.webp)

```
Background   ← vẽ trước (nằm dưới cùng)
Default
Enemies
Projectiles
Player
FX
UI           ← vẽ sau cùng (đè lên hết)
```

Ba điều người mới hay nhầm:
- **Sorting Layer khác Layer** (mục "Layers" ngay dưới). Layer dùng cho physics và camera culling (bài 5). Sorting Layer chỉ quyết định thứ tự vẽ 2D.
- Cùng Sorting Layer thì so **Order in Layer** (số lớn vẽ sau). Cùng cả hai thì Unity so theo z → thứ tự ngẫu nhiên. Luôn đặt Order rõ ràng.
- Vì sao Projectiles nằm dưới Player: đạn bay ra từ dưới thân tàu, đạn đè lên tàu trông rất giả.

## 4. Nền 3 lớp

Tạo Empty `Background` ở (0, 0, 0) làm cha, 3 con:

**`BG`** — Sprite Renderer, Sprite `bg` (1000×1000 px = 10×10 unit). Scale (1, 1.7, 1) → 10×17 unit, phủ kín khung 9×16. Sorting Layer `Background`, Order 0.

**`Stars-Far`** — Sprite `Stars-A`:
- **Draw Mode: Tiled**, Size (10, 40). Tiled = sprite lặp lại để lấp đầy Size thay vì kéo giãn. Size cao 40 vì script sẽ dịch nó xuống tối đa 10 unit, lúc nào cũng phải phủ đủ 16 unit của khung.
- Chọn Tiled xong Unity cảnh báo nếu sprite đang Mesh Type = Tight. Vào ảnh `Stars-A.png` → **Mesh Type: Full Rect** → Apply. Tight cắt mesh sát alpha nên tile bị hở mép.
- Color alpha 0.45 (sao xa mờ hơn), Order 1.
- Add Component `ScrollingLayer` (mục 6): Speed 0.6, Wrap Distance 10.

**`Stars-Near`** — Sprite `Stars-B`, Tiled (10, 40), Order 2, `ScrollingLayer` Speed 1.8, Wrap Distance 10.

![Inspector Stars-Near](/images/posts/unity-shmup/01/scene_06_stars-near-inspector.webp)

Vì sao Wrap Distance = 10: chiều cao 1 tile = 1000 px / PPU 100 = 10 unit. Dịch xuống đúng 10 rồi nhảy về chỗ cũ thì hoa văn lặp trùng khít, mắt không thấy giật. Đổi PPU hay dùng sprite khác cỡ thì số này đổi theo, nên script để lộ field.

## 5. Player

- Empty `Player`, Position (0, −5.5, 0). Sprite Renderer, Sprite `SpaceShip`, Sorting Layer `Player`, Order 0.
- Con `EngineFire`: Sprite `fire`, Local Position (0, −1.02, 0), Scale 0.7, Sorting Layer `Player`, **Order −1** (vẽ trước tàu → nằm sau thân).

Lửa là object con để sau này tàu di chuyển thì lửa đi theo, và bài 10 chỉ cần scale con để làm hiệu ứng.

![Inspector Player](/images/posts/unity-shmup/01/scene_07_player-inspector.webp)

Hierarchy cuối bài:

![Hierarchy](/images/posts/unity-shmup/01/scene_01_hierarchy.webp)

## 6. Script đầu tiên: ScrollingLayer

`_ShootEmUp/Scripts/Background/ScrollingLayer.cs`:

```csharp
using UnityEngine;

namespace ShootEmUp.Background
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class ScrollingLayer : MonoBehaviour
    {
        [Tooltip("World units per second. Higher = closer to the camera.")]
        [SerializeField] private float speed = 1f;

        [Tooltip("Height of one tile in world units (sprite px / Pixels Per Unit).")]
        [SerializeField] private float wrapDistance = 10f;

        private Vector3 startPosition;

        private void Awake()
        {
            startPosition = transform.position;
        }

        private void Update()
        {
            var pos = transform.position;
            pos.y -= speed * Time.deltaTime;

            if (pos.y <= startPosition.y - wrapDistance)
            {
                pos.y += wrapDistance;
            }

            transform.position = pos;
        }
    }
}
```

- `[SerializeField] private`: private nhưng vẫn hiện trên Inspector. Đừng dùng `public` chỉ để chỉnh trong editor.
- `[Tooltip]`: chữ hiện khi rê chuột. Viết ngay từ đầu, sau 2 tuần chính bạn cũng quên.
- `[RequireComponent]`: kéo script vào object không có SpriteRenderer thì Unity tự thêm.
- `speed * Time.deltaTime`: không có deltaTime thì máy 144 fps sao trôi nhanh gấp đôi máy 60 fps.
- `pos.y += wrapDistance` thay vì `pos.y = startPosition.y`: gán thẳng làm mất phần dư của frame đó (đã trôi quá 0.03 unit) → mỗi lần wrap giật nhẹ. Cộng lại thì giữ được phần dư.
- `namespace ShootEmUp.Background`, `sealed`: để code game này không đụng tên với game sau trong cùng project.

## 7. Assembly Definition

Trong `_ShootEmUp/Scripts/` → Create → Scripting → **Assembly Definition** → tên `ShootEmUp`, Root Namespace `ShootEmUp`.

Mặc định mọi script nằm chung `Assembly-CSharp`: sửa 1 file là compile lại tất cả. asmdef chia code thành assembly riêng: game Platformer sau này không compile lại khi sửa Shoot 'em up, và không thể vô tình gọi code của nhau. Người mới có thể bỏ qua; project nhiều game thì nên có từ đầu vì thêm sau phải sửa reference rất mệt. Bài 2 sẽ thấy ngay: phải thêm `Unity.InputSystem` vào References.

## Lỗi mình gặp

| Lỗi | Nguyên nhân | Sửa |
|-----|-------------|-----|
| Bấm Play, sao không trôi, `Time.frameCount` đứng ở 1 | Editor mất focus (mình điều khiển Unity từ ngoài) và **Run In Background** tắt → Play Mode dừng khi cửa sổ Unity không active | Project Settings → Player → Resolution and Presentation → **Run In Background** ✓. Setting này cũng cần cho WebGL khi người chơi chuyển tab |
| Tile sao hở mép | Mesh Type Tight | Full Rect |

## Bài sau

[Shmup #2](/lab/unity-shmup-02-player-movement): điều khiển tàu bằng Input System, Rigidbody2D Kinematic, và kẹp tàu trong màn hình.
