# 07 — Ba nhân vật từ một prefab: PlayerData

Ngày dựng: 2026-09-19 · Scene `PLT_07_Characters`

## Mục tiêu

Ba nhân vật của pack khác nhau về **cảm giác điều khiển**, không chỉ khác sprite. Đổi asset là đổi tính cách. Cùng một prefab, cùng một motor.

## Đã dựng

- `Scripts/Player/PlayerData.cs` → `Journal/07_PlayerData.cs.txt`. ScriptableObject: animator controller, portrait, và **19 số cảm giác** (run 4, jump 5, air 2, wall 5, tha thứ 3). Có `Gravity`/`JumpVelocity` suy ra để đọc trong Inspector.
- `PlayerMotor` v07 → `Journal/07_PlayerMotor.cs.txt`: thêm field `data`, hàm `Apply(PlayerData)` copy toàn bộ số vào field riêng, gọi trong `OnEnable`. Field serialized giữ lại làm mặc định khi không có asset. Thêm `RefreshGround()` cho bài 08.
- `PlayerAnimator` v07: `ApplyData()` lấy controller từ `motor.Data`, gọi lại được lúc runtime.
- Clip + controller cho Char2, Char3 (cùng cách bài 06)
- Ba asset trong `ScriptableObjects/Players/`:

| | Player_Balanced "Cân bằng" | Player_Light "Nhẹ" | Player_Heavy "Nặng" |
|---|---|---|---|
| Sprite | Char1 | Char2 | Char3 |
| moveSpeed | 9 | **10.5** | **7.5** |
| accelTime / decelTime | 0.12 / 0.08 | 0.08 / 0.06 | **0.20 / 0.15** |
| airControl | 0.7 | **0.9** | **0.5** |
| jumpHeight / timeToApex | 5.5 / 0.40 | **6.5** / 0.42 | **4.5 / 0.33** |
| Gravity (suy ra) | 68.8 | 73.7 | **82.6** |
| fallGravityMultiplier | 1.6 | 1.4 | **2.0** |
| maxJumps | 2 | 2 | **1** |
| wallSlideSpeed | 4 | **8** (bám yếu) | **2.5** (bám tốt) |
| wallJumpPush / lock | 10 / 0.15 | 8 / 0.12 | 12 / 0.20 |

## Kết quả đo — cùng một kịch bản

Chạy 1.0 s → thả → nhảy giữ hết ở 1.4 s. Mỗi nhân vật một lần, `motor.Apply()` + `animator.ApplyData()` lúc runtime, không load scene.

| | Cân bằng | Nhẹ | Nặng |
|---|---|---|---|
| Top speed | 9.00 | 10.50 | 7.50 |
| Trượt sau thả | 0.27 u / 0.08 s | 0.21 u / 0.06 s | **0.49 u / 0.16 s** |
| Cao nhảy | 5.23 | 6.26 | 4.24 |
| Thời gian trên không | 0.72 s | 0.78 s | **0.56 s** |
| Controller lúc đo | Player_Char1 | Player_Char2 | Player_Char3 |

Ba cột đọc ra ba tính cách mà không cần chơi thử: Nặng trượt gấp đôi, nhảy thấp mà cú nhảy kết thúc nhanh nhất (gravity 82.6 × fall 2.0); Nhẹ nhảy cao nhất, dừng gắt nhất.

## Vấp

### 1. Reference asset chết sau `OpenScene` — `data` bị nối thành null

Trong cùng một lệnh: `CreateAsset` ba PlayerData → `OpenScene(PLT_06)` → gán `motor.data = a` → `SaveScene(PLT_07)` → `return a.name` → **"object has been destroyed"**. `OpenScene` làm managed reference `a` chết; dòng gán trước đó ghi vào field một reference chết = null; scene 07 lưu với `data` rỗng.

Kiểm tra lại: `dataWasWiredBefore = false`. Phải load lại bằng `AssetDatabase.LoadAssetAtPath` rồi gán lại.

→ Không đưa vào bài (người đọc kéo bằng chuột). Nhưng bài cần bước verify: "chọn Player, ô Data phải hiện tên asset, không phải None".

### 2. Nhẹ chạy 10.5 u/s đâm bậc x=30 trước khi kịp thả phím

Lần đo đầu của Nhẹ: `slideAfterRelease = 0`, timeline `Idle@0.94` trước cả lúc thả (1.0). Từ x=20, 10.5 u/s → tới bậc x=30 trong 0.95 s → dừng vì tường. Cân bằng (9 u/s) chỉ tới 29 nên thoát. Đổi điểm xuất phát sang x=34 (đoạn trống 14 unit tới khe) thì đo đúng.

→ Sân thử phải dài hơn nhân vật nhanh nhất chạy trong thời gian thử. Bài không cần chuyện này, nhưng phòng test của người đọc nên có một dải sàn trống ≥ 16 tile.

### 3. Sau khi sửa `maximumDeltaTime`, timeline sạch ngay từ đầu

Cả ba lần đo: `Run@0.02` — không còn lag 0.2–0.3 s ở đầu như bài 06. Xác nhận chẩn đoán catch-up ở bài 06 đúng.

### 4. `Apply()` copy 19 field bằng tay

Dài, dễ quên khi thêm số mới. Cân nhắc cho motor đọc thẳng `data.moveSpeed` mỗi lần dùng thay vì copy. Không đổi vì: (a) copy giữ được chế độ "không có asset" cho scene test; (b) đọc thẳng từ SO mỗi FixedUpdate thì đổi asset trong Play Mode làm nhân vật đổi tính cách giữa cú nhảy — thú vị nhưng khó dạy. Giữ pattern y hệt shmup `Enemy.Apply` để người đọc nhận ra.

## Ảnh cần chụp

- [x] `07_char_light.png`, `07_char_heavy.png`, `07_char_balanced.png` — ba sprite trên cùng scene
- [ ] Inspector PlayerData của Nặng: nhóm Jump với Gravity/JumpVelocity suy ra
- [ ] Inspector PlayerMotor: ô Data = Player_Balanced, các field bên dưới mờ đi (nên làm custom editor disable khi có data)
- [ ] Ba asset cạnh nhau trong Project window
- [ ] Đồ thị y(t) ba đường: ba độ cao, ba thời gian trên không
- [ ] Đồ thị vx(t) sau thả: ba độ dốc giảm tốc

## Ghi cho người viết bài

**Đối chiếu thẳng với shmup #6.** Cùng pattern (SO + Apply trong OnEnable), khác bản chất: ở shmup data là **chỉ số** (máu, tốc độ bay), ở đây data là **cảm giác**. Đổi `decelTime` 0.08 → 0.15 là nhân vật "trượt băng". Người đọc đã đọc shmup sẽ thấy pattern quen và cái mới nằm ở ý nghĩa con số.

**Bảng 19 số là nội dung, không phải phụ lục.** Mỗi hàng nên có một câu "số này làm gì với tay bạn". Nặng có `maxJumps = 1` là quyết định lớn nhất: mất double jump, bù bằng bám tường tốt (`wallSlideSpeed 2.5`) và push mạnh (12).

**Ba nhân vật là ba cách qua cùng một phòng.** Bài nên có một phòng test và mô tả Nhẹ qua bằng double jump, Nặng qua bằng wall jump. Đó là lý do thiết kế, không phải chỉ đổi số cho khác.

**Đổi nhân vật lúc runtime bằng `Apply` + `ApplyData`.** Bài 14 (màn chọn nhân vật) dùng đúng hai hàm này. Nói trước.

**`Gravity` và `JumpVelocity` lặp ở cả PlayerData lẫn PlayerMotor** — cố ý: asset cần để đọc trong Inspector, motor cần để tính. Một câu giải thích, không phải lỗi thiết kế.

## Chưa làm, để chặng sau

- Custom editor làm mờ field khi có data — nice-to-have, có thể bỏ
- Màn chọn nhân vật → 14
- Portrait dùng cho UI → 14

## Đính chính (2026-09-29, đo lại cho bài 07)

- `Gravity`/`JumpVelocity` của PlayerData là property, **Inspector không hiện**. Bài không được viết "hiện trong Inspector".
- Đo lại cùng kịch bản với code bài 07 (bộ đo đọc `Rigidbody2D.position`; lần đầu đọc `transform.position` bị trễ một bước do Interpolate, ra trượt 0.63 là sai):

| | Cân bằng | Nhẹ | Nặng |
|---|---|---|---|
| Trượt | 0.27 u / 0.08 s | 0.21 u / 0.06 s | 0.49 u / 0.16 s |
| Cao | 5.225 | **6.19** (journal gốc 6.26) | 4.23 |
| Trên không | 0.72 | 0.78 | 0.56 |

- Nặng nhảy 4.23 < 5 ⇒ không lên được bệ 1 bằng nhảy thường trong phòng mẫu.
- Bài dạy biến Player thành prefab (project gốc không có prefab Player; mỗi scene một object).

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/07/`.
