import numpy as np
from PIL import Image
from scipy import ndimage as nd
from seg import im,COLS,ROWS,hsv
def mask_cell(c,fem):
    h,s,v=hsv(c);r,g,b=c[...,0],c[...,1],c[...,2]
    hair=(h>8)&(h<34)&(s>.42)&(v>.22)&(v<.78)
    skin=(h>8)&(h<36)&(s>.27)&(s<.62)&(v>.7)
    white=(s<.1)&(v>.78)
    darkw=(v<.36)&(r>=b-3)           # sombre, pas le fond bleuté
    pants=nd.binary_opening(darkw,np.ones((4,4)))
    jeans=(h>195)&(h<235)&(s>.25)&(v>.42)&(v<.9) if fem else np.zeros_like(hair)
    core=hair|skin|white|pants|jeans
    big=nd.binary_dilation(core,iterations=2)
    lab,n=nd.label(big,np.ones((3,3)))
    hl,hn=nd.label(hair);sizes=nd.sum(hair,hl,range(1,hn+1));hb=hl==(1+int(np.argmax(sizes)))
    keep=np.isin(lab,np.unique(lab[hb&(lab>0)]))
    m=core&keep
    # retirer les petits bouts isolés (franges du plaid, reflets)
    l2,n2=nd.label(m,np.ones((3,3)));sz=nd.sum(m,l2,range(1,n2+1))
    m=np.isin(l2,1+np.where(sz>=25)[0])
    dark=(v<.42)&(r>=b-8)
    m=m|(dark&nd.binary_dilation(m,iterations=2))
    hol=nd.binary_fill_holes(m)&~m;hl2,hn2=nd.label(hol);hs=nd.sum(hol,hl2,range(1,hn2+1));m=m|np.isin(hl2,1+np.where(hs<90)[0])
    l3,n3=nd.label(m,np.ones((3,3)));sz3=nd.sum(m,l3,range(1,n3+1));m=l3==(1+int(np.argmax(sz3)))
    return m,dict(hair=hair,skin=skin,white=white,pants=pants,jeans=jeans)
if __name__=='__main__':
    rows=[]
    for rk,(y0,y1) in ROWS.items():
        row=[]
        for (x0,x1) in COLS:
            c=im[y0:y1,x0:x1];m,_=mask_cell(c,rk[0]=='F')
            o=np.zeros(c.shape,np.uint8);o[...]=[255,0,255];o[m]=c[m]
            row.append(o)
        rows.append(np.concatenate(row,1))
    Image.fromarray(np.concatenate(rows,0)).save('mask.png')
