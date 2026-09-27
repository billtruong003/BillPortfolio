---
title: "Vòng lặp for trong Python"
description: "Vòng lặp for trong Python: duyệt từng phần tử của list, dùng range để lặp theo số lần, enumerate để lấy cả chỉ số, và duyệt dictionary."
section: "Điều khiển luồng"
order: 16
tags: ["for", "range", "enumerate", "vòng lặp"]
image: /images/docs/python/vong-lap-for.webp
imageIdea: "Nhân vật anime đi dọc một hàng rương kho báu đánh số 0 tới 4, mở lần lượt từng cái, tay cầm cuốn sổ ghi 'for chest in chests:'."
imagePrompt: "Edit this image: the character walks along a row of five treasure chests numbered 0 to 4, opening them one by one. They hold a small notebook reading 'for chest in chests:'. Keep the original art style, adventurous mood, 16:9."
---

Vòng lặp `for` đi qua từng phần tử của một dãy, mỗi vòng xử lý một phần tử. Trừ máu cho mọi con quái, in từng món trong kho đồ, cộng điểm của cả đội: đều là việc của `for`.

## Duyệt list

Người học C# hay nghĩ `for` phải có biến đếm `i` và điều kiện dừng. `for` trong Python khác: nó lấy thẳng từng phần tử, không cần chỉ số.

```python
inventory = ["Kiếm", "Khiên", "Bình máu"]

for item in inventory:
    print("Trong túi có:", item)
# Trong túi có: Kiếm
# Trong túi có: Khiên
# Trong túi có: Bình máu
```

Mỗi vòng, `item` nhận giá trị của phần tử tiếp theo. Tên `item` do bạn đặt, nên chọn tên số ít của tên list: `for enemy in enemies`, `for score in scores`.

`for` duyệt được cả chuỗi (từng ký tự), [tuple](/docs/python/tuple), [set](/docs/python/set) và [dictionary](/docs/python/dictionary).

## Lặp theo số lần với range

`range(n)` tạo dãy số từ 0 tới `n - 1`:

```python
for wave in range(3):
    print("Đợt quái số", wave)
# Đợt quái số 0
# Đợt quái số 1
# Đợt quái số 2
```

> **Lỗi hay gặp:** tưởng `range(3)` chạy tới 3. Nó dừng trước 3, chỉ có 0, 1, 2. Muốn đếm từ 1 tới 3 thì viết `range(1, 4)`.

`range` nhận tối đa ba tham số: bắt đầu, kết thúc (không lấy), bước nhảy.

```python
print(list(range(1, 6)))       # [1, 2, 3, 4, 5]
print(list(range(0, 20, 5)))   # [0, 5, 10, 15]
print(list(range(10, 0, -3)))  # [10, 7, 4, 1]
```

Đếm ngược trước khi trận đấu bắt đầu:

```python
for second in range(3, 0, -1):
    print(second)
print("Bắt đầu!")
# 3
# 2
# 1
# Bắt đầu!
```

## Lấy cả chỉ số với enumerate

Khi cần cả vị trí lẫn giá trị, người mới hay viết `for i in range(len(list))`:

```python
scores = [1500, 1200, 980]
for i in range(len(scores)):
    print(i + 1, scores[i])
```

Chạy được, nhưng Python có cách gọn hơn là `enumerate`. Nó trả về từng cặp (chỉ số, giá trị):

```python
scores = [1500, 1200, 980]
for rank, score in enumerate(scores, start=1):
    print(f"Hạng {rank}: {score} điểm")
# Hạng 1: 1500 điểm
# Hạng 2: 1200 điểm
# Hạng 3: 980 điểm
```

`start=1` để đếm từ 1 thay vì 0, hợp với bảng xếp hạng.

## Duyệt dictionary

`for` trên dict mặc định lấy các **khóa**. Muốn cả khóa lẫn giá trị thì dùng `items()`:

```python
stock = {"Bình máu": 5, "Mũi tên": 40}

for item in stock:
    print(item)
# Bình máu
# Mũi tên

for item, amount in stock.items():
    print(f"{item} x{amount}")
# Bình máu x5
# Mũi tên x40
```

## break và continue trong for

`break` và `continue` dùng giống như trong [vòng lặp while](/docs/python/vong-lap-while):

```python
enemies = ["Slime", "Bat", "Dragon", "Goblin"]

for enemy in enemies:
    if enemy == "Bat":
        continue          # bỏ qua dơi
    if enemy == "Dragon":
        print("Gặp rồng, rút lui!")
        break             # dừng hẳn
    print("Hạ", enemy)
# Hạ Slime
# Gặp rồng, rút lui!
```

Goblin không bao giờ được xét vì `break` đã thoát vòng lặp.

## Sửa list trong khi duyệt

Muốn giảm máu cho mọi con quái, người mới hay viết:

```python
enemy_hps = [30, 50, 20]
for hp in enemy_hps:
    hp -= 10
print(enemy_hps)  # [30, 50, 20], không đổi gì
```

`hp` chỉ là bản sao giá trị của từng phần tử, trừ nó không ảnh hưởng tới list. Phải gán lại qua chỉ số:

```python
enemy_hps = [30, 50, 20]
for i, hp in enumerate(enemy_hps):
    enemy_hps[i] = hp - 10
print(enemy_hps)  # [20, 40, 10]
```

## Vòng lặp lồng nhau

Duyệt bản đồ dạng lưới (list trong [list](/docs/python/list)) cần hai vòng `for`:

```python
dungeon = [
    ["#", "E", "#"],
    [".", "@", "E"],
]
for row_index, row in enumerate(dungeon):
    for col_index, cell in enumerate(row):
        if cell == "E":
            print(f"Quái ở hàng {row_index}, cột {col_index}")
# Quái ở hàng 0, cột 1
# Quái ở hàng 1, cột 2
```

## Bài tập

Cho `party = {"Aki": 120, "Rin": 0, "Kai": 75}` là máu của từng người. Dùng `for` để in tên những người còn sống kèm số máu, và đếm xem có bao nhiêu người còn sống.

<details>
<summary>Xem đáp án</summary>

```python
party = {"Aki": 120, "Rin": 0, "Kai": 75}
alive_count = 0

for name, hp in party.items():
    if hp > 0:
        print(f"{name}: {hp} máu")
        alive_count += 1

print("Còn sống:", alive_count)
# Aki: 120 máu
# Kai: 75 máu
# Còn sống: 2
```

</details>
