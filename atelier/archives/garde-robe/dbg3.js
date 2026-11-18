const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>{const G=wGeo('F_idle');let s='yb '+G.hy1+' ny '+G.ny+' hx '+G.hx0+'-'+G.hx1+'\n';for(let y=G.hy1-3;y<G.ny+15;y++){let r=y+' ';for(let x=15;x<65;x++){r+='.0123456789abcdef'[G.P[y*CW+x]+1]}s+=r+'  hL='+G.hL[y]+' hR='+G.hR[y]+'\n'}return s}));
await b.close()})();
