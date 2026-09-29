# 09 — Gem, thùng gỗ và cửa thoát

Ngày dựng: 2026-09-19 · Scene `PLT_09_Collect`

## Mục tiêu

Một căn phòng có mục tiêu: nhặt hết gem thì cửa mở, đi vào cửa thì phòng hoàn thành. Thùng gỗ phá được bằng cách giẫm từ trên — và phép kiểm tra hướng giẫm đó dùng lại nguyên vẹn cho địch ở bài 10.

## Đã dựng

- `Scripts/Common/StompCheck.cs` → `Journal/09_StompCheck.cs.txt`. **Một luật dùng chung cho bài 09–12**: đang rơi (`vy ≤ 0.01`) và chân cao hơn đỉnh mục tiêu trừ dung sai 0.35.
- `Scripts/Level/RoomState.cs` → đếm gem, phát `GemChanged` / `AllCollected` / `RoomCompleted`. Gem **tự đăng ký** trong `Start` nên tổng không bao giờ gõ tay.
- `Scripts/Level/Collectible.cs` → gem, có bob nhẹ, nhặt rồi thì ở trạng thái nhặt qua các lần chết
- `Scripts/Level/BreakableBox.cs` → collider **không phải trigger** (đứng lên được), chỉ vỡ khi bị giẫm, nảy người lên
- `Scripts/Level/LevelExit.cs` → khoá (`End_Pressed`) tới khi hết gem thì mở (`End_Idle` loop)
- Trong scene: 5 gem (12·8.4 / 24·13.5 / 38·18.5 / 51.5·12 / 30·5.5), 2 thùng (20·3 và 28·3), cửa thoát ở (59, 4)

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| StompCheck tolerance | 0.35 u | Bù phần đã lún vào nhau trong một physics step |
| hitsToBreak | 2 | Giẫm lần một chạy animation Hit, lần hai mới vỡ |
| bounceVelocity | 20 u/s | Thấp hơn JumpVelocity 27.5 — nảy đủ thoát nhưng không bằng nhảy chủ động |
| breakLinger | 0.2 s | Giữ sprite Break rồi mới tắt object |
| Gem collider | CircleCollider2D r = 0.8 | Rộng hơn sprite 1×1 để nhặt không hụt |
| Box collider | 2 × 2, **không trigger** | Sprite 32×32 = 2×2 u |

## Kết quả đo

| Test | Kịch bản | Kết quả |
|---|---|---|
| **R** giẫm thùng | thả từ y=9 xuống Box_1 (2 hit) | Giẫm lần 1 ở t=0.28, y=5.01, nảy vy=**20.0**. Giẫm lần 2 ở t=0.80, cùng y=5.01, nảy 20.0 → vỡ, object tắt. Người rơi tiếp xuống sàn y=3.015 |
| Gem tự đếm | 5 object trong scene | `GemsTotal = 5` không gõ tay |
| **S** nhặt hết → mở cửa | nhặt 4 bằng code + 1 bằng chạm thật | `gem 1/5 … 5/5` → `AllCollected` → sprite đổi `End_Pressed_0` → `End_Idle_5`, `IsOpen = true` |
| Vào cửa | chạy từ x=55 sang phải | `RoomCompleted = true` khi qua x≈58 |

## Vấp

### 1. Bộ đếm gem đứng im ở 0 dù gem biến mất — bug thứ tự

`Collectible.Take()` viết:

```csharp
Taken = true;              // ← đặt cờ trước
room.Collect(this);        // ← rồi mới báo phòng
```

`RoomState.Collect()` lại có guard `if (!gems.Contains(gem) || gem.Taken) return;` — **gem.Taken đã true** nên nó return ngay. Kết quả: 4 gem biến mất khỏi màn hình, `GemsCollected` vẫn 0, cửa không bao giờ mở.

Nguy hiểm ở chỗ nó **trông như chạy đúng**: gem biến mất, không có lỗi, không có exception. Chỉ lộ khi đọc bộ đếm.

Sửa: báo phòng trước, đặt cờ sau, thêm `if (Taken) return;` ở đầu hàm để vẫn chống nhặt hai lần.

→ **Đây là vấp đáng đưa vào bài nhất của chặng này.** Hai guard ở hai class cùng bảo vệ một bất biến, và thứ tự gọi quyết định cái nào thắng. Bài nên đưa cả đoạn code sai, để người đọc tự tìm.

### 2. Gem đặt ở vị trí mình tưởng là trên không, thực ra nằm trên bệ

Gem_1 ở (12, 8.4). Định test "nhảy lên lấy" nên đặt player ở (12, 5.4) — nhưng x 8–16 là bệ 1 (tile y 5–6), tức player spawn **bên trong bệ**. Không nhặt được.

Đặt lên mặt bệ (12, 8.02) thì đứng yên cũng chạm gem, vì collider người cao 1.7 (7.02–8.72) đã phủ gem ở 7.6–9.2.

→ Bài cần bảng toạ độ gem kèm "nằm trên cái gì". Và với bố cục hiện tại, 2 trong 5 gem lấy được mà không cần nhảy — nên đặt lại cho có thử thách khi viết bài.

### 3. `StompCheck` tách riêng ngay từ bài 09, không đợi bài 10

Viết thẳng phép kiểm tra vào `BreakableBox` thì bài 10 phải copy sang enemy, bài 11 copy lần nữa cho charger, bài 12 lần nữa cho boss. Tách thành static class từ đầu, có XML doc ghi rõ ai dùng.

Đây là quyết định có chủ đích để bài 10 chỉ cần một dòng `StompCheck.IsStomp(...)`.

### 4. Thùng không phải trigger — đứng lên được

`col.isTrigger = false` và dùng `OnCollisionEnter2D` chứ không `OnTriggerEnter2D`. Nghĩa là thùng là vật cản thật: đứng lên, đi đụng, đội đầu. Chỉ hướng giẫm mới phá.

Hệ quả nhỏ: đội đầu vào đáy thùng thì `OnCollisionEnter2D` vẫn chạy, `StompCheck` trả false (vy > 0), nên không vỡ. Đúng.

### 5. Chưa có gì nối RoomState với UI

`GemChanged` hiện chỉ có recorder nghe. Bài 14 mới có HUD. Trong lúc dựng phải `Debug.Log` để thấy — bài viết cần một HUD tối giản sớm hơn, hoặc ít nhất một dòng text.

## Ảnh cần chụp

- [x] `09_exit_open.png` — cúp vàng (End_Idle) + nhân vật, cờ checkpoint chưa bật
- [ ] Chuỗi 3 khung giẫm thùng: trước → Hit frame → Break
- [ ] Cửa khoá vs mở cạnh nhau (End_Pressed vs End_Idle)
- [ ] Scene view: gizmo collider thùng (không trigger) vs gem (trigger)
- [ ] Sơ đồ StompCheck: mũi tên vy xuống + chân trên đỉnh = giẫm; vy lên = đội đầu
- [ ] Console log `gem 1/5 … 5/5 → ALL COLLECTED`

## Ghi cho người viết bài

**Mở bài bằng `StompCheck`, không phải bằng gem.** Đây là luật mà bốn bài sau đều dùng. Cho người đọc thấy hai trường hợp sai kinh điển trước: giẫm trúng khi đang bay lên, và chết oan khi rõ ràng đã đạp đầu. Rồi mới viết hàm 4 dòng.

**Gem tự đăng ký là mẫu đáng dạy.** `GemsTotal` không phải số gõ trong Inspector — thêm hay xoá gem trong scene thì tổng tự đúng. Tránh được lỗi "đặt 6 gem nhưng total vẫn 5".

**Bug thứ tự ở mục vấp 1 nên thành một mục riêng trong bài**, kiểu "vì sao gem biến mất mà bộ đếm không nhúc nhích". Nó dạy hai thứ: guard trùng nhau giữa hai class, và chuyện "không có lỗi" không có nghĩa là đúng.

**`bounceVelocity` 20 < `JumpVelocity` 27.5 là quyết định thiết kế.** Giẫm thùng không thể thay cho một cú nhảy đầy đủ, nên không phá được câu đố độ cao. Bài 10 giẫm địch dùng cùng con số.

**Thùng là vật cản, gem là trigger** — nói rõ tiêu chí: thứ gì người chơi đứng lên được thì không trigger.

## Chưa làm, để chặng sau

- HUD hiện số gem → 14 (hoặc sớm hơn khi viết bài)
- Đặt lại vị trí gem cho cần nhảy mới lấy được
- Thùng loại 2, 3 (sprite 2_*, 3_*) — dùng khi có nhiều phòng
- `RoomState.ResetRoom()` viết rồi nhưng chưa ai gọi → 14

## Đính chính (2026-09-29, lúc chụp ảnh cho bài 09)

- Vị trí chốt (khớp scene cuối): Gem_1 (12, 8.5), Gem_2 (27, 13.4) sau Trap_B, Gem_3 (38, 18.5), Gem_4 (56.5, 5.5) sau cột phải, Gem_5 (30, 5.5). Gem collider r = 0.6 (không phải 0.8), layer `Pickup`, SpriteSequence 7 frame 10 fps.
- Thùng: layer `Ground`, pivot (0.5, 5/32), collider 1.375 × 1.375 offset (0, 0.6875), hitsToBreak 2 (mặc định trong code là 1).
- Cửa: layer `Interactable`, collider 2.5 × 3 offset (0, 1.75). Locked sprite là `End_Pressed_0`, frame bóng trắng của cúp.
- Đo lại bằng code bài 09 (lab `_TutorialStages/Stage09`, input thật từng đoạn): đi vào thùng dừng x 18.70; thùng ở Default + ô Player×Default tắt thì đi tới 20.5; thả từ y 7 chạm thùng sau 0.26 s, chân trên đỉnh 0.015, nảy cao 2.7; lần hai sau 0.52 s thì vỡ. Ngọc 5 nhảy thấp qua Box_2 (không cần nảy), ngọc 3 cần nhảy đôi từ bệ 2 (đỉnh 21.24), vượt cột: nhảy đôi từ bệ 3 lên đỉnh cột trái (23.015), nhảy thường sang cột phải. Cửa khoá khi 4/5, mở khi 5/5, "Qua phòng" ở x 57.18.
- Bản sai thứ tự `Taken` tái hiện được: 2 ngọc biến mất, GemChanged không phát lần nào sau 5 dòng đăng ký.
- Bài thêm `RoomLog` tạm (Platformer.Debugging) để thấy số đếm trước khi có HUD.

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/09/`.
