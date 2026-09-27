# Platformer — Unity lab journal

Nhật ký dựng game, ghi trong lúc làm. **Không phải bản nháp bài viết.**

Pipeline (theo đúng cách shmup đã làm):

1. Dựng trong Unity theo từng chặng
2. Ghi journal ngay sau mỗi chặng: làm gì, số nào, sai ở đâu, sửa thế nào
3. Dựng xong cả 14 chặng mới dừng lại — **xong ngày 2026-09-19**
3b. Soát lại toàn bộ bằng script đo (chặng 15)
3c. Chơi thử bằng input thật từ spawn tới cửa thoát (chặng 16) — chặng 15 sạch về hình học nhưng màn chơi vẫn không thắng được
4. Đọc lại toàn bộ journal → viết editorial plan — **xong: [`docs/platformer-editorial-plan.md`](../platformer-editorial-plan.md), 17 bài**
5. Từ editorial plan mới viết bài, dùng skill `tutorial-writer`

## Vì sao journal trước, bài sau

Journal ghi được thứ bài viết cần mà lúc viết đã quên: con số thật lúc tune, thao tác nào phải làm lại, lỗi nào mất thời gian nhất. Viết bài song song với dựng thì bài bị nhiễm thứ tự mò mẫm của người làm, chứ không phải thứ tự dễ học của người đọc.

## Quy ước mỗi file

Một file một chặng, đặt tên `NN-ten-chang.md`. Nội dung:

- **Mục tiêu** — chặng này xong thì game làm được gì
- **Đã dựng** — scene, prefab, script, asset, kèm đường dẫn thật
- **Số đã chốt** — mọi con số tune được, kèm lý do chọn
- **Vấp** — lỗi gặp phải, triệu chứng, nguyên nhân, cách sửa. Phần giá trị nhất cho bài viết
- **Ảnh cần chụp** — liệt kê ngay, chụp lúc còn dựng được, đừng để dựng xong mới quay lại
- **Ghi cho người viết bài** — thứ tự nào dạy dễ hơn thứ tự mình vừa làm, chỗ nào người đọc sẽ hỏi

## Trạng thái

| Chặng | Tên | Dựng | Journal |
|---|---|---|---|
| 00 | Setup, pixel art, phòng đầu tiên | ✅ | [00-setup-pixel-art.md](00-setup-pixel-art.md) |
| 01 | Tilemap | ✅ | [01-tilemap-room.md](01-tilemap-room.md) |
| 02 | Chạy | ✅ | [02-run.md](02-run.md) |
| 03 | Nhảy | ✅ | [03-jump.md](03-jump.md) |
| 04 | Double jump, wall jump | ✅ | [04-air-moves.md](04-air-moves.md) |
| 05 | Camera follow + clamp | ✅ | [05-camera.md](05-camera.md) |
| 06 | Animation | ✅ | [06-animation.md](06-animation.md) |
| 07 | PlayerData, 3 nhân vật | ✅ | [07-player-data.md](07-player-data.md) |
| 08 | Bẫy, chết, checkpoint | ✅ | [08-death-respawn.md](08-death-respawn.md) |
| 09 | Gem, thùng, cửa thoát | ✅ | [09-collectibles.md](09-collectibles.md) |
| 10 | Địch 1: tuần tra, giẫm | ✅ | [10-enemies-patrol.md](10-enemies-patrol.md) |
| 11 | Địch 2: charger, cannon, flyer | ✅ | [11-enemy-types.md](11-enemy-types.md) |
| 12 | Boss Brute | ✅ | [12-boss.md](12-boss.md) |
| 13 | Juice: shake, flash, âm thanh | ✅ | [13-juice.md](13-juice.md) |
| 14 | Nhiều màn, chọn màn, HUD, WebGL | ✅ | [14-levels-build.md](14-levels-build.md) |
| 15 | Soát lại: pivot, collider, vị trí, layer | ✅ | [15-audit-pivot-collider-layer.md](15-audit-pivot-collider-layer.md) |
| 16 | Chơi thử thật: luật chơi, va chạm, hồi sinh | ✅ | [16-playtest-fixes.md](16-playtest-fixes.md) |
| 17 | Nền cuộn vô hạn: thử shader rồi bỏ shader | ✅ | [17-background-scroll.md](17-background-scroll.md) |
