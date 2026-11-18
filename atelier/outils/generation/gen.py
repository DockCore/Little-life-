import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import numpy as np
from collections import deque
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
OUT=np.array([0x14,0x0E,0x1C]);L=np.array([0xF7,0xF5,0xF0]);B=np.array([0xE6,0xE2,0xDA]);S=np.array([0xCB,0xC5,0xBB]);F=np.array([0xA5,0x9E,0x94])
N4=((0,1),(0,-1),(1,0),(-1,0))
FRONT=('idle','wave','drink','wf','wc','cu','v_front');BACK=('wb','dk','v_back');SIDE=('w','r','dn','bk','v_q','v_side')
def vtype(nm):
    b=nm[2:] if nm.startswith('F_') else nm
    for t,fam in(('front',FRONT),('back',BACK),('side',SIDE)):
        for p in fam:
            if b==p or (b.startswith(p) and b[len(p):].isdigit()):return t
    return None
def load(k,flip=False):
    a=img(SPA[k]).astype(int);f=img(SPF[k]).astype(int)
    if flip:a=a[:,::-1].copy();f=f[:,::-1].copy()
    P=np.round(f[...,0]/16).astype(int);Fl=np.round(f[...,2]/16).astype(int)
    P[a[...,3]==0]=0
    return a,P,Fl
def comps(m):
    H,W=m.shape;seen=np.zeros_like(m);out=[]
    for y in range(H):
        for x in range(W):
            if m[y,x] and not seen[y,x]:
                c=[];q=deque([(y,x)]);seen[y,x]=1
                while q:
                    cy,cx=q.popleft();c.append((cy,cx))
                    for dy,dx in N4:
                        Y,X=cy+dy,cx+dx
                        if 0<=Y<H and 0<=X<W and m[Y,X] and not seen[Y,X]:seen[Y,X]=1;q.append((Y,X))
                out.append(c)
    return out
FORE={'drink':[(95,42,91,99,37,48)],'F_drink':[(95,44,91,99,37,50)],'F_w3':[(98,48,96,101,40,57),(100,48,96,101,40,57)],**{'F_bk%d'%i:[(90,48,86,94,44,56)] for i in range(6)}}
def gen(nm,flip=False,afrac=.3,hip=2,dip=3,cf=.36,cb=.5,cs=.42):
    a,P,Fl=load(nm,flip);H,W=P.shape;op=a[...,3]>0
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];dark=op&(lum<56)
    vt=vtype(nm);Y=np.arange(H)[:,None]
    tor=np.isin(P,(3,4,5))
    m=tor.copy()
    # sleeves: geodesic distance along the arm (7,8) from its attachment, normalised per arm
    D=-np.ones((H,W));q=deque()
    seedset=(2,3) if vt=='side' else (2,3,4,5)
    for c in comps(np.isin(P,(7,8))):
        sd=[p for p in c if P[p]==7 and any(P[p[0]+dy,p[1]+dx] in seedset for dy,dx in N4)]
        if not sd:sd=[p for p in c if P[p]==7 and any(P[p[0]+dy,p[1]+dx] in(2,3,4,5) for dy,dx in N4)]
        for p in sd:D[p]=0;q.append(p)
    while q:
        y,x=q.popleft()
        for dy,dx in N4:
            yy,xx=y+dy,x+dx
            if P[yy,xx] in(7,8) and D[yy,xx]<0:D[yy,xx]=D[y,x]+1;q.append((yy,xx))
    _t=np.where(tor)[0];_hb=np.where(np.isin(P,(8,9)))[0]
    scut=(_t.min()+round(((_hb.max() if len(_hb) else _t.max()+10)-_t.min())*cs)) if vt=='side' and len(_t) else H
    for c in comps(np.isin(P,(7,8))):
        ds=[D[p] for p in c if D[p]>=0]
        if not ds:
            ys=[p[0] for p in c];lim=min(ys)+round((max(ys)-min(ys))*.3)
            for p in c:
                if p[0]<=lim and P[p]==7:m[p]=1
            continue
        mx_=max(ds)
        for p in c:
            if D[p]>=0 and D[p]<=mx_*afrac and p[0]<=scut:m[p]=1
    h6=np.where(P==6)
    if len(h6[0]):
        top=h6[0].min();m|=(P==6)&(Y<=top+hip)
    else: top=H
    n2=np.where(P==2)[0]
    if len(n2) and vt=='side':
        nb=n2.max();ncx=np.where(P==2)[1].mean()
        m&=~((P==2)&(Y<nb))
        xx=np.arange(W)[None,:]
        m&=~((Y<nb)&(xx>ncx))
        h1=np.where(P==1)[0]
        if len(h1):m[:h1.max()+1]=0
    elif len(n2) and vt=='back':m[:n2.max()]=0
    elif len(n2):m[:n2.max()+1]=0
    if vt in('front','back'):
        ys=np.where(tor)[0];at=ys.min()
        hb=np.where(np.isin(P,(8,9)))[0];hb=hb.max() if len(hb) else np.where(op)[0].max()-20
        cut=at+round((hb-at)*(cf if vt=='front' else cb))
        mids=np.where(((Fl&1)>0)&tor);mx=int(round(mids[1].mean())) if len(mids[0]) else int(round(np.where(tor)[1].mean()))
        lo,hi=None,None
        for y in range(cut+1,H):
            if not m[y].any():continue
            if not dark[y,mx] and m[y,mx]:
                l=mx
                while l>0 and m[y,l-1] and not dark[y,l-1]:l-=1
                r=mx
                while r<W-1 and m[y,r+1] and not dark[y,r+1]:r+=1
                l-=1;r+=1
                if lo is not None:l=max(min(l,lo+1),lo-1);r=min(max(r,hi-1),hi+1)
                lo,hi=l,r
            if lo is None:continue
            m[y,:lo]=0;m[y,hi+1:]=0
            if y<=top+hip:m[y,lo:hi+1]|=op[y,lo:hi+1]&~np.isin(P[y,lo:hi+1],(1,8,9,10,11,12))
    if vt=='side' and m.any():
        # clean silhouette: the torso is filled from its back edge to its front edge on every row down to the hem
        tp=np.isin(P,(3,4,5))|((P==6)&(Y<=top+hip))
        rows=[y for y in range(H) if tp[y].any() and y<=top+hip]
        if rows:
            eL={y:np.where(tp[y])[0].min() for y in rows};eR={y:np.where(tp[y])[0].max() for y in rows}
            fg=np.isin(P,(1,8,9,10,11,12))|((P==7)&~m)
            for y in rows:
                win=[yy for yy in range(y-2,y+3) if yy in eL]
                l=int(np.median([eL[yy] for yy in win]));r=int(np.median([eR[yy] for yy in win]))
                for x in range(l,r+1):
                    if op[y,x] and not fg[y,x]:m[y,x]=1
        t0=np.where(m.any(1))[0].min();ys,xs=np.where(m[t0:t0+6])
        x0,x1=xs.min()-1,xs.max()+1
        m[t0+6:,:max(0,x0)]=0;m[t0+6:,x1+1:]=0
    m&=op
    # forearms drawn across the torso stay in front: flood the inside of their outline and leave it uncovered
    for (sy,sx,by0,by1,bx0,bx1) in FORE.get(nm,[]):
        if flip:sx,bx0,bx1=W-1-sx,W-1-bx1,W-1-bx0
        reg=set();q=deque([(sy,sx)])
        while q:
            p=q.popleft()
            if p in reg or not op[p] or dark[p] or not(by0<=p[0]<=by1 and bx0<=p[1]<=bx1):continue
            reg.add(p)
            for dy,dx in N4:q.append((p[0]+dy,p[1]+dx))
        for p in reg:m[p]=0
    o=np.zeros_like(m)
    for y in range(1,H-1):
        for x in range(1,W-1):
            if not m[y,x]:continue
            for dy,dx in N4:
                n=(y+dy,x+dx)
                if not m[n] and not dark[n]:o[y,x]=1
            if dark[y,x] and (not op[y-1,x] or not op[y+1,x] or not op[y,x-1] or not op[y,x+1]):o[y,x]=1
    # collar dip on the front
    if vt=='front':
        mids=np.where((Fl&1)>0&m) if False else None
        ys=np.where(m)[0];t0=ys.min()
        cols=np.where(tor[t0+1])[0];mx=(cols.min()+cols.max())/2
        for x in range(int(round(mx-dip-.5)),int(round(mx+dip+.5))+1):
            if m[t0,x]:m[t0,x]=0;o[t0,x]=0
            if m[t0+1,x]:o[t0+1,x]=1
        for x in range(W):
            if m[t0,x]:o[t0,x]=1
    out=np.zeros((H,W,4),np.uint8)
    def dist(y,x,dy,dx):
        i=1
        while True:
            Y,X=y+dy*i,x+dx*i
            if not m[Y,X] or o[Y,X]:return i
            i+=1
    for y in range(H):
        for x in range(W):
            if not m[y,x]:continue
            if o[y,x]:c=OUT
            elif dark[y,x] and sum(1 for dy in(-1,0,1) for dx in(-1,0,1) if (dy or dx) and m[y+dy,x+dx] and dark[y+dy,x+dx])<=2:c=F
            else:
                dl,dr,du,dd=dist(y,x,0,-1),dist(y,x,0,1),dist(y,x,-1,0),dist(y,x,1,0)
                if dr==1 or dd==1:c=S
                elif dl==1 or dr==2 or du==1:c=B
                else:c=L
            out[y,x,:3]=c;out[y,x,3]=255
    return out,a
def comp(base,layer):
    r=base.copy();k=layer[...,3]>0;r[k]=layer[k];return r
