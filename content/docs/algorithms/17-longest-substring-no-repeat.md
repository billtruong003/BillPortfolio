---
title: "Longest Substring Without Repeating Characters: chuỗi con dài nhất không lặp ký tự"
description: "Tìm độ dài chuỗi con liên tiếp dài nhất không có ký tự nào lặp lại: từ cách thử mọi điểm bắt đầu O(n²) tới cửa sổ trượt O(n), giải bằng C# và Python."
section: "Chuỗi"
order: 17
difficulty: "Trung bình"
tags: ["chuỗi", "sliding window", "hash map", "phỏng vấn"]
image: /images/docs/algorithms/longest-substring-no-repeat.webp
imageIdea: "Nhân vật anime tung chuỗi combo kỹ năng trong game đối kháng, phía trên đầu hiện một khung sáng trượt dọc theo dãy biểu tượng kỹ năng, bao đúng ba biểu tượng khác nhau."
imagePrompt: "Edit this image: the character performs a flashy skill combo in a fighting game, above them a row of skill icons with letters 'P W W K E W', and a glowing sliding frame highlights the three icons 'W K E', with a combo counter reading 'COMBO x3'. Keep the original art style, 16:9."
---

Cho một chuỗi `s`. Tìm độ dài của chuỗi con **liên tiếp** dài nhất mà trong đó không có ký tự nào xuất hiện hai lần.

```text
Đầu vào: s = "abcabcbb"
Đầu ra:  3   vì "abc"

Đầu vào: s = "pwwkew"
Đầu ra:  3   vì "wke" ("pwke" không liên tiếp nên không tính)
```

**Trong game:** nhật ký trận đấu ghi mỗi kỹ năng người chơi dùng thành một ký tự, và game thưởng "combo đa dạng" cho chuỗi kỹ năng liên tiếp dài nhất không lặp lại kỹ năng nào.

## Cách thử hết: mọi điểm bắt đầu

Với mỗi vị trí bắt đầu `i`, kéo dài sang phải và cất ký tự vào tập hợp, gặp ký tự trùng thì dừng.

```csharp tab
int LongestUnique(string s)
{
    int best = 0;
    for (int i = 0; i < s.Length; i++)
    {
        var seen = new HashSet<char>();
        for (int j = i; j < s.Length && seen.Add(s[j]); j++)
            best = Math.Max(best, j - i + 1);
    }
    return best;
}

Console.WriteLine(LongestUnique("abcabcbb")); // 3
```

```python tab
def longest_unique(s):
    best = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                break
            seen.add(s[j])
            best = max(best, j - i + 1)
    return best

print(longest_unique("abcabcbb"))  # 3
```

`HashSet.Add` trả về `false` khi phần tử đã có, nên dùng luôn làm điều kiện dừng. Thời gian **O(n²)**, bộ nhớ **O(k)** với `k` là số ký tự khác nhau. Chỗ lãng phí: khi dời điểm bắt đầu sang phải một ô, ta vứt hết tập hợp và đếm lại từ đầu, dù phần lớn cửa sổ vẫn giữ nguyên.

## Cách tối ưu: cửa sổ trượt

Cửa sổ trượt (sliding window) là một đoạn `[left, right]` luôn thỏa điều kiện "không lặp". Mỗi bước kéo `right` sang phải một ô. Nếu ký tự mới đã có trong cửa sổ, đẩy `left` tới ngay sau vị trí cũ của ký tự đó. Không bao giờ lùi `left`.

Để biết vị trí cũ, dùng bảng băm lưu lần cuối mỗi ký tự xuất hiện.

```csharp tab
int LongestUnique(string s)
{
    var last = new Dictionary<char, int>(); // ký tự -> vị trí gần nhất
    int left = 0, best = 0;
    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        if (last.TryGetValue(c, out int prev) && prev >= left)
            left = prev + 1;
        last[c] = right;
        best = Math.Max(best, right - left + 1);
    }
    return best;
}

Console.WriteLine(LongestUnique("abcabcbb")); // 3
Console.WriteLine(LongestUnique("pwwkew"));   // 3
Console.WriteLine(LongestUnique("abba"));     // 2
```

```python tab
def longest_unique(s):
    last = {}  # ký tự -> vị trí gần nhất
    left = best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best

print(longest_unique("abcabcbb"))  # 3
print(longest_unique("pwwkew"))    # 3
print(longest_unique("abba"))      # 2
```

Chạy tay với `"pwwkew"`:

| right | Ký tự | Vị trí cũ | left sau bước | Cửa sổ | best |
|---|---|---|---|---|---|
| 0 | p | chưa có | 0 | p | 1 |
| 1 | w | chưa có | 0 | pw | 2 |
| 2 | w | 1 | 2 | w | 2 |
| 3 | k | chưa có | 2 | wk | 2 |
| 4 | e | chưa có | 2 | wke | 3 |
| 5 | w | 2 | 3 | kew | 3 |

Mỗi ký tự được `right` đi qua đúng một lần, `left` chỉ tiến lên. Thời gian **O(n)**, bộ nhớ **O(k)**.

> **Lỗi hay gặp:** bỏ điều kiện `prev >= left`. Với `"abba"`, tới chữ `a` cuối, vị trí cũ của `a` là 0 nằm ngoài cửa sổ (lúc đó `left = 2`). Không kiểm tra thì `left` bị kéo lùi về 1, cửa sổ thành `"bba"` và hàm trả về 3 thay vì 2.

## Khi đi phỏng vấn

- Nói rõ điều kiện cửa sổ trước khi code: "trong `[left, right]` không có ký tự trùng". Mọi bài cửa sổ trượt đều xoay quanh câu này: khi nào mở rộng, khi nào thu hẹp.
- Hỏi lại chuỗi gồm những ký tự nào. Nếu chỉ có chữ thường a đến z, có thể thay bảng băm bằng mảng 26 ô cho nhanh hơn.

## Bài tập

Tìm độ dài chuỗi con liên tiếp dài nhất chứa **tối đa 2** ký tự khác nhau (ví dụ `"eceba"` trả về 3 vì `"ece"`).

<details>
<summary>Xem đáp án</summary>

Đếm số lần mỗi ký tự có trong cửa sổ. Khi số loại ký tự vượt 2 thì thu `left` lại tới khi hết vượt.

```csharp tab
int LongestTwoKinds(string s)
{
    var count = new Dictionary<char, int>();
    int left = 0, best = 0;
    for (int right = 0; right < s.Length; right++)
    {
        count[s[right]] = count.GetValueOrDefault(s[right]) + 1;
        while (count.Count > 2)
        {
            char gone = s[left++];
            if (--count[gone] == 0) count.Remove(gone);
        }
        best = Math.Max(best, right - left + 1);
    }
    return best;
}

Console.WriteLine(LongestTwoKinds("eceba")); // 3
```

```python tab
def longest_two_kinds(s):
    count = {}
    left = best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        while len(count) > 2:
            gone = s[left]
            left += 1
            count[gone] -= 1
            if count[gone] == 0:
                del count[gone]
        best = max(best, right - left + 1)
    return best

print(longest_two_kinds("eceba"))  # 3
```

</details>
