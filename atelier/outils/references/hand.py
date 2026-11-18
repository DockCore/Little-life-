import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import numpy as np
exec(open(A+'/references/tee.py').read())
C={'#':OUT,'.':L,'o':B,'s':S,'f':F}
def R(a,b):return list(range(a,b+1))
def build(segs,outl=(),hem=(),fold=(),shade=(),light=(),fill=(),clip=None):
    H,W=128,80;m=np.zeros((H,W),bool);o=np.zeros((H,W),bool)
    for y,ss in segs.items():
        for a,b in ss:
            m[y,a:b+1]=1;o[y,a]=o[y,b]=1
    for y,xs in outl:
        for x in xs:m[y,x]=1;o[y,x]=1
    for y,xs in hem:
        for x in xs:m[y,x]=1;o[y,x]=1
    if clip is not None:
        m&=clip;o&=clip
        for y in range(H):
            for x in range(1,W-1):
                if m[y,x] and (not m[y,x-1] or not m[y,x+1]):o[y,x]=1
    # top & bottom border rows of the mask are outlines
    for y in range(H):
        for x in range(W):
            if m[y,x] and (not m[y-1,x] or not m[y+1,x]):o[y,x]=1
    for y,xs in fill:
        for x in xs:o[y,x]=0
    out=np.zeros((H,W,4),np.uint8)
    for y in range(H):
        for x in range(W):
            if not m[y,x]:continue
            if o[y,x]:c='#'
            else:
                dl=next(i for i in range(1,80) if o[y,x-i] or not m[y,x-i])
                dr=next(i for i in range(1,80) if o[y,x+i] or not m[y,x+i])
                du=next(i for i in range(1,80) if o[y-i,x] or not m[y-i,x])
                dd=next(i for i in range(1,80) if o[y+i,x] or not m[y+i,x])
                if dr==1 or dd==1:c='s'
                elif dl==1 or dr==2 or du==1:c='o'
                else:c='.'
            out[y,x,:3]=C[c];out[y,x,3]=255
    for lst,c in((fold,'f'),(shade,'s'),(light,'.')):
        for y,xs in lst:
            for x in xs:
                assert out[y,x,3],(y,x);out[y,x,:3]=C[c]
    return out
def ascii(t,y0,y1,x0,x1):
    inv={tuple(v):k for k,v in C.items()}
    for y in range(y0,y1):print(y,''.join(inv[tuple(t[y,x,:3])] if t[y,x,3] else ' ' for x in range(x0,x1)))
