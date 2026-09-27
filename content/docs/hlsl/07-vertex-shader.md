---
title: "Vertex shader trong HLSL: làm lá cờ bay"
description: "Vertex shader chạy cho từng đỉnh và đặt đỉnh lên màn hình bằng TransformObjectToHClip. Ví dụ đẩy đỉnh theo hàm sin để làm lá cờ bay trong Unity URP."
section: "Cơ bản"
order: 7
tags: ["hlsl", "vertex shader", "sin", "hiệu ứng"]
image: /images/docs/hlsl/vertex-shader.webp
imageIdea: "Nhân vật anime đứng trên tường thành lâu đài, giữ cột cờ, lá cờ bay thành hình sóng sin rất đều, có đường lưới chấm các đỉnh trên lá cờ."
imagePrompt: "Edit this image: the character stands on a castle wall holding a flagpole. The flag waves in a perfectly regular sine-wave shape, with small glowing dots marking a grid of vertices across the flag cloth. The flag has two horizontal color stripes. Keep the original art style, 16:9."
---

Vertex shader là hàm chạy một lần cho mỗi đỉnh của mesh. Việc bắt buộc của nó là tính vị trí của đỉnh trên màn hình. Việc thú vị hơn: bạn được phép dời đỉnh đi trước khi tính, nhờ vậy làm được cờ bay, cỏ đung đưa, nước nhấp nhô mà không cần animation.

## Việc bắt buộc: đưa đỉnh lên màn hình

Mesh lưu vị trí đỉnh trong không gian vật thể (Object Space), tính từ tâm của chính nó. Màn hình thì cần tọa độ trong Clip Space. Muốn đi từ cái này sang cái kia phải nhân qua ba ma trận: vật thể sang thế giới, thế giới sang camera, camera sang màn hình.

URP gói cả ba bước vào một hàm:

```hlsl
Varyings vert(Attributes input)
{
    Varyings output;
    output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
    return output;
}
```

> **Lỗi hay gặp:** trả thẳng `output.positionCS = input.positionOS;` vì nghĩ "vị trí thì cứ giữ nguyên". Vật thể sẽ dính cứng vào giữa màn hình hoặc biến mất, không theo camera nữa. Vị trí gán cho `SV_POSITION` luôn phải đi qua `TransformObjectToHClip`.

## Dời đỉnh trước khi chuyển

Chỗ bạn được sáng tạo là ở giữa: lấy vị trí gốc, sửa nó, rồi mới gọi `TransformObjectToHClip`. Ví dụ đẩy mọi đỉnh lên theo trục y một đoạn:

```hlsl
float3 pos = input.positionOS.xyz;
pos.y += 0.5;                                 // cả vật thể nổi lên nửa mét
output.positionCS = TransformObjectToHClip(pos);
```

Dời một lượng cố định thì chẳng khác gì kéo Transform. Hay hơn là dời mỗi đỉnh một lượng khác nhau, tùy vị trí của nó.

## Làm lá cờ bay bằng sin

Ý tưởng: đỉnh ở mỗi vị trí x được đẩy lên xuống theo `sin(x + thời gian)`. Vì mỗi x có pha khác nhau, lá cờ thành hình sóng, và sóng trôi theo thời gian.

Dùng **Plane** của Unity (GameObject > 3D Object > Plane), không dùng Quad. Plane có lưới 11x11 đỉnh trải từ x = -5 tới 5. Quad chỉ có 4 đỉnh ở 4 góc, đẩy kiểu gì cũng chỉ ra một mặt phẳng nghiêng.

```hlsl
Shader "Docs/WavingFlag"
{
    Properties
    {
        _TopColor ("Top Color", Color) = (0.9, 0.15, 0.15, 1)
        _BottomColor ("Bottom Color", Color) = (1, 1, 1, 1)
        _Amplitude ("Amplitude", Float) = 0.4
        _Frequency ("Frequency", Float) = 1.2
        _Speed ("Speed", Float) = 4
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }
        Cull Off

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
                half   wave       : TEXCOORD1;
            };

            CBUFFER_START(UnityPerMaterial)
                half4 _TopColor;
                half4 _BottomColor;
                float _Amplitude;
                float _Frequency;
                float _Speed;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                float3 pos = input.positionOS.xyz;

                // mép x = -5 là chỗ buộc vào cột cờ, đứng yên; càng xa cột càng bay mạnh
                float pinned = saturate((pos.x + 5.0) / 10.0);
                float wave = sin(pos.x * _Frequency - _Time.y * _Speed);
                pos.y += wave * _Amplitude * pinned;

                output.positionCS = TransformObjectToHClip(pos);
                output.uv = input.uv;
                output.wave = wave;
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half3 col = lerp(_BottomColor.rgb, _TopColor.rgb, step(0.5, input.uv.y));
                col *= 0.8 + 0.2 * input.wave;   // chỗ lõm tối hơn một chút cho thấy nếp gấp
                return half4(col, 1);
            }
            ENDHLSL
        }
    }
}
```

Tạo material dùng shader `Docs/WavingFlag`, gán cho Plane, xoay Plane `Rotation X = 90` cho đứng lên như lá cờ. Bấm Play, hoặc bật **Always Refresh** trong menu hiệu ứng của cửa sổ Scene để thấy cờ bay ngay khi chưa Play.

Vài điểm đáng chú ý:

- `pinned` bằng 0 ở mép gần cột, bằng 1 ở mép xa. Nhân vào sóng để mép buộc cờ không nhúc nhích.
- `- _Time.y * _Speed` làm sóng trôi về phía x dương, tức từ cột ra ngoài.
- `Cull Off` tắt việc bỏ mặt sau, để nhìn từ phía nào cũng thấy lá cờ.
- Giá trị `wave` được truyền sang `frag` qua `Varyings` để tô tối chỗ lõm.

Đẩy đỉnh không làm thay đổi collider hay bounds của mesh. Nếu biên độ quá lớn, đi sát mép camera có thể thấy cờ bị cắt mất vì Unity tưởng nó nằm ngoài khung hình.

## Bài tập

Sửa shader lá cờ thành một ngọn cỏ đung đưa trên Plane: phần gần `uv.y = 0` (gốc) đứng yên, càng lên cao càng lắc mạnh, và lắc theo trục x thay vì trục y.

<details>
<summary>Xem đáp án</summary>

Chỉ cần sửa trong hàm `vert`:

```hlsl
float3 pos = input.positionOS.xyz;
float sway = sin(_Time.y * _Speed + pos.z * _Frequency);
pos.x += sway * _Amplitude * input.uv.y;   // gốc uv.y = 0 đứng yên
output.positionCS = TransformObjectToHClip(pos);
```

`input.uv.y` đóng vai trò của `pinned`: 0 ở gốc, 1 ở ngọn.

</details>
