# Đánh giá ý tưởng: Hot Rod Garage Sim (tên tạm) — 30/10/2026

> **Cho:** dev solo, Unity, ngân sách ~0đ, art làm được, yếu level design, phát hành trên Steam
> **Asset dự kiến dùng:** Hot Rod Constructor: Modular Lowpoly Vintage Cars (Unity Asset Store, **$49**, bản 2.0 ra 26/10/2025, hỗ trợ Built-in/URP/HDRP).

## 1. Kết luận: **GO (25/35), với 2 điều kiện**
Sim xưởng xe theo đơn đặt hàng là thể loại **đã được chứng minh bán được trên Steam**. Car Mechanic Simulator 2021 ước tính ~839K bản, PowerWash Simulator ~1,2M bản (Raijin, Jul 2026). Car Dealer Simulator ra năm 2025 ước tính ~686K bản, 89% tích cực (vaporlens, Oct 2026). Sim không cần thiết kế level, đúng với điểm yếu của bạn.

**Điều kiện 1:** pack $49 vượt ngân sách "~0đ". Bạn cần chấp nhận khoản này. Phải mua bản chính thức, vì bản tải "miễn phí" trên các trang khác ghi rõ là **không được dùng thương mại**.
**Điều kiện 2:** phải làm cho game **khác vẻ "asset pack"**, vì đây là pack thương mại, dev khác cũng dùng (192 lượt yêu thích trên store). Cần palette, shader và đèn riêng, cùng cơ chế "đơn hàng sáng tạo" làm khác biệt.

## 2. Các kiểu game loop simulator (đã nghiên cứu)
| Kiểu loop | Game tham chiếu | Vòng lặp | Người chơi thích | Người chơi chê |
|---|---|---|---|---|
| **Job / đơn hàng** | Car Mechanic Simulator 2021 (~839K bản, ước tính Raijin) | Nhận đơn → chẩn đoán → tháo → mua phụ tùng → lắp → giao → tiền và XP → mở khóa dụng cụ | Cảm giác tháo lắp thật | Quá nhiều bước lặp, cày |
| **Mua rẻ, sửa, bán đắt** | Car Dealer Simulator (2025, ~686K bản, 89%) | Mua xe cũ → sửa và dọn → định giá → mặc cả → bán | "Buy low, fix up, sell high" rất cuốn | Cày cuối game, nhịp chậm, tutorial lỗi (vaporlens) |
| **Quy trình "đã mắt"** | PowerWash Simulator (~1,2M bản Steam, ước tính) | Xịt bẩn → thanh % sạch → "ding" khi xong một bộ phận | Thư giãn, tiến độ thấy được | Lặp lại |
| **Dọn và đánh bóng** | Car Detailing Simulator (2022, 74% tích cực, ~1.093 review) | Rửa → hút bụi → đánh bóng → giao | Ý tưởng hay | Thực thi kém hơn PowerWash |
| **Quản lý cửa hàng** | Dòng Supermarket/Shop sim | Khách đến → phục vụ → tiền → mở rộng shop, thuê nhân viên | Mở rộng shop, thấy tiến bộ | Nhân viên AI ngốc, cày |

**Đề xuất:** ghép **Job/đơn hàng** làm khung, **quy trình đã mắt** (lau, vặn ốc) làm cảm giác tay, và **custom từ module** làm phần sáng tạo. Tạm bỏ phần quản lý shop khỏi MVP.

## 3. Vòng lặp chính đề xuất
**Khách gửi đơn → nhận xe (bẩn, gỉ, hỏng) → dọn dẹp → tháo và sửa → độ, sơn theo yêu cầu → giao xe → được chấm sao theo mức khớp yêu cầu → tiền → mở khóa module, dụng cụ, mở rộng garage.**

### Các bước trong một đơn (map vào pack modular)
| Bước | Cơ chế | Kỹ thuật Unity |
|---|---|---|
| 1. Đơn hàng | Thẻ khách: ngân sách, màu, phong cách (hot rod, off-road, monster truck, sci-fi), 2–3 yêu cầu ("bánh to", "động cơ lộ ra", "màu đỏ cherry"), hạn chót | **Sinh procedural** từ danh sách module và tag, không cần viết tay từng đơn |
| 2. Dọn dẹp | Lau bụi, xịt bùn, chà gỉ bằng chuột hoặc dụng cụ. Thanh % sạch cho từng bộ phận | Vẽ mask lên RenderTexture theo UV khi raycast trúng. Shader trộn lớp bẩn theo mask. Tính % bằng cách đọc mask đã thu nhỏ qua `AsyncGPUReadback` |
| 3. Tháo / sửa | Vặn ốc theo thứ tự (giữ chuột xoay, hoặc kéo theo vòng). Gỡ module hỏng | Mỗi module có các điểm ốc (bolt socket). State machine từng bộ phận: gắn → lỏng → gỡ |
| 4. Độ / custom | Lắp module mới vào **snap point**: thân, bánh, động cơ, đèn, cánh gió, phần sci-fi | Snap theo socket trên chassis (pack có chassis đã rig, **chưa xác minh** chi tiết socket) |
| 5. Sơn | Chọn màu, xịt sơn, phủ mask, decal | Có thể dùng lại hệ thống mask của bước 2 |
| 6. Giao xe | Lái thử ra khỏi garage. Khách chấm sao theo yêu cầu, độ sạch và thời gian | So khớp tag module với yêu cầu, cộng % sạch |

### Tiến trình theo "thời đại" (dùng hết nội dung pack)
Vintage → Hot rod → Off-road → Monster truck → **Sci-fi hover car**. Mỗi tier mở khóa module, dụng cụ và loại khách mới. Đây là cách đẩy nhịp game để tránh lời chê "cày, lặp" của Car Dealer Simulator và PowerWash.

## 4. Bảng điểm
| Tiêu chí | Điểm | Lý do |
|---|---|---|
| Đơn giản | 3 | Có nhiều hệ thống nhỏ (lau, ốc, snap, sơn, đơn hàng, kinh tế), nhưng art đã có sẵn và chỉ cần một scene garage |
| Chi phí nội dung | 4 | Đơn hàng sinh procedural từ hơn 400 module (theo listing pack, **chưa xác minh** con số). Mỗi kiểu tương tác thì vẫn phải làm tay |
| Viral | 4 | Clip timelapse trước/sau, giống kiểu PowerWash, rất hợp video ngắn |
| Kiếm tiền | 4 | Sim premium bán được $9,99–14,99, ra được DLC pack xe hoặc theme. Lý do chơi lại là mở khóa tier |
| Khoảng trống | 3 | Thể loại đông (CMS, Car Dealer, Car Detailing). Twist ở đây là phong cách lowpoly, đơn độ sáng tạo theo brief và tier sci-fi |
| Thời điểm | 3 | Simulation có hit rate 4,1% năm 2025 (HowToMarketAGame, Jan 2026). Car Dealer Simulator thắng lớn năm 2025. Có **Shop Keeper Fest 25/1–1/2/2027** (Steamworks, Oct 2026) |
| Hợp với bạn | 4 | Toàn là hệ thống và shader, không có level design. Art lấy từ pack |
| **Tổng** | **25/35** | GO |

## 5. Khoảng trống có thể khai thác
1. **Cày và lặp** là lời chê chính của Car Dealer Simulator. Sửa bằng tier thời đại và đơn hàng ngày càng lạ (khách sci-fi đòi xe bay).
2. **Car Detailing Simulator thực thi kém hơn PowerWash** (74% so với PowerWash rất tích cực). Làm cảm giác lau thật "đã" là thắng được.
3. **Thị trường thiếu sim xe "sáng tạo"**: CMS mô phỏng thật, không có phần thiết kế. Đơn hàng có brief cộng chấm điểm sáng tạo là điểm khác biệt.

## 6. MVP (8–10 tuần đến lúc có demo)
- 1 garage, 3 khung xe (vintage, hot rod, off-road), khoảng 40 module
- Đủ 6 bước nhưng mỗi bước làm đơn giản. Kinh tế cơ bản và 1 tier mở khóa
- Demo: 3–5 đơn hàng, chơi khoảng 30 phút

**Chưa làm trong MVP:** thuê nhân viên, mặc cả, lái xe ngoài map, multiplayer, monster truck và sci-fi (để dành cho bản đầy đủ hoặc trailer "coming later").

## 7. Kill switch
- **Prototype tuần 1–2:** chỉ làm lau + vặn ốc + snap 1 module. Nếu người test không thấy "đã" sau 5 phút thì sửa cảm giác điều khiển (âm thanh, particle, rung) trước khi làm tiếp.
- **4 tuần sau khi mở Coming Soon:** dưới 300 wishlist thì đổi capsule hoặc trailer (**ước tính**).
- **Next Fest hoặc Shop Keeper Fest:** dưới 1.000 wishlist thì launch nhỏ. Trên 7.000 thì polish thêm (HowToMarketAGame, Feb 2026).

## 8. Giả định và điều chưa biết
- Trang store của pack **không có mô tả chi tiết**. Các con số "hơn 400 module, 60 xe dựng sẵn, có sci-fi flying car" lấy từ một listing khác, **chưa xác minh** đúng của pack này. Cần đọc tài liệu trong pack trước khi mua, hoặc hỏi tác giả.
- Chưa biết pack có sẵn socket hay snap point không, hay phải tự đặt.
- Mask lau cần UV không chồng lấn. Pack lowpoly hay dùng atlas texture với UV chồng lấn, nên có thể phải dùng lightmap UV (UV2) hoặc tự unwrap lại. **Đây là rủi ro kỹ thuật số 1.**
- Link tutorial cleaning của Minions Art không tải được qua công cụ (trang render bằng JS). Phần kỹ thuật ở mục 3 dựa trên cách làm phổ biến (vẽ mask lên RenderTexture), chưa đối chiếu với bài đó.

## Nguồn
- https://assetstore.unity.com/packages/3d/vehicles/land/hot-rod-constructor-modular-lowpoly-vintage-cars-237952
- https://raijin.gg/app/1190000/Car_Mechanic_Simulator_2021
- https://raijin.gg/app/1290000/PowerWash_Simulator
- https://vaporlens.app/app/2404880/car_dealer_simulator/stats/details
- https://steamdata.ai/en-US/game/2404880/car-dealer-simulator
- https://www.wasdland.com/game/car-detailing-simulator-1433570/
- https://howtomarketagame.com/2026/01/27/what-the-hell-happened-in-2025/
- https://partner.steamgames.com/doc/marketing/upcoming_events
- https://howtomarketagame.com/benchmarks/
- https://assetstore-fallback.unity.com/packages/templates/systems/mega-washer-271180
- https://forums.unrealengine.com/t/creating-a-core-mechanic-similar-to-powerwash-simulator/253512
