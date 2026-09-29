---
title: "Platformer #8: Chết và hồi sinh mà không load lại scene"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 8
excerpt: "Bẫy, checkpoint, và một chuỗi chết rồi hồi sinh 0.8 giây không cần load lại scene. Collider của bẫy phải đo từ hình vẽ, và 1.2 giây bất tử sau khi hiện ra để không rơi vào vòng lặp chết."
coverImage: "/images/posts/unity-platformer/08/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Checkpoint", "Respawn", "Tutorial"]
published: true
featured: false
---

Nhân vật đã chạy nhảy tử tế, giờ cần thứ để thua. Bài này thêm bẫy, cách chết, checkpoint, và hồi sinh. Hết bài, chạm bẫy thì nhân vật biến mất, 0.8 giây sau hiện ra ở lá cờ gần nhất đã chạm, và trong 1.2 giây đầu không gì giết được nó.

![Bốn khung: chạy tới bàn dập, chết và biến mất tại chỗ, hiện ra ở điểm hồi sinh, điều khiển lại](/images/posts/unity-platformer/08/death-sequence.webp)

## Vì sao không load lại scene

Series shmup khởi động lại bằng `SceneManager.LoadScene`: thua thì load lại màn, mọi thứ về trạng thái ban đầu. Với shmup như vậy là đủ, vì một lần chơi kết thúc khi thua.

Platformer thì khác. Người chơi có thể chết mấy chục lần trong một màn, và mỗi lần chỉ muốn quay lại lá cờ gần nhất. Load lại scene vừa chậm (mất cả nửa giây nhìn màn hình trống), vừa xoá sạch những gì họ đã làm được: lá cờ đã cắm, viên ngọc đã nhặt ở bài 9. Nên bài này không đụng tới scene. Nhân vật chết thì chính object đó được dời về checkpoint và bật lại.

## SpriteSequence: animation không cần Animator

Bẫy và lá cờ đều có animation, nhưng đơn giản hơn nhân vật nhiều: bẫy lặp một dãy 7 frame, lá cờ phát một dãy rồi chuyển sang dãy khác. Tạo Animator Controller cho từng thứ như vậy là quá tay. Bài 6 dùng Animator cho nhân vật vì nó có bảy trạng thái và logic chọn trạng thái. Với một dãy sprite phát theo thứ tự, một script nhỏ là đủ.

Tạo `Assets/_Platformer/Scripts/Common/SpriteSequence.cs`:

```csharp
using UnityEngine;

namespace Platformer.Common
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class SpriteSequence : MonoBehaviour
    {
        [SerializeField] private Sprite[] frames;
        [SerializeField, Min(1f)] private float fps = 20f;
        [SerializeField] private bool loop = true;
        [SerializeField] private bool playOnEnable = true;

        public bool IsPlaying { get; private set; }
        public bool Finished { get; private set; }
        public System.Action Completed;

        private SpriteRenderer sr;
        private float t;
        private int index;

        private SpriteRenderer Renderer => sr != null ? sr : (sr = GetComponent<SpriteRenderer>());

        private void Awake() { sr = GetComponent<SpriteRenderer>(); }
        private void OnEnable() { if (playOnEnable) Play(); }

        public void Play(Sprite[] newFrames = null, float? newFps = null, bool? newLoop = null)
        {
            if (newFrames != null) frames = newFrames;
            if (newFps.HasValue) fps = newFps.Value;
            if (newLoop.HasValue) loop = newLoop.Value;
            if (frames == null || frames.Length == 0) { IsPlaying = false; return; }
            t = 0f; index = 0; IsPlaying = true; Finished = false;
            Renderer.sprite = frames[0];
        }

        public void Stop() { IsPlaying = false; }

        private void Update()
        {
            if (!IsPlaying) return;
            t += Time.deltaTime;
            var next = Mathf.FloorToInt(t * fps);
            if (next == index) return;
            if (next >= frames.Length)
            {
                if (loop) { t -= frames.Length / fps; next %= frames.Length; }
                else { index = frames.Length - 1; Renderer.sprite = frames[index]; IsPlaying = false; Finished = true; Completed?.Invoke(); return; }
            }
            index = next;
            Renderer.sprite = frames[index];
        }
    }
}
```

`Play` có thể gọi không tham số để phát lại dãy đã gán trong Inspector, hoặc truyền dãy mới, tốc độ mới, có lặp hay không. Khi một dãy không lặp chạy tới frame cuối, nó gọi `Completed`. Lá cờ sẽ dùng sự kiện này để chuyển từ động tác kéo cờ sang cờ bay.

Property `Renderer` lấy SpriteRenderer lúc cần chứ không chỉ trong `Awake`. Trong cùng một GameObject, Unity chạy `Awake` rồi `OnEnable` của từng component lần lượt, nên nếu script khác trên cùng object gọi `Play` trong `OnEnable` của nó trước khi `Awake` của SpriteSequence chạy, `sr` vẫn là null. Lấy lúc cần thì không bao giờ gặp chuyện đó.

## Hai layer mới: Hazard và Interactable

Mở **Edit > Project Settings > Tags and Layers**, thêm hai User Layer: `Hazard` cho những thứ giết người chơi, và `Interactable` cho những thứ người chơi chạm vào để kích hoạt (lá cờ ở bài này, cửa thoát ở bài 9). Ở mục **Sorting Layers**, thêm sorting layer `FX` nằm dưới `Player` trong danh sách: hiệu ứng biến mất và xuất hiện của nhân vật sẽ vẽ trên layer này, đè lên cả gạch lẫn nhân vật.

![Tags and Layers: Ground, Interactable, Hazard trong danh sách User Layer](/images/posts/unity-platformer/08/tags-layers.webp)

Đặt layer riêng thay vì để `Default` có hai lợi ích. `PlayerLife` sẽ chỉ chết khi chạm trigger trên layer `Hazard`, nên một trigger bất kỳ khác (vùng camera, vùng âm thanh sau này) không bao giờ giết nhầm. Và bài 9 sẽ đi qua bảng va chạm giữa các layer, lúc đó mỗi loại object đã có tên riêng để quyết định ai chạm được ai.

## Bàn dập và collider của nó

Bẫy trong bộ art là một cái bàn dập: mặt đỏ trên một cột xám, nhấp lên nhấp xuống. Cắt `Traps/1.png` giống các sheet khác, ô `48 × 48`, pivot `Bottom Center`, được 7 frame từ `1_0` tới `1_6`.

Tạo bẫy trong scene:

1. Tạo GameObject `Level` rỗng để gom đồ vật của phòng, rồi tạo con `Trap_A` ở `(44.5, 2, 0)`, ngay trên mặt sàn.
2. Layer `Hazard`.
3. Thêm **Sprite Renderer** với sprite `1_0`, Order in Layer `30` để bẫy vẽ đè lên gạch.
4. Thêm **Sprite Sequence**, kéo 7 sprite `1_0` tới `1_6` vào mảng Frames, Fps `12`, Loop bật.
5. Thêm **Box Collider 2D**, và thêm script `Hazard` (dưới đây). `Hazard` tự bật Is Trigger khi được thêm vào.

```csharp
using UnityEngine;

namespace Platformer.Level
{
    [RequireComponent(typeof(Collider2D))]
    public sealed class Hazard : MonoBehaviour
    {
        public string label = "trap";

        private void Reset()
        {
            GetComponent<Collider2D>().isTrigger = true;
        }
    }
}
```

`Hazard` không có logic gì. Nó chỉ đánh dấu "trigger này giết người" và mang một cái tên để ghi lại lý do chết. `Reset` là hàm Unity gọi khi component vừa được thêm vào trong Editor, nên bạn không phải nhớ tick Is Trigger.

### Kích thước collider lấy từ hình, không đặt đại

Box Collider 2D mặc định lấy kích thước cả ô 48 × 48, tức là 3 × 3 unit. Kéo tay cho nhỏ lại "trông tàm tạm" là cách hay gặp, và cũng là cách mình làm lần đầu: `2.2 × 1.6`. Kết quả là người chơi nhảy qua rõ ràng mà vẫn chết.

Trước khi đặt collider, xem hình vẽ thật sự chiếm bao nhiêu trong ô. Đây là 7 frame của bàn dập, mỗi frame ghi chiều cao phần có hình tính từ đáy ô:

![7 frame của bàn dập: cao 16, 14, 13, 24, 26, 24, 20 pixel; khung xanh lá là collider 2.0 x 0.9](/images/posts/unity-platformer/08/trap-frames.webp)

Bàn dập rộng 32 pixel (2 unit) ở mọi frame, nhưng cao từ 13 pixel (0.81 unit) lúc hạ thấp nhất tới 26 pixel (1.62 unit) lúc vươn cao nhất. Một collider tĩnh không thể khớp cả bảy frame, nên phải chọn:

- Khớp frame cao nhất: người chơi đi sát bên trên lúc bàn dập đang hạ vẫn chết, dù trên màn hình còn cách cả nửa ô.
- Khớp frame thấp: có lúc mặt đỏ vươn lên chạm chân mà không chết.

Mình chọn khớp tư thế thấp, `Size (2.0, 0.9)`, `Offset (0, 0.5)`, tức vùng chết từ 0.05 tới 0.95 unit trên mặt sàn (khung xanh trong ảnh). Nhiều game cố tình làm vùng gây sát thương nhỏ hơn hình vẽ một chút: người chơi thoát trong gang tấc thì thấy mình giỏi, còn chết khi chưa chạm thì thấy game ăn gian.

Collider `2.2 × 1.6` lần đầu của mình còn tệ hơn cả hai phương án trên: nó cao tới 1.9 unit, cao hơn cả lúc bàn dập vươn hết cỡ. Đây là cùng một cú nhảy, dừng hình ngay trước lúc chạm, với hai collider:

![Cùng một khoảnh khắc: bên trái collider 2.2 x 1.6 đã chạm hông nhân vật dù mặt bàn dập còn thấp bên dưới, bên phải collider 2.0 x 0.9 chỉ bao quanh bàn dập](/images/posts/unity-platformer/08/trap-collider-wrong-vs-right.webp)

Với collider đặt đại, nhân vật chết giữa không trung khi chân còn cao hơn mặt sàn 1.5 unit, trong lúc mặt bàn dập ở frame đó chỉ cao 1.25. Với collider khớp hình, cú nhảy đó qua an toàn, chân thấp nhất khi đi ngang bẫy là 1.5 unit so với đỉnh vùng chết 0.95.

Lỗi kiểu này không hiện ra trong số liệu nào: bẫy vẫn giết người đúng như code bảo. Nó chỉ lộ ra khi bạn bật gizmo collider lên và nhìn. Mỗi lần đặt collider cho thứ gây chết, hãy chọn object đó trong lúc Play và nhìn khung xanh so với hình vẽ.

![Inspector của Trap_A: layer Hazard, Sprite Sequence 7 frame 12 fps loop, Box Collider 2D Is Trigger, Offset 0 0.5, Size 2 0.9, Hazard label Trap_A](/images/posts/unity-platformer/08/trap-inspector.webp)

Tạo thêm `Trap_B` ở `(24.5, 12, 0)` trên bệ 2 bằng cách nhân bản `Trap_A` (Ctrl+D) rồi đổi vị trí và label.

## Checkpoint

Lá cờ có ba trạng thái, mỗi trạng thái là một sheet trong `Objects/Checkpoints`:

![Bốn frame của lá cờ: No_Flag cột trơn, Flag_Out đang kéo cờ lên ở frame 2 và 5, Flag_Idle cờ đã bay](/images/posts/unity-platformer/08/checkpoint-states.webp)

- `No_Flag`: chưa chạm, cột trơn. Một sprite.
- `Flag_Out`: 7 frame kéo cờ lên, chạy một lần.
- `Flag_Idle`: 7 frame cờ bay, lặp mãi.

Cắt `Checkpoint_Flag_Out1.png` và `Checkpoint_Flag_Idle1.png` thành ô `48 × 48`, pivot `Bottom Center`. `Checkpoint_No_Flag.png` để Single, pivot `Bottom`.

Tạo `Assets/_Platformer/Scripts/Level/Checkpoint.cs`:

```csharp
using UnityEngine;
using Platformer.Common;

namespace Platformer.Level
{
    [RequireComponent(typeof(Collider2D), typeof(SpriteSequence))]
    public sealed class Checkpoint : MonoBehaviour
    {
        [Header("Looks")]
        [SerializeField] private Sprite noFlag;
        [SerializeField] private Sprite[] flagOut;
        [SerializeField] private Sprite[] flagIdle;
        [SerializeField, Min(1f)] private float fps = 20f;

        [Header("Respawn")]
        [SerializeField] private Vector2 respawnOffset = Vector2.zero;

        public bool IsActive { get; private set; }
        public Vector2 RespawnPoint => (Vector2)transform.position + respawnOffset;
        public static System.Action<Checkpoint> Activated;

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
            seq.Stop();
            if (noFlag != null) sr.sprite = noFlag;
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (IsActive) return;
            var life = other.GetComponentInParent<Player.PlayerLife>();
            if (life == null) return;
            Activate(life);
        }

        public void Activate(Player.PlayerLife life)
        {
            IsActive = true;
            life.SetRespawnPoint(RespawnPoint, this);
            Activated?.Invoke(this);
            seq.Completed = null;
            seq.Completed += () => seq.Play(flagIdle, fps, true);
            seq.Play(flagOut, fps, false);
        }

        public void Deactivate()
        {
            IsActive = false;
            seq.Stop();
            if (noFlag != null) sr.sprite = noFlag;
        }

        private void OnDrawGizmos()
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(RespawnPoint, 0.25f);
        }
    }
}
```

`Activate` phát `flagOut` một lần, và khi dãy đó xong thì `Completed` chuyển sang lặp `flagIdle`. Nó cũng báo cho `PlayerLife` điểm hồi sinh mới, và `PlayerLife` sẽ hạ lá cờ cũ xuống bằng `Deactivate`. Không có dòng đó, người chơi sẽ thấy hai lá cờ cùng bay và không biết mình sẽ hồi sinh ở cái nào.

`respawnOffset` để `(0, 0)`. Cả lá cờ lẫn nhân vật đều có pivot ở chân (bài 0), nên hồi sinh đúng ở vị trí cột cờ là chân nhân vật đặt đúng trên mặt sàn. Nếu pivot để ở tâm, bạn sẽ phải bù một số lẻ ở đây, và nhân vật sẽ hiện ra lơ lửng rồi rơi xuống.

Tạo `Checkpoint_1` ở `(12, 2, 0)` trong `Level`:

1. Layer `Interactable`.
2. **Sprite Renderer** với sprite `Checkpoint_No_Flag`, Order in Layer `20`.
3. **Box Collider 2D**: Size `(1.5, 2.6)`, Offset `(0, 1.5)`. Collider bao phần cột từ ngay trên đế lên tới đỉnh.
4. **Sprite Sequence**: bỏ tick **Play On Enable**, để trống Frames. Checkpoint tự gọi `Play` khi cần.
5. **Checkpoint**: kéo `Checkpoint_No_Flag` vào No Flag, 7 sprite `Checkpoint_Flag_Out1_*` vào Flag Out, 7 sprite `Checkpoint_Flag_Idle1_*` vào Flag Idle.

![Bên trái Inspector của Checkpoint_2: layer Interactable, Box Collider 2D trigger offset 0 1.5 size 1.5 2.6, Checkpoint với No Flag, Flag Out 7, Flag Idle 7, Respawn Offset 0 0; bên phải Scene view: khung collider bao cột cờ và vòng xanh ở chân cột là điểm hồi sinh](/images/posts/unity-platformer/08/checkpoint-inspector.webp)

![Scene view của Checkpoint_2: khung collider bao cột cờ, vòng tròn xanh ở chân cột nằm đúng mặt sàn](/images/posts/unity-platformer/08/checkpoint-gizmo.webp)

Vòng tròn xanh ở chân cột là điểm hồi sinh, vẽ bởi `OnDrawGizmos`. Nó phải nằm đúng trên mặt sàn. Nhân bản thành `Checkpoint_2` ở `(22, 2, 0)`.

Tạo thêm một GameObject rỗng `Spawn` ở `(6, 2, 0)` trong `Level`: điểm hồi sinh khi người chơi chưa chạm lá cờ nào.

## PlayerLife: chuỗi chết và hồi sinh

Motor cần một hàm nhỏ để tính lại trạng thái chạm đất ngay sau khi bị dời đi. Thêm vào `PlayerMotor.cs`, ngay trên `CheckGround`:

```csharp
public void RefreshGround() { IsGrounded = CheckGround(); }
```

Tạo `Assets/_Platformer/Scripts/Player/PlayerLife.cs`:

```csharp
using System.Collections;
using UnityEngine;
using Platformer.Common;
using Platformer.Level;

namespace Platformer.Player
{
    [RequireComponent(typeof(PlayerMotor), typeof(Rigidbody2D), typeof(Collider2D))]
    public sealed class PlayerLife : MonoBehaviour
    {
        [Header("Layers")]
        [SerializeField] private LayerMask hazardMask;

        [Header("Respawn")]
        [SerializeField] private RoomBounds room;
        [SerializeField] private Transform initialSpawn;
        [SerializeField] private Vector2 vfxOffset = new Vector2(0f, 0.85f);
        [SerializeField, Min(0f)] private float deathDelay = 0.45f;
        [SerializeField, Min(0f)] private float appearDelay = 0.35f;
        [SerializeField, Min(0f)] private float fallOutMargin = 2f;
        [SerializeField, Min(0f)] private float respawnGrace = 1.2f;

        [Header("VFX (from the pack)")]
        [SerializeField] private Sprite[] disappearFrames;
        [SerializeField] private Sprite[] appearFrames;
        [SerializeField, Min(1f)] private float vfxFps = 20f;
        [SerializeField] private int vfxSortingOrder = 20;

        public bool IsDead { get; private set; }
        public int Deaths { get; private set; }
        public bool Invulnerable { get; set; }
        public float GraceUntil { get; private set; }
        public Vector2 RespawnPoint { get; private set; }
        public Checkpoint ActiveCheckpoint { get; private set; }
        public System.Action<string> Died;
        public System.Action Respawned;

        private PlayerMotor motor;
        private Rigidbody2D body;
        private Collider2D col;
        private SpriteRenderer sr;
        private CameraRig.CameraFollow follow;
        private SpriteSequence vfx;

        private void Awake()
        {
            motor = GetComponent<PlayerMotor>();
            body = GetComponent<Rigidbody2D>();
            col = GetComponent<Collider2D>();
            sr = GetComponent<SpriteRenderer>();
            var cam = Camera.main;
            if (cam != null && cam.transform.parent != null) follow = cam.transform.parent.GetComponent<CameraRig.CameraFollow>();
            RespawnPoint = initialSpawn != null ? (Vector2)initialSpawn.position : body.position;
        }

        public void SetRespawnPoint(Vector2 point, Checkpoint source = null)
        {
            if (ActiveCheckpoint != null && ActiveCheckpoint != source) ActiveCheckpoint.Deactivate();
            RespawnPoint = point;
            ActiveCheckpoint = source;
        }

        private void FixedUpdate()
        {
            if (IsDead || room == null) return;
            if (body.position.y < room.Rect.yMin - fallOutMargin) Kill("fell out of the room");
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (IsDead) return;
            if ((hazardMask.value & (1 << other.gameObject.layer)) == 0) return;
            var hz = other.GetComponent<Hazard>();
            Kill(hz != null ? hz.label : other.name);
        }

        public void Kill(string reason)
        {
            if (IsDead || Invulnerable || !enabled) return;
            IsDead = true; Deaths++;
            Died?.Invoke(reason);
            StartCoroutine(DeathRoutine());
        }

        private IEnumerator DeathRoutine()
        {
            var deathPos = body.position;
            body.linearVelocity = Vector2.zero;
            body.simulated = false;
            motor.enabled = false;
            col.enabled = false;
            sr.enabled = false;
            PlayVfx(disappearFrames, deathPos);

            yield return new WaitForSeconds(deathDelay);

            body.position = RespawnPoint;
            transform.position = RespawnPoint;
            body.simulated = true;
            motor.RefreshGround();
            if (follow != null) follow.SnapTo(RespawnPoint + vfxOffset);
            PlayVfx(appearFrames, RespawnPoint);

            yield return new WaitForSeconds(appearDelay);

            sr.enabled = true;
            col.enabled = true;
            motor.enabled = true;
            IsDead = false;
            Respawned?.Invoke();

            if (respawnGrace > 0f)
            {
                Invulnerable = true;
                GraceUntil = Time.time + respawnGrace;
                yield return new WaitForSeconds(respawnGrace);
                Invulnerable = false;
            }
        }

        private void PlayVfx(Sprite[] frames, Vector2 at)
        {
            if (frames == null || frames.Length == 0) return;
            if (vfx == null)
            {
                var go = new GameObject("PlayerVFX");
                var r = go.AddComponent<SpriteRenderer>();
                r.sortingLayerName = "FX";
                r.sortingOrder = vfxSortingOrder;
                vfx = go.AddComponent<SpriteSequence>();
            }
            vfx.transform.position = at + vfxOffset;
            vfx.gameObject.SetActive(true);
            vfx.Completed = null;
            vfx.Completed += () => vfx.gameObject.SetActive(false);
            vfx.Play(frames, vfxFps, false);
        }
    }
}
```

Hai đường dẫn tới cái chết: chạm một trigger thuộc `hazardMask` (`OnTriggerEnter2D`), hoặc rơi xuống dưới đáy phòng quá 2 unit (`FixedUpdate`). Cả hai đi qua `Kill`, và `Kill` từ chối nếu đang chết, đang bất tử, hoặc script bị tắt. Bài 10 và 11, kẻ địch cũng sẽ gọi `Kill` từ bên ngoài.

### DeathRoutine, từng bước một

`DeathRoutine` là một coroutine, mỗi bước có lý do riêng:

1. **Đóng băng xác tại chỗ.** Đặt vận tốc về 0 và `body.simulated = false`, để nhân vật không tiếp tục bay hay rơi trong lúc hiệu ứng đang phát.
2. **Tắt motor, collider và sprite.** Motor tắt để phím bấm lúc này không làm gì. Collider tắt để không chạm thêm bẫy nào khác và chết lần hai. Sprite tắt vì hiệu ứng biến mất sẽ thay thế nó.
3. **Phát hiệu ứng biến mất** ở chỗ vừa chết, rồi chờ 0.45 giây (hiệu ứng dài 7 frame ở 20 khung/giây là 0.35 giây, dư 0.1 cho mắt kịp thấy).
4. **Dời về điểm hồi sinh**, bật lại mô phỏng vật lý, và gọi `RefreshGround` để motor biết ngay mình đang đứng trên đất.
5. **Snap camera** bằng hàm `SnapTo` đã có từ bài 5. Không có dòng này, camera sẽ lia từ chỗ chết về chỗ hồi sinh, một cú lia dài qua nửa căn phòng mỗi lần chết. Rồi phát hiệu ứng xuất hiện và chờ 0.35 giây.
6. **Trả điều khiển**: bật sprite, collider, motor.

`PlayVfx` dùng lại một object hiệu ứng duy nhất cho mọi lần chết thay vì tạo mới mỗi lần. Hiệu ứng trong bộ art được vẽ ở giữa ô 96 × 96 pixel, còn pivot của nhân vật ở chân, nên `vfxOffset = (0, 0.85)` nâng hiệu ứng lên giữa người.

### Bất tử 1.2 giây sau khi hồi sinh

Khối cuối của `DeathRoutine` bật `Invulnerable` trong `respawnGrace = 1.2` giây. Không có nó, một lá cờ đặt giữa đường đi tuần của kẻ địch (bài 10) sẽ thành vòng lặp: người chơi chết, hồi sinh ở lá cờ, kẻ địch vẫn đang đi ngang qua đó, chết lần nữa, hồi sinh, chết. Mỗi vòng mất 0.8 giây và người chơi không kịp bấm gì. Bài 10 sẽ cho xem vòng lặp đó khi tạm đặt `respawnGrace` về 0.

1.2 giây ở tốc độ 9 unit/giây là đủ chạy ra xa gần 11 ô. Nhưng bất tử chỉ chữa triệu chứng. Nguyên nhân là lá cờ đặt sai chỗ, và cách chữa tận gốc là đặt checkpoint ở đoạn sàn không có kẻ địch nào đi qua. Mình dùng cả hai: bất tử để không bao giờ có vòng lặp dù đặt cờ ở đâu, và đặt cờ cẩn thận để người chơi không phải dựa vào nó.

`GraceUntil` ghi lại lúc hết bất tử. Bài 13 sẽ dùng nó để nhân vật nhấp nháy trong lúc đang được bảo vệ, cho người chơi biết.

### Gắn vào Player

Thêm component **Player Life** vào prefab `Player` (mở prefab bằng nút **Open** trong Inspector, hoặc thêm vào object trong scene rồi chọn **Overrides > Apply All**):

1. **Hazard Mask**: chỉ chọn `Hazard`.
2. **Room**: kéo `Room` vào.
3. **Initial Spawn**: kéo `Spawn` vào.
4. **Disappear Frames**: cắt `Player/Spawn/Desappearing.png` thành ô `96 × 96` (tên file trong bộ art viết sai chính tả, cứ để vậy), pivot `Center`, rồi kéo 7 sprite vào. **Appear Frames**: làm tương tự với `Appearing.png`.

![Inspector Player Life: Hazard Mask Hazard, Room, Initial Spawn, Vfx Offset 0 0.85, Death Delay 0.45, Appear Delay 0.35, Fall Out Margin 2, Respawn Grace 1.2, Disappear Frames 7, Appear Frames 7, Vfx Fps 20](/images/posts/unity-platformer/08/playerlife-inspector.webp)

Room và Spawn nằm trong scene nên không lưu được vào prefab asset. Kéo chúng vào object Player trong scene: mỗi màn chơi có Room và Spawn của riêng nó.

## Kiểm tra

Mình cho nhân vật chạy từ x = 40 thẳng vào bàn dập A và ghi lại từng bước:

| Thời điểm | Sự kiện |
|---|---|
| 0.36 s | chết ở x ≈ 42.97 (mép phải collider nhân vật chạm mép bẫy ở 43.5) |
| 1.18 s | hiện ra ở Spawn `(6, 2)`, điều khiển lại, sau 0.82 giây kể từ lúc chết |
| 2.40 s | hết bất tử, đúng 1.2 giây sau khi hiện ra |

Lượt thứ hai chạy từ x = 18 qua `Checkpoint_2` rồi nhảy qua bậc thang và vào bẫy: cờ kéo lên khi nhân vật tới x ≈ 20.8 (mép phải chạm trigger), và lần chết sau đó hồi sinh ở đúng `(22, 2)` chứ không về Spawn. Nhân vật đứng yên ngay tại chỗ, không rơi.

Tự thử bằng tay:

- Chạy vào bàn dập A năm lần liên tiếp. `Deaths` là property nên không hiện trong Inspector, kể cả chế độ Debug. Để đếm, tạm thêm dòng này vào cuối `Awake` của `PlayerLife`: `Died += r => Debug.Log($"Chết lần {Deaths}: {r}");`. Console phải in đủ năm dòng, từ "Chết lần 1: Trap_A" tới "Chết lần 5: Trap_A", không có dòng nào bị lặp do chết hai lần một lúc. Thử xong thì xoá dòng đó.
- Chạm `Checkpoint_1`, cờ kéo lên rồi bay. Chạm tiếp `Checkpoint_2`: cờ 2 kéo lên, cờ 1 hạ xuống.
- Chết sau khi chạm `Checkpoint_2`: hiện ra ở cờ 2, camera đứng sẵn ở đó, không lia.
- Nhảy qua bàn dập với một cú nhảy đầy: không chết. Chọn `Trap_A` trong lúc Play để thấy khung collider chỉ bao sát bàn dập.
- Phòng này kín đáy nên chưa có chỗ để rơi ra. Để thử đường chết thứ hai, tạm xoá hai cột ô sàn bằng công cụ Eraser trong Tile Palette rồi chạy qua chỗ trống: nhân vật rơi xuống, khi chân xuống dưới y = −2 (đáy phòng trừ `fallOutMargin`) thì chết và hồi sinh như thường. Thử xong bấm Ctrl+Z để trả sàn lại.

## Bài sau

Căn phòng có thứ giết người chơi nhưng chưa có mục tiêu gì. Bài 9 thêm ngọc để nhặt, thùng để đập, và bảng va chạm giữa các layer, thứ đã làm cả màn chơi của mình không thể thắng được mà không có một dòng báo lỗi nào.
