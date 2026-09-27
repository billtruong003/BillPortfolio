---
title: "Kiểu dữ liệu trong JavaScript"
description: "Các kiểu dữ liệu cơ bản trong JavaScript: number, string, boolean, null, undefined, cách kiểm tra bằng typeof và cái bẫy typeof null."
section: "Cơ bản"
order: 6
tags: ["kiểu dữ liệu", "typeof", "null", "undefined"]
image: /images/docs/javascript/kieu-du-lieu.webp
imageIdea: "Nhân vật anime đứng trước năm cái rương báu khác màu, mỗi rương khắc một chữ: number, string, boolean, null, undefined. Rương undefined trống trơn, nhân vật gãi đầu."
imagePrompt: "Edit this image: the character stands before five colorful treasure chests with engraved labels 'number', 'string', 'boolean', 'null' and 'undefined'; the 'undefined' chest is open and completely empty, and the character scratches their head. Keep the original art style, 16:9."
---

Mỗi giá trị trong JavaScript thuộc một kiểu: là số, là chữ, là đúng/sai, hay là "không có gì". Biết kiểu thì mới biết giá trị đó làm được gì. Cộng hai số ra số, còn cộng hai chuỗi thì ra chuỗi nối.

## number: số

JS chỉ có một kiểu số cho cả số nguyên lẫn số thập phân. Không có `int` và `float` riêng như C#.

```js
const hp = 100;
const moveSpeed = 5.5;
const damage = -20;
console.log(hp + damage); // 80
```

Chi tiết về làm tròn, chuyển chuỗi thành số, số ngẫu nhiên có ở trang [Số](/docs/javascript/so).

## string: chuỗi

Chuỗi là chữ, bọc trong nháy kép `"..."`, nháy đơn `'...'` hoặc dấu backtick `` `...` ``.

```js
const playerName = "Aki";
const className = 'Pháp sư';
const greeting = `Chào ${playerName}`;
console.log(greeting); // Chào Aki
```

Số viết trong nháy là chuỗi, không phải số. Chỗ này hay gây lỗi:

```js
console.log(10 + 5);     // 15
console.log("10" + 5);   // 105
```

Dấu `+` gặp chuỗi thì nối chuỗi. Xem thêm ở trang [Chuỗi](/docs/javascript/chuoi).

## boolean: đúng hoặc sai

Boolean chỉ có hai giá trị: `true` và `false`. Dùng cho các trạng thái có/không.

```js
const isAlive = true;
const hasKey = false;
console.log(100 > 50); // true
```

Phép so sánh luôn trả về boolean. Đây là thứ mà [if else](/docs/javascript/if-else) dùng để rẽ nhánh.

## undefined và null

Hai giá trị này đều nghĩa là "không có gì", nhưng khác nhau ở chỗ ai làm ra nó.

- `undefined`: JS tự gán khi một biến chưa được cho giá trị, hoặc khi đọc thuộc tính không tồn tại.
- `null`: bạn tự gán để nói rõ "chỗ này cố ý để trống".

```js
let currentTarget;
console.log(currentTarget); // undefined

const player = { name: "Aki" };
console.log(player.weapon); // undefined

let equippedShield = null; // chưa trang bị khiên, cố ý để trống
```

Quy ước dễ nhớ: đừng tự gán `undefined`. Khi muốn nói "trống", dùng `null`.

> **Lỗi hay gặp:** đọc thuộc tính của một giá trị đang là `undefined` hoặc `null`. Ví dụ `currentTarget.hp` khi chưa chọn mục tiêu sẽ báo `TypeError: Cannot read properties of undefined (reading 'hp')`. Kiểm tra biến có giá trị chưa trước khi đọc bên trong nó.

## Kiểm tra kiểu với typeof

`typeof` trả về tên kiểu dưới dạng chuỗi.

```js
console.log(typeof 100);        // number
console.log(typeof "Aki");      // string
console.log(typeof true);       // boolean
console.log(typeof undefined);  // undefined
console.log(typeof null);       // object
```

Dòng cuối không phải lỗi đánh máy. `typeof null` ra `"object"` là một lỗi từ phiên bản JS đầu tiên, giữ lại tới giờ để không làm hỏng web cũ. Muốn kiểm tra `null` thì so sánh thẳng:

```js
let target = null;
console.log(target === null); // true
```

`typeof` có ích khi dữ liệu đến từ ngoài vào, ví dụ đọc từ file hay từ ô nhập liệu, và bạn cần chắc nó là số trước khi tính.

```js
const input = "50";
if (typeof input === "string") {
  console.log("Cần đổi sang số trước khi cộng");
}
```

## Một biến có thể đổi kiểu

Biến trong JS không bị khoá kiểu. Cùng một biến `let` có thể giữ số rồi giữ chuỗi.

```js
let reward = 100;
reward = "Kiếm lửa";
console.log(typeof reward); // string
```

JS cho phép, nhưng đừng làm vậy. Một biến lúc là số lúc là chữ thì đoạn code phía sau không biết đang nhận gì. Đây chính là vấn đề mà [TypeScript](/docs/javascript/typescript-kieu) sinh ra để chặn.

## Bài tập

Đoán kết quả của từng dòng trước khi chạy thử.

```js
console.log(typeof 3.14);
console.log(typeof "3.14");
console.log("7" + 3);
console.log(typeof null);
let shield;
console.log(shield);
```

<details>
<summary>Xem đáp án</summary>

```js
console.log(typeof 3.14);   // number
console.log(typeof "3.14"); // string
console.log("7" + 3);       // 73
console.log(typeof null);   // object
let shield;
console.log(shield);        // undefined
```

</details>
