---
title: "Two Sum: tìm hai số có tổng bằng mục tiêu"
description: "Two Sum, bài phỏng vấn kinh điển nhất: từ cách thử hết mọi cặp O(n²) tới cách dùng bảng băm O(n), giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 1
difficulty: "Dễ"
tags: ["mảng", "hash map", "phỏng vấn"]
image: /images/docs/algorithms/two-sum.webp
imageIdea: "Nhân vật anime đứng trước quầy shop trong game, tay cầm túi 9 xu, đang lựa hai món đồ có giá cộng lại vừa đúng 9."
imagePrompt: "Edit this image: the character stands at a fantasy game shop counter holding a small pouch labeled '9 coins', comparing two item price tags '2' and '7' with a thoughtful face. Keep the original art style, 16:9."
---

Cho một mảng số nguyên và một số mục tiêu. Tìm vị trí của **hai** phần tử có tổng đúng bằng mục tiêu. Đề đảm bảo luôn có đúng một đáp án, và không được dùng một phần tử hai lần.

```text
Đầu vào: nums = [2, 7, 11, 15], target = 9
Đầu ra:  [0, 1]   vì nums[0] + nums[1] = 2 + 7 = 9
```

**Trong game:** người chơi có đúng 9 xu và muốn mua hai món cho tiêu hết tiền. Danh sách giá là mảng, 9 là mục tiêu.

## Cách thử hết: hai vòng lặp

Cách đầu tiên ai cũng nghĩ ra là thử mọi cặp. Cách này đúng, nhưng với mảng 10.000 phần tử thì phải thử khoảng 50 triệu cặp.

```csharp tab
int[] TwoSum(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
        for (int j = i + 1; j < nums.Length; j++)
            if (nums[i] + nums[j] == target)
                return new[] { i, j };
    return new int[0];
}
```

```python tab
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

Độ phức tạp: thời gian **O(n²)**, bộ nhớ **O(1)**. Người phỏng vấn gần như chắc chắn sẽ hỏi tiếp: "Nhanh hơn được không?"

## Cách nhanh: nhớ những số đã đi qua

Mẹo nằm ở câu hỏi ngược lại. Đứng ở số `x`, thay vì đi tìm cặp cho nó, hãy hỏi: "Số `target - x` đã xuất hiện trước đó chưa?" Muốn trả lời nhanh câu đó thì lưu các số đã gặp vào một bảng băm, key là giá trị, value là vị trí.

```csharp tab
int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>(); // giá trị -> vị trí
    for (int i = 0; i < nums.Length; i++)
    {
        int need = target - nums[i];
        if (seen.TryGetValue(need, out int j))
            return new[] { j, i };
        seen[nums[i]] = i;
    }
    return new int[0];
}
```

```python tab
def two_sum(nums, target):
    seen = {}  # giá trị -> vị trí
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []
```

Chạy tay với `[2, 7, 11, 15]`, mục tiêu 9:

| Bước | Số hiện tại | Cần tìm | Bảng `seen` trước khi kiểm | Kết quả |
|---|---|---|---|---|
| 1 | 2 | 7 | trống | chưa có, lưu 2 → 0 |
| 2 | 7 | 2 | {2: 0} | có, trả về [0, 1] |

Độ phức tạp: thời gian **O(n)** vì mỗi số chỉ đi qua một lần, bộ nhớ **O(n)** cho bảng băm. Đây là kiểu đánh đổi hay gặp: tốn thêm bộ nhớ để đổi lấy tốc độ.

> **Lỗi hay gặp:** lưu số vào bảng trước rồi mới kiểm tra. Với `nums = [3, 2, 4]`, target 6: tới số 3, bạn lưu nó rồi tìm `6 - 3 = 3`, thấy ngay chính nó trong bảng và trả về `[0, 0]`, trong khi đáp án đúng là `[1, 2]`. Luôn kiểm tra trước, lưu sau.

## Khi đi phỏng vấn

- Nói cách hai vòng lặp trước, nêu độ phức tạp, rồi mới tối ưu. Người phỏng vấn muốn thấy cách bạn nghĩ.
- Hỏi lại đề: có số âm không, mảng đã sắp xếp chưa? Nếu mảng đã sắp xếp, dùng hai con trỏ ở hai đầu để được O(n) mà không tốn bộ nhớ thêm.

## Bài tập

Viết hàm trả về `true` nếu trong mảng có hai số khác vị trí mà hiệu của chúng đúng bằng `k` (ví dụ `[1, 5, 3]`, `k = 2` trả về `true` vì 5 − 3 = 2).

<details>
<summary>Xem đáp án</summary>

```csharp tab
bool HasPairWithDiff(int[] nums, int k)
{
    var seen = new HashSet<int>();
    foreach (int x in nums)
    {
        if (seen.Contains(x - k) || seen.Contains(x + k)) return true;
        seen.Add(x);
    }
    return false;
}
```

```python tab
def has_pair_with_diff(nums, k):
    seen = set()
    for x in nums:
        if x - k in seen or x + k in seen:
            return True
        seen.add(x)
    return False
```

</details>
