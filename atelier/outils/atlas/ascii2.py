import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Plusieurs images côte à côte en texte (même cadre), pour annoter une animation.
exec(open(A+'/atlas/ascii.py').read().split("if __name__")[0])
def rows(k,y0,y1,x0,x1):
    a=sprite(k).astype(int);z=zones(k);lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];out=[]
    for y in range(y0,y1):
        r=''
        for x in range(x0,x1):
            if a[y,x,3]==0:r+=' '
            elif lum[y,x]<60:r+='#'
            elif z[y,x]==2:r+='h'
            elif z[y,x]==1:r+='.'
            else:
                R,G,B=a[y,x,:3];r+='w' if (R>170 and G>170 and B>160) else 'o'
        out.append(r)
    return out
if __name__=='__main__':
    import sys
    y0,y1,x0,x1=map(int,sys.argv[1:5]);ks=sys.argv[5:]
    R=[rows(k,y0,y1,x0,x1) for k in ks]
    hdr=''.join(str((x//10)%10) for x in range(x0,x1));hdr2=''.join(str(x%10) for x in range(x0,x1))
    print('    '+'  '.join(k.ljust(x1-x0) for k in ks));print('    '+'  '.join(hdr for k in ks));print('    '+'  '.join(hdr2 for k in ks))
    for i,y in enumerate(range(y0,y1)):print('%3d '%y+'  '.join(r[i] for r in R))
