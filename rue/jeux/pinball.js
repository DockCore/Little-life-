// ===== MINI-JEU PINBALL (module de la borne d'arcade) =====
// Flipper vertical en 2D. S'enregistre auprès de la borne : ARC.register('pinball', module).
// Table logique de 200 × 400 unités (physique indépendante de la résolution), dessinée en pixel art à l'échelle de l'écran.
// Commandes abstraites (gauche, droite, lancer) alimentées par : les deux gros boutons ronds à l'écran (multi-touch),
// le clavier (flèches, Espace) et les commandes physiques de la borne (joystick gauche/droite, bouton OK).
(function(){
const PW=200,PH=400,BR=5.5,GRAV=430,VMAX=900;
// ---------- sons courts ----------
function pAudio(){try{if(typeof JEUSON!='undefined')JEUSON.ctx()}catch(e){}}
// les sons passent par le module partagé JEUSON (musique d'arcade + effets) ; rien ne se joue s'il est absent
const pfx=(n,k,g)=>{if(P.mute)return;try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k,g)}catch(e){}};
const PS={flip:()=>pfx('pbFlip',1,.04),bump:()=>pfx('pbBump',1,.03),sling:()=>pfx('pbSling',1,.03),target:()=>pfx('pbTarget',1,.03),drop:()=>pfx('pbDrop',1,.03),lane:()=>pfx('pbLane',1,.05),
 ramp:(k)=>pfx('pbRamp',k||1,.2),launch:(k)=>pfx('pbLaunch',k||0,.1),charge:(k)=>pfx('pbCharge',k,.12),drain:()=>pfx('pbDrain',1,.5),bonus:()=>pfx('pbBonus',1,.3),start:()=>pfx('pbStart',1,.5),
 over:()=>pfx('pbOver',1,1),record:()=>pfx('pbRecord',1,1),wall:(k)=>pfx('pbWall',k||.6,.06),combo:(k)=>pfx('pbCombo',k,.1),ball:()=>pfx('pbBall',1,.3)};
const pMus=(lv)=>{try{if(typeof JEUSON=='undefined')return;if(lv==null)JEUSON.stop();else{JEUSON.music('pinball');JEUSON.level(lv)}}catch(e){}};
// ---------- table : géométrie ----------
const seg=(ax,ay,bx,by,o={})=>Object.assign({a:[ax,ay],b:[bx,by],e:.45,kick:0,type:'wall'},o);
function pBuild(){const S=[],C=[];
 // bord extérieur : murs et arc supérieur
 S.push(seg(8,100,8,412));S.push(seg(192,100,192,404));
 const arc=[];for(let i=0;i<=24;i++){const t=Math.PI-i/24*Math.PI;arc.push([100+92*Math.cos(t),100-92*Math.sin(t)])}for(let i=0;i<24;i++)S.push(seg(...arc[i],...arc[i+1],{e:.35}));
 // couloir du lanceur (à droite) + porte anti-retour
 S.push(seg(176,120,176,404));S.push(seg(192,104,176,120,{type:'gate',e:.3}));S.push(seg(176,404,192,404,{e:0}));
 // couloirs latéraux : rails des couloirs intérieurs (vers les palettes) et couloirs extérieurs (perte de boule)
 S.push(seg(22,276,22,326,{type:'rail'}));S.push(seg(22,326,52,347,{type:'rail'}));
 S.push(seg(162,276,162,326,{type:'rail'}));S.push(seg(162,326,132,347,{type:'rail'}));
 // lance-boules (slingshots) : le grand côté renvoie la boule
 S.push(seg(34,286,34,318,{e:.4}));S.push(seg(34,318,50,330,{e:.4}));S.push(seg(34,286,50,330,{type:'sling',side:0,e:.6,kick:230}));
 S.push(seg(150,286,150,318,{e:.4}));S.push(seg(150,318,134,330,{e:.4}));S.push(seg(150,286,134,330,{type:'sling',side:1,e:.6,kick:230}));
 // déflecteurs : renvoient vers le plateau la boule qui longe les bords (orbite, couloirs)
 S.push(seg(8,104,30,128,{type:'deflect',e:.55}));S.push(seg(8,232,27,252,{type:'deflect',e:.5}));S.push(seg(176,232,157,252,{type:'deflect',e:.5}));
 // entrée de rampe (couloir gauche) : sans assez d'élan la boule retombe
 S.push(seg(42,178,42,138,{type:'rail'}));S.push(seg(8,136,42,136,{type:'rampwall',e:.3}));
 // cibles fixes (gauche) et cibles tombantes (droite)
 for(let i=0;i<3;i++)S.push(seg(46,196+i*16,46,207+i*16,{type:'stand',id:i,e:.5}));S.push(seg(43,194,43,243,{e:.3}));
 for(let i=0;i<3;i++)S.push(seg(150,172+i*16,150,183+i*16,{type:'drop',id:i,e:.5}));S.push(seg(152,170,152,219,{e:.3}));
 // couloirs du haut (passages A B C) : petits poteaux
 for(const x of[70,92,114,136]){S.push(seg(x,30,x,48,{type:'rail',e:.3}));C.push({x,y:48,r:2.5,e:.5,type:'post'})}
 // bumpers et obstacles
 C.push({x:72,y:92,r:11,e:.8,kick:260,type:'bumper',id:0});C.push({x:112,y:86,r:11,e:.8,kick:260,type:'bumper',id:1});C.push({x:92,y:124,r:10,e:.8,kick:260,type:'bumper',id:2});
 C.push({x:92,y:198,r:4,e:.6,type:'post'});C.push({x:68,y:238,r:3,e:.6,type:'post'});C.push({x:116,y:238,r:3,e:.6,type:'post'});
 C.push({x:22,y:276,r:2.5,e:.5,type:'post'});C.push({x:162,y:276,r:2.5,e:.5,type:'post'});
 return{S,C}}
const TB=pBuild();
// rampe : chemin surélevé (de l'entrée gauche jusqu'au couloir intérieur droit)
const RAMP=[[25,142],[22,96],[28,58],[46,34],[72,22],[100,18],[128,22],[152,34],[166,56],[170,96],[170,160],[164,222],[156,268]];
const RLEN=(()=>{let L=0;for(let i=1;i<RAMP.length;i++)L+=Math.hypot(RAMP[i][0]-RAMP[i-1][0],RAMP[i][1]-RAMP[i-1][1]);return L})();
function rampAt(d){for(let i=1;i<RAMP.length;i++){const a=RAMP[i-1],b=RAMP[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l){const u=d/l;return{x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u,dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}d-=l}const a=RAMP[RAMP.length-2],b=RAMP[RAMP.length-1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return{x:b[0],y:b[1],dx:(b[0]-a[0])/l,dy:(b[1]-a[1])/l}}
const LANES=[81,103,125];
// palettes : pivot, longueur, rayons, angles (repère écran, y vers le bas)
const FL=[{px:54,py:350,len:33,r0:5.5,r1:3,rest:.5,up:-.48,side:0},{px:130,py:350,len:33,r0:5.5,r1:3,rest:Math.PI-.5,up:Math.PI+.48,side:1}];
// ---------- état ----------
const P={api:null,phase:'intro',W:0,H:0,L:null,ball:null,fl:[{a:FL[0].rest,w:0,on:false},{a:FL[1].rest,w:0,on:false}],score:0,balls:3,mult:1,t:0,pops:[],parts:[],
 lit:{stand:[0,0,0],drop:[0,0,0],lane:[0,0,0],bump:[0,0,0]},flash:{bump:[0,0,0],sling:[0,0],stand:[0,0,0],drop:[0,0,0]},chain:0,chainT:0,rampCombo:0,rampT:0,pl:0,charging:false,msg:null,touches:new Map(),ctrl:{l:false,r:false,p:false},okN:null,sel:0,over:null,stuckT:0,lastLaneIn:-1,dropT:0};
// ---------- partie ----------
function pNewGame(){P.score=0;P.balls=3;P.mult=1;P.lit={stand:[0,0,0],drop:[0,0,0],lane:[0,0,0],bump:[0,0,0]};P.over=null;P.pops=[];P.parts=[];P.chain=0;P.rampCombo=0;P.phase='jeu';pNewBall();PS.start();pMus(1);P.stats={bump:0,ramp:0,targets:0}}
function pNewBall(){P.ball={x:184,y:396-BR,vx:0,vy:0,st:'plunger',rd:0};P.pl=0;P.charging=false;P.stuckT=0;P.msg={t:'BOULE '+(4-P.balls),c:'#ffe14f',T:0}}
function pAdd(pts,x,y,col){const v=pts*P.mult;P.score+=v;P.pops.push({t:'+'+v,x,y,T:0,c:col||'#ffe14f'})}
function pFx(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=40+Math.random()*90;P.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.3+Math.random()*.3,c})}}
function pMultUp(why){if(P.mult<5){P.mult++;P.msg={t:'MULTIPLICATEUR X'+P.mult,c:'#38e1ff',T:0}}else P.msg={t:why,c:'#38e1ff',T:0};PS.bonus()}
// ---------- physique ----------
function pCollideSeg(b,s){if(s.type=='drop'&&P.lit.drop[s.id])return;const ax=s.a[0],ay=s.a[1],bx=s.b[0],by=s.b[1],ex=bx-ax,ey=by-ay,L2=ex*ex+ey*ey;let t=((b.x-ax)*ex+(b.y-ay)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=ax+ex*t,cy=ay+ey*t;let dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy);if(d>=BR)return;
 if(s.type=='gate'&&!(b.vy>0&&b.y<cy))return;// porte du lanceur : ne bloque que la boule qui redescend
 if(s.type=='rampwall'&&!(b.vy<0&&b.y>cy))return;// fond de l'entrée de rampe : la boule qui vient d'en haut passe
 let nx,ny;if(d>1e-6){nx=dx/d;ny=dy/d}else{const L=Math.sqrt(L2);nx=-ey/L;ny=ex/L}b.x=cx+nx*BR;b.y=cy+ny*BR;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+s.e)*vn*nx;b.vy-=(1+s.e)*vn*ny;b.vx*=.995;b.vy*=.995;const imp=-vn;
  if(s.type=='sling'&&imp>35){b.vx+=nx*s.kick;b.vy+=ny*s.kick;P.flash.sling[s.side]=1;pAdd(10,cx,cy,'#ffffff');PS.sling();pFx(cx,cy,'#ffffff',6);pChain()}
  else if(s.type=='stand'&&imp>20){P.flash.stand[s.id]=1;if(!P.lit.stand[s.id]){P.lit.stand[s.id]=1;pAdd(250,cx,cy,'#7cff6b')}else pAdd(50,cx,cy,'#7cff6b');PS.target();P.stats.targets++;
   if(P.lit.stand.every(Boolean)){pAdd(1000,cx+20,cy,'#38e1ff');P.lit.stand=[0,0,0];pMultUp('CIBLES COMPLÈTES !')}}
  else if(s.type=='drop'&&imp>20){P.lit.drop[s.id]=1;P.flash.drop[s.id]=1;pAdd(300,cx,cy,'#ff9a1f');PS.drop();P.stats.targets++;pFx(cx,cy,'#ff9a1f',8);
   if(P.lit.drop.every(Boolean)){pAdd(1500,cx-20,cy,'#38e1ff');P.dropT=1.6;pMultUp('BANQUE COMPLÈTE !')}}
  else if(imp>120)PS.wall(Math.min(1,imp/500))}}
function pCollideCirc(b,c){const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy),R=BR+c.r;if(d>=R)return;const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=c.x+nx*R;b.y=c.y+ny*R;
 const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+c.e)*vn*nx;b.vy-=(1+c.e)*vn*ny}
 if(c.type=='bumper'){b.vx+=nx*c.kick;b.vy+=ny*c.kick;P.flash.bump[c.id]=1;P.lit.bump[c.id]=1;pAdd(100,c.x,c.y-c.r,'#ff4fa3');PS.bump();pFx(c.x+nx*c.r,c.y+ny*c.r,'#ff9ad0',8);P.stats.bump++;pChain();
  if(P.lit.bump.every(Boolean)){P.lit.bump=[0,0,0];pAdd(500,c.x,c.y,'#38e1ff');PS.bonus()}}}
// enchaînement de rebonds : bonus croissant tant que la boule continue de rebondir vite
function pChain(){if(P.chainT>0){P.chain++;if(P.chain>=3){pAdd(25*P.chain,P.ball.x,P.ball.y-12,'#ffd166');PS.combo(P.chain);if(P.chain==5)P.msg={t:'COMBO X'+P.chain,c:'#ffd166',T:0}}}else P.chain=1;P.chainT=1.4}
function pFlipGeom(i){const f=FL[i],a=P.fl[i].a;return{px:f.px,py:f.py,qx:f.px+Math.cos(a)*f.len,qy:f.py+Math.sin(a)*f.len,r0:f.r0,r1:f.r1,w:P.fl[i].w}}
function pCollideFlip(b,i){const g=pFlipGeom(i),ex=g.qx-g.px,ey=g.qy-g.py,L2=ex*ex+ey*ey;let t=((b.x-g.px)*ex+(b.y-g.py)*ey)/L2;t=Math.max(0,Math.min(1,t));
 const cx=g.px+ex*t,cy=g.py+ey*t,rr=g.r0+(g.r1-g.r0)*t,dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy),R=BR+rr;if(d>=R)return;
 const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;b.x=cx+nx*R;b.y=cy+ny*R;
 // vitesse du point de contact de la palette (rotation autour du pivot)
 const vcx=-g.w*(b.y-g.py),vcy=g.w*(b.x-g.px),rvx=b.vx-vcx,rvy=b.vy-vcy,vn=rvx*nx+rvy*ny;if(vn<0){const e=.3;b.vx=rvx-(1+e)*vn*nx+vcx;b.vy=rvy-(1+e)*vn*ny+vcy}}
function pFlippers(dt){for(let i=0;i<2;i++){const f=FL[i],s=P.fl[i],on=i?P.ctrl.r:P.ctrl.l;if(on&&!s.on)PS.flip();s.on=on;const target=on?f.up:f.rest,dir=Math.sign(target-s.a),sp=on?24:15,old=s.a;
  if(dir){s.a+=dir*sp*dt;if((dir>0&&s.a>target)||(dir<0&&s.a<target))s.a=target}s.w=(s.a-old)/dt}}
function pStep(dt){const b=P.ball;pFlippers(dt);if(b.st=='ramp'){b.rd+=b.rs*dt;b.rs=Math.max(170,b.rs-120*dt);const q=rampAt(b.rd);b.x=q.x;b.y=q.y;
  if(b.rd>=RLEN){b.st='play';b.vx=q.dx*b.rs*.6;b.vy=Math.max(80,q.dy*b.rs*.6);P.stats.ramp++;P.rampCombo=P.rampT>0?P.rampCombo+1:1;P.rampT=5;const pts=500*P.rampCombo;pAdd(pts,b.x,b.y-14,'#38e1ff');PS.ramp(P.rampCombo);P.msg={t:P.rampCombo>1?'RAMPE COMBO X'+P.rampCombo:'RAMPE !',c:'#38e1ff',T:0};if(P.rampCombo>=3)pMultUp('SUPER COMBO !')}return}
 if(b.st=='plunger'){b.x=184;b.y=396-BR-P.pl*14;b.vx=b.vy=0;return}
 b.vy+=GRAV*dt;const sp=Math.hypot(b.vx,b.vy);if(sp>VMAX){b.vx*=VMAX/sp;b.vy*=VMAX/sp}
 b.x+=b.vx*dt;b.y+=b.vy*dt;
 for(const s of TB.S)pCollideSeg(b,s);for(const c of TB.C)pCollideCirc(b,c);pCollideFlip(b,0);pCollideFlip(b,1);
 // capteurs : entrée de rampe, passages du haut
 if(b.x>10&&b.x<40&&b.y>137&&b.y<154&&b.vy<-150){b.st='ramp';b.rd=0;b.rs=Math.max(260,Math.hypot(b.vx,b.vy));return}
 if(b.y>34&&b.y<46){const li=LANES.findIndex(x=>Math.abs(b.x-x)<6);if(li>=0&&li!==P.lastLaneIn){P.lastLaneIn=li;if(!P.lit.lane[li]){P.lit.lane[li]=1;pAdd(150,LANES[li],40,'#ffd166');PS.lane()}
   if(P.lit.lane.every(Boolean)){P.lit.lane=[0,0,0];pAdd(1000,92,40,'#38e1ff');pMultUp('PASSAGES A B C !')}}}else P.lastLaneIn=-1;
 // sécurité : la boule ne quitte jamais la table (sinon remise dans le lanceur, sans perte)
 if(b.x<-10||b.x>PW+10||b.y<-20||!isFinite(b.x+b.y)){pNewBall();P.balls=P.balls}}
// ---------- mise à jour ----------
function pUpdate(dt,inp){dt=Math.min(dt,.05);P.t+=dt;inp=inp||{};const n=inp.okN||0,ok=P.okN!=null&&n>P.okN;P.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 // commandes abstraites : écran tactile + clavier + commandes de la borne (boutons physiques futurs : P.ctrl)
 let tl=false,tr=false,tp=false;P.touches.forEach(v=>{if(v=='L')tl=true;else if(v=='R')tr=true;else if(v=='P')tp=true});
 P.ctrl.l=tl||!!inp.left;P.ctrl.r=tr||!!inp.right;P.ctrl.p=tp||!!inp.a;
 if(P.phase=='intro'){pFlippers(dt);if(ok)pNewGame();pTick(dt);return}
 if(P.phase=='over'){pFlippers(dt);P.over.t+=dt;if(q.length){const d=q[q.length-1];P.sel=d=='right'||d=='down'?1:0}if(ok&&P.over.t>.8)pOverChoice(P.sel);pTick(dt);return}
 pMus(P.paused?.3:(P.phase=='over'?.35:1));
 if(P.paused){if(q.length){const d=q[q.length-1];P.psel=d=='right'||d=='down'?1:0}if(ok){if(P.psel==1){P.paused=false;P.api&&P.api.exit()}else P.paused=false}return}
 const b=P.ball;
 // lanceur : maintenir pour tendre le ressort, relâcher pour propulser (un appui bref suffit)
 if(b.st=='plunger'){if(P.ctrl.p){P.charging=true;P.pl=Math.min(1,P.pl+dt*1.3);PS.charge(P.pl)}else if(P.charging){P.charging=false;b.st='play';b.vy=-(640+P.pl*260);b.vx=0;PS.launch(P.pl);P.pl=0;P.msg=null}}
 if(P.phase=='perdue'){P.lostT-=dt;pFlippers(dt);if(P.lostT<=0){if(P.balls<=0){P.phase='over';P.sel=0;const rec=P.api?P.api.record(P.score):false;P.over={t:0,rec};PS.over();if(rec)setTimeout(()=>{if(P.phase=='over')PS.record()},1500);pMus(.35)}else{P.phase='jeu';pNewBall();PS.ball()}}pTick(dt);return}
 const sp=Math.max(Math.hypot(b.vx,b.vy),300),nsub=Math.min(30,Math.max(4,Math.ceil(sp*dt/(BR*.4)))),h=dt/nsub;for(let i=0;i<nsub;i++){pStep(h);if(b.y>PH+14)break}
 if(b.y>PH+14&&b.st=='play'){P.balls--;P.phase='perdue';P.lostT=1.6;P.msg={t:P.balls>0?'BOULE PERDUE':'DERNIÈRE BOULE PERDUE',c:'#ff4f6a',T:0};PS.drain();P.chain=0}
 // boule immobile hors des palettes : petite secousse automatique pour ne jamais bloquer
 if(b.st=='play'){const still=Math.hypot(b.vx,b.vy)<6&&!P.ctrl.l&&!P.ctrl.r;P.stuckT=still?P.stuckT+dt:0;if(P.stuckT>2.5){b.vy=-160;b.vx=(Math.random()-.5)*120;P.stuckT=0}}
 if(P.dropT>0){P.dropT-=dt;if(P.dropT<=0)P.lit.drop=[0,0,0]}
 pTick(dt)}
function pTick(dt){P.pops.forEach(p=>p.T+=dt);P.pops=P.pops.filter(p=>p.T<.9);P.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.9;q.vy*=.9;q.l-=dt});P.parts=P.parts.filter(q=>q.l>0);
 for(const k in P.flash)P.flash[k]=P.flash[k].map(v=>Math.max(0,v-dt*4));if(P.chainT>0){P.chainT-=dt;if(P.chainT<=0)P.chain=0}if(P.rampT>0)P.rampT-=dt;if(P.msg){P.msg.T+=dt;if(P.msg.T>1.6)P.msg=null}}
function pOverChoice(k){if(k==0)pNewGame();else P.api&&P.api.exit()}
// ---------- mise en page : table verticale au centre, gros boutons ronds de chaque côté ----------
function pLayout(w,h){P.W=w;P.H=h;const land=w>h*.9;let L={land};
 if(!land){const side=Math.max(34,Math.min(60,Math.round(w*(w<200?.17:.19)))),k=Math.min((w-2*side)/PW,(h-40)/PH),tw=PW*k,th=PH*k;L.k=k;L.tx=Math.round((w-tw)/2);L.ty=h-Math.round(th)-2;L.tw=tw;L.th=th;L.side=side;L.hud={x:0,y:0,w,h:L.ty-2}}
 else{const k=(h-4)/PH,tw=PW*k;L.k=k;L.tx=Math.round((w-tw)/2);L.ty=2;L.tw=tw;L.th=PH*k;L.side=L.tx}
 // boutons des palettes : à hauteur des palettes, dans les marges latérales
 const fy=L.ty+FL[0].py*L.k,r=Math.round(Math.min(L.side*(land?.3:.47)-1,Math.max(16,Math.min(L.side*(land?.3:.47),h*(land?.17:.075)))));
 L.bl={x:Math.round(L.tx/2),y:Math.round(Math.min(h-r-15,fy)),r};L.br={x:Math.round(w-L.tx/2),y:L.bl.y,r};
 if(!land){L.bl.x=Math.round(L.tx/2);L.br.x=Math.round(w-(w-L.tx-L.tw)/2)}
 // commande de lancement : au-dessus du bouton droit
 const pw=Math.round(land?r*.75:r*1.1),ph2=Math.round(land?r*1.7:r*2.6);L.pl={x:L.br.x-pw/2,y:L.br.y-r-12-ph2,w:pw,h:ph2};
 // bouton menu (pause) : coin haut gauche en portrait, haut droit en paysage
 const ms=Math.max(16,Math.round(Math.min(w,h)*.07));L.menu=land?{x:w-ms-6,y:6,w:ms,h:ms}:{x:6,y:6,w:ms,h:ms};
 P.L=L;P.bg=null;P.ov=null}
const X=x=>P.L.tx+x*P.L.k,Y=y=>P.L.ty+y*P.L.k;
// ---------- primitives pixel ----------
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
function D(x,cx,cy,r,c){x.fillStyle=c;const Rr=Math.ceil(r);for(let j=-Rr;j<=Rr;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||Math.abs(j)<r)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function Ln(x,ax,ay,bx,by,c,t=1){const d=Math.max(Math.abs(bx-ax),Math.abs(by-ay)),n=Math.max(1,Math.ceil(d));x.fillStyle=c;for(let i=0;i<=n;i++){const u=i/n;x.fillRect(Math.round(ax+(bx-ax)*u-t/2),Math.round(ay+(by-ay)*u-t/2),t,t)}}
function LnL(x,a,b,c,t){Ln(x,X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),c,t)}
// ---------- décor fixe (mis en cache) ----------
function pBg(){const w=P.W,h=P.H,L=P.L,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),k=L.k,th=Math.max(1,Math.round(k*1.6));
 // fond des côtés
 R(x,0,0,w,h,'#0b0824');for(let i=0;i<w;i+=6)R(x,i,0,1,h,'rgba(120,80,255,.06)');
 // plateau
 const g=x.createLinearGradient(0,L.ty,0,L.ty+L.th);g.addColorStop(0,'#1a0f45');g.addColorStop(.5,'#241060');g.addColorStop(1,'#140a38');x.fillStyle=g;x.save();x.beginPath();
 x.moveTo(X(8),Y(412));x.lineTo(X(8),Y(100));for(let i=0;i<=24;i++){const t=Math.PI-i/24*Math.PI;x.lineTo(X(100+92*Math.cos(t)),Y(100-92*Math.sin(t)))}x.lineTo(X(192),Y(404));x.closePath();x.fill();x.clip();
 // décor : rayons, étoiles, logo, flèches
 for(let i=0;i<14;i++){const a=-Math.PI*.95+i/13*Math.PI*.9;x.globalAlpha=.08;Ln(x,X(92),Y(330),X(92+Math.cos(a)*260),Y(330+Math.sin(a)*260),i%2?'#ff4fa3':'#38e1ff',Math.max(2,Math.round(k*6)));x.globalAlpha=1}
 for(let i=0;i<40;i++){const sx=(i*67)%180+12,sy=(i*97)%300+40;R(x,X(sx),Y(sy),1,1,'rgba(255,255,255,.5)')}
 const lsc=Math.max(1,Math.round(k*1.1));x.globalAlpha=.22;axCText(x,'LITTLE',X(92),Y(262),'#38e1ff',lsc);axCText(x,'LIFE',X(92),Y(262)+8*lsc,'#ff4fa3',lsc);x.globalAlpha=1;
 const arrow=(ax,ay,dir,c)=>{for(let i=0;i<6;i++)R(x,X(ax)-i*k*.6,Y(ay)+i*k*.9*dir,Math.max(1,i*k*1.2),Math.max(1,k*.9),c)};arrow(25,190,1,'rgba(56,225,255,.5)');arrow(92,170,-1,'rgba(255,209,102,.45)');arrow(184,330,-1,'rgba(255,209,102,.5)');
 // zones de lumière des cibles et du centre
 x.globalAlpha=.25;D(x,X(92),Y(198),9*k,'#ff4fa3');x.globalAlpha=1;
 x.restore();
 // couloir du lanceur
 R(x,X(177),Y(113),(15)*k,(291)*k,'#120a30');for(let yy=130;yy<396;yy+=12)R(x,X(183),Y(yy),k*2,k*4,'rgba(255,209,102,.25)');
 // murs (tubes néon), rails métalliques
 for(const s of TB.S){if(s.type=='drop'||s.type=='stand')continue;const col=s.type=='rail'?'#b8bcd0':s.type=='sling'?'#ffffff':s.type=='gate'?'#ffd166':s.type=='rampwall'?'#38e1ff':s.type=='deflect'?'#ff4fa3':'#7a5cff';
  if(s.type=='wall'||s.type=='rampwall'||s.type=='deflect'){LnL(x,s.a,s.b,'#0a0618',th+2);LnL(x,s.a,s.b,col,th);x.globalAlpha=.5;LnL(x,s.a,s.b,'#c8b8ff',1);x.globalAlpha=1}else{LnL(x,s.a,s.b,'#0a0618',th+1);LnL(x,s.a,s.b,col,th)}}
 // lance-boules : triangles remplis
 for(const[sx,dir]of[[34,1],[150,-1]]){x.fillStyle='#3a1a6a';x.beginPath();x.moveTo(X(sx),Y(286));x.lineTo(X(sx),Y(318));x.lineTo(X(sx+16*dir),Y(330));x.closePath();x.fill();x.fillStyle='#ff4fa3';x.globalAlpha=.4;x.beginPath();x.moveTo(X(sx+2*dir),Y(292));x.lineTo(X(sx+2*dir),Y(314));x.lineTo(X(sx+11*dir),Y(322));x.closePath();x.fill();x.globalAlpha=1}
 // poteaux
 for(const cc of TB.C)if(cc.type=='post'){D(x,X(cc.x),Y(cc.y),cc.r*k+1,'#0a0618');D(x,X(cc.x),Y(cc.y),cc.r*k,'#d6dbe6');D(x,X(cc.x)-cc.r*k*.3,Y(cc.y)-cc.r*k*.3,Math.max(1,cc.r*k*.3),'#ffffff')}
 // passages du haut : lettres
 LANES.forEach((lx,i)=>axCText(x,'ABC'[i],X(lx),Y(52),'rgba(255,209,102,.6)',1));
 // marquages : couloirs extérieurs (perte de boule)
 axCText(x,'OUT',X(15),Y(360),'rgba(255,79,106,.6)',1);axCText(x,'OUT',X(169),Y(360),'rgba(255,79,106,.6)',1);
 return c}
// rampe et rails surélevés (dessinés au-dessus de la boule qui passe dessous)
function pOverlay(){const w=P.W,h=P.H,L=P.L,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),k=L.k,half=6.5;
 const pts=RAMP.map(p=>[X(p[0]),Y(p[1])]);
 x.globalAlpha=.42;for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l*half*k,ny=dx/l*half*k;x.fillStyle='#38e1ff';x.beginPath();x.moveTo(a[0]+nx,a[1]+ny);x.lineTo(b[0]+nx,b[1]+ny);x.lineTo(b[0]-nx,b[1]-ny);x.lineTo(a[0]-nx,a[1]-ny);x.closePath();x.fill()}x.globalAlpha=1;
 for(const s of[1,-1])for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l*half*k*s,ny=dx/l*half*k*s;Ln(x,a[0]+nx,a[1]+ny,b[0]+nx,b[1]+ny,'#0a0618',2);Ln(x,a[0]+nx,a[1]+ny,b[0]+nx,b[1]+ny,'#c8f6ff',1)}
 axCText(x,'RAMPE',X(100),Y(20)-3,'#ffffff',1,'#0a0618');return c}
// ---------- rendu ----------
function pDrawBall(x,b,el){const k=P.L.k,r=BR*k*(el?1.18:1),cx=X(b.x),cy=Y(b.y);D(x,cx+k,cy+k*1.6,r,'rgba(0,0,0,.35)');D(x,cx,cy,r+1,'#0a0618');D(x,cx,cy,r,'#9aa0b4');D(x,cx+r*.15,cy+r*.15,r*.8,'#7a8096');D(x,cx-r*.1,cy-r*.1,r*.75,'#c9cedd');D(x,cx-r*.25,cy-r*.25,r*.5,'#e8ebf4');D(x,cx-r*.38,cy-r*.42,Math.max(1,r*.22),'#ffffff');R(x,cx+r*.2,cy+r*.35,Math.max(1,r*.35),1,'rgba(255,79,163,.6)')}
function pDrawFlip(x,i){const g=pFlipGeom(i),k=P.L.k,on=P.fl[i].on,n=Math.max(8,Math.round(g.r0*k*3));
 for(const pass of[0,1,2])for(let j=0;j<=n;j++){const u=j/n,cx=X(g.px+(g.qx-g.px)*u),cy=Y(g.py+(g.qy-g.py)*u),rr=(g.r0+(g.r1-g.r0)*u)*k;D(x,cx,cy,pass==0?rr+1:pass==1?rr:rr*.45,pass==0?'#0a0618':pass==1?(on?'#ffffff':'#e8e6f2'):(i?'#38e1ff':'#ff4fa3'))}
 D(x,X(g.px),Y(g.py),Math.max(1,g.r0*k*.35),'#ffd166')}
function pButton(x,b,col,dk,hl,on,label,arrow){const r=b.r,lift=on?1:Math.max(3,Math.round(r*.14));
 if(on){x.globalAlpha=.35;D(x,b.x,b.y,r*1.35,col);x.globalAlpha=1}
 D(x,b.x,b.y+lift+2,r+3,'#05040e');D(x,b.x,b.y+2,r+2,'#c8ccd8');D(x,b.x,b.y+1,r+1,'#6a6e7a');
 for(let k=lift;k>=0;k--)D(x,b.x,b.y-k+lift,r,k==lift?col:dk);const top=b.y;D(x,b.x,top,r*.82,col);D(x,b.x-r*.28,top-r*.32,r*.3,hl);
 // contour lumineux
 x.globalAlpha=on?.95:.55+.25*Math.sin(P.t*4);const n=Math.round(r*6);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;R(x,b.x+Math.cos(a)*(r+4),b.y+Math.sin(a)*(r+4),1,1,hl)}x.globalAlpha=1;
 const s=Math.max(1,Math.round(r/9));for(let i=0;i<4*s;i++){const hh=Math.round((4*s-i)*.9);R(x,b.x+(arrow<0?-i:i)-(arrow<0?-2*s:2*s),top-hh,1,2*hh+1,'rgba(255,255,255,.85)')}
 axCText(x,label,b.x,b.y+r+8,on?'#ffffff':'#c9c4f0',1,'#05040e')}
function pPlunger(x){const p=P.L.pl,b=P.ball,ready=b&&b.st=='plunger'&&P.phase=='jeu',on=P.ctrl.p&&ready;R(x,p.x,p.y+3,p.w,p.h,'#05040e');R(x,p.x,p.y,p.w,p.h,ready?(Math.floor(P.t*3)%2&&!on?'#ffd23f':'#ffb81f'):'#5a5470');R(x,p.x,p.y,p.w,2,'rgba(255,255,255,.5)');
 // ressort qui se comprime
 const sh=Math.round((p.h-24)*(1-.6*P.pl));for(let i=0;i<6;i++)R(x,p.x+3,p.y+10+i*sh/6,p.w-6,1,'#3a2a08');R(x,p.x+p.w/2-3,p.y+4,6,6,'#3a2a08');
 if(P.pl>0){R(x,p.x-4,p.y+p.h,2,-p.h*P.pl,'#ff4f6a')}
 axCText(x,'LANCER',p.x+p.w/2,p.y+p.h+6,ready?'#ffe14f':'#8f97c0',1,'#05040e')}
function pHud(x){const L=P.L,w=P.W,best=Math.max(P.api?P.api.best():0,P.score),fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
 const items=[['SCORE',fmt(P.score),'#ffe14f'],['BEST',fmt(best),'#38e1ff'],['BALL',String(Math.max(0,P.balls)),'#ff4fa3'],['MULTIPLIER','X'+P.mult,'#7cff6b']];
 if(!L.land){const H2=L.hud.h;
  // fronton du flipper (comme la vitre lumineuse d'un vrai flipper) : logo, afficheur à points, compteurs
  R(x,0,0,w,H2,'#0f0a2e');const gg=x.createLinearGradient(0,0,0,H2);gg.addColorStop(0,'#2a0f5a');gg.addColorStop(1,'#120a34');x.fillStyle=gg;x.fillRect(3,3,w-6,H2-6);
  for(let i=0;i<28;i++){const sx=(i*53)%(w-10)+5,sy=(i*31)%(H2-10)+5;R(x,sx,sy,1,1,i%3?'rgba(255,255,255,.5)':'#ffd166')}
  const fr=(c,o)=>{R(x,o,o,w-2*o,1,c);R(x,o,H2-1-o,w-2*o,1,c);R(x,o,o,1,H2-2*o,c);R(x,w-1-o,o,1,H2-2*o,c)};fr('#ff4fa3',2);x.globalAlpha=.5+.3*Math.sin(P.t*3);fr('#38e1ff',4);x.globalAlpha=1;
  const big=H2>120;let y=big?Math.round(H2*.08):4;
  if(big){const mw=(L.menu?L.menu.w:20)+14,ls=Math.max(2,Math.min(Math.floor((w-2*mw)/axTW('PINBALL',1)),Math.floor(H2*.18/7)));y=Math.max(y,(L.menu?L.menu.y+L.menu.h/2:12)-Math.round(7*ls/2));axCText(x,'PINBALL',w/2,y,'#ff4fa3',ls,'#05040e','#ffe14f');
   // éclairs et rayons autour du logo
   for(let i=0;i<6;i++){const a=-Math.PI*.9+i*Math.PI*.16,cx=w/2,cy=y+7*ls/2;x.globalAlpha=.25;R(x,cx+Math.cos(a)*(axTW('PINBALL',ls)/2+8),cy+Math.sin(a)*12,3,3,'#38e1ff');x.globalAlpha=1}
   y+=7*ls+Math.round(H2*.06)}
  // afficheur à points (DMD)
  const sv=fmt(P.score),dh=Math.max(26,H2-y-(H2>120?52:36)),dw=w-24,dx=12;R(x,dx-2,y-2,dw+4,dh+4,'#05040e');R(x,dx,y,dw,dh,'#1a0a06');
  for(let yy=y+1;yy<y+dh;yy+=2)for(let xx=dx+1;xx<dx+dw;xx+=2)R(x,xx,yy,1,1,'rgba(255,120,30,.08)');
  const ds=Math.max(2,Math.min(6,Math.floor((dh-14)/7),Math.floor((dw-12)/Math.max(1,axTW(sv,1)))));axText(x,'SCORE',dx+4,y+3,'rgba(255,154,31,.7)');axCText(x,sv,w/2,y+Math.round((dh-7*ds)/2)+4,'#ff9a1f',ds,null,'#ffd166');
  y+=dh+Math.max(6,Math.round(H2*.04));
  const cols=[['BEST',fmt(best),'#38e1ff'],['BALL',String(Math.max(0,P.balls)),'#ff4fa3'],['MULTIPLIER','X'+P.mult,'#7cff6b']],cw=w/3,vs=big&&H2-y>34?2:1;
  cols.forEach(([l,v,c],i)=>{const cx=cw*i+cw/2;axCText(x,i==2&&axTW(l)>cw-4?'MULT':l,cx,y,'#b9b4e0');axCText(x,v,cx,y+10,c,vs,'#05040e')});
  for(let i=0;i<3;i++){const on=i<P.balls;D(x,w-12-i*11,12,4,on?'#c9cedd':'#2a2550');if(on)R(x,w-14-i*11,10,1,1,'#ffffff')}}
 else{const sc=Math.max(1,Math.min(3,Math.floor(L.side/60)));const col=(x0,list)=>{let y=8;list.forEach(([l,v,c])=>{axText(x,l,x0,y,'#8f97c0',1);y+=10;axText(x,v,x0,y,c,sc,'#05040e');y+=7*sc+10})};
  col(10,items.slice(0,2));col(L.tx+L.tw+10,items.slice(2))}}
function pDraw(x,w,h){if(!P.L||P.W!=w||P.H!=h)pLayout(w,h);x.imageSmoothingEnabled=false;if(!P.bg)P.bg=pBg();if(!P.ov)P.ov=pOverlay();x.drawImage(P.bg,0,0);const k=P.L.k;
 // éléments lumineux
 TB.C.filter(c=>c.type=='bumper').forEach(c=>{const f=P.flash.bump[c.id],cx=X(c.x),cy=Y(c.y),r=c.r*k;if(f>0){x.globalAlpha=f*.6;D(x,cx,cy,r*1.6,'#ff4fa3');x.globalAlpha=1}D(x,cx,cy+2,r+1,'#05040e');D(x,cx,cy,r+1,'#0a0618');D(x,cx,cy,r,'#ffffff');D(x,cx,cy,r*.82,f>0?'#ffd0ea':'#ff4fa3');D(x,cx,cy,r*.55,P.lit.bump[c.id]?'#ffe14f':'#c4134f');D(x,cx-r*.2,cy-r*.25,r*.22,'#ffffff')});
 TB.S.forEach(s=>{if(s.type=='stand'){const on=P.lit.stand[s.id],f=P.flash.stand[s.id];LnL(x,s.a,s.b,'#0a0618',Math.max(3,Math.round(k*3.2)));LnL(x,s.a,s.b,f>0?'#ffffff':on?'#7cff6b':'#2a6a3a',Math.max(2,Math.round(k*2.4)))}
  if(s.type=='drop'){const down=P.lit.drop[s.id];if(!down){LnL(x,s.a,s.b,'#0a0618',Math.max(3,Math.round(k*3.4)));LnL(x,s.a,s.b,'#ff9a1f',Math.max(2,Math.round(k*2.6)))}else LnL(x,s.a,s.b,'#3a2a20',1)}
  if(s.type=='sling'&&P.flash.sling[s.side]>0){x.globalAlpha=P.flash.sling[s.side];LnL(x,s.a,s.b,'#ffe14f',Math.max(2,Math.round(k*2.4)));x.globalAlpha=1}});
 LANES.forEach((lx,i)=>{D(x,X(lx),Y(40),Math.max(2,2.6*k),'#0a0618');D(x,X(lx),Y(40),Math.max(1,2*k),P.lit.lane[i]?'#ffd166':'#4a3a20')});
 for(let i=0;i<5;i++){const on=i<P.mult;D(x,X(80+i*6),Y(300),Math.max(1,1.6*k),on?'#7cff6b':'#1a3a24')}
 // boule sous la rampe, palettes, rampe, boule sur la rampe
 const b=P.ball;if(b&&b.st!='ramp'&&P.phase!='intro'&&!(P.phase=='over'))pDrawBall(x,b,false);
 pDrawFlip(x,0);pDrawFlip(x,1);x.drawImage(P.ov,0,0);if(b&&b.st=='ramp')pDrawBall(x,b,true);
 P.parts.forEach(q=>{x.globalAlpha=Math.min(1,q.l*3);R(x,X(q.x),Y(q.y),Math.max(1,k),Math.max(1,k),q.c)});x.globalAlpha=1;
 P.pops.forEach(p=>{x.globalAlpha=Math.min(1,(.9-p.T)*3);axCText(x,p.t,X(p.x),Y(p.y)-p.T*18,p.c,1,'#05040e');x.globalAlpha=1});
 // interface : scores, boutons ronds, lanceur
 pHud(x);pButton(x,P.L.bl,'#ff3f7a','#a01a4a','#ffb0cc',P.ctrl.l,'GAUCHE',-1);pButton(x,P.L.br,'#2fb8ff','#1468c4','#b0e4ff',P.ctrl.r,'DROITE',1);pPlunger(x);
 if(P.msg&&P.phase!='intro'){const m=P.msg;x.globalAlpha=Math.min(1,(1.6-m.T)*3);const sc=Math.max(1,Math.min(2,Math.floor((P.L.tw-8)/axTW(m.t,1))));axCText(x,m.t,X(92),Y(232)-m.T*6,m.c,sc,'#05040e');x.globalAlpha=1}
 pMenuBtn(x);if(P.paused)pPause(x);if(P.phase=='intro')pIntro(x);if(P.phase=='over')pOver(x)}
function pMenuBtn(x){const b=P.L.menu;if(!b||P.phase=='intro'||P.phase=='over')return;R(x,b.x,b.y+2,b.w,b.h,'#05040e');R(x,b.x,b.y,b.w,b.h,P.paused?'#ffe14f':'#2a2160');R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.35)');const c=P.paused?'#1a0c20':'#ffffff';
 for(let i=0;i<3;i++)R(x,b.x+b.w*.25,b.y+b.h*(.27+i*.2),b.w*.5,Math.max(1,b.h*.11),c)}
function pPause(x){const a=pPanel(x),cx=a.x+a.w/2;let y=a.y+14;const ts=Math.max(1,Math.min(3,Math.floor((a.w-8)/axTW('PAUSE',1))));axCText(x,'PAUSE',cx,y,'#ffffff',ts,'#05040e');y+=7*ts+16;
 const bw=Math.min(a.w-12,100),bh=16;P.pauseBtns=[{x:Math.round(cx-bw/2),y,w:bw,h:bh},{x:Math.round(cx-bw/2),y:y+bh+8,w:bw,h:bh}];pBtnRect(x,P.pauseBtns[0],'REPRENDRE','#2f7bff','#1a4ac0',P.psel==0);pBtnRect(x,P.pauseBtns[1],'RETOUR ARCADE','#9a6bff','#5a35b0',P.psel==1)}
function pPanel(x){const L=P.L,a={x:L.tx+4,y:L.ty+L.th*.12,w:L.tw-8,h:L.th*.62};R(x,a.x-2,a.y-2,a.w+4,a.h+4,'#38e1ff');R(x,a.x,a.y,a.w,a.h,'rgba(8,6,30,.93)');return a}
function pBtnRect(x,b,label,col,dk,sel){R(x,b.x,b.y+2,b.w,b.h,dk);R(x,b.x,b.y,b.w,b.h,col);R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.45)');if(sel){x.globalAlpha=.6+.4*Math.sin(P.t*8);R(x,b.x-2,b.y-2,b.w+4,1,'#fff');R(x,b.x-2,b.y+b.h+3,b.w+4,1,'#fff');R(x,b.x-2,b.y-2,1,b.h+6,'#fff');R(x,b.x+b.w+1,b.y-2,1,b.h+6,'#fff');x.globalAlpha=1}axCText(x,label,b.x+b.w/2,b.y+Math.round((b.h-7)/2),'#1a0c20',1)}
function pIntro(x){const a=pPanel(x),cx=a.x+a.w/2,ts=Math.max(1,Math.min(3,Math.floor((a.w-8)/axTW('PINBALL',1))));let y=a.y+8;
 axCText(x,'PINBALL',cx,y,'#ff4fa3',ts,'#05040e','#ffe14f');y+=7*ts+10;
 const lines=[['BOUTON GAUCHE :','#ff7aa8'],['PALETTE GAUCHE','#ffffff'],['BOUTON DROIT :','#7ad0ff'],['PALETTE DROITE','#ffffff'],['LANCER : ENVOIE','#ffe14f'],['LA BOULE','#ffffff'],['3 BOULES','#8f97c0']];
 const fits=lines.every(([l])=>axTW(l)<=a.w-6),short=[['< GAUCHE','#ff7aa8'],['DROITE >','#7ad0ff'],['LANCER','#ffe14f'],['3 BOULES','#8f97c0']];(fits?lines:short).forEach(([l,c])=>{if(axTW(l)<=a.w-4){axCText(x,l,cx,y,c);y+=10}});
 const bw=Math.min(a.w-12,90),bh=16;P.startBtn={x:Math.round(cx-bw/2),y:Math.round(Math.min(y+6,a.y+a.h-bh-6)),w:bw,h:bh};pBtnRect(x,P.startBtn,'START','#ffd23f','#b8860b',true);
 // les deux boutons ronds clignotent pour montrer où appuyer
 const L=P.L;for(const b of[L.bl,L.br]){x.globalAlpha=.5+.5*Math.sin(P.t*6);const n=Math.round(b.r*7);for(let i=0;i<n;i++){const an=i/n*Math.PI*2;R(x,b.x+Math.cos(an)*(b.r+8),b.y+Math.sin(an)*(b.r+8),2,2,'#ffe14f')}x.globalAlpha=1}}
function pOver(x){const a=pPanel(x),cx=a.x+a.w/2,o=P.over,fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');let y=a.y+10;const ts=Math.max(1,Math.min(2,Math.floor((a.w-8)/axTW('GAME OVER',1))));
 axCText(x,'GAME OVER',cx,y,'#ff4f6a',ts,'#05040e');y+=7*ts+12;axCText(x,'SCORE FINAL',cx,y,'#8f97c0');y+=10;const ss=Math.max(1,Math.min(3,Math.floor((a.w-8)/axTW(fmt(P.score),1))));axCText(x,fmt(P.score),cx,y,'#ffe14f',ss,'#05040e');y+=7*ss+8;
 axCText(x,o.rec?'NOUVEAU RECORD !':'BEST '+fmt(P.api?P.api.best():0),cx,y,o.rec?'#7cff6b':'#38e1ff');y+=16;
 const bw=Math.min(a.w-12,100),bh=16;P.overBtns=[{x:Math.round(cx-bw/2),y,w:bw,h:bh},{x:Math.round(cx-bw/2),y:y+bh+8,w:bw,h:bh}];
 if(o.t>.8){pBtnRect(x,P.overBtns[0],'REJOUER','#2f7bff','#1a4ac0',P.sel==0);pBtnRect(x,P.overBtns[1],'RETOUR ARCADE','#9a6bff','#5a35b0',P.sel==1)}}
// ---------- toucher : chaque doigt est suivi séparément (appuis simultanés, maintien, relâchement) ----------
const inR=(b,x,y)=>b&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function pZone(sx,sy){const L=P.L;if(!L)return null;const pl=L.pl;if(inR({x:pl.x-6,y:pl.y-6,w:pl.w+12,h:pl.h+18},sx,sy))return'P';
 // zones tactiles larges : tout le bouton rond et, plus largement, la moitié basse de chaque marge latérale
 if(Math.hypot(sx-L.bl.x,sy-L.bl.y)<L.bl.r*1.5||(sx<L.tx&&sy>L.ty+L.th*.45))return'L';if(Math.hypot(sx-L.br.x,sy-L.br.y)<L.br.r*1.5||(sx>L.tx+L.tw&&sy>L.ty+L.th*.45))return'R';return null}
function pPointer(type,sx,sy,id){if(id==null)id=0;pAudio();
 if(type=='down'){if(P.paused){const k=(P.pauseBtns||[]).findIndex(b=>inR(b,sx,sy));if(k==0)P.paused=false;else if(k==1){P.paused=false;P.api&&P.api.exit()}return}
  if(P.L&&P.L.menu&&P.phase!='intro'&&P.phase!='over'&&inR({x:P.L.menu.x-4,y:P.L.menu.y-4,w:P.L.menu.w+8,h:P.L.menu.h+8},sx,sy)){P.paused=true;P.psel=0;P.touches.clear();return}
  if(P.phase=='intro'&&P.startBtn&&inR(P.startBtn,sx,sy)){pNewGame();return}
  if(P.phase=='over'&&P.over&&P.over.t>.8&&P.overBtns){const k=P.overBtns.findIndex(b=>inR(b,sx,sy));if(k>=0){pOverChoice(k);return}}
  const z=pZone(sx,sy);if(z)P.touches.set(id,z);return}
 if(type=='up'){P.touches.delete(id);return}
 if(type=='move'&&P.touches.has(id)){const z=pZone(sx,sy);if(z&&z!='P')P.touches.set(id,z)}}
// ---------- cycle de vie ----------
const Pinball={
 start(api){P.api=api;P.paused=false;pMus(.8);P.phase='intro';P.L=null;P.touches.clear();P.okN=null;P.ball=null;P.score=0;P.balls=3;P.mult=1;P.pops=[];P.parts=[];P.msg=null;P.over=null;P.fl.forEach((f,i)=>{f.a=FL[i].rest;f.w=0;f.on=false});pAudio()},
 update:pUpdate,draw:pDraw,pointer:pPointer,
 stop(){P.api=null;P.paused=false;pMus(null);P.touches.clear();P.ctrl={l:false,r:false,p:false};P.phase='intro';P.ball=null;P.pops=[];P.parts=[];P.bg=null;P.ov=null;P.L=null;},
 _state:P,_table:TB,_flip:FL};
ARC.register('pinball',Pinball);
})();
