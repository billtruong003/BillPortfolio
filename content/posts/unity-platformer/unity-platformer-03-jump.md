---
title: "Platformer #3: Nhảy cao đúng 5 ô, tính chứ không mò"
date: "2026-09-28"
lang: vi
series: "platformer"
order: 3
excerpt: "Muốn nhảy cao 5 ô thì đặt lực bao nhiêu? Bài này suy trọng lực và vận tốc nhảy từ hai con số thiết kế, rồi thêm nhảy thấp khi nhả sớm, coyote time và jump buffer. Mọi con số đều đo lại được."
coverImage: "/images/posts/unity-platformer/03/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Jump", "Game Feel", "Tutorial"]
published: true
featured: false
---

Nhân vật ở bài 2 đã chạy được. Giờ nó cần nhảy, và câu hỏi đầu tiên ai cũng gặp là: muốn nhảy cao 5 ô thì đặt lực nhảy bao nhiêu? Câu trả lời hay gặp là thử 10, thấp quá thì 15, cao quá thì 12. Làm vậy thì con số cuối cùng chỉ đúng với trọng lực lúc bạn thử, đổi trọng lực là phải mò lại từ đầu.

Bài này làm ngược lại: bạn quyết định nhảy cao bao nhiêu và mất bao lâu để lên đỉnh, rồi để công thức tính ra trọng lực và vận tốc nhảy. Sau đó thêm ba thứ làm cú nhảy dễ chịu: nhả phím sớm thì nhảy thấp, rời mép rồi mới bấm vẫn nhảy được, và bấm hơi sớm trước khi chạm đất vẫn không mất lệnh.

## Hai con số thiết kế

Bài 1 đặt bệ 1 cao hơn sàn đúng 5 ô. Mình muốn nhân vật nhảy lên được bệ đó, có dư một chút cho khỏi phải canh từng pixel, nên chọn:

- `jumpHeight = 5.5`: chân nhấc lên 5.5 unit khi giữ phím suốt cú nhảy.
- `timeToApex = 0.4`: mất 0.4 giây để lên tới đỉnh.

Hai con số này bạn hình dung được ngay: 5.5 ô, gần nửa giây. Còn trọng lực và vận tốc nhảy thì suy ra từ chúng.

Khi bật lên với vận tốc `v` và bị trọng lực `g` kéo xuống đều đặn, vận tốc giảm dần về 0 ở đỉnh. Thời gian lên đỉnh là `t = v / g`, và quãng đi lên là `h = v² / 2g`. Giải hai phương trình này theo `g` và `v`:

```
g = 2h / t²   = 2 × 5.5 / 0.4²  = 68.75 unit/s²
v = g × t     = 68.75 × 0.4     = 27.5 unit/s
```

Nếu muốn nhảy lên đỉnh nhanh hơn thì giảm `timeToApex`, công thức tự tăng cả trọng lực lẫn vận tốc để độ cao vẫn là 5.5. Bạn không bao giờ phải chỉnh riêng một con số rồi đi sửa con số kia cho khớp.

## Motor tự tính trọng lực

Trọng lực 68.75 tương đương `Gravity Scale = 7` trên Rigidbody 2D (vì trọng lực mặc định của Physics 2D là 9.81). Con số 7 đó chẳng nói gì với người đọc code, nên mình không dùng nó. Motor sẽ đặt `Gravity Scale = 0` và tự trừ trọng lực vào vận tốc mỗi bước.

Lý do thứ hai là mình muốn rơi xuống nhanh hơn lúc bay lên (nhân với `fallGravityMultiplier`) và giới hạn tốc độ rơi (`maxFallSpeed`). Nếu để Rigidbody lo trọng lực thì phải đổi Gravity Scale giữa chừng mỗi khi nhân vật bắt đầu rơi. Tự tính trong motor thì cả ba thứ nằm cạnh nhau trong một hàm, đọc là hiểu.

Rigidbody vẫn là `Dynamic`: va chạm với sàn và tường vẫn do physics lo, motor chỉ thay phần trọng lực.

## PlayerMotor với nhảy

Đây là `PlayerMotor.cs` đầy đủ sau bài này. Phần chạy giữ nguyên từ bài 2, chỉ thêm `airControl`. Phần mới là input `Jump`, các số thiết kế, và ba hàm `ApplyJump`, `ApplyGravity` cùng hai bộ đếm coyote và buffer.

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
        [SerializeField, Range(0f, 1f)] private float airControl = 0.7f;

        [Header("Jump (design numbers)")]
        [SerializeField, Min(0.1f)] private float jumpHeight = 5.5f;
        [SerializeField, Min(0.05f)] private float timeToApex = 0.4f;
        [SerializeField, Min(1f)] private float fallGravityMultiplier = 1.6f;
        [SerializeField, Range(0f, 1f)] private float jumpCutMultiplier = 0.4f;
        [SerializeField, Min(0f)] private float maxFallSpeed = 32f;

        [Header("Forgiveness")]
        [SerializeField, Min(0f)] private float coyoteTime = 0.1f;
        [SerializeField, Min(0f)] private float jumpBufferTime = 0.1f;

        [Header("Ground check")]
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private Vector2 groundBoxSize = new Vector2(1.0f, 0.1f);
        [SerializeField, Min(0f)] private float groundBoxOffset = 0.05f;

        public float Gravity => 2f * jumpHeight / (timeToApex * timeToApex);
        public float JumpVelocity => Gravity * timeToApex;

        public bool IsGrounded { get; private set; }
        public float MoveInput { get; private set; }
        public bool JumpHeld { get; private set; }
        public int FacingSign { get; private set; } = 1;
        public int JumpsThisAirtime { get; private set; }
        public Vector2 Velocity => body.linearVelocity;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private InputAction moveAction, jumpAction;
        private float coyoteCounter, bufferCounter;
        private bool jumpCutDone;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            box = GetComponent<BoxCollider2D>();
            moveAction = controls.FindAction("Gameplay/Move", throwIfNotFound: true);
            jumpAction = controls.FindAction("Gameplay/Jump", throwIfNotFound: true);
            body.gravityScale = 0f;
        }

        private void OnEnable() { moveAction.Enable(); jumpAction.Enable(); }
        private void OnDisable() { moveAction.Disable(); jumpAction.Disable(); }

        private void Update()
        {
            MoveInput = moveAction.ReadValue<Vector2>().x;
            JumpHeld = jumpAction.IsPressed();
            if (jumpAction.WasPressedThisFrame()) bufferCounter = jumpBufferTime;
            if (Mathf.Abs(MoveInput) > 0.01f) FacingSign = MoveInput > 0f ? 1 : -1;
        }

        private void FixedUpdate()
        {
            var wasGrounded = IsGrounded;
            IsGrounded = CheckGround();

            if (IsGrounded) { coyoteCounter = coyoteTime; if (!wasGrounded) JumpsThisAirtime = 0; }
            else coyoteCounter -= Time.fixedDeltaTime;
            bufferCounter -= Time.fixedDeltaTime;

            var v = body.linearVelocity;
            v = ApplyRun(v);
            v = ApplyJump(v);
            v = ApplyGravity(v);
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
            if (!IsGrounded) rate *= airControl;
            v.x = Mathf.MoveTowards(v.x, target, rate * Time.fixedDeltaTime);
            return v;
        }

        private Vector2 ApplyJump(Vector2 v)
        {
            if (bufferCounter > 0f && coyoteCounter > 0f)
            {
                v.y = JumpVelocity;
                bufferCounter = 0f;
                coyoteCounter = 0f;
                JumpsThisAirtime = 1;
                jumpCutDone = false;
            }

            if (!JumpHeld && v.y > 0f && JumpsThisAirtime > 0 && !jumpCutDone)
            {
                v.y *= jumpCutMultiplier;
                jumpCutDone = true;
            }
            return v;
        }

        private Vector2 ApplyGravity(Vector2 v)
        {
            if (IsGrounded && v.y <= 0f) { v.y = 0f; return v; }

            var g = Gravity * (v.y < 0f ? fallGravityMultiplier : 1f);
            v.y -= g * Time.fixedDeltaTime;
            if (v.y < -maxFallSpeed) v.y = -maxFallSpeed;
            return v;
        }

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null) return;
            var b = bc.bounds;
            Gizmos.color = Application.isPlaying && IsGrounded ? Color.green : Color.yellow;
            Gizmos.DrawWireCube(new Vector3(b.center.x, b.min.y - groundBoxOffset, 0f), groundBoxSize);
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(new Vector3(b.min.x, b.min.y + jumpHeight, 0f), new Vector3(b.max.x, b.min.y + jumpHeight, 0f));
        }
    }
}
```

`Gravity` và `JumpVelocity` là property tính từ hai số thiết kế, đúng công thức ở trên. `Awake` đặt `gravityScale = 0` bằng code, nên dù bạn quên sửa ô Gravity Scale 4 từ bài 2 thì Rigidbody cũng không kéo nhân vật hai lần.

`FixedUpdate` giữ đúng dạng "lấy v, sửa v, ghi v" của bài 2, chỉ chèn thêm hai bước. Thứ tự có nghĩa: chạy trước, rồi nhảy, rồi mới trọng lực, để bước nhân vật vừa bật lên cũng đã chịu trọng lực của bước đó.

`ApplyGravity` không cộng trọng lực khi đang đứng trên đất và không có vận tốc đi lên. Nếu cứ trừ trọng lực mỗi bước khi đứng yên, vận tốc âm sẽ tích luỹ dù sàn chặn lại, và lúc bước ra khỏi mép bệ nhân vật sẽ rơi như bị giật xuống.

`airControl = 0.7` làm tăng tốc và giảm tốc trên không chỉ còn 70%. Bạn vẫn đổi hướng được giữa không trung, nhưng không gắt như trên mặt đất.

Lưu file và quay lại Unity. Component PlayerMotor trên `Player` giữ nguyên Controls và Ground Mask đã gắn ở bài 2, và có thêm các nhóm mới với giá trị mặc định từ code:

![Inspector Player Motor: nhóm Run có Air Control 0.7, nhóm Jump có Jump Height 5.5, Time To Apex 0.4, Fall Gravity Multiplier 1.6, Jump Cut Multiplier 0.4, Max Fall Speed 32, nhóm Forgiveness có Coyote Time và Jump Buffer Time 0.1](/images/posts/unity-platformer/03/player-motor-inspector.webp)

## Nhảy cao bao nhiêu thật

Chọn Player trong Scene view. Ngoài hộp dò đất dưới chân, giờ có thêm một vạch màu cyan ở độ cao `jumpHeight` tính từ chân. Đặt nhân vật đứng ngay cạnh bệ 1 và so vạch đó với mặt bệ:

![Scene view: nhân vật đứng cạnh bệ 1, vạch cyan nằm cao hơn mặt bệ nửa ô](/images/posts/unity-platformer/03/jump-height-gizmo.webp)

Vạch nằm cao hơn mặt bệ nửa ô, đúng khoảng dư mình chọn. Giờ bấm Play, đứng sát bệ và giữ Space. Ở đỉnh cú nhảy, chân nhân vật phải nằm cao hơn mặt bệ một chút:

![Game view ở đỉnh cú nhảy: chân nhân vật cao hơn mặt bệ 1 khoảng một phần tư ô](/images/posts/unity-platformer/03/apex-next-to-platform.webp)

Mình ghi độ cao mỗi bước vật lý để đo chính xác. Giữ phím suốt cú nhảy thì chân lên cao 5.225 unit chứ không phải 5.5, và cao hơn mặt bệ khoảng 0.225 unit như trong ảnh.

Phần hụt 0.275 không phải lỗi công thức. Physics tính theo từng bước 0.02 giây, và trong mỗi bước nó trừ trọng lực vào vận tốc trước rồi mới dùng vận tốc đó để dời vị trí. Ngay bước đầu tiên, nhân vật đã chỉ còn 26.125 unit/s thay vì 27.5. Cách tính từng bước này luôn hụt đúng một nửa quãng của một bước so với công thức liên tục: 27.5 × 0.02 / 2 = 0.275. Đo ra 5.225, khớp tới chữ số thứ ba.

Muốn bù cho đủ 5.5 thì cộng thêm `0.5 × g × dt` vào vận tốc nhảy. Mình không làm, vì 0.275 unit chỉ bằng hơn 4 pixel, và công thức sạch dễ đọc hơn. Việc cần là biết con số thật, để khi thiết kế bệ bạn tính theo 5.225 chứ không phải 5.5.

Về thời gian, nhân vật lên tới đỉnh sau 0.38 giây và chạm đất lại sau 0.72 giây. Lúc rơi chỉ mất 0.34 giây dù cùng độ cao, nhờ `fallGravityMultiplier = 1.6`. Cú nhảy lên thong thả hơn lúc rơi xuống, trông nặng và dứt khoát hơn so với một đường parabol đối xứng. Trước khi chạm đất, vận tốc rơi đã chạm mức trần 32 unit/s.

## Nhả sớm thì nhảy thấp

Giữ phím lâu hay chạm nhẹ đều nhảy cao như nhau thì người chơi không điều khiển được độ cao. Hầu hết platformer cho phép nhả phím sớm để nhảy thấp.

Cách làm trong `ApplyJump`: khi phím nhảy không còn được giữ mà nhân vật vẫn đang bay lên, nhân vận tốc đi lên với `jumpCutMultiplier = 0.4`. Nhân vật mất phần lớn đà và bắt đầu rơi sớm.

![Đồ thị độ cao theo thời gian: giữ phím lên 5.225, chạm nhẹ 0.08 giây lên 2.40](/images/posts/unity-platformer/03/y-full-vs-tap.webp)

Chạm phím 0.08 giây thì nhân vật lên 2.40 unit, khoảng 46% cú nhảy đầy. Giữ lâu hơn thì cao dần, tới 5.225 khi giữ hết.

### Cắt đúng một lần

Chỗ này có một lỗi rất dễ mắc mà trông lại giống như đang chạy đúng. Nếu viết điều kiện cắt mà không có cờ `jumpCutDone`:

```csharp
if (!JumpHeld && v.y > 0f && JumpsThisAirtime > 0)
    v.y *= jumpCutMultiplier;
```

thì dòng nhân 0.4 chạy lại ở mọi bước còn đang bay lên, tức là 0.4, rồi 0.4 × 0.4, rồi 0.4 × 0.4 × 0.4. Đây là vận tốc theo thời gian của hai cách, cùng một lần chạm phím 0.08 giây:

![Hai đồ thị vy theo thời gian: bên trái cắt mỗi bước, vy tụt 22 xuống 7.4 rồi 1.6 và rơi ngay; bên phải cắt một lần, vy tụt về 6.9 rồi giảm đều theo trọng lực](/images/posts/unity-platformer/03/vy-cut-wrong-vs-right.webp)

Bên trái, hai bước sau khi nhả phím vận tốc đã gần bằng 0, cú nhảy chết đứng giữa không trung rồi rơi. Nhân vật chỉ lên 2.10 unit. Bên phải, vận tốc bị cắt một lần rồi giảm đều theo trọng lực, đường bay cong mượt.

Lý do lỗi này ít ai phát hiện là bản sai vẫn cho kết quả "nhả sớm thì nhảy thấp". Chỉ khi đặt đồ thị vận tốc cạnh nhau mới thấy cú nhảy bị bẻ gãy. Cờ `jumpCutDone` được đặt lại về `false` mỗi lần bật nhảy, nên mỗi cú nhảy được cắt đúng một lần.

`JumpsThisAirtime > 0` trong điều kiện là để chỉ cắt khi nhân vật đang bay lên sau một cú nhảy của chính nó. Nhân vật đi bộ ra khỏi mép bệ thì biến này bằng 0, không có cú nhảy nào để cắt, và mọi vận tốc đi lên khác (ví dụ cú nảy khi dẫm lên thùng ở bài 9) không bị đụng tới. Biến này về 0 mỗi lần chạm đất, và bài 4 sẽ dùng nó để đếm double jump.

## Coyote time: rời mép rồi vẫn nhảy được

Người chơi chạy tới mép bệ và bấm nhảy đúng lúc, nhưng "đúng lúc" với mắt người thường trễ hơn vài phần trăm giây so với lúc hộp dò đất thực sự rời mép. Không có gì bù thì họ rơi xuống và thấy game nuốt phím.

Coyote time (theo tên chú chó sói trong phim hoạt hình chạy ra khỏi vách đá rồi mới rơi) cho phép nhảy trong một khoảng ngắn sau khi rời đất. `coyoteCounter` được đặt bằng `coyoteTime` mỗi bước còn đứng trên đất, rồi giảm dần khi đã rời đất. Lệnh nhảy chỉ cần `coyoteCounter > 0` chứ không cần `IsGrounded`. Nhảy xong thì đặt `coyoteCounter = 0` để một lần chạm đất chỉ cho một cú nhảy.

## Jump buffer: bấm hơi sớm vẫn không mất lệnh

Ngược lại với coyote: người chơi đang rơi và bấm nhảy trước khi chân chạm đất một chút. Nếu chỉ xét phím đúng lúc bấm thì lúc đó chưa chạm đất, lệnh bị bỏ.

`bufferCounter` giữ lệnh nhảy trong `jumpBufferTime` giây sau khi bấm. Bước nào vừa có lệnh còn hạn vừa được phép nhảy thì bật lên, dù lúc bấm chưa chạm đất.

Buffer còn một vai trò nữa ít được nhắc tới. Bấm phím được đọc trong `Update`, còn nhảy thì thực hiện trong `FixedUpdate`, và như bài 2 đã nói, có những frame không có bước vật lý nào. Nếu `Update` chỉ đặt một cờ "vừa bấm" rồi frame sau xoá đi thì lần bấm rơi vào frame đó sẽ mất. `bufferCounter` sống 0.1 giây, đủ dài để luôn có ít nhất một bước vật lý nhìn thấy nó. Nên buffer vừa để tha thứ cho người chơi, vừa là cầu nối giữa hai nhịp `Update` và `FixedUpdate`.

## Đo coyote và buffer

Mình cho nhân vật chạy sang phải trên bệ 1 và rời mép, rồi bấm nhảy ở ba thời điểm khác nhau sau khi rời mép:

![Ba đường bay rời mép phải của bệ 1: bấm sau 0.06 giây thì nhảy lên và đáp lên bệ 2; bấm sau 0.14 giây thì rơi thẳng xuống sàn; bấm sau 0.24 giây thì rơi xuống rồi bật lên ngay khi chạm sàn](/images/posts/unity-platformer/03/coyote-buffer-paths.webp)

- **0.06 giây** (đường xanh ngọc): nhân vật đã bắt đầu rơi, vận tốc −3.6, nhưng vẫn trong cửa sổ coyote nên bật lên 26 unit/s. Cú nhảy này đủ đưa nó lên mép trái của bệ 2.
- **0.14 giây** (đường đỏ, trùng đường tím tới lúc chạm sàn): ngoài cửa sổ coyote nên không nhảy. Nó rơi xuống sàn sau 0.3 giây, lúc đó lệnh đã quá 0.1 giây nên buffer cũng hết hạn, nhân vật chạy tiếp trên sàn.
- **0.24 giây** (đường tím): cũng ngoài cửa sổ coyote, nhưng lúc bấm chỉ còn 0.08 giây nữa là chạm sàn. Buffer giữ lệnh, và ngay bước chân chạm sàn nhân vật bật lên đủ 5.225 unit.

Một chi tiết nhỏ: bộ đếm coyote bị trừ ngay trong bước đầu tiên rời đất, nên với `coyoteTime = 0.1` cửa sổ thật là 4 bước vật lý, khoảng 0.08 giây. Nếu bạn muốn cửa sổ đủ 0.1 giây thì đặt 0.12. Mình giữ 0.1 vì 0.08 giây đã đủ rộng.

## Kiểm tra

Bấm Play và thử bằng tay:

- Đứng sát bệ 1, giữ Space: chân lên cao hơn mặt bệ một chút, đẩy sang phải là đáp lên bệ.
- Chạm Space thật nhanh: nhân vật nhảy khoảng một nửa độ cao, đường bay vẫn cong đều chứ không khựng giữa chừng.
- Chạy ra khỏi mép bệ rồi bấm nhảy ngay: vẫn nhảy được.
- Nhảy xuống từ bệ và bấm Space ngay trước khi chạm sàn: nhân vật bật lên liền, không phải bấm lại.
- Bậc thang ở x = 30 giờ nhảy qua được.

## Bài sau

Một cú nhảy đã có đủ độ cao, cảm giác và sự tha thứ. Bài 4 dùng chính nút nhảy đó cho hai việc nữa: nhảy thêm một lần giữa không trung, và bật ra khỏi tường trong cái khe hẹp ở cuối phòng.
