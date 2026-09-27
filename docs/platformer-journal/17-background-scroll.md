# 17 — Nền cuộn vô hạn: thử shader, rồi bỏ shader

Ngày dựng: 2026-09-20 · `_Common/Scripts/FX/ParallaxLayer.cs`

## Mục tiêu

Nền ở chặng 14 là một tấm sprite tĩnh. Muốn nó **lát vô hạn, tự trôi chậm, và trôi chậm hơn thế giới** để có chiều sâu.

Làm hai lần. Lần đầu bằng shader, lần hai bằng sprite. Bản đang chạy là bản thứ hai, và lý do đổi mới là phần đáng đọc.

## Lần một: shader tính UV từ toạ độ thế giới

Viết `ScrollingBackground.shader`, không lấy UV từ mesh mà từ vị trí thế giới của fragment:

```hlsl
float2 offset = _Scroll.xy * _Time.y - _WorldSpaceCameraPos.xy * (1.0 - _Parallax);
float2 uv = (i.worldXY + offset) * _Tiling.xy;
```

Nó **chạy đúng**, và đo được đúng:

| Đối tượng | Dịch đo được khi camera đi +4 u (192 px) | Parallax suy ra | Đặt |
|---|---|---|---|
| Thế giới | −192 px, err **0.00** | 1.000 | — |
| Lớp far | −48 px | **0.250** | 0.25 |
| Lớp near | −106 px, err **0.00** | **0.552** | 0.55 |

Nhưng nó kéo theo ba thứ phải tự lo, mà mỗi thứ đều đã cắn một lần:

1. **NaN trên WebGL.** `_MainTex_TexelSize` khai trong `UnityPerMaterial` về **0** trên WebGL ⇒ `1/0 = inf` ⇒ `round(x/inf)*inf = NaN` ⇒ nền ra **một màu phẳng**. Editor thì đúng. Phải thêm property `_Texels` tự đặt tay.
2. **Snap texel viết sai chỗ.** Bản đầu snap UV cuối cùng — vô nghĩa, vì point sampling vốn đã làm tròn UV rồi. Phải snap **offset tính bằng world unit**.
3. **`_Time` phình mãi.** `_Scroll * _Time.y` không bao giờ quay lại, chạy lâu là mất độ chính xác float và cú trôi giật thành nấc. Phải tự quấn về một chu kỳ.

Ba thứ đó đều là **việc mà đường render sprite thường đã làm hộ**.

## Lần hai: bỏ shader, chỉ di chuyển sprite

Cách này đúng như mô hình quen thuộc: **một hướng, một tốc độ, và cứ đi hết một ô thì kéo về**.

```csharp
Drift += direction.normalized * (speed * Time.deltaTime);
Drift = Wrap(Drift, tile);                    // hết một ô thì kéo về, mắt không thấy

Vector2 want = camPos * (1f - parallax) + Drift;
Vector2 rel  = want - camPos;
rel.x -= tile.x * Mathf.Round(rel.x / tile.x);   // kéo lớp nền về sát camera, theo từng ô trọn
rel.y -= tile.y * Mathf.Round(rel.y / tile.y);
transform.position = camPos + rel;
```

Renderer là **SpriteRenderer kiểu Tiled với material sprite mặc định**. Không shader riêng.

Và đó chính là điểm mạnh: lớp nền đi qua **đúng đường render mà tilemap và nhân vật đang đi** — cùng point filter, cùng pixel snapping của `PixelPerfectCamera`. Một tấm nền vẽ bằng UV tự tính có thể lệch nhịp với phần còn lại của màn hình; một tấm nền **là sprite** thì không thể, vì nó là sprite.

Ba thứ phải tự lo ở trên biến mất:

| | Bản shader | Bản sprite |
|---|---|---|
| Snap pixel | tự viết, và viết sai lần đầu | `PixelPerfectCamera` lo |
| Kích thước texture | `_Texels` tự đặt tay (vì built-in hỏng trên WebGL) | không cần |
| Chặn số phình | tự quấn `_Time` | quấn `Drift`, một dòng, chạy ở CPU |

## Số đã chốt

| | Giá trị |
|---|---|
| Hoa văn | `Backgrounds/1.png`, 64 × 64 px |
| Một ô (`tile`) | 4 × 4 u |
| `direction` | (1, 0) |
| `speed` | 0.6 u/s |
| **Chu kỳ reset** | 4 / 0.6 = **6.67 s** |
| `parallax` | 0.35 |
| `paddingTiles` | 2 → quad 48 × 36 u (khung nhìn 32 × 18 + lề) |
| Tint | (0.42, 0.47, 0.64) |

## Kết quả đo

**Tốc độ và chu kỳ reset** — đọc thẳng `Drift` trong Play, cửa sổ ngắn hơn một chu kỳ:

```
dt = 6.550 s   Drift: 3.829 -> 3.759   (đã quấn một lần trong khoảng này)
quãng đi = 3.759 + 4.000 − 3.829 = 3.930 u
tốc độ đo = 3.930 / 6.550 = 0.6000001 u/s     đặt 0.6
Drift luôn nằm trong [0, 4)                   reset chạy đúng
```

**Parallax** — đóng băng `Time.timeScale = 0` để tắt trôi, dịch camera đúng +4.0 u:

```
transform lệch : −1.400 u  = đúng 4 × 0.35
đo trên ảnh    : −69 px    (kỳ vọng 67.2 px)
```

Chênh 1.8 px là do `PixelPerfectCamera` làm tròn renderer về pixel nguyên — tức là **đúng như mong muốn**, không phải sai số.

**Độ nét** — đếm màu trong một mảng chỉ có nền, 200 × 100 px:

```
distinct colours = 2
   (91, 110, 158)  x10016
   (101, 121, 165)  x9984
```

Đúng **hai** màu, không một màu trung gian nào. Có blend hay filter mềm thì con số này phải là hàng chục.

## Vấp

### 1. "Nhòe" hoá ra không phải nhòe

Người chơi báo nền bị nhòe. Đi soi importer trước: `filter=Point`, `mips=False`, `compression=Uncompressed`, `format=RGBA32` — **giống hệt tile**. Vậy không phải filter, không phải nén.

Soi thẳng vào hoa văn thì ra nguyên nhân:

| File | Số màu | Hai màu đó |
|---|---|---|
| `1.png` | **2** | (188,203,213) và (170,186,206) — chênh ~18 |
| `5.png` | **2** | (187,184,208) và (181,169,201) — chênh ~6 |

Hoa văn của pack vốn chỉ có hai màu và cố tình rất nhạt. Tôi lại nhân tint **0.24** nữa ⇒ hai màu chỉ còn chênh **~4 mỗi kênh**, dưới ngưỡng mắt phân biệt. Rồi chồng thêm một lớp thứ hai alpha 0.35 lên trên.

Kết quả là một mảng xám lờ mờ. Từng pixel vẫn sắc cạnh, nhưng **không còn gì để nhìn ra cạnh**.

Sửa: bỏ lớp thứ hai, nâng tint lên 0.42 (hai màu chênh ~7).

→ **Đáng đưa vào bài.** "Nhòe" là mô tả triệu chứng, và triệu chứng đó có ít nhất ba nguyên nhân rất khác nhau: filter bilinear, mipmap, và **tương phản bị bóp**. Cách phân biệt rẻ nhất là đếm số màu trong một mảng ảnh: nhòe do filter cho hàng chục màu, bóp tương phản vẫn cho đúng hai.

### 2. Hai lớp parallax chồng nhau nhìn ra nhiễu, không ra chiều sâu

Hai hoa văn khác nhau, trôi ngược chiều, ở hai tốc độ — nghe thì hay, nhìn thì rối. Với pixel art tương phản thấp, lớp thứ hai chỉ làm nhiễu lớp thứ nhất.

Một lớp, rõ ràng, hơn hai lớp mờ.

### 3. Đo tốc độ trong khoảng dài hơn chu kỳ thì ra số vô nghĩa

Lần đầu đo ra **0.097 u/s** thay vì 0.6. Vì cửa sổ đo 7.95 s dài hơn chu kỳ 6.67 s nên `Drift` đã quấn một vòng, hiệu số trực tiếp mất 4 u.

Cộng lại: (0.769 + 4.000) / 7.948 = 0.600 ✓. Nhưng bài học là **cửa sổ đo phải ngắn hơn chu kỳ**, đúng cùng một loại bẫy alias đã gặp khi đo parallax bằng tương quan pixel.

## Ảnh cần chụp

- [x] `17_background_sprite_layer.png` — bản đang chạy
- [x] `17_background_pixels_zoom.png` — phóng to cạnh hoa văn, thấy bậc thang pixel rõ
- [ ] Đối chiếu tint: 0.24 (mờ thành xám) vs 0.42 (đọc được)
- [ ] Đối chiếu một lớp vs hai lớp chồng nhau
- [ ] Sơ đồ wrap: quad bị kéo về sát camera theo từng ô trọn
- [ ] Inspector `ParallaxLayer` với direction / speed / parallax / reset period

## Ghi cho người viết bài

**Bài này nên kể theo đúng thứ tự đã làm: shader trước, rồi bỏ shader.** Hiếm bài tutorial nào dám viết "tôi làm cách phức tạp, chạy được, rồi vứt đi". Nhưng đó mới là chỗ dạy được nhiều nhất — vì lý do vứt không phải "shader sai", mà là **shader bắt mình tự làm lại ba việc mà đường render sprite đã làm sẵn**, và mình làm sai hai trong ba.

**Câu chốt của bài**: thứ gì phải trông giống phần còn lại của game thì nên đi **cùng một đường render** với phần còn lại của game. Nền là sprite thì nó không thể nét khác sprite được.

**Mục "nhòe hoá ra không phải nhòe" nên đứng riêng.** Nó dạy cách đọc một lời phàn nàn: người chơi nói triệu chứng, mình phải tìm nguyên nhân, và ở đây nguyên nhân nằm ở chỗ chẳng ai ngờ — **bảng màu của asset**, không phải code, không phải import setting.

**Giữ mục 3.** Hai lần trong cùng một bài, cùng một loại bẫy: đo một đại lượng tuần hoàn trong cửa sổ dài hơn chu kỳ của nó. Lần thì alias pixel, lần thì alias thời gian.

**Vẫn nên giữ đoạn shader trong bài**, kèm cả ba cái bẫy của nó (NaN trên WebGL, snap sai chỗ, `_Time` phình). Người đọc sẽ gặp lại chúng khi viết shader khác — chỉ là lần này không phải trả giá cho một tấm nền.

## Chưa làm

- Trôi theo trục Y (mây bay) — `direction` là vector nên chỉ là đổi số
- Đổi hoa văn theo từng màn: hiện cả ba màn dùng chung một lớp
- Lớp thứ hai làm cho ra hồn: cần một hoa văn tương phản cao hơn, không phải thêm một lớp nhạt nữa
