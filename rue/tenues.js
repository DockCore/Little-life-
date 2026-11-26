// ===== GARDE-ROBE : 10 TENUES COMPLÈTES (homme et femme) =====
// Chaque tenue = plusieurs calques indépendants (haut, veste, bas, chaussures, accessoires) redessinés sur la carte
// des parties du corps de CHAQUE image (face, profil, dos, trois-quarts, marche, course, assis, canapé, bureau, sport…).
// Le corps, la tête, le visage, les cheveux et les mains ne sont jamais modifiés : seuls les vêtements sont posés dessus.
// Une couleur = une teinte principale (recolorable librement) + des teintes d'accent fixées par l'association choisie.
(function(){
// ---------- 1. moteur : nouveaux détails de vêtements ----------
const n=CW*CH,DK=[22,14,18];
// centre des jambes ligne par ligne (pour savoir quel bord est « extérieur »)
function legMid(G){if(G._lm)return G._lm;const s=new Float32Array(CH),c=new Uint16Array(CH);for(let p=0;p<n;p++){const q=G.P[p];if(q==10||q==11||q==12){const y=(p/CW)|0;s[y]+=p%CW;c[y]++}}
 const m=new Float32Array(CH).fill(-1);for(let y=0;y<CH;y++)if(c[y])m[y]=s[y]/c[y];return G._lm=m}
const front=G=>!G.back&&!G.side;
// distance au bord extérieur de la silhouette (0 = premier pixel), du côté opposé au centre
function edgeD(o,p,dir,max){const x=p%CW;for(let k=1;k<=max;k++){const xx=x+dir*k;if(xx<0||xx>=CW)return k-1;if(!o[(p+dir*k)*4+3])return k-1}return max}
const _wDetails=wDetails;
wDetails=function(S,G,m,set,col,o){for(let p=0;p<n;p++)if(m[p]&&!o[p*4+3])m[p]=0;_wDetails(S,G,m,set,col,o);const d=S.fx||[];if(!d.length)return;const{P,B}=G;
 const c2=hx2(S.c2||'#f2efe8'),c3=hx2(S.c3||S.c2||'#f2efe8'),dk=(t)=>mxc(col,[0,0,0],t),lt=(t)=>mxc(col,[255,255,255],t);
 const has=k=>d.includes(k),F=front(G),LM=(has('cargo2')||has('wide')||has('tstripe'))?legMid(G):null;
 const add=[];
 for(let p=0;p<n;p++){const q=P[p],x=p%CW,y=(p/CW)|0,td=G.tor[p],cx=G.cx[y];
  // --- capuche : col roulé autour du cou devant, capuche posée sur le haut du dos derrière ---
  if(has('hood')||has('furhood')){const fur=has('furhood');
   if(q==2&&(G.back||!(p>=CW&&P[p-CW]==1))){m[p]=1;set(p,fur?(wHash(x,y)>.55?mxc(c2,[255,255,255],.25):wHash(x+3,y)>.7?mxc(c2,[0,0,0],.18):c2):dk(.12),1)}
   if(q>=3&&q<=4&&td>=0){
    if(G.back){const tmax=fur?.42:.36,w0=fur?5.5:4.6,w=td<tmax-.14?w0:w0-(td-(tmax-.14))*30;if(cx>=0&&td<tmax&&Math.abs(x-cx)<=w){const edge=Math.abs(x-cx)>w-1;
      set(p,fur?(td<.2||edge?(wHash(x,y)>.5?mxc(c2,[255,255,255],.2):c2):dk(.1)):(edge?dk(.42):(td<.08?dk(.2):lt(.06))),1)}}
    else if(fur&&td<.2){set(p,wHash(x,y)>.6?mxc(c2,[255,255,255],.22):(wHash(x+7,y)>.75?mxc(c2,[0,0,0],.16):c2),1)}
    else if(!fur&&td<.1)set(p,dk(.22),1)}
   // fourrure qui déborde un peu de chaque côté du cou (volume du col)
   if(fur&&q==0&&!o[p*4+3]&&y>G.ny-1&&y<G.ny+5){const l=x>0?P[p-1]:0,r=x<CW-1?P[p+1]:0;if((l==2||l==3||r==2||r==3)&&!(p+CW<n&&P[p+CW]==1))add.push([p,wHash(x,y)>.5?mxc(c2,[255,255,255],.15):c2])}}
  if(has('kang')&&F&&q==5&&cx>=0&&td>.6&&Math.abs(x-cx)<4.5){const ed=Math.abs(x-cx)>3.6||(td>.6&&td<.68);set(p,ed?dk(.32):dk(.08),1)}
  if(has('cords2')&&F&&cx>=0&&td>.03&&td<.26&&(Math.abs(x-cx+1.5)<.6||Math.abs(x-cx-1.5)<.6))set(p,c2,1);
  // --- côtes (bas du haut, poignets, col) ---
  if(has('ribhem')&&q>=3&&q<=6&&m[p]&&(p+CW>=n||!m[p+CW]||P[p+CW]>=10||p+2*CW>=n||!m[p+2*CW]||P[p+2*CW]>=10))set(p,has('ribc2')?(x%2?c2:mxc(c2,[0,0,0],.15)):(x%2?dk(.2):dk(.3)),1);
  if(has('ribcuffs')&&(q==7||q==8)&&S.a&&G.arm[p]>S.a-.13)set(p,has('ribc2')?(y%2?c2:mxc(c2,[0,0,0],.15)):(y%2?dk(.2):dk(.3)),1);
  if(has('ribcollar')&&(q==2||(q>=3&&q<=4&&td>=0&&td<.08))){m[p]=1;set(p,has('ribc2')?c2:(x%2?dk(.25):dk(.35)),1)}
  if(has('ribline')&&q>=3&&q<=6&&m[p]&&p+3*CW<n&&m[p+2*CW]&&P[p+2*CW]<10&&(!m[p+3*CW]||P[p+3*CW]>=10))set(p,c3,1);
  // --- veste ouverte : on voit le haut porté dessous (forme en V) ---
  if(has('openw')&&F&&q>=2&&q<=6&&cx>=0&&td>=0&&td<.98&&Math.abs(x-cx)<(td<.6?3.6-td*4.2:1.1))set(p,null,0);
  if(has('lapel2')&&F&&q>=3&&q<=4&&cx>=0&&td<.6){const w=Math.max(1.1,3.6-td*4.2);const e=Math.abs(x-cx)-w;if(e>=0&&e<1)set(p,lt(.18),1);else if(e>=1&&e<2)set(p,dk(.32),1)}
  // --- poches à rabat (blazer, parka) ---
  if(has('pflap')&&F&&(q==5||q==6)&&cx>=0&&td>=.74&&td<.8&&Math.abs(x-cx)>=2&&Math.abs(x-cx)<=5)set(p,dk(.3),1);
  if(has('chestpk')&&F&&q>=3&&q<=4&&cx>=0&&td>.26&&td<.42&&Math.abs(x-cx)>=2&&Math.abs(x-cx)<=4)set(p,td<.31?dk(.3):dk(.12),1);
  // --- col en mouton (veste en jean) ---
  if(has('sherpa')&&(q==2||(q>=3&&q<=4&&td>=0&&td<.13))&&!(q==2&&F)){m[p]=1;set(p,wHash(x,y)>.55?mxc(c2,[255,255,255],.25):c2,1)}
  if(has('sherpa')&&F&&q>=3&&q<=4&&td>=0&&td<.15&&cx>=0&&Math.abs(x-cx)>=2)set(p,wHash(x,y)>.55?mxc(c2,[255,255,255],.25):c2,1);
  if(has('seams2')&&(q==7||q==8)&&S.a&&Math.abs(G.arm[p]-.5)<.04)set(p,dk(.22),1);
  // --- veste de survêtement : bande de poitrine + bandes sur les manches ---
  if(has('chestband')&&q>=3&&q<=4&&td>=.2&&td<.36)set(p,td>=.33?c2:c3,1);
  if(has('armstripe')&&(q==7||q==8)&&m[p]&&G.arm[p]>.08&&G.arm[p]<(S.a||1)-.12){if((edgeD(o,p,-1,3)==1&&o[(p-1)*4+3])||(edgeD(o,p,1,3)==1&&o[(p+1)*4+3]))set(p,c2,1)}
  // --- motif imprimé sur la poitrine (sweat skateur) ---
  if(has('graphic')&&F&&q>=3&&q<=5&&cx>=0&&td>.24&&td<.56&&Math.abs(x-cx)<=3.2){const bd=Math.abs(x-cx)>2.4||td<.28||td>.52;set(p,bd?c2:(wHash(x,y)>.55?mxc(c2,[255,255,255],.55):mxc(c2,[0,0,0],.2)),1)}
  if(has('patch')&&(q==7)&&G.arm[p]>.18&&G.arm[p]<.3&&!G.back)set(p,c3,1);
  if(has('zipc')&&(B[p]&1)&&F&&q>=2&&q<=6&&m[p]&&cx>=0&&Math.abs(x-cx)<.6)set(p,c3,1);
  // --- pantalons ---
  if(LM&&(q==10||q==11)&&m[p]&&LM[y]>=0){const dir=x<LM[y]?-1:1,e=edgeD(o,p,dir,6);
   if(has('cargo2')&&G.leg[p]>.3&&G.leg[p]<.56&&e>=1&&e<=3)set(p,G.leg[p]<.35?dk(.34):dk(.14),1);
   if(has('tstripe')&&G.leg[p]>.02&&(e==1||(has('tstripe2')&&e==2)))set(p,e==1?c2:c3,1);
   // jambes larges : un pixel de tissu de plus vers l'extérieur, en bas de jambe
   if(has('wide')&&G.leg[p]>.5&&e==0){const pp=p+dir;if(pp>=0&&pp<n&&!o[pp*4+3]&&!G.P[pp])add.push([pp,mxc(col,[0,0,0],.05)])}}
  if(has('drawcord')&&q==6&&m[p]&&(p<CW*2||P[p-CW]!=6||P[p-2*CW]!=6))set(p,y%2?dk(.12):dk(.22),1);
  if(has('drawcord')&&F&&q==6&&cx>=0&&p>=2*CW&&P[p-2*CW]!=6&&P[p-CW]==6&&(Math.abs(x-cx-1)<.6||Math.abs(x-cx+1)<.6))set(p,c2,1);
  if(has('cuffleg2')&&(q==10||q==11)&&G.leg[p]>.92)set(p,dk(.25),1);
  if(has('belt2')&&q==6&&(p<CW||P[p-CW]!=6)){set(p,[40,30,30],1);if(B[p]&1&&F)set(p,[196,200,210],1)}
  if(has('fray')&&(q==10||q==11)&&S.l&&G.leg[p]>S.l-.05)set(p,(x%2)?[236,236,236]:lt(.4),1);
  // --- chaussures montantes : liseré d'accent en haut + semelle ---
  if(has('trim')&&q==12&&m[p]&&(p<CW||!m[p-CW]||P[p-CW]!=12))set(p,c3,1);
  if(has('toe')&&q==12&&m[p]&&p+CW<n&&P[p+CW]==12&&p+2*CW<n&&P[p+2*CW]!=12)set(p,lt(.35),1);
  if(has('scollar')&&q>=2&&q<=4&&(q==2||td<.1)&&!(q==2&&!G.back)){m[p]=1;set(p,lt(.12),1)}
  if(has('scollar')&&F&&q==2&&p+CW<n&&P[p+CW]>=3){m[p]=1;set(p,lt(.12),1)}
 }
 // pixels ajoutés hors silhouette (col de fourrure, bas de jambe large) : on les peint avec un contour
 if(add.length){if(!G._ex)G._ex=[];add.forEach(([p,c])=>{m[p]=1;set(p,c.map(v=>Math.min(255,v*1.22)),1)})}};
// images du cinéma : sur la carte d'origine, les bras posés sur l'accoudoir sont marqués « tête » ; on les rend aux bras
// (seule la zone de la tête reliée aux cheveux reste « tête »), pour que les manches suivent aussi ces images
const _wGeo=wGeo;
wGeo=function(nm){if(!WGEO[nm]&&/^(F_)?(cs|cn)\d/.test(nm)&&FGAR[nm]&&!FGAR[nm]._fix){const P=FGAR[nm].P,seen=new Uint8Array(n),comps=[];
  for(let p=0;p<n;p++){if(P[p]!=1||seen[p])continue;const q=[p],c=[];seen[p]=1;while(q.length){const a=q.pop();c.push(a);const x=a%CW;for(const j of[x>0?a-1:-1,x<CW-1?a+1:-1,a-CW,a+CW]){if(j<0||j>=n||seen[j]||P[j]!=1)continue;seen[j]=1;q.push(j)}}comps.push(c)}
  comps.sort((a,b)=>b.length-a.length);const L=LAB[nm];comps.slice(1).forEach(c=>{const hair=L?c.filter(p=>L[p]==2).length:0;if(hair<c.length*.3)c.forEach(p=>P[p]=7)});FGAR[nm]._fix=1}
 return _wGeo(nm)};
// ---------- 2. composition : couleurs directes « pièce|#principal|#accent|#accent2 » ----------
const parseV=v=>{const a=String(v).split('|');return{id:a[0],ci:a[1]&&a[1][0]=='#'?0:(+a[1]||0),hx:a[1]&&a[1][0]=='#'?a[1]:null,h2:a[2]||null,h3:a[3]||null}};
wCompose=function(out,f,L,nm){const G=wGeo(nm);if(!G)return out;const o=out.data,src=new Uint8ClampedArray(o);const W=L.wd||{};
 const items=Object.keys(W).map(sl=>{const v=W[sl];if(!v)return null;const V=parseV(v),it=WCAT[V.id];if(!it||it.legacy)return null;return{it,V,z:(WZ[it.slot]||30)+(it.zb||0)}}).filter(Boolean).sort((a,b)=>a.z-b.z);
 let hm=null;
 for(const{it,V}of items){const S=Object.assign({},it.S,{c2:V.h2||it.c2,c3:V.h3||it.c3||null});const hex=V.hx||(it.pal[V.ci]||it.pal[0])[1];
  if(it.slot=='cheveux'){const b=new Uint8ClampedArray(o);wHair(o,G,S,HRP[L.hr||0]);hm=new Uint8Array(CW*CH);for(let p=0;p<CW*CH;p++){const t=p*4;if(o[t]!=b[t]||o[t+1]!=b[t+1]||o[t+2]!=b[t+2]||o[t+3]!=b[t+3])hm[p]=1}continue}
  if(S.spr){const LS=WLAY[S.spr],ly=LS&&((L.lf&&LS[nm+'<'])||LS[nm]);if(ly){wLayer(o,ly,hm);continue}}
  if(S.acc){wAcc(o,G,S,hex,src);continue}
  if(S.cap){wCap(o,G,S,hex);continue}
  wPaint(o,G,S,hex,src)}
 // casquette : on retire les petits fragments de mèches restés seuls au-dessus de la visière (aucun pixel flottant)
 if(W.tete&&/^(casq|t_cap)\|/.test(W.tete))wSpeck(o);
 return out};
function wSpeck(o){const seen=new Uint8Array(n);for(let p=0;p<n;p++){if(seen[p]||o[p*4+3]<128)continue;const q=[p],c=[];seen[p]=1;
  while(q.length){const a=q.pop();c.push(a);const x=a%CW;for(const j of[x>0?a-1:-1,x<CW-1?a+1:-1,a-CW,a+CW,x>0?a-CW-1:-1,x<CW-1?a-CW+1:-1,x>0?a+CW-1:-1,x<CW-1?a+CW+1:-1]){if(j<0||j>=n||seen[j]||o[j*4+3]<128)continue;seen[j]=1;q.push(j)}}
  if(c.length<12)c.forEach(a=>o[a*4+3]=0)}}

// ---------- casquette : dessinée à la taille de la tête de CHAQUE image ----------
// calotte arrondie posée sur le crâne, visière juste au-dessus des sourcils (vers le visage), réglage à l'arrière vu de dos ;
// les mèches qui dépasseraient au-dessus de la visière sont retirées, les cheveux visibles dessous (côtés, nuque) restent.
// images assises / allongées du cinéma : tête penchée, cheveux d'une autre forme -> repères relevés à la main sur chaque image
// [centre des yeux x, y, inclinaison de la tête en degrés (+ = vers l'avant)]
const CAPF={cs0:[41,71,0],cs1:[51,76,20],cs2:[40,70.5,0],cs3:[42,71,0],cn0:[40,62,-5],cn1:[43,65,-12],cn2:[40,66,-40],cn3:[33,67,-60],
 F_cs0:[41.5,69.5,0],F_cs1:[45,77.5,20],F_cs2:[36.5,70.5,0],F_cs3:[38,70,0],F_cn0:[44,61,-5],F_cn1:[46,66.5,-12],F_cn2:[38,66,-35],F_cn3:[29.5,72,-60]};
function wCap(o,G,S,hex){const nm=G.nm,lab=LAB[nm];if(!lab||G.hx1<0)return;const{P}=G,col=hx2(hex),c2=hx2(S.c2||'#f2efe8'),OL=[30,22,26];
 let hx,hy,ux=0,uy=-1,vb,dir,face,a,uc,chin=CH,inHead,U,Vv,eTopV=-1e9,FS=null;const MF=CAPF[nm];
 if(MF){// repère manuel : la visière part au-dessus des yeux, la calotte est centrée sur le crâne (en arrière du visage)
  const t=MF[2]*Math.PI/180;ux=Math.sin(t);uy=-Math.cos(t);const rx=-uy,ry=ux;
  hx=MF[0]+4.5*ux-8*rx;hy=MF[1]+4.5*uy-8*ry;vb=0;dir=1;face=true;a=11.5;uc=1;
  U=p=>((p%CW)-hx)*rx+(((p/CW)|0)-hy)*ry;Vv=p=>((p%CW)-hx)*ux+(((p/CW)|0)-hy)*uy;
  inHead=p=>(P[p]==1||lab[p]==2)&&Math.hypot((p%CW)-hx,((p/CW)|0)-hy)<19;
  for(let p=0;p<n;p++){if(lab[p]!=0||!o[p*4+3])continue;const x=p%CW,y=(p/CW)|0;if(Math.hypot(x-MF[0],y-MF[1])>6)continue;let up=0,dn=0;for(let k=1;k<=3;k++){if(p-k*CW>=0&&lab[p-k*CW]==1)up=1;if(p+k*CW<n&&lab[p+k*CW]==1)dn=1}if(up&&dn){const v=Vv(p);if(v>eTopV)eTopV=v}}}
 else{
 // yeux : pixels sombres entourés de peau dessus et dessous, sous des cheveux
 const dnF=/^(F_)?dn\d/.test(nm),isH=p=>P[p]==1||dnF&&lab[p]==2;
 let ex=0,ey=0,ec=0,eTop=CH,hc=0;hx=0;hy=0;
 const eyMin=G.hy0+Math.min((G.hy1-G.hy0)*.45,15);const eyeScan=relax=>{for(let p=0;p<n;p++){if(!o[p*4+3])continue;const x=p%CW,y=(p/CW)|0;
  if(lab[p]!=0||x<G.hx0-2||x>G.hx1+2||y<eyMin)continue;let up=0,dn=0,hr=0,sd=0;for(let k=1;k<=3;k++){if(p-k*CW>=0&&lab[p-k*CW]==1)up=1;if(p+k*CW<n&&lab[p+k*CW]==1)dn=1;if(x-k>=0&&lab[p-k]==1)sd|=1;if(x+k<CW&&lab[p+k]==1)sd|=2}
  for(let k=1;k<=(relax?6:9);k++)if(p-k*CW>=0&&lab[p-k*CW]==2){hr=k>=2||relax;break}
  if((relax?sd==3:up)&&dn&&hr){ex+=x;ey+=y;ec++;if(y<eTop)eTop=y}}};
 const EY=new Uint8Array(n);const eyeScan2=relax=>{for(let p=0;p<n;p++){if(!o[p*4+3])continue;const x=p%CW;if(lab[p]!=0||x<G.hx0-2||x>G.hx1+2||((p/CW)|0)<eyMin)continue;let up=0,dn=0,hr=0,sd=0;for(let k=1;k<=3;k++){if(p-k*CW>=0&&lab[p-k*CW]==1)up=1;if(p+k*CW<n&&lab[p+k*CW]==1)dn=1;if(x-k>=0&&lab[p-k]==1)sd|=1;if(x+k<CW&&lab[p+k]==1)sd|=2}
  for(let k=1;k<=(relax?6:9);k++)if(p-k*CW>=0&&lab[p-k*CW]==2){hr=k>=2||relax;break}if((relax?sd==3:up)&&dn&&hr)EY[p]=1}};
 eyeScan(false);if(ec<2){ex=ey=ec=0;eTop=CH;eyeScan(true);eyeScan2(true)}else eyeScan2(false);
 // le haut réel de chaque œil : on remonte le long des pixels sombres de l'œil (4 pixels au plus)
 if(ec){const seeds=[];for(let p=0;p<n;p++)if(EY[p])seeds.push(p);seeds.forEach(p0=>{let p=p0;for(let k=0;k<4;k++){const q=p-CW;if(q<0||lab[q]!=0||!o[q*4+3])break;p=q}const y=(p/CW)|0;if(y<eTop)eTop=y})}
 if(ec){ex/=ec;ey/=ec}
 // peau du visage = zone de peau reliée au-dessous des yeux (les reflets de cheveux mal étiquetés « peau » n'en font pas partie)
 FS=new Uint8Array(n);if(ec){const q=[];for(let p=0;p<n;p++)if(EY[p])for(let k=1;k<=3;k++){const j=p+k*CW;if(j<n&&lab[j]==1&&!FS[j]){FS[j]=1;q.push(j)}}
  while(q.length){const a2=q.pop();const x=a2%CW;for(const j of[x>0?a2-1:-1,x<CW-1?a2+1:-1,a2-CW,a2+CW]){if(j<0||j>=n||FS[j]||lab[j]!=1||!o[j*4+3])continue;FS[j]=1;q.push(j)}}}
 chin=ec?eTop+16:CH;for(let p=0;p<n;p++){if(!isH(p))continue;const y=(p/CW)|0;if(y>chin)continue;hx+=p%CW;hy+=y;hc++}
 if(!hc)return;hx/=hc;hy/=hc;
 U=p=>(p%CW)-hx;Vv=p=>hy-((p/CW)|0);inHead=p=>isH(p)&&((p/CW)|0)<=chin;
 let vmin=1e9,vmax=-1e9,mu=0,eV=-1e9,su=0,sc=0;
 for(let p=0;p<n;p++){if(!inHead(p))continue;const v=Vv(p);mu+=U(p);if(v<vmin)vmin=v;if(v>vmax)vmax=v;if(lab[p]==1){su+=U(p);sc++}}
 mu/=hc;const hh=vmax-vmin;
 if(ec)eV=hy-eTop;
 face=ec>=2&&!G.back;if(face)eTopV=eV;
 // bas de la casquette : juste au-dessus des yeux (sourcils), sans jamais descendre sur les yeux
 const lo=vmin+hh*.38,hi=vmin+hh*.56;vb=face?Math.min(hi,eV+2.5):vmin+hh*.45;
 const ecu=sc?su/sc:0;dir=face?(ecu-mu>1.6?1:ecu-mu<-1.6?-1:0):0;
 let uL=1e9,uR=-1e9;for(let p=0;p<n;p++){if(!inHead(p))continue;const v=Vv(p);if(Math.abs(v-vb)>.5)continue;const u=U(p);if(u<uL)uL=u;if(u>uR)uR=u}if(uR<uL){uL=-8;uR=8}
 // largeur : celle de la tête à la ligne des sourcils, sans les mèches qui dépassent (bornée par la largeur du visage)
 let fL=1e9,fR=-1e9;if(ec)for(let p=0;p<n;p++){if(lab[p]!=1||!inHead(p))continue;const y=(p/CW)|0;if(y<eTop||y>eTop+5)continue;const u=U(p);if(u<fL)fL=u;if(u>fR)fR=u}
 a=Math.max(5.5,(uR-uL)/2-1.2);if(fR>fL)a=Math.min(a,(fR-fL)/2+(dir?6:4));uc=(uL+uR)/2-dir;if(fR>fL&&dir==0)uc=(fL+fR)/2}
 const hcap=a*.82,isSk=p=>lab[p]==1&&(MF?true:face&&FS&&FS[p]);if(window.CAPDBG)window.CAPDBG[nm]={hx,hy,ux,uy,vb,yb:hy-vb,face,dir,a,eTopV,ybEye:hy-eTopV};
 const M=new Uint8Array(n),V=new Uint8Array(n),K=new Float32Array(n),T=new Float32Array(n);
 for(let p=0;p<n;p++){const u=U(p),v=Vv(p);const t=(v-vb)/hcap;
  if(t>=-.06&&t<=1){const w=a*Math.sqrt(Math.max(0,1-t*t*t*.9-t*t*.1));if(Math.abs(u-uc)<=w+.35){M[p]=1;T[p]=t;K[p]=1-.16*(u-uc)/a-(t<.2?.06:0)+(t>.75?.08:0)}}
  if(face&&v<vb+.5&&v>=vb-2.5){const lower=v<vb-1;
   if(dir==0){if(Math.abs(u-uc)<=a+(lower?0:1)){M[p]=1;V[p]=lower?2:1}}
   else{const e=dir*(u-uc);if(e>=-a*.9&&e<=a+(lower?4:5)){M[p]=1;V[p]=lower?2:1}}}}
 // jamais sur les bras ni les mains (une main posée près de la tête reste devant la casquette)
 for(let p=0;p<n;p++)if(M[p]&&P[p]>=7){M[p]=0;V[p]=0}
 // jamais sur les yeux : tout ce qui descendrait jusqu'à la ligne des yeux est retiré de la casquette
 if(face&&eTopV>-1e8)for(let p=0;p<n;p++){if(M[p]&&Vv(p)<eTopV+1){M[p]=0;V[p]=0}}
 // le front qui dépasserait au-dessus de la visière est sous la casquette
 for(let p=0;p<n;p++){if(M[p]||!inHead(p)||!isSk(p))continue;const v=Vv(p);if(v<=vb+.5||v>vb+hcap+1)continue;M[p]=1;const t=(v-vb)/hcap;T[p]=t;K[p]=1-.16*(U(p)-uc)/a}
 const put=(p,c)=>{const i=p*4;o[i]=c[0];o[i+1]=c[1];o[i+2]=c[2];o[i+3]=255};
 // les mèches au-dessus de la visière qui sortent de la calotte disparaissent (jamais la peau du visage, jamais le corps)
 const RM=new Uint8Array(n);for(let p=0;p<n;p++){if(M[p]||!o[p*4+3]||isSk(p)||P[p]>1||Vv(p)<=vb+.5||((p/CW)|0)>chin)continue;if(inHead(p)||lab[p]==2)RM[p]=1}
 for(let it=0;it<2;it++){const add=[];for(let p=0;p<n;p++){const x=p%CW;if(RM[p]||M[p]||!o[p*4+3]||isSk(p)||P[p]>1||Vv(p)<=vb+.5||x<G.hx0-3||x>G.hx1+3)continue;
   if([x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW,x>0?p-CW-1:-1,x<CW-1?p-CW+1:-1,x>0?p+CW-1:-1,x<CW-1?p+CW+1:-1].some(j=>j>=0&&j<n&&RM[j]))add.push(p)}add.forEach(p=>RM[p]=1)}
 for(let p=0;p<n;p++)if(RM[p])o[p*4+3]=0;
 for(let p=0;p<n;p++){if(!M[p])continue;const x=p%CW;
  const out=[x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW].some(j=>j<0||j>=n||!M[j]);
  if(out){put(p,OL);continue}
  if(V[p]){put(p,V[p]==1?mxc(col,[255,255,255],.12):mxc(col,[0,0,0],.35));continue}
  const u=U(p),v=Vv(p);let c=col.map(q=>Math.min(255,q*K[p]));
  if(!G.back&&dir==0&&Math.abs(u-uc)<.5&&v>vb+1.5)c=mxc(col,[0,0,0],.25);                       // couture centrale
  if(face&&v>=vb+2.5&&v<=vb+4.5&&Math.abs(u-(uc+dir*a*.45))<=1.5)c=c2;                          // petit logo
  if(G.back&&v<=vb+2&&Math.abs(u-uc)<=1.5)c=v<=vb+1?(Math.abs(u-uc)<.6?mxc(col,[0,0,0],.5):mxc(col,[0,0,0],.25)):mxc(col,[0,0,0],.4); // réglage
  put(p,c)}
 // la peau qui touchait les mèches retirées retrouve un contour
 for(let p=0;p<n;p++){if(M[p]||!o[p*4+3]||!inHead(p)||Vv(p)<=vb+.5)continue;const x=p%CW;if([x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW].some(j=>j<0||j>=n||!o[j*4+3]))put(p,OL)}
 // morceaux isolés restés au-dessus de la visière (reflets, fragments) : retirés
 const seen=new Uint8Array(n);for(let p=0;p<n;p++){if(seen[p]||!o[p*4+3]||M[p])continue;const q=[p],c=[];seen[p]=1;let above=true;
  while(q.length){const a2=q.pop();c.push(a2);if(P[a2]>1&&Vv(a2)<=vb+.5||P[a2]>=7)above=false;const x=a2%CW;for(const j of[x>0?a2-1:-1,x<CW-1?a2+1:-1,a2-CW,a2+CW]){if(j<0||j>=n||seen[j]||!o[j*4+3]||M[j])continue;seen[j]=1;q.push(j)}}
  if(above&&c.length<40)c.forEach(a2=>o[a2*4+3]=0)}}
// ---------- 3. les pièces des tenues (ne sont pas vendues seules) ----------
const PC={
 t_hood:['haut','Sweat à capuche',{t:1,a:.74,hp:1,hl:.7,fx:['hood','kang','cords2','ribcuffs','ribhem']}],
 t_hoodg:['haut','Sweat imprimé',{t:1,a:.74,hp:1,hl:.7,fx:['hood','graphic','ribcuffs','ribhem']}],
 t_tee:['haut','T-shirt',{t:1,a:.3,fx:['collar']}],
 t_crop:['haut','T-shirt court',{t:1,tl:.84,a:.28,fx:['collar','ribhem']}],
 t_shirt:['haut','Chemise',{t:1,a:.74,hp:1,hl:.45,fx:['scollar','buttons','cuffs']}],
 t_top:['haut','Haut habillé',{t:1,a:.74,hp:1,hl:.45,fx:['scollar','buttons','cuffs']}],
 t_blazer:['veste','Blazer',{t:1,a:.74,hp:1,hl:1,fx:['openw','lapel2','pflap','cuffs']}],
 t_track:['veste','Veste de survêtement',{t:1,a:.74,hp:1,hl:.75,fx:['zip','chestband','armstripe','ribcollar','ribhem','ribcuffs']}],
 t_parka:['veste','Parka',{t:1,a:.74,hp:1,l:.4,ext:1,fx:['furhood','zip','pflap','ribcuffs']}],
 t_vjean:['veste','Veste en jean',{t:1,a:.74,hp:1,hl:.5,pat:'denim',fx:['openw','sherpa','chestpk','seams2','cuffs','ribhem']}],
 t_bomber:['veste','Bomber',{t:1,a:.74,hp:1,hl:.6,fx:['zip','zipc','ribcollar','ribhem','ribcuffs','ribline','patch','chestpk']}],
 t_cargo:['bas','Pantalon cargo',{hp:1,l:1,fx:['cargo2','belt2','cuffleg2']}],
 t_short:['bas','Short',{hp:1,l:.36,fx:['hem','pockets']}],
 t_shortj:['bas','Short en jean',{hp:1,l:.22,pat:'denim',fx:['seams','fray']}],
 t_chino:['bas','Pantalon',{hp:1,l:1,fx:['pockets','cuffleg2']}],
 t_dress:['bas','Pantalon de soirée',{hp:1,l:1,fx:['belt','cuffleg2']}],
 t_trackp:['bas','Pantalon de survêtement',{hp:1,l:1,fx:['tstripe','tstripe2','cuffleg']}],
 t_jean:['bas','Jean foncé',{hp:1,l:1,pat:'denim',fx:['seams','pockets']}],
 t_wide:['bas','Jean large',{hp:1,l:1,pat:'denim',fx:['wide','cargo2','seams']}],
 t_jog:['bas','Jogging',{hp:1,l:1,fx:['drawcord','cuffleg']}],
 t_sneak:['chaussures','Baskets',{f:1,fx:['sole','laces','toe']}],
 t_derby:['chaussures','Chaussures de ville',{f:1,fx:['sole','toe']}],
 t_boots:['chaussures','Bottes',{f:1,ank:1,fx:['sole','laces']}],
 t_hitop:['chaussures','Baskets montantes',{f:1,ank:1,fx:['sole','laces','trim']}],
 t_skate:['chaussures','Chaussures de skate',{f:1,fx:['sole','laces','toe']}],
 t_cap:['tete','Casquette',{cap:1}]};
Object.keys(PC).forEach(id=>{const[slot,nm,S]=PC[id];WCAT[id]={id,slot,n:nm,g:'u',p:0,col:'Tenue',S,c2:null,tab:'tn',legacy:null,piece:1,pal:[['',slot=='chaussures'?'#f2f0ea':'#26262e']]}});
// ---------- 4. les 10 tenues ----------
// parts : pièce par emplacement (f = variante fille) ; pals : 3 associations [principale, accent, accent 2] par élément
// (tete = indice de couleur de la casquette d'origine) ; def : association proposée d'abord (garçon, fille)
const TN=[
 {id:'street',n:'Streetwear',d:'Sweat à capuche, cargo, baskets',p:120,parts:{haut:'t_hood',bas:'t_cargo',chaussures:'t_sneak'},
  pals:[{n:'Noir',c:{haut:['#2a2a30','#e8e4dc'],bas:['#2e2f35'],chaussures:['#f2f0ea','#3a3a44']}},
   {n:'Crème',c:{haut:['#e8dcc0','#8a7a5a'],bas:['#5a4e40'],chaussures:['#f2f0ea','#3a3a44']}},
   {n:'Rouge',c:{haut:['#b8343a','#f2f0ea'],bas:['#2e2f35'],chaussures:['#f2f0ea','#b8343a']}}]},
 {id:'estival',n:'Estival',d:'T-shirt blanc, short, baskets',p:0,parts:{haut:'t_tee',bas:'t_short',chaussures:'t_sneak'},fp:{haut:'t_crop',bas:'t_shortj'},
  pals:[{n:'Blanc',c:{haut:['#f4f2ed'],bas:['#c8b48c'],chaussures:['#f4f2ed','#9a9aa4']},f:{bas:['#8fb3d9']}},
   {n:'Ciel',c:{haut:['#a9c6e6'],bas:['#e8dcc0'],chaussures:['#f4f2ed','#6d8fbf']},f:{bas:['#d4e2ef']}},
   {n:'Sable',c:{haut:['#d9c7a4'],bas:['#5f6c7c'],chaussures:['#f4f2ed','#8a5434']},f:{bas:['#4a6a9a']}}]},
 {id:'elegant',n:'Élégant',d:'Veste structurée, pantalon habillé, chaussures de ville',p:200,parts:{haut:'t_shirt',veste:'t_blazer',bas:'t_chino',chaussures:'t_derby'},
  pals:[{n:'Marine',c:{haut:['#f4f2ed','#d0ccc4'],veste:['#26304a'],bas:['#c8b48c'],chaussures:['#6a4630','#2a1e1a']},f:{veste:['#d6c2a0'],bas:['#d6c2a0']}},
   {n:'Blanc',c:{haut:['#a9c6e6','#f4f2ed'],veste:['#ece8df'],bas:['#26304a'],chaussures:['#6a4630','#2a1e1a']}},
   {n:'Marron',c:{haut:['#e8dcc0','#c8b48c'],veste:['#6a4630'],bas:['#33343c'],chaussures:['#26262e','#0e0e12']}}]},
 {id:'sport',n:'Sport',d:'Veste de sport, pantalon de survêtement, baskets',p:140,parts:{veste:'t_track',bas:'t_trackp',chaussures:'t_sneak'},
  pals:[{n:'Noir',c:{veste:['#26262e','#f2f0ea','#3f6fd0'],bas:['#26262e','#f2f0ea','#3f6fd0'],chaussures:['#f2f0ea','#3f6fd0']}},
   {n:'Bleu',c:{veste:['#2f55b8','#f2f0ea','#1f2a4a'],bas:['#1f2a4a','#f2f0ea','#2f55b8'],chaussures:['#f2f0ea','#2f55b8']}},
   {n:'Blanc',c:{veste:['#ece8df','#26262e','#c23b38'],bas:['#ece8df','#26262e','#c23b38'],chaussures:['#f2f0ea','#c23b38']}}]},
 {id:'hiver',n:'Hiver',d:'Parka à capuche fourrée, pantalon, bottes',p:220,parts:{veste:'t_parka',bas:'t_jean',chaussures:'t_boots'},
  pals:[{n:'Olive',c:{veste:['#5d6b3a','#e8dcc0'],bas:['#2e2f38'],chaussures:['#7a4a2a','#3a2418']}},
   {n:'Crème',c:{veste:['#d9ccb0','#f6f1e6'],bas:['#4a3e34'],chaussures:['#5a3a2a','#2a1e1a']}},
   {n:'Marron',c:{veste:['#6a4630','#e8dcc0'],bas:['#2e2f38'],chaussures:['#26262e','#5a3a2a']}}]},
 {id:'skate',n:'Skateur',d:'Sweat imprimé, pantalon large, casquette, chaussures de skate',p:160,parts:{haut:'t_hoodg',bas:'t_wide',chaussures:'t_skate',tete:'t_cap'},
  pals:[{n:'Crème',c:{haut:['#e8dcc0','#7a4fb0'],bas:['#2e3448'],chaussures:['#f2f0ea','#26262e'],tete:['#26262e','#7a4fb0']}},
   {n:'Noir',c:{haut:['#2a2a30','#e8dcc0'],bas:['#5a6478'],chaussures:['#26262e','#f2f0ea'],tete:['#e8dcc0','#2a2a30']}},
   {n:'Violet',c:{haut:['#6a4c9c','#e8dcc0'],bas:['#2a2a30'],chaussures:['#f2f0ea','#6a4c9c'],tete:['#2a2a30','#e8dcc0']}}]},
 {id:'casual',n:'Casual',d:'Veste en jean, haut léger, pantalon, baskets',p:0,parts:{haut:'t_tee',veste:'t_vjean',bas:'t_chino',chaussures:'t_sneak'},
  pals:[{n:'Denim',c:{veste:['#5a82b8','#f2efe6'],haut:['#f4f2ed'],bas:['#2a2a30'],chaussures:['#f4f2ed','#3a3a44']}},
   {n:'Blanc',c:{veste:['#e8e4dc','#c8b48c'],haut:['#26304a'],bas:['#4a6a9a'],chaussures:['#f4f2ed','#26304a']}},
   {n:'Camel',c:{veste:['#b8875a','#f2efe6'],haut:['#f4f2ed'],bas:['#3a3e4a'],chaussures:['#f4f2ed','#6a4630']}}]},
 {id:'soiree',n:'Soirée',d:'Chemise élégante, pantalon noir, chaussures habillées',p:240,parts:{haut:'t_shirt',bas:'t_dress',chaussures:'t_derby'},fp:{haut:'t_top',bijou:'collier'},
  def:{m:1,f:0},
  pals:[{n:'Noir',c:{haut:['#1f1f26','#d6b05a'],bas:['#1f1f26'],chaussures:['#1f1f26','#0e0e12'],bijou:[0]}},
   {n:'Bordeaux',c:{haut:['#7c2b3a','#d6b05a'],bas:['#1f1f26'],chaussures:['#1f1f26','#0e0e12'],bijou:[0]}},
   {n:'Or',c:{haut:['#d6b05a','#26262e'],bas:['#1f1f26'],chaussures:['#1f1f26','#0e0e12'],bijou:[0]}}]},
 {id:'urbain',n:'Urbain',d:'Bomber, pantalon cargo, baskets montantes',p:180,parts:{veste:'t_bomber',bas:'t_cargo',chaussures:'t_hitop'},
  pals:[{n:'Noir',c:{veste:['#24242a','#24242a','#e8782e'],bas:['#2a2a30'],chaussures:['#26262e','#f2f0ea','#e8782e']}},
   {n:'Orange',c:{veste:['#d8692a','#26262e','#26262e'],bas:['#2a2a30'],chaussures:['#26262e','#f2f0ea','#d8692a']}},
   {n:'Gris',c:{veste:['#6d7080','#3a3a44','#e8782e'],bas:['#3a3a44'],chaussures:['#8a8d96','#f2f0ea','#e8782e']}}]},
 {id:'detente',n:'Détente',d:'Sweat confortable, jogging, baskets',p:100,parts:{haut:'t_hood',bas:'t_jog',chaussures:'t_sneak'},def:{m:0,f:1},
  pals:[{n:'Crème',c:{haut:['#e8dcc0','#f6f1e6'],bas:['#b4b2aa','#f2f0ea'],chaussures:['#f4f2ed','#9a9aa4']}},
   {n:'Rose',c:{haut:['#e7a4b4','#f6f1e6'],bas:['#b4b2aa','#f2f0ea'],chaussures:['#f4f2ed','#e7a4b4']}},
   {n:'Gris',c:{haut:['#9a9ca4','#f2f0ea'],bas:['#5a5c66','#f2f0ea'],chaussures:['#f4f2ed','#5a5c66']}}]}];
const TNI={};TN.forEach(t=>TNI[t.id]=t);
const TSL=['haut','veste','bas','chaussures','tete','bijou'],TSN={haut:'Haut',veste:'Veste',bas:'Pantalon',chaussures:'Chaussures',tete:'Casquette',bijou:'Bijou'};
const tnParts=(t,g)=>Object.assign({},t.parts,g=='f'?t.fp||{}:{});
const tnDef=(t,g)=>t.def?t.def[g=='f'?'f':'m']:0;
// couleurs effectives d'un élément : association choisie, puis couleur principale libre éventuelle
function tnCol(t,g,pi,cus,sl){const P=t.pals[pi]||t.pals[0],c=((g=='f'&&P.f&&P.f[sl])||P.c[sl]||['#26262e']).slice();if(cus&&cus[sl]!=null)c[0]=cus[sl];return c}
// la tenue sous forme d'emplacements portés : « pièce|#principal|#accent|#accent2 » (ou indice d'origine pour casquette et bijou)
function tnWd(id,g,pi,cus){const t=TNI[id];if(!t)return{};const W={},P=tnParts(t,g);
 Object.keys(P).forEach(sl=>{const c=tnCol(t,g,pi,cus,sl);W[sl]=typeof c[0]=='number'?P[sl]+'|'+c[0]:[P[sl]].concat(c).join('|')});return W}
window.TN=TN;window.TNI=TNI;window.tnWd=tnWd;window.tnParts=tnParts;window.tnCol=tnCol;window.tnDef=tnDef;window.TSL=TSL;window.TSN=TSN;

// ---------- 5. sauvegarde, reprise des anciennes affaires ----------
// N.wd2.tn = {own:{id:1}, cus:{id:{pi, c:{emplacement:couleur}}}, fav:[3 × {id,pi,c}|null], seen:{}}
// N.look.tn = {id, pi, c} : la tenue portée (les anciens vêtements portés restent portés tant qu'on n'en change pas)
const GRANT={hoodie:['street','detente'],cargo:['street','urbain'],jog:['detente','sport'],legging:['detente'],running:['sport'],
 blazer:['elegant'],shirt:['elegant'],chino:['elegant'],mocass:['elegant','soiree'],manteau:['hiver'],doud:['hiver'],bottine:['hiver'],bottes:['hiver'],bonnet:['hiver'],echarpe:['hiver'],
 casq:['skate'],vjean:['casual'],rsoir:['soiree'],collier:['soiree'],blouson:['urbain']};
function tnS(){N.wd2=N.wd2||{own:{}};if(!N.wd2.own)N.wd2.own={};const T=N.wd2.tn||(N.wd2.tn={own:{},cus:{},fav:[null,null,null],seen:{}});
 if(!T.own)T.own={};if(!T.cus)T.cus={};if(!Array.isArray(T.fav))T.fav=[null,null,null];if(!T.seen)T.seen={};
 TN.forEach(t=>{if(!t.p)T.own[t.id]=1});
 // toute pièce achetée ou gagnée (salle de sport…) ouvre les tenues qui la contiennent ; rien n'est retiré
 Object.keys(N.wd2.own).forEach(k=>{if(T.seen[k]||!N.wd2.own[k])return;T.seen[k]=1;(GRANT[k]||[]).forEach(id=>{if(!T.own[id]){T.own[id]=1;T.newG=(T.newG||[]).concat(id)}})});
 return T}
const tnOwn=id=>!!tnS().own[id];
// réglages de couleurs mémorisés pour une tenue (association + couleurs libres)
const tnCus=id=>{const c=tnS().cus[id];return c?{pi:c.pi|0,c:Object.assign({},c.c||{})}:{pi:tnDef(TNI[id],N.look.g),c:{}}};
function tnApply(L,id,pi,c){const W={cheveux:(L.wd||{}).cheveux||('nat|'+(L.hr||0))};const y=(L.wd||{}).yeux;if(y)W.yeux=y;
 Object.assign(W,tnWd(id,L.g,pi,c));L.wd=W;L.tn={id,pi:pi|0,c:Object.assign({},c||{})};wSync(L);return L}
// les réglages hérités (météo, travail, remarques) suivent les vraies couleurs de la tenue
const _wSync=wSync;
wSync=function(L){_wSync(L);const W=L.wd||{},hx=sl=>{const v=W[sl];if(!v)return null;const V=parseV(v);return V.hx};
 const top=hx('haut')||hx('robe');if(top){if(L.top=='p')L.puc=wNear(top,PULLC);else L.tco=wNear(top,TEEC)}
 const h=W.haut&&parseV(W.haut).id;if(h=='t_hood'||h=='t_hoodg')L.top='p';
 const v=hx('veste');if(v)L.jk=wNear(v,JKP);const b=hx('bas');if(b)L.pn=wNear(b,PNP);const c=hx('chaussures');if(c){L.sz=wNear(c,SZP);const cid=parseV(W.chaussures).id;L.shm=cid=='t_boots'||cid=='t_hitop'?1:0}
 if(L.tn&&L.tn.id){const want=tnWd(L.tn.id,L.g,L.tn.pi,L.tn.c);if(Object.keys(want).some(sl=>W[sl]!=want[sl]))L.tn=null}
 return L};
// premier vêtement : une tenue achetée compte aussi
try{const g=GOALS.find(q=>q.id=='habit');if(g){const o=g.ok;g.ok=()=>o()||TN.some(t=>t.p&&tnOwn(t.id))}}catch(e){}
// ---------- 6. écrans : magasin (tenues complètes) et garde-robe ----------
const TCOL=[['Noir','#26262e'],['Anthracite','#4a4c55'],['Gris','#8a8d96'],['Gris clair','#c4c6cc'],['Blanc','#f4f2ed'],['Crème','#e8dcc0'],['Beige','#c8b48c'],['Camel','#b8875a'],
 ['Marron','#6a4630'],['Bordeaux','#7c2b3a'],['Rouge','#c23b38'],['Orange','#e0782e'],['Moutarde','#d9a03a'],['Olive','#5d6b3a'],['Vert','#3f6f52'],['Ciel','#8fb6dd'],
 ['Denim','#5a82b8'],['Bleu','#2f55b8'],['Marine','#26304a'],['Violet','#6a4c9c'],['Lilas','#b6a2d8'],['Rose','#e7a4b4']];
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const tnLook=(id,pi,c)=>tnApply(Object.assign({},N.look,{wd:Object.assign({},N.look.wd)}),id,pi,c);
const tnIcon=(id,pi,c)=>wCopy(wIcon(tnLook(id,pi,c),'tenues'));
const dots=(t,cur,on)=>{const w=el('div','wsw tnp');t.pals.forEach((P,i)=>{
  const main=(P.c.veste||P.c.haut||P.c.bas)[0],d=el('i');d.style.background=typeof main=='string'?main:'#888';d.title=P.n;if(i==cur)d.className='on';d.onclick=e=>{e.stopPropagation();on(i)};w.append(d)});return w};
const worn=id=>N.look.tn&&N.look.tn.id==id;
const tnTry=(id,pi,c)=>{TRY=tnLook(id,pi,c);spKey=''};
const say2=t=>{try{say(t)}catch(e){}};
// --- magasin ---
const clPi={};let clMode='tn';
clDraw=function(){const L=document.getElementById('clList');if(!L)return;const seg=document.getElementById('clSeg'),home=document.getElementById('clHome');
 seg.innerHTML=`<button data-m="tn" class="${clMode=='tn'?'on':''}">Tenues complètes</button><button data-m="hair" class="${clMode=='hair'?'on':''}">Coiffures</button>`;if(home)seg.append(home);
 seg.onclick=e=>{const b=e.target.closest('button[data-m]');if(!b)return;clMode=b.dataset.m;TRY=null;spKey='';clDraw()};
 L.innerHTML='';L.className='wdg';tnS();
 if(clMode=='hair'){wItems('cheveux').forEach(it=>L.append(wCard(it,'shop')));return}
 L.append(el('p','hint tnh','Touche une tenue pour l’essayer · les pastilles changent les couleurs'));
 TN.forEach(t=>{const own=tnOwn(t.id),pi=clPi[t.id]!=null?clPi[t.id]:(own?tnCus(t.id).pi:tnDef(t,N.look.g)),cc=own&&clPi[t.id]==null?tnCus(t.id).c:{};
  const d=el('div','wdc tnc'+(worn(t.id)?' on':'')+(own?'':' lock'));d.dataset.tn=t.id;d.append(tnIcon(t.id,pi,cc));
  const m=el('div','wdm');m.append(el('b','',t.n),el('small','',t.d));m.append(dots(t,pi,i=>{clPi[t.id]=i;tnTry(t.id,i,{});say2(t.n+' · '+t.pals[i].n.toLowerCase()+' (essayage).');clDraw()}));
  const b=el('button');
  if(own){b.textContent=worn(t.id)?'Portée':'Porter';b.disabled=worn(t.id)&&clPi[t.id]==null;b.className='on';b.onclick=e=>{e.stopPropagation();tnWear(t.id,pi,cc);clDraw()}}
  else{const lack=t.p-N.coins;b.innerHTML=lack>0?'Encore '+lack:'<span class="cn"></span>'+t.p;b.disabled=lack>0;b.className='on';b.onclick=e=>{e.stopPropagation();tnBuy(t.id,pi)}}
  d.onclick=()=>{tnTry(t.id,pi,cc);say2('Essayage : tenue « '+t.n+' »'+(own?'':' ('+t.p+' pièces)')+'.');[...L.children].forEach(x=>x.classList&&x.classList.remove('try'));d.classList.add('try')};
  d.append(m,b);L.append(d)})};
function tnBuy(id,pi){const t=TNI[id];if(!t||tnOwn(id)||N.coins<t.p)return false;earn(-t.p);const T=tnS();T.own[id]=1;T.cus[id]={pi:pi|0,c:{}};tnApply(N.look,id,pi,{});TRY=null;spKey='';save();
 try{hearts(3)}catch(e){}talkMaybe('habits',.5);say2('Tenue « '+t.n+' » achetée et portée !');try{talkLast=-1e9;talk('tenue')}catch(e){}try{goalsTick()}catch(e){}clDraw();return true}
function tnWear(id,pi,c){if(!tnOwn(id))return false;const T=tnS();if(pi==null){const k=tnCus(id);pi=k.pi;c=k.c}T.cus[id]={pi:pi|0,c:Object.assign({},c||{})};tnApply(N.look,id,pi,c);TRY=null;spKey='';save();
 say2(NAME()+' met la tenue « '+TNI[id].n+' ».');if(Math.random()<.5)try{talk('tenue')}catch(e){}try{goalsTick()}catch(e){}return true}
// --- garde-robe ---
let drMode='tn';
const OLDT=[['haut','Hauts'],['bas','Bas'],['robe','Robes'],['veste','Vestes'],['chaussures','Chaussures'],['acc','Accessoires']];
const oldOwned=()=>Object.values(WCAT).filter(it=>!it.piece&&it.slot!='cheveux'&&it.p>0&&wOwn(it.id)&&wFor(it,N.look.g));
drDraw=function(){const L=document.getElementById('drList');if(!L||curV!='dress')return;const seg=document.getElementById('drSeg');const T=tnS();
 const tabs=[['tn','Mes tenues'],['col','Couleurs'],['fav','Favoris'],['hair','Coiffure'],['acc','Lunettes'],].concat(oldOwned().length?[['old','Anciens vêtements']]:[]);
 if(!tabs.some(x=>x[0]==drMode))drMode='tn';
 seg.innerHTML=tabs.map(([k,n])=>`<button data-m="${k}" class="${k==drMode?'on':''}">${n}</button>`).join('');
 seg.onclick=e=>{const b=e.target.closest('button[data-m]');if(!b)return;drMode=b.dataset.m;TRY=null;spKey='';drDraw()};
 L.innerHTML='';L.className='wdg';
 if(T.newG&&T.newG.length){L.append(el('p','hint tnh','Nouvelles tenues dans ta garde-robe : '+T.newG.map(id=>TNI[id].n).join(', ')+' (grâce à tes anciens vêtements).'));T.newG=[];save()}
 if(drMode=='tn'){const own=TN.filter(t=>tnOwn(t.id)),lock=TN.filter(t=>!tnOwn(t.id));
  own.concat(lock).forEach(t=>{const o=tnOwn(t.id),k=tnCus(t.id),d=el('div','wdc tnc'+(worn(t.id)?' on':'')+(o?'':' lock'));d.dataset.tn=t.id;d.append(tnIcon(t.id,k.pi,k.c));
   const m=el('div','wdm');m.append(el('b','',t.n),el('small','',o?t.pals[k.pi].n+(Object.keys(k.c).length?' · personnalisée':''):'Au magasin · '+t.p+' pièces'));const b=el('button');
   if(!o){b.textContent='Au magasin';b.disabled=true}else if(worn(t.id)){b.textContent='Couleurs';b.onclick=e=>{e.stopPropagation();drMode='col';drDraw()}}else{b.textContent='Porter';b.className='on';b.onclick=e=>{e.stopPropagation();tnWear(t.id);drDraw()}}
   d.onclick=()=>{if(!o){tnTry(t.id,k.pi,k.c);say2('Essayage : « '+t.n+' » (en vente au magasin).');return}if(!worn(t.id)){tnWear(t.id);drDraw()}};d.append(m,b);L.append(d)});return}
 if(drMode=='col'){const w=N.look.tn;if(!w||!TNI[w.id]){L.append(el('p','hint tnh','Mets d’abord une tenue (onglet « Mes tenues ») pour changer ses couleurs.'));return}
  const t=TNI[w.id],box=el('div','tncol');box.append(el('b','tnt','Tenue « '+t.n+' »'));
  const row=el('div','tnas');t.pals.forEach((P,i)=>{const b=el('button',i==w.pi&&!Object.keys(w.c||{}).length?'on':'',P.n);b.onclick=()=>{tnWear(t.id,i,{});drDraw()};row.append(b)});box.append(el('small','tnl','Associations'),row);
  const P=tnParts(t,N.look.g);Object.keys(P).forEach(sl=>{const cur=tnCol(t,N.look.g,w.pi,w.c,sl)[0];const r=el('div','tnrow');r.append(el('small','tnl',TSN[sl]||sl));const sw=el('div','wsw');
   const list=sl=='bijou'?[['Or',0,'#d6b05a']]:TCOL.map(([n,c])=>[n,c,c]);
   list.forEach(([n,v,c])=>{const i=el('i');i.style.background=c;i.title=n;if(v===cur)i.className='on';i.onclick=()=>{const cc=Object.assign({},w.c||{});cc[sl]=v;tnWear(t.id,w.pi,cc);say2(TSN[sl]+' : '+n.toLowerCase()+'.');drDraw()};sw.append(i)});r.append(sw);box.append(r)});
  const rs=el('button','','Couleurs d’origine');rs.onclick=()=>{tnWear(t.id,w.pi,{});drDraw()};box.append(rs);L.append(box);return}
 if(drMode=='fav'){L.append(el('p','hint tnh','Garde jusqu’à 3 tenues favorites (avec leurs couleurs) et remets-les d’un geste.'));
  for(let i=0;i<3;i++){const f=T.fav[i],ok=f&&TNI[f.id]&&tnOwn(f.id),d=el('div','wdc wide tnfav');d.append(ok?tnIcon(f.id,f.pi,f.c):(()=>{const c=tnIcon((N.look.tn||{}).id||'estival',0,{});c.style.opacity=.25;return c})());
   const m=el('div','wdm');m.append(el('b','','Favori '+(i+1)),el('small','',ok?TNI[f.id].n+' · '+TNI[f.id].pals[f.pi].n+(Object.keys(f.c||{}).length?' personnalisée':''):'Emplacement libre'));
   const bx=el('div','ob'),sv=el('button','','Enregistrer'),we=el('button','on','Porter');sv.disabled=!N.look.tn;we.disabled=!ok;
   sv.onclick=()=>{const w=N.look.tn;if(!w)return;T.fav[i]={id:w.id,pi:w.pi|0,c:Object.assign({},w.c||{})};save();say2('Favori '+(i+1)+' : « '+TNI[w.id].n+' ».');drDraw()};
   we.onclick=()=>{tnWear(f.id,f.pi,f.c);drDraw()};bx.append(sv,we);d.append(m,bx);L.append(d)}return}
 if(drMode=='hair'){wItems('cheveux').forEach(it=>L.append(wCard(it,'dress')));return}
 if(drMode=='acc'){wItems('acc').filter(it=>it.slot=='yeux'&&wOwn(it.id)).forEach(it=>L.append(wCard(it,'dress')));if(!L.children.length)L.append(el('p','hint tnh','Aucune paire de lunettes.'));return}
 if(drMode=='old'){L.append(el('p','hint tnh','Tes vêtements achetés avant les tenues complètes : ils restent à toi.'));oldOwned().forEach(it=>L.append(wCard(it,'dress')))}};
// l'ancien bouton « Tout retirer » : on garde, mais on oublie la tenue portée
(function(){const b=document.getElementById('wdAll');if(b){const o=b.onclick;b.onclick=()=>{o&&o();N.look.tn=null;save();drDraw()}}})();
window.TNUI={tnS,tnOwn,tnBuy,tnWear,tnApply,tnCus,parseV,TCOL,GRANT};
try{tnS()}catch(e){}
})();
