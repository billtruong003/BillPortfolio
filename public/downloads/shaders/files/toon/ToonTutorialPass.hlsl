#ifndef TOON_TUTORIAL_PASS_INCLUDED
#define TOON_TUTORIAL_PASS_INCLUDED

// Forward pass of the toon tutorial, one block per chapter. Each Step shader defines
// TOON_STEP before including this file, so every screenshot in the article comes from
// exactly the code written up to that point. The finished shader is Bill/Toon.
//
//  1  unlit base color          5  cast and received shadows
//  2  Lambert                   6  ambient light
//  3  two-tone threshold        7  specular highlight
//  4  ramp texture              8  rim light

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

struct Attributes
{
    float4 positionOS : POSITION;
    float3 normalOS   : NORMAL;
    float2 uv         : TEXCOORD0;
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    float3 positionWS : TEXCOORD1;
    half3  normalWS   : TEXCOORD2;
};

Varyings ToonVertex(Attributes input)
{
    Varyings output;
    VertexPositionInputs positionInputs = GetVertexPositionInputs(input.positionOS.xyz);
    output.positionCS = positionInputs.positionCS;
    output.positionWS = positionInputs.positionWS;
    output.normalWS = TransformObjectToWorldNormal(input.normalOS);
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    return output;
}

half4 ToonFragment(Varyings input) : SV_Target
{
    half3 albedo = SampleBaseColor(input.uv).rgb;

#if TOON_STEP == 1
    return half4(albedo, 1);
#else
    half3 normalWS = normalize(input.normalWS);
    half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);

    #if TOON_STEP >= 5
    Light light = GetMainLight(TransformWorldToShadowCoord(input.positionWS));
    #else
    Light light = GetMainLight();
    #endif

    half nDotL = dot(normalWS, light.direction);

    #if TOON_STEP == 2
    half3 color = albedo * saturate(nDotL) * light.color;

    #elif TOON_STEP == 3
    half halfLambert = nDotL * 0.5h + 0.5h;
    half lit = smoothstep(0.49h, 0.51h, halfLambert);
    half3 color = albedo * lerp(0.35h, 1.0h, lit) * light.color;

    #else
        #if TOON_STEP >= 5
    half lightAmount = (nDotL * 0.5h + 0.5h) * light.shadowAttenuation;
        #else
    half lightAmount = nDotL * 0.5h + 0.5h;
        #endif
    half3 ramp = SAMPLE_TEXTURE2D_LOD(_RampMap, sampler_RampMap, half2(saturate(lightAmount + _RampOffset), 0.5h), 0).rgb;
    half3 color = albedo * ramp * light.color;
    #endif

    #if TOON_STEP >= 6
    color += SampleSH(normalWS) * albedo;
    #endif

    #if TOON_STEP >= 7
    half3 halfDir = SafeNormalize(light.direction + viewDirWS);
    half specular = pow(saturate(dot(normalWS, halfDir)), _Glossiness);
    specular = smoothstep(0.5h - _SpecularSoftness, 0.5h + _SpecularSoftness, specular) * step(0.0h, nDotL) * light.shadowAttenuation;
    color += _SpecularColor.rgb * specular * light.color;
    #endif

    #if TOON_STEP >= 8
    half rimDot = 1.0h - saturate(dot(viewDirWS, normalWS));
    half rim = rimDot * pow(saturate(nDotL), _RimLightAlign);
    rim = smoothstep(_RimSize - 0.01h, _RimSize + 0.01h, rim) * light.shadowAttenuation;
    color += _RimColor.rgb * rim * light.color;
    #endif

    return half4(color, 1);
#endif
}

#endif
