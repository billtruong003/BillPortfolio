---
title: "Shmup #9: A pickup's journey and the lifetime of a buff"
date: "2026-09-22"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-09-pickups-shield
series: "shmup"
order: 9
excerpt: "Make one healing pickup work before adding shields, rapid fire, refresh rules, and the two stages of loot probability."
coverImage: "/images/posts/unity-shmup/09/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Enemy dies</span><span>Drop?</span><span>Select type</span><span>Spawn</span><span>Collect</span><span>Apply / expire</span></div>

## Define effects before introducing randomness

Start with Game Over and Restart, saving `SEU_09_Pickups`. This stage adds three pickup types. Force one type to appear while testing behavior, then add probability.

| Type | Effect | Collecting again | Ending |
|---|---|---|---|
| ExtraLife | Restore 1 HP up to Max | Heal again if damaged | Immediate |
| Shield | Ignore damage for 6 seconds | Refresh to 6 seconds from collection | Clear immunity and visual |
| RapidFire | Use Weapon_Rapid for 6 seconds | Refresh duration | Restore Weapon_Laser |

ExtraLife means **healing**, not a spare life. At full HP, collection still consumes the pickup without exceeding Max. Game Over rejects new pickups and clears active buffs.

## Begin with one manually placed healing item

Create PickupData:

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

Under ScriptableObjects/Pickups, create **Pickup_ExtraLife**, Kind ExtraLife, a healing sprite, Fall Speed 2. Also create Pickup_Shield and Pickup_RapidFire with Duration 6. Create Weapon_Rapid at Shots Per Second 15, Projectile Speed 14, Damage 1, and assign it to RapidFire's Weapon Override.

Replace PlayerShooting with lesson 9's complete version. It adds OverrideWeapon/ClearOverride, selecting the temporary weapon when present and the base weapon otherwise. Do not modify the shared weapon asset to represent a ship's temporary buff.

Create PlayerPowerups before attaching it:

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

Awake caches Health and Shooting. Collect rejects dead players. ClearEffects stops routines, clears immunity, restores the weapon, and hides the shield on death or disable. These lifecycle points matter as much as collection.

Add a **Shield** child to Player, position it to fit the artwork, use Sorting Player Order 1, and disable it initially. Add PlayerPowerups and assign Shield Visual.

## A pickup transports data to its receiver

Create Pickup.cs:

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

It falls, delivers data to PlayerPowerups on contact, then returns to the pool. A consumed flag prevents duplicate collection from multiple callbacks in one physics step. Leaving the screen also cleans it up, without applying an effect.

Create **Pickup_Generic**: Layer Pickup; SpriteRenderer Sorting Projectiles; Kinematic Rigidbody2D; CircleCollider2D trigger radius 0.4; PooledObject; Pickup. Set default Data to Pickup_ExtraLife. Lesson 5 already allowed Player × Pickup and disabled irrelevant pairs.

Place one instance above the player. Enter Play Mode, take one damage, then collect it: exactly one HP should be restored and the item should disappear. Test Shield and RapidFire by changing the default Data. Delete the manual test instance before connecting the dropper.

## Duplicate collection refreshes one timer

<div class="lesson-timeline"><p><strong>t = 0</strong> · Collect Shield; expires at t = 6</p><p><strong>t = 4</strong> · Collect again; stop old timer, new expiry t = 10</p><p><strong>t = 6</strong> · Shield remains active</p><p><strong>t = 10</strong> · Shield ends</p></div>

Without stopping the old coroutine, it could disable the shield at second six despite the refreshed duration. The two timed effects have independent slots, so Shield does not cancel RapidFire.

WaitForSeconds uses game time; six seconds is the target duration, ending on the frame where the coroutine resumes. Verify rapid fire by counting shots over a fixed interval, not by using Score as a firing-rate proxy.

## Separate “any drop” from “which drop”

`dropChance` answers whether an enemy drops an item. `PickupTable` selects the type conditional on a drop occurring. These are separate configuration decisions.

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

Create Pickups_Default with ExtraLife weight 1, Shield 2, RapidFire 3. The total is 6, so conditional probabilities are 1/6, 2/6, and 3/6. At an enemy dropChance of 0.3, a Shield's per-kill probability is `0.3 × 2/6 = 0.1`, or 10%.

Use nonnegative weights and assigned assets. Zero total weight produces no selection. Weights do not have to sum to one.

## Connect enemy death to the drop system

Replace EnemyData with lesson 9's version to add Drop Chance. Use 1 for deterministic testing. Afterwards, example chances are Basic 0.3, Fast 0.4, Small 0.1, Medium 0.25, and Large 1.

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

Create **PickupPool**, prefab Pickup_Generic, Prewarm 5, Max Size 30. Create **PickupDropper** and connect its pool and table. It listens to the existing Enemy.Killed event and reads position before cleanup. No event signature or scoring rewrite is needed.

Finish when healing respects Max, shields block damage then expire, rapid fire restores the base weapon, refresh follows the timeline, death rejects items, and restart clears buffs. Test randomness last over many kills; a few missing drops do not demonstrate a bug.

## Source for this stage

[Download all lesson 9 scripts](/downloads/shmup/lesson-09.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #10](/lab/unity-shmup-10-audio-juice-en).

