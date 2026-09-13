---
title: "Shmup #3: The lifetime of a shot — from Fire to expiry"
date: "2026-09-16"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-03-shooting
series: "shmup"
order: 3
excerpt: "Understand prefabs and instances through one projectile: its muzzle, motion, cooldown, and expiration."
coverImage: "/images/posts/unity-shmup/03/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Hold Fire</span><span>Pass cooldown</span><span>Spawn at Muzzle</span><span>Travel</span><span>Expire</span></div>

## Separate the shooter from its projectile

Start with the movable ship and save the scene as `SEU_03_Shoot`. Finish with held Space firing bullets that travel upward and disappear. There are no enemies yet, so damage is outside this lesson.

PlayerShooting decides **when and where** to create a bullet. Projectile decides **how that bullet moves and expires**. Existing bullets remain independent when the ship moves or stops firing.

A prefab is a template stored in Project; an instance is a copy in the scene. Save one prefab to create many bullets with the same renderer and behavior.

## Make one projectile work first

Create Scripts/Combat/Projectile.cs:

**Assets/_ShootEmUp/Scripts/Combat/Projectile.cs**

```csharp
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile removes itself, even if it hit nothing. Keeps the scene from filling up.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
        }

        private void OnEnable()
        {
            Destroy(gameObject, lifetime);
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
```

Awake caches the Rigidbody. OnEnable schedules the lifetime. FixedUpdate moves along `transform.up`, the bullet's local Y axis, independently of the ship's subsequent position.

This is a create/destroy lifetime. Lesson 4 replaces the Destroy schedule with pool release. Merely switching Instantiate to pooling while retaining delayed Destroy would eventually delete a reused bullet.

Create an empty **Bullet_Player**, add SpriteRenderer, choose a laser sprite, and use Sorting Projectiles. Scale it smaller than the ship. Add Projectile, then configure Rigidbody2D as **Kinematic**, Interpolate. Set Speed 14 and Lifetime 2. Drag the object into `Prefabs` to create the template.

Play with one instance at the screen center. It should travel and disappear after about two seconds. Stop, delete the scene instance, and keep the prefab asset.

## Muzzle is a position you can edit visually

Add an empty child named **Muzzle** to Player, approximately local position (0, 1.05, 0), local rotation 0. Put it at the ship's nose; adapt it to the artwork instead of treating 1.05 as universal.

It needs no renderer or collider. PlayerShooting reads its Transform. When changing ships, move the Muzzle without editing a hard-coded position offset.

## Fire represents held input

Open ShmupControls and add **Fire** under Gameplay, Action Type **Button**. Bind Space, left mouse button, and gamepad buttonSouth. Save Asset.

Create Scripts/Player/PlayerShooting.cs:

**Assets/_ShootEmUp/Scripts/Player/PlayerShooting.cs**

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    public sealed class PlayerShooting : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Fire action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("Prefab spawned for every shot. Its 'up' must point in the travel direction.")]
        [SerializeField] private GameObject projectilePrefab;

        [Tooltip("Where the projectile appears. A child Transform at the ship's nose.")]
        [SerializeField] private Transform muzzle;

        [Tooltip("Fire rate while the button is held.")]
        [SerializeField] private float shotsPerSecond = 6f;

        private InputAction fireAction;
        private float nextShotTime;

        private void Awake()
        {
            fireAction = controls.FindAction("Gameplay/Fire", throwIfNotFound: true);
        }

        private void OnEnable()
        {
            fireAction.Enable();
        }

        private void OnDisable()
        {
            fireAction.Disable();
        }

        private void Update()
        {
            if (!fireAction.IsPressed() || Time.time < nextShotTime)
            {
                return;
            }

            Instantiate(projectilePrefab, muzzle.position, muzzle.rotation);
            nextShotTime = Time.time + 1f / shotsPerSecond;
        }
    }
}
```

IsPressed means held, not newly pressed this frame. `nextShotTime` records the earliest allowed next shot. At six shots per second, the target gap is `1/6 ≈ 0.167` seconds.

<div class="lesson-timeline"><p><strong>t = 0</strong> · Fire immediately if held</p><p><strong>0 &lt; t &lt; 0.167</strong> · Wait even while held</p><p><strong>t ≥ 0.167</strong> · Fire on the next eligible frame</p></div>

Time-based cooldown avoids specifying a fixed number of frames. This simple implementation is still frame-quantized: low FPS can reduce the actual rate. It does not guarantee exactly six shots each second on every machine.

## Connect three references with different roles

Add PlayerShooting to Player:

| Field | Drag from | Value |
|---|---|---|
| Controls | Project | ShmupControls |
| Projectile Prefab | Project | Bullet_Player.prefab |
| Muzzle | Hierarchy | Player/Muzzle |
| Shots Per Second | Inspector | 6 |

![Connected PlayerShooting references](/images/posts/unity-shmup/03/shoot_04_player-inspector-after-wire.webp)

The prefab is an asset; Muzzle is a scene object. Confusing them commonly causes an incorrect firing position or an unassigned field.

## Observe both firing and stopping

Play, hold Fire, and move. Bullets should spawn at the nose at firing time and then travel independently. Release Fire: no new bullets should appear, but old ones keep moving. After more than Lifetime, all should be gone.

![Live bullet instances in the Hierarchy](/images/posts/unity-shmup/03/shoot_05_hierarchy-clones-in-play.webp)

Estimated concurrent bullets equal actual firing rate multiplied by Lifetime: approximately 12 here. This is an estimate, not a condition that must hold on every frame.

Frequent creation and destruction alone do not prove the game stutters. Lesson 4 changes the lifetime mechanism and explains how to compare the same workload in the Profiler.

## Source for this stage

[Download all lesson 3 scripts](/downloads/shmup/lesson-03.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #4](/lab/unity-shmup-04-object-pool-en).

