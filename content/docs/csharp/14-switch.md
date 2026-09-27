---
title: "Câu lệnh switch trong C#"
description: "Dùng switch statement và switch expression trong C# để chọn nhánh theo giá trị, gộp nhiều case và hiểu vì sao C# không cho rơi xuống case sau."
section: "Điều khiển luồng"
order: 14
tags: ["switch", "case", "switch expression"]
image: /images/docs/csharp/switch.webp
imageIdea: "Nhân vật anime đứng trước máy bán hàng tự động trong game, mỗi nút bấm ghi 'case 1: Kiếm', 'case 2: Khiên', 'case 3: Bình máu', 'default: ???', nhân vật đang bấm nút số 2."
imagePrompt: "Edit this image: the character stands in front of a fantasy vending machine with labeled buttons 'case 1: Sword', 'case 2: Shield', 'case 3: Potion' and 'default: ???'. The character is pressing button 2 and a shield drops into the tray. Keep the original art style, 16:9."
---

`switch` chọn một nhánh dựa trên **giá trị** của một biến. Khi bạn thấy mình viết một loạt `if (choice == 1) ... else if (choice == 2) ...` so sánh cùng một biến, `switch` thường gọn và dễ đọc hơn. Hay gặp ở menu, lựa chọn nhân vật, loại vật phẩm.

## Switch statement

```csharp
int choice = 2;

switch (choice)
{
    case 1:
        Console.WriteLine("Bắt đầu game");
        break;
    case 2:
        Console.WriteLine("Mở cài đặt"); // Mở cài đặt
        break;
    case 3:
        Console.WriteLine("Thoát");
        break;
    default:
        Console.WriteLine("Lựa chọn không hợp lệ");
        break;
}
```

- `switch (choice)` là giá trị cần xét.
- Mỗi `case` là một giá trị cụ thể. Khớp thì chạy các lệnh bên dưới nó.
- `break` kết thúc `switch`, nhảy ra ngoài.
- `default` chạy khi không `case` nào khớp, giống `else` cuối cùng.

`switch` dùng được với `int`, `string`, `char`, `bool` và enum.

```csharp
string command = "attack";

switch (command)
{
    case "attack":
        Console.WriteLine("Vung kiếm!"); // Vung kiếm!
        break;
    case "defend":
        Console.WriteLine("Giơ khiên");
        break;
    default:
        Console.WriteLine("Không hiểu lệnh");
        break;
}
```

So sánh chuỗi trong `case` có phân biệt hoa thường: `"Attack"` sẽ rơi vào `default`. Nếu lệnh do người dùng gõ, gọi `.ToLower()` trước khi đưa vào `switch`.

## Không được rơi xuống case sau

Người từng học C, C++ hay JavaScript quen kiểu bỏ `break` để chạy tiếp sang `case` bên dưới. C# cấm chuyện này:

```csharp
int choice = 1;

switch (choice)
{
    case 1:
        Console.WriteLine("Bắt đầu game");
        // thiếu break
    case 2:
        Console.WriteLine("Mở cài đặt");
        break;
}
```

> **Lỗi hay gặp:** quên `break` ở cuối một `case` có lệnh. C# báo lỗi CS0163: `Control cannot fall through from one case label ('case 1:') to another`. Thêm `break;` (hoặc `return;`) vào cuối mỗi `case`, kể cả `default`.

C# làm vậy vì quên `break` là lỗi rất phổ biến trong C, và nó chạy sai mà không báo gì. C# chặn ngay lúc biên dịch.

## Gộp nhiều case

Nếu nhiều giá trị cùng làm một việc, xếp các `case` liền nhau, không đặt lệnh nào giữa chúng. Trường hợp này được phép vì các `case` trên rỗng.

```csharp
char key = 'W';

switch (key)
{
    case 'w':
    case 'W':
        Console.WriteLine("Đi lên"); // Đi lên
        break;
    case 's':
    case 'S':
        Console.WriteLine("Đi xuống");
        break;
    default:
        Console.WriteLine("Đứng yên");
        break;
}
```

## Switch expression

Khi mục đích chỉ là **chọn ra một giá trị** theo từng trường hợp, C# có cách viết ngắn hơn gọi là switch expression:

```csharp
int rarity = 3;

string rarityName = rarity switch
{
    1 => "Thường",
    2 => "Hiếm",
    3 => "Sử thi",
    4 => "Huyền thoại",
    _ => "Không rõ"
};

Console.WriteLine(rarityName); // Sử thi
```

Khác với switch statement:

- Biến đứng **trước** từ khoá `switch`.
- Mỗi nhánh viết `giá trị => kết quả`, ngăn cách bằng dấu phẩy.
- `_` đóng vai `default`.
- Không cần `break`, và cả khối kết thúc bằng `;`.

Switch expression còn so sánh được theo khoảng bằng `<`, `>=`:

```csharp
int hp = 18;

string status = hp switch
{
    <= 0 => "Đã gục",
    < 30 => "Nguy kịch",
    < 70 => "Bị thương",
    _ => "Khỏe"
};

Console.WriteLine(status); // Nguy kịch
```

Giống [if else](/docs/csharp/if-else), các nhánh được xét từ trên xuống, nhánh khớp đầu tiên thắng.

> **Lỗi hay gặp:** quên nhánh `_` trong switch expression. C# cảnh báo CS8509 là chưa phủ hết các trường hợp. Nếu lúc chạy gặp giá trị không khớp nhánh nào, chương trình dừng với `SwitchExpressionException`.

## Bài tập

Dùng switch expression đổi số sao đánh giá màn chơi (`stars` từ 0 tới 3) thành số vàng thưởng: 3 sao được 300, 2 sao được 150, 1 sao được 50, còn lại 0. Thử với `stars = 2`.

<details>
<summary>Xem đáp án</summary>

```csharp
int stars = 2;

int reward = stars switch
{
    3 => 300,
    2 => 150,
    1 => 50,
    _ => 0
};

Console.WriteLine($"Thưởng {reward} vàng"); // Thưởng 150 vàng
```

</details>
