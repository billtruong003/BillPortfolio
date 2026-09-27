---
title: "Cách chạy JavaScript"
description: "Bốn cách chạy JavaScript: thẻ script trong HTML, file .js riêng, Console của trình duyệt và Node.js 20 trong cửa sổ dòng lệnh."
section: "Bắt đầu"
order: 2
tags: ["script", "console", "node", "chạy code"]
image: /images/docs/javascript/chay-javascript.webp
imageIdea: "Nhân vật anime bấm phím F12 thật to trên bàn phím, cửa sổ Console bật ra như một cánh cửa bí mật trong game."
imagePrompt: "Edit this image: the character dramatically presses a giant F12 key on a keyboard, and a glowing developer console window pops out like a secret door with the text 'Console' on top. Keep the original art style, 16:9."
---

Viết JavaScript xong thì phải có chỗ chạy nó. Trang này đi qua bốn cách hay dùng nhất, từ nhanh nhất (gõ thẳng vào Console) tới cách dùng cho dự án thật (file `.js` riêng).

## Gõ thẳng vào Console của trình duyệt

Muốn thử một dòng code thì không cần tạo file. Mở trình duyệt, bấm **F12** (hoặc Ctrl+Shift+J trên Chrome), chọn tab **Console**, gõ code rồi bấm Enter.

```js
let score = 0;
score = score + 10;
console.log(score); // 10
```

Console hợp để thử nhanh. Nhưng tải lại trang là mất sạch, nên đừng viết cả game trong đó.

> **Lỗi hay gặp:** dán code vào Console lần hai thì bị `SyntaxError: Identifier 'score' has already been declared`. Biến `let` đã tồn tại từ lần dán trước. Tải lại trang (F5) rồi dán lại.

## Thẻ `<script>` trong HTML

Muốn code chạy mỗi khi mở trang thì đặt nó trong thẻ `<script>`. Tạo file `index.html`:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Mini game</title>
</head>
<body>
  <h1>Điểm: <span id="score">0</span></h1>

  <script>
    const scoreText = document.querySelector("#score");
    scoreText.textContent = 50;
  </script>
</body>
</html>
```

Mở file bằng trình duyệt, dòng chữ sẽ là "Điểm: 50".

Để ý chỗ đặt thẻ `<script>`: nằm cuối `<body>`, sau thẻ `<span>`. Nếu đặt nó trong `<head>`, code chạy trước khi trình duyệt dựng xong trang, `querySelector` không tìm thấy gì và trả về `null`. Dòng sau sẽ báo `TypeError: Cannot set properties of null`.

## File .js riêng

Code dài lên thì nhét hết vào HTML rất khó đọc. Cách làm quen thuộc là tách ra file riêng, ví dụ `game.js`:

```js
// game.js
const scoreText = document.querySelector("#score");
scoreText.textContent = 50;
console.log("Game đã tải xong");
```

Rồi trong HTML chỉ cần trỏ tới file đó:

```html
<body>
  <h1>Điểm: <span id="score">0</span></h1>
  <script src="game.js"></script>
</body>
```

Thẻ `<script src="...">` phải để trống bên trong. Code viết giữa cặp thẻ có `src` sẽ bị bỏ qua.

Nếu muốn đặt thẻ trong `<head>` cho gọn, thêm chữ `defer`. Trình duyệt sẽ tải file song song và đợi trang dựng xong mới chạy:

```html
<head>
  <script src="game.js" defer></script>
</head>
```

## Chạy bằng Node.js

Với code không đụng tới trang web (tính toán, xử lý dữ liệu), bạn chạy thẳng trong cửa sổ dòng lệnh bằng Node. Cài Node 20 hoặc mới hơn từ trang nodejs.org, rồi gõ trong terminal để kiểm tra:

```bash
node -v
```

Terminal in ra phiên bản dạng `v20.x.x` là được.

Tạo file `damage.js`:

```js
const baseDamage = 12;
const critMultiplier = 2;
console.log("Sát thương chí mạng:", baseDamage * critMultiplier);
```

Chạy file bằng lệnh:

```bash
node damage.js
```

Kết quả hiện ngay trong terminal:

```text
Sát thương chí mạng: 24
```

Node không có `document`, vì không có trang web nào cả. Viết `document.querySelector` trong file chạy bằng Node sẽ gặp `ReferenceError: document is not defined`.

## Nên dùng cách nào

- Thử một dòng: Console.
- Làm game trên web: file `.js` riêng, gắn bằng `<script src>`.
- Tool, bài tập tính toán: Node.

Các trang sau dùng `console.log` để in kết quả, chạy được ở cả Console lẫn Node. Chi tiết về cách in có ở trang [Output](/docs/javascript/output).

## Bài tập

Tạo file `index.html` có thẻ `<p id="hp">100</p>` và một file `game.js` đổi chữ trong thẻ đó thành `75`. Gắn file bằng `defer` trong `<head>`.

<details>
<summary>Xem đáp án</summary>

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <script src="game.js" defer></script>
</head>
<body>
  <p id="hp">100</p>
</body>
</html>
```

```js
// game.js
document.querySelector("#hp").textContent = 75;
```

</details>
