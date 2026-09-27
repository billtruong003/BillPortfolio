Shader "Bill/Tutorial/Toon/04 Ramp"
{
    Properties
    {
        [MainTexture] _BaseMap ("Base Map", 2D) = "white" {}
        [MainColor] _BaseColor ("Base Color", Color) = (1, 1, 1, 1)
        [NoScaleOffset] _RampMap ("Ramp", 2D) = "white" {}
        _RampOffset ("Ramp Offset", Range(-0.5, 0.5)) = 0
        [HDR] _SpecularColor ("Specular Color", Color) = (0.9, 0.9, 0.9, 1)
        _Glossiness ("Glossiness", Range(1, 256)) = 48
        _SpecularSoftness ("Specular Softness", Range(0.001, 0.5)) = 0.02
        [HDR] _RimColor ("Rim Color", Color) = (0.6, 0.6, 0.6, 1)
        _RimSize ("Rim Size", Range(0, 1)) = 0.72
        _RimLightAlign ("Rim Light Align", Range(0, 4)) = 0.4
        _OutlineColor ("Outline Color", Color) = (0.12, 0.09, 0.14, 1)
        _OutlineWidth ("Outline Width (px)", Range(0, 8)) = 2
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" }

        HLSLINCLUDE
        #include "../../Toon/BillToonInput.hlsl"
        ENDHLSL

        Pass
        {
            Name "ToonForward"
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex ToonVertex
            #pragma fragment ToonFragment
            #define TOON_STEP 4
            #include "ToonTutorialPass.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            ZWrite On
            ColorMask R

            HLSLPROGRAM
            #pragma vertex DepthVertex
            #pragma fragment DepthOnlyFragment
            #include "../../Common/BillUtilityPasses.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "DepthNormals"
            Tags { "LightMode" = "DepthNormals" }
            ZWrite On

            HLSLPROGRAM
            #pragma vertex DepthVertex
            #pragma fragment DepthNormalsFragment
            #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT
            #include "../../Common/BillUtilityPasses.hlsl"
            ENDHLSL
        }
    }
}
