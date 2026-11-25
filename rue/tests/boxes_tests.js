// Tests réels de BOX MASTER dans la borne d'arcade (Playwright + Chrome ; téléphone tactile avec vrais touchers via CDP, puis ordinateur clavier/souris).
// Usage : node rue/tests/boxes_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const SOL=JSON.parse(fs.readFileSync(path.resolve(__dirname,'boxes_solutions.json'),'utf8'));
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,700):''))}
const CH={u:'up',d:'down',l:'left',r:'right'},KEY={u:'ArrowUp',d:'ArrowDown',l:'ArrowLeft',r:'ArrowRight'};
async function ouvrirJeu(p){const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{const i=document.getElementById('intro');if(i)i.remove();if(typeof tscr!='undefined')tscr.hidden=true;const b=document.getElementById('crOk2');if(b&&b.offsetParent!==null)b.click()});await W(400)}
async function entrerBorne(p){await p.evaluate(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await p.waitForTimeout(600)}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});let p=await ctx.newPage();const errs=[];
 const watch=pg=>{pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())})};watch(p);
 await p.addInitScript(()=>{window.__fx=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);return f(n,...a)};clearInterval(iv)}},5)});
 await p.goto(JEU);await p.waitForTimeout(1500);let E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);await ouvrirJeu(p);
 let cdp=await ctx.newCDPSession(p);
 // conversion coordonnées du mini-jeu → pixels CSS de la page
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const tapG=async(gx,gy,ms)=>{const c=await scr(gx,gy);await p.touchscreen.tap(c.x,c.y);await W(ms==null?140:ms)};
 const btnC=id=>E(id=>{const B=ARC.modules.boxes._s.btns.find(b=>b.id==id);return B&&{x:B.x+B.w/2,y:B.y+B.h/2,w:B.w,h:B.h}},id);
 const btn=async(id,ms)=>{const c=await btnC(id);if(!c)return false;await tapG(c.x,c.y,ms);return true};
 const dpad=d=>E(d=>{const D=ARC.modules.boxes._s.L.dpad;const b=D&&D.b[d];return b&&{x:b.x+b.w/2,y:b.y+b.h/2}},d);
 const tapD=async(d,ms)=>{const c=await dpad(d);await tapG(c.x,c.y,ms==null?175:ms)};
 const touch=async(type,x,y,id)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type=='touchEnd'||type=='touchCancel'?[]:[{x,y,id:id||1}]});
 const S=()=>E(()=>{const M=ARC.modules.boxes,s=M._s,d=ARC.data('boxes');return{ph:s.phase,lvl:s.lvl,moves:s.moves,pushes:s.pushes,p:s.p&&[s.p.x,s.p.y],boxes:s.boxes.map(b=>[b.x,b.y]),stuck:s.stuck.length,won:s.won,paused:s.paused,tr:!!s.tr,sel:s.sel,
  unl:ARC.modules.boxes._s.api?s.api.level():null,dlevel:d.level,done:(d.done||[]).filter(Boolean).length,res:d.res||null,st:ARC.state,cur:ARC.cur&&ARC.cur.id}});
 const waitTr=async()=>{for(let i=0;i<40;i++){await W(50);if(!(await E(()=>!!ARC.modules.boxes._s.tr)))return}};
 const loadL=async i=>{await E(i=>{ARC.modules.boxes._load(i)},i);await W(80)};
 // ---- 1. borne : Box Master dans la liste (une fois, avec sa vignette), fiche, JOUER → plein écran, rien d'autre visible ----
 await entrerBorne(p);
 const cat=await E(()=>({i:ARC.games.findIndex(g=>g.id=='boxes'),n:ARC.games.filter(g=>g.id=='boxes').length,name:(ARC.games.find(g=>g.id=='boxes')||{}).name,art:typeof ARC_ART!='undefined'&&!!ARC_ART.boxes,mod:!!ARC.modules.boxes,others:ARC.games.filter(g=>ARC.modules[g.id]).map(g=>g.id)}));
 const cell=await E(i=>{const c=AX.L.grid.cells[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(c.x+c.w/2)*k,y:r.top+(c.y+c.h/2)*k}},cat.i);
 await p.touchscreen.tap(cell.x,cell.y);await W(250);await p.screenshot({path:`${O}/bx_00_borne.png`});await p.touchscreen.tap(cell.x,cell.y);await W(400);
 const fiche=await E(()=>({st:ARC.state,g:ARC.games[ARC.info].id}));await p.screenshot({path:`${O}/bx_01_fiche.png`});
 const jb=await E(()=>{const o=arcInfoLayout(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(o.bx+o.bw/2)*k,y:r.top+(o.by+o.bh/2)*k}});await p.touchscreen.tap(jb.x,jb.y);await W(700);
 const fsx=await E(()=>{const r=AX.cv.getBoundingClientRect(),G=arcGS(),pts=[];for(const fx of[.02,.5,.98])for(const fy of[.02,.5,.98])pts.push(document.elementFromPoint(innerWidth*fx,innerHeight*fy));
  return{st:ARC.state,cur:ARC.cur&&ARC.cur.id,cv:[r.left,r.top,r.right,r.bottom].map(Math.round),W:innerWidth,H:innerHeight,full:G.w==AX.L.W&&G.h==AX.L.H,top:pts.every(e=>e&&e.id=='arcCv'),ph:ARC.modules.boxes._s.phase}});
 await p.screenshot({path:`${O}/bx_02_niveaux.png`});
 ok('1 Box Master dans la sélection de la borne (une fois, nom et vignette), fiche, JOUER → plein écran, aucun élément de Little Life par-dessus',cat.n==1&&cat.name=='Box Master'&&cat.art&&cat.mod&&fiche.g=='boxes'&&fsx.st=='game'&&fsx.cur=='boxes'&&fsx.full&&fsx.top&&fsx.cv[0]<=0&&fsx.cv[1]<=0&&fsx.cv[2]>=fsx.W&&fsx.cv[3]>=fsx.H&&fsx.ph=='title',{cat,fiche,fsx});
 // ---- 2. choix du niveau : seul le niveau 1 est ouvert ----
 const lk=await E(()=>{const s=ARC.modules.boxes._s,b=s.btns.find(q=>q.id=='lvl'&&q.i==4);return{x:b.x+b.w/2,y:b.y+b.h/2}});await tapG(lk.x,lk.y);
 const s2=await S(),m2=await E(()=>ARC.modules.boxes._s.msg&&ARC.modules.boxes._s.msg.s);
 await btn('play',200);await waitTr();await W(200);const s2b=await S();await p.screenshot({path:`${O}/bx_03_niveau1.png`});
 ok('2 sélection : seul le niveau 1 est débloqué, un niveau verrouillé ne se lance pas (message), JOUER lance le niveau 1',s2.unl==1&&s2.ph=='title'&&/NIVEAU 4/.test(m2||'')&&s2b.ph=='play'&&s2b.lvl==0&&s2b.moves==0,{s2,m2,s2b});
 // ---- 3. clavier sur le niveau 1 : murs, poussée, pas de tirage, annuler ----
 const key=async(k,ms)=>{await p.keyboard.press(k);await W(ms==null?170:ms)};
 const k0=await S();await key('ArrowUp');await key('ArrowLeft');const k1=await S();await key('ArrowRight');const k2=await S();await key('KeyD');const k3=await S();await key('KeyQ');const k4=await S();await key('KeyU');const k5=await S();
 ok('3 clavier (flèches et ZQSD) : mur infranchissable (0 déplacement compté), pas, poussée, recul sans tirer la caisse, U annule',
  k1.moves==0&&k1.p+''==k0.p+''&&k2.moves==1&&k2.p+''=='2,1'&&k3.pushes==1&&k3.boxes[0]+''=='4,1'&&k4.p+''=='2,1'&&k4.boxes[0]+''=='4,1'&&k5.p+''=='3,1'&&k5.moves==2&&k5.boxes[0]+''=='4,1',{k0,k1,k2,k3,k4,k5});
 // ---- 4. victoire : animation, fenêtre, niveau 2 débloqué et sauvegardé, NIVEAU SUIVANT ----
 await key('ArrowRight',60);const v0=await S();await W(400);await p.screenshot({path:`${O}/bx_04_victoire_anim.png`});await W(1300);
 const v1=await S(),panel=await E(()=>{const s=ARC.modules.boxes._s;return{btns:s.btns.map(b=>b.id),fx:window.__fx.slice(-6)}});await p.screenshot({path:`${O}/bx_05_victoire.png`});
 await btn('next',200);await waitTr();await W(200);const v2=await S();
 ok('4 victoire : animation puis fenêtre NIVEAU TERMINÉ (déplacements, NIVEAU SUIVANT, REJOUER), niveau 2 débloqué et sauvegardé, NIVEAU SUIVANT charge le niveau 2',
  v0.won&&v1.ph=='won'&&panel.btns.includes('next')&&panel.btns.includes('replay')&&panel.fx.includes('bxWin')&&v1.dlevel==2&&v1.done==1&&v1.moves==3&&v2.ph=='play'&&v2.lvl==1&&v2.moves==0,{v0,v1,panel,v2});
 // ---- 5. pavé tactile : niveau 2 résolu au doigt, un toucher = un pas ----
 const sol2=SOL[1].sol;for(const c of sol2)await tapD(CH[c]);await W(300);const t1=await S();await W(1300);const t1b=await S();await p.screenshot({path:`${O}/bx_06_tactile_fin.png`});
 await btn('replay',200);await waitTr();await W(150);const t2=await S();
 ok('5 pavé directionnel tactile : le niveau 2 se résout au doigt (un toucher = un pas), REJOUER relance le même niveau',t1.won&&t1.moves==sol2.length&&t1b.ph=='won'&&t2.ph=='play'&&t2.lvl==1&&t2.moves==0,{t1,t1b,t2,len:sol2.length});
 // ---- 6. appui maintenu : la direction se répète, et s'arrête dès qu'on lâche ----
 await loadL(11);const h0=await S();const dl=await dpad('left'),cl=await scr(dl.x,dl.y);await touch('touchStart',cl.x,cl.y,3);await W(900);const h1=await S();await touch('touchEnd');await W(400);const h2=await S();await W(400);const h3=await S();
 await p.screenshot({path:`${O}/bx_07_maintenu.png`});
 ok('6 appui maintenu sur le pavé : plusieurs pas répétés automatiquement, arrêt net au relâchement',h1.moves==3&&h2.moves==h3.moves&&h0.moves==0,{h0:h0.moves,h1:h1.moves,h2:h2.moves,h3:h3.moves});
 // ---- 7. toucher la pièce : marcher jusqu'à une case, glisser le doigt pour un pas ----
 await loadL(10);const g0=await S();const tgt=await E(()=>{const s=ARC.modules.boxes._s,L=s.L;return{x:L.ox+(2+.5)*L.k,y:L.oy+(5+.5)*L.k}});await tapG(tgt.x,tgt.y,1500);const g1=await S();
 const sw=await E(()=>{const s=ARC.modules.boxes._s,L=s.L;return{x:L.ox+(s.p.x+.5)*L.k,y:L.oy+(s.p.y+.5)*L.k,k:L.k}});const sa=await scr(sw.x,sw.y),sb=await scr(sw.x+sw.k*1.3,sw.y);
 await touch('touchStart',sa.x,sa.y,4);await touch('touchMove',(sa.x+sb.x)/2,sa.y,4);await touch('touchMove',sb.x,sb.y,4);await touch('touchEnd');await W(300);const g2=await S();
 ok('7 toucher une case de la pièce : le personnage y marche seul (plus court chemin, sans pousser) ; glisser le doigt : un pas',g1.p+''=='2,5'&&g1.pushes==0&&g1.boxes+''==g0.boxes+''&&g2.p[0]==g1.p[0]+1&&g2.moves==g1.moves+1,{g0,g1,g2});
 // ---- 8. collisions : 3 600 pas au hasard sur 12 niveaux comparés à un modèle de référence indépendant ----
 const col=await E(()=>{const M=ARC.modules.boxes,s=M._s,D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},K=Object.keys(D);let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  const out={steps:0,err:[],stuckSeen:0,undoOk:0,lv:0};
  for(const lv of[1,4,6,8,10,12,13,15,18,21,25,29]){M._load(lv);const map=M._levels[lv].map,h=map.length,w=Math.max(...map.map(r=>r.length));
   // modèle de référence : intérieur = remplissage depuis le joueur ; mur ou extérieur = infranchissable
   const ins=new Set(),start=[];let P;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=map[y][x]||' ';if(c=='@'||c=='+')P=[x,y];if(c=='$'||c=='*')start.push([x,y])}
   const st=[P.slice()];while(st.length){const[x,y]=st.pop(),k=x+','+y;if(ins.has(k)||x<0||y<0||x>=w||y>=h||(map[y][x]||' ')=='#')continue;ins.add(k);st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}
   let B=start.map(b=>b.slice());const free=(x,y)=>ins.has(x+','+y),has=(x,y)=>B.findIndex(b=>b[0]==x&&b[1]==y);const init=JSON.stringify([P,B]);let n=0;
   for(let i=0;i<300;i++){const d=K[Math.floor(rnd()*4)],[dx,dy]=D[d];const before=JSON.stringify([P,B]);const r=M._step(d);out.steps++;
    if(r=='stuck'){out.stuckSeen++;if(JSON.stringify([[s.p.x,s.p.y],s.boxes.map(b=>[b.x,b.y])])!==before)out.err.push(['bloqué mais a bougé',lv,i]);M._undo();n--;
     // modèle : annuler le dernier pas
     const hh=s.__ref.pop();P=hh[0];B=hh[1];continue}
    s.__ref=s.__ref||[];const nx=P[0]+dx,ny=P[1]+dy;let exp='blocked';
    if(free(nx,ny)){const bi=has(nx,ny);if(bi<0)exp='move';else if(free(nx+dx,ny+dy)&&has(nx+dx,ny+dy)<0)exp='push'}
    if(r!==exp)out.err.push([lv,i,d,'moteur:'+r,'référence:'+exp]);
    if(exp!='blocked'){s.__ref.push([P.slice(),B.map(b=>b.slice())]);if(exp=='push'){const bi=has(nx,ny);B[bi]=[nx+dx,ny+dy]}P=[nx,ny];n++}
    const eng=JSON.stringify([[s.p.x,s.p.y],s.boxes.map(b=>[b.x,b.y])]);if(eng!==JSON.stringify([P,B]))out.err.push(['état différent',lv,i]);
    // invariants : jamais deux caisses sur une case, jamais dans un mur, joueur jamais sur une caisse ou un mur
    const seen=new Set();for(const b of s.boxes){const k=b.x+','+b.y;if(seen.has(k)||!free(b.x,b.y))out.err.push(['caisse',lv,i,k]);seen.add(k)}if(!free(s.p.x,s.p.y)||seen.has(s.p.x+','+s.p.y))out.err.push(['joueur',lv,i]);
    if(s.won){M._load(lv);P=JSON.parse(init)[0];B=JSON.parse(init)[1];s.__ref=[];n=0}}
   // tout annuler ramène exactement au départ
   while(s.hist.length)M._undo();if(JSON.stringify([[s.p.x,s.p.y],s.boxes.map(b=>[b.x,b.y])])===init&&s.moves==0&&s.pushes==0)out.undoOk++;s.__ref=[];out.lv++}
  return out});
 ok('8 collisions exactes : 3 600 pas au hasard sur 12 niveaux = modèle de référence (murs, poussées, jamais deux caisses, jamais de tirage), annuler jusqu’au bout = état de départ',col.err.length==0&&col.steps==3600&&col.undoOk==12,col);
 // ---- 9. poussées : jamais deux caisses à la fois, jamais contre un mur, jamais de tirage ----
 const pu=await E(()=>{const M=ARC.modules.boxes,s=M._s;M._load(8);const a=[s.p.x,s.p.y];const r1=M._step('left');const b1=s.boxes.map(b=>[b.x,b.y]);
  M._load(0);M._step('right');M._step('right');M._step('right');const r2=M._step('right');
  M._load(3);const r3=M._step('up'),bUp=s.boxes.map(b=>[b.x,b.y]);const r4=M._step('down'),bAfter=s.boxes.map(b=>[b.x,b.y]);return{a,r1,b1,r2,r3,r4,same:JSON.stringify(bUp)==JSON.stringify(bAfter),p:[s.p.x,s.p.y]}});
 ok('9 poussées : deux caisses alignées ne bougent pas, une caisse contre un mur non plus, reculer ne tire jamais la caisse',pu.r1=='blocked'&&pu.r3=='push'&&pu.r4=='move'&&pu.same,pu);
 // ---- 10. caisse bloquée dans un coin : signalée, plus aucun pas accepté, ANNULER ou RECOMMENCER ----
 await loadL(4);await key('ArrowLeft',170);await key('ArrowUp',250);const c0=await S();
 const c0b=await E(()=>{const s=ARC.modules.boxes._s;return{st:s.stuck.slice(),fx:window.__fx.slice(-3)}});await p.screenshot({path:`${O}/bx_08_bloquee.png`});
 await tapD('down');await tapD('right');const c1=await S();const ub=await btnC('undo');await tapG(ub.x,ub.y,300);const c2=await S();
 await key('ArrowUp',300);const c3=await S();await btn('reset',150);await waitTr();await W(150);const c4=await S();
 ok('10 caisse coincée dans un coin : signalée tout de suite (bandeau, son), plus aucun pas accepté, ANNULER débloque, RECOMMENCER remet le niveau à zéro',
  c0.stuck==1&&c0b.fx.includes('bxStuck')&&c1.moves==c0.moves&&c1.p+''==c0.p+''&&c2.stuck==0&&c2.moves==c0.moves-1&&c3.stuck==1&&c4.stuck==0&&c4.moves==0&&c4.ph=='play',{c0,c0b,c1,c2,c3,c4});
 // ---- 11. carré 2×2 de caisses/murs : blocage reconnu ; jamais de fausse alerte sur les 30 solutions ----
 const fr=await E(()=>{const M=ARC.modules.boxes,s=M._s;M._load(12);// ENCOMBREMENT : deux caisses collées contre le mur du haut → carré 2×2 figé
  const set=(i,x,y)=>{const b=s.boxes[i];s.bmap[b.y*s.G.w+b.x]=-1;b.x=b.fx=x;b.y=b.fy=y;s.bmap[y*s.G.w+x]=i};set(0,4,1);set(1,5,1);const a=M._stuck().length;set(0,2,2);set(1,3,2);const b2=M._stuck().length;return{a,b2}});
 const all=await E(SOL=>{const M=ARC.modules.boxes,s=M._s,out=[];for(const L of SOL){M._load(L.n-1);let fa=0,bad=0;for(const c of L.sol){const r=M._step({u:'up',d:'down',l:'left',r:'right'}[c]);if(r=='blocked'||r=='stuck')bad++;if(s.stuck.length)fa++}out.push({n:L.n,won:s.won,fa,bad,moves:s.moves,len:L.sol.length})}return out},SOL);
 ok('11 blocage « carré 2×2 » reconnu, positions libres non signalées ; les 30 solutions ne déclenchent jamais d’alerte',fr.a>=1&&fr.b2==0&&all.every(x=>x.fa==0),{fr,fausses:all.filter(x=>x.fa)});
 ok('12 les 30 niveaux sont réellement résolubles dans le moteur du jeu (solutions rejouées pas à pas, victoire à la fin)',all.length==30&&all.every(x=>x.won&&x.bad==0&&x.moves==x.len),all.map(x=>x.n+':'+(x.won?'ok':'NON')+' '+x.moves).join(' '));
 // ---- 13. progression des niveaux et des difficultés ----
 const prog=await E(()=>{const M=ARC.modules.boxes;return M._levels.map((L,i)=>{const G=M._parse(i);return{n:i+1,c:G.start.length,g:G.ngoal,w:G.w,h:G.h}})});
 ok('13 30 niveaux faits main (autant de cibles que de caisses, pièces fermées, au plus 13×9 cases) ; difficulté croissante 1-5 / 6-10 / 11-20 / 21-30',prog.length==30&&prog.every(x=>x.c==x.g&&x.c>0&&x.w<=13&&x.h<=9)&&
  SOL.slice(0,5).every(x=>x.poussees<=5)&&SOL.slice(20).every(x=>x.poussees>=15)&&SOL.slice(20).reduce((a,x)=>a+x.poussees,0)/10>SOL.slice(10,20).reduce((a,x)=>a+x.poussees,0)/10&&SOL.slice(10,20).reduce((a,x)=>a+x.poussees,0)/10>SOL.slice(5,10).reduce((a,x)=>a+x.poussees,0)/5,
  SOL.map(x=>x.n+':'+x.poussees+'p').join(' '));
 // ---- 14. annuler maintenu : annulations répétées ; recommencer ----
 await loadL(16);for(const c of SOL[16].sol.slice(0,12))await E(d=>ARC.modules.boxes._step(d),CH[c]);await W(300);const a0=await S();const ub2=await btnC('undo'),ua=await scr(ub2.x,ub2.y);
 await touch('touchStart',ua.x,ua.y,5);await W(1000);await touch('touchEnd');await W(200);const a1=await S();await btn('reset',150);await waitTr();await W(150);const a2=await S();
 const init16=await E(()=>{const G=ARC.modules.boxes._parse(16);return{p:[G.px,G.py],b:G.start.map(b=>[b.x,b.y])}});
 ok('14 ANNULER maintenu enchaîne les annulations ; RECOMMENCER rend la position de départ exacte',a0.moves==12&&a1.moves<=a0.moves-4&&a2.moves==0&&a2.p+''==init16.p+''&&JSON.stringify(a2.boxes)==JSON.stringify(init16.b),{a0:a0.moves,a1:a1.moves,a2});
 // ---- 15. pause : menu, son, reprendre ----
 await btn('pause',200);const pz=await S(),pb=await E(()=>ARC.modules.boxes._s.btns.map(b=>b.id));await p.screenshot({path:`${O}/bx_09_pause.png`});await tapD('left',120);const pz2=await S();
 await btn('mute',150);const mu=await E(()=>({m:ARC.modules.boxes._s.mute,d:ARC.data('boxes').mute}));await btn('mute',150);await btn('resume',200);const pz3=await S();
 ok('15 pause : le jeu s’arrête (le pavé ne fait plus bouger), boutons REPRENDRE / SON / RECOMMENCER / CHOIX DU NIVEAU / RETOUR À LA BORNE, le son se coupe et se sauvegarde',
  pz.paused&&pz2.moves==pz.moves&&['resume','mute','preset','levels','quit'].every(i=>pb.includes(i))&&mu.m&&mu.d&&!pz3.paused,{pz,pb,mu});
 // ---- 16. portrait et paysage : tout visible, rien ne se chevauche, commandes ≥ 44 px, rotation pendant un appui sans bloquer le toucher ----
 const tailles=[[390,844],[844,390],[320,568],[568,320],[768,1024],[1024,768],[412,915],[915,412]],orient=[];
 for(const lv of[27,0])for(const[w,h]of tailles){await p.setViewportSize({width:w,height:h});await W(250);await loadL(lv);await W(150);
  const r=await E(()=>{const s=ARC.modules.boxes._s,L=s.L,cpp=AX.cv.getBoundingClientRect().width/AX.L.W,in_=(b)=>b.x>=0&&b.y>=0&&b.x+b.w<=L.w+.5&&b.y+b.h<=L.h+.5,ov=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
   const grid={x:L.ox,y:L.oy,w:L.gw,h:L.gh},ctr=[L.undo,L.reset];if(L.dpad)ctr.push({x:L.dpad.x,y:L.dpad.y,w:3*L.dpad.k,h:3*L.dpad.k});const hud={x:0,y:0,w:L.w,h:L.hud.h};
   return{k:Math.round(L.k*cpp),inG:in_(grid)&&grid.y>=L.hud.h,inC:ctr.every(in_),ovl:ctr.some(c=>ov(c,grid)||ov(c,hud))||ov(ctr[0],ctr[1])||(ctr[2]&&(ov(ctr[2],ctr[0])||ov(ctr[2],ctr[1]))),
    bmin:Math.round(Math.min(L.undo.h,L.reset.h,L.back.h,L.pause.h,L.dpad?L.dpad.k:99)*cpp),side:L.side}});
  const m0=(await S()).moves;await tapD('right',220);await tapD('left',220);const m1=(await S()).moves;orient.push([w+'x'+h,lv+1,r.k,r.bmin,r.inG&&r.inC&&!r.ovl,r.side?'côtés':'bas',m1-m0]);
  if(lv==27&&(w==390||w==844))await p.screenshot({path:`${O}/bx_10_${w>h?'paysage':'portrait'}.png`})}
 // rotation pendant un appui maintenu : le toucher reste disponible ensuite
 await p.setViewportSize({width:390,height:844});await W(250);await loadL(6);const rd=await dpad('left'),rc=await scr(rd.x,rd.y);await touch('touchStart',rc.x,rc.y,6);await W(250);
 await p.setViewportSize({width:844,height:390});await W(300);await touch('touchEnd');await W(300);const ro0=await S();await tapD('right',250);const ro1=await S();await p.setViewportSize({width:390,height:844});await W(300);await tapD('left',250);const ro2=await S();
 ok('16 portrait et paysage (8 tailles × 2 niveaux) : pièce et commandes entièrement visibles, sans chevauchement, commandes ≥ 44 px ; rotation pendant un appui sans bloquer le toucher',
  orient.every(o=>o[4]&&o[3]>=44&&o[6]==2)&&ro1.moves==ro0.moves+1&&ro2.moves==ro1.moves+1&&!ro0.tr,{orient,ro:[ro0.moves,ro1.moves,ro2.moves]});
 // ---- 17. sauvegarde : partie en cours reprise à l'identique, progression conservée après rechargement de la page ----
 await loadL(1);for(const c of'rd')await tapD(CH[c],220);const sv0=await S();await btn('back',300);const sv1=await S();
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await W(500);const sv2=await S(),playLab=await E(()=>{const s=ARC.modules.boxes._s;return s.sel});
 await btn('play',200);await waitTr();await W(200);const sv3=await S();
 // fin de partie sauvegardée par Little Life, puis rechargement complet de la page
 await E(()=>{save()});await W(300);await p.reload();await W(1800);await ouvrirJeu(p);cdp=await ctx.newCDPSession(p);E=(f,a)=>p.evaluate(f,a);
 const rl=await E(()=>{const d=N.arcade&&N.arcade.boxes;return d&&{level:d.level,done:(d.done||[]).filter(Boolean).length,bm:d.bm&&d.bm[0],res:d.res,mute:d.mute}});
 await entrerBorne(p);await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await W(600);const rl2=await E(()=>({u:ARC.modules.boxes._s.api.level(),sel:ARC.modules.boxes._s.sel,ph:ARC.modules.boxes._s.phase}));
 await p.screenshot({path:`${O}/bx_11_apres_rechargement.png`});
 ok('17 sauvegarde automatique : partie en cours reprise à l’identique (REPRENDRE), niveaux débloqués, niveaux terminés et records conservés après rechargement complet',
  sv0.moves==2&&sv1.st=='menu'&&sv2.res&&sv2.res.l==1&&sv2.res.h=='rd'&&sv3.lvl==1&&sv3.moves==2&&sv3.p+''==sv0.p+''&&rl&&rl.level>=3&&rl.done>=2&&rl.bm==3&&rl2.u>=3&&rl2.ph=='title',{sv0,sv2:sv2.res,sv3,rl,rl2});
 // ---- 18. retour à la borne : bouton retour, Échap, pause → RETOUR À LA BORNE ; tout est arrêté ----
 await btn('back',300);const q1=await E(()=>({st:ARC.state,cur:ARC.cur,api:!!ARC.modules.boxes._s.api,sel:ARC.sel}));await p.keyboard.press('ArrowLeft');await W(150);const q1b=await E(()=>ARC.sel);
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await W(500);await btn('play',200);await waitTr();await W(150);await p.keyboard.press('Escape');await W(300);const q2=await E(()=>({st:ARC.state,cur:ARC.cur}));
 await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await W(500);await btn('play',200);await waitTr();await W(150);await btn('pause',200);await btn('quit',300);const q3=await E(()=>({st:ARC.state,cur:ARC.cur,on:ARC.on}));
 await p.screenshot({path:`${O}/bx_12_retour_borne.png`});
 ok('18 retour exact à la borne d’arcade (bouton retour, Échap, pause → RETOUR À LA BORNE), module arrêté, les touches reviennent à la borne',
  q1.st=='menu'&&!q1.cur&&!q1.api&&q1b!==q1.sel&&q2.st=='menu'&&!q2.cur&&q3.st=='menu'&&!q3.cur&&q3.on,{q1,q1b,q2,q3});
 await p.close();
 // ---- 19. ordinateur : pas de pavé tactile, clavier ZQSD, souris sur ANNULER / RECOMMENCER ----
 const ctx2=await b.newContext({viewport:{width:1280,height:800}});const p2=await ctx2.newPage();watch(p2);await p2.goto(JEU);await p2.waitForTimeout(1500);await ouvrirJeu(p2);await entrerBorne(p2);
 const E2=(f,a)=>p2.evaluate(f,a);await E2(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='boxes');arcOk();arcOk()});await p2.waitForTimeout(500);await p2.keyboard.press('Enter');await p2.waitForTimeout(900);
 const d0=await E2(()=>({ph:ARC.modules.boxes._s.phase,dpad:!!ARC.modules.boxes._s.L.dpad,lvl:ARC.modules.boxes._s.lvl}));
 for(const k of['KeyD','KeyD'])await (async()=>{await p2.keyboard.press(k);await p2.waitForTimeout(170)})();const d1=await E2(()=>ARC.modules.boxes._s.moves);
 const mc=async id=>{const c=await E2(id=>{const B=ARC.modules.boxes._s.btns.find(b=>b.id==id),r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+B.x+B.w/2)*k,y:r.top+(S.y+B.y+B.h/2)*k}},id);await p2.mouse.click(c.x,c.y);await p2.waitForTimeout(300)};
 await mc('undo');const d2=await E2(()=>ARC.modules.boxes._s.moves);await p2.screenshot({path:`${O}/bx_13_ordinateur.png`});await mc('reset');await p2.waitForTimeout(500);const d3=await E2(()=>ARC.modules.boxes._s.moves);
 await p2.keyboard.press('KeyZ');await p2.waitForTimeout(170);await p2.keyboard.press('KeyS');await p2.waitForTimeout(170);await p2.keyboard.press('KeyR');await p2.waitForTimeout(600);const d4=await E2(()=>ARC.modules.boxes._s.moves);
 ok('19 ordinateur : pas de pavé tactile à l’écran, clavier ZQSD/flèches, Entrée valide, clic souris sur ANNULER et RECOMMENCER, R recommence',d0.ph=='play'&&!d0.dpad&&d1==2&&d2==1&&d3==0&&d4==0,{d0,d1,d2,d3,d4});
 await ctx2.close();
 ok('20 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();const n=R.filter(r=>r.ok).length;console.log(n+'/'+R.length+' tests réussis');fs.writeFileSync(`${O}/boxes_resultats.json`,JSON.stringify(R,null,1));process.exit(n==R.length?0:1)})();
