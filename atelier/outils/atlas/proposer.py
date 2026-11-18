import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Propose un squelette de départ pour une image (à vérifier et corriger à la main) :
#  - par suivi depuis une image voisine déjà contrôlée (même animation) : recherche du meilleur appariement local ;
#  - à défaut, à partir des cartes du jeu (indices seulement).
# N'écrase jamais un squelette existant sauf avec --forcer.
exec(open(A+'/atlas/commun.py').read())
import json,sys
SQ=A+'/../atlas/squelettes'
NOMS=['sommet','menton','machoire_g','machoire_d','cou_bas','epaule_g','coude_g','poignet_g','main_g','epaule_d','coude_d','poignet_d','main_d',
      'poitrine_bas','taille','bassin','hanche_g','genou_g','cheville_g','orteils_g','hanche_d','genou_d','cheville_d','orteils_d']
def suivre(src,dst,r=4,R=7):
    a=sprite(src).astype(float);b=sprite(dst).astype(float);P=json.load(open(SQ+'/%s.json'%src))['points'];out={}
    def patch(im,x,y):
        pad=np.zeros((128+2*r+2*R,80+2*r+2*R,4));pad[r+R:r+R+128,r+R:r+R+80]=im
        return pad[y+R:y+R+2*r+1,x+R:x+R+2*r+1]
    for n,(x,y) in P.items():
        ref=patch(a,x,y);best=None
        for dy in range(-R,R+1):
            for dx in range(-R,R+1):
                X,Y=x+dx,y+dy
                if not(0<=X<80 and 0<=Y<128):continue
                c=patch(b,X,Y);d=((ref-c)**2).sum()+ (dx*dx+dy*dy)*40
                if best is None or d<best[0]:best=(d,X,Y)
        out[n]=[best[1],best[2]]
    return out
if __name__=='__main__':
    src,dsts=sys.argv[1],sys.argv[2:]
    force='--forcer' in dsts;dsts=[d for d in dsts if d!='--forcer']
    for d in dsts:
        f=SQ+'/%s.json'%d
        if _o.path.exists(f) and not force:print('existe déjà :',d);continue
        S=json.load(open(SQ+'/%s.json'%src));S['points']=suivre(src,d);S['notes']='proposé par suivi depuis %s — à contrôler'%src
        json.dump(S,open(f,'w'),ensure_ascii=False,indent=0);print('proposé :',d)

# --- proposition à partir des cartes du jeu (indices seulement, toujours à contrôler) ---
from scipy.ndimage import label as _lab
def depuis_cartes(k):
    a=sprite(k);op=a[...,3]>0;f=img(SPF[k]);P=np.round(f[...,0]/16).astype(int);P[~op]=0;Fl=np.round(f[...,2]/16).astype(int)
    pts={};ys,xs=np.where(op);t=np.argmin(ys);pts['sommet']=[int(xs[t]),int(ys[t])]
    tor=np.isin(P,(3,4,5,6))
    mids=np.where(((Fl&1)>0)&tor);mx=int(round(mids[1].mean())) if len(mids[0]) else int(round(np.where(tor)[1].mean())) if tor.any() else 40
    ty=np.where(np.isin(P,(3,4)))[0];top=int(ty.min()) if len(ty) else 85
    hy=np.where(P==1)[0];chin=min(int(hy.max()) if len(hy) else top-3,top-2)
    row=np.where(P[chin-3]==1)[0] if chin>=3 else []
    pts['menton']=[mx,chin];pts['machoire_g']=[int(row.min())+2 if len(row) else mx-8,chin-3];pts['machoire_d']=[int(row.max())-2 if len(row) else mx+8,chin-3]
    pts['cou_bas']=[mx,top]
    tr=np.where(P[top+2]>0)[0] if top+2<128 else []
    def bnd(p1,p2,m):
        mm=np.zeros_like(op)
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):mm|=(P==p1)&np.roll(np.roll(P==p2,dy,0),dx,1)
        mm&=m;yy,xx=np.where(mm)
        return [int(round(xx.mean())),int(round(yy.mean()))] if len(yy) else None
    def c(m):
        yy,xx=np.where(m);return [int(round(xx.mean())),int(round(yy.mean()))] if len(yy) else None
    b45=bnd(4,5,tor);b56=bnd(5,6,tor);s6=np.where(P==6)
    pts['poitrine_bas']=[mx,b45[1]] if b45 else [mx,top+7];pts['taille']=[mx,b56[1]] if b56 else [mx,top+11]
    pts['bassin']=[mx,int(np.percentile(s6[0],70))] if len(s6[0]) else [mx,top+17]
    X=np.arange(80)[None,:]
    for s,side in(('g',X<mx),('d',X>=mx)):
        m=side&np.isin(P,(7,8,9))
        if m.sum()>5:
            yy,xx=np.where(m&(P==7)) if (m&(P==7)).any() else np.where(m);i=np.argmin(yy)
            pts['epaule_'+s]=[int(xx[i]),int(yy[i])+1]
            pts['coude_'+s]=bnd(7,8,side) or c(m)
            pts['poignet_'+s]=bnd(8,9,side) or pts['coude_'+s]
            h=np.where(side&(P==9));
            if len(h[0]):
                d=(h[1]-pts['poignet_'+s][0])**2+(h[0]-pts['poignet_'+s][1])**2;i=np.argmax(d);pts['main_'+s]=[int(h[1][i]),int(h[0][i])]
            else:pts['main_'+s]=pts['poignet_'+s]
        m=side&np.isin(P,(10,11,12))
        if m.sum()>5:
            yy,xx=np.where(m);i=np.argmin(yy);pts['hanche_'+s]=[int(xx[i]),int(yy[i])]
            pts['genou_'+s]=bnd(10,11,side) or c(m)
            pts['cheville_'+s]=bnd(11,12,side) or pts['genou_'+s]
            ft=np.where(side&(P==12))
            if len(ft[0]):i=np.argmax(ft[0]);pts['orteils_'+s]=[int(ft[1][i]),int(ft[0][i])]
            else:pts['orteils_'+s]=pts['cheville_'+s]
    return pts
def proposer_cartes(ks,force=False):
    for k in ks:
        f=SQ+'/%s.json'%k
        if _o.path.exists(f) and not force:continue
        json.dump({'points':depuis_cartes(k),'cache':[],'objets':[],'notes':'proposé depuis les cartes du jeu — à contrôler','accepte':[]},open(f,'w'),ensure_ascii=False)
