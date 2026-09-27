# 12 — Boss: con Brute

Ngày dựng: 2026-09-19 · Scene `PLT_12_Boss`

## Mục tiêu

Một trận đấu thắng bằng kỹ năng di chuyển chứ không bằng chỉ số. Nhân vật **không có animation tấn công** trong pack, nên cả trận phải giải được bằng chạy, nhảy, giẫm.

## Đã dựng

- `Scripts/Enemies/BossBrute.cs` → `Journal/12_BossBrute.cs.txt`
- `ScriptableObjects/Enemies/Enemy_Brute.asset` — ô sprite **72×48**, collider 2.6 × 2.6 — ⚠️ **sai, xem [chặng 15](15-audit-pivot-collider-layer.md)**: thân Brute chỉ 1.69 × 1.63 u và nằm lệch phải trong ô, collider đã sửa thành 1.70 × 1.60
- Đấu trường: gỡ tường khe phải (x 54–55), dựng vách mới ở x 50–51 cao tới y=20 ⇒ sân kín **x 52–61**, hai vách hai đầu
- `Boss_Brute` tại (58, 3.5)

Vòng trận:

```
Idle ──thấy người──▶ Telegraph (0.9s, clip Idle — đứng khựng, báo hiệu)
                          │
                          ▼
                     Charge (13 u/s, clip Run_Attack)
                          │ đâm vách
                          ▼
                     Recover (1.8s, clip Run tại chỗ) ◀── CỬA SỔ giẫm
                          │ hết giờ, quay đầu
                          ▼
                     Telegraph …

bị giẫm → Hurt (0.8s) → quay đầu → Telegraph, nhanh hơn
```

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| maxHealth | 3 | Ba lần giẫm |
| chargeSpeed | 13 u/s | Nhanh hơn người chơi (9) — không chạy thoát được, phải nhảy |
| telegraphSeconds | 0.9 s | Đủ dài để phản ứng lần đầu |
| recoverSeconds | 1.8 s | Cửa sổ giẫm |
| hurtSeconds | 0.8 s | Khựng sau khi trúng đòn |
| **rampPerHit** | **0.75** | Mỗi lần trúng, telegraph và recover × 0.75 |
| bounceVelocity | 22 | Cao hơn địch thường (20) |
| stompableOnlyWhenVulnerable | true | Dùng lại cờ từ bài 11 |

Nhịp trận theo ramp:

| | Telegraph | Recover |
|---|---|---|
| Chưa trúng | 0.90 s | 1.80 s |
| Sau 1 hit | 0.68 s | 1.35 s |
| Sau 2 hit | 0.51 s | 1.01 s |

## Kết quả đo

| Bước | Kết quả |
|---|---|
| Vòng Idle → Telegraph → Charge → Recover | chạy đúng, boss lao qua lại giữa hai vách |
| Giẫm lúc **Recover** | HP 3 → 2 → 1 → 0, mỗi lần nảy **vy = 22.0** |
| Sau hit thứ 3 | `state = Dead`, `Defeated` phát, collider tắt |
| Chạm lúc Telegraph/Charge | người chết |

## Vấp

### 1. CompositeCollider2D giữ hình học cũ sau khi xoá tile bằng code — bug tốn nhiều thời gian nhất chặng này

Xoá tile tường khe ở x 54–55 bằng `tm.SetTile(..., null)` + `RefreshAllTiles()` + `CompressBounds()` + `comp.GenerateGeometry()`, lưu scene. Tilemap báo **không còn tile nào** ở x 52–58. Nhưng `Physics2D.OverlapBox` tại x = 54, 55, 56 **vẫn HIT** `Tilemap_Ground`.

Hậu quả: boss lao được đúng 0.52 u rồi "đâm tường vô hình" và vào Recover ngay. Nhìn như lỗi logic charge, thực ra là collider ma.

Nguyên nhân: `TilemapCollider2D` không tự đánh dấu dirty khi tile bị xoá bằng script, nên `GenerateGeometry()` gộp lại từ shape cũ.

Sửa: **bật tắt `TilemapCollider2D`** rồi mới `GenerateGeometry()`:

```csharp
tc.enabled = false;
tc.enabled = true;
comp.GenerateGeometry();
Physics2D.SyncTransforms();
```

Sau đó probe tại x = 54, 56, 58, 61 đều trống, x = 51, 52, 62 vẫn là vách.

→ **Đáng đưa vào bài** dù người đọc sửa map bằng Tile Palette (Editor tự rebuild). Nhưng bất kỳ ai sửa tilemap lúc runtime — cửa phá được, khối rơi, đường bí mật — sẽ dính. Và cách chẩn đoán đáng dạy: tilemap bảo trống nhưng physics bảo có, thì tin physics và đi tìm ai chưa rebuild.

### 2. Ô sprite Brute 72×48 lần nữa gây nhầm

Lần đầu gặp ở chặng 00 (cắt sheet). Lần này là collider: thói quen đặt vuông 1.6 × 1.7 như địch thường làm boss bé hơn hình. Đặt 2.6 × 2.6 mới khớp thân.

> **Kết luận này sai.** Chặng 15 đo alpha từng clip và thấy thân Brute chỉ rộng 27 px, cao 26 px, **tâm ở 48.5 px** chứ không phải 36 px giữa ô. 2.6 × 2.6 không phải "khớp thân", nó chỉ đủ to để che cả phần trống dành cho tầm vung đòn đánh — và vẫn lệch trái 0.78 u.

### 3. Recover dùng clip `Run` đứng tại chỗ

Pack không có clip "mệt/choáng" cho Brute (khác Charger có `Stun`). Dùng `Run` nhưng không di chuyển: chân chạy mà người đứng yên, đọc ra như đang hụt hơi. Giải pháp đủ dùng, và là ví dụ tốt cho việc **thiết kế trong giới hạn của asset**.

### 4. Boss quay đầu sau mỗi lần lao, kể cả khi người chơi ở phía sau

`Recover` hết giờ là `Direction = -Direction` vô điều kiện. Nghĩa là boss luôn lao qua lại giữa hai vách, không đuổi theo người chơi. Cố ý: pattern đoán được, người chơi học được nhịp. Nếu cho nó quay về phía người chơi thì trận đấu thành rượt đuổi, mất chỗ đứng an toàn.

### 5. Lại phải nới số để test

`recoverSeconds` 1.8 → 10 để giẫm không phụ thuộc canh giờ qua MCP. Lần thứ hai dùng thủ thuật này (bài 11 nới `stunSeconds`). Nhớ trả lại giá trị gốc — đã trả.

## Ảnh cần chụp

- [x] `12_boss_defeated.png`
- [ ] Sơ đồ vòng trận 5 trạng thái + điều kiện + thời lượng theo ramp
- [ ] Chuỗi 4 khung: Telegraph (đứng khựng) → Charge → đâm vách → Recover
- [ ] Gizmo collider boss: đỏ khi Charge, xanh khi Recover
- [ ] Đấu trường nhìn toàn cảnh: hai vách, boss ở giữa
- [ ] Thanh máu boss — **chưa dựng**, để bài 14
- [ ] Ảnh đối chiếu collider ma: Scene view không thấy tile nhưng gizmo composite vẫn có vách

## Ghi cho người viết bài

**Mở bài bằng giới hạn, không bằng boss.** Nhân vật không có đòn đánh. Với đa số người đọc, "boss" nghĩa là bào máu bằng vũ khí. Ở đây giới hạn của pack ép ra thiết kế tốt hơn: boss phải **tự đặt mình vào thế hở**. Đó là lý do vòng trận có Telegraph và Recover.

**Ba con số làm nên trận đấu**: telegraph (thời gian phản ứng), chargeSpeed > moveSpeed người chơi (không chạy thoát được), recover (cửa sổ trừng phạt). Bài nên cho người đọc chỉnh từng số và cảm nhận: telegraph 0.3 thành bất công, recover 4 thành nhàm.

**`rampPerHit` là cách tăng độ khó không cần đổi luật.** Không thêm chiêu, không thêm máu — chỉ bóp thời gian. Người chơi cảm thấy boss "nổi điên" nhưng vẫn đoán được pattern.

**Boss tái dùng toàn bộ**: `StompCheck` (bài 09), `stompableOnlyWhenVulnerable` (bài 11), `SpriteSequence` (bài 08), `EnemyData` (bài 11). Bài 12 gần như không có khái niệm mới — chỉ ráp lại. Nên nói rõ điều đó, nó là phần thưởng cho 11 bài trước.

**Bug collider ma nên thành một mục riêng** với cách chẩn đoán từng bước: tilemap nói gì, physics nói gì, ai chưa rebuild.

## Chưa làm, để chặng sau

- Thanh máu boss (bộ GUI có sẵn) → 14
- Cửa phòng boss đóng lại khi vào → 14
- Rung màn hình khi boss đâm vách → 13
- Âm thanh telegraph/charge/hit → 13
