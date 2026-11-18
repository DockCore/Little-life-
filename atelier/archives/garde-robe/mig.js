const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2000);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1000);
await p.evaluate(()=>{delete N.look.wd;delete N.wd2;delete N.outf2;N.ward={tee:1,pant:1,mont:1,casq:1};Object.assign(N.look,{top:'t',tco:4,nop:0,pn:1,nos:0,shm:1,sz:1,hat:'casq',hac:2,ve:0});N.outf=[{ve:0,top:'t',tco:1,nop:0,pn:0,nos:0},null,null];window.__wipe=false;const j=JSON.stringify({N,tod});localStorage.setItem(KEY,j);localStorage.setItem(KEYB,j)});
await p.reload();await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>JSON.stringify([N.look.wd,N.wd2.own,N.outf2,dressedOK(N.look)])));console.log(errs);await b.close()})();
