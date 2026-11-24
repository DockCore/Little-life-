const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const vp=process.argv[2]=='pc'?{width:1280,height:800}:{width:390,height:844};
const ctx=await b.newContext({viewport:vp,deviceScaleFactor:process.argv[2]=='pc'?1:2,hasTouch:process.argv[2]!='pc'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(JEU);await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForTimeout(800);
await p.evaluate(()=>{tod=0;place='home';streetEnter()});await p.waitForTimeout(500);
const tag=process.argv[2]||'tel';
for(const [k,x,t] of await p.evaluate(()=>[...STC.buildings.map(b=>[b.id,b.x+b.door.x,0]),['chantier',STC.maxX,0],['nuit_bowling',STC.buildings[1].x+STC.buildings[1].door.x,.5],['nuit_chantier',STC.maxX,.5],['nuit_cinema',STC.buildings[3].x+40,.5]])){
 await p.evaluate(([x,t])=>{tod=t;night=.5-.5*Math.cos(tod*6.2832);STV.px=x;STV.cam=Math.max(0,Math.min(STC.len-STV.W,x-STV.W*.4))},[x,t]);await p.waitForTimeout(400);
 await p.screenshot({path:`${O}/${tag}_${k}.png`,clip:await p.evaluate(()=>{const r=document.getElementById('street').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:Math.min(r.height+120,innerHeight-r.y)}})});}
console.log('ERR',errs);await b.close()})();
