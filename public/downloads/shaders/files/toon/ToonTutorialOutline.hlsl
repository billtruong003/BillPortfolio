#ifndef TOON_TUTORIAL_OUTLINE_INCLUDED
#define TOON_TUTORIAL_OUTLINE_INCLUDED

// Outline chapter of the toon tutorial. OUTLINE_MESH_NORMALS reproduces the first,
// naive version that extrudes along the mesh normals and tears open on hard edges.

struct OutlineAttributes
{
    float4 positionOS     : POSITION;
    float3 normalOS       : NORMAL;
    float3 smoothNormalOS : TEXCOORD3;
};

float4 OutlineVertex(OutlineAttributes input) : SV_POSITION
{
#if defined(OUTLINE_MESH_NORMALS)
    float3 normalOS = input.normalOS;
#else
    float3 normalOS = dot(input.smoothNormalOS, input.smoothNormalOS) > 0.01 ? input.smoothNormalOS : input.normalOS;
#endif

    float4 positionCS = TransformObjectToHClip(input.positionOS.xyz);
    float3 normalCS = TransformWorldToHClipDir(TransformObjectToWorldNormal(normalOS));
    float2 offset = normalize(normalCS.xy) * _OutlineWidth * 2.0 / _ScaledScreenParams.xy;
    positionCS.xy += offset * positionCS.w;
    return positionCS;
}

half4 OutlineFragment() : SV_Target
{
    return _OutlineColor;
}

#endif
