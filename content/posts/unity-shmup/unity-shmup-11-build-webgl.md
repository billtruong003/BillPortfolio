---
title: "Shmup #11: Từ project đến đường link chơi được — build và phát hành Web"
date: "2026-09-24"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-11-build-webgl
series: "shmup"
order: 11
excerpt: "Đi qua các cổng kiểm tra Editor, build local và hosting; hiểu file đầu ra, compression và phép đo trước khi chia sẻ."
coverImage: "/images/posts/unity-shmup/11/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Project hoàn chỉnh</span><span>Build Web</span><span>HTTP local</span><span>Hosting</span><span>Người khác chơi</span></div>

## Năm cửa ải

Từ project trong Editor tới một đường link người khác bấm vào chơi được có năm cửa ải. Qua được cửa nào thì chốt cửa đó, vì nếu để lỗi từ Editor lọt lên bản Web thì bạn phải dò thêm hai lớp nữa là trình duyệt và server.

Bài 10 đã để lại scene cuối `SEU_10_Juice`. Bài này đưa đúng scene đó lên trình duyệt, không cần copy thành scene 11 chỉ để build. Lưu scene và toàn bộ asset trước khi bắt đầu.

## Cửa 1: bản Editor đã đủ một vòng chơi

Chạy thử từ 0 điểm tới Game Over rồi Restart. Kiểm tra điều khiển, âm thanh, pickup, và Console không còn dòng đỏ nào. Ghi lại phiên bản Unity cùng cấu hình package đang dùng.

Đây là cửa đáng nghiêm khắc nhất, vì mỗi cửa sau thêm một lớp có thể hỏng. Một bug gameplay phát hiện ở Editor thì bạn dò trong Editor. Cũng bug đó phát hiện trên bản Web thì bạn phải loại trừ thêm trình duyệt và server trước khi quay về đúng chỗ ban đầu.

Bản game này chơi bằng bàn phím và gamepad. Khung dọc không kèm điều khiển cảm ứng, nên khi chia sẻ link hãy ghi rõ điều đó ngay cạnh game.

## Hiểu đường đi của bản build

Unity chuyển code và dữ liệu thành một nhóm file mà trình duyệt tải qua HTTP. `.wasm` là phần thực thi WebAssembly, `.data` chứa dữ liệu đóng gói, còn framework với loader lo phần khởi tạo.

```text
ShootEmUp/
  index.html
  TemplateData/
  Build/
    ShootEmUp.loader.js
    ShootEmUp.framework.js
    ShootEmUp.wasm
    ShootEmUp.data
```

Tên file cụ thể phụ thuộc cấu hình build, nên luôn đọc tên thật trong thư mục và trong `index.html` đã sinh ra. Đổi tên một file riêng lẻ trong khi loader vẫn trỏ tên cũ là cách chắc chắn làm hỏng bản build.

## Cửa 2: cấu hình để chạy được trước

Unity Hub cần có Web Build Support cho Editor này. Vào **File → Build Profiles**, chọn Web và Switch Platform. Trong **Scene List**, chỉ bật `SEU_10_Juice` và bỏ hết các scene học của những bài trước.

Bước Scene List nhỏ mà sai là hỏng cả bản build, vì Unity đóng gói scene đầu tiên trong danh sách. Còn bật cả mười hai scene thì bản build phình ra vì mang theo mọi asset mà các scene cũ tham chiếu. Lưu ý cửa sổ Build Profiles của Unity 6 khác với Build Settings của các bản cũ, nên hướng dẫn cũ trên mạng chỉ tới menu không còn tồn tại.

| Setting | Cấu hình khởi đầu | Mục đích |
|---|---|---|
| Product Name | ShootEmUp | Tên sản phẩm |
| Default Canvas | 540 × 960 | Khung 9:16 |
| Compression Format | Disabled cho bản kiểm tra đầu | Bớt một biến phụ thuộc server |
| Data Caching | Bật | Cho phép cache dữ liệu khi trình duyệt hỗ trợ |
| Managed Stripping | Giữ mức mặc định | Có bản đúng trước, tối ưu sau |
| Exceptions | Giữ hỗ trợ lỗi | Đọc được lỗi runtime khi chẩn đoán |
| Development Build | Bật khi chẩn đoán, tắt khi đo | Phân biệt hai mục đích |

![Player Settings cho nền tảng Web](/images/posts/unity-shmup/11/build_01_player-settings-webgl.webp)

Dòng Compression Format đáng nhấn mạnh. Đặt Disabled cho lần build đầu không phải vì nén là xấu, mà vì nén đòi hỏi server trả đúng header; gộp hai thứ chưa kiểm chứng vào một lần thử thì lúc hỏng bạn không biết tại đâu. Bật nén sau khi đã có một bản chạy được.

Build ra `Builds/WebGL/ShootEmUp`, đặt ngoài thư mục Assets. Đừng sửa hay di chuyển file nào trong lúc build đang chạy.

Một điểm về Run In Background: nó không bảo đảm tab nền chạy đều, vì trình duyệt có quyền hạn chế tiến trình của tab không hiển thị. Đừng thiết kế gameplay dựa trên giả định game vẫn chạy chính xác khi người chơi chuyển tab.

## Cửa 3: mở bằng HTTP, không mở file trực tiếp

Nếu có Node.js, chạy từ thư mục project:

```bash
npx serve Builds/WebGL/ShootEmUp
```

Mở địa chỉ local mà server in ra. Mở thẳng `index.html` bằng `file://` không tương đương hosting và thường thất bại khi tải WebAssembly, vì trình duyệt áp chính sách bảo mật khác hẳn cho giao thức đó.

Mở DevTools, sang tab Network và Console. Bốn file loader, framework, wasm và data phải tải về với status 200 và đúng kiểu nội dung. Chỗ bẫy là một server cấu hình sai vẫn trả 200 kèm một trang HTML báo lỗi thay vì file thật, nên hãy nhìn cả cột Type và kích thước chứ không chỉ nhìn con số 200.

Khi game vào tới màn hình, click vào canvas rồi mới thử điều khiển. Âm thanh có thể im cho tới lần tương tác đầu tiên do [chính sách autoplay của trình duyệt mà Unity mô tả](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-audio.html) — đó là hành vi của trình duyệt, không phải lỗi của bạn.

Thử cả lần tải mới lẫn lần reload. Đi tới bốn mép màn hình, nhặt buff, chơi tới Game Over rồi Restart. Thanh loading chạy tới 100% chưa chứng minh được gì ngoài việc file tải xong.

## Cửa 4: hosting và header

Upload nguyên thư mục build lên static host bạn dùng, giữ đúng cấu trúc thư mục tương đối. Thử URL `index.html` trực tiếp trước khi nhúng nó vào một trang khác. Dùng HTTPS cho bản chia sẻ.

Khi bật gzip hoặc Brotli ở bản release, server phải trả header phù hợp chứ không chỉ là chuyện đổi đuôi file:

| Dạng | Content-Encoding | Content-Type |
|---|---|---|
| .wasm không nén | Không gắn gzip/br | application/wasm |
| .wasm.gz | gzip | application/wasm |
| .wasm.br | br | application/wasm |

Không kiểm soát được header của host thì dùng Decompression Fallback: Unity kèm phần giải nén phía JavaScript, đổi lại thời gian khởi động chậm hơn. Đọc [hướng dẫn triển khai Web của Unity](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-deploying.html) trước khi cấu hình một host cụ thể.

Nếu bạn nhúng game ở một origin nhưng tải build từ origin khác thì phải xử lý thêm CORS. Gặp lỗi 404 thì tìm đúng đường dẫn sai, đừng bật hàng loạt header cho tới khi may mắn hết lỗi.

## Cửa 5: đo rồi mới gọi là tối ưu

| Phép đo | Cách ghi |
|---|---|
| Dung lượng output | Tổng byte các file trên ổ đĩa |
| Dữ liệu truyền | Tab Network, cold cache, cột Transfer Size |
| Thời gian vào game | Từ lúc mở URL tới lúc nhận được điều khiển |
| Độ đúng | Chạy lại cùng kịch bản sau mỗi thay đổi |

Quy tắc là thay đúng một yếu tố mỗi lần: hoặc stripping, hoặc compression, hoặc texture. Stripping mạnh hơn giảm được kích thước code nhưng buộc phải kiểm tra lại các đường khởi tạo và những chỗ dùng reflection.

Mọi con số phải đi kèm điều kiện đo: trình duyệt nào, thiết bị nào, mạng ra sao, cache nóng hay nguội. Bản warm-cache tải nhanh hơn cold-cache khá nhiều, nên một con số đứng trơ không so sánh được với gì cả. Và đừng lấy dung lượng build trên máy mình làm mục tiêu bắt buộc cho project khác, vì phần lớn dung lượng nằm ở asset chứ không ở code.

<details><summary>Case study: nhúng vào mục Arcade của trang này</summary>

Trang này giữ một registry ở `public/webgl-games/registry.json`. Mỗi entry mô tả URL thư mục Build, `buildName`, kiểu compression và tỉ lệ khung hình. Component `UnityPlayer` dùng entry đó để dựng URL cho loader, framework, wasm và data. Đây là cách tích hợp riêng của website, không phải bước bắt buộc của Unity.

Nếu host build trên CDN hoặc R2, upload trước, mở thử từng URL thật, rồi mới cập nhật registry theo tên file thực tế.

</details>

## Checklist trước khi gửi link

Một người khác mở URL trong cửa sổ mới, hiểu cách điều khiển, và chơi trọn được một ván. Không thiếu file nào, có âm thanh sau tương tác đầu tiên, khung đúng tỉ lệ, restart không nhân đôi event, và Console không có lỗi gameplay. Ghi rõ giới hạn bàn phím với gamepad ngay cạnh game.

Tới đây bạn đã nối xong một chuỗi hoàn chỉnh: scene → input → đạn → pool → va chạm → data → wave → ván chơi → pickup → phản hồi → bản Web. Muốn đi tiếp thì đạn địch, drone bay theo, hay màn hình pause đều là bài tập tốt. Mỗi thứ đó cần một bảng luật và một bài thử riêng, đúng như cách mười một chặng vừa rồi đã làm.

## Mã nguồn chặng này

[Tải script bài 11](/downloads/shmup/lesson-11.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.
