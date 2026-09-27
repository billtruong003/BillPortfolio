---
title: "Class và object trong C#"
description: "Class trong C# là bản thiết kế, object là thứ được tạo ra từ bản thiết kế đó. Học cách khai báo class, field, method và tạo object bằng new."
section: "Hướng đối tượng"
order: 25
tags: ["class", "object", "field", "method", "OOP"]
image: /images/docs/csharp/class-va-object.webp
imageIdea: "Nhân vật anime cầm tờ bản vẽ kỹ thuật ghi 'class Slime', trước mặt là một cỗ máy đang in ra ba con slime khác màu từ cùng một bản vẽ."
imagePrompt: "Edit this image: the character holds a blueprint sheet titled 'class Slime' next to a cute machine. The machine is popping out three slimes of different colors (green, blue, pink), each with a tiny name tag. Keep the original art style, 16:9."
---

Class là bản thiết kế, object là thứ được làm ra từ bản thiết kế đó. Class `Enemy` mô tả một con quái có tên, có máu, biết nhận sát thương. Mỗi con Slime, Goblin trong màn chơi là một object riêng, có tên và máu của riêng nó.

## Vì sao cần class

Mỗi con quái có tên và máu. Làm bằng biến rời thì bạn có `slimeName`, `slimeHp`, `goblinName`, `goblinHp`... Thêm con thứ ba là thêm hai biến, thêm thuộc tính tốc độ là thêm một loạt biến nữa. Class gom dữ liệu và hành vi của một thứ vào một chỗ.

## Khai báo class

Một class có hai loại thành phần chính:

- **Field**: biến nằm trong class, giữ dữ liệu của từng object (tên, máu).
- **Method**: hàm nằm trong class, mô tả object làm được gì (nhận sát thương).

```csharp
class Enemy
{
    public string Name = "";
    public int Hp;

    public void TakeDamage(int amount)
    {
        Hp -= amount;
        Console.WriteLine($"{Name} mất {amount} máu, còn {Hp}");
    }
}
```

`public` nghĩa là code bên ngoài class được đọc và gọi thành phần này. Trang [access modifier](/docs/csharp/access-modifier) nói kỹ hơn. Field `Name` được gán sẵn `""` để .NET 8 không cảnh báo chuỗi có thể là `null`.

## Tạo object bằng `new`

Class chỉ là bản thiết kế, chưa có con quái nào cả. Muốn có một con, dùng `new`. Truy cập field và method bằng dấu chấm.

```csharp
Enemy slime = new Enemy();
slime.Name = "Slime";
slime.Hp = 30;

Enemy goblin = new Enemy();
goblin.Name = "Goblin";
goblin.Hp = 55;

slime.TakeDamage(12);   // Slime mất 12 máu, còn 18
goblin.TakeDamage(20);  // Goblin mất 20 máu, còn 35

Console.WriteLine(slime.Hp);  // 18
Console.WriteLine(goblin.Hp); // 35

class Enemy
{
    public string Name = "";
    public int Hp;

    public void TakeDamage(int amount)
    {
        Hp -= amount;
        Console.WriteLine($"{Name} mất {amount} máu, còn {Hp}");
    }
}
```

Để ý: `slime` bị đánh không làm `goblin` mất máu. Mỗi object giữ bản field riêng của nó. Bên trong method, `Hp` là máu của chính object đang được gọi.

## Class đặt sau code chạy

Trong top-level statements, nhiều người quen tay viết class lên đầu file như các ngôn ngữ khác.

```csharp
class Enemy
{
    public int Hp;
}

Enemy slime = new Enemy(); // lỗi CS8803
```

> **Lỗi hay gặp:** CS8803 "Top-level statements must precede namespace and type declarations". Trong file dùng top-level statements, mọi dòng code chạy phải đứng trước, khai báo `class`, `enum`, `interface` phải để xuống cuối file.

## Biến object giữ tham chiếu, không giữ bản sao

Với `int`, gán `a = b` là chép giá trị. Với object thì khác: biến chỉ giữ đường dẫn tới object. Hai biến có thể cùng trỏ vào một con quái.

```csharp
Enemy boss = new Enemy();
boss.Name = "Rồng Lửa";
boss.Hp = 500;

Enemy target = boss;   // không tạo con mới
target.Hp = 0;

Console.WriteLine(boss.Hp); // 0

class Enemy
{
    public string Name = "";
    public int Hp;
}
```

Đây là lý do khi bạn truyền một object vào [hàm](/docs/csharp/ham) và hàm sửa field của nó, thay đổi vẫn còn sau khi hàm kết thúc.

## Trong Unity

Mỗi script Unity là một class, thường kế thừa `MonoBehaviour`. Khi bạn gắn script vào một GameObject, Unity tạo object từ class đó giúp bạn, nên bạn không tự gọi `new` cho `MonoBehaviour`. Các class dữ liệu thường (không kế thừa `MonoBehaviour`) thì vẫn tạo bằng `new` như trên.

Gán field từng dòng sau khi `new` khá dài dòng. Trang [constructor](/docs/csharp/constructor) chỉ cách gán ngay lúc tạo.

## Bài tập

Viết class `Hero` có field `Name`, `Gold` và method `Loot(int amount)` cộng vàng rồi in "{Name} nhặt {amount} vàng, có {Gold}". Tạo hai hero "Aki" và "Ren", cho Aki nhặt 30 vàng hai lần, Ren nhặt 50 vàng một lần.

<details>
<summary>Xem đáp án</summary>

```csharp
Hero aki = new Hero();
aki.Name = "Aki";

Hero ren = new Hero();
ren.Name = "Ren";

aki.Loot(30); // Aki nhặt 30 vàng, có 30
aki.Loot(30); // Aki nhặt 30 vàng, có 60
ren.Loot(50); // Ren nhặt 50 vàng, có 50

class Hero
{
    public string Name = "";
    public int Gold;

    public void Loot(int amount)
    {
        Gold += amount;
        Console.WriteLine($"{Name} nhặt {amount} vàng, có {Gold}");
    }
}
```

</details>
