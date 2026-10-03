import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
LOCAL = len(sys.argv) > 1   # local preview: images from ../webassets, no dc runtime
OUT = os.path.join(HERE, 'local' if LOCAL else 'project')
os.makedirs(OUT, exist_ok=True)
FOX = '2762964d319a37729325fe628238786b'
B = {'merge': dict(icon='ba879cf48ce0715c3d70ef2b7193fd0a', feat='c4613c7a297a042d8de9f01da57b9e19', short='cdd4384fbdf8c4a244b72f99aa5a1ab4'),
     'blocks': dict(icon='ef5a3680b60558e4184ea671d287eb66', feat='481980a0a2d03b9804800f179d96e0f8', short='18ea4b21242f91799dabb990dbdc1387'),
     'arrows': dict(icon='1614c773e25c1064c25661184137814f', feat='b5101c7c77a78717ae56dae256b600b3', short='33ffdce8bd3f578e911063a0bcbac2f9')}
LOCALF = {'merge': 'meh-merge', 'blocks': 'nah-blocks', 'arrows': 'bruh-arrows'}
KIND = {'icon': 'icon.png', 'feat': 'feature.png', 'short': 'short.jpg'}


def src(g, kind):
    if LOCAL:
        return f'../../webassets/{LOCALF[g]}-{KIND[kind]}'
    return '/_blob/' + B[g][kind]


FOXSRC = '../../fox.svg' if LOCAL else '/_blob/' + FOX
G = [
    dict(k='merge', name='Meh Merge', accent='#FFD23F', bg='#2E2552', ink='#FFFFFF', tag='Two mehs make a bigger meh.',
         desc="Drop balls in a jar. Two the same make a bigger one. Don't let it fill up!"),
    dict(k='blocks', name='Nah Blocks', accent='#3DDC97', bg='#2B2F55', ink='#FFFFFF', tag="Line 'em up. They say nah.",
         desc='Drag blocks onto the board. Fill a line to clear it. Beat your own score!'),
    dict(k='arrows', name='Bruh Arrows', accent='#FF5A5F', bg='#F5F1EA', ink='#1E2240', tag='Tap. Yeet. Bruh.',
         desc='Tap an arrow to make it fly away. Find the right order and clear the board!'),
]
BG, AMBER, MUTED = '#0B0B0C', '#FFB84D', '#B9B4AA'
FONT = "font-family: 'Baloo 2', sans-serif"


def board(name, title, w, h, body):
    head = '' if LOCAL else '<script src="./support.js"></script>\n'
    open_dc, close_dc = ('', '') if LOCAL else ('<x-dc>\n<helmet>\n', '')
    helmet_end = '' if LOCAL else '</helmet>\n'
    tail = '' if LOCAL else ('</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview": {"width": %d, "height": %d}}\'>\n'
                             'class Component extends DCLogic {\nrenderVals() {\nreturn {};\n}\n}\n</script>\n' % (w, h))
    html = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>%s</title>\n%s</head>\n<body>\n%s'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&amp;display=swap">\n'
            '<style>body{margin:0}</style>\n%s'
            '<div style="width: %dpx; height: %dpx; box-sizing: border-box; %s; position: relative; overflow: hidden; background: %s; color: #FFFFFF">\n%s\n</div>\n'
            '%s</body>\n</html>\n') % (title, head, open_dc, helmet_end, w, h, FONT, BG, body, tail)
    open(os.path.join(OUT, name), 'w', encoding='utf8').write(html)


def nav(mobile=False):
    pad = '18px 20px' if mobile else '26px 80px'
    links = '' if mobile else (f'<div style="display: flex; gap: 36px; font-size: 20px; font-weight: 700">'
                               f'<span style="color: {AMBER}">Games</span><span>YouTube</span><span>Contact</span></div>')
    bar = '<div style="width: 26px; height: 3px; border-radius: 2px; background: #FFF"></div>'
    burger = f'<div style="display: flex; flex-direction: column; gap: 5px">{bar}{bar}{bar}</div>' if mobile else ''
    s = 36 if mobile else 44
    return (f'<div style="display: flex; align-items: center; justify-content: space-between; padding: {pad}; border-bottom: 1px solid #222226">'
            f'<div style="display: flex; align-items: center; gap: 12px"><img src="{FOXSRC}" alt="" style="width: {s}px; height: {s}px; display: block">'
            f'<span style="font-size: {24 if mobile else 28}px; font-weight: 800">Bill <span style="color: {AMBER}">The Dev</span></span></div>{links}{burger}</div>')


def footer(mobile=False):
    lay = 'flex-direction: column; gap: 6px; align-items: center' if mobile else 'justify-content: space-between'
    return (f'<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: {"20px" if mobile else "28px 80px"}; border-top: 1px solid #222226; '
            f'display: flex; {lay}; font-size: {15 if mobile else 17}px; color: {MUTED}">'
            f'<span>© 2026 Bill The Dev</span><span><span style="color: {AMBER}">Privacy policies</span> · <span style="color: {AMBER}">Contact</span></span></div>')


def btn(label, primary, color, ink='#1E2240', size=18):
    if primary:
        return (f'<span style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 999px; '
                f'background: {color}; color: {ink}; font-size: {size}px; font-weight: 800">▶ {label}</span>')
    return (f'<span style="display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 999px; '
            f'border: 2px solid {color}; color: {color}; font-size: {size}px; font-weight: 700">{label}</span>')


def chip(text, color):
    return (f'<span style="display: inline-block; padding: 3px 12px; border-radius: 999px; background: {color}22; color: {color}; '
            f'font-size: 15px; font-weight: 700">{text}</span>')


def hero(mobile=False, compact=False):
    if mobile:
        return (f'<div style="padding: 40px 20px 28px; text-align: center"><p style="margin: 0; font-size: 40px; font-weight: 800; line-height: 1">Games</p>'
                f'<p style="margin: 8px 0 0; font-size: 18px; color: {MUTED}">3 games · Android</p></div>')
    return (f'<div style="padding: {"56px" if compact else "72px"} 80px 40px; display: flex; align-items: flex-end; justify-content: space-between">'
            f'<div><p style="margin: 0; font-size: 72px; font-weight: 800; line-height: 0.95">Games</p></div>'
            f'<p style="margin: 0; font-size: 18px; color: {MUTED}">3 games · Android</p></div>')


# ---------- A · Shelf: a grid of cards (feature graphic + icon + text + buttons) ----------
def card_a(g, w):
    fh = round(w * 500 / 1024)
    return (f'<div style="width: {w}px; flex: none; border-radius: 22px; overflow: hidden; background: #17171A; border: 1px solid #26262B">'
            f'<img src="{src(g["k"], "feat")}" alt="{g["name"]} feature graphic" style="width: {w}px; height: {fh}px; display: block; object-fit: cover">'
            f'<div style="padding: 0 24px 26px; position: relative">'
            f'<img src="{src(g["k"], "icon")}" alt="{g["name"]} icon" style="width: 88px; height: 88px; border-radius: 22px; display: block; margin-top: -44px; border: 4px solid #17171A">'
            f'<div style="display: flex; align-items: center; gap: 10px; margin-top: 12px"><p style="margin: 0; font-size: 32px; font-weight: 800; line-height: 1">{g["name"]}</p>{chip("Testing", g["accent"])}</div>'
            f'<p style="margin: 6px 0 0; font-size: 20px; font-weight: 700; color: {g["accent"]}">{g["tag"]}</p>'
            f'<p style="margin: 10px 0 0; font-size: 17px; line-height: 1.4; color: {MUTED}">{g["desc"]}</p>'
            f'<div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap">{btn("Google Play", True, g["accent"])}{btn("Trailer", False, "#FFFFFF")}</div>'
            f'</div></div>')


def dir_a():
    body = nav() + hero() + '<div style="display: flex; gap: 32px; padding: 0 80px">' + ''.join(card_a(g, 405) for g in G) + '</div>'
    body += (f'<div style="margin: 40px 80px 0; padding: 26px 28px; border-radius: 22px; border: 2px dashed #2A2A30; color: {MUTED}; font-size: 19px; text-align: center">'
             'More games go here: the grid wraps to new rows (3 per row on desktop, 1 on phones).</div>')
    body += footer()
    board('WEB_A_Shelf.dc.html', 'Games page A shelf', 1440, 1060, body)
    mb = (nav(True) + hero(True) + '<div style="display: flex; flex-direction: column; gap: 22px; padding: 0 16px">'
          + ''.join(card_a(g, 358) for g in G) + '</div>' + footer(True))
    board('WEB_A_Shelf_Mobile.dc.html', 'Games page A shelf mobile', 390, 2120, mb)


# ---------- B · Spotlight: one full-width band per game in its own colours, vertical trailer beside ----------
def row_b(g, flip, mobile=False):
    light = g['k'] == 'arrows'
    sub = '#4A4F6E' if light else '#D9D4F0'
    accent = '#FF5A5F' if light else g['accent']
    vid = (f'<div style="position: relative; width: {240 if mobile else 300}px; flex: none; border-radius: 26px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.35)">'
           f'<img src="{src(g["k"], "short")}" alt="{g["name"]} trailer" style="width: 100%; display: block">'
           f'<div style="position: absolute; left: 50%; top: 50%; width: 76px; height: 76px; margin: -38px 0 0 -38px; border-radius: 50%; '
           f'background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 30px">▶</div></div>')
    center = 'text-align: center; display: flex; flex-direction: column; align-items: center' if mobile else 'max-width: 560px'
    txt = (f'<div style="{center}">'
           f'<img src="{src(g["k"], "icon")}" alt="" style="width: {84 if mobile else 104}px; height: {84 if mobile else 104}px; border-radius: 24px; display: block">'
           f'<p style="margin: 18px 0 0; font-size: {44 if mobile else 64}px; font-weight: 800; line-height: 0.95; color: {g["ink"]}">{g["name"]}</p>'
           f'<p style="margin: 10px 0 0; font-size: {22 if mobile else 28}px; font-weight: 800; color: {accent}">{g["tag"]}</p>'
           f'<p style="margin: 14px 0 0; font-size: {18 if mobile else 21}px; line-height: 1.45; color: {sub}">{g["desc"]}</p>'
           f'<div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; {"justify-content: center" if mobile else ""}">'
           f'{btn("Google Play", True, accent, "#FFFFFF" if light else "#1E2240", 20)}{btn("Privacy", False, sub, size=18)}</div></div>')
    if mobile:
        return f'<div style="background: {g["bg"]}; padding: 44px 20px; display: flex; flex-direction: column; align-items: center; gap: 28px">{txt}{vid}</div>'
    inner = txt + vid if flip else vid + txt
    return f'<div style="background: {g["bg"]}; padding: 70px 80px; display: flex; align-items: center; justify-content: center; gap: 110px">{inner}</div>'


def dir_b():
    body = nav() + hero(compact=True) + ''.join(row_b(g, i % 2 == 1) for i, g in enumerate(G)) + footer()
    board('WEB_B_Spotlight.dc.html', 'Games page B spotlight', 1440, 2400, body)
    mb = nav(True) + hero(True) + ''.join(row_b(g, False, True) for g in G) + footer(True)
    board('WEB_B_Spotlight_Mobile.dc.html', 'Games page B spotlight mobile', 390, 2990, mb)


# ---------- C · Shorts wall: the brand lockup, then a swipeable shelf of 9:16 trailer covers ----------
def tile_c(g, w):
    h = round(w * 16 / 9)
    return (f'<div style="width: {w}px; flex: none">'
            f'<div style="position: relative; width: {w}px; height: {h}px; border-radius: 20px; overflow: hidden">'
            f'<img src="{src(g["k"], "short")}" alt="{g["name"]} trailer" style="width: 100%; height: 100%; object-fit: cover; display: block">'
            f'<div style="position: absolute; left: 12px; top: 12px; padding: 4px 10px; border-radius: 8px; background: rgba(0,0,0,0.6); font-size: 14px; font-weight: 700">▶ 0:30</div></div>'
            f'<div style="display: flex; gap: 12px; align-items: center; margin-top: 14px">'
            f'<img src="{src(g["k"], "icon")}" alt="" style="width: 52px; height: 52px; border-radius: 14px; display: block">'
            f'<div><p style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.05">{g["name"]}</p>'
            f'<p style="margin: 2px 0 0; font-size: 16px; color: {g["accent"]}; font-weight: 700">{g["tag"]}</p></div></div>'
            f'<div style="display: flex; gap: 8px; margin-top: 12px">{btn("Google Play", True, g["accent"], size=15)}</div></div>')


def dir_c():
    lock = (f'<div style="display: flex; align-items: center; gap: 28px; padding: 70px 80px 50px">'
            f'<img src="{FOXSRC}" alt="" style="width: 120px; height: 120px">'
            f'<div><p style="margin: 0; font-size: 64px; font-weight: 800; line-height: 0.95">Bill <span style="color: {AMBER}">The Dev</span></p>'
            f'<p style="margin: 8px 0 0; font-size: 22px; color: {MUTED}">Indie games · gameplay · devlogs</p></div></div>')
    shelf = ('<div style="padding: 0 80px"><div style="display: flex; align-items: baseline; justify-content: space-between">'
             '<p style="margin: 0 0 22px; font-size: 34px; font-weight: 800">Games</p>'
             f'<p style="margin: 0; font-size: 18px; color: {MUTED}">← swipe →</p></div>'
             '<div style="display: flex; gap: 28px">' + ''.join(tile_c(g, 300) for g in G) +
             f'<div style="width: 300px; height: 533px; flex: none; border-radius: 20px; border: 2px dashed #2A2A30; display: flex; align-items: center; '
             f'justify-content: center; color: {MUTED}; font-size: 20px; text-align: center; padding: 20px; box-sizing: border-box">Next game</div></div></div>')
    board('WEB_C_ShortsWall.dc.html', 'Games page C shorts wall', 1440, 1160, nav() + lock + shelf + footer())
    mlock = (f'<div style="padding: 36px 16px 30px; display: flex; align-items: center; gap: 16px"><img src="{FOXSRC}" alt="" style="width: 72px; height: 72px">'
             f'<div><p style="margin: 0; font-size: 36px; font-weight: 800; line-height: 0.95">Bill <span style="color: {AMBER}">The Dev</span></p>'
             f'<p style="margin: 4px 0 0; font-size: 16px; color: {MUTED}">Indie games · gameplay · devlogs</p></div></div>')
    mshelf = ('<div style="padding: 0 0 0 16px"><p style="margin: 0 0 16px; font-size: 28px; font-weight: 800">Games</p>'
              '<div style="display: flex; gap: 16px">' + ''.join(tile_c(g, 230) for g in G) + '</div></div>')
    board('WEB_C_ShortsWall_Mobile.dc.html', 'Games page C shorts wall mobile', 390, 1000, nav(True) + mlock + mshelf + footer(True))


dir_a()
dir_b()
dir_c()
print('ok', OUT)
