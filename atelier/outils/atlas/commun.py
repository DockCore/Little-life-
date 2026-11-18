import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Outils communs de l'atlas du corps : liste des 112 images habillées, couleurs des parties, lecture des cartes du jeu.
exec(open(A+'/analyse/mesures.py').read().split("out={}")[0])
import numpy as np
from PIL import Image, ImageDraw, ImageFont
FONTE=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14) if _o.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else ImageFont.load_default()
PARTIES={0:'vide',1:'tête',2:'cou',3:'épaules',4:'poitrine',5:'ventre',6:'hanches',7:'bras',8:'avant-bras',9:'mains',10:'cuisses',11:'mollets',12:'pieds',13:'objet / non étiqueté'}
COUL={0:(0,0,0),1:(242,193,78),2:(247,129,84),3:(179,63,98),4:(230,57,70),5:(255,143,171),6:(157,78,221),7:(67,97,238),8:(76,201,240),9:(6,214,160),10:(42,157,143),11:(138,177,125),12:(109,76,65),13:(150,150,165)}
_M=['idle','wave','drink']+['w%d'%i for i in range(4)]+['r%d'%i for i in range(4)]+['wf%d'%i for i in range(8)]+['wb%d'%i for i in range(8)]+['dn%d'%i for i in range(8)]+['wc0','wc1','dk0','dk1']+['cu%d'%i for i in range(4)]+['bk%d'%i for i in range(8)]+['v_front','v_q','v_side','v_back']
_F=['idle','wave','drink']+['w%d'%i for i in range(4)]+['r%d'%i for i in range(4)]+['dn%d'%i for i in range(8)]+['wc0','wc1','dk0','dk1']+['cu%d'%i for i in range(4)]+['bk%d'%i for i in range(6)]+['v_front','v_q','v_side','v_back']
_S=['cs0','cs1','cs2','cs3','cn0','cn1','cn2','cn3']
IMAGES=_M+['F_'+k for k in _F]+_S+['F_'+k for k in _S]
def sprite(k):return img(SPA[k])
def carte_jeu(k):
    f=img(SPF[k]);a=sprite(k);P=np.round(f[...,0]/16).astype(int);P[a[...,3]==0]=0
    return P,np.round(f[...,1]/80).astype(int),np.round(f[...,2]/16).astype(int)
def colorer(P,a=None):
    o=np.zeros(P.shape+(4,),np.uint8)
    for k,c in COUL.items():
        if k:o[P==k,:3]=c;o[P==k,3]=255
    if a is not None:  # ombre du sprite pour garder la lecture des formes
        lum=(.3*a[...,0]+.59*a[...,1]+.11*a[...,2])/255.
        o[...,:3]=(o[...,:3]*(0.55+0.45*lum[...,None])).astype(np.uint8)
    return o
def boite(a,m=3):
    ys,xs=np.where(a[...,3]>0);return max(0,xs.min()-m),max(0,ys.min()-m),min(80,xs.max()+m+1),min(128,ys.max()+m+1)
