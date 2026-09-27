---
title: "Dictionary trong Python"
description: "Dictionary trong Python lưu dữ liệu theo cặp khóa và giá trị: tạo dict, đọc bằng get, duyệt với items(), và tránh lỗi KeyError."
section: "Collection"
order: 13
tags: ["dictionary", "dict", "get", "items", "KeyError"]
image: /images/docs/python/dictionary.webp
imageIdea: "Nhân vật anime đứng sau quầy tiệm đồ, sau lưng là tủ nhiều ngăn kéo, mỗi ngăn dán nhãn tên món ('Kiếm', 'Khiên', 'Bình máu') và thẻ giá treo bên cạnh."
imagePrompt: "Edit this image: the character is a shopkeeper behind a counter. Behind them is a wooden cabinet with many drawers, each drawer labeled with an item name like 'sword', 'shield', 'potion', with a small price tag hanging next to each. Keep the original art style, 16:9."
---

Dictionary (gọi tắt là `dict`) lưu dữ liệu theo từng cặp **khóa: giá trị**. Thay vì nhớ "máu nằm ở vị trí số 1" như với list, bạn gọi thẳng tên: `stats["hp"]`. Chỉ số của nhân vật, bảng giá tiệm đồ, số lượng từng món trong kho: đều hợp với dict.

## Tạo dict và đọc giá trị

```python
hero = {
    "name": "Aki",
    "hp": 120,
    "gold": 350,
}

print(hero["name"])  # Aki
print(hero["hp"])    # 120
print(len(hero))     # 3
```

Khóa thường là chuỗi, nhưng cũng có thể là số hay [tuple](/docs/python/tuple). Giá trị thì là gì cũng được, kể cả list hay dict khác.

## Thêm và sửa

Gán vào một khóa: khóa đã có thì sửa, chưa có thì thêm mới.

```python
hero["hp"] = 90         # sửa
hero["level"] = 5       # thêm
print(hero)
# {'name': 'Aki', 'hp': 90, 'gold': 350, 'level': 5}
```

Một dict không có hai khóa trùng nhau. Gán lại cùng khóa là ghi đè.

Xóa bằng `del` hoặc `pop`:

```python
del hero["level"]
gold = hero.pop("gold")
print(gold)  # 350
print(hero)  # {'name': 'Aki', 'hp': 90}
```

## KeyError và cách dùng get

Chỗ hay gãy nhất: đọc một khóa không tồn tại.

```python
prices = {"Kiếm": 250, "Khiên": 180}
print(prices["Cung"])
# KeyError: 'Cung'
```

> **Lỗi hay gặp:** `KeyError` khi khóa không có trong dict, hoặc khi gõ sai hoa thường: `prices["kiếm"]` khác `prices["Kiếm"]`. Lỗi này làm dừng cả chương trình.

Có hai cách an toàn. Cách thứ nhất, hỏi trước bằng `in`:

```python
if "Cung" in prices:
    print(prices["Cung"])
else:
    print("Tiệm không bán cung")  # Tiệm không bán cung
```

Cách thứ hai gọn hơn là `get`. Không có khóa thì trả về `None`, hoặc trả về giá trị mặc định bạn đưa vào:

```python
print(prices.get("Cung"))       # None
print(prices.get("Cung", 0))    # 0
print(prices.get("Kiếm", 0))    # 250
```

`get` với giá trị mặc định rất tiện để đếm:

```python
kill_log = ["Slime", "Goblin", "Slime", "Slime"]
kill_count = {}
for monster in kill_log:
    kill_count[monster] = kill_count.get(monster, 0) + 1

print(kill_count)  # {'Slime': 3, 'Goblin': 1}
```

Lần đầu gặp Slime, `get` trả về 0, cộng 1 thành 1. Các lần sau lấy số cũ ra cộng tiếp.

## Duyệt dict

Ba method trả về ba góc nhìn khác nhau:

```python
stock = {"Bình máu": 5, "Bình mana": 2, "Mũi tên": 40}

print(list(stock.keys()))    # ['Bình máu', 'Bình mana', 'Mũi tên']
print(list(stock.values()))  # [5, 2, 40]
print(list(stock.items()))   # [('Bình máu', 5), ('Bình mana', 2), ('Mũi tên', 40)]
```

Dùng nhiều nhất là `items()` trong [vòng lặp for](/docs/python/vong-lap-for), kết hợp với unpacking để lấy cả khóa lẫn giá trị:

```python
for item, amount in stock.items():
    print(f"{item}: {amount}")
# Bình máu: 5
# Bình mana: 2
# Mũi tên: 40
```

Từ Python 3.7, dict giữ đúng thứ tự bạn thêm khóa vào. Duyệt ra theo thứ tự đó.

Không được thêm hay xóa khóa trong lúc đang duyệt chính dict đó. Python báo `RuntimeError: dictionary changed size during iteration`. Muốn xóa các món hết hàng, duyệt trên một bản sao:

```python
for item, amount in list(stock.items()):
    if amount < 3:
        del stock[item]
print(stock)  # {'Bình máu': 5, 'Mũi tên': 40}
```

## Dict lồng nhau

Dữ liệu game thường có nhiều tầng. Dict chứa dict là cách lưu phổ biến, giống cấu trúc file JSON (xem [Đọc ghi file](/docs/python/doc-ghi-file)):

```python
monsters = {
    "slime": {"hp": 30, "gold": 5},
    "orc": {"hp": 120, "gold": 40},
}

print(monsters["orc"]["hp"])  # 120
monsters["slime"]["hp"] -= 10
print(monsters["slime"])      # {'hp': 20, 'gold': 5}
```

## Bài tập

Tiệm có bảng giá `{"Kiếm": 250, "Khiên": 180, "Bình máu": 30}`. Người chơi có 300 vàng và muốn mua `["Khiên", "Bình máu", "Cung"]`. Tính tổng tiền các món tiệm có bán, in ra món nào không bán, rồi in vàng còn lại nếu đủ tiền.

<details>
<summary>Xem đáp án</summary>

```python
prices = {"Kiếm": 250, "Khiên": 180, "Bình máu": 30}
gold = 300
cart = ["Khiên", "Bình máu", "Cung"]

total = 0
for item in cart:
    if item in prices:
        total += prices[item]
    else:
        print(f"Tiệm không bán {item}")  # Tiệm không bán Cung

print(total)  # 210
if gold >= total:
    gold -= total
    print(f"Còn {gold} vàng")  # Còn 90 vàng
```

</details>
