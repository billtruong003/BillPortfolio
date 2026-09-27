---
title: "Shader trong suốt trong Unity URP: Blend, ZWrite và clip"
description: "Làm shader trong suốt trong Unity URP với Blend SrcAlpha OneMinusSrcAlpha, Queue Transparent, ZWrite Off, và cắt pixel bằng clip() cho lá cây, hàng rào, hiệu ứng tan biến."
section: "Hiệu ứng"
order: 14
tags: ["shader", "trong suốt", "blend", "alpha", "clip"]
image: /images/docs/hlsl/trong-suot.webp
imageIdea: "Nhân vật anime cầm một tấm khiên năng lượng trong suốt màu xanh nhạt, nhìn xuyên qua khiên thấy một con quái mờ mờ phía sau."
imagePrompt: "Edit this image: the character holds up a translucent light-blue energy shield. Through the shield, a small monster is visible but slightly tinted and blurred. A tiny floating label near the shield reads 'Blend SrcAlpha OneMinusSrcAlpha'. Keep the original art style, 16:9."
---

Shader từ đầu tới giờ đều vẽ vật thể đặc, alpha trả về bị bỏ qua. Muốn khiên năng lượng, bóng ma hay kính trong suốt, bạn phải bật **blend**: trộn màu của vật thể với màu đã có sẵn phía sau. Còn lá cây, hàng rào thì chỉ cần cắt bỏ pixel bằng `clip()`.

## Vì sao alpha trả về không có tác dụng

Người mới hay trả về `half4(col, 0.5)` rồi thắc mắc sao vật thể vẫn đặc. Alpha chỉ là một con số. Nó chỉ có nghĩa khi Pass được bảo cách dùng con số đó để trộn màu. Cần sửa ba chỗ trong phần ShaderLab.

## Ba chỗ cần đổi

```hlsl
Tags { "RenderType"="Transparent" "Queue"="Transparent" "RenderPipeline"="UniversalPipeline" }
Blend SrcAlpha OneMinusSrcAlpha
ZWrite Off
```

- `"Queue"="Transparent"`: vẽ vật thể này **sau** mọi vật thể đặc. Phải có sẵn thứ phía sau thì mới có cái để trộn.
- `Blend SrcAlpha OneMinusSrcAlpha`: màu cuối = màu mới x alpha + màu cũ x (1 - alpha). Alpha 0.3 nghĩa là 30% khiên, 70% cảnh phía sau.
- `ZWrite Off`: không ghi độ sâu. Nếu ghi, vật thể trong suốt sẽ che mất những vật thể trong suốt khác vẽ sau nó.

## Shader đầy đủ: khiên năng lượng

```hlsl
Shader "Docs/EnergyShield"
{
    Properties
    {
        [MainTexture] _MainTex ("Pattern", 2D) = "white" {}
        [MainColor] _BaseColor ("Shield Color", Color) = (0.3, 0.8, 1, 0.35)
    }

    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent" "RenderPipeline"="UniversalPipeline" }

        Pass
        {
            Blend SrcAlpha OneMinusSrcAlpha
            ZWrite Off

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
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST;
                half4 _BaseColor;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = TRANSFORM_TEX(input.uv, _MainTex);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
                half4 col = tex * _BaseColor;   // alpha lấy từ màu x texture
                return col;
            }
            ENDHLSL
        }
    }
}
```

Gán cho một Sphere bọc quanh nhân vật. Kéo thanh alpha trong ô Shield Color để khiên đậm nhạt. Alpha của màu nằm ở kênh thứ tư, trong bảng chọn màu là thanh **A**.

> **Lỗi hay gặp:** hai vật thể trong suốt chồng nhau đôi khi vẽ sai thứ tự, cái xa lại đè lên cái gần, nhất là khi camera xoay. Vì `ZWrite Off`, GPU không có độ sâu để phân xử. Unity sắp xếp vật thể trong suốt theo khoảng cách từ tâm vật thể tới camera, nên hai vật lớn lồng vào nhau rất dễ lỗi. Đây là giới hạn chung của trong suốt, không phải lỗi code. Tránh để vật thể trong suốt lớn lồng nhau là cách xử lý thực tế nhất.

## Cắt pixel bằng clip()

Lá cây, hàng rào, tóc nhân vật chỉ có hai trạng thái: có hoặc không. Không cần trộn màu, chỉ cần bỏ hẳn những pixel alpha thấp. Hàm `clip(x)` hủy pixel hiện tại nếu `x < 0`.

```hlsl
// Properties thêm
_Cutoff ("Alpha Cutoff", Range(0, 1)) = 0.5

// CBUFFER thêm
half _Cutoff;

// frag
half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv) * _BaseColor;
clip(tex.a - _Cutoff);   // alpha dưới ngưỡng thì bỏ pixel
return half4(tex.rgb, 1);
```

Với cách này, bỏ `Blend` và giữ `ZWrite On` (mặc định), đổi tag thành `"RenderType"="TransparentCutout" "Queue"="AlphaTest"`. Pixel còn lại là pixel đặc, ghi độ sâu bình thường nên không bị lỗi thứ tự như blend.

## Bài tập

Làm hiệu ứng quái tan biến khi chết: dùng một texture nhiễu `_NoiseTex` (xám đen trắng lộn xộn) và property `_Dissolve` từ 0 tới 1. Khi `_Dissolve` tăng, càng nhiều pixel bị cắt, tới 1 thì biến mất hoàn toàn.

<details>
<summary>Xem đáp án</summary>

```hlsl
// khai báo
TEXTURE2D(_NoiseTex);
SAMPLER(sampler_NoiseTex);

CBUFFER_START(UnityPerMaterial)
    float4 _MainTex_ST;
    half4 _BaseColor;
    half  _Dissolve;
CBUFFER_END

// frag
half4 frag(Varyings input) : SV_Target
{
    half noise = SAMPLE_TEXTURE2D(_NoiseTex, sampler_NoiseTex, input.uv).r;
    clip(noise - _Dissolve);   // pixel có nhiễu thấp hơn _Dissolve bị cắt trước

    half4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv) * _BaseColor;
    return half4(col.rgb, 1);
}
```

Khi `_Dissolve = 0` không pixel nào bị cắt, vì nhiễu luôn từ 0 trở lên. Khi `_Dissolve = 1`, chỉ những điểm trắng tuyệt đối còn sót lại, vì `clip` chỉ cắt khi giá trị âm. Tăng giá trị này từ C# trong nửa giây rồi tắt Renderer là quái tan thành từng mảng và biến mất gọn.

</details>
