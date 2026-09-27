---
title: "Set trong Python"
description: "Set trong Python là gì, dùng set để loại phần tử trùng, kiểm tra nhanh một giá trị có tồn tại không, và các phép hợp, giao, hiệu."
section: "Collection"
order: 12
tags: ["set", "loại trùng", "hợp", "giao"]
image: /images/docs/python/set.webp
imageIdea: "Nhân vật anime đang phân loại thẻ bài vào album sưu tập, mỗi ô chỉ có một lá, tay cầm một lá trùng đang lắc đầu vứt vào thùng ghi 'duplicate'."
imagePrompt: "Edit this image: the character is sorting collectible monster cards into an album where each slot holds only one card. They are shaking their head and tossing a duplicate card into a small bin labeled 'duplicate'. The album cover reads 'set()'. Keep the original art style, 16:9."
---

Set là một nhóm giá trị không trùng nhau và không có thứ tự. Bỏ vào set cùng một giá trị hai lần thì nó chỉ giữ một. Set hợp với câu hỏi kiểu "người chơi đã mở khóa những thành tựu nào" hay "đã gặp những loại quái nào", nơi mỗi thứ chỉ tính một lần.

## Tạo set

Set dùng ngoặc nhọn:

```python
achievements = {"Hạ boss đầu", "Nhặt 100 vàng", "Chết lần đầu"}
print(len(achievements))  # 3
```

Bỏ trùng vào thì set tự loại:

```python
seen_monsters = {"Slime", "Goblin", "Slime", "Slime"}
print(seen_monsters)  # {'Slime', 'Goblin'}
```

Thứ tự in ra có thể khác thứ tự bạn viết, và có thể khác nhau giữa các lần chạy. Set không giữ thứ tự, nên không có `seen_monsters[0]`.

> **Lỗi hay gặp:** tạo set rỗng bằng `{}`. Cặp ngoặc nhọn rỗng tạo ra **dictionary** rỗng, không phải set. Set rỗng phải viết `set()`.

```python
a = {}
b = set()
print(type(a))  # <class 'dict'>
print(type(b))  # <class 'set'>
```

## Loại phần tử trùng trong list

Đây là cách dùng set phổ biến nhất. Đổi list sang set là mất hết phần trùng:

```python
kill_log = ["Slime", "Goblin", "Slime", "Orc", "Goblin", "Slime"]
unique_kills = set(kill_log)
print(len(kill_log))      # 6
print(len(unique_kills))  # 3
```

Cần lại list thì bọc thêm `list()`, thêm `sorted()` nếu muốn có thứ tự:

```python
print(sorted(set(kill_log)))  # ['Goblin', 'Orc', 'Slime']
```

## Thêm, xóa, kiểm tra

```python
unlocked = {"Kiếm"}
unlocked.add("Cung")
unlocked.add("Kiếm")    # đã có, không thêm lần nữa
print(len(unlocked))    # 2

print("Cung" in unlocked)  # True
print("Rìu" in unlocked)   # False
```

Xóa có hai cách, khác nhau ở chỗ phần tử không tồn tại:

```python
unlocked.discard("Rìu")  # không có thì bỏ qua, không lỗi
unlocked.remove("Rìu")
# KeyError: 'Rìu'
```

Muốn xóa mà không cần kiểm tra trước thì dùng `discard`.

Kiểm tra `in` trên set nhanh hơn nhiều so với trên list khi dữ liệu lớn. Với list, Python phải dò từng phần tử. Với set, Python nhảy thẳng tới chỗ cần tìm. Vài chục phần tử thì không khác gì, nhưng danh sách tên bị cấm có một trăm nghìn dòng thì set nhanh hơn thấy rõ.

## Phép hợp, giao, hiệu

Set làm được phép toán tập hợp như ở trường. Lấy ví dụ đồ của hai người chơi:

```python
aki_items = {"Kiếm", "Khiên", "Bình máu"}
rin_items = {"Cung", "Bình máu", "Khiên"}
```

**Hợp** `|`: có ở ít nhất một người.

```python
print(aki_items | rin_items)
# {'Kiếm', 'Khiên', 'Bình máu', 'Cung'}
```

**Giao** `&`: cả hai cùng có.

```python
print(aki_items & rin_items)
# {'Khiên', 'Bình máu'}
```

**Hiệu** `-`: Aki có mà Rin không có.

```python
print(aki_items - rin_items)
# {'Kiếm'}
```

**Hiệu đối xứng** `^`: chỉ một trong hai người có.

```python
print(aki_items ^ rin_items)
# {'Kiếm', 'Cung'}
```

Thứ tự phần tử trong kết quả có thể khác trên máy bạn, nội dung thì giống.

Mỗi phép có một method tương ứng đọc rõ nghĩa hơn: `union`, `intersection`, `difference`, `symmetric_difference`.

Một ví dụ thực tế: kiểm tra người chơi đã đủ nguyên liệu chế đồ chưa.

```python
recipe = {"Gỗ", "Sắt", "Dây"}
bag = {"Gỗ", "Sắt", "Đá", "Vải"}

missing = recipe - bag
if missing:
    print("Còn thiếu:", missing)  # Còn thiếu: {'Dây'}
else:
    print("Chế được!")
```

Set rỗng là falsy (xem [Bool và toán tử](/docs/python/bool-va-toan-tu)), nên `if missing:` nghĩa là "còn thiếu ít nhất một món".

## Giới hạn của set

- Không có thứ tự, không lấy theo chỉ số được.
- Chỉ chứa giá trị không sửa được: số, chuỗi, [tuple](/docs/python/tuple). Bỏ list vào set báo `TypeError: unhashable type: 'list'`.
- Không đếm số lần xuất hiện. Muốn biết Slime bị hạ mấy lần thì dùng [dictionary](/docs/python/dictionary).

## Bài tập

Hôm qua người chơi gặp `["Slime", "Bat", "Slime", "Goblin"]`, hôm nay gặp `["Goblin", "Orc", "Bat", "Orc"]`. In ra: các loại quái gặp cả hai ngày, các loại chỉ gặp hôm nay, và tổng số loại quái đã gặp.

<details>
<summary>Xem đáp án</summary>

```python
yesterday = set(["Slime", "Bat", "Slime", "Goblin"])
today = set(["Goblin", "Orc", "Bat", "Orc"])

print(sorted(yesterday & today))  # ['Bat', 'Goblin']
print(sorted(today - yesterday))  # ['Orc']
print(len(yesterday | today))     # 4
```

Dùng `sorted()` để kết quả in ra luôn cùng thứ tự.

</details>
