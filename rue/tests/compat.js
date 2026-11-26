const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
await p.goto(JEU);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await W(800);
// autres destinations inchangées
for(const d of ['office','pets']){await E(()=>goOut());await p.waitForFunction(()=>curV=='out',null,{timeout:20000});await p.click(`#v-out [data-go="${d}"]`);
 await p.waitForFunction(d=>place==d&&C.st!='enter'&&C.st!='trip',d,{timeout:30000});const v=await E(()=>curV);
 await E(()=>goHome());await p.waitForFunction(()=>curV=='out'||place=='home',null,{timeout:30000});const v2=await E(()=>curV);
 if(v2=='out'){await p.click('#v-out [data-go="home"]')}await p.waitForFunction(()=>place=='home'&&curV=='home',null,{timeout:30000});console.log(d,'->',v,'retour via',v2,'OK street?',await E(()=>STV.on))}
// séjour prolongé dans la rue, besoins bas, nuit
await E(()=>streetEnter());await E(()=>{for(const k in N.needs||{})N.needs[k]=5});
for(let i=0;i<6;i++){await W(4000);await E(()=>{tod=(tod+.1)%1})}
console.log('après 24 s :',await E(()=>({st:C.st,place,v:curV,on:STV.on})));
console.log('ERR',errs);await b.close()})();
