const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForTimeout(1500);await p.evaluate(()=>{tod=0;bub.hidden=true});
const layout=()=>p.evaluate(()=>JSON.stringify(['main','#topbox','.hud','#zmUI','#status','.frame.low'].map(q=>{const e=document.querySelector(q);if(!e)return q+':-';const r=e.getBoundingClientRect();return q+':'+[r.x,r.y,r.width,r.height].map(v=>Math.round(v)).join(',')}).concat(['RC:'+RC.offsetWidth+'x'+RC.offsetHeight])));
const L0=await layout();console.log('mise en page :',L0);
await p.screenshot({path:'z0.png'});
const cdp=await ctx.newCDPSession(p);
const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
const tb=await p.evaluate(()=>{const r=topbox.getBoundingClientRect();return[r.x,r.y,r.width,r.height]});
const cx=tb[0]+tb[2]*.5,cy=tb[1]+tb[3]*.28;
// 1. pincement : écarter les doigts
await T('touchStart',[[cx-30,cy],[cx+30,cy]]);for(let i=1;i<=12;i++){await T('touchMove',[[cx-30-i*6,cy],[cx+30+i*6,cy]]);await p.waitForTimeout(16)}await T('touchEnd',[]);await p.waitForTimeout(700);
let z=await p.evaluate(()=>({tz:ZM.tz,z:ZM.z,kk:KK,px:+(ZM.tz*KK).toFixed(4),st:C.st}));console.log('1. pincement écarté : zoom',z.tz.toFixed(3),'| pixels écran par pixel de jeu',z.px,'(entier ?',Math.abs(z.px-Math.round(z.px))<1e-6,') | perso',z.st);
console.log('   mise en page identique :',L0==await layout());
await p.screenshot({path:'z1.png'});
// 2. appui sur le sol après zoom : le personnage va bien à l'endroit touché
const tgt=await p.evaluate(()=>{isoSetup();const u=7,v=12,rb=RC.getBoundingClientRect();return{u,v,x:rb.left+IX(u,v)/LW*rb.width,y:rb.top+IY(u,v)/LH*rb.height}});
await T('touchStart',[[tgt.x,tgt.y]]);await p.waitForTimeout(40);await T('touchEnd',[]);await p.waitForTimeout(150);
const w=await p.evaluate(()=>{const P=C.path&&C.path.length?C.path[C.path.length-1]:[C.tx/12,(C.ty-88)/5];return{st:C.st,u:+P[0].toFixed(2),v:+P[1].toFixed(2)}});console.log('2. appui sur la case (7,12) zoomé -> destination',w);
// 3. glisser d'un doigt : la vue se déplace, aucune action du jeu
await p.waitForTimeout(2500);const st0=await p.evaluate(()=>({tx:ZM.tx,ty:ZM.ty,st:C.st,x:C.x,y:C.y}));
await T('touchStart',[[cx,cy]]);for(let i=1;i<=10;i++){await T('touchMove',[[cx+i*12,cy+i*6]]);await p.waitForTimeout(16)}await T('touchEnd',[]);await p.waitForTimeout(500);
const st1=await p.evaluate(()=>({tx:ZM.tx,ty:ZM.ty,st:C.st,x:C.x,y:C.y}));console.log('3. glisser : vue',st0.tx.toFixed(1),st0.ty.toFixed(1),'->',st1.tx.toFixed(1),st1.ty.toFixed(1),'| perso n’a pas bougé :',st0.x==st1.x&&st0.y==st1.y,st1.st);
// 4. limites : glisser très loin
for(const d of [[1,1],[-1,-1]]){await T('touchStart',[[cx,cy]]);for(let i=1;i<=20;i++){await T('touchMove',[[cx+d[0]*i*40,cy+d[1]*i*40]]);await p.waitForTimeout(10)}await T('touchEnd',[]);await p.waitForTimeout(400);
 console.log('4. limites',d,await p.evaluate(()=>{const w=RC.offsetWidth,h=RC.offsetHeight;return{tx:+ZM.tx.toFixed(1),ty:+ZM.ty.toFixed(1),min:[+(w-w*ZM.tz).toFixed(1),+(h-h*ZM.tz).toFixed(1)],dedans:ZM.tx<=0&&ZM.ty<=0&&ZM.tx>=w-w*ZM.tz-.01&&ZM.ty>=h-h*ZM.tz-.01}}))}
// 5. appui sur le personnage zoomé -> il réagit (caresse)
await p.evaluate(()=>{C.st='idle';C.path=null});await p.waitForTimeout(300);
const ch=await p.evaluate(()=>{isoSetup();const rb=RC.getBoundingClientRect(),cu=C.x/12,cv=(C.y-88)/5;return{x:rb.left+IX(cu,cv)/LW*rb.width,y:rb.top+(IY(cu,cv)-25)/LH*rb.height,vis:rb}});
await p.evaluate(()=>{window._fx=fx.length;bub.hidden=true;window._t=document.getElementById('status').textContent});
await T('touchStart',[[ch.x,ch.y]]);await p.waitForTimeout(40);await T('touchEnd',[]);await p.waitForTimeout(300);
console.log('5. appui sur le personnage :',await p.evaluate(()=>({coeurs:fx.length>window._fx,bulle:!bub.hidden,etat:C.st,statut:document.getElementById('status').textContent})));
// 6. bulle de dialogue au-dessus de la tête une fois zoomé
await p.evaluate(()=>talk('Coucou !'));await p.waitForTimeout(200);
console.log('6. bulle :',await p.evaluate(()=>{const r=bub.getBoundingClientRect(),rb=RC.getBoundingClientRect(),hx=rb.left+HEAD[0]/LW*rb.width;return{centreBulle:Math.round(r.left+r.width/2),tete:Math.round(hx),basBulle:Math.round(r.bottom),hautTete:Math.round(rb.top+HEAD[1]/LH*rb.height)}}));
await p.screenshot({path:'z2.png'});
// 7. boutons
await p.tap('#zmBtn');await p.waitForTimeout(150);const vals=[];
for(const id of ['#zmIn','#zmIn','#zmIn','#zmIn','#zmIn','#zmIn','#zmOut','#zmRst']){await p.tap(id);await p.waitForTimeout(500);vals.push(id.slice(3)+':'+(await p.evaluate(()=>ZM.tz.toFixed(2))))}
console.log('7. boutons',vals.join(' '),'| max 3 :',await p.evaluate(()=>{ZM.tz=1;zmTo(9);return ZM.tz}));await p.evaluate(()=>zmTo(1));await p.waitForTimeout(600);
// 8. pincement resserré sous le minimum -> revient à 1 ; zoom 1 : appui au sol toujours fonctionnel
await T('touchStart',[[cx-80,cy],[cx+80,cy]]);for(let i=1;i<=10;i++){await T('touchMove',[[cx-80+i*7,cy],[cx+80-i*7,cy]]);await p.waitForTimeout(16)}await T('touchEnd',[]);await p.waitForTimeout(600);
console.log('8. pincement resserré : zoom',await p.evaluate(()=>ZM.tz),'| transformation',await p.evaluate(()=>RC.style.transform||'(aucune)'));
const t2=await p.evaluate(()=>{isoSetup();const rb=RC.getBoundingClientRect();return{x:rb.left+IX(12,14)/LW*rb.width,y:rb.top+IY(12,14)/LH*rb.height}});
await T('touchStart',[[t2.x,t2.y]]);await p.waitForTimeout(40);await T('touchEnd',[]);await p.waitForTimeout(200);
console.log('   appui sans zoom sur (12,14) ->',await p.evaluate(()=>{const P=C.path&&C.path.length?C.path[C.path.length-1]:[C.tx/12,(C.ty-88)/5];return[C.st,+P[0].toFixed(2),+P[1].toFixed(2)]}));
// 9. souris (molette)
const pm=await b.newPage({viewport:{width:1100,height:900}});pm.on('pageerror',e=>errs.push(e.message));await pm.goto('file:///home/claude/little-life-/index.html');await pm.waitForTimeout(1800);
await pm.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await pm.waitForTimeout(1200);
const r2=await pm.evaluate(()=>{const r=RC.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});await pm.mouse.move(r2[0],r2[1]);await pm.mouse.wheel(0,-200);await pm.waitForTimeout(600);
console.log('9. molette :',await pm.evaluate(()=>ZM.tz.toFixed(2)));
await pm.mouse.move(r2[0],r2[1]);await pm.mouse.down();for(let i=1;i<=8;i++)await pm.mouse.move(r2[0]+i*15,r2[1]+i*8);await pm.mouse.up();await pm.waitForTimeout(400);
console.log('   glisser souris : vue',await pm.evaluate(()=>[ZM.tx.toFixed(1),ZM.ty.toFixed(1),C.st]));
{const L1=await layout();console.log('mise en page finale identique :',L0==L1,L0==L1?'':L1)}
console.log('erreurs :',errs);await b.close()})();
