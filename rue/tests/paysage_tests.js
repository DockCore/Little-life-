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
 // ---- 1. orientation forcée : en vertical sur mobile, écran « tourne ton téléphone » et jeu en pause ; à l'horizontale le jeu reprend ----
 {const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await boot(p);
  const t1=await p.evaluate(()=>{const f=frameN=>0;return{rot:getComputedStyle(document.getElementById('rotx')).display,txt:document.querySelector('#rotx p').textContent+' / '+document.querySelector('#rotx small').textContent,pause:rotQ.matches,land:LS.land}});
  const c0=await p.evaluate(()=>C.t);await p.waitForTimeout(400);const c1=await p.evaluate(()=>C.t);await p.screenshot({path:`${O}/ls_01_portrait.png`});
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(700);const t2=await p.evaluate(()=>({rot:getComputedStyle(document.getElementById('rotx')).display,pause:rotQ.matches,land:LS.land}));
  const c2=await p.evaluate(()=>C.t);await p.waitForTimeout(400);const c3=await p.evaluate(()=>C.t);
  const man=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../manifest.webmanifest'),'utf8'));
  ok('1 orientation : en vertical sur mobile « Tourne ton téléphone » + jeu en pause ; à l’horizontale le jeu reprend aussitôt ; application installée en paysage',
   t1.rot=='flex'&&t1.pause&&!t1.land&&c1==c0&&t2.rot=='none'&&!t2.pause&&t2.land&&c3!=c2&&man.orientation=='landscape',{t1,gel:[c0,c1],t2,vit:[c2,c3],manifest:man.orientation});
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
 ok('10 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();fs.writeFileSync(path.join(O,'paysage_resultats.json'),JSON.stringify(R,null,1));const n=R.filter(r=>r.ok).length;console.log(`\n${n}/${R.length} tests réussis`);process.exit(n==R.length?0:1)})();
