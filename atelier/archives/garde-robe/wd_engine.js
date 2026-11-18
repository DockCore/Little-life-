// ===== GARDE-ROBE v2 : vêtements dessinés en couches =====
// Chaque image du personnage possède une carte des parties du corps (FGAR : tête, cou, épaules, poitrine, ventre, hanches,
// bras, avant-bras, mains, cuisses, mollets, pieds + ligne médiane, chevilles, plis). Un vêtement est un modèle décrit par
// ce qu'il recouvre (longueur des manches, des jambes, du haut…), ce qui dépasse de la silhouette (jupes, manteaux,
// cheveux longs), ses motifs (rayures, carreaux, maille, denim, matelassé…) et ses détails (col, boutons, capuche, poches…).
// Il est redessiné pour CHAQUE image (marche, assis, sieste, travail, sport…) : il suit le corps sans flotter.
const WGEO={};
function wGeo(nm){if(WGEO[nm])return WGEO[nm];const F=FGAR[nm];if(!F)return null;const n=CW*CH,P=F.P,B=F.b;
 const nb=p=>{const x=p%CW;return[x>0?p-1:-1,x<CW-1?p+1:-1,p>=CW?p-CW:-1,p+CW<n?p+CW:-1]};
 const nbIn=(p,set)=>nb(p).some(j=>j>=0&&set.includes(P[j]));
 const bfs=(chain,seed)=>{const D=new Int16Array(n).fill(-1),q=[];for(let p=0;p<n;p++)if(chain.includes(P[p])&&seed(p)){D[p]=0;q.push(p)}
  for(let h=0;h<q.length;h++){const p=q[h];for(const j of nb(p)){if(j<0||D[j]>=0||!chain.includes(P[j]))continue;D[j]=D[p]+1;q.push(j)}}
  // normalisé par membre (0 = attache, 1 = extrémité)
  const N_=new Float32Array(n).fill(-1),seen=new Uint8Array(n);
  for(let p=0;p<n;p++){if(D[p]<0||seen[p])continue;const q2=[p],mem=[];seen[p]=1;let m=0;
   for(let h=0;h<q2.length;h++){const a=q2[h];mem.push(a);if(D[a]>m)m=D[a];for(const j of nb(a)){if(j<0||seen[j]||D[j]<0)continue;seen[j]=1;q2.push(j)}}
   mem.forEach(a=>N_[a]=m?D[a]/m:0)}return N_};
 const arm=bfs([7,8],p=>nbIn(p,[2,3,4,5,6])),leg=bfs([10,11],p=>nbIn(p,[6])),
  tor=bfs([2,3,4,5,6],p=>P[p]==2||((P[p]==3||P[p]==4)&&nbIn(p,[1])));
 let hx0=CW,hx1=-1,hy0=CH,hy1=-1,ny=-1,top=CH,bot=-1;const cx=new Float32Array(CH).fill(-1),rowL=new Int16Array(CH).fill(-1),rowR=new Int16Array(CH).fill(-1);
 for(let y=0;y<CH;y++){let s=0,c=0;for(let x=0;x<CW;x++){const p=y*CW+x,q=P[p];if(!q)continue;if(y<top)top=y;if(y>bot)bot=y;
  if(q==1){if(x<hx0)hx0=x;if(x>hx1)hx1=x;if(y<hy0)hy0=y;if(y>hy1)hy1=y}if(q==2&&ny<0)ny=y;
  if(q>=3&&q<=5){if(rowL[y]<0)rowL[y]=x;rowR[y]=x}if(B[p]&1&&q>=2&&q<=6){s+=x;c++}}if(c)cx[y]=s/c;else if(rowL[y]>=0)cx[y]=(rowL[y]+rowR[y])/2}
 if(ny<0)ny=hy1+1;
 return WGEO[nm]={P,B,T:F.t,arm,leg,tor,cx,rowL,rowR,hx0,hx1,hy0,hy1,ny,top,bot,back:/^(F_)?(wb\d|v_back|dk\d)/.test(nm),side:/^(F_)?(v_side|dn\d|w\d|r\d|drink|wave)/.test(nm)}}
// --- ce qu'un modèle recouvre ---
function wCover(G,S){const n=CW*CH,m=new Uint8Array(n),{P,B}=G;
 for(let p=0;p<n;p++){const q=P[p];if(!q)continue;let c=0;
  if(S.t&&q>=3&&q<=5&&(S.tl==null||G.tor[p]<=S.tl))c=1;
  if(S.nk&&q==2)c=1;
  if(S.hp&&q==6&&(S.hl==null||G.tor[p]<=S.hl))c=1;
  if(S.a&&(q==7||q==8)&&G.arm[p]>=0&&G.arm[p]<=S.a)c=1;
  if(S.l!=null&&(q==10||q==11)&&G.leg[p]>=0&&G.leg[p]<=S.l)c=1;
  if(S.lf!=null&&(q==10||q==11)&&G.leg[p]>=S.lf)c=1;
  if(S.ank&&(B[p]&2))c=1;
  if(S.f&&q==12)c=1;
  if(S.open&&(B[p]&1)&&q>=2&&q<=6)c=0;
  if(c)m[p]=1}
 return m}
// pixels hors silhouette : jupes évasées, bas de manteau (vers les côtés uniquement, jamais vers le haut)
function wFlare(G,m,o,k,parts){const n=CW*CH,e=new Uint8Array(n);let cur=m;
 for(let it=0;it<k;it++){const add=[];for(let p=0;p<n;p++){if(cur[p]||e[p]||o[p*4+3])continue;const x=p%CW;
   const src=[x>0?p-1:-1,x<CW-1?p+1:-1].find(j=>j>=0&&(cur[j]||e[j])&&(e[j]||parts.includes(G.P[j])));if(src!=null)add.push(p)}
  add.forEach(p=>e[p]=1)}return e}
const wHash=(x,y)=>{const t=Math.sin(x*127.1+y*311.7)*43758.5453;return t-Math.floor(t)};
// --- motifs (renvoient un facteur de lumière ou une couleur de remplacement) ---
const WPAT={
 stripes:(x,y,p,G,S)=>((y>>1)%2?S.c2:null),
 check:(x,y)=>(x%4==0||y%4==0)?.74:((x>>2)+(y>>2))%2?.9:null,
 knit:(x,y)=>(y%2?.9:null),
 rib:(x,y)=>(x%2?.92:null),
 denim:(x,y)=>.92+wHash(x,y)*.14,
 puffer:(x,y,p,G)=>{const d=G.P[p]>=7&&G.P[p]<=8?G.arm[p]:G.tor[p];return d>=0&&Math.floor(d*9)%2&&(d*9%1)<.22?.66:null},
 pleats:(x,y)=>(x%3==0?.76:null),
 dots:(x,y)=>((x%4==1&&y%4==1)||(x%4==3&&y%4==3))?'#f6f1e6':null,
 flowers:(x,y)=>{const h=wHash(x>>1,y>>1);return h>.86?'#f3d36b':h>.78?'#f6f1e6':null},
 camo:(x,y)=>{const h=wHash(x>>2,y>>2);return h>.66?.72:h>.4?.86:null},
 shine:(x,y)=>((x+y)%7==0?1.18:null)};
// --- détails ---
function wDetails(S,G,m,set,col,o){const n=CW*CH,{P,B}=G,c2=hx2(S.c2||'#f2efe8'),d=S.fx||[];
 for(let p=0;p<n;p++){if(!m[p])continue;const x=p%CW,y=(p/CW)|0,q=P[p],td=G.tor[p],cx=G.cx[y];
  if(d.includes('collar')&&q>=2&&q<=4&&td>=0&&td<.12)set(p,mxc(col,[255,255,255],.25),1);
  if(d.includes('wcollar')&&q>=2&&q<=4&&td>=0&&td<.1)set(p,c2,1);
  if(d.includes('buttons')&&(B[p]&1)&&Math.abs(x-cx)<.6&&y%3==0&&q>=3&&q<=6)set(p,c2,1);
  if(d.includes('placket')&&(B[p]&1)&&Math.abs(x-cx)<.6&&td<.3&&q>=3&&q<=4)set(p,mxc(col,[0,0,0],.28),1);
  if(d.includes('zip')&&(B[p]&1)&&Math.abs(x-cx)<.6&&q>=2&&q<=6)set(p,[196,200,210],1);
  if(d.includes('cuffs')&&(q==7||q==8)&&G.arm[p]>S.a-.12)set(p,mxc(col,[0,0,0],.18),1);
  if(d.includes('hem')&&(q==10||q==11)&&G.leg[p]>S.l-.08)set(p,mxc(col,[0,0,0],.2),1);
  if(d.includes('cuffleg')&&(q==10||q==11)&&G.leg[p]>.9)set(p,mxc(col,[0,0,0],.22),1);
  if(d.includes('sidestripe')&&(q==10||q==11)){const xx=x;let L0=xx,R0=xx;while(L0>0&&m[p-(xx-L0)-1]&&(P[p-(xx-L0)-1]==10||P[p-(xx-L0)-1]==11))L0--;while(R0<CW-1&&m[p+(R0-xx)+1]&&(P[p+(R0-xx)+1]==10||P[p+(R0-xx)+1]==11))R0++;if(xx==L0||xx==R0)set(p,c2,1)}
  if(d.includes('pocket')&&q==5&&cx>=0&&Math.abs(x-cx)<3.5&&td>.62)set(p,mxc(col,[0,0,0],Math.abs(x-cx)>2.6||td>.86?.32:.1),1);
  if(d.includes('cords')&&cx>=0&&(Math.abs(x-cx+1.5)<.6||Math.abs(x-cx-1.5)<.6)&&td>.05&&td<.24)set(p,c2,1);
  if(d.includes('belt')&&q==6&&(p<CW||P[p-CW]!=6)){set(p,[46,32,30],1);if(B[p]&1)set(p,[214,172,84],1)}
  if(d.includes('pockets')&&q==6&&cx>=0&&Math.abs(Math.abs(x-cx)-4)<.6)set(p,mxc(col,[0,0,0],.3),1);
  if(d.includes('cargo')&&(q==10)&&G.leg[p]>.42&&G.leg[p]<.62)set(p,mxc(col,[0,0,0],.22),1);
  if(d.includes('crease')&&(q==10||q==11)){const l=p-1,r=p+1;if(x>0&&x<CW-1&&m[l]&&m[r]&&(x+y)%9==0)set(p,mxc(col,[0,0,0],.12),1)}
  if(d.includes('seams')&&(q==10||q==11||q==6)){if(x>0&&!m[p-1])set(p,mxc(col,[255,230,170],.35),1)}
  if(d.includes('lapel')&&q>=3&&q<=4&&cx>=0&&Math.abs(x-cx)<2.2+td*3&&td<.45)set(p,mxc(col,[0,0,0],.22),1);
  if(d.includes('furcollar')&&q>=2&&q<=3&&td<.14)set(p,[226,212,190],1);
  if(d.includes('straps')&&q>=3&&q<=5&&td<.3&&cx>=0&&Math.abs(Math.abs(x-cx)-3)>1.2)set(p,null,0);
  if(d.includes('tank')&&(q==3)&&cx>=0&&Math.abs(x-cx)>4)set(p,null,0);
  if(d.includes('vneck')&&cx>=0&&td>=0&&td<.3&&Math.abs(x-cx)<(.3-td)*9)set(p,null,0);
  if(d.includes('sole')&&q==12&&(p+CW>=n||!o[(p+CW)*4+3]||P[p+CW]!=12))set(p,c2,1);
  if(d.includes('laces')&&q==12&&(p<CW||P[p-CW]!=12)&&x%2)set(p,c2,1);
  if(d.includes('sandal')&&q==12&&y%2)set(p,null,0);
  if(d.includes('shine')&&q>=3&&q<=6&&(x+y)%7==0)set(p,mxc(col,[255,255,255],.35),1)}}
const mxc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
// --- peinture d'un vêtement sur l'image ---
const WTL=[.66,.85,1];
function wPaint(o,G,S,hex,src){const n=CW*CH,col=hx2(hex),m=wCover(G,S);
 const e=S.ext?wFlare(G,m,o,S.ext,[6,10,11]):null;
 const ov=new Map();const set=(p,c,on)=>{if(!on){m[p]=0;ov.delete(p);return}ov.set(p,c)};
 wDetails(S,G,m,set,col,o);
 const inG=p=>p>=0&&p<n&&(m[p]||(e&&e[p]));
 for(let p=0;p<n;p++){const iE=e&&e[p];if(!m[p]&&!iE)continue;if(S.behind&&o[p*4+3]&&!iE)continue;const i=p*4,x=p%CW,y=(p/CW)|0;
  let c=ov.get(p)||col,k=iE?.82:WTL[G.T[p]||0];
  if(!ov.has(p)&&S.pat){const r=WPAT[S.pat](x,y,p,G,S);if(typeof r=='number')k*=r;else if(r)c=hx2(r)}
  const lu=src?(.3*src[i]+.59*src[i+1]+.11*src[i+2])/255:1;
  // contour : bord de la silhouette -> trait sombre ; bord du vêtement sur le corps -> couture plus sombre
  const nbs=[x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW];
  const out=nbs.some(j=>j<0||j>=n||(!o[j*4+3]&&!inG(j)));
  if(out){const d=mxc(c,[26,16,20],.72);o[i]=d[0];o[i+1]=d[1];o[i+2]=d[2];o[i+3]=255;continue}
  if(!iE&&lu<.2&&(G.B[p]&8))k*=.62;
  else if(nbs.some(j=>j>=0&&j<n&&o[j*4+3]&&!inG(j)))k*=.8;
  const v=k<=1?c.map(q=>q*k):c.map(q=>q+(255-q)*Math.min(.5,k-1));
  o[i]=v[0];o[i+1]=v[1];o[i+2]=v[2];o[i+3]=255}}
// --- coiffures ajoutées (les cheveux d'origine restent ceux du personnage) ---
function wHair(o,G,S,hex){const n=CW*CH,col=hx2(hex),{P}=G;if(G.hx1<0)return;const hw=G.hx1-G.hx0,midY=(G.hy0+G.hy1)/2;
 const put=(p,k)=>{const i=p*4,v=col.map(q=>Math.min(255,q*k));o[i]=v[0];o[i+1]=v[1];o[i+2]=v[2];o[i+3]=255};
 const paint=(test,over)=>{const mk=new Uint8Array(n);for(let p=0;p<n;p++){const x=p%CW,y=(p/CW)|0;if(!test(x,y,p))continue;if(o[p*4+3]&&!over(P[p],p))continue;mk[p]=1}
  for(let p=0;p<n;p++){if(!mk[p])continue;const x=p%CW,y=(p/CW)|0,edge=[x>0?p-1:-1,x<CW-1?p+1:-1,p-CW,p+CW].some(j=>j<0||j>=n||(!mk[j]&&!o[j*4+3]));
   if(edge){const i=p*4;o[i]=34;o[i+1]=22;o[i+2]=24;o[i+3]=255}else put(p,(x+y)%5==0?.82:(y%3==0?.92:1))}};
 if(S.hair=='long'||S.hair=='mid'){const len=S.hair=='long'?16:7,y1=G.ny+len;
  paint((x,y)=>y>=midY&&y<=y1&&x>=G.hx0-1-(y>G.hy1?1:0)&&x<=G.hx1+1+(y>G.hy1?1:0)&&(x<=G.hx0+3||x>=G.hx1-3||y>G.hy1||G.back),
   (q,p)=>G.back?q>=2&&q<=4:q==2||(q==3)||(q==7&&(p%CW<=G.hx0+3||p%CW>=G.hx1-3)))}
 if(S.hair=='bun'){const cx=(G.hx0+G.hx1)/2,cy=G.hy0-2,r=Math.max(3,Math.round(hw*.14));paint((x,y)=>(x-cx)*(x-cx)+(y-cy)*(y-cy)*1.3<=r*r,q=>false)}
 if(S.hair=='tails'){const cy=midY+4,r=3;paint((x,y)=>((x-(G.hx0-2))**2+(y-cy)**2*.7<=r*r)||((x-(G.hx1+2))**2+(y-cy)**2*.7<=r*r),q=>false)}
 if(S.hair=='top'){const cx=(G.hx0+G.hx1)/2,cy=G.hy0-1;paint((x,y)=>Math.abs(x-cx)<=2.5&&y>=cy-3&&y<=cy+1,q=>false)}}
// bandeau, écharpe, collier, sac : accessoires dessinés de la même façon
function wAcc(o,G,S,hex,src){const n=CW*CH,col=hx2(hex),{P}=G,put=(p,c)=>{const i=p*4;o[i]=c[0];o[i+1]=c[1];o[i+2]=c[2];o[i+3]=255};
 if(S.acc=='band'){for(let p=0;p<n;p++){const y=(p/CW)|0;if(P[p]==1&&y>=G.hy0+3&&y<=G.hy0+4)put(p,y==G.hy0+3?col:mxc(col,[0,0,0],.25))}}
 if(S.acc=='scarf'){for(let p=0;p<n;p++){const q=P[p],x=p%CW,y=(p/CW)|0,td=G.tor[p],cx=G.cx[y];
   if((q==2||(q>=3&&q<=4&&td>=0&&td<.16))||(cx>=0&&q>=4&&q<=5&&td<.62&&x>=cx+1&&x<=cx+3)){const k=y%2?.86:1;put(p,(x+y)%6==0?mxc(col,[255,255,255],.3):col.map(v=>v*k))}}}
 if(S.acc=='necklace'){for(let p=0;p<n;p++){const q=P[p],td=G.tor[p];if(q>=3&&q<=4&&td>=.1&&td<.15&&(p%2==0))put(p,[226,190,90])}}
 if(S.acc=='bag'){// sac en bandoulière : sangle en diagonale + petite sacoche sur la hanche
  let x0=CW,x1=-1,y0=CH,y1=-1;for(let p=0;p<n;p++){const q=P[p];if(q<3||q>6)continue;const x=p%CW,y=(p/CW)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}if(x1<0)return;
  const H=y1-y0||1;for(let p=0;p<n;p++){const q=P[p];if(q<3||q>6)continue;const x=p%CW,y=(p/CW)|0,lx=x1-(y-y0)*(x1-x0)/H;if(Math.abs(x-lx)<1)put(p,mxc(col,[0,0,0],.25))}
  const bx=x0-1,by=y1-3;for(let y=by;y<by+5;y++)for(let x=bx-2;x<bx+3;x++){if(x<0||y>=CH)continue;const p=y*CW+x,edge=y==by||y==by+4||x==bx-2||x==bx+2;put(p,edge?[34,22,24]:(y==by+1?mxc(col,[255,255,255],.2):col))}}
 if(S.acc=='belt'){for(let p=0;p<n;p++){if(P[p]==6&&(p<CW||P[p-CW]!=6)){put(p,G.B[p]&1?[214,172,84]:col)}}}}
// --- composition : image de base (peau + sous-vêtements) puis les couches dans l'ordre ---
const WZ={cheveux:5,bas:10,chaussures:15,robe:20,haut:30,veste:40,cou:45,bijou:46,taille:47,sac:48,tete:60,yeux:62};
function wCompose(out,f,L,nm){const G=wGeo(nm);if(!G)return out;const o=out.data,src=new Uint8ClampedArray(o);const W=L.wd||{};
 const items=Object.keys(W).map(sl=>{const v=W[sl];if(!v)return null;const[id,ci]=String(v).split('|'),it=WCAT[id];if(!it||it.legacy)return null;return{it,ci:+ci||0,z:WZ[it.slot]||30}}).filter(Boolean).sort((a,b)=>a.z-b.z);
 for(const{it,ci}of items){const S=Object.assign({},it.S,{c2:it.c2});const hex=(it.pal[ci]||it.pal[0])[1];
  if(it.slot=='cheveux'){wHair(o,G,S,HRP[L.hr||0]);continue}
  if(S.acc){wAcc(o,G,S,hex,src);continue}
  wPaint(o,G,S,hex,src)}
 return out}
