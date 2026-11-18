import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import numpy as np
from PIL import Image
from collections import deque
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
OUT=np.array([0x14,0x0E,0x1C]);L=np.array([0xF7,0xF5,0xF0]);B=np.array([0xE6,0xE2,0xDA]);S=np.array([0xCB,0xC5,0xBB]);F=np.array([0xA5,0x9E,0x94])
def load(k,flip):
    a=img(SPA[k]).astype(int);f=img(SPF[k]).astype(int)
    if flip:a=a[:,::-1].copy();f=f[:,::-1].copy()
    P=np.round(f[...,0]/16).astype(int);T=np.round(f[...,1]/80).astype(int)
    return a,P,T
def armcut(P,frac):
    # geodesic distance in part 7 from pixels touching shoulders/torso
    H,W=P.shape;d=-np.ones((H,W),int);q=deque()
    for y in range(H):
        for x in range(W):
            if P[y,x]==7 and any(P[y+dy,x+dx] in(3,4) for dy,dx in((0,1),(0,-1),(1,0),(-1,0))):d[y,x]=0;q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
            Y,X=y+dy,x+dx
            if P[Y,X]==7 and d[Y,X]<0:d[Y,X]=d[y,x]+1;q.append((Y,X))
    # per connected arm, keep the near frac
    keep=np.zeros_like(P,bool);seen=np.zeros_like(P,bool)
    for y in range(H):
        for x in range(W):
            if P[y,x]==7 and not seen[y,x]:
                comp=[];q=deque([(y,x)]);seen[y,x]=1
                while q:
                    cy,cx=q.popleft();comp.append((cy,cx))
                    for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
                        Y,X=cy+dy,cx+dx
                        if P[Y,X]==7 and not seen[Y,X]:seen[Y,X]=1;q.append((Y,X))
                y0=min(c[0] for c in comp);y1=max(c[0] for c in comp);lim=y0+round((y1-y0)*frac)
                for c in comp:
                    if c[0]<=lim:keep[c]=1
    return keep
N4=((0,1),(0,-1),(1,0),(-1,0))
def tee(k,flip=False,frac=.55,collar_dip=0,folds=(),hip=2,back_cut=None,toff=0):
    a,P,T=load(k,flip);H,W=P.shape;op=a[...,3]>0
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2]
    m=np.isin(P,(3,4,5))&op
    m|=armcut(P,frac)&op
    ys,xs=np.where(P==6);top=ys.min()
    m|=(P==6)&op&(np.arange(H)[:,None]<=top+hip)
    if back_cut:
        yc,xl,xr=back_cut
        m[yc:,:xl]=False;m[yc:,xr+1:]=False
    ys,xs=np.where(P==2);bot=ys.max()
    nb=(P==2)&op&(np.arange(H)[:,None]==bot)
    if collar_dip:
        cx=int(round(xs[ys==bot].mean()))
        nb[bot,cx-collar_dip:cx+collar_dip]=False
    m|=nb
    out=np.zeros((H,W,4),np.uint8)
    for y in range(H):
        for x in range(W):
            if not m[y,x]:continue
            nbrs=[(y+dy,x+dx) for dy,dx in N4]
            edge=any(not m[n] for n in nbrs)
            g=lambda p:1 if p in(7,8,9) else 0
            seam=lum[y,x]<56 and len({g(P[n]) for n in nbrs if op[n]})>1
            if edge or seam:c=OUT
            elif lum[y,x]<56:c=F
            else:
                t=max(0,T[y,x]-toff);c=(L,B,S)[min(t,2)]
                near=any((not m[n]) and op[n] and lum[n]>=56 for n in [(y+dy*2,x+dx*2) for dy,dx in N4]+nbrs)
                if near and t==0:c=B
            out[y,x,:3]=c;out[y,x,3]=255
    for (x,y,c) in folds:
        if flip:x=W-1-x
        if out[y,x,3]:out[y,x,:3]=c
    return out,a
def comp(base,layer):
    r=base.copy();m=layer[...,3]>0;r[m]=layer[m];return r
