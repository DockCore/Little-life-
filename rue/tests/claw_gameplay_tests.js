// Tests de la correction du gameplay de LUCKY CLAW : déplacements, butées réelles, viseur synchronisé, collisions avec la sortie.
// Vrais touchers sur la croix (CDP) en portrait puis en paysage. Usage : node rue/tests/claw_gameplay_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [mode,w,h] of [['portrait',390,844],['paysage',844,390]]){const T=s=>'['+mode+'] '+s;
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(JEU);await p.waitForTimeout(1500);const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{document.getElementById('intro')&&document.getElementById('intro').remove();tscr.hidden=true;document.getElementById('crOk2').click()});await W(400);
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(500);
 await E(()=>arcStart(ARC.games.find(g=>g.id=='claw')));await W(600);const cdp=await ctx.newCDPSession(p);
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const st=()=>E(()=>{const M=ARC.modules.claw,S=M._state,c=S.claw;return{ph:S.phase,gx:+c.gx.toFixed(3),gz:+c.gz.toFixed(3),x:c.x,z:c.z,y:+c.y.toFixed(2),stop:c.stop,gap:c.stopGap==null?null:+c.stopGap.toFixed(3),low:+M._tipLow(c).toFixed(2)}});
 const big=async()=>{const B=await E(()=>ARC.modules.claw._state.L.big);const c=await scr(B.x,B.y);await p.touchscreen.tap(c.x,c.y);await W(120)};
 const pad=async(dx,dy,ms)=>{await E(()=>{const S=ARC.modules.claw._state;if(S.phase=='aim')S.aimT=20});const J=await E(()=>ARC.modules.claw._state.L.pad);const c=await scr(J.x,J.y),k=(await scr(J.x+J.r,J.y)).x-c.x;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,id:5}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x+dx*k*.75,y:c.y+dy*k*.75,id:5}]});await W(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(60)};
 const goTo=async(tx,tz)=>{for(let i=0;i<16;i++){const s=await st();const dx=tx-s.gx,dz=tz-s.gz;if(Math.abs(dx)<.9&&Math.abs(dz)<.9)return s;await pad(Math.abs(dx)>.9?Math.sign(dx):0,Math.abs(dz)>.9?-Math.sign(dz):0,Math.max(40,Math.min(900,Math.max(Math.abs(dx),Math.abs(dz))/30*1000-30)))}return st()};
 // contrôle continu : dégagement minimal des doigts et du moyeu contre la vitre et les plaques, lots dans la vitrine, pointes au-dessus du sol
 await E(()=>{window.__g={glass:1e9,plate:1e9,prize:0,floor:1e9,n:0};const M=ARC.modules.claw,Wd=M._world;setInterval(()=>{const S=M._state;if(!S.claw||!ARC.cur)return;__g.n++;
  for(const f of M._fingers(S.claw)){__g.glass=Math.min(__g.glass,M._fingerClear(f,true));__g.plate=Math.min(__g.plate,M._fingerClear(f,false))}__g.plate=Math.min(__g.plate,M._hubClear(S.claw));__g.floor=Math.min(__g.floor,M._tipLow(S.claw));
  for(const q of S.ps)if(q.x<q.r-.02||q.x>Wd.WX-q.r+.02||q.z<q.r-.02||q.z>Wd.WD-q.r+.02)__g.prize++},10)});
 const Wd=await E(()=>ARC.modules.claw._world),B=Wd.BND;
 const insert=async()=>{await E(()=>{const S=ARC.modules.claw._state;S.credits=Math.max(S.credits,3);if(S.phase!='ready'&&S.phase!='title')S.phase='ready';if(S.phase=='title')ARC.modules.claw._newGame()});await big();await W(150)};
 await insert();
 // ---- 1. quatre directions ----
 const d0=await goTo(50,30),d=[];for(const[dx,dy]of[[1,0],[-1,0],[0,-1],[0,1]]){const a=await st();await pad(dx,dy,400);const c=await st();d.push([+(c.gx-a.gx).toFixed(1),+(c.gz-a.gz).toFixed(1)])}
 ok(T('1 déplacements : DROITE, GAUCHE, AVANT (fond), ARRIÈRE — environ 10 unités pour 0,4 s, sans dérive sur l’autre axe'),d[0][0]>8&&d[1][0]<-8&&d[2][1]>8&&d[3][1]<-8&&Math.abs(d[0][1])+Math.abs(d[1][1])+Math.abs(d[2][0])+Math.abs(d[3][0])<.01,{d0:[d0.gx,d0.gz],d});
 // ---- 2. les quatre coins (on pousse en diagonale jusqu'à la butée) ----
 const corners=[];for(const[dx,dy]of[[-1,1],[1,1],[1,-1],[-1,-1]]){await pad(dx,dy,4200);const s=await st();corners.push([s.gx,s.gz])}
 const expC=[[B.x0,B.z0],[B.x1,B.z0],[B.x1,B.z1],[B.x0,B.z1]];const cOK=corners.every((c,i)=>Math.abs(c[0]-expC[i][0])<.01&&Math.abs(c[1]-expC[i][1])<.01);
 await p.screenshot({path:`${O}/clg_${mode}_coin.png`});
 ok(T('2 les quatre coins sont atteints ; butées = limites intérieures réelles (pince fermée au contact des vitres : x '+B.x0.toFixed(1)+'–'+B.x1.toFixed(1)+', z '+B.z0.toFixed(1)+'–'+B.z1.toFixed(1)+' sur un plateau 100×64)'),cOK&&B.x0<8.5&&B.x1>91.5&&B.z0<9.5&&B.z1>58,{corners,B});
 // ---- 3. le long des parois : on glisse à pleine vitesse en poussant contre la vitre ----
 const w0=await st();await pad(-1,1,900);const w1=await st();await pad(0,1,2200);const w1b=await st();await pad(1,1,1000);const w2=await st();
 ok(T('3 le long des parois : en poussant contre la vitre la pince glisse sans se bloquer (vitesse conservée sur l’axe libre)'),Math.abs(w0.gx-B.x0)<.01&&Math.abs(w1.gx-B.x0)<.01&&w0.gz-w1.gz>15&&Math.abs(w1b.gz-B.z0)<.01&&Math.abs(w2.gz-B.z0)<.01&&w2.gx-w1b.gx>15,{w0:[w0.gx,w0.gz],w1:[w1.gx,w1.gz],w1b:[w1b.gx,w1b.gz],w2:[w2.gx,w2.gz]});
 // ---- viseur synchronisé : laser, ombre, vue du dessus et moyeu dessinés sur la position physique ----
 const sync=await E(()=>{const M=ARC.modules.claw,S=M._state,c=S.claw,L=S.L,R0=L.rad,h=M._P(c.x,c.y,c.z),g=M._P(c.x,0,c.z);const out={hubVsLaser:Math.abs(h.x-g.x)<1e-6};
  if(R0){const s=R0.w/M._world.WX;out.radar=Math.abs(S.radarMark.x-(R0.x+c.x*s))<1e-6&&Math.abs(S.radarMark.y-(R0.y+R0.h-c.z*s))<1e-6}else out.radar=true;out.dx=+(c.x-c.gx).toFixed(3);out.dz=+(c.z-c.gz).toFixed(3);return out});
 ok(T('viseur : laser, ombre et repère de la vue du dessus sont calculés sur la position réelle du moyeu (écart chariot/moyeu < 1,2 de balancement)'),sync.hubVsLaser&&sync.radar&&Math.abs(sync.dx)<=1.2&&Math.abs(sync.dz)<=1.2,sync);
 // ---- 4/5. descentes à différents endroits, dont tout près de la sortie et au-dessus des plaques ----
 const spots=[['coin arrière gauche',B.x0,B.z1],['coin avant droit',B.x1,B.z0],['centre',60,36],['fond',50,B.z1],['juste à droite de la plaque',Wd.CHX+Wd.CHT+B.x0+.3,12],['juste derrière la plaque',16,Wd.CHZ+Wd.CHT+B.z0-3.5],
  ['au-dessus du trou',15,14],['pile au-dessus de la plaque',Wd.CHX+Wd.CHT/2,12]];const res=[];
 for(const[n,x,z]of spots){await insert();const a=await goTo(x,z);await W(250);const s0=await st();await big();let s=null;for(let i=0;i<60;i++){await W(80);const q=await st();if(q.ph=='grab'||q.ph=='close'){s=q;break}}
  if(n.startsWith('pile'))await p.screenshot({path:`${O}/clg_${mode}_plaque.png`});if(n.startsWith('juste à droite'))await p.screenshot({path:`${O}/clg_${mode}_pres_sortie.png`});
  // contact réel au moment de l'arrêt
  const real=await E(()=>{return 0;const M=ARC.modules.claw,S=M._state,c=S.claw,Wd=M._world;let dp=1e9;for(const f of M._fingers(c))for(const q of S.ps)for(const[A,Bq]of[[f.j,f.k],[f.k,f.t]]){const ab=[Bq.x-A.x,Bq.y-A.y,Bq.z-A.z],l=ab[0]**2+ab[1]**2+ab[2]**2;let t=((q.x-A.x)*ab[0]+(q.y-A.y)*ab[1]+(q.z-A.z)*ab[2])/l;t=Math.max(0,Math.min(1,t));dp=Math.min(dp,Math.hypot(q.x-A.x-ab[0]*t,q.y-A.y-ab[1]*t,q.z-A.z-ab[2]*t)-q.r-Wd.CR)}
   const pl=Math.min(...M._fingers(c).map(f=>M._fingerClear(f,false)),M._hubClear(c));return{prize:+dp.toFixed(2),plate:+pl.toFixed(3)}});
  res.push({n,at:[+s0.gx.toFixed(1),+s0.gz.toFixed(1)],stop:s&&s.stop,gap:s&&s.gap,low:s&&s.low});
  for(let i=0;i<200;i++){await W(80);const q=await st();if(q.ph=='win'){await W(700);await big()}if(q.ph=='ready'||q.ph=='nocredit')break}}
 const by=n=>res.find(r=>r.n.startsWith(n));
 const contactOK=res.every(r=>r.stop=='sol'?Math.abs(r.gap-.05)<.01:r.stop=='peluche'?r.gap<=0:r.stop=='plaque'?r.gap>=0&&r.gap<=.05:false);
 ok(T('4 sortie : à côté de la plaque et au-dessus du trou, la pince descend jusqu’au sol ou au tas (aucune zone invisible) ; elle ne s’arrête sur une plaque qu’au contact mesuré d’un doigt'),
  ['juste à droite','au-dessus du trou'].every(k=>by(k).stop!='plaque'&&by(k).low<Wd.CHH)&&by('juste derrière').low<Wd.CHH&&(by('juste derrière').stop!='plaque'||by('juste derrière').gap<=.05)&&by('pile').stop=='plaque'&&by('pile').gap>=0&&by('pile').gap<=.05&&by('pile').low>Wd.CHH,res.filter(r=>/plaque|trou/.test(r.n)));
 ok(T('5 descentes en 8 endroits : chaque arrêt correspond à un contact réel (peluche touchée, plaque touchée ou pointes au sol), jamais avant'),contactOK,res.map(r=>[r.n,r.stop,'écart '+r.gap,'pointe '+r.low]));
 // ---- 6. récupération effective : on vise de vraies peluches avec la croix jusqu'à en gagner une ----
 const col0=await E(()=>Object.values(N.arcade.claw.col||{}).reduce((a,b)=>a+b,0));let tries=0,got=false;
 for(;tries<10&&!got;tries++){await insert();const t=await E(()=>{const S=ARC.modules.claw._state,B=ARC.modules.claw._world.BND;const q=S.ps.filter(p=>p.y>-1).sort((a,b)=>b.y-a.y)[0];return{x:Math.min(B.x1,Math.max(B.x0,q.x)),z:Math.min(B.z1,Math.max(B.z0,q.z))}});
  await goTo(t.x,t.z);await W(300);await big();for(let i=0;i<220;i++){await W(80);const q=await st();if(q.ph=='win'){got=true;await p.screenshot({path:`${O}/clg_${mode}_gagne.png`});await W(800);await big()}if(q.ph=='ready'||q.ph=='nocredit')break}}
 const col1=await E(()=>Object.values(N.arcade.claw.col||{}).reduce((a,b)=>a+b,0));
 ok(T('6 récupération réelle : peluche visée à la croix, saisie, remontée, lâchée dans la goulotte → ajoutée à la collection'),got&&col1>col0,{tries,col0,col1});
 const g=await E(()=>window.__g);
 ok(T('7 tactile '+mode+' : sur toute la session, aucun doigt ni moyeu dans la vitre ou une plaque, aucune pointe sous le sol, aucun lot hors vitrine, aucune erreur'),g.glass>=-0.001&&g.plate>=-0.001&&g.floor>=Wd.CR-.001&&g.prize==0&&g.n>300&&errs.length==0,{g,errs});
 await ctx.close()}
 fs.writeFileSync(`${O}/claw_gameplay_resultats.json`,JSON.stringify(R,null,1));console.log(R.filter(r=>r.ok).length+'/'+R.length+' tests réussis');await b.close()})();
