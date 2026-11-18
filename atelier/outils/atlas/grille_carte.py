import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Vue agrandie avec grille : sprite et carte actuelle côte à côte, pour dessiner des retouches au pixel.
exec(open(A+'/atlas/construire.py').read().split("if __name__")[0])
exec(open(A+'/atlas/grille.py').read().split("if __name__")[0].replace("exec(open(A+'/atlas/commun.py').read())",""))
import sys
def gc(k,fn,s=9,box=None):
    lab,side,fg,info=construire(k);a=sprite(k);bx=box or boite(a,1)
    c=colorer(lab,a)
    grille(a,bx,'/tmp/_a.png',s);grille(c,bx,'/tmp/_b.png',s)
    A1=Image.open('/tmp/_a.png');B1=Image.open('/tmp/_b.png');T=Image.new('RGBA',(A1.width*2+8,A1.height),(255,255,255,255));T.paste(A1,(0,0));T.paste(B1,(A1.width+8,0));T.save(fn)
if __name__=='__main__':
    b=tuple(map(int,sys.argv[3:7])) if len(sys.argv)>6 else None
    gc(sys.argv[1],sys.argv[2],box=b)
