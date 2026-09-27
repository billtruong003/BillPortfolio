---
title: "Swizzle trong HLSL: .xyzw và .rgba"
description: "Swizzle trong HLSL là cách lấy, đảo và gán từng thành phần của vector bằng .xyzw hoặc .rgba. Kèm các lỗi compile hay gặp khi dùng sai."
section: "Cơ bản"
order: 5
tags: ["hlsl", "swizzle", "vector"]
image: /images/docs/hlsl/swizzle.webp
imageIdea: "Nhân vật anime đang đổi chỗ bốn khối đồ chơi màu đỏ, xanh lá, xanh dương, trắng trên kệ, bảng phía trên ghi 'rgba → bgra'."
imagePrompt: "Edit this image: the character is swapping four toy blocks on a shelf, colored red, green, blue and white, lettered R, G, B, A. A small chalkboard above reads 'rgba -> bgra'. The character looks playful. Keep the original art style, 16:9."
---

Swizzle là cách viết ngắn để lấy hoặc sắp xếp lại các thành phần của một vector. Thay vì tạo vector mới rồi gán từng số, bạn viết `color.rgb` hay `pos.xz` là xong. Code shader dùng swizzle ở gần như mọi dòng.

## Hai bộ tên: xyzw và rgba

Một `float4` có bốn thành phần. Bạn gọi chúng bằng `x y z w` hoặc `r g b a`, hai bộ tên trỏ vào cùng một chỗ.

```hlsl
half4 slime = half4(0.2, 0.9, 0.3, 1.0);

half red   = slime.r;   // 0.2, giống slime.x
half alpha = slime.a;   // 1.0, giống slime.w
half3 rgb  = slime.rgb; // (0.2, 0.9, 0.3)
```

Quy ước: dùng `xyzw` khi vector là vị trí, hướng, UV. Dùng `rgba` khi vector là màu. GPU không quan tâm, nhưng người đọc code sẽ hiểu nhanh hơn.

> **Lỗi hay gặp:** trộn hai bộ tên trong một lần swizzle, ví dụ `slime.xg`. HLSL báo lỗi `invalid subscript 'xg'`. Chọn một bộ và giữ nguyên trong cả biểu thức: `slime.xy` hoặc `slime.rg`.

## Lấy một phần của vector

```hlsl
float3 playerPosWS = float3(4, 1.5, -2);

float2 groundPos = playerPosWS.xz;        // bỏ độ cao, lấy vị trí trên mặt đất
float  height    = playerPosWS.y;          // chỉ lấy độ cao
float  distOnMap = length(groundPos);     // khoảng cách tới tâm bản đồ, bỏ qua độ cao
```

`.xz` rất hay gặp trong game: vẽ vòng tròn chọn mục tiêu dưới chân nhân vật, minimap, sương mù theo mặt đất. Tất cả đều cần vị trí trên mặt phẳng ngang.

## Đảo thứ tự và lặp thành phần

Swizzle cho phép viết thành phần theo thứ tự bất kỳ, và lặp lại một thành phần nhiều lần.

```hlsl
half4 fire  = half4(1.0, 0.5, 0.1, 1.0);
half3 ice   = fire.bgr;     // (0.1, 0.5, 1.0): đảo kênh, lửa thành băng
float2 uv   = input.uv;
float2 flip = uv.yx;        // đổi chỗ u và v, texture xoay ngang
half3 gray  = fire.rrr;     // lặp kênh đỏ cho cả ba kênh
```

Cũng dùng được trên số đơn: `half v = 0.5; half3 g = v.xxx;` tạo ra `(0.5, 0.5, 0.5)`.

## Gán vào một phần của vector

Swizzle đứng bên trái dấu `=` cũng được. Chỉ những thành phần được gọi tên bị thay, phần còn lại giữ nguyên.

```hlsl
half4 col = half4(0.8, 0.2, 0.2, 1.0);

col.a   = 0.5;            // trong suốt một nửa, màu giữ nguyên
col.rgb *= 0.6;           // tối đi, alpha giữ nguyên 0.5
col.gb  = half2(0, 0);    // chỉ còn kênh đỏ
```

Kiểu này rất hay dùng ở cuối hàm `frag`: tính màu xong, chỉnh riêng alpha rồi trả về.

> **Lỗi hay gặp:** lặp thành phần ở phía bên trái, ví dụ `col.rr = half2(1, 0);`. Một thành phần không thể nhận hai giá trị cùng lúc, HLSL báo lỗi. Lặp thì chỉ được ở phía bên phải.

## Ghép vector từ vector nhỏ hơn

```hlsl
half3 tint  = half3(1, 0.4, 0.4);
half  fade  = 0.7;
half4 final = half4(tint, fade);        // (1, 0.4, 0.4, 0.7)

float2 uv   = input.uv;
float4 packed = float4(uv, uv * 2.0);   // hai bộ UV trong một float4
```

Hàm tạo vector nhận bất kỳ tổ hợp nào, miễn tổng số thành phần đúng bằng kích thước vector.

## Bài tập

Cho `half4 tex` là màu đọc từ texture của một viên ngọc. Viết một dòng trả về màu đã đảo kênh đỏ và xanh dương, giữ nguyên xanh lá và alpha. Sau đó viết thêm một dòng giảm alpha còn một nửa mà không đụng vào màu.

<details>
<summary>Xem đáp án</summary>

```hlsl
half4 gem = tex.bgra;   // đổi chỗ r và b, g và a giữ nguyên
gem.a *= 0.5;           // chỉ alpha giảm một nửa
return gem;
```

</details>
