---
title: "Dictionary trong C#"
description: "Dictionary<TKey,TValue> trong C# lưu dữ liệu theo cặp khoá và giá trị: thêm, đọc, TryGetValue và cách tránh KeyNotFoundException qua ví dụ bảng giá shop."
section: "Collection"
order: 21
tags: ["Dictionary", "collection", "TryGetValue", "key"]
image: /images/docs/csharp/dictionary.webp
imageIdea: "Nhân vật anime làm chủ tiệm trong game, đang tra một cuốn sổ giá to: mỗi dòng là tên món đồ nối với giá vàng, khách xếp hàng hỏi giá."
imagePrompt: "Edit this image: the character is a shopkeeper behind a fantasy item counter, flipping through a large price ledger. Visible lines read 'Potion = 50' and 'Iron Sword = 300'. A small customer waits with a coin pouch. Keep the original art style, 16:9."
---

`Dictionary<TKey, TValue>` lưu dữ liệu theo cặp: một **khoá** (key) đi kèm một **giá trị** (value). Đưa khoá vào, nhận lại giá trị. Bảng giá của shop là ví dụ dễ thấy: tên món đồ là khoá, giá vàng là giá trị.

## Vì sao không dùng hai List

Cách người mới hay nghĩ ra: một `List<string>` chứa tên món, một `List<int>` chứa giá, hai bên khớp nhau theo index. Muốn biết giá của "Bình máu" thì phải tìm index trong List tên, rồi lấy giá ở cùng index. Chỉ cần xoá lệch một bên là giá bị gán nhầm món. Dictionary gắn cứng khoá với giá trị nên không có chuyện lệch.

## Tạo Dictionary và thêm phần tử

`TKey` là kiểu của khoá, `TValue` là kiểu của giá trị. Bảng giá dùng `Dictionary<string, int>`.

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>();

prices.Add("Bình máu", 50);
prices.Add("Kiếm sắt", 300);
prices["Khiên gỗ"] = 120;

Console.WriteLine(prices.Count); // 3
```

Có thể điền sẵn khi tạo:

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>
{
    ["Bình máu"] = 50,
    ["Kiếm sắt"] = 300,
    ["Khiên gỗ"] = 120,
};
```

Mỗi khoá chỉ xuất hiện một lần. `Add` một khoá đã có sẽ báo `ArgumentException: An item with the same key has already been added`. Còn gán bằng ngoặc vuông `prices["Bình máu"] = 45;` thì ghi đè giá cũ, dùng khi muốn đổi giá.

## Đọc giá trị theo khoá

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>
{
    ["Bình máu"] = 50,
    ["Kiếm sắt"] = 300,
};

Console.WriteLine(prices["Kiếm sắt"]); // 300

prices["Bình máu"] = 45; // giảm giá cuối tuần
Console.WriteLine(prices["Bình máu"]); // 45
```

## Lỗi KeyNotFoundException

Khách hỏi một món shop không bán, bạn đọc thẳng bằng ngoặc vuông, chương trình dừng lại.

```csharp
Dictionary<string, int> prices = new Dictionary<string, int> { ["Bình máu"] = 50 };

Console.WriteLine(prices["Cung gỗ"]);
// Unhandled exception. System.Collections.Generic.KeyNotFoundException:
// The given key 'Cung gỗ' was not present in the dictionary.
```

> **Lỗi hay gặp:** đọc `dict[key]` khi không chắc khoá có tồn tại. Với dữ liệu đến từ người chơi (tên món họ gõ, id đồ trong file save), luôn kiểm tra trước.

## Đọc an toàn với `TryGetValue`

`TryGetValue` trả về `true` nếu tìm thấy khoá và đưa giá trị ra qua tham số `out`. Nếu không thấy, nó trả `false` và không ném lỗi. Về `out`, xem thêm trang [tham số](/docs/csharp/tham-so).

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>
{
    ["Bình máu"] = 50,
    ["Kiếm sắt"] = 300,
};

string wanted = "Cung gỗ";

if (prices.TryGetValue(wanted, out int price))
{
    Console.WriteLine($"{wanted} giá {price} vàng");
}
else
{
    Console.WriteLine($"Shop không bán {wanted}");
}
// Shop không bán Cung gỗ
```

Nếu chỉ cần biết có hay không, dùng `ContainsKey`:

```csharp
Console.WriteLine(prices.ContainsKey("Bình máu")); // True
```

## Duyệt và xoá

Duyệt bằng [foreach](/docs/csharp/foreach), mỗi lượt nhận một cặp có `Key` và `Value`. Xoá bằng `Remove(khoá)`.

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>
{
    ["Bình máu"] = 50,
    ["Kiếm sắt"] = 300,
    ["Khiên gỗ"] = 120,
};

prices.Remove("Khiên gỗ"); // hết hàng

foreach (var item in prices)
{
    Console.WriteLine($"{item.Key}: {item.Value} vàng");
}
// Bình máu: 50 vàng
// Kiếm sắt: 300 vàng
```

Dictionary không hứa giữ thứ tự phần tử. Đừng viết code dựa vào việc món nào được in ra trước.

## Bài tập

Người chơi có 200 vàng và muốn mua "Kiếm sắt". Dùng bảng giá ở trên và `TryGetValue`: nếu shop không bán thì in "Không có món này", nếu không đủ vàng thì in "Thiếu {số} vàng", còn lại thì trừ vàng và in số vàng còn lại.

<details>
<summary>Xem đáp án</summary>

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>
{
    ["Bình máu"] = 50,
    ["Kiếm sắt"] = 300,
};

int gold = 200;
string wanted = "Kiếm sắt";

if (!prices.TryGetValue(wanted, out int price))
{
    Console.WriteLine("Không có món này");
}
else if (gold < price)
{
    Console.WriteLine($"Thiếu {price - gold} vàng"); // Thiếu 100 vàng
}
else
{
    gold -= price;
    Console.WriteLine($"Còn {gold} vàng");
}
```

</details>
