---
title: "Shmup #8: Vòng đời một ván — điểm, máu, Game Over và Restart"
date: "2026-09-21"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-08-hud-game-loop
series: "shmup"
order: 8
excerpt: "Bắt đầu từ trạng thái ván chơi, phân vai Health–GameSession–HUD, rồi nối event và nút chơi lại mà không mất reference."
coverImage: "/images/posts/unity-shmup/08/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-state"><strong>Playing → Game Over → Restart → Playing</strong><p>Playing: nhận input, sinh địch, cộng điểm.<br/>Game Over: khóa điều khiển, khóa collider tàu, dừng spawner, hiện kết quả.<br/>Restart: tải lại scene, tạo một ván mới.</p></div>

## Đặt luật kết thúc trước khi vẽ HUD

Game đang chạy vô tận: địch xuống liên tục, tàu hết máu rồi vẫn bay tiếp. Bài này cho ván chơi một điểm bắt đầu và một điểm kết thúc. Quyết định đầu tiên là Game Over không phải pause, nên ta không đụng tới `timeScale`.

Lưu scene thành `SEU_08_HUD`. Ván mới bắt đầu ở 0 điểm và 3 HP. Khi tàu về 0 HP, nó vẫn hiện trên màn hình nhưng không điều khiển được, không nhận va chạm, và không có địch mới nào sinh ra. Đạn với địch đang tồn tại vẫn bay nốt, còn điểm thì chốt lại.

Vì sao không đặt `Time.timeScale = 0`: cách đó đóng băng toàn bộ, kể cả nền sao và hiệu ứng, làm màn hình chết cứng ngay khoảnh khắc người chơi cần nhìn kết quả. Ta chỉ tắt đúng những thứ tạo ra thay đổi trạng thái, còn phần trang trí vẫn sống.

## Ai giữ trạng thái, ai chỉ hiển thị

| Thành phần | Dữ liệu sở hữu | Đầu ra |
|---|---|---|
| Health | Current, Max, IsDead | Changed, Damaged, Died |
| Enemy | Data của instance | Killed với chính Enemy vừa chết |
| GameSession | Score, IsOver | ScoreChanged, GameOver |
| HudView | Reference tới các widget | Text và panel |
| RestartButton | Một thao tác UI | Gọi GameSession.Restart |

<div class="lesson-flow"><span>Enemy.Health.Died</span><span>Enemy.Killed</span><span>GameSession.Score</span><span>HudView</span></div>

Chuỗi này chỉ đi một chiều, và đó là điểm chính. `Health` không biết điểm số tồn tại. `GameSession` không biết có màn hình nào đang hiển thị. `HudView` chỉ nghe và vẽ, không quyết định gì. Muốn bỏ HUD đi thì ván chơi vẫn chạy đúng luật.

Event `Killed` truyền theo cả object `Enemy` chứ không chỉ số điểm. Nhờ vậy bên nghe lấy được cả `Data` lẫn vị trí con vừa chết, và bài 9 với bài 10 dùng đúng event này mà không phải đổi chữ ký. Event được phát **trước** khi enemy được trả về pool, nên vị trí đọc ra vẫn là chỗ nó chết chứ không phải chỗ nào khác.

Thay `Enemy` bằng file đầy đủ trong gói bài 8. Nó đăng ký vào `Health.Died`, chuyển tiếp thành một event static tên `Killed`, và huỷ đăng ký khi bị destroy. Static để một session nghe được mọi enemy mà không cần đi tìm từng con; đổi lại mọi listener bắt buộc phải gỡ đăng ký, nếu không nó giữ luôn object của scene cũ sau khi restart.

## GameSession trước, UI sau

**Assets/_ShootEmUp/Scripts/Core/GameSession.cs**

```csharp
using System;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using ShootEmUp.Enemies;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ShootEmUp.Core
{
    public sealed class GameSession : MonoBehaviour
    {
        [Tooltip("The ship. Its Health decides when the run ends.")]
        [SerializeField] private Health player;

        [Tooltip("Objects switched off on game over (spawner, player controls).")]
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

        public void Restart()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }

        private void OnEnemyKilled(Enemy enemy)
        {
            if (IsOver) return;
            Score += enemy.Data.scoreValue;
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
}
```

`IsOver` xuất hiện ở cả hai handler và làm hai việc: chặn chốt ván hai lần nếu có hai nguồn cùng báo tàu chết, và chặn cộng điểm sau khi ván đã kết thúc. Không có nó, những viên đạn còn bay sau lúc chết vẫn ghi điểm vào bảng đã chốt.

`disableOnGameOver` khai báo kiểu `Behaviour[]` chứ không phải `GameObject[]`, và khác biệt này là cố ý. Tắt một `Behaviour` chỉ tắt component đó, nên tàu vẫn hiện trên màn hình trong khi mất khả năng điều khiển. Tắt cả GameObject thì tàu biến mất và màn hình Game Over trông như người chơi chưa từng tồn tại.

Tạo Empty tên **GameSession**, thêm script, rồi nối:

![GameSession trước khi nối reference](/images/posts/unity-shmup/08/hud_03_gamesession-before-wire.webp)

| Field | Reference |
|---|---|
| Player | Health của Player |
| Disable On Game Over [0] | PlayerMovement |
| [1] | PlayerShooting |
| [2] | WaveSpawner |
| [3] | PolygonCollider2D của Player |

![GameSession sau khi nối đủ bốn phần tử](/images/posts/unity-shmup/08/hud_05_gamesession-after-wire.webp)

Phần tử thứ tư là collider của tàu, và nó có mặt trong danh sách vì lý do cụ thể: tàu chết rồi mà collider còn bật thì địch tiếp tục đâm vào và `Health` tiếp tục bắn event. Tàu có nhiều collider con thì đưa hết vào danh sách.

Kiểm tra lại `Health` của Player vẫn đang **Remove On Death = false** như đã đặt ở bài 5. Nếu nó bị xoá lúc chết thì mọi reference trỏ tới nó thành Missing.

## Dựng HUD

Đây là thứ cần dựng:

![HUD với điểm ở góc trái và máu ở góc phải](/images/posts/unity-shmup/08/hud_08_game-view-hud.webp)

Tạo GameObject → UI → Canvas và đặt tên `HUD`. Render Mode để **Screen Space Overlay**. Canvas Scaler chọn **Scale With Screen Size**, Reference Resolution **1080 × 1920**, Match 0.5. Lần đầu tạo TMP Text, Unity sẽ hỏi import TMP Essentials, đồng ý.

EventSystem phải dùng **InputSystemUIInputModule**. Nếu Unity tạo sẵn `StandaloneInputModule`, Inspector sẽ hiện nút Replace, bấm vào đó. Module này tự mang theo bộ action UI mặc định cho click và điều hướng, nên bài này không cần thêm map UI nào vào `ShmupControls`.

Cây object cần dựng:

![Cây Canvas HUD trong Hierarchy](/images/posts/unity-shmup/08/hud_01_hierarchy.webp)

| Object | Anchor / Pivot | Pos / Size | Text |
|---|---|---|---|
| ScoreText | (0,1) / (0,1) | (40,−40) / (600,70) | 48, căn trái |
| HealthText | (1,1) / (1,1) | (−40,−40) / (400,70) | 48, căn phải |
| GameOverPanel | stretch hai chiều | offset bốn cạnh = 0 | Image đen alpha 0.75 |
| Title, con panel | giữa / giữa | (0,200) / (900,160) | GAME OVER, 120 |
| FinalScoreText | giữa / giữa | (0,40) / (900,80) | 56 |
| RestartButton | giữa / giữa | (0,−160) / (480,130) | con TMP Label, RESTART |

Anchor và Pivot nghe giống nhau nhưng là hai thứ khác hẳn. Anchor là điểm mà widget bám vào trên object cha. Pivot là điểm neo của chính widget, cũng là tâm khi nó xoay hay co giãn. `ScoreText` có cả hai ở góc trên bên trái, nên khi khung hình đổi tỉ lệ nó vẫn dính chặt vào góc đó thay vì trôi vào giữa.

Tạo `GameOverPanel` rồi **tắt nó đi** ngay từ đầu, vì nó chỉ hiện sau khi chết. Tắt panel thôi, đừng tắt cả Canvas HUD.

![GameOverPanel với ba object con](/images/posts/unity-shmup/08/hud_06_gameoverpanel.webp)

## Nối HudView

`ShootEmUp.asmdef` cần thêm reference **Unity.TextMeshPro** và **UnityEngine.UI** bên cạnh Input System với Common. Gói bài 8 đã có sẵn cấu hình này.

**Assets/_ShootEmUp/Scripts/UI/HudView.cs**

```csharp
using ShootEmUp.Combat;
using ShootEmUp.Core;
using TMPro;
using UnityEngine;

namespace ShootEmUp.UI
{
    public sealed class HudView : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private GameSession session;
        [SerializeField] private Health playerHealth;

        [Header("Widgets")]
        [SerializeField] private TMP_Text scoreText;
        [SerializeField] private TMP_Text healthText;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private TMP_Text finalScoreText;

        private void OnEnable()
        {
            session.ScoreChanged += OnScoreChanged;
            session.GameOver += OnGameOver;
            playerHealth.Changed += OnHealthChanged;

            OnScoreChanged(session.Score);
            OnHealthChanged(playerHealth);
            gameOverPanel.SetActive(session.IsOver);
            if (session.IsOver) OnGameOver();
        }

        private void Start()
        {
            OnScoreChanged(session.Score);
            OnHealthChanged(playerHealth);
        }

        private void OnDisable()
        {
            session.ScoreChanged -= OnScoreChanged;
            session.GameOver -= OnGameOver;
            playerHealth.Changed -= OnHealthChanged;
        }
        public void OnRestartClicked()
        {
            session.Restart();
        }

        private void OnScoreChanged(int score)
        {
            scoreText.text = $"SCORE {score:000000}";
        }

        private void OnHealthChanged(Health health)
        {
            healthText.text = $"HP {new string('|', health.Current)}{new string('.', health.Max - health.Current)}";
        }

        private void OnGameOver()
        {
            finalScoreText.text = $"FINAL SCORE {session.Score}";
            gameOverPanel.SetActive(true);
        }
    }
}
```

Điểm đáng chú ý là `HudView` vừa đăng ký event vừa đọc thẳng trạng thái hiện tại ngay trong `OnEnable`, rồi đọc lại lần nữa trong `Start`. Nghe như thừa, nhưng event chỉ báo *thay đổi*, nên một HUD chỉ nghe event sẽ trống trơn cho tới lần thay đổi đầu tiên. Người chơi vào ván mới phải thấy ngay 0 điểm và ba vạch máu, chứ không phải đợi tới lúc bị đánh.

Gắn `HudView` lên object `HUD`. Sáu ô reference đang trống:

![HudView trước khi nối sáu reference](/images/posts/unity-shmup/08/hud_02_hudview-before-wire.webp)

Nối Session và Player Health từ Hierarchy, bốn widget còn lại kéo từ chính cây HUD:

![HudView sau khi nối đủ](/images/posts/unity-shmup/08/hud_04_hudview-after-wire.webp)

Cuối cùng là nút Restart. Chọn `RestartButton`, tìm mục **On Click ()** trong component Button, bấm `+`, kéo object `HUD` vào ô object, rồi mở dropdown chọn **HudView → OnRestartClicked**.

![On Click của RestartButton trỏ tới HudView.OnRestartClicked](/images/posts/unity-shmup/08/hud_07_restart-button-onclick.webp)

Bước này là chỗ sai phổ biến nhất khi dựng UI, vì sai thì không có thông báo lỗi nào cả: nút bấm xuống, nảy lên, và không xảy ra chuyện gì. Hai lỗi hay gặp là để trống ô object, và chọn nhầm hàm ở nhóm Dynamic thay vì hàm `OnRestartClicked` trong nhóm dưới.

Mở **File → Build Profiles → Scene List** và thêm scene `SEU_08_HUD` đang mở vào danh sách. `Restart` tải lại scene theo build index, nên scene chưa đăng ký thì lệnh đó ném lỗi ngay.

## Chạy trọn ba trạng thái

Ván mới phải hiện `SCORE 000000` và đủ ba vạch máu ngay trước hit đầu tiên.

Giết một con InsectBasic được 10 điểm. Để một con bay khỏi đáy màn hình thì được 0 điểm, vì nó đi qua `Release` chứ không qua `TakeDamage` như đã tách ở bài 5.

![Điểm tăng dần trong lúc chơi](/images/posts/unity-shmup/08/hud_10_score-to-gameover.webp)

Nhận đủ ba hit: panel hiện lên, phím không điều khiển được nữa, địch đâm vào tàu không ăn thua vì collider đã tắt, và spawner ngừng sinh con mới.

![Màn hình Game Over với điểm cuối](/images/posts/unity-shmup/08/hud_09_game-over.webp)

Tàu vẫn nằm đó chứ không biến mất:

![Tàu còn nguyên trong Hierarchy sau khi chết](/images/posts/unity-shmup/08/hud_11_player-health-keep.webp)

Bấm Restart ba lần liên tiếp và chơi trọn ba ván. Điểm phải về 0 mỗi lần, máu đầy lại, và mỗi con bị giết chỉ cộng điểm đúng một lần. Nếu điểm nhân đôi sau khi restart thì có listener chưa gỡ đăng ký, xem lại `OnDisable`. Nếu reference tới tàu thành Missing thì kiểm tra Remove On Death.

Vòng đời một ván đã kín. Bài sau thêm thứ rơi ra khi địch chết.

## Mã nguồn chặng này

[Tải script bài 8](/downloads/shmup/lesson-08.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #9](/lab/unity-shmup-09-pickups-shield).
