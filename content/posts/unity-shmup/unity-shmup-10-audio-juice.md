---
title: "Shmup #10: Thiết kế phản hồi — nghe và thấy từng sự kiện"
date: "2026-09-23"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-10-audio-juice
series: "shmup"
order: 10
excerpt: "Nối sự kiện với âm thanh, flash, particle và camera shake; hoàn thiện từng phản hồi trước khi phối hợp toàn bộ."
coverImage: "/images/posts/unity-shmup/10/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>CHỈ CÓ LOGIC</strong><p>HP giảm, địch biến mất, điểm tăng.</p></div><div><strong>CÓ PHẢN HỒI</strong><p>Nghe phát bắn, thấy hit, nhận ra kill và phân biệt tàu bị thương.</p></div></div>

## Bắt đầu từ điều người chơi cần nhận ra

Ván chơi đã đúng luật hết rồi. Nhưng bắn thì không nghe thấy gì, trúng đòn không thấy gì, địch chết cũng lặng lẽ biến mất. Bài này không đổi một con số damage nào, chỉ làm cho những luật đang chạy sẵn hiện ra để người chơi nhận biết được.

Lưu scene thành `SEU_10_Juice`. Bài chia làm bốn chặng độc lập — âm thanh, flash, nổ, rung — và mỗi chặng chạy được một mình. Làm xong chặng nào thì kiểm tra chặng đó rồi mới sang chặng sau, vì bốn thứ này cộng lại rất khó tách nếu có gì sai.

| Sự kiện | Âm thanh | Hình | Camera |
|---|---|---|---|
| Fired | Laser nhỏ | Đạn đã có | Không |
| Enemy.Damaged | Không bắt buộc | Flash ngắn | Không |
| Enemy.Killed | Explosion | Burst tại nơi chết | Rung nhẹ |
| Player.Damaged | Hit riêng | Flash tàu | Rung rõ hơn |
| Collected | Pickup | Khiên nếu có | Không |
| GameOver | Âm kết thúc | Panel đã có | Không thêm |

Nguyên tắc xuyên suốt: gameplay chỉ báo sự kiện, còn các listener biến sự kiện thành phản hồi. Một cú giết địch không nên phải tự gọi `AudioSource`, particle và camera. Phép thử là tắt hết listener đi thì ván chơi vẫn đúng luật, chỉ mất phần nghe nhìn.

## Chặng âm thanh

Lấy các clip ngắn bạn có, hoặc tải [Kenney Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds). Chọn năm clip và đặt tên theo vai trò trong `Audio/SFX`: Laser, Explosion, Hit, Pickup, GameOver.

Thay `PlayerShooting` và `PlayerPowerups` bằng bản bài 10, hai file này bổ sung event `Fired` và `Collected`. `Health` đã có event `Damaged` riêng từ bài 5, và bây giờ là lúc quyết định đó trả công: `Damaged` chỉ bắn khi thật sự trúng đòn, nên hồi máu không bị phát nhầm thành tiếng va chạm.

**Assets/_ShootEmUp/Scripts/Audio/GameSfx.cs**

```csharp
using ShootEmUp.Combat;
using ShootEmUp.Core;
using ShootEmUp.Enemies;
using ShootEmUp.FX;
using ShootEmUp.Player;
using UnityEngine;

namespace ShootEmUp.Audio
{
    [RequireComponent(typeof(AudioSource))]
    public sealed class GameSfx : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private PlayerShooting playerShooting;
        [SerializeField] private PlayerPowerups playerPowerups;
        [SerializeField] private Health playerHealth;
        [SerializeField] private GameSession session;
        [SerializeField] private CameraShake cameraShake;

        [Header("Clips")]
        [SerializeField] private AudioClip laser;
        [SerializeField] private AudioClip explosion;
        [SerializeField] private AudioClip hit;
        [SerializeField] private AudioClip pickup;
        [SerializeField] private AudioClip gameOver;

        [Header("Mix")]
        [SerializeField, Range(0f, 1f)] private float laserVolume = 0.35f;

        private AudioSource source;

        private void Awake()
        {
            source = GetComponent<AudioSource>();
        }

        private void OnEnable()
        {
            playerShooting.Fired += OnFired;
            playerPowerups.Collected += OnCollected;
            playerHealth.Damaged += OnPlayerHealthChanged;
            session.GameOver += OnGameOver;
            Enemy.Killed += OnEnemyKilled;
        }

        private void OnDisable()
        {
            playerShooting.Fired -= OnFired;
            playerPowerups.Collected -= OnCollected;
            playerHealth.Damaged -= OnPlayerHealthChanged;
            session.GameOver -= OnGameOver;
            Enemy.Killed -= OnEnemyKilled;
        }

        private void OnFired() => source.PlayOneShot(laser, laserVolume);
        private void OnCollected(Data.PickupData _) => source.PlayOneShot(pickup);
        private void OnGameOver() => source.PlayOneShot(gameOver);

        private void OnEnemyKilled(Enemy _)
        {
            source.PlayOneShot(explosion, 0.8f);
            if (cameraShake != null) cameraShake.Shake(0.12f, 0.15f);
        }

        private void OnPlayerHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            source.PlayOneShot(hit);
            if (cameraShake != null) cameraShake.Shake();
        }
    }
}
```

Cả class chỉ là một bảng nối sự kiện với clip, và toàn bộ phần `OnDisable` tồn tại để gỡ đúng những gì `OnEnable` đã đăng ký. `PlayOneShot` cho phép nhiều clip ngắn chồng lên nhau trên cùng một `AudioSource`, khác với `Play` sẽ cắt ngang clip đang chạy.

`laserVolume` mặc định 0.35 là quyết định phối âm chứ không phải con số tuỳ tiện. Ở nhịp 6 phát mỗi giây, tiếng laser để nguyên âm lượng sẽ che mất tiếng báo tàu bị thương, mà đó lại là tiếng người chơi cần nghe nhất.

Tạo Empty tên `GameSfx`, thêm `AudioSource` với **Play On Awake tắt** và **Spatial Blend = 0**. Spatial Blend 0 nghĩa là âm 2D, phát đều không phụ thuộc vị trí — đúng thứ ta cần cho SFX giao diện.

![GameSfx trước khi nối năm nguồn và năm clip](/images/posts/unity-shmup/10/juice_01_gamesfx-before.webp)

Nối năm nguồn sự kiện và năm clip. Ô Camera Shake để trống lúc này, chặng cuối mới điền:

![GameSfx sau khi nối đủ](/images/posts/unity-shmup/10/juice_02_gamesfx-after.webp)

Main Camera phải có đúng một `AudioListener` đang hoạt động, nhiều hơn một thì Unity cảnh báo và âm thanh có thể kỳ lạ.

Bấm Play và thử từng việc: bắn, nhặt đồ, bị đánh, giết địch, chết. Nếu một lần nhấn phát ra hai tiếng thì listener đang được đăng ký hai lần — kiểm tra xem có hai `GameSfx` trong scene không. Sửa xong mới sang chặng hình.

## Chặng flash

Flash là đổi màu RGB của sprite trong một khoảng rất ngắn rồi trả về như cũ, nhưng giữ nguyên alpha để hình không bị mất viền. Shader nhận một tham số `_FlashAmount`: 0 là màu thường, 1 là màu flash.

Tạo `Art/Shaders/SpriteFlash.shader`. Đây là shader unlit tối thiểu khớp với cấu hình URP của series, không phải bản thay thế đầy đủ cho mọi tính năng của SpriteRenderer.

<details><summary>Shader đầy đủ — mở khi tạo file</summary>

**Assets/_ShootEmUp/Art/Shaders/SpriteFlash.shader**

```hlsl
// Sprite shader for URP 2D: same as Sprite-Unlit, plus a _FlashAmount that blends the sprite towards _FlashColor.
// Driven per-instance from HitFlash.cs through a MaterialPropertyBlock, so every enemy shares one material.
Shader "ShootEmUp/SpriteFlash"
{
    Properties
    {
        [MainTexture] _MainTex ("Sprite Texture", 2D) = "white" {}
        [MainColor] _Color ("Tint", Color) = (1,1,1,1)
        _FlashColor ("Flash Color", Color) = (1,1,1,1)
        _FlashAmount ("Flash Amount", Range(0, 1)) = 0
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline"="UniversalPipeline" "IgnoreProjector"="True" "PreviewType"="Plane" }
        Cull Off
        Lighting Off
        ZWrite Off
        Blend One OneMinusSrcAlpha

        Pass
        {
            Name "Unlit"
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float3 positionOS : POSITION;
                float4 color      : COLOR;
                float2 uv         : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float4 color      : COLOR;
                float2 uv         : TEXCOORD0;
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST;
                half4 _Color;
                half4 _FlashColor;
                half  _FlashAmount;
            CBUFFER_END

            Varyings vert(Attributes v)
            {
                Varyings o;
                o.positionCS = TransformObjectToHClip(v.positionOS);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                o.color = v.color * _Color;
                return o;
            }

            half4 frag(Varyings i) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv) * i.color;
                // lerp towards the flash colour but keep the sprite's alpha so the silhouette stays
                tex.rgb = lerp(tex.rgb, _FlashColor.rgb, _FlashAmount);
                tex.rgb *= tex.a; // premultiplied alpha, matches Blend One OneMinusSrcAlpha
                return tex;
            }
            ENDHLSL
        }
    }
    Fallback "Universal Render Pipeline/2D/Sprite-Unlit-Default"
}
```

</details>

Chi tiết dễ sai nhất nằm ở hai dòng cuối hàm `frag`. Fragment trộn màu trước rồi mới nhân alpha **đúng một lần**, vì blend mode là `One OneMinusSrcAlpha` tức premultiplied alpha. Nếu nhân alpha ở cả màu flash lẫn kết quả, mép bán trong suốt của sprite sẽ tối đi một cách khó hiểu.

Tạo Material **Mat_SpriteFlash** với shader `ShootEmUp/SpriteFlash` và Flash Amount 0:

![Material Mat_SpriteFlash](/images/posts/unity-shmup/10/juice_03_material.webp)

Gán material đó vào Sprite Renderer của `Player` và của prefab địch, rồi thêm `HitFlash` lên cả hai.

**Assets/_ShootEmUp/Scripts/FX/HitFlash.cs**

```csharp
using System.Collections;
using ShootEmUp.Combat;
using UnityEngine;

namespace ShootEmUp.FX
{
    [RequireComponent(typeof(SpriteRenderer), typeof(Health))]
    public sealed class HitFlash : MonoBehaviour
    {
        private static readonly int FlashAmount = Shader.PropertyToID("_FlashAmount");

        [SerializeField, Min(0.01f)] private float duration = 0.08f;

        private SpriteRenderer spriteRenderer;
        private Health health;
        private MaterialPropertyBlock block;
        private Coroutine routine;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            health = GetComponent<Health>();
            block = new MaterialPropertyBlock();
            health.Damaged += OnHealthChanged;
        }

        private void OnDestroy()
        {
            health.Damaged -= OnHealthChanged;
        }

        private void OnEnable()
        {
            SetFlash(0f);
        }

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            routine = null;
            SetFlash(0f);
        }

        private void OnHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Flash());
        }

        private IEnumerator Flash()
        {
            SetFlash(1f);
            yield return new WaitForSeconds(duration);
            SetFlash(0f);
            routine = null;
        }

        private void SetFlash(float amount)
        {
            spriteRenderer.GetPropertyBlock(block);
            block.SetFloat(FlashAmount, amount);
            spriteRenderer.SetPropertyBlock(block);
        }
    }
}
```

`MaterialPropertyBlock` là chỗ đi xa hơn tutorial thường của bài này. Cách phổ thông là `spriteRenderer.material.SetFloat(...)`, nhưng gọi `.material` khiến Unity nhân bản material riêng cho từng renderer, nên mười con địch thành mười material. Property block ghi giá trị riêng cho từng renderer mà vẫn dùng chung một material asset.

`SetFlash(0f)` được gọi trong `OnEnable` là luật pool từ bài 4 áp dụng cho hiệu ứng: một con địch bị giết đúng lúc đang flash sẽ quay về pool với `_FlashAmount` bằng 1, và lần spawn sau nó trắng toát nếu không reset.

![Một frame flash trên con địch vừa trúng đạn](/images/posts/unity-shmup/10/juice_04_enemy-prefab-hitflash.webp)

![Flash trắng trong 0.08 giây](/images/posts/unity-shmup/10/juice_05_flash-frame.webp)

Kiểm tra trên con địch 2 HP: phát đầu nó còn sống nên bạn thấy flash, phát thứ hai nó bị dọn ngay nên particle ở chặng sau mới là thứ báo kill. Tàu đang có khiên không nhận `Damaged` nên không flash khi đòn bị chặn — đó là đúng, vì không có sát thương nào xảy ra.

## Chặng nổ

Tạo Empty **FX_Explosion** và thêm `ParticleSystem`:

| Module | Cấu hình khởi đầu |
|---|---|
| Main | Duration 0.5, Looping tắt, Play On Awake tắt |
| Main | Lifetime 0.35–0.7, Speed 2.5–6, Size 0.25–0.55 |
| Main | Simulation Space World, Stop Action Callback |
| Emission | Rate 0, Burst tại 0, Count 22 |
| Shape | Circle, Radius 0.15 |
| Size over Lifetime | Giảm từ 1 về 0 |
| Color over Lifetime | Vàng/cam, alpha giảm về 0 |
| Renderer | Sorting FX, material particle unlit trong suốt |

![ParticleSystem của FX_Explosion](/images/posts/unity-shmup/10/juice_06_particle-inspector.webp)

Hai dòng đáng chú ý. **Simulation Space World** giữ các hạt đứng yên tại chỗ nổ thay vì bị kéo theo object; để Local thì vụ nổ trôi theo pool khi object được tái sử dụng. **Stop Action Callback** là điều kiện để hàm `OnParticleSystemStopped` được gọi, và nếu quên bật thì object không bao giờ tự trả về pool.

Material hạt tạo bằng **Universal Render Pipeline/Particles/Unlit** với Surface Type Transparent và một texture hạt mềm. Bấm preview ParticleSystem trong Scene view để chắc chắn có hạt hiện ra trước khi nối vào code, vì không đoạn code nào cứu được một material vô hình.

Thêm `PooledObject` và `PooledParticle` rồi lưu thành prefab.

**Assets/_ShootEmUp/Scripts/FX/PooledParticle.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.FX
{
    [RequireComponent(typeof(ParticleSystem), typeof(PooledObject))]
    public sealed class PooledParticle : MonoBehaviour
    {
        private ParticleSystem system;
        private PooledObject pooled;

        private void Awake()
        {
            system = GetComponent<ParticleSystem>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            system.Play(true);
        }

        private void OnParticleSystemStopped()
        {
            pooled.Release();
        }
    }
}
```

Tạo `ExplosionPool` với prefab `FX_Explosion`, Prewarm 8, Max Size 30. Thêm `ExplosionOnKill` lên một object trong scene và nối pool vào; file đầy đủ nằm trong gói source. Nó gọi `Get` với vị trí và scale **trước khi** particle được bật, để burst đầu tiên không xuất hiện ở chỗ của lần nổ trước.

![Vụ nổ tại chỗ con địch vừa chết](/images/posts/unity-shmup/10/juice_07_explosion-frame.webp)

Kiểm tra: nổ xong object trở về trạng thái inactive trong Hierarchy, và giết con tiếp theo vẫn nổ được. Nếu vụ nổ mới còn sót hạt của lần trước thì xem lại phần clear của ParticleSystem.

## Chặng rung

Rung thẳng vị trí Main Camera là cách làm sai kín đáo nhất bài này. `ScreenBounds` đọc vị trí camera để tính vùng spawn và biên di chuyển của tàu, nên camera rung thì cả hai vùng đó rung theo, và tàu bị đẩy nhẹ mỗi lần có vụ nổ.

Cách tách ra: tạo Empty **CameraRig** tại (0,0,0), kéo Main Camera làm con của nó và giữ local position (0,0,−10). Camera vẫn orthographic Size 8 và local rotation 0. Rig đứng yên làm khung gameplay, còn camera con là thứ được phép rung.

Thay `PlayerMovement` và `ScreenBounds` bằng bản bài 10 trong gói source: chúng lấy tâm gameplay từ parent `CameraRig` khi có parent. Đừng đặt camera dưới một parent khác có offset ngoài quy ước này.

Gắn `CameraShake` lên **Main Camera**, không gắn lên rig.

**Assets/_ShootEmUp/Scripts/FX/CameraShake.cs**

```csharp
using System.Collections;
using UnityEngine;

namespace ShootEmUp.FX
{
    public sealed class CameraShake : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float defaultStrength = 0.25f;
        [SerializeField, Min(0.01f)] private float defaultDuration = 0.2f;

        private Vector3 restPosition;
        private Coroutine routine;

        private void OnEnable()
        {
            restPosition = transform.localPosition;
        }

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

`falloff` giảm dần từ 1 về 0 nên cú rung mạnh lúc đầu rồi tắt dần, giống va đập thật. Rung đều biên độ từ đầu tới cuối nghe như động đất chứ không như một vụ nổ.

Một yêu cầu mới tới trong lúc đang rung sẽ thay cú rung cũ chứ không cộng chồng, nhờ `StopCoroutine` ở đầu `Shake`. Và `restPosition` luôn được trả lại khi component tắt, để camera không kẹt ở một vị trí lệch.

Kéo component này vào ô Camera Shake của `GameSfx`. Kill dùng cú rung nhẹ 0.12 trong 0.15 giây, còn tàu trúng đòn dùng giá trị mặc định mạnh hơn — người chơi phân biệt được hai sự kiện chỉ bằng cảm giác.

## Phối hợp và kiểm tra các mốc tái sử dụng

Chơi trọn một vòng và soát theo danh sách này: bắn liên tục nhiều phát, giết mấy con gần nhau, để khiên chặn một hit, chờ khiên hết hạn, để tàu trúng đòn, Game Over, rồi Restart.

Năm điểm cần đúng. Không có tiếng hit khi nhặt bình máu. Con địch tái sử dụng không tự flash chỉ vì loại mới có ít máu hơn. Vụ nổ xuất hiện đúng chỗ con địch chết. Camera trở về vị trí gốc sau mỗi cú rung. Và giới hạn di chuyển của tàu không trôi theo lúc camera rung.

![Ván chơi với đầy đủ âm thanh, flash, nổ và rung](/images/posts/unity-shmup/10/juice_08_juice.webp)

Lớp phản hồi bây giờ bám vào các sự kiện rõ ràng. Shader với particle chỉ là phần biểu diễn: tắt `GameSfx`, `HitFlash` và `ExplosionOnKill` đi thì ván chơi vẫn chạy đúng luật như bài 9.

## Mã nguồn chặng này

[Tải script bài 10](/downloads/shmup/lesson-10.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #11](/lab/unity-shmup-11-build-webgl).
