---
title: "Enum trong C#"
description: "Enum trong C# là kiểu có một nhóm giá trị đặt tên sẵn. Dùng enum cho trạng thái nhân vật, kết hợp với switch, và ép enum sang số nguyên."
section: "Hướng đối tượng"
order: 31
tags: ["enum", "switch", "trạng thái", "state"]
image: /images/docs/csharp/enum.webp
imageIdea: "Nhân vật anime xoay một chiếc núm vặn lớn trên tường có đúng bốn nấc 'Idle', 'Run', 'Jump', 'Dead', mỗi lần vặn thì cái bóng của nhân vật đổi tư thế theo."
imagePrompt: "Edit this image: the character turns a big retro wall dial with exactly four labeled positions: 'Idle', 'Run', 'Jump', 'Dead'. The dial points to 'Jump', and the character's shadow on the wall is mid-jump. Keep the original art style, 16:9."
---

Enum (enumeration) là một kiểu dữ liệu chỉ nhận một trong vài giá trị đặt tên sẵn. Trạng thái nhân vật là ví dụ kinh điển: đứng yên, chạy, nhảy, chết. Không có trạng thái nào khác, và enum bắt code tuân theo đúng danh sách đó.

## Vấn đề: lưu trạng thái bằng chuỗi hoặc số

Cách người mới hay làm là dùng `string state = "running";` hoặc `int state = 1;` rồi tự nhớ 1 là chạy, 2 là nhảy.

```csharp
string state = "runing"; // gõ thiếu chữ n

if (state == "running")
{
    Console.WriteLine("Phát animation chạy");
}
// không in gì, và trình biên dịch không báo lỗi
```

Gõ sai một chữ là bug câm: code vẫn chạy, chỉ là nhân vật không bao giờ chạy. Với số thì còn tệ hơn, sáu tháng sau không ai nhớ `3` là gì.

## Khai báo và dùng enum

```csharp
PlayerState state = PlayerState.Idle;
Console.WriteLine(state); // Idle

state = PlayerState.Running;
Console.WriteLine(state); // Running

if (state == PlayerState.Running)
{
    Console.WriteLine("Phát animation chạy");
}
// Phát animation chạy

enum PlayerState
{
    Idle,
    Running,
    Jumping,
    Dead
}
```

Giờ gõ sai `PlayerState.Runing` là lỗi biên dịch ngay, không đợi tới lúc chơi mới phát hiện. Viết `PlayerState.` trong editor còn được gợi ý đủ danh sách.

Giống class, enum trong top-level statements phải khai báo ở cuối file, sau code chạy, không thì gặp lỗi CS8803.

> **Lỗi hay gặp:** so sánh enum với chuỗi, như `if (state == "Running")`. C# báo CS0019 "Operator '==' cannot be applied to operands of type 'PlayerState' and 'string'". Luôn so với `PlayerState.Running`.

## Switch trên enum

Enum đi cùng [switch](/docs/csharp/switch) rất tự nhiên: mỗi trạng thái một `case`.

```csharp
PlayerState state = PlayerState.Jumping;

switch (state)
{
    case PlayerState.Idle:
        Console.WriteLine("Đứng thở");
        break;
    case PlayerState.Running:
        Console.WriteLine("Chạy, tốc độ 6");
        break;
    case PlayerState.Jumping:
        Console.WriteLine("Đang trên không, không nhảy thêm được");
        break;
    case PlayerState.Dead:
        Console.WriteLine("Hiện màn hình Game Over");
        break;
}
// Đang trên không, không nhảy thêm được

enum PlayerState
{
    Idle,
    Running,
    Jumping,
    Dead
}
```

Với trường hợp chỉ cần trả về một giá trị, switch expression gọn hơn:

```csharp
PlayerState state = PlayerState.Running;

float speed = state switch
{
    PlayerState.Running => 6f,
    PlayerState.Jumping => 4f,
    _ => 0f
};
Console.WriteLine(speed); // 6

enum PlayerState
{
    Idle,
    Running,
    Jumping,
    Dead
}
```

`_` là nhánh mặc định cho mọi trạng thái còn lại.

## Enum là số nguyên bên dưới

Mỗi giá trị enum thật ra là một `int`, bắt đầu từ 0 theo thứ tự khai báo. [Ép kiểu](/docs/csharp/ep-kieu) để xem hoặc chuyển ngược lại.

```csharp
Console.WriteLine((int)PlayerState.Jumping); // 2

PlayerState loaded = (PlayerState)3;
Console.WriteLine(loaded); // Dead

enum PlayerState
{
    Idle,
    Running,
    Jumping,
    Dead
}
```

Bạn có thể tự gán số. Việc này hữu ích khi giá trị có ý nghĩa, như độ hiếm của vật phẩm ảnh hưởng tới giá bán:

```csharp
Rarity rarity = Rarity.Epic;
int sellPrice = 10 * (int)rarity;
Console.WriteLine($"{rarity}: {sellPrice} vàng"); // Epic: 250 vàng

enum Rarity
{
    Common = 1,
    Rare = 5,
    Epic = 25,
    Legendary = 100
}
```

Lưu ý khi lưu game: nếu bạn lưu enum dưới dạng số rồi sau này chèn giá trị mới vào giữa danh sách, các số phía sau bị dịch đi và file save cũ đọc sai. Thêm giá trị mới vào cuối, hoặc gán số cố định như ví dụ `Rarity`.

## Trong Unity

Field kiểu enum `public` hoặc có `[SerializeField]` hiện trong Inspector dưới dạng danh sách thả xuống. Đây là cách gọn để designer chọn loại quái, loại vũ khí mà không gõ chuỗi.

## Bài tập

Tạo enum `Weather` gồm `Sunny`, `Rain`, `Storm`. Viết switch expression trả về hệ số tầm nhìn: `Sunny` là 1.0, `Rain` là 0.5, `Storm` là 0.25. In tầm nhìn khi thời tiết là `Rain` với tầm nhìn gốc là 50.

<details>
<summary>Xem đáp án</summary>

```csharp
Weather weather = Weather.Rain;
float baseView = 50f;

float factor = weather switch
{
    Weather.Sunny => 1.0f,
    Weather.Rain => 0.5f,
    Weather.Storm => 0.25f,
    _ => 1.0f
};

Console.WriteLine($"{weather}: tầm nhìn {baseView * factor}"); // Rain: tầm nhìn 25

enum Weather
{
    Sunny,
    Rain,
    Storm
}
```

</details>
