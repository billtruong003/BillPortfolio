---
title: "Mảng (array) trong C#"
description: "Mảng một chiều trong C#: cách khai báo, đọc phần tử bằng index bắt đầu từ 0, dùng Length và tránh lỗi IndexOutOfRangeException."
section: "Collection"
order: 18
tags: ["mảng", "array", "index", "Length"]
image: /images/docs/csharp/mang.webp
imageIdea: "Nhân vật anime đứng trước một dãy tủ đồ đánh số 0, 1, 2, 3, đang ngơ ngác vì mở nhầm tủ số 4 không tồn tại, bên trong chỉ có khói."
imagePrompt: "Edit this image: the character stands in front of a row of numbered lockers labeled 0, 1, 2, 3. They are confused, holding open an extra locker labeled 4 that puffs out gray smoke. Keep the original art style, 16:9."
---

Mảng (array) là một dãy ô nằm liền nhau, mỗi ô giữ một giá trị cùng kiểu. Khi có máu của 3 con quái, thay vì tạo 3 biến `hp1`, `hp2`, `hp3`, bạn gom chúng vào một mảng.

## Khai báo mảng

Người mới hay tạo từng biến riêng cho mỗi con quái. Được vài con thì ổn, lên 50 con thì code không đọc nổi. Mảng giải quyết chuyện đó: một tên, nhiều ô.

Kiểu của mảng viết bằng kiểu phần tử kèm cặp ngoặc vuông: `int[]` là mảng số nguyên, `string[]` là mảng chuỗi.

```csharp
int[] enemyHp = { 30, 50, 80 };
string[] heroNames = { "Aki", "Ren", "Mio" };
```

Nếu chưa biết giá trị, tạo mảng rỗng với số ô cho trước bằng `new`. Mỗi ô nhận giá trị mặc định: `0` với số, `false` với `bool`, `null` với `string`.

```csharp
int[] scores = new int[5];
Console.WriteLine(scores[0]); // 0
```

Số ô của mảng cố định từ lúc tạo. Muốn thêm bớt phần tử thoải mái thì dùng [List](/docs/csharp/list).

## Index bắt đầu từ 0

Chỗ sai kinh điển: nghĩ phần tử đầu tiên là số 1. Trong C#, phần tử đầu tiên có index (chỉ số) là `0`, phần tử thứ hai là `1`, và cứ thế.

```csharp
int[] enemyHp = { 30, 50, 80 };

Console.WriteLine(enemyHp[0]); // 30
Console.WriteLine(enemyHp[2]); // 80

enemyHp[1] = 20;               // con quái thứ hai trúng đòn
Console.WriteLine(enemyHp[1]); // 20
```

Đọc `enemyHp[1]` là "ô số 1 của mảng `enemyHp`", tức con quái thứ hai.

## Độ dài mảng với `Length`

`Length` cho biết mảng có bao nhiêu phần tử. Nó hay đi cùng [vòng lặp for](/docs/csharp/vong-lap-for) để duyệt hết mảng.

```csharp
int[] enemyHp = { 30, 50, 80 };
Console.WriteLine(enemyHp.Length); // 3

for (int i = 0; i < enemyHp.Length; i++)
{
    Console.WriteLine($"Quái {i}: {enemyHp[i]} máu");
}
// Quái 0: 30 máu
// Quái 1: 50 máu
// Quái 2: 80 máu
```

Để ý điều kiện là `i < enemyHp.Length`, không phải `<=`. Mảng 3 phần tử có index cuối là `2`, tức `Length - 1`.

## Lỗi IndexOutOfRangeException

Khi đọc hoặc ghi vào một ô không tồn tại, chương trình vẫn biên dịch được nhưng dừng lại lúc chạy.

```csharp
int[] enemyHp = { 30, 50, 80 };
Console.WriteLine(enemyHp[3]);
// Unhandled exception. System.IndexOutOfRangeException:
// Index was outside the bounds of the array.
```

> **Lỗi hay gặp:** viết vòng lặp `for (int i = 0; i <= enemyHp.Length; i++)`. Lượt cuối `i` bằng `3`, vượt quá index cuối là `2`, và chương trình báo `IndexOutOfRangeException`. Dùng `<` thay vì `<=`.

Index âm như `enemyHp[-1]` cũng gây đúng lỗi này. Muốn lấy phần tử cuối, viết `enemyHp[enemyHp.Length - 1]`, hoặc gọn hơn là `enemyHp[^1]`.

```csharp
int[] enemyHp = { 30, 50, 80 };
Console.WriteLine(enemyHp[enemyHp.Length - 1]); // 80
Console.WriteLine(enemyHp[^1]);                 // 80
```

## Bài tập

Một người chơi có điểm của 5 màn: 120, 340, 90, 500, 210. Lưu vào mảng, rồi in ra tổng điểm và điểm cao nhất.

<details>
<summary>Xem đáp án</summary>

```csharp
int[] levelScores = { 120, 340, 90, 500, 210 };

int total = 0;
int best = levelScores[0];

for (int i = 0; i < levelScores.Length; i++)
{
    total += levelScores[i];
    if (levelScores[i] > best)
    {
        best = levelScores[i];
    }
}

Console.WriteLine($"Tổng điểm: {total}");   // Tổng điểm: 1260
Console.WriteLine($"Cao nhất: {best}");     // Cao nhất: 500
```

</details>
