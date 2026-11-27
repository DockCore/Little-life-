// ===== LE CAFÉ : un vrai lieu de vie, au rez-de-chaussée de la rue =====
// Salle isométrique (comptoir, machine à expresso, vitrine de pâtisseries, tables de 2 et de 4, banquettes, canapés,
// grandes fenêtres sur la rue), barista et serveur animés, clients qui entrent, commandent, s'installent, discutent et repartent,
// habitants du quartier avec qui parler, commandes payées en pièces, consommations animées, jeux, journal et téléphone.
// S'appuie sur le moteur des lieux du jeu (PLACES / PLD / placeBG / drawWorld / findPath), comme le restaurant.
// Les fenêtres (carte, habitants, jeux, journal, téléphone) sont dans cafe_ui.js (window.CAFEUI).
(function(){
const INK='#1a1420',WAL='#5a3a26',WALL='#7a5236',WALD='#3e2618',OAK='#b8875a',OAKL='#d0a274',OAKD='#8a6038',TEAL='#2f6f68',TEALL='#3f8a82',MUST='#d9a03a',MUSTL='#efbe5a',COG='#9a5a32',COGL='#b8743e',CHROME='#c8d0d8',CHROMED='#8a96a2';
const isC=()=>place=='cafe';
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const sfx=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.05)}catch(e){}};
const UI=()=>window.CAFEUI||{};
// ---------- la carte ----------
// e : énergie, j : bonheur, h : satiété ; u : façon de consommer ; prep : durée de préparation (images à 60/s)
const CM=[
 {k:'espresso',c:'b',n:'Espresso',p:3,d:'Court et corsé, couronné d’une crème dorée.',e:8,j:1,h:0,u:'cup',col:'#4a2616',prep:150,caf:1,fx:'Énergie ++'},
 {k:'cappuccino',c:'b',n:'Cappuccino',p:4,d:'Expresso, lait mousseux et une pointe de cacao.',e:6,j:3,h:1,u:'cup',col:'#c89a6a',prep:230,caf:1,fx:'Énergie +, bonheur +'},
 {k:'chocolat',c:'b',n:'Chocolat chaud',p:4,d:'Onctueux, avec un nuage de crème fouettée.',e:2,j:6,h:2,u:'mug',col:'#6a3a22',prep:200,fx:'Bonheur ++'},
 {k:'the',c:'b',n:'Thé',p:3,d:'Thé infusé à la minute, au choix vert ou noir.',e:3,j:3,h:0,u:'mug',col:'#b86a2a',prep:170,fx:'Énergie +, bonheur +'},
 {k:'jus',c:'b',n:'Jus de fruits',p:4,d:'Orange pressée minute, bien fraîche.',e:3,j:3,h:3,u:'glass',col:'#f5a020',prep:120,fx:'Énergie +, satiété +'},
 {k:'croissant',c:'f',n:'Croissant',p:2,d:'Pur beurre, feuilleté et encore tiède.',e:1,j:3,h:8,u:'food',col:'#e0a848',prep:70,fx:'Satiété ++'},
 {k:'cookie',c:'f',n:'Cookie',p:2,d:'Gros cookie moelleux aux pépites de chocolat.',e:1,j:5,h:4,u:'food',col:'#c08040',prep:60,fx:'Bonheur +, satiété +'},
 {k:'gateau',c:'f',n:'Part de gâteau',p:5,d:'Gâteau au chocolat et sa chantilly maison.',e:1,j:7,h:6,u:'food',col:'#5a3020',prep:90,fx:'Bonheur ++, satiété +'}];
const CK={};CM.forEach(m=>CK[m.k]=m);
// gestes : tasse et mug portés à la bouche, verre, pâtisserie croquée
const SEQ={cup:[['reach',14],['drink',48],['sit',30]],mug:[['reach',14],['drink',56],['sit',30]],glass:[['reach',14],['drink',52],['sit',26]],food:[['reach',14],['eat',22],['chew',40],['sit',16]]};
const BITES={cup:3,mug:4,glass:3,food:3};
// ---------- la salle (20 × 20 cases, porte sur le mur gauche) ----------
const FIX=[
 {n:'CMach',x:4.2,y:.2,w:5.3,h:.9,s:1},{n:'CFrigo',x:9.6,y:.2,w:3.1,h:.9,s:1},
 {n:'CEnd',x:3.6,y:.2,w:.5,h:3.2,s:1,k:0},{n:'CEnd',x:12.8,y:.2,w:.5,h:3.2,s:1,k:1},
 {n:'CComptoir',x:4.1,y:2.3,w:5.5,h:1.1,s:1},{n:'CVitrine',x:9.6,y:2.3,w:3.2,h:1.1,s:1},
 {n:'Tapis',x:6.6,y:10.9,w:5.4,h:5.4,s:0,col:'#9a4a3a'},{n:'Tapis',x:1.3,y:2.3,w:2.3,h:8.9,s:0,col:'#3f6f68'},
 {n:'CSofa',x:.15,y:2.6,w:1.05,h:3.4,s:1,id:'s0',no:1},{n:'CBasse',x:1.75,y:3.0,w:1.3,h:2.6,s:1,id:'c0',jeu:'echecs'},
 {n:'CSofa',x:.15,y:7.4,w:1.05,h:3.4,s:1,id:'s1',no:2},{n:'CBasse',x:1.75,y:7.8,w:1.3,h:2.6,s:1,id:'c1'},
 {n:'CJourn',x:1.4,y:12.0,w:.8,h:.8,s:1},
 {n:'Plante',x:1.4,y:.4,w:.9,h:.9,s:1},{n:'Plante',x:13.35,y:.4,w:.8,h:.8,s:1},{n:'Plante',x:18.9,y:8.0,w:.9,h:.9,s:1},{n:'Plante',x:18.9,y:17.8,w:.9,h:.9,s:1},{n:'Plante',x:4.4,y:17.9,w:.9,h:.9,s:1}];
const T2=[[4.6,6.8],[9.8,6.8],[15.4,5.6],[15.6,10.6],[13.6,15.2]];
T2.forEach(([x,y],i)=>FIX.push({n:'CT2',x,y,w:2.4,h:2.4,s:1,id:'t'+i,no:i+1}));
FIX.push({n:'CT4',x:7.4,y:11.8,w:3.6,h:3.6,s:1,id:'g',no:T2.length+1});
[14.2,16.9].forEach((x,i)=>FIX.push({n:'CBox',x,y:.15,w:2.6,h:2.6,s:1,id:'b'+i,no:T2.length+2+i}));
PLACES.cafe={nom:'le café',titre:'Café',rn:20,wall:'#efe0c8',door:'#5a3a26',floor:'wood',fa:'#b08058',fb:'#a37450',furn:FIX.slice()};
VT.cafe='Café';
// ---------- places assises ----------
// r=0 : face à nous (chaise du fond, banquette) ; r=1 : de profil sur la gauche (chaise de gauche, canapé contre le mur)
const SEATS=[];
function seat(f,o){const s=Object.assign({f,who:null,res:null,z:16,pz:26.4},o);s.id=f.id+'_'+SEATS.filter(q=>q.f===f).length;SEATS.push(s);return s}
FIX.forEach(f=>{const{x,y,w,h}=f;
 if(f.n=='CT2'){f.seats=[seat(f,{r:0,cu:x+1.6,cv:y+.45,ap:[x+w+.5,y+.45],pu:x+1.7,pv:y+1.15,gu:x+2.05,gv:y+.95,ch:[x+1.2,y+.05,.8,.7]}),seat(f,{r:1,cu:x+.45,cv:y+1.6,ap:[x+.45,y+h+.7],pu:x+1.15,pv:y+1.7,gu:x+.95,gv:y+2.05,ch:[x+.05,y+1.2,.7,.8]})]}
 if(f.n=='CT4'){f.seats=[1.4,2.8].map(d=>seat(f,{r:0,cu:x+d,cv:y+.45,ap:[x+w+.5,y+.45],pu:x+d+.1,pv:y+1.15,gu:x+d+.45,gv:y+.95,ch:[x+d-.4,y+.05,.8,.7]})).concat([1.4,2.8].map(d=>seat(f,{r:1,cu:x+.45,cv:y+d,ap:[x+.45,y+h+.7],pu:x+1.15,pv:y+d+.1,gu:x+.95,gv:y+d+.45,ch:[x+.05,y+d-.4,.7,.8]})))}
 if(f.n=='CBox'){f.seats=[seat(f,{r:0,cu:x+1.2,cv:y+.5,ap:[x+1.2,y+h+.75],pu:x+1.05,pv:y+1.4,gu:x+1.7,gv:y+1.25,booth:1,pz:25.4})]}
 if(f.n=='CSofa'){f.seats=[y+.8,y+2.6].map((v,i)=>seat(f,{r:1,cu:x+.62,cv:v,z:12,ap:[2.4,i?y+h+.55:y-.55],pu:2.05,pv:v,gu:2.45,gv:v+.35,sofa:1,pz:15.4}))}});
const tableOf=s=>s.sofa?FIX.find(f=>f.n=='CBasse'&&Math.abs(f.y-s.f.y)<1):s.f;
const mates=s=>SEATS.filter(q=>q!==s&&tableOf(q)===tableOf(s));
// ---------- repères ----------
const ENTRY=[-.45,DOORS[1]],INSIDE=[1.6,DOORS[1]],CAISSE=[7.6,4.3],PICK=[10.6,4.3],QUEUE=[[7.6,4.3],[6.3,5.0],[5.1,5.55],[3.9,6.1]];
const BAR={mach:[5.7,1.65],caisse:[7.8,1.7],pass:[10.4,1.7],vitr:[11.6,1.7],frigo:[11.2,1.5]};
// ---------- état ----------
const R={on:false,me:null,npc:[],staff:[],q:[],orders:[],sit:null,stand:null,door:0,spawn:0,fx:[],steam:0,amb:0,ev:null,friend:null,uiK:''};
function SV(){if(!N.cafe2)N.cafe2={v:1,visites:0,conso:{},depense:0,jour:{d:0,caf:0,journal:0,tel:0},parties:{},rdv:[],raconte:{},bonjour:{},hist:[]};const S=N.cafe2;
 S.conso=S.conso||{};S.parties=S.parties||{};S.rdv=S.rdv||[];S.raconte=S.raconte||{};S.bonjour=S.bonjour||{};S.hist=S.hist||[];if(!S.jour||S.jour.d!=(N.day||1))S.jour={d:N.day||1,caf:0,journal:0,tel:0};return S}
// ---------- personnages non joueurs (images tirées de la garde-robe du jeu, tablier peint par-dessus pour l'équipe) ----------
const LOOKS=[
 {g:'f',sk:1,hc:3,wd:{cheveux:'bun|3',haut:'tee|3',bas:'chino|3',chaussures:'basket|0'},nom:'Jade',ap:'#2f5a46'},// barista
 {g:'m',sk:3,hc:0,wd:{cheveux:'nat|0',haut:'shirt|0',bas:'chino|3',chaussures:'mocass|0'},nom:'Nino',ap:'#5a3a26'},// serveur
 {g:'f',sk:2,hc:3,wd:{cheveux:'bun|1',haut:'blouse|2',bas:'jupe|1',chaussures:'bottine|0'}},{g:'m',sk:1,hc:0,wd:{cheveux:'mi|0',haut:'polo|3',bas:'cargo|1',chaussures:'running|2'}},
 {g:'f',sk:0,hc:1,wd:{cheveux:'tails|2',haut:'hoodie|4',bas:'legging|0',chaussures:'basket|3'}},{g:'m',sk:2,hc:2,wd:{cheveux:'top|1',haut:'tee|5',bas:'jean|1',veste:'vjean|0',chaussures:'basket|0'}},
 {g:'f',sk:1,hc:0,wd:{cheveux:'long|1',haut:'pull|1',bas:'plisse|2',chaussures:'mocass|1'}},{g:'m',sk:0,hc:4,wd:{cheveux:'nat|0',haut:'flan|2',bas:'chino|0',chaussures:'bottes|1',tete:'bonnet|2'}},
 {g:'m',sk:1,hc:2,wd:{cheveux:'nat|2',haut:'pull|3',bas:'jean|0',veste:'blazer|1',chaussures:'mocass|0'}},{g:'f',sk:2,hc:0,wd:{cheveux:'mi|2',haut:'mari|0',bas:'shortj|0',chaussures:'sandale|1'}},
 {g:'f',sk:3,hc:2,wd:{cheveux:'long|2',haut:'pull|5',bas:'jean|1',chaussures:'bottine|1'}},{g:'m',sk:2,hc:5,wd:{cheveux:'mi|5',haut:'hoodie|1',bas:'jog|0',chaussures:'basket|2'}}];
const CLIENTS=[2,3,4,5,6,7,8,9,10,11];
const NCC=new Map();let prepQ=[];
function nLook(i){const B=Object.assign({},N.look);delete B.nu;delete B.lf;delete B.tn;const L=LOOKS[i];return lkOwnHr(Object.assign(B,{g:L.g,sk:L.sk,hc:L.hc},{wd:Object.assign({},L.wd)}))}
// image d'un personnage : client, équipe (indice) ou habitant (« h:identifiant »)
const nImg=(i,nm)=>{if(typeof i=='string'&&i.startsWith('h:'))return window.SOCIAL?SOCIAL.img(i.slice(2),nm):null;const c=NCC.get(i+'|'+nm);if(!c&&!prepQ.some(q=>q[0]==i&&q[1]==nm))prepQ.push([i,nm]);return c};
function apron(c,g,nm,col){try{const real=nm[1],G0=wGeo(real);if(!G0)return;const d=g.getImageData(0,0,CW,CH),o=d.data,P=G0.P,lab=LAB[real],ac=hx2(col);
  for(let p=0;p<CW*CH;p++){const q=P[p];if(!o[p*4+3]||(lab&&lab[p]==1))continue;const legOk=(q==10||q==11)&&G0.leg[p]>=0&&G0.leg[p]<.55,torso=(q==5||q==6)||(q==4&&!G0.back);if(!(torso||legOk))continue;if(G0.back&&!legOk&&q!=6)continue;
   const i=p*4,l=(.3*o[i]+.59*o[i+1]+.11*o[i+2])/150,k=Math.max(.55,Math.min(1.25,l));o[i]=ac[0]*k;o[i+1]=ac[1]*k;o[i+2]=ac[2]*k}
  g.putImageData(d,0,0)}catch(e){}}
function prepTick(n){let did=false;while(n-->0&&prepQ.length){const[i,nm]=prepQ.shift();const k=i+'|'+nm;if(NCC.has(k))continue;try{const L=nLook(i);if(drawFrame(nm,L)){const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.drawImage(sc2,0,0);
   if(LOOKS[i].ap){const real=(L.g=='f'&&SPR['F_'+nm])?'F_'+nm:nm;apron(c,g,[i,real],LOOKS[i].ap)}NCC.set(k,c);did=true}}catch(e){}}if(did)spKey=''}
const FR_WALK=['idle','w0','w1','w2','w3'],FR_SIT=['dn0','dn1','dn2','dn3','dn4','dn6','dn7'];
function warm(i,L){(L||FR_WALK.concat(FR_SIT)).forEach(nm=>nImg(i,nm))}
// ---------- petits objets : tasses, mugs, verres, assiettes ----------
const SC=()=>Math.max(1,Math.round(TW/12));
function cupAt(X,Y,m,lvl,sc,hand){const u=m.u;
 if(u=='glass'){const h=6*sc,w=3*sc;G.fillStyle='#2a3550';G.fillRect(X-1,Y-h-1,w+2,h+2);G.fillStyle='#d9f1fa';G.fillRect(X,Y-h,w,h);const l=Math.round((h-sc)*Math.max(0,lvl));if(l>0){G.fillStyle=m.col;G.fillRect(X,Y-l,w,l)}if(lvl>.2){G.fillStyle='#ffb84a';G.fillRect(X-2,Y-h-1,2,2)}return}
 if(u=='food'){const w=7*sc;if(!hand){G.fillStyle='#c9c2b6';G.fillRect(X-w/2-1,Y,w+2,2);G.fillStyle='#fbf8f2';G.fillRect(X-w/2,Y-1,w,1)}if(lvl<=0)return;const cut=Math.round(5*sc*(1-lvl));
  if(m.k=='croissant'){G.fillStyle='#8a5020';G.fillRect(X-3*sc+cut,Y-3*sc,6*sc-cut,3*sc);G.fillStyle=m.col;G.fillRect(X-3*sc+cut,Y-3*sc,5*sc-cut,2*sc);G.fillStyle='#f6cc80';G.fillRect(X-1*sc,Y-3*sc,sc,sc)}
  else if(m.k=='cookie'){G.fillStyle='#8a5a2a';G.fillRect(X-3*sc+cut,Y-3*sc,6*sc-cut,3*sc);G.fillStyle=m.col;G.fillRect(X-3*sc+cut,Y-3*sc,5*sc-cut,2*sc);G.fillStyle='#3a1a10';G.fillRect(X,Y-3*sc,sc,sc);if(cut<sc*3)G.fillRect(X-2*sc,Y-2*sc,sc,sc)}
  else{G.fillStyle='#3a1a10';G.fillRect(X-3*sc+cut,Y-4*sc,6*sc-cut,4*sc);G.fillStyle='#5a3020';G.fillRect(X-3*sc+cut,Y-3*sc,6*sc-cut,2*sc);G.fillStyle='#fffaf0';G.fillRect(X+sc,Y-5*sc,2*sc,sc)}return}
 // tasse ou mug fumant
 const w=(u=='mug'?4:3)*sc,h=(u=='mug'?4:3)*sc;if(!hand){G.fillStyle='#c9c2b6';G.fillRect(X-1,Y,w+4,1)}G.fillStyle=INK;G.fillRect(X-1,Y-h-1,w+2,h+2);G.fillRect(X+w+1,Y-h+1,2,2);
 G.fillStyle=u=='mug'?'#f0e6d2':'#ffffff';G.fillRect(X,Y-h,w,h);G.fillStyle=u=='mug'?'#c85a3a':'#e8e0d0';if(u=='mug')G.fillRect(X,Y-h+sc,w,1);
 if(lvl>0){G.fillStyle=m.k=='cappuccino'||m.k=='chocolat'?'#f4e6cc':m.col;G.fillRect(X,Y-h,w,1)}
 if(lvl>.15&&!hand){const s=Math.floor(tick/10+X)%3;G.globalAlpha=.55;G.fillStyle='#ffffff';G.fillRect(X+1+(s==1?1:0),Y-h-3,1,2);G.fillRect(X+w-1-(s==2?1:0),Y-h-5,1,2);G.globalAlpha=1}}
// ---------- mobilier ----------
function chair(ch,r,col){legs(ch[0],ch[1],ch[2],ch[3],14,'#2a1e18',.08);if(r==1)B3(ch[0],ch[1],.14,ch[3],14,20,OAK,{t:OAKL});else B3(ch[0],ch[1],ch[2],.14,14,20,OAK,{t:OAKL});
 B3(ch[0]+.02,ch[1]+.02,ch[2]-.04,ch[3]-.04,14,3,col,{t:mx(col,'#fff',.18)})}
function roundTop(cu,cv,r,z,c,ct){const p=P3(cu,cv,z);ell(p[0],p[1]+1,r*TW*.5+1,r*TH*.5+1,mx(c,'#000',.35));ell(p[0],p[1],r*TW*.5,r*TH*.5,c);ell(p[0]-1,p[1]-1,r*TW*.42,r*TH*.42,ct)}
function ct2Back(f){fshadow(f);f.seats.forEach((s,i)=>chair(s.ch,s.r,i?MUST:TEAL))}
function ct2Top(f){const cu=f.x+1.55,cv=f.y+1.55;B3(cu-.08,cv-.08,.16,.16,0,22,'#2a1e18',{flat:1});const p=P3(cu,cv,1);ell(p[0],p[1],TW*.28,TH*.28,'#2a1e18');roundTop(cu,cv,.9,23,'#e8e2d6','#f8f4ec');
 B3(cu+.25,cv+.3,.12,.12,24,4,'#cfe6f0',{t:'#eef9fd'});const q=P3(cu+.31,cv+.36,29);G.fillStyle='#4f8a3a';G.fillRect(Math.round(q[0]),Math.round(q[1]),1,2);G.fillStyle=f.no%2?'#e85d75':'#ffd166';G.fillRect(Math.round(q[0])-1,Math.round(q[1])-2,3,2)}
function ct4Back(f){fshadow(f);f.seats.forEach((s,i)=>chair(s.ch,s.r,[TEAL,MUST,COGL,TEAL][i]))}
function ct4Top(f){const{x,y}=f,t=[x+.8,y+.8,2.7,2.7];legs(t[0]+.1,t[1]+.1,t[2]-.2,t[3]-.2,22,'#3a2618',.16);B3(t[0],t[1],t[2],t[3],22,3,OAKD,{t:OAK,l:OAKD});
 for(let i=1;i<4;i++)B3(t[0]+i*t[2]/4,t[1],.02,t[3],25,.1,'#a87a4c',{flat:1});
 // boîte de jeu et cartes posées
 if(!R.game||R.game.f!==f){B3(t[0]+1.9,t[1]+.25,.6,.45,25,1.5,'#c0392b',{t:'#e05040'});B3(t[0]+.3,t[1]+2.0,.35,.5,25,.3,'#fffaf0',{flat:1})}}
function boxBack(f){const{x,y,w}=f;fshadow(f);B3(x,y,w,.25,0,34,TEAL,{t:TEALL});for(let u=x+.3;u<x+w-.1;u+=.6)B3(u,y+.25,.5,.05,16,16,TEALL,{flat:1});B3(x,y+.25,w,.6,0,14,TEAL,{t:TEALL});B3(x-.05,y,.12,.85,0,30,WALD,{flat:1});B3(x+w-.07,y,.12,.85,0,30,WALD,{flat:1})}
function boxTop(f){const{x,y}=f,t=[x+.35,y+.95,1.7,1.0];B3(t[0]+.7,t[1]+.35,.3,.3,0,22,'#2a1e18',{flat:1});B3(t[0],t[1],t[2],t[3],22,3,WAL,{t:WALL});B3(t[0]+.1,t[1]+.1,t[2]-.2,t[3]-.2,25,.4,'#9a6a44',{flat:1})}
function sofaBack(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,2,8,mx(COG,'#000',.25),{t:COG});B3(x,y,.32,h,2,24,COG,{t:COGL,r:mx(COG,'#000',.2)});
 for(let i=0;i<2;i++)B3(x+.32,y+.14+i*(h-.28)/2+.02,w-.4,(h-.28)/2-.04,10,3,COG,{t:COGL,r:mx(COG,'#000',.2)});B3(x+.34,y+.5,.14,.6,13,7,MUST,{t:MUSTL});B3(x+.34,y+h-1.1,.14,.6,13,7,TEALL,{t:mx(TEALL,'#fff',.2)});B3(x,y,w,.18,2,15,COG,{t:COGL})}
function sofaFront(f){const{x,y,w,h}=f;B3(x,y+h-.18,w,.18,2,15,COG,{t:COGL,r:mx(COG,'#000',.2)})}
function basse(f){const{x,y,w,h}=f;fshadow(f);legs(x+.1,y+.1,w-.2,h-.2,12,'#2a1e18',.12);B3(x,y,w,h,12,2,OAKD,{t:OAK});
 if(f.jeu=='echecs'&&!(R.game&&R.game.k=='echecs')){const u0=x+.3,v0=y+.65,s=.18;for(let i=0;i<4;i++)for(let j=0;j<4;j++)B3(u0+i*s,v0+j*s,s,s,14,.2,(i+j)%2?'#2a1e18':'#f0e6d2',{flat:1});const p=P3(u0+.2,v0+.2,16),q=P3(u0+.55,v0+.5,16);G.fillStyle='#f8f4ec';G.fillRect(Math.round(p[0]),Math.round(p[1])-3,2,3);G.fillStyle='#2a1e18';G.fillRect(Math.round(q[0]),Math.round(q[1])-4,2,4)}
 else{B3(x+.35,y+.4,.55,.75,14,.4,'#e8e0d0',{flat:1});B3(x+.4,y+.45,.45,.2,14.4,.1,'#c0392b',{flat:1});B3(x+.3,y+1.5,.6,.6,14,1,'#f6efe2',{t:'#ffffff'})}}
function journ(f){const{x,y,w,h}=f;fshadow(f);B3(x+.1,y+.1,w-.2,h-.2,0,6,WAL,{t:WALL});for(let i=0;i<3;i++){B3(x+.12,y+.15+i*.2,w-.24,.06,6+i*7,10,'#f4efe4',{t:'#ffffff'});B3(x+.14,y+.15+i*.2,w-.28,.05,12+i*7,2,i==1?'#c0392b':'#3a3e4a',{flat:1})}B3(x+.05,y+.05,.08,h-.1,0,30,WALD,{flat:1});B3(x+w-.13,y+.05,.08,h-.1,0,30,WALD,{flat:1})}
function endCap(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,24,WAL,{t:WALL});B3(x-.04,y,w+.08,h,24,2,'#e8dcc4',{t:'#f6efe2'})}
function comptoir(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,24,WAL,{t:WALL,l:WAL});for(let u=x+.25;u<x+w;u+=.5)B3(u,y+h,.04,.01,2,20,WALD,{flat:1});B3(x-.04,y-.04,w+.08,h+.08,24,2,'#e8dcc4',{t:'#f6efe2'});
 // caisse enregistreuse, bocal à pourboires, pile de tasses, petites gourmandises
 B3(x+3.4,y+.25,.7,.55,26,6,'#2a2e36',{t:'#4a4e56'});B3(x+3.45,y+.3,.4,.2,32,4,'#3a4048',{t:'#a8e0c0'});
 B3(x+.5,y+.3,.25,.25,26,5,'#d9f1fa',{t:'#eef9fd'});const p=P3(x+.6,y+.4,28);G.fillStyle=MUST;G.fillRect(Math.round(p[0]),Math.round(p[1]),2,1);
 for(let i=0;i<3;i++)B3(x+1.4+i*.3,y+.3,.2,.2,26,2+i*1.6,'#ffffff',{t:'#f4f4f4'});
 B3(x+2.3,y+.3,.6,.4,26,1,'#c9c2b6',{t:'#f4efe4'});[[2.4,'#c08040'],[2.65,'#e0a848']].forEach(([u,c])=>B3(x+u,y+.38,.18,.18,27,1.5,c,{flat:1}))}
function vitrine(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,16,WAL,{t:WALL});B3(x+.05,y+.05,w-.1,h-.1,16,14,'#bfe0ea',{t:'#dff4fa',l:'rgba(191,224,234,.75)',r:'rgba(150,200,215,.75)'});
 // étagères de pâtisseries visibles à travers la vitre
 const sh=(z,L)=>L.forEach(([u,c,c2],i)=>{const p=P3(x+.35+u,y+.55,z);G.fillStyle=INK;G.fillRect(Math.round(p[0])-3,Math.round(p[1])-4,7,5);G.fillStyle=c;G.fillRect(Math.round(p[0])-2,Math.round(p[1])-3,5,3);if(c2){G.fillStyle=c2;G.fillRect(Math.round(p[0])-2,Math.round(p[1])-3,5,1)}});
 B3(x+.1,y+.1,w-.2,h-.2,21,.3,'#e8e0d0',{flat:1});sh(18,[[.1,'#e0a848','#f6cc80'],[.6,'#e0a848','#f6cc80'],[1.2,'#c08040','#3a1a10'],[1.7,'#c08040','#3a1a10'],[2.3,'#5a3020','#fffaf0']]);
 sh(25,[[.2,'#e85a7a','#fff0f4'],[.9,'#5a3020','#fffaf0'],[1.6,'#f2b134','#fff6d6'],[2.3,'#6cc04a','#f4fff0']]);
 B3(x-.04,y-.04,w+.08,h+.08,30,2,'#e8dcc4',{t:'#f6efe2'});const q=P3(x+.4,y+1.1,22);G.fillStyle='rgba(255,255,255,.55)';G.fillRect(Math.round(q[0]),Math.round(q[1])-6,1,8)}
function machine(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,22,WALD,{t:WAL});B3(x-.04,y-.04,w+.08,h+.08,22,2,'#e8dcc4',{t:'#f6efe2'});
 // machine à expresso deux groupes, moulin, théière, bouteilles de sirop
 const m=[x+.7,y+.1,1.9,.7];B3(m[0],m[1],m[2],m[3],24,16,CHROMED,{t:CHROME,l:CHROME});B3(m[0],m[1]+.6,m[2],.12,26,10,'#c0392b',{t:'#d85040',l:'#c0392b'});
 [.4,1.3].forEach(d=>{B3(m[0]+d,m[1]+.65,.2,.2,22,3,'#2a2e36',{flat:1})});B3(m[0]+.1,m[1]+.05,m[2]-.2,m[3]-.1,40,2,'#e8edf1',{flat:1});for(let i=0;i<4;i++)B3(m[0]+.2+i*.4,m[1]+.15,.22,.22,42,2,'#ffffff',{t:'#f4f4f4'});
 B3(x+3,y+.15,.5,.5,24,8,'#2a2e36',{t:'#4a4e56'});B3(x+3.05,y+.2,.4,.4,32,6,'#c8e0ea',{t:'#e0f0f6'});const p=P3(x+3.25,y+.4,36);G.fillStyle='#4a2616';G.fillRect(Math.round(p[0])-2,Math.round(p[1]),4,2);
 [[3.8,'#c0392b'],[4.1,'#f2b134'],[4.4,'#6cc04a'],[4.7,'#7a4fb0']].forEach(([u,c])=>{B3(x+u,y+.3,.16,.16,24,9,c,{t:mx(c,'#fff',.2)});B3(x+u+.04,y+.34,.08,.08,33,3,'#2a2e36',{flat:1})})}
function machineLive(f){const{x,y}=f,on=R.steam>0||(R.staff[0]&&R.staff[0].job&&R.staff[0].job.k=='prep');if(!on)return;
 for(let i=0;i<3;i++){const k=(tick*.8+i*13)%40,p=P3(x+1.3+i*.25,y+.5,40+k*.5);G.globalAlpha=Math.max(0,.5-k/80);G.fillStyle='#ffffff';G.fillRect(Math.round(p[0])+Math.round(Math.sin((tick+i*20)/9)*2),Math.round(p[1]),2+(k>20?1:0),2);G.globalAlpha=1}
 const q=P3(x+1.2,y+.78,24);G.fillStyle='#5a2a18';if(Math.floor(tick/4)%2)G.fillRect(Math.round(q[0]),Math.round(q[1]),1,3)}
function frigo(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,34,'#e8e8ec',{t:'#ffffff',l:'#d8dce2'});B3(x+.1,y+h-.02,w-.2,.02,4,28,'#bfe0ea',{flat:1});
 for(let r=0;r<3;r++)for(let i=0;i<6;i++){const p=P3(x+.35+i*.45,y+h,8+r*9);G.fillStyle=['#f5a020','#e85d5d','#6cc04a','#f5a020','#7a2a1a','#ffd166'][(i+r)%6];G.fillRect(Math.round(p[0]),Math.round(p[1])-5,2,5);G.fillStyle='#ffffff';G.fillRect(Math.round(p[0]),Math.round(p[1])-6,2,1)}
 B3(x,y,w,h,34,2,'#c8ccd2',{t:'#f0f2f4'})}
// personnes assises (joueur, clients, habitants, ami)
function personAt(s){const d=s.who;if(!d)return;let img=null,a=1,dy=0;
 if(d.me){if(!/^dn\d/.test(spName))return;img=sc2;const t=R.sit;if(t&&t.s===s){const k=Math.min(1,t.t/t.T);a=t.up?1-k:k;dy=Math.round((t.up?k:1-k)*-5)}}
 else{img=nImg(d.i,d.fr||'dn0');if(d.sa!=null)a=d.sa}
 if(!img||a<=0)return;const p=P3(s.cu,s.cv,s.z),fl=s.r!=1,X=Math.round(p[0]),Y=Math.round(p[1])+dy,AX=29,AY=100;
 G.save();G.globalAlpha=a;if(fl){G.translate(X,0);G.scale(-1,1);G.drawImage(img,-AX,Y-AY)}else G.drawImage(img,X-AX,Y-AY);G.restore();
 const mX=X+(fl?-14:14),mY=Y-25;if(d.me){mouthL.x=mX;mouthL.y=mY}d.sx=X;d.sy=Y;handProp(d,s,mX,mY,fl,X,Y);if(d.bub&&a>.5)bubble(X,Y-92,d.bub)}
function handProp(d,s,mX,mY,fl,X,Y){const sc=SC(),dir=fl?-1:1;
 if(d.act=='journal'){const hx=X+dir*10,hy=Y-20;G.fillStyle=INK;G.fillRect(hx-8,hy-7,17,12);G.fillStyle='#f4efe4';G.fillRect(hx-7,hy-6,15,10);G.fillStyle='#8a8a90';for(let i=0;i<3;i++)G.fillRect(hx-6,hy-4+i*3,6,1);G.fillStyle='#c0392b';G.fillRect(hx+1,hy-5,6,4);G.fillStyle=INK;G.fillRect(hx,hy-6,1,10);return}
 if(d.act=='tel'){const hx=mX+dir*-2,hy=mY+7;G.fillStyle=INK;G.fillRect(hx-2,hy-4,5,8);G.fillStyle=Math.floor(tick/30)%2?'#8ad0ff':'#a8e0ff';G.fillRect(hx-1,hy-3,3,5);return}
 const e=d.eat;if(!e)return;const ph=e.seq[e.dq]&&e.seq[e.dq][0],k=e.seq[e.dq]?1-e.dt/e.seq[e.dq][1]:0,m=e.it.m;
 if(ph=='drink'){cupAt(mX+(fl?-5:2),mY+8,m,e.it.por,1,true);return}
 if((ph=='eat'&&k>.35)||(ph=='chew'&&e.t2<10)){cupAt(mX+dir*3,mY+7,m,e.it.por,1,true)}}
// objets posés sur la table de chaque place
function seatItems(s){const L=(s.items||[]).filter(it=>it.st=='table'||it.st=='done');if(!L.length&&!s.dirty)return;const sc=SC(),q=P3(s.pu,s.pv,s.pz),g=P3(s.gu,s.gv,s.pz);
 const d=s.who,inUse=d&&d.eat?d.eat.it:null,ph=d&&d.eat&&d.eat.seq[d.eat.dq]?d.eat.seq[d.eat.dq][0]:null;
 const food=L.filter(it=>it.m.c=='f'),drink=L.filter(it=>it.m.c=='b');
 drink.forEach((it,i)=>{if(it===inUse&&ph=='drink')return;cupAt(Math.round(g[0])-2-i*6,Math.round(g[1]),it.m,it.st=='done'?0:it.por,1)});
 food.forEach((it,i)=>{if(it===inUse&&(ph=='eat'||ph=='chew'))return;cupAt(Math.round(q[0])-i*7,Math.round(q[1]),it.m,it.st=='done'?0:it.por,1)});
 if(s.dirty&&!L.length){cupAt(Math.round(g[0])-2,Math.round(g[1]),CK.espresso,0,1)}}
function bubble(X,Y,k){G.fillStyle=INK;G.fillRect(X-7,Y-7,15,10);G.fillRect(X-2,Y+3,3,2);G.fillStyle='#ffffff';G.fillRect(X-6,Y-6,13,8);G.fillRect(X-1,Y+2,1,1);
 if(k=='chat'){G.fillStyle='#6a5a52';for(let i=0;i<3;i++)if(Math.floor(tick/12)%4>i)G.fillRect(X-4+i*4,Y-2,2,2)}
 else if(k=='love'){G.fillStyle='#e0506a';G.fillRect(X-3,Y-4,2,2);G.fillRect(X+1,Y-4,2,2);G.fillRect(X-3,Y-3,6,2);G.fillRect(X-2,Y-1,4,1);G.fillRect(X-1,Y,2,1)}
 else if(k=='note'){G.fillStyle='#3f6fd0';G.fillRect(X,Y-5,1,5);G.fillRect(X-2,Y-1,3,2);G.fillRect(X+1,Y-5,2,1)}
 else if(k=='menu'){G.fillStyle='#4a2616';G.fillRect(X-3,Y-4,6,4);G.fillRect(X+3,Y-3,2,2);G.fillStyle='#ffffff';G.fillRect(X-2,Y-6,1,2);G.fillRect(X+1,Y-6,1,2)}
 else if(k=='rire'){G.fillStyle='#e8a040';G.fillRect(X-4,Y-4,2,2);G.fillRect(X+2,Y-4,2,2);G.fillStyle='#d05050';G.fillRect(X-3,Y-1,6,2)}
 else if(k=='hey'){G.fillStyle='#2f6f68';G.fillRect(X-1,Y-5,2,5);G.fillRect(X-1,Y+1,2,1)}
 else if(k=='zzz'){G.fillStyle='#6a7ab0';G.fillRect(X-3,Y-5,4,1);G.fillRect(X,Y-4,1,1);G.fillRect(X-1,Y-3,1,1);G.fillRect(X-3,Y-2,4,1)}}
function isoCT2(f){fcDraw('cfA|'+f.id,f,()=>ct2Back(f),60);f.seats.forEach(personAt);fcDraw('cfB|'+f.id,f,()=>ct2Top(f),60);f.seats.forEach(seatItems);gameOn(f)}
function isoCT4(f){fcDraw('cgA',f,()=>ct4Back(f),60);f.seats.forEach(personAt);ct4Top(f);f.seats.forEach(seatItems);gameOn(f)}
function isoCBox(f){fcDraw('cbA|'+f.id,f,()=>boxBack(f),60);f.seats.forEach(personAt);fcDraw('cbB|'+f.id,f,()=>boxTop(f),60);f.seats.forEach(seatItems);gameOn(f)}
function isoCSofa(f){fcDraw('csA|'+f.id,f,()=>sofaBack(f),60);f.seats.forEach(personAt);fcDraw('csB|'+f.id,f,()=>sofaFront(f),60)}
function isoCBasse(f){basse(f);SEATS.filter(s=>s.sofa&&tableOf(s)===f).forEach(seatItems);gameOn(f)}
// petit plateau de jeu posé sur la table pendant une partie
function gameOn(f){const g=R.game;if(!g)return;const s=R.me&&R.me.seat;if(!s||tableOf(s)!==f)return;const cu=s.pu+(s.r==1?.55:-.1),cv=s.pv+(s.r==1?-.1:.55),z=s.pz+.3,p=P3(cu,cv,z);
 if(g.k=='echecs'||g.k=='p4'){const n=4,sz=.14;for(let i=0;i<n;i++)for(let j=0;j<n;j++)B3(cu-.28+i*sz,cv-.28+j*sz,sz,sz,z,.2,g.k=='p4'?(j%2?'#2f55b8':'#3f6fd0'):((i+j)%2?'#2a1e18':'#f0e6d2'),{flat:1});if(g.k=='p4'){G.fillStyle='#e8c040';G.fillRect(Math.round(p[0])-2,Math.round(p[1])-4,2,2);G.fillStyle='#e05050';G.fillRect(Math.round(p[0])+2,Math.round(p[1])-2,2,2)}}
 else{G.fillStyle=INK;G.fillRect(Math.round(p[0])-6,Math.round(p[1])-3,6,4);G.fillRect(Math.round(p[0])+2,Math.round(p[1])-2,6,4);G.fillStyle='#ffffff';G.fillRect(Math.round(p[0])-5,Math.round(p[1])-2,4,2);G.fillRect(Math.round(p[0])+3,Math.round(p[1])-1,4,2);G.fillStyle='#c0392b';G.fillRect(Math.round(p[0])-4,Math.round(p[1])-2,1,1)}}
// personnages debout (équipe, clients, habitants, ami)
function isoCWalk(f){const o=f.p;if(!o)return;const mv=!!o.path||o.st=='in'||o.st=='exit',nm=mv?'w'+(Math.floor(o.t/7)%4):o.pose||'idle',img=nImg(o.i,nm)||nImg(o.i,'idle');if(!img)return;const p=P3(o.u,o.v,0);
 rx.globalAlpha=o.a==null?1:o.a;gshadow(p[0],p[1],22);charDraw(img,p[0],p[1],o.fl,CW,CH);rx.globalAlpha=1;const X=Math.round(p[0]),Y=Math.round(p[1]);o.sx=X;o.sy=Y;
 if(o.carry&&o.carry.length){const dir=o.fl?-1:1,hx=X+dir*13,hy=Y-46,sc=SC();G.fillStyle='#c9c2b6';G.fillRect(hx-6,hy,13,2);G.fillStyle='#fbf8f2';G.fillRect(hx-6,hy-1,13,1);o.carry.slice(0,2).forEach((it,i)=>cupAt(hx-4+i*6,hy-1,it.m,1,it.m.u=='food'?1:sc,true))}
 if(o.tray){const dir=o.fl?-1:1,hx=X+dir*13,hy=Y-46;G.fillStyle='#8a96a2';G.fillRect(hx-6,hy,13,2);if(o.tray>1)cupAt(hx-3,hy,CK.espresso,0,SC(),true)}
 if(o.bub)bubble(X,Y-92,o.bub)}
Object.assign(PLD,{CT2:isoCT2,CT4:isoCT4,CBox:isoCBox,CSofa:isoCSofa,CBasse:isoCBasse,CJourn:f=>fcDraw('cj',f,()=>journ(f),60),CEnd:f=>fcDraw('ce|'+f.k,f,()=>endCap(f),60),
 CComptoir:f=>fcDraw('cc',f,()=>comptoir(f),70),CVitrine:f=>fcDraw('cv',f,()=>vitrine(f),70),CMach:f=>{fcDraw('cm',f,()=>machine(f),80);machineLive(f)},CFrigo:f=>fcDraw('cfr',f,()=>frigo(f),80),CWalk:isoCWalk});
// ---------- décor mural (dessiné une fois dans le fond) ----------
function doorZone(){const DS=RN-16,z=Math.round(WHI*.7)+2;return[P3(0,9.5+DS,0),P3(0,12.7+DS,0),P3(0,12.7+DS,z),P3(0,9.5+DS,z)]}
function textR(s,u,z,c,du){du=du||.24;let k=0;for(const ch of s){const g=FONT[ch];if(g)g.forEach((row,j)=>[...row].forEach((b,i)=>{if(b=='1')WR(u+(k+i)*du,u+(k+i+1)*du,z-(j+1)*2,z-j*2,c)}));k+=g?(g[0].length+1):3}}
// fenêtres du mur gauche : grandes baies sur la rue
const WINS=[[.8,3.3],[3.8,6.3],[6.8,9.3],[9.8,12.3]];
function decor(n){const H=WHI,z=t=>Math.round(H*t);
 // briques apparentes en haut, boiserie en bas
 for(let zz=z(.3);zz<z(.98);zz+=4){WR(0,RN,zz,zz+.6,'rgba(160,110,80,.25)');for(let u=((zz/4)%2)*.5;u<RN;u+=1)WR(u,u+.05,zz,zz+4,'rgba(160,110,80,.2)')}
 WR(0,RN,0,z(.28),WAL);WR(0,RN,z(.28),z(.3),OAKL);for(let u=.4;u<RN;u+=.8)WR(u,u+.05,2,z(.26),WALD);
 WL(0,RN,0,z(.22),WAL);WL(0,RN,z(.22),z(.24),OAKL);for(let v=.4;v<RN;v+=.8)WL(v,v+.05,2,z(.2),WALD);
 // ardoise menu au-dessus du comptoir
 const a=[4.6,9.2];WR(a[0]-.12,a[1]+.12,z(.46)-2,z(.9)+2,OAKD);WR(a[0],a[1],z(.46),z(.9),'#2a3530');textR('MENU',a[0]+.4,z(.86),'#f3d27a',.2);
 CM.forEach((m,i)=>{const zz=z(.76)-i*Math.round((z(.76)-z(.5))/8),l=.8+((i*5)%4)*.35;WR(a[0]+.3,a[0]+.3+l,zz,zz+1,'#e8ece6');WR(a[1]-.7,a[1]-.35,zz,zz+1,'#f3d27a')});
 // étagère de tasses et de sacs de café au-dessus du frigo
 WR(9.7,12.6,z(.62),z(.64),OAKD);WR(9.7,12.6,z(.8),z(.82),OAKD);for(let i=0;i<6;i++){WR(9.9+i*.45,10.15+i*.45,z(.64),z(.64)+5,'#ffffff');WR(9.9+i*.45,10.15+i*.45,z(.64)+5,z(.64)+6,'#d8d0c4')}
 [['#8a5a2a',10],['#c0392b',10.8],['#2f6f68',11.6]].forEach(([c,u])=>{WR(u,u+.6,z(.82),z(.82)+12,c);WR(u+.15,u+.45,z(.82)+6,z(.82)+8,'#f6efe2')});
 // nom du café en lettres dorées
 textR('CAFE DU COIN',13.9,z(.95),'#d4af37',.085);
 // tableaux au-dessus des banquettes
 [[14.6,16.4,['#f2c46a','#e07a3a','#2f6f68']],[17.3,19.1,['#a8d3ea','#5aa04a','#f5f0e0']]].forEach(([u0,u1,A],i)=>{const z0=z(.44),z1=z(.78);WR(u0-.08,u1+.08,z0-2,z1+2,'#d4af37');WR(u0,u1,z0,z1,A[2]);
  if(i==0){WR(u0+.3,u0+.9,z0+3,z0+14,A[0]);WR(u0+.9,u1-.3,z0+3,z0+9,A[1]);WR(u0+.5,u0+.7,z0+14,z0+18,'#4a2616')}else{WR(u0,u1,z0,z0+Math.round((z1-z0)*.45),A[1]);WR(u0+.4,u0+.8,z0+Math.round((z1-z0)*.45),z0+Math.round((z1-z0)*.7),A[1]);WR(u1-.5,u1-.3,z1-8,z1-5,'#f5d76e')}});
 // grandes fenêtres sur la rue (mur gauche) : ciel et façades d'en face, selon l'heure
 const sk=night>.5?['#1b2540','#2a3558']:['#a8d3ea','#d8ecf6'];
 WINS.forEach(([v0,v1])=>{const z0=z(.27),z1=z(.86);WL(v0-.12,v1+.12,z0-3,z1+3,WALD);WL(v0,v1,z0,z1,sk[1]);WL(v0,v1,z0+Math.round((z1-z0)*.55),z1,sk[0]);
  // façades et devantures de l'autre côté de la rue
  for(let k=0;k<3;k++){const b0=v0+.15+k*.8,b1=b0+.7,top=z0+Math.round((z1-z0)*(.48+((k*7+v0*3)%4)*.08));WL(b0,b1,z0,top,['#c8a080','#9aa8b8','#d9b48c','#a5523b'][(k+Math.round(v0))%4]);
   for(let r=0;r<2;r++)WL(b0+.12,b1-.12,top-8-r*10,top-4-r*10,night>.5?'#ffd98a':'#e8f4fa')}
  WL(v0,v1,z0,z0+5,'#7a7a80');WL(v0+(v1-v0)/2-.04,v0+(v1-v0)/2+.04,z0,z1,WALD);WL(v0,v1,z(.56)-1,z(.56)+1,WALD);
  WL(v0,v1,z0-3,z0,'#e8dcc4')});
 // lettrage sur la vitre (vu de l'intérieur) et suspension de plantes
 for(let v=.5;v<12.6;v+=3){WL(v+.5,v+.55,z(.9),z(.98),'#3a2a22');WL(v+.35,v+.7,z(.86),z(.9),'#4f8a3a')}
 // guirlande d'ampoules le long du mur du fond
 for(let u=.3;u<RN;u+=.7){const zz=z(.96)-Math.round(Math.abs(Math.sin(u*1.1))*3);WR(u,u+.08,zz,zz+1,'#3a2a22');WR(u+.25,u+.35,zz-3,zz,'#ffe2a0')}}
{const _pb=placeBG;placeBG=function(n){const k=bgKey;_pb(n);if(isC()&&bgKey!==k){G=bgx;bgx.save();try{const Z=doorZone();bgx.beginPath();bgx.rect(0,0,LW,LH);bgx.moveTo(Z[0][0],Z[0][1]);Z.slice(1).forEach(p=>bgx.lineTo(p[0],p[1]));bgx.closePath();bgx.clip('evenodd');decor(n)}catch(e){console.error(e)}finally{bgx.restore()}G=rx}}}
// passants derrière les vitres (dessinés avant les meubles : les canapés passent devant)
const PASS=[];
{const _dd=doorDraw;doorDraw=function(){_dd();if(!isC())return;try{const G0=G;G=rx;const H=WHI,z0=Math.round(H*.27),z1=Math.round(H*.86);
  if(R.on&&Math.random()<.006&&PASS.length<2)PASS.push({v:Math.random()<.5?-.5:13,d:0,i:pick(CLIENTS),c:pick(['#c0392b','#2f55b8','#4f8a3a','#7a4fb0','#e0a040','#3a3e4a'])});
  PASS.forEach(p=>{if(!p.d)p.d=p.v<0?1:-1;p.v+=p.d*.018});for(let i=PASS.length-1;i>=0;i--)if(PASS[i].v<-1||PASS[i].v>14)PASS.splice(i,1);
  for(const[v0,v1]of WINS){rx.save();const Q=[P3(0,v0,z0+5),P3(0,v1,z0+5),P3(0,v1,z1),P3(0,v0,z1)];rx.beginPath();rx.moveTo(Q[0][0],Q[0][1]);Q.slice(1).forEach(q=>rx.lineTo(q[0],q[1]));rx.closePath();rx.clip();
   PASS.forEach(p=>{if(p.v<v0-1||p.v>v1+1)return;const q=P3(0,p.v,z0+5),X=Math.round(q[0]),Y=Math.round(q[1]),st=Math.floor(tick/8)%2;rx.fillStyle='rgba(40,30,40,.55)';rx.fillRect(X-3,Y-26,6,6);rx.fillStyle=p.c;rx.globalAlpha=.75;rx.fillRect(X-4,Y-20,8,11);rx.globalAlpha=.6;rx.fillStyle='#2a2a34';rx.fillRect(X-3+(st?1:0),Y-9,3,8);rx.fillRect(X+(st?-1:0),Y-9,3,8);rx.globalAlpha=1});
   rx.restore()}G=G0}catch(e){console.error(e)}}}
// ambiance : ampoules qui scintillent le long du mur
{const _dw=drawWorld;drawWorld=function(){_dw();if(!isC())return;try{const G0=G;G=rx;
  const z=Math.round(WHI*.96)-3;for(let u=.55;u<RN;u+=1.4){const tw=(Math.sin(tick*.05+u*3)+1)/2;rx.globalAlpha=.25+.55*tw;const p=P3(u,0,z-Math.round(Math.abs(Math.sin((u-.25)*1.1))*3));rx.fillStyle='#fff2c0';rx.fillRect(Math.round(p[0]),Math.round(p[1])-1,1,2)}rx.globalAlpha=1;
  sitOverlay();carryDraw();
  if(R.sit&&R.sit.s&&C.st=='csit')HEAD=[mouthL.x,mouthL.y-60];G=G0}catch(e){console.error(e)}}}
// commande tenue en main par le joueur pendant qu'il marche jusqu'à sa place
function carryDraw(){const d=R.me;if(!d||!d.hand||!d.hand.length||C.st=='csit'||R.sit)return;const p=P3(C.x/12,(C.y-88)/5,0),dir=(SP&&SP.fl)?-1:1,X=Math.round(p[0])+dir*12,Y=Math.round(p[1])-44;
 G.fillStyle='#8a5a3a';G.fillRect(X-6,Y,13,2);G.fillStyle='#b8875a';G.fillRect(X-6,Y-1,13,1);d.hand.slice(0,3).forEach((it,i)=>cupAt(X-5+i*5,Y-1,it.m,1,it.m.u=='food'?1:SC(),true))}
// ---------- chemins : grille étendue à toute la salle ----------
{const _fp=findPath;findPath=function(s,g){if(!isC()||RN<=16)return _fp(s,g);const R3=3,NN=Math.ceil(RN*R3),cen=i=>(i+.5)/R3,ok=new Uint8Array(NN*NN);for(let j=0;j<NN;j++)for(let i=0;i<NN;i++)ok[j*NN+i]=walkable(cen(i),cen(j))?1:0;
 const near=p=>{let bi=-1,bd=1e9;for(let k=0;k<NN*NN;k++)if(ok[k]){const d=Math.hypot(cen(k%NN)-p[0],cen(k/NN|0)-p[1]);if(d<bd){bd=d;bi=k}}return bi};const S=near(s),T=near(g);if(S<0||T<0)return[];
 const gs=new Float32Array(NN*NN).fill(1e9),came=new Int32Array(NN*NN).fill(-1),closed=new Uint8Array(NN*NN),hh=k=>{const dx=Math.abs(k%NN-T%NN),dy=Math.abs((k/NN|0)-(T/NN|0));return Math.max(dx,dy)+.414*Math.min(dx,dy)};
 const open=[S];gs[S]=0;let best=S;
 while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(gs[open[i]]+hh(open[i])<gs[open[bi]]+hh(open[bi]))bi=i;const c=open[bi];open[bi]=open[open.length-1];open.pop();if(closed[c])continue;closed[c]=1;if(hh(c)<hh(best))best=c;if(c==T){best=c;break}
  const ci=c%NN,cj=c/NN|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=NN||nj>=NN)continue;const n=nj*NN+ni;if(!ok[n]||closed[n])continue;
   if(di&&dj&&(!ok[cj*NN+ni]||!ok[nj*NN+ci]))continue;const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[n]){gs[n]=ng;came[n]=c;open.push(n)}}}
 const pts=[];for(let k=best;k>=0;k=came[k])pts.unshift([cen(k%NN),cen(k/NN|0)]);if(best==T&&walkable(g[0],g[1]))pts[pts.length-1]=[g[0],g[1]];
 const out=[];let cur=s,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}return out}}
// ---------- déplacements des personnages non joueurs ----------
function walkTo(o,u,v,then){let p=[];try{p=findPath([o.u,o.v],[u,v])}catch(e){}if(!p||!p.length)p=[[u,v]];else if(Math.hypot(p[p.length-1][0]-u,p[p.length-1][1]-v)>.05)p.push([u,v]);o.path=p;o.then=then||null;o.pose=null}
function stepWalk(o,sp){if(!o.path)return;if(!o.path.length){o.path=null;const f=o.then;o.then=null;if(f)f();return}const w=o.path[0],du=w[0]-o.u,dv=w[1]-o.v,l=Math.hypot(du,dv);o.t++;if(Math.abs(du-dv)>.02)o.fl=(du-dv)<0;
 if(l<=sp){o.u=w[0];o.v=w[1];o.path.shift();if(!o.path.length){o.path=null;const f=o.then;o.then=null;if(f)f()}}else{o.u+=du/l*sp;o.v+=dv/l*sp}}
// les membres de l'équipe longent le comptoir (pas besoin de chemin : la zone est dégagée)
function staffTo(o,p,then){o.path=[[p[0],p[1]]];o.then=then||null;o.pose=null}
// ---------- commandes : file partagée préparée par la barista ----------
let NID=0;
function mkItem(m,who){return{m,who,st:'queue',por:1,t:0,T:m.prep,id:++NID}}
function order(who,list,table){const o={id:++NID,who,its:list.map(m=>mkItem(m,who)),st:'wait',table:!!table,t:0};o.its.forEach(it=>it.o=o);R.orders.push(o);return o}
function baristaTick(b){if(b.path){stepWalk(b,.06);return}if(b.wait>0){b.wait--;if(b.wait==0&&b.after){const f=b.after;b.after=null;f()}return}
 const j=b.job;if(j){if(j.k=='prep'){j.t++;b.pose=Math.floor(j.t/12)%2?'cu1':'cu2';b.fl=false;if(j.t==2){sfx(j.it.m.k=='espresso'||j.it.m.k=='cappuccino'?'cfGrind':j.it.m.c=='f'?'rsPage':'cfPour',.5)}if(j.t%70==40&&j.it.m.c=='b')sfx('cfSteam',.35);
   j.it.t=j.t;if(j.t>=j.it.T){j.it.st='ready';b.job=null;b.pose=null;sfx('rsBell',.5);const o=j.it.o;if(o.its.every(it=>it.st=='ready')){o.st='ready';if(o.table)task(o);else readyCall(o)}}return}}
 const it=R.orders.flatMap(o=>o.its).find(it=>it.st=='queue');
 if(it){it.st='prep';const spot=it.m.c=='f'?BAR.vitr:it.m.k=='jus'?BAR.frigo:BAR.mach;staffTo(b,spot,()=>{b.job={k:'prep',it,t:0}});return}
 // au repos : près de la caisse, essuie le comptoir de temps en temps
 if(Math.hypot(b.u-BAR.caisse[0],b.v-BAR.caisse[1])>.2&&Math.random()<.02)staffTo(b,BAR.caisse);else{b.pose=tick%600<80?'cu0':'idle';b.fl=false}}
// annonce au joueur ou au client : « c'est prêt »
function readyCall(o){if(o.who&&o.who.me){say('Jade : « '+o.its.map(it=>it.m.n).join(' et ')+(o.its.length>1?' : c’est prêt !':', c’est prêt !')+' »');R.flash=60;cfUI(true)}}
// serveur : apporte les commandes passées depuis une table, débarrasse les tasses vides
const TASKS=[];function task(o){TASKS.push({k:'serve',o})}
function waiterTick(w){if(w.path){stepWalk(w,.055);return}if(w.wait>0){w.wait--;if(w.wait==0&&w.after){const f=w.after;w.after=null;f()}return}
 const t=TASKS.shift();if(t&&t.k=='serve'){const o=t.o,s=o.who&&o.who.seat;if(!s){o.st='ready';o.table=false;readyCall(o);return}
  walkTo(w,PICK[0],PICK[1],()=>{w.carry=o.its.slice();w.fl=false;w.wait=20;w.after=()=>walkTo(w,s.ap[0],s.ap[1],()=>{w.carry=null;o.its.forEach(it=>{it.st='table'});s.items=(s.items||[]).concat(o.its);o.st='done';if(o.who.me&&o.who.ord===o)o.who.ord=null;if(o.who.friend&&o.who.ord===o)o.who.ord=null;sfx('rsServe',.5);w.bub='love';w.bt=50;if(o.who.me){say('Nino : « Et voilà, bonne dégustation ! »');cfUI(true)}w.wait=30;w.after=()=>walkTo(w,9,5.6)})});return}
 const dirty=SEATS.find(s=>s.dirty&&!s.who&&!s.res);if(dirty&&Math.random()<.03){walkTo(w,dirty.ap[0],dirty.ap[1],()=>{w.wait=40;w.after=()=>{dirty.dirty=0;w.tray=2;sfx('rsClear',.4);walkTo(w,PICK[0]+.6,PICK[1],()=>{w.tray=0;w.wait=40})}});return}
 if(!w.path&&Math.random()<.004){const p=pick([[9,5.6],[13.6,9.4],[6.4,10.6],[12.6,4.6]]);walkTo(w,p[0],p[1])}if(w.bt>0&&--w.bt==0)w.bub=null}
// ---------- consommation : enchaînement des gestes (joueur et clients) ----------
function startEat(d,it){const seq=SEQ[it.m.u];d.eat={it,seq,dq:0,dt:seq[0][1],t2:0,n:BITES[it.m.u],b:Math.round((1-it.por)*BITES[it.m.u])};if(d.me){C.seq=seq;C.dq=0;C.dt=d.eat.dt}}
// effets mesurés : la caféine compte moins après plusieurs cafés dans la journée
function effect(m,share){const S=SV();let ke=1;if(m.caf){ke=[1,1,.6,.35,.15][Math.min(4,S.jour.caf)]}const e=m.e*ke*share,j=m.j*share,h=m.h*share;add('energy',e);add('happy',j);add('hunger',h);try{bars()}catch(_){}return{e,j,h}}
function eatTick(d){const e=d.eat;if(!e)return;e.t2++;if(--e.dt>0)return;const ph=e.seq[e.dq][0];
 if(ph=='eat'||ph=='drink'){e.b++;e.it.por=Math.max(0,1-e.b/e.n);if(ph=='eat')sfx('rsBite',d.me?1:.3);if(d.me)effect(e.it.m,1/e.n)}
 e.dq++;e.t2=0;if(e.dq<e.seq.length){e.dt=e.seq[e.dq][1];if(e.seq[e.dq][0]=='drink')sfx('rsSip',d.me?1:.3);if(d.me){C.dq=e.dq;C.dt=e.dt}return}
 if(e.it.por<=0){e.it.st='done';d.eat=null;if(d.me){C.seq=null;const S=SV(),m=e.it.m;S.conso[m.k]=(S.conso[m.k]||0)+1;if(m.caf)S.jour.caf++;N.cafe=(N.cafe||0)+1;
   say(m.c=='b'?NAME()+' a fini son '+m.n.toLowerCase()+'. '+pick(['Un vrai moment de douceur.','Ça fait du bien !','Délicieux.']):NAME()+' a terminé : '+m.n.toLowerCase()+'. '+pick(['Un régal !','Miam.','Parfait avec une boisson chaude.']));
   fx.push({k:'h',x:C.x,y:C.y,l:80});friendShared(m);save();cfUI(true);try{goalsTick()}catch(_){}}return}
 e.dq=0;e.dt=e.seq[0][1];if(d.me){C.dq=0;C.dt=e.dt;d.eat=null;C.seq=null;cfUI(true)}}
const dnF=(e,t,act)=>{if(act=='journal')return Math.floor(t/90)%5==4?'dn1':'dn2';if(act=='tel')return t%200<170?'dn1':'dn0';if(act=='jeu')return Math.floor(t/50)%3==2?'dn2':'dn1';
 if(!e||!e.seq[e.dq])return t%150<118?'dn0':'dn7';const s=e.seq[e.dq],ph=s[0],k=1-e.dt/s[1];if(ph=='reach')return k<.5?'dn1':'dn2';if(ph=='eat')return k<.4?'dn2':'dn3';if(ph=='chew')return Math.floor(t/10)%2?'dn4':'dn3';if(ph=='drink')return'dn6';return'dn0'};
// ---------- clients et habitants ----------
function freeSeats(){return SEATS.filter(s=>!s.who&&!s.res&&!s.dirty)}
function newNpc(o){const d=Object.assign({id:++NID,u:ENTRY[0],v:ENTRY[1],t:0,fl:false,st:'in',a:0,fr:'dn0',bt:0,its:[],seat:null},o);R.npc.push(d);return d}
function seatNpc(d,s){d.seat=s;s.who=d;s.res=null;d.st='table';d.a=1;d.mt=rnd(900,2400)}
// client de passage : entre, fait la queue, commande, attend, s'installe, consomme, discute, repart
function newClient(group){const i=pick(CLIENTS.filter(c=>!R.npc.some(n=>n.i===c)))||pick(CLIENTS);const d=newNpc({i,grp:group||null});warm(i);return d}
function wantSeat(d){const fr=freeSeats();if(!fr.length)return null;if(d.grp){const mate=R.npc.find(n=>n!==d&&n.grp===d.grp&&n.seat);if(mate){const s=mates(mate.seat).find(q=>!q.who&&!q.res);if(s)return s}
  const big=fr.filter(s=>mates(s).filter(q=>!q.who&&!q.res).length>=1);if(big.length)return pick(big)}
 const solo=fr.filter(s=>mates(s).every(q=>!q.who&&!q.res));return pick(solo.length?solo:fr)}
function npcOrder(d){const B=CM.filter(m=>m.c=='b'),F=CM.filter(m=>m.c=='f'),L=[pick(B)];if(Math.random()<.45)L.push(pick(F));d.ord=order(d,L,false)}
function npcTick(d){if(d.bt>0&&--d.bt==0)d.bub=null;
 if(d.st=='in'){d.t++;d.fl=false;d.u+=.045;d.a=Math.min(1,(d.u+.45)/1.1);R.door=30;if(d.u>=INSIDE[0]){d.a=1;if(d.hab&&d.direct){const s=d.seat0||wantSeat(d);if(s){s.res=d;d.st='go';walkTo(d,s.ap[0],s.ap[1],()=>sitDown(d,s));return}}d.st='toq';queueJoin(d)}return}
 if(d.st=='toq'||d.st=='out'||d.st=='go'||d.st=='topick'){stepWalk(d,.05);return}
 if(d.st=='queue'){const k=R.q.indexOf(d);if(k<0){queueJoin(d);return}const sp=QUEUE[Math.min(k,QUEUE.length-1)];if(Math.hypot(d.u-sp[0],d.v-sp[1])>.1&&!d.path){walkTo(d,sp[0],sp[1]);return}stepWalk(d,.05);
  if(k==0&&!d.path){d.fl=true;if(!d.ord){d.bub='menu';d.bt=80;d.ot=(d.ot||0)+1;if(d.ot>70){d.bub=null;npcOrder(d);sfx('rsWrite',.25);R.q.shift();d.st='topick';walkTo(d,PICK[0]+.5+Math.random()*.8,PICK[1]+.4+Math.random()*.6,()=>{d.st='wait';d.fl=true})}}}return}
 if(d.st=='wait'){d.pose=null;if(d.ord&&d.ord.st=='ready'){d.ord.st='done';d.carry=d.ord.its;d.ord.its.forEach(it=>it.st='hand');const s=wantSeat(d);if(!s){d.st='out';d.bub='note';d.bt=60;walkTo(d,INSIDE[0],INSIDE[1],()=>{d.st='exit'});return}
   s.res=d;d.st='go';walkTo(d,s.ap[0],s.ap[1],()=>sitDown(d,s))}return}
 if(d.st=='sitdown'){d.sd++;d.sa=Math.min(1,d.sd/14);d.a=1-d.sa;if(d.sd==2)sfx('rsChair',.25);if(d.sd>=14){d.sa=null;d.a=1;d.st='table';d.mt=d.mt||rnd(1500,3200);d.ct=rnd(40,140)}return}
 if(d.st=='table'){d.fr=dnF(d.eat,tick+d.id*37,d.act);d.mt--;
  if(d.eat){eatTick(d);return}
  const L=(d.seat.items||[]).filter(it=>it.st=='table');
  if(L.length&&--d.ct<=0){startEat(d,pick(L));d.ct=rnd(80,260);d.act=null;return}
  // discussions entre voisins de table, lecture, téléphone
  const mt=mates(d.seat).filter(q=>q.who&&!q.who.me);if(!d.bub&&Math.random()<(mt.length?.008:.003)){d.bub=mt.length?pick(['chat','chat','rire','love']):pick(['note','chat']);d.bt=120;if(mt.length&&Math.random()<.5){const o=mt[0].who;o.bub=pick(['chat','rire']);o.bt=100}}
  if(!mt.length&&!d.act&&!d.hab&&Math.random()<.002)d.act=pick(['journal','tel']);if(d.act&&Math.random()<.0015)d.act=null;
  if(d.mt<=0&&!L.length&&!d.stay){d.st='up';d.sd=0;d.act=null;sfx('rsChair',.25)}return}
 if(d.st=='up'){if(d.sd==0){d.u=d.seat.ap[0];d.v=d.seat.ap[1]}d.sd++;d.sa=Math.max(0,1-d.sd/12);d.a=1-d.sa;if(d.sd>=12){const s=d.seat;s.who=null;if((s.items||[]).length){s.items=[];s.dirty=1}d.seat=null;d.sa=null;d.a=1;d.st='out';d.bub='love';d.bt=60;walkTo(d,INSIDE[0],INSIDE[1],()=>{d.st='exit'})}return}
 if(d.st=='exit'){d.u-=.045;d.t++;d.fl=true;d.a=Math.max(0,(d.u+.45)/1.1);R.door=30;if(d.u<=ENTRY[0])d.gone=1}}
function sitDown(d,s){if(s.who&&s.who!==d){const o=freeSeats()[0];if(!o){d.st='out';walkTo(d,INSIDE[0],INSIDE[1],()=>{d.st='exit'});return}s=o;s.res=d;walkTo(d,s.ap[0],s.ap[1],()=>sitDown(d,s));return}
 d.seat=s;s.who=d;s.res=null;if(d.carry){d.carry.forEach(it=>it.st='table');s.items=(s.items||[]).concat(d.carry);d.carry=null}d.st='sitdown';d.sd=0;d.sa=0;warm(d.i,FR_SIT)}
function queueJoin(d){if(!R.q.includes(d))R.q.push(d);d.st='queue'}
// déjà installés à l'arrivée : en pleine conversation, une tasse entamée devant eux
function seatedClient(s,i,grp){const d=newNpc({i:i!=null?i:pick(CLIENTS.filter(c=>!R.npc.some(n=>n.i===c))),grp});seatNpc(d,s);const m=pick(CM.filter(x=>x.c=='b')),it=mkItem(m,d);it.st='table';it.por=rnd(.3,.9);s.items=[it];if(Math.random()<.4){const f=mkItem(pick(CM.filter(x=>x.c=='f')),d);f.st='table';f.por=rnd(.2,1);s.items.push(f)}d.ct=rnd(60,300);d.mt=rnd(1200,3600);warm(d.i,FR_SIT);return d}
// ---------- habitants du quartier au café ----------
const HABS=()=>window.SOCIAL?SOCIAL.HAB:[];
function habToday(){const day=N.day||1,pr=SOCIAL.period(),S=SV(),L=[];const out=SOCIAL.OUT&&SOCIAL.OUT.id;
 // rendez-vous pris au café pour aujourd'hui, puis un ou deux habitants qui passent à ce moment de la journée (choix stable pour la journée)
 S.rdv.filter(r=>r.d==day).forEach(r=>{if(r.id!==out&&!L.includes(r.id))L.push(r.id)});const n=L.length+(pr=='nuit'?1:2);
 const H=HABS().filter(h=>h.id!==out&&h.sched[pr]!='maison').map(h=>h.id);const seed=(day*37+['matin','jour','soir','nuit'].indexOf(pr)*11)%97;
 for(let k=0;L.length<n&&k<H.length;k++){const id=H[(seed+k*5)%H.length];if(!L.includes(id))L.push(id)}return L}
function seatHab(id,s,fromDoor){const d=newNpc({i:'h:'+id,hab:id,stay:1});['idle','w0','w1','w2','w3','wave'].concat(FR_SIT).forEach(nm=>SOCIAL.img(id,nm));
 if(fromDoor){d.direct=1;d.seat0=s;s.res=d;return d}seatNpc(d,s);const it=mkItem(pick(CM.filter(x=>x.c=='b')),d);it.st='table';it.por=rnd(.4,1);s.items=[it];d.ct=rnd(100,300);d.mt=1e9;return d}
// ---------- l'ami invité ----------
// il entre avec le joueur (sortie « café » du système social) ou arrive plus tard (invitation par téléphone)
function friendIn(id,later){if(R.friend)return;
 // l'habitant est déjà dans la salle : c'est lui qui rejoint le joueur
 const ex=R.npc.find(n=>n.hab==id&&!n.friend);if(ex){ex.friend=1;ex.stay=1;ex.act=null;R.friend=ex;if(ex.seat&&ex.st=='table'){ex.st='upF';ex.sd=0}else if(!ex.seat){ex.st='follow';ex.path=null}ex.bub='love';ex.bt=90;say(SOCIAL.HB(id).nom+' se lève et vient te rejoindre !');return}const d=newNpc({i:'h:'+id,hab:id,friend:1,stay:1,st:later?'in':'follow',a:later?0:1});if(!later){d.u=INSIDE[0]-.6;d.v=INSIDE[1]+.5}R.friend=d;
 ['idle','w0','w1','w2','w3','wave'].concat(FR_SIT).forEach(nm=>SOCIAL.img(id,nm));if(later){d.direct=0;d.st='inF'}}
function friendTick(d){if(d.bt>0&&--d.bt==0)d.bub=null;
 if(d.st=='inF'){d.t++;d.fl=false;d.u+=.045;d.a=Math.min(1,(d.u+.45)/1.1);R.door=30;if(d.u>=INSIDE[0]){d.a=1;d.st='follow';d.bub='hey';d.bt=90;say(SOCIAL.HB(d.hab).nom+' arrive au café et te fait signe !')}return}
 if(d.st=='go'){stepWalk(d,.05);return}
 if(d.st=='follow'){const me=R.me,pu=C.x/12,pv=(C.y-88)/5;
  // le joueur est installé : l'ami prend la place libre la plus proche à sa table
  if(C.st=='csit'&&me.seat&&!R.sit){const s=mates(me.seat).filter(q=>!q.who&&!q.res).sort((a,b)=>Math.hypot(a.ap[0]-d.u,a.ap[1]-d.v)-Math.hypot(b.ap[0]-d.u,b.ap[1]-d.v))[0];
   if(s){s.res=d;d.st='go';walkTo(d,s.ap[0],s.ap[1],()=>{sitDown(d,s);d.bub='love';d.bt=80});return}}
  if(d.path){stepWalk(d,.05);return}const far=Math.hypot(pu-d.u,pv-d.v);if(far>2&&d.t++%20==0){const tu=pu-.8,tv=pv+.6;try{d.path=findPath([d.u,d.v],walkable(tu,tv)?[tu,tv]:[pu,pv])}catch(e){d.path=null}if(d.path&&d.path.length&&Math.hypot(d.path[d.path.length-1][0]-pu,d.path[d.path.length-1][1]-pv)<.3)d.path.pop()}
  if(!d.path){d.fl=(pu-d.u)-(pv-d.v)<0;d.pose='idle'}return}
 if(d.st=='sitdown'){d.sd++;d.sa=Math.min(1,d.sd/14);d.a=1-d.sa;if(d.sd>=14){d.sa=null;d.a=1;d.st='table';d.ct=rnd(60,200)}return}
 if(d.st=='table'){d.fr=dnF(d.eat,tick+d.id*29,d.act);if(d.eat){eatTick(d);return}const L=(d.seat.items||[]).filter(it=>it.st=='table');if(L.length&&--d.ct<=0){startEat(d,pick(L));d.ct=rnd(120,300);return}
  if(!d.bub&&Math.random()<.004){d.bub=pick(['chat','rire','love']);d.bt=100}
  // le joueur s'est levé : l'ami se lève aussi et le suit
  if(C.st!='csit'&&!R.sit){d.st='upF';d.sd=0}return}
 if(d.st=='upF'){if(d.sd==0){d.u=d.seat.ap[0];d.v=d.seat.ap[1]}d.sd++;d.sa=Math.max(0,1-d.sd/12);d.a=1-d.sa;if(d.sd>=12){const s=d.seat;s.who=null;if((s.items||[]).some(it=>it.st=='done'))s.dirty=1;s.items=(s.items||[]).filter(it=>it.st=='table');if(!s.items.length)s.items=[];d.seat=null;d.sa=null;d.a=1;d.st='follow'}return}
 if(d.st=='exit'){d.u-=.045;d.t++;d.fl=true;d.a=Math.max(0,(d.u+.45)/1.1);R.door=30;if(d.u<=ENTRY[0])d.gone=1}}
// un bon moment partagé avec l'ami compte pour la sortie et l'amitié
function friendShared(m,how){const f=R.friend;if(!f)return;const O=SOCIAL.OUT;if(O&&O.id==f.hab&&O.k=='cafe'){if(!O.did){const S=SV();S.amis=(S.amis||0)+1;try{goalsTick()}catch(_){}}O.did=true;O.extra=how||(m?m.n.toLowerCase()+' partagé':'moment au café')}}
// ---------- le joueur ----------
const me=()=>R.me;
function seatName(s){return s.sofa?'le canapé':s.booth?'la banquette':s.f.n=='CT4'?'la grande table':'la table '+s.f.no}
function sitAt(s,quiet){const d=me();if(!s||R.sit)return;
 if(s.who&&!s.who.me){say('Cette place est prise. Choisis une table libre.');return}
 if(s.res&&s.res!==d){say('Quelqu’un se dirige déjà vers cette place.');return}
 if(C.st=='csit'){if(d.seat===s)return;standUp(()=>sitAt(s));return}
 if(d.act)stopAct();d.seat=s;s.res=d;cfUI(true);
 goto(s.ap[0]*12,88+s.ap[1]*5,()=>{if(s.who&&!s.who.me){say('Quelqu’un s’est installé juste avant toi.');s.res=null;d.seat=null;cfUI(true);return}
  C.d=s.r==1?-1:1;R.stand=snap();s.who=d;s.res=null;R.sit={s,t:0,T:16,up:false};C.st='csit';C.alpha=0;C.path=null;C.x=s.cu*12;C.y=88+s.cv*5;C.tx=C.x;C.ty=C.y;sfx('rsChair');
  if(d.hand&&d.hand.length){d.hand.forEach(it=>it.st='table');s.items=(s.items||[]).filter(it=>it.st=='table').concat(d.hand);d.hand=[]}
  if(!quiet)say(NAME()+' s’installe sur '+seatName(s)+'.'+((s.items||[]).some(it=>it.st=='table')?' Bonne dégustation !':''));cfUI(true)})}
function standUp(then){const d=me(),s=d.seat;if(C.st!='csit'||!s||R.sit){if(then)then();return}if(d.eat){d.eat=null;C.seq=null}if(d.act)stopAct();
 R.sit={s,t:0,T:14,up:true,then};sfx('rsChair')}
function snap(){try{const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);return{c,fl:SP.fl}}catch(e){return null}}
function sitTick(){const t=R.sit;if(!t)return;t.t++;if(t.t<t.T)return;const s=t.s,d=me();R.sit=null;
 if(t.up){s.who=null;C.st='idle';C.idle=60;C.alpha=null;C.x=s.ap[0]*12;C.y=88+s.ap[1]*5;C.tx=C.x;C.ty=C.y;C.seq=null;
  // ce qui n'est pas terminé reste en main ; les tasses vides restent sur la table
  const left=(s.items||[]).filter(it=>it.st=='table'&&it.who===d);left.forEach(it=>it.st='hand');d.hand=left;s.items=(s.items||[]).filter(it=>!left.includes(it));if(s.items.some(it=>it.st=='done')){s.dirty=1;s.items=s.items.filter(it=>it.st!='done')}
  d.seat=null;cfUI(true);if(t.then)t.then()}else cfUI(true)}
function sitOverlay(){const t=R.sit;if(!t||!R.stand)return;const k=Math.min(1,t.t/t.T),a=t.up?k:1-k;if(a<=0)return;const s=t.s,p=P3(s.ap[0],s.ap[1],0);rx.globalAlpha=a;charDraw(R.stand.c,p[0],p[1],R.stand.fl,CW,CH);rx.globalAlpha=1}
function myItems(){const d=me();return d.seat?(d.seat.items||[]).filter(it=>it.st=='table'&&it.who===d):[]}
function consume(it){const d=me();if(C.st!='csit'||R.sit)return;if(d.act)stopAct();if(d.eat){d.eat=null;C.seq=null;say(NAME()+' fait une petite pause.');cfUI(true);return}
 it=it||myItems()[0];if(!it){say('Rien sur la table : commande quelque chose au comptoir.');return}startEat(d,it);
 say(it.m.c=='b'?NAME()+' boit une gorgée de '+it.m.n.toLowerCase()+'.':NAME()+' croque dans '+(it.m.k=='gateau'?'sa part de gâteau':'son '+it.m.n.toLowerCase())+'.');cfUI(true)}
// commande au comptoir (debout) ou depuis la table (le serveur l'apporte)
function goCounter(then){const d=me();if(C.st=='csit'){then&&then();return}goto(CAISSE[0]*12,88+CAISSE[1]*5,()=>{C.d=1;then&&then()})}
function pay(list,forFriend){const tot=list.reduce((a,m)=>a+m.p,0);if((N.coins||0)<tot){say('Il te manque '+(tot-(N.coins|0))+' pièce'+(tot-(N.coins|0)>1?'s':'')+'.');return false}
 earn(-tot);const S=SV();S.depense+=tot;sfx('rsPay',.6);return true}
function placeOrder(list,friendList){const d=me();if(!list.length&&!(friendList&&friendList.length))return false;const all=list.concat(friendList||[]);if(!pay(all))return false;
 const atTable=C.st=='csit'&&d.seat;const o=list.length?order(d,list,atTable):null;if(o)d.ord=o;
 if(friendList&&friendList.length&&R.friend){const f=R.friend,fo=order(f,friendList,!!f.seat);f.ord=fo;fo.gift=1;SOCIAL.gain(f.hab,2);friendShared(friendList[0],'verre offert');}
 if(o)sfx('rsWrite',.4);say((atTable?'Nino note ta commande : ':'Jade : « Je te prépare ça ! » ')+all.map(m=>m.n.toLowerCase()).join(', ')+' ('+all.reduce((a,m)=>a+m.p,0)+' pièces).');
 const S=SV();S.hist.unshift({d:N.day||1,its:all.map(m=>m.k)});if(S.hist.length>20)S.hist.length=20;save();cfUI(true);return true}
function takeOrder(){const d=me(),o=d.ord;if(!o||o.st!='ready')return;if(C.st=='csit'){o.table=true;task(o);return}
 goto(PICK[0]*12,88+(PICK[1])*5,()=>{C.d=1;o.st='done';o.its.forEach(it=>it.st='hand');d.hand=(d.hand||[]).concat(o.its);d.ord=null;sfx('rsServe',.6);say(NAME()+' récupère sa commande. Choisis une place (touche une table libre).');cfUI(true);
  // l'ami prend aussi la sienne au comptoir
  const f=R.friend;if(f&&f.ord&&f.ord.st=='ready'&&!f.seat){f.ord.st='done';f.carry=f.ord.its;f.ord.its.forEach(it=>it.st='hand');f.ord=null}})}
// trouver une place : la plus proche, une table entière si l'ami est là
function bestSeat(){const d=me(),pu=C.x/12,pv=(C.y-88)/5;let fr=freeSeats();if(R.friend)fr=fr.filter(s=>mates(s).some(q=>!q.who&&!q.res));
 if(!fr.length)fr=freeSeats();return fr.sort((a,b)=>Math.hypot(a.ap[0]-pu,a.ap[1]-pv)-Math.hypot(b.ap[0]-pu,b.ap[1]-pv))[0]}
function placeMe(){const s=bestSeat();if(!s){say('Toutes les places sont prises pour l’instant… Patiente un peu.');return}sitAt(s)}
// activités assises : journal, téléphone, jeu (pose et accessoire visibles)
function startAct(k){const d=me();if(C.st!='csit'||R.sit)return false;if(d.eat){d.eat=null;C.seq=null}d.act=k;cfUI(true);return true}
function stopAct(){const d=me();if(!d)return;d.act=null;R.game=null;cfUI(true)}
// ---------- événements du café : registre extensible ----------
// chaque événement : quand il a lieu, ce qu'il prépare à l'arrivée, un éventuel effet pendant la visite, le texte affiché
const CEV=[
 {id:'rdv',when:()=>SV().rdv.some(r=>r.d==(N.day||1)),txt:()=>{const r=SV().rdv.find(r=>r.d==(N.day||1));return r?'Rendez-vous : '+SOCIAL.HB(r.id).nom+' t’attend au café.':''},
  enter:()=>{const r=SV().rdv.find(r=>r.d==(N.day||1)),h=R.npc.find(n=>n.hab==r.id);if(h){h.bub='hey';h.bt=200;h.rdv=1}}},
 {id:'jeux',when:()=>(N.day||1)%7==5&&['soir','nuit'].includes(SOCIAL.period()),txt:()=>'Soirée jeux : les parties rapportent deux fois plus d’amitié ce soir.',bonus:2,
  enter:()=>{const g=FIX.find(f=>f.n=='CT4');g.seats.slice(0,3).forEach((s,i)=>{if(!s.who)seatedClient(s,null,'jeux')})}},
 {id:'rencontre',when:()=>{const day=N.day||1,S=SV();return((day*13+(S.visites||0))%5)==2&&HABS().some(h=>!SOCIAL.SO().met[h.id])},txt:()=>'Une nouvelle tête est installée au café aujourd’hui…',
  enter:()=>{const h=HABS().find(h=>!SOCIAL.SO().met[h.id]&&!R.npc.some(n=>n.hab==h.id));if(!h)return;const s=freeSeats().filter(s=>!mates(s).some(q=>q.who))[0];if(s){const d=seatHab(h.id,s);d.bub='hey';d.bt=200}}}];
window.CAFE_EVENTS=CEV;
// ---------- arrivée, départ ----------
function cfEnter(){R.on=true;R.npc=[];R.q=[];R.orders=[];TASKS.length=0;R.sit=null;R.game=null;R.friend=null;NID=0;SEATS.forEach(s=>{s.who=null;s.res=null;s.items=[];s.dirty=0});
 R.me={me:true,i:-1,seat:null,hand:[],eat:null,act:null,ord:null};
 R.staff=[{i:0,u:BAR.caisse[0],v:BAR.caisse[1],t:0,fl:false,path:null,wait:0,job:null,staff:'barista'},{i:1,u:9,v:5.6,t:0,fl:true,path:null,wait:0,staff:'serveur'}];warm(0,FR_WALK.concat(['cu0','cu1','cu2','wave']));warm(1,FR_WALK);
 const S=SV();S.visites=(S.visites||0)+1;
 // une salle vivante dès l'arrivée : des tables occupées, un petit groupe, quelqu'un au comptoir
 const solo=SEATS.filter(s=>!s.sofa&&tableOf(s).n!='CT4').sort(()=>Math.random()-.5),used=new Set();let n=2+Math.floor(Math.random()*2);for(const s of solo){if(n<=0)break;if(used.has(tableOf(s)))continue;used.add(tableOf(s));seatedClient(s);n--}
 const pairs=FIX.filter(f=>f.n=='CBasse'||f.n=='CT2'&&f.seats.every(s=>!s.who));const tp=pick(pairs);if(tp){const L=tp.n=='CBasse'?SEATS.filter(s=>tableOf(s)===tp):tp.seats;const g='g'+NID;L.forEach(s=>{if(!s.who)seatedClient(s,null,g)})}
 try{habToday().forEach(id=>{const s=freeSeats().filter(s=>!mates(s).some(q=>q.who))[0]||freeSeats()[0];if(s)seatHab(id,s)})}catch(e){}
 if(Math.random()<.8){const c=newClient();c.u=QUEUE[1][0];c.v=QUEUE[1][1];c.a=1;queueJoin(c)}
 R.spawn=rnd(300,700);R.ev=CEV.filter(e=>{try{return e.when()}catch(_){return false}});R.ev.forEach(e=>{try{e.enter&&e.enter()}catch(_){}});
 // sortie « café » avec un ami : il entre avec le joueur
 try{const O=SOCIAL.OUT;if(O&&O.k=='cafe'){friendIn(O.id,false);O.ph='place';O.place='cafe';SOCIAL.CP.on=false}}catch(e){}}
function cfLeaveState(){R.on=false;R.npc=[];R.staff=[];R.q=[];R.orders=[];TASKS.length=0;R.sit=null;R.game=null;R.friend=null;SEATS.forEach(s=>{s.who=null;s.res=null;s.items=[];s.dirty=0});try{UI().closeAll&&UI().closeAll()}catch(e){}PLACES.cafe.furn=FIX.slice();if(C.st=='csit'){C.st='idle';C.alpha=null}}
function leave(){const d=me();if(R.sit)return;const o=d&&d.ord;if(o&&o.st!='done'){say('Ta commande est en préparation : attends-la avant de partir (elle est déjà payée).');R.flash=60;cfUI(true);return}
 try{UI().closeAll&&UI().closeAll()}catch(e){}if(C.st=='csit'){standUp(()=>{d.seat=null;goHome()});return}goHome()}
{const _gh=goHome;goHome=function(dst){if(isC()&&R.on){const d=me();if(C.st=='csit'){standUp(()=>{if(d)d.seat=null;_gh(dst)});return}}return _gh(dst)}}
{const _ar=arrive;arrive=function(d){if(R.on&&d!='cafe')cfLeaveState();_ar(d);if(d!='cafe')return;cfEnter();show('cafe');cfUI(true);
 const fa=C.after;C.after=()=>{if(fa)fa();show('cafe');const S=SV();R.staff[0]&&(R.staff[0].pose='wave',R.staff[0].wait=90,R.staff[0].after=()=>{R.staff[0].pose=null});
  const ev=R.ev&&R.ev.find(e=>e.txt&&e.txt());say(ev?ev.txt():S.visites<=1?'Jade, la barista : « Bienvenue au Café du coin ! Commande au comptoir, puis installe-toi où tu veux. »':pick(['Jade : « Re-bonjour ! Comme d’habitude ? »','Jade : « Salut ! Installe-toi, je m’occupe de toi. »','Ça sent bon le café fraîchement moulu.']));
  try{talkMaybe('cafeLieu',.3)}catch(e){}cfUI(true)}}}
{const _sh=show;show=function(v){if(v=='cafe'&&curV!='cafe')setTimeout(()=>cfUI(true),0);_sh(v)}}
// ---------- boucle ----------
{const _up=update;update=function(){_up();if(!isC()){if(R.on)cfLeaveState();return}if(!R.on)return;
 try{prepTick(prepQ.length>20?4:2);
  baristaTick(R.staff[0]);waiterTick(R.staff[1]);if(R.staff[0].bt>0&&--R.staff[0].bt==0)R.staff[0].bub=null;
  R.npc.forEach(d=>d.friend?friendTick(d):npcTick(d));R.npc=R.npc.filter(d=>{if(d.gone){if(d.seat){if(d.seat.who===d)d.seat.who=null;if(d.seat.res===d)d.seat.res=null}R.q=R.q.filter(x=>x!==d);if(d===R.friend)R.friend=null}return!d.gone});
  R.orders=R.orders.filter(o=>o.st!='done'||o.who.me&&o===me().ord);
  // l'ami de la sortie entre avec le joueur (ou arrive après une invitation par téléphone)
  try{const O=SOCIAL.OUT;if(O&&O.k=='cafe'&&!R.friend){if(O.ph=='go'){O.ph='late';O.arr=tick+360}const late=O.ph=='late';if(late&&(O.arr||0)>tick){}else if(late||SOCIAL.CP.on||O.ph=='place'){friendIn(O.id,late);O.ph='place';O.place='cafe';SOCIAL.CP.on=false}}if(SOCIAL.CP.on&&R.friend)SOCIAL.CP.on=false}catch(e){}
  // nouveaux clients de temps en temps ; la salle n'est jamais vide
  if(--R.spawn<=0){const busy=R.npc.filter(n=>!n.hab).length;R.spawn=rnd(busy<4?260:600,busy<4?520:1300);if(busy<8&&freeSeats().length>3){const g=Math.random()<.3?'g'+NID:null;const c=newClient(g);if(g&&Math.random()<.8){const c2=newClient(g);c2.u-=.8}}}
  // porte qui s'ouvre au passage
  if(R.door>0){R.door--;if(!['door','enter','leave'].includes(C.st)){doorT=1;R.dOpen=1}}else if(R.dOpen){R.dOpen=0;if(!['door','enter','leave','trip'].includes(C.st))doorT=0}
  // ambiance sonore discrète : tasses, murmures
  if(--R.amb<=0){R.amb=rnd(240,600);const r=Math.random();sfx(r<.45?'cfCup':r<.8?'cfMurmur':'rsTick',.35)}
  if(R.steam>0)R.steam--;
  // joueur : installation, consommation, commande prête
  sitTick();const d=me();if(C.st=='csit'&&d.eat)eatTick(d);
  if(d.seat&&C.st!='csit'&&!R.sit&&!(C.path&&C.path.length)&&C.st!='walk'&&d.seat.res===d){d.seat.res=null;d.seat=null}
  // commande prête : le joueur près du comptoir va la chercher ; s'il est déjà assis, le serveur la lui apporte
  if(d.ord&&d.ord.st=='ready'){if(C.st=='csit'&&!R.sit&&!d.ord.table){d.ord.table=true;task(d.ord)}else if(C.st=='idle'&&!(C.path&&C.path.length)&&!d.ord.table&&!d.ord.go){d.ord.go=1;takeOrder()}}
  // au café, le personnage ne se promène pas tout seul entre les tables : il attend tranquillement
  if(C.st=='idle'&&C.idle<5)C.idle=240;
  // personnages dynamiques dans la liste des meubles (tri en profondeur commun)
  const dyn=[],ent=o=>{let k=o.u+o.v+.6;const sx=o.u-o.v;
   // devant un meuble large (comptoir, vitrine) : toujours dessiné après lui
   for(const f of FIX){if(!f.s)continue;const fk=f.x+f.w+f.y+f.h;if(fk<k)continue;if((o.v>=f.y+f.h-.05&&o.u>f.x-.6&&o.u<f.x+f.w+.6)||(o.u>=f.x+f.w-.05&&o.v>f.y-.6&&o.v<f.y+f.h+.6))k=fk+.01}
   for(const f of FIX){if(!f.s)continue;const fk=f.x+f.w+f.y+f.h;if(fk>=k)continue;if(o.u<f.x+f.w+.2&&o.v<f.y+f.h+.2&&sx>f.x-f.y-f.h-.9&&sx<f.x+f.w-f.y+.9)k=fk-.01}return{n:'CWalk',s:0,x:o.u,y:o.v,w:0,h:k-o.u-o.v,p:o}};
  R.staff.forEach(w=>dyn.push(ent(w)));R.npc.forEach(n=>{if(!n.seat||['sitdown','up','upF'].includes(n.st))dyn.push(ent(n))});
  PLACES.cafe.furn=FIX.concat(dyn);
  if(tick%20==0)cfUI();if(R.flash>0)R.flash--}catch(e){console.error(e)}}}
// image du joueur assis : poses « à table » du jeu, avec la tenue portée
{const _sp=spUpdate;spUpdate=function(){if(isC()&&C.st=='csit'&&!creating&&!dressing){const d=me();let nm=dnF(d&&d.eat,C.t,d&&d.act);if(typeof SPR!='undefined'&&!SPR[nm])nm='dn0';const L=N.look,k=nm+JSON.stringify(L);if(k!==spKey&&drawFrame(nm,L))spKey=k;spName=nm;SP.fl=false;return}_sp()}}
// ---------- toucher dans la salle ----------
function mainDoorAt(mx2,my){for(let k=0;k<70;k+=5){const[a,b]=isoInv(mx2,my+k);if(a>-.6&&a<1.3&&b>=DV0-.1&&b<=DV1+.1)return true}return false}
// personnage touché : boîte autour du sprite (debout ou assis)
function whoAt(mx2,my){let best=null,bd=1e9;
 for(const o of R.npc.concat(R.staff)){if(o.sx==null)continue;const sit=o.seat&&o.st=='table',X=o.sx,Y=o.sy,top=Y-(sit?78:86),bot=Y-(sit?6:0);if(mx2<X-11||mx2>X+11||my<top||my>bot)continue;const dd=Math.abs(mx2-X)+Math.abs(my-(top+bot)/2)*.3;if(dd<bd){bd=dd;best=o}}return best}
{const _pt=placeTap;placeTap=function(mx2,my,tu,tv){if(!isC())return _pt(mx2,my,tu,tv);if(R.sit||UI().isOpen&&UI().isOpen())return;
 const on=(f,ks)=>ks.some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x-.1&&a<=f.x+f.w+.1&&b>=f.y-.1&&b<=f.y+f.h+.1}),hitF=ns=>FIX.filter(f=>ns.includes(f.n)).find(f=>on(f,[0,8,16,24,32,40]));
 if(mainDoorAt(mx2,my)){leave();return}const d=me();
 const o=whoAt(mx2,my);
 if(o){if(o.hab){UI().hab&&UI().hab(o.hab,o);return}if(o.staff=='barista'){goCounter(()=>UI().menu&&UI().menu());return}if(o.staff=='serveur'){say('Nino, le serveur : « Installe-toi, je t’apporte ce que tu veux à table ! »');return}
  say(pick(['Un habitué savoure son café en silence.','Deux clients discutent du dernier film au cinéma.','Quelqu’un pianote sur son téléphone.','Une cliente lit le journal du quartier.','« Bonjour ! » te lance-t-on avec un sourire.']));o.bub='hey';o.bt=60;return}
 let f;
 if(f=hitF(['CT2','CT4','CBox','CSofa','CBasse'])){const[a,b]=isoInv(mx2,my+16),L=f.n=='CBasse'?SEATS.filter(s=>tableOf(s)===f):f.seats;
  if(d.seat&&L.includes(d.seat)&&C.st=='csit'){const it=myItems()[0];if(d.eat||it)consume(it);else UI().menu&&UI().menu();return}
  const fr=L.filter(s=>!s.who&&(!s.res||s.res===d));if(!fr.length){say('Cette table est occupée.');return}const s=fr.sort((p,q)=>Math.hypot(p.cu-a,p.cv-b)-Math.hypot(q.cu-a,q.cv-b))[0];sitAt(s);return}
 if(C.st=='csit'){standUp();say(NAME()+' se lève.');return}
 if(f=hitF(['CComptoir','CMach','CEnd'])){if(d.ord&&d.ord.st=='ready'){takeOrder();return}goCounter(()=>UI().menu&&UI().menu());return}
 if(f=hitF(['CVitrine'])){goCounter(()=>UI().menu&&UI().menu('f'));return}
 if(f=hitF(['CFrigo'])){say('Le frigo à jus : orange pressée, citronnade, jus de pomme… bien frais.');return}
 if(f=hitF(['CJourn'])){goto((f.x+f.w+.6)*12,88+(f.y+.4)*5,()=>{say(NAME()+' prend la Gazette du quartier. Installe-toi pour la lire.');d.paper=1;cfUI(true)});return}
 if(tu<0||tv<0||tu>RN||tv>RN)return;goto(tu*12,88+tv*5)}}
// ---------- panneau du bas ----------
function tile(g,label,sub,fn,dis,cls){const b=document.createElement('button');b.className='tile'+(cls?' '+cls:'');b.innerHTML=label+(sub?'<small>'+sub+'</small>':'');b.disabled=!!dis;b.onclick=fn;g.append(b);return b}
function cfUI(force){const g=document.getElementById('cafeG'),info=document.getElementById('cfInfo'),wh=document.getElementById('cfWhere');if(!g||!isC()||!R.on)return;const d=me();if(!d)return;
 const seated=C.st=='csit'&&!R.sit,o=d.ord,mine=myItems(),f=R.friend,fn=f?SOCIAL.HB(f.hab).nom:'';
 if(wh)wh.textContent=seated&&d.seat?(d.seat.sofa?'Canapé':d.seat.booth?'Banquette':d.seat.f.n=='CT4'?'Grande table':'Table '+d.seat.f.no):'Café du coin';
 let msg='';if(o&&o.st!='done'){const p=o.its.map(it=>it.st=='prep'?Math.min(99,Math.round(100*it.t/it.T)):it.st=='ready'?100:0);msg=o.st=='ready'?(o.table?'Commande prête : Nino te l’apporte':'Commande prête : va la chercher au comptoir'):'En préparation : '+o.its.map((it,i)=>it.m.n+' '+(it.st=='queue'?'(en attente)':p[i]+' %')).join(' · ')}
 else if(d.hand&&d.hand.length)msg='En main : '+d.hand.map(it=>it.m.n).join(', ')+' · touche une table libre pour t’installer';
 else if(seated)msg=d.act=='journal'?'Lecture de la Gazette du quartier':d.act=='tel'?'Sur ton téléphone':d.act=='jeu'?'Partie en cours':mine.length?'Sur ta table : '+mine.map(it=>it.m.n+(it.por<1?' (entamé)':'')).join(', '):'Installé'+(N.look.g=='f'?'e':'')+' · commande quelque chose au serveur';
 else msg=(R.ev&&R.ev[0]&&R.ev[0].txt&&R.ev[0].txt())||'Commande au comptoir, puis installe-toi à une table libre';
 if(f)msg+=' · '+fn+' est avec toi';if(info){info.innerHTML=msg;info.classList.toggle('rsFlash',R.flash>0)}
 const habs=R.npc.filter(n=>n.hab&&!n.friend&&n.st=='table');
 const k=JSON.stringify([seated,!!R.sit,o&&o.st,mine.map(it=>it.m.k+(it.por<1?'p':'')),!!d.eat,d.act,(d.hand||[]).length,N.coins|0,d.seat&&d.seat.id,!!f,f&&f.st=='table',habs.map(h=>h.hab),!!d.paper]);if(!force&&k===R.uiK)return;R.uiK=k;g.innerHTML='';
 if(!seated){
  if(o&&o.st=='ready'&&!o.table)tile(g,'Prendre ma commande',o.its.map(it=>it.m.n).join(', '),takeOrder,false,'rsBillT');
  else tile(g,'Commander','Au comptoir · '+CM.length+' gourmandises',()=>goCounter(()=>UI().menu&&UI().menu()),o&&o.st!='done');
  tile(g,d.hand&&d.hand.length?'S’installer avec ma commande':'S’installer',f?'Une table pour deux':'La place libre la plus proche',placeMe,!!R.sit);
  if(!d.paper)tile(g,'Prendre le journal','Au présentoir, près de la porte',()=>{const j=FIX.find(x=>x.n=='CJourn');goto((j.x+j.w+.6)*12,88+(j.y+.4)*5,()=>{d.paper=1;say(NAME()+' prend la Gazette du quartier.');cfUI(true)})});
  habs.slice(0,2).forEach(h=>tile(g,'Parler à '+SOCIAL.HB(h.hab).nom,SOCIAL.tierName(SOCIAL.rel(h.hab,true).pts,SOCIAL.HB(h.hab).g),()=>UI().hab&&UI().hab(h.hab,h)));
  return}
 const it=mine.find(x=>x.m.c=='b')||mine[0],food=mine.find(x=>x.m.c=='f');
 if(d.eat)tile(g,'Pause','Poser '+(d.eat.it.m.c=='b'?'la tasse':'la pâtisserie'),()=>consume());
 else{if(it&&it.m.c=='b')tile(g,'Boire',it.m.n+' · une gorgée',()=>consume(it));if(food)tile(g,'Manger',food.m.n+' · une bouchée',()=>consume(food));if(!it&&!food)tile(g,'Commander','Le serveur l’apporte à ta table',()=>UI().menu&&UI().menu(),o&&o.st!='done')}
 if(it||food)tile(g,'Commander','Autre chose ? Service à table',()=>UI().menu&&UI().menu(),o&&o.st!='done');
 tile(g,'Jouer','Échecs, cartes, Puissance 4',()=>UI().games&&UI().games());
 tile(g,'Journal','La Gazette du quartier',()=>UI().journal&&UI().journal());
 tile(g,'Téléphone','Messages, inviter un ami',()=>UI().phone&&UI().phone());
 if(f&&f.st=='table')tile(g,'Discuter avec '+fn,'Passer un bon moment',()=>UI().hab&&UI().hab(f.hab,f));
 habs.filter(h=>!mates(d.seat).includes(h.seat)).slice(0,1).forEach(h=>tile(g,'Parler à '+SOCIAL.HB(h.hab).nom,'Habitant du quartier',()=>UI().hab&&UI().hab(h.hab,h)));
 tile(g,'Se lever',(mine.length?'Ta commande reste en main':'Libérer la place'),()=>{standUp();say(NAME()+' se lève.')})}
// ---------- initialisation du panneau ----------
(function init(){const v=document.getElementById('v-cafe');if(!v)return;const b=v.querySelector('.opts .on');if(b){b.id='cfWhere';b.textContent='Café du coin'}
 if(!document.getElementById('cfInfo')){const p=document.createElement('p');p.className='rsInfo';p.id='cfInfo';v.insertBefore(p,document.getElementById('cafeG'))}
 const h=document.getElementById('cafeHome');if(h)h.onclick=leave})();
// l'ancien comptoir du jeu (boutons de boissons) est remplacé par le panneau du café
try{cafeDraw=function(){cfUI(true)}}catch(e){}
try{cafeOrder=function(){goCounter(()=>UI().menu&&UI().menu())}}catch(e){}
// ---------- objectif ----------
try{if(typeof GOALS!='undefined'&&!GOALS.some(g=>g.id=='cafeAmi'))GOALS.push({id:'cafeAmi',t:'Prendre un verre au café avec un ami',r:10,ok:()=>(N.cafe2&&N.cafe2.amis||0)>=1})}catch(e){}
try{LINES.cafeLieu=['Ça sent bon le café fraîchement moulu.','On se pose un moment ?','J’adore l’ambiance de ce café.','Un petit cappuccino, ça te dit ?']}catch(e){}
window.CAFE={nLook,R,CM,CK,FIX,SEATS,SV,me,sitAt,standUp,placeMe,placeOrder,takeOrder,goCounter,consume,startAct,stopAct,cfUI,leave,friendIn,friendShared,mates,tableOf,seatName,bestSeat,habToday,CEV,order,effect,QUEUE,PICK,CAISSE,nImg,isC}})();
