// Tests réels du menu des paramètres sur mobile (Playwright + Chrome, écrans tactiles, vrais gestes au doigt).
// Usage : node rue/tests/menu_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
const boot=async p=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
// tous les éléments du menu, de haut en bas
const ITEMS=['gClose','gMus','gTalk','gShell','gSave','gTitle','gPseudo','gFf0','gFf1','gFf2','gTuto','gExp','gImp','gNew'];
// petits écrans réels (fenêtre visible avec les barres du navigateur), portrait et paysage
const FORMATS=[['iPhone SE, Safari (portrait)',375,553,2,'portrait'],['Android compact (portrait)',360,560,3,'portrait'],['iPhone 14 (portrait)',390,664,3,'portrait'],
 ['Android 20:9 (portrait)',412,780,2.6,'portrait'],['iPhone SE (paysage)',667,320,2,'land'],['Android (paysage)',780,360,2.6,'land']];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const errs=[];let k=0;
 for(const[nom,w,h,dpr,mode]of FORMATS){k++;const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nom+': '+e.message));await boot(p);
  const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),cdp=await ctx.newCDPSession(p);
  // vrai glissement du doigt : appui, déplacements successifs, relâchement
  const drag=async(x,y,dy)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/12}]});await W(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(120)};
  await E(m=>LS.setMode(m=='land'?'auto':'portrait'),mode);await W(400);
  // ouvrir le menu au doigt
  await p.tap('#bMenu');await W(400);
  const geo=()=>E(ids=>{const c=document.querySelector('#gmenu .gcard'),cr=c.getBoundingClientRect(),vh=innerHeight;
   const items=ids.map(id=>{const e=document.getElementById(id);if(!e)return[id,null];const r=e.getBoundingClientRect();return[id,{t:Math.round(r.top),b:Math.round(r.bottom),h:Math.round(r.height)}]});
   return{open:!document.getElementById('gmenu').hidden,card:{t:Math.round(cr.top),b:Math.round(cr.bottom)},vh,scrollH:c.scrollHeight,clientH:c.clientHeight,scrollTop:Math.round(c.scrollTop),items:Object.fromEntries(items),
    giH:[...c.querySelectorAll('.gi')].filter(e=>e.offsetParent&&!e.classList.contains('gsh')&&!e.classList.contains('gps')&&!e.classList.contains('gson')).map(e=>Math.round(e.getBoundingClientRect().height)),
    font:getComputedStyle(document.getElementById('gTuto')).fontSize}},ITEMS);
  const g0=await geo();const land=await E(()=>LS.land);const longer=g0.scrollH>g0.clientH+2;
  ok(k+'.1 '+nom+' : menu ouvert, entièrement dans l’écran (carte '+g0.card.t+'→'+g0.card.b+' / '+g0.vh+' px)'+(longer?', contenu plus haut que l’écran : '+g0.scrollH+' px pour '+g0.clientH+' visibles':''),
   g0.open&&land==(mode=='land')&&g0.card.t>=0&&g0.card.b<=g0.vh,{card:g0.card,vh:g0.vh,scrollH:g0.scrollH,clientH:g0.clientH});
  ok(k+'.2 '+nom+' : rien n’est compressé (boutons à 46 px, police d’origine '+g0.font+')',g0.giH.length>=6&&g0.giH.every(x=>x==46)&&g0.font=='16px',{giH:g0.giH,font:g0.font});
  // faire défiler au doigt (vrai geste tactile) jusqu'en bas
  const yb=Math.round(g0.card.b-30),span=-Math.round((g0.card.b-g0.card.t)*.6);for(let i=0;i<6;i++)await drag(Math.round(w/2),yb,span);
  await W(500);const g1=await geo();const last=g1.items.gNew;
  ok(k+'.3 '+nom+' : défilement au doigt jusqu’en bas, « Nouvelle partie » entièrement visible ('+last.t+'→'+last.b+')',
   (!longer||g1.scrollTop>0)&&last.t>=g1.card.t&&last.b<=g1.card.b&&last.b<=g1.vh,{scrollTop:g1.scrollTop,last,card:g1.card});
  // chaque élément peut être amené à l'écran puis touché (rien de bloqué hors écran)
  const reach=await E(ids=>{const c=document.querySelector('#gmenu .gcard'),cr=c.getBoundingClientRect(),bad=[];for(const id of ids){const e=document.getElementById(id);if(!e){bad.push(id+' absent');continue}
    e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+Math.min(r.height/2,20),hit=document.elementFromPoint(x,y);
    if(r.top<cr.top-1||r.bottom>cr.bottom+1||!(hit===e||e.contains(hit)||(hit&&hit.closest('.gi')===e.closest('.gi'))))bad.push(id)}return bad},ITEMS);
  ok(k+'.4 '+nom+' : les '+ITEMS.length+' éléments du menu (dialogues, contour, enregistrer, écran titre, pseudo, polices, didacticiel, exporter, importer, nouvelle partie…) s’affichent et reçoivent le toucher',reach.length==0,reach);
  // vrais touchers : remonter au doigt, changer la police, ouvrir puis annuler « Nouvelle partie »
  for(let i=0;i<6;i++)await drag(Math.round(w/2),Math.round(g0.card.t+60),-span);
  await W(400);const top=await geo();
  await E(()=>document.getElementById('gFf1').scrollIntoView({block:'center'}));await W(200);const ff0=await E(()=>N.ff);await p.tap('#gFf1');await W(250);const ff1=await E(()=>N.ff);
  await E(()=>document.getElementById('gNew').scrollIntoView({block:'center'}));await W(200);await p.tap('#gNew');await W(300);
  const conf=await E(()=>{const c=document.getElementById('gConf'),r=c.getBoundingClientRect(),cr=document.querySelector('#gmenu .gcard').getBoundingClientRect();c.scrollIntoView({block:'nearest'});const r2=c.getBoundingClientRect();return{shown:!c.hidden,inCard:r2.top>=cr.top-1&&r2.bottom<=cr.bottom+1}});
  await p.tap('#gNo');await W(250);
  await E(f=>{N.ff=f;ffApply();gDraw()},ff0);
  ok(k+'.5 '+nom+' : retour en haut au doigt, touchers réels : la police change, « Nouvelle partie » ouvre sa confirmation (visible) et « Annuler » la referme',
   top.scrollTop==0&&ff1==1&&conf.shown&&conf.inCard&&(await E(()=>document.getElementById('gConf').hidden)),{top:top.scrollTop,ff0,ff1,conf});
  await p.screenshot({path:O+'/menu_'+k+'.png'});
  // fermer le menu : le jeu continue normalement
  await E(()=>document.querySelector('#gmenu .gcard').scrollTop=0);await p.tap('#gClose');await W(300);
  const t0=await E(()=>C.t);await W(500);const run=await E(t=>({closed:document.getElementById('gmenu').hidden,moving:C.t!=t,page:document.documentElement.scrollHeight-innerHeight}),t0);
  ok(k+'.6 '+nom+' : menu fermé, le jeu tourne normalement et la page ne défile pas',run.closed&&run.moving&&run.page<=0,run);
  await ctx.close()}
 ok('7 aucune erreur JavaScript',errs.length==0,errs);
 const n=R.filter(r=>r.ok).length;console.log(n+'/'+R.length+' tests réussis');fs.writeFileSync(O+'/menu_resultats.json',JSON.stringify(R,null,1));await b.close();process.exit(n==R.length?0:1)})();
