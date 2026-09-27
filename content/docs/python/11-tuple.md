---
title: "Tuple trong Python"
description: "Tuple trong Python là gì, khác list ở chỗ không sửa được, khi nào nên dùng tuple và cách unpacking để tách giá trị ra nhiều biến."
section: "Collection"
order: 11
tags: ["tuple", "unpacking", "immutable"]
image: /images/docs/python/tuple.webp
imageIdea: "Nhân vật anime cố cạy nắp một hộp kính niêm phong chứa tọa độ '(12, 7)', trên hộp dán nhãn 'tuple: không sửa được', cái xà beng trong tay cong queo."
imagePrompt: "Edit this image: the character is trying to pry open a sealed glass display case with a bent crowbar. Inside the case is a glowing scroll reading '(12, 7)'. A label on the case reads 'tuple'. The character looks frustrated but cute. Keep the original art style, 16:9."
---

Tuple là một dãy giá trị có thứ tự, giống [list](/docs/python/list), nhưng tạo xong thì không sửa được. Tuple dùng cho những nhóm giá trị đi liền với nhau và không nên thay đổi: tọa độ `(x, y)`, màu `(r, g, b)`, một dòng dữ liệu cố định.

## Tạo tuple

Tuple dùng ngoặc tròn thay vì ngoặc vuông:

```python
spawn_point = (12, 7)
red = (255, 0, 0)
boss_info = ("Rồng lửa", 5000, 45)

print(spawn_point[0])  # 12
print(boss_info[-1])   # 45
print(len(red))        # 3
```

Lấy phần tử, cắt bằng slicing, dùng `in`, `index`, `count` đều giống list.

> **Lỗi hay gặp:** tạo tuple một phần tử mà quên dấu phẩy. `(5)` chỉ là số 5 nằm trong ngoặc, kiểu `int`. Tuple một phần tử phải viết `(5,)`.

```python
not_tuple = (5)
real_tuple = (5,)
print(type(not_tuple))   # <class 'int'>
print(type(real_tuple))  # <class 'tuple'>
```

Thật ra dấu phẩy mới tạo ra tuple, ngoặc chỉ để cho dễ nhìn. `spawn_point = 12, 7` cũng là tuple.

## Không sửa được

Đây là điểm khác chính giữa tuple và list:

```python
spawn_point = (12, 7)
spawn_point[0] = 20
# TypeError: 'tuple' object does not support item assignment
```

Tuple cũng không có `append`, `remove`, `sort`. Muốn "đổi" thì tạo tuple mới rồi gán lại cho biến:

```python
spawn_point = (12, 7)
spawn_point = (20, spawn_point[1])
print(spawn_point)  # (20, 7)
```

Nghe có vẻ bất tiện. Vậy tại sao lại dùng tuple?

- **Chống sửa nhầm.** Điểm hồi sinh của màn chơi không được đổi giữa chừng. Để trong tuple thì có dòng code nào lỡ gán vào, Python báo lỗi ngay thay vì âm thầm làm sai.
- **Làm khóa của dictionary được.** List không làm khóa được vì nó sửa được. Tuple thì được. Ví dụ lưu quái theo ô trên bản đồ: `monsters[(3, 4)] = "Goblin"`. Xem thêm ở bài [Dictionary](/docs/python/dictionary).
- **Người đọc hiểu ý.** Thấy tuple là biết nhóm này cố định.

Quy tắc dễ nhớ: danh sách các món cùng loại, số lượng thay đổi (kho đồ, danh sách quái) thì dùng list. Một bộ giá trị khác loại nhau, số lượng cố định (tên, máu, sát thương của một con boss) thì dùng tuple.

## Unpacking

Unpacking là tách các phần tử của tuple ra thành từng biến trong một dòng:

```python
boss_info = ("Rồng lửa", 5000, 45)
name, hp, damage = boss_info

print(name)    # Rồng lửa
print(hp)      # 5000
print(damage)  # 45
```

Số biến bên trái phải bằng số phần tử. Thiếu hay thừa đều lỗi:

```python
name, hp = boss_info
# ValueError: too many values to unpack (expected 2)
```

Nếu chỉ cần vài phần tử đầu, dùng `*` để gom phần còn lại vào một list:

```python
top_scores = (1500, 1200, 980, 750, 600)
first, second, *others = top_scores
print(first)   # 1500
print(second)  # 1200
print(others)  # [980, 750, 600]
```

Biến không dùng tới thì đặt tên `_`, quy ước báo cho người đọc là "bỏ qua cái này":

```python
name, _, damage = boss_info
print(name, damage)  # Rồng lửa 45
```

## Hàm trả về nhiều giá trị

Unpacking hay gặp nhất khi một [hàm](/docs/python/ham) trả về nhiều giá trị. Thật ra hàm trả về một tuple, rồi bạn tách nó ra:

```python
def roll_loot():
    return "Ngọc xanh", 3

item, amount = roll_loot()
print(f"Nhận {amount} x {item}")  # Nhận 3 x Ngọc xanh
```

Trò đổi chỗ hai biến `a, b = b, a` ở bài [Biến](/docs/python/bien) cũng chính là tạo tuple rồi unpacking.

## Bài tập

Cho `player = ("Aki", 14, (3, 9))` gồm tên, level và vị trí. Dùng unpacking để lấy tên, level, rồi lấy tiếp `x`, `y` từ vị trí. In ra `Aki (level 14) đang ở ô 3, 9`.

<details>
<summary>Xem đáp án</summary>

```python
player = ("Aki", 14, (3, 9))
name, level, position = player
x, y = position

print(f"{name} (level {level}) đang ở ô {x}, {y}")  # Aki (level 14) đang ở ô 3, 9
```

Có thể unpack lồng nhau trong một dòng: `name, level, (x, y) = player`.

</details>
