// ===== SONS DES MINI-JEUX (module partagé) =====
// Effets sonores des mini-jeux (bowling, borne d'arcade…) et accès à leur musique. Tout passe par le gestionnaire audio
// central de Little Life (LLSON, rue/musique.js) : même contexte audio, effets sur le bus « effets » (volume réglable),
// musiques composées par le gestionnaire (chaque mini-jeu a la sienne ; à la fermeture, l'ambiance du lieu revient).
const JEUSON=(()=>{
 let ctx=null,master=null,musG=null,sfxG=null,nzBuf=null,timer=null,theme=null,step=0,next=0,ducked=false,musLevel=1,last={};
 function ensure(){try{if(!ctx){const L=typeof LLSON!='undefined'?LLSON:null;ctx=L?L.ctx():null;if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A()}
   master=ctx.createGain();master.gain.value=.9;const out=L&&L.sfxIn();if(out)master.connect(out);else{const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination)}
   musG=ctx.createGain();musG.gain.value=0;musG.connect(master);sfxG=ctx.createGain();sfxG.gain.value=.55;sfxG.connect(master)}
  if(ctx.state=='suspended'&&!document.hidden)ctx.resume()}catch(e){return null}return ctx}
 const mf=m=>440*Math.pow(2,(m-69)/12);
 function noiseBuf(){if(!nzBuf){nzBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nzBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return nzBuf}
 // briques sonores (dest = musique ou effets)
 function tone(f,t,d,v,type='square',dest,o={}){const os=ctx.createOscillator(),g=ctx.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(30,f*o.slide),t+d);
  if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=o.vib;lg.gain.value=f*.012;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05)}
  const a=o.att||.004;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(dest||sfxG);os.start(t);os.stop(t+d+.03);return os}
 function noise(t,d,v,freq,type='bandpass',dest,q=1,o={}){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf();f.type=type;f.frequency.setValueAtTime(freq,t);if(o.sweep)f.frequency.exponentialRampToValueAtTime(o.sweep,t+d);f.Q.value=q;
  const a=o.att||.002;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t,Math.random()*.5);s.stop(t+d+.03)}
 function kick(t,v,dest){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.13);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.25)}
 function llMusicOn(){try{return typeof musOn=='undefined'?true:!!musOn}catch(e){return true}}
 const api={
  ctx:()=>ensure(),
  // musique d'un mini-jeu (composée par le gestionnaire central) ; null ou stop() pour revenir à l'ambiance du lieu
  music(name){ensure();theme=name||null;musLevel=1;if(typeof LLSON!='undefined'){LLSON.gameLevel(1);LLSON.game(theme)}},
  stop(){theme=null;if(typeof LLSON!='undefined'){LLSON.gameLevel(1);LLSON.game(null)}},
  // volume relatif de la musique (pause, ralenti…)
  level(v){musLevel=v;if(typeof LLSON!='undefined')LLSON.gameLevel(v)},
  playing:()=>theme,
  sfxLevel(v){if(!ensure())return;sfxG.gain.setTargetAtTime(.55*v,ctx.currentTime,.05)},
  // moteur : son continu dont la hauteur suit la vitesse
  engine(){if(!ensure())return null;const o1=ctx.createOscillator(),o2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o1.type='sawtooth';o2.type='square';o1.frequency.value=60;o2.frequency.value=30;f.type='lowpass';f.frequency.value=600;f.Q.value=3;g.gain.value=0;
   o1.connect(f);o2.connect(f);f.connect(g);g.connect(sfxG);o1.start();o2.start();
   return{set(fr,v){const t=ctx.currentTime;o1.frequency.setTargetAtTime(fr,t,.06);o2.frequency.setTargetAtTime(fr/2,t,.06);f.frequency.setTargetAtTime(300+fr*6,t,.08);g.gain.setTargetAtTime(Math.max(0,v),t,.06)},stop(){try{g.gain.setTargetAtTime(0,ctx.currentTime,.05);o1.stop(ctx.currentTime+.3);o2.stop(ctx.currentTime+.3)}catch(e){}}}},
  // effets : nom, intensité (0..1), limite de répétition par effet
  fx(name,k=1,gap=.03){const c=ensure();if(!c||!api.FX[name])return;const now=c.currentTime;if(last[name]&&now-last[name]<gap)return;last[name]=now;try{api.FX[name](now,Math.max(0,Math.min(1.5,k)))}catch(e){}},
  FX:{},tone:(...a)=>tone(...a),noise:(...a)=>noise(...a),mf,sfx:()=>sfxG,
  // son continu (roulement de boule…) : renvoie un réglage de volume
  loop(freq,type='lowpass'){if(!ensure())return null;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf();s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=.7;g.gain.value=0;s.connect(f);f.connect(g);g.connect(sfxG);s.start();
   return{set(v,fq){g.gain.setTargetAtTime(Math.max(0,v),ctx.currentTime,.05);if(fq)f.frequency.setTargetAtTime(fq,ctx.currentTime,.05)},stop(){try{g.gain.setTargetAtTime(0,ctx.currentTime,.05);s.stop(ctx.currentTime+.3)}catch(e){}}}},
  _state:()=>{const L=typeof LLSON!='undefined'?LLSON.state():{};return{theme,ducked:false,ctx:!!ctx,mus:L.game&&L.cur===L.game?L.fade*L.lvl:0,cur:L.cur,phase:L.phase}},
  // rendu hors ligne d'une musique (et d'effets) en WAV : sert aux tests et à l'écoute
  async render(name,sec,fxList){if(name&&typeof LLSON!='undefined'&&!(fxList&&fxList.length)){const r=await LLSON.render(name,sec,{wav:1});return{b64:r.b64,peak:r.peak,rms:r.rms}}
   const sv=[ctx,master,musG,sfxG,nzBuf];const off=new OfflineAudioContext(1,Math.round(44100*sec),44100);ctx=off;nzBuf=null;master=off.createGain();master.connect(off.destination);
   musG=off.createGain();musG.gain.value=0;musG.connect(master);sfxG=off.createGain();sfxG.gain.value=.55;sfxG.connect(master);
   try{(fxList||[]).forEach(([n,at,kk])=>{try{api.FX[n](at,kk==null?1:kk)}catch(e){}})}finally{}
   const buf=await off.startRendering();[ctx,master,musG,sfxG,nzBuf]=sv;const d=buf.getChannelData(0),n=d.length,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,str)=>{for(let i=0;i<str.length;i++)v.setUint8(o+i,str.charCodeAt(i))};
   w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,44100,true);v.setUint32(28,88200,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
   let peak=0,rms=0;for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,d[i]));peak=Math.max(peak,Math.abs(x));rms+=x*x;v.setInt16(44+i*2,x*32767,true)}
   let bin='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return{b64:btoa(bin),peak,rms:Math.sqrt(rms/n)}}};
 return api})();
// ---------- effets du bowling ----------
Object.assign(JEUSON.FX,{
 bwThrow(t,k){const T=JEUSON.tone,N=JEUSON.noise;N(t,.12,.35,300,'lowpass');T(90,t,.15,.3,'sine',null,{slide:.6})},
 bwPin(t,k){const T=JEUSON.tone,N=JEUSON.noise,v=.12+.3*Math.min(1,k);N(t,.07,v,2200+Math.random()*1400,'bandpass',null,3);T(900+Math.random()*500,t,.05,v*.5,'triangle');T(320+Math.random()*120,t,.08,v*.35,'square',null,{slide:.8})},
 bwPinFall(t,k){const N=JEUSON.noise;N(t,.12,.12+.15*k,1400,'bandpass',null,1.5);N(t+.03,.08,.08,700,'bandpass',null,2)},
 bwGutter(t,k){const N=JEUSON.noise;N(t,.5,.25,220,'lowpass',null,1,{att:.05})},
 bwStrike(t){const T=JEUSON.tone,N=JEUSON.noise;[523,659,784,1046,1318].forEach((f,i)=>T(f,t+i*.07,.22,.11,'square'));T(1568,t+.38,.45,.12,'square',null,{vib:7});N(t+.05,1.2,.18,1600,'bandpass',null,.5,{att:.3})},
 bwSpare(t){const T=JEUSON.tone;[659,784,988,1318].forEach((f,i)=>T(f,t+i*.08,.2,.1,'triangle'));T(1318,t+.32,.35,.08,'square',null,{vib:6})},
 bwMiss(t){const T=JEUSON.tone;T(330,t,.18,.1,'triangle',null,{slide:.8});T(262,t+.16,.3,.1,'triangle',null,{slide:.7})},
 bwCount(t,k){JEUSON.tone(500+k*60,t,.08,.08,'square')},
 bwCharge(t,k){JEUSON.tone(220+k*520,t,.05,.035,'square')},
 bwClick(t){JEUSON.tone(1200,t,.03,.05,'square')},
 bwReset(t){const N=JEUSON.noise,T=JEUSON.tone;N(t,.35,.12,500,'lowpass',null,1,{att:.08});T(140,t+.1,.25,.06,'sawtooth',null,{slide:1.4})},
 bwEnd(t,k){const T=JEUSON.tone;(k>0?[523,659,784,1046,784,1046,1318]:[392,523,659,523,784]).forEach((f,i)=>T(f,t+i*.11,.2,.1,'square'))},
 bwWelcome(t){const T=JEUSON.tone;[392,523,659,784].forEach((f,i)=>T(f,t+i*.09,.16,.08,'triangle'))}
});
// ---------- effets du flipper ----------
Object.assign(JEUSON.FX,{
 pbFlip(t){const N=JEUSON.noise,T=JEUSON.tone;N(t,.06,.35,900,'bandpass',null,1.2);T(110,t,.07,.25,'square',null,{slide:.5})},
 pbBump(t,k){const T=JEUSON.tone,N=JEUSON.noise;T(330,t,.09,.16,'square',null,{slide:2.2});T(660,t+.01,.12,.08,'triangle',null,{slide:1.6});N(t,.05,.25,3000,'bandpass',null,2)},
 pbSling(t){const T=JEUSON.tone,N=JEUSON.noise;N(t,.05,.3,1500,'bandpass',null,1.5);T(240,t,.07,.12,'square',null,{slide:1.8})},
 pbTarget(t){const T=JEUSON.tone;T(1175,t,.09,.1,'triangle');T(1568,t+.05,.12,.08,'triangle')},
 pbDrop(t){const N=JEUSON.noise,T=JEUSON.tone;N(t,.08,.3,700,'bandpass',null,2);T(880,t+.02,.1,.09,'square',null,{slide:.6})},
 pbLane(t){const T=JEUSON.tone;T(784,t,.07,.09,'square');T(1046,t+.06,.1,.09,'square')},
 pbRamp(t,k){const T=JEUSON.tone,N=JEUSON.noise;N(t,.4,.12,600,'bandpass',null,1,{sweep:4000,att:.05});[523,659,784,1046].forEach((f,i)=>T(f*(k>1?1.25:1),t+.25+i*.06,.12,.08,'square'))},
 pbLaunch(t,k){const T=JEUSON.tone,N=JEUSON.noise;N(t,.15,.35,400,'lowpass');T(160,t,.22,.14,'sawtooth',null,{slide:2.5+k*2})},
 pbCharge(t,k){JEUSON.tone(120+k*300,t,.05,.05,'sawtooth')},
 pbWall(t,k){JEUSON.noise(t,.03,.08*k,1200,'bandpass',null,1.5)},
 pbBonus(t){const T=JEUSON.tone;[784,988,1175,1568,1976].forEach((f,i)=>T(f,t+i*.07,.14,.09,'square',null,{vib:7}))},
 pbCombo(t,k){JEUSON.tone(880+k*80,t,.08,.07,'square')},
 pbDrain(t){const T=JEUSON.tone;[392,330,262,196].forEach((f,i)=>T(f,t+i*.15,.22,.12,'triangle',null,{slide:.92}))},
 pbStart(t){const T=JEUSON.tone;[523,659,784,1046,784,1046,1318].forEach((f,i)=>T(f,t+i*.08,.12,.09,'square'))},
 pbBall(t){const T=JEUSON.tone;T(659,t,.08,.08,'square');T(988,t+.09,.14,.08,'square')},
 pbOver(t){const T=JEUSON.tone;[523,494,466,440,415,392].forEach((f,i)=>T(f,t+i*.16,.2,.11,'square',null,{vib:5}));T(196,t+1,.8,.12,'triangle')},
 pbRecord(t){const T=JEUSON.tone;[523,659,784,1046,1318,1568,2093].forEach((f,i)=>T(f,t+i*.08,.16,.09,'square',null,{vib:7}))}
});
// ---------- rue ----------
Object.assign(JEUSON.FX,{carPass(t,k){JEUSON.noise(t,.9,.09*k,500,'bandpass',null,.7,{att:.35,sweep:180});JEUSON.tone(70,t+.1,.7,.04*k,'sawtooth',null,{slide:.8,att:.3})}});
// ---------- effets de Mini Racing ----------
Object.assign(JEUSON.FX,{
 rcBeep(t,k){JEUSON.tone(k>0?880:440,t,k>0?.4:.16,.12,'square')},
 rcCrash(t){const N=JEUSON.noise,T=JEUSON.tone;N(t,.6,.5,900,'lowpass',null,.8,{sweep:120});N(t,.25,.35,3000,'bandpass',null,1);T(90,t,.5,.25,'sawtooth',null,{slide:.4})},
 rcShieldHit(t){const T=JEUSON.tone;T(1200,t,.25,.12,'triangle',null,{slide:.5});JEUSON.noise(t,.2,.2,2500,'bandpass',null,2)},
 rcCoin(t){const T=JEUSON.tone;T(988,t,.06,.09,'square');T(1318,t+.06,.12,.09,'square')},
 rcNitroGet(t){const T=JEUSON.tone;[523,784,1046].forEach((f,i)=>T(f,t+i*.05,.1,.08,'square'));JEUSON.noise(t,.3,.1,1500,'bandpass',null,1,{sweep:5000})},
 rcShieldGet(t){const T=JEUSON.tone;[659,880,1175,1568].forEach((f,i)=>T(f,t+i*.06,.14,.08,'triangle',null,{vib:8}))},
 rcNitro(t){const N=JEUSON.noise,T=JEUSON.tone;N(t,.9,.32,500,'bandpass',null,.8,{sweep:3500,att:.05});T(200,t,.8,.08,'sawtooth',null,{slide:3})},
 rcPass(t,k){JEUSON.noise(t,.25,.07+.05*k,900,'bandpass',null,1,{att:.08,sweep:300})},
 rcCombo(t,k){JEUSON.tone(660+Math.min(12,k)*40,t,.07,.06,'square')},
 rcPhase(t){const T=JEUSON.tone;[523,659,784,1046,1318].forEach((f,i)=>T(f,t+i*.07,.15,.08,'square',null,{vib:6}))},
 rcOver(t){const T=JEUSON.tone;[440,415,392,370,349].forEach((f,i)=>T(f,t+i*.18,.24,.11,'sawtooth',null,{vib:5}));T(110,t+.9,.9,.14,'triangle')},
 rcRecord(t){const T=JEUSON.tone;[523,659,784,1046,1318,1568,2093].forEach((f,i)=>T(f,t+i*.08,.16,.09,'square',null,{vib:7}))},
 rcClick(t){JEUSON.tone(1200,t,.03,.06,'square')}
});
// ---------- flipper : effets propres à chaque univers ----------
Object.assign(JEUSON.FX,{
 // Dinosaur World : bruits sourds, bois, rugissements, lave
 dnBump(t){const T=JEUSON.tone,N=JEUSON.noise;T(95,t,.16,.28,'sine',null,{slide:.5});N(t,.08,.25,500,'lowpass',null,1);T(190,t,.06,.06,'triangle')},
 dnTarget(t){const T=JEUSON.tone;T(660,t,.08,.12,'triangle');T(990,t+.04,.1,.09,'triangle');JEUSON.noise(t,.02,.12,2500,'bandpass',null,3)},
 dnBonus(t){const T=JEUSON.tone,N=JEUSON.noise;N(t,.7,.3,420,'bandpass',null,1.2,{sweep:140,att:.05});T(110,t,.6,.16,'sawtooth',null,{slide:.6,vib:9});[220,277,330,440].forEach((f,i)=>T(f,t+.5+i*.09,.16,.1,'triangle'))},
 dnDrain(t){const T=JEUSON.tone;JEUSON.noise(t,.9,.25,300,'bandpass',null,1,{sweep:80,att:.08});T(140,t,.9,.16,'sawtooth',null,{slide:.4,vib:8})},
 dnSaucer(t){const T=JEUSON.tone,N=JEUSON.noise;N(t,.9,.3,180,'lowpass',null,.8,{att:.1});for(let i=0;i<6;i++)T(120+i*35,t+.1+i*.11,.08,.07,'sine',null,{slide:1.8})},
 dnBall(t){const T=JEUSON.tone;T(1400,t,.06,.06,'sine',null,{slide:1.4});T(1700,t+.08,.08,.06,'sine',null,{slide:.8})},
 // Alien Invasion : rayons laser, bips, thérémine
 alBump(t){const T=JEUSON.tone;T(1500,t,.1,.1,'square',null,{slide:.18});T(750,t,.08,.05,'sawtooth',null,{slide:.3})},
 alTarget(t){const T=JEUSON.tone;T(880,t,.06,.09,'sine');T(1320,t+.05,.09,.09,'sine');T(1760,t+.1,.06,.06,'square')},
 alBonus(t){const T=JEUSON.tone;T(400,t,.9,.12,'sine',null,{slide:3,vib:9,att:.05});[1046,1244,1480,1760].forEach((f,i)=>T(f,t+.3+i*.08,.1,.06,'square'))},
 alDrain(t){JEUSON.tone(900,t,1,.12,'sine',null,{slide:.15,vib:10,att:.03});JEUSON.tone(450,t,1,.06,'square',null,{slide:.2})},
 alSaucer(t){const T=JEUSON.tone;T(250,t,1,.1,'sine',null,{slide:4,vib:14,att:.1});JEUSON.noise(t,1,.08,1500,'bandpass',null,4,{sweep:6000,att:.2})},
 alBall(t){const T=JEUSON.tone;[1200,900,1500].forEach((f,i)=>T(f,t+i*.06,.05,.06,'square'))},
 // Future City : sons électroniques, sirène, carillon synthé
 ctBump(t){const T=JEUSON.tone;T(220,t,.1,.13,'sawtooth',null,{slide:2.4});JEUSON.noise(t,.04,.18,6000,'highpass',null,1)},
 ctTarget(t){const T=JEUSON.tone;T(1046,t,.08,.08,'square');T(1318,t+.04,.1,.08,'square');T(1568,t+.08,.12,.06,'square')},
 ctBonus(t){const T=JEUSON.tone;[440,554,659,880,1108,1318,1760].forEach((f,i)=>T(f,t+i*.05,.12,.08,'sawtooth'))},
 ctDrain(t){JEUSON.tone(500,t,.8,.14,'sawtooth',null,{slide:.2});JEUSON.noise(t,.8,.08,2000,'lowpass',null,1,{sweep:200})},
 ctSaucer(t){const T=JEUSON.tone;for(let i=0;i<4;i++){T(880,t+i*.2,.1,.08,'square');T(660,t+i*.2+.1,.1,.08,'square')}},
 ctBall(t){const T=JEUSON.tone;T(784,t,.05,.07,'square');T(1568,t+.07,.08,.07,'square')},
 // Space Galaxy : tintements cristallins, souffles, trou noir
 spBump(t){const T=JEUSON.tone;T(1400,t,.3,.09,'sine');T(2100,t,.25,.05,'sine');T(700,t,.12,.06,'triangle',null,{slide:1.5})},
 spTarget(t){const T=JEUSON.tone;T(2093,t,.2,.06,'triangle');T(2637,t+.05,.25,.05,'triangle');T(3136,t+.1,.3,.04,'sine')},
 spBonus(t){const T=JEUSON.tone;[1046,1318,1568,2093,2637,3136,2637,2093].forEach((f,i)=>T(f,t+i*.06,.3,.05,'sine'));JEUSON.noise(t,.8,.06,6000,'highpass',null,1,{att:.2})},
 spDrain(t){JEUSON.tone(800,t,1.1,.12,'sine',null,{slide:.12,att:.02});JEUSON.noise(t,1.1,.1,3000,'bandpass',null,1,{sweep:150,att:.2})},
 spSaucer(t){JEUSON.tone(90,t,1.2,.2,'sine',null,{slide:.45,att:.05});JEUSON.noise(t,1.2,.15,4000,'bandpass',null,1.5,{sweep:120,att:.1})},
 spBall(t){const T=JEUSON.tone;[523,784,1046].forEach((f,i)=>T(f,t+i*.07,.2,.06,'sine'))},
 // commun : nouveau record (fanfare spéciale), choix de table
 pbNewRec(t){const T=JEUSON.tone,N=JEUSON.noise;[[523,659,784],[587,740,880],[659,830,988],[784,988,1175,1568]].forEach((c,i)=>c.forEach(f=>T(f,t+i*.14,i==3?.6:.13,.06,'square',null,{vib:i==3?7:0})));N(t+.42,.6,.08,8000,'highpass',null,1,{att:.05});[2093,2637,3136].forEach((f,i)=>T(f,t+.5+i*.07,.2,.04,'triangle'))},
 pbSel(t){JEUSON.tone(1046,t,.05,.07,'square');JEUSON.tone(1568,t+.04,.06,.05,'square')}
});
// ---------- cinéma : robinet et lavage des mains ----------
Object.assign(JEUSON.FX,{
 wtTap(t){const T=JEUSON.tone;T(1900,t,.07,.05,'square',null,{slide:.7});T(2600,t+.03,.05,.03,'triangle');JEUSON.noise(t,.08,.12,3500,'bandpass',null,3)},
 wtScrub(t){JEUSON.noise(t,.12,.1,2600,'bandpass',null,1.2,{att:.03,sweep:1800});JEUSON.noise(t+.06,.08,.06,4200,'highpass',null,1)}});
// ---------- Whack-a-Mole ----------
Object.assign(JEUSON.FX,{
 whPop(t,k){JEUSON.tone(300+k*200,t,.08,.06,'square',null,{slide:2.2});JEUSON.noise(t,.05,.05,1200,'bandpass',null,2)},
 whBonk(t,k){const T=JEUSON.tone,N=JEUSON.noise;T(220,t,.12,.24,'square',null,{slide:.35});N(t,.08,.3,900,'bandpass',null,1.2);T(880+k*60,t+.03,.08,.08,'triangle',null,{slide:1.5})},
 whGold(t){const T=JEUSON.tone;[1046,1318,1568,2093,2637].forEach((f,i)=>T(f,t+i*.05,.18,.07,'square'));JEUSON.noise(t+.1,.3,.06,8000,'highpass',null,1)},
 whMiss(t){JEUSON.noise(t,.12,.12,600,'bandpass',null,1,{sweep:250});JEUSON.tone(140,t,.1,.08,'triangle',null,{slide:.6})},
 whEscape(t){JEUSON.tone(500,t,.12,.05,'square',null,{slide:.5})},
 whCombo(t,k){const b=523*Math.pow(2,Math.min(12,k)/12);[0,4,7,12].forEach((m,i)=>JEUSON.tone(b*Math.pow(2,m/12),t+i*.045,.1,.06,'square'))},
 whTick(t,k){JEUSON.tone(k?1320:880,t,.07,.08,'square')},
 whStart(t){[523,659,784,1046].forEach((f,i)=>JEUSON.tone(f,t+i*.1,i==3?.4:.1,.08,'square'))},
 whEnd(t){[784,659,523,392].forEach((f,i)=>JEUSON.tone(f,t+i*.14,.16,.08,'square'));JEUSON.noise(t+.55,.4,.1,2000,'bandpass',null,1)},
 whRecord(t){[[523,659,784],[587,740,880],[659,830,988],[784,988,1175,1568]].forEach((c,i)=>c.forEach(f=>JEUSON.tone(f,t+i*.14,i==3?.6:.13,.05,'square',null,{vib:i==3?7:0})))},
 whClick(t){JEUSON.tone(1200,t,.04,.06,'square')}});
// écran titre : validation « Nouvelle partie » (arpège montant lumineux), « Continuer » (carillon de chargement), aucun enregistrement (petit « bloup » doux)
// léger écart de hauteur aléatoire à chaque fois pour ne jamais sonner répétitif
Object.assign(JEUSON.FX,{
 tiNew(t){const v=Math.pow(2,(Math.floor(Math.random()*3)-1)/24);[523,659,784,1047].forEach((f,i)=>{JEUSON.tone(f*v,t+i*.055,.2,.075,'square',null,{att:.003});JEUSON.tone(f*2*v,t+i*.055,.12,.02,'triangle')});JEUSON.tone(1568*v,t+.24,.38,.05,'triangle',null,{vib:6});JEUSON.noise(t,.08,.05,6000,'highpass')},
 tiCont(t){const v=Math.pow(2,(Math.floor(Math.random()*3)-1)/24);JEUSON.tone(220*v,t,.07,.06,'square',null,{slide:1.9});[[659,988],[784,1175]].forEach((c,i)=>c.forEach(f=>JEUSON.tone(f*v,t+.07+i*.11,.3,.06,'sine',null,{att:.004})));JEUSON.tone(1319*v,t+.3,.32,.035,'triangle',null,{vib:5})},
 tiNone(t){JEUSON.tone(392,t,.12,.06,'triangle',null,{slide:.75});JEUSON.tone(311,t+.11,.16,.05,'triangle',null,{slide:.8})}});
// Maze Runner : pas feutrés, cristal, choc contre un mur, alerte d'un gardien, touché, réapparition, portail, niveau, victoire, game over, menus
Object.assign(JEUSON.FX,{
 mzStep(t){JEUSON.noise(t,.025,.025,2200+Math.random()*600,'bandpass')},
 mzBump(t){JEUSON.tone(140,t,.07,.07,'square',null,{slide:.6});JEUSON.noise(t,.05,.05,900,'lowpass')},
 mzCrystal(t){const v=1+Math.random()*.04;[1319,1760,2093,2637].forEach((f,i)=>JEUSON.tone(f*v,t+i*.045,.16,.05,'square',null,{att:.002}));JEUSON.tone(3520*v,t+.18,.25,.03,'triangle',null,{vib:7})},
 mzAlert(t){JEUSON.tone(880,t,.06,.04,'square');JEUSON.tone(1175,t+.07,.08,.04,'square')},
 mzHit(t){JEUSON.tone(520,t,.45,.09,'sawtooth',null,{slide:.15});JEUSON.noise(t,.3,.12,700,'lowpass');JEUSON.tone(90,t+.05,.3,.12,'square',null,{slide:.5})},
 mzRespawn(t){[392,523,659].forEach((f,i)=>JEUSON.tone(f,t+i*.06,.12,.04,'triangle'))},
 mzPortal(t){for(let i=0;i<8;i++)JEUSON.tone(330*Math.pow(2,i/4),t+i*.05,.25,.04,'square',null,{att:.003});JEUSON.tone(1320,t+.42,.6,.05,'triangle',null,{vib:6});JEUSON.noise(t,.5,.05,3000,'bandpass')},
 mzLevel(t){[523,659,784,1047,784,1047,1319].forEach((f,i)=>JEUSON.tone(f,t+i*.09,.2,.06,'square',null,{att:.003}))},
 mzWin(t){[523,659,784,1047,1319,1568,2093].forEach((f,i)=>{JEUSON.tone(f,t+i*.1,.3,.06,'square');JEUSON.tone(f/2,t+i*.1,.3,.04,'triangle')});JEUSON.tone(2093,t+.75,.9,.05,'triangle',null,{vib:6})},
 mzOver(t){[392,330,262,196].forEach((f,i)=>JEUSON.tone(f,t+i*.2,.3,.07,'square',null,{slide:.97}));JEUSON.tone(98,t+.8,.8,.08,'triangle',null,{slide:.7})},
 mzStart(t){[262,392,523,784].forEach((f,i)=>JEUSON.tone(f,t+i*.07,.15,.05,'square'))},
 mzSelect(t){JEUSON.tone(988,t,.06,.05,'square');JEUSON.tone(1319,t+.06,.1,.05,'square')},
 mzTick(t){JEUSON.tone(1568,t,.03,.03,'square')}});
// Lucky Claw : pièce, moteur du chariot (via engine), descente, arrêt, fermeture, montée, à-coup, ouverture, lot qui tombe, victoire, raté, fin
Object.assign(JEUSON.FX,{
 clCoin(t){JEUSON.tone(1319,t,.07,.06,'square');JEUSON.tone(1976,t+.07,.22,.06,'square',null,{vib:6});JEUSON.noise(t,.05,.04,6000,'highpass')},
 clSelect(t){JEUSON.tone(880,t,.05,.05,'triangle');JEUSON.tone(1175,t+.05,.08,.05,'triangle')},
 clDrop(t){JEUSON.tone(660,t,.6,.05,'triangle',null,{slide:.4});JEUSON.noise(t,.5,.03,1200,'bandpass',null,2,{sweep:500})},
 clStop(t){JEUSON.noise(t,.06,.08,700,'lowpass');JEUSON.tone(180,t,.06,.06,'square',null,{slide:.6})},
 clClose(t){JEUSON.tone(300,t,.12,.06,'sawtooth',null,{slide:.6});JEUSON.noise(t+.1,.05,.1,2600,'bandpass',null,2);JEUSON.tone(1400,t+.12,.04,.04,'square')},
 clRise(t){JEUSON.tone(220,t,.7,.04,'triangle',null,{slide:2.4})},
 clJolt(t){JEUSON.noise(t,.08,.12,500,'lowpass');JEUSON.tone(110,t,.1,.08,'square',null,{slide:.5})},
 clRelease(t){JEUSON.tone(500,t,.1,.05,'square',null,{slide:1.6});JEUSON.noise(t,.08,.05,3000,'bandpass',null,2)},
 clThud(t){JEUSON.noise(t,.18,.18,350,'lowpass');JEUSON.tone(120,t,.18,.1,'sine',null,{slide:.6});JEUSON.noise(t+.12,.1,.06,900,'bandpass')},
 clWin(t,k){[523,659,784,1047].forEach((f,i)=>JEUSON.tone(f*k,t+i*.08,.2,.06,'square'));JEUSON.tone(1568*k,t+.34,.5,.05,'triangle',null,{vib:6});JEUSON.noise(t+.3,.6,.04,5000,'highpass',null,1,{att:.1})},
 clWinNew(t,k){[523,659,784,1047,1319,1568].forEach((f,i)=>{JEUSON.tone(f*k,t+i*.08,.22,.06,'square');JEUSON.tone(f*k/2,t+i*.08,.2,.04,'triangle')});JEUSON.tone(2093*k,t+.5,.8,.05,'triangle',null,{vib:7});JEUSON.noise(t+.45,.8,.05,6000,'highpass',null,1,{att:.15})},
 clMiss(t){JEUSON.tone(392,t,.16,.07,'triangle',null,{slide:.85});JEUSON.tone(311,t+.15,.3,.07,'triangle',null,{slide:.8})},
 clOver(t){[523,440,349,262].forEach((f,i)=>JEUSON.tone(f,t+i*.16,.24,.06,'square',null,{slide:.97}))}});
// Bubble Pop : tir, rebond, accroche, éclatement, chute, combo, étoile, plafond, échange, victoire, défaite
Object.assign(JEUSON.FX,{
 bpShoot(t){JEUSON.tone(520,t,.12,.06,'sine',null,{slide:1.8});JEUSON.noise(t,.06,.04,2400,'bandpass',null,2)},
 bpBounce(t){JEUSON.tone(900,t,.05,.04,'triangle')},
 bpStick(t){JEUSON.tone(300,t,.06,.05,'sine',null,{slide:.7});JEUSON.noise(t,.03,.03,1500,'bandpass')},
 bpPop(t,k){for(let i=0;i<3;i++){JEUSON.tone((700+i*260)*k,t+i*.035,.07,.05,'sine',null,{slide:1.6});JEUSON.noise(t+i*.035,.03,.04,4000,'bandpass',null,3)}},
 bpDrop(t){[880,740,620,520].forEach((f,i)=>JEUSON.tone(f,t+i*.06,.1,.04,'triangle',null,{slide:.8}))},
 bpCombo(t,k){[784,988,1175,1568].forEach((f,i)=>JEUSON.tone(f*k,t+i*.05,.12,.05,'square'))},
 bpStar(t){[1319,1568,2093].forEach((f,i)=>JEUSON.tone(f,t+i*.06,.18,.05,'triangle',null,{vib:6}))},
 bpCeil(t){JEUSON.noise(t,.2,.12,300,'lowpass');JEUSON.tone(110,t,.25,.08,'square',null,{slide:.6})},
 bpSwap(t){JEUSON.tone(660,t,.05,.04,'triangle');JEUSON.tone(990,t+.05,.06,.04,'triangle')},
 bpSelect(t){JEUSON.tone(880,t,.05,.05,'triangle');JEUSON.tone(1320,t+.05,.07,.05,'triangle')},
 bpWin(t){[523,659,784,1047,784,1047,1319].forEach((f,i)=>JEUSON.tone(f,t+i*.09,.2,.06,'square'));JEUSON.tone(1568,t+.65,.7,.05,'triangle',null,{vib:6});JEUSON.noise(t+.6,.8,.04,6000,'highpass',null,1,{att:.1})},
 bpLose(t){[440,392,349,294,220].forEach((f,i)=>JEUSON.tone(f,t+i*.16,.26,.06,'triangle',null,{slide:.96}))}});
// Box Master : pas, poussée, caisse sur une cible, choc contre un mur, annuler, recommencer, blocage, victoire, menus
Object.assign(JEUSON.FX,{
 bxStep(t,k){JEUSON.noise(t,.035,.035*k,900+k*500,'bandpass',null,2.5)},
 bxPush(t){JEUSON.noise(t,.11,.09,420,'lowpass',null,1,{att:.01});JEUSON.tone(95,t,.1,.06,'triangle',null,{slide:.8})},
 bxPushOn(t){JEUSON.noise(t,.1,.08,480,'lowpass',null,1,{att:.01});JEUSON.tone(120,t,.1,.05,'triangle',null,{slide:.85})},
 bxGoal(t,k){JEUSON.noise(t,.08,.07,480,'lowpass');[784,988,1319].forEach((f,i)=>JEUSON.tone(f*k,t+.02+i*.055,.16,.05,'triangle',null,{vib:5}));JEUSON.tone(1976*k,t+.2,.25,.02,'sine')},
 bxBump(t){JEUSON.noise(t,.06,.07,260,'lowpass');JEUSON.tone(70,t,.07,.06,'square',null,{slide:.7})},
 bxUndo(t){JEUSON.tone(660,t,.06,.035,'triangle',null,{slide:.7});JEUSON.noise(t,.04,.02,2000,'bandpass',null,2)},
 bxRestart(t){[523,392,330].forEach((f,i)=>JEUSON.tone(f,t+i*.05,.09,.04,'triangle'));JEUSON.noise(t,.25,.05,700,'bandpass',null,1,{sweep:2600})},
 bxStuck(t){JEUSON.tone(233,t,.16,.06,'square',null,{slide:.9});JEUSON.tone(220,t+.15,.24,.06,'square',null,{slide:.85})},
 bxWin(t){[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>JEUSON.tone(f,t+i*.085,.2,.055,'square'));JEUSON.tone(2093,t+.7,.8,.04,'triangle',null,{vib:6});JEUSON.noise(t+.65,.9,.04,6000,'highpass',null,1,{att:.1})},
 bxSelect(t,k){JEUSON.tone(880*k,t,.05,.05,'triangle');JEUSON.tone(1320*k,t+.05,.07,.05,'triangle')},
 bxTick(t){JEUSON.tone(1175,t,.03,.035,'square')},
 bxLocked(t){JEUSON.tone(196,t,.09,.05,'square');JEUSON.tone(185,t+.09,.12,.05,'square')}});
// Perfect Stack : pose, PERFECT (carillon qui monte avec le combo), découpe, chute, combos, ralenti, fin, pièces, collection
Object.assign(JEUSON.FX,{
 stDrop(t,k){JEUSON.tone(330*k,t,.12,.07,'sine',null,{slide:.6});JEUSON.noise(t,.04,.05,2400,'bandpass',null,2)},
 stPerfect(t,k){const P=[0,2,4,7,9],n=72+P[(k-1)%5]+12*Math.floor((k-1)/5);[0,7,12].forEach((d,i)=>JEUSON.tone(440*Math.pow(2,(n+d-69)/12),t+i*.03,.6-i*.12,.06-i*.015,'sine'));JEUSON.tone(440*Math.pow(2,(n+24-69)/12),t,.25,.015,'triangle')},
 stCut(t){JEUSON.noise(t,.09,.08,3200,'bandpass',null,1.2,{sweep:900});JEUSON.tone(180,t,.08,.04,'triangle',null,{slide:.7})},
 stCutFall(t){JEUSON.noise(t+.05,.35,.04,900,'lowpass',null,1,{att:.05,sweep:200})},
 stFall(t){JEUSON.noise(t,.6,.07,1400,'lowpass',null,1,{att:.02,sweep:150});JEUSON.tone(220,t,.6,.05,'sine',null,{slide:.3})},
 stCombo(t){[0,4,7,12,16].forEach((d,i)=>JEUSON.tone(440*Math.pow(2,(64+d-69)/12),t+i*.05,.5,.04,'sine'));JEUSON.noise(t,.5,.03,5000,'highpass',null,1,{att:.08})},
 stStreak(t){[0,4,7,11,14,19,23,26].forEach((d,i)=>JEUSON.tone(440*Math.pow(2,(60+d-69)/12),t+i*.045,.7,.045,i%2?'triangle':'sine'));JEUSON.noise(t,1,.05,800,'bandpass',null,.8,{att:.2,sweep:7000})},
 stSlow(t){JEUSON.tone(600,t,.5,.035,'sine',null,{slide:.4});JEUSON.noise(t,.5,.03,2000,'lowpass',null,1,{att:.05,sweep:300})},
 stOver(t){[67,63,60,55].forEach((n,i)=>JEUSON.tone(440*Math.pow(2,(n-69)/12),t+i*.13,.45,.05,'sine'))},
 stCoin(t){JEUSON.tone(1319,t,.1,.045,'sine');JEUSON.tone(1760,t+.07,.22,.045,'sine')},
 stBuy(t){[72,76,79,84,88].forEach((n,i)=>JEUSON.tone(440*Math.pow(2,(n-69)/12),t+i*.05,.3,.045,'sine'));JEUSON.noise(t+.2,.4,.025,7000,'highpass',null,1,{att:.05})},
 stTap(t){JEUSON.tone(880,t,.05,.035,'sine');JEUSON.noise(t,.02,.02,4000,'bandpass',null,2)},
 stEquip(t){JEUSON.tone(660,t,.08,.04,'sine');JEUSON.tone(990,t+.06,.14,.04,'sine')},
 stDeny(t){JEUSON.tone(220,t,.1,.05,'triangle');JEUSON.tone(196,t+.1,.16,.05,'triangle')},
 stLevel(t){JEUSON.tone(784,t,.18,.04,'sine');JEUSON.tone(1175,t+.1,.3,.04,'sine')},
 stPop(t){JEUSON.noise(t,.12,.08,3000,'bandpass',null,1.5);JEUSON.tone(500,t,.1,.04,'sine',null,{slide:2})}});
// ---------- flipper modernisé : sons métalliques, impacts nets, montées pour le jackpot (aucun son « 8 bits ») ----------
(function(){const T=(...a)=>JEUSON.tone(...a),N=(...a)=>JEUSON.noise(...a);
 // tintement métallique : partiels inharmoniques courts (bille d'acier sur métal)
 const met=(f,t,d,v)=>{T(f,t,d,v,'sine');T(f*2.76,t,d*.6,v*.45,'sine');T(f*5.4,t,d*.35,v*.2,'sine')};
 const thump=(f,t,v)=>{T(f,t,.14,v,'sine',null,{slide:.35});N(t,.03,v*.6,3500,'highpass',null,.7)};
 const chord=(ns,t,d,v,ty)=>ns.forEach((n,i)=>T(440*Math.pow(2,(n-69)/12),t+i*.012,d,v,ty||'triangle'));
 Object.assign(JEUSON.FX,{
  pbFlip(t){thump(120,t,.16);N(t,.04,.12,1800,'bandpass',null,1.4)},
  pbWall(t,k){met(1500+Math.random()*500,t,.09,.03+.05*k)},
  pbSling(t){thump(180,t,.16);met(2100,t,.07,.05);N(t,.05,.1,5000,'highpass',null,.8)},
  pbDrop(t){N(t,.05,.16,900,'bandpass',null,1.6);T(240,t,.08,.08,'triangle',null,{slide:.6})},
  pbLane(t){T(1318,t,.08,.05,'sine');T(1976,t+.04,.1,.04,'sine')},
  pbRamp(t,k){N(t,.45,.12,600,'bandpass',null,1,{sweep:5200,att:.05});chord([72,76,79].map(n=>n+Math.min(5,Math.round(k)-1)*2),t+.32,.28,.05)},
  pbLaunch(t,k){thump(90,t,.22);N(t,.35,.08+.1*k,800,'bandpass',null,.9,{sweep:4500})},
  pbCharge(t,k){T(300+k*500,t,.04,.025,'sine')},
  pbStart(t){N(t,.5,.06,400,'bandpass',null,.9,{sweep:6000,att:.15});chord([60,64,67,71],t+.38,.6,.045);T(65.4,t+.38,.5,.12,'sine')},
  pbOver(t){chord([67,63,60],t,.5,.05);chord([62,58,55],t+.4,.8,.045);N(t+.1,1,.05,3000,'lowpass',null,.7,{sweep:300})},
  pbNewRec(t){[72,76,79,84,88,91].forEach((n,i)=>T(440*Math.pow(2,(n-69)/12),t+i*.08,.35,.05,'triangle'));N(t+.4,.8,.04,8000,'highpass',null,1,{att:.1})},
  pbCombo(t,k){const n=72+Math.min(12,k)*2;T(440*Math.pow(2,(n-69)/12),t,.16,.05,'triangle');T(440*Math.pow(2,(n+7-69)/12),t+.05,.18,.04,'triangle')},
  pbHit(t,k){const sc=[0,2,4,7,9,12,14,16,19],n=76+sc[Math.min(8,Math.round(k))];T(440*Math.pow(2,(n-69)/12),t,.14,.05,'triangle');met(440*Math.pow(2,(n+12-69)/12),t+.02,.08,.02)},
  pbJack(t,k){[0,1,2,3].slice(0,Math.max(1,Math.round(k))).forEach((i)=>T(523*Math.pow(2,i*4/12),t+i*.06,.18,.05,'triangle'))},
  pbJackReady(t){N(t,1.2,.1,300,'bandpass',null,1.1,{sweep:7000,att:.9});T(110,t,1.2,.08,'sawtooth',null,{slide:4,att:.8});chord([69,73,76,81],t+1.15,.5,.05)},
  pbJackpot(t){T(55,t,.7,.3,'sine',null,{slide:.6});N(t,.08,.25,1200,'bandpass',null,.8);chord([60,64,67,72,76],t,.9,.06);chord([65,69,72,77,81],t+.32,.9,.055);chord([67,71,74,79,83],t+.64,1.2,.06);N(t+.2,1.4,.05,9000,'highpass',null,1,{att:.3})},
  pbSkill(t){chord([79],t,.12,.06);chord([83],t+.07,.12,.06);chord([88],t+.14,.3,.06);met(2637,t+.14,.25,.03)},
  pbSave(t){T(659,t,.16,.06,'triangle');T(988,t+.1,.3,.06,'triangle')},
  pbSel(t){T(1046,t,.05,.04,'sine');N(t,.02,.04,6000,'highpass',null,1)},
  // Dinosaur World : bois, peaux, grondements
  dnBump(t){thump(85,t,.3);N(t,.06,.18,700,'bandpass',null,1.5);T(170,t,.07,.06,'triangle')},
  dnTarget(t){T(392,t,.1,.08,'triangle');T(588,t+.05,.12,.06,'triangle');N(t,.03,.1,2200,'bandpass',null,3)},
  dnBonus(t){N(t,.8,.18,200,'bandpass',null,1,{sweep:1200,att:.2});chord([55,62,67,71],t+.5,.6,.05)},
  dnDrain(t){N(t,1,.18,500,'lowpass',null,.7,{sweep:90,att:.05});T(98,t,1,.12,'sine',null,{slide:.5})},
  dnSaucer(t){N(t,.9,.25,160,'lowpass',null,.8,{att:.1});thump(70,t+.1,.25)},
  dnBall(t){chord([62,69],t,.25,.05)},
  // Alien Invasion : synthés spatiaux, ondes
  alBump(t){thump(140,t,.22);T(900,t,.12,.06,'sine',null,{slide:.35});met(1800,t,.06,.03)},
  alTarget(t){T(880,t,.08,.06,'sine');T(1320,t+.05,.1,.05,'sine')},
  alBonus(t){T(300,t,.8,.07,'sine',null,{slide:3,att:.1});chord([64,68,71,76],t+.5,.6,.045)},
  alDrain(t){T(700,t,1,.08,'sine',null,{slide:.2,vib:7,att:.03});N(t,1,.05,2000,'bandpass',null,2,{sweep:200})},
  alSaucer(t){T(200,t,.9,.08,'sine',null,{slide:3,vib:10,att:.1});N(t,.9,.06,1500,'bandpass',null,3,{sweep:6000,att:.2})},
  alBall(t){chord([64,71],t,.25,.05,'sine')},
  // Future City : électro urbaine, impacts nets
  ctBump(t){thump(110,t,.26);T(220,t,.1,.06,'sawtooth',null,{slide:2.2});N(t,.04,.12,7000,'highpass',null,1)},
  ctTarget(t){T(1046,t,.07,.05,'triangle');T(1568,t+.04,.1,.05,'triangle')},
  ctBonus(t){[69,73,76,81,85].forEach((n,i)=>T(440*Math.pow(2,(n-69)/12),t+i*.06,.2,.045,'triangle'))},
  ctDrain(t){T(440,t,.8,.08,'sawtooth',null,{slide:.25});N(t,.8,.06,3000,'lowpass',null,1,{sweep:200})},
  ctSaucer(t){N(t,.5,.1,500,'bandpass',null,1,{sweep:4000,att:.1});chord([69,76],t+.4,.4,.05)},
  ctBall(t){chord([69,76],t,.2,.05)},
  // Space Galaxy : cristal, souffles
  spBump(t){thump(120,t,.2);met(1400,t,.25,.05)},
  spTarget(t){met(2093,t,.2,.04);T(1568,t,.15,.04,'sine')},
  spBonus(t){[72,76,79,84,88].forEach((n,i)=>met(440*Math.pow(2,(n-69)/12),t+i*.07,.4,.035));N(t,.8,.04,7000,'highpass',null,1,{att:.2})},
  spDrain(t){T(700,t,1.1,.09,'sine',null,{slide:.15,att:.02});N(t,1.1,.06,3000,'bandpass',null,1,{sweep:150,att:.2})},
  spSaucer(t){T(80,t,1.2,.18,'sine',null,{slide:.5,att:.05});N(t,1.2,.1,4000,'bandpass',null,1.5,{sweep:120,att:.1})},
  spBall(t){met(1046,t,.3,.04);met(1568,t+.08,.3,.035)}})})();
