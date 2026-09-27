---
title: "Dissolve shader cho Unity URP, phần 2: tan theo hướng, từ tâm ra và từ ngoài vào"
date: "2026-09-27"
lang: vi
series: "shader"
order: 4
excerpt: "Cho dissolve một hình dạng: tan từ chân lên như dịch chuyển, cháy loang từ chỗ trúng đòn, co dần từ ngoài vào tâm. Trộn gradient với noise mà thanh trượt vẫn chạy đủ 0 tới 1, và để script tự đo khoảng thay vì gõ tay số."
coverImage: "/images/lab/shaders/dissolve-shapes-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Dissolve"]
published: true
featured: false
---

![Ba con Burrow cùng tan: trái tan từ chân lên màu xanh, giữa cháy loang từ ngực, phải co dần từ ngoài vào màu tím](/images/lab/shaders/dissolve-shapes.webp)

Ở [phần 1](/lab/shader-dissolve-urp), mỗi điểm trên bề mặt có một thời điểm biến mất `t`, lấy từ noise, nên vật tan lốm đốm khắp người cùng lúc. Nhìn thì đẹp, nhưng không kể được gì. Trong game, cách một vật biến mất thường phải nói lên lý do nó biến mất:

- Nhân vật **dịch chuyển** thì tan từ chân lên đầu, như bị một luồng sáng quét qua.
- Quái **trúng phép** thì cháy loang ra từ đúng chỗ bị bắn.
- Vật bị **hút năng lượng** thì co dần từ ngoài vào tâm.

Cả ba chỉ khác nhau ở chỗ `t` lấy từ đâu. Phần cắt, viền cháy, mặt trong và bóng đổ của phần 1 giữ nguyên, không sửa dòng nào.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Cộng độ cao với noise</span><span>Gradient 0 tới 1</span><span>Trộn noise</span><span>Script đo khoảng</span><span>Từ tâm ra</span><span>Từ ngoài vào</span></div></div>

**Tải mã nguồn:** vẫn là [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip) của phần 1. Gói đã có sẵn mọi thứ trong bài này.

## Bước 1: cộng độ cao với noise

Cách nghĩ ra đầu tiên cho kiểu tan từ chân lên: lấy độ cao của điểm, cộng thêm noise cho mép cắt lởm chởm.

```hlsl
float height = TransformObjectToWorld(input.restPositionOS).y;
half t = height + DissolveNoise(DissolveSpace(input.restPositionOS), input.restNormalOS) - _DissolveAmount;
clip(t);
```

Kéo Amount lên 1:

![Bước 1: Amount đã kéo hết lên 1 mà Burrow mới mất phần chân, cả nửa trên vẫn còn](/images/lab/dissolve/dissolve-p2-01-naive.webp)

Burrow cao khoảng 1.2 mét, noise sau khi remap chạy từ 0 tới 1. Cộng lại thì `t` trải từ 0 tới 2.2, trong khi thanh trượt chỉ tới 1. Nửa trên của Burrow không bao giờ biến mất.

Có người sửa bằng cách cho thanh trượt chạy tới 2.2. Được một lúc, cho tới khi áp shader lên một cái cây cao 5 mét, rồi phải tìm số mới. Chỗ sai nằm ở gốc: `t` phải luôn nằm trong khoảng 0 tới 1, bất kể vật cao bao nhiêu và noise mạnh hay yếu, thì Amount 0 tới 1 mới luôn có nghĩa "từ nguyên vẹn tới biến mất".

## Bước 2: gradient từ 0 tới 1

Muốn độ cao chạy từ 0 tới 1 thì phải biết vật trải từ đâu tới đâu theo hướng đó. Gọi hai đầu là `min` và `max`, nằm trong `_DissolveRange.x` và `_DissolveRange.y`:

```hlsl
float along = dot(TransformObjectToWorld(positionOS), normalize(_DissolveDirection.xyz));
half shape = saturate((along - _DissolveRange.x) / max(_DissolveRange.y - _DissolveRange.x, 1e-4));
```

`dot` với hướng cho ra vị trí của điểm dọc theo hướng đó. Hướng (0, 1, 0) thì `along` chính là độ cao. Hướng (1, 0, 0) thì vật tan từ trái sang phải, như bị gạt đi. Trừ `min` rồi chia cho độ dài khoảng thì điểm thấp nhất ra 0, điểm cao nhất ra 1.

Mình tính gradient trong **world space**, khác với noise dùng object space. Noise phải dính vào vật để hoa văn không trượt. Còn hướng thì nên cố định trong thế giới: luồng dịch chuyển quét từ đất lên trời, kể cả khi nhân vật đang nằm hay đang nhào lộn.

Tạm thời dùng gradient không có noise để xem nó chạy đúng chưa:

![Bước 2: mép cắt phẳng như dao, kèm một dải sáng dày quanh ngực](/images/lab/dissolve/dissolve-p2-02-gradient.webp)

Gradient đúng, Burrow mất đúng nửa dưới ở Amount 0.5. Có thêm một chuyện đáng để ý: viền sáng giờ là một cái đai dày. `_EdgeWidth` tính theo đơn vị của `t`, mà `t` giờ là độ cao chia cho chiều cao vật, nên độ rộng 0.1 thành 10% chiều cao. Với noise thì `t` đổi nhanh trên bề mặt và viền mỏng; với gradient trơn thì `t` đổi chậm và viền dày. Sang bước sau, trộn noise vào thì viền mỏng lại.

## Bước 3: trộn noise vào gradient

Bài [breakdown dissolve của Cyanilux](https://www.cyanilux.com/tutorials/dissolve-shader-breakdown/) cộng gradient với noise rồi remap tổng về 0 tới 1. Cách đó đúng, nhưng mỗi lần đổi độ mạnh của noise lại phải tính lại khoảng remap. Mình dùng `lerp`:

```hlsl
return lerp(shape, noise, _NoiseStrength);
```

`lerp` giữa hai số cùng nằm trong khoảng 0 tới 1 thì kết quả cũng nằm trong khoảng đó, với mọi giá trị `_NoiseStrength`. Không cần remap lại, không có vùng chết trên thanh trượt. `_NoiseStrength` bằng 0 là gradient trơn, bằng 1 là noise thuần như phần 1, và mọi thứ ở giữa là pha trộn.

![Noise Strength 0.12, 0.3 và 0.7 ở cùng Amount 0.5: mép cắt từ gần phẳng, sang lởm chởm, sang lốm đốm khắp người](/images/lab/dissolve/dissolve-p2-strength-compare.webp)

Mình để 0.3 cho kiểu dịch chuyển: vẫn đọc rõ là tan từ dưới lên, mép cắt đủ lởm chởm để không giống máy quét. Noise ở đây mạnh thì thành một đường biên rộng hơn, chứ không làm hướng biến mất.

Hàm `DissolveTime` của phần 1 giờ có đủ các nhánh:

**Shaders/Dissolve/BillDissolveCore.hlsl**

```hlsl
half DissolveTime(float3 positionOS, half3 normalOS)
{
    float3 p = DissolveSpace(positionOS);
    half noise = DissolveNoise(p, normalOS);

#if defined(_SHAPE_DIRECTION)
    float along = dot(TransformObjectToWorld(positionOS), normalize(_DissolveDirection.xyz));
    half shape = saturate((along - _DissolveRange.x) / max(_DissolveRange.y - _DissolveRange.x, 1e-4));
#elif defined(_SHAPE_SPHERE)
    float3 positionWS = TransformObjectToWorld(positionOS);
    half shape = saturate(distance(positionWS, _SphereCenter.xyz) / max(_SphereRadius, 1e-4));
    shape = _SphereInvert > 0.5h ? 1.0h - shape : shape;
#else
    half shape = noise;
#endif

    return lerp(shape, noise, _NoiseStrength);
}
```

Hình dạng được chọn bằng keyword. Trong khối `Properties`:

```hlsl
[KeywordEnum(Noise, Direction, Sphere)] _Shape ("Shape", Float) = 0
```

và trong mọi pass:

```hlsl
#pragma shader_feature_local _SHAPE_NOISE _SHAPE_DIRECTION _SHAPE_SPHERE
```

`KeywordEnum` tạo một ô chọn trong Inspector và tự bật đúng keyword `_SHAPE_` tương ứng. Dùng keyword thay vì `if` theo một số thực, vì mỗi material chỉ dùng một hình dạng, và Unity sẽ biên dịch riêng một bản shader không chứa code của hai nhánh kia. `shader_feature` (khác `multi_compile`) chỉ build những bản có material thật sự dùng, nên không phình build.

Một chỗ dễ quên: phải khai báo keyword ở **mọi** pass, kể cả ShadowCaster và DepthOnly. Pass nào thiếu thì pass đó luôn chạy nhánh noise, và bóng lại tan một kiểu, thân tan một kiểu.

## Bước 4: đừng gõ khoảng bằng tay

`_DissolveRange` là hai con số. Gõ tay vào material thì chạy được, với đúng một vật, ở đúng một chỗ. Đặt Burrow lên một cái thùng cao 0.8 mét là thấy:

![Trái: khoảng gõ tay từ 0 tới 1.2, Burrow đứng trên thùng thì ở Amount 0.5 gần như chưa tan. Phải: script đo khoảng theo vị trí thật, tan đúng một nửa](/images/lab/dissolve/dissolve-p2-crate-compare.webp)

Khoảng 0 tới 1.2 là của Burrow khi đứng dưới đất. Lên thùng thì Burrow trải từ 0.8 tới 2.0, gradient bị dồn về phía 1, và nửa đầu thanh trượt không làm gì. Gradient tính theo world space nên phải cập nhật theo vị trí thật của vật, mỗi frame.

Script `DissolveShape` lo việc đó. Cách đầu tiên mình viết là lấy `Renderer.bounds`, tức cái hộp bao quanh vật. Nó chạy đúng với hướng, nhưng với hình cầu (bước sau) thì hỏng: bán kính lấy tới góc xa nhất của hộp. Burrow dang hai tay nên cái hộp phần lớn là không khí, bán kính bị thổi phồng gần gấp đôi, và một nửa thanh trượt chạy qua chỗ không có gì. Nên script lấy mẫu vài trăm điểm từ chính mesh:

**Scripts/DissolveShape.cs** (trích)

```csharp
public void Refit()
{
    var points = new List<Vector3>();
    var baked = new Mesh();
    foreach (var r in renderers)
    {
        Vector3[] vertices;
        Matrix4x4 toWorld;
        if (r is SkinnedMeshRenderer skinned)
        {
            skinned.BakeMesh(baked, true);
            vertices = baked.vertices;
            toWorld = Matrix4x4.TRS(r.transform.position, r.transform.rotation, Vector3.one);
        }
        else if (r.TryGetComponent<MeshFilter>(out var filter) && filter.sharedMesh != null)
        {
            vertices = filter.sharedMesh.vertices;
            toWorld = r.transform.localToWorldMatrix;
        }
        else continue;

        int stride = Mathf.Max(1, vertices.Length / Mathf.Max(1, samplePoints / renderers.Length));
        for (int i = 0; i < vertices.Length; i += stride)
            points.Add(transform.InverseTransformPoint(toWorld.MultiplyPoint3x4(vertices[i])));
    }
    // ... hủy mesh tạm ...
    localPoints = points.ToArray();
}
```

Nhân vật dùng `SkinnedMeshRenderer`, mesh gốc của nó ở tư thế T chứ không phải tư thế đang đứng. `BakeMesh` chụp lại mesh theo đúng tư thế hiện tại. Tham số `true` áp luôn tỷ lệ của vật, nên khi đổi sang world chỉ cần vị trí và hướng xoay.

Các điểm được lưu theo local space của chính object gắn script, chỉ tính một lần. Mỗi frame, `LateUpdate` đổi chúng sang world rồi tìm khoảng:

```csharp
for (int i = 0; i < localPoints.Length; i++)
{
    world[i] = transform.TransformPoint(localPoints[i]);
    float along = Vector3.Dot(world[i], dir);
    min = Mathf.Min(min, along);
    max = Mathf.Max(max, along);
    sum += world[i];
}
```

Vài trăm phép nhân ma trận mỗi frame là không đáng kể, và vật đi đâu, xoay thế nào, khoảng cũng theo tới đó. Giá trị được đẩy vào shader bằng `MaterialPropertyBlock`, như cách điều khiển Amount ở phần 1.

Script có `[ExecuteAlways]` để chạy cả trong Edit Mode, kéo thanh trượt trong Inspector là thấy ngay. Nếu tư thế thay đổi nhiều (một đòn tấn công vươn tay dài chẳng hạn), gọi `Refit()` trước khi bắt đầu tan. Với các tư thế đứng yên thì chụp một lần là đủ.

![Bước 4: tan từ chân lên, mép lởm chởm, viền xanh kiểu dịch chuyển](/images/lab/dissolve/dissolve-p2-03-direction.webp)

## Bước 5: cháy loang từ chỗ trúng đòn

Hình dạng thứ hai là hình cầu: `t` là khoảng cách từ điểm tới một tâm, chia cho bán kính.

```hlsl
float3 positionWS = TransformObjectToWorld(positionOS);
half shape = saturate(distance(positionWS, _SphereCenter.xyz) / max(_SphereRadius, 1e-4));
```

Điểm sát tâm có `t` gần 0 nên đi trước, điểm xa nhất có `t` bằng 1 nên đi sau cùng. Ý tưởng mặt nạ hình cầu mình tham khảo từ bài [Spherical mask dissolve của Harry Alisavakis](https://halisavakis.com/my-take-on-shaders-spherical-mask-dissolve/). Bài đó dùng biến global cho cả cảnh, ở đây mỗi vật một tâm riêng; phần 4 sẽ quay lại với biến global.

Bán kính do script tính: khoảng cách từ tâm tới điểm xa nhất trong các điểm mẫu, để Amount 1 luôn phủ hết vật.

```csharp
Vector3 center = sphereCenter != null ? sphereCenter.position : sum / world.Length;
float radius = 0f;
foreach (var p in world) radius = Mathf.Max(radius, Vector3.Distance(center, p));
```

Tâm lấy từ một Transform. Khi đạn trúng quái, tạo một object con tại điểm trúng rồi gán vào `sphereCenter`:

```csharp
void OnHit(RaycastHit hit, DissolveShape shape)
{
    var point = new GameObject("HitPoint").transform;
    point.SetParent(shape.transform, true);
    point.position = hit.point;
    shape.sphereCenter = point;
    shape.Refit();
}
```

Làm con của quái thì khi quái còn đang ngã, lỗ cháy vẫn nằm đúng chỗ trên người nó. Lưu thẳng tọa độ `hit.point` thì quái ngã một đằng, lỗ cháy lơ lửng một nẻo.

![Bước 5: một lỗ cháy mở ra từ giữa ngực, các chỗ khác còn nguyên](/images/lab/dissolve/dissolve-p2-04-sphere-out.webp)

## Bước 6: co dần từ ngoài vào

Đảo ngược gradient thì thứ tự đảo theo: điểm xa tâm nhất đi trước, tâm đi sau cùng.

```hlsl
shape = _SphereInvert > 0.5h ? 1.0h - shape : shape;
```

`_SphereInvert` là một số thực chứ không phải keyword, vì nó chỉ lật một phép trừ, rẻ hơn tạo thêm một bộ biến thể shader. Để tâm trống thì script dùng trọng tâm của các điểm mẫu. Kiểu này hợp với vật bị hút năng lượng, hoặc linh hồn thu dần vào một điểm trước khi biến mất.

![Bước 6: hai tay và rìa người tan trước, viền tím, phần thân giữa còn nguyên](/images/lab/dissolve/dissolve-p2-05-sphere-in.webp)

Viền tím, viền xanh, viền cam đều chỉ là `_EdgeColor` và `_InsideColor` khác nhau trên ba material. Màu viền kể câu chuyện nhiều không kém hình dạng: xanh lạnh đọc ra là công nghệ, cam đọc ra là lửa, tím đọc ra là phép thuật.

## Tiếp theo

Đến giờ mọi thứ vẫn chỉ là cắt pixel, còn mesh đứng yên. [Phần 3](/lab/shader-dissolve-vertex-urp) cho vertex chuyển động theo dissolve: vỏ phồng lên ở chỗ đang cháy, và cả thân bị kéo về một điểm như bị hút vào cổng không gian.

## File trong bài

Mọi file nằm trong [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip). Các file liên quan tới phần này:

<div class="lesson-files"><strong>Shader</strong><em>Shaders/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/BillDissolveCore.hlsl" download>BillDissolveCore.hlsl<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolve.shader" download>BillDissolve.shader<small>6 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/DissolveTutorialPass.hlsl" download>DissolveTutorialPass.hlsl<small>3 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_07_HeightNaive.shader" download>Dissolve_07_HeightNaive.shader<small>5 KB</small></a>
</div>
<div class="lesson-files"><strong>Script</strong><em>Scripts</em>
<a href="/downloads/shaders/files/dissolve/DissolveShape.cs" download>DissolveShape.cs<small>5 KB</small></a>
</div>

Noise vẫn là Perlin_02, xem cách import ở [phần 1](/lab/shader-dissolve-urp#file-và-texture-trong-bài).

## Tham khảo

- [Cyanilux: Dissolve Shader Breakdown](https://www.cyanilux.com/tutorials/dissolve-shader-breakdown/), dissolve theo độ cao và chuyện phải đưa tổng gradient với noise về đúng khoảng.
- [Harry Alisavakis: Spherical mask dissolve](https://halisavakis.com/my-take-on-shaders-spherical-mask-dissolve/), mặt nạ hình cầu và viền phát sáng theo mask.
- [Unity: SkinnedMeshRenderer.BakeMesh](https://docs.unity3d.com/ScriptReference/SkinnedMeshRenderer.BakeMesh.html).

Burrow là asset từ Asset Store (Monsters Ultimate Pack), chỉ dùng để minh họa và không có trong gói tải về.
