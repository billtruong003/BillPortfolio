# 01 — Tilemap: vẽ một căn phòng

Ngày dựng: 2026-09-19 · Scene `PLT_01_Tilemap`

## Mục tiêu

Một phòng 64×36 tile có sàn, tường, trần, vài bệ nhảy và một khe hẹp để thử wall jump. Vật rơi xuống phải nằm yên, không lún, không vấp.

## Đã dựng

- 176 Tile asset trong `Assets/_Platformer/Art/Tiles/Tileset_N.asset`, `ColliderType = Grid`
- **`RT_Grass.asset`** — RuleTile 15 rule, dùng bộ 3×3 của tileset
- `Grid` (cell 1×1) → `Tilemap_Ground`: Tilemap + TilemapRenderer + Rigidbody2D Static + TilemapCollider2D + CompositeCollider2D
- 528 ô được sơn, **toàn bộ bằng một tile duy nhất** `RT_Grass`
- `DropTest_Box` — thùng thử, Rigidbody2D gravityScale 3, BoxCollider2D 2×2. Xoá trước chặng 02

Bố cục phòng (toạ độ tile, gốc dưới trái):

| Thứ | Vị trí | Để thử gì |
|---|---|---|
| Sàn | y 0–1, full | mọi thứ |
| Tường biên | x 0–1 và 62–63 | clamp camera bài 05 |
| Trần | y 34–35 | biên trên |
| Bệ 1 | x 8–16, y 5–6 | nhảy thường (cao 5 từ sàn) |
| Bệ 2 | x 20–28, y 10–11 | double jump |
| Bệ 3 | x 34–42, y 15–16 | chuỗi nhảy |
| Khe | x 48–49 và 54–55, y 2–22 | wall jump, rộng 4 unit |
| Bậc | x 30–33, y 2–3 | bước lên 1 tile |

## Số đã chốt

| Thông số | Giá trị |
|---|---|
| Phòng | 64 × 36 tile = 64 × 36 unit |
| Grid cell | 1 × 1 |
| Composite sau merge | **5 path, 14 shape** cho 528 ô |
| TilemapCollider2D.shapeCount khi merge | 0 — nó giao hết shape cho Composite |
| Thùng đáp | y = 8.0147, kỳ vọng 8.0 → lệch 0.0147 là contact offset mặc định |

## Vấp

### 1. Sơn bằng hai ô rời → tường trơn không viền

Lần đầu mình sơn bằng hai tile: `Tileset_1` cho mặt trên, `Tileset_17` cho thân. Kết quả nhìn qua thì "chạy được" — thùng vẫn đáp — nhưng tường và bệ **không có viền, không có góc**. Toàn bộ mặt trái tường là một mảng gạch phẳng.

Sai ở chỗ không nhìn kỹ tileset. Bộ ba hàng đầu tiên là **terrain block 3×3 chuẩn**:

```
 0   1   2     góc trên trái · cạnh trên · góc trên phải
16  17  18     cạnh trái     · giữa      · cạnh phải
32  33  34     góc dưới trái · cạnh dưới · góc dưới phải
```

Tác giả pack vẽ sẵn 9 ô để auto-tile. Sơn tay bằng 2 ô là vứt đi 7 ô còn lại.

→ **Đây là lỗi đáng đưa thẳng vào bài.** Ảnh trước (`01_room_composite.png`, tường trơn) và sau (`01_room_ruletile.png`, có viền góc) đặt cạnh nhau. Người mới sơn tay bằng Tile Palette cũng sẽ ra y hệt ảnh trước.

### 2. RuleTile: 9 rule chưa đủ, cần 15

9 rule cho 9 ô của khối 3×3 chỉ đúng khi khối dày ≥ 2 ô mỗi chiều. Bệ 1 ô cao, cột 1 ô rộng, hoặc ô đơn lẻ không khớp rule nào → rơi về Default Sprite (ô giữa 17) → mất viền.

Thêm 6 rule cho trường hợp mỏng: hàng đơn (3 rule: đầu trái / giữa / đầu phải), cột đơn (3 rule: đỉnh / giữa / đáy). Chỉ xét 4 hướng chính, bỏ qua đường chéo, vì tileset này **không có ô góc lõm** (inner corner).

→ Hệ quả: chỗ tường gặp sàn có một khấc nhỏ vì thiếu ô góc lõm. Đó là giới hạn của tileset, không phải lỗi rule. Bài viết nên nói thẳng.

### 3. `Grid` không nằm trong `UnityEngine.Tilemaps`

`UnityEngine.Tilemaps.Grid` → compile error. Type đúng là `UnityEngine.Grid`. Tilemap, TilemapRenderer, TilemapCollider2D thì trong `Tilemaps`, riêng Grid thì không. Người viết code sẽ vấp, người dùng menu thì không.

### 4. Tile asset phải có `ColliderType = Grid`

Mặc định khi tạo `Tile` bằng code là `None`. Không đặt thì TilemapCollider2D không sinh collider nào cả, thùng rơi xuyên sàn. Tạo qua Tile Palette thì Unity tự đặt `Sprite`, nhưng với pixel art ô vuông thì `Grid` gọn hơn và Composite merge sạch hơn.

### 5. Composite làm gì, nhìn thấy bằng số

Không có Composite: 528 ô = 528 collider vuông rời, và nhân vật đi ngang sẽ **vấp vào đường nối** giữa hai ô sàn phẳng (lỗi kinh điển của platformer Unity).

Có Composite với `CompositeOperation.Merge`: 528 ô → **5 path**. Sàn thành một đa giác liền, không còn đường nối.

Bằng chứng trong Inspector: `TilemapCollider2D.shapeCount = 0` sau khi merge, vì nó đã giao hết cho Composite. Người mới thấy số 0 dễ tưởng collider hỏng.

Composite bắt buộc có Rigidbody2D trên cùng object; đặt **Static** vì sàn không di chuyển.

## Ảnh cần chụp

- [x] `01_room_composite.png` — sơn 2 ô, tường trơn (ảnh "trước")
- [x] `01_room_ruletile.png` — RuleTile, có viền góc (ảnh "sau")
- [ ] Tileset zoom có đánh số, khoanh khối 3×3 — đã có bản `tileset_grid.png` ở scratchpad, cần chuyển vào Journal
- [ ] Inspector RuleTile với 15 rule
- [ ] Tile Palette với RT_Grass
- [ ] Inspector Tilemap_Ground: 4 component xếp đúng thứ tự
- [ ] CompositeCollider2D gizmo trong Scene view: 5 đường bao xanh
- [ ] Bảng so sánh có/không Composite (nếu tách được — tắt Composite rồi chụp gizmo 528 ô)

## Ghi cho người viết bài

**Dạy RuleTile từ đầu, không dạy sơn tay rồi mới sửa.** Mình đi đường vòng (sơn 2 ô → thấy xấu → RuleTile) là vì làm nhanh. Bài nên mở bằng việc nhìn tileset, chỉ ra khối 3×3, giải thích "9 ô này là để máy tự chọn", rồi dựng RuleTile ngay. Ảnh "sơn tay bị trơn" vẫn dùng được — nhưng đặt ở phần "vì sao cần RuleTile", không phải làm cho người đọc tự vấp.

**Số 5 path là câu verify.** "Chọn Tilemap_Ground, nhìn CompositeCollider2D, Path Count phải là số nhỏ (5), không phải hàng trăm." Đếm được, không mơ hồ.

**Bố cục phòng dựng bằng code, người đọc dựng bằng Tile Palette.** Bảng toạ độ ở trên là để người đọc vẽ lại đúng vị trí. Khe wall-jump và các bệ được đặt cố ý cho các bài 03–04 thử, nên bài 01 cần nói: "vẽ đúng chỗ này vì bài sau sẽ dùng".

**Còn 3 bộ terrain nữa chưa dùng:** cỏ vàng trên đất nâu (6·7·8 / 22·23·24 / 38·39·40), đá xám (12–15, 28–31, 44–47), khung kim loại (70–72, 86–88, 102–104). Bài 14 nối nhiều phòng có thể mỗi phòng một bộ. Rule giống hệt, chỉ đổi 9 sprite.

## Chưa làm, để chặng sau

- Xoá `DropTest_Box`
- Chưa có background layer — bài 05 hoặc 13 (parallax là juice)
- Tilemap thứ hai cho decor không có collider (bụi cỏ 19·20, gem 4, đá 9·10·25·26)
