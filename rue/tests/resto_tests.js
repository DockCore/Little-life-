// Tests réels du restaurant (Playwright + Chrome) : accès depuis la rue, porte animée, salle, collisions, tables, carte,
// commande et service, animations de repas, clients, addition, sortie, orientations, musique, sauvegarde.
// Usage : node rue/tests/resto_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const MODE=process.argv[2]||'tel';const R=[];
function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const VP={tel:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true},paysage:{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true},pc:{viewport:{width:1366,height:768}}};
const ctx=await b.newContext(VP[MODE]);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),shot=n=>p.screenshot({path:`${O}/rs_${MODE}_${n}.png`});
// simulation accélérée : la boucle du jeu tourne plus vite que le temps réel (mêmes règles, même code)
const run=n=>E(n=>{for(let i=0;i<n;i++)update()},n);
const runUntil=async(f,max,a)=>{for(let i=0;i<(max||200);i++){if(await E(f,a))return true;await run(20)}return E(f,a)};
await p.goto(JEU);await W(2500);
await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c)c.click()});await W(800);
await E(()=>{tod=.45;N.look.g='m';N.coins=150;N.resto=null;try{wEquip(N.look,'teeb',0)}catch(e){}spKey='';save()});

// ---- 1. accès depuis la rue : le restaurant existant (même façade, même taille, même porte) devient ouvert ----
const fac=await E(()=>{const b=STC.buildings.find(q=>q.id=='resto');return{w:b.w,h:b.h,door:b.door,facade:b.facade,av:b.available,go:b.go,n:STC.buildings.filter(q=>q.facade=='restaurant').length}});
await E(()=>{streetEnter();const b=STC.buildings.find(q=>q.id=='resto');STV.px=b.x+b.door.x;STV.cam=Math.max(0,Math.min(STC.len-STV.W,STV.px-STV.W*.45));stPanel(true)});await W(300);
const tag=await E(()=>document.getElementById('stEnter').textContent);
// ---- 2. porte animée : ouverture, lumière, le personnage entre, fondu ----
await E(()=>stInteract());const dt=[];for(let i=0;i<6;i++){await W(90);dt.push(await E(()=>STV.door?STV.door.t:STV.on?'rue':'fini'))}
const midDoor=await E(()=>{const b=STC.buildings.find(q=>q.id=='resto');return null});
const inside=await (async()=>{const t0=Date.now();while(Date.now()-t0<20000){if(await E(()=>place=='resto'&&curV=='resto'))return true;await W(100)}return false})();
const doorIn=await E(()=>doorA);await shot('01_entree');
await p.waitForFunction(()=>C.st=='idle',null,{timeout:20000});
ok('1 restaurant de la rue ouvert (même bâtiment, façade, taille et porte), étiquette « Entrer »',fac.av&&fac.w==176&&fac.h==150&&fac.door.x==136&&fac.door.w==34&&fac.facade=='restaurant'&&fac.n==1&&fac.go.place=='resto'&&tag=='Entrer',{fac,tag});
ok('2 porte animée avant l’entrée puis porte intérieure ouverte à l’arrivée',dt.some(v=>typeof v=='number'&&v>0)&&dt.filter(v=>typeof v=='number').every((v,i,a)=>!i||v>=a[i-1])&&inside&&doorIn>.3,{dt,inside,doorIn});
// ---- 3. intérieur complet ----
const inv=await E(()=>{const F=PLACES.resto.furn,c=n=>F.filter(f=>f.n==n).length;const d=rx.getImageData(0,0,LW,LH).data;let col=new Set();for(let i=0;i<d.length;i+=4*37)col.add(d[i]>>4<<8|d[i+1]>>4<<4|d[i+2]>>4);
 return{tables:c('RTable'),box:c('RBox'),cuis:c('RCuis'),passe:c('RPasse'),acc:c('RAccueil'),aqua:c('RAqua'),plantes:c('Plante'),seats:RESTO.SEATS.length,npc:RESTO.R.npc.length,wt:RESTO.R.wt.length,couleurs:col.size,zone:LLSON.zone(),titre:document.getElementById('rsWhere').textContent}});
ok('3 salle chargée : tables, banquettes, accueil, cuisine ouverte, passe, aquarium, plantes, serveurs et clients',inv.tables==10&&inv.box==3&&inv.cuis==4&&inv.passe&&inv.acc&&inv.aqua&&inv.plantes>=4&&inv.seats==23&&inv.npc>=2&&inv.wt==2&&inv.couleurs>60,inv);
// ---- 4. collisions : meubles infranchissables, toutes les places atteignables depuis l’entrée ----
const col=await E(()=>{let solid=0,bad=0;for(const f of PLACES.resto.furn.filter(f=>f.s))for(let i=1;i<4;i++)for(let j=1;j<4;j++){const u=f.x+f.w*i/4,v=f.y+f.h*j/4;if(u<1.15||v<1.2||u>RN-1.15||v>RN-1.2)continue;solid++;if(walkable(u,v))bad++}
 const unreach=[];for(const s of RESTO.SEATS){if(!walkable(s.ap[0],s.ap[1])){unreach.push(s.id+':mur');continue}const P=findPath([1.5,DOORS[1]],s.ap),e=P[P.length-1];if(!e||Math.hypot(e[0]-s.ap[0],e[1]-s.ap[1])>.05)unreach.push(s.id)}
 let steps=0,through=0,arrived=0;const X0=C.x,Y0=C.y;for(let k=0;k<30;k++){let tu,tv,g=0;do{tu=1.3+Math.random()*17.4;tv=1.3+Math.random()*17.4;g++}while(!walkable(tu,tv)&&g<60);C.st='idle';C.x=1.5*12;C.y=88+DOORS[1]*5;goto(tu*12,88+tv*5);
  for(let i=0;i<1200&&C.st=='walk';i++){update();steps++;const a=C.x/12,b2=(C.y-88)/5;if(PLACES.resto.furn.some(f=>f.s&&a>f.x+.05&&a<f.x+f.w-.05&&b2>f.y+.05&&b2<f.y+f.h-.05))through++}if(C.st!='walk')arrived++}
 C.st='idle';C.x=X0;C.y=Y0;return{solid,bad,unreach,steps,through,arrived}});
ok('4 collisions : aucun meuble traversable, 23 places atteignables depuis la porte',col.bad==0&&col.solid>100&&!col.unreach.length&&col.through==0&&col.arrived==30,col);
// ---- 5. déplacement libre (toucher le sol) ----
const mv=await E(()=>{const r=rx.canvas.getBoundingClientRect();return null});
await E(()=>{C.x=3*12;C.y=88+16*5;C.st='idle';goto(17*12,88+9.3*5)});const mvOk=await runUntil(()=>C.st!='walk',100);const pos=await E(()=>[C.x/12,(C.y-88)/5]);
ok('5 déplacement libre dans la salle jusqu’au point visé',mvOk&&Math.hypot(pos[0]-17,pos[1]-9.3)<.3,pos);
// ---- 6. tables : choisir, s’asseoir (animation), se lever, changer de table, places occupées ----
const free=await E(()=>RESTO.SEATS.filter(x=>!x.who&&!x.res&&!x.booth&&x.k==0).map(x=>x.id));const S1=free[0],S2=free[1],S3=free[2];
const sitA=await E(id=>{const s=RESTO.SEATS.find(x=>x.id==id);RESTO.sitAt(s);return s.id},S1);
const sitFr=[];for(let i=0;i<200;i++){await run(3);const s=await E(()=>({st:C.st,sit:RESTO.R.sit?Math.round(100*RESTO.R.sit.t/RESTO.R.sit.T):null,sp:spName}));if(s.sit!=null)sitFr.push(s.sit);if(s.st=='rsit'&&s.sit==null&&sitFr.length)break}
const seated1=await E(id=>{const s=RESTO.SEATS.find(x=>x.id==id);return{st:C.st,who:s.who===RESTO.me(),sp:spName,alpha:C.alpha,where:document.getElementById('rsWhere').textContent,no:s.f.no}},S1);
await E(()=>{const z=document.querySelector('#zoomBtn,.zoom');});await shot('06_assis');
await E(()=>RESTO.standUp());await runUntil(()=>C.st=='idle'&&!RESTO.R.sit,40);const up1=await E(id=>({st:C.st,free:!RESTO.SEATS.find(x=>x.id==id).who,alpha:C.alpha}),S1);
const occ=await E(()=>{const s=RESTO.SEATS.find(x=>x.who&&!x.who.me);const st0=status.textContent;RESTO.sitAt(s);return{msg:document.getElementById('status').textContent,me:s.who.me||false}});
await E(id=>RESTO.sitAt(RESTO.SEATS.find(x=>x.id==id)),S2);await runUntil(()=>C.st=='rsit'&&!RESTO.R.sit,120);
await E(id=>RESTO.sitAt(RESTO.SEATS.find(x=>x.id==id)),S3);await runUntil(id=>C.st=='rsit'&&!RESTO.R.sit&&RESTO.me().seat&&RESTO.me().seat.id==id,200,S3);
const chg=await E(id=>({seat:RESTO.me().seat&&RESTO.me().seat.id,old:!RESTO.SEATS.find(x=>x.id==id).who,st:C.st}),S2);
ok('6 s’asseoir avec animation, poses « à table », se lever, changer de table, places occupées refusées',sitFr.length>=3&&seated1.st=='rsit'&&seated1.who&&/^dn\d$/.test(seated1.sp)&&seated1.alpha===0&&seated1.where=='Table '+seated1.no&&up1.st=='idle'&&up1.free&&up1.alpha==null&&/occupée/.test(occ.msg)&&!occ.me&&chg.seat==S3&&chg.old&&chg.st=='rsit',{sitFr,seated1,up1,occ,chg});
// ---- 7. carte illustrée : catégories, plats, prix, descriptions ; commande ----
await E(()=>RESTO.openMenu());await W(400);await shot('07_carte');
const carte=[];for(const c of ['e','p','d','b']){await p.click(`#rsMenu .rsTabs button[data-c="${c}"]`);await W(80);carte.push(...await E(()=>[...document.querySelectorAll('#rsMenu .rsItem')].map(r=>{const cv=r.querySelector('canvas'),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]>0)n++;
 return{n:r.querySelector('b').textContent,p:r.querySelector('.rsPr').textContent.trim(),d:r.querySelector('p').textContent.length,px:n}})))}
const att=['Salade composée','Nuggets','Bruschetta','Burger','Pizza','Pâtes','Steak-frites','Poulet et accompagnement','Glace','Gâteau au chocolat','Tarte aux fruits','Crêpes','Eau','Soda','Jus de fruits'];
ok('7a carte : 4 catégories, 15 plats illustrés avec nom, prix et description',carte.length==15&&att.every(n=>carte.some(c=>c.n==n))&&carte.every(c=>/^\d+$/.test(c.p)&&c.d>20&&c.px>400),carte.map(c=>c.n+' '+c.p+' '+c.px));
// trop cher : commande bloquée
await E(()=>{N.coins=10});await p.click('#rsMenu .rsTabs button[data-c="p"]');await p.click('#rsMenu .rsItem:nth-child(4) .rsPick');await W(80);
const cher=await E(()=>{const g=document.querySelector('#rsMenu .rsGo');return{dis:g.disabled,t:g.textContent}});
await E(()=>{N.coins=150;RESTO.R.cart={}});await p.click('#rsMenu .rsTabs button[data-c="e"]');await p.click('#rsMenu .rsItem:nth-child(2) .rsPick');
await p.click('#rsMenu .rsTabs button[data-c="p"]');await p.click('#rsMenu .rsItem:nth-child(1) .rsPick');await p.click('#rsMenu .rsTabs button[data-c="d"]');await p.click('#rsMenu .rsItem:nth-child(1) .rsPick');
await p.click('#rsMenu .rsTabs button[data-c="b"]');await p.click('#rsMenu .rsItem:nth-child(3) .rsPick');await W(80);const pret=await E(()=>document.querySelector('#rsMenu .rsGo').textContent);
await p.click('#rsMenu .rsGo');await W(250);const stamp=await E(()=>document.getElementById('rsMenu').classList.contains('sent'));await shot('07b_commande');await W(1000);
const closed=await E(()=>document.getElementById('rsMenu').hidden);
ok('7b commande : trop cher bloqué, confirmation animée, carte refermée',cher.dis&&/manque/.test(cher.t)&&/Commander · 30/.test(pret)&&stamp&&closed,{cher,pret,stamp,closed});
// ---- 8. serveur, cuisine, service à table ----
const tr=[];let wPad=false,carry=false,cook=false;for(let i=0;i<300;i++){await run(10);const s=await E(()=>({o:RESTO.me().order.map(it=>it.m.k+':'+it.st).join(','),pad:RESTO.R.wt.some(w=>w.pad),carry:RESTO.R.wt.some(w=>w.carry&&w.carry.length),chef:RESTO.R.chef.some(c=>c.busy)}));
 wPad=wPad||s.pad;carry=carry||s.carry;cook=cook||s.chef;if(tr[tr.length-1]!=s.o)tr.push(s.o);if(/nuggets:served/.test(s.o)&&/jus:served/.test(s.o))break}
await shot('08_servi');
ok('8 le serveur prend la commande (carnet), la cuisine prépare, le serveur apporte et pose les plats (entrée et boisson d’abord)',wPad&&carry&&cook&&tr.some(s=>/nuggets:cook/.test(s))&&/nuggets:served/.test(tr[tr.length-1])&&/burger:(sent|cook|ready)/.test(tr[tr.length-1]),tr);
// ---- 9. animations de repas : gestes, bouchées, variantes, tenue, interruption ----
const h0=await E(()=>N.hunger);await E(()=>RESTO.eatNext('f'));const fr=[],por=[];for(let i=0;i<34;i++){await run(3);const s=await E(()=>{spUpdate();return 0}).then(()=>E(()=>[spName,RESTO.me().order[0].por,spKey.includes(JSON.stringify(N.look))]));fr.push(s[0]);por.push(s[1]);if(i==12)await shot('09_bouchee')}
const look=await E(()=>spKey.includes(JSON.stringify(N.look)));
await E(()=>RESTO.eatNext());const paused=await E(()=>({eat:!!RESTO.me().eat,st:C.st,por:RESTO.me().order[0].por}));
await E(()=>RESTO.eatNext('f'));await runUntil(()=>!RESTO.me().eat,200);
await E(()=>RESTO.eatNext('b'));const dfr=[];for(let i=0;i<30;i++){await run(3);dfr.push(await E(()=>{spUpdate();return spName}))}await runUntil(()=>!RESTO.me().eat,60);
const after=await E(()=>({o:RESTO.me().order.map(it=>it.m.k+':'+it.st+':'+it.por.toFixed(2)),h:N.hunger}));
// variantes : chaque façon de manger a sa propre séquence (fourchette, main, cuillère, verre)
const vari=await E(()=>{const u={};RESTO.MENU.forEach(m=>u[m.u]=(u[m.u]||0)+1);return u});
ok('9 repas animé : attraper, porter à la bouche, mâcher, boire, reposer ; portion qui diminue ; tenue respectée ; pause possible ; variantes par plat',
 ['dn1','dn2','dn3','dn4'].every(f=>fr.includes(f))&&por[por.length-1]<1&&look&&!paused.eat&&paused.st=='rsit'&&paused.por>0&&paused.por<1&&dfr.includes('dn6')&&/nuggets:eaten:0.00/.test(after.o[0])&&after.h>h0&&Object.keys(vari).length==4,{fr:[...new Set(fr)],paused,dfr:[...new Set(dfr)],after,h0,vari});
// ---- 10. clients : entrent, s’assoient, commandent, mangent, paient, repartent ----
const life=await E(()=>{const R0=RESTO.R;const seen={in:0,go:0,table:0,eat:0,bill:0,up:0,out:0,gone:0,order:0,chat:0};const s=RESTO.SEATS.find(x=>!x.who&&!x.res&&x.f.no<=4);const d=RESTO.newClient(s,false);
 for(let i=0;i<30000&&!d.gone;i++){update();seen[d.st]=(seen[d.st]||0)+1;if(d.eat)seen.eat++;if(d.order.length)seen.order=1;if(d.bub=='chat'||d.bub=='note'||d.bub=='love')seen.chat++}
 return{seen,gone:!!d.gone,free:!s.who&&!s.res,npc:R0.npc.length,dbg:d.gone?null:{o:d.order.map(it=>it.m.k+':'+it.st),st:d.st,tasks:R0.tasks.map(t=>t.k+(t.w?'*':'')+(t.d===d?'D':t.d.me?'M':'')),wt:R0.wt.map(w=>[w.job&&w.job.k,!!w.path,w.wait,w.u.toFixed(1),w.v.toFixed(1)])}}});
ok('10 cycle complet d’un client : entrée par la porte, table, commande, repas, addition, départ',life.gone&&life.free&&['in','go','table','bill','up','out'].every(k=>life.seen[k]>0)&&life.seen.eat>0&&life.seen.order,life);
// ---- 11. addition : total exact, blocage si insuffisant, paiement, enregistrement, sortie bloquée tant que ce n’est pas payé ----
await runUntil(()=>RESTO.me().order.some(it=>it.m.k=='burger'&&it.st=='served'),300);await E(()=>RESTO.eatNext('f'));await runUntil(()=>!RESTO.me().eat,300);
const block=await E(()=>{const pl=place;RESTO.leave();return{pl:place,msg:document.getElementById('status').textContent}});
await E(()=>RESTO.askBill());await runUntil(()=>RESTO.R.billOpen,300);await W(300);await shot('11_addition');
const bill=await E(()=>{const d=RESTO.me(),its=d.order.filter(it=>['served','eaten'].includes(it.st));return{due:RESTO.unpaid(d),sum:its.reduce((a,it)=>a+it.m.p,0),n:its.length,lines:document.querySelectorAll('#rsBill .rsLine').length,cancel:d.order.filter(it=>it.cancel).map(it=>it.m.k)}});
await E(()=>{window.__c=N.coins;N.coins=5;RESTO.openBill()});await W(100);const poor=await E(()=>{const g=document.querySelector('#rsBill .rsGo');return{dis:g.disabled,t:g.textContent}});await E(()=>RESTO.pay());const still=await E(()=>({c:N.coins,due:RESTO.unpaid(RESTO.me())}));
await E(()=>{N.coins=window.__c;RESTO.openBill()});await W(100);const c0=await E(()=>N.coins);await p.click('#rsBill .rsGo');await W(300);
const paid=await E(()=>({c:N.coins,due:RESTO.unpaid(RESTO.me()),S:N.resto,open:RESTO.R.billOpen,goal:GOALS.find(g=>g.id=='resto').ok()}));
ok('11 addition : total exact, paiement refusé sans assez de pièces, montant exact déduit, dépense enregistrée, sortie impossible avant de payer',
 block.pl=='resto'&&/régler/.test(block.msg)&&bill.due==bill.sum&&bill.due>=7+14+4&&bill.lines==bill.n+1&&(bill.cancel.includes('glace')||bill.due==30)&&poor.dis&&/manque/.test(poor.t)&&still.c==5&&still.due==bill.due&&paid.c==c0-bill.due&&paid.due==0&&paid.S.repas==1&&paid.S.depense==bill.due&&paid.S.hist[0].total==bill.due&&!paid.open&&paid.goal,{block,bill,poor,still,paid,c0});
// ---- 12. sauvegarde : les dépenses et repas du restaurant sont dans la sauvegarde du jeu ----
const sv=await E(()=>{save();const k=['littlelife_v1','littlelife_v1_b'].map(k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}).filter(Boolean);return k.map(o=>o&&(o.N||o).resto).filter(Boolean)[0]||null});
ok('12 sauvegarde : visites, repas, dépenses et historique enregistrés',sv&&sv.repas==1&&sv.depense==bill.due&&sv.visites>=1&&sv.hist.length==1,sv);
// ---- 13. musique : un seul morceau pour le lieu, jamais relancé par les actions ----
const mu=await E(()=>({zone:LLSON.zone(),has:!!LLSON.theme('resto'),log:LLSON.log().filter(e=>e.ev=='début').length}));
await E(()=>RESTO.openMenu());await W(300);await E(()=>RESTO.closeMenu());await E(()=>RESTO.standUp());await run(40);await E(()=>RESTO.placeMe());await runUntil(()=>C.st=='rsit'&&!RESTO.R.sit,200);await W(600);
const mu2=await E(()=>({zone:LLSON.zone(),log:LLSON.log().filter(e=>e.ev=='début').length}));
ok('13 musique lounge propre au restaurant, sans redémarrage pendant les actions',mu.zone=='resto'&&mu.has&&mu2.zone=='resto'&&mu2.log==mu.log,{mu,mu2});
// ---- 14. sortie : retour exact devant la porte du restaurant dans la rue, porte qui se referme ----
await E(()=>RESTO.leave());const out=await (async()=>{const t0=Date.now();while(Date.now()-t0<30000){if(await E(()=>STV.on&&curV=='street'))return true;await run(5);await W(50)}return false})();
const rue=await E(()=>{const b=STC.buildings.find(q=>q.id=='resto');return{px:STV.px,door:b.x+b.door.x,anim:!!STV.doorOut,place,st:C.st}});await W(150);await shot('14_retour_rue');
ok('14 bouton Partir : retour dans la rue, exactement devant la porte du restaurant',out&&Math.abs(rue.px-rue.door)<1&&rue.place=='street'&&rue.anim,rue);
// ---- 15. partir sans commander : possible, sans rien payer ----
const c1=await E(()=>N.coins);await E(()=>{const b=STC.buildings.find(q=>q.id=='resto');STV.px=b.x+b.door.x;stInteract()});await p.waitForFunction(()=>place=='resto'&&C.st=='idle',null,{timeout:20000});
await E(()=>RESTO.leave());const out2=await (async()=>{const t0=Date.now();while(Date.now()-t0<30000){if(await E(()=>STV.on))return true;await W(100)}return false})();
ok('15 entrer puis repartir sans commander : autorisé, aucune pièce dépensée',out2&&(await E(()=>N.coins))==c1,{out2});
// ---- 16. affichage : carte et addition tiennent à l’écran (portrait, paysage, ordinateur), liste défilante ----
await E(()=>{const b=STC.buildings.find(q=>q.id=='resto');STV.px=b.x+b.door.x;stInteract()});await p.waitForFunction(()=>place=='resto'&&C.st=='idle',null,{timeout:20000});
await E(()=>RESTO.openMenu());await W(400);await p.click('#rsMenu .rsTabs button[data-c="p"]');await W(150);
const lay=await E(()=>{const c=document.querySelector('#rsMenu .rsCard').getBoundingClientRect(),l=document.querySelector('#rsMenu .rsList'),go=document.querySelector('#rsMenu .rsGo').getBoundingClientRect(),x=document.querySelector('#rsMenu .rsX').getBoundingClientRect();
 return{vw:innerWidth,vh:innerHeight,c:[c.left,c.top,c.right,c.bottom].map(Math.round),scroll:l.scrollHeight>l.clientHeight,lh:l.clientHeight,go:go.bottom<=innerHeight&&go.height>=40,x:x.width>=36}});
await shot('16_carte_plats');
let sc0=await E(()=>document.querySelector('#rsMenu .rsList').scrollTop);await p.mouse.move(lay.vw/2,lay.c[1]+200);await p.mouse.wheel(0,400);await W(250);let sc1=await E(()=>document.querySelector('#rsMenu .rsList').scrollTop);
const fits=lay.c[0]>=0&&lay.c[1]>=0&&lay.c[2]<=lay.vw&&lay.c[3]<=lay.vh&&lay.go&&lay.x&&lay.lh>=100;
ok('16 carte entièrement visible et utilisable ('+MODE+'), liste défilante si besoin',fits&&(!lay.scroll||sc1>sc0),{lay,sc0,sc1});
await E(()=>RESTO.closeMenu());await W(300);
// ---- 17. aucune erreur ----
ok('17 aucune erreur JavaScript',!errs.length,errs.slice(0,5));
const res={mode:MODE,ok:R.filter(r=>r.ok).length,total:R.length,R};fs.writeFileSync(`${O}/resto_${MODE}.json`,JSON.stringify(res,null,1));console.log(`\n${res.ok}/${res.total} tests réussis (${MODE})`);await b.close();process.exit(res.ok==res.total?0:1)})();
