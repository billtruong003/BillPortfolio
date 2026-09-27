---
title: "Try except trong Python"
description: "Bắt lỗi trong Python với try, except, else, finally: bắt đúng loại lỗi cụ thể như ValueError, FileNotFoundError, KeyError và vì sao không nên bắt mọi lỗi."
section: "Công cụ"
order: 23
tags: ["try", "except", "lỗi", "exception", "finally"]
image: /images/docs/python/try-except.webp
imageIdea: "Nhân vật anime cầm vợt bắt bướm, đang tóm gọn một con bọ đỏ có chữ 'ValueError' trên lưng, sau lưng là tấm lưới an toàn ghi 'try / except' căng dưới cây cầu gỗ."
imagePrompt: "Edit this image: the character is holding a butterfly net and catching a small red bug with 'ValueError' written on its back. Behind them, a safety net labeled 'try / except' is stretched under a wooden rope bridge. Keep the original art style, playful mood, 16:9."
---

Khi gặp lỗi lúc chạy, Python dừng chương trình và in ra một đống chữ đỏ. Trong game, người chơi gõ sai một ký tự hay thiếu một file lưu không nên làm sập cả game. `try` và `except` cho bạn bắt lỗi lại và xử lý, để chương trình chạy tiếp.

## Lỗi làm dừng chương trình

```python
bet = int("năm mươi")
print("Dòng này không bao giờ chạy")
# ValueError: invalid literal for int() with base 10: 'năm mươi'
```

Lỗi xảy ra lúc chạy gọi là exception. Mỗi loại lỗi có một tên: `ValueError`, `TypeError`, `KeyError`, `FileNotFoundError`, `ZeroDivisionError`... Tên lỗi là dòng cuối cùng trong thông báo, đọc dòng đó trước.

## try và except

Đặt đoạn code có thể lỗi vào `try`. Nếu lỗi xảy ra, Python nhảy xuống `except` thay vì dừng:

```python
text = "năm mươi"
try:
    bet = int(text)
    print("Cược", bet)
except ValueError:
    print("Phải nhập số")  # Phải nhập số

print("Game vẫn chạy tiếp")  # Game vẫn chạy tiếp
```

Khi `int(text)` lỗi, dòng `print("Cược", bet)` bị bỏ qua, Python chạy khối `except`, rồi tiếp tục bình thường sau đó.

Kết hợp với vòng lặp để hỏi lại tới khi nhập đúng:

```python
while True:
    try:
        amount = int(input("Mua mấy bình máu? "))
        break
    except ValueError:
        print("Nhập một số nguyên")
```

## Bắt lỗi cụ thể

Chỗ người mới hay làm sai là bắt tất cả mọi lỗi:

```python
try:
    damage = calc_damge(50, 20)   # gõ sai tên hàm
except:
    print("Nhập sai")
```

Lỗi thật ở đây là `NameError` vì gõ sai tên hàm. Nhưng `except:` trống nuốt luôn nó và in "Nhập sai", bạn sẽ đi tìm lỗi ở chỗ nhập liệu mà không bao giờ thấy. `except Exception:` cũng có vấn đề y hệt.

> **Lỗi hay gặp:** dùng `except:` trống hoặc `except Exception:` để "cho chắc". Nó giấu cả những lỗi do chính bạn viết sai code. Luôn ghi rõ loại lỗi bạn **dự đoán trước** được, ví dụ `except ValueError:`. Lỗi nào không lường trước thì cứ để nó hiện ra.

Một khối `try` có thể có nhiều `except`, mỗi cái xử lý một loại:

```python
prices = {"Kiếm": 250, "Khiên": 180}

def price_per_slot(item, slots):
    try:
        return prices[item] // slots
    except KeyError:
        print(f"Tiệm không bán {item}")
    except ZeroDivisionError:
        print("Số ô phải lớn hơn 0")

print(price_per_slot("Kiếm", 2))   # 125
price_per_slot("Cung", 2)          # Tiệm không bán Cung
price_per_slot("Khiên", 0)         # Số ô phải lớn hơn 0
```

Gộp nhiều loại lỗi xử lý giống nhau bằng tuple: `except (ValueError, TypeError):`.

## Lấy thông tin lỗi với as

```python
try:
    with open("save.json", encoding="utf-8") as file:
        data = file.read()
except FileNotFoundError as error:
    print("Không tìm thấy file lưu:", error.filename)  # Không tìm thấy file lưu: save.json
```

`as error` gán object lỗi vào biến `error`. In `error` ra sẽ thấy thông báo lỗi đầy đủ, hữu ích để ghi vào file log.

## else: chạy khi không có lỗi

Khối `else` sau `except` chỉ chạy khi `try` **không** có lỗi:

```python
text = "3"
try:
    potions = int(text)
except ValueError:
    print("Nhập sai")
else:
    print(f"Mua {potions} bình máu")  # Mua 3 bình máu
```

Sao không đặt dòng `print` vào trong `try` luôn? Vì như thế nếu chính dòng đó lỗi, `except ValueError` cũng bắt nhầm luôn. Giữ `try` càng ngắn càng tốt, chỉ bọc đúng dòng có thể lỗi, phần còn lại đưa xuống `else`.

## finally: luôn chạy

`finally` chạy dù có lỗi hay không, dù lỗi đã được bắt hay chưa. Dùng cho việc dọn dẹp bắt buộc phải làm:

```python
def load_level(level_id):
    print(f"Hiện màn hình tải level {level_id}")
    try:
        if level_id > 3:
            raise ValueError("Level chưa mở khóa")
        print("Tải xong")
    except ValueError as error:
        print("Lỗi:", error)
    finally:
        print("Ẩn màn hình tải")

load_level(2)
# Hiện màn hình tải level 2
# Tải xong
# Ẩn màn hình tải

load_level(5)
# Hiện màn hình tải level 5
# Lỗi: Level chưa mở khóa
# Ẩn màn hình tải
```

Dù tải được hay không, màn hình tải cũng phải ẩn đi. Với file thì `with` đã tự đóng giúp bạn (xem [Đọc ghi file](/docs/python/doc-ghi-file)), nên `finally` hay dùng cho các việc khác như trên.

`raise` trong ví dụ là cách tự tạo ra lỗi khi phát hiện dữ liệu sai. Hàm của bạn gặp tình huống không xử lý được thì `raise`, để code gọi hàm quyết định làm gì.

## Bài tập

Viết hàm `load_gold()` đọc số vàng từ file `gold.txt`. Nếu file không tồn tại, trả về 0. Nếu file có nội dung không phải số, in "File lưu bị hỏng" và trả về 0. Đọc được thì in "Đã tải" (dùng `else`) và trả về số vàng.

<details>
<summary>Xem đáp án</summary>

```python
def load_gold():
    try:
        with open("gold.txt", encoding="utf-8") as file:
            gold = int(file.read().strip())
    except FileNotFoundError:
        return 0
    except ValueError:
        print("File lưu bị hỏng")
        return 0
    else:
        print("Đã tải")
        return gold

print(load_gold())  # 0 nếu chưa có file gold.txt
```

Thử tạo `gold.txt` chứa `250` rồi chạy lại: in "Đã tải" và `250`. Sửa nội dung thành `abc`: in "File lưu bị hỏng" và `0`.

</details>
