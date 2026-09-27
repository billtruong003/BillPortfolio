---
title: "Ép kiểu trong Python"
description: "Đổi giá trị từ kiểu này sang kiểu khác trong Python với int(), float(), str(), vì sao input() luôn trả về str và cách xử lý ValueError."
section: "Cơ bản"
order: 7
tags: ["ép kiểu", "int", "str", "input", "ValueError"]
image: /images/docs/python/ep-kieu.webp
imageIdea: "Nhân vật anime đứng cạnh một cái máy biến hình kiểu lò rèn: bỏ tờ giấy ghi '\"100\"' vào một đầu, đầu kia rơi ra đồng xu khắc số 100."
imagePrompt: "Edit this image: the character is operating a small magical forge machine. On one side they insert a paper note reading '\"100\"', and on the other side a shiny coin engraved with '100' pops out. A sign on the machine reads 'int()'. Keep the original art style, 16:9."
---

Ép kiểu là đổi một giá trị sang kiểu khác: chuỗi `"100"` thành số `100`, số `250` thành chuỗi `"250"`. Việc này xảy ra liên tục khi bạn nhận dữ liệu từ người chơi, đọc file cấu hình, hay ghép số vào câu thông báo.

## Ba hàm ép kiểu hay dùng

| Hàm | Đổi sang | Ví dụ | Kết quả |
|---|---|---|---|
| `int()` | số nguyên | `int("42")` | `42` |
| `float()` | số thực | `float("1.5")` | `1.5` |
| `str()` | chuỗi | `str(250)` | `"250"` |

```python
gold_text = "350"
gold = int(gold_text)
print(gold + 50)  # 400
```

Không có `int()` ở giữa, `gold_text + 50` sẽ báo `TypeError` vì không cộng chuỗi với số được.

## int() cắt bỏ phần thập phân

Chỗ người mới hay nghĩ sai: `int(7.9)` không làm tròn thành 8.

```python
print(int(7.9))   # 7
print(int(-7.9))  # -7
```

`int()` cắt bỏ phần sau dấu chấm, đi về phía số 0. Muốn làm tròn thì dùng `round()` như ở bài [Số trong Python](/docs/python/so).

Một chi tiết nữa: `int()` đọc được chuỗi số nguyên, nhưng không đọc được chuỗi có dấu chấm.

```python
print(int("15"))          # 15
print(int(float("15.7"))) # 15
int("15.7")
# ValueError: invalid literal for int() with base 10: '15.7'
```

Chuỗi `"15.7"` phải qua `float()` trước rồi mới `int()` được.

## str() để ghép vào câu

```python
score = 1200
message = "Điểm của bạn: " + str(score)
print(message)  # Điểm của bạn: 1200
```

Cách này chạy được nhưng dài. Trong thực tế f-string gọn hơn nhiều: `f"Điểm của bạn: {score}"`. Xem ở bài [Chuỗi trong Python](/docs/python/chuoi).

## Ép sang bool

`bool()` trả về `False` cho số 0, chuỗi rỗng, `None`, và `True` cho hầu hết thứ còn lại.

```python
print(bool(0))     # False
print(bool(35))    # True
print(bool(""))    # False
print(bool("0"))   # True
```

`bool("0")` ra `True` vì chuỗi đó không rỗng, nó có một ký tự. Bài [Bool và toán tử](/docs/python/bool-va-toan-tu) nói kỹ hơn.

## input() luôn trả về str

`input()` dừng chương trình, đợi người dùng gõ rồi Enter, và trả lại những gì họ gõ. Điểm quan trọng: kết quả **luôn là chuỗi**, kể cả khi người ta gõ số.

```python
bet = input("Cược bao nhiêu vàng? ")
print(type(bet))  # <class 'str'>
print(bet * 2)    # gõ 50 thì in ra 5050
```

`"50" * 2` là lặp chuỗi hai lần, nên ra `5050` chứ không phải `100`. Chương trình không báo lỗi, chỉ lặng lẽ tính sai.

Cách đúng là ép kiểu ngay khi nhận:

```python
bet = int(input("Cược bao nhiêu vàng? "))
print(bet * 2)  # gõ 50 thì in ra 100
```

> **Lỗi hay gặp:** người dùng gõ chữ thay vì số. `int(input(...))` mà nhận `"năm mươi"` hay để trống sẽ báo `ValueError: invalid literal for int() with base 10: 'năm mươi'`. Chương trình dừng luôn.

## Xử lý ValueError

Có hai cách phòng. Cách thứ nhất là kiểm tra trước bằng `isdigit()`, trả về `True` nếu chuỗi chỉ chứa chữ số:

```python
text = input("Số bình máu muốn mua: ")
if text.isdigit():
    amount = int(text)
    print("Mua", amount, "bình")
else:
    print("Hãy nhập một số nguyên dương")
```

`isdigit()` không nhận số âm hay số có dấu chấm, nên hợp với số lượng món đồ.

Cách thứ hai là cứ thử ép, lỗi thì bắt lại:

```python
text = input("Số bình máu muốn mua: ")
try:
    amount = int(text)
    print("Mua", amount, "bình")
except ValueError:
    print("Hãy nhập một số nguyên")
```

Cách này tổng quát hơn. Bài [try except](/docs/python/try-except) giải thích chi tiết.

## Bài tập

Viết chương trình hỏi người chơi số vàng hiện có và giá một món đồ. In ra mua được bao nhiêu món. Nếu người chơi gõ không phải số, in "Nhập sai".

<details>
<summary>Xem đáp án</summary>

```python
gold_text = input("Vàng hiện có: ")
price_text = input("Giá một món: ")

if gold_text.isdigit() and price_text.isdigit() and int(price_text) > 0:
    gold = int(gold_text)
    price = int(price_text)
    print("Mua được", gold // price, "món")
else:
    print("Nhập sai")

# Gõ 500 và 120 thì in: Mua được 4 món
```

Kiểm tra `int(price_text) > 0` để tránh chia cho 0.

</details>
