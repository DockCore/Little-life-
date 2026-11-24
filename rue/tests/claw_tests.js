// Tests réels de LUCKY CLAW dans la borne d'arcade (Playwright + Chrome mobile tactile, vrais touchers sur la croix et les boutons).
// Usage : node rue/tests/claw_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const errs=[];
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__fx=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);return f(n,...a)};clearInterval(iv)}},5)});
 await p.goto(JEU);await p.waitForTimeout(1500);const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{document.getElementById('intro')&&document.getElementById('intro').remove();tscr.hidden=true;document.getElementById('crOk2').click()});await W(500);
 const cdp=await ctx.newCDPSession(p);
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const tapG=async(gx,gy)=>{const c=await scr(gx,gy);await p.touchscreen.tap(c.x,c.y);return c};
 const st=()=>E(()=>{const S=ARC.modules.claw._state,c=S.claw;return{ph:S.phase,gx:c.gx,gz:c.gz,y:c.y,open:c.open,cr:S.credits,score:S.score,n:S.ps.length}});
 const big=async()=>{const B=await E(()=>ARC.modules.claw._state.L.big);await tapG(B.x,B.y);await W(150)};
 // maintient le pouce sur une branche de la croix (dx, dy en -1..1) pendant ms
 const pad=async(dx,dy,ms)=>{const J=await E(()=>ARC.modules.claw._state.L.pad);const c=await scr(J.x,J.y),k=(await scr(J.x+J.r,J.y)).x-c.x;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,id:3}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x+dx*k*.75,y:c.y+dy*k*.75,id:3}]});await W(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(80)};
 // contrôle continu : aucun lot ni doigt hors de la vitrine, aucun doigt sous le sol
 await E(()=>{window.__viol={n:0,max:0,f:0,frames:0};const M=ARC.modules.claw,W=M._world;const u=M._update;setInterval(()=>{const S=M._state;if(!S.claw||!ARC.cur||ARC.cur.id!='claw')return;window.__viol.frames++;
  for(const q of S.ps){const e=Math.max(q.r-q.x,q.x-(W.WX-q.r),q.r-q.z,q.z-(W.WD-q.r));if(e>.02){__viol.n++;__viol.max=Math.max(__viol.max,e)}}
  for(const f of M._fingers(S.claw))for(const q of[f.j,f.k,f.t])if(q.x<1.38||q.x>W.WX-1.38||q.z<1.38||q.z>W.WD-1.38||(q.y<1.3&&!(q.x<W.CHX&&q.z<W.CHZ)))__viol.f++},16)});
 // ---- 1. lancement depuis la borne : rue → arcade → vignette Lucky Claw → fiche → JOUER ----
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(700);
 const cat=await E(()=>{const i=ARC.games.findIndex(g=>g.id=='claw');return{i,n:ARC.games.length,dup:ARC.games.filter(g=>g.id=='claw').length,ready:!!ARC.modules.claw,bornes:document.querySelectorAll('.arcx').length}});
 const cellC=await E(i=>{const c=AX.L.grid.cells[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(c.x+c.w/2)*k,y:r.top+(c.y+c.h/2)*k}},cat.i);
 await p.touchscreen.tap(cellC.x,cellC.y);await W(250);await p.touchscreen.tap(cellC.x,cellC.y);await W(400);await p.screenshot({path:`${O}/cl_00_fiche.png`});
 const info=await E(()=>({st:ARC.state,info:ARC.games[ARC.info].id}));const jb=await E(()=>{const o=arcInfoLayout(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(o.bx+o.bw/2)*k,y:r.top+(o.by+o.bh/2)*k}});
 await p.touchscreen.tap(jb.x,jb.y);await W(800);const g1=await E(()=>({st:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.claw._state.phase,lots:ARC.modules.claw._state.ps.length,score:ARC.modules.claw._state.score}));await p.screenshot({path:`${O}/cl_01_titre.png`});
 ok('1 Lucky Claw dans la liste de la borne (une seule fois, même borne), fiche, JOUER → écran titre du jeu',cat.ready&&cat.dup==1&&cat.bornes==1&&info.st=='info'&&info.info=='claw'&&g1.st=='game'&&g1.cur=='claw'&&g1.ph=='title'&&g1.lots>=25&&g1.score==0,{cat,info,g1});
 const fs2=await E(()=>{const r=AX.cv.getBoundingClientRect(),S=arcGS();return{cv:[r.left,r.top,r.right,r.bottom].map(Math.round),S,LW:AX.L.W,LH:AX.L.H,W:innerWidth,H:innerHeight,sx:document.documentElement.scrollWidth,sy:document.documentElement.scrollHeight}});
 ok('2 plein écran : le jeu occupe tout l’écran, sans débordement',fs2.cv[0]<=0&&fs2.cv[1]<=0&&fs2.cv[2]>=fs2.W&&fs2.cv[3]>=fs2.H&&fs2.S.w==fs2.LW&&fs2.S.h==fs2.LH&&fs2.sx<=fs2.W&&fs2.sy<=fs2.H,fs2);
 // ---- 3. JOUER (bouton vert) : un crédit est consommé, la visée commence ----
 await big();await W(200);const s3=await st();await big();await W(300);const s3b=await st();
 ok('3 JOUER puis INSERER : 8 crédits offerts, une tentative consomme 1 crédit, chrono de visée',s3.ph=='ready'&&s3.cr==8&&s3b.ph=='aim'&&s3b.cr==7,{s3,s3b});
 // ---- 4. commandes : gauche / droite / avant / arrière (vrais touchers maintenus) ----
 const a0=await st();await pad(1,0,700);const a1=await st();await pad(-1,0,350);const a2=await st();await pad(0,-1,600);const a3=await st();await pad(0,1,300);const a4=await st();await pad(1,-1,400);const a5=await st();
 await p.screenshot({path:`${O}/cl_02_visee.png`});
 ok('4 croix tactile : DROITE, GAUCHE, AVANT (vers le fond), ARRIÈRE, diagonale déplacent bien le chariot',a1.gx>a0.gx+10&&a2.gx<a1.gx-5&&a3.gz>a2.gz+8&&a4.gz<a3.gz-3&&a5.gx>a4.gx&&a5.gz>a4.gz,{a0,a1,a2,a3,a4,a5});
 // limites : la pince ne sort jamais de sa course (la vitrine)
 await pad(1,0,2600);await pad(0,-1,2200);const lim=await st();const Wd=await E(()=>ARC.modules.claw._world);
 ok('5 butées : le chariot s’arrête aux bords, les doigts ouverts restent dans la vitrine',Math.abs(lim.gx-(Wd.WX-Wd.REACH))<.01&&Math.abs(lim.gz-(Wd.WD-Wd.REACH))<.01,{lim,Wd});
 // ---- 6. viser un lot et DESCENDRE : descente, arrêt au contact, fermeture, montée, retour, ouverture ----
 const tgt=await E(()=>{const S=ARC.modules.claw._state,W=ARC.modules.claw._world;const c=S.ps.filter(p=>p.x>W.REACH&&p.x<W.WX-W.REACH&&p.z>W.REACH&&p.z<W.WD-W.REACH).sort((a,b)=>b.y-a.y)[0];return{x:c.x,z:c.z,y:c.y,id:c.T.id}});
 for(let i=0;i<14;i++){const s=await st();const dx=tgt.x-s.gx,dz=tgt.z-s.gz;if(Math.abs(dx)<1.2&&Math.abs(dz)<1.2)break;await pad(Math.abs(dx)>1.2?Math.sign(dx):0,Math.abs(dz)>1.2?-Math.sign(dz):0,Math.min(500,Math.max(60,Math.hypot(dx,dz)/30*1000)))}
 const aimed=await st();await big();const seq=[];let stopY=null;for(let i=0;i<120;i++){const s=await st();if(seq[seq.length-1]!==s.ph)seq.push(s.ph);if(s.ph=='grab'&&stopY==null)stopY=s.y;if(s.ph=='close'&&i%4==0&&!fs.existsSync(`${O}/cl_03_prise.png`))await p.screenshot({path:`${O}/cl_03_prise.png`});
  if(s.ph=='home'&&!fs.existsSync(`${O}/cl_04_montee.png`))await p.screenshot({path:`${O}/cl_04_montee.png`});if(s.ph=='win'){await p.screenshot({path:`${O}/cl_05_victoire_reelle.png`});await W(900);await big()}if(s.ph=='ready'||s.ph=='nocredit')break;await W(100)}
 const after=await st();const minY=await E(()=>ARC.modules.claw._hubMin(50,50,1));
 ok('6 DESCENDRE : descente → arrêt au premier contact (tas ou sol) → fermeture → montée → retour au-dessus de la goulotte → ouverture',['drop','grab','close','rise','home','release','settle'].every(k=>seq.includes(k))&&stopY<80&&stopY>=minY-.01&&after.ph=='ready'&&after.cr==s3b.cr,{tgt,aimed:{gx:aimed.gx,gz:aimed.gz},stopY,minY,seq,after});
 // ---- 7. physique : quelques tentatives automatiques complètes, invariants contrôlés en continu ----
 const res=await E(async()=>{const M=ARC.modules.claw,S=M._state,W=M._world;let wins=0,lifted=0,tries=0;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(let a=0;a<4;a++){S.credits=Math.max(S.credits,2);S.phase='ready';M._insert();tries++;const t=S.ps.filter(p=>p.x>W.REACH&&p.x<W.WX-W.REACH&&p.z>W.REACH&&p.z<W.WD-W.REACH).sort((a,b)=>b.y-a.y)[a%2];
   S.claw.gx=t.x;S.claw.gz=t.z;await sleep(500);const w0=S.won.length;M._drop();let lf=false;for(let i=0;i<160;i++){await sleep(60);if(S.lifted)lf=true;if(S.phase=='win'){S.pt=1;M._big()}if(S.phase=='ready'||S.phase=='nocredit')break}
   if(S.won.length>w0)wins++;if(lf)lifted++}return{tries,wins,lifted,score:S.score,col:JSON.stringify(N.arcade.claw.col||{})}});
 const v=await E(()=>window.__viol);
 ok('7 collisions : aucun lot ni doigt ne traverse la vitrine ou le sol (contrôle à chaque image)',v.n==0&&v.f==0&&v.frames>200,{v,res});
 // ---- 8. récompense : un lot qui tombe dans la goulotte est gagné, ajouté à la collection et sauvegardé ----
 const before=await E(()=>({score:ARC.modules.claw._state.score,col:JSON.parse(JSON.stringify(N.arcade.claw.col||{}))}));
 await E(()=>{const M=ARC.modules.claw,S=M._state;S.phase='ready';S.credits=3;S.ps.push(M._newPrize(M._prizes[11],15,40,14))});
 let wph=null;for(let i=0;i<40;i++){await W(150);const s=await st();if(s.ph=='win'){wph=s;break}}await W(700);await p.screenshot({path:`${O}/cl_06_victoire.png`});
 const won=await E(()=>({score:ARC.modules.claw._state.score,col:N.arcade.claw.col,sav:(()=>{try{return JSON.stringify(localStorage).includes('oeuf')}catch(e){return null}})(),fx:window.__fx.filter(n=>/^cl/.test(n))}));
 ok('8 victoire : OEUF DORÉ (légendaire) tombé dans la goulotte → animation, +150 points, collection mise à jour',wph&&wph.ph=='win'&&won.score>=before.score+150&&(won.col.oeuf||0)==(before.col.oeuf||0)+1,{before,wph,won:{score:won.score,col:won.col,sav:won.sav}});
 await W(900);await big();await W(300);
 // ---- 9. collection (bouton du haut) ----
 const cb=await E(()=>ARC.modules.claw._state.L.colB);await E(()=>{const S=ARC.modules.claw._state;if(S.phase!='ready'&&S.phase!='nocredit'){S.phase='ready'}});await tapG(cb.x+cb.w/2,cb.y+cb.h/2);await W(300);const c1=await st();await p.screenshot({path:`${O}/cl_07_collection.png`});
 const fb=await E(()=>ARC.modules.claw._state.btns.find(b=>b.id=='close'));await tapG(fb.x+fb.w/2,fb.y+fb.h/2);await W(200);const c2=await st();
 ok('9 collection : ouverture depuis la barre du haut, 12 lots (découverts / silhouettes), FERMER',c1.ph=='col'&&c2.ph=='ready',{c1:c1.ph,c2:c2.ph});
 // ---- 10. plus de crédits : achat avec les pièces de Little Life, puis fin de partie → écran REJOUER de la borne ----
 await E(()=>{const S=ARC.modules.claw._state;S.credits=0;S.phase='nocredit';S.pt=1;N.coins=25;coinsUI()});await W(200);await p.screenshot({path:`${O}/cl_08_credits.png`});
 const bb=await E(()=>ARC.modules.claw._state.btns.find(b=>b.id=='buy'));await tapG(bb.x+bb.w/2,bb.y+bb.h/2);await W(200);const k1=await E(()=>({ph:ARC.modules.claw._state.phase,cr:ARC.modules.claw._state.credits,coins:N.coins}));
 await E(()=>{const S=ARC.modules.claw._state;S.credits=0;S.phase='nocredit';S.pt=1;N.coins=3});await W(200);const bb2=await E(()=>ARC.modules.claw._state.btns.find(b=>b.id=='buy'));await tapG(bb2.x+bb2.w/2,bb2.y+bb2.h/2);await W(150);const k2=await E(()=>({ph:ARC.modules.claw._state.phase,cr:ARC.modules.claw._state.credits,coins:N.coins}));
 const sc=await E(()=>ARC.modules.claw._state.score);const eb=await E(()=>ARC.modules.claw._state.btns.find(b=>b.id=='end'));await tapG(eb.x+eb.w/2,eb.y+eb.h/2);await W(500);const k3=await E(()=>({st:ARC.state,over:ARC.over,best:N.arcade.claw.best,plays:N.arcade.claw.plays}));await p.screenshot({path:`${O}/cl_09_fin.png`});
 ok('10 crédits : +5 crédits contre 10 pièces, refus sans assez de pièces, TERMINER → fin de partie de la borne (score enregistré)',k1.cr==5&&k1.coins==15&&k1.ph=='ready'&&k2.cr==0&&k2.coins==3&&k2.ph=='nocredit'&&k3.st=='over'&&k3.over.id=='claw'&&k3.over.score==sc&&k3.best>=sc,{k1,k2,k3,sc});
 // ---- 11. recommencer (REJOUER de la borne) puis RETOUR ----
 await E(()=>{ARC.overSel=0;arcOk()});await W(500);const r1=await E(()=>({st:ARC.state,ph:ARC.modules.claw._state.phase,cr:ARC.modules.claw._state.credits,sc:ARC.modules.claw._state.score}));
 const bk=await E(()=>ARC.modules.claw._state.L.back);await tapG(bk.x+bk.w/2,bk.y+bk.h/2);await W(500);const r2=await E(()=>({st:ARC.state,cur:ARC.cur,on:ARC.on,col:Object.keys(N.arcade.claw.col||{}).length}));await p.screenshot({path:`${O}/cl_10_retour_borne.png`});
 ok('11 REJOUER relance une partie neuve (8 crédits) ; RETOUR revient au catalogue de la borne, collection conservée',r1.st=='game'&&r1.ph=='title'&&r1.cr==8&&r1.sc==0&&r2.st=='menu'&&!r2.cur&&r2.on&&r2.col>=1,{r1,r2});
 // ---- 12. orientations et tailles d'écran (rotation en pleine partie) ----
 const sizes=[[390,844],[844,390],[320,568],[568,320],[768,1024],[1024,768],[1280,800],[1920,1080]];const lay=[];
 await E(()=>{arcStart(ARC.games.find(g=>g.id=='claw'));const M=ARC.modules.claw;M._big();M._big()});await W(300);
 for(const[w,h]of sizes){await p.setViewportSize({width:w,height:h});await W(450);const o=await E(()=>{const L=ARC.modules.claw._state.L,G=L.glass,r=AX.cv.getBoundingClientRect(),inn=(b)=>b.x>=0&&b.y>=0&&b.x+b.w<=L.w+.5&&b.y+b.h<=L.h+.5;
   const circ=(c)=>c.x-c.r>=0&&c.x+c.r<=L.w&&c.y-c.r>=L.hud&&c.y+c.r<=L.h;return{L:[L.w,L.h],land:L.land,glass:inn(G)&&G.y>=L.hud,cab:inn(L.cab),pad:circ(L.pad),big:circ(L.big),
   sep:L.land?L.pad.x+L.pad.r<L.mach.x&&L.big.x-L.big.r>L.mach.x+L.mach.w:L.pad.y-L.pad.r>L.cab.y+L.cab.h,k:+L.k.toFixed(2),padCss:+(L.pad.r*r.width/AX.L.W).toFixed(0),scroll:[document.documentElement.scrollWidth<=innerWidth,document.documentElement.scrollHeight<=innerHeight]}});
  lay.push({w,h,...o});await p.screenshot({path:`${O}/cl_taille_${w}x${h}.png`})}
 await pad(-1,0,300);const rot=await st();
 ok('12 portrait et paysage, téléphone et tablette : vitrine, croix et bouton DESCENDRE entièrement visibles, sans chevauchement ni débordement ; jeu toujours jouable après rotation',lay.every(o=>o.glass&&o.cab&&o.pad&&o.big&&o.sep&&o.scroll[0]&&o.scroll[1]&&o.padCss>=40)&&rot.ph=='aim',lay.map(o=>[o.w+'x'+o.h,o.land?'paysage':'portrait',o.k,o.padCss,o.glass&&o.cab&&o.pad&&o.big&&o.sep]));
 // ---- 13. clavier ----
 const kb0=await st();await p.keyboard.down('ArrowRight');await W(400);await p.keyboard.up('ArrowRight');await p.keyboard.down('ArrowUp');await W(300);await p.keyboard.up('ArrowUp');const kb1=await st();await p.keyboard.press('Enter');await W(300);const kb2=await st();
 ok('13 clavier : flèches = déplacement, Entrée = DESCENDRE',kb1.gx>kb0.gx&&kb1.gz>kb0.gz&&['open','drop'].includes(kb2.ph),{kb0,kb1,kb2:kb2.ph});
 const v2=await E(()=>window.__viol);ok('14 aucune erreur JavaScript, invariants de vitrine respectés jusqu’au bout',errs.length==0&&v2.n==0&&v2.f==0,{errs,v2});
 fs.writeFileSync(`${O}/claw_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
