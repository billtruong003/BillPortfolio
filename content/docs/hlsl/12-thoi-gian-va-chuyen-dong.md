---
title: "Thời gian trong shader: _Time, nhấp nháy khi trúng đòn và nước chảy"
description: "Dùng biến _Time trong shader Unity URP để làm quái nhấp nháy khi trúng đòn và cuộn texture mặt nước hai lớp, kèm script C# bật hiệu ứng."
section: "Hiệu ứng"
order: 12
tags: ["shader", "_Time", "hit flash", "nước", "hiệu ứng"]
image: /images/docs/hlsl/thoi-gian-va-chuyen-dong.webp
imageIdea: "Nhân vật anime ngồi trên tảng đá bên dòng suối, tay cầm chiếc đồng hồ bấm giờ ghi '_Time.y', mặt nước lấp lánh trôi theo hai hướng."
imagePrompt: "Edit this image: the character sits on a rock beside a sparkling stream, holding up a stopwatch whose screen reads '_Time.y'. The water surface shows two layers of ripples flowing in slightly different directions. Keep the original art style, 16:9."
---

Shader không có hàm `Update`. Muốn thứ gì đó chuyển động, bạn dựa vào biến thời gian mà Unity gửi vào mỗi khung hình: `_Time`. Trang này dùng `_Time` cho hai hiệu ứng quen thuộc: quái nhấp nháy khi trúng đòn và mặt nước chảy.

## Biến _Time

`_Time` là một `float4` có sẵn khi include `Core.hlsl`, không cần khai báo:

| Thành phần | Giá trị |
|---|---|
| `_Time.x` | thời gian / 20 |
| `_Time.y` | thời gian tính bằng giây |
| `_Time.z` | thời gian x 2 |
| `_Time.w` | thời gian x 3 |

Gần như lúc nào bạn cũng dùng `_Time.y` rồi tự nhân với tốc độ của mình. Code dễ đọc hơn khi thấy rõ `_Time.y * _Speed`.

```hlsl
half pulse = sin(_Time.y * 8.0) * 0.5 + 0.5;   // dao động 0..1, khoảng 1.3 lần mỗi giây
```

> **Lỗi hay gặp:** hiệu ứng đứng im trong cửa sổ Scene dù code đúng. Scene view chỉ vẽ lại khi có thay đổi. Bật **Always Refresh** trong menu hiệu ứng trên thanh công cụ của Scene, hoặc bấm Play để xem.

## Nhấp nháy khi trúng đòn

Người mới hay đặt cả logic trúng đòn vào shader, rồi bí vì shader không biết khi nào quái bị bắn. Chia việc cho rõ: **C# biết khi nào trúng đòn**, shader chỉ lo **nhấp nháy ra sao**. C# bật một số `_Hit` từ 0 lên 1 trong một lúc, shader dùng `_Time` để chớp trắng trong khoảng đó.

```hlsl
Shader "Docs/HitBlink"
{
    Properties
    {
        [MainTexture] _MainTex ("Texture", 2D) = "white" {}
        [MainColor] _BaseColor ("Base Color", Color) = (1, 1, 1, 1)
        _FlashColor ("Flash Color", Color) = (1, 1, 1, 1)
        _BlinkSpeed ("Blinks Per Second", Float) = 12
        _Hit ("Hit", Range(0, 1)) = 0
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
                half4 _FlashColor;
                float _BlinkSpeed;
                half  _Hit;
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
                half4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv) * _BaseColor;

                // frac chạy 0..1 mỗi chu kỳ, step cắt thành nửa sáng nửa tối
                half blink = step(0.5, frac(_Time.y * _BlinkSpeed));
                col.rgb = lerp(col.rgb, _FlashColor.rgb, blink * _Hit);
                return col;
            }
            ENDHLSL
        }
    }
}
```

Script C# gắn lên con quái, gọi `Flash()` khi nó mất máu:

```csharp
using System.Collections;
using UnityEngine;

public class HitBlink : MonoBehaviour
{
    static readonly int HitId = Shader.PropertyToID("_Hit");

    [SerializeField] float duration = 0.3f;

    Material material;

    void Awake() => material = GetComponent<Renderer>().material;

    void OnDestroy() => Destroy(material);

    public void Flash()
    {
        StopAllCoroutines();
        StartCoroutine(FlashRoutine());
    }

    IEnumerator FlashRoutine()
    {
        material.SetFloat(HitId, 1f);
        yield return new WaitForSeconds(duration);
        material.SetFloat(HitId, 0f);
    }
}
```

Với `_BlinkSpeed = 12` và `duration = 0.3`, quái chớp khoảng 3 đến 4 lần rồi trở lại bình thường. `_Hit` và `lerp` giúp shader không cần `if`: khi `_Hit = 0`, `blink * _Hit` luôn bằng 0.

## Nước chảy bằng hai lớp UV cuộn

Cuộn một texture theo một hướng trông như băng chuyền, không giống nước. Mẹo quen thuộc: đọc **cùng một** texture gợn sóng hai lần, mỗi lần cuộn một hướng và một tỉ lệ khác nhau, rồi trộn lại. Hai lớp chồng nhau làm hoa văn không bao giờ lặp y hệt.

Chỉ phần khác so với shader trên:

```hlsl
// Properties
_WaterColor ("Water Color", Color) = (0.1, 0.45, 0.7, 1)
_FlowA ("Flow A (XY)", Vector) = (0.05, 0.02, 0, 0)
_FlowB ("Flow B (XY)", Vector) = (-0.03, 0.04, 0, 0)

// CBUFFER thêm
half4 _WaterColor;
float4 _FlowA;
float4 _FlowB;

// frag
half4 frag(Varyings input) : SV_Target
{
    float2 uvA = input.uv + _FlowA.xy * _Time.y;
    float2 uvB = input.uv * 1.7 + _FlowB.xy * _Time.y;   // tỉ lệ khác để hai lớp lệch nhau

    half rippleA = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uvA).r;
    half rippleB = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, uvB).r;
    half ripple  = (rippleA + rippleB) * 0.5;

    half3 col = _WaterColor.rgb + ripple * 0.35;   // chỗ gợn sáng lên
    return half4(col, 1);
}
```

Texture nên là ảnh gợn sóng xám trắng, Wrap Mode đặt `Repeat` như ở trang [Texture và UV](/docs/hlsl/texture-va-uv).

## Bài tập

Làm viên ngọc hồi máu nhấp nháy mềm thay vì chớp tắt: độ sáng tăng giảm đều bằng `sin`, sáng nhất bằng màu `_GlowColor`, tối nhất bằng `_BaseColor`, chu kỳ theo `_PulseSpeed`.

<details>
<summary>Xem đáp án</summary>

```hlsl
half4 frag(Varyings input) : SV_Target
{
    half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv);
    half pulse = sin(_Time.y * _PulseSpeed) * 0.5 + 0.5;   // 0..1
    half3 col = tex.rgb * lerp(_BaseColor.rgb, _GlowColor.rgb, pulse);
    return half4(col, 1);
}
```

Nhớ thêm `_GlowColor` và `_PulseSpeed` vào cả Properties lẫn CBUFFER.

</details>
