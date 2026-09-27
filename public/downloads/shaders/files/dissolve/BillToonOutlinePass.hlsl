#ifndef BILL_TOON_OUTLINE_PASS_INCLUDED
#define BILL_TOON_OUTLINE_PASS_INCLUDED

// Inverted hull outline. The back faces are pushed out along the normal in clip space,
// so the line keeps the same width in pixels at any distance.
//
// Hard-edged meshes have split normals at every crease, which tears the hull open.
// SmoothNormalBaker (Editor) stores an averaged normal per position in UV3; when it is
// present we extrude along it instead.

struct OutlineAttributes
{
    float4 positionOS     : POSITION;
    float3 normalOS       : NORMAL;
    float2 uv             : TEXCOORD0;
    float3 smoothNormalOS : TEXCOORD3;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct OutlineVaryings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    half   fogFactor  : TEXCOORD1;
    UNITY_VERTEX_INPUT_INSTANCE_ID
    UNITY_VERTEX_OUTPUT_STEREO
};

OutlineVaryings OutlineVertex(OutlineAttributes input)
{
    OutlineVaryings output = (OutlineVaryings)0;
    UNITY_SETUP_INSTANCE_ID(input);
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);

    float3 normalOS = dot(input.smoothNormalOS, input.smoothNormalOS) > 0.01 ? input.smoothNormalOS : input.normalOS;

    float4 positionCS = TransformObjectToHClip(input.positionOS.xyz);
    float3 normalCS = TransformWorldToHClipDir(TransformObjectToWorldNormal(normalOS));

    // Clip space spans 2 units across the screen, so width in pixels becomes 2 * width / resolution.
    float2 offset = normalize(normalCS.xy) * _OutlineWidth * 2.0 / _ScaledScreenParams.xy;
    positionCS.xy += offset * positionCS.w;

    output.positionCS = positionCS;
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    output.fogFactor = ComputeFogFactor(positionCS.z);
    return output;
}

half4 OutlineFragment(OutlineVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    BillSurfaceClip(input.uv);
    return half4(MixFog(_OutlineColor.rgb, input.fogFactor), 1.0h);
}

#endif
