const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
const p=await ctx.newPage();
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForTimeout(3000);await p.evaluate(()=>{tod=0;C.st='idle';C.path=null});
const cdp=await ctx.newCDPSession(p);
const q=await p.evaluate(()=>{isoSetup();const rb=RC.getBoundingClientRect();return{x:rb.left+IX(1.5,3)/LW*rb.width,y:rb.top+(IY(1.5,3)-6)/LH*rb.height}});
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:q.x,y:q.y,id:0}]});await p.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);
console.log('appui lit sans zoom ->',await p.evaluate(()=>({etat:C.st,cible:C.path&&C.path.length?C.path[C.path.length-1].map(n=>+n.toFixed(1)):null})));
await p.evaluate(()=>{isoSetup();zmTo(2.86,IX(9,8)*RC.offsetWidth/LW,IY(9,8)*RC.offsetHeight/LH)});await p.waitForTimeout(1000);await p.screenshot({path:'z4.png'});
await b.close()})();
