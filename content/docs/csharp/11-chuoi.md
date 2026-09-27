---
title: "Chuỗi (string) trong C#"
description: "Làm việc với chuỗi trong C#: nối chuỗi, chuỗi nội suy $\"\", Length, ToUpper, Contains, Substring và vì sao chuỗi không sửa tại chỗ được."
section: "Cơ bản"
order: 11
tags: ["chuỗi", "string", "interpolation"]
image: /images/docs/csharp/chuoi.webp
imageIdea: "Nhân vật anime xâu các hạt chữ cái vào một sợi dây như làm vòng tay, các hạt ghép thành chữ 'Aki Lv.5', một kéo nhỏ đang cắt ra đoạn 'Lv.5' như Substring."
imagePrompt: "Edit this image: the character is threading letter beads onto a string like making a bracelet, the beads spell 'Aki Lv.5'. A small pair of scissors hovers near the string, cutting off the part 'Lv.5'. Keep the original art style, 16:9."
---

Chuỗi (`string`) là một đoạn chữ: tên nhân vật, lời thoại, tên vật phẩm, thông báo trên màn hình. Chuỗi viết trong dấu nháy kép và có sẵn nhiều hàm để đo độ dài, tìm kiếm, cắt ghép.

## Tạo chuỗi

```csharp
string heroName = "Aki";
string emptyNote = "";
Console.WriteLine(heroName); // Aki
```

Muốn có dấu nháy kép bên trong chuỗi, thêm `\` phía trước. `\n` là xuống dòng.

```csharp
string line = "Bà lão nói: \"Hãy cẩn thận với rồng.\"";
Console.WriteLine(line); // Bà lão nói: "Hãy cẩn thận với rồng."
Console.WriteLine("Dòng 1\nDòng 2");
// Dòng 1
// Dòng 2
```

## Nối chuỗi bằng dấu +

```csharp
string heroName = "Aki";
int level = 5;
string title = heroName + " Lv." + level;
Console.WriteLine(title); // Aki Lv.5
```

Nối nhiều mảnh bằng `+` nhanh chóng trở nên khó đọc, dễ quên dấu cách và dễ sai thứ tự.

> **Lỗi hay gặp:** viết `Console.WriteLine("Tổng: " + 10 + 5);` và mong ra `Tổng: 15`. C# đọc từ trái sang phải: `"Tổng: " + 10` thành chuỗi `"Tổng: 10"`, rồi nối tiếp `5` thành `Tổng: 105`. Bọc phép cộng số trong ngoặc: `"Tổng: " + (10 + 5)`.

## Chuỗi nội suy $""

Đặt `$` trước dấu nháy, rồi viết biến hoặc biểu thức trong `{ }` ngay trong chuỗi. Cách này dễ đọc hơn nối bằng `+`.

```csharp
string heroName = "Aki";
int hp = 72;
int maxHp = 100;

Console.WriteLine($"{heroName}: {hp}/{maxHp} HP"); // Aki: 72/100 HP
Console.WriteLine($"Còn thiếu {maxHp - hp} máu"); // Còn thiếu 28 máu
```

Trong `{ }` còn định dạng được số. `:F1` là giữ một chữ số thập phân:

```csharp
double dps = 123.456;
Console.WriteLine($"DPS: {dps:F1}"); // DPS: 123.5
```

> **Lưu ý:** máy đặt định dạng Việt Nam sẽ in `DPS: 123,5` thay vì `DPS: 123.5`. Kết quả trong bài theo định dạng quốc tế.

## Length

`Length` cho biết chuỗi có bao nhiêu ký tự. Hay dùng để kiểm tra tên người chơi nhập vào:

```csharp
string playerName = "DragonSlayer";
Console.WriteLine(playerName.Length); // 12

if (playerName.Length > 10)
{
    Console.WriteLine("Tên tối đa 10 ký tự"); // Tên tối đa 10 ký tự
}
```

`Length` không có dấu ngoặc tròn phía sau, vì nó là thuộc tính, không phải hàm.

## ToUpper và ToLower

```csharp
string rank = "legendary";
Console.WriteLine(rank.ToUpper()); // LEGENDARY
Console.WriteLine("BOSS".ToLower()); // boss
```

Hay dùng khi so sánh câu người dùng gõ, để `"Yes"`, `"YES"` và `"yes"` được coi như nhau:

```csharp
string answer = "YeS";
Console.WriteLine(answer.ToLower() == "yes"); // True
```

## Contains

`Contains` kiểm tra chuỗi có chứa một đoạn chữ khác không, trả về `bool`. Có phân biệt hoa thường.

```csharp
string itemName = "Kiếm lửa cổ đại";
Console.WriteLine(itemName.Contains("lửa")); // True
Console.WriteLine(itemName.Contains("Lửa")); // False
```

## Substring

`Substring(vị trí bắt đầu, số ký tự)` cắt ra một đoạn. Vị trí đếm từ 0.

```csharp
string code = "LV05-BOSS";
string levelPart = code.Substring(0, 4);
string typePart = code.Substring(5);
Console.WriteLine(levelPart); // LV05
Console.WriteLine(typePart);  // BOSS
```

Chỉ truyền một số thì cắt từ vị trí đó tới hết chuỗi.

> **Lỗi hay gặp:** cắt vượt quá độ dài chuỗi, như `"Aki".Substring(1, 5)`. Chương trình dừng với `ArgumentOutOfRangeException`. Kiểm tra `Length` trước khi cắt.

## Chuỗi không sửa tại chỗ được

Người mới hay gọi `ToUpper()` rồi thắc mắc sao chuỗi không đổi:

```csharp
string heroName = "aki";
heroName.ToUpper();
Console.WriteLine(heroName); // aki
```

Chuỗi trong C# là **immutable**, nghĩa là tạo ra rồi thì không sửa được. `ToUpper()`, `Substring()`, `Replace()` đều trả về một chuỗi **mới**, chuỗi cũ giữ nguyên. Muốn giữ kết quả thì gán lại:

```csharp
string heroName = "aki";
heroName = heroName.ToUpper();
Console.WriteLine(heroName); // AKI
```

Bạn cũng không gán được từng ký tự: `heroName[0] = 'B';` báo lỗi CS0200 vì chỉ đọc được, không ghi được. Đọc thì vẫn được: `heroName[0]` trả về `'A'`.

## Bài tập

Cho `string raw = "  slime king  ";`. Hãy bỏ khoảng trắng hai đầu (dùng `Trim()`), viết hoa toàn bộ, rồi in ra dạng `Boss: SLIME KING (10 ký tự)`.

<details>
<summary>Xem đáp án</summary>

```csharp
string raw = "  slime king  ";
string bossName = raw.Trim().ToUpper();

Console.WriteLine($"Boss: {bossName} ({bossName.Length} ký tự)"); // Boss: SLIME KING (10 ký tự)
```

</details>
