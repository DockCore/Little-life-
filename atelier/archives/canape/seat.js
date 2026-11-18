// --- le personnage sur le canapé / le fauteuil : s'asseoir et faire la sieste (images de la planche, 4 étapes chacune) ---
// étapes : 'in' (s'assoit), 'sit' (assis), 'toNap' (s'allonge), 'nap' (dort), 'wake' (se réveille) ; C.cat compte le temps de l'étape
const CZRISE=36,CZSEQ={in:[['cs0',9],['cs1',11],['cs2',10]],toNap:[['cn0',12],['cn1',16],['cn2',16]],wake:[['cn2',12],['cn1',12],['cn0',12]]};
const czFrontV=f=>(f.r||0)<2;      // canapé vu de face : images de la planche ; vu de dos : dossier devant le personnage
function czSeqFrame(q,t){let s=0;for(const[n,d]of q){s+=d;if(t<s)return n}return null}
const czSeqLen=q=>q.reduce((s,e)=>s+e[1],0);
function czFrame(){const f=C.seat,r=f.r||0,ca=C.ca||'sit',t=C.cat||0;
 if(!czFrontV(f)){if(ca=='nap'||ca=='toNap')return(r%2?'si0_':'si1_')+[0,1,2,1][Math.floor(tick/25)%4];return'dk0'}
 if(CZSEQ[ca]){const n=czSeqFrame(CZSEQ[ca],t);if(n)return n}
 if(ca=='nap'||ca=='toNap')return'cn3';
 if(ca=='wake')return'cn0';
 return(t%420)>380?'cs2':'cs3'}
function czRiseFrame(){const k=1-C.rise.t/CZRISE,f=C.rise.f;if(!czFrontV(f))return k<.5?'dk0':'idle';return['cs3','cs2','cs1','cs0'][Math.min(3,Math.floor(k*4))]}
// point d'appui des images : 'cs' = milieu de l'avant de l'assise, 'cn' = pied avant du côté de la tête ; la planche montre l'orientation 1, l'orientation 0 est son miroir
function czAnchor(f,nap){const r=f.r||0,L=sL(f),D=sD(f),fl=r==0;const a=nap?(fl?L-.22:.22):L/2,p=P3(...czPt(f,a,D-.15),0);return{X:Math.round(p[0]),Y:Math.round(p[1]),fl}}
function czBlit(name,f,bob){const nap=/cn\d/.test(name),A=czAnchor(f,nap),ax=nap?22:40,ay=120,dy=(bob||0);
 G.save();if(A.fl){G.translate(A.X,0);G.scale(-1,1);G.drawImage(sc2,-ax,A.Y-ay+dy)}else G.drawImage(sc2,A.X-ax,A.Y-ay+dy);G.restore();
 const R=CSREF[(N.look.g=='f'&&CSREF['F_'+name]?'F_':'')+name]||{hx:40,hy:52,fy:64},hx=A.fl?A.X+(ax-R.hx):A.X+(R.hx-ax),top=A.Y-ay+R.hy+dy;
 HEAD=[hx,top];mouthL.x=hx;mouthL.y=A.Y-ay+R.fy+dy+6;return{hx,top}}
function czSeat(u,v,fl){const p=P3(u,v,0),X=Math.round(p[0]),Y=Math.round(p[1])+1-(CZSZ-15);charDraw(sc2,X,Y,fl,CW,CH);mouthL.x=X;mouthL.y=Y-MYB+14;HEAD=[X,Y-84+14]}
function czChar(f){const r=f.r||0,mid=sL(f)/2,front=czFrontV(f);
 if(C.st!='sofa'&&C.rise){const k=1-C.rise.t/CZRISE;
  if(front&&/^cs\d/.test(spName)){czBlit(spName,f);return}
  const S=czPt(f,mid,1.5),E=czPt(f,mid,sD(f)+.25),T=[C.x/12,(C.y-88)/5];
  if(k<.5){const t=k/.5*.55;czSeat(S[0]+(E[0]-S[0])*t,S[1]+(E[1]-S[1])*t,r==1||r==2)}
  else{const t=(k-.5)/.5,u=E[0]+(T[0]-E[0])*t,v=E[1]+(T[1]-E[1])*t,p=P3(u,v,0);gshadow(p[0],p[1],24);charDraw(sc2,p[0],p[1],false,CW,CH);mouthL.x=p[0]+4.5;mouthL.y=p[1]-MYB;HEAD=[p[0],p[1]-84]}
  return}
 const ca=C.ca||'sit',sleeping=ca=='nap';
 if(front&&/^c[sn]\d/.test(spName)){const bob=sleeping&&Math.floor(tick/38)%2?1:0,h=czBlit(spName,f,bob);
  if(sleeping){const zt=(tick%170)/170;pxText(ZZ,h.hx+(r==0?-14:10)+zt*4,h.top-6-zt*12,'#F0D9BC',.75*Math.min(1,(1-zt)*2))}return}
 if(!front&&(ca=='nap'||ca=='toNap')){// vu de dos : tête sur l'accoudoir, plaid sur le corps (le dossier cache le reste)
  const hs=r==3,aH=hs?1.4:sL(f)-1.4,h=czPt(f,aH,1.34),br=Math.floor(tick/38)%2;sleepHead(h[0],h[1],CZSZ-1+br*.5);HEAD=[mouthL.x,mouthL.y-26];
  const pl=(CZP[f.pk|0]||[])[1]||(CZC[f.ck|0]||['','#9da1a9'])[1],OL=mx(pl,'#1a1014',.72),[a0,a1]=hs?[aH+.42,sL(f)-.62]:[.62,aH-.42];
  const[u,v,w,d]=czBox(f,a0,a1,.98,sD(f)-.1);czB3(u,v,w,d,CZSZ,5+br*.4,pl,{t:mx(pl,'#fff',.14),r:mx(pl,'#000',.2),e:mx(pl,'#fff',.32)},OL);
  const zt=(tick%170)/170;pxText(ZZ,mouthL.x+10+zt*4,mouthL.y-16-zt*12,'#F0D9BC',.75*Math.min(1,(1-zt)*2));return}
 const p=czPt(f,mid,r>=2?1.3:1.5);czSeat(p[0],p[1],r==1||r==2)}
function czFront(f){let t=czPt(f,sL(f)/2,sD(f)+.95);if(!walkable(t[0],t[1])){const c=[czPt(f,sL(f)/2,sD(f)+1.4),czPt(f,-.9,sD(f)/2),czPt(f,sL(f)+.9,sD(f)/2)].find(q=>walkable(q[0],q[1]));if(c)t=c;else{const p=out(t[0]*12,88+t[1]*5);t=[p[0]/12,(p[1]-88)/5]}}return t}
const czSon=f=>sWord(f).replace(/^le /,'son ');
// S'asseoir (ou se lever s'il est déjà assis)
function czSit(){if(C.st=='sofa'&&czIs(C.seat)){czUp();return}if(C.st=='sleep'){say('Chut… '+NAME()+' dort.');return}
 const f=czNearest(false);if(!f){say('Il te faut un canapé ou un fauteuil : la Boutique déco en vend.');return}goCosy(f,'sit')}
// Sieste : sur un canapé assez long, sinon dans le lit ; un second appui le réveille
function czNap(){if(C.st=='sleep'){toggleSleep();czView();return}
 if(C.st=='sofa'&&czIs(C.seat)){if(C.ca=='nap'||C.ca=='toNap'){czWake(false);return}if(sLong(C.seat)){czStartNap();return}}
 const f=czNearest(true);if(f){goCosy(f,'nap');return}
 if(N.furn.some(o=>o.n=='Lit')){if(C.st=='sofa')C.st='idle';toggleSleep();show('home');return}
 say('Pour une sieste, il faut un canapé ou un lit : la Boutique déco en vend.')}
function czNearest(long){const cu=C.x/12,cv=(C.y-88)/5;let b=null,bd=1e9;N.furn.forEach(f=>{if(!czIs(f)||(long&&!sLong(f)))return;const p=czFront(f),d=Math.hypot(p[0]-cu,p[1]-cv);if(d<bd){bd=d;b=f}});return b}
function czStartNap(){C.ca='toNap';C.cat=0;C.sp='nap';say(NAME()+(CZP[C.seat.pk|0]&&CZP[C.seat.pk|0][1]?' s’allonge sous le plaid pour une petite sieste.':' s’allonge pour une petite sieste.'));talkMaybe('lit',.3);czView()}
function czWake(up){if(!(C.ca=='nap'||C.ca=='toNap'))return;C.ca='wake';C.cat=0;C.sp='sit';C.wantUp=!!up;say(NAME()+' s’étire et se réveille.');talkMaybe('reveil',.35);czView()}
function czUp(){if(!(C.st=='sofa'&&czIs(C.seat))){czView();return}
 if(C.ca=='nap'||C.ca=='toNap'){czWake(true);return}if(C.ca=='wake'){C.wantUp=true;return}
 C.st='idle';C.idle=140;say(NAME()+' se lève de '+czSon(C.seat)+'.');czView()}
function czPose(p){if(p=='up'){czUp();return}if(p=='nap'){czNap();return}if(p=='sit'){czSit();return}}
function goCosy(f,pose){if(!f)return;pose=pose=='nap'&&sLong(f)?'nap':'sit';if(C.st=='sleep'){say('Chut… '+NAME()+' dort.');return}
 if(C.st=='sofa'&&czSame(C.seat,f)){if(pose=='nap')czStartNap();return}
 if(C.st=='sofa')C.st='idle';if(C.st=='dine')show('home');if(PLAYS.includes(C.st))stopPlay(true);if(seated())leaveDesk();
 const t=czFront(f);say(NAME()+' va s’installer dans '+czSon(f)+'.');
 goto(t[0]*12,88+t[1]*5,()=>{C.st='sofa';C.seat=f;C.sp='sit';C.ca='in';C.cat=0;C.t=0;C.rise=null;C._czs=f;C.napNext=pose=='nap';C.wantUp=false;
  say(NAME()+' s’installe confortablement dans '+czSon(f)+'.');czView();talkMaybe(pose=='nap'?'lit':tvF()?'tele':'canape',.4)})}
function czTick(){const tv=!!tvF(),ca=C.ca||'sit';C.cat=(C.cat||0)+1;
 if(CZSEQ[ca]&&C.cat>=czSeqLen(CZSEQ[ca])){C.cat=0;if(ca=='in'){C.ca='sit';if(C.napNext){C.napNext=false;czStartNap()}}else if(ca=='toNap')C.ca='nap';else if(ca=='wake'){C.ca='sit';if(C.wantUp){C.wantUp=false;czUp();return}}}
 if(C.ca=='nap'){add('energy',100/1500);add('happy',.001);if(N.energy>=100){say(NAME()+' a bien dormi et se réveille en pleine forme.');czWake(false)}}
 else{add('energy',.005);add('happy',tv?.004:.0015);if(C.t%900==450)talkMaybe(tv?'tele':'canape',.3)}
 if(tick%20==0)bars()}
// le personnage se relève : on le voit quitter l'assise avant de repartir
function czWatch(){if(C.st!='sofa'&&C._czs&&!C.rise)C.rise={f:C._czs,t:CZRISE};C._czs=C.st=='sofa'&&czIs(C.seat)?C.seat:null;if(C.rise&&--C.rise.t<=0)C.rise=null}
function czHit(f,mx2,my){return[0,6,12,18,24].some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x&&a<=f.x+f.w&&b>=f.y&&b<=f.y+f.h})}
function czTap(f){if(C.st=='sofa'&&czSame(C.seat,f)){if(C.ca=='nap'||C.ca=='toNap')czWake(false);else pet();show('sofa');return}goCosy(f,'sit');show('sofa')}
// le menu : trois boutons seulement (S'asseoir / Se lever, Sieste / Se réveiller, Personnaliser)
function czView(){const v=document.getElementById('v-sofa');if(!v)return;const on=C.st=='sofa'&&czIs(C.seat),napping=(on&&(C.ca=='nap'||C.ca=='toNap'))||C.st=='sleep';
 const b1=v.querySelector('[data-cz="sit"]'),b2=v.querySelector('[data-cz="nap"]');
 if(b1){b1.querySelector('span').textContent=on&&!napping?'Se lever':'S’asseoir';b1.classList.toggle('on',on&&!napping)}
 if(b2){b2.querySelector('span').textContent=napping?'Se réveiller':'Sieste';b2.classList.toggle('on',napping)}
 VT.sofa=on&&!sLong(C.seat)?'Fauteuil':'Canapé';if(curV=='sofa')ttl.textContent=VT.sofa}
