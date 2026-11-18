const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2500);
const d=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=80*6;c.height=128;const x=c.getContext('2d');x.fillStyle='#d9c2a0';x.fillRect(0,0,c.width,c.height);
 const sets=[['F','nat'],['F','long'],['M','mi'],['F','tails'],['F','bun'],['M','top']];
 sets.forEach(([g,h],i)=>{const L=Object.assign({},N.look,{g:g=='F'?'f':'m',wd:{cheveux:'nat|0'}});wEquip(L,'tee',3);wEquip(L,'jean',0);wEquip(L,h,0);drawFrame('idle',L);x.drawImage(sc2,i*80,0)});return c.toDataURL()});
require('fs').writeFileSync('h.png',Buffer.from(d.split(',')[1],'base64'));await b.close()})();
