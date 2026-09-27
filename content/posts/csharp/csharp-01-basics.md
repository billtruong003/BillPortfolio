---
title: "C# cho người mới #1: Cú pháp, biến và kiểu dữ liệu"
date: "2024-10-20"
lang: "vi"
series: "csharp"
order: 1
excerpt: "Viết dòng C# đầu tiên, rồi làm quen với kiểu dữ liệu, biến, hằng, toán tử và nhập xuất trên console. Ví dụ lấy từ chỉ số nhân vật trong game."
coverImage: "/images/posts/csharp-cover.webp"
category: "tutorial"
tags: ["CSharp", "Programming", "Game Development", "Course"]
published: true
featured: false
---

## Series này dành cho ai

Unity dùng C# để viết script. Nếu bạn mở series [Làm game bắn máy bay với Unity 6](/lab/unity-shmup-00-setup) mà thấy `float`, `List<T>` hay `class` còn lạ, thì nên đi qua series này trước. Nó chỉ dạy phần C# nền tảng, chạy trên console, chưa đụng tới Unity.

Bạn cần cài .NET SDK (bản 6 trở lên), tạo project bằng `dotnet new console`, rồi dán code vào `Program.cs` và chạy `dotnet run`.

**Series gồm 7 bài:**
1. **Cú pháp, biến và kiểu dữ liệu** (bài này)
2. Điều kiện và vòng lặp
3. Array, List và Dictionary
4. Hàm, tham số và enum
5. OOP: class, object và constructor
6. OOP tiếp theo: kế thừa, interface và đa hình
7. Exception, LINQ và delegate

## Hello World

Dòng code đầu tiên:

```csharp
Console.WriteLine("Hello, Game Dev!");
```

Từ **.NET 6** trở đi, C# cho phép viết code ngay ở đầu file mà không cần bọc trong class. Cách này gọi là **top-level statements**, và cả series sẽ dùng nó. Bạn sẽ gặp cấu trúc đầy đủ dưới đây trong tài liệu cũ, nó chạy ra cùng một kết quả:

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

- `using System;`: dùng thư viện chuẩn
- `class Program`: code C# nằm trong class
- `static void Main`: chỗ chương trình bắt đầu chạy
- `Console.WriteLine`: in ra console rồi xuống dòng

## Kiểu dữ liệu

Trong game, mọi thứ đều là dữ liệu: máu nhân vật là số, tên người chơi là chuỗi, còn sống hay đã chết là true/false. Mỗi loại dữ liệu có một kiểu riêng trong C#.

### Số nguyên

```csharp
int playerHealth = 100;        // khoảng -2.1 tỷ đến 2.1 tỷ
long worldSeed = 9876543210L;  // số rất lớn
byte itemSlot = 255;           // 0 đến 255, tốn ít bộ nhớ
```

`int` là kiểu bạn dùng nhiều nhất. `byte` có ích khi cần tiết kiệm bộ nhớ, ví dụ kênh màu có giá trị 0 đến 255.

### Số thực

```csharp
float moveSpeed = 5.5f;             // khoảng 7 chữ số chính xác, PHẢI có hậu tố f
double preciseAngle = 45.123456789; // khoảng 15 chữ số chính xác
```

Lỗi hay gặp nhất: viết `float moveSpeed = 5.5;` rồi bị báo lỗi. Số có dấu chấm mà không có hậu tố thì C# hiểu là `double`, và nó không tự ép `double` về `float`. Unity dùng `float` cho gần như mọi thứ (vị trí, góc xoay, tỉ lệ), nên hãy tập thói quen thêm `f` sau số thực.

### Chuỗi và ký tự

```csharp
string playerName = "BillTheDev";
char rank = 'S';  // một ký tự, dùng nháy đơn
```

### Boolean

```csharp
bool isAlive = true;
bool isGrounded = false;
```

Chỉ có 2 giá trị: `true` hoặc `false`. Logic game dùng kiểu này rất nhiều.

### Bảng tóm tắt

| Kiểu | Kích thước | Ví dụ trong game |
|------|-----------|----------------|
| `int` | 4 bytes | HP, damage, score |
| `float` | 4 bytes | speed, position, rotation |
| `double` | 8 bytes | phép tính cần độ chính xác cao |
| `bool` | 1 byte | isAlive, isGrounded, hasKey |
| `string` | tùy độ dài | playerName, dialogText |
| `char` | 2 bytes | xếp hạng, phím bấm |

## Biến và hằng

### Biến: giá trị đổi được

```csharp
int score = 0;
score = score + 100;  // score giờ là 100
score += 50;          // viết gọn, score là 150

string weapon = "Sword";
weapon = "Bow";  // đổi vũ khí
```

### Hằng: giá trị cố định

```csharp
const int MAX_HEALTH = 100;
const float GRAVITY = -9.81f;
const string GAME_VERSION = "1.0.0";
```

Dùng `const` cho những giá trị không bao giờ đổi. Tên hằng thường viết kiểu UPPER_SNAKE_CASE.

### var: để compiler tự đoán kiểu

```csharp
var damage = 25;          // compiler hiểu là int
var name = "Player";      // compiler hiểu là string
var speed = 3.5f;         // compiler hiểu là float
```

`var` tiện, nhưng chỉ nên dùng khi nhìn giá trị gán là biết ngay kiểu.

## Toán tử

### Toán tử số học

```csharp
int a = 10, b = 3;

int sum = a + b;       // 13
int diff = a - b;      // 7
int product = a * b;   // 30
int quotient = a / b;  // 3 (chia nguyên!)
int remainder = a % b; // 1 (phần dư, rất hay dùng)
```

**Chỗ dễ sai:** `int / int` cho ra `int`, phần thập phân bị bỏ đi. Muốn ra số thực thì ép kiểu một trong hai số:

```csharp
float result = (float)a / b;  // 3.333...
```

**Toán tử `%` (chia lấy dư)** dùng nhiều trong game:

```csharp
// Xoay vòng 4 hướng: 0, 1, 2, 3, 0, 1, 2, 3...
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
// AND: cả hai phải true
bool canDash = (isGrounded && stamina > 20);

// OR: một trong hai true là đủ
bool gameOver = (health <= 0 || timeLeft <= 0);

// NOT: đảo ngược
bool isVisible = !isHidden;
```

### Toán tử gán rút gọn

```csharp
health -= 25;     // health = health - 25
score += 100;     // score = score + 100
speed *= 1.5f;    // speed = speed * 1.5f
ammo--;           // ammo = ammo - 1
combo++;          // combo = combo + 1
```

## Nhập và xuất dữ liệu

### Xuất ra console

```csharp
// Xuất và xuống dòng
Console.WriteLine("Game Over!");

// Xuất không xuống dòng
Console.Write("Enter name: ");

// String interpolation: cách viết gọn nhất
string name = "Bill";
int score = 9999;
Console.WriteLine($"Player: {name} | Score: {score}");

// Định dạng ngay trong interpolation
float completion = 0.756f;
Console.WriteLine($"Progress: {completion:P1}");  // "Progress: 75.6%"
```

Nối chuỗi bằng `+` nhiều lần rất khó đọc, dễ thiếu dấu cách. `$"..."` (string interpolation) gọn hơn và là cách phổ biến trong C# hiện nay, nên ưu tiên dùng nó.

### Nhập từ bàn phím

```csharp
Console.Write("Nhập tên nhân vật: ");
string playerName = Console.ReadLine();

Console.Write("Nhập level: ");
int level = int.Parse(Console.ReadLine());

Console.Write("Nhập tốc độ: ");
float speed = float.Parse(Console.ReadLine());
```

**Cẩn thận:** `Console.ReadLine()` luôn trả về `string`. Muốn có số thì phải dùng `int.Parse()` hoặc `float.Parse()`. Nếu người dùng gõ chữ thay vì số, chương trình sẽ dừng vì lỗi. Cách xử lý chuyện này nằm ở bài 7.

## Ép kiểu

```csharp
// Ép ngầm: tự động và an toàn (kiểu nhỏ sang kiểu lớn)
int damage = 50;
float damageFloat = damage;  // 50 thành 50.0f, không mất gì

// Ép tường minh: phải viết ra, có thể mất dữ liệu (kiểu lớn sang kiểu nhỏ)
float position = 3.7f;
int gridX = (int)position;  // 3 (cắt phần thập phân, KHÔNG làm tròn)

// Parse: chuyển string sang số
string input = "100";
int health = int.Parse(input);
```

## Ví dụ tổng hợp: chỉ số nhân vật

```csharp
// Khai báo chỉ số nhân vật
string characterName = "Dark Knight";
int health = 100;
int maxHealth = 100;
float attackSpeed = 1.5f;
int baseDamage = 25;
bool isAlive = true;

// Nhận sát thương
int incomingDamage = 30;
health -= incomingDamage;
Console.WriteLine($"{characterName} nhận {incomingDamage} damage! HP: {health}/{maxHealth}");

// Kiểm tra còn sống không
isAlive = (health > 0);
Console.WriteLine($"Còn sống: {isAlive}");

// Tính DPS (sát thương mỗi giây)
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
DPS: 37.5
HP còn: 70%
```

## Bài tập

**Bài 1: Ô inventory**
Tạo các biến cho một item trong inventory: tên item (`string`), số lượng (`int`), trọng lượng mỗi cái (`float`), có xếp chồng được không (`bool`). In ra thông tin item và tổng trọng lượng.

**Bài 2: Tính damage**
Nhập base damage (`int`) và hệ số chí mạng (`float`). Tính damage thường và damage chí mạng. In kết quả dạng: `"Normal: 25 | Critical: 50.0"`.

**Bài 3: Đổi tiền**
Game có 3 loại tiền: Gold, Silver, Copper. 1 Gold = 100 Silver, 1 Silver = 100 Copper. Nhập tổng số Copper, đổi ra và in dạng: `"5 Gold, 23 Silver, 17 Copper"`. (Gợi ý: dùng `/` và `%`)

---

**Bài tiếp theo:** [C# cho người mới #2: Điều kiện và vòng lặp](/lab/csharp-02-control-flow)
