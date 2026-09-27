---
title: "Màu và gradient trong shader: lerp theo UV và tint"
description: "Trộn màu bằng lerp theo UV để làm gradient dọc cho bầu trời, thanh máu, và nhân màu tint lên texture trong shader Unity URP."
section: "Texture"
order: 11
tags: ["shader", "gradient", "lerp", "tint", "màu"]
image: /images/docs/hlsl/mau-va-gradient.webp
imageIdea: "Nhân vật anime đứng trên thang, dùng con lăn sơn một phông nền sân khấu hình bầu trời hoàng hôn chuyển từ cam dưới chân sang tím ở trên đỉnh."
imagePrompt: "Edit this image: the character stands on a small ladder, using a paint roller to paint a large stage backdrop with a smooth sunset gradient from orange at the bottom to deep purple at the top. A paint can on the floor is labeled 'lerp'. Keep the original art style, 16:9."
---

Màu trong shader chỉ là các con số từ 0 tới 1. Vì là số, bạn cộng, nhân, pha chúng như mọi phép toán khác. Trang này dùng `lerp` và UV để làm gradient, rồi nhân màu tint để nhuộm texture.

## Màu là số, phép toán là pha màu

```hlsl
half3 red    = half3(1, 0, 0);
half3 blue   = half3(0, 0, 1);

half3 purple = (red + blue) * 0.5;     // (0.5, 0, 0.5)
half3 dark   = red * 0.3;              // đỏ tối
half3 tinted = half3(1, 1, 1) * blue;  // nhân màu: trắng nhân xanh ra xanh
```

- **Cộng** làm sáng lên, hợp cho ánh phát sáng.
- **Nhân** làm tối đi hoặc nhuộm màu. Nhân với trắng `(1, 1, 1)` thì giữ nguyên, nhân với đen thì ra đen.

> **Lỗi hay gặp:** cộng nhiều màu sáng rồi thấy vật thể trắng bệch. Kết quả vượt 1 ở mọi kênh, màn hình chỉ hiện được tối đa là trắng. Muốn pha trung bình hai màu thì dùng `lerp` hoặc nhân `0.5`, không cộng thẳng.

## Gradient dọc bằng lerp và uv.y

`lerp(a, b, t)` pha từ `a` sang `b` theo `t`. Nếu `t` là `uv.y`, chạy từ 0 ở đáy tới 1 ở đỉnh, ta có ngay gradient dọc.

```hlsl
half3 col = lerp(_BottomColor.rgb, _TopColor.rgb, input.uv.y);
```

Đổi `uv.y` thành `uv.x` là gradient ngang. Muốn gradient dồn nhiều về một phía, bẻ cong `t` trước khi đưa vào `lerp`:

```hlsl
half t = input.uv.y * input.uv.y;             // t tăng chậm ở dưới, nhanh ở trên
half3 col = lerp(_BottomColor.rgb, _TopColor.rgb, t);
```

## Shader đầy đủ: bầu trời hoàng hôn có tint

Shader này làm phông nền bầu trời cho màn chơi. Gradient hai màu, cộng thêm texture mây nhân với màu tint.

```hlsl
Shader "Docs/SunsetSky"
{
    Properties
    {
        _BottomColor ("Bottom Color", Color) = (1, 0.55, 0.2, 1)
        _TopColor ("Top Color", Color) = (0.3, 0.15, 0.5, 1)
        _GradientPower ("Gradient Power", Range(0.2, 4)) = 1
        [MainTexture] _MainTex ("Clouds", 2D) = "black" {}
        _CloudTint ("Cloud Tint", Color) = (1, 0.8, 0.9, 1)
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv         : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv         : TEXCOORD0;
                float2 uvClouds   : TEXCOORD1;
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                half4 _BottomColor;
                half4 _TopColor;
                half  _GradientPower;
                float4 _MainTex_ST;
                half4 _CloudTint;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = input.uv;                                  // gradient dùng UV gốc 0..1
                output.uvClouds = TRANSFORM_TEX(input.uv, _MainTex);   // mây có tiling riêng
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half t = pow(saturate(input.uv.y), _GradientPower);
                half3 sky = lerp(_BottomColor.rgb, _TopColor.rgb, t);

                half3 clouds = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uvClouds).rgb;
                sky += clouds * _CloudTint.rgb;   // mây nhuộm hồng rồi cộng lên nền

                return half4(sky, 1);
            }
            ENDHLSL
        }
    }
}
```

Gán cho một Quad lớn đặt sau cảnh. Chưa có texture mây thì ô Clouds để trống: mặc định `"black"` nên cộng vào không đổi gì, chỉ thấy gradient.

Hai chi tiết đáng để ý:

- Gradient dùng UV gốc, không qua `TRANSFORM_TEX`. Nếu dùng UV đã tiling, đổi Tiling của mây sẽ làm gradient lặp lại theo.
- `pow(t, _GradientPower)` là cách bẻ cong gradient. Power lớn hơn 1 thì màu dưới chiếm nhiều chỗ hơn, nhỏ hơn 1 thì màu trên lan xuống.

## Tint: nhuộm màu texture

Tint là nhân một màu lên texture. Texture xám trắng nhân tint đỏ thành đỏ, giữ nguyên chi tiết sáng tối. Đây là cách một texture áo giáp dùng được cho cả đội đỏ lẫn đội xanh.

```hlsl
half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
half4 col = tex * _TeamColor;   // nhân cả bốn kênh, alpha cũng nhân theo
```

Muốn tint chỉ đổi màu mà không đụng alpha, nhân riêng phần `rgb`: `tex.rgb *= _TeamColor.rgb;`.

## Bài tập

Làm gradient ba màu cho thanh năng lượng: từ `uv.x = 0` tới `0.5` pha đỏ sang vàng, từ `0.5` tới `1` pha vàng sang xanh lá. Gợi ý: dùng hai lần `lerp` và `saturate`.

<details>
<summary>Xem đáp án</summary>

```hlsl
half3 red    = half3(0.9, 0.1, 0.1);
half3 yellow = half3(1, 0.85, 0.1);
half3 green  = half3(0.2, 0.9, 0.2);

half tFirst  = saturate(input.uv.x * 2.0);         // 0..1 trên nửa trái
half tSecond = saturate(input.uv.x * 2.0 - 1.0);   // 0..1 trên nửa phải

half3 col = lerp(red, yellow, tFirst);
col = lerp(col, green, tSecond);
return half4(col, 1);
```

Nửa trái `tSecond` luôn bằng 0 nên chỉ có lượt `lerp` đầu tác dụng. Nửa phải `tFirst` đã bằng 1 (màu vàng), lượt thứ hai pha tiếp sang xanh lá.

</details>
