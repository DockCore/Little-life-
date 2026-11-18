const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(1800);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForTimeout(3000);await p.evaluate(()=>{tod=0;bub.hidden=true;C.st='idle';C.path=null});
const cdp=await ctx.newCDPSession(p);
const tap=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});await p.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
const scr=(u,v,dz=0)=>p.evaluate(([u,v,dz])=>{isoSetup();const rb=RC.getBoundingClientRect();return{x:rb.left+IX(u,v)/LW*rb.width,y:rb.top+(IY(u,v)+dz)/LH*rb.height}},[u,v,dz]);
// boutons depuis 1
await p.tap('#zmBtn');const v=[];for(const id of ['#zmIn','#zmIn','#zmIn','#zmIn','#zmOut','#zmRst']){await p.tap(id);await p.waitForTimeout(450);v.push(id.slice(3)+':'+(await p.evaluate(()=>ZM.tz.toFixed(2))))}console.log('boutons',v.join(' '));
// zoom centré sur le perso
await p.evaluate(()=>{isoSetup();const cu=C.x/12,cv=(C.y-88)/5,s=RC.offsetWidth/LW;zmTo(2.2,IX(cu,cv)*s,IY(cu,cv)*RC.offsetHeight/LH)});await p.waitForTimeout(900);
const c=await p.evaluate(()=>[C.x/12,(C.y-88)/5]);const pt=await scr(c[0],c[1],-22);
await p.evaluate(()=>{window._f=fx.length;bub.hidden=true});await tap(pt.x,pt.y);await p.waitForTimeout(250);
console.log('appui perso zoomé ×',await p.evaluate(()=>ZM.tz.toFixed(2)),await p.evaluate(()=>({etat:C.st,coeurs:fx.length>window._f,bulle:!bub.hidden,txt:bub.textContent})));
console.log('bulle/tête',await p.evaluate(()=>{const r=bub.getBoundingClientRect(),rb=RC.getBoundingClientRect();return{bulle:Math.round(r.left+r.width/2),tete:Math.round(rb.left+HEAD[0]/LW*rb.width),bas:Math.round(r.bottom),haut:Math.round(rb.top+HEAD[1]/LH*rb.height)}}));
await p.screenshot({path:'z3.png'});
// appui sur le lit zoomé
await p.waitForTimeout(2500);await p.evaluate(()=>{C.st='idle';C.path=null;bub.hidden=true});
const bed=await p.evaluate(()=>{const f=HF().find(f=>f.n=='Lit');return f?[f.x+f.w/2,f.y+f.h/2,f.n]:null});console.log('lit',bed);
if(bed){await p.evaluate(([u,v])=>{isoSetup();zmTo(1.9,IX(u,v)*RC.offsetWidth/LW,IY(u,v)*RC.offsetHeight/LH)},bed);await p.waitForTimeout(900);const q=await scr(bed[0],bed[1],-6);
 await tap(q.x,q.y);await p.waitForTimeout(400);console.log('appui lit zoomé ->',await p.evaluate(()=>({etat:C.st,cible:C.path&&C.path.length?C.path[C.path.length-1].map(n=>+n.toFixed(1)):null,statut:document.getElementById('status').textContent})))}
// habillage / création : zoom désactivé
await p.evaluate(()=>{zmTo(2)});await p.waitForTimeout(500);
console.log('loupe visible',await p.evaluate(()=>!document.getElementById('zmUI').hidden),'| bas loupe',await p.evaluate(()=>Math.round(document.getElementById('zmUI').getBoundingClientRect().bottom)),'| haut panneau',await p.evaluate(()=>Math.round(document.querySelector('.frame.low').getBoundingClientRect().top)));
await p.evaluate(()=>{dressing=true});await p.waitForTimeout(300);console.log('habillage : zoom',await p.evaluate(()=>[ZM.tz,document.getElementById('zmUI').hidden,RC.style.transform||'aucune']));await p.evaluate(()=>{dressing=false});
console.log('erreurs',errs);await b.close()})();
