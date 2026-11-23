// Tests réels du cinéma (Playwright + Chrome) : circulation, collisions, portes, achats, fauteuils, film, toilettes, sauvegarde, performances.
// Usage : node rue/tests/cinema_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,500):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click()});await p.waitForTimeout(700)};
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 const until=async(f,a,ms)=>{if(typeof a=='number'){ms=a;a=undefined}ms=ms||15000;const t0=Date.now();while(Date.now()-t0<ms){if(await E(f,a))return true;await W(100)}return false};
 const clickTile=t=>E(t=>{const b=[...document.querySelectorAll('#ciG .tile')].find(b=>b.textContent.includes(t));if(!b)return false;b.click();return true},t);
 // ---- 1. entrée depuis la rue, façade inchangée ----
 const fac=await E(()=>{const b=STC.buildings.find(q=>q.id=='cinema');return{w:b.w,h:b.h,door:b.door,facade:b.facade,go:b.go,av:b.available}});
 await E(()=>{N.coins=300;N.cine=null;streetEnter();const a=STC.buildings.find(q=>q.id=='cinema');STV.px=a.x+a.door.x;stInteract()});const in1=await until(()=>place=='cine_hall'&&C.st=='idle'&&curV=='cinema');
 await p.screenshot({path:`${O}/ci_${mode}_01_hall.png`});
 ok(T('1 entrée dans le cinéma depuis la rue (façade, taille et porte du bâtiment inchangées)'),in1&&fac.w==204&&fac.h==190&&fac.door.x==102&&fac.door.w==46&&fac.facade=='cinema'&&fac.av,{fac,in1});
 // ---- 2. toutes les pièces : aller et retour par les portes ----
 const tour=[];for(const[door,room]of[[['cine_hall',0],'cine_couloir'],[['cine_couloir',0],'cine_s1'],[['cine_couloir',1],'cine_s2'],[['cine_couloir',2],'cine_s3'],[['cine_couloir',3],'cine_wc'],[['cine_couloir',4],'cine_prive']]){
  if(await E(()=>place)!=door[0]){await E(d=>{CINE.setRoom(d)},door[0])}
  await until(()=>!CINE.CI.busy&&C.st!='enter');await E(i=>CINE.goDoor(PLACES[place].doors[i]),door[1]);const got=await until(r=>place==r&&C.st=='idle',room,20000);const rn=await E(()=>RN);await p.screenshot({path:`${O}/ci_${mode}_02_${room}.png`});
  await E(()=>CINE.goMainDoor());const back=await until(r=>place==r&&C.st=='idle',door[0],20000);const pos=await E(()=>{const d=PLACES[place].doors.find(o=>o.to==CINE_last);return{u:C.x/12,v:(C.y-88)/5,d}}).catch(()=>null);
  const front=await E(r=>{const d=(PLACES[place].doors||[]).find(o=>o.to==r);if(!d)return place;const u=C.x/12,v=(C.y-88)/5,t=d.w=='L'?[1.45,(d.a+d.b)/2]:[(d.a+d.b)/2,1.45];return Math.hypot(u-t[0],v-t[1])<.3},room);
  tour.push({room,got,rn,back,front})}
 ok(T('2 toutes les pièces accessibles par leurs portes (hall, couloir, 3 salles, toilettes, personnel) et retour devant la bonne porte'),tour.every(t=>t.got&&t.back&&t.front)&&new Set(tour.filter(t=>/s\d/.test(t.room)).map(t=>t.rn)).size==3,tour);
 // ---- 3. collisions : aucun meuble solide n'est traversable, déplacements sans traverser ----
 const col=await E(()=>{const out={};for(const r of Object.keys(CINE.ROOMS)){CINE.setRoom(r);let solid=0,bad=0;for(const f of PLACES[r].furn.filter(f=>f.s)){for(let i=1;i<4;i++)for(let j=1;j<4;j++){const u=f.x+f.w*i/4,v=f.y+f.h*i/4;if(u<1.15||v<1.2||u>RN-1.15||v>RN-1.2)continue;solid++;if(walkable(u,v))bad++}}
   // 40 déplacements aléatoires : chaque pas reste hors des meubles
   let steps=0,through=0,arrived=0;for(let k=0;k<40;k++){let tu,tv,g=0;do{tu=1.3+Math.random()*(RN-2.6);tv=1.3+Math.random()*(RN-2.6);g++}while(!walkable(tu,tv)&&g<50);C.st='idle';C.x=CI0(r)[0]*12;C.y=88+CI0(r)[1]*5;goto(tu*12,88+tv*5);
    for(let i=0;i<900&&C.st=='walk';i++){update();steps++;const a=C.x/12,b2=(C.y-88)/5;if(PLACES[r].furn.some(f=>f.s&&a>f.x+.05&&a<f.x+f.w-.05&&b2>f.y+.05&&b2<f.y+f.h-.05))through++}if(C.st!='walk')arrived++}
   out[r]={solid,bad,steps,through,arrived}}CINE.setRoom('cine_hall');C.st='idle';return out;
  function CI0(r){const R=PLACES[r];return r=='cine_hall'?[2,17]:[1.6,DOORS[1]]}});
 ok(T('3 collisions : meubles solides infranchissables, 280 déplacements sans jamais traverser un meuble'),Object.values(col).every(c=>c.bad==0&&c.through==0&&c.arrived>=36&&c.solid>0),col);
 // ---- 4. circulation : chaque équipement et chaque porte est atteignable ----
 const circ=await E(()=>{const res={},chk=(r,pts)=>{CINE.setRoom(r);const st=r=='cine_hall'?[2,17]:[1.6,DOORS[1]];res[r]=pts.map(([n,u,v])=>{const pth=findPath([st[0],st[1]],[u,v]);return[n,!!(pth&&pth.length)||Math.hypot(u-st[0],v-st[1])<.5]}).filter(x=>!x[1]).map(x=>x[0])};
  chk('cine_hall',[['guichet',5,4.4],['borne',9.5,2.5],['confiserie',16,4.6],['porte salles',1.45,4],['canapés',8.5,9.4],['totem',15.5,10.8]]);
  chk('cine_couloir',PLACES.cine_couloir.doors.map(d=>[d.to,d.w=='L'?1.45:(d.a+d.b)/2,d.w=='L'?(d.a+d.b)/2:1.45]));
  for(const s of['cine_s1','cine_s2','cine_s3'])chk(s,PLACES[s].furn.filter(f=>f.n=='Rangee').flatMap(f=>[['allée gauche '+f.i,2.05,f.y+f.h+.15],['allée droite '+f.i,f.x+f.w+.95,f.y+f.h+.15]]));
  chk('cine_wc',PLACES.cine_wc.furn.filter(f=>f.n=='CabineWC').map(f=>['cabine',f.x+f.w/2,f.y+f.h+.9]).concat([['lavabos',2.15,3.8]]));
  chk('cine_prive',[['technique',2.5,2.4],['réserve',8.5,2.4],['personnel',5.5,10.2]]);CINE.setRoom('cine_hall');return res});
 ok(T('4 circulation naturelle : guichet, bornes, confiserie, portes, allées de chaque rangée, cabines et locaux tous atteignables'),Object.values(circ).every(a=>a.length==0),circ);
 // ---- 5. billetterie et borne ----
 await E(()=>{CINE.setRoom('cine_hall');C.x=5*12;C.y=88+6*5;C.st='idle';N.coins=300;N.cine=null;CINE.CI.mode=null;CINE.ciUI()});
 await clickTile('Billetterie');await until(()=>CINE.CI.mode=='billets');const t0=await E(()=>[...document.querySelectorAll('#ciG .tile')].map(b=>b.textContent));await p.screenshot({path:`${O}/ci_${mode}_03_billetterie.png`});
 await clickTile('PETIT ROBOT');const b1=await E(()=>({c:N.coins,b:N.cine.billet}));
 await E(()=>{CINE.CI.mode=null;CINE.ciUI()});await clickTile('Borne');await until(()=>CINE.CI.mode=='borne');await clickTile('VAGUE');const b2=await E(()=>({c:N.coins,b:N.cine.billet}));
 await E(()=>{N.coins=5;CINE.CI.mode='billets';CINE.ciUI()});const dis=await E(()=>[...document.querySelectorAll('#ciG .tile')].filter(b=>b.disabled).length);const poor=await E(()=>{CINE.buyTicket(1,false);return{c:N.coins,b:N.cine.billet}});
 ok(T('5 acheter un billet au guichet (prix plein) et à la borne (1 pièce de moins), refus sans assez de pièces'),t0.length==4&&b1.c==290&&b1.b.s==1&&b2.c==277&&b2.b.s==3&&dis==3&&poor.c==5&&poor.b.s==3,{t0,b1,b2,dis,poor});
 // ---- 6. confiserie ----
 await E(()=>{N.coins=100;CINE.CI.mode=null;CINE.ciUI()});await clickTile('Confiserie');await until(()=>CINE.CI.mode=='snacks');await clickTile('Pop-corn');await clickTile('Boisson');await clickTile('Bonbons');
 const sn=await E(()=>({c:N.coins,s:N.cine.snacks,info:document.getElementById('ciInfo').textContent}));await p.screenshot({path:`${O}/ci_${mode}_04_confiserie.png`});
 ok(T('6 confiserie : pop-corn, boisson et bonbons achetés (6 + 4 + 3 pièces), inventaire affiché'),sn.c==87&&sn.s.pop==1&&sn.s.boi==1&&sn.s.bon==1&&/pop-corn/.test(sn.info)&&/bonbons/.test(sn.info),sn);
 // ---- 7 et 8. salle 3 : s'asseoir et regarder le film ----
 await E(()=>{CINE.setRoom('cine_s3');C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';CINE.ciUI()});
 const seatPick=await E(()=>{const f=PLACES.cine_s3.furn.filter(f=>f.n=='Rangee')[3],j=CINE.freeSeat(f,f.x+5.5);return{j,occ:f.occ[j],any:f.occ.some(Boolean)}});
 await E(()=>{const f=PLACES.cine_s3.furn.filter(f=>f.n=='Rangee')[3];CINE.sitIn(f,CINE.freeSeat(f,f.x+5.5))});const sat=await until(()=>C.st=='cine',20000);const sp=await E(()=>({sp:spName,st:C.st,film:!!CINE.CI.film}));
 await E(()=>{try{tscr.hidden=true}catch(e){}});const started=await until(()=>CINE.CI.film&&CINE.CI.film.on,4000);await W(5000);const mid=await E(()=>({dim:CINE.CI.dim,curt:CINE.CI.curt,t:CINE.CI.film&&CINE.CI.film.t,th:themeNow()}));await p.screenshot({path:`${O}/ci_${mode}_05_film.png`});
 ok(T('7 s’asseoir dans un fauteuil libre (jamais sur un spectateur), personnage assis vu de dos'),seatPick.occ==0&&seatPick.any&&sat&&sp.sp=='dk0',{seatPick,sp});
 const fin=await E(async()=>{const h0=N.happy,F=CINE.CI.film;F.t=CINE.FILM_DUR-.5;await new Promise(r=>setTimeout(r,900));return{h0,h1:N.happy,billet:N.cine.billet,s:N.cine.snacks,vus:N.cine.vus,film:CINE.CI.film,msg:document.getElementById('status').textContent}});
 await W(3000);const after=await E(()=>({dim:CINE.CI.dim,curt:CINE.CI.curt}));
 ok(T('8 regarder un film : lumières éteintes, rideaux ouverts, film projeté, musique de film ; à la fin billet utilisé, friandises mangées, bonheur en hausse'),started&&mid.dim>.8&&mid.curt>.6&&mid.t>4&&mid.th=='cinefilm'&&fin.billet==null&&fin.s.pop==0&&fin.s.boi==0&&fin.s.bon==0&&fin.vus==1&&fin.h1>fin.h0&&/FIN/.test(fin.msg)&&after.dim<.3,{mid,fin,after});
 // ---- 9. sans billet, pas de film ----
 const nob=await E(async()=>{CINE.standUpCine();N.cine.billet={s:1,t:'PETIT ROBOT'};const f=PLACES.cine_s3.furn.filter(f=>f.n=='Rangee')[1];CINE.sitIn(f,CINE.freeSeat(f));let t=0;while(C.st!='cine'&&t<200){await new Promise(r=>setTimeout(r,100));t++}await new Promise(r=>setTimeout(r,1200));
  return{st:C.st,film:!!CINE.CI.film,msg:document.getElementById('status').textContent,billet:N.cine.billet}});
 ok(T('9 billet d’une autre salle : on peut s’asseoir mais le film ne démarre pas, le billet est conservé'),nob.st=='cine'&&!nob.film&&/billet/i.test(nob.msg)&&nob.billet.s==1,nob);
 // se lever en touchant l'écran, puis sortir
 const up=await E(()=>{CINE.standUpCine();return{st:C.st,walk:walkable(C.x/12,(C.y-88)/5)}});
 // ---- 10. toilettes ----
 const wc=await E(async()=>{CINE.setRoom('cine_wc');C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';N.wc=20;N.look.g='m';const cabF=PLACES.cine_wc.furn.find(f=>f.n=='CabineWC'&&f.k=='F'),cabH=PLACES.cine_wc.furn.find(f=>f.n=='CabineWC'&&f.k=='H');
  CINE.useWC(cabF);const wrong=document.getElementById('status').textContent;CINE.useWC(cabH);let t=0;while(C.st!='ciwc'&&t<200){await new Promise(r=>setTimeout(r,50));t++}const hidden=C.alpha==0;while(C.st=='ciwc'&&t<600){await new Promise(r=>setTimeout(r,50));t++}
  const wc1=N.wc;CINE.washHands();t=0;while(C.st!='ciwash'&&t<300){await new Promise(r=>setTimeout(r,50));t++}const wash=C.st=='ciwash';return{wrong,hidden,wc1,wash}});
 ok(T('10 toilettes : côté hommes/femmes respecté, passage aux toilettes (besoin rétabli), lavage des mains'),/femmes/i.test(wc.wrong)&&wc.hidden&&wc.wc1>=99&&wc.wash&&up.st=='idle'&&up.walk,{wc,up});
 // ---- 11. locaux du personnel ----
 await E(()=>{CINE.setRoom('cine_prive');C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';CINE.ciUI()});const pv=await E(()=>[...document.querySelectorAll('#ciG .tile')].map(b=>b.textContent));await clickTile('Réserve');await until(()=>/réserve/i.test(document.getElementById('status').textContent),15000);
 const pvMsg=await E(()=>document.getElementById('status').textContent);await p.screenshot({path:`${O}/ci_${mode}_06_prive.png`});
 ok(T('11 local technique, réserve et espace du personnel visitables'),pv.length==4&&/réserve/i.test(pvMsg),{pv,pvMsg});
 // ---- 12. toucher l'écran : portes, meubles, fauteuils ----
 const tap=await E(async()=>{const r={};const tapAt=(u,v,z)=>{isoSetup();const pt=P3(u,v,z||0);placeTap(pt[0],pt[1],u,v)};
  CINE.setRoom('cine_hall');C.x=6*12;C.y=88+8*5;C.st='idle';tapAt(9.5,1,30);let t=0;while(CINE.CI.mode!='borne'&&t<300){await new Promise(z=>setTimeout(z,50));t++}r.borne=CINE.CI.mode;
  CINE.CI.mode=null;tapAt(0,4,30);t=0;while(place!='cine_couloir'&&t<400){await new Promise(z=>setTimeout(z,50));t++}r.porte=place;
  t=0;while(C.st!='idle'&&t<200){await new Promise(z=>setTimeout(z,50));t++}CINE.setRoom('cine_s1');C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';const f=PLACES.cine_s1.furn.filter(f=>f.n=='Rangee')[0];tapAt(f.x+4.5,f.y+.5,8);t=0;while(C.st!='cine'&&t<400){await new Promise(z=>setTimeout(z,50));t++}r.assis=C.st;
  tapAt(5,10,0);r.leve=C.st;CINE.setRoom('cine_hall');C.st='idle';return r});
 ok(T('12 interactions au toucher : borne, porte des salles, fauteuil (s’asseoir puis se lever)'),tap.borne=='borne'&&tap.porte=='cine_couloir'&&tap.assis=='cine'&&tap.leve=='idle',tap);
 // ---- 14. performances ----
 const perf=await E(()=>{const out={};for(const r of Object.keys(CINE.ROOMS)){CINE.setRoom(r);C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';if(PLACES[r].salle){CINE.CI.film={s:PLACES[r].salle,t:10,on:true};CINE.CI.dim=1;CINE.CI.curt=1}
   for(let i=0;i<5;i++)drawWorld();const t0=performance.now();for(let i=0;i<40;i++){update();drawWorld()}out[r]=+((performance.now()-t0)/40).toFixed(2);CINE.CI.film=null;CINE.CI.dim=0;CINE.CI.curt=0}
  place='gym';setRN(20);bgKey='';return out});
 const gymT=await E(()=>{place='gym';setRN(20);bgKey='';for(let i=0;i<5;i++)drawWorld();const t0=performance.now();for(let i=0;i<40;i++){update();drawWorld()}return +((performance.now()-t0)/40).toFixed(2)});
 ok(T('14 performances : une image par pièce bien sous les 16 ms (60 i/s), comparable aux autres lieux'),Object.values(perf).every(v=>v<10),{perf,gym:gymT});
 // ---- 13. sauvegarde ----
 await E(()=>{N.cine={billet:{s:2,t:'MISSION ÉTOILE'},snacks:{pop:2,boi:0,bon:1},vus:3};save();save()});await p.reload();await W(2500);
 const sav=await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}return N.cine});
 ok(T('13 billet, friandises et films vus conservés après rechargement'),sav&&sav.billet&&sav.billet.s==2&&sav.snacks.pop==2&&sav.snacks.bon==1&&sav.vus==3,sav);
 await E(()=>{const b=document.getElementById('crOk2');if(b)b.click()});await W(500);
 // ---- 15. sortie vers la rue et autres lieux intacts ----
 const out=await E(async()=>{place='street';CINE.setRoom('cine_hall');C.viaStreet='cinema';C.x=8*12;C.y=88+12*5;C.st='idle';CINE.CI.mode=null;show('cinema');document.getElementById('ciLeave').click();let t=0;while(!(typeof STV!='undefined'&&STV.on)&&t<400){await new Promise(z=>setTimeout(z,50));t++}
  const b=STC.buildings.find(q=>q.id=='cinema');return{street:STV.on,near:Math.abs(STV.px-stDoorX(b))<4,place}});
 const other=await E(async()=>{streetLeave&&streetLeave();arrive('gym');let t=0;while(C.st!='idle'&&t<200){await new Promise(z=>setTimeout(z,50));t++}const g={place,RN,curV,furn:PLACES.gym.furn.length};arrive('clothes');t=0;while(C.st!='idle'&&t<200){await new Promise(z=>setTimeout(z,50));t++}return{g,c:{place,RN,curV}}});
 ok(T('15 « Partir » ramène dans la rue devant le cinéma ; la salle de sport et le magasin de vêtements fonctionnent toujours'),out.street&&out.near&&other.g.place=='gym'&&other.g.RN==20&&other.g.curV=='gym'&&other.c.place=='clothes'&&other.c.RN==20,{out,other});
 ok(T('16 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/ci_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
