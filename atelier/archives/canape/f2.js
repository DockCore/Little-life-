const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;show('sofa')});const lab=()=>p.evaluate(()=>[...document.querySelectorAll('#v-sofa [data-cz]')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')).join(' | '));
console.log('0',await lab());await p.tap('#v-sofa [data-cz="sit"]');console.log('   sans siège',await p.evaluate(()=>document.getElementById('status').textContent));
await p.tap('#v-sofa [data-cz="nap"]');for(let i=0;i<60;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>C.st=='sleep'))break}
console.log('1. lit',await p.evaluate(()=>[C.st,curV]),await lab());await p.tap('#v-sofa [data-cz="nap"]');await p.waitForTimeout(200);console.log('2. réveil',await p.evaluate(()=>C.st),await lab());
// fauteuil : s'asseoir ok, sieste -> lit (pas de canapé long)
await p.evaluate(()=>{N.coins=500;buy(SHOP.findIndex(s=>s.n=='Fauteuil'));goCosy(N.furn.find(f=>f.n=='Fauteuil'),'sit')});for(let i=0;i<60;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>C.st=='sofa'&&C.ca=='sit'))break}
console.log('3. fauteuil',await p.evaluate(()=>[C.st,C.ca,spName,VT.sofa]));
await p.screenshot({path:'fauteuil.png'});
await p.tap('#v-sofa [data-cz="nap"]');for(let i=0;i<60;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>C.st=='sleep'))break}console.log('4. sieste depuis fauteuil',await p.evaluate(()=>C.st));
// vue de dos
await p.evaluate(()=>{if(C.st=='sleep')toggleSleep();N.coins=500;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(f=>f.n=='Canapé cosy');f.r=2;bgKey='';C.st='sofa';C.seat=f;C._czs=f;C.ca='sit';C.cat=0});await p.waitForTimeout(200);console.log('5. de dos',await p.evaluate(()=>spName));
await p.evaluate(()=>czNap());await p.waitForTimeout(1500);console.log('   sieste de dos',await p.evaluate(()=>[C.ca,spName]));
console.log('err',errs);await b.close()})();
