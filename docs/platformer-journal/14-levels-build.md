# 14 — Nhiều màn, chọn màn, HUD, build WebGL

Ngày dựng: 2026-09-19 · Scene `PLT_14_LevelSelect`, `PLT_14_Level1/2/3`

## Mục tiêu

Biến 13 chặng phòng lab thành một thứ người lạ mở lên chơi được: có màn, có chọn màn, có HUD, có lưu tiến trình, và chạy trên trình duyệt ở trang arcade của billthedev.com.

## Đã dựng

- `Scripts/Core/LevelCatalog.cs` — ScriptableObject liệt kê màn → `Journal/14_LevelCatalog.cs.txt`
- `Scripts/Core/GameProgress.cs` — static, PlayerPrefs → `Journal/14_GameProgress.cs.txt`
- `Scripts/Core/LevelRunner.cs` — một cái mỗi scene chơi được → `Journal/14_LevelRunner.cs.txt`
- `Scripts/UI/HudGems.cs`, `BossHealthBar.cs`, `LevelSelectScreen.cs` → `Journal/14_*.cs.txt`
- `Prefabs/UI/HUD.prefab` — đồng hồ ngọc, thanh máu boss, bảng qua màn
- `Prefabs/UI/LevelButton.prefab` — nút màn, dựng lúc chạy từ catalog
- `ScriptableObjects/Core/LevelCatalog.asset` — 3 màn
- 4 scene mới, đưa vào Build Settings đúng thứ tự
- Nền: `Art/Sprites/Backgrounds/1.png` vẽ theo kiểu **Tiled**, tô màu tối lại, `sortingOrder = -1000`
- Build WebGL → `BillPortfolio/public/webgl-games/platformer/Build` + một mục trong `registry.json`

Ba màn dùng chung **một tilemap** 64 × 36, khác nhau ở cái gì được đặt vào:

| Màn | Dựng từ | Có gì |
|---|---|---|
| 1 | `PLT_09_Collect` | Ngọc, hộp, bẫy, cửa thoát. Không địch |
| 2 | `PLT_11_EnemyTypes` | Thêm 3 jumper, charger, cannon, flyer |
| 3 | `PLT_13_Juice` | Thêm boss Brute, juice đầy đủ |

Mở khoá theo chuỗi: màn 1 luôn mở, màn n mở khi màn n−1 đã qua.

## Số đã chốt

| Thông số | Giá trị | Vì sao |
|---|---|---|
| Canvas reference resolution | 512 × 288 | Đúng khung camera, `matchWidthOrHeight = 1` (khoá theo chiều cao) |
| `referencePixelsPerUnit` | 16 | Bằng PPU của toàn bộ art |
| 9-slice border của nút | 6, 6, 6, 6 | Sprite 17 × 17, chừa viền 6 px mỗi bên |
| Ô lưới chọn màn | 48 × 48, cách 12 | 5 cột |
| `drainTime` thanh máu boss | 0.25 s | Đủ để mắt bắt được mức máu tụt |
| Nền: màu | (0.28, 0.33, 0.48) | Tối hơn hẳn foreground, không tranh mắt |
| Nền: kích thước | phòng + 8 u | Chừa dư cho camera shake |
| WebGL compression | Disabled | Giống shmup, để GitHub Pages phục vụ thẳng |
| Build | 50 MB (wasm 41 MB, data 10.7 MB) | |

## Kết quả đo

Toàn bộ luồng màn 1, chạy trong Play:

```
start:      level=0  hud='0/5'  exitOpen=False  panel=False
3 gems:     hud='3/5'          exitOpen=False
all gems:   hud='5/5'          exitOpen=True
exit:       finished=True  panel=True  cleared[0]=True  best=5
```

Màn 3, luật "phải hạ boss mới xong":

```
start:  barVisible=False
hit 1:  hp=2  barVisible=True   fill=0.67
tới cửa thoát khi boss còn sống: finished=False  bossDown=False
boss chết: hp=0  finished=True  cleared[2]=True
```

Chọn màn lúc chưa có tiến trình: `Built=3`, `Unlocked=1`, nút 2 và 3 khoá, có icon ổ khoá.

Build WebGL chạy thật trên trình duyệt (phục vụ `out/` ở localhost, mở trang arcade):

| Kiểm tra | Kết quả |
|---|---|
| Card trong arcade | Hiện đúng thumbnail, tag, mô tả |
| Khung nhìn trên web | ⚠️ lúc này là **40 × 22.5 u**, không phải 32 × 18 — [chặng 15](15-audit-pivot-collider-layer.md) sửa |
| Tải build | 4 file `Platformer.*` đều 200 |
| Màn hình chọn màn | Hiện, nút 1 mở, 2 và 3 khoá |
| Click nút 1 bằng chuột | Vào màn 1 |
| Giữ `D` | Người chạy, camera follow |
| `Space` | Nhảy, nhảy đôi |
| Ngọc | Chạy 7 khung hình đúng |

## Vấp

### 1. `OpenScene` làm mất asset đã load trước đó — reference ghi vào thành null, không một lời báo lỗi

Gán `LevelCatalog` cho `LevelRunner` ở cả 3 scene. Đọc lại ngay: **cả 3 đều null**. Không exception, không warning.

Nguyên nhân: mình `LoadAssetAtPath` cái catalog **một lần trước vòng lặp**. `OpenScene` dọn những asset chưa ai tham chiếu, ScriptableObject vừa load bị huỷ, và biến C# còn lại là một "fake null" của Unity — gán vào `objectReferenceValue` thì thành null.

Sửa: load asset **sau** `OpenScene`, trong từng vòng lặp.

```csharp
var sc = EditorSceneManager.OpenScene(path, OpenSceneMode.Single);
var cat = AssetDatabase.LoadAssetAtPath<LevelCatalog>(CatPath);   // sau, không phải trước
```

→ Chỉ gặp khi viết script dựng scene hàng loạt. Nhưng đáng nhắc: **luôn đọc lại reference sau khi gán** thay vì tin là nó đã vào.

### 2. Thanh máu boss tự tắt chính mình nên không bao giờ hiện lại được

`BossHealthBar.Awake` gọi `root.SetActive(false)` với `root = gameObject` (mặc định). Tắt object chứa listener ⇒ `OnDisable` chạy ⇒ huỷ đăng ký `HealthChanged` ⇒ boss trúng đòn, không ai nghe, thanh máu không bao giờ hiện.

Đo được: `hit 1: hp=2 barVisible=False`.

Sửa: tách phần nhìn thấy được ra một object con `Body`, component ở lại object cha luôn bật. Thêm `Debug.LogError` nếu ai đó trỏ `root` về chính nó.

→ Đây là **mặt kia** của bài học bài 11. Bài 11: tắt *component* không ngăn người khác gọi method public của nó. Bài 14: tắt *GameObject* thì huỷ luôn đăng ký sự kiện. Hai câu này nghe như mâu thuẫn, thật ra là cùng một quy tắc: `enabled` và `activeSelf` chỉ điều khiển việc Unity gọi callback, không điều khiển việc code khác gọi mình. Nên thứ *lắng nghe* phải luôn sống; thứ *nhìn thấy được* mới được tắt.

### 3. Đồng hồ ngọc đứng ở `0/0`

`HudGems.Start` đọc `room.GemsTotal`, nhưng ngọc tự đăng ký trong `Collectible.Start` của chính nó. Không có gì bảo đảm `Start` nào chạy trước.

Sửa: `RoomState.Register` phát luôn `GemChanged`. Tổng thay đổi cũng là một thay đổi.

→ Đây là file duy nhất của chặng trước mà chặng 14 phải sửa, và sửa đúng một dòng. Nên nói rõ trong bài: sự kiện đặt đúng chỗ thì lớp trên gắn vào được mà không phải đụng vào lớp dưới.

### 4. Ngọc suốt 6 chặng là một dải 7 khung hình

`Art/Sprites/Objects/Gems/N.png` là dải ngang 112 × 16, tức 7 khung hình 16 × 16. Lúc import hàng loạt ở chặng 00 nó bị để chế độ **Single**, nên mỗi viên ngọc trong game thật ra là **cả dải 7 viên**, rộng 7 world unit. Mọi ảnh chụp từ bài 09 tới bài 13 đều có nó, mình nhìn suốt mà không nhận ra — cứ tưởng đó là hai viên đặt cạnh nhau.

Kiểm lại cả thư mục `Objects`: mọi dải khác (`Boxes/*_Hit`, `Checkpoints/*`) đều đã cắt đúng. Chỉ `Gems` sót.

Sửa: cắt 6 file thành 7 khung, rồi gắn `SpriteSequence` cho ngọc ở **mọi** scene — hoá ra pack vẽ 7 khung là để ngọc lấp lánh.

→ Bài học không phải "nhớ cắt sprite", mà là **nhìn kỹ những gì mình đã quen mắt**. Bug này lộ ngay từ ảnh đầu tiên của bài 09.

### 5. `SpriteSequence` NullReference khi địch bật lên

Nhật ký Editor đầy `NullReferenceException` tại `SpriteSequence.Play` dòng 36, gọi từ `PatrolEnemy.OnEnable`, `ChargerEnemy.OnEnable`, `BossBrute.OnEnable`…

Trong **một** GameObject, Unity chạy `Awake` rồi `OnEnable` cho **từng component một**, theo thứ tự không xác định. Nên `PatrolEnemy.OnEnable` có thể chạy trước `SpriteSequence.Awake`, lúc đó `sr` vẫn null.

Sửa: lấy `SpriteRenderer` theo kiểu lười, không chỉ trong `Awake`.

```csharp
private SpriteRenderer Renderer => sr != null ? sr : (sr = GetComponent<SpriteRenderer>());
```

→ Cùng họ với vấp 2, vấp 3, và vấp 1 của bài 13. Bốn lần trong hai chặng cuối, đều vì **giả định thứ tự khởi tạo**. Bài nên gom lại thành một mục riêng: một component tự phục vụ được thì đừng phụ thuộc `Awake` của ai.

### 6. Đường template WebGL

Build đổ ở bước cuối:

```
Exception: Invalid WebGL template path: ...\WebGLTemplates\Default!
```

`PlayerSettings.WebGL.template` đang là `PROJECT:Default`, trỏ vào `Assets/WebGLTemplates/Default` — thư mục không tồn tại.

Thử `APPLICATION:Base` thì thành `...\WebGLTemplates\Base\Base`, thử `APPLICATION:Base/Default` thì thành `Base\Base/Default`. Unity 6.3 tự chèn `Base\`, và template thật nằm ở `Base/Default`, `Base/Minimal`, `Base/PWA`.

Giá trị đúng: **`APPLICATION:Default`**.

### 7. Một project, hai game, một `productName`

`PlayerSettings.productName` quyết định tên file build (`ShootEmUp.wasm` vs `Platformer.wasm`). Project này chứa cả hai series, nên phải đổi `productName` trước mỗi lần build, và **hiện đang là `Platformer`** — build lại shmup mà quên đổi thì ra bộ file sai tên, trang arcade tải 404.

→ Đáng nói trong bài: một repo lab nhiều game thì cần một script build đặt `productName` theo mục tiêu, đừng để trong PlayerSettings.

### 8. Phím bấm nhanh quá thì game không thấy

Test build trong trình duyệt: gửi 25 lần nhấn `D`, người chơi đứng im. Không phải lỗi build.

`PlayerMotor` đọc `moveAction.ReadValue<Vector2>().x` mỗi frame. Một cú nhấn-nhả gọn trong khoảng giữa hai frame thì cả hai frame đều đọc ra 0. Phải **giữ** phím: dispatch `keydown`, chờ, rồi `keyup`. Giữ 1.2 s thì người chạy đúng.

→ Không phải bug của game, nhưng là bẫy của việc test tự động. Và nó nhắc lại vì sao `MotionRecorder` ở bài 02 phải lái input theo lịch fixed-step chứ không theo frame.

## Ảnh cần chụp

- [x] `14_level_select.png` — lưới chọn màn, màn 1 mở, 2 và 3 có ổ khoá
- [x] `14_clear_panel.png` — bảng "Qua màn!" với hai nút
- [x] `14_boss_bar.png` — thanh máu boss tụt còn 2/3
- [x] `14_background.png` — phòng có nền, trước/sau
- [ ] Inspector `LevelCatalog` với 3 mục
- [ ] Build Settings với 4 scene đúng thứ tự
- [ ] Hierarchy `HUD` cho thấy `BossBar` → `Body` (lý do ở vấp 2)
- [ ] Ảnh so sánh ngọc: dải 7 khung vs một viên đã cắt (vấp 4)
- [ ] Trang arcade billthedev.com có card Platformer
- [ ] Game chạy trong trình duyệt, chụp màn hình thật

## Ghi cho người viết bài

**Đây là bài "đóng gói", không phải bài "tính năng".** Người đọc đã có một phòng chơi được từ bài 13. Bài 14 trả lời câu hỏi khác: làm sao biến nó thành thứ gửi cho người khác chơi. Ba việc: chia màn, lưu tiến trình, build ra web.

**Mở bài bằng `LevelCatalog`.** Thêm màn = sửa một asset, không sửa script nào. Đối chiếu với cách làm sai mà đa số người mới chọn: `if (levelIndex == 0) LoadScene("Level1")`. Giống hệt bảng wave của shmup #7 — nên nhắc lại liên hệ đó.

**`GameProgress` cố ý là static.** Nói rõ vì sao **không** làm singleton MonoBehaviour: nó không có state cần nằm trong scene, và một singleton chỉ thêm đúng một vấn đề — thứ tự khởi tạo. Mà thứ tự khởi tạo chính là thứ đã cắn mình bốn lần ở hai chặng cuối.

**Bốn vấp về thứ tự khởi tạo nên gom thành một mục xương sống của bài**: boss health seed (13), thanh máu tự tắt (14), đồng hồ ngọc `0/0` (14), `SpriteSequence` null (14). Cùng một câu trả lời: đừng giả định ai chạy trước ai. Ba cách chữa, mỗi cách hợp một tình huống — đọc trong `Start`, phát lại sự kiện khi dữ liệu đổi, lấy tham chiếu theo kiểu lười.

**Chuyện ngọc là dải 7 khung nên kể thật.** Nó nằm trong mọi ảnh chụp từ bài 09 và mình không thấy. Bài viết hay thường giấu những chuyện này; giữ lại thì người đọc học được cách **soát lại asset đã import** chứ không chỉ soát code.

**Phần build WebGL nên có một checklist chạy được**: `productName`, compression, template path, scene trong Build Settings, chỗ đặt file, mục trong registry. Sáu dòng, và mỗi dòng đều đã từng làm mình mất thời gian.

**Kết series bằng con số.** 14 chặng, 3 màn chơi được, 50 MB, chạy trên billthedev.com/arcade. Và nhắc `_Common`: `PrefabPool` từ shmup #4, `CameraShake` từ shmup, dùng lại nguyên vẹn cho game thứ hai. Đó là lập luận thuyết phục nhất cho việc viết code tách khỏi game ngay từ đầu.

## Chưa làm

- Nhạc nền — pack không có, và mình chưa tự làm
- Hạt bụi lúc tiếp đất/giẫm: `PooledParticle` đã nằm trong `_Common` nhưng chưa gắn
- Nền chưa có parallax (hiện là một lớp tĩnh)
- Chuyển phòng liền mạch (cửa nối phòng) — hiện là load scene, màn hình đen một nhịp
- Điều khiển cảm ứng cho điện thoại, `touch: false` trong registry
- Font pixel cho UI: hiện đang dùng LiberationSans của TMP, lệch tông với art
- Ba nhân vật của bài 07 chưa cho người chơi chọn trong game

## Đính chính (2026-09-29, lúc viết bài 15)

- Thêm chọn nhân vật (bài 07 đã hứa): `LevelCatalog.characters` (3 PlayerData), `GameProgress.SelectedCharacter/SelectCharacter` (key `plt.character`), `LevelRunner.ApplyCharacter()` trong `Start` (motor.Apply + animator.ApplyData), `LevelSelectScreen.BuildCharacters()` dùng chung prefab nút (portrait vào `Number`, `clearedIcon` vào `Badge`). Scene `PLT_14_LevelSelect`: Grid dời lên y 30, thêm `CharacterRow` (HorizontalLayoutGroup, y 88) và `CharacterLabel` (y 48).
- Đo trong Play: chọn Nhẹ → Level1 motor `moveSpeed 10.5`, `maxJumps 2`, controller `Player_Char2`, JumpVelocity 30.95. Nhặt 5 ngọc → exit mở → vào cửa: `finished=True`, `cleared0=True`, `best=5`. Level3: thanh máu hiện sau hit đầu, fill 129.33/194 px.
- Build WebGL giờ nằm trên Cloudflare R2 (commit dcae217), thư mục `public/webgl-games/*/Build/` bị gitignore.

Ảnh: `D:/Projects/Tutorial/TutorialShots/15/`.
