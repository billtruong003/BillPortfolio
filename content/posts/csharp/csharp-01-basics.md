---
title: "C# Cho Game Dev #1: Syntax, Biến & Kiểu Dữ Liệu"
date: "2024-10-20"
excerpt: "Bắt đầu hành trình C# từ con số 0. Tìm hiểu cấu trúc chương trình, kiểu dữ liệu, biến, hằng, toán tử và nhập/xuất dữ liệu — tất cả với context game development."
coverImage: "/images/posts/csharp-cover.png"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Tại sao C# cho Game Dev?

C# là ngôn ngữ chính của **Unity** — engine được dùng để làm Hollow Knight, Cuphead, Genshin Impact, và hàng ngàn tựa game khác. Trước khi nhảy vào Unity, bạn cần nắm vững C# đã. Series này sẽ đưa bạn từ zero đến đủ kiến thức để bắt đầu scripting trong Unity.

**Series gồm 7 bài:**
1. **Syntax, Biến & Kiểu Dữ Liệu** ← Bạn đang ở đây
2. Control Flow: Điều Kiện & Vòng Lặp
3. Collections: Array, List & Dictionary
4. Methods, Parameters & Enum
5. OOP: Class, Object & Constructor
6. OOP Nâng Cao: Inheritance, Interface & Polymorphism
7. Ứng Dụng: Exception, LINQ & Delegate

## Hello World

Mọi hành trình đều bắt đầu từ một dòng code:

```csharp
Console.WriteLine("Hello, Game Dev!");
```

Nếu bạn dùng **.NET 6+** (top-level statements), chỉ cần dòng trên là đủ. Với phiên bản cũ hơn, bạn cần cấu trúc đầy đủ:

```csharp
using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, Game Dev!");
    }
}
```

- `using System;` — import thư viện chuẩn
- `class Program` — mọi code trong C# đều nằm trong class
- `static void Main` — điểm bắt đầu của chương trình
- `Console.WriteLine` — in ra console và xuống dòng

## Kiểu Dữ Liệu

Trong game, mọi thứ đều là dữ liệu: máu nhân vật là số, tên player là chuỗi, trạng thái sống/chết là boolean. C# có các kiểu dữ liệu cơ bản sau:

### Số nguyên

```csharp
int playerHealth = 100;        // -2.1 tỷ → 2.1 tỷ
long worldSeed = 9876543210L;  // số cực lớn
byte itemSlot = 255;           // 0 → 255, tiết kiệm bộ nhớ
```

`int` là kiểu bạn sẽ dùng nhiều nhất. `byte` hữu ích khi tối ưu bộ nhớ (ví dụ: color channels 0-255).

### Số thực

```csharp
float moveSpeed = 5.5f;        // 7 chữ số chính xác, PHẢI có hậu tố f
double preciseAngle = 45.123456789; // 15 chữ số chính xác
```

**Quan trọng:** Unity dùng `float` cho hầu hết mọi thứ (position, rotation, scale). Luôn nhớ thêm `f` sau số thực khi dùng float.

### Chuỗi & Ký tự

```csharp
string playerName = "BillTheDev";
char rank = 'S';  // ký tự đơn, dùng nháy đơn
```

### Boolean

```csharp
bool isAlive = true;
bool isGrounded = false;
```

Chỉ có 2 giá trị: `true` hoặc `false`. Đây là kiểu bạn sẽ dùng cực kỳ nhiều trong game logic.

### Bảng tóm tắt

| Kiểu | Kích thước | Ví dụ game dev |
|------|-----------|----------------|
| `int` | 4 bytes | HP, damage, score |
| `float` | 4 bytes | speed, position, rotation |
| `double` | 8 bytes | tính toán chính xác cao |
| `bool` | 1 byte | isAlive, isGrounded, hasKey |
| `string` | dynamic | playerName, dialogText |
| `char` | 2 bytes | grade, keyPress |

## Biến và Hằng

### Biến — giá trị thay đổi được

```csharp
int score = 0;
score = score + 100;  // score giờ = 100
score += 50;          // viết gọn, score = 150

string weapon = "Sword";
weapon = "Bow";  // đổi vũ khí
```

### Hằng — giá trị cố định

```csharp
const int MAX_HEALTH = 100;
const float GRAVITY = -9.81f;
const string GAME_VERSION = "1.0.0";
```

Dùng `const` cho những giá trị không bao giờ thay đổi. Convention: đặt tên UPPER_SNAKE_CASE.

### Var — để compiler tự suy luận kiểu

```csharp
var damage = 25;          // compiler biết đây là int
var name = "Player";      // compiler biết đây là string
var speed = 3.5f;         // compiler biết đây là float
```

`var` tiện nhưng chỉ nên dùng khi kiểu dữ liệu đã rõ ràng từ giá trị gán.

## Toán Tử

### Toán tử số học

```csharp
int a = 10, b = 3;

int sum = a + b;       // 13
int diff = a - b;      // 7
int product = a * b;   // 30
int quotient = a / b;  // 3 (chia nguyên!)
int remainder = a % b; // 1 (chia dư — rất hữu ích)
```

**Lưu ý quan trọng:** `int / int` cho kết quả `int` (bỏ phần thập phân). Muốn kết quả thực, ép kiểu:

```csharp
float result = (float)a / b;  // 3.333...
```

**Toán tử `%` (modulo)** cực kỳ hay dùng trong game:

```csharp
// Cycle qua 4 hướng: 0, 1, 2, 3, 0, 1, 2, 3...
int direction = (currentStep % 4);

// Kiểm tra số chẵn/lẻ
bool isEven = (number % 2 == 0);
```

### Toán tử so sánh

```csharp
bool canAttack = (stamina > 0);
bool isDead = (health <= 0);
bool isMatch = (password == "secret");
bool isDifferent = (teamA != teamB);
```

### Toán tử logic

```csharp
// AND — cả hai phải true
bool canDash = (isGrounded && stamina > 20);

// OR — một trong hai true là đủ
bool gameOver = (health <= 0 || timeLeft <= 0);

// NOT — đảo ngược
bool isVisible = !isHidden;
```

### Toán tử gán tắt

```csharp
health -= 25;     // health = health - 25
score += 100;     // score = score + 100
speed *= 1.5f;    // speed = speed * 1.5f
ammo--;           // ammo = ammo - 1
combo++;          // combo = combo + 1
```

## Nhập/Xuất Dữ Liệu

### Xuất ra console

```csharp
// Xuất và xuống dòng
Console.WriteLine("Game Over!");

// Xuất không xuống dòng
Console.Write("Enter name: ");

// String interpolation — cách viết gọn nhất
string name = "Bill";
int score = 9999;
Console.WriteLine($"Player: {name} | Score: {score}");

// Format trực tiếp trong interpolation
float completion = 0.756f;
Console.WriteLine($"Progress: {completion:P1}");  // "Progress: 75.6%"
```

**Tip:** `$"..."` (string interpolation) là cách format chuỗi phổ biến nhất trong C# hiện đại. Luôn ưu tiên cách này thay vì nối chuỗi bằng `+`.

### Nhập từ bàn phím

```csharp
Console.Write("Nhập tên nhân vật: ");
string playerName = Console.ReadLine();

Console.Write("Nhập level: ");
int level = int.Parse(Console.ReadLine());

Console.Write("Nhập tốc độ: ");
float speed = float.Parse(Console.ReadLine());
```

**Cẩn thận:** `Console.ReadLine()` luôn trả về `string`. Muốn số phải dùng `int.Parse()` hoặc `float.Parse()`. Nếu người dùng nhập sai (ví dụ nhập chữ thay vì số), chương trình sẽ crash — cách xử lý lỗi này sẽ học ở bài 7.

## Ép Kiểu (Type Casting)

```csharp
// Implicit — tự động, an toàn (nhỏ → lớn)
int damage = 50;
float damageFloat = damage;  // 50 → 50.0f, OK

// Explicit — thủ công, có thể mất dữ liệu (lớn → nhỏ)
float position = 3.7f;
int gridX = (int)position;  // 3 (cắt phần thập phân, KHÔNG làm tròn)

// Parse — chuyển string sang số
string input = "100";
int health = int.Parse(input);
```

## Ví Dụ Tổng Hợp: Character Stats

```csharp
// Khai báo stats nhân vật
string characterName = "Dark Knight";
int health = 100;
int maxHealth = 100;
float attackSpeed = 1.2f;
int baseDamage = 25;
bool isAlive = true;

// Nhận sát thương
int incomingDamage = 30;
health -= incomingDamage;
Console.WriteLine($"{characterName} nhận {incomingDamage} damage! HP: {health}/{maxHealth}");

// Kiểm tra còn sống không
isAlive = (health > 0);
Console.WriteLine($"Còn sống: {isAlive}");

// Tính DPS
float dps = baseDamage * attackSpeed;
Console.WriteLine($"DPS: {dps}");

// Tính % HP còn lại
float healthPercent = (float)health / maxHealth * 100;
Console.WriteLine($"HP còn: {healthPercent}%");
```

Output:
```
Dark Knight nhận 30 damage! HP: 70/100
Còn sống: True
DPS: 30
HP còn: 70%
```

## Bài Tập

**Bài 1: Inventory Slot**
Tạo các biến cho một item trong inventory: tên item (`string`), số lượng (`int`), trọng lượng mỗi cái (`float`), có thể stack được không (`bool`). In ra thông tin item và tổng trọng lượng.

**Bài 2: Damage Calculator**
Nhập vào base damage (`int`) và critical multiplier (`float`). Tính damage thường và critical damage. In kết quả dạng: `"Normal: 25 | Critical: 50.0"`.

**Bài 3: Currency Converter**
Trong game có 3 loại tiền: Gold, Silver, Copper. 1 Gold = 100 Silver, 1 Silver = 100 Copper. Nhập vào tổng số Copper, chuyển đổi và in ra dạng: `"5 Gold, 23 Silver, 17 Copper"`. (Gợi ý: dùng `/` và `%`)

---

**Bài tiếp theo:** [C# Cho Game Dev #2: Control Flow — Điều Kiện & Vòng Lặp](/lab/csharp-02-control-flow)
