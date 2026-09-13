---
title: "Shmup #6: ScriptableObject — tách data khỏi prefab"
date: "2026-09-19"
lang: "vi"
series: "shmup"
order: 6
excerpt: "ScriptableObject là gì, CreateAssetMenu, một prefab kẻ địch + N asset EnemyData = N loại địch, WeaponData cho súng, và data chảy vào component qua Apply() trong OnEnable."
coverImage: "/images/posts/unity-shmup/06/cover.webp"
category: "unity-dev"
tags: ["Unity", "ScriptableObject", "Data Driven", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- **ScriptableObject**: asset chứa data, không gắn vào GameObject, không có Update
- `[CreateAssetMenu]` để tạo asset từ menu Create
- Một prefab kẻ địch + N asset `EnemyData` = N loại địch, không nhân bản prefab
- `WeaponData`: chỉnh tốc độ bắn, sát thương ngoài code
- Data chảy từ asset → component qua `Apply()` / `Configure()`, gọi trong `OnEnable` để pool dùng lại được
- Chỉnh số trong Play Mode thấy ngay, và **không** bị reset khi Stop

Xong bài này: 2 loại bọ (chậm 2 máu, nhanh 1 máu) dùng chung một prefab; súng đọc từ `Weapon_Laser`; kéo asset khác vào là đổi hành vi.

![Hai loại bọ](/images/posts/unity-shmup/06/data_08_two-enemy-types.webp)

## 1. Script data

`Scripts/Data/EnemyData.cs`:

```csharp
using UnityEngine;

namespace ShootEmUp.Data
{
    [CreateAssetMenu(menuName = "ShootEmUp/Enemy Data", fileName = "Enemy_New")]
    public sealed class EnemyData : ScriptableObject
    {
        [Header("Look")]
        public Sprite sprite;

        [Header("Stats")]
        [Min(1)] public int maxHealth = 2;
        [Min(0f)] public float speed = 3f;
        [Min(0)] public int contactDamage = 1;

        [Header("Reward")]
        [Min(0)] public int scoreValue = 10;
    }
}
```

- Field `public` trên SO là chấp nhận được: SO là data thuần, không có logic cần bảo vệ. MonoBehaviour vẫn giữ `[SerializeField] private`.
- `[Min]` chặn nhập số âm ngay trên Inspector.
- `scoreValue` chưa dùng, để sẵn cho bài 8.

`Scripts/Data/WeaponData.cs` tương tự: `shotsPerSecond`, `projectileSpeed`, `damage`.

Compile xong, Project → chuột phải → **Create → ShootEmUp → Enemy Data** xuất hiện. Menu này do attribute sinh ra.

## 2. Tạo asset

`ScriptableObjects/Enemies/`:
- `Enemy_InsectBasic`: sprite `insect-1`, Max Health 2, Speed 3, Contact Damage 1, Score 10
- `Enemy_InsectFast`: sprite `insect-2`, Max Health 1, Speed 5.5, Contact Damage 1, Score 20

![EnemyData](/images/posts/unity-shmup/06/data_02_enemydata-inspector.webp)

`ScriptableObjects/Weapons/Weapon_Laser`: Shots Per Second 6, Projectile Speed 14, Damage 1.

![WeaponData](/images/posts/unity-shmup/06/data_03_weapondata-inspector.webp)

## 3. Enemy: glue giữa data và prefab

`Scripts/Enemies/Enemy.cs`:

```csharp
[RequireComponent(typeof(SpriteRenderer), typeof(Health), typeof(EnemyMover))]
[RequireComponent(typeof(DamageOnContact))]
public sealed class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyData data;
    public EnemyData Data => data;

    private SpriteRenderer spriteRenderer;
    private Health health;
    private EnemyMover mover;
    private DamageOnContact contactDamage;

    private void Awake()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        health = GetComponent<Health>();
        mover = GetComponent<EnemyMover>();
        contactDamage = GetComponent<DamageOnContact>();
    }

    private void OnEnable()
    {
        if (data == null)
        {
            Debug.LogError($"{name}: no EnemyData assigned", this);
            return;
        }
        Apply(data);
    }

    public void Apply(EnemyData newData)
    {
        data = newData;
        spriteRenderer.sprite = data.sprite;
        health.SetMax(data.maxHealth);
        mover.Speed = data.speed;
        contactDamage.Damage = data.contactDamage;
    }
}
```

- `Apply` public để bài 7 spawner gọi: lấy 1 instance từ pool rồi `Apply(randomData)` → cùng pool phục vụ mọi loại địch.
- Để làm được, `Health` thêm `SetMax`, `EnemyMover` thêm property `Speed`, `DamageOnContact` thêm `Damage`. Nguyên tắc: component giữ field private nhưng mở đúng một cửa cho data đi vào.
- `Debug.LogError(..., this)`: tham số thứ hai làm click vào log nhảy tới đúng object.

Mở prefab `Enemy_Insect` → Add Component `Enemy`. Ô **Data** trống:

![Trước](/images/posts/unity-shmup/06/data_04_enemy-component-before.webp)

Kéo `Enemy_InsectBasic` vào:

![Sau](/images/posts/unity-shmup/06/data_05_enemy-component-after.webp)

Từ giờ Sprite/Health/Speed trên prefab chỉ là mặc định, `OnEnable` ghi đè bằng data.

## 4. Override trên instance

Trong scene (copy → `SEU_06_Data`), 3 instance bọ. Chọn con giữa, đổi ô Data thành `Enemy_InsectFast`. Field in đậm với gạch xanh bên trái = **override** trên instance, prefab không đổi:

![Instance override](/images/posts/unity-shmup/06/data_06_instance-override.webp)

## 5. PlayerShooting nhận WeaponData

`PlayerShooting`: `shotsPerSecond` → `WeaponData weapon`. Sau `pool.Get`:

```csharp
var shot = projectilePool.Get(muzzle.position, muzzle.rotation);
shot.GetComponent<Projectile>().Configure(weapon.projectileSpeed, weapon.damage);
nextShotTime = Time.time + 1f / weapon.shotsPerSecond;
```

`Projectile.Configure` ghi speed và `DamageOnContact.Damage`. Thứ tự quan trọng: `pool.Get` → `SetActive(true)` → `OnEnable` chạy trước → rồi `Configure` ghi đè. Nếu Projectile reset gì đó trong OnEnable thì Configure phải đứng sau, đúng như hiện tại.

Kéo `Weapon_Laser` vào ô Weapon của Player:

![PlayerShooting với Weapon](/images/posts/unity-shmup/06/data_07_playershooting-weapon.webp)

## 6. Chạy thử: chỉnh số lúc Play

| Bọ | Data | HP | Speed | Sprite |
|----|------|----|-------|--------|
| trái, phải | InsectBasic | 2 | 3 | insect-1 |
| giữa | **InsectFast** (override) | 1 | 5.5 | insect-2 |

Con giữa nhìn khác, chạy nhanh hơn, chết sau 1 phát: data đã ghi đè đúng.

Thử: Play → chọn `Weapon_Laser` trong Project → đổi Shots Per Second 6 → 15 → tàu bắn nhanh ngay. Stop: **giá trị vẫn là 15**. Khác với component (bài 2: chỉnh Speed trong Play mất khi Stop). Tiện khi tune, nguy hiểm khi quên: thay đổi trong Play Mode trên SO là thay đổi thật vào file.

## Bài sau

[Shmup #7](/lab/unity-shmup-07-waves-asteroids): wave spawner bằng coroutine, thiên thạch cũng là "enemy" chỉ khác data.
