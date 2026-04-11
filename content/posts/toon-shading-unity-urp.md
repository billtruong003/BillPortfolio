---
title: "Toon Shading in Unity URP: A Complete Breakdown"
date: "2026-04-10"
excerpt: "How I built a multi-pass toon shader with custom outlines for Shmackle VR, achieving 90 FPS on Meta Quest."
coverImage: "/images/posts/toon-shader-cover.jpg"
category: "shader-breakdown"
tags: ["HLSL", "Unity", "URP", "Toon Shading", "VR"]
published: true
featured: true
---

## The Problem

When I joined the Shmackle VR project at Curly Blue, the game was using basic **Unlit shaders** — flat, lifeless visuals that couldn't hold 72 FPS on Meta Quest. The art team wanted a stylized toon look, but every off-the-shelf solution either killed performance or didn't support VR single-pass instanced rendering.

So I built one from scratch.

## Architecture Overview

The toon shading system has three main components:

1. **Cel Shading** — Quantized diffuse lighting with configurable bands
2. **Outline Pass** — Screen-space edge detection using depth/normal buffers
3. **Rim Lighting** — Fresnel-based rim for depth separation

## The Cel Shader

The core idea is simple: instead of smooth lighting gradients, we quantize the `NdotL` value into discrete bands.

```hlsl
half3 CelShading(half3 normal, half3 lightDir, half3 lightColor, int bands) {
    half NdotL = dot(normal, lightDir);
    half quantized = floor(NdotL * bands) / bands;
    quantized = max(quantized, 0.1); // ambient floor
    return lightColor * quantized;
}
```

The key insight for VR performance: we compute this **per-vertex** instead of per-pixel for distant objects. The LOD system switches between vertex and fragment cel shading based on distance from the camera.

## Outline Implementation

For outlines, I used a **screen-space approach** via a custom URP Render Feature:

```csharp
public class OutlineRenderFeature : ScriptableRendererFeature {
    OutlinePass outlinePass;

    public override void Create() {
        outlinePass = new OutlinePass(RenderPassEvent.BeforeRenderingPostProcessing);
    }

    public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData data) {
        renderer.EnqueuePass(outlinePass);
    }
}
```

The outline shader samples the depth and normal buffers, applying a **Sobel filter** to detect edges:

```hlsl
float SobelDepth(float2 uv, float2 texelSize) {
    float d00 = SampleDepth(uv + float2(-1, -1) * texelSize);
    float d10 = SampleDepth(uv + float2( 0, -1) * texelSize);
    float d20 = SampleDepth(uv + float2( 1, -1) * texelSize);
    float d01 = SampleDepth(uv + float2(-1,  0) * texelSize);
    float d21 = SampleDepth(uv + float2( 1,  0) * texelSize);
    float d02 = SampleDepth(uv + float2(-1,  1) * texelSize);
    float d12 = SampleDepth(uv + float2( 0,  1) * texelSize);
    float d22 = SampleDepth(uv + float2( 1,  1) * texelSize);

    float gx = d00 + 2.0 * d01 + d02 - d20 - 2.0 * d21 - d22;
    float gy = d00 + 2.0 * d10 + d20 - d02 - 2.0 * d12 - d22;

    return sqrt(gx * gx + gy * gy);
}
```

## Performance Results

| Metric | Before | After |
|--------|--------|-------|
| FPS (Quest 2) | ~70 unstable | 90 locked |
| Draw Calls | 340+ | 180 |
| Shader Variants | 12 | 4 |
| Visual Quality | Flat Unlit | Stylized Toon |

The secret was aggressive **shader variant stripping** and using `#pragma multi_compile` only for the features we actually needed in VR.

## Lessons Learned

- Always profile on-device, not in the editor. Quest GPU behaves very differently from desktop.
- Screen-space outlines are cheaper than geometry-based for VR because they only run once per eye with single-pass instanced.
- Rim lighting is essentially free on mobile GPUs since the Fresnel term uses `dot(viewDir, normal)` which is already computed.

The full shader source is available in my [Bill SSOutline](https://github.com/billtruong003/Bill-SSOutline) repository.
