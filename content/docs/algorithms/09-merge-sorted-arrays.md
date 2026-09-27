---
title: "Merge Sorted Arrays: gộp hai mảng đã sắp xếp"
description: "Gộp hai mảng đã sắp xếp thành một mảng vẫn sắp xếp: từ nối rồi sắp xếp lại O((n+m) log(n+m)) tới hai con trỏ O(n+m), giải bằng C# và Python."
section: "Tìm kiếm và sắp xếp"
order: 9
difficulty: "Dễ"
tags: ["mảng", "hai con trỏ", "sắp xếp", "phỏng vấn"]
image: /images/docs/algorithms/merge-sorted-arrays.webp
imageIdea: "Nhân vật anime làm trọng tài đứng giữa hai cổng dịch chuyển ghi 'Server A' và 'Server B', mỗi cổng có một hàng người chơi xếp theo điểm, nhân vật chỉ tay gọi từng người vào một hàng chung duy nhất."
imagePrompt: "Edit this image: the character acts as a referee standing between two glowing portals labeled 'Server A' and 'Server B'. From each portal comes a line of small players holding score cards in ascending order. The character points, calling them one by one into a single merged line. Keep the original art style, 16:9."
---

Cho hai mảng số nguyên `a` và `b`, mỗi mảng đã sắp xếp tăng dần. Trả về một mảng mới chứa mọi phần tử của cả hai, vẫn sắp xếp tăng dần.

```text
Đầu vào: a = [1, 3, 5], b = [2, 4, 6, 8]
Đầu ra:  [1, 2, 3, 4, 5, 6, 8]
```

**Trong game:** hai server gộp làm một. Bảng xếp hạng của mỗi server đã sắp theo điểm, cần ghép thành một bảng chung mà không phải sắp xếp lại từ đầu.

## Cách dễ nghĩ: nối rồi sắp xếp lại

Đổ cả hai mảng vào một mảng rồi gọi hàm sắp xếp có sẵn. C# 12 có cú pháp `[..a, ..b]` để nối mảng.

```csharp tab
int[] Merge(int[] a, int[] b)
{
    int[] all = [..a, ..b];
    Array.Sort(all);
    return all;
}
```

```python tab
def merge(a, b):
    return sorted(a + b)
```

Độ phức tạp: thời gian **O((n + m) log(n + m))**, với n và m là độ dài hai mảng. Code đúng, nhưng bỏ phí việc hai mảng đã được sắp xếp sẵn.

## Cách nhanh: hai con trỏ

Phần tử nhỏ nhất của kết quả chắc chắn là `a[0]` hoặc `b[0]`. Lấy cái nhỏ hơn, dời con trỏ bên đó lên một ô, rồi lại so hai phần tử đang đứng đầu. Giống hai hàng người chơi đứng trước cổng: trọng tài chỉ cần nhìn hai người đứng đầu hai hàng.

Khi một mảng đã hết, phần còn lại của mảng kia chép thẳng vào cuối, vì nó đã sắp xếp sẵn và lớn hơn mọi thứ đã lấy.

```csharp tab
int[] Merge(int[] a, int[] b)
{
    var result = new int[a.Length + b.Length];
    int i = 0, j = 0, k = 0;
    while (i < a.Length && j < b.Length)
    {
        if (a[i] <= b[j]) result[k++] = a[i++];
        else result[k++] = b[j++];
    }
    while (i < a.Length) result[k++] = a[i++];
    while (j < b.Length) result[k++] = b[j++];
    return result;
}
```

```python tab
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```

`result[k++] = a[i++]` trong C# nghĩa là: gán `a[i]` vào `result[k]`, rồi tăng cả `i` và `k` thêm 1.

Chạy tay với `a = [1, 3, 5]`, `b = [2, 4, 6, 8]`:

| Bước | a[i] | b[j] | Lấy | result sau bước |
|---|---|---|---|---|
| 1 | 1 | 2 | 1 từ a | [1] |
| 2 | 3 | 2 | 2 từ b | [1, 2] |
| 3 | 3 | 4 | 3 từ a | [1, 2, 3] |
| 4 | 5 | 4 | 4 từ b | [1, 2, 3, 4] |
| 5 | 5 | 6 | 5 từ a | [1, 2, 3, 4, 5] |
| 6 | hết | 6 | chép phần còn lại của b | [1, 2, 3, 4, 5, 6, 8] |

Độ phức tạp: thời gian **O(n + m)** vì mỗi phần tử được lấy đúng một lần, bộ nhớ **O(n + m)** cho mảng kết quả.

Dùng `<=` thay vì `<` khi so sánh giúp hai phần tử bằng nhau giữ đúng thứ tự: phần tử của `a` đứng trước. Tính chất này gọi là sắp xếp ổn định, rất quan trọng khi hai người chơi bằng điểm và người của server A đăng ký trước.

> **Lỗi hay gặp:** quên hai vòng lặp chép phần còn lại. Vòng lặp chính dừng ngay khi một mảng hết, nên số 6 và 8 ở ví dụ trên sẽ biến mất. Bản C# không báo lỗi gì cả, chỉ trả về mảng có hai số 0 ở cuối, vì mảng `int` mới tạo mặc định toàn số 0. Lỗi kiểu này rất khó thấy nếu không chạy thử.

## Khi đi phỏng vấn

- Gộp hai mảng đã sắp xếp là bước chính của Merge Sort. Biết bài này thì chỉ còn thiếu phần chia đôi mảng là viết được Merge Sort.
- Hỏi lại đề: trả về mảng mới hay phải gộp tại chỗ vào một trong hai mảng? Phiên bản gộp tại chỗ nằm ngay ở bài tập dưới đây.

## Bài tập

Mảng `nums1` có độ dài `m + n`: `m` phần tử đầu đã sắp xếp, `n` ô cuối là 0 để chừa chỗ. Mảng `nums2` có `n` phần tử đã sắp xếp. Gộp `nums2` vào `nums1` **tại chỗ**, không tạo mảng mới.

```text
Đầu vào: nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3
Sau khi gọi: nums1 = [1, 2, 2, 3, 5, 6]
```

<details>
<summary>Xem đáp án</summary>

Điền từ **cuối** mảng về đầu, lấy phần tử lớn hơn trước. Chỗ trống ở cuối `nums1` đủ để không bao giờ ghi đè lên phần tử chưa xét. Khi `nums2` hết thì phần còn lại của `nums1` đã nằm đúng chỗ. Thời gian O(m + n), bộ nhớ O(1).

```csharp tab
void MergeInPlace(int[] nums1, int m, int[] nums2, int n)
{
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0)
    {
        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
        else nums1[k--] = nums2[j--];
    }
}
```

```python tab
def merge_in_place(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
```

</details>
