// Tests réels de BUBBLE POP dans la borne d'arcade (Playwright + Chrome mobile tactile ; vrais touchers via CDP).
// Usage : node rue/tests/bubble_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__fx=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);return f(n,...a)};clearInterval(iv)}},5)});
 await p.goto(JEU);await p.waitForTimeout(1500);const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{document.getElementById('intro')&&document.getElementById('intro').remove();tscr.hidden=true;document.getElementById('crOk2').click()});await W(400);
 const cdp=await ctx.newCDPSession(p);
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const tapG=async(gx,gy)=>{const c=await scr(gx,gy);await p.touchscreen.tap(c.x,c.y);await W(120)};
 const btn=async id=>{const bb=await E(id=>{const B=ARC.modules.bubble._s.btns.find(b=>b.id==id);return B&&{x:B.x+B.w/2,y:B.y+B.h/2}},id);if(!bb)return false;await tapG(bb.x,bb.y);return true};
 const S=()=>E(()=>{const s=ARC.modules.bubble._s;return{ph:s.phase,lvl:s.lvl,score:s.score,shots:s.shots,n:ARC.modules.bubble._count(),cur:s.cur,next:s.next,paused:s.paused,mute:s.mute,aim:s.aim,shot:!!s.shot}});
 // tir au doigt : poser le doigt sur un point de l'écran (unités de grille), glisser, lâcher
 const shoot=async(gxU,gyU,hold)=>{const c=await E(([a,bq])=>{const L=ARC.modules.bubble._s.L;return{x:L.ox+a*L.k,y:L.oy+bq*L.k}},[gxU,gyU]);const s=await scr(c.x,c.y);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:s.x,y:s.y+40,id:7}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:s.x,y:s.y,id:7}]});await W(hold||80);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const waitLand=async()=>{for(let i=0;i<120;i++){await W(50);if(!(await S()).shot)return}};
 // contrôle continu : jamais deux bulles à moins de 2 rayons, jamais de tir à l'intérieur d'une bulle
 await E(()=>{window.__bv={ov:0,tr:0,n:0};setInterval(()=>{const M=ARC.modules.bubble;if(!M||!ARC.cur||ARC.cur.id!='bubble')return;const s=M._s;__bv.n++;const pts=[];
  for(let r=0;r<s.g.length;r++)for(let c=0;c<s.g[r].length;c++)if(s.g[r][c])pts.push([M._cx(r,c),M._cy(r)]);for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)if(Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1])<2-1e-6)__bv.ov++;
  if(s.shot)for(const q of pts)if(Math.hypot(s.shot.x-q[0],s.shot.y-q[1])<2-1e-6)__bv.tr++},8)});
 // ---- 1. borne : vignette, fiche, JOUER → plein écran ----
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(600);
 const cat=await E(()=>({i:ARC.games.findIndex(g=>g.id=='bubble'),n:ARC.games.filter(g=>g.id=='bubble').length,art:typeof ARC_ART!='undefined'&&!!ARC_ART.bubble,mod:!!ARC.modules.bubble}));
 const cell=await E(i=>{const c=AX.L.grid.cells[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(c.x+c.w/2)*k,y:r.top+(c.y+c.h/2)*k}},cat.i);await p.touchscreen.tap(cell.x,cell.y);await W(250);await p.touchscreen.tap(cell.x,cell.y);await W(400);
 await p.screenshot({path:`${O}/bp_00_fiche.png`});const jb=await E(()=>{const o=arcInfoLayout(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(o.bx+o.bw/2)*k,y:r.top+(o.by+o.bh/2)*k}});await p.touchscreen.tap(jb.x,jb.y);await W(700);
 const fsx=await E(()=>{const r=AX.cv.getBoundingClientRect(),G=arcGS();return{st:ARC.state,cur:ARC.cur&&ARC.cur.id,cv:[r.left,r.top,r.right,r.bottom].map(Math.round),W:innerWidth,H:innerHeight,full:G.w==AX.L.W&&G.h==AX.L.H,ph:ARC.modules.bubble._s.phase}});
 await p.screenshot({path:`${O}/bp_01_titre.png`});
 ok('1 Bubble Pop dans la liste de la borne (une fois, avec sa vignette), fiche, JOUER → plein écran',cat.n==1&&cat.art&&cat.mod&&fsx.st=='game'&&fsx.cur=='bubble'&&fsx.full&&fsx.cv[0]<=0&&fsx.cv[1]<=0&&fsx.cv[2]>=fsx.W&&fsx.cv[3]>=fsx.H&&fsx.ph=='title',{cat,fsx});
 // ---- 2. choix du niveau et JOUER ----
 await btn('play');await W(300);const s2=await S();await p.screenshot({path:`${O}/bp_02_intro.png`});await W(1800);const s2b=await S();
 ok('2 JOUER → carte du niveau 1 (objectif), puis partie',s2.ph=='intro'&&s2.lvl==0&&s2b.ph=='play'&&s2b.n==43,{s2,s2b});
 // ---- 3. visée au doigt : la direction suit le doigt, toutes les directions autorisées, jamais vers le bas ----
 const aims=[],dbg=[];for(const[x,y]of[[2,8],[9,2],[16,8],[0,23],[18,23],[6,25.6]]){const c=await E(([a,bq])=>{const L=ARC.modules.bubble._s.L;return{x:L.ox+a*L.k,y:L.oy+bq*L.k}},[x,y]);const s=await scr(c.x,c.y);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:s.x,y:s.y,id:9}]});await W(60);aims.push(+(await S()).aim.toFixed(3));if(aims.length==1)await p.screenshot({path:`${O}/bp_03_visee.png`});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await waitLand();await W(80);dbg.push(await S())}
const lim=Math.PI-.2;const s3=await S();
 ok('3 visée : gauche, haut, droite suivent le doigt ; vers le bas la visée reste bloquée au-dessus de l’horizontale ; chaque lâcher tire',aims[0]<-1.8&&Math.abs(aims[1]+Math.PI/2)<.05&&aims[2]>-1.4&&aims.every(a=>a<=-.2+1e-3&&a>=-lim-1e-3)&&s3.shots==6,{aims,tirs:s3.shots,dbg:dbg.map(d=>[d.shots,d.ph,d.n,d.shot])});
 // ---- 4. tir réel : la case prévue par la trajectoire est exactement celle où la bulle s'accroche ----
 await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(0);s.phase='play'});await W(100);
 await shoot(9,4,80);const fired=await S();await W(60);await p.screenshot({path:`${O}/bp_04_tir.png`});await waitLand();await W(200);
 const land=await E(()=>{const s=ARC.modules.bubble._s;return{shots:s.shots,fx:window.__fx.slice(-8)}});
 ok('4 lâcher le doigt tire : bulle en vol, sons de tir et d’accroche, bulle suivante chargée',fired.shot&&land.shots==1&&land.fx.includes('bpShoot')&&land.fx.includes('bpStick')&&fired.cur==fired.cur,{fired:fired.shot,land});
 // trajectoire = réalité : on tire contre le mur gauche, la bulle doit atterrir dans la case annoncée
 const exact=await E(()=>{const M=ARC.modules.bubble,s=M._s;let okN=0,tot=0,bounced=0,skip=0;for(let i=0;i<60;i++){M._load(i%12);s.phase='play';s.offA=s.off;const present=M._colors(),abs=[0,1,2,3,4,5].find(c=>!present.includes(c));if(abs==null){skip++;continue}
   const a=-Math.PI+.2+Math.random()*(Math.PI-.4);s.aim=a;const P=M._predict(a);if(!P.cell)continue;if(P.pts.length>2)bounced++;const g0=s.g.map(r=>r.slice());
   s.cur=abs;M._fire();for(let k=0;k<400&&s.shot;k++)M._update(1/60,{});let found=null;for(let r=0;r<s.g.length;r++)for(let c=0;c<s.g[r].length;c++)if(s.g[r][c]&&!(g0[r]&&g0[r][c]))found=[r,c];
   tot++;if(found&&found[0]==P.cell[0]&&found[1]==P.cell[1])okN++}return{okN,tot,bounced,skip}});
 ok('5 trajectoire de visée = trajectoire réelle : la bulle s’accroche dans la case annoncée (40 tirs aléatoires, avec rebonds sur les murs)',exact.okN==exact.tot&&exact.tot>=30&&exact.bounced>5,exact);
 // ---- 6. groupes et chutes : 3 de même couleur éclatent, 2 non ; ce qui ne tient plus au plafond tombe ----
 const gr=await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(0);s.phase='play';const mk=(ci)=>({ci,t:1});
  s.g=[[mk(0),mk(0),null,mk(1),mk(1),mk(1),mk(1),mk(1),mk(1)],[null,null,null,mk(2),null,null,null,null],[null,null,null,mk(2),mk(3),null,null,null,null]];
  s.g=[[mk(0),null,null,null,null,null,null,null,null]];const two=M._place(0,1,0,false,M._cx(0,1),M._cy(0));const n2=M._count();// 2 rouges seulement : rien n'éclate
  s.g=[[mk(0),mk(0),null,mk(1),mk(1),mk(1),mk(1),mk(1),mk(1)],[null,null,mk(1),null,null,null,null,null],[null,null,null,mk(2),mk(3),null,null,null,null]];
  // rangée 1 col 2 (bleu) relie (0,3)… ; on éclate les rouges en posant un 3e rouge
  const three=M._place(0,2,0,false,M._cx(0,2),M._cy(0));
  // chute : une grappe accrochée par une seule bulle
  s.g=[[mk(0),mk(0),null,null,null,null,null,null,null],[mk(2),null,null,null,null,null,null,null],[mk(4),mk(4),null,null,null,null,null,null,null]];
  const drop=M._place(0,2,0,false,M._cx(0,2),M._cy(0));return{two,n2,three,drop,left:M._count()}});
 ok('6 groupes : 2 bulles ne s’éclatent pas, 3 oui ; les bulles détachées du plafond tombent (bonus de chute)',gr.two.popped==0&&gr.n2==2&&gr.three.popped==3&&gr.drop.popped==3&&gr.drop.fell==3&&gr.left==0,gr);
 // ---- 7. score : bonus gros groupe, chute, combo, effets ----
 const sc=await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(0);s.phase='play';s.score=0;s.lscore=0;s.combo=1;const mk=(ci)=>({ci,t:1});
  s.g=[[mk(0),mk(0),mk(0),mk(0),mk(0),null,mk(1),mk(1),mk(1)],[null,null,null,mk(2),null,null,null,null],[null,null,mk(2),mk(2),null,null,null,null,null]];
  s.aim=-Math.atan2(M._C.LY-M._cy(0),M._cx(0,5)-M._C.LX);s.aim=Math.atan2(M._cy(0)-M._C.LY,M._cx(0,5)-M._C.LX);s.cur=0;M._fire();for(let k=0;k<300&&s.shot;k++)M._update(1/60,{});
  return{score:s.score,combo:s.combo,texts:s.texts.map(t=>t.s),falls:s.falls.length,pops:s.pops.length}});
 ok('7 score : groupe de 6 (bonus gros groupe) + 3 bulles tombées (bonus chute) + combo affiché',sc.score>=6*10+3*15+3*20&&sc.combo>=2&&sc.texts.some(t=>/COMBO/.test(t))&&sc.falls>=3,sc);
 await p.screenshot({path:`${O}/bp_05_combo.png`});
 // ---- 8. échange de bulle au toucher ----
 await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(1);s.phase='play'});await W(100);const sw0=await S();const nb=await E(()=>ARC.modules.bubble._s.L.nextB);await tapG(nb.x,nb.y);await W(80);const sw1=await S();await W(350);
 ok('8 toucher la bulle suivante l’échange avec la bulle chargée (animation), sans tirer',sw1.cur==sw0.next&&sw1.next==sw0.cur&&sw1.shots==0&&!sw1.shot,{sw0:[sw0.cur,sw0.next],sw1:[sw1.cur,sw1.next]});
 // ---- 9. pause : reprise, son, retour au jeu ----
 const pb=await E(()=>ARC.modules.bubble._s.L.pause);await tapG(pb.x+pb.w/2,pb.y+pb.h/2);await W(200);const p1=await S();await p.screenshot({path:`${O}/bp_06_pause.png`});
 const t0=await E(()=>ARC.modules.bubble._s.t);await W(400);await shoot(9,4,60);await W(200);const p2=await S();
 await btn('mute');await W(150);const p3=await S();const fxN=await E(()=>window.__fx.length);await btn('resume');await W(150);await shoot(9,4,60);await waitLand();const p4=await S();const fxN2=await E(()=>window.__fx.length);
 const sb=await E(()=>ARC.modules.bubble._s.L.snd);await tapG(sb.x+sb.w/2,sb.y+sb.h/2);await W(150);const p5=await S();
 ok('9 pause : le jeu se fige (pas de tir possible), SON coupé/rétabli (aucun effet sonore joué quand coupé, choix sauvegardé), REPRENDRE',p1.paused&&!p2.shot&&p2.shots==0&&p3.mute&&!p4.paused&&p4.shots==1&&fxN2==fxN&&!p5.mute,{p1:p1.paused,p2:p2.shots,p3:p3.mute,p4:p4.shots,fxPendantCoupe:fxN2-fxN,p5:p5.mute});
 // ---- 10. victoire réelle (vrai tir) → écran festif → NIVEAU SUIVANT ; niveau débloqué et sauvegardé ----
 await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(0);s.phase='play';s.g=[[{ci:0,t:1},{ci:0,t:1},null,null,null,null,null,null,null]];s.cur=0});await W(100);
 await shoot(3.2,1.6,80);await waitLand();await W(900);const v=await S();await p.screenshot({path:`${O}/bp_07_victoire.png`});const lvSaved=await E(()=>N.arcade.bubble.level);
 await btn('next');await W(300);const v2=await S();
 ok('10 victoire : animation, score affiché, niveau 2 débloqué et sauvegardé, NIVEAU SUIVANT charge le niveau 2',v.ph=='won'&&v.score>500&&lvSaved>=2&&v2.ph=='intro'&&v2.lvl==1,{v,lvSaved,v2});
 // ---- 11. défaite → RECOMMENCER (score du niveau remis comme au départ) ----
 await W(1900);await E(()=>{const M=ARC.modules.bubble,s=M._s;s.off=9;s.offA=9});await W(100);await shoot(9,6,60);await waitLand();await W(900);const d=await S();await p.screenshot({path:`${O}/bp_08_defaite.png`});
 await btn('retry');await W(200);const d2=await S();
 ok('11 défaite (bulles sous la ligne rouge) : écran adapté, RECOMMENCER relance le même niveau avec le score de départ',d.ph=='lost'&&d2.ph=='intro'&&d2.lvl==1&&d2.n==51&&d2.score==v.score,{d,d2});
 // ---- 12. 12 niveaux définis, objectifs variés, difficulté croissante ----
 const lv=await E(()=>ARC.modules.bubble._levels.map(l=>({obj:l.obj,drop:l.drop,c:new Set(l.map.join('').toLowerCase().replace(/\./g,'')).size})));
 ok('12 12 niveaux : objectifs ÉCLATER TOUT / LIBÉRER LES ÉTOILES / SCORE EN N TIRS, de 3 à 6 couleurs, plafond qui descend',lv.length>=10&&new Set(lv.map(l=>l.obj)).size==3&&lv[0].c==3&&lv[lv.length-1].c==6&&lv.slice(-4).every(l=>l.drop>0),lv);
 // ---- 13. orientations et tailles : rotation pendant un tir, commandes toujours actives ----
 const sizes=[[390,844],[844,390],[320,568],[568,320],[768,1024],[1024,768],[1920,1080]],lay=[];await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(8);s.phase='play'});
 for(const[w,h]of sizes){await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(8);s.phase='play'});await W(80);await shoot(5,10,40);await p.setViewportSize({width:w,height:h});await W(500);await waitLand();const before=(await S()).shots;await shoot(12,8,60);await waitLand();const after=(await S()).shots;
  const o=await E(()=>{const s=ARC.modules.bubble._s,L=s.L,r=AX.cv.getBoundingClientRect(),cpp=r.width/AX.L.W,inn=(b)=>b.x>=0&&b.y>=0&&b.x+b.w<=L.w&&b.y+b.h<=L.h;
   const brd={x:L.ox-4,y:L.oy-4,w:L.bw+8,h:(ARC.modules.bubble._C.LY+2.4)*L.k+8};return{k:+L.k.toFixed(2),board:inn(brd),btn:inn(L.pause)&&inn(L.snd),btnCss:Math.round(L.pause.w*cpp),edge:Math.round(L.pause.x*cpp),nb:L.nextB.y+L.nextB.r<=L.h&&L.nextB.x+L.nextB.r<=L.w,scroll:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight}});
  lay.push({w,h,...o,tirs:after-before,ph:(await S()).ph});await p.screenshot({path:`${O}/bp_taille_${w}x${h}.png`})}
 ok('13 portrait et paysage (téléphones, tablettes, écran) : plateau entier visible, boutons ≥ 40 px et à distance des bords, rotation pendant un tir sans bloquer le toucher',lay.every(o=>o.board&&o.btn&&o.nb&&o.scroll&&o.btnCss>=40&&o.edge>=8&&o.tirs==1),lay.map(o=>[o.w+'x'+o.h,o.k,o.btnCss,o.board&&o.btn&&o.nb,o.tirs,o.ph]));
 const bv=await E(()=>window.__bv);ok('14 collisions : sur toute la session, aucune superposition de bulles et aucun tir à l’intérieur d’une bulle',bv.ov==0&&bv.tr==0&&bv.n>300,bv);
 // ---- 15. QUITTER (pause) → borne ; nettoyage : plus de mise à jour, plus de particules ; Échap fonctionne aussi ----
 await p.setViewportSize({width:390,height:844});await W(400);await E(()=>{const M=ARC.modules.bubble,s=M._s;M._load(2);s.phase='play'});await W(100);const qph=await S();const pb2=await E(()=>ARC.modules.bubble._s.L.pause);await tapG(pb2.x+pb2.w/2,pb2.y+pb2.h/2);await W(150);await btn('quit');await W(400);
 const q=await E(()=>({st:ARC.state,cur:ARC.cur,parts:ARC.modules.bubble._s.parts.length,falls:ARC.modules.bubble._s.falls.length,api:ARC.modules.bubble._s.api,t:ARC.modules.bubble._s.t}));await W(500);const q2=await E(()=>ARC.modules.bubble._s.t);
 await E(()=>arcStart(ARC.games.find(g=>g.id=='bubble')));await W(300);await p.keyboard.press('Escape');await W(300);const q3=await E(()=>({st:ARC.state,cur:ARC.cur}));
 await p.screenshot({path:`${O}/bp_09_retour.png`});
 ok('15 QUITTER revient au catalogue de la borne ; tout est arrêté et nettoyé (aucune animation ne continue) ; Échap ferme aussi le jeu',q.st=='menu'&&!q.cur&&q.parts==0&&q.falls==0&&q.api===null&&q2==q.t&&q3.st=='menu'&&!q3.cur,{qph:qph.ph,q,q2,q3});
 ok('16 aucune erreur JavaScript',errs.length==0,errs);
 fs.writeFileSync(`${O}/bubble_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
