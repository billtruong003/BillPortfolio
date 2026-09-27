---
title: "JSON trong JavaScript"
description: "JSON là gì, dùng JSON.stringify và JSON.parse để đổi qua lại giữa object và chuỗi, và lưu điểm cao của mini game vào localStorage."
section: "Dữ liệu"
order: 19
tags: ["JSON", "localStorage", "lưu game"]
image: /images/docs/javascript/json.webp
imageIdea: "Nhân vật anime đang gấp một con robot nhân vật thành một cuộn giấy dài ghi chữ JSON để cất vào ngăn kéo có nhãn 'localStorage', bên cạnh là cuộn giấy khác đang mở ra thành robot trở lại."
imagePrompt: "Edit this image: the character folds a small toy robot into a long paper scroll covered with '{\"score\": 120}' text and places it into a drawer labeled 'localStorage'; next to it, another scroll unfolds back into a toy robot. Keep the original art style, 16:9."
---

JSON (JavaScript Object Notation) là cách viết dữ liệu dưới dạng chuỗi chữ, nhìn gần giống object của JS. Vì là chuỗi nên nó lưu vào file, gửi qua mạng hay cất vào bộ nhớ trình duyệt được. Mini game dùng JSON để lưu điểm cao, lưu tiến trình, đọc file cấu hình level.

## JSON trông ra sao

```js
const json = '{"name":"Aki","hp":100,"items":["kiếm","bình máu"]}';
```

Giống object, nhưng luật chặt hơn:

- Tên key phải nằm trong nháy kép: `"name"`, không được `name` hay `'name'`.
- Chuỗi dùng nháy kép.
- Không có dấu phẩy thừa ở cuối.
- Không chứa hàm, `undefined` hay comment.

## JSON.stringify: object thành chuỗi

```js
const save = {
  playerName: "Aki",
  level: 4,
  inventory: ["kiếm", "khiên"],
};

const text = JSON.stringify(save);
console.log(text);
// {"playerName":"Aki","level":4,"inventory":["kiếm","khiên"]}
console.log(typeof text); // string
```

Muốn dễ đọc khi debug, truyền thêm số dấu cách thụt đầu dòng:

```js
console.log(JSON.stringify(save, null, 2));
// {
//   "playerName": "Aki",
//   "level": 4,
//   "inventory": [
//     "kiếm",
//     "khiên"
//   ]
// }
```

## JSON.parse: chuỗi thành object

```js
const text = '{"playerName":"Aki","level":4}';
const data = JSON.parse(text);

console.log(data.level);     // 4
console.log(data.level + 1); // 5
```

Kết quả là object thật, dùng dấu chấm đọc được, số vẫn là số.

> **Lỗi hay gặp:** `JSON.parse` một chuỗi viết sai luật JSON, ví dụ key không có nháy: `JSON.parse("{level: 4}")`. JS báo `SyntaxError: Expected property name or '}' in JSON at position 1`. Chuỗi rỗng hay `undefined` cũng lỗi. Dữ liệu từ ngoài vào thì bọc `JSON.parse` trong `try...catch`.

## Lưu điểm cao với localStorage

`localStorage` là chỗ lưu dữ liệu của trình duyệt, còn nguyên sau khi tắt tab hay tắt máy. Nó chỉ lưu chuỗi, theo cặp key và giá trị.

```js
localStorage.setItem("highScore", "250");
console.log(localStorage.getItem("highScore")); // 250
console.log(localStorage.getItem("unknownKey")); // null
```

Chỗ người mới hay vấp: đưa object thẳng vào `setItem`.

```js
const record = { name: "Aki", score: 250 };
localStorage.setItem("record", record);
console.log(localStorage.getItem("record")); // [object Object]
```

`localStorage` tự đổi object thành chuỗi bằng cách thô nhất, ra `"[object Object]"`, dữ liệu mất sạch. Cách đúng: `JSON.stringify` trước khi lưu, `JSON.parse` sau khi đọc.

```js
const record = { name: "Aki", score: 250 };
localStorage.setItem("record", JSON.stringify(record));

const loaded = JSON.parse(localStorage.getItem("record"));
console.log(loaded.score); // 250
```

## Ví dụ: bảng điểm cao

Ghép lại thành hai hàm cho mini game. Lần đầu chơi chưa có dữ liệu, `getItem` trả về `null`, nên dùng `??` để có mảng rỗng mặc định.

```js
const STORAGE_KEY = "highScores";

function loadHighScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveScore(name, score) {
  const scores = loadHighScores();
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  const top5 = scores.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
  return top5;
}

saveScore("Aki", 250);
saveScore("Mira", 410);
console.log(loadHighScores());
// [ { name: 'Mira', score: 410 }, { name: 'Aki', score: 250 } ]
```

Vài điểm trong code:

- `JSON.parse(null)` ra `null`, nên `?? []` biến nó thành mảng rỗng.
- `try...catch` phòng trường hợp dữ liệu cũ bị hỏng. Không có nó, một chuỗi lỗi là game không mở được. Cách `try...catch` hoạt động có ở trang [Async await](/docs/javascript/async-await).
- `{ name, score }` là cách viết tắt của `{ name: name, score: score }`.
- `sort((a, b) => b.score - a.score)` xếp điểm từ cao xuống thấp.

`localStorage` chỉ có trên trình duyệt. Mỗi trang web có vùng lưu riêng, và người chơi xoá dữ liệu duyệt web là mất. Đừng lưu mật khẩu hay thông tin nhạy cảm vào đó.

## Bài tập

Viết hai hàm `saveProgress(level, gold)` lưu object `{ level, gold }` vào key `"progress"`, và `loadProgress()` đọc lại. Nếu chưa có dữ liệu thì trả về `{ level: 1, gold: 0 }`.

<details>
<summary>Xem đáp án</summary>

```js
function saveProgress(level, gold) {
  localStorage.setItem("progress", JSON.stringify({ level, gold }));
}

function loadProgress() {
  const text = localStorage.getItem("progress");
  if (text === null) {
    return { level: 1, gold: 0 };
  }
  return JSON.parse(text);
}

saveProgress(3, 120);
console.log(loadProgress()); // { level: 3, gold: 120 }
```

</details>
