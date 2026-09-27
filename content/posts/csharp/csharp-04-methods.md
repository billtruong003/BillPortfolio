---
title: "C# cho người mới #4: Hàm, tham số và enum"
date: "2024-10-26"
lang: "vi"
series: "csharp"
order: 4
excerpt: "Gom code lặp lại vào hàm, truyền tham số, trả về kết quả, nạp chồng hàm, rồi dùng enum thay cho chuỗi và số khó nhớ. Đây là bước đệm trước OOP."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Vì sao cần hàm

Bạn viết công thức tính damage ở 5 chỗ khác nhau. Tới lúc cần sửa công thức, bạn phải sửa đủ cả 5 chỗ, sót một chỗ là game tính sai mà khó phát hiện. Hàm (method) giải quyết chuyện này: viết **một lần**, gọi ở **nhiều nơi**, sửa một chỗ là xong.

## Cú pháp cơ bản

```csharp
// Định nghĩa hàm
static void SayHello()
{
    Console.WriteLine("Hello, Game Dev!");
}

// Gọi hàm
SayHello();  // "Hello, Game Dev!"
SayHello();  // Gọi lại bao nhiêu lần cũng được
```

Cấu trúc: `[access] [static] returnType MethodName(parameters)`

- `static`: tạm thời cứ viết vào, bài OOP sẽ giải thích
- `void`: hàm không trả về giá trị
- Tên hàm viết kiểu **PascalCase** (viết hoa chữ cái đầu mỗi từ)

## Tham số: truyền dữ liệu vào hàm

```csharp
static void TakeDamage(int amount)
{
    Console.WriteLine($"Nhận {amount} damage!");
}

TakeDamage(30);   // "Nhận 30 damage!"
TakeDamage(50);   // "Nhận 50 damage!"
```

### Nhiều tham số

```csharp
static void Attack(string attacker, string target, int damage)
{
    Console.WriteLine($"{attacker} tấn công {target}, gây {damage} damage!");
}

Attack("Player", "Goblin", 25);
```

### Tham số mặc định

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

Tham số có giá trị mặc định phải đặt **sau** các tham số bắt buộc.

## Return: trả về giá trị

```csharp
static int CalculateDamage(int baseDmg, float multiplier)
{
    return (int)(baseDmg * multiplier);
}

int damage = CalculateDamage(30, 1.5f);
Console.WriteLine($"Damage: {damage}");  // 45
```

- Giá trị trả về phải đúng kiểu đã khai báo (`int` ở đây)
- `return` kết thúc hàm ngay lập tức

### Trả về bool để kiểm tra điều kiện

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

### Thoát sớm bằng return

```csharp
static float GetHealthPercent(int current, int max)
{
    if (max <= 0) return 0f;  // tránh chia cho 0, thoát sớm
    return (float)current / max * 100f;
}
```

## Ref và out: đổi biến ở bên ngoài hàm

### Ref: truyền tham chiếu

Lỗi hay gặp: viết hàm trừ máu, gọi xong in biến ra thì máu vẫn y nguyên. Lý do là mặc định hàm chỉ nhận **bản sao** của giá trị, đổi bản sao không ảnh hưởng biến gốc. Muốn hàm sửa được biến gốc thì dùng `ref`:

```csharp
static void ApplyDamage(ref int health, int damage)
{
    health -= damage;
    if (health < 0) health = 0;
}

int playerHP = 100;
ApplyDamage(ref playerHP, 30);
Console.WriteLine(playerHP);  // 70, biến gốc đã bị đổi
```

### Out: trả về nhiều giá trị

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

Hàm có tham số `out` bắt buộc phải gán giá trị cho nó trước khi kết thúc.

## Nạp chồng hàm: cùng tên, khác tham số

Nạp chồng (overloading) cho phép nhiều hàm cùng tên nhưng nhận kiểu hoặc số lượng tham số khác nhau. Compiler nhìn vào đối số bạn truyền để chọn đúng hàm.

Có một bẫy khi dùng top-level statements: các hàm viết thẳng trong file như từ đầu bài tới giờ là **hàm cục bộ** (local function), và hàm cục bộ **không được nạp chồng**. Viết ba hàm `Damage` cùng tên ở đó thì compiler báo trùng tên. Cách đúng là đặt chúng trong một class:

```csharp
// Compiler tự chọn hàm phù hợp dựa trên đối số
Console.WriteLine(DamageCalc.Damage(30));              // 30
Console.WriteLine(DamageCalc.Damage(30, 2.0f));        // 60
Console.WriteLine(DamageCalc.Damage(30, 10, true));    // 52

static class DamageCalc
{
    public static int Damage(int baseDmg)
    {
        return baseDmg;
    }

    public static int Damage(int baseDmg, float critMultiplier)
    {
        return (int)(baseDmg * critMultiplier);
    }

    public static int Damage(int baseDmg, int bonusDmg, bool isElemental)
    {
        int total = baseDmg + bonusDmg;
        if (isElemental) total = (int)(total * 1.3f);
        return total;
    }
}
```

`public` cho phép code bên ngoài class gọi hàm, bài 5 sẽ nói kỹ.

**Lưu ý về thứ tự trong file:** khi dùng top-level statements, mọi khai báo kiểu (`class`, `enum`, `struct`, `interface`) phải nằm **sau** phần code chạy. Đặt class hay enum lên đầu file rồi mới viết code chạy bên dưới, compiler sẽ báo lỗi CS8803. Từ đây trở đi, các ví dụ đều viết code chạy ở trên, khai báo kiểu ở dưới cùng.

## Enum: tập hằng số có tên

Code kiểu `if (state == 2)` hay `if (weapon == "Bow")` rất khó đọc: số 2 nghĩa là gì, chuỗi gõ sai một chữ thì sao. Những giá trị như vậy gọi là "magic number" hay "magic string". Enum thay chúng bằng tên có nghĩa.

### Cú pháp

```csharp
WeaponType equipped = WeaponType.Sword;
Console.WriteLine(equipped);        // "Sword"
Console.WriteLine((int)equipped);   // 0

enum WeaponType
{
    Sword,    // 0
    Bow,      // 1
    Staff,    // 2
    Dagger,   // 3
    Axe       // 4
}
```

### Dùng trong switch

```csharp
HandleState(GameState.Playing);  // "Game đang chạy"

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

enum GameState { MainMenu, Playing, Paused, GameOver }
```

### Gán giá trị cụ thể

```csharp
Console.WriteLine($"Legendary drop rate: {GetDropRate(Rarity.Legendary)}%");

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

enum Rarity
{
    Common = 1,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5
}
```

### Vì sao dùng enum thay vì string?

```csharp
// SAI: dùng chuỗi, gõ sai chính tả không ai báo
string state = "playin";  // sai chính tả, chương trình vẫn chạy và chạy sai

// ĐÚNG: dùng enum, compiler bắt lỗi ngay
GameState state = GameState.Playin;  // LỖI COMPILE!
```

Enum cho bạn **gợi ý tự động** trong IDE và **báo lỗi lúc compile** khi gõ sai. Trong Unity, enum xuất hiện ở khắp nơi.

## Ví dụ tổng hợp: tính sát thương theo hệ

```csharp
// Sử dụng
int dmg = CalculateFinalDamage(40, Element.Fire, Element.Grass, true);
PrintAttackResult("Charmander", "Bulbasaur", dmg, Element.Fire, Element.Grass, true);
// Output: Charmander → Bulbasaur: 120 damage CRITICAL! Hiệu quả cao!

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

enum Element { None, Fire, Water, Grass }
```

## Bài tập

**Bài 1: Hàm tiện ích**
Viết 3 hàm: `Max(int a, int b)` trả về số lớn hơn, `Clamp(int value, int min, int max)` giữ giá trị trong khoảng min đến max, và `Map(float value, float fromMin, float fromMax, float toMin, float toMax)` quy đổi giá trị từ khoảng này sang khoảng khác.

**Bài 2: Cửa hàng**
Tạo enum `ItemType { Weapon, Armor, Potion, Scroll }`. Viết hàm `GetPrice(ItemType type, Rarity rarity)` trả về giá = giá gốc * hệ số độ hiếm. Viết hàm `TryBuy(ref int gold, ItemType type, Rarity rarity)` trả về `bool` và trừ gold nếu đủ tiền.

**Bài 3: Tung xúc xắc**
Viết các hàm nạp chồng `Roll()` (1 xúc xắc 6 mặt), `Roll(int sides)` (1 xúc xắc n mặt), `Roll(int count, int sides)` (nhiều xúc xắc). In kết quả từng viên và tổng. Nhớ đặt chúng trong một `static class` như `DamageCalc` ở trên.

---

**Bài trước:** [C# cho người mới #3: Array, List và Dictionary](/lab/csharp-03-collections)
**Bài tiếp:** [C# cho người mới #5: Class, object và constructor](/lab/csharp-05-oop-basics)
