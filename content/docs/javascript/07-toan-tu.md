---
title: "Toán tử trong JavaScript"
description: "Toán tử số học, so sánh === và ==, toán tử logic && || ! và toán tử ?? trong JavaScript, kèm ví dụ tính máu và điểm trong game."
section: "Cơ bản"
order: 7
tags: ["toán tử", "so sánh", "logic", "nullish"]
image: /images/docs/javascript/toan-tu.webp
imageIdea: "Nhân vật anime làm trọng tài cân hai bên đĩa cân: một bên là số 5, một bên là chuỗi '5'. Tấm biển ghi '===' giơ thẻ đỏ, tấm biển '==' thì gật đầu cho qua."
imagePrompt: "Edit this image: the character acts as a referee beside a balance scale, one pan holds the number 5, the other holds a paper tag reading \"'5'\"; a sign labeled '===' raises a red card while a sign labeled '==' shrugs. Keep the original art style, 16:9."
---

Toán tử là các ký hiệu làm phép tính hoặc phép so sánh: `+`, `-`, `===`, `&&`. Mọi thứ trong game từ trừ máu tới kiểm tra thắng thua đều đi qua chúng. Trang này nói về bốn nhóm hay dùng nhất.

## Số học

```js
let hp = 100;
hp = hp - 25;           // trừ
const gold = 12 * 3;    // nhân
const share = 50 / 4;   // chia
const leftover = 50 % 4; // chia lấy dư

console.log(hp, gold, share, leftover); // 75 36 12.5 2
```

`%` hay dùng để làm việc gì đó "mỗi N lần". Ví dụ cứ 5 wave thì ra boss:

```js
const wave = 10;
console.log(wave % 5 === 0); // true, wave này có boss
```

Có cách viết gọn cho phép gán kèm tính:

```js
let score = 0;
score += 10;  // score = score + 10
score *= 2;   // score = score * 2
score++;      // cộng 1
console.log(score); // 21
```

## So sánh: dùng === thay vì ==

Đây là chỗ người mới hay dính nhất. JS có hai kiểu so sánh bằng.

- `==` so sánh lỏng: đổi kiểu hai bên cho giống nhau rồi mới so.
- `===` so sánh chặt: khác kiểu là khác luôn.

```js
console.log(5 == "5");   // true
console.log(5 === "5");  // false
console.log(0 == "");    // true
console.log(0 === "");   // false
```

`0 == ""` ra `true` là kiểu kết quả khiến bug khó tìm. Điểm bằng 0 và ô nhập liệu trống bị coi là như nhau. Cách đúng: luôn dùng `===` và `!==`. Nếu cần so số với chuỗi thì tự đổi chuỗi sang số trước.

```js
const input = "5";
console.log(Number(input) === 5); // true
```

Các phép so sánh còn lại: `>`, `<`, `>=`, `<=`.

```js
const hp = 30;
console.log(hp <= 30);  // true
console.log(hp !== 0);  // true
```

## Logic: &&, ||, !

- `&&` (và): đúng khi cả hai vế đúng.
- `||` (hoặc): đúng khi ít nhất một vế đúng.
- `!` (phủ định): đảo đúng thành sai.

```js
const hasKey = true;
const bossDefeated = false;

console.log(hasKey && bossDefeated); // false, chưa mở được cửa
console.log(hasKey || bossDefeated); // true
console.log(!bossDefeated);          // true
```

Ví dụ kiểm tra có được tấn công không:

```js
const isAlive = true;
const mana = 20;
const canCast = isAlive && mana >= 15;
console.log(canCast); // true
```

## Giá trị mặc định với ??

Tình huống hay gặp: một giá trị có thể chưa có (`null` hoặc `undefined`), khi đó muốn dùng một giá trị dự phòng. Nhiều người dùng `||`:

```js
const savedScore = 0;
const score = savedScore || 100;
console.log(score); // 100
```

Sai rồi. Người chơi lưu điểm 0 thật, nhưng `||` coi `0` là giá trị "sai" và thay bằng 100. Chuỗi rỗng `""` và `false` cũng bị thay như vậy.

`??` (nullish coalescing) chỉ thay khi vế trái là `null` hoặc `undefined`:

```js
const savedScore = 0;
console.log(savedScore ?? 100); // 0

let savedLevel;
console.log(savedLevel ?? 1);   // 1
```

Quy tắc: muốn "nếu chưa có thì dùng mặc định", dùng `??`. Chỉ dùng `||` khi bạn thật sự muốn thay cả `0` và `""`.

> **Lỗi hay gặp:** trộn `??` với `||` hay `&&` mà không có ngoặc, ví dụ `a || b ?? c`. JS báo `SyntaxError: Unexpected token '??'`. Thêm ngoặc cho rõ: `(a || b) ?? c`.

## Thứ tự tính

Nhân chia làm trước, cộng trừ làm sau, giống toán ở trường. Không chắc thì thêm ngoặc.

```js
const baseDamage = 10;
const bonus = 5;
console.log(baseDamage + bonus * 2);   // 20
console.log((baseDamage + bonus) * 2); // 30
```

## Bài tập

Nhân vật có `hp = 45` và `potions = 0`. Viết biểu thức `needHelp` đúng khi máu dưới 50 và không còn bình máu. Sau đó viết `shieldPower` bằng `equippedShield ?? 0` với `equippedShield = null`.

<details>
<summary>Xem đáp án</summary>

```js
const hp = 45;
const potions = 0;
const needHelp = hp < 50 && potions === 0;
console.log(needHelp); // true

const equippedShield = null;
const shieldPower = equippedShield ?? 0;
console.log(shieldPower); // 0
```

</details>
