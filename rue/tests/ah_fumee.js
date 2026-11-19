const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [t,vp,dpr] of [['tel',{width:390,height:844},3],['pc',{width:1280,height:800},1]]){
const p=await (await b.newContext({viewport:vp,deviceScaleFactor:dpr})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);await p.goto(JEU);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(500);
await E(()=>{streetEnter();GAMES.arcade.open({x:500});ARC.sel=8;arcOk()});await W(400);await p.screenshot({path:`${O}/ah_${t}_0info.png`});
await E(()=>arcOk());await W(500);await p.screenshot({path:`${O}/ah_${t}_1choix.png`});
await E(()=>{const H=ARC.modules.hockey._state;H.ch=1;});await p.keyboard.press('Enter');await W(4200);await p.screenshot({path:`${O}/ah_${t}_2jeu.png`});
// la souris pousse le palet
const S=await E(()=>{const r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W,S=AX.L.scr;return{x:r.left+S.x*k,y:r.top+S.y*k,w:S.w*k,h:S.h*k}});
for(let i=0;i<40;i++){await p.mouse.move(S.x+S.w*(.3+.4*Math.random()),S.y+S.h*(.55+.4*Math.random()));await W(60)}
await p.screenshot({path:`${O}/ah_${t}_3action.png`});console.log(t,errs,await E(()=>{const H=ARC.modules.hockey._state;return{ph:H.phase,sc:H.sc,rot:H.rot,T:[H.T.TW,H.T.TH,H.T.rm,H.T.rp],hits:H.stats.hits}}))}
await b.close()})();
