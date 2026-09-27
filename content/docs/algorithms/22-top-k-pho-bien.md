---
title: "Top K Frequent Elements: k phần tử xuất hiện nhiều nhất"
description: "Tìm k phần tử xuất hiện nhiều nhất: đếm bằng Dictionary rồi sắp xếp O(n log n), hoặc chia vào các giỏ theo số lần xuất hiện để được O(n), giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 22
difficulty: "Trung bình"
tags: ["bảng băm", "đếm", "bucket", "phỏng vấn"]
image: /images/docs/algorithms/top-k-pho-bien.webp
imageIdea: "Nhân vật anime làm chủ tiệm vũ khí trong game, đang cắm biển Bán chạy nhất lên ba món đồ trên kệ, bên cạnh là cuốn sổ đếm vạch ghi số lần mỗi món được mua."
imagePrompt: "Edit this image: the character runs a fantasy weapon shop in an RPG, placing a 'TOP 2' sign on a sword and a health potion on the shelf, next to an open ledger filled with tally marks counting how many times each item was bought. Keep the original art style, 16:9."
---

Cho một mảng và số `k`. Trả về `k` phần tử xuất hiện nhiều lần nhất. Thứ tự trong kết quả không quan trọng, và đề đảm bảo đáp án là duy nhất.

```text
Đầu vào: items = ["kiếm", "bình máu", "kiếm", "cung", "bình máu", "kiếm"], k = 2
Đầu ra:  ["kiếm", "bình máu"]   vì kiếm 3 lần, bình máu 2 lần, cung 1 lần
```

**Trong game:** tiệm đồ đọc lịch sử mua hàng của cả server để treo biển "bán chạy nhất" lên `k` món được mua nhiều nhất.

## Bước 1: đếm bằng bảng băm

Người mới hay dùng hai vòng lặp: với mỗi món, đi hết mảng đếm xem nó xuất hiện mấy lần. Như vậy tốn **O(n²)**, và cùng một món bị đếm lại nhiều lần. Cách đúng là đi qua mảng một lần, cộng dồn vào bảng băm: key là món, value là số lần.

Bước đếm này giống nhau ở cả hai cách bên dưới, tốn thời gian **O(n)**.

## Cách 1: đếm rồi sắp xếp

Có bảng đếm rồi thì sắp các cặp (món, số lần) theo số lần giảm dần, lấy `k` cặp đầu.

```csharp tab
List<string> TopK(string[] items, int k)
{
    var count = new Dictionary<string, int>();
    foreach (var item in items)
        count[item] = count.GetValueOrDefault(item) + 1;

    var pairs = new List<KeyValuePair<string, int>>(count);
    pairs.Sort((a, b) => b.Value.CompareTo(a.Value));

    var result = new List<string>();
    for (int i = 0; i < k && i < pairs.Count; i++)
        result.Add(pairs[i].Key);
    return result;
}

string[] items = { "kiếm", "bình máu", "kiếm", "cung", "bình máu", "kiếm" };
Console.WriteLine(string.Join(", ", TopK(items, 2))); // kiếm, bình máu
```

```python tab
def top_k(items, k):
    count = {}
    for item in items:
        count[item] = count.get(item, 0) + 1

    pairs = sorted(count.items(), key=lambda p: p[1], reverse=True)
    return [item for item, _ in pairs[:k]]

items = ["kiếm", "bình máu", "kiếm", "cung", "bình máu", "kiếm"]
print(", ".join(top_k(items, 2)))  # kiếm, bình máu
```

Chạy bản C# trên console Windows mà chữ có dấu hiện thành dấu `?` thì thêm dòng `Console.OutputEncoding = System.Text.Encoding.UTF8;` lên đầu file.

Với `m` là số món khác nhau, thời gian **O(n + m log m)**, bộ nhớ **O(m)**. Trong Python có thể viết gọn bằng `Counter(items).most_common(k)` trong thư viện `collections`.

> **Lỗi hay gặp:** trong C# viết `count[item]++` khi `item` chưa có trong bảng. Đọc một key chưa tồn tại sẽ ném `KeyNotFoundException`. Python tương tự với `count[item] += 1` sẽ báo `KeyError`. Dùng `GetValueOrDefault` hoặc `get(item, 0)` để có giá trị mặc định là 0.

## Cách 2: chia vào giỏ theo số lần

Người phỏng vấn hay hỏi: "Có nhanh hơn O(n log n) không?" Để ý rằng số lần xuất hiện của một món chỉ nằm trong khoảng 1 tới `n`. Tạo `n + 1` cái giỏ (bucket), giỏ thứ `f` chứa các món xuất hiện đúng `f` lần. Sau đó đi từ giỏ lớn nhất xuống, nhặt đủ `k` món thì dừng.

```csharp tab
List<string> TopK(string[] items, int k)
{
    var count = new Dictionary<string, int>();
    foreach (var item in items)
        count[item] = count.GetValueOrDefault(item) + 1;

    var buckets = new List<string>[items.Length + 1];
    foreach (var (item, times) in count)
        (buckets[times] ??= new List<string>()).Add(item);

    var result = new List<string>();
    for (int f = items.Length; f >= 1 && result.Count < k; f--)
        if (buckets[f] != null)
            foreach (var item in buckets[f])
                if (result.Count < k) result.Add(item);
    return result;
}

string[] items = { "kiếm", "bình máu", "kiếm", "cung", "bình máu", "kiếm" };
Console.WriteLine(string.Join(", ", TopK(items, 2))); // kiếm, bình máu
```

```python tab
def top_k(items, k):
    count = {}
    for item in items:
        count[item] = count.get(item, 0) + 1

    buckets = [[] for _ in range(len(items) + 1)]
    for item, times in count.items():
        buckets[times].append(item)

    result = []
    for f in range(len(items), 0, -1):
        for item in buckets[f]:
            if len(result) < k:
                result.append(item)
    return result

items = ["kiếm", "bình máu", "kiếm", "cung", "bình máu", "kiếm"]
print(", ".join(top_k(items, 2)))  # kiếm, bình máu
```

Các giỏ với ví dụ trên (`n = 6`):

| Giỏ f | Món | Nhặt? |
|---|---|---|
| 6, 5, 4 | trống | |
| 3 | kiếm | nhặt, có 1 món |
| 2 | bình máu | nhặt, đủ 2 món, dừng |
| 1 | cung | không xét tới |

Thời gian **O(n)** vì số giỏ là `n + 1` và mỗi món vào đúng một giỏ. Bộ nhớ **O(n)**.

> **Lỗi hay gặp:** tạo `n` giỏ thay vì `n + 1`. Khi mọi phần tử giống nhau, số lần xuất hiện bằng đúng `n`, truy cập `buckets[n]` sẽ gặp `IndexOutOfRangeException` ở C# hoặc `IndexError` ở Python.

## Khi đi phỏng vấn

- Đi theo thứ tự: đếm bằng bảng băm, sắp xếp O(n log n), rồi tối ưu bằng giỏ O(n). Nhắc thêm cách dùng heap (hàng đợi ưu tiên, `PriorityQueue` trong C#, `heapq` trong Python) giữ `k` phần tử, được O(n log k), hợp khi `k` nhỏ hơn nhiều so với `n`.
- Hỏi lại khi có hai món cùng số lần: trả món nào? Câu trả lời quyết định bạn cần thêm tiêu chí phụ khi sắp xếp.

## Bài tập

Trả về `k` từ xuất hiện nhiều nhất trong đoạn chat của trận đấu. Cùng số lần thì xếp theo thứ tự chữ cái. Ví dụ `["gg", "ez", "gg", "nt", "ez", "wp"]`, `k = 3` trả về `["ez", "gg", "nt"]`.

<details>
<summary>Xem đáp án</summary>

```csharp tab
List<string> TopWords(string[] words, int k)
{
    var count = new Dictionary<string, int>();
    foreach (var w in words)
        count[w] = count.GetValueOrDefault(w) + 1;

    var keys = new List<string>(count.Keys);
    keys.Sort((a, b) => count[a] != count[b]
        ? count[b].CompareTo(count[a])
        : string.CompareOrdinal(a, b));
    return keys.GetRange(0, Math.Min(k, keys.Count));
}

string[] chat = { "gg", "ez", "gg", "nt", "ez", "wp" };
Console.WriteLine(string.Join(", ", TopWords(chat, 3))); // ez, gg, nt
```

```python tab
def top_words(words, k):
    count = {}
    for w in words:
        count[w] = count.get(w, 0) + 1
    keys = sorted(count, key=lambda w: (-count[w], w))
    return keys[:k]

chat = ["gg", "ez", "gg", "nt", "ez", "wp"]
print(", ".join(top_words(chat, 3)))  # ez, gg, nt
```

</details>
