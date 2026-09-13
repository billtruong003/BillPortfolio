---
title: "Shmup #11: From project to playable link — build and publish for the Web"
date: "2026-09-24"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-11-build-webgl
series: "shmup"
order: 11
excerpt: "Pass Editor, local-build, and hosting checks; understand output files, compression, and measurements before sharing the game."
coverImage: "/images/posts/unity-shmup/11/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Completed project</span><span>Web build</span><span>Local HTTP</span><span>Hosting</span><span>Another player</span></div>

## First gate: finish a complete run in the Editor

Lesson 10 produced the final SEU_10_Juice scene. Build that scene; a separate lesson 11 scene is unnecessary. Save the scene and assets before proceeding.

Play from zero score through Game Over and Restart. Verify controls, audio, and pickups without red errors. Record the Unity and package versions. An Editor bug becomes harder to diagnose after adding browser and server layers.

The game supports keyboard and gamepad. Portrait proportions do not supply touch controls; describe its actual input support when sharing.

## Understand the build's path

Unity turns code and assets into files downloaded over HTTP. `.wasm` contains WebAssembly code, `.data` contains packaged data, and the framework and loader coordinate initialization.

```text
ShootEmUp/
  index.html
  TemplateData/
  Build/
    ShootEmUp.loader.js
    ShootEmUp.framework.js
    ShootEmUp.wasm
    ShootEmUp.data
```

Exact names depend on build settings. Inspect the generated folder and index.html rather than renaming one file while leaving old loader references.

## Build gate: establish a working baseline

Install Web Build Support through Unity Hub. In **File → Build Profiles**, select Web and Switch Platform. Enable **only SEU_10_Juice** in Scene List, not every tutorial scene.

| Setting | Starting choice | Purpose |
|---|---|---|
| Product Name | ShootEmUp | Product identity |
| Default Canvas | 540 × 960 | 9:16 frame |
| Compression Format | Disabled for the first release check | Reduce server-configuration variables |
| Data Caching | Enabled | Allow caching where supported |
| Managed Stripping | Keep initial default | Establish correctness before increasing it |
| Exceptions | Retain diagnostic support | Read runtime failures |
| Development Build | On for diagnosis, off for release measurement | Separate the two tasks |

Build into `Builds/WebGL/ShootEmUp`, outside Assets. Do not move individual files while the build is running. Development and Release builds differ; label which one you measure.

Run In Background does not guarantee steady execution in a background browser tab. Browsers may throttle it, so do not promise precise continued gameplay while the tab is hidden.

## Local gate: use HTTP rather than opening a file

With Node.js available, run from the project directory:

```bash
npx serve Builds/WebGL/ShootEmUp
```

Open the local address printed by the server. Opening index.html through file:// is not equivalent to hosting and can fail when fetching WebAssembly or assets.

Inspect DevTools → Network and Console. Loader, framework, wasm, and data must load correctly, not receive an HTML error page disguised by status 200. Click the canvas and test input. Audio may require a click or tap because of [browser autoplay restrictions described by Unity](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-audio.html).

Test first load and reload, all four movement edges, pickups, Game Over, and Restart. A loading bar reaching 100% is not a complete test.

## Hosting gate: preserve the folder and verify its URL

Upload the whole build directory to your static host, preserving relative paths. Test its index.html URL directly before embedding it in a separate page. Use HTTPS for sharing.

An uncompressed baseline confirms paths and structure. Enabling gzip or Brotli in a release build requires matching server headers; changing extensions alone is insufficient:

| File form | Content-Encoding | Important Content-Type |
|---|---|---|
| Uncompressed .wasm | Do not incorrectly set gzip/br | application/wasm |
| .wasm.gz | gzip | application/wasm |
| .wasm.br | br | application/wasm |

Decompression Fallback offers JavaScript decompression when server headers cannot be controlled, with loading tradeoffs. Consult [Unity's Web deployment documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-deploying.html) for your hosting configuration.

When the page and build use different origins, check CORS too. Do not add unrelated headers to fix a simple 404 path error.

## Measure before calling a change an optimization

| Measurement | Record |
|---|---|
| Output size | Total file bytes on disk |
| Transferred data | Network Transfer Size with a cold cache |
| Time to play | URL opened until controls respond |
| Correctness | Repeat the same gameplay checks after each change |

More aggressive stripping may reduce code, but requires retesting initialization and reflection paths. Change one factor at a time: stripping, compression, or textures. The author's build size is not a mandatory target for different artwork and content.

Warm-cache loading may be faster than cold-cache loading. Record browser, device, network, and cache state; a number without conditions cannot support a comparison.

<details><summary>Case study: embedding into this portfolio's Arcade</summary>

This site uses `public/webgl-games/registry.json`. Each entry describes the Build URL, buildName, compression, and aspect ratio. UnityPlayer uses it to construct loader/framework/wasm/data URLs. This is a website-specific integration, not a Unity requirement.

For CDN/R2 hosting, upload first, verify the actual file URLs, then update the registry with their real names. A placeholder path is not an existing endpoint.

</details>

## Before sending the link

Another person should open the URL in a fresh window, understand the controls, and complete a run. Verify complete downloads, audio after interaction, correct framing, clean restarts without duplicate events, and no gameplay errors. State keyboard/gamepad support beside the game.

You have connected a complete chain: scene → input → shooting → pooling → collision → data → waves → session → pickups → feedback → Web. Enemy bullets, drones, or pause can follow, but each extension deserves explicit rules and repeatable checks of its own.

## Source for this stage

[Download all lesson 11 scripts](/downloads/shmup/lesson-11.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.

