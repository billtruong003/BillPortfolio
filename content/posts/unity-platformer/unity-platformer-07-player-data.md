---
title: "Platformer #7: Ba nhân vật, ba cảm giác, một prefab"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 7
excerpt: "Tách 19 con số cảm giác điều khiển ra khỏi motor thành một ScriptableObject. Ba asset cho ba nhân vật: một chạy nhanh nhảy cao, một nặng trượt dài không có double jump. Đổi asset là đổi cả hình lẫn tay cầm."
coverImage: "/images/posts/unity-platformer/07/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "ScriptableObject", "Tutorial"]
published: true
featured: false
---

Bộ art có ba nhân vật. Cách đơn giản nhất là đổi sprite và giữ nguyên mọi thứ khác, nhưng như vậy ba nhân vật chỉ khác nhau về hình. Bài này làm cho chúng khác nhau về cảm giác điều khiển: một nhân vật nhẹ chạy nhanh nhảy cao, một nhân vật nặng chạy chậm, trượt dài, nhảy thấp và không có double jump.

![Ba nhân vật đứng cạnh nhau trong game: Cân bằng, Nhẹ, Nặng](/images/posts/unity-platformer/07/three-chars.webp)

## Vì sao không để số trong motor

Mọi con số cảm giác đang nằm trong Inspector của `PlayerMotor` trên object `Player`. Muốn có ba nhân vật thì cách đầu tiên nghĩ ra là ba object Player, mỗi object một bộ số. Nhưng nhân vật không chỉ xuất hiện ở một scene. Bài 15 có ba màn chơi, mỗi màn một Player. Ba nhân vật nhân ba màn là chín bộ số phải giữ khớp nhau bằng tay, và chỉnh độ cao nhảy của nhân vật Nhẹ nghĩa là đi sửa ba chỗ.

Cách tách quen thuộc trong Unity là ScriptableObject: một loại asset nằm trong Project window, chứa dữ liệu, và nhiều object cùng trỏ vào nó được. Mỗi nhân vật là một asset. Player chỉ giữ một ô trỏ tới asset của nhân vật đang chơi.

Bạn nào đọc series shmup sẽ nhận ra pattern ở bài shmup 6: asset dữ liệu cộng hàm `Apply` gọi trong `OnEnable`. Khác ở chỗ bên đó dữ liệu là chỉ số (máu, tốc độ bay), còn ở đây dữ liệu là cảm giác. Đổi `decelTime` từ 0.08 lên 0.15 không làm nhân vật mạnh hay yếu hơn, nó làm nhân vật trượt lâu hơn khi bạn thả tay.

## PlayerData

Tạo `Assets/_Platformer/Scripts/Player/PlayerData.cs`:

```csharp
using UnityEngine;

namespace Platformer.Player
{
    [CreateAssetMenu(menuName = "Platformer/Player Data", fileName = "Player_New")]
    public sealed class PlayerData : ScriptableObject
    {
        [Header("Look")]
        public string displayName = "Runner";
        public RuntimeAnimatorController animator;
        public Sprite portrait;

        [Header("Run")]
        [Min(0f)] public float moveSpeed = 9f;
        [Min(0.01f)] public float accelTime = 0.12f;
        [Min(0.01f)] public float decelTime = 0.08f;
        [Range(0f, 1f)] public float airControl = 0.7f;

        [Header("Jump (design numbers)")]
        [Min(0.1f)] public float jumpHeight = 5.5f;
        [Min(0.05f)] public float timeToApex = 0.4f;
        [Min(1f)] public float fallGravityMultiplier = 1.6f;
        [Range(0f, 1f)] public float jumpCutMultiplier = 0.4f;
        [Min(0f)] public float maxFallSpeed = 32f;

        [Header("Air jumps")]
        [Range(1, 3)] public int maxJumps = 2;
        [Range(0.2f, 1.5f)] public float airJumpHeightScale = 0.85f;

        [Header("Wall")]
        public bool canWallJump = true;
        [Min(0f)] public float wallSlideSpeed = 4f;
        [Range(0.2f, 1.5f)] public float wallJumpHeightScale = 0.9f;
        [Min(0f)] public float wallJumpPush = 10f;
        [Min(0f)] public float wallJumpLock = 0.15f;

        [Header("Forgiveness")]
        [Min(0f)] public float coyoteTime = 0.1f;
        [Min(0f)] public float jumpBufferTime = 0.1f;
        [Min(0f)] public float wallCoyoteTime = 0.1f;

        public float Gravity => 2f * jumpHeight / (timeToApex * timeToApex);
        public float JumpVelocity => Gravity * timeToApex;
    }
}
```

Nhóm **Look** là phần nhìn: tên hiển thị, controller animation, và một sprite chân dung mà màn chọn nhân vật ở bài 15 sẽ dùng. Các nhóm còn lại là đúng 19 con số cảm giác từ bài 2 tới bài 4, cùng tên, cùng giá trị mặc định. Riêng kích thước các hộp dò đất và tường thì không đưa vào: chúng phụ thuộc collider, mà cả ba nhân vật dùng chung một collider.

`[CreateAssetMenu]` thêm một dòng vào menu Create của Project window. `Gravity` và `JumpVelocity` là property tính từ hai số thiết kế, giống hệt trong motor. Inspector không hiện property nên bạn sẽ không thấy chúng trong ảnh dưới, nhưng code khác (và bạn, khi debug) đọc được.

## Tạo ba asset

Tạo thư mục `Assets/_Platformer/ScriptableObjects/Players`. Chuột phải vào nó, chọn **Create > Platformer > Player Data**, đặt tên `Player_Balanced`. Làm thêm hai lần cho `Player_Light` và `Player_Heavy`.

![Project window: thư mục ScriptableObjects/Players chứa Player_Balanced, Player_Heavy, Player_Light](/images/posts/unity-platformer/07/project-players.webp)

Chọn từng asset và điền số. `Player_Balanced` giữ nguyên mặc định (chính là nhân vật từ bài 2 tới giờ). Hai asset kia điền theo bảng. Ô nào không có trong bảng thì để mặc định.

| Nhóm | Số | Cân bằng | Nhẹ | Nặng | Với tay người chơi |
|---|---|---|---|---|---|
| Look | Display Name | Cân bằng | Nhẹ | Nặng | tên hiện ở màn chọn |
| Run | Move Speed | 9 | 10.5 | 7.5 | tốc độ tối đa |
| | Accel / Decel Time | 0.12 / 0.08 | 0.08 / 0.06 | 0.20 / 0.15 | Nặng khởi động chậm, dừng chậm |
| | Air Control | 0.7 | 0.9 | 0.5 | đổi hướng giữa không trung dễ hay khó |
| Jump | Jump Height / Time To Apex | 5.5 / 0.4 | 6.5 / 0.42 | 4.5 / 0.33 | cao bao nhiêu, lên đỉnh nhanh hay chậm |
| | Fall Gravity Multiplier | 1.6 | 1.4 | 2.0 | rơi nhanh hơn lên bao nhiêu lần |
| | Jump Cut Multiplier | 0.4 | 0.35 | 0.5 | nhả sớm thì cú nhảy mất bao nhiêu đà |
| | Max Fall Speed | 32 | 30 | 36 | tốc độ rơi tối đa |
| Air jumps | Max Jumps | 2 | 2 | **1** | Nặng không có double jump |
| | Air Jump Height Scale | 0.85 | 1.0 | 0.85 | cú thứ hai cao bằng mấy phần cú đầu |
| Wall | Wall Slide Speed | 4 | 8 | 2.5 | Nhẹ bám tường kém, Nặng bám tốt |
| | Wall Jump Height Scale | 0.9 | 0.8 | 1.0 | cú bật tường cao bao nhiêu |
| | Wall Jump Push / Lock | 10 / 0.15 | 8 / 0.12 | 12 / 0.20 | lực hất ra khỏi tường, thời gian khoá hướng |
| Forgiveness | Coyote / Buffer / Wall Coyote | 0.1 / 0.1 / 0.1 | 0.12 / 0.12 / 0.08 | 0.08 / 0.1 / 0.12 | mức tha thứ khi bấm sớm, bấm muộn |

Ô **Animator** kéo controller tương ứng vào, và ô **Portrait** kéo sprite `Idle_0` của nhân vật đó. Đây là `Player_Heavy` sau khi điền:

![Inspector của Player_Heavy: Display Name Nặng, Animator Player_Char3, Move Speed 7.5, Accel 0.2, Decel 0.15, Air Control 0.5, Jump Height 4.5, Time To Apex 0.33, Fall Gravity Multiplier 2, Max Jumps 1, Wall Slide Speed 2.5, Wall Jump Push 12, Wall Jump Lock 0.2](/images/posts/unity-platformer/07/playerdata-heavy.webp)

Trọng lực suy ra từ hai số thiết kế cũng khác nhau: Cân bằng 68.75, Nhẹ 73.70, Nặng 82.64 unit/s². Nặng không chỉ nhảy thấp, nó còn bị kéo xuống mạnh nhất, cộng với hệ số rơi 2.0 thì cú nhảy của nó kết thúc nhanh và dứt khoát.

### Controller cho Char2 và Char3

Ô Animator của `Player_Light` và `Player_Heavy` cần controller của nhân vật 2 và 3. Làm lại các bước của bài 6 cho thư mục `Player/Char2` và `Player/Char3`: cắt năm sheet nhiều frame với pivot Bottom Center, rồi tạo bảy clip trong thư mục `Animation/Player/Char2` (và `Char3`).

Để các clip mới rơi vào controller mới mà không lẫn vào `Player_Char1`:

1. Chuột phải vào thư mục `Animation/Player/Char2`, chọn **Create > Animation > Animator Controller**, đặt tên `Player_Char2`.
2. Chọn `Player`, kéo `Player_Char2` vào ô **Controller** của component Animator.
3. Mở cửa sổ Animation và tạo bảy clip bằng **Create New Clip** như bài 6, lần này kéo sprite của Char2. Unity thêm chúng vào `Player_Char2`.
4. Làm tương tự cho Char3, rồi trả ô Controller về `Player_Char1`.

Tên clip phải giống hệt bên Char1: `Idle`, `Run`, `Jump`, `Fall`, `Double_Jump`, `Wall_Jump`, `Hit`. `PlayerAnimator` gọi `Animator.Play` theo tên state, và Unity đặt tên state theo tên clip. Một state tên `Run2` sẽ không bao giờ được phát.

Bước 4 thật ra không bắt buộc, vì lát nữa `PlayerAnimator` sẽ tự đặt controller từ asset lúc game chạy. Trả về cho gọn để Scene view hiện đúng nhân vật mặc định.

## PlayerMotor đọc từ asset

Thêm vào `PlayerMotor.cs` một ô trỏ tới asset, ngay trên nhóm Input:

```csharp
[Header("Character")]
[SerializeField] private PlayerData data;
```

Một property cho script khác đọc, đặt cạnh các property trạng thái:

```csharp
public PlayerData Data => data;
```

Và thay `OnEnable` bằng bản gọi `Apply`, kèm hàm `Apply` chép số từ asset vào các field của motor:

```csharp
private void OnEnable()
{
    moveAction.Enable(); jumpAction.Enable();
    if (data != null) Apply(data);
}

public void Apply(PlayerData d)
{
    data = d;
    moveSpeed = d.moveSpeed; accelTime = d.accelTime; decelTime = d.decelTime; airControl = d.airControl;
    jumpHeight = d.jumpHeight; timeToApex = d.timeToApex; fallGravityMultiplier = d.fallGravityMultiplier;
    jumpCutMultiplier = d.jumpCutMultiplier; maxFallSpeed = d.maxFallSpeed;
    maxJumps = d.maxJumps; airJumpHeightScale = d.airJumpHeightScale;
    canWallJump = d.canWallJump; wallSlideSpeed = d.wallSlideSpeed; wallJumpHeightScale = d.wallJumpHeightScale;
    wallJumpPush = d.wallJumpPush; wallJumpLock = d.wallJumpLock; wallCoyoteTime = d.wallCoyoteTime;
    coyoteTime = d.coyoteTime; jumpBufferTime = d.jumpBufferTime;
}
```

Các field serialized của motor vẫn giữ nguyên. Khi ô Data để trống, motor chạy bằng chính các số trong Inspector như bài 4, tiện cho một scene thử nhanh. Khi có Data, `Apply` ghi đè chúng lúc object bật lên.

Có một cách khác là cho motor đọc thẳng `data.moveSpeed` ở mỗi chỗ dùng, khỏi phải chép. Mình giữ cách chép vì hai lý do: motor vẫn chạy được khi không có asset, và các con số chỉ đổi đúng lúc gọi `Apply`, không đổi giữa chừng một cú nhảy nếu ai đó sửa asset trong lúc đang Play. Cái giá là 19 dòng chép, và mỗi khi thêm một số cảm giác mới bạn phải nhớ thêm vào cả ba chỗ: `PlayerData`, field của motor, và `Apply`.

## PlayerAnimator lấy controller từ asset

Trong `PlayerAnimator.cs`, thêm hàm `ApplyData` và gọi nó trong `Awake`:

```csharp
private void Awake()
{
    animator = GetComponent<Animator>();
    sprite = GetComponent<SpriteRenderer>();
    motor = GetComponent<PlayerMotor>();
    ApplyData();
    animator.Play(IdleHash);
}

public void ApplyData()
{
    var d = motor != null ? motor.Data : null;
    if (d != null && d.animator != null && animator.runtimeAnimatorController != d.animator)
    {
        animator.runtimeAnimatorController = d.animator;
        Current = State.Idle;
        animator.Play(IdleHash, 0, 0f);
    }
}
```

Đổi controller xong thì đặt `Current` về Idle và phát Idle, để `LateUpdate` frame sau suy lại trạng thái từ đầu thay vì tưởng controller mới đang ở đúng clip cũ.

## Gắn asset vào Player

Chọn `Player`, kéo `Player_Balanced` vào ô **Data** mới ở đầu component Player Motor:

![Inspector Player Motor: nhóm Character với Data là Player_Balanced, bên dưới là các field Run, Jump như cũ](/images/posts/unity-platformer/07/motor-data-field.webp)

Ô Data phải ghi tên asset. Nếu nó ghi `None (Player Data)` thì nhân vật vẫn chạy bằng số trong Inspector, và bạn sẽ đổi asset mãi mà không thấy gì khác. Đó là thứ đầu tiên cần kiểm khi đổi nhân vật mà cảm giác vẫn y nguyên.

## Một prefab cho mọi màn

Kéo `Player` từ Hierarchy thả vào `Assets/_Platformer/Prefabs`. Unity tạo prefab `Player`, và object trong scene chuyển sang biểu tượng màu xanh:

![Hierarchy: Player có biểu tượng xanh của prefab](/images/posts/unity-platformer/07/hierarchy-prefab.webp)

![Inspector: dòng Prefab Player với các nút Overrides, Select, Open](/images/posts/unity-platformer/07/prefab-inspector.webp)

Từ giờ mỗi màn chơi chỉ cần kéo prefab này vào. Collider, Rigidbody, motor, animator đều nằm trong prefab, sửa một chỗ là mọi màn cùng đổi. Nhân vật nào được chơi thì do ô Data quyết định: prefab trỏ `Player_Balanced` làm mặc định, và bài 15 sẽ đổi nó lúc runtime theo lựa chọn của người chơi.

## Ba nhân vật trên cùng một kịch bản

Đổi ô Data sang `Player_Light` rồi bấm Play, nhân vật đổi cả hình lẫn cảm giác. Để so cho công bằng, mình cho cả ba nhân vật chạy cùng một kịch bản: chạy một giây, thả phím, đứng yên, rồi nhảy giữ phím hết cỡ.

![Hai đồ thị: vận tốc sau khi thả phím, Nặng giảm chậm nhất trượt 0.49; độ cao cú nhảy, Nhẹ 6.19, Cân bằng 5.23, Nặng 4.23](/images/posts/unity-platformer/07/three-chars-graphs.webp)

| | Cân bằng | Nhẹ | Nặng |
|---|---|---|---|
| Tốc độ tối đa | 9.00 | 10.50 | 7.50 |
| Trượt sau khi thả | 0.27 u trong 0.08 s | 0.21 u trong 0.06 s | 0.49 u trong 0.16 s |
| Độ cao nhảy | 5.23 | 6.19 | 4.23 |
| Thời gian trên không | 0.72 s | 0.78 s | 0.56 s |

Chưa cần chơi, đọc bảng cũng đoán được tính cách. Nặng chạy chậm nhất mà lại trượt xa nhất, gần gấp đôi Cân bằng, vì giảm tốc chậm. Nhảy thấp nhất và ở trên không ngắn nhất, cú nhảy gọn và nặng. Nhẹ nhảy cao nhất, lâu nhất, và dừng gắt nhất.

Độ cao đo được đều thấp hơn số thiết kế đúng nửa bước vật lý như bài 3 đã giải thích: Nhẹ thiết kế 6.5, đo 6.19; Nặng thiết kế 4.5, đo 4.23.

## Ba cách qua cùng một căn phòng

`maxJumps = 1` của nhân vật Nặng là quyết định lớn nhất trong bảng. Mất double jump nghĩa là nó không cứu được một cú nhảy hụt. Bù lại, nó bám tường tốt nhất (trượt chỉ 2.5 unit/giây) và bật tường mạnh nhất (hất ra 12 unit/giây, khoá hướng 0.2 giây), nên cái khe ở cuối phòng lại là chỗ nó leo dễ nhất.

Nhẹ thì ngược lại: bám tường kém (trượt 8 unit/giây, gấp đôi Cân bằng) nhưng có double jump cao bằng cú đầu và nhảy cao hơn hẳn. Nó qua các bệ bằng cách nhảy, không cần tới tường.

Ba bộ số không phải để nhân vật khác nhau cho vui. Mỗi bộ gợi ý một cách chơi riêng trong cùng một căn phòng, và người chơi đổi nhân vật là đổi cách giải màn.

## Đổi nhân vật trong lúc chơi

Hai hàm `motor.Apply(data)` và `animator.ApplyData()` gọi được bất cứ lúc nào, không cần load lại scene:

```csharp
motor.Apply(lightData);
playerAnimator.ApplyData();
```

`Apply` đổi toàn bộ số cảm giác ngay bước vật lý tiếp theo, `ApplyData` đổi controller và bắt đầu lại từ Idle. Màn chọn nhân vật ở bài 15 dùng đúng hai dòng này.

## Kiểm tra

- Chọn Player, ô Data ghi `Player_Balanced`. Bấm Play, mọi thứ chạy như cuối bài 6.
- Thoát Play, đổi Data sang `Player_Light`, bấm Play: nhân vật màu vàng, chạy nhanh hơn, nhảy cao hơn hẳn bệ 1.
- Đổi sang `Player_Heavy`: con cáo, chạy chậm, thả phím trượt rõ ràng, và bấm nhảy lần hai trên không không có tác dụng gì. Đứng sát bệ 1 nhảy sẽ không lên tới: 4.23 thấp hơn 5.
- Với Nặng, vào khe và leo bằng bật tường: nhân vật trượt tường rất chậm và bật ra xa. Đây là chỗ nhân vật này mạnh nhất.

## Bài sau

Nhân vật đã có hình, có tính cách, nhưng chưa có gì làm nó chết. Bài 8 thêm bẫy, cách chết và hồi sinh ở checkpoint mà không phải load lại scene, cùng hai chỗ dễ sai: collider bẫy đặt theo mắt, và lá cờ biến thành vòng lặp chết.
