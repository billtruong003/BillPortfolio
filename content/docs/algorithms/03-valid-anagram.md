---
title: "Valid Anagram: hai chuỗi có cùng bộ chữ cái không"
description: "Kiểm tra hai chuỗi có phải là hoán vị chữ cái của nhau hay không: từ cách sắp xếp O(n log n) tới đếm ký tự O(n), giải bằng C# và Python."
section: "Chuỗi"
order: 3
difficulty: "Dễ"
tags: ["chuỗi", "đếm ký tự", "phỏng vấn"]
image: /images/docs/algorithms/valid-anagram.webp
imageIdea: "Nhân vật anime ngồi trên sàn, xếp lại các khối gỗ có chữ L-I-S-T-E-N thành S-I-L-E-N-T, một khối bay lơ lửng giữa hai hàng, mặt tập trung như đang giải đố trong game."
imagePrompt: "Edit this image: the character sits on the floor rearranging wooden letter blocks. The top row of blocks reads 'LISTEN', the bottom row reads 'SILENT', one block floats between the rows. The character looks focused like solving a puzzle. Keep the original art style, 16:9."
---

Cho hai chuỗi `s` và `t` chỉ gồm chữ thường a đến z. Trả về `true` nếu `t` là anagram của `s`, tức là dùng đúng các chữ cái của `s`, mỗi chữ đúng số lần, chỉ khác thứ tự.

```text
Đầu vào: s = "anagram", t = "nagaram"
Đầu ra:  true

Đầu vào: s = "rat", t = "car"
Đầu ra:  false
```

**Trong game:** trò chơi xếp chữ phát cho người chơi một bộ ô chữ. Khi người chơi nộp một từ, game kiểm tra từ đó có dùng đúng bộ ô được phát không.

## Cách dễ nghĩ: sắp xếp rồi so

Hai chuỗi là anagram khi và chỉ khi sắp xếp các chữ cái xong thì giống hệt nhau. `"rat"` thành `"art"`, `"tar"` cũng thành `"art"`.

```csharp tab
bool IsAnagram(string s, string t)
{
    char[] a = s.ToCharArray();
    char[] b = t.ToCharArray();
    Array.Sort(a);
    Array.Sort(b);
    return new string(a) == new string(b);
}
```

```python tab
def is_anagram(s, t):
    return sorted(s) == sorted(t)
```

Độ phức tạp: thời gian **O(n log n)** vì phải sắp xếp, bộ nhớ **O(n)** cho hai bản sao. Code ngắn, dễ đọc, nhưng vẫn làm thừa việc: ta chỉ cần biết mỗi chữ xuất hiện mấy lần, không cần biết thứ tự.

## Cách nhanh: đếm từng chữ cái

Tạo một mảng 26 ô, mỗi ô ứng với một chữ cái. Đi qua `s` thì cộng, đi qua `t` thì trừ. Cuối cùng mọi ô đều bằng 0 thì hai chuỗi là anagram.

Vị trí của chữ `c` trong mảng là `c - 'a'`: chữ `a` ở ô 0, chữ `b` ở ô 1, chữ `z` ở ô 25. Python dùng `ord(c) - ord("a")` cho việc này.

```csharp tab
bool IsAnagram(string s, string t)
{
    if (s.Length != t.Length) return false;
    var counts = new int[26];
    for (int i = 0; i < s.Length; i++)
    {
        counts[s[i] - 'a']++;
        counts[t[i] - 'a']--;
    }
    foreach (int c in counts)
        if (c != 0) return false;
    return true;
}
```

```python tab
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for a, b in zip(s, t):
        counts[ord(a) - ord("a")] += 1
        counts[ord(b) - ord("a")] -= 1
    return all(c == 0 for c in counts)
```

Chạy tay với `s = "rat"`, `t = "tar"` (chỉ ghi các ô khác 0):

| Bước | Chữ của s | Chữ của t | Bảng đếm sau bước |
|---|---|---|---|
| 1 | r (+1) | t (−1) | r: 1, t: −1 |
| 2 | a (+1) | a (−1) | r: 1, t: −1 |
| 3 | t (+1) | r (−1) | trống, mọi ô bằng 0 |

Kết quả `true`. Độ phức tạp: thời gian **O(n)**, bộ nhớ **O(1)** vì mảng luôn có 26 ô, không phụ thuộc độ dài chuỗi.

Python có sẵn `collections.Counter` để đếm, viết gọn thành `Counter(s) == Counter(t)`. Trong phỏng vấn vẫn nên biết cách tự đếm như trên.

> **Lỗi hay gặp:** dùng `c - 'a'` khi chuỗi có chữ hoa, dấu cách hay chữ tiếng Việt. Chữ `'A'` cho ra số âm, chữ `'ă'` cho ra số lớn hơn 25, và chương trình văng `IndexOutOfRangeException` (C#) hoặc `IndexError` (Python). Nếu đề không hứa chỉ có a đến z, hãy dùng `Dictionary<char, int>` hoặc `dict` để đếm.

## Khi đi phỏng vấn

- Hỏi ngay: chuỗi chỉ có chữ thường tiếng Anh, hay có cả Unicode? Câu trả lời quyết định dùng mảng 26 ô hay bảng băm.
- Kiểm tra độ dài trước tiên. Khác độ dài là trả về `false` luôn, vừa nhanh vừa tránh lỗi khi duyệt song song hai chuỗi.

## Bài tập

Trong game chế tạo đồ, mỗi nguyên liệu là một chữ cái. `recipe` là các nguyên liệu cần, `bag` là nguyên liệu đang có. Trả về `true` nếu đủ nguyên liệu để chế, mỗi nguyên liệu chỉ dùng một lần. Hai chuỗi chỉ gồm chữ thường a đến z.

```text
Đầu vào: recipe = "aab", bag = "baa"
Đầu ra:  true

Đầu vào: recipe = "aa", bag = "ab"
Đầu ra:  false
```

<details>
<summary>Xem đáp án</summary>

Đếm nguyên liệu trong túi, rồi trừ dần theo công thức. Ô nào xuống dưới 0 là thiếu. Thời gian O(n + m), bộ nhớ O(1).

```csharp tab
bool CanCraft(string recipe, string bag)
{
    var counts = new int[26];
    foreach (char c in bag) counts[c - 'a']++;
    foreach (char c in recipe)
    {
        counts[c - 'a']--;
        if (counts[c - 'a'] < 0) return false;
    }
    return true;
}
```

```python tab
def can_craft(recipe, bag):
    counts = [0] * 26
    for c in bag:
        counts[ord(c) - ord("a")] += 1
    for c in recipe:
        counts[ord(c) - ord("a")] -= 1
        if counts[ord(c) - ord("a")] < 0:
            return False
    return True
```

</details>
