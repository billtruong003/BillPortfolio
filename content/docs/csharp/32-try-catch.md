---
title: "Try catch trong C#: xử lý exception"
description: "Dùng try, catch, finally trong C# để xử lý exception: bắt đúng loại lỗi cụ thể, dọn dẹp bằng finally, và vì sao không nên nuốt lỗi bằng catch rỗng."
section: "Xử lý lỗi"
order: 32
tags: ["try", "catch", "finally", "exception", "xử lý lỗi"]
image: /images/docs/csharp/try-catch.webp
imageIdea: "Nhân vật anime đứng dưới một cây cầu gỗ ọp ẹp, giăng sẵn tấm lưới an toàn ghi 'catch'; một hiệp sĩ tí hon vừa trượt chân rơi xuống và nằm gọn trong lưới."
imagePrompt: "Edit this image: the character stands under a rickety wooden bridge labeled 'try', holding up a big safety net labeled 'catch'. A tiny chibi knight has just slipped off the bridge and lands safely in the net. Keep the original art style, 16:9."
---

Exception là lỗi xảy ra lúc chương trình đang chạy: đọc ô mảng không tồn tại, chuyển chữ thành số, mở file save bị hỏng. Không xử lý thì chương trình dừng ngay. `try` và `catch` cho bạn bắt lấy lỗi đó và quyết định phải làm gì tiếp.

## Vấn đề: một lỗi làm sập cả game

Người chơi gõ số lượng muốn mua, nhưng lại gõ "abc". `int.Parse` không chuyển được và ném exception.

```csharp
string input = "abc";
int amount = int.Parse(input);
Console.WriteLine($"Mua {amount} bình máu");
// Unhandled exception. System.FormatException:
// The input string 'abc' was not in a correct format.
```

Dòng thứ ba không bao giờ chạy. Trong game thật, người chơi thấy game văng ra màn hình desktop.

## `try` và `catch`

Đặt đoạn code có thể lỗi vào khối `try`. Nếu có exception, C# nhảy thẳng sang khối `catch` và bỏ qua phần còn lại của `try`.

```csharp
string input = "abc";

try
{
    int amount = int.Parse(input);
    Console.WriteLine($"Mua {amount} bình máu");
}
catch (FormatException)
{
    Console.WriteLine("Số lượng phải là số.");
}

Console.WriteLine("Quay lại cửa hàng");
// Số lượng phải là số.
// Quay lại cửa hàng
```

Chương trình không sập, và code sau khối `try`/`catch` vẫn chạy tiếp.

Riêng việc chuyển chuỗi sang số, `int.TryParse` (xem [nhập dữ liệu](/docs/csharp/nhap-du-lieu)) gọn hơn và không cần exception. Dùng `try`/`catch` cho những lỗi bạn không kiểm tra trước được.

## Bắt exception cụ thể

Mỗi loại lỗi có một kiểu exception riêng:

- `FormatException`: chuỗi sai định dạng khi chuyển sang số.
- `IndexOutOfRangeException`: vượt quá [mảng](/docs/csharp/mang).
- `KeyNotFoundException`: khoá không có trong [Dictionary](/docs/csharp/dictionary).
- `NullReferenceException`: dùng biến đang là [null](/docs/csharp/null).
- `DivideByZeroException`: chia số nguyên cho 0.

Một `try` có thể đi kèm nhiều `catch`, mỗi cái xử lý một loại. Biến `ex` cho bạn xem thông báo lỗi qua `ex.Message`.

```csharp
int[] slotItems = { 3, 0, 5 };
int slot = 4;

try
{
    int count = slotItems[slot];
    Console.WriteLine(100 / count);
}
catch (IndexOutOfRangeException)
{
    Console.WriteLine($"Ô {slot} không tồn tại");
}
catch (DivideByZeroException ex)
{
    Console.WriteLine($"Lỗi chia: {ex.Message}");
}
// Ô 4 không tồn tại
```

Đổi `slot` thành `1` thì `count` bằng 0, và khối `catch` thứ hai chạy.

> **Lỗi hay gặp:** đặt `catch (Exception)` lên trước các catch cụ thể. `Exception` là cha của mọi loại lỗi nên nó bắt hết, các catch phía sau không bao giờ tới lượt. C# báo CS0160 "A previous catch clause already catches all exceptions of this or of a super type ('Exception')". Catch cụ thể đặt trước, `Exception` chung đặt cuối cùng.

## `finally`: luôn chạy

Khối `finally` chạy dù `try` thành công hay có lỗi. Nó dùng cho việc dọn dẹp bắt buộc: đóng file, tắt màn hình loading, mở khoá nút bấm.

```csharp
LoadLevel("level-99");
// Bật màn hình loading
// Không tải được màn: Không có màn level-99
// Tắt màn hình loading

void LoadLevel(string levelName)
{
    Console.WriteLine("Bật màn hình loading");
    try
    {
        if (levelName != "level-1")
        {
            throw new InvalidOperationException($"Không có màn {levelName}");
        }
        Console.WriteLine("Vào màn chơi");
    }
    catch (InvalidOperationException ex)
    {
        Console.WriteLine($"Không tải được màn: {ex.Message}");
    }
    finally
    {
        Console.WriteLine("Tắt màn hình loading");
    }
}
```

`throw` là cách tự ném một exception khi bạn phát hiện tình huống sai. Không có `finally`, lỗi xảy ra giữa chừng có thể để màn hình loading treo mãi.

## Đừng nuốt lỗi

Cách làm tệ nhất là bọc mọi thứ trong `try` rồi để `catch` rỗng cho "hết lỗi".

```csharp
try
{
    SaveGame();
}
catch
{
    // im lặng
}
```

Game không sập, nhưng file save không được ghi và không ai biết. Người chơi mất tiến độ, bạn thì không có dòng log nào để tìm nguyên nhân. Lỗi vẫn còn đó, chỉ là bị giấu đi.

Nguyên tắc:

- Chỉ bắt loại exception mà bạn thật sự xử lý được.
- Trong `catch`, ít nhất phải ghi lại lỗi (`Console.WriteLine`, trong Unity là `Debug.LogError`).
- Nếu không xử lý được, ghi log rồi ném tiếp bằng `throw;` để tầng trên biết.

```csharp
try
{
    SaveGame();
}
catch (Exception ex)
{
    Console.WriteLine($"Lưu game thất bại: {ex.Message}");
    throw;
}

void SaveGame()
{
    throw new IOException("Ổ đĩa đầy");
}
// Lưu game thất bại: Ổ đĩa đầy
// Unhandled exception. System.IO.IOException: Ổ đĩa đầy
```

`throw;` đứng một mình giữ nguyên thông tin gốc của lỗi, giúp tìm đúng dòng gây ra nó.

## Bài tập

Cho `Dictionary<string, int> prices` có "Bình máu" giá 50. Viết code đọc giá của "Cung gỗ" trong `try`, bắt `KeyNotFoundException` để in "Shop không bán món này", và dùng `finally` in "Đóng cửa sổ shop".

<details>
<summary>Xem đáp án</summary>

```csharp
Dictionary<string, int> prices = new Dictionary<string, int> { ["Bình máu"] = 50 };

try
{
    int price = prices["Cung gỗ"];
    Console.WriteLine($"Giá: {price}");
}
catch (KeyNotFoundException)
{
    Console.WriteLine("Shop không bán món này");
}
finally
{
    Console.WriteLine("Đóng cửa sổ shop");
}
// Shop không bán món này
// Đóng cửa sổ shop
```

Trong code thật, `TryGetValue` là lựa chọn tốt hơn cho trường hợp này. Bài tập chỉ để luyện cú pháp.

</details>
