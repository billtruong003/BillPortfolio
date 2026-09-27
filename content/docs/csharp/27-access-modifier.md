---
title: "Access modifier trong C#: public, private, protected"
description: "Access modifier trong C# quyết định ai được đụng vào field và method: public, private, protected, và vì sao nên giấu field để dữ liệu game không bị sửa bậy."
section: "Hướng đối tượng"
order: 27
tags: ["access modifier", "public", "private", "protected", "đóng gói"]
image: /images/docs/csharp/access-modifier.webp
imageIdea: "Nhân vật anime làm thủ kho ngân hàng vàng của guild: quầy trước ghi 'public' cho khách gửi rút, két sắt phía sau ghi 'private' có ổ khoá to, nhân vật đang chặn một tên trộm định thò tay vào két."
imagePrompt: "Edit this image: the character works as a guild bank clerk. The front counter has a sign 'public: Deposit / Withdraw', and behind them a big vault door with a padlock labeled 'private gold'. The character blocks a sneaky thief reaching toward the vault. Keep the original art style, 16:9."
---

Access modifier là từ khoá đặt trước field, method hay class để quyết định code nào được phép dùng nó. Ba từ bạn gặp nhiều nhất là `public`, `private` và `protected`.

## Vấn đề: ai cũng sửa được số vàng

Nếu mọi field đều `public`, bất kỳ dòng code nào trong game cũng sửa thẳng được dữ liệu. Một script shop viết nhầm là người chơi có vàng âm, một script khác gán máu lên 99999.

```csharp
Player player = new Player();
player.Gold = -500; // không ai chặn

Console.WriteLine(player.Gold); // -500

class Player
{
    public int Gold = 100;
}
```

Lỗi kiểu này khó tìm, vì chỗ gây sai có thể nằm ở bất cứ file nào.

## `private`: chỉ dùng được bên trong class

Cách đúng: giấu field bằng `private`, rồi mở ra vài method `public` có kiểm tra. Code bên ngoài muốn đổi vàng phải đi qua các method đó.

```csharp
Player player = new Player();

player.AddGold(50);
Console.WriteLine(player.GetGold()); // 150

bool ok = player.SpendGold(400);
Console.WriteLine(ok);               // False
Console.WriteLine(player.GetGold()); // 150

class Player
{
    private int gold = 100;

    public int GetGold()
    {
        return gold;
    }

    public void AddGold(int amount)
    {
        if (amount > 0)
        {
            gold += amount;
        }
    }

    public bool SpendGold(int amount)
    {
        if (amount <= 0 || amount > gold)
        {
            return false;
        }
        gold -= amount;
        return true;
    }
}
```

Giờ số vàng chỉ thay đổi qua `AddGold` và `SpendGold`. Có bug liên quan tới vàng thì bạn chỉ cần xem hai hàm này. Cách giấu dữ liệu rồi mở cửa có kiểm soát như vậy gọi là đóng gói (encapsulation).

> **Lỗi hay gặp:** gọi `player.gold` từ bên ngoài class. C# báo CS0122 "'Player.gold' is inaccessible due to its protection level". Đây không phải lỗi cần né, mà là dấu hiệu bạn nên dùng method công khai.

## `public`: ai cũng dùng được

`public` mở cho mọi code bên ngoài. Dùng cho những gì class muốn cho người khác gọi: `AddGold`, `SpendGold`, `TakeDamage`. Quy tắc dễ nhớ: mặc định để `private`, chỉ mở `public` khi có lý do.

Nếu không ghi gì, field và method trong class là `private`.

```csharp
class Enemy
{
    int hp = 30;        // giống private int hp = 30;
    void Roar() { }     // giống private void Roar() { }
}
```

Viết rõ `private` vẫn tốt hơn, người đọc không phải nhớ quy tắc mặc định.

## `protected`: dành cho class con

`protected` nằm giữa hai cái trên: bên ngoài không đụng được, nhưng class kế thừa thì dùng được. Chi tiết về kế thừa ở trang [kế thừa](/docs/csharp/ke-thua), ở đây chỉ cần thấy cách nó chặn và mở.

```csharp
Boss boss = new Boss();
boss.Enrage();
// Boss nổi giận! Máu còn 250

class Enemy
{
    protected int hp = 500;
}

class Boss : Enemy
{
    public void Enrage()
    {
        hp /= 2; // class con dùng được field protected
        Console.WriteLine($"Boss nổi giận! Máu còn {hp}");
    }
}
```

Nếu ở trên viết `boss.hp = 0;` thì vẫn gặp CS0122, vì `protected` không mở cho code bên ngoài.

## Bảng so sánh ba modifier

| Modifier | Trong class | Class con | Code bên ngoài |
|---|---|---|---|
| `private` | Có | Không | Không |
| `protected` | Có | Có | Không |
| `public` | Có | Có | Có |

Viết `GetGold()` cho mỗi field khá dài dòng. C# có cú pháp gọn hơn là [property](/docs/csharp/property), trang sau sẽ nói.

## Bài tập

Viết class `Health` có field `private int hp = 100`, method `TakeDamage(int amount)` không cho máu xuống dưới 0, và method `GetHp()`. Cho nhân vật nhận 70 sát thương hai lần, in máu sau mỗi lần.

<details>
<summary>Xem đáp án</summary>

```csharp
Health health = new Health();

health.TakeDamage(70);
Console.WriteLine(health.GetHp()); // 30

health.TakeDamage(70);
Console.WriteLine(health.GetHp()); // 0

class Health
{
    private int hp = 100;

    public void TakeDamage(int amount)
    {
        hp -= amount;
        if (hp < 0)
        {
            hp = 0;
        }
    }

    public int GetHp()
    {
        return hp;
    }
}
```

</details>
