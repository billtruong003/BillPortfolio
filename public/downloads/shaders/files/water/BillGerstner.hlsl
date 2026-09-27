#ifndef BILL_GERSTNER_INCLUDED
#define BILL_GERSTNER_INCLUDED

// Gerstner (trochoidal) waves. Points move in circles instead of only up and down,
// which bunches vertices at the crests and gives sharp tops with wide troughs.
//
// wave.xy  direction on the XZ plane (normalized inside)
// wave.z   steepness in 0..1. The sum over all waves must stay below 1 or the surface folds.
// wave.w   wavelength in meters
//
// Phase speed comes from the deep-water dispersion relation c = sqrt(g / k),
// so long waves travel faster than short ones without an extra speed slider.
float3 GerstnerWave(float4 wave, float3 positionWS, inout float3 tangent, inout float3 binormal)
{
    float steepness = wave.z;
    float k = TWO_PI / max(wave.w, 0.001);
    float c = sqrt(9.81 / k);
    float2 d = normalize(wave.xy);
    float f = k * (dot(d, positionWS.xz) - c * _Time.y);
    float a = steepness / k;

    float sinF = sin(f);
    float cosF = cos(f);

    tangent += float3(-d.x * d.x * steepness * sinF,
                       d.x * steepness * cosF,
                      -d.x * d.y * steepness * sinF);
    binormal += float3(-d.x * d.y * steepness * sinF,
                        d.y * steepness * cosF,
                       -d.y * d.y * steepness * sinF);

    return float3(d.x * a * cosF, a * sinF, d.y * a * cosF);
}

void ApplyGerstnerWaves(inout float3 positionWS, out float3 normalWS, out float3 tangentWS, out float3 binormalWS)
{
    float3 tangent = float3(1, 0, 0);
    float3 binormal = float3(0, 0, 1);
    float3 anchor = positionWS;

    positionWS += GerstnerWave(_WaveA, anchor, tangent, binormal);
    positionWS += GerstnerWave(_WaveB, anchor, tangent, binormal);
    positionWS += GerstnerWave(_WaveC, anchor, tangent, binormal);

    tangentWS = normalize(tangent);
    binormalWS = normalize(binormal);
    normalWS = normalize(cross(binormal, tangent));
}

#endif
