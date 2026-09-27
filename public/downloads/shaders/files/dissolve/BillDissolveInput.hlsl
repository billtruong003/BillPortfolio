#ifndef BILL_DISSOLVE_INPUT_INCLUDED
#define BILL_DISSOLVE_INPUT_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

TEXTURE2D(_BaseMap);        SAMPLER(sampler_BaseMap);
TEXTURE2D(_RampMap);        SAMPLER(sampler_RampMap);
TEXTURE2D(_EmissionMap);    SAMPLER(sampler_EmissionMap);
TEXTURE2D(_NoiseMap);       SAMPLER(sampler_NoiseMap);

// The toon block first, unchanged, so ToonLighting from the toon shader works as is.
// The dissolve values follow in the same block: one CBUFFER for every pass keeps the
// SRP Batcher happy.
CBUFFER_START(UnityPerMaterial)
    float4 _BaseMap_ST;
    half4  _BaseColor;
    half   _Cutoff;
    half   _RampOffset;
    half4  _SpecularColor;
    half   _Glossiness;
    half   _SpecularSoftness;
    half4  _RimColor;
    half   _RimSize;
    half   _RimLightAlign;
    half4  _EmissionColor;
    half4  _OutlineColor;
    half   _OutlineWidth;

    half   _DissolveAmount;
    half   _NoiseScale;
    half   _NoiseStrength;
    half4  _NoiseRemap;
    half   _EdgeWidth;
    half4  _EdgeColor;
    half4  _InsideColor;
    float4 _DissolveDirection;
    float4 _DissolveRange;
    float4 _SphereCenter;
    float  _SphereRadius;
    half   _SphereInvert;
    half   _VertexBand;
    half   _VertexNoiseMip;
    half   _PushDistance;
    float4 _PullTarget;
CBUFFER_END

half4 SampleBaseColor(float2 uv)
{
    return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, uv) * _BaseColor;
}

#endif
