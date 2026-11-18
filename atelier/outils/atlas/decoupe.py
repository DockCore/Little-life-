import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Découpe anatomique d'une image à partir de son squelette (atelier/atlas/squelettes/<image>.json).
# La carte s'adapte au sprite : chaque pixel opaque reçoit une partie, rien n'est ajouté hors de la silhouette.
# Principe : chaque os du squelette « pousse » à l'intérieur du sprite (distance géodésique) ; les contours sombres
# dessinés arrêtent la propagation, ce qui respecte les superpositions (bras devant le torse, jambes croisées).
exec(open(A+'/atlas/commun.py').read())
import json,heapq
SPL=grab('const SPL={');SPL.update(grab('Object.assign(SPL,{'))
SQ=A+'/../atlas/squelettes'
PARTIES[14]='cheveux sous la mâchoire';COUL[14]=(255,255,255)
def zones(k):
    im=img(SPL[k]);z=np.round(im[...,0]/40).astype(int)
    if im.shape[-1]==4:z[im[...,3]==0]=0
    return z
def charger(k):
    return json.load(open(SQ+'/%s.json'%k,encoding='utf-8'))
# os : (point de départ, point d'arrivée, partie, côté) ; côté 0 = centre, 1 = gauche du personnage, 2 = droite du personnage
def os_du_squelette(p):
    O=[];g=lambda n:p.get(n)
    def add(a,b,part,side=0):
        if g(a) and g(b):O.append((g(a),g(b),part,side))
    add('sommet','menton',1);add('menton','cou_bas',2)
    for s,sd in(('g',1),('d',2)):
        add('cou_bas','epaule_'+s,3,0)
        add('epaule_'+s,'coude_'+s,7,sd);add('coude_'+s,'poignet_'+s,8,sd);add('poignet_'+s,'main_'+s,9,sd)
        add('bassin','hanche_'+s,6,0);add('hanche_'+s,'genou_'+s,10,sd);add('genou_'+s,'cheville_'+s,11,sd);add('cheville_'+s,'orteils_'+s,12,sd)
    add('cou_bas','poitrine_bas',4);add('poitrine_bas','taille',5);add('taille','bassin',6)
    return O
def trait(a,b):
    (x0,y0),(x1,y1)=a,b;n=max(abs(x1-x0),abs(y1-y0),1)
    return [(int(round(y0+(y1-y0)*t/n)),int(round(x0+(x1-x0)*t/n))) for t in range(n+1)]
def sous_machoire(p,H=128,W=80):
    # vrai pour les pixels situés sous la ligne de la mâchoire (polyligne machoire_g -> menton -> machoire_d, prolongée à plat)
    pts=[p[n] for n in('machoire_g','menton','machoire_d') if p.get(n)]
    pts=sorted(pts,key=lambda q:q[0])
    ys=np.zeros(W)
    for x in range(W):
        if x<=pts[0][0]:ys[x]=pts[0][1]
        elif x>=pts[-1][0]:ys[x]=pts[-1][1]
        else:
            for (xa,ya),(xb,yb) in zip(pts,pts[1:]):
                if xa<=x<=xb:ys[x]=ya+(yb-ya)*(x-xa)/max(1,xb-xa);break
    return np.arange(H)[:,None]>ys[None,:]
def decouper(k,p=None):
    p=p or charger(k)['points'];S=charger(k)
    a=sprite(k).astype(int);op=a[...,3]>0;H,W=op.shape;z=zones(k)
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];dark=op&(lum<S.get('seuil_contour',60))
    obj=np.zeros_like(op)
    for (x0,y0,x1,y1) in S.get('objets',[]):
        box=np.zeros_like(op);box[y0:y1+1,x0:x1+1]=1
        R_,G2,B2=a[...,0],a[...,1],a[...,2]
        skinh=(R_-B2>35)&(R_>=G2)&(G2>=B2)
        obj|=box&op&(z!=1)&(z!=2)&~skinh
    for (x,y) in S.get('objet_pixels',[]):obj[y,x]=op[y,x]
    for (x0,y0,x1,y1) in S.get('objets_tout',[]):obj[y0:y1+1,x0:x1+1]|=op[y0:y1+1,x0:x1+1]
    if S.get('objets_couleur'):
        R,G_,B_=a[...,0],a[...,1],a[...,2]
        col=op&(z!=1)&(z!=2)&~dark&~((R>170)&(G_>170)&(B_>160))&~((R.astype(int)-B_.astype(int)>35)&(R>=G_)&(G_>=B_))
        x0,y0,x1,y1=S['objets_couleur'];zone=np.zeros_like(op);zone[y0:y1+1,x0:x1+1]=1
        col&=zone
        sk=op&((z==1)|(z==2))
        near=np.zeros_like(op)
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):near|=np.roll(np.roll(sk,dy,0),dx,1)
        obj|=col
        for it in range(3):
            g=np.zeros_like(op)
            for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):g|=np.roll(np.roll(obj,dy,0),dx,1)
            obj|=g&op&(lum<35)&zone&~near
    for (x0,y0,x1,y1) in S.get('pas_objet',[]):obj[y0:y1+1,x0:x1+1]=0
    O=os_du_squelette(p)
    lab=np.zeros((H,W),int);side=np.zeros((H,W),int);dist=np.full((H,W),1e9);q=[]
    below=sous_machoire(p,H,W) if p.get('menton') else np.zeros((H,W),bool)
    for i,(pa,pb,part,sd) in enumerate(O):
        pts_=trait(pa,pb)
        prof=(p.get('epaule_g') is None or p.get('epaule_d') is None or abs(p['epaule_g'][0]-p['epaule_d'][0])<12)
        if part==7 and prof and not S.get('bras_complet'):pts_=pts_[int(len(pts_)*0.4):]
        if part==10:pts_=pts_[int(len(pts_)*0.3):]
        if part==3:pts_=pts_[:max(1,int(len(pts_)*0.6))]
        for (y,x) in pts_:
            if 0<=y<H and 0<=x<W and op[y,x] and not obj[y,x]:
                if dist[y,x]>0:dist[y,x]=0;lab[y,x]=part;side[y,x]=sd;heapq.heappush(q,(0.,y,x))
    N8=[(-1,0,1),(1,0,1),(0,-1,1),(0,1,1)]
    while q:
        d,y,x=heapq.heappop(q)
        if d>dist[y,x]:continue
        if dark[y,x] and d>0:continue          # un contour reçoit une partie mais ne la transmet pas
        for dy,dx,c in N8:
            Y,X=y+dy,x+dx
            if not(0<=Y<H and 0<=X<W) or not op[Y,X] or obj[Y,X]:continue
            nd=d+c
            if nd<dist[Y,X]:dist[Y,X]=nd;lab[Y,X]=lab[y,x];side[Y,X]=side[y,x];heapq.heappush(q,(nd,Y,X))
    if S.get('haut_torse'):
        armsk=op&(z==1)&np.isin(lab,(7,8,9))
        near=np.zeros_like(op);m=armsk.copy()
        for it in range(2):
            g=m.copy()
            for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):g|=np.roll(np.roll(m,dy,0),dx,1)
            m=g
        sh=op&(z==3)&np.isin(lab,(7,8,9))&~m
        lab[sh]=4;side[sh]=0
        from scipy.ndimage import label as _l
        sl,ns=_l(op&(z==5),np.ones((3,3)))
        for i in range(1,ns+1):
            m=sl==i;ys,xs=np.where(m);cy,cx=ys.mean(),xs.mean();best=None
            for s,sd in(('g',1),('d',2)):
                q=p.get('orteils_'+s)
                if q:
                    dd=(q[0]-cx)**2+(q[1]-cy)**2
                    if best is None or dd<best[0]:best=(dd,sd)
            if best:lab[m]=12;side[m]=best[1]
    # torse : découpé en bandes le long de la colonne (cou_bas -> bassin) aux hauteurs des repères
    if p.get('cou_bas') and p.get('bassin'):
        c0=np.array(p['cou_bas'],float);u=np.array(p['bassin'],float)-c0;L=np.linalg.norm(u)
        if L>0:
            u/=L;proj=lambda q:float((np.array(q,float)-c0)@u)
            eps=[p[n] for n in('epaule_g','epaule_d') if p.get(n)]
            s_sh=(np.mean([proj(q) for q in eps]) if eps else 3)+.5
            s_ch=proj(p['poitrine_bas']) if p.get('poitrine_bas') else L*.45
            s_be=proj(p['taille']) if p.get('taille') else L*.7
            tr=np.isin(lab,(3,4,5,6))&(side==0)
            for y,x in zip(*np.where(tr)):
                s=(x-c0[0])*u[0]+(y-c0[1])*u[1]
                lab[y,x]=3 if s<=s_sh else 4 if s<=s_ch else 5 if s<=s_be else 6
    # tête : jamais sous la mâchoire ; cheveux au-dessus de la mâchoire = tête ; cheveux sous la mâchoire = classe 14
    hair=op&(z==2)
    if S.get('cheveux_zone'):
        x0,y0,x1,y1=S['cheveux_zone'];hb=np.zeros_like(op);hb[y0:y1+1,x0:x1+1]=1
        hair&=(hb|~sous_machoire(p,H,W)) if p.get('menton') else hb
    lab[(lab==1)&below]=2
    lab[hair&~below&(lab!=9)&(lab!=8)]=1
    chin_y=p['menton'][1] if p.get('menton') else 0
    deep=below&(np.arange(H)[:,None]>chin_y+2)
    lab[hair&below&~deep&~np.isin(lab,(8,9))]=1
    lab[hair&deep&~np.isin(lab,(8,9))]=14
    if p.get('taille'):
        ty=p['taille'][1];Y=np.arange(H)[:,None]
        light=op&~dark&(z==0)&(Y>=ty)&np.isin(lab,(4,5,10))&~obj
        if p.get('genou_g') or p.get('genou_d'):
            ky=min(q[1] for q in(p.get('genou_g'),p.get('genou_d')) if q);light&=Y<ky
        hx=[p[n][0] for n in('hanche_g','hanche_d','bassin') if p.get(n)]
        if hx:
            X=np.arange(W)[None,:];light&=(X>=min(hx)-6)&(X<=max(hx)+6)
        from scipy.ndimage import label as _l
        ll,nl=_l(light,np.ones((3,3)))
        for i in range(1,nl+1):
            if (ll==i).sum()>=15:lab[ll==i]=6
    lab[obj]=13
    # pixels encore sans partie (isolés derrière un contour) : partie voisine majoritaire
    for it in range(6):
        miss=op&(lab==0)
        if not miss.any():break
        for y,x in zip(*np.where(miss)):
            v=[lab[y+dy,x+dx] for dy in(-1,0,1) for dx in(-1,0,1) if 0<=y+dy<H and 0<=x+dx<W and lab[y+dy,x+dx]]
            if v:lab[y,x]=max(set(v),key=v.count)
    return lab,side,obj
