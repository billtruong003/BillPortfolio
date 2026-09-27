---
title: "Biến trong JavaScript"
description: "Khai báo biến trong JavaScript bằng let và const, vì sao không dùng var nữa, quy tắc đặt tên và lỗi ReferenceError hay gặp."
section: "Cơ bản"
order: 5
tags: ["biến", "let", "const", "var"]
image: /images/docs/javascript/bien.webp
imageIdea: "Nhân vật anime xếp hai loại hũ lên kệ: hũ nắp mở ghi 'let hp' đang được đổ thêm nước máu, hũ khoá kín bằng ổ khoá ghi 'const MAX_HP'."
imagePrompt: "Edit this image: the character arranges jars on a shelf, an open jar labeled 'let hp' being refilled with red liquid, and a jar sealed with a small padlock labeled 'const MAX_HP = 100'. Keep the original art style, 16:9."
---

Biến là một cái tên gắn với một giá trị. Máu của nhân vật, điểm số, tên người chơi: mỗi thứ nằm trong một biến để code đọc và đổi được. JavaScript hiện nay khai báo biến bằng hai từ khóa: `let` và `const`.

## Khai báo bằng let

Dùng `let` cho giá trị sẽ đổi trong lúc chơi.

```js
let hp = 100;
let playerName = "Aki";
let isAlive = true;
```

Đọc dòng đầu: tạo biến tên `hp`, gán giá trị `100`. Khác với C# hay Java, JS không bắt bạn ghi kiểu dữ liệu. Biến tự mang kiểu của giá trị đang giữ.

Đổi giá trị thì chỉ viết tên, không viết lại `let`:

```js
let hp = 100;
hp = 80;        // trúng đòn
hp = hp + 15;   // uống bình máu
console.log(hp); // 95
```

> **Lỗi hay gặp:** viết `let hp = 80;` lần thứ hai trong cùng một khối. JS báo `SyntaxError: Identifier 'hp' has already been declared`. Lần gán sau chỉ cần `hp = 80;`.

## Khai báo bằng const

Dùng `const` cho giá trị không gán lại. Gán lại sẽ báo lỗi ngay lúc chạy.

```js
const MAX_HP = 100;
MAX_HP = 120; // TypeError: Assignment to constant variable.
```

Thói quen tốt: mặc định dùng `const`, chỉ đổi sang `let` khi thật sự cần gán lại. Đọc code thấy `const` là biết giá trị đó đứng yên, bớt một thứ phải theo dõi.

`const` chặn gán lại, không chặn sửa bên trong. Với [mảng](/docs/javascript/mang) và [object](/docs/javascript/object), bạn vẫn thêm phần tử hay đổi thuộc tính được:

```js
const inventory = ["kiếm"];
inventory.push("khiên");
console.log(inventory); // [ 'kiếm', 'khiên' ]

inventory = []; // TypeError: Assignment to constant variable.
```

## Vì sao không dùng var nữa

Code cũ trên mạng hay dùng `var`. Nó vẫn chạy, nhưng có hai cái bẫy mà `let` và `const` đã sửa.

Bẫy thứ nhất: `var` không bị giới hạn trong khối `{ }`. Biến tạo trong `if` lọt ra ngoài.

```js
if (true) {
  var bonus = 50;
}
console.log(bonus); // 50, dù bonus sinh ra trong if

if (true) {
  let reward = 50;
}
console.log(reward); // ReferenceError: reward is not defined
```

Với `let`, biến chỉ sống trong khối nó được tạo. Muốn dùng ở ngoài thì khai báo ở ngoài. Luật rõ ràng hơn, ít bị ghi đè nhầm.

Bẫy thứ hai: `var` cho khai báo lại cùng tên mà không báo gì. Hai đoạn code cùng đặt tên `var score` là âm thầm đè lên nhau.

```js
var score = 10;
var score = 0; // không lỗi, điểm cũ mất
```

Kết luận: code mới chỉ dùng `let` và `const`. Gặp `var` trong code cũ thì hiểu nó là gì, không cần viết theo.

## ReferenceError

Lỗi hay gặp nhất với biến là dùng một tên chưa khai báo.

```js
console.log(gold); // ReferenceError: gold is not defined
```

Có ba nguyên nhân thường gặp:

- Gõ sai tên: khai báo `playerHp` nhưng dùng `playerHP`. JS [phân biệt hoa thường](/docs/javascript/cu-phap-va-comment).
- Dùng biến ở ngoài khối nó được tạo, như ví dụ `reward` ở trên.
- Dùng biến trước dòng khai báo:

```js
console.log(level); // ReferenceError: Cannot access 'level' before initialization
let level = 1;
```

Đọc kỹ tên biến trong thông báo lỗi. Nó cho bạn biết chính xác tên nào đang bị thiếu.

## Quy tắc đặt tên

- Bắt đầu bằng chữ cái, `_` hoặc `$`. Không bắt đầu bằng số: `player1` được, `1player` thì không.
- Không có dấu cách: `moveSpeed`, không phải `move speed`.
- Không dùng từ khóa như `let`, `if`, `function`, `class`.
- Biến thường viết `camelCase`: `enemyCount`, `isGameOver`.

Tên nên nói lên ý nghĩa. `enemyCount` dễ đọc hơn `n` rất nhiều.

## Bài tập

Khai báo biến cho một con quái: tên "Slime" (không đổi), máu 30, tốc độ 1.5. Cho nó mất 12 máu rồi in máu còn lại. Chọn `let` hay `const` cho từng biến.

<details>
<summary>Xem đáp án</summary>

Tên và tốc độ không đổi nên dùng `const`. Máu bị trừ nên dùng `let`.

```js
const enemyName = "Slime";
const enemySpeed = 1.5;
let enemyHp = 30;

enemyHp = enemyHp - 12;
console.log(enemyName, enemyHp); // Slime 18
```

</details>
