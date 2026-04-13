---
title: "C# Cho Game Dev #5: OOP — Class, Object & Constructor"
date: "2024-10-28"
excerpt: "Bước vào lập trình hướng đối tượng. Tạo class, object, constructor, property và access modifiers — nền tảng để viết script trong Unity."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "OOP", "Game Development", "Course"]
published: true
featured: false
---

## Tại sao OOP?

Đến lúc này bạn đã biết biến, hàm, vòng lặp. Nhưng game thực tế có hàng trăm entity: Player, Enemy, NPC, Weapon, Item... Mỗi entity có **dữ liệu** riêng (HP, tên, vị trí) và **hành vi** riêng (Attack, Move, Die). OOP cho phép bạn gói dữ liệu + hành vi vào một đơn vị gọi là **class**.

Trong Unity, **mọi script đều là class**. Hiểu OOP = hiểu cách Unity hoạt động.

## Class & Object

**Class** là bản thiết kế. **Object** là thực thể tạo ra từ bản thiết kế đó.

```csharp
// Class = bản thiết kế
class Enemy
{
    public string name;
    public int health;
    public int damage;
}

// Object = thực thể cụ thể
Enemy goblin = new Enemy();
goblin.name = "Goblin";
goblin.health = 50;
goblin.damage = 10;

Enemy dragon = new Enemy();
dragon.name = "Dragon";
dragon.health = 500;
dragon.damage = 80;

Console.WriteLine($"{goblin.name}: {goblin.health}HP");
Console.WriteLine($"{dragon.name}: {dragon.health}HP");
```

Mỗi object có **dữ liệu riêng biệt**. Thay đổi `goblin.health` không ảnh hưởng đến `dragon.health`.

## Constructor — Khởi tạo object

Thay vì gán từng field thủ công, dùng constructor:

```csharp
class Enemy
{
    public string name;
    public int health;
    public int damage;

    // Constructor — cùng tên với class, không có return type
    public Enemy(string name, int health, int damage)
    {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }
}

// Tạo object gọn hơn nhiều
Enemy goblin = new Enemy("Goblin", 50, 10);
Enemy dragon = new Enemy("Dragon", 500, 80);
```

`this.name = name;` — `this` phân biệt field của class với parameter cùng tên.

### Constructor overloading

```csharp
class Enemy
{
    public string name;
    public int health;
    public int damage;

    // Constructor đầy đủ
    public Enemy(string name, int health, int damage)
    {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    // Constructor đơn giản — dùng default stats
    public Enemy(string name) : this(name, 100, 15) { }
}

Enemy custom = new Enemy("Boss", 1000, 50);
Enemy basic = new Enemy("Slime");  // health=100, damage=15
```

## Methods trong Class

```csharp
class Player
{
    public string name;
    public int health;
    public int maxHealth;
    public int attackPower;

    public Player(string name, int maxHealth, int attackPower)
    {
        this.name = name;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.attackPower = attackPower;
    }

    public void TakeDamage(int amount)
    {
        health -= amount;
        if (health < 0) health = 0;
        Console.WriteLine($"{name} nhận {amount} damage! HP: {health}/{maxHealth}");
    }

    public void Heal(int amount)
    {
        health += amount;
        if (health > maxHealth) health = maxHealth;
        Console.WriteLine($"{name} hồi {amount} HP! HP: {health}/{maxHealth}");
    }

    public bool IsAlive()
    {
        return health > 0;
    }

    public void Attack(Enemy target)
    {
        Console.WriteLine($"{name} tấn công {target.name}!");
        target.TakeDamage(attackPower);
    }
}
```

Sử dụng:

```csharp
Player hero = new Player("Knight", 100, 25);
Enemy goblin = new Enemy("Goblin", 50, 10);

hero.Attack(goblin);  // "Knight tấn công Goblin!"
                      // "Goblin nhận 25 damage! HP: 25/50"
```

## Access Modifiers — Kiểm soát truy cập

| Modifier | Truy cập |
|----------|---------|
| `public` | Mọi nơi |
| `private` | Chỉ trong class |
| `protected` | Trong class + class con (bài 6) |

```csharp
class BankAccount
{
    public string ownerName;
    private int balance;  // không cho truy cập trực tiếp từ ngoài

    public BankAccount(string owner, int initialBalance)
    {
        ownerName = owner;
        balance = initialBalance;
    }

    public int GetBalance()
    {
        return balance;
    }

    public bool Withdraw(int amount)
    {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }
}

BankAccount acc = new BankAccount("Bill", 1000);
// acc.balance = 999999;  // COMPILE ERROR! private
acc.Withdraw(200);        // OK, dùng method public
```

**Nguyên tắc:** Mặc định nên `private`. Chỉ `public` những gì cần thiết. Đây gọi là **encapsulation**.

## Properties — Getter/Setter thông minh

Properties thay thế pattern `GetX()` / `SetX()` bằng cú pháp tự nhiên hơn:

```csharp
class Character
{
    public string Name { get; set; }

    private int health;
    public int Health
    {
        get { return health; }
        set
        {
            health = value;
            if (health < 0) health = 0;
            if (health > MaxHealth) health = MaxHealth;
        }
    }

    public int MaxHealth { get; private set; }  // đọc được, không sửa từ ngoài

    public float HealthPercent => (float)health / MaxHealth;  // read-only computed

    public Character(string name, int maxHealth)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
    }
}

Character hero = new Character("Knight", 100);
hero.Health -= 30;  // gọi setter, tự clamp
Console.WriteLine($"HP: {hero.Health}/{hero.MaxHealth} ({hero.HealthPercent:P0})");
// "HP: 70/100 (70%)"

// hero.MaxHealth = 999;  // COMPILE ERROR! private set
```

### Auto-property — cho trường hợp đơn giản

```csharp
public string Name { get; set; }           // đọc + ghi
public int Level { get; private set; }     // đọc public, ghi chỉ trong class
public DateTime CreatedAt { get; } = DateTime.Now;  // read-only, gán 1 lần
```

Trong Unity, bạn sẽ thấy properties rất nhiều. Chúng là cách "chuẩn" để expose dữ liệu.

## Static Members — Thuộc về class, không thuộc object

```csharp
class GameManager
{
    public static int TotalScore { get; set; } = 0;
    public static int EnemiesKilled { get; set; } = 0;

    public static void AddScore(int points)
    {
        TotalScore += points;
        Console.WriteLine($"Score: {TotalScore}");
    }

    public static void Reset()
    {
        TotalScore = 0;
        EnemiesKilled = 0;
    }
}

// Gọi trực tiếp trên CLASS, không cần tạo object
GameManager.AddScore(100);
GameManager.EnemiesKilled++;
Console.WriteLine($"Killed: {GameManager.EnemiesKilled}");
```

`static` = chia sẻ giữa tất cả instances. Chỉ có **1 bản** duy nhất.

## Ví Dụ Tổng Hợp: RPG Character System

```csharp
class Character
{
    public string Name { get; set; }
    public int Level { get; private set; } = 1;
    public int Exp { get; private set; } = 0;
    public int MaxHealth { get; private set; }
    public int Health { get; private set; }
    public int Attack { get; private set; }

    private static int totalCharacters = 0;

    public Character(string name, int baseHealth, int baseAttack)
    {
        Name = name;
        MaxHealth = baseHealth;
        Health = baseHealth;
        Attack = baseAttack;
        totalCharacters++;
    }

    public void TakeDamage(int damage)
    {
        Health -= damage;
        if (Health < 0) Health = 0;
        Console.WriteLine($"  {Name} nhận {damage} dmg → HP: {Health}/{MaxHealth}");
    }

    public void GainExp(int amount)
    {
        Exp += amount;
        Console.WriteLine($"  {Name} +{amount} EXP (Total: {Exp})");

        while (Exp >= Level * 100)
        {
            Exp -= Level * 100;
            LevelUp();
        }
    }

    private void LevelUp()
    {
        Level++;
        MaxHealth += 10;
        Health = MaxHealth;  // full heal on level up
        Attack += 3;
        Console.WriteLine($"  ★ {Name} LEVEL UP! Lv.{Level} | HP:{MaxHealth} | ATK:{Attack}");
    }

    public bool IsAlive() => Health > 0;

    public static int GetTotalCharacters() => totalCharacters;

    public override string ToString()
    {
        return $"[Lv.{Level}] {Name} — HP:{Health}/{MaxHealth} ATK:{Attack} EXP:{Exp}";
    }
}

// === Sử dụng ===
Character hero = new Character("Knight", 100, 20);
Character mage = new Character("Mage", 70, 35);

Console.WriteLine(hero);
Console.WriteLine(mage);
Console.WriteLine($"Tổng characters: {Character.GetTotalCharacters()}\n");

hero.TakeDamage(25);
hero.GainExp(150);  // level up!

mage.GainExp(80);
mage.GainExp(120);  // level up!
```

## Bài Tập

**Bài 1: Weapon Class**
Tạo class `Weapon` với properties: Name, Damage, Durability, WeaponType (dùng enum). Method `Use()` giảm durability 1, `Repair(int amount)`, `IsBroken()`. Tạo 3 vũ khí khác nhau, dùng thử và in trạng thái.

**Bài 2: Inventory Class**
Tạo class `Inventory` chứa `List<string>` items, `int capacity`. Methods: `AddItem(string)` (trả false nếu đầy), `RemoveItem(string)`, `ShowAll()`, property `IsFull`. Tạo inventory 5 slots, thêm/xóa items.

**Bài 3: Monster Factory**
Tạo class `Monster` với static field `totalSpawned`. Constructor tự tăng counter. Tạo 10 monsters trong vòng lặp với random stats. Cuối cùng in `totalSpawned` và tìm monster có HP cao nhất.

---

**Bài trước:** [C# #4: Methods & Enum](/lab/csharp-04-methods)
**Bài tiếp:** [C# #6: OOP Nâng Cao — Inheritance & Interface](/lab/csharp-06-oop-advanced)
