#ifndef DISSOLVE_TUTORIAL_PASS_INCLUDED
#define DISSOLVE_TUTORIAL_PASS_INCLUDED

// Color pass of the dissolve tutorial, one block per chapter. Each Step shader defines
// DISSOLVE_STEP before including this file. The finished shader is Bill/Dissolve.
//
//  1  noise read through the mesh UVs         4  burning edge, naive threshold
//  2  triplanar noise in object space         5  burning edge, fixed threshold
//  3  noise range stretched to 0..1           6  inside of the shell (Cull Off)
//  Finished shader: shadow and depth passes cut too (Bill/Dissolve)
//  7  part 2: height + noise added in world meters (the range problem)

#include "../../Dissolve/BillDissolveForwardPass.hlsl"

half TriplanarNoiseRaw(float3 positionMeters, half3 normalOS)
{
    float3 p = positionMeters * _NoiseScale;
    half3 weights = pow(abs(normalOS), 4.0h);
    weights /= max(weights.x + weights.y + weights.z, 1e-4h);
    return SampleDissolveNoise(p.zy) * weights.x
         + SampleDissolveNoise(p.xz) * weights.y
         + SampleDissolveNoise(p.xy) * weights.z;
}

half4 DissolveTutorialFragment(DissolveVaryings input, FRONT_FACE_TYPE face : FRONT_FACE_SEMANTIC) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    half3 albedo = SampleBaseColor(input.uv).rgb;
    half3 edgeGlow = 0;

#if DISSOLVE_STEP == 1
    half noise = SAMPLE_TEXTURE2D(_NoiseMap, sampler_NoiseMap, input.uv * _NoiseScale).r;
    clip(noise - _DissolveAmount);
#elif DISSOLVE_STEP == 2
    half noise = TriplanarNoiseRaw(DissolveSpace(input.restPositionOS), input.restNormalOS);
    clip(noise - _DissolveAmount);
#elif DISSOLVE_STEP == 3
    half noise = DissolveNoise(DissolveSpace(input.restPositionOS), input.restNormalOS);
    clip(noise - _DissolveAmount);
#elif DISSOLVE_STEP == 4
    half t = DissolveNoise(DissolveSpace(input.restPositionOS), input.restNormalOS) - _DissolveAmount;
    clip(t);
    edgeGlow = _EdgeColor.rgb * (1.0h - saturate(t / _EdgeWidth));
#elif DISSOLVE_STEP == 7
    // Part 2, first try: height plus noise, in raw world meters.
    float height = TransformObjectToWorld(input.restPositionOS).y;
    half t = height + DissolveNoise(DissolveSpace(input.restPositionOS), input.restNormalOS) - _DissolveAmount;
    clip(t);
    edgeGlow = _EdgeColor.rgb * (1.0h - saturate(t / _EdgeWidth));
#else
    edgeGlow = _EdgeColor.rgb * DissolveClip(input.restPositionOS, input.restNormalOS);
#endif

#if DISSOLVE_STEP >= 6
    if (!IS_FRONT_VFACE(face, true, false))
        return half4(MixFog(_InsideColor.rgb + edgeGlow, input.fogFactor), 1.0h);
#endif

    half3 color = DissolveShade(input, albedo) + edgeGlow;
    return half4(MixFog(color, input.fogFactor), 1.0h);
}

#endif
