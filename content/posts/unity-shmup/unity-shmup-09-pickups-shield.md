---
title: "Shmup #9: Pickup và khiên — rớt đồ theo tỉ lệ, buff có thời gian"
date: "2026-09-22"
lang: "vi"
series: "shmup"
order: 9
excerpt: "PickupData + PickupTable chọn theo trọng số, dropChance trên EnemyData, PlayerPowerups với coroutine restart sạch, Health.Invulnerable và đổi súng tạm thời."
coverImage: "/images/posts/unity-shmup/09/cover.webp"
category: "unity-dev"
tags: ["Unity", "Pickup", "Powerup", "Coroutine", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- Trigger pickup: rơi xuống, chạm tàu thì biến mất và gây hiệu ứng
- **Bảng rớt đồ có trọng số** (`PickupTable.Roll`)
- `dropChance` trên `EnemyData`, `PickupDropper` lắng nghe `Enemy.Killed`
- Buff có thời gian bằng coroutine, **restart sạch** khi nhặt trùng
- `Health.Invulnerable`, `Health.Heal`, `PlayerShooting.OverrideWeapon`: mở đúng một cửa cho mỗi hiệu ứng
- Dùng lại `PrefabPool` lần thứ ba (đạn, địch, pickup)

Xong bài này: giết địch có xác suất rớt 1 trong 3 bonus (mạng, khiên 6 s, bắn nhanh 6 s). Thiên thạch lớn chắc chắn rớt.

![Nhặt bonus, bắn nhanh](/images/posts/unity-shmup/09/pickup_10_rapidfire.webp)

## 1. Data

`Scripts/Data/PickupData.cs`:

```csharp
public enum PickupKind { ExtraLife, Shield, RapidFire }

[CreateAssetMenu(menuName = "ShootEmUp/Pickup Data", fileName = "Pickup_New")]
public sealed class PickupData : ScriptableObject
{
    public Sprite sprite;
    public PickupKind kind;
    [Min(0f)] public float duration = 6f;
    public WeaponData weaponOverride;     // chỉ Rapid Fire dùng
    [Min(0f)] public float fallSpeed = 2f;
}
```

3 asset: `Pickup_ExtraLife` (bonus_life), `Pickup_Shield` (bonus_shield, 6 s), `Pickup_RapidFire` (bonus_time, 6 s, Weapon Override = `Weapon_Rapid` mới: 15 phát/giây).

![Pickup_RapidFire](/images/posts/unity-shmup/09/pickup_01_pickupdata.webp)

`Scripts/Data/PickupTable.cs`:

```csharp
[CreateAssetMenu(menuName = "ShootEmUp/Pickup Table", fileName = "Pickups_New")]
public sealed class PickupTable : ScriptableObject
{
    [Serializable]
    public struct Entry { public PickupData pickup; [Min(0f)] public float weight; }

    public Entry[] entries = Array.Empty<Entry>();

    public PickupData Roll()
    {
        var total = 0f;
        foreach (var e in entries) total += e.weight;
        if (total <= 0f) return null;

        var r = Random.Range(0f, total);
        foreach (var e in entries)
        {
            if (r < e.weight) return e.pickup;
            r -= e.weight;
        }
        return entries[entries.Length - 1].pickup;
    }
}
```

Hình dung: xếp các weight nối tiếp thành một thanh dài `total`, ném phi tiêu `r`, rơi vào đoạn nào thì trúng đoạn đó. Không cần weight cộng lại bằng 1.

`Pickups_Default`: ExtraLife 1, Shield 2, RapidFire 3 → xác suất 1/6, 2/6, 3/6.

![Pickups_Default](/images/posts/unity-shmup/09/pickup_02_pickuptable.webp)

`EnemyData` thêm `[Range(0f, 1f)] public float dropChance = 0.15f`: bọ 0.3, bọ nhanh 0.4, thiên thạch nhỏ 0.1, vừa 0.25, **lớn 1.0**.

## 2. Prefab Pickup_Generic

Layer **Pickup**, Sprite Renderer (sorting Projectiles), Rigidbody 2D Kinematic + Full Kinematic Contacts, Circle Collider 2D trigger 0.4, `PooledObject`, `Pickup`. Matrix bài 5 đã cho Player × Pickup ✓ và cấm Pickup × mọi thứ khác → đạn không bắn trúng bonus.

![Prefab](/images/posts/unity-shmup/09/pickup_04_pickup-prefab.webp)

`Scripts/Pickups/Pickup.cs`: rơi xuống trong FixedUpdate, tự trả pool dưới màn hình, và:

```csharp
private void OnTriggerEnter2D(Collider2D other)
{
    var powerups = other.GetComponentInParent<PlayerPowerups>();
    if (powerups == null) return;

    powerups.Collect(data);
    pooled.Release();
}
```

## 3. PickupDropper

`Enemy.Killed` đổi kiểu từ `Action<EnemyData>` sang `Action<Enemy>` vì dropper cần vị trí; session đọc `enemy.Data.scoreValue`. Event bắn **trước** khi enemy trả về pool (thứ tự trong `Health.TakeDamage`: `Died` → rồi `Release`) nên vị trí còn đúng.

```csharp
public sealed class PickupDropper : MonoBehaviour
{
    [SerializeField] private PrefabPool pickupPool;
    [SerializeField] private PickupTable table;

    private void OnEnable()  => Enemy.Killed += OnEnemyKilled;
    private void OnDisable() => Enemy.Killed -= OnEnemyKilled;

    private void OnEnemyKilled(Enemy enemy)
    {
        if (Random.value > enemy.Data.dropChance) return;
        var pickup = table.Roll();
        if (pickup == null) return;
        pickupPool.Get(enemy.transform.position, Quaternion.identity).GetComponent<Pickup>().Apply(pickup);
    }
}
```

Scene: `PickupPool` (prewarm 5), `PickupDropper` gắn pool + table:

![Dropper](/images/posts/unity-shmup/09/pickup_06_dropper-after.webp)

## 4. PlayerPowerups

```csharp
[RequireComponent(typeof(Health), typeof(PlayerShooting))]
public sealed class PlayerPowerups : MonoBehaviour
{
    [SerializeField] private GameObject shieldVisual;

    private Health health;
    private PlayerShooting shooting;
    private Coroutine shieldRoutine;
    private Coroutine weaponRoutine;

    public void Collect(PickupData data)
    {
        switch (data.kind)
        {
            case PickupKind.ExtraLife: health.Heal(1); break;
            case PickupKind.Shield:    Restart(ref shieldRoutine, ShieldFor(data.duration)); break;
            case PickupKind.RapidFire: Restart(ref weaponRoutine, WeaponFor(data.weaponOverride, data.duration)); break;
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
        shieldVisual.SetActive(true);
        yield return new WaitForSeconds(seconds);
        health.Invulnerable = false;
        shieldVisual.SetActive(false);
    }

    private IEnumerator WeaponFor(WeaponData weapon, float seconds)
    {
        shooting.OverrideWeapon(weapon);
        yield return new WaitForSeconds(seconds);
        shooting.ClearOverride();
    }
}
```

`Restart(ref Coroutine slot, ...)`: nhặt khiên khi khiên đang chạy → dừng coroutine cũ, chạy cái mới → thời gian **làm mới**. Nếu không Stop, coroutine cũ hết hạn trước sẽ tắt khiên trong khi cái mới còn 3 s → bug "khiên mất sớm". Lỗi hay gặp nhất với buff.

`Health.Invulnerable`: `TakeDamage` return sớm; reset về false trong `OnEnable`. `PlayerShooting.ActiveWeapon => overrideWeapon != null ? overrideWeapon : weapon` — dùng `??` ở đây là dính bẫy fake-null (WeaponData là `UnityEngine.Object`).

Player: Add `PlayerPowerups`; con `Shield` sprite `shield`, local (0, 0.55), scale 0.9, Sorting Player order 1, **tắt** sẵn, kéo vào ô Shield Visual.

![Player + Shield](/images/posts/unity-shmup/09/pickup_07_player-powerups.webp)

## 5. Chạy thử

![Khiên đang bật](/images/posts/unity-shmup/09/pickup_09_shield-active.webp)

| t | Sự kiện | HP | Invulnerable | Shield visual | Score |
|---|---------|----|--------------|---------------|-------|
| 9.0 | nhặt Shield | 2 | **true** | **on** | 5 |
| 16.2 | 6 s sau | 2 | false | off | 5 |
| 16.3 | nhặt RapidFire | | | | |
| 23.8 | 7 s sau | 2 | | | **15** (bắn 15/s) |

## Chú ý

- Bonus mạng nhặt sau khi chết là vô nghĩa, nhưng `Pickup.OnTriggerEnter2D` vẫn chạy vì collider tàu còn → bài 10 tắt collider tàu khi Game Over (thêm vào `disableOnGameOver`; Collider2D cũng là `Behaviour`).

## Bài sau

[Shmup #10](/lab/unity-shmup-10-audio-juice): âm thanh, shader flash HLSL đầu tiên, camera shake, particle nổ.
