// Tests réels du mini-jeu Memory (Playwright + Chrome) : téléphone (tactile, portrait/paysage) et ordinateur.
// Usage : node rue/tests/memory_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];let MODE='';const T=n=>MODE+' '+n;
function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
const boot=async p=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(600)};
// ouvre la borne, choisit Memory dans la liste et appuie sur JOUER (comme un joueur)
const ouvrir=async p=>{await p.evaluate(()=>{if(!ARC.on){streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()}});await p.waitForTimeout(400);
 await p.evaluate(()=>{ARC.state='menu';ARC.sel=ARC.games.findIndex(g=>g.id=='memory')});await p.keyboard.press('Enter');await p.waitForTimeout(200);await p.keyboard.press('Enter');await p.waitForTimeout(700)};
// coordonnées écran (CSS) d'un point du jeu
const css=(p,x,y)=>p.evaluate(([x,y])=>{const r=AX.cv.getBoundingClientRect(),S=AX.L.full;return{x:r.left+(S.x+x)*r.width/AX.L.W,y:r.top+(S.y+y)*r.height/AX.L.H}},[x,y]);
async function session(mode){MODE=mode.toUpperCase();const tel=mode=='tel';const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text()))errs.push(m.text())});
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 const tapAt=async(x,y)=>{const c=await css(p,x,y);if(tel)await p.touchscreen.tap(c.x,c.y);else await p.mouse.click(c.x,c.y)};
 const tapBtn=async id=>{const B=await E(id=>{const b=ARC.modules.memory._s.btns.find(q=>q.id==id);return b&&{x:b.x+b.w/2,y:b.y+b.h/2}},id);if(!B)return false;await tapAt(B.x,B.y);await W(120);return true};
 const tapCard=async i=>{const r=await E(i=>ARC.modules.memory._rect(i),i);await tapAt(r.x+r.w/2,r.y+r.h/2)};
 await boot(p);
 // ---- 0. intégration : entrée dans la borne, plein écran, accueil ----
 const inBorne=await E(()=>{const g=ARC.games.find(g=>g.id=='memory');return{nom:g&&g.name,pret:!!ARC.modules.memory}});
 await ouvrir(p);
 const acc=await E(()=>{const M=ARC.modules.memory,S=M._s;arcDraw();const H=AX.hi,r=H&&H.getBoundingClientRect();return{st:ARC.state,cur:ARC.cur&&ARC.cur.id,scr:S.scr,hires:!!H&&!H.hidden,couvre:!!r&&r.left<=.6&&r.top<=.6&&r.right>=innerWidth-.6&&r.bottom>=innerHeight-.6,btns:S.btns.map(b=>b.id)}});
 ok(T('0 intégré à la borne : Memory se lance depuis la liste, plein écran, accueil avec JOUER, difficultés, collections, son, records et retour'),inBorne.pret&&acc.st=='game'&&acc.cur=='memory'&&acc.scr=='home'&&acc.couvre&&['exit','son','play','recs','diff0','diff3','theme0','theme3'].every(i=>acc.btns.includes(i)),{inBorne,acc});
 await p.screenshot({path:`${O}/mm_accueil_${mode}.png`});
 // ---- 1. les quatre difficultés (taille de grille, cartes assez grandes, rien hors écran) ----
 const diffs=[];for(let d=0;d<4;d++){await tapBtn('diff'+d);await tapBtn('play');await W(250);
  diffs.push(await E(()=>{const M=ARC.modules.memory,S=M._s,G=S.G,g=S.L.grid,css=AX.cv.getBoundingClientRect().width/AX.L.W;let out=0;for(let i=0;i<G.cards.length;i++){const r=M._rect(i);if(r.x<0||r.y<g.hud-1||r.x+r.w>S.L.W+.5||r.y+r.h>S.L.H+.5)out++}
   return{diff:M.DIFFS[G.diff].id,n:G.cards.length,grille:g.cols+'×'+g.rows,carteCss:Math.round(Math.min(g.cw,g.ch)*css),horsEcran:out}}));
  if(d==3)await p.screenshot({path:`${O}/mm_expert_${mode}.png`});
  await tapBtn('pause');await tapBtn('menu')}
 ok(T('1 quatre difficultés : 12 (3×4), 20 (4×5), 30 (5×6), 40 cartes (5×8, couchée en paysage), cartes ≥ 44 px, rien hors de l’écran'),diffs.map(d=>d.n).join()=='12,20,30,40'&&diffs.map(d=>d.grille.split('×').map(Number).sort((a,b)=>a-b).join('×')).join()=='3×4,4×5,5×6,5×8'&&diffs.every(d=>d.carteCss>=44&&d.horsEcran==0),diffs);
 // ---- 2. mélange : chaque illustration exactement deux fois, positions différentes d'une partie à l'autre ----
 const mel=await E(()=>{const M=ARC.modules.memory,res={deuxFois:true,pos:new Set(),parties:200,toutesIll:new Set()};for(let k=0;k<200;k++){M._new(3,k%4);const G=M._s.G,cnt={};G.cards.forEach(c=>cnt[c.f]=(cnt[c.f]||0)+1);if(!Object.values(cnt).every(v=>v==2)||Object.keys(cnt).length!=20)res.deuxFois=false;res.pos.add(G.cards.map(c=>c.f).join(','));G.cards.forEach(c=>res.toutesIll.add(c.f))}
  M._new(0,0);const n=new Set();for(let k=0;k<60;k++){M._new(0,0);M._s.G.cards.forEach(c=>n.add(c.f))}return{deuxFois:res.deuxFois,dispositions:res.pos.size,illustrationsFacile:n.size}});
 ok(T('2 mélange : 200 parties, toujours deux exemplaires de chaque illustration, dispositions toutes différentes, illustrations tirées au hasard'),mel.deuxFois&&mel.dispositions==200&&mel.illustrationsFacile==20,mel);
 // ---- 3. paire reconnue, par de vrais touchers ----
 await E(()=>{ARC.modules.memory._new(0,0)});await W(200);
 const pr=await E(()=>{const G=ARC.modules.memory._s.G,a=0,b=G.cards.findIndex((c,i)=>i>0&&c.f==G.cards[0].f);return{a,b}});
 await tapCard(pr.a);await W(80);await tapCard(pr.b);await W(700);
 const p3=await E(([a,b])=>{const G=ARC.modules.memory._s.G;return{ma:G.cards[a].matched,mb:G.cards[b].matched,moves:G.moves,pts:G.pts,open:G.open.length,lock:G.lock}},[pr.a,pr.b]);
 ok(T('3 paire identique (touchers réels) : les deux cartes restent visibles et verrouillées, points ajoutés'),p3.ma&&p3.mb&&p3.moves==1&&p3.pts==100&&p3.open==0&&!p3.lock,p3);
 // ---- 4. erreur : verrou pendant l'animation, troisième carte refusée, retour automatique, même carte refusée deux fois ----
 const m4=await E(()=>{const G=ARC.modules.memory._s.G,f=G.cards.map((c,i)=>i).filter(i=>!G.cards[i].matched),a=f[0],b=f.find(i=>G.cards[i].f!=G.cards[a].f),c=f.find(i=>i!=a&&i!=b);return{a,b,c}});
 await tapCard(m4.a);await W(60);await tapCard(m4.a);await W(60);const memeCarte=await E(()=>ARC.modules.memory._s.G.open.length);
 await tapCard(m4.b);await W(60);await tapCard(m4.c);await W(60);
 const pendant=await E(([a,b,c])=>{const G=ARC.modules.memory._s.G;return{lock:G.lock,cUp:G.cards[c].up,ouvertes:G.open.length,err:G.errors}},[m4.a,m4.b,m4.c]);
 await W(1500);const apres=await E(([a,b])=>{const G=ARC.modules.memory._s.G;return{err:G.errors,aUp:G.cards[a].up,bUp:G.cards[b].up,aRot:G.cards[a].rot,lock:G.lock,ouvertes:G.open.length,visibles:G.cards.filter(c=>c.up&&!c.matched).length,cartes:G.cards.length}},[m4.a,m4.b]);
 ok(T('4 erreur : même carte refusée deux fois, tableau verrouillé pendant l’animation (3e carte refusée), les deux cartes se retournent seules, aucune carte perdue'),memeCarte==1&&pendant.lock&&!pendant.cUp&&pendant.ouvertes==2&&apres.err==1&&!apres.aUp&&!apres.bUp&&apres.aRot==0&&!apres.lock&&apres.ouvertes==0&&apres.visibles==0&&apres.cartes==12,{memeCarte,pendant,apres});
 // ---- 5. combos ----
 const cb=await E(async()=>{const M=ARC.modules.memory;M._new(1,1);const S=M._s,G=S.G,step=async()=>{for(let i=0;i<60;i++){M.update(1/30,{});if(!G.lock)break}};const pair=async()=>{const a=G.cards.findIndex(c=>!c.matched);const b=G.cards.findIndex((c,i)=>i!=a&&!c.matched&&c.f==G.cards[a].f);M._tap(a);M._tap(b);await step()};
  const pts=[];for(let k=0;k<4;k++){const p0=G.pts;await pair();pts.push(G.pts-p0)}const c1=G.combo;
  const a=G.cards.findIndex(c=>!c.matched),b=G.cards.findIndex((c,i)=>i!=a&&!c.matched&&c.f!=G.cards[a].f);M._tap(a);M._tap(b);await step();const c2=G.combo;const p0=G.pts;await pair();
  return{gains:pts,combo:c1,apresErreur:c2,gainApres:G.pts-p0,mult:[1,2,3,4,5,9].map(M._combo),max:G.maxCombo}});
 ok(T('5 combos : paires consécutives ×1, ×1,5, ×2, ×2,5 (plafond ×4), remis à zéro par une erreur'),cb.gains.join()=='150,225,300,375'&&cb.combo==4&&cb.apresErreur==0&&cb.gainApres==150&&cb.mult.join()=='1,1.5,2,2.5,3,4'&&cb.max==4,cb);
 // ---- 6. chronomètre ----
 await E(()=>ARC.modules.memory._new(0,0));await W(800);const t0=await E(()=>ARC.modules.memory._s.G.t);
 await E(()=>ARC.modules.memory._tap(0));await W(1200);const t1=await E(()=>ARC.modules.memory._s.G.t);
 await tapBtn('pause');const tp=await E(()=>ARC.modules.memory._s.G.t);await W(1000);const tp2=await E(()=>ARC.modules.memory._s.G.t);await tapBtn('resume');await W(600);const t2=await E(()=>ARC.modules.memory._s.G.t);
 ok(T('6 chronomètre : démarre au premier retournement, avance en jeu, s’arrête pendant la pause'),t0==0&&t1>.9&&t1<1.6&&Math.abs(tp2-tp)<.05&&t2>tp+.3,{t0,t1,tp,tp2,t2});
 // ---- 7. score final ----
 const sc=await E(()=>{const M=ARC.modules.memory;const f=M._score({diff:2,pts:4000,t:60,errors:3});const g=M._score({diff:0,pts:900,t:50,errors:10});return{f,g}});
 ok(T('7 score : paires (avec combos) + bonus de temps + bonus de précision, multipliés par la difficulté'),sc.f.time==1800&&sc.f.acc==800&&sc.f.total==6600&&sc.g.time==0&&sc.g.acc==0&&sc.g.total==900,sc);
 // ---- 8. étoiles ----
 const st=await E(()=>{const M=ARC.modules.memory;return[M._stars(0,8,20),M._stars(0,8,60),M._stars(0,13,20),M._stars(0,20,20),M._stars(3,30,150),M._stars(3,50,150)]});
 ok(T('8 trois étoiles : mémoire excellente et rapide = 3, bonne = 2, sinon 1'),st.join()=='3,2,2,1,3,1',st);
 // ---- 9. partie complète gagnée par de vrais touchers, record, historique, sauvegarde ----
 await E(()=>{const d=ARC.modules.memory._data();d.recs={};d.hist={};ARC.modules.memory._new(0,2)});await W(300);
 const pos=await E(()=>ARC.modules.memory._s.G.cards.map(c=>c.f));const fait=new Set();
 for(let i=0;i<pos.length;i++){if(fait.has(i))continue;const j=pos.findIndex((f,k)=>k!=i&&f==pos[i]);fait.add(i);fait.add(j);await tapCard(i);await W(60);await tapCard(j);await W(500)}
 await W(1800);const vic=await E(()=>{const S=ARC.modules.memory._s,G=S.G,d=ARC.modules.memory._data();return{scr:S.scr,won:G.won,res:G.res,rec:d.recs.facile,hist:(d.hist.facile||[]).length,arc:ARC.data('memory').best}});
 await p.screenshot({path:`${O}/mm_victoire_${mode}.png`});
 ok(T('9 victoire détectée : célébration, score, coups, temps, étoiles, NOUVEAU RECORD ; record et historique enregistrés'),vic.scr=='win'&&vic.won&&vic.res&&vic.res.rec&&vic.rec&&vic.rec.score==vic.res.total&&vic.rec.moves==6&&vic.rec.stars==3&&vic.hist==1&&vic.arc==vic.res.total,vic);
 // ---- 14. rejouer ----
 await W(600);await tapBtn('again');await W(200);const rj=await E(()=>{const G=ARC.modules.memory._s.G;return{scr:ARC.modules.memory._s.scr,moves:G.moves,t:G.t,up:G.cards.filter(c=>c.up||c.matched).length,n:G.cards.length,theme:G.theme}});
 ok(T('14 relance d’une nouvelle partie (bouton Rejouer) : tout est remis à zéro, même collection'),rj.scr=='play'&&rj.moves==0&&rj.t==0&&rj.up==0&&rj.n==12&&rj.theme==2,rj);
 // records indépendants par difficulté + historique limité aux 5 meilleurs + après rechargement
 await E(()=>{const M=ARC.modules.memory,d=M._data();d.recs.normal={score:777,stars:2,moves:15,time:40,errors:3,combo:2,theme:'animaux',date:Date.now()};d.hist.normal=[];for(let k=0;k<8;k++){d.hist.normal.push({score:100*k,stars:1,moves:20,time:60,date:Date.now()})}d.hist.normal.sort((a,b)=>b.score-a.score);d.hist.normal.length=5;ARC.modules.memory._s.api.save()});
 await p.reload();await boot(p);const rel=await E(()=>{const d=N.arcade&&N.arcade.memory;return d&&{facile:d.recs.facile&&d.recs.facile.score,normal:d.recs.normal&&d.recs.normal.score,hist:d.hist.normal.length,top:d.hist.normal[0].score}});
 ok(T('9b records séparés par difficulté, historique des 5 meilleurs résultats, conservés après rechargement de la page'),rel&&rel.facile>0&&rel.normal==777&&rel.hist==5&&rel.top==700,rel);
 // ---- 10. collections ----
 await ouvrir(p);const th=await E(()=>{const A=MEMO_ART,M=ARC.modules.memory;const out={coll:A.map(c=>c.id),n:A.map(c=>c.items.length),noms:new Set(A.flatMap(c=>c.items.map(i=>c.id+i.n))).size,styles:new Set(A.map(c=>c.style.back.join())).size};
  // chaque illustration produit une image différente (empreinte des pixels)
  const cv=document.createElement('canvas');cv.width=cv.height=48;const x=cv.getContext('2d'),sig=new Set();let err=0;
  for(const c of A)for(const it of c.items){x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,48,48);x.setTransform(.45,0,0,.45,24,24);try{it.d(x)}catch(e){err++}const d=x.getImageData(0,0,48,48).data;let h=0;for(let i=0;i<d.length;i+=7)h=(h*31+d[i])>>>0;sig.add(h)}
  out.images=sig.size;out.err=err;
  for(let t=0;t<4;t++){M._new(0,t);out['t'+t]=M._s.G.cards.every(c=>c.f<A[t].items.length)}M._action('menu');return out});
 ok(T('10 quatre collections (fruits et gourmandises, animaux, espace, magie) de 20 illustrations chacune, 80 dessins tous différents, style de carte propre à chaque collection'),th.coll.join()=='fruits,animaux,espace,magie'&&th.n.join()=='20,20,20,20'&&th.images==80&&th.err==0&&th.styles==4&&th.t0&&th.t3,th);
 // ---- 11. musique et sons ----
 const fxs=await E(async()=>{window.__fx=[];if(!JEUSON.fx.__spy){const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)};JEUSON.fx.__spy=1}
  const M=ARC.modules.memory;M._new(0,0);const G=M._s.G,step=()=>{for(let i=0;i<80;i++){M.update(1/30,{});if(!G.lock)break}};
  const a=0,b=G.cards.findIndex((c,i)=>i>0&&c.f==G.cards[0].f);M._tap(a);M._tap(b);step();const c=G.cards.findIndex(q=>!q.matched),d=G.cards.findIndex((q,i)=>i!=c&&!q.matched&&q.f!=G.cards[c].f);M._tap(c);M._tap(d);step();
  for(let k=0;k<6;k++){const i=G.cards.findIndex(q=>!q.matched);if(i<0)break;const j=G.cards.findIndex((q,z)=>z!=i&&!q.matched&&q.f==G.cards[i].f);M._tap(i);M._tap(j);step()}for(let i=0;i<40;i++)M.update(1/30,{});
  await new Promise(r=>setTimeout(r,2200));return{fx:window.__fx,mus:LLSON.state().cur}});
 const need=['mmStart','mmFlip','mmMatch','mmMiss','mmCombo','mmLast','mmWin'];
 ok(T('11 musique propre (électro chill) qui ne redémarre pas, sons distincts : carte, paire, erreur, combo, dernière paire, victoire'),fxs.mus=='memory'&&need.every(n=>fxs.fx.includes(n)),{mus:fxs.mus,fx:[...new Set(fxs.fx)]});
 const mus=await E(()=>{const s=LLSON.state(),T=LLSON.theme('memory'),sc=LLSON.score('memory'),longest=Math.max(...sc.notes.filter(n=>n[0]!='pd').map(n=>n[4]));const log0=LLSON.log().length;const M=ARC.modules.memory;M._action('menu');M._action('play');M._tap(0);M._tap(1);const relance=LLSON.log().slice(log0).filter(e=>e.ev=='début'||e.ev=='fondu-sortant').length;return{cur:s.cur,style:T.sty,sec:Math.round(sc.sec),longest,relance}});
 ok(T('11b musique : 3 min ou plus, aucune note longue, jamais relancée par les actions (menu, nouvelle partie, cartes)'),mus.cur=='memory'&&mus.sec>=180&&mus.longest<=.5&&mus.relance==0,mus);
 // réglages : volume musique, volume effets, mode silencieux (les vrais réglages du jeu)
 await E(()=>{const M=ARC.modules.memory;M._action('menu')});await W(150);await tapBtn('son');await W(150);
 const sl=await E(()=>{const b=ARC.modules.memory._s.btns;const m=b.find(q=>q.id=='sl_m'),s=b.find(q=>q.id=='sl_s');return{m:{x:m.x+m.w*.25,y:m.y+m.h/2},s:{x:s.x+s.w*.6,y:s.y+s.h/2}}});
 await tapAt(sl.m.x,sl.m.y);await tapAt(sl.s.x,sl.s.y);await tapBtn('mute');const pf=await E(()=>({...LLSON.prefs()}));await tapBtn('mute');const pf2=await E(()=>LLSON.prefs().mute);await tapBtn('close');
 ok(T('11c réglages : volume de la musique, volume des effets et mode silencieux, indépendants'),Math.abs(pf.m-.25)<.04&&Math.abs(pf.s-.6)<.04&&pf.mute===true&&pf2===false,{pf,pf2});
 await E(()=>{LLSON.set('m',.8);LLSON.set('s',.85)});
 // ---- 12. portrait ↔ paysage en pleine partie ----
 if(tel){await E(()=>{const M=ARC.modules.memory;M._new(3,1);M._tap(0)});await W(300);const av=await E(()=>({open:ARC.modules.memory._s.G.open.slice(),cols:ARC.modules.memory._s.L.grid.cols}));
  await p.setViewportSize({width:844,height:390});await W(900);
  const ap=await E(()=>{const M=ARC.modules.memory,S=M._s,g=S.L.grid,G=S.G;let out=0;for(let i=0;i<G.cards.length;i++){const r=M._rect(i);if(r.x<0||r.y<g.hud-1||r.x+r.w>S.L.W+.5||r.y+r.h>S.L.H+.5)out++}return{land:S.L.land,cols:g.cols,rows:g.rows,out,open:G.open.slice(),css:Math.round(Math.min(g.cw,g.ch)*AX.cv.getBoundingClientRect().width/AX.L.W)}});
  await p.screenshot({path:`${O}/mm_paysage_${mode}.png`});
  const z=await E(()=>{const G=ARC.modules.memory._s.G;return G.cards.findIndex((c,i)=>i>0&&!c.up)});await tapCard(z);await W(80);const tz=await E(z=>ARC.modules.memory._s.G.cards[z].up,z);
  await p.setViewportSize({width:390,height:844});await W(700);const back=await E(()=>ARC.modules.memory._s.L.grid.cols);
  ok(T('12 rotation en pleine partie : grille réorganisée (5 colonnes → 8 colonnes), partie conservée, toucher toujours actif, rien hors écran'),av.cols==5&&ap.land&&ap.cols==8&&ap.rows==5&&ap.out==0&&ap.open.join()==av.open.join()&&ap.css>=44&&tz&&back==5,{av,ap,tz,back})}
 else ok(T('12 clavier : flèches pour choisir une carte, Entrée pour la retourner, Échap pour la pause'),await (async()=>{await E(()=>ARC.modules.memory._new(0,0));await W(500);await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');const r=await E(()=>{const S=ARC.modules.memory._s,q=1+S.L.grid.cols;return S.focus==q&&S.G.cards[q].up});await p.keyboard.press('Escape');const pz=await E(()=>ARC.modules.memory._s.modal=='pause');await p.keyboard.press('Escape');return r&&pz})());
 // ---- 13. retour vers la borne ----
 await E(()=>ARC.modules.memory._action('menu'));await W(200);await tapBtn('exit');await W(2500);
 const bk=await E(()=>({st:ARC.state,cur:ARC.cur,on:ARC.on,mus:LLSON.state().cur}));
 ok(T('13 bouton retour : revient à la borne d’arcade (musique de la salle), le jeu est bien fermé'),bk.on&&bk.st=='menu'&&!bk.cur&&bk.mus=='arcade',bk);
 // ---- performance ----
 await ouvrir(p);await E(()=>{const M=ARC.modules.memory;M._new(3,2);for(let i=0;i<10;i++)M._s.G.cards[i].up=true});
 const fps=await E(()=>new Promise(r=>{let n=0,worst=0,last=performance.now();const t0=last;const M=ARC.modules.memory;let k=0;const f=()=>{const now=performance.now();worst=Math.max(worst,now-last);last=now;n++;if(n%12==0){const G=M._s.G;G.cards[k%40].up=!G.cards[k%40].up;k++}if(now-t0<3000)requestAnimationFrame(f);else r({fps:Math.round(n/3),pire:Math.round(worst)})};requestAnimationFrame(f)}));
 ok(T('15 fluidité : 40 cartes avec retournements continus, au moins 50 images/s'),fps.fps>=50,fps);
 ok(T('16 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close();await b.close()}
(async()=>{const which=process.argv[2];for(const m of which?[which]:['tel','pc'])await session(m);const n=R.filter(r=>r.ok).length;console.log(n+'/'+R.length+' tests réussis');fs.writeFileSync(O+'/mm_resultats.json',JSON.stringify(R,null,1));process.exit(n==R.length?0:1)})();
