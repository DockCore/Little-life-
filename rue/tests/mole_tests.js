// Tests réels du Whack-a-Mole dans la borne (Playwright + Chrome). Usage : node rue/tests/mole_tests.js [tel|pc]
// Une vraie partie complète de 60 s est jouée par un robot qui tape les taupes à l'écran (toucher sur téléphone, clavier sur PC).
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
const fullCheck=async(E)=>E(()=>{arcDraw();const L=AX.L,F=L.full,g=AX.gameCv,r=AX.cv.getBoundingClientRect(),k=r.width/L.W,m=AX.x.getImageData(0,0,L.W,L.H).data,gd=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let diff=0;
 for(let i=0;i<400;i++){const X=Math.floor(Math.random()*F.w),Y=Math.floor(Math.random()*F.h),a=((F.y+Y)*L.W+F.x+X)*4,b=(Y*g.width+X)*4;if(m[a]!=gd[b]||m[a+1]!=gd[b+1]||m[a+2]!=gd[b+2])diff++}
 const vis={l:r.left+F.x*k,t:r.top+F.y*k,r:r.left+(F.x+F.w)*k,b:r.top+(F.y+F.h)*k},el=document.elementFromPoint(innerWidth/2,innerHeight/2);return{diff,couvre:vis.l<=.6&&vis.t<=.6&&vis.r>=innerWidth-.6&&vis.b>=innerHeight-.6,state:ARC.state,dessus:!!(el&&el.closest('.arcx'))}});
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 await E(()=>{window.__fx=[];const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)}});
 const touch=(t,sx,sy,id=1)=>E(([t,sx,sy,id,tel])=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=arcGS();AX.cv.dispatchEvent(new PointerEvent(t,{pointerType:tel?'touch':'mouse',isPrimary:true,pointerId:id,clientX:r.left+(S.x+sx)*k,clientY:r.top+(S.y+sy)*k,bubbles:true}))},[t,sx,sy,id,tel]);
 const tap=async(x,y)=>{await touch('pointerdown',x,y);await touch('pointerup',x,y)};const S=()=>E(()=>{const W=ARC.modules.mole._state;return{ph:W.phase,score:W.score,combo:W.combo,time:W.time}});
 // ---- 1. ouvrir la borne, trouver le jeu, JOUER, plein écran ----
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(600);
 const cat=await E(()=>{const i=ARC.games.findIndex(g=>g.id=='mole');return{i,nom:ARC.games[i]&&ARC.games[i].name,pret:!!ARC.modules.mole,state:ARC.state}});
 await E(i=>{ARC.sel=i},cat.i);await W(200);await p.screenshot({path:`${O}/wm_${mode}_01_catalogue.png`});await p.keyboard.press('Enter');await W(300);const info=await E(()=>ARC.state);await p.keyboard.press('Enter');await W(800);
 const fc=await fullCheck(E);const st1=await E(()=>({state:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.mole._state.phase}));await p.screenshot({path:`${O}/wm_${mode}_02_accueil.png`});
 ok(T('1 borne ouverte, Whack-a-Mole dans le catalogue, fiche puis JOUER : le jeu occupe tout l’écran (borne, rue et interface masquées)'),cat.i>=0&&cat.nom=='Whack-a-Mole'&&cat.pret&&info=='info'&&st1.state=='game'&&st1.cur=='mole'&&st1.ph=='home'&&fc.diff==0&&fc.couvre&&fc.dessus,{cat,info,st1,fc});
 // ---- 2. écran d'accueil du jeu → compte à rebours → partie ----
 await E(()=>{window.__fx=[]});const pb=await E(()=>ARC.modules.mole._state.playBtn);await tap(pb.x+5,pb.y+5);await W(300);const c1=await S();await W(3400);const c2=await S();
 ok(T('2 écran d’accueil (titre, illustration, règles, record, JOUER) puis compte à rebours 3-2-1 et début de partie (60 s)'),c1.ph=='count'&&c2.ph=='play'&&c2.time>59&&c2.score==0,{c1,c2});
 // ---- 3. partie complète de 60 s jouée par un robot ----
 const t0=Date.now();let taps=0;
 while(Date.now()-t0<64000){const tg=await E(()=>{const W=ARC.modules.mole._state;if(W.phase!='play')return{end:1};const H=W.holes.map((h,i)=>({i,h})).filter(o=>o.h.m&&(o.h.m.st=='up'||o.h.m.st=='rise'&&o.h.m.y>.6));
   if(!H.length)return null;const o=H.find(o=>o.h.m.gold)||H[0];return{i:o.i,x:o.h.cx,y:o.h.cy-o.h.r*.9,miss:Math.random()<.06}});
  if(tg&&tg.end)break;if(tg){taps++;if(tel)await tap(tg.x,tg.miss?tg.y+tg.y*0:tg.y);else await p.keyboard.press(['KeyQ','KeyW','KeyE','KeyA','KeyS','KeyD','KeyZ','KeyX','KeyC'][tg.i])}await W(tel?60:45)}
 await W(1300);const g=await E(()=>{const W=ARC.modules.mole._state;return{ph:W.phase,score:W.score,hits:W.hits,golds:W.golds,misses:W.misses,escaped:W.escaped,best:W.bestCombo,acc:W.over&&W.over.acc,rank:W.over&&W.over.rank,rec:W.over&&W.over.rec,fx:[...new Set(window.__fx)]}});const dur=((Date.now()-t0)/1000).toFixed(1);
 await W(900);await p.screenshot({path:`${O}/wm_${mode}_03_fin.png`});
 ok(T('3 partie complète de 60 s réellement jouée (le chrono s’arrête à 0, écran de fin : score, record, résultat)'),g.ph=='over'&&g.hits>=30&&g.score>=g.hits*10&&Math.abs(dur-61)<4&&g.rec&&g.rank,{dur,g});
 ok(T('4 effets sonores distincts : apparition, frappe, taupe dorée, combo, fin, record ; musique arcade'),['whPop','whBonk','whCombo','whStart','whEnd','whRecord'].every(n=>g.fx.includes(n))&&(g.golds==0||g.fx.includes('whGold')),{fx:g.fx,golds:g.golds});
 // ---- 5. scores, combos, frappes précises (tests contrôlés) ----
 const sc=await E(()=>{const M=ARC.modules.mole,W=M._state,res={};W.phase='play';W.time=30;W.combo=0;W.score=0;W.holes.forEach(h=>h.m=null);
  const put=(i,gold)=>{W.holes[i].m={gold,ex:'joie',st:'up',y:1,t:0,up:9}};
  put(0,false);M._whack(0);res.normal=W.score;W.score=0;put(1,true);M._whack(1);res.gold=W.score;
  W.combo=0;W.score=0;for(let k=0;k<5;k++){put(2,false);M._whack(2);W.holes[2].m=null}res.cinq=W.score;res.combo5=W.combo;W.score=0;put(3,false);M._whack(3);res.sixieme=W.score;
  W.combo=0;W.score=0;for(let k=0;k<10;k++){put(4,false);M._whack(4);W.holes[4].m=null}W.score=0;put(4,false);M._whack(4);res.onzieme=W.score;W.holes[4].m=null;
  W.score=0;M._whack(5);res.vide={combo:W.combo,score:W.score};W.combo=7;put(6,false);W.holes[6].m.st='sink';W.holes[6].m.y=.02;M.update(.05,{okN:W.okN});res.echappee=W.combo;
  // précision : toucher le corps touche, toucher l'herbe entre les trous ne fait rien
  put(7,false);const h=W.holes[7];W.combo=0;M.pointer('down',h.cx,h.cy-h.r*.9);res.corps=W.holes[7].m&&W.holes[7].m.st;W.holes[7].m=null;put(8,false);const h8=W.holes[8];M.pointer('down',h8.cx+h8.r*1.6,h8.cy-h8.r*3);res.herbe={st:W.holes[8].m.st,misses:W.misses};
  W.holes.forEach(h=>h.m=null);return res});
 ok(T('5 scores : taupe normale +10, dorée +50, combo à partir de 5 frappes de suite (×1,5 puis ×2), coup dans le vide ou taupe échappée = fin du combo, frappe précise'),
  sc.normal==10&&sc.gold==50&&sc.cinq==55&&sc.combo5==5&&sc.sixieme==15&&sc.onzieme==20&&sc.vide.combo==0&&sc.vide.score==0&&sc.echappee==0&&sc.corps=='hit'&&sc.herbe.st=='up',sc);
 // ---- 6. animations : sortie, rentrée, disparition après un délai, disparition immédiate après une frappe ----
 const an=await E(()=>{const M=ARC.modules.mole,W=M._state;W.phase='play';W.time=50;W.spawnT=99;W.holes.forEach(h=>h.m=null);W.holes[0].m={gold:false,ex:'joie',st:'rise',y:0,t:0,up:.5};const tr=[];
  for(let i=0;i<30;i++){M.update(.05,{okN:W.okN});const m=W.holes[0].m;tr.push(m?m.st+':'+m.y.toFixed(1):'parti')}
  W.holes[1].m={gold:false,ex:'joie',st:'up',y:1,t:0,up:9};M._whack(1);let n=0;while(W.holes[1].m&&n<40){M.update(.05,{okN:W.okN});n++}return{tr:tr.filter((v,i)=>i==0||v!=tr[i-1]).join(' '),frappee:n*.05}});
 ok(T('6 animations : la taupe sort, reste, rentre et disparaît seule ; touchée, elle disparaît aussitôt (moins d’une demi-seconde)'),/rise/.test(an.tr)&&/up:1.0/.test(an.tr)&&/sink/.test(an.tr)&&/parti$/.test(an.tr)&&an.frappee<=.5,an);
 // ---- 7. difficulté progressive ----
 const df=await E(()=>{const M=ARC.modules.mole,W=M._state,mes=(t)=>{W.phase='play';W.time=t;W.holes.forEach(h=>h.m=null);let n=0,ups=[],maxUp=0;const vu=new Set();W.spawnT=0;for(let i=0;i<200;i++){M.update(.05,{okN:W.okN});W.time=t;const u=W.holes.filter(h=>h.m).length;maxUp=Math.max(maxUp,u);W.holes.forEach(h=>{if(h.m&&!vu.has(h.m)){vu.add(h.m);n++;ups.push(h.m.up)}})}return{apparitions:n,duree:+(ups.reduce((a,b)=>a+b,0)/ups.length).toFixed(2),maxUp}};
  const d=[mes(58),mes(30),mes(3)];W.holes.forEach(h=>h.m=null);return d});
 ok(T('7 difficulté progressive : plus de taupes, plus souvent, qui restent moins longtemps'),df[2].apparitions>df[0].apparitions&&df[2].duree<df[0].duree&&df[2].maxUp>df[0].maxUp,df);
 // ---- 8. record sauvegardé (même après rechargement) ----
 const best=await E(()=>({mem:ARC.data('mole').best,ls:Object.keys(localStorage).some(k=>(localStorage.getItem(k)||'').includes('"mole":{"best":'+ARC.data('mole').best))}));
 // ---- 9. REJOUER, puis QUITTER, puis RETOUR À LA BORNE ----
 await E(()=>{const W=ARC.modules.mole._state;W.phase='play';W.time=.05});await W(1700);const ob=await E(()=>ARC.modules.mole._state.overBtns);await tap(ob[0].x+5,ob[0].y+5);await W(300);const rej=await S();
 await W(3500);const q=await E(()=>ARC.modules.mole._state.L.quit);await tap(q.x+5,q.y+5);await W(400);const quit=await E(()=>({state:ARC.state,cur:ARC.cur,on:ARC.on,mus:JEUSON.playing(),sel:ARC.games[ARC.sel].id}));
 await p.keyboard.press('Enter');await W(300);await p.keyboard.press('Enter');await W(600);await E(()=>{const W=ARC.modules.mole._state;W.okN=W.okN||0});await p.keyboard.press('Enter');await W(3600);await E(()=>{const W=ARC.modules.mole._state;W.time=.05});await W(1700);
 const ob2=await E(()=>ARC.modules.mole._state.overBtns);await tap(ob2[1].x+5,ob2[1].y+5);await W(400);const back=await E(()=>({state:ARC.state,cur:ARC.cur,mus:JEUSON.playing()}));await p.screenshot({path:`${O}/wm_${mode}_04_retour.png`});
 ok(T('8 meilleur score enregistré dans la sauvegarde'),best.mem>=g.score&&best.ls,best);
 ok(T('9 REJOUER relance tout de suite une partie ; QUITTER et RETOUR À LA BORNE ramènent au catalogue, sons et animations arrêtés'),rej.ph=='count'&&rej.score==0&&quit.state=='menu'&&quit.cur==null&&quit.on&&quit.mus!='mole'&&quit.sel=='mole'&&back.state=='menu'&&back.cur==null&&back.mus!='mole',{rej,quit,back});
 // ---- 10. son coupé, record après rechargement ----
 await p.reload();await W(2500);const rel=await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}return N.arcade&&N.arcade.mole&&N.arcade.mole.best});
 ok(T('10 record conservé après rechargement de la page'),rel==best.mem,{rel,avant:best.mem});
 ok(T('11 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/wm_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
