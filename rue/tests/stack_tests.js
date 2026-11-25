// Tests réels de PERFECT STACK dans la borne d'arcade (Playwright + Chrome ; téléphone tactile avec vrais touchers, puis ordinateur).
// Usage : node rue/tests/stack_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
async function ouvrir(p){await p.evaluate(()=>{const i=document.getElementById('intro');if(i)i.remove();if(typeof tscr!='undefined')tscr.hidden=true;const b=document.getElementById('crOk2');if(b&&b.offsetParent!==null)b.click()});await p.waitForTimeout(400)}
async function borne(p){await p.evaluate(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await p.waitForTimeout(600)}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});let p=await ctx.newPage();const errs=[];
 const watch=pg=>{pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())})};watch(p);
 await p.addInitScript(()=>{window.__fx=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);return f(n,...a)};const m=JEUSON.music.bind(JEUSON);JEUSON.music=(n)=>{window.__mus=n;return m(n)};clearInterval(iv)}},5)});
 await p.goto(JEU);await p.waitForTimeout(1500);let E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);await ouvrir(p);
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const btnC=id=>E(id=>{const B=ARC.modules.stack._s.btns.find(b=>b.id==id&&!b.o);return B&&{x:B.x+B.w/2,y:B.y+B.h/2,w:B.w,h:B.h}},id);
 const tapB=async(id,ms)=>{const c=await btnC(id);if(!c)return false;const s=await scr(c.x,c.y);await p.touchscreen.tap(s.x,s.y);await W(ms==null?200:ms);return true};
 const S=()=>E(()=>{const M=ARC.modules.stack,s=M._s,G=s.G,d=M._data();return{scr:s.scr,paused:s.paused,h:G&&G.height,score:G&&G.score,combo:G&&G.combo,over:G&&G.over,coins:d.coins,st:Object.assign({},d.st),own:JSON.parse(JSON.stringify(d.own)),eq:Object.assign({},d.eq),st0:ARC.state,cur:ARC.cur&&ARC.cur.id}});
 // pose avec un écart choisi (le bloc mobile est placé à l'écart voulu, puis on pose comme le joueur)
 const dropAt=(delta)=>E(delta=>{const M=ARC.modules.stack,G=M._s.G,c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+delta;else c.z=p.z+delta;return M._tap()},delta);
 // ---- 1. borne : Perfect Stack dans la liste, fiche, JOUER → plein écran haute résolution, rien de Little Life par-dessus ----
 await borne(p);const cat=await E(()=>({n:ARC.games.filter(g=>g.id=='stack').length,name:(ARC.games.find(g=>g.id=='stack')||{}).name,art:!!ARC_ART.stack,mod:!!ARC.modules.stack,hires:!!ARC.modules.stack.hires}));
 const i0=await E(()=>ARC.games.findIndex(g=>g.id=='stack')),cell=await E(i=>{const c=AX.L.grid.cells[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(c.x+c.w/2)*k,y:r.top+(c.y+c.h/2)*k}},i0);
 await p.touchscreen.tap(cell.x,cell.y);await W(250);await p.touchscreen.tap(cell.x,cell.y);await W(400);const jb=await E(()=>{const o=arcInfoLayout(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(o.bx+o.bw/2)*k,y:r.top+(o.by+o.bh/2)*k}});
 await p.touchscreen.tap(jb.x,jb.y);await W(900);
 const fs1=await E(()=>{const H=document.getElementById('arcHi'),r=H.getBoundingClientRect(),pts=[];for(const fx of[.02,.5,.98])for(const fy of[.02,.5,.98])pts.push(document.elementFromPoint(innerWidth*fx,innerHeight*fy));
  return{st:ARC.state,cur:ARC.cur&&ARC.cur.id,hiShown:!H.hidden,hiPx:[H.width,H.height],dev:[Math.round(innerWidth*Math.min(2,devicePixelRatio)),Math.round(innerHeight*Math.min(2,devicePixelRatio))],cover:r.left<=0&&r.top<=0&&r.right>=innerWidth&&r.bottom>=innerHeight,top:pts.every(e=>e&&e.id=='arcCv'),scr:ARC.modules.stack._s.scr}});
 await p.screenshot({path:`${O}/ps_01_accueil.png`});
 ok('1 Perfect Stack dans la borne (nom, vignette), JOUER → plein écran, rendu net en haute densité (2x), toucher reçu par la borne, rien de Little Life par-dessus',
  cat.n==1&&cat.name=='Perfect Stack'&&cat.art&&cat.mod&&cat.hires&&fs1.st=='game'&&fs1.cur=='stack'&&fs1.hiShown&&fs1.hiPx[0]>=fs1.dev[0]-2&&fs1.hiPx[1]>=fs1.dev[1]-2&&fs1.cover&&fs1.top&&fs1.scr=='home',{cat,fs1});
 // ---- 2. accueil ----
 const home=await E(()=>{const s=ARC.modules.stack._s;return s.btns.filter(b=>!b.o).map(b=>b.id)});const demo=await E(()=>ARC.modules.stack._s.D.blocks.length);await W(1500);const demo2=await E(()=>ARC.modules.stack._s.D.blocks.length);
 ok('2 accueil : JOUER, COLLECTION, MISSIONS, retour, son, pièces, meilleur score, aperçu animé de la tour (qui se construit)',['play','coll','miss','quit','mute'].every(i=>home.includes(i))&&demo2>demo,{home,demo,demo2});
 // ---- 3. vrai toucher : la partie démarre, chaque toucher pose le bloc immédiatement (sans attendre l'image suivante) ----
 await tapB('play',300);const t0=await S();const pc=await scr(200,300);
 const over=()=>E(()=>{const G=ARC.modules.stack._s.G,c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+3;else c.z=p.z+3});await over();
 const lat=await E(([x,y])=>new Promise(res=>{const G=ARC.modules.stack._s.G,h0=G.height;const cv=AX.cv;const o={pointerId:7,clientX:x,clientY:y,bubbles:true,pointerType:'touch',isPrimary:true};cv.dispatchEvent(new PointerEvent('pointerdown',o));const h1=G.height;cv.dispatchEvent(new PointerEvent('pointerup',o));res({h0,h1})}),[pc.x,pc.y]);
 await over();await p.touchscreen.tap(pc.x,pc.y);await W(150);const t1=await S();const pz=await btnC('pause');const ps=await scr(pz.x,pz.y);await p.touchscreen.tap(ps.x,ps.y);await W(200);const t2=await S();await tapB('resume',200);
 ok('3 toucher l’écran pose le bloc dans le même évènement (aucune latence) ; le bouton pause ne pose pas de bloc',t0.scr=='play'&&lat.h1===lat.h0+1&&t1.h===lat.h1+1&&t2.paused&&t2.h===t1.h,{lat,t1:{h:t1.h,over:t1.over},t2:{paused:t2.paused,h:t2.h}});
 // ---- 4. découpe exacte : 500 poses à écart aléatoire comparées au calcul d'intervalles ----
 const geo=await E(()=>{const M=ARC.modules.stack,s=M._s,Rr=M._rules,out={n:0,err:[],perfect:0,cut:0,over:0};let seed=11;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  for(let k=0;k<500;k++){if(!s.G||s.G.over||s.G.height>25){M._start()}const G=s.G,c=G.cur,p=G.blocks[G.blocks.length-1],ax=c.axis,size=ax=='x'?c.w:c.d,pc=ax=='x'?p.x:p.z;
   const delta=(rnd()<.2?(rnd()-.5)*2*Rr.PERFECT_TOL*1.6:(rnd()-.5)*size*.9);if(ax=='x')c.x=pc+delta;else c.z=pc+delta;const other=ax=='x'?[c.z,c.d]:[c.x,c.w],h0=G.height,dbr=G.debris.length;
   const r=M._drop(G);out.n++;const lo=Math.max(pc+delta-size/2,pc-size/2),hi=Math.min(pc+delta+size/2,pc+size/2),ov=hi-lo;
   if(Math.abs(delta)<=Rr.PERFECT_TOL){out.perfect++;const t=G.blocks[G.blocks.length-1];if(!r.perfect||(ax=='x'?t.x:t.z)!==pc||G.height!=h0+1)out.err.push(['perfect',delta])}
   else if(ov<Rr.MINW){out.over++;if(!r.over||!G.over)out.err.push(['fin',delta])}
   else{out.cut++;const t=G.blocks[G.blocks.length-1],ts=ax=='x'?t.w:t.d,tc=ax=='x'?t.x:t.z,cut=r.cutB,cs=ax=='x'?cut.w:cut.d,cc=ax=='x'?cut.x:cut.z;
    if(Math.abs(ts-ov)>1e-9||Math.abs(tc-(lo+hi)/2)>1e-9||Math.abs(cs-Math.abs(delta))>1e-9||Math.abs(ts+cs-size)>1e-9||(ax=='x'?[t.z,t.d]:[t.x,t.w])+''!==other+'')out.err.push(['découpe',delta,ts,ov]);
    // le débris est juste à côté de la partie gardée, du côté qui dépassait
    if(Math.abs(Math.abs(cc-tc)-(ts+cs)/2)>1e-9||Math.sign(cc-tc)!==Math.sign(delta))out.err.push(['côté',delta])}}
  // bornes exactes du PERFECT et de la taille minimale
  const edge=(d)=>{M._start();const G=s.G,c=G.cur,p=G.blocks[0];if(c.axis=='x')c.x=p.x+d;else c.z=p.z+d;return M._drop(G)};
  out.tolIn=edge(Rr.PERFECT_TOL).perfect;out.tolOut=edge(Rr.PERFECT_TOL+1e-9).perfect;out.minIn=edge(Rr.BASE-Rr.MINW).over;out.minOut=edge(Rr.BASE-Rr.MINW+1e-9).over;out.miss=edge(Rr.BASE+5).over;return out});
 ok('4 découpe mathématiquement exacte (500 poses) : bloc gardé = intersection, débris = écart, PERFECT si écart ≤ 2,5 exactement (2,5 oui, 2,5+10⁻⁹ non), bloc < 4 ou raté → fin',
  geo.err.length==0&&geo.perfect>20&&geo.cut>100&&geo.tolIn&&!geo.tolOut&&!geo.minIn&&geo.minOut&&geo.miss,geo);
 // ---- 5. combos : paliers, récompenses (bloc agrandi, pièces), effets croissants, ralenti court ----
 const cb=await E(()=>{const M=ARC.modules.stack,s=M._s;M._start();const G=s.G,labs=[],grow=[],slow=[],ring=[],part=[];
  // on rétrécit d'abord le bloc pour voir la croissance
  {const c=G.cur,p=G.blocks[0];if(c.axis=='x')c.x=p.x+30;else c.z=p.z+30;M._drop(G)}
  for(let i=1;i<=15;i++){const c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+1;else c.z=p.z-1;const w0=c.w*c.d,np=G.parts.length;const r=M._drop(G);const t=G.blocks[G.blocks.length-1];
   labs.push(r.tier.lab);grow.push(Math.round(t.w*t.d-w0));slow.push(G.slow>0);ring.push(G.rings.length);part.push(G.parts.length-np);G.slow=0;G.rings=[]}
  return{labs,grow,slow,part,coinsBonus:G.coinsBonus,maxCombo:G.maxCombo}});
 ok('5 combos PERFECT x2, x3, x5, x10, PERFECT STREAK ; bloc agrandi à x3/x5/x10/série, pièces bonus, effets plus nombreux, ralenti seulement aux séries exceptionnelles',
  cb.labs[1]=='PERFECT x2'&&cb.labs[2]=='PERFECT x3'&&cb.labs[4]=='PERFECT x5'&&cb.labs[9]=='PERFECT x10'&&cb.labs[14]=='PERFECT STREAK'&&cb.grow[2]>0&&cb.grow[4]>0&&cb.grow[9]>0&&cb.grow[0]==0&&
  cb.slow[4]&&cb.slow[9]&&cb.slow[14]&&!cb.slow[0]&&!cb.slow[2]&&cb.part[9]>cb.part[0]&&cb.coinsBonus==5+15+20&&cb.maxCombo==15,cb);
 // ralenti réel : le bloc ralentit puis retrouve sa vitesse en moins d'une seconde
 const sl=await E(()=>new Promise(res=>{const M=ARC.modules.stack,s=M._s;M._start();const G=s.G;G.slow=.4;const pos=()=>G.cur.axis=='x'?G.cur.x:G.cur.z,a=pos(),t0=performance.now();
  setTimeout(()=>{const b=pos(),ts1=s.ts;setTimeout(()=>{const ts2=s.ts;res({ts1:+ts1.toFixed(2),ts2:+ts2.toFixed(2)})},900)},250)}));
 ok('6 ralenti très court : la vitesse tombe (~×0,3) puis revient à la normale en moins d’une seconde',sl.ts1<.6&&sl.ts2>.95,sl);
 // ---- 7. vitesse progressive et niveaux ----
 const sp=await E(()=>{const M=ARC.modules.stack,Rr=M._rules;return{v0:Rr.speedAt(0),v20:Rr.speedAt(20),v50:Rr.speedAt(50),v200:Rr.speedAt(200)}});
 const mv=await E(()=>{const M=ARC.modules.stack,s=M._s;M._start();const G=s.G,c=G.cur,f=()=>c.axis=='x'?c.x:c.z,a=f();M._move(G,.1);const d0=Math.abs(f()-a);G.height=40;const b2=f();M._move(G,.1);return{d0,d40:Math.abs(f()-b2)}});
 ok('7 la vitesse augmente avec la hauteur (plafonnée), niveau tous les 10 étages',sp.v0<sp.v20&&sp.v20<sp.v50&&sp.v200<=255&&mv.d40>mv.d0,{sp,mv});
 // ---- 8. vraie partie au doigt jusqu'à la fin : écran de résultat, pièces, record, REJOUER immédiat ----
 await E(()=>{const M=ARC.modules.stack,d=M._data();M._start()});await W(200);const c0=await S();
 for(let i=0;i<6;i++){await dropAt(i%2?.8:-.6);await W(110)}for(let i=0;i<4;i++){await dropAt(i%2?9:-7);await W(110)}
 const pre=await S();await dropAt(400);await W(500);await p.screenshot({path:`${O}/ps_02_chute.png`});await W(1300);const ov=await E(()=>{const s=ARC.modules.stack._s;return{scr:s.scr,o:s.over,btns:s.btns.map(b=>b.id),borne:ARC.data('stack').best}});
 await p.screenshot({path:`${O}/ps_03_fin.png`});const c1=await S();
 const expCoins=ov.o.coinH+ov.o.coinP+ov.o.coinEnd+ov.o.coinRec,mrw=ov.o.newM.reduce((a,m)=>a+m.r,0)+ov.o.newA.reduce((a,m)=>a+(m.r||0),0);
 await tapB('replay',150);const c2=await S();
 ok('8 fin de partie : chute, écran de résultat (score, record, pièces, missions), pièces créditées exactement, record de la borne, REJOUER relance tout de suite',
  pre.h==10&&ov.scr=='over'&&ov.o.height==10&&ov.o.perfects==6&&ov.o.coins==expCoins&&ov.o.coinH==10&&c1.coins-c0.coins==expCoins+mrw&&ov.borne>=ov.o.score&&ov.borne==Math.max(ov.o.prevBest,ov.o.score)&&ov.btns.includes('replay')&&ov.btns.includes('home')&&ov.btns.includes('quit')&&c2.scr=='play'&&c2.h==0,{ov:ov.o,dc:c1.coins-c0.coins,expCoins,mrw,c2:c2.scr});
 // ---- 9. missions du jour ----
 const ms=await E(()=>{const M=ARC.modules.stack,d=M._data();const D=M._daily(),ids=D.ids.slice(),same=M._daily().ids.join()==ids.join();
  const pool=M._cat.MPOOL,kinds=ids.map(i=>pool.find(m=>m.id==i).k);
  // changement de jour → nouvelles missions, progression remise à zéro
  d.daily.day='2000-01-01';const D2=M._daily();
  // une partie qui remplit toutes les missions du jour
  const c0=d.coins,r=M._settle({height:40,perfects:20,maxCombo:6,score:80,coins:100});const r2=M._settle({height:40,perfects:20,maxCombo:6,score:80,coins:100});const r3=M._settle({height:40,perfects:20,maxCombo:6,score:80,coins:100});
  const done=D2.ids.filter(i=>D2.done[i]).length;return{ids,same,kinds:new Set(kinds).size,newDay:D2.day,done,gained:d.coins-c0,rew:D2.ids.reduce((a,i)=>a+pool.find(m=>m.id==i).r,0),again:r2.newM.length+r3.newM.length>=0,missions:d.st.missions}});
 await E(()=>ARC.modules.stack._action({id:'home'}));await W(150);await tapB('miss',300);await p.screenshot({path:`${O}/ps_04_missions.png`});
 ok('9 missions du jour : 3 missions variées, identiques toute la journée, renouvelées le jour suivant, progression réelle, récompenses créditées une seule fois',ms.ids.length==3&&ms.same&&ms.kinds==3&&ms.newDay!='2000-01-01'&&ms.done==3&&ms.gained>=ms.rew,ms);
 // ---- 10. succès et déblocages ----
 const ac=await E(()=>{const M=ARC.modules.stack,d=M._data();d.ach={};d.st.bestC=10;d.own.skin=d.own.skin.filter(i=>i!='rainbow');const c0=d.coins;const r=M._settle({height:1,perfects:0,maxCombo:0,score:1,coins:0});
  const rain=d.own.skin.includes('rainbow');d.st.bestH=Math.max(d.st.bestH,30);const r2=M._settle({height:1,perfects:0,maxCombo:0,score:1,coins:0});return{newA:r.newA.map(a=>a.id||a.t),rain,envs:d.own.env.slice(),gained:d.coins-c0,r2:r2.newA.map(a=>a.t)}});
 await tapB('mtab',200);await E(()=>ARC.modules.stack._action({id:'mtab',k:'ach'}));await W(200);await p.screenshot({path:`${O}/ps_05_succes.png`});
 ok('10 succès débloqués avec récompense (PERFECT x10 offre le bloc Arc-en-ciel) ; univers débloqués par la hauteur atteinte',ac.newA.includes('combo10')&&ac.rain&&ac.gained>0&&ac.envs.includes('sunset')&&ac.envs.includes('ocean'),ac);
 // ---- 11. collection : achats réels, refus sans assez de pièces, objet de succès non achetable, équipement, univers ----
 const co=await E(()=>{const M=ARC.modules.stack,d=M._data();d.coins=300;d.own.skin=['classic'];d.eq.skin='classic';const a=M._buy('skin','chrome'),c1=d.coins;const b2=M._buy('skin','glass'),c2=d.coins-(b2.ach||[]).reduce((q,a)=>q+a.r,0),eq1=d.eq.skin;
  const c=M._buy('skin','rainbow');d.coins=1000;const e=M._buy('env','space');const eq=M._equip('skin','classic');return{a,c1,b2,c2,eq1,c:c.why,e:e.ok,env:d.eq.env,skin:d.eq.skin,own:d.own.skin.slice()}});
 await E(()=>{const M=ARC.modules.stack;M._action({id:'home'});M._action({id:'coll'})});await W(300);
 // achat au doigt : sélection d'une carte puis ACHETER
 const ui=await E(()=>{const M=ARC.modules.stack,d=M._data();d.coins=5000;M._action({id:'tab',k:'skin'});return d.coins});await W(200);
 const card=await E(()=>{const B=ARC.modules.stack._s.btns.find(b=>b.id=='item'&&b.k=='candy');return B&&{x:B.x+B.w/2,y:B.y+B.h/2}});const cs=await scr(card.x,card.y);await p.touchscreen.tap(cs.x,cs.y);await W(250);
 await p.screenshot({path:`${O}/ps_06_collection.png`});await tapB('buy',300);const ui2=await E(()=>{const d=ARC.modules.stack._data();return{coins:d.coins,eq:d.eq.skin,own:d.own.skin.includes('candy')}});
 const mus=await E(()=>window.__mus);
 ok('11 collection : achat (pièces débitées, objet possédé et équipé), refus s’il manque des pièces, Arc-en-ciel seulement par succès, achat au doigt (carte puis ACHETER), univers acheté = fond et musique changés',
  co.a.ok===false&&co.c1==300&&co.b2.ok&&co.c2==50&&co.eq1=='glass'&&co.c=='succès'&&co.e&&co.env=='space'&&ui2.coins==5000-120&&ui2.eq=='candy'&&ui2.own&&mus=='stSpace',{co,ui2,mus});
 // ---- 12. effets de destruction : chacun produit ses débris, nettoyés ensuite ----
 const fxr=await E(()=>new Promise(res=>{const M=ARC.modules.stack,s=M._s,d=M._data(),out={};d.own.fx=['fall','shatter','pixel','spark','confetti'];
  for(const f of d.own.fx){M._equip('fx',f);M._start();const G=s.G,c=G.cur,p=G.blocks[0];if(c.axis=='x')c.x=p.x+30;else c.z=p.z+30;M._drop(G);out[f]={debris:G.debris.length,parts:G.parts.length}}
  M._equip('fx','fall');M._start();const G=s.G;for(let i=0;i<8;i++){const c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+6;else c.z=p.z-6;M._drop(G)}const n0=G.debris.length;setTimeout(()=>{out.clean={n0,n1:G.debris.length,p:G.parts.length};res(out)},4500)}));
 ok('12 effets de destruction réels (Chute, Éclats, Pixels, Étincelles, Confettis) ; débris et particules supprimés une fois tombés',fxr.fall.debris==1&&fxr.shatter.debris>=3&&fxr.pixel.debris>fxr.shatter.debris&&fxr.spark.debris==1&&fxr.confetti.parts>=40&&fxr.clean.n1==0&&fxr.clean.n0>0,fxr);
 // ---- 13. interruptions : arrière-plan → pause automatique ; quitter en pleine partie crédite la partie ----
 const it=await E(()=>{const M=ARC.modules.stack,s=M._s;M._start();for(let i=0;i<5;i++){const G=s.G,c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x;else c.z=p.z;M._drop(G)}
  Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));const pa=s.paused;delete document.hidden;return{pa}});
 await W(300);const it2=await S();await p.screenshot({path:`${O}/ps_07_pause.png`});const g0=it2.st.games;await tapB('quit',400);const it3=await E(()=>{const d=ARC.data('stack');return{st:ARC.state,games:d.st.games,hi:document.getElementById('arcHi').hidden}});
 ok('13 interruption : passage en arrière-plan → pause ; RETOUR À LA BORNE en pleine partie compte la partie (pièces, statistiques) ; toile haute résolution libérée',it.pa&&it2.paused&&it3.st=='menu'&&it3.games==g0+1&&it3.hi,{it,it3});
 // ---- 14. sauvegarde : tout survit à un rechargement complet ----
 const before=await E(()=>{const d=ARC.data('stack');return JSON.stringify({c:d.coins,o:d.own,e:d.eq,s:d.st,a:d.ach,dy:d.daily&&d.daily.ids})});
 await E(()=>save());await W(300);await p.reload();await W(1800);await ouvrir(p);E=(f,a)=>p.evaluate(f,a);
 const after=await E(()=>{const d=N.arcade&&N.arcade.stack;return d&&JSON.stringify({c:d.coins,o:d.own,e:d.eq,s:d.st,a:d.ach,dy:d.daily&&d.daily.ids})});
 ok('14 sauvegarde dans celle de Little Life : pièces, objets, équipement, records, succès et missions identiques après rechargement',before===after&&!!after,{before:before.slice(0,200),same:before===after});
 // ---- 15. portrait et paysage : tout tient à l'écran, rien ne se chevauche ; le toucher marche après rotation ----
 await borne(p);await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='stack');arcOk();arcOk()});await W(500);
 const sizes=[[390,844],[844,390],[320,568],[568,320],[768,1024],[1024,768],[412,915],[915,412]],res=[];
 for(const[w,h]of sizes){await p.setViewportSize({width:w,height:h});await W(300);
  const chk=async(scrn)=>E(scrn=>{const s=ARC.modules.stack._s,L=s.L,B=s.btns.filter(b=>!b.o),in_=b=>b.x>=-1&&b.y>=-1&&b.x+b.w<=L.w+1&&b.y+b.h<=L.h+1,ov=(a,b)=>a.x<b.x+b.w-1&&b.x<a.x+a.w-1&&a.y<b.y+b.h-1&&b.y<a.y+a.h-1;
   const solo=B.filter(b=>b.id!='item'&&b.id!='tab'&&b.id!='mtab');let o=false;for(let i=0;i<solo.length;i++)for(let j=i+1;j<solo.length;j++)if(ov(solo[i],solo[j]))o=true;
   const H=document.getElementById('arcHi');return{scrn,inside:solo.every(in_),overlap:o,minBtn:Math.round(Math.min(...solo.map(b=>Math.min(b.w,b.h)))*L.cpp),hi:Math.abs(H.width/AX.L.W-AX.L.s*Math.min(1,2/devicePixelRatio))<.02}},scrn);
  const a1=await chk('accueil');await E(()=>{const M=ARC.modules.stack;M._start();const G=M._s.G,c=G.cur;if(c.axis=='x')c.x=0;else c.z=0;M._s.G.cur.dir=1});const h0=(await S()).h;await p.touchscreen.tap(w/2,h*.6);await W(150);const h1=(await S()).h;
  await E(()=>{const M=ARC.modules.stack,G=M._s.G,c=G.cur;if(c.axis=='x')c.x+=500;else c.z+=500;M._tap()});await W(2400);const a2=await chk('fin');
  if(w==844||w==390)await p.screenshot({path:`${O}/ps_08_${w>h?'paysage':'portrait'}_fin.png`});await E(()=>ARC.modules.stack._action({id:'home'}));await W(150);
  res.push([w+'x'+h,a1.inside&&a2.inside&&!a1.overlap&&!a2.overlap&&a1.hi,Math.min(a1.minBtn,a2.minBtn),h1-h0])}
 ok('15 portrait et paysage (8 tailles) : boutons dans l’écran, aucun chevauchement, boutons ≥ 44 px, toile nette à la bonne taille, toucher actif après chaque rotation',res.every(r=>r[1]&&r[2]>=44&&r[3]==1),res);
 // ---- 16. performance : tour de 300 étages, rendu toujours rapide ----
 await p.setViewportSize({width:390,height:844});await W(300);
 const fps=()=>E(()=>new Promise(res=>{const t=[];const f=ts=>{t.push(ts);if(t.length<121)requestAnimationFrame(f);else{const d=t.slice(1).map((v,i)=>v-t[i]).sort((a,b)=>a-b);res({fps:+(1000/((t[t.length-1]-t[0])/(t.length-1))).toFixed(1),p95:+d[Math.floor(d.length*.95)].toFixed(1)})}};requestAnimationFrame(f)}));
 await E(()=>{const M=ARC.modules.stack;M._start();M._s.G.cur.dir=0});const low=await fps();
 await E(()=>{const M=ARC.modules.stack,G=M._s.G;for(let i=0;i<300;i++){const c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x;else c.z=p.z;M._drop(G)}G.parts=[];G.rings=[];G.texts=[]});await W(1500);const high=await fps();
 await E(()=>{const M=ARC.modules.stack,G=M._s.G,c=G.cur;if(c.axis=='x')c.x+=900;else c.z+=900;M._tap()});await W(300);const zoom=await fps();await W(3000);const overF=await fps();
 const pf={h:await E(()=>ARC.modules.stack._s.G.height),low,high,zoom,over:overF,cache:await E(()=>Object.keys(ARC.modules.stack._s.bgc).length),gpu:'aucune (rendu logiciel)'};
 ok('16 performance réelle (boucle du jeu, rendu logiciel sans carte graphique) : aucun ralentissement avec une tour de 300 étages (≥ 85 % de la cadence d’une tour basse), dézoom de fin fluide, caches bornés',
  pf.h==300&&low.fps>=45&&high.fps>=low.fps*.85&&overF.fps>=low.fps*.85&&zoom.fps>=30&&pf.cache<=24,pf);
 // ---- 17. sons synchronisés ----
 const sn=await E(()=>{window.__fx=[];const M=ARC.modules.stack,s=M._s;M._start();const G=s.G,f=d=>{const c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+d;else c.z=p.z+d;M._drop(G)};
  f(0);const a=window.__fx.slice();f(20);const b2=window.__fx.slice(a.length);for(let i=0;i<5;i++)f(0);const c=window.__fx.slice();f(500);return{a,b2,combo:c.includes('stCombo'),slow:c.includes('stSlow'),over:window.__fx.includes('stOver')}});
 ok('17 sons au moment des actions : pose, PERFECT, découpe, combo, ralenti, fin',sn.a.includes('stDrop')&&sn.a.includes('stPerfect')&&sn.b2.includes('stCut')&&sn.combo&&sn.slow&&sn.over,sn);
 // ---- 18. retour à la borne : Échap ; un autre jeu repasse en rendu normal ----
 await p.keyboard.press('Escape');await W(300);const q=await E(()=>({st:ARC.state,cur:ARC.cur,hi:document.getElementById('arcHi').hidden,api:!!ARC.modules.stack._s.api}));
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await W(500);const q2=await E(()=>({cur:ARC.cur&&ARC.cur.id,hi:document.getElementById('arcHi').hidden}));await p.keyboard.press('Escape');await W(200);
 ok('18 retour exact à la borne (Échap), Perfect Stack arrêté, toile haute résolution masquée ; Box Master garde son rendu habituel',q.st=='menu'&&!q.cur&&q.hi&&!q.api&&q2.cur=='boxes'&&q2.hi,{q,q2});
 await p.close();
 // ---- 19. ordinateur : clavier et souris ----
 const ctx2=await b.newContext({viewport:{width:1280,height:800}});const p2=await ctx2.newPage();watch(p2);await p2.goto(JEU);await p2.waitForTimeout(1500);await ouvrir(p2);await borne(p2);
 const E2=(f,a)=>p2.evaluate(f,a);await E2(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='stack');arcOk();arcOk()});await p2.waitForTimeout(700);await p2.keyboard.press('Enter');await p2.waitForTimeout(300);
 const ctr=()=>E2(()=>{const G=ARC.modules.stack._s.G,c=G.cur,p=G.blocks[G.blocks.length-1];if(c.axis=='x')c.x=p.x+2;else c.z=p.z+2});
 const k0=await E2(()=>({scr:ARC.modules.stack._s.scr,h:ARC.modules.stack._s.G.height}));await ctr();await p2.keyboard.press('Space');await p2.waitForTimeout(150);const k1=await E2(()=>ARC.modules.stack._s.G.height);
 const r2=await E2(()=>{const r=AX.cv.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.7}});await ctr();await p2.mouse.click(r2.x,r2.y);await p2.waitForTimeout(150);const k2=await E2(()=>ARC.modules.stack._s.G.height);
 await p2.keyboard.press('KeyP');await p2.waitForTimeout(100);const k3=await E2(()=>ARC.modules.stack._s.paused);await p2.keyboard.press('KeyP');await p2.waitForTimeout(100);await p2.screenshot({path:`${O}/ps_09_ordinateur.png`});
 ok('19 ordinateur : Entrée lance, Espace et clic posent, P met en pause',k0.scr=='play'&&k1==1&&k2==2&&k3,{k0,k1,k2,k3});
 await ctx2.close();
 ok('20 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();const n=R.filter(r=>r.ok).length;console.log(n+'/'+R.length+' tests réussis');fs.writeFileSync(`${O}/stack_resultats.json`,JSON.stringify(R,null,1));process.exit(n==R.length?0:1)})();
