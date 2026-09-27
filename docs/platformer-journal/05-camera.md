# 05 — Camera: bám, vùng chết, và biên phòng

Ngày dựng: 2026-09-19 · Scene `PLT_05_Camera`

## Mục tiêu

Camera theo nhân vật trong phòng 64×36 lớn hơn màn hình 32×18, không bao giờ lộ ra ngoài tilemap, không nhấp nhô theo cú nhảy, và dựng sẵn tầng cho shake ở bài 13 cắm vào mà không sửa gì.

## Đã dựng

- `Scripts/Level/RoomBounds.cs` → `Journal/05_RoomBounds.cs.txt`. Một Rect world-unit, gốc dưới trái, hàm `ClampCameraCentre(centre, halfW, halfH)`. Gizmo cyan quanh phòng.
- `Scripts/Camera/CameraFollow.cs` → `Journal/05_CameraFollow.cs.txt`. Nằm trên **CameraRoot**, ghi **world position** trong `LateUpdate`. `[DefaultExecutionOrder(100)]`.
- `MotionRecorder` v3 → `Journal/05_MotionRecorder.cs.txt`: ghi thêm `camX, camY` của CameraRoot mỗi step.
- Object `Room` tại (0,0) với `RoomBounds` 64×36. `CameraFollow` nối target=Player, motor, room, cam.

Kiến trúc hai tầng, mỗi tầng một người ghi:

```
CameraRoot   (world)  ← CameraFollow: dead zone → look-ahead → luật Y → smooth → CLAMP
  └ Main Camera (local 0,0,−10) ← bài 13: CameraShake ghi localPosition
```

Thứ tự trong `LateUpdate`:

1. Look-ahead: `currentLookAhead` SmoothDamp về `FacingSign × lookAhead`
2. Dead zone X: chỉ đuổi khi `(target.x + lookAhead) − cam.x` vượt ±1.5
3. Luật Y: theo `lastGroundedY` (cập nhật khi grounded hoặc wall-slide). Trên không thì đứng yên, **trừ khi** nhân vật rời quá 60% nửa chiều cao (5.4 u) → theo luôn để không mất người
4. **Clamp aim** vào phòng (trừ `shakeMargin` 0.35) → SmoothDamp về aim đã clamp → clamp lại lần cuối

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| deadZone | (1.5, 1.0) | Nhích nhẹ không kéo camera |
| smoothTimeX | 0.12 s | |
| smoothTimeY | 0.18 s | Y chậm hơn X, dọc nhìn thấy rung rõ hơn |
| lookAhead | 3 u | Nhìn trước 3 tile theo hướng chạy |
| lookAheadSmoothTime | 0.25 s | Quay đầu thì camera lướt sang, không giật |
| airborneFollowFraction | 0.6 | Rời 5.4 u khỏi tâm mới theo khi đang bay |
| shakeMargin | 0.35 | Clamp chặt hơn nửa màn hình 0.35 u ⇒ shake ±0.35 vẫn không lộ ngoài |
| Biên tâm camera thực tế | x ∈ [16.35, 47.65], y ∈ [9.35, 26.65] | 16 + 0.35, 64 − 16.35 … |

## Kết quả đo

| Test | Kịch bản | Đo được |
|---|---|---|
| Khởi động | SnapTo player ở (6, 3) | Camera **(16.35, 9.35)**, `ClampedX = ClampedY = true` — đúng góc phòng |
| **I** chạy ngang | giữ phải 7.5 s, nhảy qua bậc x=30, tới tường khe x=48 | Rời clamp trái ở 1.08 s (player x≈15.3). Tới clamp phải ở 4.64 s, `maxCamX = 47.65` đúng. camY không đổi (đang ở clamp đáy). Player dừng 47.385 |
| Lead khi chạy ổn định | t = 1.5–2.2 s, v = 9 | Camera dẫn trước player **0.42 u** — không phải 1.5 |
| **J** nhảy tại chỗ | x=24, giữ nhảy 0.4 s | Player lên 5.22 u, **camY range = 0.000** |
| **K** rơi từ bệ 3 (bản đầu) | đứng y=18, đi phải rơi xuống sàn | Camera đứng yên tới khi player thấp hơn tâm 5.4 u (t=0.68) → theo. Chạm đất 0.98 → camera **13.46 → 9.35 trong 0.12 s** — giật |
| **K2** sau sửa | như K | 13.55 → 11.69 → 10.60 → 9.97 → 9.65 → … → 9.35 trong ~0.7 s. Bước lớn nhất 0.56 u/step. SnapTo ra thẳng x=44 (41 + 3) không pan sau đó |

## Vấp

### 1. Clamp sau smooth → giật khi đáp xuống gần biên

Bản đầu: SmoothDamp về aim (chưa clamp), rồi clamp kết quả. Đáp từ bệ 3 xuống sàn, aim Y = 3 + 1 = 4.0, nằm **dưới** biên 9.35. SmoothDamp lao về 4.0 với tốc độ lớn, clamp chặt ở 9.35 ⇒ 4 unit trong 2 step, nhìn như snap.

Sửa: **clamp aim trước**, smooth về aim đã clamp, clamp lại lần cuối (phòng trường hợp phòng đổi giữa chừng). Cùng một luật "clamp nói câu cuối", nhưng smooth phải hướng tới điểm đến được. K2 chứng minh: đường cong mũ đều tới 9.35.

→ Đây là chỗ đi xa hơn tutorial thường. Mọi tutorial đều viết `clamp(smooth(aim))`; ít ai để ý nó giật ở biên.

### 2. Look-ahead 3 nhưng đo chỉ dẫn trước 0.42

Ở v = 9 u/s, SmoothDamp τ = 0.12 s lag ≈ v·τ ≈ 1.08 u. Look-ahead 3 trừ dead zone 1.5 trừ lag 1.08 = 0.42. Đúng số đo.

Không phải lỗi, nhưng có nghĩa: look-ahead nhìn thấy rõ lúc **đứng lại rồi quay đầu** (camera lướt 3 u sang bên kia), còn lúc chạy đều thì phần lớn bị smoothing ăn mất. Muốn dẫn xa hơn khi chạy: tăng lookAhead hoặc giảm smoothTimeX. Con số hiện tại cố ý: chạy đều thì nhân vật gần giữa, quay đầu mới thấy camera "đón hướng".

### 3. SnapTo không có look-ahead → pan 1.5 u ngay sau khi snap

Test J: SnapTo (24, 3) rồi camera trôi 24 → 25.5 trong 1 s vì look-ahead bắt đầu từ 0 lướt lên 3. Sửa: SnapTo tính sẵn `currentLookAhead = FacingSign × lookAhead` và snap tới target + look. K2: snap ra thẳng 44 = 41 + 3.

→ Bài 08 (respawn) sẽ gọi SnapTo. Ghi nhớ: respawn mà camera pan là nhìn rất rẻ tiền.

### 4. Test J không công bằng — nhưng vẫn giữ

Nhảy tại chỗ ở y=3 thì camera đang bị clamp đáy 9.35, nên camY = 0 range có thể chỉ do clamp. Test K/K2 (camera ở 18, giữa phòng) mới thật sự chứng minh luật Y: 0.36–0.68 s player đã rơi 5 u mà camY vẫn 18.02. Bài nên dùng K2 làm bằng chứng, J chỉ để minh hoạ.

### 5. `Camera.aspect` chỉ đúng khi Game view đúng tỉ lệ

`HalfWidth = orthographicSize × cam.aspect`. Bài 00 đã ghi chuyện Game view sót 9:16 — nếu quên thì clamp X sai hoàn toàn. Recorder đọc `CameraRoot.position` chứ không đọc gì từ Camera nên số đo không lộ chuyện này. Nhắc lại trong bài.

### 6. Chưa đo với Pixel Perfect Camera snapping

Plan ghi bẫy PPC snap theo lưới pixel làm follow giật nấc. Setting hiện tại `m_PixelSnapping = false`, `m_UpscaleRT = false`, nên chưa thấy. Cần thử bật Pixel Snapping một lần và chụp lại — để bài 13 khi làm juice tổng thể, hoặc bổ sung khi viết bài 05.

## Ảnh cần chụp

- [x] `05_follow_midrun.png` — thực ra chụp lúc đã tới clamp phải: tường phải phòng nằm đúng mép màn hình, không lộ void. Dùng làm ảnh "clamp đúng"
- [ ] Scene view: gizmo dead zone (vàng) + khung camera (trắng) + RoomBounds (cyan) trong một ảnh
- [ ] Hierarchy CameraRoot → Main Camera với CameraFollow trên root
- [ ] Đồ thị camY(t) và y(t) chồng nhau từ K2: player rơi, camera đứng yên tới 0.68 rồi cong xuống
- [ ] Đồ thị camY(t) K vs K2: giật vs mượt — đây là ảnh đắt nhất bài
- [ ] Đồ thị camX(t) và x(t) từ I: hai đường song song cách 0.42, hai đoạn phẳng ở clamp
- [ ] Inspector CameraFollow

## Ghi cho người viết bài

**Mở bằng bài toán ba người ghi.** Follow, clamp, shake cùng muốn quyết định camera ở đâu. Cho cả ba ghi vào Main Camera là hỏng. Tách tầng: root cho follow+clamp, con cho shake. Bài 13 sẽ cắm shake vào mà không sửa dòng nào ở đây — nói trước điều đó ở bài 05.

**Dạy theo đúng thứ tự trong LateUpdate**, mỗi bước bật lên là một thứ nhìn thấy: (1) bám 1:1 → chóng mặt; (2) thêm dead zone → đỡ; (3) thêm SmoothDamp → mượt; (4) thêm luật Y → nhảy không nhấp nhô; (5) thêm clamp → không lộ void; (6) clamp aim trước smooth → không giật ở biên. Sáu bước, sáu lần bấm Play.

**SmoothDamp, không Lerp** — cùng lý do MoveTowards ở bài 02: Lerp theo frame phụ thuộc fps, SmoothDamp có thời gian đích thật và có velocity để đặt về 0 khi clamp (dòng `velocity.x = 0` khi ClampedX — thiếu dòng này camera "tích" vận tốc lúc đang bị chặn rồi bung ra khi hết chặn).

**Con số 0.42 vs 3 là chỗ người đọc sẽ nghi ngờ.** Cho họ đo hoặc ít nhất giải thích công thức v·τ. Không giải thích thì họ nghĩ look-ahead không chạy.

**Vì sao clamp trừ shakeMargin** — nói ở đây một câu, bài 13 sẽ dùng đúng số 0.35 làm biên độ shake tối đa.

## Chưa làm, để chặng sau

- Shake → 13
- Parallax background (6 lớp trong pack) — 13 hoặc bài riêng, không phải camera lesson
- Chuyển phòng (đổi `room` reference + SnapTo) → 14
- Thử PPC Pixel Snapping → 13
