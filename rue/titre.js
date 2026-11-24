// ===== ÉCRAN TITRE : illustration officielle, boutons « Nouvelle partie » / « Continuer » reliés au vrai jeu =====
const TITRE=(()=>{
 const G={geo:null};
 const T=document.getElementById('tscr'),box=T.querySelector('.tbox'),bd=T.querySelector('.tbd'),msg=document.getElementById('tMsg'),mL=T.querySelector('.tmirL'),mR=T.querySelector('.tmirR');
 const bNew=document.getElementById('tNew'),bCont=document.getElementById('tCont');
 // deux compositions de l'illustration officielle ; pour chacune : taille, zone à garder toujours visible (logo + personnage + boutons), position des boutons (px de l'image)
 const COMP={
  p:{art:T.querySelector('.tart.tp'),IW:941,IH:1672,crit:{x0:86,x1:855,y0:14,y1:1594},btn:{tNew:[90,1205,762,184],tCont:[95,1394,751,189]},msgY:1192},
  l:{art:T.querySelector('.tart.tl'),IW:1672,IH:941,crit:{x0:455,x1:1215,y0:8,y1:900},btn:{tNew:[486,605,696,154],tCont:[496,760,677,136]},msgY:596}};
 // zones sûres (encoche, barre d'accueil) mesurées par une sonde CSS
 const pr=document.createElement('div');pr.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(pr);
 // mise en page recalculée à partir des dimensions RÉELLES du moment (aucune valeur gardée de l'orientation précédente)
 function layout(){const W=innerWidth,H=innerHeight;if(!W||!H)return;const cs=getComputedStyle(pr),sa={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0};
  const land=W>H,C=land?COMP.l:COMP.p,K=C.crit;T.classList.toggle('land',land);
  const aw=W-sa.l-sa.r,ah=H-sa.t-sa.b;
  // remplir l'écran (cover) tant que logo, personnage et boutons restent entiers ; sinon réduire juste ce qu'il faut
  const s=Math.min(Math.max(W/C.IW,H/C.IH),aw/(K.x1-K.x0),ah/(K.y1-K.y0));
  const tw=Math.round(C.IW*s),th=Math.round(C.IH*s);
  const cl=(v,a,b)=>Math.min(Math.max(v,Math.min(a,b)),Math.max(a,b));
  const tx=Math.round(cl((W-tw)/2,sa.l-K.x0*s,W-sa.r-K.x1*s)),ty=Math.round(cl((H-th)/2,sa.t-K.y0*s,H-sa.b-K.y1*s));
  const st=T.style;st.setProperty('--tx',tx+'px');st.setProperty('--ty',ty+'px');st.setProperty('--tw',tw+'px');st.setProperty('--th',th+'px');st.setProperty('--my',Math.round(ty+C.msgY*s)+'px');
  // boutons replacés exactement sur leur dessin, en pixels de l'image courante
  for(const b of [bNew,bCont]){const[x,y,w,h]=C.btn[b.id];b.style.left=Math.round(x*s)+'px';b.style.top=Math.round(y*s)+'px';b.style.width=Math.round(w*s)+'px';b.style.height=Math.round(h*s)+'px'}
  // côtés plus larges que l'image : le décor se prolonge en miroir (pas de bande) ; haut/bas : décor flouté
  const url='url("'+C.art.src+'")',gapX=tx>0||tx+tw<W;[[mL,tx-tw],[mR,tx+tw]].forEach(([m,x])=>{m.classList.toggle('on',gapX);if(gapX){m.style.cssText=`left:${x}px;top:${ty}px;width:${tw}px;height:${th}px;background-image:${url};transform:scaleX(-1)`}});
  bd.style.backgroundImage=url;bd.style.display=(ty>0||ty+th<H)?'':'none';
  G.geo={land,s,tx,ty,tw,th,W,H,sa}}
 addEventListener('resize',layout);if(window.visualViewport)visualViewport.addEventListener('resize',layout);addEventListener('orientationchange',()=>{layout();[60,200,500].forEach(t=>setTimeout(layout,t))});
 const hasSave=()=>!!((typeof N!='undefined'&&N.created)||(typeof CLS!='undefined'&&CLS));
 // ---- sons (moteur audio existant, seulement après un geste du joueur) ----
 const snd=n=>{try{startAudio()}catch(e){}try{JEUSON.fx(n,1,.05)}catch(e){}};
 // ---- retour tactile : enfoncement, onde, étincelles, rebond ----
 function fxAt(b,x,y){const f=b.querySelector('.tfx')||(()=>{const e=document.createElement('i');e.className='tfx';b.querySelector('.tface').appendChild(e);return e})(),r=b.getBoundingClientRect();
  const rp=document.createElement('i');rp.className='trip';rp.style.left=(x-r.left)+'px';rp.style.top=(y-r.top)+'px';f.appendChild(rp);setTimeout(()=>rp.remove(),560);
  const host=b.parentNode,br=host.getBoundingClientRect();for(let i=0;i<7;i++){const s=document.createElement('i');s.className='tspk';const a=Math.PI*2*i/7+Math.random()*.6,d=34+Math.random()*30;s.style.left=(x-br.left)+'px';s.style.top=(y-br.top)+'px';s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');if(i%2)s.style.background='#ffffff';host.appendChild(s);setTimeout(()=>s.remove(),600)}}
 const P=new Map();
 function down(b,e){if(b.disabled||T.classList.contains('out'))return;b.classList.remove('rel','nope');b.classList.add('press');P.set(b,performance.now());const x=e&&e.clientX!=null?e.clientX:b.getBoundingClientRect().left+b.offsetWidth/2,y=e&&e.clientY!=null?e.clientY:b.getBoundingClientRect().top+b.offsetHeight/2;fxAt(b,x,y)}
 function up(b){if(!b.classList.contains('press'))return Promise.resolve();const held=performance.now()-(P.get(b)||0);return new Promise(r=>setTimeout(()=>{b.classList.remove('press');void b.offsetWidth;b.classList.add('rel');setTimeout(()=>b.classList.remove('rel'),400);r()},Math.max(0,100-held)))}
 [bNew,bCont].forEach(b=>{b.addEventListener('pointerdown',e=>{if(e.button>0)return;down(b,e)});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>up(b)));
  b.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&!e.repeat){e.preventDefault();down(b);setTimeout(()=>{up(b);b.click()},110)}})});
 // ---- sortie douce vers le jeu ----
 let busy=false;
 function leave(then){T.classList.add('out');setTimeout(()=>{T.hidden=true;T.classList.remove('out','enter');busy=false;try{then&&then()}catch(e){}},430)}
 // ---- « Nouvelle partie » : processus de création existant ; confirmation si une sauvegarde existe ----
 function onNew(){if(busy)return;snd('tiNew');busy=true;setTimeout(()=>{busy=false;
   if(hasSave()){fromTitle=true;gcM.classList.add('conf');gmenu.hidden=false;gConf.hidden=false;try{document.getElementById('gNo').focus({preventScroll:true})}catch(e){}return}
   busy=true;leave(()=>{try{fit()}catch(e){}})},170)}
 // ---- « Continuer » : chargement de la sauvegarde existante (locale ou copie en ligne) ----
 async function onCont(){if(busy)return;snd('tiCont');busy=true;await new Promise(r=>setTimeout(r,170));
  try{if(typeof cloudReady!='undefined'&&!cloudReady){tmsg('On retrouve ta partie…',2500);await Promise.race([CLP,new Promise(r=>setTimeout(r,5000))])}}catch(e){}
  if(typeof CLS!='undefined'&&CLS){T.classList.add('out');try{localStorage.setItem(KEY,JSON.stringify(CLS));localStorage.removeItem(KEYB);sessionStorage.setItem('ll_skip','1')}catch(e){}window.__wipe=true;setTimeout(()=>location.reload(),380);return}
  if(!N.created){busy=false;snd('tiNone');bCont.classList.remove('rel');void bCont.offsetWidth;bCont.classList.add('nope');setTimeout(()=>bCont.classList.remove('nope'),450);
   tmsg(saveBroken?'Ta sauvegarde semble abîmée : on l’a mise de côté. Crée un personnage, puis passe par Menu › Importer.':'Aucune sauvegarde trouvée',saveBroken?5000:2600);return}
  leave(()=>{try{fit()}catch(e){}if(saveRestored){saveRestored=false;say('Ta partie a été restaurée depuis la copie de secours.')}})}
 // la carte du menu du jeu (et non la fenêtre de vente, qui la précède dans la page) : en mode confirmation, seule la question s'affiche
 const gcM=gmenu.querySelector('.gcard');['gNo','gClose'].forEach(id=>{const e=document.getElementById(id);if(e)e.addEventListener('click',()=>gcM.classList.remove('conf'))});
 bNew.onclick=onNew;bCont.onclick=onCont;
 // ---- apparition + mise en évidence du bon bouton + reflets réguliers ----
 let shT=0;
 function shine(b){b.classList.remove('shine');void b.offsetWidth;b.classList.add('shine');setTimeout(()=>b.classList.remove('shine'),900)}
 // « Continuer » n'est actif que s'il existe une sauvegarde (locale ou copie en ligne retrouvée)
 function contState(){const on=hasSave();bCont.classList.toggle('off',!on);bCont.setAttribute('aria-disabled',on?'false':'true');bCont.setAttribute('aria-label',on?'Continuer':'Continuer (aucune sauvegarde)')}
 function onShow(){layout();contState();busy=false;msg.classList.remove('on');T.classList.remove('out');T.classList.add('enter');const h=hasSave()?bCont:bNew;bNew.classList.toggle('hint',h===bNew);bCont.classList.toggle('hint',h===bCont);
  setTimeout(()=>shine(bNew),620);setTimeout(()=>shine(bCont),780);setTimeout(()=>T.classList.remove('enter'),1300);
  clearInterval(shT);let k=0;shT=setInterval(()=>{if(T.hidden){clearInterval(shT);return}contState();if(++k%8==0)shine(hasSave()?bCont:bNew)},525)}
 new MutationObserver(()=>{if(!T.hidden)onShow();else clearInterval(shT)}).observe(T,{attributes:true,attributeFilter:['hidden']});
 if(!T.hidden)onShow();
 G.layout=layout;G.onShow=onShow;G.hasSave=hasSave;return G;
})();
