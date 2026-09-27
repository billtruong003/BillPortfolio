---
title: "Cú pháp Python"
description: "Cú pháp cơ bản của Python: thụt lề là một phần của code, lỗi IndentationError, cách dùng print để in kết quả và cách viết comment."
section: "Bắt đầu"
order: 3
tags: ["cú pháp", "thụt lề", "print", "comment"]
image: /images/docs/python/cu-phap.webp
imageIdea: "Nhân vật anime xếp các khối gạch code thành bậc thang thụt vào đều nhau, một khối lệch ra ngoài đang rơi xuống kèm chữ 'IndentationError'."
imagePrompt: "Edit this image: the character is stacking glowing code blocks into neat indented stairs, one misaligned block is falling off with a small red label 'IndentationError'. Keep the original art style, playful mood, 16:9."
---

Cú pháp là luật viết code để Python đọc hiểu được. Luật của Python khá ít, nhưng có một điều khác hẳn C# hay JavaScript: khoảng trắng đầu dòng là một phần của code, không phải để trang trí.

## Thụt lề là cú pháp

Trong C#, khối code nằm trong cặp ngoặc `{ }`. Người mới chuyển sang Python hay tìm ngoặc nhọn và không thấy đâu. Python dùng thụt lề thay cho ngoặc: dòng kết thúc bằng dấu `:` mở ra một khối, các dòng thuộc khối đó phải thụt vào cùng một mức.

```python
hp = 20

if hp < 30:
    print("Máu yếu!")       # Máu yếu!
    print("Uống bình máu đi")  # Uống bình máu đi
print("Tiếp tục chơi")      # Tiếp tục chơi
```

Hai dòng `print` đầu thụt vào 4 dấu cách nên thuộc về `if`, chỉ chạy khi máu dưới 30. Dòng cuối không thụt nên luôn chạy.

Thử đổi `hp = 20` thành `hp = 80`: hai dòng đầu biến mất, chỉ còn "Tiếp tục chơi". Thụt lề quyết định dòng nào thuộc khối nào.

Quy ước chung là thụt 4 dấu cách. VS Code tự đổi phím Tab thành 4 dấu cách trong file `.py`, bạn không cần đếm.

## Lỗi IndentationError

Thụt lề sai thì Python không chạy luôn. Có ba kiểu hay gặp.

Quên thụt sau dấu `:`:

```python
if hp < 30:
print("Máu yếu!")
# IndentationError: expected an indented block after 'if' statement on line 1
```

Thụt thừa ở chỗ không mở khối:

```python
gold = 100
    print(gold)
# IndentationError: unexpected indent
```

Hai dòng trong cùng khối thụt không đều nhau:

```python
if hp < 30:
    print("Máu yếu!")
      print("Uống bình máu đi")
# IndentationError: unexpected indent
```

> **Lỗi hay gặp:** chép code từ web về, trong file lẫn cả Tab và dấu cách. Nhìn bằng mắt thì thẳng hàng, nhưng Python báo `TabError: inconsistent use of tabs and spaces in indentation`. Trong VS Code, bấm `Ctrl+Shift+P`, gõ `Convert Indentation to Spaces` để đổi hết sang dấu cách.

## In ra màn hình với print

`print()` in giá trị ra terminal. Truyền nhiều giá trị cách nhau bằng dấu phẩy, Python tự chèn một dấu cách ở giữa.

```python
enemy = "Goblin"
enemy_hp = 45
print("Quái:", enemy, "Máu:", enemy_hp)  # Quái: Goblin Máu: 45
```

Muốn đổi ký tự ngăn cách hay ký tự cuối dòng thì dùng `sep` và `end`:

```python
print("Kiếm", "Khiên", "Cung", sep=" | ")  # Kiếm | Khiên | Cung
print("Đang tải", end="...")
print("xong")                              # Đang tải...xong
```

Mặc định `print` xuống dòng sau mỗi lần in. `end="..."` thay dấu xuống dòng bằng ba chấm, nên chữ "xong" nằm cùng dòng.

## Comment

Comment là ghi chú cho người đọc, Python bỏ qua. Comment bắt đầu bằng dấu `#`, có thể đứng riêng một dòng hoặc cuối dòng code.

```python
# Sát thương cơ bản của kiếm gỗ
damage = 12
damage = damage * 2  # đòn chí mạng nhân đôi
print(damage)        # 24
```

Python không có cú pháp comment nhiều dòng riêng. Muốn tạm tắt một đoạn code, bôi đen đoạn đó rồi bấm `Ctrl+/` trong VS Code, nó thêm `#` vào đầu mỗi dòng.

Comment nên giải thích **vì sao**, còn code đã nói **làm gì**. `hp = hp - 10  # trừ 10 máu` là comment thừa. `hp = hp - 10  # bẫy gai trừ cố định, không tính giáp` thì có ích.

## Mỗi lệnh một dòng

Python không cần dấu `;` cuối dòng. Mỗi dòng là một lệnh. Dòng quá dài có thể ngắt bên trong cặp ngoặc:

```python
total_gold = (120
              + 45
              + 300)
print(total_gold)  # 465
```

Ở bài tiếp theo, [biến trong Python](/docs/python/bien), bạn sẽ thấy lý do tên biến ở đây toàn viết thường nối bằng gạch dưới.

## Bài tập

Đoạn code sau có hai lỗi thụt lề. Sửa lại để nó in "Lên cấp!" và "Level mới: 6".

```python
exp = 120
level = 5
if exp >= 100:
level = level + 1
    print("Lên cấp!")
  print("Level mới:", level)
```

<details>
<summary>Xem đáp án</summary>

```python
exp = 120
level = 5
if exp >= 100:
    level = level + 1
    print("Lên cấp!")         # Lên cấp!
    print("Level mới:", level)  # Level mới: 6
```

Ba dòng sau `if` đều phải thụt vào cùng 4 dấu cách. Dòng cuối cũng có thể không thụt, khi đó nó luôn chạy, kết quả vẫn giống vậy vì `exp` đủ 100.

</details>
