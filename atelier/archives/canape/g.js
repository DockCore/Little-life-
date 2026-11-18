const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>N.look)));
await p.evaluate(()=>{tod=0;N.coins=900;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;f.r=1;f.w=2;f.h=5;bgKey='';});
const shot=async(n)=>{const r=await p.evaluate(()=>{const f=N.furn.find(czIs);isoSetup();const rb=RC.getBoundingClientRect(),c=P3(f.x+f.w/2,f.y+f.h/2,10);return{x:rb.left+c[0]/LW*rb.width,y:rb.top+c[1]/LH*rb.height}});await p.screenshot({path:n,clip:{x:r.x-75,y:r.y-85,width:150,height:120}})};
const run=async(tag)=>{await p.evaluate(()=>{const f=N.furn.find(czIs);C.st='sofa';C.seat=f;C._czs=f;C.ca='in';C.cat=0;C.rise=null;C.wantUp=false;C.napNext=false});
 const seq=[];for(const t of [2,12,24,60]){await p.evaluate(t=>{C.cat=t},t);await p.waitForTimeout(80);await p.evaluate(()=>{C.cat=C.cat});seq.push(t)}
};
for(const look of [{},{top:'t',tco:4,nop:0,pn:1,ve:0,nos:0,sz:4}]){
 for(const g of ['m','f']){await p.evaluate(([look,g])=>{Object.assign(N.look,look,{g});spKey=''},[look,g]);
  for(const r of [1,0]){await p.evaluate(r=>{const f=N.furn.find(czIs);const sw=(f.r%2)!=(r%2);if(sw)[f.w,f.h]=[f.h,f.w];f.r=r},r);
   const states=[['in',2],['in',12],['in',24],['sit',0],['toNap',5],['toNap',18],['toNap',34],['nap',0]];
   for(const [ca,t] of states){await p.evaluate(([ca,t])=>{const f=N.furn.find(czIs);C.st='sofa';C.seat=f;C._czs=f;C.ca=ca;C.cat=t-1;C.rise=null;C.wantUp=false;C.napNext=false},[ca,t]);await p.waitForTimeout(60);await shot(`g_${JSON.stringify(look).length>2?'w':'u'}_${g}_${r}_${ca}${t}.png`)}}}}
console.log(errs);await b.close()})();
