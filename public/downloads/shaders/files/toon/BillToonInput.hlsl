#ifndef BILL_TOON_INPUT_INCLUDED
#define BILL_TOON_INPUT_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

TEXTURE2D(_BaseMap);        SAMPLER(sampler_BaseMap);
TEXTURE2D(_RampMap);        SAMPLER(sampler_RampMap);
TEXTURE2D(_EmissionMap);    SAMPLER(sampler_EmissionMap);

// Every pass sees the same per-material block, which keeps the shader SRP Batcher compatible.
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
CBUFFER_END

half4 SampleBaseColor(float2 uv)
{
    return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, uv) * _BaseColor;
}

// Hook used by the shared ShadowCaster, DepthOnly and DepthNormals passes.
void BillSurfaceClip(float2 uv)
{
#if defined(_ALPHATEST_ON)
    clip(SampleBaseColor(uv).a - _Cutoff);
#endif
}

#endif
