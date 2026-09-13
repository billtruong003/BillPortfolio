---
title: "Shmup #8: HUD và vòng đời ván chơi — uGUI, event C#, Game Over, Restart"
date: "2026-09-21"
lang: "vi"
series: "shmup"
order: 8
excerpt: "Canvas Scaler cho mọi màn hình, TextMeshPro, EventSystem với Input System, GameSession gom điểm và game over, HUD chỉ lắng nghe event, nút Restart tải lại scene."
coverImage: "/images/posts/unity-shmup/08/cover.webp"
category: "unity-dev"
tags: ["Unity", "UI", "uGUI", "TextMeshPro", "Events", "Game Loop", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- Canvas Screen Space Overlay + **Canvas Scaler** (Scale With Screen Size 1080×1920)
- TextMeshPro, RectTransform anchor/pivot
- **EventSystem** với `InputSystemUIInputModule` (không phải Standalone Input Module cũ)
- Kiến trúc event: `Health.Changed`, `Enemy.Killed` (static), `GameSession.ScoreChanged / GameOver`; HUD chỉ **lắng nghe**
- `Button.onClick` gắn hàm public qua Inspector
- `SceneManager.LoadScene` để chơi lại; scene phải nằm trong **Build Settings**

Xong bài này: điểm số tăng khi giết địch, HP `|||` góc phải, hết máu hiện GAME OVER + điểm + nút RESTART.

![Điểm tăng tới Game Over](/images/posts/unity-shmup/08/hud_10_score-to-gameover.webp)

## 1. TMP Essentials và Build Settings

Lần đầu tạo TextMeshPro, Unity hỏi *Import TMP Essentials* → Import. Nó tạo `Assets/TextMesh Pro`; kéo vào `Assets/ThirdParty/` cho đúng quy ước (TMP tìm resource qua `Resources/`, nằm đâu cũng được).

**File → Build Profiles → Scene List → Add Open Scenes** với các scene bài học. `SceneManager.LoadScene` chỉ tải được scene có trong list; quên bước này: `Scene with build index -1 couldn't be loaded`.

## 2. Canvas + EventSystem

GameObject → UI → Canvas → tên `HUD`. Canvas Scaler: UI Scale Mode **Scale With Screen Size**, Reference Resolution **1080 × 1920**, Match 0.5.

Unity tự tạo `EventSystem`. Project dùng Input System nên component cũ hiện nút **Replace with InputSystemUIInputModule** → bấm. Không thì nút không nhận click.

## 3. Text và panel

| Object | Anchor/Pivot | Pos | Size | Font |
|--------|-------------|-----|------|------|
| `ScoreText` | (0,1) trên trái | (40, −40) | 600×70 | 48, Left |
| `HealthText` | (1,1) trên phải | (−40, −40) | 400×70 | 48, Right |
| `GameOverPanel` (Image đen 75%) | stretch 4 cạnh | | | |
| ├ `Title` "GAME OVER" | (0.5,0.5) | (0, 200) | 900×160 | 120 |
| ├ `FinalScoreText` | (0.5,0.5) | (0, 40) | 900×80 | 56 |
| └ `RestartButton` (Image cam + Button) → `Label` "RESTART" | (0.5,0.5) | (0, −160) | 480×130 | 56 |

Anchor = điểm trên cha mà object bám vào; pivot = điểm trên chính nó. Trên-trái bám trên-trái thì đổi tỉ lệ màn hình chữ vẫn ở góc. Panel stretch (0,0)-(1,1) → phủ kín.

![GameOverPanel stretch](/images/posts/unity-shmup/08/hud_06_gameoverpanel.webp)

Tắt `GameOverPanel` (checkbox cạnh tên). `HudView` bật khi cần.

![Hierarchy](/images/posts/unity-shmup/08/hud_01_hierarchy.webp)

## 4. Event từ gameplay

`Health` thêm `event Action<Health> Changed` (bắn mỗi khi máu đổi) và cờ `removeOnDeath` (xem mục Lỗi). `Enemy` thêm static event:

```csharp
public static event Action<EnemyData> Killed;

private void Awake()
{
    // ...
    health.Died += OnDied;
}

private void OnDestroy() => health.Died -= OnDied;
private void OnDied(Health _) => Killed?.Invoke(data);
```

`Enemy.Killed` là **static** vì enemy pooled sinh/mất liên tục, GameSession không thể subscribe từng con. Static = "bất kỳ con nào chết thì báo". Cái giá: phải nhớ unsubscribe (`OnDisable`), nếu không object cũ vẫn bị gọi sau khi scene reload → `MissingReferenceException`.

## 5. GameSession

`Scripts/Core/GameSession.cs`:

```csharp
public sealed class GameSession : MonoBehaviour
{
    [SerializeField] private Health player;
    [SerializeField] private Behaviour[] disableOnGameOver;

    public int Score { get; private set; }
    public bool IsOver { get; private set; }

    public event Action<int> ScoreChanged;
    public event Action GameOver;

    private void OnEnable()
    {
        Enemy.Killed += OnEnemyKilled;
        player.Died += OnPlayerDied;
    }

    private void OnDisable()
    {
        Enemy.Killed -= OnEnemyKilled;
        player.Died -= OnPlayerDied;
    }

    public void Restart() => SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);

    private void OnEnemyKilled(EnemyData data)
    {
        if (IsOver) return;
        Score += data.scoreValue;
        ScoreChanged?.Invoke(Score);
    }

    private void OnPlayerDied(Health _)
    {
        if (IsOver) return;
        IsOver = true;
        foreach (var b in disableOnGameOver) b.enabled = false;
        GameOver?.Invoke();
    }
}
```

Tắt `Behaviour` (component) thay vì tắt GameObject: tàu vẫn hiện, chỉ mất điều khiển. `WaveSpawner.OnDisable` dừng coroutine → không spawn thêm. `Time.timeScale = 0` cũng được nhưng đóng băng cả animation UI, để dành cho pause.

Empty `GameSession` → component: Player ← Health của `Player`; Disable On Game Over (size 3) ← `PlayerMovement`, `PlayerShooting`, `WaveSpawner`. Kéo *component* (không phải GameObject): ô kiểu `Behaviour`, kéo object vào Unity sẽ hỏi chọn component nào.

![GameSession sau khi gắn](/images/posts/unity-shmup/08/hud_05_gamesession-after-wire.webp)

## 6. HudView

`Scripts/UI/HudView.cs` — pure listener:

```csharp
public sealed class HudView : MonoBehaviour
{
    [SerializeField] private GameSession session;
    [SerializeField] private Health playerHealth;
    [SerializeField] private TMP_Text scoreText;
    [SerializeField] private TMP_Text healthText;
    [SerializeField] private GameObject gameOverPanel;
    [SerializeField] private TMP_Text finalScoreText;

    private void OnEnable()
    {
        session.ScoreChanged += OnScoreChanged;
        session.GameOver += OnGameOver;
        playerHealth.Changed += OnHealthChanged;

        OnScoreChanged(session.Score);      // đồng bộ trạng thái ban đầu
        OnHealthChanged(playerHealth);
        gameOverPanel.SetActive(false);
    }

    private void OnDisable()
    {
        session.ScoreChanged -= OnScoreChanged;
        session.GameOver -= OnGameOver;
        playerHealth.Changed -= OnHealthChanged;
    }

    public void OnRestartClicked() => session.Restart();   // gắn vào Button OnClick

    private void OnScoreChanged(int score) => scoreText.text = $"SCORE {score:000000}";

    private void OnHealthChanged(Health h)
        => healthText.text = $"HP {new string('|', h.Current)}{new string('.', h.Max - h.Current)}";

    private void OnGameOver()
    {
        finalScoreText.text = $"FINAL SCORE {session.Score}";
        gameOverPanel.SetActive(true);
    }
}
```

`OnEnable` gọi ngay `OnScoreChanged(session.Score)`: thứ tự OnEnable giữa các script không đảm bảo, nên HUD tự kéo dữ liệu thay vì tin rằng event đã bắn.

Canvas `HUD` → Add Component `HudView`, 6 ô kéo từ Hierarchy:

![Trước](/images/posts/unity-shmup/08/hud_02_hudview-before-wire.webp)
![Sau](/images/posts/unity-shmup/08/hud_04_hudview-after-wire.webp)

## 7. Nút Restart

`RestartButton` → Button → On Click () → **+** → kéo object `HUD` vào ô, dropdown chọn `HudView → OnRestartClicked()`. Chỉ hàm `public void` không tham số (hoặc 1 tham số cơ bản) mới hiện trong dropdown.

![Button OnClick](/images/posts/unity-shmup/08/hud_07_restart-button-onclick.webp)

## 8. Luồng sự kiện

```
Enemy.Health.Died ─► Enemy.Killed [static] ─► GameSession.Score += ─► ScoreChanged ─► HudView
Player.Health.Changed ────────────────────────────────────────────────────────────► HudView
Player.Health.Died ─► GameSession: disable [Movement, Shooting, Spawner] ─► GameOver ─► HudView
RestartButton.onClick ─► HudView.OnRestartClicked ─► GameSession.Restart ─► LoadScene
```

Mũi tên chỉ đi **từ gameplay ra UI**. `Health` không biết `HudView` tồn tại. Đổi HUD sang UI Toolkit sau này không đụng gameplay.

![Game Over](/images/posts/unity-shmup/08/hud_09_game-over.webp)

## Lỗi mình gặp

| Lỗi | Nguyên nhân | Sửa |
|-----|-------------|-----|
| `NullReferenceException` sau Game Over | `Health.TakeDamage` về 0 → tàu không có `PooledObject` → `Destroy(gameObject)`: **tàu bị xoá** như kẻ địch. HUD giữ tham chiếu tới Health đã chết | Thêm `[SerializeField] bool removeOnDeath = true` vào `Health`, Player đặt **false**. Bài học: một component dùng cho nhiều loại object phải để lộ hành vi khác nhau qua field |
| Bấm Restart không tải lại | Scene chưa trong Build Settings | Add Open Scenes |

## Bài sau

[Shmup #9](/lab/unity-shmup-09-pickups-shield): rớt đồ theo tỉ lệ, khiên và bắn nhanh có thời gian.
