Shader "Bill/Tutorial/Water/09 Specular"
{
    Properties
    {
        [Header(Color)]
        _ShallowColor ("Shallow Color (A = opacity)", Color) = (0.36, 0.86, 0.82, 0.35)
        _DeepColor ("Deep Color (A = opacity)", Color) = (0.07, 0.3, 0.52, 0.92)
        _HorizonColor ("Horizon Color", Color) = (0.62, 0.86, 0.95, 0.9)
        _DepthDistance ("Depth Distance (m)", Float) = 1.4
        _HorizonPower ("Horizon Power", Range(1, 12)) = 5

        [Header(Ripples)]
        [NoScaleOffset][Normal] _NormalMapA ("Ripple Normal A", 2D) = "bump" {}
        [NoScaleOffset][Normal] _NormalMapB ("Ripple Normal B", 2D) = "bump" {}
        _NormalTiling ("Ripple Tiling (m)", Float) = 3
        _NormalStrength ("Ripple Strength", Range(0, 2)) = 0.6
        _NormalSpeed ("Ripple Speed (A xy, B zw)", Vector) = (0.08, 0.05, -0.06, 0.07)
        _RefractionStrength ("Refraction", Range(0, 0.1)) = 0.025

        [Header(Foam)]
        _FoamColor ("Foam Color", Color) = (1, 1, 1, 1)
        [NoScaleOffset] _SurfaceFoamMap ("Surface Foam Noise", 2D) = "black" {}
        _SurfaceFoamTiling ("Surface Foam Tiling (m)", Float) = 2.5
        _SurfaceFoamSpeed ("Surface Foam Speed", Vector) = (0.02, 0.03, 0, 0)
        _SurfaceFoamCutoff ("Surface Foam Cutoff", Range(0, 1)) = 0.82
        _SurfaceFoamDistortion ("Surface Foam Distortion", Range(0, 0.3)) = 0.08
        [NoScaleOffset] _IntersectionMap ("Intersection Foam Noise", 2D) = "white" {}
        _IntersectionTiling ("Intersection Tiling (m)", Float) = 1.2
        _IntersectionSpeed ("Intersection Speed", Vector) = (0.03, -0.02, 0, 0)
        _IntersectionDistance ("Intersection Distance (m)", Float) = 0.35
        _IntersectionNoise ("Intersection Breakup", Range(0, 1)) = 0.6

        [Header(Specular)]
        [HDR] _SpecularColor ("Specular Color", Color) = (1.2, 1.2, 1.2, 1)
        _SpecularPower ("Specular Power", Range(8, 1024)) = 256
        _SpecularThreshold ("Specular Threshold", Range(0, 1)) = 0.35

    }


    SubShader
    {
        Tags { "RenderType" = "Transparent" "RenderPipeline" = "UniversalPipeline" "Queue" = "Transparent-100" }

        Pass
        {
            Name "Water"
            Tags { "LightMode" = "UniversalForward" }
            ZWrite Off

            HLSLPROGRAM
            #pragma vertex WaterVertex
            #pragma fragment WaterFragment
            #define WATER_STEP 9
            #include "../../Water/BillWaterInput.hlsl"
            #include "WaterTutorialPass.hlsl"
            ENDHLSL
        }
    }
}
