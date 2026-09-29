---
title: "Platformer #1: Một căn phòng vẽ bằng một viên gạch"
date: "2026-09-28"
lang: vi
series: "platformer"
order: 1
excerpt: "Dựng RuleTile 15 rule để Unity tự chọn ô góc, ô cạnh, rồi vẽ căn phòng 64×36 tile bằng đúng một tile. Gộp 528 collider vuông thành một đường bao liền để nhân vật không vấp."
coverImage: "/images/posts/unity-platformer/01/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Tilemap", "RuleTile", "Tutorial"]
published: true
featured: false
---

Bài 0 đã có camera nhìn đúng 32 × 18 tile. Bài này vẽ căn phòng đầu tiên: rộng 64 tile, cao 36 tile, có sàn, tường, trần, ba bệ nhảy, một bậc thang và một khe hẹp. Hết bài, căn phòng có viền và góc đúng như người vẽ tileset muốn, và có collider liền mạch để các bài sau cho nhân vật chạy nhảy trên đó.

![Toàn bộ căn phòng 64 x 36 tile với vị trí các bệ, bậc và khe](/images/posts/unity-platformer/01/room-layout.webp)

Khung vàng ở góc dưới trái là phần camera của bài 0 nhìn thấy. Căn phòng to gấp đôi mỗi chiều, để tới bài 5 camera có chỗ mà đi theo nhân vật.

## Nhìn tileset trước khi vẽ

Cách nhanh nhất để vẽ sàn là chọn một ô cỏ cho hàng trên cùng, một ô đất cho phần bên dưới, rồi tô. Mình đã làm đúng như vậy ở lần đầu, và kết quả nhìn qua thì được, nhưng mọi đầu bệ đều bị cắt phẳng như cắt bằng dao.

Lý do nằm ở tileset. Mở `Tileset.png` phóng to lên và đánh số từng ô từ trái sang phải, từ trên xuống dưới:

![Ba hàng đầu của tileset được đánh số, khối 3x3 ở góc trái được khoanh đỏ](/images/posts/unity-platformer/01/tileset-numbered.webp)

Khối 3 × 3 được khoanh đỏ là một bộ terrain hoàn chỉnh:

```
 0   1   2     góc trên trái   cạnh trên   góc trên phải
16  17  18     cạnh trái       giữa        cạnh phải
32  33  34     góc dưới trái   cạnh dưới   góc dưới phải
```

Người vẽ làm sẵn chín ô để mỗi vị trí trong một khối đất có một ô riêng: ô ở mép trái có viền tối bên trái, ô ở góc trên phải có cỏ uốn xuống, và cứ thế. Tô bằng hai ô là bỏ phí bảy ô còn lại:

![Đầu trái của bệ 1: sơn tay bằng 2 ô bị cắt phẳng, RuleTile có viền tối quanh cạnh và ô góc cỏ uốn](/images/posts/unity-platformer/01/edge-two-tiles-vs-ruletile.webp)

Bản trên tô bằng hai ô, đầu bệ cắt phẳng và không có đáy. Bản dưới dùng đủ chín ô: có viền tối bao quanh, cạnh dưới có đường kết thúc, góc trên trái có mép cỏ riêng.

Tất nhiên bạn có thể tự chọn đúng ô cho từng vị trí khi tô. Nhưng căn phòng này có 528 ô, và mỗi lần sửa một bệ bạn lại phải chọn lại ô cho mọi chỗ xung quanh. Việc chọn ô theo hàng xóm là việc máy làm tốt hơn người, và Unity có sẵn công cụ cho việc đó là **RuleTile**.

## Cắt tileset

`Tileset.png` là một ảnh 256 × 176 chứa 16 × 11 ô. Chọn nó trong Project window và đặt setting import giống bài 0: Texture Type `Sprite (2D and UI)`, Sprite Mode `Multiple`, Pixels Per Unit `16`, Filter Mode `Point (no filter)`, Compression `None`. Bấm Apply rồi mở Sprite Editor.

Bấm **Slice** và đặt:

- Type: `Grid By Cell Size`
- Pixel Size: `16` × `16`
- Pivot: `Center`
- **Keep Empty Rects**: bật

Bấm Slice, rồi Apply.

![Sprite Editor của Tileset.png sau khi cắt lưới 16x16, ô Tileset_0 được chọn](/images/posts/unity-platformer/01/tileset-sliced.webp)

Dòng Keep Empty Rects dễ bị bỏ qua nhất. Tileset này có nhiều ô trống, và nếu không giữ ô trống thì Unity chỉ đánh số các ô có hình, nên số thứ tự sẽ lệch khỏi vị trí trong lưới. Giữ cả ô trống thì `Tileset_17` luôn là ô ở hàng 2 cột 2, đúng với số trong ảnh ở trên và trong mọi bài sau. Trong Project window, mở mũi tên cạnh `Tileset.png` bạn sẽ thấy 176 sprite từ `Tileset_0` tới `Tileset_175`.

Pivot để `Center` là đúng cho tile. Tilemap đặt tâm sprite vào tâm ô, nên ô 16 pixel khớp đúng ô lưới 1 × 1 unit.

## Dựng RuleTile

RuleTile là một tile biết nhìn bốn ô xung quanh nó. Bạn khai báo một danh sách quy tắc kiểu "nếu bên trên trống, bên dưới có đất, bên trái trống, bên phải có đất thì dùng ô 0", và mỗi lần một ô được tô hay bị xoá, Unity chạy lại các quy tắc cho ô đó và các ô hàng xóm.

Tạo thư mục `Assets/_Platformer/Art/Tiles`. Chuột phải vào nó, chọn **Create > 2D > Tiles > Rule Tile**, đặt tên `RT_Grass`. Nếu menu không có dòng Rule Tile, mở Package Manager và cài **2D Tilemap Extras**. Project dựng từ template 2D thường đã có sẵn gói này.

Chọn `RT_Grass`, trong Inspector đặt:

- **Default Sprite**: `Tileset_17`. Ô nào không khớp quy tắc nào sẽ dùng ô giữa này.
- **Default Collider**: `Grid`. Mỗi ô có một collider vuông đúng bằng ô lưới, không bám theo hình vẽ. Tile trong tileset này đều là khối đặc 16 × 16 nên `Grid` là đủ và cho collider gọn nhất.

Rồi bấm dấu **+** ở cuối danh sách Tiling Rules để thêm từng quy tắc. Mỗi quy tắc có ba thứ cần đặt: ô sprite ở bên phải, dòng Collider (đặt `Grid`), và lưới 3 × 3 ở giữa. Bấm vào một ô trong lưới 3 × 3 sẽ đổi lần lượt giữa mũi tên xanh (ô đó có cùng tile), dấu X đỏ (ô đó không có) và để trống (không xét).

![Inspector của RT_Grass: Default Sprite Tileset_17, Default Collider Grid, 15 Tiling Rules, bốn rule đầu với lưới hàng xóm và sprite tương ứng](/images/posts/unity-platformer/01/ruletile-inspector.webp)

Đây là đủ 15 quy tắc của `RT_Grass`, mỗi ô vuông nhỏ là một hàng xóm:

![Sơ đồ 15 rule: 9 rule cho khối dày, 6 rule cho hàng đơn và cột đơn, mỗi rule có lưới hàng xóm và sprite](/images/posts/unity-platformer/01/ruletile-15-rules.webp)

Chín quy tắc đầu ứng với chín ô của khối 3 × 3. Chúng chỉ đúng khi khối đất dày ít nhất hai ô mỗi chiều. Một bệ chỉ cao một ô thì mọi ô của nó vừa trống bên trên vừa trống bên dưới, không khớp quy tắc nào trong chín cái, và sẽ rơi về Default Sprite là ô 17, tức là mất cỏ. Sáu quy tắc sau lo cho hai trường hợp mỏng đó: hàng đơn (đầu trái, giữa, đầu phải) và cột đơn (đỉnh, giữa, đáy). Các phòng trong series này không có chỗ nào mỏng một ô, nhưng khi bạn tự vẽ màn của mình thì gặp ngay, chỉ cần một bệ cao một ô là đủ. Thêm đủ 15 quy tắc ngay từ đầu thì sau này vẽ gì cũng không phải quay lại sửa tile.

Bốn ô chéo luôn để trống, vì tileset này không có ô "góc lõm", là loại ô dùng cho chỗ tường đứng gặp mặt sàn. Không có ô để chọn thì cũng chẳng có lý do gì để xét ô chéo. Hệ quả là chỗ tường gặp sàn trông hơi cụt:

![Góc trong chỗ tường trái gặp sàn: viền tường dừng đột ngột, cỏ bắt đầu ngay sát tường](/images/posts/unity-platformer/01/notch-inner-corner.webp)

Đây là giới hạn của bộ art chứ không phải lỗi quy tắc. Muốn góc này đẹp thì phải vẽ thêm ô góc lõm, rồi thêm quy tắc có xét ô chéo cho nó.

Quy tắc được kiểm từ trên xuống và ô nhận quy tắc đầu tiên khớp. Ở đây mỗi quy tắc đã xét đủ bốn hướng nên không có hai quy tắc nào cùng khớp một ô, thứ tự không ảnh hưởng. Khi bạn thêm quy tắc có ô để trống, đặt quy tắc cụ thể hơn lên trên.

## Tilemap và Tile Palette

Trong Hierarchy, chọn **GameObject > 2D Object > Tilemap > Rectangular**. Unity tạo một object `Grid` và một object con `Tilemap`. Đổi tên object con thành `Tilemap_Ground`. Để nguyên `Grid` ở `(0, 0, 0)` với Cell Size `(1, 1, 0)`: một ô lưới bằng một unit, và với PPU 16 thì bằng đúng một tile.

Mở **Window > 2D > Tile Palette**. Trong cửa sổ Tile Palette, mở dropdown palette và chọn **Create New Palette**, đặt tên `PAL_Grass`, Grid `Rectangular`, Cell Size `Automatic`, bấm Create và chọn thư mục `Art/Tiles/Palettes`. Kéo asset `RT_Grass` từ Project window thả vào vùng trống của palette.

![Cửa sổ Tile Palette: dropdown mục tiêu là Tilemap_Ground, palette PAL_Grass chứa RT_Grass](/images/posts/unity-platformer/01/tile-palette.webp)

Ô trong palette hiện ô đất giữa vì đó là Default Sprite, bạn không cần lo. Dropdown ngay dưới hàng công cụ phải ghi `Tilemap_Ground`, đó là tilemap sẽ nhận nét tô.

Bấm vào ô `RT_Grass` trong palette để chọn nó, rồi chọn công cụ **Box Fill**, là biểu tượng thứ tư trên hàng công cụ (hình ô vuông có nét đứt). Công cụ này tô cả một hình chữ nhật bằng một lần kéo chuột trong Scene view, nhanh hơn nhiều so với cọ.

## Vẽ căn phòng

Tô theo bảng dưới. Toạ độ là toạ độ ô, gốc ở góc dưới trái. Scene view có lưới 1 unit nên bạn đếm ô theo đường lưới.

| Phần | Ô x | Ô y | Để làm gì |
|---|---|---|---|
| Sàn | 0 tới 63 | 0 tới 1 | Mặt sàn ở y = 2 |
| Tường trái | 0 tới 1 | 2 tới 33 | Biên trái, bài 5 camera dừng ở đây |
| Tường phải | 62 tới 63 | 2 tới 33 | Biên phải |
| Trần | 0 tới 63 | 34 tới 35 | Biên trên |
| Bệ 1 | 8 tới 16 | 5 tới 6 | Mặt trên cao hơn sàn 5 ô, bài 3 nhảy thường phải lên vừa tới |
| Bệ 2 | 20 tới 28 | 10 tới 11 | Cao hơn bệ 1 thêm 5 ô: đứng trên bệ 1 nhảy thường là lên tới |
| Bệ 3 | 34 tới 42 | 15 tới 16 | Cao hơn bệ 2 thêm 5 ô, leo từng bậc như một cầu thang lớn |
| Bậc | 30 tới 33 và 32 tới 33 | 2 và 3 | Hai bậc cao 1 ô và 2 ô |
| Hai cột | 48 tới 49 và 54 tới 55 | 2 tới 22 | Khe rộng 4 ô ở giữa cho wall jump ở bài 4 |

Các con số không đặt ngẫu nhiên. Bài 3 sẽ tính lực nhảy sao cho nhân vật lên được đúng 5 ô, và bệ 1 cao đúng 5 ô là để bạn kiểm con số đó bằng mắt. Khe rộng 4 ô là vừa đủ cho nhân vật rộng khoảng 1 ô bật qua lại giữa hai tường.

Tô xong, cả căn phòng dùng đúng một tile là `RT_Grass`, tổng cộng 528 ô. Mọi viền, góc, mép cỏ đều do quy tắc tự chọn. Thử xoá một ô ở hàng trên cùng, giữa bệ 1, bằng công cụ Eraser. Các ô xung quanh tự đổi theo: ô bên trái thành góc phải, ô bên phải thành góc trái, và ô ngay bên dưới mọc cỏ vì giờ nó không còn gì ở trên. Bấm Ctrl+Z để trả lại.

## Collider cho căn phòng

Căn phòng mới chỉ là hình. Muốn vật đứng được trên nó thì Tilemap cần collider.

Chọn `Tilemap_Ground`, thêm **Tilemap Collider 2D**. Component này đọc collider của từng ô từ tile, ở đây là `Grid` như đã đặt trong `RT_Grass`, và sinh ra một hình vuông cho mỗi ô.

528 hình vuông rời như vậy có một vấn đề ai làm platformer trong Unity cũng từng gặp. Khi nhân vật trượt trên sàn phẳng, collider của nó có thể vấp vào mép của hình vuông kế tiếp, dù hai hình vuông nằm sát nhau và cùng độ cao. Sai số số thực làm mép hình vuông sau nhô lên một chút, đủ để nhân vật khựng lại hoặc nảy lên giữa đường chạy. Đây là gizmo collider của sàn và bệ 1 lúc này:

![Gizmo collider khi chưa gộp: mỗi ô gạch là một hình vuông riêng](/images/posts/unity-platformer/01/gizmo-no-composite.webp)

Cách chữa là gộp tất cả thành một hình liền, không còn đường nối nào bên trong. Thêm **Composite Collider 2D** vào cùng object. Unity tự thêm luôn một **Rigidbody 2D**, vì Composite Collider 2D cần có Rigidbody 2D mới chạy được.

Rigidbody 2D thêm vào mặc định là `Dynamic`, tức là chịu trọng lực. Để nguyên như vậy rồi bấm Play thì cả căn phòng sẽ rơi xuống khỏi màn hình. Đổi **Body Type** sang `Static`, vì sàn không bao giờ di chuyển.

Cuối cùng, ở Tilemap Collider 2D, đổi **Composite Operation** từ `None` sang `Merge`. Dòng này bảo Tilemap Collider 2D giao hết hình của nó cho Composite Collider 2D để gộp lại.

![Inspector của Tilemap_Ground: Rigidbody 2D Static, Tilemap Collider 2D với Composite Operation Merge, Composite Collider 2D](/images/posts/unity-platformer/01/tilemap-ground-inspector.webp)

Gizmo sau khi gộp:

![Gizmo collider sau khi gộp: một đường bao liền quanh sàn, tường và bệ](/images/posts/unity-platformer/01/gizmo-composite.webp)

Sàn giờ là một đường bao liền, không còn đường nối nào giữa các ô. Đường chéo ở góc dưới trái là do Unity chia đa giác lõm thành các mảnh lồi để tính va chạm. Nó nằm bên trong đất nên không có mép nào để vấp.

Trong khi bạn đang chọn `Tilemap_Ground`, đặt luôn **Layer** ở góc trên phải Inspector. Mở dropdown, chọn **Add Layer**, gõ `Ground` vào một ô User Layer trống, rồi quay lại chọn `Ground` cho object. Bài 2 sẽ dùng layer này để nhân vật biết mình đang đứng trên đất.

## Kiểm tra

Mở mũi tên cạnh Composite Collider 2D, mục **Info** ở cuối có dòng Shape Count:

![Mục Info của Composite Collider 2D: Shape Count 14](/images/posts/unity-platformer/01/composite-info.webp)

Con số phải là một số nhỏ, ở phòng này là 14, chứ không phải 528. Mở Info của Tilemap Collider 2D thì Shape Count là 0. Số 0 này trông như hỏng, nhưng nó chỉ có nghĩa là Tilemap Collider 2D đã giao hết hình cho Composite, đúng như mình muốn. Nếu bạn thấy 528 ở Tilemap Collider 2D thì Composite Operation vẫn đang là `None`.

14 hình chứ không phải 1 vì phòng có nhiều khối tách rời (sàn gộp với tường và trần thành một khối, ba bệ, bậc thang), và mỗi khối lõm lại bị chia thành vài mảnh lồi như đường chéo ở trên.

Giờ thử thả một vật. Mở mũi tên cạnh `Tileset.png`, kéo `Tileset_92` (khối vuông xanh) vào scene, đặt Position `(12.5, 14, 0)`. Thêm **Rigidbody 2D** và **Box Collider 2D**. Box Collider 2D tự lấy kích thước từ sprite nên bằng đúng 1 × 1.

Bấm Play. Khối rơi xuống và nằm yên trên bệ 1:

![Khối vuông xanh nằm yên trên mặt cỏ của bệ 1](/images/posts/unity-platformer/01/drop-test.webp)

Ảnh này mình đổi nền sáng cho dễ nhìn. Với nền `#1A1C2C` của bài 0, viền tối của gạch và của khối gần trùng màu nền nên trông như có khe hở dù thật ra chúng đang chạm nhau.

Chọn khối trong lúc Play và nhìn Transform: Position Y khoảng `7.515`. Tâm khối ở 7.5 thì đáy ở 7.0, đúng mặt trên của bệ 1. Phần lẻ 0.015 là do Physics 2D luôn giữ hai collider cách nhau một khoảng rất nhỏ thay vì cho chạm khít, để chúng không lồng vào nhau (độ dày khoảng đệm này chỉnh ở Default Contact Offset trong Project Settings > Physics 2D, mặc định 0.01). 0.015 unit chưa tới một phần tư pixel nên mắt không thấy.

Thoát Play và xoá khối thử đi.

## Bài sau

Căn phòng có sàn liền và layer `Ground`. Bài 2 đặt nhân vật vào phòng và cho nó chạy trái phải, và câu hỏi đầu tiên là nên cho vật lý điều khiển nhân vật hay tự viết code di chuyển nó.
