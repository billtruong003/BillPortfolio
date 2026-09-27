---
title: "Lambda trong Python"
description: "Hàm lambda trong Python là gì, viết hàm ngắn trên một dòng, và dùng lambda làm key cho sorted, min, max để sắp xếp kho đồ, bảng điểm."
section: "Hàm"
order: 18
tags: ["lambda", "sorted", "key", "hàm"]
image: /images/docs/python/lambda.webp
imageIdea: "Nhân vật anime đang xếp các thẻ nhân vật trên bàn theo chiều cao cột điểm, tay cầm tấm thẻ nhỏ ghi 'key=lambda p: p[1]' như cầm lá bùa phép."
imagePrompt: "Edit this image: the character is arranging hero cards on a table in order from highest to lowest score, each card showing a score number. They hold up a small glowing talisman card reading 'key=lambda p: p[1]' like a magic spell. Keep the original art style, 16:9."
---

Lambda là cách viết một hàm rất ngắn, không cần tên, trên đúng một dòng. Bạn sẽ gặp lambda nhiều nhất ở một chỗ: đưa vào `sorted`, `min`, `max` để nói cho Python biết sắp xếp hay so sánh theo tiêu chí nào.

## Cú pháp lambda

So sánh một [hàm](/docs/python/ham) thường với lambda làm cùng việc:

```python
def double_damage(damage):
    return damage * 2

double_damage_lambda = lambda damage: damage * 2

print(double_damage(15))         # 30
print(double_damage_lambda(15))  # 30
```

Cú pháp: `lambda tham_số: biểu_thức`. Không có `def`, không có `return`, kết quả của biểu thức sau dấu `:` tự động được trả về.

Lambda nhận nhiều tham số được:

```python
calc_damage = lambda attack, defense: max(attack - defense, 1)
print(calc_damage(50, 20))  # 30
```

> **Lỗi hay gặp:** nhét nhiều lệnh vào lambda. Lambda chỉ chứa **một biểu thức**, không có `if` nhiều dòng, không có vòng lặp, không có phép gán `=`. Viết `lambda hp: hp -= 10` báo `SyntaxError`. Logic dài hơn một dòng thì dùng `def`.

Gán lambda vào biến như hai ví dụ trên chỉ để minh họa. Trong code thật, đặt tên cho nó thì cứ viết `def` cho rõ. Chỗ đúng của lambda là làm tham số cho hàm khác.

## Vấn đề: sorted không biết sắp theo gì

`sorted` sắp list số hay chuỗi được ngay:

```python
print(sorted([870, 1500, 950]))           # [870, 950, 1500]
print(sorted(["Orc", "Bat", "Slime"]))    # ['Bat', 'Orc', 'Slime']
```

Nhưng bảng điểm thường là list các [tuple](/docs/python/tuple) (tên, điểm). Sắp thẳng thì Python so theo phần tử đầu tiên, tức là theo tên:

```python
leaderboard = [("Rin", 950), ("Aki", 1500), ("Kai", 870)]
print(sorted(leaderboard))
# [('Aki', 1500), ('Kai', 870), ('Rin', 950)]
```

Xếp theo bảng chữ cái, không phải theo điểm. Đây là lúc cần `key`.

## sorted với key

Tham số `key` nhận một hàm. Python gọi hàm đó cho từng phần tử, rồi sắp xếp theo kết quả trả về. Lambda hợp để viết cái hàm nhỏ này ngay tại chỗ:

```python
leaderboard = [("Rin", 950), ("Aki", 1500), ("Kai", 870)]

by_score = sorted(leaderboard, key=lambda entry: entry[1], reverse=True)
print(by_score)
# [('Aki', 1500), ('Rin', 950), ('Kai', 870)]
```

`lambda entry: entry[1]` nghĩa là "với mỗi phần tử, lấy điểm ra để so". `reverse=True` để điểm cao đứng đầu.

Với list các [dictionary](/docs/python/dictionary) thì lấy theo khóa:

```python
items = [
    {"name": "Kiếm", "price": 250, "weight": 5},
    {"name": "Khiên", "price": 180, "weight": 8},
    {"name": "Bình máu", "price": 30, "weight": 1},
]

cheapest_first = sorted(items, key=lambda item: item["price"])
for item in cheapest_first:
    print(item["name"], item["price"])
# Bình máu 30
# Khiên 180
# Kiếm 250
```

Sắp chuỗi không phân biệt hoa thường:

```python
names = ["aki", "Rin", "kai", "Bill"]
print(sorted(names))                           # ['Bill', 'Rin', 'aki', 'kai']
print(sorted(names, key=lambda n: n.lower()))  # ['aki', 'Bill', 'kai', 'Rin']
```

Mặc định chữ hoa đứng trước mọi chữ thường, nên cần `lower()` để so công bằng.

## Sắp theo nhiều tiêu chí

Lambda trả về một tuple thì Python so phần tử đầu trước, bằng nhau mới so tới phần tử sau:

```python
players = [("Rin", 12, 900), ("Aki", 15, 700), ("Kai", 12, 1200)]
# sắp theo level giảm dần, cùng level thì điểm giảm dần
ranked = sorted(players, key=lambda p: (-p[1], -p[2]))
print(ranked)
# [('Aki', 15, 700), ('Kai', 12, 1200), ('Rin', 12, 900)]
```

Dấu trừ đảo chiều cho từng tiêu chí số, tiện hơn `reverse=True` khi mỗi tiêu chí cần một chiều khác nhau.

## min và max với key

`min` và `max` cũng nhận `key`, dùng để tìm phần tử theo một tiêu chí:

```python
enemies = [("Slime", 30), ("Orc", 120), ("Bat", 15)]

weakest = min(enemies, key=lambda e: e[1])
strongest = max(enemies, key=lambda e: e[1])
print(weakest)    # ('Bat', 15)
print(strongest)  # ('Orc', 120)
```

Thay vì viết vòng lặp tìm con quái yếu nhất để nhắm bắn trước, một dòng là xong.

## sort và sorted

`list.sort(key=...)` nhận `key` y như `sorted`, chỉ khác là sửa thẳng list gốc. Xem lại ở bài [List](/docs/python/list).

## Bài tập

Cho kho đồ dưới đây. In tên món nặng nhất, rồi in danh sách tên các món sắp theo giá trên mỗi đơn vị cân nặng (`price / weight`) từ cao xuống thấp.

```python
items = [
    {"name": "Kiếm", "price": 250, "weight": 5},
    {"name": "Khiên", "price": 180, "weight": 8},
    {"name": "Nhẫn", "price": 400, "weight": 1},
]
```

<details>
<summary>Xem đáp án</summary>

```python
items = [
    {"name": "Kiếm", "price": 250, "weight": 5},
    {"name": "Khiên", "price": 180, "weight": 8},
    {"name": "Nhẫn", "price": 400, "weight": 1},
]

heaviest = max(items, key=lambda item: item["weight"])
print(heaviest["name"])  # Khiên

by_value = sorted(items, key=lambda item: item["price"] / item["weight"], reverse=True)
for item in by_value:
    print(item["name"])
# Nhẫn
# Kiếm
# Khiên
```

Nhẫn đáng 400 vàng mỗi đơn vị cân nặng, kiếm 50, khiên 22.5.

</details>
