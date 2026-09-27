---
title: "Sự kiện trong JavaScript"
description: "Bắt sự kiện trong JavaScript bằng addEventListener: click chuột, phím keydown, object event, và làm một nút tấn công tăng điểm cho mini game."
section: "Trình duyệt"
order: 18
tags: ["sự kiện", "addEventListener", "click", "keydown"]
image: /images/docs/javascript/su-kien.webp
imageIdea: "Nhân vật anime đập mạnh vào một nút bấm arcade to màu đỏ ghi 'click', phía trên bảng điểm nhảy '+10' kèm tia sáng, bên cạnh là một chú mèo đang ngồi trên phím Space."
imagePrompt: "Edit this image: the character slams a big red arcade button labeled 'click', a scoreboard above pops '+10' with sparkles, and a small cat sits on a keyboard Space key labeled 'keydown' nearby. Keep the original art style, 16:9."
---

Sự kiện (event) là thứ xảy ra trên trang: người chơi bấm chuột, nhấn phím, rê chuột qua một nút. JavaScript lắng nghe các sự kiện đó và chạy hàm bạn đưa cho. Đây là chỗ mini game bắt đầu có người chơi thật.

Ví dụ trong trang này chạy trên trình duyệt.

## addEventListener

```html
<p>Điểm: <span id="score">0</span></p>
<button id="attack-btn">Tấn công</button>
<script src="game.js"></script>
```

```js
const attackBtn = document.querySelector("#attack-btn");

attackBtn.addEventListener("click", () => {
  console.log("Tấn công!");
});
```

`addEventListener` nhận hai thứ: tên sự kiện (`"click"`) và một hàm. Hàm đó chưa chạy lúc này. Trình duyệt giữ nó lại và gọi mỗi lần nút được bấm. Hàm kiểu này gọi là event handler.

> **Lỗi hay gặp:** truyền kết quả của hàm thay vì truyền hàm: `attackBtn.addEventListener("click", attack());`. Có ngoặc tròn nghĩa là `attack` chạy ngay một lần lúc tải trang, rồi thứ được gắn vào nút là giá trị nó trả về (thường là `undefined`). Bấm nút không có gì xảy ra. Viết `attack` không có ngoặc, hoặc bọc trong arrow function.

## Ví dụ: nút tấn công tăng điểm

```js
const attackBtn = document.querySelector("#attack-btn");
const scoreText = document.querySelector("#score");
let score = 0;

function attack() {
  score += 10;
  scoreText.textContent = score;
}

attackBtn.addEventListener("click", attack);
// bấm 3 lần: Điểm: 30
```

Chú ý dòng cuối truyền `attack`, không có ngoặc. Trình duyệt tự gọi `attack()` khi có click.

Biến `score` nằm ngoài hàm, nên giá trị được giữ lại giữa các lần bấm. Nếu khai báo `let score = 0` bên trong `attack`, mỗi lần bấm điểm lại về 0 rồi cộng 10, lúc nào cũng hiện 10.

## Object event

Hàm xử lý nhận một tham số là object `event`, chứa thông tin về sự kiện vừa xảy ra.

```js
attackBtn.addEventListener("click", (event) => {
  console.log(event.type);   // click
  console.log(event.target); // <button id="attack-btn">Tấn công</button>
});
```

`event.target` là phần tử được bấm. Nó có ích khi nhiều nút dùng chung một hàm.

## Bàn phím với keydown

Sự kiện bàn phím thường gắn vào `document`, vì người chơi nhấn phím ở đâu trên trang cũng được.

```js
document.addEventListener("keydown", (event) => {
  console.log(event.key);
});
// nhấn a: a
// nhấn Space: " " (một dấu cách)
// nhấn mũi tên trái: ArrowLeft
```

`event.key` là tên phím. Kết hợp với [switch](/docs/javascript/switch) để điều khiển nhân vật:

```js
let x = 0;

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      x -= 10;
      break;
    case "ArrowRight":
    case "d":
      x += 10;
      break;
    case " ":
      attack();
      break;
  }
  console.log("Vị trí:", x);
});
```

Người mới hay so `event.key` với `"A"` hoa. Khi Caps Lock bật hoặc giữ Shift, `event.key` là `"A"`, còn bình thường là `"a"`. Nếu muốn bắt theo vị trí phím bất kể kiểu chữ, dùng `event.code`: phím A luôn là `"KeyA"`.

Giữ phím thì `keydown` bắn liên tục. Muốn chỉ tính lần nhấn đầu, bỏ qua khi `event.repeat` là `true`:

```js
document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Space") attack();
});
```

Phím Space trên trang có thanh cuộn sẽ cuộn trang xuống. Gọi `event.preventDefault()` trong handler để chặn hành vi mặc định đó.

## Gỡ listener

Game over thì nút tấn công không nên cộng điểm nữa. `removeEventListener` gỡ handler ra, nhưng phải truyền đúng hàm đã gắn:

```js
attackBtn.removeEventListener("click", attack);
```

Đây là lý do nên đặt tên hàm như `attack` thay vì viết arrow function tại chỗ: arrow function viết tại chỗ không có tên để gỡ. Cách khác là tắt nút bằng `attackBtn.disabled = true`.

## Bài tập

Làm mini game: nút "Tấn công" trừ 15 máu của quái 100 máu, cập nhật `#enemy-hp`. Phím Space cũng tấn công. Máu về 0 thì hiện "Thắng!" trong `#message` và tắt nút.

<details>
<summary>Xem đáp án</summary>

```html
<p>Máu quái: <span id="enemy-hp">100</span></p>
<p id="message"></p>
<button id="attack-btn">Tấn công</button>
<script src="game.js"></script>
```

```js
const attackBtn = document.querySelector("#attack-btn");
const hpText = document.querySelector("#enemy-hp");
const message = document.querySelector("#message");
let enemyHp = 100;

function attack() {
  if (enemyHp <= 0) return;
  enemyHp = Math.max(0, enemyHp - 15);
  hpText.textContent = enemyHp;
  if (enemyHp === 0) {
    message.textContent = "Thắng!";
    attackBtn.disabled = true;
  }
}

attackBtn.addEventListener("click", attack);
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    attack();
  }
});
```

</details>
