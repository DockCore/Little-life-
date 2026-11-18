import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Planches de validation de l'atlas : pour chaque image, le sprite, la carte du jeu (origine) et la carte de l'atlas
# (premier plan hachuré blanc, repères en croix). Sortie : atelier/sorties/atlas/validation_XX.png + legende.png
exec(open(A+'/atlas/commun.py').read())
FONTE_P=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11) if _o.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else FONTE
import json,sys
D=A+'/../atlas';S=A+'/../sorties/atlas';_o.makedirs(S,exist_ok=True)
info=json.load(open(D+'/atlas.json'))
def carte(k):return np.array(Image.open(D+'/cartes/%s.png'%k))
def pp(k):return np.array(Image.open(D+'/premier_plan/%s.png'%k).convert('L'))>0
def tuile(k,z=4):
    a=sprite(k);P0,_,_=carte_jeu(k);P=carte(k);fg=pp(k)
    x0,y0,x1,y1=boite(a);w,h=x1-x0,y1-y0
    c=colorer(P,a)
    for y,x in zip(*np.where(fg)):
        if (x+y)%2==0:c[y,x,:3]=(255,255,255);c[y,x,3]=255
    panels=[a,colorer(P0,a),c]
    T=Image.new('RGBA',(max(3*w*z+2*4*z,560),h*z+78),(40,44,52,255))
    for i,p in enumerate(panels):
        T.alpha_composite(Image.fromarray(p[y0:y1,x0:x1]).resize((w*z,h*z),Image.NEAREST),(i*(w*z+4*z),0))
    d=ImageDraw.Draw(T)
    for nom,(x,y) in info[k]['reperes'].items():
        X=2*(w*z+4*z)+(x-x0)*z+z//2;Y=(y-y0)*z+z//2
        d.line([(X-4,Y),(X+4,Y)],fill=(0,0,0),width=3);d.line([(X,Y-4),(X,Y+4)],fill=(0,0,0),width=3)
        d.line([(X-3,Y),(X+3,Y)],fill=(255,255,255),width=1);d.line([(X,Y-3),(X,Y+3)],fill=(255,255,255),width=1)
    n=len(info[k]['corrections']);st=info[k]['controle']
    d.text((2,h*z+2),'%s  ·  %s  ·  %s'%(k,info[k]['famille'],('%d correction%s'%(n,'s' if n>1 else '')) if n else 'carte du jeu conservée'),fill=(255,255,255),font=FONTE)
    d.text((2,h*z+22),'contrôle : '+st,fill=(120,220,140) if 'conforme' in st else (255,170,90) if 'réserve' in st else (255,214,102),font=FONTE)
    rem=info[k].get('remarque','')
    if rem:
        import textwrap
        for j,l in enumerate(textwrap.wrap(rem,70)[:2]):d.text((2,h*z+40+j*14),l,fill=(200,200,200),font=FONTE_P)
    return T
def planches(ks,nom,par_ligne=3):
    ts=[tuile(k) for k in ks];W=max(t.width for t in ts);H=max(t.height for t in ts)
    rows=(len(ts)+par_ligne-1)//par_ligne;IM=Image.new('RGBA',(par_ligne*(W+24),rows*(H+24)),(40,44,52,255))
    for i,t in enumerate(ts):r,c=divmod(i,par_ligne);IM.alpha_composite(t,(c*(W+24)+12,r*(H+24)+12))
    IM.save(S+'/'+nom)
def legende():
    IM=Image.new('RGBA',(14*150,70),(40,44,52,255));d=ImageDraw.Draw(IM)
    for i in range(1,14):
        d.rectangle([(i-1)*150+8,10,(i-1)*150+30,32],fill=COUL[i]);d.text(((i-1)*150+36,14),PARTIES[i].replace(' / ','/\n'),fill=(255,255,255),font=FONTE)
    x=13*150+8;d.rectangle([x,10,x+22,32],fill=(255,255,255));d.text((x+28,14),'premier\nplan',fill=(255,255,255),font=FONTE)
    d.text((8,48),'Chaque image : sprite du jeu · carte du jeu (origine) · carte de l’atlas (premier plan hachuré, repères en croix)',fill=(200,200,200),font=FONTE)
    IM.save(S+'/legende.png')
if __name__=='__main__':
    legende();ks=sys.argv[1:] or IMAGES
    for p in range(0,len(ks),9):planches(ks[p:p+9],'validation_%02d.png'%(p//9))
    print('planches :',(len(ks)+8)//9)
