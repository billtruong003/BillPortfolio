---
title: "Chuỗi trong JavaScript"
description: "Làm việc với chuỗi trong JavaScript: template literal, length, includes, toUpperCase, split, và vì sao chuỗi không sửa tại chỗ được."
section: "Cơ bản"
order: 8
tags: ["chuỗi", "string", "template literal"]
image: /images/docs/javascript/chuoi.webp
imageIdea: "Nhân vật anime đang xâu các hạt chữ cái lên sợi dây như vòng cổ, tạo thành chữ 'LEVEL UP', và cầm kéo cắt chuỗi ra từng khúc."
imagePrompt: "Edit this image: the character threads letter beads onto a string like a necklace spelling 'LEVEL UP', holding small scissors ready to split it into pieces. Keep the original art style, 16:9."
---

Chuỗi (string) là dữ liệu dạng chữ: tên nhân vật, lời thoại, thông báo "Game over". Trang này nói cách ghép chuỗi cho gọn và các hàm có sẵn hay dùng nhất.

## Ghép chuỗi bằng template literal

Cách cũ là nối bằng `+`. Dài ra một chút là rối, dễ quên dấu cách:

```js
const playerName = "Aki";
const score = 120;
console.log("Người chơi " + playerName + " được " + score + "điểm");
// Người chơi Aki được 120điểm
```

Thiếu một dấu cách trước "điểm" mà nhìn code khó thấy. Cách gọn hơn là template literal: bọc chuỗi bằng dấu backtick `` ` `` và chèn biến bằng `${...}`.

```js
const playerName = "Aki";
const score = 120;
console.log(`Người chơi ${playerName} được ${score} điểm`);
// Người chơi Aki được 120 điểm
```

Trong `${...}` đặt được cả biểu thức:

```js
const hp = 35;
const maxHp = 50;
console.log(`Máu: ${hp}/${maxHp} (${(hp / maxHp) * 100}%)`);
// Máu: 35/50 (70%)
```

Template literal còn viết được nhiều dòng mà không cần ký tự xuống dòng đặc biệt.

> **Lỗi hay gặp:** dùng nháy kép với `${}`: `"Điểm: ${score}"`. JS in ra nguyên văn `Điểm: ${score}`, không báo lỗi gì. Chỉ dấu backtick mới hiểu `${}`.

## Độ dài với length

`length` cho biết chuỗi có bao nhiêu ký tự. Hay dùng để kiểm tra tên người chơi.

```js
const heroName = "Aki";
console.log(heroName.length); // 3

const input = "";
if (input.length === 0) {
  console.log("Tên không được để trống");
}
```

`length` là thuộc tính, không có ngoặc tròn. Viết `heroName.length()` sẽ báo `TypeError: heroName.length is not a function`.

Lấy từng ký tự theo vị trí, đếm từ 0:

```js
const heroName = "Aki";
console.log(heroName[0]);                   // A
console.log(heroName[heroName.length - 1]); // i
```

## Tìm chữ với includes

`includes` trả về `true` nếu chuỗi có chứa đoạn cần tìm.

```js
const itemName = "Kiếm lửa huyền thoại";
console.log(itemName.includes("lửa"));  // true
console.log(itemName.includes("Lửa"));  // false
```

Dòng hai ra `false` vì `includes` phân biệt hoa thường. Muốn tìm không phân biệt, đổi cả hai về cùng một kiểu chữ trước.

## Đổi hoa thường

`toUpperCase` đổi sang chữ hoa, `toLowerCase` đổi sang chữ thường.

```js
const command = "Attack";
console.log(command.toUpperCase()); // ATTACK
console.log(command.toLowerCase()); // attack

const itemName = "Kiếm Lửa";
console.log(itemName.toLowerCase().includes("lửa")); // true
```

Chỗ người mới hay hiểu nhầm: các hàm này không sửa chuỗi gốc. Chuỗi trong JS không đổi được tại chỗ, hàm nào cũng trả về một chuỗi mới.

```js
let title = "boss";
title.toUpperCase();
console.log(title); // boss

title = title.toUpperCase();
console.log(title); // BOSS
```

Muốn giữ kết quả thì gán lại vào biến.

## Tách chuỗi với split

`split` cắt chuỗi thành một [mảng](/docs/javascript/mang) theo ký tự ngăn cách.

```js
const loot = "vàng,bình máu,chìa khóa";
const items = loot.split(",");
console.log(items);        // [ 'vàng', 'bình máu', 'chìa khóa' ]
console.log(items.length); // 3
```

Ví dụ đọc một dòng lệnh chat trong game:

```js
const chat = "/give Aki 50";
const parts = chat.split(" ");
console.log(parts[1]); // Aki
console.log(parts[2]); // 50
```

`parts[2]` vẫn là chuỗi `"50"`, chưa phải số. Cách đổi sang số có ở trang [Số](/docs/javascript/so).

## Một số hàm khác hay dùng

```js
const raw = "   Aki   ";
console.log(raw.trim());               // Aki
console.log("Slime".startsWith("Sl")); // true
console.log("ha".repeat(3));           // hahaha
console.log("Boss Slime".replace("Slime", "Dragon")); // Boss Dragon
```

`trim` rất hay dùng với ô nhập tên, vì người chơi hay lỡ gõ dấu cách thừa.

## Bài tập

Có chuỗi `"  aki,warrior,12  "` là dữ liệu một nhân vật: tên, class, level. Bỏ khoảng trắng hai đầu, tách ra, rồi in `AKI (warrior) level 12` bằng template literal.

<details>
<summary>Xem đáp án</summary>

```js
const raw = "  aki,warrior,12  ";
const parts = raw.trim().split(",");
const name = parts[0].toUpperCase();
console.log(`${name} (${parts[1]}) level ${parts[2]}`);
// AKI (warrior) level 12
```

</details>
