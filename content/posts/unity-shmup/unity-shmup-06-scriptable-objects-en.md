---
title: "Shmup #6: One machine, many enemy types — separate configuration from state"
date: "2026-09-19"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-06-scriptable-objects
series: "shmup"
order: 6
excerpt: "Derive EnemyData, Apply, and WeaponData from two enemy variants, while keeping shared configuration separate from per-instance health."
coverImage: "/images/posts/unity-shmup/06/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>INSECT BASIC</strong><p>2 HP · Speed 3 · Score 10</p></div><div><strong>INSECT FAST</strong><p>1 HP · Speed 5.5 · Score 20</p></div></div>

## What actually differs between two enemies?

Lesson 5 produced a prefab with rendering, health, damage, and movement. Duplicating it to create a faster enemy works initially, but a structural change would eventually need updating across many copies.

Compare the cards above. Their components are identical; sprites and numbers differ. Keep **one prefab** and move those differences into **two data assets**. Save the scene as `SEU_06_Data`.

## Keep three kinds of data separate

| Location | Owns | Example |
|---|---|---|
| Prefab | Shared component structure and references | Rigidbody, collider, Enemy |
| ScriptableObject asset | Type configuration | Max HP 2, Speed 3 |
| Instance component | Individual runtime state | Enemy A has 1 HP, B has 2 HP |

A ScriptableObject is an asset in Project, not a component attached to a GameObject. Two enemies can read the same EnemyData. They must **not** write Current HP into that shared asset, or one enemy's damage could alter the entire type's data.

## Derive the data from the comparison

Create EnemyData:

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

CreateAssetMenu adds an asset creation menu. Min constrains Inspector editing; it does not replace all runtime validation. ScoreValue is stored now and becomes useful when lesson 8 connects scoring.

Under `ScriptableObjects/Enemies`, use Create → ShootEmUp → Enemy Data:

| Asset | Your sprite | Max Health | Speed | Contact Damage | Score |
|---|---|---|---|---|---|
| Enemy_InsectBasic | Regular enemy | 2 | 3 | 1 | 10 |
| Enemy_InsectFast | Second enemy | 1 | 5.5 | 1 | 20 |

![An EnemyData asset in the Inspector](/images/posts/unity-shmup/06/data_02_enemydata-inspector.webp)

## Apply connects configuration to behavior

Enemy reads the asset and sends each value to the component responsible for using it:

<div class="lesson-flow"><span>EnemyData</span><span>Enemy.Apply</span><span>Sprite / Health / Mover / Damage</span></div>

Replace Health, DamageOnContact, and EnemyMover with the complete lesson 6 versions so SetMax, Speed, and Damage match the new interface. Preserve prefab references and replace files at their original paths rather than creating duplicate classes.

Create Enemy.cs:

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

OnEnable applies the default configuration on each activation. Public Apply also lets a future spawner select a type after Get. Health initializes before ordinary components, and SetMax both sets the limit and refills HP, preventing reused enemies from retaining old health.

Open Enemy_Insect, add Enemy, and assign **Enemy_InsectBasic** to Data. The renderer and other component fields now provide defaults that Enemy.Apply overwrites.

## Make a variant through an instance override

Keep three enemies in the scene. On the middle instance, change Data to Enemy_InsectFast. This is an instance override: do not Apply All to the prefab, which would change the default type for every instance.

Play. The regular enemies should move slowly and take two hits; the middle one should move faster and take one. This verifies rendering, movement, and health together. A different sprite alone is insufficient evidence.

## Apply the same idea to weapons

Create WeaponData:

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

Create **Weapon_Laser** with Shots Per Second 6, Projectile Speed 14, Damage 1. Replace Projectile and PlayerShooting using the complete lesson 6 files. PlayerShooting receives WeaponData instead of its own rate field, then calls Projectile.Configure after Get to set speed and contact damage.

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

Assign Weapon_Laser to Player's Weapon field. Verify Controls, Projectile Pool, and Muzzle remain connected. Each shot reads the current weapon configuration; already-flying bullets keep the speed and damage assigned at spawn.

## Understand when an edit takes effect

During Play Mode, change Weapon_Laser's Shots Per Second from 6 to 12. Subsequent shots change cadence. Changing Enemy_InsectBasic's Speed does not automatically update an already-moving enemy if Apply only runs on activation. A data asset does not push every edit into every consumer.

Editor asset edits made during Play Mode may persist after stopping. Inspect the diff and restore 6/14/1 if the change was only experimental. This is not a built-game save system.

Finish when one prefab represents two types, each instance owns independent HP, and you can distinguish **values copied at spawn** from **values read for every shot**.

## Source for this stage

[Download all lesson 6 scripts](/downloads/shmup/lesson-06.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #7](/lab/unity-shmup-07-waves-asteroids-en).

