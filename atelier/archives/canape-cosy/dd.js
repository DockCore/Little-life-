const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.coins=900;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;bgKey='';save();show('deco')});await p.waitForTimeout(300);
const a=await p.evaluate(()=>{isoSetup();const rb=RC.getBoundingClientRect(),q=P3(8.5,9,12);return[rb.left+q[0]/LW*rb.width,rb.top+q[1]/LH*rb.height]});
console.log(a,await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e.id||e.className||e.tagName},a),await p.evaluate(()=>[curV,place,!!draft,draft.findIndex(czIs),JSON.stringify(draft.find(czIs))]));
const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a[0],y:a[1],id:0}]});await p.waitForTimeout(50);console.log(await p.evaluate(()=>[sel,draft[sel].n,JSON.stringify(czGrab)]));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await b.close()})();
