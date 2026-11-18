const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);const fs=require('fs');
const URL=process.argv[2]||JEU;
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n').slice(0,3).join(' | ')));
await p.goto(URL);await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length&&Object.keys(WLAY.teeb||{}).length>=130,null,{timeout:90000});
// helper installed in page: capture the frame currently drawn + verify the layer is exactly present
await p.evaluate(()=>{window.SEEN={};window.cap=(tag)=>{const nm=(N.look.g=='f'&&SPR['F_'+spName]?'F_':'')+spName;const lk=JSON.parse(spKey.slice(spName.length)||'{}');const key=tag+'|'+nm+(lk.lf?'<':'');
  if(SEEN[key])return;const LS=WLAY.teeb,ly=(lk.lf&&LS[nm+'<'])||LS[nm];let bad=0,tot=0;
  if(ly&&lk.wd&&String(lk.wd.haut).startsWith('teeb')){const im=recolor(SPR[nm],lk,nm).data;for(let j=0;j<ly.h;j++)for(let i=0;i<ly.w;i++){const s=(j*ly.w+i)*4;if(ly.d[s+3]<128)continue;tot++;const t=((ly.y+j)*CW+ly.x+i)*4;if(im[t]!=ly.d[s]||im[t+1]!=ly.d[s+1]||im[t+2]!=ly.d[s+2]||im[t+3]!=255)bad++}}
  SEEN[key]={nm,lf:!!lk.lf,fl:SP.fl,layer:!!ly,tot,bad,img:sc2.toDataURL()}}});
const tick=async(tag,n=24,dt=90)=>{for(let i=0;i<n;i++){await p.waitForTimeout(dt);await p.evaluate(t=>cap(t),tag)}};
async function suite(g){
 await p.evaluate(g=>{N.look.g=g;wEquip(N.look,'teeb',0);spKey='';save();tod=0;C.x=200;C.y=130;C.st='idle'},g);await p.waitForTimeout(300);
 for(const[d,dx,dy] of [['droite',90,0],['gauche',-90,0],['haut',-72,-30],['bas',72,30]]){await p.evaluate(([dx,dy])=>{C.st='idle';goto(C.x+dx,C.y+dy)},[dx,dy]);await tick(g+'_marche_'+d,14,100)}
 for(const k of ['run','bike','cu']){await p.evaluate(k=>{C.st='gym';C.gk=k;C.gi=Math.max(0,GYMS.findIndex(m=>m.k==k));C.gt=1e9;C.t=0},k);await tick(g+'_gym_'+k,26,90)}
 await p.evaluate(()=>{C.st='idle';C.gt=0});
 await p.evaluate(()=>{C.st='joy'});await tick(g+'_saluer',14,100);
 await p.evaluate(()=>{C.st='coffee';C.ct=0});await tick(g+'_boire',20,100);
 for(const ph of ['sit','reach','eat','drink','end']){await p.evaluate(ph=>{C.st='dine';C.seq=[[ph,40]];C.dq=0;C.dt=20},ph);await tick(g+'_repas',6,90)}
 await p.evaluate(()=>{C.st='work'});await tick(g+'_bureau',14,100);
 await p.evaluate(()=>{C.st='idle';C.seq=null});
 // canapé cosy dans les 4 orientations : assis puis sieste
 for(const r of [0,1,2,3]){await p.evaluate(r=>{C.st='idle';C.seq=null;let f=N.furn.find(f=>f.n=='Canapé cosy');if(!f){f={n:'Canapé cosy',x:6,y:6,w:5,h:2,r:0};fNew(f);N.furn.push(f)}f.r=r;C.x=f.x*12;C.y=88+f.y*5;goCosy(f,'sit')},r);await tick(g+'_canape_r'+r+'_assis',30,110);
  await p.evaluate(()=>{if(C.st=='sofa')czStartNap()});await tick(g+'_canape_r'+r+'_sieste',20,110);await p.evaluate(()=>{try{czUp()}catch(e){}});await tick(g+'_canape_r'+r+'_lever',12,90)}
 await p.evaluate(()=>{C.st='idle'});
}
const out={};
await suite('m');await suite('f');
// retrait / remise / remplacement
out.swap=await p.evaluate(()=>{const r=[];N.look.g='m';wRemove(N.look,'haut');r.push(N.look.wd.haut);wEquip(N.look,'teeb',0);r.push(N.look.wd.haut);wEquip(N.look,'pull',0);r.push(N.look.wd.haut);
  const L1=JSON.parse(JSON.stringify(N.look));const im=recolor(SPR.idle,L1,'idle').data;const ly=WLAY.teeb.idle;let same=0;for(let j=0;j<ly.h;j++)for(let i=0;i<ly.w;i++){const s=(j*ly.w+i)*4;if(ly.d[s+3]<128)continue;const t=((ly.y+j)*CW+ly.x+i)*4;if(im[t]==ly.d[s]&&im[t+1]==ly.d[s+1]&&im[t+2]==ly.d[s+2])same++}
  r.push('pixels du t-shirt encore visibles sous le pull: '+same);wEquip(N.look,'teeb',0);r.push(N.look.wd.haut);save();return r});
const S=await p.evaluate(()=>{return window.SEEN||{}});
await p.reload();await p.waitForTimeout(3000);
out.reload=await p.evaluate(()=>N.look.wd.haut);
fs.writeFileSync(SORTIE+'/r4.json',JSON.stringify(S));
const seen=JSON.parse(fs.readFileSync(SORTIE+'/r4.json'));
const tags={};for(const k in seen){const[t]=k.split('|');(tags[t]=tags[t]||[]).push(seen[k].nm+(seen[k].lf?'<':'')+(seen[k].layer?'':'(auto)')+(seen[k].bad?'!BAD'+seen[k].bad:''))}
for(const t in tags)console.log(t.padEnd(26),tags[t].join(' '));
console.log('swap',out.swap,'reload',out.reload);console.log('ERR',errs);await b.close()})();
