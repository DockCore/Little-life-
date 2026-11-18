// ===== MINI-JEU BOWLING (module indépendant) =====
// Vue subjective : aucun personnage n'est affiché. La caméra est dans l'axe de la piste.
// Physique en mètres sur le plan de la piste (x latéral, z vers les quilles), rendu pixel art en perspective.
// Points d'entrée : bwOpen({x}) depuis la rue, bwQuit() pour revenir exactement au même endroit.
const BW_LW=1.0541,BW_HALF=BW_LW/2,BW_GUT=.235,BW_PITCH=1.66,BW_HEAD=18.288,BW_DECK=19.15,BW_WALL=19.75,BW_BR=.109,BW_PR=.06,BW_PH=.381;
const BW_OL='#1d1626',BW_DT=1/240;
const BW_BALLS=[{lb:8,n:'Rose',c:'#ff6b9a',d:'#c23a6a',h:'#ffc2d6'},{lb:10,n:'Orange',c:'#ff9a2e',d:'#c4621a',h:'#ffd9a6'},{lb:12,n:'Menthe',c:'#3fc7a8',d:'#1f8a74',h:'#b7f2e2'},
 {lb:14,n:'Bleue',c:'#3d6fdc',d:'#24409a',h:'#a9c4ff'},{lb:16,n:'Violette',c:'#7b4fc8',d:'#4a2c86',h:'#cdb6f5'}];
// quilles : n°1 en tête, rangées espacées de 12 pouces en triangle
const BW_RACK=[[1,0,0],[2,-.1524,.2639],[3,.1524,.2639],[4,-.3048,.5278],[5,0,.5278],[6,.3048,.5278],[7,-.4572,.7917],[8,-.1524,.7917],[9,.1524,.7917],[10,.4572,.7917]];
// profil d'une quille (hauteur relative -> diamètre en m)
const BW_PROF=[[0,.051],[.08,.09],[.2,.118],[.3,.121],[.42,.1],[.55,.066],[.63,.046],[.7,.05],[.8,.062],[.9,.058],[.97,.04],[1,.02]];
function bwProf(t){for(let i=1;i<BW_PROF.length;i++)if(t<=BW_PROF[i][0]){const[a,da]=BW_PROF[i-1],[b,db]=BW_PROF[i];return da+(db-da)*(t-a)/(b-a)}return .02}
const BW={on:false,cv:null,x:null,W:320,H:360,phase:'off',rolls:[],pins:[],ball:null,bi:2,spin:0,aim:0,pw:0,pwT:0,charging:false,
 view:0,camZ:-10,cam:{x:0,z:-10,h:1,f:3000,cy:0},t:0,msg:null,stats:null,back:null,res:null,keys:{},settleT:0,hitT:0,pinMode:'full'};
// ---------- score (règles officielles à 10 quilles) ----------
function bwPos(r){let i=0;for(let f=0;f<9;f++){if(i>=r.length)return{f,b:0,fresh:true,over:false};if(r[i]==10){i++;continue}if(i+1>=r.length)return{f,b:1,fresh:false,over:false};i+=2}
 const t=r.slice(i);if(t.length==0)return{f:9,b:0,fresh:true,over:false};if(t.length==1)return{f:9,b:1,fresh:t[0]==10,over:false};
 if(t.length==2){if(t[0]==10)return{f:9,b:2,fresh:t[1]==10,over:false};if(t[0]+t[1]==10)return{f:9,b:2,fresh:true,over:false};return{f:9,b:2,over:true}}return{f:9,b:3,over:true}}
function bwScore(r){const F=[];let i=0,tot=0;
 for(let f=0;f<10;f++){const o={r:[],m:[],cum:null};
  if(f<9){if(i>=r.length){F.push(o);continue}
   if(r[i]==10){o.r=[10];o.m=['','X'];if(i+2<r.length){tot+=10+r[i+1]+r[i+2];o.cum=tot}i++}
   else{o.r=r.slice(i,i+2);o.m=[r[i]?String(r[i]):'-',''];if(o.r.length==2){const s=r[i]+r[i+1];o.m[1]=s==10?'/':(r[i+1]?String(r[i+1]):'-');if(s==10){if(i+2<r.length){tot+=10+r[i+2];o.cum=tot}}else{tot+=s;o.cum=tot}}i+=2}}
  else{const t=r.slice(i,i+3);o.r=t;const mk=(v,prev,spareable)=>v==10&&!spareable?'X':(spareable&&prev+v==10?'/':(v?String(v):'-'));
   if(t.length>0)o.m[0]=t[0]==10?'X':(t[0]?String(t[0]):'-');
   if(t.length>1)o.m[1]=t[0]==10?(t[1]==10?'X':(t[1]?String(t[1]):'-')):(t[0]+t[1]==10?'/':(t[1]?String(t[1]):'-'));
   if(t.length>2){const sp=t[0]==10&&t[1]!=10;o.m[2]=sp?(t[1]+t[2]==10?'/':(t[2]?String(t[2]):'-')):(t[2]==10?'X':(t[2]?String(t[2]):'-'))}
   const done=t.length==3||(t.length==2&&t[0]!=10&&t[0]+t[1]<10);if(done){tot+=t.reduce((a,b)=>a+b,0);o.cum=tot}}
  F.push(o)}
 return{F,total:tot}}
// ---------- quilles et boule ----------
function bwRack(){BW.pins=BW_RACK.map(([n,x,z])=>({n,x,z:BW_HEAD+z,x0:x,z0:BW_HEAD+z,vx:0,vz:0,up:true,fall:0,dx:0,dz:1,out:false,drop:1,was:true}))}
function bwNewBall(){const B=BW_BALLS[BW.bi];BW.ball={x:0,z:.35,vx:0,vz:0,m:B.lb*.4536,rot:0,gut:false,pit:false,thrown:false,y:0}}
function bwNewGame(){BW.rolls=[];BW.stats={strikes:0,spares:0,gutters:0,first:[],opens:0,splits:0};bwRack();bwNewBall();BW.phase='aim';BW.msg=null;BW.pw=0;BW.charging=false;bwUI();bwEnd(false)}
// ---------- physique ----------
function bwThrow(){if(BW.phase!='aim'&&BW.phase!='charge')return;const b=BW.ball,B=BW_BALLS[BW.bi],p=Math.max(.05,BW.pw);
 const v=(4.6+p*5)*(1-(B.lb-8)*.012),tx=BW.aim*.62,ang=Math.atan2(tx-b.x,BW_HEAD-b.z);b.vx=Math.sin(ang)*v;b.vz=Math.cos(ang)*v;b.spin=BW.spin;b.thrown=true;b.v0=v;
 BW.phase='roll';BW.charging=false;BW.settleT=0;BW.hitT=0;BW.pins.forEach(q=>{q.was=q.up&&!q.out});bwUI()}
function bwStep(dt){const b=BW.ball;
 if(b.thrown&&!b.pit){
  // effet : la boule glisse sur l'huile puis crochète en fin de piste
  if(!b.gut&&b.z<BW_HEAD){const k=b.z<8?0:Math.min(1,(b.z-8)/4);b.vx+=b.spin*.3*k*dt}
  const sp=Math.hypot(b.vx,b.vz);if(sp>0){const d=Math.max(0,sp-.22*dt)/sp;b.vx*=d;b.vz*=d}
  b.x+=b.vx*dt;b.z+=b.vz*dt;b.rot+=Math.hypot(b.vx,b.vz)*dt/BW_BR;
  if(!b.gut&&b.z<BW_HEAD-.05&&Math.abs(b.x)>BW_HALF){b.gut=true;b.vx=0}
  if(b.gut){const gx=Math.sign(b.x)*(BW_HALF+BW_GUT*.52);b.x+=(gx-b.x)*Math.min(1,dt*12);b.vx=0}
  if(b.z>BW_HEAD-.2&&!b.gut&&Math.abs(b.x)>BW_HALF+BW_GUT-.02){b.x=Math.sign(b.x)*(BW_HALF+BW_GUT-.02);b.vx=-b.vx*.4}
  if(b.z>BW_DECK+.25){b.pit=true}}
 const P=BW.pins;
 // boule -> quilles (pas de contact pour une boule dans la gouttière)
 if(b.thrown&&!b.pit&&!b.gut)for(const q of P){if(q.out)continue;const r=BW_BR+(q.up?BW_PR:.075),dx=q.x-b.x,dz=q.z-b.z,d=Math.hypot(dx,dz);if(d<r&&d>1e-6){
  const nx=dx/d,nz=dz/d,rv=(q.vx-b.vx)*nx+(q.vz-b.vz)*nz;if(rv<0){const mp=1.55,e=.7,j=-(1+e)*rv/(1/b.m+1/mp);b.vx-=j*nx/b.m;b.vz-=j*nz/b.m;q.vx+=j*nx/mp;q.vz+=j*nz/mp;
   // un peu d'élan vers le haut de la piste transmis à la quille
   q.vx+=b.vx*.08;q.vz+=Math.max(0,b.vz)*.06;bwKnock(q);if(!BW.hitT)BW.hitT=BW.t}
  const ov=r-d;b.x-=nx*ov*.25;b.z-=nz*ov*.25;q.x+=nx*ov*.75;q.z+=nz*ov*.75}}
 // quilles entre elles
 for(let i=0;i<P.length;i++){const a=P[i];if(a.out)continue;for(let k=i+1;k<P.length;k++){const c=P[k];if(c.out)continue;const r=(a.up?BW_PR:.075)+(c.up?BW_PR:.075),dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);
  if(d<r&&d>1e-6){const nx=dx/d,nz=dz/d,rv=(c.vx-a.vx)*nx+(c.vz-a.vz)*nz;if(rv<0){const j=-(1+.55)*rv/2;a.vx-=j*nx;a.vz-=j*nz;c.vx+=j*nx;c.vz+=j*nz;
    if(Math.abs(j)>.12){bwKnock(a);bwKnock(c)}}const ov=(r-d)/2;a.x-=nx*ov;a.z-=nz*ov;c.x+=nx*ov;c.z+=nz*ov}}}
 for(const q of P){if(q.out)continue;const sp=Math.hypot(q.vx,q.vz);
  if(sp>0){const fr=(q.up?4.5:1.8)*dt,d=Math.max(0,sp-fr)/sp;q.vx*=d;q.vz*=d}
  q.x+=q.vx*dt;q.z+=q.vz*dt;
  if(q.up&&(sp>.42||Math.hypot(q.x-q.x0,q.z-q.z0)>.07))bwKnock(q);
  if(!q.up&&q.fall<1)q.fall=Math.min(1,q.fall+dt*4.2);
  // parois latérales (kickbacks) et fosse
  const lim=BW_HALF+BW_GUT+.04;if(q.z>BW_HEAD-.6&&Math.abs(q.x)>lim){q.x=Math.sign(q.x)*lim;q.vx=-q.vx*.5;bwKnock(q)}
  if(Math.abs(q.x)>BW_HALF+.02&&q.z<BW_HEAD-.2)bwKnock(q);
  if(q.z>BW_DECK+.05){q.out=true;q.up=false}
  if(q.z<BW_HEAD-1.2){q.vz=Math.abs(q.vz)*.3}}}
function bwKnock(q){if(!q.up)return;q.up=false;const sp=Math.hypot(q.vx,q.vz);if(sp>1e-3){q.dx=q.vx/sp;q.dz=q.vz/sp}else{q.dx=0;q.dz=1}q.fall=Math.max(q.fall,.05)}
function bwMoving(){if(BW.pins.some(q=>!q.out&&(Math.hypot(q.vx,q.vz)>.03||(!q.up&&q.fall<1))))return true;const b=BW.ball;return b.thrown&&!b.pit&&Math.hypot(b.vx,b.vz)>.05}
function bwSettle(){const was=BW.pins.filter(q=>q.was),down=was.filter(q=>!q.up||q.out).length,pos=bwPos(BW.rolls),first=pos.b==0||(pos.f==9&&pos.fresh);
 const st=BW.stats,b=BW.ball;BW.rolls.push(down);const np=bwPos(BW.rolls);
 if(b.gut&&down==0)st.gutters++;if(pos.b==0)st.first.push(down);
 let msg=null;if(first&&down==10){msg='STRIKE !';st.strikes++}else if(!first&&down==was.length&&was.length>0&&pos.b>=1){msg='SPARE !';st.spares++}
 else if(b.gut&&down==0)msg='GOUTTIÈRE';else if(down==0)msg='RATÉ';else msg=down+(down>1?' QUILLES':' QUILLE');
 if(first&&down<10&&bwSplit())st.splits++;
 BW.msg={t:msg,big:msg=='STRIKE !'||msg=='SPARE !',T:0};BW.phase='result';BW.resT=0;BW.next=np;bwUI()}
function bwSplit(){const up=BW.pins.filter(q=>q.up&&!q.out).map(q=>q.n);if(up.includes(1)||up.length<2)return false;
 const col={7:0,4:1,2:2,8:2,1:3,5:3,3:4,9:4,6:5,10:6};const cs=[...new Set(up.map(n=>col[n]))].sort((a,b)=>a-b);for(let i=1;i<cs.length;i++)if(cs[i]-cs[i-1]>1)return true;return false}
function bwAfterResult(){const np=BW.next;if(np.over){BW.phase='end';bwEnd(true);bwUI();return}
 if(np.fresh)bwRack();else{BW.pins.forEach(q=>{if(!q.up)q.out=true;else{q.vx=q.vz=0;q.x0=q.x;q.z0=q.z}})}
 bwNewBall();BW.phase='aim';BW.msg=null;BW.pw=0;bwUI()}
// ---------- boucle ----------
function bwTick(){if(!BW.on)return;BW.t+=1/60;
 const K=BW.keys;if(BW.phase=='aim'||BW.phase=='charge'){if(K.ArrowLeft)BW.aim=Math.max(-1,BW.aim-.012);if(K.ArrowRight)BW.aim=Math.min(1,BW.aim+.012)}
 if(BW.phase=='charge'){BW.pwT+=1/60;const u=(BW.pwT/1.5)%2;BW.pw=u<1?u:2-u}
 if(BW.phase=='roll'){for(let i=0;i<4;i++)bwStep(BW_DT);BW.settleT+=1/60;const b=BW.ball;
  const done=(b.pit||b.z>BW_HEAD+.3||Math.hypot(b.vx,b.vz)<.05)&&!bwMoving();if((done&&BW.settleT>1)||BW.settleT>9||(b.pit&&BW.settleT>2.5&&BW.t-(BW.hitT||BW.t)>3.2))bwSettle()}
 else if(BW.phase=='result'){for(let i=0;i<4;i++)bwStep(BW_DT);BW.resT+=1/60;if(BW.msg)BW.msg.T+=1/60;if(BW.resT>1.7)bwAfterResult()}
 BW.pins.forEach(q=>{if(q.drop>0)q.drop=Math.max(0,q.drop-1/60*3.2)});
 // caméra : suit la boule jusqu'aux quilles ; plan large à l'entrée et en fin de partie
 const tv=BW.phase=='intro'?(BW.t>.6?1:0):BW.phase=='end'?0:1;BW.view+=(tv-BW.view)*.07;if(BW.phase=='intro'&&BW.view>.985){BW.view=1;BW.phase='aim';bwUI()}
 const b=BW.ball,follow=BW.phase=='roll'||BW.phase=='result'?Math.min(13,Math.max(0,(Math.min(b.z,BW_HEAD)-2)*.8)):0;
 BW.camZ+=(-10+follow-BW.camZ)*(BW.phase=='result'?.04:.12);const cx=(BW.phase=='roll'?b.x*.45:0);BW.cam.x+=(cx-BW.cam.x)*.08}
// ---------- rendu ----------
function bwFit(){const box=document.getElementById('bowl');if(!box||!BW.cv)return;const w=box.clientWidth||320,h=box.clientHeight||360;
 BW.W=Math.max(280,Math.min(420,Math.round(320*Math.max(.8,Math.min(1.3,(w/h)/.86)))));BW.H=Math.max(260,Math.round(BW.W*h/w));
 if(BW.cv.width!=BW.W||BW.cv.height!=BW.H){BW.cv.width=BW.W;BW.cv.height=BW.H}BW.x.imageSmoothingEnabled=false;
 // caméra de jeu : 10 m derrière la ligne de faute, piste à 80 % de la largeur ; quilles à 42 % de la hauteur
 BW.fP=BW.W*.8*10/BW_LW;BW.YpP=Math.round(BW.H*.42);const S=(BW.H-58)-BW.YpP;BW.hP=S/(BW.fP*(1/10-1/(BW_HEAD+.3+10)));
 // plan large : on voit la salle, les sièges et le retour de boules
 BW.fW=BW.W*2.3;BW.YpW=Math.round(BW.H*.3);BW.hW=(BW.H*.92-BW.YpW)/(BW.fW*(1/9.2-1/(BW_HEAD+.3+14)))}
function bwCam(){const c=BW.cam,v=BW.view*BW.view*(3-2*BW.view),L=(a,b)=>a+(b-a)*v;c.f=Math.exp(L(Math.log(BW.fW),Math.log(BW.fP)));c.h=L(BW.hW,BW.hP);c.z=L(-14,BW.camZ);const Yp=L(BW.YpW,BW.YpP);c.cy=Yp-c.h*c.f/(BW_HEAD+.3-c.z);return c}
function bwP(X,Y,Z){const c=BW.cam,d=Z-c.z;if(d<.3)return null;const s=c.f/d;return[BW.W/2+(X-c.x)*s,c.cy+(c.h-Y)*s,s]}
function bwR(x,X,Y,W,H,col){if(W<=0||H<=0)return;x.fillStyle=col;x.fillRect(Math.round(X),Math.round(Y),Math.max(1,Math.round(W)),Math.max(1,Math.round(H)))}
function bwDisc(x,X,Y,r,col){X=Math.round(X);Y=Math.round(Y);x.fillStyle=col;if(r<.8){x.fillRect(X,Y,1,1);return}const R=Math.round(r);for(let j=-R;j<=R;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||j==0)x.fillRect(X-w,Y+j,2*w+1,1)}}
// rectangle sur un plan vertical face à la caméra (mur, dossiers de sièges…)
function bwVR(x,x0,x1,y0,y1,z,col){const a=bwP(x0,y1,z),b=bwP(x1,y0,z);if(!a||!b)return null;bwR(x,a[0],a[1],b[0]-a[0],b[1]-a[1],col);return[a[0],a[1],b[0]-a[0],b[1]-a[1]]}
const BW_TXC=new Map();
function bwText(x,s,X,Y,col,sc=1,ol){if(typeof STF=='undefined')return;const k=s+'|'+col+'|'+sc+'|'+(ol||'');let c=BW_TXC.get(k);
 if(!c){const p=ol?Math.max(1,sc/2):0;c=document.createElement('canvas');c.width=Math.max(1,bwTW(s,sc)+2*p+2);c.height=7*sc+2*p+2;bwTextRaw(c.getContext('2d'),s,p,p,col,sc,ol);c.p=p;BW_TXC.set(k,c);if(BW_TXC.size>300)BW_TXC.delete(BW_TXC.keys().next().value)}
 x.drawImage(c,Math.round(X)-c.p,Math.round(Y)-c.p)}
function bwTextRaw(x,s,X,Y,col,sc=1,ol){const draw=(dx,dy,c)=>{let k=0;for(const ch of String(s).toUpperCase()){const g=STF[ch]||STF[' '];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(g[j*5+i]=='1'){x.fillStyle=c;x.fillRect(Math.round(X+dx+(k+i)*sc),Math.round(Y+dy+j*sc),sc,sc)}k+=6}};
 if(ol){for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]])draw(dx*Math.max(1,sc/2),dy*Math.max(1,sc/2),ol)}draw(0,0,col)}
const bwTW=(s,sc=1)=>String(s).length*6*sc-sc;
function bwFloor(x0){const c=BW.cam,key=[c.x,c.z,c.f,c.h,c.cy,BW.W,BW.H].map(v=>Math.round(v*1000)).join('|');
 if(!BW.fl||BW.fl.width!=BW.W||BW.fl.height!=BW.H){BW.fl=document.createElement('canvas');BW.fl.width=BW.W;BW.fl.height=BW.H;BW.flK=''}
 if(BW.flK!==key){const x=BW.fl.getContext('2d');x.clearRect(0,0,BW.W,BW.H);bwFloorDraw(x);BW.flK=key}x0.drawImage(BW.fl,0,0)}
function bwFloorDraw(x){const c=BW.cam,W=BW.W,H=BW.H,ywall=Math.ceil(c.cy+c.h*c.f/(BW_WALL-c.z)),k0=Math.floor((c.x-W/2/(c.f/2))/BW_PITCH)-1,k1=-k0+1;
 for(let sy=Math.max(0,ywall);sy<H;sy++){const dz=c.h*c.f/(sy+.5-c.cy);if(dz<=0)continue;const z=c.z+dz,s=c.f/dz,X=xx=>W/2+(xx-c.x)*s,vis=W/s/2+2;
  const span=(a,b,col)=>{const A=Math.max(0,Math.round(X(a))),B=Math.min(W,Math.round(X(b)));if(B>A){x.fillStyle=col;x.fillRect(A,sy,B-A,1)}};
  const fade=Math.min(1,Math.max(0,(z+2)/22));
  if(z<-4.6){// espace d'attente : moquette
   span(c.x-vis,c.x+vis,'#3a2452');const dot=Math.floor((z+100)*2.2)%3==0;if(dot&&s>6)for(let xx=Math.floor((c.x-vis)/.5)*.5;xx<c.x+vis;xx+=.5)span(xx,xx+.06,'#5b3a7c');continue}
  for(let k=Math.floor((c.x-vis)/BW_PITCH);k<=Math.ceil((c.x+vis)/BW_PITCH);k++){const cx=k*BW_PITCH,L=cx-BW_HALF,R=cx+BW_HALF;
   if(z<0){// approche (bois clair) + séparations
    span(cx-BW_PITCH/2,cx+BW_PITCH/2,z>-.04?'#c23a3a':'#e2b979');if(z>-.04)continue;span(cx+BW_PITCH/2-.03,cx+BW_PITCH/2+.03,'#9a6a3c');
    if(Math.abs(z+1.83)<.025||Math.abs(z+3.66)<.025)for(const bd of[3,5,8,11,14,25,28,31,34,36])span(L+bd*.0266,L+bd*.0266+.025,'#6b4422');continue}
   if(z>BW_DECK){span(cx-BW_PITCH/2,cx+BW_PITCH/2,'#120c18');span(L-BW_GUT-.06,L-BW_GUT,'#3a3248');span(R+BW_GUT,R+BW_GUT+.06,'#3a3248');continue}
   // capot entre deux pistes (avec retour de boules) et gouttières
   span(R+BW_GUT,cx+BW_PITCH-BW_HALF-BW_GUT,z>BW_HEAD-.7?'#2b2238':'#4a3a5c');
   span(L-BW_GUT,L,'#6c7486');span(L-BW_GUT+.03,L-.03,'#858ea2');span(R,R+BW_GUT,'#6c7486');span(R+.03,R+BW_GUT-.03,'#858ea2');
   // planches : érable en tête de piste et sur le plateau, pin au milieu
   const deck=z>BW_HEAD-.6,head=z<4.6,base=deck?'#efcf98':head?'#e8c389':'#dcb27a',alt=deck?'#e4c08a':head?'#dcb57c':'#cfa36d';span(L,R,base);
   const bw=.0266*s;if(bw>=2.2){for(let bd=1;bd<39;bd+=2)span(L+bd*.0266,L+(bd+1)*.0266,alt)}else if(bw>=.9){for(let bd=0;bd<39;bd+=5)span(L+bd*.0266,L+bd*.0266+.0266*.5,alt)}
   // reflet de l'huile au centre
   if(!deck&&s>8){span(cx-.18,cx+.18,'rgba(255,248,230,.10)')}
   // flèches de visée et points
   if(z>4.27&&z<4.57){const wq=(4.57-z)/.3*.035;for(const bd of[5,10,15,20,25,30,35]){const m=L+bd*.0266;span(m-wq,m+wq+.004,'#7a4a24')}}
   if(Math.abs(z-2.13)<.022)for(const bd of[3,5,8,11,14,25,28,31,34,36])span(L+bd*.0266,L+bd*.0266+.022,'#7a4a24');
   if(deck)for(const[,px,pz]of BW_RACK)if(Math.abs(z-(BW_HEAD+pz))<.012)span(cx+px-.012,cx+px+.012,'#b0844e')}
  if(fade<1&&z>0){x.fillStyle=`rgba(40,22,40,${(1-fade)*0})`}}
 return ywall}
function bwWall(x,ywall){const c=BW.cam,W=BW.W;const g=x.createLinearGradient(0,0,0,Math.max(1,ywall));g.addColorStop(0,'#141026');g.addColorStop(1,'#2a1f44');x.fillStyle=g;x.fillRect(0,0,W,Math.max(0,ywall)+1);
 const Z=BW_WALL,vis=W/(c.f/(Z-c.z))/2+2,k0=Math.floor((c.x-vis)/BW_PITCH),k1=Math.ceil((c.x+vis)/BW_PITCH);
 // bandeau néon au-dessus des pistes
 bwVR(x,c.x-vis,c.x+vis,1.62,1.68,Z,'#ff4fa3');bwVR(x,c.x-vis,c.x+vis,1.58,1.62,Z,'#7a2a5a');
 const big=bwP(0,2.15,Z);if(big){const s=big[2],sc=Math.max(1,Math.round(s*.09));const t='LITTLE LIFE BOWLING';bwText(x,t,big[0]-bwTW(t,sc)/2,big[1],'#ffd166',sc,'#5a2a18')}
 for(let k=k0;k<=k1;k++){const cx=k*BW_PITCH;
  // ouverture de la machine à quilles
  bwVR(x,cx-BW_HALF-BW_GUT,cx+BW_HALF+BW_GUT,0,.62,Z,'#0d0912');
  // carénage (masking unit) aux couleurs de la façade
  const m=bwVR(x,cx-.8,cx+.8,.62,1.5,Z,BW_OL);bwVR(x,cx-.79,cx+.79,.63,1.49,Z,'#2fb3a6');bwVR(x,cx-.79,cx+.79,.63,.75,Z,'#1e8077');bwVR(x,cx-.79,cx+.79,1.38,1.49,Z,'#f3e6c9');
  for(let i=-3;i<=3;i++)bwVR(x,cx+i*.22-.05,cx+i*.22+.05,.82,1.3,Z,i%2?'#ff6b8b':'#ffd166');
  const n=bwP(cx,1.47,Z);if(n&&n[2]>20){const sc=Math.max(1,Math.round(n[2]*.06)),t=String(7+k);bwText(x,t,n[0]-bwTW(t,sc)/2,n[1],'#1d2638',sc)}
  // projecteurs au-dessus du plateau
  const sp=bwP(cx,.6,BW_HEAD+.4),sp2=bwP(cx,0,BW_HEAD+.4);if(sp&&sp2){const r=(sp2[1]-sp[1])*1.4,gr=x.createRadialGradient(sp2[0],sp2[1]-r*.3,0,sp2[0],sp2[1]-r*.3,r);gr.addColorStop(0,'rgba(255,236,190,.28)');gr.addColorStop(1,'rgba(255,236,190,0)');x.fillStyle=gr;x.fillRect(sp2[0]-r,sp2[1]-r*1.3,2*r,2*r)}}}
// quille : empilement de disques le long de son axe (debout, en chute ou couchée)
function bwPin(x,q,cx,alpha,mirror){const c=BW.cam,t=Math.min(1,q.fall),ang=t*t*Math.PI/2*(q.up?0:1),ax=Math.sin(ang)*q.dx,az=Math.sin(ang)*q.dz,ay=Math.cos(ang),Yd=(q.drop||0)*.28;
 const N=22,pts=[];for(let i=0;i<=N;i++){const u=i/N,h=u*BW_PH,X=cx+q.x+ax*h,Y=ay*h+Yd+(ang>0?Math.sin(ang)*.05:0),Z=q.z+az*h,p=bwP(X,mirror?-Y:Y,Z);if(!p)return;pts.push([p[0],p[1],bwProf(u)/2*p[2],u])}
 if(ang==0&&Yd<.001){const s0=bwP(cx+q.x,0,q.z);const k=Math.round(s0[2]*2)+'|'+(mirror?1:0);let sp=BW_PSC.get(k);if(!sp){sp=bwPinSprite(Math.round(s0[2]*2)/2,mirror);BW_PSC.set(k,sp);if(BW_PSC.size>400)BW_PSC.delete(BW_PSC.keys().next().value)}
  if(alpha!=null)x.globalAlpha=alpha;x.drawImage(sp.c,Math.round(s0[0])-sp.ox,Math.round(s0[1])-sp.oy);x.globalAlpha=1;return}
 bwPinPts(x,pts,az,alpha,mirror)}
const BW_PSC=new Map();
function bwPinSprite(s,mirror){const w=Math.ceil(.13*s)+6,h=Math.ceil(BW_PH*s)+8,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),ox=Math.floor(w/2),oy=mirror?3:h-4,N=22,pts=[];
 for(let i=0;i<=N;i++){const u=i/N;pts.push([ox,oy+(mirror?1:-1)*u*BW_PH*s,bwProf(u)/2*s,u])}bwPinPts(x,pts,0,null,mirror);return{c,ox,oy}}
function bwPinPts(x,pts,az,alpha,mirror){
 if(alpha!=null)x.globalAlpha=alpha;if(az<0)pts.reverse();
 for(const[X,Y,r]of pts)bwDisc(x,X,Y,r+1,BW_OL);for(const[X,Y,r,u]of pts){bwDisc(x,X,Y,r,u>.6&&u<.69?'#d62f3c':'#f7f3ea')}
 for(const[X,Y,r,u]of pts)if(r>=2.2&&!(u>.6&&u<.69))bwR(x,X+r*.35,Y-.5,r*.55,1,'#d8d2c6');
 const top=pts[az<0?0:pts.length-1];if(top&&top[2]>1.6&&!mirror)bwR(x,top[0]-top[2]*.4,top[1]-top[2]*.5,1,1,'#ffffff');x.globalAlpha=1}
function bwBallDraw(x,b,col,mirror,alpha){const p=bwP(b.x,mirror?-BW_BR:BW_BR,b.z);if(!p)return;const r=BW_BR*p[2];let X=p[0],Y=p[1];if(b.gut&&!mirror)Y+=r*.35;
 if(alpha!=null)x.globalAlpha=alpha;bwDisc(x,X,Y,r+1,BW_OL);bwDisc(x,X,Y,r,col.c);
 // ombrage et reflet
 if(r>3){x.save();x.beginPath();x.rect(Math.round(X-r-1),Math.round(Y-r-1),Math.round(2*r+3),Math.round(2*r+3));x.clip();bwDisc(x,X+r*.28,Y+r*.28,r*.82,col.d);bwDisc(x,X+r*.1,Y+r*.08,r*.75,col.c);x.restore();
  bwDisc(x,X-r*.42,Y-r*.42,Math.max(1,r*.2),col.h)}
 // trous : tournent avec la boule
 if(r>5&&!mirror){const ph=b.rot%(Math.PI*2),vy=Math.cos(ph);if(vy>.1){const oy=-Math.sin(ph)*r*.45;[[-.22,0],[.22,0],[0,.3]].forEach(([hx,hy])=>bwDisc(x,X+hx*r,Y+oy+hy*r*vy,Math.max(1,r*.11*vy+.4),'#1a1222'))}}
 x.globalAlpha=1}
function bwShadow(x,X,Z,rw){const p=bwP(X,0,Z);if(!p)return;const w=rw*p[2],h=Math.max(1,w*.18);x.fillStyle='rgba(30,16,30,.32)';x.fillRect(Math.round(p[0]-w),Math.round(p[1]-h/2),Math.round(2*w),Math.round(h))}
function bwForeground(x){// espace d'attente : visible dans le plan large
 if(BW.view>.9)return;const k0=-2,k1=2;
 for(let k=k1;k>=k0;k--){const cx=k*BW_PITCH;
  // retour de boules entre les pistes
  const rx=cx+BW_PITCH/2;bwVR(x,rx-.22,rx+.22,0,.62,-2.4,BW_OL);bwVR(x,rx-.21,rx+.21,.01,.6,-2.4,'#2fb3a6');bwVR(x,rx-.21,rx+.21,.45,.6,-2.4,'#1e8077');
  BW_BALLS.slice(0,3).forEach((bb,i)=>{const p=bwP(rx-.14+i*.14,.7,-2.42);if(p)bwDisc(x,p[0],p[1],.08*p[2],bb.c)});
  // sièges (on voit leur dossier) et petite table
  const sc=k%2?['#e84a5f','#ff8a98','#b02f44']:['#3d6fdc','#7ea2f2','#2a4ca8'];
  for(const sx of[-.62,-.2,.2,.62]){const a=bwP(cx+sx-.18,.85,-5.6),b2=bwP(cx+sx+.18,.32,-5.6);if(!a||!b2)continue;const X=Math.round(a[0]),Y=Math.round(a[1]),w=Math.round(b2[0]-a[0]),h=Math.round(b2[1]-a[1]),rr=Math.max(1,Math.round(w*.3));
   bwR(x,X+rr,Y-1,w-2*rr,h+2,BW_OL);bwR(x,X-1,Y+rr,w+2,h-rr,BW_OL);bwR(x,X+rr,Y,w-2*rr,h,sc[0]);bwR(x,X,Y+rr,w,h-rr,sc[0]);bwR(x,X+rr,Y+1,w-2*rr,Math.max(1,h*.18),sc[1]);bwR(x,X+w-Math.max(1,w*.2),Y+rr,Math.max(1,w*.2),h-rr,sc[2]);
   const l=bwP(cx+sx,0,-5.6);if(l)bwR(x,l[0]-Math.max(1,w*.06),Y+h,Math.max(2,w*.12),l[1]-Y-h,'#3a3248')}
  const t0=bwP(cx-.16,.55,-4.9),t1=bwP(cx+.16,0,-4.9);if(t0&&t1){const w=t1[0]-t0[0];bwR(x,t0[0]+w*.42,t0[1],w*.16,t1[1]-t0[1],'#3a3248');bwR(x,t0[0]-1,t0[1]-2,w+2,4,BW_OL);bwR(x,t0[0],t0[1]-1,w,2,'#f3e6c9')}
  // écran des scores suspendu
  const m=bwVR(x,cx-.36,cx+.36,1.9,2.2,-1.2,BW_OL);if(m){bwVR(x,cx-.34,cx+.34,1.92,2.18,-1.2,'#101a2a');bwVR(x,cx-.3,cx+.3,2.1,2.15,-1.2,'#38e1ff');bwVR(x,cx-.3,cx-.05,1.98,2.02,-1.2,'#ffd166');bwVR(x,cx-.01,cx+.01,2.2,3.6,-1.2,'#555')}}}
// tableau électronique (écran en haut de l'image)
function bwBoard(x0){const key=BW.rolls.join(',')+'|'+BW.phase+'|'+BW.W;if(BW.bdK!==key){BW.bd=BW.bd||document.createElement('canvas');BW.bd.width=BW.W;BW.bd.height=44;bwBoardDraw(BW.bd.getContext('2d'));BW.bdK=key}x0.drawImage(BW.bd,0,0)}
function bwBoardDraw(x){const W=BW.W,sc=bwScore(BW.rolls),pos=bwPos(BW.rolls),fw=Math.floor((W-48)/10),X0=Math.round((W-(fw*10+40))/2),Y0=6,h=27;
 bwR(x,X0-3,Y0-3,fw*10+46,h+6,BW_OL);bwR(x,X0-2,Y0-2,fw*10+44,h+4,'#0f1a2b');
 for(let f=0;f<10;f++){const X=X0+f*fw,cur=!pos.over&&pos.f==f&&BW.phase!='end';bwR(x,X,Y0,fw-1,h,cur?'#20334f':'#152338');bwR(x,X,Y0,fw-1,1,'#2b4466');
  const o=sc.F[f],m=o.m,cells=f==9?3:2,cw=Math.floor((fw-1)/(f==9?3:2.4));
  bwText(x,String(f+1),X+1,Y0+1,'#5f7ea8');
  for(let i=0;i<cells;i++){const v=m[i]||'';if(!v)continue;const cx=f==9?X+i*cw+1:(i==0?X+fw-1-2*cw:X+fw-1-cw);bwText(x,v,cx+Math.floor((cw-5)/2),Y0+1,v=='X'?'#ffd166':v=='/'?'#38e1ff':'#e8eef8')}
  if(o.cum!=null){const t=String(o.cum);bwText(x,t,X+Math.floor((fw-1-bwTW(t))/2),Y0+16,'#ffffff')}}
 const TX=X0+fw*10+2;bwR(x,TX,Y0,38,h,'#20334f');bwText(x,'TOTAL',TX+4,Y0+2,'#5f7ea8');const t=String(sc.total);bwText(x,t,TX+19-Math.floor(bwTW(t)/2),Y0+15,'#ffd166')}
function bwHud(x){const W=BW.W,H=BW.H,pos=bwPos(BW.rolls);
 // quilles restantes (schéma)
 const up=new Set(BW.pins.filter(q=>q.up&&!q.out).map(q=>q.n)),dx=6,X0=8,Y0=42;bwR(x,X0-3,Y0-3,30,33,'rgba(15,26,43,.82)');
 BW_RACK.forEach(([n,px,pz])=>{const X=X0+11+Math.round(px/.1524*dx/2),Y=Y0+24-Math.round(pz/.2639*7);bwR(x,X-1,Y-1,4,4,BW_OL);bwR(x,X,Y,2,2,up.has(n)?'#f7f3ea':'#4a3a5c')});
 const fr=pos.over?'FIN':'FRAME '+(pos.f+1)+(pos.f==9?' · BOULE '+(pos.b+1):' · BOULE '+(pos.b+1));bwText(x,fr,X0+28,Y0,'#ffffff',1,BW_OL);
 bwText(x,up.size+(up.size>1?' QUILLES':' QUILLE'),X0+28,Y0+11,'#ffd166',1,BW_OL);
 // visée : pointillés jusqu'à la cible, réticule sur les quilles
 const b=BW.ball;if(BW.phase=='aim'||BW.phase=='charge'){const tx=BW.aim*.62;for(let i=1;i<=24;i++){const u=i/24,z=b.z+(BW_HEAD-b.z)*u,xx=b.x+(tx-b.x)*u,p=bwP(xx,0,z);if(p&&i%2==0)bwR(x,p[0]-1,p[1]-1,Math.max(2,p[2]*.03),Math.max(2,p[2]*.015),'#ffd166')}
  const p=bwP(tx,0,BW_HEAD-.25);if(p){bwR(x,p[0]-6,p[1],5,1,'#ff4fa3');bwR(x,p[0]+2,p[1],5,1,'#ff4fa3');bwR(x,p[0],p[1]-6,1,5,'#ff4fa3');bwR(x,p[0],p[1]+2,1,4,'#ff4fa3')}
  // effet : flèche courbe près de la boule
  const pb=bwP(b.x,BW_BR,b.z);if(pb&&BW.spin){const r=BW_BR*pb[2]+6,sg=Math.sign(BW.spin);for(let i=0;i<6+Math.abs(BW.spin)*3;i++){const a=-Math.PI/2+sg*i*.16;bwR(x,pb[0]+Math.cos(a)*r,pb[1]+Math.sin(a)*r*.6-r*.2,2,2,'#38e1ff')}}
  // jauge de puissance
  const gh=Math.round(H*.36),gx=W-18,gy=Math.round(H*.5-gh/2);bwR(x,gx-2,gy-2,12,gh+4,BW_OL);bwR(x,gx,gy,8,gh,'#2a1f44');
  const fh=Math.round(gh*BW.pw);for(let j=0;j<fh;j++){const u=j/gh;x.fillStyle=u<.5?'#3fc7a8':u<.8?'#ffd166':'#ff4f6a';x.fillRect(gx,gy+gh-1-j,8,1)}
  bwText(x,'P',gx+1,gy+gh+5,'#ffffff',1,BW_OL);
}
 if(BW.msg){const m=BW.msg,sc=m.big?3:2,a=Math.min(1,m.T*6),Y=Math.round(H*.24-(m.big?Math.sin(Math.min(1,m.T*3)*Math.PI)*6:0));x.globalAlpha=a;bwText(x,m.t,Math.round(W/2-bwTW(m.t,sc)/2),Y,m.t=='STRIKE !'?'#ffd166':m.t=='SPARE !'?'#38e1ff':'#ffffff',sc,BW_OL);x.globalAlpha=1}}
function bwDraw(){if(!BW.on||!BW.cv)return;const x=BW.x,W=BW.W,H=BW.H;bwCam();x.imageSmoothingEnabled=false;
 const ywall=Math.round(BW.cam.cy+BW.cam.h*BW.cam.f/(BW_WALL-BW.cam.z));bwWall(x,ywall);bwFloor(x);
 const c=BW.cam,vis=W/(c.f/(BW_HEAD-c.z))/2+1,k0=Math.floor((c.x-vis)/BW_PITCH),k1=Math.ceil((c.x+vis)/BW_PITCH),b=BW.ball,col=BW_BALLS[BW.bi];
 // quilles des pistes voisines (décor)
 for(let k=k0;k<=k1;k++)if(k)for(const[n,px,pz]of BW_RACK){if((k*7+n*3)%11==0)continue;bwPin(x,{x:px,z:BW_HEAD+pz,up:true,fall:0,dx:0,dz:1,drop:0},k*BW_PITCH)}
 // reflets sur la piste huilée
 const objs=[];BW.pins.forEach(q=>{if(!q.out)objs.push({z:q.z,f:m=>bwPin(x,q,0,m?.045:null,m)})});if(!b.pit&&BW.phase!='end')objs.push({z:b.z,f:m=>bwBallDraw(x,b,col,m,m?.12:null)});
 objs.sort((a,b2)=>b2.z-a.z);objs.forEach(o=>{if(o.z<BW_DECK)o.f(true)});
 BW.pins.forEach(q=>{if(!q.out&&q.up)bwShadow(x,q.x,q.z,.07)});if(!b.pit&&BW.phase!='end')bwShadow(x,b.x,b.z,BW_BR*.85);
 objs.forEach(o=>o.f(false));
 bwForeground(x);
 // ambiance : vignette chaude
 const g=x.createRadialGradient(W/2,H*.45,H*.25,W/2,H*.45,H*.85);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,10,30,.45)');x.fillStyle=g;x.fillRect(0,0,W,H);
 if(BW.view>.5){x.globalAlpha=Math.min(1,(BW.view-.5)*2);bwBoard(x);bwHud(x);x.globalAlpha=1}
 if(BW.fadeIn>0){x.fillStyle=`rgba(0,0,0,${BW.fadeIn})`;x.fillRect(0,0,W,H);BW.fadeIn=Math.max(0,BW.fadeIn-.06)}}
// ---------- interface (panneau du bas, fin de partie) ----------
function bwUI(){const sc=bwScore(BW.rolls),pos=bwPos(BW.rolls),t=document.getElementById('bwTab');if(!t)return;
 let h='<tr>';for(let f=0;f<10;f++){const o=sc.F[f],cur=!pos.over&&pos.f==f;h+=`<td class="${cur?'cur':''}"><i>${f+1}</i><b>${(o.m||[]).map(v=>`<span>${v||'&nbsp;'}</span>`).join('')||'<span>&nbsp;</span>'}</b><em>${o.cum??''}</em></td>`}
 h+=`<td class="tot"><i>Total</i><em>${sc.total}</em></td></tr>`;t.innerHTML=h;
 document.querySelectorAll('#bwBalls button').forEach((b,i)=>{b.classList.toggle('on',i==BW.bi);b.disabled=!(BW.phase=='aim'||BW.phase=='intro'||BW.phase=='end')});
 const sp=document.getElementById('bwSpin');if(sp){sp.value=BW.spin;document.getElementById('bwSpinV').textContent=['Fort à gauche','Léger à gauche','Sans effet','Léger à droite','Fort à droite'][BW.spin+2]}
 const tip=document.getElementById('bwTip');if(tip)tip.textContent=BW.phase=='roll'||BW.phase=='result'?'La boule roule…':BW.phase=='end'?'Partie terminée !':(BW.touch?'Pose le doigt sur la piste pour viser, maintiens pour la puissance, relâche pour lancer.':'Vise avec la souris, maintiens le clic pour la puissance, relâche pour lancer.')}
function bwEnd(show){const m=document.getElementById('bwEnd');if(!m)return;if(!show){m.hidden=true;return}
 const sc=bwScore(BW.rolls),st=BW.stats;st.opens=sc.F.filter(o=>!o.m.some(m=>m=='X'||m=='/')).length;const avg=st.first.length?(st.first.reduce((a,b)=>a+b,0)/st.first.length):0;N.bowl=N.bowl||{best:0,games:0};const rec=sc.total>N.bowl.best;N.bowl.games++;if(rec)N.bowl.best=sc.total;save();
 document.getElementById('bwFinal').textContent=sc.total;document.getElementById('bwRec').textContent=rec?'Nouveau record !':'Record : '+N.bowl.best;
 document.getElementById('bwStats').innerHTML=[['Strikes',st.strikes],['Spares',st.spares],['Frames ouvertes',st.opens],['Gouttières',st.gutters],['Splits',st.splits],['Moyenne 1re boule',avg.toFixed(1).replace('.',',')],['Parties jouées',N.bowl.games]].map(([a,b])=>`<li><span>${a}</span><b>${b}</b></li>`).join('');
 m.hidden=false}
// ---------- ouverture / fermeture ----------
function bwOpen(o){o=o||{};BW.back={x:typeof o.x=='number'?o.x:null,d:o.d||1};const box=document.getElementById('bowl');if(!box)return;
 BW.on=true;BW.t=0;BW.view=0;BW.fadeIn=1;BW.phase='intro';BW.camZ=-10;BW.cam.x=0;C.st='bowling';C.path=null;
 box.hidden=false;void box.offsetWidth;box.classList.add('on');if(!BW.cv){BW.cv=document.getElementById('bwCv');BW.x=BW.cv.getContext('2d')}bwFit();
 bwNewGame();BW.phase='intro';show('bowling');say('Bienvenue au bowling ! Choisis ta boule et vise les quilles.');
 if(N.street&&BW.back.x!=null){N.street={x:Math.round(BW.back.x),d:BW.back.d,on:1};save()}bwUI()}
function bwQuit(){if(!BW.on)return;BW.on=false;BW.keys={};BW.charging=false;const box=document.getElementById('bowl');box.classList.remove('on');bwEnd(false);setTimeout(()=>{if(!BW.on)box.hidden=true},380);
 if(typeof streetEnter=='function')streetEnter(BW.back&&BW.back.x!=null?BW.back.x:undefined);else{place='home';show('home')}}
// ---------- commandes ----------
function bwAimAt(clientX){const r=BW.cv.getBoundingClientRect(),px=(clientX-r.left)/r.width*BW.W,p=bwP(0,0,BW_HEAD),s=p?p[2]:60;BW.aim=Math.max(-1,Math.min(1,((px-BW.W/2)/s+BW.cam.x)/.62))}
function bwInit(){const cv=document.getElementById('bwCv');if(!cv)return;
 cv.addEventListener('pointermove',e=>{if(!BW.on)return;if(e.pointerType=='mouse'&&(BW.phase=='aim'||BW.phase=='charge'))bwAimAt(e.clientX);else if(BW.phase=='charge')bwAimAt(e.clientX)});
 cv.addEventListener('pointerdown',e=>{if(BW.on&&BW.phase=='intro'){BW.view=1;BW.phase='aim';bwUI()}if(!BW.on||BW.phase!='aim')return;e.preventDefault();BW.touch=e.pointerType!='mouse';bwAimAt(e.clientX);BW.phase='charge';BW.charging=true;BW.pwT=0;BW.pw=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}bwUI()});
 const up=()=>{if(BW.on&&BW.phase=='charge')bwThrow()};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{if(BW.phase=='charge'){BW.phase='aim';BW.charging=false}});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 addEventListener('keydown',e=>{if(!BW.on||curV!='bowling')return;if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&e.target.id!='bwSpin')return;
  if(e.code=='ArrowLeft'||e.code=='ArrowRight'){BW.keys[e.code]=true;e.preventDefault()}
  else if(e.code=='ArrowUp'||e.code=='ArrowDown'){e.preventDefault();if(BW.phase=='aim'||BW.phase=='charge'){BW.spin=Math.max(-2,Math.min(2,BW.spin+(e.code=='ArrowUp'?1:-1)));bwUI()}}
  else if((e.code=='Space'||e.code=='Enter')&&!e.repeat){e.preventDefault();if(BW.phase=='aim'){BW.touch=false;BW.phase='charge';BW.pwT=0;BW.pw=0;bwUI()}else if(BW.phase=='end')bwNewGame()}
  else if(/^Digit[1-5]$/.test(e.code)&&BW.phase=='aim'){BW.bi=+e.code.slice(5)-1;bwNewBall();bwUI()}
  else if(e.code=='KeyR'&&!e.repeat)bwNewGame();else if(e.code=='Escape')bwQuit()});
 addEventListener('keyup',e=>{if(!BW.on)return;delete BW.keys[e.code];if((e.code=='Space'||e.code=='Enter')&&BW.phase=='charge')bwThrow()});
 document.getElementById('bwBalls').innerHTML=BW_BALLS.map((b,i)=>`<button data-i="${i}" aria-label="Boule ${b.n} ${b.lb} livres"><i style="background:${b.c};box-shadow:inset -3px -3px 0 ${b.d}"></i>${b.lb} lb</button>`).join('');
 document.querySelectorAll('#bwBalls button').forEach(b=>b.onclick=()=>{if(BW.phase!='aim'&&BW.phase!='intro'&&BW.phase!='end')return;BW.bi=+b.dataset.i;bwNewBall();bwUI()});
 document.getElementById('bwSpin').oninput=e=>{BW.spin=+e.target.value;bwUI()};
 document.getElementById('bwRestart').onclick=()=>bwNewGame();document.getElementById('bwQuit').onclick=()=>bwQuit();
 document.getElementById('bwAgain').onclick=()=>bwNewGame();document.getElementById('bwLeave').onclick=()=>bwQuit();
 new ResizeObserver(()=>{if(BW.cv){bwFit()}}).observe(document.getElementById('bowl'))}
// ---------- intégration ----------
VT.bowling='Bowling';
{const _up=update;update=function(){_up();bwTick()}}
{const _fr=frame;frame=function(){_fr();if(BW.on){if(!BW.cv){BW.cv=document.getElementById('bwCv');BW.x=BW.cv.getContext('2d')}bwDraw()}}}
window.GAMES=window.GAMES||{};GAMES.bowling={open:bwOpen,quit:bwQuit};
bwInit();
