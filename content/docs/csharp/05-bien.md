---
title: "Biến trong C#"
description: "Biến là gì, cách khai báo biến trong C#, đặt tên sao cho đúng và vì sao C# bắt bạn nói rõ kiểu dữ liệu."
section: "Cơ bản"
order: 5
tags: ["biến", "khai báo", "var"]
image: /images/docs/csharp/bien.webp
imageIdea: "Nhân vật anime đang dán nhãn lên những chiếc hộp gỗ trong kho đồ của game: hộp ghi 'hp = 100', hộp ghi 'playerName'."
imagePrompt: "Edit this image: the character is labeling small wooden storage boxes in a cozy game inventory room. Labels read 'int hp = 100' and 'string playerName'. Keep the original art style, warm lighting, 16:9."
---

Biến là một cái hộp có tên, dùng để giữ một giá trị. Máu của nhân vật, tên người chơi, số vàng trong túi: mỗi thứ nằm trong một biến.

## Khai báo biến

Chỗ người mới hay vấp là viết tên biến mà quên nói biến đó giữ loại dữ liệu gì. C# không cho làm vậy. Mỗi biến phải có **kiểu**, **tên**, và thường có luôn **giá trị ban đầu**.

```csharp
int hp = 100;
string playerName = "Bill";
float moveSpeed = 5.5f;
bool isAlive = true;
```

Đọc dòng đầu từ trái sang phải: tạo một biến kiểu `int` (số nguyên), tên là `hp`, gán giá trị `100`.

## Đổi giá trị của biến

Biến sinh ra để thay đổi. Khi đã khai báo rồi, lần sau chỉ cần viết tên, không viết lại kiểu.

```csharp
int hp = 100;
hp = 80;        // trúng đòn, mất 20 máu
hp = hp + 10;   // uống bình máu
Console.WriteLine(hp); // 90
```

> **Lỗi hay gặp:** viết `int hp = 80;` lần thứ hai. C# sẽ báo lỗi CS0128 vì biến `hp` đã tồn tại. Lần gán sau chỉ cần `hp = 80;`.

## Để C# tự đoán kiểu với `var`

Khi giá trị ở bên phải đã nói rõ kiểu, bạn có thể dùng `var` cho gọn. Kiểu vẫn cố định, chỉ là C# tự điền giúp.

```csharp
var gold = 250;          // int
var heroName = "Aki";    // string
var jumpForce = 7.5f;    // float
```

`var` không biến C# thành ngôn ngữ "thả kiểu". Sau dòng `var gold = 250;`, viết `gold = "nhiều";` vẫn báo lỗi, vì `gold` đã là `int`.

## Hằng số với `const`

Có những giá trị không bao giờ đổi trong lúc chơi, ví dụ số máu tối đa. Đánh dấu bằng `const` để lỡ tay gán lại thì trình biên dịch chặn ngay.

```csharp
const int MaxHp = 100;
MaxHp = 120; // lỗi CS0131: không gán lại hằng số được
```

## Quy tắc đặt tên

- Tên bắt đầu bằng chữ cái hoặc dấu `_`, không bắt đầu bằng số: `player1` được, `1player` thì không.
- Không có dấu cách: dùng `moveSpeed` thay vì `move speed`.
- Phân biệt hoa thường: `hp` và `HP` là hai biến khác nhau.
- Không dùng từ khóa của C# như `int`, `class`, `for` làm tên.
- Quy ước chung: biến cục bộ viết `camelCase` (`moveSpeed`), hằng số viết `PascalCase` (`MaxHp`).

Đặt tên nói lên ý nghĩa: `enemyCount` dễ đọc hơn nhiều so với `n` hay `x2`.

## Bài tập

Khai báo biến cho một con quái: tên là "Slime", máu 30, tốc độ 1.5, và chưa bị hạ gục. Sau đó cho nó mất 12 máu rồi in máu còn lại.

<details>
<summary>Xem đáp án</summary>

```csharp
string enemyName = "Slime";
int enemyHp = 30;
float enemySpeed = 1.5f;
bool isDefeated = false;

enemyHp = enemyHp - 12;
Console.WriteLine(enemyHp); // 18
```

</details>
