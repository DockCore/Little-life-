// Tests réels du mode paysage (Playwright + Chrome, écrans tactiles en vrais formats de téléphones et tablettes).
// Usage : node rue/tests/paysage_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
const FORMATS=[['iPhone 14 (19,5:9)',844,390,3],['iPhone Pro Max',932,430,3],['iPhone SE (16:9)',667,375,2],['Android 20:9',915,412,2.6],['iPad (4:3)',1024,768,2],['iPad Air',1180,820,2]];
const boot=async p=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
// mesures communes : scène / panneau / pièce isométrique / débordements
const MES=()=>{const vw=innerWidth,vh=innerHeight,tb=topbox.getBoundingClientRect(),lo=document.querySelector('.frame.low').getBoundingClientRect(),rc=RC.getBoundingClientRect();
 isoSetup();const pts=[[0,0],[RN,0],[0,RN],[RN,RN]].map(([u,v])=>[IX(u,v),IY(u,v)]),k=rc.width/RC.width,ys=pts.map(q=>q[1]),xs=pts.map(q=>q[0]);
 const room={l:rc.left+Math.min(...xs)*k,r:rc.left+Math.max(...xs)*k,t:rc.top+(Math.min(...ys)-WHI)*k,b:rc.top+Math.max(...ys)*k};
 const st=document.getElementById('status').getBoundingClientRect(),hud=document.querySelector('.hud .hl').getBoundingClientRect(),j=document.querySelector('.ljoy').getBoundingClientRect();
 const ratio=(rc.width/rc.height)/(RC.width/RC.height);
 return{vw,vh,land:LS.land,rot:getComputedStyle(document.getElementById('rotx')).display,tb:[tb.left,tb.top,tb.right,tb.bottom].map(Math.round),lo:[lo.left,lo.top,lo.right,lo.bottom].map(Math.round),
  room:Object.fromEntries(Object.entries(room).map(([a,b])=>[a,Math.round(b)])),st:[st.left,st.top,st.right,st.bottom].map(Math.round),hud:Math.round(hud.bottom),joy:[j.left,j.top,j.right,j.bottom].map(Math.round),joyOn:document.querySelector('.ljoy').classList.contains('ok'),
  ratio:+ratio.toFixed(4),scrollX:document.documentElement.scrollWidth-vw,scrollY:document.documentElement.scrollHeight-vh,KK:+KK.toFixed(2)}};
const inside=(a,b,m=1)=>a.l>=b[0]-m&&a.t>=b[1]-m&&a.r<=b[2]+m&&a.b<=b[3]+m;
// contrôle « rien de coupé » dans la colonne de droite : chaque bouton visible tient en largeur
const PANOK=()=>{const lo=document.querySelector('.frame.low'),r=lo.getBoundingClientRect(),v=lo.querySelector('.view.on');const bad=[];
 (v?[...v.querySelectorAll('button,.tile')]:[]).filter(b=>b.offsetParent&&!b.closest('.seg,.shcats')).forEach(b=>{const q=b.getBoundingClientRect();if(q.width<8)return;if(q.left<r.left-1||q.right>r.right+1)bad.push((b.textContent||b.id).trim().slice(0,20))});
 return{bad,over:v?v.scrollWidth-v.clientWidth:0}};

(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const errs=[];
 // ---- 1. choix libre de l'orientation : Auto / Portrait / Paysage, depuis le menu, sans redémarrer ni rien perdre ----
 {const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await boot(p);
  const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
  const st=()=>E(()=>{const m=document.querySelector('main').getBoundingClientRect(),t=topbox.getBoundingClientRect(),l=document.querySelector('.frame.low').getBoundingClientRect();return{mode:LS.mode,land:LS.land,rot:getComputedStyle(document.getElementById('rotx')).display,txt:document.querySelector('#rotx small').textContent,
   m:[m.left,m.top,m.right,m.bottom].map(Math.round),t:[t.top|0,Math.round(t.bottom)],l:[l.left|0,l.top|0],marque:window.__marque,coins:N.coins}});
  const run=async()=>{const a=await E(()=>C.t);await W(350);return (await E(()=>C.t))!=a};
  await E(()=>{window.__marque='même partie';N.coins=4321});
  const pick=async m=>{const b=await E(()=>{document.getElementById('bMenu').click();return 1});await W(400);const r=await E(m=>{const x=document.querySelector('.gor [data-or="'+m+'"]');x.scrollIntoView({block:'center'});const q=x.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2}},m);await p.touchscreen.tap(r.x,r.y);await W(400);await E(()=>document.getElementById('gClose').click());await W(300)};
  const R1={};
  R1.autoP=await st();R1.autoPrun=await run();
  const opt=await E(()=>{document.getElementById('bMenu').click();const g=document.querySelector('.gor');const r={vis:!!g&&g.offsetParent!==null,lab:g&&g.textContent,on:g&&g.querySelector('.on').dataset.or};document.getElementById('gClose').click();return r});
  await p.setViewportSize({width:844,height:390});await W(600);R1.autoL=await st();R1.autoLrun=await run();
  await p.screenshot({path:`${O}/ls_01_auto_paysage.png`});
  // Paysage choisi en tenant le téléphone en vertical
  await p.setViewportSize({width:390,height:844});await W(500);await pick('paysage');R1.paysP=await st();R1.paysPrun=await run();await p.screenshot({path:`${O}/ls_01_paysage_tenu_vertical.png`});
  await p.setViewportSize({width:844,height:390});await W(600);R1.paysL=await st();R1.paysLrun=await run();
  // Portrait choisi en tenant le téléphone à l'horizontale
  await pick('portrait');R1.portL=await st();R1.portLrun=await run();await p.screenshot({path:`${O}/ls_01_portrait_tenu_horizontal.png`});
  await p.setViewportSize({width:390,height:844});await W(600);R1.portP=await st();R1.portPrun=await run();await p.screenshot({path:`${O}/ls_01_portrait.png`});
  // préférence gardée après rechargement ; bouton de secours « Auto » sur l'écran de rotation
  await p.reload();await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});await W(300);R1.reload=await E(()=>LS.mode);
  await p.setViewportSize({width:844,height:390});await W(600);const bl=await st();await pick('auto');R1.secours=await st();
  const full=(x,w,h)=>x.m[0]==0&&x.m[1]==0&&x.m[2]==w&&x.m[3]==h;
  const good=opt.vis&&opt.on=='auto'&&/Orientation de l’écran/.test(opt.lab)&&
   !R1.autoP.land&&R1.autoP.rot=='none'&&R1.autoPrun&&full(R1.autoP,390,844)&&R1.autoL.land&&R1.autoL.rot=='none'&&R1.autoLrun&&full(R1.autoL,844,390)&&R1.autoL.t[0]==0&&
   R1.paysP.rot=='none'&&R1.paysPrun&&!R1.paysP.land&&full(R1.paysP,390,844)&&R1.paysL.rot=='none'&&R1.paysL.land&&R1.paysLrun&&full(R1.paysL,844,390)&&R1.paysL.t[0]==0&&
   R1.portL.rot=='none'&&R1.portLrun&&R1.portL.land&&R1.portP.rot=='none'&&!R1.portP.land&&R1.portPrun&&full(R1.portP,390,844)&&
   [R1.autoL,R1.paysL,R1.portP].every(x=>x.marque=='même partie'&&x.coins==4321)&&R1.reload=='portrait'&&bl.rot=='none'&&bl.land&&R1.secours.mode=='auto'&&R1.secours.rot=='none'&&R1.secours.land;
  ok('1 orientation au choix (menu ☰ › Orientation de l’écran) : Auto / Portrait / Paysage ; verrouillage système quand l’appareil le permet, sinon l’affichage suit l’appareil — aucune orientation ne bloque jamais l’autre (pas d’écran bloquant, jeu jamais en pause) ; sans redémarrage ni perte, préférence gardée',good,{opt,...R1,bloque:bl.rot});
  await ctx.close()}
 // ---- 2. chaque format : scène à gauche sur toute la hauteur, panneau à droite, pièce entière visible, sans déformation ni bande ----
 const fm=[];for(const [nom,w,h,dpr] of FORMATS){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nom+': '+e.message));await boot(p);
  const m=await p.evaluate(MES);await p.screenshot({path:`${O}/ls_02_${w}x${h}.png`});
  const good=m.land&&m.rot=='none'&&m.tb[0]==0&&m.tb[1]==0&&m.tb[3]==h&&Math.abs(m.tb[2]-m.lo[0])<=1&&m.lo[2]==w&&m.lo[1]==0&&m.lo[3]==h&&(m.lo[2]-m.lo[0])<=w*.4
   &&inside(m.room,m.tb,2)&&m.room.t>=0&&m.room.b<=m.st[1]+12&&(m.room.r-m.room.l)>(m.tb[2]-m.tb[0])*.6&&Math.abs(m.ratio-1)<.01&&m.scrollX<=0&&m.scrollY<=0&&m.joyOn;
  fm.push({nom,ok:good,...m});await ctx.close()}
 ok('2 six formats (19,5:9, Pro Max, 16:9, 20:9, iPad 4:3, iPad Air) : scène pleine hauteur à gauche, colonne d’actions à droite, pièce entière et centrée, pixels non déformés, aucun défilement ni bande',fm.every(f=>f.ok),fm.filter(f=>!f.ok).length?fm.filter(f=>!f.ok):fm.map(f=>f.nom+' KK'+f.KK+' pièce '+(f.room.r-f.room.l)+'×'+(f.room.b-f.room.t)));
 // ---- session principale 844×390 ----
 const ctx=await b.newContext({viewport:{width:844,height:390},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await boot(p);
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 const touchAt=async(x,y)=>{await p.touchscreen.tap(x,y)};
 // ---- 3. joystick (pouce gauche) : Nori marche dans la direction poussée ; toucher le sol marche toujours ----
 const jr=await E(()=>{const r=document.querySelector('.ljoy').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,R:r.width/2}});
 const scr=()=>E(()=>({x:IX(C.x/12,(C.y-88)/5),y:IY(C.x/12,(C.y-88)/5),st:C.st}));
 const joy=async(dx,dy,ms)=>{const cdp=await ctx.newCDPSession(p);const tp=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type=='touchEnd'?[]:[{x,y,id:7}]});
  await tp('touchStart',jr.x,jr.y);for(let i=1;i<=4;i++){await tp('touchMove',jr.x+dx*jr.R*i/4,jr.y+dy*jr.R*i/4);await W(30)}await W(ms);await tp('touchEnd');await cdp.detach()};
 await E(()=>{C.x=10*12;C.y=88+10*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='idle'});await W(200);
 const res={};for(const [n,dx,dy] of [['droite',1,0],['gauche',-1,0],['haut',0,-1],['bas',0,1]]){await E(()=>{C.x=10*12;C.y=88+10*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='idle'});await W(100);const a=await scr();await joy(dx,dy,700);const z=await scr();res[n]={dx:Math.round(z.x-a.x),dy:Math.round(z.y-a.y)}}
 await W(600);const after=await E(()=>C.st);
 // toucher le sol (déplacement d'origine)
 await E(()=>{C.x=6*12;C.y=88+6*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='idle'});const tg=await E(()=>{const r=RC.getBoundingClientRect(),k=r.width/RC.width;return{x:r.left+IX(13,13)*k,y:r.top+IY(13,13)*k}});await touchAt(tg.x,tg.y);await W(2500);const tap=await E(()=>({u:+(C.x/12).toFixed(1),v:+((C.y-88)/5).toFixed(1)}));
 ok('3 joystick au pouce gauche : Nori va à droite, à gauche, en haut et en bas de l’écran comme poussé, s’arrête au relâchement ; toucher le sol fonctionne toujours',
  res.droite.dx>8&&Math.abs(res.droite.dy)<res.droite.dx&&res.gauche.dx<-8&&Math.abs(res.gauche.dy)<-res.gauche.dx&&res.haut.dy<-4&&res.bas.dy>4&&after=='idle'&&Math.hypot(tap.u-13,tap.v-13)<2.5,{res,after,tap});
 await p.screenshot({path:`${O}/ls_03_joystick.png`});
 // ---- 4. actions à droite : tuiles, retour, sous-menus ; rien de coupé ----
 const tile=async sel=>{const r=await E(s=>{const e=document.querySelector(s);const q=e.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,vis:!!e.offsetParent}},sel);await touchAt(r.x,r.y);await W(500);return r};
 const t4=[];const pl=await tile('#v-home [data-v="play"]');t4.push(await E(()=>document.querySelector('main').dataset.v),await E(PANOK));await p.screenshot({path:`${O}/ls_04_jouer.png`});
 await tile('#back');t4.push(await E(()=>document.querySelector('main').dataset.v));await tile('#v-home [data-v="goals"]');t4.push(await E(()=>document.querySelector('main').dataset.v),await E(PANOK));await tile('#back');
 const views=['desk','table','shop','clothes','cafe','sofa','inv','deco','grocery','work'];const pv={};for(const v of views){await E(v=>show(v),v);await W(350);pv[v]=await E(PANOK);await p.screenshot({path:`${O}/ls_04_${v}.png`})}await E(()=>show('home'));await W(300);
 ok('4 actions et menus dans la colonne de droite (Jouer, Objectifs, bureau, table, boutiques, garde-robe, café, canapé, inventaire, déco, épicerie, travail) : tout tient, rien n’est coupé',
  pl.vis&&t4[0]=='play'&&t4[1].bad.length==0&&t4[2]=='home'&&t4[3]=='goals'&&Object.values(pv).every(r=>r.bad.length==0&&r.over<=1),{t4,pv});
 // ---- 5. création du personnage, habillage, menu du jeu ----
 await E(()=>{creating=true;crOpen&&crOpen();show('create')});await W(800);const cr=await E(()=>{const sb=document.getElementById('stBottom').getBoundingClientRect(),rc=RC.getBoundingClientRect(),vals=[...document.querySelectorAll('#stGen button,#stNameIn,#stPseudoIn,#crOk2')].map(e=>{const q=e.getBoundingClientRect();return q.right<=innerWidth+1&&q.bottom<=innerHeight+1&&q.width>0});
  const k=rc.width/RC.width,cv=RC.getContext('2d').getImageData(0,0,RC.width,RC.height).data;let skin=0;for(let i=0;i<cv.length;i+=16){const r=cv[i],g=cv[i+1],b=cv[i+2];if(r>200&&g>140&&g<190&&b>100&&b<150)skin++}
  return{col:[Math.round(sb.left),Math.round(sb.right)],tous:vals.every(Boolean),n:vals.length,skin,scene:Math.round(rc.width)}});
 await p.screenshot({path:`${O}/ls_05_creation.png`});await E(()=>document.getElementById('crOk2').click());await W(600);
 await E(()=>show('dress'));await W(800);const dr=await E(()=>({dressing,KK:+KK.toFixed(2),LH,pan:document.querySelector('.frame.low').getBoundingClientRect().left|0}));await p.screenshot({path:`${O}/ls_05_habillage.png`});await E(()=>show('home'));await W(500);
 await tile('#bMenu');const gm=await E(()=>{const _e=document.elementFromPoint(30,30);window.__gm=_e&&(_e.id||_e.className);const c=[...document.querySelectorAll('.gmenu:not([hidden]) .gcard')].find(e=>e.offsetParent),q=c.getBoundingClientRect();return{t:q.top|0,b:q.bottom|0,h:innerHeight,scroll:c.scrollHeight>c.clientHeight,el:window.__gm}});await p.screenshot({path:`${O}/ls_05_menu.png`});await tile('#gClose');
 ok('5 création (Nori en grand à gauche, réglages à droite), cabine d’habillage (personnage entier) et menu du jeu (tient dans l’écran, défile si besoin)',cr.col[1]==844&&cr.col[0]>844*.55&&cr.tous&&cr.skin>50&&dr.LH>=190&&gm.b>gm.t+100&&gm.t>=0&&gm.b<=gm.h,{cr,dr,gm});
 // ---- 6. rue : flèches sous le pouce gauche, marcher, entrer à droite ----
 await E(()=>streetEnter());await W(900);const sp=await E(()=>{const a=document.getElementById('stwL').getBoundingClientRect(),c=document.getElementById('stwR').getBoundingClientRect(),s=document.getElementById('street').getBoundingClientRect();return{l:[a.left|0,a.bottom|0],r:[c.left|0,c.right|0],st:[s.left|0,s.right|0,s.bottom|0],px:STV.px}});
 const cdp=await ctx.newCDPSession(p);const rb=await E(()=>{const r=document.getElementById('stwR').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rb.x,y:rb.y,id:3}]});await W(300);sp.dbg=await E(([x,y])=>{const e=document.elementFromPoint(x,y);return{el:e&&(e.id||e.className),t:STV.touch,on:STV.on,v:document.querySelector('main').dataset.v,st:C.st}},[rb.x,rb.y]);await W(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const px2=await E(()=>STV.px);await p.screenshot({path:`${O}/ls_06_rue.png`});
 ok('6 rue : flèches ◀ ▶ en bas à gauche (pouce gauche), la marche fonctionne au toucher, la rue occupe toute la scène',sp.l[0]<60&&sp.r[1]<200&&sp.l[1]>300&&sp.st[2]==390&&px2>sp.px+10,{sp,px2});
 // ---- 7. borne d'arcade : plein écran en paysage, Whack-a-Mole jouable au toucher ----
 await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(700);await p.screenshot({path:`${O}/ls_07_borne.png`});
 const arc=await E(()=>{const r=AX.cv.getBoundingClientRect();return{l:r.left|0,t:r.top|0,r:Math.round(r.right),b:Math.round(r.bottom),land:AX.L.land}});
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='mole');arcOk();arcOk()});await W(500);await E(()=>{const M=ARC.modules.mole;M._state.phase='play';M._state.time=50;M._state.spawnT=99;M._state.holes.forEach(h=>h.m=null);M._spawn()});await W(400);
 const hole=await E(()=>{const M=ARC.modules.mole._state,i=M.holes.findIndex(h=>h.m),h=M.holes[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=arcGS();return{i,x:r.left+(S.x+h.cx)*k,y:r.top+(S.y+h.cy-h.r*.5)*k,cell:M.L.cw,cellH:M.L.cell}});
 await touchAt(hole.x,hole.y);await W(150);const wm=await E(()=>{const M=ARC.modules.mole._state;return{score:M.score,hits:M.hits}});await p.screenshot({path:`${O}/ls_07_mole.png`});
 const fcov=await E(()=>{const F=AX.L.full,r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{l:Math.round(r.left+F.x*k),t:Math.round(r.top+F.y*k),r:Math.round(r.left+(F.x+F.w)*k),b:Math.round(r.top+(F.y+F.h)*k)}});
 await E(()=>{arcBack();arcBack();arcBack()});await W(400);
 ok('7 borne d’arcade en paysage (plein écran) ; Whack-a-Mole occupe tout l’écran, trous élargis à l’horizontale, une taupe touchée au doigt rapporte des points',arc.l<=0&&arc.t<=0&&arc.r>=844&&arc.b>=390&&fcov.l<=0&&fcov.t<=0&&fcov.r>=844&&fcov.b>=390&&hole.cell>hole.cellH&&wm.score>=10,{arc,fcov,hole,wm});
 // ---- 8. cinéma : séance en vue spectateur plein écran à l'horizontale ----
 await E(()=>{N.cine={billet:{s:1,t:CINE.FILMS[0].t},snacks:{pop:1,boi:1,bon:0},vus:0};CINE.setRoom('cine_s1');C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';const f=PLACES['cine_s1'].furn.filter(f=>f.n=='Rangee')[1];CINE.sitIn(f,CINE.freeSeat(f))});
 for(let i=0;i<200&&!(await E(()=>CINE.CM.open));i++)await W(100);await W(900);
 const cm=await E(()=>{const e=document.getElementById('cineMode'),v=e&&e.querySelector('video');const q=v?v.getBoundingClientRect():{},er=e?e.getBoundingClientRect():{};
  return{open:CINE.CM.open,full:er.left<=0&&er.top<=0&&er.right>=innerWidth&&er.bottom>=innerHeight,vid:[q.width|0,q.height|0],rot:!document.getElementById('cmRot')||document.getElementById('cmRot').hidden}});
 await p.screenshot({path:`${O}/ls_08_cinema.png`});
 ok('8 séance de cinéma en paysage : vue spectateur plein écran, film large, pas de demande de rotation',cm.open&&cm.full&&cm.vid[0]>844*.5&&cm.rot,cm);
 await E(()=>{document.getElementById('cmUi')&&document.getElementById('cmUi').classList.add('on')});try{await p.click('#cmQuit',{timeout:3000})}catch(e){}await W(800);
 // ---- 9. PC inchangé : pas de mode paysage mobile sur un ordinateur ----
 {const c2=await b.newContext({viewport:{width:1280,height:800}});const q=await c2.newPage();q.on('pageerror',e=>errs.push('pc: '+e.message));await boot(q);const r=await q.evaluate(()=>({land:LS.land,block:LS.block,cls:document.documentElement.className,w:document.querySelector('main').getBoundingClientRect().width|0}));
  ok('9 ordinateur : disposition d’origine conservée (pas d’écran de rotation, pas de colonne)',!r.land&&!r.block&&r.w<=560,r);await c2.close()}
 // ---- 11. aucune bande en haut : la console occupe réellement toute la hauteur, même si la page est décalée ou si 100vh est faux ----
 {const FS=[[844,390],[932,430],[667,375],[1180,820]],res=[];
  for(const [w,h] of FS){const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true});const q=await c.newPage();q.on('pageerror',e=>errs.push('11: '+e.message));await boot(q);
   const geo=()=>q.evaluate(()=>{const m=document.querySelector('main').getBoundingClientRect(),t=topbox.getBoundingClientRect(),l=document.querySelector('.frame.low').getBoundingClientRect(),rc=RC.getBoundingClientRect();
    return{m:[m.left,m.top,m.right,m.bottom].map(Math.round),t:[t.top,t.bottom].map(Math.round),l:[l.top,l.bottom].map(Math.round),rc:[rc.top,rc.bottom].map(Math.round),sy:scrollY}});
   const band=async()=>{const png=await q.screenshot();const {PNG}=(()=>{try{return require('/home/claude/.npm-global/lib/node_modules/pngjs')}catch(e){return{}}})();return png.length};
   const g0=await geo();
   // pire cas iOS : barre d'état « opaque » simulée (marge haute de 47 px sur la racine), 100vh trop grand, bloc parasite avant le jeu, page défilée
   await q.evaluate(()=>{const st=document.createElement('style');st.id='ios-bad';st.textContent=':root,html{padding-top:47px!important;height:calc(100vh + 80px)!important}body{height:calc(100vh + 80px)!important;padding-top:20px!important}';document.head.appendChild(st);
    const d=document.createElement('div');d.id='parasite';d.style.cssText='height:60px;background:#000';document.body.insertBefore(d,document.body.firstChild);scrollTo(0,40);dispatchEvent(new Event('resize'))});await q.waitForTimeout(500);
   const g1=await geo();
   // pixels : ligne du haut de la scène (hors HUD) jamais noire
   const dark=await q.evaluate(async()=>{const r=topbox.getBoundingClientRect();return null});
   const shot=await q.screenshot({clip:{x:Math.round(w*.3),y:0,width:Math.round(w*.25),height:6}});
   const sharp=(()=>{try{return require('/home/claude/.npm-global/lib/node_modules/sharp')}catch(e){return null}})();
   let noir=-1;try{const {execFileSync}=require('child_process');fs.writeFileSync('/tmp/_b.png',shot);noir=+execFileSync('python3',['-c',"from PIL import Image\nim=Image.open('/tmp/_b.png').convert('RGB')\nprint(sum(1 for p in im.getdata() if max(p)<60))"]).toString().trim()}catch(e){noir=-2}
   await q.screenshot({path:`${O}/ls_11_${w}x${h}.png`});
   // zone sûre du haut (barre d'état iPad) : la pièce descend d'autant, les jauges restent visibles
   await q.evaluate(()=>{document.getElementById('ios-bad').remove();document.getElementById('parasite').remove();scrollTo(0,0);LS.probe.style.height='24px';LS.decide();dispatchEvent(new Event('resize'))});await q.waitForTimeout(400);
   const sa=await q.evaluate(()=>{isoSetup();const k=RC.getBoundingClientRect().width/RC.width;return{top:LS.res.top,piece:Math.round(RC.getBoundingClientRect().top+(Math.min(IY(0,0),IY(RN,0),IY(0,RN))-WHI)*k)}});
   await q.evaluate(()=>{LS.probe.style.height='env(safe-area-inset-top,0px)';LS.decide();dispatchEvent(new Event('resize'))});
   const full=g=>g.m[0]==0&&g.m[1]==0&&g.m[2]==w&&g.m[3]==h&&g.t[0]==0&&g.t[1]==h&&g.l[0]==0&&g.l[1]==h;
   res.push({f:w+'x'+h,ok:full(g0)&&full(g1)&&noir==0&&sa.top==34&&sa.piece>=24,g0,g1,noir,sa});await c.close()}
  const meta=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8').match(/apple-mobile-web-app-status-bar-style" content="([^"]+)"/)[1];
  ok('11 aucune bande noire en haut : la console colle aux 4 bords réels (même avec marge iOS simulée, 100vh faux, bloc parasite et page défilée), pièce sous la zone sûre, barre d’état iOS transparente',res.every(r=>r.ok)&&meta=='black-translucent',{meta,res:res.filter(r=>!r.ok).length?res.filter(r=>!r.ok):res.map(r=>r.f+' noir:'+r.noir+' sûre:'+r.sa.piece)})}
 // ---- 12. le portrait (orientation libre) n'est pas cassé : aller-retour vertical → horizontal → vertical identique ----
 {const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const q=await c.newPage();q.on('pageerror',e=>errs.push('12: '+e.message));await q.goto(JEU+'?orient=libre');await q.waitForTimeout(2500);
  await q.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await q.waitForTimeout(800);
  const pg=()=>q.evaluate(()=>{const m=document.querySelector('main').getBoundingClientRect(),l=document.querySelector('.frame.low').getBoundingClientRect(),h=document.querySelector('.hud .needs').getBoundingClientRect();return{land:LS.land,m:[m.left,m.top,m.width,m.height].map(Math.round),l:[l.top,l.height].map(Math.round),needs:!!document.querySelector('.hud>.needs,.hud .needs')&&h.width>0,KK:+KK.toFixed(3),pos:getComputedStyle(document.querySelector('main')).position}});
  const a=await pg();await q.screenshot({path:`${O}/ls_12_portrait_avant.png`});await q.setViewportSize({width:844,height:390});await q.waitForTimeout(600);const mid=await pg();await q.setViewportSize({width:390,height:844});await q.waitForTimeout(700);const z=await pg();await q.screenshot({path:`${O}/ls_12_portrait_apres.png`});
  ok('12 portrait intact : disposition verticale d’origine, identique avant et après un passage en paysage',!a.land&&a.pos!='fixed'&&mid.land&&JSON.stringify(a)==JSON.stringify(z)&&a.m[1]==0&&a.m[3]==844,{a,mid,z});await c.close()}
 ok('10 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();fs.writeFileSync(path.join(O,'paysage_resultats.json'),JSON.stringify(R,null,1));const n=R.filter(r=>r.ok).length;console.log(`\n${n}/${R.length} tests réussis`);process.exit(n==R.length?0:1)})();
