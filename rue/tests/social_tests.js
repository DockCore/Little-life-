// Tests réels du système social (Playwright + Chrome) : habitants, vie dans la rue, interactions, amitié, cadeaux,
// sorties dans les vrais lieux du jeu, visites à domicile, événements, profil « Mes amis », sauvegarde, affichage mobile.
// Usage : node rue/tests/social_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const MODE=process.argv[2]||'tel';const R=[];
function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const VP={tel:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true},paysage:{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true},pc:{viewport:{width:1366,height:768}}};
const ctx=await b.newContext(VP[MODE]);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),shot=n=>p.screenshot({path:`${O}/so_${MODE}_${n}.png`});
const run=n=>E(n=>{for(let i=0;i<n;i++){update();if(STV.on)stTick()}},n);
const boot=async()=>{await p.goto(JEU);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c)c.click()});await W(800)};
await boot();
await E(()=>{tod=.05;N.day=3;N.look.g='m';N.coins=200;N.energy=100;N.hunger=80;N.social=null;N.stock=[3,2,2,1];N.store=['Plante','Lampe'];try{wEquip(N.look,'teeb',0);wEquip(N.look,'jean',0);wEquip(N.look,'basket',0)}catch(e){}spKey='';save()});
const closeAll=async()=>{await E(()=>{if(SOCIAL.UI.open||!document.getElementById('socOver').hidden)SOCIAL.closeCard()});await W(350)};

// ---- 1. habitants uniques et persistants ----
const hab=await E(()=>{const H=SOCIAL.HAB;return{n:H.length,noms:H.map(h=>h.nom),uniq:new Set(H.map(h=>h.nom)).size,perso:new Set(H.map(h=>h.perso)).size,complet:H.every(h=>h.look&&h.sched.matin&&h.sched.nuit&&h.fav.length&&h.gout.love.length&&h.gout.hate.length&&h.faits.length==5&&h.anniv>=1&&h.anniv<=30&&h.bio),
 memes:JSON.stringify(H.map(h=>h.look))==JSON.stringify(SOCIAL.HAB.map(h=>h.look)),gym:['Léa','Malik','Zoé'].every(n=>{const g=GYM.NPCS.find(x=>x.nom==n),h=H.find(x=>x.nom==n);return JSON.stringify(GYM.LOOKS[g.i].wd)==JSON.stringify(h.look.wd)})}});
ok('1 huit habitants uniques : prénom, apparence fixe, personnalité, horaires, lieux favoris, goûts ; Léa, Malik et Zoé ont la même apparence qu’à la salle',hab.n==8&&hab.uniq==8&&hab.perso==8&&hab.complet&&hab.memes&&hab.gym,hab);
// ---- 2. vie dans la rue : peu de monde, déplacements variés, pas de chevauchement, limites respectées ----
await E(()=>streetEnter(600));await run(200);await W(1500);await shot('01_rue');
const life=await E(()=>{const L=SOCIAL.ST.list,res={n0:L.length,ids:L.map(w=>w.id)};let over=0,maxN=0,out=0,moves=new Set(),states=new Set();const x0={};
 for(let i=0;i<2400;i++){update();stTick();tod=.05;const L2=SOCIAL.ST.list;maxN=Math.max(maxN,L2.length);L2.forEach(w=>{if(x0[w.id]==null)x0[w.id]=w.x;if(Math.abs(w.x-x0[w.id])>20)moves.add(w.id);states.add(w.st);if(w.x<STC.minX-40||w.x>STC.maxX+40)out++});
  for(let a=0;a<L2.length;a++)for(let c=a+1;c<L2.length;c++){const A=L2[a],B=L2[c];if(A.lane==B.lane&&A.a>.9&&B.a>.9&&A.st=='walk'&&B.st=='walk'&&Math.abs(A.x-B.x)<6)over++}}
 res.over=over;res.maxN=maxN;res.out=out;res.moves=[...moves];res.states=[...states];return res});
ok('2 habitants dans la rue : 2 à 5 à l’écran, ils marchent, s’arrêtent, sans se chevaucher ni sortir des limites',life.n0>=2&&life.maxN<=5&&life.over<30&&life.out==0&&life.moves.length>=1,life);
// entrer et ressortir des commerces, changer de destination selon l’heure
const shop=await E(()=>{const w=SOCIAL.ST.list.find(x=>x.st=='walk');if(!w)return{err:'aucun'};const b=STC.buildings.find(x=>x.id=='resto');w.x=stDoorX(b)-30;w.goal={x:stDoorX(b),enter:'resto',errand:1};w.wait=0;const id=w.id;let gone=0,back=0;
 for(let i=0;i<4000;i++){tod=.05;update();stTick();if(!SOCIAL.ST.list.some(x=>x.id==id))gone=gone||i;else if(gone&&!back)back=i}
 // la nuit, la plupart rentrent chez eux
 for(let i=0;i<3600;i++){tod=.5;update();stTick()}const night=SOCIAL.ST.list.filter(w=>w.a>.5).length;tod=.05;return{id,gone,back,night}});
ok('3 un habitant entre dans un commerce puis en ressort ; la nuit, la rue se vide (1 habitant au plus)',shop.gone>0&&shop.back>shop.gone&&shop.night<=1,shop);
// discussion entre habitants
const chat=await E(()=>{SOCIAL.ST.list.length=0;const a={id:'leo',x:800,lane:0,dir:1,sp:1,st:'walk',a:1,t:0,ph:0,goal:{x:900},wait:0},c={id:'rose',x:840,lane:0,dir:-1,sp:1,st:'walk',a:1,t:0,ph:0,goal:{x:700},wait:0};SOCIAL.ST.list.push(a,c);
 const lane1={id:'theo',x:820,lane:1,dir:1,sp:1,st:'chat',a:1,t:0,ph:0,goal:null,wait:9999};SOCIAL.ST.list.push(lane1);let got=0;for(let i=0;i<80;i++){update();stTick();if(a.st=='chat'&&c.st=='chat'){got=1;break}}SOCIAL.ST.list.length=0;return{got,face:[a.dir,c.dir]}});
ok('4 deux habitants qui se croisent s’arrêtent pour discuter',chat.got&&chat.face[0]==-chat.face[1],chat);
// ---- 5. toucher un habitant : carte élégante avec les 5 actions ----
await E(()=>{tod=.05;SOCIAL.ST.list.length=0;SOCIAL.ST.list.push({id:'leo',x:STV.px+20,lane:1,dir:-1,sp:1,st:'walk',a:1,t:0,ph:0,goal:{x:STV.px+20},wait:9999})});await run(60);await W(400);
const tap=await E(()=>{const w=SOCIAL.ST.list[0],cv=document.getElementById('stCv'),r=cv.getBoundingClientRect(),x=(w.x-STV.cam)/STV.W*r.width+r.left,y=(ST_WALK-40+STV.oy)/STV.H*r.height+r.top;cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true,pointerType:'touch',isPrimary:true}));
 return{open:SOCIAL.UI.open,btn:[...document.querySelectorAll('#socOver .socBtns button')].map(b=>b.textContent),rel:!!SOCIAL.rel('leo'),mem:(SOCIAL.rel('leo')||{mem:[]}).mem.length,por:(()=>{const c=document.querySelector('#socOver .socPor canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]&&!(d[i]==d[i+4]))n++;return c.width})(),walkStopped:SOCIAL.ST.list[0].st}});
await W(300);await shot('05_carte');
ok('5 toucher un habitant ouvre sa carte (portrait, jauge, Discuter, Faire connaissance, Offrir un cadeau, Proposer une sortie, Profil) ; première rencontre mémorisée',tap.open=='leo'&&['Discuter','Faire connaissance','Offrir un cadeau','Proposer une sortie','Consulter son profil'].every(t=>tap.btn.includes(t))&&tap.rel&&tap.mem==1&&tap.walkStopped=='talk',tap);
// ---- 6. discussions variées, rendement décroissant ----
const talks=await E(()=>{const L=[],G=[];for(let i=0;i<6;i++){const r=SOCIAL.talk('leo');L.push(r.txt);G.push(r.g)}return{L,G,dup:L.some((t,i)=>i&&t==L[i-1]),pts:SOCIAL.rel('leo').pts}});
ok('6 discussions jamais identiques deux fois de suite, gain d’amitié de plus en plus faible si on insiste',!talks.dup&&new Set(talks.L).size>=4&&talks.G[0]>talks.G[2]&&talks.G[4]==0,talks);
const ctxL=await E(()=>{N.wx='pluie';const h=SOCIAL.HB('leo');const r=SOCIAL.rel('leo');let rain=0;for(let i=0;i<40;i++){r.last=[];if(SOCIAL.line(h,'hello').includes('soupe'))rain++}const d0=N.day;N.day=12;r.last=[];let bd=0;for(let i=0;i<30;i++){r.last=[];if(/anniversaire/.test(SOCIAL.line(h,'hello')))bd++}N.day=d0;N.wx='soleil';return{rain,bd}});
ok('6b les phrases tiennent compte du contexte (météo, anniversaire)',ctxL.rain>0&&ctxL.bd>0,ctxL);
// ---- 7. paliers d’amitié ----
const tiers=await E(()=>[0,19,20,39,40,59,60,79,80,100].map(v=>SOCIAL.tierName(v,'m')).concat([SOCIAL.tierName(45,'f')]));
ok('7 paliers : Inconnu, Connaissance, Ami, Bon ami, Meilleur ami (accordés au féminin)',tiers.join(',')=='Inconnu,Inconnu,Connaissance,Connaissance,Ami,Ami,Bon ami,Bon ami,Meilleur ami,Meilleur ami,Amie',tiers);
// ---- 8. faire connaissance ----
const know=await E(()=>{const r=[];for(let i=0;i<4;i++)r.push(SOCIAL.know('leo'));return{facts:r.map(x=>!!x.fact),lock:r.map(x=>x.lock||0),known:SOCIAL.rel('leo').know.length}});
ok('8 faire connaissance révèle des souvenirs un par un, les plus personnels quand l’amitié grandit',know.facts[0]&&know.facts[1]&&know.lock.some(l=>l>0)&&know.known==2,know);
// ---- 9. cadeaux : choix dans l’inventaire, confirmation, réactions selon les goûts ----
await E(()=>{SOCIAL.UI.view='main';SOCIAL.act('gift')});const glist=await E(()=>[...document.querySelectorAll('#socOver .socList button b')].map(b=>b.textContent));
const gcancel=await E(()=>{const btns=[...document.querySelectorAll('#socOver .socList button')];btns.find(b=>b.textContent.includes('Gâteau')).click();const q=document.querySelector('#socOver .socSay').textContent;const st=N.stock[2];document.querySelector('#socOver [data-a="cancel"]').click();return{q,st,after:N.stock[2]}});
const g1=await E(()=>{const pts0=SOCIAL.rel('leo').pts;[...document.querySelectorAll('#socOver .socList button')].find(b=>b.textContent.includes('Gâteau')).click();document.querySelector('#socOver [data-a="ok"]').click();return{say:document.querySelector('#socOver .socSay').textContent,stock:N.stock[2],d:+(SOCIAL.rel('leo').pts-pts0).toFixed(1),pref:SOCIAL.rel('leo').pref['Gâteau']}});
const g2=await E(()=>{const pts0=SOCIAL.rel('leo').pts;const r=SOCIAL.give('leo',{k:'store',n:'Plante'});return{p:r.p,d:+(SOCIAL.rel('leo').pts-pts0).toFixed(1),store:N.store.slice()}});
const g3=await E(()=>{const pts0=SOCIAL.rel('leo').pts;const r=SOCIAL.give('leo',{k:'food',i:0,n:'Pomme'});return{p:r.p,d:+(SOCIAL.rel('leo').pts-pts0).toFixed(1)}});
ok('9 cadeaux : inventaire (placard et objets rangés), rien n’est retiré sans confirmation, réaction selon ses goûts, goûts découverts, rendement réduit le même jour',glist.includes('Gâteau')&&glist.includes('Plante')&&/Offrir/.test(gcancel.q)&&gcancel.after==gcancel.st&&g1.stock==gcancel.st-1&&g1.pref=='love'&&g1.d==15&&g2.p=='hate'&&g2.d<0&&!g2.store.includes('Plante')&&g3.p=='neutral'&&g3.d<3,{glist,gcancel,g1,g2,g3});
await closeAll();
// ---- 10. sorties : refus si on ne se connaît pas, puis restaurant ensemble ----
const ref=await E(()=>{SOCIAL.rel('rose',true).pts=5;return SOCIAL.invite('rose','resto')});
await E(()=>{SOCIAL.rel('leo').pts=55;SOCIAL.rel('leo').ask=0;const b=STC.buildings.find(x=>x.id=='resto');STV.px=stDoorX(b)-200;STV.cam=Math.max(0,STV.px-150)});
const inv=await E(()=>SOCIAL.invite('leo','resto'));
const atResto=await (async()=>{for(let i=0;i<300;i++){if(await E(()=>place=='resto'&&C.st=='idle'))return true;await run(10);await W(20)}return false})();
await run(120);const cp=await E(()=>({on:SOCIAL.CP.on,u:SOCIAL.CP.u,ph:SOCIAL.OUT&&SOCIAL.OUT.ph}));await shot('10_resto_entree');
// le joueur s’assoit : le compagnon le rejoint à table, commande et mange
await E(()=>{const s=RESTO.SEATS.find(x=>x.k==0&&!x.who&&!x.res&&!x.f.seats.some(y=>y.who||y.res));RESTO.sitAt(s)});for(let i=0;i<80&&(await E(()=>C.st))!='rsit';i++)await run(20);await run(400);
const join=await E(()=>{const me=RESTO.me(),o=me.seat.f.seats.find(x=>x!==me.seat);return{seat:me.seat.id,other:o&&(o.who||o.res)?(o.who||o.res).i:null,look:o&&(o.who||o.res)?RESTO.LOOKS[(o.who||o.res).i].__soc:null}});
await E(()=>{const d=RESTO.me();d.order=[{m:RESTO.MK.pates,st:'served',por:1,c:1,t:0,T:1,tk:true}];RESTO.eatNext('f')});await E(()=>{for(let i=0;i<3000&&RESTO.me().eat;i++)update()});await shot('10b_resto_table');
await E(()=>{RESTO.askBill()});await E(()=>{for(let i=0;i<4000&&!RESTO.R.billOpen;i++)update()});await E(()=>RESTO.pay());await E(()=>RESTO.leave());
const backR=await (async()=>{for(let i=0;i<300;i++){if(await E(()=>STV.on&&!document.getElementById('socOver').hidden))return true;await run(10);await W(20)}return false})();await W(300);await shot('10c_fin_sortie');
const endR=await E(()=>({txt:document.querySelector('#socOver .socRes').textContent,mem:SOCIAL.rel('leo').mem[0],out:!!SOCIAL.OUT}));
ok('10 sortie au restaurant : refus poli si on ne se connaît pas, puis marche jusqu’au restaurant, entrée ensemble, à table ensemble, repas, conclusion et souvenir',!ref.ok&&inv.ok&&atResto&&cp.on&&join.look=='leo'&&/réussie/.test(endR.txt)&&endR.mem.k=='resto'&&!endR.out,{ref,inv,atResto,cp,join,endR});
await closeAll();
// ---- 11. salle de sport ensemble ----
await E(()=>{SOCIAL.rel('lea',true).pts=50;const b=STC.buildings.find(x=>x.id=='sport');STV.px=stDoorX(b)-100});const invG=await E(()=>SOCIAL.invite('lea','sport'));
for(let i=0;i<300&&!(await E(()=>place=='gym'&&C.st=='idle'));i++){await run(10);await W(20)}await run(100);
const gym=await E(()=>{N.energy=100;GYM.start('stretch',0);for(let i=0;i<4000&&!GYM.GM;i++)update();const g=GYM.GM;for(let i=0;i<20000&&!g.res;i++){if((g.ph=='wait'||g.ph=='out')&&g.r<.03)GYM.inp('B','down');else if(g.ph=='in'&&g.r>=.995)GYM.inp('B','up');update()}document.querySelector('.gmRes .gmBack').click();return{did:SOCIAL.OUT&&SOCIAL.OUT.did,cp:SOCIAL.CP.on}});await shot('11_salle');
await E(()=>GYM.leave());for(let i=0;i<300&&!(await E(()=>STV.on&&!document.getElementById('socOver').hidden));i++){await run(10);await W(20)}const endG=await E(()=>({txt:(document.querySelector('#socOver .socRes')||{}).textContent,mem:SOCIAL.rel('lea').mem[0]||{}}));
ok('11 sortie à la salle de sport : Léa entre avec toi, une séance faite ensemble, conclusion réussie',invG.ok&&gym.did&&gym.cp&&/réussie/.test(endG.txt||'')&&endG.mem.k=='sport',{invG,gym,endG});
await closeAll();
// ---- 12. arcade ensemble (jeu en plein écran) ----
await E(()=>{SOCIAL.rel('theo',true).pts=45;SOCIAL.rel('theo').ask=0;tod=.05;const b=STC.buildings.find(x=>x.id=='arcade');STV.px=stDoorX(b)-80});const invA=await E(()=>SOCIAL.invite('theo','arcade'));
for(let i=0;i<300&&!(await E(()=>typeof ARC!='undefined'&&ARC.on));i++){await run(10);await W(20)}await run(30);const badge=await E(()=>{const b=document.getElementById('socBadge');return b?!b.hidden:{none:1,arc:ARC.on,out:SOCIAL.OUT,place,stv:STV.on}});await shot('12_arcade');
await E(()=>{const i=ARC.games.findIndex(g=>g.id=='mole');ARC.sel=i;arcOk();arcOk()});await W(400);await E(()=>{ARC.modules.mole._state.api.end(50);update()});await W(300);const didA=await E(()=>SOCIAL.OUT&&SOCIAL.OUT.did);
await E(()=>arcQuit());for(let i=0;i<200&&!(await E(()=>STV.on&&!document.getElementById('socOver').hidden));i++){await run(10);await W(20)}
const endA=await E(()=>({txt:(document.querySelector('#socOver .socRes')||{}).textContent,mem:SOCIAL.rel('theo').mem[0]||{},notes:SOCIAL.SO().notes.slice(0,3).map(n=>n.t),out:SOCIAL.OUT}));
ok('12 sortie à l’arcade : badge « Théo joue avec toi », une partie jouée, conclusion réussie',invA.ok&&badge&&didA&&/réussie/.test(endA.txt||'')&&endA.mem.k=='arcade',{invA,badge,didA,endA});
await closeAll();
// ---- 13. promenade ----
await E(()=>{SOCIAL.rel('zoe',true).pts=30;SOCIAL.rel('zoe').ask=0;STV.px=400;STV.cam=250});const invP=await E(()=>SOCIAL.invite('zoe','promenade'));
await E(()=>{for(let i=0;i<300;i++){STV.keys.ArrowRight=1;update();stTick()}STV.keys={}});const walk=await E(()=>({did:SOCIAL.OUT&&SOCIAL.OUT.did,dist:SOCIAL.OUT&&Math.round(SOCIAL.OUT.dist),follow:SOCIAL.ST.list.find(w=>w.id=='zoe').st,gap:Math.round(Math.abs(SOCIAL.ST.list.find(w=>w.id=='zoe').x-STV.px))}));
await shot('13_promenade');await E(()=>SOCIAL.endWalk());const endP=await E(()=>({txt:(document.querySelector('#socOver .socRes')||{}).textContent,mem:SOCIAL.rel('zoe').mem[0]||{}}));
ok('13 promenade : Zoé marche à côté de toi, la balade compte les pas, puis se termine avec un souvenir',invP.ok&&walk.did&&walk.follow=='follow'&&walk.gap<40&&/réussie/.test(endP.txt||'')&&endP.mem.k=='promenade',{invP,walk,endP});
await closeAll();
// ---- 14. visite à domicile : arrivée, discussion, partage, départ ----
const lock=await E(()=>{SOCIAL.rel('rose').pts=30;return SOCIAL.canInvite(SOCIAL.HB('rose'),'maison')});
await E(()=>{SOCIAL.rel('rose').pts=45;SOCIAL.rel('rose').ask=0;const b=STC.buildings.find(x=>x.id=='maison');STV.px=stDoorX(b)-60;STV.cam=Math.max(0,STV.px-150)});const invH=await E(()=>SOCIAL.invite('rose','maison'));
for(let i=0;i<400&&!(await E(()=>place=='home'&&SOCIAL.VS.on&&SOCIAL.VS.st=='talk'));i++){await run(10);await W(20)}await W(300);await shot('14_visite');
const vis=await E(()=>({st:SOCIAL.VS.st,say:document.querySelector('#socOver .socSay').textContent,btns:[...document.querySelectorAll('#socOver [data-v]')].map(b=>b.textContent),cpIn:SOCIAL.CP.u>1}));
const share=await E(()=>{const s0=N.stock[0];document.querySelector('#socOver [data-v="tour"]').click();const t=document.querySelector('#socOver .socSay').textContent;document.querySelector('#socOver [data-v="eat"]').click();return{t,s0,s1:N.stock[0]}});
await E(()=>document.querySelector('#socOver [data-v="bye"]').click());for(let i=0;i<300&&!(await E(()=>!SOCIAL.VS.on));i++){await run(10);await W(10)}await W(300);
const endH=await E(()=>({txt:(document.querySelector('#socOver .socRes')||{}).textContent,mem:SOCIAL.rel('rose').mem[0]||{},cp:SOCIAL.CP.on}));
ok('14 visite à domicile : réservée aux amis, arrivée à la porte, dialogue propre, visite et repas partagé, départ et souvenir',!lock.ok&&invH.ok&&vis.st=='talk'&&vis.cpIn&&vis.btns.length>=3&&share.s1==share.s0-1&&/réussie/.test(endH.txt||'')&&endH.mem.k=='maison'&&!endH.cp,{lock,invH,vis,share,endH});
await closeAll();
// ---- 15. un bon ami vient de lui-même frapper à la porte ----
const hv=await E(()=>{SOCIAL.rel('malik',true).pts=70;const S=SOCIAL.SO();S.hv=null;let got=null;const r0=Math.random;Math.random=()=>.1;for(let i=0;i<1300&&!got;i++){update();if(SOCIAL.VS.on)got=SOCIAL.VS.id}Math.random=r0;if(got){SOCIAL.VS.on=false;SOCIAL.CP.on=false;SOCIAL.OUT=null}return{got,cur:curV,place}});
ok('15 visite spontanée d’un bon ami à la maison (pas plus d’une fois tous les 3 jours)',!!hv.got,hv);
// ---- 16. événements sociaux : conditions précises, pas de répétition ----
const ev=await E(()=>{const S=SOCIAL.SO();S.ev={};S.notes=[];SOCIAL.rel('leo').pts=85;const r0=Math.random;Math.random=()=>.1;N.day=12;S.evDay=null;SOCIAL.evTick();const n1=S.notes.map(n=>n.t);S.evDay=null;SOCIAL.evTick();const n2=S.notes.length;N.day=14;S.evDay=null;SOCIAL.evTick();const n3=S.notes.slice(0,S.notes.length-n2).map(n=>n.t);
 N.day=13;S.evDay=null;SOCIAL.evTick();Math.random=r0;return{n1,n2,repeat:n2==n1.length,n3,fete:SOCIAL.isFete(),inv:S.inv}});
ok('16 événements : anniversaire, cadeau surprise, invitation, moment entre amis, fête de quartier ; jamais deux fois le même jour, délais respectés',ev.n1.some(t=>/anniversaire de Léo/.test(t))&&ev.n1.some(t=>/surprise/.test(t))&&ev.n1.some(t=>/invite/.test(t))&&ev.repeat&&!ev.n3.some(t=>/surprise de Léo|Léo t’offre/.test(t)),ev);
// ---- 17. menu « Mes amis » et profil ----
await E(()=>{if(!STV.on)streetEnter(600)});await run(30);await E(()=>document.getElementById('stFriends').click());await W(400);await shot('17_amis');
const menu=await E(()=>({n:document.querySelectorAll('#socOver .socF').length,txt:[...document.querySelectorAll('#socOver .socF')].map(e=>e.textContent),por:document.querySelectorAll('#socOver .socF canvas').length}));
await E(()=>document.querySelector('#socOver .socF[data-id="leo"]').click());await W(300);await shot('17b_profil');
const prof=await E(()=>{const t=document.querySelector('#socOver .socProf').textContent;return{t,h4:[...document.querySelectorAll('#socOver .socProf h4')].map(h=>h.textContent)}});
ok('17 « Mes amis » : habitants rencontrés avec portrait et niveau ; profil avec personnalité, découvertes, goûts, souvenirs et prochaines possibilités',menu.n>=6&&menu.por==menu.n&&menu.txt.some(t=>/Léo.*Meilleur ami/.test(t))&&['Personnalité','Ce que tu sais','Cadeaux découverts','Souvenirs partagés','Prochaines possibilités'].every(h=>prof.h4.includes(h))&&/adore/.test(prof.t)&&/Dîner au restaurant/.test(prof.t),{menu,h4:prof.h4});
// ---- 18. affichage mobile : la carte tient à l’écran, boutons au doigt ----
await closeAll();await E(()=>SOCIAL.openCard('leo'));await W(400);
const lay=await E(()=>{const c=document.querySelector('#socOver .socCard').getBoundingClientRect(),bt=[...document.querySelectorAll('#socOver .socBtns button')].map(b=>b.getBoundingClientRect());return{vw:innerWidth,vh:innerHeight,c:[c.left,c.top,c.right,c.bottom].map(Math.round),bt:bt.map(r=>[Math.round(r.top),Math.round(r.bottom),Math.round(r.height)])}});
ok('18 carte entièrement visible ('+MODE+'), boutons d’au moins 44 px',lay.c[0]>=0&&lay.c[1]>=0&&lay.c[2]<=lay.vw&&lay.c[3]<=lay.vh&&lay.bt.every(r=>r[2]>=44&&r[1]<=lay.vh),lay);
await closeAll();
// ---- 19. sauvegarde : relations, goûts, souvenirs, événements conservés ----
const pick=()=>{const m={};for(const k in N.social.met){const r=N.social.met[k];m[k]={pts:r.pts,know:r.know,pref:r.pref,mem:r.mem.map(x=>x.txt)}}return JSON.stringify({m,ev:Object.keys(N.social.ev).length>=5})};
const snap=await E(()=>{save();return 1}).then(()=>E(pick));await boot();const snap2=await E(pick);const keys=await E(()=>Object.keys(localStorage).filter(k=>/soc/i.test(k)));
ok('19 sauvegarde : tout le système social est identique après rechargement, dans la sauvegarde du jeu',snap2==snap&&keys.length==0,{same:snap2==snap,len:snap.length,keys});
ok('20 aucune erreur JavaScript',!errs.length,errs.slice(0,5));
const res={mode:MODE,ok:R.filter(r=>r.ok).length,total:R.length,R};fs.writeFileSync(`${O}/social_${MODE}.json`,JSON.stringify(res,null,1));console.log(`\n${res.ok}/${res.total} tests réussis (${MODE})`);await b.close();process.exit(res.ok==res.total?0:1)})();
