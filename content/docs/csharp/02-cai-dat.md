---
title: "Cài đặt C# với .NET 8 và VS Code"
description: "Cài .NET 8 SDK, VS Code và C# Dev Kit, tạo project bằng dotnet new console, chạy bằng dotnet run và sửa lỗi lệnh dotnet không nhận."
section: "Bắt đầu"
order: 2
tags: ["cài đặt", ".net 8", "vs code", "dotnet"]
image: /images/docs/csharp/cai-dat.webp
imageIdea: "Nhân vật anime đang lắp ráp một chiếc bàn làm việc như lắp đồ nội thất, các hộp giấy ghi '.NET 8 SDK' và 'VS Code', trên màn hình hiện dòng 'dotnet run'."
imagePrompt: "Edit this image: the character is assembling a desk setup from cardboard boxes, one box labeled '.NET 8 SDK', another labeled 'VS Code'. A monitor on the desk shows a terminal with the text 'dotnet run'. Keep the original art style, 16:9."
---

Để chạy code C# trên máy, bạn cần hai thứ: .NET SDK (bộ công cụ biên dịch và chạy code) và một trình soạn thảo. Trang này dùng .NET 8 và VS Code, cài xong mất khoảng mười phút.

## Cài .NET 8 SDK

Chỗ người mới hay tải nhầm là bản **Runtime** thay vì **SDK**. Runtime chỉ để chạy chương trình người khác đã build sẵn, không có trình biên dịch. Bạn cần SDK.

1. Vào trang tải chính thức của Microsoft: `dotnet.microsoft.com/download`.
2. Chọn **.NET 8.0**, cột **SDK**, bản cho hệ điều hành của bạn (Windows x64, macOS Arm64 cho máy Mac chip M, hoặc Linux).
3. Chạy file cài, bấm Next tới hết.

Cài xong, mở một cửa sổ terminal **mới** (PowerShell trên Windows, Terminal trên macOS) và gõ:

```bash
dotnet --version
```

Nếu hiện ra một số bắt đầu bằng `8.` (ví dụ `8.0.400`) là xong. Máy có cài bản mới hơn như `9.0` cũng được, SDK mới vẫn build được code C# 12.

## Cài VS Code và C# Dev Kit

1. Tải VS Code tại `code.visualstudio.com` và cài như phần mềm bình thường.
2. Mở VS Code, bấm biểu tượng Extensions ở thanh bên trái (hoặc `Ctrl+Shift+X`).
3. Tìm **C# Dev Kit** của Microsoft, bấm Install. Nó tự cài kèm extension **C#**.

C# Dev Kit cho bạn gợi ý code khi gõ, gạch đỏ chỗ sai, và nút chạy chương trình. Không có nó, VS Code chỉ là trình soạn thảo chữ.

## Tạo project đầu tiên

Mở terminal, đi tới thư mục bạn muốn để code, rồi gõ:

```bash
dotnet new console -o SlimeHunter
cd SlimeHunter
code .
```

- `dotnet new console` tạo một project chạy trong cửa sổ dòng lệnh.
- `-o SlimeHunter` đặt tên thư mục và tên project.
- `code .` mở thư mục hiện tại bằng VS Code.

Trong thư mục sẽ có hai file đáng chú ý:

- `SlimeHunter.csproj`: file cấu hình project. Chưa cần sửa.
- `Program.cs`: nơi bạn viết code.

Mở `Program.cs`, bạn thấy đúng một dòng:

```csharp
// See https://aka.ms/new-console-template for more information
Console.WriteLine("Hello, World!");
```

## Chạy chương trình

Trong terminal (VS Code có terminal riêng, mở bằng `` Ctrl+` ``), gõ:

```bash
dotnet run
```

Kết quả:

```text
Hello, World!
```

Giờ thử sửa `Program.cs` thành code của bạn, lưu file, rồi `dotnet run` lại:

```csharp
string heroName = "Aki";
int level = 1;
Console.WriteLine(heroName + " bắt đầu ở level " + level); // Aki bắt đầu ở level 1
```

Lần chạy đầu chậm vài giây vì .NET phải build. Các lần sau nhanh hơn.

> **Lỗi hay gặp:** gõ `dotnet` thì terminal báo `'dotnet' is not recognized as an internal or external command` (Windows) hoặc `command not found: dotnet` (macOS, Linux). Có ba nguyên nhân thường gặp:
>
> 1. Terminal được mở **trước** khi cài SDK nên chưa biết đường dẫn mới. Đóng hẳn terminal và VS Code, mở lại.
> 2. Bạn cài nhầm bản Runtime. Chạy `dotnet --list-sdks`, nếu không ra dòng nào thì cài lại bản SDK.
> 3. Trên Windows, thư mục `C:\Program Files\dotnet\` chưa nằm trong biến môi trường `PATH`. Khởi động lại máy thường là đủ. Nếu vẫn chưa được, thêm thư mục đó vào `PATH` bằng tay.

## Lỗi chạy sai thư mục

Một lỗi khác cũng hay gặp: gõ `dotnet run` và nhận `Couldn't find a project to run`. Nghĩa là terminal đang đứng ở thư mục không có file `.csproj`. Gõ `cd SlimeHunter` để vào đúng thư mục rồi chạy lại.

Có project chạy được rồi thì sang trang [cú pháp C#](/docs/csharp/cu-phap) để hiểu từng dòng code.

## Bài tập

Tạo một project mới tên `GoldCounter`, sửa `Program.cs` để in ra dòng `Vàng: 250`, rồi chạy nó.

<details>
<summary>Xem đáp án</summary>

Trong terminal:

```bash
dotnet new console -o GoldCounter
cd GoldCounter
```

Nội dung `Program.cs`:

```csharp
int gold = 250;
Console.WriteLine("Vàng: " + gold); // Vàng: 250
```

Rồi chạy `dotnet run`.

</details>
