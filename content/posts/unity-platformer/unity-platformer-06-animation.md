---
title: "Platformer #6: Animation chọn theo vật lý, Animator không có mũi tên nào"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 6
excerpt: "Bảy animation cho nhân vật mà Animator không có một transition nào. Trạng thái animation được suy ra từ vận tốc, chạm đất, bám tường của motor, nên thêm động tác mới chỉ cần thêm một dòng code."
coverImage: "/images/posts/unity-platformer/06/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Animation", "Animator", "Tutorial"]
published: true
featured: false
---

Nhân vật đã chạy, nhảy, double jump và bám tường được, nhưng vẫn đứng một tư thế Idle suốt từ bài 0. Bài này cắt các sheet còn lại thành frame, tạo bảy animation, và cho chúng tự đổi theo trạng thái của nhân vật.

Cách làm quen thuộc với Animator là mỗi state nối với các state khác bằng mũi tên, mỗi mũi tên có một điều kiện. Với bảy animation của nhân vật này, nối đủ các cặp cần thiết trông như thế này:

![Animator với 7 state nối với nhau bằng 42 mũi tên transition](/images/posts/unity-platformer/06/animator-spiderweb.webp)

Bốn mươi hai mũi tên. Mỗi mũi tên có điều kiện riêng, và khi nhân vật cư xử sai thì bạn phải lần từng mũi tên xem cái nào bắt nhầm. Thêm một động tác mới là thêm mười mấy mũi tên nữa.

Bài này làm ngược lại. Animator chỉ có bảy state đứng rời nhau, không mũi tên nào. Một script đọc trạng thái vật lý của motor (đang đứng trên đất không, vận tốc dọc bao nhiêu, có đang bám tường không) và bảo Animator phát clip nào.

## Cắt các sheet còn lại

Bài 0 mới cắt `Idle.png`. Giờ cắt nốt bốn sheet nhiều frame của nhân vật, theo đúng cách đã làm:

| Sheet | Số frame | Sprite Mode |
|---|---|---|
| `Run.png` | 12 | Multiple, cắt 32 × 32 |
| `Double_Jump.png` | 6 | Multiple, cắt 32 × 32 |
| `Wall_Jump.png` | 5 | Multiple, cắt 32 × 32 |
| `Hit.png` | 7 | Multiple, cắt 32 × 32 |
| `Jump.png`, `Fall.png` | 1 | Single, Pivot Bottom (đã đặt ở bài 0) |

Với mỗi sheet: chọn file, đặt Sprite Mode `Multiple`, Apply, bấm **Open Sprite Editor**, rồi **Slice** với Type `Grid By Cell Size`, Pixel Size `32 × 32`, Pivot `Bottom Center`. Bấm Slice, rồi Apply.

![Sprite Editor của Run.png: 12 ô 32 x 32, ô Run_0 được chọn với Pivot Bottom Center](/images/posts/unity-platformer/06/sprite-editor-run.webp)

Pivot phải giống nhau ở mọi sheet. Nếu Run đặt pivot ở đáy mà Hit để ở tâm, lúc đổi từ chạy sang bị đánh nhân vật sẽ giật lên nửa ô.

## Tạo clip đầu tiên bằng cách kéo sprite

Cách nhanh nhất để có clip đầu tiên kèm luôn Animator:

1. Tạo thư mục `Assets/_Platformer/Animation/Player/Char1`.
2. Trong Project window, mở mũi tên cạnh `Run.png`, bấm `Run_0`, giữ Shift rồi bấm `Run_11` để chọn cả 12 sprite.
3. Kéo cả 12 sprite thả lên `Player` trong Hierarchy.
4. Unity hỏi chỗ lưu clip. Chọn thư mục vừa tạo, đặt tên `Run.anim`.

Unity làm ba việc cùng lúc: tạo clip `Run.anim` với 12 keyframe, thêm component **Animator** vào `Player`, và tạo một Animator Controller đặt tên theo GameObject là `Player.controller` trong cùng thư mục. Đổi tên controller đó thành `Player_Char1`. Bài 7 sẽ có thêm hai nhân vật, mỗi nhân vật một controller, nên đặt tên theo nhân vật ngay từ giờ.

Clip Unity tạo ra chạy ở 12 khung/giây. Bộ art này vẽ để chạy ở 20 khung/giây, ở 12 thì bước chạy trông chậm và lê. Mở **Window > Animation > Animation**, chọn `Player` trong Hierarchy, dropdown clip ở góc trái phải đang là `Run`. Ô **Samples** mặc định bị ẩn trong Unity 6: bấm dấu ba chấm ở góc phải trên của cửa sổ Animation và chọn **Show Sample Rate**. Đổi Samples thành `20`.

![Cửa sổ Animation: clip Run, Samples 20, 12 keyframe Sprite trải từ 0:00 tới 0:11](/images/posts/unity-platformer/06/animation-window-run.webp)

12 keyframe ở 20 khung/giây là 0.6 giây cho một vòng chạy.

## Tạo sáu clip còn lại

Vẫn trong cửa sổ Animation, với `Player` đang được chọn:

1. Mở dropdown clip (đang ghi `Run`), chọn **Create New Clip...**, lưu thành `Idle.anim` trong cùng thư mục.
2. Kéo `Idle_0` tới `Idle_10` từ Project window thả vào vùng timeline của cửa sổ Animation. Unity đặt mỗi sprite vào một keyframe liên tiếp.
3. Đặt Samples là `20`.

Lặp lại cho các clip còn lại:

| Clip | Sprite | Samples | Loop Time |
|---|---|---|---|
| `Idle` | `Idle_0` tới `Idle_10` | 20 | bật |
| `Run` | `Run_0` tới `Run_11` | 20 | bật |
| `Jump` | `Jump` (1 sprite) | không quan trọng | tắt |
| `Fall` | `Fall` (1 sprite) | không quan trọng | tắt |
| `Double_Jump` | `Double_Jump_0` tới `_5` | 20 | tắt |
| `Wall_Jump` | `Wall_Jump_0` tới `_4` | 20 | bật |
| `Hit` | `Hit_0` tới `_6` | 20 | tắt |

**Loop Time** chỉnh bằng cách chọn file `.anim` trong Project window và tick ô đó trong Inspector. Idle, Run và Wall_Jump lặp liên tục. Double_Jump và Hit chỉ chạy một lần: một cú lộn vòng, một lần bị đánh.

Mỗi clip tạo bằng Create New Clip được Unity tự thêm thành một state trong `Player_Char1`.

## Animator không có transition

Mở **Window > Animation > Animator** với `Player` đang được chọn:

![Animator: 7 state Idle, Run, Jump, Fall, Double_Jump, Wall_Jump, Hit xếp thành cột, chỉ có mũi tên mặc định từ Entry tới Idle](/images/posts/unity-platformer/06/animator-7-states.webp)

Bảy state đứng rời nhau. Mũi tên duy nhất đi từ **Entry** tới **Idle**, nghĩa là Idle là state mặc định. Nếu state mặc định (màu cam) đang là Run vì Run được tạo trước, chuột phải vào `Idle` và chọn **Set as Layer Default State**. Nếu có transition nào Unity tự tạo, chọn nó và bấm Delete.

Tab **Parameters** để trống. Animator ở đây chỉ làm một việc: phát clip mà code yêu cầu. Toàn bộ logic chọn clip nằm trong C#, nơi bạn đặt breakpoint được, đọc diff được, và thấy được thứ tự ưu tiên trong một hàm.

Chọn `Player` và kiểm component Animator trong Inspector:

![Inspector: Animator với Controller Player_Char1, Apply Root Motion tắt, Update Mode Normal, Culling Mode Always Animate; Player Animator với Run Threshold 0.5 và Double Jump Clip Seconds 0.3](/images/posts/unity-platformer/06/animator-inspector.webp)

- **Apply Root Motion** tắt. Clip của ta chỉ đổi sprite, vị trí do motor quyết định.
- **Update Mode** `Normal`: animation chạy theo thời gian của game.
- **Culling Mode** `Always Animate`. Mặc định Unity có thể ngừng cập nhật animation khi renderer ra khỏi màn hình. Với nhân vật chính thì không cần tiết kiệm chỗ đó, và để luôn chạy thì camera vừa quay lại là thấy đúng tư thế.

Component **Player Animator** ở cuối ảnh là script ta viết ngay dưới đây.

## Một thay đổi nhỏ trong PlayerMotor

Script animation cần biết một cú double jump vừa xảy ra lúc nào, để phát clip lộn vòng đúng một lần. Bài 4 đã có `LastJump` cho biết kiểu nhảy gần nhất. Thêm thời điểm của nó vào `PlayerMotor.cs`, ngay dưới dòng `LastJump`:

```csharp
public JumpKind LastJump { get; private set; }
public float LastJumpAt { get; private set; } = -1f;
```

Và trong `Consume`, ghi lại thời điểm:

```csharp
private void Consume(JumpKind kind)
{
    bufferCounter = 0f;
    jumpCutDone = false;
    LastJump = kind;
    LastJumpAt = Time.fixedTime;
}
```

`LastJump` một mình không đủ: double jump hai lần liên tiếp (qua hai lần chạm đất) thì `LastJump` vẫn là `Air` cả hai lần, không đổi giá trị. `LastJumpAt` đổi sau mỗi cú nhảy nên phát hiện được cú mới.

## PlayerAnimator

Tạo `Assets/_Platformer/Scripts/Player/PlayerAnimator.cs`:

```csharp
using UnityEngine;

namespace Platformer.Player
{
    [RequireComponent(typeof(Animator), typeof(SpriteRenderer), typeof(PlayerMotor))]
    public sealed class PlayerAnimator : MonoBehaviour
    {
        public enum State { Idle, Run, Jump, DoubleJump, Fall, WallSlide, Hit }

        [SerializeField, Min(0f)] private float runThreshold = 0.5f;
        [SerializeField, Min(0f)] private float doubleJumpClipSeconds = 0.3f;

        public State Current { get; private set; } = State.Idle;

        private static readonly int IdleHash = Animator.StringToHash("Idle");
        private static readonly int RunHash = Animator.StringToHash("Run");
        private static readonly int JumpHash = Animator.StringToHash("Jump");
        private static readonly int DoubleJumpHash = Animator.StringToHash("Double_Jump");
        private static readonly int FallHash = Animator.StringToHash("Fall");
        private static readonly int WallHash = Animator.StringToHash("Wall_Jump");
        private static readonly int HitHash = Animator.StringToHash("Hit");

        private Animator animator;
        private SpriteRenderer sprite;
        private PlayerMotor motor;
        private float doubleJumpUntil = -1f;
        private float hitUntil = -1f;
        private float lastSeenJumpAt = -1f;

        private void Awake()
        {
            animator = GetComponent<Animator>();
            sprite = GetComponent<SpriteRenderer>();
            motor = GetComponent<PlayerMotor>();
            animator.Play(IdleHash);
        }

        public void PlayHit(float seconds = 0.35f) => hitUntil = Time.time + seconds;

        private void LateUpdate()
        {
            if (motor.LastJump == PlayerMotor.JumpKind.Air && motor.LastJumpAt != lastSeenJumpAt)
                doubleJumpUntil = Time.time + doubleJumpClipSeconds;
            lastSeenJumpAt = motor.LastJumpAt;

            var next = Derive();
            if (next != Current)
            {
                Current = next;
                animator.Play(Hash(next), 0, 0f);
            }
            sprite.flipX = motor.FacingSign < 0;
        }

        private State Derive()
        {
            if (Time.time < hitUntil) return State.Hit;
            if (motor.IsWallSliding) return State.WallSlide;
            if (!motor.IsGrounded)
            {
                if (Time.time < doubleJumpUntil) return State.DoubleJump;
                return motor.Velocity.y > 0f ? State.Jump : State.Fall;
            }
            return Mathf.Abs(motor.Velocity.x) > runThreshold ? State.Run : State.Idle;
        }

        private static int Hash(State s)
        {
            switch (s)
            {
                case State.Run: return RunHash;
                case State.Jump: return JumpHash;
                case State.DoubleJump: return DoubleJumpHash;
                case State.Fall: return FallHash;
                case State.WallSlide: return WallHash;
                case State.Hit: return HitHash;
                default: return IdleHash;
            }
        }
    }
}
```

Chọn `Player` và thêm component **Player Animator**. Không có ô nào cần kéo thả: `RequireComponent` đảm bảo Animator, SpriteRenderer và PlayerMotor đều nằm trên cùng object, và `Awake` tự lấy chúng.

### Derive: thứ tự ưu tiên là toàn bộ logic

`Derive` trả lời câu hỏi "lúc này nhân vật nên trông thế nào", chỉ dựa vào motor, không nhìn phím nào:

| Thứ tự | Điều kiện | Clip |
|---|---|---|
| 1 | vừa bị đánh, còn trong 0.35 giây | Hit |
| 2 | đang trượt tường | Wall_Jump |
| 3 | trên không, vừa double jump trong 0.3 giây | Double_Jump |
| 4 | trên không, đang bay lên | Jump |
| 5 | trên không, đang rơi | Fall |
| 6 | trên đất, chạy nhanh hơn 0.5 unit/giây | Run |
| 7 | còn lại | Idle |

Thứ tự này là nội dung chứ không phải chi tiết. Hit đứng đầu vì bị đánh thì phải thấy ngay, dù đang làm gì. Trượt tường đứng trước Jump và Fall, vì lúc trượt nhân vật đang rơi (`vy = -4`) và nếu xét Fall trước thì sẽ không bao giờ thấy tư thế bám tường.

Run dùng vận tốc thật chứ không dùng phím. Người chơi thả phím thì nhân vật còn trượt 0.08 giây (bài 2), và trong lúc đó chân vẫn nên chạy. Người chơi giữ phím sang phải mà đang áp sát tường thì vận tốc bằng 0, nhân vật đứng yên chứ không chạy tại chỗ vào tường.

### Animator.Play thay cho parameter

`animator.Play(hash, 0, 0f)` phát ngay clip có tên đó trên layer 0, từ đầu clip. Script chỉ gọi khi state thực sự đổi, nên Idle đang lặp không bị khởi động lại mỗi frame.

Tên trong `StringToHash` là tên state trong Animator, trùng tên clip vì Unity đặt state theo tên clip. Gõ sai một chữ thì `Play` không báo lỗi gì, nhân vật cứ đứng nguyên tư thế cũ. Nếu một trạng thái không bao giờ hiện ra, kiểm tên state trước tiên.

### Double jump có thời hạn

Clip `Double_Jump` dài 6 frame ở 20 khung/giây, tức 0.3 giây, và không lặp. Nếu cứ trên không sau một cú double jump là phát clip đó, nó sẽ chạy xong trong 0.3 giây rồi đứng im ở frame cuối suốt phần rơi còn lại. `doubleJumpUntil` giới hạn clip trong đúng 0.3 giây, hết thời gian thì `Derive` rơi về luật Jump hoặc Fall theo vận tốc dọc.

### Sheet Wall_Jump là tư thế bám tường

Tên file là `Wall_Jump`, nhưng năm frame bên trong không phải động tác bật tường:

![5 frame của Wall_Jump.png phóng to: nhân vật áp người vào mép phải, mặt nhìn sang trái](/images/posts/unity-platformer/06/walljump-sheet.webp)

Nhân vật áp sát vào một mặt phẳng ở bên phải, mặt nhìn sang trái. Đó là tư thế bám tường. Nên trong code state tên là `WallSlide` cho khỏi hiểu nhầm, còn hash vẫn trỏ vào clip `Wall_Jump`. Cú bật ra khỏi tường dùng luôn clip Jump như cú nhảy thường.

Vì hình vẽ áp tường ở bên phải, bám tường phải thì giữ nguyên hình, bám tường trái thì lật. `FacingSign` của motor khi trượt tường là hướng về phía tường (người chơi đang đẩy phím về phía đó), nên dòng `flipX = FacingSign < 0` cho ra đúng kết quả cả hai bên mà không cần xử lý riêng.

### Lật bằng flipX, không bằng scale

`sprite.flipX` chỉ lật hình vẽ. Cách hay gặp khác là đặt `transform.localScale.x = -1`, nhưng scale âm lật cả mọi thứ thuộc về transform đó: offset của collider, vị trí các object con, gizmo. Collider của ta đang nằm giữa nên lật hay không cũng vậy, nhưng nếu sau này bạn gắn thêm object con lệch sang một bên (một điểm bắn, một hiệu ứng dưới chân), scale âm sẽ kéo chúng sang phía bên kia theo. `flipX` không đụng tới những thứ đó.

## Kiểm tra

Bấm Play và thử chạy, nhảy, double jump, rồi vào khe bám tường. Mình ghi lại trạng thái animation từng frame qua hai lượt thử:

![Dòng thời gian trạng thái: lượt 1 Idle, Run, Jump, Fall, DoubleJump, Jump, Fall, WallSlide khi chạm cột, Fall, Idle; lượt 2 trong khe Idle, Run, Jump, WallSlide, Jump sau khi bật tường kèm flipX đổi, WallSlide dài, Fall, Idle](/images/posts/unity-platformer/06/state-timeline.webp)

Đường đen là độ cao của chân nhân vật, các dải màu là clip đang phát. Vài điều nên thấy khi bạn tự thử:

- Mỗi lần bấm nhảy, clip đổi sang Jump đúng lúc chân rời đất, và sang Fall đúng lúc bắt đầu rơi.
- Double jump phát cú lộn vòng khoảng một phần ba giây rồi quay về Jump hoặc Fall.
- Trượt tường thì thấy tư thế áp tường. Bật tường thì nhân vật quay mặt ra xa tường ngay lập tức (đường gạch trong lượt 2).
- Thả phím khi đang chạy: chân còn chạy một thoáng rồi mới về Idle.

![Hai tư thế chụp trong game: bám tường trái với hình đã lật, và cú lộn vòng của double jump](/images/posts/unity-platformer/06/poses.webp)

## Thêm một động tác mới

Giả sử bài sau bạn thêm động tác lướt (dash). Với Animator mạng nhện, bạn phải nối Dash với sáu state còn lại theo cả hai chiều và nghĩ điều kiện cho từng mũi tên. Ở đây chỉ cần:

1. Tạo clip `Dash`, Unity tự thêm state.
2. Thêm `Dash` vào enum `State` và một dòng hash.
3. Thêm một dòng vào `Derive` ở đúng thứ tự ưu tiên, ví dụ `if (motor.IsDashing) return State.Dash;` ngay dưới Hit.

Không có mũi tên nào để vẽ, và thứ tự ưu tiên của mọi động tác vẫn nằm gọn trong một hàm mười dòng.

## Bài sau

Mọi con số cảm giác của nhân vật (tốc độ, độ cao nhảy, số lần nhảy, có bám tường được không) đang nằm trong Inspector của một object. Bài 7 tách chúng ra thành asset để có ba nhân vật khác nhau từ cùng một prefab, mỗi nhân vật một controller animation riêng.
