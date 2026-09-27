---
title: "Fibonacci: đệ quy, ghi nhớ và vòng lặp"
description: "Tính số Fibonacci thứ n theo ba cách: đệ quy thuần O(2^n), đệ quy có ghi nhớ (memo) và vòng lặp O(n). Bài mở đầu cho quy hoạch động, giải bằng C# và Python."
section: "Quy hoạch động"
order: 12
difficulty: "Dễ"
tags: ["quy hoạch động", "đệ quy", "memo", "phỏng vấn"]
image: /images/docs/algorithms/fibonacci-de-quy-va-memo.webp
imageIdea: "Nhân vật anime chăm trại thỏ trong game nông trại, chuồng thỏ đông dần theo từng tháng, tay cầm cuốn sổ ghi dãy 1, 1, 2, 3, 5, 8 với vẻ mặt hoảng hốt."
imagePrompt: "Edit this image: the character is a farmer in a cozy farming game, surrounded by more and more rabbits spilling out of a wooden hutch, holding a notebook with the numbers '1, 1, 2, 3, 5, 8' written on it and looking panicked. Keep the original art style, 16:9."
---

Dãy Fibonacci bắt đầu bằng 0 và 1, mỗi số sau bằng tổng hai số liền trước. Viết hàm trả về số thứ `n` của dãy. Bài này dễ, nhưng người phỏng vấn dùng nó để xem bạn có nhận ra việc tính lặp lại hay không.

```text
Đầu vào: n = 10
Đầu ra:  55   vì dãy là 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
```

**Trong game:** bảng kinh nghiệm lên cấp tăng theo Fibonacci, level `n` cần `F(n)` lần lượng XP gốc, nên game phải tính nhanh `F(n)` cho mọi level.

## Cách thử hết: đệ quy thuần

Viết thẳng theo định nghĩa: `F(n) = F(n - 1) + F(n - 2)`. Code rất ngắn và đúng.

```csharp tab
long Fib(int n)
{
    if (n <= 1) return n;
    return Fib(n - 1) + Fib(n - 2);
}

Console.WriteLine(Fib(10)); // 55
```

```python tab
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))  # 55
```

Vấn đề nằm ở chỗ tính đi tính lại. Gọi `Fib(5)` thì `Fib(3)` bị tính 2 lần, `Fib(2)` bị tính 3 lần. Mỗi lần gọi lại tách thành hai lần gọi nữa, nên số lần gọi gần như gấp đôi mỗi khi `n` tăng 1. Với `n = 40` là hơn 300 triệu lần gọi.

Độ phức tạp: thời gian **O(2^n)**, bộ nhớ **O(n)** cho ngăn xếp đệ quy.

## Cách tốt hơn: ghi nhớ kết quả (memo)

Nếu `F(3)` đã tính rồi thì lưu lại, lần sau lấy ra dùng. Kỹ thuật này gọi là memo (memoization, ghi nhớ): trước khi tính, xem trong bảng đã có chưa.

```csharp tab
long Fib(int n, Dictionary<int, long> memo)
{
    if (n <= 1) return n;
    if (memo.TryGetValue(n, out long cached)) return cached;
    long result = Fib(n - 1, memo) + Fib(n - 2, memo);
    memo[n] = result;
    return result;
}

Console.WriteLine(Fib(50, new Dictionary<int, long>())); // 12586269025
```

```python tab
def fib(n, memo):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

print(fib(50, {}))  # 12586269025
```

Mỗi giá trị từ 2 tới `n` chỉ tính đúng một lần. Thời gian **O(n)**, bộ nhớ **O(n)** cho bảng và ngăn xếp. Trong Python có thể thay cả bảng bằng `@functools.cache` đặt trên hàm.

> **Lỗi hay gặp:** gọi bản memo với `n = 5000` trong Python sẽ gặp `RecursionError: maximum recursion depth exceeded`, vì Python mặc định chỉ cho đệ quy sâu khoảng 1000 tầng. Memo sửa được chuyện tính lặp, không sửa được chuyện đệ quy quá sâu.

## Cách gọn nhất: vòng lặp từ dưới lên

Thay vì đi từ `n` xuống, đi từ 0 lên. Mỗi bước chỉ cần hai số cuối, nên giữ hai biến là đủ.

```csharp tab
long Fib(int n)
{
    long a = 0, b = 1;
    for (int i = 0; i < n; i++)
        (a, b) = (b, a + b);
    return a;
}

Console.WriteLine(Fib(10)); // 55
```

```python tab
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib(10))  # 55
```

Chạy tay với `n = 6`:

| Sau vòng thứ | a | b |
|---|---|---|
| 0 (ban đầu) | 0 | 1 |
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 3 |
| 4 | 3 | 5 |
| 5 | 5 | 8 |
| 6 | 8 | 13 |

Kết quả `a = 8`. Thời gian **O(n)**, bộ nhớ **O(1)**. Cách đi từ bài toán nhỏ lên bài toán lớn này là ý chính của quy hoạch động.

> **Lỗi hay gặp:** dùng `int` trong C#. `F(47) = 2971215073` đã vượt `int.MaxValue`, kết quả bị tràn thành số âm mà không báo lỗi gì. Dùng `long` thì chạy được tới `F(92)`. Python không bị vì số nguyên không giới hạn.

## Khi đi phỏng vấn

- Viết bản đệ quy thuần trước, rồi tự chỉ ra chỗ tính lặp bằng cách vẽ cây lời gọi của `F(5)`. Đó là lý do để chuyển sang memo.
- Nói rõ hai hướng: memo là từ trên xuống (top-down), vòng lặp là từ dưới lên (bottom-up). Hỏi thêm `n` lớn cỡ nào để chọn kiểu số và tránh tràn.

## Bài tập

Dãy Tribonacci: `T(0) = 0`, `T(1) = 1`, `T(2) = 1`, mỗi số sau bằng tổng **ba** số liền trước. Viết hàm tính `T(n)` bằng vòng lặp (ví dụ `T(4) = 4` vì dãy là 0, 1, 1, 2, 4).

<details>
<summary>Xem đáp án</summary>

```csharp tab
long Trib(int n)
{
    long a = 0, b = 1, c = 1;
    for (int i = 0; i < n; i++)
        (a, b, c) = (b, c, a + b + c);
    return a;
}

Console.WriteLine(Trib(4)); // 4
```

```python tab
def trib(n):
    a, b, c = 0, 1, 1
    for _ in range(n):
        a, b, c = b, c, a + b + c
    return a

print(trib(4))  # 4
```

</details>
