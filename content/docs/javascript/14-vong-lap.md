---
title: "Vòng lặp trong JavaScript"
description: "Các vòng lặp trong JavaScript: for đếm số lần, for...of để lặp qua mảng, while lặp tới khi điều kiện sai, cùng break, continue và lỗi lặp vô hạn."
section: "Điều khiển luồng"
order: 14
tags: ["vòng lặp", "for", "for...of", "while"]
image: /images/docs/javascript/vong-lap.webp
imageIdea: "Nhân vật anime chạy vòng quanh một đường đua hình tròn, mỗi vòng đạp qua một vạch có số 0, 1, 2, 3, và một con slime đang cầm cờ ghi 'i < 5' đứng ở vạch đích."
imagePrompt: "Edit this image: the character runs laps around a small circular track with lap markers numbered 0, 1, 2, 3, 4 on the ground, while a cute slime holding a flag with the text 'i < 5' waits at the finish line. Keep the original art style, 16:9."
---

Vòng lặp chạy cùng một đoạn code nhiều lần. Sinh 5 con quái, trừ máu mỗi giây, in từng món trong kho đồ: không ai viết tay 5 dòng giống nhau, mà để vòng lặp làm. JavaScript có ba kiểu hay dùng: `for`, `for...of` và `while`.

## for: lặp một số lần biết trước

```js
for (let i = 0; i < 3; i++) {
  console.log(`Sinh quái số ${i}`);
}
// Sinh quái số 0
// Sinh quái số 1
// Sinh quái số 2
```

Trong ngoặc có ba phần, ngăn bằng dấu chấm phẩy:

1. `let i = 0`: tạo biến đếm, chạy một lần lúc bắt đầu.
2. `i < 3`: kiểm tra trước mỗi vòng. Sai thì dừng.
3. `i++`: chạy sau mỗi vòng, tăng biến đếm lên 1.

Biến đếm bắt đầu từ 0 là thói quen, vì chỉ số [mảng](/docs/javascript/mang) cũng bắt đầu từ 0.

> **Lỗi hay gặp:** viết `i <= arr.length` thay vì `i < arr.length`. Vòng cuối đọc `arr[arr.length]`, một chỉ số không tồn tại, và nhận về `undefined`. Không có lỗi đỏ nhưng bạn sẽ thấy một dòng `undefined` lạ ở cuối.

## Lặp qua mảng bằng for

```js
const inventory = ["kiếm", "khiên", "bình máu"];

for (let i = 0; i < inventory.length; i++) {
  console.log(`${i + 1}. ${inventory[i]}`);
}
// 1. kiếm
// 2. khiên
// 3. bình máu
```

Cách này cần khi bạn dùng tới vị trí `i`, ví dụ để đánh số thứ tự.

## for...of: lặp qua từng phần tử

Phần lớn thời gian bạn chỉ cần từng phần tử, không cần chỉ số. `for...of` gọn hơn và không có chỗ nào để sai `<` với `<=`.

```js
const enemyHps = [30, 12, 45];
let totalHp = 0;

for (const hp of enemyHps) {
  totalHp += hp;
}

console.log(totalHp); // 87
```

Mỗi vòng, `hp` nhận một phần tử. Dùng `const` được vì mỗi vòng là một biến mới.

Lặp qua mảng object:

```js
const enemies = [
  { name: "Slime", hp: 10 },
  { name: "Goblin", hp: 25 },
];

for (const enemy of enemies) {
  console.log(`${enemy.name}: ${enemy.hp} máu`);
}
// Slime: 10 máu
// Goblin: 25 máu
```

Người mới hay nhầm `for...of` với `for...in`. `for...in` lặp qua **tên key**, không phải giá trị, và với mảng thì cho ra chuỗi `"0"`, `"1"`, `"2"`. Với mảng, luôn dùng `for...of`.

Muốn lặp qua các cặp key, giá trị của một [object](/docs/javascript/object), dùng `Object.entries`:

```js
const stats = { str: 5, agi: 3 };
for (const [key, value] of Object.entries(stats)) {
  console.log(key, value);
}
// str 5
// agi 3
```

## while: lặp tới khi điều kiện sai

Dùng `while` khi không biết trước phải lặp bao nhiêu lần, chỉ biết lúc nào thì dừng.

```js
let bossHp = 50;
let turn = 0;

while (bossHp > 0) {
  bossHp -= 12;
  turn++;
}

console.log(`Hạ boss sau ${turn} lượt`); // Hạ boss sau 5 lượt
```

Chỗ nguy hiểm của `while`: nếu bên trong không có gì làm điều kiện thành sai, vòng lặp chạy mãi. Tab trình duyệt đứng hình, phải tắt đi.

```js
let hp = 10;
while (hp > 0) {
  console.log("Đang đánh...");
  // quên trừ hp: lặp vô hạn
}
```

Trước khi chạy `while`, tự hỏi: dòng nào trong vòng lặp đưa điều kiện về sai?

## break và continue

`break` thoát khỏi vòng lặp ngay. `continue` bỏ qua phần còn lại của vòng này, sang vòng tiếp.

```js
const loot = ["vàng", "đá", "chìa khóa", "vàng"];

for (const item of loot) {
  if (item === "đá") continue;     // bỏ qua đồ vô dụng
  if (item === "chìa khóa") {
    console.log("Tìm thấy chìa khóa, dừng tìm");
    break;
  }
  console.log(`Nhặt ${item}`);
}
// Nhặt vàng
// Tìm thấy chìa khóa, dừng tìm
```

## Chọn vòng lặp nào

- Cần đếm hoặc cần chỉ số: `for`.
- Đi qua từng phần tử của mảng: `for...of`.
- Lặp tới khi một điều kiện thay đổi: `while`.
- Biến đổi hoặc lọc mảng thành mảng mới: `map`, `filter` (trang [Mảng](/docs/javascript/mang)).

## Bài tập

Có mảng sát thương mỗi đòn `[8, 15, 4, 20, 11]`. Dùng `for...of` cộng dồn sát thương vào boss 40 máu. Khi máu boss về 0 hoặc thấp hơn thì in "Boss gục" và dừng. In tổng số đòn đã đánh.

<details>
<summary>Xem đáp án</summary>

```js
const hits = [8, 15, 4, 20, 11];
let bossHp = 40;
let count = 0;

for (const damage of hits) {
  bossHp -= damage;
  count++;
  if (bossHp <= 0) {
    console.log("Boss gục");
    break;
  }
}

console.log(`Số đòn: ${count}`);
// Boss gục
// Số đòn: 4
```

</details>
