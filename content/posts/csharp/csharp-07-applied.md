---
title: "C# cho người mới #7: Exception, LINQ và delegate"
date: "2024-11-01"
lang: "vi"
series: "csharp"
order: 7
excerpt: "Bài cuối của series C#: xử lý lỗi bằng exception và TryParse, lọc và sắp xếp dữ liệu bằng LINQ, rồi dùng delegate và event để các hệ thống báo tin cho nhau."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "LINQ", "Game Development", "Course"]
published: true
featured: false
---

## Ba thứ sẽ gặp lại ngay trong Unity

Bài này gồm 3 chủ đề bạn sẽ dùng **ngay khi bắt đầu Unity**: xử lý lỗi bằng exception, xử lý collection bằng LINQ, và delegate/event để các phần của game báo tin cho nhau.

## Xử lý lỗi bằng exception

### Vấn đề

```csharp
string input = "abc";
int number = int.Parse(input);  // Lỗi! FormatException
```

Trong một chương trình console, exception không ai bắt sẽ làm chương trình dừng hẳn. Trong Unity thì khác: nếu exception xảy ra trong `Update`, Unity in lỗi đỏ ra Console và bỏ qua phần còn lại của lần gọi `Update` đó. Game vẫn chạy tiếp, nhưng những dòng sau chỗ lỗi không được chạy, ví dụ máu không bị trừ hay điểm không được cộng. Vì vậy dù không crash, lỗi vẫn phải xử lý.

### Try-catch-finally

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

- `try`: phần code có thể gây lỗi
- `catch`: bắt từng loại lỗi cụ thể
- `finally`: phần dọn dẹp, luôn chạy

### TryParse: cách tốt hơn cho việc đọc số

```csharp
Console.Write("Nhập damage: ");
string input = Console.ReadLine();

if (int.TryParse(input, out int damage))
{
    Console.WriteLine($"Damage: {damage}");
}
else
{
    Console.WriteLine("Input không hợp lệ, dùng damage mặc định");
    damage = 10;
}
```

`TryParse` trả về `bool` và không ném exception, nên nhẹ hơn. **Với việc chuyển chuỗi sang số, ưu tiên TryParse thay vì try-catch.**

### Tự tạo exception

```csharp
int playerGold = 50;
try
{
    Shop.Buy("Potion", 25, ref playerGold);   // OK
    Shop.Buy("Sword", 100, ref playerGold);   // ném exception!
}
catch (InsufficientGoldException ex)
{
    Console.WriteLine($"Không đủ tiền! {ex.Message}");
}

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
```

## LINQ: truy vấn collection

Muốn lấy các enemy còn trên 40 HP, xếp theo damage, bạn có thể tự viết vòng lặp, tạo list tạm, rồi tự sắp xếp. LINQ (Language Integrated Query) làm việc đó trong một hai dòng: lọc, sắp xếp, biến đổi collection.

### Chuẩn bị: danh sách enemy

```csharp
List<Enemy> enemies = new List<Enemy>
{
    new Enemy { Name = "Goblin",   Health = 50,  Damage = 10, Type = "Melee" },
    new Enemy { Name = "Archer",   Health = 40,  Damage = 15, Type = "Ranged" },
    new Enemy { Name = "Dragon",   Health = 500, Damage = 80, Type = "Boss" },
    new Enemy { Name = "Slime",    Health = 20,  Damage = 5,  Type = "Melee" },
    new Enemy { Name = "Wizard",   Health = 60,  Damage = 40, Type = "Ranged" },
    new Enemy { Name = "Skeleton", Health = 45,  Damage = 12, Type = "Melee" },
};

// Các đoạn LINQ bên dưới viết tiếp ở đây, trước khai báo class

class Enemy
{
    public string Name { get; set; }
    public int Health { get; set; }
    public int Damage { get; set; }
    public string Type { get; set; }
}
```

### Where: lọc

```csharp
// Lấy enemy có HP > 40
var strong = enemies.Where(e => e.Health > 40);
foreach (var e in strong)
    Console.WriteLine($"{e.Name}: {e.Health}HP");
// Goblin, Dragon, Wizard, Skeleton
```

Archer có đúng 40 HP nên không lọt qua điều kiện `> 40`.

`e => e.Health > 40` là **lambda expression**, một hàm không tên viết gọn. Đọc là "những e mà e.Health lớn hơn 40".

### Select: biến đổi

```csharp
// Chỉ lấy tên
List<string> names = enemies.Select(e => e.Name).ToList();
// ["Goblin", "Archer", "Dragon", ...]

// Tạo chuỗi để hiển thị
var display = enemies.Select(e => $"{e.Name} ({e.Type}) - {e.Health}HP");
```

### OrderBy: sắp xếp

```csharp
// Sắp theo damage tăng dần
var byDamage = enemies.OrderBy(e => e.Damage);

// Giảm dần
var strongest = enemies.OrderByDescending(e => e.Damage);

// Sắp theo type, rồi theo damage
var sorted = enemies.OrderBy(e => e.Type).ThenByDescending(e => e.Damage);
```

### First và FirstOrDefault

```csharp
Enemy boss = enemies.First(e => e.Type == "Boss");       // Dragon
Enemy weakest = enemies.OrderBy(e => e.Health).First();   // Slime

// FirstOrDefault: trả về null nếu không tìm thấy, thay vì ném lỗi như First
Enemy healer = enemies.FirstOrDefault(e => e.Type == "Healer");  // null
```

### Tổng hợp số liệu

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

### Nối nhiều bước

```csharp
// 3 enemy không phải boss có damage cao nhất
var top3 = enemies
    .Where(e => e.Type != "Boss")
    .OrderByDescending(e => e.Damage)
    .Take(3)
    .Select(e => $"{e.Name}: {e.Damage} dmg");

foreach (var s in top3)
    Console.WriteLine(s);
```

Chuỗi LINQ đọc từ trên xuống như một dây chuyền: lọc, sắp xếp, lấy 3, định dạng.

### Any và All: kiểm tra điều kiện

```csharp
bool hasBoss = enemies.Any(e => e.Type == "Boss");        // true
bool allAlive = enemies.All(e => e.Health > 0);            // true
bool hasHealer = enemies.Any(e => e.Type == "Healer");     // false
```

**Lưu ý khi sang Unity:** LINQ tạo ra rác bộ nhớ (garbage) mỗi lần chạy, nên tránh dùng trong `Update` hay những chỗ chạy mỗi frame. Dùng nó ở chỗ chạy thỉnh thoảng, như lúc load màn hoặc mở menu.

## Delegate và event

Delegate là "biến chứa hàm". Event là cách một object báo cho những object khác biết có chuyện vừa xảy ra, mà không cần biết ai đang nghe.

### Delegate cơ bản

```csharp
Player player = new Player();
player.onDamaged += (dmg) => Console.WriteLine($"Mất {dmg} HP");
player.TakeDamage(20);  // "Mất 20 HP"

// Khai báo kiểu delegate
delegate void OnDamageReceived(int damage);

class Player
{
    public int Health { get; set; } = 100;

    // Field kiểu delegate: chứa các hàm sẽ được gọi khi nhận damage
    public OnDamageReceived onDamaged;

    public void TakeDamage(int amount)
    {
        Health -= amount;
        onDamaged?.Invoke(amount);  // gọi mọi hàm đã đăng ký
    }
}
```

### Action và Func: delegate có sẵn

Thay vì tự khai báo delegate, C# có sẵn hai loại dùng cho hầu hết trường hợp:

```csharp
// Action: delegate không trả về giá trị
Action<string> onLog = (msg) => Console.WriteLine($"[LOG] {msg}");
Action<int, int> onDamage = (dmg, hp) => Console.WriteLine($"-{dmg}HP → {hp}");

// Func: delegate CÓ trả về giá trị (kiểu cuối cùng là kiểu trả về)
Func<int, int, int> calculateDamage = (baseDmg, armor) => baseDmg - armor;
int result = calculateDamage(50, 15);  // 35
```

### Event: cách dùng trong thực tế

Field delegate ở phần trên có một điểm yếu: code bên ngoài có thể gán đè `player.onDamaged = null` và xóa mất mọi hàm đã đăng ký, hoặc tự gọi nó. Thêm từ khóa `event` thì bên ngoài chỉ được `+=` (đăng ký) và `-=` (hủy đăng ký), còn việc gọi chỉ class chủ làm được.

```csharp
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

// === Các hệ thống lắng nghe event ===
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
```

### Event trong Unity

Ý tưởng "một bên báo, nhiều bên nghe" xuất hiện khắp nơi trong Unity, nhưng không phải chỗ nào cũng là C# event. Người mới hay gộp chung, nên cần tách ra:

- `Button.onClick` là một **UnityEvent**, kiểu event riêng của Unity. Bạn đăng ký hàm bằng `AddListener` trong code hoặc kéo thả trong Inspector.
- `OnCollisionEnter`, `OnTriggerEnter`, `Update` là **message method**: bạn chỉ cần viết hàm đúng tên trong script, Unity tự tìm và gọi. Không có `+=` nào ở đây.
- Event của riêng game bạn (người chơi chết, qua màn, nhặt item) thì viết bằng C# event hoặc `Action` như ví dụ trên.

Lợi ích của event là các hệ thống **không phụ thuộc trực tiếp** vào nhau. UIManager không cần biết code nào gây ra việc enemy chết, nó chỉ nghe event.

## Ví dụ tổng hợp: hệ thống nhiệm vụ

```csharp
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
qm.UpdateProgress("Tiêu diệt 3 Goblin");  // hoàn thành!
qm.UpdateProgress("Thu thập 5 Herb", 2);   // hoàn thành!

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
```

## Bài tập

**Bài 1: Inventory an toàn**
Tạo class `SafeInventory` với hàm `AddItem(string name, int quantity)`. Ném `ArgumentException` nếu tên rỗng hoặc quantity <= 0. Ném exception tự tạo `InventoryFullException` nếu đầy. Dùng try-catch khi gọi.

**Bài 2: Báo cáo trận đánh bằng LINQ**
Cho list 20 enemy ngẫu nhiên (Name, HP, Damage, Type, IsAlive). Dùng LINQ để: (a) đếm enemy theo từng type, (b) tìm enemy còn sống có damage cao nhất, (c) tính tổng HP của các enemy đã chết, (d) lấy 5 enemy mạnh nhất còn sống.

**Bài 3: Cửa hàng dùng event**
Tạo `ShopSystem` với các event: `OnItemBought`, `OnInsufficientGold`, `OnItemSold`. Tạo `WalletUI` và `InventoryUI` đăng ký các event đó. Mô phỏng vài lần mua và bán.

---

**Bài trước:** [C# cho người mới #6: Kế thừa, interface và đa hình](/lab/csharp-06-oop-advanced)

**Tiếp theo:** đây là bài cuối của phần C#. Bước tiếp theo là mở Unity 6 và bắt đầu làm game thật với series [Làm game bắn máy bay với Unity 6](/lab/unity-shmup-00-setup). Những thứ bạn gặp ở đó như class, property, `[SerializeField]` hay `event Action` đều đã có trong 7 bài này.
