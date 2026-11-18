import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
import numpy as np,os,glob
from PIL import Image
names=sorted([os.path.basename(f)[:-4] for f in glob.glob(A+'/../sorties/calques/*.npy')])
def comp_of(n):
    left=n.endswith('_L');k=n[:-2] if left else n
    a=img(SPA[k]);t=np.load(A+'/../sorties/calques/%s.npy'%n);c=a.copy();m=t[...,3]>0;c[m]=t[m]
    if left:c=c[:,::-1]
    return c,t,k
def sheets(ns,tag,per=10,s=4):
    for p in range(0,len(ns),per):
        ch=ns[p:p+per];IM=Image.new('RGBA',(per*48,56),(120,160,130,255))
        for i,n in enumerate(ch):
            c,t,k=comp_of(n);ys,xs=np.where(t[...,3]>0)
            cy,cx=(ys.min()+ys.max())//2,(xs.min()+xs.max())//2
            if n.endswith('_L'):cx=79-cx
            y0=max(0,min(128-56,cy-28));x0=max(0,min(80-48,cx-24))
            IM.alpha_composite(Image.fromarray(c).crop((x0,y0,x0+48,y0+56)),(i*48,0))
        IM.resize((IM.width*s,IM.height*s),Image.NEAREST).save(A+'/../sorties/apercus/rv_%s_%02d.png'%(tag,p//per));print(tag,p//per,ch)
M=[n for n in names if not n.startswith('F_')];Fm=[n for n in names if n.startswith('F_')]
sheets(M,'m');sheets(Fm,'f')
