const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
const p=await ctx.newPage();p.on('console',m=>console.log('C',m.text()));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForTimeout(1500);
await p.evaluate(()=>{for(const t of ['pointerdown','pointermove','pointerup','pointercancel','touchstart'])window.addEventListener(t,e=>{if(e.type!='pointermove'||Math.random()<.2)console.log(e.type,e.pointerType,e.pointerId,e.target.id||e.target.tagName,Math.round(e.clientX),ZM.pts.size,!!ZM.pin,e.isTrusted)},true)});
const cdp=await ctx.newCDPSession(p);
const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
const cx=195,cy=300;
await T('touchStart',[[cx-30,cy],[cx+30,cy]]);for(let i=1;i<=6;i++){await T('touchMove',[[cx-30-i*12,cy],[cx+30+i*12,cy]]);await p.waitForTimeout(16)}await T('touchEnd',[]);await p.waitForTimeout(700);
console.log(await p.evaluate(()=>ZM.tz));await b.close()})();
