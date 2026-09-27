---
title: "Best Time to Buy and Sell Stock: mua một lần, bán một lần lời nhất"
description: "Chọn ngày mua và ngày bán để lời nhiều nhất: từ thử mọi cặp ngày O(n²) tới giữ giá thấp nhất đã gặp O(n), giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 7
difficulty: "Dễ"
tags: ["mảng", "một lần duyệt", "phỏng vấn"]
image: /images/docs/algorithms/best-time-to-buy-sell.webp
imageIdea: "Nhân vật anime là thương nhân ở chợ trong game, đứng trước bảng giá 'Trứng Rồng' vẽ đường lên xuống theo ngày, một tay cắm cờ xanh ở đáy thấp nhất, tay kia cắm cờ đỏ ở đỉnh phía sau."
imagePrompt: "Edit this image: the character is a merchant at a fantasy market, standing next to a large chalkboard price chart titled 'Dragon Egg' with a zigzag line over 6 days. They pin a green flag labeled 'BUY' at the lowest point and a red flag labeled 'SELL' at a later peak. Keep the original art style, 16:9."
---

Cho mảng `prices`, `prices[i]` là giá một món hàng vào ngày `i`. Bạn được mua đúng một lần và bán đúng một lần, ngày bán phải sau ngày mua. Trả về tiền lời lớn nhất. Không có cách nào lời thì trả về 0.

```text
Đầu vào: prices = [7, 1, 5, 3, 6, 4]
Đầu ra:  5    mua ngày 1 giá 1, bán ngày 4 giá 6

Đầu vào: prices = [7, 6, 4, 3, 1]
Đầu ra:  0    giá chỉ giảm, không mua là tốt nhất
```

**Trong game:** giá Trứng Rồng ở chợ người chơi lên xuống mỗi ngày. Tính năng "phân tích giá" cho người chơi biết nếu mua bán một lần trong tuần qua thì lời nhất được bao nhiêu vàng.

## Cách thử hết: mọi cặp ngày mua, ngày bán

Chọn ngày mua `i`, thử mọi ngày bán `j` sau nó, giữ lại khoản lời lớn nhất.

```csharp tab
int MaxProfit(int[] prices)
{
    int best = 0;
    for (int i = 0; i < prices.Length; i++)
        for (int j = i + 1; j < prices.Length; j++)
            best = Math.Max(best, prices[j] - prices[i]);
    return best;
}
```

```python tab
def max_profit(prices):
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best
```

Độ phức tạp: thời gian **O(n²)**, bộ nhớ **O(1)**. Dữ liệu giá mỗi phút trong một năm là khoảng 500.000 điểm, tức hơn 100 tỉ cặp.

## Cách nhanh: nhớ giá thấp nhất đã qua

Đổi góc nhìn: đứng ở ngày `j` và giả sử bán hôm nay. Muốn lời nhất thì phải mua vào ngày rẻ nhất **trước** hôm nay. Vậy chỉ cần nhớ một con số: giá thấp nhất từ đầu tới giờ.

Mỗi ngày làm hai việc:

- Giá hôm nay thấp hơn giá thấp nhất đã biết thì cập nhật giá thấp nhất.
- Ngược lại thì tính lời nếu bán hôm nay, so với kỷ lục.

```csharp tab
int MaxProfit(int[] prices)
{
    int minPrice = int.MaxValue;
    int best = 0;
    foreach (int p in prices)
    {
        if (p < minPrice)
            minPrice = p;
        else
            best = Math.Max(best, p - minPrice);
    }
    return best;
}
```

```python tab
def max_profit(prices):
    min_price = float("inf")
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        else:
            best = max(best, p - min_price)
    return best
```

`int.MaxValue` và `float("inf")` là giá trị khởi đầu "lớn hơn mọi giá", để ngày đầu tiên luôn trở thành giá thấp nhất.

Chạy tay với `[7, 1, 5, 3, 6, 4]`:

| Ngày | Giá | Giá thấp nhất sau bước | Lời nếu bán hôm nay | Kỷ lục |
|---|---|---|---|---|
| 0 | 7 | 7 | không tính | 0 |
| 1 | 1 | 1 | không tính | 0 |
| 2 | 5 | 1 | 4 | 4 |
| 3 | 3 | 1 | 2 | 4 |
| 4 | 6 | 1 | 5 | 5 |
| 5 | 4 | 1 | 3 | 5 |

Kết quả 5. Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(1)**. Không cần thêm bảng băm hay mảng phụ nào, chỉ hai biến.

> **Lỗi hay gặp:** lấy giá lớn nhất trừ giá nhỏ nhất của cả mảng. Với `[7, 1, 5, 3, 6, 4]`, cách đó cho ra 7 − 1 = 6, nhưng giá 7 ở ngày 0, **trước** ngày giá 1. Bạn đang bán trước khi mua. Thứ tự thời gian là điều kiện quan trọng nhất của bài.

## Khi đi phỏng vấn

- Giải thích ý tưởng bằng câu "nếu bán hôm nay thì nên mua ngày nào?". Câu này cho thấy bạn biến bài hai biến thành bài một biến.
- Bài này là bước đệm cho Maximum Subarray: nếu đổi mảng giá thành mảng chênh lệch giữa hai ngày liên tiếp, đáp án chính là tổng lớn nhất của một đoạn liên tiếp.

## Bài tập

Vẫn mảng giá đó, nhưng giờ được mua bán **bao nhiêu lần cũng được**, miễn là không giữ hai món cùng lúc (phải bán món đang giữ rồi mới mua món khác). Trả về tổng lời lớn nhất.

```text
Đầu vào: prices = [7, 1, 5, 3, 6, 4]
Đầu ra:  7    mua 1 bán 5 (lời 4), mua 3 bán 6 (lời 3)

Đầu vào: prices = [1, 2, 3, 4, 5]
Đầu ra:  4
```

<details>
<summary>Xem đáp án</summary>

Mỗi lần giá ngày sau cao hơn ngày trước, cộng phần chênh lệch vào. Một đợt tăng dài 1 đến 5 bằng tổng các bước tăng nhỏ 1 lên 2, 2 lên 3, và cứ thế. Thời gian O(n), bộ nhớ O(1).

```csharp tab
int MaxProfitManyTrades(int[] prices)
{
    int total = 0;
    for (int i = 1; i < prices.Length; i++)
        if (prices[i] > prices[i - 1])
            total += prices[i] - prices[i - 1];
    return total;
}
```

```python tab
def max_profit_many_trades(prices):
    total = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            total += prices[i] - prices[i - 1]
    return total
```

</details>
