# Đánh giá ý tưởng: Gym Zombie Runner — 30/10/2026

> **Cho:** dev solo, Unity, ngân sách ~0đ, art làm được, yếu level design, phát hành trên Steam
> **Bối cảnh:** `reports/2026-10-30-insight-report-steam.md`, `reports/2026-10-30-ideas.md`

## 1. Kết luận: **PIVOT, sau khi chỉnh thì thành GO**
Theme và hook rất mạnh. Một đám dân gym đang chạy máy thì rơi xuống một thế giới bị zombie đuổi, clip 3 giây không tiếng là hiểu ngay. Nhưng **"endless runner chỉ tính điểm theo quãng đường" là dạng yếu trên Steam**: mình không tìm thấy hit endless runner nào trên PC trong 2025–2026. Vòng lặp "giữ tốc độ, phía sau có thứ đuổi" thì lại quá gần Haste. Cách sửa: **cho tốc độ thành vũ khí để cày xuyên zombie, và thêm cấu trúc run có upgrade**. Đây chính là ý tưởng Speedhorde, mặc thêm theme gym.

## 2. Vòng lặp chính (như bạn mô tả)
Dùng đà xuống dốc, trượt và bay để giữ tốc độ thật cao trên địa hình procedural uốn lượn. Đám zombie đuổi phía sau. Chậm quá thì bị bắt và thua. Đi càng xa điểm càng cao.

## 3. Bảng điểm (bản gốc)
| Tiêu chí | Điểm | Lý do |
|---|---|---|
| Đơn giản | 3 | Cần nhân vật 3D, bầy zombie 3D có animation và địa hình procedural, nhưng chỉ có một chế độ chơi. Asset store và Mixamo gánh được phần nhân vật. |
| Chi phí nội dung | 5 | Địa hình procedural, không cần thiết kế màn. Đúng thứ bạn cần. |
| Viral | 4 | Hook "máy chạy bộ tan biến, cả đám rơi xuống thế giới zombie" dễ hiểu và buồn cười. Máu bắn tung tóe nhìn rất đã mắt. |
| Kiếm tiền | 2 | Chỉ tính quãng đường, không có meta, nên người chơi Steam ít lý do chơi lại. Các endless runner nhỏ trên Steam 2025–2026 bán $0,99–2,99 và có rất ít review (Endless Robot Dash, Limitless Runner, datahumble Oct 2026). |
| Khoảng trống | 3 | Chưa thấy runner 3D nào trên Steam có zombie đuổi sau lưng, chỉ có vài game nhỏ trên itch.io (tìm kiếm Oct 2026). Nhưng cảm giác chơi sẽ bị so trực tiếp với Haste (93% tích cực, 9.155 review; Steam Oct 2026). |
| Thời điểm | 2 | Không tìm thấy endless runner nào bùng nổ trên Steam trong 2025–2026. Hit gần nhất trong mảng runner là BIT.TRIP RERUNNER, cũng chỉ 404 review (raijin, Jul 2026). |
| Hợp với bạn | 4 | Toàn bộ là hệ thống, vật lý và procedural, đúng mạnh về code. Art "đẹp vừa phải" là đủ. |
| **Tổng** | **23/35** | Thuộc khoảng PIVOT |

## 4. Game so sánh
| Game | Studio | Ra mắt | Tín hiệu | Mô hình | Than phiền chính |
|---|---|---|---|---|---|
| HASTE: Broken Worlds | Landfall | 4/2025 | 93% tích cực, 9.155 review. Raijin ước tính ~332K bản (Jul 2026) | Premium $19,99 | **Lặp lại**: ít biome, các thế giới trông giống nhau sau ~10 giờ, địa hình procedural có lúc khó đọc và độ khó tăng đột ngột thiếu công bằng (vaporlens, Backloggd, OpenCritic) |
| Megabonk | vedinad (solo) | 9/2025 | 1 triệu+ bản trong ~2 tuần | Premium $9,99 | Cân bằng game (chưa xác minh) |
| BIT.TRIP RERUNNER | Choice Provisions | 2025–26 | 97% tích cực, 404 review | Premium | Chưa xác minh |
| Các endless runner nhỏ (Endless Robot Dash, Limitless Runner) | Dev nhỏ | 2025 | Gần như không có review | $0,99–2,99 | Giá trị chơi lại thấp |
| Zombie Runner / Run From the Zombies | itch.io | n/a | Game jam, miễn phí | Miễn phí | Không có trên Steam |

## 5. Khoảng trống có thể khai thác
1. **Haste bị chê lặp lại vì ít biome.** Bạn có sẵn một cơ chế chuyển biome rất hợp lý: **thế giới lại "dissolve"** sau mỗi N mét, mỗi lần sang một biome hoặc luật chơi mới. Đây là cách biến cái hook mở đầu thành một hệ thống chơi.
2. **Địa hình procedural khó đọc.** Làm đường đua dễ đọc: chỉ báo ramp, cảnh báo vực, đặt camera nhìn trước. Mỗi seed cho bot chạy thử để kiểm tra trước.
3. **Thị trường không có runner nào có horde đuổi kiểu bullet heaven.** Tốc độ và horde là hai thứ đang bán chạy nhưng chưa ai ghép lại.

## 6. Pivot: những thay đổi đề xuất
**Giữ nguyên:** dân gym, máy chạy bộ dissolve, bị zombie đuổi, máu bắn, địa hình uốn lượn, các trạng thái lao trên trời, bay và trượt.

**Thay đổi:**
- **Tốc độ là vũ khí.** Phía sau là bức tường zombie đuổi theo. Phía trước cũng có zombie chặn đường. Đủ nhanh thì đâm xuyên và máu bắn tung, chậm thì bị bám vào người và giảm tốc. Đáp từ trên cao xuống tạo sóng nổ.
- **Có run và upgrade theo theme gym.** Ví dụ: protein shake, pre-workout, giày chạy, "leg day" tăng lực đạp, "cardio" tăng thể lực. Chọn upgrade khi lên cấp như bullet heaven. Mục tiêu sống sót qua N lần dissolve, có boss ở cuối, và vẫn có chế độ endless tính quãng đường.
- **Meta-progression:** mở khóa nhân vật gym nam nữ, mỗi người một kiểu chạy (sprinter, powerlifter, yoga girl…).
- **Tùy chọn bật/tắt máu (gore toggle)** để streamer dễ chơi.

**Bản pivot chấm lại:** Đơn giản 3 · Content 5 · Viral 5 · Kiếm tiền 3 · Khoảng trống 4 · Thời điểm 4 · Hợp bạn 4 = **28/35, GO**
- Viral tăng vì có clip "cày xuyên biển zombie".
- Kiếm tiền tăng vì có upgrade, meta và mức giá $5,99–7,99.
- Thời điểm tăng vì dựa vào bullet heaven, niche có hit rate 13,1% (Steam Page Analyzer, Sep 2026).

## 7. Kill switch
- **Prototype tuần 1:** chỉ cần chạy, trượt, bay và đâm xuyên zombie. Tự chơi và cho 3 người bạn chơi thử. Nếu không ai tự muốn chơi lại thì đổi cảm giác điều khiển trước khi làm tiếp.
- **4 tuần sau khi mở trang Coming Soon:** dưới 300 wishlist thì đổi capsule hoặc trailer (**ước tính**).
- **Next Fest:** dưới 1.000 wishlist thì launch nhỏ. Từ 1.000 đến 7.000 thì launch theo kế hoạch. Trên 7.000 thì polish thêm (HowToMarketAGame, Feb 2026).
- **Demo → wishlist:** dưới 10% là demo có vấn đề, median là 19,3% (HowToMarketAGame, Jun 2026).

## 8. Giả định và điều chưa biết
- Mới tìm sơ bộ, chưa duyệt hết tag Endless Runner kết hợp Zombie trên Steam. Có thể đã có đối thủ nhỏ.
- Gore: phải khai mature content trong Steam content survey. Chi tiết yêu cầu **chưa xác minh**.
- Hiệu năng: hàng trăm zombie cộng vật lý tốc độ cao cần GPU instancing hoặc animation baking (vertex animation texture) và pooling ngay từ đầu.
- Theme gym và zombie đang được giả định là đủ khác Haste về cảm nhận. Cần đưa clip lên Reddit hoặc TikTok để xem phản ứng thật.

## Nguồn
- https://store.steampowered.com/app/1796470/HASTE_Broken_Worlds/
- https://raijin.gg/app/1796470/Haste
- https://vaporlens.app/app/1796470/haste
- https://opencritic.com/game/18401/haste/reviews
- https://backloggd.com/u/DevUlv/reviews/liked
- https://raijin.gg/app/2222540/BITTRIP_RERUNNER
- https://datahumble.com/endless-robot-dash-3727050
- https://datahumble.com/limitless-runner-3843330
- https://shurmax.itch.io/zombie-runner
- https://nanoflite.itch.io/run-from-the-zombies/purchase
- https://www.steampageanalyzer.com/niches
- https://howtomarketagame.com/benchmarks/
