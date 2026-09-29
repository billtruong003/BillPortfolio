# 16 — Chơi thử thật: sáu lỗi không lỗi nào hiện ra trong Console

Ngày dựng: 2026-09-20 · toàn bộ 18 scene

## Mục tiêu

Chặng 15 kết thúc bằng dòng `CLEAN across all 18 scenes`. Rồi có người mở game lên chơi và báo: thùng với checkpoint hỏng logic, nhặt ngọc thì được nhưng **không có cách nào thắng để đi tiếp**.

Họ đúng. Chặng 15 soát *hình học* — pivot, collider, vị trí, sorting layer — và kết luận sạch. Nó không soát **luật chơi**, và cũng chưa một lần đi bộ từ chỗ spawn tới cửa thoát.

## Cách soát lần này

Viết `Scripts/Debug/Playtest.cs`: lái người chơi bằng **input thật** theo từng đoạn, và ghi lại mọi thứ căn phòng phát ra — ngọc, checkpoint, thùng vỡ, chết (kèm lý do), cửa thoát.

Trước đây mọi bài test đều gọi `room.Complete()` hoặc `gem.Take()` thẳng tay. Game chỉ từng được chứng minh qua **API của nó**, chưa bao giờ qua **đường người chơi đi**.

Lần chạy đầu tiên, đi bộ từ spawn sang phải:

```
[0.00s @(6.0,2.0)] begin at (6.00, 2.00)
[1.62s @(20.0,2.0)] step 0 done (move 1)
[2.84s @(29.4,2.0)] step 1 done (move 1)
```

Nhân vật đi từ x=6 tới x=29.4. Trên đường có Checkpoint_1 ở x=12 và hai thùng ở x=20, x=28. **Không một dòng log nào.** Đi xuyên qua cả ba.

## Lỗi 1 — `Player × Default` bị tắt trong bảng va chạm, mà thùng, checkpoint và cửa thoát đều nằm ở `Default`

```
Player x Default:       IGNORED      <- thừa từ series shmup
Player x Pickup:        collide
Player x Ground:        collide
Player x Enemy:         collide
Player x Hazard:        collide
```

| Object | Layer lúc đó | Kết quả |
|---|---|---|
| Gem | Pickup | nhặt được ✓ |
| Trap | Hazard | chết được ✓ |
| Địch | Enemy | đụng được ✓ |
| **Box** | **Default** | đi xuyên, không bao giờ vỡ |
| **Checkpoint** | **Default** | không bao giờ kích hoạt |
| **LevelExit** | **Default** | **không bao giờ thắng** |

Đúng ba thứ người chơi báo, và cùng một nguyên nhân.

Cay hơn nữa: chính chặng 15 là lúc mình đi gán layer cho gem, địch, bẫy — rồi **để nguyên** box, checkpoint, exit ở `Default`, và tuyên bố sạch. Cái bảng va chạm không nằm trong danh sách soát.

### Sửa

| Object | Layer mới | Vì sao |
|---|---|---|
| BreakableBox | **Ground** | thùng *là* mặt đất: đứng lên được, địch quay đầu ở đó, người chơi phải đụng mới giẫm được |
| Checkpoint | **Interactable** (layer 12, thêm mới) | trigger người chơi phải chạm |
| LevelExit | **Interactable** | như trên |

Thêm layer thì nhớ bài học chặng 11: **kiểm tra tên đã tồn tại chưa trước khi tạo**.

Và viết `Scripts/Debug/ReachAudit.cs` — với mỗi object người chơi phải chạm, hỏi thẳng bảng va chạm xem có chạm được không:

```
Box_1        layer=Ground       ok
Checkpoint_1 layer=Interactable ok
LevelExit    layer=Interactable ok
OK - every interactive object is reachable by the player
```

→ **Bảng va chạm là luật chơi, nên nó đáng được test.** Một layer sai không gây lỗi, không ghi log, chỉ làm cả màn chơi không thể hoàn thành.

## Lỗi 2 — `respawnOffset` cũ còn nằm trong scene

Chặng 15 đổi pivot về chân và đổi giá trị **mặc định** của `Checkpoint.respawnOffset` thành 0. Nhưng mặc định chỉ áp dụng cho object **mới**; scene giữ nguyên thứ đã serialize.

```
checkpoint: Checkpoint_1 respawn=(12.00, 2.55)   <- lệch 0.55 u
```

Sửa: quét mọi scene, ghi đè về `(0,0)`. Giờ ra `respawn=(12.00, 2.00)`.

→ Đây là bẫy chung của Unity: **đổi giá trị mặc định của một field không sửa được dữ liệu đã lưu.** Phải đi sửa từng scene, hoặc viết migration.

## Lỗi 3 — Gem_2 nằm chồng lên Trap_B

Ngọc ở (24, 13.5), bẫy gai ở (24.5, 12) trên cùng mặt bệ. Người chơi đứng lên bệ để với ngọc thì collider chạm gai. **Muốn lấy ngọc đó phải chết.**

Sửa: dời ngọc sang x=27, bên kia bẫy. Giờ bẫy thành chướng ngại phải nhảy qua, không phải thuế phải trả.

## Lỗi 4 — Giẫm trúng boss xong thì chết vì chính cú giẫm đó

Thả người chơi xuống đầu boss đúng lúc nó đang hở. Log tại thời điểm chạm:

```
state=Recover vulnerable=True  playerBottom=3.612 bossTop=3.600 isStomp=True   <- ăn đòn
state=Hurt    vulnerable=False playerBottom=3.615 bossTop=3.600 isStomp=True   <- chạm lại
```

Trúng đòn xong boss vào `Hurt`. `Hurt` không phải `Recover` nên `Vulnerable = false`, mà người chơi vẫn đang đứng trên đầu nó ⇒ lần chạm thứ hai rơi vào nhánh `else` ⇒ `life.Kill()`.

Nói cách khác: **đánh trúng thì bị phạt.** Máu boss vẫn 3, người chơi chết.

### Sửa

Tách "hở để bị đánh" khỏi "đủ nguy hiểm để giết":

```csharp
public bool Vulnerable => Current == State.Recover;
public bool Dangerous  => Current == State.Idle || Current == State.Telegraph || Current == State.Charge;
```

Chỉ `Dangerous` mới giết. Recover, Hurt và Dead đều vô hại — vốn dĩ đó là ý nghĩa của trận đấu.

Đo lại, giẫm ba lần bằng di chuyển thật:

| | HP | Thanh máu | Số lần chết |
|---|---|---|---|
| Giẫm 1 | 3 → 2 | 1.00 → 0.667 | 0 |
| Giẫm 2 | 2 → 1 | → 0.333 | 0 |
| Giẫm 3 | 1 → 0, `Dead` | → 0 | 0 |

→ **Quy tắc đáng dạy: một cú đánh trúng không bao giờ được phạt người đánh.** Và dạng bug này chỉ lộ ở địch *sống sót* sau đòn — jumper, charger, thùng đều chết ngay nên collider tắt, không có lần chạm thứ hai.

## Lỗi 5 — Hồi sinh ngay vào đường tuần của địch

Checkpoint_2 ở x=38, nằm giữa đoạn sàn mà cả Jumper2 lẫn Charger đi qua:

```
[0.02s] checkpoint: Checkpoint_2 respawn=(38.00, 2.00)
[0.02s] DIED: Enemy_Jumper2_A
[1.74s] DIED: Enemy_Jumper2_A
[2.56s] DIED: Charger
```

Chết → hồi sinh đúng chỗ đó → địch vẫn đứng đấy → chết tiếp. Vòng lặp.

### Sửa, hai lớp

1. **Bất tử ngắn sau hồi sinh** — `respawnGrace = 1.2 s`. Bài 11 đã ghi là "chưa làm", giờ gắn vào cuối `DeathRoutine`. 1.2 s ở tốc độ 9 u/s là đủ chạy ra xa 10 u.
2. **Dời Checkpoint_2** sang x=22 — đoạn sàn duy nhất không có địch nào đi qua. Thử x=29 trước, vẫn nằm dưới tầm lượn của flyer (tâm x=30, biên ±5).

Đo lại: đứng yên tại checkpoint 6 giây, **0 lần chết**.

Và thêm một phép soát: checkpoint nào cách địch dưới 7 u **và cùng cao độ** (chênh dưới 2.5 u) thì báo lỗi. Chỉ so trục X thôi thì ra toàn dương tính giả — jumper đứng trên bệ cao 5 u không với tới checkpoint dưới sàn.

## Lỗi 6 — Thùng không chạm đất, lệch đúng 5 pixel

Người chơi nhìn ra trước cả máy: thùng lơ lửng.

Ô sprite thùng là 32 × 32, nhưng hình vẽ chỉ 22 × 22 px **nằm giữa ô**, chừa 5 px trống ở đáy:

| File | Hình vẽ trong ô | gapBottom |
|---|---|---|
| `1_Idle.png` | x[5..27) y[5..27) | **5 px** |
| `1_Break.png` | x[5..27) y[5..27) | 5 px |
| `1_Hit.png` f0..f2 | y[8..24) → y[6..26) | 8 → 6 px (ép dẹp đối xứng) |

Để pivot Center, đặt thùng ở y=3 thì ô sprite trải 2.00..4.00, còn **hình** thật trải 2.3125..3.6875. Sàn ở y=2.00 ⇒ thùng treo **0.3125 u = 5 px**.

Collider thì ngược lại: 2.0 × 2.0 bằng cả ô, trong khi thùng chỉ 1.375 × 1.375. Thừa 5 px mỗi bên.

Chặng 15 không bắt được vì nó soát theo **ô sprite**, và vì danh sách "đơn vị đứng đất" tôi gõ tay không có thùng trong đó.

### Sửa

Pivot về **đáy của hình vẽ**, không phải đáy ô: `(0.5, 5/32) = (0.5, 0.15625)`. Rồi `transform.y` là mặt đáy thùng như mọi object khác. Collider `1.375 × 1.375`, offset `(0, 0.6875)`.

### Và một công cụ để không dính lần ba

`tools/art_vs_collider.py` — đọc **alpha thật** của từng sprite trong rect của nó, đổi ra toạ độ thế giới, so với collider. Phải chạy lúc **Play mode**, vì collider của charger, cannon và boss chỉ được gán trong `Awake` — số ở edit mode là số cũ, vô nghĩa.

Kết quả sau khi sửa:

| Object | đáy hình | đáy collider | lệch |
|---|---|---|---|
| Box_1, Box_2 | 2.000 | 2.000 | **0.000** |
| Player | 2.015 | 2.015 | 0.000 |
| Jumper1/2, Charger, Cannon | khớp sàn | khớp sàn | 0.000 |
| Boss_Brute | 2.000 | 2.000 | 0.000 |
| Trap_A, Trap_B | 2.000 / 12.000 | +0.05 | 0.050 |
| Gem (5 viên) | — | — | −0.16..−0.22 *(cố ý: vùng nhặt rộng hơn hình)* |
| Checkpoint | 2.000 | 2.200 | +0.20 *(cố ý: trigger thụt lên khỏi chân cột)* |
| Flyer | 8.339 | 8.639 | +0.30 *(cố ý: gai treo lủng lẳng không tính là hitbox)* |

→ **Ô sprite không phải nhân vật.** Lần một là boss (thân lệch phải trong ô 72 px, chặng 15). Lần hai là thùng (hình nằm giữa ô 32 px). Cùng một sai lầm: tin vào kích thước ô thay vì đọc hình.

## Số đã chốt

| Thông số | Giá trị |
|---|---|
| Layer `Interactable` | 12 (thêm mới) |
| BreakableBox | layer `Ground` |
| Checkpoint, LevelExit | layer `Interactable` |
| `Checkpoint.respawnOffset` | (0, 0) ở mọi scene |
| `PlayerLife.respawnGrace` | **1.2 s** |
| Checkpoint_2 | x 38 → **22** |
| Gem_2 | x 24 → **27** |
| Boss chỉ giết khi | `Idle`, `Telegraph`, `Charge` |
| Pivot thùng | (0.5, **5/32**) — đáy hình vẽ, không phải đáy ô |
| Collider thùng | 1.375 × 1.375, offset (0, 0.6875) |

## Chạy thông cả màn

Từ chỗ spawn tới cửa thoát, toàn bộ bằng input:

```
[0.78s @(10.9,7.1)] gem 1/5          <- nhảy lên bệ 1 từ mép trái
[1.36s @(25.9,12.1)] gem 2/5         <- bệ 1 -> bệ 2
[1.38s @(38.0,18.9)] gem 3/5         <- bệ 2 -> bệ 3, cần nhảy đôi
[0.14s @(30.0,3.5)] gem 4/5          <- trên khối đá giữa sàn
[3.22s @(57.0,5.9)] gem 5/5
[3.22s] ALL GEMS - exit should open
[3.30s] ROOM COMPLETE
[3.30s] EXIT ENTERED
```

`finished=True`, bảng qua màn hiện, `cleared[0]=True`. Bấm **Màn tiếp** → `PLT_14_Level2` nạp, người chơi đứng đúng mặt đất, HUD `0/5`.

Chết và hồi sinh: chạm Trap_A ở x=43.0, hồi sinh đúng (12.00, 2.00), đứng đúng y=2.02.

Giẫm địch: jumper chết ✓, flyer chết ✓, người chơi sống ✓.

## Vấp khi test (không phải lỗi game)

**Nhảy đôi không kích hoạt vì giữ nút liền mạch.** Hai đoạn test liền nhau đều "giữ nhảy", nên không có cạnh nhấn mới — motor không thấy cú nhấn thứ hai. Phải thả ra giữa hai lần.

Cùng họ với chuyện ở chặng 14: gửi 25 lần nhấn `D` thật nhanh trong trình duyệt thì nhân vật đứng im, vì mỗi lần nhấn-nhả gọn trong khoảng giữa hai frame. **Input là cạnh và là trạng thái, không phải sự kiện rời rạc** — test tự động phải tôn trọng điều đó.

## Ảnh cần chụp

- [ ] Bảng Physics2D matrix, khoanh ô `Player × Default` đang tắt
- [ ] Trước/sau: nhân vật đi xuyên thùng vs bị thùng chặn
- [ ] Cờ checkpoint dựng lên trong build web
- [ ] Log `[BossTouch]` hai dòng Recover/Hurt cạnh nhau
- [ ] Gem_2 chồng lên bẫy gai (trước) và dời sang bên kia (sau)
- [ ] Vòng lặp chết ở Checkpoint_2 cũ
- [ ] Thùng phóng to: trước lơ lửng 5 px, sau nằm sát cỏ
- [ ] Sprite Editor của thùng: pivot ở đáy **hình**, không phải đáy ô

## Ghi cho người viết bài

**Mở bài bằng chính câu kết của bài 15.** `CLEAN across all 18 scenes` — rồi người chơi đầu tiên mở lên và không thắng nổi. Đó là cú twist đắt nhất của cả series, và nó dạy một điều mà không bài tutorial nào nói: **test của bạn chỉ chứng minh được cái mà nó có đo**. Bài 15 đo hình học và đúng về hình học. Nó không đo luật chơi.

**Câu chốt: đừng test game bằng API của nó.** `room.Complete()` chạy ngon suốt 15 chặng trong khi cửa thoát thật sự không bao giờ chạm được. Một công cụ lái input thật, chạy một lần, lộ ra ba lỗi trong sáu giây.

**Bảng va chạm nên có một mục riêng trong bài.** Nó là dữ liệu cấu hình nằm ngoài code, ngoài scene, ngoài prefab — nên nó không xuất hiện trong bất kỳ lần review code nào. Và nó im lặng tuyệt đối khi sai.

**Lỗi 4 gom với lỗi "thanh máu tự tắt chính mình" của bài 14** thành một cặp về **trạng thái**: một cái tắt đi rồi không nghe được nữa, một cái đổi trạng thái rồi quay ra giết người vừa đánh nó. Cả hai đều là "quên mất rằng thứ này còn đang chạm vào thứ kia".

**Lỗi 5 nên nói thẳng là lỗi thiết kế, không phải lỗi code.** Code chạy đúng y như viết. Cái sai là đặt checkpoint giữa đường tuần của địch. Bài nên dạy hai cách chữa và vì sao cần cả hai: bất tử ngắn chữa triệu chứng ở mọi nơi, dời checkpoint chữa nguyên nhân ở chỗ này.

**Lỗi 6 đáng đứng cạnh lỗi collider boss của bài 15** thành một cặp: cả hai đều vì tin vào ô sprite thay vì hình vẽ trong ô. Và cả hai đều do **người nhìn** phát hiện trước công cụ — nên bài nên nói thẳng rằng script đo chỉ bắt được thứ bạn nghĩ ra để đo.

**Kết bài bằng ba công cụ**, không phải sáu bản vá: `Playtest`, `ReachAudit` và `art_vs_collider.py`. Bản vá hết hạn, công cụ thì chạy lại được mỗi lần đụng vào level.

## Đính chính (2026-09-29, lúc viết bài 16)

- `tools/art_vs_collider.py` viết lại thành C# chạy trong Unity: `Scripts/Debug/ArtAudit.cs` (đọc PNG bằng `LoadImage`, so đáy hình với đáy collider và tâm ngang, chạy Play mode). Level3: 9 dòng đánh dấu, đều cố ý (5 ngọc, 2 cờ, flyer, cannon lệch 0.125 vì nòng). Tái hiện lỗi cũ: Box_1 dy −0.313, Boss dx −0.780.
- ReachAudit Level3: OK; tạm đưa thùng/cờ/cửa về Default → 5 UNREACHABLE.
- Playtest Level1 (nhân vật Cân bằng, 5 đoạn): gem 1 @1.06 s, gem 2 @0.84, gem 3 @1.14 (nhảy đôi), gem 4 @0.70, gem 5 + ALL GEMS @0.78, ROOM COMPLETE + EXIT @1.00, 0 chết, `cleared0=True`. Tái hiện lỗi layer: đi 6 → 29.4 trong 2.94 s không một sự kiện, đúng log gốc.
- Viết lại series tìm thêm 7 lỗi im lặng (charger bay qua mép, muzzle, flyer dive, cờ boss không ai đọc, SpriteFlash trắng, GraceUntil không ai đọc, thứ tự ParallaxLayer). Chi tiết ở đính chính journal 11, 12, 13, 17.
