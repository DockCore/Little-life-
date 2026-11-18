import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Liste, ligne par ligne, les segments opaques (x début-fin), avec les contours sombres séparateurs : aide à l'annotation exacte.
exec(open(A+'/atlas/commun.py').read())
import sys
def runs(k,y0,y1,interieur=False):
    a=sprite(k).astype(int);op=a[...,3]>0;lum=.3*a[...,0]+.59*a[...,1]+.11*a[...,2];m=op&(lum>=60) if interieur else op
    for y in range(y0,y1):
        r=[];x=0
        while x<80:
            if m[y,x]:
                s=x
                while x<80 and m[y,x]:x+=1
                r.append('%d-%d'%(s,x-1))
            else:x+=1
        print(y,' '.join(r))
if __name__=='__main__':
    runs(sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),'-i' in sys.argv)
