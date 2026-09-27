---
title: "Cấu trúc một shader URP: ShaderLab, Pass và HLSLPROGRAM"
description: "Mổ từng khối của một file shader Unity URP: Shader, Properties, SubShader, Tags, Pass, HLSLPROGRAM và hai struct Attributes, Varyings."
section: "Bắt đầu"
order: 3
tags: ["shader", "shaderlab", "pass", "hlslprogram", "struct"]
image: /images/docs/hlsl/cau-truc-shader.webp
imageIdea: "Nhân vật anime xếp một hộp cơm bento nhiều tầng, mỗi ngăn dán nhãn Properties, SubShader, Pass, HLSLPROGRAM."
imagePrompt: "Edit this image: the character is carefully stacking a multi-tier bento box on a table. Each tier has a small label: 'Shader', 'Properties', 'SubShader', 'Pass', 'HLSLPROGRAM'. The innermost tier holds two rice balls labeled 'vert' and 'frag'. Keep the original art style, 16:9."
---

Một file `.shader` trong Unity gồm hai lớp. Lớp ngoài là **ShaderLab**, ngôn ngữ riêng của Unity để khai báo thuộc tính và trạng thái vẽ. Lớp trong là **HLSL**, nơi chứa code thật sự chạy trên GPU. Trang này đi qua từng khối của shader một màu ở [trang trước](/docs/hlsl/shader-dau-tien).

## Bức tranh tổng thể

Người mới hay đọc file shader từ trên xuống như đọc C# và bị rối vì các khối lồng nhau. Hãy nhìn nó như hộp lồng hộp:

```hlsl
Shader "Docs/SolidColor"          // tên shader
{
    Properties { ... }             // ô chỉnh trong Inspector
    SubShader                      // một phiên bản cho một pipeline
    {
        Tags { ... }               // thông tin cho URP
        Pass                       // một lần vẽ
        {
            HLSLPROGRAM            // từ đây là code HLSL
            ...
            ENDHLSL
        }
    }
}
```

## Properties: ô chỉnh trong Inspector

```hlsl
Properties
{
    [MainColor] _BaseColor ("Base Color", Color) = (1, 0.3, 0.3, 1)
}
```

Mỗi dòng có dạng `_TenBien ("Tên hiện ra", Kiểu) = giá trị mặc định`. `[MainColor]` đánh dấu đây là màu chính, để code C# gọi `material.color` là trúng biến này. Khối Properties chỉ tạo ô trong Inspector, bản thân nó không đưa giá trị vào HLSL. Phần đó nằm ở `CBUFFER`, xem trang [Properties](/docs/hlsl/properties).

## SubShader và Tags

Một shader có thể có nhiều SubShader, mỗi cái nhắm tới một pipeline hoặc một loại máy. Unity chọn SubShader đầu tiên chạy được.

```hlsl
Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }
```

- `"RenderPipeline"="UniversalPipeline"` nói SubShader này dành cho URP.
- `"RenderType"="Opaque"` nói vật thể đặc, không trong suốt. Trang [Trong suốt](/docs/hlsl/trong-suot) sẽ đổi giá trị này.

## Pass: một lần vẽ

Mỗi Pass là một lần GPU vẽ vật thể. Shader cơ bản chỉ cần một Pass. Pass có thể có `Name` và `Tags` riêng, ví dụ `Tags { "LightMode"="UniversalForward" }` khi cần ánh sáng. Pass không ghi `LightMode` vẫn được URP vẽ như một pass unlit.

## HLSLPROGRAM và các dòng #pragma

```hlsl
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
```

- `#pragma vertex vert`: hàm tên `vert` là vertex shader.
- `#pragma fragment frag`: hàm tên `frag` là fragment shader.
- `#include ... Core.hlsl`: nạp thư viện lõi của URP. Nhờ dòng này mới có `TransformObjectToHClip`, `_Time`, các macro `CBUFFER_START`, `TEXTURE2D`.

> **Lỗi hay gặp:** gõ `#pragma fragment frag` nhưng đặt tên hàm là `Frag`. HLSL phân biệt hoa thường, Unity báo lỗi kiểu `could not find entry point 'frag'` hoặc tương tự. Tên trong `#pragma` phải khớp từng chữ với tên hàm.

## Attributes: dữ liệu vào vertex shader

```hlsl
struct Attributes
{
    float4 positionOS : POSITION;
    float3 normalOS   : NORMAL;
    float2 uv         : TEXCOORD0;
};
```

Đây là dữ liệu Unity lấy từ mesh cho mỗi đỉnh. Phần sau dấu hai chấm gọi là **semantic**: nó nói với GPU lấy dữ liệu nào. `POSITION` là vị trí đỉnh, `NORMAL` là pháp tuyến, `TEXCOORD0` là bộ UV đầu tiên. Tên biến bạn đặt tùy ý, semantic thì phải đúng.

Đuôi `OS` nghĩa là Object Space, tọa độ tính từ tâm vật thể. URP dùng quy ước này khắp nơi: `WS` là World Space, `CS` là Clip Space.

## Varyings: dữ liệu từ vertex sang fragment

```hlsl
struct Varyings
{
    float4 positionCS : SV_POSITION;
    float2 uv         : TEXCOORD0;
};
```

Vertex shader điền struct này, GPU nội suy qua các điểm ảnh rồi đưa cho fragment shader. `SV_POSITION` là bắt buộc: đó là vị trí đỉnh trên màn hình. Các trường còn lại dùng `TEXCOORD0`, `TEXCOORD1`... làm semantic, kể cả khi chúng không phải UV.

## Hai hàm vert và frag

```hlsl
Varyings vert(Attributes input)
{
    Varyings output;
    output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
    output.uv = input.uv;
    return output;
}

half4 frag(Varyings input) : SV_Target
{
    return half4(input.uv, 0, 1);
}
```

`vert` nhận `Attributes`, trả về `Varyings`. `frag` nhận `Varyings`, trả về màu. `: SV_Target` nói giá trị trả về là màu ghi ra màn hình. Đoạn trên tô vật thể theo UV: góc dưới trái đen, góc trên phải vàng.

## Bài tập

Bạn muốn truyền màu đỉnh (vertex color) của mesh sang fragment shader để tô cây cỏ. Hãy viết lại hai struct, biết semantic của vertex color là `COLOR`.

<details>
<summary>Xem đáp án</summary>

```hlsl
struct Attributes
{
    float4 positionOS : POSITION;
    half4  color      : COLOR;
};

struct Varyings
{
    float4 positionCS : SV_POSITION;
    half4  color      : TEXCOORD0;
};

Varyings vert(Attributes input)
{
    Varyings output;
    output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
    output.color = input.color;
    return output;
}

half4 frag(Varyings input) : SV_Target
{
    return input.color;
}
```

Trong `Varyings`, dùng `TEXCOORD0` là cách chắc chắn nhất để chuyển dữ liệu tùy ý sang fragment shader.

</details>
