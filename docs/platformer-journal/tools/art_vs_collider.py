"""
So hình VẼ THẬT của sprite với collider trong scene.

Vì sao cần: một ô sprite 32x32 không có nghĩa nhân vật cao 32 px. Pack này vẽ thùng
22x22 px nằm giữa ô, chừa 5 px trống ở đáy — để pivot Center thì thùng lơ lửng 5 px
trên mặt đất, mà không có lỗi nào báo. Soát theo ô sprite sẽ không thấy; phải đọc alpha.

Cách dùng:
  1. Trong Unity (Play mode, để collider gán lúc Awake là số thật), chạy đoạn dump
     ở cuối file này để ghi Temp/sprite_audit_play.txt
  2. python art_vs_collider.py <đường dẫn project Unity>
"""
import sys, os
from PIL import Image

cache = {}

def content_bbox(tex, rx, ry, rw, rh):
    """Hộp bao alpha bên trong rect của sprite, tính bằng px từ đáy rect."""
    if tex not in cache:
        cache[tex] = Image.open(tex).convert("RGBA")
    im = cache[tex]
    _, h = im.size
    left, upper = int(rx), int(h - ry - rh)          # Unity gốc dưới-trái, PIL gốc trên-trái
    bb = im.crop((left, upper, left + int(rw), upper + int(rh))).getbbox()
    if bb is None:
        return None
    l, t, r, b = bb
    return l, rh - b, r, rh - t

def main(project):
    dump = os.path.join(project, "Temp", "sprite_audit_play.txt")
    print(f"{'object':<18}{'artBottom':>10}{'colBottom':>10}{'diff':>8}{'artW':>7}{'colW':>7}  note")
    bad = 0
    for line in open(dump, encoding="utf-8"):
        f = line.rstrip("\n").split("|")
        if len(f) < 16:
            continue
        name, tex = f[1], os.path.join(project, f[2])
        rx, ry, rw, rh = map(float, f[3:7])
        pvx, pvy, ppu = float(f[7]), float(f[8]), float(f[9])
        px, py = float(f[10]), float(f[11])
        cminx, cminy, cmaxx, _ = map(float, f[12:16])
        bb = content_bbox(tex, rx, ry, rw, rh)
        if bb is None:
            continue
        x0, y0, x1, _ = bb
        art_b = py + (y0 - pvy) / ppu
        art_w = (x1 - x0) / ppu
        diff = cminy - art_b
        note = ""
        if abs(diff) > 0.1:                           # 1.6 px ở PPU 16
            note = "FLOATS" if diff < 0 else "SINKS"
            bad += 1
        print(f"{name:<18}{art_b:>10.3f}{cminy:>10.3f}{diff:>8.3f}"
              f"{art_w:>7.2f}{cmaxx - cminx:>7.2f}  {note}")
    print(f"\n{bad} mismatched")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "D:/Projects/Tutorial")

# ---------------------------------------------------------------------------
# Đoạn dump chạy trong Unity (unity_execute_code, Play mode):
#
# var rows = new System.Collections.Generic.List<string>();
# var sc = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
# foreach (var go in UnityEngine.Object.FindObjectsByType<UnityEngine.GameObject>(
#              UnityEngine.FindObjectsInactive.Include, UnityEngine.FindObjectsSortMode.None))
# {
#     var sr = go.GetComponent<UnityEngine.SpriteRenderer>();
#     var col = go.GetComponent<UnityEngine.Collider2D>();
#     if (sr == null || sr.sprite == null || col == null) continue;
#     var s = sr.sprite; var cb = col.bounds; var p = go.transform.position;
#     rows.Add(string.Join("|", new [] { sc.name, go.name,
#         UnityEditor.AssetDatabase.GetAssetPath(s.texture),
#         s.rect.x.ToString("0.##"), s.rect.y.ToString("0.##"),
#         s.rect.width.ToString("0.##"), s.rect.height.ToString("0.##"),
#         s.pivot.x.ToString("0.####"), s.pivot.y.ToString("0.####"),
#         s.pixelsPerUnit.ToString("0.##"),
#         p.x.ToString("0.####"), p.y.ToString("0.####"),
#         cb.min.x.ToString("0.####"), cb.min.y.ToString("0.####"),
#         cb.max.x.ToString("0.####"), cb.max.y.ToString("0.####") }));
# }
# System.IO.File.WriteAllLines("Temp/sprite_audit_play.txt", rows.ToArray());
# ---------------------------------------------------------------------------
