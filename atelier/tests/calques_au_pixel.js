const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(process.argv[2]||JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length&&Object.keys(WLAY.teeb||{}).length>=130,null,{timeout:90000});
const r=await p.evaluate(()=>{let n=0,bad=0,outside=0,holes=0;const per=[];
 for(const key of Object.keys(WLAY.teeb)){const left=key.endsWith('<'),nm=left?key.slice(0,-1):key;const g=nm.startsWith('F_')?'f':'m';
  const L0=JSON.parse(JSON.stringify(N.look));L0.g=g;L0.wd={cheveux:'nat|0'};wSync(L0);if(left)L0.lf=1;const L1=JSON.parse(JSON.stringify(L0));wEquip(L1,'teeb',0);if(left)L1.lf=1;
  const a=recolor(SPR[nm],L0,nm).data,c=recolor(SPR[nm],L1,nm).data,ly=WLAY.teeb[key],base=SPR[nm].d.data;n++;
  const inL=new Uint8Array(CW*CH);for(let j=0;j<ly.h;j++)for(let i=0;i<ly.w;i++){const s=(j*ly.w+i)*4;if(ly.d[s+3]<128)continue;const q=(ly.y+j)*CW+ly.x+i;inL[q]=1;if(!base[q*4+3])outside++;const t=q*4;if(c[t]!=ly.d[s]||c[t+1]!=ly.d[s+1]||c[t+2]!=ly.d[s+2]||c[t+3]!=255)bad++}
  for(let q=0;q<CW*CH;q++){const t=q*4;if((a[t]!=c[t]||a[t+1]!=c[t+1]||a[t+2]!=c[t+2]||a[t+3]!=c[t+3])&&!inL[q])bad++;if(a[t+3]!=c[t+3])holes++}}
 return{n,bad,outside,holes}});
console.log(JSON.stringify(r),'ERR',errs);await b.close()})();
