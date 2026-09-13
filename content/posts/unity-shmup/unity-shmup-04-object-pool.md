---
title: "Shmup #4: Object Pool — tái sử dụng đạn thay vì Instantiate/Destroy"
date: "2026-09-17"
lang: "vi"
series: "shmup"
order: 4
excerpt: "Vì sao Instantiate/Destroy liên tục gây giật, Object Pool là gì, dùng UnityEngine.Pool.ObjectPool<T> có sẵn, và code dùng chung đầu tiên trong _Common với asmdef riêng."
coverImage: "/images/posts/unity-shmup/04/cover.webp"
category: "unity-dev"
tags: ["Unity", "Object Pool", "Performance", "Garbage Collector", "Shmup"]
published: true
featured: false
---

## Hôm nay học gì

- Vì sao `Instantiate`/`Destroy` liên tục gây giật (cấp phát bộ nhớ + Garbage Collector)
- Object Pool: tạo sẵn N bản, bật/tắt thay vì tạo/xoá
- `UnityEngine.Pool.ObjectPool<T>` có sẵn của Unity, không tự viết từ đầu
- Tách code dùng chung sang `_Common` với asmdef `BillLab.Common`
- Object tự trả về pool mà không cần biết pool nào (`PooledObject`)

Xong bài này: bắn y hệt bài 3, nhưng Hierarchy chỉ có đúng 20 viên đạn nằm sẵn dưới `BulletPool`, bật lên khi bắn, tắt đi khi hết hạn.

## 1. Vấn đề

Nhìn lại ảnh cuối bài 3: 6 phát/giây × 2 s sống = ~12 object sinh/xoá liên tục. Mỗi `Instantiate` = cấp phát GameObject + components + copy dữ liệu prefab; mỗi `Destroy` = rác chờ GC. GC chạy là một frame dài bất thường (spike).

Đo được bằng **Window → Analysis → Profiler** → CPU → cột **GC Alloc** khi giữ Space ở scene bài 3 so với bài này.

## 2. Code dùng chung: _Common

Đây là script đầu tiên dùng cho mọi game trong project, nên đặt ở `Assets/_Common/Scripts/Pooling/`. Tạo `Assets/_Common/Scripts/BillLab.Common.asmdef` (Root Namespace `BillLab.Common`). Rồi `ShootEmUp.asmdef` → Assembly Definition References → + `BillLab.Common`.

Quy tắc: `_Common` không được tham chiếu ngược về game nào. Chỉ game → Common.

## 3. PrefabPool và PooledObject

`_Common/Scripts/Pooling/PrefabPool.cs`:

```csharp
using UnityEngine;
using UnityEngine.Pool;

namespace BillLab.Common.Pooling
{
    public sealed class PrefabPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField] private int prewarm = 20;
        [SerializeField] private int maxSize = 100;

        private ObjectPool<GameObject> pool;

        public int CountActive => pool.CountActive;
        public int CountInactive => pool.CountInactive;

        private void Awake()
        {
            pool = new ObjectPool<GameObject>(
                createFunc: Create,
                actionOnGet: go => go.SetActive(true),
                actionOnRelease: go => go.SetActive(false),
                actionOnDestroy: Destroy,
                collectionCheck: true,
                defaultCapacity: prewarm,
                maxSize: maxSize);

            var warm = new GameObject[prewarm];
            for (var i = 0; i < prewarm; i++) warm[i] = pool.Get();
            for (var i = 0; i < prewarm; i++) pool.Release(warm[i]);
        }

        public GameObject Get(Vector3 position, Quaternion rotation)
        {
            var go = pool.Get();
            go.transform.SetPositionAndRotation(position, rotation);
            return go;
        }

        public void Release(GameObject go) => pool.Release(go);

        private GameObject Create()
        {
            var go = Instantiate(prefab, transform);
            go.name = prefab.name;

            var pooled = go.GetComponent<PooledObject>();
            if (pooled == null) pooled = go.AddComponent<PooledObject>();
            pooled.Pool = this;
            return go;
        }
    }
}
```

- `ObjectPool<T>` của Unity nhận 4 callback: tạo, lấy ra, trả về, huỷ. Ta chỉ bật/tắt object ở lấy/trả.
- `collectionCheck: true`: trả cùng object 2 lần sẽ ném exception thay vì hỏng ngầm. Để true khi dev.
- `maxSize`: pool giữ tối đa bấy nhiêu bản rảnh; thừa thì Destroy. Không phải giới hạn số object sống.
- Prewarm bằng cách Get rồi Release: cách đơn giản nhất để pool tự tạo N bản.
- `Instantiate(prefab, transform)`: đạn là con của BulletPool → Hierarchy gọn.
- **Cẩn thận `??` với object Unity** (bài 2). Viết `if (pooled == null)`.
- Instantiate chạy `Awake` của mọi script trên prefab ngay lập tức, trước khi ta kịp AddComponent → prefab **phải có sẵn** PooledObject; đoạn AddComponent chỉ là lưới an toàn.

`_Common/Scripts/Pooling/PooledObject.cs`:

```csharp
using UnityEngine;

namespace BillLab.Common.Pooling
{
    [DisallowMultipleComponent]
    public sealed class PooledObject : MonoBehaviour
    {
        public PrefabPool Pool { get; internal set; }

        public void Release()
        {
            if (Pool != null) Pool.Release(gameObject);
            else Destroy(gameObject);
        }
    }
}
```

Script khác (Projectile, sau này Enemy) chỉ cần `GetComponent<PooledObject>().Release()`. Không có pool thì rơi về Destroy — object đặt tay trong scene vẫn chạy.

## 4. Đổi Projectile và PlayerShooting

`Projectile`: thay `Destroy(gameObject, lifetime)` bằng timer:

```csharp
[RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
public sealed class Projectile : MonoBehaviour
{
    private PooledObject pooled;
    private float despawnTime;

    private void Awake()
    {
        body = GetComponent<Rigidbody2D>();
        pooled = GetComponent<PooledObject>();
    }

    private void OnEnable() => despawnTime = Time.time + lifetime;

    private void Update()
    {
        if (Time.time >= despawnTime) pooled.Release();
    }
    // FixedUpdate giữ nguyên
}
```

Vì sao không `Invoke(nameof(Release), lifetime)`: Invoke vẫn chạy trên object đã tắt → trả về pool lần thứ hai → exception `collectionCheck`. Timer trong Update an toàn vì Update không chạy khi object inactive.

`PlayerShooting`: field `projectilePrefab` (GameObject) → `projectilePool` (PrefabPool). `Instantiate(...)` → `projectilePool.Get(muzzle.position, muzzle.rotation)`.

Sau khi sửa script, mở prefab `Bullet_Player`: Unity **tự thêm** `PooledObject` vì `[RequireComponent]` (kiểm tra cho chắc). Nếu không có thì Add Component tay.

![Prefab có PooledObject](/images/posts/unity-shmup/04/pool_02_prefab-with-pooledobject.webp)

## 5. BulletPool trong scene

Copy scene → `SEU_04_Pool`. Create Empty `BulletPool` → Add `PrefabPool`: Prefab ← `Bullet_Player`, Prewarm 20, Max Size 100.

![BulletPool](/images/posts/unity-shmup/04/pool_01_bulletpool-inspector.webp)

Inspector của Player: ô **Projectile Pool = None** (ô Projectile Prefab cũ biến mất, Unity bỏ dữ liệu cũ). Kéo `BulletPool` từ Hierarchy vào:

![Trước](/images/posts/unity-shmup/04/pool_03_player-inspector-before-wire.webp)
![Sau](/images/posts/unity-shmup/04/pool_04_player-inspector-after-wire.webp)

## 6. Chạy thử

![Hierarchy lúc Play](/images/posts/unity-shmup/04/pool_05_hierarchy-in-play.webp)

`BulletPool` có 20 con `Bullet_Player`, xám = inactive. Giữ Space: từng con sáng lên, bay, rồi xám lại. Số liệu mình đo: pool có đúng **20 con** từ đầu tới cuối; đỉnh **11 active / 9 inactive**; thả phím 2 s sau còn 1 active. Không object mới nào được tạo → Prewarm 20 dư cho tốc độ này.

![Bắn với pool](/images/posts/unity-shmup/04/pool_06_firing.webp)

## Chú ý

- Prefab bật/tắt liên tục thì mọi trạng thái phải reset ở `OnEnable`, không phải `Start`/`Awake`.
- `collectionCheck` báo lỗi "already released" là dấu hiệu có 2 nơi cùng trả object. Đừng tắt nó để che lỗi.

## Bài sau

[Shmup #5](/lab/unity-shmup-05-enemies-collision): kẻ địch, collider trigger, Layer Collision Matrix, Health.
