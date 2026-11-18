const path=require('path');const PW=process.env.PLAYWRIGHT||'/home/claude/.npm-global/lib/node_modules/playwright';const CHROME=process.env.CHROME||'/usr/bin/google-chrome';const JEU='file://'+path.resolve(__dirname,'../../index.html');const SORTIE=path.resolve(__dirname,'../sorties/tests');require('fs').mkdirSync(SORTIE,{recursive:true});
const {chromium}=require(PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(JEU);await p.waitForTimeout(2500);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});
await p.waitForFunction(()=>Object.keys(FGAR).length>=Object.keys(SPF).length&&Object.keys(WLAY.teeb||{}).length>=114,null,{timeout:60000});
const out={};
async function walk(tag,dx,dy){await p.evaluate(([dx,dy])=>{tod=0;C.st='idle';goto(C.x+dx,C.y+dy)},[dx,dy]);const fr=[];
 for(let i=0;i<14;i++){await p.waitForTimeout(110);fr.push(await p.evaluate(()=>({n:spName,fl:SP.fl,lf:!!(JSON.parse(spKey.slice(spName.length)||'{}').lf),img:sc2.toDataURL()})))}out[tag]=fr}
async function round(g){
 await p.evaluate(g=>{N.look.g=g;wEquip(N.look,'teeb',0);spKey='';save();tod=0;C.x=200;C.y=130;C.st='idle'},g);await p.waitForTimeout(400);
 await walk(g+'_droite',90,0);await walk(g+'_gauche',-90,0);await walk(g+'_haut',-72,-30);await walk(g+'_bas',72,30);
 out[g+'_wd']=await p.evaluate(()=>N.look.wd.haut);
 await p.screenshot({path:SORTIE+'/jeu_'+g+'.png'});
 // retrait
 out[g+'_off']=await p.evaluate(()=>{wRemove(N.look,'haut');spKey='';spUpdate();const a=sc2.toDataURL();wEquip(N.look,'teeb',0);spKey='';spUpdate();return[a,sc2.toDataURL(),N.look.wd.haut]});
}
await round('m');await round('f');
// changement de haut : teeb -> pull -> teeb
out.swap=await p.evaluate(()=>{N.look.g='m';wEquip(N.look,'pull',0);const a=N.look.wd.haut;wEquip(N.look,'teeb',0);return[a,N.look.wd.haut]});
// garde-robe UI
await p.evaluate(()=>{show('dress')});await p.waitForTimeout(800);
out.ui=await p.evaluate(()=>{const cards=[...document.querySelectorAll('#drList *')].filter(e=>/T-shirt blanc/.test(e.textContent)&&e.children.length<6).map(e=>e.textContent.slice(0,60));return cards.slice(0,3)});
await p.screenshot({path:SORTIE+'/dressing.png'});
for(const v of [0,1,2,3]){await p.evaluate(v=>{wdView=v;spKey='';spUpdate()},v);await p.waitForTimeout(150);out['studio'+v]=await p.evaluate(()=>({n:spName,img:sc2.toDataURL()}))}
await p.evaluate(()=>{show('home');save()});
await p.reload();await p.waitForTimeout(3000);
out.reload=await p.evaluate(()=>({g:N.look.g,haut:N.look.wd&&N.look.wd.haut}));
fs.writeFileSync(SORTIE+'/r3.json',JSON.stringify(out));
for(const k in out)if(Array.isArray(out[k])&&out[k][0]&&out[k][0].n)console.log(k,out[k].map(f=>f.n+(f.fl?'<':'')).join(' '));
console.log('wd',out.m_wd,out.f_wd,'off',out.m_off[2],out.f_off[2],'swap',out.swap,'ui',out.ui,'reload',out.reload,'studio',[0,1,2,3].map(v=>out['studio'+v].n));
console.log('ERR',errs);await b.close()})();
