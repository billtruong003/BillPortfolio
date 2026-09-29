---
title: "Platformer #13: Rung, chớp, âm thanh, không sửa dòng gameplay nào"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 13
excerpt: "Một lớp phản hồi gắn từ bên ngoài: nghe sự kiện mà mười hai bài trước đã phát sẵn, biến chúng thành rung camera, tiếng động, chớp màu và nhấp nháy lúc bất tử. Tắt nó đi thì game vẫn đúng mọi luật, chỉ im lặng. Và một cú rung boss bị nuốt mất vì đọc máu quá sớm."
coverImage: "/images/posts/unity-platformer/13/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Game Feel", "Camera Shake", "Audio", "Tutorial"]
published: true
featured: false
---

Game đã chạy đúng. Giẫm địch thì địch chết, boss mất máu, người chơi chết thì hồi sinh. Nhưng mọi thứ xảy ra trong im lặng: giẫm trúng không có tiếng, boss đâm vách mà màn hình đứng yên, và 1.2 giây bất tử của bài 8 hoàn toàn vô hình. Người chơi không biết mình đang được bảo vệ.

Bài này thêm "juice", lớp phản hồi làm cho mỗi hành động có trọng lượng: rung camera, tiếng động, chớp màu, nhấp nháy. Điều đáng nói nhất là cách thêm: **không sửa một dòng nào trong code gameplay của mười hai bài trước.**

## Nghe, không gọi

Cách dễ nghĩ ra nhất là chèn lệnh vào chỗ xảy ra sự kiện: trong `PatrolEnemy.Die()` gọi `GameFeel.OnStomp()`, trong `PlayerLife.Kill()` gọi `GameFeel.OnDeath()`. Làm vậy thì mọi con địch phải biết lớp phản hồi tồn tại. Muốn tắt tiếng để thử một thứ khác là phải đi sửa từng file, và một lớp chỉ để trang trí trở thành thứ game không chạy được nếu thiếu.

Cách đúng là ngược lại: gameplay chỉ thông báo "chuyện này vừa xảy ra", còn lớp phản hồi tự đi nghe. Và các thông báo đó đã có sẵn từ trước:

![Sơ đồ: bên trái là các script gameplay với sự kiện của chúng (PlayerMotor có LastJumpAt và IsGrounded, PlayerLife có Died và GraceUntil, RoomState có GemChanged, các loại địch có Killed, BreakableBox có BrokenEvent, BossBrute có HealthChanged), ở giữa là GameFeel chỉ nghe, bên phải là CameraShake, AudioSource, SpriteFlash và độ trong suốt của sprite người chơi](/images/posts/unity-platformer/13/event-flow.webp)

`PlayerLife.Died` và `GraceUntil` có từ bài 8. `RoomState.GemChanged` và `BreakableBox.BrokenEvent` từ bài 9. `Killed` của các loại địch từ bài 10 và 11. `BossBrute.HealthChanged` từ bài 12. Không cái nào được viết cho lớp phản hồi, chúng được viết vì mỗi thứ nên cho bên ngoài biết chuyện gì xảy ra với nó. Giờ đó là lúc được đền đáp.

## Rung camera

### Hai tầng camera, ai ghi cái gì

Bài 5 dựng camera thành hai tầng: `CameraRoot` mang `CameraFollow`, đi theo người chơi và bị kẹp trong phòng; `Main Camera` là con của nó. Hồi đó `Main Camera` chưa có việc gì. Giờ nó có:

![Hai tầng camera từ bài 5: CameraRoot đi theo người chơi, Main Camera là con](/images/posts/unity-platformer/05/two-layers.webp)

- `CameraFollow` ghi **vị trí thế giới** của `CameraRoot`, sau khi kẹp vào phòng.
- `CameraShake` ghi **vị trí local** của `Main Camera`, một độ lệch ngẫu nhiên nhỏ dần về 0.

Hai script ghi hai thứ khác nhau nên không bao giờ giành nhau. Rung xong, `Main Camera` về đúng (0, 0, 0) local, và camera lại theo người chơi như chưa có gì xảy ra.

### CameraShake

`CameraShake` mình viết từ series shmup ([Shmup #10](/lab/unity-shmup-10-audio-juice/)) và đã chuyển vào `Assets/_Common/Scripts/FX/`, dùng chung cho mọi game trong project:

```csharp
using System.Collections;
using UnityEngine;

namespace BillLab.Common.FX
{
    public sealed class CameraShake : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float defaultStrength = 0.25f;
        [SerializeField, Min(0.01f)] private float defaultDuration = 0.2f;

        private Vector3 restPosition;
        private Coroutine routine;

        private void OnEnable() => restPosition = transform.localPosition;

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            transform.localPosition = restPosition;
        }

        public void Shake() => Shake(defaultStrength, defaultDuration);

        public void Shake(float strength, float duration)
        {
            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Run(strength, duration));
        }

        private IEnumerator Run(float strength, float duration)
        {
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                var falloff = 1f - elapsed / duration;
                transform.localPosition = restPosition + (Vector3)(Random.insideUnitCircle * (strength * falloff));
                yield return null;
            }
            transform.localPosition = restPosition;
            routine = null;
        }
    }
}
```

Mỗi frame, camera lệch một điểm ngẫu nhiên trong hình tròn bán kính `strength × falloff`, với `falloff` giảm từ 1 về 0 trong `duration` giây. Vì `Random.insideUnitCircle` cho điểm bất kỳ bên trong hình tròn, không phải trên viền, `strength` là mức lệch **tối đa**, còn độ lệch thật thường nhỏ hơn.

Thêm component **Camera Shake** vào `Main Camera` (không phải `CameraRoot`).

### shakeMargin là một lời hứa

Camera bị kẹp trong phòng ở tầng `CameraRoot`. Cú rung cộng thêm ở tầng dưới, nằm ngoài phép kẹp. Nếu người chơi đứng sát góc phòng, camera đã bị kẹp sát tường, cú rung đẩy khung nhìn ra ngoài phòng và người chơi thấy khoảng trống ngoài tilemap.

Bài 5 đã chừa sẵn `shakeMargin = 0.35` trong `CameraFollow`: kẹp camera cách tường thêm 0.35 unit. Đó là một lời hứa giữa hai bên. `CameraFollow` chừa 0.35, nên `GameFeel` không được rung mạnh hơn 0.35. Cú rung mạnh nhất trong bài này là 0.32.

Mình đặt người chơi ở chỗ spawn (6, 2), góc dưới trái phòng, nơi camera bị kẹp cả chiều ngang lẫn chiều dọc. Bắn năm cú rung, mỗi frame đo xem khung nhìn thò ra ngoài phòng bao nhiêu:

| Cú rung | Thò ra ngoài phòng, lớn nhất |
|---|---|
| 0.10 | 0.000 |
| 0.18 | 0.000 |
| 0.30 | 0.000 |
| 0.32 | 0.000 |
| 0.60 (vượt lề) | 0.105, 0.068 và 0.013 ở ba lần chạy |

Mọi cú rung trong lề đều kín. Vượt lề thì lộ, và lộ bao nhiêu tuỳ may rủi của hướng rung: 0.105 unit là gần 2 pixel ở 16 pixel mỗi unit, đủ thấy một vạch tối nhấp nháy ở mép màn hình. Đây là một con số "magic" hiếm hoi chứng minh được bằng đo đạc thay vì chỉnh tay tới khi thấy ổn.

## Chớp và nhấp nháy

### SpriteFlash

Series shmup có `HitFlash` làm địch chớp trắng khi trúng đạn. Mình muốn chuyển nó vào `_Common` như `CameraShake`, nhưng không được: nó có `[RequireComponent(typeof(Health))]` và `using ShootEmUp.Combat;`, tức là nó đã bị buộc vào hệ thống máu của game shmup từ lúc viết. `_Common` không được phép tham chiếu ngược lên một game cụ thể. Ranh giới là vậy: thứ chuyển sang `_Common` được là thứ không biết gì về game. `CameraShake` không biết ai gọi nó, `HitFlash` thì biết.

Nên viết một bản mới không biết gì về máu. Tạo `Assets/_Platformer/Scripts/Common/SpriteFlash.cs`:

```csharp
using System.Collections;
using UnityEngine;

namespace Platformer.Common
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class SpriteFlash : MonoBehaviour
    {
        private static readonly int FlashAmountId = Shader.PropertyToID("_FlashAmount");

        [SerializeField, Min(0.01f)] private float duration = 0.08f;
        [Tooltip("Used when the material has no _FlashAmount property: tint the SpriteRenderer colour instead. " +
                 "The default sprite shader multiplies by this colour, so white would change nothing.")]
        [SerializeField] private Color fallbackColor = new Color(1f, 0.35f, 0.35f);

        private SpriteRenderer sr;
        private MaterialPropertyBlock block;
        private Coroutine routine;
        private Color baseColor;
        private bool hasFlashProperty;

        private void Awake()
        {
            sr = GetComponent<SpriteRenderer>();
            block = new MaterialPropertyBlock();
            baseColor = sr.color;
            hasFlashProperty = sr.sharedMaterial != null && sr.sharedMaterial.HasProperty(FlashAmountId);
        }

        private void OnEnable() => SetAmount(0f);

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            routine = null;
            SetAmount(0f);
        }

        public void Flash()
        {
            if (!isActiveAndEnabled) return;
            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Run());
        }

        private IEnumerator Run()
        {
            SetAmount(1f);
            yield return new WaitForSeconds(duration);
            SetAmount(0f);
            routine = null;
        }

        private void SetAmount(float amount)
        {
            if (sr == null) return;
            if (hasFlashProperty)
            {
                sr.GetPropertyBlock(block);
                block.SetFloat(FlashAmountId, amount);
                sr.SetPropertyBlock(block);
            }
            else
            {
                sr.color = amount > 0.5f ? fallbackColor : baseColor;
            }
        }
    }
}
```

Ai gọi `Flash()` thì nó chớp, vậy thôi. Nếu material của sprite có property `_FlashAmount` (shader chớp trắng của Shmup #10), nó chớp trắng thật qua `MaterialPropertyBlock`. Nếu không, nó đổi màu Sprite Renderer trong 0.08 giây.

Bản đầu của mình để `fallbackColor` là trắng, và boss không hề chớp. Shader sprite mặc định nhân màu texture với màu Sprite Renderer. Nhân với trắng thì không đổi gì: màu Sprite Renderer vốn đã là trắng. Không thể làm sprite "trắng hơn" bằng cách đổi màu, nên bản sửa dùng màu đỏ nhạt, đọc ra là "bị đau". Muốn chớp trắng thật thì phải có shader riêng.

Thêm **Sprite Flash** vào `Boss_Brute`.

### Nhấp nháy lúc bất tử

Bài 8 thêm 1.2 giây bất tử sau khi hồi sinh và ghi lại lúc hết hạn vào `PlayerLife.GraceUntil`, với lời hứa bài này sẽ cho nó hiện ra. `GameFeel` đọc `GraceUntil` mỗi frame: còn trong thời gian bất tử thì đổi độ trong suốt của sprite người chơi qua lại giữa 0.3 và 1 mỗi 0.08 giây.

![Hai khung liên tiếp của người chơi vừa hồi sinh: khung trái mờ với alpha 0.3, khung phải rõ với alpha 1](/images/posts/unity-platformer/13/grace-blink.webp)

Đổi alpha thay vì bật tắt `SpriteRenderer.enabled`, vì `PlayerLife` cũng dùng `enabled` để giấu nhân vật trong lúc chết. Hai script cùng ghi một thuộc tính thì sớm muộn sẽ giẫm lên nhau.

## Âm thanh

Bộ art không có âm thanh. Mình tự sinh 5 file wav ngắn bằng một script ngoài project (sóng vuông cộng nhiễu, bao âm lượng giảm dần): `sfx_jump`, `sfx_land`, `sfx_gem`, `sfx_stomp`, `sfx_death`. Không hay, nhưng đủ để chỉnh nhịp: nghe được tiếng tiếp đất thì mới biết nó có khớp với hình hay trễ. Bạn có thể tạo nhanh những tiếng kiểu này bằng [sfxr.me](https://sfxr.me) ngay trên trình duyệt.

Đặt các file vào `Assets/_Platformer/Audio/SFX/`. File ngắn nên trong Import Settings chọn Load Type `Decompress On Load`, Compression Format `PCM`.

## GameFeel

Tạo `Assets/_Platformer/Scripts/Core/GameFeel.cs`:

```csharp
using UnityEngine;
using BillLab.Common.FX;

namespace Platformer.Core
{
    [RequireComponent(typeof(AudioSource))]
    public sealed class GameFeel : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private Player.PlayerLife playerLife;
        [SerializeField] private Player.PlayerMotor playerMotor;
        [SerializeField] private Level.RoomState room;
        [SerializeField] private CameraShake cameraShake;
        [SerializeField] private Common.SpriteFlash bossFlash;

        [Header("Shake (strength, duration)")]
        [SerializeField] private Vector2 landShake = new Vector2(0.10f, 0.12f);
        [SerializeField] private Vector2 stompShake = new Vector2(0.18f, 0.15f);
        [SerializeField] private Vector2 deathShake = new Vector2(0.30f, 0.30f);
        [SerializeField] private Vector2 bossHitShake = new Vector2(0.32f, 0.25f);

        [Header("Clips")]
        [SerializeField] private AudioClip jumpClip;
        [SerializeField] private AudioClip landClip;
        [SerializeField] private AudioClip gemClip;
        [SerializeField] private AudioClip stompClip;
        [SerializeField] private AudioClip deathClip;
        [SerializeField, Range(0f, 1f)] private float jumpVolume = 0.4f;

        [Header("Landing")]
        [Tooltip("Only shake on landing when the fall was at least this fast.")]
        [SerializeField, Min(0f)] private float hardLandSpeed = 18f;

        [Header("Respawn grace")]
        [SerializeField, Min(0.02f)] private float blinkPeriod = 0.16f;
        [SerializeField, Range(0f, 1f)] private float blinkAlpha = 0.3f;

        private AudioSource source;
        private bool wasGrounded;
        private float lastFallSpeed;
        private float lastJumpAt = -1f;
        private int bossHealth;
        private Enemies.BossBrute boss;
        private SpriteRenderer playerSprite;

        private void Awake()
        {
            source = GetComponent<AudioSource>();
            if (playerLife != null) playerSprite = playerLife.GetComponent<SpriteRenderer>();
        }

        private void OnEnable()
        {
            if (playerLife != null) playerLife.Died += OnDied;
            if (room != null) room.GemChanged += OnGemChanged;
            BindEnemies(true);
        }

        private void OnDisable()
        {
            if (playerLife != null) playerLife.Died -= OnDied;
            if (room != null) room.GemChanged -= OnGemChanged;
            BindEnemies(false);
            SetPlayerAlpha(1f);
        }

        private void BindEnemies(bool bind)
        {
            foreach (var e in FindObjectsByType<Enemies.PatrolEnemy>(FindObjectsSortMode.None))
            { if (bind) e.Killed += OnPatrolKilled; else e.Killed -= OnPatrolKilled; }

            foreach (var e in FindObjectsByType<Enemies.ChargerEnemy>(FindObjectsSortMode.None))
            { if (bind) e.Killed += OnChargerKilled; else e.Killed -= OnChargerKilled; }

            foreach (var e in FindObjectsByType<Enemies.FlyerEnemy>(FindObjectsSortMode.None))
            { if (bind) e.Killed += OnFlyerKilled; else e.Killed -= OnFlyerKilled; }

            foreach (var e in FindObjectsByType<Enemies.CannonEnemy>(FindObjectsSortMode.None))
            { if (bind) e.Killed += OnCannonKilled; else e.Killed -= OnCannonKilled; }

            foreach (var b in FindObjectsByType<Enemies.BossBrute>(FindObjectsSortMode.None))
            {
                if (bind) { boss = b; b.HealthChanged += OnBossHealth; }
                else b.HealthChanged -= OnBossHealth;
            }

            foreach (var b in FindObjectsByType<Level.BreakableBox>(FindObjectsSortMode.None))
            { if (bind) b.BrokenEvent += OnBoxBroken; else b.BrokenEvent -= OnBoxBroken; }
        }

        private void Start()
        {
            // Read the boss's health here, not in OnEnable: see "Cú rung bị nuốt" below.
            if (boss != null) bossHealth = boss.Health;
        }

        private void Update()
        {
            Blink();
            if (playerMotor == null) return;

            // jump: the motor stamps LastJumpAt every time one is consumed
            if (!Mathf.Approximately(playerMotor.LastJumpAt, lastJumpAt))
            {
                lastJumpAt = playerMotor.LastJumpAt;
                if (lastJumpAt >= 0f) Play(jumpClip, jumpVolume);
            }

            // landing: remember how fast we were falling, then react on touchdown
            if (!playerMotor.IsGrounded)
                lastFallSpeed = Mathf.Max(lastFallSpeed, -playerMotor.Velocity.y);

            if (playerMotor.IsGrounded && !wasGrounded)
            {
                Play(landClip);
                if (lastFallSpeed >= hardLandSpeed) Shake(landShake);
                lastFallSpeed = 0f;
            }
            wasGrounded = playerMotor.IsGrounded;
        }

        private void OnPatrolKilled(Enemies.PatrolEnemy _) => Stomped();
        private void OnChargerKilled(Enemies.ChargerEnemy _) => Stomped();
        private void OnFlyerKilled(Enemies.FlyerEnemy _) => Stomped();
        private void OnCannonKilled(Enemies.CannonEnemy _) => Stomped();
        private void OnBoxBroken(Level.BreakableBox _) => Stomped();

        private void Stomped()
        {
            Play(stompClip);
            Shake(stompShake);
        }

        private void OnBossHealth(int current, int max)
        {
            // the boss also announces on spawn and on reset: only a DROP is a hit
            if (current >= bossHealth) { bossHealth = current; return; }
            bossHealth = current;
            Play(stompClip);
            Shake(bossHitShake);
            if (bossFlash != null) bossFlash.Flash();
        }

        private void OnDied(string reason)
        {
            Play(deathClip);
            Shake(deathShake);
        }

        private void OnGemChanged(int collected, int total)
        {
            if (collected > 0) Play(gemClip);
        }

        private void Blink()
        {
            if (playerLife == null) return;
            var inGrace = Time.time < playerLife.GraceUntil;
            var off = inGrace && Mathf.Repeat(Time.time, blinkPeriod) < blinkPeriod * 0.5f;
            SetPlayerAlpha(off ? blinkAlpha : 1f);
        }

        private void SetPlayerAlpha(float a)
        {
            if (playerSprite == null) return;
            var c = playerSprite.color;
            if (Mathf.Approximately(c.a, a)) return;
            c.a = a;
            playerSprite.color = c;
        }

        private void Shake(Vector2 sd)
        {
            if (cameraShake != null) cameraShake.Shake(sd.x, sd.y);
        }

        private void Play(AudioClip clip, float volume = 1f)
        {
            if (clip != null && source != null) source.PlayOneShot(clip, volume);
        }
    }
}
```

Đi từng phần:

**`BindEnemies`** tìm mọi con địch và thùng gỗ đang có trong scene rồi đăng ký nghe sự kiện của chúng. Năm loại khác nhau đều dẫn về `Stomped()`: tiếng giẫm và rung 0.18.

**Nhảy** không có sự kiện riêng. `PlayerMotor` ghi thời điểm cú nhảy gần nhất vào `LastJumpAt` (bài 6 thêm nó cho animation). `GameFeel` so với giá trị lần trước, đổi là vừa có cú nhảy mới.

**Tiếp đất** cũng suy từ trạng thái: lúc đang ở trên không thì nhớ tốc độ rơi lớn nhất, lúc `IsGrounded` chuyển từ false sang true là vừa chạm đất. Luôn có tiếng, nhưng chỉ rung khi rơi nhanh hơn `hardLandSpeed = 18` unit/giây. Rung mọi lần tiếp đất thì màn hình giật liên tục, mệt mắt, và cú rung mất nghĩa. Mình đo hai cú nhảy:

| Cú nhảy | Cao | Tốc độ rơi lúc chạm đất | Rung |
|---|---|---|---|
| Giữ nút 0.4 giây | 5.22 | 31.6 unit/giây | có |
| Gõ nhẹ 0.03 giây | 1.22 | 13.8 unit/giây | không, chỉ có tiếng |

**Boss** phát `HealthChanged` cả lúc mới bật lên (máu đầy) lẫn lúc bị giẫm. `GameFeel` chỉ phản ứng khi máu **giảm** so với lần trước nó biết. Cần một giá trị "lần trước" đúng ngay từ đầu, và chỗ đó có một lỗi.

### Cú rung bị nuốt

Bản đầu của mình giữ máu boss trong một biến bắt đầu bằng −1, coi sự kiện đầu tiên nhận được là lúc boss mới bật lên. Giẫm boss ba lần, chỉ rung hai lần. Sự kiện "máu đầy lúc bật lên" không bao giờ tới: boss đã phát nó trong `OnEnable` của boss, trước khi `GameFeel` kịp đăng ký nghe trong `OnEnable` của `GameFeel`. Nên sự kiện đầu tiên `GameFeel` nhận được là cú giẫm đầu tiên, và nó bị coi là lúc bật lên.

Sửa lần một: đọc thẳng `boss.Health` ngay lúc đăng ký trong `OnEnable`. Vẫn sai, đọc ra 0. Lần này thứ tự ngược lại: `OnEnable` của `GameFeel` chạy trước `Awake` của boss, lúc boss chưa kịp đặt `Health = maxHealth`. Cú giẫm đầu tiên đưa máu từ "0" lên 2, trông như máu tăng, và bị bỏ qua đúng theo luật.

Thứ tự `Awake` và `OnEnable` giữa hai object khác nhau trong scene không phải thứ được phép giả định. Cái được đảm bảo là `Start` của mọi object chạy sau khi mọi `Awake` và `OnEnable` trong scene đã chạy xong. Đọc máu boss trong `Start` thì luôn ra 3. Và điều kiện "chỉ tính khi giảm" tự chịu được mọi thứ tự: nếu sự kiện lúc bật lên có tới, `current >= bossHealth` nên nó chỉ cập nhật con số rồi thôi.

Không exception, không log đỏ, chỉ thiếu một cú rung. Để tìm ra, mình phải thêm bộ đếm tạm vào `GameFeel`: bao nhiêu sự kiện boss đã tới, bao nhiêu cú rung đã phát. Đếm được mới phân biệt được "không nhận được sự kiện" với "nhận được nhưng bị lọc bỏ".

### Dựng GameFeel

1. Tạo GameObject `GameFeel` ở gốc scene.
2. **Audio Source**: bỏ tick Play On Awake, Spatial Blend `0` (âm thanh 2D, không phụ thuộc vị trí).
3. **Game Feel**: kéo `Player` vào Player Life và Player Motor, `Room` vào Room, `Main Camera` vào Camera Shake, `Boss_Brute` vào Boss Flash (bỏ trống nếu scene không có boss), 5 file wav vào 5 ô Clip.

![Inspector của GameFeel: Player Life, Player Motor, Room, Camera Shake trên Main Camera, Boss Flash trên Boss_Brute, bốn cặp strength và duration 0.1/0.12, 0.18/0.15, 0.3/0.3, 0.32/0.25, năm clip sfx, Jump Volume 0.4, Hard Land Speed 18, Blink Period 0.16, Blink Alpha 0.3](/images/posts/unity-platformer/13/gamefeel-inspector.webp)

| Sự kiện | Rung (mạnh, dài) | Vì sao |
|---|---|---|
| Tiếp đất mạnh | 0.10, 0.12 s | Chỉ để cảm được trọng lượng |
| Giẫm địch, phá thùng | 0.18, 0.15 s | Đủ để thấy "trúng" |
| Chết | 0.30, 0.30 s | Dài hơn, dừng nhịp lại |
| Boss trúng đòn | 0.32, 0.25 s | Mạnh nhất, vẫn dưới lề 0.35 |

## Kiểm tra

- Đứng ở chỗ spawn (góc phòng) và bắn cú rung mạnh nhất 0.32: khung nhìn không thò ra ngoài phòng chút nào.
- Nhảy đầy rồi đáp: có tiếng và rung. Gõ nhẹ nút nhảy: chỉ có tiếng.
- Đánh boss trong phòng boss của bài 12 bằng input thật: ba lần giẫm, ba cú rung 0.32, boss chớp đỏ mỗi lần. `GameFeel` đã nghe được 7 thứ trong phòng đó: hai jumper, charger, flyer, boss và hai thùng gỗ.
- Chết rồi hồi sinh: người chơi nhấp nháy 7 lần trong 1.2 giây, rồi rõ hẳn đúng lúc hết bất tử.

Tự thử bằng tay:

- Tắt component `GameFeel` rồi chơi: mọi luật vẫn đúng, chỉ không có tiếng, không rung, không nhấp nháy.
- Tạm đổi Boss Hit Shake thành (0.6, 0.6), đứng ở góc phòng và đánh boss: thỉnh thoảng thấy vạch tối ở mép màn hình. Trả lại 0.32.
- Tạm đổi Hard Land Speed thành 0: mọi lần tiếp đất đều rung, và bạn sẽ hiểu vì sao cần ngưỡng.

## Bài sau

Căn phòng đứng trên một nền đen trơn. Bài 14 thêm hậu cảnh cuộn chậm hơn tiền cảnh, và đi từ một shader tự viết tới một cách đơn giản hơn nhiều bằng chính sprite.
