const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2000);
await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(1500);
console.log('look',JSON.stringify(await p.evaluate(()=>[N.look.wd,N.wd2])));
await p.evaluate(()=>{tod=0;N.coins=400;show('dress')});await p.waitForTimeout(1500);await p.screenshot({path:'dress1.png'});
// porter le t-shirt offert, puis le jean
await p.evaluate(()=>{[...document.querySelectorAll('#drList .wdc')].find(d=>d.querySelector('b').textContent=='T-shirt').querySelector('button').click()});
await p.tap('#drSeg [data-t="bas"]');await p.evaluate(()=>{[...document.querySelectorAll('#drList .wdc')].find(d=>d.querySelector('b').textContent=='Jean').querySelector('button').click()});
await p.tap('#drSeg [data-t="chaussures"]');await p.evaluate(()=>{[...document.querySelectorAll('#drList .wdc')].find(d=>d.querySelector('b').textContent=='Baskets').querySelector('button').click()});
console.log('porté',JSON.stringify(await p.evaluate(()=>[N.look.wd,dressedOK(N.look),N.look.top,N.look.nop,N.look.nos])));
await p.tap('#wdRot');await p.waitForTimeout(400);await p.screenshot({path:'dress2.png'});
await p.tap('#drSeg [data-t="tenues"]');await p.waitForTimeout(300);await p.evaluate(()=>{document.querySelector('#drList .wdc button').click()});console.log('tenue',JSON.stringify(await p.evaluate(()=>N.outf2[0])));
await p.screenshot({path:'dress3.png'});
// magasin
await p.evaluate(()=>{show('home');place='clothes';show('clothes')});await p.waitForTimeout(800);await p.screenshot({path:'shop1.png'});
await p.evaluate(()=>{[...document.querySelectorAll('#clList .wdc')].find(d=>d.querySelector('b').textContent=='Pull').click()});await p.waitForTimeout(300);
const c0=await p.evaluate(()=>N.coins);await p.evaluate(()=>{[...document.querySelectorAll('#clList .wdc')].find(d=>d.querySelector('b').textContent=='Pull').querySelector('button').click()});
console.log('achat pull',c0,'->',await p.evaluate(()=>N.coins),await p.evaluate(()=>JSON.stringify([N.wd2.own,N.look.wd.haut])));
await p.tap('#clSeg [data-t="ens"]');await p.waitForTimeout(300);await p.screenshot({path:'shop2.png'});
// sauvegarde
await p.evaluate(()=>save());await p.reload();await p.waitForTimeout(2500);console.log('après rechargement',await p.evaluate(()=>JSON.stringify([N.look.wd,N.wd2.own,N.outf2.length])));
console.log(errs);await b.close()})();
