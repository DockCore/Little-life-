// ===== SALLE D'ARCADE : BORNE PLEIN ÉCRAN (module indépendant) =====
// Toute l'activité se passe dans une borne d'arcade en pixel art qui remplit 100 % de l'écran.
// Rien de Little Life n'est visible (ni personnage, ni rue, ni interface du jeu).
// Écrans de la borne : 'menu' (14 jeux) -> 'info' (présentation) -> 'game' (mini-jeu) -> 'over' (fin de partie).
// Un mini-jeu est un module séparé : ARC.register(id,{start(api),update(dt,input),draw(ctx,w,h),stop()}).
//   api : w, h (taille de l'écran de la borne en pixels), end(score), best(), level(), saveLevel(n)
// Sans module, la présentation l'indique clairement (« EN DÉVELOPPEMENT ») : aucun faux lancement.
const ARC={on:false,state:'menu',sel:0,info:0,overSel:0,back:null,modules:{},cur:null,input:{up:0,down:0,left:0,right:0,a:0,b:0},t:0,press:{},flash:0,
 games:[
  {id:'space',name:'Space Attack',desc:'Repousse l’invasion venue de l’espace !'},
  {id:'snake',name:'Snake',desc:'Mange les pommes sans te mordre la queue.'},
  {id:'bricks',name:'Brick Breaker',desc:'Casse toutes les briques avec la balle.'},
  {id:'pinball',name:'Pinball',desc:'Garde la bille en jeu et fais grimper le score.'},
  {id:'maze',name:'Maze Runner',desc:'Trouve la sortie du labyrinthe au plus vite.'},
  {id:'bubble',name:'Bubble Pop',desc:'Groupe les bulles de même couleur pour les éclater.'},
  {id:'mole',name:'Whack-a-Mole',desc:'Tape les taupes le plus vite possible !'},
  {id:'racing',name:'Mini Racing',desc:'Évite les voitures et va le plus loin possible.'},
  {id:'hockey',name:'Air Hockey',desc:'Marque dans le but adverse avant lui.'},
  {id:'claw',name:'Lucky Claw',desc:'Attrape une peluche avec la pince.'},
  {id:'stack',name:'Perfect Stack',desc:'Empile les blocs le plus haut possible.'},
  {id:'boxes',name:'Box Master',desc:'Pousse les caisses sur leurs emplacements.'},
  {id:'basket',name:'Street Basket',desc:'Marque un maximum de paniers.'},
  {id:'memory',name:'Memory',desc:'Retrouve toutes les paires de cartes.'}],
 register(id,mod){this.modules[id]=mod},
 data(id){N.arcade=N.arcade||{};N.arcade[id]=N.arcade[id]||{best:0,level:1,plays:0};return N.arcade[id]},
 record(id,points){const d=this.data(id);d.plays++;let rec=false;if(typeof points=='number'&&points>d.best){d.best=points;rec=true}save();return rec}};
// ---------- illustrations pixel art (32×32) ----------
const ARC_ART={
 space(r,d){r(0,0,32,32,'#0b0a24');[[3,4],[27,7],[9,13],[22,2],[14,26],[29,22],[5,20]].forEach(([x,y])=>r(x,y,1,1,'#ffffff'));
  const inv=['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'];inv.forEach((row,j)=>[...row].forEach((v,i)=>{if(v=='1')r(10+i,4+j,1,1,'#7cff6b')}));
  r(15,14,1,8,'#ffe14f');r(12,25,8,3,'#38e1ff');r(15,23,2,2,'#38e1ff');r(10,27,12,2,'#2a8fb8');r(15,22,2,1,'#ffffff')},
 snake(r,d){r(0,0,32,32,'#10301c');for(let y=0;y<32;y+=4)for(let x=(y/4)%2*4;x<32;x+=8)r(x,y,4,4,'#143a22');
  [[6,22],[10,22],[14,22],[14,18],[14,14],[18,14],[22,14],[22,10]].forEach(([x,y],i)=>r(x,y,4,4,i==7?'#9dff4f':'#4fd16b'));r(23,11,1,1,'#10301c');r(24,11,1,1,'#10301c');
  d(8,8,3,'#ff3b4f');r(8,4,1,2,'#6b3a1a');r(9,4,2,1,'#4fd16b')},
 bricks(r,d){r(0,0,32,32,'#14112a');['#ff4f6a','#ff9a2e','#ffe14f','#4fd16b','#38e1ff'].forEach((c,j)=>{for(let i=0;i<4;i++)r(2+i*7,3+j*4,6,3,c)});
  r(11,27,10,2,'#e8eef8');r(11,29,10,1,'#8a93a8');d(19,21,1.5,'#ffffff');r(22,18,1,1,'#ffffff55')},
 pinball(r,d){r(0,0,32,32,'#2a0f3a');r(1,1,30,30,'#3d1a5c');d(10,9,3.5,'#ff4fa3');d(21,8,3.5,'#38e1ff');d(16,15,3,'#ffe14f');d(9,9,1.5,'#ffd0ea');d(20,7,1.5,'#c8f6ff');
  for(let i=0;i<7;i++){r(6+i,24+Math.floor(i/2),2,2,'#e8eef8');r(25-i,24+Math.floor(i/2),2,2,'#e8eef8')}d(20,21,1.8,'#d6dbe6');r(19,20,1,1,'#ffffff')},
 maze(r,d){r(0,0,32,32,'#060a24');const w='#3a6fff';[[2,2,28,2],[2,28,28,2],[2,2,2,28],[28,2,2,28],[8,8,2,14],[8,8,10,2],[14,14,10,2],[22,14,2,10],[14,20,2,8],[20,2,2,7]].forEach(a=>r(...a,w));
  for(let x=5;x<28;x+=5)r(x,5,1,1,'#ffd0a6');d(18,24,3,'#ffe14f');r(19,24,3,1,'#060a24');r(18,23,1,1,'#060a24')},
 bubble(r,d){r(0,0,32,32,'#0f2340');const C=['#ff4f6a','#38e1ff','#ffe14f','#4fd16b','#b46bff'];let k=0;for(let j=0;j<3;j++)for(let i=0;i<5-(j%2);i++){d(5+i*6+(j%2)*3,5+j*5,2.6,C[(k++)%5])}
  for(let j=0;j<3;j++)for(let i=0;i<5-(j%2);i++)r(4+i*6+(j%2)*3,4+j*5,1,1,'#ffffffaa');r(15,22,2,6,'#8a93a8');d(16,27,3,'#ff4f6a');r(15,26,1,1,'#ffffff');r(16,16,1,1,'#ffffff');r(16,19,1,1,'#ffffff')},
 mole(r,d){r(0,0,32,32,'#4fa83a');r(0,0,32,9,'#7ccf5a');[[8,24],[24,24],[16,15]].forEach(([x,y])=>{r(x-6,y,12,4,'#3a2414');r(x-5,y+1,10,2,'#24160c')});
  r(12,9,8,7,'#9a6a42');r(11,11,10,5,'#9a6a42');r(13,11,1,1,'#1a1010');r(18,11,1,1,'#1a1010');r(15,13,2,1,'#ff9fb0');r(14,15,4,1,'#c99a72');
  r(22,3,7,4,'#ff4f6a');r(22,3,7,1,'#ff8a9a');r(25,7,1,8,'#c99a72')},
 racing(r,d){r(0,0,32,32,'#4fa83a');r(6,0,20,32,'#4a4f5a');r(5,0,1,32,'#ffffff');r(26,0,1,32,'#ffffff');for(let y=0;y<32;y+=8)r(15,y,2,4,'#ffe14f');
  for(let y=2;y<32;y+=6){r(4,y,1,3,'#ff4f6a');r(27,y,1,3,'#ff4f6a')}r(9,17,7,11,'#ff3b4f');r(10,19,5,3,'#9fe3ff');r(8,18,1,3,'#1a1a1a');r(16,18,1,3,'#1a1a1a');r(8,24,1,3,'#1a1a1a');r(16,24,1,3,'#1a1a1a');r(19,5,6,9,'#38e1ff');r(20,7,4,2,'#0f2340')},
 hockey(r,d){r(0,0,32,32,'#e8f6ff');r(1,1,30,30,'#bfe8f8');r(1,15,30,2,'#ff4f6a');d(16,16,5,'#ff4f6a');d(16,16,4,'#bfe8f8');r(11,1,10,2,'#2a4590');r(11,29,10,2,'#2a4590');
  d(16,7,3.5,'#3a6fff');d(16,7,1.5,'#9fc0ff');d(14,24,3.5,'#ff3b4f');d(14,24,1.5,'#ffb0b8');d(21,13,1.8,'#1a1a1a')},
 claw(r,d){r(0,0,32,32,'#2a0f3a');r(3,1,26,30,'#ff4fa3');r(5,3,22,22,'#bfe8f8');r(5,3,22,22,'#bfe8f855');r(15,3,2,8,'#8a93a8');r(12,11,8,2,'#d6dbe6');r(12,13,1,4,'#d6dbe6');r(19,13,1,4,'#d6dbe6');
  d(9,21,3,'#ffe14f');r(8,20,1,1,'#3a2414');r(10,20,1,1,'#3a2414');d(16,22,3,'#38e1ff');d(22,21,3,'#ff9a2e');r(21,20,1,1,'#3a2414');r(23,20,1,1,'#3a2414');r(5,25,22,4,'#3d1a5c');r(20,26,5,2,'#ffe14f')},
 stack(r,d){r(0,0,32,32,'#1a1440');['#ff4f6a','#ff9a2e','#ffe14f','#4fd16b','#38e1ff','#b46bff'].forEach((c,j)=>{const w=20-j*2,x=6+((j*3)%5)-(j>3?1:0);r(x,26-j*4,w,4,c);r(x,26-j*4,w,1,'#ffffff55')});r(4,30,24,2,'#0b0a24')},
 boxes(r,d){r(0,0,32,32,'#3a2a20');for(let y=0;y<32;y+=8)for(let x=(y/8)%2*8;x<32;x+=16)r(x,y,8,8,'#46342a');
  const box=(x,y)=>{r(x,y,10,10,'#c98a3a');r(x,y,10,1,'#e8b06a');r(x+1,y+1,8,8,'#b0722a');for(let i=0;i<8;i++){r(x+1+i,y+1+i,1,1,'#e8b06a');r(x+8-i,y+1+i,1,1,'#e8b06a')}};
  box(5,5);box(17,17);r(18,5,8,8,'#4fd16b55');r(18,5,8,1,'#4fd16b');r(18,12,8,1,'#4fd16b');r(18,5,1,8,'#4fd16b');r(25,5,1,8,'#4fd16b');d(9,23,3,'#ffe14f');r(8,22,1,1,'#3a2a20');r(10,22,1,1,'#3a2a20')},
 basket(r,d){r(0,0,32,32,'#ff9a5a');r(0,20,32,12,'#7a5a6a');r(0,20,32,1,'#ffffff');r(6,3,20,13,'#ffffff');r(7,4,18,11,'#e8eef8');r(12,8,8,6,'#ff4f6a');r(13,9,6,4,'#e8eef8');
  r(11,15,10,2,'#ff4f2a');for(let i=0;i<5;i++)r(12+i*2,17,1,4,'#ffffff');d(24,24,4,'#ff7a1f');r(24,20,1,9,'#7a2a0a');r(20,24,9,1,'#7a2a0a');r(22,22,1,1,'#ffb07a')},
 memory(r,d){r(0,0,32,32,'#1a2a4f');for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x=3+i*9,y=3+j*9,up=(i==0&&j==1)||(i==2&&j==0);r(x,y,8,8,up?'#ffffff':'#ff4fa3');
   if(!up){r(x+1,y+1,6,6,'#d6337f');r(x+3,y+3,2,2,'#ffb0d8')}else{r(x+2,y+2,4,4,'#ffe14f');r(x+3,y+1,2,6,'#ffe14f');r(x+1,y+3,6,2,'#ffe14f')}}}
};
function arcArt(id,size){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');
 const r=(X,Y,W,H,col)=>{x.fillStyle=col;x.fillRect(X,Y,W,H)},d=(X,Y,R,col)=>{x.fillStyle=col;for(let j=-Math.ceil(R);j<=Math.ceil(R);j++){const w=Math.floor(Math.sqrt(Math.max(0,R*R-j*j))+.5);if(w>0)x.fillRect(Math.round(X-w),Math.round(Y+j),2*w,1)}};
 ARC_ART[id](r,d);c.className='arcArt';return c}
// glyphes manquants pour les textes de la borne
if(typeof STF!='undefined')Object.assign(STF,{"'":'00100001000100000000000000000000000','?':'01110100010000100010001000000000100',',':'00000000000000000000000100010001000','/':'00001000100010001000100010000000000','%':'11001110010001000100010011100110011','+':'00000001000010011111001000010000000','>':'01000001000001000001000100010001000','<':'00010001000100010000010000010000010','·':'00000000000000000100000000000000000'});
// ---------- dessin de base ----------
const AX={};
function axR(x,X,Y,W,H,c){if(W<=0||H<=0)return;x.fillStyle=c;x.fillRect(Math.round(X),Math.round(Y),Math.round(W),Math.round(H))}
function axEll(x,cx,cy,rx,ry,c){x.fillStyle=c;const R=Math.ceil(ry);for(let j=-R;j<=R;j++){const t=1-(j/ry)*(j/ry);if(t<0)continue;const w=Math.round(rx*Math.sqrt(t));x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function axTW(s,sc=1){return String(s).length*6*sc-sc}
function axText(x,s,X,Y,c,sc=1,ol,c2){s=String(s).toUpperCase();const g=(dx,dy,col,half)=>{let k=0;for(const ch of s){const G=STF[ch]||STF[' '];for(let j=0;j<7;j++){if(half&&j<4)continue;for(let i=0;i<5;i++)if(G[j*5+i]=='1'){x.fillStyle=col;x.fillRect(Math.round(X+dx+(k+i)*sc),Math.round(Y+dy+j*sc),sc,sc)}}k+=6}};
 if(ol)for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])g(a,b,ol);g(0,0,c);if(c2)g(0,0,c2,true)}
function axCText(x,s,cx,Y,c,sc,ol,c2){axText(x,s,Math.round(cx-axTW(s,sc)/2),Y,c,sc,ol,c2)}
// découpe un nom/une phrase en lignes d'une largeur maximale (coupe aussi après un trait d'union)
function axWrap(s,maxW,sc=1){const parts=String(s).toUpperCase().split(/(?<=-)|\s+/).filter(Boolean),L=[];let cur='';for(const p of parts){const sep=cur&&!cur.endsWith('-')?' ':'',t=cur+sep+p;if(!cur||axTW(t,sc)<=maxW)cur=t;else{L.push(cur);cur=p}}if(cur)L.push(cur);return L}
const AX_ART=new Map();function axArt(id,size){const k=id+'|'+size;let c=AX_ART.get(k);if(!c){const src=arcArt(id);c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,size,size);AX_ART.set(k,c)}return c}
// ---------- mise en page : la borne remplit tout l'écran, quelle que soit sa taille ----------
function arcLayout(){const dpr=window.devicePixelRatio||1,vw=innerWidth,vh=innerHeight,dw=vw*dpr,dh=vh*dpr;
 // un pixel de la borne fait au moins 1,3 pixel CSS : les textes restent lisibles même sur un petit téléphone
 const s=Math.max(1,Math.round(Math.min(dw/300,dh/380)),Math.ceil(1.3*dpr-.01)),W=Math.ceil(dw/s),H=Math.ceil(dh/s),cv=AX.cv;
 cv.width=W;cv.height=H;const cw=W*s/dpr,ch=H*s/dpr;cv.style.width=cw+'px';cv.style.height=ch+'px';cv.style.left=((vw-cw)/2)+'px';cv.style.top=((vh-ch)/2)+'px';
 const cl=(v,a,b)=>Math.max(a,Math.min(b,Math.round(v))),m=2+Math.ceil((W*s/dpr-vw)/2*dpr/s),small=H<420,sp=cl(W*.055,8,34),mh=small?cl(H*.075,26,40):cl(H*.11,30,64),ph=small?cl(H*.135,48,60):cl(H*.16,52,96),fh=small?cl(H*.03,8,20):cl(H*.07,14,64),bz=cl(Math.min(W,H)*.03,4,14);
 const L={s,W,H,m,sp,mh,ph,fh,bz};L.marq={x:m+sp-2,y:m+4,w:W-2*(m+sp-2),h:mh};
 const by0=L.marq.y+mh+3,by1=H-m-fh-ph-3;L.bez={x:m+sp+3,y:by0,w:W-2*(m+sp+3),h:by1-by0};L.scr={x:L.bez.x+bz,y:L.bez.y+bz,w:L.bez.w-2*bz,h:L.bez.h-2*bz};
 L.pan={y:by1+3,h:ph,x:m,w:W-2*m};L.front={y:L.pan.y+ph,h:H-m-L.pan.y-ph,x:m+sp,w:W-2*(m+sp)};
 // commandes : joystick à gauche, trois boutons à droite (QUITTER, RETOUR, OK)
 const top=L.pan.y+Math.round(ph*.08),face=Math.round(ph*.66),jr=cl(ph*.2,10,20),br=cl(ph*.14,7,14);
 L.joy={x:Math.round(m+sp+Math.max(jr*2.2,(W-2*(m+sp))*.2)),y:Math.round(top+face*.62),r:jr};
 const inner=W-2*(m+sp),gap=Math.max(br*3.6,46);let bx;if(inner>420){L.joy.x=Math.round(m+sp+inner*.28);const c0=Math.round(m+sp+inner*.7);bx=[c0-gap,c0,c0+gap]}
 else{const right=W-m-sp-Math.round(br*2.2);bx=[right-2*gap,right-gap,right]}
 L.btn=[{id:'quit',lab:'QUITTER',x:bx[0],y:L.joy.y+2,r:br,c:['#ffd23f','#c99a10','#fff3b0']},{id:'back',lab:'RETOUR',x:bx[1],y:L.joy.y+2,r:br,c:['#2f7bff','#1a4ac0','#a9c8ff']},{id:'ok',lab:'OK',x:bx[2],y:L.joy.y+2,r:br,c:['#ff3348','#b8142a','#ffb0b8']}];
 L.face={y:top,h:face};
 // grille des 14 jeux : nombre de colonnes choisi pour avoir les plus grandes illustrations lisibles
 const S=L.scr,ip=Math.max(4,Math.round(S.w*.02)),fb=13,n=ARC.games.length;let best=null;
 for(let cols=2;cols<=7;cols++){const rows=Math.ceil(n/cols),gap=S.w>400?5:3,tw=Math.floor((S.w-2*ip-(cols-1)*gap)/cols),th=Math.floor((S.h-2*ip-fb-(rows-1)*gap)/rows);if(tw<30||th<30)continue;
  const lines=Math.max(...ARC.games.map(g=>axWrap(g.name,tw-4).length)),fit=ARC.games.every(g=>axWrap(g.name,tw-4).every(l=>axTW(l)<=tw-4));if(!fit||lines>2)continue;
  const room=Math.min(tw-6,th-lines*8-5),icon=[128,96,64,48,40,32,28,24,20,16].find(v=>v<=room);if(!icon)continue;
  const sc=icon*1000+tw*th/100-(cols*rows-n)*30;if(!best||sc>best.sc)best={cols,rows,gap,tw,th,icon,lines,sc}}
 if(!best)best={cols:3,rows:5,gap:2,tw:Math.floor((S.w-8)/3),th:Math.floor((S.h-21)/5),icon:16,lines:2};
 const gw=best.cols*best.tw+(best.cols-1)*best.gap,gh=best.rows*best.th+(best.rows-1)*best.gap;best.x0=S.x+Math.floor((S.w-gw)/2);best.y0=S.y+ip+Math.floor((S.h-2*ip-fb-gh)/2);best.fb={y:S.y+S.h-fb-2,h:fb};
 best.cells=ARC.games.map((g,i)=>({x:best.x0+(i%best.cols)*(best.tw+best.gap),y:best.y0+Math.floor(i/best.cols)*(best.th+best.gap),w:best.tw,h:best.th}));L.grid=best;
 AX.L=L;AX.x=cv.getContext('2d');AX.x.imageSmoothingEnabled=false;AX.bg=null;AX.gameCv=null}
// ---------- la borne (partie fixe, mise en cache) ----------
function arcCabinet(){const L=AX.L,c=document.createElement('canvas');c.width=L.W;c.height=L.H;const x=c.getContext('2d'),{W,H,m,sp}=L,OL='#0a0618';
 // salle sombre et halo derrière la borne
 axR(x,0,0,W,H,'#07051a');const g=x.createRadialGradient(W/2,H*.45,10,W/2,H*.45,Math.max(W,H)*.7);g.addColorStop(0,'rgba(140,60,255,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
 // flancs : habillage violet avec éclairs rose, bleu électrique et jaune
 for(const side of[0,1]){const X=side?W-m-sp:m;axR(x,X-1,m,sp+2,H-m,OL);const gr=x.createLinearGradient(X,0,X+sp,0);gr.addColorStop(side?1:0,'#2a1466');gr.addColorStop(side?0:1,'#4b22a8');x.fillStyle=gr;x.fillRect(X,m+1,sp,H-m-1);
  const zig=(off,col,wd,per,amp)=>{for(let y=m+2;y<H;y++){const ph=((y+off)%per)/per,t=ph<.5?ph*2:2-ph*2,cx=X+sp/2+(t-.5)*amp*(side?-1:1);x.fillStyle=col;x.fillRect(Math.round(cx-wd/2),y,wd,1)}};
  zig(0,'#ff3fa4',Math.max(2,Math.round(sp*.18)),46,sp*.7);zig(23,'#2fd0ff',Math.max(1,Math.round(sp*.1)),46,sp*.55);zig(11,'#ffd23f',1,92,sp*.4);
  axR(x,side?X:X+sp-2,m+1,2,H-m-1,'#7a4cff');axR(x,side?X+sp-1:X,m+1,1,H-m-1,'#1a0c40')}
 // fronton (marquee)
 const Q=L.marq;axR(x,Q.x-3,m,Q.w+6,4,'#1a0c40');axR(x,Q.x-2,Q.y-1,Q.w+4,Q.h+2,OL);const mg=x.createLinearGradient(0,Q.y,0,Q.y+Q.h);mg.addColorStop(0,'#3b1680');mg.addColorStop(.5,'#5a1c9a');mg.addColorStop(1,'#2a0f60');x.fillStyle=mg;x.fillRect(Q.x,Q.y,Q.w,Q.h);
 axR(x,Q.x,Q.y,Q.w,1,'#ff6fd0');axR(x,Q.x,Q.y+Q.h-1,Q.w,1,'#2fd0ff');
 const inv=['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'];
 const isc=Math.max(1,Math.floor((Q.h-8)/8/1.6)),iw=11*isc,tsc=Math.max(2,Math.min(Math.floor((Q.h-10)/7),Math.floor((Q.w-2*iw-30)/36))),tw=axTW('ARCADE',tsc),gapI=Math.max(6,tsc*3);
 const tx=Math.round(Q.x+Q.w/2-tw/2),ty=Math.round(Q.y+Q.h/2-7*tsc/2);
 for(const ix of[tx-gapI-iw,tx+tw+gapI])inv.forEach((row,j)=>[...row].forEach((v,i)=>{if(v=='1'){x.fillStyle='#ff3fa4';x.fillRect(ix+i*isc,Math.round(Q.y+Q.h/2-4*isc)+j*isc,isc,isc)}}));
 axText(x,'ARCADE',tx+Math.max(1,tsc/2),ty+Math.max(1,tsc/2),'#7a1a10',tsc);axText(x,'ARCADE',tx,ty,'#ffe14f',tsc,'#3a0a14','#ff9a1f');
 // cadre de l'écran
 const B=L.bez,S=L.scr;axR(x,B.x-2,B.y-2,B.w+4,B.h+4,'#1a0c40');axR(x,B.x,B.y,B.w,B.h,'#14102e');axR(x,B.x+1,B.y+1,B.w-2,2,'#2c2266');axR(x,B.x+1,B.y+B.h-3,B.w-2,2,'#0a0818');
 axR(x,S.x-2,S.y-2,S.w+4,S.h+4,'#05040e');axR(x,S.x-1,S.y-1,S.w+2,S.h+2,'#1f6fff');
 // pupitre : face inclinée, bord avant, vis
 const P=L.pan,F=L.face;axR(x,P.x,P.y,P.w,P.h,OL);const pg=x.createLinearGradient(0,F.y,0,F.y+F.h);pg.addColorStop(0,'#5a2fc0');pg.addColorStop(1,'#3b1d8a');x.fillStyle=pg;x.fillRect(P.x+1,F.y,P.w-2,F.h);
 axR(x,P.x+1,P.y+1,P.w-2,F.y-P.y-1,'#6b3fd8');axR(x,P.x+1,F.y+F.h,P.w-2,P.h-(F.y-P.y)-F.h-1,'#2a1466');axR(x,P.x+1,F.y+F.h,P.w-2,1,'#ff3fa4');axR(x,P.x+1,F.y,P.w-2,1,'#8a62ff');
 for(const[X,Y]of[[P.x+6,F.y+4],[P.x+P.w-8,F.y+4],[P.x+6,F.y+F.h-6],[P.x+P.w-8,F.y+F.h-6]]){axEll(x,X+1,Y+1,2,2,'#1a0c40');axEll(x,X,Y,2,2,'#b8bcc8');axR(x,X-1,Y,3,1,'#5a5e6a')}
 L.btn.forEach(b=>{axCText(x,b.lab,b.x,b.y+b.r+5,'#e8e2ff',1,'#1a0c40')});
 // façade basse : porte à pièces décorative
 const Fr=L.front;axR(x,Fr.x,Fr.y,Fr.w,Fr.h,'#1d0f45');axR(x,Fr.x,Fr.y,Fr.w,1,'#0a0618');
 if(Fr.h>16){const dw=Math.min(Fr.w*.4,90),dh=Math.min(Fr.h-8,44),dx=Math.round(W/2-dw/2),dy=Math.round(Fr.y+(Fr.h-dh)/2);axR(x,dx-1,dy-1,dw+2,dh+2,OL);axR(x,dx,dy,dw,dh,'#2c2a3a');axR(x,dx+1,dy+1,dw-2,1,'#4a4860');
  for(const k of[.3,.7]){const sx=Math.round(dx+dw*k-4),sy=Math.round(dy+dh/2-4);axR(x,sx-1,sy-1,10,10,'#14121e');axR(x,sx,sy,8,8,'#ff7a1f');axR(x,sx+3,sy+1,2,6,'#3a1a0a')}}
 return c}
// ---------- écran de la borne : contenus ----------
function arcPanelBtn(x,X,Y,w,h,label,col,dark,on,sc=1){axR(x,X,Y+2,w,h,dark);axR(x,X,Y,w,h,col);axR(x,X,Y,w,1,'rgba(255,255,255,.45)');if(on){axR(x,X-2,Y-2,w+4,1,'#ffffff');axR(x,X-2,Y+h+3,w+4,1,'#ffffff');axR(x,X-2,Y-2,1,h+6,'#ffffff');axR(x,X+w+1,Y-2,1,h+6,'#ffffff')}
 axCText(x,label,X+w/2,Y+Math.round((h-7*sc)/2),'#1a0c20',sc)}
function arcDrawMenu(x){const L=AX.L,G=L.grid,S=L.scr,t=ARC.t,pal=['#2f7bff','#ffd23f','#b46bff','#ff3fa4','#2fd0ff','#4fd16b'];
 G.cells.forEach((c,i)=>{const g=ARC.games[i],sel=i==ARC.sel,ready=!!ARC.modules[g.id],lift=sel?1:0,col=pal[i%pal.length];
  const box=(X,Y,w,h,col,k=1)=>{axR(x,X,Y,w,k,col);axR(x,X,Y+h-k,w,k,col);axR(x,X,Y,k,h,col);axR(x,X+w-k,Y,k,h,col)};
  axR(x,c.x,c.y+1,c.w,c.h,'#05040e');axR(x,c.x,c.y-lift,c.w,c.h,sel?'#2a2378':'#0f0b2e');
  if(sel){x.globalAlpha=.3+.2*Math.sin(t*6);box(c.x-3,c.y-3-lift,c.w+6,c.h+6,'#2fd0ff',2);x.globalAlpha=1;box(c.x-1,c.y-1-lift,c.w+2,c.h+2,Math.floor(t*4)%2?'#ff3fa4':'#ffffff',2);box(c.x+1,c.y+1-lift,c.w-2,c.h-2,'#2fd0ff')}
  else{x.globalAlpha=.75;box(c.x,c.y,c.w,c.h,col);x.globalAlpha=1}
  const lines=axWrap(g.name,c.w-4),textH=lines.length*8,ic=G.icon,ix=Math.round(c.x+(c.w-ic)/2),iy=Math.round(c.y-lift+(c.h-textH-ic-2)/2);
  axR(x,ix-1,iy-1,ic+2,ic+2,sel?'#ffffff':'#05040e');x.drawImage(axArt(g.id,ic),ix,iy);if(!sel){x.globalAlpha=.25;axR(x,ix,iy,ic,ic,'#05040e');x.globalAlpha=1}
  lines.forEach((l,k)=>axCText(x,l,c.x+c.w/2,iy+ic+2+k*8,sel?'#ffe14f':'#a9a4d0'))});
 if(G.icon<32)0;
 // barre d'état : jeu sélectionné
 const g=ARC.games[ARC.sel],ready=!!ARC.modules[g.id],fb=G.fb;axR(x,S.x+2,fb.y,S.w-4,fb.h,'#120d38');axR(x,S.x+2,fb.y,S.w-4,1,'#2f7bff');
 const st=ready?(ARC.data(g.id).best?'RECORD '+ARC.data(g.id).best:'PRÊT À JOUER'):'EN DÉVELOPPEMENT',nm=g.name.toUpperCase(),full=nm+'  ·  '+st;
 if(axTW(full)<=S.w-10){axText(x,nm,S.x+S.w/2-axTW(full)/2,fb.y+3,'#ffe14f');axText(x,'  ·  '+st,S.x+S.w/2-axTW(full)/2+axTW(nm)+1,fb.y+3,ready?'#7cff6b':'#ff9ad0')}else axCText(x,nm,S.x+S.w/2,fb.y+3,'#ffe14f')}
function arcInfoLayout(){const S=AX.L.scr,g=ARC.games[ARC.info],aw=Math.max(10,Math.round(S.w*.06)),inner=S.w-2*aw-16,nsc=axTW(g.name,3)<=inner&&S.h>220?3:axTW(g.name,2)<=inner?2:1;
 const d2=axWrap(g.desc,inner-4,2),dsc=d2.length<=4&&S.h>260?2:1,desc=dsc==2?d2:axWrap(g.desc,inner-4),dl=desc.length*(dsc==2?17:9),bh=nsc>1?20:16,bw=Math.min(inner,Math.max(80,axTW('EN DÉVELOPPEMENT')+16));
 const fixed=10+7*nsc+8+dl+8+bh+10+7+12,room=S.h-fixed,icon=[128,96,64,48,32,24].find(v=>v<=Math.min(room,inner*.7))||24,total=icon+fixed;
 let y=S.y+Math.max(6,Math.round((S.h-total)/2));const o={g,aw,nsc,desc,dsc,icon,bw,bh};o.iy=y;y+=icon+10;o.ny=y;y+=7*nsc+8;o.dy=y;y+=dl+8;o.by=y;o.bx=Math.round(S.x+S.w/2-bw/2);o.hy=y+bh+10;
 o.arL={x:S.x+4,y:S.y+S.h/2-aw,w:aw,h:2*aw};o.arR={x:S.x+S.w-4-aw,y:S.y+S.h/2-aw,w:aw,h:2*aw};return o}
function arcDrawInfo(x){const S=AX.L.scr,o=arcInfoLayout(),g=o.g,ready=!!ARC.modules[g.id],t=ARC.t,cx=S.x+S.w/2;
 const ix=Math.round(cx-o.icon/2);axR(x,ix-3,o.iy-3,o.icon+6,o.icon+6,'#2fd0ff');axR(x,ix-2,o.iy-2,o.icon+4,o.icon+4,'#05040e');x.drawImage(axArt(g.id,o.icon),ix,o.iy);
 x.globalAlpha=.25+.15*Math.sin(t*4);axR(x,ix-5,o.iy-5,o.icon+10,1,'#2fd0ff');axR(x,ix-5,o.iy+o.icon+4,o.icon+10,1,'#2fd0ff');x.globalAlpha=1;
 axCText(x,g.name,cx,o.ny,'#ffffff',o.nsc,'#05040e');o.desc.forEach((l,k)=>axCText(x,l,cx,o.dy+k*(o.dsc==2?17:9),'#c9cfe8',o.dsc));
 const shake=ARC.flash>0?Math.round(Math.sin(ARC.flash*60)*2):0;
 if(ready)arcPanelBtn(x,o.bx,o.by,o.bw,o.bh,'> JOUER','#ffd23f','#b8860b',Math.floor(t*3)%2==0,o.nsc>1?2:1);
 else{axR(x,o.bx+shake,o.by,o.bw,o.bh,'#2a2550');axR(x,o.bx+shake,o.by,o.bw,1,'#4a4380');axCText(x,'EN DÉVELOPPEMENT',cx+shake,o.by+Math.round((o.bh-7)/2),Math.floor(t*2)%2?'#ffd23f':'#ff9a1f')}
 axCText(x,ready?'OK : JOUER  ·  RETOUR : MENU':'RETOUR : MENU',cx,o.hy,'#8f97c0');
 // flèches pour passer d'un jeu à l'autre
 for(const[a,dir]of[[o.arL,-1],[o.arR,1]]){const cy=a.y+a.h/2,pulse=Math.round(Math.sin(t*5)*1);for(let k=0;k<a.w;k++){const hh=Math.round((dir<0?k:a.w-1-k)*a.h/a.w/2);axR(x,a.x+k+pulse*dir,cy-hh,1,2*hh+1,'#ffd23f')}}}
function arcDrawOver(x){const S=AX.L.scr,cx=S.x+S.w/2,o=ARC.over,sc=axTW('PARTIE TERMINÉE !',2)<=S.w-12?2:1,big=[6,5,4,3,2].find(k=>axTW('0000',k)<=S.w*.6&&7*k<=S.h*.16)||2,bsc=axTW('REJOUER',2)+12<=(S.w-36)/2?2:1,blockH=7*sc+14+(7*big+28)+8+18+(bsc>1?24:16);let y=S.y+Math.max(6,Math.round((S.h-blockH)/2));
 axCText(x,'PARTIE TERMINÉE !',cx,y,'#ffffff',sc,'#05040e');y+=7*sc+14;const bw=Math.min(S.w-20,Math.max(axTW('SCORE FINAL :',1)+30,axTW('0000',big)+40)),bh=7*big+28;
 axR(x,cx-bw/2,y,bw,bh,'#2fd0ff');axR(x,cx-bw/2+1,y+1,bw-2,bh-2,'#0a1030');axCText(x,'SCORE FINAL :',cx,y+6,'#e8e2ff');axCText(x,String(o.score).padStart(4,'0'),cx,y+17,'#ffe14f',big,'#3a0a14','#ff9a1f');y+=bh+8;
 axCText(x,o.rec?'NOUVEAU RECORD !':'RECORD : '+ARC.data(o.id).best,cx,y,o.rec?'#7cff6b':'#8f97c0');y+=18;
 const w=Math.min(Math.floor((S.w-36)/2),bsc>1?110:90),h=bsc>1?24:16;arcPanelBtn(x,cx-w-6,y,w,h,'REJOUER','#2f7bff','#1a4ac0',ARC.overSel==0,bsc);arcPanelBtn(x,cx+6,y,w,h,'RETOUR','#9a6bff','#5a35b0',ARC.overSel==1,bsc);ARC.overBtns=[{x:cx-w-6,y,w,h},{x:cx+6,y,w,h}]}
function arcDraw(){if(!ARC.on||!AX.L)return;const L=AX.L,x=AX.x,S=L.scr,t=ARC.t;if(!AX.bg)AX.bg=arcCabinet();x.drawImage(AX.bg,0,0);
 // fronton rétroéclairé qui respire, néons des flancs
 x.globalAlpha=.08+.06*Math.sin(t*2);axR(x,L.marq.x,L.marq.y,L.marq.w,L.marq.h,'#ff9ad0');x.globalAlpha=1;
 const sh=((t*.35)%1.6)-.3;if(sh>0&&sh<1){x.globalAlpha=.08;const X=L.marq.x+sh*L.marq.w;for(let k=0;k<10;k++)axR(x,X+k-L.marq.h*.3,L.marq.y+1,2,L.marq.h-2,'#ffffff');x.globalAlpha=1}
 for(const side of[0,1]){const X=side?L.W-L.m-L.sp-1:L.m+L.sp;x.globalAlpha=.5+.3*Math.sin(t*2.4+side*Math.PI);axR(x,X,L.m+1,1,L.pan.y-L.m-1,side?'#ff3fa4':'#2fd0ff');x.globalAlpha=1}
 // écran
 x.save();x.beginPath();x.rect(S.x,S.y,S.w,S.h);x.clip();const sg=x.createLinearGradient(0,S.y,0,S.y+S.h);sg.addColorStop(0,'#0c1238');sg.addColorStop(1,'#080a24');x.fillStyle=sg;x.fillRect(S.x,S.y,S.w,S.h);
 if(ARC.state=='menu')arcDrawMenu(x);else if(ARC.state=='info')arcDrawInfo(x);else if(ARC.state=='over')arcDrawOver(x);
 else if(ARC.state=='game'&&ARC.cur){const M=ARC.modules[ARC.cur.id];if(!AX.gameCv||AX.gameCv.width!=S.w||AX.gameCv.height!=S.h){AX.gameCv=document.createElement('canvas');AX.gameCv.width=S.w;AX.gameCv.height=S.h}
  const gx=AX.gameCv.getContext('2d');gx.imageSmoothingEnabled=false;try{M.draw&&M.draw(gx,S.w,S.h)}catch(e){console.error(e)}x.drawImage(AX.gameCv,S.x,S.y)}
 // effet cathodique : lignes, reflet, coins
 x.globalAlpha=.1;for(let y=S.y;y<S.y+S.h;y+=2)axR(x,S.x,y,S.w,1,'#000000');x.globalAlpha=.06;axR(x,S.x,S.y,S.w,Math.round(S.h*.35),'#ffffff');x.globalAlpha=1;
 if(ARC.state!='game'){const tr=(ARC.trans||0);if(tr>0){x.globalAlpha=tr;axR(x,S.x,S.y,S.w,S.h,'#ffffff');x.globalAlpha=1}}
 x.restore();
 // joystick (s'incline dans la direction poussée)
 const J=L.joy,d=ARC.stick,dx=d=='left'?-1:d=='right'?1:0,dy=d=='up'?-1:d=='down'?1:0,tip={x:J.x+dx*J.r*.45,y:J.y-J.r*1.45+dy*J.r*.35};
 axEll(x,J.x,J.y+2,J.r*1.15,J.r*.5,'#0a0618');axEll(x,J.x,J.y,J.r*1.05,J.r*.42,'#1a1a22');axEll(x,J.x,J.y-1,J.r*.7,J.r*.25,'#2c2c36');
 const steps=Math.round(J.r*1.45);for(let k=0;k<steps;k++){const u=k/steps,X=J.x+(tip.x-J.x)*u,Y=J.y-1+(tip.y-J.y+1)*u;axR(x,X-1.5,Y,3,1,k%3?'#c0c4d0':'#8a8e9a')}
 const br=J.r*.78;axEll(x,tip.x,tip.y+2,br+1,br+1,'#0a0618');axEll(x,tip.x,tip.y,br+1,br+1,'#0a0618');axEll(x,tip.x,tip.y,br,br,'#e8162e');axEll(x,tip.x+br*.15,tip.y+br*.2,br*.75,br*.7,'#b80a20');axEll(x,tip.x-br*.05,tip.y-br*.05,br*.8,br*.8,'#ff2a40');axEll(x,tip.x-br*.35,tip.y-br*.4,br*.28,br*.22,'#ffb0b8');
 // boutons physiques (s'enfoncent quand on appuie)
 L.btn.forEach(b=>{const p=ARC.press[b.id]?1:0,[c,dk,hl]=b.c,lift=p?1:3;axEll(x,b.x,b.y+3,b.r+3,b.r*.62+2,'#0a0618');axEll(x,b.x,b.y+2,b.r+2,b.r*.6+1,'#c8ccd8');axEll(x,b.x,b.y+1,b.r+1,b.r*.6,'#7a7e8a');
  for(let k=lift;k>=0;k--)axEll(x,b.x,b.y-k,b.r,b.r*.6,k==lift?c:dk);axEll(x,b.x-b.r*.3,b.y-lift-b.r*.18,b.r*.35,b.r*.18,hl);if(p){x.globalAlpha=.35;axEll(x,b.x,b.y-lift,b.r+4,b.r*.6+3,c);x.globalAlpha=1}})}
// ---------- navigation et actions ----------
function arcPress(id){ARC.press[id]=1;clearTimeout(ARC['pt'+id]);ARC['pt'+id]=setTimeout(()=>{ARC.press[id]=0},150)}
function arcMove(dir){if(!ARC.on)return false;ARC.stick=dir;clearTimeout(ARC.stT);if(!ARC.holdD)ARC.stT=setTimeout(()=>{if(!ARC.holdD)ARC.stick=''},150);
 if(ARC.state=='menu'){const n=ARC.games.length,c=AX.L.grid.cols,i=ARC.sel,col=i%c;let j=i;
  if(dir=='left'&&col>0)j=i-1;else if(dir=='right'&&col<c-1&&i+1<n)j=i+1;else if(dir=='up'&&i-c>=0)j=i-c;else if(dir=='down'&&i+c<n)j=i+c;ARC.sel=j;return j!==i}
 if(ARC.state=='info'&&(dir=='left'||dir=='right')){const n=ARC.games.length;ARC.info=(ARC.info+(dir=='right'?1:-1)+n)%n;ARC.sel=ARC.info;ARC.flash=0;return true}
 if(ARC.state=='over'&&(dir=='left'||dir=='right')){ARC.overSel=dir=='left'?0:1;return true}
 return false}
function arcOk(){if(!ARC.on)return;arcPress('ok');
 if(ARC.state=='menu'){ARC.info=ARC.sel;arcGo('info')}
 else if(ARC.state=='info'){const g=ARC.games[ARC.info];if(ARC.modules[g.id])arcStart(g);else ARC.flash=.35}
 else if(ARC.state=='over'){if(ARC.overSel==0)arcStart(ARC.games.find(g=>g.id==ARC.over.id));else arcGo('info')}}
function arcBack(){if(!ARC.on)return;arcPress('back');if(ARC.state=='menu'){arcQuit();return}if(ARC.state=='game'){arcStop();arcGo('menu');return}arcGo(ARC.state=='info'?'menu':'info')}
function arcGo(st){ARC.state=st;ARC.trans=.35;arcHud()}
function arcStart(g){const M=ARC.modules[g.id],S=AX.L.scr;ARC.cur=g;ARC.info=ARC.games.indexOf(g);ARC.state='game';ARC.trans=0;
 const api={w:S.w,h:S.h,end:(score)=>{const rec=ARC.record(g.id,score);arcStop();ARC.over={id:g.id,score:score|0,rec};ARC.overSel=0;arcGo('over')},best:()=>ARC.data(g.id).best,level:()=>ARC.data(g.id).level,saveLevel:(n)=>{const d=ARC.data(g.id);if(n>d.level){d.level=n;save()}},
  // retour direct au menu des 14 jeux, données propres au jeu, enregistrement d'un score sans quitter le jeu
  exit:()=>{arcStop();arcGo('menu')},data:()=>ARC.data(g.id),save:()=>save(),record:(p)=>ARC.record(g.id,p)};
 try{M.start&&M.start(api)}catch(e){console.error(e);ARC.state='info'}arcHud()}
function arcStop(){const M=ARC.cur&&ARC.modules[ARC.cur.id];if(M&&M.stop)try{M.stop()}catch(e){}ARC.cur=null;ARC.input.dirQ=[];if(ARC.state=='game')ARC.state='info'}
function arcHud(){}
// ---------- boucle ----------
function arcLoop(ts){if(!ARC.on)return;const dt=Math.min(.05,(ts-(ARC.last||ts))/1000);ARC.last=ts;ARC.t+=dt;if(ARC.flash>0)ARC.flash=Math.max(0,ARC.flash-dt);if(ARC.trans>0)ARC.trans=Math.max(0,ARC.trans-dt*2.2);
 if(ARC.state=='game'&&ARC.cur){const M=ARC.modules[ARC.cur.id];try{M.update&&M.update(dt,ARC.input)}catch(e){console.error(e)}}
 arcDraw();requestAnimationFrame(arcLoop)}
// ---------- ouverture / sortie ----------
function arcOpen(o){o=o||{};ARC.back={x:typeof o.x=='number'?o.x:null,d:o.d||1};AX.root.hidden=false;ARC.on=true;ARC.state='menu';ARC.sel=0;ARC.t=0;ARC.trans=.6;ARC.stick='';C.st='arcade';C.path=null;
 arcLayout();show('arcade');if(N.street&&ARC.back.x!=null){N.street={x:Math.round(ARC.back.x),d:ARC.back.d,on:1};save()}ARC.last=0;requestAnimationFrame(arcLoop);try{AX.cv.focus({preventScroll:true})}catch(e){}}
function arcQuit(){if(!ARC.on)return;arcPress('quit');if(ARC.state=='game')arcStop();ARC.on=false;ARC.holdD=null;clearTimeout(ARC.rep);AX.root.hidden=true;
 if(typeof streetEnter=='function')streetEnter(ARC.back&&ARC.back.x!=null?ARC.back.x:undefined);else{place='home';show('home')}}
// ---------- commandes : joystick et boutons de la borne (souris / tactile), écran tactile, clavier ----------
function arcPt(e){const r=AX.cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*AX.L.W,y:(e.clientY-r.top)/r.height*AX.L.H}}
const arcIn=(p,a)=>a&&p.x>=a.x&&p.x<a.x+a.w&&p.y>=a.y&&p.y<a.y+a.h;
function arcHold(d){clearTimeout(ARC.rep);ARC.holdD=d;arcMove(d);let first=true;const go=()=>{ARC.rep=setTimeout(()=>{if(ARC.holdD!==d)return;arcMove(d);first=false;go()},first?380:150)};go()}
function arcRelease(){ARC.holdD=null;clearTimeout(ARC.rep);ARC.stick='';['up','down','left','right'].forEach(k=>ARC.input[k]=0)}
function arcInit(){const root=document.createElement('div');root.id='arcx';root.className='arcx';root.hidden=true;root.innerHTML='<canvas id="arcCv" tabindex="-1" aria-label="Borne d’arcade : 14 jeux"></canvas>';document.body.appendChild(root);AX.root=root;AX.cv=root.querySelector('canvas');
 let drag=null;
 AX.cv.addEventListener('pointerdown',e=>{if(!ARC.on)return;e.preventDefault();const p=arcPt(e),L=AX.L;
  // boutons physiques
  for(const b of L.btn)if(Math.hypot(p.x-b.x,(p.y-b.y)*1.4)<b.r+5){if(b.id=='ok')arcOk();else if(b.id=='back')arcBack();else arcQuit();if(ARC.state=='game'){ARC.input[b.id=='ok'?'a':'b']=1;if(b.id=='ok')ARC.input.okN=(ARC.input.okN||0)+1}return}
  // joystick : on attrape la boule ou le socle et on pousse
  const J=L.joy;if(Math.hypot(p.x-J.x,p.y-(J.y-J.r*.8))<J.r*2.2){drag={id:e.pointerId,d:null};try{AX.cv.setPointerCapture(e.pointerId)}catch(_){}arcDrag(p,drag);return}
  // écran tactile
  if(ARC.state=='menu'){const i=L.grid.cells.findIndex(c=>arcIn(p,c));if(i>=0){if(i===ARC.sel)arcOk();else ARC.sel=i}}
  else if(ARC.state=='info'){const o=arcInfoLayout();if(arcIn(p,o.arL))arcMove('left');else if(arcIn(p,o.arR))arcMove('right');else if(arcIn(p,{x:o.bx,y:o.by,w:o.bw,h:o.bh}))arcOk()}
  else if(ARC.state=='over'&&ARC.overBtns){const k=ARC.overBtns.findIndex(b=>arcIn(p,b));if(k>=0){ARC.overSel=k;arcOk()}}
  else if(ARC.state=='game'&&ARC.cur){const M=ARC.modules[ARC.cur.id],S=L.scr;if(M.pointer&&arcIn(p,S))M.pointer('down',p.x-S.x,p.y-S.y)}});
 AX.cv.addEventListener('pointermove',e=>{if(!ARC.on)return;const p=arcPt(e);if(drag&&drag.id===e.pointerId){arcDrag(p,drag);return}
  if(ARC.state=='game'&&ARC.cur){const M=ARC.modules[ARC.cur.id],S=AX.L.scr;if(M.pointer)M.pointer('move',p.x-S.x,p.y-S.y)}});
 const up=e=>{if(drag&&drag.id===e.pointerId){drag=null;arcRelease()}ARC.input.a=ARC.input.b=0;if(ARC.on&&ARC.state=='game'&&ARC.cur){const M=ARC.modules[ARC.cur.id];if(M.pointer)M.pointer('up',0,0)}};
 AX.cv.addEventListener('pointerup',up);AX.cv.addEventListener('pointercancel',up);AX.cv.addEventListener('contextmenu',e=>e.preventDefault());
 const KM={ArrowUp:'up',KeyW:'up',KeyZ:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',KeyQ:'left',ArrowRight:'right',KeyD:'right'};
 addEventListener('keydown',e=>{if(!ARC.on)return;const d=KM[e.code];
  if(d){e.preventDefault();ARC.input[d]=1;if(ARC.state!='game')arcMove(d);else{ARC.stick=d;(ARC.input.dirQ=ARC.input.dirQ||[]).push(d)}return}
  if(e.code=='Enter'||e.code=='Space'||e.code=='KeyK'){e.preventDefault();ARC.input.a=1;if(!e.repeat)ARC.input.okN=(ARC.input.okN||0)+1;if(!e.repeat&&ARC.state!='game')arcOk();else arcPress('ok');return}
  if(e.code=='Escape'||e.code=='Backspace'||e.code=='KeyX'||e.code=='KeyL'){e.preventDefault();if(!e.repeat)arcBack();return}},true);
 addEventListener('keyup',e=>{if(!ARC.on)return;const d=KM[e.code];if(d){ARC.input[d]=0;if(ARC.stick==d&&!ARC.holdD)ARC.stick=''}if(e.code=='Enter'||e.code=='Space'||e.code=='KeyK')ARC.input.a=0},true);
 addEventListener('resize',()=>{if(ARC.on)arcLayout()});addEventListener('blur',arcRelease)}
function arcDrag(p,drag){const J=AX.L.joy,dx=p.x-J.x,dy=p.y-(J.y-J.r*.9),L=Math.hypot(dx,dy);let d=null;if(L>J.r*.45)d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
 if(d!==drag.d){drag.d=d;['up','down','left','right'].forEach(k=>ARC.input[k]=k==d?1:0);if(d){if(ARC.state=='game'){ARC.stick=d;ARC.holdD=d;(ARC.input.dirQ=ARC.input.dirQ||[]).push(d)}else arcHold(d)}else arcRelease()}}
// ---------- intégration ----------
VT.arcade='Salle d’arcade';
window.GAMES=window.GAMES||{};GAMES.arcade={open:arcOpen,quit:arcQuit};
arcInit();
