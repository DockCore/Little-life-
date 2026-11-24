// Tests réels du mode cinéma (Playwright + Chrome, vraie lecture vidéo). Usage : node rue/tests/mode_cinema_tests.js [tel|pc]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,600):''))}
const boot=async(p)=>{await p.goto(JEU);await p.waitForTimeout(2500);await p.evaluate(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const b=document.getElementById('crOk2');if(b)b.click();try{tscr.hidden=true}catch(e){}});await p.waitForTimeout(700)};
async function session(b,mode){const tel=mode=='tel';const ctx=await b.newContext(tel?{viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),T=s=>(tel?'TEL ':'PC ')+s;await boot(p);
 const until=async(f,a,ms)=>{if(typeof a=='number'){ms=a;a=undefined}ms=ms||15000;const t0=Date.now();while(Date.now()-t0<ms){if(await E(f,a))return true;await W(100)}return false};
 const LOOK={g:'m',wd:{cheveux:'nat|0',haut:'hoodie|2',bas:'jean|0',chaussures:'basket|1',tete:'casq|3',sac:'sac|0'}};
 const sit=async(salle,look)=>{await E(([s,L])=>{if(L){N.look.g=L.g;N.look.wd=Object.assign({},L.wd)}spKey='';N.cine={billet:{s,t:CINE.FILMS[s-1].t},snacks:{pop:1,boi:1,bon:0},vus:0};CINE.setRoom('cine_s'+s);C.x=1.6*12;C.y=88+DOORS[1]*5;C.st='idle';
  const f=PLACES['cine_s'+s].furn.filter(f=>f.n=='Rangee')[1];CINE.sitIn(f,CINE.freeSeat(f))},[salle,look]);return until(()=>CINE.CM.open,25000)};
 // ---- 1. passage en mode cinéma ----
 const opened=await sit(1,LOOK);const dims=await E(()=>CINE.CI.dim);await W(700);
 const cover=await E(()=>{const el=document.getElementById('cineMode'),r=el.getBoundingClientRect(),pts=[[5,5],[innerWidth-5,5],[innerWidth/2,innerHeight/2],[5,innerHeight-5],[innerWidth-5,innerHeight-5]];
  return{full:r.width>=innerWidth-1&&r.height>=innerHeight-1,top:pts.every(([x,y])=>el.contains(document.elementFromPoint(x,y))),fade:el.classList.contains('on'),start:!document.getElementById('cmStart').hidden,st:C.st}});
 await p.screenshot({path:`${O}/mc_${mode}_01_debut.png`});
 ok(T('1 assis avec un billet : lumières baissées, transition en fondu vers le mode cinéma plein écran, jauges et interface du jeu masquées'),opened&&dims>.3&&cover.full&&cover.top&&cover.fade&&cover.start&&cover.st=='cine',{opened,dims,cover});
 // ---- 2. le film est réellement lu (image et son) ----
 await p.click('#cmGo');const playing=await until(()=>CINE.CM.v.currentTime>.5&&!CINE.CM.v.paused,15000);const t1=await E(()=>CINE.CM.v.currentTime);await W(2000);
 const vid=await E(()=>{const V=CINE.CM.v;return{t:V.currentTime,dur:V.duration,rs:V.readyState,w:V.videoWidth,h:V.videoHeight,src:V.currentSrc.split('/').slice(-2).join('/'),audio:V.webkitAudioDecodedByteCount,video:V.webkitVideoDecodedByteCount,st:CINE.CM.state}});
 ok(T('2 vraie vidéo lue (fichier MP4 H.264 + AAC) : le temps avance, images et son décodés, durée réelle de 2 min'),playing&&vid.t-t1>1.5&&vid.rs>=3&&vid.w==640&&vid.h==360&&Math.abs(vid.dur-120)<.5&&vid.audio>10000&&vid.video>10000&&vid.src=='films/petit-robot.mp4'&&vid.st=='play',vid);
 // ---- 3. composition : le film occupe la majeure partie de l'écran ----
 const lay=await E(()=>{const r=CINE.CM.v.getBoundingClientRect();return{fw:Math.round(r.width),fh:Math.round(r.height),W:innerWidth,H:innerHeight,part:+(r.width*r.height/(innerWidth*innerHeight)).toFixed(2),bust:!!CINE.CM.bust,heads:CINE.CM.heads.length}});
 ok(T('3 composition : film le plus grand possible (toute la largeur en portrait, la majorité de l’écran en paysage), fauteuils, spectateurs de dos et Nori au premier plan'),(tel?lay.fw==lay.W:lay.part>=.5)&&lay.bust&&lay.heads==6,lay);
 // ---- 4. Nori garde exactement sa tenue ----
 const look=await E(()=>{const g=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,B=CINE.CM.bust;const mk=L=>{drawFrame('dk0',L);const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);return c};
  const same=(L)=>{const c=mk(L),x=c.getContext('2d');let y0=CH,x0=CW;const d=x.getImageData(0,0,CW,CH).data;for(let y=0;y<CH;y++)for(let xx=0;xx<CW;xx++)if(d[(y*CW+xx)*4+3]>20){if(y<y0)y0=y;if(xx<x0)x0=xx}
   const o=x.getImageData(x0,y0,B.width,B.height).data,b=g(B);let eq=0;for(let i=0;i<b.length;i+=4)if(b[i]==o[i]&&b[i+1]==o[i+1]&&b[i+2]==o[i+2]&&b[i+3]==o[i+3])eq++;return eq/(b.length/4)};
  const r={avec:same(N.look),sans:same(Object.assign({},N.look,{wd:{cheveux:N.look.wd.cheveux}})),wd:JSON.stringify(N.look.wd)};spKey='';return r});
 ok(T('4 Nori porte exactement sa tenue (image identique au personnage du jeu avec ses vêtements : casquette, sweat, sac)'),look.avec==1&&look.sans<.9&&/casq/.test(look.wd)&&/hoodie/.test(look.wd),look);
 // ---- 5. Nori reste assis, aucun déplacement pendant la séance ----
 const pos0=await E(()=>[C.x,C.y,C.st]);await p.mouse.click(tel?200:700,tel?700:600);await W(1500);const pos1=await E(()=>[C.x,C.y,C.st]);
 ok(T('5 pendant la séance Nori reste assis et ne peut pas se déplacer (toucher l’écran ne le fait pas bouger)'),pos0.join()==pos1.join()&&pos1[2]=='cine',{pos0,pos1});
 // ---- 6-8. interface : pause, progression, volume ----
 await E(()=>{const u=document.getElementById('cmUi');u.classList.add('on')});await p.click('#cmPlay');await W(300);const pa=await E(()=>({p:CINE.CM.v.paused,t:CINE.CM.v.currentTime,st:CINE.CM.state}));await W(1000);const pa2=await E(()=>CINE.CM.v.currentTime);
 await p.click('#cmPlay');await W(1200);const re=await E(()=>({p:CINE.CM.v.paused,t:CINE.CM.v.currentTime}));
 ok(T('6 pause puis reprise de la lecture'),pa.p&&pa.st=='pause'&&Math.abs(pa2-pa.t)<.05&&!re.p&&re.t>pa.t+.5,{pa,pa2,re});
 const prog=await E(()=>({w:document.getElementById('cmFill').style.width,txt:document.getElementById('cmTime').textContent}));
 ok(T('7 progression du film affichée (barre et temps « 0:07 / 2:00 »)'),parseFloat(prog.w)>0&&/^\d:\d\d \/ 2:00$/.test(prog.txt),prog);
 await E(()=>{const v=document.getElementById('cmVol');v.value='0.4';v.dispatchEvent(new Event('input'))});const v1=await E(()=>({vol:CINE.CM.v.volume,saved:N.cine.vol}));await E(()=>document.getElementById('cmUi').classList.add('on'));await p.click('#cmMute');const m1=await E(()=>({muted:CINE.CM.v.muted,icon:document.getElementById('cmMute').textContent}));await p.click('#cmMute');const m2=await E(()=>CINE.CM.v.muted);
 ok(T('8 réglage du volume (mémorisé) et coupure du son'),Math.abs(v1.vol-.4)<.01&&v1.saved==.4&&m1.muted&&m1.icon=='🔇'&&!m2,{v1,m1,m2});
 // ---- 9-10. sous-titres et réactions ----
 await E(()=>{CINE.CM.v.currentTime=31.2});await W(1600);const sr=await E(()=>({sub:document.getElementById('cmSub').textContent,react:CINE.CM.react&&CINE.CM.react.k}));await p.screenshot({path:`${O}/mc_${mode}_02_film.png`});
 ok(T('9 dialogues sous-titrés au bon moment'),/tas de ferraille/.test(sr.sub),sr);
 ok(T('10 Nori réagit aux scènes (rire quand Plume se moque de Bip)'),sr.react=='rire',sr);
 ok(T('11 la musique du jeu se tait pendant la séance (seul le son du film)'),(await E(()=>themeNow()=='cinefilm'&&MTH.cinefilm.v==0)),{});
 // ---- 12. quitter en cours de film ----
 await E(()=>document.getElementById('cmUi').classList.add('on'));await p.click('#cmQuit');await W(700);const q=await E(()=>({open:CINE.CM.open,film:CINE.CI.film,billet:N.cine.billet,st:C.st,hid:document.getElementById('cineMode').hidden,msg:document.getElementById('status').textContent}));
 ok(T('12 quitter la séance : retour propre dans la salle, billet conservé, Nori toujours assis'),!q.open&&q.hid&&q.film==null&&q.billet&&q.billet.s==1&&q.st=='cine'&&/billet reste valable/.test(q.msg),q);
 // ---- 13. fin du film : lumières, message, retour au jeu ----
 await E(()=>{CINE.standUpCine()});const reo=await sit(2,{g:'f',wd:{cheveux:'long|0',robe:'rete|1',tete:'bandeau|1',bijou:'collier|0'}});await p.click('#cmGo');await until(()=>CINE.CM.v.currentTime>.5,15000);
 await E(()=>{CINE.CM.v.currentTime=CINE.CM.v.duration-1.2});const ended=await until(()=>CINE.CM.state=='end',8000);await W(1500);const endShot=await E(()=>({fin:!document.getElementById('cmEnd').hidden,l:CINE.CM.lights}));await p.screenshot({path:`${O}/mc_${mode}_03_fin.png`});
 await until(()=>!CINE.CM.open,9000);const dimA=await E(()=>CINE.CI.dim);await W(800);const dimB=await E(()=>CINE.CI.dim);await W(1500);
 const back=await E(()=>({open:CINE.CM.open,place,st:C.st,billet:N.cine.billet,vus:N.cine.vus,pop:N.cine.snacks.pop,msg:document.getElementById('status').textContent,saved:Object.keys(localStorage).some(k=>(localStorage.getItem(k)||'').includes('"vus":1'))}));
 const up=await E(()=>{CINE.standUpCine();const x=C.x;goto(C.x+24,C.y-10);return{st:C.st,x}});await W(1200);const moved=await E(()=>C.x);await p.screenshot({path:`${O}/mc_${mode}_04_retour.png`});
 ok(T('13 fin du film : lecture arrêtée, « FIN », lumières qui se rallument progressivement, retour à la vue de la salle, Nori peut se lever et marcher, progression sauvegardée'),
  reo&&ended&&endShot.fin&&endShot.l>.1&&!back.open&&back.place=='cine_s2'&&back.st=='cine'&&dimA>dimB&&back.billet==null&&back.vus==1&&back.pop==0&&/FIN/.test(back.msg)&&back.saved&&up.st=='walk'&&Math.abs(moved-up.x)>2,{ended,endShot,dimA,dimB,back,up,moved});
 // ---- 14. paysage pendant le film (téléphone) ----
 if(tel){await E(()=>{CINE.standUpCine()});await sit(3);await p.click('#cmGo');await until(()=>CINE.CM.v.currentTime>.5,15000);await p.setViewportSize({width:844,height:390});await W(800);
  const ls=await E(()=>{const r=CINE.CM.v.getBoundingClientRect(),el=document.getElementById('cineMode');return{part:+(r.width*r.height/(innerWidth*innerHeight)).toFixed(2),top:el.contains(document.elementFromPoint(innerWidth/2,innerHeight/2)),play:!CINE.CM.v.paused}});
  await p.screenshot({path:`${O}/mc_${mode}_05_paysage.png`});await p.setViewportSize({width:390,height:844});await E(()=>CINE.CM.close(false));
  ok(T('14 téléphone tourné pendant le film : le film s’agrandit (majorité de l’écran) et continue'),ls.part>=.5&&ls.top&&ls.play,ls)}
 // ---- 16. porte d'une salle : vue spectateur directe ----
 const dir=await E(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),wait=async(f,n=200)=>{let t=0;while(!f()&&t<n){await w(100);t++}return f()};if(CINE.CM.open){CINE.CM.close(false);await w(700)}
  CINE.standUpCine();CINE.setRoom('cine_couloir');C.x=6*12;C.y=88+6*5;C.st='idle';N.cine={billet:null,snacks:{pop:0,boi:0,bon:0},vus:0};CINE.ciUI();
  [...document.querySelectorAll('#ciG .tile')].find(b=>/Salle 2/.test(b.textContent)).click();await wait(()=>/billet/.test(document.getElementById('status').textContent)&&C.st=='idle',150);
  const refus={place,open:CINE.CM.open,msg:document.getElementById('status').textContent};
  N.cine.billet={s:2,t:'MISSION ÉTOILE'};const t0=Date.now();[...document.querySelectorAll('#ciG .tile')].find(b=>/Salle 2/.test(b.textContent)).click();
  let sawIso=false;const ok1=await wait(()=>{if(place=='cine_s2'&&!CINE.CM.open&&C.st!='cine')sawIso=true;return CINE.CM.open},250);await wait(()=>CINE.CM.v.currentTime>.5,150);
  const vue={open:ok1,place,st:C.st,sawIso,play:!CINE.CM.v.paused&&CINE.CM.v.currentTime>.5,secs:((Date.now()-t0)/1000).toFixed(1)};
  CINE.CM.v.currentTime=CINE.CM.v.duration-1;await wait(()=>!CINE.CM.open,150);await w(600);
  const d=PLACES.cine_couloir.doors.find(o=>o.to=='cine_s2');return{refus,vue,fin:{place,st:C.st,u:+(C.x/12).toFixed(2),v:+((C.y-88)/5).toFixed(2),porte:(d.a+d.b)/2,billet:N.cine.billet,vus:N.cine.vus}}});
 await p.screenshot({path:`${O}/mc_${mode}_06_sortie.png`});
 ok(T('16 porte de la salle : sans billet le contrôleur refuse ; avec billet, directement en vue spectateur (aucune scène pour s’asseoir), film lancé ; à la fin retour dans le couloir devant la porte'),
  dir.refus.place=='cine_couloir'&&!dir.refus.open&&/billet/.test(dir.refus.msg)&&dir.vue.open&&!dir.vue.sawIso&&dir.vue.st=='cine'&&dir.vue.play&&dir.fin.place=='cine_couloir'&&dir.fin.st=='idle'&&Math.abs(dir.fin.u-dir.fin.porte)<.3&&dir.fin.v<1.6&&dir.fin.billet==null&&dir.fin.vus==1,dir);
 ok(T('15 aucune erreur JavaScript'),errs.length==0,errs);await ctx.close()}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const modes=process.argv[2]?[process.argv[2]]:['tel','pc'];for(const m of modes)await session(b,m);await b.close();
 const ko=R.filter(r=>!r.ok).length;console.log(`\n${R.length-ko}/${R.length} tests réussis`);fs.writeFileSync(`${O}/mc_resultats.json`,JSON.stringify(R,null,1));process.exit(ko?1:0)})();
