import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/fdn_gen.py').read())
from PIL import Image
def show(fn,fun=None,ks=None):
    ks=ks or ['F_dn%d'%i for i in range(8)]
    IM=Image.new('RGBA',(len(ks)*74,36),(120,160,130,255))
    for i,k in enumerate(ks):
        t,a=(fun or fdn)(k);a=a.astype(np.uint8);c=a.copy();kk=t[...,3]>0;c[kk]=t[kk]
        IM.alpha_composite(Image.fromarray(a).crop((18,72,54,108)),(i*74,0));IM.alpha_composite(Image.fromarray(c).crop((18,72,54,108)),(i*74+36,0))
    IM.resize((IM.width*4,IM.height*4),Image.NEAREST).save(fn)
