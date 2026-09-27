---
title: "Module và pip trong Python"
description: "Dùng import để lấy code từ module có sẵn, tự viết module riêng, cài thư viện ngoài bằng pip install và tạo môi trường ảo venv cơ bản trong Python."
section: "Công cụ"
order: 21
tags: ["module", "import", "pip", "venv"]
image: /images/docs/python/module-va-pip.webp
imageIdea: "Nhân vật anime đang nhận một thùng hàng từ con chim giao hàng, trên thùng in chữ 'pip install', bên cạnh là balo đã có sẵn mấy túi nhỏ ghi 'random', 'math', 'json'."
imagePrompt: "Edit this image: the character is receiving a delivery crate from a cute delivery bird. The crate is stamped 'pip install'. Next to the character is a backpack with small pouches labeled 'random', 'math', 'json'. Keep the original art style, 16:9."
---

Module là một file Python chứa code để file khác dùng lại. Python có sẵn hàng trăm module (tung xúc xắc, xử lý thời gian, đọc JSON), cộng đồng còn viết thêm hàng trăm nghìn thư viện khác cài qua `pip`. Biết cách lấy code có sẵn thì bạn không phải tự viết lại những thứ người khác đã làm tốt.

## import module có sẵn

Module `random` dùng cho mọi thứ ngẫu nhiên trong game:

```python
import random

damage = random.randint(10, 20)   # số nguyên từ 10 tới 20, tính cả hai đầu
loot = random.choice(["Kiếm", "Khiên", "Vàng"])
print(damage, loot)  # ví dụ: 14 Khiên
```

Sau `import random`, gọi hàm trong module bằng `random.tên_hàm`. Mỗi lần chạy ra kết quả khác nhau.

Muốn gọi tên hàm trực tiếp, dùng `from ... import`:

```python
from random import randint, choice

crit = randint(1, 100) <= 15
print(crit)  # True hoặc False
```

Đặt tên ngắn cho module bằng `as`:

```python
import datetime as dt
print(dt.date.today())  # ví dụ: 2026-09-27
```

Vài module có sẵn hay dùng: `random`, `math`, `time`, `datetime`, `json`, `os`, `pathlib`, `csv`.

> **Lỗi hay gặp:** đặt tên file của bạn trùng tên module. File tên `random.py` mà trong đó viết `import random`, Python sẽ import chính file đó thay vì module chuẩn, rồi báo `AttributeError: module 'random' has no attribute 'randint'`. Đổi tên file thành `dice.py` chẳng hạn, và xóa thư mục `__pycache__` nếu có.

## Tự viết module

Mọi file `.py` đều là module. Tách code thành nhiều file khi chương trình dài ra. Tạo hai file cùng thư mục:

`combat.py`:

```python
BASE_CRIT = 1.5

def calc_damage(attack, defense):
    return max(attack - defense, 1)

def crit_damage(damage):
    return int(damage * BASE_CRIT)
```

`main.py`:

```python
import combat

damage = combat.calc_damage(50, 20)
print(damage)                       # 30
print(combat.crit_damage(damage))   # 45
print(combat.BASE_CRIT)             # 1.5
```

Chạy `python main.py`. Tên module là tên file bỏ đuôi `.py`.

## if __name__ == "__main__"

Khi `import combat`, Python chạy **toàn bộ** file `combat.py`. Nếu trong đó có dòng `print` để thử hàm, nó sẽ in ra cả khi bạn chỉ muốn import.

Cách tách: đặt code chạy thử dưới dòng kiểm tra này.

```python
def calc_damage(attack, defense):
    return max(attack - defense, 1)

if __name__ == "__main__":
    print(calc_damage(50, 20))  # chỉ chạy khi gõ python combat.py
```

Chạy trực tiếp `python combat.py` thì `__name__` là `"__main__"`, khối dưới chạy. Bị import từ file khác thì `__name__` là `"combat"`, khối dưới bị bỏ qua.

## Cài thư viện ngoài bằng pip

`pip` là công cụ cài thư viện đi kèm Python. Thư viện lấy từ PyPI, kho thư viện chung của Python. Ví dụ cài `pygame` để làm game 2D:

```bash
python -m pip install pygame
```

Viết `python -m pip` thay vì chỉ `pip` để chắc chắn thư viện được cài vào đúng bản Python mà lệnh `python` đang dùng. Máy có nhiều bản Python thì hay bị lệch chỗ này.

Vài lệnh pip khác:

```bash
python -m pip list                 # xem đã cài gì
python -m pip install --upgrade pygame
python -m pip uninstall pygame
```

> **Lỗi hay gặp:** `ModuleNotFoundError: No module named 'pygame'`. Hoặc là chưa cài, hoặc cài vào một bản Python khác với bản đang chạy file. Trong VS Code, kiểm tra góc dưới bên phải xem đang chọn Python nào, bấm vào để đổi.

## venv: môi trường ảo

Cài mọi thư viện chung vào một chỗ thì lâu dần sẽ loạn: project A cần bản cũ, project B cần bản mới. Môi trường ảo (virtual environment) là một thư mục chứa Python và thư viện riêng cho từng project.

Tạo và bật venv trong thư mục project trên Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Bật xong, đầu dòng terminal hiện `(.venv)`. Mọi lệnh `pip install` lúc này chỉ cài vào project đó. Tắt bằng lệnh `deactivate`.

Nếu PowerShell báo `running scripts is disabled on this system` khi activate, dùng Command Prompt thay cho PowerShell, hoặc để VS Code tự bật: mở thư mục project, bấm `Ctrl+Shift+P`, chọn **Python: Select Interpreter** rồi chọn bản trong `.venv`.

Lưu danh sách thư viện để người khác cài lại giống hệt:

```bash
python -m pip freeze > requirements.txt
python -m pip install -r requirements.txt
```

Thư mục `.venv` không đưa lên Git, chỉ đưa `requirements.txt`.

## Bài tập

Tạo file `loot.py` có hàm `roll_chest()` trả về một món ngẫu nhiên trong `["Vàng", "Bình máu", "Kiếm hiếm"]`. Trong `main.py`, import hàm đó, gọi 3 lần và in kết quả. Thêm đoạn thử trong `loot.py` sao cho nó không in gì khi bị import.

<details>
<summary>Xem đáp án</summary>

`loot.py`:

```python
import random

def roll_chest():
    return random.choice(["Vàng", "Bình máu", "Kiếm hiếm"])

if __name__ == "__main__":
    print("Thử:", roll_chest())
```

`main.py`:

```python
from loot import roll_chest

for _ in range(3):
    print(roll_chest())
# ví dụ:
# Bình máu
# Vàng
# Bình máu
```

</details>
