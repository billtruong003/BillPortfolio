---
title: "Mảng trong JavaScript"
description: "Mảng (array) trong JavaScript: tạo mảng, đọc theo chỉ số, length, push, pop, và ba hàm map, filter, find để xử lý kho đồ trong game."
section: "Collection"
order: 10
tags: ["mảng", "array", "map", "filter", "find"]
image: /images/docs/javascript/mang.webp
imageIdea: "Nhân vật anime xếp đồ vào một dãy ô kho đồ kiểu game RPG, mỗi ô có số thứ tự 0, 1, 2, 3 ở góc, tay đang đẩy thêm một bình máu vào ô cuối."
imagePrompt: "Edit this image: the character places items into a horizontal row of RPG inventory slots, each slot has a small index number 0, 1, 2, 3 in the corner, and the character pushes a red potion into the last empty slot labeled 'push()'. Keep the original art style, 16:9."
---

Mảng (array) là một danh sách giá trị có thứ tự, gói trong một biến. Kho đồ, danh sách quái trong wave, bảng điểm cao: đều là mảng. Thay vì tạo `item1`, `item2`, `item3`, bạn có một biến `inventory` giữ tất cả.

## Tạo mảng và đọc phần tử

Viết các giá trị trong ngoặc vuông, ngăn bằng dấu phẩy.

```js
const inventory = ["kiếm", "khiên", "bình máu"];
console.log(inventory[0]); // kiếm
console.log(inventory[2]); // bình máu
```

Chỗ người mới hay vấp: chỉ số bắt đầu từ 0, không phải 1. Phần tử đầu là `[0]`, phần tử thứ ba là `[2]`.

Đọc một chỉ số không tồn tại thì không báo lỗi, chỉ trả về `undefined`:

```js
console.log(inventory[5]); // undefined
```

Đổi một phần tử bằng cách gán vào chỉ số đó:

```js
inventory[1] = "khiên sắt";
console.log(inventory); // [ 'kiếm', 'khiên sắt', 'bình máu' ]
```

## length

`length` là số phần tử trong mảng. Phần tử cuối luôn nằm ở `length - 1`.

```js
const enemies = ["Slime", "Goblin", "Bat"];
console.log(enemies.length);                 // 3
console.log(enemies[enemies.length - 1]);    // Bat
```

## Thêm và bớt với push, pop

`push` thêm vào cuối mảng, `pop` lấy ra phần tử cuối.

```js
const inventory = ["kiếm"];
inventory.push("bình máu");
inventory.push("chìa khóa");
console.log(inventory); // [ 'kiếm', 'bình máu', 'chìa khóa' ]

const lastItem = inventory.pop();
console.log(lastItem);  // chìa khóa
console.log(inventory); // [ 'kiếm', 'bình máu' ]
```

Mảng khai báo bằng `const` vẫn `push` được. `const` chỉ chặn gán cả mảng mới vào biến (xem trang [Biến](/docs/javascript/bien)).

## map: biến đổi từng phần tử

`map` chạy một hàm trên từng phần tử và trả về mảng mới cùng độ dài. Mảng gốc không đổi.

```js
const damages = [10, 25, 8];
const critDamages = damages.map((d) => d * 2);
console.log(critDamages); // [ 20, 50, 16 ]
console.log(damages);     // [ 10, 25, 8 ]
```

Phần `(d) => d * 2` là một [arrow function](/docs/javascript/arrow-function): nhận `d`, trả về `d * 2`. Nếu chưa quen thì đọc nó là "với mỗi d, lấy d nhân 2".

## filter: lọc phần tử

`filter` giữ lại những phần tử làm hàm trả về `true`.

```js
const enemyHps = [0, 30, 0, 12, 50];
const alive = enemyHps.filter((hp) => hp > 0);
console.log(alive);        // [ 30, 12, 50 ]
console.log(alive.length); // 3
```

Hay dùng để dọn quái đã chết khỏi danh sách, hoặc lọc đồ theo loại.

## find: tìm phần tử đầu tiên

`find` trả về phần tử đầu tiên thoả điều kiện. Không có thì trả về `undefined`.

```js
const enemies = [
  { name: "Slime", hp: 0 },
  { name: "Goblin", hp: 20 },
  { name: "Bat", hp: 15 },
];

const target = enemies.find((e) => e.hp > 0);
console.log(target.name); // Goblin

const boss = enemies.find((e) => e.name === "Dragon");
console.log(boss); // undefined
```

Mỗi phần tử ở đây là một [object](/docs/javascript/object). Mảng chứa object là kiểu dữ liệu rất hay gặp trong game.

> **Lỗi hay gặp:** dùng kết quả `find` mà không kiểm tra. `boss.name` khi `boss` là `undefined` sẽ báo `TypeError: Cannot read properties of undefined (reading 'name')`. Kiểm tra `if (boss)` trước.

## Chọn map, filter hay find

| Hàm | Trả về | Dùng khi |
|---|---|---|
| `map` | Mảng mới, cùng độ dài | Đổi mỗi phần tử thành thứ khác |
| `filter` | Mảng mới, có thể ngắn hơn | Giữ lại những phần tử đạt điều kiện |
| `find` | Một phần tử hoặc `undefined` | Cần đúng một kết quả |

Muốn lặp qua mảng để làm việc gì đó (in ra, cộng dồn), xem trang [Vòng lặp](/docs/javascript/vong-lap).

## Bài tập

Có mảng điểm của các lượt chơi `[120, 45, 300, 80, 210]`. Lọc ra các lượt trên 100 điểm, sau đó dùng `map` để cộng thêm 10 điểm thưởng cho mỗi lượt đó. In kết quả và số lượt.

<details>
<summary>Xem đáp án</summary>

```js
const scores = [120, 45, 300, 80, 210];
const bonusScores = scores
  .filter((s) => s > 100)
  .map((s) => s + 10);

console.log(bonusScores);        // [ 130, 310, 220 ]
console.log(bonusScores.length); // 3
```

</details>
