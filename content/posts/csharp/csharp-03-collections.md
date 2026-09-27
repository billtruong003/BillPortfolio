---
title: "C# cho người mới #3: Array, List và Dictionary"
date: "2024-10-24"
lang: "vi"
series: "csharp"
order: 3
excerpt: "Khi có hàng chục enemy hay item, bạn cần một chỗ chứa nhiều phần tử. Bài này so sánh Array, List và Dictionary, rồi dựng một inventory đơn giản."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Khi nào cần collection

Giả sử trên map có 50 enemy. Khai báo 50 biến riêng `enemy1`, `enemy2`, ... `enemy50` thì không ai làm nổi, và muốn duyệt qua cả 50 con cũng không được. Thứ bạn cần là **collection**: một biến chứa được nhiều phần tử.

## Array: kích thước cố định

Array là collection đơn giản nhất: tạo ra với kích thước cố định, truy cập bằng index.

### Khai báo

```csharp
// Khai báo và gán giá trị luôn
int[] damage = { 10, 25, 30, 15, 40 };

// Khai báo kích thước trước, gán sau
string[] inventory = new string[5];
inventory[0] = "Sword";
inventory[1] = "Shield";
// inventory[2], [3], [4] mặc định là null
```

### Truy cập và duyệt

```csharp
// Truy cập bằng index (bắt đầu từ 0)
Console.WriteLine(damage[0]);  // 10
Console.WriteLine(damage[4]);  // 40

// Độ dài
Console.WriteLine(damage.Length);  // 5

// Duyệt bằng for
for (int i = 0; i < damage.Length; i++)
{
    Console.WriteLine($"Slot {i}: {damage[i]}");
}

// Duyệt bằng foreach (khi không cần index)
foreach (int dmg in damage)
{
    Console.WriteLine($"Damage: {dmg}");
}
```

Lỗi hay gặp: truy cập `damage[5]` trong khi mảng chỉ có 5 phần tử (index 0 đến 4). Chương trình sẽ dừng với `IndexOutOfRangeException`. Duyệt bằng `i < damage.Length` thay vì gõ tay con số để tránh lỗi này.

### Array 2D: lưới, map, bàn cờ

```csharp
// Map 3x3: 0 = trống, 1 = tường, 2 = enemy
int[,] map = {
    { 0, 1, 0 },
    { 0, 0, 2 },
    { 1, 0, 0 }
};

// Truy cập: map[row, col]
Console.WriteLine(map[1, 2]);  // 2 (enemy)

// Duyệt lưới
for (int row = 0; row < map.GetLength(0); row++)
{
    for (int col = 0; col < map.GetLength(1); col++)
    {
        string tile = map[row, col] switch
        {
            0 => ".",
            1 => "#",
            2 => "E",
            _ => "?"
        };
        Console.Write(tile + " ");
    }
    Console.WriteLine();
}
```

Output:
```
. # .
. . E
# . .
```

### Khi nào dùng Array?

- Khi biết trước kích thước và **không cần thêm/xóa**
- Truy cập theo index nhanh (O(1)). List cũng nhanh như vậy vì bên trong List là một array, nhưng Array không có phần quản lý kích thước đi kèm nên nhẹ hơn một chút
- Ví dụ: lưới map, số ô inventory cố định, chuỗi combo định sẵn

## List: kích thước linh hoạt

Array có một giới hạn: tạo ra 5 ô thì mãi là 5 ô. Enemy sinh ra rồi chết đi liên tục thì bạn cần thứ co giãn được. `List<T>` giống Array nhưng thêm và xóa phần tử thoải mái.

### Khai báo và thao tác cơ bản

```csharp
// Tạo list rỗng
List<string> party = new List<string>();

// Thêm phần tử
party.Add("Warrior");
party.Add("Mage");
party.Add("Healer");

// Thêm nhiều phần tử một lúc
party.AddRange(new[] { "Archer", "Thief" });

// Truy cập bằng index
Console.WriteLine(party[0]);  // "Warrior"

// Số phần tử
Console.WriteLine(party.Count);  // 5
```

### Xóa phần tử

```csharp
party.Remove("Thief");        // Xóa theo giá trị
party.RemoveAt(0);             // Xóa theo index
party.RemoveAll(p => p == "Mage");  // Xóa tất cả "Mage"
```

`p => p == "Mage"` là một hàm viết gọn (lambda), bài 7 sẽ nói kỹ. Tạm hiểu là "những phần tử p mà p bằng Mage".

### Tìm kiếm

```csharp
bool hasMage = party.Contains("Mage");
int index = party.IndexOf("Healer");  // -1 nếu không tìm thấy
string found = party.Find(p => p.StartsWith("War"));  // "Warrior"
```

### Sắp xếp

```csharp
List<int> scores = new List<int> { 500, 100, 800, 200, 950 };

scores.Sort();                           // Tăng dần: 100, 200, 500, 800, 950
scores.Sort((a, b) => b.CompareTo(a));   // Giảm dần: 950, 800, 500, 200, 100
scores.Reverse();                        // Đảo thứ tự hiện tại
```

`b.CompareTo(a)` đảo chiều so sánh nên list xếp giảm dần. Bạn có thể gặp cách viết `b - a` trên mạng, nhưng phép trừ có thể tràn số khi hai giá trị cách nhau quá xa, nên dùng `CompareTo` cho chắc.

### Duyệt List

```csharp
// foreach: phổ biến nhất
foreach (string member in party)
{
    Console.WriteLine(member);
}

// for: khi cần index
for (int i = 0; i < party.Count; i++)
{
    Console.WriteLine($"#{i + 1}: {party[i]}");
}
```

### Khi nào dùng List?

- Khi cần **thêm/xóa** phần tử (danh sách enemy, đồ rơi ra, tin nhắn chat)
- Khi không biết trước số lượng
- Đây là collection bạn dùng nhiều nhất khi làm game

## Dictionary: cặp key và value

Muốn biết giá của "Potion" trong một List chứa 200 món, bạn phải duyệt từ đầu tới khi gặp. `Dictionary<TKey, TValue>` lưu dữ liệu theo cặp key-value và tìm theo key rất nhanh (O(1)), không cần duyệt.

### Khai báo

```csharp
// Dữ liệu cửa hàng: tên món → giá
Dictionary<string, int> shopPrices = new Dictionary<string, int>
{
    { "Sword", 100 },
    { "Shield", 80 },
    { "Potion", 25 }
};
```

### Thao tác

```csharp
// Thêm
shopPrices["Bow"] = 120;
shopPrices.Add("Staff", 150);  // báo lỗi nếu key đã có

// Truy cập
int swordPrice = shopPrices["Sword"];  // 100

// Kiểm tra key có tồn tại không (truy cập key không có sẽ báo lỗi)
if (shopPrices.ContainsKey("Potion"))
{
    Console.WriteLine($"Potion: {shopPrices["Potion"]}G");
}

// Hoặc dùng TryGetValue: kiểm tra và lấy giá trị trong một bước
if (shopPrices.TryGetValue("Armor", out int price))
{
    Console.WriteLine($"Armor: {price}G");
}
else
{
    Console.WriteLine("Armor không có trong shop!");
}

// Xóa
shopPrices.Remove("Potion");

// Số phần tử
Console.WriteLine(shopPrices.Count);
```

### Duyệt Dictionary

```csharp
foreach (KeyValuePair<string, int> item in shopPrices)
{
    Console.WriteLine($"{item.Key}: {item.Value}G");
}

// Hoặc dùng var cho gọn
foreach (var item in shopPrices)
{
    Console.WriteLine($"{item.Key}: {item.Value}G");
}

// Chỉ duyệt key hoặc value
foreach (string name in shopPrices.Keys)
    Console.WriteLine(name);

foreach (int p in shopPrices.Values)
    Console.WriteLine(p);
```

### Khi nào dùng Dictionary?

- Khi cần **tìm nhanh** theo key (chỉ số người chơi, dữ liệu item, cấu hình)
- Key không được trùng
- Ví dụ: `Dictionary<string, int>` cho bảng điểm, `Dictionary<int, Enemy>` để tra enemy theo ID

## So sánh: khi nào dùng gì?

| Collection | Kích thước | Truy cập | Tìm kiếm | Dùng cho |
|-----------|-----------|---------|----------|----------|
| `Array` | Cố định | Nhanh (index) | Chậm (O(n)) | Lưới, số ô cố định |
| `List<T>` | Linh hoạt | Nhanh (index) | Chậm (O(n)) | Danh sách thay đổi, inventory |
| `Dictionary<K,V>` | Linh hoạt | Nhanh (key) | Nhanh (O(1)) | Tra cứu, bảng dữ liệu |

## Ví dụ tổng hợp: inventory

```csharp
// Inventory dùng Dictionary: tên item → số lượng
Dictionary<string, int> inventory = new Dictionary<string, int>();

// Hàm thêm item (bài 4 mới học hàm, ở đây xem trước)
void AddItem(string item, int amount)
{
    if (inventory.ContainsKey(item))
        inventory[item] += amount;
    else
        inventory[item] = amount;
    Console.WriteLine($"+ {amount}x {item}");
}

// Hàm hiển thị inventory
void ShowInventory()
{
    Console.WriteLine("\n=== INVENTORY ===");
    if (inventory.Count == 0)
    {
        Console.WriteLine("(Trống)");
        return;
    }
    foreach (var item in inventory)
    {
        Console.WriteLine($"  {item.Key} x{item.Value}");
    }
    Console.WriteLine($"Tổng: {inventory.Count} loại item");
}

// Sử dụng
AddItem("Potion", 3);
AddItem("Sword", 1);
AddItem("Potion", 2);  // cộng dồn
AddItem("Arrow", 50);

ShowInventory();
```

Output:
```
+ 3x Potion
+ 1x Sword
+ 2x Potion
+ 50x Arrow

=== INVENTORY ===
  Potion x5
  Sword x1
  Arrow x50
Tổng: 3 loại item
```

## Bài tập

**Bài 1: Bảng xếp hạng**
Tạo `List<int>` chứa 10 điểm ngẫu nhiên (100 đến 10000). Sắp xếp giảm dần, in ra top 5 dạng:
```
#1: 9500
#2: 8200
...
```

**Bài 2: Pokédex đơn giản**
Tạo `Dictionary<string, string>` lưu tên Pokémon → hệ (Fire, Water, Grass...). Thêm 5 Pokémon. Cho người dùng nhập tên, in ra hệ. Nếu không tìm thấy, in "Pokémon chưa được phát hiện!".

**Bài 3: Map dungeon**
Tạo array 2D `char[5,5]`. Điền ngẫu nhiên: 70% `'.'` (trống), 20% `'#'` (tường), 10% `'E'` (enemy). Đặt `'P'` ở [0,0] và `'X'` (lối ra) ở [4,4]. In ra map.

---

**Bài trước:** [C# cho người mới #2: Điều kiện và vòng lặp](/lab/csharp-02-control-flow)
**Bài tiếp:** [C# cho người mới #4: Hàm, tham số và enum](/lab/csharp-04-methods)
