---
title: "Cú pháp C# cơ bản"
description: "Cú pháp C# cơ bản: chương trình Hello World với top-level statements, dấu chấm phẩy, khối lệnh trong ngoặc nhọn và chuyện phân biệt chữ hoa chữ thường."
section: "Bắt đầu"
order: 3
tags: ["cú pháp", "hello world", "top-level statements"]
image: /images/docs/csharp/cu-phap.webp
imageIdea: "Nhân vật anime cầm một con dấu khổng lồ hình dấu chấm phẩy, đóng xuống cuối từng dòng chữ trên cuộn giấy dài như đang duyệt lệnh."
imagePrompt: "Edit this image: the character holds a giant rubber stamp shaped like a semicolon ';' and stamps it at the end of each line on a long parchment scroll with lines of code such as 'Console.WriteLine(\"Hello\")'. Keep the original art style, 16:9."
---

Cú pháp là luật viết code để trình biên dịch hiểu được. C# khá khắt khe: thiếu một dấu chấm phẩy hay gõ sai một chữ hoa là chương trình không chạy. Trang này đi qua những luật bạn gặp ngay từ dòng code đầu tiên.

## Hello World

```csharp
Console.WriteLine("Hello, World!"); // Hello, World!
```

Đọc từng phần:

- `Console` là cửa sổ dòng lệnh, nơi chữ được in ra.
- `.WriteLine` là lệnh "in một dòng rồi xuống dòng".
- `("Hello, World!")` là thứ cần in. Chữ phải nằm trong dấu nháy kép.
- `;` đánh dấu hết một lệnh.

## Top-level statements

Tài liệu cũ và nhiều video trên mạng viết Hello World dài hơn nhiều:

```csharp
class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
    }
}
```

Hai cách cho cùng kết quả. Từ C# 9, bạn được bỏ phần vỏ `class Program` và `Main`, viết lệnh thẳng ra file. Cách viết đó gọi là **top-level statements** (lệnh cấp cao nhất). Trình biên dịch tự bọc vỏ giúp bạn. Loạt bài này dùng cách ngắn.

Một project chỉ được có **một** file chứa top-level statements, thường là `Program.cs`.

## Dấu chấm phẩy

Mỗi lệnh kết thúc bằng `;`. Xuống dòng không có nghĩa là hết lệnh, C# chỉ nhìn dấu chấm phẩy.

```csharp
int hp = 100;
int mana = 50;
Console.WriteLine(hp);   // 100
Console.WriteLine(mana); // 50
```

> **Lỗi hay gặp:** quên dấu `;` ở cuối lệnh. Trình biên dịch báo lỗi CS1002: `; expected`. Nhìn vào số dòng trong thông báo, dấu thiếu thường nằm ở dòng đó hoặc cuối dòng ngay phía trên.

Vì C# không quan tâm xuống dòng, bạn có thể viết hai lệnh trên cùng một dòng. Làm vậy khó đọc, nên tránh:

```csharp
int gold = 10; gold = gold + 5;
Console.WriteLine(gold); // 15
```

## Khối lệnh

Một nhóm lệnh đi chung với nhau được bọc trong cặp ngoặc nhọn `{ }`, gọi là **khối lệnh**. Bạn sẽ thấy khối lệnh sau `if`, vòng lặp, hàm.

```csharp
int hp = 0;

if (hp <= 0)
{
    Console.WriteLine("Nhân vật đã gục."); // Nhân vật đã gục.
    Console.WriteLine("Game Over");        // Game Over
}
```

Hai lệnh bên trong ngoặc nhọn chỉ chạy khi điều kiện đúng. Mỗi `{` phải có một `}` đóng lại. Thiếu ngoặc đóng thì lỗi CS1513: `} expected`.

Thụt lề (dấu cách ở đầu dòng) không ảnh hưởng tới cách chạy, nhưng giúp mắt thấy ngay lệnh nào thuộc khối nào. VS Code tự thụt lề khi bạn bấm `Shift+Alt+F`.

## Phân biệt hoa thường

C# coi `hp` và `Hp` là hai tên khác nhau. `Console` viết đúng là chữ C hoa, `WriteLine` có W và L hoa.

```csharp
int score = 10;
Console.WriteLine(score); // 10
// console.writeline(score);  lỗi CS0103: không tìm thấy tên 'console'
// Console.WriteLine(Score);  lỗi CS0103: không tìm thấy tên 'Score'
```

Mã lỗi CS0103 nghĩa là "cái tên này không tồn tại". Gặp nó, việc đầu tiên là soát lại chữ hoa chữ thường.

## Comment

Chữ sau `//` là comment, trình biên dịch bỏ qua. Các ví dụ dùng comment để ghi kết quả in ra. Chi tiết ở trang [output và comment](/docs/csharp/output-va-comment).

## Bài tập

Đoạn code sau có ba lỗi. Tìm và sửa để nó in ra `Level 5`.

```csharp
int level = 5
console.WriteLine("Level " + Level);
```

<details>
<summary>Xem đáp án</summary>

Thiếu `;` ở dòng đầu, `console` phải viết hoa C, và `Level` phải là `level` cho khớp tên biến.

```csharp
int level = 5;
Console.WriteLine("Level " + level); // Level 5
```

</details>
