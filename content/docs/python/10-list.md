---
title: "List trong Python"
description: "List trong Python là gì, cách thêm, xóa, tìm phần tử với append, remove, index, cắt list bằng slicing và làm list lồng trong list."
section: "Collection"
order: 10
tags: ["list", "append", "remove", "slicing"]
image: /images/docs/python/list.webp
imageIdea: "Nhân vật anime xếp đồ vào một dãy ô kho đồ đánh số 0, 1, 2, 3 trên sàn, đang đặt thanh kiếm vào ô cuối, bên cạnh là bảng ghi 'inventory.append(\"Kiếm\")'."
imagePrompt: "Edit this image: the character is placing items into a row of numbered inventory slots on the floor marked 0, 1, 2, 3, currently putting a sword into the last slot. A small sign nearby reads 'inventory.append(\"sword\")'. Keep the original art style, 16:9."
---

List là một dãy giá trị có thứ tự, đặt trong ngoặc vuông. Kho đồ của nhân vật, danh sách quái trong một đợt, bảng điểm cao: đều hợp để lưu bằng list. List sửa được, thêm bớt phần tử lúc nào cũng được.

## Tạo list và lấy phần tử

```python
inventory = ["Kiếm", "Khiên", "Bình máu"]
scores = [1200, 950, 870]
empty_bag = []

print(inventory[0])   # Kiếm
print(inventory[-1])  # Bình máu
print(len(inventory)) # 3
```

Chỉ số bắt đầu từ 0, giống [chuỗi](/docs/python/chuoi). Phần tử cuối có chỉ số `len - 1`, hoặc gọn hơn là `-1`.

> **Lỗi hay gặp:** lấy chỉ số bằng độ dài. List có 3 phần tử thì chỉ số hợp lệ là 0, 1, 2. `inventory[3]` báo `IndexError: list index out of range`.

Đổi một phần tử bằng cách gán vào chỉ số:

```python
inventory[1] = "Khiên sắt"
print(inventory)  # ['Kiếm', 'Khiên sắt', 'Bình máu']
```

## Thêm phần tử

```python
inventory = ["Kiếm"]
inventory.append("Cung")        # thêm vào cuối
inventory.insert(0, "Mũ giáp")  # chèn vào vị trí 0
print(inventory)  # ['Mũ giáp', 'Kiếm', 'Cung']
```

Muốn thêm nhiều phần tử từ list khác thì dùng `extend`:

```python
loot = ["Vàng", "Ngọc"]
inventory.extend(loot)
print(inventory)  # ['Mũ giáp', 'Kiếm', 'Cung', 'Vàng', 'Ngọc']
```

Người mới hay nhầm `append(loot)` với `extend(loot)`. `append` bỏ nguyên cái list `loot` vào làm **một** phần tử, thành `[..., ['Vàng', 'Ngọc']]`.

## Xóa phần tử

`remove(giá_trị)` xóa phần tử đầu tiên có giá trị đó:

```python
inventory = ["Bình máu", "Kiếm", "Bình máu"]
inventory.remove("Bình máu")
print(inventory)  # ['Kiếm', 'Bình máu']
```

`pop()` lấy ra và xóa theo chỉ số. Không truyền gì thì lấy phần tử cuối:

```python
enemies = ["Slime", "Goblin", "Orc"]
last = enemies.pop()
first = enemies.pop(0)
print(last, first)  # Orc Slime
print(enemies)      # ['Goblin']
```

> **Lỗi hay gặp:** xóa món không có trong túi. `inventory.remove("Rìu")` khi túi không có rìu sẽ báo `ValueError: list.remove(x): x not in list`. Kiểm tra bằng `in` trước.

```python
if "Rìu" in inventory:
    inventory.remove("Rìu")
else:
    print("Không có rìu")
```

## Tìm phần tử với index và in

```python
party = ["Aki", "Rin", "Kai"]
print("Rin" in party)      # True
print(party.index("Kai"))  # 2
print(party.count("Aki"))  # 1
```

`index()` cũng báo `ValueError` nếu không tìm thấy, nên hỏi bằng `in` trước.

## Sắp xếp

```python
scores = [870, 1200, 950]
scores.sort()
print(scores)  # [870, 950, 1200]

scores.sort(reverse=True)
print(scores)  # [1200, 950, 870]
```

`sort()` sửa thẳng list gốc và trả về `None`. Viết `scores = scores.sort()` là mất luôn list. Muốn giữ list gốc thì dùng `sorted(scores)`, hàm này trả về list mới. Bài [Lambda](/docs/python/lambda) chỉ cách sắp xếp theo điều kiện riêng.

## Cắt list bằng slicing

Slicing trên list giống hệt trên chuỗi, kết quả là list mới:

```python
scores = [1200, 950, 870, 640, 500]
top3 = scores[:3]
print(top3)          # [1200, 950, 870]
print(scores[2:4])   # [870, 640]
print(scores[::-1])  # [500, 640, 870, 950, 1200]
```

`scores[:]` tạo một bản sao. Cần bản sao vì phép gán thường không sao chép:

```python
bag_a = ["Kiếm"]
bag_b = bag_a        # cùng một list, hai cái tên
bag_b.append("Cung")
print(bag_a)         # ['Kiếm', 'Cung']

bag_c = bag_a[:]     # bản sao riêng
bag_c.append("Rìu")
print(bag_a)         # ['Kiếm', 'Cung']
```

## List trong list

Một phần tử của list có thể là list khác. Cách này hợp để làm bản đồ dạng lưới:

```python
dungeon = [
    ["#", "#", "#"],
    ["#", "@", "."],
    ["#", ".", "E"],
]
print(dungeon[1][1])  # @
print(dungeon[2][2])  # E

dungeon[2][2] = "."   # quái bị hạ
print(dungeon[2])     # ['#', '.', '.']
```

`dungeon[2]` lấy hàng thứ ba, rồi `[2]` lấy ô thứ ba trong hàng đó. Để duyệt qua cả lưới, xem [vòng lặp for](/docs/python/vong-lap-for).

## Bài tập

Túi đồ ban đầu là `["Kiếm gỗ", "Bình máu"]`. Nhặt được "Khiên", dùng mất "Bình máu", rồi đổi "Kiếm gỗ" thành "Kiếm sắt". In túi đồ và số món.

<details>
<summary>Xem đáp án</summary>

```python
inventory = ["Kiếm gỗ", "Bình máu"]
inventory.append("Khiên")
inventory.remove("Bình máu")

sword_index = inventory.index("Kiếm gỗ")
inventory[sword_index] = "Kiếm sắt"

print(inventory)       # ['Kiếm sắt', 'Khiên']
print(len(inventory))  # 2
```

</details>
