// Tests réels du mini-jeu Bowling (Playwright + Chrome). Usage : node rue/tests/bowling_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const MODE=process.argv[2]||'tel';
const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext(MODE=='pc'?{viewport:{width:1280,height:800}}:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const W=ms=>p.waitForTimeout(ms),E=(f,a)=>p.evaluate(f,a),shot=n=>p.screenshot({path:`${O}/bw_${MODE}_${n}.png`});
await p.goto(JEU);await W(2500);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(800);
await E(()=>{tod=0;streetEnter()});await W(500);
// avance rapide : fait tourner la logique du jeu sans attendre le temps réel
const ff=(n)=>E(n=>{for(let i=0;i<n;i++)bwTick()},n);
const playThrow=async(aim,pw,spin)=>E(([aim,pw,spin])=>{if(BW.phase=='intro'){BW.view=1;BW.phase='aim'}BW.aim=aim;BW.pw=pw;BW.spin=spin;bwThrow();let n=0;while(BW.phase!='aim'&&BW.phase!='end'&&n<2000){bwTick();n++}return{phase:BW.phase,rolls:BW.rolls.slice()}},[aim,pw,spin]);

// 1-2. Ouverture depuis la porte : clic sur le bâtiment, lancement immédiat, sans marche du personnage
const before=await E(()=>{const h=STC.buildings.find(q=>q.id=='maison'),bw=STC.buildings.find(q=>q.id=='bowling');STV.px=h.x+h.door.x+150;STV.cam=Math.max(0,STV.px-STV.W*.3);return{px:STV.px,bw:{x:bw.x,w:bw.w,h:bw.h}}});
await W(2500);const cvb=await p.locator('#stCv').boundingBox();
const tgt=await E(()=>{const b=STC.buildings.find(q=>q.id=='bowling');return{x:(b.x+b.door.x-STV.cam)/STV.W,y:(ST_BASE-50+STV.oy)/STV.H}});
console.log('dbg',tgt,cvb,await E(([x,y])=>{const e=document.elementFromPoint(x,y);return [e&&(e.id||e.className),STV.cam,STV.px]},[cvb.x+tgt.x*cvb.width,cvb.y+tgt.y*cvb.height]));const t0=Date.now();await p.mouse.click(cvb.x+tgt.x*cvb.width,cvb.y+tgt.y*cvb.height);
await p.waitForFunction(()=>BW.on&&curV=='bowling',null,{timeout:3000});const dt=Date.now()-t0;
const st1=await E(()=>({back:BW.back,px:STV.px,stOn:STV.on,phase:BW.phase,place}));await W(250);await shot('01_ouverture');
ok('1 ouverture du bowling par un clic sur sa porte (sans déplacement du personnage)',st1.back.x==before.px&&st1.px==before.px&&!st1.stOn,{before:before.px,st1});
await p.waitForFunction(()=>BW.phase=='aim',null,{timeout:4000});const dAim=Date.now()-t0;
ok('2 lancement immédiat du mini-jeu',dt<800&&dAim<3500,{msAvantScene:dt,msAvantJeu:dAim});await shot('02_visee');

// 3. Aucun personnage : la rue et la pièce sont entièrement recouvertes, le rendu n'utilise jamais le sprite du joueur
const cover=await E(()=>{const r=document.getElementById('bowl').getBoundingClientRect(),top=document.getElementById('topbox').getBoundingClientRect();let n=0,bad=[];
 for(let i=1;i<10;i++)for(let j=1;j<10;j++){const X=r.x+r.width*i/10,Y=r.y+r.height*j/10,e=document.elementFromPoint(X,Y);n++;if(!e||!(e.id=='bwCv'||e.closest('.hud,.lowbar,#status,.frame.low,#bwEnd,.coins,#bMus')))bad.push(e&&(e.id||e.className))}
 const street=document.getElementById('street');return{n,bad,streetHidden:street.hidden||!street.classList.contains('on'),cv:getComputedStyle(document.getElementById('c')).display}});
const src=await E(()=>[bwDraw,bwWall,bwFloor,bwPin,bwBallDraw,bwForeground,bwHud,bwBoard].map(f=>f.toString()).join('\n'));
const usesChar=/sc2|drawFrame|spUpdate|charDraw|SPR\[|N\.look/.test(src);
const same=await E(()=>{const h=()=>{bwDraw();const d=BW.x.getImageData(0,0,BW.W,BW.H).data;let s=0;for(let i=0;i<d.length;i+=7)s=(s*31+d[i])|0;return s};BW.fadeIn=0;const tt=BW.t;const a=h();const old=JSON.stringify(N.look);N.look.g=N.look.g=='f'?'m':'f';spKey='';spUpdate();const b2=h();Object.assign(N.look,JSON.parse(old));spKey='';return a==b2});
ok('3 aucun personnage visible (scène opaque, rendu indépendant du sprite et de la tenue)',cover.bad.length==0&&cover.streetHidden&&!usesChar&&same,{cover,usesChar,same});

// 4. Commandes PC : souris pour viser, clic maintenu pour la puissance, relâcher pour lancer ; clavier
let pc=null;{const r=await p.locator('#bwCv').boundingBox();
 if(MODE=='pc'){await p.mouse.move(r.x+r.width*.2,r.y+r.height*.5);await W(80);const a1=await E(()=>BW.aim);await p.mouse.move(r.x+r.width*.8,r.y+r.height*.5);await W(80);const a2=await E(()=>BW.aim);
  await p.mouse.move(r.x+r.width*.53,r.y+r.height*.5);await p.mouse.down();await W(500);const ch=await E(()=>({ph:BW.phase,pw:BW.pw}));await p.mouse.up();await W(60);const th=await E(()=>({ph:BW.phase,thrown:BW.ball.thrown,vz:BW.ball.vz}));pc={a1,a2,ch,th}}
 else{const a=await E(()=>{const cv=document.getElementById('bwCv'),r=cv.getBoundingClientRect(),ev=(t,x)=>cv.dispatchEvent(new PointerEvent(t,{pointerType:'mouse',clientX:r.x+r.width*x,clientY:r.y+r.height*.5,bubbles:true,pointerId:1}));ev('pointermove',.2);const a1=BW.aim;ev('pointermove',.8);const a2=BW.aim;ev('pointerdown',.53);return{a1,a2,ph:BW.phase}});
  await W(500);const pw=await E(()=>BW.pw);await E(()=>{const cv=document.getElementById('bwCv'),r=cv.getBoundingClientRect();cv.dispatchEvent(new PointerEvent('pointerup',{pointerType:'mouse',clientX:r.x+r.width*.53,clientY:r.y+r.height*.5,bubbles:true,pointerId:1}))});
  const th=await E(()=>({ph:BW.phase,thrown:BW.ball.thrown,vz:BW.ball.vz}));pc={a1:a.a1,a2:a.a2,ch:{ph:a.ph,pw},th}}}
await W(900);await shot('04_lancer');await ff(900);
// clavier : flèches = direction, haut/bas = effet, Espace maintenu = puissance
await p.waitForFunction(()=>BW.phase=='aim',null,{timeout:8000});
const a0=await E(()=>BW.aim);await p.keyboard.down('ArrowLeft');await W(300);await p.keyboard.up('ArrowLeft');const aL=await E(()=>BW.aim);
await p.keyboard.press('ArrowDown');const spK=await E(()=>BW.spin);await p.keyboard.press('ArrowUp');
await p.keyboard.down('Space');await W(400);const chK=await E(()=>BW.phase);await p.keyboard.up('Space');await W(50);const thK=await E(()=>BW.phase);
ok('4 commandes PC : souris (visée), clic maintenu (puissance), relâcher (lancer) + clavier',pc.a1<-.2&&pc.a2>.2&&pc.ch.ph=='charge'&&pc.ch.pw>0&&pc.th.ph=='roll'&&pc.th.vz>4&&aL<a0&&spK==-1&&chK=='charge'&&thK=='roll',{pc,clavier:{a0,aL,spK,chK,thK}});
await ff(900);await p.waitForFunction(()=>BW.phase=='aim',null,{timeout:8000});

// 5. Commandes mobiles : doigt posé = visée + puissance, glisser = viser, relâcher = lancer ; boutons assez grands
const mob=await E(async()=>{const cv=document.getElementById('bwCv'),r=cv.getBoundingClientRect(),ev=(t,x)=>cv.dispatchEvent(new PointerEvent(t,{pointerType:'touch',isPrimary:true,clientX:r.x+r.width*x,clientY:r.y+r.height*.6,bubbles:true,pointerId:7}));
 ev('pointerdown',.3);const d=({ph:BW.phase,aim:BW.aim,touch:BW.touch});ev('pointermove',.55);const m=BW.aim;await new Promise(z=>setTimeout(z,450));const pw=BW.pw;ev('pointerup',.55);return{d,m,pw,ph:BW.phase}});
const sizes=await E(()=>[...document.querySelectorAll('#bwBalls button,#bwRestart,#bwQuit,#bwSpin')].map(e=>{const r=e.getBoundingClientRect();return[e.id||e.textContent.trim(),Math.round(r.width),Math.round(r.height)]}));
ok('5 commandes mobiles (toucher-glisser-relâcher) et boutons de taille suffisante',mob.d.ph=='charge'&&mob.d.touch&&mob.m>mob.d.aim&&mob.pw>0&&mob.ph=='roll'&&sizes.every(s=>s[1]>=36&&s[2]>=(s[0]=='bwSpin'?14:30)),{mob,sizes});
await ff(900);await p.waitForFunction(()=>BW.phase=='aim',null,{timeout:8000});

// 6. Collisions physiques : poche -> quilles renversées dont certaines par d'autres quilles, boule déviée ; gouttière -> 0
const phys=await E(()=>{const run=(aim,spin)=>{bwRack();BW.bi=2;bwNewBall();BW.phase='aim';BW.aim=aim;BW.pw=.75;BW.spin=spin;const touched=new Set();
  const _k=bwKnock;let n=0,vx0=null,vx1=null;bwThrow();vx0=BW.ball.vx;while(n<3000){const b=BW.ball;const before=BW.pins.map(q=>q.up);for(let i=0;i<4;i++){for(const q of BW.pins){if(!q.out&&Math.hypot(q.x-b.x,q.z-b.z)<BW_BR+BW_PR+.02)touched.add(q.n)}bwStep(BW_DT)}n++;if((b.pit||b.z>BW_HEAD+.3)&&!bwMoving()&&n>60)break}
  vx1=BW.ball.vx;const down=BW.pins.filter(q=>!q.up||q.out).map(q=>q.n);return{down,touched:[...touched],byPins:down.filter(n=>!touched.has(n)),gut:BW.ball.gut,dvx:Math.abs(vx1-vx0)}};
 const pocket=run(.1,0),gutter=run(-.95,0),light=run(.35,0);BW.phase='aim';bwRack();bwNewBall();return{pocket,gutter,light}});
ok('6 collisions physiques (boule-quilles, quilles-quilles, déviation, gouttière)',phys.pocket.down.length>=8&&phys.pocket.byPins.length>=3&&phys.pocket.dvx>.01&&phys.gutter.gut&&phys.gutter.down.length==0&&phys.light.down.length>0&&phys.light.down.length<10,phys);

// 7. Strikes et spares : règles officielles (tests du calcul) + détection en jeu
const sc=await E(()=>{const T=(r)=>{const s=bwScore(r);return{tot:s.total,m:s.F.map(o=>o.m.join(''))}};
 return{parfait:T(Array(12).fill(10)),spares:T(Array(21).fill(5)),neuf:T(Array(10).fill([9,0]).flat()),zero:T(Array(20).fill(0)),exemple:T([10,7,3,9,0,10,0,8,8,2,0,6,10,10,10,8,1]),fin:T([...Array(18).fill(0),10,7,3]),dixieme:T([...Array(18).fill(0),7,3,10]),encours:T([10,10,4])}});
const live=await E(()=>{bwNewGame();BW.view=1;const res=[];const force=(downNs)=>{BW.pins.forEach(q=>{q.was=q.up&&!q.out});BW.pins.forEach(q=>{if(downNs.includes(q.n)){q.up=false;q.out=true}});bwSettle();res.push(BW.msg.t);bwAfterResult()};
 force([1,2,3,4,5,6,7,8,9,10]);force([1,2,3,5,6,8,9]);force([4,7,10]);force([1,2]);force([]);return{res,rolls:BW.rolls,st:{s:BW.stats.strikes,p:BW.stats.spares},tot:bwScore(BW.rolls).total}});
ok('7 calcul des strikes et des spares',sc.parfait.tot==300&&sc.spares.tot==150&&sc.neuf.tot==90&&sc.zero.tot==0&&sc.exemple.tot==167&&sc.fin.tot==20&&sc.dixieme.tot==20&&sc.encours.tot==24&&sc.parfait.m[9]=='XXX'&&sc.spares.m[9]=='5/5'&&sc.exemple.m[0]=='X'&&sc.exemple.m[1]=='7/'&&sc.neuf.m[0]=='9-'
 &&live.res[0]=='STRIKE !'&&live.res[2]=='SPARE !'&&live.st.s==1&&live.st.p==1&&live.tot==10+7+3+7+3+2+2,{sc,live});

// 8. Partie complète jouée avec la vraie physique : 10 frames, score final affiché = calcul officiel
await E(()=>bwNewGame());let guard=0,last;const aims=[.1,.12,-.3,.08,.25,.1,0,.15,-.1,.1,.3,.1,.1,.2,.05,.1,.1,.1,.1,.1,.1];
while(guard<25){last=await playThrow(aims[guard%aims.length],.72,0);guard++;if(last.phase=='end')break}
await W(400);await shot('08_fin');
const fin=await E(()=>({modal:!document.getElementById('bwEnd').hidden,shown:+document.getElementById('bwFinal').textContent,calc:bwScore(BW.rolls).total,pos:bwPos(BW.rolls),rolls:BW.rolls,tab:document.querySelector('#bwTab .tot em').textContent,stats:document.getElementById('bwStats').textContent}));
ok('8 fin de partie après 10 frames : score final, statistiques, rejouer/quitter',fin.modal&&fin.pos.over&&fin.shown==fin.calc&&+fin.tab==fin.calc&&/Strikes/.test(fin.stats)&&/Moyenne/.test(fin.stats),fin);

// 9. Redémarrage : « Rejouer » en fin de partie, « Recommencer » en cours de partie
await p.click('#bwAgain');await W(150);const re1=await E(()=>({rolls:BW.rolls.length,modal:!document.getElementById('bwEnd').hidden,ph:BW.phase,pins:BW.pins.filter(q=>q.up).length}));
await playThrow(.3,.6,0);const mid=await E(()=>BW.rolls.length);await p.click('#bwRestart');await W(100);const re2=await E(()=>({rolls:BW.rolls.length,ph:BW.phase,pins:BW.pins.filter(q=>q.up).length,tab:document.querySelector('#bwTab .tot em').textContent}));
ok('9 redémarrage d’une partie',re1.rolls==0&&!re1.modal&&re1.ph=='aim'&&re1.pins==10&&mid==1&&re2.rolls==0&&re2.pins==10&&re2.tab=='0',{re1,mid,re2});

// 10. Retour : « Quitter » ramène dans la rue, exactement là où était le joueur
await p.click('#bwQuit');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:5000});await W(400);
const back=await E(()=>({px:STV.px,place,st:C.st,bw:BW.on,hidden:document.getElementById('bowl').hidden}));await shot('10_retour');
// et depuis la fenêtre de fin de partie
await E(()=>{const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x;stInteract()});await p.waitForFunction(()=>BW.on,null,{timeout:3000});const px2=await E(()=>BW.back.x);
await E(()=>{BW.rolls=Array(12).fill(10);BW.view=1;BW.phase='end';bwEnd(true)});await p.click('#bwLeave');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:5000});const back2=await E(()=>STV.px);
ok('10 retour dans la rue exactement à la position d’avant',back.px==before.px&&back.place=='street'&&back.st=='street'&&!back.bw&&back.hidden&&back2==px2,{back,before:before.px,px2,back2});

// 11. Rechargement pendant une partie : on retrouve la rue au même endroit
await E(()=>{const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x-5;stInteract()});await W(300);const pxR=await E(()=>BW.back.x);
await p.reload();await W(3200);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});await W(500);
const rl=await E(()=>({on:STV.on,px:STV.px,bw:BW.on}));ok('11 rechargement pendant la partie : retour dans la rue au même endroit',rl.on&&!rl.bw&&Math.abs(rl.px-pxR)<1,{rl,pxR});

// 12. Fluidité, et aucune erreur
await E(()=>{const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x;stInteract()});await W(2200);
const perf=await E(()=>{const t=performance.now();for(let i=0;i<200;i++)bwDraw();return (performance.now()-t)/200});
const fps=await E(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)};requestAnimationFrame(f)}));
ok('12 fluidité du rendu',perf<8&&fps>45,{msParImage:+perf.toFixed(2),fps});
ok('13 aucune erreur JavaScript',errs.length==0,errs);
fs.writeFileSync(`${O}/bw_${MODE}_resultats.json`,JSON.stringify(R,null,1));
console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis ('+MODE+')');await b.close()})();
