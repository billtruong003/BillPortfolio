---
title: "Sorting: bubble sort, merge sort, quick sort và hàm sắp xếp có sẵn"
description: "Ý tưởng và code ngắn của bubble sort, merge sort, quick sort, bảng so sánh độ phức tạp, và khi nào nên dùng Array.Sort hay sorted, giải bằng C# và Python."
section: "Tìm kiếm và sắp xếp"
order: 21
difficulty: "Trung bình"
tags: ["sắp xếp", "merge sort", "quick sort", "phỏng vấn"]
image: /images/docs/algorithms/sap-xep-co-ban.webp
imageIdea: "Nhân vật anime làm trọng tài bảng xếp hạng cuối mùa giải trong game, đang bê từng tấm bảng tên người chơi đổi chỗ cho nhau để điểm cao đứng trên, mồ hôi nhễ nhại."
imagePrompt: "Edit this image: the character is sweating while carrying and swapping large player name boards on a giant end-of-season leaderboard in an online game, the boards show scores '9', '6', '5', '2' being rearranged, a banner at the top reads 'LEADERBOARD'. Keep the original art style, 16:9."
---

Sắp xếp là đưa các phần tử về thứ tự tăng dần (hoặc giảm dần). Trong code thật bạn gần như luôn gọi hàm có sẵn, nhưng phỏng vấn hay yêu cầu tự viết một thuật toán sắp xếp và giải thích độ phức tạp của nó.

```text
Đầu vào: scores = [5, 2, 9, 1, 5, 6]
Đầu ra:  [1, 2, 5, 5, 6, 9]
```

**Trong game:** cuối mỗi trận, bảng xếp hạng phải sắp lại điểm của mọi người chơi để biết ai đứng đầu.

## Bubble sort: cách thử hết

Đi dọc mảng, gặp hai phần tử kề nhau sai thứ tự thì đổi chỗ. Sau mỗi lượt, phần tử lớn nhất còn lại "nổi" về cuối như bọt khí. Lặp tới khi một lượt không đổi chỗ lần nào.

```csharp tab
void BubbleSort(int[] a)
{
    for (int end = a.Length - 1; end > 0; end--)
    {
        bool swapped = false;
        for (int i = 0; i < end; i++)
            if (a[i] > a[i + 1])
            {
                (a[i], a[i + 1]) = (a[i + 1], a[i]);
                swapped = true;
            }
        if (!swapped) break;
    }
}

int[] scores = { 5, 2, 9, 1, 5, 6 };
BubbleSort(scores);
Console.WriteLine(string.Join(" ", scores)); // 1 2 5 5 6 9
```

```python tab
def bubble_sort(a):
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for i in range(end):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:
            break

scores = [5, 2, 9, 1, 5, 6]
bubble_sort(scores)
print(*scores)  # 1 2 5 5 6 9
```

Thời gian **O(n²)**, bộ nhớ **O(1)**. Dễ viết, nhưng 100.000 người chơi là cỡ 5 tỷ phép so sánh.

## Merge sort: chia đôi rồi trộn

Chia mảng làm hai nửa, sắp xếp từng nửa (gọi đệ quy), rồi trộn hai nửa đã sắp thành một. Trộn thì dễ: so hai phần tử đầu của hai nửa, lấy cái nhỏ hơn.

```csharp tab
int[] MergeSort(int[] a)
{
    if (a.Length <= 1) return a;
    int mid = a.Length / 2;
    int[] left = MergeSort(a[..mid]);
    int[] right = MergeSort(a[mid..]);

    var result = new int[a.Length];
    int i = 0, j = 0, k = 0;
    while (i < left.Length && j < right.Length)
        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < left.Length) result[k++] = left[i++];
    while (j < right.Length) result[k++] = right[j++];
    return result;
}

Console.WriteLine(string.Join(" ", MergeSort(new[] { 5, 2, 9, 1, 5, 6 }))); // 1 2 5 5 6 9
```

```python tab
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])

    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(*merge_sort([5, 2, 9, 1, 5, 6]))  # 1 2 5 5 6 9
```

Mảng bị chia đôi khoảng `log n` lần, mỗi tầng trộn tốn `n` bước: thời gian **O(n log n)** trong mọi trường hợp, bộ nhớ **O(n)** cho mảng phụ.

> **Lỗi hay gặp:** viết `left[i] < right[j]` thay vì `<=`. Kết quả vẫn tăng dần, nhưng hai người chơi cùng điểm có thể bị đảo thứ tự ban đầu. Giữ nguyên thứ tự của các phần tử bằng nhau gọi là sắp xếp **ổn định** (stable), và dấu `<=` là thứ giữ tính chất đó.

## Quick sort: chọn chốt rồi chia ba

Chọn một phần tử làm chốt (pivot). Chia mảng thành ba nhóm: nhỏ hơn chốt, bằng chốt, lớn hơn chốt. Sắp xếp nhóm nhỏ và nhóm lớn bằng đệ quy rồi ghép lại. Bản dưới đây ngắn để thấy ý tưởng, bản thật sẽ đổi chỗ ngay trong mảng để khỏi tốn bộ nhớ.

```csharp tab
List<int> QuickSort(List<int> a)
{
    if (a.Count <= 1) return a;
    int pivot = a[a.Count / 2];
    var result = QuickSort(a.FindAll(x => x < pivot));
    result.AddRange(a.FindAll(x => x == pivot));
    result.AddRange(QuickSort(a.FindAll(x => x > pivot)));
    return result;
}

Console.WriteLine(string.Join(" ", QuickSort(new List<int> { 5, 2, 9, 1, 5, 6 }))); // 1 2 5 5 6 9
```

```python tab
def quick_sort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    less = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    greater = [x for x in a if x > pivot]
    return quick_sort(less) + equal + quick_sort(greater)

print(*quick_sort([5, 2, 9, 1, 5, 6]))  # 1 2 5 5 6 9
```

Trung bình **O(n log n)**. Nếu chốt luôn rơi vào phần tử nhỏ nhất hoặc lớn nhất (ví dụ lấy phần tử đầu của mảng đã sắp sẵn), mỗi lần chỉ bớt được một phần tử và thời gian thành **O(n²)**.

> **Lỗi hay gặp:** gộp chốt vào nhóm nhỏ bằng `x <= pivot` và bỏ nhóm bằng. Với mảng toàn số giống nhau, nhóm nhỏ luôn là cả mảng, đệ quy không bao giờ dừng: Python báo `RecursionError`, C# văng `StackOverflowException`.

## So sánh và khi nào dùng hàm có sẵn

| Thuật toán | Trung bình | Xấu nhất | Bộ nhớ thêm | Ổn định |
|---|---|---|---|---|
| Bubble sort | O(n²) | O(n²) | O(1) | có |
| Merge sort | O(n log n) | O(n log n) | O(n) | có |
| Quick sort (bản đổi chỗ tại mảng) | O(n log n) | O(n²) | O(log n) | không |

Trong code game thật, dùng hàm có sẵn: đã tối ưu kỹ và ít lỗi hơn tự viết.

- C#: `Array.Sort(arr)` hoặc `list.Sort()`, chạy O(n log n) nhưng **không ổn định**. Cần ổn định thì dùng `OrderBy` của LINQ.
- Python: `sorted(a)` trả về danh sách mới, `a.sort()` sắp tại chỗ. Cả hai đều ổn định.

Chỉ tự viết khi đề bài phỏng vấn yêu cầu, hoặc khi dữ liệu có dạng đặc biệt (ví dụ điểm chỉ từ 0 tới 100 thì đếm số lần mỗi điểm là đủ, O(n)).

## Khi đi phỏng vấn

- Nếu đề chỉ cần mảng đã sắp để làm bước tiếp theo, cứ gọi hàm có sẵn và nói rõ độ phức tạp O(n log n). Không ai muốn bạn tự viết quick sort giữa bài Two Sum.
- Khi được hỏi chọn thuật toán nào, nhắc tới tính ổn định và bộ nhớ: merge sort ổn định nhưng tốn O(n), quick sort tiết kiệm bộ nhớ nhưng có trường hợp xấu O(n²).

## Bài tập

Sắp xếp người chơi theo điểm **giảm dần**, cùng điểm thì theo tên **tăng dần**, bằng hàm có sẵn.

```text
Đầu vào: (Lan, 50), (An, 80), (Minh, 50)
Đầu ra:  An 80, Lan 50, Minh 50
```

<details>
<summary>Xem đáp án</summary>

```csharp tab
var players = new List<(string Name, int Score)>
{
    ("Lan", 50), ("An", 80), ("Minh", 50),
};
players.Sort((a, b) => a.Score != b.Score
    ? b.Score.CompareTo(a.Score)
    : string.CompareOrdinal(a.Name, b.Name));

foreach (var p in players)
    Console.WriteLine($"{p.Name} {p.Score}");
// An 80
// Lan 50
// Minh 50
```

```python tab
players = [("Lan", 50), ("An", 80), ("Minh", 50)]
players.sort(key=lambda p: (-p[1], p[0]))

for name, score in players:
    print(name, score)
# An 80
# Lan 50
# Minh 50
```

</details>
