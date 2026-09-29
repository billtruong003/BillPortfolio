---
title: "Platformer #4: Double jump và wall jump, một phím ba kết quả"
date: "2026-09-28"
lang: vi
series: "platformer"
order: 4
excerpt: "Cùng một phím Space: nhảy từ đất, bật tường, hay nhảy thêm giữa không trung. Thứ tự kiểm tra quyết định cảm giác, và 0.15 giây khoá hướng là thứ giúp nhân vật thật sự bật ra khỏi tường."
coverImage: "/images/posts/unity-platformer/04/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Wall Jump", "Double Jump", "Tutorial"]
published: true
featured: false
---

Bài 3 cho nhân vật một cú nhảy đầy đủ. Bài này dùng chính phím nhảy đó cho hai việc nữa: nhảy thêm một lần giữa không trung, và bám tường rồi bật ra. Hết bài, nhân vật leo được cái khe rộng 4 ô ở cuối phòng bằng cách bật qua lại giữa hai vách.

![Nhân vật đang trượt dọc vách phải của khe hẹp](/images/posts/unity-platformer/04/shaft-slide.webp)

## Một phím, ba kết quả

Người chơi chỉ bấm Space. Máy phải tự đoán họ muốn kiểu nhảy nào dựa vào tình huống: vừa rời đất, đang sát tường, hay đang lơ lửng giữa không trung. Mỗi bước vật lý có lệnh nhảy trong buffer, motor kiểm tra lần lượt:

![Sơ đồ: có lệnh nhảy thì kiểm coyoteCounter, không được thì kiểm wallCoyoteCounter, không được thì kiểm JumpsThisAirtime nhỏ hơn maxJumps, không được thì giữ lệnh trong buffer](/images/posts/unity-platformer/04/jump-priority.webp)

Thứ tự này là một quyết định về cảm giác, không phải chuyện kỹ thuật. Nhảy từ đất đứng đầu vì đó là cú nhảy người chơi muốn nhất và mạnh nhất. Bật tường đứng trước nhảy trên không: nếu đảo lại, người chơi đang trượt sát tường bấm nhảy sẽ tiêu mất lượt double jump và bay thẳng lên dọc tường, thay vì bật ra như họ muốn.

Cuối cùng, nếu không kiểu nào được phép thì lệnh vẫn nằm trong buffer thêm tối đa 0.1 giây. Nhờ vậy người chơi rơi xuống và bấm sớm vẫn được nhảy ngay khi chạm đất, như bài 3.

## PlayerMotor sau bài này

Phần chạy, nhảy, coyote và buffer giữ nguyên. Phần mới là nhóm `Air jumps`, nhóm `Wall`, hàm `CheckWall`, và `ApplyJump` giờ có ba nhánh.

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace Platformer.Player
{
    [RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D))]
    public sealed class PlayerMotor : MonoBehaviour
    {
        public enum JumpKind { None, Ground, Air, Wall }

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

        [Header("Air jumps")]
        [SerializeField, Range(1, 3)] private int maxJumps = 2;
        [SerializeField, Range(0.2f, 1.5f)] private float airJumpHeightScale = 0.85f;

        [Header("Wall")]
        [SerializeField] private bool canWallJump = true;
        [SerializeField] private Vector2 wallBoxSize = new Vector2(0.1f, 1.2f);
        [SerializeField, Min(0f)] private float wallBoxOffset = 0.05f;
        [SerializeField, Min(0f)] private float wallSlideSpeed = 4f;
        [SerializeField, Range(0.2f, 1.5f)] private float wallJumpHeightScale = 0.9f;
        [SerializeField, Min(0f)] private float wallJumpPush = 10f;
        [SerializeField, Min(0f)] private float wallJumpLock = 0.15f;
        [SerializeField, Min(0f)] private float wallCoyoteTime = 0.1f;

        [Header("Forgiveness")]
        [SerializeField, Min(0f)] private float coyoteTime = 0.1f;
        [SerializeField, Min(0f)] private float jumpBufferTime = 0.1f;

        [Header("Ground check")]
        [SerializeField] private LayerMask groundMask;
        [SerializeField] private Vector2 groundBoxSize = new Vector2(1.0f, 0.1f);
        [SerializeField, Min(0f)] private float groundBoxOffset = 0.05f;

        public float Gravity => 2f * jumpHeight / (timeToApex * timeToApex);
        public float JumpVelocity => Gravity * timeToApex;
        public float AirJumpVelocity => Mathf.Sqrt(2f * Gravity * jumpHeight * airJumpHeightScale);
        public float WallJumpVelocity => Mathf.Sqrt(2f * Gravity * jumpHeight * wallJumpHeightScale);

        public bool IsGrounded { get; private set; }
        public int WallSign { get; private set; }
        public bool IsWallSliding { get; private set; }
        public float MoveInput { get; private set; }
        public bool JumpHeld { get; private set; }
        public int FacingSign { get; private set; } = 1;
        public int JumpsThisAirtime { get; private set; }
        public JumpKind LastJump { get; private set; }
        public Vector2 Velocity => body.linearVelocity;

        private Rigidbody2D body;
        private BoxCollider2D box;
        private InputAction moveAction, jumpAction;
        private float coyoteCounter, wallCoyoteCounter, bufferCounter, wallLockCounter;
        private int lastWallSign;
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
            UpdateFacing();
        }

        private void FixedUpdate()
        {
            var wasGrounded = IsGrounded;
            IsGrounded = CheckGround();
            WallSign = IsGrounded ? 0 : CheckWall();

            if (IsGrounded) { coyoteCounter = coyoteTime; if (!wasGrounded) JumpsThisAirtime = 0; }
            else coyoteCounter -= Time.fixedDeltaTime;

            if (WallSign != 0) { wallCoyoteCounter = wallCoyoteTime; lastWallSign = WallSign; }
            else wallCoyoteCounter -= Time.fixedDeltaTime;

            bufferCounter -= Time.fixedDeltaTime;
            wallLockCounter -= Time.fixedDeltaTime;

            var v = body.linearVelocity;
            v = ApplyRun(v);
            v = ApplyJump(v);
            v = ApplyGravity(v);
            body.linearVelocity = v;
        }

        private void UpdateFacing()
        {
            if (wallLockCounter > 0f) return;
            if (Mathf.Abs(MoveInput) > 0.01f) FacingSign = MoveInput > 0f ? 1 : -1;
        }

        private bool CheckGround()
        {
            var b = box.bounds;
            var centre = new Vector2(b.center.x, b.min.y - groundBoxOffset);
            return Physics2D.OverlapBox(centre, groundBoxSize, 0f, groundMask) != null;
        }

        private int CheckWall()
        {
            if (!canWallJump) return 0;
            var b = box.bounds;
            var right = new Vector2(b.max.x + wallBoxOffset, b.center.y);
            var left  = new Vector2(b.min.x - wallBoxOffset, b.center.y);
            if (Physics2D.OverlapBox(right, wallBoxSize, 0f, groundMask) != null) return 1;
            if (Physics2D.OverlapBox(left,  wallBoxSize, 0f, groundMask) != null) return -1;
            return 0;
        }

        private Vector2 ApplyRun(Vector2 v)
        {
            if (wallLockCounter > 0f) return v;
            var target = MoveInput * moveSpeed;
            var hasInput = Mathf.Abs(MoveInput) > 0.01f;
            var rate = hasInput ? moveSpeed / accelTime : moveSpeed / decelTime;
            if (!IsGrounded) rate *= airControl;
            v.x = Mathf.MoveTowards(v.x, target, rate * Time.fixedDeltaTime);
            return v;
        }

        private Vector2 ApplyJump(Vector2 v)
        {
            if (bufferCounter > 0f)
            {
                if (coyoteCounter > 0f)
                {
                    v.y = JumpVelocity;
                    Consume(JumpKind.Ground);
                    JumpsThisAirtime = 1;
                    coyoteCounter = 0f;
                }
                else if (canWallJump && wallCoyoteCounter > 0f)
                {
                    v.y = WallJumpVelocity;
                    v.x = -lastWallSign * wallJumpPush;
                    FacingSign = -lastWallSign;
                    wallLockCounter = wallJumpLock;
                    wallCoyoteCounter = 0f;
                    Consume(JumpKind.Wall);
                    JumpsThisAirtime = 1;
                }
                else if (JumpsThisAirtime < maxJumps)
                {
                    v.y = AirJumpVelocity;
                    Consume(JumpKind.Air);
                    JumpsThisAirtime++;
                }
            }

            if (!JumpHeld && v.y > 0f && JumpsThisAirtime > 0 && !jumpCutDone)
            {
                v.y *= jumpCutMultiplier;
                jumpCutDone = true;
            }
            return v;
        }

        private void Consume(JumpKind kind)
        {
            bufferCounter = 0f;
            jumpCutDone = false;
            LastJump = kind;
        }

        private Vector2 ApplyGravity(Vector2 v)
        {
            if (IsGrounded && v.y <= 0f) { v.y = 0f; IsWallSliding = false; return v; }

            var pushingIntoWall = WallSign != 0 && Mathf.Sign(MoveInput) == WallSign && Mathf.Abs(MoveInput) > 0.01f;
            IsWallSliding = canWallJump && pushingIntoWall && v.y <= 0f;

            var g = Gravity * (v.y < 0f ? fallGravityMultiplier : 1f);
            v.y -= g * Time.fixedDeltaTime;
            var floor = IsWallSliding ? -wallSlideSpeed : -maxFallSpeed;
            if (v.y < floor) v.y = floor;
            return v;
        }

        private void OnDrawGizmosSelected()
        {
            var bc = GetComponent<BoxCollider2D>();
            if (bc == null) return;
            var b = bc.bounds;
            Gizmos.color = Application.isPlaying && IsGrounded ? Color.green : Color.yellow;
            Gizmos.DrawWireCube(new Vector3(b.center.x, b.min.y - groundBoxOffset, 0f), groundBoxSize);
            Gizmos.color = Application.isPlaying && WallSign != 0 ? Color.magenta : Color.gray;
            Gizmos.DrawWireCube(new Vector3(b.max.x + wallBoxOffset, b.center.y, 0f), wallBoxSize);
            Gizmos.DrawWireCube(new Vector3(b.min.x - wallBoxOffset, b.center.y, 0f), wallBoxSize);
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(new Vector3(b.min.x, b.min.y + jumpHeight, 0f), new Vector3(b.max.x, b.min.y + jumpHeight, 0f));
        }
    }
}
```

`LastJump` ghi lại kiểu nhảy vừa xảy ra. Bài này chưa dùng, nhưng bài 6 sẽ đọc nó để chọn animation nhảy thường hay nhảy lộn vòng cho double jump.

Các nhóm mới trong Inspector:

![Inspector Player Motor: nhóm Air jumps có Max Jumps 2 và Air Jump Height Scale 0.85; nhóm Wall có Can Wall Jump, Wall Box Size 0.1 x 1.2, Wall Slide Speed 4, Wall Jump Push 10, Wall Jump Lock 0.15, Wall Coyote Time 0.1](/images/posts/unity-platformer/04/motor-inspector-air-wall.webp)

## Double jump

`maxJumps = 2` nghĩa là một lần chạm đất cho tối đa hai lần nhảy: cú từ đất và một cú trên không. `JumpsThisAirtime` đếm số lần đã nhảy và về 0 khi chạm đất lại.

Cú thứ hai dùng lại công thức của bài 3 nhưng với độ cao nhân `airJumpHeightScale = 0.85`, tức 4.675 unit. Muốn bay lên đúng độ cao `h` từ vị trí hiện tại thì cần vận tốc `√(2gh)`, nên `AirJumpVelocity = √(2 × 68.75 × 5.5 × 0.85) ≈ 25.35`. Motor đặt thẳng `v.y` bằng giá trị này chứ không cộng thêm, nên cú thứ hai luôn cao như nhau dù lúc bấm nhân vật đang lên hay đang rơi.

Mình cho nhảy từ sàn, giữ phím, rồi bấm lần hai đúng lúc cú đầu lên tới đỉnh:

![Đồ thị độ cao: cú đầu lên 5.225, bấm lần hai ở đỉnh, tổng lên 9.63, vẫn thấp hơn bệ 2 cao 10](/images/posts/unity-platformer/04/double-jump-y.webp)

Tổng cộng lên 9.63 unit so với sàn. Cú thứ hai cho thêm 4.41, cũng hụt nửa bước như bài 3. Bệ 2 cao 10 ô so với sàn nên double jump từ sàn vẫn chưa tới, muốn lên bệ 2 thì đứng trên bệ 1 nhảy thường. Double jump trong căn phòng này là để chữa một cú nhảy hụt hoặc với thêm ra xa, không phải để nhảy tắt.

Jump cut của bài 3 áp cho mọi kiểu nhảy, vì `Consume` đặt lại `jumpCutDone = false` mỗi lần nhảy. Nhả phím sớm trong cú thứ hai thì cú thứ hai cũng thấp theo.

## Dò tường bằng hai hộp mỏng

`CheckWall` dùng lại đúng cách dò đất của bài 2, chỉ quay sang hai bên: hai hộp mỏng rộng 0.1, đặt sát hai mép collider, cách 0.05. Hộp phải chạm `Ground` thì trả về `1`, hộp trái chạm thì trả về `-1`, không chạm thì `0`. Dấu này cho biết tường ở phía nào, và bật tường sẽ đẩy nhân vật theo dấu ngược lại.

Motor chỉ dò tường khi không đứng trên đất. Đứng sát tường trên mặt sàn thì không có gì để bám.

![Scene view lúc đang bám tường: hai hộp dò tường màu magenta ngắn hơn collider ở cả hai đầu, hộp dò đất màu vàng dưới chân](/images/posts/unity-platformer/04/wall-probe-gizmo.webp)

Hộp dò tường cao 1.2, ngắn hơn collider 1.7 một đoạn 0.25 ở mỗi đầu. Nếu để cao bằng collider thì đáy hộp nằm ngang chân nhân vật, và nó sẽ chạm vào mép đất ngay dưới chân. Mình thử đặt 1.7 rồi cho nhân vật chạy khỏi mép phải của bệ 1: ngay bước rời mép, hộp dò bên trái chạm góc bệ và báo "có tường bên trái". Lần này vô hại vì coyote của đất được ưu tiên, nhưng đó là một tín hiệu sai có thể biến một cú nhảy thường thành cú bật ngược về phía bệ. Với 1.2 thì không còn tín hiệu đó.

## Trượt tường

Nhân vật chỉ trượt tường khi có đủ ba điều: đang có tường ở một bên, người chơi đang đẩy phím về phía bức tường đó, và nhân vật đang rơi (`v.y ≤ 0`). Khi đó tốc độ rơi bị giới hạn ở `wallSlideSpeed = 4` thay vì 32.

Điều kiện đang rơi quan trọng. Nhân vật nhảy lên sát tường thì vẫn bay lên bình thường dọc theo tường, nhờ ma sát bằng 0 từ bài 2. Không có vật liệu đó, ma sát sẽ giữ nhân vật dính trên tường ngay cả khi đang bay lên. Chỉ khi bắt đầu rơi thì nó mới bị kìm lại.

Mình thả nhân vật từ trên cao vào khe và giữ phím phải: vận tốc rơi đứng yên ở đúng −4.00 suốt 127 bước vật lý (khoảng 2.5 giây), x đứng yên ở 53.385, tức mép phải collider sát vách.

## Wall jump và khoá hướng

Bấm nhảy khi đang bám tường (hoặc vừa rời tường trong vòng `wallCoyoteTime` 0.1 giây), motor đặt:

- `v.y = WallJumpVelocity`, khoảng 26.09, tức 90% độ cao cú nhảy thường.
- `v.x = -lastWallSign × 10`, đẩy ra xa tường. 10 nhanh hơn tốc độ chạy 9 một chút, để cú bật có cảm giác bị hất ra chứ không giống một bước đi ngang.
- `FacingSign` quay mặt ra xa tường.
- `wallLockCounter = 0.15`.

Dòng cuối là thứ bạn sẽ muốn xoá vì trông thừa. Hãy thử xoá nó trước. Đặt Wall Jump Lock về 0 trong Inspector, vào khe, giữ phím về phía tường và bấm nhảy:

![Hai đồ thị: vx sau khi bật tường, bản không khoá bị kéo về ngay từ bước sau, bản khoá giữ -10 trong 8 bước; khoảng cách rời tường, bản không khoá chỉ ra 1.06 rồi quay lại dính tường, bản khoá ra 2.46](/images/posts/unity-platformer/04/walljump-lock.webp)

Không khoá (đường đỏ), người chơi vẫn đang giữ phím phải nên air control kéo `v.x` về phía +9 ngay từ bước sau cú bật. Nhân vật chỉ ra được 1.06 unit rồi quay lại dính vào tường cũ sau 0.4 giây. Người chơi cảm thấy như bấm nhảy mà bị hút lại.

Có khoá (đường xanh), `ApplyRun` bỏ qua input trong 0.15 giây, nên `v.x` giữ đúng −10 trong 8 bước. Nhân vật ra được 2.46 unit, gần tới vách trái của khe (vách trái nằm ở 2.77). Trong thực tế người chơi sẽ đổi phím sang trái ngay sau khi bật, và cú bật đó đưa nhân vật sang tới vách bên kia.

0.15 giây là con số chỉnh cảm giác. Dài hơn thì cú bật chắc hơn nhưng người chơi mất quyền điều khiển lâu hơn, ngắn hơn thì ngược lại. `UpdateFacing` cũng bỏ qua input trong khoảng khoá, để hình nhân vật không quay mặt vào tường giữa lúc đang bật ra.

## Bật tường có trả lại double jump không?

Nhánh wall jump đặt `JumpsThisAirtime = 1` chứ không cộng thêm. Nghĩa là sau mỗi lần bật tường, nhân vật vẫn còn một lượt double jump.

Nếu cộng thêm, người chơi leo khe bằng hai lần bật tường sẽ hết sạch lượt nhảy trên không. Mình muốn khe leo được mãi bằng bật tường và vẫn còn một double jump dự phòng khi bật hụt. Game khác có thể chọn khác, ví dụ không có double jump, hay bật tường không trả lại gì. Không có lựa chọn nào đúng tuyệt đối, bạn chỉ cần biết dòng này là chỗ quyết định.

## Kiểm tra

- Trên sàn, bấm nhảy hai lần: lần hai bay lên thêm, lần ba không có tác dụng.
- Nhảy vào khe, giữ phím về phía một vách: nhân vật trượt xuống chậm đều.
- Đang trượt, bấm nhảy rồi đổi phím sang hướng ngược lại: nhân vật bật sang vách bên kia. Lặp lại để leo lên đỉnh khe.
- Đặt Wall Jump Lock về 0 rồi thử bật tường mà vẫn giữ phím về phía tường: nhân vật bị kéo lại. Trả về 0.15.

## Bài sau

Căn phòng rộng 64 × 36 nhưng camera vẫn đứng yên ở góc dưới trái như bài 0. Bài 5 cho camera đi theo nhân vật, và câu hỏi là khi nào camera nên theo trục dọc, khi nào nên đứng yên.
