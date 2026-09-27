---
title: "Dissolve shader cho Unity URP, phần 1: noise, viền cháy và cái bóng không chịu tan"
date: "2026-09-27"
lang: vi
series: "shader"
order: 3
excerpt: "Viết shader dissolve cho Unity 6 URP từ con số không: noise triplanar không lộ đường nối UV, remap noise cho thanh trượt chạy đều, viền cháy HDR, mặt trong của vỏ và bóng đổ tan theo vật."
coverImage: "/images/lab/shaders/dissolve-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Dissolve"]
published: true
featured: true
---

![Burrow cháy tan rồi hiện lại, viền cháy màu cam, bóng trên sàn thủng theo](/images/lab/shaders/dissolve.webp)

Dissolve là hiệu ứng làm vật thể tan biến từng mảng: quái chết cháy thành tro, nhân vật dịch chuyển, rương biến mất sau khi mở. Công thức cốt lõi chỉ có một dòng `clip`, nên đây thường là shader đầu tiên người ta tự viết. Cũng vì chỉ có một dòng nên phần lớn bản dissolve trên mạng dừng ở đó, và mang theo cả loạt lỗi: đường nối UV lộ ra trên nhân vật, nửa đầu thanh trượt chẳng có gì xảy ra, mặt trong của vật rỗng như giấy, và bóng đổ vẫn nằm nguyên trên sàn khi vật đã cháy hết.

Bài này đi qua từng lỗi đó, trên con chuột chũi Burrow. Đây là phần đầu của loạt bài dissolve:

1. **Phần 1 (bài này):** nền móng. Noise, viền cháy, mặt trong, bóng đổ.
2. **Phần 2:** tan theo hình dạng. Theo một hướng, từ tâm ra ngoài, từ ngoài vào trong.
3. **Phần 3:** tan đến đâu đẩy mesh đến đó, và kéo mesh như bị hút vào một điểm.
4. **Phần 4:** transition bằng nhiều hình dạng cùng lúc, dùng để nhìn xuyên tường và làm X-ray.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Noise theo UV</span><span>Noise triplanar</span><span>Remap noise</span><span>Viền cháy</span><span>Mặt trong</span><span>Bóng đổ</span></div></div>

**Môi trường:** Unity 6 (6000.3), URP 17.3. Cần một Volume có **Bloom** (Threshold khoảng 1) để viền cháy tỏa sáng.

**Nền tảng:** phần chiếu sáng dùng lại hàm `ToonLighting` trong [bài toon shader](/lab/shader-toon-urp). Bài này chỉ nói phần dissolve.

**Tải mã nguồn:** [bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip). Danh sách từng file ở [cuối bài](#file-và-texture-trong-bài).

## Ý tưởng: mỗi điểm có một thời điểm biến mất

Trước khi viết code, nên nghĩ về dissolve theo cách này: mỗi điểm trên bề mặt có một con số `t` từ 0 tới 1, là thời điểm điểm đó biến mất. Thanh trượt `_DissolveAmount` chạy từ 0 lên 1. Điểm nào có `t` nhỏ hơn giá trị hiện tại của thanh trượt thì bị cắt.

Cả loạt bài chỉ xoay quanh câu hỏi `t` lấy từ đâu. Lấy từ noise thì vật tan lốm đốm. Lấy từ độ cao thì vật tan từ chân lên đầu. Lấy từ khoảng cách tới một điểm thì vật tan từ chỗ bị bắn. Phần cắt, viền cháy, bóng đổ đều giữ nguyên.

## Chuẩn bị: thêm thông số vào khối CBUFFER

Shader dissolve dùng lại hàm chiếu sáng của toon, nên nó cần đủ các thông số toon cộng thêm thông số dissolve. Tất cả phải nằm trong **một** khối `UnityPerMaterial`, dùng chung cho mọi pass. Tách ra hai khối, hoặc mỗi pass khai báo một kiểu, là SRP Batcher từ chối shader và mỗi vật thể thành một draw call riêng.

**Shaders/Dissolve/BillDissolveInput.hlsl** (phần dissolve, nằm ngay dưới các thông số toon)

```hlsl
TEXTURE2D(_NoiseMap);       SAMPLER(sampler_NoiseMap);

CBUFFER_START(UnityPerMaterial)
    // ... các thông số toon giữ nguyên thứ tự như BillToonInput.hlsl ...
    half   _DissolveAmount;
    half   _NoiseScale;
    half   _NoiseStrength;
    half4  _NoiseRemap;
    half   _EdgeWidth;
    half4  _EdgeColor;
    half4  _InsideColor;
    // ... các thông số của phần 2 và phần 3 ...
CBUFFER_END
```

Khối này khai báo luôn các thông số của phần 2 và phần 3, dù bài này chưa dùng tới. Nếu mỗi phần lại thêm vài dòng vào CBUFFER, material cũ sẽ đọc lệch hết giá trị.

## Bước 1: noise theo UV

Cách ai cũng thử đầu tiên: đọc texture noise theo UV của mesh, rồi cắt những pixel có noise nhỏ hơn thanh trượt.

```hlsl
half noise = SAMPLE_TEXTURE2D(_NoiseMap, sampler_NoiseMap, input.uv * _NoiseScale).r;
clip(noise - _DissolveAmount);
```

`clip(x)` bỏ pixel khi `x` âm, và GPU không vẽ gì ở đó. Noise mình dùng là **Perlin_02** trong [SBS Noise Texture Pack](https://screamingbrainstudios.itch.io/noise-texture-pack), import dạng Single Channel, tắt sRGB, như texture noise của bài nước.

![Bước 1: bụng Burrow bị cắt thành từng dải ngang, hai tay mất một khúc gọn gàng](/images/lab/dissolve/dissolve-01-uvnoise.webp)

Trên quả cầu, cách này trông ổn. Trên nhân vật thật thì hỏng ngay. UV của Burrow được trải phẳng thành từng mảnh để họa sĩ vẽ texture: thân một mảnh, tay một mảnh, mặt một mảnh, mỗi mảnh một tỷ lệ và một hướng khác nhau. Noise đọc theo UV thì bị kéo giãn theo từng mảnh, nên bụng tan thành dải ngang, còn ở chỗ hai mảnh UV giáp nhau thì hoa văn đứt gãy thành một đường thẳng.

Vấn đề nằm ở chỗ UV là tọa độ của **texture**, không phải của **hình khối**. Noise cần một hệ tọa độ bám theo hình dạng 3D của vật.

## Bước 2: noise triplanar theo object space

Có ba hệ tọa độ để chọn:

- **World space:** hoa văn nằm cố định trong thế giới. Nhân vật đi tới đâu, hoa văn trượt trên người tới đó như ánh sáng rọi qua lá cây. Dùng cho hiệu ứng gắn với môi trường thì được, dissolve thì không.
- **Object space:** hoa văn dính vào vật, di chuyển và xoay theo vật. Đây là cái mình cần.
- Nhưng object space tính theo đơn vị của mesh. Một model xuất từ 3ds Max có thể dùng centimet, model khác dùng mét. Cùng `_NoiseScale` mà hai vật ra hai cỡ lỗ khác nhau.

Nên mình dùng object space, nhân với tỷ lệ của vật để quy về mét:

```hlsl
float3 DissolveSpace(float3 positionOS)
{
    float3 scale = float3(length(UNITY_MATRIX_M._m00_m10_m20),
                          length(UNITY_MATRIX_M._m01_m11_m21),
                          length(UNITY_MATRIX_M._m02_m12_m22));
    return positionOS * scale;
}
```

Độ dài ba cột đầu của ma trận model chính là tỷ lệ của vật theo ba trục. Nhân vào thì một đơn vị trong `DissolveSpace` luôn là một mét, và `_NoiseScale` đọc được là "số ô noise trên mỗi mét".

Texture noise là ảnh 2D, còn vị trí là 3D. Triplanar giải quyết bằng cách chiếu texture từ ba phía (nhìn từ trục X, Y, Z), rồi trộn ba kết quả theo hướng của bề mặt: mặt hướng lên dùng hình chiếu từ trên xuống, mặt hướng sang bên dùng hình chiếu từ bên cạnh.

```hlsl
half SampleDissolveNoise(float2 uv)
{
    return SAMPLE_TEXTURE2D_LOD(_NoiseMap, sampler_NoiseMap, uv, 0).r;
}

half TriplanarNoiseRaw(float3 positionMeters, half3 normalOS)
{
    float3 p = positionMeters * _NoiseScale;
    half3 weights = pow(abs(normalOS), 4.0h);
    weights /= max(weights.x + weights.y + weights.z, 1e-4h);
    return SampleDissolveNoise(p.zy) * weights.x
         + SampleDissolveNoise(p.xz) * weights.y
         + SampleDissolveNoise(p.xy) * weights.z;
}
```

Lũy thừa 4 làm vùng chuyển giữa ba hình chiếu hẹp lại. Không có nó, ở những chỗ nghiêng 45 độ cả ba hình chiếu trộn đều nhau, và noise nhòe thành một mảng xám.

`SAMPLE_TEXTURE2D_LOD` với mức mip ghi rõ là cố ý. Phần 3 sẽ đọc noise này trong vertex shader để đẩy mesh, mà vertex shader không có đạo hàm để GPU tự chọn mip. Pixel đọc mức 0 để mép cắt sắc nét. Trong bộ mã tải về, hàm này còn một bản nhận thêm tham số mip; phần 3 sẽ giải thích vì sao vertex lại cố tình đọc một mức mờ hơn. Tile 128 pixel ở mức 0 thì cũng rẻ.

Vị trí và normal đưa vào hàm này là giá trị **gốc** của mesh, trước khi vertex shader làm gì với nó. Trong vertex shader, mình chép chúng sang hai biến riêng:

```hlsl
output.restPositionOS = input.positionOS.xyz;
output.restNormalOS = input.normalOS;
```

Bài này chưa đẩy mesh nên chưa thấy khác biệt, nhưng tới phần 3 thì đây là thứ giữ cho hoa văn không trượt theo mesh.

![Bước 2: lỗ tròn tự nhiên, trải đều khắp người, không còn dải hay đường nối](/images/lab/dissolve/dissolve-02-triplanar.webp)

## Bước 3: remap noise

Kéo thanh trượt từ 0 lên 1 thì thấy một chuyện lạ: từ 0 tới khoảng 0.35 không có gì xảy ra, rồi từ 0.35 tới 0.65 cả con vật tan sạch, phần còn lại của thanh trượt lại không làm gì.

![Hàng trên: noise chưa remap, Amount 0.3 gần như nguyên vẹn, Amount 0.7 đã mất gần hết. Hàng dưới: đã remap, Amount 0.3 bắt đầu thủng, Amount 0.7 còn lại một phần](/images/lab/dissolve/dissolve-remap-compare.webp)

Lý do nằm trong texture. Mình đo Perlin_02: 98% số pixel nằm trong khoảng 0.29 tới 0.71, không có pixel nào đen hẳn hay trắng hẳn. Triplanar còn làm khoảng đó hẹp thêm, vì trộn ba giá trị với nhau thì kết quả dồn về giữa. Trên Burrow, noise thực tế chỉ nằm trong khoảng 0.36 tới 0.64.

Hầu hết texture noise đều vậy, nên trước khi dùng một tile nào, nên đo xem nó thật sự trải từ đâu tới đâu. Sau đó kéo khoảng đó về 0 tới 1:

```hlsl
half noise = /* ba hình chiếu triplanar như trên */;
return saturate((noise - _NoiseRemap.x) / max(_NoiseRemap.y - _NoiseRemap.x, 1e-4h));
```

`_NoiseRemap` là một Vector trên material, mình để (0.36, 0.64). Đổi noise khác thì đo lại. Có thể dùng Unity để đo: render riêng giá trị noise ra màn hình rồi đọc pixel. Mình thì đo thẳng file ảnh bằng một đoạn Python.

## Bước 4: viền cháy

Chỗ bị cắt đang sắc như cắt bằng kéo. Muốn ra cảm giác cháy, những pixel sắp bị cắt phải phát sáng.

Pixel sắp bị cắt là pixel có `t` chỉ lớn hơn thanh trượt một chút. Gọi phần chênh lệch là `t - amount`: bằng 0 ngay trên đường cắt, tăng dần khi đi sâu vào phần còn nguyên. Viền cháy là những pixel có chênh lệch nhỏ hơn `_EdgeWidth`:

```hlsl
half t = DissolveNoise(DissolveSpace(input.restPositionOS), input.restNormalOS) - _DissolveAmount;
clip(t);
half edge = 1.0h - saturate(t / _EdgeWidth);
half3 color = DissolveShade(input, albedo) + _EdgeColor.rgb * edge;
```

`edge` bằng 1 ngay trên đường cắt, giảm về 0 ở độ sâu `_EdgeWidth`. Màu viền được **cộng** vào sau khi đã tính ánh sáng, vì viền cháy tự phát ra ánh sáng chứ không nhận ánh sáng từ mặt trời. Nhân nó với lượng sáng thì viền nằm trong bóng sẽ tối đi, trông như sơn cam chứ không phải lửa.

`_EdgeColor` là màu HDR, mình để (3.2, 1.0, 0.2): kênh đỏ vượt quá 1 nhiều lần. Bloom chỉ làm tỏa sáng những pixel sáng hơn Threshold, nên màu thường (tối đa 1) sẽ không bao giờ lóe lên. Trong khối `Properties`, thêm `[HDR]` trước tên thông số để Inspector cho phép chọn màu vượt 1.

Code này chạy đúng khi Amount ở giữa, nhưng kéo về 0 thì thấy lỗi:

![Trái: Amount bằng 0 mà người Burrow vẫn có những đốm vàng phát sáng. Phải: đã sửa ngưỡng, Amount 0 là nguyên vẹn](/images/lab/dissolve/dissolve-threshold-compare.webp)

Sau khi remap, noise có chạm tới 0 ở một vài chỗ. Ở những chỗ đó, dù Amount bằng 0, `t - amount` vẫn nhỏ hơn `_EdgeWidth`, nên chúng phát sáng. Amount bằng 0 phải có nghĩa là chưa có gì xảy ra.

Cách sửa là cho ngưỡng cắt bắt đầu từ `-_EdgeWidth` thay vì từ 0, và kết thúc ở 1.001 thay vì 1:

```hlsl
half DissolveThreshold()
{
    return lerp(-_EdgeWidth, 1.001h, _DissolveAmount);
}

half DissolveClip(float3 positionOS, half3 normalOS)
{
    half t = DissolveTime(positionOS, normalOS) - DissolveThreshold();
    clip(t);
    return 1.0h - saturate(t / max(_EdgeWidth, 1e-4h));
}
```

Ở Amount 0, ngưỡng là `-_EdgeWidth`, nên điểm có `t` bằng 0 cũng cách ngưỡng đúng một độ rộng viền, và không phát sáng. Ở Amount 1, ngưỡng vượt 1 một chút, nên cả điểm có `t` đúng bằng 1 cũng bị cắt, không sót lại chấm nào. `DissolveTime` lúc này chỉ gọi lại `DissolveNoise`; phần 2 sẽ thêm hình dạng vào đó.

Từ đây, mọi pass đều cắt thông qua `DissolveClip`, không pass nào tự viết lại phép so sánh.

![Bước 4: viền cam phát sáng quanh mọi lỗ thủng](/images/lab/dissolve/dissolve-04-edge.webp)

## Bước 5: mặt trong của vỏ

Nhìn kỹ vào lỗ thủng ở mặt Burrow, qua lỗ thấy luôn bức tường phía sau. Con chuột chũi rỗng như vỏ giấy.

![Trái: nhìn qua lỗ thấy tường phía sau. Phải: thấy mặt trong tối màu, viền cháy chạy cả ở mép trong](/images/lab/dissolve/dissolve-inside-compare.webp)

Mesh nhân vật chỉ là một lớp vỏ, bên trong không có gì. Bình thường ta không bao giờ nhìn thấy mặt trong, nên GPU được dặn bỏ qua các mặt quay lưng về camera (`Cull Back`) để tiết kiệm. Khi vỏ bị thủng, các mặt quay lưng ở phía bên kia thân chính là thứ lẽ ra phải thấy qua lỗ, nhưng chúng đã bị bỏ.

Sửa làm hai việc. Trong pass, đổi thành `Cull Off` để GPU vẽ cả hai mặt. Trong fragment, phân biệt mặt trước và mặt sau, rồi tô mặt sau bằng một màu tối:

```hlsl
half4 DissolveFragment(DissolveVaryings input, FRONT_FACE_TYPE face : FRONT_FACE_SEMANTIC) : SV_Target
{
    half edge = DissolveClip(input.restPositionOS, input.restNormalOS);
    half3 edgeGlow = _EdgeColor.rgb * edge;

    if (!IS_FRONT_VFACE(face, true, false))
        return half4(MixFog(_InsideColor.rgb + edgeGlow, input.fogFactor), 1.0h);

    half3 color = DissolveShade(input, SampleBaseColor(input.uv).rgb) + edgeGlow;
    return half4(MixFog(color, input.fogFactor), 1.0h);
}
```

`FRONT_FACE_SEMANTIC` và `IS_FRONT_VFACE` là macro của URP, gói lại khác biệt giữa các nền tảng: có máy báo mặt trước bằng `true`, có máy bằng số dương. Mặt sau không chiếu sáng, vì normal của nó đang chỉ ra ngoài; tính ánh sáng với normal đó thì mặt trong sáng y như mặt ngoài. Một màu nâu đỏ tối đọc ra đúng cảm giác phần ruột đã cháy đen. Viền cháy vẫn cộng vào, nên mép trong của lỗ cũng đỏ lửa.

![Bước 5: lỗ thủng giờ có chiều sâu](/images/lab/dissolve/dissolve-05-inside.webp)

## Bước 6: bóng đổ, depth và viền

Kéo Amount lên cao rồi nhìn xuống sàn:

![Trái: Burrow đã tan gần hết nhưng bóng trên sàn vẫn nguyên hình con chuột. Phải: bóng thủng lỗ theo đúng thân](/images/lab/dissolve/dissolve-shadow-compare.webp)

Đây là lỗi hay gặp nhất trong các bản dissolve tự viết, vì nó không hiện ra khi test trong một cảnh không có bóng. Nguyên nhân: bóng không được vẽ bởi pass màu. URP vẽ bóng bằng pass `ShadowCaster`, là một lần vẽ riêng từ góc nhìn của đèn. Ở các bước trước, pass đó là pass dùng chung của toon, hoàn toàn không biết có dissolve.

Pass `DepthOnly` và `DepthNormals` cũng vậy: chúng ghi vật vào depth texture, thứ mà SSAO và shader nước ở bài trước đọc. Không cắt ở đó thì SSAO vẫn tô tối những chỗ không còn gì. Pass viền (inverted hull) cũng phải cắt, nếu không thì qua lỗ thủng sẽ thấy lớp vỏ viền màu đen.

Nên mọi pass đều gọi cùng một hàm, trên cùng vị trí gốc:

**Shaders/Dissolve/BillDissolvePasses.hlsl** (trích ShadowCaster)

```hlsl
DissolveUtilityVaryings DissolveShadowVertex(DissolveUtilityAttributes input)
{
    DissolveUtilityVaryings output = InitUtilityVaryings(input);
    float3 positionOS = DissolveDisplace(input.positionOS.xyz, input.normalOS, input.smoothNormalOS);
    float3 positionWS = TransformObjectToWorld(positionOS);
    // ... ApplyShadowBias và kẹp z như bài toon ...
    return output;
}

half4 DissolveShadowFragment(DissolveUtilityVaryings input) : SV_Target
{
    UNITY_SETUP_INSTANCE_ID(input);
    DissolveClip(input.restPositionOS, input.restNormalOS);
    return 0;
}
```

`InitUtilityVaryings` chép `restPositionOS` và `restNormalOS` giống vertex shader của pass màu. `DissolveDisplace` bài này chưa làm gì, phần 3 mới dùng. Các pass `DepthOnly`, `DepthNormals` và `Outline` viết theo cùng khuôn: đẩy vertex bằng `DissolveDisplace`, cắt pixel bằng `DissolveClip`. Pass bóng và pass depth cũng để `Cull Off` như pass màu, để mặt trong đổ bóng và ghi depth khi lộ ra.

Trong `SubShader`, tag cũng đổi:

```hlsl
Tags { "RenderType" = "TransparentCutout" "RenderPipeline" = "UniversalPipeline" "Queue" = "AlphaTest" }
```

Hàng đợi `AlphaTest` vẽ sau mọi vật đục. Shader có `clip` làm GPU mất một tối ưu quan trọng: nó không thể ghi depth trước khi chạy fragment, vì chưa biết pixel có bị bỏ không. Vẽ sau vật đục thì phần lớn pixel bị che đã bị loại sẵn bởi depth của vật đục, và chi phí đó nhỏ lại.

![Bước 6: bản hoàn chỉnh, bóng và viền nhân vật đều tan theo](/images/lab/dissolve/dissolve-06-final.webp)

## Điều khiển từ C#

Thanh trượt trên material dùng để thử. Trong game, mỗi con quái chết vào một lúc khác nhau, nên mỗi con cần giá trị Amount riêng.

```csharp
static readonly int AmountId = Shader.PropertyToID("_DissolveAmount");
MaterialPropertyBlock block;

void SetAmount(Renderer renderer, float amount)
{
    block ??= new MaterialPropertyBlock();
    renderer.GetPropertyBlock(block);
    block.SetFloat(AmountId, amount);
    renderer.SetPropertyBlock(block);
}
```

`MaterialPropertyBlock` đổi giá trị cho riêng một renderer mà không tạo material mới. Đổi lại, renderer có property block sẽ không đi qua SRP Batcher nữa. Với vài con quái đang chết cùng lúc thì không đáng kể. Nếu một lúc có cả trăm vật đang tan, dùng `renderer.material` để mỗi vật có một bản material riêng: SRP Batcher vẫn gom được chúng vì chung shader, nhưng nhớ `Destroy` material đó khi vật bị hủy, vì Unity không tự dọn.

Một điều nữa: đừng để shader dissolve trên vật thể suốt cả game. Như đã nói ở bước 6, `clip` có giá. Cách thường làm là nhân vật dùng `Bill/Toon` lúc còn sống, và chỉ đổi sang `Bill/Dissolve` khi bắt đầu chết. Hai shader chung thông số toon nên đổi qua không bị khác màu.

`PropertyPingPong.cs` trong gói tải về là script mình dùng để quay ảnh động đầu bài: nó đẩy Amount lên xuống theo hàm cos bằng đúng cách trên.

## File và texture trong bài

**[bill-dissolve-urp.zip](/downloads/shaders/bill-dissolve-urp.zip)** (79 KB). Giải nén rồi chép nguyên thư mục `BillShaderLab` vào `Assets`. Gói có cả thư mục `Shaders/Toon`, vì dissolve dùng lại hàm chiếu sáng của toon. Material `Dissolve_Demo` mang đúng thông số dùng trong bài, trừ texture của Burrow.

Từng file lẻ ở dưới. Chữ nghiêng là thư mục cần đặt file vào, tính từ `BillShaderLab`: các shader include nhau bằng đường dẫn tương đối, đặt sai thư mục là Unity báo không tìm thấy file.

<div class="lesson-files"><strong>Shader hoàn chỉnh</strong><em>Shaders/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/BillDissolve.shader" download>BillDissolve.shader<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolveInput.hlsl" download>BillDissolveInput.hlsl<small>1 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolveCore.hlsl" download>BillDissolveCore.hlsl<small>6 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolveForwardPass.hlsl" download>BillDissolveForwardPass.hlsl<small>4 KB</small></a>
<a href="/downloads/shaders/files/dissolve/BillDissolvePasses.hlsl" download>BillDissolvePasses.hlsl<small>5 KB</small></a>
</div>
<div class="lesson-files"><strong>Phần chiếu sáng dùng lại từ bài toon</strong><em>Shaders/Toon và Shaders/Common</em>
<a href="/downloads/shaders/files/toon/BillToonForwardPass.hlsl" download>BillToonForwardPass.hlsl<small>4 KB</small></a>
<a href="/downloads/shaders/files/toon/BillUtilityPasses.hlsl" download>BillUtilityPasses.hlsl<small>3 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Dissolve</em>
<a href="/downloads/shaders/files/dissolve/DissolveTutorialPass.hlsl" download>DissolveTutorialPass.hlsl<small>3 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_01_UVNoise.shader" download>Dissolve_01_UVNoise.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_02_Triplanar.shader" download>Dissolve_02_Triplanar.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_03_Remap.shader" download>Dissolve_03_Remap.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_04_EdgeNaive.shader" download>Dissolve_04_EdgeNaive.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_05_Edge.shader" download>Dissolve_05_Edge.shader<small>5 KB</small></a>
<a href="/downloads/shaders/files/dissolve/Dissolve_06_Inside.shader" download>Dissolve_06_Inside.shader<small>5 KB</small></a>
</div>
<div class="lesson-files"><strong>Script</strong><em>Scripts</em>
<a href="/downloads/shaders/files/dissolve/PropertyPingPong.cs" download>PropertyPingPong.cs<small>1 KB</small></a>
</div>

Texture dùng trong bài (bấm vào để tải ảnh gốc):

<div class="lesson-assets">
<a href="/downloads/shaders/textures/dissolve/Perlin_02-128x128.png"><img src="/downloads/shaders/textures/dissolve/Perlin_02-128x128.png" alt="Perlin 02"><strong>Perlin_02</strong><span>Noise của dissolve, remap từ 0.36 tới 0.64</span></a>
<a href="/downloads/shaders/textures/toon/Ramp_TwoTone.png"><img class="strip" src="/downloads/shaders/textures/toon/Ramp_TwoTone.png" alt="Ramp hai tông"><strong>Ramp_TwoTone</strong><span>Ramp của phần chiếu sáng toon</span></a>
</div>

Perlin_02 import với **Texture Type: Single Channel**, **Channel: Red**, tắt **sRGB**, **Wrap Mode: Repeat**.

## Tham khảo

- [Cyanilux: Dissolve Shader Breakdown](https://www.cyanilux.com/tutorials/dissolve-shader-breakdown/), cách tách dải viền bằng hai phép so sánh và chuyện phải remap khi trộn noise với gradient.
- [Harry Alisavakis: Spherical mask dissolve](https://halisavakis.com/my-take-on-shaders-spherical-mask-dissolve/), ý tưởng viền phát sáng theo độ mềm của mask, sẽ dùng lại ở phần 2.
- [Minions Art: Vertical Dissolve / Teleport](https://www.patreon.com/posts/shader-graph-35698820), dissolve kèm đẩy vertex, nền cho phần 3.
- [SBS Noise Texture Pack](https://screamingbrainstudios.itch.io/noise-texture-pack), texture noise CC0.

Burrow là asset từ Asset Store (Monsters Ultimate Pack), chỉ dùng để minh họa và không có trong gói tải về.
