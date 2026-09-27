---
title: "Break và continue trong C#"
description: "Dùng break để thoát vòng lặp sớm và continue để bỏ qua một lượt trong C#, kèm ví dụ tìm vật phẩm, bỏ qua quái đã chết và lỗi hay gặp."
section: "Điều khiển luồng"
order: 17
tags: ["break", "continue", "vòng lặp"]
image: /images/docs/csharp/break-continue.webp
imageIdea: "Nhân vật anime đi dọc hành lang hầm ngục có nhiều rương báu, nhảy qua một rương rỗng có biển 'continue', và dừng lại vui mừng ở rương có chìa khoá với biển 'break'."
imagePrompt: "Edit this image: the character walks down a dungeon corridor lined with treasure chests. The character hops over an empty chest with a small sign reading 'continue', and stops happily at an open chest containing a golden key, with a sign reading 'break'. Keep the original art style, 16:9."
---

Bình thường một vòng lặp chạy hết mọi lượt rồi mới dừng. `break` và `continue` cho bạn can thiệp giữa chừng: `break` thoát hẳn khỏi vòng lặp, `continue` bỏ qua phần còn lại của lượt hiện tại và sang lượt tiếp theo.

## break: thoát vòng lặp ngay

Ví dụ: lục 10 rương báu, tìm thấy chìa khoá thì dừng. Không có `break`, vòng lặp vẫn mở nốt mấy rương còn lại dù đã có thứ cần tìm.

```csharp
int keyChest = 4;

for (int chest = 1; chest <= 10; chest++)
{
    Console.WriteLine($"Mở rương {chest}");
    if (chest == keyChest)
    {
        Console.WriteLine("Tìm thấy chìa khoá!");
        break;
    }
}
Console.WriteLine("Rời hầm ngục");
// Mở rương 1
// Mở rương 2
// Mở rương 3
// Mở rương 4
// Tìm thấy chìa khoá!
// Rời hầm ngục
```

Khi gặp `break`, C# nhảy thẳng tới lệnh đầu tiên **sau** vòng lặp. Các rương 5 tới 10 không được mở.

`break` hay đi với `while (true)` để làm vòng lặp chỉ thoát từ bên trong:

```csharp
int hp = 40;
int turn = 0;

while (true)
{
    turn++;
    hp -= 15;
    if (hp <= 0)
    {
        break;
    }
    Console.WriteLine($"Lượt {turn}: còn {hp} máu");
}
Console.WriteLine($"Gục ở lượt {turn}");
// Lượt 1: còn 25 máu
// Lượt 2: còn 10 máu
// Gục ở lượt 3
```

Xem thêm về vòng lặp này ở trang [vòng lặp while](/docs/csharp/vong-lap-while).

## continue: bỏ qua lượt này

`continue` không thoát vòng lặp. Nó bỏ qua các lệnh còn lại trong lượt hiện tại, rồi quay lên đầu vòng cho lượt kế tiếp.

Ví dụ: bắn vào 5 con quái, bỏ qua những con đã chết (máu bằng 0).

```csharp
int[] enemyHp = { 30, 0, 12, 0, 45 };

for (int i = 0; i < enemyHp.Length; i++)
{
    if (enemyHp[i] <= 0)
    {
        continue;
    }
    Console.WriteLine($"Bắn quái {i}, máu {enemyHp[i]}");
}
// Bắn quái 0, máu 30
// Bắn quái 2, máu 12
// Bắn quái 4, máu 45
```

`int[]` là một mảng, tức danh sách các số nằm liền nhau. Ở đây chỉ cần biết `enemyHp[i]` là máu của con quái thứ `i`.

Không có `continue`, bạn phải bọc toàn bộ phần còn lại trong một `if` lớn. Khi phần đó dài, `continue` giữ code phẳng và dễ đọc hơn: loại trường hợp không cần xử lý ngay đầu, phần chính nằm bên dưới.

## Với vòng lặp while, cẩn thận continue

Trong `for`, bước nhảy `i++` vẫn chạy sau `continue`. Trong `while`, bạn tự tăng biến đếm, và `continue` có thể nhảy qua mất dòng đó.

```csharp
int wave = 0;
while (wave < 5)
{
    if (wave == 2)
    {
        continue; // wave mãi là 2
    }
    Console.WriteLine($"Wave {wave}");
    wave++;
}
```

> **Lỗi hay gặp:** đặt lệnh tăng biến đếm **sau** `continue` trong `while`. Khi `wave == 2`, `continue` quay về đầu vòng mà `wave` chưa kịp tăng, nên điều kiện lặp lại y nguyên. Chương trình rơi vào vòng lặp vô hạn, không báo lỗi. Tăng biến đếm trước khi `continue`, hoặc chuyển sang `for`.

Cách sửa:

```csharp
int wave = 0;
while (wave < 5)
{
    wave++;
    if (wave == 3)
    {
        continue;
    }
    Console.WriteLine($"Wave {wave}");
}
// Wave 1
// Wave 2
// Wave 4
// Wave 5
```

## break chỉ thoát một tầng

Nếu có hai vòng lặp lồng nhau, `break` ở vòng trong chỉ thoát vòng trong. Vòng ngoài vẫn chạy tiếp.

```csharp
for (int floor = 1; floor <= 2; floor++)
{
    for (int room = 1; room <= 3; room++)
    {
        if (room == 2)
        {
            break;
        }
        Console.WriteLine($"Tầng {floor}, phòng {room}");
    }
}
// Tầng 1, phòng 1
// Tầng 2, phòng 1
```

Ngoài vòng lặp, `break` còn dùng để kết thúc mỗi `case` trong [switch](/docs/csharp/switch). `continue` thì chỉ dùng được trong vòng lặp. Viết nó ở ngoài sẽ báo lỗi CS0139.

## Bài tập

Cho điểm của các lượt chơi `{ 120, -1, 300, 80, -1, 950, 40 }`. Giá trị `-1` là lượt bị lỗi, hãy bỏ qua. Cộng dồn điểm các lượt hợp lệ, nhưng dừng ngay khi tổng đạt từ 1000 trở lên. In tổng cuối cùng.

<details>
<summary>Xem đáp án</summary>

```csharp
int[] scores = { 120, -1, 300, 80, -1, 950, 40 };
int total = 0;

for (int i = 0; i < scores.Length; i++)
{
    if (scores[i] == -1)
    {
        continue;
    }

    total += scores[i];

    if (total >= 1000)
    {
        break;
    }
}

Console.WriteLine(total); // 1450
```

Cộng 120, 300, 80 được 500. Cộng thêm 950 thành 1450, vượt 1000 nên dừng, lượt 40 không được cộng.

</details>
