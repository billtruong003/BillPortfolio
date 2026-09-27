---
title: "Stylized water cho Unity URP: nước có độ sâu, bọt và sóng"
date: "2026-09-27"
lang: vi
series: "shader"
order: 2
excerpt: "Viết shader nước stylized cho Unity 6 URP qua mười bước: đo độ sâu bằng depth texture, khúc xạ không lem, bọt bờ, bọt mặt nước, specular và sóng Gerstner."
coverImage: "/images/lab/shaders/water-still.webp"
category: "shader"
tags: ["Unity", "Unity 6", "URP", "Shader", "HLSL", "Water"]
published: true
featured: true
---

![Stylized water: đảo nhỏ, vòng nước nông quanh bờ, bọt chạy dọc bờ đá và sóng Gerstner](/images/lab/shaders/water.webp)

Nước là shader mình thích làm nhất, vì nó không có hình dạng riêng. Nước trông ra sao hoàn toàn do thứ nằm dưới nó và xung quanh nó: bờ cát thoai thoải thì có dải nước nông màu nhạt, tảng đá nhô lên thì có vòng bọt, chỗ sâu thì tối và đục. Shader trong bài đọc những thứ đó từ depth texture của camera, rồi quyết định màu cho từng pixel.

Cảnh minh họa là một hòn đảo nhỏ với vài tảng đá. Con chuột chũi Burrow đứng trên đảo chỉ để trang trí, nhân vật của bài này là mặt nước. Mỗi bước đều chụp lại cùng một góc máy, nên bạn sẽ thấy cả môi trường thay đổi thế nào khi shader biết thêm một điều.

<div class="lesson-map"><strong>LỘ TRÌNH</strong><div class="lesson-flow"><span>Màu phẳng</span><span>Đo độ sâu</span><span>Nông và sâu</span><span>Nhìn xuyên</span><span>Khúc xạ</span><span>Bọt mặt nước</span><span>Bọt bờ</span><span>Specular</span><span>Sóng</span></div></div>

**Môi trường:** Unity 6 (6000.3), URP 17.3. Bật **Depth Texture** và **Opaque Texture** trên URP Asset, hoặc bật riêng trên camera trong phần Rendering.

**Tải mã nguồn:** [bill-stylized-water-urp.zip](/downloads/shaders/bill-stylized-water-urp.zip).

**Texture noise:** [SBS Noise Texture Pack](https://screamingbrainstudios.itch.io/noise-texture-pack) của Screaming Brain Studios, giấy phép CC0, dùng thương mại thoải mái. Mình dùng bản 128x128.

## Bước 1: một mặt phẳng màu xanh

Mặt nước là một lưới phẳng, và shader ban đầu chỉ tô màu xanh đậm.

```hlsl
half4 WaterFragment(Varyings input) : SV_Target
{
    return half4(_DeepColor.rgb, 1);
}
```

![Bước 1: nước là một tấm nhựa xanh che kín chân đảo](/images/lab/water/water-01-flat.webp)

Ai mới làm nước cũng từng qua bước này: một tấm nhựa xanh cắm ngang qua cảnh. Chân đảo và chân đá bị cắt phẳng, không có dấu hiệu nào cho thấy nước nông hay sâu. Để có những dấu hiệu đó, shader cần biết **dưới mỗi pixel nước có bao nhiêu nước**.

## Bước 2: đo độ sâu của nước

Camera của URP có thể giữ lại depth texture: ảnh chứa khoảng cách tới vật đục gần nhất ở từng pixel, chụp xong trước khi vẽ nước. Nước được vẽ trong hàng đợi Transparent, tức là sau khi depth texture đã có, nên shader nước đọc được đáy biển, chân đá, chân đảo nằm ngay sau mình.

Cách phổ biến trên mạng là lấy khoảng cách của đáy trừ khoảng cách của mặt nước, cả hai đo theo tia nhìn từ camera. Cách đó chạy được, nhưng con số đo được là độ dài đoạn tia nhìn nằm trong nước, không phải độ sâu. Nhìn nghiêng thì đoạn đó dài ra, nên khi camera hạ thấp, bờ nước nông co vào và cả mặt nước sẫm lại, dù đáy không đổi gì.

Mình đo theo phương thẳng đứng: dựng lại vị trí world của đáy từ depth, rồi lấy độ cao mặt nước trừ độ cao đáy.

```hlsl
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"

float3 SceneWorldPosition(float2 screenUV)
{
    float rawDepth = SampleSceneDepth(screenUV);
#if !UNITY_REVERSED_Z
    rawDepth = lerp(UNITY_NEAR_CLIP_VALUE, 1.0, rawDepth);
#endif
    return ComputeWorldSpacePosition(screenUV, rawDepth, UNITY_MATRIX_I_VP);
}
```

`ComputeWorldSpacePosition` nhận UV màn hình và depth, nhân ngược với ma trận view-projection để ra vị trí world. Dòng `lerp` cho các nền tảng như OpenGL, nơi depth chạy từ -1 tới 1 thay vì 0 tới 1.

Trong fragment:

```hlsl
float2 screenUV = GetNormalizedScreenSpaceUV(input.positionCS);
float surfaceHeight = input.positionWS.y;
float waterDepth = surfaceHeight - SceneWorldPosition(screenUV).y;

half depthFade = 1.0h - exp(-max(waterDepth, 0.0) / _DepthDistance);
return half4(depthFade.xxx, 1);
```

`depthFade` đi từ 0 ở bờ lên gần 1 ở chỗ sâu. Mình dùng hàm mũ chứ không chia tuyến tính, vì ánh sáng bị nước hấp thụ theo hàm mũ: mét nước đầu tiên làm màu đổi nhiều nhất, các mét sau đổi ít dần. `_DepthDistance` là khoảng cách mà nước đạt khoảng 63% độ đục.

![Bước 2: độ sâu hiện thành ảnh xám, đen sát bờ và trắng dần ra xa](/images/lab/water/water-02-depthgray.webp)

Ảnh xám này là bước quan trọng nhất của cả bài, nên mình giữ nó làm ảnh debug. Bờ đảo và quanh các tảng đá màu đen, ra xa trắng dần. Nếu ảnh của bạn trắng đều, depth texture đang trống. Kiểm tra lại Depth Texture trên URP Asset, và kiểm tra các vật dưới nước có dùng shader có pass `DepthNormals` hay không. Mình đã mắc đúng lỗi thứ hai và kể lại trong [bài toon shader](/lab/shader-toon-urp).

## Bước 3: nông và sâu

Giờ thay ảnh xám bằng màu:

```hlsl
half4 waterColor = lerp(_ShallowColor, _DeepColor, depthFade);
return half4(waterColor.rgb, 1);
```

![Bước 3: vòng nước nông màu tím ôm lấy bờ đảo và các tảng đá](/images/lab/water/water-03-depthcolor.webp)

Chỉ một dòng mà cảnh đã khác hẳn. Vòng màu nông ôm đúng theo hình dạng của bờ và của từng tảng đá, và không ai phải vẽ tay những vòng đó.

Kênh alpha của hai màu chưa dùng tới. Bước sau sẽ dùng nó làm độ đục.

## Bước 4: nhìn xuyên xuống đáy

Ở chỗ nước nông, người chơi phải thấy được đáy. Cách nhanh nhất là bật alpha blending: shader trả về alpha thấp, GPU tự trộn với cảnh phía sau. Nhưng làm vậy thì shader không bao giờ đụng được vào màu của đáy, và bước khúc xạ ngay sau đó là bất khả thi.

Nên mình để pass vẽ đục (không có dòng `Blend`), và tự đọc màu cảnh phía sau từ opaque texture, thứ URP chụp lại sau khi vẽ xong mọi vật đục:

```hlsl
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"

half3 viewDirWS = GetWorldSpaceNormalizeViewDir(input.positionWS);
half horizon = pow(1.0h - saturate(viewDirWS.y), _HorizonPower);
waterColor = lerp(waterColor, _HorizonColor, horizon);

half3 color = lerp(SampleSceneColor(screenUV), waterColor.rgb, waterColor.a);
return half4(color, 1);
```

Alpha của màu nông và màu sâu giờ quyết định nước trong tới đâu. Mình để nước nông gần như trong suốt (alpha 0.2) và nước sâu gần như đục (0.9).

Dòng `horizon` làm mặt nước ở xa ngả sang một màu khác. Nhìn gần như song song với mặt nước thì `viewDirWS.y` gần 0, horizon gần 1. Ngoài đời đó là lúc mặt nước phản chiếu bầu trời. Ở đây mình dùng màu xanh ngọc để tách phần nước xa khỏi phần nước gần.

Trong `SubShader`, hàng đợi đặt ở `Transparent-100` để nước được vẽ sau mọi vật đục nhưng trước các hiệu ứng trong suốt khác, cùng với `ZWrite Off`.

![Bước 4: thấy được bờ cát chìm dưới nước, màu xa ngả xanh ngọc](/images/lab/water/water-04-seethrough.webp)

## Bước 5: gợn sóng và khúc xạ

Mặt nước vẫn phẳng lì như tấm kính. Để có gợn, mình dùng normal map: hai texture normal cuộn theo hai hướng khác nhau, cộng lại để không bao giờ trùng nhịp.

Normal map lấy thẳng từ pack SBS: chọn hai tile trong nhóm Perlin, import với **Texture Type: Normal map**, bật **Create from Grayscale**. Unity biến ảnh xám thành bản đồ độ cao rồi tính normal từ đó.

```hlsl
half3 SampleRippleNormal(float2 worldXZ)
{
    float2 uvA = worldXZ / _NormalTiling + _Time.y * _NormalSpeed.xy / _NormalTiling;
    float2 uvB = worldXZ / (_NormalTiling * 1.37) + _Time.y * _NormalSpeed.zw / _NormalTiling;
    half3 a = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMapA, sampler_NormalMapA, uvA), _NormalStrength);
    half3 b = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMapB, sampler_NormalMapB, uvB), _NormalStrength);
    return BlendNormal(a, b);
}
```

UV lấy từ vị trí world chia cho kích thước tile tính bằng mét, nên mặt nước to bao nhiêu thì gợn vẫn giữ nguyên cỡ. Hệ số 1.37 cho map thứ hai một cỡ lệch với map đầu, để hai lớp không bao giờ khớp nhau. `BlendNormal` là hàm của URP, cộng hai normal mà không làm chúng bẹt đi như khi cộng thẳng rồi chuẩn hóa.

Khúc xạ là khi nhìn qua nước, đáy bị lệch đi theo mặt gợn. Thực hiện bằng cách lệch UV khi đọc màu và độ sâu của đáy:

```hlsl
half3 normalTS = SampleRippleNormal(input.positionWS.xz);
float2 refractedUV = screenUV + normalTS.xy * _RefractionStrength * saturate(waterDepth);
float refractedDepth = surfaceHeight - SceneWorldPosition(refractedUV).y;
```

Phần `saturate(waterDepth)` làm khúc xạ yếu dần khi nước cạn, để đường bờ không bị rung. Từ đây, mọi chỗ trước đó dùng `screenUV` và `waterDepth` để lấy màu và độ sâu của đáy đều đổi sang `refractedUV` và `refractedDepth`.

![Bước 5: đáy nhòe theo gợn sóng](/images/lab/water/water-05-refractionnaive.webp)

Nhìn tổng thể thì ổn. Nhưng phóng to chỗ bờ đảo và tảng đá thì thấy lỗi.

## Bước 6: sửa khúc xạ lem vật nổi

![Trái: khúc xạ lem màu vàng của đảo và xám của đá xuống nước. Phải: đã sửa](/images/lab/water/water-refraction-compare.webp)

Ở ảnh bên trái, có những mảng vàng và xám lấm tấm nổi trên mặt nước. UV bị lệch đã rơi vào những pixel của đảo và đá **nằm trên** mặt nước, và shader coi đó là đáy. Opaque texture không biết thứ gì ở trên nước, thứ gì ở dưới, nó chỉ là một tấm ảnh.

Nhưng độ sâu thì biết. Nếu tại UV bị lệch mà độ sâu âm, tức vật đó cao hơn mặt nước, thì bỏ khúc xạ ở pixel này:

```hlsl
if (refractedDepth < 0.0)
{
    refractedUV = screenUV;
    refractedDepth = waterDepth;
}
```

Mẹo này mình học từ loạt bài nước của [Catlike Coding](https://catlikecoding.com/unity/tutorials/flow/looking-through-water/). Khác biệt là mình so bằng độ cao world, thống nhất với cách đo độ sâu ở bước 2.

![Bước 6: khúc xạ còn nguyên, hết lem](/images/lab/water/water-06-refractionfixed.webp)

## Bước 7: bọt trên mặt nước

Nước stylized gần như luôn có những vệt trắng chạy trên mặt, kiểu nước trong Zelda: Wind Waker hay A Short Hike. Mình tạo vệt bằng một texture noise và một ngưỡng: chỗ nào noise vượt ngưỡng thì thành bọt.

```hlsl
float2 foamUV = input.positionWS.xz / _SurfaceFoamTiling + _Time.y * _SurfaceFoamSpeed
              + normalTS.xy * _SurfaceFoamDistortion;
half surfaceNoise = SAMPLE_TEXTURE2D(_SurfaceFoamMap, sampler_SurfaceFoamMap, foamUV).r;
half foam = smoothstep(_SurfaceFoamCutoff, _SurfaceFoamCutoff + 0.03h, surfaceNoise);

Light mainLight = GetMainLight();
color = lerp(color, _FoamColor.rgb * (mainLight.color * 0.8h + 0.2h), foam * _FoamColor.a);
```

Noise lấy từ nhóm **Super Perlin** của pack SBS (SuperPerlin_03). Nhóm này có những vệt dài uốn lượn, cắt ngưỡng ra đúng hình vệt bọt. Texture noise import dạng **Single Channel**, tắt sRGB, vì đây là dữ liệu chứ không phải màu. Để sRGB bật thì Unity sẽ đổi gamma, và ngưỡng cắt bị lệch.

Dòng `normalTS.xy * _SurfaceFoamDistortion` cho gợn sóng uốn vệt bọt, để bọt trông như trôi trên mặt nước chứ không phải một tấm hình dán phía trên. Bọt nhân với màu đèn để khi trời chiều, bọt cũng ngả cam theo.

![Bước 7: vệt bọt trắng chạy khắp mặt nước](/images/lab/water/water-07-surfacefoam.webp)

## Bước 8: bọt bờ

Chỗ nước chạm đá và bờ cát cần một dải bọt dày. Độ sâu đã có sẵn từ bước 2, chỉ việc lấy chỗ nào đủ cạn:

```hlsl
half shoreMask = saturate(1.0h - waterDepth / _IntersectionDistance);
float2 shoreUV = input.positionWS.xz / _IntersectionTiling + _Time.y * _IntersectionSpeed;
half shoreNoise = SAMPLE_TEXTURE2D(_IntersectionMap, sampler_IntersectionMap, shoreUV).r;
foam = saturate(foam + smoothstep(0.5h, 0.53h, shoreMask - (1.0h - shoreNoise) * _IntersectionNoise));
```

Nếu chỉ lấy `shoreMask` rồi cắt ngưỡng, dải bọt sẽ là một đường viền đều tăm tắp quanh mọi vật, trông giống lỗi render hơn là bọt. Trừ đi một lượng noise thì mép ngoài của dải bị gặm nham nhở, còn sát bờ vẫn liền. `_IntersectionNoise` quyết định mép bị gặm nhiều hay ít.

Noise cho bọt bờ là SuperPerlin_09, một tile khác hẳn tile của bọt mặt nước. Nếu dùng chung một tile, hai lớp bọt sẽ lặp cùng một hình và nhìn ra ngay.

Ở đây dùng `waterDepth` chứ không dùng `refractedDepth`, để dải bọt bám chặt vào bờ thật chứ không bị khúc xạ làm lệch đi.

![Bước 8: dải bọt ôm lấy bờ đảo và chân từng tảng đá](/images/lab/water/water-08-intersectionfoam.webp)

## Bước 9: specular

Nước dưới nắng có những chấm lóe sáng. Mình dùng lại công thức Blinn-Phong như bài toon, nhưng lần này normal là normal gợn sóng, nên chấm sáng vỡ ra theo từng gợn:

```hlsl
half3 normalWS = normalize(half3(normalTS.x, normalTS.z, normalTS.y));
half3 halfDir = SafeNormalize(mainLight.direction + viewDirWS);
half specular = pow(saturate(dot(normalWS, halfDir)), _SpecularPower);
specular = smoothstep(_SpecularThreshold, _SpecularThreshold + 0.02h, specular) * (1.0h - foam);
color += _SpecularColor.rgb * mainLight.color * specular;
```

Normal map lưu theo tangent space, trục Z hướng ra khỏi mặt. Mặt nước nằm ngang, nên đổi sang world chỉ là tráo Y với Z. Nhân `(1 - foam)` để chỗ có bọt không lóe thêm, nếu không thì bọt trắng cộng specular trắng sẽ cháy thành một mảng.

![Bước 9: vệt lóe sáng phía xa, chỗ mặt nước hướng về phía mặt trời](/images/lab/water/water-09-specular.webp)

## Bước 10: sóng Gerstner

Còn lại một điều: mặt nước vẫn phẳng. Cách dễ nhất là cộng `sin` vào độ cao của đỉnh, nhưng sóng `sin` đỉnh tròn, đáy tròn, lăn tăn như tấm vải. Sóng thật đỉnh nhọn và đáy thoải, vì mỗi điểm trên mặt nước chuyển động theo vòng tròn chứ không chỉ lên xuống. Sóng Gerstner mô tả đúng chuyển động đó.

```hlsl
float3 GerstnerWave(float4 wave, float3 positionWS, inout float3 tangent, inout float3 binormal)
{
    float steepness = wave.z;
    float k = TWO_PI / max(wave.w, 0.001);
    float c = sqrt(9.81 / k);
    float2 d = normalize(wave.xy);
    float f = k * (dot(d, positionWS.xz) - c * _Time.y);
    float a = steepness / k;

    float sinF = sin(f);
    float cosF = cos(f);

    tangent += float3(-d.x * d.x * steepness * sinF,
                       d.x * steepness * cosF,
                      -d.x * d.y * steepness * sinF);
    binormal += float3(-d.x * d.y * steepness * sinF,
                        d.y * steepness * cosF,
                       -d.y * d.y * steepness * sinF);

    return float3(d.x * a * cosF, a * sinF, d.y * a * cosF);
}
```

Mỗi sóng có bốn thông số gói trong một `float4`: hướng (xy), độ dốc (z) và bước sóng tính bằng mét (w). Tốc độ không cần thông số riêng: công thức `c = sqrt(g / k)` của sóng nước sâu cho sóng dài chạy nhanh hơn sóng ngắn, đúng như ngoài biển.

Đạo hàm của độ dời theo X và theo Z cho hai vector tiếp tuyến, tích có hướng của chúng là normal mới. Cách rút ra các đạo hàm này, Catlike Coding có giải thích từng bước trong bài [Waves](https://catlikecoding.com/unity/tutorials/flow/waves/).

Mình cộng ba sóng lệch hướng và lệch bước sóng. Có một điều kiện phải giữ: tổng độ dốc của tất cả các sóng nhỏ hơn 1. Vượt quá, đỉnh sóng tự gập lên chính nó và mặt nước có những vết rách.

Sóng chạy trên đỉnh lưới, nên lưới phải đủ dày. Lưới trong cảnh là 36 mét, chia 240 ô mỗi chiều, tức mỗi ô khoảng 15 cm. Bounds của mesh cũng phải nới rộng theo chiều cao, vì Unity cull theo bounds gốc, trong khi đỉnh sóng đã bị đẩy lên khỏi đó.

Normal từ sóng giờ không còn thẳng đứng, nên normal gợn sóng phải đổi sang world qua ma trận tiếp tuyến của sóng:

```hlsl
half3x3 tangentToWorld = half3x3(input.tangentWS, input.binormalWS, input.normalWS);
half3 normalWS = normalize(mul(normalTS, tangentToWorld));
```

Màu chân trời cũng đổi sang dùng normal của sóng thay cho trục Y cố định, để sườn sóng quay về phía camera có màu khác với sườn quay đi:

```hlsl
half horizon = pow(1.0h - saturate(dot(input.normalWS, viewDirWS)), _HorizonPower);
```

Cuối cùng là `MixFog` để nước chìm vào sương cùng với phần còn lại của cảnh. Bản đầy đủ nằm trong `BillWaterPass.hlsl` và `BillGerstner.hlsl` của gói tải về.

![Bước 10: bản hoàn chỉnh, sóng nhấp nhô, bọt, specular](/images/lab/water/water-10-waves.webp)

## Vài điều khi dùng trong game thật

- Ngoài xa, lưới dày 240 ô là lãng phí. Game thật thường dùng vài lưới với mật độ giảm dần theo khoảng cách, hoặc tắt sóng bằng keyword `_WAVES` trên mobile và chỉ giữ normal map.
- Shader đọc depth texture và opaque texture, cả hai đều tốn băng thông. Trên mobile, cân nhắc hạ Opaque Downsampling trên URP Asset xuống 2x: khúc xạ vốn đã nhòe nên gần như không thấy khác.
- Muốn vật thể nổi dập dềnh theo sóng, chạy lại đúng hàm `GerstnerWave` trên CPU với cùng thông số, lấy độ cao tại vị trí của vật. [Bài của Alexander Ameye](https://ameye.dev/notes/stylized-water-shader/) có một phần riêng về chuyện này.

## File và texture trong bài

**[bill-stylized-water-urp.zip](/downloads/shaders/bill-stylized-water-urp.zip)** (133 KB). Giải nén rồi chép nguyên thư mục `BillShaderLab` vào `Assets`. Các file `.meta` đi kèm giữ sẵn import settings và nối material với texture. Material `StylizedWater` trong gói mang đúng thông số đã dùng để chụp ảnh trong bài.

| Thư mục | Nội dung |
| --- | --- |
| `Shaders/Water` | Shader `Bill/StylizedWater` hoàn chỉnh, sóng Gerstner bật tắt bằng keyword `_WAVES` |
| `Shaders/Tutorial/Water` | Mỗi bước trong bài là một shader riêng, từ `01 Flat` tới `09 Specular`. Bước 10 chính là shader hoàn chỉnh |
| `Textures` | Hai normal map gợn sóng và hai tile noise cho bọt, kèm giấy phép của pack SBS |
| `Materials` | `StylizedWater` |

Mặt nước cần lưới dày thì sóng mới mượt. Cảnh trong bài dùng lưới 36 mét, 240 ô mỗi chiều. Plane có sẵn của Unity chỉ có 10 ô mỗi chiều, gán shader lên sẽ thấy sóng gãy khúc.

Từng file lẻ ở dưới. Chữ nghiêng là thư mục cần đặt file vào, tính từ `BillShaderLab`: các shader include nhau bằng đường dẫn tương đối, đặt sai thư mục là Unity báo không tìm thấy file.

<div class="lesson-files"><strong>Shader hoàn chỉnh</strong><em>Shaders/Water</em>
<a href="/downloads/shaders/files/water/BillWater.shader" download>BillWater.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/BillWaterInput.hlsl" download>BillWaterInput.hlsl<small>1 KB</small></a>
<a href="/downloads/shaders/files/water/BillWaterPass.hlsl" download>BillWaterPass.hlsl<small>6 KB</small></a>
<a href="/downloads/shaders/files/water/BillGerstner.hlsl" download>BillGerstner.hlsl<small>2 KB</small></a>
</div>
<div class="lesson-files"><strong>Shader từng bước</strong><em>Shaders/Tutorial/Water</em>
<a href="/downloads/shaders/files/water/WaterTutorialPass.hlsl" download>WaterTutorialPass.hlsl<small>5 KB</small></a>
<a href="/downloads/shaders/files/water/Water_01_Flat.shader" download>Water_01_Flat.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_02_DepthGray.shader" download>Water_02_DepthGray.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_03_DepthColor.shader" download>Water_03_DepthColor.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_04_SeeThrough.shader" download>Water_04_SeeThrough.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_05_RefractionNaive.shader" download>Water_05_RefractionNaive.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_06_RefractionFixed.shader" download>Water_06_RefractionFixed.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_07_SurfaceFoam.shader" download>Water_07_SurfaceFoam.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_08_IntersectionFoam.shader" download>Water_08_IntersectionFoam.shader<small>3 KB</small></a>
<a href="/downloads/shaders/files/water/Water_09_Specular.shader" download>Water_09_Specular.shader<small>3 KB</small></a>
</div>

Texture dùng trong bài (bấm vào để tải ảnh gốc):

<div class="lesson-assets">
<a href="/downloads/shaders/textures/water/Water_Ripple_A.png"><img src="/downloads/shaders/textures/water/Water_Ripple_A.png" alt="Ripple A"><strong>Water_Ripple_A</strong><span>Normal map gợn sóng thứ nhất, từ tile Perlin_02</span></a>
<a href="/downloads/shaders/textures/water/Water_Ripple_B.png"><img src="/downloads/shaders/textures/water/Water_Ripple_B.png" alt="Ripple B"><strong>Water_Ripple_B</strong><span>Normal map gợn sóng thứ hai, từ tile Perlin_07</span></a>
<a href="/downloads/shaders/textures/water/SuperPerlin_03-128x128.png"><img src="/downloads/shaders/textures/water/SuperPerlin_03-128x128.png" alt="SuperPerlin 03"><strong>SuperPerlin_03</strong><span>Bọt mặt nước</span></a>
<a href="/downloads/shaders/textures/water/SuperPerlin_09-128x128.png"><img src="/downloads/shaders/textures/water/SuperPerlin_09-128x128.png" alt="SuperPerlin 09"><strong>SuperPerlin_09</strong><span>Bọt bờ</span></a>
</div>

Hai ảnh ripple là ảnh xám. Unity chỉ biến chúng thành normal map khi import với **Texture Type: Normal map** và bật **Create from Grayscale**. Hai tile noise import với **Texture Type: Single Channel**, **Channel: Red** và tắt **sRGB**. Cả bốn ảnh đều để **Wrap Mode: Repeat**.

## Tham khảo

- [Alexander Ameye: Stylized Water Shader](https://ameye.dev/notes/stylized-water-shader/), bài viết đầy đủ nhất mình từng đọc về nước stylized trong URP.
- [Catlike Coding: Looking Through Water](https://catlikecoding.com/unity/tutorials/flow/looking-through-water/), khúc xạ và cách chặn lem vật nổi.
- [Catlike Coding: Waves](https://catlikecoding.com/unity/tutorials/flow/waves/), sóng Gerstner và cách tính normal.
- [SBS Noise Texture Pack](https://screamingbrainstudios.itch.io/noise-texture-pack), texture noise CC0.

Tảng đá, đảo và con chuột chũi là asset từ Asset Store (Low Poly Desert, Monsters Ultimate Pack), chỉ dùng để minh họa và không có trong gói tải về.
