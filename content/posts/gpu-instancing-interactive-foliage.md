---
title: "GPU Instancing for Interactive Foliage in Unity"
date: "2026-03-28"
excerpt: "Building a stylized environment system with GPU-instanced grass, flowers, and trees that react to player movement."
coverImage: "/images/posts/biome-shader-cover.jpg"
category: "shader-breakdown"
tags: ["GPU Instancing", "Compute Shader", "Unity", "HLSL", "Environment Art"]
published: true
featured: false
---

## Why GPU Instancing?

Rendering thousands of grass blades, flowers, and small vegetation objects is a classic game dev challenge. The naive approach — one `GameObject` per blade — will absolutely destroy your frame rate. Even with static batching, you're looking at massive memory overhead.

**GPU Instancing** solves this by sending a single mesh to the GPU along with a buffer of per-instance data (position, scale, color variation). The GPU renders all instances in a single draw call.

## The Instancing Pipeline

Here's the high-level architecture of the Bill Biome Shader system:

1. **Editor Tool** — Paint foliage in-editor using a custom brush
2. **Compute Shader** — Generate instance matrices and store in `ComputeBuffer`
3. **Instanced Shader** — Render all instances with `Graphics.DrawMeshInstancedIndirect`
4. **Interaction System** — Player movement bends nearby grass via a displacement texture

## The Compute Buffer Setup

```csharp
struct GrassInstance {
    public Vector3 position;
    public float rotation;
    public float scale;
    public float colorVariation;
}

void InitializeBuffer(GrassInstance[] instances) {
    int stride = sizeof(float) * 6; // 3 + 1 + 1 + 1
    instanceBuffer = new ComputeBuffer(instances.Length, stride);
    instanceBuffer.SetData(instances);

    argsBuffer = new ComputeBuffer(1, sizeof(uint) * 5, ComputeBufferType.IndirectArguments);
    uint[] args = new uint[] {
        grassMesh.GetIndexCount(0),
        (uint)instances.Length,
        0, 0, 0
    };
    argsBuffer.SetData(args);
}
```

## The Instanced Vertex Shader

```hlsl
StructuredBuffer<float4x4> _InstanceBuffer;

v2f vert(appdata v, uint instanceID : SV_InstanceID) {
    float4x4 mat = _InstanceBuffer[instanceID];
    float3 worldPos = mul(mat, float4(v.vertex.xyz, 1.0)).xyz;

    // Wind animation
    float windPhase = _Time.y * _WindSpeed + worldPos.x * 0.5 + worldPos.z * 0.3;
    float windStrength = sin(windPhase) * _WindIntensity;
    worldPos.x += windStrength * v.vertex.y; // Only bend top vertices

    // Player interaction displacement
    float2 dispUV = (worldPos.xz - _PlayerPos.xz) / _DisplacementRadius + 0.5;
    float displacement = tex2Dlod(_DisplacementTex, float4(dispUV, 0, 0)).r;
    worldPos.xz += normalize(worldPos.xz - _PlayerPos.xz) * displacement * v.vertex.y;

    o.vertex = TransformWorldToHClip(worldPos);
    return o;
}
```

The key trick: `v.vertex.y` acts as a **weight mask**. Vertices at the base (`y=0`) don't move, while vertices at the tip (`y=1`) get full displacement. This creates natural-looking bending.

## Interactive Displacement

The player interaction uses a **render texture** that captures a top-down view of the player's movement trail:

```csharp
void UpdateDisplacement() {
    Vector2 playerUV = new Vector2(
        (player.position.x - center.x) / radius + 0.5f,
        (player.position.z - center.z) / radius + 0.5f
    );

    displacementMaterial.SetVector("_BrushPos", playerUV);
    displacementMaterial.SetFloat("_BrushStrength", moveSpeed * 0.1f);

    Graphics.Blit(displacementRT, tempRT, displacementMaterial);
    Graphics.Blit(tempRT, displacementRT, fadeMaterial); // Gradual fade
}
```

This creates a trail effect where grass bends as you walk through it and slowly recovers.

## Performance Numbers

On a mid-range GPU (RTX 3060):

- **50,000 grass instances**: 0.3ms GPU time
- **100,000 grass instances**: 0.6ms GPU time
- **Displacement texture update**: 0.05ms

Compare this to naive `GameObject` approach: 50,000 objects would take 15ms+ just for culling.

## The Editor Painting Tool

I built a custom Editor tool that lets you paint foliage directly in the Scene view:

- **Left Click** — Paint instances at brush position
- **Shift + Click** — Erase instances
- **Scroll Wheel** — Adjust brush size
- **Ctrl + Scroll** — Adjust density

The painted data is serialized as a `ScriptableObject` and loaded at runtime into the compute buffer.

Check out the full source at [Bill Biome Shader](https://github.com/billtruong003/Bill-Biome-Shader).
