---
title: "Binary Tree Traversal: bốn cách duyệt cây nhị phân"
description: "Duyệt cây nhị phân theo preorder, inorder, postorder bằng đệ quy và theo từng tầng (level order) bằng hàng đợi, có định nghĩa TreeNode, giải bằng C# và Python."
section: "Cây"
order: 20
difficulty: "Dễ"
tags: ["cây nhị phân", "đệ quy", "BFS", "phỏng vấn"]
image: /images/docs/algorithms/duyet-cay-nhi-phan.webp
imageIdea: "Nhân vật anime đứng trước bảng cây kỹ năng phát sáng trong game RPG, dùng cây gậy phép chỉ lần lượt từng ô kỹ năng theo thứ tự, các ô đã chỉ hiện số 1, 2, 3."
imagePrompt: "Edit this image: the character stands in front of a large glowing skill tree panel in a fantasy RPG, pointing a magic staff at the skill nodes one by one, the visited nodes show small glowing numbers '1', '2', '3' and a label at the top reads 'SKILL TREE'. Keep the original art style, 16:9."
---

Cây nhị phân là cấu trúc mà mỗi nút có tối đa hai con: con trái và con phải. Duyệt cây là đi qua mọi nút đúng một lần theo một thứ tự nào đó. Phỏng vấn hay hỏi bốn thứ tự: preorder, inorder, postorder và level order.

```text
Đầu vào:
        1
       / \
      2   3
     / \
    4   5

Preorder:    1 2 4 5 3
Inorder:     4 2 5 1 3
Postorder:   4 5 2 3 1
Level order: 1 2 3 4 5
```

**Trong game:** cây kỹ năng của nhân vật được duyệt theo tầng để vẽ từng hàng kỹ năng lên màn hình, và duyệt postorder để tính tổng điểm đã cộng vào cả một nhánh.

## Định nghĩa nút

Trong C# dùng top-level statements, class phải đặt **sau** code chạy, nếu không sẽ lỗi CS8803. Các khối code bên dưới dùng lại class này, đặt ở cuối file, cùng với cây ví dụ ở trên.

```csharp tab
var root = new TreeNode(1,
    new TreeNode(2, new TreeNode(4), new TreeNode(5)),
    new TreeNode(3));

class TreeNode
{
    public int Val;
    public TreeNode? Left, Right;

    public TreeNode(int val, TreeNode? left = null, TreeNode? right = null)
    {
        Val = val;
        Left = left;
        Right = right;
    }
}
```

```python tab
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(1,
                TreeNode(2, TreeNode(4), TreeNode(5)),
                TreeNode(3))
```

## Ba cách duyệt theo chiều sâu

Người mới hay nhầm ba tên này với nhau. Mẹo nhớ: chữ "pre, in, post" chỉ **vị trí của nút gốc** so với hai con.

- Preorder (duyệt trước): gốc, trái, phải.
- Inorder (duyệt giữa): trái, gốc, phải.
- Postorder (duyệt sau): trái, phải, gốc.

Cả ba viết bằng đệ quy và chỉ khác nhau ở chỗ đặt dòng thêm giá trị.

```csharp tab
void Preorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    result.Add(node.Val);
    Preorder(node.Left, result);
    Preorder(node.Right, result);
}

void Inorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    Inorder(node.Left, result);
    result.Add(node.Val);
    Inorder(node.Right, result);
}

void Postorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    Postorder(node.Left, result);
    Postorder(node.Right, result);
    result.Add(node.Val);
}

var pre = new List<int>();
Preorder(root, pre);
Console.WriteLine(string.Join(" ", pre)); // 1 2 4 5 3
var ino = new List<int>();
Inorder(root, ino);
Console.WriteLine(string.Join(" ", ino)); // 4 2 5 1 3
var post = new List<int>();
Postorder(root, post);
Console.WriteLine(string.Join(" ", post)); // 4 5 2 3 1
```

```python tab
def preorder(node, result):
    if node is None:
        return
    result.append(node.val)
    preorder(node.left, result)
    preorder(node.right, result)

def inorder(node, result):
    if node is None:
        return
    inorder(node.left, result)
    result.append(node.val)
    inorder(node.right, result)

def postorder(node, result):
    if node is None:
        return
    postorder(node.left, result)
    postorder(node.right, result)
    result.append(node.val)

for walk in (preorder, inorder, postorder):
    result = []
    walk(root, result)
    print(*result)
# 1 2 4 5 3
# 4 2 5 1 3
# 4 5 2 3 1
```

Mỗi nút được ghé đúng một lần: thời gian **O(n)**. Bộ nhớ **O(h)** cho ngăn xếp đệ quy, với `h` là chiều cao cây. Cây lệch hẳn về một phía thì `h = n`.

Inorder có một tính chất hay được hỏi: với cây nhị phân tìm kiếm (BST), inorder cho ra các giá trị theo thứ tự tăng dần.

> **Lỗi hay gặp:** quên dòng `if (node == null) return;`. Tới nút lá, hàm gọi tiếp `node.Left` là `null` rồi đọc `.Val`, C# ném `NullReferenceException`, Python báo `AttributeError: 'NoneType' object has no attribute 'val'`.

## Level order: duyệt theo từng tầng

Level order đi hết tầng 1, rồi tầng 2, rồi tầng 3. Đây chính là BFS trên cây, nên dùng hàng đợi: lấy nút ở đầu ra, cho hai con của nó vào cuối.

```csharp tab
List<int> LevelOrder(TreeNode? root)
{
    var result = new List<int>();
    if (root == null) return result;
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);
    while (queue.Count > 0)
    {
        var node = queue.Dequeue();
        result.Add(node.Val);
        if (node.Left != null) queue.Enqueue(node.Left);
        if (node.Right != null) queue.Enqueue(node.Right);
    }
    return result;
}

Console.WriteLine(string.Join(" ", LevelOrder(root))); // 1 2 3 4 5
```

```python tab
from collections import deque

def level_order(root):
    result = []
    if root is None:
        return result
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result

print(*level_order(root))  # 1 2 3 4 5
```

Chạy tay:

| Lấy ra | Thêm vào hàng đợi | Hàng đợi sau bước | Kết quả |
|---|---|---|---|
| 1 | 2, 3 | 2, 3 | 1 |
| 2 | 4, 5 | 3, 4, 5 | 1 2 |
| 3 | không | 4, 5 | 1 2 3 |
| 4 | không | 5 | 1 2 3 4 |
| 5 | không | trống | 1 2 3 4 5 |

Thời gian **O(n)**, bộ nhớ **O(w)** với `w` là số nút nhiều nhất trên một tầng.

> **Lỗi hay gặp:** dùng ngăn xếp (`Stack`, `list.pop()`) thay vì hàng đợi. Nút vào sau lại ra trước, thứ tự thành `1 3 2 5 4`, không còn theo tầng.

## Khi đi phỏng vấn

- Vẽ cây nhỏ 5 nút và tự viết ra cả bốn thứ tự trước khi code. Sai thứ tự ở bước này thì code đúng cũng vô ích.
- Chuẩn bị câu hỏi nối tiếp: viết preorder không dùng đệ quy. Cách làm là dùng `Stack`, đẩy con phải vào trước con trái để con trái ra trước.

## Bài tập

Viết hàm tính độ sâu lớn nhất của cây, tức số nút trên đường dài nhất từ gốc xuống lá. Cây ví dụ có độ sâu 3 (đường 1, 2, 4).

<details>
<summary>Xem đáp án</summary>

Độ sâu của một nút bằng 1 cộng độ sâu lớn hơn trong hai con. Đây là kiểu postorder: phải biết kết quả của hai con trước.

```csharp tab
int MaxDepth(TreeNode? node)
{
    if (node == null) return 0;
    return 1 + Math.Max(MaxDepth(node.Left), MaxDepth(node.Right));
}

Console.WriteLine(MaxDepth(root)); // 3
```

```python tab
def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

print(max_depth(root))  # 3
```

</details>
