// Tests réels du Pinball (4 univers) dans la borne (Playwright + Chrome). Usage : node rue/tests/pinball_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
const fullCheck=async(E)=>E(()=>{arcDraw();const H=AX.hi;if(H&&!H.hidden){const r=H.getBoundingClientRect(),d=H.getContext('2d').getImageData(0,0,H.width,H.height).data;let vide=0;for(let i=0;i<400;i++){const j=Math.floor(Math.random()*H.width*H.height)*4;if(d[j+3]<250)vide++}return{diff:vide,couvre:r.left<=.6&&r.top<=.6&&r.right>=innerWidth-.6&&r.bottom>=innerHeight-.6,state:ARC.state,hautResolution:H.width+'x'+H.height}}const L=AX.L,F=L.full,g=AX.gameCv,r=AX.cv.getBoundingClientRect(),k=r.width/L.W,m=AX.x.getImageData(0,0,L.W,L.H).data,gd=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let diff=0;
 for(let i=0;i<400;i++){const X=Math.floor(Math.random()*F.w),Y=Math.floor(Math.random()*F.h),a=((F.y+Y)*L.W+F.x+X)*4,b=(Y*g.width+X)*4;if(m[a]!=gd[b]||m[a+1]!=gd[b+1]||m[a+2]!=gd[b+2])diff++}
 const vis={l:r.left+F.x*k,t:r.top+F.y*k,r:r.left+(F.x+F.w)*k,b:r.top+(F.y+F.h)*k};return{diff,couvre:vis.l<=.6&&vis.t<=.6&&vis.r>=innerWidth-.6&&vis.b>=innerHeight-.6,state:ARC.state}});
const ouvrir=async(p)=>{await p.evaluate(()=>{if(typeof streetEnter=='function'&&!ARC.on){streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()}});await p.waitForTimeout(500);
 await p.evaluate(()=>{ARC.state='menu';ARC.sel=ARC.games.findIndex(g=>g.id=='pinball')});await p.keyboard.press('Enter');await p.waitForTimeout(150);await p.keyboard.press('Enter');await p.waitForTimeout(500)};
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 await E(()=>{window.__fx=[];const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)}});
 await ouvrir(p);
 const touch=(t,sx,sy,id)=>E(([t,sx,sy,id])=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=arcGS();AX.cv.dispatchEvent(new PointerEvent(t,{pointerType:'touch',isPrimary:id==1,pointerId:id,clientX:r.left+(S.x+sx)*k,clientY:r.top+(S.y+sy)*k,bubbles:true}))},[t,sx,sy,id]);
 const tap=async(sx,sy,id=1)=>{await touch('pointerdown',sx,sy,id);await touch('pointerup',sx,sy,id)};
 // ---- 1. écran de choix et 4 univers ----
 const sel=await E(()=>{const P=ARC.modules.pinball._state;arcDraw();return{ph:P.phase,cards:P.selL&&P.selL.cards.length,mus:JEUSON.playing()}});await p.screenshot({path:`${O}/pb_${mode}_01_choix.png`});
 const univ=[];for(let i=0;i<5;i++){const S=await E(()=>ARC.modules.pinball._state.selL);const c=S.cards[i];
  if(tel){await tap(c.x+c.w/2,c.y+c.h/2);await W(120);await tap(c.x+c.w/2,c.y+c.h/2)}else{await E(i=>{ARC.modules.pinball._state.sel=i},i);await p.keyboard.press('Enter')}
  await W(500);await E(()=>{ARC.modules.pinball._state.mute=false});await p.screenshot({path:`${O}/pb_${mode}_0${2+i}_table${i}.png`});
  univ.push(await E(()=>{const M=ARC.modules.pinball,P=M._state,td=M._tables[P.tsel];return{id:td.id,nom:td.nom,ph:P.phase,mus:JEUSON.playing(),pal:td.pal.pf.join(),wall:td.pal.wall}}));
  await E(()=>{const P=ARC.modules.pinball._state;P.phase='select'})}
 ok(T('1 cinq univers jouables (Dinosaur World, Alien Invasion, Future City, Space Galaxy, Far West), chacun avec sa musique, ses couleurs et son décor illustré'),sel.ph=='select'&&sel.cards==5&&univ.map(u=>u.id).join()=='dino,alien,city,space,west'&&univ.every(u=>u.ph=='jeu')&&new Set(univ.map(u=>u.mus)).size==5&&new Set(univ.map(u=>u.pal)).size==5&&new Set(univ.map(u=>u.wall)).size==5,{sel,univ});
 // ---- 2. plateaux physiquement différents ----
 const lay=await E(()=>ARC.modules.pinball._tables.map(t=>{const tb=t.tb,bm=tb.C.filter(c=>c.type=='bumper');return{id:t.id,bumpers:bm.length,pos:bm.map(c=>c.x+','+c.y).join(' '),rampe:tb.ramp?tb.ramp.path[0].join():'-',trous:tb.sau.length,cibles:tb.nStand,tombantes:tb.nDrop,passages:tb.lanes.length,obstacles:tb.S.filter(s=>s.type=='block').length,sig:JSON.stringify(tb.S.map(s=>s.a.concat(s.b)))}}));
 ok(T('2 cinq plateaux physiques différents (bumpers, rampes, trous à bonus, cibles, passages, obstacles)'),new Set(lay.map(l=>l.pos)).size==5&&new Set(lay.map(l=>l.sig)).size==5&&new Set(lay.map(l=>[l.bumpers,l.rampe,l.trous,l.tombantes,l.passages].join('|'))).size==5,lay.map(({sig,...r})=>r));
 // ---- 3. physique de la boule sur les 4 tables ----
 const phys=await E(()=>{const M=ARC.modules.pinball,P=M._state,out=[];P.mute=true;const D0=JSON.stringify(ARC.data('pinball').tables);
  for(let ti=0;ti<M._tables.length;ti++){M._use(ti);P.phase='jeu';P.balls=3;P.paused=false;const TB=M._table,res={id:M._tables[ti].id,out:0,throws:0,circFail:0};
   P.ball={x:184,y:390,vx:0,vy:0,st:'plunger'};P.pl=0;P.charging=true;P.pl=1;M.update(1/60,{okN:P.okN});const vy0=P.ball.vy;let up=0;for(let i=0;i<20;i++){M.update(1/60,{okN:P.okN});up=Math.min(up,P.ball.y)}res.lancer=vy0<-600;
   P.ball={x:100,y:200,vx:0,vy:0,st:'play'};for(let i=0;i<10;i++)M.update(1/60,{okN:P.okN});res.gravite=P.ball.vy>30||P.ball.st!='play';
   for(const c of TB.C){if(c.type=='saucer')continue;for(let k=0;k<8;k++){const an=k/8*Math.PI*2,sx=c.x+Math.cos(an)*(c.r+14),sy=c.y+Math.sin(an)*(c.r+14);if(sx<9||sx>191||sy<14)continue;P.phase='jeu';P.ball={x:sx,y:sy,vx:-Math.cos(an)*850,vy:-Math.sin(an)*850,st:'play'};
    M.update(1/60,{okN:P.okN});if(P.ball.st=='play'&&Math.hypot(P.ball.x-c.x,P.ball.y-c.y)<c.r+5.5-.6)res.circFail++}}
   for(let k=0;k<600;k++){P.phase='jeu';P.balls=3;P.hold=null;P.ball={x:20+Math.random()*150,y:60+Math.random()*280,vx:(Math.random()-.5)*1600,vy:(Math.random()-.5)*1600,st:'play'};res.throws++;
    for(let i=0;i<90;i++){M.update(1/60,{okN:P.okN,left:i%20<5?1:0,right:i%17<4?1:0});const b=P.ball;if(P.phase!='jeu'||!b)break;if(b.st=='play'&&(b.x<8+5.5-1||b.x>192-5.5+1||(b.y<100&&Math.hypot(b.x-100,b.y-100)>92-5.5+1)))res.out++}}
   const bm=TB.C.find(c=>c.type=='bumper');P.phase='jeu';P.mult=1;const s0=P.score;P.ball={x:bm.x,y:bm.y-bm.r-12,vx:0,vy:60,st:'play'};for(let i=0;i<8;i++)M.update(1/60,{okN:P.okN});res.bumper=P.score-s0>=100&&Math.hypot(P.ball.vx,P.ball.vy)>200;
   const sc=TB.sau[0];P.ball={x:sc.x,y:sc.y-3,vx:0,vy:40,st:'play'};P.sauCd=P.sauCd.map(()=>0);M.update(1/60,{okN:P.okN});const held=P.ball.st=='hold';for(let i=0;i<120;i++)M.update(1/60,{okN:P.okN});res.trou=held&&P.ball.st!='hold';
   out.push(res)}M._use(0);P.phase='select';P.mute=false;P.score=0;P.mult=1;Object.assign(ARC.data('pinball').tables,JSON.parse(D0));return out});
 ok(T('3 physique de la boule sur les 5 tables : lancement, gravité, rebonds, bumpers, trous à bonus ; 3 000 lancers sans traverser ni sortir'),phys.every(r=>r.lancer&&r.gravite&&r.out==0&&r.circFail==0&&r.bumper&&r.trou),phys);
 // relancer une partie sur Dinosaur World
 await E(()=>{ARC.modules.pinball._state.sel=0});await p.keyboard.press('Enter');await W(300);
 // ---- 4. palettes gauche et droite (boutons ronds, clavier) ----
 const ang=()=>E(()=>{const P=ARC.modules.pinball._state,F=ARC.modules.pinball._flip;return P.fl.map((f,i)=>Math.abs(f.a-F[i].up)<.01?'haut':Math.abs(f.a-F[i].rest)<.01?'repos':'mouvement')});
 const Lay=()=>E(()=>{const L=ARC.modules.pinball._state.L;return{bl:L.bl,br:L.br,pl:L.pl,tx:L.tx,tw:L.tw,ty:L.ty,th:L.th,k:L.k,hud:L.hud,oldHud:L.oldHud,oldBtnY:L.oldBtnY,r0:L.r0,land:L.land,menu:L.menu,son:L.son}});
 let L=await Lay();const a0=await ang();
 await touch('pointerdown',L.bl.x,L.bl.y,3);await W(90);const g1=await ang();await touch('pointerup',L.bl.x,L.bl.y,3);await W(90);const g2=await ang();
 await touch('pointerdown',L.br.x,L.br.y,4);await W(90);const d1=await ang();await touch('pointerup',L.br.x,L.br.y,4);await W(90);
 await touch('pointerdown',L.bl.x,L.bl.y,5);await touch('pointerdown',L.br.x,L.br.y,6);await W(90);const s1=await ang();await touch('pointerup',L.bl.x,L.bl.y,5);await touch('pointerup',L.br.x,L.br.y,6);await W(90);
 await p.keyboard.down('ArrowLeft');await W(90);const k1=await ang();await p.keyboard.up('ArrowLeft');await p.keyboard.down('ArrowRight');await W(90);const k2=await ang();await p.keyboard.up('ArrowRight');await W(90);
 const hit=await E(()=>{const M=ARC.modules.pinball,P=M._state,F=M._flip[0];P.ball={x:F.px+22,y:F.py+Math.sin(F.rest)*22-9,vx:0,vy:0,st:'play'};P.fl[0].a=F.rest;for(let i=0;i<20;i++)M.update(1/60,{okN:P.okN});for(let i=0;i<6;i++)M.update(1/60,{okN:P.okN,left:1});return{vy:Math.round(P.ball.vy)}});
 ok(T('4 palettes gauche et droite : zones tactiles (un doigt, deux doigts), flèches du clavier, la palette frappe la boule'),a0.join()=='repos,repos'&&g1.join()=='haut,repos'&&g2.join()=='repos,repos'&&d1.join()=='repos,haut'&&s1.join()=='haut,haut'&&k1[0]=='haut'&&k2[1]=='haut'&&hit.vy<-300,{a0,g1,g2,d1,s1,k1,k2,hit});
 // ---- 5. commandes tactiles : chaque moitié de l'écran = une palette ; lanceur bien visible ----
 const z=await E(()=>{const P=ARC.modules.pinball._state,L=P.L,W=P.W,H=P.H,r=AX.cv.getBoundingClientRect(),css=r.width/AX.L.W;P.touches.clear();
  const zones=[[.12,.55],[.3,.8],[.45,.35],[.55,.35],[.7,.8],[.9,.55],[.2,.97],[.8,.97]].map(([u,v])=>{const ball=P.ball;P.ball={x:100,y:200,vx:0,vy:0,st:'play'};const zz=ARC.modules.pinball.pointer('down',W*u,H*v,99)||P.touches.get(99);P.touches.delete(99);P.ball=ball;return zz});
  P.ball={x:184,y:390,vx:0,vy:0,st:'plunger'};ARC.modules.pinball.pointer('down',L.launch.x,L.launch.y,98);const lz=P.touches.get(98);P.touches.delete(98);
  return{zones,lanceur:lz,diamCss:Math.round(2*L.launch.r*css),dansEcran:L.launch.x+L.launch.r<=W&&L.launch.y+L.launch.r<=H&&L.bl.y+L.bl.r<=H,hud:L.land?null:L.hud.h,H}});
 ok(T('5 commandes : moitié gauche = palette gauche, moitié droite = palette droite, partout sous le bandeau ; bouton LANCER visible et assez grand (≥ 44 px)'),z.zones.join()=='L,L,L,R,R,R,L,R'&&z.lanceur=='P'&&z.diamCss>=44&&z.dansEcran,z);
 // ---- 6. la table prend tout l'écran disponible ----
 const lay6=await E(()=>{const P=ARC.modules.pinball._state,L=P.L;return{land:L.land,hud:L.land?0:L.hud.h,H:P.H,W:P.W,tw:Math.round(L.tw),th:Math.round(L.th)}});
 ok(T('6 interface minimaliste : bandeau ≤ 10 % de la hauteur, table qui occupe presque tout l’écran'),lay6.land?lay6.th>=lay6.H*.97:(lay6.hud<=lay6.H*.1&&(lay6.tw>=lay6.W*.95||lay6.th>=(lay6.H-lay6.hud)*.95)),lay6);
 // ---- 7. BEST toujours affiché ----
 const vu=await E(()=>{const P=ARC.modules.pinball._state,res={};const spy=(ph)=>{arcDraw();res[ph]=(P.drawn||[]).some(t=>/BEST|RECORD/.test(t))};
  spy('jeu');P.paused=true;spy('pause');P.paused=false;P.recT=2;spy('record');P.recT=0;const ph=P.phase;P.phase='perdue';P.lostT=5;spy('perdue');P.phase=ph;return res});
 ok(T('7 le BEST de la table reste affiché en permanence (jeu, pause, boule perdue, nouveau record)'),Object.values(vu).every(Boolean),vu);
 // ---- 11. mise à jour automatique en cas de nouveau record (record précédent > 0) ----
 const rec=await E(async()=>{const M=ARC.modules.pinball,P=M._state,d=ARC.data('pinball');d.tables.dino.best=5000;P.best0=5000;P.newRec=false;P.saveT=0;P.score=4990;window.__fx=[];
  M.update(1/60,{okN:P.okN});const avant=d.tables.dino.best;P.score=7300;M.update(1/60,{okN:P.okN});return{avant,apres:d.tables.dino.best,anim:P.recT>0,son:window.__fx.includes('pbNewRec'),sauve:Object.keys(localStorage).some(k=>(localStorage.getItem(k)||'').includes('"dino":{"best":7300'))}});
 await W(150);await p.screenshot({path:`${O}/pb_${mode}_06_record.png`});
 ok(T('11 nouveau record : mise à jour immédiate du BEST, sauvegarde, animation NEW RECORD et son spécial'),rec.avant==5000&&rec.apres==7300&&rec.anim&&rec.son&&rec.sauve,rec);
 // ---- 12. musique et effets sonores propres à chaque table ----
 const son=await E(async()=>{const M=ARC.modules.pinball,P=M._state,out={};P.mute=false;const D0=JSON.stringify(ARC.data('pinball').tables),sc0=P.score;for(let i=0;i<M._tables.length;i++){M._use(i);P.phase='jeu';P.score=0;P.best0=1e9;window.__fx=[];const TB=M._table,bm=TB.C.find(c=>c.type=='bumper');
   P.ball={x:bm.x,y:bm.y-bm.r-12,vx:0,vy:60,st:'play'};for(let j=0;j<8;j++)M.update(1/60,{okN:P.okN});const sc=TB.sau[0];P.sauCd=P.sauCd.map(()=>0);P.ball={x:sc.x,y:sc.y-3,vx:0,vy:40,st:'play'};M.update(1/60,{okN:P.okN});
   const st=TB.S.find(s=>s.type=='stand');P.ball={x:(st.a[0]+st.b[0])/2+(st.a[0]<100?16:-16),y:(st.a[1]+st.b[1])/2,vx:st.a[0]<100?-500:500,vy:0,st:'play'};for(let j=0;j<3;j++)M.update(1/60,{okN:P.okN});
   out[M._tables[i].id]={fx:[...new Set(window.__fx)],mus:JEUSON.playing()};await new Promise(r=>setTimeout(r,60))}M._use(0);P.score=sc0;P.mult=1;Object.assign(ARC.data('pinball').tables,JSON.parse(D0));P.phase='jeu';return out});
 const pref={dino:'dn',alien:'al',city:'ct',space:'sp',west:'ww'};
 ok(T('12 musique propre à chaque table + sons de bumper, trou à bonus et cibles propres à chaque univers (+ palettes, lanceur, perte de boule)'),Object.entries(son).every(([id,v])=>v.mus=='pb_'+id&&v.fx.filter(f=>f.startsWith(pref[id])).length>=3),son);
 // ---- 13. plein écran ----
 const fc=await fullCheck(E);ok(T('13 plein écran, sans borne, sans défilement'),fc.diff==0&&fc.couvre&&fc.state=='game'&&(await E(()=>document.scrollingElement.scrollTop==0)),fc);
 // ---- 10. records indépendants ----
 const ind=await E(()=>{const M=ARC.modules.pinball,P=M._state,d=ARC.data('pinball');d.tables.alien.best=1111;d.tables.city.best=0;d.tables.space.best=2222;M._use(1);P.phase='jeu';P.ball={x:184,y:390,vx:0,vy:0,st:'plunger'};P.pl=0;P.charging=false;P.best0=1111;P.score=900;P.newRec=false;M.update(1/60,{okN:P.okN});const a=d.tables.alien.best;P.score=3333;M.update(1/60,{okN:P.okN});
  return{dino:d.tables.dino.best,alien:d.tables.alien.best,alienAvant:a,city:d.tables.city.best,space:d.tables.space.best}});
 ok(T('10 records indépendants entre les tables'),ind.dino==7300&&ind.alienAvant==1111&&ind.alien==3333&&ind.city==0&&ind.space==2222,ind);
 // ---- 14. fin de partie et retours ----
 const fin=await E(async()=>{const M=ARC.modules.pinball,P=M._state;M._use(0);P.phase='jeu';P.best0=7300;P.newRec=true;P.score=8000;P.balls=1;P.ball={x:100,y:430,vx:0,vy:200,st:'play'};for(let i=0;i<5;i++)M.update(1/60,{okN:P.okN});
  await new Promise(r=>setTimeout(r,2700));return{ph:P.phase,rec:P.over&&P.over.rec,best:P.over&&P.over.best,joue:P.played}});
 await W(400);await p.screenshot({path:`${O}/pb_${mode}_07_fin.png`});
 const btns=await E(()=>ARC.modules.pinball._state.overBtns);
 if(tel)await tap(btns[1].x+5,btns[1].y+5);else{await p.keyboard.press('ArrowDown');await W(50);await p.keyboard.press('Enter')}await W(200);const chg=await E(()=>ARC.modules.pinball._state.phase);
 await E(()=>{ARC.modules.pinball._state.sel=2});await p.keyboard.press('Enter');await W(300);
 await E(()=>{const M=ARC.modules.pinball,P=M._state;P.score=10;P.balls=1;P.ball={x:100,y:430,vx:0,vy:200,st:'play'}});await W(2900);const ov2=await E(()=>ARC.modules.pinball._state.phase);
 if(tel){const b2=await E(()=>ARC.modules.pinball._state.overBtns[0]);await tap(b2.x+5,b2.y+5)}else await p.keyboard.press('Enter');await W(200);const rej=await E(()=>{const P=ARC.modules.pinball._state;return{ph:P.phase,s:P.score,b:P.balls,t:P.tsel}});
 await E(()=>{const P=ARC.modules.pinball._state;P.score=20;P.balls=1;P.ball={x:100,y:430,vx:0,vy:200,st:'play'}});await W(2900);
 if(tel){const b3=await E(()=>ARC.modules.pinball._state.overBtns[2]);await tap(b3.x+5,b3.y+5)}else{await p.keyboard.press('ArrowUp');await W(50);await p.keyboard.press('Enter')}await W(300);
 const back=await E(()=>({st:ARC.state,cur:ARC.cur,mus:JEUSON.playing()}));
 ok(T('14 fin de partie (score, best de la table, boules jouées, NEW RECORD) : CHANGER DE TABLE, REJOUER, RETOUR À LA SALLE D’ARCADE'),fin.ph=='over'&&fin.rec&&fin.best==8000&&fin.joue>=1&&chg=='select'&&ov2=='over'&&rej.ph=='jeu'&&rej.s==0&&rej.b==3&&rej.t==2&&back.st=='menu'&&back.cur==null&&!/^pb/.test(back.mus||''),{fin,chg,ov2,rej,back});
 // ---- 8. record conservé après fermeture du flipper ----
 const ferm=await E(()=>{const d=ARC.data('pinball');return{mem:Object.fromEntries(Object.entries(d.tables).map(([k,v])=>[k,v.best])),ls:Object.keys(localStorage).some(k=>(localStorage.getItem(k)||'').includes('"dino":{"best":8000'))}});
 await ouvrir(p);const re=await E(()=>{const P=ARC.modules.pinball._state;arcDraw();return{ph:P.phase,sel:P.sel}});await p.screenshot({path:`${O}/pb_${mode}_08_retour_choix.png`});
 ok(T('8 records conservés après fermeture du flipper (et affichés sur l’écran de choix)'),ferm.mem.dino==8000&&ferm.mem.city==20&&ferm.mem.alien==3333&&ferm.ls&&re.ph=='select',{ferm,re});
 // ---- 9. après rafraîchissement de la page ----
 await p.reload();await W(2500);const rel=await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const t=N.arcade&&N.arcade.pinball&&N.arcade.pinball.tables;return t?Object.fromEntries(Object.entries(t).map(([k,v])=>[k,v.best])):null});
 ok(T('9 records conservés après rafraîchissement de la page'),rel&&rel.dino==8000&&rel.alien==3333&&rel.space==2222&&rel.city==20,rel);
 // ---- 16. récompenses : combo, série de bumpers, tir d'adresse, jackpot, boule sauvée ----
 await ouvrir(p);await E(()=>{ARC.modules.pinball._state.sel=0});await p.keyboard.press('Enter');await W(300);
 const rw=await E(()=>{const M=ARC.modules.pinball,P=M._state,TB=M._table,u=()=>M.update(1/60,{okN:P.okN});window.__fx=[];if(!JEUSON.fx.__spy){const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)};JEUSON.fx.__spy=1}P.mute=false;const r={};
  // combo : trois cibles touchées coup sur coup
  P.comboT=0;P.combo=0;const st=TB.S.filter(s=>s.type=='stand');let s0=P.score;for(const t of st){P.ball={x:(t.a[0]+t.b[0])/2+(t.a[0]<100?14:-14),y:(t.a[1]+t.b[1])/2,vx:t.a[0]<100?-520:520,vy:0,st:'play'};for(let i=0;i<4;i++)u()}r.combo=P.combo;r.comboPts=P.score-s0;
  // série de bumpers
  P.chain=0;P.chainT=0;const bm=TB.C.find(c=>c.type=='bumper');for(let k=0;k<5;k++){P.ball={x:bm.x,y:bm.y-bm.r-8,vx:0,vy:300,st:'play'};for(let i=0;i<3;i++)u()}r.serie=P.chain;
  // tir d'adresse : le passage clignotant pris juste après le lancement
  P.phase='jeu';P.paused=false;P.balls=3;P.jack=0;P.jackReady=false;P.skill=1;P.skillT=3;P.lastLaneIn=-1;s0=P.score;P.ball={x:TB.lanes[1],y:52,vx:0,vy:-200,st:'play'};for(let i=0;i<6;i++)u();r.skill=P.score-s0>=5000&&window.__fx.includes('pbSkill');
  // jackpot : jauge pleine puis rampe
  P.phase='jeu';P.paused=false;P.balls=3;P.jack=3;P.jackReady=false;P.msg=null;M._state.mult=1;const j0=P.jackN;s0=P.score;
  P.lit.lane=P.lit.lane.map(()=>1);P.lit.lane[0]=0;P.lastLaneIn=-1;P.skillT=0;P.ball={x:TB.lanes[0],y:52,vx:0,vy:-200,st:'play'};for(let i=0;i<6;i++)u();r.pret=P.jackReady&&window.__fx.includes('pbJackReady');
  P.phase='jeu';P.paused=false;P.balls=3;P.ball={x:20,y:146,vx:0,vy:-420,st:'play'};for(let i=0;i<240&&P.jackN==j0;i++)u();r.jackpot=P.jackN==j0+1&&P.score-s0>=20000&&!!P.big&&window.__fx.includes('pbJackpot')&&P.level==1;
  // boule sauvée : perdue dans les secondes qui suivent le lancement
  P.phase='jeu';const b0=P.balls;P.ballSave=3;P.ball={x:100,y:430,vx:0,vy:300,st:'play'};u();r.sauvee=P.balls==b0&&P.ball.st=='plunger'&&P.msg&&P.msg.t=='BALL SAVE'&&window.__fx.includes('pbSave');
  P.phase='jeu';P.ball={x:184,y:390,vx:0,vy:0,st:'plunger'};return r});
 ok(T('16 récompenses : combo de cibles, série de bumpers, tir d’adresse, jauge et JACKPOT (avec montée sonore), boule sauvée'),rw.combo>=3&&rw.comboPts>0&&rw.serie>=5&&rw.skill&&rw.pret&&rw.jackpot&&rw.sauvee,rw);
 // ---- 17. palettes : la boule ne les traverse jamais, même très vite ----
 const pf=await E(()=>{const M=ARC.modules.pinball,P=M._state,F=M._flip;let n=0,trav=0;P.mute=true;
  for(let i=0;i<2;i++)for(const up of[false,true])for(let k=0;k<120;k++){const f=F[i],u=.15+.8*Math.random(),a=up?f.up:f.rest;P.fl[i].a=a;P.fl[1-i].a=F[1-i].rest;const px=f.px+Math.cos(a)*f.len*u,py=f.py+Math.sin(a)*f.len*u;
   P.phase='jeu';P.balls=3;P.ball={x:px,y:py-16,vx:(Math.random()-.5)*200,vy:600+Math.random()*300,st:'play'};n++;
   for(let s=0;s<12;s++){M.update(1/120,{okN:P.okN,left:up&&i==0?1:0,right:up&&i==1?1:0});const b=P.ball;const g=a,ex=Math.cos(g),ey=Math.sin(g),rx=b.x-f.px,ry=b.y-f.py,along=rx*ex+ry*ey,side=-rx*ey+ry*ex;if(along>2&&along<f.len-2&&side<(i?-1:1)*0&&Math.abs(side)<3){trav++;break}}}
  P.mute=false;P.phase='jeu';P.ball={x:184,y:390,vx:0,vy:0,st:'plunger'};return{lancers:n,traversees:trav}});
 ok(T('17 précision : 480 boules lancées vite sur les palettes (levées ou au repos), aucune ne passe au travers'),pf.lancers==480&&pf.traversees==0,pf);
 // ---- 18. rendu moderne haute résolution (plus de pixel art) ----
 const vis=await E(()=>{const P=ARC.modules.pinball._state;P.ball={x:100,y:200,vx:500,vy:-500,st:'play'};P.trail=[[90,210],[94,206],[97,203],[99,201]];arcDraw();const H=AX.hi;return{hautRes:!!H&&!H.hidden,densite:H?+(H.width/AX.hi.getBoundingClientRect().width).toFixed(2):0,trainee:P.trail.length,texte:(P.drawn||[]).length}});
 ok(T('18 rendu vectoriel haute résolution (toile à la densité de l’écran, jusqu’à 2×), traînée lumineuse de la boule'),vis.hautRes&&vis.densite>=(tel?1.9:1)&&vis.trainee>=3&&vis.texte>0,vis);
 // ---- 19. fluidité en pleine partie ----
 await E(()=>{const P=ARC.modules.pinball._state;P.ball={x:100,y:150,vx:300,vy:200,st:'play'}});
 const fps=await E(()=>new Promise(r=>{let n=0,worst=0,last=performance.now();const t0=last;const f=()=>{const now=performance.now();worst=Math.max(worst,now-last);last=now;n++;if(now-t0<3000)requestAnimationFrame(f);else r({fps:Math.round(n/3),pireImage:Math.round(worst)})};requestAnimationFrame(f)}));
 ok(T('19 fluidité : au moins 50 images/s en pleine partie'),fps.fps>=50,fps);
 // ---- 20. aucune palette bloquée : perte de focus ou changement d'orientation ----
 const rel2=await E(()=>{const P=ARC.modules.pinball._state;ARC.modules.pinball.pointer('down',P.W*.2,P.H*.6,77);const avant=P.touches.size;dispatchEvent(new Event('orientationchange'));const apres=P.touches.size;ARC.modules.pinball.pointer('down',P.W*.8,P.H*.6,78);dispatchEvent(new Event('blur'));return{avant,apres,blur:P.touches.size}});
 ok(T('20 changement d’orientation ou perte de focus : toutes les palettes sont relâchées'),rel2.avant==1&&rel2.apres==0&&rel2.blur==0,rel2);
 ok(T('15 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/pb_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
