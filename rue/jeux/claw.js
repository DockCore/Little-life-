// ===== MINI-JEU LUCKY CLAW (module de la borne d'arcade) =====
// Vraie machine à pince : vitrine en verre, tas de peluches et de cadeaux, pince à trois doigts suspendue à un chariot.
// Tout est simulé (aucune animation pré-enregistrée) : chaque lot est une sphère soumise à la gravité, aux chocs entre lots,
// aux parois de la vitrine, au sol et à la goulotte ; la pince est un corps cinématique (3 doigts articulés = capsules)
// qui pousse les lots, les serre et les soulève par contact et frottement. La force de serrage varie d'une tentative à l'autre
// et le frottement dépend du lot : on gagne quand un lot tombe dans la goulotte (coin avant gauche).
// Gérés par la borne : api.exit (RETOUR), api.end(score) (fin de partie → écran REJOUER / RETOUR), api.data() (sauvegarde Little Life).
// Commandes : croix tactile (gauche/droite = côté, haut = AVANT vers le fond, bas = ARRIÈRE vers soi), bouton DESCENDRE ;
// clavier : flèches / ZQSD, Entrée ou Espace = descendre.
(function(){
// ---------- outils ----------
const fx=(n,k,g)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
const T_=(x,s,X,Y,c,sc,ol)=>{try{axText(x,s,X,Y,c,sc||1,ol)}catch(e){}},CT=(x,s,cx,Y,c,sc,ol)=>{try{axCText(x,s,cx,Y,c,sc||1,ol)}catch(e){}},TW=(s,sc)=>{try{return axTW(s,sc||1)}catch(e){return String(s).length*6*(sc||1)}};
const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,pad=(n,k)=>String(Math.max(0,Math.floor(n))).padStart(k,'0');
// ---------- le monde (unités ≈ cm) : x = largeur, z = profondeur (0 = vitre avant), y = hauteur (0 = sol) ----------
const WX=100,WD=64,TOPY=92,GRAV=170;
// goulotte : trou dans le sol (coin avant gauche) entouré de deux plaques de plexiglas
const CHX=30,CHZ=28,CHH=14,CHT=1.6;
const WALLS=[{x0:CHX,x1:CHX+CHT,z0:0,z1:CHZ+CHT,y0:-80,y1:CHH},{x0:0,x1:CHX+CHT,z0:CHZ,z1:CHZ+CHT,y0:-80,y1:CHH}];
// pince : moyeu, 2 segments par doigt, rayon des capsules
const HUB=4,L1=10,L2=10,CR=1.4,HR=4.2,REACH=15,HOME={x:15,z:15};
const SUB=4,ITER=3,DT=1/240,KG=.62;
// ---------- les lots ----------
const RAR=[{n:'COMMUN',c:'#c8d2e6',d:'#5a6478',pts:10,w:52},{n:'RARE',c:'#38b6ff',d:'#13508a',pts:25,w:30},{n:'ÉPIQUE',c:'#c06bff',d:'#56208f',pts:60,w:13},{n:'LÉGENDAIRE',c:'#ffc21a',d:'#8a5a00',pts:150,w:5}];
const PRIZES=[
 {id:'ours',nom:'OURSON',rar:0,r:6.2,fr:.95,f:'bear',c:'#b8743f',c2:'#f0c296'},
 {id:'lapin',nom:'LAPIN ROSE',rar:0,r:5.8,fr:.95,f:'bunny',c:'#ffb3d0',c2:'#ffffff'},
 {id:'poussin',nom:'POUSSIN',rar:0,r:5.3,fr:.9,f:'chick',c:'#ffd83a',c2:'#ff9a2e'},
 {id:'grenouille',nom:'GRENOUILLE',rar:0,r:5.8,fr:.92,f:'frog',c:'#62cf5a',c2:'#d9ffb6'},
 {id:'cadeau',nom:'CADEAU SURPRISE',rar:0,r:5.6,fr:.85,f:'box',c:'#ff4f6a',c2:'#ffe14f'},
 {id:'chat',nom:'CHAT BLEU',rar:1,r:6,fr:.88,f:'cat',c:'#6fa8ff',c2:'#e2eeff'},
 {id:'pingouin',nom:'PINGOUIN',rar:1,r:5.9,fr:.85,f:'penguin',c:'#2c3756',c2:'#ffffff'},
 {id:'boite',nom:'BOÎTE ÉTOILÉE',rar:1,r:5.7,fr:.8,f:'box',c:'#3a6fff',c2:'#ffffff'},
 {id:'licorne',nom:'LICORNE',rar:2,r:6.4,fr:.8,f:'unicorn',c:'#fff4fb',c2:'#ff8ad0'},
 {id:'pieuvre',nom:'PIEUVRE',rar:2,r:6.3,fr:.78,f:'octo',c:'#b46bff',c2:'#ecd6ff'},
 {id:'etoile',nom:'ÉTOILE DORÉE',rar:3,r:5.6,fr:.7,f:'star',c:'#ffd23a',c2:'#fff3a0'},
 {id:'oeuf',nom:'OEUF DORÉ',rar:3,r:5.2,fr:.62,f:'egg',c:'#ffc21a',c2:'#fff6c8'}];
const NP=PRIZES.length,CREDITS0=8,BUY_N=5,BUY_P=10,AIM_T=20,PILE=30;
// ---------- état ----------
const CL={phase:'title',t:0,api:null,L:null,W:0,H:0,ps:[],claw:null,score:0,credits:0,won:[],pend:[],parts:[],toast:null,touch:{pad:null,dir:{x:0,z:0},big:null},okN:null,seed:1,miss:0,att:0};
let RNG=Math.random;
function rnd(a,b){return a+(b-a)*RNG()}
function pickType(){let tot=0;for(const p of PRIZES)tot+=RAR[p.rar].w/PRIZES.filter(q=>q.rar==p.rar).length;let v=RNG()*tot;
 for(const p of PRIZES){v-=RAR[p.rar].w/PRIZES.filter(q=>q.rar==p.rar).length;if(v<=0)return p}return PRIZES[0]}
function inHole(x,z){return x<CHX&&z<CHZ}
function newPrize(T,x,y,z){return{T,r:T.r,x,y,z,px:x,py:y,pz:z,vx:0,vy:0,vz:0,rot:rnd(-.4,.4),spin:0,id:Math.random(),held:0,lift:0}}
// un emplacement libre hors de la goulotte (avec marge pour que la pince puisse y descendre)
function freeSpot(r){for(let k=0;k<40;k++){const x=rnd(r+1,WX-r-1),z=rnd(r+1,WD-r-1);if(x<CHX+CHT+r+3&&z<CHZ+CHT+r+3)continue;return{x,z}}return{x:WX-20,z:WD-20}}
// les lots tombent en pluie au-dessus de la zone centrale : ils forment un vrai tas, comme dans une machine qu'on vient de remplir
function fillPile(n,drop){for(let i=0;i<n;i++){const T=pickType();let x,z;do{x=rnd(24,WX-16);z=rnd(14,WD-12)}while(x<CHX+CHT+T.r+4&&z<CHZ+CHT+T.r+4);
 CL.ps.push(newPrize(T,x,drop?TOPY-6+i*4:T.r+2+i*6.5,z))}}
// ---------- géométrie de la pince ----------
// open : 0 = fermée, 1 = grande ouverte. Chaque doigt : articulation au moyeu → genou → pointe (recourbée vers l'intérieur).
function fingers(c){const a=.35+.72*c.open,b=a-1.06,o=[];
 for(let i=0;i<3;i++){const ph=c.rot+i*2.0944,ux=Math.cos(ph),uz=Math.sin(ph);
  const j={x:c.x+ux*HUB,y:c.y-1.2,z:c.z+uz*HUB},kr=L1*Math.sin(a),ky=L1*Math.cos(a),k={x:j.x+ux*kr,y:j.y-ky,z:j.z+uz*kr};
  const tr=L2*Math.sin(b),ty=L2*Math.cos(b),t={x:k.x+ux*tr,y:k.y-ty,z:k.z+uz*tr};o.push({j,k,t,ux,uz,ph})}return o}
// profondeur de la pointe la plus basse sous le moyeu, pour une ouverture donnée
function tipDepth(open){const a=.35+.72*open,b=a-1.06;return 1.2+L1*Math.cos(a)+L2*Math.cos(b)}
// hauteur minimale du moyeu : pointes au-dessus du sol, et au-dessus des plaques de la goulotte quand on est tout près
function hubMin(x,z,open){const d=tipDepth(open)+CR+.3;if(x<CHX+CHT+REACH&&z<CHZ+CHT+REACH)return d+CHH+1.5;return d}
// ---------- physique ----------
// sphère contre capsule cinématique (segment A-B de rayon cr) ; mv = déplacement de la pince pendant le pas (frottement)
function capsule(p,A,B,cr,mv,mu,grip){const abx=B.x-A.x,aby=B.y-A.y,abz=B.z-A.z,ll=abx*abx+aby*aby+abz*abz;
 let t=ll>0?((p.x-A.x)*abx+(p.y-A.y)*aby+(p.z-A.z)*abz)/ll:0;t=t<0?0:t>1?1:t;
 const qx=A.x+abx*t,qy=A.y+aby*t,qz=A.z+abz*t;let dx=p.x-qx,dy=p.y-qy,dz=p.z-qz,L=Math.sqrt(dx*dx+dy*dy+dz*dz);const pen=p.r+cr-L;if(pen<=0)return 0;
 if(L<1e-6){dx=0;dy=1;dz=0;L=1}const nx=dx/L,ny=dy/L,nz=dz/L;p.x+=nx*pen;p.y+=ny*pen;p.z+=nz*pen;
 // frottement de Coulomb : la force normale que la pince peut exercer est limitée par sa force de serrage
 if(mu>0){let rx=(p.x-p.px)-mv.x,ry=(p.y-p.py)-mv.y,rz=(p.z-p.pz)-mv.z;const rn=rx*nx+ry*ny+rz*nz;rx-=nx*rn;ry-=ny*rn;rz-=nz*rn;
  const rt=Math.sqrt(rx*rx+ry*ry+rz*rz),cap=mu*Math.min(pen,grip*KG*GRAV*DT*DT*(1+Math.max(0,ny)*2));if(rt>1e-9){const k=rt<=cap?1:cap/rt;p.x-=rx*k;p.y-=ry*k;p.z-=rz*k}
  p.touch=1;if(ny>.35)p.cradle=1}
 return pen}
// sphère contre boîte alignée (plaques de la goulotte)
function boxPush(p,B){const qx=cl(p.x,B.x0,B.x1),qy=cl(p.y,B.y0,B.y1),qz=cl(p.z,B.z0,B.z1);let dx=p.x-qx,dy=p.y-qy,dz=p.z-qz,L=Math.sqrt(dx*dx+dy*dy+dz*dz);
 if(L>=p.r)return;if(L<1e-6){// centre dans la plaque : sortie par le côté le plus proche
  const o=[[B.x0-p.x-p.r,0],[B.x1-p.x+p.r,0],[0,B.z0-p.z-p.r],[0,B.z1-p.z+p.r]].sort((a,b)=>Math.abs(a[0]+a[1])-Math.abs(b[0]+b[1]))[0];p.x+=o[0];p.z+=o[1];return}
 const k=(p.r-L)/L;p.x+=dx*k;p.y+=dy*k;p.z+=dz*k}
function walls(p){const r=p.r;
 // vitrine : rien ne la traverse
 if(p.x<r)p.x=r;if(p.x>WX-r)p.x=WX-r;if(p.z<r)p.z=r;if(p.z>WD-r)p.z=WD-r;if(p.y>TOPY+20)p.y=TOPY+20;
 // sol (sauf au-dessus du trou de la goulotte)
 if(!inHole(p.x,p.z)&&p.y<r){p.y=r;p.floor=1}
 for(const B of WALLS)boxPush(p,B)}
function pair(a,b){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,d2=dx*dx+dy*dy+dz*dz,rr=a.r+b.r;if(d2>=rr*rr||d2<1e-9)return;const d=Math.sqrt(d2),pen=rr-d,nx=dx/d,ny=dy/d,nz=dz/d;
 const ma=a.r*a.r*a.r,mb=b.r*b.r*b.r,ka=mb/(ma+mb),kb=ma/(ma+mb);a.x-=nx*pen*ka;a.y-=ny*pen*ka;a.z-=nz*pen*ka;b.x+=nx*pen*kb;b.y+=ny*pen*kb;b.z+=nz*pen*kb;
 // frottement entre peluches (tissu) : on freine le glissement relatif
 let rx=(b.x-b.px)-(a.x-a.px),ry=(b.y-b.py)-(a.y-a.py),rz=(b.z-b.pz)-(a.z-a.pz);const rn=rx*nx+ry*ny+rz*nz;rx-=nx*rn;ry-=ny*rn;rz-=nz*rn;const f=.22;
 a.x+=rx*f*ka;a.y+=ry*f*ka;a.z+=rz*f*ka;b.x-=rx*f*kb;b.y-=ry*f*kb;b.z-=rz*f*kb}
// un pas de simulation (DT) : pince cinématique puis lots
function step(){const c=CL.claw,ps=CL.ps,F=fingers(c),mv={x:c.x-c.lx,y:c.y-c.ly,z:c.z-c.lz},mu=c.grip;c.lx=c.x;c.ly=c.y;c.lz=c.z;
 for(const p of ps){p.px=p.x;p.py=p.y;p.pz=p.z;p.vy-=GRAV*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;p.z+=p.vz*DT;p.floor=0;p.touch=0;p.cradle=0}
 const hub={x:c.x,y:c.y+1,z:c.z};
 for(let it=0;it<ITER;it++){
  for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)pair(ps[i],ps[j]);
  for(const p of ps){const m=it==0?mu*p.T.fr:0;capsule(p,hub,{x:c.x,y:c.y+9,z:c.z},HR,mv,0,0);
   for(const f of F){capsule(p,f.j,f.k,CR,mv,m,c.force);capsule(p,f.k,f.t,CR,mv,m,c.force)}walls(p)}}
 // pénétration résiduelle de la pince : le tas résiste (arrêt de la descente, blocage de la fermeture)
 let res=0;for(const p of ps)for(const f of F){for(const[A,B]of[[f.j,f.k],[f.k,f.t]]){const abx=B.x-A.x,aby=B.y-A.y,abz=B.z-A.z,ll=abx*abx+aby*aby+abz*abz;let t=((p.x-A.x)*abx+(p.y-A.y)*aby+(p.z-A.z)*abz)/ll;t=t<0?0:t>1?1:t;
  const d=Math.hypot(p.x-A.x-abx*t,p.y-A.y-aby*t,p.z-A.z-abz*t),q=p.r+CR-d;if(q>0)res+=q}}
 for(const p of ps){const d=Math.hypot(p.x-c.x,p.z-c.z),dy=p.y<c.y+1?c.y+1-p.y:p.y>c.y+9?p.y-c.y-9:0,q=p.r+HR-Math.hypot(d,dy);if(q>0)res+=q}
 c.res=res;
 for(const p of ps){let vx=(p.x-p.px)/DT,vy=(p.y-p.py)/DT,vz=(p.z-p.pz)/DT;const damp=p.floor?.9:.997;vx*=damp;vz*=damp;vy*=.997;
  if(p.floor&&Math.abs(vx)<.6&&Math.abs(vz)<.6&&Math.abs(vy)<.6){vx=vz=0}p.vx=vx;p.vy=vy;p.vz=vz;
  // roulis visuel : la peluche tourne en roulant, oscille quand la pince la porte
  p.spin=lerp(p.spin,(vx*DT)/p.r*(p.floor?1:.4),.2);p.rot+=p.spin;if(p.touch)p.rot+=Math.sin(CL.t*9+p.id*10)*.004;p.held=p.touch&&p.y>p.r+2?Math.min(1,p.held+DT*4):Math.max(0,p.held-DT*3)}
 // lots tombés dans la goulotte : gagnés
 for(let i=ps.length-1;i>=0;i--){const p=ps[i];if(p.y<-16&&inHole(p.x,p.z)){ps.splice(i,1);win(p)}else if(p.y<-60){ps.splice(i,1)}}}
// ---------- pince : chariot, câble, balancement ----------
function newClaw(){return{gx:HOME.x,gz:HOME.z,x:HOME.x,z:HOME.z,y:TOPY,lx:HOME.x,ly:TOPY,lz:HOME.z,open:.55,rot:-Math.PI/2,swx:0,swz:0,vwx:0,vwz:0,gvx:0,gvz:0,grip:0,force:1,res:0,vy:0}}
function moveGantry(dt,tx,tz,sp){const c=CL.claw,ox=c.gx,oz=c.gz;let dx=tx-c.gx,dz=tz-c.gz;const L=Math.hypot(dx,dz),m=sp*dt;if(L>m){dx*=m/L;dz*=m/L}c.gx+=dx;c.gz+=dz;
 c.gx=cl(c.gx,REACH,WX-REACH);c.gz=cl(c.gz,REACH,WD-REACH);return Math.hypot(c.gx-ox,c.gz-oz)>1e-4}
// balancement du câble : petit pendule amorti excité par les accélérations du chariot
function sway(dt){const c=CL.claw,vx=(c.gx-(c.pgx==null?c.gx:c.pgx))/dt,vz=(c.gz-(c.pgz==null?c.gz:c.pgz))/dt,ax=(vx-c.gvx)/dt,az=(vz-c.gvz)/dt;c.pgx=c.gx;c.pgz=c.gz;c.gvx=vx;c.gvz=vz;
 const len=Math.max(6,TOPY+10-c.y),k=GRAV/len*1.4;c.vwx+=(-k*c.swx-ax*.04)*dt;c.vwz+=(-k*c.swz-az*.04)*dt;c.vwx*=Math.pow(.2,dt);c.vwz*=Math.pow(.2,dt);c.swx=cl(c.swx+c.vwx*dt,-2.2,2.2);c.swz=cl(c.swz+c.vwz*dt,-2.2,2.2);
 c.x=cl(c.gx+c.swx,REACH-.6,WX-REACH+.6);c.z=cl(c.gz+c.swz,REACH-.6,WD-REACH+.6)}
// ---------- déroulement d'une partie ----------
function newGame(){CL.score=0;CL.credits=CREDITS0;CL.won=[];CL.pend=[];CL.miss=0;CL.att=0;CL.toast=null;toReady()}
function toReady(){CL.phase='ready';CL.pt=0;const c=CL.claw;c.open=.55;c.grip=0}
function insert(){if(CL.credits<=0)return;CL.credits--;CL.att++;fx('clCoin',1,.05);CL.phase='aim';CL.pt=0;CL.aimT=AIM_T;CL.claw.open=.55;CL.lifted=null;CL.got=[];CL.claw.grip=0;
 // force de la pince pour cette tentative (comme une vraie machine) : variable, et plus généreuse après plusieurs échecs
 const lucky=CL.miss>=4&&RNG()<.5;CL.claw.force=lucky?1:rnd(.3,.9);CL.claw.lucky=lucky}
function drop(){if(CL.phase!='aim')return;CL.phase='open';CL.pt=0;fx('clDrop',1,.1)}
function finishAttempt(){const got=CL.got||[];if(got.length){CL.miss=0;CL.phase='win';CL.pt=0;CL.winI=0}else{CL.miss++;CL.toast={s:CL.lifted?'PRESQUE !':'RATÉ !',c:CL.lifted?'#ffe14f':'#ff7a8a',t:1.6};fx('clMiss');afterResult()}}
function afterResult(){// regarnir la vitrine si elle se vide (les nouveaux lots tombent du haut)
 if(CL.ps.length<PILE-5){fillPile(PILE-CL.ps.length,true);CL.refill=1.2}
 if(CL.credits>0)toReady();else{CL.phase='nocredit';CL.pt=0;fx('clOver')}}
function win(p){if(CL.sim||CL.phase=='title')return;const T=p.T,d=data();d.col=d.col||{};const first=!d.col[T.id];d.col[T.id]=(d.col[T.id]||0)+1;d.wins=(d.wins||0)+1;try{CL.api&&CL.api.save()}catch(e){}
 const pts=RAR[T.rar].pts;CL.score+=pts;const w={T,first,pts,t:0};CL.won.push(T.id);(CL.got=CL.got||[]).push(w);CL.flap={T,t:0,rot:p.rot};fx('clThud');
 // si un lot tombe pendant l'attente (hors tentative), on l'annonce quand même
 if(!['aim','open','drop','grab','close','rise','home','release','settle'].includes(CL.phase)&&CL.phase!='win'){CL.phase='win';CL.pt=0;CL.winI=CL.got.length-1;CL._back=CL._back||'ready'}}
function data(){try{return CL.api.data()}catch(e){return CL._d||(CL._d={})}}
function colCount(){const d=data().col||{};return PRIZES.filter(p=>d[p.id]).length}
function buy(){const have=typeof N!='undefined'?(N.coins||0):0;if(have<BUY_P){fx('clMiss',.5);return}try{earn(-BUY_P)}catch(e){N.coins=have-BUY_P}CL.credits+=BUY_N;fx('clCoin');toReady()}
function endGame(){const a=CL.api;if(a)a.end(CL.score)}
function exit(){try{if(CL.score>0&&CL.phase!='title')CL.api.record(CL.score)}catch(e){}const a=CL.api;if(a)a.exit()}
// ---------- mise à jour ----------
function update(dt,inp){dt=Math.min(dt,.05);inp=inp||{};CL.t+=dt;CL.pt+=dt;const c=CL.claw;
 const n=inp.okN||0,okP=CL.okN!=null&&n>CL.okN;CL.okN=n;if(inp.dirQ&&inp.dirQ.length)inp.dirQ.splice(0);
 // direction : croix tactile + clavier
 let mx=CL.touch.dir.x+(inp.right?1:0)-(inp.left?1:0),mz=CL.touch.dir.z+(inp.up?1:0)-(inp.down?1:0);mx=cl(mx,-1,1);mz=cl(mz,-1,1);CL.mdir={x:mx,z:mz};
 if(okP)big();
 const ph=CL.phase;let moving=false;
 if(ph=='aim'){CL.aimT-=dt;if(mx||mz){const L=Math.hypot(mx,mz);moving=moveGantry(dt,c.gx+mx/L*40,c.gz+mz/L*40,30)}if(CL.aimT<=0){CL.aimT=0;drop()}}
 else if(ph=='open'){c.open=Math.min(1,c.open+dt*1.6);if(CL.pt>.35){CL.phase='drop';CL.pt=0}}
 else if(ph=='grab'){if(CL.pt>.25){CL.phase='close';CL.pt=0;fx('clClose')}}
 else if(ph=='close'){c.grip=1;if(CL.pt>1){CL.phase='rise';CL.pt=0;c.vy=0;fx('clRise')}}
 else if(ph=='rise'){c.vy=Math.min(22,c.vy+dt*45);c.y=Math.min(TOPY,c.y+c.vy*dt);
  if(!CL.lifted){const hp=CL.ps.find(p=>p.touch&&p.y>p.r+3);if(hp)CL.lifted=hp.T}
  if(c.y>=TOPY){CL.phase='home';CL.pt=0;
   // à-coup en haut : la pince se relâche un peu (plus elle est faible, plus elle s'ouvre)
   c.open=Math.min(.5,c.open+(1-c.force)*.62);fx('clJolt');CL.shake=.25}}
 else if(ph=='home'){if(CL.pt>.3){moving=moveGantry(dt,HOME.x,HOME.z,26);if(Math.hypot(c.gx-HOME.x,c.gz-HOME.z)<.05&&Math.abs(c.swx)+Math.abs(c.swz)<.6){CL.phase='release';CL.pt=0;fx('clRelease')}}}
 else if(ph=='release'){c.open=Math.min(.55,c.open+dt*1.2);if(CL.pt>.5){CL.phase='settle';CL.pt=0;c.grip=0}}
 else if(ph=='settle'){const still=CL.ps.every(p=>Math.abs(p.vx)+Math.abs(p.vy)+Math.abs(p.vz)<3);if((CL.pt>.8&&still)||CL.pt>3)finishAttempt()}
 else if(ph=='ready'||ph=='title'||ph=='nocredit'||ph=='col'){// attente : la pince se gare au-dessus de la goulotte
  moving=moveGantry(dt,HOME.x,HOME.z,26);c.open=lerp(c.open,.55,.1);c.y=Math.min(TOPY,c.y+dt*20)}
 else if(ph=='win'){const w=CL.got[CL.winI];if(w){if(w.t==0){fx(w.first?'clWinNew':'clWin',1+w.T.rar*.15,.2);burst(w.T)}w.t+=dt}
  if(CL.pt>4.5)nextWin()}
 if(ph!='close'&&ph!='grab'&&ph!='rise'&&ph!='home')c.grip=0;
 // moteur : bruit du chariot pendant les déplacements
 motor(moving||ph=='drop'||ph=='rise');
 sway(dt);c.rot=-Math.PI/2+c.swx*.03;
 // physique à pas fixes
 CL.acc=(CL.acc||0)+dt;let k=0;while(CL.acc>=DT&&k<SUB*3){substep();CL.acc-=DT;k++}
 if(CL.acc>DT*SUB*3)CL.acc=0;
 // effets
 if(CL.flap){CL.flap.t+=dt;if(CL.flap.t>2.4)CL.flap=null}
 if(CL.shake>0)CL.shake=Math.max(0,CL.shake-dt);if(CL.refill>0)CL.refill-=dt;
 for(const q of CL.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=120*dt;q.l-=dt;q.a+=q.va*dt}CL.parts=CL.parts.filter(q=>q.l>0);
 if(CL.toast){CL.toast.t-=dt;if(CL.toast.t<=0)CL.toast=null}}
// un sous-pas : mouvement de la pince (descente, fermeture) puis physique, avec réaction au contact
function substep(){const c=CL.claw;
 if(CL.phase=='drop')c.y=Math.max(hubMin(c.x,c.z,c.open),c.y-28*DT);
 if(CL.phase=='close'){c.open=Math.max(0,c.open-1.3*DT);c.grip=1}
 // les pointes descendent en se refermant : le sol (ou une plaque) repousse la pince vers le haut, comme un câble qui se détend
 if(CL.phase=='close'||CL.phase=='grab')c.y=Math.max(c.y,hubMin(c.x,c.z,c.open));
 step();
 // la descente s'arrête dès que la pince rencontre une vraie résistance (tas, sol, plaque)
 if(CL.phase=='drop'&&(c.res>1.1||c.y<=hubMin(c.x,c.z,c.open)+1e-3)){CL.phase='grab';CL.pt=0;fx('clStop')}
 // fermeture bloquée par un lot trop gros : le moteur cale (plus la pince est faible, plus tôt)
 if(CL.phase=='close'&&c.res>2.2*(.5+c.force*.5))c.open=Math.min(1,c.open+1.3*DT)}
function nextWin(){CL.winI++;CL.pt=0;if(CL.winI>=CL.got.length){CL.got=[];const b=CL._back;CL._back=null;if(b=='ready'&&CL.phase=='win'){CL.phase=CL.credits>0?'ready':'nocredit';return}afterResult()}}
let MOT=null;function motor(on){try{if(typeof JEUSON=='undefined')return;if(on&&!MOT)MOT=JEUSON.engine();if(MOT)MOT.set(on?70:40,on?.035:0)}catch(e){}}
function burst(T){const L=CL.L;if(!L)return;const cx=L.w/2,cy=L.mach.y+L.mach.h*.42,cols=[RAR[T.rar].c,'#ffffff','#ff4fa3','#7ff3ff','#ffe14f'];
 for(let i=0;i<60;i++){const a=rnd(0,6.28),v=rnd(40,170);CL.parts.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:rnd(1,2.2),c:cols[i%cols.length],a:rnd(0,6),va:rnd(-8,8),s:rnd(1,3)})}}
// bouton principal : JOUER (insère un crédit) / DESCENDRE / continuer
function big(){const ph=CL.phase;if(ph=='title'){fx('clSelect');newGame()}else if(ph=='ready')insert();else if(ph=='aim')drop();else if(ph=='win'){if(CL.pt>.6)nextWin()}
 else if(ph=='nocredit'){if(CL.pt>.6)endGame()}else if(ph=='col'){CL.phase=CL._colBack||'title'}}
// ---------- projection 2.5D : la vitrine vue de face, légèrement en plongée ----------
const KZ=.5,FZ=.2;
function P(x,y,z){const L=CL.L,f=1-FZ*z/WD;return{x:L.cx+(x-WX/2)*L.k*f,y:L.F-z*KZ*L.k-y*L.k*f,s:L.k*f}}
// ---------- mise en page (portrait, paysage, tablette ; recalculée à chaque changement de taille) ----------
function layout(w,h){let cpp=1.4;try{cpp=AX.cv.getBoundingClientRect().width/AX.L.W||1.4}catch(e){}const u=v=>v/cpp;
 const hud=18,L={w,h,hud},land=w>h*1.02;L.land=land;
 const pr=Math.round(cl(u(74),30,Math.min(w,h)*(land?.2:.16))),br=Math.round(cl(u(44),18,pr*.78));
 L.back={x:3,y:2,w:TW('< RETOUR')+10,h:hud-4};L.colB={w:TW(w>=330?'COLLECTION 00/00':'LOTS 00/00')+10,h:hud-4};L.colB.x=w-3-L.colB.w;L.colB.y=2;
 if(land){const cw=Math.round(Math.max(2*pr+28,w*.21));L.mach={x:cw,y:hud+2,w:w-2*cw,h:h-hud-4};
  L.pad={x:Math.round(cw/2),y:Math.round(h-pr-Math.max(14,(h-hud)*.08)),r:pr};L.big={x:w-Math.round(cw/2),y:L.pad.y,r:br};
  const rw=cw-14,rh=Math.round(rw*WD/WX);const room=L.pad.y-pr-16-(hud+16);if(room>=24){const s=Math.min(1,room/rh);L.rad={w:Math.round(rw*s),h:Math.round(rh*s)};L.rad.x=Math.round(cw/2-L.rad.w/2);L.rad.y=hud+14}
  L.side=cw}
 else{const dh=Math.round(cl(Math.max(2*pr+44,h*.26),0,h*.42));L.deck={y:h-dh,h:dh};L.mach={x:2,y:hud+2,w:w-4,h:h-hud-dh-4};
  L.pad={x:Math.round(Math.max(pr+14,w*.22)),y:Math.round(h-dh/2+5),r:pr};L.big={x:Math.round(w-Math.max(br+18,w*.2)),y:L.pad.y,r:br};
  const x0=L.pad.x+pr+14,x1=L.big.x-br-14;let rw=x1-x0,rh=Math.round(rw*WD/WX);if(rh>dh-30){rh=dh-30;rw=Math.round(rh*WX/WD)}if(rw>=40){L.rad={w:rw,h:rh,x:Math.round((x0+x1)/2-rw/2),y:Math.round(L.pad.y-rh/2+4)}}}
 // la machine : fronton + vitrine + socle avec la trappe à lots, à l'échelle de la place disponible
 const M=L.mach,mq=land?13:20,bs=land?18:24,win=Math.ceil(WD*KZ+(TOPY+12)*(1-FZ))+2,tot=mq+win+bs,k=Math.min(M.w/(WX+18),M.h/tot);L.k=k;L.mq=mq;L.bs=bs;L.win=win;
 L.cx=M.x+M.w/2;const y0=M.y+(M.h-tot*k)/2;L.y0=y0;L.F=y0+(mq+win)*k;
 L.cab={x:L.cx-(WX/2+9)*k,y:y0,w:(WX+18)*k,h:tot*k};
 L.glass={x:L.cx-WX/2*k,y:L.F-win*k,w:WX*k,h:win*k};
 CL.L=L;CL.W=w;CL.H=h;CL.cache=null;CL.spr={}}
// ---------- dessins des lots (sphère de rayon 1, centrée) ----------
function eyes(g,dx,y,r,c){g.fillStyle=c||'#2a1530';for(const s of[-1,1]){g.beginPath();g.arc(s*dx,y,r,0,7);g.fill()}g.fillStyle='#ffffff';for(const s of[-1,1]){g.beginPath();g.arc(s*dx-r*.3,y-r*.35,r*.35,0,7);g.fill()}}
function blush(g,dx,y){g.fillStyle='rgba(255,110,150,.55)';for(const s of[-1,1]){g.beginPath();g.ellipse(s*dx,y,.16,.09,0,0,7);g.fill()}}
function ball(g,c,c2,r){r=r||1;const gr=g.createRadialGradient(-.35*r,-.4*r,.1*r,0,0,r);gr.addColorStop(0,c2||'#ffffff');gr.addColorStop(.25,c);gr.addColorStop(1,shade(c,-.35));g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,7);g.fill();g.stroke()}
function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return'#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
const DRAW={
 bear(g,T){g.fillStyle=T.c;for(const s of[-1,1]){g.beginPath();g.arc(s*.68,-.72,.32,0,7);g.fill();g.stroke();g.fillStyle=T.c2;g.beginPath();g.arc(s*.68,-.72,.16,0,7);g.fill();g.fillStyle=T.c}
  ball(g,T.c,shade(T.c,.35));g.fillStyle=T.c2;g.beginPath();g.ellipse(0,.3,.42,.3,0,0,7);g.fill();g.fillStyle='#3a1f10';g.beginPath();g.ellipse(0,.18,.14,.09,0,0,7);g.fill();
  g.beginPath();g.moveTo(0,.25);g.lineTo(0,.38);g.stroke();eyes(g,.34,-.12,.1);blush(g,.55,.15)},
 bunny(g,T){for(const s of[-1,1]){g.fillStyle=T.c;g.beginPath();g.ellipse(s*.34,-1.05,.2,.5,s*.15,0,7);g.fill();g.stroke();g.fillStyle='#ff7fb0';g.beginPath();g.ellipse(s*.34,-1.02,.09,.34,s*.15,0,7);g.fill()}
  ball(g,T.c,'#ffffff');g.fillStyle=T.c2;g.beginPath();g.ellipse(0,.32,.32,.22,0,0,7);g.fill();g.fillStyle='#ff5a9a';g.beginPath();g.ellipse(0,.2,.09,.06,0,0,7);g.fill();eyes(g,.32,-.08,.1);blush(g,.56,.18)},
 chick(g,T){g.fillStyle=T.c;g.beginPath();g.ellipse(-.08,-1,.12,.22,-.4,0,7);g.fill();g.beginPath();g.ellipse(.1,-.98,.1,.18,.4,0,7);g.fill();
  ball(g,T.c,'#fff6c0');g.fillStyle=shade(T.c,-.12);for(const s of[-1,1]){g.beginPath();g.ellipse(s*.82,.22,.2,.32,s*.5,0,7);g.fill()}
  g.fillStyle=T.c2;g.beginPath();g.moveTo(-.16,.05);g.lineTo(.16,.05);g.lineTo(0,.3);g.closePath();g.fill();g.stroke();eyes(g,.3,-.18,.1);blush(g,.5,.1)},
 frog(g,T){ball(g,T.c,shade(T.c,.4));for(const s of[-1,1]){g.fillStyle=T.c;g.beginPath();g.arc(s*.45,-.78,.3,0,7);g.fill();g.stroke();g.fillStyle='#ffffff';g.beginPath();g.arc(s*.45,-.8,.2,0,7);g.fill();g.fillStyle='#2a1530';g.beginPath();g.arc(s*.45,-.78,.1,0,7);g.fill()}
  g.fillStyle=T.c2;g.beginPath();g.ellipse(0,.42,.55,.4,0,0,3.15);g.fill();g.lineWidth*=1.2;g.beginPath();g.arc(0,.05,.42,.35,2.8);g.stroke();blush(g,.6,.1)},
 box(g,T){const s=.86;g.fillStyle=T.c;g.beginPath();g.rect(-s,-s,2*s,2*s);g.fill();g.stroke();g.fillStyle=shade(T.c,-.25);g.fillRect(-s,s*.5,2*s,s*.5);
  if(T.id=='boite'){g.fillStyle='#ffffff';for(const[a,b]of[[-.5,-.5],[.5,.45],[-.45,.5],[.45,-.55]]){star(g,a,b,.14)}}
  g.fillStyle=T.c2;g.fillRect(-.14,-s,.28,2*s);g.fillRect(-s,-.14,2*s,.28);g.beginPath();g.ellipse(-.25,-s-.12,.24,.15,-.4,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(.25,-s-.12,.24,.15,.4,0,7);g.fill();g.stroke()},
 cat(g,T){g.fillStyle=T.c;for(const s of[-1,1]){g.beginPath();g.moveTo(s*.25,-.85);g.lineTo(s*.85,-1.12);g.lineTo(s*.8,-.45);g.closePath();g.fill();g.stroke();g.fillStyle='#ffb0c8';g.beginPath();g.moveTo(s*.4,-.8);g.lineTo(s*.76,-.98);g.lineTo(s*.72,-.6);g.closePath();g.fill();g.fillStyle=T.c}
  ball(g,T.c,T.c2);g.fillStyle=T.c2;g.beginPath();g.ellipse(0,.32,.4,.28,0,0,7);g.fill();g.fillStyle='#ff6a9a';g.beginPath();g.moveTo(-.08,.16);g.lineTo(.08,.16);g.lineTo(0,.25);g.closePath();g.fill();
  g.beginPath();for(const s of[-1,1]){g.moveTo(s*.25,.3);g.lineTo(s*.8,.22);g.moveTo(s*.25,.36);g.lineTo(s*.8,.42)}g.stroke();eyes(g,.32,-.1,.11,'#1a3a6a')},
 penguin(g,T){ball(g,T.c,'#5a6a9a');g.fillStyle=T.c2;g.beginPath();g.ellipse(0,.2,.62,.72,0,0,7);g.fill();g.beginPath();g.ellipse(-.25,-.3,.26,.3,0,0,7);g.fill();g.beginPath();g.ellipse(.25,-.3,.26,.3,0,0,7);g.fill();
  g.fillStyle='#ff9a2e';g.beginPath();g.moveTo(-.14,-.08);g.lineTo(.14,-.08);g.lineTo(0,.1);g.closePath();g.fill();g.beginPath();g.ellipse(-.3,.92,.2,.09,0,0,7);g.fill();g.beginPath();g.ellipse(.3,.92,.2,.09,0,0,7);g.fill();eyes(g,.25,-.3,.08);blush(g,.45,.0)},
 unicorn(g,T){g.fillStyle='#ffd23a';g.beginPath();g.moveTo(-.13,-.85);g.lineTo(.13,-.85);g.lineTo(.04,-1.42);g.closePath();g.fill();g.stroke();g.strokeStyle='#c99a10';g.beginPath();g.moveTo(-.08,-1);g.lineTo(.1,-1.05);g.moveTo(-.04,-1.17);g.lineTo(.08,-1.2);g.stroke();g.strokeStyle='#2a1530';
  ball(g,T.c,'#ffffff');const M=['#ff8ad0','#b46bff','#7ff3ff','#ffe14f'];M.forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.ellipse(.55-i*.05,-.55+i*.28,.26,.17,.9,0,7);g.fill()});
  g.fillStyle='#ffd8ec';g.beginPath();g.ellipse(-.1,.38,.38,.25,0,0,7);g.fill();g.fillStyle='#c98aa8';g.beginPath();g.arc(-.22,.38,.04,0,7);g.arc(.02,.38,.04,0,7);g.fill();
  g.lineWidth*=1.3;g.beginPath();g.arc(-.42,-.12,.1,3.4,6);g.arc(.15,-.12,.1,3.4,6);g.stroke();blush(g,.5,.12)},
 octo(g,T){g.fillStyle=shade(T.c,-.15);for(let i=0;i<5;i++){const a=.45+i*.56;g.beginPath();g.ellipse(Math.cos(a)*.75,Math.sin(a)*.65+.2,.22,.32,a-1.57,0,7);g.fill();g.stroke()}
  ball(g,T.c,T.c2);g.fillStyle=T.c2;for(const[a,b,r]of[[-.4,-.55,.1],[.1,-.7,.07],[.5,-.45,.08]]){g.beginPath();g.arc(a,b,r,0,7);g.fill()}eyes(g,.32,0,.13);g.beginPath();g.arc(0,.25,.12,.2,2.9);g.stroke();blush(g,.6,.25)},
 star(g,T){g.fillStyle=T.c;star(g,0,.05,1.12,true);const gr=g.createRadialGradient(-.3,-.3,0,0,0,1);gr.addColorStop(0,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;star(g,0,.05,1.12);
  eyes(g,.25,0,.1);g.beginPath();g.arc(0,.18,.14,.3,2.8);g.stroke();blush(g,.45,.2)},
 egg(g,T){const gr=g.createRadialGradient(-.3,-.45,.05,0,0,1.1);gr.addColorStop(0,'#fffbe0');gr.addColorStop(.3,T.c);gr.addColorStop(1,'#a86a00');g.fillStyle=gr;g.beginPath();g.ellipse(0,.05,.82,1,0,0,7);g.fill();g.stroke();
  g.strokeStyle='#ffffff';g.lineWidth*=.9;g.beginPath();g.moveTo(-.78,-.05);for(let i=0;i<=8;i++)g.lineTo(-.78+i*.195,i%2?.12:-.08);g.stroke();g.strokeStyle='#2a1530';
  g.fillStyle='#ff8ad0';for(const[a,b]of[[-.35,.45],[.3,.5],[0,-.5]]){g.beginPath();g.arc(a,b,.1,0,7);g.fill()}g.fillStyle='rgba(255,255,255,.85)';star(g,-.35,-.45,.13)}};
function star(g,x,y,r,stroke){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.48:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath();g.fill();if(stroke)g.stroke()}
// sprite en cache pour un lot à une taille donnée (pixels) ; sil = silhouette (collection non découverte)
function sprite(T,px,sil){const k=T.id+'|'+px+'|'+(sil?1:0);let c=CL.spr[k];if(c)return c;const S=Math.ceil(px*3.2)+4;c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
 g.translate(S/2,S/2+px*.15);g.scale(px,px);g.lineWidth=Math.max(1.1,px*.09)/px;g.lineJoin='round';g.strokeStyle='#2a1530';try{DRAW[T.f](g,T)}catch(e){ball(g,T.c)}
 if(sil){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#2a2448';g.fillRect(0,0,S,S)}c.off=S/2;c.offy=S/2+px*.15;CL.spr[k]=c;return c}
function drawPrize(x,T,sx,sy,pr,rot,a){const px=Math.max(2,Math.round(pr)),c=sprite(T,px);x.save();x.translate(Math.round(sx),Math.round(sy));if(rot)x.rotate(rot);if(a!=null)x.globalAlpha=a;x.drawImage(c,-c.off,-c.offy);x.restore()}
// ---------- rendu de la machine ----------
function bake(){const L=CL.L,c=document.createElement('canvas');c.width=L.w;c.height=L.h;const x=c.getContext('2d'),k=L.k,C=L.cab,G=L.glass;
 // carrosserie : rose bonbon et violet, flancs arrondis
 const gr=x.createLinearGradient(C.x,0,C.x+C.w,0);gr.addColorStop(0,'#7a1f6e');gr.addColorStop(.08,'#ff4fa3');gr.addColorStop(.5,'#ff79bd');gr.addColorStop(.92,'#ff4fa3');gr.addColorStop(1,'#7a1f6e');
 x.fillStyle='#1a0820';rr(x,C.x-2,C.y-2,C.w+4,C.h+4,6*k);x.fill();x.fillStyle=gr;rr(x,C.x,C.y,C.w,C.h,5*k);x.fill();
 // fronton
 const mq={x:C.x+3*k,y:C.y+2*k,w:C.w-6*k,h:L.mq*k-4*k};x.fillStyle='#2a0f3a';rr(x,mq.x,mq.y,mq.w,mq.h,3*k);x.fill();const mg=x.createLinearGradient(0,mq.y,0,mq.y+mq.h);mg.addColorStop(0,'#4a1a78');mg.addColorStop(1,'#22093a');x.fillStyle=mg;rr(x,mq.x+2,mq.y+2,mq.w-4,mq.h-4,3*k);x.fill();L.mqR=mq;
 // intérieur de la vitrine : mur du fond, parois, sol
 const p=(a,b,cz)=>P(a,b,cz),poly=(pts,col)=>{x.fillStyle=col;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y));x.closePath();x.fill()};
 x.save();x.beginPath();x.rect(G.x,G.y,G.w,G.h);x.clip();x.fillStyle='#14082a';x.fillRect(G.x,G.y,G.w,G.h);
 const b0=p(0,0,WD),b1=p(WX,0,WD),b2=p(WX,TOPY+30,WD),b3=p(0,TOPY+30,WD);const bg=x.createLinearGradient(0,b2.y,0,b0.y);bg.addColorStop(0,'#3a1866');bg.addColorStop(1,'#7a2f9e');poly([b0,b1,b2,b3],bg);
 // décor du fond : étoiles et cœurs pastel
 x.save();x.beginPath();x.moveTo(b0.x,b0.y);x.lineTo(b1.x,b1.y);x.lineTo(b2.x,b2.y);x.lineTo(b3.x,b3.y);x.closePath();x.clip();
 for(let i=0;i<26;i++){const u=(i*37%100)/100,v=(i*61%100)/100,q=p(4+u*92,6+v*(TOPY+10),WD);x.fillStyle=['#ff9ad0','#7ff3ff','#ffe14f','#c9a6ff'][i%4];x.globalAlpha=.35;star(x,q.x,q.y,(1.4+(i%3))*k);x.globalAlpha=1}
 x.globalAlpha=.25;for(let i=0;i<6;i++){const q=p(0,(i+.5)*(TOPY+10)/6,WD),q2=p(WX,(i+.5)*(TOPY+10)/6,WD);x.fillStyle='#ff9ad0';x.fillRect(q.x,q.y,q2.x-q.x,Math.max(1,k*.4))}x.globalAlpha=1;x.restore();
 const lw=x.createLinearGradient(G.x,0,b0.x,0);lw.addColorStop(0,'#2a0f4a');lw.addColorStop(1,'#4a1f7a');poly([p(0,0,0),b0,b3,p(0,TOPY+60,0)],lw);
 const rw=x.createLinearGradient(G.x+G.w,0,b1.x,0);rw.addColorStop(0,'#2a0f4a');rw.addColorStop(1,'#4a1f7a');poly([p(WX,0,0),b1,b2,p(WX,TOPY+60,0)],rw);
 const fl=x.createLinearGradient(0,b0.y,0,L.F);fl.addColorStop(0,'#5a2a7a');fl.addColorStop(1,'#8a4aa8');poly([p(0,0,0),p(WX,0,0),b1,b0],fl);
 // damier du sol
 x.globalAlpha=.12;for(let i=0;i<10;i++)for(let j=0;j<6;j++)if((i+j)%2){const a=p(i*10,0,j*WD/6),b=p(i*10+10,0,j*WD/6),cc=p(i*10+10,0,(j+1)*WD/6),d=p(i*10,0,(j+1)*WD/6);poly([a,b,cc,d],'#ffffff')}x.globalAlpha=1;
 // trou de la goulotte
 const h0=p(0,0,0),h1=p(CHX,0,0),h2=p(CHX,0,CHZ),h3=p(0,0,CHZ);const hg=x.createLinearGradient(0,h3.y,0,h0.y);hg.addColorStop(0,'#050208');hg.addColorStop(1,'#1a0a24');poly([h0,h1,h2,h3],hg);
 x.fillStyle='#ffe14f';x.globalAlpha=.6;for(let i=0;i<6;i++){const a=p(CHX*i/6,0,CHZ),b=p(CHX*(i+.5)/6,0,CHZ);x.fillRect(a.x,a.y-1,b.x-a.x,Math.max(1,k*.5))}x.globalAlpha=1;
 x.restore();
 // socle : trappe à lots sous la goulotte, panneau des crédits
 const F=L.F,bs=L.bs*k;x.fillStyle='#2a0f3a';x.fillRect(C.x+3*k,F,C.w-6*k,bs-3*k);const sg=x.createLinearGradient(0,F,0,F+bs);sg.addColorStop(0,'#5a1f7a');sg.addColorStop(1,'#33104a');x.fillStyle=sg;x.fillRect(C.x+4*k,F+1,C.w-8*k,bs-5*k);
 const fa=P(3,0,0).x,fb=P(CHX-3,0,0).x;L.flapR={x:fa,y:F+bs*.22,w:fb-fa,h:bs*.58};x.fillStyle='#ffe14f';rr(x,fa-2,L.flapR.y-2,L.flapR.w+4,L.flapR.h+4,2*k);x.fill();x.fillStyle='#0a0410';rr(x,fa,L.flapR.y,L.flapR.w,L.flapR.h,2*k);x.fill();
 const sc=k>=2.2?1:1;CT(x,'PRIX',fa+L.flapR.w/2,L.flapR.y-9>F+1?L.flapR.y-9:F+2,'#ffe14f',sc,'#2a0f3a');
 const dx0=P(CHX+12,0,0).x,dx1=P(WX-4,0,0).x;L.credR={x:dx0,y:F+bs*.22,w:dx1-dx0,h:bs*.58};x.fillStyle='#05020a';rr(x,dx0,L.credR.y,L.credR.w,L.credR.h,2*k);x.fill();x.strokeStyle='#ff4fa3';x.lineWidth=1;rr(x,dx0+.5,L.credR.y+.5,L.credR.w-1,L.credR.h-1,2*k);x.stroke();
 // cadre de la vitrine
 x.strokeStyle='#1a0820';x.lineWidth=Math.max(2,k*1.2);x.strokeRect(G.x-1,G.y-1,G.w+2,G.h+2);
 CL.cache=c}
function rr(x,X,Y,W,H,r){r=Math.min(r,W/2,H/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
// hauteur du tas sous l'axe de la pince (pour l'ombre et le viseur laser)
function groundUnder(x0,z0){let h=inHole(x0,z0)?-20:0;for(const p of CL.ps){const d=Math.hypot(p.x-x0,p.z-z0);if(d<p.r){const y=p.y+Math.sqrt(p.r*p.r-d*d);if(y>h)h=y}}return h}
function drawClawPart(x,f,front){const a=P(f.j.x,f.j.y,f.j.z),b=P(f.k.x,f.k.y,f.k.z),c=P(f.t.x,f.t.y,f.t.z),w=Math.max(2,CR*2*a.s);
 x.lineCap='round';x.lineJoin='round';x.strokeStyle='#1a1424';x.lineWidth=w+2;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.lineTo(c.x,c.y);x.stroke();
 x.strokeStyle=front?'#c9d0e0':'#8a90a8';x.lineWidth=w;x.stroke();x.strokeStyle=front?'#ffffff':'#b8bed0';x.lineWidth=Math.max(1,w*.35);x.beginPath();x.moveTo(a.x-w*.15,a.y-w*.15);x.lineTo(b.x-w*.15,b.y-w*.15);x.stroke();
 // articulation et griffe caoutchoutée
 x.fillStyle='#5a6078';x.beginPath();x.arc(b.x,b.y,w*.55,0,7);x.fill();x.fillStyle='#ff4fa3';x.beginPath();x.arc(c.x,c.y,w*.5,0,7);x.fill()}
function drawHub(x,c){const top=P(c.gx,TOPY+10,c.gz),h=P(c.x,c.y,c.z),s=h.s;
 // câble
 x.strokeStyle='#d6dbe6';x.lineWidth=Math.max(1,s*.5);x.beginPath();x.moveTo(top.x,top.y);x.lineTo(h.x,h.y-9*s);x.stroke();
 // corps de la pince (cylindre chromé) et anneau lumineux
 const w=HR*2*s,hh=9*s;const g=x.createLinearGradient(h.x-w/2,0,h.x+w/2,0);g.addColorStop(0,'#5a6078');g.addColorStop(.35,'#f0f4ff');g.addColorStop(1,'#4a4e66');
 x.fillStyle='#1a1424';rr(x,h.x-w/2-1,h.y-hh-1,w+2,hh+2,s*1.5);x.fill();x.fillStyle=g;rr(x,h.x-w/2,h.y-hh,w,hh,s*1.2);x.fill();
 const on=Math.floor(CL.t*6)%2;x.fillStyle=CL.phase=='aim'?(on?'#7ff3ff':'#38b6ff'):'#ff4fa3';x.fillRect(h.x-w/2,h.y-hh*.42,w,Math.max(1,s*.9));
 x.fillStyle='#8a90a8';x.beginPath();x.ellipse(h.x,h.y,w*.5,w*.16,0,0,7);x.fill()}
function drawGantry(x,c){const L=CL.L,k=L.k,y=TOPY+10,ray=(z,col)=>{const a=P(0,y,z),b=P(WX,y,z);x.fillStyle=col;x.fillRect(a.x,a.y-k*.8,b.x-a.x,k*1.6)};
 // rails latéraux (profondeur) et traverse mobile
 for(const X of[1,WX-1]){const a=P(X,y,0),b=P(X,y,WD);x.strokeStyle='#2a2438';x.lineWidth=k*2;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.strokeStyle='#9aa0b8';x.lineWidth=k*.8;x.stroke()}
 ray(c.gz,'#2a2438');ray(c.gz,'#2a2438');const a=P(0,y,c.gz),b=P(WX,y,c.gz);x.fillStyle='#b8bed0';x.fillRect(a.x,a.y-k*.4,b.x-a.x,Math.max(1,k*.6));
 const t=P(c.gx,y,c.gz);x.fillStyle='#1a1424';x.fillRect(t.x-4*k,t.y-2.4*k,8*k,4.8*k);x.fillStyle='#ff4fa3';x.fillRect(t.x-3.4*k,t.y-1.8*k,6.8*k,3.6*k);x.fillStyle='#ffd0ea';x.fillRect(t.x-3.4*k,t.y-1.8*k,6.8*k,Math.max(1,k*.7))}
function drawWalls(x,front){// plaques de plexiglas de la goulotte (translucides)
 const q=(pts)=>{x.beginPath();pts.forEach((v,i)=>{const p=P(v[0],v[1],v[2]);i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y)});x.closePath()};
 x.fillStyle='rgba(150,230,255,.22)';x.strokeStyle='rgba(200,245,255,.85)';x.lineWidth=1;
 if(!front){q([[0,0,CHZ],[CHX+CHT,0,CHZ],[CHX+CHT,CHH,CHZ],[0,CHH,CHZ]]);x.fill();x.stroke()}
 else{q([[CHX,0,0],[CHX,0,CHZ],[CHX,CHH,CHZ],[CHX,CHH,0]]);x.fill();x.stroke();const a=P(CHX,CHH,0),b=P(CHX,CHH,CHZ);x.strokeStyle='#ffffff';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}
function drawMachine(x){const L=CL.L,G=L.glass,c=CL.claw,t=CL.t,k=L.k;if(!CL.cache)bake();
 let sh=0;if(CL.shake>0)sh=Math.round(Math.sin(t*70)*CL.shake*4);x.drawImage(CL.cache,0,0);
 x.save();x.beginPath();x.rect(G.x,G.y,G.w,G.h);x.clip();if(sh)x.translate(sh,0);
 // ombre portée de la pince + viseur
 const gy=groundUnder(c.x,c.z),aim=CL.phase=='aim'||CL.phase=='open'||CL.phase=='drop';
 {const s=P(c.x,Math.max(0,gy),c.z),r=(c.open*12+4)*s.s;x.fillStyle='rgba(10,0,20,.35)';x.beginPath();x.ellipse(s.x,s.y,r,r*KZ*.9,0,0,7);x.fill()}
 drawWalls(x,false);
 // lots + doigts triés de l'arrière vers l'avant
 const F=fingers(c),items=[];for(const p of CL.ps)items.push({z:p.z,y:p.y,f:()=>{const q=P(p.x,p.y,p.z);drawPrize(x,p.T,q.x,q.y,p.r*q.s,p.rot)}});
 F.forEach(f=>{const z=(f.k.z+f.t.z)/2,fr=f.k.z<c.z-.5;items.push({z:fr?z-.01:z+3,y:f.k.y,f:()=>drawClawPart(x,f,fr)})});
 items.push({z:c.z+.02,y:c.y+50,f:()=>drawHub(x,c)});
 items.push({z:CHZ/2,y:-1,f:()=>drawWalls(x,true)});
 items.sort((a,b)=>b.z-a.z||a.y-b.y);drawGantry(x,c);items.forEach(o=>o.f());
 // viseur laser : faisceau du moyeu jusqu'au point visé
 if(aim){const a=P(c.x,c.y-tipDepth(c.open)+2,c.z),b=P(c.x,Math.max(0,gy),c.z);x.globalAlpha=.35+.15*Math.sin(t*10);x.strokeStyle='#ff3b5a';x.lineWidth=1;x.setLineDash([2,2]);x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.setLineDash([]);
  x.globalAlpha=.9;x.fillStyle='#ff3b5a';x.beginPath();x.ellipse(b.x,b.y,2.2*b.s*.6+1,1.2*b.s*.4+1,0,0,7);x.fill();x.globalAlpha=1}
 // reflets de la vitrine
 x.globalAlpha=.07;x.fillStyle='#ffffff';x.beginPath();x.moveTo(G.x+G.w*.08,G.y);x.lineTo(G.x+G.w*.28,G.y);x.lineTo(G.x+G.w*.06,G.y+G.h);x.lineTo(G.x-G.w*.14,G.y+G.h);x.closePath();x.fill();
 x.globalAlpha=.05;x.beginPath();x.moveTo(G.x+G.w*.36,G.y);x.lineTo(G.x+G.w*.42,G.y);x.lineTo(G.x+G.w*.2,G.y+G.h);x.lineTo(G.x+G.w*.14,G.y+G.h);x.closePath();x.fill();x.globalAlpha=1;
 // éclairage d'ambiance qui respire
 x.globalAlpha=.06+.04*Math.sin(t*1.7);x.fillStyle=['#ff4fa3','#7ff3ff','#ffe14f','#b46bff'][Math.floor(t/2.5)%4];x.fillRect(G.x,G.y,G.w,G.h*.3);x.globalAlpha=1;
 x.restore();
 // néons LED autour de la vitrine : chenillard
 const leds=[],per=2*(G.w+G.h),n=Math.max(16,Math.floor(per/(4*k+3)));for(let i=0;i<n;i++){let d=i/n*per,X,Y;if(d<G.w){X=G.x+d;Y=G.y-3}else if((d-=G.w)<G.h){X=G.x+G.w+3;Y=G.y+d}else if((d-=G.h)<G.w){X=G.x+G.w-d;Y=G.y+G.h+3}else{d-=G.w;X=G.x-3;Y=G.y+G.h-d}leds.push([X,Y])}
 const mode=CL.phase=='win'?2:CL.phase=='aim'?1:0;leds.forEach(([X,Y],i)=>{const ph=mode==2?(Math.floor(t*12)+i)%3==0:mode==1?(Math.floor(t*10)-i%n+n*99)%8<3:(Math.floor(t*4)+i)%4==0;
  const col=['#ff4fa3','#7ff3ff','#ffe14f','#b46bff'][(i+(mode==2?Math.floor(t*8):0))%4];x.fillStyle=ph?col:'#3a1a4a';const s=Math.max(1,Math.round(k*.9));x.fillRect(Math.round(X-s/2),Math.round(Y-s/2),s,s)});
 // fronton : LUCKY CLAW lumineux et ampoules
 const mq=L.mqR;if(mq){const sc=Math.max(1,Math.min(Math.floor((mq.h-4)/9),Math.floor((mq.w-10)/TW('LUCKY CLAW')))),ty=Math.round(mq.y+(mq.h-7*sc)/2);
  const glow=['#ffe14f','#ff9ad0','#7ff3ff'][Math.floor(t*1.5)%3];CT(x,'LUCKY CLAW',mq.x+mq.w/2,ty,'#ffffff',sc,'#ff4fa3');if(Math.floor(t*3)%2){x.globalAlpha=.35;CT(x,'LUCKY CLAW',mq.x+mq.w/2,ty,glow,sc);x.globalAlpha=1}
  const nb=Math.max(6,Math.floor(mq.w/(5*k)));for(let i=0;i<nb;i++){const X=mq.x+4+i*(mq.w-8)/(nb-1),on=(Math.floor(t*6)+i)%3==0;x.fillStyle=on?'#fff3a0':'#6a4a20';x.beginPath();x.arc(X,mq.y+2,Math.max(1,k*.7),0,7);x.arc(X,mq.y+mq.h-2,Math.max(1,k*.7),0,7);x.fill()}}
 // afficheur des crédits (socle)
 const cr=L.credR;if(cr&&cr.h>=9){const s=cr.h>=20&&cr.w>=TW('CREDITS 00',2)+6?2:1,txt=pad(CL.credits,2);x.save();x.beginPath();x.rect(cr.x,cr.y,cr.w,cr.h);x.clip();
  if(cr.w>=TW('CRÉDITS '+txt,s)+6)CT(x,'CRÉDITS '+txt,cr.x+cr.w/2,Math.round(cr.y+(cr.h-7*s)/2),CL.credits?'#ff4fa3':'#ff2a40',s);else CT(x,txt,cr.x+cr.w/2,Math.round(cr.y+(cr.h-7*s)/2),'#ff4fa3',s);x.restore()}
 // trappe : le lot gagné sort en rebondissant
 const fl=CL.flap;if(fl&&L.flapR){const r=L.flapR,u=Math.min(1,fl.t/.5),bounce=Math.abs(Math.sin(fl.t*7))*Math.max(0,1-fl.t/1.4)*r.h*.4,px=Math.min(r.h*.42,fl.T.r*k*.9);
  x.save();x.beginPath();x.rect(r.x-px*2,r.y-px*2.5,r.w+px*4,r.h+px*2.5);x.clip();drawPrize(x,fl.T,r.x+r.w/2,r.y+r.h-px-1-bounce-(1-u)*r.h*.6,px,fl.rot+fl.t*2);x.restore();
  x.globalAlpha=Math.max(0,1-fl.t/2);x.strokeStyle=RAR[fl.T.rar].c;x.lineWidth=2;x.strokeRect(r.x-2,r.y-2,r.w+4,r.h+4);x.globalAlpha=1}}
// ---------- interface : barre du haut, pupitre, vue du dessus ----------
function btnRect(x,b,lab,col,on){x.fillStyle=on?'#ffffff':'#1a0f2e';rr(x,b.x,b.y,b.w,b.h,3);x.fill();x.strokeStyle=col;x.lineWidth=1;rr(x,b.x+.5,b.y+.5,b.w-1,b.h-1,3);x.stroke();CT(x,lab,b.x+b.w/2,Math.round(b.y+(b.h-7)/2),on?'#1a0f2e':col)}
function hud(x,L){R(x,0,0,L.w,L.hud,'#12081f');R(x,0,L.hud-1,L.w,1,'#ff4fa3');btnRect(x,L.back,'< RETOUR','#7ff3ff',CL.touch.btn=='back');
 const n=colCount(),cs=(L.w>=330?'COLLECTION ':'LOTS ')+pad(n,2)+'/'+NP;btnRect(x,L.colB,L.colB.w>=TW(cs)+8?cs:pad(n,2)+'/'+NP,'#ffe14f',CL.touch.btn=='col');
 const mid=(L.back.x+L.back.w+L.colB.x)/2,y=Math.round((L.hud-7)/2),sp=L.colB.x-(L.back.x+L.back.w)-8;
 const s1='SCORE '+pad(CL.score,4),s2='CRÉDITS '+CL.credits;if(TW(s1+'  '+s2)<=sp){const w=TW(s1+'  '+s2),X=Math.round(mid-w/2);T_(x,'SCORE ',X,y,'#9fb0e8');T_(x,pad(CL.score,4),X+TW('SCORE '),y,'#ffe14f');T_(x,'CRÉDITS ',X+TW(s1+'  '),y,'#9fb0e8');T_(x,String(CL.credits),X+TW(s1+'  CRÉDITS '),y,CL.credits?'#ff9ad0':'#ff2a40')}
 else if(TW(pad(CL.score,4)+' C'+CL.credits)<=sp){CT(x,pad(CL.score,4)+' ·'+CL.credits,mid,y,'#ffe14f')}}
function deck(x,L){if(!L.land){const d=L.deck;const g=x.createLinearGradient(0,d.y,0,L.h);g.addColorStop(0,'#2a0f3a');g.addColorStop(1,'#14061e');x.fillStyle=g;x.fillRect(0,d.y,L.w,d.h);R(x,0,d.y,L.w,1,'#ff4fa3');x.globalAlpha=.3;for(let i=0;i<L.w;i+=6)R(x,i,d.y+3,3,1,'#ff4fa3');x.globalAlpha=1}
 else{for(const X of[0,L.w-L.side]){const g=x.createLinearGradient(X,0,X+L.side,0);g.addColorStop(0,'#14061e');g.addColorStop(1,'#2a0f3a');x.fillStyle=g;x.fillRect(X,L.hud,L.side,L.h-L.hud)}R(x,L.side-1,L.hud,1,L.h,'#ff4fa3');R(x,L.w-L.side,L.hud,1,L.h,'#ff4fa3')}
 drawPad(x,L.pad);drawBig(x,L.big);if(L.rad)radar(x,L.rad)}
function drawPad(x,J){const d=CL.mdir||{x:0,z:0},r=J.r,a=Math.round(r*.62/2)*2+1,h=(a-1)/2,cx=J.x,cy=J.y,active=CL.phase=='aim';
 x.globalAlpha=.5;x.fillStyle='#000';x.beginPath();x.arc(cx,cy+4,r+6,0,7);x.fill();x.globalAlpha=1;x.fillStyle='#1a0f2e';x.beginPath();x.arc(cx,cy,r+6,0,7);x.fill();x.strokeStyle='#ff4fa3';x.lineWidth=1;x.beginPath();x.arc(cx,cy,r+5.5,0,7);x.stroke();
 const arm=(dx,dy,on)=>{const o=on?1:0,X=dx?(dx>0?cx+h:cx-r):cx-h,Y=dy?(dy>0?cy+h:cy-r):cy-h,W=dx?r-h:a,H=dy?r-h:a;R(x,X-1,Y-1+o,W+2,H+2,'#05020a');R(x,X,Y+o,W,H,on?'#ff4fa3':active?'#4a2a6a':'#33224a');if(!on)R(x,X,Y,W,1,'#7a5aa0');
  const tx=cx+dx*r*.62,ty=cy+dy*r*.62+o,n=Math.max(2,Math.round(a*.3));for(let i=0;i<n;i++){const l=(n-i)*2-1;if(dx)R(x,tx+dx*(i-n/2),ty-(l-1)/2,1,l,on?'#ffffff':'#c9b0ff');else R(x,tx-(l-1)/2,ty+dy*(i-n/2),l,1,on?'#ffffff':'#c9b0ff')}};
 R(x,cx-h-2,cy-r-2,a+4,2*r+4,'#05020a');R(x,cx-r-2,cy-h-2,2*r+4,a+4,'#05020a');arm(-1,0,d.x<0);arm(1,0,d.x>0);arm(0,-1,d.z>0);arm(0,1,d.z<0);R(x,cx-h,cy-h,a,a,'#4a2a6a');
 x.fillStyle='#2a1a40';x.beginPath();x.arc(cx,cy,Math.max(2,a*.22),0,7);x.fill();
 // étiquettes AVANT / ARRIÈRE (profondeur), GAUCHE / DROITE
 const lc=active?'#ffd0ea':'#8a6aa8';if(cy-r-17>CL.L.hud)CT(x,'AVANT',cx,cy-r-16,lc);if(cy+r+16<CL.H)CT(x,'ARRIÈRE',cx,cy+r+9,lc)}
function drawBig(x,b){const pr=CL.touch.big!=null?2:0,ph=CL.phase,lab=ph=='ready'||ph=='title'?'JOUER':ph=='aim'?'DESCENDRE':ph=='nocredit'?'TERMINER':ph=='win'?'OK':'...',live=ph=='ready'||ph=='aim'||ph=='title'||ph=='win'||ph=='nocredit';
 const c=ph=='ready'||ph=='title'?['#2fd36a','#167a3a','#b8ffd0']:['#ff3348','#9a1426','#ffb0b8'],pulse=live&&(ph=='ready'||ph=='title')?Math.sin(CL.t*6)*.5+.5:0;
 if(pulse){x.globalAlpha=.25*pulse;x.fillStyle=c[0];x.beginPath();x.arc(b.x,b.y,b.r+5+pulse*3,0,7);x.fill();x.globalAlpha=1}
 x.fillStyle='#05020a';x.beginPath();x.arc(b.x,b.y+4,b.r+2,0,7);x.fill();x.fillStyle='#c8ccd8';x.beginPath();x.arc(b.x,b.y+1,b.r+2,0,7);x.fill();
 x.fillStyle=live?c[1]:'#4a3a50';x.beginPath();x.arc(b.x,b.y+2,b.r,0,7);x.fill();x.fillStyle=live?c[0]:'#6a5a70';x.beginPath();x.arc(b.x,b.y-2+pr,b.r-1,0,7);x.fill();
 x.globalAlpha=.5;x.fillStyle=live?c[2]:'#8a7a90';x.beginPath();x.ellipse(b.x-b.r*.3,b.y-b.r*.4+pr,b.r*.35,b.r*.2,-.5,0,7);x.fill();x.globalAlpha=1;
 // flèche vers le bas dessinée sur le bouton DESCENDRE
 if(ph=='aim'){const s=Math.max(3,Math.round(b.r*.32));for(let i=0;i<s;i++)R(x,b.x-(s-i),b.y-2+pr+i,(s-i)*2,1,'#ffffff');R(x,b.x-Math.round(s/3),b.y-2+pr-s,Math.round(s/3)*2,s,'#ffffff')}
 CT(x,lab,b.x,b.y+b.r+7,live?'#ffffff':'#8a7a90');
 if(ph=='aim'){const s=Math.ceil(CL.aimT),c2=s<=5&&Math.floor(CL.t*4)%2?'#ff3348':'#ffe14f';CT(x,String(s),b.x,b.y-b.r-16,c2,1)}}
function radar(x,R0){const s=R0.w/WX,c=CL.claw;x.fillStyle='#05020a';x.fillRect(R0.x-2,R0.y-2,R0.w+4,R0.h+4);x.fillStyle='#1a0a2a';x.fillRect(R0.x,R0.y,R0.w,R0.h);
 const X=v=>R0.x+v*s,Y=v=>R0.y+R0.h-v*s;// z = 0 (vitre avant) en bas
 x.fillStyle='#000';x.fillRect(X(0),Y(CHZ),CHX*s,CHZ*s);x.strokeStyle='#7ff3ff';x.lineWidth=1;x.strokeRect(X(0)+.5,Y(CHZ)+.5,CHX*s,CHZ*s);
 for(const p of CL.ps){x.fillStyle=RAR[p.T.rar].c;x.beginPath();x.arc(X(p.x),Y(p.z),Math.max(1.2,p.r*s*.8),0,7);x.fill()}
 const on=Math.floor(CL.t*5)%2;x.strokeStyle=on?'#ff3b5a':'#ffffff';x.beginPath();x.arc(X(c.x),Y(c.z),Math.max(2,6*s),0,7);x.stroke();x.fillStyle='#ff3b5a';x.fillRect(Math.round(X(c.x))-1,Math.round(Y(c.z))-1,2,2);
 if(R0.y-9>(CL.L.land?CL.L.hud:CL.L.deck.y))CT(x,'VUE DU DESSUS',R0.x+R0.w/2,R0.y-9,'#8a6aa8');if(CL.L.land&&R0.y+R0.h+12<CL.L.pad.y-CL.L.pad.r-17)CT(x,'VITRE',R0.x+R0.w/2,R0.y+R0.h+4,'#5a4a78')}
// ---------- panneaux (titre, victoire, collection, plus de crédits) ----------
function panel(x,w,h,col){const L=CL.L,G=L.mach,W=Math.min(w,L.w-8),X=Math.round(L.w/2-W/2),Y=Math.round(cl(G.y+G.h/2-h/2,L.hud+2,L.h-h-2));x.globalAlpha=.94;R(x,X,Y,W,h,'#120820');x.globalAlpha=1;
 x.strokeStyle=col||'#ff4fa3';x.lineWidth=1;x.strokeRect(X+.5,Y+.5,W-1,h-1);R(x,X+2,Y+2,W-4,1,'#3a1a5a');return{X,Y,w:W,h,cx:X+W/2}}
function pbtn(x,b,lab,col,dis){x.fillStyle=dis?'#2a2236':col;rr(x,b.x,b.y,b.w,b.h,3);x.fill();x.fillStyle='rgba(255,255,255,.25)';x.fillRect(b.x+2,b.y+1,b.w-4,1);CT(x,lab,b.x+b.w/2,Math.round(b.y+(b.h-7)/2),dis?'#6a5a78':'#ffffff',1,dis?null:'#1a0820')}
function titleCard(x){const L=CL.L,n=colCount(),d=data(),w=Math.min(250,L.w-10),P0=panel(x,w,128);let y=P0.Y+8;const sc=P0.w>=TW('LUCKY CLAW',3)+10?3:2;
 CT(x,'LUCKY',P0.cx,y,'#ffe14f',sc,'#a0206a');CT(x,'CLAW',P0.cx,y+sc*8+2,'#7ff3ff',sc,'#1a3a8a');y+=sc*16+8;
 CT(x,'ATTRAPE LES PELUCHES !',P0.cx,y,'#ffd0ea');y+=12;CT(x,'COLLECTION '+n+'/'+NP+'  ·  RECORD '+(d.best||0),P0.cx,y,'#9fb0e8');y+=14;
 const bw=Math.min(100,(P0.w-18)/2);CL.btns=[{id:'play',x:P0.cx-bw-3,y,w:bw,h:16},{id:'col',x:P0.cx+3,y,w:bw,h:16}];pbtn(x,CL.btns[0],'JOUER','#2fa858');pbtn(x,CL.btns[1],'COLLECTION','#7a3ab0');
 if(Math.floor(CL.t*2)%2)CT(x,CREDITS0+' CRÉDITS OFFERTS',P0.cx,y+22,'#ffe14f')}
function winCard(x){const w=CL.got[CL.winI];if(!w)return;const L=CL.L,T=w.T,ra=RAR[T.rar],t=w.t,G=L.mach,cx=L.w/2,cy=Math.round(G.y+G.h*.42);
 x.globalAlpha=Math.min(.7,t*2);R(x,0,0,L.w,L.h,'#0a0414');x.globalAlpha=1;
 // rayons tournants
 x.save();x.translate(cx,cy);x.rotate(t*.8);x.globalAlpha=Math.min(.35,t);x.fillStyle=ra.c;for(let i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,0);x.lineTo(-L.w*.08,-L.w);x.lineTo(L.w*.08,-L.w);x.closePath();x.fill()}x.restore();x.globalAlpha=1;
 const pr=Math.round(Math.min(L.w,G.h)*.15),pop=Math.min(1,t*3),b=Math.sin(t*4)*3;x.globalAlpha=.4;x.fillStyle=ra.c;x.beginPath();x.arc(cx,cy,pr*1.6*pop,0,7);x.fill();x.globalAlpha=1;
 drawPrize(x,T,cx,cy+b,pr*(.4+.6*pop)*(1+.08*Math.sin(t*9)*Math.max(0,1-t)),Math.sin(t*3)*.15);
 for(const q of CL.parts){x.save();x.translate(q.x,q.y);x.rotate(q.a);x.globalAlpha=Math.min(1,q.l);x.fillStyle=q.c;x.fillRect(-q.s,-q.s/2,q.s*2,q.s);x.restore()}x.globalAlpha=1;
 let y=Math.round(cy-pr*1.6-30);const sc=L.w>=200?2:1;CT(x,'GAGNÉ !',cx,Math.max(L.hud+4,y),['#ffe14f','#ff9ad0','#7ff3ff'][Math.floor(t*6)%3],sc,'#2a0f3a');
 y=Math.round(cy+pr*1.5+6);CT(x,T.nom,cx,y,'#ffffff',1,'#2a0f3a');CT(x,ra.n+'  +'+w.pts,cx,y+12,ra.c,1,'#2a0f3a');
 if(w.first&&Math.floor(t*4)%2)CT(x,'NOUVEAU DANS TA COLLECTION !',cx,y+26,'#7dff9a',1,'#2a0f3a');
 if(CL.pt>.8&&Math.floor(CL.t*2.5)%2)CT(x,'TOUCHE POUR CONTINUER',cx,y+(w.first?40:28),'#c9b0ff')}
function colCard(x){const L=CL.L,d=data().col||{},cols=L.w>=300&&!L.land||L.w>=420?4:3,rows=Math.ceil(NP/cols),cw=Math.min(64,Math.floor((L.w-16)/cols)),avail=L.h-L.hud-40,ch=Math.min(70,Math.floor(avail/rows));
 const w=cols*cw+10,h=rows*ch+36,P0=panel(x,w,h,'#ffe14f');CT(x,'COLLECTION '+colCount()+'/'+NP,P0.cx,P0.Y+6,'#ffe14f');
 const ox=Math.round(P0.cx-cols*cw/2);PRIZES.forEach((T,i)=>{const X=ox+(i%cols)*cw,Y=P0.Y+18+Math.floor(i/cols)*ch,n=d[T.id]||0,ra=RAR[T.rar];R(x,X+1,Y+1,cw-2,ch-2,n?'#1e1030':'#140a20');x.strokeStyle=n?ra.c:'#3a2a50';x.strokeRect(X+1.5,Y+1.5,cw-3,ch-3);
  const pr=Math.max(3,Math.min(cw*.22,(ch-24)*.32));if(n)drawPrize(x,T,X+cw/2,Y+ch*.42,pr,0);else{const c=sprite(T,Math.round(pr),true);x.drawImage(c,Math.round(X+cw/2-c.off),Math.round(Y+ch*.42-c.offy))}
  const nm=n?T.nom:'???',ww=TW(nm);if(ww<=cw-4)CT(x,nm,X+cw/2,Y+ch-19,n?'#ffffff':'#5a4a78');else{const p=nm.split(' ');CT(x,p[0].slice(0,Math.floor((cw-4)/6)),X+cw/2,Y+ch-19,n?'#ffffff':'#5a4a78')}
  CT(x,n?'X'+n:ra.n.slice(0,Math.floor((cw-4)/6)),X+cw/2,Y+ch-10,n?ra.c:'#3a2a50')});
 CL.btns=[{id:'close',x:P0.cx-40,y:P0.Y+h-16,w:80,h:13}];pbtn(x,CL.btns[0],'FERMER','#7a3ab0')}
function noCredit(x){const L=CL.L,P0=panel(x,Math.min(240,L.w-10),116,'#ff3348'),have=typeof N!='undefined'?(N.coins||0):0;let y=P0.Y+8;
 CT(x,'PLUS DE CRÉDITS',P0.cx,y,'#ff9ad0',L.w>=220?2:1,'#2a0f3a');y+=24;CT(x,'SCORE '+CL.score,P0.cx,y,'#ffe14f');y+=11;CT(x,'LOTS GAGNÉS : '+CL.won.length,P0.cx,y,'#9fb0e8');y+=14;
 const bw=P0.w-20,b1={id:'buy',x:P0.cx-bw/2,y,w:bw,h:16},b2={id:'end',x:P0.cx-bw/2,y:y+20,w:bw,h:16};CL.btns=[b1,b2];
 pbtn(x,b1,'+'+BUY_N+' CRÉDITS · '+BUY_P+' PIÈCES',have>=BUY_P?'#2fa858':'#2a2236',have<BUY_P);pbtn(x,b2,'TERMINER LA PARTIE','#7a3ab0');
 CT(x,have>=BUY_P?'TU AS '+have+' PIÈCES':'IL TE MANQUE '+(BUY_P-have)+' PIÈCES',P0.cx,y+40,'#8a6aa8')}
// ---------- dessin principal ----------
function draw(x,w,h){if(w!==CL.W||h!==CL.H||!CL.L){CL.touch={pad:null,dir:{x:0,z:0},big:null};layout(w,h)}const L=CL.L;R(x,0,0,w,h,'#0a0414');x.imageSmoothingEnabled=true;
 drawMachine(x);deck(x,L);hud(x,L);CL.btns=[];
 const ph=CL.phase;
 if(ph=='aim'&&CL.pt<2.2){x.globalAlpha=Math.min(1,2.2-CL.pt);CT(x,'VISE AVEC LA CROIX',L.glass.x+L.glass.w/2,L.glass.y+6,'#ffffff',1,'#2a0f3a');CT(x,'PUIS DESCENDRE !',L.glass.x+L.glass.w/2,L.glass.y+17,'#ffe14f',1,'#2a0f3a');x.globalAlpha=1}
 if(ph=='ready'&&Math.floor(CL.t*2)%2)CT(x,'APPUIE SUR JOUER',L.glass.x+L.glass.w/2,L.glass.y+6,'#7dff9a',1,'#2a0f3a');
 if(ph=='aim'){const s=Math.ceil(CL.aimT);CT(x,'0:'+pad(s,2),L.glass.x+L.glass.w-18,L.glass.y+L.glass.h-11,s<=5?'#ff3348':'#ffffff',1,'#2a0f3a')}
 if(CL.toast){const t=CL.toast;x.globalAlpha=Math.min(1,t.t*2);CT(x,t.s,L.glass.x+L.glass.w/2,Math.round(L.glass.y+L.glass.h*.35-(1.6-t.t)*8),t.c,L.w>=200?2:1,'#2a0f3a');x.globalAlpha=1}
 if(ph=='title')titleCard(x);else if(ph=='win')winCard(x);else if(ph=='col')colCard(x);else if(ph=='nocredit')noCredit(x);
 if(ph!='win'&&CL.parts.length){for(const q of CL.parts){x.globalAlpha=Math.min(1,q.l);x.fillStyle=q.c;x.fillRect(q.x,q.y,q.s,q.s)}x.globalAlpha=1}}
// ---------- toucher ----------
const inR=(b,px,py)=>b&&px>=b.x&&px<b.x+b.w&&py>=b.y&&py<b.y+b.h;
function pointer(type,px,py,id){const L=CL.L;if(!L)return;const T=CL.touch;
 if(type=='down'){
  if(inR(L.back,px,py+2)){T.btn='back';T.btnId=id;return}
  if(inR(L.colB,px,py+2)&&(CL.phase=='ready'||CL.phase=='title'||CL.phase=='nocredit')){T.btn='col';T.btnId=id;return}
  for(const b of CL.btns||[])if(inR(b,px,py)){fx('clSelect',1,.05);if(b.id=='play')newGame();else if(b.id=='col'){CL._colBack=CL.phase;CL.phase='col'}else if(b.id=='close')CL.phase=CL._colBack||'title';else if(b.id=='buy')buy();else if(b.id=='end')endGame();return}
  const B=L.big;if(Math.hypot(px-B.x,py-B.y)<B.r+10){T.big=id;big();return}
  const J=L.pad,inPad=L.land?(px<L.side&&py>J.y-J.r*1.8):(py>L.deck.y&&px<(J.x+L.big.x)/2&&(!L.rad||px<L.rad.x));
  if(inPad||Math.hypot(px-J.x,py-J.y)<J.r*1.6){T.pad=id;padDir(px,py);return}
  if(CL.phase=='win'&&CL.pt>.6){nextWin();return}if(CL.phase=='col'){CL.phase=CL._colBack||'title';return}}
 else if(type=='move'){if(id===T.pad)padDir(px,py)}
 else if(type=='up'){if(id===T.pad){T.pad=null;T.dir={x:0,z:0}}if(id===T.big)T.big=null;
  if(id===T.btnId){const b=T.btn;T.btn=null;T.btnId=null;if(b=='back'&&inR(L.back,px,py+4))exit();else if(b=='col'&&inR(L.colB,px,py+4)){fx('clSelect');CL._colBack=CL.phase;CL.phase='col'}}}}
// 8 directions : on peut viser en diagonale en posant le pouce entre deux branches
function padDir(px,py){const J=CL.L.pad,dx=px-J.x,dy=py-J.y,l=Math.hypot(dx,dy),T=CL.touch;if(l<J.r*.18){T.dir={x:0,z:0};return}const ax=dx/l,ay=dy/l;
 T.dir={x:Math.abs(ax)>.38?Math.sign(ax):0,z:Math.abs(ay)>.38?-Math.sign(ay):0}}
// ---------- module ----------
function music(){try{if(typeof JEUSON=='undefined')return;JEUSON.music('claw');JEUSON.level(1);JEUSON.sfxLevel(1)}catch(e){}}
function reset(seed){RNG=seed!=null?(()=>{let s=seed|0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})():Math.random;
 CL.ps=[];CL.claw=newClaw();CL.sim=true;fillPile(PILE,false);for(let i=0;i<1600;i++)step();
 // un lot a pu rouler dans la goulotte pendant la mise en place : on complète sans le compter
 for(let n=0;n<3&&CL.ps.length<PILE;n++){fillPile(PILE-CL.ps.length,false);for(let i=0;i<900;i++)step()}CL.sim=false;for(const p of CL.ps){p.vx=p.vy=p.vz=0}CL.acc=0}
const Claw={start(api){CL.api=api;CL.phase='title';CL.t=0;CL.pt=0;CL.okN=null;CL.L=null;CL.W=0;CL.H=0;CL.parts=[];CL.toast=null;CL.flap=null;CL.got=[];CL.won=[];CL.score=0;CL.credits=CREDITS0;CL.touch={pad:null,dir:{x:0,z:0},big:null};CL._back=null;
  const d=data();d.col=d.col||{};reset();music()},
 update,draw,pointer,
 resize(){CL.touch={pad:null,dir:{x:0,z:0},big:null};CL.L=null},
 stop(){try{if(MOT){MOT.stop();MOT=null}JEUSON.sfxLevel(1);JEUSON.stop()}catch(e){}CL.api=null;CL.phase='title';CL.L=null;CL.cache=null;CL.spr={};CL.parts=[];CL.touch={pad:null,dir:{x:0,z:0},big:null}},
 _state:CL,_prizes:PRIZES,_rar:RAR,_world:{WX,WD,TOPY,CHX,CHZ,CHH,REACH,HOME},_step:step,_fingers:fingers,_reset:reset,_newPrize:newPrize,_big:big,_drop:drop,_insert:insert,_newGame:newGame,_hubMin:hubMin,_substep:substep,_update:update};
ARC.register('claw',Claw);
})();
