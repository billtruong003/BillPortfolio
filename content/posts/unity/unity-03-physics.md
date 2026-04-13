---
title: "Unity Cho Người Mới #3: Physics — Rigidbody, Collider & Raycast"
date: "2024-11-11"
excerpt: "Hệ thống vật lý của Unity: Rigidbody cho trọng lực và lực, Collider cho va chạm, Trigger cho vùng phát hiện, và Raycast cho tia bắn."
coverImage: "/images/posts/unity-fundamental.png"
category: "unity-dev"
tags: ["Unity", "Physics", "Game Development", "Tutorial"]
published: true
featured: false
---

## Physics Engine của Unity

Unity dùng **PhysX** (NVIDIA) cho 3D physics và **Box2D** cho 2D. Engine tự xử lý trọng lực, va chạm, lực — bạn chỉ cần gắn đúng components.

**Quy tắc vàng:** Physics code đặt trong `FixedUpdate()`, không phải `Update()`. FixedUpdate chạy ở tốc độ cố định (mặc định 50 lần/giây), phù hợp cho physics calculations.

## Rigidbody — Cho phép vật lý tác động

Thêm Rigidbody = object bị chi phối bởi gravity, forces, collisions.

### Setup

Chọn object → Add Component → **Rigidbody**

| Property | Ý nghĩa |
|----------|---------|
| Mass | Khối lượng (kg) — ảnh hưởng lực va chạm |
| Drag | Ma sát không khí — càng cao càng chậm |
| Angular Drag | Ma sát xoay |
| Use Gravity | Có chịu trọng lực không |
| Is Kinematic | True = không bị physics engine điều khiển, dùng code di chuyển |
| Constraints | Khóa trục position/rotation |

### Di chuyển bằng Rigidbody

```csharp
public class RigidbodyMovement : MonoBehaviour
{
    [SerializeField] private float moveForce = 10f;
    [SerializeField] private float jumpForce = 8f;
    private Rigidbody rb;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate()  // KHÔNG phải Update!
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        Vector3 movement = new Vector3(h, 0, v) * moveForce;
        rb.AddForce(movement);
    }

    void Update()
    {
        // Input vẫn đọc trong Update
        if (Input.GetKeyDown(KeyCode.Space))
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }
}
```

### ForceMode

| Mode | Mô tả | Ví dụ |
|------|--------|-------|
| `Force` | Lực liên tục (tính mass) | Đẩy xe |
| `Acceleration` | Gia tốc (bỏ qua mass) | Wind |
| `Impulse` | Lực tức thì (tính mass) | Nhảy, nổ |
| `VelocityChange` | Thay đổi vận tốc trực tiếp | Dash |

```csharp
// Nhảy
rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);

// Dash nhanh
rb.AddForce(transform.forward * dashForce, ForceMode.VelocityChange);

// Đặt velocity trực tiếp (cẩn thận — override physics)
rb.velocity = new Vector3(rb.velocity.x, 0, rb.velocity.z);  // reset vertical
```

## Collider — Vùng va chạm

Collider xác định "hình dạng" vật lý của object. Không có Collider = không va chạm.

### Các loại Collider

| Collider | Hình dạng | Performance | Use case |
|----------|----------|-------------|----------|
| **Box** | Hộp | Nhanh nhất | Tường, sàn, crate |
| **Sphere** | Cầu | Rất nhanh | Đạn, coin, vùng phát hiện |
| **Capsule** | Viên nang | Nhanh | Nhân vật, NPC |
| **Mesh** | Theo mesh thật | Chậm | Terrain phức tạp (dùng ít) |

**Tip:** Mesh Collider rất chậm. Hầu hết trường hợp, dùng nhiều primitive colliders ghép lại sẽ tốt hơn.

### Va chạm xảy ra khi nào?

Để 2 objects va chạm, cần thỏa:
1. **Cả 2** đều có Collider
2. **Ít nhất 1** có Rigidbody
3. Cả 2 Collider **không** phải trigger

## Collision Events — Xử lý va chạm

```csharp
public class PlayerCollision : MonoBehaviour
{
    // Khi BẮT ĐẦU va chạm
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log($"Va chạm với: {collision.gameObject.name}");

        // Kiểm tra tag
        if (collision.gameObject.CompareTag("Enemy"))
        {
            TakeDamage(10);
        }

        // Thông tin va chạm
        ContactPoint contact = collision.contacts[0];
        Debug.Log($"Điểm va chạm: {contact.point}");
        Debug.Log($"Lực va chạm: {collision.relativeVelocity.magnitude}");
    }

    // ĐANG va chạm (mỗi physics frame)
    void OnCollisionStay(Collision collision)
    {
        // Ví dụ: damage liên tục khi đứng trên lava
    }

    // Khi KẾT THÚC va chạm
    void OnCollisionExit(Collision collision)
    {
        Debug.Log($"Rời khỏi: {collision.gameObject.name}");
    }
}
```

## Trigger — Vùng phát hiện (không chặn)

Trigger = Collider nhưng **không chặn** object đi qua. Dùng cho: vùng thu thập item, cửa tự động, detection zone.

### Setup

Chọn Collider → tick **Is Trigger** ✓

### Trigger Events

```csharp
public class Collectible : MonoBehaviour
{
    [SerializeField] private int points = 100;

    // Object ĐI VÀO vùng trigger
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Debug.Log($"+{points} points!");
            // Thêm điểm cho player
            other.GetComponent<ScoreManager>()?.AddScore(points);
            Destroy(gameObject);
        }
    }
}
```

```csharp
public class DamageZone : MonoBehaviour
{
    [SerializeField] private int damagePerSecond = 10;

    // Object ĐANG Ở TRONG vùng trigger
    void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            var health = other.GetComponent<PlayerHealth>();
            health?.TakeDamage(damagePerSecond * Time.fixedDeltaTime);
        }
    }
}
```

### Collision vs Trigger

![Collision vs Trigger](/images/posts/diagrams/collision-vs-trigger.svg)

| | Collision | Trigger |
|--|----------|---------|
| Chặn di chuyển | Có | Không |
| Event methods | OnCollision... | OnTrigger... |
| Parameter | `Collision` (nhiều info) | `Collider` (chỉ collider) |
| Use case | Tường, sàn, vật cản | Pickup, zone, sensor |

## Layer & Tag — Phân loại objects

### Tag

Tag dùng để **nhận diện** object: "Player", "Enemy", "Bullet".

```csharp
if (other.CompareTag("Player"))  // Dùng CompareTag, KHÔNG dùng other.tag ==
{
    // xử lý
}
```

Tạo tag: object Inspector → Tag dropdown → Add Tag.

### Layer

Layer dùng để **kiểm soát tương tác**: physics, rendering, raycast.

Ví dụ thực tế: đạn player không nên va chạm với player.
- Player ở layer "Player"
- Player bullets ở layer "PlayerBullet"
- **Edit > Project Settings > Physics** → bỏ tick giao nhau giữa "Player" và "PlayerBullet"

## Raycast — Tia phát hiện

Raycast bắn 1 tia vô hình từ điểm A theo hướng B, kiểm tra tia đó chạm object nào.

![Raycast & SphereCast](/images/posts/diagrams/raycast-diagram.svg)

### Cú pháp cơ bản

```csharp
void Update()
{
    // Bắn tia từ vị trí player, về phía trước, tối đa 50 units
    if (Physics.Raycast(transform.position, transform.forward, out RaycastHit hit, 50f))
    {
        Debug.Log($"Chạm: {hit.collider.name}");
        Debug.Log($"Khoảng cách: {hit.distance}");
        Debug.Log($"Điểm chạm: {hit.point}");
        Debug.Log($"Normal: {hit.normal}");
    }
}
```

### Ứng dụng: Ground Check

```csharp
public class GroundCheck : MonoBehaviour
{
    [SerializeField] private float groundDistance = 0.2f;
    [SerializeField] private LayerMask groundLayer;

    public bool IsGrounded()
    {
        // Bắn tia xuống dưới từ chân nhân vật
        return Physics.Raycast(
            transform.position,
            Vector3.down,
            groundDistance,
            groundLayer
        );
    }
}
```

### Ứng dụng: Shooting / Hitscan

```csharp
public class Gun : MonoBehaviour
{
    [SerializeField] private float range = 100f;
    [SerializeField] private int damage = 25;
    [SerializeField] private LayerMask hitLayers;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
            Shoot();
    }

    void Shoot()
    {
        // Tia từ giữa màn hình
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);

        if (Physics.Raycast(ray, out RaycastHit hit, range, hitLayers))
        {
            Debug.Log($"Bắn trúng: {hit.collider.name} tại {hit.point}");

            // Gây damage nếu target có component Health
            var health = hit.collider.GetComponent<Health>();
            health?.TakeDamage(damage);

            // Debug: vẽ đường tia trong Scene view
            Debug.DrawLine(ray.origin, hit.point, Color.red, 1f);
        }
    }
}
```

### SphereCast & BoxCast — Tia "béo"

```csharp
// SphereCast: tia hình cầu, tốt cho melee detection
if (Physics.SphereCast(transform.position, 0.5f, transform.forward, out RaycastHit hit, 3f))
{
    Debug.Log($"Melee hit: {hit.collider.name}");
}
```

### RaycastAll — Xuyên qua nhiều objects

```csharp
RaycastHit[] hits = Physics.RaycastAll(origin, direction, maxDistance);
foreach (RaycastHit hit in hits)
{
    Debug.Log($"Xuyên qua: {hit.collider.name}");
}
```

## Ví Dụ Tổng Hợp: 3D Character Controller

```csharp
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class CharacterPhysics : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 6f;
    [SerializeField] private float jumpForce = 8f;

    [Header("Ground Check")]
    [SerializeField] private float groundCheckDistance = 0.3f;
    [SerializeField] private LayerMask groundLayer;

    private Rigidbody rb;
    private bool isGrounded;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;  // không bị xoay khi va chạm
    }

    void Update()
    {
        // Ground check
        isGrounded = Physics.Raycast(
            transform.position, Vector3.down,
            groundCheckDistance, groundLayer);

        // Jump input
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }

    void FixedUpdate()
    {
        // Movement
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        Vector3 targetVelocity = new Vector3(h * moveSpeed, rb.velocity.y, v * moveSpeed);
        rb.velocity = targetVelocity;
    }

    // Va chạm với enemy
    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Enemy"))
        {
            // Đẩy lùi
            Vector3 knockback = (transform.position - collision.transform.position).normalized;
            rb.AddForce(knockback * 5f, ForceMode.Impulse);
        }
    }

    // Nhặt item
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Pickup"))
        {
            Debug.Log($"Nhặt: {other.name}");
            Destroy(other.gameObject);
        }
    }

    // Debug visualization
    void OnDrawGizmos()
    {
        Gizmos.color = isGrounded ? Color.green : Color.red;
        Gizmos.DrawLine(transform.position,
            transform.position + Vector3.down * groundCheckDistance);
    }
}
```

## Bài Tập

**Bài 1: Bowling**
Tạo 10 pin (Cylinder + Rigidbody), 1 bóng (Sphere + Rigidbody). Click để bắn bóng về phía pins bằng `AddForce`. Đếm pins bị đổ (kiểm tra rotation).

**Bài 2: Trigger Zones**
Tạo 3 vùng trigger: Speed Boost (tăng tốc 2x), Damage Zone (giảm HP), Heal Zone (hồi HP). Player đi qua sẽ nhận effect. Dùng màu khác nhau để phân biệt.

**Bài 3: Turret Raycast**
Tạo turret tự động. Dùng SphereCast để phát hiện enemy trong range. Khi phát hiện, xoay về phía enemy và "bắn" (Raycast + Debug.DrawLine). Gây damage khi raycast hit.

---

**Bài trước:** [Unity #2: Scripting](/lab/unity-02-scripting)
**Bài tiếp:** [Unity #4: UI — Canvas, Layout & Event System](/lab/unity-04-ui)
