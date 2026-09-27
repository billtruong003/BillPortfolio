---
title: "Chuỗi trong Python"
description: "Làm việc với chuỗi str trong Python: f-string, len, upper, lower, split, join, strip và cách cắt một phần chuỗi bằng slicing."
section: "Cơ bản"
order: 8
tags: ["chuỗi", "str", "f-string", "split", "slicing"]
image: /images/docs/python/chuoi.webp
imageIdea: "Nhân vật anime cầm kéo cắt một dải ruy băng dài có in chữ 'DRAGONSLAYER', mảnh vừa cắt ra ghi 'DRAGON', bên dưới có tấm bảng '[0:6]'."
imagePrompt: "Edit this image: the character is cutting a long ribbon with scissors. The ribbon has letters 'DRAGONSLAYER' printed on it, and the cut piece reads 'DRAGON'. A small sign below reads '[0:6]'. Keep the original art style, 16:9."
---

Chuỗi (`str`) là dãy ký tự: tên nhân vật, câu thoại, dòng thông báo trên màn hình. Python có sẵn rất nhiều cách xử lý chuỗi. Bài này đi qua những cách dùng hằng ngày.

## Tạo chuỗi

Dùng nháy đơn hoặc nháy kép. Chuỗi nhiều dòng dùng ba dấu nháy:

```python
hero = "Aki"
enemy = 'Goblin'
intro = """Ngày xửa ngày xưa,
có một con rồng giữ kho báu."""
print(intro)
# Ngày xửa ngày xưa,
# có một con rồng giữ kho báu.
```

## f-string

Người mới hay ghép chuỗi bằng dấu `+` và phải `str()` từng số, vừa dài vừa dễ quên dấu cách:

```python
gold = 250
print("Bạn có " + str(gold) + " vàng")  # Bạn có 250 vàng
```

Cách gọn là f-string: thêm chữ `f` trước dấu nháy, đặt biến trong `{}`.

```python
hero = "Aki"
gold = 250
print(f"{hero} có {gold} vàng")  # Aki có 250 vàng
```

Trong `{}` viết được cả biểu thức:

```python
hp = 45
max_hp = 120
print(f"Máu: {hp}/{max_hp} ({hp / max_hp * 100:.1f}%)")  # Máu: 45/120 (37.5%)
```

`:.1f` là định dạng: số thực, 1 chữ số thập phân. Một định dạng khác hay dùng là `:,` để thêm dấu phẩy ngăn hàng nghìn:

```python
score = 1250000
print(f"Điểm: {score:,}")  # Điểm: 1,250,000
```

> **Lỗi hay gặp:** quên chữ `f`. `print("{hero} có {gold} vàng")` in ra nguyên văn `{hero} có {gold} vàng`, không báo lỗi gì. Thấy dấu ngoặc nhọn hiện lên màn hình thì kiểm tra chữ `f` đầu tiên.

## Độ dài với len

```python
player_name = "DragonSlayer"
print(len(player_name))  # 12

if len(player_name) > 10:
    print("Tên quá dài, tối đa 10 ký tự")
```

## Đổi hoa thường và bỏ khoảng trắng

Các method (hàm gắn với một giá trị, gọi bằng dấu chấm) của chuỗi luôn trả về chuỗi **mới**. Chuỗi gốc không đổi.

```python
name = "  aki  "
print(f"[{name.upper()}]")          # [  AKI  ]
print(f"[{name.strip()}]")          # [aki]
print(f"[{name.strip().title()}]")  # [Aki]
print(f"[{name}]")                  # [  aki  ], vẫn như cũ
```

Dấu `[ ]` trong ví dụ chỉ để bạn nhìn thấy khoảng trắng hai đầu.

Muốn giữ kết quả thì gán lại: `name = name.strip()`.

So sánh lệnh người chơi gõ mà không phân biệt hoa thường:

```python
command = "ATTACK"
if command.lower() == "attack":
    print("Tấn công!")  # Tấn công!
```

Hai method tìm kiếm hay dùng:

```python
line = "Boss rơi ra Kiếm lửa"
print("Kiếm" in line)              # True
print(line.replace("Kiếm", "Cung"))  # Boss rơi ra Cung lửa
```

## Tách và nối với split, join

`split()` cắt chuỗi thành một [list](/docs/python/list). Không truyền gì thì cắt theo khoảng trắng.

```python
command = "use potion 3"
parts = command.split()
print(parts)  # ['use', 'potion', '3']
```

Truyền ký tự ngăn cách để đọc dữ liệu kiểu CSV:

```python
save_line = "Aki,12,3400"
name, level, gold = save_line.split(",")
print(name, level, gold)  # Aki 12 3400
```

Lưu ý `level` và `gold` lúc này vẫn là chuỗi. Cần [ép kiểu](/docs/python/ep-kieu) bằng `int()` trước khi tính toán.

`join()` làm ngược lại: nối các chuỗi trong list bằng một chuỗi ngăn cách. Cú pháp hơi ngược: chuỗi ngăn cách đứng trước.

```python
items = ["Kiếm", "Khiên", "Bình máu"]
print(", ".join(items))  # Kiếm, Khiên, Bình máu
```

## Lấy ký tự và cắt chuỗi

Mỗi ký tự có một chỉ số, đếm từ 0. Chỉ số âm đếm từ cuối lên.

```python
title = "DRAGONSLAYER"
print(title[0])   # D
print(title[-1])  # R
```

Slicing `[bắt_đầu:kết_thúc]` lấy một đoạn, **không lấy** ký tự ở vị trí kết thúc:

```python
title = "DRAGONSLAYER"
print(title[0:6])  # DRAGON
print(title[6:])   # SLAYER
print(title[:3])   # DRA
print(title[-5:])  # LAYER
print(title[::-1]) # REYALSNOGARD
```

Bỏ trống đầu thì hiểu là từ đầu chuỗi, bỏ trống cuối thì tới hết. `[::-1]` đảo ngược chuỗi.

Chuỗi không sửa từng ký tự được. `title[0] = "d"` báo `TypeError: 'str' object does not support item assignment`. Muốn đổi thì tạo chuỗi mới: `title = "d" + title[1:]`.

## Bài tập

Người chơi gõ lệnh `"  BUY sword 2  "`. Hãy bỏ khoảng trắng hai đầu, đổi về chữ thường, tách thành ba phần, rồi in `"Mua 2 x sword"` bằng f-string.

<details>
<summary>Xem đáp án</summary>

```python
raw = "  BUY sword 2  "
action, item, amount = raw.strip().lower().split()
amount = int(amount)

print(action)                    # buy
print(f"Mua {amount} x {item}")  # Mua 2 x sword
```

</details>
