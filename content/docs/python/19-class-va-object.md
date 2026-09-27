---
title: "Class và object trong Python"
description: "Class và object trong Python: tạo class, hàm khởi tạo __init__, self là gì, thuộc tính và method, qua ví dụ làm class quái vật trong game."
section: "Hướng đối tượng"
order: 19
tags: ["class", "object", "__init__", "self", "method"]
image: /images/docs/python/class-va-object.webp
imageIdea: "Nhân vật anime cầm một bản vẽ thiết kế quái vật ghi 'class Slime', trước mặt là ba con slime thật khác màu vừa nhảy ra từ bản vẽ, mỗi con đeo thẻ tên riêng."
imagePrompt: "Edit this image: the character holds a blueprint sheet titled 'class Slime' with a slime sketch on it. In front of them, three real cute slimes of different colors (green, blue, pink) are hopping out of the blueprint, each wearing a small name tag. Keep the original art style, 16:9."
---

Class là bản thiết kế, object là thứ được tạo ra từ bản thiết kế đó. Class `Enemy` mô tả một con quái có tên, máu, biết nhận sát thương. Mỗi con Slime, Goblin, Orc trong màn chơi là một object riêng, có máu riêng, bị đánh riêng.

## Vì sao cần class

Không có class, dữ liệu một con quái nằm rải rác trong nhiều biến, còn các hàm xử lý nó thì nằm chỗ khác:

```python
slime_name = "Slime"
slime_hp = 30
goblin_name = "Goblin"
goblin_hp = 50

def take_damage(hp, amount):
    return hp - amount

slime_hp = take_damage(slime_hp, 10)
```

Thêm con thứ mười thì phải thêm hai mươi biến, rất dễ truyền nhầm máu con này vào con kia. Class gói dữ liệu và hành động của một con quái vào một chỗ.

## Tạo class và object

```python
class Enemy:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

slime = Enemy("Slime", 30)
goblin = Enemy("Goblin", 50)

print(slime.name, slime.hp)    # Slime 30
print(goblin.name, goblin.hp)  # Goblin 50
```

- `class Enemy:` định nghĩa class. Tên class viết `PascalCase` (viết hoa chữ đầu mỗi từ), khác với `snake_case` của biến.
- `Enemy("Slime", 30)` tạo một object mới. Gọi tên class như gọi hàm.
- `slime.name` đọc **thuộc tính** (dữ liệu gắn với object) bằng dấu chấm.

## __init__ và self

`__init__` là hàm khởi tạo, Python tự gọi nó mỗi lần bạn tạo object. Đây là chỗ gán giá trị ban đầu cho object.

`self` là chính object đang được tạo hoặc đang được dùng. Khi viết `Enemy("Slime", 30)`, Python tạo một object trống, rồi gọi `__init__` với `self` là object đó, `name` là `"Slime"`, `hp` là `30`. Dòng `self.hp = hp` gắn giá trị `30` vào object.

> **Lỗi hay gặp:** quên `self.` khi gán. Viết `hp = hp` trong `__init__` chỉ tạo biến tạm trong hàm, object không có thuộc tính `hp`. Truy cập `slime.hp` sẽ báo `AttributeError: 'Enemy' object has no attribute 'hp'`.

Tên `__init__` có hai dấu gạch dưới mỗi bên. Viết `_init_` hay `__int__` thì Python không coi là hàm khởi tạo, và `Enemy("Slime", 30)` sẽ báo `TypeError: Enemy() takes no arguments`.

## Method

Method là hàm viết bên trong class. Tham số đầu tiên luôn là `self`, để method biết đang làm việc với object nào.

```python
class Enemy:
    def __init__(self, name, hp, gold=5):
        self.name = name
        self.hp = hp
        self.gold = gold

    def take_damage(self, amount):
        self.hp -= amount
        if self.hp < 0:
            self.hp = 0

    def is_alive(self):
        return self.hp > 0

    def describe(self):
        return f"{self.name} ({self.hp} máu)"


slime = Enemy("Slime", 30)
goblin = Enemy("Goblin", 50, gold=12)

slime.take_damage(12)
print(slime.describe())   # Slime (18 máu)
print(goblin.describe())  # Goblin (50 máu)

slime.take_damage(40)
print(slime.is_alive())   # False
print(slime.hp)           # 0
```

Khi gọi `slime.take_damage(12)`, bạn chỉ truyền `12`. Python tự đưa `slime` vào làm `self`. Vì thế `self.hp -= amount` trừ máu đúng con slime, con goblin không bị ảnh hưởng.

Người mới hay quên `self` ở danh sách tham số:

```python
class Enemy:
    def roar():
        print("Grừ!")

Enemy().roar()
# TypeError: Enemy.roar() takes 0 positional arguments but 1 was given
```

"1 was given" chính là `self` mà Python tự truyền vào. Thêm `self` vào: `def roar(self):`.

## Nhiều object trong list

Class kết hợp với [list](/docs/python/list) để quản lý cả đợt quái:

```python
wave = [Enemy("Slime", 30), Enemy("Bat", 15), Enemy("Orc", 120, gold=40)]

for enemy in wave:
    enemy.take_damage(20)

survivors = []
for enemy in wave:
    if enemy.is_alive():
        survivors.append(enemy.describe())
print(survivors)  # ['Slime (10 máu)', 'Orc (100 máu)']
```

Mỗi object giữ máu riêng, vòng lặp chỉ cần gọi method, không phải nhớ biến nào của con nào.

## In object cho dễ đọc

`print(slime)` mặc định in ra thứ khó hiểu như `<__main__.Enemy object at 0x...>`. Thêm method `__str__` để quyết định object in ra thế nào:

```python
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name} ({self.price} vàng)"

sword = Item("Kiếm sắt", 250)
print(sword)  # Kiếm sắt (250 vàng)
```

Bài tiếp theo: tạo class mới từ class có sẵn với [kế thừa](/docs/python/ke-thua).

## Bài tập

Viết class `Player` có `name`, `hp` (mặc định 100) và `gold` (mặc định 0). Thêm method `loot(enemy)` cộng vàng của quái vào túi người chơi nếu quái đã chết. Dùng lại class `Enemy` ở trên để thử.

<details>
<summary>Xem đáp án</summary>

```python
class Enemy:
    def __init__(self, name, hp, gold=5):
        self.name = name
        self.hp = hp
        self.gold = gold

    def take_damage(self, amount):
        self.hp = max(self.hp - amount, 0)

    def is_alive(self):
        return self.hp > 0


class Player:
    def __init__(self, name, hp=100, gold=0):
        self.name = name
        self.hp = hp
        self.gold = gold

    def loot(self, enemy):
        if not enemy.is_alive():
            self.gold += enemy.gold
            enemy.gold = 0


aki = Player("Aki")
orc = Enemy("Orc", 60, gold=40)

aki.loot(orc)
print(aki.gold)  # 0, orc còn sống

orc.take_damage(60)
aki.loot(orc)
print(aki.gold)  # 40
```

`enemy.gold = 0` để không nhặt vàng của cùng một con hai lần.

</details>
