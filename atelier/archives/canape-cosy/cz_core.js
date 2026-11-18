// ===== CANAPÉ COSY : meuble personnalisable (4 vraies orientations, tissu, coussins, plaid, poses) =====
const COSY='Canapé cosy',CZL=5,CZD=2,CZRISE=26,CZSZ=13;
const CZF=[['Crème','#e7d3bf'],['Gris clair','#b9bdc5'],['Gris foncé','#5c606a'],['Bleu','#4b6ea8'],['Vert sauge','#8da57c'],['Marron','#9a5b38'],['Noir','#302d34'],['Blanc','#f4f1ec']],
 CZC=[['Moutarde','#e2a636'],['Crème','#efe2cc'],['Terracotta','#c7623e'],['Rose poudré','#dc9aa8'],['Bleu canard','#3c7d8c'],['Vert sauge','#86a276'],['Gris','#9da1a9'],['Noir','#302d34']],
 CZP=[['Gris','#9b9ea8'],['Crème','#ebdcc4'],['Moutarde','#d9a03a'],['Terracotta','#bf6043'],['Bleu','#56739e'],['Vert','#6f9467'],['Rose','#d593a3'],['Sans plaid','']];
const czIs=f=>!!f&&f.n==COSY;
const czSame=(a,b)=>!!a&&!!b&&(a===b||(!!a.id&&a.id===b.id));
// le personnage est-il installé sur (ou en train de se lever de) ce canapé ?
const czMine=f=>(C.st=='sofa'&&czSame(C.seat,f))||(!!C.rise&&C.st!='sofa'&&czSame(C.rise.f,f));
// repère local (a : le long du canapé, d : du dossier vers l'avant) -> cases de la pièce, pour chaque orientation
function czPt(f,a,d){const r=f.r||0,x=f.x,y=f.y;return r==0?[x+a,y+d]:r==1?[x+d,y+CZL-a]:r==2?[x+CZL-a,y+CZD-d]:[x+CZD-d,y+a]}
function czBox(f,a0,a1,d0,d1){const p=czPt(f,a0,d0),q=czPt(f,a1,d1);return[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.abs(q[0]-p[0]),Math.abs(q[1]-p[1])]}
function czNew(f){if(!czIs(f))return;f.id=f.id||('cz'+Date.now().toString(36)+Math.floor(Math.random()*1e4));const k=(N.czKeep||[]).pop();f.k=k?k.k|0:0;f.ck=k?k.ck|0:0;f.pk=k?k.pk|0:0;f.c=CZF[f.k][1]}
// boîte avec contour pixel art (le contour du dessus est recouvert par les pièces placées devant)
function czB3(u,v,w,d,z,h,c,o,ol){B3(u,v,w,d,z,h,c,o);if(!ol)return;const A=P3(u,v,z+h),B=P3(u+w,v,z+h),Cc=P3(u+w,v,z),D=P3(u+w,v+d,z),E=P3(u,v+d,z),F=P3(u,v+d,z+h);[[A,B],[B,Cc],[Cc,D],[D,E],[E,F],[F,A]].forEach(([p,q])=>ln(p,q,ol))}
// toutes les pièces du canapé, décrites dans son repère local puis replacées dans la pièce
function czParts(f){const fab=CZF[f.k|0][1],cus=CZC[f.ck|0][1],pl=CZP[f.pk|0][1],OL=mx(fab,'#1a1014',.72),L=CZL,D=CZD,parts=[],WD='#a8622e';
 const fo=(c,k)=>({t:mx(c,'#fff',.13+(k||0)),l:c,r:mx(c,'#000',.2),e:mx(c,'#fff',.3)});
 const box=(a0,a1,d0,d1,z,h,c,o,g,ol)=>{const[u,v,w,d]=czBox(f,a0,a1,d0,d1);parts.push({u,v,w,d,z,h,g:g||'b',dr:()=>czB3(u,v,w,d,z,h,c,o,ol===0?null:OL)})};
 const P=(a,d,z)=>P3(...czPt(f,a,d),z);
 // pieds en bois
 [[.12,.12],[L-.32,.12],[.12,D-.32],[L-.32,D-.32]].forEach(([a,d])=>box(a,a+.2,d,d+.2,0,3,WD,{t:'#c27a3e',l:WD,r:'#874c22',flat:1},'b',0));
 // socle sous les coussins d'assise
 box(.55,L-.55,.45,D,3,5,mx(fab,'#000',.1),fo(mx(fab,'#000',.1)),'b');
 // dossier + 3 coussins de dossier
 box(.55,L-.55,0,.45,3,24,fab,fo(fab),'k');
 const bw=(L-1.2)/3;for(let i=0;i<3;i++){const a0=.6+i*bw+.05;box(a0,a0+bw-.1,.45,.85,11,14,fab,fo(fab,.04),'k')}
 // accoudoirs
 box(0,.55,0,D,3,17,fab,fo(fab),'b');box(L-.55,L,0,D,3,17,fab,fo(fab),'b');
 // 3 coussins d'assise
 for(let i=0;i<3;i++){const a0=.6+i*bw+.05;box(a0,a0+bw-.1,.85,D-.02,8,5,fab,fo(fab,.06),'b')}
 // coussins décoratifs : carrés moelleux, légèrement penchés contre le dossier
 const pillow=(a0,a1)=>{const z0=13,z1=22,dF=1.14,dd=z=>dF-.22*(z-z0)/(z1-z0),am=(a0+a1)/2,zm=(z0+z1)/2;
  const pts=(o)=>[[a0-.05,z1+.6],[am,z1-.9],[a1+.05,z1+.6],[a1-.07,zm],[a1+.05,z0],[am,z0+.9],[a0-.05,z0],[a0+.07,zm]].map(([a,z])=>P(a,dd(z)-o,z));
  const[u,v,w,d]=czBox(f,a0-.05,a1+.05,dF-.42,dF);
  parts.push({u,v,w,d,z:z0,h:z1-z0+1,g:'b',dr:()=>{poly(pts(.2),mx(cus,'#000',.3));const fr=pts(0);poly(fr,cus);
   poly([fr[3],fr[4],fr[5],P(am,dd(zm-1),zm-1)],mx(cus,'#000',.14));poly([fr[0],fr[1],P(am,dd(zm+1),zm+1),fr[7]],mx(cus,'#fff',.16));
   const c=P(am,dd(zm),zm);G.fillStyle=mx(cus,'#000',.32);G.fillRect(Math.round(c[0]),Math.round(c[1]),1,1);
   fr.forEach((p,i)=>ln(p,fr[(i+1)%fr.length],OL))}})};
 pillow(.72,1.44);pillow(L-1.44,L-.72);
 // plaid posé sur l'accoudoir gauche : il tombe devant, avec ses franges
 if(pl){const a0=.05,a1=.5,zt=20.6,lt=mx(pl,'#fff',.3),dk=mx(pl,'#000',.2);
  {const[u,v,w,d]=czBox(f,a0,a1,.55,D+.02);parts.push({u,v,w,d,z:20,h:1,g:'b',dr:()=>{const q=[P(a0,.55,zt),P(a1,.55,zt),P(a1,D+.02,zt),P(a0,D+.02,zt)];poly(q,mx(pl,'#fff',.1));
   ln(P((a0+a1)/2,.6,zt),P((a0+a1)/2,D,zt),lt);q.forEach((p,i)=>ln(p,q[(i+1)%4],OL))}})}
  {const[u,v,w,d]=czBox(f,a0,a1,D,D+.06);parts.push({u,v,w,d,z:3,h:18,g:'b',dr:()=>{const dF=D+.03,q=[P(a0,dF,zt),P(a1,dF,zt),P(a1,dF,6),P(a0,dF,6)];poly(q,pl);
   poly([P(a0,dF,9),P(a1,dF,9),P(a1,dF,6),P(a0,dF,6)],dk);[.17,.38].forEach(t=>ln(P(a0+(a1-a0)*t,dF,zt-1),P(a0+(a1-a0)*t,dF,7),lt));
   for(let i=0;i<6;i++){const a=a0+.04+i*(a1-a0-.08)/5;ln(P(a,dF,5),P(a,dF,3),mx(pl,'#fff',.45))}
   q.forEach((p,i)=>ln(p,q[(i+1)%4],OL))}})}}
 return{parts,OL}}
// ordre de dessin : une pièce passe avant une autre si elle est entièrement derrière (u, v) ou dessous (z)
function czSort(ps){const e=.001,bh=(A,B)=>A.u+A.w<=B.u+e||A.v+A.d<=B.v+e||A.z+A.h<=B.z+e,out=[],st=new Map();
 const vis=a=>{if(st.get(a)==2)return;if(st.get(a)==1)return;st.set(a,1);ps.forEach(b=>{if(b!==a&&bh(b,a)&&!bh(a,b))vis(b)});st.set(a,2);out.push(a)};
 ps.slice().sort((a,b)=>(a.u+a.v+a.z*.01)-(b.u+b.v+b.z*.01)).forEach(vis);return out}
// calque mis en mémoire : grain du tissu + contour extérieur, recalculé seulement si le canapé change
const CZCACHE=new Map();
function czLayer(f,grp){const k=grp+'|'+OX+','+OY+','+TW+','+RN+'|'+[f.x,f.y,f.r|0,f.k|0,f.ck|0,f.pk|0].join(',');let e=CZCACHE.get(k);
 if(!e){const{parts,OL}=czParts(f),sel=parts.filter(p=>grp=='all'||p.g==grp),pts=[P3(f.x,f.y,0),P3(f.x+f.w,f.y,0),P3(f.x,f.y+f.h,0),P3(f.x+f.w,f.y+f.h,0)];
  const x0=Math.floor(Math.min(...pts.map(p=>p[0])))-TW,x1=Math.ceil(Math.max(...pts.map(p=>p[0])))+TW,y0=Math.floor(Math.min(...pts.map(p=>p[1])))-40,y1=Math.ceil(Math.max(...pts.map(p=>p[1])))+TH+4;
  const c=document.createElement('canvas');c.width=Math.max(1,x1-x0);c.height=Math.max(1,y1-y0);const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;cx.translate(-x0,-y0);
  const g0=G;G=cx;try{czSort(sel).forEach(p=>p.dr())}finally{G=g0}
  const W=c.width,H=c.height,id=cx.getImageData(0,0,W,H),d=id.data,o=hex3(OL),a=new Uint8Array(W*H);for(let i=0;i<W*H;i++)a[i]=d[i*4+3]>0?1:0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,j=i*4;
   if(a[i]){if(d[j]+d[j+1]+d[j+2]>150){const t=Math.sin((x+x0)*12.9898+(y+y0)*78.233)*43758.5453,n=1+((t-Math.floor(t))-.5)*.07;d[j]=Math.min(255,d[j]*n);d[j+1]=Math.min(255,d[j+1]*n);d[j+2]=Math.min(255,d[j+2]*n)}}
   else if((x>0&&a[i-1])||(x<W-1&&a[i+1])||(y>0&&a[i-W])||(y<H-1&&a[i+W])){d[j]=o[0];d[j+1]=o[1];d[j+2]=o[2];d[j+3]=255}}
  cx.putImageData(id,0,0);e={c,x0,y0};CZCACHE.set(k,e);if(CZCACHE.size>40)CZCACHE.delete(CZCACHE.keys().next().value)}
 G.drawImage(e.c,e.x0,e.y0)}
function isoCosy(f,ic){if(!ic)fshadow(f);const r=f.r||0,me=!ic&&czMine(f);
 if(r<2){czLayer(f,'all');if(me)czChar(f)}else{czLayer(f,'b');if(me)czChar(f);czLayer(f,'k')}}
// --- le personnage sur le canapé ---
const czLook=()=>{const p=C.t%400;return p<110?0:p<190?1:p<250?0:p<330?2:0};
function czFrame(){const f=C.seat,r=f.r||0,sp=C.sp||'sit';
 if(sp=='nap')return(r%2?'si0_':'si1_')+[0,1,2,1][Math.floor(C.t/25)%4];
 if(sp=='relax')return'dn7';
 if(sp=='look'&&czLook())return'dn0';
 return r>=2?'dk0':'wc0'}
function czRiseFrame(){const k=1-C.rise.t/CZRISE,r=C.rise.f.r||0;return k<.5?(r>=2?'dk0':'wc0'):'idle'}
const czFrontFl=r=>r==1||r==2;
function czSeat(u,v,fl){const p=P3(u,v,0),X=Math.round(p[0]),Y=Math.round(p[1])+1;charDraw(sc2,X,Y,fl,CW,CH);mouthL.x=X;mouthL.y=Y-MYB+14;HEAD=[X,Y-84+14]}
function czChar(f){const r=f.r||0,mid=CZL/2;
 if(C.st!='sofa'&&C.rise){const k=1-C.rise.t/CZRISE,S=czPt(f,mid,1.5),E=czPt(f,mid,CZD+.25),T=[C.x/12,(C.y-88)/5];
  if(k<.5){const t=k/.5*.55;czSeat(S[0]+(E[0]-S[0])*t,S[1]+(E[1]-S[1])*t,czFrontFl(r))}
  else{const t=(k-.5)/.5,u=E[0]+(T[0]-E[0])*t,v=E[1]+(T[1]-E[1])*t,p=P3(u,v,0);gshadow(p[0],p[1],24);charDraw(sc2,p[0],p[1],false,CW,CH);mouthL.x=p[0]+4.5;mouthL.y=p[1]-MYB;HEAD=[p[0],p[1]-84]}
  return}
 const sp=C.sp||'sit';
 if(sp=='nap'){const hs=r==0||r==3,aH=hs?.98:CZL-.98,h=czPt(f,aH,1.32);sleepHead(h[0],h[1],CZSZ+1);HEAD=[mouthL.x,mouthL.y-26];
  const pl=CZP[f.pk|0][1]||CZC[f.ck|0][1],OL=mx(CZF[f.k|0][1],'#1a1014',.72),[a0,a1]=hs?[aH+.42,CZL-.62]:[.62,aH-.42];
  const[u,v,w,d]=czBox(f,a0,a1,.98,CZD-.1);czB3(u,v,w,d,CZSZ,5,pl,{t:mx(pl,'#fff',.14),r:mx(pl,'#000',.2),e:mx(pl,'#fff',.32)},OL);
  const ba=hs?[a0,a0+.32]:[a1-.32,a1],[bu,bv,bw2,bd]=czBox(f,ba[0],ba[1],.98,CZD-.1);B3(bu,bv,bw2,bd,CZSZ,5.4,mx(pl,'#fff',.35),{t:mx(pl,'#fff',.45)});
  const zt=(tick%150)/150;pxText(ZZ,mouthL.x+10+zt*4,mouthL.y-16-zt*12,'#F0D9BC',Math.min(1,(1-zt)*2));return}
 if(sp=='relax'){const p=czPt(f,1.22,1.36);sofaSit(p[0],p[1],CZSZ,r>=2);return}
 if(sp=='look'){const l=czLook();if(l&&/^dn\d/.test(spName)){const p=czPt(f,mid,1.36);sofaSit(p[0],p[1],CZSZ,l==1);return}}
 const p=czPt(f,mid,1.5);czSeat(p[0],p[1],czFrontFl(r))}
function czFront(f){let t=czPt(f,CZL/2,CZD+.95);if(!walkable(t[0],t[1])){const c=[czPt(f,CZL/2,CZD+1.4),czPt(f,-.9,CZD/2),czPt(f,CZL+.9,CZD/2)].find(q=>walkable(q[0],q[1]));if(c)t=c;else{const p=out(t[0]*12,88+t[1]*5);t=[p[0]/12,(p[1]-88)/5]}}return t}
const CZSAY={sit:()=>NAME()+' s’installe confortablement sur le canapé.',look:()=>NAME()+' jette un œil tout autour, bien calé dans le canapé.',relax:()=>NAME()+' se cale contre l’accoudoir et se détend.',nap:f=>NAME()+(CZP[f.pk|0][1]?' s’allonge sous le plaid pour une petite sieste.':' s’allonge sur le canapé pour une petite sieste.')};
function czPose(p){if(p=='up'){czUp();return}if(!(C.st=='sofa'&&czIs(C.seat)))return;if(C.sp==p&&p!='sit'){say('C’est déjà ce que fait '+NAME()+'.');return}C.sp=p;C.t=0;say(CZSAY[p](C.seat));czView();if(p=='nap')talkMaybe('lit',.3);else talkMaybe(tvF()?'tele':'canape',.25)}
function czUp(){if(C.st=='sofa'&&czIs(C.seat)){C.st='idle';C.idle=140;say(NAME()+' se lève du canapé.')}czView()}
function goCosy(f,pose){if(!f)return;pose=pose||'sit';if(C.st=='sleep'){say('Chut… '+NAME()+' dort.');return}
 if(C.st=='sofa'&&czSame(C.seat,f)){czPose(pose);return}
 if(C.st=='sofa')C.st='idle';if(C.st=='dine')show('home');if(PLAYS.includes(C.st))stopPlay(true);if(seated())leaveDesk();
 const t=czFront(f);say(NAME()+' va s’installer sur le canapé.');
 goto(t[0]*12,88+t[1]*5,()=>{C.st='sofa';C.seat=f;C.sp=pose;C.t=0;C.rise=null;C._czs=f;say(CZSAY[pose](f));czView();talkMaybe(pose=='nap'?'lit':tvF()?'tele':'canape',.4)})}
function czTick(){const sp=C.sp||'sit',tv=!!tvF();
 if(sp=='nap'){add('energy',100/1500);add('happy',.001);if(N.energy>=100){C.sp='sit';C.t=0;say(NAME()+' se réveille de sa sieste, en pleine forme.');talkMaybe('reveil',.5);czView()}}
 else if(sp=='relax'){add('energy',.007);add('happy',tv?.005:.004)}
 else if(sp=='look'){add('energy',.003);add('happy',.002)}
 else{add('energy',.005);add('happy',tv?.004:.0015)}
 if(sp!='nap'&&C.t%900==450)talkMaybe(tv?'tele':'canape',.3);if(tick%20==0)bars()}
// le personnage se relève : on le voit quitter l'assise avant de repartir
function czWatch(){if(C.st!='sofa'&&C._czs&&!C.rise)C.rise={f:C._czs,t:CZRISE};C._czs=C.st=='sofa'&&czIs(C.seat)?C.seat:null;if(C.rise&&--C.rise.t<=0)C.rise=null}
function czHit(f,mx2,my){return[0,6,12,18,24].some(k=>{const[a,b]=isoInv(mx2,my+k);return a>=f.x&&a<=f.x+f.w&&b>=f.y&&b<=f.y+f.h})}
function czTap(f){if(C.st=='sofa'&&czSame(C.seat,f)){if(C.sp=='nap'){C.sp='sit';C.t=0;say(NAME()+' ouvre un œil… fin de la sieste.')}else pet();show('sofa');return}goCosy(f,'sit');show('sofa')}
function czView(){const v=document.getElementById('v-sofa');if(!v)return;const on=C.st=='sofa'&&czIs(C.seat),sp=on?(C.sp||'sit'):'';v.querySelectorAll('[data-cz]').forEach(b=>{const k=b.dataset.cz;b.classList.toggle('on',on&&k==sp);if(k=='up')b.disabled=!on})}
// point à atteindre devant chaque canapé (vérifié quand on place un meuble)
const czSpots=L=>L.filter(czIs).map(f=>czPt(f,CZL/2,CZD+.95));
