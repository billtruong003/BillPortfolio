---
title: "Shmup #2: Di chuyển tàu với Input System và Rigidbody2D"
date: "2026-09-15"
lang: "vi"
series: "shmup"
order: 2
excerpt: "Input Actions asset (Action Map, Composite, Control Scheme), đọc input trong script, Rigidbody2D Kinematic + MovePosition, và kẹp tàu trong màn hình tính từ camera."
coverImage: "/images/posts/unity-shmup/02/cover.webp"
category: "unity-dev"
tags: ["Unity", "Input System", "Rigidbody2D", "Player Controller", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- **Input System** (package mới): Action Map, Action, Binding, Composite, Control Scheme
- Đọc input bằng `InputActionAsset.FindAction` + `ReadValue<Vector2>()`
- **Rigidbody2D Kinematic** + `MovePosition` trong `FixedUpdate`: vì sao không gán `transform.position`
- Tính vùng camera thấy để kẹp tàu, không hard-code số
- Gắn reference asset vào field trên Inspector, và asmdef reference

Xong bài này: WASD / mũi tên / stick gamepad điều khiển tàu, tàu không bay ra khỏi màn hình. Action `Fire` khai báo sẵn cho bài 3.

![Di chuyển và chạm biên](/images/posts/unity-shmup/02/move_05_movement.webp)

## 1. Copy scene

Project → chọn `SEU_01_Scene` → Ctrl+D → đổi tên `SEU_02_PlayerMove`. Mỗi bài một scene để bạn mở đúng trạng thái bài đó.

## 2. Input Actions asset

`_ShootEmUp/Input` → Create → **Input Actions** → tên `ShmupControls`. Double click mở editor:

![Input Actions editor](/images/posts/unity-shmup/02/move_01_input-actions-editor.webp)

1. Action Maps → **+** → `Gameplay`. (Bài 8 thêm map `UI` riêng, để pause menu không bị phím bắn chen vào.)
2. Actions → + → `Move`, Action Type **Value**, Control Type **Vector 2**.
   - + cạnh Move → *Add Up/Down/Left/Right Composite* → tên `WASD`, gán W/S/A/D.
   - Thêm composite thứ hai `Arrows` cho 4 phím mũi tên.
   - + → *Add Binding* → `<Gamepad>/leftStick`.
3. Actions → + → `Fire`, Action Type **Button**. Binding: `<Keyboard>/space`, `<Mouse>/leftButton`, `<Gamepad>/buttonSouth`.
4. Góc trên phải → Control Schemes → thêm `Keyboard&Mouse` (Keyboard bắt buộc, Mouse optional) và `Gamepad`. Mỗi binding tick scheme tương ứng.
5. **Save Asset** (hoặc bật Auto-Save).

Hiểu thế nào:
- **Action** là ý định của người chơi ("Move", "Fire"), **Binding** là phím cụ thể. Code chỉ nói chuyện với Action, đổi phím hay thêm gamepad không sửa code.
- **Composite 2D Vector** gộp 4 phím thành 1 Vector2 (−1..1). Stick gamepad tự nhiên đã là Vector2.
- Value cho input liên tục (stick), Button cho nhấn/nhả.
- File `.inputactions` là JSON, git diff đọc được.

## 3. asmdef tham chiếu Input System

Code nằm trong assembly `ShootEmUp` (bài 1) nên **không thấy** `UnityEngine.InputSystem` cho tới khi thêm reference. Chọn `ShootEmUp.asmdef` → Assembly Definition References → **+** → `Unity.InputSystem` → Apply.

![asmdef reference](/images/posts/unity-shmup/02/move_02_asmdef-inspector.webp)

Không có bước này: `error CS0246: The type or namespace name 'InputSystem' could not be found`. Lỗi đầu tiên hầu như ai dùng asmdef cũng gặp.

## 4. Script PlayerMovement

`_ShootEmUp/Scripts/Player/PlayerMovement.cs`:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class PlayerMovement : MonoBehaviour
    {
        [SerializeField] private InputActionAsset controls;
        [SerializeField] private float speed = 8f;
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

        private void OnEnable()  => moveAction.Enable();
        private void OnDisable() => moveAction.Disable();

        private void Update()
        {
            moveInput = moveAction.ReadValue<Vector2>();
        }

        private void FixedUpdate()
        {
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

Điểm cần hiểu:
- **Đọc input ở `Update`, di chuyển ở `FixedUpdate`.** Input đến theo frame; physics chạy theo bước cố định 0.02 s. Đọc trong FixedUpdate có thể bỏ lỡ phím nhấn nhanh; di chuyển Rigidbody trong Update thì physics và render lệch nhau.
- `MovePosition` thay vì `transform.position =`: body Kinematic dùng MovePosition thì hệ physics biết nó "đang di chuyển" → trigger với vật khác tính đúng (bài 5), và Interpolate hoạt động.
- `throwIfNotFound: true`: gõ sai tên action sẽ nổ ngay ở Awake với thông báo rõ, thay vì null âm thầm.
- `OnEnable/OnDisable` bật tắt action: tắt object là ngừng nghe input.
- `cam.aspect` lấy tỉ lệ thật của Game view/màn hình → đổi sang 3:4 vẫn đúng biên.

Giới hạn (để bài sau): `CacheCameraBounds` chỉ tính một lần trong Awake. Bài 5 tách thành `ScreenBounds` dùng chung khi kẻ địch cũng cần.

## 5. Gắn component và reference

Chọn `Player` → Add Component `PlayerMovement`. `[RequireComponent]` làm Unity tự thêm **Rigidbody 2D**. Chỉnh Rigidbody:

| | Giá trị | Vì sao |
|---|---|---|
| Body Type | **Kinematic** | Dynamic bị physics đẩy, có trọng lực, quán tính — tàu shmup không cần. Kinematic: ta tự đặt vị trí, physics chỉ để phát hiện va chạm |
| Collision Detection | Continuous | Đạn nhanh không xuyên |
| Interpolate | Interpolate | Physics 50 Hz, màn hình 60–144 Hz; không interpolate thì tàu giật nhẹ |

Lúc này ô **Controls** còn trống:

![Trước khi gắn](/images/posts/unity-shmup/02/move_03_player-inspector-before-wire.webp)

Kéo asset `ShmupControls` từ Project window thả vào ô Controls (hoặc bấm ⊙ bên phải ô rồi chọn):

![Sau khi gắn](/images/posts/unity-shmup/02/move_04_player-inspector-after-wire.webp)

Quên bước này, Play sẽ báo `NullReferenceException` ở dòng `controls.FindAction`.

## 6. Chạy thử

Play → WASD. Tàu dừng ở mép nhờ `edgePadding`. Mình đo bằng script: Speed 8, giữ phím 1.3 s, x dừng ở **±3.30** = 4.5 − 1.2, y dừng ở **±7.00** = 8 − 1. Đúng công thức.

Chỉnh Speed trên Inspector trong lúc Play để cảm giác. Lưu ý giá trị chỉnh trong Play Mode **mất khi Stop** → nhớ số rồi nhập lại.

## Lỗi mình gặp

| Lỗi | Nguyên nhân | Sửa |
|-----|-------------|-----|
| `MissingComponentException: There is no 'Rigidbody2D' attached` khi viết `GetComponent<Rigidbody2D>() ?? AddComponent<...>()` | `??` so sánh null C#, nhưng `UnityEngine.Object` bị destroy/missing là **fake null**: object thật, `== null` trả true nhờ overload, `??` không dùng overload đó | Luôn viết `if (x == null)` với object Unity. Không dùng `??`, `?.` với Component, GameObject, ScriptableObject |
| Play, nhấn phím, tàu đứng yên | Game view không focus → Input System đưa phím vào Editor, không vào game (setting *Play Mode Input Behavior*) | Click vào Game view. Nếu test tự động: Project Settings → Input System Package → Play Mode Input Behavior = All Device Input Always Goes To Game View |

![Input System settings](/images/posts/unity-shmup/02/move_06_input-system-settings.webp)

## Bài sau

[Shmup #3](/lab/unity-shmup-03-shooting): prefab đạn, Instantiate, cooldown theo thời gian.
