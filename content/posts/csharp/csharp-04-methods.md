---
title: "C# Cho Game Dev #4: Methods, Parameters & Enum"
date: "2024-10-26"
excerpt: "Tổ chức code bằng hàm (methods), hiểu về parameters, return values, overloading và enum — bước quan trọng trước khi vào OOP."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Tại sao cần Methods?

Bạn viết code tính damage ở 5 chỗ khác nhau. Khi cần sửa công thức, phải sửa cả 5 chỗ. Methods giải quyết vấn đề này: viết **một lần**, gọi **nhiều nơi**.

## Cú Pháp Cơ Bản

```csharp
// Định nghĩa method
static void SayHello()
{
    Console.WriteLine("Hello, Game Dev!");
}

// Gọi method
SayHello();  // "Hello, Game Dev!"
SayHello();  // Gọi lại bao nhiêu lần cũng được
```

Cấu trúc: `[access] [static] returnType MethodName(parameters)`

- `static` — tạm thời luôn dùng, sẽ hiểu rõ hơn ở bài OOP
- `void` — method không trả về giá trị
- Tên method dùng **PascalCase** (chữ cái đầu viết hoa)

## Parameters — Truyền dữ liệu vào

```csharp
static void TakeDamage(int amount)
{
    Console.WriteLine($"Nhận {amount} damage!");
}

TakeDamage(30);   // "Nhận 30 damage!"
TakeDamage(50);   // "Nhận 50 damage!"
```

### Nhiều parameters

```csharp
static void Attack(string attacker, string target, int damage)
{
    Console.WriteLine($"{attacker} tấn công {target}, gây {damage} damage!");
}

Attack("Player", "Goblin", 25);
```

### Default parameters

```csharp
static void Heal(int amount = 20, bool showEffect = true)
{
    Console.WriteLine($"Hồi {amount} HP");
    if (showEffect) Console.WriteLine("* Hiệu ứng hồi máu *");
}

Heal();           // amount=20, showEffect=true
Heal(50);         // amount=50, showEffect=true
Heal(30, false);  // amount=30, showEffect=false
```

Default params phải đặt **sau** params bắt buộc.

## Return — Trả về giá trị

```csharp
static int CalculateDamage(int baseDmg, float multiplier)
{
    return (int)(baseDmg * multiplier);
}

int damage = CalculateDamage(30, 1.5f);
Console.WriteLine($"Damage: {damage}");  // 45
```

- Kiểu return phải match với kiểu khai báo (`int` ở đây)
- `return` kết thúc method ngay lập tức

### Return boolean — kiểm tra điều kiện

```csharp
static bool CanAfford(int gold, int price)
{
    return gold >= price;
}

if (CanAfford(500, 300))
    Console.WriteLine("Mua thành công!");
else
    Console.WriteLine("Không đủ tiền!");
```

### Return với early exit

```csharp
static float GetHealthPercent(int current, int max)
{
    if (max <= 0) return 0f;  // tránh chia cho 0, thoát sớm
    return (float)current / max * 100f;
}
```

## Ref & Out — Thay đổi biến bên ngoài

### Ref — truyền tham chiếu

```csharp
static void ApplyDamage(ref int health, int damage)
{
    health -= damage;
    if (health < 0) health = 0;
}

int playerHP = 100;
ApplyDamage(ref playerHP, 30);
Console.WriteLine(playerHP);  // 70 — biến gốc bị thay đổi
```

Không có `ref`, method chỉ nhận **bản copy** của giá trị.

### Out — trả về nhiều giá trị

```csharp
static void GetMinMax(int[] numbers, out int min, out int max)
{
    min = numbers[0];
    max = numbers[0];
    foreach (int n in numbers)
    {
        if (n < min) min = n;
        if (n > max) max = n;
    }
}

int[] scores = { 100, 450, 200, 800, 50 };
GetMinMax(scores, out int lowest, out int highest);
Console.WriteLine($"Min: {lowest}, Max: {highest}");  // Min: 50, Max: 800
```

`out` bắt buộc method phải gán giá trị trước khi kết thúc.

## Method Overloading — Cùng tên, khác params

```csharp
static int Damage(int base_dmg)
{
    return base_dmg;
}

static int Damage(int base_dmg, float critMultiplier)
{
    return (int)(base_dmg * critMultiplier);
}

static int Damage(int base_dmg, int bonusDmg, bool isElemental)
{
    int total = base_dmg + bonusDmg;
    if (isElemental) total = (int)(total * 1.3f);
    return total;
}

// Compiler tự chọn method phù hợp dựa trên arguments
Console.WriteLine(Damage(30));              // 30
Console.WriteLine(Damage(30, 2.0f));        // 60
Console.WriteLine(Damage(30, 10, true));    // 52
```

Overloading cho phép cùng 1 tên method nhưng nhận các kiểu/số lượng parameter khác nhau.

## Enum — Tập hợp hằng số có tên

Enum giúp thay thế "magic numbers" bằng tên có ý nghĩa.

### Cú pháp

```csharp
enum WeaponType
{
    Sword,    // 0
    Bow,      // 1
    Staff,    // 2
    Dagger,   // 3
    Axe       // 4
}

WeaponType equipped = WeaponType.Sword;
Console.WriteLine(equipped);        // "Sword"
Console.WriteLine((int)equipped);   // 0
```

### Dùng trong switch

```csharp
enum GameState { MainMenu, Playing, Paused, GameOver }

static void HandleState(GameState state)
{
    switch (state)
    {
        case GameState.MainMenu:
            Console.WriteLine("Hiện menu chính");
            break;
        case GameState.Playing:
            Console.WriteLine("Game đang chạy");
            break;
        case GameState.Paused:
            Console.WriteLine("Game tạm dừng");
            break;
        case GameState.GameOver:
            Console.WriteLine("Game kết thúc");
            break;
    }
}

HandleState(GameState.Playing);  // "Game đang chạy"
```

### Gán giá trị cụ thể

```csharp
enum Rarity
{
    Common = 1,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5
}

static int GetDropRate(Rarity rarity)
{
    return rarity switch
    {
        Rarity.Common    => 50,
        Rarity.Uncommon  => 30,
        Rarity.Rare      => 15,
        Rarity.Epic      => 4,
        Rarity.Legendary => 1,
        _ => 0
    };
}

Console.WriteLine($"Legendary drop rate: {GetDropRate(Rarity.Legendary)}%");
```

### Tại sao dùng Enum thay vì string?

```csharp
// BAD — magic strings, dễ typo
string state = "playin";  // typo, không ai bắt lỗi

// GOOD — enum, compiler bắt lỗi
GameState state = GameState.Playin;  // COMPILE ERROR!
```

Enum cho bạn **autocomplete** trong IDE và **compile-time error** khi nhập sai. Trong Unity, enum cực kỳ phổ biến.

## Ví Dụ Tổng Hợp: Combat System

```csharp
enum Element { None, Fire, Water, Grass }

static float GetElementMultiplier(Element attacker, Element defender)
{
    if (attacker == Element.Fire && defender == Element.Grass) return 2.0f;
    if (attacker == Element.Water && defender == Element.Fire) return 2.0f;
    if (attacker == Element.Grass && defender == Element.Water) return 2.0f;
    if (attacker == defender && attacker != Element.None) return 0.5f;
    return 1.0f;
}

static int CalculateFinalDamage(int baseDmg, Element atkElement, Element defElement, bool isCrit)
{
    float multiplier = GetElementMultiplier(atkElement, defElement);
    float critBonus = isCrit ? 1.5f : 1.0f;
    int finalDmg = (int)(baseDmg * multiplier * critBonus);
    return finalDmg;
}

static void PrintAttackResult(string attacker, string defender, int damage,
    Element atkElem, Element defElem, bool isCrit)
{
    float mult = GetElementMultiplier(atkElem, defElem);
    string effectiveness = mult > 1 ? "Hiệu quả cao!" : mult < 1 ? "Không hiệu quả..." : "";
    string crit = isCrit ? " CRITICAL!" : "";

    Console.WriteLine($"{attacker} → {defender}: {damage} damage{crit} {effectiveness}");
}

// Sử dụng
int dmg = CalculateFinalDamage(40, Element.Fire, Element.Grass, true);
PrintAttackResult("Charmander", "Bulbasaur", dmg, Element.Fire, Element.Grass, true);
// Output: Charmander → Bulbasaur: 120 damage CRITICAL! Hiệu quả cao!
```

## Bài Tập

**Bài 1: Math Utils**
Viết 3 method: `Max(int a, int b)` trả về số lớn hơn, `Clamp(int value, int min, int max)` giới hạn giá trị trong khoảng, và `Map(float value, float fromMin, float fromMax, float toMin, float toMax)` ánh xạ giá trị từ range này sang range khác.

**Bài 2: Shop System**
Tạo enum `ItemType { Weapon, Armor, Potion, Scroll }`. Viết method `GetPrice(ItemType type, Rarity rarity)` trả về giá = basePrice * rarityMultiplier. Viết method `TryBuy(ref int gold, ItemType type, Rarity rarity)` trả về `bool` và trừ gold nếu đủ tiền.

**Bài 3: Dice Roller**
Viết method overloaded `Roll()` (1d6 mặc định), `Roll(int sides)` (1 xúc xắc n mặt), `Roll(int count, int sides)` (nhiều xúc xắc). In kết quả mỗi viên và tổng.

---

**Bài trước:** [C# #3: Collections](/lab/csharp-03-collections)
**Bài tiếp:** [C# #5: OOP — Class, Object & Constructor](/lab/csharp-05-oop-basics)
