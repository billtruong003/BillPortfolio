---
title: "Reverse Linked List: đảo ngược danh sách liên kết"
description: "Đảo chiều một danh sách liên kết đơn bằng ba con trỏ prev, cur, next trong O(n) thời gian và O(1) bộ nhớ, có định nghĩa ListNode, giải bằng C# và Python."
section: "Danh sách liên kết"
order: 15
difficulty: "Dễ"
tags: ["danh sách liên kết", "con trỏ", "phỏng vấn"]
image: /images/docs/algorithms/reverse-linked-list.webp
imageIdea: "Nhân vật anime cưỡi trên đầu con rắn trong game Snake cổ điển, đang kéo dây cương cho con rắn quay đầu đi ngược lại, các đốt thân đánh số 5, 4, 3, 2, 1."
imagePrompt: "Edit this image: the character rides on the head of a giant pixel-art snake from a classic Snake game, pulling reins to turn the snake around, each body segment has a number painted on it reading '5', '4', '3', '2', '1'. Keep the original art style, 16:9."
---

Danh sách liên kết (linked list) là chuỗi các nút, mỗi nút giữ một giá trị và một con trỏ tới nút kế tiếp. Cho nút đầu `head`, hãy đảo chiều cả danh sách và trả về nút đầu mới.

```text
Đầu vào: 1 -> 2 -> 3 -> 4 -> 5
Đầu ra:  5 -> 4 -> 3 -> 2 -> 1
```

**Trong game:** trong game Snake, khi người chơi nhặt vật phẩm "quay đầu", thân rắn lưu dạng danh sách liên kết phải đảo lại để đuôi thành đầu.

## Định nghĩa nút

Hai ngôn ngữ đều không có sẵn kiểu nút cho bài này, nên tự khai báo. Trong C# dùng top-level statements, class phải đặt **sau** code chạy, nếu không sẽ lỗi CS8803. Các khối code bên dưới đều dùng lại class này, đặt ở cuối file.

```csharp tab
class ListNode
{
    public int Val;
    public ListNode? Next;

    public ListNode(int val, ListNode? next = null)
    {
        Val = val;
        Next = next;
    }
}
```

```python tab
class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next
```

## Cách thử hết: chép ra mảng rồi dựng lại

Cách dễ nghĩ nhất: đi hết danh sách, cất giá trị vào mảng, rồi ghi ngược lại từ cuối mảng.

```csharp tab
ListNode? Reverse(ListNode? head)
{
    var values = new List<int>();
    for (var node = head; node != null; node = node.Next)
        values.Add(node.Val);
    int i = values.Count - 1;
    for (var node = head; node != null; node = node.Next)
        node.Val = values[i--];
    return head;
}

var result = Reverse(new ListNode(1, new ListNode(2, new ListNode(3))));
for (var node = result; node != null; node = node.Next)
    Console.Write(node.Val + " "); // 3 2 1
```

```python tab
def reverse(head):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    node = head
    while node:
        node.val = values.pop()
        node = node.next
    return head

node = reverse(ListNode(1, ListNode(2, ListNode(3))))
while node:
    print(node.val, end=" ")  # 3 2 1
    node = node.next
```

Chạy đúng, thời gian **O(n)**, nhưng tốn thêm bộ nhớ **O(n)** cho mảng. Nó cũng chỉ đổi giá trị chứ không đổi liên kết, nên nếu mỗi nút còn giữ dữ liệu khác (một đốt rắn có sprite, vị trí) thì bạn phải chép hết. Người phỏng vấn sẽ yêu cầu đổi liên kết tại chỗ.

## Cách tối ưu: ba con trỏ

Đi từ đầu tới cuối, tại mỗi nút quay mũi tên `Next` của nó về nút phía trước. Cần ba biến:

- `prev`: nút đã đảo xong ngay trước, ban đầu là `null`.
- `cur`: nút đang xử lý.
- `next`: nút kế tiếp, phải cất lại **trước** khi quay mũi tên, nếu không sẽ mất phần còn lại của danh sách.

```csharp tab
ListNode? Reverse(ListNode? head)
{
    ListNode? prev = null;
    var cur = head;
    while (cur != null)
    {
        var next = cur.Next;
        cur.Next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

var result = Reverse(new ListNode(1, new ListNode(2, new ListNode(3))));
for (var node = result; node != null; node = node.Next)
    Console.Write(node.Val + " "); // 3 2 1
```

```python tab
def reverse(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev

node = reverse(ListNode(1, ListNode(2, ListNode(3))))
while node:
    print(node.val, end=" ")  # 3 2 1
    node = node.next
```

Chạy tay với `1 -> 2 -> 3`:

| Vòng | cur | Cất next | Sau khi quay mũi tên | prev sau vòng |
|---|---|---|---|---|
| 1 | 1 | 2 | 1 -> null | 1 |
| 2 | 2 | 3 | 2 -> 1 -> null | 2 |
| 3 | 3 | null | 3 -> 2 -> 1 -> null | 3 |

Khi `cur` thành `null` thì dừng, `prev` đang trỏ vào nút 3, là đầu mới. Thời gian **O(n)**, bộ nhớ **O(1)**.

> **Lỗi hay gặp:** gán `cur.Next = prev` trước khi cất `next`. Sau lệnh đó nút 2, 3... không còn ai trỏ tới, vòng lặp dừng ngay và danh sách chỉ còn một nút.

> **Lỗi hay gặp:** trả về `head` thay vì `prev`. Lúc này `head` đã thành nút cuối, nên kết quả chỉ in ra đúng một số.

Trong Python đặt tên biến `nxt` thay vì `next` để không che hàm có sẵn `next()`.

## Khi đi phỏng vấn

- Vẽ ba ô nút và mũi tên ra giấy hoặc bảng trắng, cho người phỏng vấn thấy từng bước quay mũi tên. Bài con trỏ dễ sai khi chỉ nghĩ trong đầu.
- Hỏi trước các trường hợp biên: danh sách rỗng, chỉ một nút. Code ba con trỏ ở trên xử lý đúng cả hai mà không cần `if` riêng.

## Bài tập

Viết lại hàm đảo danh sách bằng **đệ quy**: đảo phần từ nút thứ hai trở đi, rồi gắn nút đầu vào cuối.

<details>
<summary>Xem đáp án</summary>

Bản đệ quy dùng bộ nhớ **O(n)** cho ngăn xếp, nên danh sách rất dài có thể làm tràn stack.

```csharp tab
ListNode? ReverseRec(ListNode? head)
{
    if (head == null || head.Next == null) return head;
    var newHead = ReverseRec(head.Next);
    head.Next.Next = head;
    head.Next = null;
    return newHead;
}

var result = ReverseRec(new ListNode(1, new ListNode(2, new ListNode(3))));
for (var node = result; node != null; node = node.Next)
    Console.Write(node.Val + " "); // 3 2 1
```

```python tab
def reverse_rec(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_rec(head.next)
    head.next.next = head
    head.next = None
    return new_head

node = reverse_rec(ListNode(1, ListNode(2, ListNode(3))))
while node:
    print(node.val, end=" ")  # 3 2 1
    node = node.next
```

</details>
