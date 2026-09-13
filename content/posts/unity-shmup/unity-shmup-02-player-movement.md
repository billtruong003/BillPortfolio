---
title: "Shmup #2: Từ phím bấm đến vị trí tàu"
date: "2026-09-15"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-02-player-movement
series: "shmup"
order: 2
excerpt: "Theo dấu input qua Action, Vector2 và Rigidbody2D; tính biên camera để tàu di chuyển mà không rời màn hình."
coverImage: "/images/posts/unity-shmup/02/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Thiết bị</span><span>Binding</span><span>Move Action</span><span>Vector2</span><span>Vị trí mới</span></div>

## Bốn chặng giữa phím bấm và vị trí

Bấm phím D thì tàu chạy sang phải. Nghe hiển nhiên, nhưng từ lúc bạn bấm phím đến lúc tàu đổi vị trí, dữ liệu phải đi qua bốn chặng. Input System sinh ra để bạn không phải viết hai đoạn code khác nhau cho bàn phím và tay cầm.

Chuỗi đó thế này. Bàn phím báo rằng phím D đang được giữ. Một binding gắn phím đó với ý định `Move`. Action `Move` gộp mọi binding lại và trả về một `Vector2` giá trị (1, 0). Code lấy vector đó nhân với tốc độ và thời gian để tính ra vị trí mới. Nhờ lớp Action đứng giữa, code không cần biết người chơi đang bấm D hay đang đẩy stick.

Đầu vào là scene bài 1, lưu lại thành `SEU_02_PlayerMove`. Xong bài này: WASD, phím mũi tên hoặc stick đều lái được tàu, và tàu dừng lại ở mép khung thay vì bay ra ngoài.

## Tạo Move

Trong `_ShootEmUp/Input`, chọn Create → Input Actions và đặt tên **ShmupControls**. Mở asset đó lên, tạo Action Map tên **Gameplay**, rồi thêm Action **Move** với Action Type **Value** và Control Type **Vector2**.

Thêm một Up/Down/Left/Right Composite cho WASD, giữ chế độ **Digital Normalized**. Thêm composite tương tự cho bốn phím mũi tên, và một binding `<Gamepad>/leftStick`. Bấm Save Asset.

![Ba cột map, action và binding trong Input Actions editor](/images/posts/unity-shmup/02/move_01_input-actions-editor.webp)

Chưa tạo `Fire` ở đây, nó thuộc bài 3. Control Schemes cũng chưa cần, vì bài này đọc Action trực tiếp chứ không nhóm theo thiết bị.

Digital Normalized là lựa chọn đáng để ý. Nó chuẩn hoá vector về độ dài 1, nên giữ W và D cùng lúc không làm tàu đi chéo nhanh hơn đi thẳng. Bỏ chuẩn hoá thì đường chéo dài `√2 ≈ 1.41`, tức nhanh hơn 41%, và người chơi sẽ tự phát hiện ra mẹo đi chéo.

## asmdef phải tham chiếu Input System

Chọn `ShootEmUp.asmdef` trong Project window, tìm mục **Assembly Definition References**, bấm `+` và thêm **Unity.InputSystem**, rồi Apply.

![Unity.InputSystem trong danh sách reference của ShootEmUp.asmdef](/images/posts/unity-shmup/02/move_02_asmdef-inspector.webp)

Bước này nhỏ nhưng bỏ qua là kẹt. Package đã cài rồi mà assembly chưa tham chiếu tới thì code vẫn không thấy namespace, và Console chỉ báo `namespace UnityEngine.InputSystem could not be found`. Câu đó đọc như chưa cài package, nên phản xạ thường là đi cài lại. Gặp lỗi này thì kiểm tra reference ở đây trước.

## Đọc input mỗi frame, dời tàu mỗi bước physics

Tạo file hoàn chỉnh rồi mới gắn component. Script làm ba việc: đọc input, tính vị trí tiếp theo, và kẹp vị trí đó lại trong biên camera.

**Assets/_ShootEmUp/Scripts/Player/PlayerMovement.cs**

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class PlayerMovement : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Move action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("World units per second at full stick / key press.")]
        [SerializeField] private float speed = 8f;

        [Tooltip("Keep this much distance (world units) between the ship pivot and the screen edge.")]
        [SerializeField] private Vector2 edgePadding = new Vector2(1.2f, 1f);

        private Rigidbody2D body;
        private InputAction moveAction;
        private Vector2 moveInput;
        private Vector2 minBounds;
        private Vector2 maxBounds;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            moveAction = controls.FindAction("Gameplay/Move", throwIfNotFound: true);
            CacheCameraBounds();
        }

        private void OnEnable()
        {
            moveAction.Enable();
        }

        private void OnDisable()
        {
            moveAction.Disable();
        }

        private void Update()
        {
            moveInput = moveAction.ReadValue<Vector2>();
        }

        private void FixedUpdate()
        {
            CacheCameraBounds();
            var target = body.position + moveInput * (speed * Time.fixedDeltaTime);
            target.x = Mathf.Clamp(target.x, minBounds.x, maxBounds.x);
            target.y = Mathf.Clamp(target.y, minBounds.y, maxBounds.y);
            body.MovePosition(target);
        }

        private void CacheCameraBounds()
        {
            var cam = Camera.main;
            var halfHeight = cam.orthographicSize;
            var halfWidth = halfHeight * cam.aspect;
            var center = (Vector2)cam.transform.position;

            minBounds = center - new Vector2(halfWidth, halfHeight) + edgePadding;
            maxBounds = center + new Vector2(halfWidth, halfHeight) - edgePadding;
        }
    }
}
```

Điểm đáng nói nhất là input được đọc trong `Update` còn Rigidbody chỉ được dời trong `FixedUpdate`, và hai hàm đó chạy theo hai nhịp khác nhau. `Update` chạy mỗi khung hình, `FixedUpdate` chạy theo bước physics cố định. Ở 144 fps thì có những frame không kèm bước physics nào, ở 30 fps thì ngược lại, một frame có thể kèm nhiều bước.

Vậy nên `moveInput` được giữ lại giữa hai nhịp. Nếu đọc input thẳng trong `FixedUpdate`, một cú gõ thật nhanh rơi vào khoảng giữa hai bước physics sẽ không được đọc lần nào và mất hẳn. Còn nếu gọi `MovePosition` trong `Update`, Rigidbody bị dời giữa chừng một bước physics và va chạm ở bài 5 sẽ tính sai.

Riêng `Move` giữ được vector giữa hai nhịp vì nó là trạng thái đang giữ. Các thao tác kiểu nhấn một phát như `Fire` cần cách đọc khác, bài 3 sẽ dùng tới.

## Biên của tâm tàu khác biên của hình tàu

Camera bài 1 có nửa chiều rộng 4.5 và nửa chiều cao 8. Nếu để tâm tàu chạy tới X = 4.5 thì một nửa thân tàu đã nằm ngoài màn hình. Biên hợp lệ phải là biên camera trừ đi nửa kích thước tàu.

Với tàu rộng 2.4 và cao 2 units, Edge Padding (1.2, 1) cho ra vùng hợp lệ X từ −3.3 đến 3.3 và Y từ −7 đến 7. Hai dòng `Mathf.Clamp` giữ tâm tàu trong khoảng đó. Sprite hay scale khác thì đo lại nửa kích thước hiển thị thật rồi điền vào.

`CacheCameraBounds` được gọi lại mỗi bước physics thay vì tính một lần, để khung hình đổi tỉ lệ giữa chừng thì biên vẫn đúng. Nó giả định camera orthographic và không xoay. Bài 10 có rung camera, nhưng rung bằng một object con để toạ độ gameplay vẫn dựa trên một khung đứng yên.

## Ráp reference

Chọn `Player` và Add Component `PlayerMovement`. Vì script có `[RequireComponent(typeof(Rigidbody2D))]`, Unity tự thêm Rigidbody 2D luôn. Đặt **Body Type = Kinematic** và **Interpolate = Interpolate**.

Kinematic nghĩa là vị trí do code quyết định chứ không do trọng lực, đúng thứ ta cần. Để Dynamic thì tàu rơi xuống ngay khi bấm Play. Interpolate làm mượt hình vẽ giữa hai bước physics, nên tàu không rung khi fps cao hơn tần số physics.

Inspector lúc này có ô `Controls` đang để None:

![PlayerMovement với ô Controls chưa nối](/images/posts/unity-shmup/02/move_03_player-inspector-before-wire.webp)

Kéo **asset `ShmupControls` từ Project window** vào ô đó. Đây là asset nằm trong Project, khác với bài 3 khi bạn sẽ kéo một object từ Hierarchy vào ô `Muzzle`. Nối đúng thì chữ None đổi thành tên asset:

![PlayerMovement sau khi nối Controls](/images/posts/unity-shmup/02/move_04_player-inspector-after-wire.webp)

Đặt Speed 8 và Edge Padding theo kích thước tàu của bạn.

## Thử từng giá trị Vector2

Bấm Play, click vào Game view một cái rồi thử lần lượt. Cột giữa là thứ Action đang trả về, và bạn đối chiếu với thứ tàu đang làm:

| Thao tác | Vector2 mong đợi | Tàu phải làm gì |
|---|---|---|
| Không bấm gì | (0, 0) | Đứng yên |
| D | (1, 0) | Chạy sang phải |
| W | (0, 1) | Đi lên |
| W + D | Vector chéo dài 1 | Đi chéo, không nhanh hơn đi thẳng |
| Stick nghiêng nhẹ | Vector dài dưới 1 | Đi chậm hơn nghiêng hết |
| Đẩy vào bốn mép | Bị `Clamp` chặn | Dừng lại, không nhô ra ngoài |

![Tàu di chuyển trong khung](/images/posts/unity-shmup/02/move_05_movement.webp)

Thả phím là tàu phải dừng ngay, vì `ReadValue` trả về (0, 0).

## Tàu không nhúc nhích

Lỗi này có bốn nguyên nhân, kiểm tra theo thứ tự vì chúng nằm ở bốn tầng khác nhau:

1. **Chưa click vào Game view.** Khi Game view mất focus, Input System gửi phím cho Editor chứ không gửi cho game. Đây là nguyên nhân phổ biến nhất và cũng dễ sửa nhất.
2. **Chưa Save Asset sau khi tạo binding.** Input Actions editor không tự lưu, binding chỉ nằm trong cửa sổ.
3. **Ô Controls vẫn là None.** Script tìm Action trong một asset rỗng.
4. **Sai tên Action.** `FindAction("Gameplay/Move")` phân biệt hoa thường và phải khớp cả tên map lẫn tên action.

Nếu Console báo lỗi liên quan tới input backend, kiểm tra **Project Settings → Player → Active Input Handling**:

![Active Input Handling trong Player Settings](/images/posts/unity-shmup/02/move_06_input-system-settings.webp)

Còn nếu tàu chạy được nhưng bị cắt mất một phần hình ở mép, đó là lỗi khác hẳn: Edge Padding chưa khớp kích thước sprite. Hai triệu chứng này nằm ở hai tầng khác nhau nên đừng chữa bằng cùng một setting.

Bạn có thể đổi Speed ngay trong Play Mode để thử, nhưng nhớ nhập lại sau khi Stop vì Unity trả giá trị về như cũ.

Chuỗi từ input tới chuyển động đã nối xong. Bài sau dùng một Action mới để tạo ra object thay vì dời object.

## Mã nguồn chặng này

[Tải script bài 2](/downloads/shmup/lesson-02.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #3](/lab/unity-shmup-03-shooting).
