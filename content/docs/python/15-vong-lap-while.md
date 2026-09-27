---
title: "Vòng lặp while trong Python"
description: "Vòng lặp while trong Python: lặp khi điều kiện còn đúng, tránh vòng lặp vô tận, dùng break để thoát và continue để bỏ qua một lượt."
section: "Điều khiển luồng"
order: 15
tags: ["while", "vòng lặp", "break", "continue"]
image: /images/docs/python/vong-lap-while.webp
imageIdea: "Nhân vật anime đánh một con slime khổng lồ bằng kiếm gỗ, trên đầu slime có thanh máu gần cạn, một tấm biển nhỏ cắm dưới đất ghi 'while slime_hp > 0:'."
imagePrompt: "Edit this image: the character is repeatedly hitting a giant cute slime with a wooden sword. The slime has a nearly empty health bar above it. A small wooden sign stuck in the ground reads 'while slime_hp > 0:'. Keep the original art style, action pose, 16:9."
---

Vòng lặp `while` chạy đi chạy lại một khối lệnh chừng nào điều kiện còn đúng. Dùng khi bạn không biết trước phải lặp bao nhiêu lần: đánh tới khi quái chết, hỏi tới khi người chơi nhập đúng, chạy game tới khi bấm thoát.

## Cú pháp while

```python
slime_hp = 30
hits = 0

while slime_hp > 0:
    slime_hp -= 12
    hits += 1
    print(f"Chém! Slime còn {slime_hp} máu")

print(f"Hạ slime sau {hits} đòn")
# Chém! Slime còn 18 máu
# Chém! Slime còn 6 máu
# Chém! Slime còn -6 máu
# Hạ slime sau 3 đòn
```

Mỗi vòng, Python kiểm tra `slime_hp > 0`. Còn đúng thì chạy khối bên trong, xong quay lại kiểm tra tiếp. Sai thì thoát vòng lặp và chạy dòng sau nó.

Điều kiện được kiểm tra **trước** mỗi vòng. Nếu ngay từ đầu đã sai, khối bên trong không chạy lần nào.

## Vòng lặp vô tận

Lỗi nặng nhất với `while` là quên làm điều kiện thay đổi:

```python
slime_hp = 30
while slime_hp > 0:
    print("Chém!")
    # quên trừ máu, slime_hp mãi là 30
```

Chương trình in "Chém!" mãi không dừng. Bấm `Ctrl+C` trong terminal để ngắt, Python báo `KeyboardInterrupt`.

> **Lỗi hay gặp:** vòng lặp không bao giờ dừng, terminal chạy chữ liên tục hoặc đứng im. Kiểm tra xem trong thân vòng lặp có dòng nào làm điều kiện tiến dần về `False` không. Bấm `Ctrl+C` để thoát.

Đôi khi lặp vô tận là cố ý. Vòng lặp chính của game chạy mãi cho tới khi người chơi thoát, viết bằng `while True:` kết hợp với `break`.

## break: thoát ngay

`break` thoát khỏi vòng lặp lập tức, không cần đợi điều kiện sai:

```python
while True:
    command = input("Lệnh (attack/quit): ")
    if command == "quit":
        print("Thoát game")
        break
    print("Bạn ra lệnh:", command)
```

Mẫu `while True` + `break` hay dùng khi hỏi người chơi tới lúc nhập đúng:

```python
while True:
    text = input("Chọn độ khó (1-3): ")
    if text in ("1", "2", "3"):
        difficulty = int(text)
        break
    print("Chỉ nhập 1, 2 hoặc 3")

print("Độ khó:", difficulty)
```

## continue: bỏ qua lượt này

`continue` bỏ qua phần còn lại của vòng hiện tại và nhảy lên kiểm tra điều kiện cho vòng sau.

```python
turn = 0
while turn < 6:
    turn += 1
    if turn % 3 == 0:
        print(f"Lượt {turn}: quái bị choáng, bỏ lượt")
        continue
    print(f"Lượt {turn}: quái tấn công")
# Lượt 1: quái tấn công
# Lượt 2: quái tấn công
# Lượt 3: quái bị choáng, bỏ lượt
# Lượt 4: quái tấn công
# Lượt 5: quái tấn công
# Lượt 6: quái bị choáng, bỏ lượt
```

Để ý dòng `turn += 1` đặt **trước** `continue`. Nếu đặt nó ở cuối thân vòng lặp, sau dòng `print`, thì khi `continue` chạy, `turn` không được tăng nữa và vòng lặp kẹt mãi ở một lượt. Ở ví dụ này nó kẹt ngay từ đầu, vì `turn = 0` cũng chia hết cho 3. Đây là cách phổ biến nhất để vô tình tạo ra vòng lặp vô tận.

## while với else

Python có một cú pháp ít gặp: `else` sau `while`. Khối `else` chạy khi vòng lặp kết thúc bình thường (điều kiện thành sai), và **không** chạy nếu thoát bằng `break`.

```python
attempts = 0
secret = 7

while attempts < 3:
    attempts += 1
    guess = attempts * 3   # thử 3, 6, 9
    if guess == secret:
        print("Mở được rương!")
        break
else:
    print("Hết lượt, rương khóa vĩnh viễn")  # Hết lượt, rương khóa vĩnh viễn
```

Không dùng cũng được, nhưng gặp trong code người khác thì biết nó nghĩa là "không bị break".

## while hay for

Biết trước số lần lặp, hoặc cần đi qua từng phần tử của list, thì dùng [vòng lặp for](/docs/python/vong-lap-for). Dùng `while` khi số lần lặp phụ thuộc vào một điều kiện chỉ biết lúc chạy.

```python
# Nên dùng for: biết trước 5 lượt
for turn in range(5):
    print(turn)

# Nên dùng while: không biết mấy đòn thì quái chết
boss_hp = 500
while boss_hp > 0:
    boss_hp -= 73
```

## Bài tập

Người chơi có 100 vàng, mỗi lần quay gacha tốn 30 vàng. Dùng `while` để quay tới khi hết tiền quay. Cứ lượt thứ 2 thì trúng "Kiếm hiếm" và dừng quay luôn. In số vàng còn lại.

<details>
<summary>Xem đáp án</summary>

```python
gold = 100
spins = 0

while gold >= 30:
    gold -= 30
    spins += 1
    print(f"Quay lần {spins}")
    if spins == 2:
        print("Trúng Kiếm hiếm!")
        break

print("Vàng còn:", gold)
# Quay lần 1
# Quay lần 2
# Trúng Kiếm hiếm!
# Vàng còn: 40
```

</details>
