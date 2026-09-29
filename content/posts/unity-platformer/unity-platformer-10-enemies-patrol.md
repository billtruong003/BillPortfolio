---
title: "Platformer #10: Địch đi tuần mà không rơi khỏi bệ"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 10
excerpt: "Hai cảm biến nhìn về phía trước: một tia dò sàn và một hộp dò tường. Địch Kinematic đi bằng MovePosition, quay đầu đúng mép bệ với sai số 0.04 unit, chết khi bị giẫm bằng đúng luật StompCheck của bài 9, và giết người chơi khi chạm ngang."
coverImage: "/images/posts/unity-platformer/10/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Enemy AI", "Physics 2D", "Tutorial"]
published: true
featured: false
---

Kéo một con địch vào scene, cho nó đi thẳng một hướng, bấm Play. Nó đi tới mép bệ và rơi xuống. Trong game thật, địch đi tuần phải biết quay đầu trước khi hụt chân, và quay đầu khi đụng tường.

Bài này làm con địch đầu tiên: đi qua đi lại trên một bệ, không bao giờ rơi, chết khi bị giẫm từ trên, và giết người chơi khi chạm từ bất kỳ hướng nào khác.

## Nhìn về phía trước, không nhìn dưới chân

Cách nghĩ đầu tiên thường là "khi dưới chân hết sàn thì quay đầu". Làm vậy thì lúc phát hiện ra, nửa người con địch đã lơ lửng ngoài mép. Kinematic không có trọng lực nên nó không rơi, nhưng nhìn như đang đứng trên không khí.

Cách đúng là dò chỗ nó sắp bước tới. Con địch có hai cảm biến, cả hai đặt ở phía đang đi:

- **Tia dò sàn**: một raycast bắn thẳng xuống, gốc ở cách mép trước của collider 0.2 unit, sâu 0.6 unit. Tia chạm sàn thì đi tiếp. Tia không chạm gì nghĩa là phía trước là vực, quay đầu.
- **Hộp dò tường**: một hộp mỏng 0.12 unit nằm ngay sát mép trước. Hộp chạm địa hình thì phía trước là tường, quay đầu.

![Bên trái: tia dò màu xanh cắm vào mặt cỏ, địch đi tiếp. Bên phải: địch tới gần mép bệ, tia dò nằm ngoài mép và không chạm gì, địch quay đầu. Hộp đỏ bên trái thân địch là hộp dò tường](/images/posts/unity-platformer/10/probes-mid-vs-edge.webp)

Khung xanh lá là collider của địch, đường xanh dương là tia dò sàn, khung đỏ là hộp dò tường. Ảnh bên phải chụp đúng vị trí địch quay đầu khi đo: mép trước collider còn cách mép bệ 0.16 unit, nhưng tia dò đã ra ngoài và không còn gì bên dưới.

## Hộp dò tường lấy chiều cao từ collider

Hộp dò tường cần cao bao nhiêu? Nếu gõ tay một con số, ví dụ 1.2, rồi sau này đổi collider thấp hơn 1.2, hộp dò sẽ thò xuống dưới chân và chạm vào chính mặt sàn đang đứng. Con địch sẽ báo "có tường phía trước" mãi và đứng im tại chỗ. Mình đã gặp đúng chuyện này với con boss, lúc thu nhỏ collider của nó cho khớp hình (bài 12 sẽ kể).

Nên chiều cao hộp dò không gõ tay, mà tính từ collider: bằng chiều cao collider trừ đi một khoảng đệm ở trên và dưới, để hộp không bao giờ chạm tới mặt sàn. Viết thành một hàm dùng chung cho mọi thứ biết đi. Tạo `Assets/_Platformer/Scripts/Common/Probe.cs`:

```csharp
using UnityEngine;

namespace Platformer.Common
{
    public static class Probe
    {
        public static bool WallAhead(Collider2D body, int direction, LayerMask mask,
                                     float thickness = 0.12f, float margin = 0.25f, float gap = 0.02f)
        {
            var b = body.bounds;
            var height = Mathf.Max(0.1f, b.size.y - margin * 2f);
            var edgeX = direction > 0 ? b.max.x : b.min.x;
            var centre = new Vector2(edgeX + direction * (thickness * 0.5f + gap), b.center.y);
            return Physics2D.OverlapBox(centre, new Vector2(thickness, height), 0f, mask) != null;
        }

        public static void WallProbeShape(Collider2D body, int direction, out Vector2 centre, out Vector2 size,
                                          float thickness = 0.12f, float margin = 0.25f, float gap = 0.02f)
        {
            var b = body.bounds;
            size = new Vector2(thickness, Mathf.Max(0.1f, b.size.y - margin * 2f));
            var edgeX = direction > 0 ? b.max.x : b.min.x;
            centre = new Vector2(edgeX + direction * (thickness * 0.5f + gap), b.center.y);
        }
    }
}
```

`WallAhead` trả lời "phía trước có tường không". `WallProbeShape` tính đúng hình hộp đó để vẽ gizmo. Hai hàm dùng chung một công thức nên gizmo không bao giờ lệch với thứ đang thật sự được dò. Với collider cao 1.7 và `margin = 0.25`, hộp dò cao 1.2, tâm ngang tâm collider, cách mép collider 0.02.

## Con địch

### Kinematic, không phải Dynamic

Bài 2 cho người chơi dùng Rigidbody2D **Dynamic** vì nó cần trọng lực và cần bị địa hình chặn lại. Con địch này thì khác. Nó không bao giờ rơi (tia dò không cho nó bước ra khỏi mép), nên không cần trọng lực. Và nếu là Dynamic, người chơi chạy vào nó sẽ đẩy được nó đi, có khi đẩy rơi khỏi bệ.

**Kinematic** thì không chịu lực nào. Nó chỉ đi tới chỗ code bảo, bằng `Rigidbody2D.MovePosition`. Người chơi (Dynamic) chạm vào nó thì người chơi bị chặn, còn nó không nhúc nhích. Va chạm giữa một vật Kinematic và một vật Dynamic vẫn gọi `OnCollisionEnter2D` bình thường.

### Code

Tạo `Assets/_Platformer/Scripts/Enemies/PatrolEnemy.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D), typeof(SpriteRenderer))]
    public sealed class PatrolEnemy : MonoBehaviour
    {
        [Header("Patrol")]
        [SerializeField, Min(0f)] private float speed = 3f;
        [Tooltip("Start facing: -1 left, +1 right.")]
        [SerializeField] private int startDirection = -1;

        [Header("Sensing")]
        [SerializeField] private LayerMask groundMask;
        [SerializeField, Min(0f)] private float probeAhead = 0.2f;
        [SerializeField, Min(0f)] private float probeDepth = 0.6f;
        [SerializeField, Min(0.02f)] private float wallThickness = 0.12f;
        [SerializeField, Min(0f)] private float wallMargin = 0.25f;
        [SerializeField, Min(0f)] private float turnDelay = 0.1f;

        [Header("Stomp")]
        [SerializeField, Min(0f)] private float bounceVelocity = 20f;
        [SerializeField, Min(0f)] private float deathLinger = 0.35f;

        [Header("Looks")]
        [SerializeField] private Sprite[] walkFrames;
        [SerializeField] private Sprite[] hitFrames;
        [SerializeField, Min(1f)] private float fps = 20f;

        public bool IsDead { get; private set; }
        public int Direction { get; private set; }
        public System.Action<PatrolEnemy> Killed;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private SpriteRenderer sr;
        private SpriteSequence seq;
        private float turnCooldown;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            box = GetComponent<BoxCollider2D>();
            sr = GetComponent<SpriteRenderer>();
            seq = GetComponent<SpriteSequence>();
            body.bodyType = RigidbodyType2D.Kinematic;
            body.freezeRotation = true;
            Direction = startDirection >= 0 ? 1 : -1;
        }

        private void OnEnable()
        {
            IsDead = false;
            if (seq != null && walkFrames != null && walkFrames.Length > 0) seq.Play(walkFrames, fps, true);
        }

        private void FixedUpdate()
        {
            if (IsDead) return;
            turnCooldown -= Time.fixedDeltaTime;
            // Without the cooldown, an enemy standing where NEITHER side has floor
            // (placed too high, or on a 1-tile pillar) flips every physics step and
            // vibrates in place instead of walking.
            if (turnCooldown <= 0f && (!GroundAhead() || WallAhead()))
            {
                Direction = -Direction;
                turnCooldown = turnDelay;
            }
            body.MovePosition(body.position + new Vector2(Direction * speed * Time.fixedDeltaTime, 0f));
            sr.flipX = Direction > 0;
        }

        private bool GroundAhead()
        {
            var b = box.bounds;
            var edgeX = Direction > 0 ? b.max.x : b.min.x;
            var origin = new Vector2(edgeX + Direction * probeAhead, b.min.y + 0.05f);
            return Physics2D.Raycast(origin, Vector2.down, probeDepth, groundMask).collider != null;
        }

        private bool WallAhead() => Probe.WallAhead(box, Direction, groundMask, wallThickness, wallMargin);

        private void OnCollisionEnter2D(Collision2D c) => Touch(c.collider);
        private void OnTriggerEnter2D(Collider2D c) => Touch(c);

        private void Touch(Collider2D other)
        {
            if (IsDead) return;
            var motor = other.GetComponentInParent<Player.PlayerMotor>();
            if (motor == null) return;

            if (StompCheck.IsStomp(other, box, motor.Velocity))
            {
                var rb = motor.GetComponent<Rigidbody2D>();
                if (rb != null) rb.linearVelocity = new Vector2(rb.linearVelocity.x, bounceVelocity);
                Die();
            }
            else
            {
                var life = other.GetComponentInParent<Player.PlayerLife>();
                if (life != null) life.Kill(name);
            }
        }

        public void Die()
        {
            if (IsDead) return;
            IsDead = true;
            box.enabled = false;
            Killed?.Invoke(this);
            if (seq != null && hitFrames != null && hitFrames.Length > 0) seq.Play(hitFrames, fps, false);
            Invoke(nameof(HideNow), deathLinger);
        }

        private void HideNow() => gameObject.SetActive(false);

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null) return;
            var b = bc.bounds;
            var dir = Application.isPlaying ? Direction : (startDirection >= 0 ? 1 : -1);
            var edgeX = dir > 0 ? b.max.x : b.min.x;
            var origin = new Vector3(edgeX + dir * probeAhead, b.min.y + 0.05f, 0f);
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(origin, origin + Vector3.down * probeDepth);
            Gizmos.color = Color.red;
            Probe.WallProbeShape(bc, dir, out var wc, out var ws, wallThickness, wallMargin);
            Gizmos.DrawWireCube(wc, ws);
        }
    }
}
```

Đi từng phần:

**`FixedUpdate`** hỏi hai cảm biến mỗi bước vật lý. Phía trước không có sàn hoặc có tường thì đổi hướng. Rồi dời con địch một đoạn `speed × fixedDeltaTime` (3 × 0.02 = 0.06 unit mỗi bước) bằng `MovePosition`. Sprite trong bộ art quay mặt sang trái, nên lật hình khi đi sang phải.

**`GroundAhead`** đặt gốc tia ở mép trước collider cộng thêm `probeAhead`, cao hơn đáy collider 0.05 để gốc tia không nằm sẵn bên trong mặt sàn. Tia dài 0.6 nên chạm được tới 0.55 dưới chân. Đủ để thấy mặt sàn, nhưng ngắn hơn một ô, nên không nhầm bậc thấp hơn một ô bên dưới là sàn.

**`turnDelay`** chặn hai lần quay liên tiếp trong vòng 0.1 giây. Mục "Đặt địch đúng độ cao" bên dưới giải thích vì sao cần nó.

**`Touch`** được gọi từ cả `OnCollisionEnter2D` lẫn `OnTriggerEnter2D`. Con địch này dùng collider đặc nên chỉ cái đầu chạy. Nhưng bài 11 có địch bay xuyên tường phải dùng trigger, và nối cả hai vào một hàm thì đổi kiểu collider không phải sửa gì.

**Giẫm** dùng đúng `StompCheck.IsStomp` của bài 9, một dòng. Luật đã phá thùng gỗ giờ giết địch, và bài 11, 12 dùng tiếp. Đây là chỗ việc tách nó ra thành static class ở bài 9 được đền đáp. `bounceVelocity = 20` bằng đúng thùng gỗ: nảy là một hằng số, không phụ thuộc rơi từ bao cao, để người chơi đoán được mình sẽ bật lên tới đâu.

**Không phải giẫm** thì gọi `PlayerLife.Kill` của bài 8, truyền tên con địch làm lý do chết.

**`Die`** tắt collider ngay để người chơi không va vào xác, phát 5 frame Hit (0.25 giây), rồi tắt object sau `deathLinger = 0.35` giây.

## Dựng con địch trong scene

### Art

Bộ art có hai loại địch đi bộ, `Enemies/Jumper1` và `Enemies/Jumper2`. Cắt `Run.png` (576 × 48) thành ô `48 × 48` được 12 frame, `Hit.png` (240 × 48) được 5 frame. Pivot `Bottom Center`, như nhân vật ở bài 0: chân con địch chạm đáy ô ở những frame nó đặt chân xuống đất.

### Layer

Thêm User Layer `Enemy` và sorting layer `Enemies`. Trong danh sách Sorting Layers, kéo `Enemies` nằm giữa `Default` và `Player`: địch vẽ đè lên gạch, người chơi vẽ đè lên địch. Kiểm tra bảng va chạm như bài 9: `Enemy × Player` và `Enemy × Ground` phải tick. `Enemy × Enemy` nên bỏ tick để hai con địch đi ngang nhau không chặn nhau. `Enemy × Pickup` và `Enemy × Interactable` cũng bỏ tick: địch không nhặt ngọc, không kéo cờ.

### Từng bước

1. Tạo GameObject rỗng `Enemies` ở gốc scene để gom địch. Trong đó tạo `Enemy_A`.
2. Layer `Enemy`.
3. **Sprite Renderer**: sprite `Run_0` của Jumper1, Sorting Layer `Enemies`.
4. **Sprite Sequence**: bỏ tick Play On Enable, để trống Frames. `PatrolEnemy` tự phát dãy đi bộ.
5. **Rigidbody 2D**: Body Type `Kinematic`, tick Freeze Rotation Z.
6. **Box Collider 2D**: Size `(1.6, 1.7)`, Offset `(0, 0.85)`. Is Trigger để trống.
7. **Patrol Enemy**: Ground Mask chọn `Ground`, kéo 12 frame Run vào Walk Frames, 5 frame Hit vào Hit Frames. Các số khác giữ mặc định.

![Inspector của Enemy_A: layer Enemy, Rigidbody 2D Kinematic với Freeze Rotation Z, Box Collider 2D offset 0 0.85 size 1.6 1.7](/images/posts/unity-platformer/10/enemy-body-inspector.webp)

![Inspector của Patrol Enemy: Speed 3, Start Direction -1, Ground Mask Ground, Probe Ahead 0.2, Probe Depth 0.6, Wall Thickness 0.12, Wall Margin 0.25, Turn Delay 0.1, Bounce Velocity 20, Death Linger 0.35, 12 Walk Frames, 5 Hit Frames, Fps 20](/images/posts/unity-platformer/10/patrol-inspector.webp)

Ground Mask chỉ có `Ground`, và thùng gỗ ở bài 9 cũng nằm trên `Ground`. Nên con địch đi trên sàn sẽ coi thùng là tường và quay đầu trước thùng.

### Đặt địch đúng độ cao

Pivot ở chân nên đặt địch rất đơn giản: `y` bằng đúng độ cao mặt sàn nó đứng.

| Mặt sàn | y của mặt | Đặt địch ở |
|---|---|---|
| Sàn phòng | 2 | `y = 2` |
| Bệ 1 | 7 | `y = 7` |
| Bệ 3 | 17 | `y = 17` |

Đặt `Enemy_A` ở `(14, 7, 0)` trên bệ 1, Start Direction `-1`. Nhân bản thành `Enemy_B` ở `(40, 17, 0)` trên bệ 3, đổi sprite và frame sang Jumper2 cho khác hình.

Chỗ dễ sai là kéo con địch bằng chuột trong Scene view rồi thả hơi cao so với mặt sàn. Kinematic không có trọng lực, nên thả ở đâu nó đứng ở đó. Tia dò chỉ với tới 0.55 dưới chân, đặt cao hơn thế thì tia không chạm sàn ở cả hai phía:

![Bên trái: địch đặt đúng, chân chạm mặt bệ, tia dò cắm vào cỏ. Bên phải: địch đặt cao hơn mặt bệ 1.5 unit, tia dò lơ lửng giữa không trung](/images/posts/unity-platformer/10/placement-right-vs-high.webp)

Mình đã thử đặt hai con địch cao hơn mặt bệ 1.5 unit:

- Có `turnDelay = 0.1`: con địch đi được 0.36 unit, quay đầu, đi lại 0.36 unit, cứ thế mỗi 0.12 giây. Trông như nó đang lạch bạch tại chỗ, vẫn khó hiểu nhưng ít ra nhìn là biết có gì sai.
- Không có `turnDelay` (đặt về 0): con địch đổi hướng 301 lần trong 6 giây, đúng 50 lần mỗi giây, tức mọi bước vật lý. Nó đứng im một chỗ, hình lật qua lật lại nhanh tới mức mắt không thấy. Nhìn vào chỉ thấy một con địch không chịu đi, và không có lỗi nào trong Console.

`turnDelay` không sửa được lỗi đặt sai, nó chỉ biến một lỗi vô hình thành một lỗi nhìn thấy. Cách sửa thật là đặt đúng `y` theo bảng trên, và chọn con địch rồi nhìn gizmo: đầu dưới tia xanh phải cắm vào mặt sàn.

## Kiểm tra

Mình ghi lại vị trí hai con địch mỗi bước vật lý trong 12 giây, không có người chơi nào quấy rầy:

| Địch | Bệ | Điểm quay đo được | Kỳ vọng |
|---|---|---|---|
| Enemy_A | Bệ 1, x từ 8 tới 17 | 8.96 và 16.04 | 9.0 và 16.0 |
| Enemy_B | Bệ 3, x từ 34 tới 43 | 34.96 và 42.04 | 35.0 và 42.0 |

Kỳ vọng tính bằng mép bệ cộng trừ nửa bề rộng collider (0.8) cộng `probeAhead` (0.2), tức mép ± 1.0: khi tâm địch cách mép đúng 1.0 thì gốc tia dò nằm đúng trên mép. Số đo lệch 0.04, nhỏ hơn một bước đi 0.06: con địch quay ở bước đầu tiên tia dò rơi ra ngoài mép. Mỗi chiều đi mất 2.36 giây, đúng 7.08 unit chia 3 unit/giây.

Cảm biến tường thử bằng một con địch tạm đặt trên sàn giữa `Box_1` và `Box_2` của bài 9. Nó quay đầu ở x = 21.60 và 26.40, kỳ vọng 21.63 và 26.37 (mặt thùng cộng nửa bề rộng collider 0.8, cộng bề dày hộp dò 0.12 và khe 0.02).

Giẫm: thả người chơi từ y = 11 xuống `Enemy_A` đang đi trên bệ 1. Chạm sau 0.20 giây, chân người chơi cao hơn đỉnh collider địch 0.01, bật lên với vận tốc 20 và cao tới 2.73 unit trên đỉnh con địch. Số lần chết vẫn là 0.

![Ba khung: người chơi rơi xuống đầu địch, vừa giẫm xong người nảy lên, địch biến mất](/images/posts/unity-platformer/10/stomp-enemy.webp)

Chạm ngang: cho người chơi chạy trên bệ 3 vào `Enemy_B` đang đi ngược chiều. Người chơi chết sau 0.20 giây ở x = 37.93, lý do ghi là "Enemy_B", hồi sinh ở Spawn. Con địch vẫn đi tiếp như không có gì.

![Hai khung: người chơi chạy ngang vào địch, rồi biến mất trong vòng tròn hiệu ứng trong khi địch vẫn đi](/images/posts/unity-platformer/10/side-touch.webp)

### Vòng lặp chết mà bài 8 đã nói

Bài 8 thêm 1.2 giây bất tử sau khi hồi sinh, để lá cờ nằm trên đường đi tuần của địch không biến thành vòng lặp. Giờ có địch thật để thử. Mình tạm đặt một con địch đi tuần trên sàn giữa hai thùng, đúng đoạn có `Checkpoint_2` ở x = 22, cho người chơi chạm cờ rồi đứng yên 8 giây:

- `respawnGrace = 0`: chết 6 lần. Hai trong số đó xảy ra 0.02 giây sau lúc lấy lại điều khiển, tức là một bước vật lý: không ai kịp bấm gì.
- `respawnGrace = 1.2`: chết 3 lần, và lần sớm nhất cũng 2.18 giây sau khi hồi sinh, đủ để một người chơi thật chạy khỏi chỗ đó.

Bất tử chữa triệu chứng ở mọi nơi. Còn trong căn phòng này, cách chữa tận gốc là không đặt địch đi tuần ở đoạn sàn có cờ: `Enemy_A` và `Enemy_B` nằm trên bệ 1 và bệ 3, không con nào đi qua `Checkpoint_1`, `Checkpoint_2` hay Spawn. Con địch thử ở giữa hai thùng mình đã xoá.

Tự thử bằng tay:

- Chọn `Enemy_A` trong lúc Play: gizmo đổi phía theo hướng đi, và tia xanh rời mép bệ đúng lúc nó quay đầu.
- Nhảy lên bệ 1 lúc con địch đang ở gần: rơi trúng đầu nó thì nó chết và bạn nảy lên, đáp xuống cạnh nó thì bạn chết.
- Đứng trên bệ 1 chờ con địch đi tới: bạn chết, nó không bị đẩy lùi dù chỉ một chút.
- Tạm kéo `Enemy_A` lên cao hơn mặt bệ một chút rồi Play: nó lạch bạch tại chỗ. Ctrl+Z để trả lại.

## Bài sau

Một con địch đi tuần là đủ để có thử thách, nhưng cả màn chơi toàn địch đi tuần thì chán. Bài 11 thêm ba kiểu địch nữa: một con lao tới khi thấy người chơi rồi choáng khi đâm tường, một khẩu pháo bắn đạn, một con bay rồi bổ nhào. Cả ba đọc thông số từ cùng một kiểu ScriptableObject, như PlayerData ở bài 7.
