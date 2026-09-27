---
title: "Arrow function trong JavaScript"
description: "Arrow function trong JavaScript: cú pháp mũi tên, return ngầm, trả về object, và khi nào nên dùng arrow function thay cho function thường."
section: "Hàm"
order: 16
tags: ["arrow function", "hàm", "callback"]
image: /images/docs/javascript/arrow-function.webp
imageIdea: "Nhân vật anime là cung thủ, kéo cung bắn một mũi tên có đuôi ghi '=>' xuyên qua ba quả táo xếp hàng, mỗi quả ghi một chữ 'map', 'filter', 'find'."
imagePrompt: "Edit this image: the character is an archer drawing a bow and shooting a glowing arrow shaped like '=>' that pierces three apples lined up, each apple labeled 'map', 'filter' and 'find'. Keep the original art style, 16:9."
---

Arrow function là cách viết hàm ngắn hơn, dùng dấu mũi tên `=>`. Bạn sẽ gặp nó khắp nơi trong code JS hiện đại, nhất là khi truyền hàm vào `map`, `filter` hay `addEventListener`.

## Từ function sang arrow function

Cùng một hàm, viết hai kiểu:

```js
function double(damage) {
  return damage * 2;
}

const doubleArrow = (damage) => {
  return damage * 2;
};

console.log(double(15));      // 30
console.log(doubleArrow(15)); // 30
```

Arrow function không có tên riêng, nên ta gán nó vào một biến `const`. Tham số vẫn nằm trong ngoặc tròn, sau đó là `=>` rồi tới thân hàm.

## Viết gọn hơn: return ngầm

Khi thân hàm chỉ có một biểu thức, bỏ ngoặc nhọn và bỏ luôn chữ `return`. Giá trị của biểu thức tự được trả về.

```js
const double = (damage) => damage * 2;
console.log(double(15)); // 30
```

Có một tham số thì ngoặc tròn cũng bỏ được: `damage => damage * 2`. Loạt bài này vẫn giữ ngoặc cho thống nhất.

Không có tham số thì để cặp ngoặc rỗng:

```js
const rollDice = () => Math.floor(Math.random() * 6) + 1;
console.log(rollDice()); // một số từ 1 tới 6
```

Hai tham số trở lên thì bắt buộc có ngoặc:

```js
const calcDamage = (attack, defense) => Math.max(0, attack - defense);
console.log(calcDamage(20, 8)); // 12
```

> **Lỗi hay gặp:** có ngoặc nhọn mà quên `return`. `const double = (d) => { d * 2 };` luôn trả về `undefined`. Ngoặc nhọn nghĩa là thân hàm nhiều dòng, và khi đó phải tự ghi `return`.

## Trả về object

Muốn trả về một object bằng return ngầm, phải bọc object trong ngoặc tròn. Không bọc thì JS tưởng ngoặc nhọn là thân hàm.

```js
const makeEnemyWrong = (name) => { name: name, hp: 30 };
// SyntaxError: Unexpected token ':'

const makeEnemy = (name) => ({ name: name, hp: 30 });
console.log(makeEnemy("Slime")); // { name: 'Slime', hp: 30 }
```

## Chỗ arrow function hợp nhất: truyền vào hàm khác

Nhiều hàm có sẵn nhận một hàm khác làm tham số, gọi là callback. Viết callback bằng `function` thì dài dòng:

```js
const hps = [0, 30, 12];
const alive = hps.filter(function (hp) {
  return hp > 0;
});
```

Arrow function gọn thành một dòng, đọc gần như câu nói: "lọc những hp lớn hơn 0".

```js
const alive = hps.filter((hp) => hp > 0);
console.log(alive); // [ 30, 12 ]
```

Một ví dụ với mảng quái:

```js
const enemies = [
  { name: "Slime", hp: 10 },
  { name: "Goblin", hp: 0 },
  { name: "Bat", hp: 25 },
];

const names = enemies
  .filter((e) => e.hp > 0)
  .map((e) => e.name);

console.log(names); // [ 'Slime', 'Bat' ]
```

Xem thêm `map`, `filter`, `find` ở trang [Mảng](/docs/javascript/mang), và cách truyền arrow function vào `addEventListener` ở trang [Sự kiện](/docs/javascript/su-kien).

## Khi nào không dùng arrow function

Arrow function không có `this` của riêng nó. Nó mượn `this` của chỗ bao quanh. Điều này tiện trong nhiều trường hợp, nhưng làm hỏng method trong object:

```js
const enemy = {
  type: "Goblin",
  sayType: () => console.log(this.type),
};

enemy.sayType(); // undefined
```

`this` ở đây không phải `enemy`. Với method trong object, dùng cách viết thường:

```js
const enemy = {
  type: "Goblin",
  sayType() {
    console.log(this.type);
  },
};

enemy.sayType(); // Goblin
```

Tóm lại cách chọn:

- Callback ngắn truyền vào `map`, `filter`, `addEventListener`: arrow function.
- Hàm một dòng tính toán nhỏ: arrow function.
- Method trong object: cách viết thường `sayType() { }`.
- Hàm chính của file, dài, cần tên rõ ràng: `function` (xem trang [Hàm](/docs/javascript/ham)) hay arrow function đều được, chọn một kiểu và giữ nhất quán.

## Bài tập

Có mảng `const loot = [5, 120, 40, 300, 15];` là số vàng rơi ra. Dùng arrow function: lọc các lần rơi từ 40 vàng trở lên, rồi nhân mỗi giá trị với 1.5 (sự kiện x1.5 vàng) và làm tròn xuống.

<details>
<summary>Xem đáp án</summary>

```js
const loot = [5, 120, 40, 300, 15];
const bonusLoot = loot
  .filter((gold) => gold >= 40)
  .map((gold) => Math.floor(gold * 1.5));

console.log(bonusLoot); // [ 180, 60, 450 ]
```

</details>
