import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/z.py').read())
exec(open(A+'/generation/gen.py').read().split("def vtype")[0])
def sofa(k):
    a=img(SPA[k]).astype(int);z=Z(k);H,W=128,80
    lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2]
    m=(z==3)&(a[...,3]>0)
    v=lum[m&(lum>=56)]
    q1,q2,q3=np.percentile(v,[12,40,75]) if len(v) else (0,0,0)
    t=np.zeros((H,W,4),np.uint8)
    for y,x in zip(*np.where(m)):
        l=lum[y,x]
        c=OUT if l<56 else F if l<q1 else S if l<q2 else B if l<q3 else L
        t[y,x,:3]=c;t[y,x,3]=255
    return t,a
