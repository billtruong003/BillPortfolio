---
title: "Shmup #3: Bắn đạn — Prefab, Instantiate, cooldown"
date: "2026-09-16"
lang: "vi"
series: "shmup"
order: 3
excerpt: "Prefab là gì và vì sao đạn phải là prefab. Instantiate/Destroy, cooldown bằng Time.time, tách Projectile khỏi PlayerShooting, và Muzzle làm điểm bắn."
coverImage: "/images/posts/unity-shmup/03/cover.webp"
category: "unity-dev"
tags: ["Unity", "Prefab", "Instantiate", "Shooting", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- **Prefab**: tạo từ object trong scene, vì sao đạn phải là prefab
- `Instantiate` / `Destroy` và `Destroy(obj, delay)`
- Cooldown theo thời gian với `Time.time`, không đếm frame
- Tách "đạn bay thế nào" (`Projectile`) khỏi "ai bắn, bắn lúc nào" (`PlayerShooting`)
- Dùng một Transform con (`Muzzle`) làm điểm xuất phát thay vì cộng offset trong code

Xong bài này: giữ Space / chuột trái / nút A là tàu bắn laser 6 phát/giây, đạn tự biến mất sau 2 giây. Cuối bài bạn sẽ thấy Hierarchy đầy `Bullet_Player(Clone)` — chính là lý do bài 4 học Object Pool.

![Bắn đạn](/images/posts/unity-shmup/03/shoot_06_firing.webp)

## 1. Copy scene

`SEU_02_PlayerMove` → Ctrl+D → `SEU_03_Shoot`.

## 2. Tạo prefab đạn

1. Hierarchy → Create Empty → `Bullet_Player`.
2. Add Component **Sprite Renderer**: Sprite `laser-1`, Sorting Layer **Projectiles**. Scale (0.6, 0.6, 1).
3. Add Component **Rigidbody 2D**: Body Type **Kinematic**, Interpolate. (Lý do giống bài 2: tự điều khiển vị trí, physics chỉ để bắt va chạm ở bài 5.)
4. Add Component `Projectile` (mục 4). Speed 14, Lifetime 2.
5. **Kéo `Bullet_Player` từ Hierarchy thả vào folder `Prefabs`** → Unity tạo file `.prefab`, tên trong Hierarchy chuyển màu xanh.
6. Xoá `Bullet_Player` khỏi Hierarchy. Prefab là khuôn, không cần bản trong scene.

![Prefab trong Project](/images/posts/unity-shmup/03/shoot_02_prefab-in-project.webp)

Double click prefab để mở **Prefab Mode**, Inspector lúc này sửa thẳng vào khuôn:

![Inspector prefab](/images/posts/unity-shmup/03/shoot_01_bullet-prefab-inspector.webp)

Prefab = GameObject lưu thành asset để nhân bản. Sửa prefab → mọi bản sao đổi theo. Đạn, kẻ địch, hiệu ứng: cái gì sinh ra lúc chạy game đều là prefab.

## 3. Muzzle

Chọn `Player` → Create Empty con → `Muzzle`, Position (0, 1.05, 0) = mũi tàu. Không cần component nào.

Vì sao không viết `transform.position + Vector3.up * 1.05f`: đổi sprite tàu khác, hoặc muốn 2 nòng, chỉ kéo Muzzle trong Scene view, không sửa code. Hierarchy chính là nơi đặt data vị trí.

## 4. Code

`Scripts/Combat/Projectile.cs`:

```csharp
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class Projectile : MonoBehaviour
    {
        [SerializeField] private float speed = 14f;
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;

        private void Awake()    => body = GetComponent<Rigidbody2D>();
        private void OnEnable() => Destroy(gameObject, lifetime);

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
```

- `transform.up` thay vì `Vector2.up`: đạn bay theo hướng object đang xoay. Kẻ địch bắn xuống chỉ cần xoay prefab 180°, cùng script.
- `Destroy(gameObject, lifetime)` = hẹn giờ xoá, không cần đếm trong Update.
- Đặt trong `OnEnable` chứ không `Start`: bài 4 pool sẽ bật/tắt object thay vì tạo mới; `OnEnable` chạy lại mỗi lần bật, `Start` chỉ chạy một lần.

`Scripts/Player/PlayerShooting.cs`:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    public sealed class PlayerShooting : MonoBehaviour
    {
        [SerializeField] private InputActionAsset controls;
        [SerializeField] private GameObject projectilePrefab;
        [SerializeField] private Transform muzzle;
        [SerializeField] private float shotsPerSecond = 6f;

        private InputAction fireAction;
        private float nextShotTime;

        private void Awake()     => fireAction = controls.FindAction("Gameplay/Fire", throwIfNotFound: true);
        private void OnEnable()  => fireAction.Enable();
        private void OnDisable() => fireAction.Disable();

        private void Update()
        {
            if (!fireAction.IsPressed() || Time.time < nextShotTime) return;

            Instantiate(projectilePrefab, muzzle.position, muzzle.rotation);
            nextShotTime = Time.time + 1f / shotsPerSecond;
        }
    }
}
```

- `IsPressed()` = đang giữ. Muốn bắn từng phát theo lần nhấn thì `WasPressedThisFrame()`.
- Cooldown bằng `Time.time`: máy 30 fps hay 144 fps đều 6 phát/giây. Đếm frame là sai kinh điển.
- Bắn ở `Update` chứ không `FixedUpdate`: bắn là phản ứng với input, cần nhạy theo frame. Đạn *di chuyển* ở FixedUpdate vì nó là Rigidbody.

## 5. Gắn 3 reference

`Player` → Add Component `PlayerShooting`. Ba ô trống:

![Trước khi gắn](/images/posts/unity-shmup/03/shoot_03_player-inspector-before-wire.webp)

- Controls ← kéo `ShmupControls` từ Project (cùng asset với PlayerMovement).
- Projectile Prefab ← kéo `Bullet_Player.prefab` từ Project.
- Muzzle ← kéo object `Muzzle` **từ Hierarchy**. Ô kiểu `Transform` chỉ nhận object trong scene hoặc prefab.

![Sau khi gắn](/images/posts/unity-shmup/03/shoot_04_player-inspector-after-wire.webp)

## 6. Chạy thử

Play, giữ Space. Mở Hierarchy:

![Hierarchy lúc Play](/images/posts/unity-shmup/03/shoot_05_hierarchy-clones-in-play.webp)

`Bullet_Player(Clone)` xuất hiện liên tục, mỗi cái tự xoá sau 2 s. Mình đếm được 10–12 đạn sống cùng lúc (6/giây × 2 giây). Mỗi Instantiate cấp phát bộ nhớ mới, mỗi Destroy để lại rác cho Garbage Collector → khung hình giật khi GC chạy. Với đạn của 1 người chơi chưa thấy, nhưng bài 7 có wave 30 kẻ địch là thấy ngay. Bài 4 sửa.

## Bài sau

[Shmup #4](/lab/unity-shmup-04-object-pool): Object Pool với `UnityEngine.Pool.ObjectPool<T>`, và code dùng chung đầu tiên trong `_Common`.
