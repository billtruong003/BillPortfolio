#ifndef BILL_DISSOLVE_PASSES_INCLUDED
#define BILL_DISSOLVE_PASSES_INCLUDED

// Outline, ShadowCaster, DepthOnly and DepthNormals for the dissolve shader. Each one moves
// the vertex and cuts the pixel exactly like the color pass. Skip that in the shadow pass and
// the floor keeps the full shadow of an object that has burned away.

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"
#include "BillDissolveCore.hlsl"

float3 _LightDirection;
float3 _LightPosition;

struct DissolveUtilityAttributes
{
    float4 positionOS     : POSITION;
    float3 normalOS       : NORMAL;
    float3 smoothNormalOS : TEXCOORD3;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct DissolveUtilityVaryings
{
    float4 positionCS     : SV_POSITION;
    half3  normalWS       : TEXCOORD0;
    float3 restPositionOS : TEXCOORD1;
    half3  restNormalOS   : TEXCOORD2;
    half   fogFactor      : TEXCOORD3;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

DissolveUtilityVaryings InitUtilityVaryings(DissolveUtilityAttributes input)
{
    DissolveUtilityVaryings output = (DissolveUtilityVaryings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);
    output.normalWS = TransformObjectToWorldNormal(input.normalOS);
    output.restPositionOS = input.positionOS.xyz;
    output.restNormalOS = input.normalOS;
    return output;
}

// ---------- ShadowCaster ----------

DissolveUtilityVaryings DissolveShadowVertex(DissolveUtilityAttributes input)
{
    DissolveUtilityVaryings output = InitUtilityVaryings(input);
    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    float3 positionWS = TransformObjectToWorld(positionOS);

#if defined(_CASTING_PUNCTUAL_LIGHT_SHADOW)
    float3 lightDirectionWS = normalize(_LightPosition - positionWS);
#else
    float3 lightDirectionWS = _LightDirection;
#endif

    float4 positionCS = TransformWorldToHClip(ApplyShadowBias(positionWS, output.normalWS, lightDirectionWS));
#if UNITY_REVERSED_Z
    positionCS.z = min(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#else
    positionCS.z = max(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#endif
    output.positionCS = positionCS;
    return output;
}

half4 DissolveShadowFragment(DissolveUtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    DissolveClip(input.restPositionOS, input.restNormalOS);
    return 0;
}

// ---------- DepthOnly / DepthNormals ----------

DissolveUtilityVaryings DissolveDepthVertex(DissolveUtilityAttributes input)
{
    DissolveUtilityVaryings output = InitUtilityVaryings(input);
    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    output.positionCS = TransformObjectToHClip(positionOS);
    return output;
}

half DissolveDepthOnlyFragment(DissolveUtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
    DissolveClip(input.restPositionOS, input.restNormalOS);
    return input.positionCS.z;
}

half4 DissolveDepthNormalsFragment(DissolveUtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
    DissolveClip(input.restPositionOS, input.restNormalOS);

#if defined(_GBUFFER_NORMALS_OCT)
    float2 octNormalWS = PackNormalOctQuadEncode(normalize(input.normalWS));
    return half4(PackFloat2To888(saturate(octNormalWS * 0.5 + 0.5)), 0.0);
#else
    return half4(NormalizeNormalPerPixel(input.normalWS), 0.0);
#endif
}

// ---------- Outline ----------

DissolveUtilityVaryings DissolveOutlineVertex(DissolveUtilityAttributes input)
{
    DissolveUtilityVaryings output = InitUtilityVaryings(input);
    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    float3 normalOS = dot(input.smoothNormalOS, input.smoothNormalOS) > 0.01 ? input.smoothNormalOS : input.normalOS;

    float4 positionCS = TransformObjectToHClip(positionOS);
    float3 normalCS = TransformWorldToHClipDir(TransformObjectToWorldNormal(normalOS));
    positionCS.xy += normalize(normalCS.xy) * _OutlineWidth * 2.0 / _ScaledScreenParams.xy * positionCS.w;

    output.positionCS = positionCS;
    output.fogFactor = ComputeFogFactor(positionCS.z);
    return output;
}

half4 DissolveOutlineFragment(DissolveUtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    DissolveClip(input.restPositionOS, input.restNormalOS);
    return half4(MixFog(_OutlineColor.rgb, input.fogFactor), 1.0h);
}

#endif
