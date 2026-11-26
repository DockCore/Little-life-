// Tests réels de la salle de sport (Playwright + Chrome) : intérieur, déplacements, collisions, chaque machine jouée,
// animations avec plusieurs tenues, progression, objectifs, records, défis, récompenses, équilibrage, sauvegarde, portrait/paysage.
// Usage : node rue/tests/gym_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const MODE=process.argv[2]||'tel';const R=[];
function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const VP={tel:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true},paysage:{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true},pc:{viewport:{width:1366,height:768}}};
const ctx=await b.newContext(VP[MODE]);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),shot=n=>p.screenshot({path:`${O}/gy_${MODE}_${n}.png`});
const boot=async()=>{await p.goto(JEU);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c)c.click()});await W(800)};
await boot();
await E(()=>{tod=.45;N.look.g='m';N.coins=150;N.energy=100;N.sport=null;try{wEquip(N.look,'teeb',0);wEquip(N.look,'short',0);wEquip(N.look,'basket',0)}catch(e){}spKey='';save()});
// robot : appuie sur les mêmes commandes que les boutons, au bon moment (q = taux de réussite)
const BOT=()=>{window.__bot=function(q){const g=GYM.GM;if(!g||g.res||g.count>0||g.done)return;const I=GYM.inp,G2=GYM.GAMES[g.k];const ok=()=>Math.random()<q;
 if(g.k=='run'){for(const n of g.notes)if(!n.j&&Math.abs(n.t-g.t)<.02&&ok())I(n.lane?'R':'L','down')}
 if(g.k=='bike'){const s=G2.seg(g);if(g.rpm<(s[1]+s[2])/2-3&&g.t*60%6<1&&ok())I('P','down')}
 if(g.k=='row'){if(g.cool<=0&&(q>=1?g.cur>.95:Math.random()<.03))I('T','down')}
 if(g.k=='lift'){if(g.anim<=0&&g.rest<=0&&(q>=1?Math.abs(g.x-.5)<G2.zw(g)*.25:Math.random()<.02))I('S','down')}
 if(g.k=='bench'){if(!g.hold&&g.down<=0&&g.p<=0)I('H','down');else if(g.hold&&g.p>=(q>=1?.96:.6))I('H','up')}
 if(g.k=='box'){if(g.cue&&g.cue.t>.12)I(ok()?['J','D','C'][g.cue.k]:['D','C','J'][g.cue.k],'down')}
 if(g.k=='stretch'){if((g.ph=='wait'||g.ph=='out')&&g.r<(q>=1?.03:.3))I('B','down');else if(g.ph=='in'&&g.r>=(q>=1?.995:.7))I('B','up')}}};
const play=(k,d,q)=>E(([k,d,q])=>{N.energy=100;if(GYM.GM&&GYM.GM.res){document.querySelector('.gmRes .gmBack')&&document.querySelector('.gmRes .gmBack').click()}GYM.start(k,d);for(let i=0;i<4000&&!GYM.GM;i++)update();const g=GYM.GM;if(!g)return{err:'pas démarré',st:C.st};
 const frames=new Set();for(let i=0;i<20000&&!g.res;i++){__bot(q);update();if(i%3==0){spUpdate();frames.add(spName)}}
 const r=g.res;return{k,score:r.score,xp:r.xpGot,ups:r.ups,rec:r.newRec,first:r.firstRec,coins:r.coins,lines:r.lines,frames:[...frames],st:C.st,gk:C.gk,alpha:C.alpha,t:+g.t.toFixed(1)}},[k,d,q]);
const back=()=>E(()=>{const b=document.querySelector('.gmRes .gmBack');if(b)b.click();return{st:C.st,alpha:C.alpha}});

// ---- 1. intérieur : cinq zones identifiables, décor, sportifs ----
await E(()=>arrive('gym'));await p.waitForFunction(()=>place=='gym'&&C.st=='idle',null,{timeout:20000});await W(1500);await E(BOT);await shot('01_salle');
const inv=await E(()=>{const F=GYM.F,c=n=>F.filter(f=>f.n==n).length;const d=rx.getImageData(0,0,LW,LH).data;const col=new Set();for(let i=0;i<d.length;i+=4*31)col.add(d[i]>>4<<8|d[i+1]>>4<<4|d[i+2]>>4);
 return{cardio:[c('GTapis'),c('GVelo'),c('GRower')],muscu:[c('GRack'),c('GBench'),c('GCable'),c('GPlates')],boxe:[c('GSac'),c('GBoxRack')],etir:[c('GRoll'),c('GBall'),GYM.ST.filter(s=>s.k=='stretch').length],accueil:[c('GDesk'),c('GLock'),c('Fontaine'),c('GBar'),c('GBoard')],repos:c('GBancR'),
  npc:GYM.S.npc.length,actifs:GYM.S.npc.filter(n=>n.st=='act').length,couleurs:col.size,sol:PLACES.gym.fa,mur:PLACES.gym.wall,zone:LLSON.zone()}});
ok('1 nouvel intérieur : cardio, musculation, boxe, étirements, accueil et services, sportifs déjà à l’entraînement',inv.cardio.every(n=>n==2)&&inv.muscu.every(n=>n>=1)&&inv.boxe[0]==2&&inv.etir[2]==3&&inv.accueil.every(n=>n==1)&&inv.repos==1&&inv.npc==5&&inv.actifs>=3&&inv.couleurs>80,inv);
// ---- 2. collisions et déplacements libres ----
const col=await E(()=>{let solid=0,bad=0;for(const f of GYM.F.filter(f=>f.s))for(let i=1;i<4;i++)for(let j=1;j<4;j++){const u=f.x+f.w*i/4,v=f.y+f.h*j/4;if(u<1.15||v<1.2||u>RN-1.15||v>RN-1.2)continue;solid++;if(walkable(u,v))bad++}
 const unreach=[];for(const s of GYM.ST){if(!walkable(s.ap[0],s.ap[1])){unreach.push(s.id+':bloqué');continue}const P=findPath([1.5,DOORS[1]],s.ap),e=P[P.length-1];if(!e||Math.hypot(e[0]-s.ap[0],e[1]-s.ap[1])>.05)unreach.push(s.id)}
 let through=0,arrived=0;const X0=C.x,Y0=C.y;for(let k=0;k<30;k++){let tu,tv,g=0;do{tu=1.3+Math.random()*17.4;tv=1.3+Math.random()*17.4;g++}while(!walkable(tu,tv)&&g<80);C.st='idle';C.x=1.5*12;C.y=88+DOORS[1]*5;goto(tu*12,88+tv*5);
  for(let i=0;i<1400&&C.st=='walk';i++){update();const a=C.x/12,b2=(C.y-88)/5;if(GYM.F.some(f=>f.s&&a>f.x+.05&&a<f.x+f.w-.05&&b2>f.y+.05&&b2<f.y+f.h-.05))through++}if(C.st!='walk')arrived++}
 // les sportifs non plus ne traversent rien
 let npcIn=0;for(let i=0;i<3000;i++){update();for(const n of GYM.S.npc)if(n.path&&GYM.F.some(f=>f.s&&n.u>f.x+.05&&n.u<f.x+f.w-.05&&n.v>f.y+.05&&n.v<f.y+f.h-.05))npcIn++}
 C.st='idle';C.x=X0;C.y=Y0;return{solid,bad,unreach,through,arrived,npcIn}});
ok('2 collisions : aucune machine traversable (joueur et sportifs), tous les postes atteignables, déplacements libres',col.bad==0&&col.solid>80&&!col.unreach.length&&col.through==0&&col.arrived==30&&col.npcIn==0,col);
// ---- 3. interactions : toucher une machine ouvre son activité, toucher le sol ne déclenche rien à distance ----
const tap=await E(()=>{const res={};const at=(u,v,z)=>{const q=P3(u,v,z);return[q[0],q[1]]};GYM.UI.sel=null;GYM.UI.npc=null;
 // les sportifs font une pause loin des machines testées
 GYM.S.npc.forEach(n=>{if(n.s&&n.s.who===n)n.s.who=null;n.s=null;n.st='idle';n.t2=1e9;n.u=2.6;n.v=18.4;n.path=null});update();
 const t=GYM.F.find(f=>f.id=='run1'),q=at(t.x+t.w/2,t.y+t.h/2,20);placeTap(q[0],q[1],t.x+t.w/2,t.y+t.h/2);res.tapis=GYM.UI.sel;GYM.UI.sel=null;GYM.UI.npc=null;
 const s=GYM.F.find(f=>f.id=='sac0'),q2=at(s.x+.4,s.y+.4,66);placeTap(q2[0],q2[1],s.x+.4,s.y+.4);res.sac=GYM.UI.sel;GYM.UI.sel=null;GYM.UI.npc=null;
 const q3=at(10,13.5,0);placeTap(q3[0],q3[1],10,13.5);res.sol=GYM.UI.sel;res.marche=C.st;
 const bd=GYM.F.find(f=>f.n=='GBoard'),q4=at(bd.x+.2,bd.y+.8,30);placeTap(q4[0],q4[1],bd.x+.2,bd.y+.8);res.tableau=GYM.UI.tab;GYM.UI.tab='act';GYM.render();return res});
ok('3 interactions précises : tapis → course, sac → boxe, sol → simple déplacement, tableau → records',tap.tapis=='run'&&tap.sac=='box'&&tap.sol==null&&tap.marche=='walk'&&tap.tableau=='rec',tap);
await E(()=>{for(let i=0;i<600&&C.st=='walk';i++)update();GYM.S.npc.forEach(n=>{n.t2=10})});
// ---- 4. chaque machine est un vrai mini-jeu : score, difficulté, résultat, récompense ----
const games={};for(const k of ['run','bike','row','lift','bench','box','stretch']){games[k]=await play(k,1,1);await W(150);if(k=='box'||k=='run')await shot('04_res_'+k);await back()}
const XPK={run:'endu',bike:'endu',row:'endu',lift:'force',bench:'force',box:'force',stretch:'forme'};
ok('4 les 7 activités se jouent jusqu’au bout avec score, résultats, expérience et record',Object.keys(games).every(k=>{const g=games[k];return g&&!g.err&&g.score>0&&g.xp[XPK[k]]>0&&g.lines.length>=2&&(g.first.length||g.rec.length)&&g.coins>=1&&g.coins<=8}),Object.values(games).map(g=>[g.k,g.score,g.xp,g.coins,g.t]));
// jouer mal rapporte moins : le score dépend vraiment de l’adresse
const poor={};for(const k of ['run','lift','box']){poor[k]=await play(k,1,.35);await back()}
ok('4b le résultat dépend de l’adresse (jouer mal donne moins de points)',['run','lift','box'].every(k=>poor[k].score<games[k].score*.7),Object.keys(poor).map(k=>[k,poor[k].score,games[k].score]));
// ---- 5. animations du personnage : images du jeu (vêtements alignés), selon l’activité ----
const EXP={run:/^r[0-3]$/,bike:/^bk\d$/,row:/^dn[012]$/,lift:/^cu[0-3]$/,bench:/^dn[012]$/,box:/^cu3$/,stretch:/^(wave|idle)$/};
const anim=Object.keys(games).map(k=>[k,games[k].frames.filter(f=>f!='idle'||k=='stretch'),games[k].frames.filter(f=>!EXP[k].test(f)&&f!='idle')]);
const outfits=await E(()=>{const L0=JSON.parse(JSON.stringify(N.look)),res=[];const tenues=[['m',[['tank',1],['jog',0],['running',2]]],['f',[['crop',2],['legging',1],['running',0]]],['f',[['hoodie',3],['short',2],['basket',1]]],['m',[['pull',4],['jean',0],['basket',0]]]];
 const fr=['r0','r2','bk0','bk3','cu0','cu3','dn0','dn1','dn2','dn6','wave','idle'];for(const[g,it]of tenues){const L=JSON.parse(JSON.stringify(L0));L.g=g;it.forEach(([id,c])=>{try{wEquip(L,id,c)}catch(e){}});let okN=0,fail=[];for(const f of fr){if(drawFrame(f,L)){const d=pcx.getImageData(0,0,CW,CH).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;if(n>800)okN++;else fail.push(f)}else fail.push(f)}res.push({g,okN,fail})}spKey='';return res});
ok('5 animations : chaque activité utilise ses propres images (course, vélo, haltères, assis, garde, étirement), dessinées avec 4 tenues différentes',anim.every(([k,f,bad])=>f.length>=1&&!bad.length)&&anim.find(a=>a[0]=='run')[1].length>=3&&anim.find(a=>a[0]=='lift')[1].length>=3&&outfits.every(o=>o.okN==12),{anim,outfits});
// ---- 6. arrêter à tout moment : sans récompense, personnage libéré ----
const stop=await E(()=>{N.energy=100;const a0=N.sport.tot.acts;GYM.start('run',0);for(let i=0;i<4000&&!GYM.GM;i++)update();for(let i=0;i<300;i++)update();const mid={st:C.st,gk:C.gk};document.querySelector('.gmStop').click();return{mid,st:C.st,alpha:C.alpha,gm:!!GYM.GM,acts:N.sport.tot.acts-a0,who:GYM.ST.some(s=>s.who&&s.who.me)}});
ok('6 quitter une activité facilement : bouton Arrêter, aucune récompense, machine libérée',stop.mid.st=='gym'&&stop.st=='idle'&&stop.alpha==null&&!stop.gm&&stop.acts==0&&!stop.who,stop);
// ---- 7. profil physique : niveaux, jauges, expérience, statistiques ----
const prof=await E(()=>{const S=N.sport;GYM.render();const ui=[...document.querySelectorAll('.gmStat')].map(e=>e.textContent);return{st:S.st,tot:S.tot,need:[GYM.need(1),GYM.need(5)],ui,ups:JSON.stringify(S.st)}});
ok('7 profil : Force, Endurance, Forme avec niveau, jauge et expérience ; statistiques cumulées',['force','endu','forme'].every(k=>prof.st[k].lv>=1&&prof.st[k].xp>=0)&&prof.ui.length==3&&prof.ui.every(t=>/Niv\. \d+/.test(t)&&/XP|max/.test(t))&&prof.tot.acts==7+3&&prof.tot.reps>0&&prof.tot.dist>0&&prof.need[1]>prof.need[0],prof);
// ---- 8. objectifs quotidiens et hebdomadaires : progression, récompense, renouvellement ----
const obj=await E(()=>{const O=GYM.objCur(),d=O.d,w=O.w;const out={dl:d.list.length,wl:w.list.length,dlist:d.list,wlist:w.list,dc:d.c,ddone:Object.keys(d.done),wdone:Object.keys(w.done),wc:w.c};
 const c0=N.coins;N.sport.obj.d.id='2000-1-1';N.sport.obj.w.id='S2000-1-1';const O2=GYM.objCur();out.renew=O2.d.id!='2000-1-1'&&O2.w.id!='S2000-1-1'&&!Object.keys(O2.d.done).length;
 // progression puis récompense
 GYM.objAdd('d','acts',2);out.payd=N.coins-c0;out.dDone=!!O2.d.done.d_acts;return out});
ok('8 objectifs : 4 quotidiens et 5 hebdomadaires (dont 3 séances, plusieurs disciplines, niveau, séance complète), progression, pièces, renouvellement',obj.dl==4&&obj.wl==5&&['w_sess','w_disc','w_lv','w_full'].every(i=>obj.wlist.includes(i))&&obj.dlist[0]=='d_acts'&&obj.ddone.includes('d_acts')&&obj.wdone.includes('w_full')&&obj.wdone.includes('w_disc')&&obj.renew&&obj.payd==10&&obj.dDone,obj);
// ---- 9. records : battre un record compte pour les objectifs et s’affiche au tableau ----
const recBefore=await E(()=>N.sport.rec.run.dist);const better=await E(()=>{N.sport.rec.run.dist=10;N.sport.rec.run.score=10;return 1});const r2=await play('run',1,1);await back();
const tab=await E(()=>{GYM.UI.tab='rec';GYM.render();return[...document.querySelectorAll('.gmRec')].map(e=>e.textContent)});
ok('9 records personnels battus, comptés dans les objectifs et affichés au tableau des records',r2.rec.length==2&&tab.length>=12&&tab.some(t=>/Plus longue distance \(tapis\).*\d+ m/.test(t))&&(await E(()=>N.sport.obj.d.c.rec))>=1,{rec:r2.rec,tab:tab.slice(0,4)});
await E(()=>{GYM.UI.tab='act';GYM.render()});
// ---- 10. sportifs : discuter, conseil, défi qui devient plus difficile ----
await E(()=>{const n=GYM.S.npc.find(x=>x.d.nom=='Léa');GYM.talk(n.d,n)});await W(150);await shot('10_lea');
const talk=await E(()=>{const t0=document.querySelector('.gmSay').textContent;document.querySelector('button[data-a="t"]').click();const t1=document.querySelector('.gmSay').textContent;document.querySelector('button[data-a="c"]').click();const t2=document.querySelector('.gmSay').textContent;const d0=GYM.defiOf(GYM.NPCS[0]);document.querySelector('button[data-a="d"]').click();return{t0,t1,t2,pre:document.querySelector('.gmPre h3').textContent,goal:d0.goal,sel:GYM.UI.sel}});
const def=await E(()=>{N.energy=100;document.querySelector('.gmPre .gmGo').click();for(let i=0;i<4000&&!GYM.GM;i++)update();const g=GYM.GM;for(let i=0;i<20000&&!g.res;i++){__bot(1);update()}return{defi:g.res.defi,wins:N.sport.defis['Léa'],next:GYM.defiOf(GYM.NPCS[0]).goal}});await shot('10b_defi');await back();
ok('10 sportifs : discuter, demander un conseil, relever un défi (gagné, plus difficile ensuite)',talk.t1!=talk.t0&&/Conseil/.test(talk.t2)&&/Défi/.test(talk.pre)&&talk.sel=='run'&&def.defi&&def.defi.ok&&def.wins==1&&def.next!=talk.goal,{talk,def});
// ---- 11. récompenses : tenues, accessoires, trophées et décoration débloqués progressivement ----
const unl=await E(()=>{const S=N.sport;const before=S.unl.slice();S.st.force.lv=6;S.st.endu.lv=6;S.st.forme.lv=6;const got=GYM.checkUnl().map(u=>u.id);const own=N.wd2&&N.wd2.own||{};const home=N.furn.map(f=>f.n).concat(N.store||[]);
 return{before,got,own:['running','tank','jog','short','casq'].filter(i=>own[i]),deco:['Trophée de bronze','Tapis de yoga','Haltères déco'].filter(n=>home.includes(n)),locked:GYM.UNL.filter(u=>!S.unl.includes(u.id)).map(u=>u.id)}});
ok('11 récompenses : tenues de sport dans la garde-robe, trophées et objets de décoration livrés à la maison, le reste encore à débloquer',unl.own.length==5&&unl.deco.length==3&&unl.locked.length>=2,unl);
// ---- 12. équilibrage : jamais obligatoire, fatigue limitée, repos, pas de pénalité ----
const bal=await E(()=>{const r={};N.energy=8;GYM.UI.sel=null;GYM.start('run',1);for(let i=0;i<200;i++)update();r.blocked=!GYM.GM&&C.st!='gym';N.energy=30;GYM.start('rest',0);for(let i=0;i<4000&&C.st!='gym';i++)update();const e0=N.energy;for(let i=0;i<600&&C.st=='gym';i++)update();r.rest=+(N.energy-e0).toFixed(1);r.after=C.st;
 const S=N.sport,lv=JSON.stringify(S.st);S.last='2000-1-1';S.streak=9;r.noPenalty=JSON.stringify(S.st)==lv;N.energy=100;return r});
const g3=await play('stretch',0,1);await back();const streak=await E(()=>N.sport.streak);
ok('12 équilibrage : trop fatigué → pas de séance, le banc redonne de l’énergie, aucune perte en cas d’absence (la série repart à 1)',bal.blocked&&bal.rest>2&&bal.after=='idle'&&bal.noPenalty&&streak==1,{bal,streak});
// ---- 13. bar à smoothies et fontaine ----
const bar=await E(()=>{N.energy=40;const c0=N.coins;GYM.tapFurn(GYM.F.find(f=>f.n=='GBar'));const b=document.querySelector('.gmPre .gmTile');b.click();return{dc:c0-N.coins,e:N.energy}});
ok('13 bar à smoothies : achat en pièces, énergie récupérée',bar.dc==4&&bar.e>45,bar);
// ---- 14. interface adaptée au téléphone (portrait / paysage / ordinateur) ----
await E(()=>{GYM.render();N.energy=100;GYM.start('box',1)});await E(()=>{for(let i=0;i<4000&&!GYM.GM;i++)update();for(let i=0;i<200;i++)update()});await W(300);await shot('14_jeu_boxe');
const lay=await E(()=>{const vw=innerWidth,vh=innerHeight,cv=document.getElementById('gmCv').getBoundingClientRect(),bt=[...document.querySelectorAll('.gmCtl button')].map(e=>e.getBoundingClientRect()),st=document.querySelector('.gmStop').getBoundingClientRect();
 return{vw,vh,cv:[cv.left,cv.top,cv.width,cv.height].map(Math.round),bt:bt.map(r=>[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]),st:[Math.round(st.top),Math.round(st.height)]}});
await E(()=>document.querySelector('.gmStop').click());
const inView=r=>r[0]>=0&&r[1]>=0&&r[0]+r[2]<=lay.vw+1&&r[1]+r[3]<=lay.vh+1;
ok('14 mini-jeu entièrement visible et jouable au doigt ('+MODE+') : zone de jeu, 3 grands boutons, Arrêter',lay.cv[2]>=200&&lay.cv[3]>=110&&inView(lay.cv)&&lay.bt.length==3&&lay.bt.every(r=>inView(r)&&r[3]>=44&&r[2]>=60)&&lay.st[1]>=30,lay);
// vraie saisie tactile sur un bouton (pas seulement l’API)
const touch=await E(()=>{N.energy=100;GYM.start('lift',0);for(let i=0;i<4000&&!GYM.GM;i++)update();GYM.GM.count=0;return 1});await W(200);
const btn=await p.$('.gmCtl button');const bb=await btn.boundingBox();for(let i=0;i<40;i++){const near=await E(()=>{const g=GYM.GM;return g&&Math.abs(g.x-.5)<GYM.GAMES.lift.zw(g)*.6&&g.anim<=0});if(near){if(MODE=='pc')await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);else await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);break}await W(16)}
await W(100);const tch=await E(()=>{const g=GYM.GM;const r={reps:g.reps,miss:g.miss};document.querySelector('.gmStop').click();return r});
ok('14b le bouton réagit au toucher réel',tch.reps+tch.miss>=1,tch);
// ---- 15. sauvegarde : tout est conservé après rechargement ----
const snap=await E(()=>{save();return JSON.stringify({st:N.sport.st,rec:N.sport.rec,unl:N.sport.unl,tot:N.sport.tot,defis:N.sport.defis,obj:N.sport.obj})});
await boot();const snap2=await E(()=>N.sport?JSON.stringify({st:N.sport.st,rec:N.sport.rec,unl:N.sport.unl,tot:N.sport.tot,defis:N.sport.defis,obj:N.sport.obj}):null);
const keys=await E(()=>Object.keys(localStorage).filter(k=>/sport/i.test(k)));
ok('15 sauvegarde : caractéristiques, records, objectifs, défis et récompenses identiques après rechargement (sauvegarde du jeu, pas de seconde sauvegarde)',snap2==snap&&keys.length==0,{same:snap2==snap,keys});
// ---- 16. sortir de la salle en pleine activité : retour normal, personnage visible ----
await E(()=>{arrive('gym')});await p.waitForFunction(()=>place=='gym'&&C.st=='idle',null,{timeout:20000});await E(BOT);
await E(()=>{N.energy=100;GYM.start('bench',1);for(let i=0;i<4000&&!GYM.GM;i++)update();for(let i=0;i<200;i++)update()});const mid=await E(()=>({st:C.st,alpha:C.alpha}));
await E(()=>{const b=document.getElementById('gymHome');b.click()});await p.waitForFunction(()=>place!='gym'||C.st=='door',null,{timeout:30000}).catch(()=>{});await W(300);const out=await E(()=>({place,st:C.st,alpha:C.alpha,gm:!!GYM.GM}));
ok('16 « Partir » en plein exercice : la séance s’arrête, le personnage redevient visible et sort',mid.st=='gym'&&mid.alpha===0&&out.alpha==null&&!out.gm,{mid,out});
// ---- 17. aucune erreur ----
ok('17 aucune erreur JavaScript',!errs.length,errs.slice(0,5));
const res={mode:MODE,ok:R.filter(r=>r.ok).length,total:R.length,R};fs.writeFileSync(`${O}/gym_${MODE}.json`,JSON.stringify(res,null,1));console.log(`\n${res.ok}/${res.total} tests réussis (${MODE})`);await b.close();process.exit(res.ok==res.total?0:1)})();
