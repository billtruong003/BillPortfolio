---
title: "Shmup #2: From a button press to the ship's position"
date: "2026-09-15"
updated: "2026-09-19"
lang: en
translationKey: unity-shmup-02-player-movement
series: "shmup"
order: 2
excerpt: "Trace input through an Action, a Vector2, and a Rigidbody2D, then calculate camera bounds to keep the ship visible."
coverImage: "/images/posts/unity-shmup/02/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Device</span><span>Binding</span><span>Move Action</span><span>Vector2</span><span>New position</span></div>

## Four stages between a key press and a position

Press D and the ship moves right. It sounds obvious, but between your key press and the ship's new position the data passes through four stages. Input System exists so you never write two versions of the same code for keyboard and gamepad.

The chain works like this. The keyboard reports that D is held. A binding maps that key to the intent `Move`. The `Move` action merges every binding and returns a `Vector2` of (1, 0). Code multiplies that vector by speed and time to get a new position. Because the Action sits in the middle, the code never needs to know whether you are pressing D or pushing a stick.

Start from the lesson 1 scene and save it as `SEU_02_PlayerMove`. By the end: WASD, the arrow keys, or a stick all fly the ship, and the ship stops at the frame edge instead of leaving the screen.

## Create Move

In `_ShootEmUp/Input`, choose Create → Input Actions and name it **ShmupControls**. Open the asset, create an Action Map named **Gameplay**, then add an Action named **Move** with Action Type **Value** and Control Type **Vector2**.

Add an Up/Down/Left/Right Composite for WASD, leaving it on **Digital Normalized**. Add a second composite for the arrow keys, plus a `<Gamepad>/leftStick` binding. Press Save Asset.

![The map, action, and binding columns in the Input Actions editor](/images/posts/unity-shmup/02/move_01_input-actions-editor.webp)

`Fire` is not created here — it belongs to lesson 3. Control Schemes are not needed either, since this lesson reads the Action directly rather than grouping by device.

Digital Normalized deserves attention. It normalises the vector to length 1, so holding W and D together does not make the ship faster than moving straight. Without normalisation the diagonal has length `√2 ≈ 1.41`, which is 41% faster, and players will find that exploit on their own.

## The asmdef needs an Input System reference

Select `ShootEmUp.asmdef` in the Project window, find **Assembly Definition References**, press `+`, add **Unity.InputSystem**, then Apply.

![Unity.InputSystem listed in the ShootEmUp.asmdef references](/images/posts/unity-shmup/02/move_02_asmdef-inspector.webp)

Small step, but skipping it stops you dead. The package is installed, yet the assembly does not reference it, so the code still cannot see the namespace and the Console only says `namespace UnityEngine.InputSystem could not be found`. That message reads like a missing package, so the usual reaction is to go reinstall it. When you hit this error, check the reference here first.

## Read input every frame, move the body every physics step

Create the complete file before attaching anything. The script does three things: read input, compute the next position, and clamp that position inside the camera bounds.

**Assets/_ShootEmUp/Scripts/Player/PlayerMovement.cs**

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class PlayerMovement : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Move action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("World units per second at full stick / key press.")]
        [SerializeField] private float speed = 8f;

        [Tooltip("Keep this much distance (world units) between the ship pivot and the screen edge.")]
        [SerializeField] private Vector2 edgePadding = new Vector2(1.2f, 1f);

        private Rigidbody2D body;
        private InputAction moveAction;
        private Vector2 moveInput;
        private Vector2 minBounds;
        private Vector2 maxBounds;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            moveAction = controls.FindAction("Gameplay/Move", throwIfNotFound: true);
            CacheCameraBounds();
        }

        private void OnEnable()
        {
            moveAction.Enable();
        }

        private void OnDisable()
        {
            moveAction.Disable();
        }

        private void Update()
        {
            moveInput = moveAction.ReadValue<Vector2>();
        }

        private void FixedUpdate()
        {
            CacheCameraBounds();
            var target = body.position + moveInput * (speed * Time.fixedDeltaTime);
            target.x = Mathf.Clamp(target.x, minBounds.x, maxBounds.x);
            target.y = Mathf.Clamp(target.y, minBounds.y, maxBounds.y);
            body.MovePosition(target);
        }

        private void CacheCameraBounds()
        {
            var cam = Camera.main;
            var halfHeight = cam.orthographicSize;
            var halfWidth = halfHeight * cam.aspect;
            var center = (Vector2)cam.transform.position;

            minBounds = center - new Vector2(halfWidth, halfHeight) + edgePadding;
            maxBounds = center + new Vector2(halfWidth, halfHeight) - edgePadding;
        }
    }
}
```

The detail that matters most is that input is read in `Update` while the Rigidbody only moves in `FixedUpdate`, and those two run on different clocks. `Update` runs once per rendered frame; `FixedUpdate` runs on a fixed physics step. At 144 fps some frames carry no physics step at all, and at 30 fps a single frame can carry several.

That is why `moveInput` is stored between the two. Read input directly inside `FixedUpdate` and a very quick tap landing between two physics steps is never sampled and disappears entirely. Call `MovePosition` inside `Update` instead and the Rigidbody moves in the middle of a physics step, which makes lesson 5's collisions resolve incorrectly.

`Move` survives across the two clocks because it is a held state. One-shot actions like `Fire` need a different read, which lesson 3 uses.

## The hull's bounds are not the pivot's bounds

The lesson 1 camera has a half-width of 4.5 and a half-height of 8. Let the ship's pivot reach X = 4.5 and half the hull is already off screen. The valid bounds must be the camera bounds minus half the ship's size.

For a ship 2.4 wide and 2 tall, Edge Padding (1.2, 1) yields a valid region of X −3.3 to 3.3 and Y −7 to 7. The two `Mathf.Clamp` lines keep the pivot inside that. For a different sprite or scale, measure half its rendered size and use that.

`CacheCameraBounds` runs every physics step rather than once, so the bounds stay correct if the frame aspect changes mid-session. It assumes an orthographic camera that never rotates. Lesson 10 adds camera shake, but shakes a child object so gameplay coordinates still resolve against a steady frame.

## Wire the reference

Select `Player` and Add Component `PlayerMovement`. Because the script carries `[RequireComponent(typeof(Rigidbody2D))]`, Unity adds a Rigidbody 2D for you. Set **Body Type = Kinematic** and **Interpolate = Interpolate**.

Kinematic means position is decided by code rather than gravity, which is exactly what we want here. Leave it Dynamic and the ship falls the moment you press Play. Interpolate smooths the rendered position between physics steps, so the ship does not judder at high frame rates.

The Inspector now shows a `Controls` field reading None:

![PlayerMovement with the Controls field unwired](/images/posts/unity-shmup/02/move_03_player-inspector-before-wire.webp)

Drag the **`ShmupControls` asset from the Project window** into it. This is an asset living in Project, unlike lesson 3 where you will drag a scene object into the `Muzzle` field. Wired correctly, None becomes the asset name:

![PlayerMovement after wiring Controls](/images/posts/unity-shmup/02/move_04_player-inspector-after-wire.webp)

Set Speed to 8 and Edge Padding to match your ship.

## Check each Vector2 value

Press Play, click once inside Game view, and work through the list. The middle column is what the Action returns, which you compare against what the ship does:

| Input | Expected Vector2 | What the ship should do |
|---|---|---|
| Nothing held | (0, 0) | Stay still |
| D | (1, 0) | Move right |
| W | (0, 1) | Move up |
| W + D | Diagonal of length 1 | Move diagonally, no faster than straight |
| Stick tilted slightly | Vector shorter than 1 | Move slower than a full tilt |
| Pushed into all four edges | Stopped by `Clamp` | Halt without poking outside |

![The ship moving inside the frame](/images/posts/unity-shmup/02/move_05_movement.webp)

Releasing the key must stop the ship immediately, because `ReadValue` returns (0, 0).

## The ship will not move

Four causes, checked in this order because they sit at four different levels:

1. **Game view does not have focus.** Without it, Input System sends keystrokes to the Editor rather than the game. This is both the most common cause and the easiest fix.
2. **The bindings were never saved.** The Input Actions editor does not autosave; unsaved bindings exist only in that window.
3. **The Controls field is still None.** The script is searching an empty asset for an Action.
4. **The Action name is wrong.** `FindAction("Gameplay/Move")` is case sensitive and must match both the map name and the action name.

If the Console complains about the input backend, check **Project Settings → Player → Active Input Handling**:

![Active Input Handling in Player Settings](/images/posts/unity-shmup/02/move_06_input-system-settings.webp)

If the ship moves but gets clipped at the edges, that is a completely different problem: Edge Padding does not match the sprite size. Two symptoms at two different levels, so do not try to fix them with the same setting.

You can change Speed during Play Mode to experiment, but re-enter it after stopping, because Unity reverts the value.

The chain from input to movement is complete. The next lesson uses a new Action to create objects rather than move them.

## Source for this stage

[Download the lesson 2 scripts](/downloads/shmup/lesson-02.zip) — code and assembly definitions only, no scenes, prefabs, or the pictured artwork. When upgrading from an earlier lesson, overwrite files at the same paths.

Next: [Shmup #3](/lab/unity-shmup-03-shooting-en).
