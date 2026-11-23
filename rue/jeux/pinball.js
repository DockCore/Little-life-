// ===== MINI-JEU PINBALL (module de la borne d'arcade) =====
// Flipper vertical en 2D, 4 univers (Dinosaur World, Alien Invasion, Future City, Space Galaxy), chacun avec son plateau
// physique, son décor, ses animations, sa musique et ses sons. S'enregistre auprès de la borne : ARC.register('pinball', module).
// Table logique de 200 × 400 unités (physique indépendante de la résolution), dessinée en pixel art à l'échelle de l'écran.
// Commandes : les deux gros boutons ronds (multi-touch), le clavier (flèches, Espace) et la borne (joystick, OK).
// Meilleurs scores : un par table, enregistrés dans la sauvegarde de Little Life (localStorage) : N.arcade.pinball.tables[id].best
(function(){
const PW=200,PH=400,BR=5.5,GRAV=430,VMAX=900;
// ---------- sons ----------
function pAudio(){try{if(typeof JEUSON!='undefined')JEUSON.ctx()}catch(e){}}
const pfx=(n,k,g)=>{if(P.mute)return;try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k,g)}catch(e){}};
const tfx=(k,kk,g)=>pfx(TD.sfx[k],kk,g);
const PS={flip:()=>pfx('pbFlip',1,.04),bump:()=>tfx('bump',1,.03),sling:()=>pfx('pbSling',1,.03),target:()=>tfx('target',1,.03),drop:()=>pfx('pbDrop',1,.03),lane:()=>pfx('pbLane',1,.05),
 ramp:(k)=>pfx('pbRamp',k||1,.2),launch:(k)=>pfx('pbLaunch',k||0,.1),charge:(k)=>pfx('pbCharge',k,.12),drain:()=>tfx('drain',1,.5),bonus:()=>tfx('bonus',1,.3),start:()=>pfx('pbStart',1,.5),
 over:()=>pfx('pbOver',1,1),record:()=>pfx('pbNewRec',1,1),wall:(k)=>pfx('pbWall',k||.6,.06),combo:(k)=>pfx('pbCombo',k,.1),ball:()=>tfx('ball',1,.3),saucer:()=>tfx('saucer',1,.3),sel:()=>pfx('pbSel',1,.05)};
function pMus(lv,name){try{if(typeof JEUSON=='undefined')return;if(lv==null){JEUSON.stop();return}JEUSON.music(name||TD.music);JEUSON.level(P.son==0?lv:0);JEUSON.sfxLevel(P.son==2?0:1)}catch(e){}}
// ---------- géométrie : éléments communs et briques ----------
const seg=(ax,ay,bx,by,o={})=>Object.assign({a:[ax,ay],b:[bx,by],e:.45,kick:0,type:'wall'},o);
// cadre commun : murs, arc supérieur, couloir du lanceur, couloirs latéraux bas, lance-boules, déflecteurs
function frame(S,C){S.push(seg(8,100,8,412));S.push(seg(192,100,192,404));
 const arc=[];for(let i=0;i<=24;i++){const t=Math.PI-i/24*Math.PI;arc.push([100+92*Math.cos(t),100-92*Math.sin(t)])}for(let i=0;i<24;i++)S.push(seg(...arc[i],...arc[i+1],{e:.35}));
 S.push(seg(176,120,176,404));S.push(seg(192,104,176,120,{type:'gate',e:.3}));S.push(seg(176,404,192,404,{e:0}));
 S.push(seg(22,276,22,326,{type:'rail'}));S.push(seg(22,326,52,347,{type:'rail'}));S.push(seg(162,276,162,326,{type:'rail'}));S.push(seg(162,326,132,347,{type:'rail'}));
 S.push(seg(34,286,34,318,{e:.4}));S.push(seg(34,318,50,330,{e:.4}));S.push(seg(34,286,50,330,{type:'sling',side:0,e:.6,kick:230}));
 S.push(seg(150,286,150,318,{e:.4}));S.push(seg(150,318,134,330,{e:.4}));S.push(seg(150,286,134,330,{type:'sling',side:1,e:.6,kick:230}));
 S.push(seg(8,104,30,128,{type:'deflect',e:.55}));S.push(seg(8,232,27,252,{type:'deflect',e:.5}));S.push(seg(176,232,157,252,{type:'deflect',e:.5}));
 C.push({x:22,y:276,r:2.5,e:.5,type:'post'});C.push({x:162,y:276,r:2.5,e:.5,type:'post'})}
// passages du haut : séparateurs (rail + poteau), renvoie le centre de chaque passage
function lanes(S,C,seps){for(const x of seps){S.push(seg(x,30,x,48,{type:'rail',e:.3}));C.push({x,y:48,r:2.5,e:.5,type:'post'})}const xs=[];for(let i=1;i<seps.length;i++)xs.push((seps[i-1]+seps[i])/2);return xs}
// rangée verticale de cibles (fixes ou tombantes) avec son mur d'appui
function rowV(S,type,x,y0,n,back){for(let i=0;i<n;i++)S.push(seg(x,y0+2+i*16,x,y0+13+i*16,{type,id:i,e:.5}));S.push(seg(back,y0,back,y0+16*n+1,{e:.3}))}
const bump=(x,y,r,id)=>({x,y,r,e:.8,kick:260,type:'bumper',id});
const post=(x,y,r=3)=>({x,y,r,e:.6,type:'post'});
const RAMPL=[[25,142],[22,96],[28,58],[46,34],[72,22],[100,18],[128,22],[152,34],[166,56],[170,96],[170,160],[164,222],[156,268]];
// ---------- les 4 univers ----------
const TABLES=[
 {id:'dino',nom:'DINOSAUR WORLD',music:'pb_dino',sfx:{bump:'dnBump',target:'dnTarget',bonus:'dnBonus',drain:'dnDrain',saucer:'dnSaucer',ball:'dnBall'},lbl:'REX',
  pal:{side:'#0d1608',pf:['#1d3a17','#2a4a1c','#3a2a12'],wall:'#c9a66b',wallHi:'#f4e2b0',rail:'#b39d7a',sling:'#5a3a1a',slingHi:'#ff9a1f',deflect:'#ff7a1f',gate:'#ffd166',ramp:'#7ac94a',rampHi:'#e2ffc0',
   accent:'#ff9a1f',accent2:'#9fe05a',stand:['#4a5a2a','#c6ff6a'],drop:'#ffb347',lane:['#4a3a20','#ffd166'],hud1:'#3a220c',hud2:'#152410',dmd:'#ff9a1f',flip:'#ff7a1f',text:'#ffe2a8'},
  build(){const S=[],C=[];frame(S,C);
   S.push(seg(42,178,42,138,{type:'rail'}));S.push(seg(8,136,42,136,{type:'rampwall',e:.3}));
   rowV(S,'stand',46,194,3,43);rowV(S,'drop',150,170,3,152);const xs=lanes(S,C,[70,92,114,136]);
   C.push(bump(72,92,11,0),bump(112,86,11,1),bump(92,124,10,2));C.push(post(68,238),post(116,238));
   C.push({x:92,y:200,r:6,type:'saucer',id:0,hold:.9,pts:2000,msg:'ÉRUPTION !',ev:()=>[(Math.random()-.5)*160,-300]});
   return{S,C,lanes:xs,ramp:{path:RAMPL,entry:[10,40,137,154],lbl:'PONT DE LIANES'}}}},
 {id:'alien',nom:'ALIEN INVASION',music:'pb_alien',sfx:{bump:'alBump',target:'alTarget',bonus:'alBonus',drain:'alDrain',saucer:'alSaucer',ball:'alBall'},lbl:'ZORG',
  pal:{side:'#030806',pf:['#06140c','#0a2216','#040c10'],wall:'#39ff6a',wallHi:'#c8ffd8',rail:'#7affb0',sling:'#103a20',slingHi:'#39ff6a',deflect:'#c84fff',gate:'#ffe14f',ramp:'#39ff6a',rampHi:'#e0ffe8',
   accent:'#39ff6a',accent2:'#c84fff',stand:['#3a1a5a','#e07aff'],drop:'#39ff6a',lane:['#1a3a24','#39ff6a'],hud1:'#06200e',hud2:'#100626',dmd:'#39ff6a',flip:'#c84fff',text:'#c8ffd8'},
  build(){const S=[],C=[];frame(S,C);
   rowV(S,'stand',154,130,3,157);const xs=lanes(S,C,[58,80,102,124,146]);
   for(let i=0;i<5;i++)S.push(seg(54+i*17,196,68+i*17,196,{type:'drop',id:i,e:.5}));
   C.push(bump(96,82,10,0),bump(70,108,10,1),bump(122,108,10,2),bump(96,134,10,3));C.push(post(60,240),post(124,240));
   C.push({x:26,y:160,r:7,type:'saucer',id:0,hold:1,pts:1500,msg:'ENLÈVEMENT !',ev:()=>[140,-230]});
   return{S,C,lanes:xs,ramp:null}}},
 {id:'city',nom:'FUTURE CITY',music:'pb_city',sfx:{bump:'ctBump',target:'ctTarget',bonus:'ctBonus',drain:'ctDrain',saucer:'ctSaucer',ball:'ctBall'},lbl:'NEO',
  pal:{side:'#07051a',pf:['#0a0a2e','#1c0a40','#2e0a3a'],wall:'#38e1ff',wallHi:'#d0f8ff',rail:'#ff4fd8',sling:'#2a0a4a',slingHi:'#ff4fd8',deflect:'#ff4fd8',gate:'#ffe14f',ramp:'#ff4fd8',rampHi:'#ffd0f4',
   accent:'#38e1ff',accent2:'#ff4fd8',stand:['#1a3a5a','#38e1ff'],drop:'#ffe14f',lane:['#3a1a4a','#ff4fd8'],hud1:'#1a0a3a',hud2:'#0a1a3a',dmd:'#38e1ff',flip:'#ff4fd8',text:'#d0f8ff'},
  build(){const S=[],C=[];frame(S,C);
   S.push(seg(142,178,142,138,{type:'rail'}));S.push(seg(142,136,176,136,{type:'rampwall',e:.3}));
   rowV(S,'drop',46,194,3,43);const xs=lanes(S,C,[70,92,114,136]);
   // gratte-ciel : façade gauche = cibles fixes (fenêtres), toit en pointe
   for(let i=0;i<3;i++)S.push(seg(110,152+i*11,110,160+i*11,{type:'stand',id:i,e:.5}));S.push(seg(113,150,113,185,{type:'block',e:.3}));
   S.push(seg(110,150,119,140,{type:'block',e:.4}));S.push(seg(119,140,128,150,{type:'block',e:.4}));S.push(seg(128,150,128,185,{type:'block',e:.4}));S.push(seg(110,185,128,185,{type:'block',e:.4}));
   C.push(bump(60,96,10,0),bump(96,80,10,1),bump(74,132,10,2));C.push(post(68,238),post(116,238));
   C.push({x:28,y:168,r:7,type:'saucer',id:0,hold:.9,pts:1500,msg:'TURBO !',ev:()=>[150,-240]});
   return{S,C,lanes:xs,ramp:{path:RAMPL.map(([x,y])=>[184-x,y]),entry:[144,174,137,154,-178],lbl:'AUTOROUTE'}}}},
 {id:'space',nom:'SPACE GALAXY',music:'pb_space',sfx:{bump:'spBump',target:'spTarget',bonus:'spBonus',drain:'spDrain',saucer:'spSaucer',ball:'spBall'},lbl:'GO',
  pal:{side:'#04020c',pf:['#0a0420','#160830','#05020f'],wall:'#b48cff',wallHi:'#f0e6ff',rail:'#e0d0ff',sling:'#2a1450',slingHi:'#ffd166',deflect:'#4fd1ff',gate:'#ffd166',ramp:'#4fd1ff',rampHi:'#d8f6ff',
   accent:'#ffd166',accent2:'#4fd1ff',stand:['#5a4a1a','#ffd166'],drop:'#4fd1ff',lane:['#2a2050','#ffd166'],hud1:'#160830',hud2:'#060418',dmd:'#b48cff',flip:'#4fd1ff',text:'#f0e6ff'},
  build(){const S=[],C=[];frame(S,C);
   rowV(S,'drop',46,200,3,43);rowV(S,'stand',150,170,3,152);const xs=lanes(S,C,[72,100,128]);
   for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;C.push(bump(Math.round(96+Math.cos(a)*38),Math.round(128+Math.sin(a)*38),9,i))}
   C.push(post(92,248));
   C.push({x:96,y:128,r:7,type:'saucer',id:0,hold:1.2,pts:3000,msg:'TROU NOIR !',ev:()=>[[-180,140],[180,140],[0,220]][Math.random()*3|0]});
   C.push({x:25,y:172,r:7,type:'saucer',id:1,hold:.7,pts:1000,msg:'TROU DE VER !',exit:[160,140],ev:()=>[-170,30]});
   return{S,C,lanes:xs,ramp:null}}}];
TABLES.forEach(t=>{t.tb=t.build();t.tb.nStand=t.tb.S.filter(s=>s.type=='stand').length;t.tb.nDrop=t.tb.S.filter(s=>s.type=='drop').length;t.tb.nBump=t.tb.C.filter(c=>c.type=='bumper').length;t.tb.sau=t.tb.C.filter(c=>c.type=='saucer');
 if(t.tb.ramp){const R=t.tb.ramp.path;let L=0;for(let i=1;i<R.length;i++)L+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);t.tb.ramp.len=L}});
let TD=TABLES[0],TB=TD.tb;
function rampAt(d){const RP=TB.ramp.path;for(let i=1;i<RP.length;i++){const a=RP[i-1],b=RP[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l){const u=d/l;return{x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u,dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}d-=l}
 const a=RP[RP.length-2],b=RP[RP.length-1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return{x:b[0],y:b[1],dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}
// palettes : pivot, longueur, rayons, angles (repère écran, y vers le bas)
const FL=[{px:54,py:350,len:33,r0:5.5,r1:3,rest:.5,up:-.48,side:0},{px:130,py:350,len:33,r0:5.5,r1:3,rest:Math.PI-.5,up:Math.PI+.48,side:1}];
// ---------- état ----------
const P={api:null,phase:'select',W:0,H:0,L:null,ball:null,fl:[{a:FL[0].rest,w:0,on:false},{a:FL[1].rest,w:0,on:false}],score:0,balls:3,mult:1,t:0,pops:[],parts:[],
 lit:{},flash:{},chain:0,chainT:0,rampCombo:0,rampT:0,pl:0,charging:false,msg:null,touches:new Map(),ctrl:{l:false,r:false,p:false},okN:null,sel:0,tsel:0,over:null,stuckT:0,lastLaneIn:-1,dropT:0,son:0,recT:0,saveT:0,sauCd:[],hold:null,played:0,prev:{}};
function resetLit(){P.lit={stand:Array(TB.nStand).fill(0),drop:Array(TB.nDrop).fill(0),lane:Array(TB.lanes.length).fill(0),bump:Array(TB.nBump).fill(0)};
 P.flash={bump:Array(TB.nBump).fill(0),sling:[0,0],stand:Array(TB.nStand).fill(0),drop:Array(TB.nDrop).fill(0),sau:Array(TB.sau.length).fill(0)};P.sauCd=Array(TB.sau.length).fill(0)}
function useTable(i){P.tsel=i;TD=TABLES[i];TB=TD.tb;resetLit();P.bg=null;P.ov=null}
// ---------- meilleurs scores par table (sauvegarde permanente) ----------
function pData(){const d=P.api?P.api.data():{};if(!d.tables){d.tables={};if(d.best)d.tables.dino={best:d.best}}TABLES.forEach(t=>{if(!d.tables[t.id])d.tables[t.id]={best:0,parties:0}});return d}
const pBest=id=>{const d=pData();return d.tables[id||TD.id].best||0};
function pSave(){try{P.api&&P.api.save()}catch(e){}P.saveT=1.5}
// le record de la table se met à jour (et s'enregistre) dès qu'il est battu, en pleine partie
function pRecordCheck(dt){if(!P.api||P.phase=='select')return;const d=pData(),T=d.tables[TD.id];if(P.saveT>0)P.saveT-=dt;
 if(P.score>(T.best||0)){T.best=P.score;P.dirty=true;if(!P.newRec&&P.best0>0){P.newRec=true;P.recT=3.2;PS.record();P.msg={t:'NEW RECORD !',c:'#7cff6b',T:0};for(let i=0;i<30;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*120;P.parts.push({x:92,y:200,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6+Math.random()*.5,c:['#ffe14f','#7cff6b','#38e1ff','#ff4fa3'][i%4]})}}
  if(P.saveT<=0){pSave();P.dirty=false}}}
// ---------- partie ----------
function pNewGame(){resetLit();P.score=0;P.balls=3;P.mult=1;P.over=null;P.pops=[];P.parts=[];P.chain=0;P.rampCombo=0;P.phase='jeu';P.paused=false;P.newRec=false;P.recT=0;P.saveT=0;P.played=0;P.hold=null;
 P.best0=pBest();const d=pData();d.tables[TD.id].parties=(d.tables[TD.id].parties||0)+1;pNewBall();PS.start();pMus(1);P.stats={bump:0,ramp:0,targets:0,saucer:0}}
function pNewBall(){P.ball={x:184,y:396-BR,vx:0,vy:0,st:'plunger',rd:0};P.pl=0;P.charging=false;P.stuckT=0;P.played++;P.msg={t:'BOULE '+(4-P.balls),c:'#ffe14f',T:0}}
function pAdd(pts,x,y,col){const v=pts*P.mult;P.score+=v;P.pops.push({t:'+'+v,x,y,T:0,c:col||'#ffe14f'})}
function pFx(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=40+Math.random()*90;P.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.3+Math.random()*.3,c})}}
function pMultUp(why){if(P.mult<5){P.mult++;P.msg={t:'MULTIPLICATEUR X'+P.mult,c:'#38e1ff',T:0}}else P.msg={t:why,c:'#38e1ff',T:0};PS.bonus()}
// ---------- physique ----------
function pCollideSeg(b,s){if(s.type=='drop'&&P.lit.drop[s.id])return;const ax=s.a[0],ay=s.a[1],bx=s.b[0],by=s.b[1],ex=bx-ax,ey=by-ay,L2=ex*ex+ey*ey;let t=((b.x-ax)*ex+(b.y-ay)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=ax+ex*t,cy=ay+ey*t;let dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy);if(d>=BR)return;
 if(s.type=='gate'&&!(b.vy>0&&b.y<cy))return;
 if(s.type=='rampwall'&&!(b.vy<0&&b.y>cy))return;
 let nx,ny;if(d>1e-6){nx=dx/d;ny=dy/d}else{const L=Math.sqrt(L2);nx=-ey/L;ny=ex/L}b.x=cx+nx*BR;b.y=cy+ny*BR;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+s.e)*vn*nx;b.vy-=(1+s.e)*vn*ny;b.vx*=.995;b.vy*=.995;const imp=-vn;
  if(s.type=='sling'&&imp>35){b.vx+=nx*s.kick;b.vy+=ny*s.kick;P.flash.sling[s.side]=1;pAdd(10,cx,cy,'#ffffff');PS.sling();pFx(cx,cy,TD.pal.slingHi,6);pChain()}
  else if(s.type=='stand'&&imp>20){P.flash.stand[s.id]=1;if(!P.lit.stand[s.id]){P.lit.stand[s.id]=1;pAdd(250,cx,cy,'#7cff6b')}else pAdd(50,cx,cy,'#7cff6b');PS.target();P.stats.targets++;
   if(P.lit.stand.every(Boolean)){pAdd(1000,cx,cy-14,'#38e1ff');P.lit.stand=P.lit.stand.map(()=>0);pMultUp('CIBLES COMPLÈTES !')}}
  else if(s.type=='drop'&&imp>20){P.lit.drop[s.id]=1;P.flash.drop[s.id]=1;pAdd(300,cx,cy,'#ff9a1f');PS.drop();P.stats.targets++;pFx(cx,cy,TD.pal.drop,8);
   if(P.lit.drop.every(Boolean)){pAdd(1500,cx,cy-14,'#38e1ff');P.dropT=1.6;pMultUp('BANQUE COMPLÈTE !')}}
  else if(imp>120)PS.wall(Math.min(1,imp/500))}}
function pCollideCirc(b,c){if(c.type=='saucer')return;const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy),R=BR+c.r;if(d>=R)return;const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=c.x+nx*R;b.y=c.y+ny*R;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+c.e)*vn*nx;b.vy-=(1+c.e)*vn*ny}
 if(c.type=='bumper'){b.vx+=nx*c.kick;b.vy+=ny*c.kick;P.flash.bump[c.id]=1;P.lit.bump[c.id]=1;pAdd(100,c.x,c.y-c.r,'#ff4fa3');PS.bump();pFx(c.x+nx*c.r,c.y+ny*c.r,TD.pal.accent,8);P.stats.bump++;pChain();
  if(P.lit.bump.every(Boolean)){P.lit.bump=P.lit.bump.map(()=>0);pAdd(500,c.x,c.y,'#38e1ff');PS.bonus()}}}
function pChain(){if(P.chainT>0){P.chain++;if(P.chain>=3){pAdd(25*P.chain,P.ball.x,P.ball.y-12,'#ffd166');PS.combo(P.chain);if(P.chain==5)P.msg={t:'COMBO X'+P.chain,c:'#ffd166',T:0}}}else P.chain=1;P.chainT=1.4}
function pFlipGeom(i){const f=FL[i],a=P.fl[i].a;return{px:f.px,py:f.py,qx:f.px+Math.cos(a)*f.len,qy:f.py+Math.sin(a)*f.len,r0:f.r0,r1:f.r1,w:P.fl[i].w}}
function pCollideFlip(b,i){const g=pFlipGeom(i),ex=g.qx-g.px,ey=g.qy-g.py,L2=ex*ex+ey*ey;let t=((b.x-g.px)*ex+(b.y-g.py)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=g.px+ex*t,cy=g.py+ey*t,rr=g.r0+(g.r1-g.r0)*t,dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy),R=BR+rr;if(d>=R)return;
 const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=cx+nx*R;b.y=cy+ny*R;
 const vcx=-g.w*(b.y-g.py),vcy=g.w*(b.x-g.px),rvx=b.vx-vcx,rvy=b.vy-vcy,vn=rvx*nx+rvy*ny;if(vn<0){const e=.3;b.vx=rvx-(1+e)*vn*nx+vcx;b.vy=rvy-(1+e)*vn*ny+vcy}}
function pFlippers(dt){for(let i=0;i<2;i++){const f=FL[i],s=P.fl[i],on=i?P.ctrl.r:P.ctrl.l;if(on&&!s.on)PS.flip();s.on=on;const target=on?f.up:f.rest,dir=Math.sign(target-s.a),sp=on?24:15,old=s.a;
  if(dir){s.a+=dir*sp*dt;if((dir>0&&s.a>target)||(dir<0&&s.a<target))s.a=target}s.w=(s.a-old)/dt}}
function pStep(dt){const b=P.ball;pFlippers(dt);for(let i=0;i<P.sauCd.length;i++)if(P.sauCd[i]>0)P.sauCd[i]-=dt;
 if(b.st=='ramp'){b.rd+=b.rs*dt;b.rs=Math.max(170,b.rs-120*dt);const q=rampAt(b.rd);b.x=q.x;b.y=q.y;
  if(b.rd>=TB.ramp.len){b.st='play';b.vx=q.dx*b.rs*.6;b.vy=Math.max(80,q.dy*b.rs*.6);P.stats.ramp++;P.rampCombo=P.rampT>0?P.rampCombo+1:1;P.rampT=5;const pts=500*P.rampCombo;pAdd(pts,b.x,b.y-14,'#38e1ff');PS.ramp(P.rampCombo);P.msg={t:P.rampCombo>1?'RAMPE COMBO X'+P.rampCombo:TB.ramp.lbl+' !',c:'#38e1ff',T:0};if(P.rampCombo>=3)pMultUp('SUPER COMBO !')}return}
 if(b.st=='plunger'){b.x=184;b.y=396-BR-P.pl*14;b.vx=b.vy=0;return}
 // trou à bonus : la boule est retenue, puis éjectée (ou téléportée)
 if(b.st=='hold'){const H=P.hold;H.t-=dt;b.x=H.c.x;b.y=H.c.y;if(H.t<=0){const c=H.c,v=c.ev();if(c.exit){b.x=c.exit[0];b.y=c.exit[1]}b.vx=v[0];b.vy=v[1];b.st='play';P.sauCd[TB.sau.indexOf(c)]=.8;P.hold=null;pFx(b.x,b.y,TD.pal.accent2,14)}return}
 b.vy+=GRAV*dt;const sp=Math.hypot(b.vx,b.vy);if(sp>VMAX){b.vx*=VMAX/sp;b.vy*=VMAX/sp}
 b.x+=b.vx*dt;b.y+=b.vy*dt;
 for(const s of TB.S)pCollideSeg(b,s);for(const c of TB.C)pCollideCirc(b,c);pCollideFlip(b,0);pCollideFlip(b,1);
 const E=TB.ramp&&TB.ramp.entry;if(E&&b.x>E[0]&&b.x<E[1]&&b.y>E[2]&&b.y<E[3]&&b.vy<(E[4]||-150)){b.st='ramp';b.rd=0;b.rs=Math.max(260,Math.hypot(b.vx,b.vy));return}
 for(let i=0;i<TB.sau.length;i++){const c=TB.sau[i];if(P.sauCd[i]<=0&&Math.hypot(b.x-c.x,b.y-c.y)<c.r){b.st='hold';P.hold={c,t:c.hold};P.flash.sau[i]=1;pAdd(c.pts,c.x,c.y-10,TD.pal.accent2);PS.saucer();P.stats.saucer++;P.msg={t:c.msg,c:TD.pal.accent2,T:0};pFx(c.x,c.y,TD.pal.accent,12);return}}
 if(b.y>34&&b.y<46){const li=TB.lanes.findIndex(x=>Math.abs(b.x-x)<6);if(li>=0&&li!==P.lastLaneIn){P.lastLaneIn=li;if(!P.lit.lane[li]){P.lit.lane[li]=1;pAdd(150,TB.lanes[li],40,'#ffd166');PS.lane()}
   if(P.lit.lane.every(Boolean)){P.lit.lane=P.lit.lane.map(()=>0);pAdd(1000,92,40,'#38e1ff');pMultUp('PASSAGES '+TD.lbl+' !')}}}else P.lastLaneIn=-1;
 if(b.x<-10||b.x>PW+10||b.y<-20||!isFinite(b.x+b.y)){P.balls++;P.played--;pNewBall()}}
// ---------- mise à jour ----------
function pUpdate(dt,inp){dt=Math.min(dt,.05);P.t+=dt;inp=inp||{};const n=inp.okN||0,ok=P.okN!=null&&n>P.okN;P.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 let tl=false,tr=false,tp=false;P.touches.forEach(v=>{if(v=='L')tl=true;else if(v=='R')tr=true;else if(v=='P')tp=true});
 P.ctrl.l=tl||!!inp.left;P.ctrl.r=tr||!!inp.right;P.ctrl.p=tp||!!inp.a;
 if(P.recT>0)P.recT-=dt;
 if(P.phase=='select'){if(q.length){const cols=P.L&&P.L.land?4:2;q.forEach(d=>{const s=P.sel,k=d=='left'?-1:d=='right'?1:d=='up'?-cols:cols;P.sel=(P.sel+k+8)%4;if(P.sel!=s)pPick(P.sel)})}if(ok)pPlay();pTick(dt);return}
 if(P.phase=='over'){pFlippers(dt);P.over.t+=dt;q.forEach(d=>{P.osel=(P.osel+(d=='right'||d=='down'?1:-1)+3)%3});if(ok&&P.over.t>.8)pOverChoice(P.osel);pTick(dt);return}
 pMus(P.paused?.3:1);
 if(P.paused){q.forEach(d=>{P.psel=(P.psel+(d=='right'||d=='down'?1:-1)+3)%3});if(ok)pPauseChoice(P.psel);return}
 const b=P.ball;
 if(b.st=='plunger'){if(P.ctrl.p){P.charging=true;P.pl=Math.min(1,P.pl+dt*1.3);PS.charge(P.pl)}else if(P.charging){P.charging=false;b.st='play';b.vy=-(640+P.pl*260);b.vx=0;PS.launch(P.pl);P.pl=0;P.msg=null}}
 if(P.phase=='perdue'){P.lostT-=dt;pFlippers(dt);if(P.lostT<=0){if(P.balls<=0)pGameOver();else{P.phase='jeu';pNewBall();PS.ball()}}pTick(dt);return}
 const sp=Math.max(Math.hypot(b.vx,b.vy),300),nsub=Math.min(30,Math.max(4,Math.ceil(sp*dt/(BR*.4)))),h=dt/nsub;for(let i=0;i<nsub;i++){pStep(h);if(b.y>PH+14)break}
 if(b.y>PH+14&&b.st=='play'){P.balls--;P.phase='perdue';P.lostT=1.6;P.msg={t:P.balls>0?'BOULE PERDUE':'DERNIÈRE BOULE PERDUE',c:'#ff4f6a',T:0};PS.drain();P.chain=0;pSave()}
 if(b.st=='play'){const still=Math.hypot(b.vx,b.vy)<6&&!P.ctrl.l&&!P.ctrl.r;P.stuckT=still?P.stuckT+dt:0;if(P.stuckT>2.5){b.vy=-160;b.vx=(Math.random()-.5)*120;P.stuckT=0}}
 if(P.dropT>0){P.dropT-=dt;if(P.dropT<=0)P.lit.drop=P.lit.drop.map(()=>0)}
 pRecordCheck(dt);pTick(dt)}
function pGameOver(){pRecordCheck(0);const d=pData(),best=d.tables[TD.id].best||0,rec=P.score>P.best0&&P.score>0;P.phase='over';P.osel=0;P.over={t:0,rec,best};
 if(P.api){try{P.api.record(P.score)}catch(e){}}pSave();PS.over();if(rec)setTimeout(()=>{if(P.phase=='over')PS.record()},1500);pMus(.35)}
function pTick(dt){P.pops.forEach(p=>p.T+=dt);P.pops=P.pops.filter(p=>p.T<.9);P.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.9;q.vy*=.9;q.l-=dt});P.parts=P.parts.filter(q=>q.l>0);
 for(const k in P.flash)P.flash[k]=P.flash[k].map(v=>Math.max(0,v-dt*4));if(P.chainT>0){P.chainT-=dt;if(P.chainT<=0)P.chain=0}if(P.rampT>0)P.rampT-=dt;if(P.msg){P.msg.T+=dt;if(P.msg.T>1.6)P.msg=null}}
function pPick(i){P.sel=i;PS.sel();pMus(.75,TABLES[i].music)}
function pPlay(){useTable(P.sel);pNewGame()}
function pToSelect(){P.phase='select';P.paused=false;P.ball=null;P.over=null;P.touches.clear();P.sel=P.tsel;pMus(.75,TABLES[P.sel].music)}
function pOverChoice(k){if(k==0)pNewGame();else if(k==1)pToSelect();else P.api&&P.api.exit()}
function pPauseChoice(k){if(k==0)P.paused=false;else if(k==1)pSon();else{P.paused=false;P.api&&P.api.exit()}}
function pSon(){P.son=(P.son+1)%3;if(P.api){P.api.data().son=P.son;pSave()}pMus(P.paused?.3:P.phase=='select'?.75:1,P.phase=='select'?TABLES[P.sel].music:null);P.msg={t:['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][P.son],c:'#ffffff',T:0}}
// ---------- mise en page : bandeau de score compact en haut, table au centre, gros boutons ronds de chaque côté ----------
function pLayout(w,h){P.W=w;P.H=h;const land=w>h*.9;let L={land};
 if(!land){const side=Math.max(34,Math.min(60,Math.round(w*(w<200?.17:.19)))),kw=Math.min((w-2*side)/PW,(h-40)/PH);
  // ancienne disposition (bandeau = tout l'espace au-dessus de la table) : sert de référence pour réduire le bandeau et remonter les boutons
  const oldTy=h-Math.round(PH*kw)-2,oldHud=oldTy-2,r0=Math.round(Math.min(side*.47-1,Math.max(16,Math.min(side*.47,h*.075)))),oldY=Math.round(Math.min(h-r0-15,oldTy+FL[0].py*kw));
  const hud=Math.max(58,Math.round(oldHud*.52)),k=Math.min(kw,(h-hud-4)/PH);L.k=k;L.tw=PW*k;L.th=PH*k;L.tx=Math.round((w-L.tw)/2);L.ty=hud+2;L.side=side;L.hud={x:0,y:0,w,h:hud};L.oldHud=oldHud;L.oldBtnY=oldY;
  const r=Math.round(r0*1.08),y=Math.round(Math.max(L.ty+L.th*.42,oldY-4*r0));L.bl={x:Math.round(L.tx/2),y,r};L.br={x:Math.round(w-(w-L.tx-L.tw)/2),y,r};L.r0=r0}
 else{const k=(h-4)/PH,tw=PW*k;L.k=k;L.tx=Math.round((w-tw)/2);L.ty=2;L.tw=tw;L.th=PH*k;L.side=L.tx;
  const r0=Math.round(Math.min(L.side*.3-1,Math.max(16,Math.min(L.side*.3,h*.17)))),fy=L.ty+FL[0].py*k,oldY=Math.round(Math.min(h-r0-15,fy)),r=Math.round(r0*1.04),hudB=Math.round(h*.3);
  const y=Math.round(Math.max(hudB+r+8,oldY-4*r0));L.bl={x:Math.round(L.tx/2),y,r};L.br={x:Math.round(w-L.tx/2),y,r};L.oldBtnY=oldY;L.r0=r0}
 // lanceur : sous le bouton droit (comme la tirette d'un vrai flipper) s'il y a la place, sinon au-dessus
 const r=L.br.r,pw=Math.round(land?r*.65:r*1.1),ph2=Math.round(land?r*1.35:r*2.6),below=L.br.y+r+18;L.pl=below+ph2+14<=h?{x:L.br.x-pw/2,y:below,w:pw,h:ph2}:land&&L.br.x+r+20+pw<=w-6?{x:L.br.x+r+20,y:Math.round(L.br.y-ph2/2),w:pw,h:ph2}:{x:L.br.x-pw/2,y:Math.max(L.menu?0:0,L.br.y-r-12-ph2),w:pw,h:ph2};
 const ms=Math.max(16,Math.min(26,Math.round(Math.min(w,h)*.055)));L.menu=land?{x:w-ms-6,y:6,w:ms,h:ms}:{x:6,y:6,w:ms,h:ms};L.son=land?{x:w-2*ms-12,y:6,w:ms,h:ms}:{x:w-ms-6,y:6,w:ms,h:ms};
 P.L=L;V.k=L.k;V.tx=L.tx;V.ty=L.ty;P.bg=null;P.ov=null;P.prev={}}
const V={k:1,tx:0,ty:0};const X=x=>V.tx+x*V.k,Y=y=>V.ty+y*V.k;
// ---------- primitives pixel ----------
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
function D(x,cx,cy,r,c){x.fillStyle=c;const Rr=Math.ceil(r);for(let j=-Rr;j<=Rr;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||Math.abs(j)<r)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function El(x,cx,cy,rx,ry,c){x.fillStyle=c;const Rr=Math.ceil(ry);for(let j=-Rr;j<=Rr;j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(j*j)/(ry*ry))));if(w>0)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function Ln(x,ax,ay,bx,by,c,t=1){const d=Math.max(Math.abs(bx-ax),Math.abs(by-ay)),n=Math.max(1,Math.ceil(d));x.fillStyle=c;for(let i=0;i<=n;i++){const u=i/n;x.fillRect(Math.round(ax+(bx-ax)*u-t/2),Math.round(ay+(by-ay)*u-t/2),t,t)}}
function LnL(x,a,b,c,t){Ln(x,X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),c,t)}
// petit sprite en pixels (lignes de caractères), dans le repère de la table
function Spr(x,rows,cx,cy,s,cols){const k=V.k*s,w=rows[0].length,h=rows.length;rows.forEach((r,j)=>{for(let i=0;i<w;i++){const c=cols[r[i]];if(c)x.fillRect(Math.round(X(cx)+(i-w/2)*k),Math.round(Y(cy)+(j-h/2)*k),Math.ceil(k),Math.ceil(k))}});x.fillStyle='#000'}
function SprC(x,rows,cx,cy,s,cols){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=cols[r[i]];if(c){x.fillStyle=c;x.fillRect(Math.round(cx+(i-r.length/2)*s),Math.round(cy+(j-rows.length/2)*s),Math.ceil(s),Math.ceil(s))}}})}
const SP={
 rex:['......XXXXX.','.....XXOXXXX','.....XXXXXXX','.....XXXX...','X...XXXXXX..','XX.XXXXXX.X.','XXXXXXXXX...','.XXXXXXXX...','..XXXXXX....','...XX.XX....','...X...X....','...XX..XX...'],
 ptero:[['X.........X','XX.......XX','.XXX.X.XXX.','...XXXXX...','....XXX....'],['...........','.....X.....','.XXXXXXXXX.','XX.XXXXX.XX','X...XXX...X']],
 invader:[['..X.....X..','...X...X...','..XXXXXXX..','.XX.XXX.XX.','XXXXXXXXXXX','X.XXXXXXX.X','X.X.....X.X','...XX.XX...'],['..X.....X..','X..X...X..X','X.XXXXXXX.X','XXX.XXX.XXX','XXXXXXXXXXX','.XXXXXXXXX.','..X.....X..','.X.......X.']],
 alien:['...XXXXX...','.XXXXXXXXX.','XXXXXXXXXXX','XOOOXXXOOOX','XOOOOXOOOOX','XXOOXXXOOXX','.XXXXXXXXX.','..XXXXXXX..','...XXXXX...','....XXX....'],
 ufo:['....XXX....','...XOOOX...','.XXXXXXXXX.','XLXLXLXLXLX','.XXXXXXXXX.'],
 car:['.XXXX.','XWXXWX','XXXXXX','.O..O.'],
 comet:['....XX','..XXXX','XXXXX.','XXX...']};
// ---------- décors et animations propres à chaque univers ----------
const DECO={
 dino(x,k,p){// jungle : feuillages, empreintes, os, silhouette de T-rex, volcan autour du cratère
  for(let i=0;i<70;i++){const sx=(i*37)%184+8,sy=(i*61)%300+40;R(x,X(sx),Y(sy),Math.max(1,k*2),Math.max(1,k),i%3?'rgba(120,200,80,.12)':'rgba(255,200,90,.1)')}
  for(const[fx,fy,dir]of[[14,170,1],[14,230,1],[170,280,-1],[30,60,1],[160,70,-1]])for(let j=0;j<7;j++){x.globalAlpha=.35;Ln(x,X(fx),Y(fy+j*4),X(fx+dir*(9-j)),Y(fy+j*4-3),j%2?'#3f8a3a':'#5fae4a',Math.max(1,Math.round(k)));x.globalAlpha=1}
  for(let i=0;i<5;i++){const fx=58+i*16,fy=310-i*12;x.globalAlpha=.18;D(x,X(fx),Y(fy),2.2*k,'#2a1a0a');D(x,X(fx-2),Y(fy-3),k,'#2a1a0a');D(x,X(fx+2),Y(fy-3),k,'#2a1a0a');x.globalAlpha=1}
  x.globalAlpha=.2;Spr(x,SP.rex,92,268,2.2,{X:'#0a1a06',O:'#ff9a1f'});x.globalAlpha=1;
  x.globalAlpha=.35;Ln(x,X(120),Y(300),X(132),Y(296),'#e8dcc0',Math.max(1,Math.round(k*1.5)));D(x,X(120),Y(300),k*1.5,'#e8dcc0');D(x,X(132),Y(296),k*1.5,'#e8dcc0');x.globalAlpha=1;
  // volcan : cône de roche, coulées de lave
  x.fillStyle='#4a2a14';x.beginPath();x.moveTo(X(70),Y(226));x.lineTo(X(84),Y(203));x.lineTo(X(100),Y(203));x.lineTo(X(114),Y(226));x.closePath();x.fill();
  x.fillStyle='#6a3a1a';x.beginPath();x.moveTo(X(78),Y(226));x.lineTo(X(86),Y(206));x.lineTo(X(92),Y(206));x.lineTo(X(88),Y(226));x.closePath();x.fill();
  Ln(x,X(87),Y(206),X(82),Y(222),'#ff6a1f',Math.max(1,Math.round(k)));Ln(x,X(97),Y(206),X(103),Y(220),'#ff9a1f',Math.max(1,Math.round(k)))},
 dinoA(x,t,k){// fumée du volcan, lueur de lave, ptérodactyle
  const g=.5+.5*Math.sin(t*3);x.globalAlpha=.25+.25*g;D(x,X(92),Y(200),9*k,'#ff6a1f');x.globalAlpha=1;
  for(let i=0;i<5;i++){const ph=(t*.35+i/5)%1;x.globalAlpha=.3*(1-ph);D(x,X(92+Math.sin(t+i*2)*4+ph*6),Y(190-ph*44),(2+ph*6)*k,'#c8c0b0');x.globalAlpha=1}
  const c=(t/11)%1;if(c<.5){const u=c/.5;Spr(x,SP.ptero[Math.floor(t*5)%2],-10+u*220,62+Math.sin(u*9)*6,1.4,{X:'#3a2a1a'})}},
 alien(x,k){// grille verte, étoiles, cercles de culture, visage d'extraterrestre
  for(let i=0;i<60;i++){const sx=(i*53)%184+8,sy=(i*89)%330+20;R(x,X(sx),Y(sy),1,1,i%4?'rgba(200,255,220,.45)':'rgba(200,120,255,.5)')}
  x.globalAlpha=.08;for(let gy=40;gy<400;gy+=20)Ln(x,X(8),Y(gy),X(192),Y(gy),'#39ff6a',1);for(let gx=8;gx<192;gx+=20)Ln(x,X(gx),Y(0),X(gx),Y(400),'#39ff6a',1);x.globalAlpha=1;
  x.globalAlpha=.16;for(const[r,c]of[[22,'#39ff6a'],[15,'#39ff6a'],[8,'#c84fff']]){const n=Math.round(r*k*6);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;R(x,X(92)+Math.cos(a)*r*k,Y(268)+Math.sin(a)*r*k,Math.max(1,k),Math.max(1,k),c)}}x.globalAlpha=1;
  x.globalAlpha=.2;Spr(x,SP.alien,92,268,1.8,{X:'#39ff6a',O:'#020604'});x.globalAlpha=1;
  x.globalAlpha=.35;D(x,X(26),Y(160),11*k,'#0a3a1a');x.globalAlpha=1},
 alienA(x,t,k){// étoiles qui clignotent, rayon tracteur, petite soucoupe qui passe
  for(let i=0;i<10;i++){const sx=(i*71)%170+14,sy=(i*43)%250+30;if(Math.sin(t*3+i*1.7)>.6)R(x,X(sx),Y(sy),Math.max(1,k*1.2),Math.max(1,k*1.2),'#e0ffe8')}
  const p=.5+.5*Math.sin(t*4);x.globalAlpha=.15+.2*p;x.fillStyle='#39ff6a';x.beginPath();x.moveTo(X(20),Y(140));x.lineTo(X(32),Y(140));x.lineTo(X(38),Y(170));x.lineTo(X(14),Y(170));x.closePath();x.fill();x.globalAlpha=1;
  const c=(t/9)%1;if(c<.45){const u=c/.45,ux=200-u*210,uy=60+Math.sin(u*12)*5;Spr(x,SP.ufo,ux,uy,1.3,{X:'#a0a8b8',O:'#7affe0',L:Math.floor(t*8)%2?'#ff4f6a':'#ffe14f'});x.globalAlpha=.2;x.fillStyle='#7affe0';x.beginPath();x.moveTo(X(ux-3),Y(uy+3));x.lineTo(X(ux+3),Y(uy+3));x.lineTo(X(ux+9),Y(uy+30));x.lineTo(X(ux-9),Y(uy+30));x.closePath();x.fill();x.globalAlpha=1}},
 city(x,k){// ville du futur : lune, étoiles, silhouettes d'immeubles, grille néon, route
  for(let i=0;i<40;i++){const sx=(i*53)%184+8,sy=(i*37)%120+20;R(x,X(sx),Y(sy),1,1,'rgba(255,255,255,.5)')}
  D(x,X(40),Y(64),9*k,'rgba(255,230,180,.25)');D(x,X(43),Y(62),7*k,'#0a0a2e');
  const bl=[[10,20,248],[30,14,258],[44,18,240],[62,12,256],[136,16,244],[152,12,236],[164,14,252]];
  bl.forEach(([bx,bw,by],j)=>{R(x,X(bx),Y(by),bw*k,(278-by)*k,'#160a36');for(let wy=by+3;wy<276;wy+=5)for(let wx=bx+2;wx<bx+bw-2;wx+=4)if((wx*7+wy*3+j)%5<2)R(x,X(wx),Y(wy),Math.max(1,k*1.5),Math.max(1,k*1.5),'rgba(255,225,79,.45)')});
  x.globalAlpha=.14;for(let i=-6;i<=6;i++)Ln(x,X(92),Y(282),X(92+i*24),Y(400),'#ff4fd8',1);for(let gy=290;gy<400;gy+=(gy-270)*.35)Ln(x,X(8),Y(gy),X(192),Y(gy),'#ff4fd8',1);x.globalAlpha=1;
  R(x,X(8),Y(280),184*k,Math.max(1,k*1.2),'rgba(56,225,255,.35)');
  // gratte-ciel central (obstacle)
  R(x,X(110),Y(150),18*k,35*k,'#1e1050');for(let wy=154;wy<183;wy+=5)for(let wx=116;wx<126;wx+=4)R(x,X(wx),Y(wy),Math.max(1,k*1.5),Math.max(1,k*2),'rgba(56,225,255,.3)');
  x.fillStyle='#1e1050';x.beginPath();x.moveTo(X(110),Y(150));x.lineTo(X(119),Y(140));x.lineTo(X(128),Y(150));x.closePath();x.fill();R(x,X(118.5),Y(132),Math.max(1,k),8*k,'#38e1ff')},
 cityA(x,t,k){// fenêtres qui s'allument, voitures volantes, antenne, projecteurs
  if(Math.floor(t*2)%2)D(x,X(119),Y(132),1.6*k,'#ff4f6a');
  for(let i=0;i<6;i++){const wy=154+(i%3)*10,wx=116+(i>2?4:0);if(Math.sin(t*1.3+i*2.1)>.2)R(x,X(wx),Y(wy),Math.max(1,k*1.5),Math.max(1,k*2),'#ffe14f')}
  for(let i=0;i<3;i++){const u=((t*.12+i/3)%1),cx=i%2?200-u*210:-10+u*210,cy=226+i*8;Spr(x,SP.car,cx,cy,1,{X:i%2?'#ff4fd8':'#38e1ff',W:'#ffffff',O:'#ffe14f'})}
  x.globalAlpha=.07;for(const s of[-1,1]){const a=-Math.PI/2+s*.5+Math.sin(t*.7)*.35*s;x.fillStyle='#d0f8ff';x.beginPath();x.moveTo(X(92),Y(282));x.lineTo(X(92+Math.cos(a-.06)*240),Y(282+Math.sin(a-.06)*240));x.lineTo(X(92+Math.cos(a+.06)*240),Y(282+Math.sin(a+.06)*240));x.closePath();x.fill()}x.globalAlpha=1},
 space(x,k){// galaxie : nébuleuses, étoiles, spirale lointaine
  for(const[nx,ny,nr,c]of[[50,90,40,'rgba(255,79,163,.07)'],[150,200,45,'rgba(79,209,255,.07)'],[60,260,35,'rgba(180,140,255,.08)']])for(let i=0;i<5;i++)D(x,X(nx+i*3),Y(ny-i*2),(nr-i*7)*k,c);
  for(let i=0;i<110;i++){const sx=(i*53)%184+8,sy=(i*97)%370+10;R(x,X(sx),Y(sy),1,1,i%7?'rgba(255,255,255,.55)':'#ffd166')}
  x.globalAlpha=.25;for(let i=0;i<60;i++){const a=i*.35,r=i*.5;R(x,X(150+Math.cos(a)*r),Y(290+Math.sin(a)*r*.5),Math.max(1,k),Math.max(1,k),i%2?'#b48cff':'#ffffff')}x.globalAlpha=1;
  x.globalAlpha=.25;D(x,X(25),Y(172),12*k,'#1a3a6a');D(x,X(160),Y(140),9*k,'#1a3a6a');x.globalAlpha=1},
 spaceA(x,t,k){// étoiles scintillantes, disque du trou noir qui tourne, trous de ver, étoile filante
  for(let i=0;i<14;i++){const sx=(i*47)%170+14,sy=(i*83)%330+20,s=Math.sin(t*2.5+i);if(s>.5){R(x,X(sx),Y(sy),Math.max(1,k*1.4),Math.max(1,k*1.4),'#ffffff');if(s>.9){R(x,X(sx)-k*2,Y(sy),k*5,1,'rgba(255,255,255,.6)');R(x,X(sx),Y(sy)-k*2,1,k*5,'rgba(255,255,255,.6)')}}}
  const n=22;for(let i=0;i<n;i++){const a=t*2.2+i/n*Math.PI*2,r=11+Math.sin(i*1.3)*1.5;R(x,X(96+Math.cos(a)*r),Y(128+Math.sin(a)*r*.55),Math.max(1,k*1.4),Math.max(1,k*1.4),i%3?'#ff9a1f':'#ffd166')}
  for(const[wx,wy]of[[25,172],[160,140]])for(let i=0;i<10;i++){const a=-t*3+i*.7,r=1+i*.75;R(x,X(wx+Math.cos(a)*r),Y(wy+Math.sin(a)*r),Math.max(1,k),Math.max(1,k),i%2?'#4fd1ff':'#d8f6ff')}
  const c=(t/7)%1;if(c<.15){const u=c/.15;x.globalAlpha=1-u;Spr(x,SP.comet,180-u*150,30+u*90,1.2,{X:'#ffffff'});x.globalAlpha=1}}};
// bumpers dessinés selon l'univers
function drawBumper(x,td,c,f,lit,t){const k=V.k,cx=X(c.x),cy=Y(c.y),r=c.r*k,id=c.id;if(f>0){x.globalAlpha=f*.6;D(x,cx,cy,r*1.6,td.pal.accent);x.globalAlpha=1}
 if(td.id=='dino'){// œuf de dinosaure
  El(x,cx,cy+2,r*.95,r*1.15,'#05040e');El(x,cx,cy,r*.95,r*1.15,'#3a2a14');El(x,cx,cy,r*.85,r*1.05,f>0?'#ffffff':'#efe2bf');
  for(const[a,b,s]of[[-.3,-.4,.18],[.35,-.1,.14],[-.1,.35,.16],[.3,.45,.1]])D(x,cx+a*r,cy+b*r,s*r,'#8a6a3a');
  if(lit){Ln(x,cx-r*.5,cy-r*.1,cx-r*.1,cy+r*.2,'#ff9a1f',Math.max(1,Math.round(k)));Ln(x,cx-r*.1,cy+r*.2,cx+r*.4,cy-r*.15,'#ff9a1f',Math.max(1,Math.round(k)));x.globalAlpha=.25+.15*Math.sin(t*6);D(x,cx,cy,r*1.2,'#ff9a1f');x.globalAlpha=1}
  D(x,cx-r*.3,cy-r*.55,r*.18,'#ffffff')}
 else if(td.id=='alien'){// soucoupe volante
  El(x,cx,cy+2,r*1.1,r*.6,'#05040e');D(x,cx,cy-r*.2,r*.55,'#05040e');D(x,cx,cy-r*.25,r*.48,f>0?'#ffffff':lit?'#7cff6b':'#7affe0');D(x,cx-r*.15,cy-r*.42,r*.14,'#ffffff');
  El(x,cx,cy+r*.15,r*1.05,r*.48,'#5a6070');El(x,cx,cy+r*.08,r*.98,r*.38,f>0?'#ffffff':'#a8b0c0');
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*3;if(Math.sin(a)<0)continue;D(x,cx+Math.cos(a)*r*.8,cy+r*.12+Math.sin(a)*r*.25,Math.max(1,r*.12),(i+Math.floor(t*6))%3==0?'#ff4f6a':lit?'#7cff6b':'#ffe14f')}}
 else if(td.id=='city'){// enseigne néon ronde
  const c1=id%2?'#ff4fd8':'#38e1ff';D(x,cx,cy+2,r+1,'#05040e');D(x,cx,cy,r+1,'#0a0618');D(x,cx,cy,r,f>0?'#ffffff':c1);D(x,cx,cy,r*.78,'#140a30');D(x,cx,cy,r*.55,f>0?'#ffffff':lit?'#ffe14f':c1);D(x,cx,cy,r*.32,'#140a30');
  x.globalAlpha=.3+.2*Math.sin(t*8+id);D(x,cx,cy,r*1.25,c1);x.globalAlpha=1;D(x,cx,cy,r*.15,lit?'#ffe14f':'#ffffff')}
 else{// planètes
  const P2=[['#c8442a','#ff7a4a'],['#d8a84a','#ffe08a'],['#2a6ad8','#4fd16b'],['#7a3ac8','#c890ff'],['#d87a2a','#ffc07a']][id%5];
  if(lit){x.globalAlpha=.3+.15*Math.sin(t*5+id);D(x,cx,cy,r*1.35,P2[1]);x.globalAlpha=1}D(x,cx,cy+2,r+1,'#05040e');D(x,cx,cy,r,f>0?'#ffffff':P2[0]);
  if(id==2){D(x,cx-r*.3,cy-r*.2,r*.35,P2[1]);D(x,cx+r*.35,cy+r*.3,r*.25,P2[1])}else if(id==4){for(let j=-2;j<=2;j++)R(x,cx-r*.9,cy+j*r*.3,r*1.8,Math.max(1,r*.12),P2[1])}else D(x,cx+r*.2,cy+r*.15,r*.3,P2[1]);
  D(x,cx-r*.35,cy-r*.4,r*.2,'rgba(255,255,255,.7)');if(id==1){for(let i=0;i<40;i++){const a=i/40*Math.PI*2,px=cx+Math.cos(a)*r*1.6,py=cy+Math.sin(a)*r*.45;if(Math.sin(a)<0&&Math.abs(Math.cos(a))<.6)continue;R(x,px,py,Math.max(1,k),Math.max(1,k),'#ffe08a')}}}}
function drawSaucer(x,td,c,t,f){const k=V.k,cx=X(c.x),cy=Y(c.y),r=c.r*k;
 if(td.id=='dino'){D(x,cx,cy,r+1,'#2a0a04');D(x,cx,cy,r,'#ff4f1f');D(x,cx,cy,r*.6,'#ffd166');if(f>0){x.globalAlpha=f;D(x,cx,cy,r*2,'#ffe14f');x.globalAlpha=1}}
 else if(td.id=='alien'){D(x,cx,cy,r+1,'#05040e');D(x,cx,cy,r,'#0a3a1a');const n=3;for(let i=0;i<n;i++){const ph=(t*1.5+i/n)%1;x.globalAlpha=1-ph;const m=Math.round(r*ph*7)+4;for(let j=0;j<m;j++){const a=j/m*Math.PI*2;R(x,cx+Math.cos(a)*r*ph,cy+Math.sin(a)*r*ph,1,1,'#39ff6a')}}x.globalAlpha=1;D(x,cx,cy,r*.3,'#c84fff')}
 else if(td.id=='city'){const s=r*1.1;x.fillStyle='#05040e';x.fillRect(cx-s-1,cy-s-1,2*s+2,2*s+2);x.fillStyle=Math.floor(t*3)%2?'#ff4fd8':'#7a1a6a';x.fillRect(cx-s,cy-s,2*s,2*s);x.fillStyle='#140a30';x.fillRect(cx-s*.6,cy-s*.6,s*1.2,s*1.2);axCText(x,'T',cx,cy-3,'#ffe14f',1)}
 else{if(c.id==0){D(x,cx,cy,r*1.3,'#ff9a1f');D(x,cx,cy,r,'#000000')}else{D(x,cx,cy,r,'#0a1a3a');D(x,cx,cy,r*.4,'#d8f6ff')}if(f>0){x.globalAlpha=f;D(x,cx,cy,r*2,'#ffffff');x.globalAlpha=1}}}
// éléments dynamiques (bumpers, cibles, voyants), aussi utilisés pour l'aperçu de l'écran de choix
function drawDyn(x,td,st,t){const tb=td.tb,k=V.k,pal=td.pal,lit=st.lit,fl=st.flash;
 tb.C.forEach(c=>{if(c.type=='bumper')drawBumper(x,td,c,fl.bump[c.id]||0,lit.bump[c.id],t);if(c.type=='saucer')drawSaucer(x,td,c,t,fl.sau[c.id]||0)});
 tb.S.forEach(s=>{if(s.type=='stand'){const on=lit.stand[s.id],f=fl.stand[s.id];LnL(x,s.a,s.b,'#0a0618',Math.max(3,Math.round(k*3.2)));LnL(x,s.a,s.b,f>0?'#ffffff':pal.stand[on?1:0],Math.max(2,Math.round(k*2.4)))}
  if(s.type=='drop'){const down=lit.drop[s.id],mx2=(s.a[0]+s.b[0])/2,my=(s.a[1]+s.b[1])/2;
   if(td.id=='alien'){if(!down)Spr(x,SP.invader[Math.floor(t*2+s.id)%2],mx2,my-3.5,1.1,{X:(fl.drop[s.id]>0?'#ffffff':s.id%2?'#c84fff':'#39ff6a')});else LnL(x,s.a,s.b,'#1a3a24',1)}
   else if(!down){LnL(x,s.a,s.b,'#0a0618',Math.max(3,Math.round(k*3.4)));LnL(x,s.a,s.b,pal.drop,Math.max(2,Math.round(k*2.6)))}else LnL(x,s.a,s.b,'#3a2a20',1)}
  if(s.type=='sling'&&fl.sling[s.side]>0){x.globalAlpha=fl.sling[s.side];LnL(x,s.a,s.b,pal.slingHi,Math.max(2,Math.round(k*2.4)));x.globalAlpha=1}});
 tb.lanes.forEach((lx,i)=>{D(x,X(lx),Y(40),Math.max(2,2.6*k),'#0a0618');D(x,X(lx),Y(40),Math.max(1,2*k),pal.lane[lit.lane[i]?1:0])});
 for(let i=0;i<5;i++){const on=i<st.mult;D(x,X(80+i*6),Y(300),Math.max(1,1.6*k),on?'#7cff6b':'#1a3a24')}}
// décor fixe de la table (mis en cache)
function drawTable(x,td){const tb=td.tb,k=V.k,pal=td.pal,th=Math.max(1,Math.round(k*1.6));
 const g=x.createLinearGradient(0,Y(0),0,Y(400));g.addColorStop(0,pal.pf[0]);g.addColorStop(.5,pal.pf[1]);g.addColorStop(1,pal.pf[2]);x.fillStyle=g;x.save();x.beginPath();
 x.moveTo(X(8),Y(412));x.lineTo(X(8),Y(100));for(let i=0;i<=24;i++){const t=Math.PI-i/24*Math.PI;x.lineTo(X(100+92*Math.cos(t)),Y(100-92*Math.sin(t)))}x.lineTo(X(192),Y(404));x.closePath();x.fill();x.clip();
 DECO[td.id](x,k);
 const arrow=(ax,ay,dir,c)=>{for(let i=0;i<6;i++)R(x,X(ax)-i*k*.6,Y(ay)+i*k*.9*dir,Math.max(1,i*k*1.2),Math.max(1,k*.9),c)};if(tb.ramp)arrow(tb.ramp.entry[0]+15,190,1,pal.ramp+'99');arrow(184,330,-1,'rgba(255,209,102,.5)');
 x.restore();
 R(x,X(177),Y(113),15*k,291*k,'#0a0618');for(let yy=130;yy<396;yy+=12)R(x,X(183),Y(yy),k*2,k*4,pal.gate+'40');
 for(const s of tb.S){if(s.type=='drop'||s.type=='stand')continue;const col=s.type=='rail'?pal.rail:s.type=='sling'?pal.slingHi:s.type=='gate'?pal.gate:s.type=='rampwall'?pal.ramp:s.type=='deflect'?pal.deflect:s.type=='block'?pal.accent:pal.wall;
  if(s.type=='wall'||s.type=='rampwall'||s.type=='deflect'||s.type=='block'){LnL(x,s.a,s.b,'#05040e',th+2);LnL(x,s.a,s.b,col,th);x.globalAlpha=.5;LnL(x,s.a,s.b,pal.wallHi,1);x.globalAlpha=1}else{LnL(x,s.a,s.b,'#05040e',th+1);LnL(x,s.a,s.b,col,th)}}
 for(const[sx,dir]of[[34,1],[150,-1]]){x.fillStyle=pal.sling;x.beginPath();x.moveTo(X(sx),Y(286));x.lineTo(X(sx),Y(318));x.lineTo(X(sx+16*dir),Y(330));x.closePath();x.fill();x.fillStyle=pal.slingHi;x.globalAlpha=.4;x.beginPath();x.moveTo(X(sx+2*dir),Y(292));x.lineTo(X(sx+2*dir),Y(314));x.lineTo(X(sx+11*dir),Y(322));x.closePath();x.fill();x.globalAlpha=1}
 for(const cc of tb.C)if(cc.type=='post'){D(x,X(cc.x),Y(cc.y),cc.r*k+1,'#05040e');D(x,X(cc.x),Y(cc.y),cc.r*k,'#d6dbe6');D(x,X(cc.x)-cc.r*k*.3,Y(cc.y)-cc.r*k*.3,Math.max(1,cc.r*k*.3),'#ffffff')}
 const lb=td.lbl;tb.lanes.forEach((lx,i)=>{if(lb[i])axCText(x,lb[i],X(lx),Y(52),pal.lane[1]+'aa',1)});
 axCText(x,'OUT',X(15),Y(360),'rgba(255,79,106,.6)',1);axCText(x,'OUT',X(169),Y(360),'rgba(255,79,106,.6)',1)}
function drawRampOv(x,td){const tb=td.tb;if(!tb.ramp)return;const k=V.k,half=6.5,pts=tb.ramp.path.map(p=>[X(p[0]),Y(p[1])]);
 x.globalAlpha=.42;for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l*half*k,ny=dx/l*half*k;x.fillStyle=td.pal.ramp;x.beginPath();x.moveTo(a[0]+nx,a[1]+ny);x.lineTo(b[0]+nx,b[1]+ny);x.lineTo(b[0]-nx,b[1]-ny);x.lineTo(a[0]-nx,a[1]-ny);x.closePath();x.fill()}x.globalAlpha=1;
 for(const s of[1,-1])for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l*half*k*s,ny=dx/l*half*k*s;Ln(x,a[0]+nx,a[1]+ny,b[0]+nx,b[1]+ny,'#05040e',2);Ln(x,a[0]+nx,a[1]+ny,b[0]+nx,b[1]+ny,td.pal.rampHi,1)}
 if(td.id=='dino')for(let i=2;i<pts.length-1;i+=2)D(x,pts[i][0],pts[i][1],Math.max(1,k*1.4),'#3f8a3a');
 if(k>=1)axCText(x,tb.ramp.lbl,X(100),Y(20)-3,'#ffffff',1,'#05040e')}
function pBg(){const w=P.W,h=P.H,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),pal=TD.pal;
 R(x,0,0,w,h,pal.side);for(let i=0;i<w;i+=6)R(x,i,0,1,h,pal.accent+'0f');for(let i=0;i<40;i++)R(x,(i*97)%w,(i*57)%h,1,1,pal.accent2+'55');drawTable(x,TD);return c}
function pOverlay(){const c=document.createElement('canvas');c.width=P.W;c.height=P.H;drawRampOv(c.getContext('2d'),TD);return c}
// ---------- rendu ----------
function pDrawBall(x,b,el){const k=V.k,r=BR*k*(el?1.18:1),cx=X(b.x),cy=Y(b.y);D(x,cx+k,cy+k*1.6,r,'rgba(0,0,0,.35)');D(x,cx,cy,r+1,'#0a0618');D(x,cx,cy,r,'#9aa0b4');D(x,cx+r*.15,cy+r*.15,r*.8,'#7a8096');D(x,cx-r*.1,cy-r*.1,r*.75,'#c9cedd');D(x,cx-r*.25,cy-r*.25,r*.5,'#e8ebf4');D(x,cx-r*.38,cy-r*.42,Math.max(1,r*.22),'#ffffff');R(x,cx+r*.2,cy+r*.35,Math.max(1,r*.35),1,TD.pal.accent+'99')}
function pDrawFlip(x,i){const g=pFlipGeom(i),k=V.k,on=P.fl[i].on,n=Math.max(8,Math.round(g.r0*k*3));
 for(const pass of[0,1,2])for(let j=0;j<=n;j++){const u=j/n,cx=X(g.px+(g.qx-g.px)*u),cy=Y(g.py+(g.qy-g.py)*u),rr=(g.r0+(g.r1-g.r0)*u)*k;D(x,cx,cy,pass==0?rr+1:pass==1?rr:rr*.45,pass==0?'#0a0618':pass==1?(on?'#ffffff':'#e8e6f2'):(i?TD.pal.accent:TD.pal.flip))}
 D(x,X(g.px),Y(g.py),Math.max(1,g.r0*k*.35),'#ffd166')}
function pButton(x,b,col,dk,hl,on,label,arrow){const r=b.r,lift=on?1:Math.max(3,Math.round(r*.14));
 if(on){x.globalAlpha=.35;D(x,b.x,b.y,r*1.35,col);x.globalAlpha=1}
 D(x,b.x,b.y+lift+2,r+3,'#05040e');D(x,b.x,b.y+2,r+2,'#c8ccd8');D(x,b.x,b.y+1,r+1,'#6a6e7a');
 for(let k=lift;k>=0;k--)D(x,b.x,b.y-k+lift,r,k==lift?col:dk);const top=b.y;D(x,b.x,top,r*.82,col);D(x,b.x-r*.28,top-r*.32,r*.3,hl);
 x.globalAlpha=on?.95:.55+.25*Math.sin(P.t*4);const n=Math.round(r*6);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;R(x,b.x+Math.cos(a)*(r+4),b.y+Math.sin(a)*(r+4),1,1,hl)}x.globalAlpha=1;
 const s=Math.max(1,Math.round(r/9));for(let i=0;i<4*s;i++){const hh=Math.round((4*s-i)*.9);R(x,b.x+(arrow<0?-i:i)-(arrow<0?-2*s:2*s),top-hh,1,2*hh+1,'rgba(255,255,255,.85)')}
 axCText(x,label,b.x,b.y+r+8,on?'#ffffff':'#c9c4f0',1,'#05040e')}
function pPlunger(x){const p=P.L.pl,b=P.ball,ready=b&&b.st=='plunger'&&P.phase=='jeu',on=P.ctrl.p&&ready;R(x,p.x,p.y+3,p.w,p.h,'#05040e');R(x,p.x,p.y,p.w,p.h,ready?(Math.floor(P.t*3)%2&&!on?'#ffd23f':'#ffb81f'):'#5a5470');R(x,p.x,p.y,p.w,2,'rgba(255,255,255,.5)');
 const sh=Math.round((p.h-24)*(1-.6*P.pl));for(let i=0;i<6;i++)R(x,p.x+3,p.y+10+i*sh/6,p.w-6,1,'#3a2a08');R(x,p.x+p.w/2-3,p.y+4,6,6,'#3a2a08');
 if(P.pl>0){R(x,p.x-4,p.y+p.h,2,-p.h*P.pl,'#ff4f6a')}
 axCText(x,'LANCER',p.x+p.w/2,p.y+p.h+6,ready?'#ffe14f':'#8f97c0',1,'#05040e')}
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function sqBtn(x,b,on,kind){R(x,b.x,b.y+2,b.w,b.h,'#05040e');R(x,b.x,b.y,b.w,b.h,on?'#ffe14f':'#2a2160');R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.35)');const c=on?'#1a0c20':'#ffffff';
 if(kind=='menu'){for(let i=0;i<3;i++)R(x,b.x+b.w*.25,b.y+b.h*(.27+i*.2),b.w*.5,Math.max(1,b.h*.11),c);return}
 const sx=b.x,sy=b.y,sw=b.w;R(x,sx+sw*.18,sy+sw*.38,sw*.16,sw*.24,c);for(let i=0;i<sw*.28;i++)R(x,sx+sw*.34+i,sy+sw*.38-i*.6,1,sw*.24+i*1.2,c);
 if(P.son==0){R(x,sx+sw*.72,sy+sw*.36,1,sw*.28,c);R(x,sx+sw*.82,sy+sw*.28,1,sw*.44,c)}else if(P.son==1){R(x,sx+sw*.72,sy+sw*.36,1,sw*.28,'#ff9a1f')}else for(let i=0;i<sw*.5;i++)R(x,sx+sw*.25+i,sy+sw*.25+i,2,2,'#ff4f6a')}
// bandeau de score compact : SCORE (afficheur), BEST de la table, BALL, MULTIPLIER — le BEST reste toujours visible
function pHud(x){const L=P.L,w=P.W,pal=TD.pal,best=Math.max(pBest(),P.score),rec=P.recT>0;
 if(!L.land){const H2=L.hud.h;const gg=x.createLinearGradient(0,0,0,H2);gg.addColorStop(0,pal.hud1);gg.addColorStop(1,pal.hud2);x.fillStyle=gg;x.fillRect(0,0,w,H2);
  const fr=(c,o)=>{R(x,o,o,w-2*o,1,c);R(x,o,H2-1-o,w-2*o,1,c);R(x,o,o,1,H2-2*o,c);R(x,w-1-o,o,1,H2-2*o,c)};fr(pal.accent,1);x.globalAlpha=.4+.3*Math.sin(P.t*3);fr(pal.accent2,3);x.globalAlpha=1;
  const bs=L.menu.h;axCText(x,TD.nom,w/2,L.menu.y+Math.round((bs-7)/2),pal.text,axTW(TD.nom,2)<w-2*bs-30&&H2>110?2:1,'#05040e');
  const rowH=20,dy=L.menu.y+bs+4,dh=Math.max(14,H2-dy-rowH-6),dw=w-20,dx=10,sv=fmt(P.score);R(x,dx-2,dy-2,dw+4,dh+4,'#05040e');R(x,dx,dy,dw,dh,'#140806');
  for(let yy=dy+1;yy<dy+dh;yy+=2)for(let xx=dx+1;xx<dx+dw;xx+=2)R(x,xx,yy,1,1,pal.dmd+'14');
  const ds=Math.max(1,Math.min(5,Math.floor((dh-4)/7),Math.floor((dw-40)/Math.max(1,axTW(sv,1)))));if(dh>=24)axText(x,'SCORE',dx+3,dy+2,pal.dmd+'b0');axCText(x,sv,w/2,dy+Math.round((dh-7*ds)/2),pal.dmd,ds,null);
  const y=dy+dh+5,cols=[['BEST',fmt(best),rec?(Math.floor(P.t*8)%2?'#7cff6b':'#ffffff'):'#38e1ff'],['BALL',String(Math.max(0,P.phase=='perdue'?P.balls:P.balls)),'#ff4fa3'],['MULT','X'+P.mult,'#7cff6b']],cw=w/3;
  cols.forEach(([l,v,c],i)=>{const cx=cw*i+cw/2,lt=i==0&&rec?'NEW RECORD':l;axCText(x,lt,cx,y,rec&&i==0?'#7cff6b':'#b9b4e0');axCText(x,v,cx,y+9,c,1,'#05040e')});
  sqBtn(x,L.menu,P.paused,'menu');sqBtn(x,L.son,false,'son')}
 else{const sc=Math.max(1,Math.min(3,Math.floor(L.side/70)));const col=(x0,y,list)=>{list.forEach(([l,v,c])=>{axText(x,l,x0,y,l=='NEW RECORD'?'#7cff6b':'#8f97c0',1);y+=10;axText(x,v,x0,y,c,sc,'#05040e');y+=7*sc+10})};
  axText(x,TD.nom,10,8,pal.text,sc>1?2:1,'#05040e');col(10,8+7*(sc>1?2:1)+10,[['SCORE',fmt(P.score),pal.dmd],[rec?'NEW RECORD':'BEST',fmt(best),rec?(Math.floor(P.t*8)%2?'#7cff6b':'#ffffff'):'#38e1ff']]);col(L.tx+L.tw+10,L.menu.y+L.menu.h+10,[['BALL',String(Math.max(0,P.balls)),'#ff4fa3'],['MULTIPLIER','X'+P.mult,'#7cff6b']]);
  sqBtn(x,L.menu,P.paused,'menu');sqBtn(x,L.son,false,'son')}}
function pDraw(x,w,h){if(!P.L||P.W!=w||P.H!=h)pLayout(w,h);x.imageSmoothingEnabled=false;V.k=P.L.k;V.tx=P.L.tx;V.ty=P.L.ty;
 if(P.phase=='select'){pSelect(x);return}
 if(!P.bg)P.bg=pBg();if(!P.ov)P.ov=pOverlay();x.drawImage(P.bg,0,0);const k=V.k;
 x.save();x.beginPath();x.rect(P.L.tx,P.L.ty,P.L.tw,P.L.th);x.clip();DECO[TD.id+'A'](x,P.t,k);x.restore();
 drawDyn(x,TD,P,P.t);
 const b=P.ball;if(b&&b.st!='ramp'&&!(P.phase=='over'))pDrawBall(x,b,false);
 pDrawFlip(x,0);pDrawFlip(x,1);x.drawImage(P.ov,0,0);if(b&&b.st=='ramp')pDrawBall(x,b,true);
 P.parts.forEach(q=>{x.globalAlpha=Math.min(1,q.l*3);R(x,X(q.x),Y(q.y),Math.max(1,k),Math.max(1,k),q.c)});x.globalAlpha=1;
 P.pops.forEach(p=>{x.globalAlpha=Math.min(1,(.9-p.T)*3);axCText(x,p.t,X(p.x),Y(p.y)-p.T*18,p.c,1,'#05040e');x.globalAlpha=1});
 pHud(x);pButton(x,P.L.bl,'#ff3f7a','#a01a4a','#ffb0cc',P.ctrl.l,'GAUCHE',-1);pButton(x,P.L.br,'#2fb8ff','#1468c4','#b0e4ff',P.ctrl.r,'DROITE',1);pPlunger(x);
 if(P.recT>0)pRecBanner(x);
 if(P.msg&&!(P.recT>0&&P.msg.t=='NEW RECORD !')){const m=P.msg;x.globalAlpha=Math.min(1,(1.6-m.T)*3);const sc=Math.max(1,Math.min(2,Math.floor((P.L.tw-8)/axTW(m.t,1))));axCText(x,m.t,X(92),Y(232)-m.T*6,m.c,sc,'#05040e');x.globalAlpha=1}
 if(P.paused)pPause(x);if(P.phase=='over')pOver(x)}
// animation « NEW RECORD » : bandeau clignotant aux couleurs de l'arc-en-ciel
function pRecBanner(x){const L=P.L,a=Math.min(1,P.recT*2),y=Math.round(Y(150)),cols=['#ff4f6a','#ffe14f','#7cff6b','#38e1ff','#c84fff'],sc=Math.max(1,Math.min(3,Math.floor((L.tw-12)/axTW('NEW RECORD !',1))));
 x.globalAlpha=a*.85;R(x,L.tx,y-8,L.tw,7*sc+16,'#05040e');x.globalAlpha=a;R(x,L.tx,y-8,L.tw,2,cols[Math.floor(P.t*10)%5]);R(x,L.tx,y+7*sc+6,L.tw,2,cols[(Math.floor(P.t*10)+2)%5]);
 axCText(x,'NEW RECORD !',L.tx+L.tw/2,y+Math.round(Math.sin(P.t*10)*2),cols[Math.floor(P.t*12)%5],sc,'#05040e');x.globalAlpha=1}
function pPanel(x,hh){const L=P.L,ph=Math.min(L.th*.8,hh||L.th*.62),a={x:L.tx+4,y:Math.round(L.ty+Math.max(4,(L.th-ph)*.3)),w:L.tw-8,h:ph};R(x,a.x-2,a.y-2,a.w+4,a.h+4,TD.pal.accent);R(x,a.x,a.y,a.w,a.h,'rgba(8,6,30,.94)');return a}
function pBtnRect(x,b,label,col,dk,sel){R(x,b.x,b.y+2,b.w,b.h,dk);R(x,b.x,b.y,b.w,b.h,col);R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.45)');if(sel){x.globalAlpha=.6+.4*Math.sin(P.t*8);R(x,b.x-2,b.y-2,b.w+4,1,'#fff');R(x,b.x-2,b.y+b.h+3,b.w+4,1,'#fff');R(x,b.x-2,b.y-2,1,b.h+6,'#fff');R(x,b.x+b.w+1,b.y-2,1,b.h+6,'#fff');x.globalAlpha=1}axCText(x,label,b.x+b.w/2,b.y+Math.round((b.h-7)/2),'#1a0c20',1)}
function pPause(x){const a=pPanel(x,130),cx=a.x+a.w/2;let y=a.y+12;axCText(x,'PAUSE',cx,y,'#ffffff',2,'#05040e');y+=26;
 const bw=Math.min(a.w-12,170),bh=16;P.pauseBtns=[0,1,2].map(i=>({x:Math.round(cx-bw/2),y:y+i*(bh+8),w:bw,h:bh}));pBtnRect(x,P.pauseBtns[0],'REPRENDRE','#2f7bff','#1a4ac0',P.psel==0);pBtnRect(x,P.pauseBtns[1],['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][P.son],'#4fd16b','#2a8a3a',P.psel==1);pBtnRect(x,P.pauseBtns[2],'RETOUR ARCADE','#9a6bff','#5a35b0',P.psel==2)}
function pOver(x){const a=pPanel(x,236),cx=a.x+a.w/2,o=P.over;let y=a.y+10;const ts=Math.max(1,Math.min(2,Math.floor((a.w-8)/axTW('GAME OVER',1))));
 axCText(x,'GAME OVER',cx,y,'#ff4f6a',ts,'#05040e');y+=7*ts+6;axCText(x,TD.nom,cx,y,TD.pal.accent);y+=13;axCText(x,'SCORE',cx,y,'#8f97c0');y+=10;const ss=Math.max(1,Math.min(3,Math.floor((a.w-8)/axTW(fmt(P.score),1))));axCText(x,fmt(P.score),cx,y,'#ffe14f',ss,'#05040e');y+=7*ss+7;
 if(o.rec){const cols=['#7cff6b','#ffe14f','#38e1ff','#ff4fa3'];axCText(x,'NEW RECORD !',cx,y+Math.round(Math.sin(P.t*9)*1.5),cols[Math.floor(P.t*10)%4],1,'#05040e');if(Math.random()<.3)P.parts.push({x:(cx-V.tx)/V.k+(Math.random()-.5)*60,y:(y-V.ty)/V.k,vx:(Math.random()-.5)*60,vy:-40-Math.random()*40,l:.6,c:cols[Math.random()*4|0]})}
 else axCText(x,'BEST DE LA TABLE '+fmt(o.best),cx,y,'#38e1ff');y+=11;if(o.rec){axCText(x,'BEST DE LA TABLE '+fmt(o.best),cx,y,'#38e1ff');y+=11}axCText(x,'BOULES JOUÉES '+P.played,cx,y,'#c9c4f0');y+=14;
 const bw=Math.min(a.w-10,170),bh=16;P.overBtns=[0,1,2].map(i=>({x:Math.round(cx-bw/2),y:y+i*(bh+7),w:bw,h:bh}));
 if(o.t>.8){pBtnRect(x,P.overBtns[0],'REJOUER','#2f7bff','#1a4ac0',P.osel==0);pBtnRect(x,P.overBtns[1],'CHANGER DE TABLE','#ffd23f','#b8860b',P.osel==1);pBtnRect(x,P.overBtns[2],axTW('RETOUR À LA SALLE D’ARCADE')<=bw-6?'RETOUR À LA SALLE D’ARCADE':'SALLE D’ARCADE','#9a6bff','#5a35b0',P.osel==2)}}
// ---------- écran de choix de la table ----------
function selLayout(){const w=P.W,h=P.H,land=P.L.land,cols=land?4:2,rows=land?1:2,top=Math.max(30,Math.round(h*(land?.11:.09))),bot=Math.max(70,Math.round(h*(land?.2:.15))),pad=Math.max(6,Math.round(w*.02));
 const cw=Math.floor((w-pad*(cols+1))/cols),ch=Math.floor((h-top-bot-pad*(rows+1))/rows),k=Math.min((cw-10)/PW,(ch-34)/412);
 const cards=TABLES.map((t,i)=>{const c=i%cols,r=Math.floor(i/cols);return{x:pad+c*(cw+pad),y:top+pad+r*(ch+pad),w:cw,h:ch,k}});
 const bw=Math.min(w-40,220),bh=Math.max(20,Math.round(bot*.3));return{cards,top,bot,play:{x:Math.round(w/2-bw/2),y:h-bot+Math.round(bot*.08),w:bw,h:bh},back:{x:Math.round(w/2-bw/2),y:h-bot+Math.round(bot*.08)+bh+8,w:bw,h:Math.round(bh*.8)}}}
function pPreview(td,k){const key=td.id+k;if(P.prev[key])return P.prev[key];const c=document.createElement('canvas');c.width=Math.ceil(PW*k)+2;c.height=Math.ceil(412*k)+2;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 const sv={...V};V.k=k;V.tx=0;V.ty=0;const tb=td.tb;drawTable(x,td);drawDyn(x,td,{lit:{stand:Array(tb.nStand).fill(0),drop:Array(tb.nDrop).fill(0),lane:Array(tb.lanes.length).fill(0),bump:Array(tb.nBump).fill(0)},flash:{bump:[],sling:[0,0],stand:[],drop:[],sau:[]},mult:1},0);
 // palettes au repos
 for(const f of FL){const n=12;for(let j=0;j<=n;j++){const u=j/n,cx=f.px+Math.cos(f.rest)*f.len*u,cy=f.py+Math.sin(f.rest)*f.len*u;D(x,X(cx),Y(cy),(f.r0+(f.r1-f.r0)*u)*k,'#e8e6f2')}}
 drawRampOv(x,td);Object.assign(V,sv);P.prev[key]=c;return c}
function pSelect(x){const w=P.W,h=P.H,S=selLayout();P.selL=S;R(x,0,0,w,h,'#07051a');for(let i=0;i<80;i++){const tw=Math.sin(P.t*2+i)>.7;R(x,(i*97)%w,(i*61)%h,tw?2:1,tw?2:1,'rgba(255,255,255,.5)')}
 const ts=Math.max(1,Math.min(4,Math.floor(S.top*.5/7),Math.floor((w-20)/axTW('PINBALL',1))));axCText(x,'PINBALL',w/2,Math.round(S.top*.12),'#ff4fa3',ts,'#05040e','#ffe14f');axCText(x,'CHOISIS TON UNIVERS',w/2,Math.round(S.top*.12)+7*ts+5,'#c9c4f0',1);
 TABLES.forEach((td,i)=>{const c=S.cards[i],on=P.sel==i,pal=td.pal,img=pPreview(td,c.k),px=Math.round(c.x+(c.w-img.width)/2),py=c.y+4;
  R(x,c.x-2,c.y-2,c.w+4,c.h+4,on?(Math.floor(P.t*4)%2?'#ffffff':pal.accent):'#2a2160');R(x,c.x,c.y,c.w,c.h,pal.side);x.drawImage(img,px,py);
  // aperçu animé : le décor de la table bouge sur la carte choisie
  if(on){const sv={...V};V.k=c.k;V.tx=px;V.ty=py;x.save();x.beginPath();x.rect(px,py,img.width,img.height);x.clip();DECO[td.id+'A'](x,P.t,c.k);x.restore();Object.assign(V,sv)}
  const ny=c.y+c.h-28,nm=axTW(td.nom,1)<=c.w-4?td.nom:td.nom.split(' ')[0];R(x,c.x,ny-3,c.w,31,'rgba(5,4,14,.85)');axCText(x,nm,c.x+c.w/2,ny,pal.accent,1,'#05040e');axCText(x,'BEST '+fmt(pBest(td.id)),c.x+c.w/2,ny+11,'#ffffff',1);
  if(on){const nx=c.x+c.w-12,ny2=c.y+8,b=Math.sin(P.t*6)*2;R(x,nx,ny2+b,2,8,'#ffe14f');R(x,nx-3,ny2+7+b,4,3,'#ffe14f');R(x,nx+2,ny2+b,4,2,'#ffe14f')}});
 pBtnRect(x,S.play,'> JOUER : '+(axTW('> JOUER : '+TABLES[P.sel].nom)<S.play.w-6?TABLES[P.sel].nom:TABLES[P.sel].nom.split(' ')[0]),'#ffd23f','#b8860b',true);pBtnRect(x,S.back,axTW('RETOUR À LA SALLE D’ARCADE')<S.back.w-6?'RETOUR À LA SALLE D’ARCADE':'SALLE D’ARCADE','#9a6bff','#5a35b0',false);
 const hint=P.L.land?'FLÈCHES : PALETTES · ESPACE : LANCER LA BOULE':'BOUTONS RONDS : PALETTES · LANCER : BOULE';if(axTW(hint)<w-8)axCText(x,hint,w/2,S.back.y+S.back.h+8,'#8f97c0');
 sqBtn(x,P.L.son,false,'son')}
// ---------- toucher ----------
const inR=(b,x,y)=>b&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function pZone(sx,sy){const L=P.L;if(!L)return null;const pl=L.pl;if(inR({x:pl.x-6,y:pl.y-6,w:pl.w+12,h:pl.h+18},sx,sy))return'P';
 const top=L.bl.y-L.bl.r*2.2;if(Math.hypot(sx-L.bl.x,sy-L.bl.y)<L.bl.r*1.5||(sx<L.tx&&sy>top))return'L';if(Math.hypot(sx-L.br.x,sy-L.br.y)<L.br.r*1.5||(sx>L.tx+L.tw&&sy>top))return'R';return null}
function pPointer(type,sx,sy,id){if(id==null)id=0;pAudio();const L=P.L;if(!L)return;
 if(type=='down'){const pad=b=>({x:b.x-4,y:b.y-4,w:b.w+8,h:b.h+8});if(inR(pad(L.son),sx,sy)&&!(P.phase=='over')){pSon();return}
  if(P.phase=='select'){const S=P.selL;if(!S)return;if(inR(S.play,sx,sy)){pPlay();return}if(inR(S.back,sx,sy)){P.api&&P.api.exit();return}const i=S.cards.findIndex(c=>inR(c,sx,sy));if(i>=0){if(i==P.sel)pPlay();else pPick(i)}return}
  if(P.paused){const k=(P.pauseBtns||[]).findIndex(b=>inR(b,sx,sy));if(k>=0){P.psel=k;pPauseChoice(k)}return}
  if(P.phase!='over'&&inR(pad(L.menu),sx,sy)){P.paused=true;P.psel=0;P.touches.clear();return}
  if(P.phase=='over'&&P.over&&P.over.t>.8&&P.overBtns){const k=P.overBtns.findIndex(b=>inR(b,sx,sy));if(k>=0){pOverChoice(k);return}}
  const z=pZone(sx,sy);if(z)P.touches.set(id,z);return}
 if(type=='up'){P.touches.delete(id);return}
 if(type=='move'&&P.touches.has(id)){const z=pZone(sx,sy);if(z&&z!='P')P.touches.set(id,z)}}
function pKey(e){if(!P.api)return;if(e.code=='KeyM')pSon()}
// ---------- cycle de vie ----------
const Pinball={
 start(api){P.api=api;const d=pData();P.son=d.son||0;P.paused=false;P.L=null;P.touches.clear();P.okN=null;P.ball=null;P.score=0;P.balls=3;P.mult=1;P.pops=[];P.parts=[];P.msg=null;P.over=null;P.recT=0;
  P.fl.forEach((f,i)=>{f.a=FL[i].rest;f.w=0;f.on=false});const last=TABLES.findIndex(t=>t.id==d.lastTable);P.sel=last>=0?last:0;useTable(P.sel);P.phase='select';pAudio();pMus(.75,TABLES[P.sel].music);addEventListener('keydown',pKey)},
 update:pUpdate,draw:pDraw,pointer:pPointer,
 stop(){removeEventListener('keydown',pKey);if(P.api){try{const d=pData();d.lastTable=TD.id;if(P.phase!='select')pRecordCheck(0);P.api.save()}catch(e){}}try{JEUSON.sfxLevel(1)}catch(e){}
  P.api=null;P.paused=false;pMus(null);P.touches.clear();P.ctrl={l:false,r:false,p:false};P.phase='select';P.ball=null;P.pops=[];P.parts=[];P.bg=null;P.ov=null;P.L=null;P.prev={};P.recT=0},
 _state:P,_tables:TABLES,get _table(){return TB},_flip:FL,_use:useTable};
ARC.register('pinball',Pinball);
})();
