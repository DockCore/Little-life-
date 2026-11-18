import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Atlas du corps, version 2 : cartes reconstruites à partir des sprites et des squelettes contrôlés.
# Les sprites et les cartes du jeu ne sont jamais modifiés (lecture seule).
# Sorties : atlas/cartes/<image>.png (partie du corps), atlas/cotes/<image>.png (0 centre, 120 = côté gauche de l'écran
#           ou membre éloigné en profil, 240 = côté droit de l'écran ou membre proche), atlas/premier_plan/<image>.png, atlas/atlas.json.
# Les contrôles automatiques SIGNALENT ; une image n'est CONFORME que sans alerte ET après contrôle visuel enregistré.
exec(open(A+'/atlas/decoupe.py').read())
import json,statistics
from scipy.ndimage import label as _lab
D=A+'/../atlas'
SEQ=[['idle'],['wave'],['drink'],['w0','w1','w2','w3'],['r0','r1','r2','r3'],['wf%d'%i for i in range(8)],['wb%d'%i for i in range(8)],['dn%d'%i for i in range(8)],
     ['wc0','wc1'],['dk0','dk1'],['cu%d'%i for i in range(4)],['bk%d'%i for i in range(8)],['v_front'],['v_q'],['v_side'],['v_back'],
     ['cs0','cs1','cs2','cs3'],['cn0','cn1','cn2','cn3']]
SEQ+= [['F_'+k for k in s] for s in SEQ if not s[0].startswith(('wf','wb'))]
SEQ=[[k for k in s if k in IMAGES] for s in SEQ];SEQ=[s for s in SEQ if s]
def famille(k):
    b=k[2:] if k.startswith('F_') else k
    if b in('idle','wave','drink','v_front') or b[:2] in('wf','wc','cu'):return 'face'
    if b=='v_back' or b[:2] in('wb','dk'):return 'dos'
    if b=='v_q':return 'trois-quarts'
    if b[:2]=='cs':return 'canape-assis'
    if b[:2]=='cn':return 'canape-allonge'
    if b[:2]=='dn':return 'assis-table'
    return 'profil'
def nettoyer(lab,op,side):
    n=0
    for it in range(3):
        ch=False
        for q in range(1,15):
            l,nl=_lab(lab==q,np.ones((3,3)))
            for i in range(1,nl+1):
                m=l==i
                if m.sum()<3:
                    ys,xs=np.where(m);v=[]
                    for y,x in zip(ys,xs):
                        for dy in(-1,0,1):
                            for dx in(-1,0,1):
                                Y,X=y+dy,x+dx
                                if 0<=Y<128 and 0<=X<80 and op[Y,X] and lab[Y,X]!=q:v.append((lab[Y,X],side[Y,X]))
                    if v:b=max(set(v),key=v.count);lab[m]=b[0];side[m]=b[1];n+=int(m.sum());ch=True
        if not ch:break
    return n
def cote_nom(k,s):
    f=famille(k)
    if f in('face','dos'):return 'gauche écran' if s=='g' else 'droite écran'
    return 'éloigné' if s=='g' else 'proche'
def construire(k):
    S=charger(k);p=S['points'];a=sprite(k);op=a[...,3]>0;lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2]
    lab,side,obj=decouper(k,p);n_isl=nettoyer(lab,op,side)
    if p.get('menton'):
        z_=zones(k);sm=sous_machoire(p);b1=np.zeros_like(sm);b1[1:]=sm[:-1]
        hz=op&(z_==2)
        if S.get('cheveux_zone'):
            x0,y0,x1,y1=S['cheveux_zone'];hb=np.zeros_like(op);hb[y0:y1+1,x0:x1+1]=1;hz&=(hb|~sm)
        bad=(lab==1)&b1&~hz
        A_=a.astype(int);skin=(A_[...,0]-A_[...,2]>35)|(lum<60)
        lab[bad&skin]=2;lab[bad&~skin]=13
    # retouches à la main : polygones (partie, côté) appliqués aux pixels opaques du sprite, dans l'ordre
    from matplotlib.path import Path as _P
    YY,XX=np.mgrid[0:128,0:80];pts_=np.c_[XX.ravel()+.5,YY.ravel()+.5]
    for r in S.get('retouches',[]):
        m=_P([(x+.5,y+.5) for x,y in r['poly']]).contains_points(pts_,radius=0.6).reshape(128,80)&op
        if 'seulement' in r:m&=np.isin(lab,r['seulement'])
        lab[m]=r['partie'];side[m]=r.get('cote',0)
    side[~np.isin(lab,(7,8,9,10,11,12))]=0
    fg=np.zeros_like(op);tr=np.isin(lab,(3,4,5,6))
    for y in range(128):
        xs=np.where(tr[y])[0]
        if len(xs):
            m=np.zeros(80,bool);m[xs.min():xs.max()+1]=True
            fg[y]=m&np.isin(lab[y],(7,8,9,13,14))
    al=[]
    if (op&(lab==0)).any():al.append('pixels non attribués : %d'%int((op&(lab==0)).sum()))
    if (~op&(lab>0)).any():al.append('débordement hors silhouette : %d'%int((~op&(lab>0)).sum()))
    cache=set(S.get('cache',[]))
    lim=np.isin(lab,(7,8,9,10,11,12))
    if (lim&(side==0)).any():al.append('membre sans côté gauche/droite : %d px'%int((lim&(side==0)).sum()))
    eps=[p[e][1] for e in('epaule_g','epaule_d') if p.get(e)]
    if eps and ((lab==1)&(np.arange(128)[:,None]>=max(eps))).any():al.append('tête sous la ligne des épaules : %d px'%int(((lab==1)&(np.arange(128)[:,None]>=max(eps))).sum()))
    if (op&(lab==1)).sum() and p.get('menton'):
        sm=sous_machoire(p);b1=np.zeros_like(sm);b1[1:]=sm[:-1];bad=(lab==1)&b1&~(op&(zones(k)==2))
        if bad.sum()>0:al.append('tête sous la mâchoire : %d px'%int(bad.sum()))
    if (lab==1).sum()<20:al.append('tête absente')
    if famille(k)!='dos' and (lab==2).sum()<3 and 'cou' not in cache:al.append('cou absent')
    for s,sd in(('g',1),('d',2)):
        for parts,noms,pt in(((7,8,9),('bras','avant-bras','main'),'main_'),((10,11,12),('cuisse','mollet','pied'),'orteils_')):
            if not p.get(pt+s):continue
            if pt=='main_' and 'bras_'+s in cache:continue
            for q,nm in zip(parts,noms):
                if nm in cache or ('%s_%s'%(nm,s)) in cache:continue
                c=int(((lab==q)&(side==sd)).sum())
                if c<3:al.append('%s %s incomplet : %d px'%(nm,cote_nom(k,s),c))
    for s in('g','d'):
        if not p.get('main_'+s) and 'bras_'+s not in cache:al.append('bras %s non annoté'%cote_nom(k,s))
        if not p.get('orteils_'+s) and 'jambe_'+s not in cache:al.append('jambe %s non annotée'%cote_nom(k,s))
    inter=op&(lum>=60);arm=np.isin(lab,(7,8))&inter;tor=np.isin(lab,(3,4,5,6))&inter;fus=0
    for y,x in zip(*np.where(arm)):
        if any(0<=y+dy<128 and 0<=x+dx<80 and tor[y+dy,x+dx] for dy,dx in((0,1),(0,-1),(1,0),(-1,0))):
            if all(np.hypot(x-p[e][0],y-p[e][1])>6 for e in('epaule_g','epaule_d') if p.get(e)):fus+=1
    if fus>25 and 'bras_torse' not in S.get('accepte',[]):al.append('bras touchant le torse sans contour dessiné : %d px (à vérifier à l’œil)'%fus)
    info={'famille':famille(k),'genre':'femme' if k.startswith('F_') else 'homme','reperes':p,'cache':sorted(cache),
          'surfaces':{PARTIES[q]:int((lab==q).sum()) for q in range(1,15)},'ilots_fusionnes':n_isl,'alertes':al,
          'controle_visuel':S.get('controle_visuel',''),'notes':S.get('notes','')}
    return lab,side,fg,info
def ecrire(res):
    for sub in('cartes','cotes','premier_plan'):_o.makedirs(D+'/'+sub,exist_ok=True)
    pal=[];[pal.extend(COUL[i]) for i in range(15)];pal+=[0]*(768-len(pal))
    for k,(lab,side,fg,info) in res.items():
        im=Image.fromarray(lab.astype(np.uint8),'P');im.putpalette(pal);im.save(D+'/cartes/%s.png'%k,transparency=0)
        Image.fromarray(side.astype(np.uint8)*120,'L').save(D+'/cotes/%s.png'%k)
        Image.fromarray((fg*255).astype(np.uint8),'L').convert('1').save(D+'/premier_plan/%s.png'%k)
def controles_globaux(res):
    fam={}
    for k,(lab,_,_,info) in res.items():
        ys=np.where((lab>0)&(lab!=13))[0];hy=np.where(lab==1)[0]
        info['tete_%']=round(100*(hy.max()-hy.min()+1)/(ys.max()-ys.min()+1)) if len(hy) else 0
        fam.setdefault(info['famille'],[]).append(info['tete_%'])
    for k,(lab,_,_,info) in res.items():
        med=statistics.median(fam[info['famille']])
        if abs(info['tete_%']-med)>7 and 'tete' not in info['cache']:info['alertes'].append('hauteur de tête anormale : %d %% du corps (famille : %d %%)'%(info['tete_%'],med))
    for s in SEQ:
        s=[k for k in s if k in res]
        for k1,k2 in zip(s,s[1:]):
            i1,i2=res[k1][3],res[k2][3]
            for nm,v1 in i1['surfaces'].items():
                v2=i2['surfaces'][nm]
                if max(v1,v2)>=25 and min(v1,v2)<0.55*max(v1,v2):i2['alertes'].append('%s : %d px contre %d px sur %s (écart anormal)'%(nm,v2,v1,k1))
            for n,q in i1['reperes'].items():
                q2=i2['reperes'].get(n)
                if q2 and np.hypot(q[0]-q2[0],q[1]-q2[1])>9:i2['alertes'].append('repère %s : saut de %.0f px depuis %s'%(n,np.hypot(q[0]-q2[0],q[1]-q2[1]),k1))
    for k,(lab,_,_,info) in res.items():
        S=charger(k)
        if S.get('temporel_verifie'):
            t=[x for x in info['alertes'] if 'écart anormal' in x or x.startswith('repère')]
            info['alertes']=[x for x in info['alertes'] if x not in t]
            info['changements_de_pose_verifies']=t
        if S.get('non_conforme'):info['alertes'].append('contrôle visuel : '+S['non_conforme'])
        info['etat']='CONFORME' if (not info['alertes'] and info['controle_visuel']) else 'NON CONFORME'
if __name__=='__main__':
    import sys
    ks=[k for k in IMAGES if _o.path.exists(SQ+'/%s.json'%k)]
    res={k:construire(k) for k in ks};controles_globaux(res);ecrire(res)
    out={k:res[k][3] for k in ks}
    for k in IMAGES:
        if k not in out:out[k]={'famille':famille(k),'etat':'NON CONFORME','alertes':['squelette non annoté']}
    json.dump(out,open(D+'/atlas.json','w'),ensure_ascii=False,indent=1)
    nc=sum(1 for v in out.values() if v['etat']=='CONFORME');print('images : %d ; squelettes : %d ; CONFORMES : %d'%(len(out),len(ks),nc))
    if '-v' in sys.argv:
        for k in ks:
            if out[k]['alertes']:print(k,'|',' ; '.join(out[k]['alertes']))
