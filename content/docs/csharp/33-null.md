---
title: "Null trong C#: toán tử ?., ?? và kiểu int?"
description: "Null trong C# nghĩa là chưa trỏ tới object nào. Hiểu NullReferenceException, dùng toán tử ?. và ?? để xử lý gọn, và kiểu nullable như int?."
section: "Xử lý lỗi"
order: 33
tags: ["null", "NullReferenceException", "nullable", "?.", "??"]
image: /images/docs/csharp/null.webp
imageIdea: "Nhân vật anime tự tin vung tay định chém quái, nhưng tay trống trơn vì ô vũ khí trên thanh trang bị đang để trống, trên đầu hiện bong bóng chữ 'weapon == null'."
imagePrompt: "Edit this image: the character dramatically swings at a monster but their hand is empty, no weapon. A game-style equipment bar nearby shows an empty weapon slot, and a speech bubble above the character reads 'weapon == null'. Keep the original art style, 16:9."
---

`null` nghĩa là "không có gì": biến tồn tại nhưng chưa trỏ tới object nào. Nhân vật chưa trang bị vũ khí thì biến `weapon` là `null`. Dùng một biến `null` như thể nó có object bên trong là lỗi phổ biến nhất trong C#, và cũng là lỗi bạn sẽ gặp nhiều nhất trong Unity.

## NullReferenceException

Người chơi chưa nhặt vũ khí mà code vẫn gọi `weapon.Name`:

```csharp
Weapon? weapon = null;
Console.WriteLine(weapon.Name);
// Unhandled exception. System.NullReferenceException:
// Object reference not set to an instance of an object.

class Weapon
{
    public string Name { get; set; } = "Kiếm gỗ";
}
```

Dấu `?` trong `Weapon?` nghĩa là "biến này có thể là null". Project .NET 8 bật sẵn tính năng nullable, nên dòng `weapon.Name` ở trên sẽ có cảnh báo CS8602 "Dereference of a possibly null reference" ngay khi biên dịch.

> **Lỗi hay gặp:** bỏ qua cảnh báo CS8602 vì "vẫn chạy được". Cảnh báo này đang chỉ đúng dòng sẽ ném `NullReferenceException` lúc chơi. Xử lý nó thay vì tắt nó đi.

## Kiểm tra null trước khi dùng

Cách cơ bản nhất là [if](/docs/csharp/if-else):

```csharp
Weapon? weapon = null;

if (weapon != null)
{
    Console.WriteLine($"Chém bằng {weapon.Name}");
}
else
{
    Console.WriteLine("Đấm tay không");
}
// Đấm tay không

class Weapon
{
    public string Name { get; set; } = "Kiếm gỗ";
}
```

Viết `weapon is not null` cũng cho kết quả giống vậy.

## Toán tử `?.`: gọi nếu không null

Kiểm tra `if` ở mọi chỗ khá dài. `?.` làm việc đó trong một ký hiệu: nếu bên trái là `null` thì cả biểu thức trả về `null` thay vì ném lỗi.

```csharp
Weapon? weapon = null;

string? name = weapon?.Name;
Console.WriteLine(name == null); // True

weapon?.Swing(); // không làm gì, không lỗi

weapon = new Weapon();
weapon?.Swing(); // Vung Kiếm gỗ

class Weapon
{
    public string Name { get; set; } = "Kiếm gỗ";

    public void Swing()
    {
        Console.WriteLine($"Vung {Name}");
    }
}
```

## Toán tử `??`: giá trị dự phòng

`a ?? b` nghĩa là "lấy `a`, nếu `a` là null thì lấy `b`". Nó hay đi cùng `?.`.

```csharp
Weapon? weapon = null;
string? savedName = null;

Console.WriteLine(weapon?.Name ?? "Tay không"); // Tay không

string playerName = savedName ?? "Người chơi mới";
Console.WriteLine(playerName); // Người chơi mới

class Weapon
{
    public string Name { get; set; } = "Kiếm gỗ";
}
```

Còn có `??=`: chỉ gán khi biến đang là null. Hợp với việc tạo thứ gì đó ở lần dùng đầu tiên.

```csharp
List<string>? questLog = null;

questLog ??= new List<string>();
questLog.Add("Hạ 10 con slime");
Console.WriteLine(questLog.Count); // 1
```

## Kiểu số cũng có thể null: `int?`

`int`, `float`, `bool` luôn có giá trị, không nhận `null` được.

```csharp
int bestTime = null; // lỗi CS0037
```

> **Lỗi hay gặp:** CS0037 "Cannot convert null to 'int' because it is a non-nullable value type". Người mới hay gán `0` hoặc `-1` để giả làm "chưa có", rồi quên và đem `-1` đi so sánh.

Thêm `?` sau kiểu để có kiểu nullable. Ví dụ màn chơi chưa hoàn thành lần nào thì chưa có kỷ lục, khác hẳn kỷ lục bằng 0 giây.

```csharp
int? bestTime = null;

Console.WriteLine(bestTime.HasValue);    // False
Console.WriteLine(bestTime ?? 0);        // 0

bestTime = 95;
if (bestTime.HasValue)
{
    Console.WriteLine($"Kỷ lục: {bestTime.Value} giây"); // Kỷ lục: 95 giây
}

int newTime = 88;
if (bestTime == null || newTime < bestTime)
{
    bestTime = newTime;
}
Console.WriteLine(bestTime); // 88
```

`HasValue` cho biết có giá trị chưa, `Value` lấy giá trị ra. Gọi `Value` khi đang null sẽ ném `InvalidOperationException`, nên kiểm tra `HasValue` trước hoặc dùng `??`.

## Trong Unity

Phần lớn `NullReferenceException` trong Unity đến từ field chưa được kéo thả trong Inspector, hoặc `GetComponent` không tìm thấy component. Có một điểm khác: object Unity đã bị `Destroy` vẫn so sánh `== null` ra `true`, nhưng `?.` và `??` không biết chuyện đó. Với các kiểu kế thừa `UnityEngine.Object` như `GameObject`, `Transform`, hãy kiểm tra bằng `if (target != null)` thay vì dùng `?.`.

## Bài tập

Viết hàm `string DescribeTarget(string? targetName, int? targetHp)` trả về "{tên}: {máu} máu". Nếu tên là null thì dùng "Không có mục tiêu" và bỏ qua máu; nếu máu là null thì ghi "?" thay cho số máu. Gọi với `("Slime", 30)`, `("Boss", null)` và `(null, null)`.

<details>
<summary>Xem đáp án</summary>

```csharp
Console.WriteLine(DescribeTarget("Slime", 30));  // Slime: 30 máu
Console.WriteLine(DescribeTarget("Boss", null)); // Boss: ? máu
Console.WriteLine(DescribeTarget(null, null));   // Không có mục tiêu

string DescribeTarget(string? targetName, int? targetHp)
{
    if (targetName == null)
    {
        return "Không có mục tiêu";
    }
    string hpText = targetHp?.ToString() ?? "?";
    return $"{targetName}: {hpText} máu";
}
```

</details>
