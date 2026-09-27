---
title: "Climbing Stairs: đếm số cách leo cầu thang"
description: "Leo n bậc, mỗi lần 1 hoặc 2 bậc, có bao nhiêu cách? Cách tìm công thức truy hồi, dựng bảng dp và rút gọn còn hai biến, giải bằng C# và Python."
section: "Quy hoạch động"
order: 13
difficulty: "Dễ"
tags: ["quy hoạch động", "bảng dp", "phỏng vấn"]
image: /images/docs/algorithms/climbing-stairs.webp
imageIdea: "Nhân vật anime trong game platformer đang nhảy lên tháp bậc đá, trên mỗi bậc có số đếm cách leo 1, 2, 3, 5, 8 phát sáng, nhân vật giơ tay đếm ngón."
imagePrompt: "Edit this image: the character is jumping up a stone staircase in a 2D platformer game, each step has a glowing number floating above it reading '1', '2', '3', '5', '8', and the character is counting on their fingers mid-jump. Keep the original art style, 16:9."
---

Cầu thang có `n` bậc. Mỗi lần bạn bước lên 1 bậc hoặc 2 bậc. Hỏi có bao nhiêu cách khác nhau để lên tới đỉnh.

```text
Đầu vào: n = 3
Đầu ra:  3   vì có ba cách: 1+1+1, 1+2, 2+1

Đầu vào: n = 5
Đầu ra:  8
```

**Trong game:** nhân vật nhảy lên một tháp bậc đá, mỗi cú nhảy 1 hoặc 2 bậc, và game muốn biết có bao nhiêu chuỗi nhảy khác nhau để trao thành tựu "thử hết mọi cách leo".

## Tìm công thức: nhìn vào bước cuối cùng

Người mới hay cố liệt kê hết các cách rồi đếm. Liệt kê thì dễ sót, và số cách tăng rất nhanh. Cách đúng là hỏi: bước cuối cùng lên đỉnh là bước nào?

- Nếu bước cuối là 1 bậc, trước đó bạn đứng ở bậc `n - 1`.
- Nếu bước cuối là 2 bậc, trước đó bạn đứng ở bậc `n - 2`.

Vậy `ways(n) = ways(n - 1) + ways(n - 2)`, với `ways(0) = 1` (đứng yên ở chân cầu thang là một cách) và `ways(1) = 1`. Đây chính là dãy Fibonacci lệch đi một vị trí.

## Cách thử hết: đệ quy thuần

```csharp tab
long Ways(int n)
{
    if (n <= 1) return 1;
    return Ways(n - 1) + Ways(n - 2);
}

Console.WriteLine(Ways(5)); // 8
```

```python tab
def ways(n):
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)

print(ways(5))  # 8
```

Đúng, nhưng cùng vấn đề với Fibonacci đệ quy: `ways(3)` bị tính nhiều lần. Thời gian **O(2^n)**, bộ nhớ **O(n)** cho ngăn xếp.

## Cách tối ưu: bảng dp

Tạo mảng `dp` với `dp[i]` là số cách lên tới bậc `i`. Điền từ bậc thấp lên cao, mỗi ô chỉ cần hai ô ngay trước nó.

```csharp tab
long Ways(int n)
{
    var dp = new long[n + 1];
    dp[0] = 1;
    for (int i = 1; i <= n; i++)
    {
        dp[i] = dp[i - 1];
        if (i >= 2) dp[i] += dp[i - 2];
    }
    return dp[n];
}

Console.WriteLine(Ways(3)); // 3
Console.WriteLine(Ways(5)); // 8
```

```python tab
def ways(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i - 1]
        if i >= 2:
            dp[i] += dp[i - 2]
    return dp[n]

print(ways(3))  # 3
print(ways(5))  # 8
```

Chạy tay với `n = 5`:

| Bậc i | dp[i - 1] | dp[i - 2] | dp[i] |
|---|---|---|---|
| 0 | | | 1 |
| 1 | 1 | không có | 1 |
| 2 | 1 | 1 | 2 |
| 3 | 2 | 1 | 3 |
| 4 | 3 | 2 | 5 |
| 5 | 5 | 3 | 8 |

Thời gian **O(n)**, bộ nhớ **O(n)**. Vì mỗi ô chỉ nhìn hai ô trước, có thể bỏ mảng và giữ hai biến như bài Fibonacci để bộ nhớ còn **O(1)**.

> **Lỗi hay gặp:** khai báo `new long[n]` thay vì `new long[n + 1]`. Bảng cần chỗ cho cả bậc 0 lẫn bậc `n`, thiếu một ô là gặp `IndexOutOfRangeException` ở C# hoặc `IndexError: list index out of range` ở Python khi đọc `dp[n]`.

> **Lỗi hay gặp:** đặt `ways(0) = 0`. Khi đó mọi kết quả đều sai. Ở chân cầu thang và không bước gì cũng là một cách, nên phải là 1.

## Khi đi phỏng vấn

- Nói to cách nghĩ "nhìn vào bước cuối" trước khi viết code. Đây là mẫu chung cho rất nhiều bài quy hoạch động: kết quả lớn dựng từ vài kết quả nhỏ hơn.
- Người phỏng vấn hay đổi đề: cho bước 1, 2 hoặc 3 bậc, hoặc có bậc bị gãy. Công thức chỉ đổi ở phần cộng, khung bảng dp giữ nguyên.

## Bài tập

Một số bậc đã gãy, không được đặt chân lên. Cho `n` và danh sách bậc gãy, đếm số cách lên đỉnh (ví dụ `n = 5`, bậc gãy `[2]` trả về 2: đi 0, 1, 3, 4, 5 hoặc 0, 1, 3, 5).

<details>
<summary>Xem đáp án</summary>

```csharp tab
long WaysWithBroken(int n, int[] broken)
{
    var isBroken = new HashSet<int>(broken);
    var dp = new long[n + 1];
    dp[0] = 1;
    for (int i = 1; i <= n; i++)
    {
        if (isBroken.Contains(i)) continue;
        dp[i] = dp[i - 1];
        if (i >= 2) dp[i] += dp[i - 2];
    }
    return dp[n];
}

Console.WriteLine(WaysWithBroken(5, new[] { 2 })); // 2
```

```python tab
def ways_with_broken(n, broken):
    is_broken = set(broken)
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        if i in is_broken:
            continue
        dp[i] = dp[i - 1]
        if i >= 2:
            dp[i] += dp[i - 2]
    return dp[n]

print(ways_with_broken(5, [2]))  # 2
```

</details>
