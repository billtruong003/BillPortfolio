#ifndef WATER_TUTORIAL_PASS_INCLUDED
#define WATER_TUTORIAL_PASS_INCLUDED

// Water pass of the stylized water tutorial, one block per chapter. Each Step shader defines
// WATER_STEP before including this file. The finished shader is Bill/StylizedWater.
//
//  1  flat color                     6  refraction, fixed for objects above the surface
//  2  water depth, shown as gray     7  surface foam
//  3  shallow to deep color          8  intersection foam
//  4  see-through + horizon color    9  specular highlight
//  5  ripples + naive refraction    10  Gerstner waves (the finished shader)

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"

struct Attributes
{
    float4 positionOS : POSITION;
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    float3 positionWS : TEXCOORD0;
};

Varyings WaterVertex(Attributes input)
{
    Varyings output;
    output.positionWS = TransformObjectToWorld(input.positionOS.xyz);
    output.positionCS = TransformWorldToHClip(output.positionWS);
    return output;
}

float3 SceneWorldPosition(float2 screenUV)
{
    float rawDepth = SampleSceneDepth(screenUV);
#if !UNITY_REVERSED_Z
    rawDepth = lerp(UNITY_NEAR_CLIP_VALUE, 1.0, rawDepth);
#endif
    return ComputeWorldSpacePosition(screenUV, rawDepth, UNITY_MATRIX_I_VP);
}

half3 SampleRippleNormal(float2 worldXZ)
{
    float2 uvA = worldXZ / _NormalTiling + _Time.y * _NormalSpeed.xy / _NormalTiling;
    float2 uvB = worldXZ / (_NormalTiling * 1.37) + _Time.y * _NormalSpeed.zw / _NormalTiling;
    half3 a = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMapA, sampler_NormalMapA, uvA), _NormalStrength);
    half3 b = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMapB, sampler_NormalMapB, uvB), _NormalStrength);
    return BlendNormal(a, b);
}

half4 WaterFragment(Varyings input) : SV_Target
{
#if WATER_STEP == 1
    return half4(_DeepColor.rgb, 1);
#else
    float2 screenUV = GetNormalizedScreenSpaceUV(input.positionCS);
    float surfaceHeight = input.positionWS.y;
    float waterDepth = surfaceHeight - SceneWorldPosition(screenUV).y;

    #if WATER_STEP >= 5
    half3 normalTS = SampleRippleNormal(input.positionWS.xz);
    half3 normalWS = normalize(half3(normalTS.x, normalTS.z, normalTS.y));
    float2 refractedUV = screenUV + normalTS.xy * _RefractionStrength * saturate(waterDepth);
    float refractedDepth = surfaceHeight - SceneWorldPosition(refractedUV).y;
        #if WATER_STEP >= 6
    if (refractedDepth < 0.0)
    {
        refractedUV = screenUV;
        refractedDepth = waterDepth;
    }
        #endif
    #else
    half3 normalTS = half3(0, 0, 1);
    half3 normalWS = half3(0, 1, 0);
    float2 refractedUV = screenUV;
    float refractedDepth = waterDepth;
    #endif

    half depthFade = 1.0h - exp(-max(refractedDepth, 0.0) / _DepthDistance);

    #if WATER_STEP == 2
    return half4(depthFade.xxx, 1);
    #else
    half4 waterColor = lerp(_ShallowColor, _DeepColor, depthFade);

        #if WATER_STEP == 3
    return half4(waterColor.rgb, 1);
        #else
    half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
    half horizon = pow(1.0h - saturate(viewDirWS.y), _HorizonPower);
    waterColor = lerp(waterColor, _HorizonColor, horizon);
    half3 color = lerp(SampleSceneColor(refractedUV), waterColor.rgb, waterColor.a);

            #if WATER_STEP >= 7
    float2 foamUV = input.positionWS.xz / _SurfaceFoamTiling + _Time.y * _SurfaceFoamSpeed
                  + normalTS.xy * _SurfaceFoamDistortion;
    half surfaceNoise = SAMPLE_TEXTURE2D(_SurfaceFoamMap, sampler_SurfaceFoamMap, foamUV).r;
    half foam = smoothstep(_SurfaceFoamCutoff, _SurfaceFoamCutoff + 0.03h, surfaceNoise);
            #else
    half foam = 0;
            #endif

            #if WATER_STEP >= 8
    half shoreMask = saturate(1.0h - waterDepth / _IntersectionDistance);
    float2 shoreUV = input.positionWS.xz / _IntersectionTiling + _Time.y * _IntersectionSpeed;
    half shoreNoise = SAMPLE_TEXTURE2D(_IntersectionMap, sampler_IntersectionMap, shoreUV).r;
    foam = saturate(foam + smoothstep(0.5h, 0.53h, shoreMask - (1.0h - shoreNoise) * _IntersectionNoise));
            #endif

    Light mainLight = GetMainLight();
    color = lerp(color, _FoamColor.rgb * (mainLight.color * 0.8h + 0.2h), foam * _FoamColor.a);

            #if WATER_STEP >= 9
    half3 halfDir = SafeNormalize(mainLight.direction + viewDirWS);
    half specular = pow(saturate(dot(normalWS, halfDir)), _SpecularPower);
    specular = smoothstep(_SpecularThreshold, _SpecularThreshold + 0.02h, specular) * (1.0h - foam);
    color += _SpecularColor.rgb * mainLight.color * specular;
            #endif

    return half4(color, 1);
        #endif
    #endif
#endif
}

#endif
