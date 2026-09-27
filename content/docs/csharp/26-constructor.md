---
title: "Constructor trong C#"
description: "Constructor trong C# là hàm chạy khi tạo object bằng new. Học cách viết constructor, dùng this để phân biệt field với tham số, và viết nhiều constructor."
section: "Hướng đối tượng"
order: 26
tags: ["constructor", "this", "class", "new"]
image: /images/docs/csharp/constructor.webp
imageIdea: "Nhân vật anime đứng ở bàn tạo nhân vật, xoay núm chỉnh 'name', 'hp' trên một cái lồng kính, bên trong một hiệp sĩ tí hon vừa được lắp ráp xong và mở mắt."
imagePrompt: "Edit this image: the character operates a glowing character-creation pod with dials labeled 'name' and 'hp'. Inside the glass pod a tiny chibi knight has just been assembled and opens its eyes. A screen on the pod reads 'new Hero(\"Aki\", 100)'. Keep the original art style, 16:9."
---

Constructor là một hàm đặc biệt chạy đúng một lần, ngay lúc object được tạo bằng `new`. Nó dùng để gán giá trị ban đầu, để object vừa sinh ra đã ở trạng thái dùng được.

## Vấn đề: object sinh ra còn trống

Ở trang [class và object](/docs/csharp/class-va-object), mỗi con quái phải gán field từng dòng sau khi `new`. Quên một dòng là có con quái không tên, máu bằng 0, vừa xuất hiện đã chết. Constructor ép chỗ tạo object phải đưa đủ dữ liệu.

## Viết constructor

Constructor có tên trùng với tên class và không có kiểu trả về, kể cả `void`.

```csharp
Enemy slime = new Enemy("Slime", 30);
Enemy goblin = new Enemy("Goblin", 55);

slime.PrintInfo();  // Slime: 30 máu
goblin.PrintInfo(); // Goblin: 55 máu

class Enemy
{
    public string Name;
    public int Hp;

    public Enemy(string name, int hp)
    {
        Name = name;
        Hp = hp;
    }

    public void PrintInfo()
    {
        Console.WriteLine($"{Name}: {Hp} máu");
    }
}
```

Giá trị trong `new Enemy("Slime", 30)` được đưa vào tham số `name`, `hp` của constructor, rồi constructor gán vào field.

> **Lỗi hay gặp:** sau khi viết constructor có tham số, gọi `new Enemy()` như cũ. C# báo CS7036 "There is no argument given that corresponds to the required parameter 'name'". Khi bạn tự viết constructor, C# không còn tạo sẵn constructor rỗng nữa.

## Từ khoá `this`

Nhiều người đặt field và tham số trùng tên, rồi viết `hp = hp;`. Dòng đó gán tham số cho chính nó, field vẫn bằng 0, và C# chỉ báo cảnh báo CS1717 "Assignment made to same variable".

`this` nghĩa là "object hiện tại". `this.hp` là field của object, `hp` là tham số.

```csharp
Hero hero = new Hero("Aki", 100);
hero.PrintInfo(); // Aki: 100/100 máu

class Hero
{
    private string name;
    private int hp;
    private int maxHp;

    public Hero(string name, int maxHp)
    {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp; // vừa tạo thì đầy máu
    }

    public void PrintInfo()
    {
        Console.WriteLine($"{name}: {hp}/{maxHp} máu");
    }
}
```

Ở đây field viết thường vì là `private` (xem [access modifier](/docs/csharp/access-modifier)). Nếu field viết `PascalCase` như ví dụ trước thì không trùng tên và không cần `this`.

## Nhiều constructor

Một class có thể có nhiều constructor, khác nhau ở tham số, giống [nạp chồng hàm](/docs/csharp/nap-chong-ham). Ví dụ quái thường chỉ cần tên và máu, còn quái tinh anh có thêm hệ số sát thương.

Để không lặp code gán field, một constructor có thể gọi constructor khác bằng `: this(...)`.

```csharp
Enemy bat = new Enemy("Bat");
Enemy orc = new Enemy("Orc", 80);
Enemy eliteOrc = new Enemy("Orc Tinh Anh", 160, 2);

bat.PrintInfo();      // Bat: 20 máu, sát thương x1
orc.PrintInfo();      // Orc: 80 máu, sát thương x1
eliteOrc.PrintInfo(); // Orc Tinh Anh: 160 máu, sát thương x2

class Enemy
{
    public string Name;
    public int Hp;
    public int DamageMultiplier;

    public Enemy(string name, int hp, int damageMultiplier)
    {
        Name = name;
        Hp = hp;
        DamageMultiplier = damageMultiplier;
    }

    public Enemy(string name, int hp) : this(name, hp, 1)
    {
    }

    public Enemy(string name) : this(name, 20)
    {
    }

    public void PrintInfo()
    {
        Console.WriteLine($"{Name}: {Hp} máu, sát thương x{DamageMultiplier}");
    }
}
```

`new Enemy("Bat")` gọi constructor một tham số, constructor này chuyển tiếp sang bản hai tham số với máu 20, rồi bản đó chuyển tiếp sang bản ba tham số với hệ số 1. Việc gán field chỉ viết ở một chỗ.

## Trong Unity

Class kế thừa `MonoBehaviour` không dùng constructor. Unity tự tạo object đó, nên bạn khởi tạo giá trị trong `Awake()` hoặc `Start()`. Constructor vẫn dùng bình thường cho class dữ liệu thường, như một class `Item` trong kho đồ.

## Bài tập

Viết class `Weapon` có field `Name`, `Damage`, `Durability`. Viết constructor ba tham số, và constructor hai tham số (tên, sát thương) gọi sang constructor ba tham số với độ bền mặc định là 100. Tạo "Kiếm gỗ" sát thương 5 và "Rìu chiến" sát thương 18 độ bền 60, in thông tin cả hai.

<details>
<summary>Xem đáp án</summary>

```csharp
Weapon sword = new Weapon("Kiếm gỗ", 5);
Weapon axe = new Weapon("Rìu chiến", 18, 60);

sword.PrintInfo(); // Kiếm gỗ: 5 sát thương, độ bền 100
axe.PrintInfo();   // Rìu chiến: 18 sát thương, độ bền 60

class Weapon
{
    public string Name;
    public int Damage;
    public int Durability;

    public Weapon(string name, int damage, int durability)
    {
        Name = name;
        Damage = damage;
        Durability = durability;
    }

    public Weapon(string name, int damage) : this(name, damage, 100)
    {
    }

    public void PrintInfo()
    {
        Console.WriteLine($"{Name}: {Damage} sát thương, độ bền {Durability}");
    }
}
```

</details>
