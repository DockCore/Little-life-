// ===== STUDIO LITTLE LIFE : bibliothèque de dessin et de son pour fabriquer les films (rendu hors ligne, jamais chargé par le jeu) =====
// Image : 320 × 180 pixels, 24 images par seconde. Son : OfflineAudioContext (musique, bruitages, voix de personnages).
const FW=320,FH=180,FPS=24;
const cv=document.createElement('canvas');cv.width=FW;cv.height=FH;document.body.appendChild(cv);const X=cv.getContext('2d');X.imageSmoothingEnabled=false;
// ---------- outils de dessin ----------
const rect=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h)))};
const px=(x,y,c)=>rect(x,y,1,1,c);
function disc(cx,cy,r,c){X.fillStyle=c;for(let j=-Math.ceil(r);j<=Math.ceil(r);j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));if(r*r-j*j>=0)X.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function ellipse(cx,cy,rx,ry,c){X.fillStyle=c;for(let j=-Math.ceil(ry);j<=Math.ceil(ry);j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));X.fillRect(Math.round(cx-w),Math.round(cy+j),2*w+1,1)}}
function line(x0,y0,x1,y1,c,t=1){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));X.fillStyle=c;for(let i=0;i<=n;i++){const u=i/n;X.fillRect(Math.round(x0+(x1-x0)*u-t/2),Math.round(y0+(y1-y0)*u-t/2),t,t)}}
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
function hex(c){c=c.replace('#','');return[parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)]}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(lerp(v,B[i],clamp(t))).toString(16).padStart(2,'0')).join('')}
// ciel en bandes tramées (style pixel art)
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
function sky(cols,y0=0,y1=FH){y0=Math.max(0,Math.round(y0));y1=Math.min(FH,Math.round(y1));const h=y1-y0;if(h<=0)return;const id=X.createImageData(FW,h),d=id.data,n=cols.length-1,C=cols.map(hex);
 for(let y=0;y<h;y++){const f=y/h*n,i=Math.min(n-1,Math.floor(f)),k=f-i,A=C[i],B=C[i+1];for(let x=0;x<FW;x++){const c=k>BAY[(y%4)*4+(x%4)]?B:A,o=(y*FW+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}X.putImageData(id,0,y0)}
function stars(n,seed,t,ymax=FH,tw=true){let s=seed;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let i=0;i<n;i++){const x=r()*FW|0,y=r()*ymax|0,b=r();const on=!tw||Math.sin(t*3+i)>-.6;if(on)px(x,y,b>.8?'#ffffff':b>.5?'#cfd8ff':'#8f97c0');if(b>.95&&tw&&Math.sin(t*2+i)>.7){px(x-1,y,'#8f97c0');px(x+1,y,'#8f97c0');px(x,y-1,'#8f97c0');px(x,y+1,'#8f97c0')}}}
function hills(base,amp,freq,phase,col,col2){for(let x=0;x<FW;x++){const h=base-amp*(Math.sin((x+phase)*freq)*.6+Math.sin((x+phase)*freq*2.3+1)*.4);X.fillStyle=col;X.fillRect(x,Math.round(h),1,FH-Math.round(h));if(col2){X.fillStyle=col2;X.fillRect(x,Math.round(h),1,2)}}}
function cloud(x,y,s,c,c2){[[0,0,6],[6,-3,7],[13,0,6],[5,2,6],[-5,2,4],[18,2,4]].forEach(([a,b,r])=>disc(x+a*s,y+b*s,r*s,c));if(c2)for(let i=-5;i<22;i++)rect(x+i*s,y+6*s,s,s,c2)}
// sprites en texte : chaque caractère est une couleur de la palette (« . » = vide)
function spr(rows,x,y,pal,flip=false,s=1){const w=rows[0].length;rows.forEach((r,j)=>{for(let i=0;i<w;i++){const ch=r[flip?w-1-i:i];if(ch=='.'||ch==' ')continue;const c=pal[ch];if(c){X.fillStyle=c;X.fillRect(Math.round(x+i*s),Math.round(y+j*s),s,s)}}})}
function outline(rows){// ajoute un contour sombre « k » autour d'un sprite
 const h=rows.length,w=rows[0].length,o=[];for(let j=-1;j<=h;j++){let s='';for(let i=-1;i<=w;i++){const g=(a,b)=>a>=0&&b>=0&&b<h&&a<w&&rows[b][a]!='.';if(g(i,j))s+=rows[j][i];else s+=(g(i-1,j)||g(i+1,j)||g(i,j-1)||g(i,j+1))?'k':'.'}o.push(s)}return o}
// texte (police pixel 5×7 du jeu)
let STF={};function text(s,x,y,c,sc=1,shadow){s=String(s).toUpperCase();let cx=x;for(const ch of s){const g=STF[ch];if(g){for(let k=0;k<35;k++)if(g[k]=='1'){if(shadow)rect(cx+(k%5)*sc+sc,y+Math.floor(k/5)*sc+sc,sc,sc,shadow);rect(cx+(k%5)*sc,y+Math.floor(k/5)*sc,sc,sc,c)}}cx+=6*sc}}
const tw=(s,sc=1)=>String(s).length*6*sc-sc;function ctext(s,y,c,sc=1,shadow){text(s,Math.round((FW-tw(s,sc))/2),y,c,sc,shadow)}
function fade(a,c='#000000'){if(a<=0)return;X.globalAlpha=clamp(a);rect(0,0,FW,FH,c);X.globalAlpha=1}
function vignette(){for(let i=0;i<10;i++){X.globalAlpha=.035;rect(0,0,FW,10-i,'#000');rect(0,FH-10+i,FW,10-i,'#000');rect(0,0,14-i,FH,'#000');rect(FW-14+i,0,14-i,FH,'#000')}X.globalAlpha=1}
function letterbox(k){if(k<=0)return;const h=Math.round(18*k);rect(0,0,FW,h,'#000');rect(0,FH-h,FW,h,'#000')}
function rnd(seed){let s=seed|0||1;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
// ---------- générique commun ----------
function titleCard(t,title,sub,col){rect(0,0,FW,FH,'#05040e');stars(70,7,t);const a=clamp(t/1.2)*clamp((6-t)/1);X.globalAlpha=a;ctext(title,70,col,3,'#000000');ctext(sub,104,'#c9c4f0',1);ctext('UN FILM LITTLE LIFE',118,'#8f97c0',1);X.globalAlpha=1}
function credits(t,d,title,lines,col){rect(0,0,FW,FH,'#05040e');stars(60,11,t);const a=clamp(t/1)*clamp((d-t)/1);X.globalAlpha=a;ctext('FIN',40,col,3,'#000');ctext(title,78,'#ffffff',1);lines.forEach((l,i)=>ctext(l,96+i*11,'#8f97c0',1));X.globalAlpha=1}
// ---------- son ----------
const AU={};
function audioInit(dur){const ac=new OfflineAudioContext(2,Math.ceil(44100*dur),44100),master=ac.createGain();master.gain.value=.9;const comp=ac.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3.5;master.connect(comp);comp.connect(ac.destination);
 const bus=n=>{const g=ac.createGain();g.gain.value=n;g.connect(master);return g};AU.ac=ac;AU.mus=bus(.55);AU.sfx=bus(.8);AU.voc=bus(.9);
 const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nb=nb;return ac}
const mf=m=>440*Math.pow(2,(m-69)/12);
function env(g,t,a,d,v,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);if(rel)g.gain.setValueAtTime(v,t+Math.max(a,d-rel));g.gain.exponentialRampToValueAtTime(.0001,t+d)}
function osc(f,t,d,v,type='sine',dest=AU.mus,o={}){const ac=AU.ac,os=ac.createOscillator(),g=ac.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f*o.slide),t+d);if(o.det)os.detune.value=o.det;
 if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.vib;lg.gain.value=f*(o.vd||.01);l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.1)}
 let node=os;if(o.lp){const f2=ac.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;f2.Q.value=o.q||.7;os.connect(f2);node=f2}
 env(g,t,o.a||.01,d,v,o.rel);node.connect(g);if(o.pan!=null&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=o.pan;g.connect(p);p.connect(dest)}else g.connect(dest);os.start(t);os.stop(t+d+.05)}
function noise(t,d,v,f,type='bandpass',dest=AU.sfx,o={}){const ac=AU.ac,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=AU.nb;s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(o.sweep)fl.frequency.exponentialRampToValueAtTime(o.sweep,t+d);fl.Q.value=o.q||1;
 env(g,t,o.a||.005,d,v,o.rel);s.connect(fl);fl.connect(g);if(o.pan!=null&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=o.pan;g.connect(p);p.connect(dest)}else g.connect(dest);s.start(t,Math.random());s.stop(t+d+.05)}
// nappe continue (pluie, vent, vagues) : bruit filtré avec volume qui suit une courbe
function ambience(t0,t1,f,type,vol,o={}){const ac=AU.ac,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=AU.nb;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=o.q||.7;
 g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+(o.fi||1));g.gain.setValueAtTime(vol,Math.max(t0+(o.fi||1),t1-(o.fo||1)));g.gain.linearRampToValueAtTime(0,t1);
 if(o.lfo){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.lfo;lg.gain.value=vol*.6;l.connect(lg);lg.connect(g.gain);l.start(t0);l.stop(t1)}
 if(o.lfoF){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.lfoF;lg.gain.value=f*.5;l.connect(lg);lg.connect(fl.frequency);l.start(t0);l.stop(t1)}
 s.connect(fl);fl.connect(g);g.connect(AU.sfx);s.start(t0);s.stop(t1+.05)}
// instruments
const kick=(t,v=.5)=>osc(150,t,.25,v,'sine',AU.mus,{slide:.27});const snare=(t,v=.15)=>{noise(t,.14,v,2200,'bandpass',AU.mus,{q:.8});osc(190,t,.08,v*.6,'triangle',AU.mus,{slide:.6})};const hat=(t,v=.05)=>noise(t,.04,v,9000,'highpass',AU.mus);
const pad=(ch,t,d,v=.05,lp=1400)=>ch.forEach((m,i)=>{osc(mf(m),t,d,v,'sawtooth',AU.mus,{a:d*.25,rel:d*.3,lp,det:i%2?7:-7,pan:i%2?.3:-.3});osc(mf(m),t,d,v*.6,'sawtooth',AU.mus,{a:d*.25,rel:d*.3,lp,det:i%2?-12:12})});
const pluck=(m,t,v=.06,d=.5,type='triangle')=>osc(mf(m),t,d,v,type,AU.mus,{a:.004});const bell=(m,t,v=.04)=>{osc(mf(m),t,1.4,v,'sine',AU.mus,{a:.003});osc(mf(m)*2.01,t,.7,v*.4,'sine',AU.mus,{a:.003})};
const bassN=(m,t,d,v=.12)=>osc(mf(m),t,d,v,'sine',AU.mus,{a:.01,rel:.05});const lead=(m,t,d,v=.05,type='triangle')=>osc(mf(m),t,d,v,type,AU.mus,{a:.03,vib:5,vd:.006,rel:.08});
// voix de personnages : syllabes chantées (style « charabia » de jeu vidéo), intonation qui monte sur « ? », baisse en fin de phrase
function voice(t,txt,v){const syl=Math.max(2,Math.round(txt.replace(/[^a-zàâéèêëîïôûüç]/gi,'').length/2.6)),q=/\?\s*$/.test(txt),ex=/!/.test(txt),R=rnd(txt.length*97+Math.round(t*10)),dur=v.rate||.105;
 for(let i=0;i<syl;i++){const tt=t+i*dur*(1+(R()-.5)*.3),last=i==syl-1,p=v.pitch*(1+(R()-.5)*.25+(q&&last?.35:0)+(ex&&i==0?.15:0)-(!q&&last?.12:0)),f=[650,900,1200,2300][Math.floor(R()*4)];
  const ac=AU.ac,os=ac.createOscillator(),bp=ac.createBiquadFilter(),g=ac.createGain();os.type=v.type||'sawtooth';os.frequency.setValueAtTime(p,tt);os.frequency.linearRampToValueAtTime(p*(last&&q?1.25:last?.9:1.03),tt+dur*.9);
  bp.type='bandpass';bp.frequency.value=v.robot?1500:f;bp.Q.value=v.robot?2:1.6;env(g,tt,.012,dur*.92,v.vol||.22);os.connect(bp);bp.connect(g);g.connect(AU.voc);os.start(tt);os.stop(tt+dur);
  if(!v.robot){const o2=ac.createOscillator(),g2=ac.createGain();o2.type='sine';o2.frequency.value=p;env(g2,tt,.012,dur*.9,(v.vol||.22)*.35);o2.connect(g2);g2.connect(AU.voc);o2.start(tt);o2.stop(tt+dur)}}}
function wav(buf){const n=buf.length,ch=buf.numberOfChannels,b=new ArrayBuffer(44+n*ch*2),v=new DataView(b),ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
 ws(0,'RIFF');v.setUint32(4,36+n*ch*2,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,44100,true);v.setUint32(28,44100*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*ch*2,true);
 const C=[...Array(ch)].map((_,i)=>buf.getChannelData(i));let o=44;for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const s=Math.max(-1,Math.min(1,C[c][i]));v.setInt16(o,s<0?s*32768:s*32767,true);o+=2}
 let bin='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(bin)}
// ---------- interface avec le script de fabrication ----------
const FILMS_STUDIO={};
window.studio={
 setFont(f){STF=f},list:()=>Object.keys(FILMS_STUDIO),
 meta(id){const F=FILMS_STUDIO[id];return{id,dur:F.dur,subs:F.subs,reactions:F.reactions,title:F.title}},
 async frames(id,i0,n){const F=FILMS_STUDIO[id],out=[];for(let i=i0;i<i0+n;i++){const t=i/FPS;if(t>F.dur)break;X.globalAlpha=1;X.globalCompositeOperation='source-over';F.draw(t);
   const bl=await new Promise(r=>cv.toBlob(r,'image/png'));const ab=new Uint8Array(await bl.arrayBuffer());let s='';for(let k=0;k<ab.length;k+=32768)s+=String.fromCharCode.apply(null,ab.subarray(k,k+32768));out.push(btoa(s))}return out},
 async audio(id){const F=FILMS_STUDIO[id];const ac=audioInit(F.dur);F.sound();(F.subs||[]).forEach(s=>{if(s.voice!==false)voice(s.a,s.txt,F.voices[s.who]||{pitch:200})});const buf=await ac.startRendering();return wav(buf)},
 still(id,t){FILMS_STUDIO[id].draw(t);return cv.toDataURL()}};
