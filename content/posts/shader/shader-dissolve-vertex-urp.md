---
title: "Dissolve shader cho Unity URP, phần 3: tan đến đâu đẩy mesh đến đó, và hút vật vào một điểm"
date: "2026-09-27"
lang: vi
series: "shader"
order: 5
excerpt: "Cho vertex chuyển động theo dissolve: vỏ phồng lên đúng ở mép đang cháy, hoặc cả thân bị kéo dài rồi hút vào một điểm. Vì sao đẩy mesh hay ra gai, vì sao phải đẩy theo normal mượt, và vì sao vertex nên đọc một bản noise mờ hơn pixel."
coverImage: "/images/lab/shaders/dissolve-vertex-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Dissolve"]
published: true
featured: false
---

![Trái: Burrow tan từ chân lên, mép cháy loe ra như váy. Phải: Burrow bị kéo dài thành phễu rồi hút vào quả cầu xanh](/images/lab/shaders/dissolve-vertex.webp)

Hai phần trước chỉ cắt pixel. Dù tan kiểu gì, bề mặt còn lại vẫn nằm yên đúng chỗ cũ, như một tờ giấy bị đục lỗ. Muốn vật trông như đang cháy, đang sôi hay đang bị hút đi thì chính hình khối phải chuyển động theo mép cắt.

Bài này thêm hai kiểu chuyển động cho vertex:

- **Đẩy (push):** vỏ phồng ra ở đúng chỗ đang cháy, rồi xẹp lại khi mép cắt đi qua. Ý tưởng lấy từ bài [Vertical Dissolve của Minions Art](https://www.patreon.com/posts/shader-graph-35698820).
- **Kéo (pull):** phần đã tan bị kéo dài rồi hút về một điểm, như bị cổng không gian nuốt.

Đẩy mesh là phần dễ ra xấu nhất của cả loạt bài. Lần đầu mình viết, cái hộp thử nghiệm mọc đầy gai. Bài này đi qua đúng những lần sai đó.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Vertex biết mép cắt</span><span>Đẩy một chiều</span><span>Đẩy thành bướu</span><span>Noise mờ cho vertex</span><span>Normal mượt</span><span>Kéo về một điểm</span></div></div>

**Tải mã nguồn:** [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip), cùng gói với [phần 1](/lab/shader-dissolve-urp) và [phần 2](/lab/shader-dissolve-shapes-urp).

## Bước 1: cho vertex biết mép cắt ở đâu

Pixel biết mình sắp bị cắt nhờ con số `t - threshold`: bằng 0 ngay trên mép cắt, dương ở phần còn nguyên, âm ở phần đã tan. Vertex shader tính đúng con số đó, bằng đúng hàm `DissolveTime` của phần 1 và phần 2, rồi dựa vào nó để dời vị trí.

**Shaders/Dissolve/BillDissolveForwardPass.hlsl**

```hlsl
DissolveVaryings DissolveVertex(DissolveAttributes input)
{
    // ...
    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    VertexPositionInputs positionInputs = GetVertexPositionInputs(positionOS);
    // ...
    output.restPositionOS = input.positionOS.xyz;
    output.restNormalOS = input.normalOS;
    return output;
}
```

Hai dòng cuối là thứ đã chuẩn bị từ phần 1: pixel vẫn đọc noise theo vị trí **gốc** của vertex, không phải vị trí sau khi dời. Nếu pixel đọc theo vị trí đã dời, thì vertex vừa phồng ra, noise tại chỗ đó đổi giá trị, mép cắt nhảy sang chỗ khác, vertex ở chỗ mới lại phồng, và mép cắt cứ đuổi theo chính nó. Đọc theo vị trí gốc thì hoa văn đứng yên trên bề mặt, chỉ hình khối là chuyển động.

`DissolveDisplace` cũng được gọi trong vertex shader của pass bóng, pass depth và pass viền (xem phần 1). Bỏ sót pass nào thì pass đó vẫn thấy hình khối cũ: bóng đổ không phồng, còn viền thì vẽ theo cái vỏ không còn nữa.

Kiểu chuyển động chọn trên material, trong mục **Vertex**. Mình dùng chung với hình dạng **Direction** của phần 2 (gắn `DissolveShape` lên vật), vì như bước 4 sẽ giải thích, đẩy mesh cần một hình dạng dẫn đường.

![Inspector của material Dissolve_Burrow_Push: Shape là Direction, Vertex Motion là Push, Vertex Band 0.2, Vertex Noise Mip 5, Push Distance 0.1](/images/lab/dissolve/dissolve-p3-inspector-push.webp)

Kết quả cuối cùng của các bước dưới đây trông thế này: dải đang cháy chạy từ chân lên, và chỗ nào đang cháy thì vỏ phồng ra chỗ đó.

![Burrow ở Amount 0.2, 0.35 và 0.5: dải cháy đi từ chân lên ngực, thân loe ra đúng ở dải đó](/images/lab/dissolve/dissolve-p3-push-sequence.webp)

## Bước 2: đẩy một chiều

Cách đầu tiên mình viết: vertex càng gần mép cắt thì bị đẩy ra càng xa, theo hướng normal. Gọi `d` là khoảng cách tới mép cắt, tính theo đơn vị của `t`:

```hlsl
half d = DissolveTime(positionOS, normalOS) - DissolveThreshold();
half w = 1.0h - saturate(d / _VertexBand);
w = w * w * (3.0h - 2.0h * w);
positionOS += normalOS * _PushDistance * w;
```

`w` bằng 1 ở mép cắt, giảm về 0 khi vertex nằm sâu trong phần còn nguyên quá `_VertexBand`. Dòng giữa là smoothstep viết tay, để chỗ bắt đầu phồng không bị gãy khúc.

Mình thử trên một khối hộp chia 24 ô mỗi mặt, tan theo hướng từ dưới lên, để dễ nhìn hơn trên nhân vật:

![Đẩy một chiều: mép cắt của hộp rách thành từng mảnh tam giác nhọn chĩa ra ngoài](/images/lab/dissolve/dissolve-p3-push-onesided.webp)

Mép cắt tua tủa mảnh vụn. Lỗi nằm ở phần đã tan. Với `d` âm, `saturate` kẹp về 0, nên `w` bằng 1: mọi vertex đã bị cắt vẫn bị đẩy ra hết cỡ. Những vertex đó không hiện, vì pixel của chúng đã bị `clip`. Nhưng tam giác nằm vắt qua mép cắt có một đỉnh bị đẩy xa, một đỉnh ở gần, nên phần còn hiện của nó bị kéo xiên thành một mảnh nhọn.

## Bước 3: đẩy thành bướu

Muốn "tan đến đâu đẩy đến đó" thì chỗ phồng phải đi theo mép cắt: cao nhất ngay tại mép, hạ về 0 ở cả hai phía. Chỉ cần lấy trị tuyệt đối:

```hlsl
half w = 1.0h - saturate(abs(d) / max(_VertexBand, 1e-4h));
```

Vertex đã tan xa quá `_VertexBand` quay về đúng chỗ cũ, nên tam giác vắt qua mép cắt không còn bị kéo xiên.

![Đẩy thành bướu nhưng noise vẫn nét: bớt mảnh lớn, nhưng mép cắt vẫn lởm chởm những khe nứt nhỏ](/images/lab/dissolve/dissolve-p3-push-bump.webp)

Đỡ hơn, nhưng vẫn rách. Lần này lỗi không nằm ở đường cong mà ở **mật độ**. Hộp chia 24 ô mỗi cạnh, hai vertex cạnh nhau cách nhau khoảng 3 cm. Noise đọc ở mức mip 0 có chi tiết nhỏ hơn thế: hai vertex sát nhau có thể nhận hai giá trị `d` cách xa nhau, một cái bị đẩy 12 cm, cái bên cạnh không nhúc nhích. Mesh không thể hiện một chi tiết nhỏ hơn khoảng cách giữa các vertex của nó, và thứ gì nhỏ hơn thì thành gai.

## Bước 4: vertex đọc noise mờ

Cách sửa là cho vertex đọc một bản noise đã mờ bớt, còn pixel vẫn đọc bản nét. Texture sẵn có các mức mip, mỗi mức là ảnh thu nhỏ một nửa của mức trước, tức là bản mờ dần của cùng một noise. Hàm đọc noise nhận mức mip làm tham số:

**Shaders/Dissolve/BillDissolveCore.hlsl**

```hlsl
half SampleDissolveNoise(float2 uv, half mip)
{
    return SAMPLE_TEXTURE2D_LOD(_NoiseMap, sampler_NoiseMap, uv, mip).r;
}
```

`DissolveNoise` và `DissolveTime` truyền tham số này xuống, và `DissolveDisplace` gọi với `_VertexNoiseMip`:

```hlsl
half d = DissolveTime(positionOS, normalOS, _VertexNoiseMip) - DissolveThreshold();
```

Nhìn tận mắt ba mức mip của Perlin_02 thì dễ hình dung hơn. Mỗi mức mip là ảnh thu nhỏ một nửa so với mức trước, bằng bộ lọc Box (mặc định trong mục Advanced của import settings), rồi phóng to lại cùng cỡ để so:

![Perlin_02 ở mip 0 (128 pixel), mip 3 (16 pixel) và mip 5 (4 pixel): từ nhiều chi tiết nhỏ, tới vài mảng lớn, tới chỉ còn bốn ô xám](/images/lab/dissolve/dissolve-p3-noise-mips.webp)

Chọn mức mip bằng một phép tính nhỏ. Với `_NoiseScale` 2.2, một ô noise dài 1 / 2.2 = 0.45 m. Tile 128 pixel ở mip 0 thì mỗi pixel phủ 3.5 mm. Mỗi mức mip gấp đôi con số đó: mip 3 là 2.8 cm, xấp xỉ khoảng cách vertex, vẫn ra gai. Mip 5 là 11 cm, mỗi pixel noise phủ khoảng bốn vertex, và mép loe ra mượt như hộp bên phải. Mesh thưa hơn thì cần mức mip cao hơn.

![Bướu với noise mờ: mép hộp loe ra mượt như váy, không còn khe nứt, mép cắt vẫn sắc](/images/lab/dissolve/dissolve-p3-push-blur.webp)

Mép cắt thì vẫn nét, vì pixel vẫn đọc mip 0. Chỗ phồng do vertex quyết định chỉ còn là một đường bao mềm quanh mép cắt, không bám theo từng chi tiết nhỏ. Mắt người không nhận ra chỗ lệch đó, vì mép cắt với viền sáng mới là thứ thu hút ánh nhìn.

Có một giới hạn nên biết trước. Với dissolve chỉ dùng noise (không có hình dạng của phần 2), noise sau khi làm mờ gần như chỉ còn một màu xám trung bình, và cả bề mặt phồng lên cùng một lúc chứ không theo lỗ nào. Đẩy mesh chỉ đẹp khi có một hình dạng dẫn đường, như tan theo hướng hay từ một điểm, lúc đó noise mờ chỉ làm cho vành phồng lượn sóng.

## Bước 5: đẩy theo normal nào

Bài [toon shader](/lab/shader-toon-urp) đã gặp chuyện này với viền inverted hull: mesh có cạnh cứng thì mỗi đỉnh ở cạnh là hai, ba vertex chồng lên nhau, mỗi cái mang normal của mặt riêng. Đẩy theo normal đó thì các mặt tách khỏi nhau ở cạnh.

![Ba hộp cùng một shader. Trái: normal của từng mặt, cạnh hộp nứt thành khe đen. Giữa: normal mượt trong UV3, mép loe liền mạch. Phải: khối hộp chỉ có 24 vertex, không có gì để phồng](/images/lab/dissolve/dissolve-p3-mesh-compare.webp)

Cách sửa cũng giống bài toon: đẩy theo normal mượt đã bake vào UV3.

```hlsl
half3 direction = dot(smoothNormalOS, smoothNormalOS) > 0.01h ? smoothNormalOS : normalOS;
float3 offsetWS = TransformObjectToWorldDir(direction) * (_PushDistance * w);
positionOS += TransformWorldToObjectDir(offsetWS, false);
```

Mesh nào có UV3 (model import qua `SmoothNormalBaker` của bài toon) thì dùng normal mượt, không có thì dùng normal thường. `smoothNormalOS` là `TEXCOORD3` trong struct đầu vào của mọi pass.

Hai dòng cuối đổi hướng sang world, nhân với khoảng cách tính bằng mét, rồi đổi ngược về object space mà không chuẩn hóa (tham số `false`). Nếu cộng thẳng `direction * _PushDistance` trong object space, vật scale 2 lần sẽ phồng gấp đôi, và mesh xuất theo centimet sẽ phồng gấp trăm lần.

Hộp bên phải là cái bẫy còn lại: khối Cube có sẵn của Unity chỉ có 24 vertex, nằm hết ở tám góc. Không có vertex nào ở giữa mặt để phồng. Muốn đẩy mesh thì mesh phải đủ dày ở những chỗ cần phồng. Với nhân vật thì thường đã đủ; với prop ít polygon thì phải chia thêm, hoặc chấp nhận chỉ cắt pixel.

![Burrow tan từ chân lên, phần thân sát mép cháy loe ra ngoài](/images/lab/dissolve/dissolve-p3-burrow.webp)

## Bước 6: kéo về một điểm

Kéo dùng lại gần như toàn bộ phần trên, chỉ khác hai chỗ. Thứ nhất, đường cong trở lại một chiều: phần đã tan phải bay hẳn về đích, không được quay về chỗ cũ. Thứ hai, thay vì cộng một khoảng theo normal, vertex được `lerp` về một điểm trong world:

```hlsl
half w = 1.0h - saturate(d / max(_VertexBand, 1e-4h));
w = w * w * (3.0h - 2.0h * w);
float3 positionWS = TransformObjectToWorld(positionOS);
positionWS = lerp(positionWS, _PullTarget.xyz, w * w);
positionOS = TransformWorldToObject(positionWS);
```

Cái mà ở bước 2 là lỗi (tam giác vắt qua mép cắt bị kéo xiên) giờ lại chính là hiệu ứng mình cần: những tam giác đó bị kéo dài thành các sợi chạy về đích, trông như vật bị hút vào. `w * w` làm vertex bám lại chỗ cũ lâu hơn một chút rồi mới lao đi, nên phần đang bị hút có dạng phễu chứ không phải một đường thẳng.

![Burrow ở Amount 0.3, 0.5 và 0.7: phía gần quả cầu bắt đầu nhọn ra, rồi cả thân bị kéo thành phễu hướng về quả cầu](/images/lab/dissolve/dissolve-p3-pull-sequence.webp)

Để phía gần đích tan trước, material dùng hình dạng **Sphere** của phần 2, với tâm cầu đặt tại đích. Script `DissolveShape` đẩy luôn tâm cầu vào `_PullTarget`:

```csharp
block.SetFloat(RadiusId, radius);
block.SetVector(PullTargetId, center);
```

Gán quả cầu phát sáng vào ô `sphereCenter` là xong. Đích di chuyển thì dòng vertex cũng uốn theo.

Kéo mesh có một cái bẫy mà cắt pixel không có: **culling**. Unity chỉ vẽ một vật khi hộp bao của nó nằm trong khung hình, và hộp bao đó tính theo mesh gốc. Vertex đã bị kéo lên tận quả cầu thì nằm ngoài hộp bao. Camera quay đi chỉ còn thấy quả cầu, thì cả con Burrow (kể cả dòng vertex đang bay vào cầu) bị bỏ qua không vẽ.

![Khung vàng là hộp bao của Burrow ở tư thế gốc, thứ Unity dùng để quyết định có vẽ hay không. Dòng vertex bị kéo vươn ra khỏi khung, gần tới quả cầu](/images/lab/dissolve/dissolve-p3-bounds.webp)

Với `SkinnedMeshRenderer`, nới hộp bao ra:

```csharp
var bounds = skinned.localBounds;
bounds.Expand(4f);
skinned.localBounds = bounds;
```

Với `MeshRenderer` thường thì đặt `mesh.bounds` lớn hơn, giống cách lưới nước ở [bài stylized water](/lab/shader-stylized-water-urp) nới hộp bao cho đỉnh sóng.

## Bước 7: đừng phồng trước khi bắt đầu

Còn một chỗ sửa nhỏ nhưng dễ bỏ sót. Phần 1 cho ngưỡng bắt đầu từ `-_EdgeWidth` để Amount 0 không có viền sáng. Vertex có dải riêng là `_VertexBand`, thường rộng hơn viền. Nếu ngưỡng chỉ lùi theo viền, thì ở Amount 0 những vertex có `t` gần 0 đã nằm trong dải và bị đẩy, dù chưa có pixel nào bị cắt:

![Cả hai ảnh đều ở Amount 0, dải vertex 0.5. Trái: ngưỡng chỉ lùi theo viền, chân Burrow phình thành một khối và hai tay sưng lên. Phải: ngưỡng lùi theo dải vertex, Burrow nguyên vẹn](/images/lab/dissolve/dissolve-p3-start-compare.webp)

Nên ngưỡng lùi theo dải nào rộng hơn:

```hlsl
half DissolveThreshold()
{
#if defined(_VERTEX_PUSH) || defined(_VERTEX_PULL)
    half start = max(_EdgeWidth, _VertexBand);
#else
    half start = _EdgeWidth;
#endif
    return lerp(-start, 1.001h, _DissolveAmount);
}
```

Hàm này được gọi cả ở vertex lẫn pixel, nên keyword `_VERTEX_` phải có mặt ở cả hai giai đoạn. Vì vậy mình khai báo bằng `shader_feature_local` chứ không phải `shader_feature_local_vertex`. Nếu dùng bản `_vertex`, pixel shader không thấy keyword, tính ra một ngưỡng khác với vertex, và chỗ phồng lệch khỏi mép cắt.

## Tiếp theo

[Phần 4](/lab/shader-dissolve-transition-urp) rời khỏi từng vật riêng lẻ: một mặt nạ dùng chung cho cả cảnh, ghép từ nhiều hình dạng, để làm transition, nhìn xuyên tường khi nhân vật bị che, và X-ray.

## File trong bài

Mọi file nằm trong [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip). Các file liên quan tới phần này:

<div class="lesson-files"><strong>Shader</strong><em>Shaders/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/BillDissolveCore.hlsl" download>BillDissolveCore.hlsl<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolveForwardPass.hlsl" download>BillDissolveForwardPass.hlsl<small>4 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolvePasses.hlsl" download>BillDissolvePasses.hlsl<small>5 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/Dissolve_08_PushOneSided.shader" download>Dissolve_08_PushOneSided.shader<small>7 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_11_VertexStartNaive.shader" download>Dissolve_11_VertexStartNaive.shader<small>7 KB</small></a>
</div>
<div class="lesson-files"><strong>Script</strong><em>Scripts và Editor</em>
<a href="/downloads/shaders/files/dissolve/DissolveShape.cs" download>DissolveShape.cs<small>5 KB</small></a>
<a href="/downloads/shaders/files/toon/SmoothNormalBaker.cs" download>SmoothNormalBaker.cs<small>1 KB</small></a>
</div>

Material để thử kiểu đẩy: trên `Dissolve_Demo`, chọn **Shape: Direction**, **Vertex Motion: Push**, **Vertex Band** 0.2, **Push Distance** 0.1, **Vertex Noise Mip** 5, rồi gắn `DissolveShape` lên vật.

## Tham khảo

- [Minions Art: Vertical Dissolve / Teleport](https://www.patreon.com/posts/shader-graph-35698820), ý tưởng đẩy vertex trong một dải mềm quanh mép tan.
- [Ronja: Vertex Displacement](https://www.ronja-tutorials.com/post/015-wobble-displacement/), nền tảng về dời vertex trong shader.
- [Unity: SkinnedMeshRenderer.localBounds](https://docs.unity3d.com/ScriptReference/SkinnedMeshRenderer-localBounds.html).

Burrow là asset từ Asset Store (Monsters Ultimate Pack), chỉ dùng để minh họa và không có trong gói tải về.
