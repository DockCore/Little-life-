// Tests réels de la rue 2D (Playwright + Chrome). Usage : node rue/tests/rue_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const MODE=process.argv[2]||'tel';
const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext(MODE=='pc'?{viewport:{width:1280,height:800}}:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const W=ms=>p.waitForTimeout(ms),E=(f,a)=>p.evaluate(f,a),shot=n=>p.screenshot({path:`${O}/${MODE}_${n}.png`});
await p.goto(JEU);await W(2500);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(800);
await E(()=>{tod=0;N.look.g='m';try{wEquip(N.look,'teeb',0)}catch(e){}spKey='';save()});
const where=()=>E(()=>({on:STV.on,v:curV,place,st:C.st,px:Math.round(STV.px*100)/100,cam:STV.cam,W:STV.W,sp:spName,fl:SP.fl}));
const hold=async(k,ms)=>{await p.keyboard.down(k);await W(ms);await p.keyboard.up(k);await W(60)};
const tele=x=>E(x=>{STV.px=x;STV.cam=Math.max(0,Math.min(STC.len-STV.W,x-STV.W*.45));STV.auto=null;stPanel(true)},x);
const door=id=>E(id=>{const b=STC.buildings.find(q=>q.id==id);return b.x+b.door.x},id);

// 1. Accès depuis la maison : porte -> choix « La rue » -> trajet -> rue, devant la résidence
await E(()=>goOut());await p.waitForFunction(()=>curV=='out',null,{timeout:20000});
const tile=await E(()=>{const t=document.querySelector('#v-out [data-go="street"]');return t&&!t.hidden&&t.textContent});
await p.click('#v-out [data-go="street"]');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:30000});await W(600);
let w=await where();const dM=await door('maison');
ok('1 accès à la rue depuis la maison',tile&&w.place=='street'&&w.st=='street'&&Math.abs(w.px-dM)<1,{tile,w});await shot('01_arrivee');

// 2. Déplacement libre gauche/droite au clavier (flèches et Q/D)
let a=w.px;await hold('ArrowRight',900);let b1=(await where()).px;await hold('KeyQ',500);let b2=(await where()).px;await hold('KeyD',300);let b3=(await where()).px;
ok('2 déplacement horizontal libre (→, Q, D)',b1>a+40&&b2<b1-20&&b3>b2+10,{a,b1,b2,b3});

// 3. Animation de marche existante + orientation, posture immobile à l’arrêt
await p.keyboard.down('ArrowRight');const fr=[];for(let i=0;i<10;i++){await W(70);fr.push(await E(()=>spName+(SP.fl?'<':'')))}await p.keyboard.up('ArrowRight');
await p.keyboard.down('ArrowLeft');const fl=[];for(let i=0;i<6;i++){await W(70);fl.push(await E(()=>spName+(SP.fl?'<':'')))}await p.keyboard.up('ArrowLeft');await W(150);
const still=await E(()=>spName);
ok('3 marche de profil (w0..w3), tournée selon la direction, immobile à l’arrêt',fr.every(f=>/^w[0-3]$/.test(f))&&new Set(fr).size>=3&&fl.every(f=>/^w[0-3]<$/.test(f))&&still=='idle',{fr,fl,still});

// 4. Personnage identique au jeu (sprite + vêtements, échelle 1:1, sans déformation)
const px=await E(()=>{spKey='';spUpdate();streetDraw();const X=Math.round(STV.px-STV.cam),Y=ST_WALK-127+STV.oy,d=STV.x.getImageData(X-40,Y,CW,CH).data,s=sc2.getContext('2d').getImageData(0,0,CW,CH).data;let n=0,diff=0;for(let i=0;i<s.length;i+=4)if(s[i+3]==255){n++;if(d[i]!=s[i]||d[i+1]!=s[i+1]||d[i+2]!=s[i+2])diff++}return{n,diff,haut:N.look.wd&&N.look.wd.haut,name:spName}});
ok('4 personnage rendu au pixel près (garde-robe incluse)',px.n>1500&&px.diff==0,px);

// 5. Caméra : suit le personnage, bornée au début de la rue
await tele(900);await hold('ArrowRight',800);w=await where();const rel=(w.px-w.cam)/w.W;
await tele(60);await hold('ArrowLeft',2500);const w0=await where();
ok('5 caméra qui suit et reste bornée',rel>.2&&rel<.8&&w0.cam===0,{rel,cam0:w0.cam});

// 6. Limite de début de rue
const minX=await E(()=>STC.minX);ok('6 limite au début de la rue',Math.abs(w0.px-minX)<.01,{px:w0.px,minX});

// 7. Chantier : limite physique infranchissable
const wk=await E(()=>({workX:STC.workX,maxX:STC.maxX,last:STC.buildings.at(-1).x+STC.buildings.at(-1).w}));
await tele(wk.maxX-60);await hold('ArrowRight',2000);w=await where();
ok('7 chantier placé après le dernier bâtiment et infranchissable',wk.workX>wk.last&&w.px<=wk.maxX+.01&&w.px>wk.maxX-1,{wk,px:w.px});await shot('07_chantier');

// 8. Panneau du chantier : popup exacte, fermeture
await p.keyboard.press('KeyE');await W(200);
const md=await E(()=>({vis:!document.getElementById('stModal').hidden,t:document.getElementById('stMT').textContent,a:document.getElementById('stMA').textContent,b:document.getElementById('stMB').textContent}));await shot('08_popup');
await p.click('#stMClose');await W(150);const closed=await E(()=>document.getElementById('stModal').hidden);
await p.keyboard.press('KeyE');await W(150);await p.keyboard.press('Escape');await W(150);const closed2=await E(()=>document.getElementById('stModal').hidden&&!STV.modal);
ok('8 popup « Quartier en construction » + bouton Fermer + Échap',md.vis&&md.t=='QUARTIER EN CONSTRUCTION 🚧'&&md.a=='De nouveaux commerces et lieux de loisirs sont en préparation.'&&md.b=='Reviens bientôt découvrir la suite de la ville !'&&closed&&closed2,md);

// 9. Indication d’interaction près d’une entrée, rien ailleurs
await tele(await door('sport'));await W(150);const nearG=await E(()=>({w:document.getElementById('stWhere').textContent,e:document.getElementById('stEnter').textContent,h:document.getElementById('stEnter').hidden}));
const sp=await E(()=>STC.buildings.find(q=>q.id=='sport'));await tele(sp.x+sp.w+(await E(()=>STC.gap))/2);await W(150);
const far=await E(()=>({w:document.getElementById('stWhere').textContent,h:document.getElementById('stEnter').hidden}));
ok('9 nom du lieu + « Entrer » près de la porte, masqué ailleurs',nearG.w=='Salle de sport'&&nearG.e=='Entrer'&&!nearG.h&&far.w=='La rue commerçante'&&far.h,{nearG,far});

// 10. Entrer dans un bâtiment disponible (salle de sport), puis ressortir : retour dans la rue devant l’entrée
const dG=await door('sport');await tele(dG);await p.keyboard.press('Enter');
await p.waitForFunction(()=>place=='gym'&&curV=='gym'&&C.st!='enter',null,{timeout:20000});const inG=await where();await shot('10_salle');await W(500);
await p.click('#gymHome');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:30000});await W(300);w=await where();
ok('10 entrée dans la salle de sport puis retour dans la rue devant la porte',inG.place=='gym'&&!inG.on&&w.place=='street'&&Math.abs(w.px-dG)<1,{inG:inG.place,back:w.px,dG});

// 11. Boutique de vêtements : entrée et retour
const dC=await door('mode');await tele(dC);await E(()=>stInteract());
await p.waitForFunction(()=>place=='clothes'&&curV=='clothes',null,{timeout:20000});await W(800);await shot('11_boutique');
await p.click('#clHome');await p.waitForFunction(()=>STV.on&&curV=='street',null,{timeout:30000});w=await where();
ok('11 boutique de vêtements : entrée et retour devant la boutique',w.place=='street'&&Math.abs(w.px-dC)<1,{px:w.px,dC});

// 12. Bâtiments pas encore aménagés : message « bientôt », on reste dans la rue
const soon=[];for(const id of ['bowling','arcade','cinema','resto']){await tele(await door(id));await p.keyboard.press('KeyE');await W(120);
 soon.push(await E(()=>({t:document.getElementById('stMT').textContent,a:document.getElementById('stMA').textContent,vis:!document.getElementById('stModal').hidden,place})));await p.keyboard.press('Escape');await W(80)}
ok('12 bowling, arcade, cinéma, restaurant : message « bientôt », pas de sortie de la rue',soon.every(s=>s.vis&&/bientôt/.test(s.a)&&!/Le la/.test(s.a)&&s.place=='street'),soon);

// 13. Tactile/souris : boutons ◀ ▶ (maintenus) et clic sur un bâtiment = marche jusqu’à sa porte
let tactile=null;
if(MODE!='pc'){await tele(700);const bR=await p.locator('#stwR').boundingBox();const x0=(await where()).px;
 await p.mouse.move(bR.x+bR.width/2,bR.y+bR.height/2);await p.mouse.down();await W(700);await p.mouse.up();await W(80);const x1=(await where()).px;tactile={x0,x1}}
await tele(300);await W(900);const cvb=await p.locator('#stCv').boundingBox();
const ab=await E(()=>{const b=STC.buildings.find(q=>q.x+q.w/2-STV.cam>40&&q.x+q.w/2-STV.cam<STV.W-40&&Math.abs(STV.px-q.x-q.door.x)>30);return{...b,cam:STV.cam,W:STV.W,H:STV.H,oy:STV.oy}});
await p.mouse.click(cvb.x+(ab.x+ab.w/2-ab.cam)/ab.W*cvb.width,cvb.y+(196-ab.h/2+ab.oy)/ab.H*cvb.height);await W(100);
await p.waitForFunction(()=>STV.auto==null&&!STV.mv,null,{timeout:20000});w=await where();
ok('13 commandes tactiles + clic sur un bâtiment',(MODE=='pc'||tactile.x1>tactile.x0+20)&&Math.abs(w.px-(ab.x+ab.door.x))<1.5,{tactile,cible:ab.id,px:w.px,door:ab.x+ab.door.x});

// 14. HUD discret : heure, besoins, pièces, contrôles visibles au-dessus de la rue
const hud=await E(()=>{document.querySelector('.hud').style.pointerEvents='auto';document.querySelectorAll('.hud *').forEach(e=>e.style.pointerEvents='auto');const vis=id=>{const e=document.getElementById(id);if(!e)return false;const r=e.getBoundingClientRect();if(!r.width)return false;const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!t&&(e.contains(t)||t==e)};return{heure:vis('mode'),besoins:vis('needs'),pieces:vis('coins'),gauche:vis('stwL'),droite:vis('stwR'),panneau:vis('stWhere')}});await E(()=>{document.querySelector('.hud').style.pointerEvents='';document.querySelectorAll('.hud *').forEach(e=>e.style.pointerEvents='')});
ok('14 HUD discret visible (heure, besoins, pièces, commandes)',hud.heure&&hud.besoins&&hud.pieces&&hud.panneau&&(MODE=='pc'||hud.gauche&&hud.droite),hud);

// 15. Sauvegarde : rechargement -> reprise dans la rue à la même position
await tele(1111.5);await E(()=>{N.street={x:Math.round(STV.px),d:C.d,on:1};save()});await p.reload();await W(3000);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});await W(600);
w=await where();ok('15 sauvegarde et reprise de la position dans la rue',w.on&&w.place=='street'&&Math.abs(w.px-1112)<1,w);

// 16. Extensibilité : ajouter un bâtiment = une entrée de registre ; chantier et longueur recalculés
const ext=await E(()=>{const before=STC.workX;STC.buildings.push({id:'test',name:'Librairie',type:'shop',facade:'boutique',w:120,h:150,door:{x:60,w:30},available:false});stLayout(STC);
 const after=STC.workX,last=STC.buildings.at(-1),r={before,after,expect:before+120+STC.gap,last:last.x+last.w,len:STC.len};STC.buildings.pop();stLayout(STC);r.restored=STC.workX;return r});
ok('16 registre extensible : chantier repoussé automatiquement',ext.after==ext.expect&&ext.after>ext.last&&ext.restored==ext.before,ext);

// 17. Retour à la maison depuis la rue (bouton Maison : marche jusqu’à la résidence puis entre)
await p.click('#stHome');await p.waitForFunction(()=>place=='home'&&!STV.on&&curV=='home',null,{timeout:60000});w=await where();
const hidden=await E(()=>document.getElementById('street').hidden);
ok('17 retour à la maison',w.place=='home'&&hidden,w);

// 18. Nuit : éclairage, enseignes, pas d’erreur ; performance du rendu
await E(()=>{streetEnter(1300)});await W(400);await E(()=>{tod=.5;night=1});await W(500);await shot('18_nuit');
const perf=await E(()=>{const t=performance.now();for(let i=0;i<300;i++)streetDraw();return (performance.now()-t)/300});
const fps=await E(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)};requestAnimationFrame(f)}));
ok('18 rendu de nuit et performance',perf<6&&fps>45,{msParImage:+perf.toFixed(3),fps});
await E(()=>{tod=0;streetLeave();arrive('home')});await W(500);

ok('19 aucune erreur JavaScript',errs.length==0,errs);
fs.writeFileSync(`${O}/${MODE}_resultats.json`,JSON.stringify(R,null,1));
console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis ('+MODE+')');await b.close()})();
