---
title: "C# Cho Game Dev #6: OOP Nâng Cao — Inheritance, Interface & Polymorphism"
date: "2024-10-30"
excerpt: "Inheritance, abstract class, interface và polymorphism — những công cụ mạnh mẽ giúp bạn xây dựng hệ thống game linh hoạt và mở rộng được."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "OOP", "Game Development", "Course"]
published: true
featured: false
---

## Bài toán mở đầu

Bạn có class `Enemy`. Giờ bạn cần Goblin (melee), Archer (ranged), và Boss (đặc biệt). Cả 3 đều có HP, Name, TakeDamage() giống nhau, nhưng Attack() khác nhau. Copy-paste 3 lần? Sửa bug phải sửa 3 chỗ? Không. Bạn cần **Inheritance**.

## Inheritance — Kế thừa

Class con **kế thừa** mọi thứ từ class cha, rồi thêm/thay đổi những gì cần thiết.

```csharp
// Class cha — chứa logic chung
class Enemy
{
    public string Name { get; set; }
    public int Health { get; set; }
    public int Damage { get; set; }

    public Enemy(string name, int health, int damage)
    {
        Name = name;
        Health = health;
        Damage = damage;
    }

    public void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health < 0) Health = 0;
        Console.WriteLine($"{Name} nhận {amount} dmg → HP: {Health}");
    }

    public virtual void Attack()
    {
        Console.WriteLine($"{Name} tấn công gây {Damage} damage!");
    }
}

// Class con — kế thừa Enemy
class Goblin : Enemy
{
    public Goblin() : base("Goblin", 50, 10) { }

    public override void Attack()
    {
        Console.WriteLine($"{Name} lao vào cắn! Damage: {Damage}");
    }
}

class Archer : Enemy
{
    public int Range { get; set; }

    public Archer() : base("Archer", 40, 15)
    {
        Range = 20;
    }

    public override void Attack()
    {
        Console.WriteLine($"{Name} bắn tên từ khoảng cách {Range}! Damage: {Damage}");
    }
}
```

### Từ khóa quan trọng

- `: Enemy` — kế thừa từ class Enemy
- `: base(...)` — gọi constructor của class cha
- `virtual` — cho phép class con **ghi đè** method này
- `override` — class con ghi đè method của cha

```csharp
Goblin g = new Goblin();
Archer a = new Archer();

g.Attack();       // "Goblin lao vào cắn! Damage: 10"
a.Attack();       // "Archer bắn tên từ khoảng cách 20! Damage: 15"
g.TakeDamage(20); // "Goblin nhận 20 dmg → HP: 30" — kế thừa từ Enemy
```

## Protected — Truy cập từ class con

```csharp
class Enemy
{
    public string Name { get; set; }
    protected int health;  // class con truy cập được, bên ngoài thì không

    public Enemy(string name, int health)
    {
        Name = name;
        this.health = health;
    }
}

class Boss : Enemy
{
    public Boss(string name) : base(name, 1000) { }

    public void Rage()
    {
        health += 200;  // OK — protected, truy cập từ class con
        Console.WriteLine($"{Name} nổi giận! HP tăng lên {health}!");
    }
}
```

| Modifier | Trong class | Class con | Bên ngoài |
|----------|:---------:|:--------:|:--------:|
| `public` | O | O | O |
| `protected` | O | O | X |
| `private` | O | X | X |

## Abstract Class — Class không thể tạo trực tiếp

Đôi khi class cha chỉ là **khái niệm**, không nên tạo object trực tiếp. Bạn không bao giờ tạo "Enemy" chung chung — bạn tạo Goblin, Dragon, Slime cụ thể.

```csharp
abstract class Skill
{
    public string Name { get; set; }
    public int ManaCost { get; set; }

    public Skill(string name, int manaCost)
    {
        Name = name;
        ManaCost = manaCost;
    }

    // Abstract method — BẮT BUỘC class con phải implement
    public abstract void Execute(Character target);

    // Method thường — class con kế thừa luôn
    public void ShowInfo()
    {
        Console.WriteLine($"[{Name}] Mana: {ManaCost}");
    }
}

class Fireball : Skill
{
    public int Damage { get; set; }

    public Fireball() : base("Fireball", 30)
    {
        Damage = 60;
    }

    public override void Execute(Character target)
    {
        Console.WriteLine($"Fireball! {target.Name} nhận {Damage} fire damage!");
        target.TakeDamage(Damage);
    }
}

class HealSpell : Skill
{
    public int HealAmount { get; set; }

    public HealSpell() : base("Heal", 20)
    {
        HealAmount = 40;
    }

    public override void Execute(Character target)
    {
        Console.WriteLine($"Heal! {target.Name} hồi {HealAmount} HP!");
        target.Heal(HealAmount);
    }
}

// Skill skill = new Skill("?", 0);  // COMPILE ERROR! Không thể tạo abstract class
Fireball fb = new Fireball();
fb.ShowInfo();  // kế thừa từ Skill
```

## Interface — Hợp đồng hành vi

Interface định nghĩa **hành vi** mà class phải thực hiện, nhưng không chứa logic. Một class có thể implement **nhiều interface** (khác với inheritance chỉ 1 class cha).

```csharp
interface IDamageable
{
    void TakeDamage(int amount);
    bool IsAlive { get; }
}

interface IHealable
{
    void Heal(int amount);
}

interface IMoveable
{
    void MoveTo(float x, float y);
    float Speed { get; }
}
```

Convention: Interface bắt đầu bằng chữ `I`.

### Implement interface

```csharp
class Player : IDamageable, IHealable, IMoveable
{
    public string Name { get; set; }
    public int Health { get; set; }
    public int MaxHealth { get; set; }
    public float Speed { get; } = 5.0f;

    public bool IsAlive => Health > 0;

    public Player(string name, int maxHealth)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
    }

    public void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health < 0) Health = 0;
    }

    public void Heal(int amount)
    {
        Health += amount;
        if (Health > MaxHealth) Health = MaxHealth;
    }

    public void MoveTo(float x, float y)
    {
        Console.WriteLine($"{Name} di chuyển đến ({x}, {y})");
    }
}

// Destructible barrel — nhận damage nhưng không heal, không di chuyển
class Barrel : IDamageable
{
    public int Health { get; set; } = 30;
    public bool IsAlive => Health > 0;

    public void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health <= 0) Console.WriteLine("Thùng nổ tung!");
    }
}
```

### Tại sao Interface quan trọng?

Vì bạn có thể viết code **chung** cho mọi thứ implement cùng interface:

```csharp
// Hàm gây damage cho BẤT CỨ THỨ GÌ IDamageable
void DealAreaDamage(List<IDamageable> targets, int damage)
{
    foreach (IDamageable target in targets)
    {
        if (target.IsAlive)
            target.TakeDamage(damage);
    }
}
```

Player, Enemy, Barrel, Crystal — tất cả đều nhận damage qua cùng 1 hàm. Đây chính là **Polymorphism**.

## Polymorphism — Đa hình

Cùng một method call, hành vi khác nhau tùy object thực tế:

```csharp
abstract class Shape
{
    public abstract float Area();
    public abstract void Draw();
}

class Circle : Shape
{
    public float Radius { get; set; }
    public Circle(float radius) { Radius = radius; }

    public override float Area() => MathF.PI * Radius * Radius;
    public override void Draw() => Console.WriteLine($"Vẽ hình tròn, r={Radius}");
}

class Rectangle : Shape
{
    public float Width { get; set; }
    public float Height { get; set; }
    public Rectangle(float w, float h) { Width = w; Height = h; }

    public override float Area() => Width * Height;
    public override void Draw() => Console.WriteLine($"Vẽ hình chữ nhật {Width}x{Height}");
}

// Polymorphism: cùng kiểu Shape, hành vi khác nhau
List<Shape> shapes = new List<Shape>
{
    new Circle(5),
    new Rectangle(3, 4),
    new Circle(10)
};

foreach (Shape shape in shapes)
{
    shape.Draw();  // gọi đúng method của class con
    Console.WriteLine($"  Diện tích: {shape.Area():F2}");
}
```

## Ví Dụ Tổng Hợp: Entity System

```csharp
interface IDamageable
{
    int Health { get; }
    void TakeDamage(int amount);
    bool IsAlive { get; }
}

interface IAttacker
{
    int AttackPower { get; }
    void Attack(IDamageable target);
}

abstract class GameEntity : IDamageable
{
    public string Name { get; set; }
    public int Health { get; protected set; }
    public int MaxHealth { get; protected set; }
    public bool IsAlive => Health > 0;

    public GameEntity(string name, int maxHealth)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
    }

    public virtual void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health < 0) Health = 0;
        Console.WriteLine($"  {Name}: -{amount}HP → {Health}/{MaxHealth}");
        if (!IsAlive) OnDeath();
    }

    protected virtual void OnDeath()
    {
        Console.WriteLine($"  {Name} đã bị tiêu diệt!");
    }
}

class Warrior : GameEntity, IAttacker
{
    public int AttackPower { get; set; }
    public int Armor { get; set; }

    public Warrior(string name, int hp, int atk, int armor)
        : base(name, hp)
    {
        AttackPower = atk;
        Armor = armor;
    }

    public override void TakeDamage(int amount)
    {
        int reduced = amount - Armor;
        if (reduced < 1) reduced = 1;
        base.TakeDamage(reduced);
    }

    public void Attack(IDamageable target)
    {
        Console.WriteLine($"{Name} chém!");
        target.TakeDamage(AttackPower);
    }
}

class Mage : GameEntity, IAttacker
{
    public int AttackPower { get; set; }
    public int Mana { get; set; }

    public Mage(string name, int hp, int atk, int mana)
        : base(name, hp)
    {
        AttackPower = atk;
        Mana = mana;
    }

    public void Attack(IDamageable target)
    {
        if (Mana >= 10)
        {
            Mana -= 10;
            Console.WriteLine($"{Name} phóng phép! (Mana: {Mana})");
            target.TakeDamage(AttackPower * 2);
        }
        else
        {
            Console.WriteLine($"{Name} đánh thường (hết mana)");
            target.TakeDamage(AttackPower);
        }
    }
}

// === Battle ===
Warrior knight = new Warrior("Knight", 120, 25, 8);
Mage wizard = new Mage("Wizard", 70, 20, 50);
Warrior orc = new Warrior("Orc", 100, 30, 5);

Console.WriteLine("=== BATTLE START ===\n");
knight.Attack(orc);   // Orc có armor
wizard.Attack(orc);   // Magic damage x2
orc.Attack(knight);   // Knight có armor
wizard.Attack(orc);   // finish off
```

## Bài Tập

**Bài 1: Animal Kingdom**
Tạo abstract class `Animal` (Name, Sound). Class con: `Dog`, `Cat`, `Bird`. Mỗi con override `MakeSound()`. Tạo `List<Animal>`, duyệt và gọi `MakeSound()` — polymorphism.

**Bài 2: Skill System**
Tạo interface `IUseable` với method `Use(Character target)`. Implement: `HealthPotion` (heal 50), `DamageScroll` (deal 30 dmg), `Shield` (tăng armor 10). Tạo list `IUseable` items, duyệt và dùng.

**Bài 3: Entity Hierarchy**
Tạo abstract `Entity` → `Character` → `Player` / `NPC`. Tạo `Destructible` → `Barrel` / `Crate`. Interface `IInteractable` cho NPC và Crate. Tạo mixed list và tương tác.

---

**Bài trước:** [C# #5: OOP Basics](/lab/csharp-05-oop-basics)
**Bài tiếp:** [C# #7: Ứng Dụng — Exception, LINQ & Delegate](/lab/csharp-07-applied)
