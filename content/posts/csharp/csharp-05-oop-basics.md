---
title: "C# cho người mới #5: Class, object và constructor"
date: "2024-10-28"
lang: "vi"
series: "csharp"
order: 5
excerpt: "Gói dữ liệu và hành vi của một nhân vật vào class, tạo object bằng constructor, giấu dữ liệu bằng private và property. Mọi script Unity đều là class, nên bài này rất đáng làm kỹ."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "OOP", "Game Development", "Course"]
published: true
featured: false
---

## Vì sao cần OOP

Tới đây bạn đã biết biến, hàm, vòng lặp. Nhưng game thật có hàng trăm thứ: Player, Enemy, NPC, Weapon, Item... Nếu mỗi enemy là ba biến rời `goblinName`, `goblinHealth`, `goblinDamage`, thì 50 enemy là 150 biến, và không có gì cho biết biến nào đi với biến nào. Mỗi thứ trong game có **dữ liệu** riêng (HP, tên, vị trí) và **hành vi** riêng (Attack, Move, Die). OOP cho phép gói dữ liệu và hành vi vào chung một chỗ gọi là **class**.

Trong Unity, **mọi script đều là class**. Hiểu class là hiểu cách script Unity được viết ra.

Nhắc lại từ bài 4: khi dùng top-level statements, code chạy nằm ở trên, khai báo `class` nằm ở dưới cùng file. Các ví dụ dưới đây đều theo thứ tự đó.

## Class và object

**Class** là bản thiết kế. **Object** là một thứ cụ thể được tạo ra từ bản thiết kế đó.

```csharp
// Object = thứ cụ thể tạo từ class
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

// Class = bản thiết kế
class Enemy
{
    public string name;
    public int health;
    public int damage;
}
```

Mỗi object giữ **dữ liệu riêng**. Đổi `goblin.health` không ảnh hưởng tới `dragon.health`.

## Constructor: khởi tạo object

Gán từng field bằng tay như trên vừa dài vừa dễ quên một field. Constructor cho bạn truyền đủ dữ liệu ngay lúc tạo object:

```csharp
// Tạo object gọn hơn nhiều
Enemy goblin = new Enemy("Goblin", 50, 10);
Enemy dragon = new Enemy("Dragon", 500, 80);

class Enemy
{
    public string name;
    public int health;
    public int damage;

    // Constructor: cùng tên với class, không có kiểu trả về
    public Enemy(string name, int health, int damage)
    {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }
}
```

Trong `this.name = name;`, `this.name` là field của object, còn `name` là tham số. `this` dùng để phân biệt hai cái cùng tên.

### Nhiều constructor

```csharp
Enemy custom = new Enemy("Boss", 1000, 50);
Enemy basic = new Enemy("Slime");  // health=100, damage=15

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

    // Constructor rút gọn: dùng chỉ số mặc định
    public Enemy(string name) : this(name, 100, 15) { }
}
```

## Hàm trong class

Ngoài dữ liệu, class còn chứa các hàm làm việc với dữ liệu đó. Ví dụ dưới đây có `Player` tấn công `Enemy`. Để `Attack` gọi được `target.TakeDamage(...)`, class `Enemy` cũng phải có hàm `TakeDamage`:

```csharp
Player hero = new Player("Knight", 100, 25);
Enemy goblin = new Enemy("Goblin", 50, 10);

hero.Attack(goblin);  // "Knight tấn công Goblin!"
                      // "Goblin nhận 25 damage! HP: 25"

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

class Enemy
{
    public string name;
    public int health;
    public int damage;

    public Enemy(string name, int health, int damage)
    {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    public void TakeDamage(int amount)
    {
        health -= amount;
        if (health < 0) health = 0;
        Console.WriteLine($"{name} nhận {amount} damage! HP: {health}");
    }
}
```

## Access modifier: ai được đụng vào

Nếu mọi field đều `public`, bất kỳ đoạn code nào cũng có thể gán `health = -500` hay `gold = 999999`, và bạn không biết lỗi đến từ đâu. Access modifier giới hạn ai được đọc và sửa:

| Modifier | Truy cập |
|----------|---------|
| `public` | Mọi nơi |
| `private` | Chỉ trong class |
| `protected` | Trong class và class con (bài 6) |

```csharp
BankAccount acc = new BankAccount("Bill", 1000);
// acc.balance = 999999;  // LỖI COMPILE! balance là private
acc.Withdraw(200);        // OK, đi qua hàm public

class BankAccount
{
    public string ownerName;
    private int balance;  // bên ngoài không truy cập trực tiếp được

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
```

**Nguyên tắc:** mặc định để `private`, chỉ `public` những gì bên ngoài thật sự cần. Cách làm này gọi là **đóng gói** (encapsulation).

## Property: getter và setter gọn hơn

Viết cặp hàm `GetHealth()` / `SetHealth()` cho từng field thì dài dòng. Property cho bạn đọc ghi như một field, nhưng vẫn chen được logic kiểm tra vào giữa:

```csharp
Character hero = new Character("Knight", 100);
hero.Health -= 30;  // gọi setter, tự giới hạn trong khoảng hợp lệ
Console.WriteLine($"HP: {hero.Health}/{hero.MaxHealth} ({hero.HealthPercent:P0})");
// "HP: 70/100 (70%)"

// hero.MaxHealth = 999;  // LỖI COMPILE! setter là private

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

    public int MaxHealth { get; private set; }  // đọc được, bên ngoài không sửa được

    public float HealthPercent => (float)health / MaxHealth;  // chỉ đọc, tính từ dữ liệu khác

    public Character(string name, int maxHealth)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
    }
}
```

### Auto-property: cho trường hợp đơn giản

```csharp
// Các dòng này nằm bên trong một class
public string Name { get; set; }           // đọc và ghi
public int Level { get; private set; }     // ai cũng đọc được, chỉ class tự ghi
public DateTime CreatedAt { get; } = DateTime.Now;  // chỉ đọc, gán 1 lần
```

### Property trong Unity

Người mới hay nghĩ property là cách chuẩn để đưa dữ liệu lên Inspector của Unity, rồi thắc mắc sao khai báo `public int MaxHealth { get; set; }` mà Inspector không hiện gì. Lý do: Inspector chỉ hiện và lưu **field**, không hiện property.

Cách hay dùng trong Unity là một field `private` có gắn `[SerializeField]` để chỉnh trong Inspector, cộng một property chỉ đọc cho code khác lấy giá trị:

```csharp
// Bên trong một script MonoBehaviour của Unity
[SerializeField] private int maxHealth = 100;  // hiện trong Inspector
public int MaxHealth => maxHealth;             // code khác đọc được, không sửa được
```

Bạn sẽ gặp đúng kiểu viết này trong series Unity.

## Static: thuộc về class, không thuộc object

```csharp
// Gọi thẳng trên CLASS, không cần tạo object
GameManager.AddScore(100);
GameManager.EnemiesKilled++;
Console.WriteLine($"Killed: {GameManager.EnemiesKilled}");

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
```

Thành viên `static` dùng chung cho cả class, chỉ có **1 bản** duy nhất dù bạn tạo bao nhiêu object.

## Ví dụ tổng hợp: nhân vật RPG

```csharp
Character hero = new Character("Knight", 100, 20);
Character mage = new Character("Mage", 70, 35);

Console.WriteLine(hero);
Console.WriteLine(mage);
Console.WriteLine($"Tổng characters: {Character.GetTotalCharacters()}\n");

hero.TakeDamage(25);
hero.GainExp(150);  // lên cấp!

mage.GainExp(80);
mage.GainExp(120);  // lên cấp!

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
        Health = MaxHealth;  // hồi đầy máu khi lên cấp
        Attack += 3;
        Console.WriteLine($"  ★ {Name} LEVEL UP! Lv.{Level} | HP:{MaxHealth} | ATK:{Attack}");
    }

    public bool IsAlive() => Health > 0;

    public static int GetTotalCharacters() => totalCharacters;

    public override string ToString()
    {
        return $"[Lv.{Level}] {Name} | HP:{Health}/{MaxHealth} ATK:{Attack} EXP:{Exp}";
    }
}
```

## Bài tập

**Bài 1: Class vũ khí**
Tạo class `Weapon` với các property: Name, Damage, Durability, WeaponType (dùng enum). Hàm `Use()` giảm độ bền đi 1, `Repair(int amount)`, `IsBroken()`. Tạo 3 vũ khí khác nhau, dùng thử và in trạng thái.

**Bài 2: Class inventory**
Tạo class `Inventory` chứa `List<string>` items và `int capacity`. Các hàm: `AddItem(string)` (trả false nếu đầy), `RemoveItem(string)`, `ShowAll()`, và property `IsFull`. Tạo inventory 5 ô, thử thêm và xóa item.

**Bài 3: Xưởng quái vật**
Tạo class `Monster` với field static `totalSpawned`. Constructor tự tăng bộ đếm. Tạo 10 monster trong vòng lặp với chỉ số ngẫu nhiên. Cuối cùng in `totalSpawned` và tìm monster có HP cao nhất.

---

**Bài trước:** [C# cho người mới #4: Hàm, tham số và enum](/lab/csharp-04-methods)
**Bài tiếp:** [C# cho người mới #6: Kế thừa, interface và đa hình](/lab/csharp-06-oop-advanced)
