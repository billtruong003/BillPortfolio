---
title: "Platformer #15: Nhiều màn, chọn nhân vật, HUD và build lên web"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 15
excerpt: "Biến căn phòng lab thành thứ người lạ mở lên chơi được: ba màn nối nhau trong một asset, tiến trình lưu trong PlayerPrefs, màn chọn nhân vật dùng lại ScriptableObject của bài 7, HUD đếm ngọc và thanh máu boss giữ nguyên góc pixel. Rồi build WebGL, với một danh sách sáu dòng mà dòng nào cũng từng làm mình mất thời gian."
coverImage: "/images/posts/unity-platformer/15/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "UI", "WebGL", "PlayerPrefs", "Tutorial"]
published: true
featured: false
---

Tới bài 14, mình có một căn phòng chơi được, một phòng boss, ba nhân vật, và mọi thứ chạy trong Editor. Nhưng chưa ai ngoài mình mở lên được. Bài này làm ba việc để biến nó thành một game: chia thành các màn nối tiếp nhau, lưu tiến trình, và build lên trình duyệt. Trên đường đi có thêm màn chọn nhân vật mà bài 7 đã hứa, và HUD cho người chơi biết mình đang ở đâu.

![Màn chọn màn: ba ô màn 1, 2, 3 với màn 2 và 3 có ổ khoá; bên dưới là ba nhân vật, nhân vật thứ hai được chọn, tên hiện ở dưới là Nhẹ; dưới cùng là nút Xoá tiến trình](/images/posts/unity-platformer/15/level-select.webp)

## Ba màn từ những scene đã có

Không cần dựng màn mới. Ba scene của các bài trước đã là ba màn với độ khó tăng dần:

| Màn | Từ | Có gì |
|---|---|---|
| 1 | Căn phòng sau bài 9 | Ngọc, thùng, bẫy, cờ, cửa thoát. Không địch |
| 2 | Căn phòng sau bài 11 | Thêm jumper, charger, cannon, flyer |
| 3 | `Room_Boss` của bài 12 và 13 | Thêm boss, rung và tiếng đầy đủ |

Lưu ba scene thành `Level1`, `Level2`, `Level3` (Ctrl+D trong cửa sổ Project rồi đổi tên), và thêm nền của bài 14 vào cả ba. Trong bản mình build, hai cột giữa phòng ở màn 1 và 2 được hạ xuống còn 4 ô như vách đấu trường: màn đầu tiên không nên đòi nhảy đôi lên đỉnh cột cao 21 ô mới tới được cửa.

Tạo thêm một scene `LevelSelect` cho màn chọn màn.

## LevelCatalog: thêm màn là sửa một asset

Cách dễ nghĩ ra nhất để nối các màn là viết thẳng vào code: màn 1 xong thì `LoadScene("Level2")`, màn chọn màn có ba nút gắn tay vào ba scene. Thêm màn thứ tư nghĩa là sửa script chuyển màn, sửa màn chọn màn, và nhớ sửa cả điều kiện mở khoá.

Cách đúng là đưa danh sách màn ra thành dữ liệu, như bảng wave của [Shmup #7](/lab/unity-shmup-07-waves-asteroids/). Tạo `Assets/_Platformer/Scripts/Core/LevelCatalog.cs`:

```csharp
using UnityEngine;

namespace Platformer.Core
{
    [CreateAssetMenu(menuName = "Platformer/Level Catalog", fileName = "LevelCatalog")]
    public sealed class LevelCatalog : ScriptableObject
    {
        [System.Serializable]
        public sealed class Entry
        {
            [Tooltip("Scene name exactly as it appears in Build Settings.")]
            public string sceneName;
            [Tooltip("Shown on the level-select button, 1..50 (the pack ships those as sprites).")]
            public int number = 1;
            [Tooltip("How many gems the room holds.")]
            public int gemCount = 5;
            [Tooltip("Playable without finishing the previous level.")]
            public bool alwaysUnlocked;
        }

        [SerializeField] private Entry[] levels = new Entry[0];

        [Tooltip("Playable characters (stage 07). The select screen lists them, every level applies the chosen one.")]
        [SerializeField] private Player.PlayerData[] characters = new Player.PlayerData[0];

        public int Count => levels.Length;
        public Entry this[int i] => levels[i];
        public int CharacterCount => characters.Length;
        public Player.PlayerData Character(int i) => characters[i];

        public int IndexOfScene(string sceneName)
        {
            for (int i = 0; i < levels.Length; i++)
                if (levels[i].sceneName == sceneName) return i;
            return -1;
        }
    }
}
```

Catalog giữ cả danh sách nhân vật: đó cũng là nội dung chơi được, và màn chọn màn cần cả hai. Tạo asset bằng **Create > Platformer > Level Catalog**, điền ba màn (màn 1 tick Always Unlocked) và kéo ba `PlayerData` của bài 7 vào Characters:

![Inspector của LevelCatalog: Levels có ba mục, mục đầu Scene Name PLT_14_Level1, Number 1, Gem Count 5, Always Unlocked bật; Characters có Player_Balanced, Player_Light, Player_Heavy](/images/posts/unity-platformer/15/catalog-inspector.webp)

Tên scene trong ảnh là tên trong project của mình. Của bạn là `Level1`, `Level2`, `Level3`.

## GameProgress: static, không phải singleton

Tiến trình cần sống qua các lần chuyển scene và cả khi tắt game. Tạo `Assets/_Platformer/Scripts/Core/GameProgress.cs`:

```csharp
using UnityEngine;

namespace Platformer.Core
{
    public static class GameProgress
    {
        private const string ClearedKey = "plt.cleared.";
        private const string GemsKey = "plt.gems.";
        private const string CharacterKey = "plt.character";

        public static bool IsCleared(int levelIndex) => PlayerPrefs.GetInt(ClearedKey + levelIndex, 0) == 1;

        public static int BestGems(int levelIndex) => PlayerPrefs.GetInt(GemsKey + levelIndex, 0);

        /// <summary>A level is open if it is the first, marked always-open, or the one before it is cleared.</summary>
        public static bool IsUnlocked(LevelCatalog catalog, int levelIndex)
        {
            if (catalog == null || levelIndex <= 0) return true;
            if (levelIndex >= catalog.Count) return false;
            if (catalog[levelIndex].alwaysUnlocked) return true;
            return IsCleared(levelIndex - 1);
        }

        public static void Clear(int levelIndex, int gems)
        {
            PlayerPrefs.SetInt(ClearedKey + levelIndex, 1);
            if (gems > BestGems(levelIndex)) PlayerPrefs.SetInt(GemsKey + levelIndex, gems);
            PlayerPrefs.Save();
        }

        /// <summary>Index into the catalog's character list, clamped so a shrunk list never breaks it.</summary>
        public static int SelectedCharacter(LevelCatalog catalog)
        {
            if (catalog == null || catalog.CharacterCount == 0) return 0;
            return Mathf.Clamp(PlayerPrefs.GetInt(CharacterKey, 0), 0, catalog.CharacterCount - 1);
        }

        public static void SelectCharacter(int index)
        {
            PlayerPrefs.SetInt(CharacterKey, index);
            PlayerPrefs.Save();
        }

        public static void ResetAll(int levelCount)
        {
            for (int i = 0; i < levelCount; i++)
            {
                PlayerPrefs.DeleteKey(ClearedKey + i);
                PlayerPrefs.DeleteKey(GemsKey + i);
            }
            PlayerPrefs.Save();
        }
    }
}
```

`PlayerPrefs` trên WebGL nằm trong IndexedDB của trình duyệt: tải lại trang vẫn còn, đổi trình duyệt thì mất. Với một game ngắn, vậy là đủ.

Hay gặp nhất là làm thứ này thành một singleton MonoBehaviour có `DontDestroyOnLoad`. Mình cố ý không làm vậy. Nó không có trạng thái nào cần nằm trong scene: mọi thứ đã ở trong `PlayerPrefs`. Một singleton chỉ thêm đúng một vấn đề: ai khởi tạo trước ai. Và như mục "Thứ tự khởi tạo" bên dưới sẽ cho thấy, đó chính là thứ đã cắn mình nhiều lần nhất trong series.

## LevelRunner: nghe, không thò tay vào

Mỗi scene chơi được có một `LevelRunner`. Nó biết mình là màn nào, ghi tiến trình khi xong màn, áp nhân vật đã chọn, và giữ ba nút người chơi cần lúc đó. Tạo `Assets/_Platformer/Scripts/Core/LevelRunner.cs`:

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Platformer.Core
{
    public sealed class LevelRunner : MonoBehaviour
    {
        [SerializeField] private LevelCatalog catalog;
        [SerializeField] private Level.RoomState room;
        [Tooltip("Optional. When set, the room only counts as finished once the boss is down too.")]
        [SerializeField] private Enemies.BossBrute boss;
        [SerializeField] private string levelSelectScene = "LevelSelect";

        [Header("Panel shown when the room is finished")]
        [SerializeField] private GameObject clearPanel;

        public int LevelIndex { get; private set; } = -1;
        public bool Finished { get; private set; }
        public bool BossDown { get; private set; }

        private void Awake()
        {
            if (room == null) room = FindFirstObjectByType<Level.RoomState>();
            if (boss == null) boss = FindFirstObjectByType<Enemies.BossBrute>();
            if (clearPanel != null) clearPanel.SetActive(false);
        }

        private void OnEnable()
        {
            if (room != null) room.RoomCompleted += OnRoomCompleted;
            if (boss != null) boss.Defeated += OnBossDefeated;
        }

        private void OnDisable()
        {
            if (room != null) room.RoomCompleted -= OnRoomCompleted;
            if (boss != null) boss.Defeated -= OnBossDefeated;
        }

        private void Start()
        {
            // Resolve which level this is from the scene name, so the scene does not have
            // to carry an index that can drift out of sync with the catalog.
            if (catalog != null) LevelIndex = catalog.IndexOfScene(SceneManager.GetActiveScene().name);
            ApplyCharacter();
        }

        /// <summary>
        /// Swap in the character picked on the select screen. In Start, not Awake: the motor
        /// applies its own default data in OnEnable, and Start runs after every OnEnable.
        /// </summary>
        private void ApplyCharacter()
        {
            if (catalog == null || catalog.CharacterCount == 0) return;
            var motor = FindFirstObjectByType<Player.PlayerMotor>();
            if (motor == null) return;
            motor.Apply(catalog.Character(GameProgress.SelectedCharacter(catalog)));
            var anim = motor.GetComponent<Player.PlayerAnimator>();
            if (anim != null) anim.ApplyData();
        }

        private void OnBossDefeated()
        {
            BossDown = true;
            TryFinish();
        }

        private void OnRoomCompleted() => TryFinish();

        private void TryFinish()
        {
            if (Finished) return;
            if (room == null || !room.Completed) return;
            if (boss != null && !BossDown) return;   // exit reached but the boss is still up

            Finished = true;
            if (LevelIndex >= 0) GameProgress.Clear(LevelIndex, room.GemsCollected);
            if (clearPanel != null) clearPanel.SetActive(true);
        }

        // ---- wired to buttons ----
        public void Restart() => SceneManager.LoadScene(SceneManager.GetActiveScene().name);

        public void BackToSelect() => SceneManager.LoadScene(levelSelectScene);

        public void NextLevel()
        {
            if (catalog == null || LevelIndex < 0 || LevelIndex + 1 >= catalog.Count) { BackToSelect(); return; }
            SceneManager.LoadScene(catalog[LevelIndex + 1].sceneName);
        }
    }
}
```

Mọi thứ `LevelRunner` phản ứng đều đã có sẵn: `RoomState.RoomCompleted` từ bài 9, `BossBrute.Defeated` từ bài 12. Cùng quy tắc với `GameFeel` ở bài 13: nghe sự kiện, không thò tay vào code gameplay. Ở màn có boss, vào cửa thoát khi boss còn sống thì chưa tính là xong.

**Chọn nhân vật** là hai dòng bài 7 đã chuẩn bị: `motor.Apply(data)` đổi toàn bộ số cảm giác, `animator.ApplyData()` đổi controller animation. Chỗ đáng chú ý là nó nằm trong `Start`. `PlayerMotor.OnEnable` tự áp `PlayerData` mặc định của prefab. Nếu `LevelRunner` áp nhân vật trong `Awake`, và `Awake` của nó chạy trước `OnEnable` của motor, motor sẽ ghi đè lại bằng bộ mặc định. `Start` chạy sau mọi `OnEnable` trong scene nên không bao giờ bị ghi đè.

`LevelIndex` suy ra từ tên scene chứ không gõ vào Inspector, để scene không mang một con số có thể lệch khỏi catalog.

Thêm một GameObject `LevelRunner` vào mỗi scene màn chơi, kéo `LevelCatalog` vào ô Catalog, `Room` vào Room, và bảng qua màn (dựng ở mục HUD) vào Clear Panel.

## HUD

### Canvas theo đúng khung pixel

Tạo Canvas `HUD`, Render Mode `Screen Space - Overlay`. **Canvas Scaler**:

- UI Scale Mode `Scale With Screen Size`, Reference Resolution `512 × 288`: đúng khung camera của bài 0.
- Screen Match Mode `Match Width Or Height`, Match `1`: khoá theo chiều cao, giống camera.
- Reference Pixels Per Unit `16`: bằng PPU của toàn bộ art, để một sprite UI 16 pixel to đúng bằng một ô tilemap.

Bộ art có sẵn thư mục `GUI` với nút, khung và icon. Các khung vẽ kiểu 9-slice: sprite 17 × 17 pixel, chừa viền 6 pixel mỗi phía. Mở Sprite Editor, đặt Border `6, 6, 6, 6` cho các sprite khung, rồi dùng `Image` với Image Type `Sliced` là khung kéo dài bao nhiêu cũng giữ nguyên góc.

### Đếm ngọc

Tạo `Assets/_Platformer/Scripts/UI/HudGems.cs`:

```csharp
using TMPro;
using UnityEngine;

namespace Platformer.UI
{
    public sealed class HudGems : MonoBehaviour
    {
        [SerializeField] private Level.RoomState room;
        [SerializeField] private TMP_Text label;
        [SerializeField] private string format = "{0}/{1}";

        public string LastText { get; private set; } = "";

        private void Awake()
        {
            if (room == null) room = FindFirstObjectByType<Level.RoomState>();
            if (label == null) label = GetComponentInChildren<TMP_Text>();
        }

        private void OnEnable()
        {
            if (room != null) room.GemChanged += Refresh;
        }

        private void OnDisable()
        {
            if (room != null) room.GemChanged -= Refresh;
        }

        private void Start()
        {
            if (room != null) Refresh(room.GemsCollected, room.GemsTotal);
        }

        private void Refresh(int collected, int total)
        {
            LastText = string.Format(format, collected, total);
            if (label != null) label.text = LastText;
        }
    }
}
```

Giờ đã có HUD, xoá `RoomLog` tạm của bài 9 khỏi `Room`. Trong `HUD`, tạo `GemPlate` neo góc trên trái: một `Image` Sliced (khung `Button_05`), bên trong có icon ngọc 16 × 16 và một `TextMeshPro - Text`. Thêm **Hud Gems** vào `HUD`, kéo text vào Label.

![Góc trên trái màn chơi: khung xám nhạt với icon ngôi sao và chữ 4/5](/images/posts/unity-platformer/15/hud-gems.webp)

`HudGems` chỉ đọc `RoomState`, không chạm vào viên ngọc nào. Bản đầu của mình đọc tổng số ngọc một lần trong `Start` và đứng ở "0/0" suốt màn: các viên ngọc tự đăng ký trong `Start` của chúng, và không gì đảm bảo `Start` của HUD chạy sau. Đó là lý do `RoomState.Register` ở bài 9 phát luôn `GemChanged`: tổng thay đổi cũng là một thay đổi, và HUD đang nghe thì sẽ nhận được.

### Thanh máu boss

Bản đầu của mình dùng `Image` với Image Type `Filled` và chỉnh `fillAmount` theo máu. Đó là cách hay gặp nhất, và nó phá hỏng khung pixel:

![Hai thanh máu phóng to cùng ở mức 2/3: trên là Image Filled với fillAmount 0.67, đầu trái thành một khối tối kéo giãn và cả thanh mất viền; dưới là Slider với Image Sliced, góc 6 pixel giữ nguyên cả hai đầu](/images/posts/unity-platformer/15/boss-bar-filled-vs-sliced.webp)

`Filled` không đọc viền 9-slice của sprite. Nó kéo giãn cả texture 17 × 17 ra theo chiều dài thanh rồi cắt bớt theo `fillAmount`, nên góc và viền tối biến thành những vệt méo. `Sliced` và `Filled` là hai giá trị của cùng một ô Image Type: chọn cái này là mất cái kia.

Cách đúng là dùng `Slider`. Slider không cắt hình, nó đổi chiều rộng của `Fill`, và một `Image` Sliced thì cắt lại viền ở bất kỳ chiều rộng nào: bốn góc giữ nguyên 6 pixel, chỉ phần giữa kéo dài.

Tạo `Assets/_Platformer/Scripts/UI/BossHealthBar.cs`:

```csharp
using UnityEngine;
using UnityEngine.UI;

namespace Platformer.UI
{
    public sealed class BossHealthBar : MonoBehaviour
    {
        [SerializeField] private Enemies.BossBrute boss;
        [Tooltip("Slider driving the bar. Interactable is forced off: this is a readout, not a control.")]
        [SerializeField] private Slider slider;
        [Tooltip("The part that is shown and hidden. A CHILD object, never this one.")]
        [SerializeField] private GameObject root;
        [SerializeField, Min(0f)] private float drainTime = 0.25f;

        public float Shown { get; private set; } = 1f;

        private float target = 1f;
        private float vel;

        private void Awake()
        {
            if (boss == null) boss = FindFirstObjectByType<Enemies.BossBrute>();
            if (slider == null) slider = GetComponentInChildren<Slider>(true);
            if (root == gameObject)
            {
                Debug.LogError("BossHealthBar.root must be a child object, not this one.", this);
                root = null;
            }
            if (slider != null)
            {
                slider.interactable = false;
                slider.transition = Selectable.Transition.None;
                slider.minValue = 0f;
                slider.maxValue = 1f;
                slider.wholeNumbers = false;
                slider.value = 1f;
            }
            if (root != null) root.SetActive(false);
        }

        private void OnEnable()
        {
            if (boss != null) boss.HealthChanged += OnHealthChanged;
        }

        private void OnDisable()
        {
            if (boss != null) boss.HealthChanged -= OnHealthChanged;
        }

        private void OnHealthChanged(int current, int max)
        {
            target = max > 0 ? (float)current / max : 0f;
            if (target < 1f && root != null && !root.activeSelf) root.SetActive(true);
        }

        private void Update()
        {
            if (slider == null) return;
            Shown = Mathf.SmoothDamp(Shown, target, ref vel, drainTime);
            if (Mathf.Abs(Shown - target) < 0.001f) Shown = target;
            slider.value = Shown;
        }
    }
}
```

Thanh máu ẩn tới khi boss trúng đòn đầu tiên, để trận đấu mở đầu yên lặng. Mỗi lần mất máu, thanh trượt xuống trong 0.25 giây thay vì nhảy thẳng, đủ để mắt bắt được mức máu vừa tụt.

Dựng trong `HUD`:

```
BossBar            BossHealthBar, luôn bật
└── Body           Slider + Image nền (Button_05, Sliced), phần ẩn hiện
    └── Fill Area  thụt vào 3 px mỗi phía cho khớp khung
        └── Fill   Image (Button_15, Sliced), Slider kéo chiều rộng của cái này
```

`BossBar` neo giữa mép trên, 200 × 16. Slider: Direction `Left To Right`, xoá `Handle Slide Area` đi, Fill Rect là `Fill`. Kéo `Body` vào ô Slider và ô Root của **Boss Health Bar**.

Tại sao phải tách `Body` ra? Bản đầu của mình để `root` là chính `BossBar`. Thanh máu tắt chính GameObject của nó trong `Awake`, Unity gọi `OnDisable`, `OnDisable` huỷ đăng ký `HealthChanged`, và khi boss trúng đòn thì không còn ai nghe. Thanh máu không bao giờ hiện lại. Thứ lắng nghe sự kiện phải luôn sống, chỉ thứ nhìn thấy được mới được tắt. Dòng `Debug.LogError` trong `Awake` chặn lỗi đó quay lại.

Đây là mặt kia của bài học ở bài 11. Ở đó, tắt một *component* không ngăn code khác gọi hàm public của nó. Ở đây, tắt một *GameObject* thì huỷ luôn đăng ký sự kiện của nó. Nghe như ngược nhau, nhưng là cùng một quy tắc: `enabled` và `SetActive` chỉ quyết định Unity có gọi callback của mình hay không, không quyết định code khác có gọi mình hay không.

### Bảng qua màn

Trong `HUD`, tạo `ClearPanel` (tắt sẵn): khung 200 × 110 ở giữa, dòng chữ "Qua màn!" và hai nút. Nút "Màn tiếp" gắn On Click vào `LevelRunner.NextLevel`, nút "Về bản đồ" gắn vào `LevelRunner.BackToSelect`.

![Bảng Qua màn! giữa màn hình với hai nút Màn tiếp và Về bản đồ, góc trên trái hiện 5/5, nhân vật Nhẹ đứng cạnh chiếc cúp vàng](/images/posts/unity-platformer/15/clear-panel.webp)

Lưu `HUD` thành prefab trong `Assets/_Platformer/Prefabs/UI/` rồi kéo vào cả ba màn.

## Màn chọn màn và chọn nhân vật

Tạo `Assets/_Platformer/Scripts/UI/LevelSelectScreen.cs`:

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace Platformer.UI
{
    public sealed class LevelSelectScreen : MonoBehaviour
    {
        [SerializeField] private Core.LevelCatalog catalog;
        [SerializeField] private RectTransform grid;
        [SerializeField] private Button buttonPrefab;

        [Header("Sprites from the GUI pack")]
        [SerializeField] private Sprite unlockedSprite;
        [SerializeField] private Sprite lockedSprite;
        [Tooltip("Number_01..Number_50, in order. Index 0 is the numeral 1.")]
        [SerializeField] private Sprite[] numberSprites;
        [SerializeField] private Sprite lockIcon;
        [SerializeField] private Sprite clearedIcon;

        [Header("Character select (PlayerData from stage 07)")]
        [SerializeField] private RectTransform characterRow;
        [SerializeField] private TMPro.TMP_Text characterLabel;

        public int Built { get; private set; }
        public int UnlockedCount { get; private set; }

        private readonly List<Button> spawned = new List<Button>();
        private readonly List<Button> characterButtons = new List<Button>();

        private void Start() => Rebuild();

        public void Rebuild()
        {
            BuildCharacters();
            foreach (var b in spawned) if (b != null) Destroy(b.gameObject);
            spawned.Clear();
            Built = 0; UnlockedCount = 0;
            if (catalog == null || grid == null || buttonPrefab == null) return;

            for (int i = 0; i < catalog.Count; i++)
            {
                var entry = catalog[i];
                var unlocked = Core.GameProgress.IsUnlocked(catalog, i);
                var cleared = Core.GameProgress.IsCleared(i);

                var btn = Instantiate(buttonPrefab, grid);
                btn.name = "Level_" + entry.number;
                btn.interactable = unlocked;

                var bg = btn.GetComponent<Image>();
                if (bg != null) bg.sprite = unlocked ? unlockedSprite : lockedSprite;

                // The number stays readable on a locked level: the player should be able
                // to see how far the game goes, not just how far they got.
                SetChild(btn, "Number", NumberSprite(entry.number), true);
                SetChild(btn, "Badge", unlocked ? (cleared ? clearedIcon : null) : lockIcon, true);

                if (unlocked)
                {
                    var scene = entry.sceneName;   // capture per iteration, not the loop variable
                    btn.onClick.AddListener(() => SceneManager.LoadScene(scene));
                    UnlockedCount++;
                }

                spawned.Add(btn);
                Built++;
            }
        }

        /// <summary>One button per character, same prefab as the levels: portrait in the middle, a mark on the chosen one.</summary>
        private void BuildCharacters()
        {
            foreach (var b in characterButtons) if (b != null) Destroy(b.gameObject);
            characterButtons.Clear();
            if (catalog == null || characterRow == null || buttonPrefab == null || catalog.CharacterCount == 0) return;

            var selected = Core.GameProgress.SelectedCharacter(catalog);
            for (int i = 0; i < catalog.CharacterCount; i++)
            {
                var data = catalog.Character(i);
                var btn = Instantiate(buttonPrefab, characterRow);
                btn.name = "Character_" + i;
                var bg = btn.GetComponent<Image>();
                if (bg != null) bg.sprite = unlockedSprite;
                SetChild(btn, "Number", data.portrait, true);
                SetChild(btn, "Badge", i == selected ? clearedIcon : null, true);

                var index = i;   // capture per iteration
                btn.onClick.AddListener(() => { Core.GameProgress.SelectCharacter(index); BuildCharacters(); });
                characterButtons.Add(btn);
            }
            if (characterLabel != null) characterLabel.text = catalog.Character(selected).displayName;
        }

        private Sprite NumberSprite(int number)
        {
            if (numberSprites == null) return null;
            var i = number - 1;
            return i >= 0 && i < numberSprites.Length ? numberSprites[i] : null;
        }

        private static void SetChild(Button btn, string childName, Sprite sprite, bool visible)
        {
            var t = btn.transform.Find(childName);
            if (t == null) return;
            var img = t.GetComponent<Image>();
            if (img == null) return;
            img.sprite = sprite;
            t.gameObject.SetActive(visible && sprite != null);
        }

        /// <summary>Wired to a "reset progress" button. Handy while testing, and honest to ship.</summary>
        public void ResetProgress()
        {
            if (catalog == null) return;
            Core.GameProgress.ResetAll(catalog.Count);
            Rebuild();
        }
    }
}
```

Nút màn và nút nhân vật dựng lúc chạy từ catalog, nên thêm màn hay thêm nhân vật không phải kéo thêm nút nào vào scene. Cả hai dùng chung một prefab nút: ô vuông 48 × 48 (`Button_01`, Sliced), một `Image` con tên `Number` ở giữa, một `Image` con tên `Badge` ở góc dưới phải. Nút màn đặt chữ số vào `Number` và ổ khoá hoặc dấu đã qua vào `Badge`. Nút nhân vật đặt chân dung (`portrait` trong `PlayerData` của bài 7) vào `Number` và dấu đã chọn vào `Badge`.

Hai dòng `var scene = entry.sceneName;` và `var index = i;` quan trọng hơn vẻ ngoài. Lambda trong `AddListener` bắt biến, không bắt giá trị. Dùng thẳng `i` thì lúc người chơi bấm, vòng lặp đã chạy xong và `i` bằng số phần tử, nút nào cũng trỏ ra ngoài mảng. Chép sang một biến mới trong thân vòng lặp thì mỗi lambda có một bản riêng.

Dựng scene `LevelSelect`: một Canvas với Canvas Scaler như HUD, thêm **Level Select Screen**. Trong Canvas có tiêu đề "Chọn màn", `Grid` (Grid Layout Group, ô 48 × 48, cách 12, 5 cột), `CharacterRow` (Horizontal Layout Group, cách 12) phía dưới, một dòng chữ `CharacterLabel` hiện tên nhân vật, và nút "Xoá tiến trình" gắn vào `ResetProgress`. Kéo catalog, prefab nút, các sprite từ thư mục `GUI` vào các ô tương ứng.

## Thứ tự khởi tạo

Bốn lỗi trong series có cùng một gốc: giả định một thứ đã được khởi tạo trước thứ khác.

| Bài | Triệu chứng | Cách chữa |
|---|---|---|
| 8 | `SpriteSequence` NullReference khi địch bật lên | Lấy `SpriteRenderer` lúc cần, không chỉ trong `Awake` |
| 13 | Cú rung boss đầu tiên bị nuốt | Đọc máu boss trong `Start` |
| 15 | Đồng hồ ngọc đứng "0/0" | `RoomState` phát lại sự kiện khi tổng đổi |
| 15 | Nhân vật đã chọn bị bộ mặc định ghi đè | Áp nhân vật trong `Start` |

Unity đảm bảo rất ít về thứ tự: trong một object, `Awake` rồi `OnEnable` của từng component; `Start` của mọi object chạy sau khi mọi `Awake` và `OnEnable` trong scene đã xong. Ngoài hai điều đó thì đừng giả định. Ba cách chữa, mỗi cách hợp một tình huống: đọc dữ liệu của object khác trong `Start`, phát lại sự kiện mỗi khi dữ liệu đổi, và tự lấy tham chiếu lúc cần.

## Build lên web

### Khung nhìn phải khoá

Bài 0 đặt `Pixel Perfect Camera` với Crop Frame `Windowbox`. Đây là lúc nó quan trọng. Không crop, `Pixel Perfect Camera` lấy nguyên khung cửa sổ rồi mới chia zoom:

| | Editor 1536 × 864 | Trình duyệt 1600 × 900, không crop | Trình duyệt 1600 × 900, Windowbox |
|---|---|---|---|
| Zoom | 3 | 3 | 3 |
| Khung nhìn | 32 × 18 unit | **40 × 22.5 unit** | 32 × 18 unit |

Trong Editor, cỡ Game view 1536 × 864 là đúng 3 lần 512 × 288 nên không lộ gì. Trên trình duyệt, canvas 1600 × 900 không chia hết, và người chơi thấy rộng hơn thiết kế 25%: camera lộ ra khỏi những chỗ bài 5 đã tính, và các con số độ khó không còn đúng. Với Windowbox, vùng vẽ khoá ở 1536 × 864, mỗi pixel art đúng 3 pixel màn hình, đổi lại có viền đen 32 pixel mỗi bên. Editor chạy đúng không chứng minh được gì cho WebGL.

Như bài 0 đã nói, danh sách cỡ Game view được lưu riêng cho từng nền tảng. Chuyển sang WebGL trong **File > Build Profiles**, cỡ "512 × 288 × 3" bạn đã tạo sẽ không còn trong dropdown. Thêm lại để thử trong Editor đúng cỡ đó.

### Sáu dòng trước khi bấm Build

Mỗi dòng dưới đây đã từng làm mình mất thời gian:

| | Ở đâu | Đặt gì | Nếu sai |
|---|---|---|---|
| 1 | **Build Profiles > Scene List** | `LevelSelect` đứng đầu, rồi `Level1`, `Level2`, `Level3` | Game mở vào scene đầu danh sách. Thiếu scene nào thì `LoadScene` báo lỗi lúc chạy |
| 2 | **Player > Product Name** | `Platformer` | Tên file build theo tên này. Project của mình chứa cả game shmup, quên đổi là ra bộ file sai tên, trang web tải về 404 |
| 3 | **Player > Publishing Settings > Compression Format** | `Disabled` | Host tĩnh không gửi header nén đúng thì trình duyệt không giải được file `.br` hay `.gz` |
| 4 | **Player > Resolution and Presentation > WebGL Template** | `Default` | Trên Unity 6.3, giá trị trỏ vào thư mục template không tồn tại làm build đổ ở bước cuối với lỗi "Invalid WebGL template path" |
| 5 | Thư mục build | Ngoài `Assets` | Build vào trong `Assets` thì Unity import lại cả đống file build |
| 6 | Trang chứa game | Đường dẫn tới 4 file trong `Build/` | Sai đường dẫn thì trang trắng, Console trình duyệt báo 404 |

Build của mình khoảng 50 MB (wasm 41 MB, data 10.7 MB). Mình không đưa nó vào git mà để trên một kho lưu trữ tĩnh riêng, trang web chỉ trỏ tới.

### Thử trên trình duyệt

Một điều khi thử bằng công cụ tự động: gửi 25 lần nhấn phím `D` thật nhanh vào trang game, nhân vật đứng im. Không phải lỗi build. `PlayerMotor` đọc trạng thái nút mỗi frame, và một cú nhấn nhả gọn trong khoảng giữa hai frame thì cả hai frame đều đọc ra "không nhấn". Phải giữ phím: nhấn, chờ, rồi mới nhả. Người thật thì không nhấn nhanh như vậy, nhưng test tự động thì có.

## Kiểm tra

Chạy từ scene `LevelSelect` sau khi xoá tiến trình:

- Màn 1 mở, màn 2 và 3 có ổ khoá. Nhân vật mặc định là Cân bằng.
- Bấm nhân vật thứ hai: dấu chọn chuyển sang, tên đổi thành "Nhẹ". Vào màn 1: motor nhận đúng bộ số của Nhẹ (tốc độ chạy 10.5, lực nhảy 30.95, hai lần nhảy) và controller animation `Char2`.
- Nhặt đủ 5 ngọc: HUD đếm từ 0/5 tới 5/5, cửa mở. Vào cửa: bảng qua màn hiện, màn 1 được ghi là đã qua với 5 ngọc.
- Màn 3: thanh máu ẩn lúc đầu, hiện ở cú giẫm đầu tiên và tụt còn 2/3 với góc khung nguyên vẹn.

Tự thử:

- Qua màn 1, bấm "Về bản đồ": màn 2 mở khoá, nút màn 1 có dấu đã qua.
- Chọn nhân vật Nặng rồi vào màn 1: thử nhảy lên bệ 1, bạn sẽ thấy vì sao bài 7 nói nhân vật này không lên được.
- Tải lại trang web: tiến trình và nhân vật đã chọn vẫn còn.
- Bấm "Xoá tiến trình": về lại như lần đầu mở game.

## Bài sau

Game đã chạy trên web. Rồi có người mở lên chơi và báo: thùng với cờ hỏng, và không có cách nào qua màn. Bài 16, bài cuối, kể về sáu lỗi không lỗi nào hiện ra trong Console, và ba công cụ mình viết để không dính lại.
