---
title: "Nhập dữ liệu từ bàn phím trong C#"
description: "Đọc dữ liệu người dùng gõ vào bằng Console.ReadLine trong C#, đổi sang số với int.Parse hoặc int.TryParse và tránh lỗi FormatException."
section: "Cơ bản"
order: 8
tags: ["nhập dữ liệu", "Console.ReadLine", "int.TryParse"]
image: /images/docs/csharp/nhap-du-lieu.webp
imageIdea: "Nhân vật anime làm lính gác cổng thành, cầm sổ hỏi tên người đến, một lữ khách đưa tờ giấy ghi 'năm mươi' thay vì '50' và nhân vật nhíu mày giơ biển 'FormatException'."
imagePrompt: "Edit this image: the character is a castle gate guard holding a ledger titled 'Console.ReadLine()'. A traveler hands over a paper that says 'năm mươi' instead of '50', and the guard frowns while holding up a small sign reading 'FormatException'. Keep the original art style, 16:9."
---

Chương trình thú vị hơn khi người chơi được gõ vào: nhập tên nhân vật, chọn số lượng vật phẩm muốn mua. Trong C# chạy trên cửa sổ dòng lệnh, bạn đọc những gì người dùng gõ bằng `Console.ReadLine`. Phần khó nằm ở chỗ đổi chữ họ gõ thành số mà không làm chương trình sập.

## Đọc một dòng với Console.ReadLine

`Console.ReadLine()` dừng chương trình, chờ người dùng gõ rồi bấm Enter, sau đó trả về đúng dòng họ gõ dưới dạng `string`.

```csharp
Console.Write("Nhập tên nhân vật: ");
string? heroName = Console.ReadLine();
Console.WriteLine("Chào mừng, " + heroName + "!");
// Nhập tên nhân vật: Aki
// Chào mừng, Aki!
```

Dấu `?` sau `string` nghĩa là biến này có thể không có giá trị (`null`). `ReadLine` trả về `null` khi không còn gì để đọc, ví dụ lúc chương trình chạy mà không có bàn phím. Nếu bạn bỏ dấu `?`, VS Code sẽ gạch vàng cảnh báo CS8600. Code vẫn chạy, chỉ là C# nhắc bạn cẩn thận.

Dùng `Console.Write` cho câu hỏi để con trỏ nằm ngay sau dấu hai chấm, nhìn tự nhiên hơn.

## Chuỗi không phải số

Người mới hay đọc tuổi hay số lượng rồi cộng thẳng:

```csharp
Console.Write("Mua bao nhiêu bình máu? ");
string? input = Console.ReadLine();
// int total = input * 15; // lỗi CS0019: không nhân string với int được
```

`ReadLine` luôn trả về chuỗi, kể cả khi người dùng gõ `3`. Chuỗi `"3"` chưa phải số `3`. Phải đổi kiểu trước.

## int.Parse

`int.Parse` đổi chuỗi thành số nguyên:

```csharp
Console.Write("Mua bao nhiêu bình máu? ");
int amount = int.Parse(Console.ReadLine()!);
int total = amount * 15;
Console.WriteLine("Tổng: " + total + " vàng");
// Mua bao nhiêu bình máu? 3
// Tổng: 45 vàng
```

Dấu `!` sau `ReadLine()` là bạn nói với C#: "tôi chắc chắn chỗ này không null". Nó tắt cảnh báo, không đổi cách chạy.

Vấn đề là người dùng không phải lúc nào cũng gõ đúng.

> **Lỗi hay gặp:** người chơi gõ `ba` hoặc `3 bình` thay vì `3`. `int.Parse` không đổi được và chương trình dừng hẳn với `System.FormatException: The input string 'ba' was not in a correct format.` Gõ trống rồi bấm Enter cũng ra lỗi này.

## int.TryParse

`int.TryParse` thử đổi chuỗi. Đổi được thì trả về `true` và đặt số vào biến sau từ khoá `out`. Không đổi được thì trả về `false`, chương trình không sập.

```csharp
Console.Write("Mua bao nhiêu bình máu? ");
string? input = Console.ReadLine();

if (int.TryParse(input, out int amount))
{
    Console.WriteLine("Tổng: " + amount * 15 + " vàng");
}
else
{
    Console.WriteLine("Hãy nhập một con số.");
}
// Mua bao nhiêu bình máu? ba
// Hãy nhập một con số.
```

`TryParse` nhận được cả `null`, nên không cần dấu `!`. Với dữ liệu người dùng gõ, luôn ưu tiên `TryParse`. Chỉ dùng `Parse` khi bạn chắc chắn chuỗi là số, như dữ liệu do chính bạn viết trong file cấu hình.

## Hỏi lại tới khi nhập đúng

Kết hợp `TryParse` với vòng lặp `while` để hỏi lại cho tới khi người dùng gõ số hợp lệ:

```csharp
int level;
Console.Write("Chọn level (1-10): ");
while (!int.TryParse(Console.ReadLine(), out level) || level < 1 || level > 10)
{
    Console.Write("Không hợp lệ, nhập lại: ");
}
Console.WriteLine("Vào level " + level);
// Chọn level (1-10): mười
// Không hợp lệ, nhập lại: 15
// Không hợp lệ, nhập lại: 4
// Vào level 4
```

Vòng lặp `while` được giải thích kỹ ở trang [vòng lặp while](/docs/csharp/vong-lap-while).

## Số thực

Đọc số có phần thập phân thì dùng `double.TryParse` hoặc `float.TryParse`. Lưu ý: máy đặt định dạng Việt Nam dùng dấu phẩy làm dấu thập phân, nên `1.5` có thể không đổi được trong khi `1,5` thì được.

## Bài tập

Hỏi người chơi có bao nhiêu vàng. Nếu nhập đúng số, in ra số bình máu mua được (mỗi bình 15 vàng). Nếu nhập sai, in "Số vàng không hợp lệ".

<details>
<summary>Xem đáp án</summary>

```csharp
Console.Write("Bạn có bao nhiêu vàng? ");

if (int.TryParse(Console.ReadLine(), out int gold))
{
    int potions = gold / 15;
    Console.WriteLine("Mua được " + potions + " bình máu");
}
else
{
    Console.WriteLine("Số vàng không hợp lệ");
}
// Bạn có bao nhiêu vàng? 100
// Mua được 6 bình máu
```

</details>
