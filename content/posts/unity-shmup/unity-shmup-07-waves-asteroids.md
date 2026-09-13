---
title: "Shmup #7: Wave spawner và thiên thạch — Coroutine, spawn từ pool"
date: "2026-09-20"
lang: "vi"
series: "shmup"
order: 7
excerpt: "Coroutine với yield return WaitForSeconds, WaveSet ScriptableObject có struct lồng, spawn từ pool + Apply data, random có padding, thiên thạch xoay, và sửa lỗi đạn trúng 2 mục tiêu cùng frame."
coverImage: "/images/posts/unity-shmup/07/cover.webp"
category: "unity-dev"
tags: ["Unity", "Coroutine", "Spawner", "ScriptableObject", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- **Coroutine**: `IEnumerator`, `yield return new WaitForSeconds`, một hàm chạy dàn trải theo thời gian
- `WaveSet` ScriptableObject với `[Serializable] struct` lồng: designer sửa kịch bản spawn không cần code
- Spawn từ pool + `Enemy.Apply(data)`: một pool, nhiều loại địch
- Random có kiểm soát: `Random.Range` trong biên có padding, tính từ `ScreenBounds`
- Thiên thạch = cũng là "enemy" chỉ khác data: thêm `colliderRadius`, `rotationSpeed` vào `EnemyData`
- Sửa lỗi tiềm ẩn bài 5: đạn trúng 2 mục tiêu cùng frame

Xong bài này: màn chơi vô tận với 6 wave lặp: bọ thường, mưa thiên thạch nhỏ, bọ nhanh, thiên thạch vừa, bọ + 1 thiên thạch lớn 6 máu.

![Waves](/images/posts/unity-shmup/07/waves_07_waves.webp)

## 1. EnemyData thêm 2 field

```csharp
[Tooltip("Degrees per second. Asteroids tumble, insects do not.")]
public float rotationSpeed = 0f;

[Tooltip("Radius of the trigger circle in world units.")]
[Min(0.05f)] public float colliderRadius = 0.45f;
```

`Enemy.Apply` ghi thêm `circle.radius = data.colliderRadius` và `mover.RotationSpeed = data.rotationSpeed`. `EnemyMover.FixedUpdate` thêm `body.MoveRotation(body.rotation + rotationSpeed * Time.fixedDeltaTime)`.

3 asset thiên thạch mới:

| Asset | Sprite | Radius | Xoay °/s | HP | Speed | Điểm |
|-------|--------|--------|----------|----|-------|------|
| Asteroid_Small | small-A (96 px) | 0.4 | 90 | 1 | 4 | 5 |
| Asteroid_Medium | medium-A (126 px) | 0.55 | 45 | 3 | 2.5 | 15 |
| Asteroid_Large | large-A (192 px) | 0.85 | 20 | 6 | 1.5 | 40 |

Cách tính radius: px / PPU / 2, rồi bớt 10–15% cho công bằng (người chơi thấy "trượt" khó chịu hơn "né sát nút").

![Asteroid_Large](/images/posts/unity-shmup/07/waves_01_asteroid-data.webp)

## 2. WaveSet

`Scripts/Data/WaveSet.cs`:

```csharp
[CreateAssetMenu(menuName = "ShootEmUp/Wave Set", fileName = "Waves_New")]
public sealed class WaveSet : ScriptableObject
{
    [Serializable]
    public struct Wave
    {
        public EnemyData enemy;
        [Min(1)] public int count;
        [Min(0f)] public float interval;     // giây giữa 2 spawn trong wave
        [Min(0f)] public float delayAfter;   // giây chờ sau wave
    }

    public Wave[] waves = Array.Empty<Wave>();
    public bool loop = true;
}
```

`[Serializable]` trên struct lồng là thứ làm Unity vẽ được list trong Inspector. Không có nó, field `waves` biến mất.

Create → ShootEmUp → **Wave Set** → `ScriptableObjects/Waves/Waves_Level1`, điền 6 wave:

![Waves_Level1](/images/posts/unity-shmup/07/waves_02_waveset-inspector.webp)

## 3. WaveSpawner

`Scripts/Enemies/WaveSpawner.cs`:

```csharp
public sealed class WaveSpawner : MonoBehaviour
{
    [SerializeField] private PrefabPool enemyPool;
    [SerializeField] private WaveSet waveSet;
    [SerializeField] private float spawnMargin = 1.5f;
    [SerializeField] private float horizontalPadding = 1f;
    [SerializeField] private float initialDelay = 1f;

    private Coroutine running;

    private void OnEnable()  => running = StartCoroutine(Run());
    private void OnDisable() { if (running != null) StopCoroutine(running); }

    private IEnumerator Run()
    {
        yield return new WaitForSeconds(initialDelay);
        do
        {
            foreach (var wave in waveSet.waves)
            {
                for (var i = 0; i < wave.count; i++)
                {
                    Spawn(wave.enemy);
                    yield return new WaitForSeconds(wave.interval);
                }
                yield return new WaitForSeconds(wave.delayAfter);
            }
        }
        while (waveSet.loop);
    }

    private void Spawn(EnemyData data)
    {
        var bounds = ScreenBounds.Get();
        var x = Random.Range(bounds.xMin + horizontalPadding, bounds.xMax - horizontalPadding);
        var enemy = enemyPool.Get(new Vector3(x, bounds.yMax + spawnMargin, 0f), Quaternion.identity);
        enemy.GetComponent<Enemy>().Apply(data);
    }
}
```

Coroutine cho người mới:
- Hàm thường chạy hết trong 1 frame. Coroutine dừng ở mỗi `yield return` và tiếp tục sau. `WaitForSeconds(0.8f)` = "ngủ 0.8 s rồi chạy tiếp dòng dưới".
- Vòng `foreach` + `for` viết y như kịch bản đọc từ trên xuống. Đó là sức mạnh của coroutine so với máy trạng thái bằng `Update` + timer.
- `StartCoroutine` trong `OnEnable`, `StopCoroutine` trong `OnDisable`: tắt object là dừng spawn. Bài 8 Game Over chỉ cần `enabled = false`.
- `Random.Range(float, float)` bao gồm cả hai đầu; bản `int` thì không bao gồm đầu cuối. Bẫy kinh điển.

## 4. Scene

Copy → `SEU_07_Waves`. Xoá object `Enemies` (3 con đặt tay bài 5).

- Empty `EnemyPool` → `PrefabPool`: Prefab `Enemy_Insect`, Prewarm 15, Max Size 60.
- Empty `WaveSpawner` → `WaveSpawner`: Enemy Pool ← `EnemyPool`, Wave Set ← `Waves_Level1`.

![Trước](/images/posts/unity-shmup/07/waves_03_spawner-before-wire.webp)
![Sau](/images/posts/unity-shmup/07/waves_04_spawner-after-wire.webp)

## 5. Sửa lỗi đạn trúng 2 mục tiêu

`DamageOnContact` thêm cờ:

```csharp
private bool consumed;

private void OnEnable() => consumed = false;

private void OnTriggerEnter2D(Collider2D other)
{
    if (consumed) return;
    // ... TakeDamage như cũ
    if (!releaseSelfOnHit) return;
    consumed = true;
    pooled.Release();
}
```

Không có nó, 1 đạn chạm 2 thiên thạch chồng nhau cùng bước physics → `Release` 2 lần → `InvalidOperationException: Trying to release an object that has already been released`. Reset trong `OnEnable` vì đạn được pool dùng lại.

## 6. Chạy thử

![Hierarchy lúc Play](/images/posts/unity-shmup/07/waves_06_hierarchy-in-play.webp)

| t | active | inactive | children |
|---|--------|----------|----------|
| 2.2 | 2 | 13 | 15 |
| 8.8 | **5** | 10 | 15 |
| 18.6 | 2 | 13 | 15 |

Pool 15 con, đỉnh 5 active → Prewarm 15 dư, hạ xuống 10 được. Không exception trong 19 s kể cả khi đạn trúng thiên thạch chồng nhau.

## Chú ý

- Prefab tên `Enemy_Insect` giờ đóng vai cả thiên thạch. Đặt tên `Enemy_Generic` từ đầu thì đúng hơn; đổi tên prefab trong Unity an toàn (GUID giữ nguyên).
- Coroutine chết cùng object. `Destroy` spawner là hết, không cần dọn.

## Bài sau

[Shmup #8](/lab/unity-shmup-08-hud-game-loop): HUD điểm/máu, Game Over, Restart, và cách nối event mà gameplay không biết UI tồn tại.
