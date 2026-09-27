---
title: "Linked List Cycle: phát hiện vòng lặp bằng rùa và thỏ"
description: "Kiểm tra danh sách liên kết có vòng hay không: cách dùng HashSet O(n) bộ nhớ và cách rùa và thỏ (Floyd) chỉ tốn O(1) bộ nhớ, giải bằng C# và Python."
section: "Danh sách liên kết"
order: 16
difficulty: "Dễ"
tags: ["danh sách liên kết", "hai con trỏ", "Floyd", "phỏng vấn"]
image: /images/docs/algorithms/linked-list-cycle.webp
imageIdea: "Nhân vật anime chạy đua trên một đường đua hình vòng tròn trong game, một bên là chú rùa chậm rãi, một bên là chú thỏ phóng nhanh sắp bắt kịp rùa từ phía sau, nhân vật cầm cờ trọng tài."
imagePrompt: "Edit this image: the character is a race referee holding a checkered flag beside a circular race track in a cute racing game, a slow turtle and a fast rabbit run on the loop and the rabbit is about to lap the turtle from behind, a sign reads 'LOOP?'. Keep the original art style, 16:9."
---

Cho nút đầu của một danh sách liên kết. Hỏi danh sách có vòng không, tức là đi theo `Next` mãi thì có quay lại một nút đã gặp thay vì gặp `null` hay không.

```text
Đầu vào: 3 -> 2 -> 0 -> -4 -> (quay lại nút 2)
Đầu ra:  true

Đầu vào: 1 -> 2 -> null
Đầu ra:  false
```

**Trong game:** mỗi cổng dịch chuyển dẫn tới một cổng kế tiếp, và trước khi mở bản đồ, game cần kiểm tra chuỗi cổng có tạo vòng làm người chơi bị dịch chuyển mãi không.

Bài này dùng class `ListNode` từ bài [đảo danh sách liên kết](/docs/algorithms/reverse-linked-list). Trong C# nhớ đặt class ở cuối file.

## Cách thử hết: nhớ các nút đã đi qua

Người mới hay viết vòng `while (node != null)` rồi chờ nó dừng. Nếu có vòng thì nó không bao giờ dừng, chương trình treo. Phải có cách nhận ra "nút này mình gặp rồi".

Cách dễ nghĩ: cất mỗi nút vào một tập hợp. Gặp lại nút đã có trong tập thì có vòng.

```csharp tab
bool HasCycle(ListNode? head)
{
    var seen = new HashSet<ListNode>();
    for (var node = head; node != null; node = node.Next)
    {
        if (seen.Contains(node)) return true;
        seen.Add(node);
    }
    return false;
}

var a = new ListNode(3); var b = new ListNode(2);
var c = new ListNode(0); var d = new ListNode(-4);
a.Next = b; b.Next = c; c.Next = d; d.Next = b;
Console.WriteLine(HasCycle(a)); // True
```

```python tab
def has_cycle(head):
    seen = set()
    node = head
    while node:
        if node in seen:
            return True
        seen.add(node)
        node = node.next
    return False

a, b, c, d = ListNode(3), ListNode(2), ListNode(0), ListNode(-4)
a.next, b.next, c.next, d.next = b, c, d, b
print(has_cycle(a))  # True
```

Thời gian **O(n)**, bộ nhớ **O(n)**.

> **Lỗi hay gặp:** cất **giá trị** `node.Val` thay vì chính nút. Danh sách `1 -> 1 -> null` không có vòng, nhưng hai nút cùng giá trị 1 nên hàm báo nhầm là có. Cất tham chiếu tới nút mới đúng.

## Cách tối ưu: rùa và thỏ

Cho hai con trỏ chạy từ đầu: rùa (`slow`) mỗi lần đi 1 bước, thỏ (`fast`) mỗi lần đi 2 bước.

- Không có vòng: thỏ chạy tới `null` trước, trả về `false`.
- Có vòng: cả hai đều bị kẹt trong vòng. Mỗi lượt thỏ rút ngắn khoảng cách với rùa đúng 1 bước, nên chắc chắn sẽ đuổi kịp, giống chạy đua trên đường tròn. Hai con trỏ trùng nhau thì trả về `true`.

```csharp tab
bool HasCycle(ListNode? head)
{
    var slow = head;
    var fast = head;
    while (fast != null && fast.Next != null)
    {
        slow = slow!.Next;
        fast = fast.Next.Next;
        if (slow == fast) return true;
    }
    return false;
}

var a = new ListNode(3); var b = new ListNode(2);
var c = new ListNode(0); var d = new ListNode(-4);
a.Next = b; b.Next = c; c.Next = d; d.Next = b;
Console.WriteLine(HasCycle(a));                             // True
Console.WriteLine(HasCycle(new ListNode(1, new ListNode(2)))); // False
```

```python tab
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

a, b, c, d = ListNode(3), ListNode(2), ListNode(0), ListNode(-4)
a.next, b.next, c.next, d.next = b, c, d, b
print(has_cycle(a))                          # True
print(has_cycle(ListNode(1, ListNode(2))))   # False
```

Chạy tay với ví dụ đầu, gọi các nút là 3, 2, 0, -4 (nút -4 trỏ về 2):

| Lượt | slow | fast | Trùng? |
|---|---|---|---|
| 0 | 3 | 3 | bắt đầu |
| 1 | 2 | 0 | không |
| 2 | 0 | 2 | không |
| 3 | -4 | -4 | có, trả về true |

Thỏ chỉ đi vòng tối đa vài lần trước khi gặp rùa, nên thời gian **O(n)**, bộ nhớ **O(1)** vì chỉ có hai biến.

Trong C#, `slow!` báo cho trình biên dịch biết `slow` không null ở đây: thỏ đi trước rùa, thỏ còn nút thì rùa chắc chắn cũng còn.

> **Lỗi hay gặp:** chỉ kiểm tra `fast != null` rồi gọi `fast.Next.Next`. Nếu `fast.Next` là `null`, C# ném `NullReferenceException`, Python báo `AttributeError: 'NoneType' object has no attribute 'next'`. Phải kiểm tra cả `fast` và `fast.Next`.

## Khi đi phỏng vấn

- Nói cách `HashSet` trước, rồi khi được hỏi "không dùng thêm bộ nhớ thì sao" mới đưa ra rùa và thỏ. Giải thích được vì sao thỏ chắc chắn đuổi kịp là điểm cộng lớn.
- Câu hỏi nối tiếp hay gặp: tìm nút bắt đầu vòng. Chuẩn bị sẵn cách làm ở phần bài tập.

## Bài tập

Nếu có vòng, trả về nút nơi vòng bắt đầu, không có vòng thì trả `null`. Với ví dụ đầu, kết quả là nút có giá trị 2.

<details>
<summary>Xem đáp án</summary>

Sau khi rùa và thỏ gặp nhau, đặt một con trỏ về đầu danh sách, con kia ở chỗ gặp. Cho cả hai đi 1 bước mỗi lượt, chỗ chúng gặp lại là đầu vòng.

```csharp tab
ListNode? CycleStart(ListNode? head)
{
    var slow = head;
    var fast = head;
    while (fast != null && fast.Next != null)
    {
        slow = slow!.Next;
        fast = fast.Next.Next;
        if (slow == fast)
        {
            var p = head;
            while (p != slow)
            {
                p = p!.Next;
                slow = slow!.Next;
            }
            return p;
        }
    }
    return null;
}

var a = new ListNode(3); var b = new ListNode(2);
var c = new ListNode(0); var d = new ListNode(-4);
a.Next = b; b.Next = c; c.Next = d; d.Next = b;
Console.WriteLine(CycleStart(a)?.Val); // 2
```

```python tab
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p = p.next
                slow = slow.next
            return p
    return None

a, b, c, d = ListNode(3), ListNode(2), ListNode(0), ListNode(-4)
a.next, b.next, c.next, d.next = b, c, d, b
print(cycle_start(a).val)  # 2
```

</details>
