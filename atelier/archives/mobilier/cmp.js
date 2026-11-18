const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const v of ['old','new']){const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto('file:///tmp/fd/'+v+'.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1200);
await p.evaluate(()=>{tod=0;N.coins=5000;['Lampe','Pouf','Bibliothèque','Canapé','Télé','Aquarium','Miroir'].forEach(n=>placeItem(SHOP.find(s=>s.n==n)));C.x=19*12;C.y=88+18*5;C.st='idle';C.idle=1e9;tick=0;bgKey='';bub.hidden=true;document.getElementById('status').textContent=''});
await p.waitForTimeout(500);await p.evaluate(()=>{window.__t=tick});await p.screenshot({path:v+'_home.png',clip:{x:0,y:40,width:390,height:290}});await ctx.close()}
await b.close()})();
