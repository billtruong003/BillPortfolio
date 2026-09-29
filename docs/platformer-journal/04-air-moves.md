# 04 — Double jump và wall jump

Ngày dựng: 2026-09-19 · Scene `PLT_04_AirMoves`

## Mục tiêu

Hai move mà pack vẽ sẵn animation: nhảy lần hai trên không, và bám tường – bật tường. Wall jump phải có khoá hướng, không thì giữ phím về phía tường là dính lại ngay.

## Đã dựng

- `PlayerMotor.cs` bản 04 → `Journal/04_PlayerMotor.cs.txt`. Thêm: `maxJumps`, `airJumpHeightScale`, dò tường hai bên bằng OverlapBox, `IsWallSliding`, `WallSign`, wall coyote, wall jump có `wallJumpLock`, enum `LastJump` (Ground/Air/Wall) để recorder biết loại nhảy vừa xảy ra.
- Scene `PLT_04_AirMoves` = scene 03, không thêm object. Khe x 48–49 / 54–55 (rộng 4 unit, cao 2–22) từ bài 01 là sân thử.

Thứ tự ưu tiên khi có lệnh nhảy trong buffer:

```
coyote còn (vừa rời đất)     → Ground jump, JumpsThisAirtime = 1
wall coyote còn (vừa rời tường) → Wall jump, đẩy ra xa tường, khoá input 0.15 s, JumpsThisAirtime = 1
JumpsThisAirtime < maxJumps  → Air jump, JumpsThisAirtime++
```

Wall jump đặt `JumpsThisAirtime = 1` chứ không cộng dồn: bật tường xong vẫn còn một cú double jump. Đây là quyết định thiết kế — khe leo được bằng chuỗi wall jump + double jump khi cần.

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| maxJumps | 2 | Một double jump |
| airJumpHeightScale | 0.85 | Cú thứ hai thấp hơn cú đầu một chút |
| AirJumpVelocity | √(2·g·h·0.85) = **25.35** | |
| wallSlideSpeed | 4 u/s | Rơi dọc tường chậm hơn 8× so với maxFall 32 |
| wallJumpHeightScale | 0.9 | WallJumpVelocity = **26.09** |
| wallJumpPush | 10 u/s | Ngang, > moveSpeed 9 để thắng được air control |
| wallJumpLock | 0.15 s | Xem test G |
| wallCoyoteTime | 0.10 s | Rời tường rồi bấm vẫn được |
| wallBoxSize | 0.1 × 1.2 | Mỏng, thấp hơn collider (1.7) để không bắt tường khi đứng trên mép |

## Kết quả đo

| Test | Kịch bản | Đo được |
|---|---|---|
| **E** double jump | nhảy đất giữ 0.3 s, bấm lần hai ở 0.50 s | Cú hai bắn ở 0.54 từ y=8.26, vy 24.0 (= 25.35 − 1 step g). Đỉnh 12.10, **tổng 9.08 u** từ sàn. `LastJump = Air` |
| **F** wall slide | ép vào tường phải, rơi từ y=15 | vy = **−4.00 đúng** suốt 78 mẫu, x ghim 53.385 |
| **G** wall jump + lock | giữ phải suốt, nhảy đất → bám tường → bấm lần hai | Wall jump ở 0.64 từ y=7.91: **vx = −10.00** giữ đúng **0.15 s** dù đang giữ phím phải; sau đó air control kéo về +9, đổi dấu ở 0.98. Lên tới 11.96. Rơi lại, bám, trượt −4, chạm đất. `LastJump = Wall` |

Trong G, khoảng "văng khỏi tường" đo được 0.34 s = 0.15 lock + 0.17 accel với airControl (9 / (75 × 0.7)). Khớp công thức.

## Vấp

### 1. Không có gì vấp về hành vi — nhưng có một bẫy thiết kế

Bản đầu định để wall jump **cộng** `JumpsThisAirtime++`. Chạy thử trong đầu: bật tường lần một (=1), rơi, bật tường lần hai (=2), hết air jump — người chơi leo khe bằng wall jump thì không bao giờ được double jump. Đổi thành gán = 1. Khe leo được vô hạn bằng wall jump, và còn một double jump dự phòng.

→ Bài cần nói rõ bảng quyết định này. Nó là chỗ mỗi game chọn khác nhau (Celeste không có double jump; Hollow Knight wall jump không tốn gì).

### 2. Wall probe phải thấp hơn collider

Probe cao bằng collider (1.7) thì đứng trên mép bệ, probe chạm mép tile ngay dưới chân ⇒ `WallSign ≠ 0` ⇒ vừa rời mép là "bám tường" và rơi chậm −4 thay vì rơi thường. Đặt 1.2 (ngắn hơn 0.5, tức 0.25 mỗi đầu) thì hết.

Chưa đo trực tiếp lần này nhưng logic rõ; ghi để bài có gizmo minh hoạ.

### 3. Jump cut cũng áp cho air jump và wall jump

Test E cú hai giữ 0.3 s rồi nhả ở 0.80 khi vy = 6.1 → cut → thấp hơn 0.85 × 5.5. Đúng ý: variable height cho mọi loại nhảy. `Consume()` reset `jumpCutDone` mỗi lần nhảy nên cú sau vẫn cut được.

### 4. Ép vào tường lúc bay lên không phải wall slide

`IsWallSliding` chỉ true khi `v.y ≤ 0`. Đang bay lên mà chạm tường thì vẫn bay lên bình thường (friction 0), chỉ khi bắt đầu rơi mới kẹp −4. Trong G thấy rõ: 0.18–0.42 bay lên dọc tường vy dương, 0.54 mới −4.

## Ảnh cần chụp

- [x] `04_shaft_wallslide.png` — Game view khe, camera đã dời sang (48, 9)
- [ ] Scene view: gizmo hai wall probe (magenta khi chạm) so với collider
- [ ] Bảng quyết định ba loại nhảy — vẽ sơ đồ
- [ ] Đồ thị x(t) và vx(t) của test G: thấy vx = −10 phẳng 0.15 s rồi cong về +9
- [ ] Đồ thị y(t) test E: hai đỉnh
- [ ] Inspector nhóm Air jumps + Wall

## Ghi cho người viết bài

**Wall jump lock là thứ người đọc sẽ tự bỏ đi vì "thừa".** Bài nên cho họ thử với lock = 0 trước: giữ phím về tường, bấm nhảy — nhân vật văng ra 1 frame rồi dính lại ngay, không lên được. Rồi mới thêm lock. Con số 0.15 s là thứ chỉnh cảm giác, không phải hằng số.

**Bảng ưu tiên ba loại nhảy là xương sống bài.** Cùng một phím, ba kết quả, và thứ tự kiểm tra quyết định game feel: coyote trước wall trước air. Đảo thứ tự (air trước wall) thì đứng cạnh tường bấm nhảy sẽ tốn double jump thay vì bật tường.

**Wall jump "trả lại" double jump — nói rõ đó là lựa chọn.** Không có đúng sai, có game làm ngược. Người đọc nên biết mình đang chọn.

**Trục Y của camera bài 05 sẽ dựa vào `IsGrounded` và `IsWallSliding`.** Ghi trước: khi bám tường cũng nên cho camera theo Y (đang trượt chậm, nhìn thấy đường xuống quan trọng).

## Chưa làm, để chặng sau

- Animation Wall_Jump / Double_Jump / Fall → 06
- `canWallJump` / `maxJumps` sẽ đi vào `PlayerData` → 07 (đây là hai field phân biệt ba nhân vật)
- Camera → 05

## Đính chính (2026-09-28, đo lại cho bài 04)

Đo bằng đúng code bài 04 (`Assets/_TutorialStages/Stage04`), bơm input ở đầu mỗi bước vật lý:

| Test | Kết quả |
|---|---|
| Double jump, cú hai bấm ở đỉnh cú đầu | tổng **9.63 u** (5.225 + 4.41). Thấp hơn bệ 2 (10 so với sàn) ⇒ bảng bài 01 ghi "bệ 2 dùng double jump" là sai, đã sửa: bệ 2 lên bằng nhảy thường từ bệ 1 |
| Trượt tường | vy = −4.00 suốt 127 bước, x = 53.385 |
| Wall jump khoá 0.15 | vx = −10 trong **8 bước**, ra xa tường 2.46 u (vách trái ở 2.77) |
| Wall jump không khoá | chỉ ra 1.06 u, quay lại dính tường sau 0.4 s (không phải "1 frame") |
| Hộp dò tường 1.7 | ngay bước rời mép phải bệ 1 báo wall = −1 một bước; bấm sớm thì coyote đất thắng, bấm muộn thì wall coyote đã hết ⇒ không lộ lỗi trong kịch bản này |
| Hộp dò tường 1.2 | không có tín hiệu giả |

Vấp 2 gốc ("rời mép là trượt −4") sai: trượt cần đẩy phím về phía tường. Hậu quả thật chỉ là tín hiệu tường giả một bước.

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/04/`.
