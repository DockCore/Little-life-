// Tests réels de la salle d'arcade (Playwright + Chrome). Usage : node rue/tests/arcade_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,500):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await boot(p);
await E(()=>{tod=0;streetEnter()});await W(400);
// 1. ouverture depuis la porte
const before=await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x-60;STV.cam=Math.max(0,STV.px-STV.W*.45);return STV.px});await W(1500);
const cvb=await p.locator('#stCv').boundingBox();const tg=await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');return{x:(a.x+a.door.x-STV.cam)/STV.W,y:(ST_BASE-40+STV.oy)/STV.H}});
const t0=Date.now();await p.mouse.click(cvb.x+tg.x*cvb.width,cvb.y+tg.y*cvb.height);await p.waitForFunction(()=>ARC.on&&curV=='arcade',null,{timeout:2000});const dt=Date.now()-t0;await W(400);
const o1=await E(()=>{const r=document.getElementById('arc').getBoundingClientRect();let bad=[];for(let i=1;i<10;i++)for(let j=1;j<10;j++){const e=document.elementFromPoint(r.x+r.width*i/10,r.y+r.height*j/10);if(!e||!e.closest('#arc,.coins,#bMus,.hud,.hud2'))bad.push(e&&(e.id||e.className))}
 return{sel:ARC.sel,mode:ARC.mode,px:STV.px,street:document.getElementById('street').hidden||!STV.on,bad,tiles:document.querySelectorAll('#arcGrid .arcTile[data-i]').length,selName:document.querySelector('#arcGrid .sel .arcName').textContent}});
await p.screenshot({path:`${O}/arc_01_menu.png`});
ok('1 ouverture du menu arcade depuis la porte (immédiate, sans personnage, 1er jeu sélectionné)',dt<800&&o1.sel==0&&o1.mode=='menu'&&o1.px==before&&o1.street&&o1.bad.length==0&&o1.tiles==14&&o1.selName=='Space Attack',{dt,o1});
// 2. les 14 jeux, grille de 4 colonnes, cases carrées avec illustration et nom
const g=await E(()=>{const T=[...document.querySelectorAll('#arcGrid .arcTile[data-i]')].map(t=>{return{n:t.querySelector('.arcName').textContent,x:t.offsetLeft,y:t.offsetTop,w:t.offsetWidth,h:t.offsetHeight,art:!!t.querySelector('canvas.arcArt')}});
 const xs=[...new Set(T.map(t=>t.x))],ys=[...new Set(T.map(t=>t.y))];return{names:T.map(t=>t.n),cols:xs.length,rows:ys.length,square:T.every(t=>Math.abs(t.w-t.h)<=1),art:T.every(t=>t.art),empty:document.querySelectorAll('#arcGrid .arcEmpty').length,
 artsDiff:new Set([...document.querySelectorAll('#arcGrid canvas.arcArt')].map(c=>c.toDataURL().length+':'+c.toDataURL().slice(-40))).size}});
const want=['Space Attack','Snake','Brick Breaker','Pinball','Maze Runner','Bubble Pop','Whack-a-Mole','Mini Racing','Air Hockey','Lucky Claw','Perfect Stack','Box Master','Street Basket','Memory'];
ok('2 les 14 jeux affichés (4 colonnes, cases carrées, illustration propre à chaque jeu, nom)',JSON.stringify(g.names)==JSON.stringify(want)&&g.cols==4&&g.rows==4&&g.square&&g.art&&g.artsDiff==14&&g.empty==2,g);
// 3. navigation dans les 4 directions (clavier), sans saut inattendu
const nav=await E(()=>{const seq=[];const go=d=>{arcMove(d);seq.push(ARC.sel)};ARC.sel=0;arcRender();
 go('left');go('up');go('right');go('down');go('left');go('up');// 0 0 1 5 4 0
 ARC.sel=3;arcRender();go('right');// 3
 ARC.sel=9;arcRender();go('down');go('right');go('down');// 13 13 13
 ARC.sel=10;arcRender();go('down');// 10 (pas de case vide)
 ARC.sel=12;arcRender();go('left');go('down');go('up');go('up');go('up');go('up');return seq});
ok('3 navigation haut/bas/gauche/droite, bords bloquants, jamais de case vide',JSON.stringify(nav)==JSON.stringify([0,0,1,5,4,0,3,13,13,13,10,12,12,8,4,0,0]),nav);
await E(()=>{ARC.sel=0;arcRender()});
for(const k of['ArrowRight','ArrowRight','ArrowDown','ArrowLeft','KeyS','KeyD','ArrowUp'])await p.keyboard.press(k);const kb=await E(()=>ARC.sel);
// joystick : pousser le manche (glisser), et maintenir une flèche (répétition régulière)
await E(()=>{ARC.sel=0;arcRender()});const jb=await p.locator('#arcBase').boundingBox();const cx=jb.x+jb.width/2,cy=jb.y+jb.height/2;
await p.mouse.move(cx,cy);await p.mouse.down();await p.mouse.move(cx+jb.width*.45,cy,{steps:4});await W(120);const tilt=await E(()=>document.getElementById('arcStick').dataset.d);await p.mouse.up();const j1=await E(()=>ARC.sel);
await p.mouse.move(cx,cy);await p.mouse.down();await p.mouse.move(cx,cy+jb.height*.45,{steps:4});await W(100);await p.mouse.up();const j2=await E(()=>ARC.sel);const rel=await E(()=>document.getElementById('arcStick').dataset.d);
const ab=await p.locator('.arcAr[data-d=right]').boundingBox();await E(()=>{ARC.sel=4;arcRender()});await p.mouse.move(ab.x+ab.width/2,ab.y+ab.height/2);await p.mouse.down();
const held=[];for(let i=0;i<10;i++){await W(100);held.push(await E(()=>ARC.sel))}await p.mouse.up();await W(300);const after=await E(()=>ARC.sel);
ok('3b clavier, manche du joystick (inclinaison visible) et flèches maintenues : déplacement fluide et précis',kb==6&&tilt=='right'&&j1==1&&j2==5&&rel==''&&held[0]==5&&held[held.length-1]==7&&after==7&&held.every((v,i)=>i==0||v-held[i-1]<=1),{kb,tilt,j1,j2,held,after});
// 4. sélection visuelle
await E(()=>{ARC.sel=6;arcRender()});await W(350);const vis=await E(()=>{const T=[...document.querySelectorAll('#arcGrid .arcTile[data-i]')],s=T.filter(t=>t.classList.contains('sel')),cs=getComputedStyle(s[0]),o=getComputedStyle(T[0]);
 return{n:s.length,i:+s[0].dataset.i,aria:s[0].getAttribute('aria-selected'),border:cs.borderColor,other:o.borderColor,shadow:cs.boxShadow!='none',info:document.getElementById('arcInfo').textContent}});
await W(300);await p.screenshot({path:`${O}/arc_04_selection.png`});
ok('4 cadre de sélection lumineux sur une seule case + infos du jeu',vis.n==1&&vis.i==6&&vis.aria=='true'&&vis.border!=vis.other&&vis.shadow&&/Whack-a-Mole/.test(vis.info),vis);
// 5. ENTRER : jeu non développé -> indication claire, pas de faux lancement ; retour au menu
await p.click('#arcEnter');await W(60);const press=await E(()=>document.getElementById('arcEnter').classList.contains('press'));await W(250);
const soon=await E(()=>({mode:ARC.mode,vis:!document.getElementById('arcPlay').hidden,txt:document.getElementById('arcPlay').textContent}));await p.screenshot({path:`${O}/arc_05_bientot.png`});
await p.click('.arcBack');const back1=await E(()=>({mode:ARC.mode,sel:ARC.sel,hidden:document.getElementById('arcPlay').hidden}));
await p.keyboard.press('Enter');const soon2=await E(()=>ARC.mode);await p.keyboard.press('Enter');const back2=await E(()=>ARC.mode);
// système de lancement : un module enregistré est réellement démarré, peut enregistrer un score et revenir au menu
const mod=await E(()=>{const log=[];ARC.register('memory',{start(el,api){log.push('start');el.innerHTML='<p id="tstGame">jeu test</p>';api.score(42,3);api.score(17,1);this.api=api},stop(){log.push('stop')}});ARC.sel=13;arcRender();arcEnter();
 const inGame={mode:ARC.mode,el:!!document.getElementById('tstGame'),best:ARC.data('memory').best,level:ARC.data('memory').level};ARC.modules.memory.api.exit();const r={log,inGame,mode:ARC.mode,saved:N.arcade.memory};delete ARC.modules.memory;delete N.arcade.memory;save();arcRender();return r});
ok('5 bouton ENTRER (effet d’appui) : « en développement » clair pour un jeu pas encore fait, vrai lancement pour un jeu enregistré, retour au menu',press&&soon.mode=='soon'&&soon.vis&&/EN DÉVELOPPEMENT/.test(soon.txt)&&/Whack-a-Mole/.test(soon.txt)&&back1.mode=='menu'&&back1.sel==6&&back1.hidden&&soon2=='soon'&&back2=='menu'
 &&mod.log.join()=='start,stop'&&mod.inGame.el&&mod.inGame.best==42&&mod.inGame.level==3&&mod.mode=='menu'&&mod.saved.best==42,{press,soon:soon.mode,back1,soon2,back2,mod});
// 6. SORTIR : depuis un jeu -> menu ; depuis le menu -> monde principal, au même endroit
await E(()=>{ARC.sel=2;arcRender()});await p.click('#arcEnter');await W(100);await p.click('#arcOut');const s1=await E(()=>({mode:ARC.mode,on:ARC.on}));
await p.click('#arcOut');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:3000});await W(350);const s2=await E(()=>({px:STV.px,place,st:C.st,arc:ARC.on,hidden:document.getElementById('arc').hidden}));
await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(200);await p.keyboard.press('Escape');await W(300);const s3=await E(()=>({street:STV.on,arc:ARC.on}));
ok('6 bouton SORTIR (et Échap) : retour au menu depuis un jeu, puis au monde principal au même endroit',s1.mode=='menu'&&s1.on&&s2.px==before&&s2.place=='street'&&s2.st=='street'&&!s2.arc&&s2.hidden&&s3.street&&!s3.arc,{s1,s2,s3});
// 7. rechargement pendant l'arcade : retour dans la rue
await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x-3;stInteract()});await W(200);const pxR=await E(()=>ARC.back.x);await p.reload();await W(3200);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});await W(500);const rl=await E(()=>({on:STV.on,px:STV.px,arc:ARC.on}));
ok('7 rechargement dans l’arcade : retour dans la rue au même endroit',rl.on&&!rl.arc&&Math.abs(rl.px-pxR)<1,rl);
ok('8 aucune erreur JavaScript',errs.length==0,errs);await ctx.close();
// 9. tailles d'écran : tout est visible, rien ne déborde ni ne se chevauche
const sizes=[];for(const [nom,vp,sc] of [['petit téléphone',{width:320,height:568},2],['téléphone',{width:390,height:844},2],['grand téléphone',{width:430,height:932},3],['tablette',{width:820,height:1180},2],['ordinateur',{width:1280,height:800},1],['grand écran',{width:1920,height:1080},1]]){
 const c=await b.newContext({viewport:vp,deviceScaleFactor:sc});const q=await c.newPage();const er=[];q.on('pageerror',e=>er.push(e.message));await boot(q);
 await q.evaluate(()=>{streetEnter();const a=STC.buildings.find(z=>z.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await q.waitForTimeout(700);
 const m=await q.evaluate(()=>{const scr=document.getElementById('arcScr').getBoundingClientRect(),inR=(r,o,t=1)=>r.left>=o.left-t&&r.right<=o.right+t&&r.top>=o.top-t&&r.bottom<=o.bottom+t,ov=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  const tiles=[...document.querySelectorAll('#arcGrid .arcTile')].map(t=>t.getBoundingClientRect()),hud=['coins','bMus'].map(id=>document.getElementById(id)).filter(e=>e&&e.getBoundingClientRect().width).map(e=>e.getBoundingClientRect());
  const vp={left:0,top:0,right:innerWidth,bottom:innerHeight},ctl=['arcEnter','arcOut','arcBase','arcInfo'].map(id=>document.getElementById(id).getBoundingClientRect()),arrows=[...document.querySelectorAll('.arcAr')].map(e=>e.getBoundingClientRect());
  const logo=document.querySelector('.arcLogo').getBoundingClientRect();
  return{t:Math.round(tiles[0].width),tilesIn:tiles.every(r=>inR(r,scr)),hudOverlap:tiles.some(r=>hud.some(h=>ov(r,h)))||hud.some(h=>ov(logo,h)),ctlVisible:[...ctl,...arrows].every(r=>inR(r,vp)&&r.width>0),
   enterBig:ctl[0].width>=56,names:[...document.querySelectorAll('.arcName')].every(n=>n.scrollWidth<=n.clientWidth+1)}});
 await q.screenshot({path:`${O}/arc_taille_${vp.width}x${vp.height}.png`});sizes.push({nom,...m,er:er.length});await c.close()}
ok('9 affichage correct sur 7 tailles d’écran',sizes.every(s=>s.tilesIn&&!s.hudOverlap&&s.ctlVisible&&s.enterBig&&s.names&&s.er==0&&s.t>=44),sizes);
fs.writeFileSync(`${O}/arc_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
