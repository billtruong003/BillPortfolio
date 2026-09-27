---
title: "Output trong JavaScript"
description: "Các cách hiện kết quả trong JavaScript: console.log để debug, textContent để hiện lên trang, alert để báo nhanh, và vì sao bỏ document.write."
section: "Bắt đầu"
order: 3
tags: ["console.log", "textContent", "alert", "output"]
image: /images/docs/javascript/output.webp
imageIdea: "Nhân vật anime cầm loa hét vào ba cái bảng: bảng 'console.log' cho dev, bảng điểm 'textContent' cho người chơi, và một bảng 'alert' đang bật popup đỏ chói."
imagePrompt: "Edit this image: the character holds a megaphone and shouts toward three signboards, one labeled 'console.log', one scoreboard labeled 'textContent' showing 'Score: 120', and one flashing red popup labeled 'alert'. Keep the original art style, 16:9."
---

Output là cách chương trình cho bạn (hoặc người chơi) thấy kết quả. JavaScript có vài cách in ra, mỗi cách cho một người xem khác nhau. Chọn sai cách thì người chơi thấy dòng debug, còn bạn thì không thấy gì.

## console.log: in cho người viết code

`console.log` in ra Console của trình duyệt (F12) hoặc terminal khi chạy bằng Node. Người chơi không thấy dòng này, nên đây là chỗ để kiểm tra giá trị khi debug.

```js
let hp = 100;
console.log(hp); // 100

hp = hp - 30;
console.log("Máu sau khi trúng đòn:", hp); // Máu sau khi trúng đòn: 70
```

Truyền nhiều giá trị, ngăn bằng dấu phẩy, `console.log` sẽ in cách nhau một dấu cách. In cả object cũng được:

```js
const player = { name: "Aki", level: 3 };
console.log(player); // { name: 'Aki', level: 3 }
```

Ngoài `log` còn có `console.warn` (dòng vàng) và `console.error` (dòng đỏ), tiện để lọc khi Console quá nhiều chữ.

```js
console.warn("Máu thấp!");
console.error("Không tìm thấy file level");
```

## textContent: hiện lên trang cho người chơi

Người chơi nhìn trang web, không mở Console. Muốn họ thấy điểm số thì phải ghi nó vào một thẻ HTML. Cách an toàn là đổi `textContent` của thẻ đó.

```html
<p>Điểm: <span id="score">0</span></p>

<script>
  let score = 0;
  score = score + 15;
  document.querySelector("#score").textContent = score;
  // trang hiện: Điểm: 15
</script>
```

Có một thuộc tính gần giống là `innerHTML`. Nó hiểu chuỗi như HTML, nên nếu chuỗi đến từ người chơi (tên nhân vật chẳng hạn) thì họ có thể chèn thẻ `<img onerror=...>` và chạy code lạ trên trang. Với chữ và số thông thường, dùng `textContent`. Cách tìm và sửa thẻ HTML có đầy đủ ở trang [DOM](/docs/javascript/dom).

## alert: bật hộp thông báo

`alert` bật một hộp thoại giữa màn hình, người dùng phải bấm OK mới làm tiếp được.

```js
alert("Game over! Điểm của bạn: 120");
```

Nghe tiện, nhưng trong lúc hộp thoại mở, toàn bộ code trên trang dừng lại. Game đang chạy vòng lặp sẽ đứng hình. Dùng `alert` để thử nhanh thì được, còn trong game thật nên hiện thông báo bằng một thẻ HTML.

`alert` chỉ có trên trình duyệt. Chạy bằng Node sẽ gặp `ReferenceError: alert is not defined`.

## Đừng dùng document.write

Nhiều bài hướng dẫn cũ dùng `document.write` để in ra trang. Cách này đã lỗi thời.

```js
// Đừng làm thế này
document.write("Điểm: 10");
```

Vấn đề là nếu `document.write` chạy sau khi trang tải xong (ví dụ khi bấm nút), nó xoá sạch cả trang rồi mới ghi chữ mới. Game của bạn biến mất, chỉ còn dòng "Điểm: 10". Trình duyệt cũng in cảnh báo khi thấy nó. Thay bằng `textContent`.

> **Lỗi hay gặp:** gọi `document.write` trong hàm xử lý click, bấm nút xong cả trang trắng xoá. Không có mã lỗi nào hiện ra, nên rất khó đoán. Nếu trang tự dưng mất hết, tìm `document.write` trong code trước.

## Chọn cách nào

| Cách | Ai thấy | Dùng khi |
|---|---|---|
| `console.log` | Người viết code | Debug, kiểm tra giá trị |
| `textContent` | Người chơi | Hiện điểm, máu, thông báo trong game |
| `alert` | Người chơi | Thử nhanh, không dùng trong game thật |

## Bài tập

Có biến `gold = 40`. Người chơi nhặt thêm 25 vàng. In số vàng mới ra Console, rồi ghi nó vào thẻ `<span id="gold">`.

<details>
<summary>Xem đáp án</summary>

```html
<p>Vàng: <span id="gold">0</span></p>

<script>
  let gold = 40;
  gold = gold + 25;
  console.log(gold); // 65
  document.querySelector("#gold").textContent = gold;
</script>
```

</details>
