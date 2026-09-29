# 06 — Animation sinh ra từ trạng thái, không từ phím

Ngày dựng: 2026-09-19 · Scene `PLT_06_Anim`

## Mục tiêu

Bảy animation của nhân vật chạy đúng lúc, lật hướng đúng, và AnimatorController **không có transition nào** — để thêm move mới không thành mạng nhện.

## Đã dựng

- `Animation/Player/Char1/*.anim` — 7 clip sinh từ sheet đã cắt ở bài 00:

  | Clip | Frame | fps | Loop |
  |---|---|---|---|
  | Idle | 11 | 20 | ✓ |
  | Run | 12 | 20 | ✓ |
  | Jump | 1 | — | |
  | Fall | 1 | — | |
  | Double_Jump | 6 | 20 | |
  | Wall_Jump | 5 | 20 | ✓ (dùng làm **wall slide**) |
  | Hit | 7 | 20 | |

- `Animation/Player/Char1/Player_Char1.controller` — 7 state, **0 transition**, default Idle
- `Scripts/Player/PlayerAnimator.cs` → `Journal/06_PlayerAnimator.cs.txt`. `LateUpdate`: suy state từ motor → `animator.Play(hash, 0, 0)` khi state đổi → `flipX = FacingSign < 0`
- Player có thêm `Animator` (Culling Always Animate, Update Normal, không root motion) và `PlayerAnimator`
- Recorder v4: ghi thêm cột `anim`, hàm `AnimTimeline()` nén thành "Idle@0.00 Run@0.34 …"

Bảng suy state, theo thứ tự ưu tiên:

```
hitUntil còn        → Hit
IsWallSliding       → WallSlide  (clip Wall_Jump)
!IsGrounded:
   doubleJumpUntil  → DoubleJump (0.3 s sau một Air jump)
   vy > 0           → Jump
   else             → Fall
|vx| > 0.5          → Run
else                → Idle
```

## Kết quả đo

| Kịch bản | Timeline |
|---|---|
| **L** chạy → nhảy → nhảy → thả → đứng | `Idle@0.00 Run@0.34 Jump@0.56 Fall@0.58 Run@0.76 Jump@0.96 Fall@0.98 Run@1.16 Idle@1.30` |
| **M** khe: nhảy dọc tường → bám → wall jump → rơi → bám → đáp | `Idle@0.00 Jump@0.32 Fall@0.48 WallSlide@0.50 Jump@0.78 Fall@1.10 WallSlide@1.48 Idle@1.72` |

Mọi chuyển trạng thái sau 0.35 s đầu đều đúng trong 1–2 step: Fall ngay khi vy < 0, WallSlide ngay khi kẹp −4, Jump đúng step wall jump (0.76 → 0.78), Idle 0.1 s sau khi vx về 0 (decel 0.08). `flipX` lật đúng theo `FacingSign` (kể cả lúc wall jump ép quay lưng khỏi tường).

## Vấp

### 1. Hai cú "nhảy cụt" trong L không phải lỗi — là đập đầu

L: nhảy ở x≈10 và x≈14.5, cả hai lần y chỉ lên 4.26 rồi vy = −1.37. Nghi cut, nghi animator can thiệp physics. Thực ra x 8–16 là **bệ 1 ở y=5**; đỉnh collider 4.958 chạm đáy bệ → physics triệt vy. Đúng hành vi.

→ Bài viết: kịch bản thử phải chọn chỗ trống. Và đây là ví dụ tốt về "đọc số trước khi đổ lỗi cho code" — số y=4.258 trùng nhau ở cả hai lần là gợi ý có vật cản.

### 2. Trạng thái đầu tiên trễ 0.2–0.3 s — tìm ra nguyên nhân chung của mọi lần "input trễ" từ bài 02

Run@0.34 trong khi vx = 9 từ t≈0.14. Jump@0.32 trong M khi nhảy ở 0.12. Nhưng các chuyển trạng thái **sau đó** đều đúng 1–2 step.

Nguyên nhân: mỗi lệnh MCP chặn main thread ~0.2–0.4 s. Frame kế tiếp có deltaTime lớn, Unity **dồn tới `maximumDeltaTime / fixedDeltaTime` = 16 FixedUpdate vào một frame** trước khi chạy Update/LateUpdate. Mọi thứ theo frame (Input System edge, `PlayerAnimator.LateUpdate`) lag so với mẫu physics đúng bằng khoảng dồn đó. Đây cũng là chuyện "input trễ 0.3 s" ở bài 02 và "cú chạm 0.08 s không được thấy" ở bài 03.

Sửa trong lab: `Run()` đặt `Time.maximumDeltaTime = fixedDeltaTime` cho tới khi xong → frame:fixed luôn 1:1 khi ghi. Không ảnh hưởng game thật.

→ Không đưa vào bài chính. Nhưng nếu có phụ lục "cách mình đo", đây là bẫy đáng kể nhất.

### 3. `??` với component Unity — tự dính bẫy mình đã ghi ở shmup #4

`player.GetComponent<Animator>() ?? player.AddComponent<Animator>()` → NullReferenceException lúc set controller. GetComponent trả về object "null giả", `??` coi là có, không AddComponent. Phải `if (anim == null) anim = AddComponent`.

→ Chỗ này đáng một câu trong bài: "Tôi vẫn dính dù đã biết."

### 4. Không có clip Wall Jump riêng — sheet `Wall_Jump` là tư thế bám tường

5 frame của `Wall_Jump.png` là nhân vật ôm tường, không phải động tác bật. Dùng nó cho state **WallSlide**; còn cú bật tường dùng clip Jump như nhảy thường. Đặt tên state trong code là `WallSlide` để khỏi hiểu nhầm; hash vẫn trỏ vào clip `Wall_Jump`.

### 5. Double_Jump chỉ hiện đúng 0.3 s rồi về Jump/Fall theo vy

Clip 6 frame ở 20 fps = 0.3 s, không loop. Nếu để "trên không sau air jump = DoubleJump" thì nó đứng ở frame cuối suốt phần rơi. Dùng `doubleJumpUntil` = LastJumpAt + 0.3 s, hết thì rơi về luật vy. Cần `motor.LastJumpAt` để phát hiện cú air jump mới — đây là lý do motor giữ `LastJump` / `LastJumpAt` từ bài 04.

### 6. Chưa kiểm được Hit

`PlayHit()` viết sẵn, bài 08 mới gọi. Chưa có kịch bản đo.

## Ảnh cần chụp

- [x] `06_anim_run.png` — frame Run giữa đường, camera đã pan
- [ ] Animator window: 7 state rời rạc, **không mũi tên** — ảnh chủ đạo của bài
- [ ] Animation window: clip Run với 12 keyframe sprite
- [ ] Sprite Editor: slice 32×32 Player (đã làm ở bài 00, chụp lại ở đây)
- [ ] Inspector Animator: Update Mode Normal, Culling Always Animate, Apply Root Motion tắt
- [ ] Ảnh đối chiếu: một Animator "kiểu thường" 7 state với ~20 transition (dựng nhanh để chụp) vs 0 transition

## Ghi cho người viết bài

**Bài này bán một ý duy nhất: state suy từ vật lý, không từ phím.** Mở bằng cái Animator mạng nhện — 7 state, mỗi cặp một transition hai chiều, mỗi transition có điều kiện — rồi hỏi "thêm wall jump thì vẽ thêm mấy mũi tên?". Rồi cho xem controller 0 transition và một hàm `Derive()` 10 dòng.

**Thứ tự ưu tiên trong `Derive()` là nội dung, không phải chi tiết.** Hit đè tất cả; WallSlide đè Jump/Fall vì bám tường thì vy ≤ 0 mà không muốn hiện Fall; DoubleJump có thời hạn.

**`Animator.Play(hash, 0, 0f)` chứ không `SetBool`/`SetTrigger`.** Không có parameter nào. Người quen Animator sẽ thấy lạ; cần nói rõ đây là cách dùng Animator làm "bộ phát clip", còn logic ở C#.

**Clip sinh bằng tay trong Animation window** (người đọc), mình sinh bằng code (lab). Bài hướng dẫn kéo 12 sprite vào Animation window, đặt Samples = 20. Con số 20 fps là của pack (chuyển động mượt ở 20).

**Lật bằng `flipX`, không scale −1.** Scale âm lật cả collider offset và child transform; flipX chỉ lật hình. Một câu.

## Chưa làm, để chặng sau

- Clip cho Char2, Char3 → 07 (cùng cách, khác sheet)
- Hit → 08
- Squash & stretch lúc đáp → 13

## Đính chính (2026-09-29, lúc chụp ảnh cho bài 06)

- Kéo nhiều sprite thả lên GameObject: Unity tạo clip **12 fps**, dài 1 s, loop, kèm Animator và controller đặt theo tên GameObject (đã thử bằng `SpriteUtility.AddAnimationToGO`). Bài hướng dẫn đổi Samples thành 20.
- Sprite rect của các sheet nhân vật (Char1..3) đổi alignment từ Custom (0.5, 0) sang **BottomCenter** (cùng pivot) để ảnh Sprite Editor khớp thao tác "Pivot Bottom Center". 21 clip, 0 keyframe null sau khi đổi.
- Đo lại bằng code bài 06 (captureFramerate 50): chuỗi Idle → Run → Jump → Fall → DoubleJump 0.32 s → Jump → Fall → WallSlide (chạm cột) → Fall → Idle; trong khe flipX đổi đúng bước wall jump.
- Sheet Wall_Jump: mép phẳng áp tường ở bên **phải**, mặt nhìn trái ⇒ `flipX = FacingSign < 0` đúng cả hai phía.

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/06/`.
