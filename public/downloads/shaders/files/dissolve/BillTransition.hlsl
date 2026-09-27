#ifndef BILL_TRANSITION_INCLUDED
#define BILL_TRANSITION_INCLUDED

// Scene-wide mask for the Global shape of Bill/Dissolve. Every material with that shape reads
// the same list of shapes, set once per frame by TransitionMask.cs. These are plain globals,
// outside UnityPerMaterial: one value for the whole scene, and the SRP Batcher is unaffected.
//
//  A.xyz  sphere / box center, or capsule start     A.w  type: 0 sphere, 1 box, 2 capsule
//  B.xyz  box half size, or capsule end             B.w  radius (box: corner rounding)

#define TRANSITION_MAX_SHAPES 16

float4 _TransitionShapeA[TRANSITION_MAX_SHAPES];
float4 _TransitionShapeB[TRANSITION_MAX_SHAPES];
int    _TransitionShapeCount;

// Signed distances, in meters: negative inside the shape, zero on its surface.
float SdSphere(float3 p, float3 center, float radius)
{
    return length(p - center) - radius;
}

float SdBox(float3 p, float3 center, float3 halfSize, float rounding)
{
    float3 q = abs(p - center) - halfSize;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - rounding;
}

float SdCapsule(float3 p, float3 a, float3 b, float radius)
{
    float3 pa = p - a;
    float3 ba = b - a;
    float h = saturate(dot(pa, ba) / max(dot(ba, ba), 1e-6));
    return length(pa - ba * h) - radius;
}

// Union of every shape: the smallest distance wins.
float TransitionDistance(float3 positionWS)
{
    float d = 1e5;
    [loop]
    for (int i = 0; i < _TransitionShapeCount; i++)
    {
        float4 a = _TransitionShapeA[i];
        float4 b = _TransitionShapeB[i];
        float shape = a.w < 0.5 ? SdSphere(positionWS, a.xyz, b.w)
                    : a.w < 1.5 ? SdBox(positionWS, a.xyz, b.xyz, b.w)
                    :             SdCapsule(positionWS, a.xyz, b.xyz, b.w);
        d = min(d, shape);
    }
    return d;
}

// Cuts everything inside the shapes (or, inverted, everything outside) and returns the
// burning edge like DissolveClip. Distances are meters here, so is _EdgeWidth.
//
// The noise is read in world space, unlike the per-object dissolve: walls and floor tiles are
// separate objects that do not move, and the ragged border has to run across them unbroken.
half TransitionClip(float3 positionOS, half3 normalOS)
{
    float3 positionWS = TransformObjectToWorld(positionOS);
    half3 normalWS = TransformObjectToWorldNormal(normalOS);
    half noise = DissolveNoise(positionWS, normalWS) - 0.5h;

    float d = TransitionDistance(positionWS) + noise * _NoiseStrength;
    d = _SphereInvert > 0.5h ? -d : d;
    clip(d);
    return 1.0h - saturate(d / max(_EdgeWidth, 1e-4h));
}

#endif
