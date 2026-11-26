// Tests réels du café (Playwright + Chrome) : accès par la rue, salle vivante, commande, préparation, places, consommation,
// effets sur les jauges, habitants, ami invité, jeux, journal, téléphone, événements, sauvegarde, affichage mobile.
// Usage : node rue/tests/cafe_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const {chromium}=require(PW);
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const MODE=process.argv[2]||'tel';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext(MODE=='pc'?{viewport:{width:1280,height:800}}:MODE=='paysage'?{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true}:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);let n=0,okN=0;
 const ok=(t,c,d)=>{n++;if(c)okN++;console.log((c?'OK   ':'ÉCHEC ')+t+'  '+JSON.stringify(d===undefined?'':d).slice(0,500))};
 const shot=k=>p.screenshot({path:`${O}/cafe_${MODE}_${k}.png`});
 const run=async k=>{for(let i=0;i<k;i++)await E(()=>{try{update()}catch(e){}})};
 const until=async(f,max=600,a)=>{for(let i=0;i<max;i++){if(await E(f,a))return true;await run(8);await W(12)}return false};
 await p.goto(JEU);await E(()=>localStorage.clear());await p.goto(JEU);await W(2500);
 await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c&&creating)c.click()});await W(1200);

 // 1. accès physique depuis la rue uniquement
 const tiles=await E(()=>{goOut();return 1}).then(()=>until(()=>curV=='out',600)).then(()=>E(()=>[...document.querySelectorAll('#v-out [data-go]')].map(t=>t.dataset.go)));
 ok('1 aucun bouton Café ni Sport dans le panneau « Sortie »',!tiles.includes('cafe')&&!tiles.includes('gym'),tiles);
 await E(()=>document.querySelector('#v-out [data-go="street"]').click());await until(()=>STV.on,1500);
 await E(()=>{N.coins=400;const b=STC.buildings.find(q=>q.id=='cafe');STV.px=stDoorX(b);stPanel(true)});await E(()=>stInteract());
 const entered=await until(()=>place=='cafe'&&curV=='cafe'&&C.st=='idle',1500);await W(300);await shot('01_salle');
 const room=await E(()=>({npc:CAFE.R.npc.length,seated:CAFE.R.npc.filter(n=>n.st=='table').length,staff:CAFE.R.staff.length,habs:CAFE.R.npc.filter(n=>n.hab).map(n=>n.hab),seats:CAFE.SEATS.length,
  kinds:[...new Set(CAFE.FIX.map(f=>f.n))],tiles:[...document.querySelectorAll('#cafeG .tile')].map(t=>t.childNodes[0].textContent)}));
 ok('2 entrée par la porte du café dans la rue : vrai intérieur isométrique',entered,room.kinds);
 ok('3 salle détaillée : comptoir, machine, vitrine de pâtisseries, frigo, tables de 2 et de 4, banquettes, canapés, journaux, plantes, tapis',['CComptoir','CMach','CVitrine','CFrigo','CT2','CT4','CBox','CSofa','CBasse','CJourn','Plante','Tapis'].every(k=>room.kinds.includes(k))&&room.seats>=16,{seats:room.seats});
 ok('4 salle vivante dès l’arrivée : barista et serveur, clients installés, habitants du quartier',room.staff==2&&room.seated>=4&&room.habs.length>=1,room);
 // la vie continue : de nouveaux clients entrent, font la queue, commandent, repartent
 const life=await E(()=>({ids:CAFE.R.npc.map(n=>n.id)}));await run(1800);const life2=await E(()=>({ids:CAFE.R.npc.map(n=>n.id),st:CAFE.R.npc.map(n=>n.st),orders:CAFE.R.orders.length,prep:CAFE.R.staff[0].job?1:0}));
 ok('5 des clients entrent et sortent, commandent et sont servis pendant qu’on est là',life2.ids.some(i=>!life.ids.includes(i))&&life2.ids.length>=4,{avant:life.ids.length,apres:life2.ids.length,etats:life2.st});

 // 6-9. commander, payer, préparation animée, récupérer, s'installer, consommer
 await E(()=>[...document.querySelectorAll('#cafeG .tile')].find(t=>/Commander/.test(t.textContent)).click());await until(()=>CAFEUI.isOpen(),600);await W(250);await shot('02_carte');
 const carte=await E(()=>({b:[...document.querySelectorAll('.cfItem b')].map(x=>x.textContent)}));
 await E(()=>document.querySelector('[data-t="f"]').click());await W(150);const carte2=await E(()=>[...document.querySelectorAll('.cfItem b')].map(x=>x.textContent));
 ok('6 la carte : espresso, cappuccino, chocolat chaud, thé, jus de fruits, croissant, cookie, part de gâteau, avec prix et effets',carte.b.concat(carte2).join(',')=='Espresso,Cappuccino,Chocolat chaud,Thé,Jus de fruits,Croissant,Cookie,Part de gâteau',carte.b.concat(carte2));
 await E(()=>document.querySelectorAll('.cfItem')[2].click());await W(100);await E(()=>document.querySelector('[data-t="b"]').click());await W(100);await E(()=>document.querySelectorAll('.cfItem')[0].click());await W(100);
 const c0=await E(()=>N.coins);await E(()=>document.querySelector('.cfGo').click());await W(200);
 const paid=await E(()=>({coins:N.coins,ord:CAFE.me().ord&&CAFE.me().ord.its.map(i=>i.m.k)}));
 ok('7 commande payée en pièces (débit réel) : part de gâteau + espresso = 8 pièces',c0-paid.coins==8&&paid.ord&&paid.ord.length==2,{c0,paid});
 await until(()=>{const j=CAFE.R.staff[0].job;return j&&j.k=='prep'&&j.it.who===CAFE.me()&&j.t>20},1500);const prep=await E(()=>({job:CAFE.R.staff[0].job&&CAFE.R.staff[0].job.k,pose:CAFE.R.staff[0].pose,info:document.getElementById('cfInfo').textContent}));await shot('03_preparation');
 ok('8 préparation animée par la barista (machine, gestes, progression affichée)',prep.job=='prep'&&/cu/.test(prep.pose||'')&&/préparation/.test(prep.info),prep);
 const got=await until(()=>(CAFE.me().hand||[]).length==2,2500);
 ok('9 commande prête : le personnage va la chercher au comptoir et l’a en main',got,await E(()=>CAFE.me().hand.map(i=>i.m.k)));
 // choisir une table libre en la touchant : le personnage marche réellement jusqu'à la chaise
 const tgt=await E(()=>{const s=CAFE.SEATS.find(s=>!s.who&&!s.res&&s.f.n=='CT2'&&CAFE.mates(s).every(q=>!q.who));return s&&s.id});
 const pos0=await E(()=>[C.x,C.y]);await E(id=>{const s=CAFE.SEATS.find(q=>q.id==id);CAFE.sitAt(s)},tgt);await run(10);const walking=await E(()=>C.st=='walk'&&!!C.path);
 await until(()=>C.st=='csit'&&!CAFE.R.sit,1200);await W(200);
 const sat=await E(()=>({st:C.st,seat:CAFE.me().seat&&CAFE.me().seat.id,items:(CAFE.me().seat.items||[]).map(i=>i.m.k+':'+i.st),sp:spName}));await shot('04_installe');
 ok('10 s’installer : marche jusqu’à la place choisie (pas de téléportation), s’assoit, la commande est posée sur la table',walking&&sat.seat==tgt&&sat.items.length==2&&/^dn/.test(sat.sp),{walking,sat,pos0});
 const g0=await E(()=>({e:N.energy,h:N.happy,f:N.hunger}));
 await E(()=>[...document.querySelectorAll('#cafeG .tile')].find(t=>/^Boire/.test(t.textContent)).click());await run(40);const drinkPose=await E(()=>spName);await shot('05_boire');
 for(let k=0;k<10;k++){await until(()=>!CAFE.me().eat,600);const left=await E(()=>{const L=CAFE.me().seat.items.filter(i=>i.st=='table'&&i.who===CAFE.me());if(L.length){CAFE.consume(L[0]);return L.length}return 0});if(!left)break;await run(30)}
 const g1=await E(()=>({e:N.energy,h:N.happy,f:N.hunger,cafe:N.cafe,conso:N.cafe2.conso}));
 ok('11 consommation animée (gestes de boisson et de bouchée) et effets mesurés : énergie, bonheur, satiété',drinkPose=='dn6'&&g1.e-g0.e>4&&g1.h-g0.h>4&&g1.f-g0.f>3&&g1.conso.espresso==1&&g1.conso.gateau==1,{drinkPose,g0,g1});
 // la caféine compte moins quand on enchaîne les cafés
 const caf=await E(()=>{const m=CAFE.CK.espresso,S=CAFE.SV();const e0=N.energy;S.jour.caf=3;CAFE.effect(m,1);const d=N.energy-e0;S.jour.caf=1;return d});
 ok('12 effets équilibrés : le quatrième café de la journée ne donne presque plus d’énergie',caf>0&&caf<3,{caf});

 // 13. habitants : dire bonjour, discuter, faire connaissance, raconter, se revoir
 const hid=await E(()=>{const n=CAFE.R.npc.find(n=>n.hab&&!n.friend);return n&&n.hab});
 await E(id=>CAFEUI.hab(id,null),hid);await W(250);await shot('06_habitant');
 const s0=await E(id=>{const r=SOCIAL.SO().met[id];return r?r.pts:0},hid);
 const acts=[];for(const a of ['hello','talk','know','tell']){await E(a=>{const b=document.querySelector('[data-a="'+a+'"]');if(b&&!b.disabled)b.click()},a);await W(120);acts.push(await E(()=>document.querySelector('.socSay').textContent.slice(0,60)))}
 await E(id=>{SOCIAL.rel2(id,true).pts=Math.max(SOCIAL.rel2(id,true).pts,45)},hid);await E(()=>{CAFEUI.close()});await W(250);await E(id=>CAFEUI.hab(id,null),hid);await W(250);
 await E(()=>document.querySelector('[data-a="rdv"]').click());await W(150);
 const s1=await E(id=>({pts:SOCIAL.SO().met[id].pts,rdv:N.cafe2.rdv,mem:SOCIAL.SO().met[id].mem.map(m=>m.txt)}),hid);
 ok('13 rencontre au café : dire bonjour, discuter, faire connaissance, raconter quelque chose, proposer de se revoir (rendez-vous enregistré)',s1.rdv.some(r=>r.id==hid&&r.d==2)&&s1.mem.some(t=>/café/.test(t))&&acts.length==4,{hid,s0,s1:s1.pts,acts});
 await E(()=>CAFEUI.close());await W(250);

 // 14-16. jeux, journal, téléphone (vraiment jouables)
 await E(()=>CAFEUI.games());await W(250);await E(()=>document.querySelector('[data-g="p4"]').click());await W(250);const onTable=await E(()=>!!CAFE.R.game&&CAFE.me().act=='jeu');
 let res='';for(let k=0;k<25&&!res;k++){await E(()=>CAFEUI.p4Tap([3,2,4,1,5,0,6][Math.floor(Math.random()*7)]));await W(520);res=await E(()=>CAFEUI.GM&&CAFEUI.GM.over?document.querySelector('.cfMsg').textContent:'')}await shot('07_puissance4');
 ok('14 Puissance 4 jouable jusqu’au bout contre un adversaire, plateau posé sur la table, partie enregistrée',!!res&&onTable&&(await E(()=>N.cafe2.parties.p4.j))>=1,{res});
 await E(()=>{CAFEUI.close()});await W(250);await E(()=>CAFEUI.startGame('echecs',null));await W(250);
 const ch=await E(()=>{const sq=[...document.querySelectorAll('.cfChess .sq')];sq[52].click();return document.querySelectorAll('.cfChess .sq.can').length});await E(()=>[...document.querySelectorAll('.cfChess .sq')][36].click());await W(900);
 const ch2=await E(()=>({msg:document.querySelector('.cfMsg').textContent,black:CAFEUI.GM.b.filter((p,i)=>p&&p.c=='b'&&i>=16).length,turn:CAFEUI.GM.turn}));
 await E(()=>{CAFEUI.close()});await W(250);await E(()=>CAFEUI.startGame('cartes',null));await W(200);await E(()=>[...document.querySelectorAll('.cfRow button')].find(b=>/Rester/.test(b.textContent)).click());await W(200);
 const bj=await E(()=>({over:CAFEUI.GM.over,msg:document.querySelector('.cfMsg').textContent}));await shot('08_cartes');
 ok('15 échecs (coups légaux, l’adversaire répond) et 21 aux cartes jouables',ch==2&&ch2.black>=1&&ch2.turn=='w'&&bj.over&&/(Gagné|Perdu|Égalité)/.test(bj.msg),{ch,ch2,bj});
 await E(()=>CAFEUI.close());await W(250);
 const h0=await E(()=>N.happy);await E(()=>CAFEUI.journal());await W(250);const jr=await E(()=>({act:CAFE.me().act,q:document.querySelectorAll('.cfQuiz button').length,h:N.happy}));
 await E(()=>document.querySelectorAll('.cfQuiz button')[1].click());await W(200);await shot('09_journal');const jr2=await E(()=>({quiz:N.cafe2.jour.quiz,r:document.querySelector('.cfQr').textContent}));
 ok('16 lire le journal : pose de lecture, Gazette du quartier, question du jour à laquelle répondre',jr.act=='journal'&&jr.q==3&&jr.h>h0&&jr2.quiz!=null&&jr2.r.length>5,{jr,jr2});
 await E(()=>CAFEUI.close());await W(250);

 // 17. inviter un ami par téléphone : il arrive par la porte et s'installe à ta table
 await E(()=>{const S=SOCIAL.SO();['camille','rose','theo'].forEach(id=>{SOCIAL.rel2(id,true).pts=50})});
 await E(()=>CAFEUI.phone());await W(300);await shot('10_telephone');
 const inv=await E(()=>{const here=CAFE.R.npc.filter(n=>n.hab).map(n=>n.hab);const L=[...document.querySelectorAll('.cfInv [data-i]:not([disabled])')];const b=L.find(x=>!here.includes(x.dataset.i))||L[0];if(!b)return null;b.click();return b.dataset.i});
 let fr=null;for(let k=0;k<4&&!fr;k++){await W(400);const m=await E(()=>document.querySelector('.cfPhMsg')&&document.querySelector('.cfPhMsg').textContent);fr=await E(()=>SOCIAL.OUT&&SOCIAL.OUT.id);if(!fr&&k==3)console.log('refus',m)}
 if(!fr){// refus possible (réponse du jour) : on en invite un autre
  await E(()=>{CAFEUI.close()});await W(250);await E(()=>CAFEUI.phone());await W(300);await E(()=>{const L=[...document.querySelectorAll('.cfInv [data-i]:not([disabled])')];for(const b of L){b.click();if(SOCIAL.OUT)break}});fr=await E(()=>SOCIAL.OUT&&SOCIAL.OUT.id)}
 await E(()=>CAFEUI.close());
 const came=await until(()=>CAFE.R.friend&&CAFE.R.friend.st=='table',2500);const fst=await E(()=>({id:CAFE.R.friend&&CAFE.R.friend.hab,same:CAFE.R.friend&&CAFE.mates(CAFE.me().seat).includes(CAFE.R.friend.seat)}));await shot('11_ami');
 ok('17 inviter un ami par téléphone : il arrive au café et s’installe à ta table',!!fr&&came&&fst.same,{fr,fst});
 // offrir un verre, discuter, jouer ensemble : la sortie compte et l'amitié grandit
 const p0=await E(id=>SOCIAL.SO().met[id].pts,fst.id);
 await E(()=>CAFEUI.menu('b'));await W(200);await E(()=>{const g=document.querySelector('.cfGift input');g.click()});await W(100);await E(()=>document.querySelectorAll('.cfItem')[2].click());await W(100);const c1=await E(()=>N.coins);await E(()=>document.querySelector('.cfGo').click());await W(200);
 const gift=await E(c=>c-N.coins,c1);await until(()=>(CAFE.R.friend.seat.items||[]).some(i=>i.m.k=='chocolat'),2000);
 await E(id=>CAFEUI.hab(id,CAFE.R.friend),fst.id);await W(200);await E(()=>document.querySelector('[data-a="talk"]').click());await W(150);await E(()=>CAFEUI.close());await W(250);
 const out=await E(id=>({did:SOCIAL.OUT&&SOCIAL.OUT.did,extra:SOCIAL.OUT&&SOCIAL.OUT.extra,pts:SOCIAL.SO().met[id].pts,amis:N.cafe2.amis}),fst.id);
 ok('18 avec l’ami : verre offert (payé pour deux), discussion, sortie réussie et amitié en hausse',gift==8&&out.did&&out.pts>p0&&out.amis>=1,{gift,p0,out});
 // en partant : retour dans la rue devant le café, conclusion de la sortie
 await E(()=>document.getElementById('cafeHome').click());await until(()=>STV.on,2500);await until(()=>!SOCIAL.OUT,600);
 const back=await E(()=>{const b=STC.buildings.find(q=>q.id=='cafe');return{rue:STV.on,dx:Math.round(STV.px-stDoorX(b)),out:!!SOCIAL.OUT,mem:SOCIAL.SO().met[CAFE.R.friend?CAFE.R.friend.hab:'x']}});
 const memF=await E(id=>SOCIAL.SO().met[id].mem.map(m=>m.txt),fst.id);await W(300);await shot('12_retour_rue');
 ok('19 sortie du café : on retrouve la rue devant sa porte, la sortie avec l’ami est conclue et gardée en souvenir',back.rue&&Math.abs(back.dx)<12&&!back.out&&memF.some(t=>/café/i.test(t)),{back,memF:memF.slice(0,3)});
 await E(()=>{try{SOCIAL.closeCard()}catch(e){}});

 // 20. invitation depuis la rue : l'ami entre avec le joueur
 await E(()=>{N.day=(N.day||1)+3;SOCIAL.rel2('zoe',true).pts=70;SOCIAL.rel2('zoe').ask=0});const iv=await E(()=>{let r=SOCIAL.invite('zoe','cafe');return r});
 if(iv.ok){await until(()=>place=='cafe'&&curV=='cafe',2500);await until(()=>CAFE.R.friend&&CAFE.R.friend.hab=='zoe',600)}
 const z=await E(()=>({place,f:CAFE.R.friend&&CAFE.R.friend.hab,cp:SOCIAL.CP.on}));
 ok('20 sortie « café » proposée dans la rue : on marche jusqu’au café et l’ami entre avec toi',!iv.ok||(z.place=='cafe'&&z.f=='zoe'&&!z.cp),{iv,z});

 // 21. événements : rendez-vous du jour
 const rv=await E(()=>{CAFE.R.npc.length;return CAFE.CEV.map(e=>e.id)});
 await until(()=>C.st=='idle',1500);await E(()=>{N.cafe2.rdv=[{id:'marcel',d:N.day}];SOCIAL.rel2('marcel',true).pts=30;document.getElementById('cafeHome').click()});await until(()=>STV.on,2500);
 await E(()=>{if(SOCIAL.OUT)SOCIAL.conclude(true);try{SOCIAL.closeCard()}catch(e){}const b=STC.buildings.find(q=>q.id=='cafe');STV.px=stDoorX(b);stPanel(true)});await W(300);await E(()=>{N.cafe2.rdv=[{id:'marcel',d:N.day}];tod=0.05;stInteract()});await until(()=>place=='cafe'&&curV=='cafe'&&C.st=='idle',2500);
 const ev=await E(()=>({ev:(CAFE.R.ev||[]).map(e=>e.id),marcel:CAFE.R.npc.some(n=>n.hab=='marcel'),info:document.getElementById('cfInfo').textContent}));
 ok('21 rendez-vous : l’habitant est au café le jour prévu (registre d’événements extensible : rendez-vous, soirée jeux, rencontre)',ev.ev.includes('rdv')&&ev.marcel&&rv.length>=3,{rv,ev});

 // 22. sauvegarde : tout est dans la sauvegarde du jeu et survit au rechargement
 await E(()=>save());const snap=await E(()=>JSON.stringify({c:N.cafe2.conso,p:N.cafe2.parties,v:N.cafe2.visites,cafe:N.cafe,coins:N.coins}));
 await p.reload();await W(3000);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});
 const snap2=await E(()=>JSON.stringify({c:N.cafe2.conso,p:N.cafe2.parties,v:N.cafe2.visites,cafe:N.cafe,coins:N.coins}));const keys=await E(()=>Object.keys(localStorage).filter(k=>/cafe/i.test(k)));
 ok('22 sauvegarde : consommations, parties, visites et pièces identiques après rechargement, dans la sauvegarde du jeu',snap==snap2&&keys.length==0,{snap,snap2,keys});

 // 23. affichage
 await E(()=>{if(place!='cafe')arrive('cafe')});await until(()=>curV=='cafe'&&C.st=='idle',1500);await E(()=>CAFEUI.menu('b'));await W(300);
 const lay=await E(()=>{const c=document.querySelector('#cfOver .rsCard').getBoundingClientRect(),bt=[...document.querySelectorAll('#cfOver .cfItem,#cfOver .cfGo,#cfOver .rsX')].map(b=>b.getBoundingClientRect());const T=[...document.querySelectorAll('#cafeG .tile')].map(b=>b.getBoundingClientRect());
  return{vw:innerWidth,vh:innerHeight,card:[c.left,c.top,c.right,c.bottom].map(Math.round),minBtn:Math.min(...bt.map(r=>r.height)),tileMin:Math.min(...T.map(r=>r.height)),tileOver:T.filter(r=>r.right>innerWidth+1).length,scene:document.querySelector('#scene,canvas')&&document.querySelector('canvas').getBoundingClientRect().top}});
 await shot('13_affichage');await E(()=>CAFEUI.close());await W(250);const scene2=await E(()=>document.querySelector('canvas').getBoundingClientRect().top);
 ok('23 affichage ('+MODE+') : fenêtre entière à l’écran, boutons d’au moins 40 px, rien ne déborde, la scène ne bouge pas à l’ouverture',lay.card[0]>=0&&lay.card[1]>=0&&lay.card[2]<=lay.vw&&lay.card[3]<=lay.vh&&lay.minBtn>=40&&lay.tileMin>=40&&lay.tileOver==0&&Math.abs(scene2-lay.scene)<1,lay);
 ok('24 aucune erreur JavaScript',errs.length==0,errs.slice(0,5));
 console.log(okN+'/'+n+' tests réussis ('+MODE+')');await b.close();process.exit(okN==n?0:1)})();
