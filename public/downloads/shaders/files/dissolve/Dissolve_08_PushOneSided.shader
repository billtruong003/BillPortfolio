// Generated for the dissolve tutorial, part 3: push that never lets go of cut vertices.
Shader "Bill/Tutorial/Dissolve/08 PushOneSided"
{
    Properties
    {
        [Header(Dissolve)]
        _DissolveAmount ("Amount", Range(0, 1)) = 0
        [NoScaleOffset] _NoiseMap ("Noise (R)", 2D) = "gray" {}
        _NoiseScale ("Noise Tiles per Meter", Float) = 1.5
        _NoiseStrength ("Noise Strength", Range(0, 1)) = 1
        _NoiseRemap ("Noise Range (min, max)", Vector) = (0, 1, 0, 0)
        _EdgeWidth ("Edge Width", Range(0, 0.3)) = 0.06
        [HDR] _EdgeColor ("Edge Color", Color) = (4, 1.3, 0.3, 1)
        _InsideColor ("Inside Color", Color) = (0.08, 0.05, 0.06, 1)

        [Header(Shape)]
        [KeywordEnum(Noise, Direction, Sphere, Global)] _Shape ("Shape", Float) = 0
        _DissolveDirection ("Direction (world)", Vector) = (0, 1, 0, 0)
        _DissolveRange ("Range along Direction (min, max, world)", Vector) = (0, 2, 0, 0)
        _SphereCenter ("Sphere Center (world)", Vector) = (0, 0, 0, 0)
        _SphereRadius ("Sphere Radius", Float) = 1
        [Toggle] _SphereInvert ("Invert (sphere: outside in, global: keep inside)", Float) = 0

        [Header(Vertex)]
        [KeywordEnum(None, Push, Pull)] _Vertex ("Vertex Motion", Float) = 0
        _VertexBand ("Vertex Band", Range(0.01, 1)) = 0.25
        _VertexNoiseMip ("Vertex Noise Mip (blur)", Range(0, 6)) = 5
        _PushDistance ("Push Distance (m)", Float) = 0.15
        _PullTarget ("Pull Target (world)", Vector) = (0, 2, 0, 0)

        [Header(Surface)]
        [MainTexture] _BaseMap ("Base Map", 2D) = "white" {}
        [MainColor] _BaseColor ("Base Color", Color) = (1, 1, 1, 1)
        [NoScaleOffset] _RampMap ("Ramp (U = light amount)", 2D) = "white" {}
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
        Tags { "RenderType" = "TransparentCutout" "RenderPipeline" = "UniversalPipeline" "Queue" = "AlphaTest" }

        HLSLINCLUDE
        #define DISSOLVE_PUSH_ONE_SIDED
        #include "../../Dissolve/BillDissolveInput.hlsl"
        ENDHLSL

        Pass
        {
            Name "DissolveForward"
            Tags { "LightMode" = "UniversalForward" }
            // Both sides: through a hole the inside of the shell has to be drawn.
            Cull Off

            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex DissolveVertex
            #pragma fragment DissolveFragment

            #pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE _SHAPE_GLOBAL
            #pragma shader_feature_local _VERTEX_NONE _VERTEX_PUSH _VERTEX_PULL

            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
            #pragma multi_compile _ _ADDITIONAL_LIGHTS
            #pragma multi_compile_fragment _ _ADDITIONAL_LIGHT_SHADOWS
            #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
            #pragma multi_compile_fragment _ _SCREEN_SPACE_OCCLUSION
            #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
            #pragma multi_compile_fog
            #pragma multi_compile_instancing

            #include "../../Dissolve/BillDissolveForwardPass.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "Outline"
            Tags { "LightMode" = "SRPDefaultUnlit" }
            Cull Front

            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex DissolveOutlineVertex
            #pragma fragment DissolveOutlineFragment
            #pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE _SHAPE_GLOBAL
            #pragma shader_feature_local _VERTEX_NONE _VERTEX_PUSH _VERTEX_PULL
            #pragma multi_compile_fog
            #pragma multi_compile_instancing
            #include "../../Dissolve/BillDissolvePasses.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "ShadowCaster"
            Tags { "LightMode" = "ShadowCaster" }
            ZWrite On
            ZTest LEqual
            ColorMask 0
            Cull Off

            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex DissolveShadowVertex
            #pragma fragment DissolveShadowFragment
            #pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE _SHAPE_GLOBAL
            #pragma shader_feature_local _VERTEX_NONE _VERTEX_PUSH _VERTEX_PULL
            #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW
            #pragma multi_compile_instancing
            #include "../../Dissolve/BillDissolvePasses.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            ZWrite On
            ColorMask R
            Cull Off

            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex DissolveDepthVertex
            #pragma fragment DissolveDepthOnlyFragment
            #pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE _SHAPE_GLOBAL
            #pragma shader_feature_local _VERTEX_NONE _VERTEX_PUSH _VERTEX_PULL
            #pragma multi_compile_instancing
            #include "../../Dissolve/BillDissolvePasses.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "DepthNormals"
            Tags { "LightMode" = "DepthNormals" }
            ZWrite On
            Cull Off

            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex DissolveDepthVertex
            #pragma fragment DissolveDepthNormalsFragment
            #pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE _SHAPE_GLOBAL
            #pragma shader_feature_local _VERTEX_NONE _VERTEX_PUSH _VERTEX_PULL
            #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT
            #pragma multi_compile_instancing
            #include "../../Dissolve/BillDissolvePasses.hlsl"
            ENDHLSL
        }
    }
}
