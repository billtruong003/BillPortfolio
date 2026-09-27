---
title: "Giới thiệu TypeScript"
description: "TypeScript là gì, vì sao thêm kiểu vào JavaScript giúp bắt lỗi trước khi chạy, cách cài và biên dịch file .ts sang .js bằng tsc."
section: "TypeScript"
order: 22
tags: ["typescript", "tsc", "kiểu dữ liệu"]
image: /images/docs/javascript/typescript-gioi-thieu.webp
imageIdea: "Nhân vật anime đeo kính bảo hộ, đứng ở cổng kiểm tra an ninh của một lâu đài, máy quét ghi 'tsc' đang chặn một cái hộp có nhãn 'hp = \"nhiều\"' và bật đèn đỏ."
imagePrompt: "Edit this image: the character wears safety goggles and operates a castle security gate with a scanner labeled 'tsc'; a box labeled 'hp = \"a lot\"' is stopped on the conveyor belt with a red warning light. Keep the original art style, 16:9."
---

TypeScript là JavaScript cộng thêm phần khai báo kiểu dữ liệu. Bạn ghi rõ biến này là số, hàm kia nhận chuỗi, và TypeScript kiểm tra toàn bộ code trước khi chạy. Lỗi kiểu "cộng nhầm chuỗi với số" bị bắt ngay trong editor, không đợi tới lúc người chơi gặp.

## Vấn đề TypeScript giải quyết

JavaScript cho mọi biến giữ mọi kiểu. Tiện lúc viết, nhưng lỗi chỉ lộ ra khi chạy:

```js
function calcDamage(attack, defense) {
  return attack - defense;
}

const attackInput = "20"; // đọc từ ô nhập liệu
console.log(calcDamage(attackInput, 5)); // 15
console.log(attackInput + 5);            // 205
```

Dòng đầu tình cờ đúng vì `-` tự đổi chuỗi sang số. Dòng hai sai vì `+` nối chuỗi. Không có lỗi đỏ nào. Game chạy, chỉ có con số sai. Với game nhỏ thì còn dò được, với dự án vài chục file thì loại lỗi này tốn cả buổi.

Cùng code đó viết bằng TypeScript:

```ts
function calcDamage(attack: number, defense: number): number {
  return attack - defense;
}

const attackInput = "20";
calcDamage(attackInput, 5);
// error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Phần `: number` sau tên tham số là khai báo kiểu. TypeScript thấy bạn truyền chuỗi vào chỗ cần số và báo lỗi ngay, trước khi code được chạy.

## TypeScript chạy như thế nào

Trình duyệt và Node không chạy trực tiếp TypeScript. Quy trình là:

1. Viết code trong file `.ts`.
2. Dùng trình biên dịch `tsc` kiểm tra kiểu và đổi sang file `.js`.
3. Chạy file `.js` như bình thường.

Khi biên dịch, mọi phần khai báo kiểu bị xoá đi. File `.js` sinh ra là JavaScript thuần. Nghĩa là TypeScript không làm game chạy nhanh hơn hay chậm hơn, nó chỉ giúp bạn viết đúng.

Kiến thức JS ở các trang trước dùng nguyên trong TypeScript. Mọi code JavaScript hợp lệ cũng gần như là TypeScript hợp lệ, bạn chỉ thêm kiểu vào.

## Cài và biên dịch bằng tsc

Cần Node 20 trở lên. Trong thư mục dự án, mở terminal và cài TypeScript:

```bash
npm install --save-dev typescript
npx tsc --version
```

Lệnh thứ hai in ra `Version 5.x.x` là cài xong.

Tạo file `combat.ts`:

```ts
const maxHp: number = 100;
let hp: number = maxHp;

function takeDamage(amount: number): void {
  hp = Math.max(0, hp - amount);
  console.log(`Còn ${hp}/${maxHp} máu`);
}

takeDamage(35);
```

Biên dịch rồi chạy:

```bash
npx tsc combat.ts
node combat.js
```

```text
Còn 65/100 máu
```

Mở `combat.js` vừa sinh ra, bạn sẽ thấy code gần như y hệt, chỉ mất hết các `: number`, `: void`.

`void` nghĩa là hàm không trả về gì.

> **Lỗi hay gặp:** `tsc` báo lỗi nhưng vẫn sinh ra file `.js`, và người mới chạy luôn file đó rồi thắc mắc sao lỗi vẫn còn. Mặc định `tsc` vẫn xuất file dù có lỗi kiểu. Đọc và sửa hết lỗi trong terminal trước khi chạy. Muốn chặn hẳn, thêm `"noEmitOnError": true` vào `tsconfig.json`.

## tsconfig.json

Dự án có nhiều file thì tạo file cấu hình bằng `npx tsc --init`. Một cấu hình gọn cho mini game trên trình duyệt:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "strict": true,
    "outDir": "dist",
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

Viết code trong `src/`, chạy `npx tsc` không kèm tên file, code JS được xuất ra `dist/`. Thẻ `<script type="module">` trỏ tới file trong `dist/` (xem trang [Module](/docs/javascript/module)).

Luôn bật `"strict": true`. Tắt nó đi thì TypeScript bỏ qua nhiều lỗi, mất phần lớn lý do để dùng.

## Có nên học TypeScript ngay

Học JavaScript cơ bản trước: [biến](/docs/javascript/bien), [hàm](/docs/javascript/ham), [object](/docs/javascript/object). TypeScript chỉ thêm một lớp kiểu lên trên, không thay đổi cách code chạy. Khi đã quen JS, thêm kiểu vào mất không nhiều công mà đỡ được nhiều lỗi.

Hai trang tiếp theo nói cách viết kiểu: [Kiểu trong TypeScript](/docs/javascript/typescript-kieu) và [Interface](/docs/javascript/typescript-interface).

## Bài tập

Đoạn TypeScript dưới có một lỗi kiểu. Tìm dòng lỗi và sửa cho đúng.

```ts
function addGold(current: number, amount: number): number {
  return current + amount;
}

const pickup = "25";
console.log(addGold(100, pickup));
```

<details>
<summary>Xem đáp án</summary>

Dòng cuối truyền chuỗi `"25"` vào tham số kiểu `number`, `tsc` báo lỗi TS2345. Đổi chuỗi sang số trước (hoặc khai báo `pickup` là số ngay từ đầu).

```ts
function addGold(current: number, amount: number): number {
  return current + amount;
}

const pickup = Number("25");
console.log(addGold(100, pickup)); // 125
```

</details>
