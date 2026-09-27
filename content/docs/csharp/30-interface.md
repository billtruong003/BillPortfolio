---
title: "Interface trong C#"
description: "Interface trong C# là bản cam kết một class làm được việc gì. Học qua ví dụ IDamageable, cách một class có nhiều interface và dùng is để kiểm tra."
section: "Hướng đối tượng"
order: 30
tags: ["interface", "IDamageable", "OOP", "is"]
image: /images/docs/csharp/interface.webp
imageIdea: "Nhân vật anime cầm kiếm gỗ đi quanh sân tập, gõ thử vào một con slime, một thùng gỗ và một hình nộm; cả ba đều đeo chung một tấm huy hiệu 'IDamageable'."
imagePrompt: "Edit this image: the character holds a wooden practice sword in a training yard, tapping a slime, a wooden crate and a straw training dummy. All three wear the same round badge that reads 'IDamageable'. Keep the original art style, 16:9."
---

Interface là một danh sách những gì một class cam kết làm được, nhưng không nói làm như thế nào. `IDamageable` nói "thứ này nhận sát thương được". Quái, thùng gỗ, cửa phá được đều có thể ký cam kết đó, dù chúng chẳng liên quan gì nhau.

## Vấn đề: kế thừa không đủ

Thanh kiếm của người chơi chém trúng quái thì quái mất máu, chém trúng thùng gỗ thì thùng vỡ. Thử dùng [kế thừa](/docs/csharp/ke-thua): cho `WoodenCrate` kế thừa `Enemy` để có `TakeDamage`? Thùng gỗ không phải quái, nó sẽ dính theo cả `Attack` và những thứ vô lý khác. Còn nếu viết code kiếm kiểu "nếu là Enemy thì..., nếu là Crate thì..." thì mỗi thứ phá được mới là một nhánh `if` mới.

Interface giải quyết đúng chỗ này: kiếm chỉ cần biết mục tiêu "nhận sát thương được", không cần biết nó là gì.

## Khai báo và cài đặt interface

Tên interface theo quy ước bắt đầu bằng chữ `I`. Bên trong chỉ ghi chữ ký method, không có thân hàm.

```csharp
IDamageable[] targets = { new Slime(), new WoodenCrate() };

foreach (IDamageable target in targets)
{
    target.TakeDamage(15);
}
// Slime còn 15 máu
// Thùng gỗ vỡ tung, rơi ra 1 bình máu

interface IDamageable
{
    void TakeDamage(int amount);
}

class Slime : IDamageable
{
    private int hp = 30;

    public void TakeDamage(int amount)
    {
        hp -= amount;
        Console.WriteLine($"Slime còn {hp} máu");
    }
}

class WoodenCrate : IDamageable
{
    public void TakeDamage(int amount)
    {
        Console.WriteLine("Thùng gỗ vỡ tung, rơi ra 1 bình máu");
    }
}
```

`class Slime : IDamageable` nghĩa là Slime cam kết có method `TakeDamage(int)`. Mảng `IDamageable[]` chứa được cả Slime lẫn thùng gỗ. Vòng lặp gọi `TakeDamage` mà không cần biết mỗi phần tử là gì.

> **Lỗi hay gặp:** khai báo `: IDamageable` mà quên viết method, hoặc viết sai tham số. C# báo CS0535 "'WoodenCrate' does not implement interface member 'IDamageable.TakeDamage(int)'". Method cài đặt cũng phải là `public`, nếu không sẽ gặp CS0737.

Interface không tạo object được: `new IDamageable()` báo lỗi CS0144. Nó chỉ là cam kết, không phải thứ có thật.

## Một class nhiều interface

Class chỉ kế thừa được một class cha, nhưng cài đặt được bao nhiêu interface tùy ý. Viết cách nhau bằng dấu phẩy.

```csharp
Chest chest = new Chest();
chest.TakeDamage(5);
chest.Interact();
// Rương bị đập, không hề hấn gì
// Mở rương: nhận 200 vàng

interface IDamageable
{
    void TakeDamage(int amount);
}

interface IInteractable
{
    void Interact();
}

class Chest : IDamageable, IInteractable
{
    public void TakeDamage(int amount)
    {
        Console.WriteLine("Rương bị đập, không hề hấn gì");
    }

    public void Interact()
    {
        Console.WriteLine("Mở rương: nhận 200 vàng");
    }
}
```

Nếu có cả class cha, class cha đứng đầu tiên, interface theo sau: `class Boss : Enemy, IDamageable`.

## Kiểm tra một thứ có interface hay không

Trong game, bạn thường cầm một object mà không biết nó làm được gì. Toán tử `is` kiểm tra và ép kiểu trong một bước.

```csharp
object[] thingsInRange = { new Chest(), "Bức tường", new Chest() };

int opened = 0;
foreach (object thing in thingsInRange)
{
    if (thing is IInteractable interactable)
    {
        interactable.Interact();
        opened++;
    }
}
// Mở rương!
// Mở rương!

Console.WriteLine(opened); // 2

interface IInteractable
{
    void Interact();
}

class Chest : IInteractable
{
    public void Interact()
    {
        Console.WriteLine("Mở rương!");
    }
}
```

Chuỗi `"Bức tường"` không có `IInteractable` nên bị bỏ qua.

## Trong Unity

Đây là cách rất hay dùng trong Unity: khi đạn chạm vào collider, gọi `other.GetComponent<IDamageable>()`. Nếu kết quả khác `null` thì gây sát thương, không cần biết đó là quái, người chơi hay thùng gỗ. Thêm một thứ phá được mới chỉ cần cho script của nó cài `IDamageable`, code của đạn không phải sửa.

## Bài tập

Viết interface `IHealable` có method `Heal(int amount)`. Cho class `Hero` (có `hp` bắt đầu 40, tối đa 100) và class `Plant` (in "Cây mọc thêm {amount} lá") cài đặt nó. Tạo mảng `IHealable[]` chứa cả hai, gọi `Heal(30)` cho từng phần tử.

<details>
<summary>Xem đáp án</summary>

```csharp
IHealable[] healables = { new Hero(), new Plant() };

foreach (IHealable h in healables)
{
    h.Heal(30);
}
// Hero hồi máu, hiện có 70
// Cây mọc thêm 30 lá

interface IHealable
{
    void Heal(int amount);
}

class Hero : IHealable
{
    private int hp = 40;
    private const int MaxHp = 100;

    public void Heal(int amount)
    {
        hp = Math.Min(hp + amount, MaxHp);
        Console.WriteLine($"Hero hồi máu, hiện có {hp}");
    }
}

class Plant : IHealable
{
    public void Heal(int amount)
    {
        Console.WriteLine($"Cây mọc thêm {amount} lá");
    }
}
```

</details>
