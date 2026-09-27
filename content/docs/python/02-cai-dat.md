---
title: "Cài đặt Python trên Windows"
description: "Cài Python 3.12 trên Windows, chạy lệnh python và py, dùng VS Code để viết file .py và sửa lỗi 'python' is not recognized."
section: "Bắt đầu"
order: 2
tags: ["cài đặt", "vs code", "windows"]
image: /images/docs/python/cai-dat.webp
imageIdea: "Nhân vật anime đang kéo thanh tiến trình cài đặt khổng lồ như kéo dây thừng, trên thanh ghi 'Python 3.12 ... 87%', một ô checkbox 'Add to PATH' được đánh dấu to tướng."
imagePrompt: "Edit this image: the character is pulling a giant installation progress bar like a rope, the bar reads 'Python 3.12 ... 87%', and a big checked checkbox next to it reads 'Add python.exe to PATH'. Keep the original art style, 16:9."
---

Trước khi viết dòng Python đầu tiên, máy bạn cần có trình thông dịch Python: chương trình đọc file `.py` và chạy nó. Bài này cài Python 3.12 trên Windows, cài VS Code để viết code, và sửa lỗi hay gặp nhất khi mới cài.

## Tải và cài Python

Chỗ người mới hay sai là bấm Install ngay mà bỏ qua một ô checkbox ở màn hình đầu tiên. Ô đó quyết định bạn có gõ được `python` trong terminal hay không.

Làm theo thứ tự:

1. Vào trang python.org, mục Downloads, tải bản Python 3.12 cho Windows (file `python-3.12.x-amd64.exe`).
2. Mở file cài. Ở màn hình đầu, đánh dấu ô **Add python.exe to PATH**.
3. Bấm **Install Now** và đợi xong.

PATH là danh sách thư mục mà Windows tìm khi bạn gõ tên một lệnh. Thêm Python vào PATH thì gõ `python` ở đâu cũng chạy được.

## Kiểm tra đã cài được chưa

Mở PowerShell hoặc Command Prompt (bấm phím Windows, gõ `powershell`). Gõ:

```bash
python --version
```

Nếu thấy `Python 3.12.x` là xong. Windows còn có sẵn lệnh `py`, gọi là Python Launcher. Nó hữu ích khi máy có nhiều bản Python:

```bash
py --version
py -3.12 --version
```

Trên Windows, `python` và `py` đều chạy Python được. Các bài sau viết `python`, nếu máy bạn chỉ chạy được `py` thì cứ thay vào.

> **Lỗi hay gặp:** gõ `python` và nhận về `'python' is not recognized as an internal or external command` (hoặc trong PowerShell là `The term 'python' is not recognized`). Nguyên nhân gần như luôn là quên tick ô Add to PATH. Cách sửa nhanh nhất: chạy lại file cài, chọn **Modify**, bấm Next và tick **Add Python to environment variables**. Xong thì đóng terminal cũ, mở cái mới rồi thử lại.

Một trường hợp khác: gõ `python` mà Windows mở Microsoft Store. Đó là lối tắt giả của Windows. Vào Settings, tìm **App execution aliases**, tắt hai dòng `python.exe` và `python3.exe`.

## Thử chế độ tương tác

Gõ `python` không kèm gì, bạn vào chế độ tương tác với dấu nhắc `>>>`:

```python
>>> print("Xin chào, người chơi mới")
Xin chào, người chơi mới
>>> 100 - 35
65
>>> exit()
```

Chế độ này tiện để thử nhanh một dòng. Gõ `exit()` để thoát.

## Cài VS Code

Viết chương trình dài thì cần một trình soạn code. VS Code miễn phí và dùng tốt cho Python.

1. Tải VS Code từ code.visualstudio.com và cài.
2. Mở VS Code, bấm biểu tượng Extensions ở thanh bên trái (hoặc `Ctrl+Shift+X`).
3. Tìm **Python** của Microsoft và bấm Install.

Extension này cho bạn tô màu code, gợi ý khi gõ và nút chạy file.

## Viết và chạy file .py đầu tiên

Tạo một thư mục, ví dụ `hoc-python`, rồi mở nó trong VS Code bằng File > Open Folder. Tạo file mới tên `main.py` và gõ:

```python
player_name = "Aki"
gold = 120
print("Người chơi:", player_name)  # Người chơi: Aki
print("Vàng:", gold)               # Vàng: 120
```

Có hai cách chạy:

- Bấm nút tam giác ở góc trên bên phải VS Code.
- Mở terminal trong VS Code bằng menu Terminal > New Terminal và gõ:

```bash
python main.py
```

Terminal phải đang đứng ở đúng thư mục chứa `main.py`. Nếu báo `can't open file ... No such file or directory` thì bạn đang đứng sai chỗ, dùng `cd` để vào đúng thư mục.

> **Lỗi hay gặp:** đặt tên file trùng tên module có sẵn của Python, ví dụ `random.py` hay `json.py`. Sau này khi `import random`, Python sẽ lấy nhầm file của bạn và báo lỗi khó hiểu. Đặt tên file riêng như `game.py`, `main.py`.

Bài tiếp theo: [Cú pháp Python](/docs/python/cu-phap).

## Bài tập

Tạo file `hero.py` in ra ba dòng: tên nhân vật, level và số máu. Chạy nó bằng lệnh trong terminal.

<details>
<summary>Xem đáp án</summary>

```python
hero_name = "Rin"
level = 5
hp = 240

print("Tên:", hero_name)  # Tên: Rin
print("Level:", level)    # Level: 5
print("Máu:", hp)         # Máu: 240
```

Chạy bằng:

```bash
python hero.py
```

</details>
