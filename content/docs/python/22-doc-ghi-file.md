---
title: "Đọc ghi file trong Python"
description: "Đọc và ghi file text trong Python bằng open và with, lưu điểm cao vào file, và dùng json.dump, json.load để lưu dữ liệu game có cấu trúc."
section: "Công cụ"
order: 22
tags: ["file", "open", "with", "json", "lưu game"]
image: /images/docs/python/doc-ghi-file.webp
imageIdea: "Nhân vật anime ngồi trước điểm lưu game hình viên pha lê phát sáng, đang nhét một cuộn giấy ghi 'highscore.txt' vào trong, trên cuộn giấy khác đang bay ra ghi 'save.json'."
imagePrompt: "Edit this image: the character is at a glowing crystal save point, inserting a scroll labeled 'highscore.txt' into it, while another scroll labeled 'save.json' floats out. Keep the original art style, magical atmosphere, 16:9."
---

Tắt chương trình là mọi biến biến mất. Muốn giữ điểm cao, cài đặt hay file lưu game cho lần chơi sau, bạn phải ghi xuống file. Python đọc ghi file text bằng hàm `open`, và lưu dữ liệu có cấu trúc bằng module `json`.

## Mở file với with

Người mới hay viết `open` rồi quên `close`. File mở mà không đóng có thể chưa ghi hết dữ liệu xuống đĩa, hoặc bị khóa không cho chương trình khác đọc.

Cách đúng là dùng `with`. Hết khối `with`, Python tự đóng file, kể cả khi giữa chừng có lỗi:

```python
with open("log.txt", "w", encoding="utf-8") as file:
    file.write("Người chơi vào game\n")
# ra khỏi khối with, file đã đóng
```

`open` nhận ba thứ quan trọng:

- Đường dẫn file. Chỉ ghi tên thì file nằm ở thư mục mà terminal đang đứng.
- Chế độ mở: `"r"` đọc (mặc định), `"w"` ghi đè, `"a"` ghi nối vào cuối.
- `encoding="utf-8"` để đọc ghi tiếng Việt có dấu đúng. Trên Windows, bỏ tham số này thì chữ "Kiếm" có thể thành ký tự lạ hoặc báo `UnicodeDecodeError`.

## Ghi file text

`"w"` xóa sạch nội dung cũ rồi ghi mới. `"a"` giữ nội dung cũ, ghi thêm vào cuối.

```python
with open("battle_log.txt", "w", encoding="utf-8") as file:
    file.write("Trận 1: thắng Slime\n")

with open("battle_log.txt", "a", encoding="utf-8") as file:
    file.write("Trận 2: thua Orc\n")
```

`write` không tự xuống dòng, phải thêm `\n` cuối mỗi dòng. Và `write` chỉ nhận chuỗi: `file.write(1500)` báo `TypeError: write() argument must be str, not int`. Dùng f-string hoặc `str()`.

## Đọc file text

```python
with open("battle_log.txt", encoding="utf-8") as file:
    content = file.read()
print(content)
# Trận 1: thắng Slime
# Trận 2: thua Orc
```

Đọc từng dòng bằng vòng lặp `for`, tiết kiệm bộ nhớ hơn với file lớn:

```python
with open("battle_log.txt", encoding="utf-8") as file:
    for line in file:
        print(line.strip())
```

Mỗi dòng đọc ra còn dính `\n` ở cuối. `strip()` bỏ nó đi, nếu không `print` sẽ in thêm một dòng trống.

> **Lỗi hay gặp:** đọc file chưa tồn tại. Lần đầu chạy game chưa có file lưu, `open("save.txt")` báo `FileNotFoundError: [Errno 2] No such file or directory: 'save.txt'`. Kiểm tra trước bằng `os.path.exists` hoặc bắt lỗi bằng [try except](/docs/python/try-except).

## Lưu điểm cao vào file

Ghép lại thành một hệ thống điểm cao hoàn chỉnh:

```python
import os

HIGHSCORE_FILE = "highscore.txt"

def load_highscore():
    if not os.path.exists(HIGHSCORE_FILE):
        return 0
    with open(HIGHSCORE_FILE, encoding="utf-8") as file:
        return int(file.read().strip())

def save_highscore(score):
    with open(HIGHSCORE_FILE, "w", encoding="utf-8") as file:
        file.write(str(score))

best = load_highscore()
score = 1350

if score > best:
    print(f"Kỷ lục mới! {best} lên {score}")
    save_highscore(score)
else:
    print(f"Kỷ lục vẫn là {best}")
```

Lần đầu chạy in "Kỷ lục mới! 0 lên 1350". Chạy lần hai in "Kỷ lục vẫn là 1350", vì số đã nằm trong file.

Để ý `int(...)` khi đọc: file chỉ chứa chữ, đọc ra luôn là chuỗi `"1350"`, phải [ép kiểu](/docs/python/ep-kieu) mới so sánh với số được.

## Lưu dữ liệu game bằng JSON

Điểm cao chỉ là một con số. File lưu game thì có tên, level, vàng, kho đồ... Tự ghi từng dòng rồi tự tách ra thì rất dễ sai. JSON là định dạng text lưu được [dictionary](/docs/python/dictionary) và [list](/docs/python/list) lồng nhau, và module `json` có sẵn làm hết phần chuyển đổi.

`json.dump` ghi dict xuống file:

```python
import json

save_data = {
    "name": "Aki",
    "level": 12,
    "gold": 3400,
    "inventory": ["Kiếm sắt", "Bình máu", "Bình máu"],
}

with open("save.json", "w", encoding="utf-8") as file:
    json.dump(save_data, file, ensure_ascii=False, indent=2)
```

File `save.json` tạo ra trông như sau:

```json
{
  "name": "Aki",
  "level": 12,
  "gold": 3400,
  "inventory": [
    "Kiếm sắt",
    "Bình máu",
    "Bình máu"
  ]
}
```

`indent=2` để file xuống dòng dễ đọc. `ensure_ascii=False` để giữ nguyên tiếng Việt, không có nó thì "Kiếm" bị ghi thành `"Ki\u1ebfm"` (vẫn đọc lại đúng, chỉ khó nhìn).

`json.load` đọc lại thành dict:

```python
import json

with open("save.json", encoding="utf-8") as file:
    loaded = json.load(file)

print(loaded["name"])            # Aki
print(loaded["level"] + 1)       # 13
print(len(loaded["inventory"]))  # 3
```

Khác với file text, số đọc từ JSON đã là `int` sẵn, không cần ép kiểu.

JSON chỉ lưu được các kiểu cơ bản: dict, list, chuỗi, số, `True`/`False`, `None`. Tuple được lưu thành list. Object của [class](/docs/python/class-va-object) tự viết thì không lưu thẳng được, báo `TypeError: Object of type Enemy is not JSON serializable`. Chuyển object thành dict trước khi lưu.

## Bài tập

Viết hàm `add_kill(monster)` đọc file `kills.json` (nếu chưa có thì coi như dict rỗng), cộng thêm 1 cho loại quái đó, rồi ghi lại. Gọi `add_kill("Slime")` hai lần và `add_kill("Orc")` một lần, sau đó đọc file và in kết quả.

<details>
<summary>Xem đáp án</summary>

```python
import json
import os

KILLS_FILE = "kills.json"

def add_kill(monster):
    kills = {}
    if os.path.exists(KILLS_FILE):
        with open(KILLS_FILE, encoding="utf-8") as file:
            kills = json.load(file)

    kills[monster] = kills.get(monster, 0) + 1

    with open(KILLS_FILE, "w", encoding="utf-8") as file:
        json.dump(kills, file, ensure_ascii=False, indent=2)

add_kill("Slime")
add_kill("Slime")
add_kill("Orc")

with open(KILLS_FILE, encoding="utf-8") as file:
    print(json.load(file))  # {'Slime': 2, 'Orc': 1}
```

Kết quả trên là lần chạy đầu tiên. Chạy lại lần nữa thì số sẽ cộng dồn, vì file vẫn còn.

</details>
