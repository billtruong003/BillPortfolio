// Generated for the dissolve tutorial, part 4: shows the signed distance of the transition
// mask on every surface. Red inside the shapes, blue outside, a line every 25 cm, white on
// the surface of the shapes (distance 0).
Shader "Bill/Tutorial/Dissolve/10 SdfDebug"
{
    Properties
    {
        _LineSpacing ("Line Spacing (m)", Float) = 0.25
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" }

        Pass
        {
            Name "SdfDebug"
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float _LineSpacing;
            CBUFFER_END

            #define TRANSITION_MAX_SHAPES 16
            float4 _TransitionShapeA[TRANSITION_MAX_SHAPES];
            float4 _TransitionShapeB[TRANSITION_MAX_SHAPES];
            int    _TransitionShapeCount;

            float SdSphere(float3 p, float3 c, float r) { return length(p - c) - r; }
            float SdBox(float3 p, float3 c, float3 h, float r)
            {
                float3 q = abs(p - c) - h;
                return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
            }
            float SdCapsule(float3 p, float3 a, float3 b, float r)
            {
                float3 pa = p - a, ba = b - a;
                float h = saturate(dot(pa, ba) / max(dot(ba, ba), 1e-6));
                return length(pa - ba * h) - r;
            }

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionCS : SV_POSITION; float3 positionWS : TEXCOORD0; };

            Varyings Vert(Attributes input)
            {
                Varyings o;
                o.positionWS = TransformObjectToWorld(input.positionOS.xyz);
                o.positionCS = TransformWorldToHClip(o.positionWS);
                return o;
            }

            half4 Frag(Varyings input) : SV_Target
            {
                float d = 1e5;
                [loop]
                for (int i = 0; i < _TransitionShapeCount; i++)
                {
                    float4 a = _TransitionShapeA[i];
                    float4 b = _TransitionShapeB[i];
                    float s = a.w < 0.5 ? SdSphere(input.positionWS, a.xyz, b.w)
                            : a.w < 1.5 ? SdBox(input.positionWS, a.xyz, b.xyz, b.w)
                            :             SdCapsule(input.positionWS, a.xyz, b.xyz, b.w);
                    d = min(d, s);
                }

                half3 inside = half3(0.95, 0.42, 0.32);
                half3 outside = half3(0.3, 0.55, 0.95);
                half3 color = d < 0 ? inside : outside;
                color *= 1.0h - 0.35h * saturate(abs(d) / 4.0);            // darker far from the surface
                float stripe = abs(frac(d / _LineSpacing + 0.5) - 0.5) * _LineSpacing;
                color = lerp(color * 0.55h, color, smoothstep(0.0, 0.015, stripe)); // contour lines
                color = lerp(half3(1, 1, 1), color, smoothstep(0.015, 0.035, abs(d))); // the surface itself
                return half4(color, 1);
            }
            ENDHLSL
        }
    }
}
