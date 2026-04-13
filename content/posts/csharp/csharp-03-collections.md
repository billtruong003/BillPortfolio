---
title: "C# Cho Game Dev #3: Collections — Array, List & Dictionary"
date: "2024-10-24"
excerpt: "Quản lý dữ liệu với Array, List và Dictionary. Từ inventory system đến enemy tracking — mọi game đều cần collections."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Khi nào cần Collections?

Thử tưởng tượng bạn có 50 enemy trên map. Bạn sẽ khai báo 50 biến riêng lẻ `enemy1`, `enemy2`, ... `enemy50`? Tất nhiên là không. Bạn cần **collections** — cấu trúc dữ liệu chứa nhiều phần tử.

## Array — Kích thước cố định

Array là collection đơn giản nhất: kích thước cố định, truy cập bằng index.

### Khai báo

```csharp
// Khai báo + gán giá trị
int[] damage = { 10, 25, 30, 15, 40 };

// Khai báo kích thước, gán sau
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

### Array 2D — Grid, Map, Board

```csharp
// Map 3x3: 0 = trống, 1 = tường, 2 = enemy
int[,] map = {
    { 0, 1, 0 },
    { 0, 0, 2 },
    { 1, 0, 0 }
};

// Truy cập: map[row, col]
Console.WriteLine(map[1, 2]);  // 2 (enemy)

// Duyệt grid
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
- Performance cao nhất (truy cập O(1))
- Ví dụ: grid map, fixed-size inventory slots, pre-defined combo moves

## List — Kích thước linh hoạt

`List<T>` giống Array nhưng có thể thêm/xóa phần tử tự do.

### Khai báo & thao tác cơ bản

```csharp
// Tạo list rỗng
List<string> party = new List<string>();

// Thêm phần tử
party.Add("Warrior");
party.Add("Mage");
party.Add("Healer");

// Thêm nhiều cùng lúc
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

### Tìm kiếm

```csharp
bool hasMage = party.Contains("Mage");
int index = party.IndexOf("Healer");  // -1 nếu không tìm thấy
string found = party.Find(p => p.StartsWith("War"));  // "Warrior"
```

### Sắp xếp

```csharp
List<int> scores = new List<int> { 500, 100, 800, 200, 950 };

scores.Sort();                    // Tăng dần: 100, 200, 500, 800, 950
scores.Sort((a, b) => b - a);    // Giảm dần: 950, 800, 500, 200, 100
scores.Reverse();                 // Đảo thứ tự
```

### Duyệt List

```csharp
// foreach — phổ biến nhất
foreach (string member in party)
{
    Console.WriteLine(member);
}

// for — khi cần index
for (int i = 0; i < party.Count; i++)
{
    Console.WriteLine($"#{i + 1}: {party[i]}");
}
```

### Khi nào dùng List?

- Khi cần **thêm/xóa** phần tử (enemy list, loot drops, chat messages)
- Khi không biết trước số lượng
- Phổ biến nhất trong game dev

## Dictionary — Key-Value Pairs

`Dictionary<TKey, TValue>` lưu dữ liệu theo cặp key-value. Tìm kiếm theo key cực nhanh (O(1)).

### Khai báo

```csharp
// Item database: tên → giá
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
shopPrices.Add("Staff", 150);  // throw lỗi nếu key đã tồn tại

// Truy cập
int swordPrice = shopPrices["Sword"];  // 100

// Kiểm tra key tồn tại (LUÔN kiểm tra trước khi truy cập)
if (shopPrices.ContainsKey("Potion"))
{
    Console.WriteLine($"Potion: {shopPrices["Potion"]}G");
}

// Hoặc dùng TryGetValue — an toàn hơn
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

// Chỉ duyệt keys hoặc values
foreach (string name in shopPrices.Keys)
    Console.WriteLine(name);

foreach (int p in shopPrices.Values)
    Console.WriteLine(p);
```

### Khi nào dùng Dictionary?

- Khi cần **tìm nhanh** theo key (player stats, item database, config)
- Key phải unique (không trùng)
- Ví dụ: `Dictionary<string, int>` cho score leaderboard, `Dictionary<int, Enemy>` cho enemy ID tracking

## So Sánh: Khi nào dùng gì?

| Collection | Kích thước | Truy cập | Tìm kiếm | Use case |
|-----------|-----------|---------|----------|----------|
| `Array` | Cố định | Nhanh (index) | Chậm (O(n)) | Grid, fixed slots |
| `List<T>` | Linh hoạt | Nhanh (index) | Chậm (O(n)) | Dynamic lists, inventories |
| `Dictionary<K,V>` | Linh hoạt | Nhanh (key) | Nhanh (O(1)) | Lookups, databases |

## Ví Dụ Tổng Hợp: Inventory System

```csharp
// Inventory dùng Dictionary: itemName → quantity
Dictionary<string, int> inventory = new Dictionary<string, int>();

// Hàm thêm item (chưa học hàm? xem như preview)
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
AddItem("Potion", 2);  // stack thêm
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

## Bài Tập

**Bài 1: Leaderboard**
Tạo `List<int>` chứa 10 scores random (100-10000). Sắp xếp giảm dần, in ra top 5 dạng:
```
#1: 9500
#2: 8200
...
```

**Bài 2: Pokédex đơn giản**
Tạo `Dictionary<string, string>` lưu tên Pokémon → type (Fire, Water, Grass...). Thêm 5 Pokémon. Cho user nhập tên Pokémon, in ra type. Nếu không tìm thấy, in "Pokémon chưa được phát hiện!".

**Bài 3: Dungeon Map**
Tạo array 2D `char[5,5]`. Random fill: 70% `'.'` (trống), 20% `'#'` (tường), 10% `'E'` (enemy). Đặt `'P'` ở [0,0] và `'X'` (exit) ở [4,4]. In ra map.

---

**Bài trước:** [C# #2: Control Flow](/lab/csharp-02-control-flow)
**Bài tiếp:** [C# #4: Methods, Parameters & Enum](/lab/csharp-04-methods)
