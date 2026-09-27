---
title: "Kiểu dữ liệu trong Python"
description: "Các kiểu dữ liệu cơ bản trong Python: int, float, str, bool, None, và cách dùng type() để biết một giá trị thuộc kiểu gì."
section: "Cơ bản"
order: 5
tags: ["kiểu dữ liệu", "int", "str", "bool", "None", "type"]
image: /images/docs/python/kieu-du-lieu.webp
imageIdea: "Nhân vật anime đứng trước năm ô kệ phân loại vật phẩm, mỗi ô dán nhãn int, float, str, bool, None; ô None trống trơn và nhân vật gãi đầu nhìn nó."
imagePrompt: "Edit this image: the character stands in front of a sorting shelf with five compartments labeled 'int', 'float', 'str', 'bool', 'None'. Coins in int, a measuring cup in float, a scroll in str, a light switch in bool, and the None box is empty while the character scratches their head. Keep the original art style, 16:9."
---

Mỗi giá trị trong Python đều thuộc một kiểu dữ liệu. Kiểu quyết định bạn làm được gì với giá trị đó: số thì cộng trừ được, chuỗi thì ghép được, còn đem số cộng với chuỗi thì Python báo lỗi.

## Năm kiểu cơ bản

| Kiểu | Ý nghĩa | Ví dụ |
|---|---|---|
| `int` | số nguyên | `100`, `-5`, `0` |
| `float` | số thực, có phần thập phân | `5.5`, `0.25`, `3.0` |
| `str` | chuỗi ký tự | `"Aki"`, `'Slime'` |
| `bool` | đúng hoặc sai | `True`, `False` |
| `NoneType` | không có giá trị | `None` |

```python
gold = 250             # int
crit_rate = 0.15       # float
hero_name = "Aki"      # str
is_boss = False        # bool
equipped_weapon = None # chưa trang bị gì
```

Python tự biết kiểu từ giá trị bạn gán, bạn không phải viết ra.

## Xem kiểu bằng type()

Không chắc một biến đang giữ kiểu gì thì hỏi `type()`:

```python
print(type(250))       # <class 'int'>
print(type(0.15))      # <class 'float'>
print(type("Aki"))     # <class 'str'>
print(type(False))     # <class 'bool'>
print(type(None))      # <class 'NoneType'>
```

`type()` hữu ích nhất khi đang tìm lỗi. Ví dụ bạn tưởng biến là số mà nó lại là chuỗi, `type()` cho biết ngay.

## int và float

Chỗ người mới hay nhầm: `3` và `3.0` trông giống nhau nhưng khác kiểu.

```python
print(type(3))    # <class 'int'>
print(type(3.0))  # <class 'float'>
print(3 == 3.0)   # True
```

So sánh thì bằng nhau, nhưng kiểu thì khác. Phép chia `/` luôn trả về `float` kể cả khi chia hết:

```python
total_gold = 300
players = 3
share = total_gold / players
print(share)        # 100.0
print(type(share))  # <class 'float'>
```

`int` trong Python không có giới hạn độ lớn, khác với C#. Điểm số tới hàng tỷ tỷ cũng không bị tràn. Bài [Số trong Python](/docs/python/so) nói kỹ hơn về phép toán.

## str

Chuỗi đặt trong nháy đơn hoặc nháy kép, hai cách như nhau:

```python
title = "Hiệp sĩ"
item = 'Bình máu'
```

Dùng nháy kép khi trong chuỗi có nháy đơn, và ngược lại:

```python
line = "Boss nói: 'Ngươi không qua được đâu'"
print(line)  # Boss nói: 'Ngươi không qua được đâu'
```

Số nằm trong nháy là chuỗi, không phải số: `"100"` là `str`, không cộng với `100` được.

> **Lỗi hay gặp:** cộng chuỗi với số.
> ```python
> print("Vàng: " + 250)
> # TypeError: can only concatenate str (not "int") to str
> ```
> Dùng dấu phẩy `print("Vàng:", 250)`, hoặc đổi số sang chuỗi `"Vàng: " + str(250)`. Bài [Ép kiểu](/docs/python/ep-kieu) và [Chuỗi](/docs/python/chuoi) có cách gọn hơn.

## bool

`bool` chỉ có hai giá trị: `True` và `False`, viết hoa chữ đầu. Viết `true` thường sẽ báo `NameError`.

```python
is_alive = True
has_key = False
print(is_alive)  # True
```

Kết quả của phép so sánh là `bool`:

```python
hp = 0
print(hp <= 0)        # True
print(type(hp <= 0))  # <class 'bool'>
```

Bài [Bool và toán tử](/docs/python/bool-va-toan-tu) dùng kiểu này nhiều.

## None

`None` nghĩa là "chưa có gì". Nó khác `0` và khác chuỗi rỗng `""`: `0` vàng vẫn là có số vàng, còn `None` là chưa biết hoặc chưa gán.

```python
target = None       # chưa khóa mục tiêu nào
print(target)       # None
print(target is None)  # True
```

Kiểm tra `None` thì dùng `is None`, không dùng `== None`. Cả hai đều chạy, nhưng `is None` là cách viết chuẩn của Python.

## Bài tập

Tạo bốn biến cho một món đồ: tên "Khiên sắt", giá 120, độ bền 0.85, có thể bán hay không (có). Thêm biến `owner` chưa có chủ. In kiểu của từng biến.

<details>
<summary>Xem đáp án</summary>

```python
item_name = "Khiên sắt"
price = 120
durability = 0.85
can_sell = True
owner = None

print(type(item_name))   # <class 'str'>
print(type(price))       # <class 'int'>
print(type(durability))  # <class 'float'>
print(type(can_sell))    # <class 'bool'>
print(type(owner))       # <class 'NoneType'>
```

</details>
