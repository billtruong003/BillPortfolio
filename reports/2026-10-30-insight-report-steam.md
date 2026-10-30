# Báo cáo xu hướng Steam indie — 30/10/2026

> **Cho:** dev solo, Unity · **Ràng buộc:** ngân sách ~0đ, muốn ra game đầu tiên trong < 3 tháng, art làm được, **yếu level design**
> **Cửa sổ dữ liệu:** 2025 → 10/2026. Số liệu từ tracker bên thứ ba là ước tính và các nguồn có thể lệch nhau. "**Ước tính**" = mình tự tính.

## 0. Kết luận (TL;DR)

- **Nên làm: bullet heaven / survivors-like có một cơ chế twist** (kiểu BALL x PIT ghép brick-breaker, Megabonk làm 3D). Đây là niche có hit rate cao nhất được đo (13,1%) (Steam Page Analyzer, Sep 2026). Nội dung đến từ hệ thống, procedural và replay, nên **gần như không cần level design**. Đúng điểm mạnh code của bạn.
- **Phương án an toàn, scope nhỏ hơn: idle / desktop companion.** Làm nhanh nhất, nhưng thị trường đang ngập: 1.566 game ra trong 2026, median chỉ 22 review (Steam Page Analyzer, Sep 2026). Hợp để học quy trình Steam, đừng kỳ vọng thắng lớn.
- **Tránh** precision platformer (hit rate 1,4%), metroidvania, puzzle nhiều màn thiết kế tay, horror, narrative. Tất cả đều sống nhờ level hoặc nội dung làm tay. Tránh luôn co-op "friendslop": phải viết netcode và trông vào may mắn viral.
- **Steam rất đông:** 21.388 game đã ra trong 2026 tính đến 16/10, và 11.633 game có dưới 10 review (3DNews dẫn SteamDB, Oct 2026). Một ý tưởng tốt nhưng không có wishlist thì cũng chìm. Marketing phải chạy song song với code ngay từ tuần đầu.
- **Nguồn traffic miễn phí lớn nhất là Steam Next Fest tháng 2/2027 (22/2 – 1/3).** Hạn đăng ký 10/1, nộp demo 18/1 (Steamworks, Oct 2026). Muốn dùng nó thì game chỉ ra được **sau 1/3**, tức khoảng 4 tháng rưỡi thay vì 3. Mình khuyên chấp nhận đánh đổi này: lấy **demo xong trong 2,5 tháng** làm mục tiêu 3 tháng.
- **Dev ở Việt Nam cần biết:** Mỹ và Việt Nam chưa có hiệp định thuế có hiệu lực, nên Steam khấu trừ **30%** thuế (IRS / Steamworks Tax FAQ, Oct 2026). Tiền về qua chuyển khoản SWIFT bằng USD. Bước xác minh thuế có thể mất tới 30 ngày, nên **mở tài khoản Steamworks ngay tuần này**.

## 1. Thể loại: hiệu quả trên mỗi game phát hành

### 1.1 Toàn cảnh
| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| Số game ra năm 2025 | ~19–21 nghìn, tùy tracker (19.008 / 20.282 / 21.248) | GamingOnLinux Dec 2025; HowToMarketAGame Jan 2026; 3DNews Oct 2026 |
| Số game ra 2026 (đến 16/10) | 21.388, khoảng 66 game/ngày | 3DNews dẫn SteamDB, Oct 2026 |
| Tỉ lệ game đạt 1.000+ review năm 2025 | 2,99% (608 / 20.282) | HowToMarketAGame, Jan 2026 |

### 1.2 Hit rate theo niche
Steam Page Analyzer, Sep 2026, đo trên game ra từ 2024 đến giữa 2025. Mức trung bình toàn Steam là 4,2%.

| Niche | Hit rate | Median review | Game ra 2026 | Trang chưa phát hành | Hợp với bạn? |
|---|---|---|---|---|---|
| Bullet Heaven | **13,1%** | 75 | 329 (+406%) | 753 | ✅ Rất hợp |
| Roguelike Deckbuilder | 7,8% | 52 | 316 | 905 | ✅ Hợp nhưng cân bằng bộ bài tốn công |
| Metroidvania | 6,2% | 22 | n/a | n/a | ❌ Map làm tay |
| Idler | 5,6% | 22 | 1.566 | 2.625 | ⚠️ Scope nhỏ nhưng quá đông |
| Psychological Horror | 5,8% | 24 | n/a (2025: 2.099) | n/a | ❌ Phụ thuộc không khí và nhịp level |
| Precision Platformer | 1,4% | < 10 | n/a | n/a | ❌ Tránh |

Lưu ý: tag Bullet Heaven chỉ mới thành tag chính thức từ 5/2026. Vì vậy một phần mức tăng +406% là do dev gắn lại tag cho game cũ (Steam Page Analyzer, Sep 2026).

### 1.3 Game nhỏ thắng lớn gần đây
| Game | Vòng lặp chính | Team | Kết quả | Nguồn |
|---|---|---|---|---|
| Megabonk | Survivors-like 3D, map ngẫu nhiên | Solo | 1 triệu+ bản trong ~2 tuần; 58.735 review, 93% tích cực, $9,99 | Game World Observer Oct 2025; Steam Oct 2026 |
| BALL x PIT | Brick-breaker roguelite: bắn bóng, ghép bóng, xây base | Nhỏ | 2 triệu bản trong ~10 tháng; 95% tích cực, $14,99 | WN Hub Aug 2026; Steam |
| PEAK | Leo núi co-op dùng vật lý, map đổi mỗi ngày | Gốc từ game jam | 4,5 triệu bản trong chưa đầy 1 tháng, $7,99 | 80.lv Jul 2025 |
| Rusty's Retirement | Idle farm nằm ở đáy màn hình | Solo | ~330K bản, $7, ra mắt với 140K wishlist | GameDiscoverCo Aug 2024 (cũ) |
| Bongo Cat | Clicker desktop | Nhỏ | 170–180K CCU (một nửa là bot) nhưng chỉ ~$2–4K/tháng | WN Hub/Eurogamer Jun 2025 |

**Bài học:** game thắng lớn đều có **một cơ chế cốt lõi thật sự mới** trong một thể loại quen thuộc. Bongo Cat cho thấy lượng người chơi đông không đồng nghĩa với doanh thu.

### 1.4 Vòng đời từng cơ chế
| Cơ chế | Giai đoạn | Bằng chứng |
|---|---|---|
| Bullet heaven / survivors-like | **Đang lên lại, sắp bão hòa** | Hit rate vẫn cao nhất nhưng có 753 trang đang chờ ra. Zukowski gọi đây là thể loại "đang già" (HowToMarketAGame, May 2026). Bắt buộc phải có twist. |
| Idle / desktop companion | Đỉnh, nhiều clone | 1.566 game ra trong 2026, median 22 review |
| Roguelike deckbuilder | Trưởng thành, ổn định | Hit rate 7,8%; Slay the Spire 2 đã ra mắt |
| Co-op friendslop | Đỉnh | Nhiều hit hồi 2/2026, nhưng cần netcode và cần viral (GameDiscoverCo, Mar 2026) |
| Horror | Bão hòa | ~2.100 game psychological horror năm 2025 |

## 2. Cơ hội cho bạn

1. **Bullet heaven + một cơ chế ghép từ thể loại khác** (bắn bóng vật lý, bài, tower defense, idle, puzzle hệ thống…). Thời điểm: trước khi 753 trang đang chờ ra hết. Bạn thắng nhờ code giỏi, vì toàn bộ nội dung là hệ thống: arena procedural, upgrade pool, synergy. Art "đẹp vừa phải" là đủ cho thể loại này. Gắn tag cho chuẩn để Valve tự mời vào themed fest.
2. **Idle / desktop companion có hook rõ ràng** làm game học việc. Scope 4–6 tuần. Có **Desktop Companion Fest 14–18/1/2027** (Steamworks, Oct 2026): game chưa ra vẫn được vào mục "upcoming", nên đây là một mốc lộ diện miễn phí.
3. **Auto-battler / roguelike deckbuilder nhỏ**, chỉ khi bạn chấp nhận dành phần lớn thời gian cho việc cân bằng.

Bước tiếp theo: dùng skill `brainstorming-game-ideas` để ra 5–10 idea card cụ thể cho hướng 1.

## 3. Ra mắt trên Steam với 0đ

### 3.1 Điều khoản hiện tại (đã kiểm tra trên Steamworks, 10/2026)
| Mục | Hiện tại | Nguồn |
|---|---|---|
| Phí Steam Direct | $100/app, được hoàn khi đạt $1.000 doanh thu điều chỉnh | Steamworks appfee |
| Thời gian chờ từ lúc trả phí đến khi được ra game | **21 ngày** | Steamworks onboarding |
| Trang Coming Soon | Phải public **≥ 2 tuần** trước khi ra; nộp review trước ≥ 7 ngày làm việc | Steamworks coming_soon |
| Review store page / build | 3–5 ngày làm việc; nên dự trù 7 | Steamworks review_process |
| Xác minh thuế | Có thể tới 30 ngày | Steamworks onboarding |
| Chia doanh thu | Valve giữ 30% (đến $10M) | TechCrunch Dec 2018. **Chưa xác minh trên trang Steamworks hiện tại** |
| Thanh toán | Hàng tháng, SWIFT bằng USD, tài khoản đứng tên bạn; có thể giữ tới khi đủ $100 | Steamworks payments FAQ |
| Thuế khấu trừ (VN) | 30%, do chưa có hiệp định thuế Mỹ–Việt có hiệu lực | IRS treaty list; Steamworks Tax FAQ |
| Giá | Tối thiểu $0,99. Từ $4,99 trở lên mới được giảm tới 90%. Không đổi giá hay giảm giá trong 30 ngày đầu, trừ launch discount | Steamworks pricing |
| VND | Đã hỗ trợ, bước giá 50.000đ | Steamworks currencies |

### 3.2 Mốc sự kiện (90–180 ngày tới)
| Ngày | Sự kiện | Cách dùng |
|---|---|---|
| 16–23/11/2026 | Auto-Battler RPG Fest | Không kịp cho game của bạn |
| 17/12/2026 – 4/1/2027 | Winter Sale | Đăng devlog, kéo wishlist |
| **10/1/2027** | **Hạn đăng ký Next Fest tháng 2** | Lúc này store page và trailer phải public |
| 14–18/1/2027 | Desktop Companion Fest | Nếu làm idle/desktop |
| **18/1/2027** | Nộp demo để kịp Press Preview (11/2) | |
| 25/1 – 1/2/2027 | Shop Keeper Fest | Nếu game có yếu tố shop |
| **22/2 – 1/3/2027** | **Steam Next Fest** | Nguồn wishlist miễn phí lớn nhất |
| 18–25/3/2027 | Spring Sale | |
| 14–21/6/2027 | Next Fest tháng 6 (hạn đăng ký 25/4) | Phương án dự phòng |

### 3.3 Benchmark wishlist
- Wishlist trước launch theo Zukowski: Bronze 5.000, Silver 8.000, Gold 50.000, Diamond 90.000 (HowToMarketAGame benchmarks, Jun 2026).
- Next Fest tháng 2/2026 có hơn 3.500 demo. Game ở mức median chỉ được **~200 wishlist**, top 5% được ~7.000. Game nào đã có đà từ trước thì mới thắng (GameDiscoverCo, Mar 2026).
- Tỉ lệ người chơi demo bấm wishlist: median 19,3% (HowToMarketAGame, Jun 2026).
- Doanh số tuần đầu ≈ 0,10–0,20 × số wishlist (GameDiscoverCo qua gamedevreports, Nov 2025, với game 25k+ wishlist; Zukowski dùng dữ liệu cũ năm 2020).

**Ước tính:** 5.000 wishlist × 0,15–0,20 ≈ 750–1.000 bản tuần đầu. Ở giá $4,99, doanh thu thô ~$3,7–5K. Valve lấy 30% còn ~$2,6–3,5K. Khấu trừ thuế 30% còn ~**$1,8–2,4K**, chưa trừ refund, VAT và việc giá vùng thấp hơn.

### 3.4 Lộ trình đề xuất (Phương án A: có Next Fest)
| Thời gian | Việc |
|---|---|
| Tuần 1 (đến 8/11) | Trả $100, làm tax interview, xác minh danh tính và ngân hàng. Chốt concept. Làm prototype vòng lặp chính trong 1 tuần. |
| Tuần 2–4 | Vertical slice. **Mở trang Coming Soon cùng trailer gameplay trước cuối 11/2026.** |
| Tháng 12 | Demo (15–30 phút). Mỗi tuần đăng 3–5 clip ngắn lên TikTok/Shorts/Reels, hook trong 3 giây đầu. Đăng Reddit (r/IndieDev, r/roguelites, subreddit của thể loại). |
| Trước 10/1 | Đăng ký Next Fest. Có thể mở Steam Playtest để kéo người vào store page. |
| 18/1 | Nộp demo. Gửi key/demo cho streamer nhỏ qua Keymailer (miễn phí cho creator). |
| 22/2 – 1/3 | Next Fest. Livestream demo trên trang Steam. |
| Đầu 3/2027 | Launch, giá $4,99–7,99, launch discount 10–20%. |

**Phương án B (giữ đúng 3 tháng):** bỏ Next Fest, launch cuối 1 hoặc đầu 2/2027 (đã qua 2 tuần Coming Soon và 21 ngày chờ), dựa vào một themed fest. Nhanh hơn nhưng mất nguồn traffic lớn nhất.

**Tránh:** woovit.com hiện đang hiển thị trang cờ bạc, domain có vẻ đã mất. Không dùng.

### 3.5 Kill switch
| Mốc | Kill / bỏ hướng | Iterate | Scale / đầu tư thêm | Nguồn ngưỡng |
|---|---|---|---|---|
| Prototype tuần 1 | Tự chơi 10 lần không thấy muốn chơi lại → đổi twist | Có lúc vui → tiếp | | Tự đánh giá |
| 4 tuần sau khi mở Coming Soon | < 300 wishlist → đổi capsule hoặc trailer, cân nhắc đổi hook | 300–1.000 | > 1.000 → giữ hướng | **Ước tính**, suy ra từ mốc Bronze 5.000 trước launch |
| Next Fest | < 1.000 wishlist kiếm thêm (Bronze) → launch nhỏ, giá thấp, chuyển sang game 2 | 1.000–7.000 (Silver) → launch như kế hoạch | > 7.000 (Gold+) → cân nhắc hoãn launch 1–2 tháng để polish | HowToMarketAGame, Feb 2026 |
| Tỉ lệ demo → wishlist | < 10% → demo có vấn đề | ~19% (median) | > 25% | HowToMarketAGame, Jun 2026 |

## 4. Việc tuần này
- [ ] Đăng ký Steamworks, trả $100, làm tax interview (W-8BEN) và xác minh ngân hàng nhận SWIFT bằng USD
- [ ] Chọn giữa Phương án A (Next Fest, launch tháng 3) và B (đúng 3 tháng)
- [ ] Chạy `brainstorming-game-ideas` để ra 5–10 ý tưởng bullet heaven + twist, sau đó `evaluating-game-ideas` để chọn 1
- [ ] Đọc review 1–3 sao của Megabonk và BALL x PIT để tìm khoảng trống
- [ ] Dựng prototype vòng lặp chính trong Unity, giới hạn 5–7 ngày
- [ ] Mở tài khoản TikTok/YouTube cho game, quay clip prototype đầu tiên

## 5. Watchlist kỳ sau
- Số trang Bullet Heaven chưa ra (hiện 753): nếu tăng nhanh nghĩa là bão hòa sớm hơn
- Kết quả wishlist của Next Fest tháng 2/2027 theo GameDiscoverCo
- Chia doanh thu Steam: xác minh trên trang Steamworks hiện tại
- Trạng thái hiệp định thuế Mỹ–Việt
- Quỹ hoặc publisher Đông Nam Á nhận pitch từ dev solo: hiện chưa tìm thấy chương trình nào đang mở

## Nguồn
- https://howtomarketagame.com/2026/01/27/what-the-hell-happened-in-2025/
- https://www.steampageanalyzer.com/niches
- https://newsletter.gamediscover.co/p/which-genre-should-your-next-pc-game (2021, cũ)
- https://newsletter.gamediscover.co/p/february-2026s-top-selling-new-steam
- https://store.steampowered.com/app/3405340/Megabonk/
- https://gameworldobserver.com/2025/10/03/megabonk-is-a-new-indie-hit-on-steam-the-games-sales-have-surpassed-one-million-copies
- https://store.steampowered.com/app/2062430/BALL_x_PIT/
- https://wnhub.io/news/investment/item-51689
- https://store.steampowered.com/app/3527290/PEAK/
- https://80.lv/articles/climbing-sim-peak-has-sold-4-5-million-copies-in-less-than-a-month
- https://newsletter.gamediscover.co/p/how-rustys-retirement-idle-farmed
- https://wnhub.io/news/stores-and-publishing/item-48117
- https://howtomarketagame.com/2026/05/19/
- https://www.gamingonlinux.com/2025/12/over-19000-games-have-released-on-steam-in-2025-with-nearly-half-seeing-fewer-than-10-reviews
- https://3dnews.ru/1150062
- https://partner.steamgames.com/doc/gettingstarted/appfee
- https://partner.steamgames.com/doc/gettingstarted/onboarding
- https://partner.steamgames.com/doc/store/coming_soon
- https://partner.steamgames.com/doc/store/review_process
- https://techcrunch.com/2018/12/03/valve-changes-revenue-sharing-tiers-on-steam/
- https://partner.steamgames.com/doc/finance/payments_salesreporting/faq
- https://partner.steamgames.com/doc/store/pricing
- https://partner.steamgames.com/doc/store/pricing/currencies
- https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/feb_2027
- https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/june_2027
- https://partner.steamgames.com/doc/marketing/upcoming_events
- https://partner.steamgames.com/doc/marketing/upcoming_events/themed_sales
- https://partner.steamgames.com/doc/features/playtest
- https://partner.steamgames.com/doc/finance/taxfaq
- https://howtomarketagame.com/benchmarks/
- https://gamedevreports.substack.com/p/gamediscoverco-the-state-of-steam
- https://newsletter.gamediscover.co/p/who-won-february-2026s-steam-next
- https://howtomarketagame.com/2026/06/30/nobody-plays-demos-and-that-is-ok/
- https://www.keymailer.co/pricing
- https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z
