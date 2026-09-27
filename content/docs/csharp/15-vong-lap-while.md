---
title: "Vòng lặp while trong C#"
description: "Vòng lặp while và do while trong C#: lặp khi điều kiện còn đúng, khác nhau ở lần chạy đầu tiên, và cách tránh vòng lặp vô hạn làm treo chương trình."
section: "Điều khiển luồng"
order: 15
tags: ["vòng lặp", "while", "do while"]
image: /images/docs/csharp/vong-lap-while.webp
imageIdea: "Nhân vật anime chạy trên chiếc bánh xe cho chuột hamster khổng lồ, trên bánh xe ghi 'while (hp > 0)', bên cạnh thanh máu đang tụt dần."
imagePrompt: "Edit this image: the character is running inside a giant hamster wheel with the text 'while (hp > 0)' painted on its rim. A floating game health bar next to the wheel is slowly draining. Keep the original art style, 16:9."
---

Vòng lặp `while` lặp đi lặp lại một khối lệnh **chừng nào** điều kiện còn đúng. Bạn dùng nó khi không biết trước phải lặp bao nhiêu lần: đánh quái tới khi quái gục, hỏi lại tới khi người chơi nhập đúng, chạy game tới khi bấm thoát.

## while

```csharp
int enemyHp = 30;
int attack = 12;

while (enemyHp > 0)
{
    enemyHp -= attack;
    Console.WriteLine($"Chém! Máu quái còn {enemyHp}");
}
Console.WriteLine("Quái đã gục");
// Chém! Máu quái còn 18
// Chém! Máu quái còn 6
// Chém! Máu quái còn -6
// Quái đã gục
```

Mỗi vòng, C# làm hai bước:

1. Kiểm tra điều kiện `enemyHp > 0`.
2. Đúng thì chạy khối lệnh, rồi quay lại bước 1. Sai thì thoát vòng lặp, chạy tiếp lệnh phía sau.

Nếu điều kiện sai ngay từ đầu, khối lệnh không chạy lần nào:

```csharp
int enemyHp = 0;
while (enemyHp > 0)
{
    Console.WriteLine("Dòng này không bao giờ in");
}
Console.WriteLine("Xong"); // Xong
```

Máu âm `-6` ở ví dụ đầu trông hơi xấu. Kẹp nó về 0 bằng `Math.Max`, xem trang [Math](/docs/csharp/math).

## Vòng lặp vô hạn

Người mới hay quên thay đổi biến trong điều kiện:

```csharp
int enemyHp = 30;
while (enemyHp > 0)
{
    Console.WriteLine("Chém!");
    // quên trừ máu
}
```

`enemyHp` mãi là 30, điều kiện mãi đúng, chương trình in "Chém!" không ngừng.

> **Lỗi hay gặp:** vòng lặp vô hạn không có mã lỗi nào cả. Trình biên dịch không phát hiện được, chương trình cứ chạy mãi hoặc treo cứng. Trong terminal, bấm `Ctrl+C` để dừng. Trong Unity, vòng lặp vô hạn làm treo cả Editor và bạn phải tắt nó bằng Task Manager, nên hãy luôn tự hỏi: "biến nào trong điều kiện đổi giá trị bên trong vòng lặp?"

## Cố ý lặp vô hạn

Có lúc bạn muốn lặp mãi rồi tự thoát ở giữa, ví dụ vòng lặp chính của một game dạng chữ. Viết `while (true)` và dùng `break` để thoát:

```csharp
while (true)
{
    Console.Write("Lệnh (attack/quit): ");
    string? command = Console.ReadLine();

    if (command == "quit")
    {
        break;
    }

    Console.WriteLine("Bạn tấn công!");
}
Console.WriteLine("Tạm biệt");
// Lệnh (attack/quit): attack
// Bạn tấn công!
// Lệnh (attack/quit): quit
// Tạm biệt
```

`break` thoát ngay khỏi vòng lặp. Chi tiết ở trang [break và continue](/docs/csharp/break-continue).

## do while

`do while` giống `while`, chỉ khác là kiểm tra điều kiện ở **cuối** vòng. Vì vậy khối lệnh luôn chạy ít nhất một lần.

```csharp
int roll;
int tries = 0;

do
{
    roll = Random.Shared.Next(1, 7);
    tries++;
    Console.WriteLine($"Tung được {roll}");
} while (roll != 6);

Console.WriteLine($"Ra 6 sau {tries} lần");
// ví dụ:
// Tung được 3
// Tung được 1
// Tung được 6
// Ra 6 sau 3 lần
```

Ở đây phải tung xúc xắc trước thì mới có số để kiểm tra, nên `do while` hợp hơn `while`. Để ý dấu `;` sau `while (roll != 6)`: thiếu nó là lỗi CS1002.

So sánh nhanh:

| | `while` | `do while` |
| --- | --- | --- |
| Kiểm tra điều kiện | Trước khi chạy khối | Sau khi chạy khối |
| Số lần chạy ít nhất | 0 | 1 |
| Hay dùng khi | Có thể không cần lặp lần nào | Phải làm một lần rồi mới biết có lặp tiếp không |

## Khi nào dùng while, khi nào dùng for

Biết trước số lần lặp (lặp 10 lượt, duyệt 5 món đồ) thì dùng [vòng lặp for](/docs/csharp/vong-lap-for). Chỉ biết điều kiện dừng (tới khi hết máu, tới khi nhập đúng) thì dùng `while`.

## Bài tập

Nhân vật có 50 vàng, mỗi lượt đào mỏ được thêm 15 vàng. Dùng `while` đếm xem cần bao nhiêu lượt để có ít nhất 200 vàng, in số lượt và số vàng cuối cùng.

<details>
<summary>Xem đáp án</summary>

```csharp
int gold = 50;
int turns = 0;

while (gold < 200)
{
    gold += 15;
    turns++;
}

Console.WriteLine($"Sau {turns} lượt có {gold} vàng"); // Sau 10 lượt có 200 vàng
```

</details>
