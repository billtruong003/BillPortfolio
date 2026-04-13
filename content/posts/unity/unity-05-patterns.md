---
title: "Unity Cho Người Mới #5: Design Patterns — Singleton, Observer & Object Pool"
date: "2024-11-17"
excerpt: "Bài cuối series Unity: các design patterns phổ biến nhất trong game dev — Singleton, Observer/Event, Object Pooling và ScriptableObject."
coverImage: "/images/posts/unity-fundamental.png"
category: "unity-dev"
tags: ["Unity", "Design Patterns", "Game Development", "Tutorial"]
published: true
featured: true
---

## Tại sao cần Design Patterns?

Bạn đã biết cách di chuyển, va chạm, bắn đạn, làm UI. Nhưng khi game lớn lên — 50 scripts, 200 prefabs, 10 systems — code bắt đầu rối. Các systems phụ thuộc chồng chéo, sửa chỗ này hỏng chỗ kia.

Design patterns giải quyết vấn đề này. Chúng là **giải pháp đã được chứng minh** cho các vấn đề kiến trúc phổ biến.

## Singleton — Đảm bảo chỉ có 1 instance

![Singleton Pattern](/images/posts/diagrams/singleton-pattern.svg)

### Vấn đề

GameManager, AudioManager, UIManager — các hệ thống toàn cục chỉ nên tồn tại **duy nhất 1 instance**. Và các scripts khác cần truy cập chúng dễ dàng.

### Implementation

```csharp
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    public int Score { get; private set; }
    public bool IsGameOver { get; private set; }

    void Awake()
    {
        // Nếu đã có instance khác → hủy bản thân
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);  // sống qua scene transitions
    }

    public void AddScore(int points)
    {
        if (IsGameOver) return;
        Score += points;
        Debug.Log($"Score: {Score}");
    }

    public void GameOver()
    {
        IsGameOver = true;
        Debug.Log("GAME OVER!");
    }
}
```

### Sử dụng từ bất kỳ script nào

```csharp
// Trong PlayerController, EnemyAI, UI, bất kỳ đâu:
GameManager.Instance.AddScore(100);

if (GameManager.Instance.IsGameOver)
    return;
```

### Generic Singleton (tái sử dụng)

```csharp
public class Singleton<T> : MonoBehaviour where T : MonoBehaviour
{
    public static T Instance { get; private set; }

    protected virtual void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = (T)(MonoBehaviour)this;
        DontDestroyOnLoad(gameObject);
    }
}

// Sử dụng:
public class AudioManager : Singleton<AudioManager>
{
    public void PlaySFX(AudioClip clip) { /* ... */ }
}

public class UIManager : Singleton<UIManager>
{
    public void ShowDamageNumber(Vector3 pos, int dmg) { /* ... */ }
}
```

### Cẩn thận với Singleton

- Dùng **ít nhất có thể** — chỉ cho managers thực sự global
- Tạo dependency ẩn — code phụ thuộc Singleton mà không rõ ràng
- Khó test — coupling chặt
- OK cho: GameManager, AudioManager, InputManager
- KHÔNG OK cho: Player, Enemy, Weapon — dùng references thay thế

## Observer Pattern — Event System

![Observer Pattern — Tight Coupling vs Event System](/images/posts/diagrams/observer-pattern.svg)

### Vấn đề

Player chết → UI hiện "Game Over", Audio phát nhạc buồn, Enemy dừng AI, Camera shake. Nếu Player script gọi trực tiếp từng hệ thống:

```csharp
// BAD — Player biết quá nhiều về các hệ thống khác
void Die()
{
    uiManager.ShowGameOver();
    audioManager.PlayDeathMusic();
    enemyManager.StopAllAI();
    cameraController.Shake();
    particleManager.PlayDeathVFX();
}
```

Thêm hệ thống mới? Phải sửa Player script. Xóa hệ thống? Player script lỗi.

### Giải pháp: Events

```csharp
using System;

public class PlayerHealth : MonoBehaviour
{
    // Khai báo events
    public event Action<int, int> OnHealthChanged;  // (current, max)
    public event Action OnDeath;

    [SerializeField] private int maxHealth = 100;
    private int currentHealth;

    void Start()
    {
        currentHealth = maxHealth;
    }

    public void TakeDamage(int amount)
    {
        currentHealth -= amount;
        if (currentHealth < 0) currentHealth = 0;

        // Fire event — ai đăng ký sẽ nhận thông báo
        OnHealthChanged?.Invoke(currentHealth, maxHealth);

        if (currentHealth <= 0)
            OnDeath?.Invoke();
    }

    public void Heal(int amount)
    {
        currentHealth += amount;
        if (currentHealth > maxHealth) currentHealth = maxHealth;
        OnHealthChanged?.Invoke(currentHealth, maxHealth);
    }
}
```

### Subscribers — Các hệ thống lắng nghe

```csharp
public class HealthBarUI : MonoBehaviour
{
    [SerializeField] private PlayerHealth playerHealth;
    [SerializeField] private Image fillImage;

    void OnEnable()
    {
        playerHealth.OnHealthChanged += UpdateBar;
        playerHealth.OnDeath += ShowDeathUI;
    }

    void OnDisable()
    {
        playerHealth.OnHealthChanged -= UpdateBar;
        playerHealth.OnDeath -= ShowDeathUI;
    }

    void UpdateBar(int current, int max)
    {
        fillImage.fillAmount = (float)current / max;
    }

    void ShowDeathUI() => Debug.Log("[UI] Game Over Screen");
}

public class DeathAudio : MonoBehaviour
{
    [SerializeField] private PlayerHealth playerHealth;
    [SerializeField] private AudioClip deathSound;

    void OnEnable() => playerHealth.OnDeath += PlayDeathSound;
    void OnDisable() => playerHealth.OnDeath -= PlayDeathSound;

    void PlayDeathSound()
    {
        AudioSource.PlayClipAtPoint(deathSound, transform.position);
    }
}
```

**Lợi ích:** Player không biết gì về UI hay Audio. Thêm/xóa subscriber không ảnh hưởng Player.

### Global Event Bus (nâng cao)

```csharp
public static class GameEvents
{
    public static event Action<int> OnScoreChanged;
    public static event Action OnGameOver;
    public static event Action<string, int> OnEnemyKilled;
    public static event Action OnLevelComplete;

    public static void ScoreChanged(int score) => OnScoreChanged?.Invoke(score);
    public static void EnemyKilled(string name, int pts) => OnEnemyKilled?.Invoke(name, pts);
    public static void TriggerGameOver() => OnGameOver?.Invoke();
    public static void LevelCompleted() => OnLevelComplete?.Invoke();
}

// Publisher:
GameEvents.EnemyKilled("Goblin", 100);

// Subscriber (trong UI, Audio, Analytics...):
void OnEnable() => GameEvents.OnEnemyKilled += HandleEnemyKilled;
void OnDisable() => GameEvents.OnEnemyKilled -= HandleEnemyKilled;
```

## Object Pooling — Tái sử dụng objects

![Object Pooling](/images/posts/diagrams/object-pool.svg)

### Vấn đề

Bắn 500 viên đạn/phút. Mỗi viên: `Instantiate()` → bay → `Destroy()`. Liên tục allocate/deallocate bộ nhớ → **garbage collection spikes** → game giật.

### Giải pháp: Pool

Tạo sẵn N objects, tắt đi. Cần dùng → bật lên. Dùng xong → tắt, trả về pool.

```csharp
using System.Collections.Generic;

public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int initialSize = 20;

    private Queue<GameObject> pool = new Queue<GameObject>();

    void Start()
    {
        // Pre-warm: tạo sẵn objects
        for (int i = 0; i < initialSize; i++)
        {
            GameObject obj = Instantiate(prefab, transform);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject Get(Vector3 position, Quaternion rotation)
    {
        GameObject obj;

        if (pool.Count > 0)
        {
            obj = pool.Dequeue();
        }
        else
        {
            // Pool cạn → tạo thêm
            obj = Instantiate(prefab, transform);
        }

        obj.transform.position = position;
        obj.transform.rotation = rotation;
        obj.SetActive(true);
        return obj;
    }

    public void Return(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

### Sử dụng

```csharp
public class Shooter : MonoBehaviour
{
    [SerializeField] private ObjectPool bulletPool;
    [SerializeField] private Transform firePoint;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            GameObject bullet = bulletPool.Get(firePoint.position, firePoint.rotation);
            // Bullet script tự bay, sau đó gọi Return
        }
    }
}

public class Bullet : MonoBehaviour
{
    [SerializeField] private float speed = 20f;
    [SerializeField] private float lifetime = 3f;
    private ObjectPool pool;
    private float timer;

    public void SetPool(ObjectPool pool) => this.pool = pool;

    void OnEnable()
    {
        timer = lifetime;
    }

    void Update()
    {
        transform.Translate(Vector3.forward * speed * Time.deltaTime);

        timer -= Time.deltaTime;
        if (timer <= 0)
            ReturnToPool();
    }

    void OnTriggerEnter(Collider other)
    {
        // Hit something
        ReturnToPool();
    }

    void ReturnToPool()
    {
        if (pool != null)
            pool.Return(gameObject);
        else
            gameObject.SetActive(false);
    }
}
```

## ScriptableObject — Data Container

ScriptableObject lưu data **tách biệt** khỏi scene. Dùng để tạo config, item database, enemy stats mà nhiều objects chia sẻ.

### Tạo ScriptableObject

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "NewWeapon", menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject
{
    public string weaponName;
    public int damage;
    public float attackSpeed;
    public float range;
    public Sprite icon;
    public AudioClip attackSound;
}
```

Sau khi tạo script, vào **Project > Chuột phải > Create > Game > Weapon Data** → tạo asset.

### Sử dụng

```csharp
public class Weapon : MonoBehaviour
{
    [SerializeField] private WeaponData data;  // kéo thả asset vào Inspector

    public void Attack(IDamageable target)
    {
        target.TakeDamage(data.damage);
        AudioSource.PlayClipAtPoint(data.attackSound, transform.position);
    }

    public string GetInfo()
    {
        return $"{data.weaponName}: {data.damage} dmg, {data.attackSpeed} spd";
    }
}
```

### Tại sao dùng ScriptableObject?

- **1 data asset, nhiều objects dùng chung** — 50 goblins dùng cùng 1 GoblinData
- **Thay đổi không cần sửa code** — designer chỉnh stats trong Inspector
- **Không gắn vào scene** — dữ liệu tồn tại độc lập
- **Tiết kiệm bộ nhớ** — reference chung thay vì copy mỗi instance

### Ví dụ: Enemy Database

```csharp
[CreateAssetMenu(menuName = "Game/Enemy Data")]
public class EnemyData : ScriptableObject
{
    public string enemyName;
    public int maxHealth;
    public int damage;
    public float moveSpeed;
    public int expReward;
    public GameObject prefab;
}

// Spawner dùng danh sách EnemyData
public class WaveSpawner : MonoBehaviour
{
    [SerializeField] private EnemyData[] waveEnemies;

    public void SpawnWave()
    {
        foreach (EnemyData data in waveEnemies)
        {
            GameObject enemy = Instantiate(data.prefab, GetRandomPosition(), Quaternion.identity);
            enemy.GetComponent<EnemyController>().Initialize(data);
        }
    }
}
```

## Kết Hợp: Mini Game Architecture

![Game Architecture](/images/posts/diagrams/game-architecture.svg)

```
Managers/
├── GameManager (Singleton) — game state, score, flow
├── AudioManager (Singleton) — SFX, music
├── UIManager (Singleton) — HUD updates
│
Events/
├── GameEvents (static) — OnScoreChanged, OnEnemyKilled, OnGameOver
│
Data/
├── WeaponData (ScriptableObject) — stats cho từng weapon
├── EnemyData (ScriptableObject) — stats cho từng enemy type
│
Pools/
├── BulletPool (ObjectPool) — tái sử dụng đạn
├── VFXPool (ObjectPool) — tái sử dụng particle effects
│
Gameplay/
├── PlayerController — movement, input
├── PlayerHealth — HP, events OnDeath/OnHealthChanged
├── EnemyAI — patrol, chase, attack
├── Weapon — dùng WeaponData, fire bullets từ pool
```

Flow: Player bắn → Weapon lấy bullet từ Pool → Bullet hit Enemy → Enemy fire `GameEvents.EnemyKilled` → UI cập nhật score, Audio phát sound, Spawner spawn thêm. **Không ai phụ thuộc trực tiếp vào ai.**

## Bài Tập

**Bài 1: Audio Singleton**
Tạo AudioManager (Singleton) với methods: `PlaySFX(AudioClip)`, `PlayMusic(AudioClip)`, `SetVolume(float)`. Persist qua scenes. Gọi từ PlayerController và UI buttons.

**Bài 2: Event-Driven Game**
Tạo mini game: player di chuyển, nhặt coins (trigger). Dùng events: `OnCoinCollected(int value)` → UI cập nhật score, Audio phát sound, SpawnManager spawn coin mới ở vị trí random.

**Bài 3: Bullet Hell với Object Pool**
Tạo boss bắn 3 pattern đạn (thẳng, xoay, spread). Tất cả đạn dùng chung ObjectPool. Đạn bay ra, hit player hoặc hết lifetime → trả về pool. Target: 200+ đạn cùng lúc không giật.

---

**Bài trước:** [Unity #4: UI](/lab/unity-04-ui)

Chúc mừng bạn đã hoàn thành cả 2 series! Từ C# zero đến Unity design patterns — bạn đã có đủ nền tảng để bắt đầu xây dựng game thực tế. Tiếp theo, hãy bắt tay vào làm game đầu tiên của riêng bạn!
