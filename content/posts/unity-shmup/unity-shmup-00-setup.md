---
title: "Shmup #0: Dựng project Unity 6 cho nhiều mini game"
date: "2026-09-13"
lang: "vi"
series: "shmup"
order: 0
excerpt: "Bài mở đầu series làm game bắn máy bay: tạo project Unity 6 URP, tổ chức folder để một project chứa nhiều game, import sprite đúng cách, git + LFS."
coverImage: "/images/posts/unity-shmup/00/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Project Setup", "Git", "Shmup"]
published: true
featured: false
---

## Series này là gì

12 bài, một game. Bắt đầu từ scene trống, kết thúc bằng một game bắn máy bay chạy trên trình duyệt, chơi được ngay ở mục [Arcade](/arcade?game=shmup) của trang này. Mỗi bài mở đúng **một** khái niệm và nối tiếp scene của bài trước, giống cách Catlike Coding dẫn người học.

Khác với series "Unity Cho Người Mới" cũ (2024), lần này:
- Unity **6000.3 LTS**, URP, **Input System** mới (không dùng `Input.GetKey`)
- Mọi bước đều có ảnh Inspector chụp lúc làm thật, kể cả lúc kéo reference
- Code đầy đủ, có lý do cho từng quyết định, có mục "lỗi mình gặp"

Cần biết trước: C# cơ bản (biến, hàm, class). Chưa có thì đọc [series C#](/lab/series/csharp) trước.

## Hôm nay học gì

- Tạo project URP và cài 2 package cần thiết
- Tổ chức folder để **một project chứa nhiều game** mà không rối
- Import sprite: Sprite Mode, Pixels Per Unit, Mipmap và vì sao NPOT không nén được
- Git + Git LFS cho project Unity

Xong bài này bạn có: project sạch, sprite sẵn sàng kéo vào scene, repo git chuẩn.

## 1. Tạo project

Unity Hub → **New project** → template **Universal 3D**. Đặt tên và đường dẫn tuỳ bạn (mình dùng `D:\Projects\Tutorial`).

Vì sao Universal 3D mà không phải Universal 2D: game này 2D, nhưng các series sau (3D movement, shader) dùng chung project. Project 3D làm 2D bình thường, chỉ khác camera (bài 1 sẽ đổi) và renderer mặc định.

Sau khi mở project: **Window → Package Manager** → tab Unity Registry, cài:
- **2D** (feature set `com.unity.feature.2d`): Sprite Editor, Tilemap, 2D physics tooling
- **Input System** (1.18): khi bật, Unity hỏi restart editor để đổi backend input → Yes

## 2. Cấu trúc folder

Template để lại `Assets/` thế này:

```
Assets/
  InputSystem_Actions.inputactions
  Readme.asset, TutorialInfo/
  Scenes/SampleScene.unity
  Settings/            (URP pipeline asset, renderer, volume)
```

Cộng thêm folder sprite tải về là bắt đầu rối. Quy tắc mình dùng cho cả series:

```
Assets/
  _Common/          thứ dùng chung cho mọi game trong project
    Editor/  Input/  Scripts/  Settings/
  _ShootEmUp/       game này
    Art/Sprites/{Player, Enemies, Asteroids, Projectiles, Pickups, Background}
    Audio/  Input/  Prefabs/  Scenes/  ScriptableObjects/  Scripts/
  ThirdParty/       package, asset store, không đụng vào
```

- Dấu `_` để folder của mình nổi lên đầu Project window.
- **Mỗi game một folder gốc**, game sau (`_Platformer2D`, `_Movement3D`) đứng cạnh, không lồng nhau.
- `_Common` chỉ chứa thứ dùng từ 2 game trở lên. Bài 4 sẽ đưa Object Pool vào đây.

![Project window sau khi dọn](/images/posts/unity-shmup/00/setup_02_project-tree.webp)

**Chú ý quan trọng: di chuyển asset phải làm trong Unity** (kéo thả trong Project window). Mỗi asset có file `.meta` chứa GUID; scene, prefab, material tham chiếu nhau qua GUID. Kéo file trong Explorer mà quên `.meta` là Unity sinh GUID mới → mất hết reference, lỗi "Missing (Sprite)".

Xoá `Readme.asset` và `TutorialInfo/` (readme của template). `Settings/` URP kéo vào `_Common/Settings/` — Project Settings → Graphics vẫn trỏ đúng vì GUID không đổi.

## 3. Import sprite

Bộ sprite mình dùng là gói tàu vũ trụ miễn phí gồm 26 PNG: tàu, drone, khiên, 2 loại bọ, 6 thiên thạch, 8 loại đạn, 3 bonus, nền + 2 lớp sao. Kéo vào `Art/Sprites/` và chia folder theo loại.

Chọn một sprite, Inspector hiện **Texture Import Settings**:

![Import settings của SpaceShip.png](/images/posts/unity-shmup/00/setup_01_texture-importer.webp)

| Thuộc tính | Giá trị | Vì sao |
|-----------|---------|--------|
| Texture Type | Sprite (2D and UI) | Ảnh dùng làm sprite |
| Sprite Mode | **Single** | Mỗi file một hình. Mode Multiple dành cho sprite sheet đã slice; để Multiple mà không slice thì kéo vào scene không hiện gì |
| Pixels Per Unit | **100** | 100 px = 1 unit Unity. Tàu 241 px ≈ 2.4 unit. Chọn một số và giữ cố định cả game |
| Generate Mip Maps | tắt | Mipmap chỉ có ích khi vật xa gần (3D). 2D camera cố định thì bỏ, tiết kiệm 33% bộ nhớ texture |
| Generate Physics Shape | bật | Unity sinh sẵn hình collider bám alpha, bài 5 dùng cho `PolygonCollider2D` |

Nhìn dòng cảnh báo vàng ở dưới: *"Only textures with width/height being multiple of 4 can be compressed to DXT5"*. Toàn bộ sprite gói này có kích thước lẻ (241×187, 87×87...) nên dù Compression = Normal Quality, Unity vẫn lưu **RGBA8 không nén** (dòng cuối preview ghi `241x187 (NPOT) RGBA8`). Kết luận: với sprite lẻ kích thước, setting nén không có tác dụng; muốn nén thật phải gom vào **Sprite Atlas** (series sau).

Chỉnh xong bấm **Apply**. Chọn nhiều file cùng lúc rồi chỉnh một lần cho nhanh.

## 4. Git + LFS

Trong folder project:

```bash
git init
git lfs install
```

`.gitignore` chuẩn Unity, quan trọng nhất là bỏ `Library/`, `Temp/`, `Logs/`, `UserSettings/`, `*.csproj`, `*.sln`:

```gitignore
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/
*.csproj
*.sln
*.slnx
.vs/
.idea/
```

`.gitattributes`: file YAML của Unity đánh dấu text để merge được, file nhị phân đi qua LFS:

```gitattributes
* text=auto eol=lf
*.unity text merge=unityyamlmerge
*.prefab text merge=unityyamlmerge
*.asset text merge=unityyamlmerge
*.mat text merge=unityyamlmerge
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
```

Kiểm tra **Edit → Project Settings → Editor**: Asset Serialization = **Force Text** (template mới mặc định đã đúng). Thiếu cái này thì scene lưu nhị phân, git diff vô dụng.

Commit đầu tiên. Từ giờ mỗi bài một commit và một tag `lesson-NN`, muốn xem lại trạng thái bài nào thì checkout tag đó.

## Chú ý

- **Kéo asset trong Unity, không kéo trong Explorer.** Lặp lại vì đây là lỗi mất reference số một của người mới.
- Sprite Mode Multiple trên hình đơn = không hiện gì trong scene, không báo lỗi.
- NPOT không nén được: đừng mất thời gian chỉnh Compression cho từng sprite.

## Bài sau

[Shmup #1](/lab/unity-shmup-01-scene-2d): scene 2D đầu tiên, camera orthographic, Sorting Layer, và script đầu tiên làm sao trôi.
