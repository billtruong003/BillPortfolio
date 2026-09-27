---
title: "Kế thừa trong C#"
description: "Kế thừa trong C#: class con nhận lại field và method của class cha, gọi base, dùng virtual và override để Slime và Boss tấn công theo kiểu riêng."
section: "Hướng đối tượng"
order: 29
tags: ["kế thừa", "inheritance", "base", "virtual", "override"]
image: /images/docs/csharp/ke-thua.webp
imageIdea: "Nhân vật anime chỉ vào một cây gia phả của quái vật vẽ trên bảng: gốc ghi 'Enemy', hai nhánh là một con Slime nhỏ và một con Boss rồng, cả hai đều đội chiếc mũ giống mũ của ông tổ Enemy."
imagePrompt: "Edit this image: the character points at a chalkboard family tree of monsters. The root box reads 'Enemy', with two branches: a small cute slime labeled 'Slime' and a big dragon labeled 'Boss'. Both monsters wear the same little horned helmet as the 'Enemy' ancestor. Keep the original art style, 16:9."
---

Kế thừa (inheritance) cho phép một class nhận lại toàn bộ field và method của class khác, rồi thêm hoặc sửa phần của riêng nó. Slime và Boss đều là quái: cùng có tên, máu, cùng biết tấn công, chỉ khác cách tấn công.

## Vấn đề: copy cùng một đoạn code cho mọi loại quái

Viết class `Slime` và class `Boss` riêng, bạn sẽ copy field `Name`, `Hp`, method `TakeDamage` sang cả hai. Thêm loại quái thứ ba là copy lần thứ ba. Sửa lỗi trong `TakeDamage` thì phải sửa ở mọi bản copy. Kế thừa đặt phần chung vào một class cha duy nhất.

## Class cha và class con

Viết `class Slime : Enemy` nghĩa là `Slime` kế thừa `Enemy`. `Enemy` là class cha (base class), `Slime` là class con (derived class).

```csharp
Slime slime = new Slime();
slime.Name = "Slime Xanh";
slime.TakeDamage(10); // Slime Xanh còn 20 máu
slime.Split();        // Slime Xanh tách làm đôi!

class Enemy
{
    public string Name = "";
    public int Hp = 30;

    public void TakeDamage(int amount)
    {
        Hp -= amount;
        Console.WriteLine($"{Name} còn {Hp} máu");
    }
}

class Slime : Enemy
{
    public void Split()
    {
        Console.WriteLine($"{Name} tách làm đôi!");
    }
}
```

`Slime` không khai báo `Name`, `Hp` hay `TakeDamage` nhưng vẫn dùng được, vì nó thừa hưởng từ `Enemy`. Nó chỉ viết thêm cái riêng là `Split`.

## Gọi constructor của cha bằng `base`

Khi class cha có [constructor](/docs/csharp/constructor) nhận tham số, class con phải truyền dữ liệu lên bằng `: base(...)`.

```csharp
Boss boss = new Boss();
Console.WriteLine($"{boss.Name}: {boss.Hp} máu"); // Rồng Lửa: 500 máu

class Enemy
{
    public string Name { get; }
    public int Hp { get; protected set; }

    public Enemy(string name, int hp)
    {
        Name = name;
        Hp = hp;
    }
}

class Boss : Enemy
{
    public Boss() : base("Rồng Lửa", 500)
    {
    }
}
```

> **Lỗi hay gặp:** class con quên `: base(...)` khi class cha không có constructor rỗng. C# báo CS7036 "There is no argument given that corresponds to the required parameter 'name' of 'Enemy.Enemy(string, int)'".

`protected set` giúp class con sửa được `Hp`, còn code bên ngoài thì không (xem [access modifier](/docs/csharp/access-modifier)).

## `virtual` và `override`: mỗi loại tấn công một kiểu

Class cha đánh dấu method bằng `virtual` để cho phép class con viết lại. Class con dùng `override` để thay bằng phiên bản của nó. Bên trong, `base.Attack()` gọi lại phiên bản của cha nếu muốn giữ phần chung.

```csharp
Enemy[] wave = { new Slime(), new Boss(), new Enemy("Bù nhìn", 10) };

foreach (Enemy enemy in wave)
{
    enemy.Attack();
}
// Slime nhảy lên đè người chơi!
// Rồng Lửa tấn công!
// Rồng Lửa phun lửa khắp bản đồ!
// Bù nhìn tấn công!

class Enemy
{
    public string Name { get; }
    public int Hp { get; protected set; }

    public Enemy(string name, int hp)
    {
        Name = name;
        Hp = hp;
    }

    public virtual void Attack()
    {
        Console.WriteLine($"{Name} tấn công!");
    }
}

class Slime : Enemy
{
    public Slime() : base("Slime", 30)
    {
    }

    public override void Attack()
    {
        Console.WriteLine($"{Name} nhảy lên đè người chơi!");
    }
}

class Boss : Enemy
{
    public Boss() : base("Rồng Lửa", 500)
    {
    }

    public override void Attack()
    {
        base.Attack();
        Console.WriteLine($"{Name} phun lửa khắp bản đồ!");
    }
}
```

Để ý mảng có kiểu `Enemy[]` mà chứa được cả `Slime` lẫn `Boss`, vì Slime và Boss đều là Enemy. Khi gọi `enemy.Attack()`, C# chạy đúng phiên bản của loại quái thật sự. Code sinh đợt quái chỉ cần biết "đây là Enemy", không cần biết từng loại.

> **Lỗi hay gặp:** viết `override` trong class con khi method của cha thiếu `virtual`. C# báo CS0506 "cannot override inherited member 'Enemy.Attack()' because it is not marked virtual, abstract, or override". Nếu ngược lại, cha có `virtual` mà con quên `override`, bạn chỉ nhận cảnh báo CS0114 và method của con sẽ không được gọi qua biến kiểu `Enemy`.

## Mỗi class chỉ có một cha

C# chỉ cho kế thừa từ một class. Viết `class FlyingSlime : Slime, Bat` sẽ báo lỗi CS1721. Khi cần một class có nhiều "khả năng" như vừa nhận sát thương vừa tương tác được, dùng [interface](/docs/csharp/interface).

Trong Unity, mọi script bạn viết đã kế thừa `MonoBehaviour`. Bạn vẫn có thể tạo `Enemy : MonoBehaviour` rồi cho `Slime : Enemy`, và `Slime` vẫn gắn được lên GameObject.

## Bài tập

Viết class cha `Hero` có `Name` và method `virtual void UseSkill()` in "{Name} dùng kỹ năng cơ bản". Viết `Mage` override để in "{Name} bắn cầu lửa", và `Knight` override để gọi `base.UseSkill()` rồi in thêm "{Name} giơ khiên". Cho cả hai vào một mảng `Hero[]` và gọi `UseSkill` bằng foreach.

<details>
<summary>Xem đáp án</summary>

```csharp
Hero[] party = { new Mage("Mio"), new Knight("Ren") };

foreach (Hero hero in party)
{
    hero.UseSkill();
}
// Mio bắn cầu lửa
// Ren dùng kỹ năng cơ bản
// Ren giơ khiên

class Hero
{
    public string Name { get; }

    public Hero(string name)
    {
        Name = name;
    }

    public virtual void UseSkill()
    {
        Console.WriteLine($"{Name} dùng kỹ năng cơ bản");
    }
}

class Mage : Hero
{
    public Mage(string name) : base(name)
    {
    }

    public override void UseSkill()
    {
        Console.WriteLine($"{Name} bắn cầu lửa");
    }
}

class Knight : Hero
{
    public Knight(string name) : base(name)
    {
    }

    public override void UseSkill()
    {
        base.UseSkill();
        Console.WriteLine($"{Name} giơ khiên");
    }
}
```

</details>
