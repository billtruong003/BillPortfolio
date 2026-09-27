---
title: "Debug shader trong Unity: xuất giá trị ra màu và Frame Debugger"
description: "Cách debug shader HLSL trong Unity 6 URP: xuất giá trị ra màu để nhìn, đọc lỗi compile ở Console và Inspector, dùng Frame Debugger xem từng lần vẽ."
section: "Công cụ"
order: 15
tags: ["shader", "debug", "frame debugger", "lỗi compile"]
image: /images/docs/hlsl/debug-shader.webp
imageIdea: "Nhân vật anime đội mũ thám tử, cầm kính lúp soi vào màn hình hiện một quả cầu tô màu đỏ xanh lá xanh dương như bản đồ normal."
imagePrompt: "Edit this image: the character wears a detective hat and holds a magnifying glass up to a monitor. The screen shows a sphere colored in smooth red, green and blue gradients like a normal map debug view. A sticky note on the monitor reads 'return half4(n * 0.5 + 0.5, 1);'. Keep the original art style, 16:9."
---

Shader không có `Debug.Log`, không đặt breakpoint như C# được. Cách debug chính là **biến giá trị thành màu** rồi nhìn. Trang này gom các cách tìm lỗi hay dùng: xuất giá trị ra màu, đọc lỗi compile, và soi từng lần vẽ bằng Frame Debugger.

## Xuất giá trị ra màu

Chỗ người mới hay làm: sửa lung tung rồi đoán xem biến nào sai. Cách đúng: tạm thay dòng `return` cuối `frag` bằng giá trị bạn nghi ngờ, xem nó hiện ra thế nào.

```hlsl
half4 frag(Varyings input) : SV_Target
{
    // ... code tính màu bình thường ...

    return half4(input.uv, 0, 1);            // xem UV: đỏ theo u, xanh lá theo v
}
```

Vài dòng debug hay dùng:

```hlsl
return half4(input.uv, 0, 1);                        // UV có đúng 0..1 không, có bị lật không
return half4(normalize(input.normalWS) * 0.5 + 0.5, 1); // normal: mặt hướng lên trên có màu xanh lá
return half4(ndotl.xxx, 1);                          // độ sáng dưới dạng ảnh xám
return half4(frac(input.positionWS), 1);             // vị trí thế giới lặp mỗi mét
```

Màu chỉ hiện được từ 0 tới 1. Giá trị âm thành đen, giá trị trên 1 thành sáng hết cỡ. Vì vậy normal có khoảng -1..1 phải đổi sang 0..1 bằng `* 0.5 + 0.5` rồi mới nhìn.

## Soi giá trị vượt khoảng

Khi nghi một giá trị bị âm hay vượt 1, tô riêng các vùng đó bằng màu nổi bật:

```hlsl
half value = ndotl;                                  // giá trị cần soi
half3 dbg  = value.xxx;
dbg = lerp(dbg, half3(1, 0, 0), step(1.0, value));   // từ 1 trở lên: đỏ
dbg = lerp(dbg, half3(0, 0, 1), step(value, 0.0));   // từ 0 trở xuống: xanh dương
return half4(dbg, 1);
```

Nhìn một cái là biết vùng nào bất thường, không cần đoán.

> **Lỗi hay gặp:** vật thể có vài điểm đen hoặc nhấp nháy dù code trông đúng. Thường là NaN: `normalize` một vector độ dài 0, chia cho 0, hoặc `pow` với cơ số âm. Xuất từng biến trung gian ra màu theo cách trên, biến nào hiện ra đen kịt ở đúng những điểm đó là thủ phạm.

## Đọc lỗi compile

Shader lỗi thì vật thể hiện màu hồng tím. Có hai chỗ đọc lỗi:

1. **Console**: dòng lỗi có dạng `Shader error in 'Docs/SimpleLambert': undeclared identifier '_BaseColr' at line 42 (on d3d11)`. Số dòng tính từ đầu file `.shader`. Nhấp đúp vào lỗi để mở file.
2. **Inspector của file shader**: chọn file `.shader` trong Project, phần trên Inspector liệt kê lỗi và cảnh báo, cùng dòng SRP Batcher có tương thích hay không.

Những lỗi hay gặp nhất:

| Thông báo | Nguyên nhân thường gặp |
|---|---|
| `undeclared identifier '_X'` | gõ sai tên, hoặc quên khai báo biến trong CBUFFER |
| `syntax error: unexpected token` | thiếu dấu `;` hoặc dấu ngoặc ở dòng ngay trước |
| `implicit truncation of vector type` | gán `float4` vào `float3`, chỉ là cảnh báo, nên viết rõ `.xyz` |
| `cannot open include file` | sai đường dẫn trong `#include` |

Khi báo nhiều lỗi cùng lúc, sửa lỗi **đầu tiên** trước. Các lỗi sau thường là hệ quả của nó.

## Frame Debugger: xem từng lần vẽ

Có lúc shader không lỗi nhưng vật thể không hiện, hoặc hiện sai thứ tự. Frame Debugger cho bạn dừng một khung hình và xem từng lệnh vẽ.

1. Mở **Window > Analysis > Frame Debugger**.
2. Bấm Play, rồi bấm **Enable** trong cửa sổ Frame Debugger. Game dừng lại ở khung hình hiện tại.
3. Danh sách bên trái là các lần vẽ theo thứ tự. Chọn một dòng, Game view chỉ hiện cảnh được vẽ tới bước đó.
4. Bên phải hiện shader, pass, keyword và giá trị các property đang dùng.

Frame Debugger trả lời được các câu như: vật thể có được vẽ không, được vẽ bằng pass nào, `_Hit` lúc đó bằng bao nhiêu, khiên trong suốt vẽ trước hay sau quái. Nó cũng cho biết lần vẽ nào được SRP Batcher gộp lại, xem thêm trang [Properties](/docs/hlsl/properties).

## Bài tập

Shader toon ở trang [Ánh sáng Lambert](/docs/hlsl/anh-sang-lambert) cho ra vùng tối nằm sai phía so với đèn. Viết hai dòng `return` debug theo thứ tự bạn sẽ thử để tìm ra lỗi nằm ở normal hay ở hướng đèn.

<details>
<summary>Xem đáp án</summary>

```hlsl
// Bước 1: xem normal. Mặt hướng lên trên phải xanh lá, mặt hướng về +x phải đỏ.
return half4(normalize(input.normalWS) * 0.5 + 0.5, 1);

// Bước 2: xem hướng đèn. Cả vật thể một màu, phải đổi khi xoay Directional Light.
return half4(GetMainLight().direction * 0.5 + 0.5, 1);
```

Nếu ở bước 1 màu dính chặt vào vật thể khi bạn xoay nó (mặt đang xanh lá quay xuống đất vẫn xanh lá), normal chưa được đổi sang World Space bằng `TransformObjectToWorldNormal`. Nếu bước 1 đúng mà bước 2 không đổi màu khi xoay đèn, kiểm tra xem Directional Light bạn đang xoay có phải đèn chính của scene không, và Pass đã có `Tags { "LightMode"="UniversalForward" }` chưa. Nếu cả hai đều đúng, lỗi nằm ở công thức: thường là đảo dấu, viết `dot(normalWS, -mainLight.direction)`.

</details>
