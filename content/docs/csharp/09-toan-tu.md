---
title: "Toán tử trong C#"
description: "Các toán tử trong C#: số học, gán, so sánh, logic, tăng giảm ++ và --, cùng cái bẫy chia số nguyên khiến 7 / 2 ra 3."
section: "Cơ bản"
order: 9
tags: ["toán tử", "số học", "so sánh", "logic"]
image: /images/docs/csharp/toan-tu.webp
imageIdea: "Nhân vật anime chia 7 miếng bánh cho 2 bạn đồng hành, mỗi người được 3 miếng, miếng thứ 7 còn lại trên đĩa có cắm lá cờ ghi '7 % 2 = 1'."
imagePrompt: "Edit this image: the character is sharing 7 slices of cake between 2 adventurer companions, each companion holds 3 slices, and one leftover slice on the plate has a tiny flag reading '7 % 2 = 1'. A chalkboard behind shows '7 / 2 = 3'. Keep the original art style, 16:9."
---

Toán tử là các ký hiệu như `+`, `-`, `==`, `&&` dùng để tính toán, so sánh và kết hợp điều kiện. Trong game, gần như dòng code nào cũng có toán tử: trừ máu, cộng vàng, kiểm tra người chơi còn sống không.

## Toán tử số học

| Toán tử | Ý nghĩa | Ví dụ | Kết quả |
| --- | --- | --- | --- |
| `+` | Cộng | `100 + 20` | `120` |
| `-` | Trừ | `100 - 35` | `65` |
| `*` | Nhân | `12 * 3` | `36` |
| `/` | Chia | `20 / 4` | `5` |
| `%` | Chia lấy dư | `17 % 5` | `2` |

```csharp
int attack = 12;
int critMultiplier = 2;
int damage = attack * critMultiplier;
Console.WriteLine(damage); // 24
```

`%` hay dùng để kiểm tra chẵn lẻ hoặc làm việc gì đó mỗi N lượt:

```csharp
int turn = 9;
Console.WriteLine(turn % 3 == 0); // True, lượt chia hết cho 3 thì boss hồi máu
```

## Chia số nguyên: 7 / 2 = 3

Đây là cái bẫy mà gần như ai học C# cũng dính một lần.

```csharp
Console.WriteLine(7 / 2);   // 3
Console.WriteLine(7.0 / 2); // 3.5
```

Khi cả hai số đều là `int`, C# chia số nguyên: bỏ phần dư, không làm tròn. `7 / 2` ra `3`, không phải `3.5` hay `4`.

> **Lưu ý:** máy đặt định dạng Việt Nam sẽ in `3,5` thay vì `3.5`. Kết quả trong bài theo định dạng quốc tế.

> **Lỗi hay gặp:** tính phần trăm máu kiểu `int percent = hp / maxHp * 100;`. Với `hp = 45`, `maxHp = 100`, phép `45 / 100` ra `0`, nhân 100 vẫn là `0`. Thanh máu hiện 0% dù nhân vật còn gần nửa máu.

Cách sửa: nhân trước rồi chia, hoặc đổi một vế sang số thực.

```csharp
int hp = 45;
int maxHp = 100;

int wrong = hp / maxHp * 100;
int right = hp * 100 / maxHp;
double ratio = (double)hp / maxHp;

Console.WriteLine(wrong); // 0
Console.WriteLine(right); // 45
Console.WriteLine(ratio); // 0.45
```

Cách ép `(double)` được giải thích ở trang [ép kiểu](/docs/csharp/ep-kieu).

## Toán tử gán

`=` gán giá trị bên phải vào biến bên trái. Các toán tử gán kết hợp giúp viết gọn:

```csharp
int gold = 100;
gold += 50;  // gold = gold + 50
gold -= 30;  // gold = gold - 30
gold *= 2;   // gold = gold * 2
gold /= 4;   // gold = gold / 4
Console.WriteLine(gold); // 60
```

## Tăng giảm với ++ và --

`++` cộng thêm 1, `--` trừ đi 1. Rất hay dùng để đếm.

```csharp
int killCount = 0;
killCount++;
killCount++;
Console.WriteLine(killCount); // 2

int lives = 3;
lives--;
Console.WriteLine(lives); // 2
```

Đặt `++` trước hay sau biến có khác nhau khi dùng ngay trong biểu thức. `x++` trả về giá trị cũ rồi mới tăng, `++x` tăng trước rồi trả về giá trị mới.

```csharp
int level = 5;
Console.WriteLine(level++); // 5
Console.WriteLine(level);   // 6
Console.WriteLine(++level); // 7
```

Để dễ đọc, nên viết `++` trên một dòng riêng thay vì nhét vào giữa biểu thức.

## Toán tử so sánh

So sánh hai giá trị, kết quả luôn là `bool`:

```csharp
int hp = 30;
Console.WriteLine(hp == 30); // True   bằng
Console.WriteLine(hp != 0);  // True   khác
Console.WriteLine(hp > 50);  // False  lớn hơn
Console.WriteLine(hp < 50);  // True   nhỏ hơn
Console.WriteLine(hp >= 30); // True   lớn hơn hoặc bằng
Console.WriteLine(hp <= 0);  // False  nhỏ hơn hoặc bằng
```

Một dấu `=` là gán, hai dấu `==` là so sánh. Viết `if (hp = 0)` sẽ báo lỗi CS0029 vì kết quả phép gán là `int`, không phải `bool`.

## Toán tử logic

Kết hợp nhiều điều kiện:

- `&&` (và): đúng khi **cả hai** đều đúng.
- `||` (hoặc): đúng khi **ít nhất một** vế đúng.
- `!` (phủ định): đảo đúng thành sai và ngược lại.

```csharp
bool hasKey = true;
int level = 8;
bool isStunned = false;

Console.WriteLine(hasKey && level >= 10); // False, đủ chìa nhưng chưa đủ level
Console.WriteLine(hasKey || level >= 10); // True
Console.WriteLine(!isStunned);            // True, không bị choáng thì được đi
```

Toán tử logic dùng nhiều nhất trong câu lệnh [if else](/docs/csharp/if-else).

## Bài tập

Người chơi có 250 vàng, mỗi mũi tên giá 40 vàng. Tính số mũi tên mua được và số vàng thừa. Sau đó in ra `True` nếu người chơi mua được ít nhất 5 mũi tên **và** còn thừa vàng.

<details>
<summary>Xem đáp án</summary>

```csharp
int gold = 250;
int arrowPrice = 40;

int arrows = gold / arrowPrice;
int leftover = gold % arrowPrice;

Console.WriteLine(arrows);   // 6
Console.WriteLine(leftover); // 10
Console.WriteLine(arrows >= 5 && leftover > 0); // True
```

</details>
