---
title: "Bool và toán tử trong Python"
description: "Kiểu bool trong Python, các phép so sánh, toán tử and, or, not và cách Python coi một giá trị bất kỳ là truthy hay falsy."
section: "Cơ bản"
order: 9
tags: ["bool", "so sánh", "and", "or", "truthy"]
image: /images/docs/python/bool-va-toan-tu.webp
imageIdea: "Nhân vật anime đứng trước cánh cổng lâu đài có hai ổ khóa, tay cầm chìa khóa ghi 'has_key' và thẻ ghi 'level >= 10', trên cổng khắc chữ 'and'."
imagePrompt: "Edit this image: the character stands in front of a castle gate with two locks. They hold a key tagged 'has_key' in one hand and a badge reading 'level >= 10' in the other. The word 'and' is carved above the gate. Keep the original art style, 16:9."
---

`bool` là kiểu chỉ có hai giá trị `True` và `False`. Mọi câu hỏi có hoặc không trong game đều ra `bool`: nhân vật còn sống không, có chìa khóa chưa, đủ vàng mua đồ chưa. Những giá trị này là đầu vào cho câu lệnh [if](/docs/python/if-else) và [vòng lặp while](/docs/python/vong-lap-while).

## Toán tử so sánh

| Toán tử | Ý nghĩa | Ví dụ | Kết quả |
|---|---|---|---|
| `==` | bằng | `5 == 5` | `True` |
| `!=` | khác | `5 != 3` | `True` |
| `>` | lớn hơn | `10 > 20` | `False` |
| `<` | nhỏ hơn | `10 < 20` | `True` |
| `>=` | lớn hơn hoặc bằng | `10 >= 10` | `True` |
| `<=` | nhỏ hơn hoặc bằng | `0 <= -1` | `False` |

```python
hp = 0
gold = 300
sword_price = 250

print(hp <= 0)              # True
print(gold >= sword_price)  # True
```

> **Lỗi hay gặp:** viết `=` khi muốn so sánh. `if hp = 0:` báo `SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?`. Một dấu bằng là gán, hai dấu bằng là so sánh.

Python cho viết so sánh nối tiếp, đọc giống toán:

```python
level = 15
print(10 <= level <= 20)  # True, level nằm trong khoảng 10 tới 20
```

So sánh chuỗi thì phân biệt hoa thường: `"Aki" == "aki"` ra `False`.

## and, or, not

Ghép nhiều điều kiện lại:

- `and`: đúng khi **cả hai** đều đúng.
- `or`: đúng khi **ít nhất một** đúng.
- `not`: đảo ngược đúng thành sai và sai thành đúng.

```python
has_key = True
level = 12

can_open_gate = has_key and level >= 10
print(can_open_gate)  # True

is_poisoned = False
is_burning = True
takes_damage = is_poisoned or is_burning
print(takes_damage)  # True

is_alive = True
print(not is_alive)  # False
```

Người mới hay viết `if is_alive == True:`. Chạy được nhưng thừa. `is_alive` đã là `bool` rồi, viết `if is_alive:` là đủ. Tương tự, `if is_alive == False:` nên viết `if not is_alive:`.

## Thứ tự tính

`not` tính trước, rồi `and`, cuối cùng `or`. Khi trộn cả ba, dùng ngoặc cho rõ:

```python
is_boss = True
hp = 50
has_shield = False

# Boss dưới 100 máu, hoặc bất kỳ quái nào không có khiên
can_stun = (is_boss and hp < 100) or not has_shield
print(can_stun)  # True
```

Không có ngoặc Python vẫn tính đúng, nhưng người đọc code sau sẽ phải dừng lại nghĩ.

## Dừng sớm

`and` và `or` dừng lại ngay khi đã biết kết quả. Với `and`, vế trái sai thì vế phải không được tính. Điều này giúp tránh lỗi:

```python
players = 0
total_score = 0

# players == 0 nên Python không tính total_score / players
if players > 0 and total_score / players > 100:
    print("Đội mạnh")
```

Đổi thứ tự hai vế thì dính `ZeroDivisionError`.

## Truthy và falsy

Chỗ hay gây bất ngờ: `if` nhận được mọi giá trị chứ không riêng gì `bool`. Python tự coi mỗi giá trị là "giống đúng" (truthy) hoặc "giống sai" (falsy).

Các giá trị falsy:

- `False`, `None`
- số `0`, `0.0`
- chuỗi rỗng `""`
- list, tuple, set, dict rỗng: `[]`, `()`, `set()`, `{}`

Mọi thứ còn lại là truthy.

```python
inventory = []
if inventory:
    print("Có đồ trong túi")
else:
    print("Túi rỗng")  # Túi rỗng

player_name = "Aki"
if player_name:
    print(f"Chào {player_name}")  # Chào Aki
```

`if inventory:` là cách viết quen thuộc của Python để hỏi "list có phần tử nào không", thay cho `if len(inventory) > 0:`.

Cẩn thận với số 0. Nếu `gold = 0` là một giá trị hợp lệ, thì `if gold:` sẽ coi nó như "không có". Khi muốn phân biệt `0` với `None`, viết rõ `if gold is not None:`.

## Bài tập

Một người chơi được vào hầm ngục nếu: level từ 20 trở lên **và** có vé, **hoặc** là admin. Viết biểu thức với `level = 18`, `has_ticket = True`, `is_admin = False` rồi in kết quả. Đổi `is_admin` thành `True` và in lại.

<details>
<summary>Xem đáp án</summary>

```python
level = 18
has_ticket = True
is_admin = False

can_enter = (level >= 20 and has_ticket) or is_admin
print(can_enter)  # False

is_admin = True
can_enter = (level >= 20 and has_ticket) or is_admin
print(can_enter)  # True
```

</details>
