---
title: "Platformer #11: Ba kiểu địch từ một ScriptableObject"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 11
excerpt: "Charger lao tới rồi choáng khi đâm tường, khẩu pháo bắn đạn lấy từ object pool của series shmup, con bay bổ nhào xuống đầu. Ba hành vi khác hẳn nhau đọc số từ cùng một kiểu EnemyData, và sáu lỗi code vẫn chạy mà không làm gì."
coverImage: "/images/posts/unity-platformer/11/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Enemy AI", "ScriptableObject", "Object Pool", "Tutorial"]
published: true
featured: false
---

Bài 10 có một kiểu địch: đi qua đi lại, giẫm lúc nào cũng chết. Cả màn chơi chỉ có kiểu đó thì người chơi học xong trong một phút. Bài này thêm ba kiểu khác hẳn:

- **Charger**: đi tuần, thấy người chơi thì khựng lại, rồi lao tới rất nhanh. Đâm tường thì choáng, và chỉ lúc choáng mới giẫm được.
- **Cannon**: đứng yên, bắn đạn khi người chơi ở phía trước.
- **Flyer**: bay qua lại trên cao, bổ nhào xuống khi người chơi đi bên dưới.

Ba hành vi này đọc thông số từ cùng một kiểu ScriptableObject, giống cách bài 7 tách `PlayerData` ra khỏi motor.

## Đọc bộ sprite ra thiết kế

Trước khi viết dòng code nào cho charger, mở thư mục `Enemies/Charger` của bộ art:

![Năm sheet của Charger: Idle 11 frame, Walk 12 frame, Charge 12 frame, Stun 8 frame với sao bay quanh đầu, Hit 5 frame](/images/posts/unity-platformer/11/charger-sheets.webp)

Họa sĩ vẽ sẵn một sheet `Stun`: con địch đứng lảo đảo, sao bay quanh đầu. Có sheet đó nghĩa là con địch này được thiết kế để bị choáng, tức là có một khoảnh khắc nó yếu đi. Và phải có lý do nó choáng: `Charge` là động tác lao tới, nên lao vào tường thì choáng là cách giải thích tự nhiên nhất.

Đọc asset trước khi thiết kế giúp đỡ phải vẽ thêm, và game ăn khớp với hình hơn. Từ năm sheet này ra được một vòng trạng thái:

![Sơ đồ trạng thái Charger: Walk dò mép, thấy người thì sang Telegraph đứng khựng, hết 0.5 giây sang Charge 11 unit/giây, đâm tường sang Stunned 1.6 giây, hết giờ về Walk. Chỉ ở Stunned mới giẫm được](/images/posts/unity-platformer/11/charger-states.webp)

`Telegraph` dùng sheet `Idle`: con địch đứng khựng 0.5 giây trước khi lao. Nửa giây đó là để người chơi kịp thấy và nhảy lên chỗ cao. Lao ngay khi vừa thấy thì người chơi chết mà không hiểu vì sao.

## EnemyData

Tạo `Assets/_Platformer/Scripts/Enemies/EnemyData.cs`:

```csharp
using UnityEngine;

namespace Platformer.Enemies
{
    [CreateAssetMenu(menuName = "Platformer/Enemy Data", fileName = "Enemy_New")]
    public sealed class EnemyData : ScriptableObject
    {
        [Header("Identity")]
        public string displayName = "Enemy";

        [Header("Collider")]
        public Vector2 colliderSize = new Vector2(1.6f, 1.7f);
        public Vector2 colliderOffset = new Vector2(0f, 0.85f);

        [Header("Movement")]
        [Min(0f)] public float moveSpeed = 3f;
        [Min(0f)] public float chargeSpeed = 9f;

        [Header("Senses")]
        [Tooltip("How far ahead the enemy notices the player.")]
        [Min(0f)] public float sightRange = 9f;
        [Tooltip("Vertical tolerance for 'the player is on my level'.")]
        [Min(0f)] public float sightHeight = 2f;

        [Header("Timing")]
        [Min(0f)] public float telegraphSeconds = 0.5f;
        [Min(0f)] public float stunSeconds = 1.6f;
        [Min(0f)] public float attackCooldown = 2f;

        [Header("Stomp")]
        [Min(0f)] public float bounceVelocity = 20f;
        [Tooltip("When true the enemy can only be stomped during its vulnerable window (stunned charger, boss recovery).")]
        public bool stompableOnlyWhenVulnerable = false;

        [Header("Sprites")]
        public Sprite[] idle;
        public Sprite[] walk;
        public Sprite[] charge;
        public Sprite[] stun;
        public Sprite[] attack;
        public Sprite[] hit;
        [Min(1f)] public float fps = 20f;
    }
}
```

Một kiểu dữ liệu cho cả ba loại: mỗi loại dùng phần của nó và bỏ trống phần còn lại. Charger không có `attack`, cannon không có `charge` hay `stun`. Chỗ đáng chú ý là collider nằm trong asset. Mỗi loại địch có hình khác nhau, nên kích thước collider thuộc về loại địch, không thuộc về từng con trong scene. Script đọc `colliderSize` và `colliderOffset` rồi gán cho Box Collider 2D trong `Awake`.

Tạo thư mục `Assets/_Platformer/ScriptableObjects/Enemies`, chuột phải **Create > Platformer > Enemy Data** ba lần, đặt tên `Enemy_Charger`, `Enemy_Cannon`, `Enemy_Flyer`:

| | Charger | Cannon | Flyer |
|---|---|---|---|
| Collider Size / Offset | 1.6 × 1.7 / (0, 0.85) | 1.6 × 1.7 / (0, 0.85) | 1.6 × 1.4 / (0, 0.38) |
| Move Speed | 2.5 | 0 | 3.5 |
| Charge Speed | 11 | | |
| Sight Range / Height | 9 / 3.5 | 14 / 2.5 | |
| Telegraph / Stun | 0.5 / 1.6 | | |
| Attack Cooldown | | 1.8 | |
| Stompable Only When Vulnerable | **bật** | tắt | tắt |
| Sprites | Idle 11, Walk 12, Charge 12, Stun 8, Hit 5 | Idle 11, Walk 12, Attack 7, Hit 5 | Idle 6, Walk 6, Attack 8, Hit 5 |

Cắt mọi sheet trong `Enemies/Charger`, `Enemies/Cannon` và `Enemies/Flyer` thành ô `48 × 48`. Charger và Cannon pivot `Bottom Center` như Jumper ở bài 10. Flyer pivot `Center`: nó không đứng trên gì cả, và tâm là điểm dễ đặt nhất cho thứ bay lơ lửng. Vì vậy collider của Flyer có offset riêng (0, 0.38): phần thân đỏ nằm hơi cao hơn tâm ô, còn hàng gai treo bên dưới không tính vào collider.

![Inspector của Enemy_Charger: Display Name Charger, Collider Size 1.6 1.7, Offset 0 0.85, Move Speed 2.5, Charge Speed 11, Sight Range 9, Sight Height 3.5, Telegraph 0.5, Stun 1.6, Bounce Velocity 20, Stompable Only When Vulnerable bật, các mảng sprite](/images/posts/unity-platformer/11/enemydata-inspector.webp)

## Charger

### Nhìn bằng một cái hộp, không bằng một tia

Charger cần biết người chơi có ở phía trước và "cùng tầng" với nó không. Cách nghĩ đầu tiên là bắn một raycast ngang ở tầm mắt, trúng người chơi thì là thấy. Bản đầu của mình làm vậy, rồi so thêm chênh lệch độ cao với `sightHeight` để chấp nhận người chơi đứng cao hơn một chút.

Người chơi đứng trên bậc thang cao 2 ô thì tia ở tầm mắt con địch trượt qua bên dưới chân họ. Tia không trúng gì, nên đoạn so `sightHeight` phía sau không bao giờ được chạy tới. Tham số vẫn nằm trong Inspector, sửa bao nhiêu cũng không đổi gì.

Cách đúng là dùng `Physics2D.OverlapBox`: một hộp rộng `sightRange`, cao `sightHeight × 2`, đặt ở phía trước con địch. Người chơi chạm vào hộp là thấy.

![Scene view: hộp vàng rộng 9 cao 7 phía trước charger bao trọn người chơi đứng trên bậc, còn tia đỏ ở tầm mắt charger đi ngang qua bên dưới chân người chơi](/images/posts/unity-platformer/11/sight-box-vs-ray.webp)

### Code

Tạo `Assets/_Platformer/Scripts/Enemies/ChargerEnemy.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D), typeof(SpriteRenderer))]
    [RequireComponent(typeof(SpriteSequence))]
    public sealed class ChargerEnemy : MonoBehaviour
    {
        public enum State { Walk, Telegraph, Charge, Stunned, Dead }

        [SerializeField] private EnemyData data;
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private LayerMask playerMask;
        [SerializeField] private int startDirection = -1;
        [SerializeField, Min(0f)] private float probeAhead = 0.2f;
        [SerializeField, Min(0f)] private float probeDepth = 0.6f;
        [SerializeField, Min(0.02f)] private float wallThickness = 0.12f;
        [SerializeField, Min(0f)] private float wallMargin = 0.25f;
        [SerializeField, Min(0f)] private float turnDelay = 0.1f;

        public State Current { get; private set; } = State.Walk;
        public int Direction { get; private set; }
        public bool Vulnerable => Current == State.Stunned;
        public EnemyData Data => data;
        public System.Action<ChargerEnemy> Killed;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private SpriteRenderer sr;
        private SpriteSequence seq;
        private float stateUntil;
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
            if (data != null) { box.size = data.colliderSize; box.offset = data.colliderOffset; }
        }

        private void OnEnable() { Current = State.Walk; PlayClip(data != null ? data.walk : null, true); }

        private void FixedUpdate()
        {
            if (Current == State.Dead || data == null) return;
            turnCooldown -= Time.fixedDeltaTime;

            switch (Current)
            {
                case State.Walk: TickWalk(); break;
                case State.Telegraph: if (Time.time >= stateUntil) Enter(State.Charge); break;
                case State.Charge: TickCharge(); break;
                case State.Stunned: if (Time.time >= stateUntil) Enter(State.Walk); break;
            }
            sr.flipX = Direction > 0;
        }

        private void TickWalk()
        {
            if (turnCooldown <= 0f && (!GroundAhead() || WallAhead())) { Direction = -Direction; turnCooldown = turnDelay; }
            Move(data.moveSpeed);
            if (SeesPlayerAhead()) Enter(State.Telegraph);
        }

        private void TickCharge()
        {
            // Only a wall stuns it. A Kinematic body has no gravity, so a charge that ran
            // past a ledge would carry on through thin air; at a ledge the charge just ends.
            if (WallAhead()) { Enter(State.Stunned); return; }
            if (!GroundAhead()) { Direction = -Direction; turnCooldown = turnDelay; Enter(State.Walk); return; }
            Move(data.chargeSpeed);
        }

        private void Move(float speed) =>
            body.MovePosition(body.position + new Vector2(Direction * speed * Time.fixedDeltaTime, 0f));

        private void Enter(State s)
        {
            Current = s;
            switch (s)
            {
                case State.Telegraph:
                    stateUntil = Time.time + data.telegraphSeconds;
                    PlayClip(data.idle, true);
                    break;
                case State.Charge:
                    PlayClip(data.charge, true);
                    break;
                case State.Stunned:
                    stateUntil = Time.time + data.stunSeconds;
                    PlayClip(data.stun, true);
                    break;
                case State.Walk:
                    PlayClip(data.walk, true);
                    break;
            }
        }

        private void PlayClip(Sprite[] frames, bool loop)
        {
            if (seq == null || frames == null || frames.Length == 0) return;
            seq.Play(frames, data.fps, loop);
        }

        private bool SeesPlayerAhead()
        {
            var b = box.bounds;
            var centre = new Vector2(b.center.x + Direction * data.sightRange * 0.5f, b.center.y);
            var size = new Vector2(data.sightRange, data.sightHeight * 2f);
            var hit = Physics2D.OverlapBox(centre, size, 0f, playerMask);
            if (hit == null) return false;
            // Only what is actually in front counts.
            return Mathf.Sign(hit.bounds.center.x - b.center.x) == Direction;
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
            if (Current == State.Dead) return;
            var motor = other.GetComponentInParent<Player.PlayerMotor>();
            if (motor == null) return;

            var stomped = StompCheck.IsStomp(other, box, motor.Velocity);
            var allowed = !data.stompableOnlyWhenVulnerable || Vulnerable;

            if (stomped && allowed)
            {
                var rb = motor.GetComponent<Rigidbody2D>();
                if (rb != null) rb.linearVelocity = new Vector2(rb.linearVelocity.x, data.bounceVelocity);
                Die();
            }
            else
            {
                var life = other.GetComponentInParent<Player.PlayerLife>();
                if (life != null) life.Kill(data.displayName);
            }
        }

        public void Die()
        {
            if (Current == State.Dead) return;
            Current = State.Dead;
            box.enabled = false;
            Killed?.Invoke(this);
            PlayClip(data.hit, false);
            Invoke(nameof(HideNow), 0.35f);
        }

        private void HideNow() => gameObject.SetActive(false);

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null || data == null) return;
            var b = bc.bounds;
            var dir = Application.isPlaying ? Direction : (startDirection >= 0 ? 1 : -1);
            Gizmos.color = Vulnerable ? Color.green : Color.red;
            Gizmos.DrawWireCube(b.center, b.size);
            Gizmos.color = Color.yellow;
            var eye = new Vector3(dir > 0 ? b.max.x : b.min.x, b.center.y, 0f);
            Gizmos.DrawLine(eye, eye + Vector3.right * dir * data.sightRange);
        }
    }
}
```

`FixedUpdate` chỉ là một `switch` theo trạng thái hiện tại. Mỗi trạng thái có một việc: `Walk` đi tuần như bài 10 và nhìn phía trước, `Telegraph` chờ hết giờ, `Charge` lao đi và dò tường, `Stunned` chờ hết giờ. `Enter` là chỗ duy nhất đổi trạng thái, và nó đổi luôn dãy sprite cho khớp. Mọi con số đều đọc từ `data`.

`Vulnerable` chỉ đúng khi đang `Stunned`. `Touch` giống hệt bài 10, thêm đúng một điều kiện: nếu `stompableOnlyWhenVulnerable` bật mà con địch không yếu, giẫm trúng cũng tính là chạm, và người chơi chết. Một dòng bool, nhưng là cả một luật chơi. Jumper ở bài 10 để tắt nên giẫm lúc nào cũng được. Charger bật nên người chơi phải dụ nó đâm tường trước. Boss ở bài 12 dùng lại đúng cờ này.

### Dựng charger

1. Trong `Enemies`, tạo `Enemy_Charger` ở `(40, 2, 0)`, trên sàn giữa bậc thang và hai cột. Layer `Enemy`.
2. **Sprite Renderer**: sprite `Idle_0` của Charger, Sorting Layer `Enemies`.
3. **Sprite Sequence**: bỏ tick Play On Enable.
4. **Rigidbody 2D**: `Kinematic`, tick Freeze Rotation Z.
5. **Box Collider 2D**: để mặc định. `ChargerEnemy` ghi đè kích thước từ `EnemyData` lúc `Awake`, nên trong Edit mode khung collider còn to bằng cả ô 3 × 3. Muốn xem đúng khung, chọn con địch trong lúc Play.
6. **Charger Enemy**: Data `Enemy_Charger`, Ground Mask `Ground`, Player Mask `Player`, Start Direction `-1`.

Con địch đi tuần giữa mặt bậc thang (x = 34) và cột trái (x = 48).

## Cannon và object pool

Khẩu pháo bắn một viên đạn mỗi 1.8 giây khi thấy người chơi. Mỗi viên sống tối đa 4 giây. Tạo mới bằng `Instantiate` rồi `Destroy` khi hết hạn thì mỗi phát bắn sinh ra một object mới và rác cho bộ thu gom. Series shmup đã giải quyết đúng chuyện này ở [Shmup #4: Object Pool](/lab/unity-shmup-04-object-pool/): giữ sẵn vài viên đạn tắt, bắn thì bật một viên lên, hết hạn thì tắt đi và cất lại.

Pool đó nằm trong `Assets/_Common/Scripts/Pooling/`, dùng chung cho mọi game trong project. Nếu bạn chưa theo series shmup, tạo hai file sau:

```csharp
using UnityEngine;
using UnityEngine.Pool;

namespace BillLab.Common.Pooling
{
    public sealed class PrefabPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField] private int prewarm = 20;
        [SerializeField] private int maxSize = 100;

        private ObjectPool<GameObject> pool;

        public int CountActive => pool.CountActive;
        public int CountInactive => pool.CountInactive;

        private void Awake()
        {
            pool = new ObjectPool<GameObject>(
                createFunc: Create,
                actionOnGet: go => go.SetActive(true),
                actionOnRelease: go => go.SetActive(false),
                actionOnDestroy: Destroy,
                collectionCheck: true,
                defaultCapacity: prewarm,
                maxSize: maxSize);

            var warm = new GameObject[prewarm];
            for (var i = 0; i < prewarm; i++) warm[i] = pool.Get();
            for (var i = 0; i < prewarm; i++) pool.Release(warm[i]);
        }

        public GameObject Get(Vector3 position, Quaternion rotation)
        {
            var go = pool.Get();
            go.transform.SetPositionAndRotation(position, rotation);
            return go;
        }

        public void Release(GameObject go) => pool.Release(go);

        private GameObject Create()
        {
            var go = Instantiate(prefab, transform);
            go.name = prefab.name;
            var pooled = go.GetComponent<PooledObject>();
            if (pooled == null) pooled = go.AddComponent<PooledObject>();
            pooled.Pool = this;
            return go;
        }
    }
}
```

```csharp
using UnityEngine;

namespace BillLab.Common.Pooling
{
    [DisallowMultipleComponent]
    public sealed class PooledObject : MonoBehaviour
    {
        public PrefabPool Pool { get; internal set; }

        public void Release()
        {
            if (Pool != null) Pool.Release(gameObject);
            else Destroy(gameObject);
        }
    }
}
```

`PrefabPool` bọc `ObjectPool<T>` có sẵn của Unity, tạo trước `prewarm` bản sao lúc `Awake` để phát bắn đầu tiên không bị giật. `PooledObject` gắn trên mỗi bản sao, cho viên đạn tự trả mình về pool mà không cần biết pool nào.

### Viên đạn

Tạo `Assets/_Platformer/Scripts/Enemies/Cannonball.cs`:

```csharp
using UnityEngine;
using BillLab.Common.Pooling;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(Collider2D), typeof(PooledObject))]
    public sealed class Cannonball : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float speed = 8f;
        [SerializeField, Min(0f)] private float lifetime = 4f;
        [SerializeField] private LayerMask blockMask;     // ground: the ball dies on impact

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnTime;
        private Vector2 direction = Vector2.right;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
            body.bodyType = RigidbodyType2D.Kinematic;
            GetComponent<Collider2D>().isTrigger = true;
        }

        private void OnEnable() => despawnTime = Time.time + lifetime;

        public void Fire(Vector2 dir, float newSpeed = -1f)
        {
            direction = dir.normalized;
            if (newSpeed > 0f) speed = newSpeed;
            despawnTime = Time.time + lifetime;
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + direction * (speed * Time.fixedDeltaTime));
            if (Time.time >= despawnTime) pooled.Release();
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if ((blockMask.value & (1 << other.gameObject.layer)) != 0) { pooled.Release(); return; }
            var life = other.GetComponentInParent<Player.PlayerLife>();
            if (life != null) { life.Kill("cannonball"); pooled.Release(); }
        }
    }
}
```

Một object lấy từ pool mang theo trạng thái của lần sống trước. Vì vậy mọi thứ phải đúng ở đầu một lần sống (hạn chết) được đặt lại trong `OnEnable` và `Fire`, không chỉ trong `Awake`. Chạm `Ground` thì viên đạn tự trả về pool. Chạm người chơi thì gọi `Kill` rồi cũng trả về.

Tạo prefab `Assets/_Platformer/Prefabs/Cannonball.prefab`: layer `EnemyProjectile` (User Layer mới), **Sprite Renderer** với `Cannonball1` (10 × 10 pixel, pivot `Center`) trên sorting layer `Projectiles`, **Rigidbody 2D** Kinematic, **Circle Collider 2D** Radius `0.3` tick Is Trigger, **Pooled Object**, **Cannonball** với Block Mask `Ground`. Kiểm tra bảng va chạm: `EnemyProjectile × Player` và `EnemyProjectile × Ground` phải tick.

### Khẩu pháo

Tạo `Assets/_Platformer/Scripts/Enemies/CannonEnemy.cs`:

```csharp
using UnityEngine;
using BillLab.Common.Pooling;
using Platformer.Common;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(BoxCollider2D), typeof(SpriteRenderer), typeof(SpriteSequence))]
    public sealed class CannonEnemy : MonoBehaviour
    {
        [SerializeField] private EnemyData data;
        [SerializeField] private LayerMask playerMask;
        [SerializeField] private PrefabPool ballPool;
        [SerializeField] private Transform muzzle;
        [SerializeField] private int startDirection = -1;
        [SerializeField, Min(0f)] private float ballSpeed = 9f;

        public bool IsDead { get; private set; }
        public int Direction { get; private set; }
        public int ShotsFired { get; private set; }
        public System.Action<CannonEnemy> Killed;

        private BoxCollider2D box;
        private SpriteRenderer sr;
        private SpriteSequence seq;
        private float nextShotTime;

        private void Awake()
        {
            box = GetComponent<BoxCollider2D>();
            sr = GetComponent<SpriteRenderer>();
            seq = GetComponent<SpriteSequence>();
            Direction = startDirection >= 0 ? 1 : -1;
            if (data != null) { box.size = data.colliderSize; box.offset = data.colliderOffset; }
        }

        private void OnEnable()
        {
            IsDead = false;
            if (data != null) seq.Play(data.idle, data.fps, true);
        }

        private void Update()
        {
            if (IsDead || data == null) return;
            sr.flipX = Direction > 0;
            if (Time.time < nextShotTime || !SeesPlayer()) return;
            Shoot();
        }

        private bool SeesPlayer()
        {
            var b = box.bounds;
            var centre = new Vector2(b.center.x + Direction * data.sightRange * 0.5f, b.center.y);
            var size = new Vector2(data.sightRange, data.sightHeight * 2f);
            var hit = Physics2D.OverlapBox(centre, size, 0f, playerMask);
            if (hit == null) return false;
            return Mathf.Sign(hit.bounds.center.x - b.center.x) == Direction;
        }

        private void Shoot()
        {
            nextShotTime = Time.time + data.attackCooldown;
            ShotsFired++;
            if (data.attack != null && data.attack.Length > 0)
            {
                seq.Play(data.attack, data.fps, false);
                seq.Completed = null;
                seq.Completed += () => { if (!IsDead) seq.Play(data.idle, data.fps, true); };
            }
            if (ballPool == null) return;

            var from = muzzle != null ? (Vector2)muzzle.position : (Vector2)box.bounds.center;
            var go = ballPool.Get(from, Quaternion.identity);
            var ball = go.GetComponent<Cannonball>();
            if (ball != null) ball.Fire(new Vector2(Direction, 0f), ballSpeed);
        }

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
                if (rb != null) rb.linearVelocity = new Vector2(rb.linearVelocity.x, data.bounceVelocity);
                Die();
            }
            else
            {
                var life = other.GetComponentInParent<Player.PlayerLife>();
                if (life != null) life.Kill(data.displayName);
            }
        }

        public void Die()
        {
            if (IsDead) return;
            IsDead = true;
            box.enabled = false;
            Killed?.Invoke(this);
            if (data.hit != null && data.hit.Length > 0) seq.Play(data.hit, data.fps, false);
            Invoke(nameof(HideNow), 0.35f);
        }

        private void HideNow() => gameObject.SetActive(false);
    }
}
```

Khẩu pháo không di chuyển nên không cần Rigidbody, chỉ cần collider để người chơi chạm và giẫm. Nhìn bằng hộp như charger. Mỗi phát bắn phát 7 frame `Attack`, khi xong thì `Completed` trả về dãy `Idle`, rồi lấy một viên đạn từ pool đặt ở `muzzle`.

Dựng trong scene:

1. Tạo GameObject rỗng `CannonballPool` ở gốc scene, thêm **Prefab Pool**: Prefab `Cannonball`, Prewarm `8`, Max Size `40`.
2. Trong `Enemies`, tạo `Enemy_Cannon` ở `(55, 23, 0)`, trên đỉnh cột phải, quay mặt sang trái. Layer `Enemy`, Sprite Renderer với `Idle_0` của Cannon trên sorting layer `Enemies`, Sprite Sequence bỏ tick Play On Enable, Box Collider 2D.
3. Tạo con `Muzzle` bên trong `Enemy_Cannon`, Position `(-1.0, 1.0, 0)`.
4. **Cannon Enemy**: Data `Enemy_Cannon`, Player Mask `Player`, Ball Pool `CannonballPool`, Muzzle `Muzzle`.

`Muzzle` là miệng nòng pháo. Mở sheet `Idle` của Cannon ra đếm pixel: miệng nòng ở cách tâm ô 16 pixel về bên trái và cao hơn đáy ô khoảng 16 pixel, tức (−1.0, 1.0) unit. Khẩu pháo đứng canh đường nhảy từ đỉnh cột trái sang đỉnh cột phải ở bài 9. Hộp nhìn của nó cao 2.5 unit mỗi phía quanh tâm, nên chỉ thấy người chơi khi họ đã lên tới độ cao đỉnh cột.

## Flyer

Tạo `Assets/_Platformer/Scripts/Enemies/FlyerEnemy.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D), typeof(SpriteRenderer))]
    [RequireComponent(typeof(SpriteSequence))]
    public sealed class FlyerEnemy : MonoBehaviour
    {
        public enum State { Patrol, Dive, Return, Dead }

        [SerializeField] private EnemyData data;
        [SerializeField] private LayerMask playerMask;
        [SerializeField, Min(0f)] private float patrolHalfWidth = 4f;
        [SerializeField, Min(0f)] private float bobAmplitude = 0.4f;
        [SerializeField, Min(0f)] private float bobSpeed = 2f;
        [SerializeField, Min(0f)] private float diveRange = 7f;
        [SerializeField, Min(0f)] private float diveSpeed = 12f;
        [SerializeField, Min(0f)] private float returnSpeed = 5f;

        public State Current { get; private set; } = State.Patrol;
        public System.Action<FlyerEnemy> Killed;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private SpriteRenderer sr;
        private SpriteSequence seq;
        private Vector2 home;
        private int dir = 1;
        private float diveTargetY;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            box = GetComponent<BoxCollider2D>();
            sr = GetComponent<SpriteRenderer>();
            seq = GetComponent<SpriteSequence>();
            body.bodyType = RigidbodyType2D.Kinematic;
            body.freezeRotation = true;
            home = body.position;
            if (data != null) { box.size = data.colliderSize; box.offset = data.colliderOffset; }
        }

        private void OnEnable()
        {
            Current = State.Patrol;
            if (data != null && data.walk != null && data.walk.Length > 0) seq.Play(data.walk, data.fps, true);
        }

        private void FixedUpdate()
        {
            if (Current == State.Dead || data == null) return;
            var pos = body.position;

            switch (Current)
            {
                case State.Patrol:
                    if (pos.x > home.x + patrolHalfWidth) dir = -1;
                    if (pos.x < home.x - patrolHalfWidth) dir = 1;
                    pos.x += dir * data.moveSpeed * Time.fixedDeltaTime;
                    pos.y = home.y + Mathf.Sin(Time.time * bobSpeed) * bobAmplitude;
                    if (PlayerBelow(out var hitY)) { diveTargetY = hitY; Enter(State.Dive); }
                    break;

                case State.Dive:
                    pos.y -= diveSpeed * Time.fixedDeltaTime;
                    if (pos.y <= diveTargetY) Enter(State.Return);
                    break;

                case State.Return:
                    pos.y = Mathf.MoveTowards(pos.y, home.y, returnSpeed * Time.fixedDeltaTime);
                    if (Mathf.Abs(pos.y - home.y) < 0.05f) Enter(State.Patrol);
                    break;
            }

            body.MovePosition(pos);
            sr.flipX = dir > 0;
        }

        private void Enter(State s)
        {
            Current = s;
            if (data == null) return;
            if (s == State.Dive && data.attack != null && data.attack.Length > 0) seq.Play(data.attack, data.fps, true);
            else if (data.walk != null && data.walk.Length > 0) seq.Play(data.walk, data.fps, true);
        }

        private bool PlayerBelow(out float y)
        {
            y = 0f;
            var b = box.bounds;
            var hit = Physics2D.Raycast(new Vector2(b.center.x, b.min.y - 0.05f), Vector2.down, diveRange, playerMask);
            if (hit.collider == null) return false;
            // Stop where the collider's bottom meets the top of the player's head. The
            // offset matters: with the pivot at the sprite centre the collider sits higher
            // than the transform, and ignoring it leaves the dive hovering above the head.
            y = hit.collider.bounds.max.y - box.offset.y + box.size.y * 0.5f;
            return true;
        }

        private void OnCollisionEnter2D(Collision2D c) => Touch(c.collider);
        private void OnTriggerEnter2D(Collider2D c) => Touch(c);

        private void Touch(Collider2D other)
        {
            if (Current == State.Dead) return;
            var motor = other.GetComponentInParent<Player.PlayerMotor>();
            if (motor == null) return;
            if (StompCheck.IsStomp(other, box, motor.Velocity))
            {
                var rb = motor.GetComponent<Rigidbody2D>();
                if (rb != null) rb.linearVelocity = new Vector2(rb.linearVelocity.x, data.bounceVelocity);
                Die();
            }
            else
            {
                var life = other.GetComponentInParent<Player.PlayerLife>();
                if (life != null) life.Kill(data.displayName);
            }
        }

        public void Die()
        {
            if (Current == State.Dead) return;
            Current = State.Dead;
            box.enabled = false;
            Killed?.Invoke(this);
            if (data.hit != null && data.hit.Length > 0) seq.Play(data.hit, data.fps, false);
            Invoke(nameof(HideNow), 0.35f);
        }

        private void HideNow() => gameObject.SetActive(false);

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.cyan;
            var h = Application.isPlaying ? home : (Vector2)transform.position;
            Gizmos.DrawLine(new Vector3(h.x - patrolHalfWidth, h.y, 0f), new Vector3(h.x + patrolHalfWidth, h.y, 0f));
            Gizmos.color = Color.yellow;
            Gizmos.DrawLine(transform.position, transform.position + Vector3.down * diveRange);
        }
    }
}
```

Flyer bỏ qua địa hình hoàn toàn: không dò mép, không dò tường, bay qua lại quanh điểm xuất phát trong khoảng `patrolHalfWidth` và nhấp nhô theo hàm sin. Nó nhìn thẳng xuống bằng một tia dài `diveRange`. Ở đây dùng tia là đủ, vì nó chỉ cần biết có người chơi ngay bên dưới hay không. Thấy thì tính độ cao dừng bổ nhào, lao xuống với 12 unit/giây, tới đó thì bay ngược về độ cao cũ với 5 unit/giây, rồi tuần tiếp.

Dựng `Enemy_Flyer` ở `(12, 13, 0)`, phía trên bệ 1: layer `Enemy`, sprite `Idle_0` của Flyer trên `Enemies`, Sprite Sequence bỏ tick Play On Enable, Rigidbody 2D Kinematic Freeze Rotation Z, Box Collider 2D, **Flyer Enemy** với Data `Enemy_Flyer`, Player Mask `Player`, Patrol Half Width `4`.

![Hai khung: Flyer bay phía trên, người chơi đứng trên bệ 1 bên dưới; Flyer đã bổ nhào xuống, hàng gai chạm đầu người chơi](/images/posts/unity-platformer/11/flyer-dive.webp)

## Những lỗi code vẫn chạy mà không làm gì

Bài này có sáu lỗi cùng một dạng: code biên dịch, chạy, không báo gì, nhưng không làm điều nó được viết ra để làm. Ba lỗi đầu mình gặp lúc dựng. Ba lỗi sau mình tìm ra khi dựng lại mọi thứ từng bước để chụp ảnh cho bài này, sau khi đã tin là game chạy đúng.

**1. Hai layer cùng tên `Player`.** Charger đi tuần bình thường nhưng không bao giờ lao. Project có hai layer tên `Player`: layer 6 có sẵn từ series shmup, và layer 12 mình tự thêm lúc làm bài 2 mà không để ý tên đã có. Object người chơi nằm ở layer 12, còn `LayerMask.NameToLayer("Player")` luôn trả về layer đầu tiên mang tên đó, tức 6. Mask trỏ vào layer 6, hộp nhìn không bao giờ thấy người chơi. Khi thêm layer, hãy đọc hết danh sách xem tên đã có chưa, kể cả các ô ở trên.

**2. Tia ở tầm mắt làm `sightHeight` thành con số chết.** Đã kể ở mục "Nhìn bằng một cái hộp".

**3. `enabled = false` không làm người chơi bất tử.** Lúc dựng, mình tắt component `PlayerLife` để quan sát địch mà không bị chết liên tục. Người chơi vẫn chết khi trúng đạn. Tắt component chỉ khiến Unity ngừng gọi `Update`, `FixedUpdate` và các callback của nó. Code khác vẫn gọi được hàm public của nó: `Cannonball` tìm `PlayerLife` bằng `GetComponentInParent`, hàm này vẫn trả về component đang tắt, và gọi `Kill`. Vì vậy `Kill` ở bài 8 kiểm tra cả `!enabled`, và có property `Invulnerable` riêng cho lúc cần bất tử thật.

**4. Charger lao qua mép bệ và bay giữa không trung.** Bản đầu của `TickCharge` cố ý không dò mép, với ý định "lao hụt là rơi xuống vực, phần thưởng cho người chơi biết dụ". Mình chưa từng thử cho nó lao ra khỏi một bệ. Thử rồi mới thấy: đặt charger trên bệ 1, người chơi ở phía trước, nó lao qua mép bệ ở x = 17 và cứ thế bay ngang ở độ cao y = 7 tới tận x = 39. Charger là Kinematic, không có trọng lực, nên không có gì kéo nó xuống. Muốn nó rơi thật phải tự viết trọng lực và phát hiện tiếp đất cho nó. Mình chọn cách đơn giản hơn: tới mép thì cú lao kết thúc, con địch quay đầu đi tuần tiếp, và chỉ đâm tường mới bị choáng. Sau khi sửa, cú lao trên bệ 1 dừng ở x = 16.13.

**5. Đạn pháo sinh ra bên trong cột.** `Muzzle` ban đầu đặt ở (−1.1, −0.1), đúng khi sprite còn pivot ở tâm ô. Sau khi đổi pivot về đáy ô trong một lần soát lại toàn bộ sprite, không ai sửa lại `Muzzle`, và nó rơi xuống ngang chân khẩu pháo. Đứng trên đỉnh cột trái 5 giây trước khẩu pháo: nó bắn 3 phát và người chơi không hề hấn gì, vì mỗi viên đạn sinh ra đã nằm trong cột phải, chạm `Ground` và tự trả về pool ngay bước vật lý đầu tiên. Đặt lại `Muzzle` theo pixel của miệng nòng là (−1.0, 1.0), đứng đúng chỗ đó thì chết sau 0.46 giây.

![Bên trái: Muzzle cũ, không có viên đạn nào bay ra. Bên phải: Muzzle mới, viên đạn đang bay từ miệng nòng về phía người chơi](/images/posts/unity-platformer/11/cannon-muzzle.webp)

**6. Flyer bổ nhào rồi dừng lơ lửng trên đầu.** Bản đầu tính độ cao dừng là `đỉnh đầu người chơi + nửa chiều cao collider`, tức là coi tâm collider trùng với `transform.position`. Collider của Flyer có offset 0.38, nên khi dừng, đáy collider còn cách đầu người chơi 0.38 unit. Đứng yên dưới nó 4 giây: nó bổ nhào 4 lần, lần nào cũng dừng cách đầu 0.37 tới 0.46 unit, và người chơi không chết lần nào. Trừ `box.offset.y` vào công thức thì đáy collider dừng đúng ở đỉnh đầu, và người chơi chết ở lần bổ nhào đầu tiên, sau 0.34 giây.

Cả sáu lỗi đều không có dòng đỏ nào trong Console. Ba lỗi sau còn sống sót qua mọi lần mình kiểm tra trước đó, vì các lần đó chỉ kiểm tra từng con địch có "hoạt động" không, chứ chưa kiểm tra nó có làm được đúng việc của nó với người chơi hay không.

## Kiểm tra

Mình cho người chơi đứng trên bậc cao ở x = 33 và ghi lại trạng thái charger:

| Thời điểm | Trạng thái | Vị trí charger |
|---|---|---|
| 0.00 s | Telegraph (thấy người ngay lúc bắt đầu) | 40.00 |
| 0.52 s | Charge | 39.95 |
| 1.00 s | Stunned, đâm vào mặt bậc ở x = 34 | 34.89 |

Khựng 0.52 giây, khớp `Telegraph Seconds` 0.5 (lệch một bước vật lý). Charger dừng ở 34.89, kỳ vọng là mặt bậc cộng nửa collider 0.8, bề dày hộp dò 0.12 và khe 0.02, tức 34.94. Lao 11 unit/giây thì mỗi bước đi 0.22 unit, nên nó dừng ở bước đầu tiên hộp dò chạm bậc.

![Bốn khung: charger thấy người trên bậc và đứng khựng, lao tới, đâm vào bậc và choáng với sao quanh đầu, người chơi nhảy lên giẫm](/images/posts/unity-platformer/11/charger-sequence.webp)

- Nhảy lên giẫm lúc charger đang choáng: nó chết, người chơi nảy lên với vận tốc 20.
- Thả người chơi xuống đầu charger lúc nó vừa thấy và đang khựng: người chơi chết sau 0.22 giây, dù chân đáp đúng trên đỉnh con địch.
- Đứng bất tử trên đỉnh cột trái 31 giây trước khẩu pháo: 18 phát bắn, cách nhau đúng 1.80 giây. `CannonballPool` giữ đúng 8 object con suốt cả lúc đó: pool không tạo thêm viên nào sau 8 viên tạo sẵn.
- Đứng trên bệ 1 dưới Flyer: nó bổ nhào và người chơi chết sau 0.34 giây.

Tự thử bằng tay:

- Đứng trên bậc cao, chờ charger lao vào bậc, nhảy xuống giẫm trong 1.6 giây nó choáng.
- Giẫm charger lúc nó đang đi tuần: bạn chết.
- Chọn `CannonballPool` trong Hierarchy lúc Play và bấm mũi tên: 8 viên đạn, một viên sáng lên mỗi lần pháo bắn rồi tắt lại. Số object con không bao giờ tăng.
- Chạy trên bệ 1 bên dưới Flyer rồi dừng lại: nó bổ nhào xuống. Chạy tiếp ngay khi thấy nó lao thì tránh được.

## Bài sau

Nhân vật không có đòn đánh nào, vậy một trận đấu boss trông ra sao? Bài 12 làm con Brute: khựng lại, lao qua lại giữa hai vách, và chỉ giẫm được trong lúc nó thở dốc sau cú lao. Nó dùng lại gần như mọi thứ của bài này: `EnemyData`, cờ `stompableOnlyWhenVulnerable`, `Probe`, cộng thêm một lỗi các con địch trước chưa gặp: giẫm trúng rồi mà người chơi vẫn chết.
