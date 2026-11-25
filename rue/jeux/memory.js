// ===== MINI-JEU MEMORY (module de la borne d'arcade) =====
// Memory moderne : retourner deux cartes, retrouver toutes les paires. 4 difficultés (6, 10, 15, 20 paires), 4 collections
// illustrées (memo_cartes.js), retournement 3D, combos avec multiplicateur, score, 3 étoiles, records et historique par
// difficulté (sauvegarde de Little Life : N.arcade.memory). Musique et sons via le gestionnaire audio central (LLSON / JEUSON).
// Dessin en haute résolution (option M.hires de la borne), mise en page portrait et paysage.
(function(){
const FONT='"LL Outfit",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
// ---------- règles ----------
const DIFFS=[{id:'facile',nom:'Facile',pairs:6,c:3,r:4,mult:1,par:35},{id:'normal',nom:'Normal',pairs:10,c:4,r:5,mult:1.5,par:70},
 {id:'difficile',nom:'Difficile',pairs:15,c:5,r:6,mult:2,par:120},{id:'expert',nom:'Expert',pairs:20,c:5,r:8,mult:3,par:190}];
const FLIP=.3,MISS_WAIT=.7,PAIR_PTS=100,COMBO_MAX=4;
const comboMult=n=>Math.min(COMBO_MAX,1+.5*Math.max(0,n-1));
// score final : points des paires (avec combos) + bonus de temps + bonus de précision ; tout est multiplié par la difficulté
function finalScore(G){const D=DIFFS[G.diff],timeB=Math.round(Math.max(0,D.par-G.t)*15*D.mult),accB=Math.round(Math.max(0,1-G.errors/D.pairs)*500*D.mult);return{pairs:G.pts,time:timeB,acc:accB,total:G.pts+timeB+accB}}
// étoiles : 3 = mémoire excellente et rapide, 2 = bonne, 1 = partie terminée
function starsFor(diff,moves,t){const D=DIFFS[diff],r=moves/D.pairs;return 1+(r<=2.3?1:0)+(r<=1.6&&t<=D.par?1:0)}
const ST={api:null,scr:'home',t:0,W:0,H:0,L:null,G:null,paused:false,modal:null,parts:[],texts:[],cache:{},btns:[],drag:null,focus:-1,mute:false,sc:1};
const ART=()=>MEMO_ART;
// ---------- sauvegarde (dans la sauvegarde de Little Life) ----------
function data(){let d;try{d=ST.api.data()}catch(e){d=ST._d||(ST._d={})}if(!d.recs)d.recs={};if(!d.hist)d.hist={};if(d.diff==null)d.diff=0;if(d.theme==null)d.theme=0;if(!d.played)d.played=0;if(!d.wins)d.wins=0;return d}
function persist(){try{ST.api&&ST.api.save()}catch(e){}}
// ---------- sons ----------
const fx=(n,k,g)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k==null?1:k,g==null?.03:g)}catch(e){}};
let MUS=null;function music(){try{if(typeof JEUSON=='undefined')return;if(MUS!=='memory'){JEUSON.music('memory');MUS='memory'}JEUSON.level(ST.paused||ST.modal=='pause'?.35:ST.scr=='play'?1:.8)}catch(e){}}
const prefs=()=>{try{return LLSON.prefs()}catch(e){return ST._p||(ST._p={m:.8,s:.85,mute:false})}};
const setPref=(k,v)=>{try{LLSON.set(k,v)}catch(e){prefs()[k]=v}};
// ---------- partie ----------
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function newGame(diff,theme){const d=data();if(diff==null)diff=d.diff;if(theme==null)theme=d.theme;d.diff=diff;d.theme=theme;const D=DIFFS[diff],col=ART()[theme];
 const pick=shuffle(col.items.map((_,i)=>i)).slice(0,D.pairs),faces=shuffle(pick.concat(pick));
 ST.G={diff,theme,cards:faces.map(f=>({f,up:false,matched:false,rot:0,pop:0,miss:0})),open:[],lock:false,pend:null,moves:0,errors:0,combo:0,maxCombo:0,pts:0,t:0,started:false,won:false,winT:0,res:null,flips:0};
 ST.scr='play';ST.paused=false;ST.modal=null;ST.parts=[];ST.texts=[];ST.focus=0;d.played++;persist();if(ST.W)layout(ST.W,ST.H);fx('mmStart');music()}
// toucher une carte : refusé pendant une vérification, si la carte est déjà visible, ou si deux cartes sont déjà ouvertes
function tap(i){const G=ST.G;if(!G||ST.scr!='play'||ST.paused||ST.modal||G.won||G.lock)return false;const c=G.cards[i];if(!c||c.up||c.matched||G.open.length>=2||G.open.includes(i))return false;
 c.up=true;G.open.push(i);G.flips++;if(!G.started)G.started=true;fx('mmFlip',.8+Math.random()*.4,.01);
 if(G.open.length==2){G.moves++;G.lock=true;G.pend={a:G.open[0],b:G.open[1],t:0,phase:'flip'}}return true}
function resolve(G){const P=G.pend,A=G.cards[P.a],B=G.cards[P.b],D=DIFFS[G.diff];
 if(A.f==B.f){A.matched=B.matched=true;G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);const m=comboMult(G.combo),pts=Math.round(PAIR_PTS*D.mult*m);G.pts+=pts;A.pop=B.pop=1;G.open=[];G.lock=false;G.pend=null;
  const L=ST.L&&ST.L.grid?ST.L:null,ca=L&&cardRect(P.a),cb=L&&cardRect(P.b),last=G.cards.every(c=>c.matched);
  if(L){burst(ca.x+ca.w/2,ca.y+ca.h/2,last?26:12);burst(cb.x+cb.w/2,cb.y+cb.h/2,last?26:12);const ty=Math.max(L.grid.hud+L.u*(G.combo>=2?50:24),Math.min(ca.y,cb.y)+ca.h*.3);ST.texts.push({t:'+'+pts,x:(ca.x+cb.x+ca.w)/2,y:ty,T:0,c:'#ffffff',s:1});if(G.combo>=2)ST.texts.push({t:'COMBO ×'+m.toFixed(m%1?1:0),x:(ca.x+cb.x+ca.w)/2,y:ty-L.u*22,T:0,c:'#ffd23f',s:1.25})}
  // un seul son à la fois : dernière paire > combo > paire
  if(last){fx('mmLast');G.won=true;G.winT=0;win(G)}else if(G.combo>=2)fx('mmCombo',G.combo);else fx('mmMatch')}
 else{G.errors++;G.combo=0;A.miss=B.miss=1;fx('mmMiss');P.phase='wait';P.t=0}}
function win(G){const D=DIFFS[G.diff],res=finalScore(G),stars=starsFor(G.diff,G.moves,G.t),d=data(),rec=d.recs[D.id],isRec=!rec||res.total>rec.score;
 const entry={score:res.total,stars,moves:G.moves,time:Math.round(G.t*10)/10,errors:G.errors,combo:G.maxCombo,theme:ART()[G.theme].id,date:Date.now()};
 if(isRec)d.recs[D.id]=entry;const h=d.hist[D.id]||(d.hist[D.id]=[]);h.push(entry);h.sort((a,b)=>b.score-a.score);h.length=Math.min(h.length,5);d.wins++;
 try{ST.api&&ST.api.record(res.total)}catch(e){}persist();G.res={...res,stars,rec:isRec,prev:rec?rec.score:0};}
function update(dt,inp){ST.t+=dt;const G=ST.G;music();
 if(G&&ST.scr=='play'){if(G.started&&!G.won&&!ST.paused&&!ST.modal&&!document.hidden)G.t+=dt;
  for(const c of G.cards){const tg=(c.up||c.matched)?1:0;if(c.rot<tg)c.rot=Math.min(tg,c.rot+dt/FLIP);else if(c.rot>tg)c.rot=Math.max(tg,c.rot-dt/FLIP);if(c.pop>0)c.pop=Math.max(0,c.pop-dt*1.6);if(c.miss>0)c.miss=Math.max(0,c.miss-dt*1.2)}
  const P=G.pend;if(P&&!ST.paused){P.t+=dt;if(P.phase=='flip'&&G.cards[P.a].rot>=1&&G.cards[P.b].rot>=1)resolve(G);
   else if(P.phase=='wait'&&P.t>=MISS_WAIT){G.cards[P.a].up=G.cards[P.b].up=false;P.phase='back'}
   else if(P.phase=='back'&&G.cards[P.a].rot<=0&&G.cards[P.b].rot<=0){G.open=[];G.lock=false;G.pend=null}}
  if(G.won){G.winT+=dt;if(G.winT>.7&&ST.scr=='play'){ST.scr='win';confetti();if(G.res.rec&&G.res.prev>0)fx('mmRecord');else fx('mmWin')}}}
 if(ST.scr=='win'&&G)G.winT+=dt;
 for(const p of ST.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.r+=p.vr*dt;p.l-=dt}ST.parts=ST.parts.filter(p=>p.l>0);if(ST.parts.length>260)ST.parts.splice(0,ST.parts.length-260);
 for(const t of ST.texts)t.T+=dt;ST.texts=ST.texts.filter(t=>t.T<1.1)}
// ---------- effets ----------
function burst(x,y,n){const S=ART()[ST.G?ST.G.theme:data().theme].style,cols=[S.accent,'#ffffff','#ffd23f',S.back[0]],u=ST.L?ST.L.u:1;
 for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(60+Math.random()*120)*u;ST.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40*u,g:160*u,r:0,vr:0,l:.5+Math.random()*.4,s:(1.5+Math.random()*2)*u,c:cols[i%cols.length],k:'o'})}}
function confetti(){const L=ST.L,cols=['#ff5f7e','#ffd23f','#4fd6ff','#7cff6b','#b18cff','#ff9a3a'];for(let i=0;i<150;i++)ST.parts.push({x:Math.random()*L.W,y:-Math.random()*L.H*.4,vx:(Math.random()-.5)*60*L.u,vy:(60+Math.random()*120)*L.u,g:30*L.u,r:Math.random()*6,vr:(Math.random()-.5)*10,l:3+Math.random()*2,s:(3+Math.random()*3)*L.u,c:cols[i%cols.length],k:'c'})}
// ---------- mise en page (repère de référence 360×640 en portrait, 640×360 en paysage) ----------
function layout(W,H){const land=W>H,rw=land?640:360,rh=land?360:640,k=Math.min(W/rw,H/rh),L={W,H,land,k,u:Math.min(W,H)/360,ox:(W-rw*k)/2,oy:(H-rh*k)/2};
 L.R=(x,y,w,h)=>({x:L.ox+x*k,y:L.oy+y*k,w:w*k,h:h*k});
 // grille : en paysage, colonnes et rangées sont inversées
 if(ST.G){const D=DIFFS[ST.G.diff],cols=land?D.r:D.c,rows=land?D.c:D.r,hud=land?Math.max(36,H*.12):Math.max(46,H*.085),pad=Math.max(6,Math.min(W,H)*.025),a=.78;
  const aw=W-2*pad,ah=H-hud-2*pad;let gap=Math.max(4,Math.min(W,H)*.018),cw=Math.min((aw-gap*(cols-1))/cols,((ah-gap*(rows-1))/rows)*a);gap=Math.max(4,cw*.09);cw=Math.min((aw-gap*(cols-1))/cols,((ah-gap*(rows-1))/rows)*a);const ch=cw/a;
  L.grid={cols,rows,cw,ch,gap,x:(W-(cols*cw+gap*(cols-1)))/2,y:hud+pad+(ah-(rows*ch+gap*(rows-1)))/2,hud}}
 ST.L=L;ST.cache.key!==W+'x'+H+'x'+ST.sc&&(ST.cache={key:W+'x'+H+'x'+ST.sc});return L}
function cardRect(i){const g=ST.L.grid,c=i%g.cols,r=Math.floor(i/g.cols);return{x:g.x+c*(g.cw+g.gap),y:g.y+r*(g.ch+g.gap),w:g.cw,h:g.ch}}
// ---------- outils de dessin ----------
const fnt=(x,px,w)=>{x.font=(w||700)+' '+Math.max(4,px).toFixed(1)+'px '+FONT};
function rr(x,a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,Math.min(r,w/2,h/2))}
function text(x,t,cx,cy,px,col,o={}){fnt(x,px,o.w);x.textAlign=o.al||'center';x.textBaseline='middle';if(o.sh){x.shadowColor=o.sh;x.shadowBlur=(o.sb||6)*ST.sc}x.fillStyle=col;x.fillText(t,cx,cy);x.shadowBlur=0}
const lg=(x,x1,y1,x2,y2,...c)=>{const g=x.createLinearGradient(x1,y1,x2,y2);c.forEach((k,i)=>g.addColorStop(i/(c.length-1),k));return g};
function cached(key,w,h,fn){let c=ST.cache[key];if(c)return c;const sc=ST.sc;c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*sc));c.height=Math.max(1,Math.ceil(h*sc));const x=c.getContext('2d');x.setTransform(sc,0,0,sc,0,0);fn(x);ST.cache[key]=c;return c}
// carte : face illustrée (avec ombre douce intégrée)
function faceCanvas(theme,f,w,h){const m=Math.ceil(w*.14);return cached('f'+theme+'_'+f+'_'+w.toFixed(1),w+2*m,h+2*m,x=>{const col=ART()[theme],S=col.style,r=w*.13;
 x.save();x.shadowColor='rgba(20,10,40,.32)';x.shadowBlur=w*.1*ST.sc;x.shadowOffsetY=w*.05*ST.sc;rr(x,m,m,w,h,r);x.fillStyle=lg(x,0,m,0,m+h,S.face[0],S.face[1]);x.fill();x.restore();
 x.save();rr(x,m,m,w,h,r);x.clip();
 if(S.dark)for(let i=0;i<14;i++){x.fillStyle='rgba(255,255,255,'+(.15+(i%3)*.12)+')';x.beginPath();x.arc(m+((i*37)%100)/100*w,m+((i*61)%100)/100*h,(i%4?.5:.9)*w/60,0,7);x.fill()}
 x.fillStyle=S.ring;x.beginPath();x.arc(m+w/2,m+h*.5,w*.42,0,7);x.fill();
 // illustration dessinée à part puis posée avec une ombre légère
 const s=Math.min(w,h)*.0078,t=document.createElement('canvas');t.width=Math.ceil(w*ST.sc);t.height=Math.ceil(h*ST.sc);const tx=t.getContext('2d');tx.setTransform(ST.sc*s,0,0,ST.sc*s,ST.sc*w/2,ST.sc*h*.5);
 const it=col.items[f];it.d(tx);if(it.hole){tx.globalCompositeOperation='destination-out';tx.beginPath();tx.arc(it.hole[0],it.hole[1],it.hole[2],0,7);tx.fill();tx.globalCompositeOperation='source-over'}
 x.shadowColor=S.dark?'rgba(0,0,0,.45)':'rgba(80,30,40,.25)';x.shadowBlur=w*.05*ST.sc;x.shadowOffsetY=w*.025*ST.sc;x.drawImage(t,m,m,w,h);x.restore();
 x.strokeStyle=S.dark?'rgba(255,255,255,.16)':'rgba(255,255,255,.9)';x.lineWidth=Math.max(1,w*.02);rr(x,m+w*.04,m+w*.04,w*.92,h-w*.08,r*.8);x.stroke()})}
// dos de carte : dégradé, motif propre à la collection, emblème, reflet
function backCanvas(theme,w,h){const m=Math.ceil(w*.14);return cached('b'+theme+'_'+w.toFixed(1),w+2*m,h+2*m,x=>{const S=ART()[theme].style,r=w*.13;
 x.save();x.shadowColor='rgba(20,10,40,.35)';x.shadowBlur=w*.1*ST.sc;x.shadowOffsetY=w*.05*ST.sc;rr(x,m,m,w,h,r);x.fillStyle=lg(x,m,m,m+w,m+h,S.back[0],S.back[1]);x.fill();x.restore();
 x.save();rr(x,m,m,w,h,r);x.clip();x.fillStyle='rgba(255,255,255,.13)';const sp=w*.2;
 for(let j=-1;j<h/sp+1;j++)for(let i=-1;i<w/sp+1;i++){const cx=m+i*sp+(j%2)*sp/2,cy=m+j*sp*.9;x.save();x.translate(cx,cy);
  if(S.backPat=='pois'){x.beginPath();x.arc(0,0,sp*.13,0,7);x.fill()}
  else if(S.backPat=='pattes'){x.beginPath();x.ellipse(0,sp*.05,sp*.12,sp*.1,0,0,7);x.fill();for(const a of[-1,-.35,.35,1]){x.beginPath();x.arc(a*sp*.13,-sp*.12+Math.abs(a)*sp*.04,sp*.045,0,7);x.fill()}}
  else if(S.backPat=='étoiles'){x.beginPath();for(let q=0;q<10;q++){const a=-Math.PI/2+q*Math.PI/5,rr2=q%2?sp*.05:sp*.13;x.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}x.fill()}
  else{x.rotate(Math.PI/4);x.fillRect(-sp*.08,-sp*.08,sp*.16,sp*.16)}x.restore()}
 x.fillStyle=lg(x,m,m,m+w,m+h*.6,'rgba(255,255,255,.28)','rgba(255,255,255,0)');x.beginPath();x.moveTo(m,m);x.lineTo(m+w,m);x.lineTo(m,m+h*.55);x.fill();x.restore();
 // emblème central
 const cx=m+w/2,cy=m+h/2,er=w*.24;x.fillStyle='rgba(255,255,255,.92)';x.beginPath();x.arc(cx,cy,er,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=w*.025;x.beginPath();x.arc(cx,cy,er*1.25,0,7);x.stroke();
 fnt(x,er*1.15,900);x.textAlign='center';x.textBaseline='middle';x.fillStyle=lg(x,0,cy-er,0,cy+er,S.back[0],S.back[1]);x.fillText('?',cx,cy+er*.06);
 x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=Math.max(1,w*.02);rr(x,m+w*.05,m+w*.05,w*.9,h-w*.1,r*.75);x.stroke()})}
// dessin d'une carte avec retournement 3D (largeur en cosinus, léger biais de perspective, carte soulevée au milieu du geste)
function drawCard(x,i,c,R){const G=ST.G,ang=c.rot*Math.PI,cs=Math.cos(ang),sn=Math.sin(ang),front=c.rot>.5,lift=1+.07*sn+(c.pop>0?.12*Math.sin(c.pop*Math.PI):0);
 const img=front?faceCanvas(G.theme,c.f,R.w,R.h):backCanvas(G.theme,R.w,R.h),m=(img.width/ST.sc-R.w)/2,cx=R.x+R.w/2,cy=R.y+R.h/2;
 x.save();x.translate(cx,cy-sn*R.h*.04);x.transform(Math.max(.02,Math.abs(cs))*lift,(front?-1:1)*sn*.1,0,lift,0,0);
 if(c.matched){const S=ART()[G.theme].style,a=.35+.3*c.pop;x.shadowColor=S.accent;x.shadowBlur=R.w*(.18+.25*c.pop)*ST.sc;rr(x,-R.w/2,-R.h/2,R.w,R.h,R.w*.13);x.fillStyle='rgba(255,255,255,'+a*.4+')';x.fill();x.shadowBlur=0}
 x.drawImage(img,-R.w/2-m,-R.h/2-m,R.w+2*m,R.h+2*m);
 if(c.matched){const S=ART()[G.theme].style;x.strokeStyle=S.accent;x.lineWidth=Math.max(1.5,R.w*.035);rr(x,-R.w/2+1,-R.h/2+1,R.w-2,R.h-2,R.w*.12);x.stroke();
  if(c.pop>0){const a=Math.min(1,c.pop*2),rb=R.w*.16;x.globalAlpha=a;x.fillStyle=S.accent;x.beginPath();x.arc(R.w*.32,-R.h*.36,rb,0,7);x.fill();x.strokeStyle='#ffffff';x.lineWidth=rb*.32;x.lineCap='round';x.beginPath();x.moveTo(R.w*.32-rb*.45,-R.h*.36);x.lineTo(R.w*.32-rb*.1,-R.h*.36+rb*.38);x.lineTo(R.w*.32+rb*.48,-R.h*.36-rb*.36);x.stroke();x.globalAlpha=1}}
 if(c.miss>0&&front){x.globalAlpha=c.miss*.35;rr(x,-R.w/2,-R.h/2,R.w,R.h,R.w*.13);x.fillStyle='#ff5f7e';x.fill();x.globalAlpha=1}
 if(ST.focus==i&&ST.kbd&&ST.scr=='play'){x.strokeStyle='#ffffff';x.lineWidth=Math.max(2,R.w*.04);x.setLineDash([R.w*.08,R.w*.05]);rr(x,-R.w/2-3,-R.h/2-3,R.w+6,R.h+6,R.w*.15);x.stroke();x.setLineDash([])}
 x.restore()}
// fond : dégradé de la collection et bulles de lumière
function drawBg(x,theme){const L=ST.L,S=ART()[theme].style;x.drawImage(cached('bg'+theme,L.W,L.H,c=>{c.fillStyle=lg(c,0,0,L.W*.4,L.H,S.bg[0],S.bg[1]);c.fillRect(0,0,L.W,L.H);for(let i=0;i<16;i++){const r=(20+(i*37)%70)*L.u,g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(255,255,255,0)');c.save();c.translate(((i*97)%100)/100*L.W,((i*53)%100)/100*L.H);c.fillStyle=g;c.fillRect(-r,-r,2*r,2*r);c.restore()}}),0,0,L.W,L.H);
 for(let i=0;i<5;i++){const r=(10+i*6)*L.u,px=(Math.sin(ST.t*.15+i*2)*.4+.5)*L.W,py=((ST.t*.02*(1+i*.3)+i*.23)%1.2-.1)*L.H;x.fillStyle='rgba(255,255,255,.07)';x.beginPath();x.arc(px,L.H-py,r,0,7);x.fill()}}
// boutons (enregistrés pour le toucher)
function btn(x,id,R,label,o={}){ST.btns.push({id,...R,o});const on=o.on,rad=o.rad==null?R.h/2:o.rad;x.save();x.shadowColor='rgba(20,10,40,.3)';x.shadowBlur=R.h*.25*ST.sc;x.shadowOffsetY=R.h*.08*ST.sc;rr(x,R.x,R.y,R.w,R.h,rad);
 x.fillStyle=o.fill||(on?lg(x,0,R.y,0,R.y+R.h,'#ffffff','#f0ecff'):'rgba(255,255,255,.22)');x.fill();x.restore();if(o.stroke!==false){x.strokeStyle=on?'#ffffff':'rgba(255,255,255,.45)';x.lineWidth=Math.max(1,R.h*.04);rr(x,R.x,R.y,R.w,R.h,rad);x.stroke()}
 if(label)text(x,label,R.x+R.w/2,R.y+R.h*(o.sub?.38:.53),o.px||R.h*.38,o.col||(on?o.ink||'#3a2a6a':'#ffffff'),{w:800});if(o.sub)text(x,o.sub,R.x+R.w/2,R.y+R.h*.72,R.h*.22,on?o.ink||'#6a5a9a':'rgba(255,255,255,.8)',{w:600})}
function iconBtn(x,id,R,kind){btn(x,id,R,null,{rad:R.w*.3});const cx=R.x+R.w/2,cy=R.y+R.h/2,s=R.w*.2;x.strokeStyle='#ffffff';x.fillStyle='#ffffff';x.lineWidth=Math.max(1.5,R.w*.08);x.lineCap='round';x.lineJoin='round';x.beginPath();
 if(kind=='back'){x.moveTo(cx+s*.4,cy-s*1.1);x.lineTo(cx-s*.7,cy);x.lineTo(cx+s*.4,cy+s*1.1);x.stroke()}
 else if(kind=='pause'){x.fillRect(cx-s*.8,cy-s,s*.55,s*2);x.fillRect(cx+s*.25,cy-s,s*.55,s*2)}
 else{const p=prefs();x.moveTo(cx-s*1.2,cy-s*.45);x.lineTo(cx-s*.5,cy-s*.45);x.lineTo(cx+s*.25,cy-s*1.1);x.lineTo(cx+s*.25,cy+s*1.1);x.lineTo(cx-s*.5,cy+s*.45);x.lineTo(cx-s*1.2,cy+s*.45);x.closePath();x.fill();
  if(p.mute){x.beginPath();x.moveTo(cx+s*.6,cy-s*.6);x.lineTo(cx+s*1.4,cy+s*.6);x.moveTo(cx+s*1.4,cy-s*.6);x.lineTo(cx+s*.6,cy+s*.6);x.stroke()}else{x.beginPath();x.arc(cx+s*.3,cy,s*.8,-.8,.8);x.stroke();x.beginPath();x.arc(cx+s*.3,cy,s*1.35,-.8,.8);x.stroke()}}}
const fmtT=t=>{t=Math.max(0,t);const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0')};
const fmtN=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function starRow(x,cx,cy,r,n,anim){for(let i=0;i<3;i++){const on=i<n,sx=cx+(i-1)*r*2.4,pop=anim==null?1:Math.max(0,Math.min(1,(anim-i*.35)*3)),s=on?(pop<1?.4+pop*.8:1):1,yy=cy-(i==1?r*.35:0);
 x.save();x.translate(sx,yy);x.scale(s,s);x.beginPath();for(let q=0;q<10;q++){const a=-Math.PI/2+q*Math.PI/5,rr2=q%2?r*.45:r;x.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}x.closePath();
 if(on&&pop>0){x.shadowColor='#ffd23f';x.shadowBlur=r*.8*ST.sc;x.fillStyle=lg(x,0,-r,0,r,'#fff3a0','#ffc21f','#f09a0c')}else x.fillStyle='rgba(255,255,255,.22)';x.fill();x.shadowBlur=0;x.restore()}}
// ---------- écran d'accueil ----------
function drawHome(x){const L=ST.L,d=data(),col=ART()[d.theme],S=col.style,k=L.k,R=L.R;drawBg(x,d.theme);
 {const bs=40*k;iconBtn(x,'exit',{x:10,y:10,w:bs,h:bs},'back');iconBtn(x,'son',{x:L.W-bs-10,y:10,w:bs,h:bs},'son')}
 const tx=L.land?160:180,ty=L.land?52:72;
 x.save();x.shadowColor='rgba(40,10,60,.35)';x.shadowBlur=10*k*ST.sc;x.shadowOffsetY=4*k*ST.sc;text(x,'MEMORY',L.ox+tx*k,L.oy+ty*k,46*k,lg(x,0,L.oy+(ty-22)*k,0,L.oy+(ty+22)*k,'#ffffff','#fff0c8'),{w:900});x.restore();
 text(x,'Retrouve toutes les paires',L.ox+tx*k,L.oy+(ty+32)*k,13*k,'rgba(255,255,255,.88)',{w:600});
 // illustration centrale : éventail de cartes qui flotte doucement
 const ix=L.ox+tx*k,iy=L.oy+(L.land?170:195)*k,cw=62*k,ch=cw/.78,fl=Math.sin(ST.t*1.6)*3*k;
 for(const[dx,rot,kind,f]of[[-48,-.28,'b',0],[48,.28,'f',col.items.length-1],[0,0,'f',0]]){const img=kind=='b'?backCanvas(d.theme,cw,ch):faceCanvas(d.theme,f==0?0:((Math.floor(ST.t/2.5)%(col.items.length-1))+1),cw,ch),m=(img.width/ST.sc-cw)/2;
  x.save();x.translate(ix+dx*k,iy+fl*(dx?.6:1)+(dx?8*k:0));x.rotate(rot+Math.sin(ST.t*1.2+dx)*.02);x.drawImage(img,-cw/2-m,-ch/2-m,cw+2*m,ch+2*m);x.restore()}
 // record de la difficulté choisie
 const D=DIFFS[d.diff],rec=d.recs[D.id],by=L.land?292:300;
 if(rec){starRow(x,ix,L.oy+(by-2)*k,8*k,rec.stars);text(x,'Record '+D.nom+' : '+fmtN(rec.score)+' · '+fmtT(rec.time)+' · '+rec.moves+' coups',ix,L.oy+(by+18)*k,11.5*k,'#ffffff',{w:700})}
 else text(x,'Pas encore de record en '+D.nom,ix,L.oy+(by+8)*k,11.5*k,'rgba(255,255,255,.85)',{w:600});
 // colonne des réglages
 const cx0=L.land?330:20,cy0=L.land?36:332;
 text(x,'DIFFICULTÉ',L.ox+(cx0+2)*k,L.oy+(cy0+2)*k,10.5*k,'rgba(255,255,255,.85)',{w:800,al:'left'});
 DIFFS.forEach((q,i)=>btn(x,'diff'+i,R(cx0+i*80,cy0+12,74,46),q.nom,{on:d.diff==i,sub:(q.c)+'×'+(q.r)+' · '+q.pairs+' paires',px:13*k}));
 text(x,'COLLECTION',L.ox+(cx0+2)*k,L.oy+(cy0+76)*k,10.5*k,'rgba(255,255,255,.85)',{w:800,al:'left'});
 ART().forEach((c,i)=>{const r=R(cx0+(i%2)*160,cy0+86+Math.floor(i/2)*52,154,46);btn(x,'theme'+i,r,null,{on:d.theme==i,rad:r.h*.3});const ic=r.h*.78,img=faceCanvas(i,0,ic*.78,ic),m=(img.width/ST.sc-ic*.78)/2;
  x.drawImage(img,r.x+r.h*.14-m,r.y+(r.h-ic)/2-m,ic*.78+2*m,ic+2*m);text(x,c.nom,r.x+r.h*.14+ic*.78+(r.w-r.h*.14-ic*.78)/2,r.y+r.h/2,Math.min(12*k,(r.w-ic)/c.nom.length*1.9),d.theme==i?'#3a2a6a':'#ffffff',{w:800})});
 const py=cy0+(L.land?200:198);btn(x,'play',R(cx0+(L.land?20:30),py,L.land?260:260,54),'JOUER',{fill:lg(x,0,L.oy+py*k,0,L.oy+(py+54)*k,'#ffe680','#ffb21f'),col:'#5a2a00',px:22*k});
 btn(x,'recs',R(cx0+(L.land?70:80),py+64,160,34),'Mes records',{px:12*k})}
// ---------- partie ----------
function drawPlay(x){const L=ST.L,G=ST.G,g=L.grid,S=ART()[G.theme].style,u=L.u;drawBg(x,G.theme);
 // bandeau : pause, temps, coups, score, combo
 const H=g.hud,bs=Math.min(H*.78,44);x.fillStyle='rgba(20,10,50,.28)';x.fillRect(0,0,L.W,H);iconBtn(x,'pause',{x:8,y:(H-bs)/2,w:bs,h:bs},'pause');iconBtn(x,'son',{x:L.W-bs-8,y:(H-bs)/2,w:bs,h:bs},'son');
 const items=[['TEMPS',fmtT(G.t)],['COUPS',String(G.moves)],['SCORE',fmtN(G.pts)],['COMBO','×'+comboMult(Math.max(1,G.combo)).toFixed(comboMult(Math.max(1,G.combo))%1?1:0)]],aw=L.W-2*bs-32,cw=aw/4;
 items.forEach(([lb,v],i)=>{const cx=bs+16+cw*(i+.5),hot=i==3&&G.combo>=2;text(x,lb,cx,H*.3,Math.min(H*.2,cw*.16),'rgba(255,255,255,.75)',{w:700});text(x,v,cx,H*.66,Math.min(H*.36,cw*.27),hot?'#ffd23f':'#ffffff',{w:900,sh:hot?'#ffb21f':null})});
 for(let i=0;i<G.cards.length;i++)drawCard(x,i,G.cards[i],cardRect(i));
 drawFx(x);
 if(ST.scr=='win')drawWin(x)}
function drawFx(x){for(const p of ST.parts){x.globalAlpha=Math.min(1,p.l*2);x.fillStyle=p.c;if(p.k=='c'){x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillRect(-p.s/2,-p.s*.3,p.s,p.s*.6);x.restore()}else{x.beginPath();x.arc(p.x,p.y,p.s,0,7);x.fill()}}x.globalAlpha=1;
 for(const t of ST.texts){const a=Math.min(1,(1.1-t.T)*3),s=(t.s||1)*(1+Math.max(0,.15-t.T)*2);x.globalAlpha=a;text(x,t.t,t.x,t.y-t.T*30*ST.L.u,16*ST.L.u*s,t.c,{w:900,sh:'rgba(30,10,60,.6)',sb:4});x.globalAlpha=1}}
// ---------- panneaux ----------
function panel(x,w,h){const L=ST.L;x.fillStyle='rgba(15,8,40,.55)';x.fillRect(0,0,L.W,L.H);const pw=Math.min(L.W-24,w*L.k),ph=Math.min(L.H-16,h*L.k),R={x:(L.W-pw)/2,y:(L.H-ph)/2,w:pw,h:ph};
 x.save();x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=24*ST.sc;rr(x,R.x,R.y,R.w,R.h,18*L.k);x.fillStyle=lg(x,0,R.y,0,R.y+R.h,'#ffffff','#f3eeff');x.fill();x.restore();return R}
function drawWin(x){const G=ST.G,r=G.res,L=ST.L,k=L.k,S=ART()[G.theme].style,R=panel(x,320,L.land?300:330),cx=R.x+R.w/2,sk=R.h/(L.land?300:330),ws=Math.min(1,(G.winT-.7)*3);x.save();x.globalAlpha=Math.max(0,ws);
 let y=R.y+34*sk;text(x,'BRAVO !',cx,y,30*k,lg(x,0,y-15*k,0,y+15*k,S.back[0],S.back[1]),{w:900});y+=44*sk;starRow(x,cx,y,17*k,r.stars,G.winT-.9);y+=40*sk;
 const shown=Math.min(r.total,Math.round(r.total*Math.min(1,(G.winT-.9)/1.2)));text(x,fmtN(shown),cx,y,32*k,'#2a1a5a',{w:900});y+=22*sk;
 if(r.rec)text(x,r.prev>0?'NOUVEAU RECORD !':'PREMIER RECORD !',cx,y,13*k,Math.sin(ST.t*8)>0?'#ff3f8e':'#ff9a3a',{w:900});else text(x,'Record : '+fmtN(r.prev),cx,y,12*k,'#6a5a9a',{w:700});y+=24*sk;
 const st=[['Temps',fmtT(G.t)],['Coups',G.moves],['Erreurs',G.errors],['Combo max','×'+comboMult(G.maxCombo).toFixed(comboMult(G.maxCombo)%1?1:0)]];st.forEach(([a,b],i)=>{const qx=R.x+R.w*(i+.5)/4;text(x,String(b),qx,y,15*k,'#2a1a5a',{w:900});text(x,a,qx,y+15*sk,9.5*k,'#7a6aa8',{w:700})});y+=36*sk;
 text(x,'Paires '+fmtN(r.pairs)+' + temps '+fmtN(r.time)+' + précision '+fmtN(r.acc),cx,y,10*k,'#7a6aa8',{w:600});y+=18*sk;x.restore();
 if(ws>=1){const bw=(R.w-36)/3,bh=Math.min(44*k,R.y+R.h-y-10);[['again','Rejouer'],['menu','Menu'],['exit','Borne']].forEach(([id,l],i)=>btn(x,id,{x:R.x+12+i*(bw+6),y,w:bw,h:bh},l,{fill:i==0?lg(x,0,y,0,y+bh,'#ffe680','#ffb21f'):lg(x,0,y,0,y+bh,S.back[0],S.back[1]),col:i==0?'#5a2a00':'#ffffff',px:13*k}))}}
function drawPause(x){const L=ST.L,k=L.k,R=panel(x,280,300),cx=R.x+R.w/2,S=ART()[ST.G?ST.G.theme:data().theme].style;text(x,'PAUSE',cx,R.y+R.h*.13,24*k,'#2a1a5a',{w:900});const bh=R.h*.15,bw=R.w-40;
 [['resume','Reprendre'],['again','Recommencer'],['menu','Menu Memory'],['exit','Retour à la borne']].forEach(([id,l],i)=>btn(x,id,{x:R.x+20,y:R.y+R.h*.25+i*(bh+R.h*.035),w:bw,h:bh},l,{fill:i==0?lg(x,0,0,0,1,'#ffe680','#ffb21f'):lg(x,0,0,R.w,0,S.back[0],S.back[1]),col:i==0?'#5a2a00':'#ffffff',px:14*k}))}
function slider(x,id,R,label,v){ST.btns.push({id,...R,slider:true});text(x,label,R.x,R.y-10*ST.L.k,12*ST.L.k,'#2a1a5a',{w:800,al:'left'});text(x,Math.round(v*100)+' %',R.x+R.w,R.y-10*ST.L.k,12*ST.L.k,'#6a5a9a',{w:800,al:'right'});
 const cy=R.y+R.h/2;rr(x,R.x,cy-3*ST.L.k,R.w,6*ST.L.k,3*ST.L.k);x.fillStyle='#e2dcf5';x.fill();rr(x,R.x,cy-3*ST.L.k,R.w*v,6*ST.L.k,3*ST.L.k);x.fillStyle=lg(x,R.x,0,R.x+R.w,0,'#b18cff','#ff5fae');x.fill();
 x.fillStyle='#ffffff';x.shadowColor='rgba(40,10,80,.35)';x.shadowBlur=6*ST.sc;x.beginPath();x.arc(R.x+R.w*v,cy,11*ST.L.k,0,7);x.fill();x.shadowBlur=0;x.strokeStyle='#b18cff';x.lineWidth=2;x.stroke()}
function drawSon(x){const L=ST.L,k=L.k,R=panel(x,300,280),p=prefs();text(x,'RÉGLAGES DU SON',R.x+R.w/2,R.y+R.h*.12,17*k,'#2a1a5a',{w:900});
 slider(x,'sl_m',{x:R.x+24,y:R.y+R.h*.3,w:R.w-48,h:26*k},'Musique',p.m);slider(x,'sl_s',{x:R.x+24,y:R.y+R.h*.52,w:R.w-48,h:26*k},'Effets sonores',p.s);
 const tb={x:R.x+24,y:R.y+R.h*.68,w:R.w-48,h:R.h*.13};btn(x,'mute',tb,p.mute?'Mode silencieux : activé':'Mode silencieux : désactivé',{fill:p.mute?'#ff5f7e':'#ece6fb',col:p.mute?'#ffffff':'#3a2a6a',px:12.5*k,stroke:false});
 btn(x,'close',{x:R.x+R.w/2-60*k,y:R.y+R.h*.85,w:120*k,h:R.h*.11},'OK',{fill:lg(x,0,0,0,1,'#b18cff','#7a4ae0'),px:14*k})}
function drawRecs(x){const L=ST.L,k=L.k,R=panel(x,320,L.land?330:420),d=data(),D=DIFFS[d.diff];text(x,'MES RECORDS',R.x+R.w/2,R.y+24*k,18*k,'#2a1a5a',{w:900});
 let y=R.y+50*k;DIFFS.forEach((q,i)=>{const r=d.recs[q.id];btn(x,'rdiff'+i,{x:R.x+12+i*(R.w-24)/4,y,w:(R.w-24)/4-6,h:30*k},q.nom,{on:d.diff==i,px:11*k,fill:d.diff==i?'#7a4ae0':'#ece6fb',col:d.diff==i?'#ffffff':'#3a2a6a',stroke:false})});y+=46*k;
 const h=d.hist[D.id]||[];if(!h.length)text(x,'Aucune partie gagnée en '+D.nom+' pour l’instant.',R.x+R.w/2,y+20*k,11.5*k,'#6a5a9a',{w:600});
 h.forEach((e,i)=>{const ry=y+i*Math.min(40*k,(R.h-150*k)/5);rr(x,R.x+12,ry,R.w-24,34*k,10*k);x.fillStyle=i==0?'#fff3c8':'#f3effc';x.fill();text(x,(i+1)+'.',R.x+26,ry+17*k,13*k,'#7a4ae0',{w:900,al:'left'});
  text(x,fmtN(e.score),R.x+46*k,ry+12*k,14*k,'#2a1a5a',{w:900,al:'left'});text(x,fmtT(e.time)+' · '+e.moves+' coups · '+new Date(e.date).toLocaleDateString('fr-FR'),R.x+46*k,ry+25*k,9.5*k,'#7a6aa8',{w:600,al:'left'});starRow(x,R.x+R.w-46*k,ry+18*k,6.5*k,e.stars)});
 btn(x,'close',{x:R.x+R.w/2-60*k,y:R.y+R.h-44*k,w:120*k,h:34*k},'OK',{fill:lg(x,0,0,0,1,'#b18cff','#7a4ae0'),px:14*k})}
function draw(x,w,h){ST.sc=x.getTransform().a||1;if(!ST.L||ST.W!=w||ST.H!=h||ST.L.sc!=ST.sc){ST.W=w;ST.H=h;layout(w,h);ST.L.sc=ST.sc;ST.drag=null}else if(ST.G&&!ST.L.grid)layout(w,h);ST.btns=[];x.imageSmoothingEnabled=true;
 if(ST.scr=='home')drawHome(x);else drawPlay(x);
 if(ST.modal=='pause')drawPause(x);else if(ST.modal=='son')drawSon(x);else if(ST.modal=='recs')drawRecs(x)}
// ---------- commandes ----------
function hit(px,py){for(let i=ST.btns.length-1;i>=0;i--){const b=ST.btns[i];const pad=b.slider?14*ST.L.k:0;if(px>=b.x-pad&&px<=b.x+b.w+pad&&py>=b.y-pad&&py<=b.y+b.h+pad)return b}return null}
function setSlider(b,px){const v=Math.max(0,Math.min(1,(px-b.x)/b.w));setPref(b.id=='sl_m'?'m':'s',Math.round(v*100)/100);if(b.id=='sl_s')fx('mmClick',1,.08)}
function action(id){const d=data();fx('mmClick',1,.05);
 if(id=='exit'){persist();ST.api&&ST.api.exit();return}
 if(id=='son'){ST.modal='son';if(ST.scr=='play'&&!ST.G.won)ST.paused=true;return}
 if(id=='close'){ST.modal=ST.scr=='play'&&ST.paused&&!ST.G.won?'pause':null;if(!ST.modal)ST.paused=false;return}
 if(id=='mute'){setPref('mute',!prefs().mute);return}
 if(id=='recs'){ST.modal='recs';return}
 if(id.startsWith('diff')){d.diff=+id.slice(4);persist();return}if(id.startsWith('rdiff')){d.diff=+id.slice(5);persist();return}
 if(id.startsWith('theme')){d.theme=+id.slice(5);persist();return}
 if(id=='play'||id=='again'){newGame(d.diff,ST.G&&id=='again'?ST.G.theme:d.theme);layout(ST.W,ST.H);return}
 if(id=='pause'){ST.paused=true;ST.modal='pause';return}if(id=='resume'){ST.paused=false;ST.modal=null;return}
 if(id=='menu'){ST.scr='home';ST.modal=null;ST.paused=false;ST.G=null;ST.parts=[];ST.texts=[];layout(ST.W,ST.H);return}}
function pointer(type,px,py,id){if(!ST.L)return;
 if(type=='down'){ST.kbd=false;const b=hit(px,py);if(b){if(b.slider){ST.drag=b;setSlider(b,px)}else action(b.id);return}
  if(!ST.modal&&ST.scr=='play'&&ST.G){const g=ST.L.grid;for(let i=0;i<ST.G.cards.length;i++){const R=cardRect(i);if(px>=R.x-g.gap/2&&px<=R.x+R.w+g.gap/2&&py>=R.y-g.gap/2&&py<=R.y+R.h+g.gap/2){ST.focus=i;tap(i);return}}}return}
 if(type=='move'&&ST.drag){setSlider(ST.drag,px);return}
 if(type=='up'||type=='cancel'){ST.drag=null}}
const OWN=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Space','KeyP','KeyM','Escape']);
function onKey(e){if(!ST.api||!OWN.has(e.code))return;e.preventDefault();if(ST.t<.35)return;/* la touche qui a lancé le jeu depuis la borne ne compte pas */if(e.repeat&&!e.code.startsWith('Arrow'))return;const c=e.code,d=data();
 if(c=='KeyM'){setPref('mute',!prefs().mute);return}
 if(ST.modal){if(c=='Escape'||c=='Enter'||c=='Space'||c=='KeyP')action(ST.modal=='pause'&&c!='Escape'&&c!='KeyP'?'resume':ST.modal=='pause'?'resume':'close');return}
 if(ST.scr=='home'){if(c=='ArrowLeft'||c=='ArrowRight'){d.diff=(d.diff+(c=='ArrowLeft'?3:1))%4;fx('mmClick');persist()}else if(c=='ArrowUp'||c=='ArrowDown'){d.theme=(d.theme+(c=='ArrowUp'?ART().length-1:1))%ART().length;fx('mmClick');persist()}else if(c=='Enter'||c=='Space')action('play');else if(c=='Escape')action('exit');return}
 if(ST.scr=='win'){if(ST.G.winT>1.2){if(c=='Enter'||c=='Space')action('again');else if(c=='Escape')action('menu')}return}
 if(c=='Escape'||c=='KeyP'){action('pause');return}
 const g=ST.L&&ST.L.grid;if(!g)return;ST.kbd=true;if(ST.focus<0)ST.focus=0;const n=ST.G.cards.length,col=ST.focus%g.cols,row=Math.floor(ST.focus/g.cols);
 if(c=='ArrowLeft'&&col>0)ST.focus--;else if(c=='ArrowRight'&&col<g.cols-1&&ST.focus+1<n)ST.focus++;else if(c=='ArrowUp'&&row>0)ST.focus-=g.cols;else if(c=='ArrowDown'&&ST.focus+g.cols<n)ST.focus+=g.cols;else if(c=='Enter'||c=='Space')tap(ST.focus)}
// interruptions : l'appli passe en arrière-plan → pause ; changement d'orientation → glissements relâchés
function onHide(){if(!ST.api)return;ST.drag=null;if((document.hidden||!document.hasFocus())&&ST.scr=='play'&&ST.G&&!ST.G.won&&!ST.modal){ST.paused=true;ST.modal='pause'}persist()}
function onRot(){ST.drag=null;ST.L=null}
// ---------- module ----------
const Memory={hires:2,
 start(api){ST.api=api;ST.t=0;ST.L=null;ST.W=ST.H=0;ST.cache={};ST.G=null;ST.scr='home';ST.modal=null;ST.paused=false;ST.parts=[];ST.texts=[];ST.btns=[];ST.drag=null;ST.focus=-1;ST.kbd=false;data();persist();
  addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onHide);addEventListener('blur',onHide);addEventListener('orientationchange',onRot);MUS=null;music()},
 update,draw,pointer,ownsKey:c=>OWN.has(c),
 stop(){persist();removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onHide);removeEventListener('blur',onHide);removeEventListener('orientationchange',onRot);
  try{if(typeof JEUSON!='undefined'){JEUSON.level(1);JEUSON.stop()}}catch(e){}MUS=null;ST.api=null;ST.G=null;ST.cache={};ST.parts=[];ST.texts=[];ST.btns=[];ST.drag=null;ST.modal=null;ST.paused=false;ST.scr='home'},
 // accès pour les tests
 _s:ST,_tap:tap,_new:newGame,_action:action,_data:data,_rect:i=>cardRect(i),_layout:()=>layout(ST.W,ST.H),_score:finalScore,_stars:starsFor,_combo:comboMult,DIFFS,_rules:{FLIP,MISS_WAIT,PAIR_PTS,COMBO_MAX}};
ARC.register('memory',Memory);
})();
