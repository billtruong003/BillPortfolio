---
title: "Shmup #7: Vẽ lịch xuất hiện rồi viết Wave Spawner"
date: "2026-09-20"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-07-waves-asteroids
series: "shmup"
order: 7
excerpt: "Dùng timeline để hiểu coroutine, count, interval và delayAfter; cho pool tạo nhiều loại địch theo lịch rõ ràng."
coverImage: "/images/posts/unity-shmup/07/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-timeline"><p><strong>1.0 s</strong> · Spawn #1</p><p><strong>1.8 s</strong> · Spawn #2</p><p><strong>2.6 s</strong> · Spawn #3</p><p><strong>4.6 s</strong> · Wave tiếp theo sau 2 giây nghỉ</p></div>

## Một wave là lịch, không phải một đám object

Ba con địch đặt tay trong scene thì chỉ chơi được đúng một lần. Bài này thay chúng bằng một cái lịch: chờ 1 giây, thả 3 con cách nhau 0.8 giây, nghỉ 2 giây rồi sang đợt sau.

Lưu scene thành `SEU_07_Waves`.

Nhìn kỹ timeline ở trên, vì nó chứa đúng chỗ hay viết sai. Con đầu ra ở giây 1.0, con thứ hai ở 1.8, con thứ ba ở 2.6 — tức `interval` chỉ nằm **giữa hai lần spawn**. Sau con cuối cùng ta chỉ chờ `delayAfter` là 2 giây, ra 4.6. Cách viết sai thường gặp là chờ thêm một `interval` nữa sau con cuối, và đợt sau bị trễ 0.8 giây so với ý định.

Một điều kiện nữa cần chốt từ đầu: wave coi như xong khi đã spawn đủ số lượng, không phải khi mọi con đã chết. Muốn luật "diệt sạch mới sang đợt" thì cần một bộ đếm riêng theo dõi số con còn sống, và đó là chuyện khác.

Các mốc thời gian ở trên là lịch mục tiêu. Thời điểm thật được làm tròn tới frame mà coroutine chạy tiếp, nên lệch vài mili giây là bình thường.

## Từ lịch trên giấy sang WaveSet

| Field | Ý nghĩa | Ví dụ |
|---|---|---|
| enemy | Loại địch trong đợt | InsectBasic |
| count | Tổng số lần tạo | 3 |
| interval | Giây giữa hai lần tạo | 0.8 |
| delayAfter | Giây sau lần tạo cuối | 2 |
| loop | Chạy lại cả danh sách | Tắt khi thử một vòng |

**Assets/_ShootEmUp/Scripts/Data/WaveSet.cs**

```csharp
using System;
using UnityEngine;

namespace ShootEmUp.Data
{
    [CreateAssetMenu(menuName = "ShootEmUp/Wave Set", fileName = "Waves_New")]
    public sealed class WaveSet : ScriptableObject
    {
        [Serializable]
        public struct Wave
        {
            public EnemyData enemy;
            [Min(1)] public int count;
            [Tooltip("Seconds between two spawns inside this wave.")]
            [Min(0f)] public float interval;
            [Tooltip("Seconds to wait after the last spawn of this wave before the next wave starts.")]
            [Min(0f)] public float delayAfter;
        }

        public Wave[] waves = Array.Empty<Wave>();

        [Tooltip("Start again from the first wave when the last one is done.")]
        public bool loop = true;
    }
}
```

`[Serializable]` trên struct `Wave` là thứ làm cho Unity vẽ được từng dòng wave trong Inspector. Thiếu nó thì mảng hiện ra trống trơn dù code vẫn compile.

Phân vai ở đây giống bài 6: ScriptableObject giữ lịch, còn spawner mới là thứ thực hiện lịch. Tạo asset **Waves_Level1** trong `ScriptableObjects/Waves`, trước mắt chỉ nhập đúng một wave như ví dụ trên và tắt Loop.

![WaveSet với một wave duy nhất](/images/posts/unity-shmup/07/waves_02_waveset-inspector.webp)

## Coroutine là hàm có chỗ dừng

Một hàm thường chạy một mạch tới hết rồi trả quyền điều khiển về, tất cả trong cùng một frame. Bạn không thể viết "chờ 0.8 giây" ở giữa nó mà không treo cả game.

Coroutine là hàm được phép dừng giữa chừng. Tới dòng `yield`, nó trả quyền điều khiển lại cho Unity, và Unity quay lại chạy tiếp từ đúng chỗ đó ở frame đủ điều kiện. Cái timeline ở đầu bài chính là hình dạng của một coroutine khi chạy: mỗi mốc thời gian là một lần nó tỉnh dậy làm việc rồi ngủ tiếp.

`WaitForSeconds` đếm bằng thời gian game, và coroutine không phải một thread mới — nó vẫn chạy trên luồng chính, xen giữa các frame.

**Assets/_ShootEmUp/Scripts/Enemies/WaveSpawner.cs**

```csharp
using System.Collections;
using BillLab.Common.Pooling;
using ShootEmUp.Core;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    public sealed class WaveSpawner : MonoBehaviour
    {
        [Tooltip("Pool of the generic enemy prefab.")]
        [SerializeField] private PrefabPool enemyPool;

        [Tooltip("Which waves to play, in order.")]
        [SerializeField] private WaveSet waveSet;

        [Tooltip("How far above the visible top edge enemies appear.")]
        [SerializeField] private float spawnMargin = 1.5f;

        [Tooltip("Keep spawns this far from the left/right edges so big asteroids are not half off-screen.")]
        [SerializeField] private float horizontalPadding = 1f;

        [Tooltip("Seconds before the first wave, so the player can get ready.")]
        [SerializeField] private float initialDelay = 1f;

        private Coroutine running;

        private void OnEnable()
        {
            running = StartCoroutine(Run());
        }

        private void OnDisable()
        {
            if (running != null) StopCoroutine(running);
        }

        private IEnumerator Run()
        {
            if (waveSet == null || waveSet.waves == null || waveSet.waves.Length == 0) yield break;
            yield return new WaitForSeconds(initialDelay);

            do
            {
                foreach (var wave in waveSet.waves)
                {
                    if (wave.enemy == null || wave.count < 1) continue;
                    for (var i = 0; i < wave.count; i++)
                    {
                        Spawn(wave.enemy);
                        if (i + 1 < wave.count) yield return new WaitForSeconds(Mathf.Max(0f, wave.interval));
                    }

                    yield return new WaitForSeconds(wave.delayAfter);
                }
                yield return null;
            }
            while (waveSet.loop);
        }

        private void Spawn(EnemyData data)
        {
            var bounds = ScreenBounds.Get();
            var x = Random.Range(bounds.xMin + horizontalPadding, bounds.xMax - horizontalPadding);
            var position = new Vector3(x, bounds.yMax + spawnMargin, 0f);

            var enemy = enemyPool.Get(position, Quaternion.identity);
            enemy.GetComponent<Enemy>().Apply(data);
        }
    }
}
```

Dòng `if (i + 1 < wave.count)` chính là luật interval ở đầu bài, viết thành code: chỉ chờ khi còn con nữa sắp ra. Bỏ điều kiện đó đi là bạn có thêm một `interval` thừa sau con cuối.

`OnDisable` dừng coroutine khi component bị tắt. Nhờ vậy bài 8 dừng được spawner bằng `enabled = false` mà không phải viết thêm gì. Lưu ý bản này bắt đầu lại lịch từ đầu khi bật lại, chứ không nhớ chỗ đang dở.

Hai dòng kiểm tra đầu hàm `Run` chặn trường hợp `waveSet` rỗng. Không có chúng, vòng `do…while(loop)` sẽ quay liên tục mà không gặp `yield` nào và treo Editor ngay khi bấm Play.

## Pool viết cho đạn giờ chạy cho địch

Xoá nhóm ba con địch đặt tay từ bài 5 đi. Tạo Empty tên **EnemyPool**, Add Component `PrefabPool`, điền Prefab = `Enemy_Insect`, Prewarm 15, Max Size 60.

![PrefabPool cấu hình cho địch](/images/posts/unity-shmup/07/waves_05_enemypool-inspector.webp)

Đây là lần đầu `_Common` trả công. `PrefabPool` viết ở bài 4 cho đạn, bây giờ chạy cho địch mà không sửa một dòng nào, vì nó chưa bao giờ biết gì về đạn — nó chỉ biết một prefab và hai thao tác lấy với trả. Đó cũng là lý do folder đó không được phép tham chiếu ngược về `ShootEmUp`.

Tiếp theo tạo Empty tên **WaveSpawner** và Add Component cùng tên. Hai ô reference đang trống:

![WaveSpawner trước khi nối reference](/images/posts/unity-shmup/07/waves_03_spawner-before-wire.webp)

Kéo `EnemyPool` từ Hierarchy vào ô Enemy Pool, kéo `Waves_Level1` từ Project vào ô Wave Set. Đặt Initial Delay 1, Spawn Margin 1.5, Horizontal Padding 1.

![WaveSpawner sau khi nối đủ](/images/posts/unity-shmup/07/waves_04_spawner-after-wire.webp)

Chỗ thả địch được tính từ `ScreenBounds`: X ngẫu nhiên trong biên ngang trừ padding, Y bằng đỉnh camera cộng `spawnMargin` để địch đi vào từ ngoài khung. Padding tồn tại để thiên thạch lớn ở phần sau không ló nửa người ngoài mép màn hình.

## Đếm đủ ba con trước khi thêm gì

Bấm Play và đếm. Đúng ba con xuất hiện rồi dừng, vì Loop đang tắt.

![Địch trong Hierarchy lúc wave đang chạy](/images/posts/unity-shmup/07/waves_06_hierarchy-in-play.webp)

Thử tiếp: trong lúc đợt đang chạy, bỏ tick component `WaveSpawner` trong Inspector. Không được có con nào mới xuất hiện nữa, còn con đang bay thì vẫn bay tiếp. Đó là `OnDisable` dừng coroutine.

Làm xong bài thử đếm được này rồi hãy thêm nhiều loại địch, vì lúc đó số con nhiều lên và việc đếm khó hơn hẳn.

## Thiên thạch chỉ là phần mở rộng của dữ liệu

Thay `EnemyData`, `Enemy` và `EnemyMover` bằng bản bài 7 trong gói source. Ba file đó thêm hai field `colliderRadius` và `rotationSpeed`, đồng thời `Apply` chúng lên CircleCollider2D và mover.

Điểm đáng chú ý là ta không viết class `Asteroid` nào cả. Thiên thạch khác con bọ ở máu, tốc độ, kích thước collider và tốc độ xoay — tất cả đều là số, nên chúng thuộc về data chứ không thuộc về code. Đây là lợi ích của bài 6 đang trả về.

Tạo ba `EnemyData` mới:

| Asset | HP | Speed | Radius ở scale 1 | Rotation °/s | Score |
|---|---|---|---|---|---|
| Asteroid_Small | 1 | 4 | 0.4 | 90 | 5 |
| Asteroid_Medium | 3 | 2.5 | 0.55 | 45 | 15 |
| Asteroid_Large | 6 | 1.5 | 0.85 | 20 | 40 |

![EnemyData của thiên thạch](/images/posts/unity-shmup/07/waves_01_asteroid-data.webp)

Radius tính theo local units và chịu scale của object, nên hình khác kích thước thì phải chỉnh lại theo collider nhìn thấy trong Scene view. Giữ Rotation Speed bằng 0 cho hai con bọ để chúng không tự xoay.

Prefab `Enemy_Insect` giờ đã chạy cho cả bọ lẫn thiên thạch, nên tên đó không còn mô tả đúng vai trò. Đổi thành `Enemy_Generic` trong Unity nếu bạn muốn, Unity sẽ giữ nguyên mọi reference.

## Một lịch sáu wave chép lại được

| Wave | Enemy | Count | Interval | Delay After |
|---|---|---|---|---|
| 1 | InsectBasic | 4 | 0.8 | 2 |
| 2 | Asteroid_Small | 6 | 0.5 | 2 |
| 3 | InsectFast | 4 | 0.6 | 2 |
| 4 | Asteroid_Medium | 3 | 1.0 | 2 |
| 5 | InsectBasic | 5 | 0.5 | 0.5 |
| 6 | Asteroid_Large | 1 | 0.8 | 3 |

Mỗi dòng chỉ mang đúng một `EnemyData`. Muốn một đợt vừa có bọ vừa có thiên thạch thì để hai dòng liên tiếp với `delayAfter` của dòng trước bằng 0, chứ không có field nào trộn hai loại trong một wave.

Wave 5 có `delayAfter` 0.5 để nối gần như liền vào wave 6, tạo cảm giác dồn dập trước con thiên thạch lớn. Bật Loop sau khi bạn đã xem trọn một vòng.

![Lịch sáu wave đang chạy](/images/posts/unity-shmup/07/waves_07_waves.webp)

Chặng này xong khi: số con và khoảng nghỉ khớp lịch, con ra khỏi khung được dọn, loại mới nhận đúng sprite cùng máu cùng collider, và tắt spawner thì chặn được lần spawn tiếp theo. Giờ bạn có một màn chơi chạy liên tục. Bài sau cho nó một điểm bắt đầu và một điểm kết thúc.

## Mã nguồn chặng này

[Tải script bài 7](/downloads/shmup/lesson-07.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #8](/lab/unity-shmup-08-hud-game-loop).
