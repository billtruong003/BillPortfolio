---
title: "Valid Parentheses: kiểm tra ngoặc đóng mở hợp lệ"
description: "Kiểm tra chuỗi ngoặc (), [], {} có đóng mở đúng thứ tự không: từ cách xóa lặp O(n²) tới dùng stack O(n), giải bằng C# và Python."
section: "Chuỗi"
order: 4
difficulty: "Dễ"
tags: ["chuỗi", "stack", "phỏng vấn"]
image: /images/docs/algorithms/valid-parentheses.webp
imageIdea: "Nhân vật anime là pháp sư đang niệm chú, trước mặt là ba vòng phép hình ngoặc lồng vào nhau { [ ( ) ] }, vòng trong cùng vừa khép lại phát sáng."
imagePrompt: "Edit this image: the character is a mage casting a spell, with three glowing magic rings shaped like nested brackets '{ [ ( ) ] }' floating in front of them. The innermost pair '( )' is closing and glowing brightest. Keep the original art style, 16:9."
---

Cho một chuỗi chỉ gồm các ký tự `(`, `)`, `[`, `]`, `{`, `}`. Chuỗi hợp lệ khi mỗi ngoặc mở được đóng bằng đúng loại ngoặc, và ngoặc mở sau phải đóng trước.

```text
Đầu vào: s = "()[]{}"   Đầu ra: true
Đầu vào: s = "{[]}"     Đầu ra: true
Đầu vào: s = "(]"       Đầu ra: false
Đầu vào: s = "([)]"     Đầu ra: false
```

**Trong game:** công cụ viết script cho modder cần báo lỗi ngay khi họ quên đóng một ngoặc, trước khi script được nạp vào game.

## Cách thử hết: xóa dần các cặp liền nhau

Một chuỗi hợp lệ luôn có ít nhất một cặp `()`, `[]` hoặc `{}` nằm sát nhau. Xóa cặp đó đi, chuỗi còn lại vẫn hợp lệ. Cứ xóa tới khi không còn cặp nào: chuỗi rỗng là hợp lệ.

```csharp tab
bool IsValid(string s)
{
    while (s.Contains("()") || s.Contains("[]") || s.Contains("{}"))
        s = s.Replace("()", "").Replace("[]", "").Replace("{}", "");
    return s.Length == 0;
}
```

```python tab
def is_valid(s):
    while "()" in s or "[]" in s or "{}" in s:
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return len(s) == 0
```

Độ phức tạp: thời gian **O(n²)**. Chuỗi lồng sâu như `((((...))))` mỗi vòng chỉ xóa được một cặp, mà mỗi lần `Replace` lại quét và tạo chuỗi mới dài gần n.

## Cách nhanh: dùng stack

Để ý thứ tự: ngoặc mở **sau cùng** phải được đóng **trước tiên**. Đó đúng là cách hoạt động của stack (ngăn xếp): vào sau, ra trước, như chồng đĩa.

- Gặp ngoặc mở: đẩy vào stack.
- Gặp ngoặc đóng: lấy phần tử trên cùng ra. Nếu stack rỗng hoặc không đúng loại ngoặc mở thì chuỗi sai.
- Hết chuỗi: stack phải rỗng, nếu không là còn ngoặc chưa đóng.

```csharp tab
bool IsValid(string s)
{
    var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
    var stack = new Stack<char>();
    foreach (char c in s)
    {
        if (pairs.TryGetValue(c, out char open))
        {
            if (stack.Count == 0 || stack.Pop() != open)
                return false;
        }
        else
        {
            stack.Push(c);
        }
    }
    return stack.Count == 0;
}
```

```python tab
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
        else:
            stack.append(c)
    return not stack
```

Python không có lớp Stack riêng, `list` với `append` và `pop` làm được việc đó.

Chạy tay với `"{[]}"`:

| Bước | Ký tự | Việc làm | Stack sau bước |
|---|---|---|---|
| 1 | `{` | mở, đẩy vào | `{` |
| 2 | `[` | mở, đẩy vào | `{ [` |
| 3 | `]` | đóng, lấy ra `[`, khớp | `{` |
| 4 | `}` | đóng, lấy ra `{`, khớp | rỗng |

Hết chuỗi, stack rỗng, kết quả `true`. Với `"([)]"`, tới bước 3 gặp `)` nhưng trên cùng stack là `[`, trả về `false`.

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(n)** vì trường hợp xấu nhất mọi ký tự đều là ngoặc mở.

> **Lỗi hay gặp:** gọi `Pop` mà không kiểm tra stack rỗng. Với chuỗi `")"`, C# văng `InvalidOperationException: Stack empty`, Python văng `IndexError: pop from empty list`. Lỗi thứ hai là quên kiểm tra stack ở cuối: chuỗi `"(("` không gặp ngoặc đóng nào nên vòng lặp chạy hết mà không trả về `false`.

## Khi đi phỏng vấn

- Có một mẹo nhanh để loại sớm: chuỗi có độ dài lẻ thì chắc chắn sai.
- Nếu đề chỉ có một loại ngoặc `()`, không cần stack: một biến đếm tăng khi mở, giảm khi đóng, không bao giờ được âm, cuối cùng phải bằng 0. Nói được điều này cho thấy bạn hiểu vì sao cần stack khi có nhiều loại.

## Bài tập

Chuỗi chỉ gồm `(` và `)` và đã hợp lệ. Trả về độ sâu lồng lớn nhất. Trong game: combo lồng nhau, mỗi tầng lồng nhân thêm điểm.

```text
Đầu vào: s = "(()(()))"
Đầu ra:  3

Đầu vào: s = "()()"
Đầu ra:  1
```

<details>
<summary>Xem đáp án</summary>

Chỉ có một loại ngoặc nên dùng biến đếm thay cho stack. Thời gian O(n), bộ nhớ O(1).

```csharp tab
int MaxDepth(string s)
{
    int depth = 0, best = 0;
    foreach (char c in s)
    {
        if (c == '(')
        {
            depth++;
            best = Math.Max(best, depth);
        }
        else
        {
            depth--;
        }
    }
    return best;
}
```

```python tab
def max_depth(s):
    depth = best = 0
    for c in s:
        if c == "(":
            depth += 1
            best = max(best, depth)
        else:
            depth -= 1
    return best
```

</details>
