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
 over:()=>pfx('pbOver',1,1),record:()=>pfx('pbNewRec',1,1),jackReady:()=>pfx('pbJackReady',1,.5),jackpot:()=>pfx('pbJackpot',1,.5),jack:(k)=>pfx('pbJack',k,.2),skill:()=>pfx('pbSkill',1,.3),save:()=>pfx('pbSave',1,.5),hit:(k)=>pfx('pbHit',k,.08),wall:(k)=>pfx('pbWall',k||.6,.06),combo:(k)=>pfx('pbCombo',k,.1),ball:()=>tfx('ball',1,.3),saucer:()=>tfx('saucer',1,.3),sel:()=>pfx('pbSel',1,.05)};
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
TABLES.push({id:'west',nom:'FAR WEST',music:'pb_west',sfx:{bump:'wwBump',target:'wwTarget',bonus:'wwBonus',drain:'wwDrain',saucer:'wwSaucer',ball:'wwBall'},lbl:'SHÉRIF',
  pal:{side:'#140a04',pf:['#b65a26','#6e3417','#2a1208'],wall:'#f0c27a',wallHi:'#fff0d0',rail:'#d9b27a',sling:'#3a1a08',slingHi:'#ff9a3a',deflect:'#ff6a2a',gate:'#ffd166',ramp:'#f0c27a',rampHi:'#fff0d0',
   accent:'#ffb347',accent2:'#ff6a3a',stand:['#5a3a1a','#ffd166'],drop:'#ff8a3a',lane:['#4a2a10','#ffd166'],hud1:'#2a1408',hud2:'#140a04',dmd:'#ffb347',flip:'#e0642e',text:'#ffe6c0'},
  build(){const S=[],C=[];frame(S,C);rowV(S,'stand',46,166,4,43);rowV(S,'drop',150,172,3,152);const xs=lanes(S,C,[60,84,108,132]);
   C.push(bump(62,106,9,0),bump(96,94,10,1),bump(130,106,9,2));C.push(post(70,236),post(114,236),post(96,162,2.5));
   C.push({x:96,y:214,r:6,type:'saucer',id:0,hold:1,pts:2500,msg:'DUEL !',ev:()=>[(Math.random()<.5?-1:1)*(90+Math.random()*60),-230]});
   C.push({x:160,y:150,r:6,type:'saucer',id:1,hold:.8,pts:1200,msg:'MINE D’OR !',exit:[96,58],ev:()=>[(Math.random()-.5)*60,40]});
   return{S,C,lanes:xs,ramp:null}}});
TABLES.forEach(t=>{t.tb=t.build();t.tb.nStand=t.tb.S.filter(s=>s.type=='stand').length;t.tb.nDrop=t.tb.S.filter(s=>s.type=='drop').length;t.tb.nBump=t.tb.C.filter(c=>c.type=='bumper').length;t.tb.sau=t.tb.C.filter(c=>c.type=='saucer');
 if(t.tb.ramp){const R=t.tb.ramp.path;let L=0;for(let i=1;i<R.length;i++)L+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);t.tb.ramp.len=L}});
let TD=TABLES[0],TB=TD.tb;
function rampAt(d){const RP=TB.ramp.path;for(let i=1;i<RP.length;i++){const a=RP[i-1],b=RP[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l){const u=d/l;return{x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u,dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}d-=l}
 const a=RP[RP.length-2],b=RP[RP.length-1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return{x:b[0],y:b[1],dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}
// palettes : pivot, longueur, rayons, angles (repère écran, y vers le bas)
const FL=[{px:54,py:350,len:33,r0:5.5,r1:3,rest:.5,up:-.48,side:0},{px:130,py:350,len:33,r0:5.5,r1:3,rest:Math.PI-.5,up:Math.PI+.48,side:1}];
// ---------- état ----------
const P={api:null,phase:'select',W:0,H:0,L:null,ball:null,fl:[{a:FL[0].rest,w:0,on:false},{a:FL[1].rest,w:0,on:false}],score:0,balls:3,mult:1,t:0,pops:[],parts:[],
 lit:{},flash:{},chain:0,chainT:0,rampCombo:0,rampT:0,pl:0,charging:false,msg:null,touches:new Map(),ctrl:{l:false,r:false,p:false},okN:null,sel:0,tsel:0,over:null,stuckT:0,lastLaneIn:-1,dropT:0,son:0,recT:0,saveT:0,sauCd:[],hold:null,played:0,prev:{},trail:[],combo:0,comboT:0,comboMax:0,jack:0,jackReady:false,jackVal:20000,jackN:0,level:0,ballSave:0,skill:-1,skillT:0,shake:0,flashScr:0,big:null,cache:{}};
function resetLit(){P.lit={stand:Array(TB.nStand).fill(0),drop:Array(TB.nDrop).fill(0),lane:Array(TB.lanes.length).fill(0),bump:Array(TB.nBump).fill(0)};
 P.flash={bump:Array(TB.nBump).fill(0),sling:[0,0],stand:Array(TB.nStand).fill(0),drop:Array(TB.nDrop).fill(0),sau:Array(TB.sau.length).fill(0)};P.sauCd=Array(TB.sau.length).fill(0)}
function useTable(i){P.tsel=i;TD=TABLES[i];TB=TD.tb;resetLit()}
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
 P.combo=0;P.comboT=0;P.comboMax=0;P.jack=0;P.jackReady=false;P.jackVal=20000;P.jackN=0;P.level=0;P.big=null;P.shake=0;P.flashScr=0;P.trail=[];
 P.best0=pBest();const d=pData();d.tables[TD.id].parties=(d.tables[TD.id].parties||0)+1;pNewBall();PS.start();pMus(1);P.stats={bump:0,ramp:0,targets:0,saucer:0}}
function pNewBall(){P.ball={x:184,y:396-BR,vx:0,vy:0,st:'plunger',rd:0};P.pl=0;P.charging=false;P.stuckT=0;P.played++;P.trail=[];P.ballSave=0;P.skill=Math.floor(Math.random()*TB.lanes.length);P.skillT=0;P.msg={t:'BOULE '+(4-P.balls),c:'#ffe14f',T:0}}
function pAdd(pts,x,y,col){const v=pts*P.mult;P.score+=v;P.pops.push({t:'+'+fmt(v),x,y,T:0,c:col||'#ffe14f',big:v>=5000});if(v>=5000){P.shake=Math.max(P.shake,.22);P.flashScr=Math.max(P.flashScr,.18)}if(P.pops.length>14)P.pops.shift()}
// ---------- combos, jackpot, tir d'adresse ----------
// combo : cibles, passages, rampes et trous touchés à moins de 2,2 s d'intervalle
function pHit(x,y){if(P.comboT>0){P.combo++;if(P.combo>=2){pAdd(150*P.combo,x,y-10,'#ffd166');PS.hit(Math.min(8,P.combo));P.comboMax=Math.max(P.comboMax,P.combo);if(P.combo==4||P.combo==7)pJack('COMBO X'+P.combo)}}else P.combo=1;P.comboT=2.2}
// jauge JACKPOT : 4 voyants allumés par les grands objectifs ; une fois pleine, le tir principal rapporte le jackpot
function pJack(why){if(P.jackReady)return;P.jack=Math.min(4,P.jack+1);PS.jack(P.jack);if(P.jack>=4){P.jackReady=true;P.msg={t:'JACKPOT PRÊT : '+(TB.ramp?'PRENDS LA RAMPE':'VISE LE TROU'),c:'#ffd166',T:0};PS.jackReady()}else P.msg={t:why+' · JACKPOT '+P.jack+'/4',c:'#ffd166',T:0}}
function pJackpot(x,y){const v=P.jackVal;pAdd(v,x,y,'#ffd166');P.big={t:P.jackN?'SUPER JACKPOT':'JACKPOT',v:v*P.mult,T:0};P.flashScr=.45;P.shake=.4;PS.jackpot();P.jackN++;P.jackVal+=15000;P.jack=0;P.jackReady=false;P.level=Math.min(6,P.level+1);
 for(let i=0;i<46;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*200;P.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5+Math.random()*.6,c:['#ffd166','#ffffff',TD.pal.accent,TD.pal.accent2][i%4]})}}
function pFx(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=40+Math.random()*90;P.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.3+Math.random()*.3,c})}}
function pMultUp(why){if(P.mult<5){P.mult++;P.msg={t:'MULTIPLICATEUR X'+P.mult,c:'#38e1ff',T:0}}else P.msg={t:why,c:'#38e1ff',T:0};PS.bonus();pJack(why)}
// ---------- physique ----------
function pCollideSeg(b,s){if(s.type=='drop'&&P.lit.drop[s.id])return;const ax=s.a[0],ay=s.a[1],bx=s.b[0],by=s.b[1],ex=bx-ax,ey=by-ay,L2=ex*ex+ey*ey;let t=((b.x-ax)*ex+(b.y-ay)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=ax+ex*t,cy=ay+ey*t;let dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy);if(d>=BR)return;
 if(s.type=='gate'&&!(b.vy>0&&b.y<cy))return;
 if(s.type=='rampwall'&&!(b.vy<0&&b.y>cy))return;
 let nx,ny;if(d>1e-6){nx=dx/d;ny=dy/d}else{const L=Math.sqrt(L2);nx=-ey/L;ny=ex/L}b.x=cx+nx*BR;b.y=cy+ny*BR;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+s.e)*vn*nx;b.vy-=(1+s.e)*vn*ny;b.vx*=.995;b.vy*=.995;const imp=-vn;
  if(s.type=='sling'&&imp>35){b.vx+=nx*s.kick;b.vy+=ny*s.kick;P.flash.sling[s.side]=1;pAdd(10,cx,cy,'#ffffff');PS.sling();pFx(cx,cy,TD.pal.slingHi,6);pChain()}
  else if(s.type=='stand'&&imp>20){P.flash.stand[s.id]=1;if(!P.lit.stand[s.id]){P.lit.stand[s.id]=1;pAdd(250,cx,cy,'#7cff6b')}else pAdd(50,cx,cy,'#7cff6b');PS.target();P.stats.targets++;pHit(cx,cy);
   if(P.lit.stand.every(Boolean)){pAdd(1000,cx,cy-14,'#38e1ff');P.lit.stand=P.lit.stand.map(()=>0);pMultUp('CIBLES COMPLÈTES')}}
  else if(s.type=='drop'&&imp>20){P.lit.drop[s.id]=1;P.flash.drop[s.id]=1;pAdd(300,cx,cy,'#ff9a1f');PS.drop();P.stats.targets++;pHit(cx,cy);pFx(cx,cy,TD.pal.drop,8);
   if(P.lit.drop.every(Boolean)){pAdd(1500,cx,cy-14,'#38e1ff');P.dropT=1.6;pMultUp('BANQUE COMPLÈTE')}}
  else if(imp>120)PS.wall(Math.min(1,imp/500))}}
function pCollideCirc(b,c){if(c.type=='saucer')return;const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy),R=BR+c.r;if(d>=R)return;const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=c.x+nx*R;b.y=c.y+ny*R;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+c.e)*vn*nx;b.vy-=(1+c.e)*vn*ny}
 if(c.type=='bumper'){const kk=c.kick*(1+.04*P.level);b.vx+=nx*kk;b.vy+=ny*kk;P.flash.bump[c.id]=1;P.lit.bump[c.id]=1;pAdd(100,c.x,c.y-c.r,'#ff4fa3');PS.bump();pFx(c.x+nx*c.r,c.y+ny*c.r,TD.pal.accent,8);P.stats.bump++;pChain();
  if(P.lit.bump.every(Boolean)){P.lit.bump=P.lit.bump.map(()=>0);pAdd(500,c.x,c.y,'#38e1ff');PS.bonus()}}}
function pChain(){if(P.chainT>0){P.chain++;if(P.chain>=3){pAdd(25*P.chain,P.ball.x,P.ball.y-12,'#ffd166');PS.combo(P.chain);if(P.chain==5||P.chain==10){pAdd(250*P.chain,P.ball.x,P.ball.y-20,'#ff4fa3');P.msg={t:'SÉRIE BUMPERS X'+P.chain,c:'#ff4fa3',T:0}}if(P.chain==8)pJack('SÉRIE BUMPERS')}}else P.chain=1;P.chainT=1.4}
function pFlipGeom(i){const f=FL[i],a=P.fl[i].a;return{px:f.px,py:f.py,qx:f.px+Math.cos(a)*f.len,qy:f.py+Math.sin(a)*f.len,r0:f.r0,r1:f.r1,w:P.fl[i].w}}
function pCollideFlip(b,i){const g=pFlipGeom(i),ex=g.qx-g.px,ey=g.qy-g.py,L2=ex*ex+ey*ey;let t=((b.x-g.px)*ex+(b.y-g.py)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=g.px+ex*t,cy=g.py+ey*t,rr=g.r0+(g.r1-g.r0)*t,dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy),R=BR+rr;if(d>=R)return;
 const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=cx+nx*R;b.y=cy+ny*R;
 const vcx=-g.w*(b.y-g.py),vcy=g.w*(b.x-g.px),rvx=b.vx-vcx,rvy=b.vy-vcy,vn=rvx*nx+rvy*ny;if(vn<0){const e=.3;b.vx=rvx-(1+e)*vn*nx+vcx;b.vy=rvy-(1+e)*vn*ny+vcy}}
function pFlippers(dt){for(let i=0;i<2;i++){const f=FL[i],s=P.fl[i],on=i?P.ctrl.r:P.ctrl.l;if(on&&!s.on)PS.flip();s.on=on;const target=on?f.up:f.rest,dir=Math.sign(target-s.a),sp=on?24:15,old=s.a;
  if(dir){s.a+=dir*sp*dt;if((dir>0&&s.a>target)||(dir<0&&s.a<target))s.a=target}s.w=(s.a-old)/dt}}
function pStep(dt){const b=P.ball;pFlippers(dt);for(let i=0;i<P.sauCd.length;i++)if(P.sauCd[i]>0)P.sauCd[i]-=dt;
 if(b.st=='ramp'){b.rd+=b.rs*dt;b.rs=Math.max(170,b.rs-120*dt);const q=rampAt(b.rd);b.x=q.x;b.y=q.y;
  if(b.rd>=TB.ramp.len){b.st='play';b.vx=q.dx*b.rs*.6;b.vy=Math.max(80,q.dy*b.rs*.6);P.stats.ramp++;P.rampCombo=P.rampT>0?P.rampCombo+1:1;P.rampT=5;const pts=500*P.rampCombo;pAdd(pts,b.x,b.y-14,'#38e1ff');PS.ramp(P.rampCombo);P.msg={t:P.rampCombo>1?'RAMPE COMBO X'+P.rampCombo:TB.ramp.lbl+' !',c:'#38e1ff',T:0};if(P.rampCombo>=3)pMultUp('SUPER COMBO !');pHit(b.x,b.y);if(P.jackReady)pJackpot(b.x,b.y-20);else if(P.rampCombo==1)pJack(TB.ramp.lbl)}return}
 if(b.st=='plunger'){b.x=184;b.y=396-BR-P.pl*14;b.vx=b.vy=0;return}
 // trou à bonus : la boule est retenue, puis éjectée (ou téléportée)
 if(b.st=='hold'){const H=P.hold;H.t-=dt;b.x=H.c.x;b.y=H.c.y;if(H.t<=0){const c=H.c,v=c.ev();if(c.exit){b.x=c.exit[0];b.y=c.exit[1]}b.vx=v[0];b.vy=v[1];b.st='play';P.sauCd[TB.sau.indexOf(c)]=.8;P.hold=null;pFx(b.x,b.y,TD.pal.accent2,14)}return}
 b.vy+=GRAV*(1+.025*P.level)*dt;const sp=Math.hypot(b.vx,b.vy);if(sp>VMAX){b.vx*=VMAX/sp;b.vy*=VMAX/sp}
 b.x+=b.vx*dt;b.y+=b.vy*dt;
 for(const s of TB.S)pCollideSeg(b,s);for(const c of TB.C)pCollideCirc(b,c);pCollideFlip(b,0);pCollideFlip(b,1);
 const E=TB.ramp&&TB.ramp.entry;if(E&&b.x>E[0]&&b.x<E[1]&&b.y>E[2]&&b.y<E[3]&&b.vy<(E[4]||-150)){b.st='ramp';b.rd=0;b.rs=Math.max(260,Math.hypot(b.vx,b.vy));return}
 for(let i=0;i<TB.sau.length;i++){const c=TB.sau[i];if(P.sauCd[i]<=0&&Math.hypot(b.x-c.x,b.y-c.y)<c.r){b.st='hold';P.hold={c,t:c.hold};P.flash.sau[i]=1;pAdd(c.pts,c.x,c.y-10,TD.pal.accent2);PS.saucer();P.stats.saucer++;P.msg={t:c.msg,c:TD.pal.accent2,T:0};pFx(c.x,c.y,TD.pal.accent,12);pHit(c.x,c.y);if(!TB.ramp&&i==0){if(P.jackReady)pJackpot(c.x,c.y-14);else pJack(c.msg.replace(' !',''))}return}}
 if(b.y>34&&b.y<46){const li=TB.lanes.findIndex(x=>Math.abs(b.x-x)<6);if(li>=0&&li!==P.lastLaneIn){P.lastLaneIn=li;if(P.skillT>0){if(li==P.skill){pAdd(5000,TB.lanes[li],40,'#ffffff');P.msg={t:'SKILL SHOT !',c:'#ffffff',T:0};PS.skill();pJack('SKILL SHOT')}P.skillT=0}pHit(TB.lanes[li],40);if(!P.lit.lane[li]){P.lit.lane[li]=1;pAdd(150,TB.lanes[li],40,'#ffd166');PS.lane()}
   if(P.lit.lane.every(Boolean)){P.lit.lane=P.lit.lane.map(()=>0);pAdd(1000,92,40,'#38e1ff');pMultUp('PASSAGES '+TD.lbl)}}}else P.lastLaneIn=-1;
 if(b.x<-10||b.x>PW+10||b.y<-20||!isFinite(b.x+b.y)){P.balls++;P.played--;pNewBall()}}
// ---------- mise à jour ----------
function pUpdate(dt,inp){dt=Math.min(dt,.05);P.t+=dt;inp=inp||{};const n=inp.okN||0,ok=P.okN!=null&&n>P.okN;P.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 let tl=false,tr=false,tp=false;P.touches.forEach(v=>{if(v=='L')tl=true;else if(v=='R')tr=true;else if(v=='P')tp=true});
 P.ctrl.l=tl||!!inp.left;P.ctrl.r=tr||!!inp.right;P.ctrl.p=tp||!!inp.a;
 if(P.recT>0)P.recT-=dt;
 if(P.phase=='select'){if(q.length){const cols=P.L&&P.L.land?TABLES.length:2,n=TABLES.length;q.forEach(d=>{const s=P.sel,k=d=='left'?-1:d=='right'?1:d=='up'?-cols:cols;P.sel=(P.sel+k+n*3)%n;if(P.sel!=s)pPick(P.sel)})}if(ok)pPlay();pTick(dt);return}
 if(P.phase=='over'){pFlippers(dt);P.over.t+=dt;q.forEach(d=>{P.osel=(P.osel+(d=='right'||d=='down'?1:-1)+3)%3});if(ok&&P.over.t>.8)pOverChoice(P.osel);pTick(dt);return}
 pMus(P.paused?.3:1);
 if(P.paused){q.forEach(d=>{P.psel=(P.psel+(d=='right'||d=='down'?1:-1)+3)%3});if(ok)pPauseChoice(P.psel);return}
 const b=P.ball;
 if(b.st=='plunger'){if(P.ctrl.p){P.charging=true;P.pl=Math.min(1,P.pl+dt*1.3);PS.charge(P.pl)}else if(P.charging){P.charging=false;b.st='play';b.vy=-(640+P.pl*260);b.vx=0;PS.launch(P.pl);P.pl=0;P.msg=null;P.ballSave=Math.max(5,8-P.level*.5);P.skillT=3.5}else{P.skT=(P.skT||0)+dt;if(P.skT>.7){P.skT=0;P.skill=(P.skill+1)%TB.lanes.length}}}
 if(P.phase=='perdue'){P.lostT-=dt;pFlippers(dt);if(P.lostT<=0){if(P.balls<=0)pGameOver();else{P.phase='jeu';pNewBall();PS.ball()}}pTick(dt);return}
 const sp=Math.max(Math.hypot(b.vx,b.vy),300),nsub=Math.min(30,Math.max(4,Math.ceil(sp*dt/(BR*.4)))),h=dt/nsub;for(let i=0;i<nsub;i++){pStep(h);if(b.y>PH+14)break}
 if(b.y>PH+14&&b.st=='play'&&P.ballSave>0){P.ballSave=0;P.played--;pNewBall();P.skill=-1;P.msg={t:'BALL SAVE',c:'#7cff6b',T:0};PS.save();P.chain=0}
 else if(b.y>PH+14&&b.st=='play'){P.balls--;P.phase='perdue';P.lostT=1.6;P.msg={t:P.balls>0?'BOULE PERDUE':'DERNIÈRE BOULE PERDUE',c:'#ff4f6a',T:0};PS.drain();P.chain=0;pSave()}
 if(b.st=='play'){if(P.ballSave>0)P.ballSave-=dt;if(P.skillT>0)P.skillT-=dt;const s2=Math.hypot(b.vx,b.vy);if(s2>340){P.trail.push([b.x,b.y]);if(P.trail.length>9)P.trail.shift()}else if(P.trail.length)P.trail.shift();const still=Math.hypot(b.vx,b.vy)<6&&!P.ctrl.l&&!P.ctrl.r;P.stuckT=still?P.stuckT+dt:0;if(P.stuckT>2.5){b.vy=-160;b.vx=(Math.random()-.5)*120;P.stuckT=0}}
 if(P.dropT>0){P.dropT-=dt;if(P.dropT<=0)P.lit.drop=P.lit.drop.map(()=>0)}
 pRecordCheck(dt);pTick(dt)}
function pGameOver(){pRecordCheck(0);const d=pData(),best=d.tables[TD.id].best||0,rec=P.score>P.best0&&P.score>0;P.phase='over';P.osel=0;P.over={t:0,rec,best};
 if(P.api){try{P.api.record(P.score)}catch(e){}}pSave();PS.over();if(rec)setTimeout(()=>{if(P.phase=='over')PS.record()},1500);pMus(.35)}
function pTick(dt){P.pops.forEach(p=>p.T+=dt);P.pops=P.pops.filter(p=>p.T<.9);P.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.9;q.vy*=.9;q.l-=dt});P.parts=P.parts.filter(q=>q.l>0);
 for(const k in P.flash)P.flash[k]=P.flash[k].map(v=>Math.max(0,v-dt*4));if(P.chainT>0){P.chainT-=dt;if(P.chainT<=0)P.chain=0}if(P.rampT>0)P.rampT-=dt;if(P.comboT>0){P.comboT-=dt;if(P.comboT<=0)P.combo=0}if(P.shake>0)P.shake-=dt;if(P.flashScr>0)P.flashScr-=dt*1.6;if(P.big){P.big.T+=dt;if(P.big.T>2)P.big=null}if(P.parts.length>160)P.parts.splice(0,P.parts.length-160);if(P.msg){P.msg.T+=dt;if(P.msg.T>1.6)P.msg=null}}
function pPick(i){P.sel=i;PS.sel();pMus(.75,TABLES[i].music)}
function pPlay(){useTable(P.sel);pNewGame()}
function pToSelect(){P.phase='select';P.paused=false;P.ball=null;P.over=null;P.touches.clear();P.sel=P.tsel;pMus(.75,TABLES[P.sel].music)}
function pOverChoice(k){if(k==0)pNewGame();else if(k==1)pToSelect();else P.api&&P.api.exit()}
function pPauseChoice(k){if(k==0)P.paused=false;else if(k==1)pSon();else{P.paused=false;P.api&&P.api.exit()}}
function pSon(){P.son=(P.son+1)%3;if(P.api){P.api.data().son=P.son;pSave()}pMus(P.paused?.3:P.phase=='select'?.75:1,P.phase=='select'?TABLES[P.sel].music:null);P.msg={t:['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][P.son],c:'#ffffff',T:0}}
// ---------- mise en page ----------
// Portrait : bandeau fin en haut (retour, score, son), table au plus grand ; chaque moitié de l'écran commande sa palette.
// Paysage : table au centre, informations à gauche, boutons et lanceur à droite.
const fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function pLayout(w,h){P.W=w;P.H=h;const land=w>h*.9,L={land};
 if(!land){const hud=Math.max(32,Math.min(48,Math.round(h*.085))),k=Math.min((w-4)/PW,(h-hud-6)/PH);L.k=k;L.tw=PW*k;L.th=PH*k;L.tx=Math.round((w-L.tw)/2);L.ty=Math.round(hud+Math.max(2,(h-hud-L.th)/2));L.hud={x:0,y:0,w,h:hud};
  const bs=Math.min(hud-8,30);L.menu={x:6,y:Math.round((hud-bs)/2),w:bs,h:bs};L.son={x:w-bs-6,y:L.menu.y,w:bs,h:bs};
  const r=Math.max(19,Math.round(Math.min(w*.12,28)));L.launch={x:Math.round(Math.min(w-r-6,L.tx+186*k)),y:Math.round(Math.min(h-r-8,L.ty+374*k)),r}}
 else{const k=(h-8)/PH,tw=PW*k;L.k=k;L.tw=tw;L.th=PH*k;L.tx=Math.round((w-tw)/2);L.ty=4;L.hud={x:0,y:0,w:L.tx,h};
  const bs=Math.max(22,Math.min(32,Math.round(h*.08)));L.menu={x:8,y:8,w:bs,h:bs};L.son={x:w-bs-8,y:8,w:bs,h:bs};
  const side=w-L.tx-L.tw,r=Math.max(20,Math.min(Math.round(side*.32),Math.round(h*.11)));L.launch=side>=2*r+16?{x:Math.round(L.tx+L.tw+side/2),y:Math.round(h-r-14),r}:{x:Math.round(L.tx+186*k),y:Math.round(L.ty+374*k),r}}
 // repères visuels des zones tactiles (chaque moitié de l'écran = une palette)
 const hr=Math.max(16,Math.round(Math.min(w,h)*.07));L.bl={x:Math.round(land?L.tx/2:hr+8),y:Math.round(h-hr-(land?16:10)),r:hr};L.br={x:Math.round(land?w-(w-L.tx-L.tw)/2:w-hr-8),y:L.bl.y,r:hr};
 if(!land||L.launch.x>L.tx+L.tw){L.br.y=Math.round(Math.min(L.bl.y,L.launch.y-L.launch.r-hr-12));L.bl.y=L.br.y}
 L.pl={x:L.launch.x-L.launch.r,y:L.launch.y-L.launch.r,w:2*L.launch.r,h:2*L.launch.r};
 P.L=L;V.k=L.k;V.tx=L.tx;V.ty=L.ty;P.cache={};P.prev={}}
const V={k:1,tx:0,ty:0};const X=x=>V.tx+x*V.k,Y=y=>V.ty+y*V.k;
// ---------- outils de dessin vectoriel ----------
const FONT='system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const fnt=(x,px,wg)=>{x.font=(wg||700)+' '+Math.max(4,px).toFixed(1)+'px '+FONT};
function rr(x,a,b,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function circ(x,cx,cy,r){x.beginPath();x.arc(cx,cy,Math.max(.1,r),0,Math.PI*2)}
const hexA=(c,a)=>{if(c[0]!='#')return c;let h=c.slice(1);if(h.length==3)h=h.split('').map(q=>q+q).join('');return'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'};
function txt(x,t,cx,cy,px,col,o={}){fnt(x,px,o.w);x.textAlign=o.al||'center';x.textBaseline='middle';if(o.st){x.lineJoin='round';x.lineWidth=o.st;x.strokeStyle=o.sc||'rgba(0,0,0,.75)';x.strokeText(t,cx,cy)}if(o.glow){x.shadowColor=o.glow;x.shadowBlur=o.gb||8}x.fillStyle=col;x.fillText(t,cx,cy);x.shadowBlur=0;(P.drawn||(P.drawn=[])).push(t)}
const tw=(x,t,px,wg)=>{fnt(x,px,wg);return x.measureText(t).width};
// toile en cache à la résolution réelle de l'écran (dessinée ensuite pixel pour pixel)
function cached(key,w,h,fn){const sc=P.sc||1;let c=P.cache[key];if(c&&c.sc==sc)return c;c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*sc));c.height=Math.max(1,Math.round(h*sc));c.sc=sc;const x=c.getContext('2d');x.setTransform(sc,0,0,sc,0,0);fn(x);P.cache[key]=c;return c}
if(typeof CanvasRenderingContext2D!='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(a,b,w,h,r){rr(this,a,b,w,h,r);};
// ---------- illustrations de fond : un vrai décor par univers (vectoriel, en cache ; parties animées à part) ----------
// Toutes les formes sont dessinées dans le repère de la table (200 × 412) : origine au pied de la figure, s = échelle, f = 1 ou -1 (miroir).
function shp(x,pts,ox,oy,s,f){const Q=pts.map(([a,b])=>[X(ox+a*s*(f||1)),Y(oy+b*s)]),n=Q.length;x.beginPath();x.moveTo((Q[0][0]+Q[1][0])/2,(Q[0][1]+Q[1][1])/2);
 for(let i=1;i<=n;i++){const p=Q[i%n],q=Q[(i+1)%n];x.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}x.closePath()}
function poly(x,pts,ox,oy,s,f){x.beginPath();pts.forEach(([a,b],i)=>{const px=X(ox+a*s*(f||1)),py=Y(oy+b*s);i?x.lineTo(px,py):x.moveTo(px,py)});x.closePath()}
function ell(x,cx,cy,rx,ry,rot){x.beginPath();x.ellipse(X(cx),Y(cy),Math.max(.1,rx*V.k),Math.max(.1,ry*V.k),rot||0,0,Math.PI*2)}
function stk(x,pts,w,col,cap){x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(X(a),Y(b)):x.moveTo(X(a),Y(b)));x.strokeStyle=col;x.lineWidth=w*V.k;x.lineCap=cap||'round';x.lineJoin='round';x.stroke()}
function fillG(x,c1,c2,y1,y2){const g=x.createLinearGradient(0,Y(y1),0,Y(y2));g.addColorStop(0,c1);g.addColorStop(1,c2);return g}
// silhouette + liseré de lumière (lisible sans gêner la bille)
function silh(x,col,rim,blur){x.fillStyle=col;x.fill();if(rim){x.strokeStyle=rim;x.lineWidth=.8*V.k;x.stroke()}}
const ART={
 // DINOSAUR WORLD : volcan, T-rex, brachiosaure, ptérodactyles, fougères, empreintes
 dino(x,td){const p=td.pal;
  x.fillStyle=fillG(x,'rgba(255,140,60,.28)','rgba(255,140,60,0)',0,130);x.fillRect(X(0),Y(0),PW*V.k,130*V.k);
  // volcan
  poly(x,[[-46,0],[-14,-46],[-6,-44],[0,-48],[8,-44],[14,-46],[46,0]],100,112,1);silh(x,'rgba(40,18,8,.62)','rgba(255,120,40,.35)');
  stk(x,[[98,66],[95,78],[97,90]],2.2,'rgba(255,110,30,.55)');stk(x,[[104,66],[108,80],[106,96]],1.8,'rgba(255,110,30,.45)');
  // brachiosaure (centre droit, tourné vers la gauche)
  const B='rgba(52,96,40,.72)',BR='rgba(200,255,140,.45)',bx=118,by=296,bs=.78;
  shp(x,[[28,-30],[52,-22],[70,-15],[52,-15],[28,-17]],bx,by,bs);silh(x,B);
  for(const lx of[-26,-14,14,26]){x.beginPath();x.roundRect(X(bx+lx*bs-2.8),Y(by-14*bs),5.6*V.k*bs/.78*.78,14*bs*V.k,2*V.k);silh(x,B)}
  shp(x,[[-30,-30],[-10,-41],[15,-39],[33,-30],[37,-20],[28,-13],[-28,-13],[-37,-22]],bx,by,bs);silh(x,B,BR);
  shp(x,[[-22,-36],[-33,-62],[-37,-86],[-32,-92],[-26,-86],[-20,-62],[-10,-38]],bx,by,bs);silh(x,B,BR);
  shp(x,[[-44,-95],[-35,-100],[-25,-96],[-28,-89],[-41,-89]],bx,by,bs);silh(x,B,BR);
  x.fillStyle='rgba(255,255,255,.6)';ell(x,bx-37*bs,by-95*bs,.9,.9);x.fill();
  // T-rex (à gauche, tourné vers la droite)
  const tx0=46,ty0=338,ts=1.05;
  shp(x,[[-52,-30],[-30,-38],[-10,-48],[8,-55],[22,-62],[40,-60],[45,-54],[38,-49],[30,-50],[33,-45],[18,-44],[14,-36],[21,-32],[22,-28],[14,-30],[8,-24],[11,-14],[13,-2],[19,0],[6,0],[2,-12],[-5,-12],[-6,-2],[0,0],[-13,0],[-15,-14],[-17,-24],[-31,-28]],tx0,ty0,ts);
  silh(x,'rgba(46,28,12,.78)','rgba(255,170,70,.55)');x.fillStyle='rgba(255,220,130,.9)';ell(x,tx0+28*ts,ty0-57*ts,1.1,1.1);x.fill();
  x.strokeStyle='rgba(255,240,220,.6)';x.lineWidth=.6*V.k;x.beginPath();for(let q=0;q<4;q++){x.moveTo(X(tx0+(31+q*3)*ts),Y(ty0-50*ts));x.lineTo(X(tx0+(32+q*3)*ts),Y(ty0-48*ts))}x.stroke();
  // fougères
  for(const[fx,fy,s,f]of[[18,410,1,1],[182,412,1,-1]]){for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.38*f,L=34*s;const ex=fx+Math.cos(a)*L*.9,ey=fy+Math.sin(a)*L;stk(x,[[fx,fy],[fx+Math.cos(a)*L*.5+6*f,fy+Math.sin(a)*L*.55],[ex,ey]],1.2,'rgba(70,140,40,.45)');
   for(let j=1;j<6;j++){const u=j/6,cx=fx+(ex-fx)*u,cy=fy+(ey-fy)*u;ell(x,cx,cy,4*s*(1-u*.5),1.4*s,a+.9);x.fillStyle='rgba(70,140,40,.32)';x.fill();ell(x,cx,cy,4*s*(1-u*.5),1.4*s,a-.9);x.fill()}}}
  // empreintes
  for(let i=0;i<4;i++){const ex=70+i*14,ey=392-i*10+(i%2)*6;x.fillStyle='rgba(0,0,0,.22)';ell(x,ex,ey,2.6,3.2,.3);x.fill();for(const d of[-2.2,0,2.2]){ell(x,ex+d,ey-4.2,.8,1.6,d*.15);x.fill()}}},
 // ALIEN INVASION : soucoupe volante et son faisceau, petit extraterrestre, vache enlevée, cercles dans les blés
 alien(x,td){const p=td.pal;
  for(let i=0;i<90;i++){x.fillStyle='rgba(200,255,220,'+(.08+(i%4)*.07)+')';ell(x,10+(i*73)%180,14+(i*131)%300,.45,.45);x.fill()}
  // planète lointaine
  x.fillStyle='rgba(200,80,255,.22)';ell(x,40,90,14,14);x.fill();x.strokeStyle='rgba(220,140,255,.3)';x.lineWidth=.8*V.k;ell(x,40,90,22,4,-.4);x.stroke();
  // champ et cercles
  x.fillStyle=fillG(x,'rgba(30,90,40,0)','rgba(30,90,40,.35)',300,412);x.fillRect(X(0),Y(300),PW*V.k,112*V.k);
  for(let i=0;i<3;i++){x.strokeStyle='rgba(160,255,170,'+(.16-i*.04)+')';x.lineWidth=1.2*V.k;ell(x,96,372,12+i*10,4+i*3.2);x.stroke()}
  // petit extraterrestre (à gauche, il fait coucou)
  const G='rgba(80,230,110,.62)',GR='rgba(220,255,225,.5)';
  for(const lx of[-3.5,3.5])stk(x,[[48+lx,312],[48+lx*1.4,324]],3,G);
  shp(x,[[-7,-38],[7,-38],[9,-20],[-9,-20]],48,332,1);silh(x,G,GR);
  shp(x,[[-14,-58],[0,-68],[14,-58],[11,-46],[4,-39],[-4,-39],[-11,-46]],48,332,1);silh(x,G,GR);
  x.fillStyle='rgba(5,10,8,.9)';ell(x,43,276,4,2.3,.55);x.fill();ell(x,53,276,4,2.3,-.55);x.fill();x.fillStyle='rgba(255,255,255,.7)';ell(x,42,275,.9,.6);x.fill();ell(x,52,275,.9,.6);x.fill();
  stk(x,[[44,264],[40,254]],.9,G);stk(x,[[52,264],[56,254]],.9,G);x.fillStyle=G;ell(x,40,253,1.6,1.6);x.fill();ell(x,56,253,1.6,1.6);x.fill();
  stk(x,[[40,298],[34,308]],2.4,G);
  // deuxième, plus petit, à droite
  shp(x,[[-10,-44],[0,-50],[10,-44],[8,-35],[3,-30],[-3,-30],[-8,-35]],160,330,.7);silh(x,'rgba(160,90,255,.5)','rgba(230,200,255,.4)');
  x.fillStyle='rgba(5,5,10,.85)';ell(x,157,301,2.6,1.5,.5);x.fill();ell(x,163,301,2.6,1.5,-.5);x.fill();
  shp(x,[[-5,-30],[5,-30],[6,-16],[-6,-16]],160,330,.7);silh(x,'rgba(160,90,255,.5)')},
 // FUTURE CITY : gratte-ciel, enseignes néon, lune, autoroute, robot géant
 city(x,td){const p=td.pal;
  x.fillStyle='rgba(255,220,255,.18)';ell(x,150,60,16,16);x.fill();
  // deux rangées d'immeubles
  for(const[row,base,a]of[[0,150,.5],[1,190,.68]]){let bx=6,i=row*7;while(bx<190){const bw=12+((i*37)%16),bh=(row?40:60)+((i*53)%50);x.fillStyle='rgba(6,4,22,'+a+')';x.fillRect(X(bx),Y(base-bh),bw*V.k,bh*V.k);
    if(i%3==0){stk(x,[[bx+bw/2,base-bh],[bx+bw/2,base-bh-10]],.8,'rgba(255,255,255,.3)');x.fillStyle=p.accent2;ell(x,bx+bw/2,base-bh-10,.9,.9);x.fill()}
    for(let wy=base-bh+4;wy<base-3;wy+=5)for(let wx=bx+2.5;wx<bx+bw-3;wx+=4)if((wx*7+wy*3+i)%7<3){x.fillStyle=(wx+wy+i)%5?'rgba(255,230,150,.35)':hexA(p.accent,.5);x.fillRect(X(wx),Y(wy),1.6*V.k,2*V.k)}
    bx+=bw+3;i++}}
  // enseignes néon
  for(const[t,cx,cy,c]of[['NEO',58,96,p.accent2],['24/7',138,122,p.accent],['HOTEL',96,168,'#ffe14f']]){x.save();x.shadowColor=c;x.shadowBlur=6*V.k*(P.sc||1);txt(x,t,X(cx),Y(cy),6.5*V.k,hexA(c,.75),{w:900});x.restore()}
  // robot géant (silhouette, à gauche)
  const R='rgba(14,10,40,.72)',RR=hexA(p.accent,.5),rx=136,ry=206;stk(x,[[rx+4,ry+48],[rx+2,ry+70]],6,R,'butt');stk(x,[[rx+18,ry+48],[rx+20,ry+70]],6,R,'butt');stk(x,[[rx-1,ry+22],[rx-9,ry+40]],5,R);stk(x,[[rx+23,ry+22],[rx+30,ry+36]],5,R);
  x.beginPath();x.roundRect(X(rx-2),Y(ry+16),26*V.k,32*V.k,4*V.k);silh(x,R,RR);x.beginPath();x.roundRect(X(rx+2),Y(ry),18*V.k,14*V.k,3*V.k);silh(x,R,RR);x.fillStyle=hexA(p.accent,.9);x.fillRect(X(rx+5),Y(ry+5),12*V.k,2.4*V.k);stk(x,[[rx+11,ry],[rx+11,ry-6]],.8,RR);x.fillStyle=p.accent2;ell(x,rx+11,ry-7,1.2,1.2);x.fill();x.fillStyle=hexA(p.accent2,.6);ell(x,rx+11,ry+30,3,3);x.fill();
  // autoroute en perspective
  x.strokeStyle=hexA(p.accent2,.14);x.lineWidth=.7*V.k;for(let i=0;i<=10;i++){x.beginPath();x.moveTo(X(96),Y(300));x.lineTo(X(-40+i*27),Y(412));x.stroke()}},
 // SPACE GALAXY : Saturne, lune cratérisée, fusée, astronaute en apesanteur, nébuleuses
 space(x,td){const p=td.pal;
  for(const[cx,cy,r,c]of[[50,120,70,p.accent2],[150,260,80,'#b48cff'],[90,360,60,p.accent]]){const g=x.createRadialGradient(X(cx),Y(cy),0,X(cx),Y(cy),r*V.k);g.addColorStop(0,hexA(c,.16));g.addColorStop(1,hexA(c,0));x.fillStyle=g;x.fillRect(X(cx-r),Y(cy-r),2*r*V.k,2*r*V.k)}
  for(let i=0;i<140;i++){x.fillStyle='rgba(255,255,255,'+(.15+(i%5)*.08)+')';ell(x,10+(i*73)%180,14+(i*131)%384,i%7?.35:.7,i%7?.35:.7);x.fill()}
  // Saturne
  x.strokeStyle='rgba(255,210,140,.45)';x.lineWidth=2*V.k;x.beginPath();x.ellipse(X(44),Y(70),26*V.k,6*V.k,-.35,Math.PI,Math.PI*2);x.stroke();
  const g=x.createRadialGradient(X(40),Y(64),2*V.k,X(44),Y(70),15*V.k);g.addColorStop(0,'rgba(255,220,160,.7)');g.addColorStop(1,'rgba(160,90,40,.55)');x.fillStyle=g;ell(x,44,70,14,14);x.fill();
  x.beginPath();x.ellipse(X(44),Y(70),26*V.k,6*V.k,-.35,0,Math.PI);x.stroke();
  // lune
  x.fillStyle='rgba(200,200,215,.35)';ell(x,160,330,18,18);x.fill();x.fillStyle='rgba(90,90,110,.35)';for(const[a,b,r]of[[154,324,4],[166,336,3],[160,342,2],[168,322,2.4]]){ell(x,a,b,r,r);x.fill()}},
 // FAR WEST : coucher de soleil, mesas, cactus, cow-boy, étoile du shérif, avis de recherche, planches du saloon
 west(x,td){const p=td.pal;
  x.fillStyle=fillG(x,'rgba(255,120,60,.0)','rgba(255,170,80,.42)',10,140);x.fillRect(X(0),Y(10),PW*V.k,130*V.k);
  x.fillStyle='rgba(255,220,120,.5)';ell(x,128,128,22,22);x.fill();
  // mesas
  poly(x,[[0,0],[6,-30],[40,-34],[46,0]],10,142,1);silh(x,'rgba(90,30,15,.65)','rgba(255,160,80,.4)');poly(x,[[0,0],[4,-20],[26,-22],[30,0]],60,142,1);silh(x,'rgba(110,40,20,.6)');poly(x,[[0,0],[8,-40],[36,-42],[44,0]],140,142,1);silh(x,'rgba(80,25,12,.65)','rgba(255,160,80,.4)');
  x.fillStyle=fillG(x,'rgba(150,80,30,.45)','rgba(60,25,10,.2)',142,260);x.fillRect(X(0),Y(142),PW*V.k,118*V.k);
  // planches du saloon en bas
  for(let y=262;y<412;y+=9){x.fillStyle='rgba(0,0,0,.12)';x.fillRect(X(8),Y(y),184*V.k,.6*V.k)}for(let i=0;i<14;i++){x.fillStyle='rgba(0,0,0,.14)';x.fillRect(X(8+((i*53)%180)),Y(262+(Math.floor(i/2)*9)%148),.6*V.k,9*V.k)}
  // cactus saguaro
  const C='rgba(40,90,40,.6)',CR='rgba(180,255,140,.3)';const cactus=(cx,by,s)=>{stk(x,[[cx,by],[cx,by-44*s]],9*s,C);stk(x,[[cx-4*s,by-20*s],[cx-12*s,by-20*s],[cx-12*s,by-34*s]],5.5*s,C);stk(x,[[cx+4*s,by-26*s],[cx+11*s,by-26*s],[cx+11*s,by-38*s]],5*s,C);stk(x,[[cx-1.5*s,by-4*s],[cx-1.5*s,by-40*s]],.6*s,CR)};
  cactus(24,236,.9);cactus(176,250,.75);cactus(150,148,.4);
  // cow-boy (à gauche) : chapeau, foulard, ceinturon, bottes
  const K='rgba(40,18,8,.72)',KR='rgba(255,170,80,.45)';
  for(const[lx,f]of[[-4,1],[4,-1]]){stk(x,[[60+lx,312],[60+lx*1.3,330]],4.4,K);shp(x,[[-3,0],[5,0],[5,-3],[-2,-4]],60+lx*1.3,333,1,f);silh(x,K)}
  shp(x,[[-8,-44],[8,-44],[10,-28],[7,-16],[-7,-16],[-10,-28]],60,330,1);silh(x,K,KR);
  x.fillStyle='rgba(210,60,40,.6)';poly(x,[[-5,-44],[5,-44],[0,-38]],60,330,1);x.fill();x.fillStyle='rgba(160,110,40,.65)';x.fillRect(X(52),Y(311),16*V.k,2.6*V.k);x.fillStyle='rgba(230,200,90,.8)';x.fillRect(X(59),Y(311),2.4*V.k,2.6*V.k);
  stk(x,[[52,288],[47,304],[50,312]],3.4,K);stk(x,[[68,288],[74,302],[71,312]],3.4,K);
  x.fillStyle=K;ell(x,60,280,5.2,5.6);x.fill();
  ell(x,60,275,13,2.6);silh(x,K,KR);shp(x,[[-6,0],[-5,-8],[0,-10],[5,-8],[6,0]],60,275,1);silh(x,K,KR);
  // lasso
  x.strokeStyle='rgba(220,180,110,.45)';x.lineWidth=.9*V.k;ell(x,82,292,8,3.5,-.3);x.stroke();stk(x,[[74,300],[77,296]],.9,'rgba(220,180,110,.45)');
  // étoile du shérif (grand insert au centre)
  const st=[];for(let i=0;i<12;i++){const a=-Math.PI/2+i*Math.PI/6,r=i%2?7:16;st.push([Math.cos(a)*r,Math.sin(a)*r])}poly(x,st,96,282,1);x.fillStyle='rgba(255,200,80,.22)';x.fill();x.strokeStyle='rgba(255,220,120,.4)';x.lineWidth=.8*V.k;x.stroke();
  for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;x.fillStyle='rgba(255,220,120,.35)';ell(x,96+Math.cos(a)*16,282+Math.sin(a)*16,1.8,1.8);x.fill()}
  // avis de recherche (à droite)
  x.save();x.translate(X(160),Y(222));x.rotate(.06);x.fillStyle='rgba(230,200,150,.42)';x.fillRect(-12*V.k,-16*V.k,24*V.k,32*V.k);x.strokeStyle='rgba(80,40,10,.4)';x.lineWidth=.6*V.k;x.strokeRect(-12*V.k,-16*V.k,24*V.k,32*V.k);
  txt(x,'WANTED',0,-11*V.k,4.2*V.k,'rgba(70,30,10,.75)',{w:900});x.fillStyle='rgba(70,30,10,.5)';x.beginPath();x.arc(0,0,4.2*V.k,0,Math.PI*2);x.fill();x.fillRect(-7*V.k,-5.5*V.k,14*V.k,1.6*V.k);txt(x,'$5 000',0,10*V.k,3.6*V.k,'rgba(70,30,10,.75)',{w:800});x.restore()}};
// parties animées des décors (peu nombreuses, légères)
const ART_ANIM={
 dino(x,t,p){// lave qui pulse, fumée, deux ptérodactyles qui traversent le ciel
  const a=.5+.5*Math.sin(t*1.6),g=x.createRadialGradient(X(100),Y(66),0,X(100),Y(66),24*V.k);g.addColorStop(0,'rgba(255,120,30,'+(.25+.2*a)+')');g.addColorStop(1,'rgba(255,120,30,0)');x.fillStyle=g;x.fillRect(X(76),Y(42),48*V.k,48*V.k);
  for(let i=0;i<3;i++){const u=(t*.12+i/3)%1;x.fillStyle='rgba(120,110,100,'+(.22*(1-u))+')';ell(x,100+u*14,62-u*40,3+u*7,3+u*6);x.fill()}
  for(const[sp,y0,s,off]of[[.06,150,.8,0],[.045,110,.55,.5]]){const u=(t*sp+off)%1.3-.15,px=-20+u*240,py=y0+Math.sin(t*1.3+off*9)*6,fl=Math.sin(t*7+off*5);
   const w=[[-34,-4*fl],[-14,-10],[-4,-6],[0,-8],[4,-6],[14,-10],[34,-4*fl],[14,-2],[4,2],[0,6],[-4,2],[-14,-2]];shp(x,w,px,py,s);x.fillStyle='rgba(30,15,10,.55)';x.fill();poly(x,[[0,-8],[9,-14],[15,-13],[6,-9]],px,py,s);x.fill()}},
 alien(x,t,p){// soucoupe qui flotte, faisceau, vache qui monte et descend, voyants qui tournent
  const ux=96+Math.sin(t*.6)*10,uy=58+Math.sin(t*1.3)*3,bm=.5+.5*Math.sin(t*2.2);
  x.fillStyle=(()=>{const g=x.createLinearGradient(0,Y(uy),0,Y(uy+150));g.addColorStop(0,hexA(p.accent,.22+.12*bm));g.addColorStop(1,hexA(p.accent,0));return g})();poly(x,[[-9,4],[-34,150],[34,150],[9,4]],ux,uy,1);x.fill();
  // vache enlevée
  const cy=150+Math.sin(t*1.1)*14,cx=ux+Math.sin(t*.9)*4;x.save();x.translate(X(cx),Y(cy));x.rotate(Math.sin(t*1.4)*.25);const k=V.k;
  x.fillStyle='rgba(245,245,245,.6)';x.beginPath();x.roundRect(-11*k,-6*k,22*k,11*k,4*k);x.fill();x.beginPath();x.roundRect(9*k,-10*k,8*k,7*k,2.5*k);x.fill();x.fillStyle='rgba(20,20,20,.55)';x.beginPath();x.ellipse(-4*k,-2*k,4*k,3*k,.3,0,7);x.fill();x.beginPath();x.ellipse(5*k,1*k,2.6*k,2*k,0,0,7);x.fill();
  x.strokeStyle='rgba(245,245,245,.6)';x.lineWidth=2*k;x.lineCap='round';for(const lx of[-8,-3,4,8]){x.beginPath();x.moveTo(lx*k,4*k);x.lineTo((lx+Math.sin(t*3+lx)*1.5)*k,10*k);x.stroke()}x.fillStyle='rgba(255,180,190,.7)';x.beginPath();x.ellipse(15*k,-5*k,2*k,1.6*k,0,0,7);x.fill();x.restore();
  // soucoupe
  x.fillStyle='rgba(180,255,210,.35)';ell(x,ux,uy-6,12,9);x.fill();const g2=x.createLinearGradient(0,Y(uy-4),0,Y(uy+5));g2.addColorStop(0,'rgba(220,230,240,.75)');g2.addColorStop(1,'rgba(90,100,120,.75)');x.fillStyle=g2;ell(x,ux,uy,30,6.5);x.fill();
  for(let i=0;i<7;i++){const on=(Math.floor(t*6)+i)%3==0;x.fillStyle=on?hexA(p.accent,.95):'rgba(255,255,255,.25)';ell(x,ux-24+i*8,uy+1.5,1.4,1.4);x.fill()}},
 city(x,t,p){// voitures volantes qui traversent, phares et traînées
  for(const[y0,sp,dir,c,off]of[[178,.07,1,p.accent,0],[208,.05,-1,p.accent2,.4],[132,.09,1,'#ffe14f',.7]]){const u=(t*sp+off)%1.25-.12,px=dir>0?-20+u*240:220-u*240,f=dir;
   x.fillStyle=hexA(c,.18);poly(x,[[-14,-1],[-60,-1],[-60,1],[-14,2]],px,y0,1,f);x.fill();
   shp(x,[[-14,0],[-10,-5],[6,-6],[14,-1],[12,3],[-12,3]],px,y0,1,f);x.fillStyle='rgba(20,14,50,.75)';x.fill();x.strokeStyle=hexA(c,.8);x.lineWidth=.7*V.k;x.stroke();
   x.fillStyle='rgba(180,240,255,.55)';shp(x,[[-6,-1],[-4,-4],[5,-4],[8,-1]],px,y0,1,f);x.fill();x.fillStyle='#ffffff';ell(x,px+13*f,y0,1,1);x.fill()}},
 space(x,t,p){// astronaute en apesanteur, fusée avec sa flamme, étoiles qui scintillent
  for(let i=0;i<6;i++){const s=Math.sin(t*2+i*1.7);if(s>.6){x.fillStyle='rgba(255,255,255,'+(s-.6)*2+')';ell(x,20+(i*53)%160,30+(i*89)%330,.9,.9);x.fill()}}
  // fusée qui file en diagonale
  const u=(t*.05)%1.3-.15,rx=-10+u*220,ry=360-u*300;x.save();x.translate(X(rx),Y(ry));x.rotate(.85);const k=V.k,fl=.7+.3*Math.sin(t*30);
  const fg=x.createLinearGradient(0,8*k,0,(8+14*fl)*k);fg.addColorStop(0,'rgba(255,230,120,.8)');fg.addColorStop(1,'rgba(255,80,30,0)');x.fillStyle=fg;x.beginPath();x.moveTo(-4*k,8*k);x.lineTo(0,(8+16*fl)*k);x.lineTo(4*k,8*k);x.fill();
  x.fillStyle='rgba(235,235,245,.75)';x.beginPath();x.moveTo(0,-16*k);x.quadraticCurveTo(7*k,-8*k,6*k,8*k);x.lineTo(-6*k,8*k);x.quadraticCurveTo(-7*k,-8*k,0,-16*k);x.fill();
  x.fillStyle='rgba(255,80,90,.75)';x.beginPath();x.moveTo(-6*k,2*k);x.lineTo(-11*k,10*k);x.lineTo(-6*k,8*k);x.fill();x.beginPath();x.moveTo(6*k,2*k);x.lineTo(11*k,10*k);x.lineTo(6*k,8*k);x.fill();x.fillStyle=hexA(p.accent,.85);x.beginPath();x.arc(0,-4*k,2.6*k,0,7);x.fill();x.restore();
  // astronaute
  const ax=100+Math.sin(t*.4)*14,ay=250+Math.sin(t*.7)*8;x.save();x.translate(X(ax),Y(ay));x.rotate(Math.sin(t*.3)*.5);
  x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=.8*k;x.beginPath();x.moveTo(-6*k,4*k);x.bezierCurveTo(-30*k,10*k,-20*k,40*k,-50*k,50*k);x.stroke();
  const W='rgba(200,205,235,.42)';x.fillStyle='rgba(170,170,200,.38)';x.beginPath();x.roundRect(-9*k,-6*k,6*k,14*k,2*k);x.fill();
  x.strokeStyle=W;x.lineCap='round';x.lineWidth=5*k;x.beginPath();x.moveTo(-6*k,-2*k);x.lineTo(-13*k,6*k);x.moveTo(6*k,-2*k);x.lineTo(13*k,-6*k);x.stroke();x.lineWidth=5.6*k;x.beginPath();x.moveTo(-3*k,10*k);x.lineTo(-6*k,20*k);x.moveTo(3*k,10*k);x.lineTo(7*k,19*k);x.stroke();
  x.fillStyle=W;x.beginPath();x.roundRect(-7*k,-6*k,14*k,17*k,4*k);x.fill();x.beginPath();x.arc(0,-12*k,8*k,0,7);x.fill();
  const vg=x.createLinearGradient(-5*k,-16*k,5*k,-8*k);vg.addColorStop(0,'rgba(255,220,120,.6)');vg.addColorStop(1,'rgba(120,70,20,.6)');x.fillStyle=vg;x.beginPath();x.ellipse(1*k,-12*k,5.5*k,4.2*k,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(-1*k,-14*k,1.2*k,0,7);x.fill();x.restore()},
 west(x,t,p){// buisson virevoltant, chaleur qui ondule, vautour qui tourne
  const u=(t*.08)%1.3-.15,tx=-15+u*230,ty=396-Math.abs(Math.sin(t*3))*8;x.save();x.translate(X(tx),Y(ty));x.rotate(t*3);x.strokeStyle='rgba(170,120,60,.6)';x.lineWidth=.7*V.k;
  for(let i=0;i<9;i++){x.beginPath();x.ellipse(0,0,7*V.k,(3+i%3*1.5)*V.k,i*.7,0,Math.PI*2);x.stroke()}x.restore();
  const vx=100+Math.cos(t*.35)*50,vy=80+Math.sin(t*.35)*14,fl=Math.sin(t*4)*.4;shp(x,[[-16,-2+fl*6],[-6,-4],[0,-6],[6,-4],[16,-2+fl*6],[6,0],[0,2],[-6,0]],vx,vy,.8);x.fillStyle='rgba(30,12,6,.6)';x.fill()}};
// ---------- plateau fixe (en cache) ----------
function tablePath(x){const k=V.k;x.beginPath();x.moveTo(X(8),Y(412));x.lineTo(X(8),Y(100));x.arc(X(100),Y(100),92*k,Math.PI,0);x.lineTo(X(192),Y(412));x.closePath()}
function wallStroke(x,s,pal,k){const a=s.a,b=s.b;x.beginPath();x.moveTo(X(a[0]),Y(a[1]));x.lineTo(X(b[0]),Y(b[1]));
 if(s.type=='rail'||s.type=='rampwall'){x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=2.6*k;x.stroke();x.strokeStyle='#c9d0de';x.lineWidth=1.5*k;x.stroke();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=.5*k;x.stroke();return}
 if(s.type=='gate'){x.setLineDash([2*k,2*k]);x.strokeStyle=pal.gate;x.lineWidth=1.4*k;x.stroke();x.setLineDash([]);return}
 const col=s.type=='deflect'?pal.deflect:s.type=='block'?pal.accent2:pal.wall;
 x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=3.6*k;x.stroke();x.strokeStyle='#1b1e29';x.lineWidth=2.8*k;x.stroke();
 x.shadowColor=col;x.shadowBlur=5*k*(P.sc||1);x.strokeStyle=col;x.lineWidth=1.1*k;x.stroke();x.shadowBlur=0;x.strokeStyle=hexA('#ffffff',.55);x.lineWidth=.35*k;x.stroke()}
function slingPoly(side){return side?[[150,286],[150,318],[134,330]]:[[34,286],[34,318],[50,330]]}
function drawStatic(x,td){const tb=td.tb,k=V.k,pal=td.pal;x.lineCap='round';x.lineJoin='round';
 // plateau : dégradé, vignette, décor
 x.save();tablePath(x);x.clip();const g=x.createLinearGradient(0,Y(0),0,Y(412));g.addColorStop(0,pal.pf[0]);g.addColorStop(.55,pal.pf[1]);g.addColorStop(1,pal.pf[2]);x.fillStyle=g;x.fillRect(X(0),Y(0),PW*k,412*k);
 ART[td.id](x,td);
 const v=x.createRadialGradient(X(100),Y(220),60*k,X(100),Y(220),260*k);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=v;x.fillRect(X(0),Y(0),PW*k,412*k);
 // flèches d'insert (vers la rampe ou les trous)
 x.restore();
 // couloir du lanceur
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X(176),Y(120),16*k,284*k);
 // lance-boules (triangles)
 for(const side of[0,1]){const pts=slingPoly(side);x.beginPath();pts.forEach((q,i)=>i?x.lineTo(X(q[0]),Y(q[1])):x.moveTo(X(q[0]),Y(q[1])));x.closePath();const sg=x.createLinearGradient(X(pts[0][0]),Y(286),X(pts[2][0]),Y(330));sg.addColorStop(0,hexA(pal.slingHi,.35));sg.addColorStop(1,'rgba(10,10,20,.9)');x.fillStyle=sg;x.fill()}
 for(const s of tb.S){if(s.type=='stand'||s.type=='drop')continue;if(s.type=='sling'){x.beginPath();x.moveTo(X(s.a[0]),Y(s.a[1]));x.lineTo(X(s.b[0]),Y(s.b[1]));x.strokeStyle='#0b0b12';x.lineWidth=3*k;x.stroke();x.strokeStyle=pal.slingHi;x.lineWidth=1.3*k;x.stroke();continue}wallStroke(x,s,pal,k)}
 // poteaux métalliques
 for(const c of tb.C)if(c.type=='post'){const cx=X(c.x),cy=Y(c.y),r=(c.r+.6)*k,pg=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);pg.addColorStop(0,'#ffffff');pg.addColorStop(.5,'#aeb6c6');pg.addColorStop(1,'#3a4050');x.fillStyle=pg;circ(x,cx,cy,r);x.fill()}
 // trous : cuvette sombre
 for(const c of tb.C)if(c.type=='saucer'){const cx=X(c.x),cy=Y(c.y),r=c.r*k,hg=x.createRadialGradient(cx,cy,0,cx,cy,r*1.5);hg.addColorStop(0,'#000');hg.addColorStop(.6,'#05040a');hg.addColorStop(1,hexA(pal.accent2,0));x.fillStyle=hg;circ(x,cx,cy,r*1.5);x.fill()}
 // nom de la table, discret, sous les palettes
 txt(x,td.nom,X(92),Y(392),5.2*k,hexA(pal.text,.35),{w:800});P.drawn=[]}
function drawRampOv(x,td){const tb=td.tb;if(!tb.ramp)return;const k=V.k,pal=td.pal,pts=tb.ramp.path;const path=()=>{x.beginPath();pts.forEach((q,i)=>i?x.lineTo(X(q[0]),Y(q[1])):x.moveTo(X(q[0]),Y(q[1])))};x.lineCap='round';x.lineJoin='round';
 path();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=15*k;x.stroke();path();x.strokeStyle=hexA(pal.ramp,.85);x.lineWidth=13.5*k;x.stroke();path();x.strokeStyle=hexA('#0a0a1a',.72);x.lineWidth=11*k;x.stroke();path();x.strokeStyle=hexA(pal.rampHi,.1);x.lineWidth=7*k;x.stroke()}
// ---------- éléments dynamiques ----------
function drawDyn(x,td,st,t){const tb=td.tb,k=V.k,pal=td.pal,lit=st.lit,fl=st.flash,live=st===P;
 // lumière animée propre à l'univers (lave, faisceau, lumières de ville, scintillement)
 if(live)ART_ANIM[td.id](x,t,pal);
 // rampe : guirlande lumineuse qui court sur le bord (dorée quand le jackpot est prêt)
 if(tb.ramp){const pts=tb.ramp.path;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(X(q[0]),Y(q[1])):x.moveTo(X(q[0]),Y(q[1])));const jr=live&&P.jackReady;x.setLineDash([2.2*k,7*k]);x.lineDashOffset=-t*(jr?70:34)*k;x.strokeStyle=jr?'#ffd166':pal.rampHi;x.globalAlpha=jr?.95:.7;x.lineWidth=(jr?2.2:1.5)*k;x.stroke();x.setLineDash([]);x.globalAlpha=1;
  // flèche d'entrée
  const e=tb.ramp.entry,ex=(e[0]+e[1])/2,ey=e[3]+10,on=(Math.sin(t*6)>0)||jr;x.fillStyle=on?(jr?'#ffd166':pal.rampHi):hexA(pal.rampHi,.25);x.beginPath();x.moveTo(X(ex),Y(ey-7));x.lineTo(X(ex+4.5),Y(ey));x.lineTo(X(ex-4.5),Y(ey));x.closePath();x.fill()}
 // passages du haut : voyants (le passage du tir d'adresse clignote en blanc)
 tb.lanes.forEach((lx,i)=>{const cx=X(lx),cy=Y(40),r=3.2*k,on=lit.lane[i],sk=live&&P.ball&&(P.ball.st=='plunger'||P.skillT>0)&&P.skill==i;x.fillStyle='rgba(0,0,0,.6)';circ(x,cx,cy,r+.8*k);x.fill();
  if(on||sk){x.shadowColor=sk?'#ffffff':pal.lane[1];x.shadowBlur=8*k*(P.sc||1);x.fillStyle=sk&&Math.sin(t*14)>0?'#ffffff':pal.lane[1]}else x.fillStyle=hexA(pal.lane[1],.18);circ(x,cx,cy,r);x.fill();x.shadowBlur=0});
 // cibles fixes et tombantes
 for(const s of tb.S){if(s.type!='stand'&&s.type!='drop')continue;const down=s.type=='drop'&&lit.drop[s.id],on=s.type=='stand'?lit.stand[s.id]:0,f=(s.type=='stand'?fl.stand:fl.drop)[s.id]||0;
  x.beginPath();x.moveTo(X(s.a[0]),Y(s.a[1]));x.lineTo(X(s.b[0]),Y(s.b[1]));x.lineCap='round';
  if(down){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=2*k;x.stroke();continue}
  const col=s.type=='drop'?pal.drop:(on?pal.stand[1]:pal.stand[0]);x.strokeStyle='#0a0a12';x.lineWidth=4.2*k;x.stroke();if(on||f>0||s.type=='drop'){x.shadowColor=col;x.shadowBlur=(on||f?7:3)*k*(P.sc||1)}x.strokeStyle=f>0?'#ffffff':col;x.lineWidth=2.8*k;x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.6*k;x.stroke()}
 // lance-boules : éclair au contact
 for(const side of[0,1]){const f=fl.sling[side]||0;if(f<=0)continue;const pts=slingPoly(side);x.beginPath();x.moveTo(X(pts[0][0]),Y(pts[0][1]));x.lineTo(X(pts[2][0]),Y(pts[2][1]));x.strokeStyle=hexA('#ffffff',f);x.lineWidth=2.2*k;x.shadowColor=pal.slingHi;x.shadowBlur=10*k*(P.sc||1);x.stroke();x.shadowBlur=0}
 // bumpers : jupe lumineuse, corps brillant, chapeau métallique ; onde de choc au contact
 tb.C.forEach(c=>{if(c.type!='bumper')return;const cx=X(c.x),cy=Y(c.y),r=c.r*k,f=fl.bump[c.id]||0,on=lit.bump[c.id];
  x.fillStyle='rgba(0,0,0,.45)';circ(x,cx+.8*k,cy+1.4*k,r*1.08);x.fill();
  x.shadowColor=pal.accent;x.shadowBlur=(on?9:4+10*f)*k*(P.sc||1);x.fillStyle=hexA(pal.accent,on?.95:.7);circ(x,cx,cy,r*1.08);x.fill();x.shadowBlur=0;
  const bg=x.createRadialGradient(cx-r*.3,cy-r*.35,r*.1,cx,cy,r);bg.addColorStop(0,f>0?'#ffffff':hexA(pal.accent2,.95));bg.addColorStop(.7,hexA(pal.side,.95));bg.addColorStop(1,'#05040a');x.fillStyle=bg;circ(x,cx,cy,r*.9);x.fill();
  const cg=x.createRadialGradient(cx-r*.18,cy-r*.22,r*.05,cx,cy,r*.5);cg.addColorStop(0,'#ffffff');cg.addColorStop(.6,'#c4cbd8');cg.addColorStop(1,'#59606e');x.fillStyle=cg;circ(x,cx,cy,r*.48);x.fill();
  x.strokeStyle=hexA(pal.accent,.9);x.lineWidth=.7*k;circ(x,cx,cy,r*.62);x.stroke();
  if(f>0){x.strokeStyle=hexA('#ffffff',f*.9);x.lineWidth=1.4*k;circ(x,cx,cy,r*(1.15+(1-f)*.9));x.stroke()}});
 // trous : anneau tournant (prêt) ; doré si c'est le tir du jackpot
 tb.C.forEach(c=>{if(c.type!='saucer')return;const i=tb.sau.indexOf(c),cx=X(c.x),cy=Y(c.y),r=c.r*k,ready=!live||(P.sauCd[i]||0)<=0,jr=live&&P.jackReady&&!tb.ramp&&i==0,f=(fl.sau[i]||0);
  x.setLineDash([2.4*k,2.4*k]);x.lineDashOffset=t*14*k;x.strokeStyle=jr?'#ffd166':hexA(pal.accent2,ready?.9:.3);x.lineWidth=(jr?1.8:1.2)*k;circ(x,cx,cy,r*1.25);x.stroke();x.setLineDash([]);
  if(f>0){x.fillStyle=hexA(pal.accent2,f*.5);circ(x,cx,cy,r*(1.3+(1-f)));x.fill()}})}
// ---------- palettes, boule, lanceur ----------
function pFlipDraw(x,i,fa,on,pal){const f=FL[i],k=V.k,a=fa,px=X(f.px),py=Y(f.py),qx=X(f.px+Math.cos(a)*f.len),qy=Y(f.py+Math.sin(a)*f.len),r0=f.r0*k,r1=f.r1*k,nx=-Math.sin(a),ny=Math.cos(a);
 const shape=(o)=>{x.beginPath();x.moveTo(px+nx*r0+o,py+ny*r0+o*1.6);x.lineTo(qx+nx*r1+o,qy+ny*r1+o*1.6);x.arc(qx+o,qy+o*1.6,r1,a+Math.PI/2,a-Math.PI/2,true);x.lineTo(px-nx*r0+o,py-ny*r0+o*1.6);x.arc(px+o,py+o*1.6,r0,a-Math.PI/2,a+Math.PI/2,true);x.closePath()};
 shape(1.2*k);x.fillStyle='rgba(0,0,0,.45)';x.fill();shape(0);const g=x.createLinearGradient(px+nx*r0,py+ny*r0,px-nx*r0,py-ny*r0);g.addColorStop(0,'#ffffff');g.addColorStop(.55,'#d7dce6');g.addColorStop(1,'#8d95a6');x.fillStyle=g;x.fill();
 if(on){x.shadowColor=pal.flip;x.shadowBlur=10*k*(P.sc||1)}x.strokeStyle=pal.flip;x.lineWidth=(on?1.3:.9)*k;x.stroke();x.shadowBlur=0;
 x.beginPath();x.moveTo(px,py);x.lineTo(qx,qy);x.strokeStyle=hexA(pal.flip,.8);x.lineWidth=1.1*k;x.stroke();x.fillStyle='#4a5160';circ(x,px,py,r0*.35);x.fill()}
function pDrawBall(x,b,el){const k=V.k,r=BR*k*(el?1.15:1),cx=X(b.x),cy=Y(b.y),pal=TD.pal;
 // traînée lumineuse quand la boule file
 if(P.trail.length>2&&!el){x.globalCompositeOperation='lighter';P.trail.forEach((q,i)=>{const u=(i+1)/P.trail.length;x.fillStyle=hexA(pal.accent,.16*u);circ(x,X(q[0]),Y(q[1]),r*(.35+.6*u));x.fill()});x.globalCompositeOperation='source-over'}
 x.fillStyle='rgba(0,0,0,.4)';circ(x,cx+r*.25,cy+r*.45,r);x.fill();
 const g=x.createRadialGradient(cx-r*.38,cy-r*.42,r*.05,cx,cy,r);g.addColorStop(0,'#ffffff');g.addColorStop(.28,'#e9edf4');g.addColorStop(.65,'#8a93a5');g.addColorStop(1,'#262a34');x.fillStyle=g;circ(x,cx,cy,r);x.fill();
 // reflet du néon de la table sur le bas de la boule
 x.strokeStyle=hexA(pal.accent,.55);x.lineWidth=r*.22;x.beginPath();x.arc(cx,cy,r*.72,Math.PI*.2,Math.PI*.8);x.stroke();
 x.fillStyle='rgba(255,255,255,.95)';circ(x,cx-r*.36,cy-r*.4,r*.2);x.fill()}
function pPlungerDraw(x){const k=V.k,b=P.ball,pl=(b&&b.st=='plunger')?P.pl:0,top=Y(396-pl*14+.5),bot=Y(404);x.fillStyle='#2a2f3c';x.fillRect(X(178),top,12*k,bot-top);x.strokeStyle='#9aa3b5';x.lineWidth=.8*k;x.beginPath();const n=6;for(let i=0;i<=n;i++){const y=top+(bot-top)*i/n;x.moveTo(X(178),y);x.lineTo(X(190),y)}x.stroke();
 const g=x.createLinearGradient(X(178),0,X(190),0);g.addColorStop(0,'#8d95a6');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#8d95a6');x.fillStyle=g;x.fillRect(X(177.5),top-2.2*k,13*k,2.2*k)}
// ---------- interface ----------
function iconBtn(x,b,kind,on){rr(x,b.x,b.y,b.w,b.h,b.w*.3);x.fillStyle=on?'rgba(255,255,255,.28)':'rgba(255,255,255,.1)';x.fill();x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=.8;x.stroke();
 const cx=b.x+b.w/2,cy=b.y+b.h/2,s=b.w*.22;x.strokeStyle='#ffffff';x.fillStyle='#ffffff';x.lineWidth=Math.max(1.2,b.w*.075);x.lineCap='round';x.lineJoin='round';
 if(kind=='menu'){x.beginPath();x.moveTo(cx+s*.4,cy-s*1.1);x.lineTo(cx-s*.7,cy);x.lineTo(cx+s*.4,cy+s*1.1);x.stroke()}
 else{x.beginPath();x.moveTo(cx-s*1.2,cy-s*.45);x.lineTo(cx-s*.5,cy-s*.45);x.lineTo(cx+s*.25,cy-s*1.1);x.lineTo(cx+s*.25,cy+s*1.1);x.lineTo(cx-s*.5,cy+s*.45);x.lineTo(cx-s*1.2,cy+s*.45);x.closePath();x.fill();
  if(P.son==2){x.beginPath();x.moveTo(cx+s*.6,cy-s*.6);x.lineTo(cx+s*1.4,cy+s*.6);x.moveTo(cx+s*1.4,cy-s*.6);x.lineTo(cx+s*.6,cy+s*.6);x.stroke()}else{x.beginPath();x.arc(cx+s*.3,cy,s*.8,-.8,.8);x.stroke();if(P.son==0){x.beginPath();x.arc(cx+s*.3,cy,s*1.35,-.8,.8);x.stroke()}}}}
function jackMeter(x,cx,y,wd,hh){const n=4,g=wd*.08,sw=(wd-g*(n-1))/n;for(let i=0;i<n;i++){const on=i<P.jack||P.jackReady;rr(x,cx-wd/2+i*(sw+g),y,sw,hh,hh/2);x.fillStyle=on?(P.jackReady&&Math.sin(P.t*10)>0?'#ffffff':'#ffd166'):'rgba(255,255,255,.14)';x.fill()}}
function pHud(x){const L=P.L,w=P.W,pal=TD.pal,best=Math.max(pBest(),P.score),rec=P.recT>0||(P.newRec&&P.phase!='select');
 if(!L.land){const H=L.hud.h,g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(6,6,16,.96)');g.addColorStop(1,'rgba(6,6,16,.82)');x.fillStyle=g;x.fillRect(0,0,w,H);x.fillStyle=hexA(pal.accent,.55);x.fillRect(0,H-1,w,1);
  iconBtn(x,L.menu,'menu',P.paused);iconBtn(x,L.son,'son',false);
  const cx=w/2;txt(x,(rec?'NOUVEAU RECORD ':'BEST ')+fmt(best),cx,H*.27,Math.max(6,H*.19),rec?(Math.sin(P.t*8)>0?'#7cff6b':'#ffffff'):hexA(pal.text,.75),{w:700});
  txt(x,fmt(P.score),cx,H*.62,Math.min(H*.42,(w-2*L.menu.w-90)/Math.max(4,fmt(P.score).length)*1.75),'#ffffff',{w:800,glow:hexA(pal.accent,.8),gb:6*(P.sc||1)});
  jackMeter(x,cx,H-5,Math.min(56,w*.25),2.4);
  // boules restantes et multiplicateur
  const lx=L.menu.x+L.menu.w+10;for(let i=0;i<3;i++){const on=i<P.balls;circ(x,lx+i*9+3,H*.42,3);x.fillStyle=on?'#e9edf4':'rgba(255,255,255,.16)';x.fill()}
  txt(x,'BOULES',lx+12,H*.73,Math.max(5,H*.15),hexA('#ffffff',.5),{w:600});
  const rx=L.son.x-10;txt(x,'×'+P.mult,rx,H*.45,Math.max(8,H*.3),P.mult>1?'#7cff6b':hexA('#ffffff',.75),{w:800,al:'right'});txt(x,'MULTI',rx,H*.76,Math.max(5,H*.15),hexA('#ffffff',.5),{w:600,al:'right'})}
 else{const sw=L.tx,cx=sw/2,s=Math.min(1.4,sw/120);iconBtn(x,L.menu,'menu',P.paused);iconBtn(x,L.son,'son',false);let y=L.menu.y+L.menu.h+16*s;
  txt(x,TD.nom,cx,y,7.5*s,hexA(pal.text,.85),{w:800});y+=18*s;txt(x,'SCORE',cx,y,6*s,hexA('#ffffff',.5),{w:600});y+=14*s;txt(x,fmt(P.score),cx,y,Math.min(18*s,(sw-12)/Math.max(4,fmt(P.score).length)*1.75),'#ffffff',{w:800,glow:hexA(pal.accent,.8),gb:6*(P.sc||1)});y+=17*s;
  txt(x,(rec?'NOUVEAU RECORD ':'BEST ')+fmt(best),cx,y,6.5*s,rec?(Math.sin(P.t*8)>0?'#7cff6b':'#ffffff'):hexA(pal.text,.75),{w:700});y+=16*s;
  for(let i=0;i<3;i++){circ(x,cx-10*s+i*10*s,y,3.2*s);x.fillStyle=i<P.balls?'#e9edf4':'rgba(255,255,255,.16)';x.fill()}y+=14*s;
  txt(x,'MULTIPLICATEUR ×'+P.mult,cx,y,6.5*s,P.mult>1?'#7cff6b':hexA('#ffffff',.75),{w:700});y+=14*s;txt(x,'JACKPOT',cx,y,5.5*s,P.jackReady?'#ffd166':hexA('#ffffff',.5),{w:700});y+=8*s;jackMeter(x,cx,y,Math.min(70,sw*.6),3)}}
// repères des zones tactiles et bouton de lancement
function pControls(x){const L=P.L,pal=TD.pal,b=P.ball,ready=b&&b.st=='plunger'&&P.phase=='jeu'&&!P.paused;
 for(const[z,on,dir]of[[L.bl,P.ctrl.l,-1],[L.br,P.ctrl.r,1]]){if(dir>0&&ready&&Math.hypot(L.launch.x-z.x,L.launch.y-z.y)<L.launch.r+z.r)continue;
  x.globalAlpha=on?.9:.32;circ(x,z.x,z.y,z.r);x.fillStyle=on?hexA(dir<0?'#ff3f7a':'#2fb8ff',.55):'rgba(255,255,255,.08)';x.fill();x.strokeStyle=dir<0?'#ff7aa4':'#7fd0ff';x.lineWidth=1.2;x.stroke();
  const s=z.r*.38;x.beginPath();x.moveTo(z.x-dir*s*.5,z.y-s);x.lineTo(z.x+dir*s*.8,z.y);x.lineTo(z.x-dir*s*.5,z.y+s);x.strokeStyle='#ffffff';x.lineWidth=2;x.lineCap='round';x.lineJoin='round';x.stroke();x.globalAlpha=1}
 const l=L.launch;if(!ready)return;const on=P.ctrl.p,pw=P.pl,pulse=.5+.5*Math.sin(P.t*5);
 x.shadowColor='#ffd166';x.shadowBlur=(8+8*pulse)*(P.sc||1);circ(x,l.x,l.y,l.r);const g=x.createRadialGradient(l.x-l.r*.3,l.y-l.r*.35,l.r*.1,l.x,l.y,l.r);g.addColorStop(0,on?'#fff3c4':'#ffe08a');g.addColorStop(1,on?'#e09a00':'#c27c00');x.fillStyle=g;x.fill();x.shadowBlur=0;
 if(pw>0){x.beginPath();x.arc(l.x,l.y,l.r+3,-Math.PI/2,-Math.PI/2+pw*Math.PI*2);x.strokeStyle='#ffffff';x.lineWidth=3;x.stroke()}
 txt(x,'LANCER',l.x,l.y-l.r*.08,Math.max(6.5,l.r*.34),'#3a2400',{w:800});txt(x,'maintenir',l.x,l.y+l.r*.34,Math.max(4.5,l.r*.22),hexA('#3a2400',.75),{w:600})}
function pDraw(x,w,h){const tr=x.getTransform();P.sc=tr.a||1;P.drawn=[];if(!P.L||P.W!=w||P.H!=h)pLayout(w,h);V.k=P.L.k;V.tx=P.L.tx;V.ty=P.L.ty;x.imageSmoothingEnabled=true;
 if(P.phase=='select'){pSelect(x);return}
 const pal=TD.pal,k=V.k;
 x.drawImage(cached('bg'+TD.id,w,h,c=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,pal.side);g.addColorStop(1,'#000000');c.fillStyle=g;c.fillRect(0,0,w,h);const L=P.L;c.save();c.shadowColor=hexA(pal.accent,.5);c.shadowBlur=18*(P.sc||1);tablePath(c);c.fillStyle='#000';c.fill();c.restore();drawStatic(c,TD)}),0,0,w,h);
 // secousse légère sur les gros scores (la table seulement)
 const sh=P.shake>0?Math.min(1,P.shake/.3)*1.6:0;x.save();if(sh)x.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
 x.save();tablePath(x);x.clip();drawDyn(x,TD,P,P.t);
 const b=P.ball;if(b&&b.st!='ramp'&&P.phase!='over')pDrawBall(x,b,false);pPlungerDraw(x);
 pFlipDraw(x,0,P.fl[0].a,P.fl[0].on,pal);pFlipDraw(x,1,P.fl[1].a,P.fl[1].on,pal);
 if(TB.ramp)x.drawImage(cached('ov'+TD.id,w,h,c=>drawRampOv(c,TD)),0,0,w,h);if(b&&b.st=='ramp')pDrawBall(x,b,true);
 // étincelles (additives, peu nombreuses)
 x.globalCompositeOperation='lighter';for(const q of P.parts){x.globalAlpha=Math.min(1,q.l*2.5);x.fillStyle=q.c;circ(x,X(q.x),Y(q.y),.9*k);x.fill()}x.globalAlpha=1;x.globalCompositeOperation='source-over';x.restore();
 for(const p of P.pops){x.globalAlpha=Math.min(1,(.9-p.T)*3);txt(x,p.t,X(p.x),Y(p.y)-p.T*16*k,(p.big?8:5.5)*k,p.c,{w:800,st:1.6*k})}x.globalAlpha=1;
 // combo en cours
 if(P.combo>=2&&P.comboT>0){x.globalAlpha=Math.min(1,P.comboT*1.5);txt(x,'COMBO ×'+P.combo,X(92),Y(268),7*k,'#ffd166',{w:800,st:1.6*k});x.globalAlpha=1}
 x.restore();
 // message court (pastille) ; jamais de fenêtre bloquante
 if(P.msg&&!(P.recT>0&&P.msg.t=='NEW RECORD !')){const m=P.msg,a=Math.min(1,(1.6-m.T)*3),fs=Math.min(7.5*k,(P.L.tw-24)/Math.max(6,m.t.length)*1.75),ww=tw(x,m.t,fs,800)+16*k,yy=Y(228)-m.T*4*k;x.globalAlpha=a;rr(x,X(92)-ww/2,yy-fs*.95,ww,fs*1.9,fs);x.fillStyle='rgba(6,6,16,.72)';x.fill();x.strokeStyle=hexA(m.c,.6);x.lineWidth=.8;x.stroke();txt(x,m.t,X(92),yy,fs,m.c,{w:800});x.globalAlpha=1}
 if(P.big)pBig(x);if(P.recT>0)pRecBanner(x);
 if(P.flashScr>0){x.fillStyle='rgba(255,240,200,'+Math.min(.28,P.flashScr*.6)+')';x.fillRect(P.L.tx,P.L.ty,P.L.tw,P.L.th)}
 pHud(x);pControls(x);
 if(P.paused)pPause(x);if(P.phase=='over')pOver(x)}
// JACKPOT : grand titre doré qui apparaît vite et s'efface (le jeu continue)
function pBig(x){const B=P.big,k=V.k,a=Math.min(1,B.T*6,(2-B.T)*2.5),sc=1+Math.max(0,.35-B.T)*1.4,cy=Y(150);x.globalAlpha=a;x.save();x.translate(X(92),cy);x.scale(sc,sc);
 const fs=Math.min(24*k,(P.L.tw-16)/B.t.length*1.6),g=x.createLinearGradient(0,-fs/2,0,fs/2);g.addColorStop(0,'#fff6d0');g.addColorStop(.5,'#ffd166');g.addColorStop(1,'#ff9a1f');
 txt(x,B.t,0,0,fs,g,{w:900,st:2.4*k,glow:'#ffb000',gb:14*(P.sc||1)});txt(x,'+'+fmt(B.v),0,fs*.95,fs*.5,'#ffffff',{w:800,st:1.6*k});x.restore();x.globalAlpha=1}
function pRecBanner(x){const L=P.L,a=Math.min(1,P.recT*2),k=V.k,y=Y(118);x.globalAlpha=a;txt(x,'NOUVEAU RECORD !',X(92),y+Math.sin(P.t*8)*1.2*k,Math.min(12*k,(L.tw-16)/16*1.7),Math.sin(P.t*10)>0?'#7cff6b':'#ffffff',{w:900,st:2*k,glow:'#7cff6b',gb:10*(P.sc||1)});x.globalAlpha=1}
function pPanel(x,ph){const L=P.L,w=P.W,h=P.H;x.fillStyle='rgba(2,2,10,.6)';x.fillRect(0,0,w,h);const pw=Math.min(w-24,L.land?Math.max(220,L.tw*1.1):L.tw-12),a={x:Math.round((w-pw)/2),y:Math.round(Math.max(L.land?6:L.hud.h+8,(h-ph)/2)),w:pw,h:ph};
 rr(x,a.x,a.y,a.w,a.h,14);const g=x.createLinearGradient(0,a.y,0,a.y+a.h);g.addColorStop(0,'rgba(28,26,52,.97)');g.addColorStop(1,'rgba(12,11,28,.97)');x.fillStyle=g;x.fill();x.strokeStyle=hexA(TD.pal.accent,.7);x.lineWidth=1;x.stroke();return a}
function pBtnRect(x,b,label,col,sel){rr(x,b.x,b.y,b.w,b.h,b.h/2);const g=x.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,hexA(col,1));g.addColorStop(1,hexA(col,.72));x.fillStyle=g;x.fill();if(sel){x.strokeStyle='#ffffff';x.lineWidth=1.6;x.stroke()}
 txt(x,label,b.x+b.w/2,b.y+b.h/2,Math.min(b.h*.42,(b.w-14)/Math.max(6,label.length)*1.8),'#140c24',{w:800})}
function pPause(x){const L=P.L,bh=Math.max(26,Math.min(36,P.H*.06)),a=pPanel(x,bh*3+30+44),cx=a.x+a.w/2;txt(x,'PAUSE',cx,a.y+24,18,'#ffffff',{w:900});const bw=a.w-28;let y=a.y+46;
 P.pauseBtns=[0,1,2].map(i=>({x:Math.round(cx-bw/2),y:y+i*(bh+8),w:bw,h:bh}));pBtnRect(x,P.pauseBtns[0],'REPRENDRE','#4f9bff',P.psel==0);pBtnRect(x,P.pauseBtns[1],['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][P.son],'#4fd18b',P.psel==1);pBtnRect(x,P.pauseBtns[2],'RETOUR À LA SALLE D’ARCADE','#b18cff',P.psel==2)}
function pOver(x){const o=P.over,bh=Math.max(26,Math.min(36,P.H*.06)),a=pPanel(x,Math.min(P.H-20,198+3*(bh+8))),cx=a.x+a.w/2;let y=a.y+24;
 txt(x,'GAME OVER',cx,y,20,'#ff5f7e',{w:900});y+=20;txt(x,TD.nom,cx,y,9,hexA(TD.pal.accent,.95),{w:800});y+=24;txt(x,fmt(P.score),cx,y,Math.min(28,(a.w-20)/Math.max(4,fmt(P.score).length)*1.75),'#ffffff',{w:900,glow:hexA(TD.pal.accent,.8),gb:8*(P.sc||1)});y+=24;
 if(o.rec){txt(x,'NOUVEAU RECORD !',cx,y,10,Math.sin(P.t*9)>0?'#7cff6b':'#ffffff',{w:900});y+=14}txt(x,'BEST DE LA TABLE '+fmt(o.best),cx,y,8.5,'#7fd0ff',{w:700});y+=14;
 txt(x,'BOULES JOUÉES '+P.played+' · JACKPOTS '+P.jackN+' · COMBO MAX ×'+Math.max(1,P.comboMax),cx,y,Math.min(7.5,(a.w-16)/48*1.8),hexA('#ffffff',.7),{w:600});y+=16;
 const bw=a.w-28;P.overBtns=[0,1,2].map(i=>({x:Math.round(cx-bw/2),y:y+i*(bh+8),w:bw,h:bh}));
 if(o.t>.8){pBtnRect(x,P.overBtns[0],'REJOUER','#4f9bff',P.osel==0);pBtnRect(x,P.overBtns[1],'CHANGER DE TABLE','#ffd166',P.osel==1);pBtnRect(x,P.overBtns[2],'RETOUR À LA SALLE D’ARCADE','#b18cff',P.osel==2)}}
// ---------- écran de choix de la table ----------
function selLayout(){const w=P.W,h=P.H,land=P.L.land,n=TABLES.length,cols=land?n:2,rows=Math.ceil(n/cols),top=Math.max(44,Math.round(h*(land?.16:.12))),bot=Math.max(88,Math.round(h*(land?.3:.17))),pad=Math.max(8,Math.round(w*.03));
 const cw=Math.floor((w-pad*(cols+1))/cols),ch=Math.floor((h-top-bot-pad*(rows-1))/rows),k=Math.min((cw-8)/PW,(ch-30)/412);
 const cards=TABLES.map((t,i)=>{const c=i%cols,r=Math.floor(i/cols),last=r==rows-1&&n%cols?n%cols:cols,off=(cols-last)*(cw+pad)/2;return{x:Math.round(off+pad+c*(cw+pad)),y:top+r*(ch+pad),w:cw,h:ch,k}});
 const bw=Math.min(w-40,240),bh=Math.max(28,Math.min(40,Math.round(bot*.34)));return{cards,top,bot,play:{x:Math.round(w/2-bw/2),y:h-bot+Math.round(bot*.1),w:bw,h:bh},back:{x:Math.round(w/2-bw/2),y:h-bot+Math.round(bot*.1)+bh+8,w:bw,h:Math.round(bh*.82)}}}
function pPreview(td,c){const key='pv'+td.id+'_'+c.w+'x'+c.h;const pw=Math.ceil(PW*c.k),ph=Math.ceil(412*c.k);return cached(key,pw,ph,x=>{const sv={...V};V.k=c.k;V.tx=0;V.ty=0;const tb=td.tb;
 x.save();x.shadowColor=hexA(td.pal.accent,.4);tablePath(x);x.fillStyle='#000';x.fill();x.restore();drawStatic(x,td);x.save();tablePath(x);x.clip();
 drawDyn(x,td,{lit:{stand:Array(tb.nStand).fill(0),drop:Array(tb.nDrop).fill(0),lane:Array(tb.lanes.length).fill(1),bump:Array(tb.nBump).fill(1)},flash:{bump:[],sling:[0,0],stand:[],drop:[],sau:[]}},0);
 pFlipDraw(x,0,FL[0].rest,false,td.pal);pFlipDraw(x,1,FL[1].rest,false,td.pal);drawRampOv(x,td);x.restore();Object.assign(V,sv);P.drawn=[]})}
function pSelect(x){const w=P.W,h=P.H,S=selLayout();P.selL=S;
 x.drawImage(cached('selbg',w,h,c=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#120a2a');g.addColorStop(1,'#04030c');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<70;i++){c.fillStyle='rgba(255,255,255,'+(.08+(i%4)*.06)+')';circ(c,(i*97)%w,(i*61)%h,(i%5?.5:1));c.fill()}}),0,0,w,h);
 // balayage lumineux lent
 const sx=((P.t*.15)%1.4-.2)*w,lg=x.createLinearGradient(sx-60,0,sx+60,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,.04)');lg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=lg;x.fillRect(0,0,w,h);
 const ts=Math.min(S.top*.42,w*.12),tg=x.createLinearGradient(0,S.top*.2,0,S.top*.6);tg.addColorStop(0,'#ff7ad9');tg.addColorStop(1,'#ffd166');txt(x,'PINBALL',w/2,S.top*.38,ts,tg,{w:900,glow:'#ff4fa3',gb:10*(P.sc||1)});
 txt(x,'Choisis ta table',w/2,S.top*.38+ts*.72,Math.max(7,ts*.3),hexA('#ffffff',.65),{w:600});
 TABLES.forEach((td,i)=>{const c=S.cards[i],on=P.sel==i,pal=td.pal,img=pPreview(td,c),iw=PW*c.k,ih=412*c.k,px=c.x+(c.w-iw)/2,py=c.y+4;
  rr(x,c.x,c.y,c.w,c.h,10);x.fillStyle=on?hexA(pal.accent,.16):'rgba(255,255,255,.05)';x.fill();if(on){x.shadowColor=pal.accent;x.shadowBlur=12*(P.sc||1)}x.strokeStyle=on?pal.accent:'rgba(255,255,255,.14)';x.lineWidth=on?1.6:.8;x.stroke();x.shadowBlur=0;
  x.drawImage(img,px,py,iw,ih);
  const ny=c.y+c.h-20;txt(x,td.nom,c.x+c.w/2,ny,Math.min(9,(c.w-8)/td.nom.length*1.75),on?'#ffffff':hexA(pal.text,.85),{w:800});txt(x,'BEST '+fmt(pBest(td.id)),c.x+c.w/2,ny+11,7,hexA(pal.accent,.95),{w:700})});
 pBtnRect(x,S.play,'JOUER · '+TABLES[P.sel].nom,'#ffd166',true);pBtnRect(x,S.back,'RETOUR À LA SALLE D’ARCADE','#b18cff',false);
 const hint=P.L.land?'← A / → D : palettes · Espace : lancer':'Touche à gauche / à droite : palettes';txt(x,hint,w/2,S.back.y+S.back.h+12,7,hexA('#ffffff',.5),{w:600});
 iconBtn(x,P.L.son,'son',false)}
// ---------- toucher : chaque moitié de l'écran commande une palette ----------
const inR=(b,x,y)=>b&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function pZone(sx,sy){const L=P.L;if(!L)return null;const l=L.launch,b=P.ball;if(b&&b.st=='plunger'&&Math.hypot(sx-l.x,sy-l.y)<l.r*1.2)return'P';if(!L.land&&sy<L.hud.h)return null;return sx<P.W/2?'L':'R'}
function pPointer(type,sx,sy,id){if(id==null)id=0;pAudio();const L=P.L;if(!L)return;
 if(type=='down'){const pad=b=>({x:b.x-6,y:b.y-6,w:b.w+12,h:b.h+12});if(inR(pad(L.son),sx,sy)&&!(P.phase=='over')){pSon();return}
  if(P.phase=='select'){const S=P.selL;if(!S)return;if(inR(S.play,sx,sy)){pPlay();return}if(inR(S.back,sx,sy)){P.api&&P.api.exit();return}const i=S.cards.findIndex(c=>inR(c,sx,sy));if(i>=0){if(i==P.sel)pPlay();else pPick(i)}return}
  if(P.paused){const k=(P.pauseBtns||[]).findIndex(b=>inR(b,sx,sy));if(k>=0){P.psel=k;pPauseChoice(k)}return}
  if(P.phase!='over'&&inR(pad(L.menu),sx,sy)){P.paused=true;P.psel=2;P.touches.clear();return}
  if(P.phase=='over'&&P.over&&P.over.t>.8&&P.overBtns){const k=P.overBtns.findIndex(b=>inR(b,sx,sy));if(k>=0){pOverChoice(k);return}}
  const z=pZone(sx,sy);if(z)P.touches.set(id,z);return}
 if(type=='up'||type=='cancel'){P.touches.delete(id);return}
 if(type=='move'&&P.touches.has(id)){const z=pZone(sx,sy);if(z&&z!='P'&&P.touches.get(id)!='P')P.touches.set(id,z)}}
function pKey(e){if(!P.api)return;if(e.code=='KeyM')pSon();if((e.code=='Escape'||e.code=='KeyP')&&P.phase=='jeu'){P.paused=!P.paused;P.psel=0}}
// changement d'orientation ou appli en arrière-plan : on relâche tout (aucune palette bloquée)
function pRelease(){P.touches.clear();P.ctrl={l:false,r:false,p:false}}
// ---------- cycle de vie ----------
const Pinball={hires:2,
 start(api){P.api=api;const d=pData();P.son=d.son||0;P.paused=false;P.L=null;P.touches.clear();P.okN=null;P.ball=null;P.score=0;P.balls=3;P.mult=1;P.pops=[];P.parts=[];P.msg=null;P.over=null;P.recT=0;
  P.fl.forEach((f,i)=>{f.a=FL[i].rest;f.w=0;f.on=false});const last=TABLES.findIndex(t=>t.id==d.lastTable);P.sel=last>=0?last:0;useTable(P.sel);P.phase='select';pAudio();pMus(.75,TABLES[P.sel].music);addEventListener('keydown',pKey);addEventListener('blur',pRelease);addEventListener('orientationchange',pRelease);document.addEventListener('visibilitychange',pRelease)},
 update:pUpdate,draw:pDraw,pointer:pPointer,
 stop(){removeEventListener('keydown',pKey);removeEventListener('blur',pRelease);removeEventListener('orientationchange',pRelease);document.removeEventListener('visibilitychange',pRelease);if(P.api){try{const d=pData();d.lastTable=TD.id;if(P.phase!='select')pRecordCheck(0);P.api.save()}catch(e){}}try{JEUSON.sfxLevel(1)}catch(e){}
  P.api=null;P.paused=false;pMus(null);P.touches.clear();P.ctrl={l:false,r:false,p:false};P.phase='select';P.ball=null;P.pops=[];P.parts=[];P.cache={};P.L=null;P.prev={};P.recT=0},
 _state:P,_tables:TABLES,get _table(){return TB},_flip:FL,_use:useTable};
ARC.register('pinball',Pinball);
})();
