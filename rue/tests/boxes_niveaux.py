#!/usr/bin/env python3
"""Vérifie les 30 niveaux de Box Master directement dans rue/jeux/boxes.js :
 - pièce fermée, un seul joueur, autant de cibles que de caisses, aucune caisse sur une case morte au départ ;
 - niveau RÉSOLUBLE : un solveur (recherche meilleur d'abord sur les poussées) trouve une solution,
   rejouée ensuite pas à pas avec les règles exactes du jeu (pousser une seule caisse, jamais tirer, murs infranchissables) ;
 - écrit les solutions dans rue/tests/boxes_solutions.json (utilisées par boxes_tests.js).
Usage : python3 rue/tests/boxes_niveaux.py"""
import os, re, json, heapq, itertools, collections, sys, time
D = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(D, '..', 'jeux', 'boxes.js'), encoding='utf8').read()
LEVELS = [(m.group(1), json.loads('[' + m.group(2) + ']')) for m in re.finditer(r'\{nom:"([^"]*)",map:\[(.*?)\]\}', SRC)]
DIRS = [(0, -1, 'u'), (0, 1, 'd'), (-1, 0, 'l'), (1, 0, 'r')]

def parse(rows):
    W = max(len(r) for r in rows); walls, goals, boxes, player = set(), set(), set(), None
    for y, r in enumerate(rows):
        for x, c in enumerate(r.ljust(W)):
            if c == '#': walls.add((x, y))
            if c in '.*+': goals.add((x, y))
            if c in '$*': boxes.add((x, y))
            if c in '@+':
                assert player is None, 'deux joueurs'; player = (x, y)
    assert player, 'pas de joueur'
    inside, st = set(), [player]
    while st:
        p = st.pop()
        if p in inside or p in walls: continue
        assert 0 <= p[0] < W and 0 <= p[1] < len(rows), 'pièce ouverte'
        inside.add(p); st += [(p[0] + dx, p[1] + dy) for dx, dy, _ in DIRS]
    return dict(walls=walls, goals=goals, boxes=frozenset(boxes), player=player, inside=inside)

def dead_squares(L):
    ok, st = set(L['goals']), list(L['goals'])
    while st:
        b = st.pop()
        for dx, dy, _ in DIRS:
            a, p = (b[0] + dx, b[1] + dy), (b[0] + 2 * dx, b[1] + 2 * dy)
            if a in L['inside'] and p in L['inside'] and a not in ok: ok.add(a); st.append(a)
    return L['inside'] - ok

def reach(L, boxes, p):
    seen, st = {p}, [p]
    while st:
        x, y = st.pop()
        for dx, dy, _ in DIRS:
            q = (x + dx, y + dy)
            if q in L['inside'] and q not in boxes and q not in seen: seen.add(q); st.append(q)
    return seen

def walk(L, boxes, a, b):
    prev, q = {a: None}, collections.deque([a])
    while q:
        p = q.popleft()
        if p == b:
            out = []
            while prev[p]: p, c = prev[p]; out.append(c)
            return ''.join(reversed(out))
        for dx, dy, c in DIRS:
            n = (p[0] + dx, p[1] + dy)
            if n in L['inside'] and n not in boxes and n not in prev: prev[n] = (p, c); q.append(n)

def solve(L, tmax=300):
    dead = dead_squares(L); goals = L['goals']
    dist = {}
    for c in L['inside']:
        dist[c] = min(abs(c[0] - g[0]) + abs(c[1] - g[1]) for g in goals)
    h = lambda bx: sum(dist[b] for b in bx)
    r0 = reach(L, L['boxes'], L['player']); k0 = (L['boxes'], min(r0))
    par = {k0: None}; cnt = itertools.count(); Q = [(h(L['boxes']), next(cnt), L['boxes'], r0, k0)]; t0 = time.time()
    while Q:
        _, _, boxes, r, k = heapq.heappop(Q)
        if boxes == goals:
            seq = []
            while par[k]: k, mv = par[k]; seq.append(mv)
            bx, p, sol = set(L['boxes']), L['player'], ''
            for b, dx, dy, c in reversed(seq):
                sol += walk(L, bx, p, (b[0] - dx, b[1] - dy)) + c; bx.remove(b); bx.add((b[0] + dx, b[1] + dy)); p = b
            return sol
        if time.time() - t0 > tmax: return None
        for b in boxes:
            for dx, dy, c in DIRS:
                pl, nb = (b[0] - dx, b[1] - dy), (b[0] + dx, b[1] + dy)
                if pl not in r or nb not in L['inside'] or nb in boxes or nb in dead: continue
                nbx = frozenset(boxes - {b} | {nb}); rr = reach(L, nbx, b); kk = (nbx, min(rr))
                if kk in par: continue
                par[kk] = (k, (b, dx, dy, c)); heapq.heappush(Q, (h(nbx), next(cnt), nbx, rr, kk))
    return None

def replay(L, sol):
    bx, p = set(L['boxes']), L['player']
    for c in sol:
        dx, dy = {'u': (0, -1), 'd': (0, 1), 'l': (-1, 0), 'r': (1, 0)}[c]; n = (p[0] + dx, p[1] + dy)
        if n not in L['inside']: return False
        if n in bx:
            nn = (n[0] + dx, n[1] + dy)
            if nn not in L['inside'] or nn in bx: return False
            bx.remove(n); bx.add(nn)
        p = n
    return bx == L['goals']

if __name__ == '__main__':
    assert len(LEVELS) == 30, len(LEVELS)
    out, ok = [], True
    for i, (nom, rows) in enumerate(LEVELS):
        L = parse(rows); good = len(L['goals']) == len(L['boxes']) and not (L['boxes'] & dead_squares(L))
        t = time.time(); sol = solve(L) if good else None; v = bool(sol) and replay(L, sol)
        pushes = None
        if v:
            bx, p, pushes = set(L['boxes']), L['player'], 0
            for c in sol:
                dx, dy = {'u': (0, -1), 'd': (0, 1), 'l': (-1, 0), 'r': (1, 0)}[c]; n = (p[0] + dx, p[1] + dy)
                if n in bx: bx.remove(n); bx.add((n[0] + dx, n[1] + dy)); pushes += 1
                p = n
        ok &= v
        print('%2d %-24s %d caisses  %s  %s' % (i + 1, nom, len(L['boxes']), 'RÉSOLUBLE' if v else 'ÉCHEC', '%d poussées, %d déplacements, %.1f s' % (pushes, len(sol), time.time() - t) if v else ''), flush=True)
        out.append(dict(n=i + 1, nom=nom, sol=sol, poussees=pushes, deplacements=len(sol) if sol else None))
    if ok:
        old = {}
        try: old = {d['n']: d for d in json.load(open(os.path.join(D, 'boxes_solutions.json'), encoding='utf8'))}
        except Exception: pass
        # on garde la solution la plus courte connue pour chaque niveau
        for d in out:
            o = old.get(d['n'])
            if o and o.get('sol') and o['nom'] == d['nom'] and replay(parse(LEVELS[d['n'] - 1][1]), o['sol']) and o['poussees'] <= d['poussees']: d.update(o)
        json.dump(out, open(os.path.join(D, 'boxes_solutions.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    print('30/30 niveaux résolubles' if ok else 'CERTAINS NIVEAUX NE SONT PAS RÉSOLUBLES'); sys.exit(0 if ok else 1)
