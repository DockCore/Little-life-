import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Vue de revue d'une ou plusieurs images : sprite | carte | carte + squelette, agrandies.
exec(open(A+'/atlas/decoupe.py').read())
import sys
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
def vue(k,z=5,lab=None):
    a=sprite(k);p=charger(k)['points']
    side=None
    if lab is None:lab,side,_=decouper(k)
    x0,y0,x1,y1=boite(a,2);w,h=x1-x0,y1-y0
    c=colorer(lab,None)
    sc=np.zeros(lab.shape+(4,),np.uint8);op=a[...,3]>0;sc[op]=(90,90,90,255)
    if side is not None:
        lim=np.isin(lab,(7,8,9,10,11,12))
        sc[lim&(side==1)]=(60,140,255,255);sc[lim&(side==2)]=(255,150,40,255)
    T=Image.new('RGBA',(4*w*z+60,h*z+22),(40,44,52,255))
    for i,arr in enumerate([a,c,sc,a]):
        T.alpha_composite(Image.fromarray(arr[y0:y1,x0:x1]).resize((w*z,h*z),Image.NEAREST),(i*(w*z+20),22))
    d=ImageDraw.Draw(T);ox=3*(w*z+20)
    P=lambda q:(ox+(q[0]-x0)*z+z//2,22+(q[1]-y0)*z+z//2)
    for (pa,pb,part,sd) in os_du_squelette(p):d.line([P(pa),P(pb)],fill=(0,0,0),width=3);d.line([P(pa),P(pb)],fill=(255,255,255),width=1)
    for n,q in p.items():
        X,Y=P(q);d.ellipse([X-3,Y-3,X+3,Y+3],fill=(255,255,255),outline=(0,0,0))
    jaw=[p[n] for n in('machoire_g','menton','machoire_d') if p.get(n)]
    if len(jaw)>1:d.line([P(q) for q in sorted(jaw)],fill=(255,0,255),width=2)
    d.text((2,2),k,fill=(255,255,255),font=F)
    return T
if __name__=='__main__':
    ks=sys.argv[2:];ts=[vue(k) for k in ks];W=sum(t.width+10 for t in ts);H=max(t.height for t in ts)
    IM=Image.new('RGBA',(W,H),(40,44,52,255));x=0
    for t in ts:IM.alpha_composite(t,(x,0));x+=t.width+10
    IM.save(sys.argv[1])
