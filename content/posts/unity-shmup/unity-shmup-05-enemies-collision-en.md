---
title: "Shmup #5: Collision rules — from overlap to damage and death"
date: "2026-09-18"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-05-enemies-collision
series: "shmup"
order: 5
excerpt: "Define interactions before wiring colliders, then complete Health, DamageOnContact, and EnemyMover with repeatable checks."
coverImage: "/images/posts/unity-shmup/05/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-rules"><strong>THIS STAGE'S RULES</strong><p>Player bullet → enemy: lose 1 HP, consume bullet.</p><p>Enemy → player: lose 1 HP on initial contact; enemy keeps moving.</p><p>Player bullet → player / enemy → enemy: ignore.</p></div>

## Define rules before choosing components

Start with pooled shooting and save `SEU_05_Enemies`. Finish with three descending enemies at 2 HP each and a player at 3 HP. There is no HUD yet; observe destroyed objects and inspect Health's state using the Debug Inspector when needed.

**Collider2D** defines the contact shape. A **trigger** reports overlap without pushing objects apart. **Rigidbody2D** participates in simulation. The **Layer Collision Matrix** selects which pairs to consider. Understand these roles before setting checkboxes.

## Turn the interaction table into a Layer Matrix

Create available user layers named Player, PlayerProjectile, Enemy, EnemyProjectile, and Pickup. Their numeric slots do not have to match the screenshot. In Physics 2D → Layer Collision Matrix, allow these pairs:

| Pair | Enabled | Purpose |
|---|---|---|
| PlayerProjectile × Enemy | Yes | Player bullets hit enemies |
| Player × Enemy | Yes | Ramming |
| Player × EnemyProjectile | Yes | Reserved for the enemy-bullet exercise |
| Player × Pickup | Yes | Used in lesson 9 |
| Other pairs involving these layers | No | No intended interaction |

Sorting Layers still only control drawing. A correct Sorting Layer cannot repair an incorrect physics Layer.

**Triggers differ from ordinary collisions.** [Unity's RigidbodyType2D.Kinematic documentation](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RigidbodyType2D.Kinematic.html) identifies triggers as an exception to Kinematic–Kinematic collision restrictions. The trigger colliders here do not require Full Kinematic Contacts merely to receive trigger messages. At least one side needs Rigidbody2D, and both sides must use **2D** physics.

## Health owns HP; DamageOnContact owns the hit

The flow is overlap → find Health → subtract HP → report changes → report death at zero → clean up according to policy. Enemies return to a pool or are destroyed. The player remains available so later lessons can display HP and Game Over.

Create the full Health file:

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

Current belongs to each instance and resets on enable. Changed supports displays; Damaged reports actual hits; Died reports reaching zero. SetMax and Heal are controlled mutation methods used later by data and pickups.

DefaultExecutionOrder initializes Health before ordinary listeners. A HUD or effect should not read uninitialized health and require a repair at the end of the series.

Create DamageOnContact:

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

For bullets, set consumed **before** TakeDamage. A bullet overlapping two enemies in one physics step only acts once. This is part of the completed collision behavior, not a bug deferred to the wave lesson. Enabling a reused bullet resets the flag.

## Move enemies beyond the screen

Create both files before attaching EnemyMover:

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

ScreenBounds returns an orthographic world rectangle. EnemyMover moves downward and cleans up beyond the bottom plus a margin. **Leaving the screen does not call TakeDamage**, so it must not count as a kill.

## Assemble all three object types

| Object | Layer / Collider | Components and values |
|---|---|---|
| Bullet_Player prefab | PlayerProjectile; CapsuleCollider2D trigger, approximately (0.35, 1.1) | Kinematic body; DamageOnContact Damage 1, Release Self On Hit enabled |
| Enemy_Insect prefab | Enemy; CircleCollider2D trigger, radius approximately 0.45 | Kinematic body; PooledObject; Health Max 2, Remove On Death enabled; EnemyMover Speed 3; DamageOnContact Damage 1, Release Self On Hit disabled |
| Player | Player; fitted PolygonCollider2D trigger | Kinematic body; Health Max 3, **Remove On Death disabled** |

Collider dimensions are local and affected by object scale. Verify actual hit regions in Scene view. Enemies carry PooledObject but are manually placed in this stage; Release falls back to Destroy without a pool owner.

![Locating the player's collider and Health](/images/posts/unity-shmup/05/enemy_05_player-collider-health.webp)

Place enemies at (−2.2, 9.5), (0, 11), and (2.2, 12.5). They enter from above because the camera's top is Y = 8.

## Use a test matrix instead of one recorded run

Start with one enemy: one bullet should not kill it; two should. Then ram the player: HP falls by one when overlap begins. Remaining overlapped does not cause one damage every frame; separating and re-entering starts another overlap.

Overlap two enemies and confirm one bullet is consumed once without a double-release error. Do not shoot and confirm enemies disappear below the screen. At zero HP, the player remains present; lesson 8 connects the HUD and end-of-run behavior.

For missing hits, inspect Layer Matrix, Is Trigger, Rigidbody2D, collider shape, and position in that order. If hits arrive but HP is wrong, inspect Damage and Health instead. Diagnose the layer that owns the failure.

## Source for this stage

[Download all lesson 5 scripts](/downloads/shmup/lesson-05.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #6](/lab/unity-shmup-06-scriptable-objects-en).

