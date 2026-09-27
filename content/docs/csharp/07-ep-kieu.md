---
title: "Ép kiểu trong C#"
description: "Ép kiểu trong C#: chuyển ngầm và tường minh giữa các kiểu số, vì sao mất phần thập phân, cách dùng Convert và int.Parse để đổi chuỗi thành số."
section: "Cơ bản"
order: 7
tags: ["ép kiểu", "casting", "Convert", "int.Parse"]
image: /images/docs/csharp/ep-kieu.webp
imageIdea: "Nhân vật anime đứng bên lò rèn, đổ một thỏi kim loại ghi '9.7' vào khuôn hình chữ nhật ghi '(int)', thỏi ra khỏi khuôn chỉ còn '9', mảnh vụn '.7' rơi xuống đất."
imagePrompt: "Edit this image: the character works at a blacksmith forge, pouring a glowing metal bar labeled '9.7' into a rectangular mold labeled '(int)'. The bar coming out reads '9', and a small broken shard labeled '.7' falls to the floor. Keep the original art style, 16:9."
---

Ép kiểu là đổi một giá trị từ kiểu dữ liệu này sang kiểu khác, ví dụ từ `double` sang `int` hay từ chuỗi `"50"` sang số `50`. C# chặt chẽ về kiểu, nên bạn sẽ cần ép kiểu khá thường xuyên. Nếu chưa rõ các kiểu, xem lại trang [kiểu dữ liệu](/docs/csharp/kieu-du-lieu).

## Ép kiểu ngầm

Khi đổi từ kiểu "nhỏ" sang kiểu "lớn" hơn, không có gì bị mất. C# tự làm giúp, bạn không phải viết gì thêm.

```csharp
int gold = 250;
long bankGold = gold;     // int -> long
double goldAsDouble = gold; // int -> double

Console.WriteLine(bankGold);     // 250
Console.WriteLine(goldAsDouble); // 250
```

Thứ tự an toàn thường gặp: `int` → `long` → `float` → `double`. Đi theo chiều này thì C# cho qua.

## Ép kiểu tường minh

Chiều ngược lại thì khác. Đổi `double` sang `int` sẽ mất phần thập phân, nên C# không tự làm. Người mới hay viết thẳng như dưới rồi gặp lỗi:

```csharp
double rawDamage = 9.7;
int damage = rawDamage; // lỗi CS0266
```

> **Lỗi hay gặp:** CS0266: `Cannot implicitly convert type 'double' to 'int'. An explicit conversion exists (are you missing a cast?)`. C# đang nói: "đổi được, nhưng sẽ mất dữ liệu, bạn phải tự xác nhận".

Cách xác nhận là đặt tên kiểu muốn đổi trong ngoặc tròn trước giá trị:

```csharp
double rawDamage = 9.7;
int damage = (int)rawDamage;
Console.WriteLine(damage); // 9
```

## Mất phần thập phân

Để ý kết quả ở trên là `9`, không phải `10`. Ép `(int)` **cắt bỏ** phần thập phân, không làm tròn.

```csharp
Console.WriteLine((int)9.7);  // 9
Console.WriteLine((int)9.2);  // 9
Console.WriteLine((int)-9.7); // -9
```

Với số âm, cắt bỏ nghĩa là đi về phía số 0, nên `-9.7` thành `-9`.

Trong game, chuyện này dễ gây lỗi khó thấy. Một món vũ khí có sát thương `9.99` sẽ gây đúng `9` nếu bạn ép `(int)`. Nếu muốn làm tròn, dùng `Math.Round` trước rồi mới ép:

```csharp
double rawDamage = 9.7;
int damage = (int)Math.Round(rawDamage);
Console.WriteLine(damage); // 10
```

Xem thêm các hàm làm tròn ở trang [Math](/docs/csharp/math).

## Dùng Convert

Lớp `Convert` có sẵn nhiều hàm đổi kiểu. Khác với `(int)`, `Convert.ToInt32` **làm tròn** chứ không cắt.

```csharp
double exp = 9.7;
Console.WriteLine(Convert.ToInt32(exp)); // 10
Console.WriteLine((int)exp);             // 9
```

Riêng số có đuôi đúng `.5`, cả `Convert.ToInt32` lẫn `Math.Round` làm tròn về số chẵn gần nhất: `2.5` thành `2`, `3.5` thành `4`. Cách này giảm sai số khi cộng dồn nhiều lần, nhưng hay làm người mới bất ngờ.

`Convert` còn đổi được giữa số và chuỗi, số và bool:

```csharp
int hp = 80;
string hpText = Convert.ToString(hp);
bool isAlive = Convert.ToBoolean(hp); // khác 0 là true
Console.WriteLine(hpText);  // 80
Console.WriteLine(isAlive); // True
```

Muốn đổi số thành chuỗi, cách ngắn hơn là gọi `.ToString()`: `hp.ToString()`.

## Đổi chuỗi thành số với int.Parse

Dữ liệu đọc từ bàn phím hay file luôn là chuỗi. Chuỗi `"50"` và số `50` khác nhau: bạn không cộng trừ được với chuỗi.

```csharp
string input = "50";
int bonusGold = int.Parse(input);
int gold = 100 + bonusGold;
Console.WriteLine(gold); // 150
```

Tương tự có `double.Parse`, `float.Parse`, `bool.Parse`.

> **Lỗi hay gặp:** `(int)"50"` báo lỗi CS0030: không ép `string` sang `int` được. Ngoặc ép kiểu chỉ dùng giữa các kiểu số. Chuỗi thì phải dùng `int.Parse` hoặc `Convert.ToInt32`.

Nếu chuỗi không phải số, như `"năm mươi"`, `int.Parse` sẽ làm chương trình dừng với lỗi `FormatException`. Cách xử lý an toàn bằng `int.TryParse` nằm ở trang [nhập dữ liệu](/docs/csharp/nhap-du-lieu).

## Bài tập

Người chơi có `exp` là `1234.8` (kiểu `double`). Hiển thị trên HUD phải là số nguyên. In ra hai dòng: một dòng cắt bỏ phần thập phân, một dòng làm tròn.

<details>
<summary>Xem đáp án</summary>

```csharp
double exp = 1234.8;

int cut = (int)exp;
int rounded = Convert.ToInt32(exp);

Console.WriteLine(cut);     // 1234
Console.WriteLine(rounded); // 1235
```

</details>
