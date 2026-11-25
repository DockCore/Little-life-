// Tests réels du système musical et sonore (gestionnaire LLSON) : chaque lieu, chaque mini-jeu, transitions, volumes,
// sauvegarde, absence de superposition, mixage, sonorités (aucune onde carrée « 8 bits »), orientation et interruptions.
// Usage : node rue/tests/musique_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,650):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});let p=await ctx.newPage();const errs=[];
 const watch=pg=>{pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())})};watch(p);
 // espion : types d'oscillateurs créés par le contexte temps réel (aucune onde carrée pour la musique)
 await p.addInitScript(()=>{window.__osc={};const f=BaseAudioContext.prototype.createOscillator;BaseAudioContext.prototype.createOscillator=function(){const o=f.call(this);const st=Object.getOwnPropertyDescriptor(OscillatorNode.prototype,'type');
  const ctxRef=this;let ty='sine';Object.defineProperty(o,'type',{get(){return ty},set(v){ty=v;if(ctxRef instanceof AudioContext&&window.__oscOn)window.__osc[v]=(window.__osc[v]||0)+1;st.set.call(o,v)}});return o}});
 await p.goto(JEU);await p.waitForTimeout(1500);let E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
 const S=()=>E(()=>LLSON.state());
 // attend que la musique voulue soit en place (fondu terminé)
 const settle=async(id,max)=>{for(let i=0;i<(max||40);i++){const s=await S();if(s.cur===id&&(s.phase=='play'||s.phase=='in'||(s.phase=='idle'&&!LLSON_has(id))))return s;await W(150)}return S()};
 const LLSON_has=id=>true;
 // ---- 1. menu : musique signature après la première interaction (règle des navigateurs) ----
 const pre=await S();await p.touchscreen.tap(200,420);await W(400);const m1=await settle('menu');
 ok('1 aucun son avant la première interaction ; menu principal : musique signature (électronique chaleureuse) dès le premier toucher',pre.ctx==null&&m1.cur=='menu'&&m1.ctx=='running',{pre,m1});
 await E(()=>{const i=document.getElementById('intro');if(i)i.remove();tscr.hidden=true;document.getElementById('crOk2').click()});
 // ---- 2. maison : UNE musique pour toute la maison ; aucune action ne la change ni ne la relance ----
 const room=async(set,id,arg)=>{await E(set,arg);return settle(id)};
 const sal=await settle('maison');for(let i=0;i<40&&(await S()).phase!='play';i++)await W(150);
 // espion : relevé continu du morceau, de la phase et du niveau pendant toute la série d'actions
 await E(()=>{window.__mu=[];window.__muI=setInterval(()=>{const s=LLSON.state();window.__mu.push([s.cur,s.phase,+s.fade.toFixed(3)])},100)});
 const log0=(await E(()=>LLSON.log())).length;
 const acts=[];const act=async(nom,f,ms)=>{await E(f);await W(ms||900);acts.push([nom,(await S()).cur])};
 for(let i=0;i<4;i++)await act('marcher',i=>{goto(40+i*14,110)},400);
 await act('manger (à table)',()=>{C.st='idle';show('table')},1500);await act('quitter la table',()=>show('home'));
 await act('dormir',()=>{N.energy=0;if(C.st!='sleep')toggleSleep()},2500);await act('se réveiller',()=>{if(C.st=='sleep')toggleSleep()},1200);
 await act('douche',()=>{C.st='shower'});await act('toilettes',()=>{C.st='wc'});await act('laver',()=>{C.st='idle';show('wash')});
 await act('bureau',()=>show('desk'));await act('travailler',()=>show('work'));await act('décorer',()=>show('deco'));await act('habiller',()=>show('dress'));
 await act('canapé',()=>show('sofa'));await act('ouvrir le menu',()=>document.getElementById('bMenu').click());await act('fermer le menu',()=>document.getElementById('bMenu').click());
 await act('retour',()=>{show('home');C.st='idle'},1200);
 const muH=await E(()=>{clearInterval(window.__muI);return window.__mu});const ev=(await E(()=>LLSON.log())).slice(log0).filter(e=>e.ev=='début'||e.ev=='fondu-sortant'||e.ev=='zone');
 const curs=[...new Set(muH.map(x=>x[0]))],phases=[...new Set(muH.map(x=>x[1]))],fz=muH.map(x=>x[2]),fmin=Math.min(...fz),fmax=Math.max(...fz);
 ok('2 maison : une seule musique du début à la fin de '+acts.length+' actions (marcher, manger, dormir, douche, toilettes, bureau, travail, déco, habits, canapé, menu) : ni changement, ni relance, ni variation de volume',
  sal.cur=='maison'&&curs.join()=='maison'&&phases.join()=='play'&&ev.length==0&&fmax-fmin<.02&&acts.every(a=>a[1]=='maison'),{curs,phases,ev,fmin,fmax,n:muH.length});
 // ---- 3. transition : fondu sortant complet, puis fondu entrant ; jamais deux morceaux ensemble ----
 const tr=await E(()=>new Promise(res=>{const sm=[];const t0=performance.now();streetEnter();const iv=setInterval(()=>{const s=LLSON.state();sm.push([Math.round(performance.now()-t0),s.cur,s.phase,+s.fade.toFixed(3)]);if(performance.now()-t0>4200){clearInterval(iv);res(sm)}},60)}));
 const outS=tr.filter(x=>x[1]=='maison'),inS=tr.filter(x=>x[1]=='rue'),firstIn=inS[0],lastOut=outS[outS.length-1];const fo=outS.filter(x=>x[2]=='out'),mono=fo.length>5&&fo.every((x,i)=>i==0||x[3]<=fo[i-1][3]+1e-6);
 ok('3 changement réel de lieu (maison → rue) : la musique quittée descend jusqu’au silence (~1,2 s), puis la nouvelle monte (~1,8 s) ; jamais deux morceaux ensemble',
  outS.length>8&&mono&&lastOut[3]<.08*outS[0][3]&&firstIn&&firstIn[3]<.1&&inS[inS.length-1][3]>.5&&firstIn[0]-outS[0][0]>=900,{debutFondu:outS[0],finFondu:lastOut,entree:firstIn,fin:inS[inS.length-1]});
 // fondus réglables
 const cf=await E(()=>{const P=LLSON.prefs();P.fo=.4;P.fi=.5;return true});await settle('rue');await E(()=>{arrive('home')});await settle('maison');const lg=(await E(()=>LLSON.log())).filter(e=>e.ev=='fondu-sortant'||e.ev=='début').slice(-2);
 await E(()=>{const P=LLSON.prefs();P.fo=1.2;P.fi=1.8});
 ok('4 durées de fondu réglables (sortant / entrant)',lg[0]&&lg[0].d==.4&&lg[1].d==.5,lg);
 // allers-retours rapides : pas de changement si l'on ne reste pas (stabilité de zone)
 const flick=await E(()=>new Promise(res=>{const n0=LLSON.log().length;streetEnter();setTimeout(()=>{arrive('home');setTimeout(()=>res(LLSON.log().slice(n0).filter(e=>e.ev=='fondu-sortant').length),1200)},200)}));
 ok('5 passage éclair dans un autre lieu (0,2 s) : aucune transition déclenchée',flick==0,{flick});
 // ---- 6. rue ↔ maison, bâtiments, magasins ----
 const rue=await room(()=>{streetEnter()},'rue');const amb1=await S();
 const places={};for(const pl of['office','store','clothes','grocery','pets','cafe','gym','resto']){const s=await room(pl=>{arrive(pl)},pl,pl);places[pl]=[s.cur,s.amb]}
 const home=await room(()=>{arrive('home');C.st='idle'},'maison'),rue2=await room(()=>{streetEnter()},'rue');
 ok('6 rue (indie électronique) ↔ maison ; bureau, boutique déco, vêtements, épicerie, animalerie, café, salle de sport : chacun sa musique et son ambiance',
  rue.cur=='rue'&&amb1.amb=='rue'&&Object.entries(places).every(([k,v])=>v[0]==k&&v[1]==k)&&home.cur=='maison'&&rue2.cur=='rue',{places,amb:amb1.amb});
 // ---- 7. cinéma : entrée, couloir, salle, film (silence), toilettes, salle privée, sortie ----
 const ci={};for(const pl of['cine_hall','cine_couloir','cine_s1','cine_wc','cine_prive']){const id=pl=='cine_s1'?'cine_salle':pl;const s=await room(pl=>{arrive(pl)},id,pl);ci[pl]=s.cur}
 await room(()=>{arrive('cine_s1')},'cine_salle');for(let i=0;i<40&&(await S()).phase!='play';i++)await W(150);
 const film=await E(()=>new Promise(r=>{const n0=LLSON.log().length;const tn=themeNow;window.__tn=tn;themeNow=()=>String(place).startsWith('cine_')?'cinefilm':tn();setTimeout(()=>r(Object.assign(LLSON.state(),{ev:LLSON.log().slice(n0).filter(e=>e.ev=='fondu-sortant').length})),3500)}));
 const after=await E(()=>new Promise(r=>{themeNow=window.__tn;setTimeout(()=>r(LLSON.state()),3500)}));const out=await room(()=>{streetEnter()},'rue');
 ok('7 cinéma : hall, couloir, salle, toilettes et salle privée ont chacun leur musique ; regarder le film ne change pas la musique de la salle ; à la sortie, retour à la rue',
  ci.cine_hall=='cine_hall'&&ci.cine_couloir=='cine_couloir'&&ci.cine_s1=='cine_salle'&&ci.cine_wc=='cine_wc'&&ci.cine_prive=='cine_prive'&&film.cur=='cine_salle'&&film.ev==0&&after.cur=='cine_salle'&&out.cur=='rue',{ci,film,after:after.cur});
 // ---- 8. arcade et chaque mini-jeu : sa propre musique, et retour à la borne / à la rue ----
 await E(()=>{const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});const ar=await settle('arcade');
 const games={};for(const[id,expect]of[['pinball',/^pb_/],['racing',/^racing$/],['mole',/^mole$/],['maze',/^maze$/],['claw',/^claw$/],['hockey',/^hockey$/],['bubble',/^bubble$/],['boxes',/^boxes$/],['stack',/^st[A-Z]/]]){
  await E(id=>{ARC.sel=ARC.games.findIndex(g=>g.id==id);arcOk();arcOk()},id);let s;for(let i=0;i<30;i++){await W(150);s=await S();if(expect.test(s.cur||'')&&s.phase!='out')break}
  await E(()=>arcBack());await W(250);const back=await settle('arcade',30);games[id]=[s.cur,back.cur]}
 const ok8=Object.entries(games).every(([k,v])=>v[1]=='arcade')&&games.pinball[0].startsWith('pb_')&&games.stack[0].startsWith('st')&&['racing','mole','maze','claw','hockey','bubble','boxes'].every(k=>games[k][0]==k);
 await E(()=>arcQuit());const ar2=await settle('rue');
 ok('8 salle d’arcade (électro moderne) ; chaque mini-jeu lance SA musique (jamais celle de la salle) et la fermeture rend l’ambiance de la borne ; en sortant, la rue',ar.cur=='arcade'&&ok8&&ar2.cur=='rue',{games,ar2:ar2.cur});
 // ---- 9. bowling ----
 await E(()=>{const b=STC.buildings.find(q=>q.id=='bowling');STV.px=b.x+b.door.x;stInteract()});const bw=await settle('bowling');await E(()=>bwQuit());const bw2=await settle('rue');
 ok('9 bowling : musique nu-disco à l’entrée, retour à la rue en sortant',bw.cur=='bowling'&&bw2.cur=='rue',{bw:bw.cur,bw2:bw2.cur});
 // ---- 10. jamais deux musiques : un seul séquenceur, l'ancien système et l'ancien moteur des mini-jeux ne jouent plus ----
 const solo=await E(()=>({jeuson:JEUSON._state(),old:typeof curTh!='undefined'?curTh:'',ctxs:[typeof AC!='undefined'&&AC===LLSON.bus().c,JEUSON.ctx()===LLSON.bus().c]}));
 ok('10 un seul contexte audio et un seul lecteur de musique (l’ancien moteur de Little Life et celui des mini-jeux ne jouent plus rien)',solo.ctxs.every(Boolean)&&!solo.old,solo);
 // ---- 11. réglages : trois volumes indépendants + coupure générale, depuis le vrai menu ----
 await E(()=>{document.getElementById('bMenu').click()});await W(300);const sl=await E(()=>[...document.querySelectorAll('#gSon input')].map(i=>i.dataset.k));
 const setSl=(k,v)=>E(([k,v])=>{const i=document.querySelector('#gSon input[data-k="'+k+'"]');i.value=v;i.dispatchEvent(new Event('input'))},[k,v]);
 await p.screenshot({path:`${O}/mu_01_menu_son.png`});
 await setSl('m',40);await setSl('s',100);await setSl('a',0);await W(600);const g1=await E(()=>{const B=LLSON.bus();return{m:+B.musBus.gain.value.toFixed(3),s:+B.sfxBus.gain.value.toFixed(3),a:+B.ambBus.gain.value.toFixed(3),P:Object.assign({},LLSON.prefs())}});
 await E(()=>document.getElementById('gMus').click());await W(900);const mu=await E(()=>({g:LLSON.bus().master.gain.value,lab:document.querySelector('#gMus b').textContent,P:LLSON.prefs().mute}));
 await E(()=>document.getElementById('gMus').click());await W(500);const mu2=await E(()=>LLSON.bus().master.gain.value);
 await E(()=>bMus.click());await W(900);const bm=await E(()=>LLSON.bus().master.gain.value);await E(()=>bMus.click());await W(400);
 ok('11 trois volumes indépendants (musique, effets, ambiances) réglés dans le menu ; coupure générale par le menu et par le bouton ♪',sl.join()=='m,s,a'&&g1.m<.2&&g1.s>1.5&&g1.a<.01&&mu.g<.01&&mu.lab=='Coupé'&&mu.P&&mu2>.95&&bm<.01,{g1,mu,mu2,bm});
 // les effets des mini-jeux passent bien par le bus « effets »
 const fxb=await E(()=>JEUSON.ctx()&&LLSON.sfxIn()!=null);
 // ---- 12. sauvegarde des préférences (rechargement complet) ----
 await E(()=>{save()});await W(300);await p.reload();await W(1800);E=(f,a)=>p.evaluate(f,a);await p.touchscreen.tap(200,420);await W(800);
 const pr=await E(()=>({P:N.audio,g:(()=>{const B=LLSON.bus();return B?{m:+B.musBus.gain.value.toFixed(3),a:+B.ambBus.gain.value.toFixed(3)}:null})()}));
 ok('12 préférences sauvegardées avec la partie et réappliquées après rechargement ; effets des mini-jeux sur le bus « effets »',pr.P&&pr.P.m==.4&&pr.P.s==1&&pr.P.a==0&&pr.g&&pr.g.m<.2&&pr.g.a<.01&&fxb,pr);
 await E(()=>{LLSON.set('m',.8);LLSON.set('s',.85);LLSON.set('a',.6)});await E(()=>{const i=document.getElementById('intro');if(i)i.remove();tscr.hidden=true});
 // ---- 13. orientation et interruptions ----
 let o0=await S();for(let i=0;i<40&&!(o0.cur&&o0.cur===(await E(()=>LLSON.zone()))&&o0.phase!='out');i++){await W(200);o0=await S()}await p.setViewportSize({width:844,height:390});await W(1200);const o1=await S();await p.setViewportSize({width:390,height:844});await W(1200);const o2=await S();
 await E(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await W(300);const h1=await S();
 await E(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await W(600);const h2=await S();
 ok('13 rotation portrait ↔ paysage : la musique continue sans coupure ni redémarrage ; application en arrière-plan : son suspendu, puis repris au retour',!!o0.cur&&o1.cur==o0.cur&&o2.cur==o0.cur&&o2.ctx=='running'&&h1.ctx=='suspended'&&h2.ctx=='running'&&h2.cur==o0.cur,{o0:o0.cur,o1:[o1.cur,o1.ctx],o2:[o2.cur,o2.ctx],h1:h1.ctx,h2:h2.ctx});
 // ---- 14. sonorités modernes : aucune onde carrée jouée par la musique, pendant 6 lieux ----
 await E(()=>{window.__osc={};window.__oscOn=true});for(const z of['menu','rue','cafe','arcade','gym','cine_hall'])await E(z=>LLSON.want(z),z),await W(2500);const osc=await E(()=>{window.__oscOn=false;return window.__osc});
 ok('14 aucune sonorité 8 bits : pas une seule onde carrée dans les musiques (sinus, triangles et scies filtrées seulement)',!osc.square&&(osc.sine||0)>0,osc);
 // ---- 15. mixage et structure de toutes les musiques (rendu hors ligne) ----
 const mx=await E(async()=>{const o={},ids=LLSON.themes().filter(i=>LLSON.theme(i));for(const id of ids){const T=LLSON.theme(id),bars=T.form.reduce((a,f)=>a+f[1],0),sec=bars*16*60/T.bpm/4;const x=await LLSON.render(id,6,{fromBar:12});o[id]={rms:+x.rms.toFixed(3),peak:+x.peak.toFixed(2),cycle:Math.round(sec),bars}}return o});
 const rv=Object.values(mx),db=v=>20*Math.log10(v),lo=Math.min(...rv.map(v=>v.rms)),hi=Math.max(...rv.map(v=>v.rms));
 ok('15 mixage homogène de '+rv.length+' musiques (écart de niveau ≤ 6 dB, aucune saturation) ; chaque morceau : au moins 100 mesures et 3 min avant de reboucler',
  rv.length>=35&&db(hi)-db(lo)<=6&&rv.every(v=>v.peak<.95&&v.bars>=100&&v.cycle>=180&&v.cycle<=330),{ecartDb:+(db(hi)-db(lo)).toFixed(1),min:lo,max:hi,exemples:Object.fromEntries(Object.entries(mx).slice(0,6))});
 // ---- 16. identité : aucun lieu ne partage sa musique avec un autre ----
 const ids=await E(()=>{const z=['menu','maison','rue','office','store','clothes','grocery','pets','cafe','gym','resto','cine_hall','cine_couloir','cine_salle','cine_wc','cine_prive','arcade','bowling'];
  const sig=z.map(id=>{const T=LLSON.theme(id);return[T.bpm,T.key,T.mode,JSON.stringify(T.prog.A)].join('|')});return{n:z.length,uniq:new Set(sig).size}});
 ok('16 '+ids.n+' lieux, '+ids.n+' compositions différentes (tempo, tonalité, harmonie) : aucune pièce ne reprend la musique d’une autre',ids.n==ids.uniq,ids);
 // ---- 17. charge : nombre de nœuds audio créés par seconde (léger pour un téléphone) ----
 await p.addInitScript(()=>{});const ld=await E(()=>new Promise(r=>{LLSON.want('arcade');setTimeout(()=>{let n=0;const B=BaseAudioContext.prototype,keep={};for(const k of['createOscillator','createGain','createBiquadFilter','createBufferSource']){keep[k]=B[k];B[k]=function(){if(this instanceof AudioContext)n++;return keep[k].apply(this,arguments)}}
  setTimeout(()=>{for(const k in keep)B[k]=keep[k];r(Math.round(n/8))},8000)},6000)}));
 ok('17 charge audio légère : moins de 80 nœuds créés par seconde sur le morceau le plus chargé (notes mises en cache, batterie précalculée)',ld<80,{noeudsParSeconde:ld});
 // ---- 18. composition : vraies formes, aucune note longue, aucune boucle évidente (partition complète de chaque lieu) ----
 const cp=await E(()=>{const o={};for(const id of['menu','maison','rue','office','store','clothes','grocery','pets','cafe','gym','resto','cine_hall','cine_couloir','cine_salle','cine_prive','cine_wc','arcade','bowling']){
  const sc=LLSON.score(id),B=sc.bar,bars=[];for(let i=0;i<sc.bars;i++)bars.push([]);for(const n of sc.notes){const bi=Math.floor(n[3]/B+1e-6);if(bars[bi])bars[bi].push(n[0]+n[1]+n[2]+'@'+Math.round((n[3]-bi*B)/B*16))}
  const sig=bars.map(x=>x.sort().join('|'));let run=0,maxRun=0;for(let i=4;i<sig.length;i++){run=sig[i]==sig[i-4]?run+1:0;maxRun=Math.max(maxRun,run)}
  const mel=sc.notes.filter(n=>n[0]=='mel'),ph=new Set();for(let q=0;q<sc.bars/4;q++){const s=mel.filter(n=>n[3]>=q*4*B-1e-6&&n[3]<(q+1)*4*B-1e-6).map(n=>n[2]+'@'+Math.round((n[3]-q*4*B)/B*16)).join(',');if(s)ph.add(s)}
  const longest=Math.max(...sc.notes.filter(n=>n[0]!='pd').map(n=>n[4])),pd=sc.notes.filter(n=>n[0]=='pd');
  o[id]={sec:Math.round(sc.sec),parts:sc.form.length,uniq:new Set(sig).size/sc.bars,maxRun4:maxRun,phrases:ph.size,pitches:new Set(mel.map(n=>n[2])).size,longest,pdBars:new Set(pd.map(n=>Math.floor(n[3]/B))).size,pdMax:Math.max(0,...pd.map(n=>n[4]))}}return o});
 const cv=Object.values(cp);
 ok('18 composition : 18 morceaux de 3 à 5 min en 9 parties (intro, couplets, montée, refrains, pause, pont, final), mélodie de 9 notes ou plus en au moins 15 phrases différentes, au moins 70 % de mesures toutes différentes, jamais plus de 4 mesures copiées d’affilée ; aucune note de plus de 0,5 s (nappes ≤ 1,4 s et seulement dans l’intro et la pause)',
  cv.every(v=>v.sec>=180&&v.sec<=330&&v.parts>=9&&v.pitches>=9&&v.phrases>=15&&v.uniq>=.7&&v.maxRun4<=4&&v.longest<=.5&&v.pdMax<=1.4&&v.pdBars<=12),cp);
 ok('19 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();const n=R.filter(r=>r.ok).length;console.log(n+'/'+R.length+' tests réussis');fs.writeFileSync(`${O}/musique_resultats.json`,JSON.stringify(R,null,1));process.exit(n==R.length?0:1)})();
