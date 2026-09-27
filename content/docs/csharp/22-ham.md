---
title: "Hàm (method) trong C#"
description: "Hàm trong C# là gì, cách khai báo và gọi hàm, trả kết quả bằng return, hàm void, và vì sao hàm viết ở top-level statements là local function."
section: "Hàm"
order: 22
tags: ["hàm", "method", "return", "void"]
image: /images/docs/csharp/ham.webp
imageIdea: "Nhân vật anime bấm một nút đỏ to ghi 'CastFireball()' trên bảng điều khiển, cả đống cầu lửa bay ra đúng một kiểu mỗi lần bấm."
imagePrompt: "Edit this image: the character presses a big red arcade button labeled 'CastFireball()' on a control panel. Each press launches an identical small fireball out of a cannon. Keep the original art style, 16:9."
---

Hàm (trong C# gọi là method) là một đoạn code có tên, viết một lần và gọi lại bao nhiêu lần tùy ý. Khi bạn thấy mình copy cùng mấy dòng code sang nhiều chỗ, đó là lúc gom chúng vào một hàm.

## Vì sao cần hàm

Giả sử mỗi lần người chơi lên cấp, game in ba dòng thông báo. Có 4 chỗ trong game gây lên cấp, và bạn copy ba dòng đó sang cả 4 chỗ. Sau này muốn đổi câu chữ, bạn phải sửa 4 lần và rất dễ sót một chỗ. Hàm gom ba dòng về một nơi: sửa một chỗ, mọi nơi gọi hàm đều đổi theo.

## Khai báo và gọi hàm

Một hàm gồm kiểu trả về, tên, cặp ngoặc tròn và thân hàm trong ngoặc nhọn.

```csharp
ShowLevelUp();
ShowLevelUp();

void ShowLevelUp()
{
    Console.WriteLine("*** LÊN CẤP ***");
    Console.WriteLine("Máu tối đa +10");
    Console.WriteLine("Sức tấn công +2");
}
// *** LÊN CẤP ***
// Máu tối đa +10
// Sức tấn công +2
// *** LÊN CẤP ***
// Máu tối đa +10
// Sức tấn công +2
```

- `void`: hàm này làm việc xong là thôi, không trả về giá trị nào.
- `ShowLevelUp`: tên hàm, quy ước viết `PascalCase`, thường là động từ.
- `ShowLevelUp();`: gọi hàm. Thiếu cặp ngoặc `()` thì hàm không chạy.

## Trả kết quả bằng `return`

Nhiều hàm cần tính ra một giá trị rồi đưa lại cho chỗ gọi. Khi đó thay `void` bằng kiểu của kết quả, và dùng `return` để trả nó về.

```csharp
int bonus = GetDailyBonus();
Console.WriteLine($"Nhận {bonus} vàng"); // Nhận 150 vàng

int GetDailyBonus()
{
    int baseGold = 100;
    int streakBonus = 50;
    return baseGold + streakBonus;
}
```

`return` làm hai việc: đưa giá trị ra ngoài và kết thúc hàm ngay lập tức. Code nằm sau `return` trong cùng nhánh sẽ không chạy.

Hàm thường nhận thêm dữ liệu đầu vào qua tham số. Trang [tham số](/docs/csharp/tham-so) nói kỹ, ở đây chỉ xem một ví dụ:

```csharp
Console.WriteLine(IsLowHp(15)); // True
Console.WriteLine(IsLowHp(80)); // False

bool IsLowHp(int hp)
{
    return hp < 20;
}
```

## Mọi nhánh đều phải return

> **Lỗi hay gặp:** hàm có kiểu trả về nhưng có nhánh không gặp `return`. Trình biên dịch báo CS0161 "not all code paths return a value".

```csharp
string GetRank(int score)
{
    if (score >= 1000)
    {
        return "Vàng";
    }
    else if (score >= 500)
    {
        return "Bạc";
    }
    // lỗi CS0161: điểm dưới 500 thì trả về gì?
}
```

Sửa bằng cách thêm một `return` cuối cùng cho trường hợp còn lại:

```csharp
Console.WriteLine(GetRank(620)); // Bạc
Console.WriteLine(GetRank(90));  // Đồng

string GetRank(int score)
{
    if (score >= 1000)
    {
        return "Vàng";
    }
    else if (score >= 500)
    {
        return "Bạc";
    }
    return "Đồng";
}
```

Hàm `void` cũng dùng được `return;` (không kèm giá trị) để thoát sớm, ví dụ khi nhân vật đã chết thì không xử lý tiếp.

## Ghi chú: hàm trong top-level statements là local function

Các ví dụ trên viết theo kiểu top-level statements: code nằm thẳng trong file `Program.cs`, không có `class Program`. Khi đó mỗi hàm bạn khai báo thật ra là một **local function** (hàm cục bộ), nằm bên trong hàm `Main` mà C# tự tạo ngầm.

Hệ quả thực tế:

- Gọi hàm trước dòng khai báo vẫn được, như các ví dụ trên.
- Không đặt `public`, `private` hay `static` trước hàm được.
- Không viết hai hàm cùng tên khác tham số được. Trang [nạp chồng hàm](/docs/csharp/nap-chong-ham) chỉ cách xử lý.

Trong Unity, bạn viết hàm bên trong một class kế thừa `MonoBehaviour`, như `void Update()`. Đó là method của class. Cách khai báo, gọi và `return` giống hệt, chỉ khác chỗ đặt. Class được giới thiệu ở trang [class và object](/docs/csharp/class-va-object).

## Bài tập

Viết hàm `CalculateXp` không có tham số, bên trong có số quái đã hạ là 12 và mỗi con cho 25 điểm kinh nghiệm, trả về tổng XP. Viết thêm hàm `void PrintXp()` gọi `CalculateXp` và in ra "Nhận được {xp} XP". Gọi `PrintXp` một lần.

<details>
<summary>Xem đáp án</summary>

```csharp
PrintXp(); // Nhận được 300 XP

int CalculateXp()
{
    int enemiesDefeated = 12;
    int xpPerEnemy = 25;
    return enemiesDefeated * xpPerEnemy;
}

void PrintXp()
{
    int xp = CalculateXp();
    Console.WriteLine($"Nhận được {xp} XP");
}
```

</details>
