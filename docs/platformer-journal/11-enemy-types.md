# 11 — Địch phần 2: charger, cannon, flyer

Ngày dựng: 2026-09-19 · Scene `PLT_11_EnemyTypes`

## Mục tiêu

Ba kiểu hành vi khác hẳn nhau, dữ liệu tách ra ScriptableObject y như shmup #6, và đạn cannon đi qua `PrefabPool` viết từ shmup #4 — lần đầu code `_Common` chạy cho game thứ hai.

## Đã dựng

- `Scripts/Enemies/EnemyData.cs` → SO chứa collider, tốc độ, tầm nhìn, timing, và **6 mảng sprite** (idle/walk/charge/stun/attack/hit)
- `Scripts/Enemies/ChargerEnemy.cs` → state machine 4 trạng thái
- `Scripts/Enemies/CannonEnemy.cs` → đứng yên, bắn theo cooldown
- `Scripts/Enemies/FlyerEnemy.cs` → bay ngang + bob, bổ nhào khi người chơi đi phía dưới
- `Scripts/Enemies/Cannonball.cs` → đạn dùng `PooledObject` của `_Common`
- `Scripts/Debug/ChargerTracker.cs` → tool lab ghi timeline đổi trạng thái
- Prefab `Prefabs/Cannonball.prefab` + `CannonballPool` (prewarm 8, max 40) trong scene
- 3 asset trong `ScriptableObjects/Enemies/`

Charger state machine — **hình dạng do bộ sprite của pack quyết định**. Pack vẽ sẵn Idle, Walk, Charge, **Stun**, Hit. Có Stun nghĩa là tác giả thiết kế con này để bị trừng phạt sau cú lao hụt:

```
Walk ──thấy người──▶ Telegraph (0.5s, clip Idle)
                          │
                          ▼
                       Charge (11 u/s, bỏ qua mép vực)
                          │ đâm tường
                          ▼
                      Stunned (1.6s) ◀── CỬA SỔ DUY NHẤT giẫm được
                          │ hết giờ
                          ▼
                        Walk
```

## Số đã chốt

| | Charger | Cannon | Flyer |
|---|---|---|---|
| moveSpeed | 2.5 | 0 (đứng yên) | 3.5 |
| chargeSpeed | 11 | — | dive 12 |
| sightRange | 9 | 14 | dive range 7 |
| sightHeight | 3.5 | 2.5 | — |
| telegraph | 0.5 s | — | — |
| stun | 1.6 s | — | — |
| attackCooldown | — | 1.8 s | — |
| stompableOnlyWhenVulnerable | **true** | false | false |
| Đạn | — | speed 9, lifetime 4 s | — |

## Kết quả đo

Timeline từ `ChargerTracker`, người đứng trên bậc x=33, charger bắt đầu ở x=44 hướng trái:

```
Telegraph@t=0.01,x=44.00   Charge@t=0.53,x=44.00   Stunned@t=1.39,x=34.76   Walk@t=3.01,x=34.76
```

| Kiểm chứng | Tính toán | Đo được |
|---|---|---|
| Telegraph → Charge | 0.5 s | 0.53 − 0.01 = **0.52 s** |
| Quãng lao | 44.00 → vách bậc x=34 + nửa collider 0.8 + probe 0.08 ≈ 34.88 | dừng ở **34.76** |
| Tốc độ lao | chargeSpeed 11 | 9.24 u / 0.86 s = **10.7 u/s** |
| Stunned → Walk | 1.6 s | 3.01 − 1.39 = **1.62 s** |

| Test | Kết quả |
|---|---|
| Giẫm charger lúc **Stunned** | Nảy vy = **20.0**, địch chết ✓ |
| Chạm charger lúc **Walk/Charge** | Người chết ✓ (18 lần liên tiếp khi hồi sinh nằm trong đường lao) |
| Cannon | 8 phát trong 6 s, cooldown 1.8 s. Pool giữ đúng **8 object**, active 0 / inactive 8 sau khi đạn hết hạn — **không sinh thêm instance nào** |
| Flyer | Patrol quanh (30, 9) biên ±5, phát hiện người ở dưới 6 u → Dive → Return |

## Vấp

### 1. Hai layer trùng tên "Player" — bug ngốn nhiều thời gian nhất cả series

Charger không bao giờ đổi trạng thái. `ChargerTracker` cho timeline **rỗng hoàn toàn** dù nó đi tuần bình thường.

Nguyên nhân: project có **hai** layer tên "Player" — layer **6** (từ series shmup) và layer **12** (mình tự thêm ở chặng 02 vì code quét từ index 8 lên, không thấy nên tạo mới). Object Player nằm ở layer 12, nhưng `LayerMask.NameToLayer("Player")` trả về **6**. Mask thành `1<<6 = 64`, không khớp layer 12 ⇒ `OverlapBox` không bao giờ thấy người chơi.

Sửa: xoá layer 12, chuyển Player sang layer 6 có sẵn, và quét lại **mọi** `LayerMask` trong 10 scene platformer để đổi `1<<12` → `1<<6`.

→ Bài phải cảnh báo: khi thêm layer bằng tay, **kiểm tra tên đã tồn tại chưa** — kể cả ở các slot 0–7 mà code hay bỏ qua. Và `NameToLayer` luôn trả về slot **đầu tiên** trùng tên.

### 2. Raycast mảnh làm `sightHeight` thành code chết

Bản đầu dò người bằng `Physics2D.Raycast` ngang ở tầm mắt rồi mới so `sightHeight`. Tia mảnh ở y=2.85 trượt hẳn dưới người đứng trên bậc (collider y 4.02–5.72) ⇒ raycast không trúng ⇒ **phép so `sightHeight` không bao giờ chạy**.

Sửa: `Physics2D.OverlapBox` rộng `sightRange` × cao `sightHeight × 2`, rồi so dấu để chỉ tính thứ ở phía trước. Giờ `sightHeight` mới thật sự là tham số.

→ Đây là dạng bug "tham số trông như có tác dụng nhưng không". Đáng đưa vào bài kèm hình: tia mảnh vs vùng hộp.

### 3. `enabled = false` **không** làm người chơi bất tử

Tắt `PlayerLife.enabled` để quan sát địch mà không bị chết liên tục. Người vẫn chết: `Cannonball` gọi `life.Kill()` từ bên ngoài, và `GetComponentInParent<PlayerLife>()` **vẫn trả về component đang tắt**.

Sửa: thêm property `Invulnerable` thật, và `Kill()` kiểm tra `IsDead || Invulnerable || !enabled`.

→ Bài học tổng quát: tắt component chỉ ngăn Unity gọi `Update`/`FixedUpdate`, không ngăn code khác gọi method public. Và đây cũng là thứ gameplay thật cần — bất tử ngắn sau khi hồi sinh.

### 4. Charger spawn chồng vào tường

Đặt charger ở x=56 trong khi tường khe chiếm world x 54–56. Nửa collider 0.8 ⇒ mép trái ở 55.2, nằm trong tường. Nó thấy tường ngay, quay đầu, đi ngược. Phải chọn đoạn sàn trống đủ dài (x 35–47) mới quan sát được cú lao.

### 5. Charge cố ý **không** dừng ở mép vực

`TickCharge()` chỉ kiểm tra `WallAhead()`, bỏ `GroundAhead()`. Lao hụt là rơi — đó là phần thưởng cho người chơi biết dụ. Khác hẳn `TickWalk()` vẫn dò mép.

### 6. Vẫn phải viết tracker mới để đo

Đọc `transform.position` và `Current` qua MCP cho kết quả vô nghĩa (x nhảy 36.50 → 45.35 với dir=-1) vì mỗi lệnh mất vài giây, đủ để địch quay đầu hai lần. Lần thứ ba trong series phải viết tool đo bên trong Unity (`MotionRecorder` bài 02, `PatrolTracker` bài 10, `ChargerTracker` bài 11).

## Ảnh cần chụp

- [x] `11_cannon_fires.png`
- [ ] Sơ đồ state machine charger với 4 trạng thái + điều kiện
- [ ] Chuỗi 4 khung: Walk → Telegraph (đứng khựng) → Charge → Stunned
- [ ] Gizmo vùng nhìn: hộp `sightRange × sightHeight×2` vs tia mảnh cũ
- [ ] Inspector `EnemyData` của Charger với 6 mảng sprite
- [ ] Hierarchy `CannonballPool` lúc Play: 8 object con, vài cái active
- [ ] **Edit Layers** cho thấy chỉ còn một "Player" — sau khi dọn trùng
- [ ] Gizmo flyer: đường patrol ngang + tia dive xuống

## Ghi cho người viết bài

**Mở bài bằng bộ sprite, không bằng code.** Pack vẽ Idle/Walk/Charge/**Stun**/Hit cho charger. Có Stun tức là tác giả đã thiết kế sẵn cửa sổ trừng phạt. Đọc asset ra thiết kế là một kỹ năng đáng dạy.

**`stompableOnlyWhenVulnerable` là một dòng bool nhưng là cả một luật chơi.** Jumper ở bài 10 giẫm lúc nào cũng được; charger chỉ giẫm được sau khi nó tự đâm tường. Cùng `StompCheck`, khác điều kiện. Bài 12 boss dùng lại đúng cờ này.

**Cannonball là chỗ `_Common` trả công** — nói thẳng: `PrefabPool` và `PooledObject` viết ở shmup #4 cho đạn tàu vũ trụ, giờ chạy cho đạn thần công trong platformer, **không sửa một dòng**. Bằng chứng: pool giữ đúng 8 object suốt 17 phát bắn.

**Ba bug ở mục vấp 1–3 đều cùng một dạng**: thứ trông như đang chạy nhưng thật ra không. Layer sai tên vẫn compile; raycast trượt vẫn chạy; component tắt vẫn bị gọi. Bài nên gom thành một mục "ba cách code im lặng không làm gì".

**Charger là con đáng dạy nhất**, nên viết nó trước, cannon và flyer sau và ngắn hơn.

## Chưa làm, để chặng sau

- Boss Brute → 12 (dùng lại `stompableOnlyWhenVulnerable`)
- Bất tử ngắn sau hồi sinh (đã có `Invulnerable`, chưa gắn vào `DeathRoutine`)
- Flyer đẩy được người chơi khi va chạm — nên đổi collider flyer thành trigger
- Âm thanh, hiệu ứng chết → 13
