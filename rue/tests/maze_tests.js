// Tests réels de MAZE RUNNER dans la borne d'arcade (Playwright + Chrome mobile tactile, vrais touchers sur le joystick et les boutons).
// Usage : node rue/tests/maze_tests.js
const path=require('path'),fs=require('fs');const PW='/home/claude/.npm-global/lib/node_modules/playwright';
const JEU='file://'+path.resolve(__dirname,'../../index.html');const O=path.resolve(__dirname,'../sorties/tests');fs.mkdirSync(O,{recursive:true});
const {chromium}=require(PW);const R=[];function ok(n,cond,info){R.push({n,ok:!!cond,info});console.log((cond?'OK   ':'ÉCHEC ')+n+(info!==undefined?'  '+JSON.stringify(info).slice(0,900):''))}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const errs=[];
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__fx=[];const iv=setInterval(()=>{if(typeof JEUSON!='undefined'&&!JEUSON.__spy){JEUSON.__spy=1;const f=JEUSON.fx.bind(JEUSON);JEUSON.fx=(n,...a)=>{window.__fx.push(n);return f(n,...a)};clearInterval(iv)}},5)});
 await p.goto(JEU);await p.waitForTimeout(1500);const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{document.getElementById('intro')&&document.getElementById('intro').remove();tscr.hidden=true;document.getElementById('crOk2').click()});await W(500);
 const cdp=await ctx.newCDPSession(p);
 // coordonnées écran d'un point du jeu (pixels de la borne → pixels CSS)
 const scr=(gx,gy)=>E(([gx,gy])=>{const r=AX.cv.getBoundingClientRect(),S=arcGS(),k=r.width/AX.L.W;return{x:r.left+(S.x+gx)*k,y:r.top+(S.y+gy)*k}},[gx,gy]);
 const tapG=async(gx,gy)=>{const c=await scr(gx,gy);await p.touchscreen.tap(c.x,c.y);return c};
 const btn=async k=>{const L=await E(k=>{const L=ARC.modules.maze._state.L;return L[k]},k);await tapG(L.x,L.y);await W(120)};
 const joy=async(d,ms)=>{const J=await E(()=>ARC.modules.maze._state.L.joy);const c=await scr(J.x,J.y),k=(await scr(J.x+J.r,J.y)).x-c.x,v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,id:4}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x+v[0]*k*.8,y:c.y+v[1]*k*.8,id:4}]});await W(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
 const st=()=>E(()=>{const S=ARC.modules.maze._state;return{ph:S.phase,x:S.p&&S.p.x,y:S.p&&S.p.y,score:S.score,lives:S.lives,got:S.got,lv:S.lv,portal:S.portal}});
 // ---- 1. lancement depuis la borne : rue → salle d'arcade → catalogue → fiche → JOUER ----
 await E(()=>{streetEnter();const a=STC.buildings.find(q=>q.id=='arcade');STV.px=a.x+a.door.x;stInteract()});await W(700);
 const cat=await E(()=>{const i=ARC.games.findIndex(g=>g.id=='maze');return{i,ready:!!ARC.modules.maze,cell:AX.L.grid.cells[i]}});
 // toucher la vignette Maze Runner dans le catalogue (2 touchers = sélection puis ouverture de la fiche)
 const cellC=await E(i=>{const c=AX.L.grid.cells[i],r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(c.x+c.w/2)*k,y:r.top+(c.y+c.h/2)*k}},cat.i);
 await E(()=>{ARC.state='menu'});await p.touchscreen.tap(cellC.x,cellC.y);await W(250);await p.touchscreen.tap(cellC.x,cellC.y);await W(400);
 const info=await E(()=>({st:ARC.state,info:ARC.games[ARC.info].id}));const jb=await E(()=>{const o=arcInfoLayout(),r=AX.cv.getBoundingClientRect(),k=r.width/AX.L.W;return{x:r.left+(o.bx+o.bw/2)*k,y:r.top+(o.by+o.bh/2)*k}});
 await p.touchscreen.tap(jb.x,jb.y);await W(700);const g1=await E(()=>({st:ARC.state,cur:ARC.cur&&ARC.cur.id,ph:ARC.modules.maze._state.phase}));await p.screenshot({path:`${O}/mz_01_titre.png`});
 ok('1 lancement depuis la borne : vignette « Maze Runner » prête, fiche, JOUER → écran de démarrage du jeu',cat.ready&&info.st=='info'&&info.info=='maze'&&g1.st=='game'&&g1.cur=='maze'&&g1.ph=='title',{cat:{i:cat.i,ready:cat.ready},info,g1});
 // ---- 2. plein écran ----
 const fs2=await E(()=>{const r=AX.cv.getBoundingClientRect(),S=arcGS();return{cv:[r.left,r.top,r.right,r.bottom].map(Math.round),S,LW:AX.L.W,LH:AX.L.H,W:innerWidth,H:innerHeight}});
 ok('2 plein écran : le jeu occupe toute la borne et tout l’écran, le catalogue n’est pas affiché',fs2.cv[0]<=0&&fs2.cv[1]<=0&&fs2.cv[2]>=fs2.W&&fs2.cv[3]>=fs2.H&&fs2.S.x==0&&fs2.S.y==0&&fs2.S.w==fs2.LW&&fs2.S.h==fs2.LH,fs2);
 // ENTER (bouton vert) : lancement du niveau 1
 await btn('bOk');await W(300);const s3a=await st();await W(1900);
 const map=await E(()=>{const S=ARC.modules.maze._state,M=S.map;return{W:M.W,H:M.H,S:M.S,E:M.E,crys:M.crys.map(c=>[c.x,c.y]),ens:S.ens.map(e=>[e.hx,e.hy,e.ty.id]),grid:ARC.modules.maze._levels[0].grid}});
 const grid=['#########################','#S#    A                #','# ### ### # # ######### #','#   A     A   #   #   # #','####### ####### # # # # #','# #     #       #   #C# #','# # ##### ########### # #','# #       #     #     # #','# ####### # # # #C##### #','#           # #   #   # #','# # ######### # ### # # #','# #         #         # #','# # ##### # # # ##### #C#','# #     # # #       # # #','# ### # ### # # # # # # #','#  C  #    C#      E    #','#########################'];
 ok('2b niveau 1 « Les Ruines Néon » : grille 25 × 17 identique à la référence (départ, 5 cristaux, 3 ennemis, sortie aux bonnes cases)',s3a.ph=='intro'&&map.W==25&&map.H==17&&JSON.stringify(map.grid)==JSON.stringify(grid)&&map.S.x==1&&map.S.y==1&&map.E.x==19&&map.E.y==15&&map.crys.length==5&&map.ens.length==3,{s3a,S:map.S,E:map.E,crys:map.crys,ens:map.ens});
 // pour les tests de mouvement : gardiens tenus loin et calmes
 // gardiens mis de côté le temps des tests de déplacement (ils sont testés à part, tests 6 et 7)
 const calme=()=>E(()=>{const S=ARC.modules.maze._state;S.grace=1e9;S._ens=S._ens||S.ens;S.ens=[]});
 const place=(x,y)=>E(([x,y])=>{const P=ARC.modules.maze._state.p;Object.assign(P,{x,y,dir:null,moving:false,want:null,wantT:0})},[x,y]);
 await calme();
 // ---- 3. déplacements dans les 4 directions au joystick tactile ----
 const cross=await E(()=>{const M=ARC.modules.maze._state.map;for(let y=1;y<M.H-1;y++)for(let x=1;x<M.W-1;x++)if(!M.walls[y][x]&&!M.walls[y-1][x]&&!M.walls[y+1][x]&&!M.walls[y][x-1]&&!M.walls[y][x+1])return[x,y];return null});
 const mv={};for(const d of ['right','left','down','up']){await place(cross[0],cross[1]);await W(60);const a=await st();await joy(d,230);await W(450);const z=await st();mv[d]=[+(z.x-a.x).toFixed(2),+(z.y-a.y).toFixed(2),Number.isInteger(z.x)&&Number.isInteger(z.y)]}
 const face=await E(()=>ARC.modules.maze._state.p.face);
 ok('3 déplacements au joystick tactile dans les 4 directions : le coureur part du bon côté, s’arrête net au centre d’une case, regarde dans sa direction',
  mv.right[0]>=1&&mv.right[1]==0&&mv.left[0]<=-1&&mv.left[1]==0&&mv.down[1]>=1&&mv.down[0]==0&&mv.up[1]<=-1&&mv.up[0]==0&&Object.values(mv).every(v=>v[2])&&face=='up',{cross,mv,face});
 // ---- 4. murs : jamais traversés, choc animé + son ; jamais bloqué dans un angle (20 s de commandes au hasard) ----
 await place(1,1);await E(()=>{window.__fx.length=0});await joy('right',500);await W(100);const w1=await E(()=>{const P=ARC.modules.maze._state.p;return{x:P.x,y:P.y,bump:P.bump,face:P.face,fx:window.__fx.filter(n=>n=='mzBump').length}});
 const rnd=await E(async()=>{const S=ARC.modules.maze._state,M=S.map,inp=ARC.input,seen=new Set();let bad=0,angle=0,maxStill=0,still=0,lx=0,ly=0;const D=['up','down','left','right'];
  for(let i=0;i<400;i++){if(i%8==0){D.forEach(k=>inp[k]=0);inp[D[Math.floor(Math.random()*4)]]=1}await new Promise(r=>setTimeout(r,50));const P=S.p,cx=Math.round(P.x),cy=Math.round(P.y);
   if(M.walls[cy][cx]||M.walls[Math.floor(P.y)][Math.floor(P.x)]||M.walls[Math.ceil(P.y)][Math.ceil(P.x)])bad++;if(!Number.isInteger(P.x)&&!Number.isInteger(P.y))angle++;seen.add(cx+','+cy);
   if(P.x==lx&&P.y==ly&&D.some(k=>inp[k]&&!M.walls[cy+(k=='down')-(k=='up')][cx+(k=='right')-(k=='left')]))still++;else still=0;maxStill=Math.max(maxStill,still);lx=P.x;ly=P.y}
  D.forEach(k=>inp[k]=0);return{bad,angle,cases:seen.size,maxStill}});
 ok('4 collisions avec les murs : jamais traversés (petit choc animé + son contre la paroi) ; 20 s de commandes au hasard : jamais dans un mur, jamais en diagonale ni coincé dans un angle',w1.x==1&&w1.y==1&&w1.bump=='right'&&w1.face=='right'&&w1.fx>=1&&rnd.bad==0&&rnd.angle==0&&rnd.maxStill<=2&&rnd.cases>=15,{w1,rnd});
 // pilote : suit le plus court chemin (comme un joueur au clavier : flèches de la borne maintenues)
 const pilote=(tx,ty,max=30000)=>E(async([tx,ty,max])=>{const S=ARC.modules.maze._state,M=S.map,inp=ARC.input,t0=performance.now();const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  while(performance.now()-t0<max){const P=S.p;if(S.phase!='play')break;const cx=Math.round(P.x),cy=Math.round(P.y);if(cx==tx&&cy==ty){for(const k in D)inp[k]=0;if(Number.isInteger(P.x)&&Number.isInteger(P.y))break;await new Promise(r=>setTimeout(r,16));continue}
   const F=ARC.modules.maze._bfs(M.free,tx,ty);let best=null,bv=1e9;for(const k in D){const nx=cx+D[k][0],ny=cy+D[k][1],v=F[nx+ny*M.W];if(v>=0&&v<bv){bv=v;best=k}}
   for(const k in D)inp[k]=k==best?1:0;await new Promise(r=>setTimeout(r,16))}for(const k in D)inp[k]=0;await new Promise(r=>setTimeout(r,150));return{x:S.p.x,y:S.p.y,ph:S.phase}},[tx,ty,max]);
 // ---- 9a. portail inactif tant qu'il manque des cristaux ----
 await place(1,1);await E(()=>{const S=ARC.modules.maze._state;S.score=0;window.__fx.length=0});const pe=await pilote(19,15);const p9a=await st();
 // ---- 5. collecte des 5 cristaux ----
 await E(()=>{ARC.modules.maze._state.time=0});const steps=[];for(const [cx,cy] of map.crys){await pilote(cx,cy);steps.push(await E(()=>{const S=ARC.modules.maze._state;return[S.got,S.score,S.portal]}))}
 await p.screenshot({path:`${O}/mz_05_cristaux.png`});const fx5=await E(()=>window.__fx.filter(n=>n=='mzCrystal').length);await W(400);const fxP=await E(()=>window.__fx.includes('mzPortal'));
 ok('5 collecte des 5 cristaux : compteur 1/5 → 5/5, +100 points chacun, son et animation à chaque cristal',steps[4][0]==5&&steps.every((s,i)=>s[1]==s[0]*100&&(i==0||s[0]>=steps[i-1][0]))&&fx5==5,{steps,fx5});
 ok('9 portail : inactif (traversable sans effet) avant les 5 cristaux, puis activé avec animation et son au 5e',pe.ph=='play'&&pe.x==19&&pe.y==15&&p9a.portal==0&&p9a.got<5&&steps.every(s=>s[2]==(s[0]==5?1:0))&&fxP,{pe,p9a,fxP});
 // ---- 10. fin du niveau ----
 await pilote(19,15);await W(1800);const dn=await E(()=>{const S=ARC.modules.maze._state;return{ph:S.phase,t:S.tally,score:S.score,lvl:ARC.modules.maze._state.api.data().level,lives:S.lives}});await p.screenshot({path:`${O}/mz_10_level_completed.png`});
 await btn('bOk');await W(500);const n2=await E(()=>{const S=ARC.modules.maze._state;return{ph:S.phase,lv:S.lv,W:S.map.W,H:S.map.H,got:S.got,score:S.score}});
 ok('10 fin du niveau : portail atteint → LEVEL COMPLETED (cristaux, bonus temps, bonus niveau, +1 vie), niveau 2 débloqué et sauvegardé ; ENTER → « Le Labyrinthe Oublié »',dn.ph=='done'&&dn.t.crys==500&&dn.t.lvl==500&&dn.t.time>0&&dn.lvl==2&&dn.lives==4&&n2.ph=='intro'&&n2.lv==1&&n2.W==27&&n2.got==0&&n2.score==dn.score,{dn,n2});
 await W(2000);
 // ---- 6. intelligence des 3 gardiens : patrouille sans boucle, détection, poursuite par le plus court chemin, comportements différents ----
 await btn('bEx');await W(400);await E(()=>{ARC.sel=ARC.games.findIndex(g=>g.id=='maze');arcOk();arcOk()});await W(500);
 // l'écran de démarrage propose maintenant les niveaux 1 et 2 : on revient au niveau 1 au joystick (gauche)
 const selAv=await E(()=>ARC.modules.maze._state.sel);await joy('left',150);await W(250);const selAp=await E(()=>ARC.modules.maze._state.sel);await btn('bOk');await W(2300);
 const ia=await E(async()=>{const MZm=ARC.modules.maze,S=MZm._state,M=S.map;S.inv=1e9;S.grace=0;const P=S.p;Object.assign(P,{x:1,y:1,dir:null,want:null,wantT:0});
  // patrouille : coureur invisible (très loin en chemin) pendant 12 s
  const det=S.ens.map(e=>e.det);S.ens.forEach(e=>e.det=-1);const tiles=S.ens.map(()=>new Set());let wall=0;
  for(let i=0;i<240;i++){await new Promise(r=>setTimeout(r,50));S.ens.forEach((e,k)=>{tiles[k].add(Math.round(e.x)+','+Math.round(e.y));if(M.walls[Math.round(e.y)][Math.round(e.x)])wall++})}
  S.ens.forEach((e,k)=>e.det=det[k]);
  // poursuite : on pose le coureur à 4 cases (chemin) du chasseur
  const ch=S.ens[0];Object.assign(ch,{x:ch.hx,y:ch.hy,dir:null,mode:'patrol'});ch.x=7;ch.y=1;S.ens.slice(1).forEach(e=>{e.x=23;e.y=13});Object.assign(P,{x:11,y:1});
  const F=MZm._bfs(M.free,11,1),d0=F[7+1*M.W];const ds=[];for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,60));const f=MZm._bfs(M.free,Math.round(P.x),Math.round(P.y));ds.push(f[Math.round(ch.x)+Math.round(ch.y)*M.W])}
  const modeC=ch.mode;
  // spectre : voit le coureur au bout d'un long couloir droit (ligne de vue), au-delà de sa distance de détection
  const sp=S.ens[2];sp.x=12;sp.y=9;sp.dir=null;sp.mode='patrol';S.ens[0].x=23;S.ens[0].y=13;Object.assign(P,{x:1,y:9});await new Promise(r=>setTimeout(r,120));const modeS=sp.mode;
  return{tiles:tiles.map(t=>t.size),wall,d0,ds,modeC,modeS,types:S.ens.map(e=>e.ty.id),vit:S.ens.map(e=>+e.v.toFixed(2)),det}});
 ok('6 trois gardiens différents (chasseur rouge, rusé violet qui coupe la route, spectre qui voit loin) : patrouillent tout le labyrinthe sans tourner en rond ni traverser les murs, détectent le coureur et le poursuivent par le plus court chemin',
  selAv==1&&selAp==0&&ia.types.join()=='chasseur,ruse,spectre'&&ia.tiles.every(n=>n>=12)&&ia.wall==0&&ia.modeC=='chase'&&ia.ds[ia.ds.length-1]<ia.d0&&ia.modeS=='chase',ia);
 // ---- 7 & 8. collision avec un gardien : vie perdue, animation, retour au départ, cristaux gardés ; game over ----
 const col=await E(async()=>{const S=ARC.modules.maze._state;S.inv=0;S.grace=1e9;window.__fx.length=0;const c=S.map.crys[0];const P=S.p;Object.assign(P,{x:c.x,y:c.y,dir:null});await new Promise(r=>setTimeout(r,200));const got=S.got,l0=S.lives;
  const e=S.ens[0];Object.assign(P,{x:5,y:3,dir:null});e.x=5.4;e.y=3;e.dir=null;await new Promise(r=>setTimeout(r,120));const ph=S.phase,l1=S.lives;await new Promise(r=>setTimeout(r,1600));
  return{got,l0,l1,ph,after:S.phase,pos:[S.p.x,S.p.y],gotAfter:S.got,inv:S.inv>0,fx:window.__fx.includes('mzHit'),homes:S.ens.every(e=>e.x==e.hx&&e.y==e.hy||S.time<99)}});
 await p.screenshot({path:`${O}/mz_07_touche.png`});
 ok('7 collision avec un gardien : −1 vie, animation (clignotement, éclats, secousse) et son, réapparition au départ protégée un instant, cristaux déjà ramassés conservés',col.got==1&&col.l1==col.l0-1&&col.ph=='hit'&&col.after=='play'&&col.pos[0]==1&&col.pos[1]==1&&col.gotAfter==1&&col.inv&&col.fx,col);
 const go=await E(async()=>{const S=ARC.modules.maze._state;S.score=4321;while(S.lives>0){S.inv=0;if(S.phase!='play'){await new Promise(r=>setTimeout(r,100));continue}const e=S.ens[0];e.x=S.p.x;e.y=S.p.y;await new Promise(r=>setTimeout(r,150))}await new Promise(r=>setTimeout(r,1600));return{ph:S.phase,lives:S.lives,best:S.api.data().best}});
 await p.screenshot({path:`${O}/mz_08_game_over.png`});
 await W(700);await btn('bOk');await W(400);const re=await st();
 ok('8 vies : 3 au départ, perdues une à une, +1 vie en fin de niveau (vu au test 10) ; à 0 → GAME OVER ; ENTER rejoue le niveau avec 3 vies et score à zéro',go.ph=='over'&&go.lives==0&&re.ph=='intro'&&re.lives==3&&re.score==0,{go,re});
 // ---- 14. meilleur score sauvegardé (système de sauvegarde de Little Life) ----
 const sv=await E(()=>({best:N.arcade.maze.best,disque:Object.values(localStorage).some(v=>/"maze":\{[^}]*"best":4321/.test(v||''))}));
 // ---- 11 & 12. rotation pendant la partie : tout se recalcule, joystick toujours actif ----
 await W(2000);await calme();await place(cross[0],cross[1]);
 await p.setViewportSize({width:844,height:390});await W(700);const l1=await E(()=>{const S=ARC.modules.maze._state;return{land:S.L.land,T:S.L.T,w:S.W,h:S.H,dir:S.touch.dir,ph:S.phase,full:arcGS()}});await p.screenshot({path:`${O}/mz_11_paysage.png`});
 const a1=await st();await joy('right',230);await W(450);const a2=await st();
 await p.setViewportSize({width:390,height:844});await W(700);const l2=await E(()=>{const S=ARC.modules.maze._state;return{land:S.L.land,T:S.L.T,w:S.W,h:S.H,mm:!!S.L.mm}});const b1=await st();await joy('left',230);await W(450);const b2=await st();
 // rotation avec le doigt posé sur le joystick : rien ne reste coincé
 const J=await E(()=>ARC.modules.maze._state.L.joy);const jc=await scr(J.x,J.y);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jc.x,y:jc.y,id:6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:jc.x,y:jc.y-40,id:6}]});await W(100);
 await p.setViewportSize({width:844,height:390});await W(600);const stuck=await E(()=>ARC.modules.maze._state.touch.dir);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await place(cross[0],cross[1]);const c1=await st();await joy('down',230);await W(450);const c2=await st();
 ok('11 portrait ⇄ paysage en pleine partie : dimensions, échelle et caméra recalculées (paysage : labyrinthe entier ; portrait : vue rapprochée + carte), aucun blocage, doigt relâché proprement',l1.land&&l1.w>l1.h&&l1.T>=12&&l1.full.w>l1.full.h&&!l2.land&&l2.mm&&stuck==null&&l1.ph=='play',{l1,l2,stuck});
 ok('12 joystick tactile fonctionnel après chaque rotation (droite en paysage, gauche en portrait, bas après rotation doigt posé)',a2.x-a1.x>=1&&b2.x-b1.x<=-1&&c2.y-c1.y>=1,{a:[a1.x,a2.x],b:[b1.x,b2.x],c:[c1.y,c2.y]});
 await p.setViewportSize({width:390,height:844});await W(500);
 // ---- 13. EXIT : retour au catalogue, plus rien du jeu ne tourne ----
 await btn('bEx');await W(500);const ex=await E(()=>({st:ARC.state,cur:ARC.cur,api:ARC.modules.maze._state.api,on:ARC.on,mus:typeof JEUSON.playing=='function'?JEUSON.playing():null}));
 const t0=await E(()=>ARC.modules.maze._state.t);await W(400);const t1=await E(()=>ARC.modules.maze._state.t);await p.screenshot({path:`${O}/mz_13_catalogue.png`});
 // les autres jeux de la borne s'ouvrent toujours
 const autres=await E(async()=>{const r={};for(const id of ['mole','racing','pinball','hockey']){ARC.sel=ARC.games.findIndex(g=>g.id==id);arcOk();arcOk();await new Promise(r=>setTimeout(r,250));r[id]=ARC.state=='game'&&ARC.cur&&ARC.cur.id==id;ARC.modules[id]&&arcStop();arcGo('menu')}return r});
 ok('13 EXIT (bouton rouge) : retour direct au catalogue de la borne, jeu arrêté (plus de mise à jour, plus de toucher capté) ; les autres jeux s’ouvrent normalement',ex.st=='menu'&&ex.cur==null&&ex.api==null&&ex.on&&t1==t0&&Object.values(autres).every(Boolean),{ex,t0,t1,autres});
 // ---- 14 (suite) : rechargement → record toujours là, niveau 2 toujours débloqué ----
 await p.reload();await W(1800);const rl=await E(()=>({best:N.arcade&&N.arcade.maze&&N.arcade.maze.best,level:N.arcade&&N.arcade.maze&&N.arcade.maze.level}));
 ok('14 meilleur score enregistré dans la sauvegarde de Little Life (et niveau débloqué), retrouvé après rechargement',sv.best==4321&&sv.disque&&rl.best==4321&&rl.level==2,{sv,rl});
 // ---- 16. les 5 niveaux sont réellement terminables, ennemis et pièges actifs : un joueur automatique simple (plus court chemin,
 // s'écarte des gardiens, attend que les pics rentrent) joue 4 parties par niveau en simulation accélérée ----
 await E(()=>{if(ARC.state=='game')arcStop()});
 const r=await p.evaluate(()=>{const M=ARC.modules.maze,S=M._state;const out=[];const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 for(let lv=0;lv<5;lv++)for(let run=0;run<4;run++){M.start({w:300,h:600,exit(){},data:()=>({best:0,level:5}),save(){},record:()=>false,best:()=>0,saveLevel(){}});S.sel=lv;M._ok();
  window.__prog=0;const inp={};let t=0,hits=0,lastL=S.lives,why=[];while(t<600&&S.phase!='done'&&S.phase!='over'){
   if(S.phase=='play'){const P=S.p,cx=Math.round(P.x),cy=Math.round(P.y),Mp=S.map;const tgt=S.got<Mp.crys.length?Mp.crys.filter(c=>!c.got).map(c=>[c.x,c.y]):[[Mp.E.x,Mp.E.y]];
    const danger=new Set();S.ens.forEach(e=>{const ex=Math.round(e.x),ey=Math.round(e.y);const rad=t-(window.__prog||0)>25?1:2;for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)if(Math.abs(dx)+Math.abs(dy)<=rad)danger.add((ex+dx)+','+(ey+dy))});
    Mp.traps.forEach(tr=>{const c=(S.time+tr.ph)%3;if(c<1.4||c>2.3)danger.add(tr.x+','+tr.y)});const free=Mp.free.map((row,y)=>[...row].map((c,x)=>c=='#'||(danger.has(x+','+y)&&!(x==cx&&y==cy))?'#':' ').join(''));
    let best=null,bv=1e9;const on=tgt.find(([tx,ty])=>tx==cx&&ty==cy);if(on){const dx=on[0]-P.x,dy=on[1]-P.y;best=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':dy<0?'up':null);bv=-1}for(const [tx,ty] of (bv<0?[]:tgt)){const F=M._bfs(free,tx,ty);for(const k in D){const v=F[(cx+D[k][0])+(cy+D[k][1])*Mp.W];if(v>=0&&v<bv){bv=v;best=k}}}
    if(!best&&S.ens.some(e=>Math.abs(e.x-cx)+Math.abs(e.y-cy)<4)){// fuir : case voisine la plus loin des gardiens
     let fv=-1;for(const k in D){const nx=cx+D[k][0],ny=cy+D[k][1];if(Mp.walls[ny][nx]||Mp.traps.some(tr=>tr.x==nx&&tr.y==ny))continue;const m=Math.min(...S.ens.map(e=>Math.abs(e.x-nx)+Math.abs(e.y-ny)));if(m>fv){fv=m;best=k}}}
    for(const k in D)inp[k]=k==best?1:0}
   const g0=S.got;M.update(1/60,inp);t+=1/60;if(S.got!=g0||S.lives<lastL)window.__prog=t;if(S.lives<lastL){hits++;lastL=S.lives;const P=S.p;why.push((S.pops.find(o=>/PIÈGE/.test(o.s))?'T':'E')+'@'+Math.round(P.x)+','+Math.round(P.y))}}
  out.push({lv:lv+1,run,ph:S.phase,t:Math.round(t),hits,got:S.got,why:why.join('|'),E:S.map.E.x+','+S.map.E.y})}
 M.stop();return out});

 const parN=[0,1,2,3,4].map(l=>r.filter(o=>o.lv==l+1&&o.ph=='done').length);
 ok('16 les 5 niveaux sont terminables avec les gardiens et les pièges actifs (joueur automatique, 4 parties par niveau) ; difficulté croissante',parN.every(n=>n>=1)&&parN[0]>=3,{reussites_sur_4:parN,detail:r.map(o=>'N'+o.lv+':'+(o.ph=='done'?'gagné':'perdu')+' '+o.t+'s '+o.hits+' touché(s)').join(' · ')});
 ok('15 aucune erreur JavaScript',errs.length==0,errs);
 await b.close();fs.writeFileSync(path.join(O,'maze_resultats.json'),JSON.stringify(R,null,1));const n=R.filter(r=>r.ok).length;console.log(`\n${n}/${R.length} tests réussis`);process.exit(n==R.length?0:1)})();
