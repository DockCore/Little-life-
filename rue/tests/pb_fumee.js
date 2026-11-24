const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [t,vp,dpr] of [['tel',{width:390,height:844},3],['pc',{width:1280,height:800},1]]){
const p=await (await b.newContext({viewport:vp,deviceScaleFactor:dpr})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await p.goto(JEU);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(500);
await E(()=>{streetEnter();GAMES.arcade.open({x:500});ARC.sel=ARC.games.findIndex(g=>g.id=='pinball');arcOk();arcOk();ARC.modules.pinball._state.mute=true});await W(600);await p.screenshot({path:`${O}/pb_${t}_0intro.png`});
await p.keyboard.press('Enter');await W(300);await p.keyboard.down('Space');await W(500);await p.keyboard.up('Space');
for(let i=0;i<30;i++){await W(150);const st=await E(()=>{const P=ARC.modules.pinball._state;return P.ball&&P.ball.y});if(st>300){await p.keyboard.down('ArrowLeft');await p.keyboard.down('ArrowRight');await W(120);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}}
await p.screenshot({path:`${O}/pb_${t}_1jeu.png`});
console.log(t,errs,await E(()=>{const P=ARC.modules.pinball._state;return{ph:P.phase,score:P.score,balls:P.balls,ball:P.ball&&[Math.round(P.ball.x),Math.round(P.ball.y),P.ball.st],L:{k:P.L.k,land:P.L.land}}}))}
await b.close()})();
