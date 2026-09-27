---
title: "Độ phức tạp Big-O: đo tốc độ thuật toán"
description: "Big-O là cách đo thuật toán chậm đi bao nhiêu khi dữ liệu lớn lên. Học O(1), O(n), O(n²), O(log n) và cách đếm vòng lặp, ví dụ bằng C# và Python."
section: "Nền tảng"
order: 0
tags: ["big-o", "độ phức tạp", "phỏng vấn"]
image: /images/docs/algorithms/do-phuc-tap-big-o.webp
imageIdea: "Nhân vật anime cầm đồng hồ bấm giờ đứng ở ngã ba: một con đường chật kín quái phải đi qua từng con, con đường kia chỉ có một tấm bảng tra cứu, nhân vật chọn tấm bảng với vẻ mặt đắc ý."
imagePrompt: "Edit this image: the character holds a stopwatch at a fork in a fantasy road. The left path is crowded with dozens of small monsters in a long line, a sign reads 'O(n)'. The right path has a single glowing lookup board, a sign reads 'O(1)'. The character smugly points to the right path. Keep the original art style, 16:9."
---

Big-O là cách nói thuật toán chậm đi bao nhiêu khi dữ liệu lớn lên. Nó không đo số giây, vì số giây phụ thuộc máy. Nó đo số bước tăng theo `n`, với `n` là kích thước đầu vào: số quái trên bản đồ, số món trong kho, số người trong bảng xếp hạng.

## Big-O chỉ quan tâm phần lớn nhất

Người mới hay cố đếm chính xác từng phép tính: "vòng này chạy 3n + 5 bước". Không cần. Khi `n` lên tới một triệu, số 5 và hệ số 3 gần như không đổi được gì. Big-O giữ lại phần lớn nhất và bỏ hằng số:

- `3n + 5` là **O(n)**
- `n² + 100n` là **O(n²)**
- `500` bước cố định là **O(1)**

## O(1): số bước không đổi

Lấy máu của con quái thứ 5 trong mảng, hay tra vàng của người chơi theo tên trong bảng băm: dù có 10 hay 10 triệu phần tử thì vẫn chỉ một bước.

```csharp tab
int GetHp(int[] hps, int index)
{
    return hps[index];
}
```

```python tab
def get_hp(hps, index):
    return hps[index]
```

## O(n): đi qua mỗi phần tử một lần

Tìm con quái yếu nhất thì phải nhìn hết cả đàn. Gấp đôi số quái thì gấp đôi số bước.

```csharp tab
int MinHp(int[] hps)
{
    int min = hps[0];
    foreach (int hp in hps)
        if (hp < min) min = hp;
    return min;
}
```

```python tab
def min_hp(hps):
    lowest = hps[0]
    for hp in hps:
        if hp < lowest:
            lowest = hp
    return lowest
```

## O(n²): mỗi phần tử so với mọi phần tử khác

Kiểm tra va chạm giữa mọi cặp quái là hai vòng lặp lồng nhau. Gấp đôi số quái thì số bước gấp bốn.

```csharp tab
int CountClosePairs(int[] xs, int range)
{
    int count = 0;
    for (int i = 0; i < xs.Length; i++)
        for (int j = i + 1; j < xs.Length; j++)
            if (Math.Abs(xs[i] - xs[j]) <= range) count++;
    return count;
}
```

```python tab
def count_close_pairs(xs, range_):
    count = 0
    for i in range(len(xs)):
        for j in range(i + 1, len(xs)):
            if abs(xs[i] - xs[j]) <= range_:
                count += 1
    return count
```

Vòng trong chạy khoảng n²/2 lần. Bỏ hằng số 1/2, còn O(n²).

## O(log n): mỗi bước bỏ đi một nửa

Đoán số từ 1 đến 1.000.000, mỗi lần được gợi ý "lớn hơn" hay "nhỏ hơn". Đoán ở giữa thì mỗi lần loại được nửa số còn lại, chỉ cần khoảng 20 lần. Đó là ý tưởng của tìm nhị phân, sẽ học ở bài Binary Search.

```csharp tab
int CountHalvings(int n)
{
    int steps = 0;
    while (n > 1)
    {
        n /= 2;
        steps++;
    }
    return steps;
}
```

```python tab
def count_halvings(n):
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps
```

`CountHalvings(1000000)` trả về 19.

## Cách đếm vòng lặp

- Hai vòng lặp **nối tiếp** nhau thì **cộng**: O(n) + O(n) vẫn là O(n).
- Hai vòng lặp **lồng** nhau thì **nhân**: O(n) × O(n) là O(n²).
- Vòng lặp mà biến chạy bị chia đôi hoặc nhân đôi mỗi lần là O(log n).
- Có nhiều phần thì giữ phần lớn nhất: O(n + n²) là O(n²).

## So sánh với n = 1.000.000

Giả sử máy chạy khoảng 100 triệu bước đơn giản mỗi giây:

| Độ phức tạp | Số bước | Thời gian ước chừng |
|---|---|---|
| O(1) | 1 | tức thì |
| O(log n) | khoảng 20 | tức thì |
| O(n) | 1.000.000 | khoảng 0,01 giây |
| O(n log n) | khoảng 20.000.000 | khoảng 0,2 giây |
| O(n²) | 1.000.000.000.000 | gần 3 tiếng |

Khoảng cách giữa O(n) và O(n²) là cả nghìn lần ở mức dữ liệu này. Vì vậy người phỏng vấn luôn hỏi "nhanh hơn được không?"

## Trong game: duyệt mọi quái hay tra bảng

Mỗi khi đạn trúng một con quái, game nhận được ID của nó và cần tìm dữ liệu quái đó. Cách dễ nghĩ nhất là duyệt cả danh sách, O(n) cho mỗi phát bắn. Một khung hình có 200 phát bắn, 5.000 quái thì đã là một triệu bước. Lưu quái vào `Dictionary` theo ID thì mỗi lần tra là O(1).

```csharp tab
var monsters = new Dictionary<int, string> { [7] = "Slime", [42] = "Goblin" };
Console.WriteLine(monsters[42]); // Goblin
```

```python tab
monsters = {7: "Slime", 42: "Goblin"}
print(monsters[42])  # Goblin
```

Bộ nhớ cũng có Big-O. Tạo thêm một bảng băm chứa n phần tử là tốn thêm O(n) bộ nhớ. Rất nhiều bài phỏng vấn là đổi bộ nhớ lấy tốc độ như vậy.

> **Lỗi hay gặp:** nghĩ `list.Contains(x)` trong C# hay `x in my_list` trong Python là O(1). Với danh sách, cả hai đều phải duyệt từ đầu nên là O(n). Đặt nó trong một vòng lặp là thành O(n²) lúc nào không hay. Chỉ `HashSet`, `Dictionary`, `set`, `dict` mới tra trung bình O(1).

## Khi đi phỏng vấn

- Viết xong lời giải nào cũng tự nói luôn độ phức tạp thời gian và bộ nhớ, đừng đợi bị hỏi.
- Nói rõ `n` là gì. Bài có hai đầu vào thì dùng hai chữ, ví dụ O(n + m), không gộp bừa.

## Bài tập

Hàm dưới đây kiểm tra túi đồ có món nào nằm trong danh sách đồ bị cấm không. `bag` có n món, `banned` có m món. Độ phức tạp là bao nhiêu? Viết lại cho nhanh hơn.

```csharp tab
bool HasBanned(List<int> bag, List<int> banned)
{
    foreach (int item in bag)
        if (banned.Contains(item)) return true;
    return false;
}
```

```python tab
def has_banned(bag, banned):
    for item in bag:
        if item in banned:
            return True
    return False
```

<details>
<summary>Xem đáp án</summary>

Bản gốc là O(n × m) vì `banned.Contains` duyệt cả danh sách cấm cho mỗi món. Đưa danh sách cấm vào tập hợp băm thì được O(n + m) thời gian, tốn thêm O(m) bộ nhớ.

```csharp tab
bool HasBanned(List<int> bag, List<int> banned)
{
    var bannedSet = new HashSet<int>(banned);
    foreach (int item in bag)
        if (bannedSet.Contains(item)) return true;
    return false;
}
```

```python tab
def has_banned(bag, banned):
    banned_set = set(banned)
    for item in bag:
        if item in banned_set:
            return True
    return False
```

</details>
