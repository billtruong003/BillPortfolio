---
title: "C# Cho Game Dev #2: Control Flow — Điều Kiện & Vòng Lặp"
date: "2024-10-22"
excerpt: "Điều khiển luồng chương trình với if/else, switch và vòng lặp for/while. Học cách ra quyết định và lặp lại hành động — nền tảng của mọi game logic."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Tại sao cần Control Flow?

Game liên tục ra quyết định mỗi frame: Người chơi có đang nhấn nút nhảy không? HP còn bao nhiêu? Enemy nào gần nhất? Tất cả đều cần **điều kiện**. Và khi cần kiểm tra 100 viên đạn, 50 enemy, hay 64 ô inventory — bạn cần **vòng lặp**.

## If / Else — Ra quyết định

### Cú pháp cơ bản

```csharp
int health = 30;

if (health <= 0)
{
    Console.WriteLine("Game Over");
}
else if (health < 25)
{
    Console.WriteLine("Critical! HP thấp!");
}
else
{
    Console.WriteLine($"HP: {health}");
}
```

**Luồng chạy:** Kiểm tra từ trên xuống, gặp điều kiện `true` đầu tiên thì chạy block đó và **bỏ qua tất cả phần còn lại**.

### Kết hợp điều kiện

```csharp
int stamina = 50;
bool isGrounded = true;

// AND — cả hai phải đúng
if (stamina > 20 && isGrounded)
{
    Console.WriteLine("Có thể dash!");
}

// OR — một trong hai đúng là đủ
if (health <= 0 || timeLeft <= 0)
{
    Console.WriteLine("Game Over!");
}
```

### Ternary Operator — if/else viết gọn 1 dòng

```csharp
string status = (health > 0) ? "Alive" : "Dead";
int healAmount = (health < 50) ? 30 : 15;  // heal nhiều hơn khi HP thấp
string display = $"HP: {health} ({(health > 50 ? "OK" : "LOW")})";
```

Chỉ nên dùng khi logic đơn giản. Nếu phức tạp, dùng if/else cho dễ đọc.

## Switch — Nhiều nhánh rõ ràng

Khi cần kiểm tra 1 biến với nhiều giá trị cụ thể, `switch` sạch hơn if/else:

```csharp
string weapon = "Bow";

switch (weapon)
{
    case "Sword":
        Console.WriteLine("Melee damage: 30");
        break;
    case "Bow":
        Console.WriteLine("Ranged damage: 20");
        break;
    case "Staff":
        Console.WriteLine("Magic damage: 40");
        break;
    default:
        Console.WriteLine("Unarmed: 5");
        break;
}
```

**Lưu ý:** Mỗi `case` phải có `break;` để thoát. `default` xử lý mọi trường hợp không match.

### Switch Expression (C# 8+) — viết gọn hơn nữa

```csharp
int damage = weapon switch
{
    "Sword" => 30,
    "Bow"   => 20,
    "Staff" => 40,
    _       => 5  // _ là default
};
Console.WriteLine($"Damage: {damage}");
```

Cách này rất hay khi muốn gán giá trị dựa trên điều kiện.

## For Loop — Lặp khi biết số lần

### Cú pháp

```csharp
// In số 0 đến 4
for (int i = 0; i < 5; i++)
{
    Console.WriteLine($"Iteration: {i}");
}
```

Ba phần: `khởi tạo; điều kiện; bước nhảy`. Vòng lặp chạy khi điều kiện còn `true`.

### Ví dụ game: Spawn enemies

```csharp
int enemyCount = 5;
for (int i = 0; i < enemyCount; i++)
{
    float spawnX = i * 3.0f;  // cách nhau 3 đơn vị
    Console.WriteLine($"Spawn enemy #{i + 1} tại x={spawnX}");
}
```

Output:
```
Spawn enemy #1 tại x=0
Spawn enemy #2 tại x=3
Spawn enemy #3 tại x=6
Spawn enemy #4 tại x=9
Spawn enemy #5 tại x=12
```

### Lặp ngược

```csharp
// Countdown
for (int i = 10; i >= 0; i--)
{
    Console.WriteLine(i);
}
Console.WriteLine("GO!");
```

## While Loop — Lặp khi không biết trước số lần

```csharp
int bossHealth = 250;
int playerDamage = 40;
int turn = 0;

while (bossHealth > 0)
{
    turn++;
    bossHealth -= playerDamage;
    Console.WriteLine($"Turn {turn}: Boss HP = {bossHealth}");
}
Console.WriteLine($"Boss defeated sau {turn} turns!");
```

`while` phù hợp khi không biết trước sẽ lặp bao nhiêu lần — phụ thuộc vào điều kiện runtime.

### Do-While — Chạy ít nhất 1 lần

```csharp
string input;
do
{
    Console.Write("Nhập mật khẩu: ");
    input = Console.ReadLine();
} while (input != "secret123");

Console.WriteLine("Đăng nhập thành công!");
```

Khác biệt: `do-while` kiểm tra điều kiện **sau** khi chạy, nên luôn chạy ít nhất 1 lần.

## Break & Continue

### Break — thoát vòng lặp ngay lập tức

```csharp
// Tìm enemy đầu tiên trong phạm vi
for (int i = 0; i < enemyCount; i++)
{
    float distance = GetDistance(player, enemies[i]);
    if (distance < 10.0f)
    {
        Console.WriteLine($"Phát hiện enemy #{i} trong phạm vi!");
        break;  // tìm thấy rồi, không cần lặp tiếp
    }
}
```

### Continue — bỏ qua iteration hiện tại

```csharp
// Heal tất cả teammates còn sống
for (int i = 0; i < teamSize; i++)
{
    if (teamHealth[i] <= 0)
        continue;  // đã chết, bỏ qua

    teamHealth[i] += 20;
    Console.WriteLine($"Healed member #{i}, HP: {teamHealth[i]}");
}
```

## Nested Loops — Vòng lặp lồng nhau

Dùng khi làm việc với grid 2D (map, inventory, board game):

```csharp
// Tạo grid 3x3 cho Tic-Tac-Toe
int rows = 3, cols = 3;
int cellNumber = 1;

for (int row = 0; row < rows; row++)
{
    for (int col = 0; col < cols; col++)
    {
        Console.Write($"[{cellNumber}] ");
        cellNumber++;
    }
    Console.WriteLine();  // xuống dòng sau mỗi row
}
```

Output:
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
```

## Ví Dụ Tổng Hợp: Mini Turn-Based Combat

```csharp
int playerHP = 100;
int enemyHP = 80;
int turn = 1;

while (playerHP > 0 && enemyHP > 0)
{
    Console.WriteLine($"\n--- Turn {turn} ---");
    Console.WriteLine($"Player HP: {playerHP} | Enemy HP: {enemyHP}");
    Console.Write("Chọn: (1) Attack  (2) Heal  (3) Run > ");
    string choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            int damage = 15 + (turn % 3 == 0 ? 10 : 0);  // bonus mỗi 3 turn
            enemyHP -= damage;
            string bonus = (turn % 3 == 0) ? " (CRITICAL!)" : "";
            Console.WriteLine($"Bạn gây {damage} damage!{bonus}");
            break;
        case "2":
            int heal = 20;
            playerHP += heal;
            if (playerHP > 100) playerHP = 100;
            Console.WriteLine($"Hồi {heal} HP!");
            break;
        case "3":
            Console.WriteLine("Bạn chạy trốn!");
            playerHP = -1;  // trigger end
            continue;
        default:
            Console.WriteLine("Lệnh không hợp lệ, mất lượt!");
            break;
    }

    // Enemy tấn công
    if (enemyHP > 0 && playerHP > 0)
    {
        int enemyDamage = 10;
        playerHP -= enemyDamage;
        Console.WriteLine($"Enemy tấn công, gây {enemyDamage} damage!");
    }

    turn++;
}

// Kết quả
if (enemyHP <= 0)
    Console.WriteLine("\nBạn thắng!");
else if (playerHP <= 0)
    Console.WriteLine("\nGame Over!");
```

Ví dụ này kết hợp **while loop**, **switch**, **if/else**, **ternary**, **modulo**, và **break/continue** — tất cả những gì bạn vừa học.

## Bài Tập

**Bài 1: Xếp hạng Player**
Nhập vào điểm score. In ra rank: S (>= 10000), A (>= 7000), B (>= 4000), C (>= 2000), D (còn lại). Dùng if/else hoặc switch expression.

**Bài 2: Loot Table**
Viết vòng lặp mở 10 rương. Mỗi rương dùng `Random` để random số 1-100. Nếu <= 5: Legendary, <= 20: Rare, <= 50: Common, còn lại: Empty. Đếm và in tổng mỗi loại. (Gợi ý: `new Random().Next(1, 101)`)

**Bài 3: Dungeon Grid**
In ra một dungeon grid 5x5. Mỗi ô random là `"."` (trống), `"#"` (tường), hoặc `"E"` (enemy). Đặt player `"P"` ở vị trí [0,0].

---

**Bài trước:** [C# #1: Syntax, Biến & Kiểu Dữ Liệu](/lab/csharp-01-basics)
**Bài tiếp:** [C# #3: Collections — Array, List & Dictionary](/lab/csharp-03-collections)
