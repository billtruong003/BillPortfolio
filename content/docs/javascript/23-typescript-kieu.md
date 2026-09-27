---
title: "Kiểu dữ liệu trong TypeScript"
description: "Khai báo kiểu trong TypeScript: kiểu cho biến và hàm, khi nào để TypeScript tự suy luận kiểu, kiểu mảng, và union type cơ bản như number | null."
section: "TypeScript"
order: 23
tags: ["typescript", "kiểu", "suy luận kiểu", "union type"]
image: /images/docs/javascript/typescript-kieu.webp
imageIdea: "Nhân vật anime phân loại đồ vào các ngăn tủ có nhãn 'number', 'string', 'string[]', và một ngăn đặc biệt hai màu ghi 'number | null' đang chứa một nửa chiếc khiên."
imagePrompt: "Edit this image: the character sorts items into cabinet drawers labeled 'number', 'string' and 'string[]', plus one special two-colored drawer labeled 'number | null' that holds a half-transparent shield. Keep the original art style, 16:9."
---

Trang này nói cách viết kiểu trong TypeScript. Tin vui là bạn không phải ghi kiểu ở mọi nơi. TypeScript tự đoán được phần lớn, bạn chỉ cần ghi ở những chỗ nó không tự biết.

## Khai báo kiểu cho biến

Ghi kiểu sau tên biến, ngăn bằng dấu hai chấm.

```ts
let hp: number = 100;
let playerName: string = "Aki";
let isAlive: boolean = true;
```

Sau khi khai báo, biến chỉ nhận đúng kiểu đó:

```ts
hp = 80;       // được
hp = "nhiều";  // error TS2322: Type 'string' is not assignable to type 'number'.
```

Trong JavaScript thuần, dòng thứ hai chạy êm và làm hỏng máu của nhân vật. TypeScript chặn từ lúc viết code.

## Suy luận kiểu

Người mới học TypeScript hay ghi kiểu khắp nơi, code dài gấp đôi. Thật ra khi gán giá trị ngay lúc khai báo, TypeScript tự suy ra kiểu:

```ts
let hp = 100;          // TypeScript hiểu: number
let playerName = "Aki"; // string

hp = "nhiều"; // error TS2322: Type 'string' is not assignable to type 'number'.
```

Kết quả y như ghi `: number`. Di chuột lên tên biến trong VS Code sẽ thấy kiểu đã được suy ra.

Với `const`, kiểu còn hẹp hơn:

```ts
const difficulty = "hard"; // kiểu là "hard", hẹp hơn string
```

Vì `const` không gán lại được, TypeScript biết giá trị mãi là `"hard"`.

Quy tắc dùng hằng ngày:

- Biến có giá trị ngay khi khai báo: để TypeScript tự suy ra.
- Tham số hàm: luôn ghi kiểu, vì TypeScript không biết người gọi sẽ truyền gì.
- Kiểu trả về của hàm: không bắt buộc, nhưng ghi vào giúp bắt lỗi quên `return`.

## Kiểu cho hàm

```ts
function calcDamage(attack: number, defense: number = 0): number {
  return Math.max(0, attack - defense);
}

calcDamage(20);       // được, defense dùng mặc định
calcDamage(20, 5, 1); // error TS2554: Expected 1-2 arguments, but got 3.
```

TypeScript còn kiểm tra số lượng tham số. JavaScript thuần thì lặng lẽ bỏ qua tham số thừa.

Arrow function viết kiểu cùng chỗ:

```ts
const heal = (hp: number, amount: number): number => hp + amount;
```

## Kiểu mảng

Thêm `[]` sau kiểu của phần tử.

```ts
const scores: number[] = [120, 45, 300];
const inventory: string[] = ["kiếm", "khiên"];

inventory.push("bình máu"); // được
inventory.push(50);         // error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

Mảng có giá trị ban đầu thì kiểu cũng tự suy ra. Chỉ cần ghi khi tạo mảng rỗng:

```ts
const drops = [];            // không rõ chứa gì
const loot: string[] = [];   // rõ: mảng chuỗi
```

TypeScript cũng biết kiểu phần tử trong `map`, `filter`:

```ts
const doubled = scores.map((s) => s * 2); // number[]
```

## Union type: một trong vài kiểu

Có giá trị lúc thì có, lúc thì không. Mục tiêu đang nhắm có thể là tên quái hoặc chưa chọn ai. Dấu `|` nghĩa là "hoặc".

```ts
let target: string | null = null;
target = "Goblin"; // được
target = 42;       // error TS2322: Type 'number' is not assignable to type 'string'.
```

Chỗ union type hữu ích nhất: nó bắt bạn kiểm tra trước khi dùng.

```ts
function showTarget(target: string | null): string {
  return target.toUpperCase();
  // error TS18047: 'target' is possibly 'null'.
}
```

Trong JavaScript thuần, lỗi này chỉ lộ ra khi chạy: `TypeError: Cannot read properties of null`. TypeScript bắt từ lúc viết. Sửa bằng cách kiểm tra:

```ts
function showTarget(target: string | null): string {
  if (target === null) {
    return "Chưa chọn mục tiêu";
  }
  return target.toUpperCase(); // ở đây TypeScript biết target là string
}

console.log(showTarget(null));     // Chưa chọn mục tiêu
console.log(showTarget("Goblin")); // GOBLIN
```

Sau câu `if`, TypeScript tự thu hẹp kiểu: đã loại `null` thì phần còn lại chắc chắn là `string`.

Union type cũng dùng để giới hạn giá trị được phép:

```ts
type Difficulty = "easy" | "normal" | "hard";

let mode: Difficulty = "normal";
mode = "hardcore"; // error TS2322: Type '"hardcore"' is not assignable to type 'Difficulty'.
```

Gõ sai chính tả tên chế độ là bị bắt ngay. Từ khóa `type` đặt tên cho một kiểu, nói kỹ hơn ở trang [Interface](/docs/javascript/typescript-interface).

> **Lỗi hay gặp:** gặp lỗi kiểu thì ghi `: any` cho xong. `any` tắt kiểm tra kiểu cho biến đó, lỗi không mất mà chỉ bị giấu, và sẽ quay lại lúc chạy. Đọc kỹ thông báo lỗi và sửa đúng kiểu. Nếu thật sự chưa biết kiểu, dùng `unknown` rồi kiểm tra bằng `typeof` trước khi dùng.

## Bài tập

Viết hàm `findEnemy(names: string[], wanted: string)` trả về tên nếu có trong mảng, không có thì trả về `null`. Ghi đủ kiểu trả về. Sau đó gọi hàm và in độ dài tên tìm được, xử lý trường hợp `null`.

<details>
<summary>Xem đáp án</summary>

```ts
function findEnemy(names: string[], wanted: string): string | null {
  const found = names.find((n) => n === wanted);
  return found ?? null;
}

const result = findEnemy(["Slime", "Goblin"], "Goblin");
if (result !== null) {
  console.log(result.length); // 6
} else {
  console.log("Không thấy");
}
```

`find` trả về `string | undefined`, nên dùng `?? null` để đổi `undefined` thành `null` cho khớp kiểu trả về.

</details>
