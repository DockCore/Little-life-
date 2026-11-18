const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
const set=async(alt)=>{await p.evaluate(alt=>{tod=0;C.x=19*12;C.y=88+18*5;C.st='idle';C.idle=1e9;
 const mk=(n,x,y,r,cl)=>{const d=FD[n],sw=r%2;const f={n,w:sw?d.h:d.w,h:sw?d.w:d.h,x,y,r,c:d.c,s:d.s===0?0:1,id:fNewId()};if(cl)Object.keys(cl).forEach(k=>fSet(f,k,cl[k]));return f};
 const A=alt?{Fauteuil:{t:3,p:3},Chaise:{a:2,s:5},Commode:{b:4,f:6,h:2},Armoire:{b:3,f:3,h:2},'Table de chevet':{b:5,f:2,h:3}}:{};
 N.furn=[mk('Fauteuil',1,1,0,A.Fauteuil),mk('Fauteuil',4,1,1,A.Fauteuil),mk('Fauteuil',7,1,2,A.Fauteuil),mk('Fauteuil',10,1,3,A.Fauteuil),
  mk('Chaise',14,1,0,A.Chaise),mk('Chaise',16,1,1,A.Chaise),mk('Chaise',14,3,2,A.Chaise),mk('Chaise',16,3,3,A.Chaise),
  mk('Commode',1,6,0,A.Commode),mk('Commode',4,6,1,A.Commode),mk('Commode',7,6,2,A.Commode),mk('Commode',10,6,3,A.Commode),
  mk('Armoire',1,11,0,A.Armoire),mk('Armoire',4,11,1,A.Armoire),mk('Armoire',7,11,2,A.Armoire),mk('Armoire',10,11,3,A.Armoire),
  mk('Table de chevet',14,8,0,A['Table de chevet']),mk('Table de chevet',16,8,1,A['Table de chevet']),mk('Table de chevet',14,10,2,A['Table de chevet']),mk('Table de chevet',16,10,3,A['Table de chevet'])];bgKey=''},alt);await p.waitForTimeout(400)};
await set(false);await p.screenshot({path:'all0.png',clip:{x:0,y:40,width:390,height:300}});
await set(true);await p.screenshot({path:'all1.png',clip:{x:0,y:40,width:390,height:300}});
console.log(errs);await b.close()})();
