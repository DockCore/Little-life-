const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.coins=900;N.energy=60;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;bgKey=''});
const lab=()=>p.evaluate(()=>[...document.querySelectorAll('#v-sofa [data-cz]')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')).join(' | '));
const st=()=>p.evaluate(()=>[C.st,C.ca,spName].join('/'));
const wait=async(fn,ms=15000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn))return true;await p.waitForTimeout(150)}return false};
// menu
const cz=await p.evaluate(()=>{const f=N.furn.find(czIs);isoSetup();const rb=RC.getBoundingClientRect(),q=P3(f.x+f.w/2,f.y+f.h/2,14);return[rb.left+q[0]/LW*rb.width,rb.top+q[1]/LH*rb.height]});
const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cz[0],y:cz[1],id:0}]});await p.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await p.waitForTimeout(300);console.log('1. menu',await lab(),await p.evaluate(()=>curV));
await wait(()=>C.st=='sofa');const seq=[];for(let i=0;i<8;i++){seq.push(await p.evaluate(()=>spName));await p.waitForTimeout(90)}console.log('   s’assoit',seq.join(' '),'|',await lab());
await p.screenshot({path:'menu.png'});
// sieste
await p.tap('#v-sofa [data-cz="nap"]');const s2=[];for(let i=0;i<9;i++){s2.push(await p.evaluate(()=>spName));await p.waitForTimeout(120)}console.log('2. sieste',s2.join(' '),'|',await lab());
const e0=await p.evaluate(()=>N.energy);await p.waitForTimeout(1500);console.log('   énergie',e0.toFixed(1),'->',(await p.evaluate(()=>N.energy)).toFixed(1),await st());
// se réveiller
await p.tap('#v-sofa [data-cz="nap"]');const s3=[];for(let i=0;i<8;i++){s3.push(await p.evaluate(()=>spName));await p.waitForTimeout(100)}console.log('3. réveil',s3.join(' '),'|',await lab());
// se lever
await p.tap('#v-sofa [data-cz="sit"]');const s4=[];for(let i=0;i<10;i++){s4.push(await p.evaluate(()=>C.st+':'+spName));await p.waitForTimeout(70)}console.log('4. se lever',s4.join(' '),'|',await lab());
// sieste depuis debout : va au canapé et s'allonge
await p.waitForTimeout(500);await p.tap('#v-sofa [data-cz="nap"]');await wait(()=>C.st=='sofa'&&C.ca=='nap');console.log('5. sieste directe',await st());
// se lever pendant la sieste : se réveille puis se lève
await p.tap('#v-sofa [data-cz="sit"]');await wait(()=>C.st!='sofa',6000);console.log('   se lever en dormant ->',await st());
// réveil automatique quand l'énergie est pleine
await p.waitForTimeout(800);await p.tap('#v-sofa [data-cz="nap"]');await wait(()=>C.ca=='nap');await p.evaluate(()=>{N.energy=99.99});await wait(()=>C.ca=='sit',4000);console.log('6. réveil auto',await st(),await p.evaluate(()=>document.getElementById('status').textContent));
// sans canapé long : sieste au lit
await p.evaluate(()=>{C.st='idle';C.rise=null;C._czs=null;N.furn=N.furn.filter(f=>!czIs(f));bgKey=''});await p.tap('#v-sofa [data-cz="nap"]');await wait(()=>C.st=='sleep');console.log('7. au lit',await st(),await lab());
await p.tap('#v-sofa [data-cz="nap"]');await p.waitForTimeout(200);console.log('   réveil lit',await st(),await lab());
console.log('err',errs);await b.close()})();
