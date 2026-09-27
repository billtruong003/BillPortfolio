---
title: "Giới thiệu C#"
description: "C# là gì, được dùng ở đâu (Unity, .NET, web, tool) và vì sao nên học C# thuần trước khi mở Unity để làm game."
section: "Bắt đầu"
order: 1
tags: ["giới thiệu", "c#", ".net", "unity"]
image: /images/docs/csharp/gioi-thieu.webp
imageIdea: "Nhân vật anime đứng trước một tấm bản đồ thế giới kiểu game, cắm cờ C# lên bốn vùng đất: Unity, Web, Desktop, Tool."
imagePrompt: "Edit this image: the character stands in front of a fantasy world map pinned on a wall, placing small flags with the text 'C#' on four regions labeled 'Unity', 'Web', 'Desktop' and 'Tool'. Keep the original art style, 16:9."
---

C# (đọc là "xi sáp") là ngôn ngữ lập trình do Microsoft làm ra, chạy trên nền tảng .NET. Trong làm game, nó là ngôn ngữ chính để viết script cho Unity. Loạt bài này dạy C# thuần, chạy trong cửa sổ dòng lệnh, để bạn hiểu ngôn ngữ trước khi đụng tới engine.

## C# dùng để làm gì

Nhiều người nghĩ C# chỉ để làm game Unity. Thật ra Unity chỉ là một chỗ dùng C#, và code bạn học ở đây dùng được ở nhiều chỗ khác:

- **Game:** Unity dùng C# cho toàn bộ gameplay. Godot cũng hỗ trợ C#.
- **Web:** ASP.NET Core dùng C# để viết backend, API, trang web.
- **Ứng dụng desktop:** WPF, WinForms, .NET MAUI.
- **Tool nhỏ:** script đổi tên hàng loạt file, tool xuất dữ liệu level ra JSON, bot Discord.

Cú pháp `if`, vòng lặp, biến, hàm ở mọi chỗ trên đều giống nhau. Học một lần, mang đi khắp nơi.

## Một chương trình C# trông ra sao

Đây là một chương trình hoàn chỉnh. Nó in ra máu của nhân vật sau khi trúng đòn.

```csharp
int hp = 100;
int damage = 35;

hp = hp - damage;
Console.WriteLine("Máu còn lại: " + hp); // Máu còn lại: 65
```

Bốn dòng, không cần khai báo gì thêm. Từ C# 9 trở đi, bạn viết lệnh thẳng ra file như vậy được, gọi là **top-level statements**. Mọi ví dụ trong loạt bài này đều viết theo kiểu đó.

## .NET là gì, khác C# chỗ nào

Người mới hay lẫn hai cái tên này. C# là ngôn ngữ, tức là cách bạn viết code. .NET là nền tảng chạy code đó, gồm trình biên dịch, thư viện có sẵn (như `Console`, `Math`, `Random`) và bộ chạy chương trình.

So sánh cho dễ nhớ: C# là tiếng nói, .NET là căn nhà có sẵn đồ đạc để bạn dùng. Bài này dùng .NET 8 và C# 12.

> **Lỗi hay gặp:** tìm tài liệu rồi đọc nhầm hướng dẫn cho ".NET Framework 4.x". Đó là bản cũ, chỉ chạy trên Windows. Bản bạn cần là .NET 8 (không có chữ Framework).

## Vì sao học C# trước khi vào Unity

Mở Unity ra học luôn thì nghe nhanh hơn. Vấn đề là khi code lỗi, bạn không biết lỗi nằm ở C# hay ở Unity. Một dòng `NullReferenceException` có thể do bạn chưa kéo object vào Inspector, cũng có thể do bạn chưa hiểu biến là gì. Hai thứ trộn vào nhau thì rất khó gỡ.

Học C# thuần trước thì:

- Chạy chương trình mất một giây, không phải chờ Unity biên dịch lại.
- Lỗi chỉ đến từ code của bạn, không có scene, prefab hay Inspector xen vào.
- Khi sang Unity, bạn chỉ phải học thêm API của Unity (`Update`, `Transform`, `GetComponent`). Phần ngôn ngữ đã quen.

So sánh hai đoạn code dưới. Đoạn đầu là C# thuần, đoạn sau là trong Unity. Phần logic trừ máu giống hệt nhau.

```csharp
int hp = 100;
hp -= 20;
Console.WriteLine(hp); // 80
```

```csharp
// Trong một script Unity (chưa chạy được ở đây)
// hp -= 20;
// Debug.Log(hp);
```

Khác nhau chỉ ở chỗ in ra: `Console.WriteLine` thành `Debug.Log`.

## Học theo thứ tự nào

Loạt bài đi từ dễ tới khó:

1. [Cài đặt](/docs/csharp/cai-dat) .NET và VS Code.
2. [Cú pháp](/docs/csharp/cu-phap) cơ bản, [in ra màn hình](/docs/csharp/output-va-comment).
3. [Biến](/docs/csharp/bien), [kiểu dữ liệu](/docs/csharp/kieu-du-lieu), [toán tử](/docs/csharp/toan-tu).
4. Rẽ nhánh với [if else](/docs/csharp/if-else), lặp với [for](/docs/csharp/vong-lap-for).

Mỗi trang có một bài tập nhỏ ở cuối. Gõ lại code thay vì copy, tay quen thì đầu mới nhớ.

## Bài tập

Không cần cài gì, chỉ đọc code. Đoạn dưới in ra số nào?

```csharp
int gold = 50;
int potionPrice = 15;
gold = gold - potionPrice;
gold = gold - potionPrice;
Console.WriteLine(gold);
```

<details>
<summary>Xem đáp án</summary>

Mua hai bình máu, mỗi bình 15 vàng: 50 - 15 - 15 = 20.

```csharp
int gold = 50;
int potionPrice = 15;
gold = gold - potionPrice; // 35
gold = gold - potionPrice; // 20
Console.WriteLine(gold);   // 20
```

</details>
