---
title: "Shmup #5: Kẻ địch và va chạm — Collider, Layer Matrix, Health"
date: "2026-09-18"
lang: "vi"
series: "shmup"
order: 5
excerpt: "Trigger collider, Layer vật lý và Layer Collision Matrix thay cho if-tag trong code, Health + DamageOnContact tách trách nhiệm, và cái bẫy Use Full Kinematic Contacts."
coverImage: "/images/posts/unity-shmup/05/cover.webp"
category: "unity-dev"
tags: ["Unity", "Physics 2D", "Collider", "Layer", "Health", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- Collider2D và **Trigger**: chạm mà không đẩy nhau
- **Layer** (physics) và **Layer Collision Matrix**: quyết định ai chạm ai bằng bảng, không bằng `if (tag == ...)`
- `OnTriggerEnter2D` và `GetComponentInParent`
- Kinematic vs Kinematic: **Use Full Kinematic Contacts**, cái bẫy lớn nhất của bài
- Tách trách nhiệm: `Health` (máu), `DamageOnContact` (gây sát thương), `EnemyMover` (di chuyển)
- `event Action<Health> Died` để bài 8 nối điểm số mà không sửa Health

Xong bài này: 3 con bọ bay xuống, bắn 2 phát là chết, đâm vào tàu thì tàu mất 1 máu, ra khỏi màn hình tự dọn.

![Bắn bọ](/images/posts/unity-shmup/05/enemy_08_shooting-enemies.webp)

## 1. Layers

**Edit → Project Settings → Tags and Layers → Layers** (không phải Sorting Layers, xem lại bài 1). Layer 0–5 Unity giữ. Điền từ User Layer 6:

![Layers](/images/posts/unity-shmup/05/enemy_01_layers.webp)

| # | Layer | Ai |
|---|-------|----|
| 6 | Player | tàu |
| 7 | PlayerProjectile | đạn của tàu |
| 8 | Enemy | bọ, thiên thạch |
| 9 | EnemyProjectile | đạn của địch (dự phòng) |
| 10 | Pickup | bonus (bài 9) |

## 2. Layer Collision Matrix

**Project Settings → Physics 2D → tab Layer Collision Matrix**. Bỏ tick hết các ô của 5 layer trên, chỉ giữ:

![Collision matrix](/images/posts/unity-shmup/05/enemy_02_collision-matrix.webp)

```
Player           × Enemy            ✓  (bọ đâm tàu)
Player           × EnemyProjectile  ✓
Player           × Pickup           ✓
PlayerProjectile × Enemy            ✓  (bắn trúng)
mọi cặp còn lại                     ✗  (đạn ta không chạm tàu ta, bọ không chạm bọ...)
Default          × 5 layer trên     ✗
```

Đây là điểm cốt lõi của bài: **không viết `if (other.CompareTag("Enemy"))` trong code**. Bảng này rẻ hơn (physics bỏ qua cặp không tick từ đầu) và nhìn một phát là hiểu luật game.

## 3. Đạn: collider + sát thương

Mở prefab `Bullet_Player`:
- **Layer** (góc trên phải Inspector) → `PlayerProjectile`.
- Add **Capsule Collider 2D**: Is Trigger ✓, Direction Vertical, Size (0.35, 1.1) — nhỏ hơn sprite một chút, cảm giác công bằng hơn.
- Rigidbody 2D → **Use Full Kinematic Contacts ✓** (xem mục 7).
- Add `DamageOnContact`: Damage 1, Release Self On Hit ✓.

![Prefab đạn](/images/posts/unity-shmup/05/enemy_03_bullet-prefab-collider.webp)

## 4. Prefab kẻ địch

Empty `Enemy_Insect` → Layer `Enemy`:
- Sprite Renderer `insect-1`, Sorting Layer `Enemies`
- Rigidbody 2D Kinematic, Interpolate, **Use Full Kinematic Contacts ✓**
- Circle Collider 2D, Is Trigger ✓, Radius 0.45
- `PooledObject` (bài 7 sẽ pool; bài này chưa, Release rơi về Destroy)
- `Health` Max 2
- `DamageOnContact` Damage 1, Release Self On Hit ✗ (bọ đâm tàu xong vẫn bay tiếp)
- `EnemyMover` Speed 3

Kéo vào `Prefabs/`, xoá khỏi scene.

![Prefab bọ](/images/posts/unity-shmup/05/enemy_04_enemy-prefab.webp)

## 5. Player

- Layer `Player`.
- Add **Polygon Collider 2D**, Is Trigger ✓. Unity lấy hình từ *Generate Physics Shape* của sprite (bài 0) → collider ôm sát tàu, 42 điểm. Chính xác hơn Circle/Box, đắt hơn một chút, với 1 tàu thì không đáng kể.
- Rigidbody 2D → Use Full Kinematic Contacts ✓.
- `Health` Max 3.

![Player collider + Health](/images/posts/unity-shmup/05/enemy_05_player-collider-health.webp)

## 6. Đặt 3 bọ thử

Empty `Enemies` làm cha, kéo prefab `Enemy_Insect` vào 3 lần: (−2.2, 9.5), (0, 11), (2.2, 12.5). Chúng ở trên mép màn hình (y > 8), Play là bay xuống.

![Hierarchy](/images/posts/unity-shmup/05/enemy_06_hierarchy.webp)

## 7. Cái bẫy Kinematic

Play, bắn. Nếu đạn xuyên qua bọ mà không có gì xảy ra: 90% là quên **Use Full Kinematic Contacts**. Luật của Physics2D:

| | Dynamic | Kinematic | Static |
|---|---|---|---|
| Dynamic | ✓ | ✓ | ✓ |
| Kinematic | ✓ | ✗ (✓ nếu Full Kinematic Contacts) | ✗ (✓ nếu Full Kinematic Contacts) |
| Static | ✓ | ✗ | ✗ |

Đạn, bọ, tàu đều Kinematic (bài 2–3 chọn vì không muốn physics đẩy) → mặc định không sinh contact/trigger với nhau. Bật Full Kinematic Contacts trên **cả hai bên** cho chắc.

Cách khác: cho đạn là Dynamic với Gravity Scale 0. Cũng đúng, nhưng chọn Kinematic + Full Contacts để nhất quán.

## 8. Code

`Scripts/Combat/Health.cs`:

```csharp
using System;
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    public sealed class Health : MonoBehaviour
    {
        [SerializeField] private int maxHealth = 1;

        public int Max => maxHealth;
        public int Current { get; private set; }
        public bool IsDead => Current <= 0;

        public event Action<Health> Died;

        private void OnEnable() => Current = maxHealth;   // object từ pool bật lại phải đầy máu

        public void TakeDamage(int amount)
        {
            if (IsDead) return;

            Current = Mathf.Max(0, Current - amount);
            if (!IsDead) return;

            Died?.Invoke(this);

            var pooled = GetComponent<PooledObject>();
            if (pooled != null) pooled.Release();
            else Destroy(gameObject);
        }
    }
}
```

- `OnEnable` reset máu: lý do bài 3–4 nhấn `OnEnable` thay vì `Start`.
- `IsDead` chặn sớm: 2 viên đạn chạm cùng frame chỉ kích `Died` một lần.
- `event Action<Health>`: ai muốn biết (điểm, âm thanh, game over) thì `health.Died += ...`. Health không biết gì về UI.

`Scripts/Combat/DamageOnContact.cs`:

```csharp
[RequireComponent(typeof(Collider2D))]
public sealed class DamageOnContact : MonoBehaviour
{
    [SerializeField] private int damage = 1;
    [SerializeField] private bool releaseSelfOnHit = true;

    private void OnTriggerEnter2D(Collider2D other)
    {
        var health = other.GetComponentInParent<Health>();
        if (health == null) return;

        health.TakeDamage(damage);
        if (!releaseSelfOnHit) return;

        var pooled = GetComponent<PooledObject>();
        if (pooled != null) pooled.Release();
        else Destroy(gameObject);
    }
}
```

- `GetComponentInParent`: sau này collider có thể nằm trên object con (hitbox riêng), Health vẫn ở cha.
- Không kiểm tra tag/layer trong code: matrix đã lọc. Đạn chạm nhầm thứ gì thì sửa matrix, không sửa code.
- Lỗi tiềm ẩn: 1 viên đạn trúng 2 bọ chồng nhau → `OnTriggerEnter2D` gọi 2 lần trong 1 frame → `Release` 2 lần → exception. Bài 7 thêm cờ `consumed`.

`Scripts/Enemies/EnemyMover.cs`: giống `Projectile` nhưng đi xuống, và tự trả pool khi `body.position.y < ScreenBounds.Get().yMin - despawnMargin`. `ScreenBounds` là helper tĩnh mới trong `Scripts/Core/`:

```csharp
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
```

## 9. Số liệu chạy thử

| t (s) | Player HP | Bọ còn | Chi tiết |
|------|-----------|--------|----------|
| 0.0 | 3 | 3 | HP 2 mỗi con |
| 2.8 | 3 | 2 | 1 con trúng 2 đạn → chết |
| 5.1 | **2** | 2 | 1 con đâm tàu; con kia trúng 1 đạn còn HP 1 |
| 9.7 | 2 | 0 | 2 con còn lại bay quá y = −10 → tự dọn |

Console không có exception → matrix + trigger đúng ngay lần đầu, vì Full Kinematic Contacts đã bật sẵn.

## Bài sau

[Shmup #6](/lab/unity-shmup-06-scriptable-objects): ScriptableObject, một prefab bọ chạy được nhiều loại địch.
