const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>JSON.stringify(HF().find(f=>f.n=='Lit'))));await b.close()})();
