---
title: "List trong C#"
description: "List<T> trong C# là danh sách tự co giãn: thêm bằng Add, xoá bằng Remove, đếm bằng Count, kiểm tra bằng Contains, qua ví dụ kho đồ người chơi."
section: "Collection"
order: 20
tags: ["List", "collection", "Add", "Remove", "Count"]
image: /images/docs/csharp/list.webp
imageIdea: "Nhân vật anime nhét thêm một món đồ vào chiếc ba lô ma thuật tự dài ra, một cuộn giấy danh sách đồ dài tới tận sàn nhà."
imagePrompt: "Edit this image: the character happily stuffs a glowing sword into a magical backpack that stretches longer to fit it. A long paper scroll titled 'List<string> inventory' unrolls from the backpack down to the floor. Keep the original art style, 16:9."
---

`List<T>` là một danh sách có thể thêm và bớt phần tử bất cứ lúc nào. `T` là kiểu của phần tử: `List<string>` chứa chuỗi, `List<int>` chứa số nguyên. Kho đồ của người chơi là ví dụ quen thuộc nhất.

## Vì sao không dùng mảng cho kho đồ

[Mảng](/docs/csharp/mang) có số ô cố định từ lúc tạo. Kho đồ thì lúc nhặt thêm, lúc bán bớt. Dùng mảng thì bạn phải tự tạo mảng mới to hơn và chép dữ liệu sang mỗi lần nhặt đồ. `List` làm việc đó giúp bạn.

## Tạo List và thêm phần tử với `Add`

```csharp
List<string> inventory = new List<string>();

inventory.Add("Kiếm gỗ");
inventory.Add("Bình máu");
inventory.Add("Chìa khoá đồng");

Console.WriteLine(inventory.Count); // 3
Console.WriteLine(inventory[0]);    // Kiếm gỗ
```

Có thể điền sẵn phần tử ngay khi tạo:

```csharp
List<string> inventory = new List<string> { "Kiếm gỗ", "Bình máu" };
```

`List` nằm trong namespace `System.Collections.Generic`. Project .NET 8 đã tự `using` sẵn namespace này, nên bạn không cần viết thêm.

Đọc và sửa phần tử dùng index giống mảng, bắt đầu từ `0`:

```csharp
List<string> inventory = new List<string> { "Kiếm gỗ", "Bình máu" };
inventory[0] = "Kiếm sắt"; // nâng cấp vũ khí
Console.WriteLine(inventory[0]); // Kiếm sắt
```

## Đếm bằng `Count`, không phải `Length`

> **Lỗi hay gặp:** viết `inventory.Length`. Trình biên dịch báo CS1061 "'List<string>' does not contain a definition for 'Length'". Mảng dùng `Length`, còn `List` dùng `Count`.

```csharp
List<string> inventory = new List<string> { "Kiếm gỗ", "Bình máu", "Khiên" };
const int MaxSlots = 5;

Console.WriteLine($"Túi: {inventory.Count}/{MaxSlots}"); // Túi: 3/5
```

## Kiểm tra có món đồ hay chưa với `Contains`

Cửa hầm chỉ mở khi người chơi có chìa khoá. `Contains` trả về `true` nếu tìm thấy phần tử.

```csharp
List<string> inventory = new List<string> { "Kiếm gỗ", "Chìa khoá đồng" };

if (inventory.Contains("Chìa khoá đồng"))
{
    Console.WriteLine("Cửa hầm mở ra.");
}
// Cửa hầm mở ra.
```

`Contains` so sánh chuỗi phân biệt hoa thường: `"chìa khoá đồng"` viết thường sẽ không khớp.

## Xoá phần tử với `Remove` và `RemoveAt`

`Remove` xoá phần tử đầu tiên khớp với giá trị bạn đưa vào, và trả về `true` nếu xoá được. `RemoveAt` xoá theo index.

```csharp
List<string> inventory = new List<string> { "Bình máu", "Kiếm gỗ", "Bình máu" };

bool used = inventory.Remove("Bình máu"); // uống một bình
Console.WriteLine(used);            // True
Console.WriteLine(inventory.Count); // 2
Console.WriteLine(inventory[0]);    // Kiếm gỗ

inventory.RemoveAt(0);              // vứt kiếm gỗ
Console.WriteLine(inventory[0]);    // Bình máu

bool found = inventory.Remove("Rồng");
Console.WriteLine(found);           // False
```

Xoá một thứ không có trong List không gây lỗi, chỉ trả về `false`. Nhưng `RemoveAt` với index không tồn tại sẽ báo `ArgumentOutOfRangeException`.

Muốn xoá nhiều phần tử trong lúc duyệt, đọc mục cuối của trang [foreach](/docs/csharp/foreach).

## Một số lệnh hay dùng khác

```csharp
List<string> inventory = new List<string> { "Khiên", "Bình máu" };

inventory.Insert(0, "Bản đồ");            // chèn vào đầu
Console.WriteLine(inventory[0]);          // Bản đồ
Console.WriteLine(inventory.IndexOf("Bình máu")); // 2

inventory.Clear();                        // bán sạch
Console.WriteLine(inventory.Count);       // 0
```

`IndexOf` trả về `-1` nếu không tìm thấy.

## Bài tập

Viết đoạn code nhặt đồ: kho có tối đa 3 ô, đang chứa "Kiếm gỗ" và "Bình máu". Lần lượt nhặt "Khiên" và "Nhẫn bạc". Trước mỗi lần nhặt, nếu kho đã đầy thì in "Kho đầy, bỏ lại {tên đồ}", còn không thì thêm vào. Cuối cùng in số món trong kho.

<details>
<summary>Xem đáp án</summary>

```csharp
List<string> inventory = new List<string> { "Kiếm gỗ", "Bình máu" };
const int MaxSlots = 3;

string[] loot = { "Khiên", "Nhẫn bạc" };

foreach (string item in loot)
{
    if (inventory.Count >= MaxSlots)
    {
        Console.WriteLine($"Kho đầy, bỏ lại {item}");
    }
    else
    {
        inventory.Add(item);
        Console.WriteLine($"Nhặt được {item}");
    }
}
// Nhặt được Khiên
// Kho đầy, bỏ lại Nhẫn bạc

Console.WriteLine(inventory.Count); // 3
```

</details>
