# 08 — Bẫy, chết và hồi sinh

Ngày dựng: 2026-09-19 · Scene `PLT_08_Death`

## Mục tiêu

Chết một phát là chết, hồi sinh ở checkpoint gần nhất, **không reload scene**. Bẫy có animation. Cờ checkpoint đổi trạng thái khi chạm.

## Đã dựng

- `Scripts/Common/SpriteSequence.cs` → `Journal/08_SpriteSequence.cs.txt`. Phát mảng sprite lên SpriteRenderer theo fps, loop hoặc không, có callback `Completed`. Nhẹ hơn Animator cho prop dùng một lần.
- `Scripts/Level/Hazard.cs` → đánh dấu trigger là chết người, có `label` để log
- `Scripts/Level/Checkpoint.cs` → ba trạng thái: `No_Flag` (chưa chạm) → `Flag_Out` (kéo cờ, 7 frame chạy một lần) → `Flag_Idle` (đang bật, loop). Gọi `life.SetRespawnPoint()`
- `Scripts/Player/PlayerLife.cs` → `Journal/08_PlayerLife.cs.txt`. Chết → đóng băng xác → VFX `Desappearing` → chờ → teleport → `RefreshGround()` → `follow.SnapTo()` → VFX `Appearing` → chờ → trả điều khiển
- Layer `Hazard` (13)
- Trong scene: `Level/` chứa `Trap_A` (44.5, 3.5), `Trap_B` (24.5, 12.5), `Checkpoint_1` (12, 3.5), `Checkpoint_2` (38, 3.5), `Spawn` (6, 3.02)

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| deathDelay | 0.45 s | VFX Desappearing 7 frame @20fps = 0.35 s, dư 0.1 |
| appearDelay | 0.35 s | VFX Appearing 7 frame @20fps |
| Tổng chết→điều khiển | **0.80 s** | Đo được: chết 0.40, teleport 0.82, chạy lại 1.20 |
| fallOutMargin | 2 u | Rơi dưới đáy phòng 2 unit là chết |
| Trap collider | 2.0 × 0.9, offset (0, −1.0) | Đo bbox alpha sprite: 32×16 px = 2.0 × 1.0 u nằm sát đáy ô 48×48 |
| respawnOffset checkpoint | (0, 0.55) | |

## Kết quả đo

| Test | Kịch bản | Kết quả |
|---|---|---|
| **O** | chạy từ x=40 vào Trap_A | Chết ở x=42.87 (t=0.40). Xác đóng băng tại chỗ. Teleport về Spawn (6, 3.02) ở t=0.82. Chạy lại được ở t=1.20. `Deaths` 0→1 |
| **P** | chạy từ x=34 qua Checkpoint_2 (x=38) rồi vào bẫy | Cờ 2 bật, **cờ 1 tự hạ**. Hồi sinh ở (38, 4.05) chứ không về Spawn. `ActiveCheckpoint = Checkpoint_2` |
| **Q** | sau khi sửa collider, chạy + nhảy ở 0.42 s | Vượt bẫy, `Deaths` không đổi. Lúc bay qua vùng bẫy, đáy collider người ở y=5.43 so với đỉnh bẫy 2.95 |

Trong test O, sau khi hồi sinh ở x=6 nhân vật chạy tiếp và **tự chạm Checkpoint_1 ở x=12** — nên `RespawnPoint` đổi thành (12, 4.05) mà mình không chủ động test. Bằng chứng không cố ý nhưng rất tốt.

## Vấp

### 1. Collider bẫy to hơn phần nhìn thấy — lỗi chỉ ảnh mới phát hiện

Đặt đại `size (2.2, 1.6) offset (0, −0.4)` → vùng chết cao từ y=2.3 tới 3.9, trong khi thanh gai chỉ cao tới y≈2.95. Người chơi nhảy qua vẫn chết, và trên màn hình trông như chết oan.

Số đo thật từ bbox alpha của `Traps/1.png`: **32 × 16 px = 2.0 × 1.0 u, đặt sát đáy ô**, offset (0, −1.0). Sửa xong thì nhảy qua được.

→ **Đây là lỗi đáng mở đầu phần bẫy trong bài.** Nó chỉ lộ ra khi nhìn ảnh, không lộ qua số — test O vẫn "pass" với collider sai. Bài nên dạy: đo bbox sprite rồi mới đặt collider, và bật gizmo collider để đối chiếu bằng mắt.

Ghi chú thêm: frame 0 của bẫy cao 1.0 u nhưng frame 1–2 chỉ 0.88 và 0.81 — gai co lại theo animation. Collider tĩnh lấy theo frame cao nhất, nghĩa là có lúc chết dù gai đang thụt. Chấp nhận cho bài này; game thật thì animate collider hoặc dùng vùng chết nhỏ hơn.

### 2. Sửa collider trong Play Mode thì mất

Sửa lúc đang Play, test Q pass, stop → giá trị quay về cũ. Phải áp lại ở Edit mode rồi `SaveScene`. Bẫy cũ nhưng vẫn dính.

### 3. `anim = Fall` suốt lúc hồi sinh

Từ teleport tới lúc trả điều khiển, `motor.enabled = false` nên `IsGrounded` không được cập nhật, `PlayerAnimator` suy ra Fall. Sprite đang tắt nên không ai thấy — nhưng nếu bài 13 thêm âm thanh theo state thì sẽ phát nhầm tiếng rơi.

Cách sửa gọn: trong `PlayerLife`, tắt luôn `PlayerAnimator` trong lúc chết, hoặc thêm state `Dead` vào bảng suy. Chưa làm.

### 4. Hồi sinh ở checkpoint bị rơi nhẹ 1 unit

`respawnOffset = 0.55` đặt nhân vật ở y=4.05 trong khi mặt sàn ở y=3.015 → rơi 1 unit sau khi hiện ra. Nhìn thấy được. Nên đo chân cờ rồi đặt offset sao cho chân người chạm sàn, hoặc snap xuống ground bằng raycast lúc respawn.

### 5. `RefreshGround()` gọi lúc collider đang tắt

Thứ tự trong `DeathRoutine`: teleport → `body.simulated = true` → `RefreshGround()`. Nhưng `col.enabled` vẫn false tới cuối. Recorder cho thấy `grounded = 0` ba mẫu đầu sau teleport. Không gây hậu quả (motor cũng đang tắt), nhưng thứ tự đúng nên là bật collider trước rồi mới refresh.

## Ảnh cần chụp

- [x] `08_trap_checkpoint.png` — cờ đã kéo lên + bẫy + nhân vật trong một khung
- [ ] **Ảnh đối chiếu collider bẫy**: gizmo collider sai (to) vs đúng (khớp gai) — ảnh quan trọng nhất bài
- [ ] Ba trạng thái cờ cạnh nhau: No_Flag / Flag_Out giữa chừng / Flag_Idle
- [ ] Chuỗi 4 khung VFX chết: đứng → Desappearing → trống → Appearing
- [ ] Inspector PlayerLife với hai mảng VFX 7 frame
- [ ] Scene view: gizmo `RespawnPoint` (cầu xanh) trên mỗi checkpoint
- [ ] Sprite Editor: bbox `Traps/1.png` cho thấy gai chỉ chiếm phần đáy ô

## Ghi cho người viết bài

**Đối chiếu thẳng với shmup #8.** Shmup restart bằng `SceneManager.LoadScene`. Platformer không dùng được: chết mấy chục lần mỗi màn, reload vừa chậm vừa xoá sạch tiến độ phòng (gem đã nhặt, cờ đã cắm). Bài nên mở bằng chính câu hỏi này rồi mới viết `DeathRoutine`.

**Chuỗi chết là một coroutine 6 bước, mỗi bước có lý do.** Đóng băng xác tại chỗ (không để nó rơi tiếp), tắt collider (không chết lần hai), tắt sprite (VFX thay thế), teleport, `SnapTo` camera (**bài 05 đã chuẩn bị sẵn hàm này** — respawn mà camera pan là nhìn rẻ tiền), rồi mới trả điều khiển.

**`SpriteSequence` vs Animator.** Nhân vật cần Animator vì có 7 state và logic suy state. Cờ, bẫy, gem chỉ phát một dãy sprite — viết 60 dòng gọn hơn tạo 3 controller. Bài nên nói rõ tiêu chí chọn, đây là câu hỏi thật của người mới.

**Checkpoint tự hạ cờ cũ** — `SetRespawnPoint` gọi `Deactivate()` trên cờ trước. Chi tiết nhỏ, nhưng thiếu là người chơi thấy hai cờ cùng bật.

**Verify bằng số đếm được:** chết 5 lần liên tiếp ở cùng một bẫy, mỗi lần hồi sinh ở cờ gần nhất, và `Deaths` tăng đúng 5.

## Chưa làm, để chặng sau

- State `Dead` cho PlayerAnimator (mục vấp 3)
- Snap chân xuống sàn lúc respawn (mục vấp 4)
- Gem, thùng gỗ, cửa thoát → 09
- Đặt thêm bẫy loại 2, 3 (sprite 2.png hình tròn 1.88×1.88, 3.png cao 2.0) → 09 hoặc 14

## Đính chính (2026-09-29, lúc chụp ảnh cho bài 08)

- Bẫy `Traps/1.png` là **bàn dập** (mặt đỏ trên cột xám, nhấp lên xuống), không phải gai. Chiều cao phần có hình qua 7 frame: 16, 14, 13, 24, 26, 24, 20 px, tức 0.81 tới 1.62 unit; rộng 32 px (2 unit) ở mọi frame.
- Collider bẫy chọn khớp tư thế thấp: Size (2.0, 0.9), Offset (0, 0.5). Collider cũ 2.2 × 1.6 cao tới 1.9 unit, cao hơn cả frame cao nhất: cú nhảy từ x 42.3 bị giết ở x 42.95, chân 1.505 trên mặt sàn, trong lúc mặt bàn dập frame 1_6 chỉ cao 1.25. Collider mới: cùng cú nhảy qua an toàn, chân thấp nhất 1.505 so với đỉnh vùng chết 0.95.
- Checkpoint_2 dời về x = 22 (trigger 1.5 × 2.6, offset (0, 1.5)), respawnOffset (0, 0) vì cả cờ lẫn nhân vật pivot ở chân.
- Đo bằng code bài 08 (captureFramerate 50): chạy từ x 40 chết ở 0.36 s (x 42.97), điều khiển lại 1.18 s (0.82 s sau khi chết), hết bất tử 2.40 s. Lượt chạy từ x 18: cờ 2 kéo lên ở x 20.79, chết ở 2.80 s, hồi sinh đúng (22, 2.0) rồi 2.015.
- Cần sorting layer `FX` (PlayVfx đặt sortingLayerName "FX"); bài 08 hướng dẫn thêm.
- `Deaths` là property, không hiện ở Debug Inspector. Bài hướng dẫn đếm bằng Debug.Log tạm trong `Died`.

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/08/`.
