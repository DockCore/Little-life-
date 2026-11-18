// ===== MOBILIER : menu contextuel commun (Décorer) — déplacer, tourner, couleurs, parties, vendre, ranger, valider =====
let czMove=false,czOpt='',czSell=0,czGrab=null,czPart=0;const czSold=new Set();
const czSel=()=>draft&&draft[sel]?draft[sel]:null;
function czSync(){const bar=document.getElementById('czBar');if(!bar)return;const f=czSel();bar.hidden=!f;if(!f){czMove=false;czOpt='';czSell=0;return}
 const P=fParts(f),q=k=>bar.querySelector('[data-c="'+k+'"]'),rots=fRots(f.n);
 q('move').classList.toggle('on',czMove);q('rot').disabled=rots.length<2;q('col').disabled=!P.length;q('parts').disabled=P.length<2;
 q('col').classList.toggle('on',czOpt=='col');q('parts').classList.toggle('on',czOpt=='parts');
 const sb=q('sell'),pr=fResale(f.n);sb.textContent=czSell?'Confirmer +'+pr:'Vendre · '+pr;sb.classList.toggle('warn',!!czSell);
 const o=document.getElementById('czOpt');if(czOpt&&!P.length)czOpt='';o.hidden=!czOpt;if(!czOpt)return;
 const row=(p)=>{const cur=fIdx(f,p.k);if(p.motif)return`<div class="orow"><span>${p.n} · ${p.pal[cur][0]}</span><div class="opts">${p.pal.map(([n],i)=>`<button class="${i==cur?'on':''}" data-k="${p.k}" data-i="${i}">${n}</button>`).join('')}</div></div>`;
  return`<div class="orow"><span>${p.n} · ${p.pal[cur][0]}</span><div class="opts">${p.pal.map(([n,c],i)=>`<button class="sw${i==cur?' on':''}${c?'':' none'}" data-k="${p.k}" data-i="${i}" aria-label="${n}" title="${n}"${c?` data-bg="${c}"`:''}></button>`).join('')}</div></div>`};
 if(czOpt=='col')o.innerHTML=row(P[0]);
 else{if(czPart>=P.length)czPart=0;o.innerHTML=`<div class="opts czp">${P.map((p,i)=>`<button class="${i==czPart?'on':''}" data-part="${i}">${p.n}</button>`).join('')}</div>`+row(P[czPart])}
 o.querySelectorAll('[data-bg]').forEach(b=>b.style.setProperty('background',b.dataset.bg,'important'))}
// un coloris change tout de suite le meuble de la pièce et il est sauvegardé
function czColor(k,i){const f=czSel();if(!f)return;const P=fParts(f).find(p=>p.k==k);if(!P)return;fSet(f,k,i);const real=N.furn.find(o=>czSame(o,f));if(real)fSet(real,k,i);save();planDraw();
 const nm=P.pal[i][0].toLowerCase();say(P.motif?'Motif : '+nm+'.':P.pal[i][1]?f.n+' · '+P.n.toLowerCase()+' : '+nm+'. Ombres et reliefs suivent la couleur.':P.n+' : '+nm+'.')}
function fSellMsg(f){const d=FD[f.n],w=d&&d.warn?d.warn.replace('{N}',NAME())+' ':'';return w+'Vendre '+f.n.toLowerCase()+' pour '+fResale(f.n)+' pièces ? Touche « Confirmer » pour valider la vente.'}
// la vente : crédit, retrait de la pièce, place libérée, transaction enregistrée dans la sauvegarde
function fSell(){const f=czSel();if(!f)return;const p=fResale(f.n);czSold.add(f.id);draft.splice(sel,1);sel=0;earn(p);
 N.sales=(N.sales||[]).concat([{n:f.n,p,t:Date.now()}]).slice(-60);N.gone=N.gone||{};if(!draft.some(o=>o.n==f.n))N.gone[f.n]=1;
 document.getElementById('ok').click();say(f.n+' vendu'+gE(f.n)+' : +'+p+' pièces. Le reste de ta déco est enregistré.');hearts(1)}
(function(){const bar=document.getElementById('czBar');if(!bar)return;
 bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.part!=null){czPart=+b.dataset.part;czSync();return}
  if(b.dataset.k){czColor(b.dataset.k,+b.dataset.i);czSync();return}
  const c=b.dataset.c,f=czSel();if(!f)return;if(c!='sell')czSell=0;
  if(c=='move'){czMove=!czMove;czOpt='';say(czMove?'Fais glisser '+f.n.toLowerCase()+' dans la pièce, ou touche le sol pour l’y amener. Les flèches le poussent d’une case.':'Déplacement terminé.')}
  else if(c=='rot'){document.getElementById('rot').click()}
  else if(c=='col'||c=='parts'){czOpt=czOpt==c?'':c;czMove=false;if(czOpt)say(c=='col'?'Choisis la couleur de '+f.n.toLowerCase()+'.':'Choisis une partie, puis sa couleur.')}
  else if(c=='ok'){czMove=false;czOpt='';document.getElementById('ok').click()}
  else if(c=='stow'){czMove=false;czOpt='';document.getElementById('stow').click()}
  else if(c=='sell'){if(!czSell){czSell=1;say(fSellMsg(f))}else{czSell=0;fSell()}}
  czSync()})})();
// après validation : un meuble rangé garde ses couleurs, et le personnage suit son siège
function fSanity(){const has=n=>N.furn.some(f=>f.n==n);
 if(C.st=='sleep'&&!has('Lit')){C.st='idle';try{sl.textContent='Dormir'}catch(e){}}
 if(seated()&&!has('Bureau')){C.st='idle';C.wk=null}
 if(C.st=='dine'&&!has('Table')){C.st='idle';C.seq=null;C.food=null;C.drk=null}
 if(C.st=='wc'&&!has('WC'))C.st='idle';if(C.st=='shower'&&!has('Douche'))C.st='idle';
 if(C.st=='sofa'&&!czIs(C.seat)&&!(C.seat?N.furn.includes(C.seat):sofaF()))C.st='idle';
 if(C.st!='sofa'&&hit(C.x,C.y))[C.x,C.y]=out(C.x,C.y);fHome()}
(function(){const okB=document.getElementById('ok'),okF=okB.onclick;okB.onclick=()=>{const old=N.furn.slice();okF();
 old.forEach(o=>{if(o.id&&!N.furn.some(f=>czSame(f,o))&&!czSold.has(o.id)){N.fKeep=N.fKeep||{};(N.fKeep[o.n]=N.fKeep[o.n]||[]).push({cl:o.cl||null,k:o.k,ck:o.ck,pk:o.pk})}});czSold.clear();
 N.gone=N.gone||{};old.forEach(o=>{if(!N.furn.some(f=>f.n==o.n))N.gone[o.n]=1});
 if(C.st=='sofa'&&czIs(C.seat)){const n=N.furn.find(f=>czSame(f,C.seat));if(n){C.seat=n;C._czs=n;const t=czFront(n);C.x=t[0]*12;C.y=88+t[1]*5}else{C.st='idle';C.seat=null;C._czs=null;C.rise=null}}
 fSanity();save()}})();
// tout meuble peut être rangé (il revient depuis l'inventaire avec ses couleurs)
(function(){const sb=document.getElementById('stow');sb.onclick=()=>{if(!draft)return;const f=draft[sel];if(!f)return;stowed.push(f.n);draft.splice(sel,1);sel=0;planDraw();
 const w=FD[f.n]&&FD[f.n].warn?' '+FD[f.n].warn.replace('{N}',NAME()):'';say(f.n+' sera rangé'+gE(f.n)+' à la validation.'+w)}})();
// dans « Décorer » : toucher un meuble dans la pièce le sélectionne, le glisser le déplace case par case
function czScene(e){const b=RC.getBoundingClientRect();return[(e.clientX-b.left)/b.width*LW,(e.clientY-b.top)/b.height*LH]}
topbox.addEventListener('pointerdown',e=>{if(e.target!==RC||!draft||e.zmPass||place!='home'||curV!='deco')return;isoSetup();const[mx2,my]=czScene(e);
 const idx=draft.map((f,i)=>i).sort((a,b)=>((draft[a].n=='Tapis')-(draft[b].n=='Tapis'))||((draft[b].x+draft[b].w+draft[b].y+draft[b].h)-(draft[a].x+draft[a].w+draft[a].y+draft[a].h)));
 let hitI=-1,hk=0;for(const i of idx){const f=draft[i],ks=f.n=='Tapis'?[0]:[0,6,12,18,24,30,36,44];for(const k of ks){const[a,b]=isoInv(mx2,my+k);if(a>=f.x&&a<=f.x+f.w&&b>=f.y&&b<=f.y+f.h){hitI=i;hk=k;break}}if(hitI>=0)break}
 if(hitI<0){const f=czSel();if(f&&czMove){const[a,b]=isoInv(mx2,my),nx=Math.round(a-f.w/2),ny=Math.round(b-f.h/2);e.stopImmediatePropagation();e.preventDefault();
   if(free(sel,nx,ny,f.w,f.h)){f.x=nx;f.y=ny;planDraw();say(f.n+' déplacé'+gE(f.n)+'. Valide quand tu es content'+(N.look.g=='f'?'e':'')+'.')}else say('Pas assez de place ici.')}return}
 e.stopImmediatePropagation();e.preventDefault();const f=draft[hitI],[a,b]=isoInv(mx2,my+hk);if(sel!==hitI){sel=hitI;czSell=0;czPart=0;if(!fParts(f).length)czOpt='';say(f.n+' sélectionné'+gE(f.n)+'. Fais-l'+(gE(f.n)?'a':'e')+' glisser sur la grille.')}
 czGrab={id:e.pointerId,i:hitI,k:hk,off:[a-f.x,b-f.y],moved:false};planDraw()},true);
addEventListener('pointermove',e=>{const g=czGrab;if(!g||g.id!==e.pointerId||!draft)return;const f=draft[g.i];if(!f){czGrab=null;return}isoSetup();const[mx2,my]=czScene(e),[a,b]=isoInv(mx2,my+g.k),nx=Math.round(a-g.off[0]),ny=Math.round(b-g.off[1]);
 if((nx!=f.x||ny!=f.y)&&free(g.i,nx,ny,f.w,f.h)){f.x=nx;f.y=ny;g.moved=true;planDraw()}if(e.cancelable)e.preventDefault()},{passive:false,capture:true});
const czDrop=e=>{const g=czGrab;if(!g||g.id!==e.pointerId)return;czGrab=null;if(g.moved&&draft&&draft[g.i]){const f=draft[g.i];say(f.n+' déplacé'+gE(f.n)+'. Touche « Valider » pour garder ta déco.')}};
addEventListener('pointerup',czDrop,true);addEventListener('pointercancel',czDrop,true);
// grille de placement dessinée sur le sol pendant la déco
function czGrid(){G.globalAlpha=.22;for(let i=1;i<RN;i++){ln(P3(i,0,0),P3(i,RN,0),'#fff3d6');ln(P3(0,i,0),P3(RN,i,0),'#fff3d6')}G.globalAlpha=1;
 const f=draft[sel];if(f){G.globalAlpha=.22;poly([P3(f.x,f.y,0),P3(f.x+f.w,f.y,0),P3(f.x+f.w,f.y+f.h,0),P3(f.x,f.y+f.h,0)],'#00BDEB');G.globalAlpha=1}}
// vue « Canapé / Fauteuil » : les poses du personnage
(function(){const v=document.getElementById('v-sofa');if(!v)return;v.addEventListener('click',e=>{const b=e.target.closest('[data-cz]');if(!b||b.disabled)return;const k=b.dataset.cz;
 if(k=='custom'){const f=(C.st=='sofa'&&czIs(C.seat))?C.seat:N.furn.find(czIs);show('deco');if(f){const i=draft.findIndex(o=>czSame(o,f));if(i>=0){sel=i;czOpt='col';planDraw();say('Personnalise ton siège : couleurs, parties, place et orientation.')}}return}
 if(k=='up'){czUp();return}
 if(C.st=='sofa'&&czIs(C.seat)){czPose(k);return}
 const f=N.furn.find(czIs);if(!f){say('Il n’y a pas de siège à personnaliser dans ta pièce.');return}goCosy(f,k)})})();
// sans bureau, « Ma maison » donne accès à la déco, à l'inventaire et aux tenues
function fHome(){const b=document.getElementById('bHouse'),has=N.furn.some(f=>f.n=='Bureau');if(b)b.hidden=has;const h=document.querySelector('#v-home .hint');if(h)h.textContent=has?'Touche le bureau pour télétravailler, changer de tenue ou décorer.':'« Ma maison » : déco, inventaire et tenues. Touche un meuble pour l’utiliser.';
 const w=document.getElementById('bWork');if(w)w.disabled=place=='home'&&!has}
(function(){const b=document.getElementById('bHouse');if(b)b.onclick=()=>show('desk');fHome()})();
// --- Boutique déco : catégories ---
let shCat='all';
(function(){const c=document.getElementById('shCats');if(!c)return;c.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;shCat=b.dataset.cat;shopDraw();const t=FCATS.find(x=>x[0]==shCat);say(shCat=='all'?'Toute la Boutique déco.':t[1]+'.')})})();
function shCatsDraw(){const c=document.getElementById('shCats');if(!c)return;c.innerHTML=FCATS.filter(([k])=>k=='all'||SHOP.some(s=>fCat(s.n)==k)).map(([k,n])=>`<button data-cat="${k}" class="${k==shCat?'on':''}">${n}</button>`).join('')}
// catalogue : tous les meubles du registre sont en vente (même ceux de départ, pour pouvoir les racheter)
Object.keys(FD).forEach(n=>{const d=FD[n];if(d.rots)ROTS[n]=d.rots;if(!SHOP.some(s=>s.n==n))SHOP.push({n,w:d.w,h:d.h,p:d.p,c:d.c,d:d.d,s:d.s})});
SHOP.forEach(s=>{if(FD[s.n])s.p=FD[s.n].p});
// sauvegarde : un identifiant par meuble (pour garder ses couleurs), ancienne réserve du canapé cosy reprise
N.furn.forEach(f=>{if(!f.id)f.id=fNewId()});if(N.czKeep&&N.czKeep.length){N.fKeep=N.fKeep||{};N.fKeep['Canapé cosy']=(N.fKeep['Canapé cosy']||[]).concat(N.czKeep);N.czKeep=[]}
