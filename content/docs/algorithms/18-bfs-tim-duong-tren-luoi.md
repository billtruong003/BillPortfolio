---
title: "BFS: tìm đường ngắn nhất trên bản đồ lưới"
description: "Tìm số bước ít nhất để quái đuổi tới người chơi trên bản đồ ô vuông có tường, dùng BFS với hàng đợi và mảng đánh dấu, giải bằng C# và Python."
section: "Đồ thị và lưới"
order: 18
difficulty: "Trung bình"
tags: ["BFS", "lưới", "hàng đợi", "đồ thị", "phỏng vấn"]
image: /images/docs/algorithms/bfs-tim-duong-tren-luoi.webp
imageIdea: "Nhân vật anime chạy trốn trong mê cung ô vuông của game roguelike, phía sau là một con slime đang lần theo các ô sáng đánh số 1, 2, 3 lan ra như gợn sóng, nhân vật ngoái lại hốt hoảng."
imagePrompt: "Edit this image: the character runs through a top-down tile-based dungeon maze in a roguelike game, looking back in panic at a cute slime monster following them, the floor tiles between them glow with ripple-like numbers '1', '2', '3', '4' spreading out from the slime. Keep the original art style, 16:9."
---

Cho bản đồ lưới gồm các ô trống `.` và tường `#`. Quái đứng ở ô `S`, người chơi ở ô `E`. Mỗi lượt quái bước sang một ô kề cạnh (lên, xuống, trái, phải), không đi xuyên tường. Tìm số bước ít nhất để quái tới chỗ người chơi, không tới được thì trả `-1`.

```text
Đầu vào:
S . . #
# # . #
. . . .
. # # E

Đầu ra: 6   (phải, phải, xuống, xuống, phải, xuống)
```

**Trong game:** mỗi khi người chơi di chuyển, AI của quái trong game roguelike chạy BFS trên bản đồ ô để biết đường ngắn nhất đuổi theo.

## Vì sao không dùng DFS thử mọi đường

Người mới hay viết đệ quy đi sâu theo một hướng, tới ngõ cụt thì quay lui, ghi lại đường ngắn nhất tìm được. Cách này đúng nếu thử hết mọi đường, nhưng số đường trên một bản đồ trống 20 x 20 là con số khổng lồ. DFS (duyệt theo chiều sâu) tìm ra **một** đường, không cho biết đó là đường ngắn nhất.

## Cách đúng: BFS lan ra theo từng lớp

BFS (breadth-first search, duyệt theo chiều rộng) lan ra từ điểm xuất phát giống gợn sóng: xét hết các ô cách 1 bước, rồi hết các ô cách 2 bước, rồi 3 bước. Ô đích được chạm tới lần đầu ở lớp nào thì đó là số bước ít nhất.

Cần hai thứ:

- Một **hàng đợi** (queue): ô nào vào trước thì ra trước, nhờ vậy các ô gần luôn được xét trước ô xa.
- Một mảng **khoảng cách** `dist`, giá trị `-1` nghĩa là chưa ghé. Mảng này vừa lưu số bước vừa làm dấu "đã thăm" (visited).

```csharp tab
int ShortestPath(string[] grid, (int r, int c) start, (int r, int c) goal)
{
    int rows = grid.Length, cols = grid[0].Length;
    var dist = new int[rows, cols];
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            dist[i, j] = -1;

    int[] dr = { 1, -1, 0, 0 };
    int[] dc = { 0, 0, 1, -1 };
    var queue = new Queue<(int r, int c)>();
    queue.Enqueue(start);
    dist[start.r, start.c] = 0;

    while (queue.Count > 0)
    {
        var (r, c) = queue.Dequeue();
        if ((r, c) == goal) return dist[r, c];
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == '#' || dist[nr, nc] != -1) continue;
            dist[nr, nc] = dist[r, c] + 1;
            queue.Enqueue((nr, nc));
        }
    }
    return -1;
}

string[] map = { "S..#", "##.#", "....", ".##E" };
Console.WriteLine(ShortestPath(map, (0, 0), (3, 3))); // 6
```

```python tab
from collections import deque

def shortest_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque([start])
    dist[start[0]][start[1]] = 0

    while queue:
        r, c = queue.popleft()
        if (r, c) == goal:
            return dist[r][c]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == "#" or dist[nr][nc] != -1:
                continue
            dist[nr][nc] = dist[r][c] + 1
            queue.append((nr, nc))
    return -1

game_map = ["S..#", "##.#", "....", ".##E"]
print(shortest_path(game_map, (0, 0), (3, 3)))  # 6
```

Trong Python, `deque` lấy phần tử đầu bằng `popleft()` trong O(1). Dùng `list.pop(0)` cũng chạy, nhưng mỗi lần phải dời cả danh sách nên chậm dần.

Các lớp BFS lan ra trên bản đồ ví dụ, tọa độ ghi theo (hàng, cột):

| Số bước | Ô được chạm tới |
|---|---|
| 0 | (0, 0) |
| 1 | (0, 1) |
| 2 | (0, 2) |
| 3 | (1, 2) |
| 4 | (2, 2) |
| 5 | (2, 1), (2, 3) |
| 6 | (2, 0), (3, 3) là người chơi |

Độ phức tạp: mỗi ô vào hàng đợi tối đa một lần, nên thời gian **O(R × C)**, bộ nhớ **O(R × C)** cho `dist` và hàng đợi, với `R`, `C` là số hàng và số cột.

> **Lỗi hay gặp:** đánh dấu đã thăm lúc **lấy ra** khỏi hàng đợi thay vì lúc **cho vào**. Kết quả vẫn đúng, nhưng một ô có thể bị đẩy vào hàng đợi nhiều lần từ nhiều ô hàng xóm. Trên bản đồ lớn, hàng đợi phình to và game khựng lại mỗi lượt quái tính đường.

> **Lỗi hay gặp:** kiểm tra tường trước khi kiểm tra biên, ví dụ `grid[nr][nc] == '#'` khi `nr = -1`. C# ném `IndexOutOfRangeException`. Python thì lặng lẽ đọc `grid[-1]` là hàng cuối cùng, không báo lỗi mà cho kết quả sai, khó tìm hơn nhiều.

## Khi đi phỏng vấn

- Nói rõ vì sao chọn BFS: mọi bước đi có cùng chi phí. Nếu mỗi ô có chi phí khác nhau (bùn đi chậm hơn đường), phải chuyển sang Dijkstra. Game thật hay dùng A*, là BFS có thêm hàm ước lượng khoảng cách tới đích.
- Hỏi lại đề: được đi chéo không? Nếu được thì thêm 4 hướng chéo vào `dr`, `dc`, phần còn lại giữ nguyên.

## Bài tập

Biết số bước thôi thì quái chưa đi được, nó cần cả đường đi. Sửa hàm để trả về danh sách các ô từ `S` tới `E` (rỗng nếu không tới được). Ô thứ hai trong danh sách là ô quái nên bước tới ở lượt này.

<details>
<summary>Xem đáp án</summary>

Mỗi khi đẩy một ô vào hàng đợi, ghi lại ô "cha" đã dẫn tới nó. Tới đích rồi thì lần ngược theo cha về điểm xuất phát, cuối cùng đảo danh sách.

```csharp tab
List<(int r, int c)> FindPath(string[] grid, (int r, int c) start, (int r, int c) goal)
{
    int rows = grid.Length, cols = grid[0].Length;
    int[] dr = { 1, -1, 0, 0 };
    int[] dc = { 0, 0, 1, -1 };
    var parent = new Dictionary<(int r, int c), (int r, int c)>();
    parent[start] = start;
    var queue = new Queue<(int r, int c)>();
    queue.Enqueue(start);

    while (queue.Count > 0)
    {
        var cur = queue.Dequeue();
        if (cur == goal) break;
        for (int d = 0; d < 4; d++)
        {
            var next = (r: cur.r + dr[d], c: cur.c + dc[d]);
            if (next.r < 0 || next.r >= rows || next.c < 0 || next.c >= cols) continue;
            if (grid[next.r][next.c] == '#' || parent.ContainsKey(next)) continue;
            parent[next] = cur;
            queue.Enqueue(next);
        }
    }

    var path = new List<(int r, int c)>();
    if (!parent.ContainsKey(goal)) return path;
    for (var p = goal; p != start; p = parent[p]) path.Add(p);
    path.Add(start);
    path.Reverse();
    return path;
}

string[] map = { "S..#", "##.#", "....", ".##E" };
Console.WriteLine(string.Join(" ", FindPath(map, (0, 0), (3, 3))));
// (0, 0) (0, 1) (0, 2) (1, 2) (2, 2) (2, 3) (3, 3)
```

```python tab
from collections import deque

def find_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    parent = {start: start}
    queue = deque([start])

    while queue:
        cur = queue.popleft()
        if cur == goal:
            break
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = cur[0] + dr, cur[1] + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == "#" or (nr, nc) in parent:
                continue
            parent[(nr, nc)] = cur
            queue.append((nr, nc))

    if goal not in parent:
        return []
    path = [goal]
    while path[-1] != start:
        path.append(parent[path[-1]])
    path.reverse()
    return path

game_map = ["S..#", "##.#", "....", ".##E"]
print(" ".join(map(str, find_path(game_map, (0, 0), (3, 3)))))
# (0, 0) (0, 1) (0, 2) (1, 2) (2, 2) (2, 3) (3, 3)
```

</details>
