---
title: "If else trong Python"
description: "Câu lệnh điều kiện trong Python: if, elif, else, viết điều kiện gọn một dòng và lệnh match cơ bản có từ Python 3.10 trở đi."
section: "Điều khiển luồng"
order: 14
tags: ["if", "elif", "else", "match", "điều kiện"]
image: /images/docs/python/if-else.webp
imageIdea: "Nhân vật anime đứng ở ngã ba trong rừng, ba tấm biển gỗ chỉ ba hướng ghi 'if hp > 70', 'elif hp > 30', 'else', nhân vật nhìn thanh máu trên đầu mình để chọn đường."
imagePrompt: "Edit this image: the character stands at a three-way fork in a forest path. Three wooden signposts point in different directions reading 'if hp > 70', 'elif hp > 30', and 'else'. A small health bar floats above the character's head. Keep the original art style, 16:9."
---

Câu lệnh `if` cho chương trình chọn đường: điều kiện đúng thì làm việc này, sai thì làm việc khác. Quái hết máu thì cho biến mất, đủ vàng thì cho mua đồ, bấm phím nào thì làm hành động đó.

## if

```python
hp = 0
if hp <= 0:
    print("Game over")  # Game over
```

Cú pháp gồm từ `if`, điều kiện, dấu `:`, rồi khối lệnh thụt vào 4 dấu cách. Điều kiện là bất kỳ thứ gì ra `True` hay `False`, xem [Bool và toán tử](/docs/python/bool-va-toan-tu).

> **Lỗi hay gặp:** quên dấu `:` cuối dòng `if`. Python báo `SyntaxError: expected ':'`. Còn quên thụt lề thì báo `IndentationError`, xem lại [Cú pháp Python](/docs/python/cu-phap).

## else

`else` chạy khi điều kiện của `if` sai:

```python
gold = 120
sword_price = 250

if gold >= sword_price:
    gold -= sword_price
    print("Đã mua kiếm")
else:
    print(f"Thiếu {sword_price - gold} vàng")  # Thiếu 130 vàng
```

## elif

Có nhiều trường hợp thì dùng `elif` (viết tắt của "else if"). Python kiểm tra từ trên xuống, gặp điều kiện đúng đầu tiên thì chạy khối đó và **bỏ qua tất cả phần còn lại**.

```python
hp = 45

if hp > 70:
    print("Khỏe")
elif hp > 30:
    print("Bị thương")  # Bị thương
elif hp > 0:
    print("Nguy kịch")
else:
    print("Đã gục")
```

`hp = 45` cũng lớn hơn 0, nhưng dòng "Nguy kịch" không in vì `hp > 30` đã đúng trước.

Chỗ người mới hay sai là đặt điều kiện rộng lên trước:

```python
score = 950

if score >= 500:
    rank = "B"
elif score >= 900:
    rank = "A"   # không bao giờ tới được
print(rank)      # B
```

950 lớn hơn 500 nên dừng ở nhánh đầu, không bao giờ xét tới 900. Sắp điều kiện từ hẹp tới rộng: `>= 900` trước, `>= 500` sau.

Một lỗi khác là dùng nhiều `if` riêng rẽ khi các trường hợp loại trừ nhau:

```python
hp = 80
if hp > 70:
    print("Khỏe")
if hp > 30:
    print("Bị thương")
# Khỏe
# Bị thương
```

Cả hai `if` đều được kiểm tra độc lập, nên in cả hai dòng. Đổi `if` thứ hai thành `elif` là đúng.

## if lồng nhau

Đặt `if` trong `if` được, nhưng lồng sâu khó đọc. Thường gộp bằng `and` sẽ gọn hơn:

```python
has_key = True
level = 12

# lồng nhau
if has_key:
    if level >= 10:
        print("Mở cổng")

# gộp lại, cùng kết quả
if has_key and level >= 10:
    print("Mở cổng")
```

## Điều kiện một dòng

Khi chỉ cần chọn một trong hai giá trị, viết gọn trên một dòng:

```python
hp = 15
status = "Nguy kịch" if hp < 20 else "Ổn"
print(status)  # Nguy kịch
```

Đọc là: `status` bằng "Nguy kịch" nếu `hp < 20`, không thì bằng "Ổn". Chỉ dùng cho trường hợp ngắn, dài quá thì quay về `if else` bình thường.

## match (Python 3.10 trở lên)

Khi so một giá trị với nhiều giá trị cố định, chuỗi `elif` dài dòng. `match` gọn hơn:

```python
command = "attack"

match command:
    case "attack":
        print("Vung kiếm!")  # Vung kiếm!
    case "defend":
        print("Giơ khiên")
    case "run" | "flee":
        print("Bỏ chạy")
    case _:
        print("Lệnh không hợp lệ")
```

- Mỗi `case` là một giá trị để so.
- `|` gộp nhiều giá trị vào một `case`: gõ "run" hay "flee" đều bỏ chạy.
- `case _:` bắt mọi trường hợp còn lại, giống `else`.
- Khớp `case` nào thì chạy `case` đó rồi thoát, không rơi xuống `case` sau.

`match` làm được nhiều hơn thế (tách tuple, list, dict), nhưng so giá trị như trên là đủ dùng cho người mới. Máy chạy Python cũ hơn 3.10 sẽ báo `SyntaxError` ở dòng `match`.

## Bài tập

Viết chương trình xếp hạng theo điểm: từ 1000 trở lên là "S", từ 800 là "A", từ 500 là "B", còn lại là "C". Thử với `score = 820`. Sau đó dùng `match` để in phần thưởng: S được "Rương vàng", A được "Rương bạc", các hạng khác được "Bình máu".

<details>
<summary>Xem đáp án</summary>

```python
score = 820

if score >= 1000:
    rank = "S"
elif score >= 800:
    rank = "A"
elif score >= 500:
    rank = "B"
else:
    rank = "C"

match rank:
    case "S":
        reward = "Rương vàng"
    case "A":
        reward = "Rương bạc"
    case _:
        reward = "Bình máu"

print(rank, reward)  # A Rương bạc
```

</details>
