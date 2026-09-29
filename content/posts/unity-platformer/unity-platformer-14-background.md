---
title: "Platformer #14: Nền cuộn vô hạn, làm bằng shader rồi bỏ shader"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 14
excerpt: "Nền lát vô hạn, tự trôi, trôi chậm hơn thế giới. Bản đầu là một shader tính UV từ toạ độ thế giới, chạy đúng nhưng bắt mình tự làm lại ba việc đường render sprite đã làm sẵn. Bản đang dùng chỉ là một sprite lát gạch được kéo về mỗi khi đi hết một ô. Và vì sao nền trông nhòe mà thật ra không nhòe."
coverImage: "/images/posts/unity-platformer/14/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Parallax", "Shader", "Pixel Art", "Tutorial"]
published: true
featured: false
---

Căn phòng đang đứng trên nền đen trơn. Bộ art có 6 hoa văn nền trong `Backgrounds`, mỗi cái 64 × 64 pixel, lát liền nhau được. Mình muốn nền này làm ba việc:

- **Lát vô hạn**: phủ kín khung nhìn dù phòng rộng bao nhiêu.
- **Tự trôi**: đứng yên vẫn thấy nền chầm chậm trôi.
- **Trôi chậm hơn thế giới** khi camera di chuyển (parallax), để có cảm giác xa.

![Căn phòng với nền hoa văn sọc chéo màu xanh xám phía sau](/images/posts/unity-platformer/14/cover.webp)

Bài này làm hai lần. Lần đầu bằng shader, chạy đúng, đo đúng. Rồi mình bỏ nó và làm lại bằng một sprite. Lý do bỏ mới là phần đáng đọc.

## Cách thường thấy và vì sao không đủ

Cách hay gặp nhất là đặt một tấm nền to, rồi cuộn `material.mainTextureOffset` trong `Update()`. Tấm nền phải đủ to để phủ cả phòng, mỗi lớp nền cần một script, và hiệu ứng parallax phải tự tính thêm. Mình muốn một thứ không phụ thuộc kích thước phòng.

## Lần một: shader lấy UV từ toạ độ thế giới

Ý tưởng: thay vì lấy UV từ mesh, lấy UV từ vị trí thế giới của từng pixel. Tấm nền chỉ cần là một hình chữ nhật dán theo camera, còn hoa văn nằm đâu do công thức quyết định.

Gọi `s` là vị trí của một pixel so với tâm màn hình, `camPos` là vị trí camera. Vị trí thế giới của pixel đó là `worldXY = camPos + s`. Muốn nền trôi theo camera với tỉ lệ `p` (0 là dính vào camera, 1 là dính vào thế giới), và tự trôi với vận tốc `scroll`:

```hlsl
float2 offset = _Scroll.xy * _Time.y - _WorldSpaceCameraPos.xy * (1.0 - _Parallax);
float2 uv = (i.worldXY + offset) * _Tiling.xy;
```

Thay `worldXY = camPos + s` vào: `uv = (s + camPos·p + scroll·t) · tiling`. Camera đi một đoạn `d` thì hoa văn trên màn hình dịch `d·p`, đúng bằng tỉ lệ `p` so với thế giới (dịch `d`). Qua ba dòng biến đổi đó, `_Parallax` không còn là một con số mò.

Nó chạy, và đo ra đúng. Cho camera đi +4 unit (192 pixel trên màn hình):

| Đối tượng | Dịch trên màn hình | Parallax suy ra | Đặt |
|---|---|---|---|
| Thế giới | −192 px | 1.000 | |
| Lớp xa | −48 px | 0.250 | 0.25 |
| Lớp gần | −106 px | 0.552 | 0.55 |

Nhưng nó bắt mình tự làm ba việc, và mình làm sai hai:

1. **Nền thành một màu phẳng trên WebGL.** Để khớp pixel, shader cần biết kích thước texture. `_MainTex_TexelSize` khai trong khối `UnityPerMaterial` về 0 trên WebGL, trong khi trên Editor vẫn đúng. `1 / 0` ra vô cực, `round(x / inf) * inf` ra NaN, và cả tấm nền ra một màu. Phải thêm một property `_Texels` tự gõ tay kích thước.
2. **Snap pixel đặt sai chỗ.** Bản đầu làm tròn UV cuối cùng về tâm texel. Vô ích: point filter vốn đã làm tròn UV rồi. Cái cần làm tròn là độ lệch tính bằng world unit, để nền nhảy theo từng pixel màn hình như mọi sprite khác.
3. **`_Time` phình mãi.** `_Scroll * _Time.y` không bao giờ quay về. Game mở lâu, số thực mất độ chính xác và cú trôi giật thành từng nấc. Phải tự quấn về một chu kỳ.

Cả ba đều là việc mà đường render sprite bình thường đã làm hộ: sprite biết kích thước texture của nó, `Pixel Perfect Camera` của bài 0 làm tròn vị trí sprite về pixel, và vị trí một object không phình theo thời gian nếu mình không để nó phình. Mình đang viết lại những thứ đã có, và viết sai.

## Lần hai: một sprite lát gạch được kéo về

Cách thứ hai đúng như mô hình quen thuộc: **một hướng, một tốc độ, và cứ đi hết một ô thì kéo về**.

- Tấm nền là một `SpriteRenderer` bình thường, Draw Mode `Tiled`: Unity tự lát hoa văn 64 × 64 lên một hình chữ nhật bao nhiêu cũng được. Material mặc định, không shader riêng.
- Tấm nền đi theo camera để lúc nào cũng phủ khung nhìn, nên phòng rộng bao nhiêu cũng được.
- Mỗi frame, cộng dồn một khoảng trôi `Drift`. Khi `Drift` đi hết một ô (4 unit), trừ đi 4. Một ô trọn vẹn trông y hệt không có ô nào, nên cú kéo về không nhìn thấy được, và `Drift` không bao giờ phình.

### Import hoa văn

Chọn `Backgrounds/1.png`: Sprite Mode `Single`, Pixels Per Unit `16` (một ô hoa văn là 4 × 4 unit), Filter Mode `Point`, Compression `None` như mọi sprite khác từ bài 0. Thêm hai thứ riêng cho nền lát:

- **Mesh Type**: `Full Rect`. Draw Mode Tiled cần sprite là hình chữ nhật đầy đủ. Để `Tight`, Unity cắt mesh theo phần có hình và báo sprite có thể lát không đúng.
- **Wrap Mode**: `Repeat`.

![Import Settings của Backgrounds/1.png: Sprite Single, Pixels Per Unit 16, Mesh Type Full Rect, Generate Mipmap tắt, Wrap Mode Repeat, Filter Mode Point, 64x64 RGBA8](/images/posts/unity-platformer/14/bg-import.webp)

### ParallaxLayer

Tạo `Assets/_Common/Scripts/FX/ParallaxLayer.cs`. Nó không biết gì về platformer nên nằm trong `_Common`, dùng được cho mọi game:

```csharp
using UnityEngine;

namespace BillLab.Common.FX
{
    [ExecuteAlways]
    [RequireComponent(typeof(SpriteRenderer))]
    [DefaultExecutionOrder(200)]   // after any camera follow script, so it reads this frame's camera
    public sealed class ParallaxLayer : MonoBehaviour
    {
        [SerializeField] private Camera targetCamera;

        [Header("Drift")]
        [Tooltip("Direction of the constant scroll. Normalised, so only the angle matters.")]
        [SerializeField] private Vector2 direction = Vector2.right;
        [Tooltip("World units per second along that direction.")]
        [SerializeField] private float speed = 0.5f;

        [Header("Depth")]
        [Tooltip("0 = pinned to the camera, 1 = pinned to the world. Lower looks further away.")]
        [SerializeField, Range(0f, 1f)] private float parallax = 0.5f;

        [Header("Coverage")]
        [Tooltip("Extra tiles drawn past the edge of the view, so the wrap never shows.")]
        [SerializeField, Min(1)] private int paddingTiles = 2;

        public Vector2 Drift { get; private set; }
        public Vector2 TileSize => tile;
        public float ResetSeconds => speed <= 0f ? 0f : tile.x / speed;

        private SpriteRenderer sr;
        private Vector2 tile;

        private void OnEnable()
        {
            sr = GetComponent<SpriteRenderer>();
            if (targetCamera == null) targetCamera = Camera.main;
            Rebuild();
        }

        private void OnValidate()
        {
            sr = GetComponent<SpriteRenderer>();
            if (sr != null && sr.sprite != null) Rebuild();
        }

        private void Rebuild()
        {
            if (sr == null || sr.sprite == null || targetCamera == null) return;

            // one repeat of the pattern = the sprite at its native size
            tile = sr.sprite.bounds.size;
            if (tile.x <= 0f || tile.y <= 0f) return;

            sr.drawMode = SpriteDrawMode.Tiled;
            sr.tileMode = SpriteTileMode.Continuous;

            // cover the view plus a margin, rounded UP to whole tiles so the wrap is hidden
            var halfH = targetCamera.orthographicSize;
            var halfW = halfH * targetCamera.aspect;
            sr.size = new Vector2(
                Mathf.Ceil((halfW * 2f) / tile.x + paddingTiles * 2) * tile.x,
                Mathf.Ceil((halfH * 2f) / tile.y + paddingTiles * 2) * tile.y);
        }

        private void LateUpdate()
        {
            if (sr == null || targetCamera == null || tile.x <= 0f) return;

            if (Application.isPlaying)
            {
                Drift += direction.normalized * (speed * Time.deltaTime);
                // The reset. One whole tile looks identical to none, so subtracting tiles is
                // invisible, and it stops Drift growing for as long as the game is open.
                Drift = new Vector2(Wrap(Drift.x, tile.x), Wrap(Drift.y, tile.y));
            }

            Vector2 camPos = targetCamera.transform.position;

            // where the layer wants to be, then pulled back to the camera by whole tiles
            Vector2 want = camPos * (1f - parallax) + Drift;
            Vector2 rel = want - camPos;
            rel.x -= tile.x * Mathf.Round(rel.x / tile.x);
            rel.y -= tile.y * Mathf.Round(rel.y / tile.y);

            transform.position = new Vector3(camPos.x + rel.x, camPos.y + rel.y, transform.position.z);
        }

        private static float Wrap(float v, float period) => v - period * Mathf.Floor(v / period);
    }
}
```

**`Rebuild`** lấy kích thước một ô hoa văn từ chính sprite (64 pixel ở 16 pixel mỗi unit là 4 unit), bật Draw Mode Tiled, rồi đặt kích thước tấm nền đủ phủ khung nhìn cộng thêm 2 ô mỗi phía. Khung nhìn là 32 × 18 unit, nên tấm nền là 48 × 36. Kích thước làm tròn lên số ô chẵn để lúc kéo về không lộ mép.

**`LateUpdate`** phải chạy sau khi camera đã đi. `CameraFollow` của bài 5 đặt camera trong `LateUpdate` với `[DefaultExecutionOrder(100)]`, nên `ParallaxLayer` mang số 200 để chạy sau nó. Không có dòng đó thì nền đọc vị trí camera của frame trước, lệch một nhịp mỗi khi camera tăng tốc hay dừng. Vị trí nền "muốn" ở là `camPos × (1 − parallax) + Drift`:

- `parallax = 0`: vị trí muốn là `camPos + Drift`, nền đi cùng camera, như giấy dán màn hình.
- `parallax = 1`: vị trí muốn là `Drift`, nền đứng yên trong thế giới như tilemap.
- Ở giữa: camera đi `d` thì nền đi `d × (1 − parallax)`, tức trên màn hình nền trôi ngược `d × parallax`, chậm hơn thế giới.

Nhưng nếu đặt nền đúng chỗ muốn thì camera đi xa là nền bị bỏ lại. Nên tính khoảng cách từ camera tới chỗ muốn (`rel`), rồi trừ đi một số ô trọn để kéo nó về sát camera. Trừ ô trọn thì hoa văn trên màn hình không đổi, nhưng tấm nền luôn ở ngay sau camera.

`[ExecuteAlways]` cho nền đi theo camera cả trong Edit mode, để bạn thấy nó trong Scene view lúc dựng phòng. Nhưng `Drift` chỉ cộng dồn khi đang Play.

### Dựng nền

1. Tạo GameObject `Background` ở gốc scene, Position z = `10`: vẫn nằm trong tầm nhìn của camera (camera ở z = −10 nhìn về phía z dương), nhưng xa hơn mọi thứ khác. Thứ quyết định nền vẽ dưới cùng là sorting layer ở bước sau, z chỉ để Scene view dễ nhìn.
2. Vào **Tags and Layers**, thêm sorting layer `Background` và kéo nó lên đầu danh sách, trên cả `Default`: layer ở đầu được vẽ trước, tức nằm dưới cùng.
3. **Sprite Renderer**: Sprite `1`, Sorting Layer `Background`, Color `(0.42, 0.47, 0.64)`.
4. **Parallax Layer**: Target Camera `Main Camera`, Direction `(1, 0)`, Speed `0.6`, Parallax `0.35`, Padding Tiles `2`.

![Inspector của Background: Sprite Renderer với sprite 1, Draw Mode Tiled 48 x 36, Tile Mode Continuous, Sorting Layer Background; Parallax Layer với Main Camera, Direction 1 0, Speed 0.6, Parallax 0.35, Padding Tiles 2](/images/posts/unity-platformer/14/parallax-inspector.webp)

Kích thước 48 × 36 và Draw Mode Tiled do `ParallaxLayer` tự đặt, bạn không cần gõ. Tốc độ 0.6 unit/giây nghĩa là nền đi hết một ô 4 unit trong 6.67 giây rồi kéo về.

### So với bản shader

| Việc | Bản shader | Bản sprite |
|---|---|---|
| Khớp pixel với phần còn lại | tự viết, lần đầu viết sai | `Pixel Perfect Camera` lo như mọi sprite |
| Biết kích thước texture | `_Texels` gõ tay vì biến có sẵn hỏng trên WebGL | sprite tự biết |
| Chặn số phình theo thời gian | tự quấn `_Time` trong shader | quấn `Drift`, một dòng |

Điểm mạnh của bản sprite là nó đi qua đúng đường render mà tilemap và nhân vật đang đi: cùng point filter, cùng cách làm tròn pixel. Một tấm nền vẽ bằng UV tự tính có thể lệch nhịp với phần còn lại của màn hình. Một tấm nền là sprite thì không lệch được, vì nó là sprite. Thứ gì phải trông giống phần còn lại của game thì nên đi cùng đường với phần còn lại của game.

Shader không sai. Nó chỉ bắt mình làm lại những việc đã có người làm, và ở đây không có lý do gì để làm lại.

## Nhòe hoá ra không phải nhòe

Bản nền đầu tiên, người chơi thử báo lại là nền bị nhòe. Mình soát import trước: Point, không mipmap, không nén, RGBA32, giống hệt tile. Không phải filter, không phải nén.

Rồi soi vào hoa văn:

| File | Số màu trong file | Hai màu đó |
|---|---|---|
| `1.png` | 2 | (188, 203, 213) và (170, 186, 206), chênh khoảng 18 |
| `5.png` | 2 | (187, 184, 208) và (181, 169, 201), chênh khoảng 6 |

Hoa văn của bộ art chỉ có hai màu và cố ý rất nhạt. Bản đầu của mình nhân thêm tint 0.24 cho nền tối đi, hai màu chỉ còn chênh khoảng 4 mỗi kênh, dưới ngưỡng mắt phân biệt. Rồi chồng thêm lớp thứ hai (`5.png`, trôi ngược chiều, alpha 0.35) cho có chiều sâu. Kết quả:

![Bên trái: hai lớp nền chồng nhau với tint 0.24, cả nền thành một mảng xám tối gần như không thấy hoa văn. Bên phải: một lớp với tint 0.42, sọc chéo hiện rõ](/images/posts/unity-platformer/14/tint-two-vs-one.webp)

Từng pixel vẫn sắc cạnh, chỉ là không còn gì để nhìn ra cạnh. Đếm màu trong một mảng 200 × 100 pixel chỉ có nền: bản hai lớp có 4 màu, chênh nhau khoảng 3 mỗi kênh. Bản một lớp tint 0.42 có đúng 2 màu, chênh 8.

"Nhòe" là mô tả một triệu chứng, và triệu chứng đó có ít nhất ba nguyên nhân rất khác nhau: filter Bilinear, mipmap, và tương phản bị bóp. Cách phân biệt rẻ nhất là đếm số màu trong một mảng ảnh chụp. Nhòe do filter thì ra hàng chục màu trung gian. Bóp tương phản thì vẫn chỉ vài màu, chỉ là chúng quá gần nhau.

![Phóng to 8 lần một cạnh sọc của nền: cạnh là bậc thang pixel sắc, chỉ có 2 màu](/images/posts/unity-platformer/14/pixel-zoom.webp)

Sửa: bỏ lớp thứ hai, nâng tint lên 0.42. Với pixel art tương phản thấp, một lớp rõ ràng hơn hai lớp mờ chồng lên nhau. Muốn có lớp thứ hai cho ra hồn thì cần một hoa văn tương phản cao hơn, không phải thêm một lớp nhạt nữa.

## Kiểm tra

- **Tốc độ trôi**: đọc `Drift` trong 5.02 giây (ngắn hơn chu kỳ 6.67 giây): từ 0 lên 3.024, tức đúng 0.600 unit/giây.
- **Parallax**: tắt trôi, cho camera đi đúng +4 unit. Tấm nền dịch −1.400 unit so với camera, đúng bằng 4 × 0.35.
- **Độ nét**: mảng 200 × 100 pixel chỉ có nền trong ảnh chụp Game view có đúng 2 màu, không một màu trung gian.

Cửa sổ đo tốc độ phải ngắn hơn chu kỳ kéo về. Đo trong 8 giây thì `Drift` đã quấn một vòng, hiệu số mất đi 4 unit, và tốc độ tính ra còn 0.1 unit/giây. Đây là cùng một loại bẫy với đo parallax bằng cách so ảnh: đo một thứ tuần hoàn trong cửa sổ dài hơn chu kỳ của nó thì số ra vô nghĩa.

Tự thử bằng tay:

- Đứng yên: nền trôi sang phải chậm rãi.
- Chạy sang phải: tilemap trôi qua màn hình nhanh, nền trôi chậm hơn hẳn.
- Chọn `Background` lúc Play: nó luôn ở ngay sau camera, dù bạn chạy tới tận cuối phòng.
- Đổi Direction thành `(1, 0.5)`: nền trôi chéo. Đổi Parallax thành 0: nền dính vào màn hình, chỉ còn tự trôi.

## Bài sau

Có phòng, có địch, có boss, có nền. Bài 15 nối chúng thành một game: nhiều màn nối tiếp nhau qua cửa thoát, HUD đếm ngọc và thanh máu boss, rồi build lên web.
