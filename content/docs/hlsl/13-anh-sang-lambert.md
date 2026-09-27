---
title: "Ánh sáng Lambert trong shader URP và toon hai bậc"
description: "Tính ánh sáng khuếch tán Lambert trong shader Unity URP bằng normal, GetMainLight và dot(N, L), rồi đổi thành tô bóng toon hai bậc bằng step."
section: "Hiệu ứng"
order: 13
tags: ["shader", "lambert", "ánh sáng", "toon", "normal"]
image: /images/docs/hlsl/anh-sang-lambert.webp
imageIdea: "Nhân vật anime giơ cao cây đèn lồng soi vào một bức tượng hiệp sĩ, nửa tượng sáng, nửa tượng tối, ranh giới sáng tối sắc nét như tranh hoạt hình."
imagePrompt: "Edit this image: the character holds up a glowing lantern next to a small knight statue. The statue is cel-shaded with exactly two tones, a bright side and a flat shadow side with a crisp border. A tag hanging on the statue reads 'dot(N, L)'. Keep the original art style, 16:9."
---

Các shader từ đầu tới giờ đều unlit: tô màu phẳng, không quan tâm đèn. Trang này thêm ánh sáng. Mô hình Lambert là cách chiếu sáng cơ bản nhất: mặt nào quay về phía đèn thì sáng, quay đi thì tối. Từ Lambert, chỉ thêm một dòng `step` là ra kiểu tô bóng hoạt hình.

## Normal: mặt đang quay về đâu

Mỗi đỉnh của mesh có một **normal** (pháp tuyến): vector độ dài 1 chỉ hướng mặt đó đang quay ra. Mặt trên của cube có normal `(0, 1, 0)`, mặt trước có `(0, 0, -1)`.

Normal trong mesh nằm ở Object Space. Đèn nằm trong World Space. Phải đổi normal sang World Space trước khi so với đèn:

```hlsl
output.normalWS = TransformObjectToWorldNormal(input.normalOS);
```

> **Lỗi hay gặp:** dùng thẳng `normalOS` để tính sáng. Khi xoay nhân vật, vùng sáng xoay theo nhân vật như bị dán cứng, trong khi đèn đứng yên. Luôn gọi `TransformObjectToWorldNormal`.

## dot(N, L): công thức Lambert

`L` là hướng từ bề mặt tới đèn. `dot(N, L)` bằng 1 khi mặt nhìn thẳng vào đèn, bằng 0 khi mặt nằm ngang so với tia sáng, âm khi quay lưng lại. Kẹp phần âm về 0 bằng `saturate` là có độ sáng.

```hlsl
Light mainLight = GetMainLight();
half ndotl = saturate(dot(normalWS, mainLight.direction));
```

`GetMainLight()` nằm trong `Lighting.hlsl` của URP. Nó trả về struct `Light` của đèn chính (thường là Directional Light trong scene), có `direction` là hướng **tới** đèn và `color` là màu nhân cường độ.

## Shader đầy đủ: Lambert

```hlsl
Shader "Docs/SimpleLambert"
{
    Properties
    {
        [MainColor] _BaseColor ("Base Color", Color) = (0.9, 0.6, 0.3, 1)
        _AmbientColor ("Ambient Color", Color) = (0.15, 0.15, 0.2, 1)
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode"="UniversalForward" }

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 normalWS   : TEXCOORD0;
            };

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
                half4 _AmbientColor;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                output.normalWS = TransformObjectToWorldNormal(input.normalOS);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                float3 normalWS = normalize(input.normalWS);
                Light mainLight = GetMainLight();

                half ndotl = saturate(dot(normalWS, mainLight.direction));
                half3 diffuse = _BaseColor.rgb * mainLight.color * ndotl;
                half3 ambient = _BaseColor.rgb * _AmbientColor.rgb;

                return half4(diffuse + ambient, 1);
            }
            ENDHLSL
        }
    }
}
```

Gán cho một Sphere, xoay Directional Light trong scene: vùng sáng chạy theo đèn. `_AmbientColor` là ánh sáng nền tự chọn để mặt tối không đen kịt.

Ba điểm cần để ý:

- `Lighting.hlsl` include **sau** `Core.hlsl`.
- Pass có `Tags { "LightMode"="UniversalForward" }` để URP biết đây là pass vẽ có ánh sáng.
- `normalize` lại trong `frag`. GPU nội suy normal giữa các đỉnh làm độ dài của nó nhỏ hơn 1, bỏ bước này thì vùng sáng loang lổ.

Shader này chưa nhận bóng đổ và chưa tính đèn phụ (point light, spot light). Đó là phần nâng cao, cần thêm keyword của URP.

## Toon hai bậc bằng step

Game phong cách anime thường không tô bóng mượt mà chia thẳng hai vùng: sáng và tối. Chỉ cần thay dải `ndotl` liên tục bằng `step`:

```hlsl
// Properties thêm
_ShadowColor ("Shadow Color", Color) = (0.45, 0.35, 0.5, 1)
_Threshold ("Threshold", Range(0, 1)) = 0.3

// CBUFFER thêm
half4 _ShadowColor;
half  _Threshold;

// frag
half4 frag(Varyings input) : SV_Target
{
    float3 normalWS = normalize(input.normalWS);
    Light mainLight = GetMainLight();

    half ndotl = saturate(dot(normalWS, mainLight.direction));
    half lit = step(_Threshold, ndotl);   // 0 hoặc 1, không có ở giữa

    half3 col = lerp(_BaseColor.rgb * _ShadowColor.rgb, _BaseColor.rgb, lit) * mainLight.color;
    return half4(col, 1);
}
```

Màu bóng là màu gốc nhân với `_ShadowColor` hơi tím, trông tự nhiên hơn màu gốc tối đi. Kéo `_Threshold` để vùng tối rộng hẹp theo ý.

## Bài tập

Viền giữa sáng và tối của toon hiện đang răng cưa. Hãy thay `step` bằng hàm cho viền mềm một chút, độ rộng viền là `0.02`.

<details>
<summary>Xem đáp án</summary>

```hlsl
half lit = smoothstep(_Threshold - 0.02, _Threshold + 0.02, ndotl);
```

`smoothstep` chuyển từ 0 lên 1 trong khoảng rất hẹp quanh `_Threshold`, vẫn giữ cảm giác hai bậc nhưng mép không còn răng cưa.

</details>
