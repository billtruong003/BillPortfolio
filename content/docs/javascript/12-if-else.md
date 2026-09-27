---
title: "If else trong JavaScript"
description: "Rẽ nhánh trong JavaScript với if, else if, else, toán tử ba ngôi, và các giá trị truthy, falsy hay làm người mới rẽ nhầm nhánh."
section: "Điều khiển luồng"
order: 12
tags: ["if", "else", "điều kiện", "truthy", "falsy"]
image: /images/docs/javascript/if-else.webp
imageIdea: "Nhân vật anime đứng giữa ngã ba trong hầm ngục, biển chỉ đường ghi 'if (hp > 50)' trỏ vào phòng boss và 'else' trỏ về phía suối hồi máu."
imagePrompt: "Edit this image: the character stands at a fork in a dungeon corridor, a wooden signpost reads 'if (hp > 50)' pointing toward a boss door and 'else' pointing toward a glowing healing fountain. Keep the original art style, 16:9."
---

`if` cho code chọn đường: nếu điều kiện đúng thì làm việc này, không thì làm việc khác. Game nào cũng đầy những lựa chọn như vậy: hết máu thì game over, đủ điểm thì lên level, có chìa khóa thì mở cửa.

## if

Điều kiện đặt trong ngoặc tròn. Đúng thì chạy khối trong ngoặc nhọn.

```js
const hp = 0;

if (hp <= 0) {
  console.log("Game over");
}
// Game over
```

## if else

Thêm `else` cho trường hợp điều kiện sai.

```js
const hasKey = false;

if (hasKey) {
  console.log("Cửa mở");
} else {
  console.log("Cần tìm chìa khóa");
}
// Cần tìm chìa khóa
```

## else if

Nhiều trường hợp thì nối bằng `else if`. JS kiểm tra từ trên xuống, gặp điều kiện đúng đầu tiên thì chạy khối đó và bỏ qua phần còn lại.

```js
const score = 850;

if (score >= 1000) {
  console.log("Hạng S");
} else if (score >= 700) {
  console.log("Hạng A");
} else if (score >= 400) {
  console.log("Hạng B");
} else {
  console.log("Hạng C");
}
// Hạng A
```

Thứ tự có ý nghĩa. Người mới hay viết điều kiện rộng lên trước:

```js
if (score >= 400) {
  console.log("Hạng B");
} else if (score >= 1000) {
  console.log("Hạng S"); // không bao giờ chạy tới
}
```

850 thoả `>= 400` ngay nhánh đầu, nên nhánh hạng S không bao giờ được xét. Cách đúng: điều kiện chặt nhất đặt trên cùng.

> **Lỗi hay gặp:** viết `if (hp = 0)` thay vì `if (hp === 0)`. Một dấu bằng là phép gán: `hp` bị gán thành 0, và điều kiện là giá trị 0 nên sai. Không có lỗi nào báo, chỉ có máu tự dưng về 0. Nếu `hp` là `const` thì bạn may mắn hơn: JS báo `TypeError: Assignment to constant variable.`

## Toán tử ba ngôi

Khi chỉ cần chọn một trong hai giá trị, `if else` viết dài bốn năm dòng. Toán tử ba ngôi gọn hơn: `điều kiện ? giá trị khi đúng : giá trị khi sai`.

```js
const hp = 25;
const status = hp > 30 ? "Khoẻ" : "Nguy hiểm";
console.log(status); // Nguy hiểm
```

Hay dùng khi gán hoặc ghép chuỗi:

```js
const lives = 1;
console.log(`Còn ${lives} mạng${lives === 1 ? " (mạng cuối!)" : ""}`);
// Còn 1 mạng (mạng cuối!)
```

Đừng lồng nhiều tầng ba ngôi vào nhau. Quá hai lựa chọn thì quay về `if else if` cho dễ đọc.

## Truthy và falsy

Điều kiện trong `if` không nhất thiết là `true` hay `false`. JS tự đổi mọi giá trị sang boolean. Chỉ có đúng các giá trị sau bị coi là sai (falsy):

- `false`
- `0`
- `""` (chuỗi rỗng)
- `null`
- `undefined`
- `NaN`

Mọi thứ khác đều là đúng (truthy), kể cả `"0"`, `"false"`, mảng rỗng `[]` và object rỗng `{}`.

```js
const playerName = "";
if (playerName) {
  console.log(`Chào ${playerName}`);
} else {
  console.log("Nhập tên đi");
}
// Nhập tên đi
```

Dùng truthy cho gọn thì được, nhưng có cái bẫy khi giá trị hợp lệ lại là `0`:

```js
const gold = 0;
if (gold) {
  console.log(`Bạn có ${gold} vàng`);
} else {
  console.log("Không tìm thấy dữ liệu vàng");
}
// Không tìm thấy dữ liệu vàng
```

Người chơi có 0 vàng thật, nhưng code lại nghĩ là mất dữ liệu. Cách đúng: so sánh rõ ràng với thứ bạn thật sự muốn kiểm tra.

```js
if (gold !== undefined) {
  console.log(`Bạn có ${gold} vàng`); // Bạn có 0 vàng
}
```

Tương tự, mảng rỗng là truthy. Muốn kiểm tra kho đồ trống thì dùng `inventory.length === 0`, không dùng `if (!inventory)`.

Xem thêm các toán tử so sánh và `??` ở trang [Toán tử](/docs/javascript/toan-tu). Khi một biến có nhiều giá trị cố định để so, [switch](/docs/javascript/switch) có thể gọn hơn.

## Bài tập

Viết code cho nút tấn công: nếu `mana` từ 20 trở lên thì in "Cầu lửa!", nếu từ 5 tới dưới 20 thì in "Đánh thường", còn lại in "Hết mana". Thử với `mana = 12`. Sau đó dùng toán tử ba ngôi gán `label` là "Sẵn sàng" nếu `mana >= 20`, không thì "Đang hồi".

<details>
<summary>Xem đáp án</summary>

```js
const mana = 12;

if (mana >= 20) {
  console.log("Cầu lửa!");
} else if (mana >= 5) {
  console.log("Đánh thường");
} else {
  console.log("Hết mana");
}
// Đánh thường

const label = mana >= 20 ? "Sẵn sàng" : "Đang hồi";
console.log(label); // Đang hồi
```

</details>
