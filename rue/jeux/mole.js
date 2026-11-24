// ===== MINI-JEU WHACK-A-MOLE (module de la borne d'arcade) =====
// Tape-taupe en 60 secondes : grille de 3 × 3 trous, taupes aux expressions variées, taupes dorées, combos, difficulté progressive.
// S'enregistre auprès de la borne : ARC.register('mole', module). Plein écran, retour au catalogue et record : gérés par la borne.
// Commandes : toucher / clic sur les taupes ; clavier : pavé numérique (7 8 9 / 4 5 6 / 1 2 3) ou les 9 touches de gauche du clavier
// (rangées A Z E / Q S D / W X C sur AZERTY ; pendant la partie elles sont réservées au jeu) ; joystick de la borne + OK.
(function(){
const WM={api:null,phase:'home',W:0,H:0,L:null,holes:[],t:0,okN:null,parts:[],pops:[],ham:{x:0,y:0,sw:0,vis:0},cur:4,son:0,msg:null};
const DUR=60,EXPR=['joie','coquin','grognon','clin'];
const fx=(n,k,g)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
function E(x,cx,cy,rx,ry,c){x.fillStyle=c;const n=Math.ceil(ry);for(let j=-n;j<=n;j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));if(w>0||Math.abs(j)<ry)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
const fmt=n=>String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function music(lv){try{if(typeof JEUSON=='undefined')return;JEUSON.music('mole');JEUSON.level(WM.son==0?lv:0);JEUSON.sfxLevel(WM.son==2?0:1)}catch(e){}}
// ---------- mise en page ----------
function layout(w,h){WM.W=w;WM.H=h;const hb=Math.max(30,Math.round(Math.min(h*.1,w*.13))),top=hb+Math.round(hb*.75),avail=h-top-8,cell=Math.floor(Math.min((w-12)/3,avail/3.05)),gx=Math.round((w-cell*3)/2),gy=top+Math.round((avail-cell*3)/2)+Math.round(cell*.08);
 const L={hb,top,cell,gx,gy,r:Math.round(cell*.36)};WM.holes=[...Array(9)].map((_,i)=>{const o=WM.holes[i]||{};return Object.assign(o,{cx:gx+cell*(i%3)+cell/2,cy:gy+cell*Math.floor(i/3)+cell*.68,r:L.r,ry:Math.max(4,Math.round(L.r*.36))})});
 const bs=Math.max(16,Math.round(hb*.62));L.quit={x:6,y:Math.round((hb-bs)/2),w:Math.max(bs*2.6,axTW('QUITTER')+12),h:bs};L.son={x:w-bs-6,y:L.quit.y,w:bs,h:bs};WM.L=L}
// ---------- partie ----------
function newGame(){WM.score=0;WM.combo=0;WM.bestCombo=0;WM.hits=0;WM.golds=0;WM.misses=0;WM.escaped=0;WM.taps=0;WM.time=DUR;WM.spawnT=.6;WM.parts=[];WM.pops=[];WM.holes.forEach(h=>h.m=null);WM.phase='count';WM.cd=3.2;WM.lastCd=4;WM.over=null;WM.msg=null;WM.lastHole=-1;fx('whClick');music(.85)}
function diff(){return Math.min(1,(DUR-WM.time)/DUR)}
function spawn(){const d=diff(),up=WM.holes.filter(h=>h.m).length,max=d<.3?1:d<.65?2:3;if(up>=max)return;const free=WM.holes.map((h,i)=>i).filter(i=>!WM.holes[i].m&&i!==WM.lastHole);if(!free.length)return;
 const i=free[Math.random()*free.length|0],gold=Math.random()<.08;WM.lastHole=i;WM.holes[i].m={gold,ex:gold?'or':EXPR[Math.random()*EXPR.length|0],st:'rise',y:0,t:0,up:lerp(1.25,.62,d)*(gold?.72:1)*(.85+Math.random()*.3)};fx('whPop',gold?1:0,.02)}
function whack(i,px,py){const h=WM.holes[i];WM.ham.sw=1;WM.taps++;const m=h.m;
 if(m&&(m.st=='rise'&&m.y>.35||m.st=='up'||m.st=='sink'&&m.y>.35)){m.st='hit';m.t=0;WM.combo++;WM.bestCombo=Math.max(WM.bestCombo,WM.combo);WM.hits++;if(m.gold)WM.golds++;
  const mult=Math.min(3,1+Math.floor(WM.combo/5)*.5),pts=Math.round((m.gold?50:10)*mult);WM.score+=pts;
  WM.pops.push({t:'+'+pts,x:h.cx,y:h.cy-h.r*1.6,T:0,c:m.gold?'#ffe14f':'#ffffff',big:m.gold});fx(m.gold?'whGold':'whBonk',Math.min(8,WM.combo),.02);
  for(let k=0;k<(m.gold?22:12);k++){const a=Math.random()*Math.PI*2,v=40+Math.random()*120;WM.parts.push({x:h.cx,y:h.cy-h.r*.8,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:.45+Math.random()*.3,c:m.gold?['#ffe14f','#fff6c8','#ff9a1f'][k%3]:k%2?'#ffe14f':'#ffffff',s:k%3?2:3})}
  if(WM.combo>=5&&WM.combo%5==0){WM.msg={t:'COMBO X'+String(Math.min(3,1+Math.floor(WM.combo/5)*.5)).replace('.',','),c:'#ff7ad0',T:0};fx('whCombo',WM.combo/5,.05)}return true}
 // coup dans le vide : la série s'arrête
 WM.combo=0;WM.misses++;fx('whMiss');for(let k=0;k<6;k++){const a=-Math.PI*Math.random(),v=30+Math.random()*60;WM.parts.push({x:h.cx,y:h.cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35,c:'#8a5a32',s:2})}return false}
function holeAt(x,y){for(let i=0;i<9;i++){const h=WM.holes[i];if(Math.abs(x-h.cx)<h.r*1.05&&y>h.cy-h.r*2.05&&y<h.cy+h.ry*1.6)return i}return -1}
// ---------- mise à jour ----------
function update(dt,inp){dt=Math.min(dt,.05);WM.t+=dt;inp=inp||{};const n=inp.okN||0,ok=WM.okN!=null&&n>WM.okN;WM.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];
 q.forEach(d=>{const c=WM.cur,x=c%3,y=c/3|0;WM.cur=d=='left'?y*3+Math.max(0,x-1):d=='right'?y*3+Math.min(2,x+1):d=='up'?Math.max(0,y-1)*3+x:Math.min(2,y+1)*3+x;WM.kbd=1});
 if(WM.ham.sw>0)WM.ham.sw=Math.max(0,WM.ham.sw-dt*7);if(WM.ham.vis>0)WM.ham.vis-=dt;
 WM.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;p.l-=dt});WM.parts=WM.parts.filter(p=>p.l>0);WM.pops.forEach(p=>p.T+=dt);WM.pops=WM.pops.filter(p=>p.T<.9);if(WM.msg){WM.msg.T+=dt;if(WM.msg.T>1.3)WM.msg=null}
 if(WM.phase=='home'){if(ok)newGame();return}
 if(WM.phase=='over'){WM.over.t+=dt;q.length&&(WM.osel=1-WM.osel);if(ok&&WM.over.t>.8)overChoice(WM.osel);return}
 if(WM.phase=='count'){WM.cd-=dt;const c=Math.ceil(WM.cd);if(c<WM.lastCd){WM.lastCd=c;fx(c>0?'whTick':'whStart',0,.1);if(c<=0){WM.phase='play';WM.msg={t:'TAPE !',c:'#ffe14f',T:0}}}return}
 // partie en cours
 if(ok){whack(WM.cur);WM.ham.vis=.6}
 const prev=Math.ceil(WM.time);WM.time-=dt;if(WM.time<=5&&Math.ceil(WM.time)<prev&&WM.time>0)fx('whTick',1,.1);
 WM.spawnT-=dt;if(WM.spawnT<=0){spawn();WM.spawnT=lerp(.9,.36,diff())*(.75+Math.random()*.5)}
 WM.holes.forEach(h=>{const m=h.m;if(!m)return;m.t+=dt;
  if(m.st=='rise'){m.y=Math.min(1,m.y+dt/.13);if(m.y>=1){m.st='up';m.t=0}}
  else if(m.st=='up'){if(m.t>=m.up){m.st='sink';m.t=0}}
  else if(m.st=='sink'){m.y-=dt/.14;if(m.y<=0){h.m=null;WM.escaped++;if(WM.combo>0){WM.combo=0;fx('whEscape')}}}
  else if(m.st=='hit'){if(m.t>.32)m.y-=dt/.1;if(m.y<=0)h.m=null}});
 if(WM.time<=0){WM.time=0;gameOver()}}
function gameOver(){const s=WM.score,d=WM.api?WM.api.data():{},prev=d.best||0,rec=WM.api?WM.api.record(s):false;WM.phase='over';WM.osel=0;WM.holes.forEach(h=>h.m=null);
 const acc=WM.taps?Math.round(WM.hits/WM.taps*100):0,rank=s<300?'APPRENTI':s<800?'BON RÉFLEXE':s<1600?'EXPERT':'LÉGENDE DU MARTEAU';WM.over={t:0,rec,prev,acc,rank};
 if(WM.api){d.bestCombo=Math.max(d.bestCombo||0,WM.bestCombo);d.games=(d.games||0)+1;WM.api.save()}fx('whEnd',1,1);if(rec)setTimeout(()=>{if(WM.phase=='over')fx('whRecord',1,1)},900);music(.35)}
function overChoice(k){fx('whClick');if(k==0)newGame();else WM.api&&WM.api.exit()}
function toggleSon(){WM.son=(WM.son+1)%3;if(WM.api){WM.api.data().son=WM.son;WM.api.save()}music(WM.phase=='over'?.35:.85)}
// ---------- dessin ----------
function mole(x,cx,base,r,rise,ex,gold,hit,t){const top=base-rise*r*1.55,bc=gold?'#f5c84c':'#8a5a3a',bd=gold?'#c8901a':'#5e3a22',bl=gold?'#fff0a8':'#c49a6c',bw=r*.78,squash=hit?.9:1;
 E(x,cx,top+r*.95,bw+1,r*squash+1,'#1a0c06');E(x,cx,top+r*.95,bw,r*squash,bc);E(x,cx-bw*.25,top+r*.6,bw*.45,r*.4,gold?'#ffe680':'#a06a46');E(x,cx,top+r*1.35,bw*.6,r*.45,bl);
 if(gold){x.globalAlpha=.6+.4*Math.sin(t*12);R(x,cx-bw*.5,top+r*.4,2,2,'#ffffff');R(x,cx+bw*.4,top+r*.9,2,2,'#ffffff');x.globalAlpha=1;R(x,cx-r*.35,top-r*.02,r*.7,r*.18,'#ffe14f');for(let i=0;i<3;i++)R(x,cx-r*.35+i*r*.3,top-r*.2,r*.12,r*.2,'#ffe14f')}
 const ey=top+r*.62,ex1=cx-r*.3,ex2=cx+r*.3,es=Math.max(2,Math.round(r*.16));
 if(hit){for(const e of[ex1,ex2])for(let k=-es;k<=es;k++){R(x,e+k,ey+k,2,2,'#1a0c06');R(x,e+k,ey-k,2,2,'#1a0c06')}for(let i=0;i<4;i++){const a=t*8+i*Math.PI/2;R(x,cx+Math.cos(a)*r*.75-2,top+r*.1+Math.sin(a)*r*.2-2,4,4,'#ffe14f')}}
 else{const eye=(e,shut)=>{if(shut){R(x,e-es,ey,es*2,2,'#1a0c06')}else{E(x,e,ey,es,es+1,'#ffffff');E(x,e+1,ey+1,Math.max(1,es*.55),Math.max(1,es*.6),'#1a0c06');R(x,e,ey-1,1,1,'#ffffff')}};
  eye(ex1,ex=='clin');eye(ex2,false);if(ex=='grognon'){for(let k=0;k<es*1.6;k++){R(x,ex1-es+k,ey-es-3+k*.4,2,2,'#1a0c06');R(x,ex2+es-k,ey-es-3+k*.4,2,2,'#1a0c06')}}
  if(ex=='joie'||ex=='or'){R(x,ex1-es,ey-es-3,es*2,1,'#1a0c06');R(x,ex2-es,ey-es-3,es*2,1,'#1a0c06')}}
 E(x,cx,top+r*.92,r*.2,r*.15,'#ff7aa0');R(x,cx-r*.06,top+r*.86,r*.08,r*.05,'#ffffff');
 const my=top+r*1.12;if(hit)E(x,cx,my+2,r*.16,r*.13,'#1a0c06');else if(ex=='grognon')R(x,cx-r*.2,my+2,r*.4,2,'#1a0c06');else{R(x,cx-r*.22,my,r*.44,2,'#1a0c06');R(x,cx-r*.24,my-2,2,2,'#1a0c06');R(x,cx+r*.22,my-2,2,2,'#1a0c06');R(x,cx-r*.1,my+2,r*.2,r*.16,'#ffffff');if(ex=='coquin')E(x,cx+r*.12,my+r*.16,r*.1,r*.1,'#ff5a7a')}
 for(const s of[-1,1]){R(x,cx+s*r*.32,top+r*.98,s*r*.42,1,'#3a2414');R(x,cx+s*r*.32,top+r*1.04,s*r*.38,1,'#3a2414')}
 E(x,cx,top+r*.98,r*.05,r*.04,'#1a0c06');if(gold&&!hit){E(x,cx+r*.18,top+r*1.02,0,0,'#000')}
 const ex3=top+r*1.55;if(rise>.75){for(const s of[-1,1]){E(x,cx+s*bw*.78,Math.min(base-2,ex3),r*.2,r*.12,'#1a0c06');E(x,cx+s*bw*.78,Math.min(base-2,ex3)-1,r*.18,r*.1,gold?'#ffe680':'#c49a6c')}}}
function hole(x,h,back){const r=h.r,ry=h.ry;if(back){E(x,h.cx,h.cy+ry*.35,r*1.12,ry*1.5,'#6a3e1e');E(x,h.cx,h.cy,r*.98,ry,'#1a0c06');E(x,h.cx,h.cy+2,r*.86,ry*.7,'#2a160c');return}
 // lèvre avant du trou (cache le bas de la taupe)
 x.save();x.beginPath();x.rect(h.cx-r*1.3,h.cy,r*2.6,ry*2.5);x.clip();E(x,h.cx,h.cy+ry*.35,r*1.12,ry*1.5,'#7a4a24');E(x,h.cx,h.cy+ry*.2,r*1.0,ry*1.05,'#8a5a2e');x.restore();
 for(let i=0;i<5;i++){R(x,h.cx-r*.9+i*r*.42,h.cy+ry*.9+(i%2),3,2,'#a06a3a')}}
function hammer(x,px,py,sw,s){const a=-.9+(1-sw)*0+sw*1.35;x.save();x.translate(Math.round(px),Math.round(py));x.rotate(-a);const L=s*1.6,hw=s*.95,hh=s*.55;
 R(x,-s*.1,-hh*.2,s*.2+2,L+2,'#3a2414');R(x,-s*.1+1,-hh*.2,s*.2,L,'#c4884c');R(x,-s*.1+1,-hh*.2,2,L,'#e0a868');
 R(x,-hw/2-1,-hh-1,hw+2,hh+2,'#3a0a10');R(x,-hw/2,-hh,hw,hh,'#e0533d');R(x,-hw/2,-hh,hw,3,'#ff8a70');R(x,-hw/2,-hh*.25,hw,2,'#b8263a');R(x,-hw/2-3,-hh-2,4,hh+4,'#c4ccd4');R(x,hw/2-1,-hh-2,4,hh+4,'#c4ccd4');x.restore()}
function field(x,w,h){R(x,0,0,w,h,'#5cb845');for(let y=0;y<h;y+=10)R(x,0,y,w,5,'#54ad3f');for(let i=0;i<70;i++){const fx2=(i*97)%w,fy=(i*53)%h;R(x,fx2,fy,2,3,'#3f9a34');if(i%7==0){R(x,fx2+3,fy,2,2,['#ffe14f','#ff7ad0','#ffffff'][i%3])}}
 // palissade en bas du bandeau
 const L=WM.L;R(x,0,L.hb,w,Math.round(L.hb*.75),'#8fd0f0');for(let i=0;i<4;i++){const cxx=((i*90+WM.t*6)%(w+60))-30;E(x,cxx,L.hb+8,10,4,'#ffffff');E(x,cxx+9,L.hb+6,8,4,'#ffffff')}
 const fy2=L.hb+Math.round(L.hb*.75)-8;for(let xx=2;xx<w;xx+=9){R(x,xx,fy2-6,6,14,'#c8925a');R(x,xx,fy2-6,6,2,'#e0b080');R(x,xx+1,fy2-8,4,2,'#c8925a')}R(x,0,fy2-2,w,2,'#a87040');R(x,0,fy2+4,w,2,'#a87040')}
function btn(x,b,label,col,dk,sel){R(x,b.x,b.y+2,b.w,b.h,dk);R(x,b.x,b.y,b.w,b.h,col);R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.45)');if(sel){x.globalAlpha=.6+.4*Math.sin(WM.t*8);R(x,b.x-2,b.y-2,b.w+4,1,'#fff');R(x,b.x-2,b.y+b.h+3,b.w+4,1,'#fff');R(x,b.x-2,b.y-2,1,b.h+6,'#fff');R(x,b.x+b.w+1,b.y-2,1,b.h+6,'#fff');x.globalAlpha=1}axCText(x,label,b.x+b.w/2,b.y+Math.round((b.h-7)/2),'#1a0c20',1)}
function sonBtn(x,b){R(x,b.x,b.y+2,b.w,b.h,'#1a0c20');R(x,b.x,b.y,b.w,b.h,'#2a2160');const c='#ffffff',sw=b.w,sx=b.x,sy=b.y;R(x,sx+sw*.18,sy+sw*.38,sw*.16,sw*.24,c);for(let i=0;i<sw*.28;i++)R(x,sx+sw*.34+i,sy+sw*.38-i*.6,1,sw*.24+i*1.2,c);
 if(WM.son==0){R(x,sx+sw*.72,sy+sw*.36,1,sw*.28,c);R(x,sx+sw*.82,sy+sw*.28,1,sw*.44,c)}else if(WM.son==1)R(x,sx+sw*.72,sy+sw*.36,1,sw*.28,'#ff9a1f');else for(let i=0;i<sw*.5;i++)R(x,sx+sw*.25+i,sy+sw*.25+i,2,2,'#ff4f6a')}
function hud(x,w){const L=WM.L,hb=L.hb;R(x,0,0,w,hb,'#5a3216');for(let i=0;i<w;i+=14)R(x,i,0,1,hb,'#4a2810');R(x,0,hb-3,w,3,'#3a1e0a');R(x,0,0,w,2,'#8a5a2e');
 R(x,L.quit.x,L.quit.y+2,L.quit.w,L.quit.h,'#5a0a14');R(x,L.quit.x,L.quit.y,L.quit.w,L.quit.h,'#e0533d');axCText(x,'QUITTER',L.quit.x+L.quit.w/2,L.quit.y+Math.round((L.quit.h-7)/2),'#ffffff',1,'#5a0a14');sonBtn(x,L.son);
 const midL=L.quit.x+L.quit.w+6,midR=L.son.x-6,mw=midR-midL,sc=Math.max(1,Math.min(3,Math.floor((hb-12)/7),Math.floor(mw*.5/Math.max(1,axTW(fmt(WM.score||0),1)))));
 axText(x,'SCORE',midL,4,'#ffd166');axText(x,fmt(WM.score||0),midL,13,'#ffffff',Math.min(sc,Math.max(1,Math.floor((hb-17)/7))),'#1a0c06');
 const tt=Math.ceil(WM.phase=='play'||WM.phase=='count'||WM.phase=='over'?WM.time:DUR),tc=tt<=5&&WM.phase=='play'?(Math.floor(WM.t*6)%2?'#ff4f6a':'#ffffff'):'#ffffff',ts=String(tt)+' S';axText(x,'TEMPS',midR-axTW(ts,1)-2,4,'#ffd166');axText(x,ts,midR-axTW(ts,1)-2,13,tc,1,'#1a0c06');
 // barre de temps et combo sous le bandeau
 const by=hb+2,bw=w-12,k=(WM.phase=='play'||WM.phase=='over'?WM.time:DUR)/DUR;R(x,6,by,bw,5,'#3a1e0a');R(x,6,by,Math.round(bw*k),5,k<.17?'#ff4f6a':k<.4?'#ffb347':'#7cff6b');R(x,6,by,Math.round(bw*k),1,'rgba(255,255,255,.5)');
 if(WM.combo>=2&&WM.phase=='play'){const m=Math.min(3,1+Math.floor(WM.combo/5)*.5),t='COMBO '+WM.combo+(m>1?'  X'+String(m).replace('.',','):'');const cw2=axTW(t)+10;R(x,w/2-cw2/2,by+8,cw2,12,'rgba(26,12,32,.75)');axCText(x,t,w/2,by+10,m>1?'#ff7ad0':'#ffe14f')}}
function draw(x,w,h){if(!WM.L||WM.W!=w||WM.H!=h)layout(w,h);x.imageSmoothingEnabled=false;const L=WM.L;field(x,w,h);
 if(WM.phase=='home'){home(x,w,h);return}
 WM.holes.forEach(H=>{hole(x,H,true);const m=H.m;if(m&&m.y>0){x.save();x.beginPath();x.rect(H.cx-H.r*1.5,0,H.r*3,H.cy+1);x.clip();mole(x,H.cx,H.cy+H.ry*.4,H.r,m.y,m.ex,m.gold,m.st=='hit',WM.t);x.restore()}hole(x,H,false)});
 if(WM.kbd&&WM.phase=='play'){const H=WM.holes[WM.cur];x.globalAlpha=.6+.3*Math.sin(WM.t*8);for(let i=0;i<4;i++){const a=i*Math.PI/2+WM.t*2;R(x,H.cx+Math.cos(a)*H.r*1.15-2,H.cy+Math.sin(a)*H.ry*1.6-2,4,4,'#ffffff')}x.globalAlpha=1}
 WM.parts.forEach(p=>{x.globalAlpha=Math.min(1,p.l*3);R(x,p.x,p.y,p.s,p.s,p.c)});x.globalAlpha=1;
 WM.pops.forEach(p=>{x.globalAlpha=Math.min(1,(.9-p.T)*3);axCText(x,p.t,p.x,p.y-p.T*26,p.c,p.big?2:1,'#1a0c06');x.globalAlpha=1});
 if(WM.phase=='play'||WM.phase=='count'){const H=WM.holes[WM.cur];const hx=WM.kbd?H.cx+H.r*.9:WM.ham.x,hy=WM.kbd?H.cy-H.r*1.4:WM.ham.y;if(WM.kbd||WM.ham.vis>0)hammer(x,hx,hy,WM.ham.sw,Math.max(14,L.r*.9))}
 hud(x,w);
 if(WM.msg&&WM.phase!='over'){const m=WM.msg,sc=Math.max(1,Math.min(3,Math.floor((w-10)/axTW(m.t,1))));x.globalAlpha=Math.min(1,(1.3-m.T)*3);axCText(x,m.t,w/2,Math.round(L.gy+L.cell*1.4-m.T*10),m.c,sc,'#1a0c06');x.globalAlpha=1}
 if(WM.phase=='count'){const c=Math.ceil(WM.cd);if(c>0&&c<=3){const sc=Math.max(3,Math.min(9,Math.floor(Math.min(w,h)/22)));axCText(x,String(c),w/2,Math.round(h*.45),'#ffe14f',sc,'#1a0c06')}}
 if(WM.phase=='over')overScreen(x,w,h)}
function home(x,w,h){const L=WM.L;R(x,0,0,w,h,'rgba(20,10,4,.35)');R(x,0,0,w,L.hb,'#5a3216');for(let i=0;i<w;i+=14)R(x,i,0,1,L.hb,'#4a2810');R(x,0,L.hb-3,w,3,'#3a1e0a');const ts=Math.max(2,Math.min(5,Math.floor((w-16)/axTW('WHACK-A-MOLE',1))));let y=L.top+4;
 axCText(x,'WHACK-A-MOLE',w/2,y,'#ffe14f',ts,'#5a1e0a');y+=7*ts+6;axCText(x,'LE TAPE-TAUPE',w/2,y,'#ffffff',Math.max(1,ts-2),'#5a1e0a');y+=7*Math.max(1,ts-2)+12;
 // illustration : une taupe qui sort et le marteau qui s'abat
 const r=Math.round(Math.min(w*.16,h*.09)),H={cx:w/2,cy:y+r*2.4,r,ry:Math.max(4,Math.round(r*.36))},ph=(WM.t%2.4)/2.4,rise=ph<.15?ph/.15:ph<.7?1:ph<.8?1-(ph-.7)/.1:0,hit=ph>.45&&ph<.75;
 hole(x,H,true);x.save();x.beginPath();x.rect(H.cx-r*1.5,0,r*3,H.cy+1);x.clip();mole(x,H.cx,H.cy+H.ry*.4,r,rise,ph<.3?'coquin':'joie',false,hit,WM.t);x.restore();hole(x,H,false);
 hammer(x,H.cx+r*1.1,H.cy-r*1.9,ph>.38&&ph<.5?1-(ph-.38)/.12:0,r);if(hit&&ph<.55)axCText(x,'BONK !',H.cx-r*1.6,H.cy-r*2.2,'#ffffff',1,'#1a0c06');
 y=H.cy+r+14;const lines=['TAPE LES TAUPES QUI SORTENT !','NORMALE : +10   DORÉE : +50','ENCHAÎNE LES COUPS : COMBO X1,5 X2 X3','UN COUP DANS LE VIDE ARRÊTE LE COMBO','60 SECONDES · ÇA ACCÉLÈRE !'];
 lines.forEach((l,i)=>{const c=i==1?'#ffe14f':'#ffffff';if(axTW(l)<w-8){axCText(x,l,w/2,y,c,1,'#1a0c06');y+=11}});
 const d=WM.api?WM.api.data():{};y+=4;axCText(x,'MEILLEUR SCORE '+fmt(d.best||0),w/2,y,'#7cff6b',1,'#1a0c06');y+=16;
 const bw=Math.min(w-40,140),bh=22;WM.playBtn={x:Math.round(w/2-bw/2),y:Math.min(y,h-bh-10),w:bw,h:bh};btn(x,WM.playBtn,'> JOUER','#ffd23f','#b8860b',true);
 R(x,L.quit.x,L.quit.y+2,L.quit.w,L.quit.h,'#5a0a14');R(x,L.quit.x,L.quit.y,L.quit.w,L.quit.h,'#e0533d');axCText(x,'QUITTER',L.quit.x+L.quit.w/2,L.quit.y+Math.round((L.quit.h-7)/2),'#ffffff',1,'#5a0a14');sonBtn(x,L.son)}
function overScreen(x,w,h){const o=WM.over,d=WM.api?WM.api.data():{},pw=Math.min(w-16,270),ph=Math.min(h-30,236),a={x:Math.round(w/2-pw/2),y:Math.round(h/2-ph/2),w:pw,h:ph};R(x,0,0,w,h,'rgba(20,10,4,.55)');
 R(x,a.x-3,a.y-3,a.w+6,a.h+6,'#3a1e0a');R(x,a.x,a.y,a.w,a.h,'#5a3216');R(x,a.x+3,a.y+3,a.w-6,a.h-6,'#2a1608');const cx=a.x+a.w/2;let y=a.y+10;
 axCText(x,'TEMPS ÉCOULÉ !',cx,y,'#ffd166',2,'#1a0c06');y+=22;axCText(x,'SCORE FINAL',cx,y,'#c9b08a');y+=10;const ss=Math.max(1,Math.min(3,Math.floor((a.w-10)/axTW(fmt(WM.score),1))));axCText(x,fmt(WM.score),cx,y,'#ffffff',ss,'#1a0c06');y+=7*ss+6;
 if(o.rec){const cols=['#7cff6b','#ffe14f','#ff7ad0','#38e1ff'];axCText(x,'NOUVEAU RECORD !',cx,y+Math.round(Math.sin(WM.t*9)),cols[Math.floor(WM.t*10)%4],1,'#1a0c06')}else axCText(x,'MEILLEUR SCORE '+fmt(d.best||0),cx,y,'#7cff6b');y+=12;
 axCText(x,'RÉSULTAT : '+o.rank,cx,y,'#ffe14f');y+=11;axCText(x,WM.hits+(WM.hits>1?' TAUPES · ':' TAUPE · ')+WM.golds+(WM.golds>1?' DORÉES':' DORÉE'),cx,y,'#ffffff');y+=10;axCText(x,'COMBO MAX '+WM.bestCombo+' · PRÉCISION '+o.acc+' %',cx,y,'#ffffff');y+=14;
 const bw=Math.min(a.w-20,200),bh=18;WM.overBtns=[{x:Math.round(cx-bw/2),y,w:bw,h:bh},{x:Math.round(cx-bw/2),y:y+bh+8,w:bw,h:bh}];if(o.t>.8){btn(x,WM.overBtns[0],'REJOUER','#7cff6b','#2a8a3a',WM.osel==0);btn(x,WM.overBtns[1],'RETOUR À LA BORNE','#9a6bff','#5a35b0',WM.osel==1)}}
// ---------- toucher et clavier ----------
const inR=(b,x,y)=>b&&x>=b.x-3&&x<b.x+b.w+3&&y>=b.y-3&&y<b.y+b.h+3;
function pointer(type,sx,sy){if(!WM.L)return;if(type=='move'){WM.ham.x=sx;WM.ham.y=sy;if(WM.phase=='play')WM.ham.vis=Math.max(WM.ham.vis,.4);return}if(type!='down')return;try{JEUSON.ctx()}catch(e){}
 const L=WM.L;if(inR(L.son,sx,sy)&&WM.phase!='over'){toggleSon();return}if(inR(L.quit,sx,sy)&&WM.phase!='over'){fx('whClick');WM.api&&WM.api.exit();return}
 if(WM.phase=='home'){if(inR(WM.playBtn,sx,sy))newGame();return}
 if(WM.phase=='over'){if(WM.over.t>.8&&WM.overBtns){const k=WM.overBtns.findIndex(b=>inR(b,sx,sy));if(k>=0)overChoice(k)}return}
 if(WM.phase!='play')return;WM.kbd=0;WM.ham.x=sx;WM.ham.y=sy;WM.ham.vis=.7;const i=holeAt(sx,sy);if(i>=0)whack(i);else WM.ham.sw=1}
const KEYS={Numpad7:0,Numpad8:1,Numpad9:2,Numpad4:3,Numpad5:4,Numpad6:5,Numpad1:6,Numpad2:7,Numpad3:8,KeyQ:0,KeyW:1,KeyE:2,KeyA:3,KeyS:4,KeyD:5,KeyZ:6,KeyX:7,KeyC:8};
function key(e){if(!WM.api)return;if(e.code=='KeyM'){toggleSon();return}const i=KEYS[e.code];if(i==null||WM.phase!='play')return;e.preventDefault();e.stopPropagation();if(e.repeat)return;WM.cur=i;WM.kbd=1;WM.ham.vis=.6;whack(i)}
// ---------- cycle de vie ----------
const Mole={start(api){WM.api=api;const d=api.data();WM.son=d.son||0;WM.phase='home';WM.L=null;WM.okN=null;WM.holes=[];WM.parts=[];WM.pops=[];WM.msg=null;WM.over=null;WM.score=0;WM.combo=0;WM.time=DUR;WM.kbd=0;WM.cur=4;
  addEventListener('keydown',key,true);music(.6)},
 update,draw,pointer,
 stop(){removeEventListener('keydown',key,true);try{JEUSON.sfxLevel(1);JEUSON.stop()}catch(e){}WM.api=null;WM.phase='home';WM.holes.forEach(h=>h.m=null);WM.parts=[];WM.pops=[];WM.msg=null;WM.L=null},
 ownsKey(c){return WM.phase=="play"&&KEYS[c]!=null},_state:WM,_whack:whack,_spawn:spawn};
ARC.register('mole',Mole);
})();
