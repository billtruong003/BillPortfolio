---
title: "Shmup #6: Một bộ máy, nhiều loại địch — tách dữ liệu khỏi trạng thái"
date: "2026-09-19"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-06-scriptable-objects
series: "shmup"
order: 6
excerpt: "Từ hai con địch khác nhau, suy ra EnemyData, Apply và WeaponData; phân biệt tài nguyên dùng chung với HP riêng từng instance."
coverImage: "/images/posts/unity-shmup/06/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>INSECT BASIC</strong><p>2 HP · Speed 3 · Score 10</p></div><div><strong>INSECT FAST</strong><p>1 HP · Speed 5.5 · Score 20</p></div></div>

## Hai con địch khác nhau ở đâu

Muốn thêm một con địch bay nhanh hơn, phản xạ đầu tiên là Ctrl+D cái prefab cũ rồi sửa vài con số. Cách đó chạy được, cho tới lúc bạn cần đổi collider và phải mở từng bản sao ra sửa lại.

Nhìn hai thẻ ở trên. Hai con địch dùng đúng cùng một bộ component: Sprite Renderer, Rigidbody, collider, `Health`, `EnemyMover`, `DamageOnContact`. Thứ khác nhau chỉ là sprite và mấy con số. Vậy nên ta giữ **một prefab** và chuyển phần khác biệt sang **hai data asset** nằm riêng.

Lưu scene thành `SEU_06_Data`.

## Ba loại dữ liệu không được trộn

| Nơi | Chứa gì | Ví dụ |
|---|---|---|
| Prefab | Cấu trúc component và reference chung | Rigidbody, collider, Enemy |
| ScriptableObject asset | Cấu hình một loại | Max HP 2, Speed 3 |
| Component trên instance | Trạng thái riêng khi chơi | Con A còn 1 HP, con B còn 2 HP |

ScriptableObject là asset sống trong Project, không phải component kéo lên GameObject. Điểm này dẫn tới một hệ quả phải nhớ: hai con địch cùng đọc một `EnemyData`, nên nếu bạn ghi máu hiện tại vào asset đó thì một con trúng đạn sẽ làm tụt máu của cả loại. Máu hiện tại thuộc về instance, và bài 5 đã để nó trong `Health.Current` đúng chỗ rồi.

## Tạo dữ liệu từ bảng so sánh

**Assets/_ShootEmUp/Scripts/Data/EnemyData.cs**

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

`[CreateAssetMenu]` là thứ làm cho asset này tạo được bằng chuột: nó thêm một mục vào menu Create của Project window. Không có attribute đó thì class vẫn hợp lệ nhưng bạn phải viết code mới tạo được asset.

`scoreValue` được lưu sẵn từ bây giờ dù bài này chưa có hệ tính điểm. Bài 8 sẽ đọc nó khi địch chết, và khai báo trước thì lúc đó không phải quay lại sửa cả sáu asset.

Trong `ScriptableObjects/Enemies`, chọn Create → ShootEmUp → Enemy Data hai lần:

| Asset | Sprite | Max Health | Speed | Contact Damage | Score |
|---|---|---|---|---|---|
| Enemy_InsectBasic | Địch thường | 2 | 3 | 1 | 10 |
| Enemy_InsectFast | Địch thứ hai | 1 | 5.5 | 1 | 20 |

![EnemyData asset trong Inspector](/images/posts/unity-shmup/06/data_02_enemydata-inspector.webp)

## Apply là cầu nối giữa cấu hình và hành vi

Asset chỉ là dữ liệu nằm yên. Phải có ai đó đọc nó rồi giao từng giá trị cho đúng component biết dùng:

<div class="lesson-flow"><span>EnemyData</span><span>Enemy.Apply</span><span>Sprite / Health / Mover / Damage</span></div>

Trước khi tạo `Enemy`, thay `Health`, `DamageOnContact` và `EnemyMover` bằng bản đầy đủ trong gói bài 6. Ba file đó bổ sung `SetMax` cùng các property `Speed` và `Damage` để `Apply` có chỗ ghi vào. Chép đè lên file cùng đường dẫn, đừng tạo class thứ hai, và reference trên prefab vẫn giữ nguyên.

**Assets/_ShootEmUp/Scripts/Enemies/Enemy.cs**

```csharp
using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    [RequireComponent(typeof(SpriteRenderer), typeof(Health), typeof(EnemyMover))]
    [RequireComponent(typeof(DamageOnContact))]
    public sealed class Enemy : MonoBehaviour
    {
        [Tooltip("Which enemy type this instance is. Swap the asset, not the prefab.")]
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
                Debug.LogError($"{name}: no EnemyData assigned, enemy will use prefab defaults.", this);
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
}
```

`Apply` được gọi trong `OnEnable` theo đúng luật pool từ bài 4: mỗi lần object bật lên là một lượt sống mới, nên cấu hình phải nạp lại. `SetMax` vừa đặt trần máu vừa nạp đầy, nên con địch tái sử dụng không mang theo máu của con trước.

`Apply` còn được để public vì bài 7 cần nó: spawner lấy một object từ pool rồi mới quyết định con này là loại gì.

Mở prefab `Enemy_Insect`, Add Component `Enemy`, kéo **Enemy_InsectBasic** vào ô Data. Từ giờ sprite và mấy con số nằm trên các component chỉ còn là giá trị khởi điểm, vì `Apply` ghi đè chúng ngay khi object bật lên.

Đây chính là chỗ dễ mất lòng tin nhất, nên nhìn tận mắt. Trước khi chạy, Inspector của con địch mang giá trị của prefab:

![Component trên địch trước khi Apply chạy](/images/posts/unity-shmup/06/data_04_enemy-component-before.webp)

Bấm Play, và cũng Inspector đó giờ mang giá trị lấy từ asset:

![Component trên địch sau khi Apply chạy](/images/posts/unity-shmup/06/data_05_enemy-component-after.webp)

Hai tấm ảnh này là bằng chứng rằng asset thắng prefab. Nếu số không đổi, kiểm tra ô Data có rỗng không và Console có dòng `no EnemyData assigned` không.

## Tạo biến thể bằng override trên instance

Scene vẫn còn ba con địch đặt tay từ bài 5. Chọn con ở giữa và đổi ô Data sang `Enemy_InsectFast`.

![Dòng Data bị override in đậm trên instance](/images/posts/unity-shmup/06/data_06_instance-override.webp)

Unity in đậm dòng vừa đổi và thêm một vạch xanh bên trái để báo đây là override của riêng instance này. Đừng bấm Apply All ở thanh trên cùng, vì lệnh đó đẩy thay đổi ngược lên prefab và biến `InsectFast` thành loại mặc định cho mọi con.

Bấm Play: hai con thường bay chậm và cần hai phát mới chết, con giữa bay nhanh và chết sau một phát.

![Hai loại địch khác nhau sinh ra từ cùng một prefab](/images/posts/unity-shmup/06/data_08_two-enemy-types.webp)

Phải kiểm tra cả ba thứ chứ không chỉ nhìn sprite. Sprite đổi chỉ chứng minh `spriteRenderer.sprite` được gán; còn tốc độ và số phát bắn mới chứng minh `mover.Speed` và `health.SetMax` cũng nhận đúng dữ liệu.

## Dùng lại cách nghĩ đó cho khẩu súng

**Assets/_ShootEmUp/Scripts/Data/WeaponData.cs**

```csharp
using UnityEngine;

namespace ShootEmUp.Data
{
    [CreateAssetMenu(menuName = "ShootEmUp/Weapon Data", fileName = "Weapon_New")]
    public sealed class WeaponData : ScriptableObject
    {
        [Min(0.1f)] public float shotsPerSecond = 6f;
        [Min(0f)] public float projectileSpeed = 14f;
        [Min(1)] public int damage = 1;
    }
}
```

Tạo asset **Weapon_Laser** với Shots Per Second 6, Projectile Speed 14, Damage 1.

![WeaponData asset trong Inspector](/images/posts/unity-shmup/06/data_03_weapondata-inspector.webp)

Thay `Projectile` và `PlayerShooting` bằng bản bài 6 trong gói source. `PlayerShooting` bỏ field tốc độ bắn riêng để nhận `WeaponData`, và sau khi lấy đạn từ pool nó gọi `Configure` để đặt tốc độ bay cùng sát thương cho viên đó.

**Assets/_ShootEmUp/Scripts/Combat/Projectile.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject), typeof(DamageOnContact))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second. Overridden by WeaponData when fired by PlayerShooting.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile goes back to the pool, even if it hit nothing.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private DamageOnContact contactDamage;
        private float despawnTime;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
            contactDamage = GetComponent<DamageOnContact>();
        }

        private void OnEnable()
        {
            despawnTime = Time.time + lifetime;
        }

        public void Configure(float newSpeed, int damage)
        {
            speed = newSpeed;
            contactDamage.Damage = damage;
        }

        private void Update()
        {
            if (Time.time >= despawnTime)
            {
                pooled.Release();
            }
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
```

Chọn `Player`, kéo `Weapon_Laser` vào ô Weapon, rồi kiểm tra `Controls`, `Projectile Pool` và `Muzzle` vẫn còn nguyên:

![PlayerShooting với ô Weapon đã nối](/images/posts/unity-shmup/06/data_07_playershooting-weapon.webp)

## Lúc nào con số mới có tác dụng

Đây là phần dễ gây bối rối nhất của ScriptableObject, và nó có một quy luật rõ ràng.

Bấm Play rồi đổi Shots Per Second của `Weapon_Laser` từ 6 sang 12: nhịp bắn đổi ngay lập tức. Vẫn trong Play, đổi Speed của `Enemy_InsectBasic`: những con đang bay không nhanh lên, chỉ con nào được bật lên sau đó mới nhận số mới.

Khác biệt nằm ở chỗ ai đọc asset vào lúc nào. `PlayerShooting` đọc `WeaponData` ở **mỗi phát bắn**, nên đổi là thấy. `Enemy` đọc `EnemyData` một lần trong `OnEnable`, tức **lúc spawn**, nên con đã spawn rồi thì giữ nguyên bản sao cũ. Một data asset không tự đẩy thay đổi tới mọi component đang dùng nó.

Lưu ý khi nghịch: chỉnh asset trong Play Mode được Editor giữ lại sau khi Stop, khác hẳn với chỉnh component. Nếu đó chỉ là thử nghiệm thì nhớ trả các số về 6 / 14 / 1.

Chặng này xong khi một prefab thể hiện được hai loại địch, máu từng con độc lập với nhau, và bạn phân biệt được cấu hình đọc lúc spawn với cấu hình đọc mỗi phát bắn. Bài sau thay ba con đặt tay bằng một cái lịch.

## Mã nguồn chặng này

[Tải script bài 6](/downloads/shmup/lesson-06.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #7](/lab/unity-shmup-07-waves-asteroids).
