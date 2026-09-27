---
title: "Fragment shader trong HLSL: tô màu theo vị trí"
description: "Fragment shader chạy cho từng điểm ảnh và trả về màu qua SV_Target. Ví dụ tô sọc cảnh báo và vùng dung nham theo vị trí trong thế giới, Unity 6 URP."
section: "Cơ bản"
order: 8
tags: ["hlsl", "fragment shader", "sv_target", "world space"]
image: /images/docs/hlsl/fragment-shader.webp
imageIdea: "Nhân vật anime cầm cọ tô từng ô vuông trên sàn nhà game theo kiểu sọc vàng đen cảnh báo, phía xa là hồ dung nham đỏ rực."
imagePrompt: "Edit this image: the character kneels on a tiled game floor, painting yellow and black diagonal hazard stripes square by square with a small brush. In the background, a glowing orange lava pool. A tiny sign reads 'frag()'. Keep the original art style, 16:9."
---

Fragment shader là hàm chạy một lần cho mỗi điểm ảnh mà vật thể phủ lên màn hình. Nó nhận dữ liệu đã được nội suy từ vertex shader và trả về đúng một thứ: màu của điểm ảnh đó.

## Hàm frag trả về màu

```hlsl
half4 frag(Varyings input) : SV_Target
{
    return half4(1.0, 0.6, 0.1, 1.0); // cam, alpha 1
}
```

- Kiểu trả về `half4` là bốn kênh đỏ, xanh lá, xanh dương, alpha. Giá trị bình thường từ 0 tới 1.
- `: SV_Target` nói với GPU: giá trị này ghi vào màn hình (render target).

> **Lỗi hay gặp:** quên `: SV_Target` sau dấu ngoặc của hàm `frag`. Shader không compile được, vật thể hiện màu hồng và Console báo hàm thiếu semantic cho giá trị trả về. Thêm lại `: SV_Target` là xong.

Trả về một màu cố định thì chẳng cần shader. Cái hay là mỗi điểm ảnh biết mình **ở đâu**, và có thể chọn màu theo đó.

## Lấy vị trí thế giới cho fragment

Fragment shader không tự biết vị trí của nó trong thế giới. Vertex shader phải tính rồi gửi sang qua `Varyings`. GPU sẽ nội suy giá trị đó cho từng điểm ảnh ở giữa các đỉnh.

```hlsl
struct Varyings
{
    float4 positionCS : SV_POSITION;
    float3 positionWS : TEXCOORD0;
};

Varyings vert(Attributes input)
{
    Varyings output;
    output.positionWS = TransformObjectToWorld(input.positionOS.xyz);
    output.positionCS = TransformWorldToHClip(output.positionWS);
    return output;
}
```

`TransformObjectToWorld` đổi sang World Space. Có vị trí thế giới rồi thì gọi `TransformWorldToHClip` để ra vị trí màn hình, kết quả giống hệt `TransformObjectToHClip` nhưng không phải tính lại.

## Ví dụ: sàn dung nham có sọc cảnh báo

Một sàn đấu trùm: gần mặt dung nham (y thấp) thì đỏ cam, lên cao dần thành màu đá. Trên mặt sàn có sọc chéo vàng đen báo vùng nguy hiểm.

```hlsl
Shader "Docs/LavaHazardFloor"
{
    Properties
    {
        _LavaColor ("Lava Color", Color) = (1, 0.35, 0.05, 1)
        _RockColor ("Rock Color", Color) = (0.3, 0.28, 0.26, 1)
        _FadeHeight ("Fade Height", Float) = 2
        _StripeDensity ("Stripe Density", Float) = 1.5
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
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
            };

            CBUFFER_START(UnityPerMaterial)
                half4 _LavaColor;
                half4 _RockColor;
                float _FadeHeight;
                float _StripeDensity;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionWS = TransformObjectToWorld(input.positionOS.xyz);
                output.positionCS = TransformWorldToHClip(output.positionWS);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                // 0 ở mặt dung nham (y = 0), 1 khi cao từ _FadeHeight trở lên
                half heightT = saturate(input.positionWS.y / _FadeHeight);
                half3 col = lerp(_LavaColor.rgb, _RockColor.rgb, heightT);

                // sọc chéo: x + z tăng dần theo đường chéo, frac cắt thành từng dải
                half stripe = step(0.5, frac((input.positionWS.x + input.positionWS.z) * _StripeDensity));
                half3 hazard = lerp(half3(0.05, 0.05, 0.05), half3(1, 0.8, 0), stripe);

                // chỉ vẽ sọc trên mặt sàn thấp, dưới 0.1 mét
                half onFloor = step(input.positionWS.y, 0.1);
                col = lerp(col, hazard, onFloor * 0.8);

                return half4(col, 1);
            }
            ENDHLSL
        }
    }
}
```

Gán shader này cho một Plane nằm ở y = 0 và vài Cube cao dần xung quanh. Plane có sọc vàng đen, các Cube đỏ ở chân rồi xám dần lên đỉnh.

Vì màu tính theo vị trí **thế giới**, kéo một Cube lên cao thì nó xám đi ngay, kéo xuống thì đỏ lại. Hai vật thể dùng chung material nhưng mang màu khác nhau tùy chỗ đứng.

## Vị trí vật thể và vị trí thế giới

Nếu dùng `input.positionOS` thay cho `positionWS`, màu dính theo vật thể: xoay hay dời Cube, màu đi theo nó. Chọn cái nào tùy hiệu ứng:

- Màu gắn với thế giới (mực nước, sương mù theo độ cao, vùng nguy hiểm): dùng World Space.
- Màu gắn với vật thể (vằn trên người quái): dùng Object Space hoặc UV, xem trang [Texture và UV](/docs/hlsl/texture-va-uv).

## Bài tập

Sửa hàm `frag` để làm vòng tròn đỏ báo trước chỗ trùm sắp dậm chân: điểm ảnh nào cách tâm thế giới `(0, 0, 0)` dưới 3 mét trên mặt phẳng ngang thì tô đỏ, còn lại giữ màu cũ.

<details>
<summary>Xem đáp án</summary>

```hlsl
half4 frag(Varyings input) : SV_Target
{
    half heightT = saturate(input.positionWS.y / _FadeHeight);
    half3 col = lerp(_LavaColor.rgb, _RockColor.rgb, heightT);

    float dist = length(input.positionWS.xz);   // bỏ độ cao, chỉ tính trên mặt đất
    half inCircle = step(dist, 3.0);            // 1 khi dist <= 3
    col = lerp(col, half3(1, 0, 0), inCircle);

    return half4(col, 1);
}
```

</details>
