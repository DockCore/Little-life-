import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/fdn.py').read())
exec(open(A+'/generation/gen.py').read().split("def vtype")[0])  # palette
from scipy.ndimage import label
def cls(k):
    a=img(SPA[k]).astype(int);z=Z(k);H,W=128,80
    C=np.full((H,W),' ')
    for y in range(H):
        for x in range(W):C[y,x]=ch(a,z,y,x)
    return a,C
def shade(m,o,H=128,W=80):
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
            else:
                dl,dr,du,dd=dist(y,x,0,-1),dist(y,x,0,1),dist(y,x,-1,0),dist(y,x,1,0)
                c=S if (dr==1 or dd==1) else B if (dl==1 or dr==2 or du==1) else L
            out[y,x,:3]=c;out[y,x,3]=255
    return out
def fdn(k,waist_add=8,dbg=False):
    a,C=cls(k);H,W=C.shape
    wm=np.isin(C,['w','b']);wm[:76]=0;wm[92:]=0
    lab,n=label(wm);sz=[(lab==i).sum() for i in range(1,n+1)];wc=lab==(1+int(np.argmax(sz)))
    ys,xs=np.where(wc);top,wb=ys.min(),ys.max();cx=int(round(xs.mean()))
    waist=wb+waist_add
    m=np.zeros((H,W),bool);prev=None
    for y in range(top,waist+1):
        stop=lambda x:C[y,x] in('#',' ','h')
        if stop(y and cx):pass
        if not stop(cx):
            l=cx
            while not stop(l-1):l-=1
            r=cx
            while not stop(r+1):r+=1
            if prev:
                pl,pr=prev
                if y>wb+1 and r-l>(pr-pl)+4:r=min(r,pr+1);l=max(l,pl-1)
            prev=(l,r)
        elif prev:l,r=prev
        else:continue
        for x in range(l,r+1):
            if C[y,x] not in(' ','h'):m[y,x]=1
    m|=wc
    op=a[...,3]>0;dark=C=='#'
    o=np.zeros_like(m)
    for y in range(1,H-1):
        for x in range(1,W-1):
            if not m[y,x]:continue
            for dy,dx in N4:
                n_=(y+dy,x+dx)
                if not m[n_] and not dark[n_]:o[y,x]=1
            if dark[y,x] and any(not op[y+dy,x+dx] for dy,dx in N4):o[y,x]=1
    t=shade(m,o)
    # interior dark pixels inside the shirt: soft fold, never a hole
    for y in range(H):
        for x in range(W):
            if m[y,x] and not o[y,x] and dark[y,x]:t[y,x,:3]=F
    return t,a
