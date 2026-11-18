const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2000);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1200);
await p.evaluate(()=>{tod=0;['roll|0','manteau|0','jean|1','bottine|0','echarpe|0','bonnet|1'].forEach(s=>{const[a,c]=s.split('|');N.wd2.own[a]=1;wEquip(N.look,a,+c)});spKey='';goto(14*12,88+12*5)});
await p.waitForTimeout(700);await p.screenshot({path:'game1.png',clip:{x:60,y:120,width:270,height:200}});
console.log(errs);await b.close()})();
