---
title: "Platformer #2: Chạy, và vì sao Rigidbody để Dynamic"
date: "2026-09-28"
lang: vi
series: "platformer"
order: 2
excerpt: "Đưa nhân vật vào phòng, để vật lý lo trọng lực và va chạm, còn code chỉ lo vận tốc ngang. Tăng tốc 0.12 s, dừng 0.08 s, nhả phím trượt thêm 0.27 unit, tất cả đo được."
coverImage: "/images/posts/unity-platformer/02/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Rigidbody2D", "Input System", "Tutorial"]
published: true
featured: false
---

Căn phòng ở bài 1 đã có sàn liền mạch. Bài này đặt nhân vật vào phòng và cho nó chạy trái phải bằng bàn phím hoặc tay cầm. Hết bài, nhân vật tăng tốc tới 9 unit/giây trong 0.12 giây, nhả phím thì dừng trong 0.08 giây, và bạn sẽ đo được đúng mấy con số đó chứ không phải đoán theo cảm giác.

![Nhân vật đứng trên sàn của căn phòng](/images/posts/unity-platformer/02/player-in-room.webp)

## Input Actions: Move và Jump

Game đọc phím qua Input System. Mình khai báo luôn cả hai action mà series cần, dù bài này mới dùng một cái.

Trong `Assets/_Platformer/Input`, chuột phải chọn **Create > Input Actions**, đặt tên `PlatformerControls`, rồi bấm đúp để mở. Ở cột **Action Maps**, bấm dấu **+** và đặt tên map là `Gameplay`. Trong map đó tạo hai action:

- `Move`: Action Type `Value`, Control Type `Vector 2`. Thêm binding bằng dấu **+** cạnh tên action, chọn **Add Up/Down/Left/Right Composite** hai lần (một cho WASD, một cho bốn phím mũi tên), rồi thêm `Left Stick [Gamepad]` và `D-Pad [Gamepad]`.
- `Jump`: Action Type `Button`, binding `Space [Keyboard]` và `Button South [Gamepad]`.

![Input Actions Editor: map Gameplay, action Move với WASD, Arrows, Left Stick, D-Pad và action Jump với Space, Button South](/images/posts/unity-platformer/02/input-actions.webp)

Bấm **Save Asset** ở góc trên phải trước khi đóng cửa sổ.

`Move` là Vector 2 dù nhân vật chỉ đi ngang, vì stick và D-pad vốn trả về một vector hai chiều. Để nguyên như vậy thì một action đọc được cả bàn phím lẫn tay cầm, còn code chỉ lấy thành phần `x`. `Jump` khai báo sẵn để bài 3 dùng.

## Layer cho nhân vật

Bài 1 đã có layer `Ground` cho tilemap. Mở **Edit > Project Settings > Tags and Layers**, thêm layer vật lý `Player` vào một ô User Layer trống, và thêm sorting layer `Player` ở mục **Sorting Layers**.

![Tags and Layers: Sorting Layers có Player, Layers có Player và Ground](/images/posts/unity-platformer/02/tags-layers.webp)

Project của mình có thêm vài layer của game khác và của các bài sau, bạn chỉ cần `Ground` và `Player` lúc này. Sorting layer và layer vật lý là hai hệ khác nhau dù trùng tên: sorting layer quyết định cái gì vẽ đè lên cái gì, còn layer ở góc trên phải của GameObject quyết định physics và camera đối xử với nó thế nào. Sorting layer nằm dưới trong danh sách thì được vẽ sau, tức là đè lên trên. `Player` nằm dưới `Default` (sorting layer của tilemap), nên nhân vật luôn vẽ đè lên gạch.

## Nhân vật rơi xuống sàn trước khi có dòng code nào

Mở mũi tên cạnh `Idle.png`, kéo `Idle_0` vào scene và đổi tên thành `Player`. Đặt Position `(5, 6, 0)`, tức là lơ lửng trên sàn 4 unit. Ở Inspector, chọn Layer `Player`, và trong Sprite Renderer chọn Sorting Layer `Player`.

### Rigidbody 2D

Thêm **Rigidbody 2D** và đặt:

| Dòng | Giá trị | Vì sao |
|---|---|---|
| Body Type | Dynamic | Xem mục sau |
| Material | `PM_NoFriction` | Ma sát bằng 0, tạo ngay dưới bảng này |
| Gravity Scale | 4 | Số tạm, bài 3 sẽ thay bằng trọng lực tính từ độ cao nhảy |
| Collision Detection | Continuous | Vật rơi nhanh không xuyên qua sàn mỏng |
| Interpolate | Interpolate | Vẽ mượt giữa các bước vật lý, bài 5 camera cần cái này |
| Constraints > Freeze Rotation | Z | Không cho nhân vật bị lật khi vấp góc |

`PM_NoFriction` tạo bằng **Create > 2D > Physics Material 2D**, đặt Friction `0` và Bounciness `0`, rồi kéo vào ô Material. Ma sát bằng 0 nghe lạ với một nhân vật đứng trên sàn, nhưng vận tốc ngang do code quyết định hết nên ma sát không giúp gì, còn khi nhân vật ép vào tường lúc đang nhảy thì ma sát sẽ giữ nó dính trên tường. Bài 4 làm wall jump sẽ thấy rõ chuyện đó.

### Box Collider 2D theo thân, không theo ô

Thêm **Box Collider 2D**. Unity tự khớp nó với sprite và cho ra 2 × 2, tức là cả ô 32 × 32 pixel. Nhưng nhân vật không vẽ kín ô: phần thân nhìn thấy chỉ rộng 23 pixel và cao 28 pixel, còn lại là nền trong suốt.

![Bên trái collider tự khớp 2 x 2 rộng hơn thân nhân vật nhiều, bên phải collider 1.2 x 1.7 ôm sát thân; hộp vàng mỏng dưới chân là hộp dò đất](/images/posts/unity-platformer/02/collider-autofit-vs-body.webp)

Với collider 2 × 2, nhân vật sẽ chạm tường khi hình vẽ còn cách tường khoảng 0.3 unit, nhìn như bị một bức tường vô hình chặn lại. Đổi Size thành `1.2` × `1.7` và Offset thành `(0, 0.85)`.

Offset Y bằng đúng nửa chiều cao là nhờ pivot đặt ở chân ở bài 0: collider bắt đầu từ `y = 0` của nhân vật và cao lên 1.7, đáy collider trùng chân nhân vật. Chiều rộng 1.2 hơi hẹp hơn thân 1.44 một chút, vì hai cánh tay chìa ra hai bên. Để collider hẹp hơn tay thì khi áp sát tường, tay có thể chồng lên gạch một chút, nhưng nhân vật không bị vướng tay vào mép bệ lúc nhảy lên.

![Inspector của Player: Rigidbody 2D Dynamic với PM_NoFriction, Gravity Scale 4, Continuous, Interpolate, Freeze Rotation Z; Box Collider 2D offset 0 0.85, size 1.2 1.7](/images/posts/unity-platformer/02/player-physics-inspector.webp)

Bấm Play. Nhân vật rơi xuống và đứng yên trên sàn. Chọn nó trong lúc Play, Position Y phải là khoảng `2.015`, tức là chân nằm trên mặt sàn ở y = 2, cộng khoảng đệm va chạm 0.015 giống bài 1. Chưa có dòng code nào nhưng trọng lực, va chạm với sàn và việc đứng yên đã chạy. Đó là lý do chọn Dynamic.

## Dynamic hay Kinematic

Rigidbody 2D có ba kiểu. `Static` cho thứ không bao giờ động đậy, như sàn ở bài 1. Hai kiểu còn lại là lựa chọn thật sự cho nhân vật:

- `Kinematic`: vật lý không đẩy nó. Không trọng lực, không bị sàn chặn, code phải tự tính mọi thứ và tự kiểm tra va chạm.
- `Dynamic`: vật lý lo trọng lực và va chạm. Code chỉ đặt vận tốc, việc nhân vật đứng trên sàn hay bị tường chặn là việc của physics.

Bạn nào đọc series shmup sẽ nhớ ở đó mình dùng Kinematic và `MovePosition`. Con tàu trong shmup không có trọng lực, không đứng lên vật gì, và chỉ cần bị giữ trong khung màn hình, nên tự tính vị trí là gọn nhất. Platformer thì ngược lại: trọng lực, đứng trên sàn, đụng tường, trượt dọc tường đều là việc physics làm sẵn và làm đúng. Dùng Kinematic ở đây nghĩa là tự viết lại tất cả những thứ đó.

Cái giá của Dynamic là bạn không đặt vị trí trực tiếp được nữa. Code chỉ được đụng vào vận tốc, rồi để physics tính ra vị trí.

## PlayerMotor

Script này làm ba việc: đọc phím mỗi frame, kiểm tra chân có đang chạm đất không, và đẩy vận tốc ngang về phía tốc độ mong muốn mỗi bước vật lý.

Tạo `Assets/_Platformer/Scripts/Player/PlayerMotor.cs`:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace Platformer.Player
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D))]
    public sealed class PlayerMotor : MonoBehaviour
    {
        [Header("Input")]
        [SerializeField] private InputActionAsset controls;

        [Header("Run")]
        [SerializeField, Min(0f)] private float moveSpeed = 9f;
        [SerializeField, Min(0.01f)] private float accelTime = 0.12f;
        [SerializeField, Min(0.01f)] private float decelTime = 0.08f;

        [Header("Ground check")]
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private Vector2 groundBoxSize = new Vector2(1.0f, 0.1f);
        [SerializeField, Min(0f)] private float groundBoxOffset = 0.05f;

        public bool IsGrounded { get; private set; }
        public float MoveInput { get; private set; }
        public int FacingSign { get; private set; } = 1;
        public Vector2 Velocity => body.linearVelocity;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private InputAction moveAction;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            box = GetComponent<BoxCollider2D>();
            moveAction = controls.FindAction("Gameplay/Move", throwIfNotFound: true);
        }

        private void OnEnable() => moveAction.Enable();
        private void OnDisable() => moveAction.Disable();

        private void Update()
        {
            MoveInput = moveAction.ReadValue<Vector2>().x;
            if (Mathf.Abs(MoveInput) > 0.01f) FacingSign = MoveInput > 0f ? 1 : -1;
        }

        private void FixedUpdate()
        {
            IsGrounded = CheckGround();

            var v = body.linearVelocity;
            v = ApplyRun(v);
            body.linearVelocity = v;
        }

        private bool CheckGround()
        {
            var b = box.bounds;
            var centre = new Vector2(b.center.x, b.min.y - groundBoxOffset);
            return Physics2D.OverlapBox(centre, groundBoxSize, 0f, groundMask) != null;
        }

        private Vector2 ApplyRun(Vector2 v)
        {
            var target = MoveInput * moveSpeed;
            var hasInput = Mathf.Abs(MoveInput) > 0.01f;
            var rate = hasInput ? moveSpeed / accelTime : moveSpeed / decelTime;
            v.x = Mathf.MoveTowards(v.x, target, rate * Time.fixedDeltaTime);
            return v;
        }

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null) return;
            var b = bc.bounds;
            Gizmos.color = Application.isPlaying && IsGrounded ? Color.green : Color.yellow;
            Gizmos.DrawWireCube(new Vector3(b.center.x, b.min.y - groundBoxOffset, 0f), groundBoxSize);
        }
    }
}
```

Có ba chỗ đáng giải thích.

### Đọc phím trong Update, đẩy vận tốc trong FixedUpdate

`Update` chạy mỗi frame, còn `FixedUpdate` chạy mỗi bước vật lý, mặc định 50 lần một giây (`Time.fixedDeltaTime = 0.02`). Hai nhịp này không khớp nhau: ở 144 frame/giây, nhiều frame trôi qua mà không có bước vật lý nào, còn ở 30 frame/giây thì một frame có thể chứa hai bước vật lý.

Với phím giữ như `Move` thì đọc ở đâu cũng ra cùng giá trị. Nhưng phím bấm một lần như `Jump` ở bài 3 thì khác: `WasPressedThisFrame` chỉ đúng trong đúng frame phím được nhấn, đọc trong `FixedUpdate` thì có lúc bỏ lỡ, có lúc đọc trùng hai lần. Nên mình giữ một quy ước cho cả script: input đọc trong `Update`, còn vận tốc chỉ đổi trong `FixedUpdate`, vì đó là lúc physics dùng tới nó.

Vậy `Update` chỉ ghi lại phím vào `MoveInput`, và `FixedUpdate` dùng giá trị đó để đổi vận tốc. `FixedUpdate` lấy vận tốc hiện tại, đưa qua `ApplyRun`, rồi ghi lại. Bài 3 sẽ chèn thêm `ApplyJump` và `ApplyGravity` vào đúng chỗ này, nên mình để sẵn dạng "lấy v, sửa v, ghi v".

### MoveTowards chứ không Lerp

`Mathf.MoveTowards(v.x, target, step)` đưa `v.x` về phía `target` đúng một khoảng `step`, không hơn. Với `moveSpeed = 9` và `accelTime = 0.12`, mỗi giây vận tốc tăng 9 / 0.12 = 75 unit/s, mỗi bước vật lý tăng 1.5. Sau đúng 6 bước, tức 0.12 giây, nó chạm 9 và dừng ở đó. Con số `accelTime` bạn gõ vào Inspector chính là thời gian thật.

`Mathf.Lerp(v.x, target, k)` thì khác, nó đi một tỉ lệ `k` của khoảng còn lại. Khoảng còn lại nhỏ dần nên bước cũng nhỏ dần, và về lý thuyết nó không bao giờ chạm đích. Bạn không thể nói "0.12 giây thì đạt tốc độ tối đa" với Lerp, chỉ có thể chỉnh `k` tới khi thấy vừa mắt.

`decelTime` tách riêng khỏi `accelTime` vì cảm giác lúc bắt đầu chạy và lúc dừng là hai chuyện khác nhau. Mình để dừng nhanh hơn tăng tốc (0.08 so với 0.12), nhả phím là nhân vật đứng lại gần như ngay.

### Kiểm tra chạm đất bằng OverlapBox

`CheckGround` hỏi physics: có collider nào thuộc `groundMask` nằm trong một hộp mỏng ngay dưới chân không. Hộp rộng 1.0 (hẹp hơn collider 1.2 một chút), dày 0.1, tâm nằm dưới đáy collider 0.05. Nó chính là hộp vàng trong ảnh collider ở trên.

Cách hay gặp khác là gắn một trigger collider con dưới chân rồi đếm `OnTriggerEnter` và `OnTriggerExit`. Nhưng trigger chỉ báo có chạm, không nói chạm cái gì, và object con phải luôn khớp kích thước với collider cha. `OverlapBox` là một dòng, lọc được theo layer, và vẽ được gizmo. Bài 4 sẽ dùng lại đúng cách này, xoay hộp sang hai bên để dò tường.

Bài này `IsGrounded` chưa ảnh hưởng tới chuyển động, nhưng bài 3 cần nó để biết khi nào được nhảy.

### Gắn vào Player

Thêm component `PlayerMotor` vào `Player`. Kéo asset `PlatformerControls` vào ô **Controls**, và ở **Ground Mask** chỉ chọn `Ground`.

![Inspector của Player Motor: Controls là PlatformerControls, Move Speed 9, Accel Time 0.12, Decel Time 0.08, Ground Mask Ground](/images/posts/unity-platformer/02/player-motor-inspector.webp)

Ground Mask để `Everything` là lỗi dễ mắc nhất ở đây. Khi đó hộp dò chạm ngay collider của chính nhân vật, và `IsGrounded` luôn đúng kể cả khi đang rơi.

## Chạy và đo

Bấm Play, bấm vào Game view để nó nhận phím, rồi giữ D hoặc mũi tên phải. Chọn `Player` trong Hierarchy thì hộp dò đất dưới chân chuyển màu xanh lá khi đang chạm sàn.

Mình ghi vận tốc ngang mỗi bước vật lý trong lúc giữ D một giây rồi nhả ra:

![Đồ thị vx theo thời gian: tăng từ 0 lên 9 trong 6 bước, giữ 9, rồi giảm về 0 trong 4 bước](/images/posts/unity-platformer/02/vx-graph.webp)

Mỗi chấm là một bước vật lý. Tăng tốc mất đúng 6 bước (0.12 giây), mỗi bước thêm 1.5. Nhả phím thì vận tốc giảm 2.25 mỗi bước và về 0 sau 4 bước (0.08 giây). Trong 4 bước đó nhân vật trượt thêm 0.27 unit, khoảng 4 pixel, chưa tới một phần ba ô gạch. Ở 9 unit/giây, băng qua căn phòng 64 unit mất khoảng 7 giây.

Thử đổi Decel Time thành `0.3` trong Inspector ngay lúc đang Play. Theo cùng công thức, vận tốc giảm 0.6 mỗi bước, mất 15 bước để dừng và trượt thêm khoảng 1.26 unit. Nhân vật sẽ có cảm giác như chạy trên băng. Muốn game cho cảm giác chắc tay thì decel ngắn, muốn trơn thì decel dài. Trả lại `0.08` sau khi thử xong, vì giá trị đổi trong Play mode sẽ mất khi thoát Play.

## Bậc thang chặn nhân vật lại

Giữ D chạy tiếp sang phải, nhân vật sẽ đứng khựng lại trước bậc thang ở x = 30:

![Nhân vật dừng sát bậc thang cao một ô](/images/posts/unity-platformer/02/blocked-by-step.webp)

Nhân vật dừng ở x = 29.385, mép phải collider nằm ở 29.985, sát mặt bậc. Đây là hành vi đúng. Rigidbody Dynamic không tự bước lên bậc, và bậc cao một ô trong game này là để nhảy qua. Một số game thêm cơ chế tự bước lên cho bậc thấp, nhưng lưới ở đây toàn ô vuông 1 unit, không có bậc nửa ô nào cần tới nó.

## Kiểm tra

- Nhân vật rơi từ y = 6 xuống và đứng yên ở y ≈ 2.015.
- Giữ phím phải hoặc trái thì chạy, đổi hướng tức thì. Tay cầm cũng chạy nếu bạn có.
- Nhả phím thì dừng gần như ngay, trượt chưa tới nửa ô.
- Hộp dò dưới chân màu xanh lá khi đứng trên sàn.
- Chạy vào bậc thang ở x = 30 thì dừng lại.

## Bài sau

Nhân vật đã chạy được nhưng chưa rời mặt đất. Bài 3 thêm nút nhảy, và thay vì chỉnh lực nhảy tới khi thấy vừa, ta sẽ tính trọng lực và vận tốc nhảy từ hai con số thiết kế: nhảy cao bao nhiêu ô và mất bao lâu để lên tới đỉnh.
