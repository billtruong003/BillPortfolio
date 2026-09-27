// Generated for the dissolve tutorial, part 4: X-ray without the stencil mark.
// Silhouette of a character wherever something opaque stands in front of it. Goes on the
// character as a second material, after its own.
//
// Pass order matters. SRPDefaultUnlit runs before UniversalForward for the same object:
//  1  Mark      ZTest LEqual, writes stencil where the character itself is visible
//  2  XRay      ZTest Greater: only pixels hidden behind something, minus the marked ones
// Without the mark, ZTest Greater also fires where the character hides part of itself
// (an arm in front of the body), and the silhouette paints over its own visible surface.
Shader "Bill/Tutorial/Dissolve/09 XRayNoStencil"
{
    Properties
    {
        [HDR] _XRayColor ("X-Ray Color", Color) = (0.3, 0.8, 2.5, 1)
        _XRayFill ("Fill", Range(0, 1)) = 0.25
        _XRayRimPower ("Rim Power", Range(0.5, 8)) = 2.5
        [IntRange] _StencilRef ("Stencil Ref", Range(1, 255)) = 64
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "RenderPipeline" = "UniversalPipeline" "Queue" = "Transparent-50" }

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            half4 _XRayColor;
            half  _XRayFill;
            half  _XRayRimPower;
            half  _StencilRef;
        CBUFFER_END

        struct Attributes
        {
            float4 positionOS : POSITION;
            float3 normalOS   : NORMAL;
        };

        struct Varyings
        {
            float4 positionCS : SV_POSITION;
            float3 positionWS : TEXCOORD0;
            half3  normalWS   : TEXCOORD1;
        };

        Varyings XRayVertex(Attributes input)
        {
            Varyings output;
            output.positionWS = TransformObjectToWorld(input.positionOS.xyz);
            output.positionCS = TransformWorldToHClip(output.positionWS);
            output.normalWS = TransformObjectToWorldNormal(input.normalOS);
            return output;
        }
        ENDHLSL

        Pass
        {
            Name "XRay"
            Tags { "LightMode" = "UniversalForward" }
            ZWrite Off
            ZTest Greater
            Blend One One

            HLSLPROGRAM
            #pragma vertex XRayVertex
            #pragma fragment XRayFragment

            // Rim-heavy: the outline of the body reads through a wall better than a flat fill.
            half4 XRayFragment(Varyings input) : SV_Target
            {
                half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
                half rim = pow(1.0h - saturate(dot(normalize(input.normalWS), viewDirWS)), _XRayRimPower);
                return half4(_XRayColor.rgb * (_XRayFill + rim), 1.0h);
            }
            ENDHLSL
        }
    }
}
