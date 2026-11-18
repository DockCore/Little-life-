import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/atlas/grille.py').read().split("if __name__")[0])
import sys
def grilles(ks,fn,s=6,y0=None,y1=None):
    ims=[]
    for k in ks:
        a=sprite(k);x0,yy0,x1,yy1=boite(a,1)
        grille(a,(x0,y0 if y0 is not None else yy0,x1,y1 if y1 is not None else yy1),'/tmp/_g.png',s=s);im=Image.open('/tmp/_g.png').copy()
        ImageDraw.Draw(im).text((40,0),k,fill=(0,0,255),font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12));ims.append(im)
    W=sum(i.width+6 for i in ims);H=max(i.height for i in ims);IM=Image.new('RGBA',(W,H),(255,255,255,255));x=0
    for i in ims:IM.paste(i,(x,0));x+=i.width+6
    IM.save(fn)
if __name__=='__main__':
    a=sys.argv;y0=int(a[3]) if len(a)>4 and a[3].isdigit() else None
    ks=[k for k in a[2:] if not k.isdigit()];nums=[int(k) for k in a[2:] if k.isdigit()]
    grilles(ks,a[1],y0=nums[0] if nums else None,y1=nums[1] if len(nums)>1 else None)
