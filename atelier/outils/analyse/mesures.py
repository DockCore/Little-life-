import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import json,base64,io,numpy as np
from PIL import Image
from scipy import ndimage as nd
s=open(A+'/../../index.html').read()
def grab(prefix):
    i=s.find(prefix);j=i+len(prefix)-1;depth=0;k=j
    while True:
        c=s[k]
        if c=='{':depth+=1
        elif c=='}':
            depth-=1
            if depth==0:break
        k+=1
    return json.loads(s[j:k+1])
SPA=grab('const SPA={');SPA.update(grab('Object.assign(SPA,{'));SPF=grab('SPF={');SPF.update(grab('Object.assign(SPF,{'))
def img(u):return np.array(Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA'))
NAMES={1:'tete',2:'cou',3:'epaules',4:'poitrine',5:'ventre',6:'hanches',7:'bras',8:'avant_bras',9:'mains',10:'cuisses',11:'mollets',12:'pieds'}
def clean(m):
    l,n=nd.label(m,np.ones((3,3)));
    if not n:return m
    sz=nd.sum(m,l,range(1,n+1));return np.isin(l,1+np.where(sz>=6)[0])
def bb(m):
    if not m.any():return None
    y,x=np.where(m);return [int(x.min()),int(y.min()),int(x.max()),int(y.max())]
out={}
for k in sorted(SPA):
    if k.startswith('F_'):continue
    a=img(SPA[k]);al=a[...,3]>0;d={'bbox':bb(al)}
    if k in SPF:
        f=img(SPF[k]);P=np.round(f[...,0]/16).astype(int);B=np.round(f[...,2]/16).astype(int)
        for v,nm in NAMES.items():d[nm]=bb(clean((P==v)&al))
        T=clean(np.isin(P,[3,4,5])&al);d['torse']=bb(T)
        # largeur aux épaules = rangée la plus large du haut du torse (épaules + bras) sur 6 rangées
        if d['torse']:
            y0=d['torse'][1];best=None
            for y in range(y0,min(128,y0+6)):
                xx=np.where(np.isin(P[y],[3,4,7])&al[y])[0]
                if len(xx) and (best is None or xx.max()-xx.min()+1>best[0]):best=(int(xx.max()-xx.min()+1),y,int(xx.min()),int(xx.max()))
            d['epaules_rangee']=best
            # largeur du torse seul (sans bras) à mi-hauteur
            ym=(d['torse'][1]+d['torse'][3])//2;xx=np.where(np.isin(P[ym],[3,4,5])&al[ym])[0]
            d['torse_mi']=(int(xx.max()-xx.min()+1),ym,int(xx.min()),int(xx.max())) if len(xx) else None
        ml=np.where((B&1)>0);d['milieu_x']=round(float(ml[1].mean()),1) if len(ml[0]) else None
    out[k]=d
json.dump(out,open('meas.json','w'))
for k in ['idle','w0','w1','r0','wf0','wb0','wave','drink','dn0','wc0','dk0','cu0','bk0','cs3','cn3','v_front','v_q','v_side','v_back']:
    d=out[k];print(k,{x:d.get(x) for x in ['bbox','tete','cou','torse','hanches','bras','avant_bras','mains','epaules_rangee','torse_mi','milieu_x']})
