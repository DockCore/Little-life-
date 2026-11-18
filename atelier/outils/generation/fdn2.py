import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/fdn_gen.py').read())
# per frame: left edge, right edge (upper rows y<=88), right edge (lower rows), top, waist, sleeve box, exclusion box (keep white inside)
FP={0:dict(l=29,r1=44,r2=43,t=82,w=94,sl=(44,47,87,90)),
    1:dict(l=28,r1=44,r2=44,t=82,w=94,sl=(45,48,87,90)),
    2:dict(l=28,r1=44,r2=44,t=82,w=94),
    3:dict(l=28,r1=44,r2=44,t=82,w=94),
    4:dict(l=28,r1=45,r2=45,t=82,w=94),
    5:dict(l=28,r1=45,r2=44,t=82,w=94,sl=(45,48,86,89)),
    6:dict(l=28,r1=45,r2=44,t=82,w=94,ex=(36,46,78,90)),
    7:dict(l=28,r1=45,r2=44,t=82,w=94)}
def fdnh(k):
    i=int(k[-1]);p=FP[i];a,Cc=cls(k);z=Z(k);H,W=Cc.shape;op=a[...,3]>0;dark=Cc=='#'
    m=np.zeros((H,W),bool)
    for y in range(p['t'],p['w']+1):
        r=p['r1'] if y<=88 else p['r2']
        for x in range(p['l'],r+1):m[y,x]=op[y,x]
    if 'sl' in p:
        x0,x1,y0,y1=p['sl'];m[y0:y1+1,x0:x1+1]|=op[y0:y1+1,x0:x1+1]
    hair=(z==2)&(Cc!='w');hair[88:]=False
    m&=~hair
    if 'ex' in p:
        x0,x1,y0,y1=p['ex']
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                if Cc[y,x]!='w':m[y,x]=0
    # keep the shirt in one clean piece
    lab,n=label(m)
    if n>1:
        sz=[(lab==j).sum() for j in range(1,n+1)];m=lab==(1+int(np.argmax(sz)))
    o=np.zeros_like(m)
    for y in range(1,H-1):
        for x in range(1,W-1):
            if not m[y,x]:continue
            for dy,dx in N4:
                n_=(y+dy,x+dx)
                if not m[n_] and not dark[n_]:o[y,x]=1
            if dark[y,x] and any(not op[y+dy,x+dx] or not m[y+dy,x+dx] for dy,dx in N4):o[y,x]=1
    t=shade(m,o)
    for y in range(H):
        for x in range(W):
            if m[y,x] and not o[y,x] and dark[y,x]:t[y,x,:3]=F
    return t,a
