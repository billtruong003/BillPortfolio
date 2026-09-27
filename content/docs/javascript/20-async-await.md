---
title: "Async await trong JavaScript"
description: "Promise là gì, dùng async/await để chờ dữ liệu, fetch một file JSON cấu hình level cho mini game và bắt lỗi bằng try/catch."
section: "Dữ liệu"
order: 20
tags: ["async", "await", "Promise", "fetch", "try catch"]
image: /images/docs/javascript/async-await.webp
imageIdea: "Nhân vật anime ngồi chờ ở quầy tiệm rèn, tay cầm tấm vé ghi 'Promise', trên tường có đồng hồ cát; thợ rèn phía sau đang mang ra thanh kiếm có thẻ 'await'."
imagePrompt: "Edit this image: the character waits at a blacksmith shop counter holding a ticket that reads 'Promise', an hourglass on the wall, while the blacksmith in the back brings out a sword tagged 'await'. Keep the original art style, 16:9."
---

Có những việc không xong ngay: tải file level từ server, đọc dữ liệu từ mạng. JavaScript không đứng chờ những việc đó, vì chờ thì cả trang đứng hình. Nó dùng Promise để hẹn "xong thì báo", và `async`/`await` để bạn viết code chờ đợi mà vẫn đọc từ trên xuống như bình thường.

## Vấn đề: dữ liệu chưa về

Người mới hay viết code tải dữ liệu như thể nó có ngay:

```js
const response = fetch("level1.json");
console.log(response); // Promise { <pending> }
```

`fetch` không trả về dữ liệu. Nó trả về một Promise, tức một tấm vé hẹn: "dữ liệu đang tải, lát nữa có". Đọc `response.enemies` lúc này chỉ ra `undefined`.

## Promise

Promise có ba trạng thái:

- **pending**: đang chờ.
- **fulfilled**: xong, có kết quả.
- **rejected**: thất bại, có lỗi.

Tự tạo một Promise để thấy rõ, ví dụ đếm ngược trước khi vào trận:

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

`wait(1000)` trả về Promise sẽ chuyển sang fulfilled sau 1 giây. Bạn ít khi phải tự viết Promise. Phần lớn thời gian bạn nhận Promise từ hàm có sẵn như `fetch`, và việc của bạn là chờ nó.

## async và await

`await` đặt trước một Promise, nghĩa là "dừng hàm này ở đây, chờ Promise xong, lấy kết quả". `await` chỉ dùng được trong hàm có chữ `async` phía trước (hoặc ở cấp ngoài cùng của [module](/docs/javascript/module)).

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function countdown() {
  console.log("3");
  await wait(1000);
  console.log("2");
  await wait(1000);
  console.log("1");
  await wait(1000);
  console.log("Chiến!");
}

countdown();
console.log("Đang tải bản đồ...");
// 3
// Đang tải bản đồ...
// 2
// 1
// Chiến!
```

Để ý thứ tự in. `countdown` in "3" rồi gặp `await`, tạm dừng. Trong lúc đó code bên ngoài chạy tiếp và in "Đang tải bản đồ...". Chỉ hàm `async` chờ, phần còn lại của trang không bị chặn.

Hàm `async` luôn trả về một Promise. Muốn lấy giá trị nó `return` thì cũng phải `await`.

> **Lỗi hay gặp:** dùng `await` trong hàm thường. JS báo `SyntaxError: await is only valid in async functions and the top level bodies of modules`. Thêm `async` trước `function` là xong.

## fetch một file JSON

Giả sử cạnh `index.html` có file `level1.json`:

```json
{ "name": "Rừng tối", "enemies": ["Slime", "Goblin"], "timeLimit": 90 }
```

Tải và dùng nó:

```js
async function loadLevel(file) {
  const response = await fetch(file);
  const level = await response.json();
  return level;
}

const level = await loadLevel("level1.json");
console.log(level.name);           // Rừng tối
console.log(level.enemies.length); // 2
```

Có hai lần `await`. Lần đầu chờ server trả lời. Lần hai chờ đọc hết nội dung và đổi từ [JSON](/docs/javascript/json) sang object. `response.json()` cũng trả về Promise.

Dòng `await loadLevel(...)` ở ngoài hàm chỉ chạy được trong module (`<script type="module">`). Trong script thường thì gọi bên trong một hàm `async` khác.

`fetch` cần trang chạy qua một server. Mở file `index.html` bằng cách nhấp đúp (địa chỉ bắt đầu bằng `file://`) thì trình duyệt chặn `fetch`. Dùng tiện ích Live Server của VS Code, hoặc chạy `npx serve` trong thư mục dự án.

## Bắt lỗi với try/catch

Mạng có thể rớt, file có thể sai tên. Promise bị rejected thì `await` ném ra lỗi, và không bắt thì hàm dừng giữa chừng. Bọc trong `try...catch`:

```js
async function loadLevel(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Không tải được ${file}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

const level = await loadLevel("level99.json");
// Không tải được level99.json: 404
console.log(level); // null
```

Chỗ dễ sót: `fetch` không coi lỗi 404 là thất bại. Server trả lời "không có file" vẫn là một câu trả lời, nên Promise vẫn fulfilled. Phải tự kiểm tra `response.ok` và tự `throw` lỗi.

Code trong `try` chạy bình thường. Dòng nào ném lỗi thì nhảy thẳng xuống `catch`, bỏ qua các dòng còn lại trong `try`. Biến `error` chứa thông tin lỗi, `error.message` là câu mô tả.

## Bài tập

Viết hàm `async` tên `startGame()`: tải `config.json` (có dạng `{ "startHp": 100 }`), in `Bắt đầu với 100 máu`. Nếu tải lỗi thì dùng máu mặc định 50 và in `Dùng cấu hình mặc định`.

<details>
<summary>Xem đáp án</summary>

```js
async function startGame() {
  let startHp = 50;
  try {
    const response = await fetch("config.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const config = await response.json();
    startHp = config.startHp;
  } catch {
    console.log("Dùng cấu hình mặc định");
  }
  console.log(`Bắt đầu với ${startHp} máu`);
}

startGame();
// có file: Bắt đầu với 100 máu
```

</details>
