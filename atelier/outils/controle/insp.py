import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/gen.py').read())
from PIL import Image
def insp(ks,fn,s=5,flip=False,fn_gen=None):
    tiles=[]
    for k in ks:
        t,a=(fn_gen or gen)(k) if not flip else gen(k,True)
        a=a.astype(np.uint8);ys,xs=np.where(t[...,3]>0)
        if len(ys)==0:ys,xs=np.array([60,100]),np.array([20,60])
        y0=max(0,ys.min()-14);y1=min(128,ys.max()+10);x0=max(0,xs.min()-8);x1=min(80,xs.max()+9)
        A=Image.fromarray(a[y0:y1,x0:x1]);Bm=Image.fromarray(comp(a,t)[y0:y1,x0:x1])
        T=Image.new('RGBA',(A.width*2+2,A.height),(120,160,130,255));T.alpha_composite(A,(0,0));T.alpha_composite(Bm,(A.width+2,0))
        tiles.append(T)
    Wt=sum(t.width+4 for t in tiles);Ht=max(t.height for t in tiles)
    im=Image.new('RGBA',(Wt,Ht),(60,70,65,255));x=0
    for t in tiles:im.alpha_composite(t,(x,0));x+=t.width+4
    im.resize((im.width*s,im.height*s),Image.NEAREST).save(fn)
