---
title: "Platformer #0: Đưa pixel art vào Unity mà không bị phá"
date: "2026-09-20"
updated: "2026-09-28"
lang: vi
series: "platformer"
order: 0
excerpt: "Import mặc định của Unity làm sprite mờ, đổi màu 97% số pixel, và trong template 3D còn co file 352×32 xuống 256×32. Bài này sửa import, chọn PPU 16, đặt pivot ở chân và khoá camera đúng 32×18 tile."
coverImage: "/images/posts/unity-platformer/00/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Pixel Art", "Tutorial"]
published: true
featured: false
---

Game pixel art bắt đầu từ việc đưa được sprite vào Unity mà nó vẫn còn là pixel art. Unity không biết bạn đang làm game 2D pixel, nên setting import mặc định của nó được chọn cho ảnh chụp và texture 3D, và với pixel art thì gần như dòng nào cũng sai.

Hết bài này bạn sẽ có một scene trống mà ở đó một sprite hiện đúng từng pixel gốc, một tile bằng đúng một đơn vị thế giới, chân nhân vật nằm đúng ở toạ độ bạn gõ, và camera luôn nhìn thấy đúng 32 × 18 tile dù cửa sổ to hay nhỏ.

## Chuẩn bị

Mình dùng Unity 6000.3.10f1. Project của series này dựng từ template Universal 3D vì nó còn chứa một game khác, nên ảnh chụp trong bài là của project 3D. Nếu bạn tạo project mới chỉ để làm platformer thì chọn Universal 2D, và ở những chỗ hai template khác nhau mình sẽ ghi rõ.

Bộ art là Free Simple Platformer Game Kit của CraftPix: tile 16×16, nhân vật vẽ trong ô 32×32, địch trong ô 48×48. Bạn dùng bộ khác cũng được, miễn là biết ô của nó to bao nhiêu, vì mọi con số trong series đều suy ra từ đó.

Tạo cấu trúc thư mục trong `Assets/`:

```
_Platformer/
  Art/Sprites/
  Input/
  Prefabs/
  Scenes/
  ScriptableObjects/
  Scripts/
```

Tiền tố `_` là do project của mình có hai game nằm cạnh nhau. Nếu bạn chỉ làm một game thì bỏ lớp `_Platformer` đi cũng không ảnh hưởng gì tới các bài sau.

## Import thử một file trước

Đừng kéo cả bộ art vào ngay. Kéo đúng một file trước, xem Unity làm gì với nó, sửa cho đúng, rồi mới import phần còn lại. Thấy lỗi trên máy mình rồi mới sửa thì bạn sẽ nhớ lâu hơn là đọc một bảng setting.

Kéo `Player/Char1/Idle.png` vào `Art/Sprites/Player/Char1/`. File gốc rộng 352 pixel, cao 32 pixel, chứa 11 frame nhân vật đứng thở.

Chọn file đó trong Project window rồi nhìn xuống dòng chữ nhỏ dưới ô preview ở cuối Inspector:

![Inspector của Idle.png với setting mặc định trong project 3D: Texture Type Default, Filter Mode Bilinear, Compression Normal Quality, dòng cuối ghi 256x32 DXT5](/images/posts/unity-platformer/00/import-default.webp)

Dòng đó ghi `256x32 RGBA Compressed DXT5`. File 352 pixel giờ chỉ còn 256, tức là mất gần một phần ba chiều ngang, và Console không có một dòng cảnh báo nào. Trong Inspector có ba chỗ đáng để ý, mỗi chỗ gây ra một kiểu hỏng khác nhau.

### Vì sao file bị co

Người ta hay đoán là do nén, nhưng không phải. Mình đã thử đổi Compression sang None mà giữ nguyên Texture Type thì file vẫn là 256×32.

Thủ phạm nằm trong mục Advanced đang đóng. Bấm vào mũi tên cạnh chữ **Advanced** để mở ra:

![Mục Advanced mở ra, dòng Non-Power of 2 đang để ToNearest](/images/posts/unity-platformer/00/import-default-npot.webp)

Dòng **Non-Power of 2** đang để `ToNearest`. Texture 3D truyền thống chạy tốt nhất khi cạnh là luỹ thừa của 2 (64, 128, 256, 512...), nên với Texture Type `Default`, Unity kéo mọi cạnh không phải luỹ thừa 2 về mốc gần nhất. 352 gần 256 hơn 512, thế là file bị ép xuống 256 và pixel bị bỏ bớt đi.

Bạn không cần sửa dòng này bằng tay. Đổi **Texture Type** sang `Sprite (2D and UI)` thì Unity tự tắt nó, vì sprite không bao giờ bị ép về luỹ thừa 2.

Nếu project của bạn là template 2D thì Texture Type đã là Sprite từ đầu nên file không bị co. Hai lỗi dưới đây thì template nào cũng gặp.

### Vì sao ảnh mờ

Dòng thứ hai cần để ý là **Filter Mode**. Mặc định Unity để `Bilinear`, tức là khi phóng to nó sẽ trộn màu giữa các pixel cạnh nhau cho mượt. Với ảnh chụp thì hợp lý, còn với pixel art thì đó đúng là thứ bạn không muốn, vì cạnh sắc bị làm nhoè và ảnh mất luôn cái chất pixel mà người vẽ cố tình giữ.

Đây là cùng một frame, phóng to cùng một mức, bên trái để Bilinear và bên phải để Point:

![Cùng frame Idle phóng to: bên trái Bilinear bị nhoè cạnh, bên phải Point giữ từng khối pixel](/images/posts/unity-platformer/00/filter-bilinear-vs-point.webp)

Đổi Filter Mode sang `Point (no filter)` thì mỗi pixel của ảnh nở ra thành một khối vuông đặc, không pha trộn gì cả.

### Vì sao màu bị sai

Dòng thứ ba là **Compression**, mặc định `Normal Quality`. Khi đã đổi sang Sprite, file giữ đủ 352×32 nhưng vẫn bị nén sang định dạng DXT5. DXT5 nén theo từng khối 4×4 pixel và mỗi khối chỉ giữ được vài màu đại diện, nên màu nào không trùng với màu đại diện sẽ bị làm tròn sang màu gần nhất.

Với ảnh chụp thì mắt không nhận ra. Với pixel art thì khác, vì mỗi pixel là một màu người vẽ chọn tay:

![Cùng frame phóng to: bên trái Compressed DXT5 bị loang màu ở miệng, mặt và cà vạt, bên phải None đúng màu gốc](/images/posts/unity-platformer/00/compression-dxt5-vs-none.webp)

Mình đếm thử trên file này: frame gốc có 11 màu, sau khi nén thành 154 màu, và 5.201 trong 5.343 pixel nhìn thấy được bị đổi màu, tức là khoảng 97%. Đặt Compression về `None` thì không pixel nào đổi. Pixel art vốn ít màu và ảnh nhỏ, nên bỏ nén cũng chẳng tốn bao nhiêu bộ nhớ.

### Đặt lại cho đúng

Vẫn chọn `Idle.png`, đặt các dòng sau trong Inspector rồi bấm **Apply** ở góc dưới phải:

| Dòng | Giá trị | Vì sao |
|---|---|---|
| Texture Type | Sprite (2D and UI) | Để Unity coi nó là sprite, đồng thời tắt Non-Power of 2 |
| Pixels Per Unit | 16 | Xem mục ngay sau |
| Filter Mode | Point (no filter) | Không trộn màu giữa các pixel |
| Compression | None | Giữ nguyên từng màu gốc |
| Generate Mipmap (trong Advanced) | tắt | Mipmap là bản thu nhỏ dùng khi vật ở xa, game 2D không cần |

Sau khi Apply, dòng dưới ô preview phải ghi `352x32 (NPOT) RGBA8`:

![Inspector sau khi sửa: Sprite, PPU 16, Point, Compression None, dòng cuối ghi 352x32 RGBA8](/images/posts/unity-platformer/00/import-fixed.webp)

`NPOT` ở đây chỉ là Unity báo rằng cạnh ảnh không phải luỹ thừa 2, không phải lỗi. Quan trọng là con số đã về 352 và định dạng là RGBA8, tức mỗi pixel giữ nguyên 8 bit cho mỗi kênh màu.

Giờ mới kéo phần còn lại của bộ art vào. Setting import gắn với từng file chứ không gắn với thư mục, nên file mới vào vẫn mang setting mặc định. Nhanh nhất là chọn hết các file mới trong Project window, sửa một lượt trong Inspector rồi Apply một lần.

## Pixels Per Unit: vì sao là 16

`Pixels Per Unit` trả lời câu hỏi bao nhiêu pixel của ảnh thì bằng một đơn vị trong thế giới game. Unity mặc định 100, và với tile 16×16 thì một tile chỉ còn 0.16 unit.

Nghe thì vô hại, nhưng nó kéo theo mọi con số sau này. Căn phòng 64 tile thành 10.24 unit, bệ nhảy cao 5 tile thành 0.8 unit. Tới bài 3 khi tính trọng lực và độ cao nhảy, bạn sẽ phải nhìn một đống số lẻ mà không hình dung nổi số nào đang nói về cái gì.

Để PPU bằng đúng cạnh tile, ở đây là 16, thì một tile bằng đúng một unit. Phòng rộng 64 tile là 64 unit, bệ cao 5 tile là 5 unit, nhân vật trong ô 32×32 cao đúng 2 unit. Mọi phép tính sau đó đều là số nguyên, và nhìn số nào bạn cũng biết nó đang nói về mấy ô gạch.

Bạn nào đọc series shmup sẽ thấy ở đó mình để PPU 100. Shmup không có lưới nên đơn vị chọn sao cũng được, còn ở đây tile chính là lưới nên lưới quyết định đơn vị.

## Cắt sheet và đặt pivot ở chân

`Idle.png` đang là một sprite duy nhất rộng 352 pixel. Kéo nó vào scene lúc này bạn sẽ được một hàng 11 nhân vật dính liền, rộng 22 unit. Phải cắt nó thành 11 frame, và lúc cắt cũng là lúc đặt pivot cho từng frame.

### Pivot đặt ở đâu

Pivot là điểm mà `transform.position` trỏ tới, và Unity mặc định đặt nó ở tâm sprite. Platformer thì cả series xoay quanh một câu hỏi: chân nhân vật đang ở cao độ nào. Đặt nhân vật lên sàn, kiểm tra có chạm đất không, đặt collider, tất cả đều cần biết chân ở đâu.

Đây là hai nhân vật cùng đặt ở `y = 0`, đúng mặt trên của hàng gạch:

![Hai nhân vật cùng y bằng 0: bên trái pivot Center lún nửa người xuống gạch, bên phải pivot Bottom đứng đúng trên mặt gạch](/images/posts/unity-platformer/00/pivot-center-vs-bottom.webp)

Pivot ở tâm thì bạn phải gõ `y = 1` mới đứng lên được sàn cao 0, và mỗi loại nhân vật lại cần một con số bù khác nhau tuỳ ô vẽ to hay nhỏ. Pivot ở đáy thì `transform.position.y` chính là cao độ chân, sàn cao bao nhiêu bạn gõ đúng bấy nhiêu.

Trước khi đặt pivot ở đáy thì nên kiểm tra bộ art có được vẽ cho cách đó không. Mở vài file nhân vật bằng trình xem ảnh nào cho zoom, rồi nhìn xem nhân vật nằm ở đâu trong ô 32×32 của nó:

![Frame đầu của Idle, Run, Jump, Fall phóng to trong khung 32x32: chân nhân vật chạm đúng mép dưới khung, phần trống dồn lên trên](/images/posts/unity-platformer/00/pivot-art-touches-bottom.webp)

Chân nhân vật chạm đúng mép dưới của ô, còn phần trống thì dồn hết lên trên. Mình kiểm cả 11 frame của `Idle` đều như vậy. `Run` có vài frame nhún lên tối đa 4 pixel, nhưng frame chạm đất vẫn nằm sát đáy. Người vẽ đã căn sẵn chân vào mép dưới, tức là bộ này làm ra để dùng pivot ở đáy.

Nếu bộ art của bạn có khoảng trống dưới chân thì pivot đáy sẽ làm nhân vật lơ lửng. Khi đó bạn đặt pivot Custom với Y bằng khoảng trống đó chia cho chiều cao ô.

### Cắt trong Sprite Editor

Chọn `Idle.png`, trong Inspector đổi **Sprite Mode** từ `Single` sang `Multiple`, bấm Apply, rồi bấm **Open Sprite Editor**.

Trong cửa sổ Sprite Editor, bấm **Slice** ở thanh công cụ trên cùng và đặt:

- Type: `Grid By Cell Size`
- Pixel Size: `32` × `32`
- Pivot: `Bottom Center`

Bấm nút Slice trong hộp đó, rồi bấm **Apply** ở góc trên phải của Sprite Editor. Nếu đúng, sheet được chia thành 11 ô, và khi bấm vào ô đầu tiên thì vòng tròn pivot nằm ở giữa mép dưới:

![Sprite Editor sau khi cắt: 11 ô 32x32, ô Idle_0 được chọn với vòng tròn pivot ở mép dưới, Pivot ghi Bottom Center](/images/posts/unity-platformer/00/sprite-editor-slice.webp)

Trong Project window, mở mũi tên cạnh `Idle.png` sẽ thấy 11 sprite con từ `Idle_0` đến `Idle_10`.

Các sheet nhân vật còn lại (`Run`, `Double_Jump`, `Wall_Jump`, `Hit`) mình để tới bài 6 mới cắt, lúc làm animation, theo đúng cách này. Riêng `Jump.png` và `Fall.png` chỉ có một frame 32×32 nên giữ `Single` và đặt Pivot `Bottom` ngay trong Inspector. Không phải thứ gì cũng pivot ở đáy: gem và thùng gỗ được vẽ lơ lửng giữa ô, bài 9 sẽ xét riêng.

## Camera: dựng hai tầng từ đầu

Tạo scene mới, lưu thành `_Platformer/Scenes/PLT_00_Setup.unity`.

Trong Hierarchy, tạo một GameObject rỗng tên `CameraRoot`, đặt Position `(16, 9, 0)`. Kéo `Main Camera` vào làm con của nó, rồi đặt Position của Main Camera về `(0, 0, -10)`. Vì Main Camera là con nên đây là toạ độ so với `CameraRoot`.

![Hierarchy: CameraRoot chứa Main Camera, bên dưới là Idle_0](/images/posts/unity-platformer/00/hierarchy-camera.webp)

Tầng `CameraRoot` chưa làm gì ở bài này. Mình dựng sẵn vì bài 5 sẽ có script camera đi theo nhân vật ghi vào vị trí của `CameraRoot`, còn bài 13 rung màn hình sẽ ghi vào vị trí local của `Main Camera`. Hai script ghi vào hai chỗ khác nhau thì không bao giờ ghi đè lên nhau.

`(16, 9)` là tâm của khung 32 × 18 unit, nên camera sẽ nhìn từ `x = 0` tới `32` và từ `y = 0` tới `18`. Góc dưới trái của màn hình chính là gốc toạ độ, sau này đặt gạch sẽ dễ tính hơn.

Chọn `Main Camera`, trong component Camera mở mục **Environment**, đặt Background Type là `Solid Color` và màu `#1A1C2C`. Các dòng Projection và Size thì chưa cần đụng tới, lát nữa Pixel Perfect Camera sẽ tự đặt.

## Pixel Perfect Camera

Camera orthographic chỉ quyết định nhìn thấy bao nhiêu thế giới. Nó không đảm bảo mỗi pixel art rơi gọn vào một khối pixel màn hình, và không đảm bảo mức phóng to là số nguyên. Nếu phóng 3.75 lần chẳng hạn, có pixel art sẽ thành khối 3 pixel, có pixel lại thành khối 4, và nhân vật trông méo mó khi di chuyển. Component `Pixel Perfect Camera` lo chuyện này.

### Có hai component trùng tên

Chọn `Main Camera`, bấm **Add Component** rồi gõ `pixel perfect`. Danh sách sẽ hiện hai dòng cùng tên `Pixel Perfect Camera`: một cái của Universal RP, một cái của package 2D Pixel Perfect cũ. Project dùng URP thì cần cái của Universal RP.

Nếu lỡ thêm nhầm thì Inspector phân biệt được ngay. Đây là cả hai cái gắn lên cùng một camera để so:

![Hai component Pixel Perfect Camera: cái trên của URP có các dòng Assets Pixels Per Unit, Reference Resolution, Crop Frame, Grid Snapping; cái dưới có chữ Script và cảnh báo vàng kèm nút Upgrade](/images/posts/unity-platformer/00/two-pixel-perfect-cameras.webp)

Cái đúng là cái trên, tên không có chữ `(Script)` và có các dòng setting. Cái dưới có chữ `(Script)` và một cảnh báo vàng nói nó không tương thích với Scriptable Render Pipeline, kèm nút **Upgrade Pixel Perfect Camera**. Nếu bạn thấy cái dưới thì bấm dấu ba chấm ở góc phải của nó và chọn Remove Component, rồi thêm lại cái của URP.

Ở cái đúng cũng có một cảnh báo, nói component này cần camera dùng 2D Renderer. Bạn chỉ thấy cảnh báo này khi project dựng từ template 3D như project của mình, vì camera đang dùng Universal Renderer. Mình đã đo trong Play mode: phần tính mức phóng, Crop Frame và Grid Snapping mà bài này dùng vẫn chạy đúng. Cái không dùng được là lựa chọn `Upscale Render Texture`, và series này không cần tới nó. Nếu bạn dùng template Universal 2D thì cảnh báo này không xuất hiện.

### Đặt bốn dòng

| Dòng | Giá trị | Vì sao |
|---|---|---|
| Assets Pixels Per Unit | 16 | Phải khớp PPU lúc import |
| Reference Resolution | X `512`, Y `288` | 32 × 18 tile nhân 16 pixel |
| Crop Frame | Windowbox | Khoá khung nhìn ở mọi cỡ cửa sổ, xem mục ngay dưới |
| Grid Snapping | Pixel Snapping | Giữ sprite nằm trên lưới pixel |

![Inspector của Pixel Perfect Camera sau khi đặt: PPU 16, Reference Resolution 512 x 288, Crop Frame Windowbox, Grid Snapping Pixel Snapping, Current Pixel Ratio 3:1](/images/posts/unity-platformer/00/ppc-settings.webp)

`512 × 288` là độ phân giải thật của game. Mọi thứ người chơi thấy chỉ là bản 512 × 288 đó được phóng to lên. Dòng xám **Current Pixel Ratio** cho biết đang phóng mấy lần, ảnh trên ghi `3:1` vì Game view đang ở 1536 × 864. Mục Game view phía dưới sẽ nói cách đặt cỡ này.

Grid Snapping đặt `Pixel Snapping` thì sprite luôn được vẽ ở vị trí tròn pixel. Mình thử đặt nhân vật lệch khoảng một phần ba pixel: bật snapping thì mép nhân vật nằm đúng trên lưới 3 pixel màn hình, tắt đi thì nó lệch 1 pixel. Nhìn một ảnh tĩnh thì khó thấy, nhưng khi camera trượt theo nhân vật thì chênh lệch đó làm hình rung lăn tăn.

### Size của camera giờ do Pixel Perfect Camera quyết định

Quay lên component Camera, mục **Projection** giờ bị khoá xám:

![Camera Projection bị khoá xám với thông báo Projection settings have been overriden by the Pixel Perfect Camera, Size hiện 9](/images/posts/unity-platformer/00/camera-projection-locked.webp)

`Size` của camera orthographic là nửa chiều cao khung nhìn tính bằng unit. Pixel Perfect Camera tự tính nó từ hai con số bạn vừa nhập: 288 pixel chia 16 PPU ra 18 unit chiều cao, chia đôi ra Size 9. Ở tỉ lệ 16:9 thì chiều ngang là 18 × 16/9 = 32 unit. Với PPU 16 thì 32 × 18 unit cũng là 32 × 18 tile, và đó là khung nhìn của cả series.

Lưu ý con số trong ô này ở Edit mode có thể là số cũ. Pixel Perfect Camera chỉ tính lại khi game chạy, nên lúc mình vừa đổi cỡ Game view, ô Size vẫn ghi 11.25 và chỉ về 9 khi bấm Play. Muốn đo gì thì đo trong Play mode.

### Crop Frame

Nếu để Crop Frame là `None`, Pixel Perfect Camera sẽ lấy nguyên cửa sổ rồi mới chia cho mức phóng. Cửa sổ càng to thì người chơi càng thấy nhiều thế giới hơn, và màn chơi bạn thiết kế theo khung 32 × 18 không còn đúng nữa.

Đây là cùng một scene ở cửa sổ 1920 × 1080. Mình đặt hai nhân vật ở `(1, 0)` và `(31, 16)`, tức là hai góc của khung 32 × 18, và ba nhân vật nữa nằm ngoài khung:

![Crop Frame None ở 1920x1080: thấy cả năm nhân vật, khung nhìn 40 x 22.5 unit](/images/posts/unity-platformer/00/crop-none-1080p.webp)

Với `None`, camera nhìn thấy 40 × 22.5 unit, rộng hơn thiết kế 25%, nên cả ba nhân vật nằm ngoài khung đều hiện ra. Đổi sang `Windowbox`:

![Crop Frame Windowbox ở 1920x1080: viền đen bốn phía, chỉ còn hai nhân vật ở hai góc khung 32 x 18](/images/posts/unity-platformer/00/crop-windowbox-1080p.webp)

Khung nhìn khoá lại đúng 32 × 18, hai nhân vật nằm đúng hai góc, phần thừa của cửa sổ thành viền đen. Trong dropdown còn có `Pillarbox` (chỉ cắt hai bên) và `Letterbox` (chỉ cắt trên dưới), còn `Windowbox` cắt cả hai chiều nên an toàn cho mọi cỡ cửa sổ.

Trường này mình từng bỏ qua và rất lâu sau mới phát hiện. Trong Editor ở 1536 × 864 mọi thứ vẫn đúng 32 × 18, nên không có gì đáng ngờ. Build lên web, trình duyệt cho canvas 1600 × 900, và người chơi thấy 40 × 22.5 unit. Editor chạy đúng chưa chắc bản build đã đúng.

## Game view phải chia hết cho 288

Pixel Perfect Camera chỉ phóng theo số nguyên: 1 lần, 2 lần, 3 lần. Nếu chiều cao Game view không chia hết cho 288, nó lùi về mức nguyên gần nhất bên dưới. Ở 1920 × 1080 chẳng hạn, 1080 chia 288 ra 3.75, nên nó phóng 3 lần và phần còn lại thành viền đen như ảnh trên. Không sai, nhưng mỗi lần mở Game view bạn lại nhìn thấy một khung nhỏ giữa màn hình.

Tạo một cỡ Game view vừa khít: mở dropdown độ phân giải ở thanh trên cùng của Game view (chỗ đang ghi `Free Aspect` hoặc `Full HD`), kéo xuống cuối danh sách và bấm dấu **+**. Đặt Label là `Platformer 512x288 x3`, Type là `Fixed Resolution`, kích thước `1536` × `864`, rồi bấm OK và chọn nó.

![Thanh trên của Game view đang chọn Platformer 512x288 x3](/images/posts/unity-platformer/00/gameview-size.webp)

1536 × 864 đúng bằng 512 × 288 nhân 3, vừa chia hết vừa đủ to để làm việc.

Danh sách cỡ Game view được lưu riêng cho từng nền tảng build. Mình tạo cỡ này khi đang ở Windows, tới lúc chuyển sang WebGL thì dropdown không còn nó nữa và phải thêm lại. Bài 15 build lên web bạn sẽ gặp đúng chuyện này.

## Kiểm tra

Mở mũi tên cạnh `Idle.png` trong Project window, kéo `Idle_0` vào scene và đặt Position `(1, 0, 0)`. Nhân bản nó (Ctrl+D) và đặt bản sao ở `(31, 16, 0)`.

Bấm Play:

![Game view lúc Play: một nhân vật ở góc dưới trái với chân chạm mép dưới, một nhân vật ở góc trên phải với đầu sát mép trên](/images/posts/unity-platformer/00/verify-corners.webp)

Ảnh trên là một bản mình đặt thêm một nhân vật ở giữa cho dễ so. Có ba điều bạn cần thấy:

- Nhân vật ở `(1, 0)` có chân chạm đúng mép dưới màn hình. Vậy là pivot đáy đúng, và camera bắt đầu từ `y = 0`.
- Nhân vật ở `(31, 16)` có đầu nằm sát mép trên. Ô của nó cao 2 unit nên đỉnh ô ở đúng `y = 18`, tức mép trên của khung. Khoảng hở nhỏ trên đầu là phần trống có sẵn trong ô vẽ.
- Chọn `Main Camera` trong lúc đang Play: Size là 9 và Current Pixel Ratio là `3:1`.

Zoom Game view vào một cạnh nhân vật. Mỗi pixel art phải là một khối vuông 3 × 3 pixel màn hình, cạnh là bậc thang sắc. Còn thấy vệt màu chuyển thì Filter Mode chưa phải Point, còn thấy màu loang thì Compression chưa phải None.

Thoát Play và xoá hai nhân vật thử đi. Bài sau sẽ có nhân vật thật.

## Những con số mang sang bài sau

| | Giá trị | Kéo theo |
|---|---|---|
| Pixels Per Unit | 16 | 1 tile = 1 unit, toạ độ là số nguyên |
| Pivot nhân vật | Bottom Center | `transform.position.y` là cao độ chân |
| Reference Resolution | 512 × 288 | Camera Size 9, khung nhìn 32 × 18 tile |
| Crop Frame | Windowbox | Khung nhìn giữ nguyên ở mọi cỡ cửa sổ |
| Game view | 1536 × 864 | Phóng đúng 3 lần |

Bài 1 dùng lưới này để vẽ một căn phòng 64 × 36 tile bằng Tilemap. Căn phòng rộng gấp đôi và cao gấp đôi khung nhìn, để tới bài 5 camera có chỗ mà đi theo nhân vật.
