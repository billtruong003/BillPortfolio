---
title: "Shader là gì? Nhập môn HLSL trong Unity"
description: "Shader là chương trình nhỏ chạy trên GPU để quyết định mỗi điểm ảnh có màu gì. Trang này giải thích vertex shader, fragment shader và lý do game cần shader."
section: "Bắt đầu"
order: 1
tags: ["shader", "hlsl", "gpu", "vertex", "fragment"]
image: /images/docs/hlsl/shader-la-gi.webp
imageIdea: "Nhân vật anime đứng chỉ huy một đội robot tí hon, mỗi robot cầm cọ tô đúng một ô vuông trên tấm canvas khổng lồ hình một con rồng pixel."
imagePrompt: "Edit this image: the character stands like a conductor in front of a giant canvas made of square pixels showing a pixel-art dragon. Hundreds of tiny robots each paint exactly one square at the same time. A small sign on the easel reads 'GPU'. Keep the original art style, 16:9."
---

Shader là một chương trình nhỏ chạy trên card đồ họa (GPU). Nó quyết định mỗi đỉnh của mô hình nằm ở đâu trên màn hình và mỗi điểm ảnh có màu gì. Trong Unity, shader được viết bằng ngôn ngữ HLSL, bọc trong một lớp vỏ tên là ShaderLab.

## CPU và GPU làm việc khác nhau thế nào

Người mới hay nghĩ shader giống một script C#: chạy một lần, xử lý từ trên xuống dưới. Thật ra không phải vậy. Script C# chạy trên CPU, làm từng việc một. Shader chạy trên GPU, và GPU chạy **cùng một đoạn code cho hàng triệu điểm ảnh cùng lúc**.

Màn hình 1920x1080 có khoảng hai triệu điểm ảnh. Mỗi khung hình, GPU gọi shader của bạn cho từng điểm đó, 60 lần mỗi giây. Vì thế shader không nhớ gì giữa các điểm ảnh, không hỏi được "điểm bên cạnh đang màu gì". Mỗi lần chạy chỉ biết dữ liệu của chính nó.

Hãy hình dung một đội thợ sơn, mỗi người chỉ được giao đúng một ô gạch và một tờ hướng dẫn giống hệt nhau. Tờ hướng dẫn đó chính là shader.

## Hai giai đoạn: vertex và fragment

Một shader cơ bản có hai hàm chính.

- **Vertex shader** chạy một lần cho mỗi đỉnh (vertex) của mô hình. Việc chính của nó là đổi vị trí đỉnh từ không gian của vật thể sang không gian màn hình. Muốn làm lá cờ bay hay cỏ đung đưa thì đẩy đỉnh ở đây.
- **Fragment shader** chạy một lần cho mỗi điểm ảnh mà mô hình phủ lên. Nó trả về một màu. Nhấp nháy khi trúng đòn, tô gradient, chiếu sáng kiểu anime đều làm ở đây.

Giữa hai giai đoạn, GPU tự nội suy dữ liệu: nếu một đỉnh màu đỏ, đỉnh kia màu xanh, các điểm ảnh ở giữa sẽ nhận màu pha dần.

Đây là hai hàm đó viết bằng HLSL, tách ra khỏi file cho dễ nhìn:

```hlsl
Varyings vert(Attributes input)
{
    Varyings output;
    output.positionCS = TransformObjectToHClip(input.positionOS.xyz); // đặt đỉnh lên màn hình
    return output;
}

half4 frag(Varyings input) : SV_Target
{
    return half4(1, 0.2, 0.2, 1); // mọi điểm ảnh tô màu đỏ máu
}
```

`vert` nhận thông tin một đỉnh và trả về vị trí trên màn hình. `frag` trả về màu dạng `half4` gồm đỏ, xanh lá, xanh dương và độ trong suốt, mỗi kênh từ 0 tới 1.

## Vì sao game cần shader

Mọi thứ bạn thấy trong game đều đi qua shader, kể cả khi bạn chưa viết dòng nào. Material mặc định của Unity cũng dùng shader có sẵn như `Universal Render Pipeline/Lit`. Bạn viết shader riêng khi cần một hiệu ứng mà shader có sẵn không làm được:

- Quái chớp trắng khi trúng đòn.
- Mặt nước cuộn sóng, dung nham chảy.
- Nhân vật tô bóng hai tông kiểu hoạt hình.
- Khiên năng lượng trong suốt, hiệu ứng tan biến khi quái chết.

Làm những việc này bằng C# (đổi màu từng pixel trên CPU) sẽ chậm tới mức không chơi được. Trên GPU, chúng gần như miễn phí.

> **Lỗi hay gặp:** mở file shader cũ trên mạng, thấy `CGPROGRAM` và `#include "UnityCG.cginc"` rồi chép vào project URP. Đó là cú pháp của Built-in Render Pipeline. Bộ tài liệu này dùng Unity 6 với URP, nên mọi shader đều viết trong `HLSLPROGRAM` và include thư viện của URP.

## Về bộ tài liệu này

Các trang tiếp theo đi từ shader một màu tới texture, ánh sáng và trong suốt. Mỗi trang có code dán thẳng vào Unity 6 (URP 17) là chạy. Trang sau: [Shader đầu tiên](/docs/hlsl/shader-dau-tien).

## Bài tập

Với mỗi hiệu ứng sau, cho biết nên làm chủ yếu ở vertex shader hay fragment shader:

1. Cỏ lắc lư theo gió.
2. Quái chuyển sang màu trắng khi bị bắn trúng.
3. Mặt biển nhấp nhô lên xuống.
4. Thanh máu đổi từ xanh sang đỏ theo lượng máu.

<details>
<summary>Xem đáp án</summary>

1. Vertex shader: phải dịch chuyển vị trí đỉnh của ngọn cỏ.
2. Fragment shader: hình dạng giữ nguyên, chỉ đổi màu từng điểm ảnh.
3. Vertex shader: đẩy đỉnh của lưới mặt biển lên xuống theo thời gian.
4. Fragment shader: chọn màu cho từng điểm ảnh dựa trên lượng máu.

</details>
