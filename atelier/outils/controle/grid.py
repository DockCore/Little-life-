import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
from PIL import Image,ImageDraw
import sys
def grid(k,x0,y0,x1,y1,fn,s=14,layer=None):
    a=img(SPA[k])
    if layer is not None:
        a=a.copy();kk=layer[...,3]>0;a[kk]=layer[kk]
    c=Image.new('RGBA',((x1-x0)*s+30,(y1-y0)*s+20),(120,160,130,255))
    im=Image.fromarray(a).crop((x0,y0,x1,y1)).resize(((x1-x0)*s,(y1-y0)*s),Image.NEAREST)
    c.alpha_composite(im,(30,20));d=ImageDraw.Draw(c)
    for x in range(x0,x1+1):
        X=30+(x-x0)*s;d.line([(X,20),(X,c.height)],fill=(0,0,0,40) if x%5 else (255,0,0,120))
        if x%5==0:d.text((X+1,4),str(x),fill=(0,0,0,255))
    for y in range(y0,y1+1):
        Y=20+(y-y0)*s;d.line([(30,Y),(c.width,Y)],fill=(0,0,0,40) if y%5 else (255,0,0,120))
        if y%5==0:d.text((2,Y+1),str(y),fill=(0,0,0,255))
    c.save(fn)
