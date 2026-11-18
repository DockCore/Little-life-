import numpy as np, json, base64, io
from PIL import Image
from scipy import ndimage as nd
from seg import im,COLS,ROWS,hsv
M=np.load('masks.npy',allow_pickle=True).item()
CW,CH=80,128;S=78/177
def legs(c,mk):
    h,s,v=hsv(c);wood=(h>15)&(h<35)&(s>.5)&(v>.3)&(v<.75)&~mk
    l,n=nd.label(wood);objs=nd.find_objects(l);sz=nd.sum(wood,l,range(1,n+1))
    L=[((o[1].start+o[1].stop)/2,o[0].stop) for o,z in zip(objs,sz) if z>25 and o[0].start>c.shape[0]*.6]
    L.sort(key=lambda p:p[0]);return L   # gauche-arrière, avant-gauche, droite
def hires_labels(c,mk,fem):
    h,s,v=hsv(c);r,g,b=c[...,0],c[...,1],c[...,2]
    lab=np.zeros(mk.shape,np.uint8)   # 0 rien, 1 peau, 2 cheveux, 3 blanc, 4 pantalon, 7 sombre, 9 autre
    lab[mk]=9
    hair=(h>6)&(h<30)&(s>.38)&(v>.2)&(v<.8)
    pil=(h>=26)&(h<55)&(s>.45)&(v>.55)
    skin=(h>2)&(h<38)&(s>.22)&(s<.7)&(v>.62)
    white=(s<.12)&(v>.74)
    dark=v<.36
    if fem: pants=(h>190)&(h<245)&(s>.12)&(v>.3)
    else: pants=nd.binary_opening(dark&(b-r<18),np.ones((3,3)))
    lab[mk&dark]=7;lab[mk&pants]=4;lab[mk&white]=3;lab[mk&skin]=1;lab[mk&hair]=2;lab[mk&pil&~hair]=9
    return lab
def build(key,fem,ref,anchor):
    y0,y1=ROWS[key[:2]];x0,x1=COLS[int(key[2])];c=im[y0:y1,x0:x1];mk=M[key]
    lab=hires_labels(c,mk,fem)
    out=np.zeros((CH,CW,4),np.uint8);L=np.zeros((CH,CW),np.uint8)
    ax,ay=anchor;xr,yr=ref
    for Y in range(CH):
        for X in range(CW):
            sx0=xr+(X-ax)/S;sx1=xr+(X+1-ax)/S;sy0=yr+(Y-ay)/S;sy1=yr+(Y+1-ay)/S
            i0,i1,j0,j1=int(np.floor(sx0)),int(np.ceil(sx1)),int(np.floor(sy0)),int(np.ceil(sy1))
            if i1<=0 or j1<=0 or i0>=c.shape[1] or j0>=c.shape[0]:continue
            i0,j0=max(0,i0),max(0,j0);i1,j1=min(c.shape[1],i1),min(c.shape[0],j1)
            m=mk[j0:j1,i0:i1]
            if m.mean()<.42:continue
            lb=lab[j0:j1,i0:i1][m];cc=c[j0:j1,i0:i1][m]
            vals,cnt=np.unique(lb,return_counts=True)
            # le sombre l'emporte s'il est bien présent (contours, yeux)
            k=vals[np.argmax(cnt)]
            if 7 in vals and cnt[list(vals).index(7)]>=.34*cnt.sum():k=7
            if k==9:continue
            col=cc[lb==k].mean(0)
            out[Y,X,:3]=col.astype(np.uint8);out[Y,X,3]=255;L[Y,X]=k
    return out,L
EDIT={'cs0':[(47,57,106,124)],'F_cs2':[(43,60,79,88)],'cn2':[(16,29,78,91)]}
def finish(out,L,fem,nm=''):
    a=out[...,3]>0
    for x0,x1,y0,y1 in EDIT.get(nm,[]):a[y0:y1,x0:x1]=False
    # élaguer les fins traits sombres (bords du canapé), garder le corps
    K8=np.ones((3,3))
    for _ in range(30):
        nb=nd.convolve(a.astype(int),K8,mode='constant')-a
        body=a&(L!=7)
        nb4=nd.convolve(body.astype(int),np.array([[0,1,0],[1,0,1],[0,1,0]]),mode='constant')
        tip=a&(L==7)&(((nb<=2))|((nb4==0)&(nb<=4)))
        if not tip.any():break
        a&=~tip
    l,n=nd.label(a,K8);sz=nd.sum(a,l,range(1,n+1));a=np.isin(l,1+np.where(sz>=40)[0])
    # ombre au sol près des pieds
    sh=np.where(L==3)
    out[~a]=0;L=np.where(a,L,0)
    # chaussures = taches blanches basses ; haut = le reste du blanc
    wl,wn=nd.label(L==3)
    pl=np.where(L==4)
    py=pl[0].mean() if len(pl[0]) else 999
    lab=np.zeros_like(L)
    lab[L==1]=1;lab[L==2]=2;lab[L==4]=4
    for i in range(1,wn+1):
        cc=wl==i;ys,xs=np.where(cc)
        lab[cc]=5 if (ys.mean()>py and cc.sum()<40) else 3
    # hanches : pantalon proche du haut -> sous-vêtement quand on n'a pas de pantalon
    top=nd.binary_dilation(lab==3,iterations=4);lab[(lab==4)&top]=6
    sho=lab==5
    if sho.any():
        sy=np.where(sho)[0].min();yy=np.arange(CH)[:,None]
        drop=(L==7)&(yy>=sy-3)&~nd.binary_dilation(sho,iterations=1)
        a&=~drop;out[drop]=0;lab[drop]=0
    # petits trous internes
    # contour 1 px autour de la silhouette
    OUT=np.array([43,29,28],np.uint8)
    edge=nd.binary_dilation(a,np.array([[0,1,0],[1,1,1],[0,1,0]]))&~a
    out[edge,:3]=OUT;out[edge,3]=255
    return out,lab
def png(a):
    b=io.BytesIO();Image.fromarray(a).save(b,'PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
res={};prev=[]
for g in ['M','F']:
    fem=g=='F'
    # repère des images « s'asseoir » : hanche de la pose assise, sur la ligne de l'avant du canapé
    k3=g+'s3';y0,y1=ROWS[g+'s'];x0,x1=COLS[3];c=im[y0:y1,x0:x1];Lg=legs(c,M[k3]);fl,fr=Lg[1],Lg[2]
    ys,xs=np.where(M[k3]);hx=float(np.median(xs[(ys>ys.min()+70)&(ys<ys.min()+110)]))
    t=(hx-fl[0])/(fr[0]-fl[0]);hy=fl[1]+(fr[1]-fl[1])*t
    for i in range(4):
        key=g+'s'+str(i);c=im[ROWS[g+'s'][0]:ROWS[g+'s'][1],COLS[i][0]:COLS[i][1]];Lg=legs(c,M[key])
        d=(Lg[1][0]-fl[0],Lg[1][1]-fl[1])   # petit décalage du canapé d'une case à l'autre
        nm=('F_' if fem else '')+'cs'+str(i)
        o,L=build(key,fem,(hx+d[0],hy+d[1]),(40,120));o,lab=finish(o,L,fem,nm);res[nm]=(o,lab);prev.append(o)
    for i in range(4):
        key=g+'n'+str(i);c=im[ROWS[g+'n'][0]:ROWS[g+'n'][1],COLS[i][0]:COLS[i][1]];Lg=legs(c,M[key])
        nm=('F_' if fem else '')+'cn'+str(i)
        o,L=build(key,fem,(Lg[1][0],Lg[1][1]),(22,120));o,lab=finish(o,L,fem,nm);res[nm]=(o,lab);prev.append(o)
# aperçu
W=CW*8;H=CH*2;pv=np.zeros((H,W,4),np.uint8);pv[...]=[60,60,80,255]
for j,o in enumerate(prev):
    r,cl=j//8,j%8;sub=pv[r*CH:(r+1)*CH,cl*CW:(cl+1)*CW];m=o[...,3]>0;sub[m]=o[m]
Image.fromarray(pv).resize((W*3,H*3),Image.NEAREST).save('prev.png')
# données pour le jeu
SPA={k:png(v[0]) for k,v in res.items()}
SPLd={}
REF={}
for k,(o,lab) in res.items():
    l=np.zeros((CH,CW,4),np.uint8);l[...,0]=lab*40;l[...,3]=255;SPLd[k]=png(l)
    lum=(.3*o[...,0]+.59*o[...,1]+.11*o[...,2])/255
    REF[k]={int(z):round(float(np.median(lum[lab==z])),3) for z in range(1,7) if (lab==z).any()}
    ys,xs=np.where(lab==2);REF[k]['hx']=int(round(xs.mean()));REF[k]['hy']=int(ys.min());REF[k]['fy']=int(round(ys.mean()))
json.dump({'SPA':SPA,'SPL':SPLd,'REF':REF},open('cs.json','w'))
print({k:(int((v[1]>0).sum())) for k,v in res.items()})
print(REF['cs3'],REF['F_cn3'])
