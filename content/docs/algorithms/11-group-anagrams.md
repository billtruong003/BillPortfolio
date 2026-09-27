---
title: "Group Anagrams: nhóm các từ cùng bộ chữ cái"
description: "Gom các từ là anagram của nhau vào cùng một nhóm: từ so từng cặp tới dùng Dictionary với key là chuỗi đã sắp xếp, giải bằng C# và Python."
section: "Mảng và bảng băm"
order: 11
difficulty: "Trung bình"
tags: ["chuỗi", "hash map", "anagram", "phỏng vấn"]
image: /images/docs/algorithms/group-anagrams.webp
imageIdea: "Nhân vật anime là thủ thư trong thư viện phép thuật, đang thả các cuộn giấy ghi 'eat', 'tea', 'tan', 'nat', 'bat' vào ba chiếc giỏ dán nhãn 'aet', 'ant', 'abt', một cuộn đang bay giữa không trung tìm đúng giỏ."
imagePrompt: "Edit this image: the character is a librarian in a magic library dropping small paper scrolls with words 'eat', 'tea', 'tan', 'nat', 'bat' into three baskets labeled 'aet', 'ant' and 'abt'. One scroll floats mid-air heading to the right basket. Keep the original art style, 16:9."
---

Cho một mảng các từ gồm chữ thường. Gom các từ là anagram của nhau (cùng bộ chữ cái, khác thứ tự) vào chung một nhóm. Thứ tự các nhóm và thứ tự từ trong nhóm không quan trọng.

```text
Đầu vào: words = ["eat", "tea", "tan", "ate", "nat", "bat"]
Đầu ra:  [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
```

Bài này nối tiếp bài Valid Anagram. Nếu chưa đọc, nên xem bài đó trước.

**Trong game:** trò chơi xếp chữ phát cho người chơi một bộ ô chữ. Để gợi ý nhanh, game gom sẵn cả từ điển thành các nhóm cùng bộ chữ cái. Có bộ ô `a, e, t` là lấy ra ngay nhóm `eat, tea, ate`.

## Cách thử hết: so với từng nhóm đã có

Với mỗi từ, đi qua các nhóm đã tạo, so từ đó với từ đầu tiên của nhóm. Khớp thì thêm vào, không khớp nhóm nào thì mở nhóm mới.

```csharp tab
List<List<string>> GroupAnagrams(string[] words)
{
    var groups = new List<List<string>>();
    foreach (string w in words)
    {
        List<string>? found = null;
        foreach (var g in groups)
        {
            if (SortLetters(g[0]) == SortLetters(w))
            {
                found = g;
                break;
            }
        }
        if (found == null) groups.Add(new List<string> { w });
        else found.Add(w);
    }
    return groups;
}

string SortLetters(string w)
{
    char[] letters = w.ToCharArray();
    Array.Sort(letters);
    return new string(letters);
}
```

```python tab
def group_anagrams(words):
    groups = []
    for w in words:
        for g in groups:
            if sorted(g[0]) == sorted(w):
                g.append(w)
                break
        else:
            groups.append([w])
    return groups
```

Trong Python, `else` gắn với `for` chạy khi vòng lặp đi hết mà không gặp `break`, tức là không tìm được nhóm nào.

Độ phức tạp: với n từ, mỗi từ dài k, mỗi từ có thể phải so với gần n nhóm, mỗi lần so tốn O(k log k). Tổng cộng **O(n² · k log k)**. Từ điển 100.000 từ là quá chậm.

## Cách nhanh: Dictionary với key là chuỗi đã sắp xếp

Nhận xét: mọi từ trong cùng một nhóm, khi sắp xếp chữ cái, cho ra **cùng một chuỗi**. `"eat"`, `"tea"`, `"ate"` đều thành `"aet"`. Chuỗi đó là "chữ ký" của nhóm. Dùng nó làm key của `Dictionary` (C#) hay `dict` (Python), value là danh sách các từ.

Thay vì hỏi "từ này giống nhóm nào?", ta tính thẳng địa chỉ nhóm của nó rồi bỏ vào.

```csharp tab
List<List<string>> GroupAnagrams(string[] words)
{
    var groups = new Dictionary<string, List<string>>();
    foreach (string w in words)
    {
        char[] letters = w.ToCharArray();
        Array.Sort(letters);
        string key = new string(letters);
        if (!groups.TryGetValue(key, out var list))
        {
            list = new List<string>();
            groups[key] = list;
        }
        list.Add(w);
    }
    return new List<List<string>>(groups.Values);
}
```

```python tab
def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())
```

`setdefault(key, [])` trả về danh sách đang có của key, chưa có thì tạo danh sách rỗng và gắn vào key. Việc này giống đoạn `TryGetValue` bên C#.

Chạy tay:

| Từ | Key | Bảng sau bước |
|---|---|---|
| eat | aet | aet: [eat] |
| tea | aet | aet: [eat, tea] |
| tan | ant | aet: [eat, tea], ant: [tan] |
| ate | aet | aet: [eat, tea, ate], ant: [tan] |
| nat | ant | aet: [eat, tea, ate], ant: [tan, nat] |
| bat | abt | thêm abt: [bat] |

Độ phức tạp: thời gian **O(n · k log k)** vì mỗi từ chỉ sắp xếp một lần và tra bảng một lần. Bộ nhớ **O(n · k)** để lưu mọi từ trong bảng.

> **Lỗi hay gặp:** dùng thẳng mảng chữ cái đã sắp xếp làm key. Python báo `TypeError: unhashable type: 'list'` vì `list` không làm key được. C# thì im lặng: `Dictionary<char[], ...>` so key theo tham chiếu, hai mảng cùng nội dung vẫn là hai key khác nhau, nên mỗi từ nằm một nhóm riêng. Luôn đổi về `string` (C#) hoặc `str`, `tuple` (Python) trước khi làm key.

## Khi đi phỏng vấn

- Nêu cách tạo key thứ hai: đếm số lần xuất hiện của 26 chữ cái. Key tạo trong O(k) thay vì O(k log k), nên cả bài còn O(n · k). Có lợi khi các từ dài.
- Khuôn "tính một chữ ký chung rồi gom theo Dictionary" dùng lại ở nhiều bài: gom người chơi theo cấp, gom đồ theo loại, tìm các bản đồ có cùng bố cục.

## Bài tập

Viết lại `GroupAnagrams` dùng key đếm chữ cái thay vì sắp xếp. Các từ chỉ gồm chữ thường a đến z.

```text
Đầu vào: words = ["eat", "tea", "tan", "ate", "nat", "bat"]
Đầu ra:  [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
```

<details>
<summary>Xem đáp án</summary>

Đếm 26 chữ cái, rồi ghép 26 con số thành một chuỗi có dấu phẩy ngăn cách (C#) hoặc đổi thành `tuple` (Python). Cần dấu phẩy vì nếu ghép liền, số lần 1 rồi 11 và số lần 11 rồi 1 sẽ cùng ra "111". Thời gian O(n · k), bộ nhớ O(n · k).

```csharp tab
List<List<string>> GroupAnagrams(string[] words)
{
    var groups = new Dictionary<string, List<string>>();
    foreach (string w in words)
    {
        var counts = new int[26];
        foreach (char c in w) counts[c - 'a']++;
        string key = string.Join(",", counts);
        if (!groups.TryGetValue(key, out var list))
        {
            list = new List<string>();
            groups[key] = list;
        }
        list.Add(w);
    }
    return new List<List<string>>(groups.Values);
}
```

```python tab
def group_anagrams(words):
    groups = {}
    for w in words:
        counts = [0] * 26
        for c in w:
            counts[ord(c) - ord("a")] += 1
        groups.setdefault(tuple(counts), []).append(w)
    return list(groups.values())
```

</details>
