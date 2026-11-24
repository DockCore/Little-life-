// Tests réels du nouvel écran titre (Playwright + Chrome mobile tactile).
// Usage : node rue/tests/titre_tests.js
const path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,900):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const errs=[];
 // contexte neuf (stockage vide), téléphone vertical ; espion sur les sons et sur les notes jouées
 const open=async(w=390,h=844,ctx)=>{ctx=ctx||await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.__fx=[];window.__notes=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON),t=JEUSON.tone.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);window.__cur=n;return f(n,...a)};JEUSON.tone=(fr,...a)=>{if(window.__cur)window.__notes.push([window.__cur,Math.round(fr)]);return t(fr,...a)};clearInterval(iv)}},5)});
  await p.goto(JEU);await p.waitForTimeout(1200);return {ctx,p}};
 const passIntro=async p=>{for(let i=0;i<10&&await p.evaluate(()=>!!document.getElementById('intro'));i++){await p.touchscreen.tap(195,300);await p.waitForTimeout(500)}await p.waitForTimeout(1400)};
 const ctr=(p,id)=>p.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,l:r.left,t:r.top,r:r.right,b:r.bottom}},id);
 const tap=async(p,id)=>{const c=await ctr(p,id);await p.touchscreen.tap(c.x,c.y);return c};
 const vis=(p,id)=>p.evaluate(id=>{const e=document.getElementById(id);return!!e&&!e.hidden&&getComputedStyle(e).display!='none'},id);
 // ---- 1. lancement : la nouvelle illustration en plein écran, l'ancienne a disparu ----
 let {ctx,p}=await open();await passIntro(p);
 const L=await p.evaluate(()=>{const a=document.querySelector('#tscr .tart.tp'),T=document.getElementById('tscr'),bx=document.querySelector('#tscr .tbox').getBoundingClientRect(),cs=getComputedStyle(a);
  const imgs=[...document.images].map(i=>i.naturalWidth+'x'+i.naturalHeight);
  return{vis:!T.hidden,nat:a.naturalWidth+'x'+a.naturalHeight,box:[bx.left,bx.top,bx.right,bx.bottom].map(Math.round),W:innerWidth,H:innerHeight,filter:cs.filter,op:cs.opacity,ancienne:imgs.includes('1086x1448'),scroll:document.documentElement.scrollHeight-innerHeight,geo:TITRE.geo,fx:window.__fx.length}});
 // fidélité : l'image affichée = l'illustration fournie (écart moyen par pixel)
 const src=path.resolve(__dirname,'../titre/source_ecran_titre.png');const dataUrl=await p.evaluate(()=>{const a=document.querySelector('#tscr .tart.tp'),c=document.createElement('canvas');c.width=a.naturalWidth;c.height=a.naturalHeight;c.getContext('2d').drawImage(a,0,0);return c.toDataURL('image/png')});
 fs.writeFileSync('/tmp/_titre.png',Buffer.from(dataUrl.split(',')[1],'base64'));
 const ecart=+execFileSync('python3',['-c',`from PIL import Image,ImageChops,ImageStat\na=Image.open('/tmp/_titre.png').convert('RGB');b=Image.open('${src}').convert('RGB')\nprint(round(sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3,3) if a.size==b.size else 999)`]).toString();
 const dataL=await p.evaluate(()=>{const a=document.querySelector('#tscr .tart.tl'),c=document.createElement('canvas');c.width=a.naturalWidth;c.height=a.naturalHeight;c.getContext('2d').drawImage(a,0,0);return c.toDataURL('image/png')});fs.writeFileSync('/tmp/_titreL.png',Buffer.from(dataL.split(',')[1],'base64'));
 const srcL=path.resolve(__dirname,'../titre/source_ecran_titre_paysage.png');const ecartL=+execFileSync('python3',['-c',`from PIL import Image,ImageChops,ImageStat\na=Image.open('/tmp/_titreL.png').convert('RGB');b=Image.open('${srcL}').convert('RGB')\nprint(round(sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3,3) if a.size==b.size else 999)`]).toString();
 const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
 await p.screenshot({path:`${O}/ti_01_titre_390x844.png`});
 // zone essentielle (logo, personnage entier, deux boutons) visible
 const crit=await p.evaluate(()=>{const g=TITRE.geo;return{l:g.tx+86*g.s,t:g.ty+14*g.s,r:g.tx+855*g.s,b:g.ty+1594*g.s}});
 ok('1 lancement : nouvelle illustration (941×1672, fidèle à l’original), plein écran vertical sans bande ni marge, logo/personnage/boutons entiers, aucun filtre ni voile, aucun défilement, aucun son avant interaction ; ancienne image supprimée',
  L.vis&&L.nat=='941x1672'&&ecart<1.5&&ecartL<1.5&&L.box[0]<=0&&L.box[1]<=0&&L.box[2]>=L.W&&L.box[3]>=L.H&&crit.l>=0&&crit.t>=0&&crit.r<=L.W&&crit.b<=L.H&&L.filter=='none'&&L.op=='1'&&!L.ancienne&&L.scroll<=0&&L.fx==0&&!/id="tNew"[^>]*><img class="hp"/.test(html),{...L,ecart,ecartL,crit});
 // ---- 6. animations : apparition, mise en évidence, enfoncement (~100 ms, −6 %), onde + étincelles, rebond ----
 const an=await p.evaluate(async()=>{const T=document.getElementById('tscr');T.hidden=true;await new Promise(r=>setTimeout(r,50));T.hidden=false;await new Promise(r=>setTimeout(r,30));
  const enter=T.classList.contains('enter'),anim=getComputedStyle(document.querySelector('#tscr .tbox')).animationName;await new Promise(r=>setTimeout(r,1500));
  return{enter,anim,hint:document.getElementById('tNew').classList.contains('hint')&&!document.getElementById('tCont').classList.contains('hint'),breath:getComputedStyle(document.querySelector('#tNew .tface')).animationName,ended:!T.classList.contains('enter')}});
 const cN=await ctr(p,'tNew');const cdp=await ctx.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cN.x,y:cN.y,id:1}]});await p.waitForTimeout(130);
 const pr=await p.evaluate(()=>{const b=document.getElementById('tNew'),f=b.querySelector('.tface'),m=new DOMMatrix(getComputedStyle(f).transform);return{press:b.classList.contains('press'),sc:+m.a.toFixed(3),sock:+getComputedStyle(b.querySelector('.tsock')).opacity,rip:document.querySelectorAll('#tNew .trip').length,spk:document.querySelectorAll('#tscr .tspk').length}});
 await p.screenshot({path:`${O}/ti_06_appui.png`,clip:{x:0,y:cN.t-30,width:390,height:cN.h+60}});
 // on annule l'action (doigt qui glisse hors du bouton) pour ne tester que l'animation
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cN.x,y:cN.t-120,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(60);
 const re=await p.evaluate(()=>{const b=document.getElementById('tNew');return{rel:b.classList.contains('rel'),anim:getComputedStyle(b.querySelector('.tface')).animationName}});await p.waitForTimeout(500);
 const fin=await p.evaluate(()=>{const b=document.getElementById('tNew'),m=new DOMMatrix(getComputedStyle(b.querySelector('.tface')).transform);return{press:b.classList.contains('press'),sc:+m.a.toFixed(3),sock:+getComputedStyle(b.querySelector('.tsock')).opacity,still:!document.getElementById('tscr').hidden}});
 ok('6 animations : apparition douce (fondu + zoom), bouton conseillé mis en évidence, appui = enfoncement à 94 % dans son logement + onde + étincelles, relâchement = rebond, retour à la taille réelle',
  an.enter&&an.anim=='tIn'&&an.hint&&an.breath=='tBreath'&&an.ended&&pr.press&&pr.sc>=.93&&pr.sc<=.95&&pr.sock>.5&&pr.rip>=1&&pr.spk>=5&&re.rel&&re.anim=='tBounce'&&!fin.press&&fin.sock<.05&&fin.still,{an,pr,re,fin});
 // ---- 5. « Continuer » sans sauvegarde : message élégant, rien ne démarre ----
 await p.evaluate(()=>{window.__fx.length=0});await tap(p,'tCont');await p.waitForTimeout(500);
 const ns=await p.evaluate(()=>{const bc=document.getElementById('tCont'),off=bc.classList.contains('off')&&bc.getAttribute('aria-disabled')=='true'&&+getComputedStyle(bc.querySelector('.tsock')).opacity>.9;const m=document.getElementById('tMsg'),r=m.getBoundingClientRect(),b=document.getElementById('tNew').getBoundingClientRect();return{off,txt:m.textContent,on:m.classList.contains('on'),op:+getComputedStyle(m).opacity,dessus:r.bottom<=b.top+2,visible:r.top>=0,titre:!document.getElementById('tscr').hidden,created:N.created,studio:!document.getElementById('studio').hidden&&document.getElementById('tscr').hidden,fx:[...window.__fx]}});
 await p.screenshot({path:`${O}/ti_05_aucune_sauvegarde.png`});
 ok('5 « Continuer » sans sauvegarde : bouton désactivé (grisé) ; au toucher « Aucune sauvegarde trouvée » s’affiche joliment au-dessus des boutons, l’écran titre reste, aucune partie n’est lancée',ns.off&&ns.txt=='Aucune sauvegarde trouvée'&&ns.on&&ns.op>.9&&ns.dessus&&ns.visible&&ns.titre&&!ns.created&&!ns.studio,ns);
 // ---- 2. « Nouvelle partie » sans sauvegarde : transition douce puis vrai processus de création ----
 await p.evaluate(()=>{window.__fx.length=0});await tap(p,'tNew');await p.waitForTimeout(250);const mid=await p.evaluate(()=>({out:document.getElementById('tscr').classList.contains('out'),op:+getComputedStyle(document.getElementById('tscr')).opacity}));await p.waitForTimeout(700);
 const nw=await p.evaluate(()=>({titre:!document.getElementById('tscr').hidden,creating,studio:!document.getElementById('studio').hidden,conf:!document.getElementById('gConf').hidden,fx:[...window.__fx]}));
 await p.screenshot({path:`${O}/ti_02_creation.png`});
 ok('2 « Nouvelle partie » (pas de sauvegarde) : son de validation, fondu de sortie, ouverture de la vraie création du personnage, sans demande de confirmation',!nw.titre&&nw.creating&&nw.studio&&!nw.conf&&mid.out&&nw.fx.includes('tiNew'),{mid,nw});
 // on crée vraiment le personnage, avec un peu de progression à retrouver
 await p.evaluate(()=>{document.getElementById('stNameIn').value='Lilou';document.getElementById('stNameIn').dispatchEvent(new Event('input'))});await p.evaluate(()=>document.getElementById('crOk2').click());await p.waitForTimeout(800);
 const avant=await p.evaluate(()=>{N.coins=777;N.happy=61;save();return{name:N.name,coins:N.coins,look:JSON.stringify(N.look),created:N.created,keys:Object.keys(localStorage).length}});
 await ctx.close();
 ok('0 (préparation) partie créée et sauvegardée',avant.created&&avant.coins==777,avant);
 await ctx.close();
 // ---- 4. « Continuer » avec sauvegarde : la partie revient telle quelle ----
 // NB : chaque contexte Playwright a son propre stockage ; on rejoue donc la création dans le même contexte que la suite
 ({ctx,p}=await open());await passIntro(p);await tap(p,'tNew');await p.waitForTimeout(900);
 await p.evaluate(()=>{document.getElementById('stNameIn').value='Lilou';document.getElementById('stNameIn').dispatchEvent(new Event('input'))});await p.evaluate(()=>document.getElementById('crOk2').click());await p.waitForTimeout(800);
 const sv=await p.evaluate(()=>{N.coins=777;N.happy=61;N.look.wd=Object.assign({},N.look.wd,{haut:'hoodie|2'});save();return{name:N.name,coins:N.coins,look:JSON.stringify(N.look),created:N.created,pets:JSON.stringify(N.pets||null),house:JSON.stringify(N.house||N.room||null)}});
 await p.reload();await p.waitForTimeout(1200);await passIntro(p);
 const t4=await p.evaluate(()=>({actif:!document.getElementById('tCont').classList.contains('off'),titre:!document.getElementById('tscr').hidden,hint:document.getElementById('tCont').classList.contains('hint')}));
 await p.evaluate(()=>{window.__fx.length=0});await tap(p,'tCont');await p.waitForTimeout(900);
 const ld=await p.evaluate(()=>({titre:!document.getElementById('tscr').hidden,name:N.name,coins:N.coins,look:JSON.stringify(N.look),created:N.created,pets:JSON.stringify(N.pets||null),house:JSON.stringify(N.house||N.room||null),creating,fx:[...window.__fx]}));
 await p.screenshot({path:`${O}/ti_04_continuer.png`});
 ok('4 « Continuer » avec sauvegarde : son de chargement, l’écran titre s’efface et la partie revient à l’identique (personnage, prénom, tenue, argent, logement, animaux)',
  t4.actif&&t4.titre&&t4.hint&&!ld.titre&&!ld.creating&&ld.created&&ld.name==sv.name&&ld.coins==777&&ld.look==sv.look&&ld.pets==sv.pets&&ld.house==sv.house&&ld.fx.includes('tiCont'),{t4,sv,ld});
 // ---- 3. « Nouvelle partie » avec sauvegarde : confirmation ; Annuler garde tout ; Oui efface et lance la création ----
 await p.evaluate(()=>document.getElementById('gTitle').click());await p.waitForTimeout(900);
 await tap(p,'tNew');await p.waitForTimeout(600);
 const cf=await p.evaluate(()=>({seule:[...document.querySelectorAll('#gmenu .gi')].every(e=>!e.offsetParent),conf:!document.getElementById('gConf').hidden&&!document.getElementById('gmenu').hidden,txt:document.querySelector('#gConf p').textContent,titre:!document.getElementById('tscr').hidden,coins:N.coins}));
 await p.screenshot({path:`${O}/ti_03_confirmation.png`});
 await tap(p,'gNo');await p.waitForTimeout(400);const an2=await p.evaluate(()=>({confReste:document.querySelector('#gmenu .gcard').classList.contains('conf'),menu:!document.getElementById('gmenu').hidden,titre:!document.getElementById('tscr').hidden,coins:N.coins,created:N.created}));
 await tap(p,'tNew');await p.waitForTimeout(600);await Promise.all([p.waitForNavigation({timeout:8000}).catch(()=>null),tap(p,'gYes')]);await p.waitForTimeout(1500);
 const ef=await p.evaluate(()=>({created:N.created,coins:N.coins,creating,titre:document.getElementById('tscr')&&!document.getElementById('tscr').hidden,intro:!!document.getElementById('intro')}));
 ok('3 « Nouvelle partie » avec sauvegarde : demande de confirmation avant d’écraser ; « Annuler » revient au titre sans rien perdre ; « Oui, effacer » efface et ouvre la création',
  cf.conf&&cf.seule&&/Effacer ta partie/.test(cf.txt)&&cf.coins==777&&!an2.confReste&&!an2.menu&&an2.titre&&an2.coins==777&&an2.created&&!ef.created&&ef.coins!=777&&ef.creating,{cf,an2,ef});
 await ctx.close();
 // ---- 7. sons : distincts, courts, jamais identiques deux fois de suite à coup sûr, uniquement sur action ----
 ({ctx,p}=await open());await passIntro(p);
 const so=await p.evaluate(async()=>{const r={};const run=n=>{window.__notes.length=0;window.__cur=n;JEUSON.FX[n](JEUSON.ctx?JEUSON.ctx().currentTime:0,1);window.__cur=null;return window.__notes.map(x=>x[1])};
  try{startAudio()}catch(e){}JEUSON.fx('tiClick0');
  const seqN=[],seqC=[];for(let i=0;i<8;i++){seqN.push(run('tiNew').join(','));seqC.push(run('tiCont').join(','))}
  return{n:seqN[0],c:seqC[0],no:run('tiNone').join(','),varN:new Set(seqN).size,varC:new Set(seqC).size,ctx:JEUSON.ctx?JEUSON.ctx().state:'?'}}).catch(e=>({err:e.message}));
 ok('7 effets sonores : trois sons distincts (Nouvelle partie = arpège montant, Continuer = carillon, aucune sauvegarde = « bloup » doux), légère variation de hauteur d’une fois à l’autre, joués par le moteur audio existant après un geste',
  so.n&&so.c&&so.n!=so.c&&so.no&&so.no!=so.n&&so.varN>1&&so.varC>1,so);
 await ctx.close();
 // ---- 8. portrait et paysage, tous formats : tout visible, grandes zones tactiles, pas de défilement, boutons actifs ----
 const F=[[390,844,'portrait'],[375,667,'portrait'],[430,932,'portrait'],[820,1180,'tablette'],[844,390,'paysage'],[667,375,'paysage'],[932,430,'paysage'],[1024,768,'tablette paysage']],fr=[];
 for(const [w,h,n] of F){const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true});const q=await c.newPage();q.on('pageerror',e=>errs.push(n+': '+e.message));await q.goto(JEU);await q.waitForTimeout(1200);
  for(let i=0;i<10&&await q.evaluate(()=>!!document.getElementById('intro'));i++){await q.touchscreen.tap(w/2,h*.4);await q.waitForTimeout(500)}await q.waitForTimeout(1400);
  const m=await q.evaluate(()=>{const g=TITRE.geo,bb=id=>{const r=document.getElementById(id).getBoundingClientRect();return[r.left,r.top,r.right,r.bottom].map(Math.round)},bx=document.querySelector('#tscr .tbox').getBoundingClientRect(),a=document.querySelector('#tscr .tart').getBoundingClientRect();
   return{land:g.land,mir:document.querySelector('#tscr .tmirL').classList.contains('on'),n:bb('tNew'),c:bb('tCont'),box:[bx.left,bx.top,bx.right,bx.bottom].map(Math.round),art:[a.width,a.height].map(Math.round),bd:getComputedStyle(document.querySelector('#tscr .tbd')).display,scroll:Math.max(document.documentElement.scrollHeight-innerHeight,document.documentElement.scrollWidth-innerWidth),rot:getComputedStyle(document.getElementById('rotx')).display}});
  await q.screenshot({path:`${O}/ti_08_${w}x${h}.png`});
  const inV=r=>r[0]>=0&&r[1]>=0&&r[2]<=w&&r[3]<=h,big=r=>r[3]-r[1]>=44&&r[2]-r[0]>=150;
  // illustration jamais déformée
  const ratio=Math.abs((m.box[2]-m.box[0])/(m.box[3]-m.box[1])-(m.land?1672/941:941/1672));
  // en vertical, plein écran sans bande quand le format le permet (téléphones) ; sinon décor flouté, jamais de bande vide
  // plein écran : l'illustration couvre tout, ou le décor est prolongé en miroir sur les côtés (jamais de bande)
  const plein=(m.box[0]<=0||m.mir)&&(m.box[2]>=w||m.mir)&&(m.box[1]<=0||m.bd!='none')&&(m.box[3]>=h||m.bd!='none');
  // le bouton répond au toucher dans ce format
  const cc=await q.evaluate(()=>{const r=document.getElementById('tCont').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});await q.touchscreen.tap(cc.x,cc.y);await q.waitForTimeout(500);
  const rep=await q.evaluate(()=>document.getElementById('tMsg').textContent=='Aucune sauvegarde trouvée'&&document.getElementById('tMsg').classList.contains('on'));
  fr.push({n:n+' '+w+'x'+h,ok:inV(m.n)&&inV(m.c)&&big(m.n)&&big(m.c)&&m.n[3]<=m.c[1]+2&&m.scroll<=0&&ratio<.01&&plein&&m.rot=='none'&&rep&&(n.includes('paysage')?m.land:!m.land),m,rep});await c.close()}
 ok('8 portrait et paysage (iPhone SE, 14, Pro Max, iPad, téléphones couchés, iPad couché) : vertical = illustration verticale ; horizontal = illustration 16:9 de référence, décor prolongé sans bande ; tout visible, zones tactiles ≥ 44 px, sans déformation ni défilement, boutons actifs',fr.every(f=>f.ok),fr.filter(f=>!f.ok).length?fr.filter(f=>!f.ok):fr.map(f=>f.n+' btn '+(f.m.n[2]-f.m.n[0])+'×'+(f.m.n[3]-f.m.n[1])));
 ok('9 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();const res=R.filter(r=>!r.n.startsWith('0 '));fs.writeFileSync(path.join(O,'titre_resultats.json'),JSON.stringify(R,null,1));const n=res.filter(r=>r.ok).length;console.log(`\n${n}/${res.length} tests réussis`);process.exit(n==res.length?0:1)})();
