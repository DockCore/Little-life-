// Tests réels de la garde-robe « 10 tenues complètes » (Playwright + Chrome).
// Usage : node rue/tests/garderobe_tests.js [tel|pc|paysage]
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const {chromium}=require(PW);
const JEU='file://'+path.resolve(__dirname,'../../index.html')+'?orient=libre';const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const MODE=process.argv[2]||'tel';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext(MODE=='pc'?{viewport:{width:1280,height:800}}:MODE=='paysage'?{viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true}:{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);let n=0,okN=0;
 const ok=(t,c,d)=>{n++;if(c)okN++;console.log((c?'OK   ':'ÉCHEC ')+t+'  '+JSON.stringify(d===undefined?'':d).slice(0,600))};
 const start=async(pre)=>{await p.goto(JEU);if(pre)await E(pre);await W(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}const c=document.getElementById('crOk2');if(c&&creating)c.click()});await W(1200)};
 const shot=async k=>p.screenshot({path:`${O}/gr_${MODE}_${k}.png`});
 await start(()=>localStorage.clear());

 // 1. catalogue
 const cat=await E(()=>({n:TN.length,ids:TN.map(t=>t.id),pals:TN.every(t=>t.pals.length==3),parts:TN.every(t=>['m','f'].every(g=>Object.values(tnParts(t,g)).every(id=>WCAT[id]))),
  noOld:TN.every(t=>['m','f'].every(g=>Object.values(tnParts(t,g)).every(id=>WCAT[id].piece||WCAT[id].legacy||id=='collier')))}));
 ok('1 dix tenues complètes, trois associations de couleurs chacune, pièces définies pour homme et femme',cat.n==10&&cat.pals&&cat.parts&&cat.noOld,cat);

 // 2-4. rendu de toutes les images, toutes tenues, deux personnages
 const R=await E(()=>{window.CAPDBG={};const fr=Object.keys(SPR).filter(k=>!k.startsWith('F_')&&!/^(tb_|s\d|si|dc|tl)/.test(k));const out={frames:fr.length,checked:0,head:[],hands:[],eyes:[],bare:[],speck:[],miss:[],skin:[],err:[]};
  const grab=(nm,L)=>{if(!drawFrame(nm,L))return null;return pcx.getImageData(0,0,CW,CH).data};
  const comps=d=>{const N=CW*CH,s=new Uint8Array(N);let small=0;for(let p=0;p<N;p++){if(s[p]||d[p*4+3]<128)continue;const q=[p];s[p]=1;let c=0;while(q.length){const a=q.pop();c++;const x=a%CW;for(const j of[x>0?a-1:-1,x<CW-1?a+1:-1,a-CW,a+CW,x>0?a-CW-1:-1,x<CW-1?a-CW+1:-1,x>0?a+CW-1:-1,x<CW-1?a+CW+1:-1]){if(j<0||j>=N||s[j]||d[j*4+3]<128)continue;s[j]=1;q.push(j)}}if(c<12)small++}return small};
  ['m','f'].forEach(g=>{const base=Object.assign({},N.look,{g,lf:0,nu:0,wd:{cheveux:'nat|0'},tn:null});wSync(base);
   const B={};fr.forEach(nm=>{B[nm]=grab(nm,base)});
   TN.forEach(t=>{t.pals.forEach((P,pi)=>{if(pi>0&&!['street','skate','urbain'].includes(t.id))return;const L=Object.assign({},base,{wd:Object.assign({cheveux:'nat|0'},tnWd(t.id,g,pi,{}))});wSync(L);
    fr.forEach(nm=>{try{const d=grab(nm,L),b0=B[nm];if(!d||!b0)return;out.checked++;const real=(g=='f'&&SPR['F_'+nm])?'F_'+nm:nm,F=FGAR[real];if(!F)return;let head=0,hand=0,diff=0;
      const lab=LAB[real],G=wGeo(real);let eye=0;const eyMin=G.hy0+Math.min((G.hy1-G.hy0)*.45,15);
      // vraies mains : pixels « main » reliés au bras (la carte d'origine marque parfois une mèche comme « main »)
      const HA=new Uint8Array(CW*CH),q=[];for(let p=0;p<CW*CH;p++){if(F.P[p]!=9)continue;const x=p%CW;if([x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW].some(j=>j>=0&&j<CW*CH&&(F.P[j]==7||F.P[j]==8))){HA[p]=1;q.push(p)}}
      while(q.length){const a=q.pop(),x=a%CW;for(const j of[x>0?a-1:-1,x<CW-1?a+1:-1,a-CW,a+CW]){if(j<0||j>=CW*CH||HA[j]||F.P[j]!=9)continue;HA[j]=1;q.push(j)}}
      for(let p=0;p<CW*CH;p++){const i=p*4,dd=d[i]!=b0[i]||d[i+1]!=b0[i+1]||d[i+2]!=b0[i+2]||d[i+3]!=b0[i+3];if(!dd)continue;diff++;if(F.P[p]==1)head++;
       // main : la main elle-même et le bout du bras en peau (poignet compris)
       if(HA[p]||((F.P[p]==7||F.P[p]==8)&&G.arm[p]>=.8&&lab&&lab[p]==1))hand++;
       // yeux : pixels sombres encadrés de peau au-dessus et au-dessous
       // visage sous la visière (yeux, joues, bouche) : jamais touché par la casquette
       const cd=CAPDBG[real];if(cd&&t.id=='skate'&&b0[i+3]&&lab&&lab[p]!=2&&(F.P[p]==1)){const v=(p%CW-cd.hx)*(cd.rx||1)+(((p/CW)|0)-cd.hy)*(cd.ry||0),w=(p%CW-cd.hx)*(cd.ux||0)+(((p/CW)|0)-cd.hy)*(cd.uy==null?-1:cd.uy);if(w<cd.eTopV+.5&&cd.face)eye++}}
      if(eye)out.eyes.push([t.id,g,nm,eye]);
      // le vêtement est bien là : torse couvert, jambes couvertes (pantalons longs), bras couverts (manches longues)
      {let tc=0,tt=0,lc=0,lt=0,ac=0,at=0;const long=!/^t_(short|shortj)$/.test((tnParts(t,g).bas||'')),sl=['street','elegant','sport','hiver','skate','casual','soiree','urbain','detente'].includes(t.id);
       for(let p=0;p<CW*CH;p++){if(!b0[p*4+3])continue;const i=p*4,ch=d[i]!=b0[i]||d[i+1]!=b0[i+1]||d[i+2]!=b0[i+2];const q=F.P[p];
        if(q>=3&&q<=5){tt++;if(ch)tc++}if((q==10||q==11)&&G.leg[p]>=0&&G.leg[p]<.85){lt++;if(ch)lc++}if((q==7||q==8)&&G.arm[p]>=0&&G.arm[p]<.6){at++;if(ch)ac++}}
       {let bare=0;for(let p=0;p<CW*CH;p++){const i=p*4;if(!d[i+3]||!lab||lab[p]!=1||F.P[p]<3||F.P[p]>6)continue;if(d[i]==b0[i]&&d[i+1]==b0[i+1]&&d[i+2]==b0[i+2])bare++}
        if(bare&&!(t.id=='estival'&&g=='f'))out.skin.push([t.id,g,nm,bare])}
       if(tt>15&&tc/tt<.8)out.miss.push([t.id,g,nm,'torse',Math.round(tc/tt*100)]);if(long&&lt>15&&lc/lt<.8)out.miss.push([t.id,g,nm,'jambes',Math.round(lc/lt*100)]);if(sl&&at>12&&ac/at<.75)out.miss.push([t.id,g,nm,'manches',Math.round(ac/at*100)])}
      if(head&&t.id!='skate')out.head.push([t.id,g,nm,head]);if(hand)out.hands.push([t.id,g,nm,hand]);if(diff<40)out.bare.push([t.id,g,nm,diff]);
      if(comps(d)>comps(b0))out.speck.push([t.id,g,nm])}catch(e){out.err.push([t.id,g,nm,e.message])}})})})});
  return out});
 ok('2 chaque tenue est redessinée sur toutes les images (face, profil, dos, 3/4, marche, course, assis, bureau, sport, cinéma, canapé…), homme et femme, sans erreur',R.err.length==0&&R.checked>2000&&R.bare.length==0,{frames:R.frames,rendus:R.checked,err:R.err.slice(0,3),nonHabille:R.bare.slice(0,5)});
 ok('2b chaque vêtement est présent sur chaque image : torse, jambes (pantalons longs) et manches (manches longues) couverts, rien ne disparaît',R.miss.length==0,{n:R.miss.length,ex:R.miss.slice(0,12)});
 ok('2c jonction cou / torse : seul le vrai cou (1 ligne sous la tête) reste en peau ; aucune peau du haut du buste visible sous le col ou la veste',R.skin.length==0,{n:R.skin.length,ex:R.skin.slice(0,10)});
 ok('3 tête, visage et cheveux jamais modifiés (seule la casquette retire les mèches cachées dessous) ; yeux jamais couverts ; mains toujours visibles, jamais couvertes par les manches',R.head.length==0&&R.hands.length==0&&R.eyes.length==0,{tete:R.head.slice(0,5),mains:R.hands.slice(0,8),yeux:R.eyes.slice(0,8)});
 ok('4 aucun pixel flottant ajouté',R.speck.length==0,R.speck.slice(0,6));

 // 5. recoloration par élément
 const rc=await E(()=>{const L=Object.assign({},N.look,{g:'m',wd:{cheveux:'nat|0'}});const a=Object.assign({},L,{wd:Object.assign({cheveux:'nat|0'},tnWd('casual','m',0,{}))}),bb=Object.assign({},L,{wd:Object.assign({cheveux:'nat|0'},tnWd('casual','m',0,{bas:'#c23b38'}))});
  drawFrame('v_front',a);const A=pcx.getImageData(0,0,CW,CH).data.slice();drawFrame('v_front',bb);const Bd=pcx.getImageData(0,0,CW,CH).data;const F=FGAR.v_front;let leg=0,other=0;
  for(let p=0;p<CW*CH;p++){const i=p*4;if(A[i]!=Bd[i]||A[i+1]!=Bd[i+1]||A[i+2]!=Bd[i+2]){if([6,10,11].includes(F.P[p]))leg++;else other++}}return{leg,other}});
 ok('5 couleur libre par élément : changer le pantalon ne touche que le pantalon (ombres et contours conservés)',rc.leg>100&&rc.other<12,rc);

 // 6. magasin
 await E(()=>{N.coins=150;arrive('clothes')});await W(2600);
 const shop=await E(()=>({cards:[...document.querySelectorAll('#clList .tnc')].map(c=>c.dataset.tn),tabs:[...document.querySelectorAll('#clSeg button[data-m]')].map(b=>b.textContent),
  dis:[...document.querySelectorAll('#clList .tnc')].filter(c=>c.querySelector('button').disabled).map(c=>c.dataset.tn)}));await shot('01_magasin');
 ok('6 le magasin ne vend que les 10 tenues complètes (plus les coiffures) ; tenue trop chère = bouton grisé',shop.cards.length==10&&!shop.tabs.some(t=>/Hauts|Chaussures/.test(t))&&shop.dis.includes('soiree'),shop);
 await E(()=>document.querySelectorAll('#clList .tnc[data-tn=street] .tnp i')[1].click());await W(400);
 const tr=await E(()=>({tryId:TRY&&TRY.tn.id,pi:TRY&&TRY.tn.pi,worn:N.look.tn&&N.look.tn.id,coins:N.coins,own:TNUI.tnOwn('street')}));await shot('02_essayage');
 ok('7 essayer avant d’acheter : la tenue et ses couleurs s’affichent sur le personnage sans rien acheter',tr.tryId=='street'&&tr.pi==1&&tr.coins==150&&!tr.own,tr);
 await E(()=>document.querySelector('#clList .tnc[data-tn=street] button').click());await W(400);
 const by=await E(()=>({coins:N.coins,own:TNUI.tnOwn('street'),tn:N.look.tn,TRY}));
 ok('8 achat d’une tenue complète : pièces débitées une fois, tenue possédée et portée dans les couleurs essayées',by.coins==30&&by.own&&by.tn.id=='street'&&by.tn.pi==1&&!by.TRY,by);

 // 9-11. garde-robe
 await E(()=>arrive('home'));await W(2500);await E(()=>show('dress'));await W(700);await shot('03_garderobe');
 const dr=await E(()=>({tabs:[...document.querySelectorAll('#drSeg button')].map(b=>b.dataset.m),cards:document.querySelectorAll('#drList .tnc').length,locked:document.querySelectorAll('#drList .tnc.lock').length}));
 ok('9 garde-robe : les 10 tenues (possédées en premier), onglets Mes tenues, Couleurs, Favoris, Coiffure',dr.cards==10&&dr.locked==7&&['tn','col','fav','hair'].every(k=>dr.tabs.includes(k)),dr);
 await E(()=>document.querySelector('#drList .tnc[data-tn=casual] button').click());await W(300);
 const one=await E(()=>N.look.tn&&N.look.tn.id);
 await E(()=>document.querySelector('#drSeg button[data-m=col]').click());await W(300);
 await E(()=>document.querySelectorAll('.tnas button')[2].click());await W(200);
 await E(()=>{const r=[...document.querySelectorAll('.tnrow')];r[0].querySelectorAll('i')[17].click()});await W(300);await shot('04_couleurs');
 const col=await E(()=>({tn:N.look.tn,cus:N.wd2.tn.cus.casual,rows:[...document.querySelectorAll('.tnrow .tnl')].map(e=>e.textContent)}));
 ok('10 équiper en un geste, puis association (3 au choix) et couleur libre par élément, mémorisées pour la tenue',one=='casual'&&col.tn.pi==2&&col.cus.pi==2&&Object.keys(col.cus.c).length==1&&col.rows.length==4,col);
 await E(()=>{document.querySelector('#drSeg button[data-m=tn]').click()});await W(200);await E(()=>document.querySelector('#drList .tnc[data-tn=street] button').click());await W(200);
 await E(()=>{document.querySelector('#drSeg button[data-m=tn]').click()});await W(200);await E(()=>document.querySelector('#drList .tnc[data-tn=casual] button').click());await W(200);
 const kept=await E(()=>N.look.tn);
 ok('11 une tenue remise retrouve ses couleurs personnalisées',kept.id=='casual'&&kept.pi==2&&Object.keys(kept.c).length==1,kept);
 await E(()=>document.querySelector('#drSeg button[data-m=fav]').click());await W(200);await E(()=>document.querySelectorAll('.tnfav .ob button')[0].click());await W(200);
 await E(()=>{document.querySelector('#drSeg button[data-m=tn]').click()});await W(200);await E(()=>document.querySelector('#drList .tnc[data-tn=estival] button').click());await W(200);
 await E(()=>document.querySelector('#drSeg button[data-m=fav]').click());await W(200);await E(()=>document.querySelectorAll('.tnfav .ob button')[2].click());await W(200);
 await E(()=>document.querySelectorAll('.tnfav .ob button')[1].click());await W(300);await shot('05_favoris');
 const fav=await E(()=>({fav:N.wd2.tn.fav,tn:N.look.tn}));
 ok('12 trois favoris : enregistrer la tenue portée avec ses couleurs, la remettre d’un geste',fav.fav[0]&&fav.fav[0].id=='casual'&&fav.fav[1].id=='estival'&&fav.tn.id=='casual'&&fav.tn.pi==2,fav);

 // 13. sauvegarde et changement d’appareil (export de la sauvegarde → nouvel appareil)
 await E(()=>save());const sv=await E(()=>({raw:[localStorage.getItem('littlelife_v1'),localStorage.getItem('littlelife_v1_b')],look:JSON.stringify(N.look.wd),tn:JSON.stringify(N.wd2.tn)}));
 const ctx2=await b.newContext({viewport:{width:390,height:844}});await ctx2.addInitScript(r=>{if(!sessionStorage.getItem('x')){sessionStorage.setItem('x',1);if(r[0])localStorage.setItem('littlelife_v1',r[0]);if(r[1])localStorage.setItem('littlelife_v1_b',r[1])}},sv.raw);const p2=await ctx2.newPage();await p2.goto(JEU);await p2.waitForTimeout(3000);
 const sv2=await p2.evaluate(()=>({look:JSON.stringify(N.look.wd),tn:JSON.stringify(N.wd2.tn)}));await ctx2.close();
 ok('13 sauvegarde : tenues, couleurs, favoris et tenue portée identiques après rechargement sur un autre appareil',sv2.look==sv.look&&sv2.tn==sv.tn,{look:sv2.look==sv.look,tn:sv2.tn==sv.tn,wd:sv2.look});

 // 14. reprise d’une ancienne sauvegarde (vêtements séparés achetés, salle de sport)
 const old=await E(()=>{const S=JSON.parse(JSON.stringify(N));delete S.wd2.tn;S.wd2.own={hoodie:1,cargo:1,blazer:1,running:1};S.look.wd={cheveux:'nat|0',haut:'hoodie|2',bas:'cargo|0',chaussures:'basket|1'};delete S.look.tn;S.coins=77;return JSON.stringify(S)});
 await E(r=>{localStorage.setItem('littlelife_v1',r);localStorage.setItem('littlelife_v1_b',r);Object.keys(N).forEach(k=>delete N[k]);Object.assign(N,JSON.parse(r))},old);await p.goto(JEU);await W(3000);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}});
 const mg=await E(()=>({own:Object.keys(N.wd2.tn.own).sort(),wd:N.look.wd,coins:N.coins,old:N.wd2.own}));
 ok('14 ancienne sauvegarde : rien n’est perdu (tenue portée, pièces, anciens vêtements), les tenues correspondantes sont offertes',mg.wd.haut=='hoodie|2'&&mg.coins==77&&mg.old.hoodie&&['casual','detente','elegant','estival','sport','street','urbain'].every(k=>mg.own.includes(k)),mg);
 await E(()=>show('dress'));await W(600);const oldTab=await E(()=>!!document.querySelector('#drSeg button[data-m=old]'));
 await E(()=>document.querySelector('#drSeg button[data-m=old]').click());await W(300);const oldCards=await E(()=>document.querySelectorAll('#drList .wdc').length);await shot('06_anciens');
 ok('15 les anciens vêtements achetés restent disponibles (onglet « Anciens vêtements »)',oldTab&&oldCards>=4,{oldTab,oldCards});
 // gain d’une pièce à la salle de sport après coup → la tenue correspondante arrive
 await E(()=>{N.wd2.own.jog=true;drDraw()});const g=await E(()=>TNUI.tnOwn('detente')&&TNUI.tnOwn('sport'));
 ok('16 récompenses de la salle de sport converties en tenues',g,g);

 // 17. affichage
 await E(()=>{document.querySelector('#drSeg button[data-m=tn]').click()});await W(300);
 const lay=await E(()=>{const vw=innerWidth;const cs=[...document.querySelectorAll('#drList .tnc')].map(c=>c.getBoundingClientRect());const bt=[...document.querySelectorAll('#drList .tnc button')].map(x=>x.getBoundingClientRect().height);return{vw,over:cs.filter(r=>r.right>vw+1||r.left<-1).length,minBt:Math.min(...bt)}});await shot('07_affichage');
 ok('17 cartes entièrement visibles ('+MODE+')',lay.over==0,lay);
 ok('18 aucune erreur JavaScript',errs.length==0,errs);
 console.log(okN+'/'+n+' tests réussis ('+MODE+')');await b.close()})();
