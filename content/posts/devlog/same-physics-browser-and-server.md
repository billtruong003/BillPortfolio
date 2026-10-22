---
title: "One physics engine, two machines: running the same Rapier simulation in the browser and on a Node server"
date: "2026-10-22"
lang: "en"
excerpt: "How Flip-Flop Slam runs one copy of its Rapier physics in the browser and on the server, bit for bit, so the server can check every slam and computer players can try twenty-four slams before choosing one."
coverImage: "/images/lab/flip-flop-slam/cover.webp"
category: "devlog"
tags: ["Rapier", "three.js", "Physics", "Multiplayer", "Node.js", "WebAssembly"]
published: true
featured: false
---

[Flip-Flop Slam](https://play.billthedevstudio.com/slam-cards/) (Dép Lào Tuổi Thơ in Vietnam) is a browser party game for 2 to 4 players. You slam a flip-flop on a table near your card, the gust flips it, and if your card lands face up on a friend's face-down card, you win it. Everything that matters happens inside a physics simulation: where the gust pushes, how the card spins, where it lands.

That raised two problems for a small multiplayer game:

1. **Trust.** The slammer's browser runs the physics and the server relays the result to everyone else. Without a check, a modified client could send "my card landed face up on every other card".
2. **Computer players.** When nobody else is online, bots fill the table. A bot that slams at random either does nothing or knocks its own card off the table. A bot that plays well has to *try* slams before it picks one, and that means running the physics on the server.

Both come down to the same requirement: the server must be able to run the game's physics and get the same answer the browser gets.

## One module, no drawing

The first step was to pull the physics out of the renderer. The browser's `world.js` used to own both the three.js scene and the Rapier world. Now `physics.js` holds only the physics: the cards as Rapier rigid bodies, a slam's impulse and spin, wind, and the "has everything settled?" test. It knows nothing about meshes or the DOM. The browser draws from it; the server imports the very same file.

```js
// RAPIER: the initialised module (loading the .wasm differs between the browser and Node).
export function createPhysics(RAPIER) {
  const world = new RAPIER.World({ x: 0, y: TUNE.gravity, z: 0 });
  world.timestep = TUNE.fixedDt / TUNE.substeps;
  // ...cards, table, slam, step, isSettled
}
```

The only thing passed in is the initialised Rapier module, because that is the one part that loads differently in each place.

## Same engine, different packages

In the browser the game uses `@dimforge/rapier3d`, which Vite bundles together with its WebAssembly file. Node cannot import that package directly, so the server uses `@dimforge/rapier3d-compat`, the same engine with the `.wasm` inlined, loadable without a bundler:

```js
import RAPIER from '@dimforge/rapier3d-compat';
import { createPhysics } from '../src/physics.js';

let loading = null;
export function loadPhysics() {
  loading ??= RAPIER.init().then(() => createPhysics(RAPIER));
  return loading;
}
```

Both packages are pinned to the **exact same version** in `package.json`. A floating version range here is a bug waiting to happen: a patch release of the solver on one side would quietly change every result.

## Matching three.js arithmetic, operation for operation

A slam's result hangs on floating-point numbers, and floating point does not forgive reordering. `a * b + c` and `c + b * a` can differ in the last bit, and after a few hundred physics steps that bit becomes a different landing spot.

The old code did some maths with three.js objects, such as rotating a vector by a card's inverse quaternion. The physics module does the same maths on plain arrays, written to follow three.js's `Vector3.applyQuaternion` **operation for operation**, so the extracted code gives exactly the numbers the original did:

```js
// v turned by the inverse of the unit quaternion: three.js's arithmetic, in the same order
function unrotate([qx, qy, qz, qw], [vx, vy, vz]) {
  const x = -qx, y = -qy, z = -qz;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [vx + qw * tx + y * tz - z * ty, vy + qw * ty + z * tx - x * tz, vz + qw * tz + x * ty - y * tx];
}
```

The rest is discipline:

- a fixed timestep with a fixed number of substeps;
- bodies created in the same order on both sides;
- no `Math.random()` inside the simulation. The random part of a slam, the "hand shake", comes from a seed the server chooses, so both sides draw the same numbers.

## Proving it: recorded slams, replayed on the server

Claims about determinism are cheap, so the project has a fixture. A script plays real slams in a real browser and records, for each one, the starting table, the aim, the seed and every card's final position and rotation. A Node test then replays each slam on the server's physics and compares the results.

On 60 recorded slams, the server's results matched the browser's **bit for bit**. One slam takes about **2.4 ms** of CPU to simulate on the server. The test runs on every change, so an engine upgrade or a "harmless" refactor that breaks the match fails immediately.

## What it bought

**Checking slams.** The server now checks every slam a player streams: speeds within what the slam and gravity allow, only cards the flip-flop hit (or a moving card bumped) moving at all, nothing passing through the table, and the final state matching the last frame everyone watched. Measured against 747 real slams from players, it refused none by mistake.

**Bots that play.** A computer player tries 24 candidate slams in its head, scores each result (cards won, cards lost, cards near the edge), then tries its six best slams three more times with the real hand shake before choosing. That is about 120 ms of CPU per bot turn. Bots stopped knocking their own cards off the table and started winning cards on purpose, while still playing like people (they think for a moment, and sometimes they miss).

## Takeaways

- **Separate physics from rendering first.** Everything else follows from having one module both sides can import.
- **Pin the engine version, everywhere.**
- **Copy the exact arithmetic** when you move maths out of a library, not just the formula.
- **Make determinism a test, not a belief.** Record from the real client, replay on the server, compare every bit.

You can play the result at [play.billthedevstudio.com/slam-cards](https://play.billthedevstudio.com/slam-cards/). The game is made by [Bill The Dev](https://billthedevstudio.com/), my one-man studio in Ho Chi Minh City.
