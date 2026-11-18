import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Affiche un sprite en texte (# contour, . peau, h cheveux, w blanc/sous-vêtement, o objet/autre) pour annoter au pixel.
exec(open(A+'/atlas/commun.py').read())
import sys
SPL=grab('const SPL={');SPL.update(grab('Object.assign(SPL,{'))
def zones(k):
    im=img(SPL[k]);z=np.round(im[...,0]/40).astype(int)
    if im.shape[-1]==4:z[im[...,3]==0]=0
    return z
def asc(k,y0=0,y1=128,x0=0,x1=80):
    a=sprite(k).astype(int);z=zones(k);lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2]
    print('    '+''.join(str((x//10)%10) for x in range(x0,x1)));print('    '+''.join(str(x%10) for x in range(x0,x1)))
    for y in range(y0,y1):
        r=''
        for x in range(x0,x1):
            if a[y,x,3]==0:r+=' ';continue
            if lum[y,x]<60:r+='#';continue
            if z[y,x]==2:r+='h';continue
            if z[y,x]==1:r+='.';continue
            R,G,B=a[y,x,:3]
            r+='w' if (R>170 and G>170 and B>160) else 'o'
        print('%3d '%y+r)
if __name__=='__main__':
    k=sys.argv[1];v=list(map(int,sys.argv[2:6])) if len(sys.argv)>5 else [0,128,0,80];asc(k,*v)
