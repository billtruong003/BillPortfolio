---
title: "Giới thiệu Python"
description: "Python là gì, vì sao nhiều người học nó đầu tiên, và Python được dùng vào đâu: viết tool, tự động hóa, script cho Blender và làm AI."
section: "Bắt đầu"
order: 1
tags: ["python", "giới thiệu", "nhập môn"]
image: /images/docs/python/gioi-thieu.webp
imageIdea: "Nhân vật anime ôm một con trăn đồ chơi màu xanh vàng, sau lưng là bốn cánh cửa ghi 'Tool', 'Tự động', 'Blender', 'AI'."
imagePrompt: "Edit this image: the character is hugging a cute plush python snake in blue and yellow colors, standing in front of four small doors labeled 'Tool', 'Auto', 'Blender', 'AI'. Keep the original art style, cheerful mood, 16:9."
---

Python là một ngôn ngữ lập trình đọc gần giống tiếng Anh, viết ngắn và chạy ngay không cần biên dịch trước. Người mới hay chọn Python làm ngôn ngữ đầu tiên, còn người làm lâu năm dùng nó để viết mấy công cụ nhỏ cho đỡ mất thời gian làm tay.

## Python trông như thế nào

Chỗ người mới hay lo là lập trình phải có cả đống ký hiệu lạ. Với Python thì ít hơn bạn nghĩ. Đây là một chương trình hoàn chỉnh:

```python
hp = 100
damage = 30
hp = hp - damage
print("Máu còn lại:", hp)  # Máu còn lại: 70
```

Không có dấu chấm phẩy cuối dòng, không có ngoặc nhọn, không phải khai báo kiểu dữ liệu. Bạn viết gì thì Python chạy từ trên xuống dưới đúng như thế.

So với C#, cùng một việc thì Python thường ngắn hơn. Đổi lại, Python chạy chậm hơn và ít bắt lỗi sớm hơn, vì nó chỉ phát hiện nhiều lỗi khi chạy tới dòng đó.

## Python dùng vào đâu

Python không phải lựa chọn chính để làm game như Unity (Unity dùng C#). Nhưng quanh việc làm game và làm phần mềm, Python có mặt ở rất nhiều chỗ.

**Viết tool nhỏ.** Đổi tên hàng trăm file ảnh, gộp file CSV cấu hình quái, kiểm tra thư mục asset có thiếu file nào không. Mấy việc này viết bằng Python mất chừng mười dòng.

```python
import os

for file_name in os.listdir("sprites"):
    if file_name.endswith(".png"):
        print("Tìm thấy sprite:", file_name)
```

**Tự động hóa.** Chạy build hằng đêm, tải dữ liệu từ web về, gửi báo cáo. Việc gì lặp đi lặp lại trên máy tính đều có thể giao cho một script Python.

**Script trong Blender.** Blender cho viết Python ngay trong phần mềm để tạo object, đổi vật liệu hàng loạt hay xuất model. Người làm 3D biết chút Python sẽ đỡ rất nhiều thao tác click tay.

**AI và xử lý dữ liệu.** Hầu hết thư viện AI phổ biến (PyTorch, scikit-learn) và công cụ phân tích dữ liệu (pandas) đều viết cho Python. Muốn thử huấn luyện một model nhỏ thì gần như chắc chắn bạn sẽ gặp Python.

## Chạy từng dòng hay chạy cả file

Python có hai cách chạy. Cách thứ nhất là gõ `python` trong terminal để vào chế độ tương tác, gõ một dòng thì thấy kết quả ngay. Dấu `>>>` là chỗ bạn gõ:

```python
>>> 2 + 3
5
>>> "Slime" * 3
'SlimeSlimeSlime'
```

Cách thứ hai là viết code vào file `.py` rồi chạy cả file. Học thử thì dùng cách một, làm tool thật thì dùng cách hai. Bài [Cài đặt Python](/docs/python/cai-dat) chỉ cách làm cả hai.

> **Lỗi hay gặp:** tìm hướng dẫn trên mạng rồi chép code Python 2, ví dụ `print "Hello"` không có ngoặc. Python 3 sẽ báo `SyntaxError: Missing parentheses in call to 'print'`. Python 2 đã ngừng hỗ trợ từ năm 2020, các bài ở đây đều dùng Python 3.12.

## Học theo thứ tự nào

Các bài trong mục Python đi từ dễ tới khó:

1. Cài đặt và cú pháp cơ bản: [cú pháp](/docs/python/cu-phap), [biến](/docs/python/bien).
2. Kiểu dữ liệu: số, chuỗi, bool.
3. Các kiểu gom nhiều giá trị: [list](/docs/python/list), tuple, set, dictionary.
4. Điều khiển luồng: [if else](/docs/python/if-else), vòng lặp.
5. Hàm, class, module, đọc ghi file và bắt lỗi.

Mỗi bài có một bài tập nhỏ ở cuối. Tự gõ lại code thay vì chỉ đọc, vì tay quen thì đầu mới nhớ.

## Bài tập

Chưa cần cài gì. Đọc đoạn code dưới đây và đoán nó in ra gì:

```python
gold = 50
gold = gold + 25
print("Vàng:", gold)
```

<details>
<summary>Xem đáp án</summary>

```python
gold = 50
gold = gold + 25
print("Vàng:", gold)  # Vàng: 75
```

`gold` bắt đầu là 50, cộng thêm 25 thành 75. `print` in chữ "Vàng:" rồi một dấu cách rồi tới giá trị của `gold`.

</details>
