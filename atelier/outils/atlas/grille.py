import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Vue agrandie avec grille et coordonnées, pour annoter un squelette ou vérifier une carte au pixel.
exec(open(A+'/atlas/commun.py').read())
import sys,json
def grille(arr,box,fn,s=7,pts=None,lines=None):
    x0,y0,x1,y1=box
    c=Image.new('RGBA',((x1-x0)*s+34,(y1-y0)*s+24),(225,225,225,255))
    c.alpha_composite(Image.fromarray(arr[y0:y1,x0:x1]).resize(((x1-x0)*s,(y1-y0)*s),Image.NEAREST),(34,24));d=ImageDraw.Draw(c)
    f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',10)
    for x in range(x0,x1+1):
        X=34+(x-x0)*s;d.line([(X,24),(X,c.height)],fill=(0,0,0,50) if x%5 else (255,0,0,140))
        if x%5==0:d.text((X+1,8),str(x),fill=(0,0,0),font=f)
    for y in range(y0,y1+1):
        Y=24+(y-y0)*s;d.line([(34,Y),(c.width,Y)],fill=(0,0,0,50) if y%5 else (255,0,0,140))
        if y%5==0:d.text((2,Y+1),str(y),fill=(0,0,0),font=f)
    if lines:
        for (a,b) in lines:d.line([(34+(a[0]-x0)*s+s//2,24+(a[1]-y0)*s+s//2),(34+(b[0]-x0)*s+s//2,24+(b[1]-y0)*s+s//2)],fill=(0,0,0),width=2)
    if pts:
        for n,(x,y) in pts.items():
            X=34+(x-x0)*s+s//2;Y=24+(y-y0)*s+s//2;d.ellipse([X-3,Y-3,X+3,Y+3],fill=(255,255,255),outline=(0,0,0));d.text((X+4,Y-6),n,fill=(0,0,0),font=f)
    c.save(fn)
if __name__=='__main__':
    k=sys.argv[1];a=sprite(k);bx=boite(a,1);grille(a,bx,sys.argv[2] if len(sys.argv)>2 else '/tmp/g.png',s=int(sys.argv[3]) if len(sys.argv)>3 else 7)
