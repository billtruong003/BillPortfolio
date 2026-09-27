---
title: "Kiểu dữ liệu trong HLSL: float, half, vector và ma trận"
description: "Các kiểu dữ liệu cơ bản trong HLSL cho Unity: float, half, int, bool, vector float2 float3 float4, ma trận float4x4, và khi nào nên dùng half."
section: "Cơ bản"
order: 4
tags: ["hlsl", "kiểu dữ liệu", "float", "half", "vector"]
image: /images/docs/hlsl/kieu-du-lieu.webp
imageIdea: "Nhân vật anime đứng sau quầy tiệm thuốc trong game RPG, xếp các lọ thuốc to nhỏ khác nhau dán nhãn half, float, float3, float4x4."
imagePrompt: "Edit this image: the character is behind a fantasy potion shop counter, arranging glass bottles of different sizes on a shelf. Labels read 'half', 'float', 'float3', and a big crate labeled 'float4x4'. Keep the original art style, 16:9."
---

Giống C#, HLSL bắt mọi biến phải có kiểu. Khác C# ở chỗ HLSL có sẵn kiểu vector và ma trận, vì GPU gần như chỉ làm toán với vị trí, hướng và màu.

## Số thực: float và half

Người mới hay khai báo mọi thứ bằng `float` rồi thắc mắc vì sao shader mẫu của Unity lại dùng `half` cho màu. Lý do là độ chính xác và tốc độ.

- `float`: số thực 32 bit. Dùng cho vị trí, UV, thời gian, mọi thứ cần chính xác.
- `half`: số thực 16 bit trên điện thoại, khoảng 3 chữ số thập phân, giá trị lớn nhất khoảng 65504. Trên PC, `half` thường được chạy như `float`.

```hlsl
float  timeAlive = _Time.y;    // thời gian tăng mãi, cần float
float2 uv        = input.uv;   // UV cần chính xác, nhất là texture lớn
half   hpRatio   = 0.75;       // tỉ lệ máu 0..1, half là đủ
half4  hitColor  = half4(1, 1, 1, 1);
```

Quy tắc dễ nhớ: màu, hệ số 0 tới 1, pháp tuyến đã chuẩn hóa thì dùng `half`. Vị trí, UV, thời gian thì dùng `float`.

> **Lỗi hay gặp:** lưu thời gian vào `half` để làm hiệu ứng cuộn. Chơi được vài phút, trên điện thoại hiệu ứng bắt đầu giật cục vì `half` không đủ chữ số để phân biệt 300.01 với 300.02. Trên PC bạn không thấy lỗi này, nên phải test trên máy thật.

## Số nguyên và đúng sai: int, bool

```hlsl
int  waveCount = 3;
bool isFrozen  = hpRatio < 0.3;

for (int i = 0; i < waveCount; i++)
{
    // lặp qua từng đợt sóng
}
```

Shader cơ bản ít dùng `int` và `bool`. Thay vì `if`, người viết shader thường dùng hàm `step` và `lerp` để chọn giá trị, xem trang [Hàm có sẵn](/docs/hlsl/ham-co-san).

## Vector: float2, float3, float4

Vector là nhiều số đi chung một biến. Số ở cuối tên là số thành phần.

```hlsl
float2 uv       = float2(0.5, 0.5);        // tọa độ texture
float3 posWS    = float3(0, 1.8, 10);      // vị trí trong thế giới
half4  slimeCol = half4(0.2, 0.9, 0.3, 1); // màu RGBA
half3  white    = 1;                       // gán một số cho cả ba thành phần
```

Phép toán trên vector chạy theo từng thành phần. Cộng hai `float3` là cộng x với x, y với y, z với z. Nhân hai màu cũng vậy: `slimeCol * half4(1, 0.5, 0.5, 1)` giảm kênh xanh lá và xanh dương còn một nửa.

Lấy từng thành phần bằng `.x .y .z .w` hoặc `.r .g .b .a`. Trang [Swizzle](/docs/hlsl/swizzle) nói kỹ về cách này.

## Ma trận: float4x4

Ma trận 4x4 dùng để đổi tọa độ giữa các không gian. Bạn hiếm khi tự tạo ma trận, chủ yếu dùng ma trận Unity cung cấp và hàm `mul` để nhân.

```hlsl
float4x4 objectToWorld = GetObjectToWorldMatrix();
float3 positionWS = mul(objectToWorld, float4(input.positionOS.xyz, 1.0)).xyz;
```

Hai dòng trên làm đúng việc của hàm `TransformObjectToWorld(input.positionOS.xyz)` trong URP. Trong thực tế cứ gọi hàm có sẵn cho gọn, nhưng biết bên trong là một phép `mul` sẽ giúp bạn đọc code người khác.

## Ép kiểu và cảnh báo truncation

```hlsl
float4 col4 = float4(1, 0, 0, 1);
float3 col3 = col4;       // cảnh báo: implicit truncation of vector type
float3 ok   = col4.rgb;   // viết rõ ràng, không cảnh báo
```

HLSL tự cắt bớt thành phần thừa nhưng báo cảnh báo trong Console. Nên viết rõ `.rgb` hoặc `.xyz` để người đọc biết bạn cố ý.

## Bài tập

Khai báo các biến cho một viên đạn phép trong shader, chọn `float` hay `half` cho hợp lý: vị trí trong thế giới, màu lõi đạn, độ sáng từ 0 tới 1, thời gian đạn đã bay, UV.

<details>
<summary>Xem đáp án</summary>

```hlsl
float3 bulletPosWS = float3(2, 1, 5);          // vị trí: float
half4  coreColor   = half4(0.4, 0.8, 1, 1);     // màu: half
half   glow        = 0.8;                       // hệ số 0..1: half
float  flightTime  = 12.5;                      // thời gian: float
float2 uv          = input.uv;                  // UV: float
```

</details>
