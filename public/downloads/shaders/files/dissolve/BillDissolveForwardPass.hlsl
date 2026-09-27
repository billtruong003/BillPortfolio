#ifndef BILL_DISSOLVE_FORWARD_PASS_INCLUDED
#define BILL_DISSOLVE_FORWARD_PASS_INCLUDED

// Lighting comes from the toon shader (ToonLighting); this file only adds the dissolve.
#include "../Toon/BillToonForwardPass.hlsl"
#include "BillDissolveCore.hlsl"

struct DissolveAttributes
{
    float4 positionOS     : POSITION;
    float3 normalOS       : NORMAL;
    float2 uv             : TEXCOORD0;
    float3 smoothNormalOS : TEXCOORD3;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct DissolveVaryings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    float3 positionWS : TEXCOORD1;
    half3  normalWS   : TEXCOORD2;
    half   fogFactor  : TEXCOORD3;
    // The undeformed position and normal: the dissolve pattern is read from these, so it
    // stays put while the vertex stage pushes or pulls the geometry around.
    float3 restPositionOS : TEXCOORD4;
    half3  restNormalOS   : TEXCOORD5;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

DissolveVaryings DissolveVertex(DissolveAttributes input)
{
    DissolveVaryings output = (DissolveVaryings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);

    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    VertexPositionInputs positionInputs = GetVertexPositionInputs(positionOS);

    output.positionCS = positionInputs.positionCS;
    output.positionWS = positionInputs.positionWS;
    output.normalWS = TransformObjectToWorldNormal(input.normalOS);
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    output.fogFactor = ComputeFogFactor(positionInputs.positionCS.z);
    output.restPositionOS = input.positionOS.xyz;
    output.restNormalOS = input.normalOS;
    return output;
}

// Toon lighting exactly like Bill/Toon: main light, Forward+ additional lights, ambient.
half3 DissolveShade(DissolveVaryings input, half3 albedo)
{
    half3 normalWS = NormalizeNormalPerPixel(input.normalWS);
    half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
    float2 screenUV = GetNormalizedScreenSpaceUV(input.positionCS);

    Light mainLight = GetMainLight(TransformWorldToShadowCoord(input.positionWS));
    half3 color = ToonLighting(mainLight, albedo, normalWS, viewDirWS);

#if defined(_ADDITIONAL_LIGHTS)
    InputData inputData = (InputData)0;
    inputData.positionWS = input.positionWS;
    inputData.normalizedScreenSpaceUV = screenUV;
    uint lightCount = GetAdditionalLightsCount();

    #if USE_CLUSTER_LIGHT_LOOP
    for (uint lightIndex = 0; lightIndex < min(URP_FP_DIRECTIONAL_LIGHTS_COUNT, MAX_VISIBLE_LIGHTS); lightIndex++)
    {
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, albedo, normalWS, viewDirWS);
    }
    #endif

    LIGHT_LOOP_BEGIN(lightCount)
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, albedo, normalWS, viewDirWS);
    LIGHT_LOOP_END
#endif

    half3 ambient = SampleSH(normalWS) * albedo;
#if defined(_SCREEN_SPACE_OCCLUSION)
    AmbientOcclusionFactor ao = GetScreenSpaceAmbientOcclusion(screenUV);
    ambient *= ao.indirectAmbientOcclusion;
#endif
    return color + ambient;
}

half4 DissolveFragment(DissolveVaryings input, FRONT_FACE_TYPE face : FRONT_FACE_SEMANTIC) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);

    half edge = DissolveClip(input.restPositionOS, input.restNormalOS);
    half3 edgeGlow = _EdgeColor.rgb * edge;

    // Through a hole we look at the back faces. Lit with the front normal they would glow
    // like the outside; a flat dark color reads as the hollow inside of the shell.
    if (!IS_FRONT_VFACE(face, true, false))
        return half4(MixFog(_InsideColor.rgb + edgeGlow, input.fogFactor), 1.0h);

    // The glow is added after lighting: a burning edge gives off light, it does not receive it.
    half3 color = DissolveShade(input, SampleBaseColor(input.uv).rgb) + edgeGlow;
    return half4(MixFog(color, input.fogFactor), 1.0h);
}

#endif
