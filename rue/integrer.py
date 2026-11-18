#!/usr/bin/env python3
"""Injecte la rue (rue/street.css, rue/street.js) dans index.html. Idempotent : repart toujours de l'original
sauvegardé (rue/index.orig.html) pour ne jamais empiler deux injections."""
import os, shutil, sys
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
idx = os.path.join(R, 'index.html'); orig = os.path.join(D, 'index.orig.html')
if not os.path.exists(orig): shutil.copy(idx, orig)
s = open(orig, encoding='utf8').read()
css = open(os.path.join(D, 'street.css'), encoding='utf8').read()
js = open(os.path.join(D, 'street.js'), encoding='utf8').read()

def put(s, anchor, text, after=True, count=1):
    assert s.count(anchor) == count, (anchor[:60], s.count(anchor))
    i = s.index(anchor) + (len(anchor) if after else 0)
    return s[:i] + text + s[i:]

# 1) styles : après la règle .trip.on
s = put(s, '.trip.on{opacity:1;pointer-events:auto}', '\n/* ===RUE-CSS=== */\n' + css + '/* ===RUE-CSS-END=== */\n')
# 2) calque de la rue dans l'écran du haut (après le calque du trajet)
ov = ('<div class="street" id="street" hidden><canvas id="stCv" width="320" height="260" aria-label="La rue commerçante"></canvas>'
      '<div class="stpad"><button id="stwL" aria-label="Marcher à gauche">◀</button><button id="stwR" aria-label="Marcher à droite">▶</button></div>'
      '<div class="stmodal" id="stModal" hidden role="dialog" aria-modal="true"><div class="stmc"><b id="stMT"></b><p id="stMA"></p><p id="stMB"></p>'
      '<button id="stMClose">Fermer</button></div></div></div>')
s = put(s, '<p id="tripP">En route…</p></div>', ov)
# 3) panneau du bas
pan = ('<section class="view" id="v-street"><div class="opts seg"><button class="on" disabled id="stWhere">La rue commerçante</button>'
       '<button id="stEnter" hidden>Entrer</button><button class="home" id="stHome"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>Maison</button></div>'
       '<p class="sthint">← → (ou Q/D) pour marcher · E pour entrer · touche un bâtiment pour y aller</p></section>')
s = put(s, '<section class="view" id="v-gym">', pan, after=False)
# 4) module JS juste avant le démarrage de la boucle
s = put(s, '\nrequestAnimationFrame(loop);', '\n' + js.rstrip() + '\n// ===RUE-END===', after=False)
open(idx, 'w', encoding='utf8').write(s)
print('ok', len(s))
