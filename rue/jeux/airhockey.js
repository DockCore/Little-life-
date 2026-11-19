// ===== MINI-JEU AIR HOCKEY (module de la borne d'arcade) =====
// S'enregistre auprès de la borne existante : ARC.register('hockey', module). Rien d'autre n'est modifié.
// Vue du dessus. Joueur en bas (ou à gauche si l'écran de la borne est en paysage : la table pivote pour
// remplir tout l'écran), ordinateur en haut. Premier à 7 buts. Physique à pas fixes, IA sans triche.
(function(){
const AH_WIN=7;
const AH_LV={facile:{nom:'FACILE',v:.95,react:.32,err:1.1,predict:false,aggr:.35,miss:.2,shot:1},
 normal:{nom:'NORMAL',v:1.45,react:.16,err:.6,predict:true,aggr:.6,miss:.07,shot:1.15},
 difficile:{nom:'DIFFICILE',v:2.05,react:.06,err:.15,predict:true,aggr:.9,miss:0,shot:1.3}};
const AH_LVK=['facile','normal','difficile'];
// ---------- sons courts (Web Audio) ----------
let AHA=null;function ahAudio(){try{if(!AHA)AHA=new (window.AudioContext||window.webkitAudioContext)();if(AHA.state=='suspended')AHA.resume()}catch(e){AHA=null}return AHA}
let AH_last=0;function ahTone(f,d,type='square',vol=.06,slide=0,delay=0){const a=AHA;if(!a||H.mute)return;if(!delay){if(a.currentTime-AH_last<.035)return;AH_last=a.currentTime}const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
const AHS={hit:v=>ahTone(320+Math.min(1,v)*420,.06,'square',.05+.04*Math.min(1,v)),wall:()=>ahTone(180,.05,'triangle',.06),
 goal:(me)=>{const n=me?[523,659,784,1046]:[392,330,262];n.forEach((f,i)=>ahTone(f,.14,'square',.06,0,i*.1))},start:()=>[660,660,990].forEach((f,i)=>ahTone(f,i<2?.08:.2,'square',.05,0,i*.35)),
 win:()=>[523,659,784,1046,1318].forEach((f,i)=>ahTone(f,.16,'square',.06,0,i*.12)),lose:()=>[392,349,311,262].forEach((f,i)=>ahTone(f,.22,'triangle',.07,0,i*.18)),tick:()=>ahTone(880,.04,'square',.03)};
// ---------- état ----------
const H={api:null,lv:'normal',phase:'choix',ch:1,W:0,H:0,rot:false,T:null,p:null,me:null,ai:null,sc:[0,0],t:0,pause:false,parts:[],rings:[],msg:null,end:null,pt:null,keysOn:false,aPrev:0,trail:[],shake:0,flash:null,aiT:0,aiTarget:null,stuck:0};
// géométrie de la table (repère « portrait » : largeur TW, hauteur TH ; le joueur est en bas)
function ahGeom(w,h){H.W=w;H.H=h;H.rot=w>h*1.12;const TW=H.rot?h:w,TH=H.rot?w:h,b=Math.max(4,Math.round(Math.min(TW,TH)*.035)),pw=TW-2*b;
 H.T={TW,TH,b,x0:b,x1:TW-b,y0:b,y1:TH-b,cx:TW/2,cy:TH/2,pw,gw:Math.round(pw*.38),rm:Math.max(9,pw*.078),rp:Math.max(6,pw*.047)};H.T.max=TH*2.1;H.T.mv=TH*3.6}
// conversions écran <-> table
function ahToTable(sx,sy){const T=H.T;return H.rot?{x:sy,y:T.TH-sx}:{x:sx,y:sy}}
function ahReset(toward){const T=H.T;H.p={x:T.cx,y:T.cy,vx:0,vy:0,spin:0};if(toward){H.p.serve=toward}}
function ahNewMatch(){const T=H.T;H.sc=[0,0];H.me={x:T.cx,y:T.y1-T.rm*2.2,vx:0,vy:0,tx:T.cx,ty:T.y1-T.rm*2.2};H.ai={x:T.cx,y:T.y0+T.rm*2.2,vx:0,vy:0};H.aiT=0;H.aiTarget=null;
 ahReset();H.serve=Math.random()<.5?0:1;H.parts=[];H.rings=[];H.trail=[];H.end=null;H.pause=false;H.phase='compte';H.cd=3.2;H.lastCd=4;H.stats={hits:0,maxV:0,t:0};ahAudio();AHS.start()}
// ---------- physique ----------
function ahClampMallet(m,top){const T=H.T;m.x=Math.max(T.x0+T.rm,Math.min(T.x1-T.rm,m.x));if(top)m.y=Math.max(T.y0+T.rm,Math.min(T.cy-T.rm,m.y));else m.y=Math.max(T.cy+T.rm,Math.min(T.y1-T.rm,m.y))}
// déplace un maillet vers une cible avec une vitesse maximale (jamais de téléportation)
function ahMoveMallet(m,tx,ty,vmax,dt,top){const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy),step=Math.min(d,vmax*dt),ox=m.x,oy=m.y;if(d>1e-6){m.x+=dx/d*step;m.y+=dy/d*step}ahClampMallet(m,top);m.vx=(m.x-ox)/dt;m.vy=(m.y-oy)/dt}
function ahCollide(m,dt){const T=H.T,p=H.p,dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),R=T.rm+T.rp;if(d>=R)return false;
 const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:(m===H.me?-1:1);p.x=m.x+nx*R;p.y=m.y+ny*R;
 const rvx=p.vx-m.vx,rvy=p.vy-m.vy,vn=rvx*nx+rvy*ny;if(vn<0){const e=.92;p.vx-=(1+e)*vn*nx;p.vy-=(1+e)*vn*ny;
  // le palet ressort toujours un peu plus vite que le maillet qui le frappe
  const mvn=m.vx*nx+m.vy*ny,out=p.vx*nx+p.vy*ny;if(out<mvn+T.TH*.25){const add=mvn+T.TH*.25-out;p.vx+=add*nx;p.vy+=add*ny}
  const sp=Math.hypot(p.vx,p.vy),k=Math.min(1,sp/T.max);H.stats.hits++;AHS.hit(k);ahFx(p.x-nx*T.rp,p.y-ny*T.rp,m===H.me?'#38e1ff':'#ff4fa3',4+Math.round(8*k),k);H.rings.push({x:m.x,y:m.y,r:T.rm,a:.7,c:m===H.me?'#38e1ff':'#ff4fa3'});return true}
 return false}
function ahWalls(){const T=H.T,p=H.p,r=T.rp;let hit=false;const inGoalX=Math.abs(p.x-T.cx)<T.gw/2-r*.2;
 if(p.x-r<T.x0){p.x=T.x0+r;p.vx=Math.abs(p.vx)*.88;hit=true}if(p.x+r>T.x1){p.x=T.x1-r;p.vx=-Math.abs(p.vx)*.88;hit=true}
 if(!inGoalX){if(p.y-r<T.y0){p.y=T.y0+r;p.vy=Math.abs(p.vy)*.88;hit=true}if(p.y+r>T.y1){p.y=T.y1-r;p.vy=-Math.abs(p.vy)*.88;hit=true}}
 else{// poteaux des cages
  for(const gy of[T.y0,T.y1])for(const s of[-1,1]){const px=T.cx+s*T.gw/2,dx=p.x-px,dy=p.y-gy,d=Math.hypot(dx,dy);if(d<r&&d>1e-6){const nx=dx/d,ny=dy/d;p.x=px+nx*r;p.y=gy+ny*r;const vn=p.vx*nx+p.vy*ny;if(vn<0){p.vx-=1.8*vn*nx;p.vy-=1.8*vn*ny;hit=true}}}}
 if(hit){const sp=Math.hypot(p.vx,p.vy);if(sp>T.TH*.15){AHS.wall();ahFx(p.x,p.y,'#ffffff',3,.3)}}
 // but : le palet entre entièrement dans une cage
 if(p.y<T.y0&&inGoalX)return 0;if(p.y>T.y1&&inGoalX)return 1;return -1}
function ahStep(dt){const T=H.T,p=H.p;
 // joueur : le maillet suit le doigt / la souris (ou le joystick et les flèches)
 ahMoveMallet(H.me,H.me.tx,H.me.ty,T.mv,dt,false);ahAI(dt);
 const sp=Math.hypot(p.vx,p.vy),fr=Math.exp(-.32*dt);p.vx*=fr;p.vy*=fr;
 if(sp>T.max){p.vx*=T.max/sp;p.vy*=T.max/sp}
 // un palet arrêté au bord d'une cage finit par y tomber (comme dans la fente d'une vraie table)
 if(Math.abs(p.x-T.cx)<T.gw/2-T.rp*.2){if(p.y-T.rp<T.y0)p.vy-=T.TH*2.5*dt;else if(p.y+T.rp>T.y1)p.vy+=T.TH*2.5*dt}
 p.x+=p.vx*dt;p.y+=p.vy*dt;ahCollide(H.me,dt);ahCollide(H.ai,dt);const g=ahWalls();
 // un palet coincé entre un maillet et la bordure ne traverse jamais : on repousse le maillet
 for(const[m,top]of[[H.me,false],[H.ai,true]]){const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),R=T.rm+T.rp;if(d<R-.5&&d>1e-6){m.x=p.x-dx/d*R;m.y=p.y-dy/d*R;ahClampMallet(m,top)}}
 {const v=Math.hypot(p.vx,p.vy);if(v>T.max){p.vx*=T.max/v;p.vy*=T.max/v}}
 H.stats.maxV=Math.max(H.stats.maxV,Math.hypot(p.vx,p.vy)/T.TH);return g}
// ---------- intelligence artificielle ----------
function ahPredictX(yLine){const T=H.T,p=H.p;if(p.vy>=-1)return null;const t=(yLine-p.y)/p.vy;if(t<0||t>3)return null;let x=p.x+p.vx*t;const L=T.x0+T.rp,R=T.x1-T.rp,w=R-L;let u=(x-L)%(2*w);if(u<0)u+=2*w;return L+(u>w?2*w-u:u)}
function ahAI(dt){const T=H.T,p=H.p,a=H.ai,P=AH_LV[H.lv],vmax=T.TH*P.v;H.aiT-=dt;
 // réagit vite quand le palet change de direction vers sa cage (après le temps de réaction du niveau)
 const toward=p.vy<0;if(toward&&!H.aiToward)H.aiT=Math.min(H.aiT,P.react*.5);H.aiToward=toward;
 if(H.aiT<=0||!H.aiTarget){H.aiT=P.react*(.7+Math.random()*.6);const def=T.y0+T.rm*1.6,inMyHalf=p.y<T.cy+T.rp,slow=Math.hypot(p.vx,p.vy)<T.TH*.55,err=(Math.random()*2-1)*P.err*T.rm;let tx,ty;
  const near=Math.hypot(p.x-a.x,p.y-a.y)<T.rm*4;H.aiShot=false;
  if(inMyHalf&&(slow||p.vy>0||near)&&Math.random()>P.miss){// attaque : se placer derrière le palet puis frapper vers la cage du joueur
   const side=H.me.x>T.cx?-1:1,gx=T.cx+side*T.gw*(.15+Math.random()*.25)*(Math.random()<P.aggr?1:-1),gy=T.y1,RR=(T.rm+T.rp)*.9,ok=(b)=>b.x>=T.x0+T.rm&&b.x<=T.x1-T.rm&&b.y>=T.y0+T.rm&&b.y<=T.cy-T.rm;
   let dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy)||1,behind={x:p.x-dx/d*RR,y:p.y-dy/d*RR};
   // palet collé à une bordure : on ne peut pas passer derrière, on le dégage vers le centre de la table
   if(!ok(behind)){dx=T.cx-p.x;dy=(T.cy+T.TH*.2)-p.y;d=Math.hypot(dx,dy)||1;behind={x:p.x-dx/d*RR,y:p.y-dy/d*RR};if(!ok(behind)){const sg=p.x>T.cx?1:-1;dx=-sg;dy=.35;d=Math.hypot(dx,dy);behind={x:p.x+sg*RR,y:p.y-.35*RR}}}
   const ready=Math.hypot(a.x-behind.x,a.y-behind.y)<T.rm*.9||a.y<p.y-T.rm*.3;const strike=ready&&Math.random()<P.aggr+.3;H.aiShot=strike;tx=strike?p.x+dx/d*T.rm*1.5:behind.x;ty=strike?p.y+dy/d*T.rm*1.5:behind.y}
  else if(p.vy<0&&P.predict){// défense avec anticipation des rebonds
   const px=ahPredictX(def);tx=(px==null?p.x:px)*.85+T.cx*.15;ty=def}
  else{// défense simple : entre le palet et le centre de sa cage
   tx=T.cx+(p.x-T.cx)*.6;ty=def+(inMyHalf?T.rm*.4:0)}
  H.aiTarget={x:tx+err,y:ty}}
 const touching=Math.hypot(p.x-a.x,p.y-a.y)<T.rm+T.rp+2;H.aiPin=touching?(H.aiPin||0)+dt:0;
 if(H.aiPin>.6){const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy)||1;H.aiTarget={x:a.x+dx/d*T.rm*2,y:a.y+dy/d*T.rm*2+(a.y<T.y0+T.rm*1.5?T.rm*2:0)};H.aiT=.35;if(H.aiPin>1.1)H.aiPin=0}
 ahMoveMallet(a,H.aiTarget.x,H.aiTarget.y,vmax*(H.aiShot?P.shot:1),dt,true)}
// ---------- effets ----------
function ahFx(x,y,c,n,k){for(let i=0;i<n;i++){const an=Math.random()*Math.PI*2,v=(30+Math.random()*90)*(0.5+k);H.parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.25+Math.random()*.25,c})}}
function ahGoal(who){const T=H.T;H.sc[who]++;const mine=who==0;H.flash={c:mine?'#38e1ff':'#ff4fa3',t:1};H.shake=.35;AHS.goal(mine);
 for(let i=0;i<40;i++){const x=T.cx+(Math.random()-.5)*T.gw,y=mine?T.y0:T.y1,an=(mine?1:-1)*Math.PI/2+(Math.random()-.5)*2;H.parts.push({x,y,vx:Math.cos(an)*(60+Math.random()*160),vy:Math.sin(an)*(60+Math.random()*160),l:.5+Math.random()*.5,c:i%2?'#ffe14f':(mine?'#38e1ff':'#ff4fa3')})}
 H.msg={t:mine?'BUT !':'BUT ADVERSE',c:mine?'#38e1ff':'#ff4fa3',T:0};
 if(H.sc[who]>=AH_WIN){H.phase='fin';const win=mine;H.end={win,t:0,sel:0};H.api&&ahSaveResult(win);setTimeout(()=>{if(H.end)(win?AHS.win:AHS.lose)()},400);return}
 H.phase='but';H.butT=1.4;H.p.vx=H.p.vy=0;H.serveTo=mine?1:0}
function ahSaveResult(win){const d=H.api.data();d.wins=d.wins||{};d.games=(d.games||0)+1;if(win){d.wins[H.lv]=(d.wins[H.lv]||0)+1}H.lastScore=H.sc[0]*100-H.sc[1]*10+(win?(H.lv=='difficile'?300:H.lv=='normal'?150:50):0);H.rec=H.api.record(Math.max(0,H.lastScore));H.api.save()}
// ---------- mise à jour ----------
function ahUpdate(dt,inp){if(!H.T)return;dt=Math.min(dt,.05);H.t+=dt;// appui sur OK (bouton rouge de la borne, Entrée, Espace) : compteur d'appuis fourni par la borne, aucun appui n'est perdu
 const n=inp&&inp.okN||0,aEdge=H.okN!=null&&n>H.okN;H.okN=n;
 // joystick / flèches : déplacent la sélection dans les écrans, ou le maillet en jeu
 const dir=inp?{x:(inp.right?1:0)-(inp.left?1:0),y:(inp.down?1:0)-(inp.up?1:0)}:{x:0,y:0};
 // directions poussées brièvement (file fournie par la borne) : pour naviguer dans les écrans du jeu
 const q=inp&&inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[],qd=q.length?q[q.length-1]:null,qv=qd?{x:qd=='right'?1:qd=='left'?-1:0,y:qd=='down'?1:qd=='up'?-1:0}:null;
 if(H.phase=='choix'){for(const d of q){const v=d=='down'||d=='right'?1:-1;H.ch=Math.max(0,Math.min(2,H.ch+v));ahAudio()&&AHS.tick()}if(aEdge){H.lv=AH_LVK[H.ch];ahNewMatch()}return}
 if(H.phase=='fin'){H.end.t+=dt;if(qv)H.end.sel=(qv.x||qv.y)>0?1:0;if(aEdge&&H.end.t>.6)ahEndChoice(H.end.sel);ahTickFx(dt);return}
 if(H.pause){if(qv)H.pauseSel=(qv.x||qv.y)>0?1:0;if(aEdge){if(H.pauseSel==1){H.pause=false;H.api&&H.api.exit()}else H.pause=false}return}
 if(aEdge){H.pause=true;H.pauseSel=0;return}
 const T=H.T;if(dir.x||dir.y){H.me.tx+=dir.x*T.TH*1.6*dt*(H.rot?0:1)+(H.rot?-dir.x:0)*0;H.useKeys=1;
  // en paysage la table est tournée : gauche/droite de l'écran = recul/avance du maillet
  if(H.rot){H.me.tx+=dir.y*T.TH*1.6*dt;H.me.ty+=-dir.x*T.TH*1.6*dt}else{H.me.ty+=dir.y*T.TH*1.6*dt}
  H.me.tx=Math.max(T.x0+T.rm,Math.min(T.x1-T.rm,H.me.tx));H.me.ty=Math.max(T.cy+T.rm,Math.min(T.y1-T.rm,H.me.ty))}
 if(H.phase=='compte'){H.cd-=dt;const c=Math.ceil(H.cd);if(c<H.lastCd&&c>0){H.lastCd=c}if(H.cd<=0){H.phase='jeu';H.msg={t:'GO !',c:'#ffe14f',T:0}}ahMoveMallet(H.me,H.me.tx,H.me.ty,T.mv,dt,false);ahAIIdle(dt);ahTickFx(dt);return}
 if(H.phase=='but'){H.butT-=dt;ahMoveMallet(H.me,H.me.tx,H.me.ty,T.mv,dt,false);ahAIIdle(dt);ahTickFx(dt);
  if(H.butT<=0){ahReset();H.phase='compte';H.cd=1.2;H.lastCd=2;H.serve=H.serveTo}return}
 if(H.phase=='jeu'){H.stats.t+=dt;if(H.serve!=null){const p=H.p;p.vy=(H.serve==0?1:-1)*T.TH*.18;p.vx=(Math.random()-.5)*T.TH*.08;H.serve=null}
  // pas fixes : jamais plus d'un demi-rayon de palet parcouru par sous-pas (pas de traversée)
  const p=H.p,mv=Math.max(Math.hypot(p.vx,p.vy),T.mv)*dt,n=Math.min(40,Math.max(1,Math.ceil(mv/(T.rp*.5)))),h=dt/n;
  for(let i=0;i<n;i++){const g=ahStep(h);if(g>=0){ahGoal(g);break}}
  H.trail.push({x:p.x,y:p.y});if(H.trail.length>7)H.trail.shift()}
 ahTickFx(dt)}
function ahAIIdle(dt){const T=H.T;ahMoveMallet(H.ai,T.cx,T.y0+T.rm*2.2,T.TH*AH_LV[H.lv].v*.6,dt,true)}
function ahTickFx(dt){H.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.92;q.vy*=.92;q.l-=dt});H.parts=H.parts.filter(q=>q.l>0);H.rings.forEach(r=>{r.r+=60*dt;r.a-=dt*2.2});H.rings=H.rings.filter(r=>r.a>0);
 if(H.flash){H.flash.t-=dt*1.6;if(H.flash.t<=0)H.flash=null}if(H.shake>0)H.shake=Math.max(0,H.shake-dt);if(H.msg){H.msg.T+=dt;if(H.msg.T>1.3)H.msg=null}}
function ahEndChoice(k){if(k==0){ahNewMatch()}else{H.api&&H.api.exit()}}
// ---------- rendu ----------
const R=(x,X,Y,W,Hh,c)=>{x.fillStyle=c;x.fillRect(Math.round(X),Math.round(Y),Math.round(W),Math.round(Hh))};
function D(x,cx,cy,r,c){x.fillStyle=c;const Rr=Math.ceil(r);for(let j=-Rr;j<=Rr;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||Math.abs(j)<r)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function Ring(x,cx,cy,r,c,th=1){x.fillStyle=c;const n=Math.max(16,Math.round(r*6));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;x.fillRect(Math.round(cx+Math.cos(a)*r-th/2),Math.round(cy+Math.sin(a)*r-th/2),th,th)}}
let AH_BG=null,AH_BGK='';
function ahTableBg(){const T=H.T,k=T.TW+'x'+T.TH;if(AH_BG&&AH_BGK==k)return AH_BG;const c=document.createElement('canvas');c.width=T.TW;c.height=T.TH;const x=c.getContext('2d');
 // bordures épaisses
 R(x,0,0,T.TW,T.TH,'#141038');R(x,0,0,T.TW,T.cy,'#1e1450');R(x,0,T.cy,T.TW,T.TH-T.cy,'#12204a');
 // surface lisse avec trous d'air
 const g=x.createLinearGradient(0,T.y0,0,T.y1);g.addColorStop(0,'#dff3ff');g.addColorStop(.5,'#eef9ff');g.addColorStop(1,'#dff3ff');x.fillStyle=g;x.fillRect(T.x0,T.y0,T.pw,T.y1-T.y0);
 const st=Math.max(6,Math.round(T.pw/18));for(let y=T.y0+st/2;y<T.y1;y+=st)for(let X=T.x0+st/2;X<T.x1;X+=st)R(x,X,y,1,1,'#b9d8ea');
 // marquages : ligne centrale, cercle central, zones de but
 R(x,T.x0,T.cy-1,T.pw,2,'#ff4f6a');Ring(x,T.cx,T.cy,T.pw*.18,'#ff4f6a',2);D(x,T.cx,T.cy,3,'#ff4f6a');
 R(x,T.x0,T.y0+(T.y1-T.y0)*.25,T.pw,1,'#7fb6e8');R(x,T.x0,T.y0+(T.y1-T.y0)*.75,T.pw,1,'#7fb6e8');
 for(const[gy,s]of[[T.y0,1],[T.y1,-1]]){const r=T.gw*.62;for(let i=0;i<=40;i++){const a=i/40*Math.PI,X=T.cx+Math.cos(a)*r,Y=gy+s*Math.sin(a)*r;R(x,X-1,Y-1,2,2,'#4f86e0')}}
 // reflet discret
 x.globalAlpha=.25;R(x,T.x0,T.y0,T.pw*.12,T.y1-T.y0,'#ffffff');x.globalAlpha=1;
 // liserés néon et cages
 R(x,T.x0-2,T.y0-2,T.pw+4,2,'#ff4fa3');R(x,T.x0-2,T.y1,T.pw+4,2,'#38e1ff');R(x,T.x0-2,T.y0,2,T.cy-T.y0,'#ff4fa3');R(x,T.x1,T.y0,2,T.cy-T.y0,'#ff4fa3');R(x,T.x0-2,T.cy,2,T.y1-T.cy,'#38e1ff');R(x,T.x1,T.cy,2,T.y1-T.cy,'#38e1ff');
 for(const[gy,c]of[[0,'#ff4fa3'],[T.y1,'#38e1ff']]){R(x,T.cx-T.gw/2,gy,T.gw,T.b,'#05040e');R(x,T.cx-T.gw/2,gy+(gy?0:T.b-1),T.gw,1,c);R(x,T.cx-T.gw/2-2,gy,2,T.b,c);R(x,T.cx+T.gw/2,gy,2,T.b,c)}
 AH_BG=c;AH_BGK=k;return c}
function ahMallet(x,m,c1,c2,c3){const T=H.T,r=T.rm;D(x,m.x+2,m.y+3,r,'rgba(10,20,50,.25)');D(x,m.x,m.y,r+1,'#0a0618');D(x,m.x,m.y,r,c1);D(x,m.x,m.y,r*.78,c2);D(x,m.x,m.y,r*.5,c1);D(x,m.x-r*.08,m.y-r*.12,r*.38,c3);D(x,m.x-r*.2,m.y-r*.25,r*.12,'#ffffff')}
function ahDrawTable(x){const T=H.T,p=H.p;
 if(H.flash){x.globalAlpha=Math.max(0,H.flash.t)*.35;R(x,T.x0,T.y0,T.pw,T.y1-T.y0,H.flash.c);x.globalAlpha=1}
 // traînée et palet
 if(p){H.trail.forEach((q,i)=>{x.globalAlpha=(i+1)/H.trail.length*.14;D(x,q.x,q.y,T.rp*(.35+.5*(i+1)/H.trail.length),'#ff9a1f')});x.globalAlpha=1;
  const sp=Math.hypot(p.vx,p.vy)/T.max;D(x,p.x+2,p.y+3,T.rp,'rgba(10,20,50,.3)');if(sp>.45){x.globalAlpha=(sp-.45)*1.2;D(x,p.x,p.y,T.rp+3,'#ffe14f');x.globalAlpha=1}
  D(x,p.x,p.y,T.rp+1,'#0a0618');D(x,p.x,p.y,T.rp,'#1d1d2b');D(x,p.x,p.y,T.rp*.72,'#ff9a1f');D(x,p.x,p.y,T.rp*.5,'#1d1d2b');D(x,p.x-T.rp*.35,p.y-T.rp*.35,Math.max(1,T.rp*.18),'#8a8aa0')}
 H.rings.forEach(r=>{x.globalAlpha=Math.max(0,r.a);Ring(x,r.x,r.y,r.r,r.c,1);x.globalAlpha=1});
 ahMallet(x,H.ai,'#ff3f7a','#c4134f','#ff9ec0');ahMallet(x,H.me,'#2fb8ff','#1468c4','#a6e4ff');
 H.parts.forEach(q=>{x.globalAlpha=Math.min(1,q.l*3);R(x,q.x-1,q.y-1,2,2,q.c)});x.globalAlpha=1}
// boutons de l'interface (repère écran)
function ahButtons(){const w=H.W,s=Math.max(16,Math.round(Math.min(H.W,H.H)*.085)),m=Math.max(4,Math.round(H.T.b+2));return{menu:{x:w-m-2*s-4,y:m,w:s,h:s},pause:{x:w-m-s,y:m,w:s,h:s}}}
function ahBtn(x,b,draw,on){R(x,b.x,b.y+2,b.w,b.h,'rgba(5,4,14,.5)');R(x,b.x,b.y,b.w,b.h,on?'#ffe14f':'rgba(20,16,56,.78)');R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.35)');draw(b.x,b.y,b.w,b.h,on?'#1a0c20':'#ffffff')}
function ahPanelBtn(x,b,label,col,dark,sel,sc){R(x,b.x,b.y+2,b.w,b.h,dark);R(x,b.x,b.y,b.w,b.h,col);R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.45)');if(sel){x.globalAlpha=.6+.4*Math.sin(H.t*8);const o='#ffffff';R(x,b.x-2,b.y-2,b.w+4,1,o);R(x,b.x-2,b.y+b.h+3,b.w+4,1,o);R(x,b.x-2,b.y-2,1,b.h+6,o);R(x,b.x+b.w+1,b.y-2,1,b.h+6,o);x.globalAlpha=1}
 axCText(x,label,b.x+b.w/2,b.y+Math.round((b.h-7*sc)/2),'#1a0c20',sc)}
function ahScores(x){const T=H.T,W=H.W,Hh=H.H,big=Math.max(2,Math.min(5,Math.floor(Math.min(W,Hh)/44)));
 // chiffres lumineux dans la table, de part et d'autre de la ligne centrale (CPU côté adversaire, TOI côté joueur)
 const sa=String(H.sc[1]),sm=String(H.sc[0]),dw=axTW('0',big),pad=4;let A,M;
 if(!H.rot){const X=T.x0+8;A={x:X,y:T.cy-7*big-10};M={x:X,y:T.cy+10}}else{const Y=Math.round(Hh*.5-7*big/2);A={x:W/2+12,y:Y};M={x:W/2-12-axTW(sm,big),y:Y}}
 for(const[q,str,c,c2,lab]of[[A,sa,'#ff4fa3','#ffd0e4','CPU'],[M,sm,'#2fb8ff','#d0f0ff','TOI']]){const bw=axTW(str,big)+2*pad,bh=7*big+2*pad+10;x.globalAlpha=.5;R(x,q.x-pad,q.y-pad,bw,bh,'#ffffff');x.globalAlpha=.9;
  axText(x,str,q.x+Math.max(1,big/2),q.y+Math.max(1,big/2),'rgba(10,6,32,.35)',big);axText(x,str,q.x,q.y,c,big);axCText(x,lab,q.x-pad+bw/2,q.y+7*big+3,c);x.globalAlpha=1}}
function ahHud(x){const T=H.T,W=H.W,Hh=H.H;
 // niveau de difficulté
 const lv=AH_LV[H.lv].nom;axText(x,lv,T.b+4,Hh-T.b-11,'#7a6ad0');
 // boutons pause et menu
 const B=ahButtons();ahBtn(x,B.pause,(X,Y,w,h,c)=>{R(x,X+w*.3,Y+h*.25,w*.14,h*.5,c);R(x,X+w*.56,Y+h*.25,w*.14,h*.5,c)},H.pause);
 ahBtn(x,B.menu,(X,Y,w,h,c)=>{for(let i=0;i<3;i++)R(x,X+w*.25,Y+h*(.28+i*.2),w*.5,Math.max(1,h*.1),c)},false)}
function ahCenterMsg(x,t,c,sc,yy){const W=H.W;sc=Math.max(1,Math.min(sc,Math.floor((W-12)/axTW(t,1))));const Y=yy!=null?yy:Math.round(H.H/2-7*sc/2);axCText(x,t,W/2,Y,c,sc,'#1a0c20')}
function ahOverlay(x,a){x.globalAlpha=a;R(x,0,0,H.W,H.H,'#0a0620');x.globalAlpha=1}
function ahDraw(x,w,h){if(!H.T||H.W!=w||H.H!=h){ahGeom(w,h);if(H.me){const T=H.T;ahClampMallet(H.me,false);ahClampMallet(H.ai,true)}else{ahNewMatchSoft()}}
 x.imageSmoothingEnabled=false;const T=H.T;
 // table (pivotée si l'écran est en paysage) ; légère secousse lors d'un but
 const sx=H.shake>0?Math.round((Math.random()-.5)*6*H.shake):0,sy=H.shake>0?Math.round((Math.random()-.5)*6*H.shake):0;
 const rotT=()=>{if(H.rot)x.setTransform(0,1,-1,0,T.TH+sx,sy);else x.setTransform(1,0,0,1,sx,sy)};
 x.save();rotT();x.drawImage(ahTableBg(),0,0);x.restore();ahScores(x);x.save();rotT();ahDrawTable(x);x.restore();
 ahHud(x);const big=Math.max(2,Math.min(6,Math.floor(Math.min(w,h)/40)));
 if(H.phase=='choix'){ahOverlay(x,.72);let y=Math.round(h*.16);const ts=Math.max(1,Math.min(big-1,Math.floor((w-16)/axTW('AIR HOCKEY',1))));ahCenterMsg(x,'AIR HOCKEY','#38e1ff',ts,y);y+=7*ts+10;ahCenterMsg(x,'CHOISIS LA DIFFICULTÉ',' #ffffff'.trim(),1,y);y+=18;
  const bw=Math.min(w-40,150),bh=Math.max(18,Math.round(h*.075)),gap=Math.max(8,Math.round(bh*.45));H.choiceBtns=[];
  AH_LVK.forEach((k,i)=>{const b={x:Math.round(w/2-bw/2),y:y+i*(bh+gap),w:bw,h:bh};H.choiceBtns.push(b);ahPanelBtn(x,b,AH_LV[k].nom,['#4fd16b','#ffd23f','#ff4f6a'][i],['#2a8a3a','#b8860b','#a01a2c'][i],H.ch==i,bh>=24?2:1)});
  const d=H.api&&H.api.data(),wins=d&&d.wins?d.wins:{};ahCenterMsg(x,'VICTOIRES : '+AH_LVK.map(k=>(wins[k]||0)).join(' / '),'#8f97c0',1,y+3*(bh+gap)+4);
  ahCenterMsg(x,'PREMIER À '+AH_WIN+' BUTS','#ffe14f',1,y+3*(bh+gap)+16);return}
 if(H.phase=='compte'){const c=Math.ceil(H.cd);if(c>0&&c<=3){ahOverlay(x,.25);const k=1-(H.cd%1);ahCenterMsg(x,String(c),'#ffe14f',Math.round(big*(1.2+.5*k)))}}
 if(H.msg&&H.phase!='fin'){const m=H.msg;x.globalAlpha=Math.min(1,(1.3-m.T)*3);ahCenterMsg(x,m.t,m.c,Math.max(2,big-(m.t.length>6?2:0)),Math.round(h*.5-7*big/2-(m.T*8)));x.globalAlpha=1}
 if(H.pause&&H.phase!='fin'){ahOverlay(x,.65);ahCenterMsg(x,'PAUSE','#ffffff',big,Math.round(h*.3));const bw=Math.min(w-40,140),bh=Math.max(18,Math.round(h*.075));
  H.pauseBtns=[{x:Math.round(w/2-bw/2),y:Math.round(h*.3+7*big+16),w:bw,h:bh},{x:Math.round(w/2-bw/2),y:Math.round(h*.3+7*big+24+bh),w:bw,h:bh}];
  ahPanelBtn(x,H.pauseBtns[0],'REPRENDRE','#2f7bff','#1a4ac0',H.pauseSel==0,bh>=24?2:1);ahPanelBtn(x,H.pauseBtns[1],'MENU ARCADE','#9a6bff','#5a35b0',H.pauseSel==1,bh>=24?2:1)}
 if(H.phase=='fin'&&H.end){const e=H.end,win=e.win,a=Math.min(1,e.t*2);ahOverlay(x,.86*a);
  // victoire : confettis et titre qui rebondit ; défaite : titre qui tombe en vacillant
  if(win){for(let i=0;i<36;i++){const px=(i*53+e.t*40*((i%3)+1))%w,py=((i*37)+e.t*(60+(i%5)*25))%h;R(x,px,py,2,3,['#ffe14f','#38e1ff','#ff4fa3','#7cff6b'][i%4])}}
  const ty=Math.round(h*.22+(win?-Math.abs(Math.sin(e.t*4))*6:Math.min(0,(e.t-.5)*40)*-1-Math.max(0,.5-e.t)*60));ahCenterMsg(x,win?'VICTOIRE !':'DÉFAITE',win?'#ffe14f':'#ff4f6a',big,ty);
  let y=ty+7*big+12;ahCenterMsg(x,H.sc[0]+'  -  '+H.sc[1],'#ffffff',Math.max(2,big-2),y);y+=7*Math.max(2,big-2)+8;
  ahCenterMsg(x,'NIVEAU '+AH_LV[H.lv].nom,'#8f97c0',1,y);y+=12;if(H.rec&&win)ahCenterMsg(x,'NOUVEAU RECORD !','#7cff6b',1,y);y+=16;
  const bw=Math.min(w-40,140),bh=Math.max(18,Math.round(h*.075));H.endBtns=[{x:Math.round(w/2-bw/2),y,w:bw,h:bh},{x:Math.round(w/2-bw/2),y:y+bh+10,w:bw,h:bh}];
  if(e.t>.6){ahPanelBtn(x,H.endBtns[0],'REJOUER','#2f7bff','#1a4ac0',e.sel==0,bh>=24?2:1);ahPanelBtn(x,H.endBtns[1],'MENU ARCADE','#9a6bff','#5a35b0',e.sel==1,bh>=24?2:1)}}}
function ahNewMatchSoft(){const T=H.T;H.me={x:T.cx,y:T.y1-T.rm*2.2,vx:0,vy:0,tx:T.cx,ty:T.y1-T.rm*2.2};H.ai={x:T.cx,y:T.y0+T.rm*2.2,vx:0,vy:0};ahReset()}
// ---------- toucher / souris ----------
const inB=(b,x,y)=>b&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function ahPointer(type,sx,sy){if(!H.T)return;
 if(type=='down'){ahAudio();const B=ahButtons();
  if(H.phase=='choix'){const k=(H.choiceBtns||[]).findIndex(b=>inB(b,sx,sy));if(k>=0){H.ch=k;H.lv=AH_LVK[k];ahNewMatch()}return}
  if(H.phase=='fin'){if(H.end.t<.6)return;const k=(H.endBtns||[]).findIndex(b=>inB(b,sx,sy));if(k>=0)ahEndChoice(k);return}
  if(inB(B.menu,sx,sy)){H.api&&H.api.exit();return}
  if(inB(B.pause,sx,sy)){H.pause=!H.pause;H.pauseSel=0;return}
  if(H.pause){const k=(H.pauseBtns||[]).findIndex(b=>inB(b,sx,sy));if(k==0)H.pause=false;else if(k==1)H.api&&H.api.exit();return}
  H.drag=true}
 if(type=='up'){H.drag=false;return}
 if(H.phase=='choix'||H.phase=='fin'||H.pause)return;
 // le maillet suit directement le doigt (ou la souris) ; il reste dans sa moitié de table
 if(type=='move'||type=='down'){const t=ahToTable(Math.max(0,Math.min(H.W,sx)),Math.max(0,Math.min(H.H,sy))),T=H.T;H.me.tx=Math.max(T.x0+T.rm,Math.min(T.x1-T.rm,t.x));H.me.ty=Math.max(T.cy+T.rm,Math.min(T.y1-T.rm,t.y))}}
// touches propres au jeu (P = pause), retirées à la fermeture
function ahKey(e){if(!H.api)return;if(e.code=='KeyP'&&H.phase!='choix'&&H.phase!='fin'){H.pause=!H.pause;H.pauseSel=0;e.preventDefault()}}
// ---------- cycle de vie ----------
const AirHockey={
 start(api){H.api=api;H.T=null;H.phase='choix';const d=api.data();H.lv=d.lastLv||'normal';H.ch=AH_LVK.indexOf(H.lv);H.pause=false;H.end=null;H.parts=[];H.rings=[];H.trail=[];H.msg=null;H.okN=null;H.sc=[0,0];
  addEventListener('keydown',ahKey);ahAudio()},
 update(dt,inp){ahUpdate(dt,inp);if(H.api&&H.lv){const d=H.api.data();if(d.lastLv!==H.lv)d.lastLv=H.lv}},
 draw(x,w,h){ahDraw(x,w,h)},
 pointer:ahPointer,
 stop(){removeEventListener('keydown',ahKey);if(H.api)H.api.save();H.api=null;H.parts=[];H.rings=[];H.trail=[];H.end=null;H.msg=null;H.pause=false;H.phase='choix';AH_BG=null;AH_BGK='';try{if(AHA&&AHA.state=='running')AHA.suspend()}catch(e){}},
 _state:H,_buttons:()=>ahButtons()};
ARC.register('hockey',AirHockey);
})();
