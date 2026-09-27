---
title: "Texture và UV trong shader URP"
description: "UV là gì, cách khai báo và đọc texture trong HLSL cho Unity URP bằng TEXTURE2D, SAMPLER, TRANSFORM_TEX, dùng tiling, offset và cuộn UV làm nền game bắn máy bay."
section: "Texture"
order: 10
tags: ["shader", "texture", "uv", "tiling", "hlsl"]
image: /images/docs/hlsl/texture-va-uv.webp
imageIdea: "Nhân vật anime đang gói quà: tờ giấy gói in lưới ô vuông đánh số từ (0,0) tới (1,1), đang được bọc quanh một hộp quà."
imagePrompt: "Edit this image: the character is wrapping a gift box with wrapping paper printed with a checkered grid. The paper corners are labeled '(0,0)' and '(1,1)'. The character smooths the paper onto the box with a focused smile. Keep the original art style, 16:9."
---

Texture là một tấm ảnh dán lên mô hình. UV là tọa độ cho biết mỗi điểm trên mô hình lấy màu ở chỗ nào của tấm ảnh. Trang này dạy cách đọc texture trong shader URP và cách dùng UV để lặp, dời, cuộn ảnh.

## UV là gì

UV là cặp số `(u, v)`, thường nằm trong khoảng 0 tới 1. `(0, 0)` là góc dưới trái của ảnh, `(1, 1)` là góc trên phải. Mỗi đỉnh của mesh lưu sẵn một UV do người làm model đặt. GPU nội suy UV cho từng điểm ảnh, fragment shader dùng UV đó để lấy màu từ texture.

Cách nhanh nhất để "nhìn thấy" UV là xuất nó ra màu:

```hlsl
half4 frag(Varyings input) : SV_Target
{
    return half4(input.uv, 0, 1); // u thành kênh đỏ, v thành kênh xanh lá
}
```

Trên Quad, góc dưới trái đen, góc dưới phải đỏ, góc trên trái xanh lá, góc trên phải vàng.

## Khai báo và đọc texture

URP dùng macro để khai báo texture, giúp cùng một code chạy được trên DirectX, Vulkan, Metal.

```hlsl
TEXTURE2D(_MainTex);          // bản thân texture
SAMPLER(sampler_MainTex);     // cách lấy mẫu: lọc, lặp hay kẹp mép

// trong frag
half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
```

Tên sampler phải là `sampler` + tên texture. Unity nhờ vậy tự lấy **Filter Mode** và **Wrap Mode** trong Import Settings của texture để dùng.

> **Lỗi hay gặp:** đặt `TEXTURE2D(_MainTex);` vào trong `CBUFFER_START(UnityPerMaterial)`. CBUFFER là khối chứa số (màu, float, vector), còn texture là tài nguyên riêng. Đặt sai chỗ thì tùy nền tảng, shader có thể lỗi compile hoặc mất tương thích SRP Batcher. Texture và sampler luôn khai báo ở ngoài CBUFFER.

## Tiling và offset với TRANSFORM_TEX

Mỗi texture trong Properties có hai ô **Tiling** và **Offset** trên material. Unity gửi chúng vào shader qua biến `<tên texture>_ST`: `xy` là tiling, `zw` là offset.

```hlsl
CBUFFER_START(UnityPerMaterial)
    float4 _MainTex_ST;
CBUFFER_END

// trong vert
output.uv = TRANSFORM_TEX(input.uv, _MainTex);   // bằng uv * _MainTex_ST.xy + _MainTex_ST.zw
```

Đặt Tiling `(4, 4)` thì ảnh lặp 4 lần mỗi chiều, hợp cho sàn gạch dungeon.

## Shader đầy đủ: nền vũ trụ cuộn

Game bắn máy bay dọc cần nền sao trôi xuống liên tục. Thay vì di chuyển Quad, ta cộng thời gian vào UV.

```hlsl
Shader "Docs/ScrollingSpace"
{
    Properties
    {
        [MainTexture] _MainTex ("Texture", 2D) = "white" {}
        [MainColor] _BaseColor ("Tint", Color) = (1, 1, 1, 1)
        _ScrollSpeed ("Scroll Speed (XY)", Vector) = (0, 0.1, 0, 0)
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
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST;
                half4 _BaseColor;
                float4 _ScrollSpeed;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = TRANSFORM_TEX(input.uv, _MainTex);
                output.uv += _ScrollSpeed.xy * _Time.y;   // UV trượt theo thời gian
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
                return tex * _BaseColor;
            }
            ENDHLSL
        }
    }
}
```

Tạo Quad đủ lớn phủ camera, gán material có texture bầu trời sao. Ô Scroll Speed `(0, 0.1)` làm ảnh trôi mỗi giây một phần mười chiều cao. Cộng vào UV làm ảnh trôi về phía ngược lại, nên muốn sao trôi xuống thì dùng số dương cho y.

> **Lỗi hay gặp:** texture cuộn được một đoạn rồi thành các vệt kéo dài. Nguyên nhân là **Wrap Mode** của texture đang là `Clamp`: UV vượt quá 1 thì lấy mãi pixel ở mép. Chọn texture trong Project, đổi Wrap Mode thành `Repeat`, bấm Apply.

## Bài tập

Làm hiệu ứng parallax hai lớp: cùng shader trên, thêm texture thứ hai `_StarTex` (sao gần) cuộn nhanh gấp ba lớp nền, rồi cộng hai màu lại.

<details>
<summary>Xem đáp án</summary>

```hlsl
// Properties
_StarTex ("Near Stars", 2D) = "black" {}

// khai báo
TEXTURE2D(_StarTex);
SAMPLER(sampler_StarTex);

CBUFFER_START(UnityPerMaterial)
    float4 _MainTex_ST;
    float4 _StarTex_ST;
    half4 _BaseColor;
    float4 _ScrollSpeed;
CBUFFER_END

// Varyings thêm một bộ UV
float2 uvStar : TEXCOORD1;

// trong vert
output.uvStar = TRANSFORM_TEX(input.uv, _StarTex) + _ScrollSpeed.xy * 3.0 * _Time.y;

// trong frag
half4 far  = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
half4 near = SAMPLE_TEXTURE2D(_StarTex, sampler_StarTex, input.uvStar);
return half4(far.rgb * _BaseColor.rgb + near.rgb, 1);
```

</details>
