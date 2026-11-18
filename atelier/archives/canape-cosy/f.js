const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.look.g='f';N.coins=900;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;f.k=2;f.pk=6;bgKey='';C.x=8*12;C.y=88+12*5;goCosy(f,'sit')});
for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st=='sofa'))break}
const shot=async n=>{const r=await p.evaluate(()=>{const f=N.furn.find(czIs);isoSetup();const rb=RC.getBoundingClientRect(),c=P3(f.x+f.w/2,f.y+f.h/2,10);return{x:rb.left+c[0]/LW*rb.width,y:rb.top+c[1]/LH*rb.height}});await p.screenshot({path:n,clip:{x:r.x-80,y:r.y-80,width:160,height:120}})};
await shot('f1.png');await p.evaluate(()=>czPose('relax'));await p.waitForTimeout(200);await shot('f2.png');await p.evaluate(()=>czPose('nap'));await p.waitForTimeout(200);await shot('f3.png');
// tourner le canapé pendant qu'elle est assise
await p.evaluate(()=>{czPose('sit');show('deco');sel=draft.findIndex(czIs);planDraw()});await p.tap('#czBar [data-c="rot"]');await p.tap('#czBar [data-c="ok"]');await p.waitForTimeout(300);
console.log('relink',await p.evaluate(()=>[C.st,C.seat===N.furn.find(czIs),C.seat.r,(C.x/12).toFixed(1),((C.y-88)/5).toFixed(1),walkable(C.x/12,(C.y-88)/5)]));await shot('f4.png');
console.log(errs);await b.close()})();
