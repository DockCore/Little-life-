const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1200);
await p.evaluate(()=>{tod=0;N.coins=5000;['Lampe','Pouf','Bibliothèque','Canapé','Télé','Aquarium','Miroir'].forEach(n=>placeItem(SHOP.find(s=>s.n==n)));C.x=19*12;C.y=88+18*5;C.st='idle';C.idle=1e9;
 const S={Lit:{s:3,l:6},Bureau:{b:4,c:5},Table:{p:4,a:6,f:2},Tapis:{f:2,m:3,a:7},Plante:{p:3},Lampe:{a:4,p:2},Pouf:{t:4},'Bibliothèque':{b:3},'Canapé':{t:6},'Télé':{m:2},Aquarium:{m:4},Miroir:{c:2}};
 N.furn.forEach(f=>{const c=S[f.n];if(c)Object.keys(c).forEach(k=>fSet(f,k,c[k]))});bgKey='';bub.hidden=true});
await p.waitForTimeout(500);await p.screenshot({path:'alt_home.png',clip:{x:0,y:40,width:390,height:290}});
const res=[];for(const m of [0,1,2,3,4]){await p.evaluate(m=>{const t=N.furn.find(f=>f.n=='Tapis');fSet(t,'m',m);bgKey=''},m);await p.waitForTimeout(200);const r=await p.evaluate(()=>{const t=N.furn.find(f=>f.n=='Tapis');isoSetup();const rb=RC.getBoundingClientRect(),c=P3(t.x+t.w/2,t.y+t.h/2,0);return{x:rb.left+c[0]/LW*rb.width,y:rb.top+c[1]/LH*rb.height}});await p.screenshot({path:'rug'+m+'.png',clip:{x:r.x-70,y:r.y-45,width:140,height:90}})}
console.log(errs);await b.close()})();
