---
title: "Tham số của hàm trong C#"
description: "Cách truyền dữ liệu vào hàm trong C#: tham số, giá trị mặc định, named arguments, và khác biệt giữa truyền giá trị với ref, out ở mức cơ bản."
section: "Hàm"
order: 23
tags: ["tham số", "parameter", "ref", "out", "named arguments"]
image: /images/docs/csharp/tham-so.webp
imageIdea: "Nhân vật anime đứng ở lò rèn, bỏ từng nguyên liệu có dán nhãn 'damage', 'element' vào các khe khác nhau của cỗ máy rèn kiếm, cuối máy ra một thanh kiếm."
imagePrompt: "Edit this image: the character stands at a fantasy forge machine with labeled input slots 'damage' and 'element'. They drop a glowing ore into the 'damage' slot while a finished sword slides out of the other end. Keep the original art style, 16:9."
---

Tham số (parameter) là chỗ để đưa dữ liệu vào hàm. Nhờ tham số, một hàm `Attack` dùng được cho mọi mục tiêu và mọi mức sát thương, thay vì mỗi con quái một hàm riêng.

## Khai báo tham số

Nếu không có tham số, bạn sẽ phải viết `AttackSlime()`, `AttackGoblin()`, `AttackBoss()`, mỗi hàm gần giống hệt nhau. Tham số cho phép một hàm nhận thông tin từ chỗ gọi.

Mỗi tham số khai báo giống một biến: kiểu rồi tên, các tham số cách nhau bằng dấu phẩy.

```csharp
Attack("Slime", 12);
Attack("Boss", 40);

void Attack(string target, int damage)
{
    Console.WriteLine($"Chém {target}, gây {damage} sát thương");
}
// Chém Slime, gây 12 sát thương
// Chém Boss, gây 40 sát thương
```

Khi gọi, giá trị truyền vào (gọi là đối số, argument) phải đúng số lượng, đúng thứ tự và đúng kiểu với tham số.

## Giá trị mặc định

Phần lớn các đòn đánh gây 10 sát thương. Gõ lại `10` ở mọi chỗ gọi vừa dài vừa dễ sai. Gán giá trị mặc định cho tham số, và chỗ gọi có thể bỏ qua nó.

```csharp
Attack("Slime");        // Chém Slime, gây 10 sát thương
Attack("Boss", 40);     // Chém Boss, gây 40 sát thương

void Attack(string target, int damage = 10)
{
    Console.WriteLine($"Chém {target}, gây {damage} sát thương");
}
```

> **Lỗi hay gặp:** đặt tham số có mặc định đứng trước tham số bắt buộc, như `void Attack(int damage = 10, string target)`. C# báo CS1737 "Optional parameters must appear after all required parameters". Tham số có mặc định luôn nằm cuối.

## Named arguments: gọi theo tên tham số

Hàm có nhiều tham số cùng kiểu rất dễ truyền lộn thứ tự. Đọc `SpawnEnemy("Bat", 3, 50)` bạn không biết `3` là số lượng hay cấp độ. Ghi tên tham số khi gọi giúp đọc rõ và cho phép đổi thứ tự.

```csharp
SpawnEnemy("Bat", count: 3, level: 5);
SpawnEnemy(level: 10, name: "Golem");

void SpawnEnemy(string name, int level = 1, int count = 1)
{
    Console.WriteLine($"Sinh {count} {name} cấp {level}");
}
// Sinh 3 Bat cấp 5
// Sinh 1 Golem cấp 10
```

## Truyền giá trị: hàm nhận bản sao

Với kiểu như `int`, `float`, `bool`, hàm nhận một bản sao của giá trị. Người mới hay viết hàm trừ máu rồi ngạc nhiên vì máu bên ngoài không đổi.

```csharp
int hp = 100;
TakeDamage(hp, 30);
Console.WriteLine(hp); // 100, máu không đổi

void TakeDamage(int currentHp, int damage)
{
    currentHp -= damage; // chỉ sửa bản sao
}
```

Cách gọn nhất là trả kết quả về bằng `return` rồi gán lại:

```csharp
int hp = 100;
hp = TakeDamage(hp, 30);
Console.WriteLine(hp); // 70

int TakeDamage(int currentHp, int damage)
{
    return currentHp - damage;
}
```

## `ref`: cho hàm sửa thẳng biến bên ngoài

Thêm `ref` ở cả chỗ khai báo và chỗ gọi, hàm sẽ làm việc trên chính biến đó chứ không phải bản sao.

```csharp
int hp = 100;
TakeDamage(ref hp, 30);
Console.WriteLine(hp); // 70

void TakeDamage(ref int currentHp, int damage)
{
    currentHp -= damage;
}
```

> **Lỗi hay gặp:** quên `ref` ở chỗ gọi, viết `TakeDamage(hp, 30)`. C# báo CS1620 "Argument 1 must be passed with the 'ref' keyword". Biến truyền bằng `ref` cũng phải được gán giá trị trước.

## `out`: trả thêm kết quả

`out` dùng khi hàm cần đưa ra nhiều hơn một kết quả. Hàm bắt buộc phải gán giá trị cho tham số `out` trước khi kết thúc. Bạn đã gặp nó ở `int.TryParse` trong trang [nhập dữ liệu](/docs/csharp/nhap-du-lieu).

```csharp
if (TryBuy(250, 180, out int goldLeft))
{
    Console.WriteLine($"Mua xong, còn {goldLeft} vàng"); // Mua xong, còn 70 vàng
}

bool TryBuy(int gold, int price, out int remaining)
{
    if (gold < price)
    {
        remaining = gold;
        return false;
    }
    remaining = gold - price;
    return true;
}
```

Ở mức cơ bản: ưu tiên `return`. Chỉ dùng `ref` khi thật sự cần sửa biến của chỗ gọi, và dùng `out` theo kiểu `TryXxx` như trên.

## Bài tập

Viết hàm `Heal` nhận máu hiện tại, máu tối đa và lượng hồi với mặc định là 25, trả về máu sau khi hồi nhưng không vượt quá máu tối đa. Gọi thử với máu 60/100 dùng mặc định, và máu 90/100 hồi 50 bằng named argument.

<details>
<summary>Xem đáp án</summary>

```csharp
Console.WriteLine(Heal(60, 100));             // 85
Console.WriteLine(Heal(90, 100, amount: 50)); // 100

int Heal(int currentHp, int maxHp, int amount = 25)
{
    int newHp = currentHp + amount;
    if (newHp > maxHp)
    {
        newHp = maxHp;
    }
    return newHp;
}
```

</details>
