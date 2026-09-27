# 02 — Chạy: Rigidbody Dynamic và velocity

Ngày dựng: 2026-09-19 · Scene `PLT_02_Run`

## Mục tiêu

Nhân vật chạy trái phải bằng WASD / mũi tên / stick, có quán tính đo được, đứng vững trên sàn của bài 01.

## Đã dựng

- `Assets/_Platformer/Scripts/Platformer.asmdef` — reference `Unity.InputSystem`, `BillLab.Common`, `UnityEngine.UI`, `Unity.TextMeshPro` (y hệt shmup)
- `Assets/_Platformer/Input/PlatformerControls.inputactions` — map `Gameplay`: `Move` (Vector2: WASD, mũi tên, leftStick, dpad), `Jump` (Button: Space, buttonSouth). Jump khai báo sẵn, bài 03 mới đọc.
- `Scripts/Player/PlayerMotor.cs` — bản chặng 02, chỉ có chạy. Snapshot: `Journal/02_PlayerMotor.cs`
- `Scripts/Debug/MotionRecorder.cs` — **tool đo, không phải gameplay.** Ghi (t, x, y, vx, vy, grounded) mỗi FixedUpdate, tự bấm/nhả phím theo lịch. Dùng lại cho bài 03–04 để đo độ cao nhảy, coyote.
- Layer `Ground` (11) gán cho `Tilemap_Ground`; layer `Player` (12)
- `Art/PM_NoFriction.physicsMaterial2D` — friction 0, bounciness 0, gán cho Player
- Object `Player` tại (5, 3.2): SpriteRenderer `Idle_0`, Rigidbody2D **Dynamic** gravityScale 4, freezeRotation, Continuous, Interpolate; BoxCollider2D size (1.2, 1.7) offset (0, −0.15); `PlayerMotor` nối `PlatformerControls`, groundMask = Ground

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| moveSpeed | 9 u/s | Phòng rộng 64, băng qua ≈ 7 s. Cảm giác nhanh nhưng kiểm soát được |
| accelTime | 0.12 s | Từ đứng tới top speed |
| decelTime | 0.08 s | Từ top speed tới dừng. Ngắn hơn accel để nhả phím là dừng "gắt" |
| Collider | 1.2 × 1.7, offset y −0.15 | Đo từ bbox alpha: thân nhìn thấy 1.44 × 1.75 u, chân chạm đáy ô 32px ⇒ đáy collider ở −1.0 |
| Ground probe | 1.0 × 0.1, cách đáy 0.05 | Hẹp hơn collider để đứng mép không bị coi là trên không quá sớm |
| gravityScale | 4 (tạm) | Bài 03 sẽ suy từ jumpHeight + timeToApex, không giữ số này |

**Đo bằng MotionRecorder** (giữ D 1.0 s rồi nhả):

| Đại lượng | Đo được | Lý thuyết |
|---|---|---|
| Top speed | 9.00 | 9 |
| Thời gian đạt 99% | 0.12 s sau khi input tới | accelTime 0.12 |
| Quãng tăng tốc | 0.45 u | v²/2a = 81/150 = 0.54 |
| Thời gian dừng | **0.08 s** | decelTime 0.08 |
| Quãng trượt sau nhả | 0.45 u | 81/225 = 0.36 |
| grounded suốt quá trình | 100% mẫu | — |

Lệch giữa đo và lý thuyết ≈ 1 fixed step (0.02 s × 9 u/s = 0.18 u): mẫu ghi ở đầu step, chưa cộng bước đó. Chấp nhận được, và **đây là con số đặt vào bài** — "nhả phím trượt thêm chưa tới nửa tile".

## Vấp

### 1. Bậc 1 tile chặn đứng nhân vật

Giữ D, nhân vật chạy tới x = 29.38 rồi `vx = 0`, `MoveInput` vẫn = 1. Nhìn map: bậc thang `block(30,2,31,2)` cao đúng 1 tile bắt đầu ở x = 30. Collider rộng 1.2 nên mép phải chạm tường bậc ở 29.98.

Rigidbody Dynamic không tự bước lên. Đây là hành vi đúng: bậc 1 tile **phải nhảy**. Nhiều platformer thêm "step-up" tự động cho bậc ≤ 0.5 tile; game này không cần, vì tile là 1 unit tròn.

→ Ghi vào bài như một quan sát có chủ đích: người đọc chạy vào bậc và dừng lại là bình thường, bài 03 giải quyết.

### 2. Input giả lập từ FixedUpdate trễ ~0.3 s

Recorder queue `KeyboardState` trong `FixedUpdate` rồi gọi `InputSystem.Update()`. Mẫu cho thấy `vx` bắt đầu tăng ở t = 0.30 chứ không phải t = 0.02. Update mode của project là `ProcessEventsInDynamicUpdate`, Game view lúc đo **không focus** (`Application.isFocused = false`).

Không phải lỗi motor — accelTime đo vẫn đúng 0.12 s tính từ lúc input thật sự tới. Là artifact của cách bơm input giả. Bàn phím thật đi đường Dynamic Update bình thường.

→ Không đưa vào bài. Nhưng để bài 03 đo nhảy chính xác hơn, thêm một hook test trên `PlayerMotor` để recorder ghi thẳng input thay vì đi qua Input System.

### 3. Sprite 32×32 nhưng thân chỉ 23×28 px

Đo bằng PIL: bbox alpha của `Idle_0` là (5, 4, 28, 32). Nếu để BoxCollider2D auto-fit theo sprite (2×2) thì nhân vật "chạm" tường khi còn cách 0.3 u, và chân lơ lửng. Đặt tay size (1.2, 1.7), offset (0, −0.15) để đáy collider trùng đáy ô — chỗ chân sprite chạm.

→ Bài cần ảnh Scene view zoom vào sprite với collider gizmo, chỉ rõ khoảng trống transparent bốn phía.

### 4. Gán layer bằng `SerializedObject` của TagManager

Tạo layer bằng code phải đi qua `ProjectSettings/TagManager.asset`, không có API công khai. Người đọc làm bằng Inspector: **Layers → Edit Layers**. Ghi vào bài theo cách Inspector.

## Ảnh cần chụp

- [x] `02_player_on_floor.png` — nhân vật đứng trên sàn, đúng tỉ lệ so với tile
- [ ] Scene view: Player chọn, thấy BoxCollider2D (xanh) + ground probe gizmo (vàng/xanh lá) so với sprite
- [ ] Inspector Rigidbody2D: Dynamic, Gravity Scale, Freeze Rotation Z, Continuous, Interpolate
- [ ] Inspector PlayerMotor với 3 số Run + Ground Mask = Ground
- [ ] Input Actions editor: map Gameplay với Move và Jump
- [ ] Edit Layers: Ground và Player
- [ ] Đồ thị vx theo t từ CSV recorder (vẽ lúc viết bài, dữ liệu trong journal này)

## Ghi cho người viết bài

**Đối chiếu trực tiếp với shmup #02.** Cùng một người viết cả hai `PlayerMovement`/`PlayerMotor`, cùng tách Update (đọc input) / FixedUpdate (đẩy body), nhưng shmup là **Kinematic + MovePosition** còn đây là **Dynamic + linearVelocity**. Lý do một câu: ở shmup không có trọng lực và không đứng lên vật gì; ở đây trọng lực, đứng trên sàn, đụng tường đều muốn physics lo. Người đã đọc shmup sẽ hỏi đúng câu này.

**`MoveTowards` chứ không `Lerp`.** MoveTowards tiến với tốc độ cố định (u/s²) nên accelTime là số thật; Lerp tiến theo tỉ lệ nên không bao giờ tới đích và không đo được. Đây là chỗ đi xa hơn tutorial thường của bài.

**accel ≠ decel là quyết định cảm giác.** Bài nên cho người đọc thử đổi decelTime 0.08 → 0.3 và cảm nhận "trượt băng". Con số trong bảng đo ở trên là bằng chứng.

**Ground check bằng OverlapBox, không phải trigger ở chân.** Trigger báo "có chạm" nhưng không nói chạm gì, và một object trigger con phải sync với collider cha. OverlapBox một dòng, có LayerMask, có gizmo. Bài 04 dùng lại đúng kỹ thuật này quay ngang để dò tường.

**Physics material friction 0 là bắt buộc, giải thích ở bài 04.** Bài 02 chỉ cần đặt và nói "bài 04 sẽ rõ vì sao": không có nó, ép người vào tường lúc nhảy là bị dính.

**Thứ tự dạy:** tạo Input Actions → tạo Player với Rigidbody/Collider (thấy nó rơi xuống sàn và nằm yên — đó là verify đầu tiên, chưa cần code) → viết PlayerMotor → chạy → đo trượt. Mình làm gộp một lượt, bài nên tách để mỗi bước có một thứ nhìn thấy.

## Chưa làm, để chặng sau

- Nhảy, coyote, buffer → 03
- Hook test cho recorder trên PlayerMotor → 03
- Flip sprite theo hướng → 06 (FacingSign đã có sẵn)
- gravityScale 4 là tạm
