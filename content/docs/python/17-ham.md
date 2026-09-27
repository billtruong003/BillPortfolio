---
title: "Hàm trong Python"
description: "Hàm trong Python: định nghĩa bằng def, trả kết quả với return, tham số mặc định, gọi hàm bằng keyword arguments và phạm vi biến."
section: "Hàm"
order: 17
tags: ["hàm", "def", "return", "tham số"]
image: /images/docs/python/ham.webp
imageIdea: "Nhân vật anime vận hành một cỗ máy rèn vũ khí: bỏ vào phễu một thỏi sắt và viên ngọc, nhấn nút 'def forge()', đầu ra rơi xuống thanh kiếm sáng lấp lánh có gắn thẻ 'return'."
imagePrompt: "Edit this image: the character is operating a magical forging machine. They drop an iron ingot and a gem into a funnel on top, press a big button labeled 'def forge()', and a shiny sword slides out of the output tray with a small tag reading 'return'. Keep the original art style, 16:9."
---

Hàm là một đoạn code có tên, viết một lần rồi gọi lại bao nhiêu lần cũng được. Thay vì chép đi chép lại công thức tính sát thương ở mười chỗ, bạn gói nó vào hàm `calc_damage` và gọi hàm đó. Khi đổi công thức, chỉ sửa một chỗ.

## Định nghĩa và gọi hàm

```python
def show_welcome():
    print("Chào mừng tới Làng Khởi Đầu")
    print("Nhấn phím bất kỳ để tiếp tục")

show_welcome()
# Chào mừng tới Làng Khởi Đầu
# Nhấn phím bất kỳ để tiếp tục
```

`def`, tên hàm, cặp ngoặc, dấu `:`, rồi thân hàm thụt vào. Tên hàm đặt theo `snake_case` giống [biến](/docs/python/bien), thường bắt đầu bằng động từ: `show_menu`, `calc_damage`, `spawn_enemy`.

Định nghĩa hàm chưa chạy gì cả. Code bên trong chỉ chạy khi bạn gọi `show_welcome()`.

> **Lỗi hay gặp:** gọi hàm trước dòng `def`. Python chạy từ trên xuống, chưa gặp `def` thì chưa biết hàm đó tồn tại, báo `NameError: name 'show_welcome' is not defined`. Đặt các hàm ở đầu file.

## Tham số

Tham số là giá trị bạn đưa vào hàm lúc gọi:

```python
def heal(hp, amount):
    print(f"Hồi {amount} máu, từ {hp} lên {hp + amount}")

heal(40, 25)  # Hồi 25 máu, từ 40 lên 65
heal(10, 50)  # Hồi 50 máu, từ 10 lên 60
```

Gọi thiếu hay thừa tham số đều lỗi: `heal(40)` báo `TypeError: heal() missing 1 required positional argument: 'amount'`.

## return

Chỗ người mới hay nhầm: `print` trong hàm chỉ **hiện** kết quả lên màn hình. Code gọi hàm không lấy được con số đó để tính tiếp.

```python
def calc_damage(attack, defense):
    print(attack - defense)

result = calc_damage(50, 20)  # in ra 30
print(result)                 # None
```

Hàm không có `return` thì trả về `None`. Muốn lấy giá trị ra dùng tiếp, phải `return`:

```python
def calc_damage(attack, defense):
    damage = attack - defense
    return max(damage, 1)   # ít nhất 1 sát thương

boss_hp = 500
boss_hp -= calc_damage(50, 20)
boss_hp -= calc_damage(10, 99)
print(boss_hp)  # 469
```

`return` kết thúc hàm ngay lập tức. Code sau `return` trong cùng nhánh không chạy. Tận dụng điều này để thoát sớm:

```python
def buy(gold, price):
    if gold < price:
        return gold          # không đủ tiền, giữ nguyên
    return gold - price

print(buy(100, 250))  # 100
print(buy(300, 250))  # 50
```

Trả nhiều giá trị thì ngăn cách bằng dấu phẩy, Python gói thành [tuple](/docs/python/tuple):

```python
def split_loot(gold, players):
    return gold // players, gold % players

each, left = split_loot(100, 3)
print(each, left)  # 33 1
```

## Tham số mặc định

Cho tham số một giá trị sẵn, người gọi không truyền thì dùng giá trị đó:

```python
def spawn_enemy(name, hp=50, level=1):
    return f"{name} (lv{level}, {hp} máu)"

print(spawn_enemy("Slime"))             # Slime (lv1, 50 máu)
print(spawn_enemy("Orc", 120))          # Orc (lv1, 120 máu)
print(spawn_enemy("Orc", 120, 5))       # Orc (lv5, 120 máu)
```

Tham số có mặc định phải đứng sau tham số không có mặc định. `def spawn_enemy(hp=50, name):` báo `SyntaxError: parameter without a default follows parameter with a default`.

> **Lỗi hay gặp:** dùng list làm giá trị mặc định, kiểu `def add_item(item, bag=[])`. List này được tạo **một lần** lúc định nghĩa hàm và dùng chung cho mọi lần gọi, nên đồ của lần gọi trước còn nằm lại ở lần gọi sau. Dùng `bag=None` rồi trong hàm viết `if bag is None: bag = []`.

## Keyword arguments

Gọi hàm bằng tên tham số thay vì thứ tự. Cách này rõ nghĩa hơn khi hàm có nhiều tham số:

```python
print(spawn_enemy("Goblin", level=3))          # Goblin (lv3, 50 máu)
print(spawn_enemy(level=2, hp=80, name="Bat")) # Bat (lv2, 80 máu)
```

Dòng đầu bỏ qua `hp` để nó giữ mặc định, chỉ đổi `level`. Không có keyword arguments thì phải truyền cả `hp` dù không muốn đổi.

Trộn hai kiểu được, nhưng tham số theo vị trí phải đứng trước: `spawn_enemy(name="Bat", 80)` báo `SyntaxError`.

## Biến trong hàm

Biến tạo bên trong hàm chỉ sống trong hàm đó:

```python
def roll_crit():
    crit_bonus = 2
    return crit_bonus

roll_crit()
print(crit_bonus)
# NameError: name 'crit_bonus' is not defined
```

Muốn lấy giá trị ra ngoài thì dùng `return`, đừng cố đọc biến bên trong hàm. Hàm nhận dữ liệu qua tham số và trả kết quả qua `return` thì dễ hiểu và dễ kiểm tra hơn nhiều.

Bài tiếp theo: hàm viết trên một dòng với [lambda](/docs/python/lambda).

## Bài tập

Viết hàm `calc_reward(level, is_boss=False)` trả về số vàng: `level * 10`, nếu là boss thì nhân 5. Gọi cho quái level 3, và boss level 4 bằng keyword argument.

<details>
<summary>Xem đáp án</summary>

```python
def calc_reward(level, is_boss=False):
    gold = level * 10
    if is_boss:
        gold *= 5
    return gold

print(calc_reward(3))                # 30
print(calc_reward(4, is_boss=True))  # 200
```

</details>
