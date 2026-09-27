#ifndef BILL_UTILITY_PASSES_INCLUDED
#define BILL_UTILITY_PASSES_INCLUDED

// ShadowCaster, DepthOnly and DepthNormals passes shared by the lab's opaque shaders.
// The including shader provides its input file first, with BillSurfaceClip(uv) and _BaseMap_ST.
//
// Why DepthNormals matters: when the renderer has SSAO (or anything else that needs normals),
// URP builds _CameraDepthTexture from a DepthNormals prepass. A shader without this pass
// then never shows up in the depth texture, and every depth-based effect behind it breaks.

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"

float3 _LightDirection;
float3 _LightPosition;

struct UtilityAttributes
{
    float4 positionOS : POSITION;
    float3 normalOS   : NORMAL;
    float2 uv         : TEXCOORD0;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct UtilityVaryings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    half3  normalWS   : TEXCOORD1;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

UtilityVaryings ShadowCasterVertex(UtilityAttributes input)
{
    UtilityVaryings output = (UtilityVaryings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);

    float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
    float3 normalWS = TransformObjectToWorldNormal(input.normalOS);

#if defined(_CASTING_PUNCTUAL_LIGHT_SHADOW)
    float3 lightDirectionWS = normalize(_LightPosition - positionWS);
#else
    float3 lightDirectionWS = _LightDirection;
#endif

    float4 positionCS = TransformWorldToHClip(ApplyShadowBias(positionWS, normalWS, lightDirectionWS));
#if UNITY_REVERSED_Z
    positionCS.z = min(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#else
    positionCS.z = max(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#endif

    output.positionCS = positionCS;
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    return output;
}

half4 ShadowCasterFragment(UtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    BillSurfaceClip(input.uv);
    return 0;
}

UtilityVaryings DepthVertex(UtilityAttributes input)
{
    UtilityVaryings output = (UtilityVaryings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);

    output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
    output.normalWS = TransformObjectToWorldNormal(input.normalOS);
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    return output;
}

half DepthOnlyFragment(UtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
    BillSurfaceClip(input.uv);
    return input.positionCS.z;
}

half4 DepthNormalsFragment(UtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
    BillSurfaceClip(input.uv);

#if defined(_GBUFFER_NORMALS_OCT)
    float3 normalWS = normalize(input.normalWS);
    float2 octNormalWS = PackNormalOctQuadEncode(normalWS);
    return half4(PackFloat2To888(saturate(octNormalWS * 0.5 + 0.5)), 0.0);
#else
    return half4(NormalizeNormalPerPixel(input.normalWS), 0.0);
#endif
}

#endif
