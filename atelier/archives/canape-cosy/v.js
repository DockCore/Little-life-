const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text())});
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.coins=900;N.look=Object.assign(N.look,{top:'t',tco:2,nop:0});buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));});await p.waitForTimeout(500);
console.log(await p.evaluate(()=>JSON.stringify(N.furn.find(czIs))));
const shot=async(name)=>{const r=await p.evaluate(()=>{const f=N.furn.find(czIs);isoSetup();const rb=RC.getBoundingClientRect(),c=P3(f.x+f.w/2,f.y+f.h/2,10);return{x:rb.left+c[0]/LW*rb.width,y:rb.top+c[1]/LH*rb.height,s:rb.width/LW}});
 await p.screenshot({path:name,clip:{x:Math.max(0,r.x-110),y:Math.max(0,r.y-110),width:220,height:170}})};
for(const rr of [0,1,2,3]){await p.evaluate(rr=>{const f=N.furn.find(czIs);const sw=(f.r%2)!=(rr%2);if(sw){[f.w,f.h]=[f.h,f.w]}f.r=rr;f.x=6;f.y=6;C.st='idle';C.rise=null;C._czs=null;C.x=10*12;C.y=88+15*5;bgKey=''},rr);await p.waitForTimeout(200);await shot('r'+rr+'.png');
 for(const sp of ['sit','look','relax','nap']){await p.evaluate(sp=>{const f=N.furn.find(czIs);C.st='sofa';C.seat=f;C.sp=sp;C._czs=f;C.t=sp=='look'?130:0},sp);await p.waitForTimeout(150);await shot('r'+rr+'_'+sp+'.png')}}
console.log('err',errs);await b.close()})();
