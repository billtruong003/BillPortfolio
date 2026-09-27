---
title: "Vòng lặp for trong C#"
description: "Vòng lặp for trong C#: ba phần khởi tạo, điều kiện, bước nhảy, cách đếm ngược, bước nhảy khác 1 và lỗi lệch một (off-by-one) người mới hay mắc."
section: "Điều khiển luồng"
order: 16
tags: ["vòng lặp", "for", "off-by-one"]
image: /images/docs/csharp/vong-lap-for.webp
imageIdea: "Nhân vật anime leo cầu thang tháp có 10 bậc đánh số từ 0 tới 9, trên tường ghi 'for (int i = 0; i < 10; i++)', bậc thứ 10 bị gạch chéo."
imagePrompt: "Edit this image: the character is climbing a stone tower staircase with steps numbered 0 to 9. The wall shows carved text 'for (int i = 0; i < 10; i++)'. An eleventh step above is crossed out with a red X. Keep the original art style, 16:9."
---

Vòng lặp `for` lặp một khối lệnh với số lần biết trước: bắn 5 viên đạn, sinh 10 con quái, đếm ngược 3 giây trước khi vào trận. Mọi thứ điều khiển vòng lặp nằm gọn trên một dòng, nên nhìn là biết nó chạy bao nhiêu lần.

## Cấu trúc for

```csharp
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine($"Bắn viên thứ {i}");
}
// Bắn viên thứ 1
// Bắn viên thứ 2
// Bắn viên thứ 3
// Bắn viên thứ 4
// Bắn viên thứ 5
```

Trong ngoặc tròn có ba phần, ngăn nhau bằng dấu chấm phẩy:

1. `int i = 1`: **khởi tạo**, chạy đúng một lần trước khi vào vòng.
2. `i <= 5`: **điều kiện**, kiểm tra trước mỗi vòng. Sai thì dừng.
3. `i++`: **bước nhảy**, chạy sau mỗi vòng.

Biến `i` chỉ sống bên trong vòng lặp. Ra ngoài dùng `i` sẽ báo lỗi CS0103.

Viết lại bằng [while](/docs/csharp/vong-lap-while), bạn sẽ thấy `for` chỉ là cách gom ba phần đó về một chỗ:

```csharp
int i = 1;
while (i <= 5)
{
    Console.WriteLine($"Bắn viên thứ {i}");
    i++;
}
```

## Đếm từ 0

Lập trình viên thường đếm từ 0, vì mảng và danh sách trong C# đánh số từ 0. Vòng lặp chạy 10 lần viết chuẩn như sau:

```csharp
for (int i = 0; i < 10; i++)
{
    Console.Write(i + " ");
}
// 0 1 2 3 4 5 6 7 8 9
```

Mẫu `i = 0; i < n` luôn chạy đúng `n` lần. Nhớ mẫu này, bạn sẽ ít bị lỗi lệch một.

## Lỗi lệch một (off-by-one)

Lỗi lệch một là khi vòng lặp chạy nhiều hơn hoặc ít hơn đúng một lần. Nó không có mã lỗi, chương trình vẫn chạy, chỉ là kết quả sai.

Ví dụ muốn sinh đúng 3 con quái:

```csharp
int enemyCount = 3;
for (int i = 0; i <= enemyCount; i++)
{
    Console.WriteLine($"Sinh quái số {i}");
}
// Sinh quái số 0
// Sinh quái số 1
// Sinh quái số 2
// Sinh quái số 3
```

Ra 4 con, không phải 3. Lý do là bắt đầu từ `0` mà dùng `<=`, nên cả `0` lẫn `3` đều được tính.

> **Lỗi hay gặp:** trộn hai kiểu đếm. Bắt đầu từ `0` thì dùng `<`, bắt đầu từ `1` thì dùng `<=`. Khi duyệt mảng, viết `i <= items.Length` sẽ đọc lố một ô và chương trình dừng với `IndexOutOfRangeException`.

Mẹo kiểm tra: thử với số nhỏ, như `n = 1`. Vòng lặp của bạn có chạy đúng một lần không?

## Đếm ngược

Đổi ba phần: bắt đầu từ số lớn, điều kiện `>=` hoặc `>`, và bước nhảy `i--`.

```csharp
for (int i = 3; i >= 1; i--)
{
    Console.WriteLine(i);
}
Console.WriteLine("Chiến!");
// 3
// 2
// 1
// Chiến!
```

> **Lỗi hay gặp:** đếm ngược mà quên đổi `i++` thành `i--`, như `for (int i = 3; i >= 1; i++)`. `i` cứ tăng mãi nên điều kiện `i >= 1` luôn đúng. Vòng lặp chạy tới khi `int` tràn số, gần như là vô hạn.

## Bước nhảy khác 1

Bước nhảy không bắt buộc là `++`. Muốn đi mỗi lần 5 đơn vị thì dùng `i += 5`:

```csharp
for (int level = 5; level <= 20; level += 5)
{
    Console.WriteLine($"Level {level}: mở khoá kỹ năng mới");
}
// Level 5: mở khoá kỹ năng mới
// Level 10: mở khoá kỹ năng mới
// Level 15: mở khoá kỹ năng mới
// Level 20: mở khoá kỹ năng mới
```

## Cộng dồn trong vòng lặp

Việc hay làm nhất với `for` là tính tổng. Khai báo biến tổng **bên ngoài** vòng lặp, cộng dần bên trong:

```csharp
int totalExp = 0;
for (int level = 1; level <= 4; level++)
{
    totalExp += level * 100;
}
Console.WriteLine(totalExp); // 1000
```

Nếu khai báo `totalExp` bên trong vòng, mỗi vòng nó bị đặt lại về 0 và bạn không dùng được nó sau vòng lặp.

Muốn dừng vòng lặp sớm hoặc bỏ qua một lượt, xem trang [break và continue](/docs/csharp/break-continue).

## Bài tập

Một đợt quái có 5 wave. Wave thứ `w` (đếm từ 1) có `w * 3` con quái. Dùng `for` in số quái từng wave và tổng số quái của cả đợt.

<details>
<summary>Xem đáp án</summary>

```csharp
int total = 0;

for (int w = 1; w <= 5; w++)
{
    int enemies = w * 3;
    total += enemies;
    Console.WriteLine($"Wave {w}: {enemies} quái");
}

Console.WriteLine($"Tổng: {total} quái");
// Wave 1: 3 quái
// Wave 2: 6 quái
// Wave 3: 9 quái
// Wave 4: 12 quái
// Wave 5: 15 quái
// Tổng: 45 quái
```

</details>
