const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [t,vp] of [['tel',{width:390,height:844}],['petit',{width:320,height:568}],['pc',{width:1280,height:800}],['tablette',{width:820,height:1180}]]){
const p=await (await b.newContext({viewport:vp,deviceScaleFactor:t=='pc'?1:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a);await p.goto(JEU);await p.waitForTimeout(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(500);
await E(()=>{streetEnter();const b=STC.buildings.find(q=>q.id=='arcade');STV.px=b.x+b.door.x;stInteract()});await p.waitForTimeout(600);
await E(()=>{arcMove('right');arcMove('down')});await p.waitForTimeout(400);await p.screenshot({path:`${O}/arc_${t}.png`});console.log(t,errs)}
await b.close()})();
