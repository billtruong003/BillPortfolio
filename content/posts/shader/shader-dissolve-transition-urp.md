---
title: "Dissolve shader cho Unity URP, phần 4: transition nhiều hình dạng, nhìn xuyên tường và X-ray"
date: "2026-09-28"
lang: vi
series: "shader"
order: 6
excerpt: "Một mặt nạ dùng chung cho cả cảnh, ghép từ hình cầu, hộp và viên nhộng bằng signed distance. Dùng nó để làm transition cho level, khoét tường khi nhân vật bị che, và vẽ bóng X-ray mà không tự tô lên chính mình."
coverImage: "/images/lab/shaders/dissolve-transition-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Dissolve", "SDF"]
published: true
featured: false
---

![Một level prototype hiện ra rồi biến mất bên trong ba hình dạng lần lượt mở ra: một hình cầu, một hình hộp và một viên nhộng chạy chéo qua sàn](/images/lab/shaders/dissolve-transition.webp)

Minions Art có một mẹo rất gọn về world position shader. Script gửi vị trí của một vật vào shader bằng `Shader.SetGlobalVector`. Shader tính khoảng cách từ mỗi pixel tới vị trí đó, rồi trong bán kính thì dùng texture này, ngoài bán kính dùng texture khác. Cỏ mọc ra quanh chân nhân vật, tuyết tan quanh ngọn lửa, mọi thứ trong cảnh cùng phản ứng với một điểm.

Ba phần trước làm dissolve cho **từng vật riêng lẻ**: mỗi con Burrow một Amount, một tâm cầu. Bài này đi theo hướng của mẹo trên: một mặt nạ dùng chung cho **cả cảnh**, và mở rộng thêm hai điều:

- Mặt nạ không chỉ là một hình cầu mà ghép từ **nhiều hình dạng**: cầu, hộp, viên nhộng, bao nhiêu cái cũng được.
- Dùng mặt nạ đó vào ba việc: **transition** cho level, **khoét tường** khi nhân vật bị che, và **X-ray** vẽ bóng nhân vật sau vật cản.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Biến global</span><span>Signed distance</span><span>Ghép nhiều hình</span><span>Transition</span><span>Nhìn xuyên tường</span><span>X-ray</span></div></div>

**Tải mã nguồn:** [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip), cùng gói với ba phần trước.

## Bước 1: từ biến của material sang biến global

Tâm cầu ở phần 2 nằm trong material (hoặc property block) của từng con Burrow. Với transition cả level thì cách đó không dùng được: một level có hàng trăm mảnh tường, sàn, thùng, mỗi cái một material. Không ai muốn mỗi frame đi gán lại tâm cầu cho từng cái.

Biến global thì chỉ có một giá trị cho cả cảnh. Mọi shader khai báo biến cùng tên đều đọc được giá trị đó. Trong HLSL, biến global là biến khai báo **ngoài** khối `UnityPerMaterial`:

**Shaders/Dissolve/BillTransition.hlsl**

```hlsl
#define TRANSITION_MAX_SHAPES 16

float4 _TransitionShapeA[TRANSITION_MAX_SHAPES];
float4 _TransitionShapeB[TRANSITION_MAX_SHAPES];
int    _TransitionShapeCount;
```

Nằm ngoài CBUFFER nên chúng không ảnh hưởng tới SRP Batcher: batcher chỉ quan tâm khối per-material có giống nhau giữa các material hay không.

Mỗi hình dạng gói trong hai `float4`, vì mảng của shader chỉ chứa được kiểu số:

| | `.xyz` | `.w` |
| --- | --- | --- |
| A | tâm cầu, tâm hộp, hoặc đầu viên nhộng | loại: 0 cầu, 1 hộp, 2 viên nhộng |
| B | nửa kích thước hộp, hoặc đuôi viên nhộng | bán kính (với hộp là độ bo góc) |

Phía C#, gửi lên bằng `Shader.SetGlobalVectorArray`. Có một cái bẫy: Unity quyết định kích thước của mảng global ở **lần gán đầu tiên** và không bao giờ nới ra. Lần đầu gán một mảng 2 phần tử thì về sau gửi 10 phần tử, shader cũng chỉ nhận 2. Nên script luôn gửi đủ 16 phần tử, kèm một biến đếm số hình thật sự dùng:

**Scripts/TransitionMask.cs**

```csharp
readonly Vector4[] shapeA = new Vector4[MaxShapes];
readonly Vector4[] shapeB = new Vector4[MaxShapes];

void LateUpdate()
{
    int count = Mathf.Min(TransitionShape.Active.Count, MaxShapes);
    for (int i = 0; i < count; i++)
        TransitionShape.Active[i].Encode(out shapeA[i], out shapeB[i]);

    Shader.SetGlobalVectorArray(ShapeAId, shapeA);
    Shader.SetGlobalVectorArray(ShapeBId, shapeB);
    Shader.SetGlobalInteger(CountId, count);
}
```

`SetGlobalInteger` chứ không phải `SetGlobalInt`: cái tên sau là di sản cũ, thật ra nó ghi một số thực, và biến `int` trong shader sẽ đọc sai.

## Bước 2: signed distance

Với một hình cầu, "pixel có nằm trong không" là so khoảng cách tới tâm với bán kính. Muốn ghép nhiều hình khác loại thì cần một cách hỏi chung cho mọi hình. Signed distance function (SDF) là cách đó: một hàm trả về khoảng cách từ điểm tới **bề mặt** của hình, âm nếu điểm nằm trong, dương nếu nằm ngoài, bằng 0 ngay trên bề mặt.

```hlsl
float SdSphere(float3 p, float3 center, float radius)
{
    return length(p - center) - radius;
}

float SdBox(float3 p, float3 center, float3 halfSize, float rounding)
{
    float3 q = abs(p - center) - halfSize;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - rounding;
}

float SdCapsule(float3 p, float3 a, float3 b, float radius)
{
    float3 pa = p - a;
    float3 ba = b - a;
    float h = saturate(dot(pa, ba) / max(dot(ba, ba), 1e-6));
    return length(pa - ba * h) - radius;
}
```

- **Hình cầu** là khoảng cách tới tâm trừ bán kính.
- **Hình hộp** gập điểm về góc phần tám dương bằng `abs`, vì hộp đối xứng. Sau đó đo xem điểm vượt khỏi mặt hộp bao xa. Trừ thêm `rounding` thì góc hộp được bo tròn.
- **Viên nhộng** là mọi điểm cách một đoạn thẳng không quá `radius`. `h` là vị trí gần nhất trên đoạn `a` tới `b`, kẹp trong 0 tới 1 để không trượt ra ngoài hai đầu.

Ba công thức này là công thức chuẩn, mình lấy từ danh sách của [Inigo Quilez](https://iquilezles.org/articles/distfunctions/). Trang đó có thêm vài chục hình khác, đều gắn vào đây được theo cùng một cách.

Cái hay của SDF là ghép hình rất rẻ. Hợp của nhiều hình (điểm nằm trong **bất kỳ** hình nào) chỉ là lấy khoảng cách nhỏ nhất:

```hlsl
float TransitionDistance(float3 positionWS)
{
    float d = 1e5;
    [loop]
    for (int i = 0; i < _TransitionShapeCount; i++)
    {
        float4 a = _TransitionShapeA[i];
        float4 b = _TransitionShapeB[i];
        float shape = a.w < 0.5 ? SdSphere(positionWS, a.xyz, b.w)
                    : a.w < 1.5 ? SdBox(positionWS, a.xyz, b.xyz, b.w)
                    :             SdCapsule(positionWS, a.xyz, b.xyz, b.w);
        d = min(d, shape);
    }
    return d;
}
```

`[loop]` dặn compiler giữ nguyên vòng lặp chứ không trải ra, vì số hình thay đổi theo từng frame. Trong vòng lặp không có lệnh đọc texture nào, nên không vướng lỗi đạo hàm như ở [bài toon](/lab/shader-toon-urp).

## Bước 3: cắt theo mặt nạ

Có khoảng cách rồi thì cắt giống hệt dissolve, chỉ khác đơn vị: khoảng cách tính bằng mét, nên `_EdgeWidth` và độ lởm chởm của mép cũng tính bằng mét.

```hlsl
half TransitionClip(float3 positionOS, half3 normalOS)
{
    float3 positionWS = TransformObjectToWorld(positionOS);
    half3 normalWS = TransformObjectToWorldNormal(normalOS);
    half noise = DissolveNoise(positionWS, normalWS) - 0.5h;

    float d = TransitionDistance(positionWS) + noise * _NoiseStrength;
    d = _SphereInvert > 0.5h ? -d : d;
    clip(d);
    return 1.0h - saturate(d / max(_EdgeWidth, 1e-4h));
}
```

Noise được trừ 0.5 để dao động quanh 0: có chỗ mép lấn vào, có chỗ lùi ra, còn mép trung bình vẫn nằm đúng trên bề mặt hình. `_NoiseStrength` giờ là số mét mép được phép lệch.

Chỗ đáng để ý là noise đọc theo **world space**, ngược hẳn với [phần 1](/lab/shader-dissolve-urp), nơi mình đã giải thích vì sao dissolve phải dùng object space. Lý do đảo lại vì đối tượng đã khác: tường, sàn, bậc thang là những object riêng biệt và đứng yên. Mép cắt chạy qua chỗ bức tường giáp sàn phải liền một mạch. Nếu mỗi object đọc noise theo không gian riêng của nó, tới chỗ giáp nhau hoa văn sẽ gãy khúc. Vật không di chuyển thì world space không có nhược điểm gì.

`_SphereInvert` lật dấu khoảng cách. Không lật thì mọi thứ **trong** hình bị cắt, dùng để khoét tường. Lật thì chỉ phần **trong** hình được giữ, dùng để level hiện ra dần.

## Bước 4: gắn vào shader dissolve

Mình không viết shader mới. Mặt nạ global chỉ là hình dạng thứ tư của `Bill/Dissolve`:

```hlsl
[KeywordEnum(Noise, Direction, Sphere, Global)] _Shape ("Shape", Float) = 0
```

và trong hàm cắt chung:

**Shaders/Dissolve/BillDissolveCore.hlsl**

```hlsl
#include "BillTransition.hlsl"

half DissolveClip(float3 positionOS, half3 normalOS)
{
#if defined(_SHAPE_GLOBAL)
    return TransitionClip(positionOS, normalOS);
#else
    half t = DissolveTime(positionOS, normalOS) - DissolveThreshold();
    clip(t);
    return 1.0h - saturate(t / max(_EdgeWidth, 1e-4h));
#endif
}
```

Vì mọi pass (màu, viền, bóng, depth) đều gọi `DissolveClip`, nên mọi thứ phần 1 đã làm đúng thì ở đây cũng đúng luôn, không phải viết thêm: bóng của tường bị khoét cũng thủng, mặt trong của tường có màu tối, SSAO không tô bóng vào chỗ đã mất. Đây là lợi ích của việc gom việc cắt vào một hàm duy nhất từ đầu loạt bài.

## Bước 5: hình dạng là component

Mỗi hình trong cảnh là một GameObject gắn component `TransitionShape`. Kéo, xoay, scale trong Scene view như mọi object khác; Gizmo vẽ khung hình khi được chọn.

**Scripts/TransitionShape.cs** (trích)

```csharp
internal void Encode(out Vector4 a, out Vector4 b)
{
    Vector3 p = transform.position;
    switch (kind)
    {
        case Kind.Box:
            a = new Vector4(p.x, p.y, p.z, 1f);
            Vector3 half = transform.lossyScale * 0.5f;
            b = new Vector4(half.x, half.y, half.z, radius);
            break;
        case Kind.Capsule:
            Vector3 end = capsuleEnd != null ? capsuleEnd.position : p;
            if (stopShortOfEnd && capsuleEnd != null)
                end -= (end - p).normalized * radius;
            a = new Vector4(p.x, p.y, p.z, 2f);
            b = new Vector4(end.x, end.y, end.z, radius);
            break;
        default:
            a = new Vector4(p.x, p.y, p.z, 0f);
            b = new Vector4(0f, 0f, 0f, radius);
            break;
    }
}
```

Hộp lấy kích thước từ scale của transform nên chỉnh bằng tay kéo Scale là thấy ngay, nhưng hộp luôn thẳng theo trục thế giới, không xoay. Muốn hộp xoay được thì phải gửi thêm ma trận xoay; với transition thì mình chưa cần.

Component tự đăng ký vào một danh sách tĩnh khi bật và tự rút ra khi tắt. `TransitionMask` (một cái duy nhất trong cảnh) đọc danh sách đó mỗi frame. Nhờ vậy bật tắt một hình chỉ là bật tắt GameObject.

![Mặt nạ lúc đứng yên: sàn chỉ còn trong hình cầu và hình hộp, bức tường sau có viền xanh bao theo cạnh hộp](/images/lab/dissolve/dissolve-p4-shapes.webp)

Ảnh động đầu bài dùng thêm `ShapePulse`: mỗi hình phình ra từ 0 tới cỡ tối đa rồi co lại, lệch pha nhau để mở ra lần lượt. Level dùng material bật `_SphereInvert` (giữ phần bên trong), nằm trên một nền tối dùng `Bill/Toon` thường. Transition vào màn chơi, hiện dần khu vực vừa mở khóa, hay một phép thuật biến đổi thế giới đều là cùng một thiết lập này, chỉ khác cách hình dạng chuyển động.

## Bước 6: nhìn xuyên tường

Game góc nhìn từ trên xuống nào cũng gặp: nhân vật đi ra sau tường là biến mất.

![Burrow đang đứng sau bức tường tối, không thấy đâu](/images/lab/dissolve/dissolve-p4-hidden.webp)

Giải pháp: một viên nhộng chạy từ camera tới ngực nhân vật. Viên nhộng đi theo camera và nhân vật mỗi frame, nên bức tường nào chắn giữa hai điểm đó đều bị khoét. Chỉ vật cản mới dùng material có Shape là Global. Sàn dùng `Bill/Toon` thường nên viên nhộng đi xuyên qua sàn mà sàn vẫn nguyên.

![Bức tường trước mặt bị khoét một lỗ viền cháy đúng chỗ Burrow đứng, bức tường cam phía sau còn nguyên](/images/lab/dissolve/dissolve-p4-seethrough.webp)

Viên nhộng có một cái bẫy ở đầu cuối. Nó dừng ở ngực nhân vật, nhưng đầu viên nhộng là một nửa hình cầu bán kính 0.75 m, trùm ra sau lưng nhân vật đúng 0.75 m. Nhân vật đứng sát bức tường phía sau thì bức tường đó cũng bị khoét:

![Trái: viên nhộng dài tới ngực, bức tường cam sau lưng Burrow bị ăn một mảng đen. Phải: viên nhộng dừng trước ngực một đoạn bằng bán kính, tường sau nguyên vẹn](/images/lab/dissolve/dissolve-p4-capsule-compare.webp)

Tường phía sau không bao giờ che nhân vật, nên không có lý do gì để khoét nó. Sửa bằng cách lùi đầu cuối viên nhộng về phía camera đúng một khoảng bằng bán kính. Đó là dòng `stopShortOfEnd` ở trên: mép cầu của viên nhộng giờ vừa chạm ngực nhân vật và không trùm ra sau.

![Burrow đi qua đi lại sau bức tường, lỗ khoét đi theo](/images/lab/shaders/dissolve-seethrough.webp)

Bài [Wall Cutout của Daniel Ilett](https://danielilett.com/2021-03-19-tut5-15-wall-cutout/) giải bài toán này bằng cách khác: một hình tròn trong **screen space** quanh vị trí nhân vật trên màn hình. Hình tròn đó cắt mọi thứ nằm trong nó trên màn hình, kể cả tường phía sau, nên bài đó phải raycast từ camera tới nhân vật để chọn ra đúng những bức tường chắn đường, rồi mới gửi mặt nạ cho riêng chúng. Viên nhộng trong world space tự làm việc chọn lọc đó, vì nó chỉ tồn tại trong khoảng giữa camera và nhân vật. Đổi lại, lỗ có kích thước cố định theo mét: tường càng gần camera thì lỗ trên màn hình càng to. Với góc nhìn từ trên xuống, tường thường cách camera gần như nhau, nên chuyện đó không đáng kể.

## Bước 7: X-ray

Khoét tường đôi khi là quá nhiều: tường là vật cản trong gameplay, người chơi cần thấy nó còn đó. X-ray là cách mềm hơn: tường giữ nguyên, nhân vật hiện ra thành một bóng sáng ở chỗ bị che.

![Tường nguyên vẹn, bóng Burrow màu xanh phát sáng hiện xuyên qua](/images/lab/dissolve/dissolve-p4-xray.webp)

Ý tưởng dựa trên depth test. Bình thường một pixel chỉ được vẽ nếu nó **gần** camera hơn thứ đã vẽ ở đó (`ZTest LEqual`). Đảo lại thành `ZTest Greater` thì pixel chỉ được vẽ khi có thứ gì đó **che** nó. Đó chính xác là những phần bị tường che.

X-ray là một material thứ hai gắn lên nhân vật, sau material chính. Unity vẽ lại mesh lần nữa với material đó. Lần đầu mình viết, shader chỉ có một pass `ZTest Greater`, và kết quả thế này:

![Trái: không có stencil, những chỗ Burrow tự che mình (chùm tóc, bàn tay, bàn chân) bị tô xanh ngay trên phần đang nhìn thấy. Phải: có stencil, phần nhìn thấy sạch, chỉ phần sau tường mới có bóng xanh](/images/lab/dissolve/dissolve-p4-xray-compare.webp)

`ZTest Greater` không phân biệt thứ che là bức tường hay là chính nhân vật. Chùm tóc nằm trước đầu thì phần đầu phía sau chùm tóc cũng "bị che", nên X-ray tô lên đó.

Sửa bằng stencil, một bộ đệm đi kèm depth buffer mà shader có thể ghi và đọc. Shader X-ray có hai pass:

**Shaders/Dissolve/BillXRay.shader**

```hlsl
Pass
{
    Name "XRayMark"
    Tags { "LightMode" = "SRPDefaultUnlit" }
    ZWrite Off
    ZTest LEqual
    ColorMask 0
    Stencil { Ref [_StencilRef] Comp Always Pass Replace }
    // fragment trả về 0, chỉ để đánh dấu stencil
}

Pass
{
    Name "XRay"
    Tags { "LightMode" = "UniversalForward" }
    ZWrite Off
    ZTest Greater
    Blend One One
    Stencil { Ref [_StencilRef] Comp NotEqual }
    // fragment: màu X-ray, đậm ở rìa
}
```

Pass đầu vẽ lại nhân vật với depth test bình thường, không ghi màu, chỉ ghi số `_StencilRef` vào stencil ở mọi pixel mà nhân vật **đang hiện**. Pass sau là X-ray, nhưng bỏ qua những pixel đã đánh dấu. Phần tóc che đầu vẫn qua được depth test của pass sau, nhưng pixel đó đã được đánh dấu là "nhân vật đang hiện ở đây", nên bị loại.

Thứ tự hai pass dựa vào tag. Với cùng một object, URP vẽ pass `SRPDefaultUnlit` trước pass `UniversalForward`. Material X-ray nằm ở hàng đợi `Transparent-50`, tức là sau mọi vật đục và sau hàng đợi `AlphaTest` của tường dissolve, nên lúc X-ray chạy depth của tường đã có sẵn.

Màu X-ray đậm ở rìa và nhạt ở giữa, theo công thức fresnel quen thuộc:

```hlsl
half rim = pow(1.0h - saturate(dot(normalize(input.normalWS), viewDirWS)), _XRayRimPower);
return half4(_XRayColor.rgb * (_XRayFill + rim), 1.0h);
```

Nhìn qua tường, đường viền cơ thể dễ đọc hơn một mảng màu đặc. `Blend One One` cộng màu vào, nên bóng X-ray có cảm giác phát sáng và không che mất hoa văn của tường.

## Chi phí

Mỗi pixel của vật dùng Shape Global chạy vòng lặp qua mọi hình. 16 hình SDF là vài trăm phép tính, với GPU hiện nay thì nhẹ, nhưng cộng thêm `clip` thì không nên đặt lên mọi thứ trong cảnh. Cách mình dùng: chỉ những vật có thể chắn camera (tường, cột, mái) mới dùng Shape Global, và lúc không có hình nào (`_TransitionShapeCount` bằng 0) vòng lặp thoát ngay.

## File trong bài

Mọi file nằm trong [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip). Material `Global_Dark` (khoét phần bên trong) và `GlobalKeep_Light` (chỉ giữ phần bên trong) dùng texture prototype đi kèm gói; `XRay_Burrow` gắn làm material thứ hai trên bất kỳ nhân vật nào.

<div class="lesson-files"><strong>Shader</strong><em>Shaders/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/BillTransition.hlsl" download>BillTransition.hlsl<small>3 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolveCore.hlsl" download>BillDissolveCore.hlsl<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolve.shader" download>BillDissolve.shader<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillXRay.shader" download>BillXRay.shader<small>3 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/Dissolve_09_XRayNoStencil.shader" download>Dissolve_09_XRayNoStencil.shader<small>3 KB</small></a>
</div>
<div class="lesson-files"><strong>Script</strong><em>Scripts</em>
<a href="/downloads/shaders/files/dissolve/TransitionShape.cs" download>TransitionShape.cs<small>2 KB</small></a>
<a href="/downloads/shaders/files/dissolve/TransitionMask.cs" download>TransitionMask.cs<small>1 KB</small></a>
<a href="/downloads/shaders/files/dissolve/ShapePulse.cs" download>ShapePulse.cs<small>1 KB</small></a>
<a href="/downloads/shaders/files/dissolve/PathPingPong.cs" download>PathPingPong.cs<small>1 KB</small></a>
</div>

## Tham khảo

- [Minions Art: World Position Shader](https://minionsart.github.io/tutorials/), mẹo gửi vị trí vào shader bằng biến global và đổi texture trong một bán kính.
- [Inigo Quilez: distance functions](https://iquilezles.org/articles/distfunctions/), công thức SDF cho hình cầu, hộp, viên nhộng và nhiều hình khác.
- [Daniel Ilett: Wall Cutout in Shader Graph and URP](https://danielilett.com/2021-03-19-tut5-15-wall-cutout/), cách khoét tường bằng hình tròn screen space kèm raycast.
- [Unity: ShaderLab Stencil](https://docs.unity3d.com/Manual/SL-Stencil.html).

Burrow là asset từ Asset Store (Monsters Ultimate Pack), chỉ dùng để minh họa và không có trong gói tải về.
