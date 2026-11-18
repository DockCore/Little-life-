import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Planche compacte : sprite | carte | côtés, par image, en grille.
exec(open(A+'/atlas/decoupe.py').read())
import sys
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
def tuile(k,z=4,lab=None,side=None):
    a=sprite(k)
    if lab is None:lab,side,_=decouper(k)
    x0,y0,x1,y1=boite(a,1);w,h=x1-x0,y1-y0
    sc=np.zeros(lab.shape+(4,),np.uint8);op=a[...,3]>0;sc[op]=(90,90,90,255)
    lim=np.isin(lab,(7,8,9,10,11,12));sc[lim&(side==1)]=(60,140,255,255);sc[lim&(side==2)]=(255,150,40,255)
    T=Image.new('RGBA',(3*w*z+16,h*z+20),(40,44,52,255))
    for i,arr in enumerate([a,colorer(lab,None),sc]):T.alpha_composite(Image.fromarray(arr[y0:y1,x0:x1]).resize((w*z,h*z),Image.NEAREST),(i*(w*z+8),20))
    ImageDraw.Draw(T).text((2,1),k,fill=(255,255,255),font=F);return T
def planche(ks,fn,par=3,z=4):
    ts=[tuile(k,z) for k in ks];W=max(t.width for t in ts);H=max(t.height for t in ts);r=(len(ts)+par-1)//par
    IM=Image.new('RGBA',(par*(W+12),r*(H+12)),(40,44,52,255))
    for i,t in enumerate(ts):IM.alpha_composite(t,((i%par)*(W+12),(i//par)*(H+12)))
    IM.save(fn)
if __name__=='__main__':planche(sys.argv[2:],sys.argv[1])
