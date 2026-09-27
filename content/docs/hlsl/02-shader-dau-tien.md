---
title: "Shader đầu tiên trong Unity 6 URP"
description: "Tạo file .shader đầu tiên trong Unity 6 URP, gắn vào material và cube, tô một màu. Kèm cách xử lý khi vật thể hiện màu hồng."
section: "Bắt đầu"
order: 2
tags: ["shader", "urp", "unlit", "material"]
image: /images/docs/hlsl/shader-dau-tien.webp
imageIdea: "Nhân vật anime cầm một khối lập phương màu hồng chóe, mặt ngơ ngác, bên cạnh là tờ giấy nhớ ghi 'Shader error?'."
imagePrompt: "Edit this image: the character holds a bright magenta pink cube in both hands with a confused face. A yellow sticky note next to them reads 'Shader error?'. On the desk behind, a laptop screen shows a Unity editor. Keep the original art style, 16:9."
---

Trang này đi từ con số 0 tới một cube được tô bằng shader của chính bạn. Shader chỉ tô một màu, nhưng đã có đủ bộ khung mà mọi shader URP về sau đều dùng lại.

## Chuẩn bị project

Bạn cần một project Unity 6 dùng URP. Cách nhanh nhất là tạo project mới từ template **Universal 3D** trong Unity Hub. Project tạo từ template 3D (Built-in) sẽ không chạy được shader trong bộ tài liệu này.

## Tạo file shader

1. Trong cửa sổ Project, chuột phải vào thư mục `Assets` > **Create > Shader > Unlit Shader**. Đặt tên `SolidColor`.
2. Mở file bằng editor code. Unity sinh sẵn một mẫu dùng `CGPROGRAM`, đó là mẫu cũ của Built-in. **Xóa hết** nội dung đó.
3. Dán đoạn code dưới đây vào và lưu lại.

```hlsl
Shader "Docs/SolidColor"
{
    Properties
    {
        [MainColor] _BaseColor ("Base Color", Color) = (1, 0.3, 0.3, 1)
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
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                return _BaseColor;
            }
            ENDHLSL
        }
    }
}
```

Dòng đầu `Shader "Docs/SolidColor"` là tên hiện trong menu chọn shader. Dấu `/` tạo thư mục con, nên shader này sẽ nằm trong mục **Docs**. Từng khối còn lại được giải thích ở trang [Cấu trúc một shader](/docs/hlsl/cau-truc-shader).

## Tạo material và gán cho cube

Shader không gắn thẳng vào vật thể. Nó đi qua một **material**: material giữ shader cùng các giá trị cụ thể như màu, texture.

1. Chuột phải trong Project > **Create > Material**, đặt tên `M_Slime`.
2. Chọn material, ở ô **Shader** trên cùng của Inspector, chọn **Docs > SolidColor**.
3. Tạo cube: **GameObject > 3D Object > Cube**.
4. Kéo `M_Slime` từ Project thả vào cube trong Scene.

Cube giờ có màu đỏ hồng nhạt. Đổi ô **Base Color** trong Inspector của material sang xanh lá, cube đổi màu ngay, như một con slime.

Bạn sẽ thấy cube phẳng lì, không có mặt sáng mặt tối. Shader này là loại **unlit**: không tính ánh sáng, chỉ trả về đúng một màu. Chiếu sáng có ở trang [Ánh sáng Lambert](/docs/hlsl/anh-sang-lambert).

> **Lỗi hay gặp:** cube hiện màu hồng tím chói (magenta). Đây là cách Unity báo "shader này không dùng được". Có hai nguyên nhân chính. Một là shader lỗi compile: bấm vào file shader, Inspector sẽ liệt kê lỗi kèm số dòng, Console cũng có dòng như `Shader error in 'Docs/SolidColor': undeclared identifier '_BaseColr'`. Hai là sai pipeline: project đang dùng Built-in mà shader có tag `"RenderPipeline"="UniversalPipeline"`, hoặc ngược lại bạn dùng shader Built-in (surface shader, `Standard`) trong project URP. Kiểm tra ở **Edit > Project Settings > Graphics**: ô Default Render Pipeline phải có một URP Asset.

## Đổi tên shader không làm mất material

Tên trong dòng `Shader "..."` và tên file có thể khác nhau. Material nhớ shader theo file, nên đổi chuỗi tên thì material vẫn giữ liên kết. Chỉ có đường dẫn trong menu là thay đổi. Nên giữ tên file và tên shader giống nhau để dễ tìm.

## Bài tập

Tạo thêm shader `Docs/Coin` màu vàng kim `(1, 0.8, 0.1, 1)`, material `M_Coin`, rồi gán cho một **Sphere**. Nếu bạn nhân bản file `SolidColor.shader` bằng Ctrl+D, cần sửa chỗ nào để hai shader không đụng nhau?

<details>
<summary>Xem đáp án</summary>

Tạo file `Coin.shader`, dán cùng khung code và đổi hai chỗ:

```hlsl
Shader "Docs/Coin"
{
    Properties
    {
        [MainColor] _BaseColor ("Base Color", Color) = (1, 0.8, 0.1, 1)
    }
    // phần SubShader giữ nguyên như SolidColor
```

Ctrl+D chỉ đổi tên file, chuỗi tên bên trong vẫn là `Docs/SolidColor`. Hai shader trùng tên thì Unity không phân biệt được khi tìm theo tên (menu chọn shader, `Shader.Find`), rất dễ gán nhầm. Luôn sửa dòng `Shader "..."` ngay sau khi nhân bản.

</details>
