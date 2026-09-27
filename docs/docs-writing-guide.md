# Cách viết một trang Docs

Docs là phần tài liệu lập trình cơ bản bằng tiếng Việt, kiểu W3Schools: mỗi trang một khái niệm, đọc trong 3 đến 6 phút. Hai trang mẫu phải đọc trước khi viết:

- `content/docs/csharp/05-bien.md` (trang ngôn ngữ)
- `content/docs/algorithms/01-two-sum.md` (trang giải thuật)

## File và frontmatter

Đường dẫn: `content/docs/<track>/<NN>-<slug>.md`. `NN` là số thứ tự hai chữ số, `slug` viết không dấu, chữ thường, nối bằng gạch nối (`vong-lap-for`). Slug là URL: `/docs/<track>/<slug>`.

```yaml
---
title: "Vòng lặp for trong C#"          # có tên ngôn ngữ để dễ lên Google
description: "Một câu 120 đến 160 ký tự nói trang này dạy gì."
section: "Điều khiển luồng"              # nhóm trong sidebar
order: 12                                 # trùng với NN
difficulty: "Dễ"                          # chỉ dùng cho giải thuật: Dễ, Trung bình
tags: ["vòng lặp", "for"]
image: /images/docs/<track>/<slug>.webp
imageIdea: "Ý tưởng ảnh bằng tiếng Việt: nhân vật anime đang làm gì, liên quan tới bài ra sao."
imagePrompt: "English prompt to edit an existing anime image with ChatGPT: what the character is doing, props, readable text on objects if any. Keep the original art style, 16:9."
---
```

Ảnh chưa có file thì trang vẫn chạy, chỉ không hiện ảnh. Ý tưởng ảnh phải vui và gắn với nội dung: nhân vật đọc cuốn sách ghi đúng tên khái niệm, gõ phím trước màn hình có dòng code của bài, xếp hộp đồ như một mảng, đứng giữa ngã ba đường như câu lệnh if. Mỗi trang một ý khác nhau, không lặp.

## Bố cục một trang

1. Một đoạn mở đầu 2 đến 3 câu: khái niệm này là gì, dùng vào việc gì. Không chào hỏi.
2. Các mục `##`, mỗi mục một ý nhỏ, có ít nhất một ví dụ code chạy được.
3. Khi giảng một ý: nêu chỗ người mới hay làm sai hoặc vấn đề trước, rồi cách đúng, rồi mới tới cách làm.
4. Ít nhất một khung lỗi hay gặp, viết bằng blockquote: `> **Lỗi hay gặp:** ...` kèm mã lỗi thật nếu có (CS0128, TypeError...).
5. Kết thúc bằng `## Bài tập`: một đề ngắn, đáp án đặt trong

```html
<details>
<summary>Xem đáp án</summary>

(code đáp án, có dòng trống trước và sau)

</details>
```

Không có mục "Tổng kết", không có câu kết kiểu "Chúc bạn thành công".

## Văn phong

- Tiếng Việt phẳng, như người thật đang giảng. Câu ngắn. Không bịa cụm từ lạ tai.
- Không dùng gạch dài (ký tự em dash). Script build sẽ báo lỗi nếu có. Thay bằng dấu hai chấm, dấu phẩy hoặc tách câu.
- Không dùng: "không chỉ... mà còn", "hành trình", "mạnh mẽ", "tuyệt vời", "bí quyết", "nắm vững", "đơn giản thôi", "cực kỳ", emoji, in đậm tràn lan.
- Thuật ngữ tiếng Anh giữ nguyên khi đó là tên thật trong code (`List`, `Dictionary`, `for`), giải thích nghĩa ở lần đầu.
- Tiêu đề viết hoa kiểu câu tiếng Việt: "Vòng lặp for", không phải "Vòng Lặp For".
- Ví dụ lấy chuyện làm game: máu, vàng, kho đồ, quái, điểm số, level. Không ví dụ khô kiểu `a`, `b`, `foo`.

## Code

- Code phải đúng và chạy được với phiên bản hiện tại: C# 12 / .NET 8 (top-level statements, `Console.WriteLine`), Python 3.12, JavaScript ES2022 chạy được trên trình duyệt hoặc Node 20, TypeScript 5, HLSL cho Unity 6 URP (dùng `Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl`, `TransformObjectToHClip`, `CBUFFER_START(UnityPerMaterial)`, `TEXTURE2D`/`SAMPLER`).
- C# top-level statements: khai báo class, enum, struct phải đặt sau code chạy, nếu không sẽ lỗi CS8803.
- Ghi kết quả in ra bằng comment ngay cạnh: `Console.WriteLine(hp); // 90`.
- Ngoài khối code của ngôn ngữ đang dạy, được dùng ```` ```bash ```` cho lệnh terminal (gõ lệnh trần, không có `$` đầu dòng), ```` ```json ```` cho file JSON (phải là JSON hợp lệ, không comment) và ```` ```text ```` cho input/output mẫu. Đừng nhét lệnh terminal hay file cấu hình vào khối `js` dưới dạng comment.
- Chỉ trang giải thuật dùng tab: hai khối liền nhau ```` ```csharp tab ```` và ```` ```python tab ````. Trang ngôn ngữ thì không dùng `tab`.
- Chỉ kiến thức cơ bản. Không đưa phần nâng cao vào (generics phức tạp, async nâng cao, metaclass, compute shader...).
