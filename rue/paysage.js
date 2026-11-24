// ===== MODE PAYSAGE : orientation horizontale sur mobile, scène à gauche, actions à droite, joystick =====
// orientation choisie par le joueur : 'auto' (suit l'appareil), 'portrait' ou 'paysage' ; préférence propre à l'appareil
const LS={land:false,block:false,mode:(()=>{if(/[?&]orient=libre/.test(location.search))return'auto';try{const m=localStorage.getItem('ll_orient');return['auto','portrait','paysage'].includes(m)?m:'auto'}catch(e){return'auto'}})()};
(function(){
 const LSRES={top:10,bot:44,dressH:200};
 const HT=document.documentElement,mainEl2=document.querySelector('main'),low=document.querySelector('.frame.low'),hud=document.querySelector('.hud'),needs=document.getElementById('needs');
 const touch=()=>{try{return matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints||0)>0}catch(e){return false}};
 // l'écran « tourne ton téléphone » sert maintenant à demander l'horizontale
 const rp=document.querySelector('#rotx p'),rs=document.querySelector('#rotx small');
 // sortie de secours sur l'écran de rotation : repasser en automatique sans rien perdre
 const rb=document.createElement('button');rb.id='rotAuto';rb.type='button';rb.textContent='Suivre l’appareil (Auto)';try{document.getElementById('rotx').appendChild(rb)}catch(e){}
 rb.addEventListener('click',e=>{e.stopPropagation();setMode('auto')});
 function rotTxt(){const v=LS.mode=='portrait';if(rp)rp.textContent='Tourne ton téléphone';if(rs)rs.textContent=v?'Tu as choisi l’affichage vertical.':'Tu as choisi l’affichage horizontal.'}
 try{Object.defineProperty(rotQ,'matches',{get:()=>LS.block,configurable:true})}catch(e){}
 // besoins : déplacés en haut de la colonne de droite en paysage (même élément, mêmes mises à jour)
 const lhud=document.createElement('div');lhud.className='hud lhud';lhud.hidden=true;low.insertBefore(lhud,low.firstChild);
 // création : genre, prénom et pseudo passent dans la colonne de droite (mêmes éléments)
 const stH=document.getElementById('stHead'),stB=document.getElementById('stBottom'),stMv=stH?[...stH.querySelectorAll('#stGen,.st-name-in')]:[];const stBox=document.createElement('div');stBox.className='st-lform';
 function place(){if(stB){if(LS.land){if(stBox.parentNode!==stB)stB.insertBefore(stBox,stB.firstChild);stMv.forEach(e=>{if(e.parentNode!==stBox)stBox.appendChild(e)})}else{stMv.forEach(e=>{if(e.parentNode!==stH)stH.appendChild(e)});stBox.remove()}}if(LS.land){if(needs.parentNode!==lhud)lhud.appendChild(needs);lhud.hidden=false}else{if(needs.parentNode!==hud)hud.appendChild(needs);lhud.hidden=true}}
 let busy=false;
 // zone sûre du haut (barre d'état iOS/iPad dessinée par-dessus l'app) : la pièce démarre en dessous
 const probe=document.createElement('div');probe.style.cssText='position:fixed;left:0;top:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-top,0px)';document.body.appendChild(probe);
 // après une rotation, Safari peut laisser la page décalée : on la remet en haut
 const unscroll=()=>{if((scrollX||scrollY||document.documentElement.scrollTop||document.body.scrollTop)){scrollTo(0,0);document.documentElement.scrollTop=document.body.scrollTop=0}};
 function decide(){unscroll();const w=innerWidth,h=innerHeight,t=touch();LSRES.top=10+(probe.offsetHeight||0);
  // aucune orientation ne bloque l'autre : la mise en page suit toujours l'écran réel (le choix Portrait/Paysage verrouille via le système quand il le permet)
  const block=false,land=w>h&&(t||h<=560),ch=block!=LS.block||land!=LS.land;
  HT.style.setProperty('--appH',h+'px');HT.style.setProperty('--appW',w+'px');
  LS.block=block;LS.land=land;HT.classList.toggle('needrot',false);HT.classList.toggle('land',land);place();
  if(ch)resetEtat();
  try{if(typeof AC!='undefined'&&AC)(document.hidden||block)?AC.suspend():AC.resume()}catch(e){}
  if(ch&&!busy){busy=true;try{dispatchEvent(new Event('resize'))}finally{busy=false}}}
 // remise à zéro des états liés à l'ancienne disposition : doigt resté sur le joystick, boutons enfoncés, saisie ouverte, défilement
 function resetEtat(){try{if(LS.joy&&LS.joy.on){LS.joy.on=false;LS.joy.id=null;LS.joy.x=LS.joy.y=0;const j=document.querySelector('.ljoy');if(j){j.classList.remove('on');j.firstChild.style.transform=''}}}catch(e){}
  try{document.querySelectorAll('.press').forEach(e=>e.classList.remove('press'))}catch(e){}
  try{const a=document.activeElement;if(a&&a!==document.body&&/INPUT|TEXTAREA/.test(a.tagName))a.blur()}catch(e){}
  try{if(typeof STV!='undefined'&&STV.touch){STV.touch.l=0;STV.touch.r=0}}catch(e){}
  unscroll()}
 // dimensions réelles surveillées en continu : iOS envoie parfois « resize » AVANT d'avoir mis à jour la taille après une rotation ;
 // si la taille change sans événement, on relance nous-mêmes toute la mise en page (scène, panneaux, rue, arcade, cinéma, titre)
 const VS={w:innerWidth,h:innerHeight};
 function veille(){const w=innerWidth,h=innerHeight;if(w==VS.w&&h==VS.h)return;VS.w=w;VS.h=h;decide();if(!busy){busy=true;try{dispatchEvent(new Event('resize'))}finally{busy=false}}}
 addEventListener('resize',()=>{if(!busy){VS.w=innerWidth;VS.h=innerHeight;decide()}});
 const rafale=()=>{veille();[40,120,250,500,900,1500].forEach(t=>setTimeout(veille,t))};
 addEventListener('orientationchange',rafale);try{matchMedia('(orientation: portrait)').addEventListener('change',rafale)}catch(e){}
 setInterval(veille,400);LS.veille=veille;
 try{screen.orientation&&screen.orientation.addEventListener('change',rafale)}catch(e){}
 if(window.visualViewport){visualViewport.addEventListener('resize',()=>{if(!busy)decide()});visualViewport.addEventListener('scroll',unscroll)}
 addEventListener('scroll',unscroll,{passive:true});document.addEventListener('fullscreenchange',()=>setTimeout(()=>{decide();dispatchEvent(new Event('resize'))},80));
 // caméra : en paysage la pièce est calée sur la hauteur de la scène (pixels nets, sans déformation)
 const kk0=kkFit,iso0=isoSetup,pan0=panSet,top0=topHset;
 kkFit=function(r,d){if(!LS.land)return kk0(r,d);const T=26,tot=Math.round(T*4.4)+RN*T/2+10,kw=(r.width-8)*d/(RN*T*1.04+16),kh=(r.height-LSRES.top-LSRES.bot)*d/(tot+6);return Math.max(1,Math.min(kw,kh))};
 isoSetup=function(){iso0();if(!LS.land||!ROOMTOP())return;const tot=WHI+RN*TH+10,t=Math.round(LSRES.top*(devicePixelRatio||1)/KK),b=Math.round(LSRES.bot*(devicePixelRatio||1)/KK);OY=Math.round(Math.max(t,t+(LH-t-b-tot)/2)+WHI)};
 panSet=function(r,d){if(LS.land)return;return pan0(r,d)};
 topHset=function(){if(LS.land)return;return top0()};
 // habillage : la cabine tient en hauteur (personnage entier, sans recadrage)
 const fit0=fit;fit=function(){fit0();if(!LS.land||!(dressing||creating))return;const r=topbox.getBoundingClientRect(),d=devicePixelRatio||1;if(!r.width)return;if(creating){const hd=document.getElementById('stHead');KK=Math.max(1,Math.floor((r.height-(hd?hd.offsetHeight:60))*d/140))}else KK=Math.max(1,Math.min(r.width*d/200,r.height*d/LSRES.dressH));LW=Math.floor(r.width*d/KK);LH=Math.floor(r.height*d/KK);RC.width=LW;RC.height=LH;RC.style.width=LW*KK/d+'px';RC.style.height=LH*KK/d+'px';rx.imageSmoothingEnabled=false};
 // plein écran + verrouillage horizontal au premier contact (Android ; iOS ne l'autorise pas aux pages)
 // verrouillage système quand il existe (Android, plein écran) ; sinon (iOS) l'écran de rotation guide le joueur
 const lockNow=()=>{try{if(!screen.orientation)return;if(LS.mode=='auto'){screen.orientation.unlock&&screen.orientation.unlock();return}screen.orientation.lock(LS.mode=='portrait'?'portrait':'landscape').then(()=>{LS.locked=true},()=>{LS.locked=false;if(LS.asked){LS.asked=false;try{say('Ton appareil ne permet pas de verrouiller l’écran : tourne-le simplement, l’affichage s’adapte.')}catch(e){}}})}catch(e){}};
 const immersif=()=>{try{const st=matchMedia('(display-mode: standalone)').matches;if(!st&&document.fullscreenEnabled&&!document.fullscreenElement&&HT.requestFullscreen)return HT.requestFullscreen({navigationUI:'hide'}).then(lockNow).catch(lockNow);lockNow()}catch(e){}};
 let tried=false;addEventListener('pointerdown',()=>{if(tried||!touch()||/[?&]orient=libre/.test(location.search))return;tried=true;immersif()},true);
 function setMode(m){if(!['auto','portrait','paysage'].includes(m))return;LS.mode=m;LS.asked=m!='auto';try{localStorage.setItem('ll_orient',m)}catch(e){}if(touch())immersif();decide();dispatchEvent(new Event('resize'));gorDraw();
  try{say(m=='auto'?'Orientation automatique : l’écran suit ton appareil.':m=='portrait'?'Affichage vertical choisi : tourne ton téléphone à la verticale.':'Affichage horizontal choisi : tourne ton téléphone à l’horizontale.')}catch(e){}}
 LS.setMode=setMode;
 // réglage « Orientation de l'écran » dans le menu du jeu (sous Police)
 const gor=document.createElement('div');gor.className='gi gsh gor';gor.innerHTML='<span>Orientation de l’écran</span><div class="row"><button type="button" data-or="auto">Auto</button><button type="button" data-or="portrait">Portrait</button><button type="button" data-or="paysage">Paysage</button></div>';
 try{const ff=document.querySelector('.gi.gff');ff.parentNode.insertBefore(gor,ff.nextSibling)}catch(e){}
 function gorDraw(){gor.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.or==LS.mode))}
 gor.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();setMode(b.dataset.or)}));gorDraw();
 // ===== joystick : pouce gauche, Nori marche dans la direction poussée (toucher le sol marche toujours) =====
 const J=document.createElement('div');J.className='ljoy';J.innerHTML='<i></i>';J.setAttribute('aria-label','Joystick de déplacement');topbox.appendChild(J);const knob=J.firstChild;
 const JS={id:null,x:0,y:0,on:false,t:0};LS.joy=JS;
 const canWalk=()=>J.classList.contains('ok')&&ROOMTOP()&&!feedMode&&(C.st=='idle'||C.st=='walk'||C.st=='joy')&&!(typeof STV!='undefined'&&STV.on)&&!(typeof BW!='undefined'&&BW.on)&&!(typeof ARC!='undefined'&&ARC.on)&&!mainEl2.classList.contains('zoomv');
 const NOJOY=['deco','style','dress','table','sofa','work','feed','aqua','trip','create','street','bowling','arcade','pet','ani','v-soon'];
 function show(){J.classList.toggle('ok',LS.land&&ROOMTOP()&&!NOJOY.includes(mainEl2.dataset.v)&&!(typeof STV!='undefined'&&STV.on)&&!(typeof BW!='undefined'&&BW.on)&&!(typeof ARC!='undefined'&&ARC.on)&&!mainEl2.classList.contains('zoomv')&&!mainEl2.classList.contains('trip'))}
 setInterval(show,250);
 function setK(e){const r=J.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2;let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}JS.x=dx/R;JS.y=dy/R;knob.style.transform=`translate(${dx*.62}px,${dy*.62}px)`}
 J.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();JS.id=e.pointerId;JS.on=true;J.classList.add('on');try{J.setPointerCapture(e.pointerId)}catch(_){}setK(e);step(true)});
 J.addEventListener('pointermove',e=>{if(e.pointerId!==JS.id)return;e.preventDefault();setK(e)});
 const end=e=>{if(e.pointerId!==JS.id)return;JS.id=null;JS.on=false;JS.x=JS.y=0;J.classList.remove('on');knob.style.transform=''};
 J.addEventListener('pointerup',end);J.addEventListener('pointercancel',end);
 // conversion direction écran -> direction dans la pièce isométrique (inverse de IX/IY)
 function step(force){if(!JS.on)return;const m=Math.hypot(JS.x,JS.y);if(m<.25||!canWalk())return;const now=performance.now();if(!force&&now-JS.t<140)return;JS.t=now;
  const a=JS.x/m/(TW/2),b=JS.y/m/(TH/2);let du=(a+b)/2,dv=(b-a)/2;const l=Math.hypot(du,dv)||1,k=1.6/l;du*=k;dv*=k;
  if(C.st=='joy')C.st='idle';try{goto(C.x+du*12,C.y+dv*5)}catch(e){}}
 setInterval(()=>step(false),50);
 // scène de création : la colonne de droite ne réduit plus la hauteur de l'estrade
 const ds0=drawStage;drawStage=function(cab){if(cab||!LS.land||!stB)return ds0(cab);const g0=stB.getBoundingClientRect;stB.getBoundingClientRect=()=>({top:innerHeight,bottom:innerHeight,left:0,right:0,width:0,height:0});try{return ds0(cab)}finally{delete stB.getBoundingClientRect}};
 LS.decide=decide;LS.res=LSRES;LS.probe=probe;LS.step=step;
 decide();
})();
