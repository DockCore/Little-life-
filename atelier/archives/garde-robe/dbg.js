const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>{const G=wGeo('F_v_front');const midY=(G.hy0+G.hy1)/2;return JSON.stringify({hx0:G.hx0,hx1:G.hx1,hy0:G.hy0,hy1:G.hy1,ny:G.ny,midY,hL:[...G.hL].slice(G.hy0,G.hy1+1),hR:[...G.hR].slice(G.hy0,G.hy1+1),side:G.side,back:G.back})}));
await b.close()})();
