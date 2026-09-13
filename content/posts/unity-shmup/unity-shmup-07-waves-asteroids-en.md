---
title: "Shmup #7: Draw the schedule, then build the wave spawner"
date: "2026-09-20"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-07-waves-asteroids
series: "shmup"
order: 7
excerpt: "Use a timeline to understand coroutines, count, interval, and delayAfter, then spawn different enemy types from one pool."
coverImage: "/images/posts/unity-shmup/07/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-timeline"><p><strong>1.0 s</strong> · Spawn #1</p><p><strong>1.8 s</strong> · Spawn #2</p><p><strong>2.6 s</strong> · Spawn #3</p><p><strong>4.6 s</strong> · Next wave after a 2-second rest</p></div>

## A wave is a schedule, not a pile of objects

Lesson 6 introduced enemy types but still placed them manually. Replace manual placement with a schedule: wait one second, spawn three enemies 0.8 seconds apart, rest two seconds, then continue. Save `SEU_07_Waves`.

The timeline defines **interval only between spawns**. After the final enemy, wait only delayAfter, not another unintended interval. Actual times are rounded to the frame where the coroutine resumes; the numbers show the target schedule.

A wave finishes when it has spawned its count, not when all enemies die. “Clear every enemy before proceeding” would be a different condition requiring a separate counter.

## Translate the schedule into WaveSet

| Field | Meaning | Example |
|---|---|---|
| enemy | Type used for the wave | InsectBasic |
| count | Total spawns | 3 |
| interval | Seconds between spawns | 0.8 |
| delayAfter | Seconds after the last spawn | 2 |
| loop | Repeat the entire list | Off for the first test |

Create WaveSet:

**Assets/_ShootEmUp/Scripts/Data/WaveSet.cs**

```csharp
using System;
using UnityEngine;

namespace ShootEmUp.Data
{
    [CreateAssetMenu(menuName = "ShootEmUp/Wave Set", fileName = "Waves_New")]
    public sealed class WaveSet : ScriptableObject
    {
        [Serializable]
        public struct Wave
        {
            public EnemyData enemy;
            [Min(1)] public int count;
            [Tooltip("Seconds between two spawns inside this wave.")]
            [Min(0f)] public float interval;
            [Tooltip("Seconds to wait after the last spawn of this wave before the next wave starts.")]
            [Min(0f)] public float delayAfter;
        }

        public Wave[] waves = Array.Empty<Wave>();

        [Tooltip("Start again from the first wave when the last one is done.")]
        public bool loop = true;
    }
}
```

Serializable lets Unity display each Wave in the Inspector. The ScriptableObject stores the schedule; the spawner executes it. Create **Waves_Level1** under ScriptableObjects/Waves with only the example wave and Loop disabled.

## A coroutine expresses waiting in the code

An ordinary method runs to completion when called. A coroutine runs until yield, returns control, and resumes on an eligible frame. WaitForSeconds uses game time; it does not create a new thread.

Create WaveSpawner:

**Assets/_ShootEmUp/Scripts/Enemies/WaveSpawner.cs**

```csharp
using System.Collections;
using BillLab.Common.Pooling;
using ShootEmUp.Core;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    public sealed class WaveSpawner : MonoBehaviour
    {
        [Tooltip("Pool of the generic enemy prefab.")]
        [SerializeField] private PrefabPool enemyPool;

        [Tooltip("Which waves to play, in order.")]
        [SerializeField] private WaveSet waveSet;

        [Tooltip("How far above the visible top edge enemies appear.")]
        [SerializeField] private float spawnMargin = 1.5f;

        [Tooltip("Keep spawns this far from the left/right edges so big asteroids are not half off-screen.")]
        [SerializeField] private float horizontalPadding = 1f;

        [Tooltip("Seconds before the first wave, so the player can get ready.")]
        [SerializeField] private float initialDelay = 1f;

        private Coroutine running;

        private void OnEnable()
        {
            running = StartCoroutine(Run());
        }

        private void OnDisable()
        {
            if (running != null) StopCoroutine(running);
        }

        private IEnumerator Run()
        {
            if (waveSet == null || waveSet.waves == null || waveSet.waves.Length == 0) yield break;
            yield return new WaitForSeconds(initialDelay);

            do
            {
                foreach (var wave in waveSet.waves)
                {
                    if (wave.enemy == null || wave.count < 1) continue;
                    for (var i = 0; i < wave.count; i++)
                    {
                        Spawn(wave.enemy);
                        if (i + 1 < wave.count) yield return new WaitForSeconds(Mathf.Max(0f, wave.interval));
                    }

                    yield return new WaitForSeconds(wave.delayAfter);
                }
                yield return null;
            }
            while (waveSet.loop);
        }

        private void Spawn(EnemyData data)
        {
            var bounds = ScreenBounds.Get();
            var x = Random.Range(bounds.xMin + horizontalPadding, bounds.xMax - horizontalPadding);
            var position = new Vector3(x, bounds.yMax + spawnMargin, 0f);

            var enemy = enemyPool.Get(position, Quaternion.identity);
            enemy.GetComponent<Enemy>().Apply(data);
        }
    }
}
```

The inner loop counts enemies; the outer loop walks through waves. OnDisable stops the coroutine when disabling the component, allowing lesson 8 to stop spawning with enabled = false. Re-enabling this version restarts the schedule.

An empty list is rejected so a repeating schedule cannot spin without yielding. Validate this even if your initial asset always contains a wave.

## Rent an enemy and choose its location

X is randomized within horizontal bounds minus padding. Y is the camera top plus spawnMargin so enemies enter from offscreen. The pool positions before enabling; Enemy.Apply immediately selects the new configuration.

Delete the manually placed enemies. Create **EnemyPool**, Prefab = Enemy_Insect, Prewarm 15, Max Size 60. Create **WaveSpawner**, assign EnemyPool and Waves_Level1, and set Initial Delay 1, Spawn Margin 1.5, Horizontal Padding 1.

![WaveSpawner references](/images/posts/unity-shmup/07/waves_04_spawner-after-wire.webp)

Run the three-enemy wave. Count exactly three arrivals, then no more. Disable the component mid-wave and verify no new spawn follows. Establish this before expanding to many randomized types.

## Asteroids extend the configuration

Replace EnemyData, Enemy, and EnemyMover with lesson 7's complete versions. They add **colliderRadius** and **rotationSpeed**, applying those values to CircleCollider2D and the mover. The archive contains the complete interfaces.

Create three EnemyData assets:

| Asset | HP | Speed | Radius at scale 1 | Rotation °/s | Score |
|---|---|---|---|---|---|
| Asteroid_Small | 1 | 4 | 0.4 | 90 | 5 |
| Asteroid_Medium | 3 | 2.5 | 0.55 | 45 | 15 |
| Asteroid_Large | 6 | 1.5 | 0.85 | 20 | 40 |

Radius uses local units. Adapt it for different artwork and object scale rather than treating it as a fixed world radius. Keep insects at Rotation Speed 0. Rename Enemy_Insect to Enemy_Generic in Unity if desired, making its name match its broader role.

## A reproducible six-wave schedule

| Wave | Enemy | Count | Interval | Delay After |
|---|---|---|---|---|
| 1 | InsectBasic | 4 | 0.8 | 2 |
| 2 | Asteroid_Small | 6 | 0.5 | 2 |
| 3 | InsectFast | 4 | 0.6 | 2 |
| 4 | Asteroid_Medium | 3 | 1.0 | 2 |
| 5 | InsectBasic | 5 | 0.5 | 0.5 |
| 6 | Asteroid_Large | 1 | 0.8 | 3 |

Each row holds one EnemyData. The insect group and large asteroid are consecutive rows, not a hidden mixed-wave setting. Enable Loop after verifying one complete pass.

Finish when counts and rests match the schedule, offscreen enemies are cleaned up, each type receives the right sprite/HP/collider, and disabling the spawner prevents the next spawn. The game now runs continuously; lesson 8 gives a run a clear ending.

## Source for this stage

[Download all lesson 7 scripts](/downloads/shmup/lesson-07.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #8](/lab/unity-shmup-08-hud-game-loop-en).

