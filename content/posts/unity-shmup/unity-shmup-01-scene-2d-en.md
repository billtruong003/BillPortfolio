---
title: "Shmup #1: Anatomy of a 2D screen — camera, layers, and stars"
date: "2026-09-14"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-01-scene-2d
series: "shmup"
order: 1
excerpt: "Build the static screen first, then add motion through world units, camera framing, sorting, and repeating star layers."
coverImage: "/images/posts/unity-shmup/01/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: true
---

<div class="lesson-stack"><div>FX / UI · information and feedback</div><div>Player · ship and flame</div><div>Projectiles / Enemies · gameplay objects</div><div>Stars-Near → Stars-Far → BG · background</div></div>

## One screen, several visible layers

Start with lesson 0's project. Finish with a stationary ship near the bottom, two moving star layers, and a portrait frame. Make the static picture correct before introducing motion.

![Reference composition with ship, stars, and background](/images/posts/unity-shmup/01/scene_08_scrolling-stars.webp)

A scene holds GameObjects. Transforms define position, rotation, and scale. SpriteRenderers draw images. A camera chooses the world area shown in Game view. Scene view can inspect everything; Game view only shows the camera's selection.

## A 9 × 16 world-unit frame

Create a **Basic (URP)** scene and save it as `_ShootEmUp/Scenes/SEU_01_Scene.unity`. Add a **1080 × 1920** Fixed Resolution in Game view. Delete the Directional Light: use **Sprite-Unlit-Default** materials, which do not require that light.

| Main Camera | Value |
|---|---|
| Position / Rotation | (0, 0, −10) / (0, 0, 0) |
| Projection | Orthographic |
| Size | 8 |
| Background Type / Color | Solid Color / #0B0F2A |

Size is half the height: `2 × 8 = 16`. At 9:16, width becomes `16 × 9/16 = 9`. A centered camera sees X = −4.5…4.5 and Y = −8…8. These are world units, not pixels.

![Orthographic camera fields](/images/posts/unity-shmup/01/scene_02_camera-inspector.webp)

Place the ship at (0, 0, 0) and confirm it appears in the center. Then move it to (0, −5.5, 0) and name it Player.

## Draw order produces depth

Under Project Settings → Tags and Layers → **Sorting Layers**, create Background, Default, Enemies, Projectiles, Player, FX, UI in that order. Later layers draw over earlier ones. Within a layer, a larger Order in Layer draws later.

A Sorting Layer is not a physics Layer. A bullet appearing behind the ship is a drawing rule; a bullet not damaging the ship is a collision rule for lesson 5.

Set Player to Sorting Player, Order 0. Add an EngineFire child with a flame sprite, approximately local position (0, −1.02, 0), Order −1. Adapt its position to your artwork. A child follows its parent when the ship moves.

## Cover the frame with a static background

Create an empty Background at the origin with three children:

| Object | Construction | Sorting |
|---|---|---|
| BG | Background covering at least 9 × 16 units | Background / 0 |
| Stars-Far | Tiled, Size (10, 40), alpha 0.45 | Background / 1 |
| Stars-Near | Tiled, Size (10, 40), alpha 0.8 | Background / 2 |

A 1000 × 1000 px image at PPU 100 and scale (1, 1.7, 1) covers 10 × 17 units. For other images, calculate `pixels / PPU × scale`. Star textures need Full Rect meshes and matching top/bottom edges.

No star texture? For each layer, create an empty parent and arrange about 12 small Circle sprites within X = −4.5…4.5, Y = −5…5. Scale them to 0.03–0.06. Duplicate the whole child pattern at Y +10 and Y −10. This creates a 10-unit repeat; ignore Tiled fields for this grouped-object alternative.

Check the static picture: full coverage, flame behind the ship, distant stars dimmer than near stars. Fix those relationships before running a script.

## Move and wrap by one complete pattern

In `_ShootEmUp/Scripts`, create an Assembly Definition named **ShootEmUp**, Root Namespace ShootEmUp. It groups the folder's scripts into one assembly. Lesson 2 adds its Input System reference. If copying the provided asmdef, do not create another.

Create Scripts/Background/ScrollingLayer.cs. Wait for compilation, then add it to both star layers:

**Assets/_ShootEmUp/Scripts/Background/ScrollingLayer.cs**

```csharp
using UnityEngine;
namespace ShootEmUp.Background
{
    public sealed class ScrollingLayer : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float speed = 1f;
        [SerializeField, Min(0.01f)] private float wrapDistance = 10f;
        private Vector3 startPosition;
        private float distance;
        private void Awake() => startPosition = transform.position;
        private void Update()
        {
            distance = Mathf.Repeat(distance + speed * Time.deltaTime, Mathf.Max(0.01f, wrapDistance));
            transform.position = startPosition + Vector3.down * distance;
        }
    }
}
```

`Awake` records the starting position. `speed × deltaTime` converts units per second into distance for the current frame. Wrapping retains leftover travel while returning the pattern to its original region.

Set Far Speed to 0.6, Near Speed to 1.8, and Wrap Distance to 10. A 1000 px texture at PPU 100 repeats every 10 units. The Circle alternative also repeats at the 10-unit spacing between copies. Other patterns require their own repeat distance.

## Run long enough to cross the seam

Play for 30 seconds. The far layer takes approximately `10 / 0.6 = 16.67` seconds to wrap. A one-second test cannot establish that the seam works.

A jump at every wrap suggests a wrong repeat distance or non-seamless pattern. Gaps during motion suggest insufficient vertical coverage. No movement suggests a missing or disabled script, or inactive Play Mode.

You can now distinguish three responsibilities: the camera selects an area, sorting determines draw order, and a script changes position. Next, input lets the player change the ship's position.

## Source for this stage

[Download all lesson 1 scripts](/downloads/shmup/lesson-01.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #2](/lab/unity-shmup-02-player-movement-en).

