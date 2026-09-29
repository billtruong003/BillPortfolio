# 13 — Juice: rung màn hình, chớp sáng, âm thanh

Ngày dựng: 2026-09-19 · Scene `PLT_13_Juice`

## Mục tiêu

Thêm lớp phản hồi cho toàn bộ những thứ đã dựng ở 12 chặng trước, và làm sao cho lớp đó **gắn từ bên ngoài**: tắt nó đi thì phòng vẫn chạy đúng mọi luật, chỉ là im lặng.

Đây cũng là chỗ trả lời câu hỏi treo từ chặng 05: rung màn hình và camera clamp có sống chung được không.

## Đã dựng

- `_Common/Scripts/FX/CameraShake.cs` và `PooledParticle.cs` — **chuyển từ `_ShootEmUp` sang `_Common`**, đổi `namespace ShootEmUp.FX` → `BillLab.Common.FX`. Giữ nguyên file `.meta` nên GUID không đổi, scene shmup không mất reference. Compile lại: **0 lỗi**.
- `_Platformer/Scripts/Common/SpriteFlash.cs` → `Journal/13_SpriteFlash.cs.txt`
- `_Platformer/Scripts/Core/GameFeel.cs` → `Journal/13_GameFeel.cs.txt`
- `_Platformer/Scripts/Debug/JuiceProbe.cs` → `Journal/13_JuiceProbe.cs.txt` (tool lab)
- `_Platformer/Audio/SFX/` — 5 file wav tự sinh: `sfx_jump`, `sfx_land`, `sfx_gem`, `sfx_stomp`, `sfx_death`
- Scene: `CameraShake` gắn lên **Main Camera**, `SpriteFlash` lên `Boss_Brute`, object `GameFeel` (AudioSource + GameFeel + JuiceProbe)

Kiến trúc hai tầng camera, nối tiếp chặng 05:

```
CameraRoot   ── CameraFollow ghi WORLD position ── clamp vào RoomBounds
   └── Main Camera ── CameraShake ghi LOCAL position ── offset ngẫu nhiên
```

Hai script ghi hai thứ khác nhau nên không tranh nhau, và clamp luôn là người nói câu cuối. Bù lại, offset của shake **nằm ngoài** clamp — nên clamp phải chừa sẵn lề. Đó là `shakeMargin = 0.35` viết từ chặng 05, giờ mới có dịp đo.

## Số đã chốt

| Sự kiện | strength | duration | Vì sao |
|---|---|---|---|
| Tiếp đất mạnh | 0.10 | 0.12 s | Chỉ để cảm được trọng lượng |
| Giẫm địch / phá hộp | 0.18 | 0.15 s | Đủ để thấy "trúng" |
| Chết | 0.30 | 0.30 s | Dài hơn, dừng nhịp lại |
| Boss trúng đòn | **0.32** | 0.25 s | Mạnh nhất trong game |
| `shakeMargin` (bài 05) | **0.35** | — | Phải ≥ cú rung mạnh nhất |

`hardLandSpeed = 18 u/s` — dưới ngưỡng này thì tiếp đất chỉ có tiếng, không rung.

## Kết quả đo

### Rung có lộ ra ngoài phòng không

`JuiceProbe` đặt người chơi sát mép phải phòng (phòng 64 × 36, khung nhìn 32 × 18 ⇒ camera bị clamp cả hai trục), bắn 5 cú rung tăng dần, đo **từng frame trong Unity** xem hình chữ nhật camera thò ra ngoài `RoomBounds` bao nhiêu:

| strength đặt | offset thực đo được | thò ra ngoài phòng |
|---|---|---|
| 0.10 | 0.062 | **0.000** |
| 0.18 | 0.145 | **0.000** |
| 0.30 | 0.244 | **0.000** |
| 0.32 | 0.265 | **0.000** |
| 0.60 | 0.477 | 0.003 |

Kết luận: mọi cú rung có trong game (mạnh nhất 0.32) đều nằm gọn trong lề 0.35. Vượt lề thì lộ — 0.60 rò ra 0.003 u. Lần chạy trước, ở góc dưới-trái, cùng strength 0.60 rò tới **0.198 u** — hơn 3 pixel ở PPU 16, nhìn thấy rõ.

Chú ý cột giữa: offset thực **luôn nhỏ hơn** strength đặt. `Random.insideUnitCircle` cho bán kính ngẫu nhiên ≤ 1, lại nhân thêm falloff tuyến tính, nên strength là **trần** chứ không phải biên độ. Vì vậy con số rò rỉ mỗi lần chạy một khác.

### Đếm sự kiện

`EnemiesBound = 9` = 3 jumper + 1 charger + 1 flyer + 1 cannon + 1 boss + 2 hộp. Tự bắt hết, không sửa một dòng nào trong các script địch.

Nhảy và tiếp đất, đo qua `MotionRecorder` của bài 02:

| Test | Chiều cao | Tốc rơi lúc chạm đất | Tiếng nhảy | Rung tiếp đất |
|---|---|---|---|---|
| Giữ nút 0.4 s | 5.22 u | 32.0 u/s | ✓ | ✓ |
| Gõ nhẹ 0.03 s (jump cut) | 1.22 u | 13.8 u/s | ✓ | **không** |

Cú gõ nhẹ rơi chậm hơn ngưỡng 18 nên chỉ có tiếng, không rung — đúng thiết kế.

Chuỗi sự kiện đầy đủ, chạy trong Play:

```
start:       shake=0  boss=0  stomp=0
gem:         shake=0  boss=0  stomp=0   last=0.00   ← nhặt ngọc chỉ có tiếng
stomp enemy: shake=1  boss=0  stomp=1   last=0.18
boss hit 1:  shake=2  boss=1  stomp=1   last=0.32   (hp 3→2)
boss hit 2:  shake=3  boss=2  stomp=1   last=0.32   (hp 2→1)
boss hit 3:  shake=4  boss=3  stomp=1   last=0.32   (hp 1→0)
death:       shake=5  boss=3  stomp=1   last=0.30
```

## Vấp

### 1. Cú đánh trúng boss đầu tiên bị nuốt mất

`GameFeel` nghe `BossBrute.HealthChanged(current, max)` và chỉ rung khi máu **giảm**. Cần biết máu trước đó là bao nhiêu. Bản đầu dùng sentinel: `bossHealth = -1`, sự kiện đầu tiên coi như lúc spawn, bỏ qua.

Kết quả: giẫm boss ba lần nhưng chỉ rung **hai** lần. Lần đầu bị coi là "lúc spawn".

Sửa lần một: đọc thẳng `b.Health` lúc subscribe trong `OnEnable`. Vẫn sai — đo ra `bossHealth = 0` trong khi `boss.Health = 3`, và bộ đếm `BossEvents = 0` cho thấy thông báo máu đầy lúc boss bật lên **chưa từng tới nơi**.

Sửa lần hai, đúng: đọc trong `Start()`.

```csharp
private void Start()
{
    if (boss != null) bossHealth = boss.Health;
}
```

`Start` chạy sau **mọi** `Awake` và `OnEnable` của scene, nên không phụ thuộc thứ tự nữa. Thêm nữa, luật "chỉ giảm mới tính" tự nó chịu được cả hai thứ tự:

```csharp
if (current >= bossHealth) { bossHealth = current; return; }   // spawn, reset → bỏ qua
```

→ **Đáng đưa vào bài.** Thứ tự `Awake`/`OnEnable` giữa hai object trong scene không phải thứ được phép giả định. Mình đọc boss quá sớm ra 0, rồi cú trúng đòn đầu tiên trông như máu **tăng** từ 0 lên 2, và lớp phản hồi im lặng đúng theo luật. Không có exception, không có log — chỉ thiếu một cú rung. Đây là dạng bug "code im lặng không làm gì" thứ tư của series (ba cái kia ở bài 11).

### 2. `HitFlash` của shmup không chuyển sang `_Common` được

`CameraShake` và `PooledParticle` chuyển sạch. `HitFlash` thì không: nó có `using ShootEmUp.Combat;` và `[RequireComponent(typeof(SpriteRenderer), typeof(Health))]`. `_Common` không được phép tham chiếu ngược lên assembly của một game cụ thể.

Viết `SpriteFlash` thay thế, bỏ hẳn phần biết về máu: ai gọi thì nó chớp, thế thôi. Dùng `MaterialPropertyBlock` cho `_FlashAmount`, nếu material không có property đó thì đổi tạm `sr.color`.

→ Bài học về ranh giới assembly: thứ chuyển sang `_Common` được là thứ **không biết gì về game**. `HitFlash` trông như một hiệu ứng thuần tuý nhưng thực ra đã bị buộc vào hệ thống máu từ lúc viết.

### 3. Dịch chuyển `transform.position` của Rigidbody2D Dynamic không ăn

`JuiceProbe.Begin()` đặt người chơi ra sát mép phải phòng bằng `player.position = ...`. Đo lại thấy người vẫn đứng ở chỗ cũ (6.00, 3.02) — physics step kế tiếp ghi đè lại.

Sửa: ghi cả `rb.position` và xoá `linearVelocity`.

May là lần chạy hỏng đó vẫn có ích: người chơi ở nguyên chỗ spawn thì camera bị clamp ở **góc dưới-trái** — cũng là trường hợp hai trục cùng chạm giới hạn, và chính lần đó bắt được con số rò 0.198.

### 4. Pack không có âm thanh

CraftPix chỉ có hình. Tự sinh 5 file wav bằng script Python ngoài project: sóng vuông + nhiễu + envelope mũ, 44.1 kHz mono 16-bit, có attack 3 ms để không bị "tách" ở đầu. Import với `DecompressOnLoad` + PCM vì file ngắn.

Không phải âm thanh hay, nhưng đủ để **chỉnh nhịp**: nghe được thì mới biết tiếng tiếp đất trễ bao nhiêu so với hình.

### 5. Lại phải đo bên trong Unity

Cú rung kéo dài 0.15 s. Một lệnh MCP mất vài giây. Đọc `transform.position` từ ngoài để kiểm tra rung là vô nghĩa. Lần thứ tư trong series phải viết tool đo bên trong (`MotionRecorder` bài 02, `PatrolTracker` bài 10, `ChargerTracker` bài 11, `JuiceProbe` bài 13).

Ảnh chụp cũng vậy: hướng rung là ngẫu nhiên, canh đúng khung hình lộ ra khoảng trống là chuyện may rủi. Nên số liệu là bằng chứng chính, ảnh chỉ để minh hoạ.

## Ảnh cần chụp

- [x] `13_room_edge_shake.png` — đứng sát mép phải phòng, đang rung 0.32: **không lộ khoảng trống**
- [ ] Sơ đồ hai tầng CameraRoot / Main Camera, ghi rõ ai ghi WORLD ai ghi LOCAL
- [ ] Hình đối chiếu: cùng vị trí, rung 0.32 (kín) vs rung 0.9 (lộ viền đen ngoài tilemap)
- [ ] Inspector `GameFeel` với 4 cặp strength/duration và 5 clip
- [ ] Bảng số đo của `JuiceProbe` trong Console
- [ ] Boss lúc `SpriteFlash` đang chớp trắng
- [ ] Sơ đồ luồng: gameplay phát sự kiện → GameFeel nghe → CameraShake + AudioSource

## Ghi cho người viết bài

**Mở bài bằng câu "không sửa một dòng nào trong 12 bài trước".** Đó là điểm mạnh nhất của chặng này. `PatrolEnemy` có `Killed`, `RoomState` có `GemChanged`, `PlayerLife` có `Died`, `BossBrute` có `HealthChanged`, `PlayerMotor` có `LastJumpAt` và `IsGrounded` — tất cả viết từ trước, không hề biết `GameFeel` sẽ tồn tại. Lớp juice gắn vào từ ngoài hoàn toàn. Nếu bài 09–12 không viết event thì bài 13 sẽ phải đi sửa từng file.

**Chỗ này nên nói rõ vì sao dùng event chứ không gọi thẳng.** Cách "dễ" là cho `PatrolEnemy.Die()` gọi `GameFeel.OnStomp()`. Làm thế thì địch phải biết lớp phản hồi tồn tại, và tắt juice đi là gãy game. Có event thì tắt component là xong.

**`shakeMargin` là một hợp đồng, nên dạy đúng như hợp đồng.** Một bên hứa "rung không quá 0.32", bên kia chừa 0.35. Bảng số ở trên cho thấy hợp đồng giữ được, và vi phạm thì hậu quả thấy ngay. Đây là ví dụ hiếm hoi mà một con số magic có thể **chứng minh** được thay vì chỉnh tay cho tới khi thấy ổn.

**`hardLandSpeed` là ví dụ tốt về "juice có ngưỡng".** Rung mọi lần tiếp đất thì màn hình giật liên tục, mệt mắt. Chỉ rung khi rơi đủ nhanh thì cú rung mới mang nghĩa. Số liệu hai cú nhảy ở trên minh hoạ chính xác điều đó.

**Vấp số 1 nên viết dài.** Nó không phải lỗi cú pháp, không có exception, chỉ thiếu một cú rung — đúng kiểu bug mà người đọc sẽ gặp và bỏ qua. Và cách chẩn đoán đáng dạy: thêm bộ đếm sự kiện (`BossEvents`) để phân biệt "không nhận được sự kiện" với "nhận được nhưng bị lọc".

**Phần `_Common` nên nối thẳng với bài 11.** Bài 11 đã chứng minh `PrefabPool` chạy cho game thứ hai. Bài 13 bổ sung mặt còn lại: `CameraShake` chuyển sang được, `HitFlash` thì không, và lý do phân biệt là **có biết gì về game hay không**.

## Chưa làm, để chặng sau

- Thanh máu boss + HUD đếm ngọc → 14
- Hạt bụi lúc tiếp đất / nổ lúc giẫm (`PooledParticle` đã nằm sẵn trong `_Common`) → 14
- Nhạc nền → 14
- Hitstop (đứng hình vài frame lúc trúng đòn) — cân nhắc, dễ thành khó chịu
- Xoá `JuiceProbe`, `MotionRecorder`, `PatrolTracker`, `ChargerTracker` trước khi build → 14

## Đính chính (2026-09-29, lúc chụp ảnh cho bài 13)

- `SpriteFlash.fallbackColor` trắng không làm gì với Sprite-Unlit-Default (shader nhân màu, sprite vốn trắng): boss không hề chớp. Đổi mặc định thành (1, 0.35, 0.35), đã sửa giá trị trong PLT_13_Juice và PLT_14_Level3.
- `PlayerLife.GraceUntil` (bài 08) chưa ai đọc. `GameFeel` thêm `Blink()`: trong thời gian bất tử đổi alpha sprite người chơi 0.3 ↔ 1 mỗi 0.08 s (`blinkPeriod` 0.16, `blinkAlpha` 0.3). Đổi alpha chứ không bật tắt `enabled` vì `PlayerLife` dùng `enabled` lúc chết.
- Đo lại (lab `_TutorialStages/Stage13`, spawn ở góc dưới trái): rung 0.10/0.18/0.30/0.32 thò ra ngoài phòng 0.000; 0.60 thò 0.105, 0.068, 0.013 ở ba lần chạy. Nhảy đầy cao 5.22, rơi 31.6 u/s → rung; gõ 0.03 s cao 1.22, rơi 13.75 → không rung. Nhấp nháy 7 lần trong 1.2 s. Đánh boss bằng input thật: BossEvents 3, BossShakes 3, EnemiesBound 7.

Ảnh và CSV: `D:/Projects/Tutorial/TutorialShots/13/`.
