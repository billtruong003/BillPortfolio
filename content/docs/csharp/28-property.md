---
title: "Property trong C#: get và set"
description: "Property trong C# thay cho cặp hàm GetX, SetX: viết get/set có kiểm tra, auto-property, property chỉ đọc, và cách hiện biến private lên Unity Inspector."
section: "Hướng đối tượng"
order: 28
tags: ["property", "get", "set", "auto-property", "SerializeField"]
image: /images/docs/csharp/property.webp
imageIdea: "Nhân vật anime đứng gác trước cổng thành có hai ô cửa sổ ghi 'get' và 'set': ô 'get' cho xem thanh máu, ô 'set' đang từ chối một tờ giấy ghi 'hp = -50'."
imagePrompt: "Edit this image: the character is a gatekeeper at a small castle gate with two service windows labeled 'get' and 'set'. Through the 'get' window a health bar is shown, while at the 'set' window the character stamps 'REJECTED' on a note that reads 'hp = -50'. Keep the original art style, 16:9."
---

Property là thành phần của class trông giống field khi dùng, nhưng bên trong là hai hàm `get` (đọc) và `set` (ghi). Nó cho phép bạn viết `player.Hp = 50` gọn như field mà vẫn kiểm tra được giá trị như method.

## Vấn đề: GetX, SetX ở khắp nơi

Ở trang [access modifier](/docs/csharp/access-modifier), để giấu field bạn phải viết `GetGold()`, `AddGold()`. Mỗi field một cặp hàm, class phình ra rất nhanh, chỗ gọi cũng rườm rà: `player.SetHp(player.GetHp() - 10)`. Property giữ được sự an toàn đó mà cú pháp gọn như field.

## Property có get và set

```csharp
Player player = new Player();

player.Hp = 150;             // gọi set
Console.WriteLine(player.Hp); // 100, bị giới hạn ở máu tối đa

player.Hp -= 130;            // gọi get rồi set
Console.WriteLine(player.Hp); // 0

class Player
{
    private int hp = 100;

    public int Hp
    {
        get { return hp; }
        set { hp = Math.Clamp(value, 0, 100); }
    }
}
```

- `get` chạy khi đọc `player.Hp`, trả về giá trị.
- `set` chạy khi gán `player.Hp = ...`. Từ khoá `value` là giá trị đang được gán vào.
- `Math.Clamp(value, 0, 100)` ép giá trị nằm trong khoảng 0 đến 100 (xem trang [Math](/docs/csharp/math)).

Field `hp` phía sau vẫn là `private`. Code bên ngoài không có cách nào đặt máu thành số âm.

## Auto-property

Khi get và set không cần kiểm tra gì, C# cho viết gọn. Trình biên dịch tự tạo field ẩn phía sau.

```csharp
Item item = new Item();
item.Name = "Bình máu";
item.Price = 50;
Console.WriteLine($"{item.Name}: {item.Price} vàng"); // Bình máu: 50 vàng

class Item
{
    public string Name { get; set; } = "";
    public int Price { get; set; }
}
```

Bạn sẽ hỏi vậy khác gì field `public`? Hôm nay thì chưa khác. Nhưng mai cần thêm kiểm tra giá không âm, bạn đổi thành property đầy đủ mà chỗ gọi `item.Price = 50` không phải sửa dòng nào. Quy ước trong C#: dữ liệu công khai của class dùng property.

## Property chỉ đọc

Có dữ liệu bên ngoài được xem nhưng không được sửa: tên nhân vật sau khi tạo, số vàng chỉ đổi qua mua bán.

- `{ get; }`: chỉ gán được trong constructor hoặc khi khai báo.
- `{ get; private set; }`: bên ngoài chỉ đọc, bên trong class vẫn gán được.

```csharp
Player player = new Player("Aki");
player.AddGold(30);

Console.WriteLine(player.Name); // Aki
Console.WriteLine(player.Gold); // 130

class Player
{
    public string Name { get; }
    public int Gold { get; private set; } = 100;

    public Player(string name)
    {
        Name = name;
    }

    public void AddGold(int amount)
    {
        Gold += amount;
    }
}
```

> **Lỗi hay gặp:** gán `player.Name = "Ren";` cho property chỉ có `get`. C# báo CS0200 "Property or indexer 'Player.Name' cannot be assigned to -- it is read only". Với `private set`, gán từ bên ngoài sẽ báo CS0272 vì set không mở cho bên ngoài.

Property chỉ đọc tính từ dữ liệu khác có thể viết một dòng bằng `=>`:

```csharp
Hero hero = new Hero();
Console.WriteLine(hero.IsLowHp); // True

class Hero
{
    public int Hp { get; set; } = 15;
    public bool IsLowHp => Hp < 20;
}
```

## Ghi chú cho Unity: Inspector không hiện property

Trong Unity, Inspector chỉ hiện **field** `public` hoặc field có gắn `[SerializeField]`. Property, kể cả auto-property `public`, không hiện ra. Người mới đổi field sang property rồi thấy ô chỉnh trong Inspector biến mất.

Cách làm hay dùng: giữ field `private` có `[SerializeField]` để chỉnh trong Inspector, rồi mở một property chỉ đọc cho script khác dùng.

```csharp
using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    [SerializeField] private int maxHp = 100;
    private int currentHp;

    public int CurrentHp => currentHp;
    public int MaxHp => maxHp;

    private void Awake()
    {
        currentHp = maxHp;
    }

    public void TakeDamage(int amount)
    {
        currentHp = Mathf.Max(currentHp - amount, 0);
    }
}
```

Đoạn này là script Unity, không chạy trong console. `maxHp` hiện trong Inspector để designer chỉnh, còn script khác chỉ đọc được `CurrentHp`, không sửa bậy được. Unity cũng hỗ trợ `[field: SerializeField]` đặt trên auto-property, nhưng tên hiện trong Inspector sẽ kém đẹp hơn.

## Bài tập

Viết class `Stamina` có property `Value` với field `private` phía sau, set luôn giữ giá trị trong khoảng 0 đến `Max`. `Max` là property chỉ đọc, gán bằng constructor. Tạo `Stamina` với `Max` là 50, gán `Value = 80`, in ra, rồi trừ 60 và in ra.

<details>
<summary>Xem đáp án</summary>

```csharp
Stamina stamina = new Stamina(50);

stamina.Value = 80;
Console.WriteLine(stamina.Value); // 50

stamina.Value -= 60;
Console.WriteLine(stamina.Value); // 0

class Stamina
{
    private int current;

    public int Max { get; }

    public int Value
    {
        get { return current; }
        set { current = Math.Clamp(value, 0, Max); }
    }

    public Stamina(int max)
    {
        Max = max;
    }
}
```

Đừng đặt tên field là `value`: trong `set`, chữ `value` đã là giá trị đang được gán vào, trùng tên sẽ rất dễ nhầm.

</details>
