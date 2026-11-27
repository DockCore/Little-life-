const H=require('/tmp/rs/h.js');(async()=>{const {b,p,E,W,errs}=await H('mob');
const r={};
r.pal=await E(()=>({n:HRP.length,names:HRN.length,hairPal:WCAT.nat.pal.length}));
await E(()=>{show('dress');});await W(400);
r.tabs=await E(()=>[...document.querySelectorAll('#drSeg button')].map(b=>b.textContent));
await E(()=>{[...document.querySelectorAll('#drSeg button')].find(b=>b.textContent=='Couleurs').click()});await W(400);
r.box=await E(()=>{const g=document.querySelectorAll('.hrgr');return{bars:g.length,cells:[...g].map(x=>x.children.length),title:document.querySelector('.hrbox .tnt').textContent}});
await E(()=>document.querySelectorAll('.hrgr')[1].children[16].click());await W(300);
r.after=await E(()=>({hr:N.look.hr,ch:N.look.wd.cheveux,hex:HRP[N.look.hr],on:!!document.querySelector('.hrgr button.sel'),title:document.querySelector('.hrbox .tnt').textContent}));

await E(()=>document.querySelectorAll('.hrgr')[0].children[3].click());await W(300);r.nat=await E(()=>[N.look.hr,N.look.wd.cheveux]);
await E(()=>{show('clothes')});await W(400);r.shop=await E(()=>[...document.querySelectorAll('#clSeg button')].map(b=>b.textContent.trim()));
await E(()=>{show('out')});await W(400);r.out=await E(()=>[...document.querySelectorAll('#v-out .tile')].map(b=>b.textContent.trim()));
// migration : une ancienne coupe enregistrée revient à la coupe d'origine
await E(()=>{N.look.wd.cheveux='long|5';N.look.hr=5;save()});await p.reload();await W(2500);
r.mig=await E(()=>[N.look.wd.cheveux,N.look.hr]);
r.errs=errs.filter(e=>!/TUNNEL|Failed to load resource/.test(e));
const T=[['1 palette : 14 couleurs + 2 dégradés de 24 nuances',r.pal.n==62&&r.pal.names==62&&r.pal.hairPal==62],
 ['2 garde-robe : plus d’onglet Coiffure',!r.tabs.includes('Coiffure')&&r.tabs.includes('Couleurs')],
 ['3 Couleurs : 2 bandes en dégradé de 24 cases',r.box.bars==2&&r.box.cells.every(c=>c==24)],
 ['4 une nuance du dégradé colore les cheveux, la coupe reste d’origine',r.after.hr==54&&r.after.ch=='nat|54'&&r.after.on],
 ['5 dégradé naturel',r.nat[0]==17&&r.nat[1]=='nat|17'],
 ['6 magasin : plus de rayon Coiffures',!r.shop.some(x=>/Coiff/.test(x))],
 ['7 Sortie : « En ville »',r.out.some(x=>x.startsWith('En ville'))&&!r.out.some(x=>x.startsWith('La rue'))],
 ['8 ancienne coupe enregistrée -> coupe d’origine, couleur gardée',r.mig[0]=='nat|5'&&r.mig[1]==5],
 ['9 aucune erreur JavaScript',!r.errs.length]];
T.forEach(([n,v])=>console.log((v?'OK   ':'ÉCHEC ')+n));console.log(T.filter(t=>t[1]).length+'/'+T.length+' tests réussis');await b.close()})();
