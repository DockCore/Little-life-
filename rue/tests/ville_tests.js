// Tests réels : panneau « Sortie » sans doublon avec la rue, nouveaux commerces de la rue (café, épicerie, déco).
// Usage : node rue/tests/ville_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const {chromium}=require(PW);
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const MODE=process.argv[2]||'tel';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext(MODE=='pc'?{viewport:{width:1280,height:800}}:MODE=='paysage'?{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true}:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);let n=0,okN=0;
 const ok=(t,c,d)=>{n++;if(c)okN++;console.log((c?'OK   ':'ÉCHEC ')+t+'  '+JSON.stringify(d===undefined?'':d).slice(0,500))};
 const shot=k=>p.screenshot({path:`${O}/ville_${MODE}_${k}.png`});
 await p.goto(JEU);await E(()=>localStorage.clear());await p.goto(JEU);await W(2500);
 await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c&&creating)c.click()});await W(1200);
 const run=async(k)=>{for(let i=0;i<k;i++)await E(()=>{try{update()}catch(e){}})};
 const until=async(f,max=600,a)=>{for(let i=0;i<max;i++){if(await E(f,a))return true;await run(8);await W(15)}return false};

 // 1. panneau Sortie
 await E(()=>{N.coins=500;goOut()});await until(()=>curV=='out');await shot('01_sortie');
 const tiles=await E(()=>[...document.querySelectorAll('#v-out [data-go]')].map(t=>t.dataset.go));
 const names=await E(()=>[...document.querySelectorAll('#v-out .tile')].map(t=>t.childNodes[1]&&t.childNodes[1].textContent||t.textContent));
 ok('1 panneau Sortie : plus aucun bouton Boutique déco, Épicerie, Vêtements ou Café (ni dans la liste, ni masqué)',!['store','grocery','clothes','cafe'].some(k=>tiles.includes(k))&&!names.some(s=>/Boutique déco|Épicerie|Vêtements|Café/.test(s)),{tiles,names});
 ok('2 panneau Sortie : La rue, Travail, Animalerie, Sport, Mes amis et Rester sont là',['street','office','pets','gym','amis'].every(k=>tiles.includes(k))&&!!(await E(()=>document.getElementById('outStay'))),tiles);
 // règle générale : aucun lieu de la rue (hors exceptions) dans le panneau
 const rule=await E(()=>{const S=stStreetPlaces();return{rue:[...S],doublons:[...document.querySelectorAll('#v-out [data-go]')].map(t=>t.dataset.go).filter(d=>S.has(d))}});
 ok('3 règle de la ville : aucun lieu ayant une porte dans la rue n’est proposé dans le panneau',rule.doublons.length==0&&['cafe','grocery','store','clothes'].every(k=>rule.rue.includes(k)),rule);
 // une ancienne navigation directe passe par la rue
 const old=await E(()=>{chooseDest('cafe');return C.dest||null});await until(()=>place=='street'||STV.on,900);
 ok('4 ancienne navigation directe vers le café : redirigée vers la rue, sans erreur',await E(()=>STV.on),{dest:old});

 // 5. le café dans la rue
 const caf=await E(()=>{const b=STC.buildings.find(q=>q.id=='cafe');return b&&{x:b.x,w:b.w,go:b.go.place,fac:typeof FACADES[b.facade]=='function',canvas:!!stFacade(b,'day').width}});
 ok('5 le café est un bâtiment de la rue, avec sa façade',!!caf&&caf.go=='cafe'&&caf.fac&&caf.canvas,caf);
 for(const id of ['cafe','epicerie','deco']){await E(id=>{const b=STC.buildings.find(q=>q.id==id);STV.px=stDoorX(b);STV.cam=Math.max(0,Math.min(STC.len-STV.W,STV.px-STV.W/2));stPanel(true)},id);await run(4);await W(300);await shot('02_rue_'+id)}
 // entrer au café en marchant jusqu'à sa porte puis en touchant « Entrer »
 await E(()=>{const b=STC.buildings.find(q=>q.id=='cafe');STV.px=stDoorX(b)-90});await E(()=>{const b=STC.buildings.find(q=>q.id=='cafe');STV.auto={x:stDoorX(b),then:()=>stPanel(true)}});
 await until(()=>{const b=STC.buildings.find(q=>q.id=='cafe');return Math.abs(STV.px-stDoorX(b))<4},400);
 const panel=await E(()=>{const n=stNearB();return n&&n.id});
 await E(()=>stInteract());await until(()=>place=='cafe'&&curV=='cafe',900);await W(400);await shot('03_cafe_interieur');
 const inC=await E(()=>({place,curV,furn:PLACES.cafe.furn.length,menu:document.querySelectorAll('#cafeG .tile').length}));
 ok('6 entrée du café depuis la rue : vrai intérieur isométrique (meubles, comptoir) et carte des boissons',panel=='cafe'&&inC.place=='cafe'&&inC.furn>=6&&inC.menu>=3,{panel,inC});
 await until(()=>C.st=='idle'||C.st=='walk',300);
 await E(()=>cafeOrder(0));const drank=await until(()=>C.st=='cafe',900);await until(()=>C.st!='cafe',900);
 ok('7 au café : commander, aller au comptoir, s’asseoir et boire',drank&&await E(()=>(N.cafe||0)>=1),await E(()=>({cafe:N.cafe,coins:N.coins})));
 await E(()=>document.getElementById('cafeHome').click());await until(()=>STV.on,900);
 const back=await E(()=>{const b=STC.buildings.find(q=>q.id=='cafe');return{on:STV.on,dx:Math.round(STV.px-stDoorX(b))}});
 ok('8 en sortant du café, on se retrouve dans la rue devant sa porte',back.on&&Math.abs(back.dx)<12,back);

 // 9-11. les autres commerces restent accessibles depuis la rue
 for(const [id,pl,v] of [['epicerie','grocery','grocery'],['deco','store','shop'],['mode','clothes','clothes']]){
  if(!(await E(()=>STV.on))){await E(()=>leaveTo('street'));await until(()=>STV.on,900)}
  await E(id=>{const b=STC.buildings.find(q=>q.id==id);STV.px=stDoorX(b);stPanel(true)},id);await E(()=>stInteract());const got=await until(()=>place!='street'&&curV!='trip'&&!['leave','trip','enter'].includes(C.st),900);
  const st=await E(()=>({place,curV}));ok(`9 ${id} : on y entre depuis la rue`,got&&st.place==pl&&st.curV==v,st);
  await E(()=>goHome());await until(()=>STV.on,900);ok(`9b ${id} : on en ressort dans la rue`,await E(()=>STV.on),'')}

 // 12. autres destinations du panneau
 await E(()=>{const b=STC.buildings.find(q=>q.id=='maison');STV.px=stDoorX(b);stPanel(true)});await E(()=>stInteract());await until(()=>place=='home'&&C.st=='idle',900);
 const dests={};for(const d of ['office','pets','gym']){await E(()=>{if(place!='home'){C.st='idle';arrive('home')}});await until(()=>place=='home'&&!tripOn&&['idle','walk'].includes(C.st),1200);await E(()=>goOut());await until(()=>curV=='out',900);
  await E(d=>document.querySelector(`#v-out [data-go="${d}"]`).click(),d);await until(d=>place==d&&!tripOn,1500,d);dests[d]=await E(()=>place)}
 ok('10 Travail, Animalerie et Sport fonctionnent toujours depuis le panneau',dests.office=='office'&&dests.pets=='pets'&&dests.gym=='gym',dests);
 await E(()=>{C.st='idle';arrive('home')});await until(()=>place=='home'&&!tripOn&&['idle','walk'].includes(C.st),1500);await E(()=>goOut());await until(()=>curV=='out',900);
 await E(()=>document.querySelector('#v-out [data-go="amis"]').click());await W(400);const amis=await E(()=>!!document.querySelector('#socOver:not([hidden])'));
 await E(()=>{try{SOCIAL.closeCard()}catch(e){}const o=document.getElementById('socOver');if(o)o.hidden=true});
 await E(()=>document.getElementById('outStay').click());await W(300);const stay=await E(()=>curV);
 await E(()=>goOut());await until(()=>curV=='out',900);await E(()=>document.querySelector('#v-out [data-go="street"]').click());const rue=await until(()=>STV.on,1500);
 ok('11 Mes amis, Rester et La rue fonctionnent',amis&&stay=='home'&&rue,{amis,stay,rue});
 ok('12 aucune erreur JavaScript',errs.length==0,errs.slice(0,5));
 console.log(okN+'/'+n+' tests réussis ('+MODE+')');await b.close();process.exit(okN==n?0:1)})();
