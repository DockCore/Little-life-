const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1200);
await p.evaluate(()=>{tod=0;show('deco');sel=draft.findIndex(f=>f.n=='Table');planDraw()});await p.tap('#czBar [data-c="parts"]');await p.tap('#czOpt [data-part="2"]');await p.waitForTimeout(200);await p.screenshot({path:'deco_table.png'});
await p.evaluate(()=>{show('home');leaveTo('store')});await p.waitForTimeout(9000);console.log(await p.evaluate(()=>[place,curV,ttl.textContent,document.getElementById('status').textContent]));await p.screenshot({path:'store.png'});
console.log(errs);await b.close()})();
