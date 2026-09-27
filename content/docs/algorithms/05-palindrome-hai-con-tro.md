---
title: "Valid Palindrome: kiểm tra chuỗi đối xứng bằng hai con trỏ"
description: "Kiểm tra một câu có đọc xuôi ngược như nhau khi bỏ dấu câu và khoảng trắng: từ tạo chuỗi đảo O(n) bộ nhớ tới hai con trỏ O(1), giải bằng C# và Python."
section: "Chuỗi"
order: 5
difficulty: "Dễ"
tags: ["chuỗi", "hai con trỏ", "palindrome", "phỏng vấn"]
image: /images/docs/algorithms/palindrome-hai-con-tro.webp
imageIdea: "Nhân vật anime đứng trước chiếc gương ma thuật, giơ tấm bảng tên 'RACECAR', trong gương hiện đúng chữ đó, hai tay nhân vật chỉ vào hai đầu tấm bảng như hai con trỏ."
imagePrompt: "Edit this image: the character stands in front of a magic mirror holding a name plate that reads 'RACECAR'. The reflection shows the same readable word. The character points at both ends of the plate with two fingers, like two pointers. Keep the original art style, 16:9."
---

Cho một chuỗi. Bỏ hết ký tự không phải chữ cái hay chữ số, coi chữ hoa và chữ thường như nhau. Trả về `true` nếu phần còn lại đọc xuôi và đọc ngược giống nhau (palindrome).

```text
Đầu vào: s = "A man, a plan, a canal: Panama"
Đầu ra:  true    vì còn lại "amanaplanacanalpanama"

Đầu vào: s = "race a car"
Đầu ra:  false   vì "raceacar" đọc ngược là "racaecar"
```

**Trong game:** người chơi đặt tên nhân vật đối xứng thì mở khóa danh hiệu ẩn "Gương soi". Tên có thể có dấu cách và dấu câu, game phải bỏ qua chúng.

## Cách dễ nghĩ: làm sạch rồi đảo ngược

Lọc chuỗi chỉ giữ chữ và số, đổi hết sang chữ thường, rồi so với bản đảo ngược của chính nó.

```csharp tab
bool IsPalindrome(string s)
{
    var clean = new List<char>();
    foreach (char c in s)
        if (char.IsLetterOrDigit(c))
            clean.Add(char.ToLower(c));
    for (int i = 0; i < clean.Count; i++)
        if (clean[i] != clean[clean.Count - 1 - i])
            return false;
    return true;
}
```

```python tab
def is_palindrome(s):
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]
```

Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(n)** cho chuỗi đã làm sạch (bản Python còn tạo thêm bản đảo ngược). Tốc độ đã tốt, nhưng người phỏng vấn sẽ hỏi: "Không tạo chuỗi mới được không?"

## Cách tối ưu: hai con trỏ

Đặt một con trỏ `left` ở đầu chuỗi, một con trỏ `right` ở cuối. Con trỏ ở đây chỉ là biến lưu vị trí.

- Nếu `s[left]` không phải chữ hay số, bỏ qua, tăng `left`.
- Nếu `s[right]` không phải chữ hay số, bỏ qua, giảm `right`.
- Còn lại thì so hai ký tự (đã đổi sang chữ thường). Khác nhau là trả về `false`, giống nhau thì cả hai con trỏ cùng tiến vào giữa.

Hai con trỏ gặp nhau mà chưa thấy cặp nào lệch thì chuỗi là palindrome.

```csharp tab
bool IsPalindrome(string s)
{
    int left = 0, right = s.Length - 1;
    while (left < right)
    {
        if (!char.IsLetterOrDigit(s[left])) { left++; continue; }
        if (!char.IsLetterOrDigit(s[right])) { right--; continue; }
        if (char.ToLower(s[left]) != char.ToLower(s[right]))
            return false;
        left++;
        right--;
    }
    return true;
}
```

```python tab
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
            continue
        if not s[right].isalnum():
            right -= 1
            continue
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
```

Chạy tay với `"Race, car"` (vị trí 0 đến 8: `R a c e , ␣ c a r`):

| Bước | left | right | So sánh | Việc làm |
|---|---|---|---|---|
| 1 | 0 (R) | 8 (r) | r = r | cả hai tiến vào |
| 2 | 1 (a) | 7 (a) | a = a | cả hai tiến vào |
| 3 | 2 (c) | 6 (c) | c = c | cả hai tiến vào |
| 4 | 3 (e) | 5 (dấu cách) | không so | bỏ qua, right = 4 |
| 5 | 3 (e) | 4 (,) | không so | bỏ qua, right = 3 |
| 6 | 3 | 3 | | left không còn nhỏ hơn right, dừng |

Kết quả `true`. Độ phức tạp: thời gian **O(n)** vì mỗi ký tự được nhìn nhiều nhất một lần, bộ nhớ **O(1)**.

> **Lỗi hay gặp:** viết vòng lặp con để nhảy qua dấu câu mà quên điều kiện biên, kiểu `while (!char.IsLetterOrDigit(s[left])) left++;`. Với chuỗi toàn dấu câu như `",,,"`, `left` chạy vượt khỏi chuỗi và C# văng `IndexOutOfRangeException`, Python văng `IndexError: string index out of range`. Nếu dùng vòng lặp con, phải thêm `left < right` vào điều kiện. Bản ở trên dùng `continue` nên không gặp lỗi này.

## Khi đi phỏng vấn

- Hỏi rõ thế nào là "chữ": chỉ a đến z, hay cả chữ có dấu? `char.IsLetterOrDigit` và `str.isalnum` đều nhận chữ Unicode như `ă`, `đ`.
- Hai con trỏ đi từ hai đầu vào giữa là kỹ thuật dùng lại rất nhiều: đảo ngược mảng, tìm cặp có tổng cho trước trong mảng đã sắp xếp, gộp mảng. Nhắc tới điều đó cho thấy bạn nhìn ra khuôn mẫu.

## Bài tập

Chuỗi chỉ gồm chữ thường. Được xóa **tối đa một** ký tự. Trả về `true` nếu sau đó chuỗi là palindrome.

```text
Đầu vào: s = "abca"
Đầu ra:  true    vì xóa "c" (hoặc "b") còn "aba"

Đầu vào: s = "abc"
Đầu ra:  false
```

<details>
<summary>Xem đáp án</summary>

Chạy hai con trỏ như bình thường. Tới cặp đầu tiên bị lệch, thử bỏ ký tự bên trái hoặc bỏ ký tự bên phải, rồi kiểm tra đoạn còn lại có đối xứng không. Thời gian O(n), bộ nhớ O(1).

```csharp tab
bool IsRangePalindrome(string s, int left, int right)
{
    while (left < right)
    {
        if (s[left] != s[right]) return false;
        left++;
        right--;
    }
    return true;
}

bool ValidPalindromeRemoveOne(string s)
{
    int left = 0, right = s.Length - 1;
    while (left < right)
    {
        if (s[left] != s[right])
            return IsRangePalindrome(s, left + 1, right) || IsRangePalindrome(s, left, right - 1);
        left++;
        right--;
    }
    return true;
}
```

```python tab
def is_range_palindrome(s, left, right):
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True


def valid_palindrome_remove_one(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return is_range_palindrome(s, left + 1, right) or is_range_palindrome(s, left, right - 1)
        left += 1
        right -= 1
    return True
```

</details>
