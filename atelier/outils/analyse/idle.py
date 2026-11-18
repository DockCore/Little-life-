import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import json,numpy as np
from PIL import Image,ImageDraw,ImageFont
from collections import Counter
exec(open('meas.py').read().split("out={}")[0])
M=json.load(open('meas.json'))
for k in ['idle','v_front']:
    a=img(SPA[k]);al=a[...,3]>0
    cnt=Counter(tuple(a[y,x,:3]) for y,x in zip(*np.where(al)))
    dark=[c for c,n in cnt.most_common(400) if sum(c)<120][:4]
    print(k,'couleurs',len(cnt),'contours',['#%02x%02x%02x'%c for c in dark])
    f=img(SPF[k]);P=np.round(f[...,0]/16).astype(int)
    for y in range(int(M[k]['cou'][1]),int(M[k]['hanches'][3])+1):
        row=P[y];xs=np.where(np.isin(row,[3,4,5,6])&al[y])[0];xa=np.where(np.isin(row,[7,8])&al[y])[0]
        print(y,'torse',(xs.min(),xs.max(),len(xs)) if len(xs) else '-','bras',(xa.min(),xa.max()) if len(xa) else '-')
# planche cotée de idle ×8
k='idle';S=8;a=img(SPA[k]);m=M[k]
crop=(14,44,66,128);sub=Image.fromarray(a).crop(crop);w,h=sub.size
big=Image.new('RGBA',(w*S+400,h*S+40),(244,236,224,255));big.paste(sub.resize((w*S,h*S),Image.NEAREST),(20,20),sub.resize((w*S,h*S),Image.NEAREST))
d=ImageDraw.Draw(big);F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
X=lambda x:20+(x-crop[0])*S;Y=lambda y:20+(y-crop[1])*S
for x in range(crop[0],crop[2]+1,1):
    d.line([X(x),20,X(x),20+h*S],fill=(0,0,0,18))
for y in range(crop[1],crop[3]+1):
    d.line([20,Y(y),20+w*S,Y(y)],fill=(0,0,0,18))
def hl(y,col,txt):d.line([20,Y(y),20+w*S,Y(y)],fill=col,width=2);d.text((30+w*S,Y(y)-10),txt,fill=col,font=F)
t=m['tete'];hl(t[1],(120,80,200),f'y={t[1]} haut de la tête');hl(m['cou'][1],(230,140,0),f"y={t[3]} bas de la tête · y={m['cou'][1]} cou");hl(m['torse'][1],(220,60,60),f"y={m['torse'][1]} épaules / col")
hl(m['torse'][3]+1,(220,60,60),f"y={m['torse'][3]} fin du ventre");hl(m['hanches'][3]+1,(40,150,90),f"y={m['hanches'][3]} bas des hanches")
hl(127,(200,0,0),'y=127 sol (point d’ancrage x=40)')
e=m['epaules_rangee'];d.line([X(e[2]),Y(e[1])+S//2,X(e[3]+1),Y(e[1])+S//2],fill=(220,60,60),width=4);d.text((30+w*S,Y(e[1])-10),f'y={e[1]} épaules+bras : {e[0]} px (x{e[2]}–{e[3]})',fill=(220,60,60),font=F)
tm=m['torse_mi'];d.line([X(tm[2]),Y(tm[1])+S//2,X(tm[3]+1),Y(tm[1])+S//2],fill=(0,140,200),width=4);d.text((30+w*S,Y(tm[1])+8),f'y={tm[1]} torse seul : {tm[0]} px (x{tm[2]}–{tm[3]})',fill=(0,140,200),font=F)
d.line([X(40)+S//2,Y(m['cou'][1]),X(40)+S//2,Y(m['hanches'][3])],fill=(0,140,200),width=2)
big.convert('RGB').save('idle_cote_x8.png');print(big.size)
