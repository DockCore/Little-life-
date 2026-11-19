// ===== SONS ET MUSIQUES DES MINI-JEUX (module partagé) =====
// Un seul contexte audio pour les mini-jeux (bowling, borne d'arcade…). Pendant qu'une musique de mini-jeu joue,
// la musique de Little Life est baissée à zéro, puis rétablie à la sortie. La musique suit le réglage « musique » du jeu
// (bouton ♪) ; les effets sonores restent actifs.
const JEUSON=(()=>{
 let ctx=null,master=null,musG=null,sfxG=null,nzBuf=null,timer=null,theme=null,step=0,next=0,ducked=false,musLevel=1,last={};
 function ensure(){try{if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();master=ctx.createGain();master.gain.value=.9;
   const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination);
   musG=ctx.createGain();musG.gain.value=0;musG.connect(master);sfxG=ctx.createGain();sfxG.gain.value=.55;sfxG.connect(master)}
  if(ctx.state=='suspended')ctx.resume()}catch(e){return null}return ctx}
 const mf=m=>440*Math.pow(2,(m-69)/12);
 function noiseBuf(){if(!nzBuf){nzBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nzBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return nzBuf}
 // briques sonores (dest = musique ou effets)
 function tone(f,t,d,v,type='square',dest,o={}){const os=ctx.createOscillator(),g=ctx.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(30,f*o.slide),t+d);
  if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=o.vib;lg.gain.value=f*.012;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05)}
  const a=o.att||.004;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(dest||sfxG);os.start(t);os.stop(t+d+.03);return os}
 function noise(t,d,v,freq,type='bandpass',dest,q=1,o={}){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf();f.type=type;f.frequency.setValueAtTime(freq,t);if(o.sweep)f.frequency.exponentialRampToValueAtTime(o.sweep,t+d);f.Q.value=q;
  const a=o.att||.002;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t,Math.random()*.5);s.stop(t+d+.03)}
 function kick(t,v,dest){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.13);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.25)}
 // ---------- musiques (séquenceur pas à pas, 16 doubles-croches par mesure) ----------
 const THEMES={
  // bowling : groove disco-funk détendu, comme dans une salle de bowling un samedi soir
  bowling:{bpm:112,vol:.24,bars:[[45,52,57,60],[43,50,55,59],[41,48,53,57],[40,47,52,56]],
   play(s,bar,t,SD,B){const ch=B[bar];if(s%4==0)kick(t,.5,musG);if(s==4||s==12){noise(t,.14,.13,1800,'bandpass',musG,.8);noise(t,.06,.08,5000,'highpass',musG)}
    if(s%2==1)noise(t,.03,.05,9000,'highpass',musG);if(s==14)noise(t,.12,.04,9000,'highpass',musG);
    const bl=[0,null,12,null,7,null,0,10,null,0,12,null,7,null,5,7][s];if(bl!=null)tone(mf(ch[0]-12+bl),t,SD*1.6,.13,'triangle',musG);
    if(s==2||s==6||s==10||s==15)ch.slice(1).forEach(m=>tone(mf(m+12),t,SD*.9,.025,'square',musG,{att:.003}));
    const _=null,mel=[[12,_,10,_,7,_,10,_,_,12,_,15,_,12,_,_],[10,_,7,_,5,_,7,_,_,10,_,12,10,_,7,_],[8,_,7,_,3,_,7,_,8,_,10,_,12,_,10,_],[7,_,_,11,14,_,11,_,7,_,11,_,14,_,11,_]][bar][s];
    if(mel!=null)tone(mf(57+mel),t,SD*1.8,.05,'sine',musG,{vib:5.5})}},
  // flipper : chiptune d'arcade énergique (arpèges, basse qui galope, mélodie carrée)
  pinball:{bpm:146,vol:.2,bars:[[57,60,64],[53,57,60],[55,59,62],[52,56,59],[57,60,64],[53,57,60],[50,53,57],[52,56,59]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if(s%4==0)kick(t,.55,musG);if(s==4||s==12)noise(t,.1,.12,2500,'bandpass',musG,1);noise(t,.025,s%2?.03:.05,10000,'highpass',musG);
    tone(mf(ch[0]-24+(s%2?12:0)),t,SD*.9,.09,'square',musG,{att:.002});
    tone(mf(ch[s%3]+12+(Math.floor(s/3)%2?12:0)),t,SD*.7,.022,'square',musG,{att:.002});
    const _=null,M=[[12,_,7,_,12,15,_,12,19,_,17,_,15,_,12,_],[17,_,12,_,8,_,12,_,17,_,15,_,12,_,8,_],[14,_,10,_,7,_,10,_,14,_,17,_,15,_,14,_],[11,_,14,_,19,_,14,_,11,_,_,_,7,_,_,_],
     [19,_,15,_,12,_,15,_,19,_,24,_,19,_,15,_],[20,_,17,_,12,_,17,_,20,_,19,_,17,_,15,_],[17,_,12,_,8,_,12,_,17,_,20,_,17,_,12,_],[11,_,14,_,19,_,23,_,19,_,14,_,11,_,_,_]],mel=M[bar][s];
    if(mel!=null)tone(mf(57+mel),t,SD*1.6,.05,'square',musG,{vib:6,att:.003})}}
 };
 function sched(){if(!ctx||!theme)return;const T=THEMES[theme],SD=60/T.bpm/4;if(next<ctx.currentTime)next=ctx.currentTime+.05;
  while(next<ctx.currentTime+.35){const s=step%16,bar=Math.floor(step/16)%T.bars.length;try{T.play(s,bar,next,SD,T.bars,step)}catch(e){}step++;next+=SD}}
 function llMusicOn(){try{return typeof musOn=='undefined'?true:!!musOn}catch(e){return true}}
 // baisse / rétablit la musique de Little Life pendant un mini-jeu
 function duck(on){ducked=on;try{if(typeof AC!='undefined'&&AC&&typeof mg!='undefined'&&mg){const v=on?0:(musOn?(typeof MTH!='undefined'&&MTH[curTh]?MTH[curTh].v:.32):0);mg.gain.cancelScheduledValues(AC.currentTime);mg.gain.setTargetAtTime(v,AC.currentTime,.15)}}catch(e){}}
 const api={
  ctx:()=>ensure(),
  // musique d'un mini-jeu ; null pour l'arrêter
  music(name){if(name===theme){api.level(musLevel);return}if(!ensure())return;theme=name;step=0;next=ctx.currentTime+.08;const T=THEMES[name];
   musG.gain.cancelScheduledValues(ctx.currentTime);musG.gain.setValueAtTime(0,ctx.currentTime);if(name&&T){musG.gain.linearRampToValueAtTime(llMusicOn()?T.vol*musLevel:0,ctx.currentTime+.6);if(!timer)timer=setInterval(sched,90);duck(true);sched()}
   else{clearInterval(timer);timer=null;duck(false)}},
  stop(){if(!ctx){theme=null;return}musG.gain.cancelScheduledValues(ctx.currentTime);musG.gain.setTargetAtTime(0,ctx.currentTime,.12);theme=null;clearInterval(timer);timer=null;duck(false)},
  // volume relatif de la musique (pause, ralenti…)
  level(v){musLevel=v;if(!ctx||!theme)return;musG.gain.setTargetAtTime(llMusicOn()?THEMES[theme].vol*v:0,ctx.currentTime,.15)},
  playing:()=>theme,
  // effets : nom, intensité (0..1), limite de répétition par effet
  fx(name,k=1,gap=.03){const c=ensure();if(!c||!api.FX[name])return;const now=c.currentTime;if(last[name]&&now-last[name]<gap)return;last[name]=now;try{api.FX[name](now,Math.max(0,Math.min(1.5,k)))}catch(e){}},
  FX:{},tone:(...a)=>tone(...a),noise:(...a)=>noise(...a),mf,sfx:()=>sfxG,
  // son continu (roulement de boule…) : renvoie un réglage de volume
  loop(freq,type='lowpass'){if(!ensure())return null;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf();s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=.7;g.gain.value=0;s.connect(f);f.connect(g);g.connect(sfxG);s.start();
   return{set(v,fq){g.gain.setTargetAtTime(Math.max(0,v),ctx.currentTime,.05);if(fq)f.frequency.setTargetAtTime(fq,ctx.currentTime,.05)},stop(){try{g.gain.setTargetAtTime(0,ctx.currentTime,.05);s.stop(ctx.currentTime+.3)}catch(e){}}}},
  _state:()=>({theme,ducked,step,ctx:!!ctx,mus:musG?musG.gain.value:0}),
  // rendu hors ligne d'une musique (et d'effets) en WAV : sert aux tests et à l'écoute
  async render(name,sec,fxList){const sv=[ctx,master,musG,sfxG,nzBuf];const off=new OfflineAudioContext(1,Math.round(44100*sec),44100);ctx=off;nzBuf=null;master=off.createGain();master.connect(off.destination);
   musG=off.createGain();musG.gain.value=name?THEMES[name].vol:0;musG.connect(master);sfxG=off.createGain();sfxG.gain.value=.55;sfxG.connect(master);
   try{if(name){const T=THEMES[name],SD=60/T.bpm/4;let t=.05,k=0;while(t<sec-.2){T.play(k%16,Math.floor(k/16)%T.bars.length,t,SD,T.bars,k);k++;t+=SD}}
    (fxList||[]).forEach(([n,at,kk])=>{try{api.FX[n](at,kk==null?1:kk)}catch(e){}})}finally{}
   const buf=await off.startRendering();[ctx,master,musG,sfxG,nzBuf]=sv;const d=buf.getChannelData(0),n=d.length,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,str)=>{for(let i=0;i<str.length;i++)v.setUint8(o+i,str.charCodeAt(i))};
   w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,44100,true);v.setUint32(28,88200,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
   let peak=0,rms=0;for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,d[i]));peak=Math.max(peak,Math.abs(x));rms+=x*x;v.setInt16(44+i*2,x*32767,true)}
   let bin='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return{b64:btoa(bin),peak,rms:Math.sqrt(rms/n)}}};
 // garder la baisse de la musique de Little Life si son thème change pendant le mini-jeu
 try{if(typeof setTheme=='function'){const _st=setTheme;setTheme=function(th){_st(th);if(ducked)duck(true)}}}catch(e){}
 // suivre le bouton ♪ de Little Life
 try{const b=document.getElementById('bMus');if(b)b.addEventListener('click',()=>setTimeout(()=>{if(theme)api.level(musLevel);if(ducked)duck(true)},30))}catch(e){}
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(theme)ctx.resume()});
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
