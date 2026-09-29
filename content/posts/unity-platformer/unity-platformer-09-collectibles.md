---
title: "Platformer #9: Ngọc, thùng gỗ, cửa thoát và bảng va chạm"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 9
excerpt: "Cho căn phòng một mục tiêu: nhặt đủ 5 viên ngọc thì cửa mở. Một luật giẫm dùng chung cho thùng và địch, collider thùng đo theo hình vẽ, bộ đếm ngọc đứng im vì thứ tự hai dòng code, và ô bảng va chạm làm cả màn chơi không thắng được mà không có lỗi nào."
coverImage: "/images/posts/unity-platformer/09/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Physics 2D", "Layer", "Tutorial"]
published: true
featured: false
---

Căn phòng đã có thứ giết người chơi nhưng chưa có lý do để đi hết nó. Bài này đặt 5 viên ngọc rải khắp phòng, một cửa thoát chỉ mở khi nhặt đủ, và hai thùng gỗ chắn đường mà người chơi phải giẫm vỡ hoặc nhảy qua.

![Toàn cảnh căn phòng: 5 viên ngọc, 2 thùng, 2 lá cờ, 2 bẫy, điểm Spawn và cửa thoát sau hai cột](/images/posts/unity-platformer/09/room-goals.webp)

Nghe thì đơn giản. Nhưng trong lúc làm, mình gặp ba lỗi không lỗi nào hiện ra trong Console: bộ đếm ngọc đứng im ở 0 dù ngọc biến mất khỏi màn hình, thùng lơ lửng cách mặt cỏ 5 pixel, và người chơi đi xuyên qua thùng, lá cờ lẫn cửa thoát như thể chúng không tồn tại. Bài đi qua cả ba.

## Một luật cho mọi thứ bị giẫm

Thùng gỗ vỡ khi bị giẫm từ trên xuống. Bài 10 địch cũng chết khi bị giẫm, bài 11 và 12 cũng vậy. Nếu mỗi thứ tự viết phép kiểm tra "có phải giẫm không", sớm muộn sẽ có một chỗ viết lệch, và đó là hai lỗi kinh điển của platformer:

- Giẫm được khi đang bay lên. Người chơi nhảy từ dưới lên, đội đầu vào thùng treo, thùng vỡ. Hoặc tệ hơn, đụng địch từ bên dưới mà địch lại chết.
- Chết oan khi rõ ràng đã đạp lên đầu. Phép kiểm tra đòi chân phải cao hơn đỉnh mục tiêu, trong khi lúc Unity báo va chạm, hai collider đã lún vào nhau một chút.

Luật đúng có hai điều kiện: người chơi đang rơi (hoặc đứng yên theo chiều dọc), và chân không thấp hơn đỉnh mục tiêu quá một khoảng nhỏ.

![Ba trường hợp: đang rơi và chân trên đỉnh thùng thì tính là giẫm; đang bay lên đội đầu thì không tính; đụng cạnh với chân thấp hơn đỉnh quá 0.35 thì không tính](/images/posts/unity-platformer/09/stomp-check.webp)

Viết luật này một lần, ở một chỗ. Tạo `Assets/_Platformer/Scripts/Common/StompCheck.cs`:

```csharp
using UnityEngine;

namespace Platformer.Common
{
    public static class StompCheck
    {
        public static bool IsStomp(float playerBottom, float targetTop, float playerVelocityY, float tolerance = 0.35f)
        {
            // Must be falling. A rising player touching the top is a head-bump, not a stomp.
            if (playerVelocityY > 0.01f) return false;
            // Feet must be at or above the target's top edge, within a tolerance for the
            // overlap that has already happened during this physics step.
            return playerBottom >= targetTop - tolerance;
        }

        public static bool IsStomp(Collider2D player, Collider2D target, Vector2 playerVelocity, float tolerance = 0.35f)
            => IsStomp(player.bounds.min.y, target.bounds.max.y, playerVelocity.y, tolerance);
    }
}
```

`static class` vì nó không giữ trạng thái gì, chỉ là một phép so sánh. Hàm thứ hai nhận thẳng hai collider cho tiện: đáy collider người chơi và đỉnh collider mục tiêu đều lấy từ `bounds`.

`0.01` thay vì `0` vì vận tốc dọc lúc đứng trên mặt đất không bao giờ đúng bằng 0 tuyệt đối. Còn `tolerance = 0.35`: với thùng gỗ, lúc Unity báo va chạm thì chân người chơi nằm trên đỉnh thùng 0.015 unit (đúng khoảng đệm Physics 2D đã gặp ở bài 1), nên dung sai gần như không dùng tới. Nó dành cho địch ở bài 10, nơi hai collider có thể lún vào nhau trước khi Unity kịp báo.

## Thùng gỗ

### Pivot theo hình vẽ, không theo ô

Mở `Objects/Boxes/1_Idle.png` trong Sprite Editor. Ô sprite là 32 × 32 pixel, nhưng cái thùng chỉ chiếm 22 × 22 ở giữa ô, chừa 5 pixel trống ở mỗi phía, kể cả phía dưới:

![Sprite Editor của 1_Idle.png: thùng 22x22 nằm giữa ô 32x32, khoảng trống 5 pixel ở đáy được đánh dấu, Pivot Custom 0.5, 0.15625](/images/posts/unity-platformer/09/box-sprite-editor.webp)

Bài 0 đặt pivot ở đáy cho nhân vật để `transform.position` là chỗ chân chạm đất. Thùng cũng cần điều đó, nhưng `Bottom Center` ở đây là đáy ô, thấp hơn đáy thùng 5 pixel. Đặt thùng ở y = 2 (mặt sàn) thì hình vẽ bắt đầu từ y = 2.3125 và lơ lửng. Để pivot `Center` rồi đặt thùng ở y = 3 cũng ra đúng kết quả đó.

Cách đúng là đặt pivot ở đáy của hình vẽ. Trong Sprite Editor, panel Sprite ở góc dưới phải:

1. **Pivot**: chọn `Custom`.
2. **Pivot Unit Mode**: `Normalized`.
3. **Custom Pivot**: X `0.5`, Y `0.15625`. Con số này là 5 ÷ 32: khoảng trống 5 pixel chia chiều cao ô 32 pixel.
4. Bấm **Apply**.

Làm y hệt cho `1_Break.png`. `1_Hit.png` là sheet 96 × 32 gồm 3 frame: cắt Grid By Cell Size `32 × 32`, rồi đặt Custom Pivot `(0.5, 0.15625)` cho cả 3 frame (chọn từng frame, sửa ở panel Sprite). Frame 0 của Hit là thùng ép dẹp màu trắng, đó là chớp trắng lúc bị giẫm, không phải lỗi import.

Collider cũng theo hình vẽ. Box Collider 2D tự lấy kích thước cả ô là 2 × 2 unit, rộng hơn thùng 5 pixel mỗi bên. Người chơi sẽ bị chặn khi còn cách thùng một khoảng thấy rõ, và giẫm trúng khoảng không phía trên thùng. Kích thước đúng là 22 pixel = 1.375 unit, và vì pivot giờ ở đáy thùng, tâm collider cao hơn pivot nửa chiều cao: Offset `(0, 0.6875)`.

![Bên trái: pivot giữa ô, collider cả ô 2x2, hình thùng lơ lửng trên cỏ. Bên phải: pivot ở đáy hình vẽ, collider 1.375 ôm sát thùng nằm trên cỏ](/images/posts/unity-platformer/09/box-pivot-wrong-vs-right.webp)

Lỗi này dễ lọt vì 5 pixel ở độ zoom bình thường chỉ là một khe mảnh giữa thùng và cỏ. Trong project của mình, người chơi thử đầu tiên nhìn ra khe hở này trước mọi công cụ kiểm tra mình có.

### Thùng đặc, không phải trigger

Ngọc là trigger: người chơi đi xuyên qua và nhặt. Thùng thì khác, người chơi phải bị nó chặn lại. Tiêu chí chung cho cả series: thứ gì chặn đường hoặc đứng lên được thì collider đặc, thứ gì chỉ cần phát hiện chạm thì trigger.

Collider đặc báo va chạm qua `OnCollisionEnter2D` thay vì `OnTriggerEnter2D`. Tạo `Assets/_Platformer/Scripts/Level/BreakableBox.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Level
{
    [RequireComponent(typeof(BoxCollider2D), typeof(SpriteRenderer))]
    public sealed class BreakableBox : MonoBehaviour
    {
        [Header("Looks")]
        [SerializeField] private Sprite idle;
        [SerializeField] private Sprite[] hitFrames;
        [SerializeField] private Sprite breakSprite;
        [SerializeField, Min(1f)] private float hitFps = 20f;

        [Header("Behaviour")]
        [SerializeField, Min(1)] private int hitsToBreak = 1;
        [SerializeField, Min(0f)] private float bounceVelocity = 20f;
        [SerializeField, Min(0f)] private float breakLinger = 0.2f;

        public bool Broken { get; private set; }
        public System.Action<BreakableBox> BrokenEvent;

        private SpriteRenderer sr;
        private BoxCollider2D col;
        private int hits;
        private float hitAnimUntil;
        private int hitFrame;

        private void Awake()
        {
            sr = GetComponent<SpriteRenderer>();
            col = GetComponent<BoxCollider2D>();
            col.isTrigger = false;             // solid: the player stands on it
            if (idle != null) sr.sprite = idle;
        }

        private void Update()
        {
            if (Broken || Time.time >= hitAnimUntil || hitFrames == null || hitFrames.Length == 0) return;
            var elapsed = hitFrames.Length / hitFps - (hitAnimUntil - Time.time);
            var f = Mathf.Clamp(Mathf.FloorToInt(elapsed * hitFps), 0, hitFrames.Length - 1);
            if (f != hitFrame) { hitFrame = f; sr.sprite = hitFrames[f]; }
        }

        private void OnCollisionEnter2D(Collision2D collision)
        {
            if (Broken) return;
            var motor = collision.collider.GetComponentInParent<Player.PlayerMotor>();
            if (motor == null) return;

            var playerCol = collision.collider;
            if (!StompCheck.IsStomp(playerCol, col, motor.Velocity)) return;

            hits++;
            var body = motor.GetComponent<Rigidbody2D>();
            if (body != null) body.linearVelocity = new Vector2(body.linearVelocity.x, bounceVelocity);

            if (hits >= hitsToBreak) Break();
            else PlayHit();
        }

        private void PlayHit()
        {
            if (hitFrames == null || hitFrames.Length == 0) return;
            hitFrame = -1;
            hitAnimUntil = Time.time + hitFrames.Length / hitFps;
        }

        private void Break()
        {
            Broken = true;
            col.enabled = false;
            if (breakSprite != null) sr.sprite = breakSprite;
            BrokenEvent?.Invoke(this);
            if (breakLinger > 0f) Invoke(nameof(HideNow), breakLinger);
            else HideNow();
        }

        private void HideNow() => gameObject.SetActive(false);
    }
}
```

Mỗi lần người chơi chạm thùng, `OnCollisionEnter2D` hỏi `StompCheck`. Đi ngang đụng cạnh hay đội đầu từ dưới thì trả về false và không có gì xảy ra: thùng đơn giản là một khối chặn. Còn đáp xuống từ trên thì mỗi lần đáp là một cú giẫm. Người chơi được bật lên, thùng chớp trắng (3 frame Hit) nếu chưa đủ số lần, hoặc chuyển sang sprite vỡ, tắt collider ngay để người chơi rơi xuyên qua, rồi 0.2 giây sau tắt hẳn object.

Animation Hit ở đây tự đếm frame trong `Update` chứ không dùng `SpriteSequence` của bài 8, vì nó chỉ phát trong 0.15 giây rồi phải trả sprite về như cũ, và thùng không cần thêm component nào.

`bounceVelocity = 20` thấp hơn lực nhảy 27.5 của bài 3 là có chủ đích. Nảy lên từ 20 unit/giây chỉ cao khoảng 2.7 unit (đo ở mục Kiểm tra), trong khi nhảy thường cao 5.2. Giẫm thùng giúp thoát ra nhưng không thay được một cú nhảy đầy, nên không phá được các khoảng cách độ cao mình đã tính cho căn phòng.

### Dựng thùng trong scene

1. Trong `Level`, tạo `Box_1` ở `(20, 2, 0)`, ngay trên mặt sàn.
2. **Sprite Renderer**: sprite `1_Idle`, Order in Layer `40`.
3. **Box Collider 2D**: Size `(1.375, 1.375)`, Offset `(0, 0.6875)`, Is Trigger để trống.
4. **Breakable Box**: Idle `1_Idle`, kéo 3 sprite `1_Hit_0` tới `1_Hit_2` vào Hit Frames, Break Sprite `1_Break`, **Hits To Break** `2`.
5. Layer: để mục sau quyết định.

![Inspector của Box_1: layer Ground, Box Collider 2D offset 0 0.6875 size 1.375, Breakable Box với Idle, 3 Hit Frames, Break Sprite, Hit Fps 20, Hits To Break 2, Bounce Velocity 20, Break Linger 0.2](/images/posts/unity-platformer/09/box-inspector.webp)

Nhân bản thành `Box_2` ở `(28, 2, 0)`, trước bậc thang.

## Thùng thuộc layer nào: bảng va chạm

Mỗi GameObject nằm trên một layer. Physics 2D có một bảng quyết định cặp layer nào chạm được nhau: **Edit > Project Settings > Physics 2D**, tab **Layer Collision Matrix**. Ô có dấu tick thì hai layer đó va chạm và gọi trigger cho nhau. Ô trống thì Unity coi như chúng không tồn tại với nhau: không chặn, không trigger, không báo gì.

Đây là bảng trong project của mình lúc dựng bài này:

![Layer Collision Matrix: ô hàng Default cột Player bỏ trống, được khoanh đỏ](/images/posts/unity-platformer/09/collision-matrix.webp)

Ô `Default × Player` trống. Project này dùng chung với series shmup, và ô này bị tắt từ hồi làm game đó. Một ô thừa lại từ game khác.

Lần đầu dựng, mình để thùng ở layer `Default`. Kết quả:

![Bên trái: thùng ở layer Ground, nhân vật bị chặn ngay trước thùng. Bên phải: thùng ở layer Default, nhân vật đi xuyên qua thùng](/images/posts/unity-platformer/09/box-blocked-vs-through.webp)

Chạy từ x = 16 sang phải: thùng ở `Ground` thì nhân vật dừng ở x = 18.70, mép collider chạm mép thùng. Thùng ở `Default` thì nhân vật đi thẳng tới x = 20.5 và còn đi tiếp được. Không lỗi, không cảnh báo. Lá cờ và cửa thoát cũng từng ở `Default`, nên cờ không bao giờ kéo lên và cửa không bao giờ nhận người chơi. Cả màn chơi không thể thắng, và Console sạch trơn.

Bảng va chạm là một phần luật chơi, nhưng nó không nằm trong code, không nằm trong scene hay prefab, nên đọc lại code bao nhiêu lần cũng không thấy. Mỗi khi thêm một loại object người chơi phải chạm, hãy mở bảng này ra và kiểm tra cặp của nó với `Player`.

Project mới tạo có mọi ô đều tick, nên có thể bảng của bạn đang đúng. Dù vậy, mỗi loại object vẫn nên có layer riêng thay vì dùng chung `Default`, để khi cần tắt một cặp thì không kéo theo thứ khác. Thêm User Layer `Pickup` ở **Tags and Layers** (bài 8 đã có `Hazard` và `Interactable`), rồi xếp:

| Object | Layer | Vì sao |
|---|---|---|
| Thùng | `Ground` | Thùng là địa hình: chặn người chơi, và bài 10 địch đi tuần sẽ coi nó là tường để quay đầu |
| Ngọc | `Pickup` | Trigger để nhặt |
| Lá cờ, cửa thoát | `Interactable` | Trigger người chơi chạm để kích hoạt |
| Bẫy | `Hazard` | Đã làm ở bài 8 |

Rồi mở bảng va chạm, kiểm tra hàng `Player` (hoặc cột `Player`, cùng một ô) có tick ở cả bốn layer `Ground`, `Pickup`, `Interactable`, `Hazard`.

Đặt `Box_1` và `Box_2` vào layer `Ground`.

## Ngọc và RoomState

### Căn phòng tự đếm ngọc

Cửa cần biết khi nào đủ ngọc. Cách dễ nghĩ ra nhất là gõ `gemsTotal = 5` vào Inspector của cửa. Đến lúc thêm viên thứ sáu mà quên sửa số, người chơi nhặt năm viên là cửa mở, viên thứ sáu thành đồ trang trí.

Thay vào đó, mỗi viên ngọc tự báo với căn phòng lúc bắt đầu, và tổng là số viên đã báo. Tạo `Assets/_Platformer/Scripts/Level/RoomState.cs`:

```csharp
using System.Collections.Generic;
using UnityEngine;

namespace Platformer.Level
{
    public sealed class RoomState : MonoBehaviour
    {
        public int GemsTotal { get; private set; }
        public int GemsCollected { get; private set; }
        public bool AllGemsCollected => GemsTotal > 0 && GemsCollected >= GemsTotal;
        public bool Completed { get; private set; }

        public System.Action<int, int> GemChanged;   // collected, total
        public System.Action AllCollected;
        public System.Action RoomCompleted;

        private readonly List<Collectible> gems = new List<Collectible>();

        public void Register(Collectible gem)
        {
            if (gems.Contains(gem)) return;
            gems.Add(gem);
            GemsTotal = gems.Count;
            // The total changing is a change too: whoever shows the count must not
            // depend on running its Start after every gem's Start.
            GemChanged?.Invoke(GemsCollected, GemsTotal);
        }

        public void Collect(Collectible gem)
        {
            if (!gems.Contains(gem) || gem.Taken) return;
            GemsCollected++;
            GemChanged?.Invoke(GemsCollected, GemsTotal);
            if (AllGemsCollected) AllCollected?.Invoke();
        }

        public void Complete()
        {
            if (Completed) return;
            Completed = true;
            RoomCompleted?.Invoke();
        }

        public void ResetRoom()
        {
            foreach (var g in gems) g.Restore();
            GemsCollected = 0;
            Completed = false;
            GemChanged?.Invoke(0, GemsTotal);
        }
    }
}
```

`RoomState` phát ba sự kiện: `GemChanged` mỗi khi số đếm hoặc tổng đổi, `AllCollected` khi đủ, `RoomCompleted` khi người chơi vào cửa. Cửa nghe `AllCollected`, bài 15 thanh HUD nghe `GemChanged`. `Register` cũng phát `GemChanged` vì tổng thay đổi cũng là một thay đổi: ai hiển thị số đếm sẽ nhận được "0/5" dù `Start` của nó chạy trước hay sau `Start` của các viên ngọc. `ResetRoom` trả mọi viên về chỗ cũ, dùng khi chơi lại cả phòng, còn chết thường thì ngọc đã nhặt vẫn giữ.

Thêm component **Room State** vào object `Room` (object đang giữ `RoomBounds` từ bài 5).

### Viên ngọc

Tạo `Assets/_Platformer/Scripts/Level/Collectible.cs`:

```csharp
using UnityEngine;

namespace Platformer.Level
{
    [RequireComponent(typeof(Collider2D), typeof(SpriteRenderer))]
    public sealed class Collectible : MonoBehaviour
    {
        [SerializeField] private RoomState room;
        [SerializeField, Min(0f)] private float bobAmplitude = 0.15f;
        [SerializeField, Min(0f)] private float bobSpeed = 2f;

        public bool Taken { get; private set; }

        private SpriteRenderer sr;
        private Collider2D col;
        private Vector3 basePosition;

        private void Awake()
        {
            sr = GetComponent<SpriteRenderer>();
            col = GetComponent<Collider2D>();
            col.isTrigger = true;
            basePosition = transform.position;
        }

        private void Start()
        {
            if (room == null) room = FindFirstObjectByType<RoomState>();
            if (room != null) room.Register(this);
        }

        private void Update()
        {
            if (Taken || bobAmplitude <= 0f) return;
            var offset = Mathf.Sin(Time.time * bobSpeed + basePosition.x) * bobAmplitude;
            transform.position = basePosition + new Vector3(0f, offset, 0f);
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (Taken) return;
            if (other.GetComponentInParent<Player.PlayerMotor>() == null) return;
            Take();
        }

        public void Take()
        {
            if (Taken) return;
            // Tell the room FIRST: RoomState.Collect rejects gems that are already taken,
            // so flipping the flag before the call silently loses the count.
            if (room != null) room.Collect(this);
            Taken = true;
            sr.enabled = false;
            col.enabled = false;
        }

        public void Restore()
        {
            Taken = false;
            sr.enabled = true;
            col.enabled = true;
            transform.position = basePosition;
        }
    }
}
```

Viên ngọc nhấp nhô 0.15 unit theo hàm sin cho sống động. Cộng thêm `basePosition.x` vào pha để các viên không nhấp nhô cùng nhịp. Khi nhặt, nó chỉ tắt hình và collider chứ không `Destroy`, để `Restore` bật lại được.

Chú thích trong `Take` nói về một lỗi. Mục sau kể về nó.

### Đặt 5 viên ngọc

Bộ art có 5 sheet ngọc `Objects/Gems/1.png` tới `5.png`, mỗi sheet 112 × 16 là 7 frame 16 × 16 của viên ngọc đang xoay. Cắt Grid By Cell Size `16 × 16`, pivot để `Center`. Khác thùng và nhân vật, ngọc được vẽ để lơ lửng, nên tâm là điểm tự nhiên nhất.

Với mỗi viên, trong `Level`:

1. Tạo `Gem_1`, layer `Pickup`.
2. **Sprite Renderer**: sprite frame 0 của sheet, Order in Layer `50`.
3. **Circle Collider 2D**: Radius `0.6`, tick Is Trigger. Đường kính 1.2 unit, lớn hơn hình ngọc 1 unit, để chạm sượt qua vẫn nhặt được.
4. **Collectible**: kéo `Room` vào ô Room.
5. **Sprite Sequence** (bài 8): kéo 7 frame vào Frames, Fps `10`, Loop và Play On Enable bật.

![Inspector của Gem_1: layer Pickup, Circle Collider 2D trigger radius 0.6, Collectible với Room, Bob Amplitude 0.15, Bob Speed 2, Sprite Sequence 7 frame fps 10 loop](/images/posts/unity-platformer/09/gem-inspector.webp)

Vị trí mỗi viên được chọn để lấy nó phải dùng một kỹ năng đã học. Mình đã cho nhân vật đi thử từng đoạn bằng input thật (đi, nhảy, nhả nút), cột cuối là chỗ nhân vật đứng lúc nhặt:

| Ngọc | Vị trí | Nằm ở đâu | Cách lấy | Nhặt lúc nhân vật ở |
|---|---|---|---|---|
| 1 | (12, 8.5) | Trên bệ 1 | Nhảy từ sàn lên bệ 1, bắt nhảy cách mép trái khoảng 3 ô | (10.86, 7.11), vừa đáp |
| 2 | (27, 13.4) | Trên bệ 2, bên phải bẫy B | Nhảy qua bẫy B | (27.28, 14.01), đang rơi xuống |
| 3 | (38, 18.5) | Trên bệ 3 | Từ bệ 2 phải nhảy đôi (bài 4) | (36.81, 17.03), vừa đáp |
| 4 | (56.5, 5.5) | Sau cột phải, cao 3.5 trên sàn | Vượt hai cột rồi nhảy tại chỗ | (57.40, 3.50), đang nhảy |
| 5 | (30, 5.5) | Trên bậc thấp, sau thùng 2 | Nhảy thấp qua thùng 2 | (28.95, 4.60), đang rơi |

Ngọc 3 là chỗ bài 4 được dùng tới: bệ 3 cao hơn bệ 2 năm ô và cách mép bệ 2 năm ô. Nhảy thường lên tới 5.2 unit, nhưng lúc lên tới đó nhân vật mới đi ngang được khoảng 3.4 ô, chưa qua được mép bệ 3. Cú nhảy thứ hai giữa không trung đưa nó lên 21.2 và đáp gọn ở x = 36.8.

Ngọc 4 nằm sau hai cột cao tới y = 23. Đường đi mình đã thử: từ mép phải bệ 3 nhảy đôi lên đỉnh cột trái (chân đáp ở y = 23.015), nhảy thường sang đỉnh cột phải, rồi thả xuống phía bên kia.

## Vì sao ngọc biến mất mà bộ đếm đứng im

Chưa có HUD (bài 15 mới làm), nên để thấy số đếm, mình tạm dùng một script in ra Console. Tạo `Assets/_Platformer/Scripts/Debug/RoomLog.cs`, thêm nó vào object `Room`, rồi kéo chính `Room` vào ô Room của nó:

```csharp
using UnityEngine;
using Platformer.Level;

namespace Platformer.Debugging
{
    // Temporary: prints what the room reports until the HUD exists.
    public sealed class RoomLog : MonoBehaviour
    {
        [SerializeField] private RoomState room;

        private void OnEnable()
        {
            room.GemChanged += OnGem;
            room.AllCollected += OnAll;
            room.RoomCompleted += OnDone;
        }

        private void OnDisable()
        {
            room.GemChanged -= OnGem;
            room.AllCollected -= OnAll;
            room.RoomCompleted -= OnDone;
        }

        private void OnGem(int collected, int total) => Debug.Log($"Ngọc {collected}/{total}");
        private void OnAll() => Debug.Log("Đủ ngọc, cửa mở");
        private void OnDone() => Debug.Log("Qua phòng");
    }
}
```

Namespace là `Platformer.Debugging` chứ không phải `Platformer.Debug`: đặt tên `Debug` thì trong namespace đó `Debug.Log` sẽ trỏ nhầm vào namespace của mình thay vì `UnityEngine.Debug`.

Bản `Take` đầu tiên của mình viết thế này:

```csharp
public void Take()
{
    if (Taken) return;
    Taken = true;
    if (room != null) room.Collect(this);
    sr.enabled = false;
    col.enabled = false;
}
```

Đọc lướt thì hợp lý: đánh dấu đã nhặt, báo phòng, tắt hình. Chạy thử, nhặt hai viên, Console in ra:

```
Ngọc 0/1
Ngọc 0/2
Ngọc 0/3
Ngọc 0/4
Ngọc 0/5
```

Năm dòng đầu là lúc các viên ngọc đăng ký. Sau đó hai viên biến mất khỏi màn hình, nhưng không có thêm dòng nào. `GemsCollected` vẫn là 0, cửa sẽ không bao giờ mở.

Thử tìm lỗi trước khi đọc tiếp. Gợi ý nằm ở dòng đầu tiên của `RoomState.Collect`.

`Collect` có một điều kiện chặn: `if (!gems.Contains(gem) || gem.Taken) return;`, để một viên không bị đếm hai lần. `Take` cũng có điều kiện chặn của nó: `if (Taken) return;`. Cả hai cùng bảo vệ một điều: mỗi viên chỉ được đếm một lần. Nhưng bản `Take` trên đặt `Taken = true` trước khi gọi `Collect`, nên khi `Collect` hỏi "viên này nhặt chưa", câu trả lời đã là rồi. Nó return, không đếm, không phát sự kiện.

Sửa bằng cách đổi thứ tự: báo phòng trước, đánh dấu sau, như bản `Take` ở trên. Điều kiện `if (Taken) return;` ở đầu `Take` vẫn giữ nên nhặt hai lần vẫn bị chặn. Chạy lại cả phòng:

```
Ngọc 0/1
Ngọc 0/2
Ngọc 0/3
Ngọc 0/4
Ngọc 0/5
Ngọc 1/5
Ngọc 2/5
Ngọc 3/5
Ngọc 4/5
Ngọc 5/5
Đủ ngọc, cửa mở
Qua phòng
```

Lỗi này nguy hiểm vì nó trông như chạy đúng: ngọc biến mất khi chạm, không có exception nào. Chỉ đọc số đếm mới thấy. Hai điều rút ra: khi hai class cùng kiểm tra một điều kiện, thứ tự gọi quyết định cái nào thắng; và "không có lỗi trong Console" không có nghĩa là game đúng.

## Cửa thoát

Cửa là một cái cúp. Bộ art có hai sheet 448 × 64 trong `Objects/Checkpoints`: `End_Idle` là cúp vàng lấp lánh 7 frame, `End_Pressed` là động tác lúc chạm, mở đầu bằng 2 frame bóng trắng của cúp. Bộ art không có hình cúp khoá, nên mình dùng frame bóng trắng `End_Pressed_0` làm dáng chưa mở: người chơi thấy cửa ở đâu nhưng biết nó chưa sáng. Cắt cả hai sheet thành ô `64 × 64`, pivot `Bottom Center`.

Tạo `Assets/_Platformer/Scripts/Level/LevelExit.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Level
{
    [RequireComponent(typeof(Collider2D), typeof(SpriteRenderer), typeof(SpriteSequence))]
    public sealed class LevelExit : MonoBehaviour
    {
        [SerializeField] private RoomState room;
        [Header("Looks")]
        [SerializeField] private Sprite lockedSprite;
        [SerializeField] private Sprite[] openFrames;
        [SerializeField, Min(1f)] private float fps = 20f;

        public bool IsOpen { get; private set; }
        public System.Action Entered;

        private SpriteSequence seq;
        private SpriteRenderer sr;

        private void Awake()
        {
            seq = GetComponent<SpriteSequence>();
            sr = GetComponent<SpriteRenderer>();
            GetComponent<Collider2D>().isTrigger = true;
        }

        private void Start()
        {
            if (room == null) room = FindFirstObjectByType<RoomState>();
            seq.Stop();
            if (lockedSprite != null) sr.sprite = lockedSprite;
            if (room != null)
            {
                room.AllCollected += Open;
                if (room.AllGemsCollected) Open();
            }
        }

        private void OnDestroy()
        {
            if (room != null) room.AllCollected -= Open;
        }

        public void Open()
        {
            if (IsOpen) return;
            IsOpen = true;
            if (openFrames != null && openFrames.Length > 0) seq.Play(openFrames, fps, true);
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (!IsOpen) return;
            if (other.GetComponentInParent<Player.PlayerMotor>() == null) return;
            if (room != null) room.Complete();
            Entered?.Invoke();
        }
    }
}
```

Cửa không tự đếm ngọc, nó chỉ nghe `AllCollected`. Dòng `if (room.AllGemsCollected) Open();` trong `Start` phòng trường hợp phòng đã đủ ngọc trước khi cửa kịp đăng ký nghe, ví dụ khi quay lại một phòng đã xong. `OnDestroy` gỡ đăng ký để `RoomState` không giữ tham chiếu tới một cửa đã bị huỷ.

Khi cửa khoá, người chơi đi xuyên qua cúp và không có gì xảy ra. Khi mở, chạm vào là `room.Complete()`. Bài 15 sẽ nghe việc qua phòng để hiện bảng qua màn và nút sang màn kế.

Tạo `LevelExit` ở `(59, 2, 0)` trong `Level`:

1. Layer `Interactable`.
2. **Sprite Renderer**: sprite `End_Pressed_0`, Order in Layer `10`.
3. **Sprite Sequence**: bỏ tick Play On Enable, để trống Frames.
4. **Box Collider 2D**: Size `(2.5, 3)`, Offset `(0, 1.75)`, tick Is Trigger.
5. **Level Exit**: kéo `Room` vào, Locked Sprite `End_Pressed_0`, 7 sprite `End_Idle_0` tới `End_Idle_6` vào Open Frames.

![Inspector của LevelExit: layer Interactable, Sprite Sequence không tự phát, Box Collider 2D trigger offset 0 1.75 size 2.5 3, Level Exit với Room, Locked Sprite End_Pressed_0, 7 Open Frames, Fps 20](/images/posts/unity-platformer/09/exit-inspector.webp)

![Bên trái: chưa đủ 5 ngọc, cúp là bóng trắng, nhân vật đứng xuyên qua. Bên phải: đủ 5 ngọc, cúp vàng sáng](/images/posts/unity-platformer/09/exit-locked-vs-open.webp)

## Kiểm tra

Mình cho nhân vật đi từng đoạn bằng input thật và ghi lại:

- Chạy vào `Box_1` từ bên trái: dừng ở x = 18.70, không vỡ.
- Thả từ y = 7 xuống `Box_1`: chạm thùng sau 0.26 giây, chân cao hơn đỉnh thùng 0.015. Bật lên với vận tốc 20, cao tới 2.7 unit trên đỉnh thùng. Rơi xuống lần hai 0.52 giây sau thì thùng vỡ, người vẫn được bật lên rồi rơi xuyên qua chỗ thùng xuống sàn.

![Ba khung: giẫm lần 1 thùng chớp trắng và người nảy lên, thùng về dáng cũ, giẫm lần 2 thùng vỡ](/images/posts/unity-platformer/09/stomp-sequence.webp)

- Nhặt ngọc 5, 1, 2, 4 rồi chạy vào cửa: đi xuyên qua cúp trắng, không có "Qua phòng".
- Nhặt nốt ngọc 3: Console in "Ngọc 5/5" và "Đủ ngọc, cửa mở" cùng lúc, cúp chuyển sang vàng. Chạy vào cửa từ x = 57: "Qua phòng" khi nhân vật tới x = 57.18, đúng lúc mép phải collider (57.78) chạm mép trái vùng trigger của cửa (57.75).

Tự thử bằng tay:

- Đi vào thùng từ hai phía: bị chặn. Nhảy lên thùng: nảy, lần hai thì vỡ.
- Chết ở bẫy sau khi đã nhặt vài viên: hồi sinh ở cờ, số ngọc đã nhặt vẫn giữ nguyên, ngọc không hiện lại.
- Nhân bản một viên ngọc thành viên thứ sáu, bấm Play: Console in tới "Ngọc 0/6" mà bạn không sửa số nào.
- Mở bảng va chạm, tạm bỏ tick ô `Interactable × Player`: cờ không kéo lên, cửa không nhận. Tick lại.

Khi đã có HUD ở bài 15, xoá `RoomLog` khỏi `Room`.

## Bài sau

Căn phòng giờ có mục tiêu và có thứ chặn đường, nhưng mọi thứ đều đứng yên. Bài 10 thêm kẻ địch đi tuần qua lại trên bệ mà không rơi khỏi mép, và giẫm lên chúng bằng đúng `StompCheck` vừa viết.
