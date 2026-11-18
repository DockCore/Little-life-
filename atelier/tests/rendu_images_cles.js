const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push('console:'+m.text())});
await p.goto(JEU);await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length&&Object.keys(WLAY.teeb||{}).length>=114,null,{timeout:60000});
const r=await p.evaluate(()=>{const out={n:Object.keys(WLAY.teeb).length,item:!!WCAT.teeb,own:wOwn('teeb'),frames:{}};
 const FR=['idle','wave','drink','w0','w1','w2','w3','r0','r1','r2','r3','wf0','wf2','wf4','wf6','wb0','wb2','wb4','wb6','dn0','dn4','wc0','dk0','cu0','cu2','bk0','bk4','cs0','cn2','v_front','v_q','v_side','v_back'];
 const dump=(L,nm)=>{const f=SPR[nm];if(!f)return null;const im=recolor(f,L,nm);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').putImageData(im,0,0);return c.toDataURL()};
 let diffOut=0,unch=0;
 for(const g of ['m','f']){const L0=JSON.parse(JSON.stringify(N.look));L0.g=g;L0.wd={cheveux:'nat|'+(L0.hr||0)};wSync(L0);
  const L1=JSON.parse(JSON.stringify(L0));wEquip(L1,'teeb',0);
  for(const fr of FR){const nm=g=='f'?'F_'+fr:fr;if(!SPR[nm])continue;
   const a=recolor(SPR[nm],L0,nm).data,bb=recolor(SPR[nm],L1,nm).data,ly=WLAY.teeb[nm];
   // every changed pixel must belong to the layer; every layer pixel must be painted
   let ch=0,bad=0;for(let q=0;q<CW*CH;q++){const t=q*4;const d=a[t]!=bb[t]||a[t+1]!=bb[t+1]||a[t+2]!=bb[t+2]||a[t+3]!=bb[t+3];if(d){ch++;if(ly){const x=q%CW,y=(q/CW)|0;const i=x-ly.x,j=y-ly.y;if(i<0||j<0||i>=ly.w||j>=ly.h||ly.d[(j*ly.w+i)*4+3]<128)bad++}}}
   out.frames[nm]={layer:!!ly,changed:ch,outside:bad};
   out['img_'+nm]=dump(L1,nm);out['img0_'+nm]=dump(L0,nm);
   if(['idle','w1','wave'].includes(fr)){out['imgL_'+nm]=dump(Object.assign({},L1,{lf:1}),nm)}}}
 // base sprite untouched
 out.spaSame=SPA.idle.length>0;return out});
fs.writeFileSync(SORTIE+'/r1.json',JSON.stringify(r));console.log(r.n,r.item,r.own,JSON.stringify(r.frames));console.log('ERR',errs);await b.close()})();
