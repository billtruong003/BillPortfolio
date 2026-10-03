# Games page: layout directions (not deployed)

Mockups for the future `/games` page of www.billthedev.com, listing Bill The Dev's mobile games
(Meh Merge, Nah Blocks, Bruh Arrows). The same boards live on the brand canvas, page "Website".
No direction is locked yet.

| Direction | Board | Idea |
|---|---|---|
| A · Shelf | `boards/WEB_A_Shelf*.html` | Card grid (feature graphic, icon, name, tagline, description, Google Play + trailer). Wraps to new rows as games are added. |
| B · Spotlight | `boards/WEB_B_Spotlight*.html` | One full-width band per game in the game's own colours, vertical trailer beside the text. |
| C · Shorts wall | `boards/WEB_C_ShortsWall*.html` | Brand lockup, then a swipeable shelf of 9:16 trailer covers. |

- `previews/`: rendered PNG→JPG of every board (desktop 1440 wide, phone 390 wide).
- `assets/`: the images the boards use. The site copies live in `public/images/games/<game>/` (`icon.png`,
  `feature.png`, `trailer-cover.jpg`).
- `gen.py`: generator for the boards (`python gen.py local` writes local previews).

Game data:

| Game | Package | Trailer (YouTube) | Accent / ground |
|---|---|---|---|
| Meh Merge | com.billthedev.mehmerge | https://www.youtube.com/watch?v=U5scIFVhbkg | #FFD23F / #2E2552 |
| Nah Blocks | com.billthedev.nahblocks | https://www.youtube.com/watch?v=iilWXRwL5cQ | #3DDC97 / #2B2F55 |
| Bruh Arrows | com.billthedev.bruharrows | https://www.youtube.com/watch?v=BLJmR8OaI2I | #FF5A5F / #F5F1EA |

Store links: `https://play.google.com/store/apps/details?id=<package>` (live once the games leave closed testing).
Privacy policies: https://billtruong003.github.io/billthedev-legal/

`public/app-ads.txt` authorises AdMob (pub-2681948403948920) for all the games. It must stay at the site root,
because the games' Google Play listings point their Website field at www.billthedev.com.
