// ===== MINI-JEU MAZE RUNNER (module de la borne d'arcade) =====
// Labyrinthe vue de dessus dans des ruines futuristes : 5 cristaux à ramasser, 3 ennemis (ou plus) à éviter, portail de sortie.
// S'enregistre auprès de la borne : ARC.register('maze', module). Plein écran, retour au catalogue, record et niveaux débloqués :
// gérés par la borne (api.exit, api.record, api.saveLevel, api.data → sauvegarde de Little Life).
// Commandes (celles de la borne) : joystick (tactile, flèches, ZQSD/WASD) = déplacements ; ENTER (Entrée, Espace, bouton vert) = valider ;
// EXIT (Échap, bouton rouge) = quitter vers le catalogue.
// Niveaux : tableau LEVELS. Un niveau est soit une grille dessinée à la main (comme le niveau 1, fourni tel quel),
// soit une recette de génération déterministe (graine fixe → même labyrinthe à chaque partie, toujours vérifié faisable).
(function(){
// ---------- niveaux ----------
const LEVELS=[
 {nom:'LES RUINES NÉON',par:75,grid:[
  '#########################',
  '#S#    A                #',
  '# ### ### # # ######### #',
  '#   A     A   #   #   # #',
  '####### ####### # # # # #',
  '# #     #       #   #C# #',
  '# # ##### ########### # #',
  '# #       #     #     # #',
  '# ####### # # # #C##### #',
  '#           # #   #   # #',
  '# # ######### # ### # # #',
  '# #         #         # #',
  '# # ##### # # # ##### #C#',
  '# #     # # #       # # #',
  '# ### # ### # # # # # # #',
  '#  C  #    C#      E    #',
  '#########################'],
  grace:4,en:{v:2.35,det:[5,5,4]},pal:{wall:'#1546c8',top:'#2f74ff',neon:'#7ff3ff',floor:'#0b0f1f',f2:'#10162b',f3:'#080b17'}},
 {nom:'LE LABYRINTHE OUBLIÉ',par:95,gen:{w:27,h:19,seed:20714,loops:.16,traps:0,enemies:3},en:{v:2.5,det:[5,6,5]},pal:{wall:'#1d3fae',top:'#3a6cf0',neon:'#8ae8ff',floor:'#0c0e1c',f2:'#111528',f3:'#090b16'}},
 {nom:'LES COULOIRS OBSCURS',par:110,gen:{w:29,h:19,seed:33019,loops:.15,traps:3,enemies:4},dark:4.6,en:{v:2.55,det:[5,5,5]},pal:{wall:'#16307f',top:'#2a55c8',neon:'#6fd0ff',floor:'#080a14',f2:'#0c0f1d',f3:'#05070e'}},
 {nom:'LE TEMPLE DES CRISTAUX',par:125,gen:{w:31,h:21,seed:44090,loops:.14,traps:5,enemies:4},en:{v:2.85,det:[6,7,6]},pal:{wall:'#2a2f9e',top:'#5056f0',neon:'#ffe68a',floor:'#0e0c1c',f2:'#141129',f3:'#0a0814'}},
 {nom:'LE LABYRINTHE INFERNAL',par:140,gen:{w:33,h:23,seed:55017,loops:.14,traps:7,enemies:5},en:{v:2.8,det:[6,6,6]},pal:{wall:'#8a1630',top:'#d22b4e',neon:'#ffb070',floor:'#140810',f2:'#1c0b16',f3:'#0e050b'}}];
const NL=LEVELS.length,DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},OPP={up:'down',down:'up',left:'right',right:'left'},DK=Object.keys(DIRS);
const PV=5.2,CRYS_PTS=100,LVL_BONUS=500,TIME_PTS=10,MAXL=5;
// ---------- outils ----------
const fx=(n,k,g)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
function D(x,cx,cy,r,c){x.fillStyle=c;const Rr=Math.ceil(r);for(let j=-Rr;j<=Rr;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||Math.abs(j)<r)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
const T_=(x,s,X,Y,c,sc,ol)=>{try{axText(x,s,X,Y,c,sc||1,ol)}catch(e){}},CT=(x,s,cx,Y,c,sc,ol)=>{try{axCText(x,s,cx,Y,c,sc||1,ol)}catch(e){}},TW=(s,sc)=>{try{return axTW(s,sc||1)}catch(e){return String(s).length*6}};
const pad=(n,k)=>String(Math.max(0,Math.floor(n))).padStart(k,'0'),mmss=t=>pad(t/60,2)+':'+pad(t%60,2);
function rng(seed){let s=seed|0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function bfs(G,sx,sy){const W=G[0].length,H=G.length,d=new Int16Array(W*H).fill(-1),q=[sx+sy*W];d[q[0]]=0;for(let i=0;i<q.length;i++){const p=q[i],x=p%W,y=(p/W)|0;
 for(const k of DK){const nx=x+DIRS[k][0],ny=y+DIRS[k][1];if(nx<0||ny<0||nx>=W||ny>=H||G[ny][nx]=='#')continue;const n=nx+ny*W;if(d[n]<0){d[n]=d[p]+1;q.push(n)}}}return d}
// ---------- générateur de labyrinthes (toujours faisables : un seul bloc connexe, objets placés sur des cases atteignables) ----------
function generate(o){const r=rng(o.seed),W=o.w|1,H=o.h|1,G=[...Array(H)].map(()=>Array(W).fill('#'));
 const st=[[1,1]];G[1][1]=' ';while(st.length){const[x,y]=st[st.length-1],n=DK.map(k=>[x+DIRS[k][0]*2,y+DIRS[k][1]*2]).filter(([a,b])=>a>0&&b>0&&a<W-1&&b<H-1&&G[b][a]=='#');
  if(!n.length){st.pop();continue}const[a,b]=n[Math.floor(r()*n.length)];G[(y+b)/2][(x+a)/2]=' ';G[b][a]=' ';st.push([a,b])}
 // boucles : plusieurs chemins possibles, pour pouvoir contourner un ennemi
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(G[y][x]=='#'&&r()<o.loops){const h=G[y][x-1]!='#'&&G[y][x+1]!='#'&&G[y-1][x]=='#'&&G[y+1][x]=='#',v=G[y-1][x]!='#'&&G[y+1][x]!='#'&&G[y][x-1]=='#'&&G[y][x+1]=='#';if(h||v)G[y][x]=' '}
 const S=bfs(G.map(r=>r.join('')),1,1),fl=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(G[y][x]!='#')fl.push({x,y,d:S[x+y*W],n:DK.filter(k=>G[y+DIRS[k][1]][x+DIRS[k][0]]!='#').length});
 const used=new Set(['1,1']),key=p=>p.x+','+p.y,far=(c,pool,min)=>{let b=null,bs=-1;for(const p of pool){if(used.has(key(p)))continue;let m=p.d;for(const q of c)m=Math.min(m,Math.abs(p.x-q.x)+Math.abs(p.y-q.y));if(p.d>=min&&m>bs){bs=m;b=p}}return b};
 const ex=fl.reduce((a,b)=>b.d>a.d?b:a);used.add(key(ex));G[ex.y][ex.x]='E';
 const dead=fl.filter(p=>p.n==1),cr=[ex];for(let i=0;i<5;i++){const p=far(cr,dead.length>=5?dead:fl,6)||far(cr,fl,3);used.add(key(p));cr.push(p);G[p.y][p.x]='C'}
 const en=[{x:1,y:1,d:0},{x:ex.x,y:ex.y,d:0}];for(let i=0;i<o.enemies;i++){const p=far(en,fl.filter(p=>p.n>=2),9)||far(en,fl,6);used.add(key(p));en.push(p);G[p.y][p.x]='A'}
 const tr=[{x:1,y:1,d:0},...cr.slice(1)];for(let i=0;i<o.traps;i++){const p=far(tr,fl.filter(p=>p.n==2&&p.d>=5&&((G[p.y][p.x-1]!='#'&&G[p.y][p.x+1]!='#')||(G[p.y-1][p.x]!='#'&&G[p.y+1][p.x]!='#'))),5);if(!p)break;used.add(key(p));tr.push(p);G[p.y][p.x]='T'}
 G[1][1]='S';return G.map(r=>r.join(''))}
function parse(L){const g=L.grid||(L.grid=generate(L.gen)),H=g.length,W=g[0].length,o={W,H,walls:[],crys:[],ens:[],traps:[],S:null,E:null};
 o.walls=g.map(r=>[...r].map(c=>c=='#'));g.forEach((r,y)=>[...r].forEach((c,x)=>{if(c=='S')o.S={x,y};else if(c=='E')o.E={x,y};else if(c=='C')o.crys.push({x,y,got:false,ph:Math.random()*6});else if(c=='A')o.ens.push({x,y});else if(c=='T')o.traps.push({x,y,ph:(x*7+y*13)%10/10*3})}));
 o.free=g.map(r=>r.replace(/[^#]/g,' '));return o}
// ---------- état ----------
const MZ={api:null,phase:'title',lv:0,sel:0,W:0,H:0,L:null,t:0,okN:null,touch:{joy:null,dir:null,btn:null},parts:[],pops:[],shake:0};
const open=(x,y)=>{const M=MZ.map;return x>=0&&y>=0&&x<M.W&&y<M.H&&!M.walls[y][x]};
function music(){try{if(typeof JEUSON=='undefined')return;JEUSON.music('maze');JEUSON.level(1);JEUSON.sfxLevel(1)}catch(e){}}
// ---------- partie / niveau ----------
function newRun(lv){MZ.score=0;MZ.lives=3;startLevel(lv)}
function startLevel(lv){MZ.lv=lv;MZ.camX=null;MZ.mmc=null;const L=LEVELS[lv];MZ.map=parse(L);MZ.cache=null;MZ.time=0;MZ.got=0;MZ.portal=0;MZ.portalT=0;MZ.parts=[];MZ.pops=[];MZ.hitT=0;MZ.inv=0;MZ.lvlStart=MZ.score;
 const S=MZ.map.S;MZ.p={x:S.x,y:S.y,dir:null,face:'down',moving:false,anim:0,idle:0,bump:null,bumpT:0,want:null,wantT:0,stepN:0};
 MZ.ens=MZ.map.ens.map((a,i)=>mkEnemy(a,i,L));MZ.DS=bfs(MZ.map.free,S.x,S.y);
 // zones refuges : la case de départ et le portail (et leurs voisines) sont interdites aux gardiens → jamais d'embuscade à la réapparition ni devant la sortie
 {const DE=bfs(MZ.map.free,MZ.map.E.x,MZ.map.E.y),W=MZ.map.W;MZ.safe=new Set();for(let i=0;i<MZ.DS.length;i++)if((MZ.DS[i]>=0&&MZ.DS[i]<=1)||(DE[i]>=0&&DE[i]<=1))MZ.safe.add(i)}MZ.grace=L.grace||2.2;MZ.field=null;MZ.fieldKey='';MZ.phase='intro';MZ.introT=1.8;MZ.hud=null;fx('mzStart',1,.02);music()}
const TYPES=[{id:'chasseur',col:'#ff3b4a',dk:'#a3121f',glow:'#ff6b6b',sp:1,ch:1.12,straight:0},{id:'ruse',col:'#a64dff',dk:'#5a1ea8',glow:'#c890ff',sp:.95,ch:1.08,straight:.3,ambush:3},{id:'spectre',col:'#e04dff',dk:'#7a1a8f',glow:'#ff8cf0',sp:.86,ch:1.15,straight:.6,sight:11}];
function mkEnemy(a,i,L){const ty=TYPES[i%3];return{x:a.x,y:a.y,hx:a.x,hy:a.y,dir:null,ty,det:(L.en.det[i%3]||6)+Math.floor(i/3),v:L.en.v*ty.sp*(1+.04*Math.floor(i/3)),mode:'patrol',lost:0,visits:new Map(),anim:Math.random()*4,alert:0,stuck:0,last:''}}
// champ de distances depuis le joueur (chemin réel dans le labyrinthe), recalculé quand il change de case
function field(){const p=MZ.p,tx=Math.round(p.x),ty=Math.round(p.y),k=tx+','+ty;if(k!==MZ.fieldKey){MZ.fieldKey=k;MZ.field=bfs(MZ.map.free,tx,ty)}return MZ.field}
const fd=(F,x,y)=>F[x+y*MZ.map.W];
// ---------- déplacement en grille, fluide : de centre de case en centre de case, virages mémorisés, jamais bloqué dans un angle ----------
function moveActor(a,v,dt,choose){let step=v*dt,guard=0;while(step>1e-6&&guard++<6){const cx=Math.round(a.x),cy=Math.round(a.y),at=Math.abs(a.x-cx)<1e-4&&Math.abs(a.y-cy)<1e-4;
  if(at){a.x=cx;a.y=cy;const d=choose(cx,cy);if(!d){a.moving=false;return step}a.dir=d;a.moving=true}
  if(!a.dir){a.moving=false;return step}const[dx,dy]=DIRS[a.dir];const tx=dx?(dx>0?Math.floor(a.x+1e-4)+1:Math.ceil(a.x-1e-4)-1):a.x,ty=dy?(dy>0?Math.floor(a.y+1e-4)+1:Math.ceil(a.y-1e-4)-1):a.y;
  if(!open(Math.round(tx),Math.round(ty))&&at){a.moving=false;return step}const dist=Math.abs(tx-a.x)+Math.abs(ty-a.y),m=Math.min(step,dist);a.x+=dx*m;a.y+=dy*m;step-=m;if(m>=dist-1e-6){a.x=Math.round(a.x);a.y=Math.round(a.y);a.arrived&&a.arrived()}}return 0}
function heldDir(inp){const t=MZ.touch.dir;if(t)return t;for(const k of DK)if(inp[k])return k;return null}
function updPlayer(dt,inp,q){const p=MZ.p;const h=heldDir(inp);
 // direction maintenue (joystick, flèches) : on avance tant qu'elle est tenue et on s'arrête net au centre de la case suivante au relâchement ;
 // simple appui bref (événement sans maintien) : mémorisé un court instant pour prendre le prochain virage
 if(h){p.want=h;p.wantT=0}else if(q.length){p.want=q[q.length-1];p.wantT=.22}else if(p.wantT>0)p.wantT-=dt;else p.want=null;
 // demi-tour immédiat, même entre deux cases
 if(p.want&&p.dir&&p.want==OPP[p.dir]&&p.moving){p.dir=p.want;p.face=p.want}
 const before={x:p.x,y:p.y};
 moveActor(p,PV,dt,(cx,cy)=>{let d=null;if(p.want&&open(cx+DIRS[p.want][0],cy+DIRS[p.want][1]))d=p.want;else if(p.want&&p.dir&&open(cx+DIRS[p.dir][0],cy+DIRS[p.dir][1]))d=p.dir;
  // touche vers un mur, à l'arrêt : petit choc contre la paroi
  if(!d&&p.want&&!open(cx+DIRS[p.want][0],cy+DIRS[p.want][1])&&(p.bumpT<=0)){p.bump=p.want;p.bumpT=.22;p.face=p.want;fx('mzBump',1,.02);dust(cx+DIRS[p.want][0]*.45,cy+DIRS[p.want][1]*.45)}
  if(d)p.face=d;if(!d)p.dir=null;return d});
 const moved=Math.abs(p.x-before.x)+Math.abs(p.y-before.y);if(moved>0){p.anim+=moved*4.2;p.idle=0;const n=Math.floor(p.anim/2.1);if(n!==p.stepN){p.stepN=n;fx('mzStep',1,.01)}}else p.idle+=dt;
 if(p.bumpT>0)p.bumpT-=dt}
function updEnemy(e,dt){const F=field(),p=MZ.p,ex=Math.round(e.x),ey=Math.round(e.y),dist=fd(F,ex,ey);
 // détection : distance de chemin (et, pour le spectre, ligne de vue dans un couloir droit)
 const calm=MZ.time<MZ.grace||MZ.safe.has(Math.round(p.x)+Math.round(p.y)*MZ.map.W);let sees=!calm&&dist>=0&&dist<=e.det;if(!sees&&!calm&&e.ty.sight)sees=los(ex,ey,Math.round(p.x),Math.round(p.y),e.ty.sight);
 if(sees){if(e.mode!='chase'){e.mode='chase';e.alert=1;fx('mzAlert',1,.015)}e.lost=0}else if(e.mode=='chase'){e.lost+=dt;if(e.lost>1.6||dist>e.det+5){e.mode='patrol';e.visits.clear()}}
 if(e.alert>0)e.alert-=dt*1.2;e.anim+=dt*(e.mode=='chase'?8:5);
 const v=e.v*(e.mode=='chase'?e.ty.ch:1),bx=e.x,by=e.y;
 moveActor(e,v,dt,(cx,cy)=>{const opts=DK.filter(k=>open(cx+DIRS[k][0],cy+DIRS[k][1])&&!MZ.safe.has(cx+DIRS[k][0]+(cy+DIRS[k][1])*MZ.map.W));if(!opts.length)return null;const k0=cx+','+cy;e.visits.set(k0,(e.visits.get(k0)||0)+1);
  if(e.mode=='chase'){let G=F;
   // le rusé vise quelques cases devant le joueur pour lui couper la route (sauf tout près)
   if(e.ty.ambush&&dist>3&&p.face){let ax=Math.round(p.x),ay=Math.round(p.y);for(let i=0;i<e.ty.ambush;i++){const nx=ax+DIRS[p.face][0],ny=ay+DIRS[p.face][1];if(!open(nx,ny))break;ax=nx;ay=ny}if(e.ambK!==ax+','+ay){e.ambK=ax+','+ay;e.ambF=bfs(MZ.map.free,ax,ay)}G=e.ambF}
   let best=null,bv=1e9;for(const k of opts){const vv=fd(G,cx+DIRS[k][0],cy+DIRS[k][1])+(k==OPP[e.dir]?.4:0)+Math.random()*.1;if(vv>=0&&vv<bv){bv=vv;best=k}}return best||opts[0]}
  // patrouille : jamais de demi-tour sauf cul-de-sac ; on préfère les couloirs peu visités → pas de boucle infinie
  const c=opts.length>1?opts.filter(k=>k!==OPP[e.dir]):opts;let best=null,bv=1e9;if(calm){for(const k of opts){const vv=-fd(MZ.DS,cx+DIRS[k][0],cy+DIRS[k][1])+Math.random()*.5;if(vv<bv){bv=vv;best=k}}return best}for(const k of c){const nk=(cx+DIRS[k][0])+','+(cy+DIRS[k][1]);const vv=(e.visits.get(nk)||0)*1.2+Math.random()*1.4-(k==e.dir?e.ty.straight:0);if(vv<bv){bv=vv;best=k}}return best});
 if(Math.abs(e.x-bx)+Math.abs(e.y-by)<1e-5){e.stuck+=dt;if(e.stuck>.6){e.dir=null;e.x=Math.round(e.x);e.y=Math.round(e.y);e.stuck=0}}else e.stuck=0}
function los(x0,y0,x1,y1,max){if(x0!=x1&&y0!=y1)return false;const n=Math.abs(x1-x0)+Math.abs(y1-y0);if(n>max)return false;const dx=Math.sign(x1-x0),dy=Math.sign(y1-y0);for(let i=1;i<n;i++)if(!open(x0+dx*i,y0+dy*i))return false;return true}
// ---------- règles ----------
function hit(why){if(MZ.inv>0||MZ.phase!='play')return;MZ.lives--;MZ.phase='hit';MZ.hitT=1.35;MZ.shake=.45;fx('mzHit',1,.03);const p=MZ.p;for(let i=0;i<26;i++){const a=Math.random()*6.28,s=1.5+Math.random()*3.5;MZ.parts.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.8+Math.random()*.5,c:i%3?'#ff4d6a':'#ffffff',z:1})}
 pop(p.x,p.y-.6,why=='piege'?'AÏE ! PIÈGE':'TOUCHÉ !','#ff6b7d')}
function afterHit(){if(MZ.lives<=0){gameOver();return}const S=MZ.map.S,p=MZ.p;Object.assign(p,{x:S.x,y:S.y,dir:null,moving:false,face:'down',want:null,wantT:0});
 // les ennemis repartent de leur poste : pas d'embuscade au point de départ
 MZ.ens.forEach(e=>{e.x=e.hx;e.y=e.hy;e.dir=null;e.mode='patrol';e.visits.clear()});MZ.inv=2;MZ.grace=MZ.time+(LEVELS[MZ.lv].grace||2.2);MZ.phase='play';fx('mzRespawn',1,.02)}
function collect(c){c.got=true;MZ.got++;MZ.score+=CRYS_PTS;MZ.hud={k:'c',t:.5};fx('mzCrystal',1,.03);pop(c.x,c.y-.5,'+'+CRYS_PTS,'#ffe14f');
 for(let i=0;i<16;i++){const a=i/16*6.28;MZ.parts.push({x:c.x,y:c.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,l:.6,c:i%2?'#fff6a8':'#ffd23a',z:1})}
 if(MZ.got>=MZ.map.crys.length){MZ.portal=1;MZ.portalT=1.6;MZ.flash=.5;setTimeout(()=>fx('mzPortal',1,.03),250);pop(MZ.map.E.x,MZ.map.E.y-.8,'PORTAIL ACTIVÉ !','#7dff9a')}}
function levelDone(){MZ.phase='done';MZ.doneT=0;const L=LEVELS[MZ.lv],tb=Math.max(0,Math.round((L.par-MZ.time)*TIME_PTS)),lb=LVL_BONUS*(MZ.lv+1),gain=MZ.lives<MAXL;
 MZ.tally={crys:MZ.got*CRYS_PTS,time:tb,lvl:lb,base:MZ.score,life:gain};MZ.score+=tb+lb;if(gain)MZ.lives++;
 const d=MZ.api.data();d.times=d.times||{};const k='L'+(MZ.lv+1);if(!d.times[k]||MZ.time<d.times[k])d.times[k]=Math.round(MZ.time*10)/10;MZ.tally.bestT=d.times[k];
 if(MZ.lv+1<NL)MZ.api.saveLevel(MZ.lv+2);MZ.rec=MZ.api.record(MZ.score);try{MZ.api.save()}catch(e){}fx(MZ.lv+1<NL?'mzLevel':'mzWin',1,.03)}
function gameOver(){MZ.phase='over';MZ.overT=0;MZ.rec=MZ.api.record(MZ.score);try{MZ.api.save()}catch(e){}fx('mzOver',1,.03);try{JEUSON.stop()}catch(e){}}
function pop(x,y,s,c){MZ.pops.push({x,y,s,c,l:1.1})}
function dust(x,y){for(let i=0;i<5;i++)MZ.parts.push({x,y,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,l:.3,c:'#9fb4ff',z:0})}
function unlocked(){const d=MZ.api.data();return Math.max(1,Math.min(NL,d.level||1))}
function ok(){const ph=MZ.phase;if(ph=='title'){fx('mzSelect',1,.02);newRun(MZ.sel)}else if(ph=='intro')MZ.introT=0;
 else if(ph=='done'&&MZ.doneT>.6){if(MZ.lv+1<NL)startLevel(MZ.lv+1);else{MZ.phase='win';MZ.winT=0;fx('mzWin',1,.03)}}
 else if(ph=='over'&&MZ.overT>.6){fx('mzSelect',1,.02);newRun(MZ.lv)}else if(ph=='win'&&MZ.winT>.8){MZ.phase='title';MZ.sel=0;music()}}
function nav(d){if(MZ.phase!='title')return;const n=unlocked();if(d=='left'||d=='up')MZ.sel=(MZ.sel+n-1)%n;else if(d=='right'||d=='down')MZ.sel=(MZ.sel+1)%n;fx('mzTick',1,.015)}
function exit(){try{if(MZ.score>0&&(MZ.phase=='play'||MZ.phase=='hit'||MZ.phase=='intro'))MZ.api.record(MZ.score)}catch(e){}const a=MZ.api;if(a)a.exit()}
// ---------- mise à jour ----------
function update(dt,inp){dt=Math.min(dt,.05);inp=inp||{};MZ.t+=dt;const n=inp.okN||0,okP=MZ.okN!=null&&n>MZ.okN;MZ.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 if(okP)ok();if(MZ.phase=='title'){for(const d of q)nav(d);if(MZ.touch.dir&&MZ.touch.dir!==MZ.touch.navd){MZ.touch.navd=MZ.touch.dir;nav(MZ.touch.dir)}if(!MZ.touch.dir)MZ.touch.navd=null}
 if(MZ.shake>0)MZ.shake-=dt;if(MZ.flash>0)MZ.flash-=dt;if(MZ.hud&&(MZ.hud.t-=dt)<=0)MZ.hud=null;
 MZ.parts=MZ.parts.filter(o=>(o.l-=dt)>0);MZ.parts.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=.9;o.vy*=.9});MZ.pops=MZ.pops.filter(o=>(o.l-=dt)>0);MZ.pops.forEach(o=>o.y-=dt*.9);
 if(MZ.map)MZ.map.crys.forEach(c=>c.ph+=dt);
 if(MZ.phase=='intro'){MZ.introT-=dt;if(MZ.introT<=0)MZ.phase='play';return}
 if(MZ.phase=='hit'){MZ.hitT-=dt;if(MZ.hitT<=0)afterHit();return}
 if(MZ.phase=='done'){MZ.doneT+=dt;return}if(MZ.phase=='over'){MZ.overT+=dt;return}if(MZ.phase=='win'){MZ.winT+=dt;return}
 if(MZ.phase!='play')return;
 MZ.time+=dt;if(MZ.inv>0)MZ.inv-=dt;if(MZ.portalT>0)MZ.portalT-=dt;
 updPlayer(dt,inp,q);const p=MZ.p;
 for(const c of MZ.map.crys)if(!c.got&&Math.abs(c.x-p.x)+Math.abs(c.y-p.y)<.55)collect(c);
 if(MZ.portal&&Math.abs(MZ.map.E.x-p.x)+Math.abs(MZ.map.E.y-p.y)<.4){levelDone();return}
 for(const e of MZ.ens){updEnemy(e,dt);if(Math.hypot(e.x-p.x,e.y-p.y)<.62){hit('ennemi');return}}
 for(const tr of MZ.map.traps)if(trapOn(tr)>0&&Math.abs(tr.x-p.x)+Math.abs(tr.y-p.y)<.4){hit('piege');return}}
// piège : 0 = rentré, 0..1 = sur le point de sortir (clignote), 1 = pics sortis
function trapOn(tr){const c=(MZ.time+tr.ph)%3;return c<1.1?1:c>2.6?0-(c-2.6)/.4:0}
// ---------- mise en page (recalculée à chaque taille : portrait, paysage, rotation) ----------
function layout(w,h){const land=w>h*1.15,M=MZ.map;const L={w,h,land};const hud=land?14:16;L.hud={x:0,y:0,w,h:hud};
 if(land){const cw=Math.round(Math.max(76,Math.min(150,w*.2)));L.area={x:cw,y:hud+2,w:w-cw*2,h:h-hud-4};L.joy={x:Math.round(cw/2),y:Math.round(h*.62),r:Math.round(Math.min(cw*.36,h*.18))};
  const br=Math.round(Math.min(cw*.2,h*.085));L.bOk={x:w-Math.round(cw/2),y:Math.round(h*.5),r:br+3,lab:'ENTER',c:'#2fd36a',d:'#167a3a'};L.bEx={x:w-Math.round(cw/2),y:Math.round(h*.77),r:br,lab:'EXIT',c:'#ff4d5e',d:'#9a1726'}}
 else{const dh=Math.round(Math.max(104,Math.min(176,h*.27)));L.area={x:2,y:hud+2,w:w-4,h:h-hud-dh-6};L.deck={y:h-dh,h:dh};L.joy={x:Math.round(w*.27),y:Math.round(h-dh*.5),r:Math.round(Math.min(dh*.32,w*.15))};
  const br=Math.round(Math.min(dh*.14,w*.07));L.bOk={x:Math.round(w*.73),y:Math.round(h-dh*.62),r:br+3,lab:'ENTER',c:'#2fd36a',d:'#167a3a'};L.bEx={x:Math.round(w*.86),y:Math.round(h-dh*.3),r:br,lab:'EXIT',c:'#ff4d5e',d:'#9a1726'}}
 if(M){const A=L.area;let T=Math.floor(Math.min(A.w/M.W,A.h/M.H));L.V={x:A.x,y:A.y,w:A.w,h:A.h};L.mm=null;
  // portrait : le labyrinthe entier tiendrait en tout petit → vue rapprochée (×1,5 environ) qui suit le coureur + carte complète dessous
  if(!land&&T<15){const T2=Math.min(Math.floor(T*1.5),Math.floor((A.h-70)/M.H));if(T2>T){T=T2;const vh=M.H*T;L.V={x:A.x,y:A.y,w:A.w,h:vh};const rest=A.h-vh-6,ms=Math.floor(Math.min((A.w-8)/M.W,(rest-14)/M.H));
    if(ms>=3)L.mm={s:ms,w:M.W*ms,h:M.H*ms,x:Math.round(A.x+(A.w-M.W*ms)/2),y:Math.round(A.y+vh+6+Math.max(10,(rest-M.H*ms)/2))}}}
  if(T<8)T=8;L.T=T;L.mw=M.W*T;L.mh=M.H*T;const V=L.V;L.cam=L.mw>V.w||L.mh>V.h;L.ox=V.x+Math.max(0,Math.floor((V.w-L.mw)/2));L.oy=V.y+Math.max(0,Math.floor((V.h-L.mh)/2))}
 MZ.L=L;MZ.W=w;MZ.H=h;MZ.cache=null}
// ---------- rendu ----------
function bake(L){const M=MZ.map,P=LEVELS[MZ.lv].pal,T=L.T,c=document.createElement('canvas');c.width=M.W*T;c.height=M.H*T;const x=c.getContext('2d'),r=rng(MZ.lv*977+13);
 for(let y=0;y<M.H;y++)for(let X=0;X<M.W;X++){const px=X*T,py=y*T;if(!M.walls[y][X]){R(x,px,py,T,T,(X+y)%2?P.floor:P.f2);
   // sol de ruines : dalles fissurées, poussière lumineuse
   R(x,px,py,T,1,P.f3);R(x,px,py,1,T,P.f3);for(let i=0;i<2;i++)if(r()<.5)R(x,px+1+Math.floor(r()*(T-2)),py+1+Math.floor(r()*(T-2)),1,1,r()<.3?'#26305a':P.f3);if(r()<.08)R(x,px+2,py+Math.floor(T/2),T-4,1,P.f3);
   // ombre portée des murs au nord et à l'ouest
   if(M.walls[y-1]&&M.walls[y-1][X]){x.globalAlpha=.45;R(x,px,py,T,Math.max(1,Math.round(T*.18)),'#000');x.globalAlpha=1}
   if(M.walls[y][X-1]){x.globalAlpha=.3;R(x,px,py,Math.max(1,Math.round(T*.12)),T,'#000');x.globalAlpha=1}}
  else{R(x,px,py,T,T,P.wall);const k=Math.max(1,Math.round(T*.22));R(x,px,py,T,T-k,P.top);
   // circuits gravés dans le bloc
   if(T>=10&&r()<.35){x.globalAlpha=.35;R(x,px+2,py+3,T-4,1,P.neon);R(x,px+T-3,py+3,1,Math.max(1,T-k-5),P.neon);x.globalAlpha=1}
   x.globalAlpha=.25;R(x,px,py,T,1,'#ffffff');x.globalAlpha=1}}
 // contours lumineux : uniquement là où un mur touche un couloir
 const g=document.createElement('canvas');g.width=c.width;g.height=c.height;const gx=g.getContext('2d');
 for(let y=0;y<M.H;y++)for(let X=0;X<M.W;X++){if(!M.walls[y][X])continue;const px=X*T,py=y*T,f=(a,b)=>b>=0&&a>=0&&b<M.H&&a<M.W&&!M.walls[b][a];
  if(f(X,y+1))R(gx,px,py+T-1,T,1,P.neon);if(f(X,y-1))R(gx,px,py,T,1,P.neon);if(f(X-1,y))R(gx,px,py,1,T,P.neon);if(f(X+1,y))R(gx,px+T-1,py,1,T,P.neon)}
 x.drawImage(g,0,0);MZ.cache={c,g,T,lv:MZ.lv,key:L.T+'x'+MZ.lv}}
function drawCrystal(x,cx,cy,T,ph,dim){const b=Math.round(Math.sin(ph*3)*T*.08),s=Math.max(2,Math.round(T*.3));
 x.globalAlpha=.18+.1*Math.sin(ph*4);D(x,cx,cy+b,s*1.7,'#ffd23a');x.globalAlpha=1;
 for(let j=-s;j<=s;j++){const w=s-Math.abs(j);R(x,cx-w,cy+b+j,w*2+1,1,j<0?'#fff3a0':'#ffc21a')}R(x,cx-1,cy+b-s+1,1,Math.max(1,s-1),'#ffffff');
 if(Math.sin(ph*2.3)>.85){R(x,cx+s-1,cy+b-s,1,3,'#fff');R(x,cx+s-2,cy+b-s+1,3,1,'#fff')}}
function drawPortal(x,cx,cy,T){const on=MZ.portal,t=MZ.t,r=Math.max(3,Math.round(T*.44));
 if(!on){D(x,cx,cy,r,'#0f2a18');D(x,cx,cy,r-1,'#123620');D(x,cx,cy,Math.max(1,r-3),'#0a1a10');x.globalAlpha=.5;for(let i=0;i<4;i++){const a=t*.6+i*1.57;R(x,cx+Math.cos(a)*(r-1),cy+Math.sin(a)*(r-1),1,1,'#3d8a52')}x.globalAlpha=1;return}
 x.globalAlpha=.25+.12*Math.sin(t*5);D(x,cx,cy,r*2.1,'#3dff7a');x.globalAlpha=1;D(x,cx,cy,r+1,'#1a7a3a');D(x,cx,cy,r,'#3dff7a');D(x,cx,cy,r-1,'#0c3a1c');
 for(let k=0;k<3;k++){const rr=(r-1)*(1-((t*.9+k/3)%1));x.globalAlpha=.9;for(let i=0;i<10;i++){const a=t*3+i*.628+k;R(x,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,1,1,k%2?'#bfffd0':'#5dff8e')}}x.globalAlpha=1;D(x,cx,cy,Math.max(1,r*.25),'#eafff0');
 if(MZ.portalT>0){const k=1-MZ.portalT/1.6;x.globalAlpha=Math.max(0,1-k);for(let i=0;i<24;i++){const a=i/24*6.28;R(x,cx+Math.cos(a)*r*(1+k*4),cy+Math.sin(a)*r*(1+k*4),2,2,'#9dffb5')}x.globalAlpha=1}}
function drawTrap(x,cx,cy,T,tr){const s=trapOn(tr),k=Math.max(1,Math.round(T/8)),off=[-.28,0,.28];
 R(x,cx-T*.42,cy-T*.42,T*.84,T*.84,'#1a1a26');R(x,cx-T*.42,cy-T*.42,T*.84,1,'#2c2c3c');
 for(const a of off)for(const b of off){const px=cx+a*T,py=cy+b*T;if(s>=1){R(x,px-k,py,k*2+1,k,'#b8bfd0');R(x,px,py-k*2,1,k*2,'#ffffff');R(x,px-k,py+k,k*2+1,1,'#ff5a3a')}else R(x,px,py,k,k,s<0&&Math.floor(MZ.t*10)%2?'#ff7a3a':'#3a3a4c')}}
// personnage : vue de dessus légèrement inclinée, 4 directions, marche (4 phases), attente (respiration, clignement), choc, touché
function drawRunner(x,cx,cy,T){const p=MZ.p,k=Math.max(1,T/11.5),u=(a,b,w,h,c)=>R(x,cx+(a-5)*k,cy+(b-7)*k,w*k,h*k,c);
 let dir=p.face||'down';if(MZ.phase=='hit')dir=['down','left','up','right'][Math.floor(MZ.t*14)%4];
 const walk=p.moving&&MZ.phase=='play',fr=walk?Math.floor(p.anim*1.6)%4:0,leg=fr==1?1:fr==3?-1:0,bob=walk?(fr%2?-1:0):(p.idle>.5&&Math.floor(MZ.t*1.6)%2?-1:0),blink=!walk&&Math.floor(MZ.t*10)%31==0;
 const O='#0a0b16',CAP='#2ee6ff',CAPD='#1388b8',SK='#ffcf9e',BO='#ff8a1f',BOD='#c4570e',PA='#3b3f78',SH='#f2f2f2',EY='#121422';
 if(MZ.inv>0&&Math.floor(MZ.t*12)%2)x.globalAlpha=.45;
 x.globalAlpha*=.4;u(2,13,6,1,'#000');x.globalAlpha=MZ.inv>0&&Math.floor(MZ.t*12)%2?.45:1;
 const by=bob;
 if(dir=='down'||dir=='up'){// jambes
  u(3,10+(leg>0?-1:0),2,2,PA);u(5,10+(leg<0?-1:0),2,2,PA);u(3,12+(leg>0?-1:0),2,1,SH);u(5,12+(leg<0?-1:0),2,1,SH);
  // corps + bras qui balancent
  u(2,6+by,6,4,O);u(3,6+by,4,4,BO);u(3,9+by,4,1,BOD);u(2,7+by+(leg>0?1:0),1,2,SK);u(7,7+by+(leg<0?1:0),1,2,SK);
  if(dir=='up'){u(4,7+by,2,2,'#5a6a9a')}
  // tête
  u(2,1+by,6,5,O);u(3,2+by,4,4,SK);
  if(dir=='down'){u(2,1+by,6,2,CAP);u(3,0+by,4,1,CAP);u(2,3+by,6,1,CAPD);if(!blink){u(3,4+by,1,1,EY);u(6,4+by,1,1,EY)}else{u(3,4+by,1,1,'#c99a72');u(6,4+by,1,1,'#c99a72')}}
  else{u(2,1+by,6,4,CAP);u(3,0+by,4,1,CAP);u(3,4+by,4,1,CAPD)}}
 else{const s=dir=='right'?1:-1,f=a=>s>0?a:9-a-1;
  u(f(4),10+(leg>0?-1:0),2,2,PA);u(f(4)+(leg?s:0),11,2,1,PA);u(f(4)+(leg>0?s:0),12,2,1,SH);u(f(4)-(leg<0?s:0),12,2,1,SH);
  u(3,6+by,5,4,O);u(4,6+by,3,4,BO);u(4,9+by,3,1,BOD);u(f(5)+(leg>0?s:0),7+by,1,2,SK);
  u(3,1+by,5,5,O);u(4,2+by,3,4,SK);u(3,1+by,5,2,CAP);u(4,0+by,3,1,CAP);u(s>0?7:1,2+by,2,1,CAPD);
  if(!blink)u(s>0?6:3,4+by,1,1,EY)}
 x.globalAlpha=1;
 if(p.bumpT>0){x.globalAlpha=Math.min(1,p.bumpT*5);const[dx,dy]=DIRS[p.bump];R(x,cx+dx*T*.5-1,cy+dy*T*.5-3,2,2,'#ffffff');R(x,cx+dx*T*.5+dy*3,cy+dy*T*.5+dx*3,1,1,'#ffe14f');x.globalAlpha=1}}
function drawEnemy(x,e,cx,cy,T){const ty=e.ty,r=Math.max(3,Math.round(T*.36)),b=Math.round(Math.sin(e.anim)*T*.06),ch=e.mode=='chase';
 x.globalAlpha=.28+(ch?.15*Math.sin(MZ.t*10):0);D(x,cx,cy+b,r*1.6,ty.glow);x.globalAlpha=1;x.globalAlpha=.35;R(x,cx-r+1,cy+r,r*2-2,1,'#000');x.globalAlpha=1;
 if(ty.id=='chasseur'){D(x,cx,cy+b,r+1,'#140408');D(x,cx,cy+b,r,ty.col);D(x,cx-1,cy+b-1,Math.max(1,r-2),'#ff6b78');R(x,cx-r,cy+b-1,r*2+1,1,ty.dk);for(const s of[-1,1])R(x,cx+s*r,cy+b-r+1+(Math.floor(e.anim)%2),1,2,'#ffd0d0')}
 else if(ty.id=='ruse'){for(let j=-r-1;j<=r+1;j++){const w=r+1-Math.abs(j);R(x,cx-w,cy+b+j,w*2+1,1,'#12051f')}for(let j=-r;j<=r;j++){const w=r-Math.abs(j);R(x,cx-w,cy+b+j,w*2+1,1,j<0?'#c27dff':ty.col)}
  const sp=Math.floor(e.anim*2)%2;R(x,cx,cy+b-r-2-sp,1,2,'#e0b8ff');R(x,cx-r-2-sp,cy+b,2,1,'#e0b8ff');R(x,cx+r+1+sp,cy+b,2,1,'#e0b8ff')}
 else{D(x,cx,cy+b-1,r+1,'#1a0520');D(x,cx,cy+b-1,r,ty.col);R(x,cx-r,cy+b-1,r*2+1,r+1,ty.col);for(let i=0;i<4;i++){const xx=cx-r+Math.round(i*(2*r)/3),w=Math.max(1,Math.round(r/2));R(x,xx,cy+b+r-((i+Math.floor(e.anim))%2),w,1,ty.dk)}x.globalAlpha=.5;D(x,cx-1,cy+b-2,Math.max(1,r-3),'#ffc4ff');x.globalAlpha=1}
 // yeux tournés vers la direction, rouges et plissés en poursuite
 const[dx,dy]=e.dir?DIRS[e.dir]:[0,1],ex=Math.round(dx*r*.3),ey=Math.round(dy*r*.25)-1,es=Math.max(1,Math.round(r*.32));
 for(const s of[-1,1]){R(x,cx+s*Math.round(r*.42)-Math.floor(es/2)+ex,cy+b+ey-Math.floor(es/2),es,ch?Math.max(1,es-1):es,'#ffffff');R(x,cx+s*Math.round(r*.42)+ex+dx,cy+b+ey+dy,1,1,ch?'#ff1030':'#101018')}
 if(ch){R(x,cx-r*.6,cy+b-r*.55,r*.5,1,'#101018');R(x,cx+r*.1,cy+b-r*.55,r*.5,1,'#101018')}
 if(e.alert>0){const y=cy-r-6-Math.round((1-e.alert)*3);R(x,cx-1,y,3,5,'#101018');R(x,cx,y+1,1,2,'#ffe14f');R(x,cx,y+4,1,1,'#ffe14f')}}
function heart(x,X,Y,on){const c=on?'#ff4d6a':'#3a2a40',h=on?'#ffb0bf':'#4a3a50';R(x,X+1,Y,2,1,c);R(x,X+4,Y,2,1,c);R(x,X,Y+1,7,2,c);R(x,X+1,Y+3,5,1,c);R(x,X+2,Y+4,3,1,c);R(x,X+3,Y+5,1,1,c);R(x,X+1,Y+1,1,1,h)}
function gem(x,X,Y,c){R(x,X+2,Y,3,1,c);R(x,X+1,Y+1,5,2,c);R(x,X+2,Y+3,3,1,c);R(x,X+3,Y+4,1,1,c);R(x,X+2,Y+1,1,1,'#fff')}
function hudBar(x,L){const H=L.hud,M=MZ.map;R(x,0,0,L.w,H.h,'#070914');R(x,0,H.h-1,L.w,1,'#1d3a8a');const y=Math.round((H.h-7)/2);
 const items=[['SCORE',pad(MZ.score,6),'#ffe14f'],['VIES',null],['CRISTAUX',MZ.got+'/'+(M?M.crys.length:5),MZ.got>=5?'#7dff9a':'#ffe14f'],['NIVEAU',String(MZ.lv+1),'#9fe8ff'],['',mmss(MZ.time||0),'#ffffff']];
 const small=L.w<262;const parts=items.map(([k,v])=>k=='VIES'?{w:MAXL>3&&MZ.lives>3?MZ.lives*8:24}:{w:TW((small?'':k+(k?' ':''))+v)+(k=='CRISTAUX'&&small?9:0)});const tot=parts.reduce((a,b)=>a+b.w,0),gap=Math.max(4,Math.floor((L.w-8-tot)/(items.length-1)));let X=4;
 items.forEach(([k,v,c],i)=>{if(k=='VIES'){for(let j=0;j<Math.max(3,MZ.lives);j++)heart(x,X+j*8,y,j<MZ.lives);X+=parts[i].w+gap;return}
  let s=(small?'':k+(k?' ':''));if(k=='CRISTAUX'&&small){gem(x,X,y+1,MZ.hud&&MZ.hud.k=='c'?'#ffffff':'#ffe14f');X+=9}
  if(s){T_(x,s,X,y,'#6c7ab8');X+=TW(s)}const sc=MZ.hud&&MZ.hud.k=='c'&&k=='CRISTAUX';T_(x,v,X,y-(sc?1:0),sc?'#ffffff':c);X+=TW(v)+gap})}
function drawBtn(x,b,pressed){const dy=pressed?1:0;D(x,b.x,b.y+2,b.r,'#05060c');D(x,b.x,b.y+dy,b.r,b.d);D(x,b.x,b.y-1+dy,b.r-1,b.c);x.globalAlpha=.45;D(x,b.x-Math.round(b.r*.3),b.y-Math.round(b.r*.35)+dy,Math.max(1,Math.round(b.r*.3)),'#ffffff');x.globalAlpha=1;
 CT(x,b.lab,b.x,b.y+b.r+5,'#c8d2ff')}
function drawJoy(x,J){const d=MZ.touch.dir,[dx,dy]=d?DIRS[d]:[0,0];D(x,J.x,J.y+3,J.r,'#05060c');D(x,J.x,J.y,J.r,'#1a1f3a');D(x,J.x,J.y,J.r-2,'#252b52');
 for(const k of DK){const[a,b]=DIRS[k],on=d==k,px=J.x+a*(J.r-6),py=J.y+b*(J.r-6);for(let i=0;i<3;i++)R(x,px-(b?i:0)*1+(a?-a*i:0),py-(a?i:0)+(b?-b*i:0),1+(b?i*2:0),1+(a?i*2:0),on?'#7ff3ff':'#4a5590')}
 const kx=J.x+dx*J.r*.45,ky=J.y+dy*J.r*.45,kr=Math.max(5,Math.round(J.r*.42));R(x,J.x-1,J.y-1,3,3,'#0a0c18');x.globalAlpha=.6;D(x,kx,ky+3,kr,'#000');x.globalAlpha=1;D(x,kx,ky,kr,'#7a0d18');D(x,kx,ky-1,kr-1,'#ff3a4a');x.globalAlpha=.55;D(x,kx-kr*.3,ky-kr*.4,Math.max(1,kr*.35),'#ffffff');x.globalAlpha=1}
function deck(x,L){if(!L.land){const d=L.deck;R(x,0,d.y,L.w,d.h,'#0a0c1a');R(x,0,d.y,L.w,1,'#2a4aa8');x.globalAlpha=.25;for(let i=0;i<L.w;i+=6)R(x,i,d.y+3,3,1,'#2a4aa8');x.globalAlpha=1}
 else{R(x,0,L.hud.h,L.area.x,L.h-L.hud.h,'#0a0c1a');R(x,L.w-L.area.x,L.hud.h,L.area.x,L.h-L.hud.h,'#0a0c1a');R(x,L.area.x-1,L.hud.h,1,L.h,'#1d3a8a');R(x,L.w-L.area.x,L.hud.h,1,L.h,'#1d3a8a')}
 drawJoy(x,L.joy);drawBtn(x,L.bOk,MZ.touch.btn=='ok');drawBtn(x,L.bEx,MZ.touch.btn=='ex');
 if(L.land){CT(x,'JOYSTICK',L.joy.x,L.joy.y+L.joy.r+8,'#5a68a8')}}
function draw(x,w,h){if(w!==MZ.W||h!==MZ.H){if(MZ.W)MZ.touch={joy:null,dir:null,btn:null};layout(w,h)}else if(!MZ.L)layout(w,h);R(x,0,0,w,h,'#05060c');
 if(MZ.phase=='title'){title(x,MZ.L);deck(x,MZ.L);return}
 if(!MZ.map)return;if(!MZ.L.T)layout(w,h);const L2=MZ.L;if(!MZ.cache||MZ.cache.key!==L2.T+'x'+MZ.lv)bake(L2);
 const L=L2,T=L.T,M=MZ.map,A=L.area;let ox=L.ox,oy=L.oy;
 if(L.cam){const p=MZ.p;ox=Math.round(Math.min(A.x,Math.max(A.x+A.w-L.mw,A.x+A.w/2-(p.x+.5)*T)));oy=Math.round(Math.min(A.y,Math.max(A.y+A.h-L.mh,A.y+A.h/2-(p.y+.5)*T)))}
 if(MZ.shake>0){ox+=Math.round((Math.random()-.5)*MZ.shake*8);oy+=Math.round((Math.random()-.5)*MZ.shake*8)}
 x.save();x.beginPath();x.rect(A.x,A.y,A.w,A.h);x.clip();
 x.drawImage(MZ.cache.c,ox,oy);x.globalAlpha=.25+.2*Math.sin(MZ.t*2.2);x.drawImage(MZ.cache.g,ox,oy);x.drawImage(MZ.cache.g,ox,oy+1);x.globalAlpha=1;
 const C=(X,Y)=>[Math.round(ox+X*T+T/2),Math.round(oy+Y*T+T/2)];
 for(const tr of M.traps){const[a,b]=C(tr.x,tr.y);drawTrap(x,a,b,T,tr)}
 {const[a,b]=C(M.E.x,M.E.y);drawPortal(x,a,b,T)}
 for(const c of M.crys)if(!c.got){const[a,b]=C(c.x,c.y);drawCrystal(x,a,b,T,c.ph)}
 const ents=[...MZ.ens.map(e=>({y:e.y,f:()=>{const[a,b]=C(e.x,e.y);drawEnemy(x,e,a,b,T)}})),{y:MZ.p.y,f:()=>{const[a,b]=C(MZ.p.x,MZ.p.y);let bx=0,by=0;if(MZ.p.bumpT>0){const[dx,dy]=DIRS[MZ.p.bump];const k=Math.sin((1-MZ.p.bumpT/.22)*3.14)*T*.14;bx=dx*k;by=dy*k}if(MZ.phase!='hit'||Math.floor(MZ.t*16)%2)drawRunner(x,a+bx,b+by,T)}}].sort((a,b)=>a.y-b.y);ents.forEach(o=>o.f());
 for(const o of MZ.parts){const[a,b]=C(o.x,o.y);x.globalAlpha=Math.min(1,o.l*2);R(x,a,b,o.z?2:1,o.z?2:1,o.c)}x.globalAlpha=1;
 for(const o of MZ.pops){const[a,b]=C(o.x,o.y);x.globalAlpha=Math.min(1,o.l*1.6);CT(x,o.s,a,b-4,o.c,1,'#05060c');x.globalAlpha=1}
 // couloirs obscurs : seule une bulle de lumière autour du coureur (cristaux et portail brillent à travers)
 const dk=LEVELS[MZ.lv].dark;if(dk){const p=MZ.p,[a,b]=C(p.x,p.y),rr=dk*T;if(!MZ.dkc||MZ.dkc.width!==w||MZ.dkc.height!==h){MZ.dkc=document.createElement('canvas');MZ.dkc.width=w;MZ.dkc.height=h}
  const d=MZ.dkc.getContext('2d');d.globalCompositeOperation='source-over';d.clearRect(0,0,w,h);d.fillStyle='rgba(2,3,8,.93)';d.fillRect(0,0,w,h);d.globalCompositeOperation='destination-out';
  const g=d.createRadialGradient(a,b,rr*.25,a,b,rr);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.7,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=g;d.beginPath();d.arc(a,b,rr,0,6.29);d.fill();
  for(const c of M.crys)if(!c.got){const[q,s]=C(c.x,c.y);const gg=d.createRadialGradient(q,s,0,q,s,T*1.2);gg.addColorStop(0,'rgba(0,0,0,.9)');gg.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=gg;d.beginPath();d.arc(q,s,T*1.2,0,6.29);d.fill()}
  {const[q,s]=C(M.E.x,M.E.y),rp=T*(MZ.portal?2.2:1);const gg=d.createRadialGradient(q,s,0,q,s,rp);gg.addColorStop(0,'rgba(0,0,0,.9)');gg.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=gg;d.beginPath();d.arc(q,s,rp,0,6.29);d.fill()}
  x.drawImage(MZ.dkc,0,0)}
 if(MZ.flash>0){x.globalAlpha=MZ.flash*.6;R(x,A.x,A.y,A.w,A.h,'#9dffb5');x.globalAlpha=1}
 if(MZ.phase=='hit'){x.globalAlpha=Math.min(.35,MZ.hitT*.3);R(x,A.x,A.y,A.w,A.h,'#ff1030');x.globalAlpha=1}
 x.restore();
 hudBar(x,L);deck(x,L);if(L.mm)minimap(x,L,ox,oy);
 // panneau du niveau / pancartes
 if(MZ.phase=='intro')card(x,L,['LEVEL '+pad(MZ.lv+1,2),LEVELS[MZ.lv].nom,'RAMASSE LES 5 CRISTAUX','PUIS FILE AU PORTAIL !'],['#9fe8ff','#ffe14f','#ffffff','#7dff9a']);
 else if(MZ.phase=='done')doneScreen(x,L);else if(MZ.phase=='over')overScreen(x,L);else if(MZ.phase=='win')winScreen(x,L);
 if(MZ.phase=='play'&&MZ.time<4&&MZ.got==0){x.globalAlpha=Math.min(1,(4-MZ.time));CT(x,'CRISTAUX : 0/5',A.x+A.w/2,A.y+A.h-10,'#ffe14f',1,'#05060c');x.globalAlpha=1}}
function minimap(x,L,ox,oy){const m=L.mm,M=MZ.map,s=m.s;if(!MZ.mmc||MZ.mmc.key!==s+'x'+MZ.lv){const c=document.createElement('canvas');c.width=m.w;c.height=m.h;const g=c.getContext('2d'),P=LEVELS[MZ.lv].pal;
  for(let y=0;y<M.H;y++)for(let X=0;X<M.W;X++)R(g,X*s,y*s,s,s,M.walls[y][X]?P.top:'#0a0d1c');c.key=s+'x'+MZ.lv;MZ.mmc=c}
 R(x,m.x-2,m.y-2,m.w+4,m.h+4,'#1d3a8a');x.drawImage(MZ.mmc,m.x,m.y);CT(x,'CARTE',m.x+m.w/2,m.y-11,'#5a68a8');
 const P=(X,Y,c,z)=>R(x,m.x+X*s+Math.floor((s-z)/2),m.y+Y*s+Math.floor((s-z)/2),z,z,c);
 for(const c of M.crys)if(!c.got)P(c.x,c.y,Math.floor(MZ.t*4)%2?'#ffe14f':'#fff6a8',Math.max(2,s-1));P(M.E.x,M.E.y,MZ.portal?'#3dff7a':'#1f5a30',s);
 for(const e of MZ.ens)P(Math.round(e.x),Math.round(e.y),e.ty.col,Math.max(2,s-1));P(Math.round(MZ.p.x),Math.round(MZ.p.y),Math.floor(MZ.t*5)%2?'#2ee6ff':'#ffffff',s);
 // cadre de la vue rapprochée
 const V=L.V,T=L.T,vx=m.x+(V.x-ox)/T*s,vy=m.y+(V.y-oy)/T*s,vw=V.w/T*s,vh=V.h/T*s;x.globalAlpha=.8;R(x,vx,vy,vw,1,'#ffffff');R(x,vx,vy+vh-1,vw,1,'#ffffff');R(x,vx,vy,1,vh,'#ffffff');R(x,vx+vw-1,vy,1,vh,'#ffffff');x.globalAlpha=1}
function panel(x,L,h){const A=L.area,w=Math.min(A.w-8,230),X=Math.round(A.x+(A.w-w)/2),Y=Math.round(A.y+(A.h-h)/2);x.globalAlpha=.92;R(x,X,Y,w,h,'#070a18');x.globalAlpha=1;
 R(x,X,Y,w,1,'#7ff3ff');R(x,X,Y+h-1,w,1,'#7ff3ff');R(x,X,Y,1,h,'#7ff3ff');R(x,X+w-1,Y,1,h,'#7ff3ff');R(x,X+2,Y+2,w-4,1,'#1d3a8a');return{X,Y,w,cx:X+w/2}}
function card(x,L,lines,cols){const h=16+lines.length*13,P=panel(x,L,h);lines.forEach((s,i)=>CT(x,s,P.cx,P.Y+9+i*13,cols[i],1,'#05060c'))}
function doneScreen(x,L){const t=MZ.tally,k=Math.min(1,MZ.doneT/1.2),n=v=>Math.round(v*k);const rows=[['CRISTAUX',n(t.crys)],['BONUS TEMPS',n(t.time)],['BONUS NIVEAU',n(t.lvl)]];
 const P=panel(x,L,132),wide=P.w;CT(x,'LEVEL COMPLETED',P.cx,P.Y+8,'#7dff9a',1,'#05060c');CT(x,LEVELS[MZ.lv].nom,P.cx,P.Y+20,'#ffe14f');
 rows.forEach(([a,b],i)=>{T_(x,a,P.X+10,P.Y+36+i*12,'#9fb0e8');const s='+'+b;T_(x,s,P.X+wide-10-TW(s),P.Y+36+i*12,'#ffffff')});
 T_(x,'TEMPS',P.X+10,P.Y+72,'#9fb0e8');T_(x,mmss(MZ.time),P.X+wide-10-TW(mmss(MZ.time)),P.Y+72,'#ffffff');
 T_(x,'SCORE',P.X+10,P.Y+88,'#ffe14f');const sc=pad(t.base+n(t.time+t.lvl),6);T_(x,sc,P.X+wide-10-TW(sc),P.Y+88,'#ffe14f');
 if(t.life&&MZ.doneT>1)CT(x,'+1 VIE !',P.cx,P.Y+102,'#ff8aa0');
 if(MZ.doneT>.6&&Math.floor(MZ.t*2.5)%2)CT(x,MZ.lv+1<NL?'ENTER : NIVEAU SUIVANT':'ENTER : CONTINUER',P.cx,P.Y+116,'#ffffff')}
function overScreen(x,L){const P=panel(x,L,96);CT(x,'GAME OVER',P.cx,P.Y+10,'#ff4d6a',2,'#05060c');CT(x,'SCORE '+pad(MZ.score,6),P.cx,P.Y+36,'#ffe14f');CT(x,(MZ.rec?'NOUVEAU RECORD ! ':'RECORD ')+pad(MZ.api.best(),6),P.cx,P.Y+50,MZ.rec?'#7dff9a':'#9fb0e8');
 if(MZ.overT>.6&&Math.floor(MZ.t*2.5)%2)CT(x,'ENTER : REJOUER',P.cx,P.Y+68,'#ffffff');CT(x,'EXIT : CATALOGUE',P.cx,P.Y+80,'#6c7ab8')}
function winScreen(x,L){const P=panel(x,L,112);const c=['#ffe14f','#7dff9a','#7ff3ff','#ff8cf0'][Math.floor(MZ.t*6)%4];CT(x,'VICTOIRE !',P.cx,P.Y+10,c,2,'#05060c');CT(x,'LES 5 LABYRINTHES',P.cx,P.Y+34,'#ffffff');CT(x,'SONT VAINCUS',P.cx,P.Y+46,'#ffffff');
 CT(x,'SCORE FINAL '+pad(MZ.score,6),P.cx,P.Y+64,'#ffe14f');CT(x,(MZ.rec?'NOUVEAU RECORD !':'RECORD '+pad(MZ.api.best(),6)),P.cx,P.Y+78,MZ.rec?'#7dff9a':'#9fb0e8');if(MZ.winT>.8&&Math.floor(MZ.t*2.5)%2)CT(x,'ENTER : MENU',P.cx,P.Y+96,'#ffffff');
 for(let i=0;i<3;i++){const a=MZ.t*2+i*2.1;R(x,P.cx+Math.cos(a)*P.w*.42,P.Y+56+Math.sin(a*1.3)*40,2,2,c)}}
function title(x,L){const A=L.area,cx=A.x+A.w/2,t=MZ.t,n=unlocked();
 // fond : couloirs néon qui défilent
 for(let y=A.y;y<A.y+A.h;y+=12)for(let X=A.x;X<A.x+A.w;X+=12){const k=((X*7+y*3)>>2)%5;if(k==0){R(x,X,y,11,11,'#0f1a44');R(x,X,y,11,1,'#2a5cff')}}
 x.globalAlpha=.5+.3*Math.sin(t*3);R(x,A.x,A.y+((t*30)%A.h),A.w,1,'#7ff3ff');x.globalAlpha=1;
 const big=A.w>=250?3:2,ty=A.y+Math.max(6,Math.round(A.h*.06));CT(x,'MAZE',cx,ty,'#7ff3ff',big,'#071030');CT(x,'RUNNER',cx,ty+big*9,'#ffe14f',big,'#3a1a00');
 // démo animée : le coureur, un cristal, un ennemi
 const dy=ty+big*18+10,T=Math.max(12,Math.min(18,Math.floor(A.w/14)));const sv=MZ.p;MZ.p={x:0,y:0,face:['right','down','left','up'][Math.floor(t/1.2)%4],moving:true,anim:t*3,idle:0,bumpT:0};drawRunner(x,cx-T*1.6,dy+T*.6,T);MZ.p=sv;
 drawCrystal(x,Math.round(cx),Math.round(dy+T*.5),T,t);drawEnemy(x,{ty:TYPES[Math.floor(t/2)%3],anim:t*5,mode:Math.floor(t)%3?'patrol':'chase',dir:'left',alert:0},Math.round(cx+T*1.6),Math.round(dy+T*.6),T);
 let y=dy+T+12;const L1=['RAMASSE LES 5 CRISTAUX','ÉVITE LES GARDIENS','ATTEINS LE PORTAIL VERT'];L1.forEach((s,i)=>CT(x,s,cx,y+i*11,['#ffe14f','#ff8a9a','#7dff9a'][i]));y+=40;
 // choix du niveau (débloqués)
 const lv=MZ.sel,nm='LEVEL '+pad(lv+1,2);CT(x,nm,cx,y,'#ffffff',1,'#05060c');CT(x,LEVELS[lv].nom,cx,y+11,'#9fe8ff');if(n>1){const b=Math.floor(t*3)%2;T_(x,'<',cx-58-b,y+5,'#ffe14f');T_(x,'>',cx+54+b,y+5,'#ffe14f')}
 for(let i=0;i<NL;i++)R(x,cx-NL*5+i*10,y+24,6,3,i==lv?'#ffe14f':i<n?'#4a5aa8':'#1c2040');y+=34;
 const d=MZ.api.data();CT(x,'RECORD '+pad(d.best||0,6),cx,y,'#ffe14f');y+=14;if(Math.floor(t*2.2)%2)CT(x,'ENTER : JOUER',cx,y,'#7dff9a');
 if(y+24<A.y+A.h)CT(x,n>1?'JOYSTICK : CHOISIR LE NIVEAU':'JOYSTICK : SE DÉPLACER',cx,y+14,'#6c7ab8')}
// ---------- toucher : joystick et boutons ENTER / EXIT de la borne, redessinés sur l'écran du jeu ----------
function pointer(type,px,py,id){const L=MZ.L;if(!L)return;const T=MZ.touch;
 if(type=='down'){if(Math.hypot(px-L.bOk.x,py-L.bOk.y)<L.bOk.r+8){T.btn='ok';T.btnId=id;return}if(Math.hypot(px-L.bEx.x,py-L.bEx.y)<L.bEx.r+8){T.btn='ex';T.btnId=id;return}
  // joystick : zone large autour du socle (tout le côté gauche du pupitre)
  const J=L.joy,inJ=L.land?px<L.area.x:(py>L.deck.y&&px<L.w*.55);if(inJ||Math.hypot(px-J.x,py-J.y)<J.r*1.8){T.joy=id;stick(px,py);return}
  // toucher dans le labyrinthe : direction vers le doigt (pratique pour les petits gestes)
  if(MZ.phase=='title'||MZ.phase=='done'||MZ.phase=='over'||MZ.phase=='win'){ok();return}}
 else if(type=='move'){if(id===T.joy)stick(px,py)}
 else if(type=='up'){if(id===T.joy){T.joy=null;T.dir=null}if(id===T.btnId){const b=T.btn;T.btn=null;T.btnId=null;if(b=='ok'&&(Math.hypot(px-L.bOk.x,py-L.bOk.y)<L.bOk.r+14)){fx('mzTick',1,.015);ok()}else if(b=='ex'&&Math.hypot(px-L.bEx.x,py-L.bEx.y)<L.bEx.r+14)exit()}}}
function stick(px,py){const J=MZ.L.joy,dx=px-J.x,dy=py-J.y,l=Math.hypot(dx,dy),T=MZ.touch;const d=l<J.r*.28?null:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');if(d&&d!==T.dir&&MZ.p&&MZ.phase=='play'){MZ.p.want=d;MZ.p.wantT=.12}T.dir=d}
// ---------- module ----------
const Maze={start(api){MZ.api=api;MZ.phase='title';MZ.sel=Math.max(0,unlocked()-1);MZ.okN=null;MZ.map=null;MZ.cache=null;MZ.L=null;MZ.W=0;MZ.H=0;MZ.parts=[];MZ.pops=[];MZ.score=0;MZ.lives=3;MZ.lv=0;MZ.time=0;MZ.got=0;MZ.touch={joy:null,dir:null,btn:null};MZ.p=null;MZ.ens=[];music()},
 update,draw,pointer,
 // changement d'orientation / de taille : la borne recrée la toile ; on relâche tout doigt en cours et on refait la mise en page
 resize(){MZ.touch={joy:null,dir:null,btn:null};MZ.L=null},
 stop(){try{JEUSON.sfxLevel(1);JEUSON.stop()}catch(e){}MZ.api=null;MZ.phase='title';MZ.map=null;MZ.cache=null;MZ.dkc=null;MZ.parts=[];MZ.pops=[];MZ.ens=[];MZ.touch={joy:null,dir:null,btn:null};MZ.L=null},
 _state:MZ,_levels:LEVELS,_parse:parse,_generate:generate,_bfs:bfs,_ok:ok,_hit:hit,_collect:collect};
ARC.register('maze',Maze);
})();
