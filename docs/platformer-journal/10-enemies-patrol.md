# 10 — Địch phần 1: tuần tra và giẫm đầu

Ngày dựng: 2026-09-19 · Scene `PLT_10_Enemies`

## Mục tiêu

Địch đi tuần trên bệ, tới mép thì quay đầu chứ không rơi. Giẫm từ trên thì chết và nảy người lên; chạm bất kỳ hướng nào khác thì người chết.

## Đã dựng

- `Scripts/Enemies/PatrolEnemy.cs` → `Journal/10_PatrolEnemy.cs.txt`
- `Scripts/Debug/PatrolTracker.cs` → tool lab, ghi min/max X và mọi lần đổi hướng để đối chiếu với biên hình học
- Layer `Enemy` (8)
- 3 địch trong scene: `Enemy_Jumper1_A` (bệ 1), `Enemy_Jumper1_B` (bệ 2), `Enemy_Jumper2_A` (sàn)

Địch dùng **Rigidbody2D Kinematic + MovePosition**, không phải Dynamic. Lý do: không cần trọng lực (nó không bao giờ rơi), và Dynamic thì người chơi đẩy được nó khỏi bệ.

Hai cảm biến, cả hai nhìn về phía đang đi:

| Cảm biến | Cách dò | Để làm gì |
|---|---|---|
| `GroundAhead()` | Raycast xuống từ mép trước + 0.2, sâu 0.6 | Không còn sàn ⇒ quay đầu (không rơi khỏi bệ) |
| `WallAhead()` | OverlapBox 0.12 × 1.2 ngay trước mép | Gặp tường ⇒ quay đầu |

## Số đã chốt

| Thông số | Giá trị |
|---|---|
| speed | 3 u/s |
| probeAhead / probeDepth | 0.2 / 0.6 u |
| wallBox | 0.12 × 1.2 |
| turnDelay | 0.1 s |
| bounceVelocity | 20 u/s (bằng thùng gỗ bài 09) |
| deathLinger | 0.35 s (Hit 5 frame @20fps = 0.25 s) |
| Collider địch | 1.6 × 1.7, offset (0, −0.15) |
| **Độ cao đặt địch** | y = mặt sàn + 1.0 |

## Kết quả đo

`PatrolTracker` sau vài chục giây:

| Địch | Bệ (world) | Range đo được | Điểm quay | Kỳ vọng |
|---|---|---|---|---|
| Jumper1_A | 8.0 → 17.0 | 8.96 → 16.04 | **9.02** →R, **15.98** →L | 9.0 và 16.0 |
| Jumper1_B | 20.0 → 29.0 | 20.96 → 28.04 | **21.02** →R, **27.98** →L | 21.0 và 28.0 |
| Jumper2_A | sàn, chặn bởi bậc x=34 và tường khe x=48 | 34.00 → 47.08 | **34.96** →R, **47.02** →L | 35.0 (bậc) và 47.0 (tường) |

Công thức điểm quay: `mép bệ ± (nửa collider 0.8 + probeAhead 0.2)` = mép ± 1.0. Sai số đo ≤ 0.04 u = dưới một bước 0.06 u/step. Địch C chứng minh cả hai cảm biến: bên trái quay vì **tường** (bậc x 32–34 cao tới y=4), bên phải quay vì **tường** khe.

| Test | Kịch bản | Kết quả |
|---|---|---|
| **T** giẫm | thả người từ y=9 thẳng xuống đầu địch C | Nảy ở t=0.28, y=4.71, **vy = 20.0**. Địch tắt. `Deaths` = 0 |
| **U** chạm ngang | đứng trên bệ 1, chạy ngang vào địch A | Người chết ở x=12.77, teleport về Spawn ở t=0.88. **Địch còn sống** |

## Vấp

### 1. Địch đặt sai độ cao thì rung tại chỗ, không đi

Đặt `Enemy_Jumper2_A` ở y=4.5 trong khi mặt sàn ở y=2. Đáy collider ở 3.5, probe dò xuống tới 2.9 — **hụt sàn**. `GroundAhead()` luôn false ⇒ `Direction` đảo **mỗi FixedUpdate** ⇒ địch đứng im rung 50 lần/giây. Đọc `x` hai lần cách nhau vài giây đều ra 34.00.

Hai sửa:

- **Vị trí:** đáy collider phải chạm mặt sàn. Với collider 1.7 cao, offset −0.15: `y = mặt sàn + 1.0`. Sàn y=2 → 3.0; bệ 1 y=7 → 8.0; bệ 2 y=12 → 13.0.
- **Code:** thêm `turnDelay` 0.1 s giữa hai lần quay. Không sửa được lỗi đặt sai, nhưng biến "rung vô hình" thành "đi qua đi lại ngắn" — dễ nhận ra hơn nhiều.

→ Bài phải có công thức tính độ cao đặt địch, kèm ảnh gizmo probe chạm/không chạm sàn. Đây là lỗi người đọc chắc chắn gặp khi kéo địch vào scene bằng chuột.

### 2. Đọc `transform.position` qua MCP không đủ để kết luận địch đi đúng

Ba lần đọc rời rạc cho ra 11.72 → 12.20 với `dir = -1`, nhìn như địch đi ngược hướng. Thực ra giữa hai lệnh đã trôi vài giây, đủ để nó quay đầu hai lần.

Phải viết `PatrolTracker` ghi min/max + mọi lần đổi hướng ngay trong Unity mới kết luận được. Cùng bài học với `MotionRecorder` ở bài 02: **đo bên trong, không đo bằng cách hỏi từ ngoài.**

### 3. `OnCollisionEnter2D` và `OnTriggerEnter2D` cùng gọi `Touch()`

Địch là Kinematic + collider **không trigger**, người là Dynamic. Va chạm giữa chúng đi qua `OnCollisionEnter2D`. Nhưng nếu sau này đổi địch thành trigger (bài 11 có địch bay xuyên tường) thì `OnTriggerEnter2D` mới chạy. Nối cả hai vào một hàm để không phải nhớ.

### 4. Giẫm ở độ cao khác nhau vẫn cùng `bounceVelocity`

Test T nảy ở y=4.71 với vy = 20.0 — bằng đúng lúc giẫm thùng ở bài 09. Cố ý: nảy là hằng số, không phụ thuộc rơi từ bao cao. Rơi càng cao nảy càng mạnh thì người chơi không đoán được.

## Ảnh cần chụp

- [x] `10_patrol.png` — địch trên bệ 1
- [ ] **Scene view gizmo**: raycast dò sàn (cyan) chạm mép bệ + wallBox (đỏ) — ảnh quan trọng nhất
- [ ] Ảnh đối chiếu: địch đặt đúng độ cao vs đặt cao 0.5 u (probe hụt)
- [ ] Chuỗi 3 khung giẫm: rơi xuống → Hit frame → địch biến mất, người nảy lên
- [ ] Chuỗi chạm ngang: chạy vào → người biến mất → địch vẫn đi
- [ ] Console `PatrolTracker.Report()` với danh sách điểm quay

## Ghi cho người viết bài

**Mở bài bằng câu hỏi "vì sao địch không rơi khỏi bệ".** Đó là thứ người mới không nghĩ tới cho tới khi thấy con địch đầu tiên lao xuống vực. Rồi giới thiệu raycast dò sàn phía trước.

**`StompCheck` từ bài 09 dùng lại nguyên vẹn** — bài chỉ cần một dòng. Nói rõ: cùng luật đã phá thùng gỗ giờ giết địch, và bài 11–12 sẽ dùng tiếp. Đây là chỗ trả công cho quyết định tách static class ở bài 09.

**Kinematic vs Dynamic là quyết định đáng giải thích.** Người đọc vừa học ở bài 02 rằng player dùng Dynamic vì cần trọng lực. Địch này không cần, và Dynamic còn cho phép người chơi ủi nó đi. Đối lập trực tiếp trong cùng một project.

**Công thức độ cao đặt địch phải ở trong bài, không phải trong đầu người viết.** `y = mặt sàn + nửa chiều cao collider + |offset|`. Kèm bảng cho ba mặt sàn của phòng.

**Verify bằng số:** bật `PatrolTracker`, chạy 30 giây, điểm quay phải bằng `mép bệ ± 1.0`. Người đọc không có tracker thì dùng gizmo: probe phải rời khỏi mép bệ đúng lúc địch quay.

## Chưa làm, để chặng sau

- Charger, Cannon, Flyer + `EnemyData` ScriptableObject → 11
- Địch dùng `PrefabPool` của `_Common` → 11 (cannonball)
- Animation Jump/Fall của Jumper (pack có sẵn) chưa dùng — địch hiện chỉ đi bộ
- Âm thanh giẫm → 13
