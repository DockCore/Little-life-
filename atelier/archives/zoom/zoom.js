// ===== ZOOM DE LA SCÈNE =====
// Seul le canvas du monde est agrandi (transformation CSS, origine en haut à gauche) ; le cadre le découpe.
// La mise en page, les menus et les boutons ne bougent jamais. Les touchers restent justes : le jeu lit la position réelle du canvas.
const ZM={z:1,tz:1,x:0,y:0,tx:0,ty:0,pts:new Map(),pin:null,hold:null,place:null,lastTap:0,shown:null},ZMIN=1,ZMAX=3;
const zmOK=()=>!creating&&!dressing&&!tripOn&&!zoomV&&RC.width>0;
const zmBox=()=>({w:RC.offsetWidth,h:RC.offsetHeight});
// à l'arrêt : un pixel du jeu = un nombre entier de pixels de l'écran (pixel art net, sans déformation)
function zmSnap(z){z=Math.max(ZMIN,Math.min(ZMAX,z));const k=KK||1,s=Math.round(z*k)/k;return Math.max(ZMIN,Math.min(ZMAX,s<ZMIN?ZMIN:s))}
// la vue ne sort jamais de la scène
function zmClamp(z,x,y){const b=zmBox();return[Math.min(0,Math.max(b.w-b.w*z,x)),Math.min(0,Math.max(b.h-b.h*z,y))]}
function zmTo(z,cx,cy){z=Math.max(ZMIN,Math.min(ZMAX,z));const b=zmBox();if(cx==null){cx=b.w/2;cy=b.h/2}
 const wx=(cx-ZM.tx)/ZM.tz,wy=(cy-ZM.ty)/ZM.tz,c=zmClamp(z,cx-wx*z,cy-wy*z);ZM.tz=z;ZM.tx=c[0];ZM.ty=c[1];zmUI()}
const zmNext=d=>{const k=KK||1,cur=Math.round(ZM.tz*k);let m=d>0?Math.max(cur+1,Math.round(ZM.tz*1.4*k)):Math.min(cur-1,Math.round(ZM.tz/1.4*k));return zmSnap(m/k)};
let zmLast='';function zmApply(){const s=Math.abs(ZM.z-1)<1e-4&&Math.abs(ZM.x)<.01&&Math.abs(ZM.y)<.01?'':'translate('+ZM.x.toFixed(2)+'px,'+ZM.y.toFixed(2)+'px) scale('+ZM.z.toFixed(4)+')';if(s!==zmLast){zmLast=s;RC.style.transformOrigin='0 0';RC.style.transform=s}}
function zmStep(){if(!zmOK()){if(ZM.tz!=1||ZM.z!=1){ZM.z=ZM.tz=1;ZM.x=ZM.y=ZM.tx=ZM.ty=0;ZM.pin=null;ZM.hold=null;ZM.pts.clear();zmApply()}zmUI();return}
 if(ZM.place!==place){ZM.place=place;ZM.tz=ZM.z=1;ZM.tx=ZM.ty=ZM.x=ZM.y=0}// nouveau lieu : vue d'ensemble
 if(!ZM.pin){const c=zmClamp(ZM.tz,ZM.tx,ZM.ty);ZM.tx=c[0];ZM.ty=c[1]}
 const k=ZM.pin||(ZM.hold&&ZM.hold.pan)?1:.2;ZM.z+=(ZM.tz-ZM.z)*k;ZM.x+=(ZM.tx-ZM.x)*k;ZM.y+=(ZM.ty-ZM.y)*k;// transition douce
 if(Math.abs(ZM.z-ZM.tz)<.002&&Math.abs(ZM.x-ZM.tx)<.25&&Math.abs(ZM.y-ZM.ty)<.25){ZM.z=ZM.tz;ZM.x=ZM.tx;ZM.y=ZM.ty}
 zmApply();zmUI()}
function zmUI(){const u=document.getElementById('zmUI');if(!u)return;const ok=zmOK(),st=ok+'|'+ZM.tz.toFixed(3);if(st===ZM.shown)return;ZM.shown=st;u.hidden=!ok;
 document.getElementById('zmIn').disabled=ZM.tz>=ZMAX-1e-3;document.getElementById('zmOut').disabled=ZM.tz<=ZMIN+1e-3;document.getElementById('zmRst').disabled=ZM.tz<=ZMIN+1e-3;
 document.getElementById('zmBtn').classList.toggle('on',ZM.tz>1.001);document.getElementById('zmPct').textContent=ZM.tz>1.001?'×'+(Math.round(ZM.tz*10)/10).toString().replace('.',','):''}
// gestes : on écoute le cadre en phase de capture, avant le jeu
function zmLocal(e){const tb=topbox.getBoundingClientRect();return[e.clientX-tb.left-topbox.clientLeft-RC.offsetLeft,e.clientY-tb.top-topbox.clientTop-RC.offsetTop]}
function zmSend(){const h=ZM.hold;if(!h||h.sent)return;h.sent=true;const ev=new PointerEvent('pointerdown',Object.assign({bubbles:true,cancelable:true,isPrimary:true},h.e));ev.zmPass=true;RC.dispatchEvent(ev);ZM.lastTap=performance.now()}
topbox.addEventListener('pointerdown',e=>{if(e.target!==RC||e.zmPass||!zmOK())return;const p=zmLocal(e);
 ZM.pts.set(e.pointerId,{x:p[0],y:p[1],x0:p[0],y0:p[1]});
 if(ZM.pts.size==2){e.stopPropagation();e.preventDefault();// deux doigts : pincement
  if(ZM.hold){clearTimeout(ZM.hold.tm);if(ZM.hold.sent&&performance.now()-ZM.lastTap<500&&C.st=='walk'){C.path=null;C.st='idle'}ZM.hold=null}
  const[a,b]=[...ZM.pts.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;ZM.pin={d0:Math.hypot(a.x-b.x,a.y-b.y)||1,z0:ZM.tz,wx:(mx-ZM.tx)/ZM.tz,wy:(my-ZM.ty)/ZM.tz,mx,my};return}
 if(ZM.pts.size>2){e.stopPropagation();return}
 const zoomed=ZM.tz>1.001;
 if(e.pointerType=='touch'||zoomed){e.stopPropagation();// on attend : appui (action du jeu) ou glisser (déplacer la vue) ?
  ZM.hold={id:e.pointerId,e:{clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId,pointerType:e.pointerType,button:e.button},pan:false,sent:false,zoomed,tx0:ZM.tx,ty0:ZM.ty};
  if(!zoomed)ZM.hold.tm=setTimeout(zmSend,90)}},true);
addEventListener('pointermove',e=>{const pt=ZM.pts.get(e.pointerId);if(!pt)return;const p=zmLocal(e);pt.x=p[0];pt.y=p[1];
 if(ZM.pin&&ZM.pts.size>=2){const[a,b]=[...ZM.pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1,z=Math.max(ZMIN*.85,Math.min(ZMAX*1.12,ZM.pin.z0*d/ZM.pin.d0)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,zc=Math.max(ZMIN,Math.min(ZMAX,z));
  ZM.pin.mx=mx;ZM.pin.my=my;ZM.tz=z;const c=zmClamp(zc,mx-ZM.pin.wx*zc,my-ZM.pin.wy*zc);ZM.tx=c[0];ZM.ty=c[1];if(e.cancelable)e.preventDefault();return}
 const h=ZM.hold;if(h&&h.id==e.pointerId&&!h.sent){const dx=p[0]-pt.x0,dy=p[1]-pt.y0;if(h.pan||(h.zoomed&&Math.hypot(dx,dy)>8)){h.pan=true;const c=zmClamp(ZM.tz,h.tx0+dx,h.ty0+dy);ZM.tx=c[0];ZM.ty=c[1]}}},{passive:false,capture:true});
function zmEnd(e){const pt=ZM.pts.get(e.pointerId);if(!pt)return;ZM.pts.delete(e.pointerId);
 if(ZM.pin){if(ZM.pts.size<2){const P=ZM.pin;ZM.pin=null;ZM.hold=null;ZM.pts.clear();ZM.tz=Math.max(ZMIN,Math.min(ZMAX,ZM.tz));zmTo(zmSnap(ZM.tz),P.mx,P.my)}return}
 const h=ZM.hold;if(h&&h.id==e.pointerId){clearTimeout(h.tm);if(!h.sent&&!h.pan&&e.type=='pointerup')zmSend();ZM.hold=null}}
addEventListener('pointerup',zmEnd,true);addEventListener('pointercancel',zmEnd,true);
topbox.addEventListener('wheel',e=>{if(e.target!==RC||!zmOK())return;e.preventDefault();const p=zmLocal(e);zmTo(zmNext(e.deltaY<0?1:-1),p[0],p[1])},{passive:false});
RC.style.touchAction='none';
(function(){const u=document.getElementById('zmUI');if(!u)return;const P=document.getElementById('zmP');u.addEventListener('pointerdown',e=>e.stopPropagation());
 document.getElementById('zmBtn').onclick=()=>{P.hidden=!P.hidden;document.getElementById('zmBtn').setAttribute('aria-expanded',!P.hidden)};
 document.getElementById('zmIn').onclick=()=>zmTo(zmNext(1));document.getElementById('zmOut').onclick=()=>zmTo(zmNext(-1));document.getElementById('zmRst').onclick=()=>zmTo(1)})();
