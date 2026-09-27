# Kế hoạch biên tập series Platformer

Nguồn: 18 journal trong `docs/platformer-journal/` (26.000 từ), code và scene trong `D:/Projects/Tutorial/Assets/_Platformer`, build WebGL đang chạy ở `/arcade`.

Khác với series shmup, ở đây **chưa có bài nào được viết**. Đây là kế hoạch dựng bài từ journal, không phải đánh giá bài cũ.

## Vật liệu đang có

Mạnh hơn shmup ở ba điểm:

- **Mọi con số đều đo được, không phải mò.** Nhảy cao 5.22 u so với thiết kế 5.5 (lệch đúng nửa step Euler). Địch quay đầu ở x = 9.02 so với mép bệ 9.0. Parallax đo ra 0.250 so với đặt 0.25. Không có chỗ nào phải viết "khoảng chừng".
- **Vấp được ghi ngay lúc vấp**, kèm triệu chứng và cách chẩn đoán. Phần lớn là loại bug **không báo lỗi**: gem biến mất mà bộ đếm đứng im, boss trúng đòn xong giết luôn người vừa đánh, cả màn chơi không thể thắng vì một ô trong bảng va chạm.
- **Có hai bài học đắt mà tutorial thường không có**: chặng 15–16 chứng minh rằng một series có thể "sạch về hình học" mà vẫn không chơi được, và chặng 17 là một lần làm bằng shader rồi vứt đi làm lại bằng sprite.

Rủi ro cần xử lý trước khi viết:

- **Thứ tự làm ≠ thứ tự dạy.** Journal 00 cắt 60 sprite sheet chỉ để đo tỉ lệ; bài 00 chỉ cần một sheet. Journal 01 sơn tay rồi mới làm RuleTile; bài 01 phải dạy RuleTile ngay.
- **Chặng 15–17 sửa ngược lại chặng 00–14.** Pivot sai từ chặng 00, layer sai từ chặng 09, collider boss sai từ chặng 12. Không được dạy sai rồi hẹn "bài sau sửa" — đó đúng là lỗi đã phê bình ở series shmup.
- **Ảnh chưa đủ.** Mỗi journal có mục "Ảnh cần chụp", tổng khoảng 90 ảnh, hiện mới có ~15. Và mọi ảnh chụp từ chặng 10–13 đều đang có **địch lún chân 8 px** do lỗi pivot — phải chụp lại toàn bộ.
- **Công cụ lab không thuộc về bài.** `MotionRecorder`, `PatrolTracker`, `ChargerTracker`, `JuiceProbe`, `Playtest`, `ReachAudit` là cách tác giả đo, không phải bước người đọc phải làm. Chúng thuộc về một phụ lục và về bài cuối.

## Nguyên tắc viết

**Sửa fold vào bài sở hữu hành vi, không để dành.** Bài 00 dạy pivot ở đáy ngay từ lúc import. Bài 09 dạy bảng va chạm ngay khi có object đầu tiên mà người chơi phải chạm. Bài 12 dạy `Dangerous` tách khỏi `Vulnerable` ngay khi viết boss. Bài cuối không phải nơi đổ lỗi tồn đọng — nó dạy **cách tự tìm ra** lớp lỗi đó.

**Mỗi bài một câu hỏi trung tâm.** Nếu một bài trả lời hai câu hỏi không liên quan, tách. Nếu một bài không trả lời được câu nào rõ ràng, gộp.

**Con số đi kèm cách kiểm.** Không viết "moveSpeed 9 cho cảm giác tốt" mà "9 u/s, phòng rộng 64 nên băng ngang mất 7 giây; thả phím trượt thêm 0.45 u, chưa tới nửa tile". Người đọc phải kiểm được bằng mắt hoặc bằng một phép đếm.

**Người đọc không có công cụ đo của tác giả.** Mỗi chỗ journal dùng recorder, bài phải có một cách kiểm bằng mắt tương đương: đặt bệ cao đúng 5 tile rồi nhảy phải vừa chạm mép; đếm Path Count trong Inspector phải là 5 chứ không phải hàng trăm.

**Giữ các vấp "không báo lỗi", bỏ các vấp thuộc về môi trường làm việc.** Bug thứ tự `Taken`/`Collect` phải vào bài. Chuyện `OpenScene` giết managed reference khi điều khiển Editor từ ngoài thì không — người đọc kéo chuột, không gặp.

## Bố cục series: 17 bài, 5 phần

| Phần | Bài | Người đọc có được gì |
|---|---|---|
| Dựng thế giới | #0–#1 | Một căn phòng pixel art đúng tỉ lệ, có collider liền mạch |
| Điều khiển | #2–#4 | Nhân vật chạy, nhảy, bám tường — mọi con số suy từ thiết kế |
| Trình bày | #5–#7 | Camera, animation, và ba nhân vật từ một prefab |
| Luật chơi | #8–#12 | Chết, mục tiêu phòng, ba kiểu địch, một trận boss |
| Đóng gói | #13–#16 | Juice, nền cuộn, nhiều màn, build web, và cách tự soát lỗi |

17 bài nhiều hơn shmup (12) vì vật liệu nhiều hơn thật: 18 chặng dựng, và phần điều khiển của platformer cần ba bài riêng (chạy / nhảy / air moves) trong khi shmup gộp được.

---

## #0 — Pixel art vào Unity mà không bị phá

**Vật liệu:** journal 00. Mạnh nhất series về bằng chứng: `Idle.png` 352×32 bị nén còn **256×32** với setting mặc định.

**Câu hỏi trung tâm:** làm sao để pixel art hiện lên đúng từng pixel, và một tile bằng đúng một đơn vị thế giới?

**Mục lục đề xuất:**

1. Kéo **một** sprite vào project với setting mặc định. Zoom vào. Nó mờ, và nó còn bị co: 352 → 256.
2. Vì sao co: 352 không phải luỹ thừa 2, gặp Compressed là Unity scale lại. Đổi Filter Mode không cứu được.
3. Sửa setting: Sprite / Point / Uncompressed / mipmap tắt / PPU 16. Import lại, kiểm `352×32`.
4. Vì sao PPU 16 chứ không 100: tile 16 px ⇒ 1 tile = 1 unit ⇒ mọi toạ độ phòng là số nguyên.
5. **Pivot ở đáy, không ở giữa.** Mở một sheet nhân vật, chỉ ra phần vẽ chạm đáy ô. Đặt pivot Bottom ⇒ `transform.y` chính là chân.
6. Camera: orthographic Size 9 → 18 u cao → 32 u ngang ở 16:9. `PixelPerfectCamera` của **URP** (có hai component trùng tên, chỉ rõ chọn cái nào).
7. Game view size riêng 1536×864 = đúng 3× của 512×288. Giải thích zoom số nguyên.
8. Kiểm: bấm Play rồi mới đo — Inspector lúc Edit hiện số cũ.

**Fold vào từ chặng sau:** pivot đáy (chặng 15). Journal 15 phát hiện pack vẽ `gapBottom = 0` ở mọi clip, tức nó được thiết kế cho pivot Bottom, mà 14 chặng đầu để Center nên mọi nhân vật lún 0.5 u. Bài 00 dạy đúng ngay, và **giữ lại cách phát hiện**: đọc alpha của sprite để biết pack muốn pivot ở đâu.

**Bố cục:** ảnh trước/sau zoom vào cạnh pixel là hình chủ đạo, đặt ngay mục 1. Bảng setting ở mục 3. Sơ đồ Size → chiều cao → chiều rộng ở mục 6.

**Đạt khi:** một sprite hiện đúng kích thước gốc, nhân vật cao đúng 2 tile, và Play mode đo ra đúng 32×18 unit.

**Cắt khỏi journal:** việc cắt 60 sheet (đẩy sang #6), `ScaleProbe_Player`, chuyện project có sẵn thư mục shmup.

---

## #1 — Một căn phòng vẽ bằng một viên gạch

**Vật liệu:** journal 01. Hai bằng chứng tốt: ảnh tường trơn vs tường có viền, và **528 ô → 5 path**.

**Câu hỏi trung tâm:** làm sao vẽ một căn phòng nhanh, đẹp, và có collider mà nhân vật không vấp?

**Mục lục đề xuất:**

1. Nhìn tileset trước khi sơn. Khoanh khối 3×3 (ô 0·1·2 / 16·17·18 / 32·33·34) và nói thẳng: tác giả vẽ 9 ô này để máy tự chọn.
2. Ảnh "sơn tay bằng 2 ô": tường phẳng, không góc. Đây là kết quả nếu bỏ qua mục 1.
3. Dựng RuleTile: 9 rule cho khối dày, rồi **6 rule nữa** cho hàng đơn và cột đơn. Giải thích vì sao 9 chưa đủ.
4. Giới hạn của tileset: không có ô góc lõm, nên chỗ tường gặp sàn có một khấc. Nói thẳng, đừng giấu.
5. Sơn phòng 64×36 theo bảng toạ độ. Nói rõ các bệ và khe được đặt cố ý cho bài 03–04.
6. Collider: Tile phải có `ColliderType = Grid`, rồi `TilemapCollider2D` + `CompositeCollider2D` + `Rigidbody2D Static`.
7. Vì sao cần Composite: 528 collider vuông rời có đường nối, nhân vật đi ngang sẽ vấp.
8. Kiểm: Path Count = 5. Và `TilemapCollider2D.shapeCount = 0` — số 0 này trông như hỏng, giải thích trước khi người đọc hoảng.

**Bố cục:** ảnh trước/sau (trơn vs có viền) cạnh nhau ở mục 2. Bảng toạ độ phòng ở mục 5. Gizmo composite 5 đường bao ở mục 8.

**Đạt khi:** phòng có viền góc đúng, thả một thùng xuống thì nó nằm yên, Path Count là số nhỏ.

**Cắt khỏi journal:** chuyện `UnityEngine.Tilemaps.Grid` không tồn tại (chỉ dân viết code gặp), ba bộ terrain chưa dùng.

---

## #2 — Chạy: vì sao Dynamic chứ không Kinematic

**Vật liệu:** journal 02. Có bảng đo đối chiếu lý thuyết, và một quan sát có chủ đích (bậc 1 tile chặn đứng nhân vật).

**Câu hỏi trung tâm:** làm sao nhân vật chạy có quán tính đo được, và vì sao chọn Rigidbody Dynamic?

**Mục lục đề xuất:**

1. Tạo Input Actions: map `Gameplay`, action `Move` (Vector2) và `Jump` (Button — khai trước, bài 03 mới đọc).
2. Tạo Player với Rigidbody2D + BoxCollider2D. **Bấm Play trước khi viết dòng code nào**: nó rơi xuống sàn và nằm yên. Đó là verify đầu tiên.
3. Collider lấy theo thân vẽ, không theo ô sprite: sheet 32×32 nhưng thân chỉ 23×28 px. Auto-fit ⇒ chạm tường khi còn cách 0.3 u.
4. Dynamic vs Kinematic, đối chiếu thẳng shmup #2: ở đó không có trọng lực và không đứng lên gì; ở đây trọng lực, sàn, tường đều muốn physics lo.
5. Viết `PlayerMotor`: đọc input trong `Update`, đẩy body trong `FixedUpdate`.
6. `MoveTowards` chứ không `Lerp` — MoveTowards có tốc độ cố định nên `accelTime` là số thật, đo được.
7. `accelTime` 0.12 ≠ `decelTime` 0.08: nhả phím dừng gắt hơn lúc tăng tốc. Cho người đọc đổi decel thành 0.3 và cảm nhận "trượt băng".
8. Ground check bằng `OverlapBox`, không bằng trigger ở chân. Bài 04 dùng lại đúng kỹ thuật này quay ngang.
9. Physics material friction 0 — đặt ở đây, giải thích ở bài 04.
10. Chạy vào bậc 1 tile thì dừng. Đó là đúng: bậc 1 tile phải nhảy, bài 03 giải quyết.

**Bằng chứng đưa vào bài:** top speed 9.00 đúng thiết kế; nhả phím trượt thêm 0.45 u, chưa tới nửa tile.

**Bố cục:** đồ thị vx(t) ở mục 7 (dữ liệu có trong journal). Ảnh Scene view zoom collider vs sprite ở mục 3.

**Đạt khi:** chạy được bốn hướng và gamepad, thả phím trượt chưa tới nửa tile, đứng vững trên sàn.

**Cắt khỏi journal:** chuyện input giả lập trễ 0.3 s, cách tạo layer bằng `SerializedObject`.

---

## #3 — Nhảy cao đúng 5 tile: tính chứ không mò

**Vật liệu:** journal 03 — nhiều nhất series. Bốn kịch bản đo, và một lỗi mà gần như mọi tutorial đều mắc.

**Câu hỏi trung tâm:** muốn nhảy cao đúng 5 tile thì đặt lực bao nhiêu?

**Mục lục đề xuất:**

1. Câu hỏi mở bài, và câu trả lời thường gặp: "thử 10, không được thì 15". Bài này không làm thế.
2. Hai số thiết kế người đọc hình dung được: `jumpHeight` 5.5 u, `timeToApex` 0.4 s. Phần còn lại suy ra: `g = 2h/t²` = 68.75, `v = g·t` = 27.5.
3. `gravityScale = 0`, motor tự tích phân trọng lực. Vì sao: để `fallGravityMultiplier` và `maxFallSpeed` nằm cùng chỗ với `jumpHeight`.
4. Nhảy giữ hết. Đo **5.22 u** so với 5.5 — thiếu đúng nửa step Euler (v·dt/2 = 0.275). Nói thật con số, đừng làm tròn cho đẹp.
5. Variable height: nhả sớm thì vy × 0.4 — **một lần**.
6. **Lỗi kinh điển:** nếu nhân mỗi FixedUpdate thì thành 0.4ⁿ, sau 3 step còn 6%, cú nhảy chết tức thì. Đặt hai đồ thị vy(t) cạnh nhau. Trông vẫn "giống variable height" nên không ai nhận ra.
7. Coyote time 0.10 s: rời mép rồi bấm vẫn nhảy.
8. Jump buffer 0.10 s: bấm trước khi chạm đất thì vẫn được.
9. **Chỗ đi xa hơn tutorial thường:** buffer không chỉ để tha thứ. Nó là cầu nối `Update` ↔ `FixedUpdate` — một lần bấm rơi vào frame không có physics step vẫn không bị mất.

**Bằng chứng đưa vào bài:** giữ hết 5.22 u / đỉnh 0.34 s; chạm nhẹ 2.40 u = 44%; buffer → nhảy đúng 1 step.

**Bố cục:** đồ thị y(t) hai đường (giữ hết vs chạm nhẹ) ở mục 5; hai đồ thị vy(t) cut-sai vs cut-đúng ở mục 6 — **đây là hình đắt nhất bài**; sơ đồ cửa sổ coyote và buffer ở mục 7–8.

**Đạt khi:** đặt bệ cao đúng 5 tile, nhảy phải vừa chạm mép; chạm nhẹ lên khoảng 40% độ cao; rời mép trễ 0.08 s vẫn nhảy được.

**Cắt khỏi journal:** toàn bộ chuyện recorder và input test (đẩy sang phụ lục), vấp 6 và 7.

---

## #4 — Double jump và wall jump: cùng một phím, ba kết quả

**Vật liệu:** journal 04. Bảng ưu tiên ba loại nhảy là xương sống.

**Câu hỏi trung tâm:** một phím Space, làm sao máy biết người chơi muốn nhảy kiểu nào?

**Mục lục đề xuất:**

1. Bảng ưu tiên: coyote → wall coyote → air jump. Giải thích vì sao thứ tự này: đảo air lên trước wall thì đứng cạnh tường bấm nhảy sẽ tốn double jump.
2. Air jump: `maxJumps = 2`, `airJumpHeightScale = 0.85` ⇒ cú hai thấp hơn cú đầu.
3. Dò tường bằng `OverlapBox` hai bên — cùng kỹ thuật ground check ở bài 02, quay ngang.
4. **Probe phải thấp hơn collider.** Cao bằng collider thì đứng trên mép bệ cũng bị coi là bám tường. Ảnh gizmo.
5. Wall slide: kẹp vy ở −4 u/s, và chỉ khi `vy ≤ 0` — đang bay lên chạm tường thì vẫn bay lên.
6. Wall jump: đẩy ngang 10 u/s (> moveSpeed 9 để thắng air control).
7. **`wallJumpLock` 0.15 s.** Cho người đọc thử với lock = 0 trước: giữ phím về tường, bấm nhảy, văng ra một frame rồi dính lại ngay.
8. Wall jump **gán** `JumpsThisAirtime = 1` chứ không cộng — bật tường xong vẫn còn một double jump. Nói rõ đây là lựa chọn: Celeste không có double jump, Hollow Knight wall jump không tốn gì.
9. Friction 0 từ bài 02 trả công ở đây.

**Bằng chứng:** double jump tổng 9.08 u từ sàn; wall slide vy = −4.00 đúng suốt 78 mẫu; wall jump vx = −10.00 giữ đúng 0.15 s dù đang giữ phím ngược.

**Bố cục:** sơ đồ cây quyết định ba loại nhảy ở mục 1 — hình chủ đạo. Đồ thị vx(t) của test G ở mục 7 (thấy đoạn phẳng −10 rồi cong về +9).

**Đạt khi:** leo được khe rộng 4 unit bằng chuỗi wall jump, và giữ phím về phía tường vẫn bật ra được.

---

## #5 — Camera: ba người cùng muốn quyết định nó ở đâu

**Vật liệu:** journal 05. Có một phát hiện hiếm: `clamp(smooth(aim))` giật ở biên.

**Câu hỏi trung tâm:** camera bám nhân vật trong một phòng lớn hơn màn hình mà không lộ ra ngoài, không nhấp nhô theo cú nhảy — làm thế nào?

**Mục lục đề xuất:**

1. Bài toán: follow, clamp, và shake (bài 13) đều muốn ghi vị trí camera. Cho cả ba ghi vào một Transform là hỏng.
2. Kiến trúc hai tầng: `CameraRoot` ghi world position, `Main Camera` con để dành cho shake ghi local position. Bài 13 cắm vào mà không sửa dòng nào ở đây.
3. Dựng từng lớp, mỗi lớp một lần bấm Play: bám 1:1 → chóng mặt.
4. Thêm dead zone (1.5, 1.0) → nhích nhẹ không kéo camera.
5. Thêm `SmoothDamp` (không `Lerp` — cùng lý do `MoveTowards` ở bài 02, và SmoothDamp có velocity để đặt về 0 khi bị clamp).
6. Luật Y: theo `lastGroundedY`, trên không thì đứng yên — trừ khi nhân vật rời quá 60% nửa màn hình.
7. Look-ahead 3 u. **Đo ra chỉ dẫn trước 0.42 u** vì dead zone 1.5 và lag v·τ ≈ 1.08 ăn mất. Giải thích, nếu không người đọc tưởng look-ahead không chạy.
8. Clamp vào `RoomBounds`, trừ `shakeMargin` 0.35 — bài 13 sẽ dùng đúng số này.
9. **Clamp aim trước rồi mới smooth.** Mọi tutorial viết `clamp(smooth(aim))`; đáp từ bệ cao xuống gần biên thì camera lao 4 unit trong 2 step, nhìn như snap.

**Bằng chứng:** nhảy tại chỗ camY range = 0.000; K vs K2 (giật vs cong đều tới 9.35 trong 0.7 s).

**Bố cục:** sơ đồ hai tầng ở mục 2. **Đồ thị camY(t) của K vs K2 là hình đắt nhất bài**, đặt ở mục 9. Gizmo dead zone + khung camera + RoomBounds trong một ảnh ở mục 4.

**Đạt khi:** chạy tới tường phòng mà không thấy khoảng trống ngoài tilemap; nhảy tại chỗ camera không nhúc nhích.

---

## #6 — Animation suy từ vật lý, không từ phím

**Vật liệu:** journal 06. Một ý duy nhất, bán rất rõ.

**Câu hỏi trung tâm:** bảy animation, thêm move mới thì vẽ thêm mấy mũi tên transition?

**Mục lục đề xuất:**

1. Mở bằng Animator mạng nhện: 7 state, mỗi cặp một transition hai chiều. Rồi hỏi câu trên.
2. Cắt sheet thành clip (phần cắt sheet của journal 00 chuyển về đây). Samples = 20 — con số của pack.
3. Controller **0 transition**, default Idle. Animator ở đây là "bộ phát clip", logic nằm ở C#.
4. Hàm `Derive()`: bảng ưu tiên Hit → WallSlide → (trên không: DoubleJump → Jump → Fall) → Run → Idle.
5. `Animator.Play(hash, 0, 0f)` chứ không `SetBool`/`SetTrigger`. Không có parameter nào.
6. `DoubleJump` có thời hạn 0.3 s (clip 6 frame @20fps), hết thì rơi về luật vy — nếu không nó đứng ở frame cuối suốt phần rơi.
7. Sheet `Wall_Jump` thực ra là tư thế **bám tường**, không phải động tác bật. Đặt tên state là `WallSlide` cho khỏi nhầm.
8. Lật bằng `flipX`, không scale −1 (scale âm lật cả collider offset và child transform).

**Bằng chứng:** timeline `Idle@0.00 Run@0.34 Jump@0.56 Fall@0.58 …` — mọi chuyển trạng thái đúng trong 1–2 step.

**Bố cục:** ảnh Animator 7 state không mũi tên là hình chủ đạo, đặt cạnh ảnh mạng nhện ở mục 1.

**Đạt khi:** chạy → nhảy → double jump → bám tường → đáp, mỗi đoạn đúng clip, và thêm một state mới chỉ cần thêm một dòng trong `Derive()`.

**Cắt khỏi journal:** vấp 1 (nhảy cụt vì đập đầu vào bệ — thuộc về kịch bản test), vấp 2 (catch-up của Editor).

**Giữ lại một câu:** `GetComponent<T>() ?? AddComponent<T>()` không chạy vì Unity trả về "null giả". Tác giả đã biết từ shmup #4 mà vẫn dính.

---

## #7 — Ba nhân vật từ một prefab

**Vật liệu:** journal 07. Bảng 19 số và bảng đo ba cột là nội dung chính.

**Câu hỏi trung tâm:** làm sao ba nhân vật khác nhau về **cảm giác điều khiển**, không chỉ khác sprite?

**Mục lục đề xuất:**

1. Đối chiếu shmup #6: cùng pattern ScriptableObject + `Apply()` trong `OnEnable`, nhưng ở đó data là **chỉ số**, ở đây là **cảm giác**.
2. `PlayerData`: 19 số chia 5 nhóm (run, jump, air, wall, tha thứ). Mỗi hàng một câu "số này làm gì với tay bạn".
3. `Gravity` và `JumpVelocity` suy ra hiện trong Inspector — lặp ở cả data lẫn motor, cố ý.
4. Ba asset và ba tính cách. Nặng có `maxJumps = 1` là quyết định lớn nhất: mất double jump, bù bằng bám tường tốt (wallSlide 2.5) và push mạnh (12).
5. Ba nhân vật là **ba cách qua cùng một phòng**: Nhẹ qua bằng double jump, Nặng qua bằng wall jump.
6. Đổi nhân vật lúc runtime bằng `Apply()` + `ApplyData()` — bài 15 màn chọn nhân vật dùng đúng hai hàm này.
7. Kiểm: chọn Player, ô Data phải hiện tên asset chứ không phải None.

**Bằng chứng — bảng ba cột cùng một kịch bản:**

| | Cân bằng | Nhẹ | Nặng |
|---|---|---|---|
| Top speed | 9.00 | 10.50 | 7.50 |
| Trượt sau thả | 0.27 u | 0.21 u | **0.49 u** |
| Cao nhảy | 5.23 | 6.26 | 4.24 |
| Trên không | 0.72 s | 0.78 s | **0.56 s** |

**Bố cục:** bảng 19 số ở mục 2 là nội dung, không phải phụ lục. Đồ thị y(t) ba đường ở mục 4.

**Đạt khi:** đổi asset trong ô Data rồi bấm Play, nhân vật đổi cả hình lẫn cảm giác; đọc bảng ba cột là đoán được tính cách mà chưa cần chơi.

---

## #8 — Chết và hồi sinh mà không reload scene

**Vật liệu:** journal 08 + phần respawn của journal 16.

**Câu hỏi trung tâm:** platformer chết mấy chục lần mỗi màn — làm sao hồi sinh nhanh mà không mất tiến độ phòng?

**Mục lục đề xuất:**

1. Đối chiếu shmup #8: ở đó restart bằng `SceneManager.LoadScene`. Ở đây không dùng được — reload vừa chậm vừa xoá sạch gem đã nhặt và cờ đã cắm.
2. `SpriteSequence`: phát một dãy sprite, nhẹ hơn Animator. Tiêu chí chọn: nhân vật có 7 state và logic suy state nên cần Animator; cờ, bẫy, gem chỉ phát một dãy.
3. `Hazard` + layer `Hazard`.
4. **Collider bẫy phải đo từ hình vẽ, không đặt đại.** Đặt `2.2 × 1.6` thì vùng chết cao tới y=3.9 trong khi gai chỉ tới 2.95 — nhảy qua vẫn chết, trông như chết oan. Số thật: 32×16 px = 2.0 × 1.0 u sát đáy ô.
5. Checkpoint ba trạng thái: `No_Flag` → `Flag_Out` (chạy một lần) → `Flag_Idle` (loop). Cờ cũ tự hạ.
6. `DeathRoutine` là coroutine 6 bước, mỗi bước một lý do: đóng băng xác → tắt collider → tắt sprite → teleport → `SnapTo` camera (bài 05 đã chuẩn bị) → trả điều khiển.
7. **Bất tử ngắn 1.2 s sau hồi sinh.** Không có nó, một checkpoint nằm trong đường tuần của địch thành vòng lặp chết vô hạn.
8. **Và đặt checkpoint tránh đường địch.** Hai lớp chữa: bất tử chữa triệu chứng ở mọi nơi, đặt đúng chỗ chữa nguyên nhân ở chỗ này.

**Fold vào từ chặng sau:** mục 7 và 8 lấy từ journal 16 (lỗi 5). Journal gốc chặng 08 chưa có bất tử; journal 11 ghi "chưa làm"; journal 16 mới làm sau khi chết lặp.

**Bằng chứng:** chết → điều khiển lại đúng 0.80 s; log ba lần chết liên tiếp cùng một địch trước khi có bất tử.

**Bố cục:** **ảnh đối chiếu gizmo collider bẫy sai vs đúng là hình quan trọng nhất bài**, ở mục 4. Chuỗi 4 khung VFX chết ở mục 6.

**Đạt khi:** chết 5 lần liên tiếp ở cùng một bẫy, mỗi lần hồi sinh ở cờ gần nhất, `Deaths` tăng đúng 5, và không lần nào chết ngay khi vừa hiện ra.

---

## #9 — Mục tiêu của một căn phòng, và bảng va chạm

**Vật liệu:** journal 09 + lỗi 1 của journal 16 (bảng va chạm) + lỗi 6 của journal 16 (collider thùng).

**Câu hỏi trung tâm:** nhặt hết gem thì cửa mở — nghe đơn giản, nhưng cần những gì để nó thật sự chạy?

**Mục lục đề xuất:**

1. Mở bằng `StompCheck`, không bằng gem. Đây là luật mà bốn bài sau đều dùng. Hai trường hợp sai kinh điển trước: giẫm trúng khi đang bay lên, và chết oan khi rõ ràng đã đạp đầu. Rồi mới viết hàm 4 dòng.
2. Thùng gỗ: collider **không trigger** (đứng lên được), chỉ vỡ khi bị giẫm. Tiêu chí chung: thứ gì người chơi đứng lên được thì không trigger.
3. **Collider thùng lấy theo hình vẽ, không theo ô.** Ô 32×32 nhưng thùng chỉ 22×22 px nằm giữa ô, chừa 5 px dưới đáy. Để pivot Center thì thùng **lơ lửng 5 px** trên mặt đất. Đây là cùng bài học pivot của bài 00, lần này ở một object tĩnh.
4. **Bảng va chạm Physics2D là luật chơi.** Đặt thùng vào layer nào? Đây là chỗ người đọc gặp `Layer` lần đầu với hậu quả thật. Nếu `Player × Default` đang tắt mà thùng ở `Default`, người chơi **đi xuyên qua thùng** — không lỗi, không log, chỉ là nó không tồn tại.
5. Gem: `Collectible` + `RoomState`. Gem **tự đăng ký** trong `Start` nên `GemsTotal` không bao giờ gõ tay.
6. **Bug thứ tự:** `Taken = true` trước rồi mới `room.Collect(this)` — mà `Collect` có guard `if (gem.Taken) return`. Gem biến mất khỏi màn hình, bộ đếm đứng im ở 0, cửa không bao giờ mở. Đưa cả đoạn code sai để người đọc tự tìm.
7. `LevelExit`: khoá tới khi hết gem. `bounceVelocity` 20 < `JumpVelocity` 27.5 — giẫm thùng không thay được một cú nhảy đầy đủ, nên không phá được câu đố độ cao.

**Bố cục:** sơ đồ `StompCheck` (mũi tên vy xuống + chân trên đỉnh) ở mục 1. Bảng va chạm với ô `Player × Default` khoanh đỏ ở mục 4. Đoạn code sai ở mục 6, đặt trước phần giải thích.

**Đạt khi:** đi vào thùng thì bị chặn, giẫm lên thì vỡ và nảy; nhặt đủ 5 gem thì cúp đổi sprite và đi vào được.

---

## #10 — Địch đi tuần mà không rơi khỏi bệ

**Vật liệu:** journal 10. Bảng đối chiếu điểm quay với biên hình học là bằng chứng đẹp nhất series.

**Câu hỏi trung tâm:** vì sao con địch đầu tiên bạn kéo vào scene lại lao xuống vực?

**Mục lục đề xuất:**

1. Câu hỏi mở bài. Rồi: raycast dò sàn **phía trước**, không phải dưới chân.
2. Hai cảm biến cùng nhìn về phía đang đi: `GroundAhead()` (raycast xuống từ mép trước) và `WallAhead()` (OverlapBox ngay trước mép).
3. **Kinematic + MovePosition**, đối lập trực tiếp với player Dynamic ở bài 02. Lý do: địch không cần trọng lực, và Dynamic thì người chơi ủi được nó khỏi bệ.
4. **Công thức độ cao đặt địch**, kèm bảng cho ba mặt sàn của phòng. Đặt sai 1.5 u thì probe hụt sàn, `Direction` đảo mỗi FixedUpdate, địch **rung tại chỗ 50 lần/giây**.
5. `turnDelay` 0.1 s: không sửa được lỗi đặt sai, nhưng biến "rung vô hình" thành "đi qua đi lại ngắn" — dễ nhận ra hơn nhiều.
6. `StompCheck` từ bài 09 dùng lại nguyên vẹn, đúng một dòng. Đây là chỗ trả công cho quyết định tách static class.
7. Chạm ngang thì người chết, địch sống. Nối cả `OnCollisionEnter2D` lẫn `OnTriggerEnter2D` vào một hàm — bài 11 có địch bay dùng trigger.

**Bằng chứng — điểm quay so với hình học:**

| Địch | Range đo được | Điểm quay | Kỳ vọng (mép ± 1.0) |
|---|---|---|---|
| Bệ 1 | 8.96 → 16.04 | 9.02 / 15.98 | 9.0 / 16.0 |
| Bệ 2 | 20.96 → 28.04 | 21.02 / 27.98 | 21.0 / 28.0 |

Sai số ≤ 0.04 u, dưới một bước di chuyển.

**Bố cục:** **gizmo raycast dò sàn + wallBox là hình quan trọng nhất**, ở mục 2. Ảnh đối chiếu địch đặt đúng vs cao 0.5 u ở mục 4.

**Đạt khi:** địch đi tới mép bệ thì quay đầu, không rơi; giẫm từ trên thì nó chết và người nảy lên; chạm ngang thì người chết.

---

## #11 — Ba kiểu địch từ một ScriptableObject

**Vật liệu:** journal 11. Có ba bug cùng một họ, đáng gom thành một mục.

**Câu hỏi trung tâm:** làm sao ba hành vi khác hẳn nhau dùng chung một cấu trúc dữ liệu?

**Mục lục đề xuất:**

1. **Đọc asset ra thiết kế.** Pack vẽ cho charger: Idle, Walk, Charge, **Stun**, Hit. Có Stun nghĩa là tác giả đã thiết kế sẵn cửa sổ trừng phạt sau cú lao hụt.
2. `EnemyData`: collider, tốc độ, tầm nhìn, timing, và 6 mảng sprite.
3. Charger: state machine 4 trạng thái. Telegraph 0.5 s (clip Idle — đứng khựng báo hiệu) → Charge 11 u/s → đâm tường → Stunned 1.6 s.
4. **Charge cố ý không dừng ở mép vực.** Lao hụt là rơi — phần thưởng cho người chơi biết dụ. Khác hẳn `Walk` vẫn dò mép.
5. `stompableOnlyWhenVulnerable` — một dòng bool nhưng là cả một luật chơi. Jumper giẫm lúc nào cũng được; charger chỉ sau khi tự đâm tường.
6. Cannon + `PrefabPool` của `_Common`. **Đây là chỗ code dùng chung trả công**: pool viết ở shmup #4 cho đạn tàu vũ trụ, giờ chạy cho đạn thần công, không sửa một dòng.
7. Flyer: bay ngang, bổ nhào khi người chơi đi phía dưới.
8. **Ba cách code im lặng không làm gì** — gom vấp 1–3 của journal thành một mục:
   - Hai layer trùng tên "Player" (6 và 12). `NameToLayer` trả về slot **đầu tiên** trùng tên, mask không khớp, địch không bao giờ thấy người chơi.
   - Raycast mảnh làm `sightHeight` thành code chết: tia ngang ở tầm mắt trượt dưới người đứng trên bậc, nên phép so chiều cao không bao giờ chạy.
   - `enabled = false` **không** làm người chơi bất tử: `Cannonball` gọi `life.Kill()` từ ngoài, và `GetComponentInParent` vẫn trả về component đang tắt.

**Bằng chứng:** timeline charger `Telegraph@0.01 → Charge@0.53 → Stunned@1.39 → Walk@3.01` khớp thiết kế 0.5/1.6 s; pool giữ đúng 8 object suốt 17 phát bắn.

**Bố cục:** sơ đồ state machine charger ở mục 3. Ảnh tia mảnh vs vùng hộp ở mục 8. Hierarchy `CannonballPool` lúc Play ở mục 6.

**Đạt khi:** charger lao hụt thì rơi xuống vực; giẫm charger lúc Stunned thì nó chết, lúc Walk thì mình chết; pool không sinh thêm instance nào sau phát thứ 8.

---

## #12 — Boss giải được bằng chân, không bằng vũ khí

**Vật liệu:** journal 12 + lỗi 2 và 4 của journal 15–16.

**Câu hỏi trung tâm:** nhân vật không có đòn đánh — làm sao có một trận boss?

**Mục lục đề xuất:**

1. **Mở bằng giới hạn, không bằng boss.** Pack không vẽ animation tấn công cho nhân vật. Giới hạn đó ép ra thiết kế tốt hơn: boss phải **tự đặt mình vào thế hở**.
2. Vòng trận 5 trạng thái: Idle → Telegraph (0.9 s) → Charge (13 u/s) → đâm vách → Recover (1.8 s, cửa sổ giẫm) → quay đầu.
3. **Ba con số làm nên trận đấu**: telegraph (thời gian phản ứng), chargeSpeed 13 > moveSpeed 9 (không chạy thoát được, phải nhảy), recover (cửa sổ trừng phạt). Cho người đọc chỉnh từng số: telegraph 0.3 thành bất công, recover 4 thành nhàm.
4. `rampPerHit` 0.75: tăng độ khó **không cần đổi luật**. Không thêm chiêu, không thêm máu, chỉ bóp thời gian.
5. **Ô sprite không phải nhân vật.** Brute ở ô 72×48 nhưng thân nằm lệch phải (x 35..62, tâm 48.5 px so với tâm ô 36). Đặt collider theo ô thì nó **lệch trái 0.78 u và rộng gấp rưỡi** — đứng cách boss nửa ô vẫn chết, giẫm lên đầu thì hụt. Pivot đặt ở tâm **thân**.
6. **Tách `Dangerous` khỏi `Vulnerable`.** Trúng đòn xong boss vào `Hurt`, mà `Hurt` không phải `Recover` nên không "hở" — người chơi còn đứng trên đầu nó, lần chạm thứ hai rơi vào nhánh giết. **Đánh trúng thì bị phạt.** Chỉ Idle/Telegraph/Charge mới giết.
7. Boss tái dùng toàn bộ: `StompCheck` (bài 9), `stompableOnlyWhenVulnerable` (bài 11), `SpriteSequence` (bài 8), `EnemyData` (bài 11). Gần như không có khái niệm mới — nói rõ, đó là phần thưởng cho 11 bài trước.
8. **Probe không được gõ tay chiều cao.** Thu collider boss cho khớp hình thì probe tường (cao 2.0, gõ tay) thò xuống dưới sàn và boss **coi mặt đất mình đang đứng là tường**, đứng im ngay từ đầu. Suy chiều cao probe từ collider.

**Bằng chứng:** giẫm ba lần HP 3→2→1→0, mỗi lần nảy vy = 22.0, **0 lần chết**; boss lao qua lại giữa x 53.06 và 61.12.

**Bố cục:** sơ đồ vòng trận 5 trạng thái ở mục 2. Gizmo collider boss cũ (lệch) vs mới (ôm thân) ở mục 5. Hai dòng log `state=Recover isStomp=True` / `state=Hurt isStomp=True` cạnh nhau ở mục 6.

**Đạt khi:** giẫm được ba lần mà không chết vì chính cú giẫm của mình; boss lao qua lại giữa hai vách và nhịp trận nhanh dần.

---

## #13 — Juice: rung, chớp, âm thanh

**Vật liệu:** journal 13. Ý mạnh nhất: lớp juice gắn từ ngoài, không sửa một dòng nào ở 12 bài trước.

**Câu hỏi trung tâm:** thêm phản hồi cho toàn bộ game mà không đụng vào code gameplay — bằng cách nào?

**Mục lục đề xuất:**

1. **Mở bằng câu "không sửa một dòng nào trong 12 bài trước".** `PatrolEnemy` có `Killed`, `RoomState` có `GemChanged`, `PlayerLife` có `Died`, `BossBrute` có `HealthChanged`, `PlayerMotor` có `LastJumpAt` — tất cả viết từ trước, không hề biết `GameFeel` sẽ tồn tại.
2. Vì sao dùng event chứ không gọi thẳng: cách "dễ" là cho `PatrolEnemy.Die()` gọi `GameFeel.OnStomp()`. Làm thế thì địch phải biết lớp phản hồi tồn tại, và tắt juice đi là gãy game.
3. Camera shake ghi **local position** của Main Camera, còn `CameraFollow` ghi world position của CameraRoot. Hai tầng từ bài 05 giờ mới dùng hết.
4. **`shakeMargin` là một hợp đồng.** Một bên hứa rung không quá 0.32, bên kia chừa 0.35. Bảng đo chứng minh hợp đồng giữ được, và vi phạm thì lộ ngay.
5. `hardLandSpeed` 18 u/s: rung mọi lần tiếp đất thì mệt mắt. Chỉ rung khi rơi đủ nhanh thì cú rung mới mang nghĩa.
6. **Thứ tự khởi tạo.** Seed máu boss phải đọc trong `Start`, không phải `OnEnable` — đọc sớm ra 0, rồi cú trúng đòn đầu tiên trông như máu **tăng** từ 0 lên 2 và lớp phản hồi im lặng bỏ qua. Không exception, không log, chỉ thiếu một cú rung.
7. Pack không có âm thanh — tự sinh 5 file wav. Không hay, nhưng đủ để chỉnh nhịp.
8. `_Common` trả công lần hai: `CameraShake` chuyển từ shmup sang được. `HitFlash` thì **không** — nó có `[RequireComponent(typeof(Health))]`, buộc vào hệ thống máu của shmup. Ranh giới: thứ chuyển sang được là thứ **không biết gì về game**.

**Bằng chứng:**

| strength đặt | offset thực đo | thò ra ngoài phòng |
|---|---|---|
| 0.10 / 0.18 / 0.30 / **0.32** | 0.062 → 0.265 | **0.000** |
| 0.60 (vượt lề 0.35) | 0.477 | 0.003 (lần khác 0.198) |

Và: giữ nút 0.4 s → rơi 32 u/s → có rung; gõ nhẹ 0.03 s → rơi 13.8 u/s → chỉ có tiếng, không rung.

**Bố cục:** sơ đồ hai tầng CameraRoot/Main Camera (ai ghi world, ai ghi local) ở mục 3. Bảng hợp đồng shakeMargin ở mục 4. Sơ đồ gameplay phát sự kiện → GameFeel nghe → shake + audio ở mục 1.

**Đạt khi:** đứng sát mép phòng, kích cú rung mạnh nhất, vẫn không lộ khoảng trống ngoài tilemap; tắt component `GameFeel` thì phòng vẫn chạy đúng mọi luật, chỉ im lặng.

---

## #14 — Nền cuộn vô hạn: làm bằng shader rồi vứt đi

**Vật liệu:** journal 17. Bài duy nhất trong series kể một lần làm sai hướng.

**Câu hỏi trung tâm:** nền lát vô hạn, tự trôi, trôi chậm hơn thế giới — làm bằng gì?

**Mục lục đề xuất:**

1. Cách thường thấy: cuộn `mainTextureOffset` trong `Update()`. Nhược: nền phải đủ lớn, mỗi lớp một script.
2. **Cách một: shader lấy UV từ toạ độ thế giới.** Rút gọn công thức parallax ngay trước mắt người đọc: fragment ở vị trí màn hình `s` có `worldXY = camPos + s`, thay vào ra `uv = (s + camPos·p + scroll·t)·tiling`. Sau ba dòng đó `_Parallax` không còn là số mò.
3. Nó chạy, và đo đúng: parallax 0.250 và 0.552 so với đặt 0.25 và 0.55.
4. **Nhưng nó bắt mình tự làm ba việc**, và hai việc làm sai:
   - `_MainTex_TexelSize` khai trong `UnityPerMaterial` về **0 trên WebGL** ⇒ `1/0 = inf` ⇒ `round(x/inf)*inf = NaN` ⇒ nền ra một màu phẳng. Editor thì đúng.
   - Snap texel viết nhầm chỗ: snap UV cuối cùng là vô nghĩa vì point sampling vốn đã làm tròn UV.
   - `_Scroll * _Time.y` phình mãi, chạy lâu thì cú trôi giật thành nấc. Phải tự quấn về một chu kỳ.
5. **Cách hai: bỏ shader, di chuyển sprite.** Một hướng, một tốc độ, và cứ đi hết một ô thì kéo về. `SpriteRenderer` kiểu Tiled với material mặc định.
6. Vì sao cách hai tốt hơn ở đây: lớp nền đi qua **đúng đường render mà tilemap và nhân vật đang đi**. Một tấm nền vẽ bằng UV tự tính có thể lệch nhịp với phần còn lại của màn hình; một tấm nền **là sprite** thì không thể.
7. **"Nhòe" hoá ra không phải nhòe.** Người chơi báo nền bị nhòe. Importer đúng chuẩn (Point, không mip, RGBA32 — giống hệt tile). Nguyên nhân nằm ở **bảng màu của asset**: hoa văn chỉ có 2 màu chênh nhau 18, nhân tint 0.24 còn chênh 4, rồi chồng thêm một lớp nữa. Cách phân biệt rẻ nhất: đếm số màu trong một mảng ảnh — nhòe do filter cho hàng chục màu, bóp tương phản vẫn cho đúng hai.

**Bằng chứng:** tốc độ đo 0.6000001 u/s so với đặt 0.6; `Drift` luôn trong [0, 4); parallax transform lệch đúng −1.400 u = 4 × 0.35; đếm màu vùng nền ra **đúng 2**.

**Bố cục:** so sánh hai cách ở mục 6 dưới dạng bảng (ai lo snap pixel, ai lo kích thước texture, ai lo số phình). Ảnh phóng to cạnh hoa văn ở mục 7.

**Đạt khi:** đứng yên vẫn thấy nền trôi chậm; đi ngang thì nền trôi chậm hơn nền đất; phóng to thì cạnh vẫn là bậc thang pixel sắc, không có màu trung gian.

**Ghi chú biên tập:** đây là bài dễ bị cắt nhất vì "dài mà kết quả nhỏ". Không nên cắt. Nó là bài duy nhất dạy được cách **quyết định bỏ một giải pháp đang chạy**, và lý do bỏ không phải "sai" mà là "bắt mình làm lại việc đã có sẵn".

---

## #15 — Nhiều màn, HUD, và build lên web

**Vật liệu:** journal 14 + phần thanh máu của journal 15.

**Câu hỏi trung tâm:** biến một phòng lab thành thứ người lạ mở lên chơi được.

**Mục lục đề xuất:**

1. `LevelCatalog` — thêm màn = sửa một asset, không sửa script nào. Đối chiếu bảng wave của shmup #7.
2. `GameProgress` static + PlayerPrefs. **Vì sao không làm singleton MonoBehaviour**: nó không có state cần nằm trong scene, và singleton chỉ thêm đúng một vấn đề — thứ tự khởi tạo.
3. `LevelRunner`: nghe `RoomCompleted` (bài 9) và `Defeated` (bài 12). Cùng quy tắc bài 13 — nghe, đừng thò tay vào.
4. HUD: Canvas 512×288, `referencePixelsPerUnit` 16, 9-slice border 6 px.
5. **Thanh máu boss dùng `Slider`, không dùng `Image.fillAmount`.** `Type.Filled` **bỏ qua** `spriteBorder`: nó kéo giãn cả texture nên plate pixel 17×17 ra thành vệt nhoè, mất góc. `Sliced` và `Filled` là hai giá trị của **cùng một enum** — chọn cái này là mất cái kia. Slider đổi chiều rộng của `fillRect`, mà `Sliced` cắt lại ở bất kỳ chiều rộng nào.
6. **Thứ đang nghe sự kiện phải luôn sống.** `BossHealthBar` tắt chính GameObject của mình ⇒ `OnDisable` huỷ đăng ký ⇒ boss trúng đòn không ai nghe ⇒ thanh máu không bao giờ hiện lại. Tách phần nhìn thấy được ra một object con.
7. Màn chọn màn dựng lúc chạy từ catalog.
8. Build WebGL: checklist sáu dòng, mỗi dòng đều đã từng làm mất thời gian — `productName`, compression, template path, scene trong Build Settings, chỗ đặt file, mục trong registry.
9. **Khung nhìn phải khoá bằng crop frame.** Không crop thì `PixelPerfectCamera` lấy nguyên khung cửa sổ rồi mới chia zoom: Editor ở 1536×864 thì đúng 32×18, trình duyệt ở 1600×900 ra **40 × 22.5** — rộng hơn thiết kế 25%. Editor chạy đúng không chứng minh được gì cho WebGL.

**Bằng chứng:** luồng màn 1 `gem 0/5 → 5/5 → ALL GEMS → ROOM COMPLETE → EXIT ENTERED`, `cleared[0]=True`; thanh máu giữ góc 9-slice ở cả 4 mức máu kể cả khi fill chỉ còn 7.8 px.

**Bố cục:** bảng checklist build ở mục 8. Ảnh đối chiếu thanh máu `Filled` nhoè vs `Slider + Sliced` sắc ở mục 5. Bảng Editor vs Browser ở mục 9.

**Đạt khi:** mở link trên máy người khác, chọn màn, chơi hết màn 1, bấm "Màn tiếp" và màn 2 mở khoá.

---

## #16 — Sáu lỗi không lỗi nào hiện ra trong Console

**Vật liệu:** journal 15 + 16. Đây là bài đắt nhất series.

**Câu hỏi trung tâm:** làm sao tự tìm ra lớp lỗi mà Unity không bao giờ báo?

Bài này **không phải danh sách bug đã sửa** — mọi bản sửa đã nằm trong bài sở hữu hành vi. Nó dạy **cách soát**.

**Mục lục đề xuất:**

1. Mở bằng một câu có thật: sau 14 chặng, một script soát toàn bộ 18 scene in ra `CLEAN across all 18 scenes`. Người chơi đầu tiên mở game lên và **không thắng nổi**.
2. Vì sao: script đó soát *hình học*. Nó không soát *luật chơi*, và chưa một lần đi bộ từ chỗ spawn tới cửa thoát. **Test của bạn chỉ chứng minh được cái mà nó có đo.**
3. **Công cụ 1 — đọc alpha thật, không tin ô sprite.** Ô 32×32 không có nghĩa nhân vật cao 32 px. Script đọc alpha từng sprite, đổi ra toạ độ thế giới, so với collider. Chạy **trong Play mode**, vì collider của charger/cannon/boss chỉ gán trong `Awake`.
4. **Công cụ 2 — hỏi thẳng bảng va chạm.** Với mỗi object người chơi phải chạm, hỏi `Physics2D.GetIgnoreLayerCollision`. Một layer sai không gây lỗi, không ghi log, chỉ làm cả màn chơi không thể hoàn thành.
5. **Công cụ 3 — chơi bằng input thật.** Trước đó mọi test đều gọi `room.Complete()` thẳng tay; game chỉ từng được chứng minh qua **API của nó**, chưa bao giờ qua **đường người chơi đi**. Một lần chạy bằng input lộ ra ba lỗi trong sáu giây.
6. **Một họ lỗi: giả định thứ tự khởi tạo.** Bốn lần trong hai chặng cuối — seed máu boss, thanh máu tự tắt, đồng hồ ngọc `0/0`, `SpriteSequence` null. Ba cách chữa, mỗi cách hợp một tình huống: đọc trong `Start`, phát lại sự kiện khi dữ liệu đổi, lấy tham chiếu theo kiểu lười.
7. **Một họ lỗi nữa: alias khi đo.** Đo một đại lượng tuần hoàn trong cửa sổ dài hơn chu kỳ của nó thì ra số vô nghĩa. Gặp ba lần: parallax ra 0.75 thay vì 0.25, tốc độ nền ra 0.097 thay vì 0.6, và hai lớp chồng nhau ra 0.48.
8. **Và một chỗ không đo được.** `_PixelSnap` giữ lại vì lập luận đúng, không phải vì đã đo được — hoa văn vạch chéo không đủ sắc để phân biệt 2.25 px với 3 px. Nói rõ chỗ nào đã chứng minh, chỗ nào mới chỉ suy luận.

**Bố cục:** ba công cụ là ba mục ngang hàng, mỗi mục một đoạn code ngắn và một output thật. Bảng Physics2D matrix với ô `Player × Default` khoanh đỏ ở mục 4.

**Đạt khi:** người đọc chạy được ba phép soát đó trên project của chính họ.

**Ghi chú biên tập:** bài này phải **thật thà tuyệt đối**. Giá trị của nó nằm ở chỗ tác giả kể một kết luận quá tự tin của chính mình rồi kể ai đã chứng minh nó sai. Làm mềm đi là mất hết.

---

## Bảng fold: sửa của chặng 15–17 đi về đâu

| Phát hiện | Journal | Fold vào bài |
|---|---|---|
| Pivot ở đáy, đọc từ alpha | 15 | **#0** (lúc import) |
| Collider theo hình vẽ, không theo ô — thùng | 16 | **#9** |
| Collider theo hình vẽ — boss lệch 0.78 u | 15 | **#12** |
| Layer `Interactable`, bảng va chạm | 16 | **#9** |
| `Dangerous` ≠ `Vulnerable` | 16 | **#12** |
| Bất tử 1.2 s sau hồi sinh | 16 | **#8** |
| Checkpoint tránh đường tuần của địch | 16 | **#8** |
| `RoomState.Register` phát `GemChanged` | 16 | **#9** |
| Probe suy chiều cao từ collider | 15 | **#12** |
| `Slider` thay `Image.fillAmount` | 15 | **#15** |
| PPC crop frame, khung nhìn 32×18 | 15 | **#0** (setup) và **#15** (kiểm trên build) |
| Sorting layer dùng đúng tên | 15 | rải vào #9, #10, #13 khi object xuất hiện |
| Ba công cụ soát | 15, 16 | **#16** |
| Alias khi đo | 16, 17 | **#16** |
| Shader → sprite | 17 | **#14** |

Nguyên tắc: **không bài nào dạy một thứ rồi hẹn bài sau sửa.**

---

## Việc phải làm trước khi viết

1. **Chụp lại toàn bộ ảnh từ chặng 10 trở đi.** Mọi ảnh hiện có đều chụp trước khi sửa pivot, nên địch đang lún chân 8 px.
2. **Bổ sung ~75 ảnh** theo mục "Ảnh cần chụp" của từng journal. Ưu tiên 6 ảnh đắt nhất: đồ thị vy(t) cut sai vs đúng (#3), đồ thị camY(t) K vs K2 (#5), Animator 0 transition (#6), gizmo collider bẫy sai vs đúng (#8), gizmo probe địch (#10), bảng va chạm khoanh ô (#9).
3. **Vẽ 8 sơ đồ**: cây quyết định ba loại nhảy (#4), hai tầng camera (#5), bảng suy state (#6), `StompCheck` (#9), state machine charger (#11), vòng trận boss (#12), gameplay → GameFeel (#13), rút gọn công thức parallax (#14).
4. **Quyết định cách phát hành snapshot code.** Journal có 40 file `.cs.txt` trong `Assets/_Platformer/Journal/`. Phải chốt: tag git mỗi bài, hay một repo riêng. Series shmup hứa tag từng bài rồi không làm — đừng lặp lại.
5. **Chốt lại vị trí gem.** Journal 09 ghi 2 trong 5 gem lấy được mà không cần nhảy. Sửa bố cục trước khi viết #9.
6. **Viết phụ lục "cách mình đo"** cho ai tò mò về `MotionRecorder` / `Playtest` — để nó không chen vào luồng học chính.
