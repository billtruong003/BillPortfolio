---
title: "Câu lệnh if else trong C#"
description: "Rẽ nhánh chương trình với if, else if, else và toán tử ba ngôi trong C#, kèm lý do vì sao thứ tự các điều kiện quyết định kết quả."
section: "Điều khiển luồng"
order: 13
tags: ["if", "else", "rẽ nhánh", "toán tử ba ngôi"]
image: /images/docs/csharp/if-else.webp
imageIdea: "Nhân vật anime đứng ở ngã ba đường trong rừng, cột biển chỉ đường có ba tấm gỗ ghi 'if (hp > 50)', 'else if (hp > 0)', 'else', mỗi hướng dẫn tới một nơi khác: đấu trường, quán trọ, nghĩa địa."
imagePrompt: "Edit this image: the character stands at a forest crossroads in front of a wooden signpost with three arrows reading 'if (hp > 50)', 'else if (hp > 0)' and 'else'. The paths lead to an arena, a cozy inn and a small graveyard. Keep the original art style, 16:9."
---

`if` cho chương trình chọn đường: điều kiện đúng thì làm việc này, sai thì làm việc khác. Nhờ nó mà game biết khi nào hiện Game Over, khi nào cho lên cấp, khi nào mở cửa. Điều kiện trong `if` luôn là một giá trị [bool](/docs/csharp/bool).

## if

```csharp
int hp = 0;

if (hp <= 0)
{
    Console.WriteLine("Game Over"); // Game Over
}
```

Điều kiện đặt trong ngoặc tròn. Đúng thì chạy khối lệnh trong ngoặc nhọn, sai thì bỏ qua cả khối.

> **Lỗi hay gặp:** đặt dấu chấm phẩy ngay sau điều kiện: `if (hp <= 0);`. Dấu `;` kết thúc câu `if` bằng một lệnh rỗng, khối `{ }` bên dưới thành khối độc lập và **luôn chạy**. C# chỉ cảnh báo CS0642, không báo lỗi, nên rất dễ bỏ sót.

Nếu khối chỉ có một lệnh, bạn được bỏ ngoặc nhọn. Tuy vậy nên giữ ngoặc. Sau này thêm lệnh thứ hai mà quên thêm ngoặc thì lệnh đó sẽ luôn chạy.

## else

`else` là đường còn lại khi điều kiện sai:

```csharp
int gold = 80;
int swordPrice = 100;

if (gold >= swordPrice)
{
    Console.WriteLine("Đã mua kiếm");
}
else
{
    Console.WriteLine($"Thiếu {swordPrice - gold} vàng"); // Thiếu 20 vàng
}
```

## else if

Khi có nhiều hơn hai trường hợp, nối thêm `else if`. C# kiểm tra từ trên xuống, gặp điều kiện đúng **đầu tiên** thì chạy khối đó và bỏ qua toàn bộ phần còn lại.

```csharp
int score = 8200;

if (score >= 10000)
{
    Console.WriteLine("Hạng S");
}
else if (score >= 8000)
{
    Console.WriteLine("Hạng A"); // Hạng A
}
else if (score >= 5000)
{
    Console.WriteLine("Hạng B");
}
else
{
    Console.WriteLine("Hạng C");
}
```

`8200` cũng lớn hơn `5000`, nhưng C# đã dừng ở `Hạng A` nên không bao giờ xét tới dòng đó.

## Thứ tự điều kiện quan trọng

Vì C# dừng ở điều kiện đúng đầu tiên, đặt sai thứ tự sẽ cho ra kết quả sai mà không có lỗi nào báo. Người mới hay viết thế này:

```csharp
int score = 12000;

if (score >= 5000)
{
    Console.WriteLine("Hạng B"); // Hạng B
}
else if (score >= 8000)
{
    Console.WriteLine("Hạng A");
}
else if (score >= 10000)
{
    Console.WriteLine("Hạng S");
}
```

`12000` đáng hạng S, nhưng nó thỏa `>= 5000` trước tiên nên nhận hạng B. Hai nhánh dưới không bao giờ chạy được với bất kỳ điểm nào từ 8000 trở lên.

Quy tắc: với các ngưỡng lồng nhau, xét điều kiện **khó nhất** trước (ngưỡng cao nhất), rồi lùi dần xuống.

Cùng chuyện này xảy ra với trạng thái nhân vật:

```csharp
int hp = 15;
int maxHp = 100;

if (hp <= 0)
{
    Console.WriteLine("Đã gục");
}
else if (hp < maxHp * 0.2)
{
    Console.WriteLine("Nguy kịch, uống bình máu ngay!"); // Nguy kịch, uống bình máu ngay!
}
else
{
    Console.WriteLine("Ổn");
}
```

Kiểm tra `hp <= 0` phải đứng đầu. Nếu đặt `hp < 20` lên trước, nhân vật đã chết cũng bị báo là "nguy kịch".

## Toán tử ba ngôi

Khi chỉ cần chọn một trong hai **giá trị**, viết `if else` năm dòng là hơi dài. Toán tử ba ngôi `điều kiện ? giá trị nếu đúng : giá trị nếu sai` làm việc đó trên một dòng:

```csharp
int hp = 35;
string status = hp > 0 ? "Còn sống" : "Đã gục";
Console.WriteLine(status); // Còn sống

bool isCrit = true;
int damage = isCrit ? 24 : 12;
Console.WriteLine(damage); // 24
```

Chỉ dùng ba ngôi khi cả hai nhánh đều là một giá trị ngắn. Lồng nhiều ba ngôi vào nhau thì rất khó đọc, lúc đó quay về `if else if`.

Có nhiều nhánh so sánh cùng một biến với các giá trị cố định thì xem [switch](/docs/csharp/switch).

## Bài tập

Viết code xếp loại rơi đồ theo con số `roll` từ 1 tới 100: từ 96 trở lên là "Huyền thoại", từ 80 là "Hiếm", từ 50 là "Thường", còn lại là "Rác". Thử với `roll = 83`.

<details>
<summary>Xem đáp án</summary>

```csharp
int roll = 83;

if (roll >= 96)
{
    Console.WriteLine("Huyền thoại");
}
else if (roll >= 80)
{
    Console.WriteLine("Hiếm"); // Hiếm
}
else if (roll >= 50)
{
    Console.WriteLine("Thường");
}
else
{
    Console.WriteLine("Rác");
}
```

</details>
