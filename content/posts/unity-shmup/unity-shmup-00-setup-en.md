---
title: "Shmup #0: The starting map — prepare a project you can finish"
date: "2026-09-13"
updated: "2026-09-19"
lang: en
translationKey: unity-shmup-00-setup
series: "shmup"
order: 0
excerpt: "Understand the destination, prepare the tools and artwork, and establish reliable lesson checkpoints before writing code."
coverImage: "/images/posts/unity-shmup/00/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-map"><strong>DESTINATION</strong><p>A vertical shooter: fly a ship, shoot enemies, survive waves, collect drops, and play again after losing all health.</p><ol><li>#0–#3 · Screen and controls</li><li>#4–#7 · Object lifetime, collision, data, and waves</li><li>#8–#11 · Runs, pickups, feedback, and the Web build</li></ol></div>

## Build the shelves before building the game

Every Unity project starts tidy and turns into a mess around lesson four. This lesson writes no code at all. It just sets up a place for each kind of asset to live, including the `_Common` folder that will look pointless until lesson 4 explains why it exists.

A shoot 'em up looks like many systems running at once. The way I break it apart is by asking one question at a time: what does the camera see, how does a key press become movement, how long does a bullet live, who owns the score. Each lesson answers one of those and leaves behind one behavior you can observe.

The approach across the whole series fits in a line I keep coming back to: **make it exist first, you can make it good later.** Lesson 3 deliberately fires bullets with `Instantiate` and `Destroy` even though that is wasteful, so lesson 4 has something concrete to fix. Seeing the problem in your own Hierarchy sticks better than reading advice about avoiding it.

> **About this series**
>
> You need C# basics first: variables, conditionals, loops, methods, and classes. If that is new, read the [C# series](/lab/series/csharp) first. Events and coroutines get explained where they are used.
>
> Screenshots come from my reference project, so a few Inspectors may show an earlier build. Where a screenshot disagrees with a configuration table in the text, the table wins.
>
> Each lesson ships a script package, not a prebuilt scene or prefab. The game takes keyboard and gamepad input; a 9:16 frame does not imply touch controls.

## One consistent toolchain

The reference project runs **Unity 6000.3.10f1**, **URP 17.3.0**, and **Input System 1.18.0**. Other Unity 6 builds may arrange the interface slightly differently, but every step here is findable.

In Unity Hub, add the **Web Build Support** module if you plan to publish to the Web in lesson 11. Then create a **Universal 3D** project named `ShmupLab`.

A 3D template makes 2D games perfectly well, because we use unlit sprites and an orthographic camera. I chose it so later 3D and shader series can share one project, and so the default renderer matches the shader in lesson 10.

Open **Window → Package Manager** and install the **2D** feature set plus **Input System** if they are missing. Unity will ask to restart in order to switch the input backend — say yes. Afterwards check that **Project Settings → Player → Active Input Handling** reads Input System. No third-party packages are needed anywhere in the series.

## Prepare artwork by role

Use sprites you already have, or grab the [Kenney Space Shooter Extension](https://kenney.nl/assets/space-shooter-extension). Filenames in that pack differ from my screenshots, so pick by role instead of hunting for a matching filename.

| Role | What you need | Name to remember |
|---|---|---|
| Player | Ship pointing up | Player |
| Projectile | Small shape, tall on Y | Laser |
| Enemies | Two distinguishable shapes | InsectBasic, InsectFast |
| Asteroids | Small, medium, large | Asteroid |
| Pickups | Three icons | Life, Shield, Rapid |
| Background | Base colour and a tiling star pattern | Background, Stars |

Different sprite sizes are fine, because every measurement in the series is derived from pixels, PPU, and world units. If you have no tiling star texture, lesson 1 includes a way to build star layers from sprites inside the Editor.

## A place for each kind of asset

Create these folders through the **Project window**:

```text
Assets/
  _ShootEmUp/
    Art/Sprites/
    Art/Shaders/
    Audio/
    Input/
    Prefabs/
    Scenes/
    ScriptableObjects/
    Scripts/
  _Common/Scripts/
  ThirdParty/
```

`_ShootEmUp` holds this game. `ThirdParty` holds anything downloaded. `_Common` is empty right now and stays empty until lesson 4, where we write an object pool that is not specific to a space shooter and therefore needs somewhere to live outside `_ShootEmUp`. This is how I organise this project, not a Unity rule; a project with exactly one game can keep everything together and still work.

Always move assets using the Project window rather than File Explorer, because Unity needs to move the accompanying `.meta` file too. A meta file holds the GUID, the identifier that scenes and prefabs use to find a sprite, material, or script again. Lose the meta and a working reference turns into Missing.

![The _ShootEmUp and _Common folders in the Project window](/images/posts/unity-shmup/00/setup_02_project-tree.webp)

## Import one sprite before touching the rest

Select the ship sprite in the Project window and look at the Inspector. Set **Texture Type = Sprite (2D and UI)**, **Sprite Mode = Single**, **Pixels Per Unit = 100**, then press Apply.

![Texture Importer: three rows to change before Apply](/images/posts/unity-shmup/00/setup_01_texture-importer.webp)

Single is for files holding one image; a spritesheet needs Multiple and regions cut in the Sprite Editor.

PPU is what connects pixels to in-game size, and it is worth understanding now because the whole series measures in it. An image 200 px wide at PPU 100 with scale 1 becomes exactly 2 world units wide. The camera in the next lesson shows 9 units across, so your freshly imported ship covers roughly two ninths of the screen width. You can estimate that ratio before dragging anything into a scene.

For the background image that will use Tiled draw mode, also set **Mesh Type = Full Rect**. The camera in this series never moves, so mipmaps can be turned off.

Drag the ship into a scene to check it. If nothing appears, look at Sprite Mode, the slice regions, and the camera position. Once it works, delete the test object and keep the sprite asset.

## Checkpoints that actually hold

Copying a scene to a new name does not freeze an earlier lesson, because the old scene still points at the same scripts and prefabs you are about to edit. Returning to the exact state of a lesson requires a snapshot of the whole project.

If you use Git, put the repository next to Assets, Packages, and ProjectSettings, then ignore everything Unity regenerates:

```gitignore
/Library/
/Temp/
/Obj/
/Logs/
/UserSettings/
/Builds/
*.csproj
*.sln
*.slnx
```

Keep every `.meta` file plus the Packages and ProjectSettings folders. In **Project Settings → Editor**, set **Asset Serialization = Force Text** so scene and prefab files produce readable diffs.

After each lesson: stop Play Mode, save, commit, and tag `lesson-XX`. The ZIP files on this site carry the tutorial's source; the tags in your own repository are your checkpoints.

## Ready for lesson 1?

Four signs: the project opens with no red errors in the Console, the ship sprite renders when dropped into a scene, Input System is installed and active, and you know where scenes get saved. Scripts will live in `_ShootEmUp/Scripts`; the assembly definition comes in lesson 1.

Next up we build the screen: what the camera sees, which layer draws over which, and how to scroll a star field with no visible seam.

## Source for this stage

Lesson 0 has no scripts. From lesson 1 onward, each lesson ships a ZIP with code and assembly definitions, but no scenes or prefabs.

Next: [Shmup #1](/lab/unity-shmup-01-scene-2d-en).
