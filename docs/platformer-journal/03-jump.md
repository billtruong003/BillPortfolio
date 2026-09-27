# 03 — Cú nhảy thấy đã tay

Ngày dựng: 2026-09-19 · Scene `PLT_03_Jump`

## Mục tiêu

Nhảy đúng độ cao đặt ra bằng số thiết kế (không mò lực), nhả sớm thì nhảy thấp, và hai cơ chế tha thứ: coyote time, jump buffer. Mọi thứ đo được bằng số, không "cảm thấy".

## Đã dựng

- `PlayerMotor.cs` bản chặng 03 → snapshot `Journal/03_PlayerMotor.cs.txt`
- `MotionRecorder.cs` bản 2 → `Journal/03_MotionRecorder.cs.txt`. Bơm input **thẳng vào motor** (`UseTestInput`, `TestMove`, `TestJumpHeld`) theo lịch fixed-step, không đi qua Input System nữa.
- Scene `PLT_03_Jump` = scene 02 + `MotionRecorder` trên Player (tool lab, xoá khi ship)
- `Rigidbody2D.gravityScale = 0` — motor **tự tích phân trọng lực** từ số thiết kế

## Số đã chốt

Thiết kế bằng hai con số người đọc hình dung được, phần còn lại suy ra:

| Số thiết kế | Giá trị | Ý nghĩa |
|---|---|---|
| jumpHeight | 5.5 u | Chân nhấc lên 5.5 tile khi giữ hết. Bệ 1 cao 5 tile so với sàn ⇒ vừa đủ với dư 0.5 |
| timeToApex | 0.4 s | Từ bật lên tới đỉnh |

| Suy ra | Công thức | Giá trị |
|---|---|---|
| Gravity | 2h / t² | 68.75 u/s² |
| JumpVelocity | g · t  (= √(2gh)) | 27.5 u/s |
| gravityScale tương đương | g / 9.81 | 7.0 — con số vô nghĩa với người đọc, nên không dùng |

| Cảm giác | Giá trị | Vì sao |
|---|---|---|
| fallGravityMultiplier | 1.6 | Rơi nhanh hơn bay lên. Đo: lên 0.36 s, xuống 0.34 s dù cao bằng nhau |
| jumpCutMultiplier | 0.4 | Nhả sớm → vy nhân 0.4, **một lần** |
| maxFallSpeed | 32 u/s | Chạm được trong Test D: vy kẹt ở −32.00 |
| coyoteTime | 0.10 s | |
| jumpBufferTime | 0.10 s | |
| airControl | 0.7 | Trên không, accel/decel nhân 0.7 |

## Kết quả đo (MotionRecorder, 50 Hz)

| Test | Kịch bản | Đo được | Kết luận |
|---|---|---|---|
| **A** giữ hết | đứng yên, bấm giữ 1 s | cao **5.22 u**, đỉnh sau 0.34 s, tổng 0.70 s trên không | Thiếu 0.28 u so với 5.5 = đúng **nửa step Euler** (v·dt/2 = 27.5 × 0.01). Chấp nhận, ghi rõ |
| **B** chạm nhẹ | giữ 0.08 s | cao **2.40 u**, đỉnh 0.18 s, trên không 0.42 s | 44% chiều cao đầy → variable height hoạt động, đường cong mượt |
| **C1** coyote | chạy rời mép bệ, bấm sau **0.08 s** | vẫn nhảy, vy reset lên 24.75 từ đang rơi −5.77 | Trong cửa sổ 0.10 ⇒ được |
| **C2** coyote ngoài cửa sổ | bấm sau **0.24 s** | **không** nhảy giữa không trung; rơi chạm sàn rồi mới bật | Ngoài cửa sổ ⇒ từ chối. Xem vấp #4 |
| **D** buffer | rơi từ y=10, bấm **0.06 s trước** khi chạm | nhảy ngay step chạm đất, đầy 5.23 u | Buffer giữ lệnh qua lúc chạm |
| Buffer → nhảy | mọi test | **0.02 s = 1 step** | Motor không trễ |

## Vấp

### 1. Jump cut áp mỗi step = 0.4ⁿ, cú nhảy chết tức thì

Bản đầu: `if (!JumpHeld && v.y > 0) v.y *= 0.4` chạy **mỗi FixedUpdate** khi đã nhả. Sau 3 step vận tốc còn 6%, đường cong gãy: chạm nhẹ chỉ lên 2.10 u và vy tụt từ 22 xuống 1.6 trong 2 mẫu.

Sửa: cờ `jumpCutDone`, cắt đúng một lần, reset khi bật nhảy mới. Chạm nhẹ giờ lên 2.40 u, vy 22 → 6.05 → 3.3 → 0.55 → đỉnh, cong đều.

→ Lỗi này gần như mọi tutorial mắc và không ai nhận ra vì "nhả là rơi" trông vẫn giống variable height. Đưa cả hai CSV vào bài, đặt cạnh nhau.

### 2. Input test bơm qua Update trễ 0.2 s; cú chạm nhẹ 0.08 s không nhảy

Recorder set `TestJumpHeld` trong FixedUpdate, motor đọc trong Update để bắt cạnh (edge). Đo: `bufferSetAt` trễ ~0.22 s so với lúc set, và cú chạm 0.08 s (4 step) **không hề** được Update nhìn thấy (`jumpHeld` = 0 suốt).

Không truy được nguyên nhân chắc chắn (Update chạy 2.7 lần mỗi fixed step, thứ tự script không đảm bảo). Cách sửa đúng bất kể nguyên nhân: **tín hiệu sinh ở FixedUpdate thì tiêu thụ ở FixedUpdate.** Recorder `[DefaultExecutionOrder(-50)]` để chạy trước motor; motor đọc test input ở đầu FixedUpdate.

Bàn phím thật vẫn đi đường Update → `WasPressedThisFrame` → `bufferCounter` → FixedUpdate tiêu thụ. **Chính buffer là thứ nối hai nhịp**: một lần bấm rơi vào frame không có physics step vẫn không bị mất. Đây là lý do thứ hai để có jump buffer, ngoài chuyện tha thứ cho người chơi.

→ Không đưa chuyện recorder vào bài. Nhưng câu "buffer nối Update với FixedUpdate" thì đưa, nó là chỗ đi xa hơn tutorial thường.

### 3. Thiếu nửa step

Euler nửa ẩn: đặt vy = 27.5 rồi ngay step đó đã trừ g·dt trước khi tích phân vị trí ⇒ mất v·dt/2 = 0.275 u. Đo được 5.225 khớp tới 3 chữ số.

Hai cách: chấp nhận và ghi rõ, hoặc cộng bù `v.y = JumpVelocity + 0.5 g dt`. Chọn **chấp nhận** cho bài — công thức sạch quan trọng hơn 0.28 u. Ghi số đo thật vào bài để người đọc thấy mình không nói dối.

### 4. Test C2 thiết kế sai, nhưng lộ ra thứ hay hơn

Định thử "bấm 0.24 s sau khi rời mép → không nhảy". Nhân vật rơi từ bệ cao 5 tile chạm sàn chỉ sau ~0.3 s, nên lệnh bấm ở 0.24 s vẫn còn trong buffer 0.10 s lúc chạm đất → **nhảy ngay khi chạm**. Trong không trung thì đúng là không nhảy (vy đi thẳng từ −27.77 xuống, không reset).

Một run chứng minh cả hai: coyote từ chối, buffer chấp nhận. Đưa CSV này vào bài với hai mũi tên chỉ hai mốc.

### 5. Trượt tường "miễn phí" nhờ friction 0

Trong C1, nhân vật đang bay lên đâm vào vách trái của bệ 2 (x=20): vx về 0, **y vẫn tiếp tục tăng** rồi rơi thẳng xuống dọc vách, không dính. Đây là physics material friction 0 từ bài 02 đang trả công. Không có nó, ép người vào tường là treo lơ lửng.

→ Bài 04 (wall jump) sẽ dùng chính hành vi này, và bài 02 chỉ cần nói "bài 04 sẽ rõ".

### 6. Chạm đất ở tốc độ tối đa nghỉ cao hơn 0.05 u

C2: rơi với vy = −31.4 rồi dừng ở y = 3.064 thay vì 3.015. Solver dừng sớm một chút khi xuyên sâu trong một step. Không ảnh hưởng gameplay (ground probe vẫn thấy sàn), nhưng nếu bài 06 animation đọc y để "chạm đất" thì phải dùng `IsGrounded`, không so y.

### 7. `IsGrounded` mẫu đầu tiên là giá trị cũ

Sample t=0 của Test D báo grounded=1 dù đặt ở y=10, vì `IsGrounded` chưa được tính lại sau khi teleport. Chỉ là artifact đo; nhưng nhắc: **teleport player thì gọi lại CheckGround** — bài 08 (respawn) sẽ cần.

## Ảnh cần chụp

- [ ] Inspector PlayerMotor: nhóm "Jump (design numbers)" với Jump Height và Time To Apex, kèm 2 dòng Gravity/JumpVelocity suy ra (cần custom editor hoặc ghi tay vào ảnh)
- [ ] Scene view: gizmo vạch cyan ở chiều cao jumpHeight so với bệ 1
- [ ] Đồ thị y(t) hai đường: giữ hết vs chạm nhẹ — vẽ từ CSV A và B2
- [ ] Đồ thị vy(t) cut-mỗi-step vs cut-một-lần — CSV B và B2
- [ ] Sơ đồ coyote: mép bệ, cửa sổ 0.10 s, hai điểm bấm 0.08 (được) và 0.24 (không)
- [ ] Sơ đồ buffer: đường rơi, điểm bấm, điểm chạm, mũi tên "giữ lệnh 0.06 s"
- [ ] Rigidbody2D Inspector với Gravity Scale = 0 và ghi chú "motor tự tính"

## Ghi cho người viết bài

**Mở bài bằng câu hỏi "nhảy cao 5 tile thì set lực bao nhiêu?"** Đó là câu người mới hỏi và tutorial thường trả lời "thử 10, không được thì 15". Bài này trả lời bằng hai số thiết kế và công thức `g = 2h/t²`. Cả bài xoay quanh việc con số đo ra đúng công thức (5.22 ≈ 5.5 − nửa step).

**Vì sao gravityScale = 0 và motor tự tính trọng lực:** để `fallGravityMultiplier` và `maxFallSpeed` nằm cùng chỗ với jumpHeight. Nếu để Rigidbody lo trọng lực thì "rơi nhanh hơn bay lên" phải đổi gravityScale giữa chừng, khó theo dõi. Một câu là đủ.

**Thứ tự dạy:** nhảy giữ hết (đo cao) → thêm cut (đo chạm nhẹ) → thêm coyote (kịch bản C1) → thêm buffer (kịch bản D). Mỗi bước một CSV. Người đọc có thể không có recorder — thay bằng "đặt bệ cao đúng 5 tile, nhảy phải vừa chạm mép" là verify bằng mắt.

**Đừng dạy recorder trong bài chính.** Nó là tool của mình. Có thể để phụ lục "cách mình đo" cho ai tò mò.

**Chỗ đi xa hơn tutorial thường (một cái duy nhất):** jump buffer không chỉ để tha thứ, nó là cầu nối Update ↔ FixedUpdate. Mọi tutorial dạy buffer như tính năng cảm giác; ít ai nói nó sửa lỗi mất input khi frame không có physics step.

## Chưa làm, để chặng sau

- Double jump: `JumpsThisAirtime` đã đếm sẵn, cần `maxJumps` → 04
- Wall detect / slide / jump → 04
- Cắt animation Jump/Fall/Double_Jump → 06
- Bù nửa step: không làm, đã quyết
