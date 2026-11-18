import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Construit l'atlas du corps des 108 images habillées, SANS toucher aux cartes du jeu (SPF) : lecture seule.
# Sorties : atelier/atlas/cartes/<image>.png (index de partie, palette lisible), atelier/atlas/premier_plan/<image>.png,
#           atelier/atlas/atlas.json (famille, repères, corrections appliquées, état du contrôle).
exec(open(A+'/atlas/commun.py').read())
import json
from collections import deque
from scipy.ndimage import label
N4=((0,1),(0,-1),(1,0),(-1,0))
SPL=grab('const SPL={');SPL.update(grab('Object.assign(SPL,{'))

def zones(k):
    im=img(SPL[k]);z=np.round(im[...,0]/40).astype(int)
    if im.shape[-1]==4:z[im[...,3]==0]=0
    return z
def base(k):return k[2:] if k.startswith('F_') else k
def famille(k):
    b=base(k)
    if b in('idle','wave','drink','v_front') or b[:2] in('wf','wc','cu'):return 'face'
    if b=='v_back' or b[:2] in('wb','dk'):return 'dos'
    if b=='v_q':return 'trois-quarts'
    if b[:2]=='cs':return 'canape-assis'
    if b[:2]=='cn':return 'canape-allonge'
    if b[:2]=='dn':return 'assis-table'
    return 'profil'
def activite(k):
    b=base(k);t={'idle':'debout','wave':'saluer','drink':'boire','w':'marche','r':'course','wf':'marche','wb':'marche','dn':'repas','wc':'bureau','dk':'bureau','cu':'halteres','bk':'velo','v_':'dressing','cs':'canape','cn':'canape-sieste'}
    for p in sorted(t,key=len,reverse=True):
        if b.startswith(p):return t[p]
    return '?'

# --- corrections par famille -------------------------------------------------------------------------------
# 1. face / dos : sous les aisselles, ce qui est hors de la bande du torse (bornée par les traits sombres) est du bras
def bras_hors_torse(P,a,F,fr,note):
    op=a[...,3]>0;lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];dark=op&(lum<56);H,W=P.shape
    tor=np.isin(P,(3,4,5));ys=np.where(tor)[0]
    if not len(ys):return P
    at=ys.min()
    mids=np.where(((F&1)>0)&tor);mx=int(round(mids[1].mean())) if len(mids[0]) else int(round(np.where(tor)[1].mean()))
    Q=P.copy();lo=hi=None;moved=0;BODY=(3,4,5,6)
    h6=np.where(P==6)[0];hip=h6.min() if len(h6) else H
    for y in range(at+2,H):
        row=[x for x in range(W) if P[y,x] in BODY or (P[y,x] in(7,8,9))]
        if not row:continue
        if y>hip+6:break
        if op[y,mx] and not dark[y,mx] and P[y,mx] in BODY:
            l=mx
            while l>0 and op[y,l-1] and not dark[y,l-1] and P[y,l-1] in BODY:l-=1
            r=mx
            while r<W-1 and op[y,r+1] and not dark[y,r+1] and P[y,r+1] in BODY:r+=1
            l-=1;r+=1
            outside=[x for x in row if x<l-1 or x>r+1]
            if not outside and lo is None:continue   # épaules : pas encore de bras séparé
            if lo is not None:l=max(min(l,lo+1),lo-1);r=min(max(r,hi-1),hi+1)
            lo,hi=l,r
        if lo is None:continue
        for x in range(W):
            if (x<lo or x>hi) and P[y,x] in BODY:Q[y,x]=9 if P[y,x]==6 else 7;moved+=1
    for side in(0,1):
        xs=np.arange(W)[None,:];sm=(xs<mx) if side==0 else (xs>mx)
        m=((Q==7)|(Q==8))&sm;yy=np.where(m)[0]
        if not len(yy):continue
        hand=np.where((Q==9)&sm)[0];y1=hand.min() if len(hand) else yy.max()
        elb=yy.min()+(y1-yy.min())*.5
        for y,x in zip(*np.where(m)):Q[y,x]=7 if y<=elb else 8
    if moved:note.append('bras étiquetés torse ou hanches à côté du torse : %d pixels rendus au bras et aux mains'%moved)
    return Q

# 2. avant-bras dessinés devant le torse (zones repérées à la main pendant le T-shirt)
FORE={'drink':[(95,42,91,99,37,48)],'F_drink':[(95,44,91,99,37,50)],'F_w3':[(98,48,96,101,40,57),(100,48,96,101,40,57)],**{'F_bk%d'%i:[(90,48,86,94,44,56)] for i in range(6)}}
def avant_bras_devant(k,P,a,FG,note):
    op=a[...,3]>0;lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];dark=op&(lum<56);n=0
    for (sy,sx,by0,by1,bx0,bx1) in FORE.get(k,[]):
        reg=set();q=deque([(sy,sx)])
        while q:
            p=q.popleft()
            if p in reg or not op[p] or dark[p] or not(by0<=p[0]<=by1 and bx0<=p[1]<=bx1):continue
            reg.add(p)
            for dy,dx in N4:q.append((p[0]+dy,p[1]+dx))
        for p in reg:
            if P[p] not in(9,):P[p]=8
            FG[p]=1;n+=1
    if n:note.append('avant-bras devant le torse : %d pixels (avant-bras, premier plan)'%n)
    return P

# 3. profil : sous les épaules, le torse ne dépasse pas la largeur des épaules ; au-delà c'est l'avant-bras tendu
def torse_profil(P,a,FG,note):
    tor=np.isin(P,(3,4,5));ys,xs=np.where(tor)
    if not len(ys):return P
    t0=ys.min();sel=(ys<t0+6);x0,x1=xs[sel].min()-1,xs[sel].max()+1;n=0
    for y,x in zip(ys,xs):
        if y>=t0+6 and (x<x0 or x>x1) and P[y,x] in(4,5):P[y,x]=8;FG[y,x]=1;n+=1
    if n:note.append('avant-bras étiquetés torse/ventre hors de la largeur des épaules : %d pixels'%n)
    return P

# 4. femme à table : carte d'origine inexploitable -> torse redessiné (contours validés pendant le T-shirt)
FP={0:dict(l=29,r1=44,r2=43,t=82,w=94,sl=(44,47,87,90)),1:dict(l=28,r1=44,r2=44,t=82,w=94,sl=(45,48,87,90)),2:dict(l=28,r1=44,r2=44,t=82,w=94),
    3:dict(l=28,r1=44,r2=44,t=82,w=94),4:dict(l=28,r1=45,r2=45,t=82,w=94),5:dict(l=28,r1=45,r2=44,t=82,w=94,sl=(45,48,86,89)),
    6:dict(l=28,r1=45,r2=44,t=82,w=94,ex=(36,46,78,90)),7:dict(l=28,r1=45,r2=44,t=82,w=94)}
def femme_table(k,P,a,FG,note):
    i=int(k[-1]);p=FP[i];z=zones(k);op=a[...,3]>0;Q=P.copy()
    white=(a[...,0]>200)&(a[...,1]>200)&(a[...,2]>190)
    hair=(z==2)&~white
    for y in range(p['t'],p['w']+1):
        r=p['r1'] if y<=88 else p['r2']
        for x in range(p['l'],r+1):
            if not op[y,x]:continue
            if hair[y,x] and y<=87:Q[y,x]=1;FG[y,x]=1;continue
            Q[y,x]=4 if y<=p['t']+5 else 5
    if 'sl' in p:
        x0,x1,y0,y1=p['sl']
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                if op[y,x] and not hair[y,x]:Q[y,x]=7
    if 'ex' in p:
        x0,x1,y0,y1=p['ex']
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                if op[y,x] and not white[y,x]:Q[y,x]=8;FG[y,x]=1
    # cheveux longs du dos : tête/cheveux
    Q[(z==2)&op&(Q!=1)&~np.isin(Q,(4,5,7,8))&(np.arange(128)[:,None]<=95)]=1
    face=(Q==9)&op&(np.arange(128)[:,None]<p['t'])&(np.arange(80)[None,:]<=44)
    if face.sum():Q[face]=1;note.append('visage étiqueté « mains » dans la carte du jeu : %d pixels rendus à la tête'%int(face.sum()))
    note.append('carte du jeu inexploitable : torse, manche et cheveux redessinés (contour validé avec le T-shirt)')
    return Q

# 5. canapé : planche dessinée à part ; les zones de couleur de l'artiste (peau, cheveux, haut, pantalon, chaussures) font foi
def canape(k,P,a,FG,note):
    z=zones(k);op=a[...,3]>0;Q=P.copy();n=0
    for y,x in zip(*np.where(op)):
        q=P[y,x];zz=z[y,x];new=q
        if zz==2:new=1
        elif zz==5:new=12
        elif zz==4 and q not in(10,11):new=10
        elif zz==3 and q in(0,1,2,9,10,11,12):new=4
        elif zz==3 and q==8:new=7
        if new!=q:Q[y,x]=new;n+=1
    # peau : le morceau le plus haut est le visage (et le cou) ; les autres morceaux sont les bras et les mains.
    # Les petits morceaux classés « cheveux » collés aux bras sont des contours de bras.
    skin=op&(z==1);lab,nl=label(skin);nb=0
    hl0,nh0=label(op&(z==2));bighair=(hl0==max(range(1,nh0+1),key=lambda i:(hl0==i).sum())) if nh0 else np.zeros_like(op)
    near=np.zeros_like(op)
    for dy,dx in N4:near|=np.roll(np.roll(bighair,dy,0),dx,1)
    if nl:
        head=max(range(1,nl+1),key=lambda i:((lab==i)&near).sum())
        for i in range(1,nl+1):
            m=lab==i
            if i==head:Q[m&~np.isin(Q,(2,))]=1
            else:sel=m&np.isin(Q,(0,1,2,3,4,5));Q[sel]=8;nb+=int(sel.sum())
    hl,nh=label(op&(z==2))
    if nh>1:
        big=max(range(1,nh+1),key=lambda i:(hl==i).sum())
        for i in range(1,nh+1):
            if i!=big and (hl==i).sum()<40:
                m=hl==i;Q[m]=8;nb+=int(m.sum())
    if nb:note.append('bras nus étiquetés tête ou torse : %d pixels rendus aux bras'%nb)
    if n:note.append('planche du canapé : %d pixels recalés sur les zones de couleur de l’artiste'%n)
    return Q

# --- repères anatomiques ---------------------------------------------------------------------------------------
def reperes(P,F,fr):
    R={};H,W=P.shape
    def cen(m):
        ys,xs=np.where(m);return [int(round(xs.mean())),int(round(ys.mean()))] if len(ys) else None
    def adj(a_,b_):
        m=np.zeros_like(P,bool)
        for dy,dx in N4:
            sh=np.roll(np.roll(P==b_,dy,0),dx,1);m|=(P==a_)&sh
        return m
    n2=np.where(P==2)
    if len(n2[0]):yb=n2[0].max();R['cou']=[int(round(n2[1][n2[0]==yb].mean())),int(yb)]
    t=np.where(np.isin(P,(3,4,5)))
    if len(t[0]):
        y0=t[0].min();row=t[1][t[0]<=y0+3];R['epaule_g']=[int(row.min()),int(y0+2)];R['epaule_d']=[int(row.max()),int(y0+2)]
    h6=np.where(P==6)
    if len(h6[0]):
        yt=h6[0].min();R['taille']=[int(round(h6[1][h6[0]==yt].mean())),int(yt)]
        rw=h6[1][h6[0]<=yt+2];R['hanche_g']=[int(rw.min()),int(yt+1)];R['hanche_d']=[int(rw.max()),int(yt+1)]
    for nom,(p1,p2) in {'coude':(7,8),'poignet':(8,9),'genou':(10,11),'cheville':(11,12)}.items():
        m=adj(p1,p2);lab,n=label(m,np.ones((3,3)))
        cs=sorted([cen(lab==i) for i in range(1,n+1) if (lab==i).sum()>=1],key=lambda c:c[0])
        if len(cs)>2:  # garder les deux plus grands groupes
            szs=sorted([((lab==i).sum(),i) for i in range(1,n+1)],reverse=True)[:2];cs=sorted([cen(lab==i) for _,i in szs],key=lambda c:c[0])
        for j,c in enumerate(cs[:2]):R['%s_%s'%(nom,'g' if j==0 else 'd') if len(cs)>1 else nom]=c
    return R

def construire(k):
    a=sprite(k);P,T,F=carte_jeu(k);fr=famille(k);note=[];FG=np.zeros(P.shape,np.uint8)
    b=base(k)
    if k.startswith('F_dn'):P=femme_table(k,P,a,FG,note)
    elif fr in('canape-assis','canape-allonge'):P=canape(k,P,a,FG,note)
    elif fr in('face','dos'):P=bras_hors_torse(P,a,F,fr,note)
    if fr=='profil' and k.startswith('F_') and b[:1] in('r','w'):P=torse_profil(P,a,FG,note)
    P=avant_bras_devant(k,P,a,FG,note)
    # accessoires tenus (tasse, verre, haltères) : opaques sans partie -> premier plan
    # contours sans partie : rattachés à la partie qu'ils bordent (un seul pixel d'épaisseur)
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];op=a[...,3]>0;Q=P.copy();nb=0
    for y,x in zip(*np.where(op&(P==0)&(lum<56))):
        v=[P[y+dy,x+dx] for dy in(-1,0,1) for dx in(-1,0,1) if (dy or dx) and 0<=y+dy<128 and 0<=x+dx<80 and P[y+dy,x+dx]]
        if v:Q[y,x]=max(set(v),key=v.count);nb+=1
    P=Q
    if nb:note.append('contours sans partie rattachés à la partie voisine : %d pixels'%nb)
    props=(a[...,3]>0)&(P==0)
    if props.sum():
        P[props]=13
        t=np.where(np.isin(P,(3,4,5)))
        if len(t[0]):
            y0,y1,x0,x1=t[0].min(),t[0].max(),t[1].min(),t[1].max()
            dev=props.copy();dev[:y0]=0;dev[y1+1:]=0;dev[:,:x0]=0;dev[:,x1+1:]=0
            if dev.sum()>=4:FG[dev]=1;note.append('objet tenu devant le torse : %d pixels au premier plan'%int(dev.sum()))
        note.append('pixels sans partie dans la carte du jeu : %d (classés « objet / non étiqueté »)'%int(props.sum()))
    zc=[]
    if b[:2]=='dn' and not k.startswith('F_'):zc.append('bras confondus avec le torse dans le dessin : un vêtement à manches longues demandera un dessin dédié')
    if k.startswith('F_dn'):zc.append('dessin grossier : torse redessiné ; manches longues, vestes et robes à dessiner image par image')
    if fr.startswith('canape'):zc.append('planche du canapé dessinée dans un autre style : contrôler chaque vêtement')
    if k in FORE or (fr=='profil' and k.startswith('F_') and b[:1] in('r','w')):zc.append('avant-bras devant le torse : vérifier que le vêtement passe derrière')
    if b[:2]=='bk':zc.append('vélo devant les jambes : les bas (pantalons, jupes) passent derrière le vélo')
    return P,FG,{'a_surveiller':zc,'famille':fr,'activite':activite(k),'genre':'femme' if k.startswith('F_') else 'homme','reperes':reperes(P,F,fr),'corrections':note,'controle':'à contrôler'}

if __name__=='__main__' or globals().get('LANCER'):
    D=A+'/../atlas';_o.makedirs(D+'/cartes',exist_ok=True);_o.makedirs(D+'/premier_plan',exist_ok=True)
    pal=[];[pal.extend(COUL[i]) for i in range(14)];pal+=[0]*(768-len(pal))
    out={}
    for k in IMAGES:
        P,FG,info=construire(k)
        im=Image.fromarray(P.astype(np.uint8),'P');im.putpalette(pal);im.save(D+'/cartes/%s.png'%k,transparency=0)
        Image.fromarray((FG*255).astype(np.uint8),'L').convert('1').save(D+'/premier_plan/%s.png'%k)
        out[k]=info
    old=D+'/atlas.json'
    if _o.path.exists(old):  # l'état du contrôle déjà enregistré n'est jamais écrasé
        prev=json.load(open(old))
        for k in out:
            if k in prev:out[k]['controle']=prev[k].get('controle',out[k]['controle']);out[k]['remarque']=prev[k].get('remarque','')
    json.dump(out,open(old,'w'),ensure_ascii=False,indent=1)
    print(len(out),'images ;',sum(1 for v in out.values() if v['corrections']),'avec corrections')
