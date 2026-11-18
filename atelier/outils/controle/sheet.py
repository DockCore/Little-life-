import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/gen.py').read())
from PIL import Image
import sys
FR_M=['idle','wave','drink']+['w%d'%i for i in range(4)]+['r%d'%i for i in range(4)]+['wf%d'%i for i in range(8)]+['wb%d'%i for i in range(8)]+['dn%d'%i for i in range(8)]+['wc0','wc1','dk0','dk1']+['cu%d'%i for i in range(4)]+['bk%d'%i for i in range(8)]+['v_front','v_q','v_side','v_back']
FR_F=['F_'+k for k in ['idle','wave','drink']+['w%d'%i for i in range(4)]+['r%d'%i for i in range(4)]+['dn%d'%i for i in range(8)]+['wc0','wc1','dk0','dk1']+['cu%d'%i for i in range(4)]+['bk%d'%i for i in range(6)]+['v_front','v_q','v_side','v_back']]
def sheet(ks,fn,per=10,s=3,y0=40,y1=118,g=None):
    g=g or (lambda k:gen(k))
    rows=(len(ks)+per-1)//per;h=y1-y0
    im=Image.new('RGBA',(per*82*2,rows*(h+2)),(120,160,130,255))
    for i,k in enumerate(ks):
        t,a=g(k);a=a.astype(np.uint8);r,c=divmod(i,per)
        im.alpha_composite(Image.fromarray(a[y0:y1]),(c*164,r*(h+2)));im.alpha_composite(Image.fromarray(comp(a,t)[y0:y1]),(c*164+80,r*(h+2)))
    im.resize((im.width*s,im.height*s),Image.NEAREST).save(fn)
