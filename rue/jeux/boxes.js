// ===== MINI-JEU BOX MASTER (module de la borne d'arcade) =====
// Un vrai jeu de réflexion de type Sokoban : le personnage (aux couleurs de son apparence dans Little Life) pousse des caisses
// en bois sur des cibles lumineuses. Règles exactes, case par case :
//  - déplacements horizontaux et verticaux uniquement ; les murs (et l'extérieur de la pièce) sont infranchissables ;
//  - une caisse avance si la case derrière elle est libre (ni mur, ni caisse) : jamais deux caisses à la fois, jamais de tirage ;
//  - toutes les caisses sur les cibles → niveau terminé.
// Blocages détectés de façon certaine (jamais de fausse alerte) :
//  - caisse sur une case morte (d'où aucune caisse, même seule, ne peut rejoindre une cible : calculé en « tirant » depuis les cibles) ;
//  - carré 2×2 entièrement fait de murs et de caisses contenant une caisse hors cible (plus rien n'y bouge).
//  Le jeu le signale et n'accepte plus que ANNULER ou RECOMMENCER.
// 30 niveaux dessinés à la main, tous vérifiés résolubles par un solveur (solutions rejouées dans les tests).
// Gérés par la borne : api.exit (retour à la borne), api.level / api.saveLevel (niveaux débloqués), api.data / api.save (sauvegarde).
(function(){
// carte : # mur · espace sol · . cible · $ caisse · * caisse sur cible · @ joueur · + joueur sur cible
const LEVELS=[
 {nom:"PREMIÈRE CAISSE",map:["#######","#@ $ .#","#######"]},
 {nom:"LE VIRAGE",map:["######","#    #","#@$  #","#  # #","#  #.#","######"]},
 {nom:"DEUX CAISSES",map:["#######","#  .  #","# $@$ #","#  .  #","#######"]},
 {nom:"LA CROIX",map:["  ###","  #.#","###$###","#.$@$.#","###$###","  #.#","  ###"]},
 {nom:"ATTENTION AUX COINS",map:["########","#      #","# $ ## #","#  @ $.#","#.     #","########"]},
 {nom:"TROIS CAISSES",map:[" #####","##   #","#. $ #","#.$@ #","#. $ ##","##    #"," ######"]},
 {nom:"LE MOULIN",map:["  #####","###   ###","#  $.$  #","# #.@.# #","#  $.$  #","###   ###","  #####"]},
 {nom:"L'ENTREPÔT",map:["  ####","###  ####","#  $ $  #","# #. .# #","#   @   #","###   ###","  #####"]},
 {nom:"DOUBLE RANGÉE",map:["########","#      #","#   $  #","#  ##$ #","##.**+##"," ######"]},
 {nom:"L'ESCALIER",map:["#######","#.    #","#* #  #","#+$   #","## $# #"," #    #"," ######"]},
 {nom:"LE PEIGNE",map:["##########","#  #  #  #","# $ $  $ #","#  #  #  #","##.#.##.##"," #   @  #"," ########"]},
 {nom:"LES ALCÔVES",map:[" #######"," #  #  #"," # $ $ #","##.# #.##","#   @   #","# $###$ #","#.     .#","#########"]},
 {nom:"ENCOMBREMENT",map:["########","#  .   #","# $$ # #","#. @ $.#","## #$  #"," #   . #"," #######"]},
 {nom:"CASSE-TÊTE",map:["  #######","  #  .  #","### $$$ #","#  .#.  #","# $ #   #","#  .@ ###","#####  #","    ####"]},
 {nom:"LE MAGASIN",map:["#########","#   #   #","#   $   #","## #.# ##"," # *@* #","## # # ##","#       #","#       #","#########"]},
 {nom:"LA SALLE CARRÉE",map:["#########","#   #   #","# $ . $ #","#  ###  #","#.#   #.#","#  ###  #","# $ . $ #","#   @   #","#########"]},
 {nom:"LES ENGRENAGES",map:[" #######","##  .  ##","#  $$$  #","# .#.#. #","#  $ $$ #","##. @ .##"," #######"]},
 {nom:"LA FOURMILIÈRE",map:[" ########"," #  #   #","## $  $ #","#  ## # #","# $ ..  #","#  #..  #","## $ ####"," #  @#"," #####"]},
 {nom:"LE PONT",map:["##########","#        #","# $    $ #","#  #..#  #","## #..# ##","#  $  $  #","#   @#   #","##########"]},
 {nom:"LE SERPENT",map:["#########","#   #   #","# $ $   #","###.#.###","  #.$.#","### #$###","#   @   #","#########"]},
 {nom:"LES TIROIRS",map:[" #########"," #   #   #"," # $ $ $ #","##.## ##.##","#  .   .  #","#  #$#$#  #","#   . @   #","###########"]},
 {nom:"LA FORTERESSE",map:["  #########","  #   #   #","### $ $ $ #","#  .#.#.# #","# $ . . $ #","# #.#.#.# #","#  $$ $   #","###  @  ###","  #######"]},
 {nom:"PETIT LABYRINTHE",map:["#########","#   #   #","#   #   #","#  ...$ #","##$#$#$##"," #@ .  #"," #######"]},
 {nom:"LABYRINTHE DE CAISSES",map:["#########","#  #    #","# $  $$ #","#.## #  #","#. $ # ##","#.  $  .#","#.#   # #","#  @#   #","#########"]},
 {nom:"LES COULISSES",map:[" #########"," #   #   #"," #$#  $# #","## # # # ##","#  .....  #","#  # * #$ #","##   #$$@##"," ###   ###","   #####"]},
 {nom:"LE GRAND HALL",map:["###########","#    #    #","# $$      #","#  #.*.#  #","# $#. .#  #","#  ##*##$ #","#    @    #","###########"]},
 {nom:"L'ATELIER",map:["##########","#    #   #","#   $#   #","#  #@$ # #","## #$##  #","# $*..  ##","#   ..   #","#   #    #","##########"]},
 {nom:"LES QUAIS",map:[" ##########"," #   ##   #","## $    $ ##","#  ## .## . #","# $ ..   $  #","#   ## .##  #","##$    @  ###"," #   ##   #"," ##########"]},
 {nom:"DOUBLE CROIX",map:["###########","#    #    #","#   .#.   #","# $  $    #","##$.#@#. ##","#  $      #","#  $*#.   #","#    #    #","###########"]},
 {nom:"LE MAÎTRE DES CAISSES",map:["###########","#     #   #","#  #$$  $ #","#  # @##  #","## **#..  #","# $*. ..  #","# $ ##    #","#         #","###########"]}];
const NL=LEVELS.length;
const TIERS=[{a:1,b:5,nom:'APPRENTISSAGE',c:'#7be38a'},{a:6,b:10,nom:'PREMIÈRES DIFFICULTÉS',c:'#ffd45a'},{a:11,b:20,nom:'PUZZLES COMPLEXES',c:'#ff9f4a'},{a:21,b:30,nom:'DÉFIS AVANCÉS',c:'#ff6b7d'}];
const tierOf=i=>TIERS.find(t=>i+1>=t.a&&i+1<=t.b)||TIERS[0];
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},DCH={up:'u',down:'d',left:'l',right:'r'},CHD={u:'up',d:'down',l:'left',r:'right'};
const MT=.12,HOLD=.24,UNDO_HOLD=.38,UNDO_REP=.085;
// ---------- outils ----------
const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<0?0:t>1?1:1-(1-t)*(1-t);
const CT=(x,s,cx,Y,c,sc,ol)=>{try{axCText(x,s,cx,Y,c,sc||1,ol)}catch(e){}},TX=(x,s,X,Y,c,sc,ol)=>{try{axText(x,s,X,Y,c,sc||1,ol)}catch(e){}};
const TW=(s,sc)=>{try{return axTW(s,sc||1)}catch(e){return String(s).length*6*(sc||1)}};
function rr(x,X,Y,W,H,r){r=Math.max(0,Math.min(r,W/2,H/2));x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
const inB=(b,px,py,m)=>b&&px>=b.x-(m||0)&&px<b.x+b.w+(m||0)&&py>=b.y-(m||0)&&py<b.y+b.h+(m||0);
// ---------- état ----------
const BX={phase:'title',api:null,t:0,L:null,W:0,H:0,G:null,boxes:[],bmap:null,p:null,lvl:0,moves:0,pushes:0,hist:[],stuck:[],won:false,winT:0,
 q:[],hold:null,uhold:null,path:null,touch:{},btns:[],parts:[],rings:[],sel:0,paused:false,mute:false,tr:null,introT:9,stuckT:0,panelT:0,res:null,msg:null,touchUI:false,spr:{},room:null,look:null,newRec:false};
const fx=(n,k,g)=>{if(BX.mute)return;try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
let MUS=null;function music(){try{if(typeof JEUSON=='undefined')return;if(MUS!=='boxes'){JEUSON.music('boxes');MUS='boxes'}JEUSON.level(BX.mute?0:BX.paused?.35:1)}catch(e){}}
// ---------- sauvegarde (celle de la borne : N.arcade.boxes, enregistrée avec la partie de Little Life) ----------
function data(){try{return BX.api.data()}catch(e){return BX._d||(BX._d={best:0,level:1})}}
function persist(){try{BX.api&&BX.api.save()}catch(e){}}
function unlocked(){let n=1;try{n=BX.api.level()}catch(e){n=data().level||1}return cl(n|0,1,NL)}
function isDone(i){const d=data();return !!(d.done&&d.done[i])}
function bestMoves(i){const d=data();return d.bm&&d.bm[i]||0}
function doneCount(){let n=0;for(let i=0;i<NL;i++)if(isDone(i))n++;return n}
// partie en cours : niveau + suite des déplacements (rejouée à l'identique au retour)
function saveResume(){if(!BX.api||!BX.G)return;const d=data();if(BX.phase=='play'&&!BX.won&&BX.hist.length)d.res={l:BX.lvl,h:BX.hist.map(h=>DCH[h.d]).join('')};else if(d.res&&d.res.l===BX.lvl)delete d.res;d.last=BX.lvl;persist()}
// ---------- niveau ----------
function parse(i){const m=LEVELS[i].map,h=m.length,w=Math.max(...m.map(r=>r.length)),n=w*h;
 const wall=new Uint8Array(n),goal=new Uint8Array(n),inside=new Uint8Array(n),boxes=[];let px=-1,py=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=m[y][x]||' ',k=y*w+x;if(c=='#')wall[k]=1;if(c=='.'||c=='*'||c=='+')goal[k]=1;if(c=='$'||c=='*')boxes.push({x,y});if(c=='@'||c=='+'){px=x;py=y}}
 // l'intérieur de la pièce : tout ce que le personnage peut atteindre sans traverser de mur
 const st=[[px,py]];while(st.length){const[x,y]=st.pop();if(x<0||y<0||x>=w||y>=h)continue;const k=y*w+x;if(wall[k]||inside[k])continue;inside[k]=1;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}
 const G={w,h,wall,goal,inside,px,py,start:boxes,ngoal:goal.reduce((a,b)=>a+b,0)};G.dead=deadCells(G);return G}
function solid(G,x,y){return x<0||y<0||x>=G.w||y>=G.h||G.wall[y*G.w+x]||!G.inside[y*G.w+x]}
// cases mortes : une caisse seule ne peut y rejoindre aucune cible (tirage inverse depuis les cibles)
function deadCells(G){const ok=new Uint8Array(G.w*G.h),st=[];for(let k=0;k<ok.length;k++)if(G.goal[k]&&G.inside[k]){ok[k]=1;st.push(k)}
 while(st.length){const k=st.pop(),x=k%G.w,y=(k/G.w)|0;for(const[dx,dy]of Object.values(DIRS)){const ax=x+dx,ay=y+dy,bx=x+2*dx,by=y+2*dy;if(solid(G,ax,ay)||solid(G,bx,by))continue;const a=ay*G.w+ax;if(!ok[a]){ok[a]=1;st.push(a)}}}
 const dead=new Uint8Array(G.w*G.h);for(let k=0;k<dead.length;k++)dead[k]=G.inside[k]&&!G.wall[k]&&!ok[k]?1:0;return dead}
function boxAt(x,y){if(x<0||y<0||x>=BX.G.w||y>=BX.G.h)return -1;return BX.bmap[y*BX.G.w+x]}
function onGoal(b){return !!BX.G.goal[b.y*BX.G.w+b.x]}
function blocked(x,y){return solid(BX.G,x,y)}
function loadLevel(i,o){o=o||{};i=cl(i,0,NL-1);const G=parse(i);BX.G=G;BX.lvl=i;BX.boxes=G.start.map((b,id)=>({id,x:b.x,y:b.y,fx:b.x,fy:b.y,t:1,pop:0,glow:0}));
 BX.bmap=new Int16Array(G.w*G.h).fill(-1);BX.boxes.forEach(b=>BX.bmap[b.y*G.w+b.x]=b.id);BX.boxes.forEach(b=>b.glow=onGoal(b)?1:0);
 BX.p={x:G.px,y:G.py,fx:G.px,fy:G.py,t:1,dir:'down',step:0,push:0,pushT:0,bump:null,hop:0};BX.moves=0;BX.pushes=0;BX.hist=[];BX.stuck=[];BX.won=false;BX.winT=0;BX.q=[];BX.path=null;BX.hold=null;BX.uhold=null;
 BX.parts=[];BX.rings=[];BX.phase='play';BX.paused=false;BX.introT=0;BX.stuckT=0;BX.panelT=0;BX.newRec=false;BX.room=null;BX.L=null;
 // reprise d'une partie en cours : on rejoue la même suite de déplacements, sans animation ni son
 if(o.replay){for(const c of o.replay){const d=CHD[c];if(!d||step(d,true)=='blocked')break}BX.introT=9}
 const dd=data();dd.last=i;if(!o.quiet)persist()}
// un pas dans une direction : 'move' | 'push' | 'blocked' | 'stuck'
function step(d,instant){const p=BX.p,[dx,dy]=DIRS[d],nx=p.x+dx,ny=p.y+dy;p.dir=d;
 if(BX.stuck.length&&!instant){bump(d);fx('bxStuck',1,.25);BX.stuckT=0;return 'stuck'}
 if(blocked(nx,ny)){if(!instant){bump(d);fx('bxBump',1,.12)}return 'blocked'}
 const bi=boxAt(nx,ny);let res='move';
 if(bi>=0){const bx=nx+dx,by=ny+dy;if(blocked(bx,by)||boxAt(bx,by)>=0){if(!instant){bump(d);fx('bxBump',1,.12)}return 'blocked'}
  const b=BX.boxes[bi],was=onGoal(b);BX.bmap[ny*BX.G.w+nx]=-1;b.fx=instant?bx:b.x;b.fy=instant?by:b.y;b.x=bx;b.y=by;b.t=instant?1:0;BX.bmap[by*BX.G.w+bx]=bi;BX.pushes++;res='push';
  const now=onGoal(b);if(!instant){if(now&&!was){b.pop=1;arrive(b)}else fx(now?'bxPushOn':'bxPush',1,.05)}b.glow=now?b.glow:0}
 p.fx=instant?nx:p.x;p.fy=instant?ny:p.y;p.x=nx;p.y=ny;p.t=instant?1:0;p.step^=1;p.push=bi>=0?1:0;if(bi>=0)p.pushT=.22;p.bump=null;BX.moves++;BX.hist.push({d,b:bi});
 if(!instant&&bi<0)fx('bxStep',.5+p.step*.15,.05);
 after(instant);return res}
function bump(d){BX.p.bump={d,t:0};BX.p.dir=d}
function after(instant){if(BX.boxes.every(onGoal)){if(!instant)win();return}
 const was=BX.stuck.length;BX.stuck=findStuck();if(BX.stuck.length&&!was&&!instant){BX.stuckT=0;BX.path=null;BX.q=[];BX.hold=null;fx('bxStuck',1,.2)}}
// blocages certains (voir en-tête)
function findStuck(){const G=BX.G,out=new Set();
 for(const b of BX.boxes){if(onGoal(b))continue;if(G.dead[b.y*G.w+b.x]){out.add(b.id);continue}
  for(const[ox,oy]of[[0,0],[-1,0],[0,-1],[-1,-1]]){const cells=[[b.x+ox,b.y+oy],[b.x+ox+1,b.y+oy],[b.x+ox,b.y+oy+1],[b.x+ox+1,b.y+oy+1]];
   if(cells.every(([x,y])=>blocked(x,y)||boxAt(x,y)>=0)){out.add(b.id);break}}}
 return [...out]}
function undo(){if(BX.phase!='play'||BX.won||BX.paused||BX.tr||!BX.hist.length)return false;const h=BX.hist.pop(),[dx,dy]=DIRS[h.d],p=BX.p;
 if(h.b>=0){const b=BX.boxes[h.b];BX.bmap[b.y*BX.G.w+b.x]=-1;b.fx=b.x;b.fy=b.y;b.x-=dx;b.y-=dy;b.t=0;BX.bmap[b.y*BX.G.w+b.x]=b.id;BX.pushes--;b.glow=onGoal(b)?b.glow:0}
 p.fx=p.x;p.fy=p.y;p.x-=dx;p.y-=dy;p.t=0;p.dir=h.d;p.push=0;p.bump=null;BX.moves--;BX.q=[];BX.path=null;BX.stuck=findStuck();fx('bxUndo',1,.04);return true}
function restart(){if(BX.phase!='play'||BX.tr)return;BX.paused=false;fx('bxRestart',1,.2);transition(()=>loadLevel(BX.lvl,{quiet:1}))}
function arrive(b){fx('bxGoal',1+BX.boxes.filter(onGoal).length*.04,.03);BX.rings.push({x:b.x+.5,y:b.y+.5,t:0});
 for(let i=0;i<12;i++){const a=i/12*6.283+Math.random()*.4,v=2.2+Math.random()*2.4;BX.parts.push({x:b.x+.5,y:b.y+.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.45+Math.random()*.3,c:['#4fe3c1','#bff7ea','#ffe27a','#ffffff'][i%4],s:.09+Math.random()*.06,g:0})}}
function win(){BX.won=true;BX.winT=0;BX.q=[];BX.path=null;BX.hold=null;BX.stuck=[];const i=BX.lvl,d=data();
 d.done=d.done||[];d.done[i]=1;d.bm=d.bm||[];BX.newRec=!d.bm[i]||BX.moves<d.bm[i];if(BX.newRec)d.bm[i]=BX.moves;if(d.res&&d.res.l===i)delete d.res;
 try{BX.api&&BX.api.saveLevel(Math.min(NL,i+2))}catch(e){}if(i+1<NL&&unlocked()<i+2)d.level=Math.max(d.level||1,i+2);d.last=Math.min(NL-1,i+1);persist();fx('bxWin',1,.3)}
function confetti(n){const C=['#ff6b7d','#ffd45a','#4fe3c1','#7bb8ff','#c58cff','#ffffff'];const G=BX.G;for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=5+Math.random()*7;
 BX.parts.push({x:G.w/2+(Math.random()-.5)*G.w*.6,y:G.h*.55,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1.4+Math.random(),c:C[i%6],s:.1+Math.random()*.08,g:9,conf:1,r:Math.random()*6,vr:(Math.random()-.5)*12})}}
// chemin de marche (sans pousser) jusqu'à une case touchée
function walkPath(tx,ty){const G=BX.G,p=BX.p,prev=new Map(),k0=p.y*G.w+p.x,kt=ty*G.w+tx;if(k0==kt)return [];prev.set(k0,null);const q=[k0];
 while(q.length){const k=q.shift(),x=k%G.w,y=(k/G.w)|0;for(const d in DIRS){const[dx,dy]=DIRS[d],X=x+dx,Y=y+dy,K=Y*G.w+X;if(blocked(X,Y)||boxAt(X,Y)>=0||prev.has(K))continue;prev.set(K,[k,d]);
  if(K==kt){const out=[];let c=K;while(prev.get(c)){const[pk,dd]=prev.get(c);out.push(dd);c=pk}return out.reverse()}q.push(K)}}return null}
function tapCell(cx,cy){if(!canPlay())return;const p=BX.p,dx=cx-p.x,dy=cy-p.y;
 if(Math.abs(dx)+Math.abs(dy)==1){press(dx>0?'right':dx<0?'left':dy>0?'down':'up');return}
 if(blocked(cx,cy)||boxAt(cx,cy)>=0)return;const path=walkPath(cx,cy);if(path&&path.length){BX.path=path;BX.q=[];fx('bxSelect',.7,.05)}}
// ---------- commandes ----------
function canPlay(){return BX.phase=='play'&&!BX.won&&!BX.paused&&!BX.tr}
function press(d,src){if(BX.phase=='title'){navTitle(d);return}if(!canPlay())return;BX.path=null;if(BX.q.length<3)BX.q.push(d);BX.hold={d,t0:BX.t,src}}
function release(src){if(BX.hold&&(src==null||BX.hold.src===src))BX.hold=null}
function togglePause(){if(BX.phase!='play'||BX.won||BX.tr)return;BX.paused=!BX.paused;BX.hold=null;BX.q=[];BX.path=null;BX.uhold=null;fx('bxSelect');if(BX.paused)saveResume();music()}
function toggleMute(){BX.mute=!BX.mute;data().mute=BX.mute;persist();if(!BX.mute)fx('bxSelect');music()}
function exit(){saveResume();const a=BX.api;if(a)a.exit()}
function transition(mid){BX.tr={t:0,mid,done:false}}
function startLevel(i){const d=data();fx('bxSelect');const r=d.res&&d.res.l===i?d.res.h:null;transition(()=>loadLevel(i,{replay:r}))}
function nextLevel(){if(BX.lvl+1>=NL){transition(()=>{BX.phase='title';BX.sel=NL-1});return}startLevel(BX.lvl+1)}
function toTitle(){saveResume();transition(()=>{BX.phase='title';BX.sel=BX.lvl;BX.paused=false;BX.G=null})}
function navTitle(d){const u=unlocked(),cols=BX.L&&BX.L.tcols||6;let s=BX.sel;if(d=='left')s--;if(d=='right')s++;if(d=='up')s-=cols;if(d=='down')s+=cols;if(s>=0&&s<u&&s!==BX.sel){BX.sel=s;fx('bxTick',1,.03)}else if(s>=u&&s<NL)lockedMsg(s)}
function lockedMsg(i){BX.msg={s:'TERMINE LE NIVEAU '+i+" POUR LE DÉBLOQUER",t:0};fx('bxLocked',1,.2)}
function ok(){if(BX.tr)return;if(BX.phase=='title'){if(BX.sel<unlocked())startLevel(BX.sel);return}if(BX.paused){togglePause();return}if(BX.phase=='won'&&BX.panelT>.35)nextLevel()}
// ---------- mise à jour ----------
function update(dt){dt=Math.min(dt,.05);BX.t+=dt;if(BX.msg){BX.msg.t+=dt;if(BX.msg.t>2.2)BX.msg=null}
 if(BX.tr){const T=BX.tr;T.t+=dt/.42;if(T.t>=.5&&!T.done){T.done=true;try{T.mid()}catch(e){console.error(e)}}if(T.t>=1)BX.tr=null}
 parts(dt);
 if(BX.paused||BX.phase=='title'||!BX.G){music();return}
 const p=BX.p;
 if(p.t<1)p.t=Math.min(1,p.t+dt/MT);for(const b of BX.boxes){if(b.t<1)b.t=Math.min(1,b.t+dt/MT);if(b.pop>0)b.pop=Math.max(0,b.pop-dt*3.5);const on=onGoal(b)&&b.t>=1;b.glow=on?Math.min(1,b.glow+dt*4):Math.max(0,b.glow-dt*6)}
 if(p.pushT>0)p.pushT=Math.max(0,p.pushT-dt);if(p.bump){p.bump.t+=dt/.16;if(p.bump.t>=1)p.bump=null}
 BX.introT+=dt;if(BX.stuck.length)BX.stuckT+=dt;
 if(BX.won){BX.winT+=dt;const k=Math.floor(BX.winT*5);if(BX.winT<1.4&&k!==Math.floor((BX.winT-dt)*5))confetti(k==0?40:14);p.hop=Math.max(0,Math.sin(Math.min(1,BX.winT/.38)*Math.PI))*(BX.winT<1.2?1:0);
  if(BX.winT>1.25&&BX.phase=='play'){BX.phase='won';BX.panelT=0}}
 if(BX.phase=='won')BX.panelT+=dt;
 // ANNULER maintenu : annulations répétées
 if(BX.uhold&&canPlay()&&p.t>=1){const U=BX.uhold;if(BX.t-U.t0>=UNDO_HOLD&&BX.t-U.last>=UNDO_REP){U.last=BX.t;undo()}}
 // un pas à la fois : appui en attente, puis chemin touché, puis direction maintenue (répétition)
 if(canPlay()&&p.t>=1&&BX.boxes.every(b=>b.t>=1)){let d=null,fromPath=false;
  if(BX.q.length)d=BX.q.shift();else if(BX.path&&BX.path.length){d=BX.path.shift();fromPath=true}else if(BX.hold&&BX.t-BX.hold.t0>=HOLD)d=BX.hold.d;
  if(d){const r=step(d);if(fromPath&&r!='move')BX.path=null;if(r=='blocked'||r=='stuck')BX.q=[]}}
 music()}
function parts(dt){for(const q of BX.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=(q.g||0)*dt;q.vx*=Math.pow(q.conf?.5:.08,dt);if(!q.conf)q.vy*=Math.pow(.08,dt);q.l-=dt;if(q.r!=null)q.r+=q.vr*dt}BX.parts=BX.parts.filter(q=>q.l>0);
 for(const r of BX.rings)r.t+=dt/.45;BX.rings=BX.rings.filter(r=>r.t<1)}
// ---------- couleurs du personnage : celles de l'apparence choisie dans Little Life ----------
function look(){let L={};try{L=N.look||{}}catch(e){}const pick=(arr,i,d)=>{try{return arr&&arr[i|0]||d}catch(e){return d}};
 let SK,HR,PN,SZ;
 try{SK=SKP}catch(e){}try{HR=HRP}catch(e){}try{PN=PNP}catch(e){}try{SZ=SZP}catch(e){}
 let top='#4f8fe0';try{if(L.top=='p')top=PULLC[L.puc||0];else if((L.tco||0)!=0||L.ve===0)top=TEEC[L.tco||0];else top=JKP[L.jk||0]}catch(e){}
 return{skin:pick(SK,L.sk,'#eeb088'),hair:pick(HR,L.hr,'#8a4e2e'),top:top||'#4f8fe0',pants:pick(PN,L.pn,'#3a4a78'),shoes:pick(SZ,L.sz,'#2a2a33'),long:L.g=='f'}}
function shade(c,k){const n=parseInt(String(c).slice(1,7),16);if(isNaN(n))return c;let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return'#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
// ---------- sprites pixel art (dessinés sur une grille de 16×16, à la taille exacte d'une case) ----------
function mk(T,f){const c=document.createElement('canvas');c.width=c.height=T;const g=c.getContext('2d'),k=T/16;
 const P=(x,y,w,h,col)=>{const X=Math.round(x*k),Y=Math.round(y*k),X2=Math.round((x+w)*k),Y2=Math.round((y+h)*k);if(X2<=X||Y2<=Y)return;g.fillStyle=col;g.fillRect(X,Y,X2-X,Y2-Y)};f(P,g,k);return c}
const PAL={void:'#2b1f3d',void2:'#33264a',fa:'#f7e8c9',fb:'#f0deb9',fg:'#dcc39b',fs:'#e6d0a6',cap:'#d08a6a',capH:'#eaa98a',capD:'#b06a50',capT:'#c27c5e',front:'#9e5a46',mort:'#7c4233',deep:'#5c2e25',ol:'#3a1f2a',
 wood:'#d9924a',woodL:'#f2bb6c',woodD:'#a9652f',woodM:'#c47d3c',woodO:'#5a3218',nail:'#7b5a44',teal:'#4fe3c1',tealD:'#1f9c84',tealL:'#c9fbef',gold:'#ffd45a'};
function sprFloor(T,alt){return mk(T,P=>{P(0,0,16,16,alt?PAL.fb:PAL.fa);P(0,15,16,1,PAL.fg);P(15,0,1,16,PAL.fg);P(3,4,1,1,PAL.fs);P(10,9,1,1,PAL.fs);P(7,12,2,1,PAL.fs);P(12,3,1,1,'#fbf1dc')})}
function sprWall(T,front,top,v){return mk(T,P=>{
 if(front){P(0,0,16,10,PAL.cap);P(0,9,16,1,PAL.capD);P(0,10,16,6,PAL.front);P(0,12,16,1,PAL.mort);P(0,15,16,1,PAL.deep);
  const o=v%2?3:0;P(4+o,10,1,2,PAL.mort);P(11+o,10,1,2,PAL.mort);P(1+o,13,1,2,PAL.mort);P(8+o,13,1,2,PAL.mort);P(0,10,16,1,shade(PAL.front,.12))}
 else P(0,0,16,16,PAL.cap);
 if(top)P(0,0,16,1,PAL.capH);
 // grain de la pierre
 const s=[[2,3,3,1],[9,5,4,1],[5,7,2,1],[12,2,2,1]],s2=[[3,12,3,1],[10,13,2,1]];for(const[a,b,c,d]of s)P((a+v*5)%14,b,c,d,PAL.capT);if(!front)for(const[a,b,c,d]of s2)P((a+v*3)%14,b,c,d,PAL.capT);P((6+v*7)%15,1+(v%3),1,1,PAL.capH)})}
function sprGoal(T){return mk(T,P=>{for(let j=0;j<16;j++)for(let i=0;i<16;i++){const d=Math.hypot(i+.5-8,j+.5-8);
 if(d>=4.3&&d<5.4)P(i,j,1,1,PAL.tealD);else if(d>=3.2&&d<4.3)P(i,j,1,1,PAL.teal);else if(d<1.6)P(i,j,1,1,PAL.tealL);else if(d<2.3)P(i,j,1,1,PAL.teal)}
 // petites encoches aux quatre coins
 for(const[x,y]of[[2,2],[13,2],[2,13],[13,13]])P(x,y,1,1,PAL.tealD)})}
function sprCrate(T,on){return mk(T,P=>{const W=on?'#e9a64f':PAL.wood,WL=on?'#ffd27e':PAL.woodL,WD=on?'#b5722f':PAL.woodD,WM=on?'#d48f3f':PAL.woodM,O=on?'#155e52':PAL.woodO;
 P(1,1,14,14,O);P(2,2,12,12,W);
 P(2,2,12,2,WM);P(2,12,12,2,WM);P(2,2,2,12,WM);P(12,2,2,12,WM);
 P(2,2,12,1,WL);P(2,2,1,12,WL);P(2,13,12,1,WD);P(13,2,1,12,WD);P(4,4,8,1,WD);P(4,4,1,8,WD);
 for(let i=0;i<8;i++){P(4+i,4+i,1,1,WL);P(5+i>11?11:5+i,4+i,1,1,WM)}P(11,11,1,1,WL);
 for(const[x,y]of[[3,3],[12,3],[3,12],[12,12]])P(x,y,1,1,on?'#7a4a20':PAL.nail);
 if(on){P(1,1,14,1,PAL.teal);P(1,14,14,1,PAL.teal);P(1,1,1,14,PAL.teal);P(14,1,1,14,PAL.teal);P(6,7,1,1,'#ffffff');P(7,8,1,1,'#ffffff');P(8,7,1,1,'#ffffff');P(9,6,1,1,'#ffffff')}})}
// personnage : dir down/up/left/right, pas (0/1), pose de poussée
function sprHero(T,dir,stepF,push,C){const side=dir=='left'||dir=='right';const base=mk(T,(P)=>{
 const S=C.skin,H=C.hair,Hd=shade(C.hair,-.25),TP=C.top,TPd=shade(C.top,-.25),PN=C.pants,SH=C.shoes,E='#2a1a2a',BL='#ff9aa8';
 const legs=(a,b,lift)=>{P(a,12,2,2,PN);P(b,12,2,2,PN);P(a-(side?0:1),14-(lift==1?1:0),3,1,SH);P(b,14-(lift==2?1:0),3,1,SH)};
 if(!side){const back=dir=='up';
  // cheveux et tête
  P(4,1,8,1,H);P(3,2,10,3,H);P(3,5,1,2,H);P(12,5,1,2,H);
  if(back){P(3,2,10,6,H);P(4,7,8,1,Hd);if(C.long){P(3,8,10,2,H);P(4,9,8,1,Hd)}}
  else{P(4,4,8,4,S);P(4,4,8,1,H);P(4,5,3,1,H);P(10,5,2,1,H);P(5,6,1,2,E);P(10,6,1,2,E);P(4,7,1,1,BL);P(11,7,1,1,BL);P(7,7,2,1,shade(S,-.12));if(C.long){P(3,5,1,5,H);P(12,5,1,5,H)}}
  P(5,8,6,1,back?H:S);
  // corps
  P(4,8,8,4,TP);P(4,11,8,1,TPd);P(7,8,2,1,back?TPd:shade(TP,.2));
  if(push&&!back){P(4,9,1,1,TP);P(11,9,1,1,TP);P(5,10,2,1,S);P(9,10,2,1,S)}
  else if(push&&back){P(3,8,1,2,TP);P(12,8,1,2,TP);P(3,7,1,1,S);P(12,7,1,1,S)}
  else{P(3,8,1,3,TP);P(12,8,1,3,TP);P(3,11,1,1,S);P(12,11,1,1,S)}
  legs(5,9,stepF?1:2)}
 else{// profil (vers la droite ; miroir pour la gauche)
  P(5,1,7,1,H);P(4,2,8,3,H);P(4,5,3,3,H);if(C.long)P(4,8,3,2,H);
  P(7,4,5,4,S);P(7,4,5,1,H);P(11,5,1,1,H);P(10,6,1,2,E);P(9,7,1,1,BL);P(12,6,1,1,S);
  P(6,8,5,4,TP);P(6,11,5,1,TPd);
  if(push){P(9,8,4,2,TP);P(13,8,1,2,S)}else{P(8,8,2,3,TPd);P(8,11,2,1,S)}
  if(stepF){P(6,12,2,2,PN);P(9,12,2,1,PN);P(5,14,3,1,SH);P(10,13,3,1,SH)}else{P(7,12,2,2,PN);P(8,12,2,2,PN);P(7,14,4,1,SH)}}});
 // contour sombre d'un pixel de jeu autour de la silhouette
 const c=document.createElement('canvas');c.width=c.height=T;const g=c.getContext('2d'),m=document.createElement('canvas');m.width=m.height=T;const mg=m.getContext('2d');
 mg.drawImage(base,0,0);mg.globalCompositeOperation='source-in';mg.fillStyle=PAL.ol;mg.fillRect(0,0,T,T);
 if(dir=='left'){g.translate(T,0);g.scale(-1,1)}
 for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]])g.drawImage(m,a,b);g.drawImage(base,0,0);return c}
function spr(key,make){let c=BX.spr[key];if(!c){c=make();BX.spr[key]=c}return c}
// ---------- mise en page ----------
function cpp(){try{return AX.cv.getBoundingClientRect().width/AX.L.W||1.4}catch(e){return 1.4}}
function layout(w,h){const u=v=>Math.ceil(v/cpp()),L={w,h};BX.touch={};BX.hold=null;BX.uhold=null;
 const m=Math.max(4,u(10));L.m=m;const hb=Math.max(20,u(44));L.hud={h:hb+2*Math.max(3,u(6))};L.hb=hb;
 L.back={x:m,y:Math.round((L.hud.h-hb)/2),w:hb,h:hb};L.pause={x:w-m-hb,y:L.back.y,w:hb,h:hb};
 const touch=BX.touchUI,bh=Math.max(18,u(46)),gap=Math.max(4,u(8)),dk=Math.max(18,u(54)),dp=dk*3;L.bh=bh;
 let bw=Math.max(TW('RECOMMENCER')+Math.round(bh*.9)+14,u(150));
 // a) commandes en bas (portrait)   b) commandes sur les côtés (paysage)
 const G=BX.G,cols=G?G.w:9,rows=G?G.h:9,top=L.hud.h+gap;
 const tile=(aw,ah)=>Math.max(6,Math.floor(Math.min(aw/cols,ah/rows,u(76))));
 let A,B=null;
 {const ch=touch?Math.max(dp,2*bh+gap):bh,by=h-m-ch,aw=w-2*m,ah=by-gap-top;if(touch&&bw+dp+3*m>w){bw=Math.max(TW('RECOMMENCER')+14,w-dp-3*m)}
  A={k:tile(aw,ah),gx:m,gy:top,gw:aw,gh:ah,by,ch}}
 // en paysage : colonnes compactes (boutons à gauche, pavé à droite), le pavé rétrécit si l'écran est bas (jamais sous 44 px par flèche)
 if(touch&&w>h*1.08){const dks=Math.max(u(44),Math.min(dk,Math.floor((h-L.hud.h-2*m)/3))),bws=Math.max(TW('RECOMMENCER')+16,u(104)),sl=bws+2*m,sr=3*dks+2*m,aw=w-sl-sr,ah=h-top-m;if(aw>0)B={k:tile(aw,ah),gx:sl,gy:top,gw:aw,gh:ah,dks,bws}}
 const side=B&&B.k>A.k*1.06;L.side=!!side;const Z=side?B:A;L.k=Z.k;
 if(G){L.ox=Math.round(Z.gx+(Z.gw-G.w*Z.k)/2);L.oy=Math.round(Z.gy+(Z.gh-G.h*Z.k)/2);L.gw=G.w*Z.k;L.gh=G.h*Z.k}
 L.area={x:Z.gx,y:Z.gy,w:Z.gw,h:Z.gh};
 if(side){const q=B.dks*3;L.dpad={x:w-m-q,y:h-m-q,k:B.dks};L.undo={x:m,y:h-m-2*bh-gap,w:B.bws,h:bh};L.reset={x:m,y:h-m-bh,w:B.bws,h:bh}}
 else if(touch){L.dpad={x:w-m-dp,y:A.by+Math.round((A.ch-dp)/2),k:dk};const cy=A.by+Math.round((A.ch-(2*bh+gap))/2);L.undo={x:m,y:cy,w:bw,h:bh};L.reset={x:m,y:cy+bh+gap,w:bw,h:bh}}
 else{const tw=Math.min(bw,Math.floor((w-3*m)/2));L.undo={x:Math.round(w/2-tw-gap/2),y:A.by,w:tw,h:bh};L.reset={x:Math.round(w/2+gap/2),y:A.by,w:tw,h:bh}}
 if(L.dpad){const D=L.dpad,k=D.k;D.cx=D.x+1.5*k;D.cy=D.y+1.5*k;D.b={up:{x:D.x+k,y:D.y,w:k,h:k},down:{x:D.x+k,y:D.y+2*k,w:k,h:k},left:{x:D.x,y:D.y+k,w:k,h:k},right:{x:D.x+2*k,y:D.y+k,w:k,h:k}}}
 L.bsz=bh;BX.L=L;BX.W=w;BX.H=h;BX.room=null}
// pièce (sol + murs) mise en cache
function roomCanvas(){const L=BX.L,G=BX.G,k=L.k,c=document.createElement('canvas');c.width=G.w*k+2;c.height=G.h*k+2;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 const W=(X,Y)=>X>=0&&Y>=0&&X<G.w&&Y<G.h&&G.wall[Y*G.w+X],I=(X,Y)=>X>=0&&Y>=0&&X<G.w&&Y<G.h&&G.inside[Y*G.w+X]&&!G.wall[Y*G.w+X];
 for(let y=0;y<G.h;y++)for(let X=0;X<G.w;X++){const px=1+X*k,py=1+y*k;
  if(I(X,y)){x.drawImage(spr('f|'+k+'|'+((X+y)&1),()=>sprFloor(k,(X+y)&1)),px,py);if(W(X,y-1)){x.fillStyle='rgba(90,44,30,.2)';x.fillRect(px,py,k,Math.max(1,Math.round(k*.16)));x.fillStyle='rgba(90,44,30,.1)';x.fillRect(px,py,k,Math.max(1,Math.round(k*.28)))}
   if(W(X-1,y)){x.fillStyle='rgba(90,44,30,.12)';x.fillRect(px,py,Math.max(1,Math.round(k*.12)),k)}}
  else if(W(X,y)){const front=!W(X,y+1),top=!W(X,y-1),v=(X*7+y*3)%4;x.drawImage(spr('w|'+k+'|'+(front?1:0)+(top?1:0)+v,()=>sprWall(k,front,top,v)),px,py)}}
 // contour sombre là où un mur touche l'extérieur
 x.fillStyle=PAL.ol;for(let y=0;y<G.h;y++)for(let X=0;X<G.w;X++){if(!W(X,y))continue;const px=1+X*k,py=1+y*k,out=(a,b)=>!W(a,b)&&!I(a,b);
  if(out(X,y-1))x.fillRect(px,py-1,k,1);if(out(X,y+1))x.fillRect(px,py+k,k,1);if(out(X-1,y))x.fillRect(px-1,py,1,k);if(out(X+1,y))x.fillRect(px+k,py,1,k)}
 const sh=document.createElement('canvas');sh.width=c.width;sh.height=c.height;const sx=sh.getContext('2d');sx.drawImage(c,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle='rgba(12,5,24,.5)';sx.fillRect(0,0,sh.width,sh.height);BX.roomSh=sh;
 return c}
// ---------- rendu ----------
function background(x,L){const g=x.createLinearGradient(0,0,0,L.h);g.addColorStop(0,'#2b1f3d');g.addColorStop(1,'#46294f');x.fillStyle=g;x.fillRect(0,0,L.w,L.h);
 // motif de petites caisses en filigrane, qui défile doucement
 const s=Math.max(14,Math.round((L.k||20)*1.15)),off=(BX.t*4)%(s*2);x.fillStyle='rgba(255,255,255,.035)';
 for(let y=-s*2;y<L.h+s;y+=s)for(let X=-s*2+((y/s)&1)*s;X<L.w+s;X+=s*2){x.fillRect(Math.round(X+off),Math.round(y+off*.5),Math.round(s*.6),Math.round(s*.6))}
 const v=x.createRadialGradient(L.w/2,L.h/2,Math.min(L.w,L.h)*.3,L.w/2,L.h/2,Math.max(L.w,L.h)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,4,20,.45)');x.fillStyle=v;x.fillRect(0,0,L.w,L.h)}
function heroPos(){const p=BX.p,e=ease(p.t);let X=lerp(p.fx,p.x,e),Y=lerp(p.fy,p.y,e);if(p.bump){const[dx,dy]=DIRS[p.bump.d],a=Math.sin(p.bump.t*Math.PI)*.14;X+=dx*a;Y+=dy*a}return{X,Y}}
function board(x,L){const G=BX.G,k=L.k,ox=L.ox,oy=L.oy;if(!BX.room)BX.room=roomCanvas();
 // ombre portée de la pièce
 x.drawImage(BX.roomSh,ox-1+Math.max(2,Math.round(k*.14)),oy-1+Math.max(2,Math.round(k*.2)));x.drawImage(BX.room,ox-1,oy-1);
 // cibles lumineuses (halo qui respire)
 const gs=spr('g|'+k,()=>sprGoal(k)),pulse=.5+.5*Math.sin(BX.t*3.2);
 for(let y=0;y<G.h;y++)for(let X=0;X<G.w;X++){if(!G.goal[y*G.w+X]||!G.inside[y*G.w+X])continue;const cx=ox+X*k+k/2,cy=oy+y*k+k/2,bi=boxAt(X,y),covered=bi>=0&&BX.boxes[bi].t>=1;
  const gr=x.createRadialGradient(cx,cy,0,cx,cy,k*.75);gr.addColorStop(0,'rgba(79,227,193,'+(covered?.5:.32+.22*pulse)+')');gr.addColorStop(1,'rgba(79,227,193,0)');x.fillStyle=gr;x.fillRect(cx-k,cy-k,2*k,2*k);
  if(!covered)x.drawImage(gs,ox+X*k,oy+y*k)}
 // objets, de haut en bas (profondeur)
 const hp=heroPos(),items=BX.boxes.map(b=>{const e=ease(b.t);return{y:lerp(b.fy,b.y,e),x:lerp(b.fx,b.x,e),b}});items.push({y:hp.Y,x:hp.X,hero:1});items.sort((a,b)=>a.y-b.y||(a.hero?1:-1));
 const stuck=new Set(BX.stuck),blink=.5+.5*Math.sin(BX.stuckT*9);
 for(const it of items){const X=ox+it.x*k,Y=oy+it.y*k;
  x.fillStyle='rgba(70,34,24,.28)';x.beginPath();x.ellipse(X+k/2,Y+k*.9,k*.38,k*.12,0,0,7);x.fill();
  if(it.hero){heroDraw(x,X,Y,k);continue}
  const b=it.b,on=b.glow>.5,s=1+b.pop*.18,cs=spr('c|'+k+'|'+(on?1:0),()=>sprCrate(k,on));
  if(s!==1){x.save();x.translate(X+k/2,Y+k/2);x.scale(s,s);x.drawImage(cs,-k/2,-k/2);x.restore()}else x.drawImage(cs,Math.round(X),Math.round(Y));
  if(b.glow>0&&b.glow<1){x.globalAlpha=1-b.glow;x.drawImage(spr('c|'+k+'|0',()=>sprCrate(k,false)),Math.round(X),Math.round(Y));x.globalAlpha=1}
  if(stuck.has(b.id)){x.strokeStyle='rgba(255,70,90,'+(.45+.55*blink)+')';x.lineWidth=Math.max(2,Math.round(k*.1));rr(x,Math.round(X)+1,Math.round(Y)+1,k-2,k-2,Math.max(2,k*.12));x.stroke();
   x.fillStyle='rgba(255,70,90,'+(.12+.12*blink)+')';x.fillRect(Math.round(X)+2,Math.round(Y)+2,k-4,k-4)}}
 // anneaux et étincelles
 for(const r of BX.rings){x.strokeStyle='rgba(191,247,234,'+(1-r.t)+')';x.lineWidth=Math.max(1,k*.08*(1-r.t)+1);x.beginPath();x.arc(ox+r.x*k,oy+r.y*k,k*(.35+r.t*.55),0,7);x.stroke()}
 for(const q of BX.parts){const a=Math.min(1,q.l*2.5);x.globalAlpha=a;x.fillStyle=q.c;const s=Math.max(2,Math.round(q.s*k));
  if(q.conf){x.save();x.translate(ox+q.x*k,oy+q.y*k);x.rotate(q.r);x.fillRect(-s,-s/2,s*2,s);x.restore()}else x.fillRect(Math.round(ox+q.x*k-s/2),Math.round(oy+q.y*k-s/2),s,s)}x.globalAlpha=1}
function heroDraw(x,X,Y,k){const p=BX.p;if(!BX.look)BX.look=look();const C=BX.look,moving=p.t<1,stepF=moving?(p.t<.5?p.step:p.step^1):0,push=p.pushT>0||(moving&&p.push);
 const idle=!moving&&!p.bump?Math.round(Math.sin(BX.t*3)*.6):0,hop=Math.round(-p.hop*k*.42),key='h|'+k+'|'+p.dir+stepF+(push?1:0);
 const s=spr(key,()=>sprHero(k,p.dir,stepF,push,C));x.drawImage(s,Math.round(X),Math.round(Y-k*.06)+idle+hop)}
function iconBtn(x,b,kind,on){const r=Math.max(4,b.w*.28);x.fillStyle=on?'#fff3d6':'rgba(43,31,61,.88)';rr(x,b.x,b.y,b.w,b.h,r);x.fill();x.strokeStyle=on?'#ffffff':'rgba(242,187,108,.75)';x.lineWidth=1;rr(x,b.x+.5,b.y+.5,b.w-1,b.h-1,r);x.stroke();
 const c=on?'#2b1f3d':'#fff3d6',cx=b.x+b.w/2,cy=b.y+b.h/2,s=b.w*.17;x.fillStyle=c;x.strokeStyle=c;
 if(kind=='pause'){x.fillRect(Math.round(cx-s*1.3),Math.round(cy-s*1.5),Math.max(2,Math.round(s*.9)),Math.round(s*3));x.fillRect(Math.round(cx+s*.4),Math.round(cy-s*1.5),Math.max(2,Math.round(s*.9)),Math.round(s*3))}
 else{x.lineWidth=Math.max(2,s*.7);x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(cx+s*1.4,cy);x.lineTo(cx-s*1.3,cy);x.moveTo(cx-s*.1,cy-s*1.3);x.lineTo(cx-s*1.4,cy);x.lineTo(cx-s*.1,cy+s*1.3);x.stroke();x.lineCap='butt'}}
function hud(x,L){const g=x.createLinearGradient(0,0,0,L.hud.h);g.addColorStop(0,'rgba(30,20,44,.96)');g.addColorStop(1,'rgba(30,20,44,.78)');x.fillStyle=g;x.fillRect(0,0,L.w,L.hud.h);x.fillStyle='#f2bb6c';x.fillRect(0,L.hud.h-1,L.w,1);
 const T=BX.touch,hit=id=>Object.values(T).some(t=>t.btn&&t.btn.id==id);
 iconBtn(x,L.back,'back',hit('back'));BX.btns.push(Object.assign({id:'back'},L.back));
 if(BX.phase!='title'){iconBtn(x,L.pause,'pause',hit('pause')||BX.paused);BX.btns.push(Object.assign({id:'pause'},L.pause))}
 const x0=L.back.x+L.back.w+6,x1=(BX.phase!='title'?L.pause.x:L.w-L.m)-6,cx=(x0+x1)/2,sp=x1-x0;
 const big=sp>=TW('BOX MASTER',2)+8&&L.hud.h>=34?2:1;let y=Math.round(L.hud.h/2-(BX.phase=='title'?7*big/2:(7*big+4+7)/2));
 logo(x,cx,y,big);if(BX.phase=='title')return;y+=7*big+4;
 const on=BX.boxes.filter(onGoal).length,sep='  ·  ';let P=[['NIVEAU '+(BX.lvl+1)+'/'+NL,'#ffd45a'],[BX.moves+' DÉPLACEMENT'+(BX.moves>1?'S':''),'#ffffff'],['CAISSES '+on+'/'+BX.boxes.length,'#4fe3c1']];
 const wid=a=>a.reduce((s,q)=>s+TW(q[0]),0)+TW(sep)*(a.length-1)+(a.length-1)*2;while(P.length>1&&wid(P)>sp)P.pop();if(wid(P)>sp)P=[['N'+(BX.lvl+1)+' · '+BX.moves+' DÉPL.','#ffffff']];
 let X=Math.round(cx-wid(P)/2);P.forEach((q,i)=>{if(i){TX(x,sep,X,y,'#8f7fae');X+=TW(sep)+2}TX(x,q[0],X,y,q[1]);X+=TW(q[0])+0})}
function logo(x,cx,y,sc){const a='BOX',b='MASTER',w=TW(a+' '+b,sc),X=Math.round(cx-w/2);TX(x,a,X,y,'#f2bb6c',sc,'#5a3218');TX(x,b,X+TW(a+' ',sc),y,'#4fe3c1',sc,'#155e52')}
function bigBtn(x,b,lab,col,icon,dis,pulse){const T=BX.touch,on=Object.values(T).some(t=>t.btn&&t.btn.id==b.id),r=Math.min(12,b.h/2);
 x.fillStyle='rgba(10,4,20,.35)';rr(x,b.x,b.y+2,b.w,b.h,r);x.fill();x.fillStyle=on?'#fff3d6':dis?'rgba(70,58,88,.85)':col;rr(x,b.x,b.y,b.w,b.h,r);x.fill();
 if(pulse&&!on){x.strokeStyle='rgba(255,255,255,'+(.4+.6*Math.abs(Math.sin(BX.t*5)))+')';x.lineWidth=2;rr(x,b.x-1,b.y-1,b.w+2,b.h+2,r+1);x.stroke()}
 x.fillStyle='rgba(255,255,255,.28)';x.fillRect(b.x+r,b.y+2,b.w-2*r,1);if(icon&&TW(lab)+Math.round(b.h*.42)+5>b.w-10)icon=null;const tc=on?'#2b1f3d':dis?'#9b90ad':'#ffffff',iw=icon?Math.round(b.h*.42):0,tw=TW(lab)+(icon?iw+5:0),X0=Math.round(b.x+b.w/2-tw/2),cy=b.y+b.h/2;
 if(icon){x.strokeStyle=tc;x.fillStyle=tc;x.lineWidth=Math.max(2,iw*.16);x.lineCap='round';const ix=X0+iw/2,r2=iw*.42;x.beginPath();
  if(icon=='undo'){x.arc(ix,cy,r2,Math.PI*1.05,Math.PI*.35,false);x.stroke();x.beginPath();x.moveTo(ix-r2-iw*.22,cy-iw*.1);x.lineTo(ix-r2,cy+iw*.18);x.lineTo(ix-r2+iw*.26,cy-iw*.02);x.stroke()}
  else{x.arc(ix,cy,r2,-Math.PI*.35,Math.PI*1.45,false);x.stroke();x.beginPath();x.moveTo(ix+r2*.25,cy-r2-iw*.2);x.lineTo(ix+r2*.62,cy-r2);x.lineTo(ix+r2*.18,cy-r2+iw*.22);x.stroke()}x.lineCap='butt'}
 TX(x,lab,X0+(icon?iw+5:0),Math.round(cy-3.5),tc,1,on?null:'rgba(0,0,0,.3)');BX.btns.push(Object.assign({id:b.id},b))}
function controls(x,L){if(BX.phase!='play'&&BX.phase!='won')return;const st=BX.stuck.length>0&&!BX.won;
 bigBtn(x,Object.assign({id:'undo'},L.undo),'ANNULER','#6a4fb0','undo',!BX.hist.length||BX.won,st);bigBtn(x,Object.assign({id:'reset'},L.reset),'RECOMMENCER','#c0587a','reset',BX.won,st);
 if(!L.dpad)return;const D=L.dpad,k=D.k,hd=BX.hold&&BX.hold.src&&String(BX.hold.src).startsWith('t')?BX.hold.d:null;
 x.fillStyle='rgba(20,12,32,.35)';x.beginPath();x.arc(D.cx,D.cy,k*1.62,0,7);x.fill();
 x.fillStyle='rgba(43,31,61,.82)';rr(x,D.x+k*.06,D.y+k+k*.06,3*k-k*.12,k-k*.12,k*.25);x.fill();rr(x,D.x+k+k*.06,D.y+k*.06,k-k*.12,3*k-k*.12,k*.25);x.fill();
 for(const d in D.b){const b=D.b[d],on=hd==d,c=b.x+b.w/2,cy=b.y+b.h/2,s=k*.24;x.fillStyle=on?'#fff3d6':'rgba(242,187,108,.22)';rr(x,b.x+k*.1,b.y+k*.1,k*.8,k*.8,k*.2);x.fill();
  x.fillStyle=on?'#2b1f3d':'#fff3d6';x.beginPath();const[dx,dy]=DIRS[d];x.moveTo(c+dx*s*1.2,cy+dy*s*1.2);x.lineTo(c-dx*s*.6+dy*s*1.1,cy-dy*s*.6+dx*s*1.1);x.lineTo(c-dx*s*.6-dy*s*1.1,cy-dy*s*.6-dx*s*1.1);x.closePath();x.fill()}
 x.fillStyle='rgba(242,187,108,.5)';x.beginPath();x.arc(D.cx,D.cy,k*.2,0,7);x.fill()}
function panel(x,w,h,col){const L=BX.L,W=Math.min(w,L.w-2*L.m),X=Math.round(L.w/2-W/2),Y=Math.round(cl((L.hud.h+L.h)/2-h/2,L.hud.h+L.m,L.h-h-L.m));
 x.fillStyle='rgba(10,4,20,.4)';rr(x,X+3,Y+4,W,h,12);x.fill();x.fillStyle='rgba(43,31,61,.97)';rr(x,X,Y,W,h,12);x.fill();x.strokeStyle=col||'#f2bb6c';x.lineWidth=2;rr(x,X+1,Y+1,W-2,h-2,11);x.stroke();
 return{X,Y,w:W,h,cx:X+W/2}}
function pbtn(x,id,X,Y,w,lab,col){const b={id,x:Math.round(X),y:Math.round(Y),w:Math.round(w),h:BX.L.bsz};bigBtn(x,b,lab,col);return b}
function introCard(x,L){if(BX.introT>2.2||BX.phase!='play'||BX.won)return;const a=cl(Math.min(BX.introT*5,(2.2-BX.introT)*3),0,1);if(a<=0)return;const Lv=LEVELS[BX.lvl],t=tierOf(BX.lvl);
 x.globalAlpha=a;const w=Math.min(L.w-2*L.m,Math.max(TW(Lv.nom,2),TW(t.nom))+40),h=48,X=Math.round(L.w/2-w/2),Y=Math.round(L.area.y+4-(1-ease(Math.min(1,BX.introT*4)))*10);
 x.fillStyle='rgba(43,31,61,.92)';rr(x,X,Y,w,h,10);x.fill();x.strokeStyle=t.c;x.lineWidth=2;rr(x,X+1,Y+1,w-2,h-2,9);x.stroke();
 CT(x,'NIVEAU '+(BX.lvl+1),L.w/2,Y+6,t.c);const sc=TW(Lv.nom,2)<=w-12?2:1;CT(x,Lv.nom,L.w/2,Y+17,'#ffffff',sc,'#1e1430');CT(x,t.nom,L.w/2,Y+h-11,'#c9b7e6');x.globalAlpha=1}
function stuckBanner(x,L){if(!BX.stuck.length||BX.won||BX.phase!='play')return;const a=Math.min(1,BX.stuckT*6),s1='CAISSE BLOQUÉE !',s2='ANNULE OU RECOMMENCE',w=Math.min(L.w-2*L.m,Math.max(TW(s1,2),TW(s2))+28),h=38;
 const X=Math.round(L.w/2-w/2),Y=Math.round(Math.min(L.oy+L.gh+4,L.area.y+L.area.h-h)-(1-a)*8);x.globalAlpha=a;x.fillStyle='rgba(60,14,30,.94)';rr(x,X,Y,w,h,9);x.fill();x.strokeStyle='#ff6b7d';x.lineWidth=2;rr(x,X+1,Y+1,w-2,h-2,8);x.stroke();
 CT(x,s1,L.w/2,Y+6,'#ff9aa8',TW(s1,2)<=w-8?2:1,'#2a0a14');CT(x,s2,L.w/2,Y+h-12,'#ffffff');x.globalAlpha=1}
function winCard(x,L){if(BX.phase!='won')return;const t=BX.panelT,a=ease(Math.min(1,t*3)),last=BX.lvl+1>=NL,bh=L.bsz,h=96+bh*2+8+(last?14:0);
 x.globalAlpha=.55*a;x.fillStyle='#120a1e';x.fillRect(0,0,L.w,L.h);x.globalAlpha=a;
 const P=panel(x,Math.min(270,L.w-2*L.m),h,'#4fe3c1'),dy=Math.round((1-a)*24);let y=P.Y+12+dy;const sc=TW('NIVEAU TERMINÉ !',2)<=P.w-12?2:1,hue=['#ffd45a','#4fe3c1','#ff9aa8'][Math.floor(BX.t*5)%3];
 CT(x,'NIVEAU TERMINÉ !',P.cx,y-Math.round(Math.abs(Math.sin(t*6))*Math.max(0,2-t*2)*3),hue,sc,'#1e1430');y+=7*sc+9;CT(x,LEVELS[BX.lvl].nom,P.cx,y,'#c9b7e6');y+=13;
 CT(x,'DÉPLACEMENTS : '+BX.moves,P.cx,y,'#ffffff',TW('DÉPLACEMENTS : '+BX.moves,2)<=P.w-16?2:1,'#1e1430');y+=20;
 CT(x,BX.newRec?'NOUVEAU RECORD !':'RECORD : '+bestMoves(BX.lvl),P.cx,y,BX.newRec?'#7be38a':'#8f7fae');y+=14;if(last){CT(x,'TU ES UN VRAI MAÎTRE DES CAISSES !',P.cx,y,'#ffd45a');y+=14}
 if(t>.3){const bw=P.w-28;pbtn(x,last?'levels':'next',P.cx-bw/2,y+dy,bw,last?'CHOIX DU NIVEAU':'NIVEAU SUIVANT','#2fa86a');pbtn(x,'replay',P.cx-bw/2,y+dy+bh+8,bw,'REJOUER','#6a4fb0')}x.globalAlpha=1}
function pauseCard(x,L){if(!BX.paused)return;x.globalAlpha=.55;x.fillStyle='#120a1e';x.fillRect(0,0,L.w,L.h);x.globalAlpha=1;const bh=L.bsz,P=panel(x,Math.min(250,L.w-2*L.m),34+5*(bh+8),'#f2bb6c'),bw=P.w-28;let y=P.Y+10;
 CT(x,'PAUSE',P.cx,y,'#ffffff',2,'#1e1430');y+=24;pbtn(x,'resume',P.cx-bw/2,y,bw,'REPRENDRE','#2fa86a');y+=bh+8;pbtn(x,'mute',P.cx-bw/2,y,bw,BX.mute?'SON : COUPÉ':'SON : ACTIVÉ','#3f7bd9');y+=bh+8;
 pbtn(x,'preset',P.cx-bw/2,y,bw,'RECOMMENCER LE NIVEAU','#c0587a');y+=bh+8;pbtn(x,'levels',P.cx-bw/2,y,bw,'CHOIX DU NIVEAU','#6a4fb0');y+=bh+8;pbtn(x,'quit',P.cx-bw/2,y,bw,'RETOUR À LA BORNE','#8a3a5a')}
function title(x,L){const u=unlocked(),cols=L.w>L.h*1.25?10:L.w>=330?6:5,rows=Math.ceil(NL/cols),bh=L.bsz,availH=L.h-L.hud.h-2*L.m-bh-84,cw=Math.max(16,Math.min(Math.round(58/cpp()),Math.floor((L.w-2*L.m-20-(cols-1)*5)/cols),Math.floor(availH/rows)-5));L.tcols=cols;
 const gw=cols*cw+(cols-1)*5,h=34+rows*(cw+5)+30+bh+14,P=panel(x,gw+24,h,'#f2bb6c');let y=P.Y+10;
 CT(x,'CHOISIS UN NIVEAU',P.cx,y,'#ffffff',TW('CHOISIS UN NIVEAU',2)<=P.w-10?2:1,'#1e1430');y+=22;const x0=Math.round(P.cx-gw/2);
 for(let i=0;i<NL;i++){const X=x0+(i%cols)*(cw+5),Y=y+Math.floor(i/cols)*(cw+5),lock=i>=u,sel=i==BX.sel,t=tierOf(i),dn=isDone(i),b={id:'lvl',i,x:X,y:Y,w:cw,h:cw};
  x.fillStyle=lock?'rgba(255,255,255,.06)':sel?'#fff3d6':'rgba(255,255,255,.12)';rr(x,X,Y,cw,cw,Math.max(4,cw*.18));x.fill();
  x.fillStyle=lock?'rgba(255,255,255,.12)':t.c;x.fillRect(X+Math.round(cw*.2),Y+cw-Math.max(2,Math.round(cw*.08))-2,cw-2*Math.round(cw*.2),Math.max(2,Math.round(cw*.08)));
  if(sel&&!lock){x.strokeStyle=t.c;x.lineWidth=2;rr(x,X-2,Y-2,cw+4,cw+4,Math.max(5,cw*.2));x.stroke()}
  if(lock){const s=cw*.13,cx=X+cw/2,cy=Y+cw/2;x.fillStyle='rgba(255,255,255,.32)';x.fillRect(Math.round(cx-s*1.2),Math.round(cy-s*.2),Math.round(s*2.4),Math.round(s*1.8));x.strokeStyle='rgba(255,255,255,.32)';x.lineWidth=Math.max(1,s*.45);x.beginPath();x.arc(cx,cy-s*.2,s*.75,Math.PI,0);x.stroke()}
  else{CT(x,String(i+1),X+cw/2,Math.round(Y+cw/2-(cw>=34?8:5)),sel?'#2b1f3d':'#ffffff',cw>=34?2:1,sel?null:'#1e1430');if(dn){const s=Math.max(4,Math.round(cw*.2));x.fillStyle='#7be38a';x.beginPath();x.arc(X+cw-s*.7,Y+s*.7,s*.55,0,7);x.fill();x.strokeStyle='#1b5a2c';x.lineWidth=Math.max(1,s*.18);x.beginPath();x.moveTo(X+cw-s,Y+s*.7);x.lineTo(X+cw-s*.75,Y+s*.95);x.lineTo(X+cw-s*.4,Y+s*.45);x.stroke()}}
  BX.btns.push(b)}
 y+=rows*(cw+5)+4;const i=BX.sel,Lv=LEVELS[i],t=tierOf(i),d=data();CT(x,(i+1)+'. '+Lv.nom,P.cx,y,t.c);y+=11;
 const info=d.res&&d.res.l===i?'PARTIE EN COURS : '+d.res.h.length+' DÉPLACEMENTS':isDone(i)?'RÉUSSI · RECORD '+bestMoves(i)+' DÉPLACEMENTS':t.nom;CT(x,info,P.cx,y,'#c9b7e6');y+=15;
 const bw=Math.min(P.w-28,170);pbtn(x,'play',P.cx-bw/2,y,bw,d.res&&d.res.l===i?'REPRENDRE · NIVEAU '+(i+1):'JOUER · NIVEAU '+(i+1),'#2fa86a');
 CT(x,doneCount()+'/'+NL+' NIVEAUX RÉUSSIS',P.cx,y+bh+5,'#8f7fae')}
function msg(x,L){if(!BX.msg)return;const a=cl(Math.min(BX.msg.t*6,(2.2-BX.msg.t)*3),0,1),w=Math.min(L.w-2*L.m,TW(BX.msg.s)+20),X=Math.round(L.w/2-w/2),Y=L.h-L.m-24;x.globalAlpha=a;x.fillStyle='rgba(60,14,30,.94)';rr(x,X,Y,w,20,8);x.fill();CT(x,BX.msg.s,L.w/2,Y+7,'#ffffff');x.globalAlpha=1}
function transitionFx(x,L){if(!BX.tr)return;const t=BX.tr.t,c=t<.5?ease(t*2):1-ease((t-.5)*2),s=Math.max(12,Math.round(Math.min(L.w,L.h)/14)),cx=L.w/2,cy=L.h/2,maxd=Math.hypot(cx,cy)/s+1;
 x.fillStyle='#1a1028';for(let y=0;y<L.h;y+=s)for(let X=0;X<L.w;X+=s){const d=Math.hypot(X+s/2-cx,y+s/2-cy)/s/maxd,v=cl(c*2.2-d*1.2,0,1);if(v<=0)continue;const z=Math.ceil(s*v);x.fillRect(X+Math.floor((s-z)/2),y+Math.floor((s-z)/2),z,z)}}
function draw(x,w,h){if(w!==BX.W||h!==BX.H||!BX.L||(BX.G&&BX.L.gfor!==BX.G)){layout(w,h);BX.L.gfor=BX.G}const L=BX.L;BX.btns=[];x.imageSmoothingEnabled=false;
 background(x,L);if(BX.G&&BX.phase!='title')board(x,L);hud(x,L);
 if(BX.phase=='title')title(x,L);else{controls(x,L);introCard(x,L);stuckBanner(x,L);winCard(x,L);pauseCard(x,L)}
 msg(x,L);transitionFx(x,L)}
// ---------- toucher et souris (plusieurs doigts : un sur le pavé, un autre sur ANNULER…) ----------
function dpadDir(px,py){const D=BX.L&&BX.L.dpad;if(!D)return null;const dx=px-D.cx,dy=py-D.cy,r=Math.hypot(dx,dy);if(r<D.k*.25||r>D.k*1.9)return null;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
function pointer(type,px,py,id){const L=BX.L;if(!L)return;const T=BX.touch;
 if(type=='down'){if(T[id])delete T[id];if(BX.tr)return;
  for(let i=BX.btns.length-1;i>=0;i--){const b=BX.btns[i];if(!inB(b,px,py,3))continue;
   if(BX.paused&&!['resume','mute','preset','levels','quit','pause','back'].includes(b.id))continue;if(BX.phase=='won'&&!['next','replay','levels','back'].includes(b.id))continue;
   T[id]={btn:b};if(b.id=='undo'&&canPlay()){if(undo())BX.uhold={t0:BX.t,last:BX.t}}return}
  const dd=dpadDir(px,py);if(dd&&canPlay()){T[id]={dpad:1,d:dd};press(dd,'t'+id);return}
  if(BX.phase=='play'&&canPlay()&&BX.G){const cx=Math.floor((px-L.ox)/L.k),cy=Math.floor((py-L.oy)/L.k);if(cx>=0&&cy>=0&&cx<BX.G.w&&cy<BX.G.h)T[id]={grid:1,cx,cy,x:px,y:py}}return}
 const t=T[id];if(!t)return;
 if(type=='move'){if(t.dpad){const dd=dpadDir(px,py);if(dd&&dd!==t.d){t.d=dd;press(dd,'t'+id)}}else if(t.grid){const dx=px-t.x,dy=py-t.y,th=L.k*.9;
   // glisser le doigt sur la pièce : un pas dans la direction du geste
   if(Math.abs(dx)>th||Math.abs(dy)>th){const d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');press(d,'s'+id);release('s'+id);t.x=px;t.y=py;t.swiped=1}}return}
 if(type=='up'||type=='cancel'){delete T[id];if(t.dpad){release('t'+id);return}
  if(t.grid){if(!t.swiped)tapCell(t.cx,t.cy);return}
  if(t.btn){const b=t.btn;if(b.id=='undo'){BX.uhold=null;return}if(!inB(b,px,py,8))return;action(b)}}}
function action(b){const id=b.id;
 if(id=='back'){fx('bxSelect');exit();return}if(id=='pause'){togglePause();return}
 if(id=='reset'){restart();return}if(id=='resume'){togglePause();return}if(id=='mute'){toggleMute();return}if(id=='preset'){BX.paused=false;restart();return}
 if(id=='levels'){fx('bxSelect');toTitle();return}if(id=='quit'){fx('bxSelect');exit();return}
 if(id=='next'){if(BX.panelT>.3)nextLevel();return}if(id=='replay'){if(BX.panelT>.3){fx('bxSelect');transition(()=>loadLevel(BX.lvl,{quiet:1}))}return}
 if(id=='lvl'){if(b.i>=unlocked()){lockedMsg(b.i);return}if(b.i===BX.sel){startLevel(b.i);return}BX.sel=b.i;fx('bxTick');return}
 if(id=='play'){if(BX.sel<unlocked())startLevel(BX.sel)}}
// ---------- clavier : flèches ou ZQSD (WASD), U / Retour arrière = annuler, R = recommencer, P = pause, M = son, Entrée = valider ----------
const KD={ArrowUp:'up',KeyW:'up',KeyZ:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',KeyQ:'left',ArrowRight:'right',KeyD:'right'};
const OWN=new Set([...Object.keys(KD),'KeyU','Backspace','KeyR','KeyP','KeyM','Enter','Space','NumpadEnter']);
function active(){try{return ARC.on&&ARC.state=='game'&&ARC.cur&&ARC.cur.id=='boxes'&&BX.api}catch(e){return false}}
function onKey(e){if(!active()||!OWN.has(e.code))return;e.preventDefault();const c=e.code,d=KD[c];
 if(d){if(e.repeat)return;if(BX.paused)return;press(d,'k'+c);return}
 if(c=='KeyU'||c=='Backspace'){if(BX.paused)return;undo();return}
 if(e.repeat)return;
 if(c=='KeyR'){if(BX.phase=='won')action({id:'replay'});else restart();return}if(c=='KeyP'){togglePause();return}if(c=='KeyM'){toggleMute();return}ok()}
function onKeyUp(e){const d=KD[e.code];if(d)release('k'+e.code)}
function onBlur(){BX.hold=null;BX.uhold=null}
function onVis(){if(document.hidden&&active())saveResume()}
// ---------- module ----------
const Box={start(api){BX.api=api;BX.t=0;BX.L=null;BX.W=BX.H=0;BX.G=null;BX.spr={};BX.room=null;BX.look=look();BX.touch={};BX.btns=[];BX.parts=[];BX.rings=[];BX.tr=null;BX.msg=null;BX.paused=false;BX.won=false;
  try{BX.touchUI=(navigator.maxTouchPoints||0)>0||matchMedia('(pointer: coarse)').matches}catch(e){BX.touchUI=false}
  const d=data();BX.mute=!!d.mute;const u=unlocked();BX.sel=cl(d.res?d.res.l:d.last!=null?d.last:u-1,0,u-1);BX.phase='title';
  addEventListener('keydown',onKey);addEventListener('keyup',onKeyUp);addEventListener('blur',onBlur);document.addEventListener('visibilitychange',onVis);MUS=null;music()},
 update,draw,pointer,ownsKey:c=>OWN.has(c),
 resize(){BX.touch={};BX.hold=null;BX.uhold=null;BX.L=null},
 stop(){saveResume();removeEventListener('keydown',onKey);removeEventListener('keyup',onKeyUp);removeEventListener('blur',onBlur);document.removeEventListener('visibilitychange',onVis);
  try{if(typeof JEUSON!='undefined'){JEUSON.level(1);JEUSON.stop()}}catch(e){}MUS=null;BX.api=null;BX.phase='title';BX.G=null;BX.L=null;BX.spr={};BX.room=null;BX.parts=[];BX.rings=[];BX.touch={};BX.hold=null;BX.uhold=null;BX.q=[];BX.path=null;BX.tr=null;BX.paused=false},
 // accès pour les tests
 _s:BX,_levels:LEVELS,_parse:parse,_step:step,_undo:undo,_restart:restart,_load:loadLevel,_stuck:findStuck,_press:press,_release:release,_start:startLevel,_ok:ok,_action:action,_dpadDir:dpadDir};
ARC.register('boxes',Box);
})();
