---
title: "Shmup #10: Designing feedback — hear and see each event"
date: "2026-09-23"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-10-audio-juice
series: "shmup"
order: 10
excerpt: "Map gameplay events to sound, sprite flashes, particles, and camera shake, finishing each response before combining them."
coverImage: "/images/posts/unity-shmup/10/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>LOGIC ONLY</strong><p>HP decreases, enemies disappear, score increases.</p></div><div><strong>WITH FEEDBACK</strong><p>Hear shots, see hits, recognize kills, and distinguish player damage.</p></div></div>

## Begin with what the player needs to perceive

Start with the completed run and pickup systems, saving `SEU_10_Juice`. This lesson does not change damage, probabilities, or firing rates to improve feel. It makes the existing rules' outcomes readable.

| Event | Sound | Visual | Camera |
|---|---|---|---|
| Fired | Quiet laser | Existing bullet | None |
| Enemy.Damaged | Optional | Short flash | None |
| Enemy.Killed | Explosion | Burst at death position | Light shake |
| Player.Damaged | Distinct hit | Ship flash | Stronger shake |
| Collected | Pickup | Shield when applicable | None |
| GameOver | End cue | Existing panel | No additional shake |

Gameplay should not directly invoke audio, particles, and the camera for each kill. It announces events; listeners translate them into feedback. Disabling a listener should remove its effect without breaking the rules.

## Sound stage: finish one shot first

Use short clips you own or [Kenney Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds). Choose five clips and give them recognizable roles: Laser, Explosion, Hit, Pickup, and GameOver under Audio/SFX. These are roles, not required filenames.

Replace PlayerShooting and PlayerPowerups with lesson 10's versions, exposing Fired and Collected. Health already has a dedicated Damaged event from lesson 5, so healing is not mistaken for a hit.

Create the complete GameSfx file:

**Assets/_ShootEmUp/Scripts/Audio/GameSfx.cs**

```csharp
using ShootEmUp.Combat;
using ShootEmUp.Core;
using ShootEmUp.Enemies;
using ShootEmUp.FX;
using ShootEmUp.Player;
using UnityEngine;

namespace ShootEmUp.Audio
{
    [RequireComponent(typeof(AudioSource))]
    public sealed class GameSfx : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private PlayerShooting playerShooting;
        [SerializeField] private PlayerPowerups playerPowerups;
        [SerializeField] private Health playerHealth;
        [SerializeField] private GameSession session;
        [SerializeField] private CameraShake cameraShake;

        [Header("Clips")]
        [SerializeField] private AudioClip laser;
        [SerializeField] private AudioClip explosion;
        [SerializeField] private AudioClip hit;
        [SerializeField] private AudioClip pickup;
        [SerializeField] private AudioClip gameOver;

        [Header("Mix")]
        [SerializeField, Range(0f, 1f)] private float laserVolume = 0.35f;

        private AudioSource source;

        private void Awake()
        {
            source = GetComponent<AudioSource>();
        }

        private void OnEnable()
        {
            playerShooting.Fired += OnFired;
            playerPowerups.Collected += OnCollected;
            playerHealth.Damaged += OnPlayerHealthChanged;
            session.GameOver += OnGameOver;
            Enemy.Killed += OnEnemyKilled;
        }

        private void OnDisable()
        {
            playerShooting.Fired -= OnFired;
            playerPowerups.Collected -= OnCollected;
            playerHealth.Damaged -= OnPlayerHealthChanged;
            session.GameOver -= OnGameOver;
            Enemy.Killed -= OnEnemyKilled;
        }

        private void OnFired() => source.PlayOneShot(laser, laserVolume);
        private void OnCollected(Data.PickupData _) => source.PlayOneShot(pickup);
        private void OnGameOver() => source.PlayOneShot(gameOver);

        private void OnEnemyKilled(Enemy _)
        {
            source.PlayOneShot(explosion, 0.8f);
            if (cameraShake != null) cameraShake.Shake(0.12f, 0.15f);
        }

        private void OnPlayerHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            source.PlayOneShot(hit);
            if (cameraShake != null) cameraShake.Shake();
        }
    }
}
```

Awake caches AudioSource; OnEnable subscribes and OnDisable removes each subscription. PlayOneShot lets short clips overlap. Keep the laser quieter than the player hit so sustained firing does not mask damage feedback.

Create a GameSfx object with AudioSource **Play On Awake off** and **Spatial Blend = 0**. Assign the five event sources and five clips. Camera Shake can remain empty during audio testing. Keep exactly one active AudioListener, normally on Main Camera.

Test firing, collection, taking damage, kills, and Game Over. Resolve duplicated playback before adding visuals.

## Flash stage: control one sprite's color

A flash changes RGB briefly while preserving the sprite's alpha. The shader exposes `_FlashAmount`: zero is normal, one is the flash color. **HitFlash** listens to Damaged and changes that property on its renderer.

Create `Art/Shaders/SpriteFlash.shader` from the complete source below. It is a minimal unlit shader for this series' URP renderer configuration, not a replacement for every SpriteRenderer feature.

<details><summary>Complete shader — expand when creating the file</summary>

**Assets/_ShootEmUp/Art/Shaders/SpriteFlash.shader**

```hlsl
// Sprite shader for URP 2D: same as Sprite-Unlit, plus a _FlashAmount that blends the sprite towards _FlashColor.
// Driven per-instance from HitFlash.cs through a MaterialPropertyBlock, so every enemy shares one material.
Shader "ShootEmUp/SpriteFlash"
{
    Properties
    {
        [MainTexture] _MainTex ("Sprite Texture", 2D) = "white" {}
        [MainColor] _Color ("Tint", Color) = (1,1,1,1)
        _FlashColor ("Flash Color", Color) = (1,1,1,1)
        _FlashAmount ("Flash Amount", Range(0, 1)) = 0
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline"="UniversalPipeline" "IgnoreProjector"="True" "PreviewType"="Plane" }
        Cull Off
        Lighting Off
        ZWrite Off
        Blend One OneMinusSrcAlpha

        Pass
        {
            Name "Unlit"
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float3 positionOS : POSITION;
                float4 color      : COLOR;
                float2 uv         : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float4 color      : COLOR;
                float2 uv         : TEXCOORD0;
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST;
                half4 _Color;
                half4 _FlashColor;
                half  _FlashAmount;
            CBUFFER_END

            Varyings vert(Attributes v)
            {
                Varyings o;
                o.positionCS = TransformObjectToHClip(v.positionOS);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                o.color = v.color * _Color;
                return o;
            }

            half4 frag(Varyings i) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv) * i.color;
                // lerp towards the flash colour but keep the sprite's alpha so the silhouette stays
                tex.rgb = lerp(tex.rgb, _FlashColor.rgb, _FlashAmount);
                tex.rgb *= tex.a; // premultiplied alpha, matches Blend One OneMinusSrcAlpha
                return tex;
            }
            ENDHLSL
        }
    }
    Fallback "Universal Render Pipeline/2D/Sprite-Unlit-Default"
}
```

</details>

The fragment blends straight color, then multiplies alpha **once** before Blend One OneMinusSrcAlpha. Multiplying both the flash color and final result would darken partially transparent edges incorrectly.

Create **Mat_SpriteFlash**, choose ShootEmUp/SpriteFlash, and set Flash Amount 0. Assign it to Player and the enemy prefab. Create HitFlash and attach it to both:

**Assets/_ShootEmUp/Scripts/FX/HitFlash.cs**

```csharp
using System.Collections;
using ShootEmUp.Combat;
using UnityEngine;

namespace ShootEmUp.FX
{
    [RequireComponent(typeof(SpriteRenderer), typeof(Health))]
    public sealed class HitFlash : MonoBehaviour
    {
        private static readonly int FlashAmount = Shader.PropertyToID("_FlashAmount");

        [SerializeField, Min(0.01f)] private float duration = 0.08f;

        private SpriteRenderer spriteRenderer;
        private Health health;
        private MaterialPropertyBlock block;
        private Coroutine routine;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            health = GetComponent<Health>();
            block = new MaterialPropertyBlock();
            health.Damaged += OnHealthChanged;
        }

        private void OnDestroy()
        {
            health.Damaged -= OnHealthChanged;
        }

        private void OnEnable()
        {
            SetFlash(0f);
        }

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            routine = null;
            SetFlash(0f);
        }

        private void OnHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Flash());
        }

        private IEnumerator Flash()
        {
            SetFlash(1f);
            yield return new WaitForSeconds(duration);
            SetFlash(0f);
            routine = null;
        }

        private void SetFlash(float amount)
        {
            spriteRenderer.GetPropertyBlock(block);
            block.SetFloat(FlashAmount, amount);
            spriteRenderer.SetPropertyBlock(block);
        }
    }
}
```

MaterialPropertyBlock assigns a value per renderer without editing the shared material. It is not a batching guarantee; inspect the render path and SRP Batcher compatibility in Frame Debugger when optimizing.

Test a 2 HP enemy: the first hit leaves it alive long enough to see the flash. The fatal hit removes it immediately, so the explosion communicates the kill. A shielded player receives no Damaged event when damage is blocked.

## Explosion stage: preview before pooling

Create **FX_Explosion** and add ParticleSystem:

| Module | Starting configuration |
|---|---|
| Main | Duration 0.5, Looping off, Play On Awake off |
| Main | Lifetime 0.35–0.7, Speed 2.5–6, Size 0.25–0.55 |
| Main | Simulation Space World, Stop Action Callback |
| Emission | Rate 0, Burst at 0, Count 22 |
| Shape | Circle, Radius 0.15 |
| Size over Lifetime | Decrease from 1 to 0 |
| Color over Lifetime | Yellow/orange, alpha fading to 0 |
| Renderer | Sorting FX, transparent unlit particle material |

A material using **Universal Render Pipeline/Particles/Unlit**, Surface Type Transparent, and a soft particle texture works as a starting point. Preview it first: gameplay code cannot fix an invisible material.

Add PooledObject and PooledParticle, then save the prefab:

**Assets/_ShootEmUp/Scripts/FX/PooledParticle.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.FX
{
    [RequireComponent(typeof(ParticleSystem), typeof(PooledObject))]
    public sealed class PooledParticle : MonoBehaviour
    {
        private ParticleSystem system;
        private PooledObject pooled;

        private void Awake()
        {
            system = GetComponent<ParticleSystem>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            system.Play(true);
        }

        private void OnParticleSystemStopped()
        {
            pooled.Release();
        }
    }
}
```

Create ExplosionPool with FX_Explosion, Prewarm 8, Max Size 30. Add ExplosionOnKill to a scene object and assign the pool. Its complete file is in the ZIP. It supplies position and scale to Get before activation, preventing the initial burst from using a previous location.

Returning requires Stop Action = Callback. Confirm an explosion becomes inactive when finished and can play again on another kill. Retained old particles indicate a reset/clear problem.

## Shake stage: keep gameplay bounds stable

Shaking the camera position read by ScreenBounds could also shake spawn and movement limits. Create **CameraRig** at (0,0,0), parent Main Camera beneath it, and set camera local position (0,0,−10). Keep orthographic Size 8 and local rotation 0.

Lesson 10's PlayerMovement and ScreenBounds read gameplay center from CameraRig when a parent exists. Replace both files from the ZIP. Do not use an unrelated offset parent with this convention.

Attach CameraShake to **Main Camera**, not the rig:

**Assets/_ShootEmUp/Scripts/FX/CameraShake.cs**

```csharp
using System.Collections;
using UnityEngine;

namespace ShootEmUp.FX
{
    public sealed class CameraShake : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float defaultStrength = 0.25f;
        [SerializeField, Min(0.01f)] private float defaultDuration = 0.2f;

        private Vector3 restPosition;
        private Coroutine routine;

        private void OnEnable()
        {
            restPosition = transform.localPosition;
        }

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            transform.localPosition = restPosition;
        }

        public void Shake() => Shake(defaultStrength, defaultDuration);

        public void Shake(float strength, float duration)
        {
            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Run(strength, duration));
        }

        private IEnumerator Run(float strength, float duration)
        {
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                var falloff = 1f - elapsed / duration;
                transform.localPosition = restPosition + (Vector3)(Random.insideUnitCircle * (strength * falloff));
                yield return null;
            }
            transform.localPosition = restPosition;
            routine = null;
        }
    }
}
```

Assign it to GameSfx. Kills use light shaking; player hits use the defaults. A new request replaces the current shake in this version. Disabling it must restore the resting position.

## Combine effects and exercise reuse

Play a sequence: rapid fire, several close kills, a blocked shield hit, shield expiry, player damage, Game Over, then Restart. Healing must not play a hit sound. A reused enemy must not flash merely because its new type has fewer HP. Explosions belong at the death position. Camera shake returns to rest without moving player boundaries.

Feedback now follows explicit events. Shaders and particles provide presentation; the run must still behave correctly with GameSfx, HitFlash, and ExplosionOnKill disabled.

## Source for this stage

[Download all lesson 10 scripts](/downloads/shmup/lesson-10.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #11](/lab/unity-shmup-11-build-webgl-en).

