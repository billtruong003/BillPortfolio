#ifndef BILL_WATER_PASS_INCLUDED
#define BILL_WATER_PASS_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"
#include "BillGerstner.hlsl"

struct Attributes
{
    float4 positionOS : POSITION;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    float3 positionWS : TEXCOORD0;
    half3  normalWS   : TEXCOORD1;
    half3  tangentWS  : TEXCOORD2;
    half3  binormalWS : TEXCOORD3;
    half   fogFactor  : TEXCOORD4;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

Varyings WaterVertex(Attributes input)
{
    Varyings output = (Varyings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);

    float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
    float3 normalWS = float3(0, 1, 0);
    float3 tangentWS = float3(1, 0, 0);
    float3 binormalWS = float3(0, 0, 1);
#if defined(_WAVES)
    ApplyGerstnerWaves(positionWS, normalWS, tangentWS, binormalWS);
#endif

    output.positionWS = positionWS;
    output.positionCS = TransformWorldToHClip(positionWS);
    output.normalWS = normalWS;
    output.tangentWS = tangentWS;
    output.binormalWS = binormalWS;
    output.fogFactor = ComputeFogFactor(output.positionCS.z);
    return output;
}

// World position of whatever is already drawn behind this pixel.
float3 SceneWorldPosition(float2 screenUV)
{
    float rawDepth = SampleSceneDepth(screenUV);
#if !UNITY_REVERSED_Z
    rawDepth = lerp(UNITY_NEAR_CLIP_VALUE, 1.0, rawDepth);
#endif
    return ComputeWorldSpacePosition(screenUV, rawDepth, UNITY_MATRIX_I_VP);
}

// Two ripple maps scrolling in different directions, blended so they never line up.
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
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);

    float2 screenUV = GetNormalizedScreenSpaceUV(input.positionCS);
    float surfaceHeight = input.positionWS.y;

    // Depth is measured straight down in world space, not along the view ray, so the
    // shoreline stays put when the camera moves.
    float waterDepth = surfaceHeight - SceneWorldPosition(screenUV).y;

    half3 normalTS = SampleRippleNormal(input.positionWS.xz);
    half3x3 tangentToWorld = half3x3(input.tangentWS, input.binormalWS, input.normalWS);
    half3 normalWS = normalize(mul(normalTS, tangentToWorld));

    // Refraction: offset the screen UV by the ripple normal, less so in the shallows so the
    // shoreline does not wobble. If the offset lands on something above the surface (a rock,
    // the character's legs), fall back to the straight UV instead of smearing it into the water.
    float2 refractedUV = screenUV + normalTS.xy * _RefractionStrength * saturate(waterDepth);
    float refractedDepth = surfaceHeight - SceneWorldPosition(refractedUV).y;
    if (refractedDepth < 0.0)
    {
        refractedUV = screenUV;
        refractedDepth = waterDepth;
    }
    half3 sceneColor = SampleSceneColor(refractedUV);

    // Color: light is absorbed with depth, so fade exponentially rather than linearly.
    half depthFade = 1.0h - exp(-max(refractedDepth, 0.0) / _DepthDistance);
    half4 waterColor = lerp(_ShallowColor, _DeepColor, depthFade);

    half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
    half horizon = pow(1.0h - saturate(dot(input.normalWS, viewDirWS)), _HorizonPower);
    waterColor = lerp(waterColor, _HorizonColor, horizon);

    half3 color = lerp(sceneColor, waterColor.rgb, waterColor.a);

    // Surface foam: bright caustic-like lines from a noise texture, nudged by the ripples.
    float2 foamUV = input.positionWS.xz / _SurfaceFoamTiling + _Time.y * _SurfaceFoamSpeed
                  + normalTS.xy * _SurfaceFoamDistortion;
    half surfaceNoise = SAMPLE_TEXTURE2D(_SurfaceFoamMap, sampler_SurfaceFoamMap, foamUV).r;
    half surfaceFoam = smoothstep(_SurfaceFoamCutoff, _SurfaceFoamCutoff + 0.03h, surfaceNoise);

    // Intersection foam: a solid band where the water meets geometry, broken up by noise
    // the further it gets from the contact line.
    half shoreMask = saturate(1.0h - waterDepth / _IntersectionDistance);
    float2 shoreUV = input.positionWS.xz / _IntersectionTiling + _Time.y * _IntersectionSpeed;
    half shoreNoise = SAMPLE_TEXTURE2D(_IntersectionMap, sampler_IntersectionMap, shoreUV).r;
    half intersectionFoam = smoothstep(0.5h, 0.53h, shoreMask - (1.0h - shoreNoise) * _IntersectionNoise);

    Light mainLight = GetMainLight();
    half foam = saturate(surfaceFoam + intersectionFoam);
    color = lerp(color, _FoamColor.rgb * (mainLight.color * 0.8h + 0.2h), foam * _FoamColor.a);

    // Hard-edged Blinn-Phong highlight, the flat sparkle of cel-shaded water.
    half3 halfDir = SafeNormalize(mainLight.direction + viewDirWS);
    half specular = pow(saturate(dot(normalWS, halfDir)), _SpecularPower);
    specular = smoothstep(_SpecularThreshold, _SpecularThreshold + 0.02h, specular) * (1.0h - foam);
    color += _SpecularColor.rgb * mainLight.color * specular;

    color = MixFog(color, input.fogFactor);
    return half4(color, 1.0h);
}

#endif
