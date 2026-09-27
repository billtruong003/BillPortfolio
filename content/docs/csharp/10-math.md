---
title: "Math và Random trong C#"
description: "Dùng lớp Math trong C# (Max, Min, Abs, Sqrt, Pow, Round, Clamp) và Random.Shared.Next để tính sát thương, giới hạn máu và cơ hội chí mạng."
section: "Cơ bản"
order: 10
tags: ["Math", "Random", "Clamp", "số ngẫu nhiên"]
image: /images/docs/csharp/math.webp
imageIdea: "Nhân vật anime ngồi bàn chơi board game, tung một viên xúc xắc 20 mặt đang lơ lửng giữa không trung, bên cạnh là tấm bảng ghi công thức 'Math.Clamp(hp, 0, 100)'."
imagePrompt: "Edit this image: the character sits at a tabletop game table and has just rolled a glowing 20-sided die that floats mid-air showing '20'. A small whiteboard beside the table reads 'Math.Clamp(hp, 0, 100)' and 'CRIT!'. Keep the original art style, 16:9."
---

`Math` là lớp có sẵn trong .NET, chứa các hàm toán học hay dùng: lấy số lớn hơn, làm tròn, căn bậc hai, kẹp giá trị trong một khoảng. `Random` sinh số ngẫu nhiên. Hai thứ này gặp liên tục khi tính sát thương, hồi máu hay rơi đồ.

## Math.Max và Math.Min

`Math.Max(a, b)` trả về số lớn hơn, `Math.Min(a, b)` trả về số nhỏ hơn.

Người mới hay viết trừ máu thế này rồi để máu âm:

```csharp
int hp = 20;
hp -= 35;
Console.WriteLine(hp); // -15
```

Máu âm sẽ làm thanh máu vẽ sai và các phép so sánh sau đó rối tung. Dùng `Math.Max` để máu không xuống dưới 0:

```csharp
int hp = 20;
hp = Math.Max(hp - 35, 0);
Console.WriteLine(hp); // 0
```

Ngược lại, `Math.Min` chặn trần, ví dụ hồi máu không vượt máu tối đa:

```csharp
int hp = 90;
int maxHp = 100;
hp = Math.Min(hp + 25, maxHp);
Console.WriteLine(hp); // 100
```

## Math.Clamp

Khi cần chặn cả hai đầu, `Math.Clamp(giá trị, nhỏ nhất, lớn nhất)` gọn hơn:

```csharp
int hp = 130;
hp = Math.Clamp(hp, 0, 100);
Console.WriteLine(hp); // 100

int volume = -5;
volume = Math.Clamp(volume, 0, 10);
Console.WriteLine(volume); // 0
```

> **Lỗi hay gặp:** truyền `min` lớn hơn `max`, như `Math.Clamp(hp, 100, 0)`. Chương trình dừng với `ArgumentException`. Thứ tự luôn là giá trị, nhỏ nhất, lớn nhất.

## Math.Abs

`Math.Abs` trả về giá trị tuyệt đối, tức bỏ dấu âm. Hay dùng để đo khoảng cách giữa hai vị trí trên một trục:

```csharp
int playerX = 3;
int enemyX = 10;
int distance = Math.Abs(playerX - enemyX);
Console.WriteLine(distance); // 7
```

## Math.Sqrt và Math.Pow

`Math.Sqrt` lấy căn bậc hai, `Math.Pow(a, b)` tính `a` mũ `b`. Cả hai trả về `double`.

Khoảng cách giữa hai điểm trên mặt phẳng dùng định lý Pythagoras:

```csharp
double dx = 3;
double dy = 4;
double distance = Math.Sqrt(dx * dx + dy * dy);
Console.WriteLine(distance); // 5
```

Kinh nghiệm cần để lên cấp thường tăng theo lũy thừa:

```csharp
int level = 5;
double expNeeded = 100 * Math.Pow(1.5, level - 1);
Console.WriteLine(expNeeded); // 506.25
```

> **Lưu ý:** máy đặt định dạng Việt Nam sẽ in `506,25` thay vì `506.25`. Kết quả trong bài theo định dạng quốc tế.

## Math.Round

`Math.Round` làm tròn tới số nguyên gần nhất, hoặc tới số chữ số thập phân bạn chọn:

```csharp
double dps = 123.4567;
Console.WriteLine(Math.Round(dps));    // 123
Console.WriteLine(Math.Round(dps, 2)); // 123.46
```

`Math.Round` trả về `double`. Muốn có `int` thì ép thêm: `(int)Math.Round(dps)`. Xem trang [ép kiểu](/docs/csharp/ep-kieu).

## Số ngẫu nhiên với Random

`Random.Shared` là một bộ sinh số ngẫu nhiên dùng chung, có sẵn từ .NET 6. `Next(min, max)` trả về số nguyên từ `min` tới `max - 1`.

```csharp
int roll = Random.Shared.Next(1, 7); // xúc xắc 6 mặt: 1 đến 6
Console.WriteLine(roll); // ví dụ: 4
```

> **Lỗi hay gặp:** viết `Random.Shared.Next(1, 6)` để tung xúc xắc 6 mặt. Số `max` không bao giờ được trả về, nên xúc xắc này chỉ ra 1 tới 5. Muốn có cả 6 thì truyền `7`.

`NextDouble()` trả về số thực từ `0.0` tới dưới `1.0`, tiện để tính tỉ lệ phần trăm.

## Ví dụ: sát thương và chí mạng

Ghép tất cả lại: sát thương gốc dao động ngẫu nhiên, có 20% cơ hội chí mạng gây gấp đôi, và máu quái không xuống dưới 0.

```csharp
int enemyHp = 50;
int baseAttack = 10;
double critChance = 0.2;

int damage = baseAttack + Random.Shared.Next(-2, 3); // 8 đến 12
bool isCrit = Random.Shared.NextDouble() < critChance;
if (isCrit)
{
    damage *= 2;
}

enemyHp = Math.Max(enemyHp - damage, 0);
Console.WriteLine((isCrit ? "CHÍ MẠNG! " : "") + "Gây " + damage + " sát thương");
Console.WriteLine("Máu quái còn: " + enemyHp);
// ví dụ:
// CHÍ MẠNG! Gây 22 sát thương
// Máu quái còn: 28
```

Mỗi lần chạy ra kết quả khác nhau. Dấu `? :` là toán tử ba ngôi, học ở trang [if else](/docs/csharp/if-else).

## Bài tập

Một bình máu hồi ngẫu nhiên từ 15 tới 30 máu (tính cả 30). Nhân vật đang có 80/100 máu. Tính máu sau khi uống, không được vượt 100, và in ra.

<details>
<summary>Xem đáp án</summary>

```csharp
int hp = 80;
int maxHp = 100;

int heal = Random.Shared.Next(15, 31);
hp = Math.Clamp(hp + heal, 0, maxHp);

Console.WriteLine("Hồi " + heal + " máu, còn " + hp); // ví dụ: Hồi 22 máu, còn 100
```

</details>
