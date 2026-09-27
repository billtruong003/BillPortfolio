---
title: "Vòng lặp foreach trong C#"
description: "Dùng foreach để duyệt mảng và List trong C#, khi nào nên dùng thay cho for, và vì sao sửa List khi đang foreach gây InvalidOperationException."
section: "Collection"
order: 19
tags: ["foreach", "vòng lặp", "List", "mảng"]
image: /images/docs/csharp/foreach.webp
imageIdea: "Nhân vật anime đi dọc một băng chuyền, lần lượt đóng dấu 'đã kiểm' lên từng hộp đồ chạy qua, không bỏ sót hộp nào."
imagePrompt: "Edit this image: the character walks along a conveyor belt carrying small item crates, stamping each crate with a red stamp that reads 'CHECKED'. A sign above the belt reads 'foreach'. Keep the original art style, 16:9."
---

`foreach` là vòng lặp đi qua từng phần tử của một tập hợp, từ đầu tới cuối. Bạn không cần tự quản index, không lo vượt quá `Length`. Nó hợp nhất khi chỉ muốn đọc hết mọi phần tử.

## foreach trên mảng

Với [vòng lặp for](/docs/csharp/vong-lap-for), bạn phải tự viết `i = 0`, `i < Length`, `i++` và nhớ dùng `enemyHp[i]`. Sai một chỗ là gặp `IndexOutOfRangeException`. Khi không cần biết mình đang ở ô số mấy, `foreach` gọn hơn nhiều.

```csharp
string[] party = { "Aki", "Ren", "Mio" };

foreach (string hero in party)
{
    Console.WriteLine($"{hero} đã sẵn sàng");
}
// Aki đã sẵn sàng
// Ren đã sẵn sàng
// Mio đã sẵn sàng
```

Đọc câu `foreach (string hero in party)` là: "với mỗi `hero` kiểu `string` nằm trong `party`, làm việc sau". Có thể viết `var hero` cho ngắn.

## foreach trên List

`foreach` chạy được trên mọi tập hợp, kể cả [List](/docs/csharp/list) và [Dictionary](/docs/csharp/dictionary).

```csharp
List<int> damageLog = new List<int> { 12, 30, 7, 25 };

int totalDamage = 0;
foreach (int dmg in damageLog)
{
    totalDamage += dmg;
}
Console.WriteLine(totalDamage); // 74
```

## Biến trong foreach chỉ đọc

Người mới hay thử hồi máu cho cả đội bằng cách gán lại biến lặp. C# chặn ngay lúc biên dịch.

```csharp
int[] partyHp = { 40, 75, 10 };

foreach (int hp in partyHp)
{
    hp = 100; // lỗi CS1656
}
```

> **Lỗi hay gặp:** CS1656 "Cannot assign to 'hp' because it is a 'foreach iteration variable'". Biến `hp` chỉ là bản sao để đọc. Muốn sửa phần tử thì dùng `for` với index.

```csharp
int[] partyHp = { 40, 75, 10 };

for (int i = 0; i < partyHp.Length; i++)
{
    partyHp[i] = 100;
}
Console.WriteLine(partyHp[2]); // 100
```

## Không thêm, xoá phần tử List khi đang foreach

Tình huống rất hay gặp trong game: duyệt danh sách quái, con nào hết máu thì xoá. Viết thẳng bằng `foreach` thì chương trình dừng lúc chạy.

```csharp
List<string> enemies = new List<string> { "Slime", "Goblin", "Slime", "Bat" };

foreach (string enemy in enemies)
{
    if (enemy == "Slime")
    {
        enemies.Remove(enemy);
    }
}
// Unhandled exception. System.InvalidOperationException:
// Collection was modified; enumeration operation may not execute.
```

`foreach` đang đi theo danh sách thì danh sách bị đổi dưới chân nó, nên nó từ chối đi tiếp. `Add` trong lúc `foreach` cũng gây đúng lỗi này.

Cách đúng: dùng `for` chạy ngược từ cuối về đầu. Xoá phần tử ở cuối không làm lệch index của những phần tử chưa duyệt.

```csharp
List<string> enemies = new List<string> { "Slime", "Goblin", "Slime", "Bat" };

for (int i = enemies.Count - 1; i >= 0; i--)
{
    if (enemies[i] == "Slime")
    {
        enemies.RemoveAt(i);
    }
}

foreach (string enemy in enemies)
{
    Console.WriteLine(enemy);
}
// Goblin
// Bat
```

## Chọn for hay foreach

- Chỉ đọc từng phần tử: dùng `foreach`.
- Cần biết index, sửa phần tử, hoặc xoá khỏi List: dùng `for`.
- Cần dừng giữa chừng: cả hai đều dùng được [break và continue](/docs/csharp/break-continue).

## Bài tập

Cho `List<int> lootGold = new List<int> { 15, 0, 40, 0, 25 };` là số vàng rơi từ 5 con quái. Dùng `foreach` để in tổng vàng, sau đó xoá hết các phần tử bằng `0` khỏi List mà không bị `InvalidOperationException`, rồi in `Count`.

<details>
<summary>Xem đáp án</summary>

```csharp
List<int> lootGold = new List<int> { 15, 0, 40, 0, 25 };

int totalGold = 0;
foreach (int gold in lootGold)
{
    totalGold += gold;
}
Console.WriteLine(totalGold); // 80

for (int i = lootGold.Count - 1; i >= 0; i--)
{
    if (lootGold[i] == 0)
    {
        lootGold.RemoveAt(i);
    }
}
Console.WriteLine(lootGold.Count); // 3
```

</details>
