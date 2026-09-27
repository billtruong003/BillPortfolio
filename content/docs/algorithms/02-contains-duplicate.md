---
title: "Contains Duplicate: kiểm tra mảng có phần tử trùng"
description: "Kiểm tra một mảng có giá trị nào xuất hiện từ hai lần trở lên: từ hai vòng lặp O(n²) tới HashSet O(n), giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 2
difficulty: "Dễ"
tags: ["mảng", "hash set", "phỏng vấn"]
image: /images/docs/algorithms/contains-duplicate.webp
imageIdea: "Nhân vật anime làm thủ kho, cầm kính lúp soi hai thanh kiếm giống hệt nhau cùng mang số ID #042, mặt hốt hoảng vì phát hiện bug nhân bản đồ."
imagePrompt: "Edit this image: the character is a warehouse keeper in a fantasy armory, holding a big magnifying glass over two identical swords on a table, both with small tags reading '#042'. The character looks shocked. Keep the original art style, 16:9."
---

Cho một mảng số nguyên. Trả về `true` nếu có giá trị nào xuất hiện ít nhất hai lần, `false` nếu mọi phần tử đều khác nhau.

```text
Đầu vào: nums = [1, 2, 3, 1]
Đầu ra:  true    vì số 1 xuất hiện hai lần

Đầu vào: nums = [1, 2, 3, 4]
Đầu ra:  false
```

**Trong game:** mỗi món đồ hiếm có một ID riêng. Khi người chơi lợi dụng bug nhân bản đồ, trong kho sẽ có hai món cùng ID. Hàm này là bước kiểm tra đầu tiên của server.

## Cách thử hết: so mọi cặp

Lấy từng phần tử so với mọi phần tử đứng sau nó. Gặp cặp bằng nhau là trả về ngay.

```csharp tab
bool ContainsDuplicate(int[] nums)
{
    for (int i = 0; i < nums.Length; i++)
        for (int j = i + 1; j < nums.Length; j++)
            if (nums[i] == nums[j])
                return true;
    return false;
}
```

```python tab
def contains_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False
```

Độ phức tạp: thời gian **O(n²)**, bộ nhớ **O(1)**. Kho có 100.000 món thì phải so khoảng 5 tỉ cặp, server sẽ đứng hình.

## Cách nhanh: nhớ những số đã gặp

Thay vì so với mọi phần tử, chỉ cần hỏi: "Số này mình đã gặp chưa?" Câu hỏi đó trả lời được trong O(1) nếu lưu các số đã gặp vào một `HashSet` (C#) hay `set` (Python). Đây là tập hợp dùng bảng băm: không chứa phần tử trùng và tra rất nhanh.

```csharp tab
bool ContainsDuplicate(int[] nums)
{
    var seen = new HashSet<int>();
    foreach (int x in nums)
    {
        if (!seen.Add(x))
            return true;
    }
    return false;
}
```

```python tab
def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
```

Trong C#, `HashSet.Add` trả về `false` nếu phần tử đã có sẵn. Nhờ vậy một lệnh làm được hai việc: kiểm tra và thêm.

Chạy tay với `[1, 2, 3, 1]`:

| Bước | Số hiện tại | `seen` trước khi kiểm | Kết quả |
|---|---|---|---|
| 1 | 1 | {} | chưa có, thêm 1 |
| 2 | 2 | {1} | chưa có, thêm 2 |
| 3 | 3 | {1, 2} | chưa có, thêm 3 |
| 4 | 1 | {1, 2, 3} | đã có, trả về `true` |

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(n)** cho tập hợp. Lại là kiểu đổi bộ nhớ lấy tốc độ.

Nếu chỉ cần đáp án đúng mà không cần dừng sớm, có cách viết một dòng: so số phần tử của tập hợp với độ dài mảng.

```csharp tab
bool ContainsDuplicate(int[] nums) => new HashSet<int>(nums).Count != nums.Length;
```

```python tab
def contains_duplicate(nums):
    return len(set(nums)) != len(nums)
```

Cách này luôn duyệt hết mảng, kể cả khi hai phần tử đầu đã trùng.

> **Lỗi hay gặp:** dùng `List<int>` (C#) hay `list` (Python) làm `seen`. Code vẫn chạy đúng, nhưng `List.Contains` và `x in list` phải duyệt từ đầu danh sách, nên cả hàm quay lại O(n²). Chỉ đổi đúng một chữ là mất hết lợi thế.

## Khi đi phỏng vấn

- Nhắc thêm cách thứ ba: sắp xếp mảng rồi so từng cặp đứng cạnh nhau. Thời gian O(n log n), bộ nhớ gần như O(1). Hợp khi đề cấm dùng thêm bộ nhớ.
- Hỏi lại đề: được sửa mảng đầu vào không? Nếu không, cách sắp xếp phải chép mảng ra trước.

## Bài tập

Trả về `true` nếu có hai vị trí `i` khác `j` mà `nums[i] == nums[j]` và khoảng cách giữa hai vị trí không quá `k`. Trong game: người chơi dùng lại cùng một chiêu trong vòng `k` lượt thì bị phạt.

```text
Đầu vào: nums = [1, 2, 3, 1], k = 3
Đầu ra:  true    vì hai số 1 ở vị trí 0 và 3, cách nhau 3

Đầu vào: nums = [1, 2, 3, 1, 2, 3], k = 2
Đầu ra:  false
```

<details>
<summary>Xem đáp án</summary>

Dùng bảng băm lưu vị trí gần nhất của mỗi giá trị. Thời gian O(n), bộ nhớ O(n).

```csharp tab
bool ContainsNearbyDuplicate(int[] nums, int k)
{
    var lastIndex = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++)
    {
        if (lastIndex.TryGetValue(nums[i], out int j) && i - j <= k)
            return true;
        lastIndex[nums[i]] = i;
    }
    return false;
}
```

```python tab
def contains_nearby_duplicate(nums, k):
    last_index = {}
    for i, x in enumerate(nums):
        if x in last_index and i - last_index[x] <= k:
            return True
        last_index[x] = i
    return False
```

</details>
