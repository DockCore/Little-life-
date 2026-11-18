import numpy as np, colorsys
from PIL import Image
from scipy import ndimage
im=np.array(Image.open('/mnt/user-data/uploads/f8abc394-image.png').convert('RGB')).astype(int)
COLS=[(198,435),(455,690),(712,945),(968,1200)]
ROWS={'Ms':(65,268),'Mn':(268,472),'Fs':(555,762),'Fn':(762,968)}
def hsv(a):
    r,g,b=a[...,0]/255,a[...,1]/255,a[...,2]/255
    mx=np.maximum(np.maximum(r,g),b);mn=np.minimum(np.minimum(r,g),b);d=mx-mn
    h=np.zeros_like(mx)
    m=d>1e-6
    hr=((g-b)/np.where(m,d,1))%6;hg=(b-r)/np.where(m,d,1)+2;hb=(r-g)/np.where(m,d,1)+4
    h=np.where(mx==r,hr,np.where(mx==g,hg,hb))*60;h=np.where(m,h,0)
    s=np.where(mx>0,d/np.maximum(mx,1e-6),0);return h,s,mx
def classify(c):
    h,s,v=hsv(c);r,g,b=c[...,0],c[...,1],c[...,2]
    lum=(.3*r+.59*g+.11*b)/255
    hair=(h>8)&(h<38)&(s>.45)&(v<.72)&(v>.2)
    skin=(h>8)&(h<40)&(s>.2)&(s<.55)&(v>.72)
    white=(s<.07)&(v>.83)
    blue=(b>r+12)&(v>.25)&(v<.85)&(s>.18)        # jean (féminin)
    dark=(v<.3)
    navy=(v<.42)&(b>=r-4)&(s<.45)                  # pantalon sombre bleuté
    return dict(hair=hair,skin=skin,white=white,blue=blue,dark=dark,navy=navy,lum=lum,h=h,s=s,v=v)
if __name__=='__main__':
    out=[]
    for rk,(y0,y1) in ROWS.items():
        row=[]
        for (x0,x1) in COLS:
            c=im[y0:y1,x0:x1];K=classify(c)
            vis=np.zeros(c.shape,np.uint8)+40
            vis[K['dark']]=[90,90,90];vis[K['navy']]=[0,0,255];vis[K['blue']]=[0,160,255];vis[K['white']]=[255,255,255];vis[K['skin']]=[255,150,120];vis[K['hair']]=[160,80,0]
            row.append(np.concatenate([c.astype(np.uint8),vis],0))
        out.append(np.concatenate(row,1))
    Image.fromarray(np.concatenate(out[:2],0)).save('clsM.png');Image.fromarray(np.concatenate(out[2:],0)).save('clsF.png')
