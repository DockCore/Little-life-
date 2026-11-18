const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.coins=900;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;f.k=4;f.ck=3;f.pk=5;bgKey='';save();show('deco')});await p.waitForTimeout(300);
const cdp=await ctx.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
const scr=(u,v,z=0)=>p.evaluate(([u,v,z])=>{isoSetup();const rb=RC.getBoundingClientRect(),q=P3(u,v,z);return[rb.left+q[0]/LW*rb.width,rb.top+q[1]/LH*rb.height]},[u,v,z]);
const cz=()=>p.evaluate(()=>{const i=draft.findIndex(czIs),f=draft[i];return f?{sel:sel==i,x:f.x,y:f.y,w:f.w,h:f.h,r:f.r}:null});
// 1. glisser le canapé dans la scène
let a=await scr(8.5,9,12);await T('touchStart',[a]);for(let i=1;i<=10;i++){const q=await scr(8.5+i*.3,9+i*.2,12);await T('touchMove',[q]);await p.waitForTimeout(20)}await T('touchEnd',[]);await p.waitForTimeout(200);
await p.waitForTimeout(400);console.log('1. glissé',await cz(),'| perso a bougé ?',await p.evaluate(()=>C.st));await p.screenshot({path:'drag.png'});
// 2. Déplacer + toucher le sol
await p.tap('#czBar [data-c="move"]');a=await scr(5,14);await T('touchStart',[a]);await T('touchEnd',[]);await p.waitForTimeout(200);console.log('2. toucher le sol',await cz(),await p.evaluate(()=>[C.st,(C.tx/12).toFixed(1),((C.ty-88)/5).toFixed(1)]));
// 3. tourner 4 fois
const rs=[];for(let i=0;i<4;i++){await p.tap('#czBar [data-c="rot"]');await p.waitForTimeout(120);const c=await cz();rs.push(c.r+':'+c.w+'x'+c.h)}console.log('3. rotations',rs.join(' '),await p.evaluate(()=>document.getElementById('status').textContent));
await p.tap('#czBar [data-c="rot"]');await p.waitForTimeout(100);
// 4. valider + recharger : position, orientation, couleurs conservées
await p.tap('#czBar [data-c="ok"]');await p.waitForTimeout(200);const before=await p.evaluate(()=>{const f=N.furn.find(czIs);return JSON.stringify([f.x,f.y,f.w,f.h,f.r,f.k,f.ck,f.pk])});
await p.evaluate(()=>save());await p.reload();await p.waitForTimeout(2000);
const after=await p.evaluate(()=>{const f=N.furn.find(czIs);return f?JSON.stringify([f.x,f.y,f.w,f.h,f.r,f.k,f.ck,f.pk]):'absent'});console.log('4. avant',before,'après rechargement',after,before==after);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});
// 5. ranger puis replacer : coloris conservés
await p.evaluate(()=>{show('deco');sel=draft.findIndex(czIs);planDraw()});await p.tap('#czBar [data-c="stow"]');await p.tap('#ok');await p.waitForTimeout(100);
console.log('5. rangé',await p.evaluate(()=>[N.store.join(','),JSON.stringify(N.czKeep)]));
await p.evaluate(()=>{show('inv')});await p.tap('#invBox [data-pl]');await p.waitForTimeout(100);console.log('   replacé',await p.evaluate(()=>{const f=N.furn.find(czIs);return f?[f.k,f.ck,f.pk,f.x,f.y,f.r]:'absent'}));
// 6. vendre
await p.evaluate(()=>{show('deco');sel=draft.findIndex(czIs);planDraw()});const c0=await p.evaluate(()=>N.coins);await p.tap('#czBar [data-c="sell"]');console.log('6. bouton',await p.textContent('#czBar [data-c="sell"]'));await p.tap('#czBar [data-c="sell"]');await p.waitForTimeout(100);
console.log('   pièces',c0,'->',await p.evaluate(()=>N.coins),'canapé restant',await p.evaluate(()=>N.furn.filter(czIs).length+N.store.filter(n=>n=='Canapé cosy').length),await p.evaluate(()=>document.getElementById('status').textContent));
// 7. ancien canapé toujours fonctionnel
await p.evaluate(()=>{show('home');const it=SHOP.find(s=>s.n=='Canapé');placeItem(it);goSofa()});for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st=='sofa'))break}console.log('7. ancien canapé',await p.evaluate(()=>[C.st,spName]));
console.log('err',errs);await b.close()})();
