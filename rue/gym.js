// ===== SALLE DE SPORT : nouvel intérieur (5 zones), machines, sportifs PNJ =====
// Cardio (tapis, vélos, rameurs) · Musculation (haltères, banc de développé, poulie, disques) · Boxe (sacs, ring)
// · Étirements (estrade, tapis, rouleaux) · Accueil et services (comptoir, casiers, fontaine, bar à smoothies, tableau des records).
// Utilise le moteur des lieux du jeu (PLACES / PLD / placeBG / drawWorld / findPath) et les images existantes du personnage.
(function(){
const isG=()=>place=='gym';
const INK='#15181d',STEEL='#c9d1da',DARK='#23272e',DARK2='#2f343c',CY='#3fe0ff',MAG='#ff4fa3',LIME='#9be84a',ORA='#ff9a3a',WOOD='#b07a4a',WOODL='#c99462';
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
// ---------- plan de la salle ----------
const F=[
 // cardio : le long du mur du fond, sous les grandes fenêtres
 {n:'GTapis',x:1.8,y:.8,w:2,h:1,s:1,id:'run0'},{n:'GTapis',x:5.8,y:.8,w:2,h:1,s:1,id:'run1'},
 {n:'GVelo',x:9.6,y:1,w:1,h:1,s:1,id:'bike0'},{n:'GVelo',x:11.6,y:1,w:1,h:1,s:1,id:'bike1'},
 {n:'GRower',x:13.8,y:1.05,w:2.5,h:.8,s:1,id:'row0'},{n:'GRower',x:16.9,y:1.05,w:2.5,h:.8,s:1,id:'row1'},
 // musculation : miroirs au mur gauche, rack d'haltères, banc, poulie, disques
 {n:'GRack',x:.2,y:5,w:.9,h:3.2,s:1},{n:'GBench',x:4.2,y:5.6,w:1.5,h:2.4,s:1,id:'bench0'},{n:'GCable',x:9.4,y:7.4,w:1.6,h:1.1,s:1},{n:'GPlates',x:7.2,y:5.4,w:1.6,h:.8,s:1},
 // boxe : ring au sol, deux sacs, matériel
 {n:'GSac',x:13.6,y:6.6,w:.8,h:.8,s:1,id:'sac0'},{n:'GSac',x:16.4,y:6.6,w:.8,h:.8,s:1,id:'sac1'},{n:'GBoxRack',x:19,y:5.2,w:.75,h:1.8,s:1},
 // étirements : rouleaux et ballon
 {n:'GRoll',x:18.9,y:17.6,w:.9,h:.9,s:1},{n:'GBall',x:11.2,y:17.9,w:.8,h:.8,s:1},
 // repos
 {n:'GBancR',x:7.2,y:16.9,w:2.6,h:.7,s:1,id:'rest'},
 // accueil et services
 {n:'GBar',x:.2,y:1.3,w:1,h:3,s:1},{n:'Fontaine',x:.25,y:4.3,w:.6,h:.6,r:0,s:1},{n:'GBoard',x:.12,y:8.6,w:.35,h:1.7,s:1},{n:'GDesk',x:1.3,y:10.6,w:1.3,h:2.4,s:1},{n:'GLock',x:.15,y:16.8,w:.7,h:3,s:1},
 {n:'Plante',x:19,y:11.4,w:.9,h:.9,r:0,s:1},{n:'Plante',x:19,y:19,w:.9,h:.9,r:0,s:1},{n:'Plante',x:10.6,y:5.2,w:.9,h:.9,r:0,s:1}];
PLACES.gym={nom:'la salle de sport',titre:'Salle de sport',rn:20,wall:'#9aa0a7',door:'#2b3038',floor:'tile',fa:'#3a3e45',fb:'#353940',furn:F.slice()};
VT.gym='Salle de sport';
const FB=id=>F.find(f=>f.id==id);
// ---------- postes : où l'on se place pour chaque activité ----------
const ST=[];
const addS=(o)=>{ST.push(Object.assign({who:null,res:null},o))};
['run0','run1'].forEach(id=>{const f=FB(id);addS({id,k:'run',f,pos:[f.x+f.w/2,f.y+f.h/2],ap:[f.x+f.w/2,f.y+f.h+.9]})});
['bike0','bike1'].forEach(id=>{const f=FB(id);addS({id,k:'bike',f,pos:[f.x+.6,f.y+.12],ap:[f.x+.5,f.y+f.h+.9]})});
['row0','row1'].forEach(id=>{const f=FB(id);addS({id,k:'row',f,pos:[f.x+.9,f.y+f.h/2],ap:[f.x+.9,f.y+f.h+.9],seat:1})});
addS({id:'lift0',k:'lift',pos:[2.1,5.3],ap:[2.1,5.3]});addS({id:'lift1',k:'lift',pos:[2.4,8.1],ap:[2.4,8.1]});
{const f=FB('bench0');addS({id:'bench0',k:'bench',f,pos:[f.x+.45,f.y+f.h/2],ap:[f.x+f.w/2+.2,f.y+f.h+.8],seat:1})}
{const f=F.find(o=>o.n=='GCable');addS({id:'cable',k:'cable',f,pos:[f.x+f.w/2,f.y+f.h+.75],ap:[f.x+f.w/2,f.y+f.h+.75]})}
['sac0','sac1'].forEach(id=>{const f=FB(id);addS({id,k:'box',f,pos:[f.x+f.w/2-1.25,f.y+f.h/2+1.25],ap:[f.x+f.w/2-1.25,f.y+f.h/2+1.25]})});
[[12.9,15.3],[15.3,15.3],[17.7,15.3]].forEach((p,i)=>addS({id:'mat'+i,k:'stretch',pos:p,ap:p,mat:i}));
{const f=FB('rest');[0,1].forEach(i=>addS({id:'rest'+i,k:'rest',f,pos:[f.x+.65+i*1.3,f.y+.35],ap:[f.x+.65+i*1.3,f.y+f.h+.8],seat:1}))}
addS({id:'fontaine',k:'chat',pos:[1.6,4.9],ap:[1.6,4.9]});addS({id:'fontaine2',k:'chat',pos:[2.6,4.3],ap:[2.6,4.3]});
const STB=id=>ST.find(s=>s.id==id);
// ---------- sportifs (PNJ) ----------
const LOOKS=[
 {g:'f',sk:1,hc:2,wd:{cheveux:'top|2',haut:'tank|3',bas:'legging|0',chaussures:'running|1'}},       // Léa, coureuse
 {g:'m',sk:6,hc:1,wd:{cheveux:'nat|1',haut:'tank|0',bas:'short|1',chaussures:'basket|0'}},          // Malik, boxeur
 {g:'f',sk:3,hc:5,wd:{cheveux:'bun|5',haut:'tee|4',bas:'short|2',chaussures:'running|0'}},          // Inès, cycliste
 {g:'m',sk:2,hc:0,wd:{cheveux:'nat|0',haut:'tank|1',bas:'jog|0',chaussures:'basket|2'}},            // Hugo, musculation
 {g:'f',sk:5,hc:1,wd:{cheveux:'long|1',haut:'tee|2',bas:'legging|2',chaussures:'basket|1',tete:'bandeau|0'}},// Zoé, yoga
 {g:'m',sk:4,hc:2,wd:{cheveux:'nat|2',haut:'polo|0',bas:'jog|1',chaussures:'running|2'}}];          // Sam, coach (accueil)
const NPCS=[
 {i:0,nom:'Léa',role:'Coureuse',acts:['run','run','bike','stretch'],defi:'run'},
 {i:1,nom:'Malik',role:'Boxeur',acts:['box','box','lift','rest'],defi:'box'},
 {i:2,nom:'Inès',role:'Cycliste',acts:['bike','bike','row','stretch'],defi:'bike'},
 {i:3,nom:'Hugo',role:'Musculation',acts:['lift','cable','bench','lift'],defi:'lift'},
 {i:4,nom:'Zoé',role:'Yoga et étirements',acts:['stretch','stretch','row','rest'],defi:'stretch'},
 {i:5,nom:'Sam',role:'Coach (accueil)',acts:[],defi:'bench',coach:1}];
const NCC=new Map();let prepQ=[];
function nLook(i){const B=Object.assign({},N.look);delete B.nu;delete B.lf;return Object.assign(B,LOOKS[i],{wd:Object.assign({},LOOKS[i].wd)})}
const nImg=(i,nm)=>{const c=NCC.get(i+'|'+nm);if(!c&&!prepQ.some(q=>q[0]==i&&q[1]==nm))prepQ.push([i,nm]);return c};
function prepTick(n){let did=false;while(n-->0&&prepQ.length){const[i,nm]=prepQ.shift();const k=i+'|'+nm;if(NCC.has(k))continue;try{if(drawFrame(nm,nLook(i))){const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);NCC.set(k,c);did=true}}catch(e){}}if(did)spKey=''}
const isF=i=>i<0?N.look.g=='f':LOOKS[i].g=='f';
// ---------- positions des mains (images « haltères » cu) pour les gants de boxe ----------
const HANDS={m:[[28,106],[50,106],[28,97],[50,97]],f:[[28,104],[58,104],[28,95],[58,95]]};
// ---------- dessin ----------
const P=(u,v,z)=>{const p=P3(u,v,z||0);return[Math.round(p[0]),Math.round(p[1])]};
function R(X,Y,x,y,w,h,c){G.fillStyle=c;G.fillRect(X+x,Y+y,w,h)}
function seatDraw(img,u,v,z,fl,a){if(!img)return;const p=P(u,v,z),AX=29,AY=100;G.save();if(a!=null)G.globalAlpha=a;if(fl){G.translate(p[0],0);G.scale(-1,1);G.drawImage(img,-AX,p[1]-AY)}else G.drawImage(img,p[0]-AX,p[1]-AY);G.restore()}
const whoImg=(s)=>{const w=s.who;if(!w)return null;if(w.me)return/^dn\d/.test(spName)?sc2:null;return nImg(w.i,w.fr||'dn0')};
// tapis de course (profil, sens de la course vers la droite) ; la bande défile quand quelqu'un court
function gTapis(f){fshadow(f);const s=ST.find(o=>o.f===f),p=P(s.pos[0],s.pos[1]),X=p[0],Y=p[1],on=!!s.who,sp=s.who?(s.who.me?GYM.speed():1):0;
 R(X,Y,25,-46,4,46,INK);R(X,Y,26,-45,2,44,STEEL);R(X,Y,15,-44,13,4,INK);R(X,Y,16,-43,11,2,'#3a414c');
 R(X,Y,25,-58,12,13,INK);R(X,Y,26,-57,10,11,'#2b3038');R(X,Y,27,-56,8,6,'#0c1a24');R(X,Y,28,-55,6,2,on?LIME:CY);if(on){R(X,Y,28,-52,Math.round(6*Math.min(1,sp)),1,ORA)}
 R(X,Y,-28,-1,58,7,INK);R(X,Y,-27,0,56,5,'#3a414c');R(X,Y,-27,1,56,1,f.id=='run0'?CY:MAG);R(X,Y,-27,4,56,1,'#2b3038');
 R(X,Y,-26,-2,53,2,'#1d2026');const off=on?Math.floor(tick*Math.max(.3,sp)/2)%8:0;G.fillStyle='#5a606a';for(let k=-25+((8-off)%8);k<26;k+=8)G.fillRect(X+k,Y-2,3,1);
 R(X,Y,-30,-2,4,7,INK);R(X,Y,-29,-1,2,5,'#8a96a6');R(X,Y,27,-2,4,7,INK);R(X,Y,28,-1,2,5,'#8a96a6');R(X,Y,-25,6,4,2,INK);R(X,Y,23,6,4,2,INK)}
// vélo d'appartement (l'image du personnage masculin contient déjà le vélo : on ne le redessine pas dessous)
function gVelo(f){fshadow(f);const s=ST.find(o=>o.f===f),w=s.who;if(w&&!isF(w.me?-1:w.i))return;const p=P(f.x+.6,f.y+(w?.12:.12)),X=p[0],Y=p[1],on=!!w;
 R(X,Y,-17,-3,36,4,INK);R(X,Y,-16,-2,34,2,'#3a414c');R(X,Y,-16,-3,34,1,'#5a606a');
 R(X,Y,3,-21,14,14,INK);R(X,Y,4,-20,12,12,f.id=='bike0'?'#1f6f8b':'#8b1f5a');R(X,Y,5,-19,10,3,f.id=='bike0'?CY:MAG);R(X,Y,8,-16,4,4,STEEL);
 R(X,Y,-11,-28,4,26,INK);R(X,Y,-10,-27,2,25,STEEL);R(X,Y,-17,-32,13,5,INK);R(X,Y,-16,-31,11,3,'#2b3038');R(X,Y,-16,-31,11,1,'#4a525e');
 R(X,Y,14,-36,4,34,INK);R(X,Y,15,-35,2,32,STEEL);R(X,Y,10,-38,13,4,INK);R(X,Y,11,-37,11,2,'#2b3038');R(X,Y,20,-40,3,4,INK);
 R(X,Y,12,-43,9,7,INK);R(X,Y,13,-42,7,5,'#0c1a24');R(X,Y,14,-41,5,2,on?LIME:CY);
 const a=on?tick/5*Math.PI/3:0;R(X,Y,Math.round(10+Math.cos(a)*5)-1,Math.round(-14+Math.sin(a)*5)-1,3,2,'#f5c84c')}
// rameur : rail le long de la salle, volant d'inertie à l'avant ; le siège glisse avec le rameur assis
function gRower(f){const{x,y,w,h}=f,s=ST.find(o=>o.f===f),wh=s.who,sl=wh?(wh.me?GYM.rowSlide():wh.sl||0):0;fshadow(f);
 B3(x+.2,y+h/2-.12,w-.5,.24,8,3,DARK,{t:'#4a525e'});legs(x+.2,y+h/2-.12,.24,.24,8,INK,.08);legs(x+w-.6,y+h/2-.12,.24,.24,8,INK,.08);
 B3(x+w-.75,y+.05,.7,h-.1,0,24,DARK2,{t:'#3a414c',r:'#1d2026'});{const p=P(x+w-.05,y+h/2,14);G.fillStyle=f.id=='row0'?CY:MAG;G.fillRect(p[0]-5,p[1]-3,10,2)}
 B3(x+w-.95,y+.15,.2,h-.3,10,6,'#4a525e',{flat:1});// repose-pieds
 const su=x+.55+sl*.75;B3(su-.25,y+h/2-.22,.5,.44,11,3,'#e0533d',{t:'#f07a63'});
 if(wh&&s.seat){const img=whoImg(s);seatDraw(img,su,y+h/2,16,false,wh.sa)}
 // poignée et câble
 const hu=wh?su+.95+(1-sl)*.15:x+w-.9,hp=P(hu,y+h/2,wh?27:22),fp=P(x+w-.7,y+h/2,20);ln([fp[0],fp[1]],[hp[0],hp[1]],'#8a96a6');G.fillStyle=INK;G.fillRect(hp[0]-5,hp[1]-1,10,3);G.fillStyle='#5a606a';G.fillRect(hp[0]-4,hp[1],8,1)}
// rack d'haltères contre le miroir
function gRack(f){const{x,y,w,h}=f;fcDraw('gRack',f,()=>{fshadow(f);legs(x+.1,y+.1,w-.2,h-.2,26,INK,.1);B3(x+.05,y+.05,w-.1,h-.1,26,2,DARK,{t:'#3a414c'});B3(x+.15,y+.05,w-.3,h-.1,12,2,DARK,{t:'#3a414c'});
  const C=['#e0533d','#3f8fd0','#f5c84c','#4ab04a','#b04ad0','#e0533d'];for(let i=0;i<6;i++){const v=y+.25+i*.5;[[28,0],[14,1]].forEach(([z,t])=>{B3(x+.25,v,.5,.12,z,3,'#5a606a',{flat:1});B3(x+.2,v-.02,.12,.16,z-1,5,INK,{t:C[(i+t*3)%6]});B3(x+.68,v-.02,.12,.16,z-1,5,INK,{t:C[(i+t*3)%6]})})}},110)}
// banc de développé (assis, dossier incliné) : poignées qui avancent quand on pousse
function gBench(f){const{x,y,w,h}=f,s=STB('bench0'),wh=s.who,pr=wh?(wh.me?GYM.press():wh.pr||0):0;
 fcDraw('gBenchA',f,()=>{fshadow(f);B3(x+.05,y+.2,.2,h-.4,0,62,DARK,{t:'#3a414c'});B3(x+.1,y+.3,.1,h-.6,62,4,INK);// montants et pile de poids
  for(let i=0;i<8;i++)B3(x+.05,y+h/2-.35,.2,.7,4+i*5,4,i%2?'#4a525e':'#5a606a',{t:'#6a727e'});
  B3(x+.25,y+.5,.35,h-1,14,30,'#c0392b',{t:'#e0533d',r:'#a02c20'});// dossier
  legs(x+.3,y+.6,.9,h-1.2,14,INK,.08);B3(x+.25,y+.55,.95,h-1.1,12,4,'#c0392b',{t:'#e0533d'});// assise
  B3(x+.4,y+.4,.1,.1,0,46,INK,{flat:1});B3(x+.4,y+h-.5,.1,.1,0,46,INK,{flat:1})},110);
 if(wh)seatDraw(whoImg(s),s.pos[0],s.pos[1],16,false,wh.sa);
 // bras de poussée
 const hu=x+1.05+pr*.35;[y+.55,y+h-.55].forEach(v=>{const a=P(x+.45,v,46),b=P(hu,v,32);ln(a,b,INK);ln([a[0],a[1]+1],[b[0],b[1]+1],'#5a606a');G.fillStyle=INK;G.fillRect(b[0]-2,b[1]-2,5,5);G.fillStyle=MAG;G.fillRect(b[0]-1,b[1]-1,3,3)})}
function gCable(f){const{x,y,w,h}=f;fcDraw('gCable',f,()=>{fshadow(f);B3(x,y,w,.18,0,74,DARK,{t:'#3a414c'});B3(x,y+h-.18,w,.18,0,74,DARK,{t:'#3a414c'});B3(x,y,w,h,70,4,INK,{t:'#3a414c'});
  for(let i=0;i<8;i++)B3(x+w/2-.3,y+.3,.6,.4,6+i*5,4,i%2?'#4a525e':'#5a606a',{t:'#6a727e'});B3(x+w/2-.05,y+.45,.1,.1,0,70,STEEL,{flat:1});
  const a=P(x+.2,y+h,66),b=P(x+.2,y+h+.4,36);ln(a,b,'#8a96a6');const c=P(x+w-.2,y+h,66),d=P(x+w-.2,y+h+.4,36);ln(c,d,'#8a96a6');B3(x+.1,y+h-.1,.2,.2,62,6,ORA);B3(x+w-.3,y+h-.1,.2,.2,62,6,ORA)},110)}
function gPlates(f){const{x,y,w,h}=f;fcDraw('gPlates',f,()=>{fshadow(f);B3(x+.1,y+.1,w-.2,h-.2,0,3,DARK,{t:'#3a414c'});B3(x+.2,y+h/2-.06,.12,.12,0,34,INK,{flat:1});B3(x+w-.32,y+h/2-.06,.12,.12,0,34,INK,{flat:1});
  // disques rangés sur deux broches, vus de profil
  [[x+.35,'#e0533d',13],[x+.55,'#3f8fd0',11],[x+.72,'#f5c84c',9],[x+.86,'#4ab04a',7],[x+1.0,'#e8edf1',6],[x+1.12,'#e8edf1',6]].forEach(([u,c,r])=>{const p=P3(u,y+h/2,r+3);ell(Math.round(p[0]),Math.round(p[1]),Math.round(r*.55),r,INK);ell(Math.round(p[0]),Math.round(p[1]),Math.max(1,Math.round(r*.55)-1),r-1,'#2b3038');ell(Math.round(p[0])+1,Math.round(p[1]),Math.max(1,Math.round(r*.3)),Math.max(1,r-3),c)});
  // barre posée sur les supports
  const a=P3(x+.05,y+h/2,34),b=P3(x+w-.05,y+h/2,34);ln(a,b,STEEL);ln([a[0],a[1]+1],[b[0],b[1]+1],'#8a96a6')},110)}
// sac de frappe suspendu : balance quand on frappe
function gSac(f){const{x,y,w,h}=f,s=ST.find(o=>o.f===f),sw=GYM.bagSwing(f.id);const top=P(x+w/2,y+h/2,WHI-4),base=P(x+w/2,y+h/2,24);const dx=Math.round(Math.sin(sw.a)*10);
 G.fillStyle='rgba(20,14,28,.28)';G.fillRect(base[0]-12+dx,P(x+w/2,y+h/2,0)[1]-3,24,5);
 ln(top,[top[0]+Math.round(dx*.2),base[1]-56],'#5a606a');const X=base[0]+dx,Y=base[1];
 R(X,Y,-11,-58,22,60,INK);R(X,Y,-10,-57,20,58,f.id=='sac0'?'#8b1f2a':'#1f2a8b');R(X,Y,-10,-57,5,58,f.id=='sac0'?'#a8303a':'#303aa8');R(X,Y,-10,-50,20,3,'#15181d');R(X,Y,-10,-8,20,3,'#15181d');R(X,Y,-6,-40,12,6,'#f5f5f5');
 if(sw.hit>0){G.globalAlpha=Math.min(1,sw.hit/8);G.fillStyle='#fff6b0';const hx=X-12,hy=Y-30;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;G.fillRect(hx+Math.round(Math.cos(a)*(6+(10-sw.hit))),hy+Math.round(Math.sin(a)*(6+(10-sw.hit))),3,3)}G.globalAlpha=1}}
function gBoxRack(f){const{x,y,w,h}=f;fcDraw('gBoxRack',f,()=>{fshadow(f);B3(x+.1,y,.1,h,0,70,DARK,{t:'#3a414c'});B3(x+.1,y,.5,h,70,3,INK);
  [[.3,60,'#e0533d'],[.9,60,'#3f8fd0'],[1.5,60,'#e0533d']].forEach(([v,z,c])=>{B3(x+.2,y+v-.15,.35,.3,z-12,12,mx(c,'#000',.2),{t:c})});
  [[.4,'#2b3038'],[1.2,'#e0533d']].forEach(([v,c])=>B3(x+.15,y+v-.2,.45,.4,26,12,mx(c,'#000',.2),{t:c}));const a=P(x+.4,y+.2,44),b=P(x+.4,y+h-.2,44);ln(a,b,ORA)},110)}
function gRoll(f){const{x,y}=f;fcDraw('gRoll',f,()=>{fshadow(f);[[0,0,'#3fa0e0'],[.45,0,'#ff4fa3'],[.2,.4,'#9be84a']].forEach(([a,b,c])=>B3(x+.05+a*.9,y+.1+b,.4,.45,b?8:0,8,mx(c,'#000',.25),{t:c}))},70)}
function gBall(f){const{x,y,w}=f,p=P(x+w/2,y+w/2,0);G.fillStyle='rgba(20,14,28,.28)';G.fillRect(p[0]-12,p[1]-2,24,4);ell(p[0],p[1]-12,13,12,'#2a7fb8');ell(p[0],p[1]-13,12,11,'#3fa0e0');ell(p[0]-4,p[1]-18,4,3,'#a8dcff')}
function gBancR(f){const{x,y,w,h}=f;fcDraw('gBancR',f,()=>{fshadow(f);legs(x+.1,y+.1,w-.2,h-.2,12,INK,.1);for(let i=0;i<4;i++)B3(x,y+.05+i*.16,w,.12,12,3,WOOD,{t:WOODL})},50);
 ['rest0','rest1'].forEach(id=>{const s=STB(id);if(s.who)seatDraw(whoImg(s),s.pos[0],s.pos[1],16,true,s.who.sa)})}
function gBar(f){const{x,y,w,h}=f;fcDraw('gBar',f,()=>{fshadow(f);B3(x,y,w,h,0,26,'#e8e4dc',{t:'#f4f1ea',r:'#cfc9bd'});B3(x+w-.02,y+.1,.04,h-.2,3,4,LIME,{flat:1});B3(x-.05,y-.05,w+.1,h+.1,26,2,WOOD,{t:WOODL});
  B3(x+.25,y+.3,.35,.35,28,14,'#cfe6f0',{t:'#eef9fd'});B3(x+.27,y+.32,.31,.31,28,8,'#ff6a8a',{flat:1});B3(x+.25,y+.3,.35,.35,42,3,INK);// blender
  [['#f5a020',1.2],['#e0304a',1.5],['#6cc04a',1.8],['#f5d65a',2.1]].forEach(([c,v])=>B3(x+.3,y+v,.2,.2,28,4,mx(c,'#000',.2),{t:c}));
  for(let i=0;i<3;i++)B3(x+.55,y+1.3+i*.4,.18,.18,28,7,'#ffffff',{t:['#ff9ab0','#9be84a','#f5c84c'][i]})},110)}
function gBoard(f){/* tableau dessiné au mur (fond) ; la zone reste touchable */}
function gDesk(f){const{x,y,w,h}=f,img=nImg(5,GYM.coachPose());if(img){const p=P(x-.55,y+1.2);charDraw(img,p[0],p[1],false,CW,CH)}
 fcDraw('gDesk',f,()=>{fshadow(f);B3(x,y,w,h,0,28,'#2b3038',{t:'#3a414c',r:'#1d2026',l:'#262a31'});B3(x+w-.02,y+.1,.04,h-.2,4,2,CY,{flat:1});B3(x+w-.02,y+.1,.04,h-.2,22,2,CY,{flat:1});
  B3(x-.05,y-.05,w+.1,h+.1,28,3,WOOD,{t:WOODL});B3(x+.25,y+.5,.12,.6,31,14,INK,{t:'#0c1a24'});B3(x+.5,y+1.5,.45,.6,31,1,'#f4f1ea');B3(x+.4,y+1.9,.2,.2,31,8,ORA,{t:'#ffc070'})},120)}
function gLock(f){const{x,y,w,h}=f;fcDraw('gLock',f,()=>{fshadow(f);B3(x,y,w,h,0,74,'#4a525e',{t:'#5a646e'});for(let i=0;i<6;i++){const v=y+.05+i*h/6;[[2,34],[38,34]].forEach(([z,hh],j)=>{B3(x+w-.03,v+.03,.04,h/6-.08,z,hh,(i+j)%3==0?'#1f8b8b':'#6a7480',{flat:1});
  const p=P(x+w,v+h/6-.18,z+hh-8);G.fillStyle='#e8edf1';G.fillRect(p[0],p[1],1,4);const q=P(x+w,v+.15,z+hh-6);G.fillStyle=INK;G.fillRect(q[0]-1,q[1],3,1);G.fillRect(q[0]-1,q[1]+2,3,1)})}},130)}
// personnage debout ou en mouvement (sportifs, coach)
function gWalk(f){const o=f.p;if(!o)return;const mv=!!o.path,nm=mv?'w'+(Math.floor(o.t/7)%4):o.fr||'idle',img=nImg(o.i,nm);if(!img)return;const p=P(o.u,o.v);rx.globalAlpha=o.a==null?1:o.a;gshadow(p[0],p[1],22);charDraw(img,p[0],p[1],o.fl,CW,CH);rx.globalAlpha=1;
 if(o.gl)gloves(p[0],p[1],o.i,o.punch||0,o.fl,o.ph);if(o.bub)bubble(p[0],p[1]-128,o.bub)}
// gants de boxe par-dessus l'image « haltères » : garde, puis coup vers le sac (à droite)
function gloves(X,Y,i,k,fl,hand){const H=HANDS[isF(i)?'f':'m'],L=H[2],Rr=H[3],dx=(x)=>fl?X+40-x:X-40+x,dy=y=>Y-127+y;
 [[L,'#c0392b',0],[Rr,'#c0392b',1]].forEach(([h,c,j])=>{let gx=dx(h[0]),gy=dy(h[1])-8;if(k>0&&j==(hand||0)){const e=Math.sin(Math.min(1,k)*Math.PI);gx+=(fl?-1:1)*Math.round(e*22)*(j==1?1:1)+(j==0?(fl?-1:1)*Math.round(e*14):0);gy-=Math.round(e*(hand==2?10:4));if(e>.3){rx.globalAlpha=.35;rx.fillStyle='#ffffff';rx.fillRect(gx-(fl?-8:8),gy+2,8,2);rx.globalAlpha=1}}
  rx.fillStyle=INK;rx.fillRect(gx-5,gy-4,11,11);rx.fillStyle=c;rx.fillRect(gx-4,gy-3,9,9);rx.fillStyle='#e85a4a';rx.fillRect(gx-3,gy-2,4,3);rx.fillStyle='#f4f1ea';rx.fillRect(gx-4,gy+4,9,2)})}
function bubble(X,Y,k){const g=rx;g.fillStyle=INK;g.fillRect(X-9,Y-9,19,13);g.fillRect(X-2,Y+4,3,3);g.fillStyle='#ffffff';g.fillRect(X-8,Y-8,17,11);g.fillRect(X-1,Y+3,1,2);
 if(k=='chat'){g.fillStyle='#5a646e';for(let i=0;i<3;i++)if(Math.floor(tick/12)%4>i)g.fillRect(X-5+i*5,Y-3,3,3)}
 else if(k=='fire'){g.fillStyle=ORA;g.fillRect(X-2,Y-6,5,7);g.fillStyle='#f5d65a';g.fillRect(X-1,Y-3,3,4)}
 else if(k=='water'){g.fillStyle='#3fa0e0';g.fillRect(X-2,Y-6,4,2);g.fillRect(X-3,Y-4,6,5)}
 else if(k=='muscle'){g.fillStyle='#e8a070';g.fillRect(X-5,Y-2,10,4);g.fillRect(X+1,Y-6,4,5)}
 else if(k=='star'){g.fillStyle='#f5c84c';g.fillRect(X-1,Y-7,3,9);g.fillRect(X-5,Y-3,11,3)}}
Object.assign(PLD,{GTapis:gTapis,GVelo:gVelo,GRower:gRower,GRack:gRack,GBench:gBench,GCable:gCable,GPlates:gPlates,GSac:gSac,GBoxRack:gBoxRack,GRoll:gRoll,GBall:gBall,GBancR:gBancR,GBar:gBar,GBoard:gBoard,GDesk:gDesk,GLock:gLock,GWalk:gWalk});
// ---------- décor (fond dessiné une fois) ----------
function doorZone(){const DS=RN-16,z=Math.round(WHI*.7)+2;return[P3(0,9.5+DS,0),P3(0,12.7+DS,0),P3(0,12.7+DS,z),P3(0,9.5+DS,z)]}
function txtR(s,u,z,c,du,ph){du=du||.26;ph=ph||2;let k=0;for(const ch of s){const g=FONT[ch];if(g)g.forEach((row,j)=>[...row].forEach((b,i)=>{if(b=='1')WR(u+(k+i)*du,u+(k+i+1)*du,z-(j+1)*ph,z-j*ph,c)}));k+=g?(g[0].length+1):3}}
function txtL(s,v,z,c,dv,ph){dv=dv||.26;ph=ph||2;let k=0;for(const ch of s){const g=FONT[ch];if(g)g.forEach((row,j)=>[...row].forEach((b,i)=>{if(b=='1')WL(v-(k+i+1)*dv,v-(k+i)*dv,z-(j+1)*ph,z-j*ph,c)}));k+=g?(g[0].length+1):3}}
const fl=(a,b,c,d,col)=>poly([P3(a,b,0),P3(c,b,0),P3(c,d,0),P3(a,d,0)],col);
function decor(n){const H=WHI,z=t=>Math.round(H*t),nt=night>.5;
 // béton : banches et trous de coffrage
 for(let u=0;u<RN;u+=2.5)WR(u,u+.04,0,H,'rgba(0,0,0,.08)');for(let v=0;v<RN;v+=2.5)WL(v,v+.04,0,H,'rgba(0,0,0,.08)');
 for(let u=1.25;u<RN;u+=2.5)[z(.25),z(.6)].forEach(zz=>WR(u,u+.1,zz,zz+2,'rgba(0,0,0,.18)'));for(let v=1.25;v<RN;v+=2.5)[z(.25),z(.6)].forEach(zz=>WL(v,v+.1,zz,zz+2,'rgba(0,0,0,.18)'));
 // plinthe sombre
 WR(0,RN,0,6,'#2b3038');WL(0,RN,0,6,'#2b3038');
 // grandes fenêtres sur le mur du fond (ciel selon l'heure, silhouettes de la ville)
 [[1.4,6.4],[7.2,12.4],[13.2,18.6]].forEach(([a,b])=>{const z0=z(.36),z1=z(.88);WR(a-.12,b+.12,z0-3,z1+3,INK);
  const top=nt?'#141c38':'#8fcff0',bot=nt?'#26305a':'#d8eefa';for(let k=0;k<8;k++)WR(a,b,z0+Math.round((z1-z0)*k/8),z0+Math.round((z1-z0)*(k+1)/8),mx(bot,top,k/7));
  for(let u=a;u<b-.2;u+=.55){const hh=Math.round((z1-z0)*(.18+.3*Math.abs(Math.sin(u*3.7))));WR(u,u+.45,z0,z0+hh,nt?'#0c1020':'#7d8ea0');if(nt)for(let q=4;q<hh-3;q+=6)if(Math.sin(u*9+q)>.1)WR(u+.12,u+.2,z0+q,z0+q+2,'#ffd27a')}
  WR(a,b,z0,z0+2,'#5a646e');for(let u=a+(b-a)/3;u<b-.1;u+=(b-a)/3)WR(u-.05,u+.05,z0,z1,INK);WR(a,b,Math.round((z0+z1)/2)-1,Math.round((z0+z1)/2),INK)});
 // signalétique lumineuse des zones
 txtR('CARDIO',2.2,z(.995),nt?CY:'#1aa8c8',.18,2);txtR('BOXE',14,z(.995),nt?MAG:'#d0307a',.18,2);
 // bande LED en haut des murs
 WR(0,RN,H-3,H-2,CY);WL(0,RN,H-3,H-2,CY);
 // mur gauche : bois derrière le bar, miroirs de la zone muscu, tableau des records, logo, casiers
 WL(.9,4.8,0,z(.8),'#8a5a3a');for(let v=1;v<4.8;v+=.3)WL(v,v+.04,0,z(.8),'#6b4228');WL(.9,4.8,z(.8),z(.82),INK);txtL('SMOOTHIE',4.75,z(.93),nt?LIME:'#5aa82a',.13,2);
 WL(4.95,8.45,4,z(.88),INK);WL(5.05,8.35,6,z(.86),'#b8c8d4');for(let k=0;k<6;k++){const v0=5.4+k*.5;WL(v0,v0+.12,z(.2)+k*3,z(.8)-k*2,'rgba(255,255,255,.35)')}WL(6.68,6.74,6,z(.86),INK);txtL('MUSCU',8.3,z(.93),nt?ORA:'#d07020',.16,2);
 WL(8.55,10.4,z(.3),z(.86),INK);WL(8.62,10.33,z(.32),z(.84),'#1d2026');{const t=[9.3,9.65];WL(t[0],t[1],z(.74),z(.8),'#f5c84c');WL(t[0]+.1,t[1]-.1,z(.7),z(.74),'#f5c84c');WL(t[0]+.15,t[1]-.15,z(.66),z(.7),'#c8a030')}for(let i=0;i<5;i++){const zz=z(.6)-i*7;WL(8.75,9.6+((i*3)%4)*.15,zz,zz+2,'#e8edf1');WL(9.9,10.2,zz,zz+2,'#f5c84c')}
 txtL('FIT',12.6,z(.92),nt?CY:'#1aa8c8',.22,3);WL(10.7,13.2,z(.52),z(.54),CY);
 // ring de boxe au sol
 fl(12,4.9,18.6,10.9,'#7a1f2a');fl(12.15,5.05,18.45,10.75,'#a8303a');fl(12.15,5.05,18.45,5.2,'#f4f1ea');fl(12.15,10.6,18.45,10.75,'#f4f1ea');fl(12.15,5.05,12.3,10.75,'#f4f1ea');fl(18.3,5.05,18.45,10.75,'#f4f1ea');fl(14.6,7.4,16,8.4,'rgba(0,0,0,.18)');
 // zone musculation : dalles épaisses
 for(let a=1.2;a<9.6;a+=1.2)for(let b=4.4;b<10.2;b+=1.2)fl(a+.04,b+.04,a+1.16,b+1.16,((a+b)*10|0)%2?'#2f3339':'#2b2f35');
 // estrade étirements en bois clair et tapis colorés
 fl(11,12.4,19.6,19.6,'#8a6440');fl(11.1,12.5,19.5,19.5,'#c99a6a');for(let b=12.9;b<19.5;b+=.6)fl(11.1,b,19.5,b+.04,'#b0845a');
 [['#1fa8a0',12.45],['#9b59d0',14.85],['#ff7a5a',17.25]].forEach(([c,a])=>{fl(a,13.9,a+.95,16.7,mx(c,'#000',.25));fl(a+.04,13.94,a+.91,16.64,c)});
 // ligne de sécurité devant le cardio
 fl(1.3,3.25,19.6,3.35,'#f5c84c');for(let a=1.4;a<19.6;a+=.8)fl(a,3.25,a+.4,3.35,'#2b3038')}
{const _pb=placeBG;placeBG=function(n){const k=bgKey;_pb(n);if(isG()&&bgKey!==k){G=bgx;bgx.save();try{const Z=doorZone();bgx.beginPath();bgx.rect(0,0,LW,LH);bgx.moveTo(Z[0][0],Z[0][1]);Z.slice(1).forEach(p=>bgx.lineTo(p[0],p[1]));bgx.closePath();bgx.clip('evenodd');decor(n)}catch(e){console.error(e)}finally{bgx.restore()}G=rx}}}
// lueur des LED et des écrans
{const _dw=drawWorld;drawWorld=function(){_dw();if(!isG())return;try{const a=.05+.12*night;rx.globalAlpha=a;rx.fillStyle=CY;for(let u=0;u<RN;u+=.5){const p=P3(u,0,WHI-3);rx.fillRect(Math.round(p[0])-3,Math.round(p[1])+1,7,10)}for(let v=0;v<RN;v+=.5){if(v>DV0-.3&&v<DV1+.3)continue;const p=P3(0,v,WHI-3);rx.fillRect(Math.round(p[0])-3,Math.round(p[1])+1,7,10)}rx.globalAlpha=1;
  if(GYM.overlay)GYM.overlay()}catch(e){console.error(e)}}}
// ---------- chemins : grille étendue à toute la salle ----------
{const _fp=findPath;findPath=function(s,g){if(!isG()||RN<=16)return _fp(s,g);const R3=3,NN=Math.ceil(RN*R3),cen=i=>(i+.5)/R3,ok=new Uint8Array(NN*NN);for(let j=0;j<NN;j++)for(let i=0;i<NN;i++)ok[j*NN+i]=walkable(cen(i),cen(j))?1:0;
 const near=p=>{let bi=-1,bd=1e9;for(let k=0;k<NN*NN;k++)if(ok[k]){const d=Math.hypot(cen(k%NN)-p[0],cen(k/NN|0)-p[1]);if(d<bd){bd=d;bi=k}}return bi};const S=near(s),T=near(g);if(S<0||T<0)return[];
 const gs=new Float32Array(NN*NN).fill(1e9),came=new Int32Array(NN*NN).fill(-1),closed=new Uint8Array(NN*NN),hh=k=>{const dx=Math.abs(k%NN-T%NN),dy=Math.abs((k/NN|0)-(T/NN|0));return Math.max(dx,dy)+.414*Math.min(dx,dy)};
 const open=[S];gs[S]=0;let best=S;
 while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(gs[open[i]]+hh(open[i])<gs[open[bi]]+hh(open[bi]))bi=i;const c=open[bi];open[bi]=open[open.length-1];open.pop();if(closed[c])continue;closed[c]=1;if(hh(c)<hh(best))best=c;if(c==T){best=c;break}
  const ci=c%NN,cj=c/NN|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=NN||nj>=NN)continue;const n=nj*NN+ni;if(!ok[n]||closed[n])continue;
   if(di&&dj&&(!ok[cj*NN+ni]||!ok[nj*NN+ci]))continue;const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[n]){gs[n]=ng;came[n]=c;open.push(n)}}}
 const pts=[];for(let k=best;k>=0;k=came[k])pts.unshift([cen(k%NN),cen(k/NN|0)]);if(best==T&&walkable(g[0],g[1]))pts[pts.length-1]=[g[0],g[1]];
 const out=[];let cur=s,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}return out}}
// ---------- vie des sportifs ----------
const ENTRY=[-.45,DOORS[1]],INSIDE=[1.5,DOORS[1]];
function walkTo(o,u,v,then){let p=[];try{p=findPath([o.u,o.v],[u,v])}catch(e){}if(!p||!p.length)p=[[u,v]];o.path=p;o.then=then||null}
function stepWalk(o,sp){if(!o.path)return;const w=o.path[0],du=w[0]-o.u,dv=w[1]-o.v,l=Math.hypot(du,dv);o.t++;if(Math.abs(du-dv)>.02)o.fl=(du-dv)<0;
 if(l<=sp){o.u=w[0];o.v=w[1];o.path.shift();if(!o.path.length){o.path=null;const f=o.then;o.then=null;if(f)f()}}else{o.u+=du/l*sp;o.v+=dv/l*sp}}
const S={on:false,npc:[],bags:{sac0:{a:0,va:0,hit:0},sac1:{a:0,va:0,hit:0}},coach:{t:0,wave:0}};
const free=(k)=>ST.filter(s=>s.k==k&&!s.who&&!s.res);
function npcStart(n){// choisit la prochaine activité
 const ks=n.d.acts;let k=pick(ks),opts=free(k);if(!opts.length){k=pick(['rest','chat','stretch']);opts=free(k)}if(!opts.length){n.st='idle';n.t2=rnd(120,300);return}
 const s=pick(opts);s.res=n;n.s=s;n.st='go';n.fr=null;n.gl=0;walkTo(n,s.ap[0],s.ap[1],()=>{s.res=null;if(s.who&&s.who!==n){n.s=null;n.st='idle';n.t2=30;return}s.who=n;n.st='act';n.t2=s.k=='rest'||s.k=='chat'?rnd(600,1100):rnd(1200,2400);n.sa=s.seat?0:null;if(!s.seat){n.u=s.pos[0];n.v=s.pos[1]}n.fl=false;n.ph=0})}
function npcLeave(n){const s=n.s;if(s&&s.who===n){s.who=null}n.s=null;n.gl=0;n.bub=null;n.sl=0;n.pr=0;if(s){n.u=s.ap[0];n.v=s.ap[1]}n.st='idle';n.t2=rnd(40,140)}
function npcTick(n){if(n.bt>0&&--n.bt==0)n.bub=null;
 if(n.st=='go'){stepWalk(n,.045);return}
 if(n.st=='idle'){n.fr='idle';if(--n.t2<=0)npcStart(n);return}
 if(n.st!='act')return;const s=n.s;n.ph++;if(--n.t2<=0||!s){npcLeave(n);return}
 if(s.seat&&n.sa!=null&&n.sa<1){n.sa=Math.min(1,n.sa+.08);if(n.sa>=1)n.sa=null}
 switch(s.k){
  case'run':n.u=s.pos[0];n.v=s.pos[1];n.fr='r'+(Math.floor(n.ph/5)%4);if(n.ph%400==0){n.bub='fire';n.bt=80}break;
  case'bike':n.u=s.pos[0]+(isF(n.i)?0:0);n.v=s.pos[1]+(isF(n.i)?0:.06);n.fr=isF(n.i)?'bk'+(Math.floor(n.ph/5)%6):'bk'+(Math.floor(n.ph/6)%8);break;
  case'row':{const c=(n.ph%90)/90;n.sl=c<.35?c/.35:1-(c-.35)/.65;n.fr=n.sl>.6?'dn1':n.sl>.2?'dn2':'dn0';break}
  case'bench':{const c=(n.ph%110)/110;n.pr=c<.4?c/.4:c<.55?1:1-(c-.55)/.45;n.fr=n.pr>.5?'dn2':n.pr>.15?'dn1':'dn0';break}
  case'lift':case'cable':n.fr='cu'+[0,0,1,2,3,3,3,2,1,0][Math.floor(n.ph/7)%10];if(n.ph%500==250){n.bub='muscle';n.bt=80}break;
  case'box':{n.gl=1;n.fr='cu3';const c=n.ph%40;n.punch=c<10?c/10:0;n.ph2=n.ph2||0;if(c==0){n.ph2=(n.ph2+1)%3;GYM.hitBag(s.f.id,.5)}n.handp=n.ph2;break}
  case'stretch':{const c=Math.floor(n.ph/120)%4;n.fr=c==1?'wave':c==3?'wave':'idle';n.fl=c==3;break}
  case'rest':n.fr=n.ph%300<200?'dn0':'dn6';break;
  case'chat':n.fr=n.ph%260<150?'idle':'wave';if(!n.bub&&Math.random()<.01){n.bub='chat';n.bt=100}break}}
function bagTick(){for(const k in S.bags){const b=S.bags[k];b.va+=-b.a*.06-b.va*.06;b.a+=b.va;if(b.hit>0)b.hit--}}
// ---------- intégration ----------
function gEnter(){S.on=true;ST.forEach(s=>{s.who=null;s.res=null});S.npc=NPCS.filter(d=>!d.coach).map((d,k)=>({d,i:d.i,u:INSIDE[0],v:INSIDE[1],t:0,fl:false,st:'idle',t2:0,path:null}));
 // déjà à l'entraînement quand on arrive
 S.npc.forEach(n=>{const k=n.d.acts[0],o=free(k);if(!o.length){n.st='idle';n.t2=rnd(30,200);return}const s=o[0];s.who=n;n.s=s;n.st='act';n.t2=rnd(600,2000);n.ph=Math.floor(rnd(0,300));n.u=s.pos[0];n.v=s.pos[1];n.sa=null});
 for(let i=0;i<6;i++)['idle','w0','w1','w2','w3','cu0','cu1','cu2','cu3','r0','r1','r2','r3','dn0','dn1','dn2','dn6','wave'].forEach(nm=>nImg(i,nm));[0,2,4].forEach(i=>[0,1,2,3,4,5].forEach(k=>nImg(i,'bk'+k)));[1,3].forEach(i=>[0,1,2,3,4,5,6,7].forEach(k=>nImg(i,'bk'+k)))}
function gLeave(){S.on=false;S.npc=[];ST.forEach(s=>{s.who=null;s.res=null});PLACES.gym.furn=F.slice();try{GYM.onLeave&&GYM.onLeave()}catch(e){}}
{const _ar=arrive;arrive=function(d){if(S.on&&d!='gym')gLeave();_ar(d);if(d=='gym'){gEnter();try{GYM.onEnter&&GYM.onEnter()}catch(e){console.error(e)}}}}
{const _up=update;update=function(){_up();if(!isG()){if(S.on)gLeave();return}if(!S.on)return;
 try{prepTick(prepQ.length>30?5:2);S.npc.forEach(npcTick);bagTick();if(S.coach.wave>0)S.coach.wave--;
  // personnages debout dans la liste des meubles (tri en profondeur commun avec le joueur)
  const dyn=[];const ent=(o,key)=>{let k=key!=null?key:o.u+o.v+.6;if(key==null){const sx=o.u-o.v;for(const f of F){if(!f.s)continue;const fk=f.x+f.w+f.y+f.h;if(fk>=k)continue;if(o.u<f.x+f.w+.2&&o.v<f.y+f.h+.2&&sx>f.x-f.y-f.h-.9&&sx<f.x+f.w-f.y+.9)k=fk-.01}}return{n:'GWalk',s:0,x:o.u,y:o.v,w:0,h:k-o.u-o.v,p:o}};
  S.npc.forEach(n=>{if(n.st=='act'&&n.s&&n.s.seat)return;let key=null;if(n.st=='act'&&n.s&&n.s.f&&(n.s.k=='run'||n.s.k=='bike')){const f=n.s.f;key=f.x+f.w+f.y+f.h+.02}const e=ent(n,key);if(n.st=='act'&&n.s&&n.s.k=='box'){e.p=Object.assign(n,{gl:1,punch:n.punch,ph:n.handp})}dyn.push(e)});
  PLACES.gym.furn=F.concat(dyn);GYM.tick&&GYM.tick()}catch(e){console.error(e)}}}
// ---------- toucher dans la salle ----------
const onF=(f,mx2,my,ks)=>ks.some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x-.15&&a<=f.x+f.w+.15&&b>=f.y-.15&&b<=f.y+f.h+.15});
function mainDoorAt(mx2,my){for(let k=0;k<70;k+=5){const[a,b]=isoInv(mx2,my+k);if(a>-.6&&a<1.3&&b>=DV0-.1&&b<=DV1+.1)return true}return false}
function npcAt(mx2,my){// clic sur un sportif : on regarde la silhouette (hauteur du personnage)
 const L=S.npc.map(n=>({n,u:n.s&&n.s.seat?n.s.pos[0]:n.u,v:n.s&&n.s.seat?n.s.pos[1]:n.v})).concat([{n:{d:NPCS[5],coach:1},u:.75,v:11.8}]);let best=null,bd=1e9;
 for(const o of L){const p=P(o.u,o.v),dx=mx2-p[0],dy=my-(p[1]-55);if(Math.abs(dx)<22&&dy>-60&&dy<60){const d=Math.abs(dx)+Math.abs(dy)*.3;if(d<bd){bd=d;best=o.n}}}return best}
{const _pt=placeTap;placeTap=function(mx2,my,tu,tv){if(!isG())return _pt(mx2,my,tu,tv);if(GYM.busy&&GYM.busy()){GYM.tapBusy&&GYM.tapBusy();return}
 if(mainDoorAt(mx2,my)){GYM.leave?GYM.leave():goHome();return}
 const n=npcAt(mx2,my);if(n){GYM.talk&&GYM.talk(n.d,n);return}
 let f=null;for(let k=0;k<=90&&!f;k+=6){const[a,b]=isoInv(mx2,my+k);f=F.find(o=>o.s&&a>=o.x-.15&&a<=o.x+o.w+.15&&b>=o.y-.15&&b<=o.y+o.h+.15&&(k<=54||['GSac','GCable','GLock','GDesk','GBench'].includes(o.n)))}
 if(f){if(GYM.tapFurn&&GYM.tapFurn(f))return}
 if(tu<0||tv<0||tu>RN||tv>RN)return;C.st=C.st=='gym'?'idle':C.st;goto(tu*12,88+tv*5)}}
window.GYM=Object.assign(window.GYM||{},{F,ST,STB,NPCS,LOOKS,S,isF,nImg,seatDraw,gloves,bubble,free,P,
 speed:()=>1,rowSlide:()=>0,press:()=>0,coachPose:()=>S.coach.wave>0?(Math.floor(tick/12)%2?'wave':'idle'):'idle',
 bagSwing:id=>S.bags[id]||{a:0,hit:0},hitBag:(id,k)=>{const b=S.bags[id];if(!b)return;b.va+=.05*(k||1);b.hit=10}})})();
