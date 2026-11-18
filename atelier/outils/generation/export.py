import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
import io,base64,json,sys
exec(open(A+'/controle/sheet.py').read())
G=dict(globals())
exec(open(A+'/references/views.py').read(),G)
build=G['build'];FACE,DOS,PD,PG,R=G['FACE'],G['DOS'],G['PD'],G['PG'],G['R']
from PIL import Image
def mir(v):
    mx=lambda lst:[(y,[79-x for x in xs]) for y,xs in lst]
    d=dict(segs={y:[(79-b,79-a) for a,b in ss] for y,ss in v['segs'].items()})
    for k in('outl','hem','fold','shade','light','fill'):
        if k in v:d[k]=mx(v[k])
    return d
HAND={'idle':(FACE,'idle',0),'wb0':(DOS,'wb0',0),'w1':(PD,'w1',0)}
LEFT=['idle','wave','drink','w0','w1','w2','w3','wc0','wc1','dk0','dk1']
exec(open(A+'/generation/sofa.py').read().split("def sofa")[0].replace("exec(open(A+'/generation/gen.py').read().split(\"def vtype\")[0])",""),G)
SOFA=['cs0','cs1','cs2','cs3','cn0','cn1','cn2','cn3']
exec(open(A+'/generation/sofa.py').read())
_g=dict(globals());exec(open(A+'/generation/fdn2.py').read(),_g);fdnh=_g['fdnh']
def layer(k,left=False):
    b=k[2:] if k.startswith('F_') else k
    if b in SOFA:return sofa(k)[0]
    if k.startswith('F_dn'):return fdnh(k)[0]
    if k in HAND and not left:
        v,f,_=HAND[k];a,_,_=load(f);return build(**v,clip=a[...,3]>0)
    if left and k=='w1':
        a,_,_=load('w1',True);return build(**PG,clip=a[...,3]>0)[:,::-1]
    if left and k=='idle':
        a,_,_=load('idle',True);return build(**mir(FACE),clip=a[...,3]>0)[:,::-1]
    if left:
        t,_=gen(k,True);return t[:,::-1]
    t,_=gen(k);return t
OUTL={}
from scipy.ndimage import label as _lab
def clean(t):
    m=t[...,3]>0;lab,n=_lab(m)
    for i in range(1,n+1):
        if (lab==i).sum()<4:t[lab==i]=0
    return t
def enc(t):
    ys,xs=np.where(t[...,3]>0)
    y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    b=io.BytesIO();Image.fromarray(np.ascontiguousarray(t[y0:y1,x0:x1])).save(b,'PNG',optimize=True)
    return [int(x0),int(y0),'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()]
import os;os.makedirs(A+'/../sorties/calques',exist_ok=True)
for k in FR_M+FR_F+SOFA+['F_'+x for x in SOFA]:
    t=clean(layer(k));OUTL[k]=enc(t);np.save(A+'/../sorties/calques/%s.npy'%k,t)
    b=k[2:] if k.startswith('F_') else k
    if b in LEFT:
        t=clean(layer(k,True));OUTL[k+'<']=enc(t);np.save(A+'/../sorties/calques/%s_L.npy'%k,t)
js='const WLAYSRC={teeb:'+json.dumps(OUTL,separators=(',',':'))+'};'
open(A+'/../sorties/tshirt-blanc_calques.js','w').write(js);print(len(OUTL),len(js))
