---
title: "C# cho người mới #6: Kế thừa, interface và đa hình"
date: "2024-10-30"
lang: "vi"
series: "csharp"
order: 6
excerpt: "Dùng kế thừa để không phải chép code giữa Goblin, Archer và Boss, dùng abstract class và interface để nhiều loại object dùng chung một đoạn code xử lý."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "OOP", "Game Development", "Course"]
published: true
featured: false
---

## Bài toán mở đầu

Bạn có class `Enemy`. Giờ cần thêm Goblin (đánh gần), Archer (bắn xa) và Boss. Cả ba đều có HP, Name, `TakeDamage()` giống hệt nhau, chỉ `Attack()` là khác. Chép class ra 3 lần thì chạy được, nhưng mỗi lần sửa một bug trong `TakeDamage()` bạn phải sửa 3 chỗ. Cách đúng là **kế thừa** (inheritance).

Như bài trước, trong các ví dụ dưới đây code chạy nằm ở trên, khai báo class nằm ở dưới cùng.

## Kế thừa

Class con **kế thừa** mọi thứ từ class cha, rồi thêm hoặc thay đổi phần riêng của nó.

```csharp
Goblin g = new Goblin();
Archer a = new Archer();

g.Attack();       // "Goblin lao vào cắn! Damage: 10"
a.Attack();       // "Archer bắn tên từ khoảng cách 20! Damage: 15"
g.TakeDamage(20); // "Goblin nhận 20 dmg → HP: 30", hàm này kế thừa từ Enemy

// Class cha: chứa phần dùng chung
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

// Class con: kế thừa Enemy
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

### Từ khóa cần nhớ

- `: Enemy`: kế thừa từ class Enemy
- `: base(...)`: gọi constructor của class cha
- `virtual`: cho phép class con **ghi đè** hàm này
- `override`: class con ghi đè hàm của cha

## Protected: cho class con truy cập

Field `private` thì class con cũng không đụng vào được. Muốn giấu với bên ngoài nhưng vẫn cho class con dùng, hãy dùng `protected`:

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
        health += 200;  // OK vì health là protected và Boss là class con
        Console.WriteLine($"{Name} nổi giận! HP tăng lên {health}!");
    }
}
```

| Modifier | Trong class | Class con | Bên ngoài |
|----------|:---------:|:--------:|:--------:|
| `public` | O | O | O |
| `protected` | O | O | X |
| `private` | O | X | X |

## Abstract class: class không tạo trực tiếp được

Có những class cha chỉ là **khái niệm chung**. Không ai tạo một "Skill" chung chung, bạn chỉ tạo Fireball hay Heal cụ thể. Đánh dấu class là `abstract` để compiler chặn việc tạo object từ nó.

Ví dụ này cần một class `Character` làm mục tiêu cho skill, nên có thêm một `Character` đơn giản ở cuối, có sẵn `TakeDamage` và `Heal`:

```csharp
Character hero = new Character("Knight", 100);
Fireball fb = new Fireball();
HealSpell heal = new HealSpell();

fb.ShowInfo();       // kế thừa từ Skill
fb.Execute(hero);    // Knight mất 60 HP
heal.Execute(hero);  // Knight hồi 40 HP

// Skill skill = new Skill("?", 0);  // LỖI COMPILE! Không tạo được object từ abstract class

abstract class Skill
{
    public string Name { get; set; }
    public int ManaCost { get; set; }

    public Skill(string name, int manaCost)
    {
        Name = name;
        ManaCost = manaCost;
    }

    // Hàm abstract: class con BẮT BUỘC phải viết phần thân
    public abstract void Execute(Character target);

    // Hàm thường: class con dùng luôn
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

// Mục tiêu của skill
class Character
{
    public string Name { get; set; }
    public int Health { get; private set; }
    public int MaxHealth { get; private set; }

    public Character(string name, int maxHealth)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
    }

    public void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health < 0) Health = 0;
        Console.WriteLine($"  {Name}: HP {Health}/{MaxHealth}");
    }

    public void Heal(int amount)
    {
        Health += amount;
        if (Health > MaxHealth) Health = MaxHealth;
        Console.WriteLine($"  {Name}: HP {Health}/{MaxHealth}");
    }
}
```

## Interface: bản cam kết về hành vi

Kế thừa có một giới hạn: mỗi class chỉ có **một** class cha. Một cái thùng gỗ bị bắn vỡ được, nhân vật cũng bị bắn được, nhưng thùng gỗ không phải nhân vật, bắt nó kế thừa `Character` là sai. Interface giải quyết chuyện này: nó chỉ ghi ra class phải có những hàm nào, không chứa logic. Một class có thể implement **nhiều interface**.

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

Quy ước: tên interface bắt đầu bằng chữ `I`.

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

// Thùng gỗ phá được: nhận damage nhưng không hồi máu, không di chuyển
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

### Interface có ích ở chỗ nào?

Bạn viết được một đoạn code **dùng chung** cho mọi thứ implement cùng interface:

```csharp
// Gây damage cho BẤT CỨ THỨ GÌ là IDamageable
void DealAreaDamage(List<IDamageable> targets, int damage)
{
    foreach (IDamageable target in targets)
    {
        if (target.IsAlive)
            target.TakeDamage(damage);
    }
}
```

Player, Enemy, Barrel, Crystal đều nhận damage qua cùng một hàm này. Đó chính là **đa hình** (polymorphism).

## Đa hình

Cùng một lời gọi hàm, nhưng mỗi object chạy phiên bản của riêng nó:

```csharp
// Đa hình: cùng kiểu Shape, hành vi khác nhau
List<Shape> shapes = new List<Shape>
{
    new Circle(5),
    new Rectangle(3, 4),
    new Circle(10)
};

foreach (Shape shape in shapes)
{
    shape.Draw();  // gọi đúng hàm của class con
    Console.WriteLine($"  Diện tích: {shape.Area():F2}");
}

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
```

## Ví dụ tổng hợp: hệ thống nhân vật

```csharp
Warrior knight = new Warrior("Knight", 120, 25, 8);
Mage wizard = new Mage("Wizard", 70, 20, 50);
Warrior orc = new Warrior("Orc", 100, 30, 5);

Console.WriteLine("=== BATTLE START ===\n");
knight.Attack(orc);   // Orc có giáp, còn 80 HP
wizard.Attack(orc);   // Phép gây x2 damage, Orc còn 45 HP
orc.Attack(knight);   // Knight có giáp, còn 98 HP
wizard.Attack(orc);   // Orc còn 10 HP
knight.Attack(orc);   // Orc bị hạ

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
```

## Bài tập

**Bài 1: Thế giới động vật**
Tạo abstract class `Animal` (Name, Sound). Các class con: `Dog`, `Cat`, `Bird`, mỗi con override `MakeSound()`. Tạo `List<Animal>`, duyệt và gọi `MakeSound()` để thấy đa hình hoạt động.

**Bài 2: Vật phẩm dùng được**
Tạo interface `IUseable` với hàm `Use(Character target)` (dùng lại class `Character` ở phần abstract class). Implement: `HealthPotion` (hồi 50 HP), `DamageScroll` (gây 30 damage), `Shield` (tăng giáp 10, bạn tự thêm property giáp vào `Character`). Tạo list `IUseable`, duyệt và dùng từng món.

**Bài 3: Cây phân cấp**
Tạo abstract `Entity`, từ đó ra `Character`, rồi ra `Player` và `NPC`. Tạo `Destructible`, từ đó ra `Barrel` và `Crate`. Interface `IInteractable` dành cho NPC và Crate. Tạo một list trộn lẫn các loại và cho chúng tương tác.

---

**Bài trước:** [C# cho người mới #5: Class, object và constructor](/lab/csharp-05-oop-basics)
**Bài tiếp:** [C# cho người mới #7: Exception, LINQ và delegate](/lab/csharp-07-applied)
