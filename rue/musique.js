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
 g.hp=c.createBiquadFilter();g.hp.type='highpass';g.hp.frequency.value=38;g.hp.Q.value=.7;g.musIn.connect(g.hp);g.hp.connect(g.musFade);g.rev=c.createConvolver();g.rev.buffer=irBuf(c,2.6,2.8);g.revIn=c.createGain();g.revIn.gain.value=.32;g.revIn.connect(g.rev);g.rev.connect(g.musFade);
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
  const e=g.c.createGain(),a=(o&&o.att)||1;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+a);e.gain.setValueAtTime(v,t+Math.max(a,d));e.gain.linearRampToValueAtTime(0,t+d+1.6);
  for(const dt of[-7,7]){const x=osc(g,'sawtooth',f,t,end);x.detune.value=dt;x.connect(lp)}lp.connect(e);out(g,{node:e,pan:(o&&o.pan)||0,rev:.55})},
 // cordes : comme la nappe, plus lente, avec vibrato
 strings(g,n,t,d,v,o){const f=mf(n),end=t+d+2.5,lp=g.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=(o&&o.br)||1600;lp.Q.value=.5;const e=g.c.createGain(),a=(o&&o.att)||1.4;
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+a);e.gain.setValueAtTime(v,t+Math.max(a,d));e.gain.linearRampToValueAtTime(0,t+d+2);const vib=osc(g,'sine',5,t,end),vg=g.c.createGain();vg.gain.value=f*.004;vib.connect(vg);
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
 // flûte douce : sinus + souffle
 flute(g,n,t,d,v,o){const f=mf(n),end=t+d+.4,e=g.c.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.06);e.gain.setTargetAtTime(.0001,t+d,.1);const a=osc(g,'sine',f,t,end),vib=osc(g,'sine',4.8,t,end),vg=g.c.createGain();vg.gain.value=f*.006;vib.connect(vg);vg.connect(a.frequency);a.connect(e);
  const s=g.c.createBufferSource();s.buffer=g.nz;const bp=g.c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=4;const bg=g.c.createGain();bg.gain.value=.25;s.connect(bp);bp.connect(bg);bg.connect(e);s.start(t,Math.random());s.stop(end);out(g,{node:e,pan:(o&&o.pan)||0,rev:.45})}};
// ---------- notes mises en cache : un instrument qui s'éteint seul est calculé une fois par hauteur, puis relu ----------
const CACHEABLE={ep:[1.7,.35],piano:[2.1,.4],pluck:[1.1,.3],kalimba:[.95,.4],marimba:[.6,.25],bell:[2.1,.6]},NC=new Map(),NQ=[];let NQbusy=false;
function noteKey(i,n,o){return i+'|'+n+'|'+(o&&o.br||'')+'|'+(o&&o.bright||'')}
async function renderNote(){if(NQbusy||!NQ.length)return;NQbusy=true;const[key,i,n,o]=NQ.shift();try{const len=CACHEABLE[i][0],off=new OfflineAudioContext(1,Math.round(22050*len),22050),og={c:off,nz:null,bs:{}};
  og.musIn=off.createGain();og.musIn.connect(off.destination);og.revIn=off.createGain();og.nz=noiseBuf(off);I[i](og,n,0,len-.5,1,Object.assign({},o,{pan:0}));NC.set(key,await off.startRendering());if(NC.size>140)NC.delete(NC.keys().next().value)}catch(e){}NQbusy=false;if(NQ.length)setTimeout(renderNote,15)}
const TRIM={bass:.38,sub:.36,ep:2.1,piano:2,pluck:2.2,kalimba:2,marimba:2,bell:2,lead:2.1,flute:2.2,pad:1.9,strings:1.9};
function play(g,i,n,t,d,v,o){v*=TRIM[i]||1;const C=CACHEABLE[i];if(C&&g.live){const key=noteKey(i,n,o),b=NC.get(key);
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
 brush:()=>['br',.2,(sr,n)=>nzS(sr,n,'bp',3200,.6,.06)],
 tom:(f)=>['tm'+f,.55,(sr,n)=>{const y=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const t=i/sr;ph+=2*Math.PI*f*(.6+.4*Math.exp(-t/.1))/sr;y[i]=Math.sin(ph)*Math.exp(-t/.12)}return y}]};
function hit(g,t,v,spec,pan){const[k,len,fn]=spec,s=g.c.createBufferSource();s.buffer=smp(g,k,len,fn);const e=g.c.createGain();e.gain.value=v;s.connect(e);e.connect(bus(g,pan||0,0,g.drumIn));s.start(t)}
const D={
 kick(g,t,v,o){const k=Object.assign({f0:140,f1:44,len:.42},o||{});k.f1=Math.max(k.f1,46);hit(g,t,v*.42,SMP.kick(k))},
 snare(g,t,v){hit(g,t,v,SMP.snare())},clap(g,t,v){hit(g,t,v*.95,SMP.clap(),.1)},rim(g,t,v){hit(g,t,v*1.4,SMP.rim(),.2)},
 hat(g,t,v,open){hit(g,t,v*1.9,open?SMP.ohat():SMP.hat(),open?-.35:.4)},shaker(g,t,v){hit(g,t,v*1.7,SMP.shaker(),-.3)},brush(g,t,v){hit(g,t,v*1.6,SMP.brush(),-.15)},tom(g,t,v,f){hit(g,t,v*.6,SMP.tom(f||110))},
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
// ---------- mélodies : motif de 2 mesures, réponse, retour du motif, cadence ----------
const RH={// rythmes (pas de double-croche → durée en pas)
 slow:[[[0,6],[8,4],[12,4]],[[0,8],[10,6]],[[2,6],[8,8]],[[0,4],[6,6],[12,4]]],
 pop:[[[0,3],[4,2],[6,2],[8,4],[12,2],[14,2]],[[0,2],[2,2],[4,4],[10,2],[12,4]],[[2,2],[4,2],[6,4],[12,4]],[[0,4],[4,2],[6,2],[8,6]]],
 busy:[[[0,2],[2,2],[4,1],[6,2],[8,2],[10,2],[12,2],[14,2]],[[0,1],[2,1],[3,2],[6,2],[8,1],[10,2],[12,4]],[[0,2],[3,2],[6,2],[8,2],[11,2],[14,2]]],
 sparse:[[[0,8]],[[4,8]],[[0,4],[8,8]],[[6,10]]]};
function makeMotif(T,sec,pass,r){const bank=RH[T.mel&&T.mel.rh||'pop'],bars=[];for(let b=0;b<2;b++)bars.push(bank[Math.floor(r()*bank.length)]);
 // contour : marche aléatoire sur les degrés de la gamme, notes d'appui sur les temps forts
 let p=Math.floor(r()*3)+2;const steps=bars.map(bar=>bar.map(([st,du])=>{p+=Math.floor(r()*5)-2;if(p<0)p=1;if(p>8)p=7;return[st,du,p]}));return steps}
function melodyNote(T,S,p,st){// degré de gamme → note ; sur les temps forts, on aimante vers une note de l'accord
 let n=deg(T,p)+12*(T.mel&&T.mel.oct||1);if(st%4==0&&S.chord){let best=n,bd=99;for(const c of S.chord)for(let o=-24;o<=24;o+=12){const d=Math.abs(c+o-n);if(d<bd){bd=d;best=c+o}}if(bd<=2)n=best}return n}
// ---------- arrangeur ----------
const pat=(p,s)=>p&&p[s%p.length]!=='.'&&p[s%p.length]!==undefined?p[s%p.length]:null;
function secAt(T,bar){const F=T.form,tot=F.reduce((a,f)=>a+f[1],0),intro=F[0][0]=='I'?F[0][1]:0;let b=bar;if(b>=tot)b=intro+((b-intro)%(tot-intro));let i=0;while(b>=F[i][1]){b-=F[i][1];i++}return{sec:F[i][0],b,len:F[i][1],idx:i,pass:Math.floor(Math.max(0,bar-intro)/(tot-intro))}}
function newBar(g,T,S,bar,t,SD){const X=secAt(T,bar),L=(T.secs&&T.secs[X.sec])||{},prog=T.prog[X.sec]||T.prog.A,ci=X.b%prog.length;S.sec=X.sec;S.secB=X.b;S.L=L;S.pass=X.pass;
 const c=chordOf(T,prog[ci]);S.root=c[0];S.chord=voice(S.chord,c,T.lo||53,T.hi||72);S.half=T.half?chordOf(T,(T.prog[X.sec+'2']||prog)[ci]):null;
 if(X.b==0||!S.motif||S.motifSec!==X.sec){const r=rng(hashStr(T.id+X.sec)+(T.vary&&X.sec!=T.vary?X.pass*7919:0));S.motif=makeMotif(T,X.sec,X.pass,r);S.motifSec=X.sec;S.mr=r}
 // montée avant un refrain, respiration sur la dernière mesure d'une section
 if(T.riser&&X.b==X.len-1&&(secAt(T,bar+1).sec=='B'))D.riser(g,t,16*SD,.05*T.riser);S.fill=X.b==X.len-1}
function step(g,T,S,k,t){const SD=60/T.bpm/4,s=k%16,bar=Math.floor(k/16);if(s==0)newBar(g,T,S,bar,t,SD);const L=S.L||{},sw=(s%2==1)?SD*(T.swing||0):0,tt=t+sw,V=T.v||{};
 const on=x=>L[x]!==0&&L[x]!==false;
 // batterie
 if(T.dr&&on('dr')){const Dr=T.dr,f=S.fill&&s>=12&&Dr.fill;
  if(pat(Dr.k,s)&&!(L.dr==2&&s%8))D.kick(g,tt,(V.k||.5)*(pat(Dr.k,s)=='o'?.6:1),Dr.kick);
  if(f&&s%2==0)D[Dr.fill](g,tt,(V.s||.3)*(.5+(s-12)*.12));else{if(pat(Dr.s,s))D[Dr.sn||'snare'](g,tt,(V.s||.3)*(pat(Dr.s,s)=='o'?.35:1));if(pat(Dr.c,s))D.clap(g,tt,V.c||.25)}
  if(L.dr!==2){if(pat(Dr.h,s))D.hat(g,tt,(V.h||.08)*(pat(Dr.h,s)=='o'?.55:1)*(s%4==2?1:.8));if(pat(Dr.oh,s))D.hat(g,tt,V.oh||.06,true);if(pat(Dr.sh,s))D.shaker(g,tt,(V.sh||.06)*(s%2?.6:1));if(pat(Dr.rim,s))D.rim(g,tt,V.rim||.12);if(pat(Dr.br,s))D.brush(g,tt,(V.br||.08)*(s%4==0?1:.6))}}
 // basse
 if(T.bs&&on('bs')){const b=pat(T.bs.p,s);if(b){let n=S.root-12;if(b=='5')n+=7;else if(b=='8')n+=12;else if(b=='3')n=S.chord[1]-12;else if(b=='w'){const ws=[0,4,7,10][(s/4)%4|0];n=S.root-12+ws;if(s==12)n=S.root-13}
  while(n>(T.bs.hi||48))n-=12;while(n<(T.bs.lo||33))n+=12;play(g,T.bs.i||'bass',n,tt,SD*(T.bs.d||2),V.b||.22,{br:T.bs.br})}}
 // accords
 if(T.ch&&on('ch')){const c=pat(T.ch.p,s);if(c){const ns=(T.ch.top?S.chord.slice(-T.ch.top):S.chord).map(x=>x+12*(T.ch.oct||0)),d=SD*(c=='-'?(T.ch.dl||12):(T.ch.d||2));
  ns.forEach((n,i)=>play(g,T.ch.i,n,tt+i*(T.ch.strum||0),d,(V.ch||.06)*(c=='o'?.6:1),{pan:ns.length>1?(i/(ns.length-1)-.5)*.9:0,br:T.ch.br}))}}
 // nappe (une fois par mesure)
 if(T.pd&&on('pd')&&s==0)S.chord.forEach((n,i)=>play(g,T.pd.i||'pad',n+12*(T.pd.oct||0),tt,SD*16,V.pd||.03,{pan:(i%2?.6:-.6),br:T.pd.br,att:T.pd.att}));
 if(T.pd&&on('pd')&&T.pd.pump&&s%4==2)S.chord.slice(0,2).forEach((n,i)=>play(g,'pluck',n+12,tt,SD*1.5,(V.pd||.03)*.8,{pan:i?.4:-.4,br:1800}));
 // arpège
 if(T.ar&&on('ar')){const a=pat(T.ar.p,s);if(a){const seq=T.ar.seq||[0,1,2,1],i=seq[(s/(T.ar.rate||2)|0)%seq.length],n=S.chord[i%S.chord.length]+12*(T.ar.oct||1)+(i>=S.chord.length?12:0);play(g,T.ar.i||'pluck',n,tt,SD*(T.ar.d||2),(V.ar||.04)*(a=='o'?.6:1),{pan:(k%2?.5:-.5)*(.6+.4*Math.sin(k*.37)),br:T.ar.br})}}
 // mélodie (motif / réponse / motif / cadence sur 8 mesures)
 if(T.mel&&on('mel')&&S.motif){const ph=S.secB%8,half=S.motif[ph%2],tr=ph>=2&&ph<4?1:ph>=6?-1:0,inst=(S.sec=='B'&&T.mel.i2)||T.mel.i;
  for(const[st,du,p]of half)if(st==s){if(ph==7&&st>=8)continue;let n=melodyNote(T,S,p+tr+(S.sec=='B'&&T.mel.up?2:0),st);if(ph==7&&st==0)n=melodyNote(T,S,0,0)+12*(T.mel.oct||1);
   if(T.mel.dens<1&&S.mr()>T.mel.dens)continue;play(g,inst,n,tt,SD*du,(V.mel||.05)*(S.sec=='C'?.8:1),{pan:.2,br:T.mel.br})}}
 // contre-chant de cloches / texture
 if(T.bl&&on('bl')&&s==T.bl.at&&S.mr&&S.mr()<(T.bl.p||.5))play(g,T.bl.i||'bell',S.chord[Math.floor(S.mr()*S.chord.length)]+24,tt,2,V.bl||.025,{pan:(S.mr()-.5)*1.4})}
// ---------- les morceaux (un par lieu, un par mini-jeu) ----------
// Batteries types (16 doubles-croches par mesure ; x = coup, o = coup léger)
const LOFI={k:'x......x..x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.xo',kick:{f0:110,f1:42,len:.34},fill:'rim'};
const HOUSE={k:'x...x...x...x...',c:'....x.......x...',h:'o.o.o.o.o.o.o.o.',oh:'..x...x...x...x.',kick:{f0:150,f1:45,len:.3},fill:'snare'};
const POP={k:'x.......x.x.....',s:'....x.......x...',sh:'xxxxxxxxxxxxxxxx',kick:{f0:130,f1:46,len:.36},fill:'snare'};
const FORM=[['I',4],['A',8],['B',8],['A',8],['C',8],['B',8]];
const FULL={I:{dr:0,bs:0,mel:0,ar:0},A:{ar:0},B:{},C:{dr:2,bs:0}};
const T={};const def=(id,o)=>{T[id]=Object.assign({id,form:FORM,secs:FULL,swing:0,ext:7,lo:53,hi:72},o)};
// —— menu principal : signature de Little Life (lo-fi électronique : piano électrique, batterie légère, basse chaude, nappes, texture vinyle)
def('menu',{bpm:84,swing:.12,key:53,mode:'maj',ext:9,prog:{I:[4,4,1,1],A:[2,5,1,6],B:[4,5,3,6],C:[4,4,1,1]},dr:LOFI,bs:{p:'R......5..R.....',d:5},ch:{i:'ep',p:'x.....o.......o.',d:3,dl:12},pd:{i:'pad',br:900},
 mel:{i:'ep',i2:'bell',rh:'pop',oct:1},bl:{at:10,p:.35},vinyl:1,v:{k:.42,s:.2,h:.05,b:.2,ch:.05,pd:.022,mel:.055,bl:.02}});
// —— maison
def('salon',{bpm:96,swing:.06,key:55,mode:'maj',ext:7,prog:{I:[1,1,4,4],A:[1,5,6,4],B:[4,1,5,6],C:[6,4,1,5]},dr:POP,bs:{p:'R.....5.R.....5.',d:3},ch:{i:'pluck',p:'x..x..x...x.x...',d:3,strum:.018,br:2600},pd:{br:800},
 mel:{i:'flute',i2:'kalimba',rh:'pop',oct:1},v:{k:.4,s:.2,sh:.035,b:.2,ch:.045,pd:.018,mel:.05}});
def('chambre',{bpm:70,swing:.14,key:52,mode:'maj',ext:9,prog:{I:[1,1,4,4],A:[1,3,4,4],B:[6,5,4,1],C:[4,4,1,1]},dr:{k:'x.........x.....',s:'....x.......x...',sn:'rim',h:'x...x...x...x...',kick:{f0:95,f1:40,len:.3},fill:'rim'},
 bs:{p:'R.........5.....',d:8},ch:{i:'ep',p:'x.......o.......',d:6,dl:14,bright:1},pd:{br:700,att:2},mel:{i:'ep',rh:'slow',oct:1,dens:.75},vinyl:1,secs:{I:{dr:0,bs:0,mel:0},A:{},B:{},C:{dr:0}},v:{k:.3,s:.12,h:.03,b:.16,ch:.05,pd:.022,mel:.045}});
def('cuisine',{bpm:112,key:60,mode:'maj',ext:3,prog:{I:[1,4,1,4],A:[1,4,6,5],B:[4,5,1,6],C:[6,5,4,4]},dr:{k:'x.......x.......',s:'....x.......x...',sh:'x.x.x.x.x.x.x.x.',kick:{f0:130,f1:48,len:.3},fill:'snare'},
 bs:{p:'R.R.....R.R.5...',d:1.6},ch:{i:'piano',p:'..x...x...x...x.',d:1.5,top:3},ar:{i:'marimba',p:'x.x.x.x.x.x.x.x.',seq:[0,1,2,1],d:2},mel:{i:'kalimba',i2:'bell',rh:'pop',oct:1},secs:{I:{dr:0,mel:0,bs:0},A:{},B:{},C:{dr:2,ar:0}},v:{k:.42,s:.2,sh:.04,b:.2,ch:.04,ar:.035,mel:.055}});
def('bain',{bpm:66,key:62,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,1,5],B:[4,2,1,5],C:[2,2,1,1]},bs:{i:'sub',p:'R...............',d:14},pd:{br:1300,att:2.2},bl:{at:6,p:.6,i:'bell'},mel:{i:'flute',rh:'sparse',oct:1,dens:.6},
 secs:{I:{mel:0},A:{},B:{},C:{mel:0}},v:{b:.16,pd:.03,bl:.03,mel:.04}});
def('bureau',{bpm:82,swing:.08,key:50,mode:'dor',ext:7,prog:{I:[1,1,4,4],A:[1,4,1,5],B:[6,7,1,1],C:[4,4,1,1]},dr:{k:'x.......x.......',rim:'....x.......x...',h:'x.x.x.x.x.x.x.x.',kick:{f0:100,f1:42,len:.3},fill:'rim'},
 bs:{p:'R...............',d:12},ar:{i:'piano',p:'x.x.x.x.x.x.x.x.',seq:[0,2,1,3,2,1],d:3,oct:1},pd:{br:800},mel:{i:'piano',rh:'sparse',oct:2,dens:.8},secs:{I:{dr:0,mel:0},A:{mel:0},B:{},C:{dr:0}},v:{k:.3,rim:.08,h:.035,b:.18,ar:.035,pd:.018,mel:.045}});
// —— extérieur et bâtiments
def('rue',{bpm:116,key:57,mode:'min',ext:7,prog:{I:[1,6,3,7],A:[1,6,3,7],B:[6,7,1,1],C:[4,4,6,6]},dr:HOUSE,bs:{i:'sub',p:'..R...R...R...R.',d:2},ch:{i:'ep',p:'..x.....x.x.....',d:1.5},pd:{br:1200,pump:1},
 ar:{i:'pluck',p:'x.xxx.xxx.xxx.x.',seq:[0,1,2,3],rate:1,d:1,oct:1,br:2600},mel:{i:'lead',rh:'pop',oct:1,dens:.85,br:2200},riser:1,secs:{I:{dr:2,bs:0,mel:0,ar:0},A:{ar:0},B:{},C:{dr:0,bs:0,ar:0}},v:{k:.5,c:.22,h:.05,oh:.04,b:.26,ch:.04,pd:.02,ar:.025,mel:.04}});
def('office',{bpm:100,key:62,mode:'maj',ext:7,prog:{I:[1,4,1,4],A:[1,3,4,5],B:[6,4,1,5],C:[4,4,2,2]},dr:{k:'x.....x.x.......',rim:'....x.......x...',h:'x.x.x.x.x.x.x.x.',kick:{f0:110,f1:44,len:.28},fill:'rim'},
 bs:{p:'R.......R...5...',d:4},ar:{i:'pluck',p:'x.x.x.x.x.x.x.x.',seq:[0,1,2,3,2,1],d:2,oct:1,br:2000},pd:{br:900},mel:{i:'bell',rh:'sparse',oct:1,dens:.8},secs:{I:{dr:0,mel:0},A:{},B:{},C:{dr:2}},v:{k:.34,rim:.07,h:.03,b:.18,ar:.03,pd:.018,mel:.03}});
def('store',{bpm:104,swing:.05,key:53,mode:'maj',ext:9,prog:{I:[1,1,2,2],A:[1,2,3,2],B:[4,5,3,6],C:[2,5,1,1]},dr:{k:'x.....x.x.....x.',rim:'x..x..x...x..x..',sh:'xxxxxxxxxxxxxxxx',kick:{f0:105,f1:44,len:.28},fill:'rim'},
 bs:{p:'R.....5.R.....5.',d:3},ch:{i:'ep',p:'x..x..x...x..x..',d:2},mel:{i:'flute',rh:'slow',oct:1,dens:.85},pd:{br:800},v:{k:.34,rim:.08,sh:.03,b:.2,ch:.04,pd:.015,mel:.045}});
def('clothes',{bpm:120,key:50,mode:'dor',ext:9,prog:{I:[1,1,4,4],A:[1,4,1,4],B:[6,7,1,4],C:[4,4,5,5]},dr:Object.assign({},HOUSE,{h:'xoxoxoxoxoxoxoxo'}),bs:{i:'sub',p:'..R..R....R..R.5',d:1.5},ch:{i:'ep',p:'..x..x.....x....',d:1.2},
 pd:{br:1000,pump:1},mel:{i:'lead',rh:'sparse',oct:1,br:1800},riser:1,secs:{I:{bs:0,mel:0},A:{},B:{},C:{dr:2,bs:0}},v:{k:.5,c:.2,h:.045,oh:.035,b:.26,ch:.04,pd:.018,mel:.035}});
def('grocery',{bpm:110,key:55,mode:'maj',ext:3,prog:{I:[1,5,1,5],A:[1,5,4,5],B:[4,1,5,1],C:[6,4,5,5]},dr:{k:'x.......x.x.....',c:'....x.......x...',sh:'x.x.x.x.x.x.x.x.',kick:{f0:125,f1:46,len:.3},fill:'snare'},
 bs:{p:'R...5...R...5...',d:3},ch:{i:'pluck',p:'x.x.x.xxx.x.x.xx',d:1,top:3,oct:1,br:3200},mel:{i:'kalimba',i2:'flute',rh:'pop',oct:1},v:{k:.4,c:.2,sh:.035,b:.2,ch:.03,mel:.055}});
def('pets',{bpm:100,key:60,mode:'maj',ext:3,prog:{I:[1,4,1,5],A:[1,6,4,5],B:[4,5,3,6],C:[2,5,1,1]},dr:{k:'x.......x.......',c:'............x...',sh:'..x...x...x...x.',kick:{f0:120,f1:50,len:.25},fill:'rim'},
 bs:{p:'R...R...5...R...',d:1.5},ch:{i:'pluck',p:'x...x...x...x...',d:.8,top:3,br:1800},ar:{i:'marimba',p:'..x...x.x...x.x.',seq:[2,1,0,1,2,3],d:1.5,oct:1},mel:{i:'kalimba',rh:'busy',oct:1,dens:.8},v:{k:.36,c:.18,sh:.04,b:.2,ch:.035,ar:.04,mel:.05}});
def('cafe',{bpm:86,swing:.18,key:51,mode:'maj',ext:9,prog:{I:[2,5,1,1],A:[2,5,1,6],B:[4,3,2,5],C:[4,4,3,6]},dr:{k:'x.........x.....',s:'....x.......x...',sn:'rim',br:'x...x...x...x...',kick:{f0:95,f1:42,len:.3},fill:'rim'},
 bs:{p:'w...w...w...w...',d:3.6},ch:{i:'ep',p:'..x....x..x.....',d:2.5,bright:1.2},mel:{i:'ep',i2:'flute',rh:'pop',oct:1,dens:.9},pd:{br:700},vinyl:1,v:{k:.3,s:.12,br:.07,b:.22,ch:.05,pd:.014,mel:.05}});
def('gym',{bpm:124,key:57,mode:'min',ext:7,prog:{I:[1,1,6,6],A:[1,6,7,5],B:[6,7,1,1],C:[4,4,6,7]},dr:Object.assign({},HOUSE,{h:'xxxxxxxxxxxxxxxx'}),bs:{i:'sub',p:'..R.8.R...R.8.R.',d:1.2},
 ar:{i:'pluck',p:'x.x.x.x.x.x.x.x.',seq:[0,2,1,3],d:1.2,oct:1,br:3000},pd:{br:1400,pump:1},mel:{i:'lead',rh:'busy',oct:1,dens:.9,br:2600},riser:2,secs:{I:{bs:0,mel:0,ar:0},A:{mel:0},B:{},C:{dr:2,bs:0}},v:{k:.38,c:.26,h:.06,oh:.05,b:.2,ar:.05,pd:.026,mel:.055}});
// —— cinéma : chaque espace a son morceau
def('cine_hall',{bpm:72,key:50,mode:'min',ext:9,prog:{I:[1,6,1,6],A:[1,6,3,7],B:[6,4,1,5],C:[4,5,6,6]},dr:{k:'x.......x.......',kick:{f0:90,f1:50,len:.5}},pd:{i:'strings',br:1500,att:1.6},
 ar:{i:'piano',p:'x...x...x...x...',seq:[0,1,2,3],d:6,oct:1},mel:{i:'piano',rh:'slow',oct:2},bl:{at:12,p:.3},secs:{I:{dr:0,mel:0},A:{dr:0},B:{},C:{ar:0}},v:{k:.3,pd:.024,ar:.035,mel:.045,bl:.02}});
def('cine_couloir',{bpm:60,key:45,mode:'min',ext:7,prog:{I:[1,1,6,6],A:[1,6,4,5],B:[1,6,4,5],C:[4,4,1,1]},bs:{i:'sub',p:'R...............',d:15},pd:{i:'strings',br:900,att:2.5,oct:-1},bl:{at:8,p:.4},secs:{I:{},A:{},B:{},C:{}},v:{b:.15,pd:.028,bl:.025}});
def('cine_salle',{bpm:76,key:55,mode:'maj',ext:9,prog:{I:[1,4,1,4],A:[1,5,6,4],B:[4,5,3,6],C:[6,4,5,5]},pd:{i:'strings',br:1800,att:1.4},ar:{i:'piano',p:'x.x.x.x.x.x.x.x.',seq:[0,1,2,3,2,1],d:4,oct:1},
 mel:{i:'piano',rh:'slow',oct:2},bs:{p:'R.......R.......',d:7},secs:{I:{mel:0,bs:0},A:{},B:{},C:{ar:0}},v:{pd:.022,ar:.03,mel:.05,b:.16}});
def('cine_prive',{bpm:90,swing:.16,key:56,mode:'maj',ext:9,prog:{I:[2,5,1,1],A:[2,5,3,6],B:[4,5,1,6],C:[4,3,2,5]},dr:{k:'x.........x.....',br:'x.x.x.x.x.x.x.x.',s:'....x.......x...',sn:'rim',kick:{f0:95,f1:42,len:.3}},
 bs:{p:'w...w...w...w...',d:3.6},ch:{i:'ep',p:'x.....x...x.....',d:3},pd:{i:'strings',br:1400},mel:{i:'flute',rh:'pop',oct:1,dens:.85},v:{k:.28,s:.1,br:.05,b:.2,ch:.045,pd:.018,mel:.045}});
def('cine_wc',{bpm:70,key:61,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,5,2,2],B:[4,5,1,1],C:[2,1,2,1]},pd:{br:1100,att:2},bl:{at:4,p:.5,i:'kalimba'},bs:{i:'sub',p:'R...............',d:14},secs:{I:{},A:{},B:{},C:{}},v:{pd:.026,bl:.03,b:.14}});
// —— salle d'arcade et bowling
def('arcade',{bpm:122,key:52,mode:'min',ext:7,prog:{I:[1,6,7,1],A:[1,6,4,5],B:[6,4,1,5],C:[4,4,6,7]},dr:HOUSE,bs:{i:'sub',p:'..R...R...R...R.',d:2},pd:{br:1500,pump:1},
 ar:{i:'pluck',p:'xxxxxxxxxxxxxxxx',seq:[0,1,2,3,2,1],rate:1,d:1,oct:1,br:3000},mel:{i:'lead',rh:'pop',oct:1,br:2600},riser:2,secs:{I:{bs:0,mel:0},A:{mel:0},B:{},C:{dr:2,bs:0}},v:{k:.35,c:.24,h:.06,oh:.045,b:.19,ar:.045,pd:.026,mel:.055}});
def('bowling',{bpm:114,key:50,mode:'dor',ext:7,prog:{I:[1,4,1,4],A:[1,4,1,5],B:[4,5,1,1],C:[6,5,4,4]},dr:{k:'x...x...x...x...',c:'....x.......x...',oh:'..x...x...x...x.',sh:'xxxxxxxxxxxxxxxx',kick:{f0:130,f1:46,len:.3},fill:'snare'},
 bs:{p:'R.8.R.8.R.8.R.8.',d:1.4,br:700},ch:{i:'pluck',p:'..x..x....x..x..',d:.8,top:3,oct:1,br:3000},pd:{i:'strings',br:1600},mel:{i:'lead',rh:'pop',oct:1},v:{k:.46,c:.22,oh:.04,sh:.025,b:.24,ch:.035,pd:.016,mel:.04}});
// —— mini-jeux de la borne : adresse = dynamique, réflexion = électronique légère, construction = chill, course = énergique
def('pinball',{bpm:128,key:57,mode:'min',ext:7,prog:{I:[1,1,6,6],A:[1,6,3,7],B:[6,7,1,5],C:[4,4,5,5]},dr:{k:'x.....x...x.....',s:'....x.......x..o',h:'xxxxxxxxxxxxxxxx',kick:{f0:150,f1:46,len:.3},fill:'snare'},
 bs:{i:'sub',p:'.R..R..R.R..R...',d:1.2},ar:{i:'pluck',p:'x.xxx.xxx.xxx.xx',seq:[0,2,1,3],rate:1,d:1,oct:1,br:3400},mel:{i:'lead',rh:'busy',oct:1,br:2800},riser:2,secs:{I:{bs:0,mel:0},A:{},B:{},C:{dr:2}},v:{k:.52,s:.26,h:.04,b:.26,ar:.028,mel:.04}});
def('racing',{bpm:140,key:52,mode:'min',ext:7,prog:{I:[1,1,7,7],A:[1,7,6,7],B:[6,7,1,1],C:[4,5,6,6]},dr:{k:'x.........x.....',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx',oh:'..x.......x.....',kick:{f0:150,f1:46,len:.28},fill:'snare'},
 bs:{p:'R.RR.RR.R.RR.RR.',d:.9,br:900},ar:{i:'pluck',p:'xxxxxxxxxxxxxxxx',seq:[0,1,2,1],rate:1,d:.8,oct:1,br:3500},pd:{br:1600},mel:{i:'lead',rh:'pop',oct:1,br:3000},riser:2,secs:{I:{mel:0},A:{},B:{},C:{dr:2,ar:0}},v:{k:.55,s:.28,h:.04,oh:.03,b:.22,ar:.024,pd:.016,mel:.042}});
def('mole',{bpm:120,key:60,mode:'maj',ext:3,prog:{I:[1,5,1,5],A:[1,5,6,4],B:[4,5,1,1],C:[6,4,5,5]},dr:{k:'x...x...x...x...',c:'....x.......x...',h:'x.x.x.x.x.x.x.x.',kick:{f0:140,f1:48,len:.26},fill:'snare'},
 bs:{p:'R.R.R.R.R.R.R.R.',d:1,br:700},ar:{i:'marimba',p:'x.xxx.xxx.xxx.xx',seq:[0,1,2,1],rate:1,d:1,oct:1},mel:{i:'kalimba',rh:'busy',oct:1},secs:{I:{mel:0},A:{},B:{},C:{dr:2}},v:{k:.48,c:.22,h:.04,b:.2,ar:.035,mel:.05}});
def('hockey',{bpm:126,key:55,mode:'mix',ext:7,prog:{I:[1,7,1,7],A:[1,7,4,1],B:[4,5,1,7],C:[4,4,5,5]},dr:HOUSE,bs:{i:'sub',p:'R..R..R...R..R..',d:1.2},ch:{i:'pluck',p:'..x...x...x...x.',d:1,top:3,oct:1,br:2800},mel:{i:'lead',rh:'pop',oct:1},riser:1,v:{k:.5,c:.22,h:.04,oh:.035,b:.26,ch:.03,mel:.04}});
def('maze',{bpm:104,key:62,mode:'dor',ext:9,prog:{I:[1,1,4,4],A:[1,4,7,4],B:[6,4,1,5],C:[4,4,1,1]},dr:{k:'x.......x.......',rim:'....x.......x...',h:'..x...x...x...x.',kick:{f0:110,f1:44,len:.26},fill:'rim'},
 bs:{p:'R.......R.......',d:6},ar:{i:'pluck',p:'x.x.x.x.x.x.x.x.',seq:[0,2,1,3],d:1.5,oct:1,br:2200},bl:{at:10,p:.5},mel:{i:'bell',rh:'sparse',oct:1},secs:{I:{dr:0,mel:0},A:{},B:{},C:{dr:2}},v:{k:.22,rim:.1,h:.05,b:.13,ar:.06,bl:.03,mel:.05,pd:.03},pd:{i:'pad',br:1600}});
def('claw',{bpm:108,key:53,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,6,5],B:[4,5,1,2],C:[2,2,1,1]},dr:{k:'x...x...x...x...',oh:'..x...x...x...x.',c:'............x...',kick:{f0:120,f1:46,len:.26},fill:'snare'},
 bs:{i:'sub',p:'R.....R.....R...',d:2},pd:{br:1300,pump:1},ar:{i:'kalimba',p:'x..x..x.x..x..x.',seq:[0,1,2,3],d:2,oct:1},mel:{i:'flute',rh:'pop',oct:1},v:{k:.42,oh:.035,c:.18,b:.24,pd:.018,ar:.035,mel:.045}});
def('bubble',{bpm:112,key:60,mode:'maj',ext:7,prog:{I:[1,4,1,4],A:[1,3,4,5],B:[6,4,1,5],C:[4,4,2,5]},dr:{k:'x.......x.x.....',c:'....x.......x...',sh:'x.x.x.x.x.x.x.x.',kick:{f0:125,f1:48,len:.26},fill:'snare'},
 bs:{p:'R...5.R...R.5...',d:1.5},ar:{i:'marimba',p:'x.x.x.x.x.x.x.x.',seq:[0,2,1,3],d:1.5,oct:1},mel:{i:'kalimba',i2:'bell',rh:'pop',oct:1},v:{k:.42,c:.2,sh:.035,b:.2,ar:.035,mel:.05}});
def('boxes',{bpm:96,key:57,mode:'maj',ext:9,prog:{I:[1,4,1,4],A:[1,6,2,5],B:[4,5,3,6],C:[2,5,1,1]},dr:{k:'x.........x.....',rim:'....x.......x...',sh:'..x...x...x...x.',kick:{f0:105,f1:44,len:.28},fill:'rim'},
 bs:{p:'R.........5.....',d:5},ar:{i:'pluck',p:'x..x..x...x..x..',seq:[0,1,2,3],d:2,oct:1,br:1800},mel:{i:'bell',rh:'slow',oct:1},pd:{br:800},v:{k:.34,rim:.07,sh:.025,b:.18,ar:.03,mel:.03,pd:.016}});
// Perfect Stack (construction : ambiance chill et satisfaisante), un morceau par univers
def('stNeon',{bpm:118,key:57,mode:'min',ext:9,prog:{I:[1,6,1,6],A:[1,6,3,7],B:[6,7,3,1],C:[4,4,6,6]},dr:HOUSE,bs:{i:'sub',p:'..R...R...R...R.',d:2},ch:{i:'ep',p:'..x.....x.x.....',d:1.6},pd:{br:1300,pump:1},mel:{i:'pluck',rh:'pop',oct:2,br:2600},v:{k:.46,c:.2,h:.04,oh:.035,b:.24,ch:.04,pd:.018,mel:.04}});
def('stSunset',{bpm:84,swing:.12,key:53,mode:'maj',ext:9,prog:{I:[1,3,4,4],A:[1,3,4,5],B:[6,5,4,4],C:[2,5,1,1]},dr:LOFI,bs:{p:'R......5..R.....',d:5},ch:{i:'ep',p:'x.....o.......o.',d:3,dl:12},mel:{i:'flute',rh:'slow',oct:1},vinyl:1,v:{k:.4,s:.18,h:.045,b:.2,ch:.05,mel:.045}});
def('stOcean',{bpm:76,key:62,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,6,5],B:[4,2,1,5],C:[2,2,1,1]},dr:{k:'x.........x.....',sh:'..x...x...x...x.',kick:{f0:90,f1:40,len:.4}},bs:{i:'sub',p:'R.......R.......',d:7},pd:{br:1200,att:2},bl:{at:6,p:.5,i:'kalimba'},mel:{i:'flute',rh:'sparse',oct:1},v:{k:.3,sh:.025,b:.16,pd:.026,bl:.03,mel:.04}});
def('stSpace',{bpm:70,key:45,mode:'min',ext:9,prog:{I:[1,6,1,6],A:[1,6,4,5],B:[6,4,1,7],C:[4,4,6,6]},pd:{i:'strings',br:1300,att:2},bs:{i:'sub',p:'R...............',d:15},ar:{i:'bell',p:'x.......x.......',seq:[0,2,1,3],d:6,oct:1},mel:{i:'lead',rh:'sparse',oct:1,br:1600},secs:{I:{mel:0},A:{},B:{},C:{ar:0}},v:{pd:.026,b:.15,ar:.02,mel:.035}});
def('stCrystal',{bpm:96,key:60,mode:'lyd',ext:9,prog:{I:[1,2,1,2],A:[1,2,3,2],B:[4,5,1,2],C:[6,5,2,2]},dr:{k:'x.......x.......',rim:'....x.......x...',sh:'x.x.x.x.x.x.x.x.',kick:{f0:110,f1:44,len:.28},fill:'rim'},bs:{p:'R.......5.......',d:6},ar:{i:'bell',p:'x..x..x.x..x..x.',seq:[0,1,2,3],d:2,oct:1},mel:{i:'kalimba',rh:'pop',oct:1},v:{k:.34,rim:.07,sh:.025,b:.18,ar:.02,mel:.05}});
def('stCyber',{bpm:122,key:52,mode:'min',ext:7,prog:{I:[1,1,6,7],A:[1,6,7,5],B:[6,7,1,1],C:[4,4,7,7]},dr:Object.assign({},HOUSE,{h:'xxxxxxxxxxxxxxxx'}),bs:{p:'R.R.R.R.R.R.R.R.',d:.9,br:800},ar:{i:'pluck',p:'xxxxxxxxxxxxxxxx',seq:[0,2,1,3],rate:1,d:1,oct:1,br:3200},mel:{i:'lead',rh:'pop',oct:1},riser:1,v:{k:.5,c:.22,h:.04,oh:.035,b:.2,ar:.025,mel:.04}});
// les quatre tables du flipper : même énergie, couleurs différentes
const like=(base,o)=>Object.assign({},T[base],o,{id:o.id});
T.pb_dino=like('pinball',{id:'pb_dino',key:55,mode:'dor',bpm:124,dr:{k:'x.....x...x.....',s:'....x.......x..o',h:'x.x.x.x.x.x.x.x.',kick:{f0:120,f1:42,len:.4},fill:'snare'},ar:{i:'marimba',p:'x.xxx.xxx.xxx.xx',seq:[0,2,1,3],rate:1,d:1,oct:1}});
T.pb_alien=like('pinball',{id:'pb_alien',key:50,mode:'min',bpm:130,mel:{i:'lead',rh:'pop',oct:1,br:1800},pd:{i:'strings',br:900}});
T.pb_city=like('pinball',{id:'pb_city',key:57,mode:'dor',bpm:126,dr:Object.assign({},HOUSE,{h:'xxxxxxxxxxxxxxxx'}),bs:{i:'sub',p:'..R.8.R...R.8.R.',d:1.2}});
T.pb_space=like('pinball',{id:'pb_space',key:52,mode:'lyd',bpm:122,ar:{i:'bell',p:'x..x..x.x..x..x.',seq:[0,1,2,3],d:2,oct:1},pd:{i:'pad',br:1400,pump:1},mel:{i:'lead',rh:'sparse',oct:1,br:2000}});
// pendant la projection d'un film : silence (seul le son du film joue)
T.cinefilm=null;
// ---------- niveaux : chaque morceau est ramené au même volume perçu (mesuré par les tests, voir rue/tests/musique_tests.js) ----------
const GAIN={"menu":1.233,"salon":1.102,"chambre":1.616,"cuisine":1.272,"bain":1.409,"bureau":1.824,"rue":1.076,"office":1.767,"store":1.145,"clothes":1.083,"grocery":1.392,"pets":1.979,"cafe":1.241,"gym":1.255,"cine_hall":1.601,"cine_couloir":1.512,"cine_salle":1.494,"cine_prive":1.138,"cine_wc":1.768,"arcade":1.22,"bowling":1.091,"pinball":1.259,"racing":1.108,"mole":1.515,"hockey":1.242,"maze":1.373,"claw":1.249,"bubble":1.86,"boxes":2.087,"stNeon":1.123,"stSunset":1.295,"stOcean":1.406,"stSpace":1.373,"stCrystal":2.381,"stCyber":1.34,"pb_dino":1.259,"pb_alien":1.259,"pb_city":1.259,"pb_space":1.259};
// ---------- ambiances environnementales (bus séparé) ----------
const AMB={
 rue:{bed:[['lowpass',500,.05]],ev:[['car',.08],['bird',.3,'day'],['cricket',.4,'night']]},
 salon:{bed:[['lowpass',260,.012]],ev:[['bird',.06,'day'],['tick',.5]]},
 chambre:{bed:[['lowpass',200,.008]],ev:[['cricket',.12,'night']]},
 cuisine:{bed:[['lowpass',180,.01]],hum:.006,ev:[['clink',.08]]},
 bain:{bed:[['bandpass',900,.006]],ev:[['drip',.35]]},
 bureau:{bed:[['lowpass',260,.01]],ev:[['keys',.12]]},
 office:{bed:[['lowpass',300,.012]],mur:.022,ev:[['keys',.3],['beep',.02]]},
 store:{bed:[['lowpass',300,.01]],mur:.016,ev:[['clink',.03]]},
 clothes:{bed:[['lowpass',300,.01]],mur:.016},
 grocery:{bed:[['lowpass',300,.01]],mur:.02,ev:[['beep',.12]]},
 pets:{bed:[['lowpass',300,.008]],ev:[['bird',.4],['bubble',.25]]},
 cafe:{bed:[['lowpass',400,.012]],mur:.03,ev:[['clink',.35]]},
 gym:{bed:[['lowpass',500,.02]],ev:[['clank',.18]]},
 cine_hall:{bed:[['lowpass',300,.01]],mur:.022},cine_couloir:{bed:[['lowpass',150,.012]],hum:.004},cine_salle:{bed:[['lowpass',200,.008]],mur:.012},cine_wc:{bed:[['bandpass',800,.005]],ev:[['drip',.25]]},
 arcade:{bed:[['lowpass',220,.012]],hum:.008,ev:[['chime',.35]]}};
function ambEvent(g,n,t){const c=g.c,P=(node,pan)=>{let x=node;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;x.connect(p);x=p}x.connect(g.ambIn)};const R=Math.random;
 const blip=(f0,f1,d,v,pan,type)=>{const o=c.createOscillator(),e=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.005);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);P(e,pan);o.start(t);o.stop(t+d+.02)};
 if(n=='bird'){const pan=R()*1.6-.8,b=2200+R()*1500,k=2+Math.floor(R()*3);for(let i=0;i<k;i++){t+=.09+R()*.06;blip(b,b*1.5,.07,.02,pan)}}
 else if(n=='cricket'){const pan=R()*1.6-.8;for(let i=0;i<3;i++){t+=.045;blip(4500,4400,.02,.008,pan)}}
 else if(n=='drip'){blip(1400+R()*600,500,.06,.018,R()*1.2-.6)}
 else if(n=='tick'){blip(3000,2500,.008,.004,.3)}
 else if(n=='clink'){const f=2400+R()*1200;blip(f,f,.25,.01,R()*1.4-.7);blip(f*2.7,f*2.7,.15,.004,R()*1.4-.7)}
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
const volOf=id=>{const n=(typeof night!='undefined'&&['salon','chambre','cuisine','bain','bureau','rue'].includes(id))?1-.3*night:1;return(GAIN[id]||1)*n};
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
 G.drumIn.frequency.setValueAtTime(Th.vinyl?4200:9000,now);G.revIn.gain.setValueAtTime(Th.rev!=null?Th.rev:.32,now);
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
 if(typeof p=='string'&&p.startsWith('cine_')){// pendant la séance, cinema.js fait renvoyer « cinefilm » à themeNow()
  try{if(typeof themeNow=='function'&&themeNow()==='cinefilm')return'cinefilm'}catch(e){}if(p=='cine_hall')return'cine_hall';if(p=='cine_couloir')return'cine_couloir';if(p=='cine_wc')return'cine_wc';if(p=='cine_prive')return'cine_prive';return'cine_salle'}
 if(p=='street')return'rue';if(['office','store','clothes','grocery','pets','cafe','gym'].includes(p))return p;
 if(p=='home'){const st=C.st,v=typeof curV!='undefined'?curV:'home';if(st=='sleep')return'chambre';if(st=='shower'||st=='wc'||v=='wash')return'bain';if(st=='dine'||st=='eat'||v=='table')return'cuisine';if(st=='desk'||st=='work'||v=='desk'||v=='work')return'bureau';return'salon'}
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
async function render(id,sec,o){o=o||{};const off=new OfflineAudioContext(2,Math.round(44100*sec),44100),g=graph(off,off.destination),Th=T[id];g.musFade.gain.value=(o.raw?1:(GAIN[id]||1));
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
 log:()=>ST.log.slice(),themes:()=>Object.keys(T),theme:id=>T[id],render,GAIN,zone,tick,sched,AMB}})();
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
