---
title: "Shmup #4: Hai vòng đời của viên đạn — học Object Pool bằng đối chiếu"
date: "2026-09-17"
updated: "2026-09-14"
lang: vi
translationKey: unity-shmup-04-object-pool
series: "shmup"
order: 4
excerpt: "Đối chiếu tạo/hủy với lấy/trả, thiết lập hợp đồng reset và chuyển toàn bộ hệ bắn sang pool mà vẫn giữ hành vi."
coverImage: "/images/posts/unity-shmup/04/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-compare"><div><strong>BÀI 3</strong><p>Instantiate → bay → Destroy</p><p>Mỗi phát có instance mới.</p></div><div><strong>BÀI 4</strong><p>Lấy → đặt vị trí → bật → bay → trả</p><p>Instance cũ bắt đầu một lượt sống mới.</p></div></div>

## 360 lần Instantiate cho mỗi phút giữ nút

Cuối bài 3 bạn có một khẩu súng chạy được và một Hierarchy đầy clone nhấp nháy. Bắn 6 phát mỗi giây nghĩa là mỗi phút giữ nút có 360 lần `Instantiate` và 360 lần `Destroy`, chỉ tính riêng đạn của một người chơi. Bài này đổi cách làm: không xoá đạn nữa mà giữ lại để dùng tiếp.

Mỗi lần `Instantiate` là một lần Unity cấp phát GameObject, cấp phát từng component trên đó, rồi copy dữ liệu từ prefab sang. Mỗi lần `Destroy` để lại rác cho Garbage Collector. GC không dọn đều đặn mà dồn lại rồi chạy một lần, và lần đó là một frame dài bất thường.

Hành vi bắn ở bài này giữ nguyên hệt bài 3, chỉ đổi cách quản lý tài nguyên. Lưu scene thành `SEU_04_Pool`.

## Pool là gì

Ý tưởng đơn giản hơn cái tên của nó. Thay vì mỗi lần bắn lại chế một viên đạn mới rồi vứt đi, ta chuẩn bị sẵn một khay đạn. Cần thì lấy ra, dùng xong trả lại khay.

Điểm khác biệt so với cách nghĩ thông thường là object trong pool **không có trạng thái chết**. Nó chỉ đi qua lại giữa hai trạng thái, và cả hai đều là đang tồn tại trong bộ nhớ:

```text
Inactive (nằm trong pool)
      │ Get()
      ▼
   Active (đang bay)
      │ Release()
      ▼
Inactive (nằm trong pool)
```

Pool giữ sẵn các bản không hoạt động để dùng lại, và khi hết bản rảnh thì nó tạo thêm. Pattern này không sinh ra trong game và cũng không riêng của Unity: connection pool của database hay thread pool của web server đều cùng một ý tưởng, chỉ khác loại tài nguyên.

Nói cho sòng phẳng, pool không mặc nhiên nhanh hơn trong mọi trường hợp. Cái ta mua được ở đây là quyền kiểm soát việc tạo và huỷ object, còn chuyện nhanh hơn bao nhiêu thì phải đo khi tải đủ lớn.

## Pool lấy đi của bạn thứ gì

Hai cái giá, và cả hai đều có thật.

Thứ nhất là bộ nhớ bị giữ thường trực. Hai mươi viên đạn nằm sẵn từ lúc vào game tới lúc thoát, kể cả màn nào bạn không bắn phát nào.

Thứ hai quan trọng hơn nhiều: **trạng thái không tự sạch.** Một object mới `Instantiate` luôn mang giá trị mặc định của prefab. Một object lấy từ pool thì mang theo trạng thái của lần sống trước: vị trí cũ, máu còn lại, velocity, coroutine đang chạy dở. Đây là nguồn bug lớn nhất khi mới dùng pool, và nó là lý do của toàn bộ phần `OnEnable` ở dưới. Một viên mới có lifetime mới, thì một viên tái sử dụng cũng phải có lifetime mới, hướng mới và vị trí mới.

## Khi nào nên pool

Pool có lợi khi cả hai điều sau cùng đúng: object được tạo rồi huỷ lặp đi lặp lại, thường theo từng đợt; và chi phí tạo đủ đáng kể so với chi phí giữ nó nằm không trong bộ nhớ.

Trong game, danh sách thứ đáng pool khá ổn định: đạn, kẻ địch, thiên thạch, hiệu ứng nổ, số damage bay lên, `AudioSource` cho tiếng chồng nhau, và item trong list UI cuộn dài. Điểm chung của chúng là số lượng lớn, vòng đời ngắn, hình dạng giống nhau.

Ngược lại, đừng pool thứ chỉ có một bản trong cả game như Player, Camera hay GameManager, cũng đừng pool thứ chỉ tạo vài lần mỗi ván như cửa, rương hay một con boss duy nhất. Pool một thứ không cần pool thì bạn trả cả bộ nhớ lẫn rủi ro quên reset mà không nhận lại gì.

## Bốn callback của ObjectPool

Unity có sẵn `ObjectPool<T>` trong namespace `UnityEngine.Pool`, dùng được cho bất kỳ kiểu C# nào chứ không riêng GameObject. Nó không tự biết GameObject là gì nên hỏi bạn bốn việc:

| Callback | Chạy khi | Ta làm gì |
|---|---|---|
| `createFunc` | Pool hết bản rảnh | `Instantiate` prefab |
| `actionOnGet` | Có người gọi `Get()` | Đặt vị trí rồi bật object |
| `actionOnRelease` | Có người gọi `Release()` | Tắt object |
| `actionOnDestroy` | Pool giữ quá nhiều bản rảnh | `Destroy` |

Nhìn bảng này là thấy trước phần còn lại của bài. Phần tiết kiệm nằm gọn ở hai dòng giữa: lấy ra và trả về chỉ bật tắt, không cấp phát gì cả.

## Ba vai trò và một hợp đồng

| Thành phần | Chịu trách nhiệm | Không chịu trách nhiệm |
|---|---|---|
| PrefabPool | Tạo, giữ object rảnh, đặt vị trí trước khi bật | Biết luật sát thương |
| PooledObject | Biết nơi trả về; chặn trả trùng | Quyết định khi nào hết hạn |
| Projectile | Di chuyển và quyết định hết lifetime | Quản lý danh sách object rảnh |

Chi tiết đáng chú ý: `Projectile` gọi `PooledObject`, không gọi thẳng `PrefabPool`. Viên đạn không cần biết pool nào đang giữ mình, thậm chí không cần biết có pool hay không. Nhờ vậy cùng một prefab vừa dùng được trong pool, vừa kéo tay vào scene để test được.

## Xây pool trong assembly dùng chung

Pool là script đầu tiên trong series không phục vụ riêng game bắn tàu, nên nó không nằm trong `_ShootEmUp` mà ở `_Common`. Đây là lúc folder trống từ bài 0 có việc làm.

Tạo `_Common/Scripts/BillLab.Common.asmdef`, tên **BillLab.Common**. Rồi chọn `ShootEmUp.asmdef` và thêm reference **BillLab.Common**.

Hướng phụ thuộc là một chiều: game tham chiếu Common, Common không biết gì về ShootEmUp. Lỡ để `_Common` gọi ngược sang `ShootEmUp` thì Unity báo circular reference và cả hai assembly cùng không compile, chưa kể lúc đó Common hết dùng chung được vì đã dính vào một game cụ thể.

Tạo hai file dưới `_Common/Scripts/Pooling`. Đọc `PooledObject` trước vì nó nhỏ hơn: nó chỉ giữ nơi trả về và trạng thái đã trả.

**Assets/_Common/Scripts/Pooling/PooledObject.cs**

```csharp
using UnityEngine;
namespace BillLab.Common.Pooling
{
    [DisallowMultipleComponent]
    public sealed class PooledObject : MonoBehaviour
    {
        public PrefabPool Pool { get; internal set; }
        private bool released;
        private void OnEnable() => released = false;
        public void Release()
        {
            if (released) return;
            released = true;
            if (Pool != null) Pool.Release(gameObject);
            else Destroy(gameObject);
        }
    }
}
```

`OnEnable` reset cờ cho lượt sống mới. Lần `Release` thứ hai trong cùng một lượt bị bỏ qua, nên hai nơi cùng gọi trả về sẽ không làm hỏng pool. Nhưng đó chỉ là lưới an toàn cho việc trả object: nơi gây sát thương vẫn phải tự chặn để không trừ máu hai lần, vì trả pool và gây sát thương là hai trách nhiệm khác nhau.

Nhánh `else Destroy` lo cho object đặt tay trong scene, loại không đến từ pool nào. Nhờ nó, một viên đạn bạn kéo vào scene để test vẫn biến mất đúng như mong đợi.

Giờ tới pool.

**Assets/_Common/Scripts/Pooling/PrefabPool.cs**

```csharp
using UnityEngine;
using UnityEngine.Pool;
namespace BillLab.Common.Pooling
{
    public sealed class PrefabPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField, Min(0)] private int prewarm = 20;
        [SerializeField, Min(1)] private int maxSize = 100;
        private ObjectPool<GameObject> pool;
        private Transform staging;
        public int CountActive => pool.CountActive;
        public int CountInactive => pool.CountInactive;
        private void Awake()
        {
            var holder = new GameObject("Inactive factory");
            holder.SetActive(false);
            staging = holder.transform;
            staging.SetParent(transform, false);
            pool = new ObjectPool<GameObject>(Create, null,
                go => go.SetActive(false), go => Destroy(go), true,
                Mathf.Max(1, prewarm), Mathf.Max(1, maxSize));
            var warm = new GameObject[Mathf.Min(prewarm, Mathf.Max(1, maxSize))];
            for (var i = 0; i < warm.Length; i++) warm[i] = pool.Get();
            foreach (var go in warm) pool.Release(go);
        }
        private GameObject Create()
        {
            var go = Instantiate(prefab, staging);
            go.SetActive(false);
            go.transform.SetParent(transform, false);
            var pooled = go.GetComponent<PooledObject>();
            if (pooled == null) pooled = go.AddComponent<PooledObject>();
            pooled.Pool = this;
            return go;
        }
        public GameObject Get(Vector3 position, Quaternion rotation, Vector3? scale = null)
        {
            var go = pool.Get();
            go.transform.SetPositionAndRotation(position, rotation);
            go.transform.localScale = scale ?? prefab.transform.localScale;
            var body = go.GetComponent<Rigidbody2D>();
            if (body != null)
            {
                body.position = position;
                body.rotation = rotation.eulerAngles.z;
                body.linearVelocity = Vector2.zero;
                body.angularVelocity = 0f;
            }
            go.SetActive(true);
            return go;
        }
        public void Release(GameObject go) => pool.Release(go);
        private void OnDestroy() => pool?.Clear();
    }
}
```

Ba chỗ trong file này đáng giải thích.

**`Inactive factory` là chỗ đi xa hơn tutorial thường.** Hướng dẫn pool phổ thông chỉ `Instantiate` rồi `SetActive(false)` ngay sau đó. Vấn đề là giữa hai lệnh ấy, object đã kịp chạy `Awake` và `OnEnable` như một lần spawn thật, nên hiệu ứng nổ có thể phát ra, timer có thể bắt đầu đếm. Tạo object dưới một parent đang tắt sẵn thì nó sinh ra trong trạng thái inactive ngay từ đầu, và cả 20 lần prewarm không kích hoạt gì cả.

**Vòng lặp prewarm phải lấy đủ N rồi mới trả cả N.** `ObjectPool<T>` chỉ tạo instance khi có người gọi `Get`, còn `defaultCapacity` chỉ là dung lượng kho chứa bên trong chứ không tự tạo object. Nếu bạn `Get` rồi `Release` ngay trong cùng một vòng lặp, pool sẽ đưa lại đúng viên vừa trả và cuối cùng bạn chỉ có một object dùng đi dùng lại.

**Max Size giới hạn số bản rảnh được giữ**, không phải số đạn tối đa được phép bay. Pool rảnh quá nhiều thì phần thừa bị `Destroy`. Chi tiết này ghi rõ trong [tài liệu ObjectPool của Unity](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Pool.ObjectPool_1.html).

Trong `Get`, `scale ?? prefab.transform.localScale` là toán tử null-coalescing trên `Vector3?`, tức nullable struct của C#. Nó không liên quan tới phép kiểm tra vòng đời của `UnityEngine.Object` — chỗ đó vẫn phải viết `if (pooled == null)` như trong `Create`, vì object Unity đã bị `Destroy` không phải `null` thật với C#.

## Chuyển cả người bắn lẫn viên đạn

Thay toàn bộ `Projectile` bằng phiên bản sau. Đừng giữ lại `Destroy(gameObject, lifetime)` của bài 3.

**Assets/_ShootEmUp/Scripts/Combat/Projectile.cs**

```csharp
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile goes back to the pool, even if it hit nothing.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnTime;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            despawnTime = Time.time + lifetime;
        }

        private void Update()
        {
            if (Time.time >= despawnTime)
            {
                pooled.Release();
            }
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
```

Đây là chỗ cái giá ở trên phải trả. `despawnTime` được tính lại trong `OnEnable` chứ không phải `Start`, vì instance được tái sử dụng. `Start` và `Awake` chỉ chạy lần đầu tiên trong đời object, còn `OnEnable` chạy lại mỗi lần nó bật lên.

Luật rút ra, áp dụng cho mọi object đi qua pool từ đây về sau: **cái gì cần đúng ở đầu mỗi lần sống thì đặt trong `OnEnable`.** Bài 5 có địch mang máu, quên luật này là con địch vừa spawn đã mang sẵn 0 HP của lần chết trước rồi chết lại ngay lập tức.

Timer viết trong `Update` an toàn vì `Update` không chạy khi object đang inactive, nên một viên đã trả về pool không tiếp tục đếm để trả thêm lần nữa.

`PlayerShooting` đổi ít hơn: field `projectilePrefab` kiểu `GameObject` thành `projectilePool` kiểu `PrefabPool`, và lời gọi `Instantiate(...)` thành `projectilePool.Get(muzzle.position, muzzle.rotation)`. File đầy đủ có trong [gói source bài 4](/downloads/shmup/lesson-04.zip), gồm cả phần input giữ nguyên.

## Ráp scene theo năm bước

Làm đúng thứ tự này, vì prefab phải xong trước khi pool trỏ vào nó.

**Bước 1.** Mở prefab `Bullet_Player` và kiểm tra nó có đủ Rigidbody 2D, `Projectile` và **`PooledObject`**. Thuộc tính `[RequireComponent]` thường tự thêm component khi bạn sửa code, nhưng với prefab đã tồn tại từ trước thì không chắc, nên đây là thứ phải nhìn bằng mắt:

![Prefab Bullet_Player với component PooledObject](/images/posts/unity-shmup/04/pool_02_prefab-with-pooledobject.webp)

Không thấy dòng `Pooled Object` thì Add Component tay.

**Bước 2.** Trong Hierarchy, Create Empty và đặt tên `BulletPool`.

**Bước 3.** Add Component `PrefabPool` lên nó, rồi điền: Prefab kéo `Bullet_Player` từ Project, Prewarm `20`, Max Size `100`.

![PrefabPool trên BulletPool đã điền đủ ba field](/images/posts/unity-shmup/04/pool_01_bulletpool-inspector.webp)

**Bước 4.** Chọn `Player` và nhìn component `PlayerShooting`. Ô `Projectile Prefab` cũ đã biến mất, thay bằng ô **Projectile Pool** đang để None. Đổi kiểu field nghĩa là Unity bỏ luôn reference cũ chứ không tự chuyển được:

![PlayerShooting với ô Projectile Pool chưa nối](/images/posts/unity-shmup/04/pool_03_player-inspector-before-wire.webp)

**Bước 5.** Kéo `BulletPool` **từ Hierarchy** vào ô đó. Ô kiểu `PrefabPool` chỉ nhận component đang có trong scene, không nhận asset trong Project. Nối xong thì kiểm tra lại `Controls` và `Muzzle` vẫn còn nguyên:

![PlayerShooting sau khi nối Projectile Pool](/images/posts/unity-shmup/04/pool_04_player-inspector-after-wire.webp)

## Bài thử lấy, trả, rồi lấy lại

Bấm Play và mở rộng `BulletPool` trong Hierarchy **trước khi** bắn:

![20 viên đạn inactive nằm dưới BulletPool](/images/posts/unity-shmup/04/pool_05_hierarchy-in-play.webp)

Bạn thấy 20 viên `Bullet_Player` màu xám vì đang inactive, cộng một object tên `Inactive factory`. Cái đó là chỗ tạo an toàn ở phần trên chứ không phải viên đạn thứ 21.

Giờ giữ Space: từng viên sáng lên, bay, rồi xám lại. Không dòng nào mới xuất hiện, không dòng nào biến mất.

![Bắn liên tục mà số dòng trong Hierarchy không đổi](/images/posts/unity-shmup/04/pool_06_firing.webp)

Số mình đo được ở tốc độ 6 phát mỗi giây: pool giữ đúng **20 viên** từ đầu tới cuối, lúc cao nhất là **11 active / 9 inactive**, thả phím 2 giây sau thì còn 1 active. Không instance nào được tạo thêm sau `Awake`, nghĩa là prewarm 20 dư cho nhịp bắn này.

Thử tiếp vòng tái sử dụng: bắn, thả, chờ quá Lifetime, rồi bắn lại. Những viên cũ phải xuất hiện lại ở Muzzle với lifetime đầy đủ chứ không biến mất ngay.

Sau đó hạ Prewarm xuống 1 và chạy lại để thấy pool tự tạo thêm khi thiếu, rồi trả về 20. Pool phình ra không phải là rò rỉ: tải vượt quá số bản có sẵn thì tạo thêm là hành vi đúng. Chỉ cần biết rằng lúc đó bạn đang cấp phát giữa trận, nên tăng Prewarm cho khớp thì tốt hơn.

Nếu Console báo exception `already released`, có hai chỗ cùng gọi `Release` trên một object. Cờ `released` chặn được hậu quả nhưng bạn vẫn nên tìm ra chỗ thứ hai, đừng tắt `collectionCheck` để che.

## Muốn so hiệu năng thì đo thế nào

Mở **Window → Analysis → Profiler**, chuyển sang CPU Usage và nhìn cột **GC Alloc** trong lúc giữ Space. So scene bài 3 với scene bài 4 theo đúng một kịch bản: cùng thời lượng, cùng tốc độ bắn, cùng máy, và chờ prewarm xong mới bắt đầu ghi.

Đừng dùng số lượng object con trong Hierarchy làm bằng chứng fps tốt hơn — nó chỉ cho biết pool đang hoạt động, không nói gì về thời gian mỗi frame. Kết quả bắt buộc của chặng này là vòng tái sử dụng chạy đúng. Bài 5 sẽ thêm một lý do trả đạn về pool sớm hơn lifetime: đạn trúng mục tiêu.

## Mã nguồn chặng này

[Tải script bài 4](/downloads/shmup/lesson-04.zip) — chỉ có code và assembly definition, không kèm scene, prefab hay bộ hình trong ảnh. Nâng từ bài trước thì chép đè file cùng đường dẫn.

Tiếp theo: [Shmup #5](/lab/unity-shmup-05-enemies-collision).
