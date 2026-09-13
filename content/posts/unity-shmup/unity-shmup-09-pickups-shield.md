---
title: "Shmup #9: Hành trình một pickup và thời hạn của buff"
date: "2026-09-22"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-09-pickups-shield
series: "shmup"
order: 9
excerpt: "Làm một món hồi máu hoạt động trước, sau đó thêm khiên, bắn nhanh, luật nhặt trùng và hai bước xác suất rơi đồ."
coverImage: "/images/posts/unity-shmup/09/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Địch chết</span><span>Có rơi?</span><span>Chọn loại</span><span>Spawn</span><span>Nhặt</span><span>Áp dụng / hết hạn</span></div>

## Chốt tác dụng trước khi viết random

Địch chết thì biến mất, hết chuyện. Bài này cho địch rơi đồ khi chết. Phần khó không phải phần random, mà là xử lý lúc người chơi nhặt trùng một món trong khi hiệu lực cũ còn chưa hết hạn.

Lưu scene thành `SEU_09_Pickups`. Ba loại đồ, và ta chốt tác dụng của chúng trước khi viết một dòng xác suất nào:

| Loại | Tác dụng | Nhặt lại | Kết thúc |
|---|---|---|---|
| ExtraLife | Hồi 1 HP, tối đa Max | Hồi thêm nếu còn thiếu | Ngay lập tức |
| Shield | Bỏ qua sát thương trong 6 giây | Làm mới 6 giây từ lúc nhặt | Tắt miễn thương và hình khiên |
| RapidFire | Dùng Weapon_Rapid trong 6 giây | Làm mới thời hạn | Trở lại Weapon_Laser |

`ExtraLife` ở đây là hồi máu chứ không phải thêm một mạng dự phòng, dù tên gọi dễ làm nghĩ khác. Nhặt lúc máu đầy thì vẫn mất món đồ mà không vượt được Max.

Hai mốc nữa cần chốt luôn: sau khi Game Over thì không nhận đồ mới, và mọi buff đang chạy bị dọn sạch lúc tàu chết.

## Bắt đầu bằng một món hồi máu đặt tay

**Assets/_ShootEmUp/Scripts/Data/PickupData.cs**

```csharp
using UnityEngine;

namespace ShootEmUp.Data
{
    public enum PickupKind
    {
        ExtraLife,
        Shield,
        RapidFire,
    }
    [CreateAssetMenu(menuName = "ShootEmUp/Pickup Data", fileName = "Pickup_New")]
    public sealed class PickupData : ScriptableObject
    {
        public Sprite sprite;
        public PickupKind kind;

        [Tooltip("Seconds the effect lasts. Ignored by instant effects like Extra Life.")]
        [Min(0f)] public float duration = 6f;

        [Tooltip("Weapon swapped in while a Rapid Fire pickup is active.")]
        public WeaponData weaponOverride;

        [Min(0f)] public float fallSpeed = 2f;
    }
}
```

Trong `ScriptableObjects/Pickups`, tạo ba asset theo bảng trên: `Pickup_ExtraLife` (Kind ExtraLife, Fall Speed 2), `Pickup_Shield` và `Pickup_RapidFire` (Duration 6).

![PickupData asset trong Inspector](/images/posts/unity-shmup/09/pickup_01_pickupdata.webp)

Tạo thêm `Weapon_Rapid` với Shots Per Second 15, Projectile Speed 14, Damage 1, rồi kéo nó vào ô Weapon Override của `Pickup_RapidFire`.

Thay `PlayerShooting` bằng bản bài 9 trong gói source. Nó bổ sung `OverrideWeapon` và `ClearOverride`: khi có override thì dùng súng tạm, không thì dùng súng gốc. Cách này quan trọng hơn vẻ ngoài của nó — đừng sửa thẳng field trên `Weapon_Laser` để làm hiệu ứng bắn nhanh, vì asset là cấu hình dùng chung chứ không phải trạng thái của tàu. Sửa asset lúc chạy thì sau khi Stop, con số vẫn ở lại.

**Assets/_ShootEmUp/Scripts/Player/PlayerPowerups.cs**

```csharp
using System.Collections;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Player
{
    [RequireComponent(typeof(Health), typeof(PlayerShooting))]
    public sealed class PlayerPowerups : MonoBehaviour
    {
        [Tooltip("Child object shown while the shield is active (sprite 'shield').")]
        [SerializeField] private GameObject shieldVisual;

        private Health health;
        private PlayerShooting shooting;
        private Coroutine shieldRoutine;
        private Coroutine weaponRoutine;

        private void Awake()
        {
            health = GetComponent<Health>();
            shooting = GetComponent<PlayerShooting>();
        }

        private void OnEnable()
        {
            ClearEffects();
            health.Died += OnDied;
        }

        private void OnDisable()
        {
            health.Died -= OnDied;
            ClearEffects();
        }
        private void OnDied(Health _) => ClearEffects();
        private void ClearEffects()
        {
            StopAllCoroutines();
            shieldRoutine = null;
            weaponRoutine = null;
            health.Invulnerable = false;
            shooting.ClearOverride();
            if (shieldVisual != null) shieldVisual.SetActive(false);
        }

        public void Collect(PickupData data)
        {
            if (!isActiveAndEnabled || health.IsDead || data == null) return;
            switch (data.kind)
            {
                case PickupKind.ExtraLife:
                    health.Heal(1);
                    break;
                case PickupKind.Shield:
                    Restart(ref shieldRoutine, ShieldFor(data.duration));
                    break;
                case PickupKind.RapidFire:
                    Restart(ref weaponRoutine, WeaponFor(data.weaponOverride, data.duration));
                    break;
            }
        }

        private void Restart(ref Coroutine slot, IEnumerator routine)
        {
            if (slot != null) StopCoroutine(slot);
            slot = StartCoroutine(routine);
        }

        private IEnumerator ShieldFor(float seconds)
        {
            health.Invulnerable = true;
            if (shieldVisual != null) shieldVisual.SetActive(true);
            yield return new WaitForSeconds(seconds);
            health.Invulnerable = false;
            if (shieldVisual != null) shieldVisual.SetActive(false);
        }

        private IEnumerator WeaponFor(WeaponData weapon, float seconds)
        {
            shooting.OverrideWeapon(weapon);
            yield return new WaitForSeconds(seconds);
            shooting.ClearOverride();
        }
    }
}
```

`ClearEffects` được gọi ở ba chỗ: lúc bật component, lúc tắt, và lúc tàu chết. Ba mốc dọn này quan trọng ngang với lúc nhặt. Thiếu chúng thì người chơi chết trong lúc đang có khiên, restart xong vẫn bất tử cho tới khi coroutine cũ chạy hết.

![PlayerPowerups trên tàu](/images/posts/unity-shmup/09/pickup_07_player-powerups.webp)

Tạo một object con của `Player` tên **Shield** với sprite khiên, Sorting Layer Player Order 1, và tắt sẵn. Kéo nó vào ô Shield Visual.

![Shield là object con đang tắt](/images/posts/unity-shmup/09/pickup_08_shield-child.webp)

## Pickup chỉ vận chuyển dữ liệu tới người nhận

**Assets/_ShootEmUp/Scripts/Pickups/Pickup.cs**

```csharp
using BillLab.Common.Pooling;
using ShootEmUp.Core;
using ShootEmUp.Data;
using ShootEmUp.Player;
using UnityEngine;

namespace ShootEmUp.Pickups
{
    [RequireComponent(typeof(SpriteRenderer), typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class Pickup : MonoBehaviour
    {
        [SerializeField] private PickupData data;

        [Tooltip("Extra distance below the screen before the pickup is recycled.")]
        [SerializeField] private float despawnMargin = 1.5f;

        private SpriteRenderer spriteRenderer;
        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnY;
        private bool consumed;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            consumed = false;
            despawnY = ScreenBounds.Get().yMin - despawnMargin;
            if (data != null) Apply(data);
        }

        public void Apply(PickupData newData)
        {
            data = newData;
            spriteRenderer.sprite = data.sprite;
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + Vector2.down * (data.fallSpeed * Time.fixedDeltaTime));
            if (body.position.y < despawnY) pooled.Release();
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (consumed || !isActiveAndEnabled) return;
            var health = other.GetComponentInParent<ShootEmUp.Combat.Health>();
            if (health == null || health.IsDead) return;
            var powerups = other.GetComponentInParent<PlayerPowerups>();
            if (powerups == null) return;

            if (!powerups.isActiveAndEnabled) return;
            consumed = true;
            powerups.Collect(data);
            pooled.Release();
        }
    }
}
```

Nó rơi xuống, gửi `data` khi chạm `PlayerPowerups`, rồi tự trả về pool. Cờ `consumed` là luật y hệt `DamageOnContact` ở bài 5, đặt trước khi gọi `Collect` để một món không bị thu hai lần trong cùng một bước physics. Món trôi quá đáy màn hình cũng tự dọn mà không áp dụng tác dụng nào.

Tạo prefab **Pickup_Generic**: Layer `Pickup`, Sprite Renderer Sorting Layer Projectiles, Rigidbody2D Kinematic, CircleCollider2D trigger bán kính 0.4, `PooledObject`, và `Pickup` với Data mặc định là `Pickup_ExtraLife`.

![Prefab Pickup_Generic](/images/posts/unity-shmup/09/pickup_04_pickup-prefab.webp)

Cặp Player × Pickup trong Layer Collision Matrix đã bật từ bài 5, các cặp khác của layer này vẫn tắt.

Giờ thử bằng tay trước khi đụng tới xác suất. Kéo một instance `Pickup_Generic` vào scene ngay phía trên tàu, bấm Play và để tàu ăn một hit cho thiếu 1 HP trước khi nhặt. Nó phải hồi đúng 1 rồi biến mất. Đổi Data mặc định sang Shield và RapidFire để kiểm tra riêng từng loại. Thử xong thì xoá instance đi.

Ép một loại xuất hiện rồi mới thêm random là thứ tự cố ý. Nếu bật xác suất ngay từ đầu, lúc không thấy gì rơi bạn sẽ không biết là code sai hay chỉ xui.

## Nhặt trùng là làm mới, không cộng chồng

<div class="lesson-timeline"><p><strong>t = 0</strong> · Nhặt Shield, hạn t = 6</p><p><strong>t = 4</strong> · Nhặt lại, dừng bộ đếm cũ, hạn mới t = 10</p><p><strong>t = 6</strong> · Khiên vẫn bật</p><p><strong>t = 10</strong> · Khiên tắt</p></div>

Đây là lý do `Restart(ref slot, routine)` tồn tại. Nếu không dừng coroutine cũ, tới giây 6 nó thức dậy và tắt khiên, dù lượt mới còn bốn giây nữa. Người chơi vừa nhặt món thứ hai xong thì mất khiên — bug khó chịu mà lại không báo lỗi gì.

Hai loại buff có hai slot riêng, nên nhặt Shield không huỷ RapidFire đang chạy.

![Khiên đang bật quanh tàu](/images/posts/unity-shmup/09/pickup_09_shield-active.webp)

![Bắn nhanh với Weapon_Rapid](/images/posts/unity-shmup/09/pickup_10_rapidfire.webp)

`WaitForSeconds` đếm bằng thời gian game, nên 6 giây là thời hạn mục tiêu và kết thúc ở frame coroutine chạy tiếp. Muốn kiểm tra rapid fire thật sự nhanh hơn thì đếm số phát bắn ra trong một khoảng thời gian, đừng suy từ điểm số vì điểm phụ thuộc cả vào việc bạn bắn trúng gì.

## Tách "có rơi không" khỏi "rơi cái gì"

Hai câu hỏi này độc lập với nhau nên tách thành hai cấu hình. `dropChance` nằm trên `EnemyData` trả lời câu thứ nhất. `PickupTable` trả lời câu thứ hai, với điều kiện là đã có một lần rơi.

Thay `EnemyData` bằng bản bài 9 để có thêm field Drop Chance. Khi đang thử thì đặt 1 cho chắc chắn rơi; khi hoàn tất thì dùng Basic 0.3, Fast 0.4, Small 0.1, Medium 0.25, Large 1.

![Drop Chance trên EnemyData](/images/posts/unity-shmup/09/pickup_03_enemydata-dropchance.webp)

**Assets/_ShootEmUp/Scripts/Data/PickupTable.cs**

```csharp
using System;
using UnityEngine;

namespace ShootEmUp.Data
{
    [CreateAssetMenu(menuName = "ShootEmUp/Pickup Table", fileName = "Pickups_New")]
    public sealed class PickupTable : ScriptableObject
    {
        [Serializable]
        public struct Entry
        {
            public PickupData pickup;
            [Min(0f)] public float weight;
        }

        public Entry[] entries = Array.Empty<Entry>();

        public PickupData Roll()
        {
            var total = 0f;
            if (entries == null) return null;
            foreach (var e in entries) if (e.pickup != null && e.weight > 0f) total += e.weight;
            if (total <= 0f) return null;

            var r = UnityEngine.Random.Range(0f, total);
            PickupData lastValid = null;
            foreach (var e in entries)
            {
                if (e.pickup == null || e.weight <= 0f) continue;
                lastValid = e.pickup;
                if (r < e.weight) return e.pickup;
                r -= e.weight;
            }
            return lastValid;
        }
    }
}
```

Tạo asset `Pickups_Default` với ExtraLife weight 1, Shield 2, RapidFire 3.

![PickupTable với ba entry](/images/posts/unity-shmup/09/pickup_02_pickuptable.webp)

Tổng weight là 6, nên trong những lần đã rơi, tỉ lệ từng loại là 1/6, 2/6 và 3/6. Ghép hai bước lại thì ra xác suất thật: một con InsectBasic với `dropChance` 0.3 sẽ rơi Shield với xác suất `0.3 × 2/6 = 0.1`, tức 10% mỗi lần bị giết.

Weight không cần cộng lại bằng 1, vì `Roll` tự chia cho tổng. Tổng bằng 0 thì hàm trả về `null` và không có gì rơi.

## Nối địch chết với hệ rơi đồ

**Assets/_ShootEmUp/Scripts/Pickups/PickupDropper.cs**

```csharp
using BillLab.Common.Pooling;
using ShootEmUp.Data;
using ShootEmUp.Enemies;
using UnityEngine;

namespace ShootEmUp.Pickups
{
    public sealed class PickupDropper : MonoBehaviour
    {
        [SerializeField] private PrefabPool pickupPool;
        [SerializeField] private PickupTable table;

        private void OnEnable()
        {
            Enemy.Killed += OnEnemyKilled;
        }

        private void OnDisable()
        {
            Enemy.Killed -= OnEnemyKilled;
        }

        private void OnEnemyKilled(Enemy enemy)
        {
            if (enemy.Data.dropChance <= 0f || Random.value >= enemy.Data.dropChance) return;

            var pickup = table.Roll();
            if (pickup == null) return;

            pickupPool.Get(enemy.transform.position, Quaternion.identity).GetComponent<Pickup>().Apply(pickup);
        }
    }
}
```

Script này nghe đúng event `Enemy.Killed` đã có từ bài 8, không đổi chữ ký và không đụng gì tới hệ tính điểm. Đây là lúc quyết định ở bài 8 trả công: vì event truyền cả object `Enemy`, dropper đọc được `Data` để biết tỉ lệ rơi và đọc được `transform.position` để biết thả đồ ở đâu. Event phát trước khi enemy về pool nên vị trí vẫn đúng.

Tạo Empty **PickupPool** với prefab `Pickup_Generic`, Prewarm 5, Max Size 30. Tạo Empty **PickupDropper**, nối Pickup Pool và Table:

![PickupDropper trước khi nối](/images/posts/unity-shmup/09/pickup_05_dropper-before.webp)

![PickupDropper sau khi nối](/images/posts/unity-shmup/09/pickup_06_dropper-after.webp)

## Bài thử

Chạy qua sáu tình huống: hồi máu không vượt Max, khiên chặn được một hit rồi hết hạn đúng lúc, rapid fire trả súng về `Weapon_Laser`, nhặt trùng đi theo đúng timeline ở trên, sau Game Over thì không nhận thêm đồ, và restart xong không còn buff nào sót lại.

Phần random để kiểm tra cuối cùng và phải chơi nhiều ván. Với `dropChance` 0.3, bảy con liên tiếp không rơi gì vẫn là chuyện bình thường về mặt xác suất, nên đừng sửa code sau vài lần thử.

## Mã nguồn chặng này

[Tải script bài 9](/downloads/shmup/lesson-09.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #10](/lab/unity-shmup-10-audio-juice).
