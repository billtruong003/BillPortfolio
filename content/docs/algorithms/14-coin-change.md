---
title: "Coin Change: đổi tiền bằng ít đồng xu nhất"
description: "Tìm số đồng xu ít nhất để ghép đúng một số tiền: vì sao cách tham lam sai, cách dựng bảng dp và xử lý trường hợp không đổi được, giải bằng C# và Python."
section: "Quy hoạch động"
order: 14
difficulty: "Trung bình"
tags: ["quy hoạch động", "bảng dp", "phỏng vấn"]
image: /images/docs/algorithms/coin-change.webp
imageIdea: "Nhân vật anime đứng trước máy đổi tiền trong một khu trò chơi fantasy, màn hình máy ghi 11 vàng, nhân vật đang xếp các đồng xu 5, 5, 1 thành ba chồng gọn gàng."
imagePrompt: "Edit this image: the character stands in front of a fantasy arcade coin exchange machine whose screen reads '11 GOLD', carefully arranging three coins labeled '5', '5' and '1' on the counter with a satisfied smile. Keep the original art style, 16:9."
---

Cho danh sách mệnh giá đồng xu và một số tiền. Mỗi mệnh giá dùng bao nhiêu lần cũng được. Tìm số đồng xu **ít nhất** để ghép đúng số tiền đó. Nếu không ghép được thì trả về `-1`.

```text
Đầu vào: coins = [1, 2, 5], amount = 11
Đầu ra:  3    vì 11 = 5 + 5 + 1

Đầu vào: coins = [2], amount = 3
Đầu ra:  -1   vì chỉ có đồng 2 thì không ghép được số lẻ
```

**Trong game:** máy đổi tiền trong game phải trả người chơi 11 vàng với các đồng 1, 2, 5, và nhà thiết kế muốn trả bằng ít đồng nhất để túi đồ không bị đầy.

## Cách sai hay gặp: lấy đồng lớn nhất trước

Ý nghĩ đầu tiên là tham lam: cứ lấy đồng lớn nhất còn vừa. Với `[1, 2, 5]` cách này tình cờ đúng. Nhưng thử `coins = [1, 3, 4]`, `amount = 6`:

- Tham lam: lấy 4, còn 2, lấy 1, lấy 1. Tổng cộng **3** đồng.
- Đáp án thật: 3 + 3, chỉ **2** đồng.

Chọn đồng lớn trước có thể chặn mất cách tốt hơn ở phía sau. Muốn chắc đúng thì phải xét mọi lựa chọn, và cách xét mọi lựa chọn mà không tính lặp là bảng dp.

## Cách thử hết: đệ quy

Để ghép số tiền `a`, thử lấy từng đồng `c`, phần còn lại `a - c` lại là một bài y hệt nhưng nhỏ hơn.

```csharp tab
int MinCoins(int[] coins, int amount)
{
    if (amount == 0) return 0;
    int best = -1;
    foreach (int c in coins)
    {
        if (c > amount) continue;
        int rest = MinCoins(coins, amount - c);
        if (rest != -1 && (best == -1 || rest + 1 < best))
            best = rest + 1;
    }
    return best;
}

Console.WriteLine(MinCoins(new[] { 1, 3, 4 }, 6)); // 2
```

```python tab
def min_coins(coins, amount):
    if amount == 0:
        return 0
    best = -1
    for c in coins:
        if c > amount:
            continue
        rest = min_coins(coins, amount - c)
        if rest != -1 and (best == -1 or rest + 1 < best):
            best = rest + 1
    return best

print(min_coins([1, 3, 4], 6))  # 2
```

Cùng một số tiền nhỏ bị tính lại vô số lần. Với `amount = 50` và đồng 1 trong danh sách, chương trình chạy mãi không xong. Thời gian cỡ **O(k^amount)** với `k` là số mệnh giá.

## Cách tối ưu: bảng dp

`dp[a]` là số đồng ít nhất để ghép số tiền `a`. Bắt đầu với `dp[0] = 0`, các ô khác đặt một giá trị "vô cực". Với mỗi `a` từ 1 lên, thử từng đồng `c`: nếu dùng `c` là đồng cuối, cần `dp[a - c] + 1` đồng.

```csharp tab
int CoinChange(int[] coins, int amount)
{
    int inf = amount + 1;
    var dp = new int[amount + 1];
    Array.Fill(dp, inf);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        foreach (int c in coins)
            if (c <= a && dp[a - c] + 1 < dp[a])
                dp[a] = dp[a - c] + 1;
    return dp[amount] == inf ? -1 : dp[amount];
}

Console.WriteLine(CoinChange(new[] { 1, 2, 5 }, 11)); // 3
Console.WriteLine(CoinChange(new[] { 2 }, 3));        // -1
```

```python tab
def coin_change(coins, amount):
    inf = amount + 1
    dp = [inf] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] == inf else dp[amount]

print(coin_change([1, 2, 5], 11))  # 3
print(coin_change([2], 3))         # -1
```

Bảng `dp` sau khi chạy với `[1, 2, 5]`, `amount = 11`:

| a | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dp[a] | 0 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 3 | 3 | 2 | 3 |

Ví dụ ô 11: dùng đồng 1 thì cần `dp[10] + 1 = 3`, đồng 2 thì `dp[9] + 1 = 4`, đồng 5 thì `dp[6] + 1 = 3`. Nhỏ nhất là 3.

Trường hợp không đổi được: ô nào không có đồng nào dẫn tới thì giữ nguyên "vô cực". Cuối cùng nếu `dp[amount]` vẫn là vô cực thì trả `-1`.

Độ phức tạp: thời gian **O(amount × k)**, bộ nhớ **O(amount)**.

> **Lỗi hay gặp:** dùng `int.MaxValue` làm vô cực trong C#. Khi đó `dp[a - c] + 1` bị tràn thành số âm rất nhỏ, phép so sánh `<` cho là "tốt hơn" và bảng sai hết. Dùng `amount + 1` là đủ, vì không cách nào cần nhiều hơn `amount` đồng.

## Khi đi phỏng vấn

- Đưa ra phản ví dụ `[1, 3, 4]`, `6` để giải thích vì sao tham lam sai. Người phỏng vấn thường chờ đúng câu này.
- Nói rõ ý nghĩa của một ô trong bảng trước khi viết code: "`dp[a]` là số đồng ít nhất để ghép `a`". Định nghĩa ô rõ thì công thức tự ra.

## Bài tập

Đếm **số cách** ghép đúng số tiền (không tính thứ tự, 2 + 1 và 1 + 2 là một cách). Ví dụ `coins = [1, 2, 5]`, `amount = 5` trả về 4: 5, 2+2+1, 2+1+1+1, 1+1+1+1+1.

<details>
<summary>Xem đáp án</summary>

Vòng ngoài phải là đồng xu, vòng trong là số tiền. Đảo hai vòng sẽ đếm cả thứ tự, ra 9 thay vì 4.

```csharp tab
long CountWays(int[] coins, int amount)
{
    var dp = new long[amount + 1];
    dp[0] = 1;
    foreach (int c in coins)
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}

Console.WriteLine(CountWays(new[] { 1, 2, 5 }, 5)); // 4
```

```python tab
def count_ways(coins, amount):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]

print(count_ways([1, 2, 5], 5))  # 4
```

</details>
