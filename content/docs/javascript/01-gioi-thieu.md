---
title: "Giới thiệu JavaScript"
description: "JavaScript là gì, chạy ở đâu (trình duyệt và Node.js), khác Java chỗ nào, và vì sao nó hợp để làm mini game chạy ngay trên web."
section: "Bắt đầu"
order: 1
tags: ["giới thiệu", "javascript", "node", "trình duyệt"]
image: /images/docs/javascript/gioi-thieu.webp
imageIdea: "Nhân vật anime cầm hai tay cầm chơi game, một cái dán nhãn 'Browser', một cái dán nhãn 'Node', cả hai đều cắm vào cùng một hộp ghi 'JS'."
imagePrompt: "Edit this image: the character happily holds two game controllers, one labeled 'Browser' and one labeled 'Node', both cables plugged into a small yellow box with the text 'JS'. Keep the original art style, 16:9."
---

JavaScript (viết tắt JS) là ngôn ngữ lập trình của trình duyệt web. Mọi trang web có nút bấm phản hồi, có điểm số nhảy lên, có menu bật ra đều đang chạy JavaScript. Loạt bài này dạy JS từ đầu, lấy ví dụ là một mini game nhỏ chạy ngay trên trình duyệt.

## JavaScript chạy ở đâu

Người mới hay nghĩ phải cài một chương trình to mới viết được JS. Thật ra máy của bạn có sẵn chỗ chạy JS rồi: chính là trình duyệt Chrome, Edge hay Firefox đang mở.

JS có hai chỗ chạy chính:

- **Trình duyệt:** JS điều khiển trang web. Đổi chữ, đổi màu, bắt sự kiện click, vẽ game lên màn hình.
- **Node.js:** chạy JS ngoài trình duyệt, trong cửa sổ dòng lệnh. Dùng để viết server, tool nhỏ, script xử lý file.

Phần lõi của ngôn ngữ ở hai chỗ giống nhau. Biến, `if`, vòng lặp, hàm viết một kiểu. Khác nhau ở thứ có sẵn xung quanh: trình duyệt có `document` để sửa trang, Node có `fs` để đọc file.

## Một đoạn JavaScript trông ra sao

Đoạn này tính máu còn lại sau khi nhân vật trúng đòn, rồi in ra.

```js
let hp = 100;
const damage = 35;

hp = hp - damage;
console.log("Máu còn lại:", hp); // Máu còn lại: 65
```

Dán đoạn trên vào Console của trình duyệt (bấm F12, chọn tab Console) là chạy được ngay. Cách mở Console và các cách chạy khác có ở trang [Chạy JavaScript](/docs/javascript/chay-javascript).

## JavaScript khác Java

Tên giống nhau nhưng đây là hai ngôn ngữ khác hẳn. Hồi năm 1995, cái tên JavaScript được chọn một phần để ăn theo độ nổi của Java. Ngoài chữ "Java" ra, hai bên gần như không liên quan.

| | JavaScript | Java |
|---|---|---|
| Chạy ở đâu | Trình duyệt, Node.js | Máy ảo JVM |
| Khai báo kiểu | Không bắt buộc | Bắt buộc (`int hp = 100;`) |
| Biên dịch | Chạy thẳng từ mã nguồn | Biên dịch ra bytecode trước |
| Dùng nhiều cho | Web, game web, tool | Android, server doanh nghiệp |

> **Lỗi hay gặp:** tìm "cách làm X trong Java" rồi dán code vào file `.js`. Code sẽ lỗi ngay, ví dụ `SyntaxError: Unexpected identifier` khi gặp `int hp = 100;`. Luôn tìm với từ khóa "JavaScript" hoặc "JS".

## JavaScript và TypeScript

Ở cuối loạt bài có phần TypeScript. TypeScript là JavaScript cộng thêm phần khai báo kiểu, giúp bắt lỗi trước khi chạy. Học JS trước, vì mọi code TypeScript cuối cùng đều được đổi thành JS để chạy. Xem thêm ở [Giới thiệu TypeScript](/docs/javascript/typescript-gioi-thieu).

## Vì sao làm mini game để học

Game trên trình duyệt cho bạn thấy kết quả ngay: bấm nút, điểm tăng; trúng đòn, thanh máu tụt. Không cần cài engine, không cần chờ build. Mỗi bài trong loạt này dùng một mảnh của mini game đó: biến giữ máu, mảng giữ kho đồ, hàm tính sát thương, sự kiện click cho nút tấn công.

Thứ tự học gợi ý:

1. [Chạy JavaScript](/docs/javascript/chay-javascript) và [in kết quả](/docs/javascript/output).
2. [Biến](/docs/javascript/bien), [kiểu dữ liệu](/docs/javascript/kieu-du-lieu), [toán tử](/docs/javascript/toan-tu).
3. [if else](/docs/javascript/if-else), [vòng lặp](/docs/javascript/vong-lap), [hàm](/docs/javascript/ham).
4. [DOM](/docs/javascript/dom) và [sự kiện](/docs/javascript/su-kien) để làm giao diện game.

## Bài tập

Chưa cần chạy, chỉ đọc code. Đoạn dưới in ra số nào?

```js
let gold = 80;
const potionPrice = 25;
gold = gold - potionPrice;
gold = gold - potionPrice;
console.log(gold);
```

<details>
<summary>Xem đáp án</summary>

Mua hai bình máu, mỗi bình 25 vàng: 80 - 25 - 25 = 30.

```js
console.log(gold); // 30
```

</details>
