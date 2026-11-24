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
    if(mel!=null)tone(mf(57+mel),t,SD*1.6,.05,'square',musG,{vib:6,att:.003})}},
  // course : synthwave rétro (basse pulsée, nappes en scie hachées, arpège, batterie électro)
  racing:{bpm:124,vol:.2,bars:[[57,60,64],[53,57,60],[48,52,55],[55,59,62],[57,60,64],[53,57,60],[50,53,57],[52,56,59]],
   play(s,bar,t,SD,B,k){const ch=B[bar];kick(t,s%4==0?.6:0,musG);if(s==4||s==12){noise(t,.22,.16,1800,'bandpass',musG,.7);noise(t+.02,.3,.05,4000,'highpass',musG)}
    if(s%2==0)noise(t,.03,s%4==2?.06:.03,10000,'highpass',musG);
    tone(mf(ch[0]-24),t,SD*.8,.13,'sawtooth',musG,{att:.003});if(s%2==1)tone(mf(ch[0]-12),t,SD*.6,.06,'square',musG);
    if(s%2==0)ch.forEach(m=>tone(mf(m),t,SD*1.1,.018,'sawtooth',musG,{att:.004}));
    tone(mf([ch[0],ch[1],ch[2],ch[1]+12][s%4]+12),t,SD*.7,.022,'square',musG,{att:.002});
    const _=null,M=[[12,_,_,15,_,_,19,_,17,_,15,_,12,_,10,_],[12,_,_,8,_,_,12,_,15,_,_,_,17,_,15,_],[7,_,_,10,_,_,12,_,15,_,12,_,10,_,7,_],[14,_,_,10,_,_,7,_,10,_,14,_,17,_,_,_],
     [24,_,_,22,_,_,19,_,22,_,24,_,27,_,24,_],[20,_,_,19,_,_,17,_,15,_,17,_,20,_,_,_],[17,_,_,15,_,_,12,_,14,_,15,_,17,_,20,_],[23,_,_,_,19,_,_,_,14,_,_,_,11,_,_,_]],mel=Math.floor(k/128)%2?M[bar][s]:(s<8?M[bar][s]:null);
    if(mel!=null)tone(mf(57+mel),t,SD*2.2,.045,'sawtooth',musG,{vib:5.5,att:.01})}},
  // ---- flipper : une ambiance par univers ----
  // Dinosaur World : aventure dans la jungle (tambours tribaux, marimba, flûte)
  pb_dino:{bpm:118,vol:.22,bars:[[45,52,57],[43,50,55],[41,48,53],[43,50,55],[45,52,57],[48,55,60],[41,48,53],[40,47,52]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if([0,3,6,8,10,13].includes(s))tone(mf(ch[0]-12),t,.2,s==0||s==8?.22:.13,'sine',musG,{slide:.55});if(s==4||s==12)noise(t,.09,.1,700,'bandpass',musG,1.5);
    if(s%2==0)noise(t,.04,s%4?.03:.05,7000,'highpass',musG);if(s==0||s==10)tone(mf(ch[0]-12),t,SD*5,.08,'triangle',musG);
    const ar=[0,2,1,2,0,2,1,3][s%8],mm=[ch[0],ch[1],ch[2],ch[0]+12][ar]+12;if(s%2==0||s==7||s==15)tone(mf(mm),t,SD*.9,.05,'triangle',musG,{att:.002});
    const _=null,M=[[12,_,_,15,_,17,_,_,19,_,17,_,15,_,12,_],[10,_,_,12,_,14,_,_,15,_,_,_,14,_,12,_],[8,_,_,12,_,15,_,_,17,_,15,_,12,_,_,_],[14,_,12,_,10,_,_,_,7,_,_,_,_,_,_,_],
     [19,_,_,17,_,15,_,_,12,_,15,_,17,_,19,_],[24,_,_,22,_,19,_,_,17,_,_,_,19,_,_,_],[20,_,_,19,_,17,_,_,15,_,12,_,15,_,17,_],[16,_,_,_,14,_,12,_,11,_,_,_,_,_,_,_]],mel=M[bar][s];
    if(mel!=null&&Math.floor(k/128)%2)tone(mf(57+mel),t,SD*2.4,.045,'triangle',musG,{vib:6,att:.02})}},
  // Alien Invasion : science-fiction inquiétante (thérémine, basse pulsée, bips)
  pb_alien:{bpm:104,vol:.21,bars:[[50,53,56],[49,52,55],[48,51,54],[49,53,56]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if(s==0||s==6||s==10)kick(t,.45,musG);if(s==4||s==12){noise(t,.12,.1,3200,'bandpass',musG,2);noise(t,.2,.04,6000,'highpass',musG)}
    if(s%2==0)tone(mf(ch[0]-12),t,SD*.7,.08,'square',musG,{att:.002});if(s%4==3)noise(t,.03,.04,10000,'highpass',musG);
    const bl=(k*7+s*3)%11;if(s%3==1)tone(mf(ch[bl%3]+24+(bl>6?12:0)),t,SD*.4,.02,'square',musG);
    const _=null,M=[[12,_,_,_,_,_,14,_,_,_,16,_,_,_,_,_],[11,_,_,_,_,_,13,_,_,_,9,_,_,_,_,_],[12,_,_,_,15,_,_,_,18,_,_,_,17,_,_,_],[13,_,_,_,_,_,_,_,11,_,_,_,_,_,_,_]],mel=M[bar][s];
    if(mel!=null)tone(mf(62+mel),t,SD*(s==0?7:4),.05,'sine',musG,{vib:7,att:.08});if(s==0&&bar==3)noise(t,1.2,.05,300,'bandpass',musG,2,{sweep:3000,att:.4})}},
  // Future City : electro-house nocturne (kick régulier, accords hachés, basse)
  pb_city:{bpm:126,vol:.19,bars:[[57,60,64,67],[53,57,60,64],[50,53,57,60],[52,55,59,62]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if(s%4==0)kick(t,.6,musG);if(s%4==2)noise(t,.09,.07,8000,'highpass',musG);if(s==4||s==12)noise(t,.14,.12,1500,'bandpass',musG,.8);
    if(s%4==2)tone(mf(ch[0]-24),t,SD*1.5,.12,'sawtooth',musG,{att:.003});if(s%4==3)tone(mf(ch[0]-12),t,SD*.6,.06,'sawtooth',musG);
    if([3,6,10,14].includes(s))ch.forEach(m=>tone(mf(m),t,SD*.6,.02,'sawtooth',musG,{att:.003}));
    if(Math.floor(k/64)%2)tone(mf(ch[(s*3)%4]+24),t,SD*.5,.02,'square',musG,{att:.002});
    const _=null,M=[[_,_,19,_,_,_,16,_,_,_,19,_,21,_,_,_],[_,_,17,_,_,_,16,_,_,_,12,_,14,_,_,_],[_,_,14,_,_,_,17,_,_,_,21,_,19,_,_,_],[_,_,19,_,_,_,22,_,_,_,21,_,19,_,_,_]],mel=M[bar][s];
    if(mel!=null&&Math.floor(k/128)%2)tone(mf(57+mel),t,SD*2,.04,'square',musG,{vib:5,att:.005})}},
  // Space Galaxy : ambiance spatiale planante (nappes, scintillements, basse ronde)
  pb_space:{bpm:90,vol:.24,bars:[[48,55,62,64],[45,52,59,60],[41,48,55,57],[43,50,57,59]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if(s==0)kick(t,.35,musG);if(s==10)kick(t,.2,musG);if(s==8)noise(t,.3,.05,2500,'bandpass',musG,.7,{att:.05});
    if(s==0)ch.forEach(m=>tone(mf(m),t,SD*16,.026,'sine',musG,{att:.4}));if(s==0||s==8)tone(mf(ch[0]-12),t,SD*7,.1,'sine',musG,{att:.05});
    if([2,5,9,13,15].includes(s))tone(mf(ch[(s+bar)%4]+24),t,SD*3,.025,'triangle',musG,{att:.003});
    const _=null,M=[[_,_,_,_,16,_,_,_,14,_,_,_,11,_,_,_],[12,_,_,_,_,_,_,_,7,_,_,_,_,_,_,_],[_,_,_,_,12,_,_,_,14,_,_,_,16,_,_,_],[19,_,_,_,_,_,_,_,17,_,_,_,_,_,_,_]],mel=M[bar][s];
    if(mel!=null)tone(mf(60+mel),t,SD*6,.04,'sine',musG,{vib:4,att:.1})}},
  // Whack-a-Mole : fanfare de fête foraine rebondissante (orgue, basse sautillante, grosse caisse)
  mole:{bpm:150,vol:.19,bars:[[60,64,67],[65,69,72],[67,71,74],[60,64,67],[60,64,67],[65,69,72],[67,71,74],[67,71,74]],
   play(s,bar,t,SD,B,k){const ch=B[bar];if(s%4==0)kick(t,.5,musG);if(s%4==2){noise(t,.06,.07,7000,'highpass',musG);tone(mf(ch[1]),t,SD*.6,.03,'square',musG);tone(mf(ch[2]),t,SD*.6,.03,'square',musG)}
    if(s%4==0)tone(mf(ch[0]-12),t,SD*1.2,.13,'triangle',musG);if(s%8==4)noise(t,.1,.08,1800,'bandpass',musG,1);
    const _=null,M=[[72,_,76,_,79,_,76,_,72,_,74,76,77,_,_,_],[77,_,81,_,84,_,81,_,77,_,79,81,82,_,_,_],[79,_,77,_,76,_,74,_,72,_,71,_,74,_,_,_],[72,_,_,79,_,_,76,_,72,_,_,_,_,_,_,_]][bar%4],m=M[s];
    if(m!=null)tone(mf(m),t,SD*1.4,.05,'square',musG,{vib:5});if(s%2==1&&Math.floor(k/64)%2)tone(mf(ch[(s>>1)%3]+12),t,SD*.5,.02,'triangle',musG)}}
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

