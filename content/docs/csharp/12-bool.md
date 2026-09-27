---
title: "Kiểu bool trong C#"
description: "Kiểu bool trong C#: giá trị true và false, biểu thức so sánh trả về bool, và cách dùng bool làm cờ trạng thái như isAlive, hasKey trong game."
section: "Cơ bản"
order: 12
tags: ["bool", "true false", "cờ trạng thái"]
image: /images/docs/csharp/bool.webp
imageIdea: "Nhân vật anime đứng trước một cánh cửa hầm ngục có hai bóng đèn 'true' xanh và 'false' đỏ, tay giơ chiếc chìa khoá vàng, đèn 'hasKey = true' đang sáng."
imagePrompt: "Edit this image: the character stands in front of a dungeon door with two indicator lamps above it, a green one labeled 'true' and a red one labeled 'false'. The character raises a golden key, and a glowing sign on the door reads 'hasKey = true'. Keep the original art style, 16:9."
---

`bool` là kiểu dữ liệu chỉ có hai giá trị: `true` (đúng) và `false` (sai). Nó trả lời các câu hỏi có hoặc không: nhân vật còn sống không, đã nhặt chìa khoá chưa, game có đang tạm dừng không. Mọi câu lệnh `if` và vòng lặp đều dựa vào `bool`.

## Khai báo bool

```csharp
bool isAlive = true;
bool isPaused = false;

Console.WriteLine(isAlive);  // True
Console.WriteLine(isPaused); // False
```

Trong code viết chữ thường `true`, `false`. Khi in ra, C# hiển thị `True`, `False` viết hoa chữ đầu. Chỉ là cách hiển thị, giá trị vẫn như nhau.

> **Lỗi hay gặp:** viết `bool isAlive = "true";` hoặc `bool isAlive = 1;`. C# báo lỗi CS0029 vì chuỗi `"true"` và số `1` đều không phải `bool`. Khác với C hay JavaScript, C# không coi `1` là đúng và `0` là sai.

## Biểu thức so sánh trả về bool

Bạn hiếm khi gõ thẳng `true` hay `false`. Phần lớn giá trị `bool` đến từ phép so sánh:

```csharp
int hp = 0;
int gold = 120;
int swordPrice = 100;

bool isDead = hp <= 0;
bool canBuySword = gold >= swordPrice;

Console.WriteLine(isDead);      // True
Console.WriteLine(canBuySword); // True
```

Đặt kết quả so sánh vào một biến có tên rõ ràng giúp code đọc như câu nói: "nếu đủ tiền mua kiếm thì...". Các toán tử so sánh (`==`, `!=`, `>`, `<`, `>=`, `<=`) có ở trang [toán tử](/docs/csharp/toan-tu).

## Kết hợp nhiều điều kiện

Dùng `&&` (và), `||` (hoặc), `!` (không) để ghép các `bool`:

```csharp
bool hasKey = true;
bool isBossDefeated = false;
int level = 12;

bool canEnterDungeon = hasKey && level >= 10;
bool canOpenFinalDoor = hasKey && isBossDefeated;
bool needsHelp = !isBossDefeated;

Console.WriteLine(canEnterDungeon);  // True
Console.WriteLine(canOpenFinalDoor); // False
Console.WriteLine(needsHelp);        // True
```

## Bool làm cờ trạng thái

Trong game, `bool` hay đóng vai **cờ** (flag): một công tắc bật tắt ghi nhớ trạng thái. Nhặt chìa khoá thì bật `hasKey`, chết thì tắt `isAlive`.

```csharp
bool isAlive = true;
bool hasKey = false;
int hp = 15;

// Nhặt được chìa khoá
hasKey = true;

// Trúng bẫy mất 20 máu
hp -= 20;
if (hp <= 0)
{
    isAlive = false;
}

Console.WriteLine($"Còn sống: {isAlive}, có chìa: {hasKey}");
// Còn sống: False, có chìa: True
```

Đặt tên cờ bắt đầu bằng `is`, `has`, `can`: `isAlive`, `hasKey`, `canJump`. Đọc tên là biết ngay đây là câu hỏi có hoặc không.

## Không cần so sánh với true

Người mới hay viết:

```csharp
bool isAlive = true;
if (isAlive == true)
{
    Console.WriteLine("Tiếp tục chiến đấu"); // Tiếp tục chiến đấu
}
```

Code chạy đúng, nhưng thừa. `isAlive` đã là `bool` rồi, không cần hỏi lại "có bằng true không". Viết gọn:

```csharp
bool isAlive = true;
bool isPaused = false;

if (isAlive)
{
    Console.WriteLine("Tiếp tục chiến đấu"); // Tiếp tục chiến đấu
}
if (!isPaused)
{
    Console.WriteLine("Game đang chạy"); // Game đang chạy
}
```

`!isPaused` đọc là "không tạm dừng".

## Đảo cờ

Nút bấm bật tắt (như nút Pause) chỉ cần gán cờ bằng giá trị ngược lại của chính nó:

```csharp
bool isPaused = false;
isPaused = !isPaused;
Console.WriteLine(isPaused); // True
isPaused = !isPaused;
Console.WriteLine(isPaused); // False
```

Sang trang [if else](/docs/csharp/if-else) để dùng `bool` rẽ nhánh chương trình.

## Bài tập

Một cửa bí mật chỉ mở khi người chơi có chìa khoá **hoặc** có kỹ năng mở khoá, **và** không đang bị trúng độc. Khai báo ba cờ `hasKey = false`, `hasLockpick = true`, `isPoisoned = false`, tính biến `canOpen` và in ra.

<details>
<summary>Xem đáp án</summary>

```csharp
bool hasKey = false;
bool hasLockpick = true;
bool isPoisoned = false;

bool canOpen = (hasKey || hasLockpick) && !isPoisoned;
Console.WriteLine(canOpen); // True
```

Ngoặc tròn quanh `hasKey || hasLockpick` quan trọng. Thiếu ngoặc, `&&` được tính trước `||`, ý nghĩa sẽ khác.

</details>
