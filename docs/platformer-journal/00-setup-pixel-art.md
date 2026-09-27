# 00 — Setup, pixel art, phòng đầu tiên

Ngày dựng: 2026-09-19 · Unity 6000.3.10f1 · Project `D:/Projects/Tutorial`

## Mục tiêu

Có `_Platformer` nằm cạnh `_ShootEmUp` trong cùng project, 486 sprite nhập đúng pixel gốc, và một scene trống nhìn thấy đúng 32×18 unit.

## Đã dựng

- Thư mục `Assets/_Platformer/{Art/Sprites, Levels/Tiled, Scenes, Scripts, Prefabs, ScriptableObjects, Input}`
- Scene `Assets/_Platformer/Scenes/PLT_00_Setup.unity`
- `CameraRoot` tại (16, 9, 0) → con là `Main Camera` tại local (0, 0, −10)
- Camera orthographic, Size 9, Solid Color `#1A1C2C`
- `UnityEngine.Rendering.Universal.PixelPerfectCamera`: Assets PPU 16, Ref Resolution 512×288
- Game view size mới: `Platformer 512x288 x3` = 1536×864
- `ScaleProbe_Player` — object tạm để đo tỉ lệ, xoá trước khi sang chặng 01

## Số đã chốt

| Thông số | Giá trị | Lý do |
|---|---|---|
| PPU | 16 | Tile 16px ⇒ 1 tile = 1 unit, không phải quy đổi gì nữa |
| Camera Size | 9 | 18 unit cao × 32 unit ngang ở 16:9 |
| Ref Resolution | 512 × 288 | 32×18 tile × 16px |
| Game view | 1536 × 864 | Đúng 3× ref resolution, zoom nguyên |
| Player | 2 × 2 unit | 32px ÷ 16 PPU, cao đúng 2 tile |

## Vấp

### 1. Import mặc định phá sprite, không chỉ làm mờ

Project là template Universal **3D**, nên Unity nhập PNG với Texture Type = Default, Bilinear, Compressed, mipmap bật, PPU 100.

Hậu quả nặng hơn "trông mờ": `Player/Char1/Idle.png` gốc **352×32 bị nén xuống 256×32**. 352 không phải luỹ thừa 2, gặp nén là Unity scale lại — mất pixel thật, không khôi phục được bằng cách đổi Filter Mode.

Sửa hàng loạt cho 486 file: Sprite / Single / PPU 16 / Point / Uncompressed / mipmap tắt / RGBA32 / maxSize 2048. Sau đó `Idle.png` về đúng 352×32.

→ **Đây phải là mục mở đầu của bài 00.** Có ảnh trước/sau, và con số 352→256 là bằng chứng cụ thể hơn mọi lời khuyên "nhớ đổi Filter Mode".

### 2. Có hai component tên PixelPerfectCamera

`System.Type.GetType("...Universal.PixelPerfectCamera, Unity.RenderPipelines.Universal.Runtime")` trả về null. Quét assembly thì thấy **hai** type cùng tên:

- `UnityEngine.U2D.PixelPerfectCamera` trong `Unity.2D.PixelPerfect`
- `UnityEngine.Rendering.Universal.PixelPerfectCamera` trong `Unity.RenderPipelines.Universal.2D.Runtime` ← bản đúng cho URP

Trong Add Component hai cái này hiện tên giống nhau. Thêm nhầm bản 2D package vào project URP là một lớp bug im lặng.

→ Bài viết cần chỉ rõ chọn cái nào, kèm ảnh menu Add Component.

### 3. Game view còn sót 1080×1920 của shmup

Đây là cái mất thời gian nhất và cũng là cái đáng viết nhất.

Camera đặt Size 9, nhưng đo ra 60 unit cao. Nguyên nhân: Game view vẫn để **1080×1920** từ series shmup, tức aspect 9:16 dọc. PPC tính lại ortho theo khung dọc đó.

Đổi sang 1920×1080 thì đỡ hơn nhưng vẫn sai: ra 40×22.5 unit. Vì PPC ép **zoom số nguyên** — 1080 ÷ 288 = 3.75 nên nó lùi về 3×, hiện 360 art pixel thay vì 288.

Chốt 1536×864 = đúng 3× của 512×288 thì mới ra đúng 32×18.

→ Bài 00 phải có bước tạo Game view size riêng. Người đọc dùng project mới sẽ không gặp cảnh sót 9:16, nhưng **sẽ** gặp chuyện màn hình họ không chia hết cho 288.

### 4. PixelPerfectCamera không tính lại trong Edit mode

Sau khi đổi Game view, `Camera.orthographicSize` vẫn đọc ra 11.25 — giá trị cũ. Vào Play mode mới thành 9.

Nghĩa là con số trong Inspector lúc Edit **không phải** con số lúc chạy. Kiểm tra tỉ lệ bắt buộc phải làm trong Play mode.

→ Ghi vào phần verify của bài: "bấm Play rồi mới đo, đừng tin Inspector".

### 5. Sheet chưa cắt thì đo tỉ lệ ra số vô nghĩa

Probe đầu tiên báo player 22 × 2 unit. Cao đúng (2 tile) nhưng rộng 22 vì cả 11 frame Idle đang là một sprite Single.

Đã cắt luôn 60 sheet theo bảng ô đo được. Frame count khớp 100% với số đo từ kích thước file:

| Nhóm | Ô | Kết quả |
|---|---|---|
| Player ×3 | 32×32 | Idle 11 · Run 12 · Double_Jump 6 · Wall_Jump 5 · Hit 7 |
| Spawn VFX | 96×96 | Appearing 7 · Desappearing 7 |
| Jumper1 | 48×48 | Idle 11 · Run 12 · Jump 3 · Fall 3 · Hit 5 |
| Jumper2 | 48×48 | Idle 11 · Run 12 · Hit 5 |
| Charger | 48×48 | Idle 11 · Walk 12 · Charge 12 · Stun 8 · Hit 5 |
| Cannon | 48×48 | Idle 11 · Walk 12 · Attack 7 · Hit 5 |
| Flyer | 48×48 | Idle 6 · Fly 6 · Attack 8 · Hit 5 |
| **Brute** | **72×48** | Idle 11 · Run 12 · Attack 8 · Run_Attack 12 · Hit 5 |
| Boxes | 32×32 | Hit 3 (Idle/Break là 1 frame, giữ Single) |
| Checkpoints | 48×48 | 7 frame mỗi trạng thái |
| End | 64×64 | Idle 7 · Pressed 7 |
| Traps | 48×48 | 7 frame |
| Tileset | 16×16 | 176 ô |

**Brute là ô 72×48 chứ không vuông.** Cắt bằng 48×48 thì `Idle.png` 792 px không chia hết, Unity cắt lệch hết. Thư mục gốc của pack ghi "6 (48x72)" — ghi ngược so với cách Unity nhập số (width×height).

Cannonball1/2 (10×10 và 16×10) giữ Single, quá nhỏ để cắt lưới.

## Ảnh cần chụp

- [x] `Assets/_Platformer/Journal/00_camera_setup.png` — Game view lúc Play, đã có
- [ ] Texture Importer trước/sau khi sửa, cạnh nhau, zoom vào cạnh pixel
- [ ] Add Component menu cho thấy hai PixelPerfectCamera trùng tên
- [ ] Game view size dropdown có `Platformer 512x288 x3`
- [ ] Sprite Editor lúc slice Brute 72×48, so với cắt nhầm 48×48
- [ ] Hierarchy CameraRoot → Main Camera

## Ghi cho người viết bài

**Thứ tự mình làm ≠ thứ tự nên dạy.** Mình nhập asset trước rồi mới phát hiện import sai, rồi sửa. Bài nên đảo: cho người đọc nhập **một** sprite trước, thấy nó mờ và bị co, rồi mới sửa setting và nhập phần còn lại. Thấy lỗi trên máy mình rồi mới sửa thì nhớ lâu hơn.

**Việc cắt sheet đang nằm sai chỗ.** Mình cắt hết 60 sheet ở chặng 00 vì không cắt thì không đo được tỉ lệ. Nhưng bài 00 không cần 60 sheet — chỉ cần Idle của Char1 để kiểm tra 2×2 unit. Phần cắt còn lại đẩy sang bài 06 (Animation) đúng lúc cần. Riêng Tileset thì cắt ở bài 01.

**CameraRoot dựng sẵn từ bài 00 là cố ý.** Chưa có script follow nào, nhưng cấu trúc hai tầng phải có từ đầu để bài 05 và bài 13 cắm vào mà không phải dựng lại Hierarchy. Bài 00 chỉ cần một câu: "tầng này để dành cho camera follow ở bài 05". Đừng giải thích dài lúc chưa có gì follow.

**Câu người đọc chắc chắn hỏi:** "vì sao PPU 16 mà không phải 100 như bài shmup?" Trả lời ngắn: ở shmup sprite to và không có lưới; ở đây tile 16px, chọn PPU 16 để 1 tile = 1 unit, mọi phép tính sau đó là số nguyên. Nếu để 100 thì một tile = 0.16 unit và mọi toạ độ phòng thành số lẻ.

## Chưa làm, để chặng sau

- Xoá `ScaleProbe_Player`
- Tilemap và phòng thật → chặng 01
- Chưa có script nào trong `_Platformer/Scripts`

## Đính chính (2026-09-28, lúc chụp ảnh cho bài 00)

Đo lại bằng một bản copy của `Idle.png` với setting mặc định của project 3D:

| Setting | Kết quả |
|---|---|
| Default + Normal Quality (mặc định) | 256×32 DXT5 |
| Default + **Uncompressed** | **vẫn 256×32** |
| Default + Compressed + Non-Power of 2 = None | 352×32 |
| Sprite + Compressed | 352×32 DXT5 |
| Sprite + None | 352×32 RGBA32 |

→ Vấp 1 ghi sai nguyên nhân. File bị co là do **Non-Power of 2 = ToNearest** của Texture Type Default, không phải do nén. Đổi sang Sprite là tự tắt.

Nén vẫn phải tắt, nhưng vì lý do khác: DXT5 giữ đủ 352×32 mà đổi màu **5.201 / 5.343** pixel nhìn thấy được (97%), 11 màu gốc thành 154.

Template 2D (thử bằng `EditorSettings.defaultBehaviorMode = Mode2D`): Sprite, PPU 100, Bilinear, Compressed, NPOT None ⇒ 352×32 DXT5. Không co nhưng vẫn mờ và sai màu.

Thêm ba điều đo được khi chụp:

- PPC bản URP **không có** `Crop Frame X/Y` hay `Stretch Fill`. Crop Frame là dropdown (None / Pillarbox / Letterbox / Windowbox / StretchFill), snapping là dropdown `Grid Snapping`. Các trường bool trong vấp 5 của journal 15 là tên serialize nội bộ, không phải UI.
- Khi có PPC, mục Projection của Camera bị khoá xám, Size do PPC tự tính (288 ÷ 16 ÷ 2 = 9). Không cần gõ Size.
- PPC bản URP báo "requires a camera using a 2D Renderer" vì project dùng Universal Renderer. Đã đo: zoom nguyên, Windowbox và Pixel Snapping vẫn chạy (snap on mép sprite ở x=735, off ở x=736). Bản package 2D có chữ `(Script)`, cảnh báo vàng và nút Upgrade, không im lặng như vấp 2 ghi.
- Game view size lưu theo nền tảng build. Nhóm WebGL chưa có `Platformer 512x288 x3`, phải thêm lại.

Ảnh gốc: `D:/Projects/Tutorial/TutorialShots/00/`. Bản dùng trong bài: `public/images/posts/unity-platformer/00/`.
