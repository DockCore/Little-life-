const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const boot=async()=>{await p.waitForTimeout(1800);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const o=document.getElementById('crOk2');if(o&&!N.created)o.click()});await p.waitForTimeout(1200)};
await p.goto('file:///home/claude/little-life-/index.html');await boot();
await p.evaluate(()=>{tod=0;N.coins=1000;save()});
// 1. achat dans une catégorie
await p.evaluate(()=>show('shop'));await p.tap('#shCats [data-cat="table"]');const c0=await p.evaluate(()=>N.coins);
await p.evaluate(()=>{const i=SHOP.findIndex(s=>s.n=='Chaise');[...document.querySelectorAll('#shopG .sc')].find(d=>d.querySelector('span').textContent=='Chaise').querySelector('button').click()});
console.log('1. achat chaise',c0,'->',await p.evaluate(()=>N.coins),await p.evaluate(()=>{const f=N.furn.find(f=>f.n=='Chaise');return f?[f.id?'id':'sans id',f.x,f.y]:'absent'}));
// 2. déco : sélectionner le lit -> couleurs, parties
await p.evaluate(()=>{show('deco');sel=draft.findIndex(f=>f.n=='Lit');planDraw()});
const btns=async()=>p.evaluate(()=>[...document.querySelectorAll('#czBar .czr button')].map(b=>b.textContent+(b.disabled?'(x)':'')).join(' | '));
console.log('2. menu lit',await btns());
await p.tap('#czBar [data-c="col"]');await p.tap('#czOpt [data-k="s"][data-i="4"]');
await p.tap('#czBar [data-c="parts"]');console.log('   parties',await p.evaluate(()=>[...document.querySelectorAll('#czOpt .czp button')].map(b=>b.textContent).join(',')));
await p.tap('#czOpt [data-part="1"]');await p.tap('#czOpt [data-k="l"][data-i="5"]');
console.log('   lit',await p.evaluate(()=>JSON.stringify(N.furn.find(f=>f.n=='Lit').cl)),await p.evaluate(()=>document.getElementById('status').textContent));
// 3. tourner le lit (3 orientations déclarées)
const rs=[];for(let i=0;i<3;i++){await p.tap('#czBar [data-c="rot"]');rs.push(await p.evaluate(()=>draft[sel].r))}console.log('3. rotations lit',rs.join(','));
// 4. douche : pas de couleurs (sanitaire), vendable
await p.evaluate(()=>{sel=draft.findIndex(f=>f.n=='Douche');planDraw()});console.log('4. menu douche',await btns());
await p.tap('#czBar [data-c="sell"]');console.log('   1er appui',await p.evaluate(()=>[N.furn.some(f=>f.n=='Douche'),document.getElementById('status').textContent]));
const m0=await p.evaluate(()=>N.coins);await p.tap('#czBar [data-c="sell"]');
console.log('   confirmé',m0,'->',await p.evaluate(()=>N.coins),await p.evaluate(()=>[N.furn.some(f=>f.n=='Douche'),JSON.stringify(N.sales),JSON.stringify(N.gone)]));
// 5. vendre le bureau -> « Ma maison »
await p.evaluate(()=>{sel=draft.findIndex(f=>f.n=='Bureau');planDraw()});await p.tap('#czBar [data-c="sell"]');await p.tap('#czBar [data-c="sell"]');
await p.evaluate(()=>show('home'));console.log('5. Ma maison visible',await p.evaluate(()=>!document.getElementById('bHouse').hidden),await p.evaluate(()=>document.querySelector('#v-home .hint').textContent));
await p.tap('#bHouse');console.log('   vue',await p.evaluate(()=>[curV,document.getElementById('bWork').disabled]));
// 6. ranger le tapis puis le replacer : couleurs gardées
await p.evaluate(()=>{show('deco');sel=draft.findIndex(f=>f.n=='Tapis');planDraw()});await p.tap('#czBar [data-c="parts"]');await p.tap('#czOpt [data-part="1"]');await p.tap('#czOpt [data-k="m"][data-i="2"]');
await p.tap('#czBar [data-c="stow"]');await p.tap('#ok');console.log('6. rangé',await p.evaluate(()=>[N.store.join(','),JSON.stringify(N.fKeep)]));
await p.evaluate(()=>show('inv'));await p.evaluate(()=>{const i=N.store.indexOf('Tapis');document.querySelector('#invBox [data-pl="'+i+'"]').click()});console.log('   replacé',await p.evaluate(()=>JSON.stringify((N.furn.find(f=>f.n=='Tapis')||{}).cl)));
// 7. rechargement : ventes et couleurs conservées, douche pas recréée
await p.evaluate(()=>save());const before=await p.evaluate(()=>JSON.stringify(N.furn.map(f=>[f.n,f.x,f.y,f.r,f.cl||null]))+N.coins);
await p.reload();await boot();const after=await p.evaluate(()=>JSON.stringify(N.furn.map(f=>[f.n,f.x,f.y,f.r,f.cl||null]))+N.coins);
console.log('7. identique après rechargement',before==after,await p.evaluate(()=>[N.furn.some(f=>f.n=='Douche'),N.sales.length]));
// 8. sans douche / sans lit : messages
await p.evaluate(()=>{show('home');wash()});console.log('8. laver',await p.evaluate(()=>document.getElementById('status').textContent));
// 9. fauteuil : acheter, s'asseoir
await p.evaluate(()=>{N.coins+=200;buy(SHOP.findIndex(s=>s.n=='Fauteuil'));const f=N.furn.find(f=>f.n=='Fauteuil');goCosy(f,'sit');show('sofa')});
for(let i=0;i<40;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>C.st=='sofa'))break}
console.log('9. fauteuil',await p.evaluate(()=>[C.st,C.seat&&C.seat.n,spName,document.getElementById('czHd').textContent,[...document.querySelectorAll('#v-sofa [data-cz]')].map(b=>b.dataset.cz+(b.disabled?'(x)':'')).join(' ')]));
await p.evaluate(()=>czPose('look'));await p.waitForTimeout(100);
const r=await p.evaluate(()=>{const f=N.furn.find(f=>f.n=='Fauteuil');isoSetup();const rb=RC.getBoundingClientRect(),c=P3(f.x+f.w/2,f.y+f.h/2,10);return{x:rb.left+c[0]/LW*rb.width,y:rb.top+c[1]/LH*rb.height}});await p.screenshot({path:'fauteuil.png',clip:{x:r.x-70,y:r.y-80,width:140,height:110}});
console.log('err',errs);await b.close()})();
