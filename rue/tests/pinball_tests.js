// Tests réels du mini-jeu Pinball dans la borne (Playwright + Chrome). Usage : node rue/tests/pinball_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await boot(p);
await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(500);
// ouverture depuis la case PINBALL
await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='pinball')});await p.keyboard.press('Enter');await W(150);await p.keyboard.press('Enter');await W(500);
const st0=await E(()=>({st:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.pinball._state.phase}));await E(()=>{ARC.modules.pinball._state.mute=true});await p.screenshot({path:`${O}/pb_01_intro.png`});
// toucher un point de l'écran de la borne, avec un identifiant de doigt
const touch=(t,sx,sy,id)=>E(([t,sx,sy,id])=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=AX.L.scr;AX.cv.dispatchEvent(new PointerEvent(t,{pointerType:'touch',isPrimary:id==1,pointerId:id,clientX:r.left+(S.x+sx)*k,clientY:r.top+(S.y+sy)*k,bubbles:true}))},[t,sx,sy,id]);
const Lay=()=>E(()=>{const L=ARC.modules.pinball._state.L;return{bl:L.bl,br:L.br,pl:L.pl,start:ARC.modules.pinball._state.startBtn}});
let L=await Lay();await touch('pointerdown',L.start.x+5,L.start.y+5,1);await touch('pointerup',L.start.x+5,L.start.y+5,1);await W(150);
const st1=await E(()=>{const P=ARC.modules.pinball._state;return{ph:P.phase,balls:P.balls,ball:P.ball.st,score:P.score}});
ok('0 lancement depuis la case PINBALL, écran de présentation, START',st0.st=='game'&&st0.cur=='pinball'&&st0.ph=='intro'&&st1.ph=='jeu'&&st1.balls==3&&st1.ball=='plunger'&&st1.score==0,{st0,st1});
// 1. lancement : appui sur LANCER (doigt), puis Espace pour la boule suivante
L=await Lay();await touch('pointerdown',L.pl.x+L.pl.w/2,L.pl.y+L.pl.h/2,2);await W(300);const ch=await E(()=>ARC.modules.pinball._state.pl);await touch('pointerup',L.pl.x+L.pl.w/2,L.pl.y+L.pl.h/2,2);await W(60);
const l1=await E(()=>{const b=ARC.modules.pinball._state.ball;return{st:b.st,vy:b.vy,y:b.y}});await W(700);const l2=await E(()=>{const b=ARC.modules.pinball._state.ball;return{st:b.st,y:Math.round(b.y),x:Math.round(b.x)}});
const kb=await E(async()=>{const M=ARC.modules.pinball,P=M._state;P.ball={x:184,y:390,vx:0,vy:0,st:'plunger',rd:0};P.pl=0;P.charging=false;return 1});await p.keyboard.down('Space');await W(150);await p.keyboard.up('Space');await W(60);
const l3=await E(()=>{const b=ARC.modules.pinball._state.ball;return{st:b.st,vy:Math.round(b.vy)}});
ok('1 lancement de la boule (bouton LANCER au doigt, barre Espace), distinct des palettes',ch>0&&l1.st=='play'&&l1.vy<-600&&l2.y<130&&l3.st=='play'&&l3.vy<-600,{ch,l1,l2,l3});
// 2-6. palettes : gauche, droite, simultanées, maintien, relâchement (boutons ronds, plusieurs doigts)
const ang=()=>E(()=>{const P=ARC.modules.pinball._state,F=ARC.modules.pinball._flip;return P.fl.map((f,i)=>Math.abs(f.a-F[i].up)<.01?'haut':Math.abs(f.a-F[i].rest)<.01?'repos':'mouvement')});
L=await Lay();const a0=await ang();
await touch('pointerdown',L.bl.x,L.bl.y,3);await W(90);const g1=await ang();await W(900);const g2=await ang();await touch('pointerup',L.bl.x,L.bl.y,3);await W(90);const g3=await ang();
await touch('pointerdown',L.br.x,L.br.y,4);await W(90);const d1=await ang();await touch('pointerup',L.br.x,L.br.y,4);await W(90);const d2=await ang();
await touch('pointerdown',L.bl.x,L.bl.y,5);await touch('pointerdown',L.br.x,L.br.y,6);await W(90);const s1=await ang();await touch('pointerup',L.bl.x,L.bl.y,5);await W(90);const s2=await ang();await touch('pointerup',L.br.x,L.br.y,6);await W(90);const s3=await ang();
ok('2 palette gauche (bouton rond gauche)',a0[0]=='repos'&&g1[0]=='haut'&&g1[1]=='repos',{a0,g1});
ok('3 palette droite (bouton rond droit)',d1[1]=='haut'&&d1[0]=='repos',{d1});
ok('4 les deux palettes en même temps (deux doigts)',s1[0]=='haut'&&s1[1]=='haut'&&s2[0]=='repos'&&s2[1]=='haut',{s1,s2});
ok('5 maintien : la palette reste levée tant que le doigt reste appuyé',g2[0]=='haut',{g2});
ok('6 relâchement : retour immédiat au repos',g3[0]=='repos'&&d2[1]=='repos'&&s3[0]=='repos'&&s3[1]=='repos',{g3,d2,s3});
// clavier et commandes de la borne
await p.keyboard.down('ArrowLeft');await p.keyboard.down('ArrowRight');await W(90);const k1=await ang();await p.keyboard.up('ArrowLeft');await W(90);const k2=await ang();await p.keyboard.up('ArrowRight');await W(90);
const cab=await E(async()=>{ARC.input.left=1;await new Promise(z=>setTimeout(z,90));const P=ARC.modules.pinball._state,a=P.ctrl.l;ARC.input.left=0;await new Promise(z=>setTimeout(z,60));return{a,b:P.ctrl.l}});
// un seul appui = un seul déclenchement (pas de doublon)
const once=await E(async()=>{const P=ARC.modules.pinball._state;let n=0,prev=false;const t0=performance.now();const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=AX.L.scr,L=P.L;
 AX.cv.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',pointerId:11,clientX:r.left+(S.x+L.bl.x)*k,clientY:r.top+(S.y+L.bl.y)*k,bubbles:true}));
 while(performance.now()-t0<400){await new Promise(z=>requestAnimationFrame(z));const on=P.fl[0].on;if(on&&!prev)n++;prev=on}
 AX.cv.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch',pointerId:11,clientX:r.left+(S.x+L.bl.x)*k,clientY:r.top+(S.y+L.bl.y)*k,bubbles:true}));return{n,touches:P.touches.size}});
ok('6b clavier (flèches), joystick de la borne, et un seul déclenchement par appui',k1[0]=='haut'&&k1[1]=='haut'&&k2[0]=='repos'&&k2[1]=='haut'&&cab.a&&!cab.b&&once.n==1&&once.touches==0,{k1,k2,cab,once});
// la palette frappe la boule
const hit=await E(()=>{const M=ARC.modules.pinball,P=M._state,F=ARC.modules.pinball._flip[0];P.phase='jeu';P.ball={x:F.px+22,y:F.py+Math.sin(F.rest)*22-9,vx:0,vy:0,st:'play'};P.fl[0].a=F.rest;
 for(let i=0;i<20;i++)M.update(1/60,{okN:P.okN});const rest={y:P.ball.y};for(let i=0;i<6;i++)M.update(1/60,{okN:P.okN,left:1});return{rest,vy:P.ball.vy,vx:P.ball.vx}});
ok('6c la palette frappe la boule',hit.vy<-300,hit);
// 7-8. collisions : aucun obstacle n'est traversé, la boule ne sort jamais ; rebonds des bumpers
const col=await E(()=>{const M=ARC.modules.pinball,P=M._state,TB=M._table,res={segs:0,segFail:[],circ:0,circFail:[],fuzzOut:0,throws:0};P.mute=true;
 const run=(n)=>{for(let i=0;i<n;i++)M.update(1/60,{okN:P.okN})};
 for(const s of TB.S){if(s.type=='gate'||s.type=='rampwall')continue;const mx=(s.a[0]+s.b[0])/2,my=(s.a[1]+s.b[1])/2,ex=s.b[0]-s.a[0],ey=s.b[1]-s.a[1],l=Math.hypot(ex,ey),nx=-ey/l,ny=ex/l;
  for(const sg of[1,-1]){const sx=mx+nx*sg*14,sy=my+ny*sg*14;if(sx<9||sx>191||sy<14||sy>398)continue;P.phase='jeu';P.lit.drop=[0,0,0];P.ball={x:sx,y:sy,vx:-nx*sg*850,vy:-ny*sg*850,st:'play'};
   M.update(1/60,{okN:P.okN});M.update(1/60,{okN:P.okN});res.segs++;const side=(P.ball.x-s.a[0])*nx+(P.ball.y-s.a[1])*ny;
   // la boule doit être restée du même côté du mur (ou partie le long de son extrémité)
   const t=((P.ball.x-s.a[0])*ex+(P.ball.y-s.a[1])*ey)/(l*l);if(t>0&&t<1&&Math.sign(side)!==sg&&P.ball.st=='play')res.segFail.push([s.type,s.a,s.b,sg])}}
 for(const c of TB.C){for(let k=0;k<8;k++){const an=k/8*Math.PI*2,sx=c.x+Math.cos(an)*(c.r+14),sy=c.y+Math.sin(an)*(c.r+14);if(sx<9||sx>191||sy<14)continue;P.phase='jeu';P.ball={x:sx,y:sy,vx:-Math.cos(an)*850,vy:-Math.sin(an)*850,st:'play'};
  M.update(1/60,{okN:P.okN});res.circ++;if(Math.hypot(P.ball.x-c.x,P.ball.y-c.y)<c.r+5.5-.6)res.circFail.push([c.type,c.x,c.y])}}
 // 1500 lancers aléatoires sur toute la table
 for(let k=0;k<1500;k++){P.phase='jeu';P.balls=3;P.ball={x:20+Math.random()*150,y:60+Math.random()*280,vx:(Math.random()-.5)*1600,vy:(Math.random()-.5)*1600,st:'play'};res.throws++;
  for(let i=0;i<90;i++){M.update(1/60,{okN:P.okN,left:i%20<5?1:0,right:i%17<4?1:0});const b=P.ball;if(P.phase!='jeu'||!b)break;if(b.st=='play'&&(b.x<8+5.5-1||b.x>192-5.5+1||(b.y<100&&Math.hypot(b.x-100,b.y-100)>92-5.5+1)))res.fuzzOut++}}
 P.phase='jeu';P.balls=3;return res});
const bump=await E(()=>{const M=ARC.modules.pinball,P=M._state,TB=M._table,bm=TB.C.find(c=>c.type=='bumper');P.phase='jeu';P.mult=1;const s0=P.score;P.ball={x:bm.x,y:bm.y-bm.r-12,vx:0,vy:60,st:'play'};
 for(let i=0;i<8;i++)M.update(1/60,{okN:P.okN});return{gain:P.score-s0,v:Math.hypot(P.ball.vx,P.ball.vy),flash:P.flash.bump[bm.id]>0||P.lit.bump[bm.id]==1}});
ok('7 collisions avec tous les obstacles (murs, rails, lance-boules, cibles, poteaux, bumpers) : jamais traversés, 1500 lancers sans sortie',col.segFail.length==0&&col.circFail.length==0&&col.fuzzOut==0&&col.segs>40&&col.circ>50,col);
ok('8 rebond dynamique sur les bumpers (+100 points, éclairage)',bump.gain>=100&&bump.v>200&&bump.flash,bump);
// 9. points : cibles, banques, passages, rampe, enchaînement, multiplicateur
const pts=await E(()=>{const M=ARC.modules.pinball,P=M._state,TB=M._table,r={};const run=n=>{for(let i=0;i<n;i++)M.update(1/60,{okN:P.okN})};
 P.phase='jeu';P.score=0;P.mult=1;P.lit={stand:[0,0,0],drop:[0,0,0],lane:[0,0,0],bump:[0,0,0]};
 const shootAt=(s,dir=1)=>{const mx=(s.a[0]+s.b[0])/2,my=(s.a[1]+s.b[1])/2;P.ball={x:mx+16*dir,y:my,vx:-500*dir,vy:0,st:'play'};run(3)};
 const st=TB.S.filter(s=>s.type=='stand');let s0=P.score;shootAt(st[0]);r.stand=P.score-s0;shootAt(st[1]);shootAt(st[2]);r.multApresCibles=P.mult;
 const dr=TB.S.filter(s=>s.type=='drop');s0=P.score;shootAt(dr[0],-1);r.drop=P.score-s0;r.tombee=P.lit.drop[0];shootAt(dr[1],-1);shootAt(dr[2],-1);r.multApresBanque=P.mult;
 s0=P.score;P.ball={x:81,y:60,vx:0,vy:-200,st:'play'};run(6);r.passage=P.score-s0;r.lane=P.lit.lane[0];
 s0=P.score;P.ball={x:25,y:160,vx:0,vy:-450,st:'play'};run(2);r.rampe=P.ball.st;run(120);r.rampePts=P.score-s0;r.sortieRampe=[Math.round(P.ball.x),Math.round(P.ball.y)];
 const m=P.mult;s0=P.score;const bm=TB.C.find(c=>c.type=='bumper');P.ball={x:bm.x,y:bm.y-bm.r-10,vx:0,vy:60,st:'play'};run(8);r.bumperAvecMult=P.score-s0;r.mult=m;return r});
ok('9 calcul des points (cibles 250, banque complète → multiplicateur, passages, rampe 500, multiplicateur appliqué)',pts.stand==250&&pts.multApresCibles==2&&pts.drop==600&&pts.tombee==1&&pts.multApresBanque==3&&pts.passage>=150*3&&pts.rampe=='ramp'&&pts.rampePts>=500*3&&pts.bumperAvecMult>=100*pts.mult,pts);
await p.screenshot({path:`${O}/pb_09_jeu.png`});
// 10. perte des trois boules -> GAME OVER, score final, meilleur score conservé
const lost=await E(async()=>{const M=ARC.modules.pinball,P=M._state;P.phase='jeu';P.balls=3;P.score=12345;const seq=[];
 for(let k=0;k<3;k++){P.ball={x:92,y:395,vx:0,vy:300,st:'play'};for(let i=0;i<10;i++)M.update(1/60,{okN:P.okN});seq.push([P.phase,P.balls]);for(let i=0;i<110;i++)M.update(1/60,{okN:P.okN});seq.push([P.phase,P.ball&&P.ball.st])}
 await new Promise(z=>setTimeout(z,1000));return{seq,ph:P.phase,best:ARC.data('pinball').best,rec:P.over&&P.over.rec}});
await p.screenshot({path:`${O}/pb_10_gameover.png`});
ok('10 perte des trois boules : décompte, nouvelle boule automatique, GAME OVER, meilleur score',lost.seq[0][0]=='perdue'&&lost.seq[0][1]==2&&lost.seq[1][1]=='plunger'&&lost.seq[3][1]=='plunger'&&lost.ph=='over'&&lost.best>=12345&&lost.rec,lost);
// 11. redémarrage (REJOUER) et retour arcade, sans blocage
const ob=await E(()=>ARC.modules.pinball._state.overBtns);await touch('pointerdown',ob[0].x+4,ob[0].y+4,20);await touch('pointerup',ob[0].x+4,ob[0].y+4,20);await W(100);
const re=await E(()=>{const P=ARC.modules.pinball._state;return{ph:P.phase,score:P.score,balls:P.balls,ball:P.ball.st}});
await E(()=>{const M=ARC.modules.pinball,P=M._state;P.balls=1;P.ball={x:92,y:395,vx:0,vy:300,st:'play'};for(let i=0;i<130;i++)M.update(1/60,{okN:P.okN})});await W(1000);
await p.keyboard.press('ArrowRight');await W(80);await p.keyboard.press('Enter');await W(150);const back=await E(()=>({st:ARC.state,cur:ARC.cur}));
ok('11 redémarrage immédiat (REJOUER) et RETOUR ARCADE vers le menu des 14 jeux',re.ph=='jeu'&&re.score==0&&re.balls==3&&re.ball=='plunger'&&back.st=='menu'&&back.cur==null,{re,back});
// pas de conflit : Air Hockey fonctionne toujours après le flipper, et inversement
const conf=await E(async()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='hockey');arcOk();arcOk();await new Promise(z=>setTimeout(z,200));const h=ARC.cur&&ARC.cur.id;arcBack();ARC.sel=ARC.games.findIndex(g=>g.id=='pinball');arcOk();arcOk();await new Promise(z=>setTimeout(z,200));const pb=ARC.modules.pinball._state.phase;arcBack();return{h,pb,st:ARC.state,touches:ARC.modules.pinball._state.touches.size}});
ok('11b aucun conflit avec Air Hockey ; nettoyage à la fermeture',conf.h=='hockey'&&conf.pb=='intro'&&conf.st=='menu'&&conf.touches==0,conf);
ok('12a aucune erreur JavaScript',errs.length==0,errs);await ctx.close();
// 12. sur l'écran de la borne, toutes tailles : plein écran, boutons ronds bien visibles de chaque côté de la table
const sizes=[];for(const [nom,vp,dpr] of [['petit téléphone',{width:320,height:568},2],['téléphone',{width:390,height:844},3],['grand téléphone',{width:430,height:932},3],['tablette',{width:820,height:1180},2],['portable',{width:1366,height:768},1],['ordinateur',{width:1280,height:800},1],['grand écran',{width:1920,height:1080},1]]){
 const c=await b.newContext({viewport:vp,deviceScaleFactor:dpr});const q=await c.newPage();const er=[];q.on('pageerror',e=>er.push(e.message));await boot(q);
 await q.evaluate(()=>{streetEnter();GAMES.arcade.open({x:500});ARC.sel=ARC.games.findIndex(g=>g.id=='pinball');arcOk();arcOk();const M=ARC.modules.pinball;M._state.mute=true;M.update(1/60,{okN:(M._state.okN||0)+1})});await q.waitForTimeout(700);
 const m=await q.evaluate(()=>{const S=AX.L.scr,g=AX.gameCv,d=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let tr=0;for(let i=3;i<d.length;i+=4)if(d[i]<255)tr++;const P=ARC.modules.pinball._state,L=P.L,k=AX.cv.getBoundingClientRect().width/AX.L.W;
  const inS=(x,y,r)=>x-r>=0&&x+r<=S.w&&y-r>=0&&y+r<=S.h,sideL=L.bl.x+L.bl.r<=L.tx+1,sideR=L.br.x-L.br.r>=L.tx+L.tw-1;
  return{tr,cssDiam:Math.round(L.bl.r*2*k),same:L.bl.r==L.br.r,inside:inS(L.bl.x,L.bl.y,L.bl.r)&&inS(L.br.x,L.br.y,L.br.r)&&L.bl.y+L.bl.r+15<=S.h&&L.pl.y>=0&&L.pl.x+L.pl.w<=S.w,sides:sideL&&sideR,table:L.tx>=0&&L.tx+L.tw<=S.w+.5&&L.ty>=0&&L.ty+L.th<=S.h+.5,fill:+(L.tw*L.th/(S.w*S.h)*100).toFixed(0),ball:+(5.5*L.k*k*2).toFixed(1)}});
 await q.screenshot({path:`${O}/pb_taille_${vp.width}x${vp.height}.png`});sizes.push({nom,...m,er:er.length});await c.close()}
ok('12 sur l’écran de la borne (7 tailles) : plein écran, table entière, deux gros boutons ronds identiques de chaque côté',sizes.every(s=>s.tr==0&&s.same&&s.inside&&s.sides&&s.table&&s.cssDiam>=44&&s.er==0),sizes);
fs.writeFileSync(`${O}/pb_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
