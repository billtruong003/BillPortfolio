---
title: "Output và comment trong C#"
description: "In ra màn hình trong C# với Console.WriteLine và Console.Write, khác nhau ở chỗ xuống dòng, cùng cách viết comment một dòng và nhiều dòng."
section: "Bắt đầu"
order: 4
tags: ["output", "Console.WriteLine", "comment"]
image: /images/docs/csharp/output-va-comment.webp
imageIdea: "Nhân vật anime làm người dẫn chuyện trong game RPG, cầm loa nói vào khung thoại trên màn hình, bên cạnh dán mấy tờ giấy note ghi chú bằng dấu '//'."
imagePrompt: "Edit this image: the character is an RPG narrator speaking into a megaphone, and a retro game dialogue box on a big screen shows 'Console.WriteLine(\"Quest started!\")'. Sticky notes starting with '//' are stuck on the screen frame. Keep the original art style, 16:9."
---

Output là những gì chương trình in ra cho người dùng thấy. Trong C# chạy trên cửa sổ dòng lệnh, bạn in bằng `Console.WriteLine` và `Console.Write`. Trang này cũng nói về comment: những dòng ghi chú mà trình biên dịch bỏ qua.

## Console.WriteLine

`WriteLine` in ra nội dung rồi **xuống dòng**. Lệnh in tiếp theo sẽ bắt đầu ở dòng mới.

```csharp
Console.WriteLine("Nhiệm vụ: Diệt 10 con Slime");
Console.WriteLine("Phần thưởng: 100 vàng");
// Nhiệm vụ: Diệt 10 con Slime
// Phần thưởng: 100 vàng
```

In số thì không cần dấu nháy:

```csharp
Console.WriteLine(42);     // 42
Console.WriteLine(10 + 5); // 15
```

Chú ý dòng thứ hai: C# tính `10 + 5` trước rồi mới in `15`. Nếu bạn viết `"10 + 5"` trong dấu nháy thì nó in nguyên văn chữ `10 + 5`.

## Console.Write

`Write` in ra mà **không xuống dòng**. Lệnh in sau sẽ nối tiếp ngay trên cùng dòng.

```csharp
Console.Write("HP: ");
Console.Write(80);
Console.Write("/100");
// HP: 80/100
```

Người mới hay dùng `Write` rồi thắc mắc sao mọi thứ dính thành một dòng dài. Quy tắc dễ nhớ: muốn xuống dòng thì dùng `WriteLine`. Dùng `Write` khi muốn ghép nhiều mảnh vào cùng một dòng, như thanh máu ở trên.

Gọi `Console.WriteLine()` không có gì trong ngoặc sẽ in ra một dòng trống. Hay dùng để ngăn cách các phần:

```csharp
Console.Write("Vàng: ");
Console.WriteLine(250);
Console.WriteLine();
Console.WriteLine("Kho đồ trống.");
// Vàng: 250
//
// Kho đồ trống.
```

## Ghép chữ và số

Dùng dấu `+` để nối chữ với số trong một lần in:

```csharp
int gold = 250;
Console.WriteLine("Bạn có " + gold + " vàng"); // Bạn có 250 vàng
```

Có cách gọn hơn là chuỗi nội suy `$"..."`, sẽ học ở trang [chuỗi](/docs/csharp/chuoi).

> **Lỗi hay gặp:** quên dấu nháy kép quanh chữ, ví dụ `Console.WriteLine(Game Over);`. C# hiểu `Game` là tên biến và báo lỗi CS0103 (không tìm thấy tên) cùng CS1003 (lỗi cú pháp). Chữ muốn in nguyên văn phải nằm trong `"..."`.

## Comment một dòng

Mọi thứ sau `//` tới hết dòng là comment. Chương trình chạy như thể dòng đó không có.

```csharp
// Máu tối đa của người chơi
int maxHp = 100;
int hp = maxHp; // bắt đầu với đầy máu
Console.WriteLine(hp); // 100
```

Comment dùng để giải thích **vì sao** code viết như vậy, không phải kể lại code làm gì. Viết `// cộng 1 vào level` ngay trên `level++` là thừa. Viết `// qua boss thì lên cấp ngay, không chờ đủ kinh nghiệm` thì có ích.

## Comment nhiều dòng

Bọc đoạn ghi chú dài giữa `/*` và `*/`:

```csharp
/*
  Công thức sát thương tạm thời.
  Sẽ đổi khi có hệ thống giáp.
*/
int damage = 12;
Console.WriteLine(damage); // 12
```

## Tắt tạm một dòng code

Comment còn dùng để tắt tạm một lệnh mà không xoá nó, tiện khi thử nghiệm:

```csharp
Console.WriteLine("Bắt đầu màn 1");
// Console.WriteLine("Debug: vị trí người chơi = 0");
Console.WriteLine("Quái xuất hiện!");
// Bắt đầu màn 1
// Quái xuất hiện!
```

Trong VS Code, bôi đen vài dòng rồi bấm `Ctrl+/` để comment hoặc bỏ comment cả khối.

## Bài tập

In ra khung thông tin nhân vật đúng như sau, dùng ít nhất một lần `Console.Write`:

```text
Tên: Aki
HP: 90/100
```

<details>
<summary>Xem đáp án</summary>

```csharp
Console.WriteLine("Tên: Aki");
Console.Write("HP: ");
Console.Write(90);
Console.WriteLine("/100");
// Tên: Aki
// HP: 90/100
```

</details>
