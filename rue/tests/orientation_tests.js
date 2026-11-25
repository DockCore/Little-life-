// Tests réels des changements d'orientation (portrait ⇄ paysage) sans rechargement, y compris le cas iOS
// où la taille de l'écran est mise à jour APRÈS l'événement « resize ».
// Usage : node rue/tests/orientation_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,900):''))}
const P=[390,844],L=[844,390];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const errs=[];
 const ctx=await b.newContext({viewport:{width:P[0],height:P[1]},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 // simulateur iOS : quand il est armé, le prochain « resize » est avalé (comme quand Safari le déclenche avant d'avoir la nouvelle taille)
 await p.addInitScript(()=>{window.__avale=0;window.__avales=0;addEventListener('resize',e=>{if(window.__avale>0){window.__avale--;window.__avales++;e.stopImmediatePropagation()}},true)});
 await p.goto(JEU);await p.waitForTimeout(1500);
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 for(let i=0;i<10&&await E(()=>!!document.getElementById('intro'));i++){await p.touchscreen.tap(195,300);await W(500)}await W(1400);
 // nouvelle partie réelle depuis l'écran titre
 const tapId=async id=>{const r=await E(id=>{const e=document.getElementById(id),q=e.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2}},id);await p.touchscreen.tap(r.x,r.y);return r};
 await tapId('tNew');await W(900);await E(()=>{document.getElementById('crOk2').click()});await W(900);await E(()=>{window.__marque='même session';N.coins=2468;save()});
 // --- outils de vérification ---
 // 1) aucun calque n'intercepte les touches : chaque élément interactif visible reçoit bien le toucher à son centre
 const touchesOK=()=>E(()=>{const bad=[],sel='#bMenu,#zmBtn,#back:not([hidden]),.frame.low .view.on button,.frame.low .view.on .tile,#bMus,.ljoy.ok,.stpad button';
  document.querySelectorAll(sel).forEach(t=>{if(!t.offsetParent)return;const q=t.getBoundingClientRect();if(q.width<6||q.height<6)return;const x=q.left+q.width/2,y=q.top+q.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)return;
   const v=t.closest('.view');if(v){const vr=v.getBoundingClientRect();if(y<vr.top||y>vr.bottom)return}
   const e=document.elementFromPoint(x,y);if(!e||!(t===e||t.contains(e)))bad.push((t.id||t.textContent.trim().slice(0,10))+'→'+(e?(e.id||e.className||e.tagName):'rien'))});return bad});
 // 2) aucune trace de l'autre disposition
 const etat=()=>E(()=>{const m=document.querySelector('main'),mr=m.getBoundingClientRect(),lo=document.querySelector('.frame.low').getBoundingClientRect(),tb=topbox.getBoundingClientRect(),rc=RC.getBoundingClientRect(),d=devicePixelRatio||1;
  return{W:innerWidth,H:innerHeight,land:LS.land,cls:document.documentElement.classList.contains('land'),pos:getComputedStyle(m).position,main:[mr.left,mr.top,mr.width,mr.height].map(Math.round),
   low:[lo.left,lo.top,lo.width,lo.height].map(Math.round),tb:[tb.width,tb.height].map(Math.round),needsIn:document.getElementById('needs').parentNode.className,joy:getComputedStyle(document.querySelector('.ljoy')).display,
   appH:parseInt(getComputedStyle(document.documentElement).getPropertyValue('--appH')),rot:getComputedStyle(document.getElementById('rotx')).display,pause:rotQ.matches,
   rcOK:Math.abs(RC.width*KK/d-rc.width)<2&&Math.abs(RC.height*KK/d-rc.height)<2,rcIn:rc.width<=tb.width+1,marque:window.__marque,coins:N.coins,scroll:scrollY}});
 const bonP=e=>!e.land&&!e.cls&&e.pos!='fixed'&&e.main[2]==P[0]&&e.main[3]==P[1]&&e.low[0]==0&&e.low[2]==P[0]&&e.needsIn=='hud'&&e.joy=='none'&&e.appH==P[1]&&e.rot=='none'&&!e.pause&&e.rcOK&&e.scroll==0;
 const bonL=e=>e.land&&e.cls&&e.pos=='fixed'&&e.main[2]==L[0]&&e.main[3]==L[1]&&e.low[1]==0&&e.low[3]==L[1]&&e.low[0]>L[0]*.55&&/lhud/.test(e.needsIn)&&e.joy=='block'&&e.appH==L[1]&&e.rot=='none'&&!e.pause&&e.rcOK&&e.scroll==0;
 // 3) déplacement : toucher le sol à un endroit précis → Nori y arrive (les coordonnées de toucher sont justes)
 const marche=async(u,v)=>{let U=u,V=v;await E(()=>{C.x=6*12;C.y=88+6*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='idle'});const t=await E(([u0,v0])=>{isoSetup();const r=RC.getBoundingClientRect(),k=r.width/RC.width;for(let d=0;d<12;d++)for(const[du,dv]of[[0,0],[-d,0],[0,-d],[-d,-d],[d,-d],[-d,d]]){const u=u0+du,v=v0+dv;if(u<1||v<1||u>RN-1||v>RN-1)continue;const x=r.left+IX(u,v)*k,y=r.top+IY(u,v)*k,e=document.elementFromPoint(x,y);if(e===RC)return{x,y,u,v}}return{x:0,y:0,u:-99,v:-99}},[u,v]);u=t.u;v=t.v;
  await p.touchscreen.tap(t.x,t.y);let best=99,z=null;for(let i=0;i<120;i++){await W(60);z=await E(()=>({u:+(C.x/12).toFixed(2),v:+((C.y-88)/5).toFixed(2),st:C.st}));best=Math.min(best,Math.hypot(z.u-u,z.v-v));if(best<1.2)break}
  const okk=best<1.5;if(!okk)console.log('  marche',JSON.stringify({u,v,t,z}));return okk};
 // 4) une vraie action par le panneau : « Jouer » ouvre la vue, « Retour » revient
 const panneau=async()=>{if(await E(()=>!!document.getElementById('back').offsetParent))await tapId('back');const t=await E(()=>{const e=document.querySelector('#v-home [data-v="play"]');e.scrollIntoView({block:'nearest'});const q=e.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2}});await p.touchscreen.tap(t.x,t.y);await W(400);const v1=await E(()=>document.querySelector('main').dataset.v);await tapId('back');await W(400);const v2=await E(()=>document.querySelector('main').dataset.v);return v1=='play'&&v2=='home'};
 // 5) joystick (paysage) : Nori se déplace
 const joy=async()=>{const j=await E(()=>{const r=document.querySelector('.ljoy').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,R:r.width/2}});await E(()=>{C.x=10*12;C.y=88+10*5;C.tx=C.x;C.ty=C.y;C.path=null;C.st='idle'});const a=await E(()=>C.x);
  const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:j.x,y:j.y,id:5}]});for(let i=1;i<=4;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:j.x+j.R*i/4,y:j.y,id:5}]});await W(30)}await W(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await W(300);return (await E(()=>C.x))-a>8};
 const tourne=async([w,h],avale)=>{if(avale)await E(()=>{window.__avale=1});await p.setViewportSize({width:w,height:h});await W(avale?1100:500)};

 // ---- 1. démarrer en portrait et jouer ----
 const e1=await etat(),m1=await marche(10,11),pn1=await panneau(),t1=await touchesOK();await p.screenshot({path:`${O}/or_1_portrait.png`});
 ok('1 démarrage en portrait : disposition verticale propre, Nori marche là où on touche, les menus répondent, aucun calque n’intercepte les touches',bonP(e1)&&m1&&pn1&&t1.length==0,{e1,m1,pn1,t1});
 // ---- 2. passage en paysage : interactions ----
 await tourne(L);const e2=await etat(),m2=await marche(11,9),pn2=await panneau(),j2=await joy(),t2=await touchesOK();await p.screenshot({path:`${O}/or_2_paysage.png`});
 ok('2 passage en paysage : disposition horizontale complète, toucher le sol, joystick et panneau fonctionnent, aucun calque gênant',bonL(e2)&&m2&&pn2&&j2&&t2.length==0,{e2,m2,pn2,j2,t2});
 // ---- 3. retour en portrait sans recharger : plus aucune trace du paysage ----
 await tourne(P);const e3=await etat(),m3=await marche(9,11),pn3=await panneau(),t3=await touchesOK();await p.screenshot({path:`${O}/or_3_retour_portrait.png`});
 ok('3 retour en portrait sans rechargement : anciennes dimensions effacées (plus de colonne, de position fixe, de joystick ni de jauges déplacées), toile recalculée, touches et déplacements OK, même partie',bonP(e3)&&m3&&pn3&&t3.length==0&&e3.marque=='même session'&&e3.coins==2468,{e3,m3,pn3,t3});
 // ---- 4. tous les boutons répondent (menu du jeu inclus), dans les deux orientations ----
 const menuOK=async()=>{await tapId('bMenu');await W(400);const r=await E(()=>{const g=document.getElementById('gmenu');const items=[...g.querySelectorAll('.gi,.gi button')].filter(e=>e.offsetParent);const bad=[];items.forEach(t=>{t.scrollIntoView({block:'nearest'});/* le menu défile : on amène chaque élément à l’écran */const q=t.getBoundingClientRect();const x=q.left+q.width/2,y=q.top+q.height/2;if(y<0||y>innerHeight)return;const e=document.elementFromPoint(x,y);if(!e||!(t===e||t.contains(e)||e.contains(t)))bad.push(t.id||t.textContent.trim().slice(0,10))});return{open:!g.hidden,n:items.length,bad}});
  await tapId('gClose');await W(300);return r};
 const g4p=await menuOK();await tourne(L);const g4l=await menuOK();const t4=await touchesOK();await tourne(P);
 ok('4 tous les boutons répondent : panneau, en-tête et menu ☰ complet, en portrait comme en paysage',g4p.open&&g4p.bad.length==0&&g4l.open&&g4l.bad.length==0&&t4.length==0,{g4p,g4l,t4});
 // ---- 5. changements répétés, dont des rotations « à la iOS » (taille mise à jour sans événement) ----
 const cyc=[];for(let i=0;i<6;i++){const av=i%2==1;await tourne(L,av);const a=await etat(),ta=await touchesOK();await tourne(P,av);const c=await etat(),tc=await touchesOK();cyc.push({i,av,L:bonL(a),P:bonP(c),ta:ta.length,tc:tc.length})}
 const avales=await E(()=>window.__avales),m5=await marche(10,10),pn5=await panneau();
 ok('5 six allers-retours portrait ⇄ paysage, dont trois où l’événement de redimensionnement est perdu (comportement iOS) : la mise en page se corrige seule à chaque fois, aucune touche bloquée',cyc.every(c=>c.L&&c.P&&!c.ta&&!c.tc)&&avales>=3&&m5&&pn5,{cyc,avales,m5,pn5});
 // ---- 6. déplacements du personnage après tous ces changements (deux orientations) + rue ----
 const m6p=await marche(11,11);await tourne(L);const m6l=await marche(9,10),j6=await joy();
 await E(()=>streetEnter());await W(900);const st1=await E(()=>STV.px);const rb=await E(()=>{const r=document.getElementById('stwR').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rb.x,y:rb.y,id:9}]});
 // rotation PENDANT que le doigt est posé sur la flèche : rien ne doit rester enfoncé ensuite
 await W(300);await tourne(P);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(300);const st2=await E(()=>({px:STV.px,touch:STV.touch}));await W(500);const st3=await E(()=>STV.px);
 const rb2=await E(()=>{const r=document.getElementById('stwR').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rb2.x,y:rb2.y,id:9}]});await W(800);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const st4=await E(()=>STV.px);
 const t6=await touchesOK();await p.screenshot({path:`${O}/or_6_rue_portrait.png`});await E(()=>{try{show('home');streetLeave&&streetLeave()}catch(e){}});await E(()=>{try{if(STV.on)stLeave()}catch(e){}});await W(500);
 ok('6 déplacements : toucher le sol et joystick après de multiples rotations ; dans la rue, une rotation doigt posé ne laisse rien « coincé » et la marche reprend au toucher',m6p&&m6l&&j6&&st2.px>st1&&st2.touch.l==0&&st2.touch.r==0&&Math.abs(st3-st2.px)<2&&st4>st3+5&&t6.length==0,{m6p,m6l,j6,st1,st2,st3,st4,t6});
 await cdp.detach();
 // ---- 7. sauvegarde, menus, écran titre et « Continuer » après rotations ----
 await E(()=>{if(typeof STV!='undefined'&&STV.on){try{streetExit()}catch(e){}}});await W(300);
 await E(()=>{N.coins=1357;});await tapId('bMenu');await W(300);await tapId('gSave');await W(500);const sv=await E(()=>Object.values(localStorage).some(v=>/1357/.test(v||'')));
 await E(()=>document.getElementById('gmenu').hidden||document.getElementById('gClose').click());await W(300);
 await tapId('bMenu');await W(300);await tapId('gTitle');await W(900);const ti1=await E(()=>({vis:!tscr.hidden,cont:!document.getElementById('tCont').classList.contains('off')}));
 await tourne(L);const tiL=await E(()=>{const n=document.getElementById('tNew').getBoundingClientRect(),c=document.getElementById('tCont').getBoundingClientRect();const hit=b=>{const e=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return!!e&&!!e.closest('.tbtn')};return{land:TITRE.geo.land,n:hit(n),c:hit(c),inV:c.bottom<=innerHeight&&n.top>=0&&c.right<=innerWidth}});
 await p.screenshot({path:`${O}/or_7_titre_paysage.png`});await tourne(P);
 await tapId('tCont');await W(900);const ti2=await E(()=>({vis:!tscr.hidden,coins:N.coins,marque:window.__marque}));
 const v7=await E(()=>{show('goals');return document.querySelector('main').dataset.v});await W(300);await E(()=>show('home'));await W(300);
 ok('7 sauvegarde (Menu › Enregistrer), menus, écran titre (réorganisé en paysage puis en portrait) et « Continuer » fonctionnent après les rotations, sans perte',sv&&ti1.vis&&ti1.cont&&tiL.land&&tiL.n&&tiL.c&&tiL.inV&&!ti2.vis&&ti2.coins==1357&&ti2.marque=='même session'&&v7=='goals',{sv,ti1,tiL,ti2,v7});
 // ---- 8. choix « Paysage » tenu en vertical (iOS ne verrouille pas) : rien ne bloque, le jeu reste jouable ----
 await E(()=>LS.setMode('paysage'));await W(500);const e8=await etat(),m8=await marche(10,12),t8=await touchesOK();await E(()=>LS.setMode('auto'));
 ok('8 orientation choisie « Paysage » mais téléphone tenu en vertical : aucun écran bloquant, pas de pause, le jeu reste entièrement jouable',bonP(e8)&&m8&&t8.length==0,{e8,m8,t8});
 ok('9 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();fs.writeFileSync(path.join(O,'orientation_resultats.json'),JSON.stringify(R,null,1));const n=R.filter(r=>r.ok).length;console.log(`\n${n}/${R.length} tests réussis`);process.exit(n==R.length?0:1)})();
