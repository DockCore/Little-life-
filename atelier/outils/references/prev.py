import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/references/tee.py').read())
from PIL import Image
import sys
def prev(views,fn,y0=74,y1=112,s=9):
    cells=[]
    for v in views:
        t,a=tee(**v);cells+=[a.astype(np.uint8),comp(a.astype(np.uint8),t)]
    im=Image.new('RGBA',(80*len(cells),y1-y0),(90,140,110,255))
    for i,c in enumerate(cells):im.alpha_composite(Image.fromarray(c[y0:y1]),(80*i,0))
    im=im.crop((0,0,im.width,im.height))
    im.resize((im.width*s,im.height*s),Image.NEAREST).save(fn)
