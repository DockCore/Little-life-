// ===== RUE 2D EXPLORABLE (StreetScene) =====
// Scène latérale : le personnage du jeu (sprite + garde-robe, via sc2) marche librement sur le trottoir.
// Tout est piloté par des données : ajouter un bâtiment = ajouter une entrée dans STREETS.centre.buildings
// (et, si besoin, une façade dans FACADES). La longueur de la rue et la position du chantier sont recalculées.
const ST_H=260,ST_BASE=196,ST_WALK=216,ST_ROAD=230,ST_OL='#241a26';
// --- registre des rues (prévu pour plusieurs rues / quartiers) ---
const STREETS={
 centre:{id:'centre',nom:'la rue commerçante',start:44,gap:34,
  buildings:[
   {id:'maison',name:'Résidence',type:'home',facade:'residence',w:150,h:176,door:{x:75,w:34},go:{place:'home'},available:true},
   {id:'bowling',le:'Le bowling',name:'Bowling',type:'leisure',facade:'bowling',w:214,h:176,door:{x:150,w:44},game:'bowling',available:true},
   {id:'arcade',le:'La salle d’arcade',name:'Salle d’arcade',type:'leisure',facade:'arcade',w:164,h:168,door:{x:118,w:36},game:'arcade',available:true},
   {id:'cinema',le:'Le cinéma',name:'Cinéma',type:'leisure',facade:'cinema',w:204,h:190,door:{x:102,w:46},go:{place:'cine_hall'},available:true},
   {id:'sport',name:'Salle de sport',type:'sport',facade:'gym',w:204,h:160,door:{x:160,w:40},go:{place:'gym'},available:true},
   {id:'resto',le:'Le restaurant',name:'Restaurant',type:'food',facade:'restaurant',w:176,h:150,door:{x:136,w:34},scene:'RestaurantScene',available:false},
   {id:'mode',name:'Boutique de vêtements',type:'shop',facade:'boutique',w:176,h:166,door:{x:132,w:36},go:{place:'clothes'},available:true}
  ]}
};
let STC=STREETS.centre;
// Mise en page automatique : positions, longueur de la rue, chantier toujours après le dernier bâtiment.
function stLayout(S){let x=S.start;S.buildings.forEach(b=>{if(typeof b.fixX=='number')x=Math.max(x,b.fixX);b.x=x;x+=b.w+S.gap});
 const last=S.buildings[S.buildings.length-1];S.workX=last.x+last.w+S.gap+10;S.minX=24;S.maxX=S.workX-14;S.len=S.workX+300;
 // décor urbain réparti automatiquement dans les espaces entre bâtiments
 const kinds=[['lamp','bench'],['lamp','tree','bin'],['lamp','sign','hydrant'],['lamp','tree','bin'],['lamp','bench','bike']];S.props=[];
 S.buildings.forEach((b,i)=>{const gx=b.x+b.w,set=kinds[i%kinds.length];S.props.push({k:set[0],x:gx+S.gap/2});
  if(set[1])S.props.push({k:set[1],x:b.x+(set[1]=='bench'?b.door.x+(b.door.x>b.w/2?-58:40):(b.door.x>b.w/2?18:b.w-30))});
  if(set[2])S.props.push({k:set[2],x:b.x+(b.door.x>b.w/2?b.door.x-b.door.w/2-16:b.door.x+b.door.w/2+10)})});
 S.props.push({k:'lamp',x:S.start-20});
 S.solids=[{x0:S.workX,x1:S.workX+40}];return S}
// --- police pixel 5x7 pour les enseignes ---
const STF={A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',C:'01110100011000010000100001000101110',D:'11110100011000110001100011000111110',
E:'11111100001000011110100001000011111',F:'11111100001000011110100001000010000',G:'01110100011000010111100011000101111',H:'10001100011000111111100011000110001',
I:'01110001000010000100001000010001110',J:'00111000100001000010000101001001100',K:'10001100101010011000101001001010001',L:'10000100001000010000100001000011111',
M:'10001110111010110101100011000110001',N:'10001100011100110101100111000110001',O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',
R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',U:'10001100011000110001100011000101110',
V:'10001100011000110001100010101000100',W:'10001100011000110101101011010101010',X:'10001100010101000100010101000110001',Y:'10001100010101000100001000010000100',
Z:'11111000010001000100010001000011111','É':'00010111111000011110100001000011111',' ':'00000000000000000000000000000000000','!':'00100001000010000100001000000000100',
'’':'00100001000100000000000000000000000','.':'00000000000000000000000000000000100',':':'00000001000000000000001000000000000','-':'00000000000000001110000000000000000','&':'01100100101010001000101011001001101',
'Q':'01110100011000110001101011001001101','Ô':'00100010100111010001100011000101110','Ê':'00100010101111110000111101000011111','È':'01000001001111110000111101000011111','À':'01000001000111010001111111000110001','Ç':'01110100011000010001011100010001100','Û':'00100010101000110001100011000101110','Î':'00100010100111000100001000010001110','0':'01110100011001110101110011000101110','1':'00100011000010000100001000010001110','2':'01110100010000100010001000100011111','3':'11110000010000101110000010000111110',
'4':'00010001100101010010111110001000010','5':'11111100001111000001000011000101110','6':'00110010001000011110100011000101110','7':'11111000010001000100010000100001000',
'8':'01110100011000101110100011000101110','9':'01110100011000101111000010001001100'};
function stTextW(s,sc=1){return s.length*6*sc-sc}
// --- peintre : chaque façade est dessinée deux fois (base, puis éléments lumineux pour la nuit) ---
function stPainter(x,lum){
 const r=(X,Y,W,H,c)=>{if(lum)return;x.fillStyle=c;x.fillRect(X,Y,W,H)};
 const e=(X,Y,W,H,d,n)=>{x.fillStyle=lum?n:d;x.fillRect(X,Y,W,H)};
 const txt=(s,X,Y,c,sc=1,cn)=>{let k=0;for(const ch of s.toUpperCase()){const g=STF[ch]||STF[' '];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(g[j*5+i]=='1'){if(cn)e(X+(k+i)*sc,Y+j*sc,sc,sc,c,cn);else r(X+(k+i)*sc,Y+j*sc,sc,sc,c)}k+=6}};
 const box=(X,Y,W,H,c,o=ST_OL)=>{r(X,Y,W,H,o);r(X+1,Y+1,W-2,H-2,c)};
 const bricks=(X,Y,W,H,c,m)=>{r(X,Y,W,H,c);for(let j=0;j<H;j+=4){r(X,Y+j,W,1,m);for(let i=(j/4)%2?0:4;i<W;i+=8)r(X+i,Y+j,1,4,m)}};
 const win=(X,Y,W,H,fr,day,night,cur)=>{box(X,Y,W,H,fr);e(X+2,Y+2,W-4,H-4,day,night);r(X+2,Y+2,W-4,1,'rgba(255,255,255,.35)');if(!lum){x.fillStyle='rgba(255,255,255,.28)';x.fillRect(X+3,Y+4,2,H-8)}
  if(cur){r(X+2,Y+2,3,H-4,cur);r(X+W-5,Y+2,3,H-4,cur)}r(X+W/2|0,Y+2,1,H-4,fr);r(X+1,Y+H,W-2,2,'rgba(0,0,0,.25)')};
 const stripes=(X,Y,W,H,a,b,s=6)=>{for(let i=0;i<W;i+=s)r(X+i,Y,Math.min(s/2,W-i),H,a),r(X+i+s/2,Y,Math.min(s/2,Math.max(0,W-i-s/2)),H,b)};
 const bulbs=(X,Y,W,H,s=4)=>{for(let i=0;i<W;i+=s){e(X+i,Y,2,2,'#f7e7a0','#fff6c8');e(X+i,Y+H-2,2,2,'#f7e7a0','#fff6c8')}for(let j=s;j<H-2;j+=s){e(X,Y+j,2,2,'#f7e7a0','#fff6c8');e(X+W-2,Y+j,2,2,'#f7e7a0','#fff6c8')}};
 return{x,lum,r,e,txt,box,bricks,win,stripes,bulbs}}
// --- façades : une identité visuelle propre par bâtiment ---
const FACADES={
 residence(P,b){const{w,h}=b,{r,e,txt,box,bricks,win}=P,top=8;
  r(0,top,w,h-top,ST_OL);bricks(1,top+1,w-2,h-top-1,'#a5523b','#8a4130');r(0,top,w,6,'#e3d1b2');r(0,top+6,w,2,'#b9a585');r(0,top-2,w,2,ST_OL);
  [[16,24],[64,24],[112,24],[16,70],[112,70]].forEach(([X,Y],i)=>{win(X,top+Y,22,28,'#f4efe6','#a8d3ea',i%2?'#ffd98a':'#ffc56b','#e86a5a');r(X-2,top+Y+28,26,4,'#5e8a4a');[2,8,14,20].forEach(k=>r(X+k,top+Y+26,3,3,['#e85d75','#ffd166','#f4a6c0','#ffffff'][k%4]))});
  
  const dx=b.door.x-17,dy=h-86;box(dx-4,dy-6,42,92,'#e3d1b2');box(dx,dy,34,86,'#2f5d4a');r(dx+4,dy+6,26,30,'#24493a');e(dx+7,dy+9,20,24,'#9cc9e0','#ffd27a');r(dx+16,dy+9,1,24,'#24493a');r(dx+26,dy+48,3,6,'#e9c46a');
  r(dx-6,dy-14,46,8,'#7a3a2a');r(dx-6,dy-14,46,2,'#9a4a36');txt('12',dx+11,dy-12+1,'#f4efe6');
  r(dx+44,h-40,12,14,'#3b5bb5');r(dx+45,h-39,10,3,'#2a4590');r(dx+49,h-26,2,26,'#555');r(dx-8,h-4,50,4,'#c9bca8')},
 bowling(P,b){const{w,h}=b,{r,e,txt,box,bulbs}=P,top=46;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#f3e6c9');r(1,top+1,w-2,22,'#2fb3a6');r(1,top+23,w-2,3,'#1e8077');for(let i=4;i<w;i+=10)r(i,top+28,4,3,'#e2cfa6');
  // grande quille sur le toit
  const qx=w-46;box(qx+6,4,22,top-2,'#ffffff');r(qx+7,5,20,6,'#ffffff');r(qx+8,top-26,18,4,'#e63946');r(qx+8,top-20,18,3,'#e63946');r(qx+11,6,12,8,'#fbfbfb');r(qx+6,top-34,2,10,'#dcdcdc');
  // boule
  [[10,0],[6,1],[4,2],[2,3],[2,4],[1,5],[1,6],[0,7]].forEach(([i,j])=>{const W2=32-2*i;r(14+i,12+j,W2,1,ST_OL);r(14+i,43-j,W2,1,ST_OL);if(j>0){r(15+i,12+j,W2-2,1,'#3a3f9a');r(15+i,43-j,W2-2,1,'#3a3f9a')}});r(14,20,32,16,ST_OL);r(15,20,30,16,'#3a3f9a');r(24,19,4,4,'#151845');r(31,19,4,4,'#151845');r(27,26,4,4,'#151845');r(20,15,6,2,'#6b72d6');r(18,17,3,3,'#6b72d6');
  // enseigne néon
  box(50,8,112,30,'#1b2a3a');bulbs(52,10,108,26);txt('BOWLING',57,15,'#ff6b8b',2,'#ff9fb5');
  // vitrine : pistes vues de l’intérieur
  const vx=14,vy=top+40,vw=104,vh=56;box(vx,vy,vw,vh,'#c79a5a','#b8c4cc');r(vx+2,vy+2,vw-4,vh-4,'#2a2238');e(vx+2,vy+2,vw-4,18,'#3a3050','#6a4b8a');
  for(let i=0;i<4;i++){const lx=vx+6+i*25;r(lx,vy+24,20,vh-26,'#c79a5a');r(lx+9,vy+24,2,vh-26,'#a97d43');[0,6,12].forEach(k=>e(lx+3+k,vy+22,3,5,'#ffffff','#ffffff'))}
  r(vx+vw/2|0,vy,2,vh,'#b8c4cc');
  // portes vitrées
  const dx=b.door.x-22,dy=h-86;box(dx-3,dy-3,50,89,'#b8c4cc');box(dx,dy,22,86,'#cfe8ec');box(dx+22,dy,22,86,'#cfe8ec');e(dx+2,dy+2,18,82,'#9fd4dc','#ffd69a');e(dx+24,dy+2,18,82,'#9fd4dc','#ffd69a');r(dx+18,dy+40,2,10,'#6a6a6a');r(dx+24,dy+40,2,10,'#6a6a6a');
  r(dx-2,dy-12,48,8,'#e63946');txt('OPEN',dx+11,dy-11,'#fff',1,'#fffbe0');
  // étoiles néon
  [[176,64],[188,78],[166,86]].forEach(([X,Y])=>{e(X,Y-3,1,7,'#ffd166','#ffe9a6');e(X-3,Y,7,1,'#ffd166','#ffe9a6')})},
 arcade(P,b){const{w,h}=b,{r,e,txt,box}=P,top=28;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#2c1f4f');for(let j=top+4;j<h;j+=8)for(let i=4;i<w;i+=8)r(i,j,2,2,'#3a2a66');
  // enseigne néon
  box(14,4,w-28,34,'#120a26','#ff4fa3');e(15,5,w-30,1,'#ff4fa3','#ff9bd0');e(15,36,w-30,1,'#ff4fa3','#ff9bd0');txt('ARCADE',(w-stTextW('ARCADE',3))/2|0,10,'#38e1ff',3,'#a6f3ff');
  // envahisseurs
  const inv=['0010000100','0001111000','0011011100','0111111110','0101111010','0100000010','0011001100'];
  [[16,52,'#7cff6b'],[w-36,52,'#ffe14f']].forEach(([X,Y,c])=>inv.forEach((row,j)=>[...row].forEach((v,i)=>{if(v=='1')e(X+i*2,Y+j*2,2,2,c,c)})));
  // vitrine avec bornes d’arcade
  const vx=12,vy=top+50,vw=72,vh=68;box(vx,vy,vw,vh,'#120a26','#38e1ff');r(vx+2,vy+2,vw-4,vh-4,'#1a1230');
  [['#ff4fa3',6],['#38e1ff',28],['#ffe14f',50]].forEach(([c,o])=>{const cx=vx+o;r(cx,vy+14,16,vh-16,'#3d2f6a');e(cx+2,vy+18,12,10,c,mx(c,'#ffffff',.4));r(cx+3,vy+32,10,3,'#241a40');r(cx+5,vy+31,2,2,'#ff3b3b');r(cx+10,vy+32,2,2,'#5bd16b');r(cx,vy+12,16,3,c)});
  // porte
  const dx=b.door.x-18,dy=h-86;box(dx-3,dy-3,42,89,'#120a26','#ff4fa3');box(dx,dy,36,86,'#3d2f6a');e(dx+4,dy+4,28,40,'#1a1230','#5a2a8a');r(dx+29,dy+46,3,8,'#ff4fa3');
  e(dx+2,dy-12,32,6,'#ff4fa3','#ff9bd0');txt('PLAY',dx+7,dy-23,'#ffe14f',1,'#fff3a6')},
 cinema(P,b){const{w,h}=b,{r,e,txt,box,bulbs}=P,top=34;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#ead6a6');for(let i=8;i<w;i+=16)r(i,top+1,3,h-top-1,'#dcc38a');
  // couronne art déco
  [[w/2-30,top-14,60,16],[w/2-18,top-26,36,14],[w/2-6,top-34,12,10]].forEach(([X,Y,W,H])=>{box(X|0,Y,W,H+2,'#d9b45a')});r(w/2-1|0,2,2,10,'#d9b45a');
  // enseigne verticale
  box(14,top+6,22,92,'#c0392b');bulbs(16,top+8,18,88,5);['C','I','N','É'].forEach((c,i)=>txt(c,20,top+16+i*19,'#fff4c8',2-0.5|0||1,'#fffbe6'));
  // marquise lumineuse
  const mx0=44,my0=top+40;box(mx0,my0,w-60,34,'#2b1a12');bulbs(mx0+2,my0+2,w-64,30,4);txt('CINÉMA',mx0+(w-60-stTextW('CINÉMA',2))/2|0,my0+6,'#ffd166',2,'#ffe7a0');r(mx0,my0+34,w-60,4,'#c0392b');
  txt('À L’AFFICHE',mx0+(w-60-stTextW('À L’AFFICHE'))/2|0,my0+24,'#ffffff',1,'#ffffff');
  // affiches
  [[50,'#2d6cdf','#ffd166'],[w-46,'#8e44ad','#2ee6a6']].forEach(([X,c1,c2],k)=>{box(X-2,h-84,30,44,'#d9b45a');r(X,h-82,26,40,c1);r(X+6,h-74,14,14,c2);r(X+3,h-56,20,2,'#fff');r(X+5,h-52,16,2,'#fff');if(k)r(X+9,h-70,8,8,c1)});
  // portes rouges
  const dx=b.door.x-23,dy=h-86;box(dx-4,dy-4,54,90,'#d9b45a');box(dx,dy,23,86,'#b3262b');box(dx+23,dy,23,86,'#b3262b');e(dx+5,dy+8,13,20,'#7a1f24','#ffb070');e(dx+28,dy+8,13,20,'#7a1f24','#ffb070');r(dx+19,dy+44,2,10,'#d9b45a');r(dx+25,dy+44,2,10,'#d9b45a');
  // guichet
  box(w-82,h-40,26,30,'#d9b45a');e(w-79,h-37,20,12,'#9fd4dc','#ffd27a');txt('TICKETS',w-81+1,h-22,'#7a1f24');},
 gym(P,b){const{w,h}=b,{r,e,txt,box,stripes}=P,top=22;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#8f99a6');for(let j=top+10;j<h;j+=14)r(1,j,w-2,1,'#7d8794');for(let i=0;i<w;i+=40)r(i,top,4,h-top,'#4a525e');
  // enseigne industrielle
  box(10,2,120,30,'#1f2228');r(12,4,116,26,'#ffd60a');r(12,4,116,3,'#ffe766');txt('GYM',20,9,'#1f2228',3);
  // haltère
  r(76,15,30,4,'#1f2228');r(72,9,6,16,'#1f2228');r(104,9,6,16,'#1f2228');r(68,12,4,10,'#1f2228');r(110,12,4,10,'#1f2228');
  txt('SALLE DE SPORT',12,top+16,'#f4f4f4');
  // grandes baies : appareils
  const vx=10,vy=top+34,vw=124,vh=60;box(vx,vy,vw,vh,'#4a525e');e(vx+2,vy+2,vw-4,vh-4,'#bfe0ea','#ffe7b0');for(let i=1;i<4;i++)r(vx+i*31,vy,2,vh,'#4a525e');
  [[vx+6,'tapis'],[vx+38,'velo'],[vx+70,'banc'],[vx+100,'rack']].forEach(([X,k])=>{const Y=vy+vh-6,c='#3a4250';if(k=='tapis'){r(X,Y-3,22,3,c);r(X+18,Y-22,3,20,c);r(X+14,Y-24,8,3,c)}if(k=='velo'){r(X+4,Y-10,14,3,c);r(X+8,Y-18,3,9,c);r(X+3,Y-20,8,2,c);r(X+15,Y-14,3,5,c);r(X+2,Y-3,20,3,c)}
   if(k=='banc'){r(X,Y-8,22,3,c);r(X+2,Y-6,2,6,c);r(X+18,Y-6,2,6,c);r(X+8,Y-24,2,18,c);r(X+2,Y-24,16,2,c);r(X,Y-27,4,8,c);r(X+16,Y-27,4,8,c)}if(k=='rack'){r(X,Y-30,2,30,c);r(X+18,Y-30,2,30,c);[8,16,24].forEach(z=>{r(X,Y-z,20,2,c);r(X+3,Y-z-3,3,4,'#c0392b');r(X+13,Y-z-3,3,4,'#2d6cdf')})}});
  // porte vitrée + bandes de sécurité
  const dx=b.door.x-20,dy=h-86;box(dx-3,dy-3,46,89,'#4a525e');box(dx,dy,40,86,'#cfe8ec');e(dx+2,dy+2,36,82,'#a9d6e0','#ffe0a0');r(dx+19,dy,2,86,'#4a525e');r(dx+15,dy+40,2,12,'#222');r(dx+23,dy+40,2,12,'#222');
  stripes(1,h-8,w-2,6,'#ffd60a','#1f2228',8)},
 restaurant(P,b){const{w,h}=b,{r,e,txt,box,bricks}=P,top=14;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#f4ead6');r(1,top+1,w-2,8,'#e2d2b2');bricks(1,h-34,w-2,33,'#b5674b','#9a5139');
  // enseigne
  box(16,top+14,w-32,22,'#1f4d3a');r(18,top+16,w-36,1,'#d4af37');r(18,top+33,w-36,1,'#d4af37');txt('RESTAURANT',(w-stTextW('RESTAURANT'))/2|0,top+21,'#f3d27a',1,'#ffe9a6');
  // lanternes
  [26,w-30].forEach(X=>{r(X+2,top+38,1,6,'#333');box(X,top+44,6,8,'#333');e(X+1,top+45,4,6,'#f5d76e','#fff0a8')});
  // auvent rayé festonné
  const ay=top+58,ax=10,aw=96;for(let i=0;i<aw;i+=8){r(ax+i,ay,4,14,'#d64545');r(ax+i+4,ay,4,14,'#fbf3e6')}for(let i=0;i<aw;i+=8){r(ax+i,ay+14,4,3,'#d64545');r(ax+i+4,ay+14,4,2,'#fbf3e6')}r(ax,ay-2,aw,2,'#9e2f2f');
  // vitrine chaleureuse
  const vx=14,vy=ay+20,vw=88,vh=h-34-vy-2;box(vx,vy,vw,vh,'#1f4d3a');e(vx+2,vy+2,vw-4,vh-4,'#e8c48a','#ffd27a');
  [vx+12,vx+50].forEach(X=>{r(X,vy+vh-12,24,3,'#7a4a2a');r(X+10,vy+vh-9,3,7,'#7a4a2a');r(X+6,vy+vh-16,3,4,'#c0392b');e(X+16,vy+vh-20,4,8,'#fff2c0','#ffffff')});
  r(vx+vw/2|0,vy,2,vh,'#1f4d3a');
  // porte en bois sous arche
  const dx=b.door.x-17,dy=h-86;box(dx-4,dy-8,42,94,'#b5674b');r(dx-2,dy-6,38,6,'#9a5139');box(dx,dy,34,86,'#6b3e26');r(dx+3,dy+4,28,78,'#7a4a2c');e(dx+8,dy+10,18,18,'#4a2a1a','#ffcf7a');r(dx+27,dy+44,3,6,'#d4af37');
  // ardoise menu
  box(w-34,h-46,22,30,'#2b2b2b');r(w-31,h-43,16,20,'#3c3c3c');[0,5,10].forEach(k=>r(w-29,h-40+k,12,1,'#e8e8e8'));r(w-33,h-16,2,14,'#6b3e26');r(w-15,h-16,2,14,'#6b3e26');
  // pots de fleurs
  [[vx-4,'#e85d75'],[vx+vw-6,'#ffd166']].forEach(([X,c])=>{r(X,h-12,10,10,'#b5674b');r(X+1,h-20,8,8,'#4f8a3a');r(X+3,h-21,3,3,c)})},
 boutique(P,b){const{w,h}=b,{r,e,txt,box,stripes}=P,top=10;
  r(0,top,w,h-top,ST_OL);r(1,top+1,w-2,h-top-1,'#f4c9d5');for(let i=6;i<w;i+=26)r(i,top+1,3,h-top-1,'#ffffff');r(0,top,w,8,'#ffffff');r(0,top+8,w,2,'#e7a9bb');
  // enseigne
  box(20,top+18,w-40,22,'#ffffff','#c97a93');txt('BOUTIQUE',(w-stTextW('BOUTIQUE'))/2|0,top+22,'#c0577a');txt('MODE',(w-stTextW('MODE'))/2|0,top+31,'#7a5c99');
  // enseigne drapeau t-shirt
  r(w-14,top+48,12,2,'#555');box(w-22,top+52,18,18,'#ffffff','#7a5c99');r(w-19,top+56,12,4,'#4ec9b0');r(w-17,top+60,8,7,'#4ec9b0');r(w-14,top+56,2,2,'#ffffff');
  // auvent menthe
  const ay=top+50,ax=8,aw=104;stripes(ax,ay,aw,12,'#7fd8c4','#ffffff',8);r(ax,ay+12,aw,2,'#5bb8a3');r(ax,ay-2,aw,2,'#5bb8a3');
  // vitrine avec mannequins
  const vx=12,vy=ay+18,vw=96,vh=h-vy-8;box(vx,vy,vw,vh,'#d4af37');e(vx+2,vy+2,vw-4,vh-4,'#fdf2f5','#fff0d6');
  const man=(X,top_,bot,acc)=>{r(X+5,vy+8,6,6,'#e6d3c3');r(X+7,vy+14,2,2,'#e6d3c3');r(X+1,vy+16,14,16,top_);r(X-1,vy+17,3,12,top_);r(X+13,vy+17,3,12,top_);r(X+2,vy+32,12,14,bot);r(X+3,vy+46,4,8,'#e6d3c3');r(X+9,vy+46,4,8,'#e6d3c3');r(X+7,vy+54,2,vh-56,'#8a8a8a');r(X+2,vy+vh-4,12,2,'#8a8a8a');if(acc)r(X+3,vy+18,10,2,acc)};
  man(vx+14,'#e85d75','#2d4c8a','#ffd166');man(vx+44,'#4ec9b0','#f5f5f5');man(vx+72,'#ffd166','#7a5c99','#e85d75');
  r(vx+2,vy+2,vw-4,2,'rgba(255,255,255,.6)');
  // porte vitrée dorée
  const dx=b.door.x-18,dy=h-86;box(dx-3,dy-3,42,89,'#d4af37');box(dx,dy,36,86,'#fdf2f5','#b98f2a');e(dx+3,dy+3,30,80,'#f7dfe7','#ffe9c0');r(dx+28,dy+40,2,14,'#b98f2a');txt('OUVERT',dx+1,dy+14,'#c0577a')}
};
const STFC=new Map();
function stFacade(b,lvl){const k=b.id+'|'+lvl;let c=STFC.get(k);if(c)return c;
 const base=STFC.get(b.id+'|base')||(()=>{const cv=document.createElement('canvas');cv.width=b.w;cv.height=b.h;const x=cv.getContext('2d');FACADES[b.facade](stPainter(x,false),b);STFC.set(b.id+'|base',cv);return cv})();
 if(lvl=='lum'){const cv=document.createElement('canvas');cv.width=b.w;cv.height=b.h;FACADES[b.facade](stPainter(cv.getContext('2d'),true),b);STFC.set(k,cv);return cv}
 const cv=document.createElement('canvas');cv.width=b.w;cv.height=b.h;const x=cv.getContext('2d');x.drawImage(base,0,0);if(lvl>0){x.globalCompositeOperation='source-atop';x.fillStyle=`rgba(14,20,48,${lvl/8*.62})`;x.fillRect(0,0,b.w,b.h)}STFC.set(k,cv);return cv}
// --- état de la scène ---
const STV={on:false,cv:null,x:null,W:320,H:ST_H,oy:0,cam:0,px:0,mv:false,keys:{},auto:null,near:null,cars:[],carT:120,fade:0,modal:false,lastSave:0,touch:{l:0,r:0}};
// largeur logique bornée (300 à 520 px) ; en écran haut (portrait), le ciel s’agrandit au-dessus de la rue
function stFit(){const box=document.getElementById('street');if(!box||!STV.cv)return;const w=box.clientWidth||320,h=box.clientHeight||240;STV.W=Math.max(300,Math.min(520,Math.round(ST_H*w/h)));STV.H=Math.max(ST_H,Math.round(STV.W*h/w));if(STV.cv.width!=STV.W||STV.cv.height!=STV.H){STV.cv.width=STV.W;STV.cv.height=STV.H}STV.oy=STV.H-ST_H;STV.x.imageSmoothingEnabled=false}
function streetEnter(x){stLayout(STC);STV.on=true;N.street=N.street||{};const home=STC.buildings.find(b=>b.id=='maison');
 STV.px=Math.max(STC.minX,Math.min(STC.maxX,typeof x=='number'?x:stDoorX(home)));N.street.on=1;
 place='street';setRN(20);C.st='street';C.d=N.street.d||1;C.alpha=null;C.path=null;tripOn=false;doorT=0;doorA=0;
 const tp=document.getElementById('trip');tp.classList.remove('on');const so=document.getElementById('street');so.hidden=false;void so.offsetWidth;so.classList.add('on');
 stFit();STV.cam=Math.max(0,Math.min(STC.len-STV.W,STV.px-STV.W*.42));STV.auto=null;show('street');stPanel(true);
 say(NAME()+' se promène dans '+STC.nom+'.');save()}
function streetLeave(){STV.on=false;STV.keys={};STV.touch={l:0,r:0};STV.auto=null;N.street={x:Math.round(STV.px),d:C.d,on:0};const so=document.getElementById('street');so.classList.remove('on');setTimeout(()=>{if(!STV.on)so.hidden=true},380);stModal(null);save()}
function stDoorX(b){return b.x+b.door.x}
function stNearB(){const p=STV.px;return STC.buildings.find(b=>Math.abs(p-stDoorX(b))<=b.door.w/2+10)||null}
function stNearWork(){return STV.px>=STC.workX-46}
function stEnterB(b){if(!b)return;
 // mini-jeu autonome : lancement immédiat, sans déplacement ni animation d'entrée ; retour exactement au même endroit
 if(b.game&&b.available&&window.GAMES&&GAMES[b.game]){const x=STV.px,d=C.d;streetLeave();C.viaStreet=null;GAMES[b.game].open({x,d});return}
if(!b.available){stModal(b.name,(b.le||b.name)+' ouvrira bientôt ses portes.','Son intérieur est en préparation. Reviens bientôt !');return}
 const pl=b.go&&b.go.place;if(!pl)return;STV.px=stDoorX(b);C.d=1;say(NAME()+' entre : '+b.name+'.');streetLeave();C.viaStreet=pl=='home'?null:b.id;
 setTimeout(()=>{arrive(pl)},360)}
function stInteract(){if(STV.modal){stModal(null);return}if(stNearWork()){stWorkSign();return}const b=stNearB();if(b)stEnterB(b)}
function stWorkSign(){stModal('QUARTIER EN CONSTRUCTION 🚧','De nouveaux commerces et lieux de loisirs sont en préparation.','Reviens bientôt découvrir la suite de la ville !')}
function stModal(t,a,b2){const m=document.getElementById('stModal');if(!m)return;if(!t){m.hidden=true;STV.modal=false;return}
 document.getElementById('stMT').textContent=t;document.getElementById('stMA').textContent=a||'';document.getElementById('stMB').textContent=b2||'';m.hidden=false;STV.modal=true;STV.keys={};STV.touch={l:0,r:0};STV.auto=null}
function stPanel(force){const b=stNearB(),w=stNearWork(),k=(b?b.id:'')+(w?'w':'');if(!force&&k===STV.panelK)return;STV.panelK=k;STV.near=b;
 const wh=document.getElementById('stWhere'),en=document.getElementById('stEnter');if(!wh)return;
 if(b){wh.textContent=b.name;en.hidden=false;en.textContent=b.available?(b.id=='maison'?'Rentrer':b.game?'Jouer':'Entrer'):'Fermé · Bientôt';en.classList.toggle('soon',!b.available)}
 else if(w){wh.textContent='Chantier';en.hidden=false;en.textContent='Lire le panneau';en.classList.remove('soon')}
 else{wh.textContent='La rue commerçante';en.hidden=true}
 const ib=document.getElementById('stAct');if(ib){ib.hidden=!(b||w);ib.textContent=b?(b.available?(b.id=='maison'?'Rentrer':'Entrer'):'Bientôt'):'Lire'}}
// --- logique ---
function stTick(){if(!STV.on)return;const K=STV.keys,left=K.ArrowLeft||K.KeyA||K.KeyQ||STV.touch.l,right=K.ArrowRight||K.KeyD||STV.touch.r;let dir=0;
 if(left&&!right)dir=-1;else if(right&&!left)dir=1;if(dir)STV.auto=null;
 if(!dir&&STV.auto!=null){const d=STV.auto.x-STV.px;if(Math.abs(d)<=1.2){STV.px=STV.auto.x;const f=STV.auto.then;STV.auto=null;if(f)f()}else dir=d>0?1:-1}
 if(STV.modal)dir=0;STV.mv=!!dir;
 if(dir){C.d=dir;let nx=STV.px+dir*2.3;nx=Math.max(STC.minX,Math.min(STC.maxX,nx));STC.solids.forEach(s=>{if(dir>0&&STV.px<=s.x0-14&&nx>s.x0-14)nx=s.x0-14;if(dir<0&&STV.px>=s.x1+14&&nx<s.x1+14)nx=s.x1+14});STV.px=nx}
 const tgt=STV.px-STV.W*(.5-.1*C.d);STV.cam+=(tgt-STV.cam)*.12;STV.cam=Math.max(0,Math.min(STC.len-STV.W,STV.cam));
 // une voiture toutes les 1 à 3 secondes environ, sur l'une des deux voies (pas de chevauchement dans une voie)
 if(--STV.carT<=0){STV.carT=60+Math.random()*130;const lane=Math.random()<.5?0:1,d=lane?1:-1,kinds=['berline','berline','citadine','citadine','taxi','fourgon'],k=kinds[Math.random()*kinds.length|0],
   sp=ST_CARS[k],sc=lane?1:.84,len=sp.L*sc,x=d>0?STV.cam-len-30:STV.cam+STV.W+30,cols=['#e63946','#2d6cdf','#f4f4f4','#4ec9b0','#7a5c99','#ff8a3d','#3a3f4a','#9fd36a'];
  if(!STV.cars.some(c=>c.lane==lane&&Math.abs(c.x-x)<len+60))STV.cars.push({x,d,lane,k,sc,len,v:(lane?5.2:4.4)+Math.random()*1.8,c:k=='taxi'?'#ffd23f':cols[Math.random()*cols.length|0],passed:false})}
 STV.cars.forEach(c=>{c.x+=c.d*c.v;const mid=c.x+c.len/2;if(!c.passed&&Math.abs(mid-STV.px)<c.v*1.5){c.passed=true;try{if(typeof JEUSON!='undefined')JEUSON.fx('carPass',c.lane?1:.7,.25)}catch(e){}}});
 STV.cars=STV.cars.filter(c=>c.x>STV.cam-c.len-80&&c.x<STV.cam+STV.W+80);
 if(STV.mv&&tick-STV.lastSave>300){STV.lastSave=tick;N.street={x:Math.round(STV.px),d:C.d,on:1};save()}
 stPanel()}
// --- rendu ---
function stSky(x,W){const[a,b]=skyCols(),n=night,c=v=>`rgb(${v.map(Math.round).join(',')})`;const gr=x.createLinearGradient(0,-STV.oy,0,ST_BASE);gr.addColorStop(0,c(a));gr.addColorStop(1,c(b));x.fillStyle=gr;x.fillRect(0,-STV.oy,W,ST_BASE+4+STV.oy);
 if(n>.45){x.fillStyle=`rgba(255,255,240,${Math.min(1,(n-.45)*2.2)})`;for(let i=0;i<60;i++){const sx=((i*97.3-STV.cam*.05)%W+W)%W,sy=(i*53.7)%120;x.fillRect(sx|0,(sy|0)-STV.oy*.6,1,1)}}
 const sunY=20+Math.round(n*150);if(n<.6){x.fillStyle='#fff3c4';x.fillRect(W-60,sunY,14,14);x.fillRect(W-62,sunY+2,18,10);x.fillRect(W-58,sunY-2,10,18)}else{x.fillStyle='#f4f1e0';x.fillRect(W-70,30,12,12);x.fillStyle=c(a);x.fillRect(W-66,28,10,10)}
 if(n<.7){x.fillStyle=n<.4?'rgba(255,255,255,.9)':'rgba(220,200,230,.6)';[[30,26],[150,14],[260,34],[380,22]].forEach(([cx,cy])=>{const X=Math.round(((cx-STV.cam*.08-tick*.04)%(W+120)+W+120)%(W+120)-60);x.fillRect(X,cy,26,5);x.fillRect(X+5,cy-3,14,3);x.fillRect(X+3,cy+5,20,2)})}}
function stSkyline(x,W){const n=night,col=mx('#9fb6cc','#1b2540',n),col2=mx('#b7cadb','#26324f',n),par=.3,L=x;
 for(let layer=0;layer<2;layer++){const p=layer?par:par*.6,cc=layer?col:col2,s0=Math.floor((STV.cam*p)/40)-1;for(let i=s0;i<s0+W/40+3;i++){const hgt=(layer?60:80)+((i*7919+layer*31)%5)*14,X=Math.round(i*40-STV.cam*p),Y=ST_BASE-hgt;L.fillStyle=cc;L.fillRect(X,Y,38,hgt);
  if(layer){L.fillStyle=n>.4?`rgba(255,214,120,${Math.min(.9,(n-.4)*1.8)})`:'rgba(255,255,255,.18)';for(let wy=Y+6;wy<ST_BASE-8;wy+=9)for(let wx=4;wx<34;wx+=8)if(((i*13+wx*7+wy*3)%5)>1)L.fillRect(X+wx,wy,3,4)}}}}
function stProp(x,p,lum){const X=Math.round(p.x-STV.cam),B=ST_BASE+8,n=night,R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(X+a,B+b,w,h)};
 if(lum){if(p.k=='lamp'&&n>.3){const k=x.createRadialGradient(X+8,B-86,0,X+8,B-86,46);k.addColorStop(0,`rgba(255,226,150,${.55*n})`);k.addColorStop(1,'rgba(255,226,150,0)');x.fillStyle=k;x.fillRect(X-40,B-132,96,96);x.fillStyle=`rgba(255,226,150,${.18*n})`;x.beginPath();x.moveTo(X+4,B-82);x.lineTo(X+12,B-82);x.lineTo(X+30,B+14);x.lineTo(X-18,B+14);x.fill()}return}
 const o=ST_OL,dk=t=>mx(t,'#0e1430',n*.55);
 if(p.k=='lamp'){R(-1,-90,4,90,o);R(0,-90,2,90,dk('#3d4a5c'));R(-3,-4,8,4,o);R(-2,-94,16,4,o);R(10,-92,4,8,o);R(2,-96,12,3,dk('#3d4a5c'));x.fillStyle=n>.3?'#ffe9a6':dk('#f3f0d8');x.fillRect(X+5,B-86,6,4)}
 if(p.k=='bench'){R(0,-14,40,4,o);R(1,-13,38,2,dk('#a8743f'));R(0,-24,40,4,o);R(1,-23,38,2,dk('#a8743f'));R(2,-20,3,20,o);R(35,-20,3,20,o);R(2,-10,3,10,dk('#3d4a5c'));R(35,-10,3,10,dk('#3d4a5c'))}
 if(p.k=='bin'){R(0,-22,14,22,o);R(1,-21,12,20,dk('#3f8a5a'));R(2,-17,10,1,dk('#2e6a44'));R(2,-11,10,1,dk('#2e6a44'));R(-1,-24,16,3,o)}
 if(p.k=='tree'){R(6,-26,6,26,o);R(7,-26,4,26,dk('#6b4a2e'));[[4,0,22,4],[0,4,30,26],[3,30,24,4],[8,34,14,2]].forEach(([a,b2,w,h])=>{x.fillStyle=o;x.fillRect(X-6+a,B-64+b2,w,h)});[[5,1,20,4],[1,5,28,24],[4,29,22,4],[9,33,12,1]].forEach(([a,b2,w,h])=>{x.fillStyle=dk('#4f9a4a');x.fillRect(X-6+a,B-64+b2,w,h)});x.fillStyle=dk('#6fbf5a');x.fillRect(X-1,B-59,12,8);x.fillRect(X+3,B-62,8,3);x.fillRect(X+12,B-50,8,6);x.fillStyle=dk('#3d7f3a');x.fillRect(X+2,B-40,10,5);x.fillRect(X+16,B-38,6,4);R(-2,-6,22,6,o);R(-1,-5,20,4,dk('#9a8a7a'))}
 if(p.k=='sign'){R(5,-60,3,60,o);R(6,-60,1,60,dk('#9aa6b2'));R(-2,-74,18,18,o);R(-1,-73,16,16,dk('#2d6cdf'));R(2,-66,10,2,'#fff');R(-1,-54,16,8,o);R(0,-53,14,6,dk('#f4f4f4'));x.fillStyle=dk('#2d6cdf');x.fillRect(X+2,B-51,10,2)}
 if(p.k=='hydrant'){R(0,-16,12,16,o);R(1,-15,10,14,dk('#d64545'));R(-2,-11,16,4,o);R(2,-19,8,4,o);R(3,-18,6,2,dk('#d64545'))}
 if(p.k=='bike'){R(0,-4,30,2,o);[[2,-12],[18,-12]].forEach(([a,b2])=>{x.fillStyle=o;x.fillRect(X+a,B+b2,10,10);x.fillStyle=dk('#cfd6dd');x.fillRect(X+a+2,B+b2+2,6,6)});R(8,-16,14,2,dk('#2d6cdf'));R(12,-20,2,6,o);R(20,-20,6,2,o)}}
function stWork(x,lum){const X=Math.round(STC.workX-STV.cam),B=ST_WALK+4,n=night,dk=t=>mx(t,'#0e1430',n*.55),o=ST_OL;
 if(X>STV.W+80||X<-260)return;
 if(lum){[0,58].forEach(a=>{x.fillStyle=`rgba(255,170,60,${(Math.floor(tick/20)%2?.7:.25)*Math.max(.3,n)})`;x.fillRect(X+a+2,B-46,4,4)});return}
 // grue et palissade au loin
 x.fillStyle=dk('#e0a03a');x.fillRect(X+120,40,4,ST_BASE-40);x.fillRect(X+60,40,130,4);for(let i=X+64;i<X+186;i+=8)x.fillRect(i,44,1,6);x.fillRect(X+150,44,1,40);x.fillStyle=o;x.fillRect(X+146,84,10,8);
 x.fillStyle=o;x.fillRect(X+40,ST_BASE-54,200,54);x.fillStyle=dk('#cfd6dd');x.fillRect(X+41,ST_BASE-53,198,52);x.fillStyle=dk('#e0a03a');for(let i=0;i<198;i+=40)x.fillRect(X+41+i,ST_BASE-53,20,4);
 const t='CHANTIER';let k=0;for(const ch of t){const g=STF[ch];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(g[j*5+i]=='1'){x.fillStyle=dk('#3d4a5c');x.fillRect(X+110+(k+i)*2,ST_BASE-40+j*2,2,2)}k+=6}
 // barrières rayées (limite physique)
 [0,58].forEach(a=>{x.fillStyle=o;x.fillRect(X+a,B-30,48,12);x.fillRect(X+a+4,B-30,3,30);x.fillRect(X+a+41,B-30,3,30);for(let i=0;i<46;i+=8){x.fillStyle=dk('#e63946');x.fillRect(X+a+1+i,B-29,4,10);x.fillStyle=dk('#f4f4f4');x.fillRect(X+a+5+i,B-29,4,10)}x.fillStyle=o;x.fillRect(X+a+1,B-48,6,6)});
 // cônes
 [[-16,6],[106,4],[124,8]].forEach(([a,dy])=>{const cx=X+a,cy=B+dy;x.fillStyle=o;x.fillRect(cx-1,cy-17,12,17);x.fillStyle=dk('#ff7f2a');x.fillRect(cx,cy-16,10,15);x.fillRect(cx+2,cy-19,6,3);x.fillStyle=dk('#ffffff');x.fillRect(cx+1,cy-10,8,3);x.fillStyle=o;x.fillRect(cx-3,cy-1,16,2)});
 // panneau orange interactif
 const sx=X+20,sy=B-92;x.fillStyle=o;x.fillRect(sx+12,sy+30,3,62);x.fillRect(sx,sy,28,28);x.fillStyle=dk('#ff8a1f');x.fillRect(sx+1,sy+1,26,26);x.fillStyle=o;
 x.fillRect(sx+12,sy+5,4,4);x.fillRect(sx+10,sy+10,7,8);x.fillRect(sx+8,sy+18,4,6);x.fillRect(sx+16,sy+18,3,6);x.fillRect(sx+17,sy+12,6,2);x.fillRect(sx+5,sy+22,6,2);
 x.fillStyle=o;x.fillRect(sx-8,sy+30,44,10);x.fillStyle=dk('#ffd166');x.fillRect(sx-7,sy+31,42,8);k=0;for(const ch of 'TRAVAUX'){const g=STF[ch];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(g[j*5+i]=='1'){x.fillStyle=o;x.fillRect(sx-6+(k+i),sy+32+j,1,1)}k+=6}
 if(stNearWork()&&!STV.modal)stTag(x,sx+14,sy-12,'Lire le panneau')}
const ST_CARS={berline:{L:236,H:88},citadine:{L:204,H:86},taxi:{L:236,H:96},fourgon:{L:268,H:116}};
const STCAR=new Map();
function stCarSprite(k,col,lvl){const key=k+col+lvl;let c=STCAR.get(key);if(c)return c;const sp=ST_CARS[k],W=sp.L+4,H=sp.H+4;c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const R=(a,b,w,h,co)=>{x.fillStyle=co;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
 const poly=(pts,co)=>{const ys=pts.map(p=>p[1]),y0=Math.floor(Math.min(...ys)),y1=Math.ceil(Math.max(...ys));x.fillStyle=co;for(let y=y0;y<y1;y++){const yc=y+.5,xs=[];for(let i=0;i<pts.length;i++){const[a,b]=[pts[i],pts[(i+1)%pts.length]];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)x.fillRect(Math.round(xs[i]),y,Math.round(xs[i+1])-Math.round(xs[i]),1)}};
 const disc=(cx,cy,r,co)=>{x.fillStyle=co;for(let j=-Math.ceil(r);j<=Math.ceil(r);j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w,1)}};
 const L=sp.L,o=2,dark=mx(col,'#000000',.35),lite=mx(col,'#ffffff',.35),glass='#9fd4ec',glassD='#5a8fb0',wy=sp.H-16+o,wr=k=='fourgon'?19:17;
 if(k=='fourgon'){// fourgon : grande caisse, cabine avancée
  poly([[o+6,o+12],[o+L-60,o+12],[o+L-30,o+40],[o+L-4,o+52],[o+L-2,wy+4],[o+4,wy+4]],col);R(o+6,o+12,L-66,6,lite);
  poly([[o+L-58,o+18],[o+L-34,o+40],[o+L-58,o+40]],glass);R(o+L-90,o+22,26,18,glass);R(o+L-90,o+22,26,3,'#d6f0fb');
  R(o+16,o+22,L-120,4,dark);R(o+14,wy-30,L-30,3,dark);R(o+L-96,o+20,2,wy-20,dark);R(o+L-74,o+48,10,3,'#2a2a2a');}
 else{// berline / citadine / taxi : capot, habitacle vitré, coffre
  const fr=k=='citadine'?.86:1,roofA=o+(k=='citadine'?40:58),roofB=o+L*(k=='citadine'?.7:.68),top=o+(k=='taxi'?18:10);
  poly([[o+4,o+46],[roofA-16,o+42],[roofA,top],[roofB,top],[roofB+30*fr,o+40],[o+L-6,o+46],[o+L-2,wy+2],[o+2,wy+2]],col);
  R(o+4,o+46,L-8,4,lite);R(o+4,wy-10,L-8,6,dark);
  poly([[roofA-10,o+40],[roofA+3,top+5],[roofB-3,top+5],[roofB+24*fr,o+40]],glass);poly([[roofA-6,o+40],[roofA+5,top+7],[roofA+30,top+7],[roofA+18,o+40]],'#c6ebf8');
  R((roofA+roofB)/2+4,top+4,4,o+40-top-4,col);R((roofA+roofB)/2+4,o+48,2,wy-o-56,dark);R(roofA-12,o+48,2,wy-o-56,dark);R((roofA+roofB)/2+20,o+54,10,3,'#2a2a2a');R(roofA,o+54,10,3,'#2a2a2a');
  R(roofB+20*fr,o+38,8,6,dark);
  if(k=='taxi'){R((roofA+roofB)/2-20,top-10,40,10,'#1d1d2b');R((roofA+roofB)/2-18,top-9,36,8,'#fff6c8');[..."TAXI"].forEach((ch,i)=>{const g=STF[ch];for(let jj=0;jj<7;jj++)for(let ii=0;ii<5;ii++)if(g[jj*5+ii]=='1')R((roofA+roofB)/2-12+i*6+ii,top-9+jj*1.1,1,1,'#1d1d2b')});
   for(let i=0;i<10;i++)R(o+60+i*12,o+60,6,6,i%2?'#1d1d2b':'#ffffff')}}
 // pare-chocs, phares, feux
 R(o,wy-4,10,8,'#9aa0ad');R(o+L-10,wy-4,10,8,'#9aa0ad');R(o+L-8,o+50,7,8,'#fff3b0');R(o+1,o+50,6,8,'#e8242e');R(o+L-14,wy-14,8,3,'#ffb347');
 // roues
 for(const wx of[o+L*.2,o+L*.8]){disc(wx,wy,wr+3,'#141218');disc(wx,wy,wr,'#2a2830');disc(wx,wy,wr*.55,'#b8bcc8');disc(wx,wy,wr*.25,'#6a6e7a');R(wx-1,wy-wr*.5,2,wr,'#8a8e9a')}
 // contour pixel : tout pixel vide qui touche la carrosserie devient sombre
 const id=x.getImageData(0,0,W,H),d=id.data,a=new Uint8Array(W*H);for(let i=0;i<W*H;i++)a[i]=d[i*4+3]>0?1:0;
 for(let y=0;y<H;y++)for(let X=0;X<W;X++){const i=y*W+X;if(a[i])continue;if((X>0&&a[i-1])||(X<W-1&&a[i+1])||(y>0&&a[i-W])||(y<H-1&&a[i+W])){d[i*4]=36;d[i*4+1]=26;d[i*4+2]=38;d[i*4+3]=255}}x.putImageData(id,0,0);
 // nuit : la carrosserie s'assombrit (les phares restent allumés)
 if(lvl>0){x.globalCompositeOperation='source-atop';x.fillStyle=`rgba(14,20,48,${lvl/8*.55})`;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';if(lvl>3){R(o+L-8,o+50,7,8,'#fff6c8');R(o+1,o+50,6,8,'#ff3a3a')}}
 STCAR.set(key,c);if(STCAR.size>48)STCAR.delete(STCAR.keys().next().value);return c}
function stCars(x,n){const lvl=Math.round(n*2)*4;[...STV.cars].sort((a,b)=>a.lane-b.lane).forEach(c=>{const sp=stCarSprite(c.k,c.c,lvl),w=sp.width*c.sc,h=sp.height*c.sc,X=Math.round(c.x-STV.cam),base=c.lane?ST_H-2:ST_H-26,Y=Math.round(base-h);
  if(X>STV.W+20||X+w<-20)return;x.fillStyle='rgba(10,8,20,.35)';x.fillRect(X+w*.08,base-3,w*.84,5);
  if(c.d>0)x.drawImage(sp,X,Y,w,h);else{x.save();x.translate(X+w,Y);x.scale(-1,1);x.drawImage(sp,0,0,w,h);x.restore()}
  // phares la nuit
  if(n>.35){const fx=c.d>0?X+w:X,fy=Y+h*.6,a=Math.min(.45,(n-.35)*1.2),g=x.createLinearGradient(fx,0,fx+c.d*120,0);g.addColorStop(0,`rgba(255,240,180,${a})`);g.addColorStop(1,'rgba(255,240,180,0)');x.fillStyle=g;x.beginPath();x.moveTo(fx,fy-4);x.lineTo(fx+c.d*120,fy-22);x.lineTo(fx+c.d*120,fy+26);x.lineTo(fx,fy+6);x.fill()}})}
function stTag(x,cx,y,s){const w=stTextW(s.toUpperCase())+8,X=Math.round(cx-w/2);x.fillStyle=ST_OL;x.fillRect(X,y,w,13);x.fillStyle='#fff6d6';x.fillRect(X+1,y+1,w-2,11);x.fillStyle=ST_OL;x.fillRect(Math.round(cx)-2,y+13,5,2);x.fillRect(Math.round(cx)-1,y+15,3,1);
 let k=0;for(const ch of s.toUpperCase()){const g=STF[ch]||STF[' '];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(g[j*5+i]=='1'){x.fillStyle='#3a2a2a';x.fillRect(X+4+k+i,y+3+j,1,1)}k+=6}}
function streetDraw(){if(!STV.on||!STV.cv)return;const x=STV.x,W=STV.W,n=night,dk=t=>mx(t,'#0e1430',n*.55);x.imageSmoothingEnabled=false;x.setTransform(1,0,0,1,0,STV.oy);
 stSky(x,W);stSkyline(x,W);
 // bâtiments (seulement ceux visibles)
 const lvl=Math.round(n*8),glowA=Math.max(0,Math.min(1,(n-.25)*1.6));
 STC.buildings.forEach(b=>{const X=Math.round(b.x-STV.cam);if(X>W||X+b.w<0)return;x.drawImage(stFacade(b,lvl),X,ST_BASE-b.h);if(glowA>0){x.globalAlpha=glowA;x.drawImage(stFacade(b,'lum'),X,ST_BASE-b.h);x.globalAlpha=1}});
 // mur de début de rue
 {const X=Math.round(STC.start-10-STV.cam);x.fillStyle=ST_OL;x.fillRect(X-200,ST_BASE-120,204,120);x.fillStyle=dk('#8a6a5a');x.fillRect(X-200,ST_BASE-119,203,118);x.fillStyle=dk('#76584a');for(let j=ST_BASE-116;j<ST_BASE;j+=6)x.fillRect(X-200,j,203,1)}
 // trottoir, bordure, route
 x.fillStyle=dk('#c9c4bc');x.fillRect(0,ST_BASE,W,ST_ROAD-ST_BASE);x.fillStyle=dk('#b3ada4');for(let i=-((STV.cam|0)%24);i<W;i+=24)x.fillRect(i,ST_BASE,1,ST_ROAD-ST_BASE);x.fillRect(0,ST_BASE+16,W,1);x.fillStyle=dk('#a59f96');x.fillRect(0,ST_BASE,W,3);
 x.fillStyle=dk('#8d877e');x.fillRect(0,ST_ROAD-4,W,4);x.fillStyle=dk('#4a4f5a');x.fillRect(0,ST_ROAD,W,ST_H-ST_ROAD);x.fillStyle=dk('#f3d27a');for(let i=-((STV.cam|0)%40);i<W;i+=40)x.fillRect(i,ST_ROAD+14,20,2);
 // décor urbain (derrière le personnage)
 STC.props.forEach(p=>{const X=p.x-STV.cam;if(X>-60&&X<W+60)stProp(x,p,false)});stWork(x,false);
 // voitures

 // personnage du jeu (sprite + vêtements, mêmes proportions)
 const PX=Math.round(STV.px-STV.cam);x.fillStyle='rgba(20,14,28,.28)';x.fillRect(PX-12,ST_WALK-2,24,3);x.fillRect(PX-9,ST_WALK-3,18,1);
 if(typeof sc2!='undefined'&&sc2){x.save();if(SP.fl){x.translate(PX,0);x.scale(-1,1);x.drawImage(sc2,0,0,CW,CH,-40,ST_WALK-127,CW,CH)}else x.drawImage(sc2,0,0,CW,CH,PX-40,ST_WALK-127,CW,CH);x.restore()}
 // circulation (devant le trottoir et le personnage)
 stCars(x,n);
 // lumières
 if(n>.3){STC.props.forEach(p=>{const X=p.x-STV.cam;if(X>-60&&X<W+60)stProp(x,p,true)})}stWork(x,true);
 if(n>.3){x.fillStyle=`rgba(10,14,40,${n*.12})`;x.fillRect(0,-STV.oy,W,STV.H)}
 // indication d’interaction
 const b=stNearB();if(b&&!STV.modal)stTag(x,stDoorX(b)-STV.cam,ST_BASE-b.h+(b.h>170?20:6)<ST_WALK-120?ST_WALK-112:ST_WALK-112,(b.available?(b.id=='maison'?'Rentrer':b.game?'Jouer':'Entrer'):'Bientôt')+' : '+b.name);
 if(STV.fade>0){x.fillStyle=`rgba(0,0,0,${STV.fade})`;x.fillRect(0,-STV.oy,W,STV.H)}x.setTransform(1,0,0,1,0,0)}
// --- intégration au jeu ---
PLACES.street={nom:'la rue commerçante',wall:'#d7dde5',door:'#6b7a8f',floor:'tile',fa:'#d9d9d9',fb:'#cfcfcf',furn:[]};
VT.street='La rue';
// sprite : marche de profil dans la rue, attente quand on s’arrête (animations existantes)
{const _sp=spUpdate;spUpdate=function(){if(C.st=='street'&&!creating&&!dressing){const mv=STV.mv,name=mv?'w'+(Math.floor(C.t/3.5)%4):'idle',fl=mv&&C.d<0,LB=N.look,LL=fl?Object.assign({},LB,{lf:1}):LB,k=name+JSON.stringify(LL);spName=name;if(k!==spKey&&drawFrame(name,LL))spKey=k;SP.fl=fl;return}_sp()}}
// arrivée dans la rue par le trajet, et retour direct dans la rue en sortant d’un bâtiment
{const _arr=arrive;arrive=function(d){if(d=='street'){bub.hidden=true;streetEnter();return}if(STV.on)streetLeave();_arr(d)}}
{const _lt=leaveTo;leaveTo=function(d){if(d=='street'&&C.viaStreet){const b=STC.buildings.find(q=>q.id==C.viaStreet);C.viaStreet=null;bub.hidden=true;doorT=0;doorA=0;streetEnter(b?stDoorX(b):undefined);return}C.viaStreet=null;_lt(d)}}
// les boutons « Partir » des lieux appellent goHome() sans destination : à la porte, le choix « Où aller ? »
// est remplacé par le retour direct dans la rue quand on y était entré depuis la rue
{const _sh=show;show=function(v){if(v=='out'&&C.viaStreet&&C.st=='door'&&place!='home'&&place!='street'){leaveTo('street');return}_sh(v)}}
{const _up=update;update=function(){_up();stTick()}}
{const _fr=frame;frame=function(){_fr();if(STV.on){if(!STV.cv){STV.cv=document.getElementById('stCv');STV.x=STV.cv.getContext('2d')}streetDraw()}}}
// --- commandes : clavier, tactile, clic ---
addEventListener('keydown',e=>{if(!STV.on||curV!='street')return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(['ArrowLeft','ArrowRight','KeyA','KeyD','KeyQ'].includes(e.code)){STV.keys[e.code]=true;e.preventDefault()}
 else if(['KeyE','Enter','Space','ArrowUp','KeyW','KeyZ'].includes(e.code)){e.preventDefault();if(!e.repeat)stInteract()}
 else if(e.code=='Escape'&&STV.modal)stModal(null)});
addEventListener('keyup',e=>{if(STV.keys[e.code])delete STV.keys[e.code]});
addEventListener('blur',()=>{STV.keys={};STV.touch={l:0,r:0}});
function stHold(id,side){const el=document.getElementById(id);if(!el)return;const on=e=>{e.preventDefault();STV.touch[side]=1;STV.auto=null;try{el.setPointerCapture(e.pointerId)}catch(_){}},off=()=>{STV.touch[side]=0};
 el.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach(t=>el.addEventListener(t,off));el.addEventListener('contextmenu',e=>e.preventDefault())}
function stInit(){stLayout(STC);stHold('stwL','l');stHold('stwR','r');
document.getElementById('stEnter').onclick=stInteract;
 document.getElementById('stHome').onclick=()=>{const h=STC.buildings.find(b=>b.id=='maison');STV.auto={x:stDoorX(h),then:()=>stEnterB(h)};say(NAME()+' rentre à la maison.')};
 document.getElementById('stMClose').onclick=()=>stModal(null);
 const cv=document.getElementById('stCv');cv.addEventListener('pointerdown',e=>{if(STV.modal)return;const r=cv.getBoundingClientRect(),mx2=(e.clientX-r.left)/r.width*STV.W+STV.cam,my=(e.clientY-r.top)/r.height*STV.H-STV.oy;
  // panneau du chantier
  if(mx2>=STC.workX+8&&mx2<=STC.workX+56&&my>=ST_WALK-100&&my<=ST_WALK){if(stNearWork())stWorkSign();else STV.auto={x:STC.maxX,then:stWorkSign};return}
  const b=STC.buildings.find(b=>mx2>=b.x&&mx2<=b.x+b.w&&my>=ST_BASE-b.h&&my<=ST_BASE+4);
  if(b){if(b.game&&b.available||Math.abs(STV.px-stDoorX(b))<=b.door.w/2+10)stEnterB(b);else STV.auto={x:stDoorX(b),then:()=>stPanel(true)};return}
  if(my>ST_BASE-10)STV.auto={x:Math.max(STC.minX,Math.min(STC.maxX,mx2)),then:null}});
 new ResizeObserver(()=>stFit()).observe(document.getElementById('street'));
 // tuile « La rue » dans le choix de destination
 const out=document.querySelector('#v-out .gog');if(out&&!out.querySelector('[data-go="street"]')){const t=document.createElement('button');t.className='tile';t.dataset.go='street';t.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 21V9l5-3v15M8 21V4l8 3v14M16 21v-9l5 2v7M2 21h20"/></svg>La rue<small>Se promener</small>';out.insertBefore(t,out.firstChild);t.onclick=()=>chooseDest('street')}}
stInit();
setTimeout(()=>{try{if(N.street&&N.street.on&&!creating&&place=='home'&&!tripOn&&curV=='home'&&typeof N.street.x=='number')streetEnter(N.street.x)}catch(e){}},700);
