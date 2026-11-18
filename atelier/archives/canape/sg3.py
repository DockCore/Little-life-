import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage.morphology import convex_hull_image
from seg import im,COLS,ROWS,hsv
def cls(c,fem):
    h,s,v=hsv(c);r,g,b=c[...,0],c[...,1],c[...,2]
    hairc=(h>8)&(h<34)&(s>.42)&(v>.22)&(v<.8)
    hl,hn=nd.label(hairc,np.ones((3,3)));hs=nd.sum(hairc,hl,range(1,hn+1));hair=hl==(1+int(np.argmax(hs)))
    hair=nd.binary_closing(hair,iterations=1)&hairc|hair
    skin=(h>4)&(h<36)&(s>.3)&(s<.66)&(v>.66)
    white=(s<.1)&(v>.78)
    grey=(s<.12)&(v>.4)&(v<.8);nearPlaid=nd.uniform_filter(grey.astype(float),9)>.3;white&=~nearPlaid
    pants=(v<.36)&(b-r<18)&(s<.26)
    jeans=((h>190)&(h<240)&(s>.15)&(v>.38)&(v<.95)) if fem else np.zeros_like(hair)
    return dict(h=h,s=s,v=v,hair=hair,hairc=hairc,skin=skin,white=white,pants=pants,jeans=jeans,r=r,b=b)
def cut(c,fem):
    K=cls(c,fem);hair=K['hair']
    core=hair|K['skin']|K['white']|K['jeans']
    ys,xs=np.where(hair);hx=xs.mean();ht=ys.min()
    l,n=nd.label(core,np.ones((3,3)));keep=np.zeros_like(core)
    for i in range(1,n+1):
        cc=l==i;sz=cc.sum()
        if sz<10:continue
        yy,xx=np.where(cc)
        dx=xx.mean()-hx
        if -30<dx<115 and yy.min()>ht-5:keep|=cc
    core=keep|hair
    hull=convex_hull_image(core)
    hullp=nd.binary_dilation(hull,iterations=2)
    P=K['pants']&hullp
    wl,wn=nd.label(K['white']&core,np.ones((3,3)))
    if wn:
        bots=[np.where(wl==i)[0].max() for i in range(1,wn+1)];lo=int(np.argmax(bots))+1;sy=np.where(wl==lo)[0].min()
        yy=np.arange(P.shape[0])[:,None];P&=~((yy>sy)&~nd.binary_dilation(wl==lo,iterations=2))
    m=core|P|(K['hairc']&hull)
    m=nd.binary_opening(m,np.ones((2,2)))|core
    dark=(K['v']<.45)
    m|=dark&nd.binary_dilation(m,iterations=1)&hullp
    hol=nd.binary_fill_holes(m)&~m;hl2,hn2=nd.label(hol);hs=nd.sum(hol,hl2,range(1,hn2+1));m|=np.isin(hl2,1+np.where(hs<80)[0])
    l,n=nd.label(m,np.ones((3,3)));sz=nd.sum(m,l,range(1,n+1));m=np.isin(l,1+np.where(sz>=30)[0])
    return m,K
if __name__=='__main__':
    rows=[];M={}
    for rk,(y0,y1) in ROWS.items():
        row=[]
        for ci,(x0,x1) in enumerate(COLS):
            c=im[y0:y1,x0:x1];m,_=cut(c,rk[0]=='F');M[f'{rk}{ci}']=m
            o=np.zeros(c.shape,np.uint8);o[...]=[255,0,255];o[m]=c[m];row.append(o)
        rows.append(np.concatenate(row,1))
    Image.fromarray(np.concatenate(rows,0)).save('sg3.png');np.save('masks.npy',M,allow_pickle=True)
