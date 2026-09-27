---
title: "Move Zeroes: dồn số 0 về cuối mảng tại chỗ"
description: "Dồn mọi số 0 về cuối mảng mà vẫn giữ thứ tự các số còn lại, không tạo mảng mới: dùng hai con trỏ đọc và ghi O(n), giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 10
difficulty: "Dễ"
tags: ["mảng", "hai con trỏ", "tại chỗ", "phỏng vấn"]
image: /images/docs/algorithms/move-zeroes.webp
imageIdea: "Nhân vật anime mở giao diện kho đồ lộn xộn có ô trống xen giữa, bấm nút 'Sort', các món đồ trượt sang trái theo đúng thứ tự cũ còn ô trống dồn hết về cuối hàng."
imagePrompt: "Edit this image: the character presses a big 'Sort' button on a floating game inventory panel. A row of item slots shows potions, a sword and a shield sliding to the left in order, while empty slots gather at the right end. Keep the original art style, 16:9."
---

Cho một mảng số nguyên. Dồn mọi số 0 về cuối mảng, các số khác 0 giữ nguyên thứ tự ban đầu. Phải làm **tại chỗ**, tức là sửa ngay trên mảng đã cho, không tạo mảng mới.

```text
Đầu vào: nums = [0, 1, 0, 3, 12]
Sau khi gọi: nums = [1, 3, 12, 0, 0]
```

**Trong game:** kho đồ có các ô trống xen giữa (số 0). Nút "Sắp xếp" dồn đồ lên đầu theo đúng thứ tự nhặt, ô trống xuống cuối. Kho đồ nằm trong bộ nhớ của người chơi, không nên tạo bản sao mỗi lần bấm.

## Cách dễ nghĩ: mảng phụ

Tạo mảng mới, chép các số khác 0 vào trước, phần còn lại để 0, rồi chép ngược về mảng gốc.

```csharp tab
void MoveZeroes(int[] nums)
{
    var result = new int[nums.Length];
    int k = 0;
    foreach (int x in nums)
        if (x != 0) result[k++] = x;
    Array.Copy(result, nums, nums.Length);
}
```

```python tab
def move_zeroes(nums):
    non_zero = [x for x in nums if x != 0]
    nums[:] = non_zero + [0] * (len(nums) - len(non_zero))
```

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(n)**. Kết quả đúng, nhưng vi phạm yêu cầu tại chỗ.

## Cách tối ưu: con trỏ đọc và con trỏ ghi

Dùng hai biến vị trí:

- `read` đi qua từng phần tử.
- `write` chỉ vào ô tiếp theo sẽ nhận một số khác 0.

Mỗi khi `read` gặp số khác 0, đổi chỗ `nums[read]` với `nums[write]`, rồi tăng `write`. Các số 0 bị đổi dần về phía sau. Vì `write` không bao giờ vượt `read`, thứ tự các số khác 0 được giữ nguyên.

```csharp tab
void MoveZeroes(int[] nums)
{
    int write = 0;
    for (int read = 0; read < nums.Length; read++)
    {
        if (nums[read] != 0)
        {
            (nums[write], nums[read]) = (nums[read], nums[write]);
            write++;
        }
    }
}
```

```python tab
def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

Dòng `(nums[write], nums[read]) = (nums[read], nums[write]);` là cách đổi chỗ hai phần tử bằng tuple trong C#, không cần biến tạm. Python viết tương tự.

Chạy tay với `[0, 1, 0, 3, 12]`:

| read | nums[read] | write trước | Việc làm | Mảng sau bước |
|---|---|---|---|---|
| 0 | 0 | 0 | bỏ qua | [0, 1, 0, 3, 12] |
| 1 | 1 | 0 | đổi ô 0 và ô 1, write = 1 | [1, 0, 0, 3, 12] |
| 2 | 0 | 1 | bỏ qua | [1, 0, 0, 3, 12] |
| 3 | 3 | 1 | đổi ô 1 và ô 3, write = 2 | [1, 3, 0, 0, 12] |
| 4 | 12 | 2 | đổi ô 2 và ô 4, write = 3 | [1, 3, 12, 0, 0] |

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(1)**.

> **Lỗi hay gặp:** xóa số 0 ngay trong lúc duyệt Python, kiểu `for x in nums: if x == 0: nums.remove(x)`. Xóa phần tử làm các phần tử sau dồn lên, vòng lặp nhảy qua mất một phần tử, nên với `[0, 0, 1]` bạn vẫn còn sót số 0. C# thì chặn luôn: sửa `List` trong `foreach` văng `InvalidOperationException: Collection was modified`. Lỗi thứ hai hay gặp ở Python là viết `nums = ...` trong hàm: lệnh này chỉ gán lại biến cục bộ, mảng của người gọi không đổi. Muốn sửa tại chỗ phải gán qua `nums[:] = ...` hoặc gán từng ô.

## Khi đi phỏng vấn

- Nói ra bất biến của vòng lặp: mọi ô trước `write` đều khác 0 và đúng thứ tự. Đây là cách chứng minh code đúng mà người phỏng vấn thích nghe.
- Nếu được hỏi cách giảm số lần ghi: chỉ đổi chỗ khi `read != write`. Mảng không có số 0 nào thì không phải ghi lần nào.

## Bài tập

Xóa mọi phần tử bằng `val` khỏi mảng tại chỗ và trả về số phần tử còn lại `k`. `k` ô đầu của mảng phải chứa các phần tử được giữ lại; thứ tự của chúng và phần sau ô `k` không quan trọng. Trong game: vứt hết một loại đồ rác khỏi kho.

```text
Đầu vào: nums = [3, 2, 2, 3], val = 3
Đầu ra:  2, và nums bắt đầu bằng [2, 2]
```

<details>
<summary>Xem đáp án</summary>

Cùng khuôn đọc và ghi: chép phần tử khác `val` vào vị trí `write`. Không cần đổi chỗ vì phần sau `k` không quan trọng. Thời gian O(n), bộ nhớ O(1).

```csharp tab
int RemoveElement(int[] nums, int val)
{
    int write = 0;
    for (int read = 0; read < nums.Length; read++)
    {
        if (nums[read] != val)
        {
            nums[write] = nums[read];
            write++;
        }
    }
    return write;
}
```

```python tab
def remove_element(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write
```

</details>
