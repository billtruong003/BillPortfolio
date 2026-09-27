#ifndef BILL_TOON_FORWARD_PASS_INCLUDED
#define BILL_TOON_FORWARD_PASS_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

struct Attributes
{
    float4 positionOS : POSITION;
    float3 normalOS   : NORMAL;
    float2 uv         : TEXCOORD0;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    float3 positionWS : TEXCOORD1;
    half3  normalWS   : TEXCOORD2;
    half   fogFactor  : TEXCOORD3;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

Varyings ToonVertex(Attributes input)
{
    Varyings output = (Varyings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);

    VertexPositionInputs positionInputs = GetVertexPositionInputs(input.positionOS.xyz);
    VertexNormalInputs normalInputs = GetVertexNormalInputs(input.normalOS);

    output.positionCS = positionInputs.positionCS;
    output.positionWS = positionInputs.positionWS;
    output.normalWS = normalInputs.normalWS;
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    output.fogFactor = ComputeFogFactor(positionInputs.positionCS.z);
    return output;
}

// One light's contribution. The ramp texture decides how light turns into shadow:
// its U coordinate is half-Lambert darkened by the shadow map, so cast shadows and
// the unlit side land on the same colors instead of fighting each other.
half3 ToonLighting(Light light, half3 albedo, half3 normalWS, half3 viewDirWS)
{
    half nDotL = dot(normalWS, light.direction);
    half lightAmount = (nDotL * 0.5h + 0.5h) * light.shadowAttenuation;
    half3 ramp = SAMPLE_TEXTURE2D_LOD(_RampMap, sampler_RampMap, half2(saturate(lightAmount + _RampOffset), 0.5h), 0).rgb;

    half3 halfDir = SafeNormalize(light.direction + viewDirWS);
    half specular = pow(saturate(dot(normalWS, halfDir)), _Glossiness);
    specular = smoothstep(0.5h - _SpecularSoftness, 0.5h + _SpecularSoftness, specular) * step(0.0h, nDotL) * light.shadowAttenuation;

    // Rim only on the side facing the light, so it reads as back light rather than a glow.
    half rimDot = 1.0h - saturate(dot(viewDirWS, normalWS));
    half rim = rimDot * pow(saturate(nDotL), _RimLightAlign);
    rim = smoothstep(_RimSize - 0.01h, _RimSize + 0.01h, rim) * light.shadowAttenuation;

    half3 color = albedo * ramp + _SpecularColor.rgb * specular + _RimColor.rgb * rim;
    return color * light.color * light.distanceAttenuation;
}

half4 ToonFragment(Varyings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);

    half4 baseColor = SampleBaseColor(input.uv);
#if defined(_ALPHATEST_ON)
    clip(baseColor.a - _Cutoff);
#endif

    half3 normalWS = NormalizeNormalPerPixel(input.normalWS);
    half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
    float2 screenUV = GetNormalizedScreenSpaceUV(input.positionCS);

    Light mainLight = GetMainLight(TransformWorldToShadowCoord(input.positionWS));
    half3 color = ToonLighting(mainLight, baseColor.rgb, normalWS, viewDirWS);

#if defined(_ADDITIONAL_LIGHTS)
    InputData inputData = (InputData)0;
    inputData.positionWS = input.positionWS;
    inputData.normalizedScreenSpaceUV = screenUV;
    uint lightCount = GetAdditionalLightsCount();

    #if USE_CLUSTER_LIGHT_LOOP
    for (uint lightIndex = 0; lightIndex < min(URP_FP_DIRECTIONAL_LIGHTS_COUNT, MAX_VISIBLE_LIGHTS); lightIndex++)
    {
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, baseColor.rgb, normalWS, viewDirWS);
    }
    #endif

    LIGHT_LOOP_BEGIN(lightCount)
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, baseColor.rgb, normalWS, viewDirWS);
    LIGHT_LOOP_END
#endif

    half3 ambient = SampleSH(normalWS) * baseColor.rgb;
#if defined(_SCREEN_SPACE_OCCLUSION)
    AmbientOcclusionFactor ao = GetScreenSpaceAmbientOcclusion(screenUV);
    ambient *= ao.indirectAmbientOcclusion;
#endif
    color += ambient;

#if defined(_EMISSION)
    color += SAMPLE_TEXTURE2D(_EmissionMap, sampler_EmissionMap, input.uv).rgb * _EmissionColor.rgb;
#endif

    color = MixFog(color, input.fogFactor);
    return half4(color, baseColor.a);
}

#endif
