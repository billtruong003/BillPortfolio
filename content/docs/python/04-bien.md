---
title: "Biến trong Python"
description: "Biến trong Python là gì, cách gán và đổi giá trị, gán nhiều biến trên một dòng và quy tắc đặt tên biến theo kiểu snake_case."
section: "Cơ bản"
order: 4
tags: ["biến", "gán", "snake_case"]
image: /images/docs/python/bien.webp
imageIdea: "Nhân vật anime cầm máy dán nhãn, dán tấm nhãn 'gold = 250' lên một túi tiền và 'hp = 100' lên một bình thuốc đỏ trên kệ."
imagePrompt: "Edit this image: the character is using a label maker, sticking a tag reading 'gold = 250' onto a coin pouch and another tag reading 'hp = 100' onto a red potion bottle on a shelf. Keep the original art style, 16:9."
---

Biến là cái tên gắn vào một giá trị để dùng lại về sau. Máu nhân vật, số vàng, tên người chơi: mỗi thứ nằm trong một biến. Python tạo biến ngay lúc bạn gán giá trị lần đầu, không cần khai báo trước.

## Tạo biến bằng phép gán

Người đã học C# hay viết thêm kiểu dữ liệu trước tên biến, kiểu `int hp = 100`. Python không có cú pháp đó và sẽ báo `SyntaxError`. Chỉ cần tên, dấu `=`, rồi giá trị:

```python
hp = 100
player_name = "Aki"
move_speed = 5.5
is_alive = True
```

Dấu `=` ở đây là **gán**, không phải "bằng" như trong toán. Đọc `hp = 100` là "cho `hp` giữ giá trị 100".

## Đổi giá trị

Gán lại thì giá trị cũ bị thay.

```python
hp = 100
hp = 80          # trúng đòn
hp = hp + 15     # uống bình máu
print(hp)        # 95
```

Dòng `hp = hp + 15` làm theo thứ tự: tính vế phải trước (`80 + 15`), rồi mới gán kết quả vào `hp`.

Viết ngắn hơn bằng toán tử gán kết hợp:

```python
gold = 200
gold += 50   # nhặt được túi vàng
gold -= 120  # mua kiếm
print(gold)  # 130
```

`gold += 50` giống hệt `gold = gold + 50`. Có đủ `+=`, `-=`, `*=`, `/=`.

> **Lỗi hay gặp:** dùng biến trước khi gán. `print(mana)` khi chưa có dòng `mana = ...` nào sẽ báo `NameError: name 'mana' is not defined`. Lỗi này cũng hiện ra khi bạn gõ sai chính tả, ví dụ gán `score` rồi in `scroe`.

## Biến có thể đổi kiểu

Trong C#, biến kiểu `int` thì mãi là `int`. Python cho phép gán một giá trị khác kiểu vào cùng biến:

```python
reward = 100
reward = "Kiếm lửa"
print(reward)  # Kiếm lửa
```

Chạy được, nhưng đừng làm vậy trong code thật. Chỗ khác đang tưởng `reward` là số sẽ hỏng khi đem nó đi cộng. Một biến nên giữ một loại dữ liệu từ đầu tới cuối.

## Gán nhiều biến trên một dòng

Gán nhiều giá trị cho nhiều biến, theo đúng thứ tự:

```python
hp, mana, stamina = 100, 50, 80
print(hp, mana, stamina)  # 100 50 80
```

Gán cùng một giá trị cho nhiều biến:

```python
kills = deaths = assists = 0
print(kills, deaths, assists)  # 0 0 0
```

Cách viết trên một dòng còn dùng để đổi chỗ hai biến mà không cần biến tạm:

```python
main_weapon = "Kiếm"
sub_weapon = "Cung"
main_weapon, sub_weapon = sub_weapon, main_weapon
print(main_weapon, sub_weapon)  # Cung Kiếm
```

Số biến bên trái phải bằng số giá trị bên phải. `hp, mana = 100, 50, 80` báo `ValueError: too many values to unpack (expected 2)`.

## Quy tắc đặt tên

Luật bắt buộc, sai là lỗi:

- Chỉ gồm chữ, số và dấu `_`. Không có dấu cách, không có dấu gạch nối: `move-speed` bị Python hiểu là `move` trừ `speed`.
- Không bắt đầu bằng số: `player1` được, `1player` thì báo `SyntaxError`.
- Phân biệt hoa thường: `hp` và `HP` là hai biến khác nhau.
- Không dùng từ khóa như `if`, `for`, `class`, `True`, `None`.

Quy ước của cộng đồng Python (PEP 8, bộ quy tắc viết code chính thức) là **snake_case**: chữ thường, nối các từ bằng gạch dưới.

```python
enemy_count = 12      # đúng quy ước
max_hp = 100          # đúng quy ước
enemyCount = 12       # chạy được, nhưng đây là kiểu C#
```

Hằng số, tức giá trị bạn không định đổi, viết hoa toàn bộ:

```python
MAX_LEVEL = 99
START_GOLD = 500
```

Python không chặn bạn gán lại `MAX_LEVEL`. Chữ hoa chỉ là lời nhắc cho người đọc code rằng đừng đụng vào.

Đặt tên nói lên ý nghĩa. `enemy_count` dễ hiểu hơn `n`, `boss_hp` dễ hiểu hơn `x2`. Bài tiếp theo xem biến có thể giữ [những kiểu dữ liệu nào](/docs/python/kieu-du-lieu).

## Bài tập

Tạo biến cho một con quái Slime: tên "Slime", máu 30, tốc độ 1.5, chưa bị hạ. Gán tên, máu, tốc độ trên cùng một dòng. Cho nó mất 12 máu bằng `-=` rồi in máu còn lại.

<details>
<summary>Xem đáp án</summary>

```python
enemy_name, enemy_hp, enemy_speed = "Slime", 30, 1.5
is_defeated = False

enemy_hp -= 12
print(enemy_name, "còn", enemy_hp, "máu")  # Slime còn 18 máu
```

</details>
