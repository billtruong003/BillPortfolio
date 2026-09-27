---
title: "DOM trong JavaScript"
description: "DOM là gì và cách JavaScript sửa trang web: querySelector để tìm thẻ, textContent để đổi chữ, classList để đổi giao diện, createElement để thêm phần tử mới."
section: "Trình duyệt"
order: 17
tags: ["DOM", "querySelector", "classList", "createElement"]
image: /images/docs/javascript/dom.webp
imageIdea: "Nhân vật anime cầm kính lúp soi một cái cây mà mỗi cành là một thẻ HTML ('body', 'div', 'span#hp'), tay kia đang gắn thêm một chiếc lá mới ghi 'li'."
imagePrompt: "Edit this image: the character holds a magnifying glass up to a whimsical tree whose branches are labeled with HTML tags 'body', 'div' and 'span#hp', while the other hand attaches a new glowing leaf labeled '<li>'. Keep the original art style, 16:9."
---

DOM (Document Object Model) là cách trình duyệt biểu diễn trang HTML thành các object mà JavaScript đọc và sửa được. Mỗi thẻ trong HTML là một object. Đổi object đó, trang đổi theo ngay. Đây là cách mini game của bạn cập nhật thanh máu, điểm số, danh sách kho đồ.

Các ví dụ trong trang này chạy trên trình duyệt, không chạy bằng Node (Node không có `document`).

## HTML dùng cho các ví dụ

```html
<div id="hud">
  <p>Máu: <span id="hp">100</span></p>
  <p>Điểm: <span class="score">0</span></p>
  <div id="hp-bar" class="bar"></div>
  <ul id="inventory"></ul>
</div>
<script src="game.js"></script>
```

Thẻ `<script>` đặt cuối, sau các thẻ cần tìm. Lý do có ở trang [Chạy JavaScript](/docs/javascript/chay-javascript).

## Tìm phần tử với querySelector

`document.querySelector` nhận một CSS selector và trả về phần tử **đầu tiên** khớp.

```js
const hpText = document.querySelector("#hp");       // theo id
const scoreText = document.querySelector(".score");  // theo class
const firstP = document.querySelector("p");          // theo tên thẻ
```

Dấu `#` là id, dấu `.` là class, giống hệt trong CSS. Muốn lấy **tất cả** phần tử khớp thì dùng `querySelectorAll`, kết quả lặp được bằng `for...of`:

```js
const allP = document.querySelectorAll("p");
console.log(allP.length); // 2
```

> **Lỗi hay gặp:** quên dấu `#`, viết `document.querySelector("hp")`. Lệnh này tìm thẻ tên `<hp>`, không có nên trả về `null`. Dòng tiếp theo `hpText.textContent = 80` báo `TypeError: Cannot set properties of null (setting 'textContent')`. Gặp lỗi này, kiểm tra selector trước.

## Đổi chữ với textContent

```js
let hp = 100;
const hpText = document.querySelector("#hp");

hp -= 25;
hpText.textContent = hp;
// trang hiện: Máu: 75
```

Tìm phần tử một lần, lưu vào biến, rồi dùng lại. Gọi `querySelector` mỗi lần cập nhật cũng chạy, nhưng dài và chậm hơn không cần thiết.

`textContent` luôn coi giá trị là chữ thuần. Dùng nó cho mọi thứ hiện lên từ dữ liệu game, đặc biệt là tên người chơi nhập vào. Lý do tránh `innerHTML` có ở trang [Output](/docs/javascript/output).

## Đổi giao diện với classList

Muốn thanh máu chuyển đỏ khi máu thấp, đừng sửa từng dòng CSS bằng JS. Viết sẵn class trong CSS, rồi dùng JS bật tắt class.

```html
<style>
  .bar { height: 12px; background: green; }
  .bar.low { background: red; }
</style>
```

```js
const hpBar = document.querySelector("#hp-bar");

hpBar.classList.add("low");       // thêm class
hpBar.classList.remove("low");    // bỏ class
hpBar.classList.toggle("low");    // có thì bỏ, không có thì thêm
console.log(hpBar.classList.contains("low")); // true
```

Cách này giữ phần giao diện ở CSS, phần logic ở JS. Muốn đổi màu đỏ thành cam chỉ cần sửa CSS.

`toggle` nhận thêm tham số thứ hai là điều kiện, gọn cho trường hợp bật tắt theo máu:

```js
const hp = 20;
hpBar.classList.toggle("low", hp < 30); // hp dưới 30 thì có class low
```

Độ dài thanh máu thì đổi qua `style`, vì nó là một con số thay đổi liên tục:

```js
hpBar.style.width = `${hp}%`;
```

## Tạo phần tử mới

Nhặt đồ thì kho đồ phải thêm một dòng. Tạo thẻ bằng `createElement`, điền chữ, rồi gắn vào trang bằng `append`.

```js
const inventoryList = document.querySelector("#inventory");

function addItem(itemName) {
  const li = document.createElement("li");
  li.textContent = itemName;
  li.classList.add("item");
  inventoryList.append(li);
}

addItem("Kiếm gỗ");
addItem("Bình máu");
// <ul id="inventory"><li class="item">Kiếm gỗ</li><li class="item">Bình máu</li></ul>
```

Thẻ tạo bằng `createElement` chưa hiện lên trang cho tới khi bạn `append` nó vào một phần tử đang có trên trang.

Xoá một phần tử thì gọi `remove()`:

```js
const firstItem = inventoryList.querySelector("li");
firstItem.remove();
```

Để ý dòng trên gọi `querySelector` trên `inventoryList` chứ không phải `document`. Cách này chỉ tìm bên trong danh sách kho đồ.

## Vẽ lại từ mảng

Khi dữ liệu nằm trong [mảng](/docs/javascript/mang), cách dễ quản lý là xoá hết rồi vẽ lại từ mảng mỗi khi dữ liệu đổi:

```js
const items = ["Kiếm gỗ", "Bình máu", "Chìa khóa"];

function renderInventory() {
  inventoryList.replaceChildren();
  for (const name of items) {
    const li = document.createElement("li");
    li.textContent = name;
    inventoryList.append(li);
  }
}

renderInventory();
```

`replaceChildren()` không truyền gì thì xoá sạch con của phần tử. Dữ liệu ở mảng, trang chỉ là hình ảnh của mảng đó. Muốn cập nhật khi người chơi bấm nút, xem trang [Sự kiện](/docs/javascript/su-kien).

## Bài tập

Với HTML ở đầu trang, viết hàm `setHp(value)`: ghi `value` vào `#hp`, đổi độ rộng `#hp-bar` thành `value%`, và bật class `low` khi `value` dưới 30. Gọi `setHp(20)`.

<details>
<summary>Xem đáp án</summary>

```js
const hpText = document.querySelector("#hp");
const hpBar = document.querySelector("#hp-bar");

function setHp(value) {
  hpText.textContent = value;
  hpBar.style.width = `${value}%`;
  hpBar.classList.toggle("low", value < 30);
}

setHp(20);
// trang hiện: Máu: 20, thanh máu ngắn và màu đỏ
```

</details>
