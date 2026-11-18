const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);const crypto=require('crypto');
async function run(url){const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length,null,{timeout:90000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const outs={};const FR=Object.keys(SPR).filter(k=>!k.startsWith('F_')&&!/^(si|dc|tl|s\d|tb_)/.test(k));
 const looks=[['tee|3','jean|0','basket|1'],['pull|2','chino|1','bottine|0','echarpe|0'],['shirt|0','jean|2','manteau|1'],['robe1|0'],['hoodie|1','jogg|0'],['mari|0','short|0']];
 for(const g of ['m','f'])for(const [i,lk] of looks.entries()){const L=JSON.parse(JSON.stringify(N.look));L.g=g;L.wd={cheveux:'nat|1'};wSync(L);lk.forEach(s=>{const[a,c]=s.split('|');if(WCAT[a])wEquip(L,a,+c)});if(g=='f'&&WCAT.long)wEquip(L,'long',2);
  for(const fr of FR){const nm=g=='f'&&SPR['F_'+fr]?'F_'+fr:fr;const d=recolor(SPR[nm],L,nm).data;let h=0;for(let q=0;q<d.length;q+=1)h=(h*31+d[q])|0;outs[g+i+'|'+nm]=h}}
 return outs});
await b.close();return[r,errs]}
(async()=>{const[a,ea]=await run('file://'+path.resolve(process.argv[2]||'ancien.html'));const[b,eb]=await run(JEU);
let same=0,diff=[];for(const k in a){if(a[k]===b[k])same++;else diff.push(k)}console.log('identiques',same,'différents',diff.length,diff.slice(0,20),'err',ea,eb)})();
