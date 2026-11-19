const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [t,vp,dpr] of [['tel',{width:390,height:844},3],['petit',{width:320,height:568},2],['pc',{width:1280,height:800},1],['fullhd',{width:1920,height:1080},1],['tablette',{width:820,height:1180},2]]){
const p=await (await b.newContext({viewport:vp,deviceScaleFactor:dpr})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a);await p.goto(JEU);await p.waitForTimeout(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(500);
await E(()=>{streetEnter();GAMES.arcade.open({x:500})});await p.waitForTimeout(500);await E(()=>{arcMove('right');arcMove('down')});await p.waitForTimeout(500);await p.screenshot({path:`${O}/arc2_${t}_menu.png`});
await E(()=>arcOk());await p.waitForTimeout(700);await p.screenshot({path:`${O}/arc2_${t}_info.png`});
console.log(t,errs,await E(()=>({W:AX.L.W,H:AX.L.H,s:AX.L.s,g:[AX.L.grid.cols,AX.L.grid.rows,AX.L.grid.icon,AX.L.grid.tw,AX.L.grid.th]})))}
await b.close()})();
