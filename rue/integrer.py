#!/usr/bin/env python3
"""Injecte la rue (rue/street.css, rue/street.js) dans index.html. Idempotent : repart toujours de l'original
sauvegardé (rue/index.orig.html) pour ne jamais empiler deux injections."""
import os, shutil, sys
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
idx = os.path.join(R, 'index.html'); orig = os.path.join(D, 'index.orig.html')
if not os.path.exists(orig): shutil.copy(idx, orig)
s = open(orig, encoding='utf8').read()
css = open(os.path.join(D, 'street.css'), encoding='utf8').read()
js = open(os.path.join(D, 'audio.js'), encoding='utf8').read().rstrip() + '\n' + open(os.path.join(D, 'musique.js'), encoding='utf8').read().rstrip() + '\n' + open(os.path.join(D, 'street.js'), encoding='utf8').read()
bcss = open(os.path.join(D, 'bowling.css'), encoding='utf8').read()
bjs = open(os.path.join(D, 'bowling.js'), encoding='utf8').read()
acss = open(os.path.join(D, 'arcade.css'), encoding='utf8').read() + open(os.path.join(D, 'cinema.css'), encoding='utf8').read()
ajs = open(os.path.join(D, 'arcade.js'), encoding='utf8').read()
cjs = open(os.path.join(D, 'films_data.js'), encoding='utf8').read() + open(os.path.join(D, 'cinema.js'), encoding='utf8').read()
pjs = open(os.path.join(D, 'paysage.js'), encoding='utf8').read() + open(os.path.join(D, 'titre.js'), encoding='utf8').read()
pcss = open(os.path.join(D, 'paysage.css'), encoding='utf8').read() + open(os.path.join(D, 'titre.css'), encoding='utf8').read()
# mini-jeux de la borne : un fichier par jeu dans rue/jeux/, chargés après la borne
import glob
jeux = ''.join('\n' + open(f, encoding='utf8').read().rstrip() for f in sorted(glob.glob(os.path.join(D, 'jeux', '*.js'))))

def put(s, anchor, text, after=True, count=1):
    assert s.count(anchor) == count, (anchor[:60], s.count(anchor))
    i = s.index(anchor) + (len(anchor) if after else 0)
    return s[:i] + text + s[i:]

# 1) styles : après la règle .trip.on
s = put(s, '.trip.on{opacity:1;pointer-events:auto}', '\n/* ===RUE-CSS=== */\n' + css + bcss + acss + '/* ===RUE-CSS-END=== */\n')
# 2) calque de la rue dans l'écran du haut (après le calque du trajet)
ov = ('<div class="street" id="street" hidden><canvas id="stCv" width="320" height="260" aria-label="La rue commerçante"></canvas>'
      '<div class="stpad"><button id="stwL" aria-label="Marcher à gauche">◀</button><button id="stwR" aria-label="Marcher à droite">▶</button></div>'
      '<div class="stmodal" id="stModal" hidden role="dialog" aria-modal="true"><div class="stmc"><b id="stMT"></b><p id="stMA"></p><p id="stMB"></p>'
      '<button id="stMClose">Fermer</button></div></div></div>'
      '<div class="bowl" id="bowl" hidden><canvas id="bwCv" width="320" height="360" aria-label="Piste de bowling"></canvas>'
      '<div class="bwmodal" id="bwEnd" hidden><div class="bwmc"><b>Partie terminée</b><p class="bwfin"><span id="bwFinal">0</span>points</p><p id="bwRec"></p><ul id="bwStats"></ul>'
      '<div class="bwbt"><button id="bwAgain">Rejouer</button><button id="bwLeave">Quitter le bowling</button></div></div></div></div>')
s = put(s, '<p id="tripP">En route…</p></div>', ov)
# 3) panneau du bas
pan = ('<section class="view" id="v-street"><div class="opts seg"><button class="on" disabled id="stWhere">La rue commerçante</button>'
       '<button id="stEnter" hidden>Entrer</button><button class="home" id="stHome"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>Maison</button></div>'
       '<p class="sthint">← → (ou Q/D) pour marcher · E pour entrer · touche un bâtiment pour y aller</p></section>')
s = put(s, '<section class="view" id="v-gym">', pan, after=False)
bpan = ('<section class="view" id="v-bowling"><table class="bwtab"><tbody id="bwTab"></tbody></table><div class="bwrow" id="bwBalls"></div>'
        '<div class="bwrow bwspin"><label for="bwSpin">Effet</label><input type="range" id="bwSpin" min="-2" max="2" step="1" value="0"><span id="bwSpinV">Sans effet</span></div>'
        '<div class="opts seg"><button id="bwRestart">Recommencer</button><button class="home" id="bwQuit"><svg viewBox="0 0 24 24"><path d="M14 3H6v18h8"/><path d="M11 12h10M17 8l4 4-4 4"/></svg>Quitter</button></div>'
        '<p class="sthint" id="bwTip"></p></section>')
s = put(s, '<section class="view" id="v-gym">', bpan, after=False)
apan = '<section class="view" id="v-arcade"></section>'
cpan = ('<section class="view" id="v-cinema"><div class="opts seg"><button class="on" disabled id="ciWhere">Cinéma</button>'
        '<button class="home" id="ciLeave"><svg viewBox="0 0 24 24"><path d="M14 3H6v18h8"/><path d="M11 12h10M17 8l4 4-4 4"/></svg>Partir</button></div>'
        '<p class="ciInfo" id="ciInfo"></p><div class="actg" id="ciG"></div></section>')
s = put(s, '<section class="view" id="v-gym">', apan, after=False)
s = put(s, '<section class="view" id="v-gym">', cpan, after=False)
# 4) module JS juste avant le démarrage de la boucle
s = put(s, '\nrequestAnimationFrame(loop);', '\n' + js.rstrip() + '\n' + bjs.rstrip() + '\n' + ajs.rstrip() + jeux + '\n' + cjs.rstrip() + '\n' + pjs.rstrip() + '\n// ===RUE-END===', after=False)
# 5) mode paysage : feuille de style en dernier pour primer sur les règles portrait
s = put(s, '</head>', '<style id="paysage">' + pcss + '</style>\n', after=False)
open(idx, 'w', encoding='utf8').write(s)
print('ok', len(s))
