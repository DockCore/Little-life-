import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+"/atlas/grille_carte.py").read().split("if __name__==")[0])
import sys
def gcs(ks,fn,box,s=6):
    ims=[]
    for k in ks:gc(k,'/tmp/_c.png',s=s,box=box);im=Image.open('/tmp/_c.png').copy();ImageDraw.Draw(im).text((40,0),k,fill=(0,0,255));ims.append(im)
    W=max(i.width for i in ims);H=sum(i.height+6 for i in ims);IM=Image.new('RGBA',(W,H),(255,255,255,255));y=0
    for i in ims:IM.paste(i,(0,y));y+=i.height+6
    IM.save(fn)
if __name__=='__main__':gcs(sys.argv[6:],sys.argv[1],tuple(map(int,sys.argv[2:6])))
