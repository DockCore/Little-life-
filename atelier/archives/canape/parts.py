import json,base64,io,numpy as np
from PIL import Image
from scipy import ndimage as nd
d=json.load(open('cs.json'))
def img(u):return np.array(Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA'))
def png(a):b=io.BytesIO();Image.fromarray(a).save(b,'PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def geod(mask,seed):
    D=np.full(mask.shape,-1);from collections import deque;q=deque()
    for y,x in zip(*np.where(seed&mask)):D[y,x]=0;q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<mask.shape[0] and 0<=xx<mask.shape[1] and mask[yy,xx] and D[yy,xx]<0:D[yy,xx]=D[y,x]+1;q.append((yy,xx))
    return D
SPF={}
for k in d['SPA']:
    a=img(d['SPA'][k]);L=np.round(img(d['SPL'][k])[...,0]/40).astype(int);al=a[...,3]>0
    lum=(.3*a[...,0]+.59*a[...,1]+.11*a[...,2])/255
    P=np.zeros(L.shape,int);B=np.zeros(L.shape,int);T=np.ones(L.shape,int)
    hair=L==2;skin=L==1
    sl,sn=nd.label(skin);head=hair.copy()
    near=nd.binary_dilation(hair,iterations=2)
    for i in range(1,sn+1):
        c=sl==i
        if (c&near).any() and c.sum()>20: head|=c
    # le plus gros morceau de peau proche des cheveux = visage ; le reste = bras
    P[head]=1
    top=L==3;ty=np.where(top)[0]
    if len(ty):
        mid=np.median(ty);P[top&(np.arange(128)[:,None]<=mid)]=4;P[top&(np.arange(128)[:,None]>mid)]=5
    P[L==6]=6
    arms=skin&~head
    if arms.any():
        Dg=geod(arms,nd.binary_dilation(top,iterations=1))
        P[arms]=8
        for i in range(1,nd.label(arms)[1]+1):
            c=(nd.label(arms)[0]==i)
            m=Dg[c].max() if (Dg[c]>=0).any() else 0
            hand=c&(Dg>=max(1,m*.72))
            P[hand]=9
    legs=L==4
    if legs.any():
        Dl=geod(legs,nd.binary_dilation(L==6,iterations=1))
        m=Dl.max() if Dl.max()>0 else 1
        P[legs&(Dl<m*.5)]=10;P[legs&(Dl>=m*.5)]=11;P[legs&(Dl<0)]=11
    P[L==5]=12
    # ligne médiane du torse (boutons, fermetures) : 3 px au centre de chaque rangée du haut
    for y in np.unique(ty):
        xs=np.where(top[y])[0]
        if len(xs)>=6:
            c=int(round(xs.mean()))
            for x in (c-1,c,c+1):
                if top[y,x]:B[y,x]|=1
    # chevilles (montantes) : 2 rangées au-dessus des chaussures
    sh=nd.binary_dilation(L==5,np.ones((5,1)))&legs;B[sh]|=2
    # tons : 3 niveaux par zone
    for z in range(1,13):
        m=(P==z)&al
        if m.sum()<3:continue
        q1,q2=np.quantile(lum[m],[.33,.66]);T[m&(lum<q1)]=0;T[m&(lum>=q2)]=2
    out=np.zeros((128,80,4),np.uint8);out[...,0]=np.clip(P*16,0,255);out[...,1]=np.clip(T*80,0,255);out[...,2]=np.clip(B*16,0,255);out[...,3]=np.where(al,255,0)
    SPF[k]=png(out)
json.dump(SPF,open('cs_spf.json','w'))
print(len(SPF))
