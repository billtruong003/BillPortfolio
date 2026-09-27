---
title: "Hàm trong JavaScript"
description: "Hàm (function) trong JavaScript: khai báo, tham số, return, giá trị mặc định, và vì sao hàm quên return lại trả về undefined."
section: "Hàm"
order: 15
tags: ["hàm", "function", "tham số", "return"]
image: /images/docs/javascript/ham.webp
imageIdea: "Nhân vật anime vận hành một cỗ máy rèn: bỏ vào phễu hai viên đá ghi 'attack' và 'defense', đầu ra là một tấm thẻ ghi 'damage', trên thân máy có chữ 'function'."
imagePrompt: "Edit this image: the character operates a cute blacksmith machine with a funnel on top, dropping in two glowing stones labeled 'attack' and 'defense'; a small card labeled 'return damage' slides out of the output slot; the machine body reads 'function'. Keep the original art style, 16:9."
---

Hàm (function) là một đoạn code có tên, gọi lại được nhiều lần. Công thức tính sát thương dùng ở chỗ người chơi đánh quái, quái đánh người chơi, bẫy gây sát thương. Viết nó một lần trong hàm, các chỗ kia chỉ việc gọi.

## Khai báo và gọi hàm

```js
function showGameOver() {
  console.log("Game over");
  console.log("Bấm R để chơi lại");
}

showGameOver();
// Game over
// Bấm R để chơi lại
```

Khai báo hàm chưa làm gì cả. Code bên trong chỉ chạy khi bạn gọi nó bằng tên kèm cặp ngoặc tròn `showGameOver()`.

> **Lỗi hay gặp:** gọi hàm mà quên ngoặc: `showGameOver;`. Không có lỗi, nhưng cũng không có gì chạy. Tên hàm không có ngoặc chỉ là nhắc tới hàm, chưa phải gọi nó.

## Tham số

Tham số là dữ liệu bạn đưa vào hàm. Khai báo trong ngoặc lúc viết hàm, truyền giá trị thật lúc gọi.

```js
function heal(name, amount) {
  console.log(`${name} hồi ${amount} máu`);
}

heal("Aki", 30);   // Aki hồi 30 máu
heal("Mira", 15);  // Mira hồi 15 máu
```

`name` và `amount` là tham số. `"Aki"` và `30` là giá trị truyền vào (argument). Thứ tự có ý nghĩa: giá trị đầu vào tham số đầu.

Truyền thiếu thì tham số còn lại nhận `undefined`, JS không báo lỗi:

```js
heal("Aki"); // Aki hồi undefined máu
```

## return: trả kết quả về

Hàm ở trên chỉ in ra. Nhưng thường bạn cần hàm tính một giá trị để dùng tiếp. Đó là việc của `return`.

```js
function calcDamage(attack, defense) {
  return attack - defense;
}

const damage = calcDamage(20, 8);
console.log(damage); // 12

let enemyHp = 50;
enemyHp -= calcDamage(30, 5);
console.log(enemyHp); // 25
```

Người mới hay nhầm `console.log` với `return`. `console.log` chỉ in lên màn hình, giá trị không đi đâu cả. Hàm không có `return` luôn trả về `undefined`:

```js
function calcDamageWrong(attack, defense) {
  console.log(attack - defense);
}

const result = calcDamageWrong(20, 8); // in ra 12
console.log(result);                   // undefined
```

Quy tắc: hàm tính ra một giá trị thì `return` giá trị đó. In ra là việc của chỗ gọi hàm.

`return` cũng thoát hàm ngay lập tức. Code sau nó không chạy:

```js
function attack(targetHp) {
  if (targetHp <= 0) {
    return "Mục tiêu đã gục";
  }
  return `Đánh trúng, còn ${targetHp - 10} máu`;
}

console.log(attack(0));  // Mục tiêu đã gục
console.log(attack(35)); // Đánh trúng, còn 25 máu
```

## Giá trị mặc định

Có tham số hầu như lần nào cũng giống nhau. Gán sẵn một giá trị mặc định, lúc gọi không truyền thì dùng nó.

```js
function calcDamage(attack, defense = 0, critMultiplier = 1) {
  return Math.max(0, attack - defense) * critMultiplier;
}

console.log(calcDamage(20));        // 20
console.log(calcDamage(20, 5));     // 15
console.log(calcDamage(20, 5, 2));  // 30
```

Giá trị mặc định chỉ dùng khi tham số là `undefined`. Truyền `0` hay `null` thì nó giữ nguyên `0` hay `null`.

Tham số có mặc định nên đặt cuối. Đặt ở giữa thì muốn bỏ qua nó lại phải truyền `undefined` vào, rất khó đọc.

## Biến khai báo trong hàm

Biến tạo bên trong hàm chỉ tồn tại trong hàm đó.

```js
function rollLoot() {
  const gold = Math.floor(Math.random() * 10) + 1;
  return gold;
}

const earned = rollLoot();
console.log(gold); // ReferenceError: gold is not defined
```

Muốn dùng kết quả ở ngoài thì `return` nó ra, như biến `earned` ở trên.

## Đặt tên hàm

Tên hàm nên là động từ, nói nó làm gì: `calcDamage`, `spawnEnemy`, `updateScore`. Hàm trả về đúng/sai hay đặt bắt đầu bằng `is`, `has`, `can`: `isDead`, `canAttack`.

Hàm cũng viết được ngắn hơn bằng cú pháp mũi tên, xem trang [Arrow function](/docs/javascript/arrow-function).

## Bài tập

Viết hàm `levelUp(level, exp, expNeeded = 100)`. Nếu `exp` lớn hơn hoặc bằng `expNeeded` thì trả về `level + 1`, không thì trả về `level` cũ. Thử `levelUp(3, 120)` và `levelUp(3, 120, 150)`.

<details>
<summary>Xem đáp án</summary>

```js
function levelUp(level, exp, expNeeded = 100) {
  if (exp >= expNeeded) {
    return level + 1;
  }
  return level;
}

console.log(levelUp(3, 120));      // 4
console.log(levelUp(3, 120, 150)); // 3
```

</details>
