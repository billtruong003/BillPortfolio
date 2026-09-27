---
title: "Object trong JavaScript"
description: "Object trong JavaScript: gom thông tin nhân vật vào một chỗ, đọc và sửa thuộc tính bằng dấu chấm hoặc ngoặc vuông, thêm, xoá và kiểm tra thuộc tính."
section: "Collection"
order: 11
tags: ["object", "thuộc tính", "nhân vật"]
image: /images/docs/javascript/object.webp
imageIdea: "Nhân vật anime cầm một tấm thẻ nhân vật kiểu game thẻ bài, trên thẻ có các dòng 'name: Aki', 'hp: 100', 'level: 3', và đang dùng bút sửa số hp."
imagePrompt: "Edit this image: the character holds a large trading-card style character sheet with lines 'name: \"Aki\"', 'hp: 100', 'level: 3', and is using a pen to cross out 100 and write 80. Keep the original art style, 16:9."
---

Object là một nhóm giá trị có tên, gói trong một biến. Nhân vật có tên, máu, level, vũ khí. Thay vì bốn biến rời, bạn gom vào một object `player` và gọi từng phần bằng tên.

## Tạo object

Viết trong ngoặc nhọn, mỗi dòng là một cặp `tên: giá trị`, ngăn bằng dấu phẩy.

```js
const player = {
  name: "Aki",
  hp: 100,
  level: 3,
  isAlive: true,
};

console.log(player); // { name: 'Aki', hp: 100, level: 3, isAlive: true }
```

Mỗi cặp gọi là một thuộc tính (property). `name` là tên thuộc tính (key), `"Aki"` là giá trị.

Vì sao gom lại: khi có hai nhân vật, bạn không phải đặt `player1Hp`, `player2Hp`. Mỗi object tự giữ dữ liệu của nó.

## Đọc thuộc tính bằng dấu chấm

```js
console.log(player.name); // Aki
console.log(player.hp);   // 100
```

Sửa cũng bằng dấu chấm:

```js
player.hp = player.hp - 20;
player.level += 1;
console.log(player.hp, player.level); // 80 4
```

`player` khai báo bằng `const` vẫn sửa bên trong được. `const` chỉ chặn gán một object khác vào biến.

## Đọc bằng ngoặc vuông

Dấu chấm cần bạn biết tên thuộc tính lúc viết code. Nhưng có lúc tên nằm trong một biến, ví dụ người chơi chọn chỉ số muốn nâng.

```js
const stats = { str: 5, agi: 3, int: 7 };
const chosen = "agi";

console.log(stats.chosen);   // undefined
console.log(stats[chosen]);  // 3
```

`stats.chosen` tìm một thuộc tính tên là `chosen`, không có nên ra `undefined`. `stats[chosen]` lấy giá trị của biến `chosen` (là `"agi"`) rồi mới tìm. Muốn dùng tên nằm trong biến thì phải dùng ngoặc vuông.

```js
stats[chosen] += 1;
console.log(stats); // { str: 5, agi: 4, int: 7 }
```

Ngoặc vuông cũng dùng khi tên có dấu cách hoặc ký tự đặc biệt: `item["fire-resist"]`.

> **Lỗi hay gặp:** đọc thuộc tính của một thuộc tính chưa có. `player.weapon.damage` khi chưa có `weapon` báo `TypeError: Cannot read properties of undefined (reading 'damage')`. Dùng `player.weapon?.damage`: nếu `weapon` không có thì trả về `undefined` thay vì lỗi.

## Thêm, xoá và kiểm tra thuộc tính

Gán vào một tên chưa có là thêm thuộc tính mới:

```js
const player = { name: "Aki", hp: 100 };
player.weapon = "Kiếm gỗ";
console.log(player); // { name: 'Aki', hp: 100, weapon: 'Kiếm gỗ' }
```

Xoá bằng `delete`, kiểm tra bằng `in`:

```js
delete player.weapon;
console.log("weapon" in player); // false
console.log("hp" in player);     // true
```

## Object lồng nhau

Giá trị của thuộc tính có thể là mảng hoặc object khác. Đây là cách dữ liệu game thật thường trông.

```js
const hero = {
  name: "Aki",
  stats: { hp: 100, attack: 12 },
  inventory: ["bình máu", "chìa khóa"],
};

console.log(hero.stats.attack);   // 12
console.log(hero.inventory[0]);   // bình máu
console.log(hero.inventory.length); // 2
```

## Hàm trong object

Thuộc tính có thể là một [hàm](/docs/javascript/ham). Hàm đó gọi là method, dùng `this` để trỏ tới chính object.

```js
const enemy = {
  name: "Goblin",
  hp: 30,
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    console.log(`${this.name} còn ${this.hp} máu`);
  },
};

enemy.takeDamage(12); // Goblin còn 18 máu
enemy.takeDamage(50); // Goblin còn 0 máu
```

`Math.max(0, ...)` giữ máu không xuống số âm.

## Lấy danh sách key

`Object.keys` trả về mảng tên thuộc tính, tiện để in bảng chỉ số:

```js
const stats = { str: 5, agi: 3, int: 7 };
console.log(Object.keys(stats)); // [ 'str', 'agi', 'int' ]
```

Để lặp qua từng cặp, xem `for...of` ở trang [Vòng lặp](/docs/javascript/vong-lap). Muốn lưu object ra file hay localStorage, xem trang [JSON](/docs/javascript/json).

## Bài tập

Tạo object `monster` có `name` là "Slime", `hp` là 40, `drops` là mảng `["gel", "vàng"]`. Trừ 15 máu, thêm thuộc tính `isBoss` là `false`, rồi in `Slime còn 25 máu, rơi 2 món`.

<details>
<summary>Xem đáp án</summary>

```js
const monster = {
  name: "Slime",
  hp: 40,
  drops: ["gel", "vàng"],
};

monster.hp -= 15;
monster.isBoss = false;
console.log(`${monster.name} còn ${monster.hp} máu, rơi ${monster.drops.length} món`);
// Slime còn 25 máu, rơi 2 món
```

</details>
