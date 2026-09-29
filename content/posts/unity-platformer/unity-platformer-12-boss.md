---
title: "Platformer #12: Boss thắng bằng chân, không bằng vũ khí"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 12
excerpt: "Nhân vật không có đòn đánh, nên boss phải tự đặt mình vào thế hở: khựng lại, lao tới, đâm vách, thở dốc. Ba lần giẫm, nhịp nhanh dần sau mỗi lần trúng. Collider đặt theo thân chứ không theo ô 72 pixel, và một lỗi làm người chơi chết ngay sau cú giẫm trúng."
coverImage: "/images/posts/unity-platformer/12/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Boss", "State Machine", "Tutorial"]
published: true
featured: false
---

Bộ art không vẽ động tác tấn công nào cho nhân vật. Không chém, không bắn, chỉ chạy, nhảy và giẫm. Với đa số người chơi, đánh boss nghĩa là bào máu nó bằng vũ khí. Ở đây không có vũ khí, nên cách duy nhất để thắng là giẫm lên đầu nó.

Giới hạn này ép ra một thiết kế tốt hơn: boss không thể lúc nào cũng nguy hiểm, vì như vậy người chơi không có cách nào chạm vào nó mà sống. Boss phải tự đặt mình vào thế hở. Nó báo trước, dồn hết sức vào một cú lao, đâm vào vách, và đứng thở dốc một lúc. Khoảnh khắc thở dốc đó là cơ hội duy nhất của người chơi.

![Bốn khung trận đấu: boss khựng lại báo hiệu, lao tới với chiếc lưỡi quét ra, đâm vách và đứng thở dốc trong lúc người chơi nhảy lên, người chơi giẫm trúng và boss chớp trắng](/images/posts/unity-platformer/12/boss-cycle.webp)

## Vòng trận

Boss có sáu trạng thái:

| Trạng thái | Làm gì | Bao lâu | Chạm vào thì |
|---|---|---|---|
| `Idle` | Đứng chờ người chơi vào phòng | tới khi thấy người | chết |
| `Telegraph` | Đứng khựng, báo sắp lao | 0.9 giây | chết |
| `Charge` | Lao về phía trước 13 unit/giây | tới khi đâm vách | chết |
| `Recover` | Đứng thở dốc sau cú đâm | 1.8 giây | **giẫm được** |
| `Hurt` | Chớp trắng sau khi bị giẫm | 0.8 giây | không sao |
| `Dead` | Nằm xuống | | không sao |

Hết `Recover` hay hết `Hurt`, boss quay đầu và vào `Telegraph` lần nữa. Nó luôn lao qua lại giữa hai vách, không đuổi theo người chơi. Mình cố ý làm vậy: nhịp trận đoán được thì người chơi học được, và luôn có một chỗ đứng an toàn là trên đỉnh vách.

Ba con số làm nên trận đấu:

- **Telegraph 0.9 giây** là thời gian phản ứng. Xuống 0.3 giây thì người chơi chết trước khi hiểu chuyện gì xảy ra. Lên 2 giây thì trận đấu lê thê.
- **Charge 13 unit/giây**, nhanh hơn tốc độ chạy 9 unit/giây của nhân vật. Không chạy thoát được, phải nhảy lên chỗ cao.
- **Recover 1.8 giây** là cửa sổ trừng phạt. Ngắn quá thì không kịp nhảy xuống, dài quá (4 giây) thì trận đấu nhàm.

Và một con số thứ tư: **`rampPerHit = 0.75`**. Mỗi lần trúng đòn, thời gian `Telegraph` và `Recover` nhân với 0.75. Boss "nổi điên" dần mà không cần thêm chiêu mới hay thêm máu, chỉ bóp thời gian lại:

| | Telegraph | Recover |
|---|---|---|
| Chưa trúng đòn | 0.90 s | 1.80 s |
| Sau 1 lần | 0.68 s | 1.35 s |
| Sau 2 lần | 0.51 s | 1.01 s |

## Đấu trường

Boss cần một chỗ riêng: một khoảng sàn phẳng có vách ở hai đầu để nó lao vào, và một chỗ cao an toàn để người chơi đứng chờ. Mình làm đấu trường ở đầu phải căn phòng, trong một scene riêng để không phá căn phòng của các bài trước. Bài 15 sẽ nối các scene này thành những màn chơi nối tiếp nhau.

1. Trong cửa sổ Project, chọn scene của bạn, **Ctrl+D** để nhân bản, đổi tên thành `Room_Boss` rồi mở nó.
2. Xoá `Enemy_Cannon` của bài 11: nó đứng trên cột phải, mà cột đó sắp bị xoá.
3. Mở **Window > 2D > Tile Palette**, chọn tilemap sàn. Dùng công cụ **Eraser** (phím D) xoá hết hai cột cao ở x 48 tới 49 và x 54 tới 55, từ y = 2 lên tới y = 22.
4. Chọn `RT_Grass` trong palette, dùng **Brush** (phím B) tô một khối 4 × 4 ô ở x 48 tới 51, y 2 tới 5. RuleTile tự vẽ viền và mặt cỏ.

![Scene view: bên trái là khối vách 4 ô, mặt trên ở y = 6; bên phải là đấu trường từ x 52 tới 62 với boss đứng ở x 58 trước cúp](/images/posts/unity-platformer/12/arena.webp)

Vách cao 4 ô: nhảy thường cao 5.2 nên người chơi lên được đỉnh vách, còn boss lao vào thì dừng. Đấu trường rộng 10 ô, từ mặt vách ở x = 52 tới tường phòng ở x = 62. Ngọc 4 và cửa thoát của bài 9 giờ nằm trong đấu trường.

Nếu bạn sửa tilemap bằng Tile Palette như trên, Unity tự dựng lại collider. Nếu có lúc bạn sửa tile bằng code (cửa phá được, khối rơi), `TilemapCollider2D` không tự biết tile đã đổi, và `CompositeCollider2D` gộp lại từ hình cũ. Tilemap báo trống mà vật lý vẫn va vào một bức tường vô hình. Bật tắt collider rồi mới dựng lại:

```csharp
tilemapCollider.enabled = false;
tilemapCollider.enabled = true;
composite.GenerateGeometry();
```

## Ô sprite không phải con boss

Bộ art của Brute nằm ở `Enemies/Brute`: `Idle`, `Run`, `Run_Attack`, `Attack`, `Hit`. Mỗi ô rộng 72 pixel, cao 48, khác các con địch trước (48 × 48). Cắt mọi sheet bằng Grid By Cell Size `72 × 48`.

Rồi nhìn kỹ xem con boss nằm ở đâu trong ô:

![Hai ô 72 x 48 phóng to: ở Idle thân con boss nằm lệch về nửa phải ô, tâm thân ở 48.5 pixel trong khi tâm ô ở 36 pixel; ở Run_Attack chiếc lưỡi quét ra tới tận mép trái ô](/images/posts/unity-platformer/12/brute-cell.webp)

Thân con boss chỉ rộng 27 pixel và nằm ở nửa phải của ô, từ pixel 35 tới 62. Phần trống bên trái dành cho chiếc lưỡi quét ra trong `Run_Attack` và `Attack`. Đó là tầm với của đòn đánh, không phải thân.

Nếu để pivot `Bottom Center` như mọi con địch trước, pivot rơi vào pixel 36, lệch trái so với thân 12.5 pixel, tức 0.78 unit. Collider đặt quanh pivot sẽ lệch theo. Bản đầu của mình còn đặt collider 2.6 × 2.6 cho "khớp ô", kết quả là thế này:

![Collider theo ô 2.6 x 2.6 màu đỏ lệch hẳn sang trái và cao quá đầu boss, collider theo thân 1.7 x 1.6 màu xanh ôm vừa con boss](/images/posts/unity-platformer/12/collider-cell-vs-body.webp)

Với collider đỏ, người chơi đứng cách boss nửa ô bên trái vẫn chết, còn nhảy xuống đúng đầu nó thì đáp vào khoảng không phía trên. Trận đấu nghe thì đúng mà chơi thì "sai sai" không giải thích được.

Pivot phải đặt ở tâm thân. Cách nhanh nhất là đặt ngay lúc cắt: trong Sprite Editor, menu **Slice**, Type `Grid By Cell Size`, Pixel Size `72 × 48`, **Pivot** `Custom`, **Custom Pivot** X `0.6736`, Y `0`, rồi bấm **Slice** và **Apply**. Làm vậy cho cả năm sheet. Con số 0.6736 là 48.5 chia 72. Khi boss quay đầu, `flipX` lật hình quanh pivot, tức quanh tâm thân, nên thân vẫn đứng đúng chỗ ở cả hai hướng. Collider giờ là 1.7 × 1.6, offset (0, 0.8), đặt trong `EnemyData` như bài 11.

## EnemyData của Brute

Tạo `Enemy_Brute` bằng **Create > Platformer > Enemy Data**:

![Inspector của Enemy_Brute: Display Name Brute, Collider Size 1.7 1.6, Offset 0 0.8, Move Speed 3, Charge Speed 13, Sight Range 20, Sight Height 6, Telegraph 0.9, Bounce Velocity 22, Stompable Only When Vulnerable bật, Idle 11, Walk 12, Attack 12, Hit 5](/images/posts/unity-platformer/12/brute-data-inspector.webp)

- **Sprites**: Idle là `Idle` (11 frame), Walk là `Run` (12), Attack là `Run_Attack` (12), Hit là `Hit` (5). Charge và Stun để trống.
- **Sight Range 20, Sight Height 6**: boss không nhìn phía trước như charger, nó dùng một hộp rộng 40 × 12 quanh mình để biết người chơi đã vào phòng chưa.
- **Bounce Velocity 22**: cao hơn địch thường (20) để sau cú giẫm, người chơi bật lên đủ cao mà lùi về đỉnh vách.
- **Stompable Only When Vulnerable**: bật, như charger.

## Code

Tạo `Assets/_Platformer/Scripts/Enemies/BossBrute.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D), typeof(SpriteRenderer))]
    [RequireComponent(typeof(SpriteSequence))]
    public sealed class BossBrute : MonoBehaviour
    {
        public enum State { Idle, Telegraph, Charge, Recover, Hurt, Dead }

        [Header("Data")]
        [SerializeField] private EnemyData data;
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private LayerMask playerMask;
        [SerializeField] private int startDirection = -1;

        [Header("Fight")]
        [SerializeField, Min(1)] private int maxHealth = 3;
        [Tooltip("Seconds the boss stands open after a charge. Shrinks as health drops.")]
        [SerializeField, Min(0.1f)] private float recoverSeconds = 1.8f;
        [Tooltip("Each hit multiplies telegraph and recover time by this. Below 1 = fight speeds up.")]
        [SerializeField, Range(0.4f, 1f)] private float rampPerHit = 0.75f;
        [SerializeField, Min(0f)] private float hurtSeconds = 0.8f;

        [Header("Sensing")]
        [SerializeField, Min(0.02f)] private float wallThickness = 0.15f;
        [SerializeField, Min(0f)] private float wallMargin = 0.25f;
        [SerializeField, Min(0f)] private float wallProbeOffset = 0.05f;

        public State Current { get; private set; } = State.Idle;
        public int Health { get; private set; }
        public int Direction { get; private set; }
        public bool Vulnerable => Current == State.Recover;
        public bool Dangerous => Current == State.Idle || Current == State.Telegraph || Current == State.Charge;
        public EnemyData Data => data;
        public System.Action<int, int> HealthChanged;   // current, max
        public System.Action Defeated;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private SpriteRenderer sr;
        private SpriteSequence seq;
        private float stateUntil;
        private int hitsTaken;

        private float Ramp => Mathf.Pow(rampPerHit, hitsTaken);

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            box = GetComponent<BoxCollider2D>();
            sr = GetComponent<SpriteRenderer>();
            seq = GetComponent<SpriteSequence>();
            body.bodyType = RigidbodyType2D.Kinematic;
            body.freezeRotation = true;
            Direction = startDirection >= 0 ? 1 : -1;
            Health = maxHealth;
            if (data != null) { box.size = data.colliderSize; box.offset = data.colliderOffset; }
        }

        private void OnEnable()
        {
            Health = maxHealth; hitsTaken = 0;
            Enter(State.Idle);
            HealthChanged?.Invoke(Health, maxHealth);
        }

        private void FixedUpdate()
        {
            if (data == null || Current == State.Dead) return;

            switch (Current)
            {
                case State.Idle:
                    if (PlayerInRoom()) Enter(State.Telegraph);
                    break;
                case State.Telegraph:
                    if (Time.time >= stateUntil) Enter(State.Charge);
                    break;
                case State.Charge:
                    if (WallAhead()) { Enter(State.Recover); break; }
                    body.MovePosition(body.position + new Vector2(Direction * data.chargeSpeed * Time.fixedDeltaTime, 0f));
                    break;
                case State.Recover:
                    if (Time.time >= stateUntil) { Direction = -Direction; Enter(State.Telegraph); }
                    break;
                case State.Hurt:
                    if (Time.time >= stateUntil) { Direction = -Direction; Enter(State.Telegraph); }
                    break;
            }
            sr.flipX = Direction > 0;
        }

        private void Enter(State s)
        {
            Current = s;
            switch (s)
            {
                case State.Idle:
                    Play(data.idle, true);
                    break;
                case State.Telegraph:
                    stateUntil = Time.time + data.telegraphSeconds * Ramp;
                    Play(data.idle, true);
                    break;
                case State.Charge:
                    Play(data.attack, true);          // Run_Attack
                    break;
                case State.Recover:
                    stateUntil = Time.time + recoverSeconds * Ramp;
                    Play(data.walk, true);            // Run, standing still = visibly winded
                    break;
                case State.Hurt:
                    stateUntil = Time.time + hurtSeconds;
                    Play(data.hit, false);
                    break;
                case State.Dead:
                    Play(data.hit, false);
                    break;
            }
        }

        private void Play(Sprite[] frames, bool loop)
        {
            if (seq == null || frames == null || frames.Length == 0) return;
            seq.Play(frames, data.fps, loop);
        }

        private bool PlayerInRoom()
        {
            var b = box.bounds;
            var size = new Vector2(data.sightRange * 2f, data.sightHeight * 2f);
            return Physics2D.OverlapBox(b.center, size, 0f, playerMask) != null;
        }

        private bool WallAhead() => Probe.WallAhead(box, Direction, groundMask, wallThickness, wallMargin, wallProbeOffset);

        private void OnCollisionEnter2D(Collision2D c) => Touch(c.collider);
        private void OnTriggerEnter2D(Collider2D c) => Touch(c);

        private void Touch(Collider2D other)
        {
            if (Current == State.Dead) return;
            var motor = other.GetComponentInParent<Player.PlayerMotor>();
            if (motor == null) return;

            var open = Vulnerable || !data.stompableOnlyWhenVulnerable;
            if (open && StompCheck.IsStomp(other, box, motor.Velocity))
            {
                var rb = motor.GetComponent<Rigidbody2D>();
                if (rb != null) rb.linearVelocity = new Vector2(rb.linearVelocity.x, data.bounceVelocity);
                TakeHit();
            }
            else if (Dangerous)
            {
                var life = other.GetComponentInParent<Player.PlayerLife>();
                if (life != null) life.Kill(data.displayName);
            }
        }

        public void TakeHit()
        {
            if (Current == State.Dead) return;
            Health--; hitsTaken++;
            HealthChanged?.Invoke(Health, maxHealth);
            if (Health <= 0) { Die(); return; }
            Enter(State.Hurt);
        }

        private void Die()
        {
            Current = State.Dead;
            box.enabled = false;
            Play(data.hit, false);
            Defeated?.Invoke();
        }

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null) return;
            var b = bc.bounds;
            Gizmos.color = Vulnerable ? Color.green : Color.red;
            Gizmos.DrawWireCube(b.center, b.size);
        }
    }
}
```

Bạn sẽ thấy gần như không có gì mới. `FixedUpdate` là một `switch` theo trạng thái như charger ở bài 11. Giẫm dùng `StompCheck` của bài 9. Cờ `stompableOnlyWhenVulnerable` của bài 11. Hộp dò vách là `Probe` của bài 10. Đổi dãy sprite bằng `SpriteSequence` của bài 8. Thông số trong `EnemyData` của bài 11. Con boss chỉ ráp lại những thứ đã có, và đó là phần thưởng cho mười một bài trước.

Những chỗ riêng của boss:

- **`Ramp`** là `rampPerHit` mũ số lần trúng đòn. `Telegraph` và `Recover` nhân thời lượng với nó mỗi lần `Enter`.
- **`Recover` phát dãy `Run` mà không di chuyển.** Bộ art không có động tác mệt cho Brute như sheet `Stun` của charger. Chân chạy mà người đứng yên đọc ra như đang hụt hơi, đủ để người chơi hiểu đây là lúc nó hở.
- **`HealthChanged` và `Defeated`** là hai sự kiện cho bài 15: thanh máu boss nghe cái đầu, màn hình thắng nghe cái sau.

### Chạm vào boss: Vulnerable và Dangerous là hai câu hỏi khác nhau

Bản `Touch` đầu tiên của mình viết thế này:

```csharp
if (Vulnerable && StompCheck.IsStomp(other, box, motor.Velocity))
{
    // bounce, TakeHit
}
else
{
    var life = other.GetComponentInParent<Player.PlayerLife>();
    if (life != null) life.Kill(data.displayName);
}
```

Giẫm lúc boss hở thì boss mất máu, chạm lúc nào khác thì người chơi chết. Nghe hợp lý. Mình cho người chơi đứng trên đỉnh vách, chờ boss đâm vào vách rồi nhảy xuống giẫm, sau đó đứng yên trên đầu nó thêm một chút. Log ghi lại mọi lần chạm:

```
1.98  state=Recover vulnerable=True  playerBottom=3.615 bossTop=3.600 isStomp=True
1.98  boss hp 2/3
2.56  state=Hurt    vulnerable=False playerBottom=3.615 bossTop=3.600 isStomp=True
2.56  player died: Brute
```

Cú giẫm đầu trúng, boss mất một máu và vào `Hurt`. Người chơi bật lên rồi rơi xuống đúng đầu nó lần nữa, 0.58 giây sau, trong lúc boss còn đang chớp trắng. `Hurt` không phải `Recover` nên `Vulnerable` là false, lần chạm thứ hai rơi vào nhánh `else`, và người chơi chết. Đánh trúng rồi bị phạt vì chính cú đánh đó.

Lỗi này chưa từng xảy ra với jumper, charger hay thùng gỗ: cả ba chết ngay sau một cú giẫm, collider tắt, không có lần chạm thứ hai. Boss là thứ đầu tiên sống sót sau khi bị giẫm.

Cách sửa là tách hai câu hỏi ra:

- **`Vulnerable`**: giẫm lúc này có làm boss mất máu không? Chỉ khi `Recover`.
- **`Dangerous`**: chạm lúc này có giết người chơi không? Chỉ khi `Idle`, `Telegraph`, `Charge`.

`Recover`, `Hurt` và `Dead` không nguy hiểm. Chạm vào boss lúc nó thở dốc mà không phải từ trên xuống (đi ngang vào nó) thì không có gì xảy ra. Đó vốn là ý nghĩa của thế hở. Quy tắc chung: một cú đánh trúng không bao giờ được phạt người đánh.

### Hộp dò vách tính từ collider

Bài 10 đã giới thiệu `Probe` với lời hứa kể lại vì sao chiều cao hộp dò không được gõ tay. Đây là lúc đó. Bản đầu của boss dò vách bằng một hộp cao 2.0 gõ sẵn, đặt ở tâm collider. Khi collider còn là 2.6 × 2.6 thì không sao. Thu collider về 1.7 × 1.6 cho khớp thân, tâm collider hạ xuống còn 0.8 trên chân, và hộp cao 2.0 thò xuống dưới mặt sàn 0.2:

![Bên trái con boss là hộp dò cao 2.0 màu đỏ thò xuống dưới mặt cỏ; bên phải là hộp dò tính từ collider, cao 1.1, nằm gọn trong chiều cao thân](/images/posts/unity-platformer/12/probe-typed-vs-derived.webp)

Boss coi chính mặt đất nó đang đứng là vách. Vào `Charge` rồi báo đâm vách ngay lập tức, không nhúc nhích. `Probe.WallAhead` tính chiều cao từ collider trừ đi `wallMargin` mỗi đầu, nên thu collider bao nhiêu thì hộp dò thu theo bấy nhiêu: 1.6 − 2 × 0.25 = 1.1.

## Dựng boss

1. Trong `Enemies`, tạo `Boss_Brute` ở `(58, 2, 0)`. Layer `Enemy`.
2. **Sprite Renderer**: `Idle_0` của Brute, Sorting Layer `Enemies`.
3. **Sprite Sequence**: bỏ tick Play On Enable.
4. **Rigidbody 2D**: `Kinematic`, tick Freeze Rotation Z.
5. **Box Collider 2D**: để mặc định, `EnemyData` ghi đè lúc `Awake`.
6. **Boss Brute**: Data `Enemy_Brute`, Ground Mask `Ground`, Player Mask `Player`, Start Direction `-1`. Các số khác giữ mặc định.

![Inspector của Boss Brute: Data Enemy_Brute, Ground Mask Ground, Player Mask Player, Start Direction -1, Max Health 3, Recover Seconds 1.8, Ramp Per Hit 0.75, Hurt Seconds 0.8, Wall Thickness 0.15, Wall Margin 0.25, Wall Probe Offset 0.05](/images/posts/unity-platformer/12/boss-inspector.webp)

## Kiểm tra

Mình cho người chơi đứng trên đỉnh vách ở x = 49.6, mỗi lần boss đâm vào vách bên trái thì nhảy xuống giẫm, đứng trên đầu nó thêm 0.7 giây (để có lần chạm thứ hai trong lúc `Hurt`), rồi lùi về vách. Toàn bộ bằng input thật:

| Thời điểm | Sự kiện |
|---|---|
| 0.02 s | Telegraph, người chơi đã ở trong hộp 40 × 12 |
| 0.94 s | Charge (khựng 0.92 giây) |
| 1.34 s | Recover ở x = 53.06, sát vách trái |
| 1.98 s | Giẫm lần 1: máu 3 → 2, người chơi nảy lên với vận tốc 22 |
| 2.56 s | Chạm lần hai lúc Hurt: không có gì xảy ra |
| 2.82 → 3.50 s | Telegraph 0.68 giây, rồi lao sang phải |
| 4.14 → 5.50 s | Recover ở x = 61.12, sát tường phải, 1.36 giây |
| 7.46 s | Giẫm lần 2: máu 2 → 1 |
| 8.28 → 8.80 s | Telegraph 0.52 giây |
| 9.44 → 10.46 s | Recover 1.02 giây |
| 12.26 s | Giẫm lần 3: máu 1 → 0, boss chết |

Ba lần giẫm, không chết lần nào. Boss dừng ở 53.06 và 61.12, kỳ vọng là mặt vách cộng nửa collider 0.85, khe 0.05 và bề dày hộp dò 0.15, tức 53.05 bên trái và 60.95 bên phải. Bên phải lệch 0.17 vì mỗi bước vật lý boss đi 0.26 unit, nó dừng ở bước đầu tiên hộp dò chạm tường. Thời lượng `Telegraph` và `Recover` khớp bảng ramp ở trên trong vòng một bước vật lý.

Tự thử bằng tay:

- Đứng dưới sàn đấu trường khi boss lao tới: bạn chết. Đứng trên đỉnh vách: an toàn.
- Nhảy xuống giẫm lúc boss thở dốc: nó chớp trắng, bạn nảy lên. Đứng yên trên đầu nó: bạn không chết.
- Đi ngang vào boss lúc nó thở dốc: không ai chết.
- Chọn `Boss_Brute` trong lúc Play: khung collider đỏ khi nguy hiểm, xanh khi đang hở.
- Tạm đổi Telegraph Seconds trong `Enemy_Brute` thành 0.3, rồi 2.0, và Recover Seconds thành 4. Cảm nhận xem trận đấu thay đổi thế nào, rồi trả lại số cũ.

## Bài sau

Mọi thứ đã chạy đúng, nhưng chưa có cảm giác. Giẫm trúng địch không có tiếng, không có rung, boss đâm vách mà màn hình đứng im. Bài 13 thêm "juice": rung camera, chớp sprite và âm thanh, để mỗi cú giẫm có trọng lượng. Và làm vậy mà không sửa một dòng nào trong code gameplay của mười hai bài trước.
