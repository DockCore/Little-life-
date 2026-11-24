// ===== CINÉMA : intérieur explorable (hall, billetterie, confiserie, couloir, 3 salles, toilettes, locaux) =====
// S'appuie sur le moteur des lieux de Little Life : chaque pièce est un lieu isométrique de PLACES (sol, murs, mobilier
// solide, chemins), avec un mobilier propre (PLD) et un décor mural ajouté par-dessus le décor commun.
// Nouveauté : des portes intérieures relient les pièces (fondu au noir, arrivée par la porte de la pièce suivante).
(function(){
// ---------- lettres supplémentaires pour les textes muraux ----------
Object.assign(FONT,{B:['110','101','110','101','110'],F:['111','100','110','100','100'],H:['101','101','111','101','101'],V:['101','101','101','101','010'],G:['111','100','101','101','111'],
 K:['101','110','100','110','101'],Y:['101','101','010','010','010'],W:['101','101','111','111','101'],Z:['111','001','010','100','111'],J:['001','001','001','101','111'],Q:['111','101','101','111','001'],
 '>':['100','010','001','010','100'],'·':['000','000','010','000','000'],'!':['010','010','010','000','010'],'?':['111','001','010','000','010']});
const GOLD='#d9a441',GOLDL='#f3cd6a',RED='#b8263a',REDD='#7e1828',WOOD='#6b3e30',DARK='#26304a',INK='#1a1420';
// ---------- bibliothèque de films ----------
// Un film = un vrai fichier vidéo MP4 (H.264 + AAC, lisible sur iPhone) dans le dossier films/, plus une ligne ici.
// Pour en ajouter un : déposer films/mon-film.mp4 (et une image films/mon-film.png), puis ajouter {id:'mon-film',s:<salle>,t:'TITRE',g:'Genre',p:<prix>,src,poster}.
// Sous-titres et moments de réaction (rire, surprise, peur, émotion) : facultatifs, dans FILMS_DATA (rue/films_data.js) ; la durée réelle est lue dans la vidéo.
const FILMS=[
 {id:'petit-robot',s:1,t:'PETIT ROBOT',g:'Animation',d:'Un petit robot cherche quelque chose de beau.',p:10,c:'#3fa0d0'},
 {id:'mission-etoile',s:2,t:'MISSION ÉTOILE',g:'Aventure spatiale',d:'La capitaine Lou part explorer une planète inconnue.',p:12,c:'#8a5fd0'},
 {id:'vague-geante',s:3,t:'LA VAGUE GÉANTE',g:'Grand spectacle',d:'Maya affronte la plus grande vague du monde.',p:14,c:'#2fb3a0'}];
FILMS.forEach(F=>{F.src=F.src||'films/'+F.id+'.mp4';F.poster=F.poster||'films/'+F.id+'.png';Object.assign(F,(typeof FILMS_DATA!='undefined'&&FILMS_DATA[F.id])||{},{subs:(typeof FILMS_DATA!='undefined'&&FILMS_DATA[F.id]&&FILMS_DATA[F.id].subs)||[],reactions:(typeof FILMS_DATA!='undefined'&&FILMS_DATA[F.id]&&FILMS_DATA[F.id].reactions)||[]})});
const SNACKS=[{k:'pop',n:'Pop-corn',p:6,a:'acheté',d:'Grand seau, bien chaud'},{k:'boi',n:'Boisson',p:4,a:'achetée',d:'Soda frais'},{k:'bon',n:'Bonbons',p:3,a:'achetés',d:'Assortiment acidulé'}];
// ---------- les pièces ----------
const ROOMS={
 cine_hall:{nom:'le cinéma',titre:'Hall du cinéma',rn:22,wall:'#ead8c2',door:'#9fd0e0',floor:'carpet',fa:'#7a2638',fb:'#6a1f30',
  doors:[{w:'L',a:2.5,b:5.5,to:'cine_couloir',lbl:'SALLES'}],
  furn:[{n:'Guichet',x:2,y:1.7,w:6,h:1.2,s:1},{n:'Potelet',x:2.6,y:5.4,w:4.4,h:.25,s:1},{n:'Borne',x:9,y:.6,w:1,h:.8,s:1},{n:'Borne',x:10.4,y:.6,w:1,h:.8,s:1},
   {n:'Popcorn',x:12.9,y:.4,w:1.2,h:1,s:1},{n:'Popcorn',x:14.4,y:.4,w:1.2,h:1,s:1},{n:'Frigo',x:16,y:.3,w:1,h:1,s:1},{n:'Frigo',x:17.1,y:.3,w:1,h:1,s:1},{n:'Prepa',x:18.3,y:.3,w:2.4,h:1,s:1},
   {n:'Confiserie',x:12.6,y:2.4,w:7.4,h:1.2,s:1},{n:'Bonbons',x:20.1,y:4.4,w:.9,h:1.8,s:1},
   {n:'Tapis',x:5.5,y:10,w:8,h:6,s:0,cl:{f:5,m:3,a:7}},{n:'Canapé',x:7,y:10.3,w:3,h:1,r:0,s:1,cl:{t:5}},{n:'Canapé',x:7,y:14.7,w:3,h:1,r:2,s:1,cl:{t:5}},{n:'TableBasse',x:7.3,y:12.2,w:2.4,h:1.1,s:1},
   {n:'Pouf',x:11.4,y:11.8,w:1,h:1,s:1,cl:{t:0}},{n:'Pouf',x:11.4,y:13.6,w:1,h:1,s:1,cl:{t:6}},
   {n:'Totem',x:15,y:9.4,w:1,h:.6,s:1},{n:'Kakemono',x:3.6,y:8.6,w:1,h:.4,s:1,f:1},{n:'Kakemono',x:18.6,y:13.4,w:1,h:.4,s:1,f:2},
   {n:'Plante',x:1.2,y:6.8,w:1,h:1,s:1},{n:'Plante',x:1.2,y:13.6,w:1,h:1,s:1},{n:'Plante',x:20,y:8.6,w:1,h:1,s:1},{n:'Plante',x:16.4,y:19.6,w:1,h:1,s:1}]},
 cine_couloir:{nom:'le couloir des salles',titre:'Couloir des salles',rn:18,parent:'cine_hall',wall:'#e2cdb6',door:'#7e1828',floor:'carpet',fa:'#4a1a2a',fb:'#3e1624',
  doors:[{w:'R',a:2,b:4,to:'cine_s1',lbl:'1'},{w:'R',a:7,b:9,to:'cine_s2',lbl:'2'},{w:'R',a:12,b:15,to:'cine_s3',lbl:'3'},{w:'L',a:2,b:4,to:'cine_wc',lbl:'WC'},{w:'L',a:6,b:8,to:'cine_prive',lbl:'PRIVÉ'}],
  furn:[{n:'Tapis',x:2,y:5,w:14,h:2.5,s:0,cl:{f:5,m:2,a:7}},{n:'Banc',x:4.5,y:9.6,w:2.5,h:.8,s:1},{n:'Banc',x:10.5,y:9.6,w:2.5,h:.8,s:1},{n:'Totem',x:14.8,y:10.6,w:1,h:.6,s:1},
   {n:'Plante',x:15.8,y:1.3,w:1,h:1,s:1},{n:'Plante',x:1.2,y:9.3,w:1,h:1,s:1},{n:'Kakemono',x:8.4,y:14.8,w:1,h:.4,s:1,f:0},{n:'Plante',x:15.8,y:15.8,w:1,h:1,s:1}]},
 cine_wc:{nom:'les toilettes',titre:'Toilettes',rn:14,parent:'cine_couloir',wall:'#e4ecef',door:'#5a8ab0',floor:'check',fa:'#f2f4f5',fb:'#d6e2e8',doors:[],
  furn:[{n:'Ilot',x:2.8,y:8,w:7,h:1.2,s:1},{n:'Visiteur',x:6.4,y:6.75,w:.8,h:.5,s:0},{n:'CabineWC',x:1.3,y:.2,w:1.7,h:1.7,s:1,k:'H'},{n:'CabineWC',x:3.1,y:.2,w:1.7,h:1.7,s:1,k:'H'},{n:'Urinoir',x:5,y:.1,w:.6,h:.45,s:1},{n:'Urinoir',x:5.8,y:.1,w:.6,h:.45,s:1},
   {n:'Cloison',x:6.8,y:0,w:.25,h:2.3,s:1},{n:'CabineWC',x:7.3,y:.2,w:1.7,h:1.7,s:1,k:'F'},{n:'CabineWC',x:9.1,y:.2,w:1.7,h:1.7,s:1,k:'F'},{n:'CabineWC',x:10.9,y:.2,w:1.7,h:1.7,s:1,k:'F'},{n:'Plante',x:11.8,y:11.4,w:1,h:1,s:1}]},
 cine_prive:{nom:'l’espace du personnel',titre:'Espace du personnel',rn:14,parent:'cine_couloir',wall:'#c9cdd2',door:'#6a6e78',floor:'tile',fa:'#b9bfc6',fb:'#aeb4bc',doors:[],
  furn:[{n:'Armoire',x:1.2,y:.2,w:1.4,h:.7,s:1},{n:'Serveur',x:2.9,y:.2,w:1,h:1,s:1},{n:'Cloison',x:4.6,y:0,w:.25,h:2.2,s:1},{n:'Etagere',x:5.3,y:.2,w:3.2,h:.9,s:1},{n:'Etagere',x:8.9,y:.2,w:3.2,h:.9,s:1,k:1},
   {n:'Cartons',x:10.9,y:3,w:1.5,h:1.2,s:1},{n:'Cartons',x:6,y:3.4,w:1.2,h:1,s:1,k:1},{n:'Casiers',x:.2,y:1.5,w:.8,h:4.5,r:1,s:1},{n:'TableCafe',x:4.5,y:7.5,w:2,h:1.4,s:1},
   {n:'Café',x:8.5,y:10.5,w:3,h:1,s:1},{n:'Plante',x:12,y:6.5,w:1,h:1,s:1}]}};
// salles : taille, rangées de fauteuils rouges, spectateurs déjà installés (tirés une fois, toujours les mêmes)
function rnd(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
[[1,14,4,8,5.4],[2,18,6,11,5.6],[3,22,8,15,5.8]].forEach(([s,rn,rows,seats,y0])=>{const r=rnd(97+s*31),furn=[{n:'Scene',x:1.6,y:.3,w:rn-3.2,h:1.4,s:1}];
 for(let i=0;i<rows;i++){const occ=[];for(let j=0;j<seats;j++)occ.push(j>0&&j<seats-1&&r()<.33?1+Math.floor(r()*6):0);furn.push({n:'Rangee',x:3,y:y0+i*1.6,w:seats,h:1,s:1,i,occ})}
 ROOMS['cine_s'+s]={nom:'la salle '+s,titre:'Salle '+s,rn,salle:s,parent:'cine_couloir',wall:'#3a2638',door:'#7e1828',floor:'carpet',fa:'#2c2036',fb:'#251b2e',doors:[],furn}});
Object.keys(ROOMS).forEach(k=>{PLACES[k]=ROOMS[k]});
const isCine=p=>typeof p=='string'&&p.startsWith('cine_');
VT.cinema='Cinéma';
// ---------- état sauvegardé ----------
function ST(){if(!N.cine)N.cine={billet:null,snacks:{pop:0,boi:0,bon:0},vus:0};if(!N.cine.snacks)N.cine.snacks={pop:0,boi:0,bon:0};return N.cine}
const CI={mode:null,film:null,dim:0,curt:0,seat:null,busy:false,fade:null};
// ---------- mobilier ----------
function staff(u,v,col,k){const p=P3(u,v,0),X=Math.round(p[0]);B3(u-.2,v-.14,.4,.28,14,32,col,{t:mx(col,'#fff',.12)});B3(u-.21,v-.15,.42,.3,40,4,'#ffffff',{flat:1});B3(u-.06,v-.16,.12,.05,30,10,GOLD,{flat:1});
 const h=P3(u,v,56),hx=Math.round(h[0]),hy=Math.round(h[1]),skin=['#f1c7a3','#c98f62','#8d5a3b'][k%3],hair=['#3b2a24','#c47b60','#1a1420'][k%3];
 ell(hx,hy-9,9,10,INK);ell(hx,hy-9,8,9,skin);ell(hx,hy-15,8,4,hair);G.fillStyle=INK;G.fillRect(hx-4,hy-9,2,2);G.fillRect(hx+3,hy-9,2,2);G.fillStyle='#d98466';G.fillRect(hx-1,hy-4,3,1);
 G.fillStyle=col;G.fillRect(hx-8,hy-21,16,4);G.fillStyle=GOLD;G.fillRect(hx-8,hy-18,16,1);G.fillStyle=mx(col,'#000',.2);G.fillRect(hx-2,hy-24,8,3)}
function isoGuichet(f){const{x,y,w,h}=f;staff(x+1.6,y-.45,RED,0);staff(x+4.4,y-.45,RED,1);fshadow(f);
 B3(x,y,w,h,0,22,'#7a2638',{t:'#9a3448',r:'#5a1a28'});for(let u=x+.5;u<x+w;u+=1)ln(P3(u,y+h,4),P3(u,y+h,19),'#5a1a28');
 B3(x-.05,y-.05,w+.1,h+.1,22,2,GOLD,{t:GOLDL});for(let i=0;i<3;i++){const u=x+.8+i*2;poly([P3(u,y+h,16),P3(u+.9,y+h,16),P3(u+.9,y+h,8),P3(u,y+h,8)],GOLD);poly([P3(u+.1,y+h,15),P3(u+.8,y+h,15),P3(u+.8,y+h,9),P3(u+.1,y+h,9)],'#f6e2a8')}
 G.globalAlpha=.32;poly([P3(x+.1,y+.25,46),P3(x+w-.1,y+.25,46),P3(x+w-.1,y+.25,24),P3(x+.1,y+.25,24)],'#cdeef8');G.globalAlpha=1;
 for(let u=x+.1;u<=x+w;u+=1.45)B3(u-.05,y+.2,.1,.1,24,22,GOLD,{flat:1});B3(x+.05,y+.18,w-.1,.14,46,2,GOLD,{flat:1});
 [[x+1.3,'#26304a'],[x+4.1,'#26304a']].forEach(([u,c])=>{B3(u,y+.45,.6,.4,24,6,c);poly([P3(u+.05,y+.85,29),P3(u+.55,y+.85,29),P3(u+.55,y+.85,25),P3(u+.05,y+.85,25)],'#5fd0f0')});
 B3(x+2.6,y+.5,.5,.4,24,3,'#e8eef2');B3(x+2.75,y+.6,.25,.15,27,1,'#ffffff',{flat:1})}
function isoBorne(f){const{x,y}=f;fshadow(f);B3(x+.15,y+.15,.7,.55,0,5,DARK);B3(x+.3,y+.25,.4,.35,5,22,'#e8eef2',{t:'#ffffff',r:'#c4ccd4'});B3(x+.12,y+.15,.76,.6,27,16,'#e8eef2',{t:'#ffffff',r:'#c4ccd4'});
 B3(x+.12,y+.15,.76,.6,43,4,RED,{t:'#d8384c'});poly([P3(x+.2,y+.75,41),P3(x+.8,y+.75,41),P3(x+.8,y+.75,30),P3(x+.2,y+.75,30)],'#1d6fa0');
 const k=Math.floor(tick/40+x)%3;[0,1,2].forEach(i=>poly([P3(x+.26,y+.75,39-i*3),P3(x+.26+(i==k?.48:.3),y+.75,39-i*3),P3(x+.26+(i==k?.48:.3),y+.75,38-i*3),P3(x+.26,y+.75,38-i*3)],i==k?'#ffe14f':'#bfe8f8'));
 poly([P3(x+.35,y+.75,24),P3(x+.65,y+.75,24),P3(x+.65,y+.75,22),P3(x+.35,y+.75,22)],INK)}
function isoPopcorn(f){const{x,y,w,h}=f;fshadow(f);B3(x+.1,y+.1,w-.2,h-.2,0,14,'#c8202e',{t:'#e03a46'});poly([P3(x+.3,y+h-.1,11),P3(x+w-.3,y+h-.1,11),P3(x+w-.3,y+h-.1,4),P3(x+.3,y+h-.1,4)],GOLD);
 B3(x+.15,y+.15,w-.3,h-.3,14,9,'#f5d76e',{t:'#ffe89a',flat:1});G.globalAlpha=.3;B3(x+.1,y+.1,w-.2,h-.2,14,20,'#cdeef8',{flat:1});G.globalAlpha=1;
 for(const[a,b]of[[x+.1,y+h-.1],[x+w-.1,y+h-.1],[x+w-.1,y+.1]])ln(P3(a,b,14),P3(a,b,34),'#e8e8e8');
 for(let i=0;i<7;i++){const t=((tick*.04+i*.37+x)%1),a=P3(x+.25+((i*.31)%(w-.5)),y+.3+((i*.17)%(h-.5)),24+t*8);G.fillStyle=i%2?'#ffffff':'#fff3c4';G.fillRect(Math.round(a[0]),Math.round(a[1]),2,2)}
 B3(x+.05,y+.05,w-.1,h-.1,34,4,'#c8202e',{t:'#e03a46'});const p=P3(x+w/2,y+h-.05,36);pxDigits('',0,0,'#fff');G.fillStyle='#fff';G.fillRect(Math.round(p[0])-4,Math.round(p[1])-2,9,1)}
function isoPrepa(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,20,'#aeb8c2',{t:'#d4dce4',r:'#8a96a2'});for(let u=x+.6;u<x+w;u+=.6)ln(P3(u,y+h,3),P3(u,y+h,18),'#8a96a2');
 B3(x+.2,y+.2,.8,.6,20,1,'#7a8794',{flat:1});B3(x+.5,y+.25,.1,.1,21,8,'#c4ccd4');
 for(let i=0;i<4;i++)B3(x+1.3+i*.25,y+.3,.2,.2,20+i*0,6+i,'#ffffff',{t:'#e8e8e8'});B3(x+1.3,y+.6,.9,.3,20,5,'#f5c84c',{t:'#ffe08a'})}
function isoConfiserie(f){const{x,y,w,h}=f;staff(x+2.2,y-.55,'#2f6fb0',2);staff(x+5.6,y-.55,'#2f6fb0',0);fshadow(f);
 B3(x,y,w,h,0,20,'#f2e0c6',{t:'#fff3e0',r:'#d4bfa0'});poly([P3(x+.2,y+h,17),P3(x+w-.2,y+h,17),P3(x+w-.2,y+h,4),P3(x+.2,y+h,4)],'#bfe8f5');
 const cols=['#e0533d','#f5c84c','#6cc04a','#3f8fd0','#d98aa8','#ffffff','#f08a24'];for(let i=0;i<26;i++){const a=P3(x+.4+(i*.27)%(w-.7),y+h,6+(i*5)%10);G.fillStyle=cols[i%7];G.fillRect(Math.round(a[0]),Math.round(a[1]),2,2)}
 for(let u=x+.2;u<x+w;u+=1.8)ln(P3(u,y+h,4),P3(u,y+h,17),GOLD);B3(x-.05,y-.05,w+.1,h+.1,20,2,RED,{t:'#d8384c'});
 // caisse, seaux de pop-corn, gobelets
 B3(x+w-1.3,y+.3,.7,.55,22,6,DARK);B3(x+w-1.25,y+.32,.5,.1,28,6,DARK);poly([P3(x+w-1.2,y+.42,33),P3(x+w-.8,y+.42,33),P3(x+w-.8,y+.42,29),P3(x+w-1.2,y+.42,29)],'#6cc04a');
 [[x+.6,'#c8202e'],[x+1.1,'#c8202e'],[x+3.4,'#3f8fd0']].forEach(([u,c],i)=>{B3(u,y+.4,.35,.35,22,i<2?8:7,c,{t:i<2?'#f5d76e':'#ffffff'});if(i<2)for(let q=0;q<3;q++){const a=P3(u+.1+q*.1,y+.5,31);G.fillStyle='#fff3c4';G.fillRect(Math.round(a[0]),Math.round(a[1]),2,1)}})}
function isoBonbons(f){const{x,y,w,h}=f;fshadow(f);B3(x+.05,y+.05,w-.1,h-.1,0,8,WOOD,{t:'#8d5238'});const cols=['#e0533d','#f5c84c','#6cc04a','#3f8fd0','#d98aa8','#8a6ab0'];
 for(let t=0;t<3;t++){const z=8+t*9,inset=t*.12;for(let j=0;j<3;j++){const v=y+.1+inset+j*(h-.2-2*inset)/3;B3(x+.1+inset,v,w-.2-2*inset,(h-.2-2*inset)/3-.04,z,6,'#f4f6f8',{t:cols[(t*3+j)%6]})}}
 B3(x+.4,y+h/2-.1,.1,.2,35,10,GOLD);B3(x+.15,y+h/2-.3,w-.3,.6,45,5,RED,{t:'#d8384c'})}
function isoTableBasse(f){const{x,y,w,h}=f;fshadow(f);legs(x+.1,y+.1,w-.2,h-.2,9,'#3b2a24',.12);B3(x,y,w,h,9,2,'#3b2a24',{t:'#5a4034'});G.globalAlpha=.55;B3(x+.1,y+.1,w-.2,h-.2,11,0,'#cdeef8',{flat:1});G.globalAlpha=1;
 B3(x+.4,y+.3,.5,.35,11,1,'#f5c84c',{flat:1});B3(x+1.4,y+.5,.25,.25,11,4,'#c8202e',{t:'#f5d76e'})}
function isoTotem(f){const{x,y}=f;fshadow(f);B3(x+.1,y+.1,.8,.4,0,3,DARK);B3(x+.2,y+.2,.6,.2,3,48,'#1a1420',{t:'#3a3040'});const fz=[44,36,28,20],c=['#ffe14f','#3fa0d0','#8a5fd0','#2fb3a0'];
 poly([P3(x+.25,y+.4,49),P3(x+.75,y+.4,49),P3(x+.75,y+.4,8),P3(x+.25,y+.4,8)],'#0e1c2a');fz.forEach((z,i)=>{poly([P3(x+.3,y+.4,z),P3(x+.3+(i?.36:.42),y+.4,z),P3(x+.3+(i?.36:.42),y+.4,z-3),P3(x+.3,y+.4,z-3)],c[i]);if(i)poly([P3(x+.6,y+.4,z),P3(x+.7,y+.4,z),P3(x+.7,y+.4,z-3),P3(x+.6,y+.4,z-3)],'#ffffff')})}
function isoPotelet(f){const{x,y,w}=f,n=Math.max(2,Math.round(w/1.5)+1),pts=[];for(let i=0;i<n;i++){const u=x+i*w/(n-1);B3(u-.12,y,.24,.24,0,2,GOLD);B3(u-.05,y+.07,.1,.1,2,16,GOLD,{flat:1});B3(u-.08,y+.04,.16,.16,18,2,GOLDL,{flat:1});pts.push(u)}
 for(let i=1;i<n;i++)for(let k=0;k<=8;k++){const t=k/8,u=pts[i-1]+(pts[i]-pts[i-1])*t,z=16-Math.sin(t*Math.PI)*4,a=P3(u,y+.12,z);G.fillStyle='#c8202e';G.fillRect(Math.round(a[0]),Math.round(a[1]),2,2)}}
function poster(face,a0,a1,z0,z1,k){// affiche de film originale dessinée dans le plan d'une face (fn : (a,z)->point)
 const F=FILMS[k%3],q=(a,b,c,d,col)=>poly([face(a,d),face(b,d),face(b,c),face(a,c)],col),A=t=>a0+(a1-a0)*t,Z=t=>z0+(z1-z0)*t;q(a0,a1,z0,z1,INK);q(A(.06),A(.94),Z(.04),Z(.96),F.c);
 if(k%3==0){q(A(.3),A(.7),Z(.25),Z(.5),'#d4dce4');q(A(.38),A(.62),Z(.52),Z(.68),'#d4dce4');q(A(.42),A(.48),Z(.57),Z(.62),INK);q(A(.52),A(.58),Z(.57),Z(.62),INK);q(A(.15),A(.85),Z(.08),Z(.2),'#f5c84c')}
 else if(k%3==1){q(A(.42),A(.58),Z(.3),Z(.72),'#e8eef2');q(A(.45),A(.55),Z(.72),Z(.8),'#e0533d');q(A(.44),A(.56),Z(.2),Z(.3),'#ffb347');[[.2,.8],[.8,.6],[.25,.4],[.7,.3]].forEach(([s,t])=>q(A(s),A(s+.04),Z(t),Z(t+.03),'#ffffff'))}
 else{q(A(.06),A(.94),Z(.04),Z(.35),'#1d6fa0');q(A(.2),A(.9),Z(.3),Z(.55),'#7fe0f0');q(A(.55),A(.62),Z(.55),Z(.66),'#f5c84c')}
 q(A(.1),A(.9),Z(.84),Z(.92),'#ffffff')}
function isoKakemono(f){const{x,y,w}=f;fshadow(f);B3(x+.1,y+.05,w-.2,.3,0,3,DARK);B3(x+.45,y+.15,.1,.1,3,52,'#8a96a6',{flat:1});poster((a,z)=>P3(a,y+.3,z),x+.1,x+w-.1,6,56,f.f||0);B3(x+.05,y+.2,w-.1,.12,56,2,'#8a96a6',{flat:1})}
function isoBanc(f){const{x,y,w,h}=f;fshadow(f);legs(x+.15,y+.1,w-.3,h-.2,9,GOLD,.1);B3(x,y,w,h,9,4,RED,{t:'#d8384c'});for(let u=x+.5;u<x+w;u+=.5)ln(P3(u,y,13),P3(u,y+h,13),REDD)}
// rangée de fauteuils de cinéma : marche (estrade) avec éclairage au sol, assises, accoudoirs, dossiers côté spectateur
function isoRangee(f){const{x,y,w,h}=f;B3(x-.15,y-.25,w+.3,h+.4,0,3,'#3a2a3c',{t:'#4a3550'});for(let u=x;u<=x+w;u+=.5){const a=P3(u,y+h+.15,1);G.fillStyle='#ffb347';G.fillRect(Math.round(a[0]),Math.round(a[1]),1,1)}
 for(let j=0;j<w;j++){const u=x+j,o=f.occ&&f.occ[j];B3(u+.08,y+.12,.84,.66,3,6,RED,{t:'#d8384c',r:REDD});
  if(o){const c=['#3b2a24','#c47b60','#1a1420','#e0b050','#7a4a38','#2f2a40'][o-1],p=P3(u+.5,y+.5,30);B3(u+.25,y+.35,.5,.35,9,16,['#3f6fb0','#6cc04a','#c0602a','#8a5fd0','#2fb3a0','#e0533d'][o%6],{flat:1});ell(Math.round(p[0]),Math.round(p[1])-2,7,7,c);ell(Math.round(p[0]),Math.round(p[1])+1,6,3,mx(c,'#fff',.08))}
  B3(u+.05,y+.78,.9,.2,3,22,REDD,{t:'#a82a3c',r:'#5a1020'});B3(u+.08,y+.8,.84,.06,22,3,'#d8384c',{flat:1})}
 for(let j=0;j<=w;j++)B3(x+j-.05,y+.15,.1,.68,3,10,INK,{t:'#3a3040',flat:1});
 if(f.pb)B3(x+f.pb-.05,y+.3,.25,.25,13,6,'#c8202e',{t:'#f5d76e'})}
function isoScene(f){const{x,y,w,h}=f;B3(x,y,w,h,0,5,'#2a1824',{t:'#3a2030'});for(let u=x+.25;u<x+w;u+=.5){const a=P3(u,y+h,2);G.fillStyle='#5fd0f0';G.fillRect(Math.round(a[0]),Math.round(a[1]),1,1)}}
// toilettes et locaux
function isoCabine(f){const{x,y,w,h}=f,col=f.k=='F'?'#c0607a':'#4a7fb0',busy=CI.wc&&CI.wc.f===f;
 B3(x+.1,y+.2,.5,.6,0,10,'#f4f6f8');B3(x,y,.08,h,3,44,'#d8dde3',{t:'#eef1f4'});B3(x+w-.08,y,.08,h,3,44,'#d8dde3',{t:'#eef1f4'});
 B3(x,y+h-.08,w,.08,3,44,col,{t:mx(col,'#fff',.2)});poly([P3(x+w-.4,y+h,24),P3(x+w-.3,y+h,24),P3(x+w-.3,y+h,22),P3(x+w-.4,y+h,22)],'#e8eef2');
 poly([P3(x+.6,y+h,40),P3(x+.9,y+h,40),P3(x+.9,y+h,37),P3(x+.6,y+h,37)],busy?'#e0533d':'#6cc04a')}
function isoUrinoir(f){const{x,y}=f;B3(x+.1,y,.4,.35,12,18,'#f2f5f7',{t:'#ffffff'});B3(x+.18,y+.25,.24,.12,13,8,'#dfe6ea',{flat:1});B3(x+.25,y,.1,.1,30,6,'#aeb8c2',{flat:1})}
function isoLavabos(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,22,'#3a3f4a',{t:'#e8eef2',r:'#2a2e38'});for(let v=y+.6;v<y+h;v+=1.2){const p=P3(x+.55,v,22);ell(Math.round(p[0]),Math.round(p[1]),6,3,'#c4ccd4');ell(Math.round(p[0]),Math.round(p[1]),4,2,'#f4f6f8');B3(x+.15,v-.05,.1,.1,22,6,'#aeb8c2',{flat:1})}}
const BASINS=[3.8,5.3,6.8],WASHV=7.1;
function isoIlot(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,20,'#3a3f4a',{t:'#4a505c',r:'#2a2e38'});for(let u=x+.9;u<x+w;u+=1.8){ln(P3(u,y+h,3),P3(u,y+h,17),'#2a2e38');const p=P3(u-.1,y+h,11);G.fillStyle='#aeb8c2';G.fillRect(Math.round(p[0])-2,Math.round(p[1]),4,1)}
 B3(x-.06,y-.06,w+.12,h+.12,20,3,'#e8eef2',{t:'#f8fafb',r:'#c4ccd4'});
 BASINS.forEach(u=>{const p=P3(u,y+.55,23);ell(Math.round(p[0]),Math.round(p[1]),9,4,'#aeb8c2');ell(Math.round(p[0]),Math.round(p[1]),8,3,'#dfe8ee');ell(Math.round(p[0]),Math.round(p[1])+1,3,1,'#8a96a2');
  B3(u-.07,y+.08,.14,.14,23,9,'#c4ccd4',{t:'#ffffff',flat:1});B3(u-.06,y+.08,.12,.32,31,2,'#c4ccd4',{t:'#ffffff',flat:1});B3(u+.18,y+.1,.1,.1,23,4,'#e0533d',{flat:1})});
 [x+.35,x+w-.55].forEach(u=>{B3(u,y+.3,.22,.22,23,8,'#ffffff',{t:'#f0f4f6'});B3(u+.07,y+.3,.08,.12,31,3,'#8a96a2',{flat:1})})}
// autres clients : dessinés avec le vrai système de personnages du jeu (mêmes images, vraies tenues), images préparées hors du dessin
const NPCL=[{g:'f',sk:2,hc:3,wd:{cheveux:'bun|1',haut:'blouse|2',bas:'jupe|1',chaussures:'bottine|0'}},{g:'m',sk:1,hc:0,wd:{cheveux:'mi|0',haut:'polo|3',bas:'cargo|1',chaussures:'running|2'}},
 {g:'f',sk:0,hc:1,wd:{cheveux:'tails|2',haut:'hoodie|4',bas:'legging|0',chaussures:'basket|3'}},{g:'m',sk:2,hc:2,wd:{cheveux:'top|1',haut:'tee|5',bas:'jean|1',veste:'vjean|0',chaussures:'basket|0'}},
 {g:'f',sk:1,hc:0,wd:{cheveux:'long|1',haut:'pull|1',bas:'plisse|2',chaussures:'mocass|1'}},{g:'m',sk:0,hc:4,wd:{cheveux:'nat|0',haut:'flan|2',bas:'chino|0',chaussures:'bottes|1',tete:'bonnet|2'}}];
const NPCC=new Map();function npcLook(i){const B=Object.assign({},N.look);delete B.nu;delete B.lf;return Object.assign(B,NPCL[i%NPCL.length],{wd:Object.assign({},NPCL[i%NPCL.length].wd)})}
function npcPrep(list){let did=false;for(const[i,nm]of list){const k=i+'|'+nm;if(NPCC.has(k))continue;try{if(drawFrame(nm,npcLook(i))){const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);NPCC.set(k,c);did=true}}catch(e){}}if(did)spKey=''}
const npcImg=(i,nm)=>NPCC.get(i+'|'+nm);
function isoVisiteur(f){const n=CI.npc;if(!n)return;const u=BASINS[n.b],img=npcImg(n.i||0,n.w?(Math.floor(tick/7)%2?'cu2':'cu1'):'idle');if(!img)return;const p=P3(u,WASHV,0),a=Math.min(1,Math.min(n.T-n.t,n.t)/25);
 rx.globalAlpha=a;gshadow(p[0],p[1],24);charDraw(img,p[0],p[1]+(n.w?1:0),false,CW,CH);rx.globalAlpha=1}
function isoCloison(f){const{x,y,w,h}=f;B3(x,y,w,h,0,50,'#e2e6ea',{t:'#f4f6f8',r:'#c4ccd4'})}
function isoArmoire(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,46,'#8a96a2',{t:'#a8b2be'});ln(P3(x+w/2,y+h,4),P3(x+w/2,y+h,44),'#6a7480');const p=P3(x+w*.3,y+h,34);G.fillStyle='#f5c84c';
 for(let i=0;i<5;i++)G.fillRect(Math.round(p[0])-i,Math.round(p[1])+i,2*i+1,1);G.fillStyle=INK;G.fillRect(Math.round(p[0]),Math.round(p[1])+1,1,2)}
function isoServeur(f){const{x,y,w,h}=f;fshadow(f);B3(x+.05,y+.05,w-.1,h-.1,0,50,'#1a1c24',{t:'#2a2e38'});for(let z=6;z<48;z+=6){poly([P3(x+.1,y+h-.05,z+4),P3(x+w-.1,y+h-.05,z+4),P3(x+w-.1,y+h-.05,z),P3(x+.1,y+h-.05,z)],'#2a2e38');
  for(let i=0;i<4;i++){const a=P3(x+.2+i*.15,y+h-.05,z+2);G.fillStyle=(Math.floor(tick/(8+i*3)+z+i)%4)?'#6cc04a':(i%2?'#ffb347':'#3f8fd0');G.fillRect(Math.round(a[0]),Math.round(a[1]),1,1)}}}
function isoEtagere(f){const{x,y,w,h}=f;fshadow(f);[0,16,32].forEach(z=>B3(x,y,w,h,z,1.5,'#8a96a2',{t:'#aeb8c2',flat:1}));[[x,y],[x+w-.08,y],[x,y+h-.08],[x+w-.08,y+h-.08]].forEach(([a,b])=>B3(a,b,.08,.08,0,48,'#6a7480',{flat:1}));
 const box=['#c49a6c','#b0885c','#d4aa7c'];[1.5,17.5,33.5].forEach((z,j)=>{for(let u=x+.1;u<x+w-.6;u+=.75){const big=(Math.floor(u*3)+j)%3;if(f.k&&j==1){B3(u,y+.15,.6,.6,z,10,'#c8202e',{t:'#f5d76e'})}else B3(u,y+.1,.65,.65,z,big?12:9,box[(j+big)%3],{t:mx(box[(j+big)%3],'#fff',.15)})}})}
function isoCartons(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,12,'#c49a6c',{t:'#d4aa7c'});B3(x+.1,y+.1,w*.6,h-.2,12,10,'#b0885c',{t:'#c49a6c'});if(f.k)B3(x+w*.55,y+.2,w*.4,h*.5,12,8,'#c8202e',{t:'#ffffff'});
 ln(P3(x+w/2,y+h,0),P3(x+w/2,y+h,12),'#8a6a48')}
function isoCasiers(f){const{x,y,w,h}=f;fshadow(f);B3(x,y,w,h,0,48,'#4a7fb0',{t:'#6a9fd0',l:'#4a7fb0',r:'#3a6a98'});for(let v=y+.75;v<y+h;v+=.75){ln(P3(x+w,v,2),P3(x+w,v,46),'#2a4a70');const p=P3(x+w,v-.4,30);G.fillStyle='#d4dce4';G.fillRect(Math.round(p[0]),Math.round(p[1]),1,3)}}
function isoTableCafe(f){const{x,y,w,h}=f;fshadow(f);[[x-.5,y+.3],[x+w+.05,y+.3]].forEach(([a,b])=>{legs(a,b,.45,.45,9,'#4a525e',.08);B3(a,b,.45,.45,9,2,'#3f8fd0',{t:'#5fa8e0'})});
 legs(x+.1,y+.1,w-.2,h-.2,18,'#4a525e',.1);B3(x,y,w,h,18,2,'#e8eef2',{t:'#ffffff'});B3(x+.4,y+.4,.25,.25,20,4,'#ffffff');B3(x+1.2,y+.6,.5,.35,20,1,'#f5c84c',{flat:1})}
Object.assign(PLD,{Guichet:isoGuichet,Borne:isoBorne,Popcorn:isoPopcorn,Prepa:isoPrepa,Confiserie:isoConfiserie,Bonbons:isoBonbons,TableBasse:isoTableBasse,Totem:isoTotem,Potelet:isoPotelet,Kakemono:isoKakemono,
 Banc:isoBanc,Rangee:isoRangee,Scene:isoScene,CabineWC:isoCabine,Urinoir:isoUrinoir,Lavabos:isoLavabos,Ilot:isoIlot,Visiteur:isoVisiteur,Cloison:isoCloison,Armoire:isoArmoire,Serveur:isoServeur,Etagere:isoEtagere,Cartons:isoCartons,Casiers:isoCasiers,TableCafe:isoTableCafe});
// meubles fixes : dessinés une fois puis recopiés (performances)
FC_PLD.push('Ilot','Rangee','Guichet','Prepa','Confiserie','Bonbons','TableBasse','Totem','Potelet','Kakemono','Banc','Scene','Urinoir','Lavabos','Cloison','Armoire','Etagere','Cartons','Casiers','TableCafe');
// ---------- décor mural ----------
const W=()=>WHI;
function doorL(a,b,lbl,col,glass){const H=Math.round(W()*.66);WL(a-.15,b+.15,0,H+3,GOLD);WL(a,b,0,H,'#140c10');const m=(a+b)/2;
 [[a+.08,m-.04],[m+.04,b-.08]].forEach(([p,q])=>{WL(p,q,0,H-3,glass?'#9fd0e0':col);WL(p+.2,q-.2,Math.round(H*.55),Math.round(H*.8),glass?'#d8f2fa':mx(col,'#fff',.35));WL(p+.12,q-.12,Math.round(H*.45),Math.round(H*.47),GOLD)});
 if(lbl){const z=H+8,wd=lbl.length*4*.14+.4;WL(m-wd/2,m+wd/2,z-2,z+8,INK);wallText(lbl,0,m+wd/2-.2,z,.14,1.6,GOLDL)}}
function doorR(a,b,lbl,col){const H=Math.round(W()*.66);WR(a-.15,b+.15,0,H+3,GOLD);WR(a,b,0,H,'#140c10');const m=(a+b)/2;
 [[a+.08,m-.04],[m+.04,b-.08]].forEach(([p,q])=>{WR(p,q,0,H-3,col);WR(p+.15,q-.15,Math.round(H*.55),Math.round(H*.75),mx(col,'#fff',.3));WR(p+.1,q-.1,Math.round(H*.4),Math.round(H*.42),GOLD)});
 if(lbl){const z=H+6,big=lbl.length<=2,ps=big?.3:.16,pz=big?2.6:1.7,wd=lbl.length*4*ps+.3;WR(m-wd/2-.1,m+wd/2+.1,z-3,z+5*pz+3,GOLD);WR(m-wd/2,m+wd/2,z-2,z+5*pz+2,INK);wallText(lbl,1,m-wd/2+.2,z,ps,pz,'#ffe14f')}}
function sconceL(v,z){WL(v-.25,v+.25,z,z+6,GOLD);WL(v-.18,v+.18,z+6,z+9,'#fff3c4')}function sconceR(u,z){WR(u-.25,u+.25,z,z+6,GOLD);WR(u-.18,u+.18,z+6,z+9,'#fff3c4')}
function wains(c){const H=Math.round(W()*.3),RN0=RN;WL(0,RN0,0,H,c);WR(0,RN0,0,H,mx(c,'#000',.1));WL(0,RN0,H,H+2,GOLD);WR(0,RN0,H,H+2,GOLD)}
function cineDeco(n){const P=PLACES[place],H=W(),rn=RN;
 if(place=='cine_hall'){wains('#7a2638');
  // billetterie
  WR(1.6,8.4,Math.round(H*.62),Math.round(H*.8),INK);WR(1.7,8.3,Math.round(H*.63),Math.round(H*.79),'#3a1420');wallText('BILLETTERIE',1,2.3,Math.round(H*.67),.14,2,GOLDL);
  [2.2,4.4,6.6].forEach((u,i)=>{WR(u,u+1.4,Math.round(H*.4),Math.round(H*.56),INK);WR(u+.08,u+1.32,Math.round(H*.41),Math.round(H*.55),'#0e1c2a');[0,1,2].forEach(r=>WR(u+.18,u+.9-r*.12,Math.round(H*.52)-r*4,Math.round(H*.52)-r*4+2,[FILMS[i].c,'#ffffff','#ffe14f'][r]))});
  WR(8.9,11.6,Math.round(H*.55),Math.round(H*.64),INK);wallText('BORNES',1,9.15,Math.round(H*.57),.11,1.4,'#7fd8f2');
  // menu lumineux de la confiserie
  WR(12.6,20.4,Math.round(H*.5),Math.round(H*.86),INK);WR(12.7,20.3,Math.round(H*.51),Math.round(H*.85),'#140a18');wallText('CONFISERIE',1,13.1,Math.round(H*.77),.17,2,'#ffe14f');
  SNACKS.forEach((s,i)=>{const u=13+i*2.45;WR(u,u+2.1,Math.round(H*.53),Math.round(H*.73),'#2a1430');WR(u+.15,u+.9,Math.round(H*.6),Math.round(H*.7),['#c8202e','#3f8fd0','#d98aa8'][i]);wallText(String(s.p),1,u+1.2,Math.round(H*.6),.17,1.8,'#ffffff')});
  // portes des salles, affiches éclairées, entrée vitrée
  doorL(2.5,5.5,'SALLES',RED);[[6.6,8.4,0],[9.4,11.2,1],[12.2,14,2]].forEach(([a,b,k])=>{WL(a-.12,b+.12,Math.round(H*.36)-2,Math.round(H*.86)+2,GOLD);poster((v,z)=>P3(0,b-(v-a),z),a,b,Math.round(H*.36),Math.round(H*.86),k)});
  WL(14.9,15.75,0,Math.round(H*.66),'#9fd0e0');WL(18.45,19.4,0,Math.round(H*.66),'#9fd0e0');WL(14.85,19.45,Math.round(H*.66),Math.round(H*.66)+3,GOLD);wallText('ENTRÉE',0,18.2,Math.round(H*.72),.14,1.6,GOLDL);
  [1.2,11.8,21].forEach(u=>sconceR(u,Math.round(H*.88)))}
 else if(place=='cine_couloir'){wains('#5a1a2a');
  const D=PLACES[place].doors;D.forEach(d=>d.w=='R'?doorR(d.a,d.b,d.lbl,RED):doorL(d.a,d.b,d.lbl,d.lbl=='WC'?'#4a7fb0':'#6a6e78'));
  [[5,6.5,0],[10,11.5,1],[15.6,17,2]].forEach(([a,b,k])=>{WR(a-.1,b+.1,Math.round(H*.38)-2,Math.round(H*.8)+2,GOLD);poster((u,z)=>P3(u,0,z),a,b,Math.round(H*.38),Math.round(H*.8),k)});
  [[1.2],[5.75],[11],[15.4]].forEach(([u])=>sconceR(u,Math.round(H*.85)));[[5],[9.4],[16]].forEach(([v])=>sconceL(v,Math.round(H*.85)));
  {const m=DOORS[1];WL(m-.75,m+.75,Math.round(H*.7),Math.round(H*.8),INK);wallText('HALL',0,m+.6,Math.round(H*.725),.1,1.4,GOLDL)}}
 else if(P.salle){// salle de cinéma : murs acoustiques, écran, rideaux fixes, éclairage, cabine de projection
  const dk='#2a1c2c';WL(0,rn,0,H,dk);WR(0,rn,0,H,mx(dk,'#000',.12));for(let s=.5;s<rn;s+=1){WL(s,s+.45,8,H-4,'#33223a');WR(s,s+.45,8,H-4,'#2c1d32')}
  WL(0,rn,0,8,'#140c18');WR(0,rn,0,8,'#140c18');
  P.furn.filter(f=>f.n=='Rangee').forEach(f=>{for(const[a,b]of[[1.2,f.x-.2],[f.x+f.w+.2,rn-1.2]]){const v=f.y+f.h+.25;poly([P3(a,v-.12,0),P3(b,v-.12,0),P3(b,v+.05,0),P3(a,v+.05,0)],'#4a3550');ln(P3(a,v+.05,0),P3(b,v+.05,0),'#6a5070');for(let u=a+.3;u<b;u+=.6){const q=P3(u,v,0);G.fillStyle='#ffb347';G.fillRect(Math.round(q[0]),Math.round(q[1]),1,1)}}});
  const S=CI.scr(rn);WR(S.u0-.35,S.u1+.35,S.z0-4,S.z1+4,'#0a0608');WR(S.u0,S.u1,S.z0,S.z1,'#cfd4da');
  WR(S.u0-1.2,S.u1+1.2,S.z1+4,S.z1+12,'#8e1a2c');for(let u=S.u0-1.1;u<S.u1+1.1;u+=.6)WR(u,u+.3,S.z1+4,S.z1+12,'#a82a3c');WR(S.u0-1.2,S.u1+1.2,S.z1+3,S.z1+4,GOLD);
  for(let u=.8;u<rn;u+=rn/4)sconceR(u,Math.round(H*.86));for(let v=2;v<rn-1;v+=rn/4)sconceL(v,Math.round(H*.7));
  // cabine de projection (fenêtres en hauteur, côté spectateurs) et panneau SORTIE au-dessus de la porte
  const pv=rn-2.2;WL(pv-1.2,pv+.4,Math.round(H*.8),Math.round(H*.95),'#0a0608');WL(pv-1.05,pv-.45,Math.round(H*.83),Math.round(H*.92),'#5a6a80');WL(pv-.3,pv+.25,Math.round(H*.83),Math.round(H*.92),'#5a6a80');
  const dm=DOORS[1];WL(dm-.9,dm+.9,Math.round(H*.7),Math.round(H*.78),'#0e3a1a');wallText('SORTIE',0,dm+.75,Math.round(H*.715),.12,1.3,'#5cff8a')}
 else if(place=='cine_wc'){WL(1.8,5.8,Math.round(H*.4),Math.round(H*.42),'#c4ccd4');for(let z=10;z<H;z+=10){WL(0,rn,z,z+1,'#cfdce2');WR(0,rn,z,z+1,'#cfdce2')}for(let s=1;s<rn;s+=1){WL(s,s+.04,0,H,'#cfdce2');WR(s,s+.04,0,H,'#cfdce2')}
  WL(1.9,5.7,Math.round(H*.42),Math.round(H*.78),'#8a96a6');WL(2,5.6,Math.round(H*.44),Math.round(H*.76),'#d8eef6');WL(2.5,3.1,Math.round(H*.5),Math.round(H*.7),'#eef8fc');
  WL(6.2,6.8,Math.round(H*.4),Math.round(H*.55),'#e8eef2');WL(6.3,6.7,Math.round(H*.42),Math.round(H*.44),'#3a3f4a');
  WR(1.4,6.4,Math.round(H*.8),Math.round(H*.92),'#2a5a90');wallText('HOMMES',1,2.6,Math.round(H*.83),.16,1.6,'#ffffff');WR(7.4,12.6,Math.round(H*.8),Math.round(H*.92),'#a04060');wallText('FEMMES',1,8.6,Math.round(H*.83),.16,1.6,'#ffffff')}
 else if(place=='cine_prive'){WL(0,rn,0,6,'#8a8e96');WR(0,rn,0,6,'#7a7e86');[Math.round(H*.88),Math.round(H*.92)].forEach((z,i)=>WR(0,rn,z,z+2,i?'#c0602a':'#8a96a6'));
  WR(.8,4.3,Math.round(H*.66),Math.round(H*.76),'#f5c84c');wallText('TECHNIQUE',1,1,Math.round(H*.685),.11,1.5,INK);WR(5.4,11.9,Math.round(H*.66),Math.round(H*.76),'#3a3f4a');wallText('RÉSERVE',1,7.2,Math.round(H*.685),.15,1.6,'#ffffff');
  WL(10.9,13.6,Math.round(H*.45),Math.round(H*.75),'#a87a4a');[[11.2,11.9,'#ffffff'],[12.1,12.6,'#f5c84c'],[12.8,13.3,'#9fd0e0']].forEach(([a,b,c],i)=>WL(a,b,Math.round(H*.52)+i*3,Math.round(H*.66)+i*2,c))}
 // portes intérieures de la pièce
 if(place!='cine_couloir')(P.doors||[]).forEach(d=>d.w=='L'?doorL(d.a,d.b,d.lbl,RED):doorR(d.a,d.b,d.lbl,RED))}
CI.scr=rn=>({u0:2.2,u1:rn-2.2,z0:Math.round(WHI*.3),z1:Math.round(WHI*.84)});
// la porte principale (dessinée fermée par le décor commun) reste au-dessus du décor mural : on la protège pendant qu'on peint carrelage, soubassement…
function doorZone(){const DS=RN-16,z=Math.round(WHI*.7)+2;return[P3(0,9.5+DS,0),P3(0,12.7+DS,0),P3(0,12.7+DS,z),P3(0,9.5+DS,z)]}
{const _pb=placeBG;placeBG=function(n){const k=bgKey;_pb(n);if(isCine(place)&&bgKey!==k){G=bgx;bgx.save();try{const Z=doorZone();bgx.beginPath();bgx.rect(0,0,LW,LH);bgx.moveTo(Z[0][0],Z[0][1]);Z.slice(1).forEach(p=>bgx.lineTo(p[0],p[1]));bgx.closePath();bgx.clip('evenodd');cineDeco(n)}catch(e){console.error(e)}finally{bgx.restore()}G=rx}}}
// ---------- écran, rideaux, film, obscurité ----------
function wallImg(img,u0,u1,z0,z1){const iw=img.videoWidth||img.width,ih=img.videoHeight||img.height;if(!iw||!ih)return;const a=(u1-u0)/iw*TW/2,b=(u1-u0)/iw*TH/2,d=(z1-z0)/ih,p=P3(u0,0,z1);rx.save();rx.imageSmoothingEnabled=false;rx.transform(a,b,0,d,p[0],p[1]);rx.drawImage(img,0,0);rx.restore()}
function screenDyn(){const P=PLACES[place];if(!P||!P.salle)return;const S=CI.scr(RN),F=CI.film,on=F&&F.on&&F.s==P.salle;
 if(on&&CM.v&&CM.v.readyState>=2)wallImg(CM.v,S.u0,S.u1,S.z0,S.z1)
 // rideaux rouges : fermés hors séance, ils s'ouvrent au début du film
 const o=CI.curt,half=(S.u1-S.u0)/2+.3,cw=half*(1-o)+.7,G0=G;G=rx;
 for(const side of[0,1]){const a=side?S.u1+.5-cw:S.u0-.5,b=a+cw;WR(a,b,S.z0-6,S.z1+4,'#8e1a2c');for(let u=a+.15;u<b;u+=.45)WR(u,u+.18,S.z0-6,S.z1+4,'#a82a3c');WR(side?a:b-.12,side?a+.12:b,S.z0-6,S.z1+4,REDD)}G=G0}
function salleDark(){const P=PLACES[place];if(!P||!P.salle)return;const d=CI.dim;if(d<=.01)return;{const G0=G;G=rx;rx.globalAlpha=.72*d;poly([P3(-.4,RN+.4,-2),P3(-.4,RN+.4,WHI+2),P3(-.4,-.4,WHI+2),P3(RN+.4,-.4,WHI+2),P3(RN+.4,-.4,-2),P3(RN+.4,RN+.4,-8)],'#060410');rx.globalAlpha=1;G=G0}
 const S=CI.scr(RN),F=CI.film,on=F&&F.on;if(on){if(CM.v&&CM.v.readyState>=2){rx.globalAlpha=d;wallImg(CM.v,S.u0,S.u1,S.z0,S.z1);rx.globalAlpha=1}
  // faisceau du projecteur depuis la cabine
  const pv=RN-2.2,src=P3(0,pv-.7,Math.round(WHI*.87)),G0=G;G=rx;rx.globalCompositeOperation='lighter';rx.globalAlpha=.07*d;poly([src,P3(S.u0,0,S.z1),P3(S.u1,0,S.z0)],'#bfe8ff');rx.globalAlpha=.05*d;poly([src,P3(S.u1,0,S.z1),P3(S.u0,0,S.z0)],'#bfe8ff');rx.globalAlpha=1;rx.globalCompositeOperation='source-over';G=G0}
 // éclairage au sol des marches et des allées, panneau de sortie
 rx.fillStyle='rgba(255,179,71,'+(.9*d).toFixed(2)+')';P.furn.filter(f=>f.n=='Rangee').forEach(f=>{for(const u of[2.1,f.x+f.w+.9]){const a=P3(u,f.y+f.h+.3,0);rx.fillRect(Math.round(a[0])-1,Math.round(a[1]),3,1)}});
 const dm=DOORS[1],a=P3(0,dm,Math.round(WHI*.74));rx.fillStyle='rgba(92,255,138,'+(.35*d)+')';rx.fillRect(Math.round(a[0])-8,Math.round(a[1])-5,22,10)}
{const _dd=doorDraw;doorDraw=function(){_dd();if(isCine(place))try{screenDyn()}catch(e){console.error(e)}}}
function washDyn(){if(place!='cine_wc')return;const f=PLACES.cine_wc.furn.find(o=>o.n=='Ilot'),G0=G;G=rx;
 const flow=[];if(CI.wash&&CI.wash.t>=WASH.on+4&&CI.wash.t<WASH.off)flow.push([CI.wash.b,1]);if(CI.npc&&CI.npc.w)flow.push([CI.npc.b,0]);
 flow.forEach(([b,me])=>{const u=BASINS[b],a=P3(u,f.y+.38,30),c=P3(u,f.y+.5,24);for(let y=Math.round(a[1]);y<c[1];y++){rx.fillStyle=(y+tick)%4<2?'#9fdcf5':'#d8f2fc';rx.fillRect(Math.round(a[0])-1,y,2,1)}
  for(let i=0;i<4;i++){const ph=(tick*.15+i*.25)%1;rx.fillStyle='rgba(216,242,252,'+(1-ph)+')';rx.fillRect(Math.round(c[0]+(i-1.5)*3*ph),Math.round(c[1]-ph*3),1,1)}
  if(me&&CI.wash.t>WASH.scrub0&&CI.wash.t<WASH.scrub1){const h=P3(u,WASHV+.42,28);for(let i=0;i<6;i++){const ph=(tick*.05+i/6)%1;rx.fillStyle='rgba(255,255,255,'+(.9-ph*.7)+')';rx.fillRect(Math.round(h[0]+Math.sin(i*2.1+tick*.2)*5),Math.round(h[1]-ph*10),2,2)}}});
 if(CI.wash&&HEAD){const k=Math.min(1,CI.wash.t/WASH.dur),x=Math.round(HEAD[0])-13,y=Math.round(HEAD[1])-6;rx.fillStyle='#1a1420';rx.fillRect(x-1,y-1,28,5);rx.fillStyle='#d8f2fc';rx.fillRect(x,y,26,3);rx.fillStyle='#3f8fd0';rx.fillRect(x,y,Math.round(26*k),3)}G=G0}
{const _dw=drawWorld;drawWorld=function(){_dw();if(isCine(place))try{salleDark();washDyn()}catch(e){console.error(e)}}}
// ---------- chemins : même algorithme que le jeu, mais grille étendue à toute la pièce (les grandes salles dépassent 16 cases) ----------
{const _fp=findPath;findPath=function(s,g){if(!isCine(place)||RN<=16)return _fp(s,g);const R=3,N=Math.ceil(RN*R),cen=i=>(i+.5)/R,ok=new Uint8Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)ok[j*N+i]=walkable(cen(i),cen(j))?1:0;
 const near=p=>{let bi=-1,bd=1e9;for(let k=0;k<N*N;k++)if(ok[k]){const d=Math.hypot(cen(k%N)-p[0],cen(k/N|0)-p[1]);if(d<bd){bd=d;bi=k}}return bi};const S=near(s),T=near(g);if(S<0||T<0)return[];
 const gs=new Float32Array(N*N).fill(1e9),came=new Int32Array(N*N).fill(-1),closed=new Uint8Array(N*N),hh=k=>{const dx=Math.abs(k%N-T%N),dy=Math.abs((k/N|0)-(T/N|0));return Math.max(dx,dy)+.414*Math.min(dx,dy)};
 const open=[S];gs[S]=0;let best=S;
 while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(gs[open[i]]+hh(open[i])<gs[open[bi]]+hh(open[bi]))bi=i;const c=open.splice(bi,1)[0];if(closed[c])continue;closed[c]=1;if(hh(c)<hh(best))best=c;if(c==T){best=c;break}
  const ci=c%N,cj=c/N|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=N||nj>=N)continue;const n=nj*N+ni;if(!ok[n]||closed[n])continue;
   if(di&&dj&&(!ok[cj*N+ni]||!ok[nj*N+ci]))continue;const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[n]){gs[n]=ng;came[n]=c;open.push(n)}}}
 const pts=[];for(let k=best;k>=0;k=came[k])pts.unshift([cen(k%N),cen(k/N|0)]);if(best==T&&walkable(g[0],g[1]))pts[pts.length-1]=[g[0],g[1]];
 const out=[];let cur=s,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}return out}}
// ---------- personnage assis dans un fauteuil : vu de dos (image du bureau) ----------
{const _sp=spUpdate;spUpdate=function(){const nm=C.st=='cine'?'dk0':C.st=='ciwash'?washFrame():null;if(nm&&!creating&&!dressing){const L=N.look,k=nm+JSON.stringify(L);if(k!==spKey&&drawFrame(nm,L))spKey=k;spName=nm;SP.fl=false;return}_sp()}}
// ---------- musique : ambiance du hall et bande originale pendant les films ----------
MTH.cinema={bpm:88,lp:3200,v:0.4,sw:.18,ch:[[50,53,57,60],[55,59,62,65],[48,52,55,59],[45,48,52,55]],sc:[0,2,3,5,7,9,10],root:74,lead:'triangle',dens:.34};
MTH.cinefilm={bpm:70,lp:2600,v:0,ch:[[45,52,57,60]],sc:[0],root:69,lead:'sine',dens:0};// pendant la séance : la musique du jeu se tait, seul le son du film joue
{const _tn=themeNow;themeNow=function(){if(isCine(place)&&!(typeof tscr!=='undefined'&&!tscr.hidden))return CI.film&&CI.film.on?'cinefilm':'cinema';return _tn()}}
{const _ts=themeSched;themeSched=function(T,t,k){if(curTh=='cinefilm')return;if(curTh=='cinema'){const s=k%16,bar=Math.floor(k/16)%4,ch=T.ch[bar],SD=60/T.bpm/4;
  if(curTh=='cinema'){// jazz de hall de cinéma : contrebasse, balais, accords de piano électrique, vibraphone
   if(s%4==0)pl(ch[0]-12+[0,7,5,3][s/4],t,SD*3.4,.16,'triangle');if(s%4==2)nz(t,.08,.05,6000);if(s==4||s==12)nz(t,.18,.06,2400,'bandpass');
   if(s==0||s==7)ch.forEach(m=>pl(m+12,t,SD*5,.02,'sine'));if(!MOT||k%128==0)MOT=motif(T);const d=MOT[s];if(d>=0&&s%2==0)pl(T.root+T.sc[d%T.sc.length]+(ch[0]%12)-(T.ch[0][0]%12),t,SD*2.5,.035,'triangle')}
  else{// bande originale : nappes de cordes, timbales, cor
   if(s==0)ch.forEach(m=>pl(m,t,SD*16,.03,'sawtooth'));if(s==0||s==8)pl(ch[0]-24,t,SD*7,.12,'sine');if(s==0&&bar%2==0)kick(t,.3);if(s==14&&bar==3)kick(t,.25);
   if(s==0||s==6||s==10)pl(ch[(s/2)%4|0]+12,t,SD*5,.03,'triangle')}return}_ts(T,t,k)}}
// ---------- déplacements entre les pièces ----------
function fadeEl(){let e=document.getElementById('ciFade');if(!e){e=document.createElement('div');e.id='ciFade';try{if(getComputedStyle(topbox).position=='static')topbox.style.position='relative'}catch(_){}topbox.appendChild(e)}return e}
function fadeTo(cb){const e=fadeEl();e.classList.add('on');CI.busy=true;setTimeout(()=>{try{cb()}finally{setTimeout(()=>{e.classList.remove('on');CI.busy=false},60)}},230)}
function setRoom(p){place=p;setRN(PLACES[p].rn);bgKey='';C.path=null;C.gf=null;C.cafe=null;try{fit()}catch(e){}}
// entrée dans une pièce par sa porte principale (animation d'entrée habituelle du jeu)
function enterRoom(p,msg){fadeTo(()=>{if(CI.film)stopFilm(false);washStop();setRoom(p);if(p=='cine_wc')CI.npc=Math.random()<.5?{b:2,t:300,T:420,w:0,i:Math.random()<.5?1:4}:null;C.x=-.45*12;C.y=88+DOORS[1]*5;C.tx=C.x;C.ty=C.y;doorA=1;doorT=1;C.st='enter';C.alpha=0;C.t=0;C.after=()=>{show('cinema');ciUI();if(msg)say(msg)};CI.mode=null;show('cinema');ciUI()})}
// retour dans la pièce précédente, devant la porte par laquelle on était entré
function backRoom(){const p=place,par=PLACES[p].parent;if(!par)return;fadeTo(()=>{if(CI.film)stopFilm(false);washStop();setRoom(par);const d=PLACES[par].doors.find(o=>o.to==p);const t=doorFront(d);C.x=t[0]*12;C.y=88+t[1]*5;C.tx=C.x;C.ty=C.y;C.st='idle';C.idle=200;C.alpha=null;C.d=d.w=='L'?1:-1;doorA=0;doorT=0;CI.mode=null;show('cinema');ciUI();say(NAME()+' revient dans '+PLACES[par].nom+'.')})}
const doorFront=d=>d.w=='L'?[1.45,(d.a+d.b)/2]:[(d.a+d.b)/2,1.45];
function goDoor(d){if(CI.busy)return;const t=doorFront(d);standUpCine();const T0=PLACES[d.to];
 if(T0.salle){const b=ST().billet,F=FILMS[T0.salle-1];if(!(b&&b.s==T0.salle)){say(NAME()+' se dirige vers la salle '+T0.salle+'…');goto(t[0]*12,88+t[1]*5,()=>{C.d=1;say('Le contrôleur : « Il te faut un billet pour la salle '+T0.salle+' (« '+F.t+' »). Billetterie et bornes dans le hall ! »')});return}
  say(NAME()+' présente son billet pour « '+F.t+' ».');goto(t[0]*12,88+t[1]*5,()=>{C.d=1;enterSalle(d)});return}
 say(NAME()+' se dirige vers la porte.');goto(t[0]*12,88+t[1]*5,()=>{C.d=d.w=='L'?-1:1;
 const T=PLACES[d.to];let msg=NAME()+' entre dans '+T.nom+'.';if(T.salle){const b=ST().billet,F=FILMS[T.salle-1];msg=b&&b.s==T.salle?'Salle '+T.salle+' : « '+F.t+' ». Installe-toi dans un fauteuil, le film commence dès que tu es assis.':'Salle '+T.salle+' : « '+F.t+' ». Tu peux visiter, mais il te faut un billet pour voir le film.'}
 if(d.to=='cine_prive')msg='Espace réservé au personnel… '+NAME()+' jette un œil discret.';enterRoom(d.to,msg)})}
// entrée directe en vue spectateur : Nori est installé dans un fauteuil libre, les lumières sont éteintes, le film démarre
function enterSalle(d){const s=PLACES[d.to].salle;fadeTo(()=>{washStop();setRoom(d.to);const R=rows(),f=R[Math.min(R.length-1,Math.floor(R.length/2))],j=freeSeat(f);CI.seat={f,j};C.x=(f.x+j+.5)*12;C.y=88+(f.y+.45)*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='cine';C.d=1;
 CI.dim=1;CI.curt=1;CI.mode=null;CI.direct=d;show('cinema');startFilm(true)})}
// après la séance (fin ou « Quitter ») : retour dans le couloir, devant la porte de la salle
function exitSalle(){const d=CI.direct;CI.direct=null;if(!d)return;const p=place;setRoom('cine_couloir');const t=doorFront(d);C.x=t[0]*12;C.y=88+t[1]*5;C.tx=C.x;C.ty=C.y;C.st='idle';C.idle=200;C.alpha=null;C.d=-1;CI.seat=null;CI.dim=0;CI.curt=0;doorA=0;doorT=0;show('cinema');ciUI()}
function goMainDoor(){if(CI.busy||CI.wash)return;standUpCine();say(NAME()+' sort de '+PLACES[place].nom+'.');goto(DOORS[0]*12,88+DOORS[1]*5,()=>backRoom())}
// ---------- achats ----------
function pay(p,what){if((N.coins||0)<p){say('Il manque '+(p-(N.coins||0))+' pièce'+(p-(N.coins||0)>1?'s':'')+' pour '+what+'.');return false}earn(-p);try{fx.push({k:'$',x:C.x,y:C.y,l:50})}catch(e){}return true}
function buyTicket(i,borne){const F=FILMS[i],p=F.p-(borne?1:0),S=ST();if(S.billet&&S.billet.s==F.s){say('Tu as déjà un billet pour la salle '+F.s+'.');return}
 if(!pay(p,'ce billet'))return;S.billet={s:F.s,t:F.t};save();say((borne?'La borne imprime':'Le guichetier te tend')+' ton billet : salle '+F.s+', « '+F.t+' ». Bonne séance !');CI.mode=null;ciUI()}
function buySnack(k){const s=SNACKS.find(q=>q.k==k),S=ST();if(!pay(s.p,s.n.toLowerCase()))return;S.snacks[k]=(S.snacks[k]||0)+1;save();say(s.n+' '+s.a+' ! '+(k=='pop'?'Ça sent bon le maïs chaud.':k=='boi'?'Bien frais.':'Miam, acidulés.'));ciUI()}
// ---------- fauteuils et séance ----------
function rows(){return PLACES[place].furn.filter(f=>f.n=='Rangee')}
function freeSeat(f,uHint){const fr2=[];for(let j=0;j<f.w;j++)if(!(f.occ&&f.occ[j]))fr2.push(j);if(!fr2.length)return null;const h=uHint==null?f.w/2:uHint-f.x;return fr2.sort((a,b)=>Math.abs(a+.5-h)-Math.abs(b+.5-h))[0]}
function sitIn(f,j){if(CI.busy||C.st=='cine')return;if(j==null){say('Cette rangée est complète.');return}const left=j+.5<f.w/2,aisle=left?[2.05,f.y+f.h+.15]:[f.x+f.w+.95,f.y+f.h+.15];CI.seat={f,j};
 goto(aisle[0]*12,88+aisle[1]*5,()=>{C.st='cinego';C.path=null;CI.seatPath=[[left?f.x-.2:f.x+f.w+.2,f.y+.45],[f.x+j+.5,f.y+.45]];})}
function standUpCine(){if(C.st!='cine'&&C.st!='cinego')return;const f=CI.seat&&CI.seat.f;if(CI.film&&CI.film.on)stopFilm(false);C.st='idle';C.idle=120;if(f){const left=CI.seat.j+.5<f.w/2;C.x=(left?2.05:f.x+f.w+.95)*12;C.y=88+(f.y+f.h+.15)*5;C.tx=C.x;C.ty=C.y}CI.seat=null;ciUI()}
function startFilm(direct){const P=PLACES[place],S=ST();if(!P.salle)return;if(!(S.billet&&S.billet.s==P.salle)){say('Pas de billet pour cette salle : le film ne démarre pas. Achète-le à la billetterie ou à la borne.');return}
 const FI=FILMS.find(f=>f.s==P.salle);CI.film={s:P.salle,id:FI.id,on:true};const sn=S.snacks;CI.pop0=sn.pop>0;if(CI.pop0&&CI.seat)CI.seat.f.pb=CI.seat.j+1;
 say('Les lumières s’éteignent… « '+FI.t+' » va commencer.');ciUI();if(direct){CM.show(FI,true);return}setTimeout(()=>{if(C.st=='cine'&&CI.film&&CI.film.on&&!CM.open)CM.show(FI)},1300)}
function stopFilm(done){const F=CI.film;CI.film=null;const S=ST();CI.pop0=false;Object.values(ROOMS).forEach(R=>R.furn.forEach(f=>{if(f.pb)delete f.pb}));if(done&&F){S.billet=null;S.vus=(S.vus||0)+1;add('happy',20);
  const sn=S.snacks;if(sn.pop>0){sn.pop--;add('hunger',12);add('happy',4)}if(sn.boi>0){sn.boi--;add('happy',3);add('wc',-12)}if(sn.bon>0){sn.bon--;add('happy',4)}
  try{bars()}catch(e){}save();say('FIN. '+NAME()+' a adoré « '+FILMS[F.s-1].t+' » ! Les lumières se rallument.');try{talk(['Quel film ! Je veux le revoir.','J’ai pleuré à la fin… ne le dis à personne.','Le pop-corn rend tout meilleur.'][S.vus%3])}catch(e){}}
 else if(F)say('Le film est interrompu. Ton billet reste valable.');ciUI()}
// ---------- toilettes ----------
function useWC(f){if(CI.wc)return;const fem=N.look&&N.look.g=='f';if((f.k=='F')!==fem){say(fem?'Ce sont les toilettes des hommes : les toilettes des femmes sont à droite.':'Ce sont les toilettes des femmes : celles des hommes sont à gauche.');return}
 goto((f.x+f.w/2)*12,88+(f.y+f.h+.9)*5,()=>{CI.wc={f,t:150};C.alpha=0;C.st='ciwc';say(NAME()+' est aux toilettes…')})}
const WASH={dur:300,on:40,scrub0:56,scrub1:236,off:244};
function basinFree(i){return!(CI.npc&&CI.npc.b==i)&&!(CI.wash&&CI.wash.b==i)&&!(CI.occ&&CI.occ.includes(i))}
function washHands(){if(place!='cine_wc'||CI.wash||CI.wc||C.st=='ciwash')return;const st=[C.x/12,(C.y-88)/5],free=[0,1,2].filter(basinFree);
 if(!free.length){say('Tous les lavabos sont occupés. Attends un instant…');ciUI();return}
 const ok=free.map(i=>{const t=[BASINS[i],WASHV],pth=findPath(st,t);return{i,t,reach:Math.hypot(st[0]-t[0],st[1]-t[1])<.4||!!(pth&&pth.length&&Math.hypot(pth[pth.length-1][0]-t[0],pth[pth.length-1][1]-t[1])<.5),d:Math.hypot(st[0]-t[0],st[1]-t[1])}}).filter(o=>o.reach).sort((a,b)=>a.d-b.d);
 if(!ok.length){say('Aucun lavabo n’est accessible d’ici.');return}const o=ok[0];CI.washGo=o.i;say(NAME()+' va se laver les mains.');
 goto(o.t[0]*12,88+o.t[1]*5,()=>{if(!basinFree(o.i)){CI.washGo=null;say('Ce lavabo vient d’être pris. Réessaie.');return}CI.washGo=null;C.x=o.t[0]*12;C.y=88+o.t[1]*5;C.tx=C.x;C.ty=C.y;C.st='ciwash';C.d=1;CI.wash={b:o.i,t:0,h0:N.hyg||0};ciUI()})}
function washFrame(){const t=CI.wash?CI.wash.t:0;if(t<18)return'idle';if(t<WASH.on-4)return'idle';if(t<WASH.scrub0)return'cu1';if(t<WASH.scrub1)return Math.floor((t-WASH.scrub0)/7)%2?'cu2':'cu1';if(t<WASH.off+8)return'cu1';if(t<WASH.dur-18)return'idle';return Math.floor(t/5)%2?'cu1':'idle'}
function washLean(t){return t<18?0:t<36?(t-18)/18:t<WASH.off+8?1:t<WASH.off+26?1-(t-WASH.off-8)/18:0}
function washTick(){const W2=CI.wash;W2.t++;const t=W2.t;C.hop=-washLean(t)*.75;
 if(t==WASH.on){pfxC('wtTap');CI.water=JEUSON&&JEUSON.loop?JEUSON.loop(1500,'bandpass'):null;if(CI.water)CI.water.set(.22,1500)}
 if(t>WASH.scrub0&&t<WASH.scrub1){if((t-WASH.scrub0)%14==0)pfxC('wtScrub');const now=Date.now(),base=Math.max(N.washAt||0,now-864e5);N.washAt=Math.min(now,base+864e5*.15/(WASH.scrub1-WASH.scrub0))}
 if(t==WASH.off){pfxC('wtTap');if(CI.water){CI.water.stop();CI.water=null}}
 if(t%15==0)ciUI();
 if(t>=WASH.dur){CI.wash=null;C.hop=0;C.st='idle';C.idle=90;add('happy',2);try{needsTick();bars()}catch(e){}save();say(NAME()+' a les mains propres. Hygiène : '+Math.round(N.hyg||0)+' %.');ciUI()}}
function washStop(){if(CI.water){CI.water.stop();CI.water=null}if(CI.wash){CI.wash=null;C.hop=0;if(C.st=='ciwash')C.st='idle'}}
const pfxC=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.05)}catch(e){}};
// ---------- boucle : séance, toilettes, installation dans le fauteuil ----------
{const _up=update;update=function(){_up();if(!isCine(place))return;
 if(C.st=='cinego'&&CI.seatPath){const w=CI.seatPath[0],cu=C.x/12,cv=(C.y-88)/5,du=w[0]-cu,dv=w[1]-cv,l=Math.hypot(du,dv),sp=.06;if(l<sp){C.x=w[0]*12;C.y=88+w[1]*5;CI.seatPath.shift();if(!CI.seatPath.length){CI.seatPath=null;C.st='cine';C.d=1;C.tx=C.x;C.ty=C.y;
    say(NAME()+' s’installe dans le fauteuil.');ciUI();if(PLACES[place].salle&&ST().billet&&ST().billet.s==PLACES[place].salle)setTimeout(()=>{if(C.st=='cine'&&!CI.film)startFilm()},700);else if(PLACES[place].salle)startFilm()}}
  else{C.x+=du/l*sp*12;C.y+=dv/l*sp*5}}
 const P=PLACES[place],F=CI.film,want=F&&F.on?1:0;CI.dim+=(want-CI.dim)*.04;CI.curt+=((F&&F.on?1:0)-CI.curt)*.03;
 if(C.st=='ciwc'&&CI.wc){if(--CI.wc.t<=0){N.wc=100;CI.wc=null;C.alpha=null;C.st='idle';C.idle=60;try{bars()}catch(e){}say('Ça va mieux ! Pense à te laver les mains.');ciUI()}}
 if(C.st=='ciwash'&&CI.wash)washTick();

 if(place=='cine_wc'){npcPrep([[1,'idle'],[1,'cu1'],[1,'cu2'],[4,'idle'],[4,'cu1'],[4,'cu2']]);const n=CI.npc;if(n){n.t--;n.w=n.t>40&&n.t<n.T-30;if(n.t<=0)CI.npc=null}else if(Math.random()<1/1500&&basinFree(2)&&CI.washGo!==2)CI.npc={b:2,t:420,T:420,w:0,i:Math.random()<.5?1:4}}
 else if(CI.npc)CI.npc=null}}
// ---------- toucher dans le cinéma ----------
function doorAt(mx2,my){for(const d of PLACES[place].doors||[])for(let k=0;k<70;k+=5){const[a,b]=isoInv(mx2,my+k);if(d.w=='R'&&b>-.6&&b<1.3&&a>=d.a-.15&&a<=d.b+.15)return d;if(d.w=='L'&&a>-.6&&a<1.3&&b>=d.a-.15&&b<=d.b+.15)return d}return null}
function mainDoorAt(mx2,my){if(place=='cine_hall')return false;for(let k=0;k<70;k+=5){const[a,b]=isoInv(mx2,my+k);if(a>-.6&&a<1.3&&b>=DV0-.1&&b<=DV1+.1)return true}return false}
{const _pt=placeTap;placeTap=function(mx2,my,tu,tv){if(!isCine(place))return _pt(mx2,my,tu,tv);if(CI.busy||C.st=='ciwc')return;
 const L=PLACES[place].furn,on=(f,ks)=>ks.some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x-.1&&a<=f.x+f.w+.1&&b>=f.y-.1&&b<=f.y+f.h+.1}),hitF=ns=>L.filter(f=>ns.includes(f.n)).find(f=>on(f,[0,8,16,24,32,40]));
 const d=doorAt(mx2,my);if(d){goDoor(d);return}if(mainDoorAt(mx2,my)){goMainDoor();return}
 if(C.st=='cine'){standUpCine();say(NAME()+' se lève.');return}
 let f;
 if(f=hitF(['Guichet','Potelet'])){goto(5*12,88+4.4*5,()=>{C.d=-1;CI.mode='billets';ciUI();say('Le guichetier : « Bonsoir ! Quel film ? »')});return}
 if(f=hitF(['Borne'])){goto((f.x+.5)*12,88+(f.y+f.h+1.1)*5,()=>{C.d=-1;CI.mode='borne';ciUI();say('Borne automatique : choisis ton film (1 pièce de moins qu’au guichet).')});return}
 if(f=hitF(['Confiserie','Popcorn','Frigo','Prepa','Bonbons'])){goto(16*12,88+4.6*5,()=>{C.d=-1;CI.mode='snacks';ciUI();say('À la confiserie : pop-corn, boissons et bonbons.')});return}
 if(f=hitF(['Totem','Kakemono'])){say('À l’affiche : '+FILMS.map(F=>'salle '+F.s+' « '+F.t+' » ('+F.g.toLowerCase()+')').join(' · ')+'.');return}
 if(f=hitF(['Rangee'])){const[a]=isoInv(mx2,my+8);sitIn(f,freeSeat(f,a));return}
 if(f=hitF(['CabineWC'])){useWC(f);return}if(f=hitF(['Ilot','Visiteur'])){washHands();return}if(f=hitF(['Urinoir'])){useWC({k:'H',x:f.x-.6,y:f.y,w:1.6,h:1.7});return}
 if(f=hitF(['Serveur','Armoire'])){say('Le local technique : serveur de projection et tableau électrique. On ne touche à rien !');return}
 if(f=hitF(['Etagere','Cartons'])){say('La réserve : maïs à pop-corn, gobelets, boissons et bonbons pour la confiserie.');return}
 if(f=hitF(['Casiers','TableCafe','Café'])){say('Le coin du personnel : casiers, table et machine à café pour la pause.');return}
 if(f=hitF(['Canapé','Pouf','TableBasse','Banc'])){say('Un coin confortable pour attendre la séance.');}
 if(tu<0||tv<0||tu>RN||tv>RN)return;goto(tu*12,88+tv*5)}}
// ---------- arrivée depuis la rue, sortie ----------
{const _ar=arrive;arrive=function(d){_ar(d);if(!isCine(d))return;setRoom(d);C.x=-.45*12;C.y=88+DOORS[1]*5;C.tx=C.x;C.ty=C.y;CI.mode=null;show('cinema');ciUI();
 const fa=C.after;C.after=()=>{if(fa)fa();show('cinema');ciUI();say('Bienvenue au cinéma ! Billetterie et bornes à gauche, confiserie à droite, salles par la grande porte.');try{talkMaybe('sortie',.3)}catch(e){}}}}
{const _sh=show;show=function(v){if(v=='cinema'&&curV!='cinema')setTimeout(ciUI,0);_sh(v)}}
// ---------- panneau du bas ----------
function tile(g,label,sub,fn,dis){const b=document.createElement('button');b.className='tile';b.innerHTML=label+(sub?'<small>'+sub+'</small>':'');b.disabled=!!dis;b.onclick=fn;g.append(b);return b}
function ciUI(){const g=document.getElementById('ciG'),info=document.getElementById('ciInfo'),wh=document.getElementById('ciWhere'),lv=document.getElementById('ciLeave');if(!g||!isCine(place))return;
 const P=PLACES[place],S=ST();g.innerHTML='';wh.textContent=P.titre;lv.lastChild.textContent=place=='cine_hall'?'Partir':'Sortir';
 const sn=S.snacks,inv=[sn.pop?sn.pop+' pop-corn':'',sn.boi?sn.boi+' boisson'+(sn.boi>1?'s':''):'',sn.bon?sn.bon+' bonbons':''].filter(Boolean).join(', ');
 info.textContent=(S.billet?'🎟 Billet : salle '+S.billet.s+' · '+S.billet.t:'Pas de billet')+(inv?' · '+inv:'');
 const coin=p=>'<span class="cn"></span>'+p;
 if(place=='cine_hall'){
  if(CI.mode=='billets'||CI.mode=='borne'){const bo=CI.mode=='borne';FILMS.forEach((F,i)=>{const p=F.p-(bo?1:0);tile(g,'Salle '+F.s+' · '+F.t,F.g+' · '+((N.coins||0)<p?'Encore '+(p-(N.coins||0)):coin(p)),()=>buyTicket(i,bo),(N.coins||0)<p)});tile(g,'Retour','',()=>{CI.mode=null;ciUI()});return}
  if(CI.mode=='snacks'){SNACKS.forEach(s=>tile(g,s.n,(N.coins||0)<s.p?'Encore '+(s.p-(N.coins||0)):coin(s.p),()=>buySnack(s.k),(N.coins||0)<s.p));tile(g,'Retour','',()=>{CI.mode=null;ciUI()});return}
  tile(g,'Billetterie','Acheter un billet',()=>{const f=P.furn.find(o=>o.n=='Guichet');goto(5*12,88+4.4*5,()=>{C.d=-1;CI.mode='billets';ciUI();say('Le guichetier : « Bonsoir ! Quel film ? »')})});
  tile(g,'Borne automatique','Billet en libre-service',()=>goto(9.5*12,88+2.5*5,()=>{C.d=-1;CI.mode='borne';ciUI();say('Borne automatique : choisis ton film.')}));
  tile(g,'Confiserie','Pop-corn, boissons, bonbons',()=>goto(16*12,88+4.6*5,()=>{C.d=-1;CI.mode='snacks';ciUI();say('À la confiserie : que veux-tu ?')}));
  tile(g,'Aller aux salles','Couloir des salles 1, 2 et 3',()=>goDoor(P.doors[0]));return}
 if(place=='cine_couloir'){P.doors.forEach(d=>{const T=PLACES[d.to];tile(g,d.lbl=='WC'?'Toilettes':d.lbl=='PRIVÉ'?'Espace personnel':'Salle '+T.salle,T.salle?FILMS[T.salle-1].t+(S.billet&&S.billet.s==T.salle?' · voir le film':' · billet nécessaire'):d.lbl=='PRIVÉ'?'Réservé au personnel':'Hommes et femmes',()=>goDoor(d))});
  tile(g,'Retour au hall','',goMainDoor);return}
 if(P.salle){const F=FILMS[P.salle-1],sit=C.st=='cine'||C.st=='cinego';
  if(!sit)tile(g,'S’asseoir','Choisir un fauteuil libre',()=>{const R=rows();const f=R[Math.min(R.length-1,Math.floor(R.length/2))];sitIn(f,freeSeat(f))});
  else tile(g,'Se lever','',()=>{standUpCine();say(NAME()+' se lève.')});
  tile(g,CI.film&&CI.film.on?'Film en cours…':'Regarder « '+F.t+' »',S.billet&&S.billet.s==P.salle?(sit?'Installé':'Assieds-toi pour commencer'):'Billet nécessaire',()=>{if(C.st=='cine'){if(!CI.film)startFilm()}else{const R=rows();const f=R[Math.floor(R.length/2)];sitIn(f,freeSeat(f))}},CI.film&&CI.film.on);
  tile(g,'Sortir de la salle','Retour au couloir',goMainDoor);return}
 if(place=='cine_wc'){const fem=N.look&&N.look.g=='f',cab=P.furn.filter(f=>f.n=='CabineWC'&&(f.k=='F')==fem)[0];tile(g,'Aller aux toilettes',fem?'Côté femmes':'Côté hommes',()=>useWC(cab),!!CI.wc);
  {const fr=[0,1,2].filter(basinFree).length;tile(g,'Se laver les mains',CI.wash?'Lavage… '+Math.round(100*CI.wash.t/WASH.dur)+' %':fr?'Environ 5 s · hygiène +15':'Tous les lavabos sont occupés',washHands,!!CI.wc||!!CI.wash||!fr)}tile(g,'Sortir','Retour au couloir',goMainDoor,!!CI.wc);return}
 if(place=='cine_prive'){tile(g,'Local technique','Serveur et tableau électrique',()=>{goto(2.5*12,88+2.4*5,()=>{C.d=-1;say('Le serveur de projection envoie les films dans les 3 salles. Les voyants clignotent : tout va bien.')})});
  tile(g,'Réserve','Stock de la confiserie',()=>{goto(8.5*12,88+2.4*5,()=>{C.d=-1;say('La réserve : sacs de maïs, gobelets, packs de boissons et bonbons.')})});
  tile(g,'Coin du personnel','Casiers et pause café',()=>{goto(5.5*12,88+10.2*5,()=>{C.d=1;say('Le coin du personnel : casiers, table et machine à café.')})});tile(g,'Sortir','Retour au couloir',goMainDoor)}}
function leave(){if(CI.busy)return;if(C.st=='cine'||C.st=='cinego')standUpCine();if(place=='cine_hall'){CI.mode=null;goHome()}else goMainDoor()}
(function init(){const lv=document.getElementById('ciLeave');if(lv)lv.onclick=leave;fadeEl()})();
// ======================= MODE CINÉMA : vraie lecture vidéo en plein écran, vue depuis le fauteuil =======================
// Vue composée : la vidéo (balise <video>, lecture « dans la page » compatible iPhone) occupe la majeure partie de l'écran ;
// par-dessus, un calque pixel art : salle sombre, rideaux, rangées de fauteuils, spectateurs (vrais personnages du jeu, de dos)
// et Nori, de dos, avec exactement sa tenue (image « assis de dos » du jeu dessinée avec ses vêtements), éclairés par la lumière du film.
const CM={open:false,el:null,v:null,cv:null,cx:null,F:null,state:'off',lights:1,light:[40,40,60],lum:.2,react:null,ri:0,hideT:0,last:0,raf:0,bust:null,heads:[],audio:null,gain:null};
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1);
const fmtT=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function cmBuild(){if(CM.el)return;const e=document.createElement('div');e.id='cineMode';e.hidden=true;
 e.innerHTML='<video id="cmVid" playsinline webkit-playsinline preload="auto" disablepictureinpicture></video><canvas id="cmFg"></canvas><div class="cmSub" id="cmSub"></div>'+
  '<div class="cmUi" id="cmUi"><div class="cmTop"><span id="cmTitle"></span><button id="cmQuit" aria-label="Quitter la séance">✕ Quitter</button></div>'+
  '<div class="cmBot"><button id="cmPlay" aria-label="Pause">❚❚</button><div class="cmBar" id="cmBar"><i id="cmFill"></i></div><span id="cmTime">0:00 / 0:00</span>'+
  '<button id="cmMute" aria-label="Couper le son">🔊</button><input type="range" id="cmVol" min="0" max="1" step="0.05" aria-label="Volume"></div></div>'+
  '<div class="cmPanel" id="cmStart"><b id="cmSTitle"></b><small id="cmSInfo"></small><button id="cmGo">▶ Lancer la séance</button><small id="cmRot">Tourne ton téléphone pour un écran plus grand</small></div>'+
  '<div class="cmPanel" id="cmEnd" hidden><b>FIN</b><small id="cmETxt"></small><button id="cmBack">Revenir dans la salle</button></div><div class="cmWait" id="cmWait" hidden>Chargement…</div>';
 document.body.appendChild(e);CM.el=e;CM.v=e.querySelector('#cmVid');CM.cv=e.querySelector('#cmFg');CM.cx=CM.cv.getContext('2d');
 const V=CM.v,$=id=>e.querySelector('#'+id);
 $('cmGo').onclick=()=>cmPlay();$('cmQuit').onclick=()=>cmClose(false);$('cmBack').onclick=()=>cmClose(true);
 $('cmPlay').onclick=ev=>{ev.stopPropagation();if(V.paused){V.play().catch(()=>{})}else V.pause();cmPoke()};
 $('cmMute').onclick=ev=>{ev.stopPropagation();const S=ST();S.mute=!S.mute;cmVol();cmPoke()};$('cmVol').oninput=ev=>{const S=ST();S.vol=+ev.target.value;S.mute=false;cmVol();cmPoke()};
 $('cmBar').onclick=ev=>{ev.stopPropagation();const r=ev.currentTarget.getBoundingClientRect();if(V.duration)V.currentTime=Math.max(0,Math.min(V.duration-.5,(ev.clientX-r.left)/r.width*V.duration));cmPoke()};
 e.addEventListener('pointerdown',ev=>{if(ev.target.closest('button,input,.cmBar'))return;if(CM.state=='play'||CM.state=='pause'){const u=$('cmUi');u.classList.toggle('on');CM.hideT=performance.now()}});
 V.addEventListener('playing',()=>{$('cmWait').hidden=true;CM.state='play';$('cmPlay').textContent='❚❚';$('cmPlay').setAttribute('aria-label','Pause')});
 V.addEventListener('pause',()=>{if(CM.state=='play'){CM.state='pause';$('cmPlay').textContent='▶';$('cmPlay').setAttribute('aria-label','Lecture');$('cmUi').classList.add('on')}});
 V.addEventListener('waiting',()=>{if(CM.state=='play')$('cmWait').hidden=false});V.addEventListener('ended',cmEnd);
 V.addEventListener('error',()=>{if(!CM.open)return;$('cmWait').hidden=true;$('cmSInfo').textContent='La vidéo n’a pas pu être chargée. Vérifie ta connexion puis réessaie.';$('cmStart').hidden=false;CM.state='start'});
 addEventListener('resize',()=>{if(CM.open)cmLayout()});if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(CM.open)cmLayout()})}
// volume : sur iPhone le volume d'une vidéo n'est pas réglable par le code → on passe par un mixeur Web Audio (créé au toucher « Lancer »)
function cmVol(){const S=ST(),v=S.vol==null?1:S.vol,m=!!S.mute,V=CM.v;if(CM.gain){CM.gain.gain.value=m?0:v;V.muted=false}else{V.volume=v;V.muted=m}
 const b=CM.el.querySelector('#cmMute');b.textContent=m||v==0?'🔇':v<.5?'🔉':'🔊';CM.el.querySelector('#cmVol').value=v}
function cmAudio(){if(CM.audio||!IOS)return;try{const A=window.AudioContext||window.webkitAudioContext;CM.audio=new A();const src=CM.audio.createMediaElementSource(CM.v);CM.gain=CM.audio.createGain();src.connect(CM.gain);CM.gain.connect(CM.audio.destination)}catch(e){CM.audio=null;CM.gain=null}}
function cmShow(F,auto){cmBuild();const e=CM.el,V=CM.v,$=id=>e.querySelector('#'+id);CM.F=F;CM.open=true;CM.state='start';CM.lights=0;CM.ri=0;CM.react=null;
 $('cmTitle').textContent=F.t;$('cmSTitle').textContent=F.t;$('cmSInfo').textContent=F.g+' · salle '+F.s+(F.dur?' · '+Math.round(F.dur/60)+' min':'');$('cmStart').hidden=false;$('cmEnd').hidden=true;$('cmWait').hidden=true;$('cmUi').classList.remove('on');$('cmSub').textContent='';
 $('cmRot').hidden=!(innerHeight>innerWidth);V.poster=F.poster;if(V.getAttribute('src')!==F.src){V.src=F.src;V.load()}V.currentTime=0;cmVol();cmPrep();e.hidden=false;e.classList.remove('on');cmLayout();
 requestAnimationFrame(()=>e.classList.add('on'));cancelAnimationFrame(CM.raf);CM.raf=requestAnimationFrame(cmLoop);ciUI();if(auto)cmPlay(true)}
function cmPlay(auto){const e=CM.el,V=CM.v;cmAudio();if(CM.audio&&CM.audio.state!='running')CM.audio.resume().catch(()=>{});cmVol();e.querySelector('#cmStart').hidden=true;e.querySelector('#cmWait').hidden=false;CM.state='play';CM.hideT=performance.now();
 const p=V.play();if(p&&p.catch)p.catch(err=>{e.querySelector('#cmWait').hidden=true;e.querySelector('#cmStart').hidden=false;CM.state='start';e.querySelector('#cmSInfo').textContent=auto?CM.F.g+' · salle '+CM.F.s+' · touche pour démarrer':'Touche « Lancer la séance » pour démarrer le film.'})}
function cmPoke(){CM.hideT=performance.now();CM.el.querySelector('#cmUi').classList.add('on')}
function cmEnd(){if(!CM.open||CM.state=='end')return;CM.state='end';const e=CM.el;e.querySelector('#cmUi').classList.remove('on');e.querySelector('#cmSub').textContent='';
 e.querySelector('#cmETxt').textContent='« '+CM.F.t+' » · Les lumières se rallument…';setTimeout(()=>{if(CM.state=='end')e.querySelector('#cmEnd').hidden=false},1200);CM.endT=setTimeout(()=>{if(CM.state=='end')cmClose(true)},7000)}
function cmClose(done){if(!CM.open)return;clearTimeout(CM.endT);const e=CM.el,V=CM.v;try{V.pause()}catch(_){}e.classList.remove('on');CM.state='off';
 setTimeout(()=>{e.hidden=true;CM.open=false;cancelAnimationFrame(CM.raf);try{V.removeAttribute('src');V.load()}catch(_){}},450);
 const film=CI.film,direct=!!CI.direct;stopFilm(!!done);if(direct)exitSalle();if(!done&&film)say(direct?'Séance interrompue. Ton billet reste valable : repasse la porte de la salle pour relancer le film.':'Séance interrompue. Ton billet reste valable : touche « Regarder » pour relancer le film.');ciUI()}
// mise en page : le film le plus grand possible, la salle et Nori dessous
function cmLayout(){const W=innerWidth,H=(window.visualViewport?visualViewport.height:innerHeight),port=H>W;let fw,fh,fx,fy;
 if(port){fw=W;fh=Math.round(W*9/16);fx=0;fy=Math.round(H*.24)}else{fh=Math.round(H*.81);fw=Math.min(W,Math.round(fh*16/9));fh=Math.round(fw*9/16);fx=Math.round((W-fw)/2);fy=Math.round(H*.025)}
 Object.assign(CM.v.style,{left:fx+'px',top:fy+'px',width:fw+'px',height:fh+'px'});CM.film={fx,fy,fw,fh,W,H,port};
 const sc=port?W/160:H/180,lw=port?160:Math.max(160,Math.round(W/sc)),lh=port?Math.round(H/sc):180;CM.cv.width=lw;CM.cv.height=lh;CM.sc=sc;const sub=CM.el.querySelector('#cmSub');Object.assign(sub.style,{left:fx+'px',width:fw+'px',top:(fy+fh-Math.max(34,fh*.2))+'px'})}
// images des personnages (préparées une fois : Nori avec sa tenue, quelques spectateurs)
function cropTop(img,hFrac){const c=document.createElement('canvas'),g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,CW,CH).data;let y0=CH,x0=CW,x1=0;
 for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(d[(y*CW+x)*4+3]>20){if(y<y0)y0=y;if(x<x0)x0=x;if(x>x1)x1=x}const h=Math.round((CH-y0)*hFrac),o=document.createElement('canvas');o.width=x1-x0+1;o.height=h;o.getContext('2d').drawImage(c,x0,y0,o.width,h,0,0,o.width,h);
 // contour éclairable : pixels opaques en bord de silhouette
 const od=o.getContext('2d').getImageData(0,0,o.width,o.height).data,edge=[];for(let y=0;y<o.height;y++)for(let x=0;x<o.width;x++){const a=i=>od[i*4+3]>20,i=y*o.width+x;if(!a(i))continue;if(y==0||x==0||x==o.width-1||!a(i-o.width)||!a(i-1)||!a(i+1))edge.push(x,y)}o.edge=edge;return o}
function cmPrep(){try{const L=N.look;if(drawFrame('dk0',L)){const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);CM.bust=cropTop(c,.68)}
  CM.heads=[0,1,2,3,4,5].map(i=>{if(!drawFrame('dk0',npcLook(i)))return null;const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);return cropTop(c,.42)}).filter(Boolean)}catch(e){console.error(e)}spKey=''}
function cmLight(){const V=CM.v;if(V.readyState<2)return;try{if(!CM.smp){CM.smp=document.createElement('canvas');CM.smp.width=8;CM.smp.height=4}const g=CM.smp.getContext('2d');g.drawImage(V,0,0,8,4);const d=g.getImageData(0,0,8,4).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2]}const n=d.length/4;
 const t=[r/n,gg/n,b/n];CM.light=CM.light.map((v,i)=>v+(t[i]-v)*.25);CM.lum=(CM.light[0]*.3+CM.light[1]*.59+CM.light[2]*.11)/255}catch(e){}}
// personnage éclairé : assombri par la salle, liseré coloré par la lumière du film
function litSprite(g,img,x,y,k,dark,lightCol,rim){if(!img)return;const w=img.width*k,h=img.height*k;g.imageSmoothingEnabled=false;
 if(!CM.tmp)CM.tmp=document.createElement('canvas');const T=CM.tmp;T.width=Math.ceil(w);T.height=Math.ceil(h);const t=T.getContext('2d');t.imageSmoothingEnabled=false;t.drawImage(img,0,0,w,h);
 t.globalCompositeOperation='source-atop';t.fillStyle='rgba(6,4,16,'+dark.toFixed(3)+')';t.fillRect(0,0,w,h);t.fillStyle=lightCol;const E=img.edge||[];for(let i=0;i<E.length;i+=2)t.fillRect(Math.floor(E[i]*k),Math.floor(E[i+1]*k),Math.ceil(k),Math.ceil(k)*(rim||1));t.globalCompositeOperation='source-over';
 g.drawImage(T,Math.round(x),Math.round(y))}
function seatBack(g,x,y,w,h,shade,lc){g.fillStyle=shade;g.fillRect(x+1,y,w-2,h);g.fillRect(x,y+2,w,h-2);g.fillStyle=lc;g.fillRect(x+2,y,w-4,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+w/2-1,y+3,2,h-3)}
function bubble(g,txt,cx,y){const w=axTW(txt,1)+8;g.fillStyle='#1a1420';g.fillRect(cx-w/2-1,y-1,w+2,13);g.fillStyle='#fff8ea';g.fillRect(cx-w/2,y,w,11);g.fillRect(cx-2,y+11,4,2);axText(g,txt,Math.round(cx-w/2+4),y+2,'#1a1420',1)}
function cmLoop(now){if(!CM.open)return;CM.raf=requestAnimationFrame(cmLoop);const V=CM.v,g=CM.cx,lw=CM.cv.width,LH=CM.cv.height,F=CM.film,sc=CM.sc,t=now/1000,dt=Math.min(.1,(now-(CM.last||now))/1000);CM.last=now;
 if((now|0)%3==0||!CM.lt||now-CM.lt>120){CM.lt=now;cmLight()}
 // lumières : éteintes pendant le film, se rallument à la fin
 const tgt=CM.state=='end'?1:CM.state=='start'?.35:.0;CM.lights+=(tgt-CM.lights)*Math.min(1,dt*(CM.state=='end'?.6:2));const Lg=CM.lights;
 const lc='rgb('+CM.light.map(v=>Math.round(Math.min(255,v*1.3+30))).join(',')+')',lumK=Math.min(1,.25+CM.lum*1.4);
 g.clearRect(0,0,lw,LH);g.imageSmoothingEnabled=false;const fx=F.fx/sc,fy=F.fy/sc,fw=F.fw/sc,fh=F.fh/sc;
 // salle autour de l'écran : murs sombres, rideaux rouges, faisceau du projecteur
 const room=(a)=>'rgba('+Math.round(lerpN(10,80,Lg))+','+Math.round(lerpN(8,40,Lg))+','+Math.round(lerpN(20,48,Lg))+','+a+')';
 g.fillStyle=room(1);g.fillRect(0,0,lw,LH);g.clearRect(Math.round(fx),Math.round(fy),Math.round(fw),Math.round(fh));
 g.fillStyle='rgba('+CM.light.map(v=>Math.round(v)).join(',')+','+(.12*lumK*(1-Lg)).toFixed(3)+')';g.fillRect(0,fy+fh,lw,LH-fy-fh);
 for(const sx2 of[.12,.38,.62,.88]){const y2=Math.round(fy*.45),x2=Math.round(lw*sx2);if(y2>10){g.fillStyle='rgba(255,190,110,'+(.05+.25*Lg)+')';g.fillRect(x2-6,y2-6,13,13);g.fillStyle=Lg>.3?'#ffe0a8':'#7a5a3a';g.fillRect(x2-2,y2-1,5,3);g.fillStyle='#d9a441';g.fillRect(x2-3,y2+2,7,1)}}
 const cw=Math.max(4,lw*.06);for(const sx of[fx-cw,fx+fw]){g.fillStyle='#5a0e1c';g.fillRect(sx,fy-4,cw,fh+8);for(let x=sx;x<sx+cw;x+=3){g.fillStyle=Lg>.3?'#8e1a2c':'#6a1222';g.fillRect(x,fy-4,1,fh+8)}}
 g.fillStyle='#6a1222';g.fillRect(fx-cw,fy-7,fw+2*cw,5);g.fillStyle='#d9a441';g.fillRect(fx-cw,fy-2,fw+2*cw,1);
 // rangées de spectateurs (de dos) entre Nori et l'écran
 const base=Math.round(fy+fh+(F.port?10:3)),reactNow=CM.react&&t-CM.react.t<1.6?CM.react:null,hw=(CM.heads[0]||{width:40}).width;
 const rows=(F.port?[[base,.36],[base+20,.46],[base+44,.6]]:[[base,.36],[base+13,.46]]).map(([ry,k])=>[ry,k,Math.ceil(lw/(hw*k*1.15))]);rows.forEach(([ry,k,n],ri)=>{const step=lw/n;for(let i=0;i<n;i++){const x=step*i+(ri?step/2:0)-step*.2,h=CM.heads[(i*2+ri*3)%Math.max(1,CM.heads.length)];if(!h)continue;
  if((i*7+ri*3)%5==2)continue;let dy=Math.round(Math.sin(t*.7+i*2+ri)*.6);if(reactNow&&(i+ri)%2==0)dy-=reactNow.k=='rire'?Math.abs(Math.sin((t-reactNow.t)*14))*2:reactNow.k=='surprise'?2:0;
  litSprite(g,h,x,ry-h.height*k+dy,k,.5-Lg*.3,lc);seatBack(g,Math.round(x-1),ry-Math.round(h.height*k*.25),Math.round(h.width*k+2),Math.round(10*k+4),Lg>.3?'#7e1828':'#3a0c16',lc)}});
 // Nori, de dos, dans son fauteuil (petits mouvements naturels et réactions)
 const B=CM.bust;if(B){const k=F.port?2:Math.max(1,Math.round(LH*.24/B.height)),bw=B.width*k,bh=B.height*k;let bx=lw/2-bw/2,by=LH-bh-(F.port?14:4);
  const sway=Math.sin(t*.35)*1.2,breathe=Math.sin(t*1.6)>.92?1:0;bx+=Math.round(sway);by+=breathe;let txt=null;
  if(reactNow){const e=t-reactNow.t;if(reactNow.k=='rire'){by-=Math.round(Math.abs(Math.sin(e*12))*3*k*.5);txt='HA HA !'}else if(reactNow.k=='surprise'){by-=Math.round((e<.3?e/.3:Math.max(0,1-(e-.3)/.6))*4*k*.6);txt='OH !'}else if(reactNow.k=='peur'){by+=Math.round(Math.min(1,e*4)*3*k*.5);txt='!'}else if(reactNow.k=='emotion'){bx+=Math.round(Math.sin(e*2)*k);txt='SNIF…'}}
  litSprite(g,B,bx,by,k,.38-Lg*.3,lc,1);
  // fauteuil de Nori et voisins (dossiers au premier plan), pop-corn sur l'accoudoir
  const sy=Math.round(by+bh*.74),sw=Math.round(bw*1.2);seatBack(g,Math.round(lw/2-sw/2),sy,sw,LH-sy,Lg>.3?'#9a2236':'#4a0e1a',lc);seatBack(g,Math.round(lw/2-sw/2-sw-4),sy+4,sw,LH-sy,Lg>.3?'#8e1a2c':'#3a0c16',lc);seatBack(g,Math.round(lw/2+sw/2+4),sy+4,sw,LH-sy,Lg>.3?'#8e1a2c':'#3a0c16',lc);
  if(CI.pop0){const px2=Math.round(lw/2+sw/2+1),py2=sy-6;g.fillStyle='#c8202e';g.fillRect(px2,py2,6,8);g.fillStyle='#ffffff';g.fillRect(px2+2,py2,1,8);g.fillStyle='#f5d76e';g.fillRect(px2,py2-2,6,3);
   const ph=(t%9)/9;if(ph<.12&&CM.state=='play'){g.fillStyle='#fff3c4';g.fillRect(Math.round(lerpN(px2+2,lw/2,ph/.12)),Math.round(lerpN(py2-3,by+bh*.35,ph/.12)),2,2)}}
  if(txt&&CM.state=='play'){const bwid=axTW(txt,1)+8;bubble(g,txt,Math.round(Math.max(bwid/2+2,bx-bwid/2-3)),Math.round(by+bh*.25))}}
 // progression, sous-titres, réactions
 if(V.duration){const cur=V.currentTime,d=V.duration;CM.el.querySelector('#cmFill').style.width=(cur/d*100).toFixed(2)+'%';const tm=fmtT(cur)+' / '+fmtT(d);const te=CM.el.querySelector('#cmTime');if(te.textContent!==tm)te.textContent=tm;
  const sub=(CM.F.subs||[]).find(s=>cur>=s.a&&cur<=s.b),st=sub?sub.txt:'';const se=CM.el.querySelector('#cmSub');if(se.textContent!==st)se.textContent=st;
  const R=CM.F.reactions||[];while(CM.ri<R.length&&R[CM.ri].t<=cur){if(cur-R[CM.ri].t<1.2)CM.react={k:R[CM.ri].k,t};CM.ri++}if(CM.ri>0&&R[CM.ri-1]&&cur<R[CM.ri-1].t-1)CM.ri=0}
 if(CM.state=='play'&&performance.now()-CM.hideT>3200)CM.el.querySelector('#cmUi').classList.remove('on')}
const lerpN=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
CM.show=cmShow;CM.play=cmPlay;CM.close=cmClose;CM.end=cmEnd;CM.layout=cmLayout;
window.CINE={FILMS,SNACKS,ROOMS,CI,ST,ciUI,goDoor,goMainDoor,enterRoom,backRoom,buyTicket,buySnack,sitIn,freeSeat,standUpCine,startFilm,stopFilm,CM,useWC,washHands,enterSalle,exitSalle,npcPrep,npcImg,npcLook,NPCL,washStop,WASH,BASINS,basinFree,leave,setRoom,isCine};
})();
