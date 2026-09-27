---
title: "Hàm có sẵn trong HLSL: lerp, step, smoothstep và các hàm hay dùng"
description: "Các hàm có sẵn hay dùng nhất trong HLSL: lerp, saturate, clamp, step, smoothstep, frac, abs, sin, dot, length, normalize, kèm ví dụ làm game."
section: "Cơ bản"
order: 6
tags: ["hlsl", "lerp", "step", "smoothstep", "hàm"]
image: /images/docs/hlsl/ham-co-san.webp
imageIdea: "Nhân vật anime mở một hộp đồ nghề, bên trong mỗi dụng cụ khắc tên một hàm: lerp, step, smoothstep, saturate."
imagePrompt: "Edit this image: the character opens a wooden toolbox on a workbench. Each tool inside has an engraved name: a wrench 'lerp', a hammer 'step', a smooth file 'smoothstep', a clamp 'saturate'. The character holds up the 'lerp' wrench proudly. Keep the original art style, 16:9."
---

HLSL có sẵn một bộ hàm toán chạy rất nhanh trên GPU. Viết shader phần lớn là ghép các hàm này lại. Trang này đi qua những hàm bạn sẽ gặp ở gần như mọi shader, mỗi hàm một ví dụ trong game.

## lerp: pha giữa hai giá trị

`lerp(a, b, t)` trả về `a` khi `t = 0`, trả về `b` khi `t = 1`, ở giữa thì pha theo tỉ lệ.

```hlsl
half3 fullHp  = half3(0.2, 0.9, 0.2);   // xanh lá
half3 lowHp   = half3(0.9, 0.1, 0.1);   // đỏ
half3 barCol  = lerp(lowHp, fullHp, _HpRatio); // máu càng ít càng đỏ
```

## saturate và clamp: giữ giá trị trong khoảng

`saturate(x)` ép `x` về khoảng 0 tới 1. `clamp(x, min, max)` ép về khoảng bạn chọn.

```hlsl
half glow  = saturate(_Charge * 1.5);        // sạc quá 1 vẫn chỉ sáng tối đa
float zoom = clamp(_Zoom, 0.5, 3.0);         // giới hạn mức zoom
```

`saturate` gần như miễn phí trên GPU, nên người viết shader dùng nó thay cho `clamp(x, 0, 1)`.

## step và smoothstep: cắt ngưỡng

`step(edge, x)` trả về 0 nếu `x < edge`, trả về 1 nếu `x >= edge`. Đây là cách viết `if` không cần `if`.

```hlsl
half isLow = step(_HpRatio, 0.25);   // 1 khi máu <= 25%, ngược lại 0
```

> **Lỗi hay gặp:** đảo thứ tự tham số thành `step(x, edge)`. Code vẫn compile, nhưng kết quả ngược hẳn: vùng lẽ ra sáng thì tối. Nhớ: ngưỡng đứng trước, giá trị cần so đứng sau.

`smoothstep(edge0, edge1, x)` giống `step` nhưng chuyển mềm từ 0 lên 1 trong khoảng `edge0` tới `edge1`. Rất hợp để làm viền mềm.

```hlsl
float d = length(input.uv - 0.5);                // khoảng cách tới tâm quad
half shield = 1 - smoothstep(0.45, 0.5, d);      // hình tròn khiên, viền mềm
```

## frac và abs: lặp và đối xứng

`frac(x)` lấy phần lẻ: `frac(2.7) = 0.7`. Giá trị tăng mãi sẽ thành một chuỗi răng cưa lặp từ 0 tới 1.

```hlsl
half stripe = step(0.5, frac(input.uv.x * 10)); // 10 sọc cho thanh cảnh báo
```

`abs(x)` bỏ dấu âm. Kết hợp với UV tạo hình đối xứng qua tâm.

```hlsl
float centerDist = abs(input.uv.x - 0.5) * 2;   // 0 ở giữa, 1 ở hai mép
```

## sin: dao động

`sin(x)` chạy lên xuống từ -1 tới 1. Nhân với thời gian là có chuyển động lặp.

```hlsl
half pulse = sin(_Time.y * 6) * 0.5 + 0.5;      // đổi -1..1 thành 0..1
half3 col  = lerp(_BaseColor.rgb, 1, pulse * 0.3); // rương báu sáng nhấp nháy
```

`* 0.5 + 0.5` là mẹo quen thuộc để đổi khoảng -1..1 về 0..1.

## dot, length, normalize: làm việc với hướng

- `length(v)`: độ dài vector, tức khoảng cách.
- `normalize(v)`: giữ hướng, đưa độ dài về 1.
- `dot(a, b)`: với hai vector độ dài 1, kết quả là 1 khi cùng hướng, 0 khi vuông góc, -1 khi ngược hướng.

```hlsl
float3 toPlayer = normalize(_PlayerPosWS.xyz - positionWS);
float3 facing   = normalize(normalWS);
half   seen     = saturate(dot(facing, toPlayer)); // mặt nào quay về phía người chơi thì sáng
```

`dot` là nền tảng của chiếu sáng, xem trang [Ánh sáng Lambert](/docs/hlsl/anh-sang-lambert).

> **Lỗi hay gặp:** `normalize` một vector độ dài 0 cho ra NaN (không phải số). Điểm ảnh đó hiện đen hoặc nhấp nháy lạ. Xảy ra khi hai vị trí trùng nhau, ví dụ `_PlayerPosWS` chưa được gán nên bằng đúng gốc tọa độ.

## Bài tập

Viết đoạn code trong `frag` cho thanh máu vẽ trên một quad: phần bên trái tới `_HpRatio` có màu pha từ đỏ (máu thấp) sang xanh lá (máu đầy), phần còn lại màu xám tối `(0.15, 0.15, 0.15)`. Dùng `step` và `lerp`, không dùng `if`.

<details>
<summary>Xem đáp án</summary>

```hlsl
half3 fillCol  = lerp(half3(0.9, 0.1, 0.1), half3(0.2, 0.9, 0.2), _HpRatio);
half3 emptyCol = half3(0.15, 0.15, 0.15);
half  filled   = step(input.uv.x, _HpRatio);   // 1 khi uv.x <= _HpRatio
half3 col      = lerp(emptyCol, fillCol, filled);
return half4(col, 1);
```

`_HpRatio` cần được khai báo trong Properties và CBUFFER, xem trang [Properties](/docs/hlsl/properties).

</details>
