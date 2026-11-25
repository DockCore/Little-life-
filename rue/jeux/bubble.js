// ===== MINI-JEU BUBBLE POP (module de la borne d'arcade) =====
// Un vrai « bubble shooter » : grille hexagonale (rangées décalées), lanceur en bas, visée au doigt, rebonds sur les murs.
// Moteur : tout est en unités de grille (rayon d'une bulle = 1), indépendant de la taille de l'écran.
//  - le tir avance par balayage continu : on calcule l'instant exact du premier contact (mur, plafond, ou bulle à distance 2R),
//    rien ne peut donc traverser une bulle, même à grande vitesse ou sur un écran minuscule ;
//  - au contact, la bulle s'accroche à la case libre de la grille la plus proche du point de contact (voisine de la bulle touchée) :
//    deux bulles ne se superposent jamais ;
//  - après chaque placement : groupe de même couleur (≥ 3) → éclatement, puis toutes les bulles qui ne tiennent plus au plafond tombent.
// La trajectoire de visée affichée utilise exactement le même calcul que le tir.
// 12 niveaux définis à la main (couleurs, dispositions, plafond qui descend, objectifs : tout éclater / libérer les étoiles / score en N tirs).
// Les bulles proposées au tir sont toujours prises parmi les couleurs encore présentes : aucun niveau n'est impossible.
// Gérés par la borne : api.exit (QUITTER), api.record (meilleur score), api.level / api.saveLevel (niveaux débloqués), api.data().
(function(){
const R_=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
const T_=(x,s,X,Y,c,sc,ol)=>{try{axText(x,s,X,Y,c,sc||1,ol)}catch(e){}},CT=(x,s,cx,Y,c,sc,ol)=>{try{axCText(x,s,cx,Y,c,sc||1,ol)}catch(e){}},TW=(s,sc)=>{try{return axTW(s,sc||1)}catch(e){return String(s).length*6*(sc||1)}};
const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,pad=(n,k)=>String(Math.max(0,Math.floor(n))).padStart(k,'0');
// ---------- grille ----------
const AMIN=.2,COLS=9,ROWH=Math.sqrt(3),MAXR=12,BW=COLS*2,SPEED=42,LX=BW/2,LY=1+(MAXR+.85)*ROWH,DANGER=1+(MAXR-.5)*ROWH;
const cols=r=>(r&1)?COLS-1:COLS;
const COL=[{k:'r',c:'#ff5d8f'},{k:'o',c:'#ff9f43'},{k:'y',c:'#ffd93d'},{k:'g',c:'#4cd97b'},{k:'b',c:'#3fa9ff'},{k:'v',c:'#a66bff'}];
const KI={};COL.forEach((q,i)=>KI[q.k]=i);
// ---------- niveaux : chaque chaîne est une rangée (9 cases, 8 pour les rangées décalées) ; majuscule = bulle étoile ----------
// obj : 'clear' tout éclater · 'stars' libérer toutes les étoiles · 'score' atteindre un score en un nombre de tirs limité
// drop : le plafond descend d'une rangée tous les N tirs (0 = jamais)
const LEVELS=[
 {nom:'PREMIÈRES BULLES',obj:'clear',drop:0,map:['rrryyybbb','rryyybbb','bbbrrryyy','bbrrryyy','yyybbbrrr']},
 {nom:'RAYURES',obj:'clear',drop:0,map:['ggbbvvggb','gbbvvggb','bbvvggbbv','bvvggbbv','vvggbbvvg','vggbbvvg']},
 {nom:'PLUIE D\'ÉTOILES',obj:'stars',drop:0,map:['rrYyyggBb','rrryggbb','gGbbbrrry','ggbbrryy','yyy.R.bbb']},
 {nom:'LE PLAFOND BOUGE',obj:'clear',drop:9,map:['rgbyrgbyr','rgbyrgby','yrgbyrgby','yrgbyrgb','byrgbyrgb','byrgbyrg']},
 {nom:'CHASSE AUX POINTS',obj:'score',goal:2600,shots:24,drop:0,map:['ooyyyyyoo','obbyybbo','bbbggbbbb','bggoogbb','ggooooogg','goobbooo']},
 {nom:'ARC-EN-CIEL',obj:'clear',drop:8,map:['rrrooobbb','rryyyobb','ggyyybbgg','ggrrrogg','bbrrroooy','bbggyyoo','..bggyy..']},
 {nom:'CONSTELLATION',obj:'stars',drop:8,map:['vvrrGrrvv','vyyrryyv','bbyyVyybb','bggbbggb','Rgg.b.ggY','rr....yy']},
 {nom:'GRAPPES',obj:'clear',drop:9,map:['rorgbgvbv','.o..g..v','.oo.gg.vv','.rr.bb.r','.bb.rr.oo','..v..g..']},
 {nom:'SIX COULEURS',obj:'clear',drop:12,map:['rrrooyygg','bbvvrroo','yybbbvvrr','ggyybbvv','oogggyybb','vvoogggy']},
 {nom:'NUIT ÉTOILÉE',obj:'stars',drop:7,map:['yyGrrBooy','yggrrbbo','vvggOrbbv','vvyyrrbb','Vbbyy.ggR','bboo..gg','rr.....yy']},
 {nom:'LE GRAND MUR',obj:'clear',drop:10,map:['rgrgbybyo','rgbbyyoo','vvrrggbby','ovvrrggb','bboovvrry','gbboovvr','yyggbboov','ryyggbbo']},
 {nom:'FINAL FÉERIQUE',obj:'clear',drop:9,map:['BrgvvYoog','brvgyyob','gbRrvgyoo','ggbrrvyo','Ogvb.rvyG','ogb..ryv','oo.....vV']}];
const NL=LEVELS.length;
// ---------- état ----------
const BP={phase:'title',t:0,pt:0,api:null,L:null,W:0,H:0,g:[],off:0,offA:0,shot:null,cur:0,next:0,aim:-Math.PI/2,aiming:false,lvl:0,score:0,score0:0,lscore:0,shots:0,combo:0,
 pops:[],falls:[],parts:[],texts:[],shake:0,flash:0,wob:[],swapT:0,mute:false,paused:false,btns:[],stars:0,starsTot:0,touch:null,okN:null,res:null,bg:[],sel:0};
let RNG=Math.random;
const fx=(n,k,g)=>{if(BP.mute)return;try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
function data(){try{return BP.api.data()}catch(e){return BP._d||(BP._d={best:0,level:1})}}
function unlocked(){let n=1;try{n=BP.api.level()}catch(e){n=data().level||1}return cl(n,1,NL)}
// ---------- géométrie ----------
function cx(r,c){return 1+2*c+(r&1)}
function cy(r,off){return 1+(r+(off==null?BP.off:off))*ROWH}
function get(r,c){const row=BP.g[r];return row?row[c]:null}
function set(r,c,v){while(BP.g.length<=r)BP.g.push(new Array(COLS).fill(null));BP.g[r][c]=v}
function each(f){for(let r=0;r<BP.g.length;r++)for(let c=0;c<cols(r);c++){const b=BP.g[r][c];if(b)f(b,r,c)}}
function neigh(r,c){const o=(r&1)?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];
 return o.map(([dr,dc])=>[r+dr,c+dc]).filter(([a,b])=>a>=0&&b>=0&&b<cols(a))}
function count(){let n=0;each(()=>n++);return n}
function colorsLeft(){const s=new Set();each(b=>s.add(b.ci));return[...s]}
// ---------- tir : balayage continu exact ----------
// Avance la bulle (x,y,dx,dy) de « dist » unités. Renvoie l'événement de contact : {type:'bulle'|'plafond', x,y, hit:[r,c]} ou null.
function sweep(st,dist,onBounce){let left=dist;for(let guard=0;guard<16&&left>1e-9;guard++){let tMin=left,ev=null;
  // murs latéraux (centre entre 1 et BW-1)
  if(st.dx<0){const t=(1-st.x)/st.dx;if(t>=0&&t<tMin){tMin=t;ev={type:'mur'}}}else if(st.dx>0){const t=(BW-1-st.x)/st.dx;if(t>=0&&t<tMin){tMin=t;ev={type:'mur'}}}
  // plafond
  const top=1+BP.off*ROWH;if(st.dy<0){const t=(top-st.y)/st.dy;if(t>=0&&t<tMin){tMin=t;ev={type:'plafond'}}}
  // bulles : |p + d t - q| = 2 (deux rayons), plus petite racine positive
  for(let r=0;r<BP.g.length;r++)for(let c=0;c<cols(r);c++){if(!BP.g[r][c])continue;const qx=cx(r,c)-st.x,qy=cy(r)-st.y,b=qx*st.dx+qy*st.dy;if(b<=0)continue;const cc=qx*qx+qy*qy-4,disc=b*b-cc;if(disc<0)continue;
   const t=cc<=0?0:b-Math.sqrt(disc);if(t>=0&&t<tMin){tMin=t;ev={type:'bulle',hit:[r,c]}}}
  st.x+=st.dx*tMin;st.y+=st.dy*tMin;left-=tMin;
  if(!ev)return null;if(ev.type=='mur'){st.dx=-st.dx;st.x=cl(st.x,1,BW-1);if(onBounce)onBounce(st.x,st.y);continue}
  ev.x=st.x;ev.y=st.y;return ev}return null}
// case libre de la grille la plus proche du point de contact (voisine de la bulle touchée, ou rangée du plafond)
function snapCell(ev){let cand=[];if(ev.type=='bulle')cand=neigh(ev.hit[0],ev.hit[1]);else for(let c=0;c<cols(0);c++)cand.push([0,c]);
 if(ev.type=='bulle'&&cy(ev.hit[0])-ev.y>.2&&ev.hit[0]==0){}// (contact sous une bulle du plafond : voisines normales)
 let best=null,bd=1e9;for(const[r,c]of cand){if(get(r,c))continue;const d=Math.hypot(cx(r,c)-ev.x,cy(r)-ev.y);if(d<bd){bd=d;best=[r,c]}}
 if(!best){// sécurité : la case libre la plus proche autour du point de contact
  for(let r=0;r<MAXR+3;r++)for(let c=0;c<cols(r);c++){if(get(r,c))continue;const d=Math.hypot(cx(r,c)-ev.x,cy(r)-ev.y);if(d<bd){bd=d;best=[r,c]}}}
 return best}
// trajectoire simulée (pour la visée) : mêmes calculs que le tir
function predict(ang){const st={x:LX,y:LY,dx:Math.cos(ang),dy:Math.sin(ang)},pts=[[st.x,st.y]];let ev=null;
 for(let k=0;k<8&&!ev;k++){ev=sweep(st,60,(x,y)=>pts.push([x,y]));if(!ev&&st.y<-5)break}pts.push([st.x,st.y]);return{pts,ev,cell:ev?snapCell(ev):null}}
// ---------- résolution d'un placement ----------
function place(r,c,ci,star,fromX,fromY){set(r,c,{ci,star:!!star,t:0,ox:fromX-cx(r,c),oy:fromY-cy(r)});
 // impact : les voisines reculent un peu puis reviennent en place
 for(const[a,b]of neigh(r,c)){const q=get(a,b);if(q){const dx=cx(a,b)-cx(r,c),dy=cy(a)-cy(r),l=Math.hypot(dx,dy)||1;q.wx=(q.wx||0)+dx/l*.35;q.wy=(q.wy||0)+dy/l*.35}}
 fx('bpStick',1,.02);
 const grp=flood(r,c,(b)=>b.ci==ci);let popped=0,fell=0,starsFreed=0;
 if(grp.length>=3){for(const[a,b]of grp){const q=get(a,b);if(q.star)starsFreed++;BP.g[a][b]=null;popAt(a,b,q)}popped=grp.length}
 // bulles qui ne tiennent plus au plafond
 const keep=new Set();const queue=[];for(let k=0;k<cols(0);k++)if(get(0,k)){queue.push([0,k]);keep.add('0,'+k)}
 while(queue.length){const[a,b]=queue.pop();for(const[e,f]of neigh(a,b)){const k=e+','+f;if(!keep.has(k)&&get(e,f)){keep.add(k);queue.push([e,f])}}}
 each((q,a,b)=>{if(!keep.has(a+','+b)){if(q.star)starsFreed++;BP.g[a][b]=null;BP.falls.push({x:cx(a,b),y:cy(a),vx:(RNG()-.5)*8,vy:-RNG()*6-2,rot:0,vr:(RNG()-.5)*6,ci:q.ci,star:q.star,t:0});fell++}});
 while(BP.g.length&&BP.g[BP.g.length-1].every(v=>!v))BP.g.pop();
 return{popped,fell,starsFreed}}
function flood(r,c,pred){const out=[],seen=new Set([r+','+c]),st=[[r,c]];while(st.length){const[a,b]=st.pop();const q=get(a,b);if(!q||!pred(q))continue;out.push([a,b]);
 for(const[e,f]of neigh(a,b)){const k=e+','+f;if(!seen.has(k)){seen.add(k);st.push([e,f])}}}return out}
function popAt(a,b,q){const x=cx(a,b),y=cy(a);BP.pops.push({x,y,ci:q.ci,star:q.star,t:-BP.pops.filter(p=>p.t<0).length*.025});
 for(let i=0;i<7;i++){const an=RNG()*6.28,v=4+RNG()*9;BP.parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.5+RNG()*.4,ci:q.ci,s:.15+RNG()*.2})}}
// ---------- partie ----------
function loadLevel(i){BP.lvl=i;const Lv=LEVELS[i];BP.g=[];BP.off=0;BP.offA=0;BP.shots=0;BP.combo=0;BP.stars=0;BP.starsTot=0;BP.pops=[];BP.falls=[];BP.parts=[];BP.texts=[];BP.shot=null;BP.lscore=0;BP.res=null;
 Lv.map.forEach((row,r)=>{for(let c=0;c<cols(r)&&c<row.length;c++){const ch=row[c];if(ch=='.'||ch==' ')continue;const star=ch!=ch.toLowerCase(),ci=KI[ch.toLowerCase()];if(ci==null)continue;set(r,c,{ci,star,t:1,ox:0,oy:0});if(star)BP.starsTot++}});
 BP.cur=pickColor();BP.next=pickColor();BP.score0=BP.score;BP.aim=-Math.PI/2;BP.phase='intro';BP.pt=0;BP.paused=false}
function pickColor(){const c=colorsLeft();return c.length?c[Math.floor(RNG()*c.length)]:Math.floor(RNG()*3)}
function shotsLeft(){const Lv=LEVELS[BP.lvl];return Lv.obj=='score'?Math.max(0,Lv.shots-BP.shots):null}
function fire(){if(BP.phase!='play'||BP.shot||BP.paused||Math.abs(BP.offA-BP.off)>.02||BP.swapT>0)return false;const a=BP.aim;
 BP.shot={x:LX,y:LY,dx:Math.cos(a),dy:Math.sin(a),ci:BP.cur,t:0};BP.cur=BP.next;BP.next=pickColor();BP.loadT=0;BP.shots++;BP.recoil=1;fx('bpShoot',1,.03);return true}
function swap(){if(BP.phase!='play'||BP.paused||BP.swapT>0)return;const t=BP.cur;BP.cur=BP.next;BP.next=t;BP.swapT=.25;fx('bpSwap',1,.02)}
function land(ev){const s=BP.shot;BP.shot=null;const cell=snapCell(ev);if(!cell)return;
 const res=place(cell[0],cell[1],s.ci,false,ev.x,ev.y);const Lv=LEVELS[BP.lvl];
 // score : groupe, gros groupe, chute, combo
 let pts=0;if(res.popped){BP.combo++;pts+=res.popped*10+Math.max(0,res.popped-3)*15;fx('bpPop',1+Math.min(.6,res.popped*.04),.05)}else BP.combo=0;
 if(res.fell){pts+=res.fell*20+Math.floor(res.fell*res.fell*2);fx('bpDrop',1,.12)}
 const mult=BP.combo>=2?1+(BP.combo-1)*.5:1;pts=Math.round(pts*mult);BP.score+=pts;BP.lscore+=pts;BP.stars+=res.starsFreed;
 if(pts){BP.texts.push({x:cy?cx(cell[0],cell[1]):LX,y:cy(cell[0]),s:'+'+pts,t:0,big:pts>=150})}
 if(BP.combo>=2){BP.texts.push({x:BW/2,y:cy(cell[0])-2.5,s:'COMBO X'+(1+(BP.combo-1)*.5).toString().replace('.',','),t:0,big:true,c:'#ffe14f'});fx('bpCombo',1+BP.combo*.1,.08)}
 if(res.popped+res.fell>=8){BP.shake=.35;BP.flash=.25;BP.texts.push({x:BW/2,y:cy(cell[0])-4.5,s:res.popped+res.fell>=14?'INCROYABLE !':'SUPER !',t:0,big:true,c:'#7ff3ff'});burst(BW/2,cy(cell[0]),26)}
 if(res.starsFreed)fx('bpStar',1,.05);
 // fin de niveau ?
 const n=count();let win=false;if(Lv.obj=='clear')win=n==0;else if(Lv.obj=='stars')win=BP.stars>=BP.starsTot;else win=BP.lscore>=Lv.goal||n==0;
 if(win){// bonus : bulles restantes qui tombent, tirs non utilisés
  let bonus=0;each((q,a,b)=>{BP.g[a][b]=null;BP.falls.push({x:cx(a,b),y:cy(a),vx:(RNG()-.5)*8,vy:-RNG()*4,rot:0,vr:(RNG()-.5)*6,ci:q.ci,star:q.star,t:0});bonus+=20});BP.g=[];
  if(n==0||Lv.obj!='clear')bonus+=500;if(Lv.obj=='score')bonus+=shotsLeft()*30;BP.score+=bonus;BP.lscore+=bonus;BP.bonus=bonus;endLevel(true);return}
 // descente du plafond
 const Ld=Lv.drop;if(Ld&&BP.shots%Ld==0){BP.off++;fx('bpCeil',1,.06);BP.shake=Math.max(BP.shake,.2)}
 // défaite : une bulle franchit la ligne rouge, ou plus de tirs
 let low=-1;each((q,a)=>{low=Math.max(low,a)});if(low>=0&&low+BP.off>=MAXR){endLevel(false);return}
 if(Lv.obj=='score'&&shotsLeft()<=0){endLevel(false);return}
 if(!colorsLeft().includes(BP.cur))BP.cur=pickColor();if(!colorsLeft().includes(BP.next))BP.next=pickColor()}
function endLevel(win){BP.phase=win?'won':'lost';BP.pt=0;BP.shot=null;try{BP.api&&BP.api.record(BP.score)}catch(e){}
 if(win){try{BP.api&&BP.api.saveLevel(Math.min(NL,BP.lvl+2))}catch(e){}const d=data();d.done=Math.max(d.done||0,BP.lvl+1);try{BP.api&&BP.api.save()}catch(e){}fx('bpWin',1,.2);burst(BW/2,10,60)}
 else{fx('bpLose',1,.2);each((q,a,b)=>{q.gray=1})}}
function burst(x,y,n){const C=['#ff5d8f','#ffd93d','#3fa9ff','#4cd97b','#a66bff','#ffffff'];for(let i=0;i<n;i++){const a=RNG()*6.28,v=6+RNG()*20;BP.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-6,l:1+RNG()*1.2,c:C[i%6],s:.18+RNG()*.25,conf:1,rot:RNG()*6,vr:(RNG()-.5)*10})}}
// ---------- mise à jour ----------
function update(dt,inp){dt=Math.min(dt,.05);inp=inp||{};BP.t+=dt;BP.pt+=dt;
 const n=inp.okN||0,ok=BP.okN!=null&&n>BP.okN;BP.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 // clavier : gauche/droite = viser, haut = échanger, OK = tirer / valider
 if(BP.phase=='play'&&!BP.paused){const k=(inp.right?1:0)-(inp.left?1:0);if(k)BP.aim=clampAim(BP.aim+k*dt*1.6);if(q.includes('up'))swap();if(ok)fire()}
 else if(ok)keyOk(q);else if(q.length)keyNav(q);
 if(BP.paused){music();return}
 if(BP.phase=='intro'&&BP.pt>1.8)BP.phase='play';
 // tir en vol : balayage exact sur la distance parcourue pendant l'image
 if(BP.shot){const s=BP.shot;s.t+=dt;const ev=sweep(s,SPEED*dt,()=>fx('bpBounce',1,.02));if(ev)land(ev);else if(s.y<-3)BP.shot=null}
 BP.offA=lerp(BP.offA,BP.off,Math.min(1,dt*8));if(Math.abs(BP.offA-BP.off)<.002)BP.offA=BP.off;
 if(BP.swapT>0)BP.swapT=Math.max(0,BP.swapT-dt);if(BP.recoil>0)BP.recoil=Math.max(0,BP.recoil-dt*5);BP.loadT=(BP.loadT||0)+dt;
 // bulles : rebond d'accroche et petites oscillations d'impact
 each(b=>{b.t=Math.min(1,(b.t||0)+dt*4);const k=Math.pow(.002,dt);b.ox=(b.ox||0)*k;b.oy=(b.oy||0)*k;if(b.wx||b.wy){b.wx*=Math.pow(.01,dt);b.wy*=Math.pow(.01,dt);if(Math.abs(b.wx)+Math.abs(b.wy)<.002)b.wx=b.wy=0}});
 for(const p of BP.pops)p.t+=dt;BP.pops=BP.pops.filter(p=>p.t<.3);
 for(const f of BP.falls){f.vy+=70*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;f.t+=dt;if(f.x<1||f.x>BW-1){f.vx=-f.vx*.6;f.x=cl(f.x,1,BW-1)}}BP.falls=BP.falls.filter(f=>f.y<LY+8);
 for(const p of BP.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.conf?14:22)*dt;p.vx*=Math.pow(.4,dt);p.l-=dt;if(p.rot!=null)p.rot+=p.vr*dt}BP.parts=BP.parts.filter(p=>p.l>0);
 for(const t of BP.texts)t.t+=dt;BP.texts=BP.texts.filter(t=>t.t<1.3);
 if(BP.shake>0)BP.shake=Math.max(0,BP.shake-dt);if(BP.flash>0)BP.flash=Math.max(0,BP.flash-dt);
 for(const b of BP.bg){b.y-=b.v*dt;b.x+=Math.sin(BP.t*.6+b.p)*.08;if(b.y<-b.r*2){b.y=BP.H+b.r*2;b.x=RNG()*BP.W}}
 if(BP.phase=='won'&&BP.pt>.2&&Math.floor(BP.pt*4)!=Math.floor((BP.pt-dt)*4)&&BP.pt<3)burst(2+RNG()*(BW-4),4+RNG()*10,14);
 music()}
function clampAim(a){// visée vers le haut uniquement, entre 11,5° et 168,5° au-dessus de l'horizontale
 if(a>0)a=a>Math.PI/2?-Math.PI+AMIN:-AMIN;return cl(a,-Math.PI+AMIN,-AMIN)}
function keyOk(q){const ph=BP.phase;if(ph=='title')startAt(BP.sel);else if(ph=='intro')BP.phase='play';else if(ph=='won'&&BP.pt>.8)nextLevel();else if(ph=='lost'&&BP.pt>.8)retry()}
function keyNav(q){if(BP.phase=='title'){for(const d of q){const u=unlocked();if(d=='right')BP.sel=Math.min(u-1,BP.sel+1);if(d=='left')BP.sel=Math.max(0,BP.sel-1);if(d=='down')BP.sel=Math.min(u-1,BP.sel+4);if(d=='up')BP.sel=Math.max(0,BP.sel-4)}}}
function startAt(i){BP.score=0;fx('bpSelect');loadLevel(cl(i,0,unlocked()-1))}
function nextLevel(){if(BP.lvl+1>=NL){BP.phase='title';BP.sel=NL-1;return}loadLevel(BP.lvl+1)}
function retry(){BP.score=BP.score0;loadLevel(BP.lvl)}
let MUS=null;function music(){try{if(typeof JEUSON=='undefined')return;if(MUS!=='bubble'){JEUSON.music('bubble');MUS='bubble'}JEUSON.level(BP.mute?0:BP.paused?.35:1)}catch(e){}}
// ---------- mise en page ----------
function layout(w,h){let cpp=1.4;try{cpp=AX.cv.getBoundingClientRect().width/AX.L.W||1.4}catch(e){}const u=v=>v/cpp;const L={w,h};
 const m=Math.max(4,Math.round(u(10))),bh=Math.max(18,Math.round(u(40))),land=w>h*1.05;L.land=land;L.m=m;
 L.hud={h:bh+m*2};L.pause={x:m,y:m,w:bh,h:bh};L.snd={x:w-m-bh,y:m,w:bh,h:bh};
 // zone de jeu : 18 unités de large, du plafond au lanceur (~26 unités)
 // en paysage l'objectif passe sur le côté : tout l'espace vertical va au plateau
 const chip=land?Math.round(u(6)):Math.round(u(24)),top=L.hud.h+chip+m,bottomRoom=Math.max(Math.round(u(14)),m*2),availH=h-top-bottomRoom,unitsH=LY+3.2;
 let k=Math.min((land?w-2*Math.max(Math.round(u(170)),w*.2):w-2*m)/BW,availH/unitsH);k=Math.max(2,k);L.k=k;
 // plateau centré dans la hauteur disponible (pas de grande bande vide en bas en portrait)
 const free=Math.max(0,availH-unitsH*k);L.ox=Math.round(w/2-BW*k/2);L.oy=Math.round(top+free*.45);L.bw=BW*k;
 L.objY=land?null:Math.round(L.oy-m-11);L.objSide=land?{x:Math.round(L.ox/2),y:Math.round(h/2)}:null;
 // bulle suivante : à droite du lanceur
 const lx=L.ox+LX*k,ly=L.oy+LY*k;L.nextB={x:Math.round(lx+k*4.6),y:Math.round(ly+k*.4),r:Math.round(Math.min(k*1.9,Math.max(u(22),k*1.15)))};
 if(land){L.side={l:L.ox,r:L.ox+L.bw}}
 BP.L=L;BP.W=w;BP.H=h;BP.spr={};BP.bg=[];for(let i=0;i<14;i++)BP.bg.push({x:RNG()*w,y:RNG()*h,r:4+RNG()*Math.max(10,k*2.2),v:4+RNG()*10,p:RNG()*6,c:COL[i%6].c})}
const SX=x=>BP.L.ox+x*BP.L.k,SY=y=>BP.L.oy+y*BP.L.k;
// ---------- sprites de bulles (brillantes, légèrement translucides) ----------
function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return'#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
function star(g,x,y,r){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath()}
function bubble(ci,px,st,gray){const k=ci+'|'+px+'|'+(st?1:0)+(gray?'g':'');let cv=BP.spr[k];if(cv)return cv;const S=Math.ceil(px*2)+4;cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
 g.translate(S/2,S/2);g.scale(px,px);const base=gray?'#8a86a0':COL[ci].c;
 const gr=g.createRadialGradient(-.3,-.38,.05,0,0,1);gr.addColorStop(0,shade(base,.6));gr.addColorStop(.45,base);gr.addColorStop(.88,shade(base,-.18));gr.addColorStop(1,shade(base,-.35));
 g.globalAlpha=.93;g.fillStyle=gr;g.beginPath();g.arc(0,0,.97,0,7);g.fill();g.globalAlpha=1;
 g.lineWidth=Math.max(1,px*.07)/px;g.strokeStyle=shade(base,-.45);g.beginPath();g.arc(0,0,.97,0,7);g.stroke();
 g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=.09;g.beginPath();g.arc(0,0,.78,.6,2.6);g.stroke();
 g.fillStyle='rgba(255,255,255,.88)';g.beginPath();g.ellipse(-.36,-.42,.3,.17,-.65,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(.05,-.62,.08,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(.35,.5,.3,.12,-.6,0,7);g.fill();
 if(st){g.fillStyle='#ffffff';g.strokeStyle=shade(base,-.5);g.lineWidth=.08;star(g,0,.06,.52);g.fill();g.stroke();g.fillStyle=shade(base,.3);star(g,0,.06,.22);g.fill()}
 cv.o=S/2;BP.spr[k]=cv;return cv}
function drawB(x,ci,X,Y,px,st,sc,a,gray){const r=Math.max(2,Math.round(px)),c=bubble(ci,r,st,gray);if(sc==null||sc==1){if(a!=null)x.globalAlpha=a;x.drawImage(c,Math.round(X-c.o),Math.round(Y-c.o));x.globalAlpha=1;return}
 x.save();x.translate(X,Y);x.scale(sc,sc);if(a!=null)x.globalAlpha=a;x.drawImage(c,-c.o,-c.o);x.restore()}
// ---------- rendu ----------
function rr(x,X,Y,W,H,r){r=Math.min(r,W/2,H/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
function background(x,L){const g=x.createLinearGradient(0,0,0,L.h);g.addColorStop(0,'#2a1a5e');g.addColorStop(.55,'#4a2a86');g.addColorStop(1,'#ff7eb6');x.fillStyle=g;x.fillRect(0,0,L.w,L.h);
 for(const b of BP.bg){x.globalAlpha=.16;x.fillStyle=b.c;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill();x.globalAlpha=.35;x.fillStyle='#ffffff';x.beginPath();x.arc(b.x-b.r*.35,b.y-b.r*.35,b.r*.22,0,7);x.fill()}x.globalAlpha=1}
function board(x,L){const k=L.k,X=L.ox,Y=L.oy,W=L.bw,H=(LY+2.4)*k;
 // vitre du plateau : verre dépoli pastel
 x.fillStyle='rgba(18,8,40,.55)';rr(x,X-4,Y-4,W+8,H+8,Math.max(6,k*.8));x.fill();const g=x.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,'rgba(120,90,220,.35)');g.addColorStop(1,'rgba(255,140,200,.25)');x.fillStyle=g;rr(x,X,Y,W,H,Math.max(4,k*.6));x.fill();
 x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;rr(x,X+.5,Y+.5,W-1,H-1,Math.max(4,k*.6));x.stroke();
 // plafond (descend) : bandeau berlingot
 const cyT=Y+BP.offA*ROWH*k;x.save();x.beginPath();x.rect(X,Y,W,cyT-Y+Math.max(3,k*.35));x.clip();const cg=x.createLinearGradient(0,Y,0,cyT);cg.addColorStop(0,'#3a2470');cg.addColorStop(1,'#6a3ab0');x.fillStyle=cg;x.fillRect(X,Y,W,cyT-Y+k);
 const sw=Math.max(4,k*.9);x.fillStyle='rgba(255,255,255,.18)';for(let i=-2;i<W/sw+2;i+=2){x.beginPath();x.moveTo(X+i*sw,cyT+k*.35);x.lineTo(X+(i+1)*sw,cyT+k*.35);x.lineTo(X+(i+1)*sw-k,Y);x.lineTo(X+i*sw-k,Y);x.closePath();x.fill()}x.restore();
 R_(x,X,cyT,W,Math.max(2,k*.3),'#ffd0ea');
 // indicateur de descente du plafond
 // ligne de danger
 const dy=SY(DANGER);x.strokeStyle=BP.phase=='lost'?'#ff3b5a':'rgba(255,80,120,.65)';x.setLineDash([Math.max(3,k*.5),Math.max(3,k*.4)]);x.lineWidth=Math.max(1,k*.12);x.beginPath();x.moveTo(X+2,dy);x.lineTo(X+W-2,dy);x.stroke();x.setLineDash([])}
function grid(x,L){const k=L.k;const sh=BP.shake>0?Math.round(Math.sin(BP.t*80)*BP.shake*k*.6):0;x.save();x.translate(sh,0);
 const off=BP.offA;for(let r=0;r<BP.g.length;r++)for(let c=0;c<cols(r);c++){const b=BP.g[r][c];if(!b)continue;const s=b.t<1?1+Math.sin(b.t*Math.PI)*.12:1;
  drawB(x,b.ci,SX(cx(r,c)+(b.ox||0)+(b.wx||0)),SY(1+(r+off)*ROWH+(b.oy||0)+(b.wy||0)),k,b.star,s,null,b.gray&&BP.phase=='lost'&&BP.pt>.15)}
 x.restore()}
function aimLine(x,L){if(BP.phase!='play'||BP.shot||BP.paused)return;const P=predict(BP.aim),k=L.k;BP.pred=P;
 // pointillés lumineux le long de la trajectoire (rebonds compris), défilement
 x.fillStyle='#ffffff';const step=1.1,ph=(BP.t*4)%1;let acc=-ph*step;for(let i=1;i<P.pts.length;i++){const[a0,b0]=P.pts[i-1],[a1,b1]=P.pts[i],seg=Math.hypot(a1-a0,b1-b0);
  while(acc<seg){if(acc>=0){const t=acc/seg,X=SX(a0+(a1-a0)*t),Y=SY(b0+(b1-b0)*t),fade=1-Math.min(1,(i-1)*.25);x.globalAlpha=.85*fade;x.beginPath();x.arc(X,Y,Math.max(1,k*.16),0,7);x.fill()}acc+=step}acc-=seg}x.globalAlpha=1;
 // case d'arrivée prévue
 if(P.cell){const X=SX(cx(P.cell[0],P.cell[1])),Y=SY(cy(P.cell[0]));x.strokeStyle=COL[BP.cur].c;x.globalAlpha=.6+.3*Math.sin(BP.t*8);x.lineWidth=Math.max(1,k*.12);x.setLineDash([Math.max(2,k*.35),Math.max(2,k*.25)]);x.beginPath();x.arc(X,Y,k*.92,0,7);x.stroke();x.setLineDash([]);x.globalAlpha=1}}
function launcher(x,L){const k=L.k,X=SX(LX),Y=SY(LY),a=BP.aim,rc=(BP.recoil||0)*k*.5;
 // socle
 x.fillStyle='rgba(20,8,40,.5)';x.beginPath();x.ellipse(X,Y+k*1.3,k*2.6,k*.7,0,0,7);x.fill();
 const bg=x.createLinearGradient(0,Y-k,0,Y+k*1.6);bg.addColorStop(0,'#ffd0ea');bg.addColorStop(1,'#c45aa0');x.fillStyle=bg;x.beginPath();x.arc(X,Y+k*.5,k*1.7,Math.PI,0);x.lineTo(X+k*1.7,Y+k*1.2);x.lineTo(X-k*1.7,Y+k*1.2);x.closePath();x.fill();
 x.strokeStyle='#7a2a6a';x.lineWidth=Math.max(1,k*.12);x.stroke();
 // canon orientable
 x.save();x.translate(X,Y);x.rotate(a+Math.PI/2);x.translate(0,rc);const cg=x.createLinearGradient(-k*.7,0,k*.7,0);cg.addColorStop(0,'#6a3ab0');cg.addColorStop(.5,'#b89aff');cg.addColorStop(1,'#5a2a98');x.fillStyle=cg;rr(x,-k*.62,-k*2.7,k*1.24,k*2.4,k*.4);x.fill();x.strokeStyle='#3a1a70';x.stroke();
 x.fillStyle='#ffd93d';x.fillRect(-k*.62,-k*2.5,k*1.24,Math.max(1,k*.22));x.restore();
 // bulle chargée (petite animation d'arrivée) et bulle suivante
 const ld=Math.min(1,(BP.loadT||1)*5),sw=BP.swapT>0?1-BP.swapT/.25:1;const nb=L.nextB;
 if(BP.phase=='play'||BP.phase=='intro'){
  if(BP.swapT>0){const t=sw,mx=lerp(nb.x,X,t),my=lerp(nb.y,Y,t)-Math.sin(t*Math.PI)*k*1.5,nx=lerp(X,nb.x,t),ny=lerp(Y,nb.y,t)+Math.sin(t*Math.PI)*k;drawB(x,BP.cur,mx,my,k,false,lerp(.75,1,t));drawB(x,BP.next,nx,ny,k,false,lerp(1,.75,t))}
  else{drawB(x,BP.cur,X,Y,k,false,.4+.6*ld);drawB(x,BP.next,nb.x,nb.y,k,false,.75)}}
 // pastille SUIVANTE (on peut la toucher pour échanger)
 x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1;x.setLineDash([2,2]);x.beginPath();x.arc(nb.x,nb.y,nb.r,0,7);x.stroke();x.setLineDash([]);
 CT(x,'ÉCHANGE',nb.x,nb.y+nb.r+10<L.h-L.m?nb.y+nb.r+3:nb.y-nb.r-10,'#ffd0ea',1,'#2a1a5e');
 // tirs restants (niveau à score)
 const sl=shotsLeft();if(sl!=null){const tx=X-k*4.6;CT(x,String(sl),tx,Y-4,sl<=5?'#ff5d8f':'#ffffff',L.k>=10?2:1,'#2a1a5e');CT(x,'TIRS',tx,Y+(L.k>=10?12:6),'#ffd0ea',1,'#2a1a5e')}}
function effects(x,L){const k=L.k;
 for(const f of BP.falls){x.save();x.translate(SX(f.x),SY(f.y));x.rotate(f.rot);drawB(x,f.ci,0,0,k,f.star,1,Math.max(0,1-Math.max(0,f.y-LY)/6));x.restore()}
 if(BP.shot){const s=BP.shot;// traînée
  for(let i=1;i<=3;i++){x.globalAlpha=.18/i;x.fillStyle=COL[s.ci].c;x.beginPath();x.arc(SX(s.x-s.dx*i*.7),SY(s.y-s.dy*i*.7),k*(1-i*.15),0,7);x.fill()}x.globalAlpha=1;drawB(x,s.ci,SX(s.x),SY(s.y),k)}
 for(const p of BP.pops){if(p.t<0){drawB(x,p.ci,SX(p.x),SY(p.y),k,p.star);continue}const t=p.t/.3;drawB(x,p.ci,SX(p.x),SY(p.y),k,p.star,1+t*.5,1-t);
  x.strokeStyle=COL[p.ci].c;x.globalAlpha=1-t;x.lineWidth=Math.max(1,k*.2*(1-t));x.beginPath();x.arc(SX(p.x),SY(p.y),k*(1+t*1.2),0,7);x.stroke();x.globalAlpha=1}
 for(const p of BP.parts){x.globalAlpha=Math.min(1,p.l*2);x.fillStyle=p.c||COL[p.ci].c;if(p.conf){x.save();x.translate(SX(p.x),SY(p.y));x.rotate(p.rot);x.fillRect(-p.s*k,-p.s*k*.5,p.s*k*2,p.s*k);x.restore()}else{x.beginPath();x.arc(SX(p.x),SY(p.y),Math.max(1,p.s*k),0,7);x.fill()}}x.globalAlpha=1;
 for(const t of BP.texts){const a=t.t<.15?t.t/.15:1-Math.max(0,t.t-.8)/.5,sc=t.big&&L.k>=9?2:1;x.globalAlpha=cl(a,0,1);CT(x,t.s,cl(SX(t.x),TW(t.s,sc)/2+2,L.w-TW(t.s,sc)/2-2),Math.round(SY(t.y)-t.t*k*2.2),t.c||'#ffffff',sc,'#2a1a5e')}x.globalAlpha=1;
 if(BP.flash>0){x.globalAlpha=BP.flash*.6;x.fillStyle='#ffffff';x.fillRect(0,0,L.w,L.h);x.globalAlpha=1}}
function icon(x,b,kind,on){x.fillStyle=on?'#ffffff':'rgba(30,14,70,.8)';rr(x,b.x,b.y,b.w,b.h,Math.max(4,b.w*.25));x.fill();x.strokeStyle='#ffd0ea';x.lineWidth=1;rr(x,b.x+.5,b.y+.5,b.w-1,b.h-1,Math.max(4,b.w*.25));x.stroke();
 const c=on?'#2a1a5e':'#ffffff',X=b.x+b.w/2,Y=b.y+b.h/2,s=b.w*.18;x.fillStyle=c;
 if(kind=='pause'){x.fillRect(Math.round(X-s*1.3),Math.round(Y-s*1.5),Math.round(s*.9),Math.round(s*3));x.fillRect(Math.round(X+s*.4),Math.round(Y-s*1.5),Math.round(s*.9),Math.round(s*3))}
 else{x.beginPath();x.moveTo(X-s*1.8,Y-s*.7);x.lineTo(X-s*.9,Y-s*.7);x.lineTo(X+s*.2,Y-s*1.7);x.lineTo(X+s*.2,Y+s*1.7);x.lineTo(X-s*.9,Y+s*.7);x.lineTo(X-s*1.8,Y+s*.7);x.closePath();x.fill();x.strokeStyle=c;x.lineWidth=Math.max(1,s*.4);
  if(BP.mute){x.beginPath();x.moveTo(X+s*.8,Y-s*.8);x.lineTo(X+s*2,Y+s*.8);x.moveTo(X+s*2,Y-s*.8);x.lineTo(X+s*.8,Y+s*.8);x.stroke()}else{x.beginPath();x.arc(X+s*.4,Y,s*1,-.8,.8);x.stroke();x.beginPath();x.arc(X+s*.4,Y,s*1.8,-.8,.8);x.stroke()}}}
function hud(x,L){const g=x.createLinearGradient(0,0,0,L.hud.h);g.addColorStop(0,'rgba(20,8,48,.95)');g.addColorStop(1,'rgba(20,8,48,.7)');x.fillStyle=g;x.fillRect(0,0,L.w,L.hud.h);R_(x,0,L.hud.h-1,L.w,1,'#ff9ad0');
 icon(x,L.pause,'pause',BP.touch&&BP.touch.btn=='pause');icon(x,L.snd,'snd',BP.touch&&BP.touch.btn=='snd');
 const x0=L.pause.x+L.pause.w+6,x1=L.snd.x-6,mid=(x0+x1)/2,sp=x1-x0,best=Math.max(data().best||0,BP.score),y=Math.round(L.hud.h/2);
 const items=[['NIVEAU',(BP.phase=='title'?'-':String(BP.lvl+1))+'/'+NL],['SCORE',pad(BP.score,5)],['MEILLEUR',pad(best,5)]];
 const sc=sp>=TW('MEILLEUR 00000',2)*1.9&&L.hud.h>=30?2:1;const cw=sp/3;
 if(cw>=TW('MEILLEUR',1)+4){items.forEach((it,i)=>{const X=x0+cw*(i+.5);CT(x,it[0],X,y-(sc==2?10:9),'#c9b0ff',1);CT(x,it[1],X,y+(sc==2?0:1),i==1?'#ffe14f':'#ffffff',sc)})}
 else CT(x,'N'+(BP.lvl+1)+' · '+pad(BP.score,5),mid,y-3,'#ffe14f')}
function objective(x,L){if(BP.phase=='title')return;const Lv=LEVELS[BP.lvl];let a,b;
 if(Lv.obj=='clear'){a='ÉCLATE TOUT';b=count()+' BULLES'}else if(Lv.obj=='stars'){a='LIBÈRE LES ÉTOILES';b=BP.stars+'/'+BP.starsTot}else{a='OBJECTIF '+Lv.goal+' PTS';b=Math.min(BP.lscore,Lv.goal)+'/'+Lv.goal}
 // compte à rebours du plafond (rouge quand il descend au prochain tir ou au suivant)
 const left=Lv.drop?Lv.drop-BP.shots%Lv.drop:0,cs=left?'PLAFOND : '+left:'',cc=left&&left<=2?(Math.floor(BP.t*6)%2?'#ff5d8f':'#ffffff'):'#ffd0ea';
 if(L.objSide){const o=L.objSide,lines=[[a,'#c9b0ff'],[b,Lv.obj=='stars'?'#ffe14f':'#ffffff'],cs?[cs,cc]:null].filter(Boolean),w=Math.min(L.ox-2*L.m,Math.max(...lines.map(l=>TW(l[0])))+16),h=lines.length*12+10;
  x.fillStyle='rgba(20,8,48,.7)';rr(x,o.x-w/2,o.y-h/2,w,h,8);x.fill();lines.forEach((l,i)=>CT(x,l[0],o.x,Math.round(o.y-h/2+6+i*12),l[1]));return}
 let s=a+' · '+b;if(cs&&TW(s+' · '+cs)+16<=L.w-2*L.m)s+=' · '+cs;else if(cs)s=b+' · '+cs;
 const w=TW(s)+14,X=Math.round(L.w/2-w/2);x.fillStyle='rgba(20,8,48,.7)';rr(x,X,L.objY-4,w,15,7);x.fill();CT(x,s,L.w/2,L.objY,left&&left<=2?cc:Lv.obj=='stars'?'#ffe14f':'#ffffff')}
// ---------- panneaux ----------
function panel(x,w,h,col){const L=BP.L,W=Math.min(w,L.w-2*L.m),X=Math.round(L.w/2-W/2),Y=Math.round(cl(L.oy+(LY*L.k)/2-h/2,L.hud.h+4,L.h-h-L.m));x.fillStyle='rgba(16,6,40,.94)';rr(x,X,Y,W,h,10);x.fill();
 x.strokeStyle=col||'#ff9ad0';x.lineWidth=2;rr(x,X+1,Y+1,W-2,h-2,10);x.stroke();return{X,Y,w:W,h,cx:X+W/2}}
function btn(x,b,lab,col){const hi=BP.touch&&BP.touch.btnId!=null&&BP.touch.hit===b;x.fillStyle=hi?'#ffffff':col;rr(x,b.x,b.y,b.w,b.h,Math.min(10,b.h/2));x.fill();x.fillStyle='rgba(255,255,255,.3)';x.fillRect(b.x+6,b.y+2,b.w-12,1);CT(x,lab,b.x+b.w/2,Math.round(b.y+(b.h-7)/2),hi?'#2a1a5e':'#ffffff',1,hi?null:'rgba(0,0,0,.35)');BP.btns.push(b)}
function bsize(){const L=BP.L;let cpp=1.4;try{cpp=AX.cv.getBoundingClientRect().width/AX.L.W||1.4}catch(e){}return Math.max(18,Math.round(44/cpp))}
function title(x,L){const bh=bsize(),cols4=4,u=unlocked(),cw=Math.max(bh,Math.min(54,Math.floor((L.w-2*L.m-40)/cols4))),h=40+Math.ceil(NL/cols4)*(cw+6)+bh+40;const P=panel(x,cols4*(cw+6)+36,h,'#ffd93d');let y=P.Y+10;
 const sc=P.w>=TW('BUBBLE POP',3)+16?3:2;CT(x,'BUBBLE',P.cx-TW('POP',sc)/2-3,y,'#ff9ad0',sc,'#5a1a6a');CT(x,'POP',P.cx+TW('BUBBLE',sc)/2+3,y,'#7ff3ff',sc,'#1a3a8a');y+=sc*8+8;
 CT(x,'CHOISIS UN NIVEAU',P.cx,y,'#c9b0ff');y+=12;const ox=Math.round(P.cx-(cols4*(cw+6)-6)/2);
 for(let i=0;i<NL;i++){const X=ox+(i%cols4)*(cw+6),Y=y+Math.floor(i/cols4)*(cw+6),lock=i>=u,b={x:X,y:Y,w:cw,h:cw,id:'lvl',i};
  x.fillStyle=lock?'rgba(255,255,255,.08)':i==BP.sel?'#ffffff':'rgba(255,255,255,.18)';rr(x,X,Y,cw,cw,8);x.fill();
  if(!lock){drawB(x,i%6,X+cw/2,Y+cw/2-2,Math.max(4,cw*.3),false);CT(x,String(i+1),X+cw/2,Math.round(Y+cw/2-5),'#ffffff',cw>=30?2:1,'#2a1a5e');if((data().done||0)>i)CT(x,'OK',X+cw/2,Y+cw-9,'#7dff9a')}
  else{x.fillStyle='rgba(255,255,255,.35)';const s=cw*.16;x.fillRect(X+cw/2-s,Y+cw/2-s*.3,s*2,s*1.6);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(1,s*.4);x.beginPath();x.arc(X+cw/2,Y+cw/2-s*.3,s*.7,Math.PI,0);x.stroke()}
  if(!lock)BP.btns.push(b)}
 y+=Math.ceil(NL/cols4)*(cw+6)+6;btn(x,{x:P.cx-70,y,w:140,h:bh,id:'play'},'JOUER · NIVEAU '+(BP.sel+1),'#2fa858')}
function introCard(x,L){const Lv=LEVELS[BP.lvl],a=Math.min(1,BP.pt*4,(1.8-BP.pt)*4);if(a<=0)return;x.globalAlpha=a;const P=panel(x,Math.min(260,L.w-20),74,'#7ff3ff');
 CT(x,'NIVEAU '+(BP.lvl+1),P.cx,P.Y+10,'#ffe14f',2,'#2a1a5e');CT(x,Lv.nom,P.cx,P.Y+30,'#ffffff');
 CT(x,Lv.obj=='clear'?'ÉCLATE TOUTES LES BULLES':Lv.obj=='stars'?'LIBÈRE LES '+BP.starsTot+' ÉTOILES':'FAIS '+Lv.goal+' POINTS EN '+Lv.shots+' TIRS',P.cx,P.Y+44,'#7ff3ff');
 if(Lv.drop)CT(x,'LE PLAFOND DESCEND TOUS LES '+Lv.drop+' TIRS',P.cx,P.Y+57,'#ff9ad0');x.globalAlpha=1}
function endCard(x,L,win){const bh=bsize(),t=BP.pt,P=panel(x,Math.min(250,L.w-2*L.m),win?118+bh*2:96+bh*2,win?'#7dff9a':'#ff5d8f');let y=P.Y+12;const sc=P.w>=TW('BRAVO !',3)+10?3:2;
 const bounce=win?Math.round(Math.abs(Math.sin(t*5))*Math.max(0,3-t)*2):0;
 CT(x,win?'BRAVO !':'PERDU...',P.cx,y-bounce,win?['#ffe14f','#ff9ad0','#7ff3ff'][Math.floor(t*6)%3]:'#ff9ad0',sc,'#2a1a5e');y+=sc*8+10;
 CT(x,win?'NIVEAU '+(BP.lvl+1)+' RÉUSSI':(LEVELS[BP.lvl].obj=='score'&&shotsLeft()<=0?'PLUS DE TIRS':'LES BULLES ONT ATTEINT LA LIGNE'),P.cx,y,'#ffffff');y+=13;
 if(win&&BP.bonus){CT(x,'BONUS +'+BP.bonus,P.cx,y,'#7dff9a');y+=12}CT(x,'SCORE '+pad(BP.score,5),P.cx,y,'#ffe14f',2,'#2a1a5e');y+=24;
 const bw=P.w-30;if(t>.6){if(win){btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'next'},BP.lvl+1<NL?'NIVEAU SUIVANT':'TERMINER','#2fa858');y+=bh+8;btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'retry'},'REJOUER CE NIVEAU','#7a3ab0')}
  else{btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'retry'},'RECOMMENCER','#2fa858');y+=bh+8;btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'menu'},'CHOIX DU NIVEAU','#7a3ab0')}}}
function pauseCard(x,L){const bh=bsize(),P=panel(x,Math.min(240,L.w-2*L.m),34+4*(bh+8)+8,'#7ff3ff');let y=P.Y+10;CT(x,'PAUSE',P.cx,y,'#ffffff',2,'#2a1a5e');y+=26;const bw=P.w-30;
 btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'resume'},'REPRENDRE','#2fa858');y+=bh+8;btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'mute'},BP.mute?'SON : COUPÉ':'SON : ACTIVÉ','#3f7bd9');y+=bh+8;
 btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'retry'},'RECOMMENCER LE NIVEAU','#7a3ab0');y+=bh+8;btn(x,{x:P.cx-bw/2,y,w:bw,h:bh,id:'quit'},'RETOUR À LA BORNE','#c0306a')}
function draw(x,w,h){if(w!==BP.W||h!==BP.H||!BP.L){BP.touch=null;BP.aiming=false;layout(w,h)}const L=BP.L;BP.btns=[];x.imageSmoothingEnabled=true;
 background(x,L);board(x,L);
 if(BP.phase!='title'){grid(x,L);aimLine(x,L);launcher(x,L);effects(x,L)}
 hud(x,L);objective(x,L);
 if(BP.phase=='title')title(x,L);else if(BP.phase=='intro')introCard(x,L);else if(BP.phase=='won')endCard(x,L,true);else if(BP.phase=='lost')endCard(x,L,false);
 if(BP.paused){x.globalAlpha=.5;x.fillStyle='#0a0420';x.fillRect(0,L.hud.h,L.w,L.h);x.globalAlpha=1;pauseCard(x,L)}}
// ---------- toucher : viser en glissant le doigt, lâcher pour tirer ----------
const inB=(b,px,py,m)=>b&&px>=b.x-(m||0)&&px<b.x+b.w+(m||0)&&py>=b.y-(m||0)&&py<b.y+b.h+(m||0);
function aimTo(px,py){const L=BP.L;const X=SX(LX),Y=SY(LY);let a=Math.atan2(py-Y,px-X);BP.aim=clampAim(a)}
function pointer(type,px,py,id){const L=BP.L;if(!L)return;
 if(type=='down'){if(BP.touch&&BP.touch.id!=null&&BP.touch.id!==id)return;// un seul doigt à la fois
  if(inB(L.pause,px,py,4)&&BP.phase!='title'){BP.touch={id,btn:'pause'};return}if(inB(L.snd,px,py,4)){BP.touch={id,btn:'snd'};return}
  for(const b of BP.btns)if(inB(b,px,py,2)){BP.touch={id,btnId:b.id,hit:b};return}
  if(BP.paused)return;
  if(BP.phase=='intro'){BP.phase='play';BP.touch={id,skip:1};return}
  if(BP.phase=='play'){const nb=L.nextB;if(Math.hypot(px-nb.x,py-nb.y)<nb.r+6||Math.hypot(px-SX(LX),py-SY(LY))<L.k*1.3){BP.touch={id,swap:1};return}
   BP.touch={id,aim:1};BP.aiming=true;aimTo(px,py)}return}
 const T=BP.touch;if(!T||T.id!==id)return;
 if(type=='move'){if(T.aim)aimTo(px,py);return}
 if(type=='up'||type=='cancel'){BP.touch=null;
  if(T.btn=='pause'&&inB(L.pause,px,py,8)){BP.paused=!BP.paused;fx('bpSelect');return}
  if(T.btn=='snd'&&inB(L.snd,px,py,8)){toggleMute();return}
  if(T.btnId){if(inB(T.hit,px,py,6))press(T.hit);return}
  if(T.swap){swap();return}
  if(T.aim){BP.aiming=false;if(type=='up'){aimTo(px,py);fire()}}}}
function toggleMute(){BP.mute=!BP.mute;const d=data();d.mute=BP.mute;try{BP.api&&BP.api.save()}catch(e){}if(!BP.mute)fx('bpSelect');music()}
function press(b){fx('bpSelect');const id=b.id;if(id=='lvl'){BP.sel=b.i}else if(id=='play')startAt(BP.sel);else if(id=='resume')BP.paused=false;else if(id=='mute')toggleMute();
 else if(id=='retry'){BP.paused=false;retry()}else if(id=='quit'){exit()}else if(id=='next')nextLevel();else if(id=='menu'){BP.phase='title';BP.sel=BP.lvl}}
function exit(){try{if(BP.score>0)BP.api.record(BP.score)}catch(e){}const a=BP.api;if(a)a.exit()}
// ---------- module ----------
const Bubble={start(api){BP.api=api;BP.phase='title';BP.t=0;BP.pt=0;BP.okN=null;BP.L=null;BP.W=0;BP.H=0;BP.g=[];BP.pops=[];BP.falls=[];BP.parts=[];BP.texts=[];BP.shot=null;BP.paused=false;BP.touch=null;BP.score=0;
  BP.mute=!!data().mute;BP.sel=unlocked()-1;RNG=Math.random;MUS=null;music()},
 update,draw,pointer,
 resize(){BP.touch=null;BP.aiming=false;BP.L=null},
 stop(){try{if(typeof JEUSON!='undefined'){JEUSON.level(1);JEUSON.stop()}}catch(e){}MUS=null;BP.api=null;BP.phase='title';BP.L=null;BP.spr={};BP.pops=[];BP.falls=[];BP.parts=[];BP.texts=[];BP.shot=null;BP.touch=null;BP.paused=false;BP.bg=[]},
 _s:BP,_levels:LEVELS,_sweep:sweep,_predict:predict,_snap:snapCell,_fire:fire,_load:loadLevel,_place:place,_cx:cx,_cy:cy,_neigh:neigh,_count:count,_colors:colorsLeft,_C:{COLS,ROWH,MAXR,BW,LX,LY,DANGER,SPEED},_seed(s){let a=s|0;RNG=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}},_update:update,_swap:swap,_startAt:startAt};
ARC.register('bubble',Bubble);
})();
