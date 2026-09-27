---
title: "Kế thừa trong Python"
description: "Kế thừa trong Python: tạo class con từ class cha, gọi super() trong __init__, override method để đổi hành vi, và kiểm tra bằng isinstance."
section: "Hướng đối tượng"
order: 20
tags: ["kế thừa", "super", "override", "class"]
image: /images/docs/python/ke-thua.webp
imageIdea: "Nhân vật anime vẽ cây phả hệ quái vật lên bảng đen: gốc cây ghi 'Enemy', ba cành ghi 'Slime', 'Archer', 'Boss', con Boss nhỏ đội vương miện đứng trên cành cao nhất."
imagePrompt: "Edit this image: the character is drawing a monster family tree on a chalkboard. The trunk is labeled 'Enemy' and three branches are labeled 'Slime', 'Archer', 'Boss'. A tiny chibi boss monster with a crown sits on the top branch. Keep the original art style, 16:9."
---

Kế thừa là tạo một class mới dựa trên class có sẵn. Class con nhận hết thuộc tính và method của class cha, rồi thêm hoặc đổi những gì nó cần. Slime, cung thủ, boss đều là quái: cùng có tên, máu, nhận sát thương. Viết phần chung một lần ở class `Enemy`, mỗi loại quái chỉ viết phần khác biệt.

## Vấn đề: chép code giữa các class

Không có kế thừa, mỗi loại quái là một [class](/docs/python/class-va-object) riêng và phải chép lại `__init__`, `take_damage`, `is_alive`. Lỡ sửa công thức nhận sát thương ở class này mà quên class kia, hai loại quái sẽ chạy khác nhau mà không ai để ý.

## Tạo class con

Viết tên class cha trong ngoặc sau tên class con:

```python
class Enemy:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def take_damage(self, amount):
        self.hp = max(self.hp - amount, 0)

    def attack(self):
        return f"{self.name} cắn một phát"


class Slime(Enemy):
    pass


slime = Slime("Slime xanh", 30)
slime.take_damage(10)
print(slime.hp)        # 20
print(slime.attack())  # Slime xanh cắn một phát
```

`Slime` không viết gì thêm (`pass` nghĩa là "không làm gì", để khối lệnh không bị rỗng), vẫn dùng được `__init__`, `take_damage`, `attack` của `Enemy`.

## Override: đổi hành vi

Class con viết lại một method trùng tên với class cha thì dùng bản của class con. Việc này gọi là override.

```python
class Archer(Enemy):
    def attack(self):
        return f"{self.name} bắn một mũi tên"


archer = Archer("Cung thủ Goblin", 40)
print(archer.attack())  # Cung thủ Goblin bắn một mũi tên
```

Khi gọi `archer.attack()`, Python tìm `attack` trong `Archer` trước. Có thì dùng, không có mới lên tìm trong `Enemy`.

Cái hay là code gọi không cần biết đang gặp loại quái nào:

```python
wave = [Slime("Slime", 30), Archer("Cung thủ", 40)]
for enemy in wave:
    print(enemy.attack())
# Slime cắn một phát
# Cung thủ bắn một mũi tên
```

## super(): gọi lại class cha

Boss cần thêm thuộc tính `phase`. Người mới hay viết lại `__init__` của class con và quên phần của class cha:

```python
class Boss(Enemy):
    def __init__(self, name, hp):
        self.phase = 1

boss = Boss("Rồng lửa", 5000)
print(boss.hp)
# AttributeError: 'Boss' object has no attribute 'hp'
```

`__init__` của `Boss` đã thay hẳn `__init__` của `Enemy`, nên `self.name` và `self.hp` không bao giờ được gán.

> **Lỗi hay gặp:** override `__init__` mà quên gọi `super().__init__(...)`. Kết quả là `AttributeError` khi đụng tới thuộc tính của class cha.

Cách đúng là gọi `super().__init__` để class cha làm phần của nó, rồi mới thêm phần riêng:

```python
class Boss(Enemy):
    def __init__(self, name, hp, phase_hp):
        super().__init__(name, hp)
        self.phase = 1
        self.phase_hp = phase_hp

    def take_damage(self, amount):
        super().take_damage(amount)
        if self.phase == 1 and self.hp <= self.phase_hp:
            self.phase = 2
            print(f"{self.name} nổi giận! Sang phase 2")

    def attack(self):
        if self.phase == 2:
            return f"{self.name} phun lửa khắp sân"
        return super().attack()


boss = Boss("Rồng lửa", 500, phase_hp=200)
print(boss.attack())   # Rồng lửa cắn một phát
boss.take_damage(350)  # Rồng lửa nổi giận! Sang phase 2
print(boss.hp)         # 150
print(boss.attack())   # Rồng lửa phun lửa khắp sân
```

`super()` dùng được trong mọi method chứ không riêng `__init__`. Ở `take_damage`, Boss để class cha trừ máu như bình thường, rồi thêm việc kiểm tra đổi phase. Ở `attack`, phase 1 thì dùng lại đòn của class cha.

## Kiểm tra loại object

`isinstance(object, Class)` hỏi object có thuộc class đó không, tính cả class cha:

```python
print(isinstance(boss, Boss))    # True
print(isinstance(boss, Enemy))   # True
print(isinstance(slime, Boss))   # False
```

Boss là một Enemy, nhưng Slime không phải Boss. Dùng khi cần xử lý riêng một loại, ví dụ chỉ boss mới hiện thanh máu lớn trên đầu màn hình.

## Khi nào dùng kế thừa

Dùng khi quan hệ đọc được thành câu "X **là một** Y": Boss là một Enemy, Archer là một Enemy. Nếu câu là "X **có một** Y" (Player có một Weapon) thì không kế thừa, mà cho Player giữ một object Weapon làm thuộc tính.

Đừng xây cây kế thừa quá sâu. Hai tầng như `Enemy` rồi `Boss` là dễ theo dõi. Năm sáu tầng thì mỗi lần sửa phải lần ngược lên từng class cha.

## Bài tập

Viết class `Healer` kế thừa `Enemy`, thêm thuộc tính `heal_power` (mặc định 15). Override `attack` để trả về câu kiểu "Pháp sư hồi 15 máu cho đồng đội". Tạo một Healer và in đòn của nó.

<details>
<summary>Xem đáp án</summary>

```python
class Enemy:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def attack(self):
        return f"{self.name} cắn một phát"


class Healer(Enemy):
    def __init__(self, name, hp, heal_power=15):
        super().__init__(name, hp)
        self.heal_power = heal_power

    def attack(self):
        return f"{self.name} hồi {self.heal_power} máu cho đồng đội"


healer = Healer("Pháp sư", 45)
print(healer.hp)        # 45
print(healer.attack())  # Pháp sư hồi 15 máu cho đồng đội
```

</details>
