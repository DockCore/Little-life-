const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
await p.evaluate(()=>{tod=0;N.coins=900;N.energy=40;buy(SHOP.findIndex(s=>s.n=='Canapé cosy'));const f=N.furn.find(czIs);f.x=6;f.y=8;bgKey='';save()});
const cdp=await ctx.newCDPSession(p);const tap=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});await p.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
const scr=(u,v,z=0)=>p.evaluate(([u,v,z])=>{isoSetup();const rb=RC.getBoundingClientRect(),q=P3(u,v,z);return{x:rb.left+q[0]/LW*rb.width,y:rb.top+q[1]/LH*rb.height}},[u,v,z]);
// 1. toucher le canapé
let q=await scr(8.5,9,14);await tap(q.x,q.y);await p.waitForTimeout(300);console.log('1. vue',await p.evaluate(()=>[curV,C.st,document.getElementById('status').textContent]));
for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st=='sofa'))break}
console.log('   assis',await p.evaluate(()=>[C.st,C.sp,czIs(C.seat),[...document.querySelectorAll('#v-sofa [data-cz]')].map(b=>b.dataset.cz+(b.classList.contains('on')?'*':'')+(b.disabled?'(off)':'')).join(' ')]));
// 2. poses
for(const k of ['look','relax','nap']){await p.tap(`#v-sofa [data-cz="${k}"]`);await p.waitForTimeout(400);console.log('2.',k,await p.evaluate(()=>[C.sp,spName,document.getElementById('status').textContent]))}
const e0=await p.evaluate(()=>N.energy);await p.waitForTimeout(2000);console.log('   sieste énergie',e0.toFixed(1),'->',(await p.evaluate(()=>N.energy)).toFixed(1));
await p.screenshot({path:'nap.png'});
// 3. se lever : animation puis libre
await p.tap('#v-sofa [data-cz="up"]');const seq=[];for(let i=0;i<8;i++){seq.push(await p.evaluate(()=>[C.st,!!C.rise,spName].join('/')));await p.waitForTimeout(70)}console.log('3. se lever',seq.join(' '));
// 4. assis puis toucher le sol : se relève puis marche
await p.tap('#v-sofa [data-cz="sit"]');for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st=='sofa'))break}
const fl=await scr(14,15);await tap(fl.x,fl.y);const s2=[];for(let i=0;i<6;i++){s2.push(await p.evaluate(()=>[C.st,!!C.rise,(C.x/12).toFixed(2)].join('/')));await p.waitForTimeout(90)}console.log('4. sol',s2.join(' '));
// 5. contourner le canapé : chemin de l'autre côté
await p.waitForTimeout(3000);await p.evaluate(()=>{C.x=7*12;C.y=88+6.5*5;C.st='idle';C.path=null});const t5=await scr(8.5,11.6);await tap(t5.x,t5.y);await p.waitForTimeout(200);
const path=await p.evaluate(()=>(C.path||[]).map(q=>q.map(n=>+n.toFixed(1))));const f=await p.evaluate(()=>{const f=N.furn.find(czIs);return[f.x,f.y,f.w,f.h]});
console.log('5. chemin',JSON.stringify(path),'traverse ?',path.some(([u,v])=>u>f[0]&&u<f[0]+f[2]&&v>f[1]&&v<f[1]+f[3]));
for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st!='walk'))break}console.log('   arrivé',await p.evaluate(()=>[C.st,(C.x/12).toFixed(1),((C.y-88)/5).toFixed(1)]));
console.log('err',errs);await b.close()})();
