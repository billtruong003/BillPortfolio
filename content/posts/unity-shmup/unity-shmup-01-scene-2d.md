---
title: "Shmup #1: Giải phẫu màn hình 2D — camera, lớp vẽ và nền sao"
date: "2026-09-14"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-01-scene-2d
series: "shmup"
order: 1
excerpt: "Dựng màn hình tĩnh trước, rồi thêm chuyển động: hiểu world units, khung camera, sorting và chu kỳ nền sao."
coverImage: "/images/posts/unity-shmup/01/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: true
---

<div class="lesson-stack"><div>FX / UI · thông tin và phản hồi</div><div>Player · tàu và lửa</div><div>Projectiles / Enemies · vật thể chơi</div><div>Stars-Near → Stars-Far → BG · nền</div></div>

## Bốn lớp chồng lên nhau

Màn hình game bắn máy bay nhìn qua thì đơn giản: có tàu, có sao, có nền. Thực ra đó là bốn lớp sprite xếp chồng lên nhau, và thứ quyết định lớp nào được vẽ đè lên lớp nào không phải toạ độ Z như nhiều người mới vẫn nghĩ.

Đây là thứ bạn sẽ có ở cuối bài:

![Tàu đứng giữa khung dọc, hai lớp sao trôi phía sau](/images/posts/unity-shmup/01/scene_08_scrolling-stars.webp)

Ta dựng từ dưới lên: nền trước, tàu sau, rồi mới cho nền trôi. Hình tĩnh phải đúng trước khi viết dòng script nào, vì lỗi bố cục mà đem chạy thì rất khó tách khỏi lỗi chuyển động.

Bắt đầu từ project bài 0. Tạo scene mới bằng template **Basic (URP)** và lưu thành `_ShootEmUp/Scenes/SEU_01_Scene.unity`.

## Camera nhìn thấy đúng 9 × 16 units

Trong Game view, thêm một Fixed Resolution **1080 × 1920** để khung hình đúng tỉ lệ dọc ngay từ đầu. Xoá Directional Light đi, vì sprite dùng material **Sprite-Unlit-Default** nên không cần đèn.

Chọn Main Camera và đặt bốn thứ:

| Main Camera | Giá trị |
|---|---|
| Position / Rotation | (0, 0, −10) / (0, 0, 0) |
| Projection | Orthographic |
| Size | 8 |
| Background Type / Color | Solid Color / #0B0F2A |

![Bốn field cần đổi trên camera orthographic](/images/posts/unity-shmup/01/scene_02_camera-inspector.webp)

Size là **nửa** chiều cao chứ không phải cả chiều cao, nên Size 8 nghĩa là camera nhìn thấy 16 units theo chiều dọc. Tỉ lệ 9:16 kéo theo chiều rộng bằng `16 × 9/16 = 9`. Camera đứng ở gốc toạ độ nên vùng nhìn thấy là X từ −4.5 đến 4.5 và Y từ −8 đến 8. Bốn con số này sẽ quay lại ở bài 2 khi chặn tàu trong màn hình, và ở bài 7 khi tính chỗ thả địch.

Đây là world units, không phải pixel. Một hình 200 px ở PPU 100 rộng đúng 2 units, tức chiếm hơn một phần năm bề ngang màn hình.

## Đặt tàu ở Y = −5.5

Kéo sprite tàu vào scene tại (0, 0, 0) và kiểm tra nó nằm giữa Game view. Sau đó đổi Position thành (0, −5.5, 0) và đặt tên object là `Player`.

Con số −5.5 không phải tuỳ tiện. Camera nhìn thấy tới Y = −8, tàu cao khoảng 2 units nên tâm ở −5.5 đẩy đáy tàu xuống −6.5, còn chừa khoảng 1.5 units tới mép dưới. Khoảng đó là chỗ cho lửa động cơ và cho ngón tay người chơi ở bản mobile sau này. Sprite tàu của bạn cao khác thì tính lại theo cùng cách, đừng chép cứng −5.5.

![Transform và Sprite Renderer của Player](/images/posts/unity-shmup/01/scene_07_player-inspector.webp)

## Thứ tự vẽ nằm ở Sorting Layer

Vào **Project Settings → Tags and Layers → Sorting Layers** và thêm lần lượt: Background, Default, Enemies, Projectiles, Player, FX, UI.

![Danh sách Sorting Layer theo đúng thứ tự vẽ](/images/posts/unity-shmup/01/scene_03_sorting-layers.webp)

Lớp nằm càng dưới trong danh sách thì vẽ càng sau, tức là đè lên các lớp phía trên. Trong cùng một lớp, Order in Layer lớn hơn thì vẽ sau.

Chỗ này người mới rất hay nhầm **Sorting Layer** với **Layer**. Sorting Layer là danh sách bạn vừa tạo trong Tags and Layers, và nó chỉ quyết định thứ tự vẽ. Layer là ô dropdown ở góc trên bên phải Inspector của GameObject, và nó dành cho physics với camera culling. Đạn nằm sau thân tàu là luật vẽ, thuộc Sorting Layer. Đạn của bạn không gây sát thương cho chính tàu là luật va chạm, thuộc Layer, và bài 5 mới dùng tới.

Đặt Player vào Sorting Layer **Player**, Order 0.

## Lửa động cơ là object con

Tạo một Empty làm con của `Player`, đặt tên `EngineFire`, gắn Sprite Renderer với sprite lửa. Local position khoảng (0, −1.02, 0), Order in Layer **−1**.

Order −1 đẩy lửa ra sau thân tàu trong cùng Sorting Layer Player, nên nó trông như phụt ra từ bên dưới đuôi chứ không dán đè lên. Vị trí chính xác phụ thuộc hình của bạn, cứ kéo trong Scene view cho khớp đuôi tàu.

![Cây Hierarchy với EngineFire là con của Player](/images/posts/unity-shmup/01/scene_01_hierarchy.webp)

Để `EngineFire` làm con là quyết định có hậu quả: tới bài 2 khi tàu chạy, lửa tự đi theo mà không cần một dòng code nào.

## Ba lớp nền phủ kín khung

Tạo một Empty tên `Background` ở gốc toạ độ, rồi dựng ba object con bên trong theo thứ tự sau.

**BG** là lớp dưới cùng: một Sprite Renderer với hình nền phủ ít nhất 9 × 16 units, Sorting Layer Background, Order 0. Với hình 1000 × 1000 px ở PPU 100, scale (1, 1.7, 1) cho ra nền 10 × 17 units, dư một chút mỗi bên là vừa. Hình cỡ khác thì tính `pixel ÷ PPU × scale`.

**Stars-Far** nằm trên BG: Sprite Renderer để Draw Mode **Tiled**, Size (10, 40), alpha 0.45, Sorting Layer Background, Order 1. Texture sao cần bật Full Rect và có mép trên dưới lặp khớp nhau, nếu không lúc trôi sẽ thấy đường nối.

**Stars-Near** nằm trên cùng của nhóm nền: cấu hình y hệt Stars-Far nhưng alpha 0.8 và Order 2. Đậm hơn để lát nữa khi hai lớp chạy khác tốc độ, mắt tự hiểu lớp đậm nằm gần hơn.

![Sprite Renderer của Stars-Near ở chế độ Tiled](/images/posts/unity-shmup/01/scene_06_stars-near-inspector.webp)

<details><summary>Không có texture sao lặp thì làm sao</summary>

Với mỗi lớp, tạo một Empty rồi rải khoảng 12 sprite Circle nhỏ trong khoảng X từ −4.5 đến 4.5 và Y từ −5 đến 5, scale mỗi hình còn 0.03–0.06. Sau đó nhân đôi cả nhóm con lên Y +10 và xuống Y −10. Hoa văn khi đó lặp lại mỗi 10 units, khớp với Wrap Distance ở phần dưới. Phương án này dùng nhóm object nên bỏ qua các field Tiled.

</details>

## Scene view và Game view không hiện cùng một thứ

Dựng xong nền, bạn sẽ thấy hai cửa sổ này khác hẳn nhau, và đó là bình thường.

![Scene view nhìn thấy cả phần nền tràn ra ngoài khung](/images/posts/unity-shmup/01/scene_04_scene-view.webp)

![Game view chỉ hiện đúng vùng camera cắt ra](/images/posts/unity-shmup/01/scene_05_game-view.webp)

Scene view cho bạn nhìn khắp nơi, kể cả phần nền tràn ra ngoài. Game view chỉ hiện đúng vùng camera chọn, tức là những gì người chơi thấy. Phần nền thừa trong Scene view chính là phần sẽ trôi vào khung ở phần sau, nên thấy nó tràn ra là đúng.

Kiểm tra hình tĩnh trước khi đi tiếp: nền phủ kín Game view không hở mép, lửa nằm sau đuôi tàu, sao xa mờ hơn sao gần. Sai chỗ nào thì sửa ngay, đừng chạy script đè lên một bố cục đang lỗi.

## Cho nền trôi rồi quay lại đúng một chu kỳ

Trong `_ShootEmUp/Scripts`, tạo một Assembly Definition tên **ShootEmUp**, Root Namespace `ShootEmUp`. Nó gom script trong thư mục thành một assembly riêng, và bài 2 sẽ thêm reference Input System vào đây. Nếu bạn chép asmdef từ gói source thì đừng tạo thêm bản thứ hai.

Tạo `Scripts/Background/ScrollingLayer.cs`. Script chỉ làm một việc: đẩy object xuống với tốc độ cho trước, và mỗi khi đi hết một chu kỳ thì kéo nó về chỗ cũ.

**Assets/_ShootEmUp/Scripts/Background/ScrollingLayer.cs**

```csharp
using UnityEngine;
namespace ShootEmUp.Background
{
    public sealed class ScrollingLayer : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float speed = 1f;
        [SerializeField, Min(0.01f)] private float wrapDistance = 10f;
        private Vector3 startPosition;
        private float distance;
        private void Awake() => startPosition = transform.position;
        private void Update()
        {
            distance = Mathf.Repeat(distance + speed * Time.deltaTime, Mathf.Max(0.01f, wrapDistance));
            transform.position = startPosition + Vector3.down * distance;
        }
    }
}
```

Chỗ đáng chú ý là `Mathf.Repeat`. Nó giữ phần dư thay vì đặt `distance` về 0, nên lúc hoa văn nhảy về vị trí đầu, nó nhảy đúng bằng một chu kỳ và mắt không bắt được cú nhảy. Nếu thay bằng `if (distance > wrapDistance) distance = 0` thì mỗi vòng sẽ mất một đoạn nhỏ và bạn thấy giật.

Chờ compile xong rồi Add Component lên hai lớp sao. Far để Speed 0.6, Near để Speed 1.8, cả hai Wrap Distance 10.

Wrap Distance phải bằng đúng chu kỳ hoa văn của bạn. Với texture cao 1000 px ở PPU 100 thì chu kỳ là 10 units. Với phương án rải sprite Circle ở trên, chu kỳ cũng là 10 vì đó là khoảng cách giữa hai bản sao. Hoa văn có chu kỳ khác thì đổi con số này theo.

Near chạy nhanh gấp ba Far là cố ý. Hai lớp cùng tốc độ thì trông như một tấm ảnh trôi; chênh tốc độ mới tạo ra cảm giác chiều sâu.

## Chạy đủ lâu để thấy đường nối

Bấm Play và để chạy 30 giây, đừng dừng sau vài giây.

Lớp xa cần `10 ÷ 0.6 = 16.67` giây mới lặp lại một lần, nên chạy 5 giây rồi kết luận nền mượt là chưa kiểm tra gì cả. Lớp gần nhanh hơn, `10 ÷ 1.8 = 5.6` giây một vòng.

Ba triệu chứng hay gặp và chỗ cần xem:

- Giật đúng tại mỗi đường nối: chu kỳ hoa văn không khớp Wrap Distance, hoặc texture chưa lặp khớp mép.
- Hở một dải trống khi trôi: nhóm hình chưa đủ cao, tăng Size của Tiled hoặc thêm bản sao.
- Không chuyển động gì: xem script đã gắn chưa, component có đang bật không, và Play Mode có thực sự đang chạy không.

Tới đây bạn đã tách được ba vai trò khác nhau: camera chọn vùng nhìn thấy, Sorting Layer chọn thứ tự vẽ, script đổi vị trí theo thời gian. Bài sau thêm người chơi vào chuỗi đó, để chính họ là người đổi vị trí tàu.

## Mã nguồn chặng này

[Tải script bài 1](/downloads/shmup/lesson-01.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #2](/lab/unity-shmup-02-player-movement).
