// ===== SALLE D'ARCADE 2D (module indépendant) =====
// Menu de bornes : catalogue de 14 jeux (grille de 4 colonnes), joystick directionnel, boutons SORTIR / ENTRER.
// Aucun personnage n'est affiché. Chaque mini-jeu est un module séparé qui s'enregistre avec ARC.register(id, module) :
//   module.start(ecran, api) / module.stop()   — api : exit(), score(points, niveau), best(), level()
// Tant qu'un jeu n'a pas de module, ENTRER affiche clairement « en développement » (aucun faux lancement).
const ARC={on:false,sel:0,cols:4,mode:'menu',cur:null,back:null,rep:null,
 games:[
  {id:'space',name:'Space Attack'},{id:'snake',name:'Snake'},{id:'bricks',name:'Brick Breaker'},{id:'pinball',name:'Pinball'},
  {id:'maze',name:'Maze Runner'},{id:'bubble',name:'Bubble Pop'},{id:'mole',name:'Whack-a-Mole'},{id:'racing',name:'Mini Racing'},
  {id:'hockey',name:'Air Hockey'},{id:'claw',name:'Lucky Claw'},{id:'stack',name:'Perfect Stack'},{id:'boxes',name:'Box Master'},
  {id:'basket',name:'Street Basket'},{id:'memory',name:'Memory'}],
 modules:{},
 register(id,mod){this.modules[id]=mod;arcRender()},
 // sauvegarde : meilleur score et niveau atteint par jeu
 data(id){N.arcade=N.arcade||{};N.arcade[id]=N.arcade[id]||{best:0,level:1,plays:0};return N.arcade[id]},
 record(id,points,level){const d=this.data(id);d.plays++;let rec=false;if(typeof points=='number'&&points>d.best){d.best=points;rec=true}if(typeof level=='number'&&level>d.level)d.level=level;save();return rec}};
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
// ---------- rendu du catalogue ----------
function arcRender(){const g=document.getElementById('arcGrid');if(!g)return;if(!g.children.length){ARC.games.forEach((G,i)=>{const b=document.createElement('button');b.className='arcTile';b.dataset.i=i;b.setAttribute('role','gridcell');b.setAttribute('aria-label',G.name);
   b.appendChild(arcArt(G.id));const n=document.createElement('span');n.className='arcName';n.textContent=G.name;b.appendChild(n);const s=document.createElement('i');s.className='arcState';b.appendChild(s);
   b.onclick=()=>{if(ARC.mode!='menu')return;if(ARC.sel===i){arcEnter();return}arcSelect(i)};g.appendChild(b)});
  // deux cases libres pour équilibrer la grille
  for(let k=0;k<(ARC.cols-ARC.games.length%ARC.cols)%ARC.cols;k++){const e=document.createElement('div');e.className='arcTile arcEmpty';e.setAttribute('aria-hidden','true');e.innerHTML='<span>INSERT<br>COIN</span>';g.appendChild(e)}}
 [...g.querySelectorAll('.arcTile[data-i]')].forEach(b=>{const i=+b.dataset.i,G=ARC.games[i],ready=!!ARC.modules[G.id];b.classList.toggle('sel',i==ARC.sel);b.classList.toggle('ready',ready);b.querySelector('.arcState').textContent=ready?'':'BIENTÔT';b.setAttribute('aria-selected',i==ARC.sel)});
 const G=ARC.games[ARC.sel],dd=ARC.data(G.id),inf=document.getElementById('arcInfo');
 if(inf)inf.innerHTML=`<b>${G.name}</b><span>${ARC.modules[G.id]?(dd.best?'Record : '+dd.best:'Pas encore de record'):'En développement'}</span>`}
function arcSelect(i){if(i===ARC.sel)return;ARC.sel=i;arcRender();const b=document.querySelector(`#arcGrid .arcTile[data-i="${i}"]`);if(b){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');b.scrollIntoView({block:'nearest'})}}
// déplacement dans la grille : jamais de saut inattendu (pas de bouclage, pas de case vide)
function arcMove(dir){if(!ARC.on)return false;arcStick(dir);if(ARC.mode!='menu')return false;const n=ARC.games.length,c=ARC.cols,i=ARC.sel,col=i%c;let j=i;
 if(dir=='left'&&col>0)j=i-1;else if(dir=='right'&&col<c-1&&i+1<n)j=i+1;else if(dir=='up'&&i-c>=0)j=i-c;else if(dir=='down'&&i+c<n)j=i+c;
 if(j!==i){arcSelect(j);return true}const b=document.querySelector(`#arcGrid .arcTile[data-i="${i}"]`);if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}return false}
function arcStick(dir){const s=document.getElementById('arcStick');if(!s)return;s.dataset.d=dir||'';document.querySelectorAll('#arcJoy .arcAr').forEach(a=>a.classList.toggle('act',a.dataset.d==dir))}
// ---------- lancement / retour au menu ----------
function arcEnter(){if(!ARC.on)return;const B=document.getElementById('arcEnter');if(B){B.classList.add('press');setTimeout(()=>B.classList.remove('press'),160)}
 if(ARC.mode!='menu'){if(ARC.mode=='soon')arcMenu();return}const G=ARC.games[ARC.sel],M=ARC.modules[G.id],P=document.getElementById('arcPlay');ARC.cur=G;
 P.innerHTML='';P.hidden=false;document.getElementById('arc').classList.add('playing');
 if(M){ARC.mode='game';const api={exit:()=>arcMenu(),score:(p,l)=>ARC.record(G.id,p,l),best:()=>ARC.data(G.id).best,level:()=>ARC.data(G.id).level};try{M.start(P,api)}catch(e){console.error(e);arcMenu()}}
 else{ARC.mode='soon';P.innerHTML=`<div class="arcSoon"><div class="arcSoonArt"></div><b>${G.name}</b><p class="arcBlink">EN DÉVELOPPEMENT</p><p>Ce jeu n’est pas encore jouable.<br>Il arrive bientôt dans la salle d’arcade !</p><button class="arcBack">◀ Retour au menu</button></div>`;
  P.querySelector('.arcSoonArt').appendChild(arcArt(G.id));P.querySelector('.arcBack').onclick=arcMenu}
 arcHint()}
function arcMenu(){const M=ARC.cur&&ARC.modules[ARC.cur.id];if(ARC.mode=='game'&&M&&M.stop)try{M.stop()}catch(e){}ARC.mode='menu';ARC.cur=null;const P=document.getElementById('arcPlay');P.hidden=true;P.innerHTML='';
 document.getElementById('arc').classList.remove('playing');arcRender();arcHint()}
function arcHint(){const h=document.getElementById('arcHint');if(h)h.textContent=ARC.mode=='menu'?'Joystick ou flèches pour choisir · ENTRER pour jouer · SORTIR pour quitter':'SORTIR ou ENTRER pour revenir au menu'}
// ---------- ouverture / sortie ----------
function arcFit(){const s=document.getElementById('arcScr'),g=document.getElementById('arcGrid');if(!s||!g)return;
 // l'en-tête occupe le haut de l'écran ; la grille commence sous l'en-tête et sous les pièces / la musique du jeu si elles sont posées dessus
 const sr=s.getBoundingClientRect(),T=s.querySelector('.arcTop');let top=(T?T.offsetTop+T.offsetHeight:36)+6;
 for(const id of['coins','bMus']){const e=document.getElementById(id);if(!e)continue;const q=e.getBoundingClientRect();if(q.width&&q.bottom>sr.top&&q.top<sr.top+sr.height*.35&&q.left<sr.right&&q.right>sr.left)top=Math.max(top,Math.round(q.bottom-sr.top+5))}
 if(T){let padR=0;for(const id of['coins','bMus']){const e=document.getElementById(id);if(!e)continue;const q=e.getBoundingClientRect(),tr=T.getBoundingClientRect();if(q.width&&q.top<tr.bottom&&q.bottom>tr.top)padR=Math.max(padR,Math.round(sr.right-q.left+6))}T.style.paddingLeft=T.style.paddingRight=padR?padR+'px':'';T.classList.toggle('tight',padR>0&&sr.width-2*padR<300)}
 g.style.marginTop=top+'px';
 const rows=Math.ceil(ARC.games.length/ARC.cols),gap=Math.max(4,Math.min(10,sr.width*.018)),padX=Math.max(8,sr.width*.03);
 const availH=sr.height-top-10,availW=sr.width-2*padX;
 const t=Math.floor(Math.max(44,Math.min((availW-(ARC.cols-1)*gap)/ARC.cols,(availH-(rows-1)*gap)/rows,150)));s.style.setProperty('--t',t+'px');s.style.setProperty('--g',gap+'px');
 // nom sur une ligne : la taille s'ajuste à la case pour ne jamais être coupée
 g.querySelectorAll('.arcName').forEach(n=>{let f=Math.min(12,Math.max(7,t*.13));n.style.fontSize=f+'px';while(f>4.5&&n.scrollWidth>n.clientWidth+.5){f-=.5;n.style.fontSize=f+'px'}})}
function arcOpen(o){o=o||{};ARC.back={x:typeof o.x=='number'?o.x:null,d:o.d||1};const A=document.getElementById('arc');if(!A)return;
 ARC.on=true;ARC.sel=0;ARC.mode='menu';C.st='arcade';C.path=null;A.hidden=false;void A.offsetWidth;A.classList.add('on');arcRender();arcMenu();show('arcade');arcFit();requestAnimationFrame(arcFit);setTimeout(arcFit,350);
 if(N.street&&ARC.back.x!=null){N.street={x:Math.round(ARC.back.x),d:ARC.back.d,on:1};save()}}
function arcQuit(){if(!ARC.on)return;if(ARC.mode!='menu'){arcMenu();return}ARC.on=false;clearInterval(ARC.rep);ARC.rep=null;arcStick('');const A=document.getElementById('arc');A.classList.remove('on');setTimeout(()=>{if(!ARC.on)A.hidden=true},300);
 if(typeof streetEnter=='function')streetEnter(ARC.back&&ARC.back.x!=null?ARC.back.x:undefined);else{place='home';show('home')}}
// ---------- commandes : joystick (glisser ou flèches), clavier, tactile ----------
function arcInit(){const J=document.getElementById('arcJoy');if(!J)return;
 const hold=d=>{if(ARC.rep)clearTimeout(ARC.rep);arcMove(d);let first=true;const go=()=>{ARC.rep=setTimeout(()=>{if(ARC.holdD!==d)return;arcMove(d);first=false;go()},first?380:150)};ARC.holdD=d;go()};
 const release=()=>{ARC.holdD=null;if(ARC.rep)clearTimeout(ARC.rep);ARC.rep=null;arcStick('')};
 // flèches autour du joystick
 J.querySelectorAll('.arcAr').forEach(a=>{a.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();hold(a.dataset.d)});['pointerup','pointercancel','pointerleave'].forEach(t=>a.addEventListener(t,release))});
 // le manche lui-même : on le pousse dans une direction
 const base=document.getElementById('arcBase');let drag=null;
 base.addEventListener('pointerdown',e=>{e.preventDefault();const r=base.getBoundingClientRect();drag={cx:r.left+r.width/2,cy:r.top+r.height/2,R:r.width/2,d:null,id:e.pointerId};try{base.setPointerCapture(e.pointerId)}catch(_){}});
 base.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.cx,dy=e.clientY-drag.cy,L=Math.hypot(dx,dy);let d=null;if(L>drag.R*.32)d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  if(d!==drag.d){drag.d=d;if(d)hold(d);else release()}});
 const end=()=>{if(drag){drag=null;release()}};base.addEventListener('pointerup',end);base.addEventListener('pointercancel',end);
 document.getElementById('arcEnter').onclick=arcEnter;document.getElementById('arcOut').onclick=arcQuit;
 addEventListener('keydown',e=>{if(!ARC.on||curV!='arcade')return;if(ARC.mode=='game')return;const k={ArrowUp:'up',KeyW:'up',KeyZ:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',KeyQ:'left',ArrowRight:'right',KeyD:'right'}[e.code];
  if(k){e.preventDefault();arcMove(k);clearTimeout(ARC.kt);ARC.kt=setTimeout(()=>{if(!ARC.holdD)arcStick('')},140)}else if(e.code=='Enter'||e.code=='Space'){e.preventDefault();if(!e.repeat)arcEnter()}else if(e.code=='Escape'||e.code=='Backspace'){e.preventDefault();arcQuit()}});
 addEventListener('blur',release);new ResizeObserver(arcFit).observe(document.getElementById('arcScr'));arcRender();arcHint()}
// ---------- intégration ----------
VT.arcade='Salle d’arcade';
window.GAMES=window.GAMES||{};GAMES.arcade={open:arcOpen,quit:arcQuit};
arcInit();
