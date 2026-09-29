---
title: "Platformer #16: Những lỗi không hiện trong Console, và ba công cụ để bắt chúng"
date: "2026-09-29"
lang: vi
series: "platformer"
order: 16
excerpt: "Một script soát cả 18 scene in ra CLEAN. Người đầu tiên mở game lên chơi không qua nổi màn 1. Bài cuối không phải danh sách lỗi đã sửa mà là cách soát: đọc alpha thật của sprite, hỏi thẳng bảng va chạm, và chơi bằng input thật thay vì gọi API. Và bảy lỗi nữa mình tìm ra khi viết lại cả series."
coverImage: "/images/posts/unity-platformer/16/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Platformer", "Testing", "Debugging", "Tutorial"]
published: true
featured: false
---

Sau khi build xong ba màn, mình viết một script soát toàn bộ 18 scene của project: pivot có ở chân không, collider có đúng kích thước không, sorting layer có đúng không, object có nằm đúng cao độ mặt sàn không. Nó in ra một dòng:

```
CLEAN across all 18 scenes
```

Rồi có người mở game lên chơi và báo lại: thùng gỗ với lá cờ hỏng, nhặt ngọc thì được, nhưng không có cách nào qua màn.

Họ đúng. Script của mình soát hình học, và về hình học thì nó đúng. Nó không soát luật chơi. Và trong suốt mười mấy bước dựng, chưa một lần mình cho nhân vật đi bộ từ chỗ spawn tới cửa thoát. Mọi bài test trước đó đều gọi `room.Complete()` hay `gem.Take()` thẳng từ code. Game chỉ từng được chứng minh qua API của nó, chưa bao giờ qua con đường người chơi thật sự đi.

Bài cuối này không phải danh sách lỗi đã sửa: mỗi lỗi đã được sửa trong đúng bài sở hữu hành vi đó (bảng va chạm ở bài 9, collider boss ở bài 12, và vân vân). Bài này về cách soát. Một bài test chỉ chứng minh được đúng những gì nó đo, nên muốn bắt một loại lỗi thì phải có một công cụ đo đúng loại đó.

## Công cụ 1: đọc hình vẽ thật, không tin ô sprite

Ô sprite 32 × 32 không có nghĩa là nhân vật cao 32 pixel. Bộ art vẽ thùng gỗ 22 pixel nằm giữa ô 32 (bài 9), con boss 27 pixel nằm ở nửa phải ô 72 (bài 12). Một phép soát đo theo ô sẽ thấy cả hai đều ổn. Muốn biết hình vẽ nằm đâu, phải đọc alpha của từng pixel.

Tạo `Assets/_Platformer/Scripts/Debug/ArtAudit.cs`:

```csharp
#if UNITY_EDITOR
using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace Platformer.Debugging
{
    public static class ArtAudit
    {
        public static string Run(float tolerance = 0.1f)
        {
            var sb = new StringBuilder();
            var cache = new Dictionary<string, Texture2D>();
            int bad = 0;
            sb.AppendLine($"{"object",-18}{"artBottom",10}{"colBottom",10}{"dy",8}{"dx",8}");
            foreach (var sr in Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None))
            {
                var col = sr.GetComponent<Collider2D>();
                if (sr.sprite == null || col == null || !col.enabled) continue;

                var s = sr.sprite;
                var path = UnityEditor.AssetDatabase.GetAssetPath(s.texture);
                if (!cache.TryGetValue(path, out var tex))
                {
                    tex = new Texture2D(2, 2);
                    tex.LoadImage(System.IO.File.ReadAllBytes(path));   // the PNG itself, always readable
                    cache[path] = tex;
                }

                // bounding box of the opaque pixels inside this sprite's rect (bottom-left origin)
                var r = s.rect;
                int minX = int.MaxValue, maxX = -1, minY = int.MaxValue;
                for (int y = 0; y < (int)r.height; y++)
                    for (int x = 0; x < (int)r.width; x++)
                        if (tex.GetPixel((int)r.x + x, (int)r.y + y).a > 0.01f)
                        {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                        }
                if (maxX < 0) continue;

                var ppu = s.pixelsPerUnit;
                var pos = sr.transform.position;
                float left = minX - s.pivot.x, right = maxX + 1 - s.pivot.x;
                if (sr.flipX) { var l = left; left = -right; right = -l; }
                var artBottom = pos.y + (minY - s.pivot.y) / ppu;
                var artCentreX = pos.x + (left + right) * 0.5f / ppu;

                var b = col.bounds;
                var dy = b.min.y - artBottom;
                var dx = b.center.x - artCentreX;
                var note = "";
                if (Mathf.Abs(dy) > tolerance) note += dy > 0 ? " collider-above-art" : " collider-below-art";
                if (Mathf.Abs(dx) > tolerance) note += " off-centre";
                if (note != "") bad++;
                sb.AppendLine($"{sr.name,-18}{artBottom,10:F3}{b.min.y,10:F3}{dy,8:F3}{dx,8:F3} {note}");
            }
            sb.AppendLine(bad == 0 ? "OK - every collider sits on its art" : $"{bad} mismatched (some can be on purpose)");
            return sb.ToString();
        }
    }
}
#endif
```

Với mỗi object có cả sprite lẫn collider, công cụ đọc thẳng file PNG (không cần bật Read/Write cho texture), tìm hộp bao các pixel có màu bên trong ô của sprite, đổi ra toạ độ thế giới qua pivot và PPU, rồi so hai thứ với collider: đáy hình vẽ so với đáy collider (`dy`), tâm ngang của hình so với tâm collider (`dx`). Lệch quá 0.1 unit (1.6 pixel) thì đánh dấu.

Phải chạy trong **Play mode**. Charger, cannon, flyer và boss chỉ nhận kích thước collider từ `EnemyData` trong `Awake` (bài 11). Trong Edit mode, collider của chúng vẫn là cái hộp mặc định, và số đo ra vô nghĩa. Công cụ là một hàm static, bạn có thể gọi nó từ một nút trong một Editor script nhỏ, hoặc tạm từ `Start` của một component nào đó rồi in kết quả ra Console.

Chạy trên màn 3 (đủ mọi loại object) lúc Play:

```
object             artBottom colBottom      dy      dx
Enemy_Cannon          17.000    17.000   0.000   0.125  off-centre
Gem_4                  5.250     5.024  -0.226   0.000  collider-below-art
Checkpoint_2           2.000     2.200   0.200   0.000  collider-above-art
Box_2                  2.000     2.000   0.000   0.000
Enemy_Jumper1_A        7.000     7.000   0.000   0.000
Trap_A                 2.000     2.050   0.050   0.000
Enemy_Flyer            8.774     9.012   0.238  -0.031  collider-above-art
LevelExit              2.250     2.250   0.000   0.000
Enemy_Charger          2.000     2.000   0.000   0.031
Player                 2.015     2.015   0.000  -0.031
Boss_Brute             2.000     2.000   0.000   0.000
...
9 mismatched (some can be on purpose)
```

Không phải dòng nào bị đánh dấu cũng là lỗi. Ngọc có vùng nhặt rộng hơn hình (bài 9), trigger của lá cờ cố ý thụt lên khỏi chân cột, hàng gai treo dưới Flyer không tính là thân (bài 11), và nòng pháo làm hình lệch sang trái 2 pixel. Công cụ không quyết định thay bạn. Nó đưa ra một danh sách ngắn để bạn nhìn từng dòng và trả lời "cái này cố ý hay không".

Để thấy nó bắt được gì, mình tạm dựng lại hai lỗi cũ trong lúc Play: thùng gỗ để pivot giữa ô với collider cả ô (bài 9), và boss với collider theo ô 72 pixel (bài 12):

```
object             artBottom colBottom      dy      dx
Box_1                  2.313     2.000  -0.313   0.000  collider-below-art
Boss_Brute             2.000     2.200   0.200  -0.780  collider-above-art off-centre
```

Thùng lơ lửng 0.313 unit, đúng 5 pixel. Collider boss lệch trái 0.78 unit. Cả hai đều đã được người chơi nhìn thấy trước mọi công cụ. Và cả hai chỉ lộ ra khi đọc hình vẽ thật: đo theo ô, chúng hoàn toàn khớp.

## Công cụ 2: hỏi thẳng bảng va chạm

Bài 9 kể lỗi đắt nhất series: ô `Player × Default` trong bảng va chạm bị tắt, trong khi thùng, cờ và cửa thoát đều nằm ở `Default`. Không lỗi, không log. Người chơi đi xuyên qua cả ba, và màn chơi không thể thắng.

![Ô hàng Default cột Player trong Layer Collision Matrix bị bỏ trống](/images/posts/unity-platformer/09/collision-matrix.webp)

Bảng va chạm là luật chơi, nhưng nó không nằm trong code, không nằm trong scene hay prefab, nên đọc lại code bao nhiêu lần cũng không thấy. Thứ gì là luật chơi thì đáng được test. Tạo `Assets/_Platformer/Scripts/Debug/ReachAudit.cs`:

```csharp
using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace Platformer.Debugging
{
    public static class ReachAudit
    {
        public static string Run()
        {
            var sb = new StringBuilder();
            var playerGo = Object.FindFirstObjectByType<Player.PlayerMotor>();
            if (playerGo == null) return "no player in this scene";
            int p = playerGo.gameObject.layer;
            sb.AppendLine($"player layer = {LayerMask.LayerToName(p)}({p})");

            var problems = new List<string>();
            foreach (var go in Object.FindObjectsByType<GameObject>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                var col = go.GetComponent<Collider2D>();
                if (col == null) continue;

                var mustTouch =
                    go.GetComponent<Level.Collectible>() != null ||
                    go.GetComponent<Level.Checkpoint>() != null ||
                    go.GetComponent<Level.LevelExit>() != null ||
                    go.GetComponent<Level.BreakableBox>() != null ||
                    go.GetComponent<Level.Hazard>() != null ||
                    go.GetComponent<Enemies.PatrolEnemy>() != null ||
                    go.GetComponent<Enemies.ChargerEnemy>() != null ||
                    go.GetComponent<Enemies.CannonEnemy>() != null ||
                    go.GetComponent<Enemies.FlyerEnemy>() != null ||
                    go.GetComponent<Enemies.BossBrute>() != null;
                if (!mustTouch) continue;

                var blocked = Physics2D.GetIgnoreLayerCollision(p, go.layer);
                var line = $"{go.name,-16} layer={LayerMask.LayerToName(go.layer),-12} {(blocked ? "UNREACHABLE" : "ok")}";
                sb.AppendLine("  " + line);
                if (blocked) problems.Add(go.name);
            }
            sb.AppendLine(problems.Count == 0
                ? "OK - every interactive object is reachable by the player"
                : "BROKEN - player ignores: " + string.Join(", ", problems));
            return sb.ToString();
        }
    }
}
```

Công cụ liệt kê mọi object mà người chơi phải chạm được (ngọc, cờ, cửa, thùng, bẫy, địch) và hỏi `Physics2D.GetIgnoreLayerCollision` cho từng cặp với layer của người chơi. Chạy được cả trong Edit mode.

Trên màn 3 hiện tại:

```
player layer = Player(6)
  Gem_3            layer=Pickup       ok
  Trap_B           layer=Hazard       ok
  Boss_Brute       layer=Enemy        ok
  Checkpoint_2     layer=Interactable ok
  LevelExit        layer=Interactable ok
  Box_2            layer=Ground       ok
  ...
OK - every interactive object is reachable by the player
```

Tạm đưa thùng, cờ và cửa về `Default` như lúc lỗi xảy ra:

```
  Checkpoint_2     layer=Default      UNREACHABLE
  LevelExit        layer=Default      UNREACHABLE
  Box_2            layer=Default      UNREACHABLE
  Checkpoint_1     layer=Default      UNREACHABLE
  Box_1            layer=Default      UNREACHABLE
BROKEN - player ignores: Checkpoint_2, LevelExit, Box_2, Checkpoint_1, Box_1
```

Một dòng chữ in hoa đỏ thay cho một màn chơi không thắng nổi mà không ai biết vì sao.

## Công cụ 3: chơi bằng input thật

Hai công cụ trên soát từng thứ riêng lẻ. Công cụ thứ ba đi hết đường người chơi đi, và ghi lại mọi thứ căn phòng phát ra trên đường.

Nó cần một cửa để đưa input vào motor mà không cần bàn phím. Thêm vào `PlayerMotor` ba field công khai:

```csharp
// ---- test hook (lab only) ----
public bool UseTestInput;
public float TestMove;
public bool TestJumpHeld;
private bool prevTestJumpHeld;
```

Trong `Update`, ngay đầu hàm, bỏ qua việc đọc bàn phím khi đang test:

```csharp
if (UseTestInput) return;
```

Và ở đầu `FixedUpdate`, đọc input test thay cho bàn phím, kể cả tự bật jump buffer ở cạnh nhấn:

```csharp
if (UseTestInput)
{
    MoveInput = TestMove;
    JumpHeld = TestJumpHeld;
    if (TestJumpHeld && !prevTestJumpHeld) bufferCounter = jumpBufferTime;
    prevTestJumpHeld = TestJumpHeld;
    UpdateFacing();   // Update returned early, so turn the character here
}
```

Input test đi vào đúng những biến mà bàn phím đi vào, nên mọi thứ phía sau (coyote, buffer, jump cut, wall jump) chạy y như khi người thật bấm.

Tạo `Assets/_Platformer/Scripts/Debug/Playtest.cs`:

```csharp
using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace Platformer.Debugging
{
    [DefaultExecutionOrder(-60)]   // set test input before PlayerMotor reads it
    public sealed class Playtest : MonoBehaviour
    {
        [System.Serializable]
        public struct Step
        {
            public float seconds;
            public float move;          // -1 left, 0 still, 1 right
            public float jumpAt;        // seconds into this step, -1 for none
            public float jumpHold;
        }

        public bool Running { get; private set; }
        public string Log => log.ToString();
        public int Deaths { get; private set; }

        private readonly StringBuilder log = new StringBuilder();
        private readonly List<Step> steps = new List<Step>();
        private Player.PlayerMotor motor;
        private Player.PlayerLife life;
        private Level.RoomState room;
        private Rigidbody2D body;
        private int index;
        private float stepT, totalT;
        private float savedMaxDelta;

        public void Begin(Vector2 startAt, params Step[] plan)
        {
            motor = FindFirstObjectByType<Player.PlayerMotor>();
            life = FindFirstObjectByType<Player.PlayerLife>();
            room = FindFirstObjectByType<Level.RoomState>();
            body = motor.GetComponent<Rigidbody2D>();

            log.Clear(); steps.Clear(); steps.AddRange(plan);
            index = 0; stepT = 0f; totalT = 0f; Deaths = 0; Running = true;

            body.position = startAt; body.linearVelocity = Vector2.zero;
            Physics2D.SyncTransforms();
            motor.RefreshGround();
            motor.UseTestInput = true;

            // a slow editor frame lets Unity run many physics steps at once, which would
            // desynchronise frame-driven input from the steps it is meant for
            savedMaxDelta = Time.maximumDeltaTime;
            Time.maximumDeltaTime = Time.fixedDeltaTime;

            Hook(true);
            Write("begin at " + startAt.ToString("F2"));
        }

        private void Hook(bool on)
        {
            if (life != null) { if (on) life.Died += OnDied; else life.Died -= OnDied; }
            if (room != null)
            {
                if (on) { room.GemChanged += OnGem; room.AllCollected += OnAllGems; room.RoomCompleted += OnRoomDone; }
                else { room.GemChanged -= OnGem; room.AllCollected -= OnAllGems; room.RoomCompleted -= OnRoomDone; }
            }
            foreach (var b in FindObjectsByType<Level.BreakableBox>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            { if (on) b.BrokenEvent += OnBox; else b.BrokenEvent -= OnBox; }
            if (on) Level.Checkpoint.Activated += OnCheckpoint; else Level.Checkpoint.Activated -= OnCheckpoint;
            var exit = FindFirstObjectByType<Level.LevelExit>(FindObjectsInactive.Include);
            if (exit != null) { if (on) exit.Entered += OnExit; else exit.Entered -= OnExit; }
        }

        private void Write(string s) => log.AppendLine($"[{totalT:0.00}s @({body.position.x:0.0},{body.position.y:0.0})] {s}");

        private void OnDied(string reason) { Deaths++; Write("DIED: " + reason); }
        private void OnGem(int c, int t) { if (c > 0) Write($"gem {c}/{t}"); }
        private void OnAllGems() => Write("ALL GEMS - exit should open");
        private void OnRoomDone() => Write("ROOM COMPLETE");
        private void OnBox(Level.BreakableBox b) => Write("box broken: " + b.name);
        private void OnCheckpoint(Level.Checkpoint c) => Write("checkpoint: " + c.name + " respawn=" + c.RespawnPoint.ToString("F2"));
        private void OnExit() => Write("EXIT ENTERED");

        private void FixedUpdate()
        {
            if (!Running) return;
            if (index >= steps.Count) { Finish(); return; }

            var s = steps[index];
            motor.TestMove = s.move;
            motor.TestJumpHeld = s.jumpAt >= 0f && stepT >= s.jumpAt && stepT < s.jumpAt + s.jumpHold;

            stepT += Time.fixedDeltaTime;
            totalT += Time.fixedDeltaTime;
            if (stepT >= s.seconds) { Write($"step {index} done (move {s.move})"); index++; stepT = 0f; }
        }

        private void Finish()
        {
            Running = false;
            motor.TestMove = 0f; motor.TestJumpHeld = false; motor.UseTestInput = false;
            Time.maximumDeltaTime = savedMaxDelta;
            Hook(false);
            Write("end");
        }

        public void Abort() { if (Running) Finish(); }
    }
}
```

Một kế hoạch là danh sách bước: đi hướng nào trong bao lâu, nhấn nhảy lúc nào, giữ bao lâu. `Playtest` chạy từng bước mỗi bước vật lý, và nghe mọi sự kiện các bài trước đã phát: ngọc, cờ, thùng vỡ, chết, cửa thoát. Kết quả là một nhật ký có thời gian và vị trí.

Đây là lần chạy đầu tiên của nó, trên màn 1 lúc lỗi bảng va chạm còn nguyên: đi thẳng từ chỗ spawn sang phải trong 2.9 giây.

```
[0.00s @(6.0,2.0)] begin at (6.00, 2.00)
[1.62s @(20.0,2.0)] step 0 done (move 1)
[2.94s @(29.4,2.0)] step 1 done (move 1)
[2.94s @(29.4,2.0)] end
```

Trên đường từ x = 6 tới x = 29.4 có `Checkpoint_1` ở x = 12, `Box_1` ở x = 20, `Checkpoint_2` ở x = 22, `Box_2` ở x = 28. Không một dòng nào. Nhân vật đi xuyên qua cả bốn:

![Nhân vật đứng ngay giữa thùng gỗ ở x = 20, như thể thùng không tồn tại](/images/posts/unity-platformer/16/walk-through-box.webp)

Sáu giây chạy, ba lỗi lộ ra: thùng không chặn, cờ không kéo, và (đi tiếp tới cuối phòng) cửa không nhận. Thứ mà mọi bài test gọi API trước đó không thấy trong suốt mười mấy bước dựng.

Sau khi sửa, cả màn 1 bằng input thật, chia thành năm đoạn đường (mỗi đoạn bắt đầu bằng `Begin` ở một vị trí):

```
[1.06s @(10.9,7.1)] gem 1/5                     nhảy từ sàn lên bệ 1
[0.84s @(27.5,13.5)] gem 2/5                    trên bệ 2, nhảy qua bẫy B
[1.14s @(36.8,17.0)] gem 3/5                    từ bệ 2 nhảy đôi lên bệ 3
[0.70s @(29.1,3.8)] gem 4/5                     nhảy thấp qua thùng 2
[0.78s @(55.8,6.0)] gem 5/5                     nhảy qua cột phải
[0.78s @(55.8,6.0)] ALL GEMS - exit should open
[1.00s @(57.7,5.2)] ROOM COMPLETE
[1.00s @(57.7,5.2)] EXIT ENTERED
```

Không lần chết nào, `LevelRunner` ghi màn 1 là đã qua. Đó là bằng chứng đầu tiên game thắng được qua đường người chơi đi, chứ không qua một dòng `room.Complete()`.

Một điều khi viết kế hoạch: nhảy đôi cần hai lần nhấn, nên phải là hai bước, và bước đầu phải nhả nút trước khi bước sau nhấn. Hai bước liền nhau cùng "giữ nhảy" thì motor không thấy cạnh nhấn mới, và cú nhảy thứ hai không bao giờ xảy ra. Input là một trạng thái và một cạnh, không phải một chuỗi sự kiện rời rạc.

## Hai họ lỗi

Nhìn lại cả series, phần lớn lỗi khó tìm thuộc về hai họ.

**Giả định thứ tự khởi tạo.** Bốn lần: `SpriteSequence` null khi địch bật lên (bài 8), cú rung boss đầu tiên bị nuốt (bài 13), đồng hồ ngọc đứng "0/0" và nhân vật đã chọn bị ghi đè (bài 15). Bài 15 đã gom chúng thành một bảng. Cách chữa: đọc dữ liệu của object khác trong `Start`, phát lại sự kiện khi dữ liệu đổi, lấy tham chiếu lúc cần.

**Đo một thứ tuần hoàn trong cửa sổ dài hơn chu kỳ của nó.** Ba lần:

- Đo parallax bằng cách so ảnh chụp trước và sau khi camera đi: hoa văn nền lặp lại sau mỗi ô 4 unit, nền dịch gần một chu kỳ thì phép so khớp nhầm sang ô bên cạnh, và parallax 0.25 đo ra 0.75.
- Đo tốc độ nền trôi trong 8 giây, dài hơn chu kỳ kéo về 6.67 giây: ra 0.097 thay vì 0.6 (bài 14).
- Đo hai lớp nền chồng nhau cùng lúc: ra 0.48, một con số không thuộc lớp nào.

Cả ba đều là số liệu trông hợp lý, sai hoàn toàn, và không có gì báo là sai. Cách phòng: trước khi đo, hỏi thứ mình đo có lặp lại không, và chu kỳ của nó là bao nhiêu.

## Bảy lỗi nữa, tìm ra khi viết lại series

Đoạn này mình viết sau khi đã tin là game đúng. Khi viết lại cả series để đăng, mình dựng lại từng bước trong một project tạm, chạy code của đúng bài đó, và đo mọi con số trước khi viết nó vào bài. Cách làm đó tìm ra thêm bảy chỗ code chạy mà không làm đúng việc của nó:

| Bài | Chỗ sai | Vì sao các lần soát trước không thấy |
|---|---|---|
| 11 | Charger lao qua mép bệ và bay ngang giữa không trung | Chưa từng thử cho nó lao ra khỏi một bệ |
| 11 | Đạn pháo sinh ra trong cột, tự trả về pool ngay | Pool vẫn đếm đủ phát bắn, chỉ không viên nào bay ra |
| 11 | Flyer bổ nhào dừng cách đầu người chơi 0.38 unit | Nó vẫn bổ nhào đúng nhịp, chỉ không chạm tới ai đứng yên |
| 12 | Cờ `stompableOnlyWhenVulnerable` trong asset boss không ai đọc | Hành vi trùng với giá trị cờ đang đặt |
| 13 | `SpriteFlash` tô trắng lên sprite vốn trắng, boss không hề chớp | Code chạy đúng, chỉ không đổi được gì trên màn hình |
| 13 | 1.2 giây bất tử của bài 8 hoàn toàn vô hình | `GraceUntil` được ghi nhưng không ai đọc |
| 14 | Nền đọc vị trí camera của frame trước | Lệch một nhịp, chỉ thấy khi camera tăng tốc |

Không lỗi nào hiện trong Console. Không lỗi nào bị `ArtAudit`, `ReachAudit` hay `Playtest` bắt được, vì không công cụ nào đo đúng thứ đó. Chúng lộ ra vì mỗi câu trong bài phải có một con số đo được đứng sau: "charger lao hụt là rơi" không đo ra được thì câu đó không được viết, và khi thử đo thì hoá ra nó sai.

Đó là bài học lớn nhất của cả series. Công cụ soát là thứ tốt nhất để không dính lại lỗi cũ. Còn để tìm lỗi mới, không có gì thay được việc hỏi "mình đã thật sự thấy nó xảy ra chưa" cho từng điều mình tin về game của mình.

Và một chỗ mình chưa đo: mọi sửa trong đợt viết lại này đã kiểm trong Editor. Bản build web cần build lại và thử lại trên trình duyệt, vì như bài 15 đã thấy, Editor chạy đúng không chứng minh được gì cho WebGL.

## Kết series

Mười bảy bài, từ import một sheet pixel art tới một game ba màn chạy trên trình duyệt:

- Một nhân vật với coyote time, jump buffer, nhảy đôi, bám và bật tường, ba bộ cảm giác khác nhau trong ba asset.
- Một camera hai tầng có vùng chết, nhìn trước, kẹp trong phòng, và rung mà không bao giờ lộ ra ngoài.
- Bốn kiểu địch và một boss, tất cả chết bằng cùng một luật giẫm tách ra từ bài 9.
- Một lớp phản hồi gắn từ bên ngoài, không sửa dòng gameplay nào.
- Hai thứ viết cho game khác và dùng lại nguyên vẹn: `PrefabPool` và `CameraShake` từ series shmup.

Và ba công cụ để lần sau không phải chờ người chơi đầu tiên báo lỗi.
