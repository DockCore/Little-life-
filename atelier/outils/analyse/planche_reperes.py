import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import json,base64,io,numpy as np
from PIL import Image,ImageDraw,ImageFont
from collections import Counter
exec(open('meas.py').read().split("out={}")[0])
M=json.load(open('meas.json'))
ROWS=[('Studio (dressing, échelle ×1,56)',['v_front','v_q','v_side','v_back']),('Debout',['idle','wave','drink']),('Marche profil',['w0','w1','w2','w3']),
 ('Course',['r0','r1','r2','r3']),('Marche face',[f'wf{i}' for i in range(8)]),('Marche dos',[f'wb{i}' for i in range(8)]),('À table (profil)',[f'dn{i}' for i in range(8)]),
 ('Bureau',['wc0','wc1','dk0','dk1']),('Haltères',[f'cu{i}' for i in range(4)]),('Vélo',[f'bk{i}' for i in range(8)]),('Canapé',['cs0','cs1','cs2','cs3','cn0','cn1','cn2','cn3'])]
CW,CH=80,128;W=8*CW;H=len(ROWS)*CH
ghost=Image.new('RGBA',(W,H),(0,0,0,0));ref=Image.new('RGBA',(W,H),(0,0,0,0))
cells=[]
for r,(t,fr) in enumerate(ROWS):
    for c,k in enumerate(fr):
        a=img(SPA[k]);im=Image.fromarray(a);ref.paste(im,(c*CW,r*CH),im)
        g=a.copy();g[...,3]=(g[...,3]>0)*60;g[...,:3]=[90,90,110];gi=Image.fromarray(g);ghost.paste(gi,(c*CW,r*CH),gi)
        cells.append((r,c,k))
# 1) gabarit à l'échelle réelle : silhouette fantôme + repères (à supprimer avant export), fond transparent
gab=ghost.copy();d=ImageDraw.Draw(gab)
for r,c,k in cells:
    m=M[k];x0,y0=c*CW,r*CH
    d.rectangle([x0,y0,x0+CW-1,y0+CH-1],outline=(0,189,235,120))
    d.point((x0+40,y0+127),fill=(255,0,0,255))
    if m.get('cou'):d.line([x0,y0+m['cou'][3],x0+CW-1,y0+m['cou'][3]],fill=(255,170,0,110))
    if m.get('hanches'):d.line([x0,y0+m['hanches'][1]+2,x0+CW-1,y0+m['hanches'][1]+2],fill=(0,170,90,110))
gab.save('gabarit_tshirt_homme_1x.png')
ref.save('reference_homme_1x.png')
# 2) aperçu annoté ×4
S=4;big=Image.new('RGBA',(W*S+260,H*S),(244,236,224,255));bd=ImageDraw.Draw(big)
try:F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22);Fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
except:F=Fs=None
rb=ref.resize((W*S,H*S),Image.NEAREST);big.paste(rb,(260,0),rb)
for r,(t,fr) in enumerate(ROWS):
    bd.text((10,r*CH*S+20),t,fill=(59,42,36),font=F)
    for c,k in enumerate(fr):
        x0,y0=260+c*CW*S,r*CH*S;m=M[k]
        bd.rectangle([x0,y0,x0+CW*S-1,y0+CH*S-1],outline=(0,189,235),width=2)
        bd.text((x0+6,y0+4),k,fill=(0,120,160),font=Fs)
        def box(bx,col):
            if bx:bd.rectangle([x0+bx[0]*S,y0+bx[1]*S,x0+(bx[2]+1)*S-1,y0+(bx[3]+1)*S-1],outline=col,width=2)
        box(m.get('torse'),(230,60,60));box(m.get('bras'),(250,160,0));box(m.get('hanches'),(40,160,90))
        bd.ellipse([x0+40*S-5,y0+127*S-5,x0+40*S+5,y0+127*S+5],fill=(255,0,0))
big.convert('RGB').save('planche_reperes_x4.png')
print(W,H)
