---
title: "Kiểu dữ liệu trong C#"
description: "Các kiểu dữ liệu cơ bản trong C#: int, long, float, double, decimal, bool, char, string, hậu tố f và m, kèm bảng tóm tắt dễ tra."
section: "Cơ bản"
order: 6
tags: ["kiểu dữ liệu", "int", "float", "string"]
image: /images/docs/csharp/kieu-du-lieu.webp
imageIdea: "Nhân vật anime đang phân loại vật phẩm vào các ngăn tủ đồ khác cỡ: ngăn nhỏ ghi 'bool', ngăn vừa ghi 'int', ngăn dài ghi 'string', tay cầm một đồng xu ghi 'decimal'."
imagePrompt: "Edit this image: the character is sorting game items into a wooden cabinet with drawers of different sizes, labeled 'bool', 'char', 'int', 'long', 'float', 'double' and 'string'. The character holds a shiny coin engraved with 'decimal'. Keep the original art style, 16:9."
---

Mỗi biến trong C# có một kiểu dữ liệu, nói cho máy biết biến đó giữ loại giá trị gì: số nguyên, số thực, đúng sai hay chữ. Kiểu quyết định biến chiếm bao nhiêu bộ nhớ và bạn được làm gì với nó. Nếu chưa biết biến là gì, đọc trang [biến](/docs/csharp/bien) trước.

## Số nguyên: int và long

`int` giữ số nguyên, không có phần thập phân. Đây là kiểu bạn dùng nhiều nhất: máu, vàng, số quái, level.

```csharp
int hp = 100;
int enemyCount = 12;
Console.WriteLine(hp + enemyCount); // 112
```

`int` chứa được tới khoảng 2,1 tỷ. Điểm số của game idle hay tổng sát thương cả mùa giải có thể vượt con số đó. Khi ấy dùng `long`, thêm hậu tố `L` cho số lớn:

```csharp
long totalDamage = 5_000_000_000L;
Console.WriteLine(totalDamage); // 5000000000
```

Dấu `_` trong số chỉ để dễ đọc, C# bỏ qua nó.

> **Lỗi hay gặp:** viết `int totalDamage = 5000000000;`. Số này vượt giới hạn `int`, C# báo lỗi CS0266: không đổi ngầm từ `long` sang `int` được. Đổi kiểu biến thành `long`.

## Số thực: float, double, decimal

Số có phần thập phân có ba kiểu. Người mới hay viết `float speed = 5.5;` rồi gặp lỗi. Lý do: C# coi mọi số thập phân viết trơn như `5.5` là `double`. Muốn nó là `float`, thêm hậu tố `f`.

```csharp
float moveSpeed = 5.5f;
double gravity = 9.81;
decimal price = 19.99m;

Console.WriteLine(moveSpeed); // 5.5
Console.WriteLine(gravity);   // 9.81
Console.WriteLine(price);     // 19.99
```

> **Lưu ý:** máy đặt định dạng Việt Nam dùng dấu phẩy làm dấu thập phân, nên sẽ in `5,5` thay vì `5.5`. Kết quả trong bài theo định dạng quốc tế.

> **Lỗi hay gặp:** `float moveSpeed = 5.5;` báo lỗi CS0664: số kiểu `double` không gán thẳng vào `float` được, hãy dùng hậu tố `F`. Tương tự, `decimal price = 19.99;` cũng lỗi CS0664, cần hậu tố `m`.

Chọn kiểu nào:

- `float`: Unity dùng `float` cho vị trí, tốc độ, thời gian. Làm game thì gặp nó suốt.
- `double`: chính xác hơn `float`, là kiểu mặc định của số thực trong C# thuần.
- `decimal`: dùng cho tiền thật, như giá gói nạp trong shop. Nó tính số thập phân chính xác, không bị sai lặt vặt kiểu `0.1 + 0.2`.

```csharp
double a = 0.1 + 0.2;
decimal b = 0.1m + 0.2m;
Console.WriteLine(a == 0.3); // False
Console.WriteLine(b == 0.3m); // True
```

`double` lưu số theo hệ nhị phân nên `0.1 + 0.2` ra `0.30000000000000004`, không bằng đúng `0.3`. `decimal` thì không bị vậy.

## Đúng sai: bool

`bool` chỉ có hai giá trị: `true` hoặc `false`. Dùng cho mọi câu hỏi có hoặc không.

```csharp
bool isAlive = true;
bool hasKey = false;
Console.WriteLine(isAlive); // True
```

C# in ra `True` với chữ T hoa, nhưng trong code bạn phải viết `true` thường. Xem thêm ở trang [bool](/docs/csharp/bool).

## Một ký tự: char

`char` giữ đúng một ký tự, viết trong dấu nháy **đơn**.

```csharp
char grade = 'S';
char moveKey = 'W';
Console.WriteLine(grade); // S
```

## Chuỗi chữ: string

`string` giữ một đoạn chữ, dài bao nhiêu cũng được, viết trong dấu nháy **kép**.

```csharp
string heroName = "Aki";
string weapon = "Kiếm gỗ";
Console.WriteLine(heroName + " cầm " + weapon); // Aki cầm Kiếm gỗ
```

`'A'` là `char`, `"A"` là `string`. Viết `char c = "A";` sẽ báo lỗi CS0029: không đổi `string` sang `char` được. Chi tiết về chuỗi ở trang [chuỗi](/docs/csharp/chuoi).

## Bảng tóm tắt

| Kiểu | Giữ gì | Ví dụ | Hậu tố |
| --- | --- | --- | --- |
| `int` | Số nguyên, tới khoảng 2,1 tỷ | `int hp = 100;` | |
| `long` | Số nguyên rất lớn | `long score = 5_000_000_000L;` | `L` |
| `float` | Số thực, độ chính xác khoảng 7 chữ số | `float speed = 5.5f;` | `f` |
| `double` | Số thực, khoảng 15 chữ số | `double g = 9.81;` | không cần |
| `decimal` | Số thập phân chính xác, cho tiền | `decimal price = 19.99m;` | `m` |
| `bool` | `true` hoặc `false` | `bool isAlive = true;` | |
| `char` | Một ký tự, nháy đơn | `char grade = 'S';` | |
| `string` | Chuỗi chữ, nháy kép | `string name = "Aki";` | |

Muốn đổi giá trị từ kiểu này sang kiểu khác, xem trang [ép kiểu](/docs/csharp/ep-kieu).

## Bài tập

Khai báo biến cho một món đồ trong shop: tên "Bình máu lớn", giá 4.99 (tiền thật), hồi 50 máu, xếp hạng 'A', đang còn hàng. In tên và giá ra màn hình.

<details>
<summary>Xem đáp án</summary>

```csharp
string itemName = "Bình máu lớn";
decimal price = 4.99m;
int healAmount = 50;
char rank = 'A';
bool inStock = true;

Console.WriteLine(itemName + ": " + price); // Bình máu lớn: 4.99
```

</details>
