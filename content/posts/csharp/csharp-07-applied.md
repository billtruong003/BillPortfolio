---
title: "C# Cho Game Dev #7: Ứng Dụng — Exception, LINQ & Delegate"
date: "2024-11-01"
excerpt: "Bài cuối series C#: xử lý lỗi với Exception, truy vấn dữ liệu với LINQ, và Delegate/Event — cầu nối trực tiếp sang Unity scripting."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "LINQ", "Game Development", "Course"]
published: true
featured: false
---

## Bài cuối C# — Cầu nối sang Unity

Bài này cover 3 chủ đề bạn sẽ dùng **ngay khi bắt đầu Unity**: Exception handling để code không crash, LINQ để xử lý collections, và Delegate/Event — hệ thống Unity dựa trên event rất nhiều.

## Exception Handling — Xử lý lỗi

### Vấn đề

```csharp
string input = "abc";
int number = int.Parse(input);  // CRASH! FormatException
```

Không xử lý lỗi = game crash. Người chơi sẽ không vui.

### Try-Catch-Finally

```csharp
try
{
    Console.Write("Nhập số lượng item: ");
    int count = int.Parse(Console.ReadLine());
    Console.WriteLine($"Bạn chọn {count} items");
}
catch (FormatException)
{
    Console.WriteLine("Vui lòng nhập số!");
}
catch (OverflowException)
{
    Console.WriteLine("Số quá lớn!");
}
finally
{
    // LUÔN chạy, dù có lỗi hay không
    Console.WriteLine("Input xử lý xong.");
}
```

- `try` — code có thể lỗi
- `catch` — bắt lỗi cụ thể
- `finally` — dọn dẹp, luôn chạy

### TryParse — Cách tốt hơn

```csharp
Console.Write("Nhập damage: ");
string input = Console.ReadLine();

if (int.TryParse(input, out int damage))
{
    Console.WriteLine($"Damage: {damage}");
}
else
{
    Console.WriteLine("Input không hợp lệ, dùng default damage");
    damage = 10;
}
```

`TryParse` trả `bool` — không throw exception, performance tốt hơn. **Ưu tiên dùng TryParse thay vì try-catch cho parsing.**

### Custom Exception

```csharp
class InsufficientGoldException : Exception
{
    public int Required { get; }
    public int Current { get; }

    public InsufficientGoldException(int required, int current)
        : base($"Cần {required} gold, chỉ có {current}")
    {
        Required = required;
        Current = current;
    }
}

class Shop
{
    public static void Buy(string item, int price, ref int gold)
    {
        if (gold < price)
            throw new InsufficientGoldException(price, gold);

        gold -= price;
        Console.WriteLine($"Mua {item} thành công! Còn {gold} gold");
    }
}

int playerGold = 50;
try
{
    Shop.Buy("Potion", 25, ref playerGold);   // OK
    Shop.Buy("Sword", 100, ref playerGold);   // throw!
}
catch (InsufficientGoldException ex)
{
    Console.WriteLine($"Không đủ tiền! {ex.Message}");
}
```

## LINQ — Truy vấn Collections

LINQ (Language Integrated Query) cho phép bạn lọc, sắp xếp, biến đổi collections bằng cú pháp cực kỳ ngắn gọn.

### Setup: Enemy list

```csharp
class Enemy
{
    public string Name { get; set; }
    public int Health { get; set; }
    public int Damage { get; set; }
    public string Type { get; set; }
}

List<Enemy> enemies = new List<Enemy>
{
    new Enemy { Name = "Goblin",   Health = 50,  Damage = 10, Type = "Melee" },
    new Enemy { Name = "Archer",   Health = 40,  Damage = 15, Type = "Ranged" },
    new Enemy { Name = "Dragon",   Health = 500, Damage = 80, Type = "Boss" },
    new Enemy { Name = "Slime",    Health = 20,  Damage = 5,  Type = "Melee" },
    new Enemy { Name = "Wizard",   Health = 60,  Damage = 40, Type = "Ranged" },
    new Enemy { Name = "Skeleton", Health = 45,  Damage = 12, Type = "Melee" },
};
```

### Where — Lọc

```csharp
// Lấy enemies có HP > 40
var strong = enemies.Where(e => e.Health > 40);
foreach (var e in strong)
    Console.WriteLine($"{e.Name}: {e.Health}HP");
// Goblin, Archer(?), Dragon, Wizard, Skeleton
```

`e => e.Health > 40` là **lambda expression** — hàm ẩn danh viết gọn. Đọc là "e sao cho e.Health > 40".

### Select — Biến đổi

```csharp
// Lấy chỉ tên
List<string> names = enemies.Select(e => e.Name).ToList();
// ["Goblin", "Archer", "Dragon", ...]

// Tạo display string
var display = enemies.Select(e => $"{e.Name} ({e.Type}) - {e.Health}HP");
```

### OrderBy — Sắp xếp

```csharp
// Sắp xếp theo damage tăng dần
var byDamage = enemies.OrderBy(e => e.Damage);

// Giảm dần
var strongest = enemies.OrderByDescending(e => e.Damage);

// Sắp xếp theo type, rồi theo damage
var sorted = enemies.OrderBy(e => e.Type).ThenByDescending(e => e.Damage);
```

### First, Last, Single

```csharp
Enemy boss = enemies.First(e => e.Type == "Boss");       // Dragon
Enemy weakest = enemies.OrderBy(e => e.Health).First();   // Slime

// FirstOrDefault — trả null nếu không tìm thấy (an toàn hơn)
Enemy healer = enemies.FirstOrDefault(e => e.Type == "Healer");  // null
```

### Aggregate — Tổng hợp

```csharp
int totalHP = enemies.Sum(e => e.Health);
double avgDamage = enemies.Average(e => e.Damage);
int maxDamage = enemies.Max(e => e.Damage);
int count = enemies.Count(e => e.Type == "Melee");

Console.WriteLine($"Total HP: {totalHP}");
Console.WriteLine($"Avg Damage: {avgDamage:F1}");
Console.WriteLine($"Max Damage: {maxDamage}");
Console.WriteLine($"Melee count: {count}");
```

### Chaining — Kết hợp nhiều operations

```csharp
// Top 3 non-boss enemies mạnh nhất
var top3 = enemies
    .Where(e => e.Type != "Boss")
    .OrderByDescending(e => e.Damage)
    .Take(3)
    .Select(e => $"{e.Name}: {e.Damage} dmg");

foreach (var s in top3)
    Console.WriteLine(s);
```

LINQ chain đọc từ trên xuống như pipeline: lọc → sắp xếp → lấy 3 → format.

### Any, All — Kiểm tra điều kiện

```csharp
bool hasBoss = enemies.Any(e => e.Type == "Boss");        // true
bool allAlive = enemies.All(e => e.Health > 0);            // true
bool hasHealer = enemies.Any(e => e.Type == "Healer");     // false
```

## Delegate & Event — Hệ thống sự kiện

Delegate là "biến chứa hàm". Event là cơ chế thông báo. Unity **phụ thuộc rất nhiều** vào pattern này (onClick, onCollision, etc).

### Delegate cơ bản

```csharp
// Khai báo delegate type
delegate void OnDamageReceived(int damage);

class Player
{
    public int Health { get; set; } = 100;

    // Khai báo event dùng delegate
    public OnDamageReceived onDamaged;

    public void TakeDamage(int amount)
    {
        Health -= amount;
        onDamaged?.Invoke(amount);  // gọi tất cả hàm đã đăng ký
    }
}
```

### Action & Func — Delegate dựng sẵn

Thay vì tự khai báo delegate, C# có sẵn:

```csharp
// Action — delegate không trả giá trị
Action<string> onLog = (msg) => Console.WriteLine($"[LOG] {msg}");
Action<int, int> onDamage = (dmg, hp) => Console.WriteLine($"-{dmg}HP → {hp}");

// Func — delegate CÓ trả giá trị (kiểu cuối cùng là return type)
Func<int, int, int> calculateDamage = (baseDmg, armor) => baseDmg - armor;
int result = calculateDamage(50, 15);  // 35
```

### Event — Pattern thực tế

```csharp
class GameEventSystem
{
    // Event dùng Action
    public event Action<string, int> OnEnemyKilled;
    public event Action OnGameOver;
    public event Action<int> OnScoreChanged;

    private int score = 0;

    public void KillEnemy(string enemyName, int points)
    {
        score += points;
        OnEnemyKilled?.Invoke(enemyName, points);
        OnScoreChanged?.Invoke(score);
    }

    public void EndGame()
    {
        OnGameOver?.Invoke();
    }
}

// === Subscribers (các hệ thống lắng nghe event) ===
class UIManager
{
    public void Setup(GameEventSystem events)
    {
        events.OnEnemyKilled += ShowKillPopup;
        events.OnScoreChanged += UpdateScoreUI;
        events.OnGameOver += ShowGameOverScreen;
    }

    void ShowKillPopup(string enemy, int points)
        => Console.WriteLine($"[UI] Killed {enemy}! +{points}pts");

    void UpdateScoreUI(int score)
        => Console.WriteLine($"[UI] Score: {score}");

    void ShowGameOverScreen()
        => Console.WriteLine("[UI] === GAME OVER ===");
}

class AudioManager
{
    public void Setup(GameEventSystem events)
    {
        events.OnEnemyKilled += (name, _) => Console.WriteLine($"[Audio] *kill sound*");
        events.OnGameOver += () => Console.WriteLine("[Audio] *sad music*");
    }
}

// === Sử dụng ===
var events = new GameEventSystem();
var ui = new UIManager();
var audio = new AudioManager();

ui.Setup(events);
audio.Setup(events);

events.KillEnemy("Goblin", 100);
// [UI] Killed Goblin! +100pts
// [Audio] *kill sound*
// [UI] Score: 100

events.KillEnemy("Dragon", 500);
events.EndGame();
```

### Tại sao Event quan trọng cho Unity?

Trong Unity, bạn sẽ dùng pattern này liên tục:
- Button onClick
- Collision events
- Animation events
- Custom game events (player died, level complete, item picked up)

Event giúp các hệ thống **không phụ thuộc trực tiếp** vào nhau. UIManager không cần biết GameManager tồn tại — nó chỉ lắng nghe events.

## Ví Dụ Tổng Hợp: Quest System

```csharp
class QuestManager
{
    public event Action<string> OnQuestCompleted;
    public event Action<string, int, int> OnQuestProgress;

    private Dictionary<string, (int current, int target)> quests = new();

    public void AddQuest(string name, int target)
    {
        quests[name] = (0, target);
        Console.WriteLine($"Quest mới: {name} (0/{target})");
    }

    public void UpdateProgress(string name, int amount = 1)
    {
        if (!quests.ContainsKey(name)) return;

        var (current, target) = quests[name];
        current += amount;
        quests[name] = (current, target);

        OnQuestProgress?.Invoke(name, current, target);

        if (current >= target)
        {
            OnQuestCompleted?.Invoke(name);
            quests.Remove(name);
        }
    }

    public List<string> GetActiveQuests()
    {
        return quests.Select(q => $"{q.Key}: {q.Value.current}/{q.Value.target}").ToList();
    }
}

// Setup
var qm = new QuestManager();
qm.OnQuestProgress += (name, cur, target)
    => Console.WriteLine($"  [{name}] Progress: {cur}/{target}");
qm.OnQuestCompleted += (name)
    => Console.WriteLine($"  ★ Quest '{name}' hoàn thành!");

// Gameplay
qm.AddQuest("Tiêu diệt 3 Goblin", 3);
qm.AddQuest("Thu thập 5 Herb", 5);

qm.UpdateProgress("Tiêu diệt 3 Goblin");
qm.UpdateProgress("Tiêu diệt 3 Goblin");
qm.UpdateProgress("Thu thập 5 Herb", 3);
qm.UpdateProgress("Tiêu diệt 3 Goblin");  // completed!
qm.UpdateProgress("Thu thập 5 Herb", 2);   // completed!
```

## Bài Tập

**Bài 1: Safe Inventory**
Tạo class `SafeInventory` với method `AddItem(string name, int quantity)`. Throw `ArgumentException` nếu name rỗng hoặc quantity <= 0. Throw custom `InventoryFullException` nếu đầy. Dùng try-catch khi sử dụng.

**Bài 2: LINQ Battle Report**
Cho list 20 enemies random (Name, HP, Damage, Type, IsAlive). Dùng LINQ: (a) Đếm enemy mỗi type, (b) Tìm enemy sống có damage cao nhất, (c) Tính tổng HP enemies đã chết, (d) Lấy top 5 enemy mạnh nhất còn sống.

**Bài 3: Event-Driven Shop**
Tạo `ShopSystem` với events: `OnItemBought`, `OnInsufficientGold`, `OnItemSold`. Tạo `WalletUI` và `InventoryUI` subscribe events. Mô phỏng mua/bán items.

---

**Bài trước:** [C# #6: OOP Nâng Cao](/lab/csharp-06-oop-advanced)
**Series tiếp theo:** [Unity Cơ Bản #1: GameObject, Component & Scene](/lab/unity-01-fundamentals)

Chúc mừng bạn đã hoàn thành series C# Cho Game Dev! Bạn đã nắm vững đủ kiến thức C# để bước vào Unity. Series tiếp theo sẽ áp dụng tất cả những gì bạn đã học vào game thực tế.
