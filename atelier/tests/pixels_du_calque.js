const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(JEU);await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length&&Object.keys(WLAY.teeb||{}).length>=114,null,{timeout:60000});
const r=await p.evaluate(()=>{const L=JSON.parse(JSON.stringify(N.look));L.wd={cheveux:'nat|0'};wSync(L);wEquip(L,'teeb',0);const res={};
 for(const nm of ['w0','idle','wb0']){const ly=WLAY.teeb[nm];const im=recolor(SPR[nm],L,nm).data;let same=0,diff=0;
  for(let j=0;j<ly.h;j++)for(let i=0;i<ly.w;i++){const s=(j*ly.w+i)*4;if(ly.d[s+3]<128)continue;const t=((ly.y+j)*CW+ly.x+i)*4;if(im[t]==ly.d[s]&&im[t+1]==ly.d[s+1]&&im[t+2]==ly.d[s+2])same++;else diff++}
  res[nm]={same,diff}}return res});
console.log(JSON.stringify(r),errs);await b.close()})();
