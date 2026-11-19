// Tests réels du mini-jeu Mini Racing dans la borne (Playwright + Chrome). Usage : node rue/tests/racing_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,500):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
const fullCheck=async(E)=>E(()=>{arcDraw();const L=AX.L,F=L.full,g=AX.gameCv,r=AX.cv.getBoundingClientRect(),k=r.width/L.W,m=AX.x.getImageData(0,0,L.W,L.H).data,gd=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let diff=0;
 for(let i=0;i<400;i++){const X=Math.floor(Math.random()*F.w),Y=Math.floor(Math.random()*F.h),a=((F.y+Y)*L.W+F.x+X)*4,b=(Y*g.width+X)*4;if(m[a]!=gd[b]||m[a+1]!=gd[b+1]||m[a+2]!=gd[b+2])diff++}
 const vis={l:r.left+F.x*k,t:r.top+F.y*k,r:r.left+(F.x+F.w)*k,b:r.top+(F.y+F.h)*k};return{diff,couvre:vis.l<=.6&&vis.t<=.6&&vis.r>=innerWidth-.6&&vis.b>=innerHeight-.6,state:ARC.state}});
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 // espion des effets sonores
 await E(()=>{window.__fx=[];const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)}});
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(500);
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='racing')});await p.keyboard.press('Enter');await W(150);await p.keyboard.press('Enter');await W(500);
 const S=()=>ARC.modules.racing._state;
 const touch=(t,sx,sy,id)=>E(([t,sx,sy,id])=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=arcGS();AX.cv.dispatchEvent(new PointerEvent(t,{pointerType:'touch',isPrimary:id==1,pointerId:id,clientX:r.left+(S.x+sx)*k,clientY:r.top+(S.y+sy)*k,bubbles:true}))},[t,sx,sy,id]);
 const st0=await E(()=>({st:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.racing._state.phase,mus:JEUSON.playing()}));await p.screenshot({path:`${O}/rc_${mode}_01_depart.png`});
 const fc=await fullCheck(E);ok(T('0 lancement depuis la case MINI RACING : écran de départ, plein écran, borne invisible'),st0.st=='game'&&st0.cur=='racing'&&st0.ph=='start'&&fc.diff==0&&fc.couvre,{st0,fc});
 // JOUER
 if(tel){const b0=await E(()=>ARC.modules.racing._state.startBtn);await touch('pointerdown',b0.x+4,b0.y+4,1);await touch('pointerup',b0.x+4,b0.y+4,1)}else await p.keyboard.press('Enter');
 await W(200);const c1=await E(()=>({ph:ARC.modules.racing._state.phase,l:ARC.modules.racing._state.lives}));await W(300);await p.screenshot({path:`${O}/rc_${mode}_02_compte.png`});await W(3300);
 const c2=await E(()=>({ph:ARC.modules.racing._state.phase,mus:JEUSON.playing(),fx:window.__fx.filter(n=>n=='rcBeep').length}));
 ok(T('1 départ : compte à rebours 3-2-1-GO avec bips, 3 vies, musique synthwave'),c1.ph=='count'&&c1.l==3&&c2.ph=='run'&&c2.mus=='racing'&&c2.fx>=4,{c1,c2});
 // isoler du trafic pour les tests de déplacement
 const calme=()=>E(()=>{const R=ARC.modules.racing._state;R.traffic=[];R.items=[];R.spawnD=1e9;R.itemD=1e9;R.nitroD=1e9;R.shieldD=1e9;R.inv=0});await calme();
 const px=()=>E(()=>ARC.modules.racing._state.p.x);
 let x0=await px();await p.keyboard.down('ArrowLeft');await W(300);await p.keyboard.up('ArrowLeft');let x1=await px();await p.keyboard.down('ArrowRight');await W(500);await p.keyboard.up('ArrowRight');let x2=await px();
 let tl=null;if(tel){const L=await E(()=>ARC.modules.racing._state.L);const a=await px();await touch('pointerdown',L.bL.x+10,L.bL.y+10,2);await W(300);await touch('pointerup',L.bL.x+10,L.bL.y+10,2);const bb=await px();
  await touch('pointerdown',L.bR.x+10,L.bR.y+10,3);await W(300);await touch('pointerup',L.bR.x+10,L.bR.y+10,3);const c=await px();
  await touch('pointerdown',L.rx0+L.lane*.5,L.py,4);await W(500);const d=await px();await touch('pointerup',L.rx0+L.lane*.5,L.py,4);tl={a,bb,c,d,cible:L.rx0+L.lane*.5}}
 const bord=await E(()=>{const R=ARC.modules.racing._state,L=R.L;for(let i=0;i<80;i++)R.update?0:0;return{lo:L.rx0,hi:L.rx1}});await p.keyboard.down('ArrowLeft');await W(1500);await p.keyboard.up('ArrowLeft');const xl=await px();
 ok(T('2 déplacements gauche/droite (clavier'+(tel?', boutons ◀ ▶, glisser':'')+'), la voiture reste sur la route'),x1<x0-5&&x2>x1+5&&xl>=bord.lo&&(!tel||(tl.bb<tl.a-5&&tl.c>tl.bb+5&&Math.abs(tl.d-tl.cible)<3)),{x0,x1,x2,xl,bord,tl});
 // accélérer / freiner
 const kmh=()=>E(()=>ARC.modules.racing._state.p.kmh);await W(800);const v0=await kmh();await p.keyboard.down('ArrowUp');await W(1500);const v1=await kmh();await p.keyboard.up('ArrowUp');await p.keyboard.down('ArrowDown');await W(1500);const v2=await kmh();await p.keyboard.up('ArrowDown');
 ok(T('3 haut accélère, bas freine'),v1>v0+5&&v2<v1-15,{v0,v1,v2});
 // nitro
 await W(1000);await E(()=>{ARC.modules.racing._state.nitro=1});const n0=await kmh();await p.keyboard.press('Enter');await W(80);const nOn=await E(()=>ARC.modules.racing._state.nOn);await W(1200);const n1=await kmh();const g1=await E(()=>ARC.modules.racing._state.nitro);
 await p.screenshot({path:`${O}/rc_${mode}_03_nitro.png`});await W(2500);const nEnd=await E(()=>({on:ARC.modules.racing._state.nOn,g:ARC.modules.racing._state.nitro}));
 let tn=null;if(tel){await E(()=>{const R=ARC.modules.racing._state;R.nitro=.6;R.nOn=false});const L=await E(()=>ARC.modules.racing._state.L);await touch('pointerdown',L.bN.x,L.bN.y,5);await W(120);tn=await E(()=>ARC.modules.racing._state.nOn);await touch('pointerup',L.bN.x,L.bN.y,5);}
 await E(()=>{const R=ARC.modules.racing._state;R.nitro=.1;R.nOn=false});await p.keyboard.press('Enter');await W(80);const nVide=await E(()=>ARC.modules.racing._state.nOn);
 const fxN=await E(()=>window.__fx.includes('rcNitro'));
 ok(T('4 nitro : activation (A/Entrée'+(tel?', bouton NITRO':'')+'), vitesse +, jauge qui se vide, refus si jauge vide, son'),nOn&&n1>n0*1.3&&g1<1&&!nEnd.on&&nEnd.g<.05&&!nVide&&fxN&&(!tel||tn),{n0,n1,g1,nEnd,nVide,tn});
 // bonus
 const bonus=await E(async()=>{const R=ARC.modules.racing._state,L=R.L;const s0=R.score;R.nitro=0;R.items=[{kind:'coin',x:R.p.x,y:L.py},{kind:'nitro',x:R.p.x,y:L.py-2},{kind:'shield',x:R.p.x,y:L.py-4}];await new Promise(r=>setTimeout(r,150));return{ds:Math.round(R.score-s0),coins:R.coins,nitro:R.nitro,shield:R.shield,items:R.items.length,fx:['rcCoin','rcNitroGet','rcShieldGet'].map(n=>window.__fx.includes(n))}});
 await p.screenshot({path:`${O}/rc_${mode}_04_bouclier.png`});
 ok(T('5 bonus : pièce (+50), recharge nitro, bouclier 8 s, avec sons'),bonus.ds>=250&&bonus.coins==1&&bonus.nitro>=.45&&bonus.shield>7&&bonus.items==0&&bonus.fx.every(Boolean),bonus);
 // collisions avec chaque type de véhicule
 const coll=await E(async()=>{const R=ARC.modules.racing._state,L=R.L,res={};const wait=ms=>new Promise(r=>setTimeout(r,ms));
  // bouclier : absorbe le choc
  R.traffic=[{type:'berline',lane:1,to:null,x:R.p.x,y:L.py,kmh:R.p.kmh,col:'#e63946',passed:false,blink:0,hit:false,spin:0}];await wait(80);res.bouclier={vies:R.lives,shield:R.shield,hit:R.traffic[0]&&R.traffic[0].hit};
  for(const t of['citadine','berline','sportive','camion']){R.inv=0;R.shield=0;R.traffic=[{type:t,lane:1,to:null,x:R.p.x,y:L.py,kmh:R.p.kmh,col:'#2d6cdf',passed:false,blink:0,hit:false,spin:0}];const v=R.lives;if(v<=1)R.lives=3;const v0=R.lives;await wait(80);res[t]={avant:v0,apres:R.lives,inv:R.inv>1,hit:R.traffic[0]&&R.traffic[0].hit};if(t=='berline'){R.traffic=[{type:'camion',lane:1,to:null,x:R.p.x,y:L.py,kmh:R.p.kmh,col:'#2d6cdf',passed:false,blink:0,hit:false,spin:0}];const w0=R.lives;await wait(80);res.invincible={avant:w0,apres:R.lives}}}
  res.fx=window.__fx.includes('rcCrash')&&window.__fx.includes('rcShieldHit');res.parts=R.parts.length;R.traffic=[];return res});
 ok(T('6 collisions réelles : citadine, berline, sportive, camion (−1 vie, clignotement, débris, son) ; bouclier absorbe ; invincibilité après choc'),coll.bouclier.vies>=1&&coll.bouclier.shield==0&&coll.bouclier.hit&&['citadine','berline','sportive','camion'].every(t=>coll[t].apres==coll[t].avant-1&&coll[t].inv&&coll[t].hit)&&coll.invincible.apres==coll.invincible.avant&&coll.fx&&coll.parts>0,coll);
 // dépassements, combo, phases
 const dep=await E(async()=>{const R=ARC.modules.racing._state,L=R.L;R.inv=0;R.lives=3;const s0=R.score,p0=R.pass;R.combo=0;const far=R.p.x<L.rx0+L.lane*2?3:0;
  for(let i=0;i<6;i++)R.traffic.push({type:'citadine',lane:far,to:null,x:L.rx0+L.lane*(far+.5),y:L.py-L.carH*(1+i*.2),kmh:10,col:'#9fd36a',passed:false,blink:0,hit:false,spin:0});
  await new Promise(r=>setTimeout(r,1800));return{pass:R.pass-p0,combo:R.combo,ds:Math.round(R.score-s0),vies:R.lives,fx:window.__fx.includes('rcPass')&&window.__fx.includes('rcCombo')}});
 ok(T('7 dépassements : +10 points chacun, série sans collision = combo'),dep.pass>=6&&dep.combo>=5&&dep.ds>=60&&dep.vies==3&&dep.fx,dep);
 const ph=await E(async()=>{const R=ARC.modules.racing._state,out=[];for(const d of[900,2600,5100]){R.dist=d;await new Promise(r=>setTimeout(r,80));out.push(R.ph)}return{out,fx:window.__fx.includes('rcPhase')}});
 await E(()=>{ARC.modules.racing._state.spawnD=0});await W(1500);await p.screenshot({path:`${O}/rc_${mode}_05_expert.png`});
 const pe=await E(()=>({ph:ARC.modules.racing._state.ph,n:ARC.modules.racing._state.traffic.length}));
 ok(T('8 phases Début → Intermédiaire → Avancé → Expert selon la distance'),ph.out.join()=='1,2,3'&&ph.fx&&pe.ph==3&&pe.n>0,{ph,pe});
 // pause / reprise, son
 await p.keyboard.press('KeyP');await W(150);const pa=await E(()=>{const R=ARC.modules.racing._state;return{ph:R.phase,d:R.dist}});await W(400);const pa2=await E(()=>ARC.modules.racing._state.dist);await p.screenshot({path:`${O}/rc_${mode}_06_pause.png`});
 await p.keyboard.press('ArrowDown');await W(60);await p.keyboard.press('Enter');await W(80);const son1=await E(()=>ARC.modules.racing._state.son);await p.keyboard.press('Enter');await W(60);await p.keyboard.press('Enter');await W(60);const son0=await E(()=>({son:ARC.modules.racing._state.son,saved:ARC.data('racing').son}));
 await p.keyboard.press('ArrowUp');await W(60);await p.keyboard.press('Enter');await W(150);const pr=await E(()=>ARC.modules.racing._state.phase);
 ok(T('9 pause (P) gèle la course, réglage du son (tout / effets seuls / coupé, mémorisé), reprise'),pa.ph=='pause'&&Math.abs(pa2-pa.d)<1&&son1==1&&son0.son==0&&son0.saved==0&&pr=='run',{pa,pa2,son1,son0,pr});
 // fin de partie, score et record
 await E(()=>{const R=ARC.modules.racing._state;R.score=123456+Math.random()*10;R.dist=5432;R.lives=1;R.inv=0;R.shield=0;R.traffic=[{type:'camion',lane:1,to:null,x:R.p.x,y:R.L.py,kmh:R.p.kmh,col:'#fff',passed:false,blink:0,hit:false,spin:0}]});
 await W(2800);const ov=await E(()=>{const R=ARC.modules.racing._state;return{ph:R.phase,rec:R.over&&R.over.rec,best:ARC.data('racing').best,ls:localStorage.getItem(Object.keys(localStorage).find(k=>(localStorage.getItem(k)||'').includes('"racing"'))||'')}});await p.screenshot({path:`${O}/rc_${mode}_07_gameover.png`});
 const persiste=ov.ls&&ov.ls.includes('"best":'+ov.best);
 ok(T('10 vies à 0 → GAME OVER, score, distance, nouveau record enregistré et sauvegardé'),ov.ph=='over'&&ov.rec&&ov.best>=123456&&persiste&&(await E(()=>window.__fx.includes('rcOver'))),{ph:ov.ph,rec:ov.rec,best:ov.best,persiste});
 // REJOUER
 await W(300);await p.keyboard.press('Enter');await W(200);const rj=await E(()=>{const R=ARC.modules.racing._state;return{ph:R.phase,l:R.lives,s:R.score}});
 ok(T('11 REJOUER relance une course (3 vies, score à 0)'),rj.ph=='count'&&rj.l==3&&rj.s==0,rj);
 // retour à la salle d'arcade depuis le game over
 await E(()=>{const R=ARC.modules.racing._state;R.phase='run';R.lives=1;R.inv=0;R.shield=0;R.score=5;R.traffic=[{type:'camion',lane:1,to:null,x:R.p.x,y:R.L.py,kmh:R.p.kmh,col:'#fff',passed:false,blink:0,hit:false,spin:0}]});await W(2900);
 if(tel){const bt=await E(()=>ARC.modules.racing._state.overBtns[1]);await touch('pointerdown',bt.x+4,bt.y+4,9);await touch('pointerup',bt.x+4,bt.y+4,9)}else{await p.keyboard.press('ArrowDown');await W(60);await p.keyboard.press('Enter')}
 await W(300);const back=await E(()=>({st:ARC.state,cur:ARC.cur,on:ARC.on,mus:JEUSON.playing(),eng:!!ARC.modules.racing._state.eng,best:ARC.data('racing').best}));await p.screenshot({path:`${O}/rc_${mode}_08_retour.png`});
 ok(T('12 RETOUR À LA SALLE D’ARCADE : menu de sélection, musique et moteur coupés, record conservé (pas écrasé par 5)'),back.st=='menu'&&back.cur==null&&back.on&&back.mus!='racing'&&!back.eng&&back.best>=123456,back);
 // relancer et quitter avec RETOUR de la borne en pleine course : tout est nettoyé
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='racing')});await p.keyboard.press('Enter');await W(150);await p.keyboard.press('Enter');await W(200);await p.keyboard.press('Enter');await W(800);
 const mid=await E(()=>ARC.modules.racing._state.phase);await p.keyboard.press('Escape');await W(200);const clean=await E(()=>({st:ARC.state,mus:JEUSON.playing(),eng:!!ARC.modules.racing._state.eng,tr:ARC.modules.racing._state.traffic.length}));
 ok(T('13 quitter en pleine course : retour au menu, sons et animations nettoyés'),mid=='count'||mid=='run'?clean.st!='game'&&clean.mus!='racing'&&!clean.eng&&clean.tr==0:false,{mid,clean});
 // record conservé après rechargement
 await p.reload();await W(2500);const rel=await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}return N.arcade&&N.arcade.racing&&N.arcade.racing.best});
 ok(T('14 record conservé après rechargement de la page'),rel>=123456,{rel});
 ok(T('15 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/rc_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
