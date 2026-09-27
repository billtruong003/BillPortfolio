---
title: "Cú pháp và comment trong JavaScript"
description: "Câu lệnh trong JavaScript, có nên ghi dấu chấm phẩy không, cách viết comment một dòng và nhiều dòng, và chuyện phân biệt chữ hoa chữ thường."
section: "Bắt đầu"
order: 4
tags: ["cú pháp", "comment", "dấu chấm phẩy"]
image: /images/docs/javascript/cu-phap-va-comment.webp
imageIdea: "Nhân vật anime dán những tờ giấy note màu vàng có ghi '// hồi máu' và '// boss phase 2' lên các dòng code trên một màn hình lớn, như đang đánh dấu bản đồ."
imagePrompt: "Edit this image: the character sticks yellow sticky notes onto lines of code on a big monitor, the notes read '// heal' and '// boss phase 2', and one small note at the end of a line shows a big semicolon ';'. Keep the original art style, 16:9."
---

Cú pháp là luật viết code để máy đọc hiểu được. Luật của JavaScript khá thoáng, và chính vì thoáng nên người mới hay gặp lỗi khó hiểu. Trang này nói về câu lệnh, dấu chấm phẩy, comment và chuyện chữ hoa chữ thường.

## Câu lệnh

Một câu lệnh (statement) là một việc cho máy làm. Thường mỗi câu lệnh nằm trên một dòng, và máy chạy từ trên xuống dưới.

```js
let hp = 100;
hp = hp - 20;
console.log(hp); // 80
```

Nhiều câu lệnh có thể gom trong một khối, bọc bằng ngoặc nhọn `{ }`. Bạn sẽ gặp khối này ở `if`, vòng lặp và hàm.

```js
if (hp < 50) {
  console.log("Máu thấp");
  console.log("Uống bình máu đi");
}
```

Dấu cách và thụt đầu dòng không ảnh hưởng tới cách chạy. Thụt vào 2 dấu cách là để người đọc thấy dòng nào nằm trong khối nào.

## Dấu chấm phẩy

JavaScript có cơ chế tự chèn dấu chấm phẩy (Automatic Semicolon Insertion). Bỏ `;` ở cuối dòng thì phần lớn thời gian code vẫn chạy. Vấn đề nằm ở phần nhỏ còn lại.

```js
function getBonus() {
  return
    50;
}
console.log(getBonus()); // undefined
```

Bạn tưởng hàm trả về `50`. Nhưng JS tự chèn `;` ngay sau `return` vì dòng đó kết thúc, nên hàm trả về `undefined`. Dòng `50;` không bao giờ chạy.

Cách đúng: giữ giá trị trả về trên cùng dòng với `return`, và ghi `;` cuối mỗi câu lệnh cho nhất quán. Loạt bài này luôn ghi `;`.

```js
function getBonus() {
  return 50;
}
console.log(getBonus()); // 50
```

## Comment

Comment là ghi chú cho người đọc, máy bỏ qua. JS có hai kiểu:

```js
// Comment một dòng: từ // tới hết dòng
let score = 0; // cũng có thể đặt cuối dòng code

/*
  Comment nhiều dòng.
  Hay dùng để tắt tạm một đoạn code khi debug.
*/
```

Comment tốt nói vì sao, không lặp lại code nói gì. So hai dòng:

```js
hp = hp - 5; // trừ 5 vào hp
hp = hp - 5; // chất độc trừ máu mỗi lượt, kể cả khi có khiên
```

Dòng đầu thừa, ai đọc code cũng thấy trừ 5. Dòng sau cho biết một luật của game mà code không tự nói ra.

> **Lỗi hay gặp:** lồng comment nhiều dòng vào nhau: `/* ngoài /* trong */ còn lại */`. Dấu `*/` đầu tiên đã đóng comment, phần `còn lại */` bị coi là code và báo `SyntaxError: Unexpected identifier 'lại'`.

## Phân biệt chữ hoa chữ thường

JavaScript coi `score`, `Score` và `SCORE` là ba tên khác nhau.

```js
let score = 10;
console.log(Score); // ReferenceError: Score is not defined
```

Tên có sẵn cũng vậy. `console.log` đúng, `Console.log` sai. `document.querySelector` đúng, `document.queryselector` sai và báo `TypeError: document.queryselector is not a function`.

Quy ước đặt tên trong JS:

- Biến và hàm viết `camelCase`: `playerName`, `getDamage`.
- Class viết `PascalCase`: `Enemy`, `Player`.
- Hằng số cấu hình đôi khi viết `UPPER_SNAKE_CASE`: `MAX_HP`.

Chi tiết về khai báo biến có ở trang [Biến](/docs/javascript/bien).

## Bài tập

Đoạn code dưới có ba lỗi. Tìm và sửa.

```js
let playerHp = 100
playerhp = playerHp - 30;
Console.log(playerHp);
```

<details>
<summary>Xem đáp án</summary>

Dòng 1 thiếu `;` (chạy vẫn được, nhưng nên ghi cho nhất quán). Dòng 2 viết `playerhp` chữ h thường nên tạo ra một biến khác, hoặc báo lỗi trong strict mode. Dòng 3 viết `Console` chữ C hoa.

```js
let playerHp = 100;
playerHp = playerHp - 30;
console.log(playerHp); // 70
```

</details>
