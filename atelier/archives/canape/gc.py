import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd
from seg import im,COLS,ROWS,hsv
def seeds(c,fem):
    h,s,v=hsv(c);r,g,b=c[...,0],c[...,1],c[...,2]
    hairc=(h>8)&(h<34)&(s>.42)&(v>.22)&(v<.78)
    hl,hn=nd.label(hairc,np.ones((3,3)));hs=nd.sum(hairc,hl,range(1,hn+1))
    hair=hl==(1+int(np.argmax(hs)))
    small=np.isin(hl,1+np.where(hs<160)[0])&~hair
    skin=(h>8)&(h<36)&(s>.3)&(s<.62)&(v>.72)
    white=(s<.07)&(v>.88)
    grey=(s<.12)&(v>.4)&(v<.8)
    nearPlaid=nd.uniform_filter(grey.astype(float),9)>.3
    white&=~nearPlaid
    pants=(v<.34)&(b-r<16)&(s<.24)&(v>.08)
    pants=nd.binary_opening(pants,np.ones((3,3)))
    jeans=((h>195)&(h<235)&(s>.2)&(v>.42)&(v<.92))&(b-r<70) if fem else np.zeros_like(hair)
    cream=(h>8)&(h<42)&(s>.1)&(s<.27)&(v>.87)
    pillow=(h>28)&(h<52)&(s>.5)&(v>.75)
    bgc=(b-r>18)&(v<.5)
    from skimage.morphology import convex_hull_image
    core=hair|skin|white|jeans
    big0=nd.binary_dilation(core,iterations=3);lab0,_=nd.label(big0,np.ones((3,3)));core&=np.isin(lab0,np.unique(lab0[hair]))
    hull=convex_hull_image(core)
    pants&=hull
    fg=core|pants
    bg=cream|pillow|bgc|small|(grey&nearPlaid)
    # FG : seulement ce qui touche le personnage (proche de la chevelure) — on part de la tête et on s'étend
    big=nd.binary_dilation(fg,iterations=3);lab,n=nd.label(big,np.ones((3,3)))
    keep=np.isin(lab,np.unique(lab[hair]));fg&=keep
    return fg,bg&~fg
from skimage.morphology import convex_hull_image
def cut(c,fem):
    fg,bg=seeds(c,fem)
    m=np.full(c.shape[:2],cv2.GC_PR_BGD,np.uint8)
    near=nd.binary_dilation(fg,iterations=6);m[near]=cv2.GC_PR_FGD
    far=~nd.binary_dilation(convex_hull_image(fg),iterations=3);m[bg|far]=cv2.GC_BGD;m[fg]=cv2.GC_FGD
    img=c[...,::-1].astype(np.uint8).copy();bgm=np.zeros((1,65),np.float64);fgm=np.zeros((1,65),np.float64)
    cv2.grabCut(img,m,None,bgm,fgm,6,cv2.GC_INIT_WITH_MASK)
    out=(m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD)
    l,n=nd.label(out,np.ones((3,3)));sz=nd.sum(out,l,range(1,n+1));out=l==(1+int(np.argmax(sz)))
    hol=nd.binary_fill_holes(out)&~out;hl2,hn2=nd.label(hol);hs=nd.sum(hol,hl2,range(1,hn2+1));out|=np.isin(hl2,1+np.where(hs<60)[0])
    return out
if __name__=='__main__':
    rows=[];M={}
    for rk,(y0,y1) in ROWS.items():
        row=[]
        for ci,(x0,x1) in enumerate(COLS):
            c=im[y0:y1,x0:x1];m=cut(c,rk[0]=='F');M[(rk,ci)]=m
            o=np.zeros(c.shape,np.uint8);o[...]=[255,0,255];o[m]=c[m];row.append(o)
        rows.append(np.concatenate(row,1))
    Image.fromarray(np.concatenate(rows,0)).save('gc.png')
    np.save('masks.npy',{f'{k[0]}{k[1]}':v for k,v in M.items()},allow_pickle=True)
