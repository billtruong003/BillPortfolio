---
title: "Number of Islands: đếm đảo và tô vùng (flood fill)"
description: "Đếm số vùng đất liền trên lưới bằng flood fill, viết theo DFS đệ quy và BFS dùng hàng đợi, kèm lỗi tràn stack khi đệ quy quá sâu, giải bằng C# và Python."
section: "Đồ thị và lưới"
order: 19
difficulty: "Trung bình"
tags: ["DFS", "BFS", "flood fill", "lưới", "phỏng vấn"]
image: /images/docs/algorithms/dem-dao-flood-fill.webp
imageIdea: "Nhân vật anime cầm xô sơn khổng lồ đổ xuống bản đồ quần đảo trong game khám phá, sơn loang kín một hòn đảo rồi dừng ở mép nước, bên cạnh là bảng đếm ghi Đảo: 3."
imagePrompt: "Edit this image: the character holds a giant paint bucket and pours bright paint onto a top-down island map in an exploration game, the paint fills exactly one island and stops at the water's edge, a wooden sign nearby reads 'ISLANDS: 3'. Keep the original art style, 16:9."
---

Cho lưới gồm `1` là đất và `0` là nước. Các ô đất nối với nhau theo cạnh (lên, xuống, trái, phải) tạo thành một đảo. Đếm số đảo trên lưới.

```text
Đầu vào:
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1

Đầu ra: 3
```

**Trong game:** game match-3 dùng đúng thuật toán này để tìm cụm viên đá cùng màu nối nhau, cụm nào đủ 3 viên trở lên thì nổ.

## Ý tưởng: gặp đất thì tô cả đảo

Người mới hay đếm số ô đất, hoặc cố so từng ô với hàng xóm để đoán ô nào thuộc đảo nào. Cách đó rối và dễ đếm trùng. Cách đúng gọi là flood fill (tô loang), giống công cụ xô sơn trong phần mềm vẽ:

1. Duyệt từng ô của lưới.
2. Gặp ô đất chưa tô thì tăng biến đếm lên 1.
3. Từ ô đó tô loang ra mọi ô đất nối liền, đánh dấu là đã tô. Cả đảo sẽ không bị đếm lại lần nữa.

Ở đây ta đánh dấu bằng cách đổi `1` thành `0`, gọi là "nhấn chìm" đảo. Mỗi ô được tô tối đa một lần, nên thời gian **O(R × C)** với `R`, `C` là số hàng và số cột.

## Cách 1: DFS đệ quy

DFS (duyệt theo chiều sâu) viết bằng đệ quy rất gọn: tô ô hiện tại rồi gọi lại chính nó cho bốn ô kề.

```csharp tab
int CountIslands(char[][] grid)
{
    int count = 0;
    for (int r = 0; r < grid.Length; r++)
        for (int c = 0; c < grid[r].Length; c++)
            if (grid[r][c] == '1')
            {
                count++;
                Sink(grid, r, c);
            }
    return count;
}

void Sink(char[][] grid, int r, int c)
{
    if (r < 0 || r >= grid.Length || c < 0 || c >= grid[r].Length) return;
    if (grid[r][c] != '1') return;
    grid[r][c] = '0';
    Sink(grid, r + 1, c);
    Sink(grid, r - 1, c);
    Sink(grid, r, c + 1);
    Sink(grid, r, c - 1);
}

char[][] map =
{
    "11000".ToCharArray(),
    "11000".ToCharArray(),
    "00100".ToCharArray(),
    "00011".ToCharArray(),
};
Console.WriteLine(CountIslands(map)); // 3
```

```python tab
def count_islands(grid):
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[r])):
            if grid[r][c] == "1":
                count += 1
                sink(grid, r, c)
    return count

def sink(grid, r, c):
    if not (0 <= r < len(grid) and 0 <= c < len(grid[r])):
        return
    if grid[r][c] != "1":
        return
    grid[r][c] = "0"
    sink(grid, r + 1, c)
    sink(grid, r - 1, c)
    sink(grid, r, c + 1)
    sink(grid, r, c - 1)

game_map = [list("11000"), list("11000"), list("00100"), list("00011")]
print(count_islands(game_map))  # 3
```

Với ví dụ trên, biến đếm tăng ở ba chỗ:

| Ô bắt đầu (hàng, cột) | Các ô bị nhấn chìm | count |
|---|---|---|
| (0, 0) | (0, 0), (1, 0), (1, 1), (0, 1) | 1 |
| (2, 2) | (2, 2) | 2 |
| (3, 3) | (3, 3), (3, 4) | 3 |

Ô (2, 2) và (3, 3) chỉ chạm nhau ở góc, không chung cạnh, nên là hai đảo riêng.

> **Lỗi hay gặp:** đệ quy quá sâu. Một bản đồ 1000 x 1000 toàn đất khiến `Sink` gọi lồng nhau tới cả triệu tầng. Python dừng ở khoảng 1000 tầng với `RecursionError: maximum recursion depth exceeded`. C# thì văng `StackOverflowException`, lỗi này không bắt được bằng `try/catch`, chương trình tắt luôn. Bản đồ nhỏ thì đệ quy ổn, bản đồ lớn phải chuyển sang cách 2.

## Cách 2: BFS với hàng đợi

Thay ngăn xếp gọi hàm bằng một hàng đợi tự quản lý. Hàng đợi nằm trên heap nên chứa được hàng triệu ô mà không tràn.

```csharp tab
int CountIslands(char[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length, count = 0;
    int[] dr = { 1, -1, 0, 0 };
    int[] dc = { 0, 0, 1, -1 };
    var queue = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] != '1') continue;
            count++;
            grid[r][c] = '0';
            queue.Enqueue((r, c));
            while (queue.Count > 0)
            {
                var (cr, cc) = queue.Dequeue();
                for (int d = 0; d < 4; d++)
                {
                    int nr = cr + dr[d], nc = cc + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';
                    queue.Enqueue((nr, nc));
                }
            }
        }
    return count;
}

char[][] map =
{
    "11000".ToCharArray(),
    "11000".ToCharArray(),
    "00100".ToCharArray(),
    "00011".ToCharArray(),
};
Console.WriteLine(CountIslands(map)); // 3
```

```python tab
from collections import deque

def count_islands(grid):
    rows, cols, count = len(grid), len(grid[0]), 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1":
                continue
            count += 1
            grid[r][c] = "0"
            queue = deque([(r, c)])
            while queue:
                cr, cc = queue.popleft()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                        grid[nr][nc] = "0"
                        queue.append((nr, nc))
    return count

game_map = [list("11000"), list("11000"), list("00100"), list("00011")]
print(count_islands(game_map))  # 3
```

Thời gian **O(R × C)**, bộ nhớ **O(R × C)** trong trường hợp xấu nhất cho hàng đợi.

> **Lỗi hay gặp:** hàm nhấn chìm đảo làm hỏng lưới gốc. Nếu phần khác của game còn cần bản đồ, gọi hàm xong thì bản đồ chỉ còn nước. Hãy truyền vào một bản sao, hoặc dùng mảng `bool[,] visited` riêng thay vì sửa lưới.

## Khi đi phỏng vấn

- Viết DFS đệ quy trước vì ngắn, rồi tự nêu giới hạn độ sâu đệ quy và đưa ra bản BFS. Người phỏng vấn đánh giá cao việc bạn biết code mình gãy ở đâu.
- Hỏi lại: ô nối chéo có tính là cùng đảo không, được sửa lưới đầu vào không. Hai câu này quyết định số hướng đi và cách đánh dấu.

## Bài tập

Bàn match-3 lưu màu mỗi viên bằng một ký tự. Viết hàm nhận bàn và một ô, trả về số viên cùng màu nối liền với ô đó, không sửa bàn gốc.

```text
R R G
R G G
B G B

Ô (0, 0) trả về 3, ô (1, 1) trả về 4
```

<details>
<summary>Xem đáp án</summary>

```csharp tab
int ClusterSize(string[] board, int sr, int sc)
{
    char color = board[sr][sc];
    var visited = new HashSet<(int, int)> { (sr, sc) };
    var queue = new Queue<(int r, int c)>();
    queue.Enqueue((sr, sc));
    int[] dr = { 1, -1, 0, 0 };
    int[] dc = { 0, 0, 1, -1 };
    while (queue.Count > 0)
    {
        var (r, c) = queue.Dequeue();
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= board.Length || nc < 0 || nc >= board[nr].Length) continue;
            if (board[nr][nc] != color || !visited.Add((nr, nc))) continue;
            queue.Enqueue((nr, nc));
        }
    }
    return visited.Count;
}

string[] board = { "RRG", "RGG", "BGB" };
Console.WriteLine(ClusterSize(board, 0, 0)); // 3
Console.WriteLine(ClusterSize(board, 1, 1)); // 4
```

```python tab
from collections import deque

def cluster_size(board, sr, sc):
    color = board[sr][sc]
    visited = {(sr, sc)}
    queue = deque([(sr, sc)])
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < len(board) and 0 <= nc < len(board[nr])):
                continue
            if board[nr][nc] != color or (nr, nc) in visited:
                continue
            visited.add((nr, nc))
            queue.append((nr, nc))
    return len(visited)

board = ["RRG", "RGG", "BGB"]
print(cluster_size(board, 0, 0))  # 3
print(cluster_size(board, 1, 1))  # 4
```

</details>
