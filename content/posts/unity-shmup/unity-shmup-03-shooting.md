---
title: "Shmup #3: Vòng đời một phát bắn — từ Fire đến hết hạn"
date: "2026-09-16"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-03-shooting
series: "shmup"
order: 3
excerpt: "Hiểu prefab và instance qua một viên đạn: điểm bắn, chuyển động, cooldown và điều kiện biến mất."
coverImage: "/images/posts/unity-shmup/03/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-flow"><span>Giữ Fire</span><span>Qua cooldown</span><span>Sinh tại Muzzle</span><span>Bay</span><span>Hết hạn</span></div>

## Tách người bắn khỏi viên đạn

Bài này làm cho tàu bắn được đạn. Nhưng thứ đáng chú ý hơn viên đạn lại là cái Hierarchy ở cuối bài: nó đầy `Bullet_Player(Clone)` sinh ra rồi biến mất liên tục, và đó chính là lý do bài 4 tồn tại.

Đây là đích của bài:

![Tàu bắn một tràng laser lên phía trên](/images/posts/unity-shmup/03/shoot_06_firing.webp)

Đầu vào là scene bài 2, lưu lại thành `SEU_03_Shoot`. Chưa có địch nên đạn chưa gây sát thương cho ai.

Việc bắn được chia cho hai script. `PlayerShooting` quyết định **khi nào và ở đâu** tạo ra đạn. `Projectile` quyết định **viên đạn bay và tồn tại thế nào**. Tách như vậy vì hai thứ đó có vòng đời khác nhau: khi tàu đổi hướng hay ngừng bắn, những viên đã sinh ra vẫn tự bay tiếp mà không cần ai điều khiển.

## Prefab là khuôn, instance là bản sao

Prefab là một GameObject đã được lưu thành asset trong Project để nhân bản. Sửa prefab thì mọi bản sao đổi theo. Cái gì sinh ra lúc chạy game — đạn, kẻ địch, hiệu ứng — đều nên là prefab.

Dựng viên đạn theo thứ tự sau. Tạo Empty tên **Bullet_Player**, thêm Sprite Renderer với sprite laser và Sorting Layer **Projectiles**, đặt scale sao cho hình nhỏ hơn tàu. Thêm component `Projectile` ở mục dưới, rồi thêm Rigidbody 2D với Body Type **Kinematic** và bật **Interpolate**. Đặt Speed 14, Lifetime 2.

Lý do chọn Kinematic giống hệt bài 2: vị trí do code quyết định, còn physics chỉ để bắt va chạm ở bài 5.

Kéo object `Bullet_Player` từ Hierarchy thả vào folder `Prefabs`. Unity tạo ra file `.prefab` và tên trong Hierarchy chuyển sang màu xanh:

![Bullet_Player.prefab nằm trong folder Prefabs](/images/posts/unity-shmup/03/shoot_02_prefab-in-project.webp)

Double click vào prefab để mở **Prefab Mode**. Cửa sổ này trông gần giống Scene view thường nhưng chỉ chứa mình prefab, và Inspector lúc này sửa thẳng vào khuôn:

![Inspector của Bullet_Player trong Prefab Mode](/images/posts/unity-shmup/03/shoot_01_bullet-prefab-inspector.webp)

Phân biệt hai chế độ này quan trọng hơn vẻ ngoài của nó. Sửa trong Prefab Mode là sửa khuôn, mọi bản sao đổi theo. Sửa một instance trong scene chỉ đổi riêng bản đó, và Unity đánh dấu dòng bị đổi bằng chữ đậm. Bài 6 sẽ dùng chính cơ chế đó để làm biến thể địch.

Xong thì xoá `Bullet_Player` khỏi Hierarchy, chỉ giữ prefab trong Project. Khuôn không cần một bản nằm sẵn trong scene.

## Làm một viên bay được trước

Tạo `Scripts/Combat/Projectile.cs`. Script này chỉ lo chuyện đạn bay theo hướng nào và sống được bao lâu.

**Assets/_ShootEmUp/Scripts/Combat/Projectile.cs**

```csharp
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile removes itself, even if it hit nothing. Keeps the scene from filling up.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
        }

        private void OnEnable()
        {
            Destroy(gameObject, lifetime);
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
```

Hai chi tiết đáng dừng lại.

`transform.up` chứ không phải `Vector2.up`: đạn bay theo hướng chính nó đang xoay, không phải theo trục Y của thế giới. Nhờ vậy khi bài 5 cần đạn địch bắn xuống, ta chỉ xoay prefab 180° là xong, dùng chung một script.

Hẹn giờ đặt trong `OnEnable` chứ không phải `Start`: bài 4 sẽ bật tắt object thay vì tạo mới, mà `Start` chỉ chạy đúng một lần trong đời object còn `OnEnable` chạy lại mỗi lần bật. Viết sẵn như vậy từ đây thì bài sau đỡ phải sửa.

Đây là vòng đời tạo rồi huỷ. Bài 4 sẽ thay toàn bộ lịch `Destroy` bằng trả về pool. Nếu lúc đó bạn chỉ đổi `Instantiate` sang pool mà vẫn giữ `Destroy(gameObject, lifetime)`, một viên đang được tái sử dụng sẽ bị xoá giữa chừng.

Thử ngay: kéo prefab vào scene đặt giữa màn hình rồi bấm Play. Viên đạn bay lên và biến mất sau khoảng 2 giây. Stop, xoá instance thử, giữ prefab.

## Muzzle là vị trí chỉnh được bằng mắt

Tạo một Empty làm con của `Player`, đặt tên **Muzzle**, local position khoảng (0, 1.05, 0) và local rotation 0. Nó không cần renderer hay collider, vì `PlayerShooting` chỉ đọc Transform.

Vì sao không viết thẳng `transform.position + Vector3.up * 1.05f` trong code: đổi sprite tàu khác, hoặc muốn hai nòng súng, bạn chỉ cần kéo Muzzle trong Scene view. Hierarchy chính là chỗ đặt dữ liệu vị trí, và kéo bằng mắt nhanh hơn dò số trong code.

## Fire là một ý định giữ hoặc nhả

Mở `ShmupControls`, trong map **Gameplay** thêm Action **Fire** với Action Type **Button**. Thêm ba binding: phím Space, chuột trái, và `buttonSouth` của gamepad. Bấm Save Asset.

Tạo `Scripts/Player/PlayerShooting.cs`.

**Assets/_ShootEmUp/Scripts/Player/PlayerShooting.cs**

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    public sealed class PlayerShooting : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Fire action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("Prefab spawned for every shot. Its 'up' must point in the travel direction.")]
        [SerializeField] private GameObject projectilePrefab;

        [Tooltip("Where the projectile appears. A child Transform at the ship's nose.")]
        [SerializeField] private Transform muzzle;

        [Tooltip("Fire rate while the button is held.")]
        [SerializeField] private float shotsPerSecond = 6f;

        private InputAction fireAction;
        private float nextShotTime;

        private void Awake()
        {
            fireAction = controls.FindAction("Gameplay/Fire", throwIfNotFound: true);
        }

        private void OnEnable()
        {
            fireAction.Enable();
        }

        private void OnDisable()
        {
            fireAction.Disable();
        }

        private void Update()
        {
            if (!fireAction.IsPressed() || Time.time < nextShotTime)
            {
                return;
            }

            Instantiate(projectilePrefab, muzzle.position, muzzle.rotation);
            nextShotTime = Time.time + 1f / shotsPerSecond;
        }
    }
}
```

`IsPressed()` trả về true suốt thời gian nút đang được giữ, khác với `WasPressedThisFrame()` chỉ true đúng một frame lúc vừa nhấn. Muốn bắn từng phát theo từng lần nhấn thì đổi sang hàm thứ hai.

Cooldown tính bằng `Time.time` chứ không đếm frame. `nextShotTime` là thời điểm sớm nhất được bắn tiếp, và với 6 phát mỗi giây thì khoảng cách mục tiêu là `1/6 ≈ 0.167` giây:

<div class="lesson-timeline"><p><strong>t = 0</strong> · Bắn ngay nếu đang giữ</p><p><strong>0 &lt; t &lt; 0.167</strong> · Chờ dù vẫn giữ</p><p><strong>t ≥ 0.167</strong> · Frame kế tiếp đủ điều kiện mới bắn</p></div>

Đếm frame thay vì đếm thời gian là lỗi kinh điển: máy 144 fps sẽ bắn nhanh gấp gần năm lần máy 30 fps. Cách trên thì máy nào cũng ra 6 phát mỗi giây. Nói cho chính xác thì nhịp bắn vẫn bị làm tròn theo frame, nên ở fps rất thấp con số thực tế hụt đi một chút.

Bắn xử lý trong `Update` chứ không phải `FixedUpdate`, vì bắn là phản ứng với input nên cần nhạy theo từng khung hình. Còn đạn *di chuyển* trong `FixedUpdate` vì nó là Rigidbody.

## Nối ba reference có ba ý nghĩa khác nhau

Add Component `PlayerShooting` lên `Player`. Inspector hiện ra ba ô đang trống:

![PlayerShooting với ba ô chưa nối](/images/posts/unity-shmup/03/shoot_03_player-inspector-before-wire.webp)

| Field | Kéo từ đâu | Giá trị |
|---|---|---|
| Controls | Project | ShmupControls |
| Projectile Prefab | Project | Bullet_Player.prefab |
| Muzzle | Hierarchy | Player/Muzzle |
| Shots Per Second | Gõ tay | 6 |

Cột giữa là chỗ hay sai. `Controls` và `Projectile Prefab` là asset nên kéo từ Project window. `Muzzle` kiểu `Transform` nên chỉ nhận object đang có trong scene, phải kéo từ Hierarchy. Kéo nhầm nguồn thì ô vẫn hiện None và bạn ngồi kéo lại mãi không được.

![PlayerShooting sau khi nối đủ ba reference](/images/posts/unity-shmup/03/shoot_04_player-inspector-after-wire.webp)

## Theo dõi cả lúc bắn lẫn lúc dừng

Bấm Play, giữ Fire và vừa di chuyển. Đạn phải xuất hiện ở mũi tàu đúng thời điểm bắn rồi bay độc lập, không dính theo tàu nữa. Thả Fire thì không có viên mới nhưng viên cũ vẫn bay tiếp. Chờ quá 2 giây thì mọi viên đều được dọn.

Giờ mở rộng Hierarchy ra và nhìn trong lúc đang giữ Space:

![Hàng loạt Bullet_Player(Clone) trong Hierarchy lúc Play](/images/posts/unity-shmup/03/shoot_05_hierarchy-clones-in-play.webp)

Số đạn sống cùng lúc bằng tốc độ bắn nhân lifetime, tức khoảng `6 × 2 = 12` viên. Đây là ước lượng, con số thực tế nhấp nhô quanh đó theo từng frame.

Mỗi dòng `Bullet_Player(Clone)` trong ảnh là một lần `Instantiate` cấp phát bộ nhớ, và mỗi lần biến mất là một lần `Destroy` để lại rác cho Garbage Collector. Ở mức 12 viên bạn chưa cảm nhận được gì. Bài 7 có wave 30 con địch kèm đạn của chúng thì khác.

Mình để bài này chạy kiểu đó một cách cố ý, đúng theo cách mình vẫn làm: **make it exist first, you can make it good later.** Có một hệ bắn chạy được rồi thì bài 4 mới có thứ cụ thể để sửa, và bạn nhìn thấy vấn đề trên máy mình thay vì đọc lời khuyên tránh nó từ đầu.

## Mã nguồn chặng này

[Tải script bài 3](/downloads/shmup/lesson-03.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #4](/lab/unity-shmup-04-object-pool).
