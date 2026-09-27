---
title: "Module trong JavaScript"
description: "Chia code JavaScript thành nhiều file bằng module: export, import, export default, thẻ script type=\"module\" và các lỗi hay gặp khi chạy module."
section: "Dữ liệu"
order: 21
tags: ["module", "import", "export"]
image: /images/docs/javascript/module.webp
imageIdea: "Nhân vật anime lắp ráp một con robot từ các khối lego, mỗi khối là một file có nhãn 'player.js', 'enemy.js', 'ui.js', các khối nối với nhau bằng đầu cắm ghi 'import' và 'export'."
imagePrompt: "Edit this image: the character assembles a toy robot from colorful building blocks, each block labeled 'player.js', 'enemy.js' and 'ui.js', with connectors between them labeled 'import' and 'export'. Keep the original art style, 16:9."
---

Game lớn dần thì một file `game.js` dài 1000 dòng rất khó sửa. Module cho bạn chia code thành nhiều file nhỏ, mỗi file lo một việc: `player.js` lo nhân vật, `ui.js` lo giao diện. File nào cần gì thì `import` thứ đó từ file khác.

## Vấn đề khi không có module

Cách cũ là gắn nhiều thẻ `<script>` liên tiếp. Mọi biến ở cấp ngoài cùng của mọi file dùng chung một chỗ. File `player.js` có `let hp`, file `enemy.js` cũng có `let hp`, trình duyệt báo `SyntaxError: Identifier 'hp' has already been declared` và file sau không chạy. Thứ tự thẻ script cũng phải đúng, không thì hàm gọi tới chưa tồn tại.

Module sửa cả hai: mỗi file có phạm vi riêng, và file tự nói nó cần gì từ file nào.

## export: cho file khác dùng

Mặc định, mọi thứ trong module là riêng tư. Muốn chia sẻ thì ghi `export` phía trước.

```js
// combat.js
export const MAX_HP = 100;

export function calcDamage(attack, defense) {
  return Math.max(1, attack - defense);
}

function rollCrit() {
  return Math.random() < 0.1;
}
```

`MAX_HP` và `calcDamage` dùng được ở file khác. `rollCrit` không có `export` nên chỉ dùng trong `combat.js`.

## import: lấy thứ file khác chia sẻ

```js
// game.js
import { MAX_HP, calcDamage } from "./combat.js";

let enemyHp = MAX_HP;
enemyHp -= calcDamage(20, 5);
console.log(enemyHp); // 85
```

Tên trong ngoặc nhọn phải trùng tên đã `export`. Đổi tên lúc import bằng `as`:

```js
import { calcDamage as damageOf } from "./combat.js";
```

> **Lỗi hay gặp:** viết `from "combat.js"` hoặc `from "./combat"`. Trình duyệt cần đường dẫn đầy đủ, bắt đầu bằng `./` hoặc `../` và có đuôi `.js`. Thiếu `./` sẽ báo `TypeError: Failed to resolve module specifier "combat.js"`. Thiếu đuôi `.js` thì trình duyệt tải không được file, Console báo lỗi 404.

## export default

Mỗi file có thể có một `export default`, là thứ chính của file đó. Import nó thì không cần ngoặc nhọn, và tự đặt tên tuỳ ý.

```js
// Enemy.js
export default class Enemy {
  constructor(name, hp) {
    this.name = name;
    this.hp = hp;
  }
}
```

```js
// game.js
import Enemy from "./Enemy.js";

const slime = new Enemy("Slime", 30);
console.log(slime.name); // Slime
```

Nhiều người chọn chỉ dùng export có tên (named export) cho cả dự án. Tên cố định giúp tìm kiếm dễ hơn và editor tự gợi ý import chính xác hơn. Loạt bài này ưu tiên named export.

## Chạy module trên trình duyệt

Thêm `type="module"` vào thẻ script. Chỉ cần gắn file đầu vào, các file khác được tải qua `import`.

```html
<body>
  <p>Máu: <span id="hp">100</span></p>
  <script type="module" src="game.js"></script>
</body>
```

Thiếu `type="module"` thì dòng `import` đầu tiên báo `SyntaxError: Cannot use import statement outside a module`.

Script module có vài điểm khác script thường:

- Tự động chạy như có `defer`: đợi trang dựng xong mới chạy, đặt trong `<head>` cũng được.
- Dùng được `await` ở cấp ngoài cùng, không cần bọc trong hàm `async` (xem trang [Async await](/docs/javascript/async-await)).
- Luôn chạy ở strict mode, nên gán vào biến chưa khai báo sẽ báo lỗi thay vì âm thầm tạo biến.
- Cần chạy qua server. Mở file bằng `file://` thì trình duyệt chặn tải module. Dùng Live Server của VS Code hoặc `npx serve`.

## Chạy module bằng Node

Node 20 hiểu `import`/`export` khi file có đuôi `.mjs`, hoặc khi `package.json` có dòng `"type": "module"`:

```json
{
  "type": "module"
}
```

Sau đó `node game.js` chạy được với `import` như trên trình duyệt.

## Một cấu trúc gợi ý cho mini game

```text
index.html
js/
  game.js      điểm vào, gắn sự kiện
  combat.js    calcDamage, MAX_HP
  ui.js        updateHpText, showMessage
  storage.js   loadHighScores, saveScore
```

`storage.js` là chỗ hợp để đặt hai hàm lưu điểm ở trang [JSON](/docs/javascript/json). `ui.js` gom các hàm sửa [DOM](/docs/javascript/dom).

## Bài tập

Tạo `ui.js` export hàm `setScore(value)` ghi `value` vào `#score`. Trong `game.js`, import hàm đó và gọi `setScore(42)`. Viết cả thẻ script trong HTML.

<details>
<summary>Xem đáp án</summary>

```js
// js/ui.js
const scoreText = document.querySelector("#score");

export function setScore(value) {
  scoreText.textContent = value;
}
```

```js
// js/game.js
import { setScore } from "./ui.js";

setScore(42);
```

```html
<p>Điểm: <span id="score">0</span></p>
<script type="module" src="js/game.js"></script>
```

Đường dẫn `./ui.js` tính từ vị trí của `game.js`, không phải từ `index.html`.

</details>
