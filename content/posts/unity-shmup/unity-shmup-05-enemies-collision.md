---
title: "Shmup #5: Luật va chạm — từ chạm nhau đến sát thương và cái chết"
date: "2026-09-18"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-05-enemies-collision
series: "shmup"
order: 5
excerpt: "Viết luật tương tác trước khi ráp collider; hoàn thiện Health, DamageOnContact và EnemyMover cùng bài thử có thể lặp lại."
coverImage: "/images/posts/unity-shmup/05/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-rules"><strong>LUẬT CỦA CHẶNG NÀY</strong><p>Đạn ta → địch: mất 1 HP, đạn biến mất.</p><p>Địch → tàu: mất 1 HP khi bắt đầu chạm, địch tiếp tục bay.</p><p>Đạn ta → tàu / địch → địch: bỏ qua.</p></div>

## Viết luật trước khi chọn component

Tới giờ đạn vẫn bay xuyên qua mọi thứ. Bài này đặt ra luật cho từng cặp va chạm: đạn của bạn trúng địch thì địch mất máu, địch đâm vào tàu thì tàu mất máu, các cặp còn lại thì bỏ qua. Phần khó không nằm ở code mà ở cái lưới checkbox trong Physics 2D, vì tick sai một ô là đạn bay xuyên qua địch mà Console không báo gì cả.

Đầu vào là hệ bắn có pool, lưu scene thành `SEU_05_Enemies`. Đầu ra là ba con địch bay xuống, mỗi con 2 HP, tàu có 3 HP. Chưa có HUD nên bạn kiểm tra bằng cách nhìn object bị dọn, hoặc đọc Health qua Inspector ở chế độ Debug.

Bốn thứ phối hợp với nhau ở đây. **Collider2D** mô tả vùng chạm của object. **Trigger** báo hai vùng chồng lên nhau mà không đẩy bật nhau ra. **Rigidbody2D** đưa object vào mô phỏng physics. **Layer Collision Matrix** chọn những cặp nào đáng được xét. Chỉ khi bốn phần này rõ thì việc đi tick checkbox mới có nghĩa.

## Bảng luật trở thành ma trận tick

Vào **Project Settings → Tags and Layers** và tạo các user layer còn trống: Player, PlayerProjectile, Enemy, EnemyProjectile, Pickup. Số thứ tự của chúng không cần trùng với ảnh.

![Danh sách user layer sau khi thêm](/images/posts/unity-shmup/05/enemy_01_layers.webp)

Giờ sang **Project Settings → Physics 2D → Layer Collision Matrix**. Với năm layer vừa tạo, chỉ bật đúng bốn cặp:

| Cặp | Bật | Lý do |
|---|---|---|
| PlayerProjectile × Enemy | Có | Đạn ta trúng địch |
| Player × Enemy | Có | Địch đâm tàu |
| Player × EnemyProjectile | Có | Dành cho bài tập đạn địch |
| Player × Pickup | Có | Dùng ở bài 9 |
| Các cặp còn lại của năm layer này | Không | Không có tương tác trong game |

![Layer Collision Matrix với bốn ô được tick](/images/posts/unity-shmup/05/enemy_02_collision-matrix.webp)

Đây là tấm ảnh đáng nhìn kỹ nhất bài. Ma trận này là lưới tam giác, tên layer viết dọc, và một ô nằm ở giao của hai hàng cột cách nhau khá xa. Tick lệch một ô thì physics im lặng bỏ qua cặp đó, đạn bay xuyên qua địch, mà Console không in ra dòng nào cả. Đối chiếu ảnh với màn hình của bạn trước khi đi tiếp.

Nhắc lại phân biệt từ bài 1 vì bây giờ cả hai cùng có mặt: **Sorting Layer** quyết định sprite nào vẽ đè lên sprite nào, **Layer** quyết định cặp nào được physics xét tới. Đặt đúng Sorting mà sai Layer thì hình nhìn đẹp nhưng va chạm không xảy ra.

Một điểm về trigger cần biết trước khi ráp: theo [tài liệu RigidbodyType2D.Kinematic của Unity](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RigidbodyType2D.Kinematic.html), trigger là ngoại lệ của giới hạn Kinematic–Kinematic. Tức là hai object Kinematic vẫn nhận được trigger của nhau mà không cần bật Full Kinematic Contacts. Điều kiện còn lại: ít nhất một phía phải có Rigidbody2D, và cả hai phải dùng physics **2D** chứ không lẫn 3D.

## Health giữ máu, DamageOnContact giữ cú chạm

Luồng cần có: nhận overlap, tìm `Health`, trừ máu, thông báo thay đổi, nếu hết máu thì báo chết, rồi dọn theo chính sách riêng của từng loại. Địch chết thì trả về pool hoặc `Destroy`. Tàu thì giữ lại, để bài 8 còn đọc được HP mà hiện màn hình Game Over.

**Assets/_ShootEmUp/Scripts/Combat/Health.cs**

```csharp
using System;
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    [DefaultExecutionOrder(-100)]
    public sealed class Health : MonoBehaviour
    {
        [Tooltip("Hit points at spawn. Restored every time the object is enabled, so pooled objects come back full.")]
        [SerializeField] private int maxHealth = 1;

        [Tooltip("Enemies and projectiles vanish when they die (pool release or Destroy). The player ship stays so the HUD and Game Over screen can still read it.")]
        [SerializeField] private bool removeOnDeath = true;

        public int Max => maxHealth;
        public int Current { get; private set; }
        public bool IsDead => Current <= 0;
        public bool Invulnerable { get; set; }
        public event Action<Health> Changed;
        public event Action<Health> Damaged;
        public event Action<Health> Died;

        private void OnEnable()
        {
            Current = maxHealth;
            Invulnerable = false;
            Changed?.Invoke(this);
        }
        public void SetMax(int value)
        {
            maxHealth = Mathf.Max(1, value);
            Current = maxHealth;
            Changed?.Invoke(this);
        }

        public void Heal(int amount)
        {
            if (IsDead || amount <= 0) return;
            Current = Mathf.Min(maxHealth, Current + amount);
            Changed?.Invoke(this);
        }

        public void TakeDamage(int amount)
        {
            if (IsDead || Invulnerable || amount <= 0) return;

            Current = Mathf.Max(0, Current - amount);
            Changed?.Invoke(this);
            Damaged?.Invoke(this);
            if (!IsDead) return;

            Died?.Invoke(this);
            if (!removeOnDeath) return;

            var pooled = GetComponent<PooledObject>();
            if (pooled != null) pooled.Release();
            else Destroy(gameObject);
        }
    }
}
```

`Current` là trạng thái riêng của từng instance và được nạp đầy trong `OnEnable`, đúng theo luật pool ở bài 4. Con địch tái sử dụng vì thế luôn bắt đầu với máu đầy.

Ba event phục vụ ba mục đích khác nhau, và chia nhỏ như vậy để bài 8 với bài 10 không phải sửa lại. `Changed` bắn mỗi khi con số đổi, kể cả lúc hồi máu, nên nó hợp cho HUD. `Damaged` chỉ bắn khi thật sự trúng đòn, nên bài 10 dùng nó cho hiệu ứng nháy và tiếng va chạm mà không nháy nhầm lúc nhặt bình máu. `Died` chỉ bắn đúng một lần khi HP về 0.

`[DefaultExecutionOrder(-100)]` đẩy `Health` khởi tạo trước các component thường. Không có nó, một listener chạy `OnEnable` sớm hơn có thể đọc `Current` khi giá trị chưa được nạp.

Giờ tới phần gây sát thương.

**Assets/_ShootEmUp/Scripts/Combat/DamageOnContact.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;
namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Collider2D))]
    public sealed class DamageOnContact : MonoBehaviour
    {
        [SerializeField, Min(0)] private int damage = 1;
        [SerializeField] private bool releaseSelfOnHit = true;
        public int Damage { get => damage; set => damage = Mathf.Max(0, value); }
        private bool consumed;
        private void OnEnable() => consumed = false;
        private void OnTriggerEnter2D(Collider2D other)
        {
            if (consumed || !isActiveAndEnabled) return;
            var health = other.GetComponentInParent<Health>();
            if (health == null || health.IsDead) return;
            if (releaseSelfOnHit) consumed = true;
            health.TakeDamage(damage);
            if (!releaseSelfOnHit) return;
            var pooled = GetComponent<PooledObject>();
            if (pooled != null) pooled.Release();
            else Destroy(gameObject);
        }
    }
}
```

Thứ tự trong `OnTriggerEnter2D` là chỗ đi xa hơn tutorial thường của bài này. Cờ `consumed` được đặt **trước** khi gọi `TakeDamage`, không phải sau.

Lý do: một viên đạn có thể chạm hai con địch đang chồng collider trong cùng một bước physics, và Unity gọi `OnTriggerEnter2D` hai lần liên tiếp trước khi object kịp tắt. Đặt cờ sau khi trừ máu thì lần gọi thứ hai vẫn lọt qua và một viên giết được hai con. Đặt trước thì lần thứ hai bị chặn ngay ở dòng đầu. Đây là luật hoàn chỉnh của bài chứ không phải chỗ tạm bợ chờ bài wave sửa. Cờ được reset trong `OnEnable` cho lượt sống sau.

`GetComponentInParent<Health>()` chứ không phải `GetComponent`, vì collider có thể nằm trên một object con. Với tàu thì `Health` ở object cha còn collider có thể ở đâu đó bên dưới.

## Cho địch bay rồi ra khỏi màn hình

Tạo cả hai file sau rồi mới Add Component `EnemyMover`.

**Assets/_ShootEmUp/Scripts/Core/ScreenBounds.cs**

```csharp
using UnityEngine;

namespace ShootEmUp.Core
{
    public static class ScreenBounds
    {
        public static Rect Get(Camera camera = null)
        {
            if (camera == null) camera = Camera.main;

            var halfHeight = camera.orthographicSize;
            var halfWidth = halfHeight * camera.aspect;
            var center = (Vector2)camera.transform.position;
            return new Rect(center.x - halfWidth, center.y - halfHeight, halfWidth * 2f, halfHeight * 2f);
        }
    }
}
```

**Assets/_ShootEmUp/Scripts/Enemies/EnemyMover.cs**

```csharp
using BillLab.Common.Pooling;
using ShootEmUp.Core;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class EnemyMover : MonoBehaviour
    {
        [Tooltip("World units per second, downwards.")]
        [SerializeField] private float speed = 3f;

        [Tooltip("Extra distance below the screen before the enemy is recycled, so it fully disappears first.")]
        [SerializeField] private float despawnMargin = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnY;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            despawnY = ScreenBounds.Get().yMin - despawnMargin;
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + Vector2.down * (speed * Time.fixedDeltaTime));

            if (body.position.y < despawnY)
            {
                pooled.Release();
            }
        }
    }
}
```

`ScreenBounds` gói phép tính vùng camera lại một chỗ, vì bài 7 và bài 9 sẽ dùng lại nó để chọn chỗ spawn và chỗ dọn.

Địch bay khỏi màn hình được trả về pool bằng `Release`, không đi qua `TakeDamage`. Phân biệt này quan trọng cho bài 8: con địch trôi ra khỏi đáy màn hình không được tính là bị giết nên không cộng điểm, còn con bị bắn chết thì có.

`despawnMargin` để địch khuất hẳn rồi mới biến mất, tránh cảnh người chơi nhìn thấy nó bốc hơi ngay trên mép dưới.

## Ráp ba loại object

Ba object, cùng một bảng luật ở đầu bài, nhưng mỗi cái một cấu hình.

**Prefab `Bullet_Player`.** Đặt Layer **PlayerProjectile**. Thêm CapsuleCollider2D và bật **Is Trigger**, kích thước khoảng (0.35, 1.1) tuỳ hình laser của bạn. Rigidbody 2D vẫn Kinematic như bài 3. Thêm `DamageOnContact` với Damage 1 và **bật** Release Self On Hit, vì đạn trúng rồi thì biến mất.

![Collider trigger trên prefab đạn](/images/posts/unity-shmup/05/enemy_03_bullet-prefab-collider.webp)

**Prefab `Enemy_Insect`.** Tạo mới từ sprite địch. Layer **Enemy**, CircleCollider2D trigger bán kính khoảng 0.45. Rigidbody 2D Kinematic, thêm `PooledObject`, `Health` với Max 2 và bật Remove On Death, `EnemyMover` Speed 3, và `DamageOnContact` Damage 1 nhưng **tắt** Release Self On Hit — địch đâm vào tàu xong vẫn bay tiếp chứ không tan biến.

![Các component trên prefab Enemy_Insect](/images/posts/unity-shmup/05/enemy_04_enemy-prefab.webp)

**Object `Player` trong scene.** Layer **Player**, PolygonCollider2D trigger chỉnh vừa hình tàu. Rigidbody 2D Kinematic đã có từ bài 2. Thêm `Health` với Max 3 và **tắt Remove On Death**, vì tàu phải ở lại sau khi chết.

![Collider và Health trên tàu](/images/posts/unity-shmup/05/enemy_05_player-collider-health.webp)

Số Size và Radius của collider tính theo local units nên chịu ảnh hưởng của scale object. Bật gizmo trong Scene view để xác nhận vùng hit thật sự nằm đúng chỗ, đừng tin con số suông.

Địch ở chặng này đã mang sẵn `PooledObject` nhưng vẫn được đặt tay vào scene, chưa có pool nào sở hữu. Khi nó gọi `Release` mà không có owner thì rơi vào nhánh `else Destroy` đã viết ở bài 4, nên vẫn chạy đúng. Bài 7 mới gắn nó vào pool thật.

## Đặt ba con địch

Kéo prefab địch vào scene ba lần, đặt tại (−2.2, 9.5), (0, 11) và (2.2, 12.5).

![Ba con địch trong Hierarchy](/images/posts/unity-shmup/05/enemy_06_hierarchy.webp)

Cả ba đều nằm trên Y = 8, tức trên mép camera, nên lúc bấm Play chúng đi vào khung từ ngoài chứ không bật ra giữa màn hình. Ba độ cao khác nhau để chúng tới lần lượt, dễ quan sát từng con.

![Game view lúc bắt đầu, địch chưa vào khung](/images/posts/unity-shmup/05/enemy_07_game-view-start.webp)

## Ma trận thử thay cho một lần chạy

Chạy từng tình huống một, mỗi tình huống kiểm tra đúng một luật.

Bắn một con địch: viên thứ nhất chưa giết được vì nó có 2 HP, viên thứ hai mới giết. Con địch biến mất, viên đạn cũng biến mất ngay khi trúng chứ không bay tiếp.

Cho địch chạm tàu: HP tàu giảm đúng 1 ở thời điểm bắt đầu chồng lấp. Để yên cho hai object chồng nhau thì HP không tiếp tục tụt mỗi frame, vì `OnTriggerEnter2D` chỉ bắn một lần cho mỗi lần chạm. Tách ra rồi chạm lại là một lần chạm mới, HP giảm tiếp.

Đặt hai con địch chồng lên nhau rồi bắn một viên vào chỗ giao: chỉ một con mất máu. Đây là luật `consumed` ở trên, và Console phải sạch, không có dòng `already released` nào.

Không bắn gì cả: cả ba con trôi xuống hết đáy và được dọn. Kiểm tra Hierarchy không còn con nào sót lại.

Bắn cho tàu hết 3 HP: tàu vẫn còn trong scene chứ không biến mất, vì Remove On Death đang tắt. HUD và chuyện dừng ván thì bài 8 mới nối.

![Bắn hạ địch trong Game view](/images/posts/unity-shmup/05/enemy_08_shooting-enemies.webp)

Không nhận hit thì dò theo tầng, từ ngoài vào trong: Layer Collision Matrix, rồi Is Trigger, rồi Rigidbody2D, rồi hình dạng collider, cuối cùng mới tới vị trí. Nhận được hit nhưng số máu sai thì đó là tầng khác hẳn, xem Damage và Max Health.

## Mã nguồn chặng này

[Tải script bài 5](/downloads/shmup/lesson-05.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #6](/lab/unity-shmup-06-scriptable-objects).
