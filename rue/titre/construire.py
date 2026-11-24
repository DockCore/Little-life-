# Reconstruit le bloc HTML de l'écran titre dans rue/index.orig.html à partir des images de rue/titre/
# (composition verticale + composition horizontale, boutons découpés au pixel près dans chaque illustration)
import base64,os
D=os.path.dirname(os.path.abspath(__file__));P=os.path.join(D,'..','index.orig.html')
d=lambda f:'data:image/webp;base64,'+base64.b64encode(open(os.path.join(D,f),'rb').read()).decode()
s=open(P,encoding='utf8').read()
i=s.index('<div id="tscr"');end='<div class="tmsg" id="tMsg" role="status" aria-live="polite"></div></div>';j=s.index(end,i)+len(end)
def btn(bid,label,k):
    return (f'<button class="tbtn" id="{bid}" type="button" aria-label="{label}" style="--silP:url({d("sil_"+k+".webp")});--silL:url({d("Lsil_"+k+".webp")})">'
            f'<i class="tsock"></i><span class="tface"><img class="tp" src="{d("btn_"+k+".webp")}" alt="" draggable="false"><img class="tl" src="{d("Lbtn_"+k+".webp")}" alt="" draggable="false"><i class="tshine"></i></span></button>')
new=('<div id="tscr" class="tscr"><div class="tbd" aria-hidden="true"></div><div class="tmir tmirL" aria-hidden="true"></div><div class="tmir tmirR" aria-hidden="true"></div>'
     f'<div class="tbox"><img class="tart tp" src="{d("fond.webp")}" alt="Little Life" draggable="false"><img class="tart tl" src="{d("fond_paysage.webp")}" alt="Little Life" draggable="false">'
     +btn('tNew','Nouvelle partie','new')+btn('tCont','Continuer','cont')+'</div>'+end)
s=s[:i]+new+s[j:];open(P,'w',encoding='utf8').write(s);print('écran titre reconstruit',len(new))
