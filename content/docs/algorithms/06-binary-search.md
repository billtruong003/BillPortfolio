---
title: "Binary Search: tìm nhị phân trong mảng đã sắp xếp"
description: "Tìm một số trong mảng đã sắp xếp bằng cách chia đôi mỗi bước: từ tìm tuần tự O(n) tới tìm nhị phân O(log n), kèm hai lỗi kinh điển, giải bằng C# và Python."
section: "Tìm kiếm và sắp xếp"
order: 6
difficulty: "Dễ"
tags: ["tìm nhị phân", "mảng", "phỏng vấn"]
image: /images/docs/algorithms/binary-search.webp
imageIdea: "Nhân vật anime đứng trong thang máy của một dungeon 100 tầng, màn hình hiện tầng 50, tay cầm tấm bản đồ ghi 'Boss: cao hơn?', đang phân vân bấm nút lên hay xuống."
imagePrompt: "Edit this image: the character stands inside a fantasy dungeon elevator with a floor display reading '50 / 100'. They hold a map with a note 'Boss: higher?' and hover a finger between an 'UP' and a 'DOWN' button. Keep the original art style, 16:9."
---

Cho một mảng số nguyên đã sắp xếp tăng dần, các phần tử khác nhau, và một số `target`. Trả về vị trí của `target` trong mảng, không có thì trả về `-1`.

```text
Đầu vào: nums = [-1, 0, 3, 5, 9, 12], target = 9
Đầu ra:  4

Đầu vào: nums = [-1, 0, 3, 5, 9, 12], target = 2
Đầu ra:  -1
```

**Trong game:** bảng xếp hạng một triệu người chơi đã sắp xếp theo điểm. Người chơi gõ một mức điểm để xem có ai đạt đúng mức đó không.

## Cách thử hết: tìm tuần tự

Đi từ đầu tới cuối, gặp thì trả về.

```csharp tab
int Search(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
        if (nums[i] == target)
            return i;
    return -1;
}
```

```python tab
def search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1
```

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(1)**. Cách này bỏ phí một thông tin quý: mảng đã được sắp xếp.

## Cách nhanh: chia đôi mỗi bước

Nhìn phần tử ở giữa đoạn đang xét. Nó bằng `target` thì xong. Nó nhỏ hơn `target` thì cả nửa trái đều nhỏ hơn, bỏ nửa trái. Nó lớn hơn thì bỏ nửa phải. Mỗi bước loại một nửa, nên mảng một triệu phần tử chỉ cần khoảng 20 bước.

Dùng hai biến `lo` và `hi` đánh dấu đoạn còn phải tìm, tính cả hai đầu.

```csharp tab
int Search(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

```python tab
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

Chạy tay với `target = 9`:

| Bước | lo | hi | mid | nums[mid] | Việc làm |
|---|---|---|---|---|---|
| 1 | 0 | 5 | 2 | 3 | 3 < 9, bỏ nửa trái, lo = 3 |
| 2 | 3 | 5 | 4 | 9 | bằng, trả về 4 |

Với `target = 2`: bước 1 có mid = 2, `3 > 2` nên hi = 1. Bước 2 có mid = 0, `-1 < 2` nên lo = 1. Bước 3 có mid = 1, `0 < 2` nên lo = 2. Lúc này lo lớn hơn hi, vòng lặp dừng, trả về `-1`.

Độ phức tạp: thời gian **O(log n)**, bộ nhớ **O(1)**.

## Hai lỗi kinh điển

> **Lỗi hay gặp:** tính `mid = (lo + hi) / 2` trong C#. Kiểu `int` chỉ chứa được tới 2.147.483.647. Khi mảng rất lớn, `lo + hi` vượt mức đó và bị tràn số thành số âm, rồi `nums[mid]` văng `IndexOutOfRangeException`. Viết `lo + (hi - lo) / 2` thì không bao giờ tràn. Python dùng số nguyên không giới hạn nên không tràn, nhưng cứ viết cùng một kiểu cho quen tay.

> **Lỗi hay gặp:** viết `lo = mid` thay vì `lo = mid + 1` khi dùng `while (lo <= hi)`. Khi `lo == hi` và `nums[mid] < target`, `mid` chính bằng `lo`, gán `lo = mid` không đổi gì, vòng lặp chạy mãi và chương trình treo. Quy tắc: điều kiện `lo <= hi` thì cả hai đầu phải nhảy qua `mid` (`mid + 1` và `mid - 1`).

## Khi đi phỏng vấn

- Nói rõ đoạn tìm kiếm là đóng hai đầu `[lo, hi]` hay nửa mở `[lo, hi)`, rồi giữ đúng một kiểu từ đầu tới cuối. Phần lớn lỗi tìm nhị phân đến từ việc trộn hai kiểu.
- Biết hàm có sẵn: `Array.BinarySearch` trong C# (không thấy thì trả về số âm, không phải `-1` cố định) và module `bisect` trong Python. Nhưng khi được hỏi, vẫn phải tự viết được.

## Bài tập

Bảng `exp` lưu lượng kinh nghiệm cần để lên từng cấp, đã sắp xếp tăng dần. Tìm vị trí **đầu tiên** có giá trị lớn hơn hoặc bằng `target`. Nếu mọi phần tử đều nhỏ hơn thì trả về độ dài mảng.

```text
Đầu vào: exp = [100, 300, 600, 1000], target = 450
Đầu ra:  2

Đầu vào: exp = [100, 300, 600, 1000], target = 5000
Đầu ra:  4
```

<details>
<summary>Xem đáp án</summary>

Dùng đoạn nửa mở `[lo, hi)`. Khi `exp[mid] >= target` thì `mid` có thể là đáp án, nên giữ nó lại bằng `hi = mid`. Thời gian O(log n), bộ nhớ O(1).

```csharp tab
int LowerBound(int[] exp, int target)
{
    int lo = 0, hi = exp.Length;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (exp[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```

```python tab
def lower_bound(exp, target):
    lo, hi = 0, len(exp)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if exp[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

</details>
