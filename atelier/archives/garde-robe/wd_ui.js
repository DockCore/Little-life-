// --- tenue v2 : données ---
const wHex=(id,ci)=>{const it=WCAT[id];return it&&it.pal&&(it.pal[ci]||it.pal[0])[1]};
const wNear=(hex,pal)=>{if(!hex)return 0;const a=hx2(hex);let b=0,bd=1e9;pal.forEach((c,i)=>{const q=hx2(c),d=(a[0]-q[0])**2+(a[1]-q[1])**2+(a[2]-q[2])**2;if(d<bd){bd=d;b=i}});return b};
const wGet=(L,slot)=>{const v=(L.wd||{})[slot];if(!v)return null;const[id,ci]=String(v).split('|');return WCAT[id]?{id,ci:+ci||0,it:WCAT[id]}:null};
const wOwn=id=>{const it=WCAT[id];return!!it&&(it.p==0||!!(N.wd2&&N.wd2.own[id]))};
const wFor=(it,g)=>it.g=='u'||it.g==(g=='f'?'f':'m');
// les anciens réglages restent synchronisés : météo, travail, bureau, puzzle et petites remarques continuent de fonctionner
function wSync(L){const W=L.wd||(L.wd={});const h=wGet(L,'haut'),r=wGet(L,'robe'),b=wGet(L,'bas'),v=wGet(L,'veste'),s=wGet(L,'chaussures'),t=wGet(L,'tete'),y=wGet(L,'yeux'),hr=wGet(L,'cheveux');
 const knit=x=>x&&['pull','roll','rpull','hoodie'].includes(x.id),topI=h||r;
 L.top=topI?(knit(topI)?'p':'t'):'';if(topI){const hx=wHex(topI.id,topI.ci);if(L.top=='p')L.puc=wNear(hx,PULLC);else L.tco=wNear(hx,TEEC)}
 L.ve=v?1:0;if(v)L.jk=wNear(wHex(v.id,v.ci),JKP);
 L.nop=b||r?0:1;if(b||r){const x=b||r;L.pn=wNear(wHex(x.id,x.ci),PNP)}
 L.nos=s?0:1;if(s){L.sz=wNear(wHex(s.id,s.ci),SZP);L.shm=['bottine','bottes'].includes(s.id)?1:0}
 L.hat=t&&t.it.legacy?t.it.legacy.hat:'';if(t&&t.it.legacy){L[t.it.legacy.k]=t.ci}
 L.gl=y&&y.it.legacy?y.it.legacy.gl:'';if(y&&y.it.legacy)L.glc=y.ci;
 if(hr)L.hr=hr.ci;return L}
function wEquip(L,id,ci){const it=WCAT[id];if(!it)return;const W=L.wd||(L.wd={});
 if(it.slot=='robe'){W.haut=null;W.bas=null}
 if((it.slot=='haut'||it.slot=='bas')&&W.robe)W.robe=null;
 W[it.slot]=id+'|'+(ci|0);wSync(L)}
function wRemove(L,slot){const W=L.wd||(L.wd={});W[slot]=null;if(slot=='cheveux')W.cheveux='nat|'+(L.hr||0);wSync(L)}
const wWorn=(L,id)=>{const it=WCAT[id];const g=it&&wGet(L,it.slot);return!!g&&g.id==id};
// reprise des anciennes affaires (t-shirt, pull, veste, pantalon, baskets, montantes, bonnet, casquette, casque, lunettes)
(function wMigrate(){N.wd2=N.wd2||{own:{}};if(!N.wd2.own)N.wd2.own={};const L=N.look;
 if(!N.wd2.mig){const map={tee:'tee',pull:'pull',veste:'blouson',pant:'chino',basket:'basket',mont:'bottine',bonnet:'bonnet',casq:'casq',phones:'phones',glass:'glass',sun:'sun'};
  Object.keys(N.ward||{}).forEach(k=>{if(N.ward[k]&&map[k])N.wd2.own[map[k]]=1});N.wd2.mig=1}
 if(!L.wd){const W={};
  if(L.top=='t')W.haut='tee|'+wNear(TEEC[L.tco||0],WPC.tee);else if(L.top=='p')W.haut='pull|'+wNear(PULLC[L.puc||0],WPC.knit);
  if(L.ve)W.veste='blouson|'+wNear(JKP[L.jk||0],WPC.leather);
  if(!L.nop)W.bas='chino|'+wNear(PNP[L.pn||0],WPC.chino);
  if(!L.nos)W.chaussures=(L.shm==1?'bottine|'+wNear(SZP[L.sz||0],WPC.leather):'basket|'+wNear(SZP[L.sz||0],WPC.shoe));
  if(L.hat)W.tete=L.hat+'|'+(L.hat=='phones'?L.phc||0:L.hac||0);if(L.gl)W.yeux=L.gl+'|'+(L.glc||0);
  W.cheveux=(L.g=='f'?'nat':'nat')+'|'+(L.hr||0);L.wd=W;wSync(L)}
 if(!Array.isArray(N.outf2)){N.outf2=[];(N.outf||[]).forEach((o,i)=>{if(!o)return;const T=Object.assign({},N.look,o,{wd:null});const W={};
   if(T.top=='t')W.haut='tee|'+wNear(TEEC[T.tco||0],WPC.tee);else if(T.top=='p')W.haut='pull|'+wNear(PULLC[T.puc||0],WPC.knit);if(T.ve)W.veste='blouson|0';if(!T.nop)W.bas='chino|0';if(!T.nos)W.chaussures='basket|0';
   N.outf2[i]={n:OUTF[i]||('Tenue '+(i+1)),wd:W}})}})();
// --- rendu : on dessine le corps en sous-vêtements (ancien moteur, accessoires d'origine compris), puis chaque vêtement en couche ---
const _recolorV1=recolor;
recolor=function(f,L,nm){if(!L||!L.wd||L.nu)return _recolorV1(f,L,nm);
 const t=wGet(L,'tete'),y=wGet(L,'yeux');
 const base=Object.assign({},L,{wd:null,ve:0,top:'',nop:1,nos:1,hat:t&&t.it.legacy?t.it.legacy.hat:'',gl:y&&y.it.legacy?y.it.legacy.gl:''});
 if(t&&t.it.legacy)base[t.it.legacy.k]=t.ci;if(y&&y.it.legacy)base.glc=y.ci;
 const out=_recolorV1(f,base,nm);if(isSleepFrame(nm))return out;return wCompose(out,f,L,nm)};
// les cartes du corps arrivent en différé : on redessine dès qu'elles sont prêtes
(function wWait(){if(Object.keys(FGAR).length>=Object.keys(SPF).length){RCF.clear();spKey='';Object.keys(ICK).forEach(k=>delete ICK[k]);return}setTimeout(wWait,150)})();
// --- dressing : vues du personnage (face, trois-quarts, profil, dos, marche) ---
let wdView=0,wdTab='haut',clTab='haut',wdPart={};
const WDV=['v_front','v_q','v_side','v_back'];
function wdFrame(){if(wdView==4){const g=N.look.g!='f'&&SPR.wf0;return g?'wf'+(Math.floor(C.t/WKT)%8):'w'+(Math.floor(C.t/7)%4)}return WDV[wdView]}
// --- vignettes : le personnage portant l'article, recadré sur la zone concernée ---
const WICK={};
function wZone(tab){const F=FGAR['v_front'];let parts=tab=='bas'?[6,10,11]:tab=='chaussures'?[11,12]:tab=='acc'||tab=='cheveux'?[1,2]:tab=='robe'?[4,5,6,10]:tab=='tenues'||tab=='ens'?[1,2,3,4,5,6,10,11,12]:[2,3,4,5,7,8];
 if(!F)return[10,40,60,48];let x0=CW,x1=0,y0=CH,y1=0;for(let p=0;p<CW*CH;p++){if(!parts.includes(F.P[p]))continue;const x=p%CW,y=(p/CW)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<x0)return[10,40,60,48];const pad=tab=='tenues'||tab=='ens'?2:4;x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(CW-1,x1+pad);y1=Math.min(CH-1,y1+pad);
 const w=x1-x0+1,h=y1-y0+1,s=Math.max(w,h*1.15);const cx=(x0+x1)/2,cy=(y0+y1)/2;return[Math.max(0,Math.round(cx-s/2)),Math.max(0,Math.round(cy-s/2/1.15)),Math.round(s),Math.round(s/1.15)]}
function wIcon(look,tab){const key=JSON.stringify(look.wd)+look.g+look.sk+look.hr+tab;if(WICK[key])return WICK[key];const R=wZone(tab),c=document.createElement('canvas');c.width=R[2];c.height=R[3];
 if(drawFrame('v_front',look)){c.getContext('2d').drawImage(sc2,R[0],R[1],R[2],R[3],0,0,R[2],R[3]);WICK[key]=c}spKey='';return c}
const wCopy=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c};
// aperçu : l'article seul sur le personnage en sous-vêtements (même coiffure)
function wSolo(id,ci){const L=Object.assign({},N.look,{wd:{cheveux:(N.look.wd||{}).cheveux}});wEquip(L,id,ci);return L}
// --- les onglets ---
function wTabs(el,cur,shop){const g=N.look.g;el.innerHTML=WSLOTS.filter(([k])=>!(k=='robe'&&g!='f')&&!(shop&&k=='tenues')&&!(!shop&&k=='ens')).map(([k,n])=>`<button data-t="${k}" class="${k==cur?'on':''}">${n}</button>`).join('')}
function wItems(tab){const g=N.look.g;return Object.values(WCAT).filter(it=>it.tab==tab&&wFor(it,g))}
// une carte article
function wCard(it,mode){const L=N.look,worn=wWorn(L,it.id),own=wOwn(it.id),cur=worn?wGet(L,it.slot).ci:(wdPart[it.id]!=null?wdPart[it.id]:(it.slot=='cheveux'?(L.hr||0):0));
 const d=document.createElement('div');d.className='wdc'+(worn?' on':'')+(!own?' lock':'');
 const ic=wCopy(wIcon(wSolo(it.id,cur),it.tab));const nm=document.createElement('b');nm.textContent=it.n;
 const sm=document.createElement('small');sm.textContent=it.col+(own?(it.p?' · possédé':' · offert'):' · '+it.p+' pièces');
 const sw=document.createElement('div');sw.className='wsw';(it.pal||[]).slice(0,it.slot=='cheveux'?14:10).forEach(([n,c],i)=>{const s=document.createElement('i');s.style.background=c;s.title=n;if(i==cur)s.className='on';
  s.onclick=e=>{e.stopPropagation();wdPart[it.id]=i;if(mode=='dress'&&worn&&own){wEquip(N.look,it.id,i);spKey='';save()}else if(mode=='shop'||!own){TRY=Object.assign({},N.look,{wd:Object.assign({},N.look.wd)});wEquip(TRY,it.id,i);spKey=''}else{}
   say(it.n+' · '+n.toLowerCase()+'.');(mode=='shop'?clDraw:drDraw)()};sw.append(s)});
 const b=document.createElement('button');
 if(mode=='dress'){if(!own){b.textContent='Au magasin';b.disabled=true}else if(worn&&it.slot!='cheveux'){b.textContent='Retirer'}else if(worn){b.textContent='Portée';b.disabled=true}else{b.textContent='Porter';b.className='on'}}
 else{if(own){b.textContent=worn?'Porté':'Possédé';b.disabled=true}else{const lack=it.p-N.coins;b.innerHTML=lack>0?'Encore '+lack:'<span class="cn"></span>'+it.p;b.disabled=lack>0;b.className='on'}}
 b.onclick=e=>{e.stopPropagation();if(mode=='dress'){if(worn){wRemove(N.look,it.slot);TRY=null;spKey='';save();say(it.n+' : retiré.');drDraw();return}wEquip(N.look,it.id,cur);TRY=null;spKey='';save();say(NAME()+' porte : '+it.n.toLowerCase()+'.');if(Math.random()<.5)clothReact(it);goalsTick();drDraw()}
  else{if(N.coins<it.p)return;earn(-it.p);N.wd2.own[it.id]=1;wEquip(N.look,it.id,cur);TRY=null;spKey='';save();hearts(2);talkMaybe('habits',.5);say(it.n+' : acheté et porté !');clothReact(it);goalsTick();clDraw()}};
 // toucher la carte = l'essayer sur le personnage
 d.onclick=()=>{TRY=Object.assign({},N.look,{wd:Object.assign({},N.look.wd)});wEquip(TRY,it.id,cur);spKey='';say('Essayage : '+it.n.toLowerCase()+(own?'':' ('+it.p+' pièces)')+'.');[...d.parentNode.children].forEach(x=>x.classList.remove('try'));d.classList.add('try')};
 const mid=document.createElement('div');mid.className='wdm';mid.append(nm,sm,sw);d.append(ic,mid,b);return d}
// tenues enregistrées
function wOutfits(el){const h=document.createElement('p');h.className='hint';h.textContent='Enregistre la tenue portée, puis remets-la d’un seul geste.';el.append(h);
 for(let i=0;i<6;i++){const o=N.outf2[i],d=document.createElement('div');d.className='wdc wide';const T=Object.assign({},N.look,{wd:o?Object.assign({},o.wd):{cheveux:(N.look.wd||{}).cheveux}});wSync(T);
  const ic=wCopy(wIcon(T,'tenues'));if(!o)ic.style.opacity=.35;const mid=document.createElement('div');mid.className='wdm';const nm=o?o.n:'Tenue '+(i+1);
  const parts=o?Object.values(o.wd).filter(Boolean).map(v=>WCAT[String(v).split('|')[0]]).filter(x=>x&&x.slot!='cheveux').map(x=>x.n).join(', '):'';mid.innerHTML=`<b>${nm}</b><small>${o?(parts||'Sous-vêtements'):'Emplacement libre'}</small>`;
  const bx=document.createElement('div');bx.className='ob';const s=document.createElement('button');s.textContent='Enregistrer';s.onclick=()=>{N.outf2[i]={n:o?o.n:'Tenue '+(i+1),wd:Object.assign({},N.look.wd)};save();say('Tenue enregistrée.');drDraw()};
  const w=document.createElement('button');w.textContent='Mettre';w.className='on';w.disabled=!o;w.onclick=()=>{const W={};let miss=0;Object.keys(o.wd).forEach(sl=>{const v=o.wd[sl];if(!v)return;const id=String(v).split('|')[0];if(wOwn(id))W[sl]=v;else miss++});N.look.wd=W;wSync(N.look);TRY=null;spKey='';save();say(NAME()+' met sa tenue « '+nm+' »'+(miss?' (sauf '+miss+' article'+(miss>1?'s':'')+' qui ne sont plus là)':'')+'.');talk(line('tenue'));drDraw()};
  bx.append(s,w);d.append(ic,mid,bx);el.append(d)}}
// ensembles (magasin)
function wEnsembles(el){const g=N.look.g;WENS.filter(e=>e.g=='u'||e.g==(g=='f'?'f':'m')).forEach(e=>{const its=e.its.filter(id=>WCAT[id]&&wFor(WCAT[id],g)),miss=its.filter(id=>!wOwn(id)),price=Math.round(miss.reduce((s,id)=>s+WCAT[id].p,0)*.85);
  const T=Object.assign({},N.look,{wd:{cheveux:(N.look.wd||{}).cheveux}});its.forEach(id=>wEquip(T,id,0));
  const d=document.createElement('div');d.className='wdc wide';const ic=wCopy(wIcon(T,'ens'));const mid=document.createElement('div');mid.className='wdm';mid.innerHTML=`<b>${e.n}</b><small>${its.map(id=>WCAT[id].n).join(', ')}</small><small>${miss.length?'Ensemble −15 % : '+price+' pièces':'Ensemble complet possédé'}</small>`;
  const b=document.createElement('button');b.className='on';if(!miss.length){b.textContent='Porter';b.onclick=()=>{const W={cheveux:(N.look.wd||{}).cheveux};N.look.wd=W;its.forEach(id=>wEquip(N.look,id,0));TRY=null;spKey='';save();say(NAME()+' porte l’ensemble « '+e.n+' ».');clDraw()}}
  else{const lack=price-N.coins;b.innerHTML=lack>0?'Encore '+lack:'<span class="cn"></span>'+price;b.disabled=lack>0;b.onclick=()=>{if(N.coins<price)return;earn(-price);miss.forEach(id=>N.wd2.own[id]=1);N.look.wd={cheveux:(N.look.wd||{}).cheveux};its.forEach(id=>wEquip(N.look,id,0));TRY=null;spKey='';save();hearts(3);say('Ensemble « '+e.n+' » acheté et porté !');goalsTick();clDraw()}}
  d.onclick=()=>{TRY=T;spKey='';say('Essayage : ensemble « '+e.n+' ».')};d.append(ic,mid,b);el.append(d)})}
// --- écrans ---
drDraw=function(){const el=document.getElementById('drList');if(!el||curV!='dress')return;wTabs(document.getElementById('drSeg'),wdTab,false);el.innerHTML='';el.className='wdg';
 if(wdTab=='tenues'){wOutfits(el);return}const its=wItems(wdTab);its.filter(it=>wOwn(it.id)).concat(its.filter(it=>!wOwn(it.id))).forEach(it=>el.append(wCard(it,'dress')))};
clDraw=function(){const el=document.getElementById('clList');if(!el)return;const seg=document.getElementById('clSeg'),home=document.getElementById('clHome');wTabs(seg,clTab,true);if(home)seg.append(home);el.innerHTML='';el.className='wdg';
 if(clTab=='ens'){wEnsembles(el);return}wItems(clTab).forEach(it=>el.append(wCard(it,'shop')))};
document.getElementById('drSeg').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;wdTab=b.dataset.t;TRY=null;spKey='';drDraw()};
document.getElementById('clSeg').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;clTab=b.dataset.t;TRY=null;spKey='';clDraw()};
(function(){const v=document.getElementById('v-dress');if(!v)return;const bar=document.createElement('div');bar.className='wdbar';
 bar.innerHTML='<button id="wdRot">↻ Tourner</button><button id="wdAnim">Marcher</button><button id="wdAll">Tout retirer</button>';v.insertBefore(bar,document.getElementById('drList'));
 document.getElementById('wdRot').onclick=()=>{wdView=wdView>=3?0:wdView+1;spKey='';say(['De face.','De trois quarts.','De profil.','De dos.'][wdView])};
 document.getElementById('wdAnim').onclick=()=>{wdView=wdView==4?0:4;spKey='';say(wdView==4?'Petit défilé : la tenue suit chaque pas.':'De face.')};
 document.getElementById('wdAll').onclick=()=>{N.look.wd={cheveux:(N.look.wd||{}).cheveux};wSync(N.look);TRY=null;spKey='';save();say(NAME()+' est en sous-vêtements.');drDraw()}})();
const _dressedOK=dressedOK;
