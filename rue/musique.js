// ===== SON DE LITTLE LIFE : gestionnaire audio central (musique, effets, ambiances) =====
// Un seul contexte audio pour tout le jeu. Trois bus avec volume propre (musique, effets, ambiances) et une coupure générale,
// sauvegardés dans N.audio. Les musiques sont composées en direct (aucun fichier, aucune œuvre protégée) : instruments
// modernes (piano électrique, piano, nappes, cordes, basse ronde, guitare pincée, cloches, synthés), batterie lo-fi / house /
// pop, réverbération, structure en sections (intro, couplets, pont, respiration) avec mélodies et variations renouvelées à
// chaque passage : la boucle ne se remarque pas. Changement de lieu : fondu sortant, puis fondu entrant (durées réglables),
// jamais deux musiques en même temps, pas de redémarrage si l'on reste dans la même pièce.
const LLSON=(()=>{
const mf=m=>440*Math.pow(2,(m-69)/12);
let ctx=null,G=null,live=null,timer=null,ambT=null;
// ---------- graphe audio (le même sert au rendu hors ligne des tests) ----------
function irBuf(c,sec,decay){const n=Math.round(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const k=1-i/n;lp=lp*.6+(Math.random()*2-1)*.4;d[i]=lp*Math.pow(k,decay)}}return b}
function noiseBuf(c){const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b}
function crackleBuf(c){const n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++){d[i]=(Math.random()*2-1)*.012;if(Math.random()<.0009){const a=(Math.random()*.5+.2)*(Math.random()<.5?-1:1);for(let j=0;j<18&&i+j<n;j++)d[i+j]+=a*Math.exp(-j/3)}}return b}
function graph(c,dest,live){const g={c,nz:noiseBuf(c),cr:crackleBuf(c),live:!!live};
 g.master=c.createGain();const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=8;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.25;const lim=c.createDynamicsCompressor();lim.threshold.value=-4;lim.knee.value=1;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.12;g.master.connect(comp);comp.connect(lim);const trim=c.createGain();trim.gain.value=.8;lim.connect(trim);trim.connect(dest);
 g.musBus=c.createGain();g.musLvl=c.createGain();g.musFade=c.createGain();g.musFade.gain.value=0;g.musIn=c.createGain();g.musIn.gain.value=.9;
 g.musFade.connect(g.musLvl);g.musLvl.connect(g.musBus);g.musBus.connect(g.master);
 g.hp=c.createBiquadFilter();g.hp.type='highpass';g.hp.frequency.value=38;g.hp.Q.value=.7;g.hs=c.createBiquadFilter();g.hs.type='highshelf';g.hs.frequency.value=2500;g.hs.gain.value=5;g.musIn.connect(g.hp);g.hp.connect(g.hs);g.hs.connect(g.musFade);g.rev=c.createConvolver();g.rev.buffer=irBuf(c,1.4,3.2);g.revIn=c.createGain();g.revIn.gain.value=.18;g.revIn.connect(g.rev);g.rev.connect(g.musFade);
 g.drumIn=c.createBiquadFilter();g.drumIn.type='lowpass';g.drumIn.frequency.value=9000;g.drumIn.Q.value=.3;g.drumG=c.createGain();g.drumIn.connect(g.drumG);g.drumG.connect(g.musIn);
 g.sfxBus=c.createGain();g.sfxIn=c.createBiquadFilter();g.sfxIn.type='lowpass';g.sfxIn.frequency.value=9500;g.sfxIn.connect(g.sfxBus);g.sfxBus.connect(g.master);
 g.ambBus=c.createGain();g.ambFade=c.createGain();g.ambFade.gain.value=0;g.ambIn=c.createGain();g.ambIn.connect(g.ambFade);g.ambFade.connect(g.ambBus);g.ambBus.connect(g.master);
 return g}
// ---------- briques d'instruments (t : instant, d : durée, v : volume) ----------
// sorties partagées : quelques positions stéréo × quelques niveaux de réverbération, créées une fois
function bus(g,pan,rev,dst){const P=Math.round(cl(pan||0,-.8,.8)*5)/5,Rv=[0,.25,.35,.45,.6].reduce((a,b)=>Math.abs(b-(rev||0))<Math.abs(a-(rev||0))?b:a),k=P+'|'+Rv+'|'+(dst?'d':'m');g.bs=g.bs||{};let n=g.bs[k];
 if(!n){n=g.c.createGain();let x=n;if(g.c.createStereoPanner&&P){const p=g.c.createStereoPanner();p.pan.value=P;n.connect(p);x=p}x.connect(dst||g.musIn);if(Rv){const s=g.c.createGain();s.gain.value=Rv;x.connect(s);s.connect(g.revIn)}g.bs[k]=n}return n}
const cl=(v,a,b)=>v<a?a:v>b?b:v;
function out(g,o){o.node.connect(bus(g,o.pan,o.rev))}
function env(g,t,a,v,d,r){const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+a);e.gain.setTargetAtTime(v*.0001,t+a+Math.max(0,d-a),r||d/4);return e}
function osc(g,type,f,t,stop){const o=g.c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.start(t);o.stop(stop);return o}
const I={
 // piano électrique (type Rhodes) : synthèse FM douce, tine brillant à l'attaque, trémolo léger
 ep(g,n,t,d,v,o){const f=mf(n),end=t+d+.6,c=osc(g,'sine',f,t,end),m=osc(g,'sine',f,t,end),mi=g.c.createGain();mi.gain.setValueAtTime(f*(o&&o.bright||1.6),t);mi.gain.exponentialRampToValueAtTime(f*.12,t+.45);m.connect(mi);mi.connect(c.frequency);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.006);e.gain.exponentialRampToValueAtTime(v*.35,t+.35);e.gain.exponentialRampToValueAtTime(.0001,t+d+.5);c.connect(e);
  const tn=osc(g,'sine',f*4,t,t+.25),te=g.c.createGain();te.gain.setValueAtTime(v*.12,t);te.gain.exponentialRampToValueAtTime(.0001,t+.2);tn.connect(te);te.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.35})},
 // piano : trois partiels à décroissances différentes, attaque nette
 piano(g,n,t,d,v,o){const f=mf(n),end=t+d+1.2,e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.004);e.gain.exponentialRampToValueAtTime(v*.3,t+.6);e.gain.exponentialRampToValueAtTime(.0001,t+d+1);
  [[1,1,'triangle'],[2,.35,'sine'],[3,.12,'sine'],[1.003,.4,'sine']].forEach(([k,a,ty])=>{const x=osc(g,ty,f*k,t,end),gg=g.c.createGain();gg.gain.value=a;x.connect(gg);gg.connect(e)});
  const lp=g.c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(1400,t+1);e.connect(lp);out(g,{node:lp,pan:(o&&o.pan)||0,rev:.4})},
 // nappe : deux scies désaccordées filtrées, attaque lente
 pad(g,n,t,d,v,o){const f=mf(n),end=t+d+2,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=.4;const br=(o&&o.br)||1100;lp.frequency.setValueAtTime(br*.5,t);lp.frequency.linearRampToValueAtTime(br,t+(o&&o.att||1));
  const e=g.c.createGain(),a=(o&&o.att)||1;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+a);e.gain.setValueAtTime(v,t+Math.max(a,d));e.gain.linearRampToValueAtTime(0,t+d+.5);
  for(const dt of[-7,7]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;x.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.55})},
 // cordes : comme la nappe, plus lente, avec vibrato
 strings(g,n,t,d,v,o){const f=mf(n),end=t+d+2.5,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=(o&&o.br)||1600;lp.Q.value=.5;const e=g.c.createGain(),a=(o&&o.att)||1.4;
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+a);e.gain.setValueAtTime(v,t+Math.max(a,d));e.gain.linearRampToValueAtTime(0,t+d+.6);const vib=osc(g,'sine',5,t,end),vg=g.c.createGain();vg.gain.value=f*.004;vib.connect(vg);
  for(const dt of[-9,0,9]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;vg.connect(x.frequency);x.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.6})},
 // basse ronde : sinus + triangle à l'octave, filtrée
 bass(g,n,t,d,v,o){const f=mf(n),end=t+d+.3,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=(o&&o.br)||950;const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.01);
  e.gain.setTargetAtTime(v*.55,t+.05,.15);e.gain.setTargetAtTime(.0001,t+d,.06);const a=osc(g,'sine',f,t,end),b=osc(g,'triangle',f*2,t,end),bg=g.c.createGain();bg.gain.value=.5;a.connect(lp);b.connect(bg);bg.connect(lp);lp.connect(e);out(g,{node:e,pan:0,rev:0})},
 // sub de house : sinus court et rond
 sub(g,n,t,d,v){const f=mf(n),e=env(g,t,.008,v,d,.05),a=osc(g,'sine',f,t,t+d+.3);a.connect(e);out(g,{node:e,pan:0,rev:0})},
 // guitare / pluck : scie + triangle, filtre qui se referme vite
 pluck(g,n,t,d,v,o){const f=mf(n),end=t+d+.8,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.2;lp.frequency.setValueAtTime((o&&o.br)||3400,t);lp.frequency.exponentialRampToValueAtTime(500,t+.25);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.003);e.gain.exponentialRampToValueAtTime(.0001,t+Math.min(d+.3,1.4));const a=osc(g,'sawtooth',f,t,end),b=osc(g,'triangle',f*1.002,t,end);a.connect(lp);b.connect(lp);lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.3})},
 // kalimba / marimba / cloches : partiels inharmoniques, décroissance rapide
 kalimba(g,n,t,d,v,o){const f=mf(n),e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.002);e.gain.exponentialRampToValueAtTime(.0001,t+.9);[[1,1],[2.76,.25],[5.4,.06]].forEach(([k,a])=>{const x=osc(g,'sine',f*k,t,t+1),gg=g.c.createGain();gg.gain.setValueAtTime(a,t);gg.gain.exponentialRampToValueAtTime(.0001,t+.9/k);x.connect(gg);gg.connect(e)});out(g,{node:e,pan:(o&&o.pan)||0,rev:.4})},
 marimba(g,n,t,d,v,o){const f=mf(n),e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.002);e.gain.exponentialRampToValueAtTime(.0001,t+.55);[[1,1],[4,.18],[10,.03]].forEach(([k,a])=>{const x=osc(g,'sine',f*k,t,t+.6),gg=g.c.createGain();gg.gain.setValueAtTime(a,t);gg.gain.exponentialRampToValueAtTime(.0001,t+.5/k);x.connect(gg);gg.connect(e)});out(g,{node:e,pan:(o&&o.pan)||0,rev:.25})},
 bell(g,n,t,d,v,o){const f=mf(n),e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.002);e.gain.exponentialRampToValueAtTime(.0001,t+2.2);[[1,1],[2.01,.4],[3.9,.15],[5.4,.08]].forEach(([k,a])=>{const x=osc(g,'sine',f*k,t,t+2.3),gg=g.c.createGain();gg.gain.setValueAtTime(a,t);gg.gain.exponentialRampToValueAtTime(.0001,t+2/k);x.connect(gg);gg.connect(e)});out(g,{node:e,pan:(o&&o.pan)||0,rev:.6})},
 // synthé principal moderne : deux scies douces, filtre, vibrato qui arrive après l'attaque
 lead(g,n,t,d,v,o){const f=mf(n),end=t+d+.5,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=2;lp.frequency.setValueAtTime((o&&o.br)||2400,t);lp.frequency.exponentialRampToValueAtTime(((o&&o.br)||2400)*.45,t+d);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.02);e.gain.setTargetAtTime(v*.7,t+.05,.2);e.gain.setTargetAtTime(.0001,t+d,.08);const vib=osc(g,'sine',5.2,t,end),vg=g.c.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.008,t+.3);vib.connect(vg);
  for(const dt of[-6,6]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;vg.connect(x.frequency);x.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.35})},
 // clavier doux (synthé chaud) : deux triangles légèrement désaccordés + sinus grave, filtre fermé, note courte (≤ 1 s) qui ne traîne pas
 keys(g,n,t,d,v,o){const f=mf(n),dd=Math.min(Math.max(d,.15),1),end=t+dd+.5,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=.3;lp.frequency.setValueAtTime((o&&o.br)||1500,t);lp.frequency.exponentialRampToValueAtTime(((o&&o.br)||1500)*.6,t+dd);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.018);e.gain.setTargetAtTime(v*.5,t+.03,.25);e.gain.setTargetAtTime(.0001,t+dd,.12);
  for(const[ty,k,a,dt]of[['triangle',1,.7,-5],['triangle',1,.7,5],['sine',.5,.35,0]]){const x=osc(g,ty,f*k,t,end);x.detune.value=dt;const gg=g.c.createGain();gg.gain.value=a;x.connect(gg);gg.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.3})},
 // accord « stab » (house) : deux scies, filtre qui se referme très vite, sous-octave douce
 stab(g,n,t,d,v,o){const f=mf(n),dd=Math.min(d,.4),end=t+dd+.25,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=2.5;const br=(o&&o.br)||2600;lp.frequency.setValueAtTime(br,t);lp.frequency.exponentialRampToValueAtTime(380,t+.22);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.004);e.gain.setTargetAtTime(v*.35,t+.02,.08);e.gain.setTargetAtTime(.0001,t+dd,.05);
  for(const dt of[-9,9]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;x.connect(lp)}const sb=osc(g,'sine',f/2,t,end),sg=g.c.createGain();sg.gain.value=.12;sb.connect(sg);sg.connect(e);lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.25})},
 // voix synthétique (« vocal chop ») : scie passée dans des formants de voyelle, vibrato qui arrive doucement
 vox(g,n,t,d,v,o){const f=mf(n),dd=Math.min(d,.45),end=t+dd+.3,src=osc(g,'sawtooth',f,t,end),vib=osc(g,'sine',5.5,t,end),vg=g.c.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.01,t+.2);vib.connect(vg);vg.connect(src.frequency);
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.012);e.gain.setTargetAtTime(v*.7,t+.04,.1);e.gain.setTargetAtTime(.0001,t+dd,.06);
  for(const[fq,q,a]of[[720,5,1],[(o&&o.br>600&&o.br<1800?o.br:1150),7,.7],[2600,9,.25]]){const b=g.c.createBiquadFilter();b.type='bandpass';b.frequency.value=fq;b.Q.value=q;const gg=g.c.createGain();gg.gain.value=a*3;src.connect(b);b.connect(gg);gg.connect(e)}out(g,{node:e,pan:(o&&o.pan)||0,rev:.3})},
 // cordes staccato (ostinato cinématique) : note très courte, attaque d'archet
 spic(g,n,t,d,v,o){const f=mf(n),dd=Math.min(d,.3),end=t+dd+.3,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.Q.value=.7;lp.frequency.value=(o&&o.br)||2200;
  const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.012);e.gain.setTargetAtTime(.0001,t+dd*.5,dd*.35+.03);for(const dt of[-7,0,7]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;x.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.35})},
 // flûte douce : sinus + souffle
 flute(g,n,t,d,v,o){const f=mf(n),end=t+d+.4,e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.06);e.gain.setTargetAtTime(.0001,t+d,.1);const a=osc(g,'sine',f,t,end),vib=osc(g,'sine',4.8,t,end),vg=g.c.createGain();vg.gain.value=f*.006;vib.connect(vg);vg.connect(a.frequency);a.connect(e);
  const s=g.c.createBufferSource();s.buffer=g.nz;const bp=g.c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=4;const bg=g.c.createGain();bg.gain.value=.25;s.connect(bp);bp.connect(bg);bg.connect(e);s.start(t,Math.random());s.stop(end);out(g,{node:e,pan:(o&&o.pan)||0,rev:.45})}};
// ---------- notes mises en cache : un instrument qui s'éteint seul est calculé une fois par hauteur, puis relu ----------
const CACHEABLE={keys:[1.0,.25],pluck:[1.0,.3],kalimba:[.95,.35],marimba:[.6,.25],stab:[.7,.25],vox:[.9,.3],spic:[.65,.35],lead:[.9,.3],flute:[.95,.4],bass:[.95,0]},NC=new Map(),NQ=[];let NQbusy=false;
function noteKey(i,n,o){return i+'|'+n+'|'+(o&&o.br||'')+'|'+(o&&o.bright||'')}
async function renderNote(){if(NQbusy||!NQ.length)return;NQbusy=true;const[key,i,n,o]=NQ.shift();try{const len=CACHEABLE[i][0],off=new OfflineAudioContext(1,Math.round(22050*len),22050),og={c:off,nz:null,bs:{}};
  og.musIn=off.createGain();og.musIn.connect(off.destination);og.revIn=off.createGain();og.nz=noiseBuf(off);I[i](og,n,0,len-.5,1,Object.assign({},o,{pan:0}));NC.set(key,await off.startRendering());if(NC.size>260)NC.delete(NC.keys().next().value)}catch(e){}NQbusy=false;if(NQ.length)setTimeout(renderNote,15)}
const TRIM={bass:.38,sub:.36,keys:2.2,pluck:1.8,kalimba:2.6,marimba:2.8,lead:2.2,flute:2.2,pad:1.9,strings:1.9,stab:1.6,vox:1.9,spic:1.6};
// anciens timbres retirés (piano électrique, piano, cloches) : remplacés par des sons doux et courts
const ALIAS={ep:'keys',piano:'keys',bell:'kalimba'};
// durée maximale d'une note par instrument (en secondes) : la musique respire, aucune note ne s'étire
const MAXD={kalimba:.5,marimba:.45,keys:.5,flute:.45,lead:.4,pluck:.45,bass:.45,sub:.4,stab:.4,vox:.45,spic:.3,pad:1.4,strings:1.4};
function play(g,i,n,t,d,v,o){i=ALIAS[i]||i;if(MAXD[i]&&d>MAXD[i])d=MAXD[i];if((i=='pad'||i=='strings')&&o&&o.att>.45)o=Object.assign({},o,{att:.45});v*=TRIM[i]||1;const C=CACHEABLE[i];if(C&&g.live){const key=noteKey(i,n,o),b=NC.get(key);
  if(b){NC.delete(key);NC.set(key,b);const s=g.c.createBufferSource();s.buffer=b;const e=g.c.createGain();e.gain.setValueAtTime(v,t);if(d+.3<C[0])e.gain.setTargetAtTime(0,t+d+.15,.08);s.connect(e);e.connect(bus(g,o&&o.pan,C[1]));s.start(t);s.stop(t+C[0]);return}
  if(!NQ.some(q=>q[0]===key)){NQ.push([key,i,n,o?{br:o.br,bright:o.bright}:{}]);setTimeout(renderNote,0)}}
 I[i](g,n,t,d,v,o)}
// ---------- batterie : échantillons calculés une fois (bruit filtré, sinus balayés), puis simplement rejoués ----------
function bq(x,sr,type,f,q){// filtre biquad (formules RBJ) appliqué à un tableau
 const w=2*Math.PI*f/sr,cs=Math.cos(w),al=Math.sin(w)/(2*q);let b0,b1,b2,a0=1+al,a1=-2*cs,a2=1-al;
 if(type=='lp'){b0=(1-cs)/2;b1=1-cs;b2=(1-cs)/2}else if(type=='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=(1+cs)/2}else{b0=al;b1=0;b2=-al}
 const y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=(b0*x[i]+b1*x1+b2*x2-a1*y1-a2*y2)/a0;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}return y}
function smp(g,key,len,fn){g.sm=g.sm||{};if(g.sm[key])return g.sm[key];const sr=g.c.sampleRate,n=Math.round(sr*len),b=g.c.createBuffer(1,n,sr);b.copyToChannel?b.copyToChannel(fn(sr,n),0):b.getChannelData(0).set(fn(sr,n));return g.sm[key]=b}
const wn=n=>{const a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;return a};
function nzS(sr,n,type,f,q,dec){const y=bq(wn(n),sr,type,f,q);for(let i=0;i<n;i++)y[i]*=Math.exp(-i/sr/dec);let m=0;for(const v of y)m=Math.max(m,Math.abs(v));for(let i=0;i<n;i++)y[i]/=m||1;return y}
const SMP={
 kick:(o)=>['k'+[o.f0,o.f1,o.len],o.len+.05,(sr,n)=>{const y=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const t=i/sr,f=o.f1+(o.f0-o.f1)*Math.exp(-t/.035);ph+=2*Math.PI*f/sr;y[i]=Math.sin(ph)*Math.exp(-t/(o.len/4))}const c=nzS(sr,Math.round(sr*.012),'hp',2500,.7,.003);for(let i=0;i<c.length;i++)y[i]+=c[i]*.25;return y}],
 snare:()=>['sn',.25,(sr,n)=>{const y=nzS(sr,n,'bp',1900,.8,.05);let ph=0;for(let i=0;i<n;i++){const t=i/sr;ph+=2*Math.PI*(150+50*Math.exp(-t/.03))/sr;y[i]=y[i]*.75+Math.sin(ph)*Math.exp(-t/.03)*.6}return y}],
 clap:()=>['cl',.3,(sr,n)=>{const y=new Float32Array(n),b=nzS(sr,n,'bp',1400,1.1,.08);for(let i=0;i<n;i++){const t=i/sr,e=t<.033?Math.exp(-((t%.011)/.004)):Math.exp(-(t-.033)/.07);y[i]=b[i]*e}return y}],
 rim:()=>['rim',.05,(sr,n)=>nzS(sr,n,'bp',2600,4,.008)],
 hat:()=>['hh',.06,(sr,n)=>nzS(sr,n,'hp',8500,.7,.012)],
 ohat:()=>['oh',.32,(sr,n)=>nzS(sr,n,'hp',7000,.7,.08)],
 shaker:()=>['sh',.09,(sr,n)=>{const y=nzS(sr,n,'bp',6500,1.2,.03);for(let i=0;i<n;i++){const t=i/sr;y[i]*=Math.min(1,t/.012)}return y}],
 crash:()=>['cr',1.1,(sr,n)=>nzS(sr,n,'hp',5200,.6,.35)],
 conga:(f)=>['cg'+f,.22,(sr,n)=>{const y=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const t=i/sr;ph+=2*Math.PI*f*(1+.35*Math.exp(-t/.012))/sr;y[i]=Math.sin(ph)*Math.exp(-t/.06)}return y}],
 brush:()=>['br',.2,(sr,n)=>nzS(sr,n,'bp',3200,.6,.06)],
 tom:(f)=>['tm'+f,.55,(sr,n)=>{const y=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const t=i/sr;ph+=2*Math.PI*f*(.6+.4*Math.exp(-t/.1))/sr;y[i]=Math.sin(ph)*Math.exp(-t/.12)}return y}]};
function hit(g,t,v,spec,pan){const[k,len,fn]=spec,s=g.c.createBufferSource();s.buffer=smp(g,k,len,fn);const e=g.c.createGain();e.gain.value=v;s.connect(e);e.connect(bus(g,pan||0,0,g.drumIn));s.start(t)}
const D={
 kick(g,t,v,o){const k=Object.assign({f0:140,f1:44,len:.42},o||{});k.f1=Math.max(k.f1,46);hit(g,t,v*.42,SMP.kick(k))},
 snare(g,t,v){hit(g,t,v,SMP.snare())},clap(g,t,v){hit(g,t,v*.95,SMP.clap(),.1)},rim(g,t,v){hit(g,t,v*1.4,SMP.rim(),.2)},
 hat(g,t,v,open){hit(g,t,v*1.9,open?SMP.ohat():SMP.hat(),open?-.35:.4)},shaker(g,t,v){hit(g,t,v*1.7,SMP.shaker(),-.3)},brush(g,t,v){hit(g,t,v*1.6,SMP.brush(),-.15)},tom(g,t,v,f){hit(g,t,v*.6,SMP.tom(f||110))},conga(g,t,v,f){hit(g,t,v,SMP.conga(f||300),.35)},crash(g,t,v){hit(g,t,v,SMP.crash(),-.25)},
 riser(g,t,d,v){const s=g.c.createBufferSource();s.buffer=g.nz;const f=g.c.createBiquadFilter();f.type='bandpass';f.Q.value=1.5;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(7000,t+d);const e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+d);e.gain.linearRampToValueAtTime(0,t+d+.05);s.connect(f);f.connect(e);e.connect(g.musIn);s.start(t);s.stop(t+d+.1)}};
// ---------- harmonie ----------
const MODES={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],mix:[0,2,4,5,7,9,10],lyd:[0,2,4,6,7,9,11]};
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function hashStr(x){let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h}
const deg=(T,i)=>{const sc=MODES[T.mode||'maj'];return T.key+sc[((i%7)+7)%7]+12*Math.floor(i/7)};
// accord sur un degré (1 à 7) : triade, 7e ou 9e selon le style ; « 4/9 » etc. accepté (degré/extension)
function chordOf(T,d){let ext=T.ext||7,dg=d;if(typeof d=='string'){const[a,b]=d.split('/');dg=+a;ext=+b}const i=dg-1,ks=[0,2,4];if(ext>=7)ks.push(6);if(ext>=9)ks.push(8);return ks.map(k=>deg(T,i+k))}
// enchaînement fluide : on choisit le renversement le plus proche de l'accord précédent, dans la tessiture
function voice(prev,notes,lo,hi){let best=null;const n=notes.length;
 for(let r=0;r<n;r++){let v=notes.slice(r).concat(notes.slice(0,r).map(x=>x+12));while(v[0]<lo)v=v.map(x=>x+12);while(v[v.length-1]>hi&&v[0]-12>=lo-5)v=v.map(x=>x-12);
  const c=prev?v.reduce((a,x,i)=>a+Math.abs(x-(prev[Math.min(i,prev.length-1)]||x)),0):Math.abs(v[0]-(lo+hi)/2);if(!best||c<best.c)best={v,c}}return best.v}
// ---------- compositeur : de vrais morceaux (3 à 5 min), pas des boucles ----------
// Forme : intro, couplet, montée, refrain, pause, couplet 2, pont, refrain 2, (variation), final, puis retour sans rupture à l'intro.
// Chaque style a son groove (batterie par niveau d'énergie, basse syncopée, accords rythmiques courts). La mélodie s'écrit en
// phrases de 4 mesures : l'accroche du refrain est fixe (mémorable), les couplets et le pont sont réécrits à chaque passage.
const FORM=[['I',8],['A',16],['P',8],['B',16],['K',8],['A2',16],['C',8],['B2',16],['O',8]];
const FORM_LONG=[['I',8],['A',16],['P',8],['B',16],['K',8],['A2',16],['C',8],['B2',16],['D',16],['O',8]];
// rôle de chaque section : énergie de la batterie, variante de basse, couches présentes, mélodie jouée
const ROLE={
 I:{dr:'low',bs:'a',bsFrom:4,ch:'a',pd:1,teaser:1},
 A:{dr:'mid',bs:'a',ch:'a',mel:'v'},
 P:{dr:'mid',bs:'p',ch:'a',ar:'soft',riser:1,roll:1},
 B:{dr:'high',bs:'b',ch:'b',ar:1,mel:'h',crash:1},
 K:{dr:'brk',pd:1,mel:'k'},
 A2:{dr:'mid2',bs:'b',ch:'a',ar:'soft',mel:'v',crash:1},
 C:{dr:'half',bs:'a',ch:'b',mel:'c',crash:1},
 B2:{dr:'high',bs:'b',ch:'b',ar:1,mel:'h',dbl:1,crash:1},
 D:{dr:'high',bs:'b',ch:'b',ar:1,mel:'d',crash:1},
 O:{dr:'low',bs:'a',ch:'a'}};
const PK={I:'I',A:'A',P:'P',B:'B',K:'I',A2:'A',C:'C',B2:'B',D:'B',O:'O'};
// ---- rythmes mélodiques (une mesure = 16 doubles-croches : [début, durée]) ----
const CELLS={
 hook:[[[0,2],[3,2],[6,2],[8,3],[12,2],[14,2]],[[0,3],[3,3],[6,2],[10,2],[12,3]],[[2,2],[4,2],[6,3],[10,2],[12,2],[14,2]],[[0,2],[2,2],[4,2],[7,3],[11,2],[14,2]],
  [[0,3],[6,2],[8,2],[10,2],[12,3]],[[0,1],[2,2],[4,1],[6,2],[8,3],[13,3]],[[0,2],[3,1],[4,2],[8,2],[11,1],[12,3]],[[1,2],[3,2],[6,2],[9,2],[12,2],[14,1]]],
 verse:[[[0,3],[4,2],[6,2],[10,3]],[[2,2],[4,2],[8,3],[12,2]],[[0,2],[3,3],[8,2],[10,2],[12,3]],[[4,2],[6,2],[8,3],[14,2]],[[0,2],[2,2],[6,3],[12,2],[14,2]],[[1,2],[4,2],[7,2],[10,3]],[[0,2],[4,1],[6,2],[9,2],[12,2]]],
 busy:[[[0,1],[2,1],[3,2],[6,1],[8,2],[10,1],[12,2],[14,1]],[[0,2],[2,1],[4,1],[6,2],[8,1],[10,2],[12,1],[14,2]],[[0,1],[1,1],[2,2],[6,2],[8,1],[9,1],[10,2],[14,2]]],
 end:[[[0,3],[4,4]],[[0,2],[2,2],[4,4]],[[0,4],[6,3]],[[2,2],[4,2],[6,4]],[[0,2],[3,2],[6,3]]]};
const pick=(a,r)=>a[Math.floor(r()*a.length)];
// une mesure de mélodie : sur les temps forts une note de l'accord (ct), entre eux des notes de passage (off = pas de gamme)
function mkBar(cell,r,P,arc){return cell.map(([st,du],j)=>{let ct=P.ct,off=0;const strong=st%4==0||j==0;
 if(strong){if(r()<.75)ct+=r()<.65?arc:-arc}else{if(r()<.5)off=r()<.5?1:-1;else if(r()<.4)ct+=arc}
 if(ct>4){ct=3;arc=-1}if(ct<-2){ct=-1;arc=1}P.ct=ct;return[st,du,ct,off]})}
function phrase(kind,r,arc){const P={ct:1+Math.floor(r()*2)};
 if(kind=='hook'){const a=mkBar(pick(CELLS.hook,r),r,P,arc),b=mkBar(pick(CELLS.hook,r),r,P,-arc);return[a,b,a.map(x=>x.slice()),mkBar(pick(CELLS.end,r),r,{ct:1},-1)]}
 const bank=kind=='bridge'?CELLS.hook.concat(CELLS.busy):CELLS.verse,bars=[];
 bars.push(mkBar(pick(bank,r),r,P,arc));bars.push(mkBar(r()<.55?pick(CELLS.verse,r):pick(CELLS.end,r),r,P,-arc));
 bars.push(mkBar(pick(bank,r),r,P,-arc));bars.push(mkBar(pick(CELLS.end,r),r,{ct:r()<.5?0:2},-1));return bars}
// l'accroche du refrain : toujours la même (on la reconnaît), avec deux fins différentes (suspendue / conclusive)
function hookBars(T){const r=rng(hashStr(T.id+'|accroche|'+(T.seed||''))),H=phrase('hook',r,1),e2=mkBar(pick(CELLS.end,r),r,{ct:2},-1),e3=mkBar(pick(CELLS.end,r),r,{ct:0},-1);
 return H.concat(H.slice(0,3),[e2],H,H.slice(0,3),[e3])}
// mélodie d'une section entière : un tableau de mesures, chaque note = {st,du,ct,off,i,vm,dbl}
function compose(T,X,R){const M=T.mel,out=[];for(let b=0;b<X.len;b++)out.push([]);
 const put=(b,bar,i,vm,dbl)=>{if(b<X.len&&bar)out[b]=bar.map(([st,du,ct,off])=>({st,du,ct,off,i,vm,dbl}))};
 if(R.mel=='h')hookBars(T).forEach((bar,b)=>put(b,bar,M.i,1,R.dbl));
 else if(R.mel=='d')hookBars(T).forEach((bar,b)=>put(b,b%4==3?bar:bar.map(([st,du,ct,off])=>[st,du,ct+1,off]),M.d||M.c||M.i,.9));
 else if(R.mel=='v'||R.mel=='c'){const r=rng(hashStr(T.id+'|'+X.sec+'|'+X.pass+'|'+(T.seed||'')));
  for(let p=0;p*4<X.len;p++)phrase(R.mel=='c'?'bridge':'verse',r,p%2?-1:1).forEach((bar,j)=>put(p*4+j,bar,R.mel=='c'?(M.c||M.i):(M.v||M.i),R.mel=='c'?.95:.85))}
 else if(R.mel=='k'){const h=hookBars(T);for(let j=0;j<4;j++)put(4+j,h[j],M.k||'kalimba',.6)}
 if(R.teaser){const h=hookBars(T);put(X.len-2,h[0],M.k||'kalimba',.45);put(X.len-1,h[1],M.k||'kalimba',.45)}
 return out}
function scaleMove(T,n,dir){const sc=MODES[T.mode||'maj'].map(x=>(x+T.key)%12);let k=0;do{n+=dir;k++}while(k<3&&!sc.includes(((n%12)+12)%12));return n}
function realize(T,S,ct,off){const lo=T.mel.lo||62,hi=T.mel.hi||lo+16,pcs=S.chord.map(x=>((x%12)+12)%12),tones=[];for(let n=lo;n<=hi;n++)if(pcs.includes(n%12))tones.push(n);
 let n=tones[cl(Math.floor(tones.length/2)-1+ct,0,tones.length-1)];for(let k=0;k<Math.abs(off);k++)n=scaleMove(T,n,Math.sign(off));return n}
// ---------- arrangeur ----------
const pat=(p,s)=>p&&p[s%p.length]!=='.'&&p[s%p.length]!==undefined?p[s%p.length]:null;
const VEL={x:1,o:.6,g:.32};
function secAt(T,bar){const F=T.form,tot=F.reduce((a,f)=>a+f[1],0),pass=Math.floor(bar/tot);let b=((bar%tot)+tot)%tot,i=0;while(b>=F[i][1]){b-=F[i][1];i++}return{sec:F[i][0],b,len:F[i][1],idx:i,pass}}
function chordAt(T,bar){const X=secAt(T,bar),p=T.prog[PK[X.sec]]||T.prog.A;return chordOf(T,p[X.b%p.length])}
// enregistrement (partition sans son, pour les tests) ou lecture
function note(g,L,i,n,t,d,v,o){if(g.only&&g.only!==L)return;if(g.rec){const ii=ALIAS[i]||i;g.rec.push([L,ii,n,+t.toFixed(3),+Math.min(d,MAXD[ii]||d).toFixed(3)]);return}play(g,i,n,t,d,v,o)}
function drum(g,name,t,v,a){if(g.only&&g.only!=='dr')return;if(g.rec){g.rec.push(['dr',name,0,+t.toFixed(3),0]);return}D[name](g,t,v,a)}
const ARSEQ=[[0,1,2,3],[0,2,1,3],[0,1,2,1,3,2],[3,2,1,0],[0,2,3,1],[0,1,3,2,1,2]];
function newBar(g,T,S,bar,t,SD){const X=secAt(T,bar),R=ROLE[X.sec];S.X=X;S.R=R;
 const c=chordAt(T,bar);S.root=c[0];S.chord=voice(S.chord,c,T.lo||53,T.hi||72);S.nextRoot=chordAt(T,bar+1)[0];
 S.r=rng(hashStr(T.id+'|'+bar+'|'+X.pass));
 const mk=X.idx+'|'+X.pass;if(S.melKey!==mk){S.melKey=mk;S.mel=compose(T,X,R);S.arSeq=ARSEQ[hashStr(T.id+mk)%ARSEQ.length];S.last=[]}
 S.mb=S.mel[X.b]||[];S.fill=(X.b%8==7||X.b==X.len-1)&&R.dr!='brk'&&R.dr!='low';
 if(R.crash&&X.b==0)drum(g,'crash',t,T.v.cr||.05);
 if(R.riser&&X.b==X.len-2){if(g.rec)g.rec.push(['fx','riser',0,+t.toFixed(3),0]);else D.riser(g,t,32*SD,.045)}}
function step(g,T,S,k,t){const SD=60/T.bpm/4,s=k%16,bar=Math.floor(k/16);if(s==0)newBar(g,T,S,bar,t,SD);
 const X=S.X,R=S.R,V=T.v,st=T.st,r=S.r,hum=()=>.9+.2*r();
 // ---- batterie ----
 const ds=st.dr[R.dr];
 if(ds){const roll=R.roll&&X.b>=X.len-2,fill=S.fill&&s>=12;
  const kc=pat(ds.k,s);if(kc)drum(g,'kick',t,V.k*VEL[kc]*hum(),st.dr.kick);
  if(roll){const every=X.b==X.len-1?(s<8?2:1):4;if(s%every==0)drum(g,'snare',t,V.s*(.35+.65*((X.b-(X.len-2))*16+s)/32))}
  else if(fill&&st.dr.fill){if(st.dr.fill=='tom'){if(s%2==0||R.dr=='high')drum(g,'tom',t,V.s*1.3*(.6+(s-12)*.12),[180,160,140,120][s-12])}else if(s%2==0||R.dr=='high')drum(g,'snare',t,V.s*(.45+(s-12)*.15))}
  else{for(const[ln,fx]of[['s','snare'],['c','clap'],['rim','rim']]){const c=pat(ds[ln],s);if(c)drum(g,fx,t,(V[ln]||.2)*VEL[c]*hum())}}
  const h=pat(ds.h,s);if(h)drum(g,'hat',t,V.h*VEL[h]*(s%4==0?1:s%2?.62:.8)*hum());
  const oh=pat(ds.oh,s);if(oh)drum(g,'hat',t,V.oh*VEL[oh],true);
  const sh=pat(ds.sh,s);if(sh)drum(g,'shaker',t,V.sh*VEL[sh]*(s%2?.7:1)*hum());
  const pc=pat(ds.pc,s);if(pc)drum(g,'conga',t,V.pc*VEL[pc]*hum(),[230,320,260,350][(s>>1)%4]);
  const tm=pat(ds.tm,s);if(tm)drum(g,'tom',t,V.tm*VEL[tm]*hum(),s<8?95:120)}
 // ---- basse ----
 if(R.bs&&!(R.bsFrom&&X.b<R.bsFrom)){const b=pat(st.bs[R.bs],s);if(b){let n=S.root-12,v=V.b;
  if(b=='5')n+=7;else if(b=='8')n+=12;else if(b=='3')n=S.chord[1]-12;else if(b=='g')v*=.5;else if(b=='a'){n=S.nextRoot!==S.root?S.nextRoot-12+(r()<.5?-1:1):n+7}
  while(n>(T.bs.hi||50))n-=12;while(n<(T.bs.lo||38))n+=12;note(g,'bs',T.bs.i||st.bs.i||'bass',n,t,SD*(st.bs.d||2),v*hum(),{br:T.bs.br||st.bs.br})}}
 // ---- accords rythmiques (courts) ----
 if(R.ch){const c=pat((T.ch.p&&T.ch.p[R.ch])||st.ch[R.ch],s);if(c){const ns=(T.ch.top?S.chord.slice(-T.ch.top):S.chord).map(x=>x+12*(T.ch.oct||0));
  ns.forEach((n,i)=>note(g,'ch',T.ch.i,n,t+i*(T.ch.strum||0),SD*(T.ch.d||st.ch.d||1.5),V.ch*VEL[c]*hum()*2.2/Math.max(2.2,ns.length),{pan:ns.length>1?(i/(ns.length-1)-.5)*.9:0,br:T.ch.br}))}}
 // ---- nappe : seulement dans l'intro et la pause, une fois toutes les deux mesures ----
 if(R.pd&&s==0&&X.b%2==0)S.chord.slice(0,3).forEach((n,i)=>note(g,'pd',T.pd.i||'pad',n,t,SD*32,V.pd,{pan:(i%2?.6:-.6),br:T.pd.br||1300,att:.4}));
 // ---- arpège / contre-chant ----
 if(R.ar&&T.ar.i){const a=pat(T.ar.p||st.ar.p,s);if(a&&(R.ar!=='soft'||s%2==0)){const seq=S.arSeq,i=seq[(s/(T.ar.rate||st.ar.rate||1)|0)%seq.length],n=S.chord[i%S.chord.length]+12*(T.ar.oct==null?1:T.ar.oct);
  note(g,'ar',T.ar.i,n,t,SD*(T.ar.d||1.5),V.ar*VEL[a]*(R.ar=='soft'?.7:1)*hum(),{pan:(k%2?.5:-.5)*(.6+.4*Math.sin(k*.37)),br:T.ar.br})}}
 // ---- mélodie ----
 for(const m of S.mb)if(m.st==s){let n=realize(T,S,m.ct,m.off);const L=S.last;if(L.length>=2&&L[L.length-1]==n&&L[L.length-2]==n)n=scaleMove(T,n,r()<.5?1:-1);L.push(n);if(L.length>4)L.shift();
  note(g,'mel',m.i,n,t,SD*m.du,V.mel*m.vm,{pan:.12,br:T.mel.br});if(m.dbl)note(g,'mel2',T.mel.dbl||'pluck',n-12,t,SD*m.du,V.mel*.4,{pan:-.35,br:1800})}}
// partition complète sans son (tests : longueur des notes, répétitions)
function score(id){const Th=T[id];if(!Th)return null;const g={rec:[]},S={},SD=60/Th.bpm/4,tot=Th.form.reduce((a,f)=>a+f[1],0);
 for(let k=0;k<tot*16;k++)step(g,Th,S,k,k*SD);return{notes:g.rec,bars:tot,sec:tot*16*SD,form:Th.form.map(f=>f.join(':')),bar:16*SD}}
// ---------- styles : groove, basse et accords propres à chaque famille ----------
const STY={
 // électronique chill moderne : grosse caisse décalée, caisse claire feutrée, charleston vivant
 chill:{dr:{kick:{f0:120,f1:48,len:.32},fill:'snare',
   low:{k:'x.........x.....',rim:'....o.......o...',sh:'..o...o...o...o.'},
   mid:{k:'x.....x...x.....',s:'....x.......x...',h:'x.o.x.o.x.o.x.oo',sh:'..g...g...g...g.'},
   mid2:{k:'x.....x...x..o..',s:'....x..g....x...',h:'xoxoxoxoxoxoxoxo',pc:'......o.....o...'},
   high:{k:'x.....x...x.....',s:'....x.......x..g',c:'....o.......o...',h:'x.o.x.o.x.o.x.oo',oh:'..............x.',pc:'...o..o....o..o.'},
   half:{k:'x.........x.....',s:'........x.......',h:'x.o.x.o.x.o.x.o.',sh:'..o...o...o...o.'},
   brk:{h:'..o...o...o...o.',sh:'x.o.x.o.x.o.x.o.'}},
  bs:{a:'R.....R...5..R..',b:'R..R..R...8.R.5a',p:'R.R.R.R.R.R.R.R.',d:2,i:'bass',br:750},
  ch:{a:'..x...x...x..x..',b:'x..x..x...x.x..x',d:2},ar:{p:'x.ox.ox.x.ox.ox.',rate:1},
  v:{k:.4,s:.24,c:.16,rim:.08,h:.06,oh:.04,sh:.045,pc:.07,tm:.1,b:.2,ch:.055,ar:.04,mel:.065,pd:.022,cr:.035}},
 // house : quatre temps, basse sur les contretemps, accords « stab »
 house:{dr:{kick:{f0:150,f1:47,len:.3},fill:'snare',
   low:{k:'x...x...x...x...',h:'..o...o...o...o.'},
   mid:{k:'x...x...x...x...',c:'....x.......x...',h:'g.o.g.o.g.o.g.o.',oh:'..x...x...x...x.'},
   mid2:{k:'x...x...x...x...',c:'....x.......x...',h:'gxog.gogxog.g.og',oh:'..x...x...x...x.',sh:'x.o.x.o.x.o.x.o.'},
   high:{k:'x...x...x...x...',c:'....x.......x...',s:'...........g...g',h:'ggxgggxgggxgggxg',oh:'..x...x...x...x.',pc:'...o.o.....o..o.'},
   half:{k:'x.......x.......',c:'........x.......',h:'..o...o...o...o.',oh:'..x.......x.....'},
   brk:{h:'..o...o...o...o.',sh:'g.g.g.g.g.g.g.g.'}},
  bs:{a:'..R...R...R...R.',b:'..R.8.R...R.8.Ra',p:'R.R.R.R.R.R.R.R.',d:1.5,i:'bass',br:950},
  ch:{a:'...x..x.....x...',b:'..x..x....x..x..',d:1.5},ar:{p:'xoxoxoxoxoxoxoxo',rate:1},
  v:{k:.32,s:.18,c:.22,h:.07,oh:.06,sh:.05,pc:.07,b:.18,ch:.065,ar:.03,mel:.055,pd:.02,cr:.04}},
 // pop électronique : rebonds, basse en croches, accords en syncopes
 pop:{dr:{kick:{f0:135,f1:48,len:.3},fill:'snare',
   low:{k:'x.......x.......',h:'x.x.x.x.x.x.x.x.'},
   mid:{k:'x.....x.x.......',c:'....x.......x...',h:'x.x.x.x.x.x.x.x.',sh:'..o...o...o...o.'},
   mid2:{k:'x.....x.x.....o.',c:'....x.......x...',s:'....o.......o...',h:'x.xox.x.x.xox.x.',pc:'.....o.....o....'},
   high:{k:'x...x...x...x...',c:'....x.......x...',s:'....x.......x...',h:'xoxoxoxoxoxoxoxo',oh:'..............x.'},
   half:{k:'x.......x.x.....',c:'........x.......',h:'x.x.x.x.x.x.x.x.'},
   brk:{c:'....o.......o...',h:'x...x...x...x...'}},
  bs:{a:'R.R...R.R...5.8.',b:'R.RR..R.R.8.5.Ra',p:'R.R.R.R.R.R.R.R.',d:1.6,i:'bass',br:1000},
  ch:{a:'x..x..x...x..x..',b:'x.xx.x.xx.x.x.x.',d:1.2},ar:{p:'x.x.x.x.x.x.x.x.',rate:2},
  v:{k:.32,s:.2,c:.22,h:.065,oh:.05,sh:.05,pc:.065,b:.18,ch:.045,ar:.032,mel:.055,pd:.02,cr:.04}},
 // funk / nu-disco : notes fantômes, basse en octaves, guitare rythmique
 funk:{dr:{kick:{f0:125,f1:47,len:.3},fill:'snare',
   low:{k:'x......x..x.....',h:'x.x.x.x.x.x.x.x.'},
   mid:{k:'x......x..x.....',s:'....x..g.g..x..g',h:'xoxoxoxoxoxoxoxo'},
   mid2:{k:'x......x..x..x..',s:'....x..g.g..x..g',h:'xoxoxoxoxoxoxoxo',pc:'..o..o....o..o..'},
   high:{k:'x......x..x.....',s:'....x..g.g..x..g',c:'....o.......o...',h:'xoxoxoxoxoxoxoxo',oh:'......x.......x.',pc:'..o..o....o..o..'},
   half:{k:'x.........x.....',s:'........x.......',h:'x.o.x.o.x.o.x.o.'},
   brk:{h:'xoxoxoxoxoxoxoxo',pc:'..o..o....o..o..'}},
  bs:{a:'R..8..R.8.R..5.8',b:'R.g8.gR.8.Rg5.8a',p:'R.R.R.R.R.R.R.R.',d:1.4,i:'bass',br:1100},
  ch:{a:'..x..x....x..x..',b:'x.gx.g.x.gx.g..x',d:1},ar:{p:'x.x.x.x.x.x.x.x.',rate:2},
  v:{k:.42,s:.24,c:.14,h:.06,oh:.04,pc:.065,b:.21,ch:.05,ar:.03,mel:.055,pd:.02,cr:.035}},
 // cinématique : percussions hybrides, cordes staccato en ostinato, cuivres synthétiques
 cine:{dr:{kick:{f0:110,f1:46,len:.45},fill:'tom',
   low:{tm:'x.........x.....'},
   mid:{k:'x.......x.x.....',tm:'....o.......o.o.',sh:'..g...g...g...g.'},
   mid2:{k:'x.......x.x.....',s:'....o.......o...',tm:'......o.....o.o.',h:'x.x.x.x.x.x.x.x.'},
   high:{k:'x.....x.x.......',s:'....x.......x...',tm:'..........o.o.o.',h:'x.o.x.o.x.o.x.o.',oh:'..............x.'},
   half:{k:'x...............',s:'........x.......',tm:'....o.......o...'},
   brk:{tm:'x.......o.......'}},
  bs:{a:'R..R..R.R.......',b:'R..R..R.R..R.R..',p:'R.R.R.R.R.R.R.R.',d:1.5,i:'bass',br:650},
  ch:{a:'x..x..x...x..x..',b:'x.xx.xx.x.xx.xx.',d:1},ar:{p:'x.x.x.x.x.x.x.x.',rate:2},
  v:{k:.4,s:.2,h:.04,oh:.035,sh:.04,tm:.2,b:.22,ch:.05,ar:.04,mel:.055,pd:.028,cr:.04}},
 // électro « arcade » : énergique, basse en croches, arpèges rapides
 synth:{dr:{kick:{f0:155,f1:47,len:.3},fill:'snare',
   low:{k:'x...x...x...x...',h:'..x...x...x...x.'},
   mid:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.',sh:'x.o.x.o.x.o.x.o.'},
   mid2:{k:'x...x...x...x...',s:'....x.......x...',h:'gxgxgxgxgxgxgxgx',pc:'...o...o...o..o.'},
   high:{k:'x...x...x...x...',s:'....x.......x...',c:'....o.......o...',h:'xxxxxxxxxxxxxxxx',oh:'..x...x...x...x.'},
   half:{k:'x.......x.......',s:'........x.......',h:'x.x.x.x.x.x.x.x.'},
   brk:{h:'..x...x...x...x.'}},
  bs:{a:'R.R.R.R.R.R.R.R.',b:'R.8.R.8.R.8.R.8a',p:'R.R.R.R.R.R.R.R.',d:1.4,i:'bass',br:1200},
  ch:{a:'x.....x.....x...',b:'x..x..x...x..x..',d:1.4},ar:{p:'xoxoxoxoxoxoxoxo',rate:1},
  v:{k:.32,s:.24,c:.14,h:.06,oh:.05,sh:.05,pc:.06,b:.17,ch:.06,ar:.032,mel:.055,pd:.02,cr:.04}},
 // tropical / afro-pop : rythme 3-3-2, congas, marimba
 trop:{dr:{kick:{f0:125,f1:48,len:.3},fill:'tom',
   low:{k:'x.......x.......',sh:'x.x.x.x.x.x.x.x.'},
   mid:{k:'x.......x.......',rim:'...x..x....x..x.',sh:'x.o.x.o.x.o.x.o.'},
   mid2:{k:'x.......x.......',rim:'...x..x....x..x.',sh:'xoxoxoxoxoxoxoxo',pc:'..o...o.o.o...o.'},
   high:{k:'x.......x.......',s:'...x..x....x..x.',c:'....o.......o...',sh:'xoxoxoxoxoxoxoxo',pc:'o.o...o.o.o...o.',oh:'..............x.'},
   half:{k:'x...............',rim:'...x..x.........',sh:'x.o.x.o.x.o.x.o.'},
   brk:{pc:'o.o...o.o.o...o.',sh:'x.o.x.o.x.o.x.o.'}},
  bs:{a:'R.....R.R.....5.',b:'R..R..R.R..5..8.',p:'R.R.R.R.R.R.R.R.',d:2,i:'bass',br:850},
  ch:{a:'..x..x....x..x..',b:'x..x..x.x..x..x.',d:1.2},ar:{p:'x.x.x.x.x.x.x.x.',rate:2},
  v:{k:.42,s:.16,c:.14,rim:.09,sh:.045,oh:.035,pc:.085,tm:.18,b:.2,ch:.07,ar:.04,mel:.09,pd:.02,cr:.03}},
 // atmosphérique moderne : demi-tempo, grooves feutrés, textures
 amb:{dr:{kick:{f0:110,f1:46,len:.34},fill:'snare',
   low:{h:'x.o.x.o.x.o.x.o.',sh:'..g...g...g...g.'},
   mid:{k:'x.........x.....',s:'........x.......',h:'x.o.x.o.x.o.xoo.',sh:'..g...g...g...g.'},
   mid2:{k:'x.....x...x.....',s:'........x.......',h:'xoooxoooxoooxooo',pc:'......o.......o.'},
   high:{k:'x.....x...x.....',s:'........x.......',c:'........o.......',h:'xoxoxoxoxoxoxoxo',pc:'...o......o..o..'},
   half:{k:'x.........x.....',s:'........x.......',h:'x.o.x.o.x.o.x.o.'},
   brk:{h:'x...x...x...x...'}},
  bs:{a:'R.........R.....',b:'R.....R...R..5..',p:'R...R...R...R...',d:3,i:'bass',br:650},
  ch:{a:'x.......x.......',b:'x.....x...x.....',d:2},ar:{p:'x.x.x.x.x.x.x.x.',rate:2},
  v:{k:.38,s:.2,c:.12,h:.06,sh:.04,pc:.06,b:.22,ch:.05,ar:.035,mel:.055,pd:.024,cr:.03}}};
// ---------- les morceaux : un par lieu, un par mini-jeu ----------
const T={};
function def(id,o){const st=STY[o.sty],t=Object.assign({id,ext:7,lo:53,hi:71},o);t.st=st;t.form=o.form||(104*240/o.bpm<185?FORM_LONG:FORM);t.v=Object.assign({},st.v,o.v||{});
 t.prog=Object.assign({},o.prog);if(!t.prog.P)t.prog.P=[4,4,5,5];if(!t.prog.O)t.prog.O=t.prog.I;if(!t.prog.C)t.prog.C=[6,4,1,5];
 t.mel=Object.assign({i:'lead',lo:62},o.mel||{});t.ch=Object.assign({i:'keys'},o.ch||{});t.ar=Object.assign({i:'pluck'},o.ar||{});t.pd=Object.assign({i:'pad'},o.pd||{});t.bs=Object.assign({},o.bs||{});T[id]=t}
// —— menu principal : signature de Little Life
def('menu',{sty:'chill',bpm:102,key:53,mode:'maj',ext:9,prog:{I:[4,4,1,1],A:[2,5,1,6],B:[4,5,3,6],C:[6,5,4,4]},mel:{i:'vox',v:'keys',k:'kalimba',c:'flute'},ch:{i:'keys',br:1600},ar:{i:'pluck',br:1700}});
// —— maison (un seul morceau, quelles que soient les actions)
def('maison',{sty:'chill',bpm:96,key:55,mode:'maj',ext:9,prog:{I:[1,1,4,4],A:[1,3,4,5],B:[4,5,6,1],C:[2,3,4,5]},mel:{i:'flute',v:'vox',k:'kalimba',c:'keys',d:'vox'},ch:{i:'keys',br:1500},ar:{i:'kalimba'}});
// —— extérieur et bâtiments
def('rue',{sty:'house',bpm:122,key:57,mode:'dor',prog:{I:[1,1,4,4],A:[1,4,7,4],B:[6,7,1,1],C:[4,4,6,7]},mel:{i:'lead',v:'vox',k:'pluck',br:2200},ch:{i:'stab',br:2400},ar:{i:'pluck',br:2600}});
def('office',{sty:'amb',bpm:100,key:62,mode:'maj',ext:9,prog:{I:[1,4,1,4],A:[1,5,6,4],B:[4,1,5,6],C:[2,5,3,6]},mel:{i:'pluck',v:'keys',k:'marimba',br:2200},ch:{i:'keys'},ar:{i:'marimba'}});
def('store',{sty:'pop',bpm:108,key:53,mode:'maj',ext:9,prog:{I:[1,1,2,2],A:[1,2,3,2],B:[4,5,3,6],C:[2,5,1,1]},mel:{i:'flute',v:'vox',k:'kalimba'},ch:{i:'keys'},ar:{i:'kalimba'}});
def('clothes',{sty:'house',bpm:124,key:50,mode:'dor',prog:{I:[1,1,7,7],A:[1,3,4,7],B:[4,7,1,1],C:[6,7,4,4]},mel:{i:'vox',v:'lead',k:'pluck',br:2000},ch:{i:'stab',br:2200},ar:{i:'pluck',br:2400}});
def('grocery',{sty:'trop',bpm:106,key:55,mode:'maj',prog:{I:[1,5,1,5],A:[1,5,4,5],B:[4,1,5,1],C:[6,4,5,5]},mel:{i:'marimba',v:'flute',k:'kalimba'},ch:{i:'marimba'},ar:{i:'kalimba'}});
def('pets',{sty:'trop',bpm:100,key:60,mode:'maj',prog:{I:[1,4,1,5],A:[1,6,4,5],B:[4,5,3,6],C:[2,5,1,1]},mel:{i:'flute',v:'kalimba',k:'marimba'},ch:{i:'marimba'},ar:{i:'pluck',br:1800}});
// —— café : lo-fi feutré (piano électrique, kalimba, voix douce), tempo lent, groove souple
def('cafe',{sty:'chill',bpm:78,key:51,mode:'maj',ext:9,prog:{I:[2,5,1,6],A:[4,3,2,5],B:[2,5,1,1],C:[4,4,3,6]},mel:{i:'keys',v:'kalimba',k:'vox',c:'flute',br:1200},ch:{i:'keys',br:1250},ar:{i:'kalimba'}});
def('gym',{sty:'synth',bpm:126,key:57,mode:'min',prog:{I:[1,1,6,6],A:[1,6,7,5],B:[6,7,1,1],C:[4,4,6,7]},mel:{i:'lead',v:'pluck',k:'pluck',br:2600},ch:{i:'stab',br:2600},ar:{i:'pluck',br:3000}});
// —— restaurant : lounge feutré (piano électrique, flûte, voix douce), groove souple, jamais relancé pendant la visite
def('resto',{sty:'chill',bpm:88,key:56,mode:'maj',ext:9,prog:{I:[2,5,1,6],A:[2,5,1,6],B:[4,3,6,2],C:[4,5,3,6]},mel:{i:'keys',v:'flute',k:'vox',c:'kalimba',br:1300},ch:{i:'keys',br:1350},ar:{i:'kalimba',br:1500}});
// —— cinéma : chaque espace a son morceau
def('cine_hall',{sty:'cine',bpm:96,key:50,mode:'min',prog:{I:[1,6,1,6],A:[1,6,3,7],B:[6,4,1,5],C:[4,5,6,6]},mel:{i:'lead',v:'flute',k:'kalimba',br:1400},ch:{i:'spic'},ar:{i:'spic',br:2600},pd:{i:'strings'}});
def('cine_couloir',{sty:'amb',bpm:84,key:57,mode:'min',prog:{I:[1,1,6,6],A:[1,6,4,5],B:[6,4,1,5],C:[4,4,1,1]},mel:{i:'flute',v:'kalimba',k:'kalimba'},ch:{i:'keys',br:1300},ar:{i:'kalimba'},pd:{i:'strings'}});
def('cine_salle',{sty:'cine',bpm:100,key:55,mode:'maj',ext:9,prog:{I:[1,4,1,4],A:[1,5,6,4],B:[4,5,3,6],C:[6,4,5,5]},mel:{i:'lead',v:'flute',k:'kalimba',br:1700},ch:{i:'spic'},ar:{i:'spic',br:2800},pd:{i:'strings'}});
def('cine_prive',{sty:'funk',bpm:94,key:56,mode:'maj',ext:9,prog:{I:[2,5,1,1],A:[2,5,3,6],B:[4,5,1,6],C:[4,3,2,5]},mel:{i:'flute',v:'vox',k:'kalimba'},ch:{i:'keys',br:1400},ar:{i:'kalimba'}});
def('cine_wc',{sty:'amb',bpm:88,key:61,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,5,2,2],B:[4,5,1,1],C:[2,1,2,1]},mel:{i:'kalimba',v:'flute',k:'marimba'},ch:{i:'keys',br:1300},ar:{i:'marimba'}});
// —— salle d'arcade et bowling
def('arcade',{sty:'synth',bpm:122,key:52,mode:'min',prog:{I:[1,6,7,1],A:[1,6,4,5],B:[6,4,1,5],C:[4,4,6,7]},mel:{i:'lead',v:'pluck',k:'pluck',br:2800},ch:{i:'stab',br:2400},ar:{i:'pluck',br:3200}});
def('bowling',{sty:'pop',bpm:118,key:50,mode:'dor',prog:{I:[1,4,1,4],A:[1,4,1,5],B:[4,5,1,1],C:[6,5,4,4]},mel:{i:'lead',v:'vox',k:'pluck',br:2400},ch:{i:'stab',br:2600},ar:{i:'pluck',br:2600}});
// —— mini-jeux de la borne
def('pinball',{sty:'synth',bpm:128,key:57,mode:'min',prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},mel:{i:'lead',v:'pluck',br:2800},ch:{i:'stab'},ar:{i:'pluck',br:3200}});
def('racing',{sty:'synth',bpm:136,key:52,mode:'min',prog:{I:[1,1,7,7],A:[1,7,6,7],B:[6,7,1,1],C:[4,5,6,6]},mel:{i:'lead',v:'stab',br:3000},ch:{i:'stab',br:2800},ar:{i:'pluck',br:3400}});
def('mole',{sty:'trop',bpm:120,key:60,mode:'maj',prog:{I:[1,5,1,5],A:[1,5,6,4],B:[4,5,1,1],C:[6,4,5,5]},mel:{i:'marimba',v:'kalimba'},ch:{i:'pluck',br:2000},ar:{i:'marimba'}});
def('hockey',{sty:'house',bpm:126,key:55,mode:'mix',prog:{I:[1,7,1,7],A:[1,7,4,1],B:[4,5,1,7],C:[4,4,5,5]},mel:{i:'lead',v:'vox',br:2400},ch:{i:'stab'},ar:{i:'pluck'}});
def('maze',{sty:'amb',bpm:104,key:62,mode:'dor',prog:{I:[1,1,4,4],A:[1,4,7,4],B:[6,4,1,5],C:[4,4,1,1]},mel:{i:'pluck',v:'kalimba',br:2000},ch:{i:'keys'},ar:{i:'kalimba'}});
def('claw',{sty:'pop',bpm:108,key:53,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,6,5],B:[4,5,1,2],C:[2,2,1,1]},mel:{i:'flute',v:'kalimba'},ch:{i:'keys'},ar:{i:'kalimba'}});
def('bubble',{sty:'trop',bpm:112,key:60,mode:'maj',prog:{I:[1,4,1,4],A:[1,3,4,5],B:[6,4,1,5],C:[4,4,2,5]},mel:{i:'kalimba',v:'marimba'},ch:{i:'marimba'},ar:{i:'pluck',br:2000}});
def('boxes',{sty:'chill',bpm:96,key:57,mode:'maj',ext:9,prog:{I:[1,4,1,4],A:[1,6,2,5],B:[4,5,3,6],C:[2,5,1,1]},mel:{i:'pluck',v:'keys',br:1800},ch:{i:'keys'},ar:{i:'kalimba'}});
def('stNeon',{sty:'house',bpm:118,key:57,mode:'min',ext:9,prog:{I:[1,6,1,6],A:[1,6,3,7],B:[6,7,3,1],C:[4,4,6,6]},mel:{i:'vox',v:'pluck'},ch:{i:'stab'},ar:{i:'pluck'}});
def('stSunset',{sty:'chill',bpm:92,key:53,mode:'maj',ext:9,prog:{I:[1,3,4,4],A:[1,3,4,5],B:[6,5,4,4],C:[2,5,1,1]},mel:{i:'flute',v:'keys'},ch:{i:'keys'},ar:{i:'kalimba'}});
def('stOcean',{sty:'amb',bpm:86,key:62,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,6,5],B:[4,2,1,5],C:[2,2,1,1]},mel:{i:'flute',v:'kalimba'},ch:{i:'keys'},ar:{i:'kalimba'}});
def('stSpace',{sty:'amb',bpm:90,key:45,mode:'min',ext:9,prog:{I:[1,6,1,6],A:[1,6,4,5],B:[6,4,1,7],C:[4,4,6,6]},mel:{i:'lead',v:'flute',br:1600},ch:{i:'keys'},ar:{i:'pluck',br:1600},pd:{i:'strings'}});
def('stCrystal',{sty:'pop',bpm:102,key:60,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,3,2],B:[4,5,1,2],C:[6,5,2,2]},mel:{i:'kalimba',v:'pluck'},ch:{i:'keys'},ar:{i:'marimba'}});
def('stCyber',{sty:'synth',bpm:122,key:52,mode:'min',prog:{I:[1,1,6,7],A:[1,6,7,5],B:[6,7,1,1],C:[4,4,7,7]},mel:{i:'lead',v:'stab',br:2600},ch:{i:'stab'},ar:{i:'pluck',br:3200}});
// Memory : électro chill lumineuse (clavier doux, kalimba, voix synthétique), groove léger
def('memory',{sty:'chill',bpm:104,key:58,mode:'maj',ext:9,prog:{I:[4,4,1,1],A:[1,5,6,4],B:[4,5,3,6],C:[2,5,1,1]},mel:{i:'vox',v:'kalimba',k:'kalimba',c:'pluck',br:1300},ch:{i:'keys',br:1700},ar:{i:'kalimba'}});
// les tables du flipper : même énergie, couleurs différentes
def('pb_west',{sty:'funk',bpm:112,key:52,mode:'mix',prog:{I:[1,7,1,7],A:[1,4,7,1],B:[4,1,5,1],C:[6,4,5,5]},mel:{i:'flute',v:'pluck',k:'pluck',br:2200},ch:{i:'pluck',br:2600},ar:{i:'pluck',br:2400}});
def('pb_dino',{sty:'trop',bpm:124,key:55,mode:'dor',prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},mel:{i:'marimba',v:'pluck'},ch:{i:'marimba'},ar:{i:'kalimba'}});
def('pb_alien',{sty:'synth',bpm:130,key:50,mode:'min',prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},mel:{i:'lead',v:'vox',br:1800},ch:{i:'stab'},ar:{i:'pluck'}});
def('pb_city',{sty:'house',bpm:126,key:57,mode:'dor',prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},mel:{i:'vox',v:'lead'},ch:{i:'stab'},ar:{i:'pluck'}});
def('pb_space',{sty:'amb',bpm:122,key:52,mode:'lyd',prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},mel:{i:'lead',v:'kalimba',br:2000},ch:{i:'keys'},ar:{i:'pluck'}});
// ---------- niveaux : chaque morceau est ramené au même volume perçu (mesuré par les tests, voir rue/tests/musique_tests.js) ----------
const GAIN={"menu":1.303,"maison":1.432,"rue":1.57,"office":1.624,"store":1.545,"clothes":1.578,"grocery":1.215,"pets":1.881,"cafe":1.318,"resto":1.299,"gym":1.568,"cine_hall":1.306,"cine_couloir":2.065,"cine_salle":1.289,"cine_prive":1.338,"cine_wc":1.626,"arcade":1.561,"bowling":1.705,"pinball":1.565,"racing":1.492,"mole":1.657,"hockey":1.58,"maze":1.866,"claw":1.615,"bubble":1.774,"boxes":1.314,"stNeon":1.824,"stSunset":1.353,"stOcean":2.009,"stSpace":1.58,"stCrystal":1.653,"stCyber":1.554,"pb_dino":1.565,"pb_alien":1.565,"pb_city":1.565,"pb_west":1.6,"memory":1.5,"pb_space":1.565};
// ---------- ambiances environnementales (bus séparé) ----------
const AMB={
 rue:{bed:[['lowpass',500,.05]],ev:[['car',.08],['bird',.3,'day'],['cricket',.4,'night']]},
 maison:{bed:[['lowpass',240,.01]],ev:[['bird',.06,'day'],['cricket',.1,'night']]},
 office:{bed:[['lowpass',300,.012]],mur:.022,ev:[['keys',.3],['beep',.02]]},
 store:{bed:[['lowpass',300,.01]],mur:.016,ev:[['clink',.03]]},
 clothes:{bed:[['lowpass',300,.01]],mur:.016},
 grocery:{bed:[['lowpass',300,.01]],mur:.02,ev:[['beep',.12]]},
 pets:{bed:[['lowpass',300,.008]],ev:[['bird',.4],['bubble',.25]]},
 cafe:{bed:[['lowpass',400,.012]],mur:.03,ev:[['clink',.35]]},
 resto:{bed:[['lowpass',380,.011]],mur:.032,ev:[['clink',.4],['plate',.14],['sizzle',.07],['clank',.04]]},
 gym:{bed:[['lowpass',500,.02]],ev:[['clank',.18]]},
 cine_hall:{bed:[['lowpass',300,.01]],mur:.022},cine_couloir:{bed:[['lowpass',150,.012]],hum:.004},cine_salle:{bed:[['lowpass',200,.008]],mur:.012},cine_wc:{bed:[['bandpass',800,.005]],ev:[['drip',.25]]},
 arcade:{bed:[['lowpass',220,.012]],hum:.008,ev:[]}};
function ambEvent(g,n,t){const c=g.c,P=(node,pan)=>{let x=node;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;x.connect(p);x=p}x.connect(g.ambIn)};const R=Math.random;
 const blip=(f0,f1,d,v,pan,type)=>{const o=c.createOscillator(),e=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.005);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);P(e,pan);o.start(t);o.stop(t+d+.02)};
 if(n=='bird'){const pan=R()*1.6-.8,b=2200+R()*1500,k=2+Math.floor(R()*3);for(let i=0;i<k;i++){t+=.09+R()*.06;blip(b,b*1.5,.07,.02,pan)}}
 else if(n=='cricket'){const pan=R()*1.6-.8;for(let i=0;i<3;i++){t+=.045;blip(4500,4400,.02,.008,pan)}}
 else if(n=='drip'){blip(1400+R()*600,500,.06,.018,R()*1.2-.6)}
 else if(n=='tick'){blip(3000,2500,.008,.004,.3)}
 else if(n=='clink'){const f=2400+R()*1200;blip(f,f,.25,.01,R()*1.4-.7);blip(f*2.7,f*2.7,.15,.004,R()*1.4-.7)}
 else if(n=='plate'){blip(900+R()*300,700,.06,.012,R()*1.2-.6,'triangle');blip(2600+R()*500,2400,.12,.004,R()*1.2-.6)}
 else if(n=='sizzle'){const s=c.createBufferSource(),f=c.createBiquadFilter(),e=c.createGain();s.buffer=g.nz;f.type='highpass';f.frequency.value=4500;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.006,t+.2);e.gain.linearRampToValueAtTime(0,t+1.4);s.connect(f);f.connect(e);P(e,-.5);s.start(t,R());s.stop(t+1.5)}
 else if(n=='beep'){blip(1320,1320,.12,.008,R()-.5)}
 else if(n=='bubble'){blip(300,900,.08,.012,R()-.5)}
 else if(n=='chime'){const f=mf([72,74,76,79,81][Math.floor(R()*5)]);blip(f,f,.5,.006,R()*1.6-.8);blip(f*2.76,f*2.76,.2,.002,R()-.5)}
 else if(n=='keys'){for(let i=0,k=3+Math.floor(R()*5);i<k;i++){const s=c.createBufferSource(),f=c.createBiquadFilter(),e=c.createGain();s.buffer=g.nz;f.type='bandpass';f.frequency.value=3000;f.Q.value=2;e.gain.setValueAtTime(.012,t);e.gain.exponentialRampToValueAtTime(.0001,t+.02);s.connect(f);f.connect(e);P(e,.2);s.start(t,R());s.stop(t+.03);t+=.08+R()*.12}}
 else if(n=='clank'){const s=c.createBufferSource(),f=c.createBiquadFilter(),e=c.createGain();s.buffer=g.nz;f.type='bandpass';f.frequency.value=2600;f.Q.value=9;e.gain.setValueAtTime(.02,t);e.gain.exponentialRampToValueAtTime(.0001,t+.35);s.connect(f);f.connect(e);P(e,R()-.5);s.start(t,R());s.stop(t+.4)}
 else if(n=='car'){const s=c.createBufferSource(),f=c.createBiquadFilter(),e=c.createGain();s.buffer=g.nz;s.loop=true;f.type='lowpass';f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(900,t+1.3);f.frequency.linearRampToValueAtTime(350,t+2.8);
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.035,t+1.3);e.gain.linearRampToValueAtTime(0,t+2.8);s.connect(f);f.connect(e);if(c.createStereoPanner){const p=c.createStereoPanner(),d=R()<.5?1:-1;p.pan.setValueAtTime(-.9*d,t);p.pan.linearRampToValueAtTime(.9*d,t+2.8);e.connect(p);p.connect(g.ambIn)}else e.connect(g.ambIn);s.start(t);s.stop(t+2.9)}}
function ambStart(g,id){const A=AMB[id];if(!A)return null;const c=g.c,nodes=[],t=c.currentTime;
 for(const[type,f,v]of A.bed||[]){const s=c.createBufferSource();s.buffer=g.nz;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=.5;const e=c.createGain();e.gain.value=v;s.connect(fl);fl.connect(e);e.connect(g.ambIn);s.start(t,Math.random());nodes.push(s)}
 if(A.mur){// brouhaha de voix lointaines : bruit filtré dans la zone de la voix, qui ondule
  const s=c.createBufferSource();s.buffer=g.nz;s.loop=true;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=650;fl.Q.value=.9;const e=c.createGain();e.gain.value=A.mur;
  for(const fr of[.31,.73,1.7]){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=fr;lg.gain.value=A.mur*.35;l.connect(lg);lg.connect(e.gain);l.start(t);nodes.push(l)}s.connect(fl);fl.connect(e);e.connect(g.ambIn);s.start(t,Math.random());nodes.push(s)}
 if(A.hum){for(const f of[100,150]){const o=c.createOscillator(),e=c.createGain();o.frequency.value=f;e.gain.value=A.hum/(f/100);o.connect(e);e.connect(g.ambIn);o.start(t);nodes.push(o)}}
 return{id,nodes,ev:A.ev||[]}}
function ambStop(a,t){if(!a)return;for(const n of a.nodes){try{n.stop(t)}catch(e){}}}
// ---------- réglages du joueur (sauvegardés avec la partie) ----------
const DEF={m:.8,s:.85,a:.6,mute:false,fo:1.2,fi:1.8};
function prefs(){try{if(!N.audio)N.audio=Object.assign({},DEF,{mute:N.mus===false});for(const k in DEF)if(N.audio[k]==null)N.audio[k]=DEF[k];return N.audio}catch(e){return live&&live.P||Object.assign({},DEF)}}
function applyPrefs(fast){if(!G)return;const P=prefs(),t=ctx.currentTime,tc=fast?.01:.12;G.master.gain.setTargetAtTime(P.mute?0:1,t,tc);G.musBus.gain.setTargetAtTime(P.m*P.m,t,tc);G.sfxBus.gain.setTargetAtTime(P.s*P.s*1.6,t,tc);G.ambBus.gain.setTargetAtTime(P.a*P.a*1.5,t,tc);
 try{musOn=!P.mute}catch(e){}}
// ---------- état du lecteur ----------
const ST={cur:null,target:null,phase:'idle',outEnd:0,k:0,next:0,S:{},game:null,gameLvl:1,zone:null,zoneT:0,zoneCand:null,amb:null,ambTarget:null,ambPhase:'idle',ambEnd:0,log:[],started:false,fast:false};
const volOf=id=>GAIN[id]||1;
function logEv(e){ST.log.push(Object.assign({t:ctx?+ctx.currentTime.toFixed(3):0},e));if(ST.log.length>200)ST.log.shift()}
function want(id){if(id===undefined)return;if(id===ST.target&&ST.phase!=='idle')return;ST.target=id;const now=ctx.currentTime,P=prefs(),fo=ST.fast?Math.min(.5,P.fo):P.fo;
 if(ST.cur&&!T[ST.cur]&&ST.cur!==id){switchTo(id,now);return}
 if(ST.cur===id){if(ST.phase=='out'){ST.phase='in';G.musFade.gain.cancelScheduledValues(now);G.musFade.gain.setValueAtTime(G.musFade.gain.value,now);ST.inEnd=now+(ST.fast?.5:P.fi);G.musFade.gain.linearRampToValueAtTime(volOf(id),ST.inEnd);logEv({ev:'retour',id})}return}
 if(!ST.cur){switchTo(id,now);return}
 // fondu sortant : le morceau en cours continue pendant qu'il s'éteint, puis le suivant démarre (jamais les deux ensemble)
 if(ST.phase!=='out'){ST.phase='out';ST.outEnd=now+fo;G.musFade.gain.cancelScheduledValues(now);G.musFade.gain.setValueAtTime(G.musFade.gain.value,now);G.musFade.gain.linearRampToValueAtTime(0,now+fo);logEv({ev:'fondu-sortant',de:ST.cur,vers:id,d:fo})}}
function switchTo(id,now){const P=prefs(),fi=ST.fast?Math.min(.6,P.fi):P.fi;if(G.vinyl){try{G.vinyl.stop(now)}catch(e){}G.vinyl=null}
 ST.cur=id;ST.k=0;ST.S={};ST.next=now+.06;const Th=T[id];G.musFade.gain.cancelScheduledValues(now);G.musFade.gain.setValueAtTime(0,now);
 if(!Th){ST.phase='idle';logEv({ev:'silence',id});return}
 G.drumIn.frequency.setValueAtTime(Th.vinyl?4200:9000,now);G.revIn.gain.setValueAtTime(Th.rev!=null?Th.rev:.18,now);
 if(Th.vinyl){const s=ctx.createBufferSource();s.buffer=G.cr;s.loop=true;const e=ctx.createGain();e.gain.value=.5;s.connect(e);e.connect(G.musIn);s.start(now);G.vinyl=s}
 ST.phase='in';ST.inEnd=now+fi;G.musFade.gain.linearRampToValueAtTime(volOf(id),now+fi);logEv({ev:'début',id,d:fi})}
function sched(){if(!ctx||!G)return;const now=ctx.currentTime;
 if(ST.phase=='out'&&now>=ST.outEnd)switchTo(ST.target,now);
 if(ST.phase=='in'&&now>=ST.inEnd)ST.phase='play';
 const Th=ST.cur&&T[ST.cur];if(Th&&ST.phase!=='idle'){if(ST.next<now)ST.next=now+.02;const SD=60/Th.bpm/4;while(ST.next<now+.32){try{step(G,Th,ST.S,ST.k,ST.next)}catch(e){}ST.k++;ST.next+=SD}}}
// ---------- quelle musique ici ? ----------
function zone(){try{
 if(typeof tscr!='undefined'&&!tscr.hidden&&tscr.isConnected)return'menu';if(typeof creating!='undefined'&&creating)return'menu';
 if(typeof ARC!='undefined'&&ARC.on)return ARC.state=='game'&&ARC.cur&&T[ARC.cur.id]?ARC.cur.id:'arcade';if(typeof BW!='undefined'&&BW.on)return'bowling';
 const p=typeof place!='undefined'?place:'home';
 if(typeof p=='string'&&p.startsWith('cine_')){// même pendant la séance : la musique ne dépend que du lieu
  if(p=='cine_hall')return'cine_hall';if(p=='cine_couloir')return'cine_couloir';if(p=='cine_wc')return'cine_wc';if(p=='cine_prive')return'cine_prive';return'cine_salle'}
 if(p=='street')return'rue';if(['office','store','clothes','grocery','pets','cafe','gym','resto'].includes(p))return p;
 if(p=='home')return'maison';
 return null}catch(e){return null}}
function tick(){if(!ctx||!G)return;const now=ctx.currentTime;
 // une zone doit être stable un court instant (évite les changements quand on traverse rapidement)
 const z=zone();if(z!==null){if(z!==ST.zoneCand){ST.zoneCand=z;ST.zoneT=now}if(z!==ST.zone&&(now-ST.zoneT>=(ST.zone==null?0:.45)||ST.fast)){ST.zone=z;logEv({ev:'zone',z})}}
 const m=ST.game||ST.zone;if(m!==undefined&&m!==null&&m!==ST.target)want(m);else if(m&&ST.phase=='idle'&&ST.cur!==m)want(m);
 // ambiance du lieu (aucune pendant un mini-jeu)
 const a=ST.game?null:(ST.zone&&AMB[ST.zone]?ST.zone:null);
 if(a!==ST.ambTarget){ST.ambTarget=a;G.ambFade.gain.cancelScheduledValues(now);G.ambFade.gain.setValueAtTime(G.ambFade.gain.value,now);G.ambFade.gain.linearRampToValueAtTime(0,now+.9);ST.ambPhase='out';ST.ambEnd=now+.9}
 if(ST.ambPhase=='out'&&now>=ST.ambEnd){ambStop(ST.amb,now);ST.amb=ambStart(G,ST.ambTarget);ST.ambPhase=ST.amb?'in':'idle';if(ST.amb){G.ambFade.gain.setValueAtTime(0,now);G.ambFade.gain.linearRampToValueAtTime(1,now+1.5)}}
 if(ST.amb){const day=typeof night=='undefined'||night<.5;for(const[n,rate,cond]of ST.amb.ev){if(cond=='day'&&!day||cond=='night'&&day)continue;if(Math.random()<rate*.2)ambEvent(G,n,now+.05+Math.random()*.2)}}
 G.musLvl.gain.setTargetAtTime(ST.game?ST.gameLvl:1,now,.15);if(ST.phase=='play'&&ST.cur&&T[ST.cur])G.musFade.gain.setTargetAtTime(volOf(ST.cur),now,2)}
// ---------- démarrage (après une interaction, comme l'exigent les navigateurs) ----------
function start(){try{if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();G=graph(ctx,ctx.destination,true);applyPrefs(true);
  timer=setInterval(()=>{sched()},50);ambT=setInterval(tick,200);tick();sched();ST.started=true}
 if(ctx.state=='suspended'&&!document.hidden)ctx.resume()}catch(e){return null}return ctx}
// ---------- rendu hors ligne (tests, écoute) ----------
async function render(id,sec,o){o=o||{};const off=new OfflineAudioContext(2,Math.round(44100*sec),44100),g=graph(off,off.destination),Th=T[id];if(o.only)g.only=o.only;g.musFade.gain.value=(o.raw?1:(GAIN[id]||1));
 if(Th){g.drumIn.frequency.value=Th.vinyl?4200:9000;if(Th.vinyl){const s=off.createBufferSource();s.buffer=g.cr;s.loop=true;const e=off.createGain();e.gain.value=.5;s.connect(e);e.connect(g.musIn);s.start(0)}
  const SD=60/Th.bpm/4,S={};let t=.05,k=o.fromBar?o.fromBar*16:0;while(t<sec-.1){step(g,Th,S,k,t);k++;t+=SD}}
 const buf=await off.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;let peak=0,sum=0;const win=[],W=44100;let ws=0;
 for(let i=0;i<n;i++){const x=(L[i]+R[i])/2;peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));sum+=x*x;ws+=x*x;if((i+1)%W==0){win.push(Math.sqrt(ws/W));ws=0}}
 let side=0;for(let i=0;i<n;i+=7){const d=(L[i]-R[i])/2;side+=d*d}
 const res={id,peak,rms:Math.sqrt(sum/n),win,width:Math.sqrt(side/(n/7))/(Math.sqrt(sum/n)||1)};if(o.data)res.L=L;if(o.wav){const b=new ArrayBuffer(44+n*4),v=new DataView(b),w=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,44100,true);v.setUint32(28,176400,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){v.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);v.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true)}let bin='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));res.b64=btoa(bin)}
 return res}
// ---------- interface publique ----------
return{start,ctx:()=>start(),sfxIn:()=>G&&G.sfxIn,bus:()=>G,
 // musique d'un mini-jeu (prend la place de celle du lieu) ; null : on revient à l'ambiance du lieu
 game(id){start();if(!ctx)return;ST.game=id&&T[id]!==undefined?id:null;if(id&&T[id]===undefined)ST.game=null;ST.fast=true;tick();ST.fast=false},
 gameLevel(v){ST.gameLvl=v;if(G)G.musLvl.gain.setTargetAtTime(ST.game?v:1,ctx.currentTime,.12)},
 gameName:()=>ST.game,
 want:(id)=>{start();if(ctx)want(id)},prefs,set(k,v){const P=prefs();P[k]=v;applyPrefs();try{save()}catch(e){}},
 state:()=>({cur:ST.cur,target:ST.target,phase:ST.phase,zone:ST.zone,game:ST.game,amb:ST.amb&&ST.amb.id,ambPhase:ST.ambPhase,fade:G?G.musFade.gain.value:0,ctx:ctx?ctx.state:null,lvl:G?G.musLvl.gain.value:1}),
 log:()=>ST.log.slice(),themes:()=>Object.keys(T),theme:id=>T[id],score,render,GAIN,zone,tick,sched,AMB}})();
// ---------- branchement dans Little Life (le moteur d'origine est remplacé, ses noms restent valables) ----------
try{
 // un seul contexte audio pour tout le jeu : AC / mg (utilisés ailleurs) désignent celui du gestionnaire
 startAudio=function(){const c=LLSON.start();if(c&&!AC){AC=c;mg=LLSON.bus().musIn}};
 pump=function(){LLSON.tick();LLSON.sched()};
 setTheme=function(th){LLSON.want(th)};
 window.__mus={render:async(th,sec)=>(await LLSON.render(th,sec,{data:1})).L,start:()=>startAudio(),cur:()=>LLSON.state().cur,pump:()=>pump(),state:()=>LLSON.state()};
 addEventListener('keydown',()=>startAudio(),{passive:true});
 document.addEventListener('visibilitychange',()=>{const c=LLSON.bus()&&LLSON.bus().c;if(!c)return;if(document.hidden)c.suspend();else if(!(typeof rotQ!='undefined'&&rotQ.matches))c.resume()});
 // bouton ♪ du haut : coupe ou rétablit tout le son
 const syncMute=()=>{const P=LLSON.prefs();try{musOn=!P.mute;N.mus=!P.mute}catch(e){}bMus.classList.toggle('on',!P.mute);bMus.setAttribute('aria-label',P.mute?'Rétablir le son':'Couper le son')};
 bMus.onclick=()=>{startAudio();const P=LLSON.prefs();LLSON.set('mute',!P.mute);syncMute();say(P.mute?'Son coupé.':'Son activé, bonne écoute !')};syncMute();
 // menu : trois volumes indépendants (musique, effets, ambiances) + coupure générale
 const st=document.createElement('style');st.textContent='.gson{display:flex;flex-direction:column;gap:6px;align-items:stretch!important}.gson label{display:flex;align-items:center;gap:10px;font-size:13px}.gson label span{min-width:88px;text-align:left}.gson input{flex:1;accent-color:#7a5cff;height:28px}.gson output{min-width:34px;text-align:right;font-variant-numeric:tabular-nums;opacity:.8}';document.head.appendChild(st);
 const gm=document.getElementById('gMus');if(gm){gm.querySelector('span').textContent='Son';const box=document.createElement('div');box.className='gi gson';box.id='gSon';
  box.innerHTML=[['m','Musique'],['s','Effets'],['a','Ambiances']].map(([k,l])=>`<label><span>${l}</span><input type="range" min="0" max="100" step="5" data-k="${k}" aria-label="Volume ${l.toLowerCase()}"><output></output></label>`).join('');
  gm.after(box);box.querySelectorAll('input').forEach(i=>{i.oninput=()=>{startAudio();LLSON.set(i.dataset.k,+i.value/100);i.nextElementSibling.textContent=i.value+' %'}});
  box.addEventListener('click',e=>e.stopPropagation())}
 const _gd=gDraw;gDraw=function(){_gd();const P=LLSON.prefs(),m=document.getElementById('gMus');if(m){m.querySelector('b').textContent=P.mute?'Coupé':'Activé';m.classList.toggle('off',!!P.mute)}
  document.querySelectorAll('#gSon input').forEach(i=>{i.value=Math.round(P[i.dataset.k]*100);i.nextElementSibling.textContent=i.value+' %'})};
}catch(e){console.error(e)}
