# 15 — Soát lại: pivot, collider, vị trí đặt, layer

Ngày dựng: 2026-09-19 · toàn bộ 18 scene

## Mục tiêu

Sau khi xong 14 chặng, soát lại bốn thứ bằng số chứ không bằng mắt: tỉ lệ pixel per unit, collider, vị trí đặt object trên map, và layer. Bốn thứ này sai thì sai âm thầm — game vẫn chạy, vẫn build được, chỉ là không đúng.

Kết quả: **cả bốn đều có lỗi**, và một trong số đó làm màn chơi không thể hoàn thành được.

> ⚠️ Chặng này kết thúc bằng `CLEAN across all 18 scenes`, và kết luận đó **quá tự tin**. Nó chỉ soát hình học. Người chơi đầu tiên mở game lên vẫn không thắng được, vì bảng va chạm Physics2D tắt `Player × Default` trong khi thùng, checkpoint và cửa thoát đều nằm ở `Default` — xem [chặng 16](16-playtest-fixes.md).

## Cách soát

Không nhìn màn hình. Viết script đo:

1. Đọc alpha của từng ô sprite bằng Python/PIL, gộp qua **mọi clip** của một nhân vật, ra hộp chứa thật của phần vẽ.
2. Trong Unity, so ba con số cho từng object: **đáy hình**, **đáy collider**, **mặt sàn tile ngay dưới**.
3. Quét tile để tìm object nằm lọt trong lòng gạch.
4. Liệt kê sorting layer và physics layer của mọi renderer.

## Lỗi 1 — Pivot sai: mọi nhân vật lún 0.5 u xuống sàn

Đo alpha của tất cả clip:

| Bộ sprite | Ô | Phần vẽ (px từ đáy ô) | `gapBottom` |
|---|---|---|---|
| Player Char1 | 32×32 | y 0..32 | **0** |
| Jumper1 | 48×48 | y 0..32 | **0** |
| Jumper2 | 48×48 | y 0..31 | **0** |
| Charger | 48×48 | y 0..34 | **0** |
| Cannon | 48×48 | y 0..29 | **0** |
| Brute | 72×48 | y 0..26 | **0** |
| Traps | 48×48 | y 0..48 | **0** |

`gapBottom = 0` ở **tất cả**: pack vẽ nhân vật chạm đáy ô. Tức là nó được thiết kế cho pivot **Bottom**. Mình để **Center** suốt 14 chặng.

Hậu quả đo được ở `PLT_14_Level3`:

| Object | đáy hình | đáy collider | mặt sàn | lệch |
|---|---|---|---|---|
| Enemy_Jumper1_A | 6.50 | 7.00 | 7.00 | hình lún **−0.50** |
| Enemy_Jumper1_B | 11.50 | 12.00 | 12.00 | **−0.50** |
| Enemy_Jumper2_A | 1.50 | 2.00 | 2.00 | **−0.50** |
| Enemy_Charger | 1.50 | 2.00 | 2.00 | **−0.50** |
| Enemy_Cannon | 16.50 | 17.00 | 17.00 | **−0.50** |

Nửa đơn vị = **8 pixel**. Chân địch chôn dưới mặt cỏ, trong mọi ảnh chụp từ bài 10 trở đi.

Người chơi thì không lún, vì ô của nó là 32 và phần vẽ gần như lấp đầy ô — trùng hợp, không phải do làm đúng.

### Sửa

Đặt pivot về đáy cho Player, 4 loại địch đi đất, Brute, traps, checkpoint, cửa thoát. Sau đó **transform.y chính là chân**, đặt object ở đúng cao độ mặt sàn, và collider lùi lên bằng `offset.y = size.y / 2`.

Flyer giữ pivot Center vì nó bay, không bao giờ chạm đất.

Đo lại: `artVsCol = 0.00` và `colVsFloor = 0.00` cho toàn bộ 8 đơn vị đi đất.

## Lỗi 2 — Collider boss lệch 0.78 u và to gấp rưỡi

Ô sprite của Brute là **72×48** nhưng thân nó nằm ở **phần bên phải** của ô:

| Clip | x của phần vẽ |
|---|---|
| Idle | 38..59 |
| Run | 36..59 |
| Hit | 35..62 |
| **Attack** | **0..60** |
| **Run_Attack** | **1..59** |

Hai clip đòn đánh trải rộng sang trái — đó là tầm vung, không phải thân. Thân thật (Idle/Run/Hit) là **x 35..62, tâm 48.5 px** trong ô 72 px, còn tâm ô là 36 px.

Collider đang đặt tâm tại transform, tức tâm ô:

| | Thân thật | Collider cũ |
|---|---|---|
| Tâm ngang (world) | 58.78 | 58.00 |
| Rộng | 1.69 u | 2.60 u |
| Cao | 1.63 u | 2.60 u |

Lệch trái **0.78 u**, rộng gấp 1.54×, cao gấp 1.60×. Nghĩa là người chơi đứng cách boss cả nửa ô vẫn chết, còn giẫm lên đầu thì hụt.

### Sửa

Pivot Brute đặt tại **48.5/72 = 0.6736** theo trục x — tâm **thân**, không phải tâm ô. Flip theo hướng thì lật quanh chính tâm thân nên vẫn đúng. Collider về **1.70 × 1.60**, offset (0, 0.80).

## Lỗi 3 — Đấu trường boss bị bịt kín, cửa thoát nằm trong đó

In cả bản đồ ra mới thấy:

```
22|##..............................................##............##.
   ...
03|##..................X.......X...##..............####..........##.
02|##....P.....c.................####j...c.....^...####......BE..##.
01|################################################################
```

Tường ở `x 48..51` cao **20 ô**, từ y=2 lên tới y=22. Sau tường là boss (B) và **cửa thoát (E)**. Người chơi nhảy cao nhất 5.22 u, wall jump thì đẩy ra xa tường nên không leo được vách phẳng.

**Không có đường vào.** Cả 8 scene đều vậy — ở các scene trước bài 12 thì là hai vách `x 48..49` và `x 54..55`, cũng cao 20 ô, cũng chặn cửa thoát.

Suốt 14 chặng mình chưa bao giờ phát hiện, vì mọi lần test đều gọi `room.Complete()` và `gem.Take()` bằng script chứ chưa từng đi bộ tới đó.

Thêm nữa, `Gem_4` đặt tại (51.5, 12) — **nằm trong lòng tường**, không thể nhặt.

### Sửa

Cắt mọi vách ngăn trong `x 48..56` xuống còn mặt trên **y = 6** (giữ ô y 2..5). Bốn đơn vị là một cú nhảy thoải mái, mà boss lao vào vách 4 ô vẫn dừng.

Xoá tile bằng code nên phải dùng lại đúng cách chữa của bài 12: bật tắt `TilemapCollider2D` rồi mới `GenerateGeometry()`.

`Gem_4` chuyển về (56.5, 5.5) — trong đấu trường, cách sàn 3.5 u, phải vào tận nơi mới lấy được.

Chạy thật bằng `MotionRecorder`, xuất phát x=45.5:

```
t0.00 (45.5,2.0)G   t0.46 (47.4,6.5)a   t1.06 (52.3,6.0)G   t1.66 (56.5,2.0)G
```

Chạy → nhảy lên đỉnh vách y=6 → đi qua → rơi xuống sàn đấu trường. Một cú nhảy thường. Sau đó nhảy thẳng lên nhặt được `Gem_4`: `gems 1/5`.

## Lỗi 4 — Có 7 sorting layer nhưng không dùng cái nào

Project sẵn có `Background / Default / Enemies / Projectiles / Player / FX / UI` từ series shmup. Toàn bộ platformer nằm ở **Default**, phân tầng bằng `sortingOrder` rời rạc: 2, 3, 4, 5, 6, 8, 10, và nền là **−1000**.

Layer vật lý cũng vậy: có sẵn `Pickup(10)` nhưng gem, hộp, checkpoint, cửa thoát đều nằm ở `Default(0)`.

### Sửa

| Object | Sorting layer | Order | Physics layer |
|---|---|---|---|
| Background | Background | 0 | Default |
| Tilemap_Ground | Default | 0 | Ground |
| LevelExit | Default | 10 | Default |
| Checkpoint | Default | 20 | Default |
| Trap | Default | 30 | Hazard |
| Box | Default | 40 | Default |
| Gem | Default | 50 | **Pickup** |
| Địch + Boss | **Enemies** | 0 | Enemy |
| Player | **Player** | 0 | Player |
| Cannonball | **Projectiles** | 0 | EnemyProjectile |
| VFX hồi sinh | **FX** | 20 | — |

## Lỗi 5 — Tỉ lệ pixel: build web hiện nhiều hơn thiết kế 25%

Con số PPU=16 thì đúng: tile 16 px = 1 unit, `orthographicSize = 288/16/2 = 9`. Cái sai là `PixelPerfectCamera` chưa bật gì cả:

```
pixelSnapping = false   cropFrameX = false   cropFrameY = false   stretchFill = false
```

Trong Editor ở 1536×864 (đúng 3×) thì không lộ. Trên trình duyệt canvas 1600×900:

| | Trước | Sau |
|---|---|---|
| zoom | 3 | 3 |
| orthographicSize | **11.25** | 9 |
| Khung nhìn | **40 × 22.5 u** | **32 × 18 u** |

Không crop thì PPC lấy nguyên khung cửa sổ rồi mới chia zoom, nên người chơi web thấy rộng hơn thiết kế 25%, và vì `pixelSnapping` tắt nên sprite rơi vào vị trí lẻ pixel — pixel to nhỏ không đều khi camera trượt.

### Sửa

`pixelSnapping = true`, `cropFrameX = cropFrameY = true`, `stretchFill = false`. Khung nhìn khoá đúng 512×288 ở mọi cỡ cửa sổ, đổi lại có viền đen. Đã kiểm trên trình duyệt: canvas 1600×900, vùng vẽ 1536×864, viền 32 px mỗi bên — mỗi pixel art đúng **3 pixel màn hình**.

## Lỗi 6 (phát sinh khi sửa) — probe tường tự chạm mặt sàn

Thu collider boss từ 2.60 xuống 1.60 thì boss **đứng im ngay từ đầu**: vào Charge rồi lập tức báo "đụng tường".

`wallBox = (0.15, 2.0)` là số gõ tay, đo từ tâm collider. Collider mới cao 1.60, tâm ở 2.80 ⇒ hộp probe trải **1.80 .. 3.80**, mà mặt sàn ở y=2.00 ⇒ probe thò 0.2 xuống dưới sàn và **coi chính mặt đất mình đang đứng là tường**.

Charger và jumper may mà thoát: `wallBox.y = 1.2 < 1.7`.

### Sửa

`Scripts/Common/Probe.cs` — chiều cao probe **suy ra từ collider**, lùi vào mỗi đầu 0.25:

```csharp
var height = Mathf.Max(0.1f, b.size.y - margin * 2f);
```

Cả ba loại địch dùng chung. Không còn con số nào phải "nhớ giữ cho nhỏ hơn collider".

Đo lại: boss lao qua lại giữa **x 53.06 và x 61.12**, đúng hai vách đấu trường.

## Lỗi 7 — Thanh máu boss dùng `Image.Type.Filled`, 9-slice bị bỏ qua

`Image.Type.Filled` **không đọc `spriteBorder`**. Nó kéo giãn cả texture theo `fillAmount`, nên cái plate pixel 17 × 17 có viền 6 px ra thành một vệt đỏ nhoè, góc mềm, mất hẳn đường viền tối và pixel highlight mà tác giả vẽ.

Đây là cái bẫy dễ dính nhất của uGUI: `Sliced` và `Filled` là hai giá trị của **cùng một enum**, chọn `Filled` là tự động mất `Sliced`.

### Sửa

Dùng `Slider` thay vì `fillAmount`. Slider đổi **chiều rộng của `fillRect`**, mà một `Image` để `Type.Sliced` thì cắt lại ở bất kỳ chiều rộng nào — bốn góc giữ nguyên 6 px, chỉ phần giữa lặp.

```
BossBar            ← BossHealthBar, luôn bật (bài học lỗi thanh máu tự tắt)
└── Body           ← Slider + Image nền (Sliced), đây là phần ẩn/hiện
    └── Fill Area  ← thụt vào 3 px cho khớp khung
        └── Fill   ← Image (Sliced) ← slider kéo anchorMax.x của cái này
```

| Slider | Giá trị |
|---|---|
| direction | LeftToRight |
| min / max | 0 / 1 |
| handleRect | null |
| interactable | **false** (đây là chỗ hiển thị, không phải chỗ bấm) |
| transition | None |

Đo trong Play, boss 3 máu:

| HP | slider.value | `fillRect` rộng | Góc phải |
|---|---|---|---|
| 3/3 | 1.00 | 194.0 px | nguyên |
| 2/3 | 0.667 | 129.3 px | nguyên |
| 1/3 | 0.333 | 64.7 px | nguyên |
| ~0.04 (lướt qua lúc rút) | 0.04 | **7.8 px** | co lại nhưng vẫn đọc được viền |

Trường hợp cuối là lúc chiều rộng nhỏ hơn tổng viền (6 + 6 = 12 px). Unity nén hai góc theo tỉ lệ; nhìn vẫn ra hình, và nó chỉ xuất hiện trong một phần giây lúc thanh rút về 0.

Quét lại toàn bộ prefab và scene: **không còn `Image` nào ở `Type.Filled`**.

→ Bài nên đặt cạnh nhau hai ảnh phóng to: vệt nhoè của `Filled` và góc sắc của `Slider` + `Sliced`. Quy tắc rút ra: **thanh nào có khung vẽ sẵn thì đừng dùng `fillAmount`** — `fillAmount` chỉ hợp với hình đặc, không viền (vòng cooldown, mask tròn).

## Số đã chốt

| Thông số | Giá trị |
|---|---|
| Pivot đơn vị đi đất | (0.5, 0) |
| Pivot Brute | (**0.6736**, 0) — tâm thân, không phải tâm ô |
| Collider player | 1.20 × 1.70, offset (0, 0.85) |
| Collider jumper/charger/cannon | 1.60 × 1.70, offset (0, 0.85) |
| Collider boss | 1.70 × 1.60, offset (0, 0.80) |
| Collider flyer | 1.60 × 1.40, offset (0, **0.375**) — thân nằm lệch lên trong ô |
| Bán kính gem | 0.80 → **0.60** (hình chỉ rộng 0.875) |
| Mặt trên vách ngăn | y = 6 |
| `Probe.margin` | 0.25 |
| Thanh máu boss | `Slider` + `Image.Type.Sliced`, **không** dùng `fillAmount` |
| Fill Area thụt vào | 3 px mỗi bên |
| PPC | snap on, crop cả hai chiều, stretch off |

## Kết quả soát cuối

Quét lại 153 sprite trong 18 scene:

```
CLEAN across all 18 scenes
```

Không còn: sprite lệch PPU, hình lệch collider, object lún sàn, object nằm trong gạch, gem trong tường, hay gameplay object còn kẹt ở sorting layer Default.

## Ảnh cần chụp

- [x] `15_after_pivot_fix.png` — địch và người đứng đúng mặt cỏ
- [ ] Ảnh đối chiếu trước/sau: chân địch lún 8 px vs đứng đúng
- [ ] Sprite Editor của Brute: pivot ở tâm thân, không phải tâm ô 72 px
- [ ] Gizmo collider boss cũ (2.6 lệch trái) vs mới (1.7 ôm thân)
- [ ] Bản đồ tile trước/sau khi cắt vách, đánh dấu cửa thoát
- [ ] Trình duyệt: trước không viền và thấy rộng, sau có viền và đúng 32×18
- [ ] Gizmo `Probe` của boss: hộp cũ thò xuống dưới sàn
- [x] `15_bar_slider_2of3.png`, `15_bar_slider_1of3.png`, `15_bar_slider_sliver.png` — góc 9-slice còn nguyên ở mọi mức máu
- [ ] Ảnh đối chiếu thanh máu: `Filled` nhoè vs `Slider` + `Sliced` sắc

## Ghi cho người viết bài

**Đây nên là bài riêng, và là bài đắt nhất series.** Sáu lỗi, không lỗi nào làm game crash, không lỗi nào hiện trong Console. Game vẫn chạy, vẫn build, vẫn quay video được. Đúng kiểu lỗi mà người tự học sẽ mang theo suốt.

**Mở bài bằng `gapBottom = 0`.** Một dòng Python đọc alpha trả lời được câu "pack này muốn pivot ở đâu". Đa số hướng dẫn bảo "để pivot Bottom cho platformer" mà không nói vì sao; ở đây có bằng chứng từ chính bộ art.

**Ô sprite không phải nhân vật.** Brute là ví dụ đẹp nhất: ô 72 px nhưng thân 27 px nằm lệch phải, phần trống bên trái dành cho tầm vung. Ai đặt collider theo ô sẽ sai 0.78 u mà không hiểu vì sao đánh nhau thấy "sai sai".

**Mục đấu trường bịt kín nên viết thẳng thắn.** Mình test suốt 14 chặng bằng cách gọi hàm, nên chưa bao giờ đi bộ tới cửa thoát. Bài học: **test bằng đường người chơi đi, không phải bằng API**. Một lần `MotionRecorder` chạy từ x=45.5 là lộ ngay.

**Lỗi 6 là hệ quả của việc sửa lỗi 2** — nên kể liền mạch: thu collider cho đúng hình thì làm hỏng một probe vốn đã sai từ đầu nhưng còn may. Kết luận đáng dạy: **đừng gõ tay kích thước phải phụ thuộc kích thước khác**, suy ra nó.

**Lỗi 7 là mục ngắn nhưng đắt.** Một dòng enum chọn sai làm hỏng cả mảng pixel art. Và nó dạy được đúng ranh giới: `fillAmount` dành cho hình đặc không viền; thanh có khung thì phải đổi kích thước thật, tức là `Slider` (hoặc tự set `sizeDelta`) cộng `Type.Sliced`.

**Mục PixelPerfectCamera nên có bảng hai cột Editor/Browser.** Trong Editor mọi thứ đúng vì cửa sổ tình cờ là bội số chẵn. Đó là lý do phải test trên build thật, không phải trên Game view.

**Kết bài bằng đúng chữ `CLEAN across all 18 scenes`** và script soát. Cái đáng mang về không phải sáu bản vá, mà là **bộ script đo** — nó chạy lại được bất cứ lúc nào.

## Ảnh hưởng tới các bài trước

- Bài 10, 11, 12: mọi ảnh chụp có địch đều đang lún chân — **chụp lại**
- Bài 12: số collider boss (2.6 × 2.6) đã sai — sửa thành 1.7 × 1.6
- Bài 14: khung nhìn WebGL trong bài ghi 32×18, trước khi sửa thì không đúng
- Bài 05: `shakeMargin` vẫn đúng, nhưng giờ mới thật sự được đo ở khung 32×18 cố định
