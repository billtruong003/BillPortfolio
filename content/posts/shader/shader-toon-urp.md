---
title: "Toon shader cho Unity URP: từ một quả cầu tới cả một map"
date: "2026-09-27"
lang: vi
series: "shader"
order: 1
excerpt: "Viết toon shader cho Unity 6 URP từng bước một: ramp, bóng đổ, specular, rim, viền inverted hull. Mỗi bước đều có ảnh render thật để bạn so với màn hình của mình."
coverImage: "/images/lab/shaders/toon-map-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Toon"]
published: true
featured: true
---

![Toon shader trên map prototype: Burrow nhảy, Cacti đung đưa, mọi vật thể cùng một shader](/images/lab/shaders/toon-map.webp)

Toàn bộ cảnh trên dùng đúng một shader: sàn, tường, khối prototype, tảng đá, cái cây, và cả hai con quái. Bài này viết shader đó từ con số không. Mình bắt đầu trên một quả cầu, vì trên quả cầu mọi lỗi ánh sáng đều lộ ra rất rõ, rồi mới đưa lên cả map.

Mỗi phần thêm đúng một ý vào shader, và đi kèm một ảnh chụp từ Unity của đúng đoạn code đó. Bạn gõ tới đâu thì so với ảnh tới đó. Nếu màn hình của bạn khác ảnh, lỗi nằm ở phần vừa gõ chứ không phải ở chỗ khác.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Màu phẳng</span><span>Lambert</span><span>Hai tông</span><span>Ramp</span><span>Bóng đổ</span><span>Ambient</span><span>Specular</span><span>Rim</span><span>Viền</span></div></div>

**Môi trường:** Unity 6 (6000.3), URP 17.3, Forward+. Cần bật **Depth Texture** trên URP Asset nếu bạn định dùng shader này cạnh các hiệu ứng đọc depth như nước hay fog.

**Tải mã nguồn:** [bill-toon-urp.zip](/downloads/shaders/bill-toon-urp.zip), gồm shader hoàn chỉnh, shader của từng bước, texture, material và script bake normal cho phần viền. Danh sách chi tiết ở [cuối bài](#file-và-texture-trong-bài).

## Chuẩn bị: file input dùng chung

Một shader URP thường có nhiều pass: pass vẽ màu, pass đổ bóng, pass ghi depth. Người mới hay khai báo biến riêng trong từng pass, rồi thấy material không còn chạy với SRP Batcher. SRP Batcher chỉ gộp được draw call khi mọi pass của shader nhìn thấy **cùng một khối** `UnityPerMaterial`. Vì vậy mình tách hết property ra một file input, pass nào cũng include file này.

**Shaders/Toon/BillToonInput.hlsl**

```hlsl
#ifndef BILL_TOON_INPUT_INCLUDED
#define BILL_TOON_INPUT_INCLUDED

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

TEXTURE2D(_BaseMap);        SAMPLER(sampler_BaseMap);
TEXTURE2D(_RampMap);        SAMPLER(sampler_RampMap);
TEXTURE2D(_EmissionMap);    SAMPLER(sampler_EmissionMap);

CBUFFER_START(UnityPerMaterial)
    float4 _BaseMap_ST;
    half4  _BaseColor;
    half   _Cutoff;
    half   _RampOffset;
    half4  _SpecularColor;
    half   _Glossiness;
    half   _SpecularSoftness;
    half4  _RimColor;
    half   _RimSize;
    half   _RimLightAlign;
    half4  _EmissionColor;
    half4  _OutlineColor;
    half   _OutlineWidth;
CBUFFER_END

half4 SampleBaseColor(float2 uv)
{
    return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, uv) * _BaseColor;
}

#endif
```

Texture nằm ngoài `CBUFFER`, còn mọi số và màu nằm bên trong, kể cả `_BaseMap_ST` (tiling và offset của texture). Một vài biến như `_EmissionColor` hay `_OutlineWidth` tới cuối bài mới dùng, nhưng khai báo sẵn từ đầu để khối này không phải đổi nữa.

## Bước 1: màu phẳng

Bắt đầu bằng shader đơn giản nhất: lấy màu texture nhân với màu tint, trả về luôn, không có ánh sáng.

**Shaders/Toon/BillToon.shader** (khung ban đầu)

```hlsl
Shader "Bill/Toon"
{
    Properties
    {
        [MainTexture] _BaseMap ("Base Map", 2D) = "white" {}
        [MainColor] _BaseColor ("Base Color", Color) = (1, 1, 1, 1)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" }

        HLSLINCLUDE
        #include "BillToonInput.hlsl"
        ENDHLSL

        Pass
        {
            Name "ToonForward"
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex ToonVertex
            #pragma fragment ToonFragment
            #include "BillToonForwardPass.hlsl"
            ENDHLSL
        }
    }
}
```

**Shaders/Toon/BillToonForwardPass.hlsl**

```hlsl
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

struct Attributes
{
    float4 positionOS : POSITION;
    float3 normalOS   : NORMAL;
    float2 uv         : TEXCOORD0;
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
    float3 positionWS : TEXCOORD1;
    half3  normalWS   : TEXCOORD2;
};

Varyings ToonVertex(Attributes input)
{
    Varyings output;
    VertexPositionInputs positionInputs = GetVertexPositionInputs(input.positionOS.xyz);
    output.positionCS = positionInputs.positionCS;
    output.positionWS = positionInputs.positionWS;
    output.normalWS = TransformObjectToWorldNormal(input.normalOS);
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    return output;
}

half4 ToonFragment(Varyings input) : SV_Target
{
    half3 albedo = SampleBaseColor(input.uv).rgb;
    return half4(albedo, 1);
}
```

Vertex shader đã chuẩn bị sẵn vị trí world và normal world cho các bước sau. `GetVertexPositionInputs` là hàm của URP, tính luôn một lần cả vị trí object, world, view và clip, nên không phải tự nhân từng ma trận.

![Bước 1: quả cầu tô một màu, trông như hình tròn dán lên màn hình](/images/lab/toon/toon-01-unlit.webp)

Quả cầu giờ chỉ là một hình tròn. Mắt người đọc hình khối nhờ chỗ sáng chỗ tối, và shader này chưa có chỗ tối nào.

## Bước 2: Lambert

Cách đơn giản nhất để có sáng tối là định luật Lambert: một mặt càng quay thẳng về phía đèn thì càng sáng. Tích vô hướng `dot(N, L)` giữa normal và hướng tới đèn cho đúng giá trị đó: 1 khi mặt nhìn thẳng vào đèn, 0 khi vuông góc, âm khi quay lưng.

```hlsl
half4 ToonFragment(Varyings input) : SV_Target
{
    half3 albedo = SampleBaseColor(input.uv).rgb;
    half3 normalWS = normalize(input.normalWS);
    Light light = GetMainLight();
    half nDotL = dot(normalWS, light.direction);

    half3 color = albedo * saturate(nDotL) * light.color;
    return half4(color, 1);
}
```

Normal phải `normalize` lại trong fragment, vì khi nội suy giữa ba đỉnh của tam giác, độ dài của nó ngắn đi. `saturate` kẹp giá trị âm về 0.

![Bước 2: Lambert, nửa quay lưng với đèn đen kịt](/images/lab/toon/toon-02-lambert.webp)

Hình khối đã hiện ra, nhưng đây là ánh sáng kiểu vật lý: chuyển sáng tối mềm, và cả nửa quay lưng với đèn thì đen kịt. Toon shading muốn điều ngược lại: chỉ vài mảng màu rõ ràng, và vùng tối vẫn phải có màu.

## Bước 3: tách thành hai tông

Muốn có mảng màu thì phải chặt giá trị ánh sáng thành bậc. Trước khi chặt, mình đổi Lambert sang **half-Lambert**: `nDotL * 0.5 + 0.5`. Giá trị đi từ 0 tới 1 trên cả quả cầu, thay vì bị kẹp về 0 ở nguyên nửa sau. Cách này Valve dùng từ Half-Life, và nó cho ngưỡng tách tông một khoảng giá trị đều để làm việc.

```hlsl
half halfLambert = nDotL * 0.5h + 0.5h;
half lit = smoothstep(0.49h, 0.51h, halfLambert);
half3 color = albedo * lerp(0.35h, 1.0h, lit) * light.color;
```

Để tách tông, nhiều người dùng `step(0.5, halfLambert)`. Kết quả đúng là hai tông, nhưng đường ranh giới bị răng cưa, vì `step` nhảy từ 0 lên 1 trong đúng một pixel. `smoothstep` với khoảng 0.49 tới 0.51 làm việc tương tự, nhưng có một dải chuyển rất hẹp để khử răng cưa.

![Bước 3: hai tông rõ ràng, nhưng vùng tối chỉ là màu gốc bị làm đục](/images/lab/toon/toon-03-twotone.webp)

Đã ra chất toon. Nhưng vùng tối lúc này chỉ là màu cam nhân với 0.35, nên trông đục và bẩn. Nhìn các game cel-shaded bạn sẽ thấy vùng tối thường ngả sang một màu khác hẳn: tím, xanh, đỏ gạch. Đó là quyết định của họa sĩ, và quyết định đó không nên nằm cứng trong code.

## Bước 4: ramp texture

Ramp là một texture nằm ngang, rất mỏng. Trục U là lượng ánh sáng: bên trái là chỗ tối nhất, bên phải là chỗ sáng nhất. Shader không tự quyết màu vùng tối nữa, chỉ tra màu trong ramp theo half-Lambert.

```hlsl
half lightAmount = nDotL * 0.5h + 0.5h;
half3 ramp = SAMPLE_TEXTURE2D_LOD(_RampMap, sampler_RampMap, half2(saturate(lightAmount + _RampOffset), 0.5h), 0).rgb;
half3 color = albedo * ramp * light.color;
```

Thêm vào khối `Properties`:

```hlsl
[NoScaleOffset] _RampMap ("Ramp (U = light amount)", 2D) = "white" {}
_RampOffset ("Ramp Offset", Range(-0.5, 0.5)) = 0
```

`_RampOffset` dịch cả dải sáng tối sang trái hoặc phải, để chỉnh vùng tối rộng hay hẹp ngay trong Inspector mà không cần vẽ lại ramp.

Ramp mình dùng rộng 256 pixel, cao 4 pixel: nửa trái màu tím nhạt, nửa phải màu trắng, ở giữa có 3 pixel chuyển. Khi import có ba thiết lập bắt buộc:

- **Wrap Mode: Clamp.** Nếu để Repeat, giá trị sát 1 sẽ lấy nhầm màu ở mép trái, và chỗ sáng nhất trên vật thể lóe lên một chấm tối.
- **Generate Mipmaps: tắt.** Ở xa, mipmap trộn hai tông thành một màu xám ở giữa, và vật thể mất chất toon.
- **Compression: None.** Nén block làm lem mép giữa các tông.

Ramp không có mip, nên trong code mình đọc nó bằng `SAMPLE_TEXTURE2D_LOD` ở mức 0 thay vì `SAMPLE_TEXTURE2D`. Kết quả y hệt, nhưng GPU không phải tính đạo hàm để chọn mip. Chuyện này thành quan trọng ở bước sau: hàm ánh sáng sẽ chạy trong vòng lặp đèn Forward+, và nếu shader có `clip` phía trước (như shader dissolve), compiler sẽ từ chối một lệnh cần đạo hàm nằm trong vòng lặp có số lần chạy thay đổi.

![Bước 4: vùng tối giờ là màu tím đỏ do ramp quyết định](/images/lab/toon/toon-04-ramp.webp)

Đổi ramp là đổi cả phong cách. Ramp ba bậc cho ra kiểu anime có vùng bán tối, còn ramp ấm cho ra ánh chiều. Trong gói tải về có sẵn cả ba loại.

## Bước 5: bóng đổ

Quả cầu chưa đổ bóng xuống sàn, và cũng chưa nhận bóng của vật khác. Việc này gồm hai phần tách biệt: một pass mới để quả cầu **ghi** vào shadow map, và phần sửa trong pass màu để **đọc** shadow map.

Phần đọc cần các keyword shadow của URP. Không có chúng, `GetMainLight` luôn trả về vật không bị che.

```hlsl
#pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
#pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
```

Trong fragment, truyền tọa độ shadow vào `GetMainLight`, rồi đưa bóng vào **trước khi** tra ramp:

```hlsl
Light light = GetMainLight(TransformWorldToShadowCoord(input.positionWS));
half nDotL = dot(normalWS, light.direction);
half lightAmount = (nDotL * 0.5h + 0.5h) * light.shadowAttenuation;
half3 ramp = SAMPLE_TEXTURE2D_LOD(_RampMap, sampler_RampMap, half2(saturate(lightAmount + _RampOffset), 0.5h), 0).rgb;
```

Người mới hay nhân bóng vào **sau** ramp: `color *= shadowAttenuation`. Làm vậy thì bóng đổ là một màu đen riêng, còn vùng tối của vật là màu tím trong ramp, hai thứ không ăn nhập với nhau. Đưa bóng vào tọa độ U của ramp thì mọi chỗ không có ánh sáng, dù do quay lưng với đèn hay do bị che, đều rơi vào cùng một màu.

Phần ghi là pass `ShadowCaster`. Mình để nó trong một file riêng, vì shader nước và các shader khác cũng dùng lại.

**Shaders/Common/BillUtilityPasses.hlsl** (trích phần shadow)

```hlsl
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"

float3 _LightDirection;
float3 _LightPosition;

UtilityVaryings ShadowCasterVertex(UtilityAttributes input)
{
    UtilityVaryings output = (UtilityVaryings)0;
    float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
    float3 normalWS = TransformObjectToWorldNormal(input.normalOS);

#if defined(_CASTING_PUNCTUAL_LIGHT_SHADOW)
    float3 lightDirectionWS = normalize(_LightPosition - positionWS);
#else
    float3 lightDirectionWS = _LightDirection;
#endif

    float4 positionCS = TransformWorldToHClip(ApplyShadowBias(positionWS, normalWS, lightDirectionWS));
#if UNITY_REVERSED_Z
    positionCS.z = min(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#else
    positionCS.z = max(positionCS.z, UNITY_NEAR_CLIP_VALUE);
#endif

    output.positionCS = positionCS;
    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
    return output;
}
```

`_LightDirection` và `_LightPosition` do URP gán trước khi vẽ shadow map, mình chỉ việc khai báo. `ApplyShadowBias` đẩy đỉnh lùi một chút theo hướng đèn và theo normal, để bề mặt không tự đổ bóng lên chính nó. Hai dòng kẹp `z` cuối cùng giữ lại những vật nằm sau near plane của đèn, nếu không thì bóng của chúng biến mất.

![Bước 5: quả cầu đổ bóng xuống sàn, mép vùng tối sạch](/images/lab/toon/toon-05-shadows.webp)

Nếu mép vùng tối của bạn bị răng cưa thành từng bậc, đó là shadow acne: bề mặt tự đổ bóng lên chính nó. Với shader thường thì acne chỉ là những vệt mờ, còn với toon, ramp khuếch đại nó thành những mảng tối lởm chởm. Chọn đèn, đổi **Bias** sang Custom, rồi tăng Depth và Normal lên khoảng 1. Toon cần bias cao hơn một shader lit bình thường.

## Bước 6: ánh sáng môi trường

Nhìn lại ảnh bước 5, vùng tối là màu phẳng giống hệt nhau ở mọi hướng. Ngoài đời, mặt quay lên trời nhận chút ánh sáng trời, mặt quay xuống đất nhận ánh sáng dội từ đất. URP gói phần này thành spherical harmonics (SH), đọc bằng một dòng:

```hlsl
color += SampleSH(normalWS) * albedo;
```

![Bước 6: vùng tối sáng lên và đổi sắc nhẹ theo hướng mặt](/images/lab/toon/toon-06-ambient.webp)

Thay đổi nhìn nhỏ, nhưng quan trọng khi đặt vật vào map: nếu bầu trời trong Lighting settings màu xanh, vùng tối sẽ ngả xanh theo, và vật thể thuộc về cảnh chứ không còn dán lên cảnh.

## Bước 7: specular

Specular kiểu Blinn-Phong so normal với half vector, tức hướng nằm giữa hướng tới đèn và hướng tới mắt. Giá trị càng gần 1 thì mặt đó càng phản chiếu đèn thẳng vào mắt.

```hlsl
half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
half3 halfDir = SafeNormalize(light.direction + viewDirWS);
half specular = pow(saturate(dot(normalWS, halfDir)), _Glossiness);
specular = smoothstep(0.5h - _SpecularSoftness, 0.5h + _SpecularSoftness, specular) * step(0.0h, nDotL) * light.shadowAttenuation;
color += _SpecularColor.rgb * specular * light.color;
```

Specular thật mềm dần ra ngoài. Toon cần một chấm có mép rõ, nên mình lại dùng `smoothstep` quanh ngưỡng 0.5. `_Glossiness` quyết định chấm to hay nhỏ. Hai điều kiện cuối giữ cho chấm không hiện ra ở mặt quay lưng với đèn, hoặc nằm trong bóng.

![Bước 7: một chấm sáng mép rõ phía trên bên trái](/images/lab/toon/toon-07-specular.webp)

## Bước 8: rim light

Rim là viền sáng quanh rìa vật thể, thứ tách nhân vật khỏi nền trong rất nhiều game cel-shaded. Rìa là nơi mặt vật thể gần vuông góc với hướng nhìn, nên `1 - dot(V, N)` lớn nhất ở đó.

```hlsl
half rimDot = 1.0h - saturate(dot(viewDirWS, normalWS));
half rim = rimDot * pow(saturate(nDotL), _RimLightAlign);
rim = smoothstep(_RimSize - 0.01h, _RimSize + 0.01h, rim) * light.shadowAttenuation;
color += _RimColor.rgb * rim * light.color;
```

Nếu chỉ lấy `rimDot`, viền sáng bao kín cả vòng quanh vật thể và trông như vật tự phát sáng. Nhân thêm với `nDotL` (có mũ `_RimLightAlign` để chỉnh độ lan) thì rim chỉ nằm ở phía có đèn, giống ánh sáng hắt từ phía sau. Ý tưởng này mình học từ bài toon shader của [Roystan](https://roystan.net/articles/toon-shader/).

![Bước 8: viền sáng mảnh ở rìa trái, phía có đèn](/images/lab/toon/toon-08-rim.webp)

## Bước 9: viền bằng inverted hull

Có hai cách phổ biến để vẽ viền. Cách hậu kỳ quét depth và normal trên toàn màn hình. Cách **inverted hull** vẽ thêm một lớp vỏ to hơn vật thể một chút, lật mặt, tô màu tối. Mình chọn inverted hull vì viền đi theo từng vật: đổi màu viền cho riêng nhân vật, hay tắt viền cho sàn, đều chỉ là một thông số trên material.

Pass viền dùng `Cull Front`: chỉ vẽ mặt sau của lớp vỏ. Phần vỏ nằm sau vật thể bị chính vật thể che, chỉ còn phần lòi ra quanh rìa, và phần đó thành viền.

```hlsl
Pass
{
    Name "Outline"
    Tags { "LightMode" = "SRPDefaultUnlit" }
    Cull Front

    HLSLPROGRAM
    #pragma vertex OutlineVertex
    #pragma fragment OutlineFragment
    #include "BillToonOutlinePass.hlsl"
    ENDHLSL
}
```

`SRPDefaultUnlit` là LightMode mà URP vẽ thêm ngay sau pass chính. Nhờ vậy một shader có được hai pass màu mà không cần renderer feature nào.

Lần đầu viết, gần như ai cũng đẩy đỉnh theo normal trong object space: `positionOS + normalOS * width`. Viền khi đó to lên khi vật lại gần và mỏng dần khi vật ra xa. Muốn viền luôn dày đúng số pixel, phải đẩy trong clip space:

```hlsl
float4 OutlineVertex(OutlineAttributes input) : SV_POSITION
{
    float4 positionCS = TransformObjectToHClip(input.positionOS.xyz);
    float3 normalCS = TransformWorldToHClipDir(TransformObjectToWorldNormal(input.normalOS));

    // Clip space rộng 2 đơn vị trên toàn màn hình: 1 pixel = 2 / độ phân giải.
    float2 offset = normalize(normalCS.xy) * _OutlineWidth * 2.0 / _ScaledScreenParams.xy;
    positionCS.xy += offset * positionCS.w;
    return positionCS;
}
```

Nhân với `positionCS.w` vì GPU sẽ chia cho `w` khi chuyển sang tọa độ màn hình. Nhân trước để triệt tiêu phép chia đó, thì độ lệch còn nguyên số pixel ở mọi khoảng cách.

Trên quả cầu, viền này chạy tốt. Đặt một khối lập phương bên cạnh là thấy vấn đề ngay:

![Trái: viền theo normal của mesh, hở ở các góc. Phải: viền theo normal đã làm mượt, liền một vòng](/images/lab/toon/toon-outline-compare.webp)

Khối lập phương có cạnh sắc, nên mỗi góc thực ra là ba đỉnh chồng lên nhau, mỗi đỉnh mang normal của một mặt. Đẩy theo ba hướng khác nhau thì lớp vỏ bị xé ra ở góc, như ảnh bên trái. Cách sửa là tính cho mỗi vị trí một normal trung bình, lưu vào một kênh UV còn trống (mình dùng UV3), rồi pass viền đẩy theo normal đó.

Việc tính chỉ cần làm một lần lúc import model, bằng `AssetPostprocessor`:

**Editor/SmoothNormalBaker.cs**

```csharp
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

public class SmoothNormalBaker : AssetPostprocessor
{
    void OnPostprocessModel(GameObject root)
    {
        foreach (var filter in root.GetComponentsInChildren<MeshFilter>())
            Bake(filter.sharedMesh);
        foreach (var skinned in root.GetComponentsInChildren<SkinnedMeshRenderer>())
            Bake(skinned.sharedMesh);
    }

    public static void Bake(Mesh mesh)
    {
        if (mesh == null) return;
        var vertices = mesh.vertices;
        var normals = mesh.normals;
        if (normals == null || normals.Length != vertices.Length) return;

        var sums = new Dictionary<Vector3Int, Vector3>();
        Vector3Int Key(Vector3 v) => Vector3Int.RoundToInt(v * 10000f);
        for (int i = 0; i < vertices.Length; i++)
        {
            sums.TryGetValue(Key(vertices[i]), out var sum);
            sums[Key(vertices[i])] = sum + normals[i];
        }

        var smooth = new Vector3[vertices.Length];
        for (int i = 0; i < vertices.Length; i++)
            smooth[i] = sums[Key(vertices[i])].normalized;
        mesh.SetUVs(3, smooth);
    }
}
```

Các đỉnh trùng vị trí được gom bằng một key làm tròn tới 0.1 mm, cộng dồn normal rồi chuẩn hóa. Trong shader, pass viền đọc kênh này và quay về normal thường nếu kênh trống:

```hlsl
struct OutlineAttributes
{
    float4 positionOS     : POSITION;
    float3 normalOS       : NORMAL;
    float3 smoothNormalOS : TEXCOORD3;
};

float3 normalOS = dot(input.smoothNormalOS, input.smoothNormalOS) > 0.01 ? input.smoothNormalOS : input.normalOS;
```

Có một cái bẫy mình vấp phải khi làm bài này: mesh có sẵn của Unity như Sphere hay Cube **không có** UV3, và khi mesh thiếu kênh đó, giá trị shader đọc được không chắc là 0. Viền trên quả cầu của mình bị đứt từng đoạn cho tới khi bake UV3 cho nó. Mesh tạo bằng code hay primitive cũng phải chạy `SmoothNormalBaker.Bake`, không riêng file model.

![Bước 9: quả cầu và khối lập phương cùng có viền liền](/images/lab/toon/toon-09b-outlinesmoothnormals.webp)

## Hai pass ít ai nhắc: DepthOnly và DepthNormals

Tới đây shader nhìn đã xong, nhưng còn thiếu hai pass không làm thay đổi gì trên màn hình, và chính vì vậy mà hay bị bỏ quên. Khi renderer có SSAO, hoặc bất cứ thứ gì cần normal của cảnh, URP dựng depth texture bằng một lượt vẽ trước chỉ gọi pass `DepthNormals`. Vật nào dùng shader thiếu pass này thì không có mặt trong depth texture.

Mình biết điều này vì đã mất cả buổi với nó. Shader nước trong bài sau đọc depth để tính độ sâu, và nước cứ sâu như nhau ở khắp nơi. Hóa ra các tảng đá dùng một bản toon shader cũ không có pass `DepthNormals`, nên với depth texture, dưới nước không có gì cả.

```hlsl
Pass
{
    Name "DepthNormals"
    Tags { "LightMode" = "DepthNormals" }
    ZWrite On

    HLSLPROGRAM
    #pragma vertex DepthVertex
    #pragma fragment DepthNormalsFragment
    #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT
    #include "../Common/BillUtilityPasses.hlsl"
    ENDHLSL
}
```

Pass `DepthOnly` giống hệt nhưng chỉ ghi depth. Hai hàm fragment nằm trong `BillUtilityPasses.hlsl` của gói tải về.

## Đưa lên cả map

Shader hoàn chỉnh gom các bước trên thành một hàm `ToonLighting(light, ...)`, rồi gọi hàm đó cho đèn chính và cho từng đèn phụ. Với Forward+, URP duyệt đèn phụ theo cluster, nên vòng lặp có hai phần:

```hlsl
#if defined(_ADDITIONAL_LIGHTS)
    InputData inputData = (InputData)0;
    inputData.positionWS = input.positionWS;
    inputData.normalizedScreenSpaceUV = screenUV;
    uint lightCount = GetAdditionalLightsCount();

    #if USE_CLUSTER_LIGHT_LOOP
    for (uint lightIndex = 0; lightIndex < min(URP_FP_DIRECTIONAL_LIGHTS_COUNT, MAX_VISIBLE_LIGHTS); lightIndex++)
    {
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, baseColor.rgb, normalWS, viewDirWS);
    }
    #endif

    LIGHT_LOOP_BEGIN(lightCount)
        Light light = GetAdditionalLight(lightIndex, input.positionWS, half4(1, 1, 1, 1));
        color += ToonLighting(light, baseColor.rgb, normalWS, viewDirWS);
    LIGHT_LOOP_END
#endif
```

`LIGHT_LOOP_BEGIN` là macro của URP. Với Forward+ nó duyệt các đèn thuộc cluster của pixel, còn với Forward thường nó là vòng `for` bình thường. Biến `inputData` phải có vị trí và UV màn hình vì macro dùng hai giá trị đó để tìm cluster. Vòng `for` phía trên xử lý riêng các đèn directional phụ, vì Forward+ không xếp chúng vào cluster.

Ngoài ra shader hoàn chỉnh còn có: alpha clip cho lá cây, emission map, SSAO nhân vào phần ambient, và fog. Mỗi phần chỉ vài dòng, bạn đọc trong file tải về.

![Toon shader trên map prototype](/images/lab/shaders/toon-map-still.webp)

Map dùng texture prototype dạng lưới, mỗi ô lớn là 1 mét. Để lưới không bị kéo giãn trên các khối có kích thước khác nhau, UV của từng khối được tính theo mét lúc tạo mesh, chứ không dùng khối Cube có sẵn rồi scale lên. Đá, xương rồng và cây mỗi thứ chỉ là một material toon với base map khác nhau. Lá cây bật alpha clip, tắt viền, và render hai mặt.

## File và texture trong bài

**[bill-toon-urp.zip](/downloads/shaders/bill-toon-urp.zip)** (49 KB). Giải nén rồi chép nguyên thư mục `BillShaderLab` vào `Assets`. Các file `.meta` đi kèm giữ sẵn import settings và nối material với texture, nên mở ra là dùng được ngay, không phải chỉnh lại gì.

| Thư mục | Nội dung |
| --- | --- |
| `Shaders/Toon` | Shader `Bill/Toon` hoàn chỉnh cùng ba file HLSL: input, forward pass, outline pass |
| `Shaders/Common` | Pass ShadowCaster, DepthOnly, DepthNormals dùng chung |
| `Shaders/Tutorial/Toon` | Mỗi bước trong bài là một shader riêng, từ `01 Unlit` tới `09b Outline Smooth Normals`, để bạn gán lên quả cầu và so sánh |
| `Editor` | `SmoothNormalBaker.cs`, bake normal cho viền vào UV3 lúc import model |
| `Materials` | `Toon_Studio` của quả cầu và năm material prototype của map |

Từng file lẻ ở dưới. Chữ nghiêng là thư mục cần đặt file vào, tính từ `BillShaderLab`: các shader include nhau bằng đường dẫn tương đối, đặt sai thư mục là Unity báo không tìm thấy file.

<div class="lesson-files"><strong>Shader hoàn chỉnh</strong><em>Shaders/Toon</em>
<a href="/downloads/shaders/files/toon/BillToon.shader" download>BillToon.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/toon/BillToonInput.hlsl" download>BillToonInput.hlsl<small>1 KB</small></a>
<a href="/downloads/shaders/files/toon/BillToonForwardPass.hlsl" download>BillToonForwardPass.hlsl<small>4 KB</small></a>
<a href="/downloads/shaders/files/toon/BillToonOutlinePass.hlsl" download>BillToonOutlinePass.hlsl<small>2 KB</small></a>
</div>
<div class="lesson-files"><strong>Pass dùng chung</strong><em>Shaders/Common</em>
<a href="/downloads/shaders/files/toon/BillUtilityPasses.hlsl" download>BillUtilityPasses.hlsl<small>3 KB</small></a>
</div>
<div class="lesson-files"><strong>Script editor</strong><em>Editor</em>
<a href="/downloads/shaders/files/toon/SmoothNormalBaker.cs" download>SmoothNormalBaker.cs<small>1 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Toon</em>
<a href="/downloads/shaders/files/toon/ToonTutorialPass.hlsl" download>ToonTutorialPass.hlsl<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/ToonTutorialOutline.hlsl" download>ToonTutorialOutline.hlsl<small>1 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_01_Unlit.shader" download>Toon_01_Unlit.shader<small>2 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_02_Lambert.shader" download>Toon_02_Lambert.shader<small>2 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_03_TwoTone.shader" download>Toon_03_TwoTone.shader<small>2 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_04_Ramp.shader" download>Toon_04_Ramp.shader<small>2 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_05_Shadows.shader" download>Toon_05_Shadows.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_06_Ambient.shader" download>Toon_06_Ambient.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_07_Specular.shader" download>Toon_07_Specular.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_08_Rim.shader" download>Toon_08_Rim.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_09a_OutlineMeshNormals.shader" download>Toon_09a_OutlineMeshNormals.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/toon/Toon_09b_OutlineSmoothNormals.shader" download>Toon_09b_OutlineSmoothNormals.shader<small>3 KB</small></a>
</div>

Texture dùng trong bài (bấm vào để tải ảnh gốc):

<div class="lesson-assets">
<a href="/downloads/shaders/textures/toon/Ramp_TwoTone.png"><img class="strip" src="/downloads/shaders/textures/toon/Ramp_TwoTone.png" alt="Ramp hai tông"><strong>Ramp_TwoTone</strong><span>Ramp của quả cầu và map: vùng tối tím nhạt, vùng sáng trắng</span></a>
<a href="/downloads/shaders/textures/toon/Ramp_ThreeTone.png"><img class="strip" src="/downloads/shaders/textures/toon/Ramp_ThreeTone.png" alt="Ramp ba tông"><strong>Ramp_ThreeTone</strong><span>Thêm một dải trung gian giữa tối và sáng</span></a>
<a href="/downloads/shaders/textures/toon/Ramp_Warm.png"><img class="strip" src="/downloads/shaders/textures/toon/Ramp_Warm.png" alt="Ramp tông ấm"><strong>Ramp_Warm</strong><span>Vùng tối hồng đất, vùng sáng kem ấm</span></a>
<a href="/downloads/shaders/textures/toon/Proto_Dark.png"><img src="/downloads/shaders/textures/toon/Proto_Dark.png" alt="Prototype tối"><strong>Proto_Dark</strong><span>Tường sau và tường bên</span></a>
<a href="/downloads/shaders/textures/toon/Proto_Light.png"><img src="/downloads/shaders/textures/toon/Proto_Light.png" alt="Prototype sáng"><strong>Proto_Light</strong><span>Sàn map</span></a>
<a href="/downloads/shaders/textures/toon/Proto_Orange.png"><img src="/downloads/shaders/textures/toon/Proto_Orange.png" alt="Prototype cam"><strong>Proto_Orange</strong><span>Bậc thang và hai thùng gỗ</span></a>
<a href="/downloads/shaders/textures/toon/Proto_Teal.png"><img src="/downloads/shaders/textures/toon/Proto_Teal.png" alt="Prototype xanh ngọc"><strong>Proto_Teal</strong><span>Bệ đứng và dốc</span></a>
<a href="/downloads/shaders/textures/toon/Proto_Purple.png"><img src="/downloads/shaders/textures/toon/Proto_Purple.png" alt="Prototype tím"><strong>Proto_Purple</strong><span>Cột</span></a>
</div>

Ramp import với **Wrap Mode: Clamp**, tắt **Generate Mip Maps**, **Compression: None**. Prototype import với **Wrap Mode: Repeat** để lưới lặp liền mạch trên các khối lớn.

## Tham khảo

- [Roystan: Toon Shader](https://roystan.net/articles/toon-shader/), ý tưởng rim theo hướng đèn và specular mép cứng.
- [Catlike Coding: Rendering, phần 4](https://catlikecoding.com/unity/tutorials/rendering/part-4/), nền tảng Lambert và Blinn-Phong.
- [Alexander Ameye: 5 ways to draw an outline](https://alexanderameye.github.io/notes/rendering-outlines/), so sánh các cách vẽ viền.
- [Minions Art](https://minionsart.github.io/tutorials/), nguồn cảm hứng cho phong cách và rất nhiều mẹo toon.
- [Unity: cấu trúc shader URP](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/writing-shaders-urp-basic-unlit-structure.html).

Nhân vật, cây và đá trong ảnh là asset từ Asset Store (Monsters Ultimate Pack, Stylized Vegetation của LuxArt, Low Poly Desert), chỉ dùng để minh họa và không có trong gói tải về.
