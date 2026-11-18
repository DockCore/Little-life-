const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/little-life-/index.html');await p.waitForTimeout(2500);
const outfits={m:[['tee|4','jean|0','basket|0'],['shirt|1','chino|0','blazer|1','mocass|1','ceinture|0'],['hoodie|3','jog|1','running|0','casq|2'],['roll|1','manteau|0','jean|1','bottine|0','echarpe|0','bonnet|0'],['mari|0','short|0','sandale|0','sun|0','mi|0'],['flan|1','cargo|1','doud|1','bottine|1','top|0']],
 f:[['crop|7','shortj|1','basket|6','long|0'],['blouse|0','plisse|2','cardi|0','bottes|0','sac|0','bun|0'],['rete|0','sandale|0','bandeau|0','tails|0'],['rpull|1','bottes|1','echarpe|1','long|0'],['rsoir|6','ballerine|1','collier|0','bun|0'],['teev|8','legging|1','running|6','vjean|1']]};
const frames=['v_front','v_q','v_side','v_back','idle','w1','w3','wf2','wb2','r1','dn0','dk0','wc0','cu1','bk1','cs0','cs1','cs3','cn2','cn3'];
for(const g of ['m','f']){const d=await p.evaluate(([g,O,frames])=>{const c=document.createElement('canvas');c.width=frames.length*80;c.height=O.length*128;const x=c.getContext('2d');x.fillStyle='#d9c2a0';x.fillRect(0,0,c.width,c.height);
 O.forEach((o,j)=>{const L=Object.assign({},N.look,{g,hr:g=='f'?0:0,wd:{cheveux:'nat|0'}});o.forEach(s=>{const[id,ci]=s.split('|');wEquip(L,id,+ci)});frames.forEach((f,i)=>{if(drawFrame(f,L))x.drawImage(sc2,i*80,j*128)})});return c.toDataURL()},[g,outfits[g],frames]);
 require('fs').writeFileSync('o_'+g+'.png',Buffer.from(d.split(',')[1],'base64'))}
console.log(errs);await b.close()})();
