---
title: "Interface trong TypeScript"
description: "Dùng interface và type trong TypeScript để mô tả object nhân vật, thuộc tính optional, readonly, và nên chọn interface hay type."
section: "TypeScript"
order: 24
tags: ["typescript", "interface", "type", "optional"]
image: /images/docs/javascript/typescript-interface.webp
imageIdea: "Nhân vật anime cầm một bản thiết kế nhân vật kiểu bản vẽ kỹ thuật màu xanh có tiêu đề 'interface Hero', các ô 'name', 'hp', 'weapon?' được đánh dấu, bên cạnh là một nhân vật chibi được lắp đúng theo bản vẽ."
imagePrompt: "Edit this image: the character holds a blue technical blueprint titled 'interface Hero' with fields 'name: string', 'hp: number' and 'weapon?: string', while a small chibi figure built exactly from the blueprint stands on the desk. Keep the original art style, 16:9."
---

Interface mô tả hình dạng của một object: có những thuộc tính nào, mỗi thuộc tính kiểu gì. Game có hàng chục object nhân vật, quái, vật phẩm. Khai báo hình dạng một lần, TypeScript kiểm tra mọi object theo đúng mẫu đó.

## Vấn đề: object không có khuôn

Trong JavaScript, gõ sai tên thuộc tính không bị báo lỗi:

```js
const hero = { name: "Aki", hp: 100 };
console.log(hero.hP); // undefined
```

`hP` sai chữ hoa, JS trả về `undefined` rồi phép tính sau ra `NaN`. TypeScript tự suy ra kiểu từ object literal nên bắt được lỗi này. Nhưng khi object đi qua hàm, TypeScript cần biết tham số có hình dạng gì. Đó là việc của interface.

## Khai báo interface

```ts
interface Hero {
  name: string;
  hp: number;
  level: number;
}

const aki: Hero = {
  name: "Aki",
  hp: 100,
  level: 3,
};
```

Mỗi dòng trong interface là một thuộc tính và kiểu của nó. Tên interface viết `PascalCase` theo quy ước.

Object phải khớp đúng mẫu. Thiếu hoặc thừa đều bị báo:

```ts
const mira: Hero = { name: "Mira", hp: 80 };
// error TS2741: Property 'level' is missing in type '{ name: string; hp: number; }' but required in type 'Hero'.

const bill: Hero = { name: "Bill", hp: 90, level: 1, mana: 50 };
// error TS2353: Object literal may only specify known properties, and 'mana' does not exist in type 'Hero'.
```

## Dùng interface cho tham số hàm

Đây là chỗ interface có ích nhất.

```ts
function takeDamage(hero: Hero, amount: number): void {
  hero.hp = Math.max(0, hero.hp - amount);
  console.log(`${hero.name} còn ${hero.hp} máu`);
}

takeDamage(aki, 30); // Aki còn 70 máu
```

Trong hàm, gõ `hero.` là editor gợi ý đủ `name`, `hp`, `level`. Gõ sai `hero.hP` thì báo lỗi TS2551 kèm câu hỏi "Did you mean 'hp'?".

## Thuộc tính optional

Có thuộc tính không phải nhân vật nào cũng có. Nhân vật mới tạo chưa có vũ khí. Thêm `?` sau tên thuộc tính để nó thành không bắt buộc.

```ts
interface Hero {
  name: string;
  hp: number;
  level: number;
  weapon?: string;
}

const newbie: Hero = { name: "Yuki", hp: 100, level: 1 }; // được, không có weapon
```

Thuộc tính optional có kiểu `string | undefined`. TypeScript bắt bạn kiểm tra trước khi dùng như một chuỗi:

```ts
function describe(hero: Hero): string {
  return hero.weapon.toUpperCase();
  // error TS18048: 'hero.weapon' is possibly 'undefined'.
}
```

Sửa bằng cách kiểm tra, hoặc dùng `??` để có giá trị mặc định:

```ts
function describe(hero: Hero): string {
  const weapon = hero.weapon ?? "tay không";
  return `${hero.name} cầm ${weapon}`;
}

console.log(describe(newbie)); // Yuki cầm tay không
```

> **Lỗi hay gặp:** đánh dấu mọi thuộc tính là optional cho khỏi bị báo lỗi thiếu. Lỗi thiếu không còn, nhưng mọi chỗ dùng lại phải kiểm tra `undefined`, và bạn mất luôn cảnh báo khi quên điền một thuộc tính quan trọng như `hp`. Chỉ dùng `?` cho thứ thật sự có thể không có.

## readonly

Thuộc tính không được đổi sau khi tạo, ví dụ `id`, đánh dấu `readonly`:

```ts
interface Item {
  readonly id: number;
  name: string;
}

const potion: Item = { id: 1, name: "Bình máu" };
potion.name = "Bình máu lớn"; // được
potion.id = 2; // error TS2540: Cannot assign to 'id' because it is a read-only property.
```

## Interface lồng nhau và mảng

Interface dùng được interface khác, kết hợp với kiểu mảng ở trang [Kiểu trong TypeScript](/docs/javascript/typescript-kieu):

```ts
interface Stats {
  attack: number;
  defense: number;
}

interface Enemy {
  name: string;
  hp: number;
  stats: Stats;
  drops: string[];
}

const wave: Enemy[] = [
  { name: "Slime", hp: 30, stats: { attack: 4, defense: 1 }, drops: ["gel"] },
  { name: "Goblin", hp: 50, stats: { attack: 8, defense: 3 }, drops: [] },
];

const alive = wave.filter((e) => e.hp > 0);
console.log(alive.length); // 2
```

## interface hay type

Từ khóa `type` cũng mô tả được object:

```ts
type Hero = {
  name: string;
  hp: number;
  weapon?: string;
};
```

Với object, hai cách gần như giống nhau. Khác biệt chính: `type` đặt tên được cho mọi loại kiểu, kể cả union type như `type Difficulty = "easy" | "hard"`, còn `interface` chỉ dùng cho hình dạng object.

Cách chọn đơn giản: dùng `interface` cho object nhân vật, quái, vật phẩm; dùng `type` cho union và các kiểu khác. Quan trọng nhất là chọn một cách và dùng thống nhất trong cả dự án.

## Bài tập

Viết interface `Item` có `id` (readonly, số), `name` (chuỗi), `price` (số), `rarity` là một trong `"common"`, `"rare"`, `"epic"`, và `description` optional. Viết hàm `label(item: Item): string` trả về `Kiếm lửa [epic] - 300 vàng`.

<details>
<summary>Xem đáp án</summary>

```ts
interface Item {
  readonly id: number;
  name: string;
  price: number;
  rarity: "common" | "rare" | "epic";
  description?: string;
}

function label(item: Item): string {
  return `${item.name} [${item.rarity}] - ${item.price} vàng`;
}

const sword: Item = { id: 7, name: "Kiếm lửa", price: 300, rarity: "epic" };
console.log(label(sword)); // Kiếm lửa [epic] - 300 vàng
```

</details>
