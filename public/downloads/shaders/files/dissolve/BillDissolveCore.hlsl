#ifndef BILL_DISSOLVE_CORE_INCLUDED
#define BILL_DISSOLVE_CORE_INCLUDED

// Every pass of the dissolve shader (color, outline, shadow, depth) calls the same functions
// here, on the same undeformed object-space position. If one pass disagreed, the shadow or
// the outline would keep the shape of an object that is already gone.
//
// Dissolve time t(p) in 0..1 says when a point disappears: the point is cut once the
// threshold driven by _DissolveAmount passes it.

// Object space measured in meters: the pattern sticks to the object when it moves or rotates,
// and _NoiseScale means the same thing on a 10 cm prop and a 3 m character.
float3 DissolveSpace(float3 positionOS)
{
    float3 scale = float3(length(UNITY_MATRIX_M._m00_m10_m20),
                          length(UNITY_MATRIX_M._m01_m11_m21),
                          length(UNITY_MATRIX_M._m02_m12_m22));
    return positionOS * scale;
}

// Explicit mip level: the vertex stage has no derivatives to pick one. Pixels read mip 0 for
// a sharp cut. Vertex motion reads a blurrier mip (_VertexNoiseMip): vertices a few
// centimeters apart cannot show detail finer than that, and full-detail noise turns every
// pushed surface into spikes.
half SampleDissolveNoise(float2 uv, half mip)
{
    return SAMPLE_TEXTURE2D_LOD(_NoiseMap, sampler_NoiseMap, uv, mip).r;
}

half SampleDissolveNoise(float2 uv)
{
    return SampleDissolveNoise(uv, 0);
}

// Triplanar: three planar projections blended by the normal, so no UV seam can show.
half DissolveNoise(float3 positionMeters, half3 normalOS, half mip)
{
    float3 p = positionMeters * _NoiseScale;
    half3 weights = pow(abs(normalOS), 4.0h);
    weights /= max(weights.x + weights.y + weights.z, 1e-4h);
    half noise = SampleDissolveNoise(p.zy, mip) * weights.x
               + SampleDissolveNoise(p.xz, mip) * weights.y
               + SampleDissolveNoise(p.xy, mip) * weights.z;
    // Most noise tiles never reach pure black or white. Stretch the range the tile really
    // uses to 0..1, or the start and the end of the Amount slider do nothing.
    return saturate((noise - _NoiseRemap.x) / max(_NoiseRemap.y - _NoiseRemap.x, 1e-4h));
}

half DissolveNoise(float3 positionMeters, half3 normalOS)
{
    return DissolveNoise(positionMeters, normalOS, 0);
}

// 0..1 gradient of the chosen shape. Mixing it with noise by lerp keeps t inside 0..1,
// so _DissolveAmount 0..1 always runs the whole effect from untouched to gone.
half DissolveTime(float3 positionOS, half3 normalOS, half mip)
{
    float3 p = DissolveSpace(positionOS);
    half noise = DissolveNoise(p, normalOS, mip);

    // Shapes live in world space: "up" stays up however the character is posed, and the
    // range comes from DissolveShape.cs, measured on the mesh and following the object.
#if defined(_SHAPE_DIRECTION)
    float along = dot(TransformObjectToWorld(positionOS), normalize(_DissolveDirection.xyz));
    half shape = saturate((along - _DissolveRange.x) / max(_DissolveRange.y - _DissolveRange.x, 1e-4));
#elif defined(_SHAPE_SPHERE)
    float3 positionWS = TransformObjectToWorld(positionOS);
    half shape = saturate(distance(positionWS, _SphereCenter.xyz) / max(_SphereRadius, 1e-4));
    shape = _SphereInvert > 0.5h ? 1.0h - shape : shape;
#else
    half shape = noise;
#endif

    return lerp(shape, noise, _NoiseStrength);
}

half DissolveTime(float3 positionOS, half3 normalOS)
{
    return DissolveTime(positionOS, normalOS, 0);
}

// Starts below zero so amount 0 shows no edge at all, and ends just past 1 so amount 1
// leaves nothing behind. With vertex motion the start moves back by the vertex band too,
// or points near t = 0 would already be lifted at amount 0.
half DissolveThreshold()
{
#if defined(_VERTEX_PUSH) || defined(_VERTEX_PULL)
    half start = max(_EdgeWidth, _VertexBand);
#else
    half start = _EdgeWidth;
#endif
    return lerp(-start, 1.001h, _DissolveAmount);
}

#include "BillTransition.hlsl"

// Cuts the pixel and returns how deep it sits in the burning edge: 1 on the cut, 0 inside.
half DissolveClip(float3 positionOS, half3 normalOS)
{
#if defined(_SHAPE_GLOBAL)
    return TransitionClip(positionOS, normalOS);
#else
    half t = DissolveTime(positionOS, normalOS) - DissolveThreshold();
    clip(t);
    return 1.0h - saturate(t / max(_EdgeWidth, 1e-4h));
#endif
}

// Moves a vertex by how close it is to the cut. d is the distance to the cut in dissolve
// time: positive on the part still standing, negative on the part already gone.
//  Push  a bump centered on the cut, back to zero on both sides, so the swell travels with
//        the edge. Keeping cut vertices pushed would stretch every triangle across the edge
//        into a spike. Along the smooth normal: split normals tear the mesh at hard edges.
//  Pull  one-sided: whatever is gone keeps flying to the target, which is the whole point.
float3 DissolveDisplace(float3 positionOS, half3 normalOS, half3 smoothNormalOS)
{
#if defined(_VERTEX_PUSH) || defined(_VERTEX_PULL)
    half d = DissolveTime(positionOS, normalOS, _VertexNoiseMip) - DissolveThreshold();

    #if defined(_VERTEX_PUSH)
        #if defined(DISSOLVE_PUSH_ONE_SIDED)
    half w = 1.0h - saturate(d / max(_VertexBand, 1e-4h));   // tutorial: the spiky first try
        #else
    half w = 1.0h - saturate(abs(d) / max(_VertexBand, 1e-4h));
        #endif
    w = w * w * (3.0h - 2.0h * w);
    half3 direction = dot(smoothNormalOS, smoothNormalOS) > 0.01h ? smoothNormalOS : normalOS;
    float3 offsetWS = TransformObjectToWorldDir(direction) * (_PushDistance * w);
    positionOS += TransformWorldToObjectDir(offsetWS, false);
    #else
    half w = 1.0h - saturate(d / max(_VertexBand, 1e-4h));
    w = w * w * (3.0h - 2.0h * w);
    float3 positionWS = TransformObjectToWorld(positionOS);
    positionWS = lerp(positionWS, _PullTarget.xyz, w * w);
    positionOS = TransformWorldToObject(positionWS);
    #endif
#endif
    return positionOS;
}

#endif
