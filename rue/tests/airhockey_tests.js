// Tests réels du mini-jeu Air Hockey dans la borne (Playwright + Chrome). Usage : node rue/tests/airhockey_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};

// en jeu : le jeu occupe tout l'écran, la borne n'est plus dessinée
const fullCheck=async(E)=>E(()=>{arcDraw();const L=AX.L,F=L.full,g=AX.gameCv,r=AX.cv.getBoundingClientRect(),k=r.width/L.W,m=AX.x.getImageData(0,0,L.W,L.H).data,gd=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let diff=0,n=0;
 for(let i=0;i<400;i++){const X=Math.floor(Math.random()*F.w),Y=Math.floor(Math.random()*F.h),a=((F.y+Y)*L.W+F.x+X)*4,b=(Y*g.width+X)*4;n++;if(m[a]!=gd[b]||m[a+1]!=gd[b+1]||m[a+2]!=gd[b+2])diff++}
 const vis={l:r.left+F.x*k,t:r.top+F.y*k,r:r.left+(F.x+F.w)*k,b:r.top+(F.y+F.h)*k};return{diff,n,g:[g.width,g.height],F:[F.w,F.h],couvre:vis.l<=.6&&vis.t<=.6&&vis.r>=innerWidth-.6&&vis.b>=innerHeight-.6,state:ARC.state}});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const MODE of['tel','pc']){
const ctx=await b.newContext(MODE=='tel'?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1280,height:800},deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>`[${MODE}] `+s;await boot(p);
await E(()=>{tod=0;streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(600);
// 1. lancement depuis la case AIR HOCKEY : joystick/flèches jusqu'à la case, OK (présentation), OK (JOUER)
for(const k of['ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowLeft','ArrowLeft'])await p.keyboard.press(k);
await E(()=>{const i=ARC.games.findIndex(g=>g.id=='hockey');ARC.sel=i});const sel=await E(()=>ARC.games[ARC.sel].name);
await p.keyboard.press('Enter');await W(200);const info=await E(()=>({st:ARC.state,ready:!!ARC.modules[ARC.games[ARC.info].id]}));await p.keyboard.press('Enter');await W(400);
const l1=await E(()=>({st:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.hockey._state.phase}));await p.screenshot({path:`${O}/ah_${MODE}_01_choix.png`});
ok(T('1 lancement depuis la case AIR HOCKEY (présentation puis JOUER)'),sel=='Air Hockey'&&info.st=='info'&&info.ready&&l1.st=='game'&&l1.cur=='hockey'&&l1.ph=='choix',{sel,info,l1});
// choix de la difficulté au joystick puis OK
await p.keyboard.press('ArrowDown');await W(100);const ch=await E(()=>ARC.modules.hockey._state.ch);await p.keyboard.press('Enter');await W(150);const lv=await E(()=>({lv:ARC.modules.hockey._state.lv,ph:ARC.modules.hockey._state.phase}));
await W(3600);const go=await E(()=>ARC.modules.hockey._state.phase);await p.screenshot({path:`${O}/ah_${MODE}_02_jeu.png`});
// 2-4. la table remplit tout l'écran de la borne ; rien de Little Life ; aucun personnage
const fill=await E(()=>{const S=arcGS(),g=AX.gameCv,d=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let tr=0;for(let i=3;i<d.length;i+=4)if(d[i]<255)tr++;
 const r=AX.cv.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;let bad=0;for(let i=0;i<=16;i++)for(let j=0;j<=16;j++){const e=document.elementFromPoint(Math.min(vw-1,vw*i/16),Math.min(vh-1,vh*j/16));if(e!==AX.cv)bad++}
 const H=ARC.modules.hockey._state;return{S:[S.w,S.h],g:[g.width,g.height],transparent:tr,bad,table:[H.T.TW,H.T.TH],rot:H.rot}});
const src=fs.readFileSync(path.resolve(__dirname,'../jeux/airhockey.js'),'utf8');
const fc=await fullCheck(E);ok(T('2a plein écran : dès le lancement, le jeu occupe tout l’écran et la borne disparaît'),fc.diff==0&&fc.couvre&&fc.g[0]==fc.F[0]&&fc.g[1]==fc.F[1]&&fc.state=='game',fc);
ok(T('2-4 la table occupe 100 % de l’écran, sans Little Life derrière ni personnage'),ch==2&&lv.lv=='difficile'&&go=='jeu'&&fill.S[0]==fill.g[0]&&fill.S[1]==fill.g[1]&&fill.transparent==0&&fill.bad==0&&(fill.rot?fill.table[0]==fill.S[1]&&fill.table[1]==fill.S[0]:fill.table[0]==fill.S[0]&&fill.table[1]==fill.S[1])&&!/sc2|drawFrame|N\.look|spUpdate/.test(src),{ch,lv,go,fill});
// 5-6. contrôle au doigt / à la souris : le maillet suit et reste dans sa moitié
const ctl=await E(async()=>{const H=ARC.modules.hockey._state,S=arcGS(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,cv=AX.cv;
 const toScr=(tx,ty)=>H.rot?{x:H.T.TH-ty,y:tx}:{x:tx,y:ty},ev=(t,tx,ty,type)=>{const q=toScr(tx,ty);cv.dispatchEvent(new PointerEvent(t,{pointerType:type,isPrimary:true,pointerId:type=='touch'?9:1,clientX:r.left+(S.x+q.x)*k,clientY:r.top+(S.y+q.y)*k,bubbles:true}))};
 const wait=ms=>new Promise(z=>setTimeout(z,ms)),T=H.T,res={};
 for(const type of['touch','mouse']){H.phase='jeu';H.pause=false;H.p={x:T.x0+T.rp+2,y:T.y0+T.rp+2,vx:0,vy:0};const tx=T.x0+T.pw*.3,ty=T.cy+(T.y1-T.cy)*.6;if(type=='touch')ev('pointerdown',tx,ty,type);ev('pointermove',tx,ty,type);await wait(250);res[type]={dx:Math.abs(H.me.x-tx),dy:Math.abs(H.me.y-ty)};
  ev('pointermove',T.x1-2,T.y0+4,type);await wait(250);res[type+'Haut']={y:H.me.y,lim:T.cy+T.rm,x:H.me.x,xl:T.x1-T.rm};ev('pointerup',0,0,type)}
 return res});
ok(T('5-6 maillet au doigt et à la souris : suit le pointeur, ne franchit jamais la ligne centrale ni les bords'),['touch','mouse'].every(t=>ctl[t].dx<1.5&&ctl[t].dy<1.5&&ctl[t+'Haut'].y>=ctl[t+'Haut'].lim-.01&&ctl[t+'Haut'].x<=ctl[t+'Haut'].xl+.01),ctl);
// 7-8. physique et collisions (simulation accélérée sur la vraie logique du jeu)
const phy=await E(()=>{const H=ARC.modules.hockey._state,T=H.T,M=ARC.modules.hockey;H.pause=false;const out={};
 const step=(n)=>{for(let i=0;i<n;i++)M.update(1/60,{okN:H.okN||0})};
 // frappe : maillet lancé sur un palet immobile
 H.phase='jeu';H.serve=null;H.p={x:T.cx,y:T.cy+T.rm*3,vx:0,vy:0};H.me.x=T.cx;H.me.y=T.y1-T.rm*1.5;H.me.tx=T.cx;H.me.ty=T.cy+T.rm;H.ai.x=T.x0+T.rm;H.ai.y=T.y0+T.rm;
 const hitsBefore=H.stats.hits;step(6);out.frappe={vy:H.p.vy/T.TH,hit:H.stats.hits>hitsBefore};
 // rebond sur la bordure : le palet repart, sans sortir
 H.p={x:T.x1-T.rp-2,y:T.cy+T.TH*.2,vx:T.TH*1.2,vy:0};H.me.tx=T.x0+T.rm;H.me.ty=T.y1-T.rm;step(3);out.rebond={vx:H.p.vx,inside:H.p.x<=T.x1-T.rp+.01};
 // ralentissement progressif et vitesse maximale
 H.p={x:T.cx,y:T.cy+T.TH*.25,vx:T.TH*.5,vy:T.TH*.05};const v0=Math.hypot(H.p.vx,H.p.vy);H.ai.x=T.x0+T.rm;step(30);out.frein=Math.hypot(H.p.vx,H.p.vy)<v0;
 H.p={x:T.cx,y:T.cy+T.rm*2,vx:T.TH*5,vy:0};step(1);out.vmax=Math.hypot(H.p.vx,H.p.vy)<=T.max+1;
 // tir très rapide droit sur un maillet : jamais de traversée
 let pass=0,outside=0,overlap=0;for(let k=0;k<300;k++){H.phase='jeu';H.serve=null;H.me.x=H.me.tx=T.x0+T.rm+Math.random()*(T.pw-2*T.rm);H.me.y=H.me.ty=T.cy+T.rm+Math.random()*(T.y1-T.cy-2*T.rm);H.ai.x=T.cx;H.ai.y=T.y0+T.rm;
  const sy=T.cy+2,an=Math.atan2(H.me.y-sy,H.me.x-T.cx);H.p={x:T.cx,y:sy,vx:Math.cos(an)*T.max,vy:Math.sin(an)*T.max};let crossed=false;
  for(let i=0;i<40;i++){M.update(1/60,{okN:H.okN||0});const p=H.p;if(H.phase!='jeu')break;if(p.x<T.x0+T.rp-.5||p.x>T.x1-T.rp+.5||((p.y<T.y0+T.rp-.5||p.y>T.y1-T.rp+.5)&&Math.abs(p.x-T.cx)>T.gw/2))outside++;
   for(const m of[H.me,H.ai])if(Math.hypot(p.x-m.x,p.y-m.y)<T.rm+T.rp-1)overlap++;if(p.y>H.me.y+T.rm+T.rp&&Math.abs(p.x-H.me.x)<T.rm*.5&&i<6)crossed=true}if(crossed)pass++}
 out.tirs={pass,outside,overlap};H.sc=[0,0];return out});
ok(T('7-8 le palet réagit : frappe, rebond, freinage, vitesse max, aucune traversée ni sortie (300 tirs)'),phy.frappe.hit&&phy.frappe.vy<-.3&&phy.rebond.vx<0&&phy.rebond.inside&&phy.frein&&phy.vmax&&phy.tirs.pass==0&&phy.tirs.outside==0&&phy.tirs.overlap==0,phy);
// 9-10. buts détectés, score, animation, retour au centre, pause courte puis reprise automatique
const goal=await E(async()=>{const H=ARC.modules.hockey._state,T=H.T,M=ARC.modules.hockey,step=n=>{for(let i=0;i<n;i++)M.update(1/60,{okN:H.okN||0})};H.sc=[0,0];
 H.phase='jeu';H.serve=null;H.ai.x=T.x0+T.rm;H.ai.y=T.y0+T.rm;H.me.x=H.me.tx=T.x1-T.rm;H.me.y=H.me.ty=T.y1-T.rm;H.p={x:T.cx,y:T.y0+T.rp+1,vx:0,vy:-T.TH*1.5};step(3);
 const a={sc:H.sc.slice(),ph:H.phase,msg:H.msg&&H.msg.t,flash:!!H.flash,center:[Math.round(H.p.x-T.cx),Math.round(H.p.y-T.cy)]};step(100);const b2={ph:H.phase,center:[Math.round(H.p.x-T.cx),Math.round(H.p.y-T.cy)]};step(62);const c={ph:H.phase,sc:H.sc.slice()};
 H.sc=[1,0];H.phase='jeu';H.serve=null;H.ai.x=T.x0+T.rm;H.me.x=H.me.tx=T.x0+T.rm;H.p={x:T.cx,y:T.y1-T.rp-1,vx:0,vy:T.TH*1.5};step(3);const d={sc:H.sc.slice(),msg:H.msg&&H.msg.t};
 // tir sur le poteau : rebond, pas de but
 step(200);H.phase='jeu';H.serve=null;H.me.x=H.me.tx=T.x0+T.rm;H.ai.x=T.x1-T.rm;H.ai.x=T.x0+T.rm;H.ai.y=T.cy-T.rm;const sc0=H.sc.slice();H.p={x:T.cx+T.gw/2,y:T.y0+T.rp+4,vx:0,vy:-T.TH};step(4);const e={sc:H.sc.slice(),sc0,ph:H.phase};return{a,b:b2,c,d,e}});
ok(T('9-10 buts détectés, score exact, animation, palet au centre, pause courte puis reprise automatique'),goal.a.sc[0]==1&&goal.a.sc[1]==0&&goal.a.ph=='but'&&goal.a.msg=='BUT !'&&goal.a.flash&&goal.b.ph=='compte'&&goal.b.center[0]==0&&goal.b.center[1]==0&&goal.c.ph=='jeu'&&goal.d.sc[0]==1&&goal.d.sc[1]==1&&goal.d.msg=='BUT ADVERSE'&&goal.e.sc[0]==goal.e.sc0[0]&&goal.e.sc[1]==goal.e.sc0[1],goal);
// 11. trois difficultés : vitesses différentes, IA sans téléportation, défense meilleure en difficile
const ai=await E(()=>{const H=ARC.modules.hockey._state,T=H.T,M=ARC.modules.hockey,res={};
 for(const lv of['facile','normal','difficile']){H.lv=lv;let conceded=0,shots=0,maxStep=0,maxV=0;
  for(let k=0;k<60;k++){H.phase='jeu';H.serve=null;H.sc=[0,0];H.ai.x=T.cx;H.ai.y=T.y0+T.rm*2;H.aiT=0;H.me.x=H.me.tx=T.x0+T.rm;H.me.y=H.me.ty=T.y1-T.rm;
   const sx=T.x0+T.rp+Math.random()*(T.pw-2*T.rp),gx=T.cx+(Math.random()-.5)*T.gw*.8,an=Math.atan2(T.y0-(T.cy+T.TH*.1),gx-sx);H.p={x:sx,y:T.cy+T.TH*.1,vx:Math.cos(an)*T.TH*1.1,vy:Math.sin(an)*T.TH*1.1};shots++;
   for(let i=0;i<180;i++){const ox=H.ai.x,oy=H.ai.y;M.update(1/60,{okN:H.okN||0});if(H.phase!='jeu'){if(H.sc[0])conceded++;break}maxStep=Math.max(maxStep,Math.hypot(H.ai.x-ox,H.ai.y-oy)*60/T.TH)}}
  res[lv]={saved:shots-conceded,shots,vmax:+maxStep.toFixed(2),cap:{facile:.95,normal:1.45*1.15,difficile:2.05*1.3}[lv]}}H.lv='difficile';H.sc=[0,0];H.phase='jeu';return res});
ok(T('11 trois difficultés : facile < normal < difficile (vitesse et défense), sans téléportation'),ai.facile.vmax<=ai.facile.cap+.01&&ai.normal.vmax<=ai.normal.cap+.01&&ai.difficile.vmax<=ai.difficile.cap+.01&&ai.facile.vmax<ai.normal.vmax&&ai.normal.vmax<ai.difficile.vmax&&ai.difficile.saved>ai.facile.saved,ai);
// 12. victoire et défaite + écrans
const end=await E(async()=>{const H=ARC.modules.hockey._state,T=H.T,M=ARC.modules.hockey,step=n=>{for(let i=0;i<n;i++)M.update(1/60,{okN:H.okN||0})},r={};
 for(const[who,dir]of[[0,-1],[1,1]]){H.phase='jeu';H.serve=null;H.end=null;H.sc=who==0?[6,3]:[2,6];H.me.x=H.me.tx=T.x0+T.rm;H.ai.x=T.x0+T.rm;H.p={x:T.cx,y:dir<0?T.y0+T.rp+1:T.y1-T.rp-1,vx:0,vy:dir*T.TH*1.5};step(3);
  r[who?'defaite':'victoire']={ph:H.phase,win:H.end&&H.end.win,sc:H.sc.slice()}}
 await new Promise(z=>setTimeout(z,900));return r});
await W(300);await p.screenshot({path:`${O}/ah_${MODE}_12_defaite.png`});
const rec=await E(()=>{const d=ARC.data('hockey');return{wins:d.wins,games:d.games,best:d.best}});
ok(T('12 victoire et défaite (écrans, résultats enregistrés)'),end.victoire.ph=='fin'&&end.victoire.win===true&&end.victoire.sc[0]==7&&end.defaite.ph=='fin'&&end.defaite.win===false&&end.defaite.sc[1]==7&&rec.wins.difficile>=1&&rec.games>=2,{end,rec});
// 13. redémarrage : REJOUER (toucher/clic sur le bouton dans l'écran de la borne)
const tapIn=async(bx)=>{const c=await E(b=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=arcGS();return{x:r.left+(S.x+b.x+b.w/2)*k,y:r.top+(S.y+b.y+b.h/2)*k}},bx);await p.mouse.click(c.x,c.y)};
await tapIn(await E(()=>ARC.modules.hockey._state.endBtns[0]));await W(150);const rs=await E(()=>{const H=ARC.modules.hockey._state;return{ph:H.phase,sc:H.sc,st:ARC.state}});
ok(T('13 REJOUER relance une partie à 0-0'),rs.ph=='compte'&&rs.sc[0]==0&&rs.sc[1]==0&&rs.st=='game',rs);
// pause (bouton à l'écran, bouton OK de la borne, touche P) : le palet est figé
await W(3500);const pb=await E(()=>ARC.modules.hockey._buttons().pause);await tapIn(pb);await W(80);const pz=await E(async()=>{const H=ARC.modules.hockey._state;H.p.vx=H.T.TH*.5;const x0=H.p.x;await new Promise(z=>setTimeout(z,300));return{pause:H.pause,moved:Math.abs(H.p.x-x0)}});
await p.keyboard.press('Enter');await W(80);const pz2=await E(()=>ARC.modules.hockey._state.pause);await p.keyboard.press('KeyP');await W(80);const pz3=await E(()=>ARC.modules.hockey._state.pause);await p.keyboard.press('KeyP');await W(50);
ok(T('13b pause : bouton à l’écran, OK de la borne et touche P'),pz.pause&&pz.moved<.01&&!pz2&&pz3,{pz,pz2,pz3});
// 14. retour au menu des 14 jeux : bouton menu à l'écran, MENU ARCADE en fin de partie, bouton RETOUR de la borne
await p.keyboard.press('KeyP');await W(50);const mb=await E(()=>ARC.modules.hockey._buttons().menu);await tapIn(mb);await W(150);const m1=await E(()=>({st:ARC.state,cur:ARC.cur,n:AX.L.grid.cells.length}));await p.screenshot({path:`${O}/ah_${MODE}_14_menu.png`});
await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='hockey');arcOk();arcOk()});await W(200);await p.keyboard.press('Enter');await W(150);await p.keyboard.press('Escape');await W(150);const m2=await E(()=>ARC.state);
await E(()=>{arcOk();arcOk()});await W(200);await E(()=>{const H=ARC.modules.hockey._state,M=ARC.modules.hockey;H.lv='facile';ARC.modules.hockey.update(1/60,{okN:(H.okN||0)+1})});await W(100);
await E(()=>{const H=ARC.modules.hockey._state,T=H.T,M=ARC.modules.hockey;H.phase='jeu';H.serve=null;H.sc=[2,6];H.me.x=H.me.tx=T.x0+T.rm;H.ai.x=T.x0+T.rm;H.p={x:T.cx,y:T.y1-T.rp-1,vx:0,vy:T.TH*1.5};for(let i=0;i<5;i++)M.update(1/60,{okN:H.okN||0})});await W(900);
await tapIn(await E(()=>ARC.modules.hockey._state.endBtns[1]));await W(150);const m3=await E(()=>ARC.state);
// nettoyage : après la sortie, la touche P n'agit plus, le jeu est réinitialisé
await p.keyboard.press('KeyP');const clean=await E(()=>{const H=ARC.modules.hockey._state;return{api:H.api,pause:H.pause,parts:H.parts.length,phase:H.phase}});
ok(T('14 retour propre et immédiat au menu des 14 jeux (bouton ≡, RETOUR de la borne, MENU ARCADE) + nettoyage'),m1.st=='menu'&&m1.cur==null&&m1.n==14&&m2=='menu'&&m3=='menu'&&clean.api==null&&!clean.pause&&clean.parts==0&&clean.phase=='choix',{m1,m2,m3,clean});
// 15. les autres jeux de la borne sont intacts ; cycle de vie répété sans fuite
const others=await E(()=>{const r=[];ARC.games.forEach((g,i)=>{if(g.id=='hockey')return;ARC.sel=i;arcOk();r.push(ARC.state=='info'&&(['pinball','racing','mole','maze'].includes(g.id)?!!ARC.modules[g.id]:!ARC.modules[g.id]));arcBack()});
 const t0=performance.now();for(let k=0;k<30;k++){ARC.sel=ARC.games.findIndex(g=>g.id=='hockey');arcOk();arcOk();arcBack()}return{ok:r.every(Boolean),n:r.length,st:ARC.state,ms:Math.round(performance.now()-t0)}});
ok(T('15 les 13 autres cases fonctionnent (Pinball, Mini Racing, Whack-a-Mole et Maze Runner prêts, les autres en développement) ; 30 ouvertures/fermetures sans erreur'),others.ok&&others.n==13&&others.st=='menu',others);
const perf=await E(()=>{const M=ARC.modules.hockey,H=M._state;ARC.sel=ARC.games.findIndex(g=>g.id=='hockey');arcOk();arcOk();M.update(1/60,{okN:(H.okN||0)+1});const t=performance.now();for(let i=0;i<200;i++){M.update(1/60,{okN:H.okN});arcDraw()}const ms=(performance.now()-t)/200;arcBack();return ms});
ok(T('16 boucle de jeu fluide et aucune erreur JavaScript'),perf<8&&errs.length==0,{msParImage:+perf.toFixed(2),errs});
await ctx.close()}
fs.writeFileSync(`${O}/ah_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
