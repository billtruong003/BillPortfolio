---
title: "C# cho người mới #2: Điều kiện và vòng lặp"
date: "2024-10-22"
lang: "vi"
series: "csharp"
order: 2
excerpt: "Dùng if/else và switch để chương trình biết chọn nhánh, dùng for và while để lặp lại một việc. Cuối bài ghép tất cả thành một trận đánh theo lượt nhỏ."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Vì sao cần điều kiện và vòng lặp

Game ra quyết định liên tục mỗi frame: người chơi có đang bấm nút nhảy không, HP còn bao nhiêu, enemy nào ở gần nhất. Những câu hỏi đó cần **điều kiện**. Còn khi phải kiểm tra 100 viên đạn, 50 enemy hay 64 ô inventory, bạn không thể viết tay từng dòng, bạn cần **vòng lặp**.

## If / else: chọn nhánh

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

**Thứ tự chạy:** kiểm tra từ trên xuống, gặp điều kiện `true` đầu tiên thì chạy khối đó và **bỏ qua toàn bộ phần còn lại**. Vì vậy thứ tự quan trọng. Nếu đặt `health < 25` lên trước `health <= 0`, HP bằng 0 sẽ rơi vào nhánh "Critical" và không bao giờ tới được "Game Over".

### Kết hợp điều kiện

```csharp
int stamina = 50;
bool isGrounded = true;

// AND: cả hai phải đúng
if (stamina > 20 && isGrounded)
{
    Console.WriteLine("Có thể dash!");
}

// OR: một trong hai đúng là đủ
if (health <= 0 || timeLeft <= 0)
{
    Console.WriteLine("Game Over!");
}
```

### Toán tử ba ngôi: if/else viết trên 1 dòng

```csharp
string status = (health > 0) ? "Alive" : "Dead";
int healAmount = (health < 50) ? 30 : 15;  // HP thấp thì hồi nhiều hơn
string display = $"HP: {health} ({(health > 50 ? "OK" : "LOW")})";
```

Chỉ nên dùng khi logic đơn giản. Lồng nhiều tầng thì quay về if/else cho dễ đọc.

## Switch: nhiều nhánh theo một giá trị

Khi cần so một biến với nhiều giá trị cụ thể, chuỗi `else if` dài rất khó đọc. `switch` gọn hơn:

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

**Lưu ý:** C# không cho một `case` chạy tuột xuống `case` kế tiếp như C hay JavaScript. Vì vậy mỗi `case` có code phải kết thúc bằng một lệnh nhảy ra: thường là `break`, nhưng `return`, `continue`, `goto` hay `throw` cũng được. Quên thì compiler báo lỗi ngay. `default` xử lý mọi giá trị không khớp case nào.

### Switch expression (C# 8 trở lên): gọn hơn nữa

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

Cách này hợp khi bạn muốn gán một giá trị tùy theo điều kiện.

## Vòng lặp for: khi biết số lần lặp

### Cú pháp

```csharp
// In số 0 đến 4
for (int i = 0; i < 5; i++)
{
    Console.WriteLine($"Iteration: {i}");
}
```

Ba phần: `khởi tạo; điều kiện; bước nhảy`. Vòng lặp chạy khi điều kiện còn `true`.

### Ví dụ: spawn enemy

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
// Đếm ngược
for (int i = 10; i >= 0; i--)
{
    Console.WriteLine(i);
}
Console.WriteLine("GO!");
```

## Vòng lặp while: khi không biết trước số lần

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

Bạn không biết trước boss chết sau mấy lượt, nó tùy vào máu và damage lúc chạy. Những trường hợp như vậy dùng `while`. Nhớ đảm bảo điều kiện sẽ có lúc thành `false`, nếu không vòng lặp chạy mãi.

### Do-while: chạy ít nhất 1 lần

```csharp
string input;
do
{
    Console.Write("Nhập mật khẩu: ");
    input = Console.ReadLine();
} while (input != "secret123");

Console.WriteLine("Đăng nhập thành công!");
```

Khác biệt: `do-while` kiểm tra điều kiện **sau** khi chạy thân vòng lặp, nên thân luôn chạy ít nhất 1 lần.

## Break và continue

### Break: thoát vòng lặp ngay

```csharp
// Giả sử đã có sẵn: mảng enemies, biến player và hàm GetDistance
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

### Continue: bỏ qua lượt hiện tại

```csharp
// Giả sử đã có sẵn: teamSize và mảng teamHealth
// Hồi máu cho mọi đồng đội còn sống
for (int i = 0; i < teamSize; i++)
{
    if (teamHealth[i] <= 0)
        continue;  // đã chết, bỏ qua

    teamHealth[i] += 20;
    Console.WriteLine($"Healed member #{i}, HP: {teamHealth[i]}");
}
```

## Vòng lặp lồng nhau

Dùng khi làm việc với lưới 2D (map, inventory, bàn cờ):

```csharp
// Tạo lưới 3x3 cho cờ ca-rô
int rows = 3, cols = 3;
int cellNumber = 1;

for (int row = 0; row < rows; row++)
{
    for (int col = 0; col < cols; col++)
    {
        Console.Write($"[{cellNumber}] ");
        cellNumber++;
    }
    Console.WriteLine();  // xuống dòng sau mỗi hàng
}
```

Output:
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
```

## Ví dụ tổng hợp: trận đánh theo lượt

```csharp
int playerHP = 100;
int enemyHP = 80;
int turn = 1;
bool ranAway = false;

while (playerHP > 0 && enemyHP > 0 && !ranAway)
{
    Console.WriteLine($"\n--- Turn {turn} ---");
    Console.WriteLine($"Player HP: {playerHP} | Enemy HP: {enemyHP}");
    Console.Write("Chọn: (1) Attack  (2) Heal  (3) Run > ");
    string choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            int damage = 15 + (turn % 3 == 0 ? 10 : 0);  // cứ 3 lượt được thêm damage
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
            ranAway = true;
            continue;  // quay lại kiểm tra điều kiện while, ranAway = true nên vòng lặp dừng
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
if (ranAway)
    Console.WriteLine("\nBạn đã chạy thoát!");
else if (enemyHP <= 0)
    Console.WriteLine("\nBạn thắng!");
else
    Console.WriteLine("\nGame Over!");
```

Để ý cách xử lý lựa chọn "Run". Cách dễ nghĩ ra là gán `playerHP = -1` cho vòng lặp dừng, nhưng khi đó phần kết quả sẽ in "Game Over!", tức là chạy trốn bị tính như chết. Một biến `bool` riêng tên `ranAway` nói đúng chuyện gì đã xảy ra, và phần kết quả kiểm tra nó trước.

Ví dụ này dùng lại gần hết những gì bạn vừa học: **while**, **switch**, **if/else**, **toán tử ba ngôi**, **%**, **break** và **continue**.

## Bài tập

**Bài 1: Xếp hạng người chơi**
Nhập điểm score. In ra rank: S (>= 10000), A (>= 7000), B (>= 4000), C (>= 2000), D (còn lại). Dùng if/else hoặc switch expression.

**Bài 2: Mở rương**
Viết vòng lặp mở 10 rương. Mỗi rương dùng `Random` để lấy số từ 1 đến 100. Nếu <= 5: Legendary, <= 20: Rare, <= 50: Common, còn lại: Empty. Đếm và in tổng mỗi loại. (Gợi ý: tạo một lần `Random rng = new Random();` ngoài vòng lặp, rồi gọi `rng.Next(1, 101)` trong vòng lặp)

**Bài 3: Lưới dungeon**
In ra một lưới dungeon 5x5. Mỗi ô ngẫu nhiên là `"."` (trống), `"#"` (tường) hoặc `"E"` (enemy). Đặt người chơi `"P"` ở vị trí [0,0].

---

**Bài trước:** [C# cho người mới #1: Cú pháp, biến và kiểu dữ liệu](/lab/csharp-01-basics)
**Bài tiếp:** [C# cho người mới #3: Array, List và Dictionary](/lab/csharp-03-collections)
