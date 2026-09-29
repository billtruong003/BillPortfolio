---
title: "Platformer #5: Camera đi theo nhân vật mà không lộ ra ngoài phòng"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 5
excerpt: "Camera bám nhân vật trong căn phòng 64×36, nhảy tại chỗ thì đứng yên, chạy tới tường thì dừng đúng mép phòng. Dựng từng lớp một, và một lỗi thứ tự clamp mà hầu hết code camera đều mắc."
coverImage: "/images/posts/unity-platformer/05/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Camera", "Tutorial"]
published: true
featured: false
---

Từ bài 0 tới giờ camera đứng yên ở góc dưới trái, nhìn thấy đúng 32 × 18 ô trong căn phòng 64 × 36. Chạy sang phải một chút là nhân vật ra khỏi màn hình. Bài này cho camera đi theo nhân vật, với ba yêu cầu:

- Nhân vật nhích nhẹ thì camera không động đậy.
- Nhảy tại chỗ thì camera không nhấp nhô lên xuống.
- Chạy tới sát tường phòng thì camera dừng lại, không bao giờ lộ khoảng trống bên ngoài tilemap.

Đây là kết quả khi nhân vật chạy tới cột của khe ở cuối phòng: tường phải của phòng nằm sát mép màn hình.

![Game view: camera dừng ở biên phải, tường phải của phòng nằm sát mép màn hình](/images/posts/unity-platformer/05/clamp-right.webp)

## Hai tầng camera, mỗi tầng một người ghi

Có ba thứ muốn quyết định camera đứng ở đâu: script đi theo nhân vật, luật không cho camera ra ngoài phòng, và hiệu ứng rung màn hình ở bài 13. Nếu cả ba cùng ghi vào một Transform, thứ nào ghi sau sẽ đè thứ ghi trước. Rung ghi sau thì có thể đẩy camera ra ngoài phòng, còn follow ghi sau thì rung bị xoá mất.

Bài 0 đã dựng sẵn hai tầng cho chuyện này:

![Sơ đồ: CameraFollow ghi position của CameraRoot, CameraShake ở bài 13 ghi localPosition của Main Camera con](/images/posts/unity-platformer/05/two-layers.webp)

`CameraRoot` do `CameraFollow` điều khiển, bao gồm cả việc giữ nó trong phòng. `Main Camera` là con của `CameraRoot`, nằm ở vị trí local `(0, 0, -10)`, và chỉ bài 13 mới đụng vào nó để rung quanh điểm đó. Hai script ghi vào hai chỗ khác nhau nên không bao giờ giẫm lên nhau, và bài 13 sẽ thêm rung mà không phải sửa dòng nào trong bài này.

## Bước 1: đánh dấu kích thước căn phòng

Camera cần biết phòng rộng bao nhiêu để không đi ra ngoài. Mình không để camera tự đọc tilemap, vì sau này một phòng có thể có vài tilemap hoặc có khoảng trống cố ý. Thay vào đó là một component nhỏ khai báo hình chữ nhật của phòng.

Tạo `Assets/_Platformer/Scripts/Level/RoomBounds.cs`:

```csharp
using UnityEngine;

namespace Platformer.Level
{
    public sealed class RoomBounds : MonoBehaviour
    {
        [Tooltip("Room size in world units (= tiles at PPU 16). The reference room is 64 × 36.")]
        [SerializeField] private Vector2 size = new Vector2(64f, 36f);

        public Rect Rect => new Rect(transform.position.x, transform.position.y, size.x, size.y);
        public Vector2 Size => size;

        public Vector2 ClampCameraCentre(Vector2 centre, float halfWidth, float halfHeight)
        {
            var r = Rect;
            var x = r.width  <= halfWidth  * 2f ? r.center.x : Mathf.Clamp(centre.x, r.xMin + halfWidth,  r.xMax - halfWidth);
            var y = r.height <= halfHeight * 2f ? r.center.y : Mathf.Clamp(centre.y, r.yMin + halfHeight, r.yMax - halfHeight);
            return new Vector2(x, y);
        }

        public bool Contains(Vector2 worldPoint) => Rect.Contains(worldPoint);

        private void OnDrawGizmos()
        {
            var r = Rect;
            Gizmos.color = new Color(0.2f, 0.9f, 1f, 0.9f);
            Gizmos.DrawWireCube(r.center, r.size);
        }
    }
}
```

`ClampCameraCentre` nhận tâm camera muốn tới và nửa kích thước khung nhìn, rồi trả về tâm gần nhất mà khung nhìn vẫn nằm trọn trong phòng. Nếu phòng hẹp hơn khung nhìn thì camera đứng ở giữa phòng, không kẹp gì cả.

Trong Hierarchy, tạo một GameObject rỗng tên `Room`, đặt Position `(0, 0, 0)` và thêm `RoomBounds`. Để Size là `64 × 36`.

![Inspector của Room: RoomBounds với Size 64 x 36](/images/posts/unity-platformer/05/roombounds-inspector.webp)

Nhìn Scene view, một khung màu cyan bao sát mép ngoài của căn phòng. Gốc toạ độ của phòng là góc dưới trái, đúng như bài 1 đã tô.

## Bước 2: bám thẳng vào nhân vật

Tạo `Assets/_Platformer/Scripts/Camera/CameraFollow.cs` với phiên bản đơn giản nhất: mỗi frame đặt `CameraRoot` vào vị trí nhân vật.

```csharp
using UnityEngine;

namespace Platformer.CameraRig
{
    [DefaultExecutionOrder(100)]
    public sealed class CameraFollow : MonoBehaviour
    {
        [SerializeField] private Transform target;
        [SerializeField] private Vector2 targetOffset = new Vector2(0f, 0.85f);

        private void LateUpdate()
        {
            if (target == null) return;
            var t = (Vector2)target.position + targetOffset;
            transform.position = new Vector3(t.x, t.y, transform.position.z);
        }
    }
}
```

Chọn `CameraRoot`, thêm `CameraFollow`, kéo `Player` từ Hierarchy vào ô **Target**.

Vài chỗ trong đoạn ngắn này là quyết định sẽ giữ tới cuối bài:

- Camera cập nhật trong `LateUpdate`, sau khi mọi `Update` đã chạy. `[DefaultExecutionOrder(100)]` đẩy nó chạy sau cả những script khác cũng dùng `LateUpdate`, nên camera luôn là thứ di chuyển cuối cùng trong frame.
- `targetOffset = (0, 0.85)`: pivot của nhân vật nằm ở chân (bài 0), nên bám thẳng vào `transform.position` thì camera nhắm vào mặt sàn. Nâng điểm ngắm lên 0.85, khoảng giữa người.
- Rigidbody của nhân vật để `Interpolate` từ bài 2. Physics chỉ chạy 50 lần một giây, nhưng Unity vẽ nhân vật ở vị trí nội suy giữa hai bước, nên camera đọc `target.position` trong `LateUpdate` sẽ thấy một chuyển động mượt chứ không nhảy nấc.

Bấm Play và chạy thử. Camera bám theo, nhưng hơi chóng mặt: mỗi lần nhảy, cả thế giới trên màn hình giật xuống rồi giật lên theo. Chạy ra gần tường trái thì màn hình lộ khoảng tối bên ngoài phòng. Mình ghi lại vị trí camera khi nhảy tại chỗ trên bệ 3:

![Đồ thị: camera bám 1:1 lên xuống 5.24 unit theo cú nhảy, camera có luật trục dọc đứng yên](/images/posts/unity-platformer/05/jump-naive-vs-rule.webp)

Đường đỏ là camera bám 1:1: nó lên xuống đúng 5.24 unit theo cú nhảy (và trùng hẳn với điểm ngắm nên bạn không thấy đường xám). Đường xanh là camera ở cuối bài này, đứng yên hoàn toàn. Các bước sau là để đi từ đường đỏ tới đường xanh.

## Bước 3: CameraFollow đầy đủ

Thay toàn bộ nội dung `CameraFollow.cs` bằng bản dưới. Mình đưa cả file một lần cho dễ chép, rồi các mục sau sẽ đi qua từng khối và cách thử riêng từng khối trong Inspector.

```csharp
using UnityEngine;

namespace Platformer.CameraRig
{
    [DefaultExecutionOrder(100)]
    public sealed class CameraFollow : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField] private Player.PlayerMotor motor;
        [SerializeField] private Level.RoomBounds room;
        [SerializeField] private Camera cam;
        [SerializeField] private Vector2 targetOffset = new Vector2(0f, 0.85f);

        [Header("Dead zone (half extents, world units)")]
        [SerializeField] private Vector2 deadZone = new Vector2(1.5f, 1.0f);

        [Header("Smoothing")]
        [SerializeField, Min(0f)] private float smoothTimeX = 0.12f;
        [SerializeField, Min(0f)] private float smoothTimeY = 0.18f;

        [Header("Look-ahead")]
        [SerializeField, Min(0f)] private float lookAhead = 3f;
        [SerializeField, Min(0f)] private float lookAheadSmoothTime = 0.25f;

        [Header("Vertical rule")]
        [SerializeField] private bool snapToPlatforms = true;
        [SerializeField, Range(0.1f, 1f)] private float airborneFollowFraction = 0.6f;

        [Header("Room clamp")]
        [SerializeField, Min(0f)] private float shakeMargin = 0.35f;

        public Vector2 DesiredCentre { get; private set; }
        public bool ClampedX { get; private set; }
        public bool ClampedY { get; private set; }

        private Vector2 velocity;
        private float lookVel;
        private float currentLookAhead;
        private float lastGroundedY;

        public float HalfHeight => cam.orthographicSize;
        public float HalfWidth  => cam.orthographicSize * cam.aspect;

        private void Awake()
        {
            if (cam == null) cam = GetComponentInChildren<Camera>();
            if (target != null) lastGroundedY = AimPoint().y;
        }

        private void OnEnable()
        {
            if (target != null) SnapTo(AimPoint());
        }

        private Vector2 AimPoint() => (Vector2)target.position + targetOffset;

        public void SnapTo(Vector2 worldPoint)
        {
            velocity = Vector2.zero; lookVel = 0f;
            currentLookAhead = motor != null ? motor.FacingSign * lookAhead : 0f;
            var centre = Clamp(new Vector2(worldPoint.x + currentLookAhead, worldPoint.y));
            transform.position = new Vector3(centre.x, centre.y, transform.position.z);
            lastGroundedY = worldPoint.y;
        }

        private void LateUpdate()
        {
            if (target == null) return;
            var pos = (Vector2)transform.position;
            var t = AimPoint();

            // 1. look-ahead swings toward the facing direction
            var wantLook = motor != null ? motor.FacingSign * lookAhead : 0f;
            currentLookAhead = Mathf.SmoothDamp(currentLookAhead, wantLook, ref lookVel, lookAheadSmoothTime);

            // 2. dead zone on X: only chase once the target leaves the box
            var aimX = pos.x;
            var dx = (t.x + currentLookAhead) - pos.x;
            if (Mathf.Abs(dx) > deadZone.x) aimX = pos.x + dx - Mathf.Sign(dx) * deadZone.x;

            // 3. vertical rule: track the last grounded height, unless the player is about to leave the view
            var grounded = motor == null || motor.IsGrounded || motor.IsWallSliding;
            if (grounded) lastGroundedY = t.y;
            var aimY = pos.y;
            var refY = snapToPlatforms ? lastGroundedY : t.y;
            var dy = refY - pos.y;
            if (Mathf.Abs(dy) > deadZone.y) aimY = pos.y + dy - Mathf.Sign(dy) * deadZone.y;
            if (snapToPlatforms && !grounded)
            {
                var limit = HalfHeight * airborneFollowFraction;
                var dAir = t.y - pos.y;
                if (Mathf.Abs(dAir) > limit) aimY = pos.y + dAir - Mathf.Sign(dAir) * limit;
            }

            // 4. clamp the aim, smooth toward it, clamp again
            DesiredCentre = Clamp(new Vector2(aimX, aimY));
            var next = new Vector2(
                Mathf.SmoothDamp(pos.x, DesiredCentre.x, ref velocity.x, smoothTimeX),
                Mathf.SmoothDamp(pos.y, DesiredCentre.y, ref velocity.y, smoothTimeY));
            var clamped = Clamp(next);
            ClampedX = !Mathf.Approximately(clamped.x, next.x);
            ClampedY = !Mathf.Approximately(clamped.y, next.y);
            if (ClampedX) velocity.x = 0f;
            if (ClampedY) velocity.y = 0f;
            transform.position = new Vector3(clamped.x, clamped.y, transform.position.z);
        }

        private Vector2 Clamp(Vector2 centre)
        {
            if (room == null) return centre;
            return room.ClampCameraCentre(centre, HalfWidth + shakeMargin, HalfHeight + shakeMargin);
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireCube(transform.position, new Vector3(deadZone.x * 2f, deadZone.y * 2f, 0f));
            if (cam != null)
            {
                Gizmos.color = new Color(1f, 1f, 1f, 0.4f);
                Gizmos.DrawWireCube(transform.position, new Vector3(HalfWidth * 2f, HalfHeight * 2f, 0f));
            }
        }
    }
}
```

Lưu lại, chọn `CameraRoot` và nối các ô:

1. **Target**: kéo `Player` vào.
2. **Motor**: kéo `Player` vào lần nữa, Unity tự lấy component `PlayerMotor` trên đó. Camera cần motor để biết nhân vật đang quay mặt hướng nào, đang đứng trên đất hay đang bám tường.
3. **Room**: kéo `Room` vào.
4. **Cam**: kéo `Main Camera` (con của CameraRoot) vào. Để trống thì `Awake` cũng tự tìm camera con, nhưng nối tay thì rõ ràng hơn.

![Inspector của CameraRoot: Camera Follow với Target Player, Motor Player, Room, Cam Main Camera, Target Offset 0 0.85, Dead Zone 1.5 x 1, Smooth Time X 0.12, Y 0.18, Look Ahead 3, Snap To Platforms bật, Shake Margin 0.35](/images/posts/unity-platformer/05/camerafollow-inspector.webp)

Hierarchy lúc này:

![Hierarchy: CameraRoot chứa Main Camera, Grid, Player, Room](/images/posts/unity-platformer/05/hierarchy.webp)

Chọn `CameraRoot` và nhìn Scene view: khung trắng là vùng camera nhìn thấy, hộp vàng nhỏ ở giữa là dead zone, khung cyan là căn phòng.

![Scene view: khung cyan của RoomBounds bao quanh phòng, khung trắng 32 x 18 của camera, hộp vàng dead zone ở giữa khung](/images/posts/unity-platformer/05/gizmos-room.webp)

`LateUpdate` làm bốn việc theo thứ tự, đánh số 1 tới 4 trong comment. Mỗi mục dưới đây giải thích một việc và cách tắt riêng việc đó trong Inspector để bạn thấy nó làm gì.

## Dead zone: nhích nhẹ không kéo camera

Khối số 2 chỉ cho camera đuổi theo khi điểm ngắm ra khỏi một hộp quanh tâm camera. Hộp rộng `deadZone.x = 1.5` mỗi bên. Trong hộp, người chơi đi qua đi lại, chỉnh vị trí đứng trước một cú nhảy, mà thế giới trên màn hình vẫn đứng yên. Ra khỏi hộp thì camera chỉ đuổi phần vượt ra, nên nhân vật dừng lại ở mép hộp chứ không bị kéo về giữa.

Thử: đặt Dead Zone về `(0, 0)` lúc đang Play, bước trái phải một chút. Màn hình trượt theo từng bước nhỏ, nhìn rất bồn chồn. Trả về `(1.5, 1)`.

## SmoothDamp: đuổi theo có gia tốc

Khối số 4 không đặt camera thẳng vào điểm cần tới mà dùng `Mathf.SmoothDamp`. Hàm này giống lò xo có giảm chấn: nó tăng tốc, rồi chậm dần khi gần tới, và tới nơi trong khoảng thời gian `smoothTime` bạn đặt. Trục X dùng 0.12 giây, trục Y chậm hơn một chút, 0.18 giây, vì mắt người khó chịu với chuyển động dọc hơn chuyển động ngang.

Cùng lý do với việc bài 2 dùng `MoveTowards` thay vì `Lerp`: `Lerp(pos, target, k)` mỗi frame đi một tỉ lệ cố định của khoảng còn lại, nên tốc độ phụ thuộc số frame mỗi giây, và nó không bao giờ tới nơi hẳn. `SmoothDamp` tính theo `Time.deltaTime` nên chạy như nhau ở 60 hay 144 frame/giây, và có một biến `velocity` lưu vận tốc hiện tại. Biến này sẽ quan trọng ở mục clamp.

Thử: đặt Smooth Time X về `0`. Camera đuổi tức thì, mỗi khi nhân vật ra khỏi dead zone là khung hình khựng một cái.

## Look-ahead: nhìn trước theo hướng chạy

Khối số 1 dời điểm ngắm thêm `lookAhead = 3` unit về phía nhân vật đang quay mặt. Người chơi cần nhìn thấy thứ phía trước hơn thứ phía sau. Khi nhân vật quay đầu, `currentLookAhead` trượt từ +3 sang −3 trong khoảng 0.25 giây bằng `SmoothDamp`, nên camera lướt sang chứ không giật.

Lúc chạy đều, bạn sẽ thấy camera chỉ dẫn trước nhân vật khoảng nửa unit chứ không phải 3. Mình đo khi chạy ở 9 unit/giây, camera dẫn trước đúng 0.51:

![Đồ thị x theo thời gian của nhân vật và camera khi chạy ngang phòng: camera đứng ở biên trái lúc đầu, dẫn trước nhân vật 0.51 khi chạy đều, rồi dừng ở biên phải 47.65](/images/posts/unity-platformer/05/run-camx.webp)

3 unit đó bị ăn bởi hai thứ. Dead zone lấy đi 1.5 (camera chỉ đuổi phần vượt ra khỏi hộp). Và `SmoothDamp` đuổi một mục tiêu đang chạy đều thì luôn trễ sau nó một khoảng xấp xỉ vận tốc nhân `smoothTime`, ở đây 9 × 0.12 ≈ 1.1. Còn lại khoảng nửa unit.

Đây không phải lỗi. Look-ahead thể hiện rõ nhất khi bạn dừng lại rồi quay đầu: camera lướt 3 unit sang bên kia để mở tầm nhìn về hướng mới. Muốn camera dẫn xa hơn khi chạy thì tăng Look Ahead hoặc giảm Smooth Time X, đổi lại camera sẽ động nhiều hơn.

## Luật trục dọc: nhảy tại chỗ camera không động

Khối số 3 là lý do đường xanh ở đầu bài phẳng lì. Camera không theo độ cao hiện tại của nhân vật mà theo `lastGroundedY`, độ cao lần cuối nhân vật đứng trên đất (hoặc đang trượt tường). Đang bay thì `lastGroundedY` không đổi, camera đứng yên. Nhảy lên một bệ cao hơn thì lúc đáp xuống, `lastGroundedY` cập nhật và camera mới lên theo.

Có một ngoại lệ: nhân vật đang rơi xuống một vực sâu thì không thể chờ nó chạm đất, nó sẽ ra khỏi màn hình trước. Nên nếu điểm ngắm cách tâm camera quá `airborneFollowFraction × nửa chiều cao` (0.6 × 9 = 5.4 unit), camera theo luôn.

Thử: bỏ tick **Snap To Platforms** và nhảy tại chỗ. Camera lại nhấp nhô theo cú nhảy (vẫn mềm hơn bước 2 nhờ dead zone và SmoothDamp). Bật lại.

## Clamp vào phòng, và thứ tự clamp

Khối số 4 kẹp camera để khung nhìn không ra khỏi `Room`. Nửa khung nhìn là 16 × 9 unit, cộng thêm `shakeMargin = 0.35`, nên tâm camera chỉ được đi trong khoảng x từ 16.35 tới 47.65 và y từ 9.35 tới 26.65. Phần 0.35 để dành cho bài 13: rung màn hình với biên độ tối đa 0.35 vẫn không lộ ra ngoài phòng. `HalfWidth` tính từ `cam.aspect`, nên Game view phải đúng tỉ lệ 16:9 như bài 0 đã đặt.

Cách viết hay gặp nhất cho đoạn này là smooth về điểm ngắm trước, rồi kẹp kết quả:

```csharp
var next = SmoothDamp(pos, aim);   // aim có thể nằm ngoài phòng
transform.position = Clamp(next);
```

Nghe hợp lý, nhưng hãy xem điều gì xảy ra khi nhân vật đi khỏi mép bệ 3 và rơi xuống sàn. Điểm ngắm lúc chạm sàn ở y ≈ 2.9, nằm dưới biên đáy 9.35 của camera. `SmoothDamp` không biết có biên, nó tăng tốc lao về 2.9 như thể đích ở đó, và clamp chặt đứt chuyển động ở 9.35:

![Đồ thị y theo thời gian: bản smooth rồi mới clamp lao xuống nhanh rồi khựng lại ở 9.35, bản clamp đích rồi mới smooth chậm dần và đáp êm vào 9.35](/images/posts/unity-platformer/05/clamp-order.webp)

Đường đỏ chạm biên với tốc độ khoảng 41 unit/giây rồi dừng khựng trong một frame. Trên màn hình, cú dừng đó trông như camera va vào một bức tường vô hình.

Cách sửa là kẹp điểm ngắm trước, để `SmoothDamp` đuổi theo một điểm camera thật sự tới được:

```csharp
DesiredCentre = Clamp(new Vector2(aimX, aimY));   // đích đã nằm trong phòng
var next = SmoothDamp(pos, DesiredCentre);
var clamped = Clamp(next);                        // vẫn kẹp lần cuối cho chắc
```

Đường xanh giảm tốc dần và đáp êm vào 9.35, tốc độ lớn nhất chỉ 25.6 unit/giây. Clamp vẫn là thứ ghi cuối cùng, nên camera không bao giờ ra khỏi phòng, nhưng giờ nó chỉ là lưới an toàn chứ không phải thứ quyết định chuyển động.

Hai dòng `if (ClampedX) velocity.x = 0f;` cũng quan trọng. Khi camera đứng ở biên mà nhân vật vẫn đi sâu về phía tường, `SmoothDamp` vẫn tích luỹ vận tốc về phía đó dù camera không nhúc nhích được. Không đặt lại về 0, lúc nhân vật quay đầu camera sẽ phải xả hết vận tốc tích luỹ đó trước, nhìn như bị trễ một nhịp rồi mới giật đi.

## SnapTo: bắt đầu đúng chỗ

`OnEnable` gọi `SnapTo` để camera đứng sẵn ở đúng chỗ nó sẽ tới ngay frame đầu tiên, kể cả phần look-ahead. Không có nó, camera bắt đầu ở vị trí đặt tay trong scene rồi lướt tới nhân vật, và mỗi lần vào game người chơi thấy một cú lia máy không cần thiết. Bài 8 hồi sinh nhân vật ở checkpoint cũng sẽ gọi đúng hàm này.

## Kiểm tra

Bấm Play:

- Lúc bắt đầu, camera đứng ở góc dưới trái phòng, Transform của `CameraRoot` là `(16.35, 9.35)`. Tường trái nằm sát mép trái màn hình.
- Bước qua bước lại trong khoảng ba ô: màn hình không trôi.
- Chạy sang phải: camera bắt đầu đi khi nhân vật tới khoảng x = 15, và dừng ở x = 47.65 khi nhân vật tới cột của khe. Không thấy khoảng tối nào ngoài phòng.
- Nhảy tại chỗ ở bất kỳ đâu: camera không lên xuống.
- Nhảy lên bệ 1: sau khi đáp, camera nâng lên theo.
- Từ bệ 3 đi ra khỏi mép rơi xuống sàn: camera hạ xuống và dừng êm ở đáy phòng.

## Bài sau

Nhân vật chạy nhảy được trong một căn phòng có camera tử tế, nhưng vẫn đứng im một tư thế. Bài 6 cắt các sheet còn lại thành frame và cho animation tự chọn theo trạng thái vật lý của nhân vật, không phải theo phím người chơi bấm.
