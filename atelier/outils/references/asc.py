import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import numpy as np,sys
from PIL import Image
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
def show(k,y0,y1,x0,x1,flip=False):
    a=img(SPA[k]);f=img(SPF[k]);P=np.round(f[...,0]/16).astype(int)
    if flip:a=a[:,::-1];P=P[:,::-1]
    lum=(.3*a[...,0]+.59*a[...,1]+.11*a[...,2])/255
    print('== %s%s'%(k,' (miroir)' if flip else ''))
    print('    '+''.join(str((x//10)%10) for x in range(x0,x1)));print('    '+''.join(str(x%10) for x in range(x0,x1)))
    for y in range(y0,y1):
        r=''
        for x in range(x0,x1):
            if a[y,x,3]==0:r+=' ';continue
            l=lum[y,x];c=a[y,x,:3]
            if l<.22:r+='#'
            elif c[0]>200 and c[1]>200 and c[2]>200:r+='w'
            elif abs(int(c[0])-int(c[2]))<25 and l<.6:r+='g'
            else:r+='0123456789ABC'[P[y,x]] if P[y,x] else '?'
        print('%3d '%y+r)
show(*[sys.argv[1]]+list(map(int,sys.argv[2:6])),flip=len(sys.argv)>6)
