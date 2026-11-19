// ===== MINI-JEU MINI RACING (module de la borne d'arcade) =====
// Course arcade vue de dessus, plein écran. S'enregistre auprès de la borne : ARC.register('racing', module).
// Commandes : joystick / flèches (gauche, droite, haut = accélérer, bas = freiner), A (OK, Entrée, Espace) = nitro,
// au doigt : boutons ◀ ▶ et NITRO du tableau de bord, ou glisser sur la route pour diriger la voiture.
(function(){
const RC={api:null,phase:'start',W:0,H:0,L:null,t:0,okN:null,touches:new Map(),traffic:[],items:[],parts:[],deco:[],msg:null,sel:0,son:0};
const PH=[{nom:'DÉBUT',d:0,k0:95,k1:135,gap:34,band:2,lc:0,sky:['#4fa83a','#5cb845','#3a3f4c']},{nom:'INTERMÉDIAIRE',d:800,k0:135,k1:170,gap:24,band:3,lc:.08,sky:['#c98a3a','#d89a48','#3c3a48']},
 {nom:'AVANCÉ',d:2500,k0:170,k1:205,gap:17,band:3,lc:.18,sky:['#6a3a8a','#7a469a','#2e2c40']},{nom:'EXPERT',d:5000,k0:205,k1:250,gap:12,band:3,lc:.28,sky:['#1a1040','#24164e','#1c1a2c']}];
const TYPES={citadine:{l:1.0,w:.92,k:[55,75]},berline:{l:1.12,w:1,k:[65,90]},sportive:{l:1.08,w:1.04,k:[95,125]},camion:{l:2.15,w:1.22,k:[45,65]}};
const fx=(n,k,g)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k,g)}catch(e){}};
const R=(x,a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
function D(x,cx,cy,r,c){x.fillStyle=c;const Rr=Math.ceil(r);for(let j=-Rr;j<=Rr;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(w>0||Math.abs(j)<r)x.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
const fmt=n=>String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
// ---------- mise en page ----------
function layout(w,h){RC.W=w;RC.H=h;const land=w>h;const hb=Math.max(24,Math.round(h*(land?.075:.055))),bz=Math.max(44,Math.round(h*(land?.16:.11)));
 let carH=Math.round(Math.min((h-hb-bz)*.13,w*.2)),carW=Math.round(carH*.52),lane=Math.round(carW*1.62);if(lane*4>w*.92){const k=w*.92/(lane*4);carH=Math.round(carH*k);carW=Math.round(carW*k);lane=Math.round(lane*k)}
 const roadW=lane*4,rx0=Math.round((w-roadW)/2);const L={land,hb,bz,carH,carW,lane,roadW,rx0,rx1:rx0+roadW,top:hb,bot:h-bz,ppm:carH/4.4};L.py=L.bot-Math.round(carH*1.25);
 // tableau de bord tactile : ◀  NITRO  ▶
 const bw=Math.min(Math.round(w*.3),Math.round(bz*2.2)),r=Math.round(Math.min(bz*.42,w*.1));L.bL={x:6,y:L.bot+4,w:bw,h:bz-8};L.bR={x:w-6-bw,y:L.bot+4,w:bw,h:bz-8};L.bN={x:w/2,y:L.bot+bz/2,r};
 const s=Math.max(16,Math.round(hb*.78));L.bP={x:w-s-4,y:Math.round((hb-s)/2),w:s,h:s};L.bS={x:w-2*s-8,y:L.bP.y,w:s,h:s};
 RC.L=L;RC.spr=new Map();if(RC.p){RC.p.x=Math.max(L.rx0+L.carW/2+2,Math.min(L.rx1-L.carW/2-2,RC.p.x))}}
const laneX=i=>RC.L.rx0+RC.L.lane*(i+.5);
// ---------- sprites des voitures (vue de dessus, avant vers le haut) ----------
function carSprite(type,col,player){const L=RC.L,T=TYPES[type],key=type+col+(player?'P':'')+L.carH;let c=RC.spr.get(key);if(c)return c;
 const w=Math.round(L.carW*T.w),h=Math.round(L.carH*T.l);c=document.createElement('canvas');c.width=w+4;c.height=h+4;const x=c.getContext('2d'),o=2,mx2=(a,b,t)=>mx(a,b,t),dk=mx2(col,'#000000',.35),lt=mx2(col,'#ffffff',.35);
 const body=(a,b,ww,hh,cc,rr)=>{R(x,o+a+rr,o+b,ww-2*rr,hh,cc);R(x,o+a,o+b+rr,ww,hh-2*rr,cc);R(x,o+a+1,o+b+1,ww-2,hh-2,cc)};
 // roues
 const wh=Math.max(2,Math.round(w*.14)),wl=Math.max(4,Math.round(h*.16));for(const[a,b]of[[-1,.16],[w-wh+1,.16],[-1,.68],[w-wh+1,.68]])R(x,o+a,o+h*b,wh,wl,'#16141c');
 if(type=='camion'){const cab=Math.round(h*.24);body(1,0,w-2,cab,col,3);R(x,o+3,o+3,w-6,Math.round(cab*.45),'#2a3f6a');R(x,o+4,o+4,w-8,2,'#8fc6ec');R(x,o+2,o+cab-2,w-4,3,'#555a66');
  body(0,cab+2,w,h-cab-2,'#e8e6ee',2);for(let yy=cab+8;yy<h-4;yy+=6)R(x,o+3,o+yy,w-6,1,'#c8c6d2');R(x,o+3,o+cab+4,w-6,4,col);R(x,o+2,o+h-3,4,2,'#ff3348');R(x,o+w-6,o+h-3,4,2,'#ff3348')}
 else{const rr=Math.max(2,Math.round(w*.22));body(1,0,w-2,h,col,rr);R(x,o+2,o+2,w-4,2,lt);
  // capot, pare-brise, toit, lunette arrière
  const ws=Math.round(h*(type=='sportive'?.34:.28)),wsH=Math.round(h*.13),roof=Math.round(h*(type=='citadine'?.22:.26));
  R(x,o+3,o+ws,w-6,wsH,'#24324e');R(x,o+4,o+ws+1,w-8,2,'#8fc6ec');R(x,o+3,o+ws+wsH,w-6,roof,lt);R(x,o+4,o+ws+wsH+1,w-8,roof-2,col);
  R(x,o+3,o+ws+wsH+roof,w-6,Math.round(h*.1),'#24324e');R(x,o+Math.round(w*.25),o+Math.round(h*.06),1,Math.round(h*.18),dk);R(x,o+Math.round(w*.75),o+Math.round(h*.06),1,Math.round(h*.18),dk);
  R(x,o-1,o+ws+2,2,3,col);R(x,o+w-1,o+ws+2,2,3,col);
  if(type=='sportive'||player){const sw=Math.max(2,Math.round(w*.16));R(x,o+w/2-sw-1,o+1,sw,h-2,player?'#38e1ff':'#ffffff');R(x,o+w/2+1,o+1,sw,h-2,player?'#38e1ff':'#ffffff');R(x,o+1,o+h-4,w-2,3,dk)}
  if(player){R(x,o,o+h-7,w,3,'#1d1626');R(x,o+2,o+h-8,w-4,1,'#ffe14f')}
  R(x,o+2,o+1,Math.max(2,w*.22),2,'#fff3b0');R(x,o+w-2-Math.max(2,w*.22),o+1,Math.max(2,w*.22),2,'#fff3b0');R(x,o+2,o+h-2,Math.max(2,w*.2),2,'#ff3348');R(x,o+w-2-Math.max(2,w*.2),o+h-2,Math.max(2,w*.2),2,'#ff3348')}
 // contour sombre
 const id=x.getImageData(0,0,c.width,c.height),d=id.data,W2=c.width,H2=c.height,a=new Uint8Array(W2*H2);for(let i=0;i<W2*H2;i++)a[i]=d[i*4+3]>0?1:0;
 for(let y=0;y<H2;y++)for(let X=0;X<W2;X++){const i=y*W2+X;if(a[i])continue;if((X>0&&a[i-1])||(X<W2-1&&a[i+1])||(y>0&&a[i-W2])||(y<H2-1&&a[i+W2])){d[i*4]=20;d[i*4+1]=14;d[i*4+2]=28;d[i*4+3]=255}}x.putImageData(id,0,0);
 RC.spr.set(key,c);return c}
// ---------- partie ----------
function phaseAt(d){let i=0;for(let k=0;k<PH.length;k++)if(d>=PH[k].d)i=k;return i}
function newGame(){const L=RC.L;RC.p={x:laneX(1),vx:0,tx:null,kmh:0};RC.dist=0;RC.score=0;RC.lives=3;RC.nitro=.5;RC.nOn=false;RC.shield=0;RC.inv=0;RC.combo=0;RC.best=0;RC.traffic=[];RC.items=[];RC.parts=[];RC.spawnD=60;RC.itemD=90;RC.nitroD=300;RC.shieldD=650;
 RC.ph=0;RC.phase='count';RC.cd=3.2;RC.lastCd=4;RC.msg=null;RC.over=null;RC.pass=0;RC.coins=0;RC.shake=0;fx('rcBeep',0,.1);music(.9)}
function music(lv){try{if(typeof JEUSON=='undefined')return;JEUSON.music('racing');JEUSON.level(RC.son==0?lv:0);JEUSON.sfxLevel(RC.son==2?0:1)}catch(e){}}
function free(lane,y,span){return!RC.traffic.some(c=>(c.lane==lane||c.to==lane)&&Math.abs(c.y-y)<span)}
function spawnCar(){const L=RC.L,P=PH[RC.ph],y=L.top-L.carH*2.4,kinds=RC.ph==0?['citadine','berline','berline','camion']:['citadine','berline','sportive','camion','berline','sportive'],type=kinds[Math.random()*kinds.length|0],T=TYPES[type];
 // équité : dans une bande de route, on laisse toujours au moins une voie libre
 const band=L.carH*3,used=new Set(RC.traffic.filter(c=>Math.abs(c.y-y)<band).map(c=>c.lane));if(used.size>=P.band)return;
 const opts=[0,1,2,3].filter(i=>!used.has(i)&&free(i,y,L.carH*T.l+L.carH*1.4));if(!opts.length)return;const lane=opts[Math.random()*opts.length|0];
 const cols=['#e63946','#2d6cdf','#f4f4f4','#4ec9b0','#7a5c99','#ff8a3d','#ffd23f','#3a3f4a','#9fd36a'];
 RC.traffic.push({type,lane,to:null,x:laneX(lane),y,kmh:T.k[0]+Math.random()*(T.k[1]-T.k[0])+RC.ph*6,col:type=='sportive'?['#ff2f4a','#ffd23f','#2fb8ff'][Math.random()*3|0]:cols[Math.random()*cols.length|0],passed:false,blink:0,hit:false,spin:0})}
function spawnItem(kind){const L=RC.L,y=L.top-L.carH*1.5,opts=[0,1,2,3].filter(i=>free(i,y,L.carH*3.2));if(!opts.length)return false;const lane=opts[Math.random()*opts.length|0];
 if(kind=='coins'){const n=4+(Math.random()*3|0);for(let i=0;i<n;i++)RC.items.push({kind:'coin',x:laneX(lane),y:y-i*L.carH*.7})}else RC.items.push({kind,x:laneX(lane),y});return true}
function crash(c){const L=RC.L,p=RC.p;c.hit=true;c.spin=(c.x<p.x?-1:1)*(4+Math.random()*3);c.vx=(c.x<p.x?-1:1)*L.lane*3;
 for(let i=0;i<26;i++){const a=Math.random()*Math.PI*2,v=40+Math.random()*160;RC.parts.push({x:(c.x+p.x)/2,y:(c.y+L.py)/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.4+Math.random()*.5,c:['#ffe14f','#ff9a1f','#ffffff','#8a8a9a'][i%4]})}
 if(RC.shield>0){RC.shield=0;RC.inv=.8;fx('rcShieldHit',1,.2);RC.score+=50;RC.msg={t:'BOUCLIER !',c:'#38e1ff',T:0};return}
 RC.lives--;RC.inv=2.2;RC.shake=.5;RC.combo=0;RC.nOn=false;RC.p.kmh*=.45;fx('rcCrash',1,.2);RC.msg={t:RC.lives>0?'AÏE ! '+RC.lives+' VIE'+(RC.lives>1?'S':''):'CRASH !',c:'#ff4f6a',T:0};
 if(RC.lives<=0){RC.phase='fin';RC.finT=1}}
// ---------- mise à jour ----------
function update(dt,inp){dt=Math.min(dt,.05);RC.t+=dt;inp=inp||{};const n=inp.okN||0,ok=RC.okN!=null&&n>RC.okN;RC.okN=n;const q=inp.dirQ&&inp.dirQ.length?inp.dirQ.splice(0):[];if(!RC.L)return;
 let tl=false,tr=false,tn=false;RC.touches.forEach(v=>{if(v=='L')tl=true;else if(v=='R')tr=true;else if(v=='N')tn=true});
 const ctl={l:tl||!!inp.left,r:tr||!!inp.right,up:!!inp.up,down:!!inp.down,nitro:ok||tn&&!RC.tnPrev};RC.tnPrev=tn;
 scroll(dt);
 if(RC.phase=='start'){if(ok)newGame();tickFx(dt);return}
 if(RC.phase=='over'){RC.over.t+=dt;if(q.length){const d=q[q.length-1];RC.sel=d=='down'||d=='right'?1:0}if(ok&&RC.over.t>.8)overChoice(RC.sel);tickFx(dt);return}
 if(RC.phase=='pause'){if(q.length){const d=q[q.length-1];RC.psel=(RC.psel+(d=='down'||d=='right'?1:-1)+3)%3}if(ok)pauseChoice(RC.psel);return}
 if(RC.phase=='count'){RC.cd-=dt;const c=Math.ceil(RC.cd);if(c<RC.lastCd){RC.lastCd=c;if(c>0)fx('rcBeep',0,.1);else{fx('rcBeep',1,.1);RC.phase='run';RC.msg={t:'GO !',c:'#ffe14f',T:0}}}steer(dt,ctl);tickFx(dt);engine();return}
 if(RC.phase=='fin'){RC.finT-=dt;RC.p.kmh=Math.max(0,RC.p.kmh-120*dt);tickFx(dt);engine();if(RC.finT<=0)gameOver();return}
 const L=RC.L,p=RC.p,P=PH[RC.ph];
 // vitesse : progression par phase, haut = accélère, bas = freine, nitro = +70 %
 const f=Math.min(1,(RC.dist-P.d)/Math.max(1,((PH[RC.ph+1]||{d:P.d+4000}).d-P.d)));let tk=P.k0+(P.k1-P.k0)*f;if(ctl.up)tk*=1.18;if(ctl.down)tk*=.6;
 if(ctl.nitro&&!RC.nOn&&RC.nitro>=.2){RC.nOn=true;fx('rcNitro',1,.3);RC.msg={t:'NITRO !',c:'#38e1ff',T:0}}
 if(RC.nOn){tk*=1.7;RC.nitro-=dt*.32;if(RC.nitro<=0){RC.nitro=0;RC.nOn=false}}else RC.nitro=Math.min(1,RC.nitro+dt*.012);
 p.kmh+=(tk-p.kmh)*Math.min(1,dt*(tk>p.kmh?1.4:2.5));
 steer(dt,ctl);
 const dm=p.kmh/3.6*dt*.8;RC.dist+=dm;RC.score+=dm*(RC.nOn?2:1);const ni=phaseAt(RC.dist);if(ni!=RC.ph){RC.ph=ni;RC.msg={t:'PHASE '+(ni+1)+' : '+PH[ni].nom,c:'#ffd166',T:0};fx('rcPhase',1,1)}
 // trafic : défile à la vitesse relative ; changements de voie avec clignotant
 RC.spawnD-=dm;if(RC.spawnD<=0){spawnCar();RC.spawnD=P.gap*(.7+Math.random()*.6)}
 RC.itemD-=dm;if(RC.itemD<=0&&spawnItem('coins'))RC.itemD=90+Math.random()*60;RC.nitroD-=dm;if(RC.nitroD<=0&&spawnItem('nitro'))RC.nitroD=320+Math.random()*120;RC.shieldD-=dm;if(RC.shieldD<=0&&spawnItem('shield'))RC.shieldD=650+Math.random()*250;
 const pxm=L.ppm/.8*.8;for(const c of RC.traffic){if(c.hit){c.x+=c.vx*dt;c.y+=(p.kmh-c.kmh*.3)/3.6*L.ppm*.8*dt;continue}
  const ahead=RC.traffic.find(o=>o!==c&&!o.hit&&(o.lane==c.lane)&&o.y<c.y&&c.y-o.y<L.carH*(TYPES[o.type].l+.6));if(ahead)c.kmh=Math.min(c.kmh,ahead.kmh);
  c.y+=(p.kmh-c.kmh)/3.6*L.ppm*.8*dt;
  if(c.to==null&&P.lc&&c.y>L.top&&c.y<L.py-L.carH*2.5&&Math.random()<P.lc*dt){const t=c.lane+(Math.random()<.5?-1:1);if(t>=0&&t<4&&free(t,c.y,L.carH*3))c.to=t,c.blink=.9}
  if(c.to!=null){if(c.blink>0)c.blink-=dt;else{const tx=laneX(c.to);c.x+=Math.sign(tx-c.x)*Math.min(Math.abs(tx-c.x),L.lane*1.6*dt);if(Math.abs(c.x-tx)<.5){c.lane=c.to;c.to=null}}}
  // dépassement réussi
  if(!c.passed&&c.y-L.carH*TYPES[c.type].l/2>L.py+L.carH*.6){c.passed=true;RC.combo++;const m=1+Math.min(4,Math.floor(RC.combo/5))*.5;RC.score+=10*m;RC.pass++;fx('rcPass',Math.min(1,p.kmh/200),.12);if(RC.combo%5==0){RC.msg={t:'COMBO X'+m.toFixed(1).replace('.0','').replace('.',','),c:'#ff9ad0',T:0};fx('rcCombo',RC.combo,.1)}}}
 RC.traffic=RC.traffic.filter(c=>c.y<L.bot+L.carH*3&&c.y>L.top-L.carH*6&&c.x>-L.carW*3&&c.x<RC.W+L.carW*3);
 // bonus
 for(const it of RC.items){it.y+=p.kmh/3.6*L.ppm*.8*dt;if(Math.abs(it.x-p.x)<L.carW*.8&&Math.abs(it.y-L.py)<L.carH*.6&&!it.got){it.got=true;
  if(it.kind=='coin'){RC.score+=50;RC.coins++;fx('rcCoin',1,.04);pop('+50',it.x,it.y,'#ffe14f')}if(it.kind=='nitro'){RC.nitro=Math.min(1,RC.nitro+.5);RC.score+=100;fx('rcNitroGet',1,.2);RC.msg={t:'+ NITRO',c:'#38e1ff',T:0}}
  if(it.kind=='shield'){RC.shield=8;RC.score+=100;fx('rcShieldGet',1,.2);RC.msg={t:'BOUCLIER 8 S',c:'#7cff6b',T:0}}}}
 RC.items=RC.items.filter(i=>!i.got&&i.y<L.bot+L.carH);
 // collisions réelles (rectangles légèrement réduits)
 if(RC.inv>0)RC.inv-=dt;if(RC.shield>0)RC.shield=Math.max(0,RC.shield-dt);
 const pw=L.carW*.86,ph=L.carH*.9;for(const c of RC.traffic){if(c.hit)continue;const T=TYPES[c.type],cw=L.carW*T.w*.86,ch=L.carH*T.l*.92;
  if(Math.abs(c.x-p.x)<(pw+cw)/2&&Math.abs(c.y-L.py)<(ph+ch)/2){if(RC.inv>0&&RC.shield<=0){continue}crash(c);break}}
 tickFx(dt);engine();if(RC.nOn&&Math.random()<.6)RC.parts.push({x:p.x+(Math.random()-.5)*L.carW*.5,y:L.py+L.carH*.55,vx:(Math.random()-.5)*20,vy:120+Math.random()*80,l:.25,c:Math.random()<.5?'#38e1ff':'#ffffff'})}
function steer(dt,ctl){const L=RC.L,p=RC.p,vmax=L.lane*6.5;let ax=(ctl.r?1:0)-(ctl.l?1:0);
 if(p.tx!=null&&!ax){const d=p.tx-p.x;p.vx=Math.sign(d)*Math.min(Math.abs(d)/dt,vmax*1.2)}else{if(ax)p.vx+=ax*vmax*9*dt;else p.vx*=Math.pow(.0008,dt);p.vx=Math.max(-vmax,Math.min(vmax,p.vx))}
 p.x+=p.vx*dt;const lo=L.rx0+L.carW/2+2,hi=L.rx1-L.carW/2-2;if(p.x<lo){p.x=lo;p.vx=0}if(p.x>hi){p.x=hi;p.vx=0}}
function scroll(dt){const L=RC.L,v=(RC.p&&RC.phase!='start'?RC.p.kmh:120)/3.6*L.ppm*.8;RC.off=((RC.off||0)+v*dt);
 // décor des bas-côtés
 RC.decoT=(RC.decoT||0)-v*dt;if(RC.decoT<=0){RC.decoT=L.carH*(.5+Math.random()*1.2);const side=Math.random()<.5?0:1,sw=L.rx0,xx=side?L.rx1+4+Math.random()*Math.max(4,sw-14):4+Math.random()*Math.max(4,sw-14);RC.deco.push({x:xx,y:L.top-40,k:['arbre','arbre','buisson','lampadaire','rocher','panneau'][Math.random()*6|0],s:.7+Math.random()*.6})}
 RC.deco.forEach(d=>d.y+=v*dt);RC.deco=RC.deco.filter(d=>d.y<RC.H+40)}
function engine(){try{if(typeof JEUSON=='undefined')return;if(!RC.eng)RC.eng=JEUSON.engine();if(RC.eng){const on=RC.phase=='run'||RC.phase=='count'||RC.phase=='fin';RC.eng.set(38+(RC.p?RC.p.kmh:0)*.55+(RC.nOn?40:0),on?.06:0)}}catch(e){}}
function pop(t,x,y,c){RC.parts.push({txt:t,x,y,vx:0,vy:-40,l:.8,c})}
function tickFx(dt){RC.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.92;if(!q.txt)q.vy*=.92;q.l-=dt});RC.parts=RC.parts.filter(q=>q.l>0);if(RC.msg){RC.msg.T+=dt;if(RC.msg.T>1.5)RC.msg=null}if(RC.shake>0)RC.shake=Math.max(0,RC.shake-dt)}
function gameOver(){const score=Math.floor(RC.score),d=RC.api?RC.api.data():{};const prev=d.best||0,rec=RC.api?RC.api.record(score):false;RC.phase='over';RC.sel=0;RC.over={t:0,rec,prev};
 if(RC.api){d.maxDist=Math.max(d.maxDist||0,Math.floor(RC.dist));RC.api.save()}fx('rcOver',1,1);if(rec)setTimeout(()=>{if(RC.phase=='over')fx('rcRecord',1,1)},1600);try{JEUSON.level(RC.son==0?.4:0)}catch(e){}}
function overChoice(k){fx('rcClick',1);if(k==0)newGame();else RC.api&&RC.api.exit()}
function pauseChoice(k){fx('rcClick',1);if(k==0){RC.phase=RC.prevPhase||'run';music(.9)}else if(k==1)toggleSon();else{RC.api&&RC.api.exit()}}
function toggleSon(){RC.son=(RC.son+1)%3;if(RC.api){RC.api.data().son=RC.son;RC.api.save()}music(RC.phase=='pause'?.35:.9);RC.msg={t:['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][RC.son],c:'#ffffff',T:0}}
function pause(){if(RC.phase!='run'&&RC.phase!='count')return;RC.prevPhase=RC.phase;RC.phase='pause';RC.psel=0;RC.touches.clear();try{JEUSON.level(RC.son==0?.35:0)}catch(e){}if(RC.eng)RC.eng.set(40,0)}
// ---------- rendu ----------
function draw(x,w,h){if(!RC.L||RC.W!=w||RC.H!=h)layout(w,h);x.imageSmoothingEnabled=false;const L=RC.L,P=PH[RC.ph||0],sh=RC.shake>0?Math.round((Math.random()-.5)*8*RC.shake):0;
 x.save();x.translate(sh,0);
 // bas-côtés : herbe à bandes défilantes, décor
 R(x,0,0,w,h,P.sky[0]);const band=L.carH*1.2,off=(RC.off||0)%(band*2);for(let y=-band*2+off;y<h;y+=band*2)R(x,0,y,w,band,P.sky[1]);
 RC.deco.forEach(d=>deco(x,d,P));
 // route : asphalte, bordures rouges et blanches, lignes animées
 R(x,L.rx0-6,0,L.roadW+12,h,'#1d1a26');R(x,L.rx0,0,L.roadW,h,P.sky[2]);for(let i=0;i<60;i++){const yy=((i*97.3+(RC.off||0))%h);R(x,L.rx0+(i*53)%L.roadW,yy,1,1,'rgba(255,255,255,.08)')}
 const cb=Math.max(4,Math.round(L.lane*.1)),cl=L.carH*.5,co=(RC.off||0)%(cl*2);for(let y=-cl*2+co;y<h;y+=cl*2){R(x,L.rx0-cb,y,cb,cl,'#ff3348');R(x,L.rx0-cb,y+cl,cb,cl,'#ffffff');R(x,L.rx1,y,cb,cl,'#ff3348');R(x,L.rx1,y+cl,cb,cl,'#ffffff')}
 R(x,L.rx0+2,0,2,h,'#f4f4f4');R(x,L.rx1-4,0,2,h,'#f4f4f4');const dl=L.carH*.65,doff=(RC.off||0)%(dl*2);for(let i=1;i<4;i++)for(let y=-dl*2+doff;y<h;y+=dl*2)R(x,L.rx0+L.lane*i-1,y,2,dl,'#f4f4f4');
 if(RC.ph==3){x.globalAlpha=.6;R(x,L.rx0-1,0,1,h,'#ff2f8a');R(x,L.rx1,0,1,h,'#38e1ff');x.globalAlpha=1}
 // bonus
 RC.items.forEach(it=>item(x,it));
 // trafic et joueur
 RC.traffic.forEach(c=>{const s=carSprite(c.type,c.col,false);x.save();x.translate(Math.round(c.x),Math.round(c.y));if(c.hit)x.rotate(RC.t*c.spin);x.drawImage(s,-s.width/2,-s.height/2);
  if(c.to!=null&&Math.floor(RC.t*6)%2){const side=c.to>c.lane?1:-1;R(x,side*s.width/2-2,-s.height/2+2,3,3,'#ffb347');R(x,side*s.width/2-2,s.height/2-5,3,3,'#ffb347')}x.restore()});
 if(RC.p&&RC.phase!='start')player(x);
 RC.parts.forEach(q=>{x.globalAlpha=Math.min(1,q.l*3);if(q.txt)axCText(x,q.txt,q.x,q.y,q.c,1,'#05040e');else R(x,q.x,q.y,2,2,q.c);x.globalAlpha=1});
 // vitesse : lignes pendant le nitro
 if(RC.nOn){x.globalAlpha=.35;for(let i=0;i<14;i++){const xx=(i*71+RC.t*400)%w,yy=((i*131)+RC.t*1500)%h;R(x,xx,yy,1,L.carH*.8,'#ffffff')}x.globalAlpha=.08;R(x,0,0,w,h,'#38e1ff');x.globalAlpha=1}
 x.restore();
 hud(x);dash(x);
 if(RC.msg&&RC.phase!='start'&&RC.phase!='over'){const m=RC.msg,sc=Math.max(1,Math.min(3,Math.floor((w-12)/axTW(m.t,1))));x.globalAlpha=Math.min(1,(1.5-m.T)*3);axCText(x,m.t,w/2,Math.round(L.top+(L.py-L.top)*.32-m.T*10),m.c,sc,'#05040e');x.globalAlpha=1}
 if(RC.phase=='count'){const c=Math.ceil(RC.cd);if(c>0&&c<=3){const sc=Math.max(3,Math.min(10,Math.floor(Math.min(w,h)/18)));axCText(x,String(c),w/2,Math.round(h*.38),'#ffe14f',sc,'#05040e')}}
 if(RC.phase=='start')startScreen(x);if(RC.phase=='pause')pauseScreen(x);if(RC.phase=='over')overScreen(x)}
function deco(x,d,P){const s=RC.L.carH/70*d.s,night=RC.ph>=3;if(d.k=='arbre'){D(x,d.x+3*s,d.y+4*s,13*s,'rgba(0,0,0,.25)');D(x,d.x,d.y,13*s,night?'#1f4a3a':'#2e7a3a');D(x,d.x-3*s,d.y-3*s,8*s,night?'#2a5e48':'#3f9a4a');D(x,d.x-5*s,d.y-5*s,3*s,night?'#3a7a5a':'#6fca5a')}
 if(d.k=='buisson'){D(x,d.x,d.y,7*s,night?'#24503a':'#3a8a3a');D(x,d.x+5*s,d.y+2*s,5*s,night?'#2a5e48':'#4fa84a');D(x,d.x-1,d.y-2,2*s,'#ff9ad0')}
 if(d.k=='rocher'){D(x,d.x,d.y,6*s,'#7a7488');D(x,d.x-2*s,d.y-2*s,3*s,'#9a94a8')}
 if(d.k=='lampadaire'){R(x,d.x-1,d.y-10*s,3,20*s,'#4a4e5a');D(x,d.x,d.y-10*s,3*s,night?'#fff3b0':'#c8ccd8');if(night){x.globalAlpha=.25;D(x,d.x,d.y-10*s,14*s,'#ffe9a6');x.globalAlpha=1}}
 if(d.k=='panneau'){R(x,d.x-1,d.y,2,10*s,'#4a4e5a');R(x,d.x-7*s,d.y-6*s,14*s,8*s,'#2d6cdf');R(x,d.x-5*s,d.y-4*s,10*s,2,'#ffffff')}}
function item(x,it){const L=RC.L,r=Math.max(4,L.carW*.32);if(it.kind=='coin'){const wv=Math.abs(Math.cos(RC.t*6+it.y*.05));x.fillStyle='#05040e';D(x,it.x,it.y,r+1,'#05040e');for(let j=-r;j<=r;j++){const ww=Math.round(Math.sqrt(r*r-j*j)*wv);R(x,it.x-ww,it.y+j,2*ww+1,1,j<0?'#ffe14f':'#e8a91f')}if(wv>.5)R(x,it.x-1,it.y-r*.5,2,r,'#fff6c8')}
 if(it.kind=='nitro'){const w=r*1.4,h=r*2.4;R(x,it.x-w/2-1,it.y-h/2-1,w+2,h+2,'#05040e');R(x,it.x-w/2,it.y-h/2,w,h,'#2f7bff');R(x,it.x-w/2,it.y-h/2,w,3,'#a9c8ff');R(x,it.x-2,it.y-h/2-3,4,3,'#c8ccd8');axCText(x,'N',it.x,it.y-3,'#ffffff');x.globalAlpha=.3+.2*Math.sin(RC.t*8);D(x,it.x,it.y,r*2,'#38e1ff');x.globalAlpha=1}
 if(it.kind=='shield'){D(x,it.x,it.y,r*1.3+1,'#05040e');D(x,it.x,it.y,r*1.3,'#4fd16b');D(x,it.x,it.y,r*.9,'#1a5a2a');axCText(x,'S',it.x,it.y-3,'#7cff6b');x.globalAlpha=.3+.2*Math.sin(RC.t*8);D(x,it.x,it.y,r*2,'#7cff6b');x.globalAlpha=1}}
function player(x){const L=RC.L,p=RC.p,s=carSprite('sportive','#ff2f8a',true);if(RC.inv>0&&RC.shield<=0&&Math.floor(RC.t*12)%2)return;
 const tilt=Math.max(-.12,Math.min(.12,p.vx/(L.lane*40)));
 // flammes du nitro
 if(RC.nOn){for(const sx of[-.25,.25]){const fl=L.carH*(.35+Math.random()*.25);for(let i=0;i<fl;i++){const k=i/fl;R(x,p.x+sx*L.carW-2+(Math.random()-.5)*2,L.py+L.carH*.5+i,4*(1-k)+1,1,k<.3?'#ffffff':k<.6?'#38e1ff':'#2f7bff')}}}
 x.save();x.translate(Math.round(p.x),Math.round(L.py));x.rotate(tilt);x.drawImage(s,-s.width/2,-s.height/2);x.restore();
 if(RC.shield>0){const a=RC.shield<2?(Math.floor(RC.t*8)%2?.6:.2):.5+.2*Math.sin(RC.t*6);x.globalAlpha=a;const rr=L.carH*.68,n=Math.round(rr*7);for(let i=0;i<n;i++){const an=i/n*Math.PI*2;R(x,p.x+Math.cos(an)*rr*.7,L.py+Math.sin(an)*rr,2,2,'#7cff6b')}x.globalAlpha=1}}
function heart(x,cx,cy,s,c){const P=['01100110','11111111','11111111','01111110','00111100','00011000'];P.forEach((r,j)=>[...r].forEach((v,i)=>{if(v=='1')R(x,cx+i*s,cy+j*s,s,s,c)}))}
function hud(x){const L=RC.L,w=RC.W,hb=L.hb;R(x,0,0,w,hb,'rgba(10,6,30,.86)');R(x,0,hb-1,w,1,'#ff2f8a');const y=Math.round(hb/2-3);
 const d=RC.api?RC.api.data():{},best=Math.max(d.best||0,RC.phase=='start'?0:Math.floor(RC.score||0));
 if(RC.phase=='start'){axText(x,'BEST '+fmt(d.best||0),6,y,'#38e1ff');}
 else{const items=[[fmt(RC.score),'#ffe14f'],[fmt(RC.dist)+' M','#ffffff'],[Math.round(RC.p.kmh)+' KM/H','#7cff6b']];let xx=6;const avail=L.bS.x-8;
  items.forEach(([t,c],i)=>{if(xx+axTW(t)<avail){axText(x,t,xx,y,c);xx+=axTW(t)+10}});
  // vies
  const hs=Math.max(1,Math.round(hb/16));for(let i=0;i<3;i++)heart(x,w-L.bP.w*2-14-(3-i)*(9*hs),hb+4,hs,i<RC.lives?'#ff3f7a':'#3a2a4a');
  // jauge de nitro
  const gw=Math.min(90,w*.26),gx=6,gy=hb+4;R(x,gx-1,gy-1,gw+2,8,'#05040e');R(x,gx,gy,gw,6,'#1a1440');R(x,gx,gy,gw*RC.nitro,6,RC.nOn?'#ffffff':RC.nitro>=.2?'#38e1ff':'#2a5a8a');axText(x,'NITRO',gx+gw+4,gy-1,RC.nitro>=.2?'#38e1ff':'#5a6a8a');
  if(RC.combo>=5)axText(x,'COMBO '+RC.combo,gx,gy+10,'#ff9ad0');if(RC.shield>0)axText(x,'BOUCLIER '+Math.ceil(RC.shield),gx,gy+20,'#7cff6b')}
 // boutons son et pause
 const B=(b,on)=>{R(x,b.x,b.y,b.w,b.h,on?'#ffe14f':'#2a2160');R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.35)')};B(L.bP,RC.phase=='pause');const c1='#ffffff';R(x,L.bP.x+L.bP.w*.3,L.bP.y+L.bP.h*.25,L.bP.w*.14,L.bP.h*.5,RC.phase=='pause'?'#1a0c20':c1);R(x,L.bP.x+L.bP.w*.56,L.bP.y+L.bP.h*.25,L.bP.w*.14,L.bP.h*.5,RC.phase=='pause'?'#1a0c20':c1);
 B(L.bS,false);const sx=L.bS.x,sy=L.bS.y,sw=L.bS.w;R(x,sx+sw*.2,sy+sw*.38,sw*.18,sw*.24,c1);for(let i=0;i<sw*.3;i++)R(x,sx+sw*.38+i,sy+sw*.38-i*.6,1,sw*.24+i*1.2,c1);
 if(RC.son>=1){R(x,sx+sw*.75,sy+sw*.3,1,sw*.4,'#ff4f6a');}if(RC.son==2){for(let i=0;i<sw*.6;i++)R(x,sx+sw*.2+i,sy+sw*.2+i,2,2,'#ff4f6a')}else{R(x,sx+sw*.78,sy+sw*.35,1,sw*.3,RC.son?'#5a5470':c1)}}
function dash(x){const L=RC.L,w=RC.W;R(x,0,L.bot,w,RC.H-L.bot,'#120c2e');R(x,0,L.bot,w,1,'#38e1ff');
 const arrow=(b,dir,on)=>{R(x,b.x,b.y+2,b.w,b.h,'#05040e');R(x,b.x,b.y,b.w,b.h,on?'#38e1ff':'#2a2160');R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.35)');const cx=b.x+b.w/2,cy=b.y+b.h/2,s=Math.min(b.w,b.h)*.32;for(let i=0;i<s;i++){const hh=Math.round((s-i)*.9);R(x,cx+(dir<0?s/2-i:-s/2+i),cy-hh,1,2*hh+1,on?'#05040e':'#ffffff')}};
 let tl=false,tr=false,tn=false;RC.touches.forEach(v=>{if(v=='L')tl=true;if(v=='R')tr=true;if(v=='N')tn=true});arrow(L.bL,-1,tl);arrow(L.bR,1,tr);
 const N=L.bN,ready=RC.nitro>=.2&&!RC.nOn,on=tn||RC.nOn;D(x,N.x,N.y+3,N.r+2,'#05040e');D(x,N.x,N.y,N.r+2,'#c8ccd8');D(x,N.x,N.y-(on?0:2),N.r,ready||on?'#2f7bff':'#3a3a5a');D(x,N.x-N.r*.3,N.y-N.r*.35-(on?0:2),N.r*.3,'#a9c8ff');
 // anneau de jauge autour du bouton
 const n=Math.round(N.r*7);for(let i=0;i<n;i++){const a=-Math.PI/2+i/n*Math.PI*2;if(i/n>(RC.nitro||0))continue;R(x,N.x+Math.cos(a)*(N.r+5),N.y+Math.sin(a)*(N.r+5),2,2,'#38e1ff')}
 axCText(x,'NITRO',N.x,N.y-(on?0:2)-3,'#ffffff',1,'#05040e')}
function panel(x,hh){const w=RC.W,h=RC.H,pw=Math.min(w-20,260),ph=Math.min(h-40,hh),a={x:Math.round(w/2-pw/2),y:Math.round(h/2-ph/2),w:pw,h:ph};R(x,0,0,w,h,'rgba(6,4,20,.55)');R(x,a.x-2,a.y-2,a.w+4,a.h+4,'#ff2f8a');R(x,a.x,a.y,a.w,a.h,'rgba(10,6,34,.95)');return a}
function btn(x,b,label,col,dk,sel){R(x,b.x,b.y+2,b.w,b.h,dk);R(x,b.x,b.y,b.w,b.h,col);R(x,b.x,b.y,b.w,1,'rgba(255,255,255,.45)');if(sel){x.globalAlpha=.6+.4*Math.sin(RC.t*8);R(x,b.x-2,b.y-2,b.w+4,1,'#fff');R(x,b.x-2,b.y+b.h+3,b.w+4,1,'#fff');R(x,b.x-2,b.y-2,1,b.h+6,'#fff');R(x,b.x+b.w+1,b.y-2,1,b.h+6,'#fff');x.globalAlpha=1}axCText(x,label,b.x+b.w/2,b.y+Math.round((b.h-7)/2),'#1a0c20',1)}
function startScreen(x){const w=RC.W,h=RC.H,L=RC.L;R(x,0,L.top,w,L.bot-L.top,'rgba(6,4,20,.45)');const ts=Math.max(2,Math.min(5,Math.floor((w-16)/axTW('RACING',1))));let y=Math.round(L.top+(L.bot-L.top)*.1);
 axCText(x,'MINI',w/2,y,'#38e1ff',Math.max(1,ts-1),'#05040e');y+=7*Math.max(1,ts-1)+4;axCText(x,'RACING',w/2,y,'#ff2f8a',ts,'#05040e','#ffd166');y+=7*ts+12;
 // voiture animée
 const s=carSprite('sportive','#ff2f8a',true),cy=y+s.height/2+Math.sin(RC.t*5)*3;for(const sx of[-.25,.25]){const fl=L.carH*(.3+Math.random()*.2);for(let i=0;i<fl;i++){const k=i/fl;R(x,w/2+sx*L.carW-2,cy+s.height/2+i,4*(1-k)+1,1,k<.4?'#ffffff':'#38e1ff')}}
 x.drawImage(s,Math.round(w/2-s.width/2),Math.round(cy-s.height/2));y+=s.height+L.carH*.4+12;
 const d=RC.api?RC.api.data():{};axCText(x,'BEST '+fmt(d.best||0)+(d.maxDist?'  ·  '+fmt(d.maxDist)+' M':''),w/2,y,'#38e1ff');y+=16;
 const bw=Math.min(w-40,120),bh=18;RC.startBtn={x:Math.round(w/2-bw/2),y,w:bw,h:bh};btn(x,RC.startBtn,'> JOUER','#ffd23f','#b8860b',true);y+=bh+14;
 const lines=RC.W>RC.H?['< > OU FLÈCHES : TOURNER','HAUT : ACCÉLÉRER · BAS : FREINER','A / ESPACE / NITRO : TURBO','P : PAUSE']:['< > : TOURNER','GLISSE SUR LA ROUTE','HAUT / BAS : VITESSE','NITRO : TURBO'];
 lines.forEach(l=>{if(axTW(l)<=w-10&&y<L.bot-8){axCText(x,l,w/2,y,'#c9c4f0');y+=10}})}
function pauseScreen(x){const a=panel(x,130),cx=a.x+a.w/2;let y=a.y+12;axCText(x,'PAUSE',cx,y,'#ffffff',2,'#05040e');y+=26;const bw=Math.min(a.w-20,200),bh=18;
 RC.pauseBtns=[0,1,2].map(i=>({x:Math.round(cx-bw/2),y:y+i*(bh+8),w:bw,h:bh}));btn(x,RC.pauseBtns[0],'REPRENDRE','#2f7bff','#1a4ac0',RC.psel==0);btn(x,RC.pauseBtns[1],['SON : TOUT','SON : EFFETS SEULS','SON : COUPÉ'][RC.son],'#4fd16b','#2a8a3a',RC.psel==1);btn(x,RC.pauseBtns[2],'SALLE D’ARCADE','#9a6bff','#5a35b0',RC.psel==2)}
function overScreen(x){const o=RC.over,a=panel(x,170),cx=a.x+a.w/2,d=RC.api?RC.api.data():{};let y=a.y+10;axCText(x,'GAME OVER',cx,y,'#ff4f6a',2,'#05040e');y+=24;
 axCText(x,'SCORE '+fmt(RC.score),cx,y,'#ffe14f',1);y+=11;axCText(x,'DISTANCE '+fmt(RC.dist)+' M',cx,y,'#ffffff');y+=11;axCText(x,'DÉPASSEMENTS '+RC.pass+' · PIÈCES '+RC.coins,cx,y,'#c9c4f0');y+=11;
 if(o.rec){x.globalAlpha=.6+.4*Math.sin(RC.t*8);axCText(x,'NOUVEAU RECORD !',cx,y,'#7cff6b',1,'#05040e');x.globalAlpha=1}else axCText(x,'BEST '+fmt(d.best||0),cx,y,'#38e1ff');y+=16;
 const bw=Math.min(a.w-20,200),bh=18;RC.overBtns=[{x:Math.round(cx-bw/2),y,w:bw,h:bh},{x:Math.round(cx-bw/2),y:y+bh+8,w:bw,h:bh}];if(o.t>.8){btn(x,RC.overBtns[0],'REJOUER','#2f7bff','#1a4ac0',RC.sel==0);btn(x,RC.overBtns[1],'RETOUR À LA SALLE D’ARCADE','#9a6bff','#5a35b0',RC.sel==1)}}
// ---------- toucher ----------
const inR=(b,x,y)=>b&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function pointer(type,sx,sy,id){if(id==null)id=0;const L=RC.L;if(!L)return;try{JEUSON.ctx()}catch(e){}
 if(type=='down'){if(RC.phase=='start'&&inR(RC.startBtn,sx,sy)){newGame();return}
  if(RC.phase=='over'&&RC.over.t>.8){const k=(RC.overBtns||[]).findIndex(b=>inR(b,sx,sy));if(k>=0)overChoice(k);return}
  if(RC.phase=='pause'){const k=(RC.pauseBtns||[]).findIndex(b=>inR(b,sx,sy));if(k>=0){RC.psel=k;pauseChoice(k)}return}
  if(inR({x:L.bP.x-4,y:0,w:L.bP.w+8,h:L.hb+4},sx,sy)){pause();return}if(inR({x:L.bS.x-4,y:0,w:L.bS.w+8,h:L.hb+4},sx,sy)){toggleSon();return}
  if(Math.hypot(sx-L.bN.x,sy-L.bN.y)<L.bN.r*1.4){RC.touches.set(id,'N');return}if(inR(L.bL,sx,sy)){RC.touches.set(id,'L');return}if(inR(L.bR,sx,sy)){RC.touches.set(id,'R');return}
  // glisser sur la route : la voiture va sous le doigt
  if(sy>L.top&&sy<L.bot&&RC.p){RC.touches.set(id,'D');RC.p.tx=sx}return}
 if(type=='move'&&RC.touches.get(id)=='D'&&RC.p){RC.p.tx=sx;return}
 if(type=='up'){if(RC.touches.get(id)=='D'&&RC.p)RC.p.tx=null;RC.touches.delete(id)}}
function key(e){if(!RC.api)return;if(e.code=='KeyP'){e.preventDefault();if(RC.phase=='pause')pauseChoice(0);else pause()}if(e.code=='KeyM'){toggleSon()}}
// ---------- cycle de vie ----------
const Racing={start(api){RC.api=api;const d=api.data();RC.son=d.son||0;RC.phase='start';RC.L=null;RC.touches.clear();RC.okN=null;RC.traffic=[];RC.items=[];RC.parts=[];RC.deco=[];RC.msg=null;RC.over=null;RC.p=null;RC.score=0;RC.dist=0;RC.ph=0;
  addEventListener('keydown',key);music(.7)},
 update,draw,pointer,
 stop(){removeEventListener('keydown',key);if(RC.eng){RC.eng.stop();RC.eng=null}try{JEUSON.sfxLevel(1);JEUSON.stop()}catch(e){}RC.api=null;RC.touches.clear();RC.traffic=[];RC.items=[];RC.parts=[];RC.phase='start';RC.L=null},
 _state:RC};
ARC.register('racing',Racing);
})();
