---
title: "Nạp chồng hàm (overloading) trong C#"
description: "Nạp chồng hàm trong C#: nhiều hàm cùng tên khác tham số, quy tắc C# chọn hàm nào, và vì sao local function ở top-level không nạp chồng được."
section: "Hàm"
order: 24
tags: ["overloading", "nạp chồng", "hàm", "static class"]
image: /images/docs/csharp/nap-chong-ham.webp
imageIdea: "Nhân vật anime cầm một cây đũa phép duy nhất tên 'Cast', vẫy một lần ra quả cầu lửa, vẫy lần khác kèm viên ngọc băng thì ra cơn bão tuyết."
imagePrompt: "Edit this image: the character holds a single magic wand engraved with the word 'Cast'. On one side a small fireball pops out, on the other side, with a blue ice gem attached, a swirling snowstorm comes out. Keep the original art style, 16:9."
---

Nạp chồng hàm (overloading) là viết nhiều hàm cùng tên nhưng khác danh sách tham số. Khi bạn gọi, C# nhìn vào các đối số truyền vào để chọn đúng phiên bản. Bạn đã dùng nó hằng ngày: `Console.WriteLine` nhận được `int`, `string`, `bool` vì nó có rất nhiều bản nạp chồng.

## Vấn đề: tên hàm dài vì phải né nhau

Không có nạp chồng, bạn phải đặt tên kiểu `DamageFromInt`, `DamageWithMultiplier`, `DamageFromFloat`. Người gọi phải nhớ cả ba cái tên cho cùng một việc là "tính sát thương". Nạp chồng cho phép gọi chung một tên `Damage`.

## Local function không nạp chồng được

Trong top-level statements, hàm bạn viết là local function (xem trang [hàm](/docs/csharp/ham)). Local function không cho hai hàm trùng tên, kể cả khi tham số khác nhau.

```csharp
Heal(20);

void Heal(int amount)
{
    Console.WriteLine($"Hồi {amount} máu");
}

void Heal(int amount, bool isCritical) // lỗi CS0128
{
    Console.WriteLine($"Hồi {amount * 2} máu");
}
```

> **Lỗi hay gặp:** CS0128 "A local variable or function named 'Heal' is already defined in this scope". Code đúng về ý tưởng, chỉ sai chỗ đặt. Muốn nạp chồng, đưa các hàm vào một class.

## Cách đúng: đặt hàm trong static class

`static class` là class chỉ chứa hàm và dữ liệu dùng chung, không cần tạo object. Mỗi hàm trong đó ghi `public static` và gọi bằng `TênClass.TênHàm(...)`. Class phải khai báo sau các dòng code chạy, nếu không sẽ gặp lỗi CS8803.

```csharp
Console.WriteLine(Combat.Damage(10));       // 10
Console.WriteLine(Combat.Damage(10, 3));    // 30
Console.WriteLine(Combat.Damage(10.5f));    // 15.75
Console.WriteLine(Combat.Damage("Boss"));   // 99

static class Combat
{
    public static int Damage(int baseDamage)
    {
        return baseDamage;
    }

    public static int Damage(int baseDamage, int multiplier)
    {
        return baseDamage * multiplier;
    }

    public static float Damage(float baseDamage)
    {
        return baseDamage * 1.5f;
    }

    public static int Damage(string targetType)
    {
        if (targetType == "Boss")
        {
            return 99;
        }
        return 5;
    }
}
```

> **Lưu ý:** máy đặt định dạng Việt Nam sẽ in `15,75` thay vì `15.75`. Kết quả trong bài theo định dạng quốc tế.

Bốn hàm cùng tên `Damage`, C# phân biệt chúng nhờ tham số:

- `Damage(10)`: một `int`, chọn bản đầu.
- `Damage(10, 3)`: hai `int`, chọn bản thứ hai.
- `Damage(10.5f)`: một `float`, chọn bản thứ ba.
- `Damage("Boss")`: một `string`, chọn bản cuối.

## Thế nào mới tính là khác nhau

Hai bản nạp chồng phải khác nhau ở ít nhất một trong các điểm sau:

- Số lượng tham số.
- Kiểu của tham số.
- Thứ tự các kiểu, ví dụ `(int, string)` khác `(string, int)`.

Những thứ **không** tính:

- Chỉ khác kiểu trả về.
- Chỉ khác tên tham số.

```csharp
static class Loot
{
    public static int Roll(int luck) { return luck * 2; }
    public static float Roll(int luck) { return luck * 2.5f; } // lỗi CS0111
}
```

> **Lỗi hay gặp:** CS0111 "Type 'Loot' already defines a member called 'Roll' with the same parameter types". Hai hàm chỉ khác kiểu trả về, C# không biết chọn cái nào khi bạn gọi `Loot.Roll(3)`.

## Khi nào dùng nạp chồng, khi nào dùng giá trị mặc định

Nếu các bản chỉ khác nhau ở chỗ có hay không một tham số, [giá trị mặc định](/docs/csharp/tham-so) thường gọn hơn: một hàm `Damage(int baseDamage, int multiplier = 1)` thay được hai bản đầu ở trên. Dùng nạp chồng khi kiểu dữ liệu đầu vào khác hẳn nhau, như `int` với `string`, và cách xử lý cũng khác.

Trong Unity, các hàm trong class `MonoBehaviour` là method bình thường, nên nạp chồng thoải mái mà không cần `static class`.

## Bài tập

Tạo `static class Reward` có hai hàm `Give`: một bản nhận số vàng `int` và in "Nhận {gold} vàng", một bản nhận tên vật phẩm `string` và số lượng `int`, in "Nhận {count} {item}". Gọi cả hai bản.

<details>
<summary>Xem đáp án</summary>

```csharp
Reward.Give(500);             // Nhận 500 vàng
Reward.Give("Bình máu", 3);   // Nhận 3 Bình máu

static class Reward
{
    public static void Give(int gold)
    {
        Console.WriteLine($"Nhận {gold} vàng");
    }

    public static void Give(string item, int count)
    {
        Console.WriteLine($"Nhận {count} {item}");
    }
}
```

</details>
