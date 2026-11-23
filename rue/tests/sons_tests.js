// Tests des sons et musiques des mini-jeux. Usage : node rue/tests/sons_tests.js [bowling|pinball|tout]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const QUI=process.argv[2]||'tout';const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await p.goto(JEU);await W(2500);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(600);
// compteur d'effets + mesure du niveau réel de sortie (analyseur branché sur le mélangeur des mini-jeux)
await E(()=>{window.__fx={};const f=JEUSON.fx;JEUSON.fx=function(n,k,g){window.__fx[n]=(window.__fx[n]||0)+1;return f.call(this,n,k,g)};startAudio();
 const c=JEUSON.ctx();window.__an=c.createAnalyser();window.__an.fftSize=2048;JEUSON.sfx().connect(window.__an);
 window.__lvl=()=>{const d=new Float32Array(2048);window.__an.getFloatTimeDomainData(d);let m=0;for(const v of d)m=Math.max(m,Math.abs(v));return m}});
const lvlMusic=()=>E(async()=>{const c=JEUSON.ctx(),an=c.createAnalyser();an.fftSize=2048;const st=JEUSON._state();// branche l'analyseur sur la sortie générale
 const g=c.createGain();return st});
const fx=()=>E(()=>Object.assign({},window.__fx));const reset=()=>E(()=>{window.__fx={}});
if(QUI=='bowling'||QUI=='tout'){
 await E(()=>{streetEnter();const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x;N.mus=true;musOn=true;stInteract()});await W(1500);
 const m1=await E(()=>({th:JEUSON.playing(),st:JEUSON._state(),ll:typeof mg!='undefined'&&mg?mg.gain.value:null}));await W(800);const m2=await E(()=>JEUSON._state());
 ok('B1 musique du bowling lancée à l’entrée, musique de Little Life coupée',m1.th=='bowling'&&m1.st.ducked&&(m1.ll==null||m1.ll<.02)&&m2.step>m1.st.step&&m2.mus>.05,{m1,m2});
 // une vraie partie : lancer réel, quilles, résultat
 await reset();await E(()=>{BW.view=1;BW.phase='aim';BW.aim=.1;BW.pw=0});const cv=await p.locator('#bwCv').boundingBox();
 await p.mouse.move(cv.x+cv.width*.53,cv.y+cv.height*.5);await p.mouse.down();await W(700);await p.mouse.up();
 let peak=0;for(let i=0;i<20;i++){await W(100);peak=Math.max(peak,await E(()=>window.__lvl()))}await W(4000);
 const f1=await fx();const res=await E(()=>({rolls:BW.rolls.slice(),msg:BW.msg&&BW.msg.t}));
 ok('B2 sons d’une partie : charge, lancer, roulement, quilles, chute, résultat (signal audio réel mesuré)',f1.bwCharge>0&&f1.bwThrow==1&&f1.bwPin>0&&f1.bwPinFall>0&&(f1.bwStrike||f1.bwSpare||f1.bwCount||f1.bwMiss)&&peak>.02,{f1,res,peak:+peak.toFixed(3)});
 await reset();await E(()=>{const r=bwAfterResult;});await W(2000);const f2=await fx();
 // gouttière et choix de boule / effet
 await reset();await E(()=>{if(BW.phase!='aim'){BW.phase='aim'}bwNewBall();BW.aim=-1;BW.pw=.6;bwThrow()});await W(2500);await E(()=>{document.querySelector('#bwBalls button[data-i="3"]').click();const r=document.getElementById('bwSpin');r.value=1;r.oninput({target:r})});const f3=await fx();
 ok('B3 gouttière, remise des quilles, clics de l’interface',f3.bwGutter>=1&&f3.bwClick>=1,{f2,f3});
 // fin de partie : jingle
 await reset();await E(()=>{BW.rolls=Array(11).fill(10);BW.stats=BW.stats||{strikes:0,spares:0,gutters:0,first:[],opens:0,splits:0};BW.phase='end';bwEnd(true)});const f4=await fx();
 ok('B4 jingle de fin de partie',f4.bwEnd==1,f4);
 // sortie : musique arrêtée, musique de Little Life rétablie
 await E(()=>bwQuit());await W(900);const q=await E(()=>({th:JEUSON.playing(),st:JEUSON._state(),ll:typeof mg!='undefined'&&mg?mg.gain.value:null,musOn}));
 ok('B5 sortie du bowling : musique arrêtée, musique de Little Life rétablie',q.th==null&&!q.st.ducked&&q.st.mus<.01&&(q.ll==null||!q.musOn||q.ll>.05),q);
 // réglage ♪ coupé : pas de musique de mini-jeu (les effets restent)
 await E(()=>{musOn=false;const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x;stInteract()});await W(1200);const mo=await E(()=>JEUSON._state());await E(()=>{bwQuit();musOn=true});await W(300);
 ok('B6 musique coupée dans Little Life : le bowling reste sans musique',mo.theme=='bowling'&&mo.mus<.01,mo);
}
if(QUI=='pinball'||QUI=='tout'){
 await reset();await E(()=>{if(!STV.on)streetEnter();GAMES.arcade.open({x:500});ARC.sel=ARC.games.findIndex(g=>g.id=='pinball');arcOk();arcOk()});await W(1200);
 const m1=await E(()=>({th:JEUSON.playing(),st:JEUSON._state()}));
 ok('P1 musique arcade du flipper dès l’ouverture du jeu',/^pb_(dino|alien|city|space)$/.test(m1.th)&&m1.st.ducked&&m1.st.mus>.05,m1);
 await p.keyboard.press('Enter');await W(300);await p.keyboard.down('Space');await W(400);await p.keyboard.up('Space');
 let peak=0;for(let i=0;i<30;i++){await W(100);if(i%6==0){await p.keyboard.down('ArrowLeft');await p.keyboard.down('ArrowRight');await W(80);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}peak=Math.max(peak,await E(()=>window.__lvl()))}
 // éléments touchés à coup sûr
 await E(()=>{const M=ARC.modules.pinball,P=M._state,TB=M._table,bm=TB.C.find(c=>c.type=='bumper');P.phase='jeu';P.ball={x:bm.x,y:bm.y-bm.r-10,vx:0,vy:60,st:'play'};for(let i=0;i<8;i++)M.update(1/60,{okN:P.okN});
  const st=TB.S.find(s=>s.type=='stand');P.ball={x:st.a[0]+16,y:(st.a[1]+st.b[1])/2,vx:-500,vy:0,st:'play'};for(let i=0;i<3;i++)M.update(1/60,{okN:P.okN});
  P.ball={x:25,y:160,vx:0,vy:-450,st:'play'};for(let i=0;i<130;i++)M.update(1/60,{okN:P.okN})});await W(300);
 const f=await fx();ok('P2 sons du flipper : lancement, palettes, bumper, cible, rampe (signal audio réel mesuré)',f.pbLaunch>=1&&f.pbFlip>=1&&f.dnBump>=1&&f.dnTarget>=1&&f.pbRamp>=1&&peak>.02,{f,peak:+peak.toFixed(3)});
 await reset();const lost=await E(async()=>{const M=ARC.modules.pinball,P=M._state;P.phase='jeu';P.balls=1;P.ball={x:92,y:395,vx:0,vy:300,st:'play'};for(let i=0;i<130;i++)M.update(1/60,{okN:P.okN});await new Promise(z=>setTimeout(z,300));return{ph:P.phase,lvl:JEUSON._state().mus}});
 const f2=await fx();ok('P3 boule perdue et GAME OVER sonores, musique baissée en fin de partie',f2.dnDrain>=1&&f2.pbOver>=1&&lost.ph=='over',{f2,lost});
 // pause : musique baissée ; sortie : musique coupée
 await E(()=>{const M=ARC.modules.pinball,P=M._state;M.update(1/60,{okN:(P.okN||0)+1})});await W(200);await E(()=>{const P=ARC.modules.pinball._state;P.paused=true});await W(500);const pz=await E(()=>JEUSON._state().mus);
 await E(()=>{ARC.modules.pinball._state.paused=false});await W(500);const rp=await E(()=>JEUSON._state().mus);
 await E(()=>arcBack());await W(700);const out=await E(()=>({th:JEUSON.playing(),st:JEUSON._state()}));
 ok('P4 pause : musique baissée puis rétablie ; retour au menu : musique du flipper arrêtée',pz<rp*.6&&out.th==null&&out.st.mus<.01,{pz,rp,out});
 await E(()=>arcQuit());await W(500);const ll=await E(()=>({d:JEUSON._state().ducked,ll:typeof mg!='undefined'&&mg?mg.gain.value:null}));
 ok('P5 sortie de la borne : musique de Little Life rétablie',!ll.d&&(ll.ll==null||ll.ll>.05),ll);
}
ok('Z aucune erreur JavaScript',errs.length==0,errs);
console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
