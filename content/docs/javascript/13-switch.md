---
title: "Switch trong JavaScript"
description: "Câu lệnh switch trong JavaScript: so một giá trị với nhiều trường hợp, vì sao quên break làm code chạy lan sang case sau, và khi nào dùng switch thay if."
section: "Điều khiển luồng"
order: 13
tags: ["switch", "case", "break"]
image: /images/docs/javascript/switch.webp
imageIdea: "Nhân vật anime đứng trước một bảng điều khiển có nhiều cần gạt ghi 'case \"sword\"', 'case \"bow\"', 'case \"staff\"', một cần gạt thiếu chốt 'break' khiến cả dãy đèn bật sáng loạn xạ."
imagePrompt: "Edit this image: the character stands at a control panel with several levers labeled 'case \"sword\"', 'case \"bow\"', 'case \"staff\"'; one lever is missing its stopper labeled 'break', causing a whole row of warning lights to flash, the character looks surprised. Keep the original art style, 16:9."
---

`switch` so một giá trị với nhiều trường hợp cố định và chạy đoạn code khớp. Khi bạn thấy mình viết `if (weapon === "sword") ... else if (weapon === "bow") ... else if (weapon === "staff")`, đó là lúc `switch` đọc gọn hơn.

## Cú pháp switch

```js
const weapon = "bow";

switch (weapon) {
  case "sword":
    console.log("Chém: 15 sát thương");
    break;
  case "bow":
    console.log("Bắn: 10 sát thương, tầm xa");
    break;
  case "staff":
    console.log("Phép: 20 sát thương, tốn mana");
    break;
  default:
    console.log("Đánh tay không: 3 sát thương");
}
// Bắn: 10 sát thương, tầm xa
```

Cách chạy: JS lấy giá trị trong ngoặc `switch (...)`, so lần lượt với từng `case` bằng `===`. Gặp case khớp thì chạy từ đó xuống, tới `break` thì thoát. Không case nào khớp thì chạy `default`.

`default` không bắt buộc, nhưng nên có. Nó bắt những giá trị bạn không ngờ tới, ví dụ tên vũ khí gõ sai.

## Quên break

Đây là lỗi kinh điển của `switch`. Thiếu `break` thì code không dừng ở case khớp, mà chạy tiếp xuống các case bên dưới, bất kể có khớp hay không. Hiện tượng này gọi là fall-through.

```js
const potion = "small";
let heal = 0;

switch (potion) {
  case "small":
    heal = 20;
  case "medium":
    heal = 50;
  case "large":
    heal = 100;
}

console.log(heal); // 100
```

Bình máu nhỏ mà hồi 100 máu. Code khớp `"small"`, gán 20, rồi chạy tiếp gán 50, rồi gán 100. Không có thông báo lỗi nào, bạn chỉ thấy game dễ bất thường.

Cách đúng: mỗi case kết thúc bằng `break`.

```js
switch (potion) {
  case "small":
    heal = 20;
    break;
  case "medium":
    heal = 50;
    break;
  case "large":
    heal = 100;
    break;
}

console.log(heal); // 20
```

> **Lỗi hay gặp:** quên `break` ở case cuối trước `default`. Case đó khớp xong sẽ chạy luôn code của `default`. Dù case cuối chạy đúng khi đứng một mình, cứ ghi `break` cho mọi case để sau này thêm case mới không bị dính.

## Gộp nhiều case

Fall-through cũng có lúc dùng có chủ ý: nhiều giá trị cùng một kết quả. Viết các case liền nhau, không có code ở giữa.

```js
const key = "ArrowUp";

switch (key) {
  case "w":
  case "ArrowUp":
    console.log("Đi lên");
    break;
  case "s":
  case "ArrowDown":
    console.log("Đi xuống");
    break;
  default:
    console.log("Phím không dùng");
}
// Đi lên
```

Phím `w` và mũi tên lên cùng làm một việc. Đây là kiểu bạn sẽ gặp khi xử lý bàn phím ở trang [Sự kiện](/docs/javascript/su-kien).

## return thay cho break

Trong một [hàm](/docs/javascript/ham), `return` thoát cả hàm nên không cần `break` nữa. Cách này gọn và khó quên hơn.

```js
function getDamage(weapon) {
  switch (weapon) {
    case "sword":
      return 15;
    case "bow":
      return 10;
    case "staff":
      return 20;
    default:
      return 3;
  }
}

console.log(getDamage("sword")); // 15
console.log(getDamage("spoon")); // 3
```

## switch so sánh chặt

`switch` dùng `===`, nên số và chuỗi không khớp nhau.

```js
const level = "2"; // đọc từ ô nhập, là chuỗi

switch (level) {
  case 2:
    console.log("Rừng tối");
    break;
  default:
    console.log("Không có level này");
}
// Không có level này
```

Đổi sang số trước bằng `Number(level)` rồi mới `switch`. Xem trang [Số](/docs/javascript/so).

## Khi nào dùng switch, khi nào dùng if

- So **một** biến với nhiều giá trị cố định (tên vũ khí, phím bấm, trạng thái game): `switch`.
- Điều kiện là khoảng (`score >= 700`) hoặc kết hợp nhiều biến (`hp < 30 && potions > 0`): [if else](/docs/javascript/if-else).

## Bài tập

Viết hàm `getStateText(state)` nhận trạng thái game: `"menu"` trả về "Bấm Start", `"playing"` và `"paused"` đều trả về "Đang trong trận", `"gameover"` trả về "Thua rồi", còn lại trả về "Không rõ". Dùng `switch` với `return`.

<details>
<summary>Xem đáp án</summary>

```js
function getStateText(state) {
  switch (state) {
    case "menu":
      return "Bấm Start";
    case "playing":
    case "paused":
      return "Đang trong trận";
    case "gameover":
      return "Thua rồi";
    default:
      return "Không rõ";
  }
}

console.log(getStateText("paused"));   // Đang trong trận
console.log(getStateText("loading"));  // Không rõ
```

</details>
