#ifndef BILL_WATER_INPUT_INCLUDED
#define BILL_WATER_INPUT_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

TEXTURE2D(_NormalMapA);        SAMPLER(sampler_NormalMapA);
TEXTURE2D(_NormalMapB);        SAMPLER(sampler_NormalMapB);
TEXTURE2D(_SurfaceFoamMap);    SAMPLER(sampler_SurfaceFoamMap);
TEXTURE2D(_IntersectionMap);   SAMPLER(sampler_IntersectionMap);

CBUFFER_START(UnityPerMaterial)
    // Color
    half4  _ShallowColor;
    half4  _DeepColor;
    half4  _HorizonColor;
    float  _DepthDistance;
    half   _HorizonPower;

    // Surface normals, in world units: 1 tile every _NormalTiling meters
    float  _NormalTiling;
    half   _NormalStrength;
    float4 _NormalSpeed;        // xy: map A direction, zw: map B direction (meters per second)

    // Refraction
    half   _RefractionStrength;

    // Foam
    half4  _FoamColor;
    float  _SurfaceFoamTiling;
    float2 _SurfaceFoamSpeed;
    half   _SurfaceFoamCutoff;
    half   _SurfaceFoamDistortion;
    float  _IntersectionTiling;
    float2 _IntersectionSpeed;
    float  _IntersectionDistance;
    half   _IntersectionNoise;

    // Specular
    half4  _SpecularColor;
    half   _SpecularPower;
    half   _SpecularThreshold;

    // Gerstner waves: xy direction, z steepness (0..1), w wavelength in meters
    float4 _WaveA;
    float4 _WaveB;
    float4 _WaveC;
CBUFFER_END

#endif
