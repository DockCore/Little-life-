// Tests réels des toilettes du cinéma : porte sans carrelage, lavage des mains (tenues, hygiène, occupation, sons). Usage : node rue/tests/toilettes_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,500):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
const LOOKS=[['homme sweat, jean, baskets, casquette, sac',{g:'m',wd:{haut:'hoodie|2',bas:'jean|0',chaussures:'basket|1',tete:'casq|3',sac:'sac|0'}}],
 ['homme chemise, chino, blazer, lunettes, écharpe',{g:'m',wd:{haut:'shirt|1',bas:'chino|2',veste:'blazer|0',yeux:'glass|0',cou:'echarpe|2',chaussures:'mocass|0'}}],
 ['femme robe, ballerines, bandeau, collier, cheveux longs',{g:'f',wd:{robe:'rete|1',chaussures:'ballerine|0',tete:'bandeau|1',bijou:'collier|0',cheveux:'long|0'}}],
 ['femme manteau, jupe plissée, bottes, bonnet',{g:'f',wd:{haut:'pull|3',bas:'plisse|1',veste:'manteau|2',chaussures:'bottes|0',tete:'bonnet|1',cheveux:'bun|0'}}]];
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 await E(()=>{window.__fx=[];const o=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,k,g)=>{window.__fx.push(n);return o(n,k,g)};window.__loops=0;const l=JEUSON.loop.bind(JEUSON);JEUSON.loop=(...a)=>{window.__loops++;return l(...a)}});
 // ---- 1. porte bleue sans carrelage ----
 const door=await E(async()=>{const out={};for(const r of['cine_wc','cine_hall','cine_couloir']){CINE.setRoom(r);doorA=0;doorT=0;C.x=6*12;C.y=88+5*5;await new Promise(z=>setTimeout(z,300));isoSetup();placeBG(night);
   const DS=RN-16,d=bgx.getImageData(0,0,LW,LH).data,P=PLACES[r],cols=new Map();let n=0,bad=0;const tile=[0xcf,0xdc,0xe2],band=r=='cine_wc'?null:(r=='cine_hall'?[0x7a,0x26,0x38]:[0x5a,0x1a,0x2a]);
   for(let v=10.1+DS;v<12.1+DS;v+=.05)for(let z=8;z<WHI*.6;z+=1.5){const q=P3(0,v,z),i=(Math.round(q[1])*LW+Math.round(q[0]))*4;n++;const c=[d[i],d[i+1],d[i+2]];const near=t=>t&&Math.abs(c[0]-t[0])+Math.abs(c[1]-t[1])+Math.abs(c[2]-t[2])<24;if(near(tile)||near(band))bad++}
   out[r]={n,bad}}return out});
 await E(()=>{CINE.setRoom('cine_wc');doorA=0;doorT=0;C.x=8*12;C.y=88+5*5});await W(300);await p.screenshot({path:`${O}/wc_${mode}_01_porte.png`});
 ok(T('1 porte bleue des toilettes sans carrelage (et portes du hall et du couloir sans soubassement par-dessus)'),Object.values(door).every(o=>o.n>500&&o.bad==0),door);
 // ---- 2 à 5. lavage avec plusieurs tenues ----
 const res=[];for(let i=0;i<LOOKS.length;i++){const[nom,L]=LOOKS[i];
  const r=await E(async(L)=>{N.look.g=L.g;N.look.wd=Object.assign({cheveux:N.look.wd.cheveux||'nat|0'},L.wd);const wd0=JSON.stringify(N.look.wd);spKey='';CINE.setRoom('cine_wc');CINE.CI.npc=null;CINE.CI.occ=null;C.x=6*12;C.y=88+4*5;C.st='idle';N.washAt=Date.now()-864e5*.7;needsTick();
   const h0=N.hyg;window.__fx=[];window.__loops=0;CINE.washHands();const seq=[],hy=[],chk=[];let t=0;
   while(t<500){await new Promise(z=>setTimeout(z,50));t++;if(C.st=='ciwash'){if(!seq.includes(spName))seq.push(spName);needsTick();hy.push(N.hyg);
     if(seq.length&&chk.length<4&&(spName=='cu1'||spName=='cu2')&&t%7==0){// l'image affichée = l'image du jeu avec la vraie tenue ; et elle diffère de la même image sans vêtements
      const a=pcx.getImageData(0,0,CW,CH).data,c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');drawFrame(spName,N.look);const b2=pcx.getImageData(0,0,CW,CH).data;drawFrame(spName,Object.assign({},N.look,{wd:{cheveux:N.look.wd.cheveux}}));const nu=pcx.getImageData(0,0,CW,CH).data;
      let same=0,diff=0;for(let k=0;k<a.length;k+=4){if(a[k]==b2[k]&&a[k+1]==b2[k+1]&&a[k+3]==b2[k+3])same++;if(b2[k]!=nu[k]||b2[k+3]!=nu[k+3])diff++}spKey='';chk.push({same:same==a.length/4,habits:diff})}}
    if(seq.length&&C.st!='ciwash'&&C.st!='walk')break}
   const mono=hy.every((v,k)=>k==0||v>=hy[k-1]-.01);return{seq,h0:Math.round(h0),h1:Math.round(N.hyg),mono,chk,wd:JSON.stringify(N.look.wd)==wd0,st:C.st,fx:[...new Set(window.__fx)],loops:window.__loops,hop:C.hop}},L);
  await E(()=>{});res.push([nom,r]);
  await E(async(L)=>{CINE.CI.npc={b:2,t:900,T:900,w:1,i:4};CINE.washHands();let t=0;while(!(CINE.CI.wash&&CINE.CI.wash.t>120)&&t<200){await new Promise(z=>setTimeout(z,50));t++}},L);await p.screenshot({path:`${O}/wc_${mode}_0${2+i}_lavage.png`});await E(()=>{CINE.washStop();CINE.CI.npc=null})}
 res.forEach(([nom,r],i)=>ok(T((2+i)+' lavage des mains, '+nom+' : se penche, ouvre le robinet, se frotte les mains, referme, se redresse ; tenue conservée à chaque image'),
  r.seq.join()=='idle,cu1,cu2'&&r.chk.length>=3&&r.chk.every(c=>c.same&&c.habits>200)&&r.wd&&r.st=='idle'&&r.hop==0,{seq:r.seq,chk:r.chk,wd:r.wd}));
 const r0=res[0][1];ok(T('6 jauge HYGIÈNE : augmente progressivement pendant le lavage (+15)'),res.every(([n,r])=>r.mono&&r.h1-r.h0>=14&&r.h1-r.h0<=16),res.map(([n,r])=>[r.h0,r.h1,r.mono]));
 ok(T('7 sons : robinet ouvert et fermé, frottements, eau qui coule pendant le lavage'),res.every(([n,r])=>r.fx.includes('wtTap')&&r.fx.includes('wtScrub')&&r.loops==1),res.map(([n,r])=>[r.fx,r.loops]));
 // ---- 8. lavabo occupé / tous occupés / inaccessible ----
 const occ=await E(async()=>{CINE.setRoom('cine_wc');C.x=7.5*12;C.y=88+5*5;C.st='idle';CINE.CI.occ=null;CINE.CI.npc={b:2,t:900,T:900,w:1,i:1};CINE.washHands();let t=0;while(C.st!='ciwash'&&t<300){await new Promise(z=>setTimeout(z,50));t++}const b1=CINE.CI.wash&&CINE.CI.wash.b;CINE.washStop();
  C.st='idle';CINE.CI.occ=[0,1];CINE.washHands();const msg=document.getElementById('status').textContent,st=C.st;CINE.ciUI();const tile=[...document.querySelectorAll('#ciG .tile')].find(b=>b.textContent.includes('laver'));
  CINE.CI.occ=null;CINE.CI.npc=null;const fp=findPath;findPath=()=>[];C.x=7.5*12;CINE.washHands();const msg2=document.getElementById('status').textContent;findPath=fp;return{b1,msg,st,dis:tile.disabled,sub:tile.textContent,msg2}});
 ok(T('8 lavabo occupé évité, refus si tous sont occupés (bouton grisé) ou inaccessibles'),occ.b1!==2&&occ.b1!=null&&/occupés/.test(occ.msg)&&occ.st=='idle'&&occ.dis&&/occupés/.test(occ.sub)&&/accessible/.test(occ.msg2),occ);
 // ---- 9. durée affichée, commandes existantes conservées ----
 const ui=await E(async()=>{CINE.setRoom('cine_wc');C.x=6*12;C.y=88+4*5;C.st='idle';CINE.CI.occ=null;CINE.CI.npc=null;CINE.ciUI();const before=[...document.querySelectorAll('#ciG .tile')].map(b=>b.textContent);
  CINE.washHands();let t=0;while(!(CINE.CI.wash&&CINE.CI.wash.t>100)&&t<300){await new Promise(z=>setTimeout(z,50));t++}const during=[...document.querySelectorAll('#ciG .tile')].map(b=>b.textContent+(b.disabled?'[x]':''));
  const ex=document.getElementById('status').textContent;CINE.goMainDoor();const stay=place;CINE.washStop();return{before,during,stay}});
 ok(T('9 durée affichée (« environ 5 s », puis pourcentage), toilettes et sortie toujours présentes, pas de sortie pendant le lavage'),/5 s/.test(ui.before.join())&&ui.during.some(s=>/Lavage… \d+ %/.test(s))&&ui.before.some(s=>/toilettes/.test(s))&&ui.before.some(s=>/Sortir/.test(s))&&ui.stay=='cine_wc',ui);
 ok(T('10 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/wc_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
