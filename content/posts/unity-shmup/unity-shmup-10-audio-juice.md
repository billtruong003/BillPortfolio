---
title: "Shmup #10: Âm thanh và juice — SFX, shader flash, camera shake, particle nổ"
date: "2026-09-23"
lang: "vi"
series: "shmup"
order: 10
excerpt: "AudioSource.PlayOneShot qua event, shader HLSL đầu tiên cho URP 2D (SpriteFlash) điều khiển bằng MaterialPropertyBlock, camera shake coroutine, Particle System pooled với Stop Action Callback."
coverImage: "/images/posts/unity-shmup/10/cover.webp"
category: "unity-dev"
tags: ["Unity", "Audio", "Shader", "HLSL", "Particle System", "Game Feel", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- `AudioSource.PlayOneShot`: một source phát nhiều clip chồng nhau
- Một script duy nhất (`GameSfx`) nối **event gameplay → âm thanh/rung**
- **Shader HLSL đầu tiên cho URP 2D**: `SpriteFlash` = Sprite-Unlit + `_FlashAmount`. Cửa ngõ vào series shader
- **MaterialPropertyBlock**: đổi giá trị shader trên từng object mà không nhân bản material
- Camera shake bằng coroutine với nhiễu giảm dần
- Particle System cấu hình bằng tay, Stop Action = Callback để pool

Xong bài này: bắn có tiếng, trúng địch nháy trắng, địch chết nổ lửa + rung nhẹ, tàu trúng đòn rung mạnh + tiếng thud.

![Juice](/images/posts/unity-shmup/10/juice_08_juice.webp)

## 1. Âm thanh

Không có asset audio, mình sinh 5 file WAV 22 kHz bằng script Node (laser quét tần số xuống, explosion = nhiễu lọc thấp + rumble, hit = thud, pickup = 3 nốt C5–E5–G5, gameover = hai tone hạ). Bạn thay bằng Kenney hay freesound CC0 đều được, chỉ cần kéo vào đúng ô. Đặt vào `Audio/SFX/`, import mặc định là đủ cho clip < 1 s.

`PlayerShooting` thêm `event Action Fired`, `PlayerPowerups` thêm `event Action<PickupData> Collected`: hai móc treo mới, không đổi logic.

`Scripts/Audio/GameSfx.cs` (rút gọn):

```csharp
[RequireComponent(typeof(AudioSource))]
public sealed class GameSfx : MonoBehaviour
{
    [SerializeField] private PlayerShooting playerShooting;
    [SerializeField] private PlayerPowerups playerPowerups;
    [SerializeField] private Health playerHealth;
    [SerializeField] private GameSession session;
    [SerializeField] private CameraShake cameraShake;
    [SerializeField] private AudioClip laser, explosion, hit, pickup, gameOver;

    private AudioSource source;
    private int lastPlayerHealth;

    private void OnEnable()
    {
        lastPlayerHealth = playerHealth.Current;
        playerShooting.Fired += OnFired;
        playerPowerups.Collected += OnCollected;
        playerHealth.Changed += OnPlayerHealthChanged;
        session.GameOver += OnGameOver;
        Enemy.Killed += OnEnemyKilled;
    }
    // OnDisable: trừ hết

    private void OnFired() => source.PlayOneShot(laser, 0.35f);
    private void OnEnemyKilled(Enemy _) { source.PlayOneShot(explosion, 0.8f); cameraShake.Shake(0.12f, 0.15f); }
    private void OnPlayerHealthChanged(Health h)
    {
        var lost = h.Current < lastPlayerHealth;
        lastPlayerHealth = h.Current;
        if (!lost) return;
        source.PlayOneShot(hit);
        cameraShake.Shake();
    }
}
```

Empty `GameSfx` → Audio Source (Play On Awake ✗, Spatial Blend 0) + `GameSfx`, kéo 5 nguồn event và 5 clip:

![GameSfx](/images/posts/unity-shmup/10/juice_02_gamesfx-after.webp)

Gameplay không biết audio tồn tại. Thêm âm thanh mới = thêm một dòng ở đây.

## 2. Sprite flash shader

`Art/Shaders/SpriteFlash.shader`: bản Sprite-Unlit của URP cộng thêm 2 property. Phần quan trọng:

```hlsl
Properties
{
    [MainTexture] _MainTex ("Sprite Texture", 2D) = "white" {}
    [MainColor] _Color ("Tint", Color) = (1,1,1,1)
    _FlashColor ("Flash Color", Color) = (1,1,1,1)
    _FlashAmount ("Flash Amount", Range(0, 1)) = 0
}

// ...
CBUFFER_START(UnityPerMaterial)
    float4 _MainTex_ST;
    half4 _Color;
    half4 _FlashColor;
    half  _FlashAmount;
CBUFFER_END

half4 frag(Varyings i) : SV_Target
{
    half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv) * i.color;
    tex.rgb = lerp(tex.rgb, _FlashColor.rgb * tex.a, _FlashAmount);
    tex.rgb *= tex.a;   // premultiplied, đi với Blend One OneMinusSrcAlpha
    return tex;
}
```

- `lerp(a, b, t)`: t = 0 giữ màu gốc, t = 1 thành màu flash. Nhân `tex.a` để vùng trong suốt không sáng lên.
- `Blend One OneMinusSrcAlpha` + nhân alpha vào rgb = premultiplied alpha, cùng cách Sprite-Unlit-Default làm, nên đặt cạnh nhau không lệch màu.
- `CBUFFER_START(UnityPerMaterial)`: khai báo property trong cbuffer để SRP Batcher gộp draw call.
- Series shader sẽ mổ xẻ từng dòng; ở đây chỉ cần hiểu "shader = hàm tính màu từng pixel, property = biến chỉnh được".

Create → Material `Mat_SpriteFlash`, Shader `ShootEmUp/SpriteFlash`. Gán vào Sprite Renderer của prefab `Enemy_Insect` và `Player`:

![Material](/images/posts/unity-shmup/10/juice_03_material.webp)

`Scripts/FX/HitFlash.cs` lắng nghe `Health.Changed`, máu giảm thì flash 0.08 s:

```csharp
private static readonly int FlashAmount = Shader.PropertyToID("_FlashAmount");
private MaterialPropertyBlock block;

private void SetFlash(float amount)
{
    spriteRenderer.GetPropertyBlock(block);
    block.SetFloat(FlashAmount, amount);
    spriteRenderer.SetPropertyBlock(block);
}
```

Không dùng `spriteRenderer.material.SetFloat`: `.material` tạo **bản sao material riêng** cho object đó (rò rỉ + phá batching). `.sharedMaterial` thì mọi bọ cùng nháy. PropertyBlock = override cho riêng renderer này, material vẫn chung. `Shader.PropertyToID` cache thành `static readonly int`: tra chuỗi mỗi frame là tốn.

![Prefab với HitFlash](/images/posts/unity-shmup/10/juice_04_enemy-prefab-hitflash.webp)

## 3. Camera shake

`Scripts/FX/CameraShake.cs` trên `Main Camera`:

```csharp
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
}
```

`yield return null` = chờ 1 frame. Nhớ `OnDisable` trả vị trí, không thì tắt giữa chừng camera lệch vĩnh viễn. Đo thử: `Shake(0.5, 1.0)` → camera lệch (0.10, −0.11) ngay sau lệnh, về (0, 0) sau 1 s.

## 4. Particle nổ

Empty `FX_Explosion` → Particle System:

| Module | Giá trị |
|--------|---------|
| Main | Duration 0.5, Looping ✗, Play On Awake ✗, Lifetime 0.35–0.7, Speed 2.5–6, Size 0.25–0.55, Rotation 0–360, Color cam↔vàng, Simulation Space World, **Stop Action = Callback** |
| Emission | Rate 0, Burst t=0 count 22 |
| Shape | Circle radius 0.15 |
| Size over Lifetime | 1 → 0 |
| Color over Lifetime | trắng → cam đậm, alpha 1 → 0 từ 60% |
| Renderer | Material `Mat_Particle_Fire` (Sprite-Unlit + texture `fire`), Sorting Layer FX |

![Particle System](/images/posts/unity-shmup/10/juice_06_particle-inspector.webp)

Add `PooledObject` + `PooledParticle`:

```csharp
[RequireComponent(typeof(ParticleSystem), typeof(PooledObject))]
public sealed class PooledParticle : MonoBehaviour
{
    private void OnEnable() => system.Play(true);
    private void OnParticleSystemStopped() => pooled.Release();
}
```

`OnParticleSystemStopped` chỉ được gọi khi **Stop Action = Callback**. Quên setting này là particle nổ xong nằm im trong pool mãi, pool cạn.

`ExplosionPool` (prewarm 8) + `ExplosionOnKill` nghe `Enemy.Killed`, scale theo `colliderRadius` của địch.

## 5. Dọn nợ bài 9

`GameSession` → Disable On Game Over thêm phần tử thứ 4: `PolygonCollider2D` của Player. Collider2D là `Behaviour`, tắt được như script. Chết rồi thì không nhặt bonus, không "trúng đạn" thêm.

## Lỗi mình gặp

| Lỗi | Nguyên nhân | Sửa |
|-----|-------------|-----|
| Explosion không thấy, chỉ thấy đạn | Material particle dùng shader Particles/Unlit của URP mà chưa set Surface Type | Dùng luôn `Sprite-Unlit-Default` với texture lửa, đơn giản và hợp 2D |
| Flash không thấy trên Player | Quên đổi Material của Player, chỉ đổi trên prefab bọ | Player không phải prefab (chưa), đổi tay |

## Bài sau

[Shmup #11](/lab/unity-shmup-11-build-webgl): build WebGL và đưa lên trang Arcade.
