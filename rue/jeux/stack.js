// ===== MINI-JEU PERFECT STACK (module de la borne d'arcade) =====
// Jeu d'empilement en 3D isométrique : un bloc glisse au-dessus de la tour, on touche l'écran pour le poser.
// Découpe exacte : le bloc posé devient l'intersection (au réel près) de son empreinte et de celle du bloc du dessous,
// la partie qui dépasse tombe (débris physiques). Écart ≤ PERFECT_TOL → PERFECT (bloc gardé en entier, recalé exactement).
// Combos PERFECT x2, x3, x5, x10, PERFECT STREAK (tous les 5 au-delà de 10) : effets croissants, récompenses (le bloc regrandit,
// pièces bonus) et court ralenti pour les séries exceptionnelles. Pièces, collection (12 blocs, 5 effets de destruction),
// 6 univers, missions du jour, succès et records : tout est sauvegardé dans la sauvegarde de Little Life (N.arcade.stack).
// Dessin en haute résolution (option M.hires de la borne) ; mêmes coordonnées que les autres jeux.
(function(){
const FONT='"LL Outfit",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
// ---------- règles ----------
const BASE=100,BH=19,PERFECT_TOL=2.5,MINW=4,RANGE=128,SPEED0=92,SPEED_K=2.4,SPEED_MAX=255,LEVEL_EVERY=10;
const C30=Math.cos(Math.PI/6),S30=.5;
const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<=0?0:t>=1?1:1-Math.pow(1-t,3),easeOutBack=t=>{t=cl(t,0,1);const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const speedAt=h=>Math.min(SPEED_MAX,SPEED0+SPEED_K*h);
const levelOf=h=>Math.floor(h/LEVEL_EVERY)+1;
// palier de combo → libellé, récompense (croissance du bloc, pièces), ralenti
function comboTier(c){if(c>=15&&c%5==0)return{lab:'PERFECT STREAK',grow:16,coins:20,slow:.55,big:3};if(c==10)return{lab:'PERFECT x10',grow:16,coins:15,slow:.55,big:3};
 if(c==5)return{lab:'PERFECT x5',grow:9,coins:5,slow:.4,big:2};if(c==3)return{lab:'PERFECT x3',grow:5,coins:0,slow:0,big:1};if(c>=2)return{lab:c>10?'PERFECT STREAK':'PERFECT x'+c,grow:0,coins:0,slow:0,big:c>10?2:c>=5?1:0};return{lab:'PERFECT',grow:0,coins:0,slow:0,big:0}}
// ---------- catalogue ----------
const SKINS=[
 {id:'classic',nom:'Classique',cat:'CLASSIQUE',prix:0},{id:'candy',nom:'Bonbon',cat:'CLASSIQUE',prix:120},
 {id:'glass',nom:'Verre',cat:'TRANSPARENT',prix:250},{id:'ice',nom:'Glace',cat:'TRANSPARENT',prix:400},
 {id:'chrome',nom:'Chrome',cat:'MÉTALLIQUE',prix:350},{id:'gold',nom:'Or',cat:'MÉTALLIQUE',prix:650},
 {id:'neon',nom:'Néon',cat:'NÉON',prix:450},{id:'neonpink',nom:'Néon rose',cat:'NÉON',prix:550},
 {id:'holo',nom:'Holographique',cat:'HOLOGRAPHIQUE',prix:750},
 {id:'lava',nom:'Lave',cat:'RARE',prix:1100},{id:'diamond',nom:'Diamant',cat:'RARE',prix:1500},{id:'rainbow',nom:'Arc-en-ciel',cat:'RARE',prix:0,ach:'combo10'}];
const FXS=[{id:'fall',nom:'Chute',prix:0,d:'La découpe tombe d’un bloc'},{id:'shatter',nom:'Éclats',prix:200,d:'Elle vole en éclats'},{id:'pixel',nom:'Pixels',prix:300,d:'Elle se désagrège en cubes'},
 {id:'spark',nom:'Étincelles',prix:400,d:'Elle brûle en étincelles'},{id:'confetti',nom:'Confettis',prix:350,d:'Elle explose en confettis'}];
const ENVS=[
 {id:'neon',nom:'Neon City',prix:0,h:0,d:'Ville futuriste de nuit',mus:'stNeon',h0:285,hs:7,acc:'#ff4fd8',acc2:'#38e8ff',sky:['#07031a','#1b0a3d','#4a1460'],ped:['#2a1550','#120828']},
 {id:'sunset',nom:'Sunset',prix:150,h:15,d:'Coucher de soleil',mus:'stSunset',h0:18,hs:5,acc:'#ffb347',acc2:'#ff6f91',sky:['#3a1d5c','#c2477a','#ffb067'],ped:['#7a3a5a','#3a1a35']},
 {id:'ocean',nom:'Ocean',prix:300,h:25,d:'Lagon lumineux',mus:'stOcean',h0:175,hs:6,acc:'#4ff0e0',acc2:'#5aa8ff',sky:['#03223f','#05517a','#0aa0b8'],ped:['#0b4a6a','#06243a']},
 {id:'space',nom:'Space',prix:500,h:40,d:'Entre les étoiles',mus:'stSpace',h0:225,hs:9,acc:'#9b8cff',acc2:'#ff9ef0',sky:['#010208','#0a0c2a','#1c1450'],ped:['#22224a','#0a0a1e']},
 {id:'crystal',nom:'Crystal',prix:800,h:60,d:'Grotte de cristal',mus:'stCrystal',h0:265,hs:-8,acc:'#c9b6ff',acc2:'#8ff5ff',sky:['#2a1f5c','#6a5ab8','#c7b8f0'],ped:['#5a4aa0','#2a2258']},
 {id:'cyber',nom:'Cyber',prix:1100,h:80,d:'Arcade rétro-futuriste',mus:'stCyber',h0:320,hs:-11,acc:'#ff2fb4',acc2:'#18f0ff',sky:['#05010f','#170634','#3d0a58'],ped:['#1a0838','#080214']}];
const CAT={skin:SKINS,fx:FXS,env:ENVS};
// ---------- missions du jour (3 tirées chaque jour) et succès ----------
const MPOOL=[
 {id:'h15',t:'Atteins 15 étages',k:'runH',g:15,r:40},{id:'h30',t:'Atteins 30 étages',k:'runH',g:30,r:80},
 {id:'p5',t:'Fais 5 PERFECT dans une partie',k:'runP',g:5,r:50},{id:'pd15',t:'Fais 15 PERFECT aujourd’hui',k:'dayP',g:15,r:60},
 {id:'c3',t:'Réussis un PERFECT x3',k:'runC',g:3,r:50},{id:'c5',t:'Réussis un PERFECT x5',k:'runC',g:5,r:90},
 {id:'g3',t:'Joue 3 parties',k:'dayG',g:3,r:40},{id:'b60',t:'Empile 60 blocs aujourd’hui',k:'dayB',g:60,r:60},
 {id:'s40',t:'Marque 40 points en une partie',k:'runS',g:40,r:60},{id:'m80',t:'Gagne 80 pièces aujourd’hui',k:'dayCoins',g:80,r:50}];
const ACH=[
 {id:'first',t:'Première tour',d:'Termine une partie',k:'games',g:1,r:20},
 {id:'h10',t:'Petit gratte-ciel',d:'Atteins 10 étages',k:'bestH',g:10,r:30},{id:'h25',t:'Tour de guet',d:'Atteins 25 étages',k:'bestH',g:25,r:60},
 {id:'h50',t:'Gratte-ciel',d:'Atteins 50 étages',k:'bestH',g:50,r:120},{id:'h100',t:'Jusqu’aux nuages',d:'Atteins 100 étages',k:'bestH',g:100,r:300},
 {id:'combo3',t:'En rythme',d:'Réussis un PERFECT x3',k:'bestC',g:3,r:30},{id:'combo5',t:'Précision',d:'Réussis un PERFECT x5',k:'bestC',g:5,r:60},
 {id:'combo10',t:'Perfection',d:'Réussis un PERFECT x10',k:'bestC',g:10,r:150,unlock:['skin','rainbow']},
 {id:'perf100',t:'Cent fois parfait',d:'100 PERFECT au total',k:'perfects',g:100,r:150},{id:'blocks500',t:'Bâtisseur',d:'Empile 500 blocs',k:'blocks',g:500,r:120},
 {id:'collector',t:'Collectionneur',d:'Possède 6 objets',k:'owned',g:6,r:100},{id:'globe',t:'Globe-trotter',d:'Débloque 3 univers',k:'envs',g:3,r:100},
 {id:'missions10',t:'Assidu',d:'Accomplis 10 missions',k:'missions',g:10,r:150},{id:'rich',t:'Fortune',d:'Gagne 2 000 pièces au total',k:'coinsTotal',g:2000,r:200}];
// ---------- état ----------
const ST={api:null,scr:'home',t:0,rt:0,mute:false,paused:false,L:null,W:0,H:0,touch:{},btns:[],toasts:[],G:null,D:null,over:null,coll:{tab:'skin',sel:null,scroll:0,v:0,max:0,msg:null},miss:{tab:'day',scroll:0,v:0,max:0},drag:null,bgc:{},spr:{},fr:{n:0,sum:0,max:0}};
const fx=(n,k,g)=>{if(ST.mute)return;try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.02:g)}catch(e){}};
let MUS=null;function music(){try{if(typeof JEUSON=='undefined')return;const e=env(),m=e.mus;if(MUS!==m){JEUSON.music(m);MUS=m}JEUSON.level(ST.mute?0:ST.paused?.3:ST.scr=='play'?1:.75)}catch(e){}}
// ---------- sauvegarde (celle de la borne : N.arcade.stack, enregistrée avec la partie de Little Life) ----------
function data(){let d;try{d=ST.api.data()}catch(e){d=ST._d||(ST._d={best:0,level:1})}
 if(!d.own){d.coins=d.coins|0;d.own={skin:['classic'],fx:['fall'],env:['neon']};d.eq={skin:'classic',fx:'fall',env:'neon'};d.st={games:0,blocks:0,perfects:0,bestH:0,bestC:0,bestS:0,coinsTotal:0,missions:0};d.ach={};d.daily=null}
 for(const k of['skin','fx','env'])if(!d.own[k])d.own[k]=[CAT[k][0].id];for(const k of['games','blocks','perfects','bestH','bestC','bestS','coinsTotal','missions'])d.st[k]=d.st[k]|0;if(!d.ach)d.ach={};return d}
function persist(){try{ST.api&&ST.api.save()}catch(e){}}
const owns=(k,id)=>data().own[k].includes(id);
const env=()=>ST.envOv||ENVS.find(e=>e.id==data().eq.env)||ENVS[0],skin=()=>data().eq.skin||'classic',fxId=()=>data().eq.fx||'fall';
// journée locale → 3 missions tirées au sort de façon déterministe (les mêmes toute la journée)
function dayKey(dt){const d=dt||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function daily(){const d=data(),k=dayKey();if(!d.daily||d.daily.day!==k){let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))>>>0;const ids=[],kinds=new Set();let i=0;
  while(ids.length<3&&i<200){h=(h*1103515245+12345)>>>0;const m=MPOOL[h%MPOOL.length];if(!ids.includes(m.id)&&!kinds.has(m.k)){ids.push(m.id);kinds.add(m.k)}i++}
  d.daily={day:k,ids,prog:{},done:{},ctr:{dayP:0,dayG:0,dayB:0,dayCoins:0}};persist()}return d.daily}
const mdef=id=>MPOOL.find(m=>m.id===id);
// progression des missions et succès en fin de partie ; renvoie ce qui vient d'être accompli
function settle(run){const d=data(),D=daily(),newM=[],newA=[];
 D.ctr.dayP+=run.perfects;D.ctr.dayG+=1;D.ctr.dayB+=run.height;D.ctr.dayCoins+=run.coins;
 for(const id of D.ids){const m=mdef(id);if(!m||D.done[id])continue;const v=m.k=='runH'?run.height:m.k=='runP'?run.perfects:m.k=='runC'?run.maxCombo:m.k=='runS'?run.score:D.ctr[m.k]||0;
  D.prog[id]=Math.max(D.prog[id]||0,v);if(D.prog[id]>=m.g){D.done[id]=1;d.coins+=m.r;d.st.coinsTotal+=m.r;d.st.missions++;newM.push(m)}}
 newA.push(...checkAch());return{newM,newA}}
function achVal(k){const d=data();if(k=='owned')return d.own.skin.length+d.own.fx.length+d.own.env.length-3;if(k=='envs')return d.own.env.length;return d.st[k]|0}
function checkAch(){const d=data(),out=[];for(const a of ACH){if(d.ach[a.id])continue;if(achVal(a.k)>=a.g){d.ach[a.id]=1;d.coins+=a.r;d.st.coinsTotal+=a.r;if(a.unlock){const[k,id]=a.unlock;if(!d.own[k].includes(id))d.own[k].push(id)}out.push(a)}}
 // univers débloqués par la hauteur atteinte
 for(const e of ENVS)if(e.h&&d.st.bestH>=e.h&&!d.own.env.includes(e.id)){d.own.env.push(e.id);out.push({t:'Univers '+e.nom,d:'Débloqué : '+e.h+' étages atteints',r:0,env:1})}
 return out}
function buy(k,id){const d=data(),it=CAT[k].find(q=>q.id==id);if(!it||owns(k,id))return{ok:false,why:'déjà'};if(it.ach)return{ok:false,why:'succès'};if(d.coins<it.prix)return{ok:false,why:'pièces',manque:it.prix-d.coins};
 d.coins-=it.prix;d.own[k].push(id);d.eq[k]=id;const a=checkAch();persist();return{ok:true,ach:a}}
function equip(k,id){const d=data();if(!owns(k,id))return false;d.eq[k]=id;persist();if(k=='env'){ST.bgc={};MUS=null;music()}return true}
// ---------- partie ----------
function newGame(){const G={blocks:[{x:0,z:0,w:BASE,d:BASE,lvl:0,y:-BH}],cur:null,debris:[],parts:[],rings:[],texts:[],score:0,height:0,combo:0,maxCombo:0,perfects:0,coinsBonus:0,
 camY:0,zoom:1,zoomT:1,shake:0,slow:0,flash:0,flashC:'#ffffff',over:false,overT:0,started:false,tapHint:0,lastDrop:null,pop:0,scorePop:0,levelPop:0};
 G.camY=topY(G)+BH*1.5;spawn(G);return G}
const topB=G=>G.blocks[G.blocks.length-1],topY=G=>topB(G).y+BH;
function spawn(G){const p=topB(G),n=G.blocks.length,axis=n%2?'x':'z',dir=n%4<2?1:-1;
 const c={x:p.x,z:p.z,w:p.w,d:p.d,lvl:n,y:p.y+BH,axis,dir};if(axis=='x')c.x=p.x-dir*RANGE;else c.z=p.z-dir*RANGE;G.cur=c}
function moveCur(G,dt){const c=G.cur;if(!c)return;const p=topB(G),k=c.axis,ctr=k=='x'?p.x:p.z,v=speedAt(G.height)*dt;let q=(k=='x'?c.x:c.z)+c.dir*v;
 if(q>ctr+RANGE){q=ctr+RANGE-(q-ctr-RANGE);c.dir=-1}if(q<ctr-RANGE){q=ctr-RANGE+(ctr-RANGE-q);c.dir=1}if(k=='x')c.x=q;else c.z=q}
// pose : découpe exacte du bloc mobile par l'empreinte du bloc du dessous (renvoie le détail pour les effets et les tests)
function drop(G){if(G.over||!G.cur)return null;const c=G.cur,p=topB(G),k=c.axis,size=k=='x'?c.w:c.d,pc=k=='x'?p.x:p.z,cc=k=='x'?c.x:c.z,delta=cc-pc;G.started=true;
 const res={delta,perfect:false,overlap:0,cut:0,over:false};
 if(Math.abs(delta)<=PERFECT_TOL){// PERFECT : recalé exactement sur le bloc du dessous, taille conservée
  if(k=='x')c.x=p.x;else c.z=p.z;res.perfect=true;res.overlap=size;G.combo++;G.perfects++;G.maxCombo=Math.max(G.maxCombo,G.combo);
  const T=comboTier(G.combo);res.tier=T;if(T.grow){const gw=Math.min(BASE,c.w+T.grow),gd=Math.min(BASE,c.d+T.grow);res.grow=[gw-c.w,gd-c.d];c.w=gw;c.d=gd}
  if(T.coins)G.coinsBonus+=T.coins;place(G,c,1+Math.min(G.combo,10));perfectFx(G,c,T);return res}
 // intervalles exacts sur l'axe de déplacement
 const a0=cc-size/2,a1=cc+size/2,b0=pc-size/2,b1=pc+size/2,i0=Math.max(a0,b0),i1=Math.min(a1,b1),ov=i1-i0;res.overlap=Math.max(0,ov);res.cut=size-Math.max(0,ov);G.combo=0;
 if(ov<MINW){// raté ou bloc trop petit : tout le bloc tombe, fin de partie
  res.over=true;debris(G,{x:c.x,z:c.z,w:c.w,d:c.d,y:c.y,lvl:c.lvl},k,Math.sign(delta)||1,true);G.cur=null;gameOver(G);return res}
 const kept={x:c.x,z:c.z,w:c.w,d:c.d,lvl:c.lvl,y:c.y},cut={x:c.x,z:c.z,w:c.w,d:c.d,lvl:c.lvl,y:c.y},side=Math.sign(delta);
 const ci=side>0?[i1,a1]:[a0,i0];
 if(k=='x'){kept.x=(i0+i1)/2;kept.w=ov;cut.x=(ci[0]+ci[1])/2;cut.w=ci[1]-ci[0]}else{kept.z=(i0+i1)/2;kept.d=ov;cut.z=(ci[0]+ci[1])/2;cut.d=ci[1]-ci[0]}
 res.kept=kept;res.cutB=cut;Object.assign(c,kept);debris(G,cut,k,side,false);place(G,c,1);fx('stCut',1,.02);return res}
function place(G,c,pts){const b={x:c.x,z:c.z,w:c.w,d:c.d,lvl:c.lvl,y:c.y};G.blocks.push(b);G.height=G.blocks.length-1;G.score+=pts;G.scorePop=1;
 G.lastDrop={b,t:0};if(G.height%LEVEL_EVERY==0){G.levelPop=1;fx('stLevel',1,.05)}fx('stDrop',1+Math.min(G.combo,12)*.06,.01);spawn(G)}
function perfectFx(G,c,T){const b=topB(G);G.rings.push({b,t:0,k:1+T.big*.6});if(T.big>=2)G.rings.push({b,t:-.12,k:1.6+T.big*.4});if(T.big>=3)G.rings.push({b,t:-.24,k:2.4});
 const n=14+T.big*18;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=.5+Math.random()*.5,sp=60+Math.random()*120*(1+T.big*.5);
  G.parts.push({x:b.x+Math.cos(a)*b.w*.5*r,y:b.y+BH,z:b.z+Math.sin(a)*b.d*.5*r,vx:Math.cos(a)*sp,vy:80+Math.random()*160*(1+T.big*.4),vz:Math.sin(a)*sp,g:-420,l:.7+Math.random()*.5,L:1.2,c:i%3==0?'#ffffff':i%3==1?env().acc:env().acc2,s:1.4+Math.random()*2,glow:1})}
 G.texts=[];G.texts.push({s:T.lab,t:0,big:T.big,c:G.combo});if(T.coins)G.texts.push({s:'+'+T.coins,coin:1,t:-.25,big:0});if(T.grow)G.texts.push({s:'BLOC AGRANDI',t:-.35,small:1});
 G.flash=.2+T.big*.18;G.flashC=T.big>=3?env().acc:'#ffffff';G.shake=T.big>=2?.25*T.big:0;if(T.slow)G.slow=T.slow;
 fx('stPerfect',Math.min(G.combo,12),.01);if(T.big>=2)fx(T.big>=3?'stStreak':'stCombo',1,.05);if(T.slow)fx('stSlow',1,.2);if(T.coins)fx('stCoin',1,.1)}
// débris : la partie découpée tombe selon l'effet de destruction équipé
function debris(G,b,axis,side,whole){const f=fxId(),sk=skin(),R=[];const vOut=40+Math.random()*30,mk=(o)=>Object.assign({sk,lvl:b.lvl,ang:0,life:0,alpha:1,fade:0},o);
 const axv=axis=='x'?[0,0,-side]:[side,0,0];// la découpe bascule vers l'extérieur
 if(f=='fall'||whole&&f!='confetti'&&f!='spark'){R.push(mk({x:b.x,y:b.y+BH/2,z:b.z,w:b.w,h:BH,d:b.d,vx:axis=='x'?side*vOut:0,vy:20,vz:axis=='z'?side*vOut:0,ax:axv,av:2.2+Math.random()*1.5}))}
 else if(f=='shatter'||f=='pixel'){const n=f=='pixel'?Math.max(2,Math.min(6,Math.round((axis=='x'?b.w:b.d)/7))):3,m=f=='pixel'?Math.max(2,Math.min(5,Math.round((axis=='x'?b.d:b.w)/14))):2,hh=f=='pixel'?2:1;
  const L=axis=='x'?b.w:b.d,Wd=axis=='x'?b.d:b.w;for(let i=0;i<n;i++)for(let j=0;j<m;j++)for(let q=0;q<hh;q++){const u=-L/2+L*(i+.5)/n,v=-Wd/2+Wd*(j+.5)/m,sz=f=='pixel'?.82:.96;
   const o={x:b.x+(axis=='x'?u:v),z:b.z+(axis=='x'?v:u),y:b.y+BH*(q+.5)/hh,w:(axis=='x'?L/n:Wd/m)*sz,d:(axis=='x'?Wd/m:L/n)*sz,h:BH/hh*sz};
   const out=side*(vOut+Math.random()*90);R.push(mk(Object.assign(o,{vx:axis=='x'?out:(Math.random()-.5)*80,vz:axis=='z'?out:(Math.random()-.5)*80,vy:60+Math.random()*120,ax:norm([Math.random()-.5,Math.random()-.5,Math.random()-.5]),av:(Math.random()*6+3)*(Math.random()<.5?-1:1),fade:f=='pixel'?1.1:0})))}}
 else if(f=='spark'){R.push(mk({x:b.x,y:b.y+BH/2,z:b.z,w:b.w,h:BH,d:b.d,vx:axis=='x'?side*20:0,vy:10,vz:axis=='z'?side*20:0,ax:axv,av:1.2,burn:1,fade:.9}))}
 if(f=='confetti'){const C=['#ff4f8b','#ffd23f','#3ee8b5','#4fa8ff','#b06bff','#ffffff'];for(let i=0;i<60;i++){const a=Math.random()*Math.PI*2,sp=50+Math.random()*170;
   G.parts.push({x:b.x+(Math.random()-.5)*b.w,y:b.y+BH/2,z:b.z+(Math.random()-.5)*b.d,vx:Math.cos(a)*sp+(axis=='x'?side*60:0),vy:100+Math.random()*200,vz:Math.sin(a)*sp+(axis=='z'?side*60:0),g:-300,drag:1.6,l:1.4+Math.random(),L:2.4,c:C[i%6],s:2.2+Math.random()*1.6,conf:1,r:Math.random()*6,vr:(Math.random()-.5)*14})}
  fx('stPop',1,.05)}
 G.debris.push(...R);if(f!='confetti')fx(whole?'stFall':'stCutFall',1,.05)}
const norm=v=>{const l=Math.hypot(...v)||1;return v.map(q=>q/l)};
function gameOver(G){G.over=true;G.overT=0;G.shake=.35;const H=Math.max(1,G.height);G.zoomT=1;fx('stOver',1,.2);ST.over=finishRun(G)}
// fin de partie : pièces (hauteur + PERFECT + bonus de fin), records, missions, succès, record de la borne
function finishRun(G){const d=data();if(G.settled)return G.settled;const h=G.height,s=G.score;
 const coinH=h,coinP=G.perfects+G.coinsBonus,coinEnd=h>0?5+(h>=10?5:0)+(h>=25?10:0)+(h>=50?20:0)+(h>=100?50:0):0,prevBest=d.st.bestS|0,rec=s>prevBest&&s>0,coinRec=rec&&prevBest>0?10:0;
 const coins=coinH+coinP+coinEnd+coinRec;d.coins+=coins;d.st.coinsTotal+=coins;d.st.games++;d.st.blocks+=h;d.st.perfects+=G.perfects;
 const prevH=d.st.bestH;d.st.bestH=Math.max(d.st.bestH,h);d.st.bestC=Math.max(d.st.bestC,G.maxCombo);d.st.bestS=Math.max(d.st.bestS,s);
 const run={height:h,perfects:G.perfects,maxCombo:G.maxCombo,score:s,coins};const {newM,newA}=settle(run);
 try{ST.api&&ST.api.record(s)}catch(e){}persist();
 G.settled={score:s,height:h,perfects:G.perfects,maxCombo:G.maxCombo,coins,coinH,coinP,coinEnd,coinRec,rec,prevBest,recH:h>prevH&&h>0,newM,newA};return G.settled}
// ---------- projection isométrique (x vers le bas-droite, z vers le bas-gauche, y vers le haut) ----------
function P(V,x,y,z){return[V.ox+(x-z)*C30*V.sc,V.oy+(x+z)*S30*V.sc-(y-V.camY)*V.sc]}
const LIGHT=norm([.3,1,.6]),VIEW=[1,1,1];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function hsl(h,s,l,a){return a==null?`hsl(${h},${s}%,${cl(l,0,100)}%)`:`hsla(${h},${s}%,${cl(l,0,100)}%,${a})`}
function poly(x,pts){x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath()}
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const fpt=(p,u,v)=>[p[0][0]+u*(p[1][0]-p[0][0])+v*(p[3][0]-p[0][0]),p[0][1]+u*(p[1][1]-p[0][1])+v*(p[3][1]-p[0][1])];
function rnd(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
// couleur de base d'un matériau à un étage donné
function mcol(sk,lvl){const E=env();switch(sk){
 case 'candy':return[[340,85,80],[160,62,74],[48,92,72],[200,82,78],[275,72,80]][((lvl%5)+5)%5];
 case 'rainbow':return[(lvl*29%360+360)%360,88,60];
 case 'neon':return[(190+lvl*13)%360,100,62];case 'neonpink':return[(320+((lvl%4)-1.5)*10+360)%360,100,64];
 default:return[((E.h0+lvl*E.hs)%360+360)%360,72,60]}}
// peinture d'une face (P : 4 points écran, bord supérieur d'abord ; I : éclairement 0..1 ; top : face du dessus)
const LODC={glass:[200,40,80],ice:[192,80,82],chrome:[220,12,72],gold:[42,85,58],neon:null,neonpink:null,holo:null,lava:[14,60,28],diamond:[195,70,80]};
function paintFace(x,sk,Pt,I,top,b){const dp=ST.dp,lvl=b.lvl|0;poly(x,Pt);
 if(ST.lod){const c=LODC[sk]||(sk=='holo'?[(lvl*18)%360,85,72]:mcol(sk,lvl));x.fillStyle=hsl(c[0],c[1],c[2]*(.58+.46*I));x.fill();return}
 const sideGrad=(c0,c1)=>{const a=mid(Pt[0],Pt[1]),z=mid(Pt[2],Pt[3]),g=x.createLinearGradient(a[0],a[1],z[0],z[1]);g.addColorStop(0,c0);g.addColorStop(1,c1);return g};
 const topGrad=(stops)=>{const g=x.createLinearGradient(Pt[0][0],Pt[0][1],Pt[2][0],Pt[2][1]);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));return g};
 const across=(stops)=>{const g=x.createLinearGradient(Pt[0][0],Pt[0][1],Pt[1][0],Pt[1][1]);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));return g};
 const edges=(c,w)=>{x.strokeStyle=c;x.lineWidth=w*dp;x.beginPath();if(top){x.moveTo(Pt[1][0],Pt[1][1]);x.lineTo(Pt[2][0],Pt[2][1]);x.lineTo(Pt[3][0],Pt[3][1])}else{x.moveTo(Pt[0][0],Pt[0][1]);x.lineTo(Pt[1][0],Pt[1][1])}x.stroke()};
 if(sk=='glass'||sk=='ice'){const ice=sk=='ice',E=env(),h=ice?192:(E.h0+lvl*E.hs+360)%360;
  x.fillStyle=ice?hsl(h,85,82,.26+.2*I):hsl(h,55,80,.12+.14*I);x.fill();
  x.fillStyle=top?topGrad(['rgba(255,255,255,.55)','rgba(255,255,255,.08)','rgba(255,255,255,.22)']):sideGrad('rgba(255,255,255,.22)','rgba(255,255,255,.02)');x.fill();
  if(!top){x.save();poly(x,Pt);x.clip();const a=fpt(Pt,.15,0),z=fpt(Pt,.45,1);x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=Math.hypot(Pt[1][0]-Pt[0][0],Pt[1][1]-Pt[0][1])*.08;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(z[0],z[1]);x.stroke();x.restore()}
  if(ice){const r=rnd(lvl*7+(top?3:1));x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<5;i++){const q=fpt(Pt,r(),r());x.fillRect(q[0],q[1],1.2*dp*2,1.2*dp*2)}}
  poly(x,Pt);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.1*dp;x.stroke();return}
 if(sk=='chrome'||sk=='gold'){const gold=sk=='gold',S=gold?['#fff4bf','#e3a52b','#ffe592','#b07514','#ffd66b']:['#ffffff','#a6aec2','#f1f4f9','#6e7790','#dfe4ee'];
  x.fillStyle=top?topGrad(S):across(S);x.fill();x.fillStyle=`rgba(${gold?'60,30,0':'10,14,30'},${(1-I)*.55})`;x.fill();
  if(!top){x.fillStyle=sideGrad('rgba(255,255,255,.12)','rgba(0,0,0,.18)');x.fill()}
  edges(top?'rgba(255,255,255,.85)':'rgba(255,255,255,.5)',1.2);return}
 if(sk=='neon'||sk=='neonpink'){const[h]=mcol(sk,lvl),c=hsl(h,100,62),pulse=.75+.25*Math.sin(ST.t*4+lvl*.7);
  x.fillStyle=`rgba(10,8,${top?34:24},.9)`;x.fill();x.fillStyle=top?topGrad([hsl(h,100,60,.28),hsl(h,100,50,.05)]):sideGrad(hsl(h,100,60,.18),hsl(h,100,40,.02));x.fill();
  x.save();x.globalCompositeOperation='lighter';poly(x,Pt);x.strokeStyle=hsl(h,100,60,.22*pulse);x.lineWidth=5*dp;x.stroke();x.strokeStyle=hsl(h,100,72,.9*pulse);x.lineWidth=1.4*dp;x.stroke();x.restore();return}
 if(sk=='holo'){const h=(lvl*18+ST.t*40)%360;x.fillStyle=(top?topGrad:across)([hsl(h,90,80),hsl(h+60,90,74),hsl(h+130,90,80),hsl(h+200,90,76)]);x.fill();
  x.fillStyle=`rgba(30,10,60,${(1-I)*.5})`;x.fill();x.fillStyle=top?topGrad(['rgba(255,255,255,.5)','rgba(255,255,255,0)','rgba(255,255,255,.25)']):sideGrad('rgba(255,255,255,.25)','rgba(0,0,0,.1)');x.fill();
  edges('rgba(255,255,255,.75)',1.1);return}
 if(sk=='lava'){x.fillStyle=hsl(10,28,10+12*I);x.fill();x.fillStyle=top?topGrad(['rgba(255,120,40,.12)','rgba(0,0,0,0)']):sideGrad('rgba(255,90,20,.05)','rgba(255,90,20,.28)');x.fill();
  const r=rnd(lvl*13+(top?7:2)+Math.round(Pt[0][0]>Pt[1][0]?5:0)),pulse=.6+.4*Math.sin(ST.t*3+lvl);x.save();poly(x,Pt);x.clip();x.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++){let u=r(),v=r()*.3;x.beginPath();let q=fpt(Pt,u,v);x.moveTo(q[0],q[1]);for(let s=0;s<4;s++){u=cl(u+(r()-.5)*.5,0,1);v=Math.min(1,v+.2+r()*.2);q=fpt(Pt,u,v);x.lineTo(q[0],q[1])}
   x.strokeStyle=`rgba(255,110,20,${.35*pulse})`;x.lineWidth=4*dp;x.stroke();x.strokeStyle=`rgba(255,200,90,${.9*pulse})`;x.lineWidth=1.2*dp;x.stroke()}x.restore();edges('rgba(255,150,60,.35)',1);return}
 if(sk=='diamond'){const c=[(Pt[0][0]+Pt[2][0])/2,(Pt[0][1]+Pt[2][1])/2];for(let i=0;i<4;i++){const a=Pt[i],z=Pt[(i+1)%4];x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(z[0],z[1]);x.lineTo(c[0],c[1]);x.closePath();
   x.fillStyle=hsl(195+i*8,70,(top?82:66)+[8,-6,4,-10][i]+I*10,.88);x.fill()}
  poly(x,Pt);x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1*dp;x.stroke();
  const tw=Math.sin(ST.t*5+lvl*2.3);if(tw>.6){const q=fpt(Pt,.3+.4*((lvl*.37)%1),.4),s=(tw-.6)*12*dp*3;x.fillStyle='#ffffff';x.beginPath();x.moveTo(q[0],q[1]-s);x.lineTo(q[0]+s*.25,q[1]);x.lineTo(q[0],q[1]+s);x.lineTo(q[0]-s*.25,q[1]);x.closePath();x.fill();x.beginPath();x.moveTo(q[0]-s,q[1]);x.lineTo(q[0],q[1]+s*.25);x.lineTo(q[0]+s,q[1]);x.lineTo(q[0],q[1]-s*.25);x.closePath();x.fill()}return}
 // classique, bonbon, arc-en-ciel : couleur pleine, dégradé d'occlusion, brillance
 const[h,s,l]=mcol(sk,lvl);x.fillStyle=hsl(h,s,l*(.58+.46*I));x.fill();
 x.fillStyle=top?topGrad(['rgba(255,255,255,.34)','rgba(255,255,255,0)','rgba(255,255,255,.1)']):sideGrad('rgba(255,255,255,.14)','rgba(0,0,0,.2)');x.fill();
 if(sk=='candy'&&!top){x.save();poly(x,Pt);x.clip();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(1,Math.hypot(Pt[3][0]-Pt[0][0],Pt[3][1]-Pt[0][1])*.18);for(let k=-1;k<6;k++){const a=fpt(Pt,k/5,0),z=fpt(Pt,k/5+.25,1);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(z[0],z[1]);x.stroke()}x.restore()}
 edges(top?'rgba(255,255,255,.55)':'rgba(255,255,255,.18)',1)}
// bloc aligné sur les axes (la tour) : face gauche (+z), face droite (+x), dessus
function drawBlock(x,V,b,sk,o){o=o||{};ST.lod=(b.h||BH)*V.sc<3.2;const h=b.h||BH,x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2,y0=b.y,y1=b.y+h;
 const A=P(V,x0,y1,z0),B=P(V,x1,y1,z0),Cc=P(V,x1,y1,z1),D=P(V,x0,y1,z1),E=P(V,x1,y0,z0),F=P(V,x1,y0,z1),Gp=P(V,x0,y0,z1);
 if(o.alpha!=null)x.globalAlpha=o.alpha;
 paintFace(x,sk,[D,Cc,F,Gp],dot([0,0,1],LIGHT)*.45+.55,false,b);paintFace(x,sk,[Cc,B,E,F],dot([1,0,0],LIGHT)*.45+.55,false,b);paintFace(x,sk,[A,B,Cc,D],dot([0,1,0],LIGHT)*.45+.55,true,b);
 if(o.flash>0){x.save();x.globalCompositeOperation='lighter';x.fillStyle=`rgba(255,255,255,${o.flash})`;poly(x,[A,B,E,F,Gp,D]);x.fill();x.restore()}
 if(o.alpha!=null)x.globalAlpha=1;ST.lod=false}
// boîte tournée (débris)
function rot(ax,a){const[u,v,w]=ax,c=Math.cos(a),s=Math.sin(a),t=1-c;return[[t*u*u+c,t*u*v-s*w,t*u*w+s*v],[t*u*v+s*w,t*v*v+c,t*v*w-s*u],[t*u*w-s*v,t*v*w+s*u,t*w*w+c]]}
const mv=(M,p)=>[M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2],M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2],M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]];
const FACES=[{n:[0,1,0],v:[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]},{n:[0,0,1],v:[[-1,1,1],[1,1,1],[1,-1,1],[-1,-1,1]]},{n:[1,0,0],v:[[1,1,1],[1,1,-1],[1,-1,-1],[1,-1,1]]},
 {n:[0,-1,0],v:[[-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1]]},{n:[0,0,-1],v:[[1,1,-1],[-1,1,-1],[-1,-1,-1],[1,-1,-1]]},{n:[-1,0,0],v:[[-1,1,-1],[-1,1,1],[-1,-1,1],[-1,-1,-1]]}];
function drawRBox(x,V,o){const M=rot(o.ax,o.ang),hs=[o.w/2,o.h/2,o.d/2],fs=[];
 for(const f of FACES){const n=mv(M,f.n);if(dot(n,VIEW)<=1e-4)continue;let cz=0;const pts=f.v.map(q=>{const p=mv(M,[q[0]*hs[0],q[1]*hs[1],q[2]*hs[2]]);cz+=p[0]+p[1]+p[2];return P(V,o.x+p[0],o.y+p[1],o.z+p[2])});fs.push({pts,n,cz})}
 fs.sort((a,b)=>a.cz-b.cz);x.globalAlpha=cl(o.alpha,0,1);for(const f of fs)paintFace(x,o.sk,f.pts,Math.max(0,dot(f.n,LIGHT))*.45+.55,f.n[1]>.7,{lvl:o.lvl});
 if(o.burn){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=cl(o.life*1.5,0,1)*.8;for(const f of fs){poly(x,f.pts);x.fillStyle='rgba(255,140,40,.55)';x.fill()}x.restore()}x.globalAlpha=1}
// socle de la tour (sous le bloc de départ)
function drawPedestal(x,V,G){const E=env(),w=BASE+26,y1=-BH,y0=-BH-140,x0=-w/2,x1=w/2,z0=-w/2,z1=w/2;
 const A=P(V,x0,y1,z0),B=P(V,x1,y1,z0),Cc=P(V,x1,y1,z1),D=P(V,x0,y1,z1),Ee=P(V,x1,y0,z0),F=P(V,x1,y0,z1),Gp=P(V,x0,y0,z1);
 // halo lumineux sous le socle
 const c=P(V,0,y1,0),r=w*V.sc*1.3,g=x.createRadialGradient(c[0],c[1],0,c[0],c[1],r);g.addColorStop(0,E.acc+'55');g.addColorStop(1,E.acc+'00');x.fillStyle=g;x.fillRect(c[0]-r,c[1]-r,2*r,2*r);
 const side=(pts,k)=>{poly(x,pts);const a=mid(pts[0],pts[1]),z=mid(pts[2],pts[3]),gr=x.createLinearGradient(a[0],a[1],z[0],z[1]);gr.addColorStop(0,E.ped[0]);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fill();x.fillStyle=`rgba(0,0,0,${k})`;x.fill()};
 side([D,Cc,F,Gp],.1);side([Cc,B,Ee,F],.28);poly(x,[A,B,Cc,D]);const tg=x.createLinearGradient(A[0],A[1],Cc[0],Cc[1]);tg.addColorStop(0,E.ped[0]);tg.addColorStop(1,E.ped[1]);x.fillStyle=tg;x.fill();
 x.save();x.globalCompositeOperation='lighter';x.strokeStyle=E.acc;x.globalAlpha=.55+.2*Math.sin(ST.t*2);x.lineWidth=1.4*ST.dp;x.beginPath();x.moveTo(D[0],D[1]);x.lineTo(Cc[0],Cc[1]);x.lineTo(B[0],B[1]);x.stroke();x.globalAlpha=.25;x.lineWidth=5*ST.dp;x.stroke();x.restore()}
// ombre du bloc mobile sur le dessus de la tour (aide à viser)
function drawShadow(x,V,G){const c=G.cur,t=topB(G);if(!c)return;const a0=Math.max(c.x-c.w/2,t.x-t.w/2),a1=Math.min(c.x+c.w/2,t.x+t.w/2),b0=Math.max(c.z-c.d/2,t.z-t.d/2),b1=Math.min(c.z+c.d/2,t.z+t.d/2);if(a1<=a0||b1<=b0)return;
 const y=t.y+BH;poly(x,[P(V,a0,y,b0),P(V,a1,y,b0),P(V,a1,y,b1),P(V,a0,y,b1)]);x.fillStyle='rgba(8,4,20,.22)';x.fill()}
// scène complète : socle, tour visible, débris, ombre, bloc mobile, anneaux et particules
// Les étages déjà posés (tous sauf les LIVE du haut) sont dessinés une fois dans une toile de tour, réutilisée tant qu'ils
// ne changent pas : à chaque image, on ne recolle qu'une image, quelle que soit la hauteur de la tour.
const LIVE=4;
function towerLayer(x,V,G,w,h,sk,n){const s=ST.sc,key=[n,sk,env().id,V.sc.toFixed(5),V.ox,V.oy,w,h,s].join('|'),T=G.tl;
 if(T&&T.key===key)return T;const hw=Math.min(w/2,(BASE+40)*C30*V.sc*1.15),x0=Math.max(0,Math.floor((V.ox-hw)*s)/s),cw=Math.min(w-x0,Math.ceil(2*hw*s)/s);
 const c=T&&T.c||document.createElement('canvas');c.width=Math.round(cw*s);c.height=Math.round(h*s);
 const g=c.getContext('2d');g.setTransform(s,0,0,s,-x0*s,0);const L=Object.assign({},V,{camY:topY(G)+BH*1.5}),marg=BASE*V.sc*1.5;drawPedestal(g,L,G);
 const list=[];for(let i=n-1;i>=0;i--){const b=G.blocks[i],sy=L.oy-(b.y-L.camY)*L.sc;if(sy<-marg)continue;if(sy>h+marg*2)break;list.push(b)}list.reverse();for(const b of list)drawBlock(g,L,b,sk);
 G.tl={key,c,camY:L.camY,x0,cw};ST.tlr=(ST.tlr||0)+1;return G.tl}
function drawScene(x,V,G,w,h,o){o=o||{};const sk=o.skin||skin(),marg=BASE*V.sc*1.5,nb=G.blocks.length,cache=o.cache&&!G.over&&nb>LIVE+2,n0=cache?nb-LIVE:0;
 const tb=topB(G),lf=G.lastDrop&&G.lastDrop.t<.3?(1-G.lastDrop.t/.3)*.55:0,tc=tb.x+tb.z;
 const deb=G.debris.filter(d=>{const sy=V.oy-(d.y-V.camY)*V.sc;return sy<h+marg&&sy>-marg});
 if(cache){// débris derrière la tour d'abord (la tour les cache), puis la tour figée
  for(const d of deb)if(d.x+d.z<tc)drawRBox(x,V,d);const T=towerLayer(x,V,G,w,h,sk,n0);{const Y=Math.round((V.camY-T.camY)*V.sc*ST.sc)/ST.sc;if(Y<h)x.drawImage(T.c,T.x0,Y,T.cw,h)}}
 else drawPedestal(x,V,G);
 const list=[];for(let i=nb-1;i>=n0;i--){const b=G.blocks[i],sy=V.oy-(b.y-V.camY)*V.sc;if(sy<-marg)continue;if(sy>h+marg*2)break;list.push({b,k:b.x+b.y+BH/2+b.z})}
 for(const d of deb)if(!cache||d.x+d.z>=tc)list.push({d,k:d.x+d.y+d.z});
 list.sort((a,b)=>a.k-b.k);
 for(const it of list){if(it.b){drawBlock(x,V,it.b,sk,{flash:it.b===tb&&G.lastDrop&&G.lastDrop.b===tb?lf:0});if(it.b===tb)drawShadow(x,V,G)}else drawRBox(x,V,it.d)}
 if(G.cur&&!G.over)drawBlock(x,V,G.cur,sk);
 drawFx(x,V,G)}
function drawFx(x,V,G){
 x.save();x.globalCompositeOperation='lighter';
 for(const r of G.rings){if(r.t<0)continue;const b=r.b,k=1+ease(r.t)*.55*r.k,y=b.y+BH,hw=b.w/2*k+4,hd=b.d/2*k+4,pts=[P(V,b.x-hw,y,b.z-hd),P(V,b.x+hw,y,b.z-hd),P(V,b.x+hw,y,b.z+hd),P(V,b.x-hw,y,b.z+hd)];
  poly(x,pts);x.strokeStyle=`rgba(255,255,255,${(1-r.t)*.9})`;x.lineWidth=(2.2*(1-r.t)+.6)*ST.dp*1.5;x.stroke();x.strokeStyle=hexA(env().acc2,(1-r.t)*.45);x.lineWidth=(9*(1-r.t)+1)*ST.dp;x.stroke()}
 for(const q of G.parts){const p=P(V,q.x,q.y,q.z),a=cl(q.l/(q.L*.5),0,1);if(q.conf){x.restore();x.save();x.globalAlpha=a;x.translate(p[0],p[1]);x.rotate(q.r);x.fillStyle=q.c;const s=q.s*V.sc*.9;x.fillRect(-s,-s*.45,s*2,s*.9);x.restore();x.save();x.globalCompositeOperation='lighter';continue}
  const s=q.s*V.sc*.6+ST.dp;x.globalAlpha=a;x.fillStyle=q.c;x.beginPath();x.arc(p[0],p[1],s,0,7);x.fill();x.globalAlpha=a*.25;x.beginPath();x.arc(p[0],p[1],s*3,0,7);x.fill()}
 x.restore();x.globalAlpha=1}
// tour entière en fin de partie (dézoom) : figée dans une image une fois le zoom stabilisé
function drawOverTower(x,V,G,w,h){const key=[G.blocks.length,skin(),env().id,V.sc.toFixed(4),V.camY.toFixed(1),w,h,ST.sc].join('|');
 if(Math.abs(G.zoom-G.zoomFit)>.002||Math.abs(G.camY-G.camFit)>.5){drawScene(x,V,G,w,h);return}
 if(!G.ol||G.ol.key!==key){const c=document.createElement('canvas');c.width=Math.round(w*ST.sc);c.height=Math.round(h*ST.sc);const g=c.getContext('2d');g.setTransform(ST.sc,0,0,ST.sc,0,0);
  const keep=[G.debris,G.parts,G.rings];G.debris=[];G.parts=[];G.rings=[];drawScene(g,V,G,w,h);[G.debris,G.parts,G.rings]=keep;G.ol={key,c}}
 x.drawImage(G.ol.c,0,0,w,h);for(const d of G.debris)drawRBox(x,V,d);drawFx(x,V,G)}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${cl(a,0,1)})`}
// ---------- physique des débris et des particules ----------
function stepFx(G,dt){for(const d of G.debris){d.life+=dt;d.vy-=820*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.ang+=d.av*dt;if(d.fade&&d.life>d.fade*.3)d.alpha=cl(1-(d.life-d.fade*.3)/(d.fade*.7),0,1);
  if(d.burn&&Math.random()<.7){G.parts.push({x:d.x+(Math.random()-.5)*d.w,y:d.y+(Math.random()-.5)*d.h,z:d.z+(Math.random()-.5)*d.d,vx:(Math.random()-.5)*40,vy:40+Math.random()*80,vz:(Math.random()-.5)*40,g:-60,l:.5+Math.random()*.4,L:.9,c:Math.random()<.5?'#ffb347':'#ff6a2a',s:1+Math.random()*1.4})}}
 const floor=G.camY-1400;G.debris=G.debris.filter(d=>d.y>floor&&d.life<4&&d.alpha>0.01);
 for(const q of G.parts){q.l-=dt;q.vy+=(q.g||0)*dt;if(q.drag){const k=Math.exp(-q.drag*dt);q.vx*=k;q.vz*=k;q.vy*=k}q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;if(q.r!=null)q.r+=q.vr*dt}
 G.parts=G.parts.filter(q=>q.l>0);if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
 for(const r of G.rings)r.t+=dt/.55;G.rings=G.rings.filter(r=>r.t<1);for(const t of G.texts)t.t+=dt;G.texts=G.texts.filter(t=>t.t<1.5);if(G.lastDrop)G.lastDrop.t+=dt}
// ---------- univers : fond animé avec parallaxe verticale (la ville s'éloigne quand la tour monte) ----------
// Les couches fixes sont dessinées une fois dans une toile à la résolution de l'écran, puis réutilisées.
function layer(key,w,h,f){const s=ST.sc||1,k=key+'|'+w+'|'+h+'|'+s+'|'+env().id;let c=ST.bgc[k];if(!c){c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));const g=c.getContext('2d');g.scale(s,s);f(g);ST.bgc[k]=c;
  const ks=Object.keys(ST.bgc);if(ks.length>24)delete ST.bgc[ks[0]]}return c}
function blit(x,L,y,w,h){const s=ST.sc,Y=Math.round(y*s)/s;if(Y>=h||Y<=-h)return;x.drawImage(L,0,Y,w,h)}
function sky(x,w,h,E){x.drawImage(layer('sky',w,h,g=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,E.sky[0]);gr.addColorStop(.55,E.sky[1]);gr.addColorStop(1,E.sky[2]);g.fillStyle=gr;g.fillRect(0,0,w,h);
  const r=g.createRadialGradient(w/2,h*.45,Math.min(w,h)*.25,w/2,h*.5,Math.max(w,h)*.8);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=r;g.fillRect(0,0,w,h)}),0,0,w,h)}
function vignette(x,w,h){x.drawImage(layer('vig',w,h,g=>{const r=g.createRadialGradient(w/2,h*.45,Math.min(w,h)*.25,w/2,h*.5,Math.max(w,h)*.8);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=r;g.fillRect(0,0,w,h)}),0,0,w,h)}
function stars(g,w,h,n,seed,max){const r=rnd(seed);for(let i=0;i<n;i++){const a=r();g.fillStyle=`rgba(255,255,255,${.25+a*.75})`;const s=(.4+r()*max);g.beginPath();g.arc(r()*w,r()*h,s,0,7);g.fill()}}
function wrapY(y,h,m){m=m||0;const H=h+2*m;return((y+m)%H+H)%H-m}
function background(x,w,h,climb){const E=env(),t=ST.t,dbg=ST.dbg||{};sky(x,w,h,E);if(dbg.skyOnly)return;
 if(E.id=='neon'){{const L=layer('st',w,h,g=>stars(g,w,h,70,3,1)),oy=wrapY(climb*.03,h);blit(x,L,oy-h,w,h);blit(x,L,oy,w,h)}
  for(const[k,f,seed,col]of[[0,.18,11,'#2a1450'],[1,.32,23,'#170a33']]){const L=layer('city'+k,w,h,g=>{const r=rnd(seed),base=h*(k?1:.92);let X=-10;while(X<w+10){const bw=14+r()*30,bh=h*(.12+r()*(k?.28:.4));g.fillStyle=col;g.fillRect(X,base-bh,bw,bh+2);
     for(let y=base-bh+5;y<base-4;y+=6)for(let xx=X+3;xx<X+bw-3;xx+=5)if(r()<.32){g.fillStyle=r()<.5?'rgba(255,79,216,.75)':'rgba(56,232,255,.7)';g.fillRect(xx,y,2,2.4)}
     if(r()<.25){g.fillStyle=r()<.5?'#ff4fd8':'#38e8ff';g.fillRect(X+2,base-bh-3,bw-4,1.6)}X+=bw+1+r()*4}});
   blit(x,L,climb*f,w,h)}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const X=((t*(14+i*7)+i*90)%(w+60))-30,Y=h*(.18+i*.13)+Math.sin(t+i)*6+climb*.12;if(Y>h)continue;x.fillStyle=i%2?'rgba(56,232,255,.8)':'rgba(255,79,216,.8)';x.fillRect(X,Y,6,1.4);x.fillStyle=i%2?'rgba(56,232,255,.15)':'rgba(255,79,216,.15)';x.fillRect(X-10,Y-1,18,3.4)}x.restore()}
 else if(E.id=='sunset'){const sy=h*.58+climb*.1,R=Math.min(w,h)*.16;const g=x.createRadialGradient(w*.5,sy,0,w*.5,sy,R*3.2);g.addColorStop(0,'rgba(255,236,170,.9)');g.addColorStop(.3,'rgba(255,170,100,.35)');g.addColorStop(1,'rgba(255,120,120,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#ffe9a8';x.beginPath();x.arc(w*.5,sy,R,0,7);x.fill();
  for(let i=0;i<6;i++){const cy=wrapY(h*(.12+i*.15)+climb*(.05+i*.012),h,40),cx=((t*(4+i*1.5)+i*130)%(w+220))-110;x.fillStyle=`rgba(255,${190-i*12},${170-i*8},${.22+.05*(i%3)})`;
   for(let k=0;k<4;k++){x.beginPath();x.ellipse(cx+k*22,cy+(k%2)*4,28+k*4,8+(k%2)*3,0,0,7);x.fill()}}
  for(const[f,col,seed]of[[.2,'#6a2c5c',5],[.34,'#3a1a40',9]]){const L=layer('hill'+seed,w,h,g=>{const r=rnd(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,h);let y=h*(seed==5?.8:.88);for(let X=0;X<=w+20;X+=20){y=cl(y+(r()-.5)*18,h*.7,h*.95);g.lineTo(X,y)}g.lineTo(w,h);g.closePath();g.fill()});blit(x,L,climb*f,w,h)}}
 else if(E.id=='ocean'){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const a=-.35+i*.14+Math.sin(t*.3+i)*.04,X=w*(.1+i*.17);x.fillStyle=`rgba(160,255,250,${.05+.02*Math.sin(t+i)})`;x.beginPath();x.moveTo(X,-10);x.lineTo(X+Math.tan(a)*h+40,h);x.lineTo(X+Math.tan(a)*h-10,h);x.lineTo(X-12,-10);x.closePath();x.fill()}
  for(let i=0;i<26;i++){const r=rnd(i*7+1),bx=r()*w+Math.sin(t*1.3+i)*6,by=wrapY(h-((t*(18+r()*30)+r()*h)+climb*.2),h,10),s=1+r()*2.6;x.strokeStyle='rgba(200,255,255,.55)';x.lineWidth=.6;x.beginPath();x.arc(bx,by,s,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.5)';x.fillRect(bx-s*.4,by-s*.5,.8,.8)}x.restore();
  const L=layer('reef',w,h,g=>{const r=rnd(77);g.fillStyle='#03304a';g.beginPath();g.moveTo(0,h);for(let X=0;X<=w+10;X+=10)g.lineTo(X,h*.86+Math.sin(X*.05)*8+r()*6);g.lineTo(w,h);g.closePath();g.fill();for(let i=0;i<14;i++){const X=r()*w,H=20+r()*50;g.strokeStyle=r()<.5?'#0c6b6a':'#0a4f6e';g.lineWidth=2.5;g.beginPath();g.moveTo(X,h);g.quadraticCurveTo(X+10,h-H*.6,X+(r()-.5)*16,h*.86-H*.4);g.stroke()}});
  blit(x,L,climb*.3,w,h)}
 else if(E.id=='space'){for(const[f,seed,n,m]of[[.02,1,90,.7],[.06,2,60,1],[.12,3,30,1.5]]){const L=layer('sp'+seed,w,h,g=>stars(g,w,h,n,seed,m)),oy=wrapY(climb*f,h);blit(x,L,oy-h,w,h);blit(x,L,oy,w,h)}
  x.save();x.globalCompositeOperation='lighter';for(const[cx,cy,r,c]of[[.25,.3,.5,'rgba(155,140,255,.18)'],[.8,.6,.45,'rgba(255,158,240,.14)']]){const g=x.createRadialGradient(w*cx,h*cy,0,w*cx,h*cy,Math.max(w,h)*r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}x.restore();
  const px=w*.78,py=h*.22+climb*.04,R=Math.min(w,h)*.11;if(py<h+R){const g=x.createLinearGradient(px-R,py-R,px+R,py+R);g.addColorStop(0,'#ffb3e6');g.addColorStop(1,'#5a3aa8');x.fillStyle=g;x.beginPath();x.arc(px,py,R,0,7);x.fill();
   x.strokeStyle='rgba(255,220,250,.55)';x.lineWidth=R*.12;x.beginPath();x.ellipse(px,py,R*1.7,R*.42,-.35,0,7);x.stroke()}
  const k=(t*.25)%3;if(k<.5){const X=w*(.1+k*1.4),Y=h*(.1+k*.5);x.strokeStyle=`rgba(255,255,255,${1-k*2})`;x.lineWidth=1;x.beginPath();x.moveTo(X,Y);x.lineTo(X-30,Y-12);x.stroke()}}
 else if(E.id=='crystal'){x.save();for(let i=0;i<16;i++){const r=rnd(i*31+5),cx=r()*w+Math.sin(t*.4+i)*8,cy=wrapY(r()*h+climb*(.05+r()*.15)-t*4,h,30),s=6+r()*16,a=t*.3*(r()<.5?-1:1)+r()*6;
   x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=`hsla(${250+r()*80},90%,85%,.35)`;x.beginPath();x.moveTo(0,-s*1.6);x.lineTo(s*.6,0);x.lineTo(0,s*1.6);x.lineTo(-s*.6,0);x.closePath();x.fill();x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.7;x.stroke();x.restore()}x.restore();
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<20;i++){const r=rnd(i*9+2),tw=Math.sin(t*2.5+i*1.7);if(tw<.7)continue;const X=r()*w,Y=wrapY(r()*h+climb*.1,h),s=(tw-.7)*14;x.fillStyle='rgba(255,255,255,.9)';x.fillRect(X-s,Y-.4,2*s,.8);x.fillRect(X-.4,Y-s,.8,2*s)}x.restore()}
 else if(E.id=='cyber'){const hz=h*.62+climb*.15;if(hz<h){const R=Math.min(w,h)*.2,g=x.createLinearGradient(0,hz-R*2,0,hz);g.addColorStop(0,'#ffd23f');g.addColorStop(1,'#ff2fb4');x.save();x.beginPath();x.arc(w/2,hz-R*.3,R,Math.PI,0);x.clip();x.fillStyle=g;x.fillRect(w/2-R,hz-R*1.4,2*R,R*1.2);
   x.fillStyle=env().sky[2];for(let i=0;i<6;i++){const y=hz-R*.3-i*R*.16,th=1+i*.6;x.fillRect(w/2-R,y-th,2*R,th)}x.restore();
   x.fillStyle='rgba(10,0,24,.85)';x.fillRect(0,hz,w,h-hz);x.save();x.beginPath();x.rect(0,hz,w,h-hz);x.clip();x.strokeStyle='rgba(255,47,180,.75)';x.lineWidth=.8;
   for(let i=-14;i<=14;i++){x.beginPath();x.moveTo(w/2+i*8,hz);x.lineTo(w/2+i*90,h);x.stroke()}const ph=(t*.6)%1;for(let k=0;k<12;k++){const u=(k+ph)/12,y=hz+(h-hz)*u*u;x.strokeStyle=`rgba(24,240,255,${.25+u*.6})`;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}x.restore()}
  x.fillStyle='rgba(255,255,255,.025)';for(let y=0;y<h;y+=3)x.fillRect(0,y,w,1)}
 }
// ---------- interface ----------
function rr(x,X,Y,W,H,r){r=Math.max(0,Math.min(r,W/2,H/2));x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
function txt(x,s,X,Y,o){o=o||{};let size=o.size||14;x.font=`${o.w||700} ${size}px ${FONT}`;if(o.max){const m=x.measureText(s).width;if(m>o.max){size=Math.max(6,size*o.max/m);x.font=`${o.w||700} ${size}px ${FONT}`}}
 x.textAlign=o.al||'center';x.textBaseline=o.bl||'middle';if(o.sh){x.fillStyle=o.sh;x.fillText(s,X,Y+Math.max(1,size*.07))}if(o.glow){x.save();x.shadowColor=o.glow;x.shadowBlur=size*.35*ST.sc;x.fillStyle=o.c||'#fff';x.fillText(s,X,Y);x.restore()}x.fillStyle=o.c||'#ffffff';x.fillText(s,X,Y);return size}
const tw=(x,s,size,w)=>{x.font=`${w||700} ${size}px ${FONT}`;return x.measureText(s).width};
const pressed=id=>Object.values(ST.touch).some(t=>t.btn&&t.btn.id===id&&!t.moved&&(t.btn.k==null||t.btn.k===t.k));
function button(x,b,lab,o){o=o||{};const on=pressed(b.id)&&(b.k==null||Object.values(ST.touch).some(t=>t.btn&&t.btn.k===b.k)),r=o.r!=null?o.r:Math.min(b.h/2,ST.L.u(18)),dy=on?ST.L.u(2):0,c0=o.c0||'#3d7bff',c1=o.c1||'#2a4fd6';
 if(!o.flat){x.fillStyle=o.shadow||'rgba(5,2,20,.45)';rr(x,b.x,b.y+ST.L.u(4),b.w,b.h,r);x.fill()}
 const g=x.createLinearGradient(0,b.y+dy,0,b.y+dy+b.h);g.addColorStop(0,o.dis?'#4a4660':c0);g.addColorStop(1,o.dis?'#35314a':c1);x.fillStyle=g;rr(x,b.x,b.y+dy,b.w,b.h,r);x.fill();
 const hl=x.createLinearGradient(0,b.y+dy,0,b.y+dy+b.h*.5);hl.addColorStop(0,'rgba(255,255,255,.35)');hl.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=hl;rr(x,b.x+1,b.y+dy+1,b.w-2,b.h*.55,r);x.fill();
 if(o.glow){x.save();x.globalCompositeOperation='lighter';x.strokeStyle=hexA(o.glow,.35+.25*Math.sin(ST.t*4));x.lineWidth=ST.L.u(3);rr(x,b.x-ST.L.u(2),b.y+dy-ST.L.u(2),b.w+ST.L.u(4),b.h+ST.L.u(4),r+ST.L.u(2));x.stroke();x.restore()}
 if(on){x.fillStyle='rgba(0,0,0,.15)';rr(x,b.x,b.y+dy,b.w,b.h,r);x.fill()}
 if(lab!=null){const sz=o.size||Math.min(b.h*.38,ST.L.u(20));let X=b.x+b.w/2;if(o.coin){const cw=tw(x,lab,sz,800)+sz*1.3;X=b.x+b.w/2-cw/2+sz*1.3;coin(x,X-sz*.75,b.y+dy+b.h/2,sz*.48)
   txt(x,lab,X,b.y+dy+b.h/2,{size:sz,w:800,al:'left',sh:'rgba(0,0,0,.25)',c:o.tc});}else txt(x,lab,X,b.y+dy+b.h/2+(o.sub?-sz*.35:0),{size:sz,w:800,sh:'rgba(0,0,0,.25)',max:b.w-ST.L.u(16),c:o.tc});
  if(o.sub)txt(x,o.sub,X,b.y+dy+b.h/2+sz*.6,{size:sz*.5,w:600,c:'rgba(255,255,255,.8)',max:b.w-ST.L.u(12)})}
 ST.btns.push(b);return b}
function iconBtn(x,b,kind){const on=pressed(b.id),r=b.w/2,cx=b.x+r,cy=b.y+r+(on?ST.L.u(1):0);x.fillStyle=on?'rgba(255,255,255,.3)':'rgba(255,255,255,.14)';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=ST.L.u(1);x.stroke();
 x.strokeStyle='#ffffff';x.fillStyle='#ffffff';x.lineWidth=ST.L.u(2.4);x.lineCap='round';x.lineJoin='round';const s=r*.38;x.beginPath();
 if(kind=='back'){x.moveTo(cx+s*.9,cy);x.lineTo(cx-s,cy);x.moveTo(cx-s*.1,cy-s*.9);x.lineTo(cx-s,cy);x.lineTo(cx-s*.1,cy+s*.9);x.stroke()}
 else if(kind=='pause'){x.lineWidth=ST.L.u(3);x.moveTo(cx-s*.45,cy-s*.8);x.lineTo(cx-s*.45,cy+s*.8);x.moveTo(cx+s*.45,cy-s*.8);x.lineTo(cx+s*.45,cy+s*.8);x.stroke()}
 else if(kind=='snd'||kind=='mute'){x.moveTo(cx-s*1.1,cy-s*.4);x.lineTo(cx-s*.5,cy-s*.4);x.lineTo(cx+s*.1,cy-s);x.lineTo(cx+s*.1,cy+s);x.lineTo(cx-s*.5,cy+s*.4);x.lineTo(cx-s*1.1,cy+s*.4);x.closePath();x.fill();x.beginPath();
  if(kind=='snd'){x.arc(cx+s*.2,cy,s*.65,-.9,.9);x.stroke();x.beginPath();x.arc(cx+s*.2,cy,s*1.1,-.9,.9);x.stroke()}else{x.moveTo(cx+s*.5,cy-s*.45);x.lineTo(cx+s*1.2,cy+s*.45);x.moveTo(cx+s*1.2,cy-s*.45);x.lineTo(cx+s*.5,cy+s*.45);x.stroke()}}
 x.lineCap='butt';ST.btns.push(b)}
function coin(x,X,Y,r){const g=x.createLinearGradient(X-r,Y-r,X+r,Y+r);g.addColorStop(0,'#fff1a6');g.addColorStop(.5,'#ffc531');g.addColorStop(1,'#d98a0b');x.fillStyle=g;x.beginPath();x.arc(X,Y,r,0,7);x.fill();
 x.strokeStyle='rgba(150,80,0,.55)';x.lineWidth=r*.14;x.beginPath();x.arc(X,Y,r*.68,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(X-r*.3,Y-r*.35,r*.28,r*.14,-.6,0,7);x.fill()}
function coinPill(x,X,Y,h){const d=data(),s=String(d.coins),sz=h*.5,w=tw(x,s,sz,800)+h*1.25;x.fillStyle='rgba(0,0,0,.35)';rr(x,X-w,Y,w,h,h/2);x.fill();x.strokeStyle='rgba(255,210,80,.45)';x.lineWidth=ST.L.u(1);x.stroke();
 coin(x,X-w+h/2,Y+h/2,h*.34);txt(x,s,X-h*.35,Y+h/2,{size:sz,w:800,al:'right',c:'#ffe27a'});return w}
function check(x,X,Y,s,c){x.strokeStyle=c||'#3ee87a';x.lineWidth=s*.22;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(X-s*.45,Y);x.lineTo(X-s*.1,Y+s*.35);x.lineTo(X+s*.5,Y-s*.35);x.stroke();x.lineCap='butt'}
function bar(x,X,Y,W,H,v,c0,c1){x.fillStyle='rgba(255,255,255,.14)';rr(x,X,Y,W,H,H/2);x.fill();if(v>0){const g=x.createLinearGradient(X,0,X+W,0);g.addColorStop(0,c0);g.addColorStop(1,c1||c0);x.fillStyle=g;rr(x,X,Y,Math.max(H,W*cl(v,0,1)),H,H/2);x.fill()}}
function panel(x,X,Y,W,H,o){o=o||{};x.fillStyle='rgba(4,2,16,.4)';rr(x,X,Y+ST.L.u(6),W,H,ST.L.u(22));x.fill();const g=x.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,o.c0||'rgba(40,26,82,.96)');g.addColorStop(1,o.c1||'rgba(20,12,46,.97)');x.fillStyle=g;rr(x,X,Y,W,H,ST.L.u(22));x.fill();
 x.strokeStyle=o.stroke||'rgba(255,255,255,.14)';x.lineWidth=ST.L.u(1.2);x.stroke()}
// mise en page : u(v) convertit des pixels CSS en unités du jeu
function layout(w,h){const cpp=(()=>{try{return AX.cv.getBoundingClientRect().width/AX.L.W||1.4}catch(e){return 1.4}})(),u=v=>v/cpp;
 const L={w,h,cpp,u,land:w>h*1.15,m:Math.max(u(14),Math.min(w,h)*.035)};L.top=L.m;L.ib=u(46);ST.L=L;ST.W=w;ST.H=h;ST.touch={};return L}
// vue de jeu : échelle pour que la base occupe ~la moitié de la largeur (ou de la hauteur en paysage)
function playView(w,h,G,zoom){const L=ST.L,base=Math.min(w*.52,h*.44,L.u(420)),sc=base/(2*BASE*C30)*zoom;return{sc,ox:w/2,oy:h*(G&&G.over?.5:.6),camY:G?G.camY:0}}
function drawHome(x,w,h){const L=ST.L,u=L.u,d=data(),E=env(),D=ST.D,land=L.land;
 // tailles adaptées à la hauteur ; les boutons sont ancrés en bas, la tour d'aperçu occupe l'espace libre
 const f=cl(land?h/u(430):h/u(760),.62,1),gap=u(12)*f,ch=Math.max(u(48),u(64)*f),ph=Math.max(u(50),u(66)*f),rh=Math.max(u(46),u(52)*f),lab=u(24)*f;
 const cx=land?w*.73:w/2,colW=land?Math.min(w*.44,u(360)):Math.min(w-2*L.m,u(340));
 const tot=ch+gap*1.4+ph+gap+rh,ry=land?(h+tot)/2-rh+L.top*.5:h-L.m-rh-(h>u(600)?lab:0),py=ry-gap-ph,by=py-gap*1.4-ch;
 const ts=Math.min(land?w*.07:w*.15,u(64),(land?h*.12:h*.085)),tx=land?w*.27:cx,ty=L.top+L.ib+ts*(land?.55:.7);
 const area=land?{x:0,y:ty+ts*1.2,w:w*.54,h:h-(ty+ts*1.2)}:{x:0,y:ty+ts*1.4,w,h:Math.max(u(80),by-(ty+ts*1.4)-u(6))};
 const sc=Math.min(area.w*.5,area.h*.48)/(2*BASE*C30),V={sc,ox:area.x+area.w/2,oy:area.y+area.h*(land?.6:.58),camY:D.camY};x.globalAlpha=D.fade;drawScene(x,V,D,w,h);x.globalAlpha=1;
 // titre
 const g=x.createLinearGradient(tx-ts*2.5,0,tx+ts*2.5,0);g.addColorStop(0,'#ffffff');g.addColorStop(.5,E.acc2);g.addColorStop(1,E.acc);
 const bob=Math.round(Math.sin(ST.t*2)*u(2)*ST.sc)/ST.sc,tw0=ts*5,th0=ts*2.2,TL=layer('title'+Math.round(ts*10),tw0,th0,q=>{const gg=q.createLinearGradient(tw0/2-ts*2.5,0,tw0/2+ts*2.5,0);gg.addColorStop(0,'#ffffff');gg.addColorStop(.5,E.acc2);gg.addColorStop(1,E.acc);
  txt(q,'PERFECT',tw0/2,ts*.6,{size:ts,w:900,c:gg,glow:E.acc,sh:'rgba(0,0,0,.35)'});txt(q,'S T A C K',tw0/2,ts*1.55,{size:ts*.55,w:800,c:'#ffffff',glow:E.acc2})});
 x.drawImage(TL,Math.round((tx-tw0/2)*ST.sc)/ST.sc,Math.round((ty-ts*.6+bob)*ST.sc)/ST.sc,tw0,th0);
 // meilleur score
 panel(x,cx-colW/2,by,colW,ch,{c0:'rgba(255,255,255,.1)',c1:'rgba(255,255,255,.04)'});const ns=Math.min(u(26),ch*.42);
 txt(x,'MEILLEUR SCORE',cx-colW/4,by+ch*.3,{size:u(11)*Math.max(f,.8),w:700,c:'rgba(255,255,255,.65)'});txt(x,String(d.st.bestS|0),cx-colW/4,by+ch*.68,{size:ns,w:900});
 txt(x,'ÉTAGE MAX',cx+colW/4,by+ch*.3,{size:u(11)*Math.max(f,.8),w:700,c:'rgba(255,255,255,.65)'});txt(x,String(d.st.bestH|0),cx+colW/4,by+ch*.68,{size:ns,w:900});x.fillStyle='rgba(255,255,255,.15)';x.fillRect(cx,by+ch*.2,u(1),ch*.6);
 // JOUER, COLLECTION, MISSIONS
 const sp=1+.03*Math.sin(ST.t*3.2);x.save();x.translate(cx,py+ph/2);x.scale(sp,sp);x.translate(-cx,-(py+ph/2));button(x,{id:'play',x:cx-colW/2,y:py,w:colW,h:ph},'JOUER',{c0:'#36e07f',c1:'#14a85a',size:Math.min(u(28),ph*.44),glow:'#5dffa0'});x.restore();
 const rw=(colW-u(12))/2,D2=daily(),nd=D2.ids.filter(i=>D2.done[i]).length;
 button(x,{id:'coll',x:cx-colW/2,y:ry,w:rw,h:rh},'COLLECTION',{c0:'#8a5cff',c1:'#5a2fd6',size:Math.min(u(16),rh*.32)});button(x,{id:'miss',x:cx+u(6),y:ry,w:rw,h:rh},'MISSIONS',{c0:'#ff8a3d',c1:'#e0541a',size:Math.min(u(16),rh*.32),sub:nd+'/3 DU JOUR'});
 // barre du haut
 iconBtn(x,{id:'quit',x:L.m,y:L.top,w:L.ib,h:L.ib},'back');iconBtn(x,{id:'mute',x:L.m+L.ib+u(10),y:L.top,w:L.ib,h:L.ib},ST.mute?'mute':'snd');coinPill(x,w-L.m,L.top+u(5),L.ib-u(10));
 if(h>u(600))txt(x,'Univers : '+E.nom,cx,ry+rh+lab*.75,{size:u(12),w:600,c:'rgba(255,255,255,.6)'})}
function drawHud(x,w,h,G){const L=ST.L,u=L.u,E=env();
 if(!G.over){iconBtn(x,{id:'pause',x:L.m,y:L.top,w:L.ib,h:L.ib},'pause')}
 const sp=1+.25*G.scorePop,sy=L.top+u(40);x.save();x.translate(w/2,sy);x.scale(sp,sp);txt(x,String(G.score),0,0,{size:Math.min(u(62),h*.09),w:900,sh:'rgba(0,0,0,.3)',glow:G.combo>=3?E.acc:null});x.restore();
 const lv=levelOf(G.height),pr=(G.height%LEVEL_EVERY)/LEVEL_EVERY,bw=Math.min(u(150),w*.4),by=sy+u(42);
 txt(x,'ÉTAGE '+G.height,w/2-bw/2,by,{size:u(12),w:800,al:'left',c:'rgba(255,255,255,.8)'});const lp=1+.3*G.levelPop;x.save();x.translate(w/2+bw/2,by);x.scale(lp,lp);txt(x,'NIVEAU '+lv,0,0,{size:u(12),w:800,al:'right',c:E.acc2});x.restore();
 bar(x,w/2-bw/2,by+u(10),bw,u(6),pr,E.acc2,E.acc);
 if(G.combo>=2&&!G.over){const s='PERFECT x'+G.combo,sz=u(13),pw=tw(x,s,sz,800)+u(24),py=by+u(26);const g=x.createLinearGradient(w/2-pw/2,0,w/2+pw/2,0);g.addColorStop(0,E.acc);g.addColorStop(1,E.acc2);x.fillStyle=g;rr(x,w/2-pw/2,py,pw,u(24),u(12));x.fill();txt(x,s,w/2,py+u(12),{size:sz,w:900})}
 if(!G.started&&!G.over){const a=.55+.45*Math.sin(ST.t*4);x.globalAlpha=a;txt(x,ST.touchUI?'TOUCHE L’ÉCRAN POUR POSER LE BLOC':'CLIQUE OU APPUIE SUR ESPACE POUR POSER',w/2,h-L.m-u(24),{size:u(14),w:800,max:w-2*L.m});x.globalAlpha=1}
 // textes PERFECT
 for(const t of G.texts){if(t.t<0)continue;const k=easeOutBack(Math.min(1,t.t*3.2)),a=cl(t.t<1?1:(1.5-t.t)*2,0,1),y0=Math.max(L.top+u(150),h*.6-Math.min(w*.52,h*.44)*.55)-(t.small?-u(30):t.coin?-u(14):0)-t.t*u(26);x.globalAlpha=a;
  if(t.coin){x.save();x.translate(w/2,y0+u(34));x.scale(k,k);const s=u(18);coin(x,-tw(x,t.s,s,900)/2-s*.6,0,s*.45);txt(x,t.s,s*.2,0,{size:s,w:900,c:'#ffe27a',sh:'rgba(0,0,0,.4)'});x.restore();x.globalAlpha=1;continue}
  if(t.small){txt(x,t.s,w/2,y0+u(48),{size:u(13),w:800,c:E.acc2,sh:'rgba(0,0,0,.4)'});x.globalAlpha=1;continue}
  const sz=Math.min(u(30)+t.big*u(8),w*.11);x.save();x.translate(w/2,y0);x.scale(k,k);const g=x.createLinearGradient(-sz*3,0,sz*3,0);g.addColorStop(0,'#ffffff');g.addColorStop(.5,t.big>=2?'#ffe27a':E.acc2);g.addColorStop(1,'#ffffff');
  txt(x,t.s,0,0,{size:sz,w:900,c:g,glow:t.big>=1?E.acc:E.acc2,sh:'rgba(0,0,0,.35)',max:w-2*L.m});x.restore();x.globalAlpha=1}
 if(G.flash>0){x.globalAlpha=Math.min(.5,G.flash);x.fillStyle=G.flashC;x.fillRect(0,0,w,h);x.globalAlpha=1}
 if(G.slow>0||ST.ts<.99){x.globalAlpha=(1-ST.ts)*.5;const g=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,E.acc);x.fillStyle=g;x.fillRect(0,0,w,h);x.globalAlpha=1}}
function drawOver(x,w,h,G){const L=ST.L,u=L.u,O=ST.over,t=G.overT-.9,E=env();if(!O||t<0)return;const a=ease(t*2.5);x.fillStyle=`rgba(5,2,18,${.55*a})`;x.fillRect(0,0,w,h);
 const items=[...O.newM.map(m=>['Mission accomplie : '+m.t,m.r]),...O.newA.map(q=>[(q.env?'':'Succès : ')+q.t,q.r])],list=Math.min(items.length,3),more=items.length>3?u(18):0;
 const infoH=u(250)+list*u(24)+more,btnH=u(56),tall=infoH+btnH*2+u(52),wide=tall>h-2*L.m-u(10);
 const pw=wide?Math.min(w-2*L.m,u(700)):Math.min(w-2*L.m,u(380)),ph=wide?Math.min(h-2*L.m-u(14),infoH+u(20)):tall,px=w/2-pw/2,py=cl(h/2-ph/2+u(6),L.m+u(14),h-ph-L.m)+(1-a)*u(60),cw=wide?pw*.58:pw;x.globalAlpha=a;
 panel(x,px,py,pw,ph,{stroke:hexA(E.acc2,.5)});const cx=px+cw/2;let y=py+u(30);
 if(O.rec){const g=x.createLinearGradient(px,0,px+pw,0);g.addColorStop(0,E.acc);g.addColorStop(1,E.acc2);x.fillStyle=g;rr(x,cx-u(90),py-u(14),u(180),u(30),u(15));x.fill();txt(x,'NOUVEAU RECORD !',cx,py+u(1),{size:u(14),w:900})}
 txt(x,'FIN DE PARTIE',cx,y,{size:u(15),w:800,c:'rgba(255,255,255,.7)'});y+=u(38);const sc=Math.round(O.score*ease(cl(t/1.1,0,1)));txt(x,String(sc),cx,y,{size:u(54),w:900,glow:E.acc,sh:'rgba(0,0,0,.3)'});y+=u(34);
 txt(x,O.rec?(O.prevBest?'Ancien record : '+O.prevBest:'Premier record !'):'Meilleur score : '+data().st.bestS,cx,y,{size:u(12),w:600,c:'rgba(255,255,255,.65)'});y+=u(26);
 [['ÉTAGES',O.height],['PERFECT',O.perfects],['COMBO MAX','x'+O.maxCombo]].forEach((c,i)=>{const X=px+cw*(i+.5)/3;txt(x,String(c[1]),X,y,{size:u(20),w:900});txt(x,c[0],X,y+u(18),{size:u(10),w:700,c:'rgba(255,255,255,.6)'})});y+=u(44);
 const cg=Math.round(O.coins*ease(cl((t-.3)/1,0,1)));x.fillStyle='rgba(255,200,60,.12)';rr(x,px+u(16),y-u(18),cw-u(32),u(36),u(12));x.fill();coin(x,cx-u(48),y,u(11));txt(x,'+'+cg,cx-u(30),y,{size:u(20),w:900,al:'left',c:'#ffe27a'});
 txt(x,'Hauteur '+O.coinH+' · PERFECT et séries '+O.coinP+' · Bonus '+(O.coinEnd+O.coinRec),cx,y+u(26),{size:u(10.5),w:600,c:'rgba(255,255,255,.6)',max:cw-u(30)});y+=u(48);
 items.slice(0,3).forEach(([s0,r])=>{check(x,px+u(28),y,u(12));txt(x,s0,px+u(40),y,{size:u(12),w:700,al:'left',max:cw-u(110)});if(r){coin(x,px+cw-u(50),y,u(7));txt(x,'+'+r,px+cw-u(40),y,{size:u(12),w:800,al:'left',c:'#ffe27a'})}y+=u(24)});
 if(items.length>3)txt(x,'et '+(items.length-3)+' autre'+(items.length>4?'s':''),cx,y-u(4),{size:u(11),w:600,c:'rgba(255,255,255,.6)'});
 if(t>.15){if(wide){const bx=px+cw+u(10),bw=pw-cw-u(28),by=py+ph/2-(btnH*1.0+2*btnH*.8+u(24))/2;
   button(x,{id:'replay',x:bx,y:by,w:bw,h:btnH},'REJOUER',{c0:'#36e07f',c1:'#14a85a',size:u(22),glow:'#5dffa0'});button(x,{id:'home',x:bx,y:by+btnH+u(12),w:bw,h:btnH*.8},'ACCUEIL',{c0:'#6d5ae6',c1:'#4b36b8',size:u(14)});button(x,{id:'quit',x:bx,y:by+btnH*1.8+u(24),w:bw,h:btnH*.8},'BORNE',{c0:'#e04f8f',c1:'#a8276a',size:u(14)})}
  else{button(x,{id:'replay',x:px+u(18),y:py+ph-btnH*1.8-u(30),w:pw-u(36),h:btnH},'REJOUER',{c0:'#36e07f',c1:'#14a85a',size:u(22),glow:'#5dffa0'});
   const hw=(pw-u(36)-u(10))/2;button(x,{id:'home',x:px+u(18),y:py+ph-btnH*.8-u(18),w:hw,h:btnH*.8},'ACCUEIL',{c0:'#6d5ae6',c1:'#4b36b8',size:u(14)});button(x,{id:'quit',x:px+u(28)+hw,y:py+ph-btnH*.8-u(18),w:hw,h:btnH*.8},'BORNE',{c0:'#e04f8f',c1:'#a8276a',size:u(14)})}}
 x.globalAlpha=1}
function drawPause(x,w,h){const L=ST.L,u=L.u;x.fillStyle='rgba(5,2,18,.62)';x.fillRect(0,0,w,h);const pw=Math.min(w-2*L.m,u(320)),bh=u(54),ph=u(80)+4*(bh+u(12)),px=w/2-pw/2,py=h/2-ph/2;panel(x,px,py,pw,ph);
 txt(x,'PAUSE',w/2,py+u(40),{size:u(26),w:900});let y=py+u(76);const B=(id,lab,c0,c1)=>{button(x,{id,x:px+u(20),y,w:pw-u(40),h:bh},lab,{c0,c1,size:u(17)});y+=bh+u(12)};
 B('resume','REPRENDRE','#36e07f','#14a85a');B('mute',ST.mute?'SON : COUPÉ':'SON : ACTIVÉ','#3d7bff','#2a4fd6');B('home','ACCUEIL','#6d5ae6','#4b36b8');B('quit','RETOUR À LA BORNE','#e04f8f','#a8276a')}
function header(x,w,title){const L=ST.L,u=L.u;iconBtn(x,{id:'home',x:L.m,y:L.top,w:L.ib,h:L.ib},'back');txt(x,title,w/2,L.top+L.ib/2,{size:u(22),w:900,max:w-2*L.m-2*L.ib-u(100)});coinPill(x,w-L.m,L.top+u(5),L.ib-u(10))}
function tabs(x,w,y,list,cur,id){const L=ST.L,u=L.u,tw0=Math.min(w-2*L.m,u(380)),th=u(42),X0=w/2-tw0/2;x.fillStyle='rgba(0,0,0,.3)';rr(x,X0,y,tw0,th,th/2);x.fill();const iw=tw0/list.length;
 list.forEach(([k,lab],i)=>{const b={id,k,x:X0+i*iw,y,w:iw,h:th};if(k===cur){const g=x.createLinearGradient(0,y,0,y+th);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#d9d2ff');x.fillStyle=g;rr(x,b.x+u(3),y+u(3),iw-u(6),th-u(6),(th-u(6))/2);x.fill()}
  txt(x,lab,b.x+iw/2,y+th/2,{size:u(13),w:800,c:k===cur?'#2a1660':'#ffffff',max:iw-u(10)});ST.btns.push(b)});return y+th}
// liste qui défile (cartes cliquables, découpées dans leur zone)
function scrollArea(o,id,y0,y1,content){o.max=Math.max(0,content-(y1-y0));o.scroll=cl(o.scroll,0,o.max);return{id,x:0,y:y0,w:ST.W,h:y1-y0,o}}
function itemState(k,it){const d=data();if(owns(k,it.id))return d.eq[k]===it.id?'eq':'own';if(it.ach)return'ach';return'buy'}
function drawPreview(x,k,it,X,Y,W,H){x.save();rr(x,X,Y,W,H,ST.L.u(14));x.clip();
 if(k=='env'){const g=x.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,it.sky[0]);g.addColorStop(.6,it.sky[1]);g.addColorStop(1,it.sky[2]);x.fillStyle=g;x.fillRect(X,Y,W,H);
  const r=x.createRadialGradient(X+W/2,Y+H*.8,0,X+W/2,Y+H*.8,W*.6);r.addColorStop(0,it.acc+'66');r.addColorStop(1,it.acc+'00');x.fillStyle=r;x.fillRect(X,Y,W,H);ST.envOv=it}
 else{x.fillStyle='rgba(255,255,255,.06)';x.fillRect(X,Y,W,H)}
 const sc=Math.min(W*.6,H*.62)/(2*BASE*C30),V={sc,ox:X+W/2,oy:Y+H*.56,camY:BH*1.2},sk=k=='skin'?it.id:k=='env'?'classic':skin();
 if(k=='fx'){drawBlock(x,V,{x:0,z:0,w:BASE,d:BASE,y:-BH,lvl:1},sk);const ph=(ST.t*.8)%1.4,s=ph<1?ease(ph):1;drawFxPreview(x,V,it.id,sk,ph)}
 else for(let i=0;i<3;i++)drawBlock(x,V,{x:0,z:0,w:BASE-i*8,d:BASE-i*8,y:-BH+i*BH,lvl:i+1},sk);
 ST.envOv=null;x.restore()}
function drawFxPreview(x,V,id,sk,ph){const t=Math.min(ph,1),g=-520;const b={x:BASE*.75,z:0,w:BASE*.4,d:BASE,y:BH*.5};
 if(id=='fall'){drawRBox(x,V,{x:b.x+20*t,y:b.y+g*t*t*.5*0,z:0,w:b.w,h:BH,d:b.d,ax:[0,0,-1],ang:t*1.6,alpha:1-t*.6,sk,lvl:1});return}
 if(id=='shatter'){for(let i=0;i<3;i++)drawRBox(x,V,{x:b.x+20*t+i*6*t,y:b.y+(i-1)*BH*.3+40*t*(i-1),z:(i-1)*30*(1+t),w:b.w*.9,h:BH*.9,d:b.d/3*.9,ax:norm([1,i-1,.5]),ang:t*(3+i),alpha:1-t*.5,sk,lvl:1});return}
 if(id=='pixel'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)drawRBox(x,V,{x:b.x+(i-1)*12+30*t*(i+.5),y:b.y+(j-1)*10+30*t*(j-1),z:(j-1)*30+t*20*(i-1),w:11,h:9,d:28,ax:norm([i-1,1,j-1]),ang:t*5,alpha:1-t*.8,sk,lvl:1});return}
 if(id=='spark'){drawRBox(x,V,{x:b.x+10*t,y:b.y,z:0,w:b.w,h:BH,d:b.d,ax:[0,0,-1],ang:t*.6,alpha:1-t,sk,lvl:1,burn:1,life:.3});x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const r=rnd(i+1),p=P(V,b.x+(r()-.5)*b.w,b.y+t*60*r(),(r()-.5)*b.d);x.fillStyle=i%2?'#ffb347':'#ff6a2a';x.beginPath();x.arc(p[0],p[1],V.sc*3*(1-t)+.5,0,7);x.fill()}x.restore();return}
 if(id=='confetti'){const C=['#ff4f8b','#ffd23f','#3ee8b5','#4fa8ff','#b06bff'];for(let i=0;i<18;i++){const r=rnd(i*3+1),a=r()*6.28,p=P(V,b.x+Math.cos(a)*80*t,b.y+120*t*r()-80*t*t,Math.sin(a)*80*t);x.fillStyle=C[i%5];x.save();x.translate(p[0],p[1]);x.rotate(t*8+i);x.fillRect(-V.sc*4,-V.sc*2,V.sc*8,V.sc*4);x.restore()}}}
function drawColl(x,w,h){const L=ST.L,u=L.u,C=ST.coll,k=C.tab,d=data();header(x,w,'COLLECTION');let y=tabs(x,w,L.top+L.ib+u(14),[['skin','BLOCS'],['fx','EFFETS'],['env','UNIVERS']],k,'tab')+u(12);
 const list=CAT[k],cols=L.land?Math.max(3,Math.min(6,Math.floor((w-2*L.m)/u(130)))):w>u(520)?3:2,gap=u(12),bot0=h-L.m-u(64),cw=Math.min(u(200),(w-2*L.m-(cols-1)*gap)/cols,((bot0-y)*.97-u(86))/.78),chh=cw*.78+u(86),gw=cols*cw+(cols-1)*gap,x0=w/2-gw/2;
 const bot=h-L.m-u(64),A=scrollArea(C,'scroll',y,bot,Math.ceil(list.length/cols)*(chh+gap));ST.btns.push(A);x.save();x.beginPath();x.rect(0,y,w,bot-y);x.clip();
 list.forEach((it,i)=>{const X=x0+(i%cols)*(cw+gap),Y=y+Math.floor(i/cols)*(chh+gap)-C.scroll;if(Y>bot||Y+chh<y)return;const st=itemState(k,it),sel=C.sel===it.id,b={id:'item',k:it.id,x:X,y:Y,w:cw,h:chh,clip:[y,bot]};
  panel(x,X,Y,cw,chh,{c0:sel?'rgba(110,80,220,.95)':'rgba(255,255,255,.1)',c1:sel?'rgba(60,36,150,.95)':'rgba(255,255,255,.04)',stroke:st=='eq'?'#3ee87a':sel?'#ffffff':'rgba(255,255,255,.12)'});
  drawPreview(x,k,it,X+u(8),Y+u(8),cw-u(16),cw*.78);txt(x,it.nom,X+cw/2,Y+cw*.78+u(26),{size:u(14),w:800,max:cw-u(14)});
  const sy=Y+chh-u(20);if(st=='eq'){check(x,X+cw/2-u(34),sy,u(11));txt(x,'ÉQUIPÉ',X+cw/2+u(6),sy,{size:u(12),w:900,c:'#3ee87a'})}else if(st=='own')txt(x,'CHOISIR',X+cw/2,sy,{size:u(12),w:800,c:'rgba(255,255,255,.75)'});
  else if(st=='ach'){const a=ACH.find(q=>q.id==it.ach);txt(x,'SUCCÈS : '+(a?a.d.toUpperCase():''),X+cw/2,sy,{size:u(10),w:800,c:'#ffb347',max:cw-u(12)})}
  else{const s=String(it.prix),can=d.coins>=it.prix,sw=tw(x,s,u(14),900);coin(x,X+cw/2-sw/2-u(6),sy,u(7));txt(x,s,X+cw/2-sw/2+u(4),sy,{size:u(14),w:900,al:'left',c:can?'#ffe27a':'#ff7b8a'});if(k=='env'&&it.h)txt(x,'ou '+it.h+' étages',X+cw/2,sy-u(15),{size:u(9.5),w:600,c:'rgba(255,255,255,.55)'})}
  if(k=='skin')txt(x,it.cat,X+cw/2,Y+cw*.78+u(44),{size:u(9.5),w:700,c:'rgba(255,255,255,.5)'});else if(k=='fx'&&it.d)txt(x,it.d,X+cw/2,Y+cw*.78+u(44),{size:u(9.5),w:600,c:'rgba(255,255,255,.55)',max:cw-u(12)});
  ST.btns.push(b)});x.restore();
 // barre d'achat
 const it=C.sel&&list.find(q=>q.id===C.sel),bb={x:L.m,y:h-L.m-u(54),w:w-2*L.m,h:u(54)};
 if(it&&itemState(k,it)=='buy'){const can=d.coins>=it.prix;button(x,Object.assign({id:'buy'},bb),'ACHETER  '+it.prix,{c0:can?'#ffc531':'#5a5470',c1:can?'#e08a0b':'#3c3750',size:u(18),coin:1,tc:can?'#3a1d00':'#cfc8e6',dis:!can})}
 else txt(x,C.msg&&ST.t-C.msg.t<2.5?C.msg.s:'Touche un objet pour l’équiper ou l’acheter',w/2,bb.y+bb.h/2,{size:u(13),w:700,c:C.msg&&ST.t-C.msg.t<2.5?C.msg.c:'rgba(255,255,255,.6)',max:w-2*L.m})}
function drawMiss(x,w,h){const L=ST.L,u=L.u,M=ST.miss,d=data(),D=daily();header(x,w,'MISSIONS');let y=tabs(x,w,L.top+L.ib+u(14),[['day','DU JOUR'],['ach','SUCCÈS'],['rec','RECORDS']],M.tab,'mtab')+u(14);
 const cw=Math.min(w-2*L.m,u(460)),X=w/2-cw/2,bot=h-L.m;
 if(M.tab=='day'){const now=new Date(),nx=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),ms=nx-now,hh=Math.floor(ms/3.6e6),mm=Math.floor(ms/6e4)%60;
  txt(x,'Nouvelles missions dans '+hh+' h '+String(mm).padStart(2,'0'),w/2,y+u(6),{size:u(12),w:600,c:'rgba(255,255,255,.65)'});y+=u(24);
  for(const id of D.ids){const m=mdef(id),done=!!D.done[id],v=Math.min(m.g,(m.k.startsWith('day')?D.ctr[m.k]:D.prog[id])||0),ch=u(84);
   panel(x,X,y,cw,ch,{c0:done?'rgba(40,140,90,.5)':'rgba(255,255,255,.1)',c1:done?'rgba(20,80,50,.5)':'rgba(255,255,255,.04)',stroke:done?'#3ee87a':'rgba(255,255,255,.12)'});
   txt(x,m.t,X+u(18),y+u(26),{size:u(15),w:800,al:'left',max:cw-u(110)});coin(x,X+cw-u(58),y+u(26),u(9));txt(x,'+'+m.r,X+cw-u(44),y+u(26),{size:u(15),w:900,al:'left',c:'#ffe27a'});
   bar(x,X+u(18),y+u(50),cw-u(36)-u(70),u(10),v/m.g,'#ffb347','#ff6f91');if(done){check(x,X+cw-u(64),y+u(55),u(13));txt(x,'FAIT',X+cw-u(48),y+u(55),{size:u(12),w:900,al:'left',c:'#3ee87a'})}else txt(x,v+'/'+m.g,X+cw-u(18),y+u(55),{size:u(12),w:800,al:'right',c:'rgba(255,255,255,.75)'});
   y+=ch+u(12)}
  txt(x,'Les récompenses sont créditées dès la fin de la partie.',w/2,y+u(6),{size:u(11),w:600,c:'rgba(255,255,255,.5)',max:w-2*L.m});return}
 if(M.tab=='ach'){const ch=u(70),A=scrollArea(M,'mscroll',y,bot,ACH.length*(ch+u(10)));ST.btns.push(A);x.save();x.beginPath();x.rect(0,y,w,bot-y);x.clip();
  ACH.forEach((a,i)=>{const Y=y+i*(ch+u(10))-M.scroll;if(Y>bot||Y+ch<y)return;const done=!!d.ach[a.id],v=Math.min(a.g,achVal(a.k));
   panel(x,X,Y,cw,ch,{c0:done?'rgba(255,190,60,.28)':'rgba(255,255,255,.08)',c1:done?'rgba(160,100,20,.25)':'rgba(255,255,255,.03)',stroke:done?'#ffc531':'rgba(255,255,255,.12)'});
   trophy(x,X+u(32),Y+ch/2,u(15),done);txt(x,a.t,X+u(58),Y+u(22),{size:u(14),w:800,al:'left',max:cw-u(150)});txt(x,a.d+(a.unlock?' · débloque '+(CAT[a.unlock[0]].find(q=>q.id==a.unlock[1])||{}).nom:''),X+u(58),Y+u(41),{size:u(11),w:600,al:'left',c:'rgba(255,255,255,.65)',max:cw-u(150)});
   bar(x,X+u(58),Y+u(54),cw-u(150),u(6),v/a.g,'#ffc531','#ff8a3d');coin(x,X+cw-u(64),Y+ch/2,u(8));txt(x,'+'+a.r,X+cw-u(52),Y+ch/2,{size:u(14),w:900,al:'left',c:done?'#3ee87a':'#ffe27a'})});x.restore();return}
 const S=d.st,R=[['MEILLEUR SCORE',S.bestS],['ÉTAGE MAX',S.bestH],['MEILLEUR COMBO','x'+S.bestC],['PARTIES',S.games],['PERFECT',S.perfects],['BLOCS EMPILÉS',S.blocks],['PIÈCES GAGNÉES',S.coinsTotal],['MISSIONS',S.missions]];
 const cols=L.land?4:2,gap=u(10),tw0=(cw-(cols-1)*gap)/cols,th=u(78);R.forEach(([k,v],i)=>{const tx=X+(i%cols)*(tw0+gap),ty=y+Math.floor(i/cols)*(th+gap);panel(x,tx,ty,tw0,th,{c0:'rgba(255,255,255,.1)',c1:'rgba(255,255,255,.04)'});
  txt(x,String(v),tx+tw0/2,ty+th*.42,{size:u(26),w:900});txt(x,k,tx+tw0/2,ty+th*.76,{size:u(10.5),w:700,c:'rgba(255,255,255,.6)',max:tw0-u(10)})})}
function trophy(x,X,Y,s,on){const g=x.createLinearGradient(X,Y-s,X,Y+s);g.addColorStop(0,on?'#fff1a6':'#8a84a8');g.addColorStop(1,on?'#e0950b':'#4a4466');x.fillStyle=g;x.beginPath();x.moveTo(X-s*.8,Y-s*.9);x.lineTo(X+s*.8,Y-s*.9);x.quadraticCurveTo(X+s*.75,Y+s*.1,X,Y+s*.25);x.quadraticCurveTo(X-s*.75,Y+s*.1,X-s*.8,Y-s*.9);x.fill();
 x.fillRect(X-s*.12,Y+s*.2,s*.24,s*.45);x.fillRect(X-s*.5,Y+s*.62,s,s*.22);x.strokeStyle=on?'#ffd23f':'#6a6488';x.lineWidth=s*.14;x.beginPath();x.arc(X-s*.8,Y-s*.45,s*.3,Math.PI*.5,Math.PI*1.5);x.stroke();x.beginPath();x.arc(X+s*.8,Y-s*.45,s*.3,-Math.PI*.5,Math.PI*.5);x.stroke()}
function drawToasts(x,w){const L=ST.L,u=L.u;let y=L.top+L.ib+u(10);ST.toasts=ST.toasts.filter(t=>ST.t-t.t<3);for(const t of ST.toasts){const a=cl(Math.min((ST.t-t.t)*5,(3-(ST.t-t.t))*3),0,1),tw0=Math.min(w-2*L.m,tw(x,t.s,u(13),800)+u(40));
 x.globalAlpha=a;x.fillStyle='rgba(20,12,46,.95)';rr(x,w/2-tw0/2,y-(1-a)*u(10),tw0,u(36),u(18));x.fill();x.strokeStyle=t.c||'#ffc531';x.lineWidth=u(1.2);x.stroke();txt(x,t.s,w/2,y+u(18)-(1-a)*u(10),{size:u(13),w:800,max:tw0-u(20)});x.globalAlpha=1;y+=u(42)}}
const toast=(s,c)=>ST.toasts.push({s,c,t:ST.t});
// ---------- aperçu animé de l'accueil : une tour qui se construit toute seule, en PERFECT ----------
function newDemo(){const D={blocks:[{x:0,z:0,w:BASE,d:BASE,lvl:0,y:-BH}],cur:null,debris:[],parts:[],rings:[],texts:[],height:0,camY:BH,fade:1,reset:0,over:false};spawn(D);return D}
function stepDemo(D,dt){if(D.reset>0){D.reset-=dt;D.fade=cl(D.reset/.5,0,1);if(D.reset<=0){Object.assign(D,newDemo());D.fade=0}return}D.fade=Math.min(1,D.fade+dt*2);
 const c=D.cur,p=topB(D),k=c.axis,before=(k=='x'?c.x:c.z)-(k=='x'?p.x:p.z);moveCur(D,dt*.9);const after=(k=='x'?c.x:c.z)-(k=='x'?p.x:p.z);
 if(before*after<=0&&Math.abs(before)<RANGE*.5){if(k=='x')c.x=p.x;else c.z=p.z;const b={x:c.x,z:c.z,w:c.w,d:c.d,lvl:c.lvl,y:c.y};D.blocks.push(b);D.height++;D.rings.push({b,t:0,k:1});D.lastDrop={b,t:0};
  if(D.height>=16){D.reset=1.4;D.cur=null}else spawn(D)}
 if(D.reset>0)D.reset=Math.max(D.reset,.5);D.camY=lerp(D.camY,topY(D)+BH,1-Math.exp(-dt*3));for(const r of D.rings)r.t+=dt/.55;D.rings=D.rings.filter(r=>r.t<1);if(D.lastDrop)D.lastDrop.t+=dt}
// ---------- mise à jour ----------
function update(dt){dt=Math.min(dt,.05);ST.t+=dt;ST.fr.n++;ST.fr.sum+=dt;ST.fr.max=Math.max(ST.fr.max,dt);
 if(ST.coll.msg&&ST.t-ST.coll.msg.t>3)ST.coll.msg=null;for(const o of[ST.coll,ST.miss]){if(!ST.drag||ST.drag.o!==o){o.scroll+=o.v*dt;o.v*=Math.exp(-dt*5);if(o.scroll<0){o.scroll=0;o.v=0}if(o.scroll>o.max){o.scroll=o.max;o.v=0}}}
 if(ST.scr=='home'||ST.scr=='coll'||ST.scr=='miss'){if(!ST.D)ST.D=newDemo();stepDemo(ST.D,dt)}
 const G=ST.G;if((ST.scr=='play'||ST.scr=='over')&&G&&!ST.paused){
  // ralenti très court des séries exceptionnelles (tout ralentit pareil : le geste reste juste)
  if(G.slow>0)G.slow-=dt;const target=G.slow>0?.32:1;ST.ts=lerp(ST.ts,target,1-Math.exp(-dt*(target<1?18:6)));const gdt=dt*ST.ts;
  if(!G.over)moveCur(G,gdt);stepFx(G,gdt);
  G.flash=Math.max(0,G.flash-dt*2.2);G.shake=Math.max(0,G.shake-dt*1.6);G.scorePop=Math.max(0,G.scorePop-dt*4);G.levelPop=Math.max(0,G.levelPop-dt*2);
  if(!G.over){G.camY=lerp(G.camY,topY(G)+BH*1.5,1-Math.exp(-dt*6))}
  else{G.overT+=dt;const towerH=topY(G)+160,base=Math.min(ST.W*.52,ST.H*.44,ST.L.u(420))/(2*BASE*C30),fit=cl(ST.H*.55/(towerH*base+BASE*base),.12,1);
   G.zoomFit=fit;G.camFit=(topY(G)-140)/2+BH;G.zoom=lerp(G.zoom,fit,1-Math.exp(-dt*2.2));G.camY=lerp(G.camY,G.camFit,1-Math.exp(-dt*2.2));if(Math.abs(G.zoom-fit)<.001&&Math.abs(G.camY-G.camFit)<.3){G.zoom=fit;G.camY=G.camFit}if(G.overT>.9&&ST.scr=='play')ST.scr='over'}}
 music()}
// ---------- rendu ----------
function draw(x,w,h){const tr=x.getTransform();ST.sc=tr.a||1;ST.dp=1/ST.sc;if(w!==ST.W||h!==ST.H||!ST.L){layout(w,h);ST.bgc={}}ST.btns=[];
 const G=ST.G,climb=(ST.scr=='play'||ST.scr=='over')&&G?(G.camY-BH)*.6:0;x.save();
 if(G&&G.shake>0&&(ST.scr=='play'||ST.scr=='over')){const s=G.shake*ST.L.u(6);x.translate((Math.random()-.5)*s,(Math.random()-.5)*s)}
 const dbg=ST.dbg||{};if(!dbg.noBg)background(x,w,h,climb);
 if(ST.scr=='home')drawHome(x,w,h);
 else if(ST.scr=='coll')drawColl(x,w,h);else if(ST.scr=='miss')drawMiss(x,w,h);
 else if(G){const V=playView(w,h,G,G.zoom);if(!dbg.noScene){if(G.over&&G.zoomFit)drawOverTower(x,V,G,w,h);else drawScene(x,V,G,w,h,{cache:true})}if(!dbg.noHud)drawHud(x,w,h,G);if(ST.scr=='over')drawOver(x,w,h,G)}
 x.restore();if(ST.paused)drawPause(x,w,h);drawToasts(x,w)}
// ---------- actions ----------
function startGame(){ST.G=newGame();ST.over=null;ST.scr='play';ST.paused=false;ST.ts=1;fx('stTap',1,.05);music()}
function leaveRun(){const G=ST.G;if(G&&!G.over&&G.started){G.over=true;ST.over=finishRun(G)}}
function goHome(){leaveRun();ST.paused=false;ST.G=null;ST.scr='home';fx('stTap',1,.05)}
function exit(){leaveRun();persist();const a=ST.api;if(a)a.exit()}
function togglePause(){if(ST.scr!='play'||!ST.G||ST.G.over)return;ST.paused=!ST.paused;fx('stTap',1,.05);music()}
function toggleMute(){ST.mute=!ST.mute;data().mute=ST.mute;persist();if(!ST.mute)fx('stTap',1,.05);music()}
function tapDrop(){const G=ST.G;if(ST.scr!='play'||!G||G.over||ST.paused)return null;return drop(G)}
function action(b){const id=b.id;
 if(id=='play'||id=='replay'){startGame();return}if(id=='quit'){fx('stTap',1,.05);exit();return}if(id=='mute'){toggleMute();return}
 if(id=='pause'){togglePause();return}if(id=='resume'){togglePause();return}if(id=='home'){goHome();return}
 if(id=='coll'){ST.scr='coll';ST.coll.sel=null;fx('stTap',1,.05);return}if(id=='miss'){daily();ST.scr='miss';fx('stTap',1,.05);return}
 if(id=='tab'){ST.coll.tab=b.k;ST.coll.sel=null;ST.coll.scroll=0;fx('stTap',1,.05);return}if(id=='mtab'){ST.miss.tab=b.k;ST.miss.scroll=0;fx('stTap',1,.05);return}
 if(id=='item'){const k=ST.coll.tab,it=CAT[k].find(q=>q.id==b.k),st=itemState(k,it);
  if(st=='own'||st=='eq'){equip(k,it.id);ST.coll.sel=null;fx('stEquip',1,.05);return}
  if(st=='ach'){const a=ACH.find(q=>q.id==it.ach);ST.coll.msg={s:'À gagner avec le succès « '+(a?a.t:'')+' »',c:'#ffb347',t:ST.t};fx('stDeny',1,.1);return}
  ST.coll.sel=it.id;fx('stTap',1,.05);return}
 if(id=='buy'){const k=ST.coll.tab,r=buy(k,ST.coll.sel);if(r.ok){const it=CAT[k].find(q=>q.id==ST.coll.sel);ST.coll.msg={s:it.nom+' débloqué et équipé !',c:'#3ee87a',t:ST.t};ST.coll.sel=null;if(k=='env'){ST.bgc={};MUS=null}fx('stBuy',1,.1);for(const a of r.ach||[])toast('Succès : '+a.t+(a.r?'  +'+a.r:''))}
  else if(r.why=='pièces'){ST.coll.msg={s:'Il te manque '+r.manque+' pièces',c:'#ff7b8a',t:ST.t};fx('stDeny',1,.1)}}}
// ---------- toucher, souris ----------
function hit(px,py){for(let i=ST.btns.length-1;i>=0;i--){const b=ST.btns[i];if(b.o)continue;if(px>=b.x&&px<b.x+b.w&&py>=b.y&&py<b.y+b.h&&(!b.clip||py>=b.clip[0]&&py<b.clip[1]))return b}return null}
function area(px,py){return ST.btns.find(b=>b.o&&px>=b.x&&px<b.x+b.w&&py>=b.y&&py<b.y+b.h)}
function pointer(type,px,py,id){if(!ST.L)return;const T=ST.touch;
 if(type=='down'){const b=hit(px,py);
  if(ST.paused){if(b)T[id]={btn:b,k:b.k,x:px,y:py};return}
  if(ST.scr=='play'&&ST.G&&!ST.G.over){if(b&&b.id=='pause'){T[id]={btn:b,x:px,y:py};return}tapDrop();T[id]={x:px,y:py,play:1};return}// posé dès l'appui : aucune latence
  const A=area(px,py);T[id]={btn:b,k:b&&b.k,x:px,y:py,area:A,s0:A?A.o.scroll:0,ly:py,lt:ST.t};if(A){A.o.v=0;ST.drag={o:A.o,id}}return}
 const t=T[id];if(!t)return;
 if(type=='move'){if(t.area&&Math.abs(py-t.y)>ST.L.u(8)){t.moved=true;const o=t.area.o;o.scroll=cl(t.s0-(py-t.y),0,o.max);const dtt=Math.max(.008,ST.t-t.lt);o.v=-(py-t.ly)/dtt*.6;t.ly=py;t.lt=ST.t}return}
 if(type=='up'){delete T[id];if(ST.drag&&ST.drag.id===id)ST.drag=null;if(t.moved||!t.btn)return;const b=hit(px,py);if(b&&b.id===t.btn.id&&(b.k==null||b.k===t.btn.k))action(b)}}
// ---------- clavier : Espace / Entrée = poser (ou jouer, rejouer, reprendre), P = pause, M = son ; Échap = retour à la borne ----------
const OWN=new Set(['Space','Enter','NumpadEnter','KeyP','KeyM','ArrowDown']);
function active(){try{return ARC.on&&ARC.state=='game'&&ARC.cur&&ARC.cur.id=='stack'&&ST.api}catch(e){return false}}
function onKey(e){if(!active()||!OWN.has(e.code))return;e.preventDefault();if(e.repeat)return;const c=e.code;
 if(c=='KeyP'){togglePause();return}if(c=='KeyM'){toggleMute();return}
 if(ST.paused){togglePause();return}if(ST.scr=='play'){tapDrop();return}if(ST.scr=='home'&&c!='ArrowDown'){startGame();return}if(ST.scr=='over'&&ST.G&&ST.G.overT>1.05&&c!='ArrowDown')startGame()}
// interruptions : l'application passe en arrière-plan ou perd le focus → pause automatique
function onHide(){if(!active())return;if(document.hidden||!document.hasFocus()){if(ST.scr=='play'&&ST.G&&!ST.G.over&&!ST.paused){ST.paused=true;music()}persist()}}
// ---------- module ----------
const Stack={hires:2,
 start(api){ST.api=api;ST.t=0;ST.L=null;ST.W=ST.H=0;ST.bgc={};ST.G=null;ST.D=null;ST.over=null;ST.scr='home';ST.paused=false;ST.ts=1;ST.touch={};ST.btns=[];ST.toasts=[];ST.drag=null;ST.fr={n:0,sum:0,max:0};
  try{ST.touchUI=(navigator.maxTouchPoints||0)>0||matchMedia('(pointer: coarse)').matches}catch(e){ST.touchUI=false}
  const d=data();ST.mute=!!d.mute;daily();checkAch();persist();addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onHide);addEventListener('blur',onHide);MUS=null;music()},
 update,draw,pointer,ownsKey:c=>OWN.has(c),
 stop(){leaveRun();persist();removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onHide);removeEventListener('blur',onHide);
  try{if(typeof JEUSON!='undefined'){JEUSON.level(1);JEUSON.stop()}}catch(e){}MUS=null;ST.api=null;ST.G=null;ST.D=null;ST.bgc={};ST.touch={};ST.btns=[];ST.toasts=[];ST.drag=null;ST.paused=false;ST.scr='home'},
 // accès pour les tests
 _s:ST,_drop:drop,_new:newGame,_move:moveCur,_tier:comboTier,_buy:buy,_equip:equip,_daily:daily,_settle:settle,_finish:finishRun,_data:data,_tap:tapDrop,_start:startGame,_action:action,_rules:{BASE,BH,PERFECT_TOL,MINW,RANGE,LEVEL_EVERY,speedAt},_cat:{SKINS,FXS,ENVS,MPOOL,ACH}};
ARC.register('stack',Stack);
})();
