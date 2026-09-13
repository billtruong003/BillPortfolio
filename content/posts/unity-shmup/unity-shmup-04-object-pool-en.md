---
title: "Shmup #4: Two projectile lifetimes — understand object pooling by comparison"
date: "2026-09-17"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-04-object-pool
series: "shmup"
order: 4
excerpt: "Compare create/destroy with rent/return, define reset responsibilities, and migrate the complete shooting system without changing its behavior."
coverImage: "/images/posts/unity-shmup/04/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>LESSON 3</strong><p>Instantiate → travel → Destroy</p><p>Every shot gets a new instance.</p></div><div><strong>LESSON 4</strong><p>Rent → position → enable → travel → return</p><p>An existing instance begins a new lifetime.</p></div></div>

## Same behavior, different resource ownership

Start with lesson 3's shooting system and save `SEU_04_Pool`. Fire and its cadence remain the same. The change concerns how bullets live and disappear.

A pool keeps inactive copies for reuse. If none are available, it may create another. Pooling is not automatically faster in every situation; it controls creation and destruction, and meaningful performance claims require measurement.

The difficult part is leftover state. A fresh bullet receives a fresh lifetime; a reused one also needs a new lifetime, direction, and position.

## Three roles and one contract

| Component | Owns | Does not own |
|---|---|---|
| PrefabPool | Creation, inactive storage, positioning before enable | Damage rules |
| PooledObject | Return destination and duplicate-return guard | Lifetime expiry |
| Projectile | Movement and expiry | Inactive storage |

This implementation creates prefabs beneath an inactive parent. Prewarming therefore does not trigger effects or timers as if a real shot had spawned. Get positions the object before enabling it; OnEnable starts its lifetime. Gameplay Configure calls introduced in lesson 6 run immediately after Get, before the next physics step.

## Build the shared assembly

Create `_Common/Scripts/BillLab.Common.asmdef`, named BillLab.Common. Add BillLab.Common to ShootEmUp.asmdef's references. The dependency points game → Common; Common does not reference ShootEmUp.

Create both files under `_Common/Scripts/Pooling`. Start with PooledObject, which stores the return destination and whether it has already returned.

**Assets/_Common/Scripts/Pooling/PooledObject.cs**

```csharp
using UnityEngine;
namespace BillLab.Common.Pooling
{
    [DisallowMultipleComponent]
    public sealed class PooledObject : MonoBehaviour
    {
        public PrefabPool Pool { get; internal set; }
        private bool released;
        private void OnEnable() => released = false;
        public void Release()
        {
            if (released) return;
            released = true;
            if (Pool != null) Pool.Release(gameObject);
            else Destroy(gameObject);
        }
    }
}
```

OnEnable resets the flag for another lifetime. Repeated Release calls are ignored, but the hit component must still prevent duplicate damage. Returning an object and applying damage are separate responsibilities.

**Assets/_Common/Scripts/Pooling/PrefabPool.cs**

```csharp
using UnityEngine;
using UnityEngine.Pool;
namespace BillLab.Common.Pooling
{
    public sealed class PrefabPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField, Min(0)] private int prewarm = 20;
        [SerializeField, Min(1)] private int maxSize = 100;
        private ObjectPool<GameObject> pool;
        private Transform staging;
        public int CountActive => pool.CountActive;
        public int CountInactive => pool.CountInactive;
        private void Awake()
        {
            var holder = new GameObject("Inactive factory");
            holder.SetActive(false);
            staging = holder.transform;
            staging.SetParent(transform, false);
            pool = new ObjectPool<GameObject>(Create, null,
                go => go.SetActive(false), go => Destroy(go), true,
                Mathf.Max(1, prewarm), Mathf.Max(1, maxSize));
            var warm = new GameObject[Mathf.Min(prewarm, Mathf.Max(1, maxSize))];
            for (var i = 0; i < warm.Length; i++) warm[i] = pool.Get();
            foreach (var go in warm) pool.Release(go);
        }
        private GameObject Create()
        {
            var go = Instantiate(prefab, staging);
            go.SetActive(false);
            go.transform.SetParent(transform, false);
            var pooled = go.GetComponent<PooledObject>();
            if (pooled == null) pooled = go.AddComponent<PooledObject>();
            pooled.Pool = this;
            return go;
        }
        public GameObject Get(Vector3 position, Quaternion rotation, Vector3? scale = null)
        {
            var go = pool.Get();
            go.transform.SetPositionAndRotation(position, rotation);
            go.transform.localScale = scale ?? prefab.transform.localScale;
            var body = go.GetComponent<Rigidbody2D>();
            if (body != null)
            {
                body.position = position;
                body.rotation = rotation.eulerAngles.z;
                body.linearVelocity = Vector2.zero;
                body.angularVelocity = 0f;
            }
            go.SetActive(true);
            return go;
        }
        public void Release(GameObject go) => pool.Release(go);
        private void OnDestroy() => pool?.Clear();
    }
}
```

`ObjectPool<GameObject>` supplies storage and callbacks. Prewarming rents N objects before returning them all; immediately renting and returning in one loop could repeatedly reuse just one object. **Max Size limits retained inactive copies**, not the maximum number of flying bullets. See [Unity's ObjectPool API](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Pool.ObjectPool_1.html).

In Get, `scale ?? prefab.transform.localScale` handles a nullable Vector3, not a UnityEngine.Object lifetime check.

## Migrate both projectile and shooter

Replace Projectile entirely. Do not retain lesson 3's `Destroy(gameObject, lifetime)`:

**Assets/_ShootEmUp/Scripts/Combat/Projectile.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile goes back to the pool, even if it hit nothing.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnTime;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            despawnTime = Time.time + lifetime;
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

OnEnable resets the expiry timer. Update does not run while the object is inactive, so an already-returned bullet does not keep counting toward another return.

Replace PlayerShooting with the complete file in the [lesson 4 source archive](/downloads/shmup/lesson-04.zip). Its central changes replace `projectilePrefab` with `projectilePool`, and Instantiate with `projectilePool.Get(muzzle.position, muzzle.rotation)`. The archive includes the unchanged input sections too.

## Wire the migration explicitly

| Location | Change |
|---|---|
| Bullet_Player prefab | Rigidbody2D, Projectile, and **PooledObject** must exist |
| Scene | Create BulletPool and add PrefabPool |
| BulletPool | Prefab = Bullet_Player, Prewarm 20, Max Size 100 |
| PlayerShooting | Drag scene BulletPool into Projectile Pool |
| Controls / Muzzle | Verify the existing references |

Editing RequireComponent does not necessarily retrofit all existing prefabs. Open the prefab and explicitly verify PooledObject.

![Example pool and prefab configuration](/images/posts/unity-shmup/04/pool_01_bulletpool-inspector.webp)

## Test rent — return — rent again

Enter Play Mode. BulletPool contains 20 inactive bullets and an **Inactive factory** object. The factory is a safe creation parent, not a twenty-first bullet. Fire, release input, wait beyond Lifetime, then fire again. Existing bullets should reappear at the muzzle with full lifetimes.

Temporarily set Prewarm to 1 to observe growth, then restore 20. Growth under demand is expected, not automatically a leak.

For performance comparison, hold scene, duration, firing rate, and device constant. Wait until prewarming finishes, then inspect CPU and GC Alloc in the Profiler. Child counts are not FPS evidence. This lesson's required outcome is correct reuse; lesson 5 adds another reason to return early: hitting a target.

## Source for this stage

[Download all lesson 4 scripts](/downloads/shmup/lesson-04.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #5](/lab/unity-shmup-05-enemies-collision-en).

