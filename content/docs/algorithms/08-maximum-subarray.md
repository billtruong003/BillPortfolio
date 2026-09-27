---
title: "Maximum Subarray: đoạn con có tổng lớn nhất với Kadane"
description: "Tìm đoạn liên tiếp có tổng lớn nhất trong mảng có cả số âm: từ thử mọi đoạn O(n²) tới thuật toán Kadane O(n), giải bằng C# và Python."
section: "Quy hoạch động"
order: 8
difficulty: "Trung bình"
tags: ["mảng", "quy hoạch động", "kadane", "phỏng vấn"]
image: /images/docs/algorithms/maximum-subarray.webp
imageIdea: "Nhân vật anime ngồi trước màn hình xem lại trận đấu, thanh điểm bên dưới là dãy ô xanh đỏ xen kẽ, nhân vật cầm bút dạ khoanh một đoạn liên tiếp và dán nhãn 'BEST STREAK' để cắt làm highlight."
imagePrompt: "Edit this image: the character sits in front of a monitor reviewing a match replay. Below the video is a timeline bar of green and red score blocks with numbers like '+4', '-1', '+2', '+1'. The character circles a continuous section with a marker, labeled 'BEST STREAK'. Keep the original art style, 16:9."
---

Cho một mảng số nguyên, có cả số âm. Tìm đoạn con **liên tiếp**, ít nhất một phần tử, có tổng lớn nhất, và trả về tổng đó.

```text
Đầu vào: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Đầu ra:  6    đoạn [4, -1, 2, 1]

Đầu vào: nums = [-3, -1, -2]
Đầu ra:  -1   phải chọn ít nhất một phần tử, chọn -1
```

**Trong game:** mỗi lượt trong trận, người chơi được cộng hoặc trừ điểm. Hệ thống tự cắt video highlight là đoạn lượt liên tiếp ghi nhiều điểm nhất.

## Cách thử hết: mọi điểm bắt đầu, mọi điểm kết thúc

Chọn điểm bắt đầu `i`, rồi kéo dài dần điểm kết thúc `j`, cộng dồn tổng. Nhờ cộng dồn, mỗi đoạn chỉ tốn một phép cộng thay vì cộng lại từ đầu.

```csharp tab
int MaxSubArray(int[] nums)
{
    int best = nums[0];
    for (int i = 0; i < nums.Length; i++)
    {
        int sum = 0;
        for (int j = i; j < nums.Length; j++)
        {
            sum += nums[j];
            best = Math.Max(best, sum);
        }
    }
    return best;
}
```

```python tab
def max_sub_array(nums):
    best = nums[0]
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            best = max(best, total)
    return best
```

Độ phức tạp: thời gian **O(n²)**, bộ nhớ **O(1)**.

## Cách nhanh: thuật toán Kadane

Đây là bài quy hoạch động nhỏ nhất bạn sẽ gặp. Quy hoạch động nghĩa là dùng đáp án của bài nhỏ hơn để tính bài lớn hơn.

Gọi `cur` là tổng lớn nhất của đoạn **kết thúc đúng tại** vị trí hiện tại. Tới số `x`, chỉ có hai lựa chọn:

- Nối `x` vào đoạn đang có: tổng là `cur + x`.
- Bỏ đoạn cũ, bắt đầu đoạn mới từ `x`: tổng là `x`.

Chọn cái lớn hơn. Nói cách khác: nếu đoạn cũ đang âm thì nó chỉ kéo tổng xuống, bỏ nó đi. Đáp án là giá trị `cur` lớn nhất từng thấy.

```csharp tab
int MaxSubArray(int[] nums)
{
    int cur = nums[0];
    int best = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        cur = Math.Max(nums[i], cur + nums[i]);
        best = Math.Max(best, cur);
    }
    return best;
}
```

```python tab
def max_sub_array(nums):
    cur = best = nums[0]
    for i in range(1, len(nums)):
        cur = max(nums[i], cur + nums[i])
        best = max(best, cur)
    return best
```

Chạy tay với `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`:

| i | x | cur + x | cur mới | best |
|---|---|---|---|---|
| 0 | -2 | | -2 | -2 |
| 1 | 1 | -1 | 1 (bắt đầu lại) | 1 |
| 2 | -3 | -2 | -2 | 1 |
| 3 | 4 | 2 | 4 (bắt đầu lại) | 4 |
| 4 | -1 | 3 | 3 | 4 |
| 5 | 2 | 5 | 5 | 5 |
| 6 | 1 | 6 | 6 | 6 |
| 7 | -5 | 1 | 1 | 6 |
| 8 | 4 | 5 | 5 | 6 |

Kết quả 6. Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(1)** vì chỉ giữ hai biến.

> **Lỗi hay gặp:** khởi tạo `best = 0` và `cur = 0`. Với mảng toàn số âm như `[-3, -1, -2]`, hàm trả về 0, nghĩa là chọn đoạn rỗng, trong khi đề bắt chọn ít nhất một phần tử. Luôn khởi tạo bằng `nums[0]`.

## Khi đi phỏng vấn

- Nói to định nghĩa của `cur`: "tổng lớn nhất của đoạn kết thúc tại i". Người phỏng vấn muốn nghe bạn đặt trạng thái cho quy hoạch động, chứ không phải thuộc lòng công thức.
- Hỏi lại: mảng rỗng thì sao? Code trên giả sử có ít nhất một phần tử. Nếu cần, thêm một dòng kiểm tra ở đầu hàm.

## Bài tập

Trả về vị trí bắt đầu và vị trí kết thúc của đoạn có tổng lớn nhất, để hệ thống highlight biết cắt video từ lượt nào tới lượt nào.

```text
Đầu vào: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Đầu ra:  [3, 6]
```

<details>
<summary>Xem đáp án</summary>

Ghi lại vị trí mỗi khi bắt đầu đoạn mới. Khi `cur` phá kỷ lục, lưu vị trí bắt đầu đó cùng vị trí hiện tại. Điều kiện `cur < 0` tương đương với `x > cur + x` ở bản gốc. Thời gian O(n), bộ nhớ O(1).

```csharp tab
int[] MaxSubArrayRange(int[] nums)
{
    int cur = nums[0], best = nums[0];
    int start = 0, bestStart = 0, bestEnd = 0;
    for (int i = 1; i < nums.Length; i++)
    {
        if (cur < 0)
        {
            cur = nums[i];
            start = i;
        }
        else
        {
            cur += nums[i];
        }
        if (cur > best)
        {
            best = cur;
            bestStart = start;
            bestEnd = i;
        }
    }
    return new[] { bestStart, bestEnd };
}
```

```python tab
def max_sub_array_range(nums):
    cur = best = nums[0]
    start = best_start = best_end = 0
    for i in range(1, len(nums)):
        if cur < 0:
            cur = nums[i]
            start = i
        else:
            cur += nums[i]
        if cur > best:
            best = cur
            best_start, best_end = start, i
    return [best_start, best_end]
```

</details>
