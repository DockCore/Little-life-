// ===== CANAPÉ COSY : menu de personnalisation (Décorer) + déplacement direct dans la pièce =====
let czMove=false,czOpt='',czSell=0,czGrab=null;const czSold=new Set();
const czSel=()=>draft&&czIs(draft[sel])?draft[sel]:null;
function czSync(){const bar=document.getElementById('czBar');if(!bar)return;const f=czSel();bar.hidden=!f;if(!f){czMove=false;czOpt='';czSell=0;return}
 bar.querySelector('[data-c="move"]').classList.toggle('on',czMove);bar.querySelector('[data-c="col"]').classList.toggle('on',czOpt=='col');bar.querySelector('[data-c="cus"]').classList.toggle('on',czOpt=='cus');
 const sb=bar.querySelector('[data-c="sell"]'),pr=czPrice();sb.textContent=czSell?'Confirmer +'+pr:'Vendre';sb.classList.toggle('warn',!!czSell);
 const o=document.getElementById('czOpt');o.hidden=!czOpt;if(!czOpt)return;
 const sw=(arr,cur,k)=>`<div class="opts">${arr.map(([n,c],i)=>`<button class="sw${i==cur?' on':''}${c?'':' none'}" data-k="${k}" data-i="${i}" aria-label="${n}" title="${n}"${c?` style="background:${c}"`:''}></button>`).join('')}</div>`;
 o.innerHTML=czOpt=='col'?`<div class="orow"><span>Tissu · ${CZF[f.k|0][0]}</span>${sw(CZF,f.k|0,'k')}</div>`
  :`<div class="orow"><span>Coussins · ${CZC[f.ck|0][0]}</span>${sw(CZC,f.ck|0,'ck')}</div><div class="orow"><span>Plaid · ${CZP[f.pk|0][0]}</span>${sw(CZP,f.pk|0,'pk')}</div>`;
 o.querySelectorAll('.sw[style]').forEach(b=>b.style.setProperty('background',b.style.background,'important'))}
const czPrice=()=>Math.round(((SHOP.find(s=>s.n==COSY)||{p:180}).p)/2);
// un coloris change tout de suite le canapé de la pièce et il est sauvegardé
function czColor(k,i){const f=czSel();if(!f)return;f[k]=i;if(k=='k')f.c=CZF[i][1];const real=N.furn.find(o=>czSame(o,f));if(real){real[k]=i;if(k=='k')real.c=f.c}save();planDraw();
 say(k=='k'?'Canapé habillé de '+CZF[i][0].toLowerCase()+'. Ombres et coutures suivent le tissu.':k=='ck'?'Coussins : '+CZC[i][0].toLowerCase()+'.':i==7?'Plaid rangé dans le placard.':'Plaid : '+CZP[i][0].toLowerCase()+'.')}
(function(){const bar=document.getElementById('czBar');if(!bar)return;
 bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.k){czColor(b.dataset.k,+b.dataset.i);return}
  const c=b.dataset.c,f=czSel();if(!f)return;if(c!='sell')czSell=0;
  if(c=='move'){czMove=!czMove;czOpt='';say(czMove?'Fais glisser le canapé dans la pièce, ou touche le sol pour l’y amener. Les flèches le poussent d’une case.':'Déplacement terminé.')}
  else if(c=='rot'){document.getElementById('rot').click()}
  else if(c=='col'||c=='cus'){czOpt=czOpt==c?'':c;czMove=false;if(czOpt)say(c=='col'?'Choisis le tissu du canapé.':'Choisis les coussins et le plaid.')}
  else if(c=='ok'){czMove=false;czOpt='';document.getElementById('ok').click()}
  else if(c=='stow'){czMove=false;czOpt='';document.getElementById('stow').click()}
  else if(c=='sell'){if(!czSell){czSell=1;say('Vendre ce canapé pour '+czPrice()+' pièces ? Touche « Confirmer ».')}else{czSell=0;czSold.add(f.id);draft.splice(sel,1);sel=0;earn(czPrice());document.getElementById('ok').click();say('Canapé vendu : +'+czPrice()+' pièces. Le reste de ta déco est enregistré.');hearts(1)}}
  czSync()})})();
// après validation : on garde les coloris d'un canapé rangé, et le personnage suit son canapé
(function(){const okB=document.getElementById('ok'),okF=okB.onclick;okB.onclick=()=>{const old=N.furn.filter(czIs);okF();
 old.forEach(o=>{if(!N.furn.some(f=>czSame(f,o))&&!czSold.has(o.id))(N.czKeep=N.czKeep||[]).push({k:o.k|0,ck:o.ck|0,pk:o.pk|0})});czSold.clear();
 if(C.st=='sofa'&&czIs(C.seat)){const n=N.furn.find(f=>czSame(f,C.seat));if(n){C.seat=n;C._czs=n;const t=czFront(n);C.x=t[0]*12;C.y=88+t[1]*5}else{C.st='idle';C.seat=null;C._czs=null;C.rise=null}}
 if(C.st!='sofa'&&hit(C.x,C.y))[C.x,C.y]=out(C.x,C.y);save()}})();
// dans « Décorer » : toucher un meuble dans la pièce le sélectionne, le glisser le déplace case par case
function czScene(e){const b=RC.getBoundingClientRect();return[(e.clientX-b.left)/b.width*LW,(e.clientY-b.top)/b.height*LH]}
topbox.addEventListener('pointerdown',e=>{if(e.target!==RC||!draft||e.zmPass||place!='home'||curV!='deco')return;isoSetup();const[mx2,my]=czScene(e);
 const idx=draft.map((f,i)=>i).filter(i=>draft[i].n!='Tapis'||true).sort((a,b)=>(draft[b].x+draft[b].w+draft[b].y+draft[b].h)-(draft[a].x+draft[a].w+draft[a].y+draft[a].h));
 let hitI=-1,hk=0;for(const i of idx){const f=draft[i],ks=f.n=='Tapis'?[0]:[0,6,12,18,24,30,36];for(const k of ks){const[a,b]=isoInv(mx2,my+k);if(a>=f.x&&a<=f.x+f.w&&b>=f.y&&b<=f.y+f.h){hitI=i;hk=k;break}}if(hitI>=0)break}
 if(hitI<0){const f=czSel();if(f&&czMove){const[a,b]=isoInv(mx2,my),nx=Math.round(a-f.w/2),ny=Math.round(b-f.h/2);e.stopImmediatePropagation();e.preventDefault();
   if(free(sel,nx,ny,f.w,f.h)){f.x=nx;f.y=ny;planDraw();say('Canapé déplacé. Valide quand tu es content'+(N.look.g=='f'?'e':'')+'.')}else say('Pas assez de place ici pour le canapé.')}return}
 e.stopImmediatePropagation();e.preventDefault();const f=draft[hitI],[a,b]=isoInv(mx2,my+hk);if(sel!==hitI){sel=hitI;czSell=0;czOpt=czIs(f)?czOpt:'';say(f.n+' sélectionné'+gE(f.n)+'. Fais-l'+(gE(f.n)?'a':'e')+' glisser sur la grille.')}
 czGrab={id:e.pointerId,i:hitI,k:hk,off:[a-f.x,b-f.y],moved:false};planDraw()},true);
addEventListener('pointermove',e=>{const g=czGrab;if(!g||g.id!==e.pointerId||!draft)return;const f=draft[g.i];if(!f){czGrab=null;return}isoSetup();const[mx2,my]=czScene(e),[a,b]=isoInv(mx2,my+g.k),nx=Math.round(a-g.off[0]),ny=Math.round(b-g.off[1]);
 if((nx!=f.x||ny!=f.y)&&free(g.i,nx,ny,f.w,f.h)){f.x=nx;f.y=ny;g.moved=true;planDraw()}if(e.cancelable)e.preventDefault()},{passive:false,capture:true});
const czDrop=e=>{const g=czGrab;if(!g||g.id!==e.pointerId)return;czGrab=null;if(g.moved&&draft&&draft[g.i]){const f=draft[g.i];say(f.n+' déplacé'+gE(f.n)+'. Touche « Valider » pour garder ta déco.')}};
addEventListener('pointerup',czDrop,true);addEventListener('pointercancel',czDrop,true);
// grille de placement dessinée sur le sol pendant la déco
function czGrid(){G.globalAlpha=.16;for(let i=0;i<=RN;i++){ln(P3(i,0,0),P3(i,RN,0),'#3b2a24');ln(P3(0,i,0),P3(RN,i,0),'#3b2a24')}G.globalAlpha=1;
 const f=draft[sel];if(f){G.globalAlpha=.22;poly([P3(f.x,f.y,0),P3(f.x+f.w,f.y,0),P3(f.x+f.w,f.y+f.h,0),P3(f.x,f.y+f.h,0)],'#00BDEB');G.globalAlpha=1}}
// vue « Canapé » : les poses du personnage
(function(){const v=document.getElementById('v-sofa');if(!v)return;v.addEventListener('click',e=>{const b=e.target.closest('[data-cz]');if(!b||b.disabled)return;const k=b.dataset.cz;
 if(k=='custom'){const f=(C.st=='sofa'&&czIs(C.seat))?C.seat:N.furn.find(czIs);show('deco');if(f){const i=draft.findIndex(o=>czSame(o,f));if(i>=0){sel=i;czOpt='col';planDraw();say('Personnalise ton canapé : tissu, coussins, plaid, place et orientation.')}}return}
 if(k=='up'){czUp();return}
 if(C.st=='sofa'&&czIs(C.seat)){czPose(k);return}
 const f=N.furn.find(czIs);if(!f){say('Il n’y a pas de canapé cosy dans ta pièce.');return}goCosy(f,k)})})();
