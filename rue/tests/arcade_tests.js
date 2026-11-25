// Tests réels de la borne d'arcade plein écran (Playwright + Chrome). Usage : node rue/tests/arcade_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
// coordonnées écran (CSS) d'un point de la borne
const toCss=(p,X,Y)=>p.evaluate(([X,Y])=>{const r=AX.cv.getBoundingClientRect();return{x:r.left+X/AX.L.W*r.width,y:r.top+Y/AX.L.H*r.height}},[X,Y]);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await boot(p);await E(()=>{tod=0;streetEnter()});await W(400);
// ouverture par un clic sur la porte de la salle d'arcade
const before=await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x-60;STV.cam=Math.max(0,STV.px-STV.W*.45);return STV.px});await W(1500);
const cvb=await p.locator('#stCv').boundingBox();const tg=await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');return{x:(a.x+a.door.x-STV.cam)/STV.W,y:(ST_BASE-40+STV.oy)/STV.H}});
const t0=Date.now();await p.mouse.click(cvb.x+tg.x*cvb.width,cvb.y+tg.y*cvb.height);await p.waitForFunction(()=>ARC.on,null,{timeout:2000});const dt=Date.now()-t0;await W(700);
await p.screenshot({path:`${O}/arc2_menu_tel.png`});
// 1 + 6. la borne couvre 100 % de l'écran ; rien de Little Life n'est visible
const cov=await E(()=>{const vw=innerWidth,vh=innerHeight,c=AX.cv.getBoundingClientRect();let bad=[];for(let i=0;i<=20;i++)for(let j=0;j<=20;j++){const e=document.elementFromPoint(Math.min(vw-1,vw*i/20),Math.min(vh-1,vh*j/20));if(e!==AX.cv)bad.push(e&&(e.id||e.className))}
 return{canvas:[c.left,c.top,c.right,c.bottom],vw,vh,bad,street:!STV.on,state:ARC.state,sel:ARC.sel,z:getComputedStyle(AX.root).zIndex}});
ok('1 la borne occupe tout l’écran (ouverture immédiate depuis la porte, 1er jeu sélectionné)',dt<800&&cov.canvas[0]<=0&&cov.canvas[1]<=0&&cov.canvas[2]>=cov.vw&&cov.canvas[3]>=cov.vh&&cov.state=='menu'&&cov.sel==0,{dt,cov});
ok('6 ni personnage, ni rue, ni interface de Little Life (441 points testés)',cov.bad.length==0&&cov.street,{bad:cov.bad.slice(0,5)});
// 4. les 14 jeux visibles et accessibles
const g=await E(()=>{const G=AX.L.grid,S=AX.L.scr,ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 return{n:G.cells.length,inScreen:G.cells.every(c=>c.x>=S.x&&c.y>=S.y&&c.x+c.w<=S.x+S.w&&c.y+c.h<=S.y+S.h),overlap:G.cells.some((a,i)=>G.cells.some((b,k)=>k>i&&ov(a,b))),
  names:ARC.games.every(gm=>axWrap(gm.name,G.tw-4).every(l=>axTW(l)<=G.tw-4)),cols:G.cols,rows:G.rows,icon:G.icon}});
const reach=await E(()=>{const seen=new Set([ARC.sel]);ARC.sel=0;for(let r=0;r<6;r++){for(let k=0;k<8;k++){arcMove(r%2?'left':'right');seen.add(ARC.sel)}arcMove('down');seen.add(ARC.sel)}return seen.size});
ok('4 les 14 jeux sont affichés dans une grille régulière, lisibles et tous atteignables',g.n==14&&g.inScreen&&!g.overlap&&g.names&&reach==14,{g,reach});
// 5. joystick et boutons physiques (souris / doigt sur la borne)
await E(()=>{ARC.sel=0});const J=await E(()=>AX.L.joy);const jc=await toCss(p,J.x,J.y-J.r*.9),jr=await toCss(p,J.x+J.r*1.6,J.y-J.r*.9),jd=await toCss(p,J.x,J.y+J.r*.9);
await p.mouse.move(jc.x,jc.y);await p.mouse.down();await p.mouse.move(jr.x,jr.y,{steps:3});await W(100);const tilt=await E(()=>ARC.stick);await p.mouse.up();const s1=await E(()=>ARC.sel);
await p.mouse.move(jc.x,jc.y);await p.mouse.down();await p.mouse.move(jd.x,jd.y,{steps:3});await W(80);await p.mouse.up();const s2=await E(()=>ARC.sel);
await E(()=>{ARC.sel=0});await p.mouse.move(jc.x,jc.y);await p.mouse.down();await p.mouse.move(jd.x,jd.y,{steps:3});const held=[];for(let i=0;i<8;i++){await W(100);held.push(await E(()=>ARC.sel))}await p.mouse.up();
const btn=async id=>{const B=await E(id=>AX.L.btn.find(b=>b.id==id),id);const c=await toCss(p,B.x,B.y);await p.mouse.click(c.x,c.y)};
// case d'un jeu encore « en développement » (Perfect Stack) : la fiche s'ouvre, OK affiche le message sans lancer
await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='stack')});await btn('ok');await W(60);const pr=await E(()=>!!ARC.press.ok);const st1=await E(()=>({st:ARC.state,info:ARC.info}));await W(500);await p.screenshot({path:`${O}/arc2_info_tel.png`});
await btn('ok');const fl=await E(()=>({st:ARC.state,flash:ARC.flash>0}));await btn('back');const st2=await E(()=>ARC.state);
const ARC_STACK=await E(()=>ARC.games.findIndex(g=>g.id=='stack'));
ok('5 joystick (pousser le manche, maintien régulier) et boutons physiques OK / RETOUR',tilt=='right'&&s1==1&&s2==4&&held[0]==3&&held.at(-1)==12&&new Set(held).size>=3&&held.every((v,i)=>i==0||v-held[i-1]<=3)&&pr&&st1.st=='info'&&st1.info==ARC_STACK&&fl.st=='info'&&fl.flash&&st2=='menu',{tilt,s1,s2,held,pr,st1,fl,st2});
// clavier + écran tactile
await E(()=>{ARC.sel=0});for(const k of['ArrowRight','ArrowDown','KeyD','ArrowLeft','ArrowUp'])await p.keyboard.press(k);const kb=await E(()=>ARC.sel);
const c9=await E(()=>AX.L.grid.cells[9]);const cc=await toCss(p,c9.x+c9.w/2,c9.y+c9.h/2);await p.mouse.click(cc.x,cc.y);const tap1=await E(()=>({sel:ARC.sel,st:ARC.state}));await p.mouse.click(cc.x,cc.y);const tap2=await E(()=>ARC.state);
const arR=await E(()=>arcInfoLayout().arR);const ac=await toCss(p,arR.x+arR.w/2,arR.y+arR.h/2);await p.mouse.click(ac.x,ac.y);const nxt=await E(()=>ARC.info);
await p.keyboard.press('ArrowLeft');const prv=await E(()=>ARC.info);await p.keyboard.press('Escape');const esc=await E(()=>ARC.state);
ok('5b clavier, écran tactile (toucher une case puis la retoucher) et flèches de la présentation',kb==1&&tap1.sel==9&&tap1.st=='menu'&&tap2=='info'&&nxt==10&&prv==9&&esc=='menu',{kb,tap1,tap2,nxt,prv,esc});
// 8. transitions menu -> présentation -> jeu -> fin de partie -> rejouer / retour (avec un module de test)
const tr=await E(async()=>{const log=[];let api;ARC.register('mole',{start(a){api=a;log.push('start '+a.w+'x'+a.h)},update(dt,inp){log.u=(log.u||0)+1},draw(c,w,h){c.fillStyle='#3a8a3a';c.fillRect(0,0,w,h);log.d=(log.d||0)+1},stop(){log.push('stop')}});
 ARC.sel=6;arcOk();const s1=ARC.state;arcOk();const s2=ARC.state;await new Promise(r=>setTimeout(r,300));const frames=[log.u,log.d];api.end(120);const s3={st:ARC.state,score:ARC.over.score,rec:ARC.over.rec,best:ARC.data('mole').best};
 arcOk();const s4=ARC.state;api.end(80);const s5={st:ARC.state,rec:ARC.over.rec};arcMove('right');arcOk();const s6=ARC.state;arcBack();const s7=ARC.state;
 ARC.info=6;arcOk();arcBack();const s8=ARC.state;delete ARC.modules.mole;delete N.arcade.mole;save();ARC.state='menu';return{log:log.slice(),frames,s1,s2,s3,s4,s5,s6,s7,s8}});
ok('8 transitions : menu → présentation → jeu → fin → rejouer / retour → menu',tr.s1=='info'&&tr.s2=='game'&&tr.frames[0]>5&&tr.frames[1]>5&&tr.s3.st=='over'&&tr.s3.score==120&&tr.s3.rec&&tr.s3.best==120&&tr.s4=='game'&&tr.s5.st=='over'&&!tr.s5.rec&&tr.s6=='info'&&tr.s7=='menu'&&tr.s8=='menu'&&tr.log.filter(l=>l=='stop').length==2,tr);
// QUITTER : retour dans la rue au même endroit
await btn('quit');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:3000});await W(300);const q=await E(()=>({px:STV.px,arc:ARC.on,hidden:AX.root.hidden,place}));
await E(()=>{const a=STC.buildings.find(z=>z.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(200);await p.keyboard.press('Escape');await W(300);const q2=await E(()=>({street:STV.on,arc:ARC.on}));
ok('8b QUITTER (et Échap depuis le menu) : retour dans la rue, au même endroit',q.px==before&&!q.arc&&q.hidden&&q.place=='street'&&q2.street&&!q2.arc,{q,q2});
await E(()=>{const a=STC.buildings.find(z=>z.id=='arcade');STV.px=a.x+a.door.x-3;stInteract()});await W(200);await p.reload();await W(3200);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});await W(500);
const rl=await E(()=>({on:STV.on,arc:ARC.on}));ok('8c rechargement pendant l’arcade : retour dans la rue',rl.on&&!rl.arc,rl);
ok('9 aucune erreur JavaScript',errs.length==0,errs);await ctx.close();
// 2, 3, 7. structure complète, pas de vide, affichage propre sur 7 tailles d'écran
const sizes=[];for(const [nom,vp,dpr] of [['petit téléphone',{width:320,height:568},2],['téléphone',{width:390,height:844},3],['grand téléphone',{width:430,height:932},3],['tablette',{width:820,height:1180},2],['portable',{width:1366,height:768},1],['ordinateur',{width:1280,height:800},1],['grand écran',{width:1920,height:1080},1]]){
 const c=await b.newContext({viewport:vp,deviceScaleFactor:dpr});const q=await c.newPage();const er=[];q.on('pageerror',e=>er.push(e.message));await boot(q);
 await q.evaluate(()=>{streetEnter();GAMES.arcade.open({x:500})});await q.waitForTimeout(800);
 const m=await q.evaluate(()=>{const L=AX.L,r=AX.cv.getBoundingClientRect(),k=r.width/L.W,vis=(a)=>{const X0=r.left+a.x*k,Y0=r.top+a.y*k,X1=X0+a.w*k,Y1=Y0+a.h*k;return X0>=-.5&&Y0>=-.5&&X1<=innerWidth+.5&&Y1<=innerHeight+.5};
  const d=AX.x.getImageData(0,0,L.W,L.H).data;let bg=0;for(let i=0;i<d.length;i+=4)if(d[i]==7&&d[i+1]==5&&d[i+2]==26)bg++;const G=L.grid,gx0=Math.min(...G.cells.map(c=>c.x)),gx1=Math.max(...G.cells.map(c=>c.x+c.w)),gy0=Math.min(...G.cells.map(c=>c.y)),gy1=Math.max(...G.cells.map(c=>c.y+c.h));
  const bt=L.btn.map(b=>({x:b.x-b.r-3,y:b.y-b.r,w:2*b.r+6,h:2*b.r+14}));
  return{internal:L.W+'x'+L.H,px:+(k).toFixed(2),font:+(7*k).toFixed(1),grid:G.cols+'x'+G.rows,icon:+(G.icon*k).toFixed(0),
   parts:vis(L.marq)&&vis(L.bez)&&vis(L.pan)&&vis(L.front)&&vis({x:L.m,y:L.m,w:L.sp,h:L.H-2*L.m})&&vis({x:L.W-L.m-L.sp,y:L.m,w:L.sp,h:L.H-2*L.m})&&bt.every(vis)&&vis({x:L.joy.x-L.joy.r*1.2,y:L.joy.y-L.joy.r*2.3,w:L.joy.r*2.4,h:L.joy.r*2.9}),
   vide:+(bg/(L.W*L.H)*100).toFixed(2),ecran:+(L.scr.w*L.scr.h/(L.W*L.H)*100).toFixed(0),remplissage:+((gx1-gx0)*(gy1-gy0)/(L.scr.w*L.scr.h)*100).toFixed(0),scroll:document.scrollingElement.scrollHeight>innerHeight+1&&getComputedStyle(document.body).overflow!='hidden'?0:0}});
 await q.screenshot({path:`${O}/arc2_taille_${vp.width}x${vp.height}.png`});sizes.push({nom,...m,er:er.length});await c.close()}
ok('2 structure complète visible partout (fronton, flancs, écran, pupitre, joystick, boutons, façade)',sizes.every(s=>s.parts),sizes.map(s=>[s.nom,s.parts]));
ok('3 aucun espace vide inutile (fond nu < 2 %, écran ≥ 35 % de la borne, grille ≥ 70 % de l’écran)',sizes.every(s=>s.vide<2&&s.ecran>=35&&s.remplissage>=70),sizes.map(s=>[s.nom,s.vide,s.ecran,s.remplissage]));
ok('7 affichage propre sur téléphone, tablette et ordinateur (texte ≥ 9 px, illustrations ≥ 32 px, sans erreur)',sizes.every(s=>s.font>=9&&s.icon>=32&&s.er==0),sizes);
fs.writeFileSync(`${O}/arc2_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
