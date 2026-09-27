---
title: "Properties trong shader Unity: CBUFFER và SRP Batcher"
description: "Khai báo Properties trong shader URP, đưa chúng vào CBUFFER UnityPerMaterial để tương thích SRP Batcher, và đổi màu material từ Inspector hoặc từ C#."
section: "Cơ bản"
order: 9
tags: ["shader", "properties", "cbuffer", "srp batcher", "material"]
image: /images/docs/hlsl/properties.webp
imageIdea: "Nhân vật anime ngồi trước bàn điều khiển đầy thanh trượt và núm vặn, mỗi núm dán nhãn _BaseColor, _Glow, _Speed, trên màn hình phía trước là con quái đổi màu theo."
imagePrompt: "Edit this image: the character sits at a mixing-console style control panel full of sliders and knobs, labeled '_BaseColor', '_Glow', '_Speed'. On a monitor in front, a cute slime monster changes color as a slider moves. Keep the original art style, 16:9."
---

Properties là các biến của shader mà bạn chỉnh được từ Inspector của material, hoặc từ code C#. Nhờ Properties, một shader dùng cho nhiều material khác nhau: slime xanh, slime đỏ, slime vàng đều chung một shader.

## Khối Properties

```hlsl
Properties
{
    [MainColor] _BaseColor ("Base Color", Color) = (0.3, 0.9, 0.4, 1)
    _RageColor ("Rage Color", Color) = (1, 0.1, 0.1, 1)
    _Rage ("Rage", Range(0, 1)) = 0
    _BounceHeight ("Bounce Height", Float) = 0.2
    _WindDir ("Wind Direction", Vector) = (1, 0, 0, 0)
    [MainTexture] _MainTex ("Texture", 2D) = "white" {}
}
```

Các kiểu hay dùng:

| Kiểu trong Properties | Biến trong HLSL | Dùng cho |
|---|---|---|
| `Color` | `half4` | màu, có bảng chọn màu |
| `Float` | `float` hoặc `half` | một số bất kỳ |
| `Range(min, max)` | `float` hoặc `half` | một số có thanh trượt |
| `Vector` | `float4` | bốn số, ví dụ hướng gió |
| `2D` | `TEXTURE2D` | texture |

## Đưa giá trị vào HLSL bằng CBUFFER

Chỗ người mới hay sai: khai báo trong Properties rồi dùng luôn trong `frag`, và gặp lỗi `undeclared identifier '_RageColor'`. Khối Properties chỉ tạo ô trong Inspector. Muốn HLSL đọc được, phải khai báo lại biến **cùng tên** trong code HLSL.

Trong URP, các biến này đặt trong một khối tên `UnityPerMaterial`:

```hlsl
CBUFFER_START(UnityPerMaterial)
    half4 _BaseColor;
    half4 _RageColor;
    half  _Rage;
    float _BounceHeight;
    float4 _WindDir;
    float4 _MainTex_ST;
CBUFFER_END

TEXTURE2D(_MainTex);
SAMPLER(sampler_MainTex);
```

Texture không đặt trong CBUFFER. Chỉ có `_MainTex_ST` (tiling và offset của texture, xem trang [Texture và UV](/docs/hlsl/texture-va-uv)) nằm trong đó.

## SRP Batcher là gì

SRP Batcher là cơ chế của URP giúp vẽ nhiều vật thể nhanh hơn. Nó giữ dữ liệu của từng material trên GPU, lần vẽ sau chỉ cập nhật phần thay đổi. Điều kiện: **mọi** property của material phải nằm trong đúng một khối `CBUFFER_START(UnityPerMaterial)`, và khối đó giống hệt nhau ở mọi Pass.

Kiểm tra: chọn file shader trong Project, Inspector có dòng **SRP Batcher**. Nếu ghi `not compatible`, Inspector thường ghi luôn lý do, ví dụ một biến nằm ngoài CBUFFER.

> **Lỗi hay gặp:** khai báo `half4 _RageColor;` bên ngoài CBUFFER. Shader vẫn chạy, màu vẫn đúng, nên rất khó phát hiện. Nhưng shader mất SRP Batcher, cảnh đông quái sẽ tốn CPU hơn hẳn. Thói quen tốt: thêm một dòng vào Properties thì thêm ngay một dòng vào CBUFFER.

## Shader đầy đủ: slime nổi giận

```hlsl
Shader "Docs/RageSlime"
{
    Properties
    {
        [MainColor] _BaseColor ("Base Color", Color) = (0.3, 0.9, 0.4, 1)
        _RageColor ("Rage Color", Color) = (1, 0.1, 0.1, 1)
        _Rage ("Rage", Range(0, 1)) = 0
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
            };

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
                half4 _RageColor;
                half  _Rage;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                return lerp(_BaseColor, _RageColor, _Rage);
            }
            ENDHLSL
        }
    }
}
```

Kéo thanh **Rage** trong Inspector từ 0 lên 1, slime chuyển dần từ xanh sang đỏ.

## Đổi property từ C#

Trong game, bạn đổi giá trị bằng code. Dùng `Shader.PropertyToID` để lấy mã số của tên property một lần, rồi gọi `SetColor`, `SetFloat`.

```csharp
using UnityEngine;

public class SlimeRage : MonoBehaviour
{
    static readonly int RageId = Shader.PropertyToID("_Rage");
    static readonly int RageColorId = Shader.PropertyToID("_RageColor");

    [SerializeField] Color rageColor = new Color(1f, 0.1f, 0.1f);

    Material material;

    void Awake()
    {
        material = GetComponent<Renderer>().material; // bản sao riêng cho con slime này
        material.SetColor(RageColorId, rageColor);
    }

    public void SetRage(float hpLostRatio)
    {
        material.SetFloat(RageId, Mathf.Clamp01(hpLostRatio));
    }
}
```

`renderer.material` tạo một bản sao material cho riêng vật thể đó, nên đổi màu một con slime không làm đổi cả đàn. Nếu muốn đổi tất cả cùng lúc, dùng `renderer.sharedMaterial`. Bản sao tạo bằng `.material` nên được hủy bằng `Destroy(material)` khi vật thể bị hủy, để khỏi rò bộ nhớ.

> **Lỗi hay gặp:** gõ sai tên, ví dụ `SetFloat("Rage", 1)` thiếu dấu gạch dưới. Unity không báo lỗi gì, material cứ thế giữ nguyên. Khi gọi `Set...` mà không thấy tác dụng, việc đầu tiên là so tên với dòng trong Properties.

## Bài tập

Thêm property `_Brightness` kiểu `Range(0, 2)`, mặc định 1, vào shader `Docs/RageSlime`. Màu cuối cùng nhân với `_Brightness`. Nhớ giữ shader tương thích SRP Batcher.

<details>
<summary>Xem đáp án</summary>

```hlsl
// trong Properties
_Brightness ("Brightness", Range(0, 2)) = 1

// trong CBUFFER
CBUFFER_START(UnityPerMaterial)
    half4 _BaseColor;
    half4 _RageColor;
    half  _Rage;
    half  _Brightness;
CBUFFER_END

// trong frag
half4 col = lerp(_BaseColor, _RageColor, _Rage);
col.rgb *= _Brightness;
return col;
```

</details>
