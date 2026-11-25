// ===== RESTAURANT : le restaurant de la rue devient un vrai lieu de vie =====
// Salle isométrique (tables, banquettes, accueil, cuisine ouverte, aquarium, décor mural), serveurs et clients animés,
// carte illustrée, commande → cuisine → service à table, animations de repas, addition payée en pièces.
// S'appuie sur le moteur des lieux du jeu (PLACES / PLD / placeBG / drawWorld / findPath), comme le cinéma.
(function(){
const INK='#1a1420',WOOD='#7a4a2c',WOODL='#9a6440',WOODD='#55321c',CLOTH='#f6efe0',CLOTHD='#e0d3ba',BORDO='#8e2a36',BORDOL='#b04450',GOLD='#d4af37',STEEL='#a9b3bd',STEELL='#d5dce2',STEELD='#7d8790';
const isR=()=>place=='resto';
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const sfx=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.05)}catch(e){}};
// ---------- la carte ----------
const CATS=[{k:'e',n:'Entrées'},{k:'p',n:'Plats'},{k:'d',n:'Desserts'},{k:'b',n:'Boissons'}];
const MENU=[
 {k:'salade',c:'e',n:'Salade composée',p:8,d:'Mesclun croquant, tomates cerises, maïs, œuf et vinaigrette maison.',h:14,j:4,u:'fork',col:'#6cc04a'},
 {k:'nuggets',c:'e',n:'Nuggets',p:7,d:'Six nuggets de poulet bien croustillants et leur sauce barbecue.',h:16,j:6,u:'main',col:'#e0a848'},
 {k:'bruschetta',c:'e',n:'Bruschetta',p:6,d:'Pain grillé, tomates fraîches, basilic et filet d’huile d’olive.',h:12,j:5,u:'main',col:'#d0603a'},
 {k:'burger',c:'p',n:'Burger',p:14,d:'Steak haché, cheddar fondant, salade et tomate. Servi avec des frites.',h:40,j:8,u:'main',col:'#c07a3a'},
 {k:'pizza',c:'p',n:'Pizza',p:13,d:'Sauce tomate, mozzarella filante, chorizo et basilic frais.',h:36,j:8,u:'main',col:'#e8a040'},
 {k:'pates',c:'p',n:'Pâtes',p:12,d:'Spaghetti, sauce tomate mijotée et copeaux de parmesan.',h:34,j:6,u:'fork',col:'#f0c860'},
 {k:'steak',c:'p',n:'Steak-frites',p:18,d:'Pièce de bœuf grillée, frites dorées et sauce au poivre.',h:44,j:8,u:'fork',col:'#8a4a2a'},
 {k:'poulet',c:'p',n:'Poulet et accompagnement',p:15,d:'Cuisse de poulet rôtie, riz parfumé et haricots verts.',h:38,j:6,u:'fork',col:'#d89a50'},
 {k:'glace',c:'d',n:'Glace',p:5,d:'Trois boules fraise, vanille et chocolat, avec une gaufrette.',h:8,j:10,u:'spoon',col:'#f2a0b8'},
 {k:'gateau',c:'d',n:'Gâteau au chocolat',p:6,d:'Moelleux au cœur fondant, crème fouettée et framboise.',h:10,j:12,u:'fork',col:'#5a3020'},
 {k:'tarte',c:'d',n:'Tarte aux fruits',p:6,d:'Pâte sablée, crème pâtissière, fraises et kiwis.',h:10,j:10,u:'fork',col:'#e85a5a'},
 {k:'crepes',c:'d',n:'Crêpes',p:5,d:'Deux crêpes dorées, chocolat fondu et sucre glace.',h:10,j:10,u:'main',col:'#e0b060'},
 {k:'eau',c:'b',n:'Eau',p:2,d:'Une carafe d’eau bien fraîche et son verre.',h:0,j:2,u:'drink',col:'#bfe6f5'},
 {k:'soda',c:'b',n:'Soda',p:3,d:'Pétillant et bien frais, avec glaçons et paille.',h:2,j:5,u:'drink',col:'#7a2a1a'},
 {k:'jus',c:'b',n:'Jus de fruits',p:4,d:'Jus d’orange pressé minute, plein de vitamines.',h:4,j:5,u:'drink',col:'#f5a020'}];
const MK={};MENU.forEach(m=>{MK[m.k]=m;m.co=m.c=='b'||m.c=='e'?0:m.c=='p'?1:2;m.n2=m.c=='b'?3:m.c=='p'?5:3});
// durées de cuisson (images à 60 i/s) : un service raisonnable, sans attente pénible
const COOK={b:110,e:330,p:480,d:270};
// gestes de repas selon le plat : fourchette, à la main, cuillère, verre
const SEQ={fork:[['reach',16],['eat',20],['chew',34],['sit',12]],main:[['reach',14],['eat',24],['chew',44],['sit',10]],spoon:[['reach',12],['eat',16],['chew',22],['sit',10]],drink:[['reach',14],['drink',56],['sit',16]]};
// ---------- la salle ----------
const TBL=[[3.6,6],[7.6,6],[11.6,6],[15.6,6],[5.6,10.4],[9.6,10.4],[13.6,10.4],[4.6,14.8],[8.6,14.8],[12.6,14.8]];
const BOX=[9.8,12.9,16];
const FIX=[
 {n:'RCuis',x:.3,y:.2,w:2,h:1.1,s:1,k:0},{n:'RCuis',x:2.3,y:.2,w:2,h:1.1,s:1,k:1},{n:'RCuis',x:4.3,y:.2,w:2,h:1.1,s:1,k:2},{n:'RCuis',x:6.3,y:.2,w:2.1,h:1.1,s:1,k:3},
 {n:'RPasse',x:.9,y:3,w:7,h:.8,s:1},
 {n:'Plante',x:8.6,y:.35,w:.9,h:.9,s:1},
 {n:'RAqua',x:.15,y:4.4,w:.75,h:3.2,s:1},{n:'Plante',x:.25,y:8.7,w:.9,h:.9,s:1},
 {n:'RAccueil',x:1.3,y:10,w:1.2,h:2.4,s:1},
 {n:'Plante',x:.25,y:17.6,w:.9,h:.9,s:1},{n:'Plante',x:19,y:12.6,w:.9,h:.9,s:1},{n:'Plante',x:19,y:17.6,w:.9,h:.9,s:1},{n:'Plante',x:19,y:8.4,w:.9,h:.9,s:1}];
TBL.forEach(([x,y],i)=>FIX.push({n:'RTable',x,y,w:2.4,h:2.4,s:1,id:'t'+i,no:i+1}));
BOX.forEach((x,i)=>FIX.push({n:'RBox',x,y:.15,w:2.4,h:2.6,s:1,id:'b'+i,no:TBL.length+i+1}));
PLACES.resto={nom:'le restaurant',titre:'Restaurant',rn:20,wall:'#efdcc0',door:'#6b3e26',floor:'wood',fa:'#a8724a',fb:'#9a6842',furn:FIX.slice()};
VT.resto='Restaurant';
// places assises : chaise du fond (vue de face, comme à la maison), chaise de gauche, banquette
const SEATS=[];
FIX.forEach(f=>{if(f.n=='RTable'){f.seats=[mkSeat(f,0),mkSeat(f,1)];SEATS.push(...f.seats)}else if(f.n=='RBox'){f.seats=[mkSeat(f,2)];SEATS.push(...f.seats)}});
function mkSeat(f,k){const{x,y,w,h}=f;let s;
 if(k==0)s={r:0,cu:x+1.6,cv:y+.45,ap:[x+w+.5,y+.45],pu:x+1.7,pv:y+1.15,gu:x+2.12,gv:y+.95,ch:[x+1.2,y+.05,.8,.7]};
 else if(k==1)s={r:1,cu:x+.45,cv:y+1.6,ap:[x+.45,y+h+.7],pu:x+1.15,pv:y+1.7,gu:x+.95,gv:y+2.12,ch:[x+.05,y+1.2,.7,.8]};
 else s={r:0,cu:x+1.2,cv:y+.5,ap:[x+1.2,y+h+.75],pu:x+1.05,pv:y+1.4,gu:x+1.72,gv:y+1.25,booth:1};
 return Object.assign(s,{f,k,id:f.id+'_'+k,who:null})}
// ---------- état ----------
const R={on:false,me:null,npc:[],wt:[],tasks:[],kit:{q:[]},host:{t:0,wave:0},chef:[{u:2.8,tu:2.8,t:0},{u:5.6,tu:5.6,t:0}],menu:null,bill:null,cart:{},spawn:0,door:0,fx:[],sit:null,stamp:0};
function ST(){if(!N.resto)N.resto={visites:0,repas:0,depense:0,plats:{},hist:[]};const S=N.resto;S.plats=S.plats||{};S.hist=S.hist||[];return S}
// ---------- personnages non joueurs : images tirées de la garde-robe du jeu ----------
const LOOKS=[
 {g:'m',sk:1,hc:0,wd:{cheveux:'nat|0',haut:'shirt|0',bas:'chino|3',chaussures:'mocass|0'}},// serveur
 {g:'f',sk:0,hc:3,wd:{cheveux:'bun|3',haut:'blouse|0',bas:'chino|3',chaussures:'ballerine|0'}},// serveuse
 {g:'m',sk:2,hc:1,wd:{cheveux:'nat|1',haut:'teeb|0',bas:'chino|0',chaussures:'basket|0'}},// chef
 {g:'f',sk:1,hc:2,wd:{cheveux:'top|2',haut:'teeb|0',bas:'chino|0',chaussures:'basket|1'}},// cuisinière
 {g:'f',sk:2,hc:3,wd:{cheveux:'long|3',haut:'blouse|2',bas:'longue|1',chaussures:'bottine|0'}},// hôtesse
 {g:'f',sk:2,hc:3,wd:{cheveux:'bun|1',haut:'blouse|2',bas:'jupe|1',chaussures:'bottine|0'}},{g:'m',sk:1,hc:0,wd:{cheveux:'mi|0',haut:'polo|3',bas:'cargo|1',chaussures:'running|2'}},
 {g:'f',sk:0,hc:1,wd:{cheveux:'tails|2',haut:'hoodie|4',bas:'legging|0',chaussures:'basket|3'}},{g:'m',sk:2,hc:2,wd:{cheveux:'top|1',haut:'tee|5',bas:'jean|1',veste:'vjean|0',chaussures:'basket|0'}},
 {g:'f',sk:1,hc:0,wd:{cheveux:'long|1',haut:'pull|1',bas:'plisse|2',chaussures:'mocass|1'}},{g:'m',sk:0,hc:4,wd:{cheveux:'nat|0',haut:'flan|2',bas:'chino|0',chaussures:'bottes|1',tete:'bonnet|2'}},
 {g:'m',sk:1,hc:2,wd:{cheveux:'nat|2',haut:'pull|3',bas:'jean|0',veste:'blazer|1',chaussures:'mocass|0'}},{g:'f',sk:2,hc:0,wd:{cheveux:'mi|2',haut:'mari|0',bas:'shortj|0',chaussures:'sandale|1'}}];
const CLIENTS=[5,6,7,8,9,10,11,12];
const NCC=new Map();let prepQ=[];
function nLook(i){const B=Object.assign({},N.look);delete B.nu;delete B.lf;return Object.assign(B,LOOKS[i],{wd:Object.assign({},LOOKS[i].wd)})}
const nImg=(i,nm)=>{const c=NCC.get(i+'|'+nm);if(!c&&!prepQ.some(q=>q[0]==i&&q[1]==nm))prepQ.push([i,nm]);return c};
function prepTick(n){let did=false;while(n-->0&&prepQ.length){const[i,nm]=prepQ.shift();const k=i+'|'+nm;if(NCC.has(k))continue;try{if(drawFrame(nm,nLook(i))){const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.drawImage(sc2,0,0);if(i==2||i==3)toque(c,g);NCC.set(k,c);did=true}}catch(e){}}if(did)spKey=''}
// toque blanche des cuisiniers, posée sur le haut de la tête
function toque(c,g){const d=g.getImageData(0,0,c.width,c.height).data;let top=-1,a=1e9,b=-1;for(let y=0;y<c.height&&top<0;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>200){top=y;break}
 if(top<0)return;for(let y=top;y<top+6;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>200){if(x<a)a=x;if(x>b)b=x}c.tq={top,cx:Math.round((a+b)/2),w:Math.max(12,b-a-2)}}
// dessinée par-dessus l'image (le haut de l'image est trop près du bord pour l'y inclure)
function toqueDraw(img,X,Y,fl){const q=img.tq;if(!q)return;const g=G,x0=Math.round(X-CW/2),cx=fl?Math.round(2*X-(x0+q.cx)):x0+q.cx,top=Math.round(Y-CH+1)+q.top,w=q.w;
 g.fillStyle=INK;g.fillRect(cx-w/2-1,top-11,w+2,13);g.fillRect(cx-w/2-3,top-17,w+6,8);g.fillStyle='#ffffff';g.fillRect(cx-w/2,top-10,w,11);g.fillRect(cx-w/2-2,top-16,w+4,7);g.fillStyle='#dfe6ea';g.fillRect(cx-w/2,top-2,w,2);g.fillRect(cx-w/2+3,top-14,1,4);g.fillRect(cx+2,top-14,1,4)}
// ---------- petites illustrations des plats posés sur la table (pixel art, grille 10 × 7) ----------
const PIX={
 burger:[[2,0,6,1,'#d68a3c'],[1,1,8,1,'#e8a04a'],[3,1,1,1,'#fff3c8'],[6,1,1,1,'#fff3c8'],[1,2,8,1,'#6cc04a'],[1,3,8,1,'#f5c84c'],[1,4,8,1,'#5a3020'],[1,5,8,1,'#d68a3c'],[9,1,1,4,'#f5d65a']],
 pizza:[[2,1,6,1,'#d9963a'],[1,2,8,3,'#f3d27a'],[2,5,6,1,'#d9963a'],[1,2,1,3,'#d9963a'],[8,2,1,3,'#d9963a'],[3,2,1,1,'#b02a2a'],[6,3,1,1,'#b02a2a'],[4,4,1,1,'#b02a2a'],[5,2,1,1,'#3a8a3a']],
 pates:[[2,1,6,4,'#f0c860'],[1,2,8,2,'#f0c860'],[3,2,4,1,'#e0b048'],[3,4,4,1,'#e0b048'],[4,1,3,2,'#c8402f'],[5,0,1,1,'#3a8a3a'],[6,1,1,1,'#fff6d0']],
 steak:[[1,2,5,3,'#7a3a22'],[1,2,5,1,'#9a5030'],[2,3,1,2,'#4a2214'],[4,3,1,2,'#4a2214'],[6,2,1,3,'#f5d65a'],[7,1,1,4,'#e8c040'],[8,2,1,3,'#f5d65a'],[9,1,1,4,'#e8c040']],
 poulet:[[1,2,4,3,'#c87a30'],[1,2,3,1,'#e09a48'],[5,2,1,1,'#f6efe0'],[6,1,1,1,'#f6efe0'],[6,3,1,1,'#f6efe0'],[7,1,3,2,'#f8f4e6'],[6,4,4,1,'#4a9a3a']],
 salade:[[1,1,8,4,'#4f9a3a'],[2,0,6,2,'#6cc04a'],[2,2,1,1,'#e04a3a'],[7,1,1,1,'#e04a3a'],[5,3,1,1,'#e04a3a'],[4,1,1,1,'#f5d65a'],[7,3,1,1,'#f5d65a'],[3,3,1,1,'#fff7e0']],
 nuggets:[[1,1,2,2,'#d9963a'],[3,2,2,2,'#e0a848'],[1,4,2,1,'#d08a30'],[5,1,2,2,'#e0a848'],[4,4,2,1,'#d9963a'],[1,1,1,1,'#f0c070'],[5,1,1,1,'#f0c070'],[7,2,3,2,'#f6efe0'],[8,2,1,1,'#9a3020']],
 bruschetta:[[0,2,3,3,'#c8904a'],[3,1,3,3,'#d09a50'],[6,2,3,3,'#c8904a'],[1,2,1,1,'#e04a3a'],[4,1,1,1,'#e04a3a'],[7,2,1,1,'#e04a3a'],[2,3,1,1,'#3a8a3a'],[4,2,1,1,'#3a8a3a'],[7,3,1,1,'#d8402f']],
 glace:[[3,4,4,1,'#cfe6f0'],[4,5,2,1,'#cfe6f0'],[2,2,2,2,'#f2a0b8'],[4,1,2,3,'#fff3d6'],[6,2,2,2,'#6a3a22'],[7,0,1,3,'#e8c070']],
 gateau:[[2,2,6,3,'#5a3020'],[2,2,6,1,'#3a1a10'],[2,3,6,1,'#7a4a30'],[6,0,2,2,'#fffaf0'],[7,0,1,1,'#d0304a']],
 tarte:[[1,2,8,3,'#d9a050'],[2,2,6,2,'#f8e0a0'],[2,2,1,1,'#e0304a'],[5,2,1,1,'#6cc04a'],[7,2,1,1,'#e0304a'],[3,3,1,1,'#6cc04a'],[6,3,1,1,'#e0304a']],
 crepes:[[1,2,7,2,'#e8b860'],[2,4,5,1,'#e0a850'],[2,1,4,1,'#f0c878'],[2,2,5,1,'#5a3020'],[6,3,1,1,'#ffffff']]};
// échelle des petits objets : suit la taille des cases
const SC=()=>Math.max(1,Math.round(TW/12));
function pixFood(k,X,Y,por,sc){const L=PIX[k];if(!L)return;const cut=10*(1-Math.max(0,Math.min(1,por)));for(const[x,y,w,h,c]of L){const x0=Math.max(x,cut);if(x0>=x+w)continue;G.fillStyle=c;G.fillRect(X+Math.round(x0*sc),Y+y*sc,Math.round((x+w-x0)*sc),h*sc)}
 if(por<1&&por>0){G.fillStyle='rgba(255,255,255,.35)';G.fillRect(X+Math.round(cut*sc),Y+2*sc,sc,2*sc)}}
function glass(X,Y,m,lvl,sc){const h=6*sc,w=3*sc;G.fillStyle='#2a3550';G.fillRect(X-1,Y-h-1,w+2,h+2);G.fillStyle='#d9f1fa';G.fillRect(X,Y-h,w,h);const l=Math.round((h-sc)*Math.max(0,lvl));if(l>0){G.fillStyle=m.col;G.fillRect(X,Y-l,w,l)}
 if(m.k=='soda'){G.fillStyle='#e84a4a';G.fillRect(X+w-1,Y-h-3*sc,1,3*sc+2)}if(m.k=='jus'&&lvl>.2){G.fillStyle='#ffb84a';G.fillRect(X-2,Y-h-1,2,2)}}
// ---------- illustrations de la carte (vectorielles, nettes à toutes les tailles) ----------
function art(g,k,W,H){const s=Math.min(W/120,H/90);g.save();g.translate((W-120*s)/2,(H-90*s)/2);g.scale(s,s);g.lineJoin='round';g.lineCap='round';
 const E=(x,y,a,b,c,r)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,a,b,r||0,0,Math.PI*2);g.fill()},Ci=(x,y,r,c)=>E(x,y,r,r,c),
  P=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()},
  L=(pts,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()},
  RR=(x,y,w,h,r,c,rot)=>{g.save();g.translate(x,y);if(rot)g.rotate(rot);g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(-w/2,-h/2,w,h,r);else g.rect(-w/2,-h/2,w,h);g.fill();g.restore()},
  fries=(x,y,n)=>{for(let i=0;i<n;i++){const a=-.5+i*.18,xx=x+i*3.2;RR(xx,y-8+Math.sin(i*2.3)*3,4,22,1.5,i%2?'#f5d65a':'#e8bf3a',a);RR(xx+.6,y-12+Math.sin(i*2.3)*3,1.4,12,.7,'#fff0a0',a)}},
  leaf=(x,y,r,a,c)=>{E(x,y,r,r*.5,c,a);L([[x-Math.cos(a)*r*.8,y-Math.sin(a)*r*.8],[x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8]],'rgba(255,255,255,.35)',.8)};
 const m=MK[k];
 if(m.c!='b'){E(60,60,55,25,'rgba(60,30,20,.16)');E(60,55,54,26,'#ddd6c8');E(60,53.5,53,25,'#fffdf8');E(60,55,39,17.5,'#f3eee4');E(60,55,36,16,'#faf7f0')}
 else{E(60,80,26,6,'rgba(60,30,20,.18)');E(60,78,24,5.5,'#b88a5a');E(60,77,22,4.6,'#d4a874')}
 switch(k){
 case'burger':fries(76,52,7);RR(54,63,46,9,4.5,'#c8813a');E(54,57,25,6,'#4a2414');E(54,55.5,24,5,'#6a3a22');P([[30,52],[78,52],[72,58],[64,54],[56,60],[48,54],[40,59],[34,54]],'#f5c84c');
  for(let i=0;i<6;i++)E(34+i*8,50,6,3,'#6cc04a',i*.4);E(42,48,7,2.6,'#e04a3a');E(64,48,7,2.6,'#d8402f');
  g.fillStyle='#e8a04a';g.beginPath();g.ellipse(54,46,26,15,0,Math.PI,0);g.fill();g.fillStyle='#f4b866';g.beginPath();g.ellipse(48,40,12,6,-.3,0,Math.PI*2);g.fill();
  [[44,38],[54,35],[62,40],[50,43],[66,45],[40,44]].forEach(([x,y])=>E(x,y,1.8,1,'#fff6d6',.4));break;
 case'pizza':E(60,55,42,20,'#c8803a');E(60,54,40,18.5,'#e0a048');E(60,54,35,15.5,'#c8402f');E(60,53.5,33,14.5,'#f3d27a');
  [[44,50],[58,46],[72,52],[50,60],[66,60],[60,54]].forEach(([x,y])=>{E(x,y,5,2.8,'#a82a2a');E(x-1,y-.8,2,1,'#d05050')});
  [[52,52,.6],[68,47,-.4],[40,57,.2]].forEach(([x,y,a])=>leaf(x,y,4,a,'#3a8a3a'));L([[60,39],[60,69]],'rgba(120,60,20,.35)',.8);L([[26,54],[94,54]],'rgba(120,60,20,.35)',.8);break;
 case'pates':E(60,56,32,13,'#e6b44a');for(let i=0;i<7;i++){g.strokeStyle=i%2?'#f3cf6a':'#e0b048';g.lineWidth=1.6;g.beginPath();g.ellipse(60,55-i*.8,28-i*3.4,11-i*1.2,0,0,Math.PI*2);g.stroke()}
  E(60,49,15,6.5,'#c8402f');E(57,47.5,6,2.4,'#e05a40');[[54,48],[63,47],[59,51],[66,50]].forEach(([x,y])=>RR(x,y,3.4,2,.6,'#fff6d0',.3));leaf(66,45,4.5,.5,'#3a8a3a');leaf(71,47,3.5,-.3,'#4a9a3a');break;
 case'steak':fries(74,50,8);E(46,58,25,12,'#5a2a18',-.12);E(45,55,24,11,'#8a4428',-.12);E(42,52,12,4,'#a8603a',-.12);
  for(let i=0;i<4;i++)L([[30+i*8,62],[40+i*8,48]],'#4a2214',2.2);E(40,66,9,3,'#c89a5a');E(38,65.5,4,1.2,'#e0b878');break;
 case'poulet':E(78,56,17,8,'#f8f4e6');for(let i=0;i<14;i++)E(66+(i*7)%24,51+(i*5)%10,1.6,.9,'#fffdf5',i);
  for(let i=0;i<5;i++)L([[64+i*4,64],[70+i*4,60]],i%2?'#4a9a3a':'#3a8a2a',2.2);
  E(44,55,19,12,'#a85a20',-.35);E(43,52,17,10,'#c87a30',-.35);E(39,48,7,3.5,'#e8a858',-.4);L([[57,47],[68,40]],'#f6efe0',4);Ci(69,38,3.2,'#fffaf0');Ci(71,41,3,'#fffaf0');leaf(30,60,3.5,.3,'#3a8a3a');break;
 case'salade':for(let i=0;i<11;i++){const a=i/11*Math.PI*2;leaf(60+Math.cos(a)*22,54+Math.sin(a)*9,9,a+1.2,i%3?'#5aa83a':'#7ad050')}for(let i=0;i<6;i++)leaf(60+Math.cos(i)*10,52+Math.sin(i*2)*4,8,i,'#8ad860');
  [[46,50],[72,49],[58,60],[66,57]].forEach(([x,y])=>{Ci(x,y,4.2,'#e04a3a');Ci(x-1.3,y-1.3,1.3,'#ff9a8a')});[[52,55],[64,51],[70,58],[48,58],[60,47]].forEach(([x,y])=>Ci(x,y,1.6,'#f5d65a'));
  E(56,52,6,4,'#fffdf2');Ci(56,52,2.4,'#f5c84c');E(68,62,5,3.4,'#fffdf2');Ci(68,62,2,'#f5c84c');break;
 case'nuggets':[[40,52],[52,58],[46,62],[60,50],[64,60],[36,60]].forEach(([x,y],i)=>{E(x,y,8,5.5,'#b8742a',i);E(x,y-1,7.5,5,'#e0a848',i);E(x-2,y-2.5,3,1.5,'#f6cc80',i)});
  E(82,58,11,6,'#d8d0c4');E(82,56.5,11,5.5,'#ffffff');E(82,56.5,8.5,4,'#8a2a1a');E(80,55.5,3,1.3,'#b84a30');break;
 case'bruschetta':[[38,56,-.2],[60,52,.05],[82,57,.25]].forEach(([x,y,a])=>{RR(x,y+2,24,14,5,'#a86a2a',a);RR(x,y,24,13,5,'#d8a050',a);RR(x,y-.5,19,9,4,'#f0c878',a);
   for(let i=0;i<6;i++)RR(x-7+(i%3)*7,y-2+Math.floor(i/3)*4,3.4,3,.8,i%2?'#e04a3a':'#c8302a',a);leaf(x+5,y-3,3,a+.6,'#3a8a3a')});break;
 case'glace':E(60,68,14,4,'#bcd8e4');RR(60,62,5,12,2,'#cfe6f0');E(60,52,24,9,'#d9f1fa');E(60,50,22,7,'#eef9fd');Ci(48,42,10,'#f2a0b8');Ci(46,39,4,'#f8c4d4');Ci(72,42,10,'#6a3a22');Ci(70,39,4,'#8a5a3a');Ci(60,34,10.5,'#fff3d6');Ci(57,31,4,'#ffffff');
  RR(78,30,5,24,1.4,'#e8c070',.5);for(let i=0;i<3;i++)L([[75+i*2,22+i*5],[83+i*2,26+i*5]],'#c8984a',.7);leaf(62,24,4,.4,'#4ab04a');break;
 case'gateau':P([[34,58],[70,48],[88,60],[52,72]],'#4a2414');P([[34,58],[52,72],[52,80],[34,66]],'#5a3020');P([[52,72],[88,60],[88,68],[52,80]],'#3e1c10');
  L([[34,62],[52,76]],'#7a4a30',1.4);L([[52,76],[88,64]],'#6a3a22',1.4);P([[36,57],[70,47.5],[86,59],[52,70]],'#5a2a14');for(let i=0;i<4;i++)RR(40+i*12,60+i*3,3,8,1.5,'#3a1a10');
  E(64,50,10,6,'#fffaf0');E(64,46,6,4,'#ffffff');Ci(65,41,3.4,'#d0304a');[[64,40],[66,42],[63,42]].forEach(([x,y])=>Ci(x,y,.6,'#ff8a9a'));leaf(70,42,3,-.6,'#4ab04a');break;
 case'tarte':E(60,58,38,15,'#b8803a');E(60,55,37,14,'#d9a050');E(60,54,32,11.5,'#f8e0a0');
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=60+Math.cos(a)*20,y=54+Math.sin(a)*7;if(i%2){Ci(x,y,5,'#6cc04a');Ci(x,y,3.6,'#9ad870');Ci(x,y,1,'#2a2a1a')}else{E(x,y,5.5,4,'#e0304a',a);E(x-1,y-1,1.8,1,'#ff8a9a')}}
  Ci(60,54,5,'#e0304a');Ci(59,53,1.6,'#ff8a9a');break;
 case'crepes':P([[30,62],[84,50],[62,40]],'#d8a050');P([[30,62],[84,50],[74,64]],'#e8b860');P([[38,58],[90,58],[70,46]],'#f0c878');P([[38,58],[90,58],[66,68]],'#e8b860');
  for(let i=0;i<9;i++)Ci(44+i*5,56+Math.sin(i*1.7)*4,1.6,'rgba(150,90,30,.45)');g.strokeStyle='#5a3020';g.lineWidth=2.4;g.beginPath();for(let i=0;i<=20;i++){const x=36+i*2.6,y=54+Math.sin(i*.9)*4;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
  for(let i=0;i<14;i++)Ci(40+(i*13)%46,50+(i*7)%14,.9,'#ffffff');break;
 case'eau':P([[36,78],[34,40],[40,30],[40,22],[48,22],[48,30],[54,40],[52,78]],'rgba(160,210,230,.55)');P([[37,77],[35.5,52],[52.5,52],[51,77]],'rgba(120,190,225,.75)');L([[38,40],[38,72]],'rgba(255,255,255,.8)',1.6);
  P([[66,78],[64,46],[86,46],[84,78]],'rgba(170,215,235,.6)');P([[66,77],[65,56],[85,56],[84,77]],'rgba(120,190,225,.8)');L([[68,50],[68,74]],'rgba(255,255,255,.85)',1.4);E(75,46,11,2,'rgba(255,255,255,.7)');break;
 case'soda':P([[44,78],[40,26],[80,26],[76,78]],'rgba(190,220,235,.55)');P([[45,77],[41.5,34],[78.5,34],[75,77]],'#6a2012');P([[45,77],[43,52],[77,52],[75,77]],'#5a1a0e');
  [[52,38,.3],[66,42,-.2],[58,48,.5]].forEach(([x,y,a])=>{RR(x,y,10,9,2,'rgba(230,245,255,.55)',a);RR(x-1,y-1,4,3,1,'rgba(255,255,255,.7)',a)});
  L([[66,30],[74,8]],'#ffffff',4);for(let i=0;i<4;i++)L([[67.5-i*0+i*1.8,26-i*5.5],[69+i*1.8,22-i*5.5]],'#e84a4a',4);for(let i=0;i<9;i++)Ci(48+(i*11)%26,72-(i*9)%34,1.2,'rgba(255,220,200,.7)');L([[44,30],[46,74]],'rgba(255,255,255,.5)',1.6);break;
 case'jus':P([[44,78],[41,30],[79,30],[76,78]],'rgba(200,225,235,.55)');g.fillStyle=(()=>{const gr=g.createLinearGradient(0,36,0,78);gr.addColorStop(0,'#ffc040');gr.addColorStop(1,'#f08a10');return gr})();g.beginPath();g.moveTo(45,77);g.lineTo(42,38);g.lineTo(78,38);g.lineTo(75,77);g.closePath();g.fill();
  E(60,38,18,2.5,'#ffd060');Ci(78,32,12,'#f5a020');Ci(78,32,10,'#ffd27a');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;L([[78,32],[78+Math.cos(a)*9,32+Math.sin(a)*9]],'#f5b040',1)}Ci(78,32,1.6,'#fff0c0');L([[46,40],[48,74]],'rgba(255,255,255,.45)',1.6);break}
 g.restore()}
// ---------- mobilier ----------
function chairDraw(ch,r,col){legs(ch[0],ch[1],ch[2],ch[3],14,WOODD,.1);if(r==1)B3(ch[0],ch[1],.14,ch[3],14,22,WOOD,{t:WOODL});else B3(ch[0],ch[1],ch[2],.14,14,22,WOOD,{t:WOODL});
 B3(ch[0],ch[1],ch[2],ch[3],14,2,col,{t:mx(col,'#fff',.15)})}
function tableBack(f){fshadow(f);f.seats.forEach(s=>{if(!s.booth)chairDraw(s.ch,s.r,BORDO)})}
function tableTop(f){const{x,y}=f,tb=[x+.8,y+.8,1.5,1.5];B3(tb[0]+.6,tb[1]+.6,.3,.3,0,22,'#3a2a22',{flat:1});B3(tb[0]+.4,tb[1]+.4,.7,.7,0,2,'#3a2a22');
 B3(tb[0]-.05,tb[1]-.05,tb[2]+.1,tb[3]+.1,15,9,CLOTHD,{t:CLOTH,l:mx(CLOTH,'#000',.06),r:mx(CLOTH,'#000',.16)});B3(tb[0]-.05,tb[1]-.05,tb[2]+.1,tb[3]+.1,24,2,CLOTH,{t:'#fffaf0'});
 // chemin de table bordeaux et petite fleur
 B3(tb[0]+.55,tb[1]-.05,.4,tb[3]+.1,26,.4,BORDOL,{flat:1});B3(x+2.02,y+2.02,.16,.16,26,6,'#cfe6f0',{t:'#eef9fd'});const p=P3(x+2.1,y+2.1,34);G.fillStyle='#3a8a3a';G.fillRect(Math.round(p[0]),Math.round(p[1]),1,3);G.fillStyle='#e85d75';G.fillRect(Math.round(p[0])-1,Math.round(p[1])-2,3,2)}
function boxBack(f){const{x,y,w}=f;fshadow(f);B3(x,y,w,.25,0,34,BORDO,{t:BORDOL});for(let u=x+.3;u<x+w-.1;u+=.6)B3(u,y+.25,.5,.05,16,16,BORDOL,{flat:1});B3(x,y+.25,w,.6,0,14,BORDO,{t:BORDOL});B3(x-.05,y,.12,.85,0,30,WOODD,{flat:1});B3(x+w-.07,y,.12,.85,0,30,WOODD,{flat:1})}
function boxTop(f){const{x,y}=f,tb=[x+.35,y+.95,1.7,1.0];B3(tb[0]+.7,tb[1]+.35,.3,.3,0,22,'#3a2a22',{flat:1});B3(tb[0],tb[1],tb[2],tb[3],22,3,WOOD,{t:WOODL});B3(tb[0]+.1,tb[1]+.1,tb[2]-.2,tb[3]-.2,25,.4,'#b0784c',{flat:1});
 B3(x+2,y+1.7,.14,.14,25,5,'#f4efe4');const p=P3(x+2.07,y+1.77,31);G.fillStyle=Math.floor(tick/6)%3?'#ffd27a':'#ff9a3a';G.fillRect(Math.round(p[0]),Math.round(p[1])-2,1,2)}
function plateAt(s,it){const z=s.booth?25.4:26.4,sc=SC(),q=P3(s.pu,s.pv,z);B3(s.pu-.32,s.pv-.32,.64,.64,z,.8,'#c9c2b6',{t:'#fbf8f2'});
 if(it&&it.m.c!='b'&&it.por>0)pixFood(it.m.k,Math.round(q[0]-5*sc),Math.round(q[1]-6*sc),it.por,sc);
 // couverts posés à côté de l'assiette
 const c=P3(s.r==1?s.pu:s.pu+.42,s.r==1?s.pv+.42:s.pv,z+1);G.fillStyle='#b8c0c8';G.fillRect(Math.round(c[0]),Math.round(c[1])-1,1,3)}
function seatDishes(s){const d=s.who;if(!d||!d.order)return;const on=d.order.filter(it=>it.st=='served'||it.st=='eaten');const food=on.filter(it=>it.m.c!='b'),drink=on.find(it=>it.m.c=='b');
 if(food.length){const cur=food.find(it=>it.st=='served')||food[0];plateAt(s,cur)}
 if(drink){const z=s.booth?25.4:26.4,q=P3(s.gu,s.gv,z),sc=SC();glass(Math.round(q[0])-1,Math.round(q[1]),drink.m,drink.por,sc)}}
function personAt(s){const d=s.who;if(!d)return;let img=null,a=1,dy=0;
 if(d.me){if(!/^dn\d/.test(spName))return;img=sc2;const t=R.sit;if(t&&t.s===s){const k=Math.min(1,t.t/t.T);a=t.up?1-k:k;dy=Math.round((t.up?k:1-k)*-5)}}
 else{img=nImg(d.i,d.fr||'dn0');if(d.sa!=null)a=d.sa}
 if(!img||a<=0)return;const p=P3(s.cu,s.cv,16),fl=s.r!=1,X=Math.round(p[0]),Y=Math.round(p[1])+dy,AX=29,AY=100;
 G.save();G.globalAlpha=a;if(fl){G.translate(X,0);G.scale(-1,1);G.drawImage(img,-AX,Y-AY)}else G.drawImage(img,X-AX,Y-AY);G.restore();
 const mX=X+(fl?-14:14),mY=Y-25;if(d.me){mouthL.x=mX;mouthL.y=mY}handProp(d,s,mX,mY,fl,X,Y)}
// objet tenu pendant le repas : fourchette, cuillère, morceau de nourriture, verre
function handProp(d,s,mX,mY,fl,X,Y){const e=d.eat;if(!e)return;const ph=e.seq[e.dq]&&e.seq[e.dq][0],k=e.seq[e.dq]?1-e.dt/e.seq[e.dq][1]:0,m=e.it.m,sc=SC(),dir=fl?-1:1;
 if(ph=='drink'){const gx=mX+(fl?-5:2),gy=mY+8;glass(gx,gy,m,e.it.por,sc);return}
 if(ph=='eat'&&k>.35||ph=='chew'&&e.t2<10){const hx=mX+dir*3,hy=mY+3;
  if(m.u=='main'){G.fillStyle=INK;G.fillRect(hx-2,hy-2,5,4);G.fillStyle=m.col;G.fillRect(hx-1,hy-1,3,2)}
  else{G.fillStyle='#8a96a2';G.fillRect(hx,hy,1,5);G.fillStyle=m.u=='spoon'?'#c8d0d8':'#8a96a2';G.fillRect(hx-1,hy-1,3,m.u=='spoon'?2:1);if(ph=='eat'){G.fillStyle=m.col;G.fillRect(hx-1,hy-2,3,1)}}}
 else if(ph=='reach'&&k>.4&&m.u!='main'){const q=P3(s.pu,s.pv,30);G.fillStyle='#8a96a2';G.fillRect(Math.round(q[0]),Math.round(q[1])-4,1,5)}}
function isoRTable(f){fcDraw('rtA|'+f.id,f,()=>tableBack(f),60);f.seats.forEach(personAt);fcDraw('rtB|'+f.id,f,()=>tableTop(f),60);f.seats.forEach(seatDishes);candle(f.x+2.1,f.y+2.1,34);lamp(f.x+1.55,f.y+1.55)}
function isoRBox(f){fcDraw('rbA|'+f.id,f,()=>boxBack(f),60);f.seats.forEach(personAt);fcDraw('rbB|'+f.id,f,()=>boxTop(f),60);f.seats.forEach(seatDishes)}
function candle(u,v,z){const p=P3(u,v,z),X=Math.round(p[0]),Y=Math.round(p[1]),fl=Math.floor(tick/5+u*7)%3;G.fillStyle=fl?'#ffd27a':'#ff9a3a';G.fillRect(X,Y-2-(fl==2?1:0),1,2);
 if(night>.2){G.globalAlpha=.12*night;ell(X,Y-2,5,3,'#ffcf7a');G.globalAlpha=1}}
// suspension au-dessus de chaque table
function lamp(u,v){const zl=Math.round(WHI*.86),top=P3(u,v,zl+10),b=P3(u,v,zl),X=Math.round(b[0]),Y=Math.round(b[1]);G.fillStyle='#2a1e18';G.fillRect(X,Math.round(top[1]),1,Y-Math.round(top[1]));
 G.fillStyle='#1f4d3a';G.fillRect(X-3,Y,7,1);G.fillRect(X-4,Y+1,9,2);G.fillStyle='#2f6a50';G.fillRect(X-4,Y+1,9,1);G.fillStyle='#ffe2a0';G.fillRect(X-2,Y+3,5,1);
 const a=.06+.1*night;G.globalAlpha=a;ell(X,Y+12,9,5,'#ffd890');G.globalAlpha=1}
function isoRCuis(f){fcDraw('rcu|'+f.k,f,()=>cuisStatic(f),90);if(f.k==1||f.k==2)cuisFire(f)}
function cuisStatic(f){const{x,y,w,h,k}=f;fshadow(f);B3(x,y,w,h,0,23,'#8a949e',{t:STEELL,r:STEELD});B3(x,y,w,h,23,2,STEEL,{t:'#e8edf1'});
 if(k==0){// évier et égouttoir
  B3(x+.3,y+.2,1,.7,23,2.5,'#6a7480',{t:'#9aa4ae'});B3(x+.4,y+.3,.8,.5,24,1,'#b8dcec',{flat:1});B3(x+.7,y+.1,.1,.1,25,10,STEELD,{flat:1});B3(x+.7,y+.1,.4,.1,34,1,STEELD,{flat:1});
  for(let i=0;i<4;i++)B3(x+1.45+i*.12,y+.25,.05,.5,25,5,'#f4efe4',{flat:1})}
 if(k==1){// piano de cuisson : feux et casseroles
  [[.35,.25],[1.15,.25],[.35,.7],[1.15,.7]].forEach(([a,b])=>B3(x+a,y+b,.55,.35,25,.6,'#26282c',{flat:1}));B3(x+.4,y+.22,.5,.4,26,6,'#b8c0c8',{t:'#2a2e34'});B3(x+1.2,y+.66,.5,.4,26,4,'#4a525e',{t:'#1e2228'});
  for(let i=0;i<4;i++){const p=P3(x+.2+i*.45,y+h,14);G.fillStyle='#d4af37';G.fillRect(Math.round(p[0]),Math.round(p[1]),1,1)}B3(x+.2,y+h-.02,1.6,.02,5,8,'#5a646e',{flat:1})}
 if(k==2){// plancha et four
  B3(x+.2,y+.2,1.6,.7,25,1,'#3a3e44',{t:'#5a5e64'});B3(x+.3,y+h-.02,1.4,.02,4,12,'#2a2e34',{flat:1});const p=P3(x+1,y+h,12);G.fillStyle='#ff9a3a';G.fillRect(Math.round(p[0])-2,Math.round(p[1]),4,1)}
 if(k==3){// plan de travail : planche, légumes, couteau
  B3(x+.3,y+.25,.9,.55,25,1,'#c89a6a',{t:'#e0b884'});B3(x+.45,y+.35,.2,.2,26,2,'#e04a3a');B3(x+.75,y+.4,.25,.15,26,1.5,'#6cc04a');B3(x+1.4,y+.2,.5,.5,25,7,'#e8e2d6',{t:'#f8f4ea'});B3(x+1.45,y+.25,.4,.4,32,1,'#6cc04a',{flat:1})}
 // hotte en inox au-dessus
 if(k==1||k==2)B3(x,y,w,.9,58,12,'#b8c2cc',{t:'#d5dce2',r:'#8a949e'})}
function cuisFire(f){const{x,y,k}=f,on=R.kit.q.some(q=>q.t>0)||R.on&&tick%600<200,G0=G;
 if(k==1){[[.62,.42],[1.42,.87]].forEach(([a,b],i)=>{const p=P3(x+a,y+b,26),X=Math.round(p[0]),Y=Math.round(p[1]);if(on)for(let j=0;j<4;j++){G.fillStyle=(tick+j*3)%6<3?'#3f8fd0':'#7fb8f0';G.fillRect(X-3+j*2,Y+1,1,1)}
   // vapeur
   const n=on?4:2;for(let j=0;j<n;j++){const ph=((tick*.6+j*25+i*40)%100)/100;G.globalAlpha=.55*(1-ph);G.fillStyle='#ffffff';G.fillRect(X-2+Math.round(Math.sin(ph*6+j)*2)+j,Y-8-Math.round(ph*26),2,2)}G.globalAlpha=1})}
 if(k==2&&on){const p=P3(x+1,y+.55,26),X=Math.round(p[0]),Y=Math.round(p[1]);for(let j=0;j<5;j++){const ph=((tick*.9+j*20)%100)/100;G.globalAlpha=.4*(1-ph);G.fillStyle='#e8e2d6';G.fillRect(X-5+j*2,Y-4-Math.round(ph*20),2,2)}G.globalAlpha=1;
  if(tick%40<20){G.fillStyle='#ffb347';G.fillRect(X-2,Y-1,1,1);G.fillRect(X+3,Y,1,1)}}}
// passe : comptoir où la cuisine dépose les assiettes ; les cuisiniers travaillent derrière
function isoRPasse(f){const{x,y,w,h}=f;
 R.chef.forEach((c,i)=>{const busy=c.busy,nm=busy?(Math.floor(tick/9+i*3)%2?'cu1':'cu2'):(tick%400<360?'idle':'cu1'),img=nImg(2+i,nm);if(!img)return;const p=P3(c.u,2.15,0);charDraw(img,p[0],p[1],c.fl,CW,CH);toqueDraw(img,p[0],p[1],c.fl)});
 fcDraw('rps',f,()=>{fshadow(f);B3(x,y,w,h,0,22,WOOD,{t:WOODL});for(let u=x+.5;u<x+w;u+=.7)ln(P3(u,y+h,3),P3(u,y+h,20),WOODD);B3(x-.05,y-.05,w+.1,h+.1,22,3,'#d5dce2',{t:'#eef2f5'});
    const pp=P3(x+w-.6,y+.4,25);G.fillStyle='#d4af37';G.fillRect(Math.round(pp[0])-2,Math.round(pp[1])-2,5,2);G.fillStyle='#f3d27a';G.fillRect(Math.round(pp[0])-1,Math.round(pp[1])-4,3,2)},110);
 // lampes chauffantes et assiettes prêtes
 [1.4,3.5,5.6].forEach(a=>{const p=P3(x+a,y+.4,25);G.globalAlpha=.18+.08*Math.sin(tick*.05+a);ell(Math.round(p[0]),Math.round(p[1]),6,3,'#ffb347');G.globalAlpha=1});
 const ready=R.kit.q.filter(q=>q.it.st=='ready');ready.slice(0,8).forEach((q,i)=>{const u=x+.7+i*.8,v=y+.4,z=25,sc=SC(),p=P3(u,v,z);B3(u-.28,v-.28,.56,.56,z,.8,'#c9c2b6',{t:'#fbf8f2'});
  if(q.it.m.c=='b')glass(Math.round(p[0])-1,Math.round(p[1]),q.it.m,1,sc);else pixFood(q.it.m.k,Math.round(p[0]-5*sc),Math.round(p[1]-6*sc),1,sc)})}
function isoRAccueil(f){const{x,y,w,h}=f,img=nImg(4,R.host.wave>0?(Math.floor(tick/12)%2?'wave':'idle'):'idle');if(img){const p=P3(x-.5,y+1.2,0);charDraw(img,p[0],p[1],false,CW,CH)}
 fcDraw('racc',f,()=>{fshadow(f);B3(x,y,w,h,0,24,WOODD,{t:WOOD});B3(x+w-.02,y+.2,.04,h-.4,4,16,BORDO,{flat:1});B3(x-.05,y-.05,w+.1,h+.1,24,2,WOODL,{t:'#b88050'});
  B3(x+.25,y+.4,.5,.7,26,1,'#f4efe4',{t:'#fffaf0'});B3(x+.3,y+1.5,.25,.25,26,8,'#cfe6f0',{t:'#eef9fd'});const p=P3(x+.42,y+1.62,38);G.fillStyle='#3a8a3a';G.fillRect(Math.round(p[0]),Math.round(p[1]),1,4);G.fillStyle='#e85d75';G.fillRect(Math.round(p[0])-2,Math.round(p[1])-2,5,3);G.fillStyle='#f5d76e';G.fillRect(Math.round(p[0]),Math.round(p[1])-1,1,1)},110)}
function isoRAqua(f){const{x,y,w,h}=f;fcDraw('raq',f,()=>{fshadow(f);B3(x,y,w,h,0,18,WOODD,{t:WOOD})},60);
 G.globalAlpha=.78;B3(x+.04,y+.04,w-.08,h-.08,18,30,'#3f8fbf',{t:'#7fc8e8',l:'#3a86b8',r:'#2f74a4'});G.globalAlpha=1;B3(x,y,w,h,48,3,'#2a2e34',{t:'#3a3e44'});
 for(let i=0;i<5;i++){const ph=(tick*.004*(1+i*.3)+i*.37)%2,v=y+.3+(ph<1?ph:2-ph)*(h-.6),z=24+(i*7)%20,p=P3(x+w,v,z),c=['#ff8a3a','#ffd23a','#e84a7a','#5ad0f0','#ff6a3a'][i],dir=ph<1;G.fillStyle=c;G.fillRect(Math.round(p[0])-1,Math.round(p[1]),3,2);G.fillRect(Math.round(p[0])+(dir?-2:2),Math.round(p[1]),1,2)}
 for(let i=0;i<3;i++){const ph=((tick*.5+i*33)%60)/60,p=P3(x+w,y+.6+i*1,20+ph*26);G.fillStyle='rgba(230,248,255,.8)';G.fillRect(Math.round(p[0]),Math.round(p[1]),1,1)}
 const pl=P3(x+w,y+h-.4,19);G.fillStyle='#3a9a4a';for(let j=0;j<3;j++)G.fillRect(Math.round(pl[0])-2+j*2,Math.round(pl[1])-8+Math.round(Math.sin(tick*.05+j)),1,8)}
// personnage qui marche (serveurs, clients)
function isoRWalk(f){const o=f.p;if(!o)return;const mv=!!o.path||o.st=='in'||o.st=='exit',nm=mv?'w'+(Math.floor(o.t/7)%4):o.pose||'idle',img=nImg(o.i,nm);if(!img)return;const p=P3(o.u,o.v,0);G.globalAlpha=o.a==null?1:o.a;
 rx.globalAlpha=G.globalAlpha;gshadow(p[0],p[1],22);charDraw(img,p[0],p[1],o.fl,CW,CH);rx.globalAlpha=1;G.globalAlpha=1;const X=Math.round(p[0]),Y=Math.round(p[1]);
 if(o.carry&&o.carry.length){const dir=o.fl?-1:1,hx=X+dir*13,hy=Y-46,sc=SC();G.fillStyle='#c9c2b6';G.fillRect(hx-6,hy,13,2);G.fillStyle='#fbf8f2';G.fillRect(hx-6,hy-1,13,1);const it=o.carry[0];if(it.m.c=='b')glass(hx-1,hy-1,it.m,1,sc);else pixFood(it.m.k,hx-5*sc,hy-6*sc,1,sc);if(o.carry.length>1){G.fillStyle='#fbf8f2';G.fillRect(hx-dir*12-5,hy+3,11,2)}}
 if(o.pad){const dir=o.fl?-1:1,hx=X+dir*11,hy=Y-50;G.fillStyle=INK;G.fillRect(hx-3,hy-4,7,9);G.fillStyle='#ffffff';G.fillRect(hx-2,hy-3,5,7);G.fillStyle='#8a96a2';for(let i=0;i<3;i++)G.fillRect(hx-1,hy-2+i*2,(tick/6+i)%3+1|0,1)}
 if(o.billT){const dir=o.fl?-1:1,hx=X+dir*11,hy=Y-50;G.fillStyle=INK;G.fillRect(hx-3,hy-1,8,6);G.fillStyle='#2a2a2a';G.fillRect(hx-2,hy,6,4);G.fillStyle='#fffaf0';G.fillRect(hx-1,hy-3,4,4)}
 if(o.bub)bubble(X,Y-92,o.bub)}
// petite bulle au-dessus d'un personnage : pensées, conversation, satisfaction
function bubble(X,Y,k){G.fillStyle=INK;G.fillRect(X-7,Y-7,15,10);G.fillRect(X-2,Y+3,3,2);G.fillStyle='#ffffff';G.fillRect(X-6,Y-6,13,8);G.fillRect(X-1,Y+2,1,1);
 if(k=='chat'){G.fillStyle='#6a5a52';for(let i=0;i<3;i++)if(Math.floor(tick/12)%4>i)G.fillRect(X-4+i*4,Y-2,2,2)}
 else if(k=='love'){G.fillStyle='#e0506a';G.fillRect(X-3,Y-4,2,2);G.fillRect(X+1,Y-4,2,2);G.fillRect(X-3,Y-3,6,2);G.fillRect(X-2,Y-1,4,1);G.fillRect(X-1,Y,2,1)}
 else if(k=='note'){G.fillStyle='#3f6fd0';G.fillRect(X,Y-5,1,5);G.fillRect(X-2,Y-1,3,2);G.fillRect(X+1,Y-5,2,1)}
 else if(k=='menu'){G.fillStyle='#1f4d3a';G.fillRect(X-3,Y-5,6,7);G.fillStyle='#d4af37';G.fillRect(X-2,Y-4,4,1);G.fillStyle='#ffffff';G.fillRect(X-2,Y-2,4,1);G.fillRect(X-2,Y,3,1)}
 else if(k=='coin'){G.fillStyle='#d4af37';G.fillRect(X-2,Y-5,4,6);G.fillRect(X-3,Y-4,6,4);G.fillStyle='#f5d76e';G.fillRect(X-1,Y-4,2,4)}
 else if(k=='yum'){G.fillStyle='#e8a040';G.fillRect(X-4,Y-4,2,2);G.fillRect(X+2,Y-4,2,2);G.fillStyle='#d05050';G.fillRect(X-3,Y-1,6,1);G.fillRect(X-2,Y,4,1)}}
Object.assign(PLD,{RTable:isoRTable,RBox:isoRBox,RCuis:isoRCuis,RPasse:isoRPasse,RAccueil:isoRAccueil,RAqua:isoRAqua,RWalk:isoRWalk});
// ---------- décor mural (dessiné une fois dans le fond) ----------
function doorZone(){const DS=RN-16,z=Math.round(WHI*.7)+2;return[P3(0,9.5+DS,0),P3(0,12.7+DS,0),P3(0,12.7+DS,z),P3(0,9.5+DS,z)]}
function textR(s,u,z,c,du){du=du||.24;let k=0;for(const ch of s){const g=FONT[ch];if(g)g.forEach((row,j)=>[...row].forEach((b,i)=>{if(b=='1')WR(u+(k+i)*du,u+(k+i+1)*du,z-(j+1)*2,z-j*2,c)}));k+=g?(g[0].length+1):3}}
function decor(n){const H=WHI,z=t=>Math.round(H*t);
 // soubassement en bois sur les deux murs
 WR(9,RN,0,z(.26),WOODD);WR(9,RN,z(.26),z(.28),WOODL);for(let u=9.4;u<RN;u+=1.2)WR(u,u+.06,2,z(.24),mx(WOODD,'#000',.2));
 WL(0,RN,0,z(.26),WOODD);WL(0,RN,z(.26),z(.28),WOODL);for(let v=.6;v<RN;v+=1.2)WL(v,v+.06,2,z(.24),mx(WOODD,'#000',.2));
 // cuisine : crédence carrelée, étagère, ustensiles
 WR(0,8.8,0,z(.66),'#f4f2ec');for(let zz=4;zz<z(.66);zz+=4)WR(0,8.8,zz,zz+.6,'#dcd8cf');for(let u=0;u<8.8;u+=.5)WR(u,u+.04,0,z(.66),'#dcd8cf');WR(8.8,9,0,z(.7),WOODD);
 WR(5.4,8.4,z(.55),z(.57),'#8a949e');[[5.7,'#c8402f'],[6.3,'#e8a040'],[6.9,'#6cc04a'],[7.5,'#f4efe4'],[8,'#3f8fd0']].forEach(([u,c])=>WR(u,u+.35,z(.57),z(.57)+5,c));
 [.6,1,1.4].forEach((u,i)=>{WR(u,u+.06,z(.4),z(.6),'#5a646e');WR(u-.12,u+.18,z(.4)-(i==1?5:3),z(.4),'#8a949e')});
 // tableaux au-dessus des banquettes
 const ART=[['#7fc8f0','#5aa84a','#f5d76e'],['#f4d6b0','#c8402f','#6cc04a'],['#2a3a6a','#f5d76e','#e85d75']];
 BOX.forEach((x,i)=>{const a=x+.3,b=x+2.1,z0=z(.42),z1=z(.72),A=ART[i];WR(a-.08,b+.08,z0-2,z1+2,GOLD);WR(a,b,z0,z1,A[0]);
  if(i==0){WR(a,b,z0,z0+Math.round((z1-z0)*.4),A[1]);WR(a+.4,a+1,z0+Math.round((z1-z0)*.4),z0+Math.round((z1-z0)*.6),A[1]);WR(b-.5,b-.3,z1-8,z1-5,A[2])}
  if(i==1){WR(a+.3,b-.3,z0+3,z0+6,'#8a5a3a');WR(a+.6,a+.9,z0+6,z0+10,A[1]);WR(a+1,a+1.3,z0+6,z0+9,A[2]);WR(a+1.3,a+1.5,z0+6,z0+11,'#f5a020')}
  if(i==2){for(let j=0;j<5;j++)WR(a+.2+j*.33,a+.3+j*.33,z0+3+j*2,z0+5+j*2,j%2?A[1]:A[2])}
  const sx=x+2.6;if(i<2){WR(sx-.1,sx+.1,z(.45),z(.5),'#c9a14a');WR(sx-.16,sx+.16,z(.5),z(.56),'#f5e2b0')}});
 textR('BON APPETIT',9.6,z(.92),GOLD,.2);
 // mur gauche : grand tableau noir (menu du jour), miroir doré
 const cb=[8.4,12.9];WL(cb[0]-.1,cb[1]+.1,z(.3)-2,z(.82)+2,WOOD);WL(cb[0],cb[1],z(.3),z(.82),'#2e3a33');
 for(let i=0;i<6;i++){const zz=z(.74)-i*5,l=1.2+((i*7)%5)*.4;WL(cb[1]-.3-l,cb[1]-.3,zz,zz+1,i==0?'#f5d76e':'#e8ece6')}WL(cb[0]+.4,cb[0]+.8,z(.36),z(.4),'#e85d75');
 WL(1.2,3.6,z(.36),z(.8),GOLD);WL(1.3,3.5,z(.38),z(.78),'#cfe0e6');WL(2.4,2.8,z(.6),z(.76),'#ffffff');
 // guirlande lumineuse le long des deux murs
 for(let u=.3;u<RN;u+=.6){const zz=z(.93)-Math.round(Math.abs(Math.sin(u*1.3))*3);WR(u,u+.08,zz,zz+1,'#3a2a22');WR(u+.25,u+.35,zz-3,zz,'#ffe2a0')}
 for(let v=.3;v<RN;v+=.6){const zz=z(.93)-Math.round(Math.abs(Math.sin(v*1.3))*3);WL(v,v+.08,zz,zz+1,'#3a2a22');WL(v+.25,v+.35,zz-3,zz,'#ffe2a0')}
 // carrelage de la cuisine au sol
 for(let a=0;a<8.8;a+=.5)for(let b=0;b<4.4;b+=.5)if(((a+b)*2)%2==0)poly([P3(a,b,0),P3(a+.5,b,0),P3(a+.5,b+.5,0),P3(a,b+.5,0)],'rgba(240,236,228,.75)');else poly([P3(a,b,0),P3(a+.5,b,0),P3(a+.5,b+.5,0),P3(a,b+.5,0)],'rgba(60,70,80,.55)')}
{const _pb=placeBG;placeBG=function(n){const k=bgKey;_pb(n);if(isR()&&bgKey!==k){G=bgx;bgx.save();try{const Z=doorZone();bgx.beginPath();bgx.rect(0,0,LW,LH);bgx.moveTo(Z[0][0],Z[0][1]);Z.slice(1).forEach(p=>bgx.lineTo(p[0],p[1]));bgx.closePath();bgx.clip('evenodd');decor(n)}catch(e){console.error(e)}finally{bgx.restore()}G=rx}}}
// guirlande qui scintille, ambiance du soir
{const _dw=drawWorld;drawWorld=function(){_dw();if(!isR())return;try{const G0=G;G=rx;const z=Math.round(WHI*.93)-3;
  for(let u=.55;u<RN;u+=1.2){const tw=(Math.sin(tick*.05+u*3)+1)/2;rx.globalAlpha=.25+.55*tw;const p=P3(u,0,z-Math.round(Math.abs(Math.sin((u-.25)*1.3))*3));rx.fillStyle='#fff2c0';rx.fillRect(Math.round(p[0]),Math.round(p[1])-1,1,2)}
  for(let v=.55;v<RN;v+=1.2){if(v>DV0-.3&&v<DV1+.3)continue;const tw=(Math.sin(tick*.05+v*2)+1)/2;rx.globalAlpha=.25+.55*tw;const p=P3(0,v,z-Math.round(Math.abs(Math.sin((v-.25)*1.3))*3));rx.fillStyle='#fff2c0';rx.fillRect(Math.round(p[0]),Math.round(p[1])-1,1,2)}
  rx.globalAlpha=1;G=G0;if(R.sit&&R.sit.s&&C.st=='rsit')HEAD=[mouthL.x,mouthL.y-60]}catch(e){console.error(e)}}}
// ---------- chemins : grille étendue à toute la salle (20 cases) ----------
{const _fp=findPath;findPath=function(s,g){if(!isR()||RN<=16)return _fp(s,g);const R3=3,NN=Math.ceil(RN*R3),cen=i=>(i+.5)/R3,ok=new Uint8Array(NN*NN);for(let j=0;j<NN;j++)for(let i=0;i<NN;i++)ok[j*NN+i]=walkable(cen(i),cen(j))?1:0;
 const near=p=>{let bi=-1,bd=1e9;for(let k=0;k<NN*NN;k++)if(ok[k]){const d=Math.hypot(cen(k%NN)-p[0],cen(k/NN|0)-p[1]);if(d<bd){bd=d;bi=k}}return bi};const S=near(s),T=near(g);if(S<0||T<0)return[];
 const gs=new Float32Array(NN*NN).fill(1e9),came=new Int32Array(NN*NN).fill(-1),closed=new Uint8Array(NN*NN),hh=k=>{const dx=Math.abs(k%NN-T%NN),dy=Math.abs((k/NN|0)-(T/NN|0));return Math.max(dx,dy)+.414*Math.min(dx,dy)};
 const open=[S];gs[S]=0;let best=S;
 while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(gs[open[i]]+hh(open[i])<gs[open[bi]]+hh(open[bi]))bi=i;const c=open[bi];open[bi]=open[open.length-1];open.pop();if(closed[c])continue;closed[c]=1;if(hh(c)<hh(best))best=c;if(c==T){best=c;break}
  const ci=c%NN,cj=c/NN|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=NN||nj>=NN)continue;const n=nj*NN+ni;if(!ok[n]||closed[n])continue;
   if(di&&dj&&(!ok[cj*NN+ni]||!ok[nj*NN+ci]))continue;const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[n]){gs[n]=ng;came[n]=c;open.push(n)}}}
 const pts=[];for(let k=best;k>=0;k=came[k])pts.unshift([cen(k%NN),cen(k/NN|0)]);if(best==T&&walkable(g[0],g[1]))pts[pts.length-1]=[g[0],g[1]];
 const out=[];let cur=s,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}return out}}
// ---------- déplacements des personnages non joueurs ----------
function walkTo(o,u,v,then){let p=[];try{p=findPath([o.u,o.v],[u,v])}catch(e){}if(!p||!p.length)p=[[u,v]];o.path=p;o.then=then||null;o.pose=null}
function stepWalk(o,sp){if(!o.path)return;const w=o.path[0],du=w[0]-o.u,dv=w[1]-o.v,l=Math.hypot(du,dv);o.t++;if(Math.abs(du-dv)>.02)o.fl=(du-dv)<0;
 if(l<=sp){o.u=w[0];o.v=w[1];o.path.shift();if(!o.path.length){o.path=null;const f=o.then;o.then=null;if(f)f()}}else{o.u+=du/l*sp;o.v+=dv/l*sp}}
const ENTRY=[-.45,DOORS[1]],INSIDE=[1.5,DOORS[1]],PASS=[4.4,4.85],CAISSE=[3.15,11.2],IDLE=[[8.8,4.75],[3.05,8.85]];
// ---------- convives (le joueur et les clients) ----------
function mkItem(m){return{m,st:'new',por:1,c:m.co,t:0,T:COOK[m.c],tk:false}}
const unpaid=d=>d&&d.order?d.order.filter(it=>['served','eaten'].includes(it.st)).reduce((a,it)=>a+it.m.p,0):0;
const pending=d=>d&&d.order?d.order.filter(it=>['new','sent','cook','ready','carry'].includes(it.st)):[];
const busyOrder=d=>!!(d&&d.order&&d.order.some(it=>it.st!='paid'));
function canServe(d,c){return d.order.every(it=>it.c>=c||it.m.c=='b'||it.st=='eaten'||it.st=='paid')}
function freeSeats(){return SEATS.filter(s=>!s.who&&!s.res)}
// ---------- serveurs : une file de tâches partagée ----------
function task(k,d,pri){if(R.tasks.some(t=>t.k==k&&t.d===d&&!t.done&&!t.w))return;R.tasks.push({k,d,pri:pri||1,t:0})}
function nextTask(){R.tasks=R.tasks.filter(t=>t.w||t.done||t.k!='serve'||(t.d.order&&t.d.order.some(it=>['sent','cook','ready'].includes(it.st))));let best=null;for(const t of R.tasks){if(t.w||t.done)continue;if(t.k=='serve'&&!readyFor(t.d).length)continue;if(!best||t.pri>best.pri)best=t}return best}
function readyFor(d){const its=d.order?d.order.filter(it=>it.st=='ready'):[];if(!its.length)return[];const c=Math.min(...its.map(it=>it.c));return canServe(d,c)?its.filter(it=>it.c==c):[]}
function waiterTick(w){if(w.path){stepWalk(w,.058);return}if(w.wait>0){w.wait--;if(w.wait==0&&w.after){const f=w.after;w.after=null;f()}return}
 if(w.job){return}const t=nextTask();if(!t){w.pose='idle';const h=IDLE[w.k];if(Math.hypot(w.u-h[0],w.v-h[1])>.3&&!w.home){w.home=1;walkTo(w,h[0],h[1],()=>{w.fl=w.k==0;w.home=0})}return}
 t.w=w;w.job=t;w.home=0;const d=t.d,s=d.seat,done=()=>{t.done=1;w.job=null;w.pad=0;w.billT=0;w.bub=null;R.tasks=R.tasks.filter(x=>!x.done);rsUI()},faceSeat=()=>{w.fl=(s.cu-w.u)-(s.cv-w.v)<0};
 if(!s){done();return}
 if(t.k=='take'){walkTo(w,s.ap[0],s.ap[1],()=>{faceSeat();w.pad=1;w.pose='idle';if(d.me)say('Le serveur : « Bonjour ! Je prends votre commande… »');sfx('rsWrite');w.wait=70;w.after=()=>{w.pad=0;w.bub='note';d.order.forEach(it=>{if(it.st=='new')it.st='sent'});if(d.me){say('Le serveur : « C’est noté ! Je transmets en cuisine. »');rsUI()}
   walkTo(w,PASS[0],PASS[1],()=>{w.bub=null;w.fl=true;w.pose='idle';w.wait=24;w.after=()=>{d.order.forEach(it=>{if(it.st=='sent'){it.tk=true;R.kit.q.push({it,d,t:0})}});R.chef[0].hey=60;sfx('rsBell',.6);done()}})}})}
 else if(t.k=='serve'){walkTo(w,PASS[0],PASS[1],()=>{w.fl=true;const its=readyFor(d);if(!its.length){done();return}w.wait=22;w.after=()=>{its.forEach(it=>{it.st='carry'});R.kit.q=R.kit.q.filter(q=>!its.includes(q.it));w.carry=its;
   walkTo(w,s.ap[0],s.ap[1],()=>{faceSeat();w.wait=26;w.after=()=>{its.forEach(it=>{it.st='served'});w.carry=null;sfx('rsServe');if(d.me){say('Le serveur : « Et voilà : '+its.map(it=>it.m.n.toLowerCase()).join(', ')+'. Bon appétit ! »');talkMaybe('resto',.4)}else d.bub='yum',d.bt=90;done()}})}})}
 else if(t.k=='clear'){walkTo(w,s.ap[0],s.ap[1],()=>{faceSeat();w.wait=24;w.after=()=>{d.order.forEach(it=>{if(it.st=='eaten'&&it.m.c!='b'&&it!==lastFood(d))it.gone=1});sfx('rsClear');done()}})}
 else if(t.k=='bill'){walkTo(w,CAISSE[0],CAISSE[1],()=>{w.fl=true;w.wait=30;w.after=()=>{w.billT=1;walkTo(w,s.ap[0],s.ap[1],()=>{faceSeat();if(d.me){w.job=null;t.done=1;R.tasks=R.tasks.filter(x=>!x.done);R.billW=w;openBill();rsUI()}else{w.wait=80;d.bub='coin';d.bt=80;sfx('rsPay',.5);w.after=()=>{w.billT=0;d.paid=1;d.order.forEach(it=>it.st='paid');done()}}})}})}
 else done()}
const lastFood=d=>{const f=d.order.filter(it=>it.m.c!='b'&&(it.st=='served'||it.st=='eaten'));return f[f.length-1]};
// ---------- cuisine ----------
function kitchenTick(){const Q=R.kit.q;let cooking=0;
 for(const q of Q){if(q.it.st=='sent'&&q.it.tk){const d=q.d,c=q.it.c;const before=d.order.some(it=>it.c<c&&['new','sent','cook','ready','carry'].includes(it.st)&&it.m.c!='b');if(!before&&Q.filter(x=>x.it.st=='cook').length<4)q.it.st='cook'}
  if(q.it.st=='cook'){cooking++;q.t++;if(q.t%50==0)sfx('rsSizzle',.5);if(q.t>=q.it.T){q.it.st='ready';sfx('rsBell');task('serve',q.d,3);if(q.d.me){say('Ding ! '+q.it.m.n+' est prêt en cuisine.');rsUI()}}}}
 R.chef.forEach((c,i)=>{c.busy=cooking>i;if(c.busy&&tick%90==i*45)c.tu=i==0?rnd(1.6,4.2):rnd(4.6,7.2);if(!c.busy&&tick%300==i*150)c.tu=i==0?rnd(2,3.6):rnd(5,6.6);const d=c.tu-c.u;if(Math.abs(d)>.03){c.u+=Math.sign(d)*.03;c.fl=d<0}});
 if(R.chef[0].hey>0)R.chef[0].hey--}
// ---------- repas : enchaînement des gestes (joueur et clients) ----------
function startEat(d,it){d.eat={it,seq:SEQ[it.m.u],dq:0,dt:SEQ[it.m.u][0][1],t2:0,n:it.m.n2,b:Math.round((1-it.por)*it.m.n2)};if(d.me){C.seq=d.eat.seq;C.dq=0;C.dt=d.eat.dt}}
function eatTick(d){const e=d.eat;if(!e)return;e.t2++;if(--e.dt>0)return;const ph=e.seq[e.dq][0];
 // fin d'une phase
 if(ph=='eat'){e.b++;e.it.por=Math.max(0,1-e.b/e.n);sfx(e.it.m.u=='main'?'rsCrunch':'rsBite',d.me?1:.35);if(d.me){add('hunger',e.it.m.h/e.n);add('happy',e.it.m.j/e.n);try{bars()}catch(_){}}}
 if(ph=='drink'){e.b++;e.it.por=Math.max(0,1-e.b/e.n);if(d.me){add('hunger',e.it.m.h/e.n);add('happy',e.it.m.j/e.n);try{bars()}catch(_){}}}
 e.dq++;e.t2=0;if(e.dq<e.seq.length){e.dt=e.seq[e.dq][1];if(e.seq[e.dq][0]=='drink')sfx('rsSip',d.me?1:.3);if(d.me){C.dq=e.dq;C.dt=e.dt}return}
 // fin d'une bouchée
 if(e.it.por<=0){e.it.st='eaten';d.eat=null;if(d.me){C.seq=null;const S=ST();S.plats[e.it.m.k]=(S.plats[e.it.m.k]||0)+1;say(e.it.m.c=='b'?NAME()+' a fini son verre.':NAME()+' a terminé : '+e.it.m.n.toLowerCase()+'. Délicieux !');fx.push({k:'h',x:C.x,y:C.y,l:80});save();rsUI()}
  if(e.it.m.c!='b')task('clear',d,1);return}
 e.dq=0;e.dt=e.seq[0][1];if(d.me){C.dq=0;C.dt=e.dt}if(d.me&&d.eat.it.m.c=='b'){d.eat=null;C.seq=null;rsUI()}}
const dnF=(e,t)=>{if(!e||!e.seq[e.dq])return t%150<118?'dn0':'dn7';const s=e.seq[e.dq],ph=s[0],k=1-e.dt/s[1];if(ph=='reach')return k<.5?'dn1':'dn2';if(ph=='eat')return k<.4?'dn2':'dn3';if(ph=='chew')return Math.floor(t/10)%2?'dn4':'dn3';if(ph=='drink')return'dn6';return'dn0'};
// ---------- clients ----------
let NID=0;
function newClient(seat,mid){const i=pick(CLIENTS.filter(c=>!R.npc.some(n=>n.i==c)))||pick(CLIENTS);const d={id:++NID,i,u:ENTRY[0],v:ENTRY[1],t:0,fl:false,seat,st:'in',order:[],a:0,fr:'dn0',bt:0,ct:60};seat.res=d;
 if(mid){// déjà installé quand on arrive : en plein repas
  seat.who=d;seat.res=null;d.st='table';d.a=1;const p=pick(MENU.filter(m=>m.c=='p')),b=pick(MENU.filter(m=>m.c=='b'));d.order=[mkItem(b),mkItem(p)];d.order.forEach(it=>{it.st='served';it.tk=true});d.order[1].por=rnd(.3,.9);d.ct=rnd(60,300)}
 R.npc.push(d);return d}
function npcOrder(d){const M=c=>MENU.filter(m=>m.c==c),o=[];if(Math.random()<.85)o.push(pick(M('b')));if(Math.random()<.3)o.push(pick(M('e')));o.push(pick(M('p')));if(Math.random()<.35)o.push(pick(M('d')));d.order=o.map(mkItem)}
function npcTick(d){if(d.bt>0&&--d.bt==0)d.bub=null;
 if(d.st=='in'){d.t++;d.fl=false;d.u+=.045;d.a=Math.min(1,(d.u+.45)/1.1);R.door=30;if(d.u>=INSIDE[0]){d.a=1;d.st='go';R.host.wave=90;walkTo(d,d.seat.ap[0],d.seat.ap[1],()=>{d.st='sitdown';d.sd=0;d.seat.who=d;d.seat.res=null;d.sa=0})}return}
 if(d.st=='go'){stepWalk(d,.05);return}
 if(d.st=='sitdown'){d.sd++;d.sa=Math.min(1,d.sd/14);d.a=1-d.sa;if(d.sd==2)sfx('rsChair',.3);if(d.sd>=14){d.sa=null;d.a=1;d.st='table';d.mt=rnd(120,260)}return}
 if(d.st=='table'){d.fr=dnF(d.eat,tick+d.id*37);
  if(!d.order.length){d.bub='menu';if(--d.mt<=0){d.bub=null;npcOrder(d);task('take',d,2)}return}
  if(d.eat){eatTick(d);return}
  const it=d.order.find(x=>x.st=='served'&&x.m.c!='b')||(Math.random()<.004&&d.order.find(x=>x.st=='served'&&x.m.c=='b'));
  if(it){if(--d.ct<=0){startEat(d,it);d.ct=rnd(40,160)}else if(!d.bub&&Math.random()<.004){d.bub=pick(['chat','chat','note','love']);d.bt=110}return}
  if(!pending(d).length&&d.order.every(x=>x.st!='served'||x.m.c=='b')&&!d.paid){d.order.forEach(x=>{if(x.st=='served')x.st='eaten'});task('bill',d,1);d.st='bill';return}return}
 if(d.st=='bill'){d.fr=dnF(null,tick+d.id*37);if(d.paid){d.st='up';d.sd=0;sfx('rsChair',.3)}return}
 if(d.st=='up'){if(d.sd==0){d.u=d.seat.ap[0];d.v=d.seat.ap[1]}d.sd++;d.sa=Math.max(0,1-d.sd/12);d.a=1-d.sa;if(d.sd>=12){d.seat.who=null;d.sa=null;d.a=1;d.st='out';d.bub='love';d.bt=60;walkTo(d,INSIDE[0],INSIDE[1],()=>{d.st='exit'})}return}
 if(d.st=='out'){stepWalk(d,.05);return}
 if(d.st=='exit'){d.u-=.045;d.t++;d.fl=true;d.a=Math.max(0,(d.u+.45)/1.1);R.door=30;if(d.u<=ENTRY[0]){d.gone=1}}}
// ---------- le joueur à table ----------
const me=()=>R.me;
function sitAt(s,quiet){const d=me();if(!s)return;if(R.sit)return;
 if(s.who&&!s.who.me){say('Cette place est occupée. Choisis une table libre.');return}
 if(d.seat&&d.seat!==s&&busyOrder(d)&&d.order.some(it=>it.st!='paid')){say('Ta commande est servie à ta table : termine ton repas ou règle l’addition avant de changer de place.');return}
 if(C.st=='rsit'){if(d.seat===s)return;standUp(()=>sitAt(s));return}
 if(d.seat&&d.seat!==s){d.seat.res=null}d.seat=s;s.res=d;rsUI();
 goto(s.ap[0]*12,88+s.ap[1]*5,()=>{if(s.who&&!s.who.me){say('Quelqu’un s’est installé juste avant toi.');s.res=null;d.seat=null;rsUI();return}
  C.d=s.r==1?-1:1;R.stand=snap();s.who=d;s.res=null;R.sit={s,t:0,T:16,up:false};C.st='rsit';C.alpha=0;C.path=null;C.x=s.cu*12;C.y=88+s.cv*5;C.tx=C.x;C.ty=C.y;sfx('rsChair');
  if(!quiet)say(NAME()+' s’installe '+(s.booth?'sur la banquette':'à la table '+s.f.no)+'.'+(busyOrder(d)?'':' Ouvre la carte pour commander.'));rsUI()})}
function standUp(then){const d=me(),s=d.seat;if(C.st!='rsit'||!s||R.sit){if(then)then();return}if(d.eat){d.eat=null;C.seq=null}
 R.sit={s,t:0,T:14,up:true,then};sfx('rsChair')}
function snap(){try{const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);return{c,fl:SP.fl}}catch(e){return null}}
function sitTick(){const t=R.sit;if(!t)return;t.t++;if(t.t<t.T)return;const s=t.s,d=me();R.sit=null;
 if(t.up){s.who=null;C.st='idle';C.idle=60;C.alpha=null;C.x=s.ap[0]*12;C.y=88+s.ap[1]*5;C.tx=C.x;C.ty=C.y;C.seq=null;if(!busyOrder(d))d.seat=null;rsUI();if(t.then)t.then()}else rsUI()}
// dessin de transition : silhouette debout qui s'efface pendant que la silhouette assise apparaît
function sitOverlay(){const t=R.sit;if(!t||!R.stand)return;const k=Math.min(1,t.t/t.T),a=t.up?k:1-k;if(a<=0)return;const s=t.s,p=P3(s.ap[0],s.ap[1],0);rx.globalAlpha=a;charDraw(R.stand.c,p[0],p[1],R.stand.fl,CW,CH);rx.globalAlpha=1}
function eatNext(kind){const d=me();if(C.st!='rsit'||R.sit)return;if(d.eat){d.eat=null;C.seq=null;say(NAME()+' fait une pause.');rsUI();return}
 const it=kind=='b'?d.order.find(x=>x.st=='served'&&x.m.c=='b'):d.order.find(x=>x.st=='served'&&x.m.c!='b');if(!it){say(kind=='b'?'Pas de boisson servie pour le moment.':'Rien à manger pour le moment : la cuisine prépare ta commande.');return}
 startEat(d,it);say(it.m.c=='b'?NAME()+' boit une gorgée de '+it.m.n.toLowerCase()+'.':NAME()+' mange : '+it.m.n.toLowerCase()+'.');rsUI()}
// ---------- carte (fenêtre plein écran) ----------
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
const coinS=p=>'<span class="rsCoin"></span>'+p;
function buildMenu(){if(R.menu)return R.menu;const box=el('div','rsOver');box.id='rsMenu';box.hidden=true;box.innerHTML='<div class="rsCard" role="dialog" aria-label="La carte du restaurant"><div class="rsHead"><div><b>La carte</b><small>Cuisine maison · servie à table</small></div><button class="rsX" aria-label="Fermer">✕</button></div><div class="rsTabs"></div><div class="rsList"></div><div class="rsFoot"><div class="rsSum"></div><button class="rsGo">Commander</button></div><div class="rsStamp">Commande envoyée en cuisine&nbsp;!</div></div>';
 document.body.appendChild(box);const tabs=box.querySelector('.rsTabs');CATS.forEach(c=>{const b=el('button',null,c.n);b.dataset.c=c.k;b.onclick=()=>{R.tab=c.k;fillMenu();sfx('rsPage')};tabs.append(b)});
 box.querySelector('.rsX').onclick=closeMenu;box.addEventListener('pointerdown',e=>{if(e.target===box)closeMenu()});box.querySelector('.rsGo').onclick=order;R.menu=box;R.tab='e';return box}
function openMenu(){const b=buildMenu();R.cart={};b.hidden=false;b.classList.remove('sent');requestAnimationFrame(()=>b.classList.add('on'));fillMenu();sfx('rsPage')}
function closeMenu(){if(!R.menu||R.menu.hidden)return;R.menu.classList.remove('on');setTimeout(()=>{if(!R.menu.classList.contains('on'))R.menu.hidden=true},220)}
function cartList(){return CATS.map(c=>R.cart[c.k]).filter(Boolean).map(k=>MK[k])}
function fillMenu(){const b=R.menu;if(!b)return;b.querySelectorAll('.rsTabs button').forEach(t=>{t.classList.toggle('act',t.dataset.c==R.tab);const k=R.cart[t.dataset.c];t.classList.toggle('pick',!!k)});
 const L=b.querySelector('.rsList');L.innerHTML='';MENU.filter(m=>m.c==R.tab).forEach(m=>{const row=el('div','rsItem'+(R.cart[m.c]==m.k?' sel':''));const cv=el('canvas','rsArt');cv.width=240;cv.height=180;art(cv.getContext('2d'),m.k,240,180);
  const tx=el('div','rsTxt','<b>'+m.n+'</b><p>'+m.d+'</p>');const pr=el('div','rsPr',coinS(m.p));const bt=el('button','rsPick',R.cart[m.c]==m.k?'✓ Choisi':'Choisir');
  bt.onclick=()=>{R.cart[m.c]=R.cart[m.c]==m.k?null:m.k;sfx('rsTick');fillMenu()};row.append(cv,tx,pr,bt);row.querySelector('.rsArt').onclick=()=>bt.click();L.append(row)});L.scrollTop=0;
 const c=cartList(),tot=c.reduce((a,m)=>a+m.p,0),d=me(),due=unpaid(d)+pending(d).reduce((a,it)=>a+it.m.p,0),coins=Math.floor(N.coins||0),seated=C.st=='rsit'&&!R.sit,go=b.querySelector('.rsGo'),sum=b.querySelector('.rsSum');
 sum.innerHTML=(c.length?'<b>'+c.map(m=>m.n).join(' · ')+'</b>':'<b>Choisis tes plats</b>')+'<span>Total '+coinS(tot)+' · Tu as '+coinS(coins)+(due?' · déjà commandé '+coinS(due):'')+'</span>';
 let why='';if(!seated)why='Installe-toi à une table pour commander';else if(!c.length)why='';else if(tot+due>coins)why='Il te manque '+(tot+due-coins)+' pièce'+(tot+due-coins>1?'s':'');
 go.disabled=!seated||!c.length||tot+due>coins;go.textContent=why||(c.length?'Commander · '+tot:'Commander');go.classList.toggle('warn',!!why)}
function order(){const d=me(),c=cartList();if(!c.length||C.st!='rsit')return;const tot=c.reduce((a,m)=>a+m.p,0),due=unpaid(d)+pending(d).reduce((a,it)=>a+it.m.p,0);if(tot+due>(N.coins||0)){fillMenu();return}
 d.order=(d.order||[]).filter(it=>it.st!='paid').concat(c.map(mkItem));R.cart={};sfx('rsStamp');R.menu.classList.add('sent');task('take',d,4);say(NAME()+' a choisi : '+c.map(m=>m.n.toLowerCase()).join(', ')+'. Le serveur arrive.');rsUI();
 setTimeout(()=>{closeMenu()},950)}
// ---------- addition ----------
function buildBill(){if(R.bill)return R.bill;const box=el('div','rsOver');box.id='rsBill';box.hidden=true;box.innerHTML='<div class="rsCard rsTicket" role="dialog" aria-label="L’addition"><div class="rsHead"><div><b>L’addition</b><small>Merci de votre visite&nbsp;!</small></div><button class="rsX" aria-label="Fermer">✕</button></div><div class="rsLines"></div><div class="rsFoot"><div class="rsSum"></div><button class="rsGo">Payer</button></div></div>';
 document.body.appendChild(box);box.querySelector('.rsX').onclick=closeBill;box.addEventListener('pointerdown',e=>{if(e.target===box)closeBill()});box.querySelector('.rsGo').onclick=pay;R.bill=box;return box}
function openBill(){const b=buildBill(),d=me(),its=d.order.filter(it=>['served','eaten'].includes(it.st)),tot=unpaid(d),coins=Math.floor(N.coins||0);
 b.querySelector('.rsLines').innerHTML=its.map(it=>'<div class="rsLine"><span>'+it.m.n+'</span><i></i><span>'+coinS(it.m.p)+'</span></div>').join('')+'<div class="rsLine rsTot"><span>Total</span><i></i><span>'+coinS(tot)+'</span></div>';
 const go=b.querySelector('.rsGo');go.disabled=coins<tot||!tot;go.textContent=coins<tot?'Il te manque '+(tot-coins)+' pièce'+(tot-coins>1?'s':''):'Payer '+tot;go.classList.toggle('warn',coins<tot);
 b.querySelector('.rsSum').innerHTML='<b>'+its.length+' article'+(its.length>1?'s':'')+'</b><span>Tu as '+coinS(coins)+(coins>=tot?' · il te restera '+coinS(coins-tot):'')+'</span>';
 b.hidden=false;requestAnimationFrame(()=>b.classList.add('on'));sfx('rsPage');R.billOpen=true}
function closeBill(){if(!R.bill||R.bill.hidden)return;R.bill.classList.remove('on');R.billOpen=false;setTimeout(()=>{if(!R.bill.classList.contains('on'))R.bill.hidden=true},220);if(R.billW&&unpaid(me())){const w=R.billW;R.billW=null;w.billT=0;rsUI()}}
function pay(){const d=me(),tot=unpaid(d);if(!tot)return;if((N.coins||0)<tot){openBill();return}
 earn(-tot);const S=ST(),its=d.order.filter(it=>['served','eaten'].includes(it.st));S.depense=(S.depense||0)+tot;S.repas=(S.repas||0)+1;S.hist.unshift({t:Date.now(),items:its.map(it=>it.m.k),total:tot});if(S.hist.length>20)S.hist.length=20;
 d.order.forEach(it=>{if(['new','sent','cook','ready'].includes(it.st))R.kit.q=R.kit.q.filter(q=>q.it!==it);it.st='paid'});R.kit.q=R.kit.q.filter(q=>q.d!==d);R.tasks=R.tasks.filter(t=>t.d!==d||t.w);
 if(d.eat){d.eat=null;C.seq=null}sfx('rsPay');fx.push({k:'$',x:C.x,y:C.y,l:50});save();closeBill();const w=R.billW;R.billW=null;if(w){w.billT=0;w.bub='love';setTimeout(()=>{w.bub=null},1600)}
 say('Le serveur : « Merci ! '+tot+' pièce'+(tot>1?'s':'')+', c’est parfait. À très bientôt ! »');try{checkGoals&&checkGoals()}catch(e){}rsUI()}
function askBill(){const d=me();if(!unpaid(d)){say('Rien à régler pour le moment.');return}const p=pending(d).filter(it=>it.st!='carry');
 if(p.length){p.forEach(it=>{it.st='paid';it.cancel=1});R.kit.q=R.kit.q.filter(q=>!p.includes(q.it));say('Les plats pas encore servis sont annulés (non facturés).')}
 if(R.billW){openBill();return}task('bill',d,5);say(NAME()+' demande l’addition. Le serveur l’apporte.');rsUI()}
// ---------- arrivée, départ ----------
function rsEnter(){R.on=true;R.npc=[];R.tasks=[];R.kit.q=[];R.cart={};R.sit=null;R.billW=null;NID=0;SEATS.forEach(s=>{s.who=null;s.res=null});
 R.me={me:true,i:-1,seat:null,order:[],eat:null};R.wt=[0,1].map(k=>({k,i:k,u:IDLE[k][0],v:IDLE[k][1],t:0,fl:k==0,path:null,wait:0,job:null}));
 const fs=SEATS.filter(s=>!s.booth||Math.random()<.7).sort(()=>Math.random()-.5);const n=2+Math.floor(Math.random()*2);for(let i=0;i<n&&i<fs.length;i++)newClient(fs[i],true);
 R.spawn=rnd(400,900);ST().visites=(ST().visites||0)+1;
 [0,1,2,3,4].forEach(i=>['idle','w0','w1','w2','w3'].forEach(nm=>nImg(i,nm)));[2,3].forEach(i=>['cu1','cu2'].forEach(nm=>nImg(i,nm)));nImg(4,'wave');R.npc.forEach(d=>['dn0','dn1','dn2','dn3','dn4','dn6','dn7'].forEach(nm=>nImg(d.i,nm)))}
function rsLeaveState(){R.on=false;R.npc=[];R.wt=[];R.tasks=[];R.kit.q=[];R.sit=null;SEATS.forEach(s=>{s.who=null;s.res=null});closeMenu();closeBill();PLACES.resto.furn=FIX.slice();if(C.st=='rsit'){C.st='idle';C.alpha=null}}
function leave(){const d=me();if(R.sit)return;if(unpaid(d)){say('Il faut d’abord régler l’addition ('+unpaid(d)+' pièces) avant de partir.');R.flash=60;rsUI();return}
 const p=pending(d);if(p.length){p.forEach(it=>{it.st='paid';it.cancel=1});R.kit.q=R.kit.q.filter(q=>q.d!==d);R.tasks=R.tasks.filter(t=>t.d!==d)}
 closeMenu();if(C.st=='rsit'){standUp(()=>{d.seat=null;goHome()});return}goHome()}
{const _gh=goHome;goHome=function(dst){if(isR()&&R.on){const d=me();if(d&&unpaid(d)){say('Il faut d’abord régler l’addition ('+unpaid(d)+' pièces) avant de partir.');return}if(C.st=='rsit'){standUp(()=>{if(d)d.seat=null;_gh(dst)});return}}return _gh(dst)}}
{const _ar=arrive;arrive=function(d){if(R.on&&d!='resto')rsLeaveState();_ar(d);if(d!='resto')return;rsEnter();show('resto');rsUI();
 const fa=C.after;C.after=()=>{if(fa)fa();show('resto');R.host.wave=120;say('L’hôtesse : « Bonsoir et bienvenue ! Installez-vous où vous voulez, ou laissez-moi vous placer. »');try{talkMaybe('sortie',.3)}catch(e){}rsUI()}}}
{const _sh=show;show=function(v){if(v=='resto'&&curV!='resto')setTimeout(rsUI,0);_sh(v)}}
// ---------- boucle ----------
{const _up=update;update=function(){_up();if(!isR()){if(R.on)rsLeaveState();return}if(!R.on)return;
 try{prepTick(prepQ.length>20?4:2);
  kitchenTick();R.wt.forEach(waiterTick);R.npc.forEach(npcTick);R.npc=R.npc.filter(d=>{if(d.gone){if(d.seat){if(d.seat.who===d)d.seat.who=null;if(d.seat.res===d)d.seat.res=null}R.tasks=R.tasks.filter(t=>t.d!==d)}return!d.gone});
  // file auto-réparée : chaque besoin en cours a toujours une tâche (commande à prendre, plat prêt, addition)
  const has=(k,d)=>R.tasks.some(t=>t.k==k&&t.d===d&&!t.done);
  [R.me].concat(R.npc).forEach(d=>{if(!d||!d.order)return;if(d.order.some(it=>it.st=='new')&&!has('take',d))task('take',d,4);if(d.order.some(it=>it.st=='ready')&&!has('serve',d))task('serve',d,3);if(!d.me&&d.st=='bill'&&!d.paid&&!has('bill',d))task('bill',d,1)});
  if(R.host.wave>0)R.host.wave--;
  // nouveaux clients de temps en temps (on garde toujours des places libres)
  if(--R.spawn<=0){R.spawn=rnd(700,1500);const fr=freeSeats();if(R.npc.length<5&&fr.length>4){const s=pick(fr);newClient(s,false);['dn0','dn1','dn2','dn3','dn4','dn6','dn7'].forEach(nm=>nImg(R.npc[R.npc.length-1].i,nm))}}
  // porte : s'ouvre quand un client entre ou sort
  if(R.door>0){R.door--;if(!['door','enter','leave'].includes(C.st)){doorT=1;R.dOpen=1}}else if(R.dOpen){R.dOpen=0;if(!['door','enter','leave','trip'].includes(C.st))doorT=0}
  // joueur : installation, repas
  sitTick();const d=me();if(C.st=='rsit'&&d.eat)eatTick(d);
  if(d.seat&&C.st!='rsit'&&!R.sit&&!C.path&&C.st!='walk'&&d.seat.res===d&&!busyOrder(d)){d.seat.res=null;d.seat=null}
  // personnages dynamiques dans la liste des meubles (tri en profondeur commun)
  const dyn=[],ent=o=>{// clé de tri : passe derrière tout meuble qu'il a devant lui à l'écran
   let k=o.u+o.v+.6;const sx=o.u-o.v;for(const f of FIX){if(!f.s)continue;const fk=f.x+f.w+f.y+f.h;if(fk>=k)continue;if(o.u<f.x+f.w+.2&&o.v<f.y+f.h+.2&&sx>f.x-f.y-f.h-.9&&sx<f.x+f.w-f.y+.9)k=fk-.01}
   return{n:'RWalk',s:0,x:o.u,y:o.v,w:0,h:k-o.u-o.v,p:o}};
  R.wt.forEach(w=>dyn.push(ent(w)));R.npc.forEach(n=>{if(['in','go','out','exit','sitdown','up'].includes(n.st))dyn.push(ent(n))});
  PLACES.resto.furn=FIX.concat(dyn);
  if(tick%20==0)rsUI();if(R.flash>0)R.flash--}catch(e){console.error(e)}}}
// image du joueur assis : poses « à table » du jeu, avec la tenue portée
{const _sp=spUpdate;spUpdate=function(){if(isR()&&C.st=='rsit'&&!creating&&!dressing){let nm=dnF(me()&&me().eat,C.t);if(typeof SPR!='undefined'&&!SPR[nm])nm='dn0';const L=N.look,k=nm+JSON.stringify(L);if(k!==spKey&&drawFrame(nm,L))spKey=k;spName=nm;SP.fl=false;return}_sp()}}
{const _dw=drawWorld;drawWorld=function(){_dw();if(isR())try{const G0=G;G=rx;sitOverlay();G=G0}catch(e){}}}
// ---------- toucher dans la salle ----------
function mainDoorAt(mx2,my){for(let k=0;k<70;k+=5){const[a,b]=isoInv(mx2,my+k);if(a>-.6&&a<1.3&&b>=DV0-.1&&b<=DV1+.1)return true}return false}
{const _pt=placeTap;placeTap=function(mx2,my,tu,tv){if(!isR())return _pt(mx2,my,tu,tv);if(R.sit||R.billOpen)return;
 const L=FIX,on=(f,ks)=>ks.some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x-.1&&a<=f.x+f.w+.1&&b>=f.y-.1&&b<=f.y+f.h+.1}),hitF=ns=>L.filter(f=>ns.includes(f.n)).find(f=>on(f,[0,8,16,24,32,40]));
 if(mainDoorAt(mx2,my)){leave();return}const d=me();let f;
 if(f=hitF(['RTable','RBox'])){const[a,b]=isoInv(mx2,my+16);if(d.seat&&f.seats.includes(d.seat)&&C.st=='rsit'){const it=d.order.find(x=>x.st=='served');if(d.eat||it)eatNext(it&&it.m.c=='b'&&!d.order.some(x=>x.st=='served'&&x.m.c!='b')?'b':'f');else openMenu();return}
  const fr=f.seats.filter(s=>!s.who&&(!s.res||s.res===d));if(!fr.length){say('Cette table est occupée.');return}const s=fr.sort((p,q)=>Math.hypot(p.cu-a,p.cv-b)-Math.hypot(q.cu-a,q.cv-b))[0];sitAt(s);return}
 if(C.st=='rsit'){standUp();say(NAME()+' se lève.');return}
 if(f=hitF(['RAccueil'])){placeMe();return}
 if(f=hitF(['RPasse','RCuis'])){const c=R.kit.q.filter(q=>q.it.st=='cook').length;say(c?'En cuisine, les chefs préparent '+c+' plat'+(c>1?'s':'')+'. Ça sent bon !':'La cuisine ouverte : piano de cuisson, plancha et plan de travail. Les chefs attendent les commandes.');return}
 if(f=hitF(['RAqua'])){say('Un grand aquarium : poissons-clowns, guppys et néons nagent tranquillement.');return}
 if(tu<0||tv<0||tu>RN||tv>RN)return;goto(tu*12,88+tv*5)}}
function placeMe(){const d=me();if(C.st=='rsit'){say('Tu es déjà installé'+(N.look&&N.look.g=='f'?'e':'')+'.');return}if(d.seat&&busyOrder(d)){sitAt(d.seat);return}
 const fr=freeSeats().sort((a,b)=>(a.booth?-1:0)-(b.booth?-1:0)||Math.hypot(a.ap[0]-C.x/12,a.ap[1]-(C.y-88)/5)-Math.hypot(b.ap[0]-C.x/12,b.ap[1]-(C.y-88)/5));
 if(!fr.length){say('L’hôtesse : « Désolée, tout est complet pour l’instant ! »');return}R.host.wave=60;say('L’hôtesse : « Suivez-moi, je vous installe '+(fr[0].booth?'sur une banquette':'à la table '+fr[0].f.no)+'. »');sitAt(fr[0],true)}
// ---------- panneau du bas ----------
function tile(g,label,sub,fn,dis,cls){const b=document.createElement('button');b.className='tile'+(cls?' '+cls:'');b.innerHTML=label+(sub?'<small>'+sub+'</small>':'');b.disabled=!!dis;b.onclick=fn;g.append(b);return b}
const ST_TXT={new:'commandé',sent:'en attente',cook:'en cuisine',ready:'prêt',carry:'arrive',served:'servi',eaten:'terminé'};
function rsUI(){const g=document.getElementById('rsG'),info=document.getElementById('rsInfo'),wh=document.getElementById('rsWhere'),lv=document.getElementById('rsLeave');if(!g||!isR()||!R.on)return;
 const d=me(),seated=C.st=='rsit'&&!R.sit,s=d.seat,live=d.order.filter(it=>it.st!='paid'),due=unpaid(d);
 wh.textContent=seated&&s?(s.booth?'Banquette':'Table '+s.f.no):'Restaurant';lv.classList.toggle('rsBlock',!!due);
 const st=it=>it.st=='cook'?'en cuisine '+Math.min(99,Math.round(100*(R.kit.q.find(q=>q.it===it)||{t:0}).t/it.T))+' %':it.st=='eaten'&&it.m.c!='b'?'terminé':it.st=='served'&&it.por<1?'entamé':ST_TXT[it.st];
 info.innerHTML=live.length?live.map(it=>it.m.n+' : '+st(it)).join(' · ')+(due?' · à régler '+coinS(due):''):(seated?'Installé'+(N.look&&N.look.g=='f'?'e':'')+' · ouvre la carte pour commander':'Choisis une table libre (touche-la) ou demande à l’hôtesse');info.classList.toggle('rsFlash',R.flash>0);
 const k=JSON.stringify([seated,!!R.sit,live.map(it=>it.st+(it.por<1?'p':'')),!!d.eat,due,!!R.billW,N.coins|0,s&&s.id]);if(k===R.uiK)return;R.uiK=k;g.innerHTML='';
 if(!seated){tile(g,'Être placé','L’hôtesse te trouve une table',placeMe,!!R.sit);
  if(s&&busyOrder(d))tile(g,'Retourner à ma table',s.booth?'Banquette':'Table '+s.f.no,()=>sitAt(s));
  tile(g,'Voir la carte','Entrées, plats, desserts, boissons',openMenu);if(due)tile(g,'Payer l’addition',coinS(due),()=>{if(R.billW)openBill();else askBill()});return}
 tile(g,'La carte',live.length?'Commander autre chose':'Choisir et commander',openMenu);
 const food=d.order.find(it=>it.st=='served'&&it.m.c!='b'),drink=d.order.find(it=>it.st=='served'&&it.m.c=='b');
 if(d.eat)tile(g,'Pause','Poser '+(d.eat.it.m.u=='main'?'le plat':d.eat.it.m.u=='drink'?'le verre':'les couverts'),()=>eatNext());
 else{tile(g,food?'Manger':'Manger',food?food.m.n:'Rien à table pour l’instant',()=>eatNext('f'),!food);if(drink)tile(g,'Boire',drink.m.n+' · une gorgée',()=>eatNext('b'))}
 if(due)tile(g,R.billW?'Payer':'L’addition',coinS(due),()=>{if(R.billW)openBill();else askBill()},false,'rsBillT');
 tile(g,'Se lever',busyOrder(d)?'Ta place reste réservée':'Libérer la table',()=>{standUp();say(NAME()+' se lève.')})}
(function init(){const lv=document.getElementById('rsLeave');if(lv)lv.onclick=leave})();
// ---------- objectif ----------
try{if(typeof GOALS!='undefined'&&!GOALS.some(g=>g.id=='resto'))GOALS.push({id:'resto',t:'Manger au restaurant',r:10,ok:()=>((N.resto&&N.resto.repas)||0)>=1})}catch(e){}
try{LINES.resto=['Mmm, ça a l’air délicieux !','Rien de tel qu’un bon repas au restaurant.','Le chef est vraiment doué.','J’adore l’ambiance ici.']}catch(e){}
window.RESTO={R,MENU,MK,CATS,SEATS,FIX,ST,sitAt,standUp,openMenu,closeMenu,order,openBill,closeBill,pay,askBill,leave,eatNext,placeMe,rsUI,unpaid,pending,newClient,art,me,task}})();
