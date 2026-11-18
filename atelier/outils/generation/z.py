import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
SPL=grab('const SPL={')
try:SPL.update(grab('Object.assign(SPL,{'))
except Exception as e:print('noassign',e)
import numpy as np
def Z(k):
    im=img(SPL[k]);return np.round(im[...,0]/40).astype(int)*(im[...,3]>0) if im.shape[-1]==4 else np.round(im[...,0]/40).astype(int)
def zones(k,y0,y1,x0,x1):
    a=img(SPA[k]);z=Z(k)
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2]
    print('==',k)
    for y in range(y0,y1):print('%3d '%y+''.join(('#' if lum[y,x]<56 else str(z[y,x])) if a[y,x,3] else ' ' for x in range(x0,x1)))
