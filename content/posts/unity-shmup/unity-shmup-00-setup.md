---
title: "Shmup #0: Bản đồ khởi hành — chuẩn bị project để học tới cùng"
date: "2026-09-13"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-00-setup
series: "shmup"
order: 0
excerpt: "Hiểu game đích, chuẩn bị công cụ và tài nguyên, rồi thiết lập cách lưu mốc bài học trước khi viết code."
coverImage: "/images/posts/unity-shmup/00/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-map"><strong>ĐÍCH ĐẾN</strong><p>Một game màn hình dọc: lái tàu, bắn địch, sống qua các wave, nhặt đồ và chơi lại sau khi hết máu.</p><ol><li>#0–#3 · Màn hình và điều khiển</li><li>#4–#7 · Vòng đời object, va chạm, dữ liệu và wave</li><li>#8–#11 · Ván chơi, pickup, phản hồi và bản Web</li></ol></div>

## Dựng chỗ trước khi dựng game

Chuyện là project Unity nào cũng bắt đầu gọn gàng, tới bài thứ tư thì rối. Bài này chưa viết dòng code nào, chỉ dựng sẵn chỗ để từng loại tài nguyên có nơi của nó, kể cả folder `_Common` mà phải tới bài 4 bạn mới thấy vì sao nó cần tồn tại.

Một game bắn máy bay nhìn qua là nhiều hệ thống chạy cùng lúc. Cách mình tách nó ra là đặt từng câu hỏi: camera nhìn thấy vùng nào, phím bấm biến thành chuyển động ra sao, viên đạn sống được bao lâu, ai là người giữ điểm số. Mỗi bài trả lời đúng một câu và để lại một hành vi quan sát được.

Cách làm xuyên suốt series gói trong một câu mình hay nói: **make it exist first, you can make it good later.** Bài 3 sẽ cố tình bắn đạn bằng `Instantiate` và `Destroy` dù biết cách đó tốn, để bài 4 có một thứ cụ thể mà sửa. Học bằng cách nhìn thấy vấn đề của chính mình dễ vào hơn là đọc lời khuyên tránh nó từ đầu.

> **Về series này**
>
> Bạn cần biết trước biến, điều kiện, vòng lặp, hàm và class C#. Chưa có thì đọc [series C#](/lab/series/csharp). Event và coroutine sẽ được giải thích ngay lúc dùng.
>
> Ảnh chụp trong series lấy từ project mẫu của mình, nên vài Inspector có thể thuộc bản dựng trước đó. Khi số liệu trong ảnh lệch với bảng cấu hình trong bài, lấy bảng trong bài làm chuẩn.
>
> Mỗi bài kèm một gói script, không kèm scene hay prefab dựng sẵn. Game điều khiển bằng bàn phím và gamepad; khung dọc 9:16 không đồng nghĩa với điều khiển cảm ứng.

## Một bộ công cụ nhất quán

Project mẫu chạy trên **Unity 6000.3.10f1**, **URP 17.3.0**, **Input System 1.18.0**. Bản Unity 6 khác có thể bày giao diện hơi khác, nhưng các bước đều tìm được.

Trong Unity Hub, thêm module **Web Build Support** nếu bạn định xuất bản Web ở bài 11. Rồi tạo project **Universal 3D**, đặt tên `ShmupLab`.

Template 3D làm game 2D vẫn bình thường, vì ta dùng sprite unlit và camera orthographic. Mình chọn nó để các series sau về 3D và shader dùng chung một project, và để renderer mặc định khớp với shader ở bài 10.

Mở **Window → Package Manager**, cài **2D** feature set và **Input System** nếu chưa có. Unity sẽ hỏi khởi động lại để đổi input backend, chọn Yes. Sau đó kiểm tra **Project Settings → Player → Active Input Handling** đã là Input System. Series không cần package bên ngoài nào khác.

## Chuẩn bị hình theo vai trò

Dùng hình bạn có sẵn hoặc tải [Kenney Space Shooter Extension](https://kenney.nl/assets/space-shooter-extension). Tên file trong bộ đó khác với ảnh mẫu, nên hãy chọn theo vai trò thay vì đi tìm một tên file trùng khớp.

| Vai trò | Hình cần có | Tên gợi nhớ |
|---|---|---|
| Player | Tàu hướng mũi lên | Player |
| Đạn | Hình nhỏ dài theo Y | Laser |
| Địch | Hai hình phân biệt được | InsectBasic, InsectFast |
| Thiên thạch | Nhỏ, vừa, lớn | Asteroid |
| Pickup | Ba biểu tượng | Life, Shield, Rapid |
| Nền | Màu nền và hoa văn sao lặp | Background, Stars |

Kích thước hình khác mẫu cũng được, vì mọi tính toán trong series đều quy về pixel, PPU và world units. Nếu bạn không có texture sao lặp, bài 1 có phương án dựng sao bằng sprite ngay trong Editor.

## Mỗi loại tài nguyên có một chỗ

Tạo các thư mục sau bằng **Project window**:

```text
Assets/
  _ShootEmUp/
    Art/Sprites/
    Art/Shaders/
    Audio/
    Input/
    Prefabs/
    Scenes/
    ScriptableObjects/
    Scripts/
  _Common/Scripts/
  ThirdParty/
```

`_ShootEmUp` chứa game này. `ThirdParty` dành cho tài nguyên tải về. Còn `_Common` hiện đang trống, và nó sẽ trống tới bài 4 — lúc đó ta viết một cái object pool không thuộc riêng game bắn tàu, nên nó cần một chỗ đứng ngoài `_ShootEmUp`. Đây là cách tổ chức của project này chứ không phải luật Unity; project chỉ có đúng một game thì để chung thư mục vẫn chạy tốt.

Luôn kéo asset bằng Project window chứ đừng kéo trong File Explorer, vì Unity cần chuyển cả file `.meta` đi kèm. File meta giữ GUID, tức mã mà scene và prefab dùng để tìm lại sprite, material và script. Mất meta là reference đang đúng bỗng thành Missing.

![Thư mục _ShootEmUp và _Common trong Project window](/images/posts/unity-shmup/00/setup_02_project-tree.webp)

## Import đúng một sprite trước khi chỉnh hàng loạt

Chọn hình tàu trong Project window và nhìn sang Inspector. Đặt **Texture Type = Sprite (2D and UI)**, **Sprite Mode = Single**, **Pixels Per Unit = 100**, rồi bấm Apply.

![Texture Importer: ba dòng cần đổi trước khi Apply](/images/posts/unity-shmup/00/setup_01_texture-importer.webp)

Single dành cho file chứa một hình; spritesheet nhiều hình thì chọn Multiple rồi cắt vùng trong Sprite Editor.

PPU là thứ nối pixel với kích thước trong game, và nó đáng hiểu kỹ ngay từ đây vì cả series sẽ tính theo nó. Một hình rộng 200 px ở PPU 100 với scale 1 sẽ rộng 2 world units. Camera bài sau nhìn thấy bề ngang 9 units, nên tàu vừa nhập chiếm khoảng hai phần chín chiều rộng màn hình. Bạn ước lượng được tỉ lệ tàu trên màn hình mà chưa cần kéo nó vào scene.

Với hình nền sẽ dùng chế độ Tiled, nhớ đặt thêm **Mesh Type = Full Rect**. Camera trong series cố định nên có thể tắt mipmap.

Kéo thử tàu vào scene để kiểm tra. Không thấy gì thì xem lại Sprite Mode, vùng slice và vị trí camera. Kiểm tra xong thì xoá object thử đi, giữ lại sprite asset.

## Lưu mốc đúng nghĩa

Copy scene sang tên mới không đóng băng được bài cũ, vì scene cũ vẫn trỏ tới đúng những script và prefab mà bạn sắp sửa. Muốn quay lại đúng trạng thái của một bài thì phải chụp lại cả project.

Nếu dùng Git, tạo repo ngang hàng với Assets, Packages và ProjectSettings, rồi bỏ qua các thư mục Unity tự sinh:

```gitignore
/Library/
/Temp/
/Obj/
/Logs/
/UserSettings/
/Builds/
*.csproj
*.sln
*.slnx
```

Giữ lại toàn bộ file `.meta`, thư mục Packages và ProjectSettings. Vào **Project Settings → Editor** đặt **Asset Serialization = Force Text** để file scene và prefab diff được.

Sau mỗi bài: Stop Play Mode, Save, commit, rồi gắn tag `lesson-XX`. Gói ZIP trên trang này chứa source của hướng dẫn, còn tag trong repo của bạn mới là mốc của chính bạn.

## Sẵn sàng sang bài 1 chưa?

Bốn dấu hiệu: project mở lên không có lỗi đỏ trong Console, hình tàu kéo vào scene hiện được, Input System đã cài và đang bật, và bạn biết scene sẽ lưu ở đâu. Script sẽ nằm trong `_ShootEmUp/Scripts`, còn assembly definition thì bài 1 mới dựng.

Bài sau dựng màn hình: camera nhìn thấy vùng nào, lớp nào vẽ đè lên lớp nào, và làm nền sao trôi liên tục mà không thấy đường nối.

## Mã nguồn chặng này

Bài 0 chưa có script nào. Từ bài 1 trở đi, mỗi bài có một gói ZIP gồm code và assembly definition, không kèm scene hay prefab.

Tiếp theo: [Shmup #1](/lab/unity-shmup-01-scene-2d).
