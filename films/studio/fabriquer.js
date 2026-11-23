// Fabrication des films de Little Life : node films/studio/fabriquer.js <id> [apercu]
// Rend chaque image (PNG 320×180) dans Chrome, la bande-son (WAV) par OfflineAudioContext, puis assemble un vrai MP4 (H.264 + AAC, lisible sur iPhone) avec ffmpeg.
const path=require('path'),fs=require('fs'),{spawn}=require('child_process');const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const D=__dirname,OUT=path.resolve(D,'..');const id=process.argv[2],mode=process.argv[3]||'film';
const street=fs.readFileSync(path.resolve(D,'../../rue/street.js'),'utf8'),stf=street.match(/const STF=(\{[\s\S]*?\});/)[1];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent('<html><body style="margin:0;background:#000"></body></html>');await p.addScriptTag({path:path.join(D,'lib.js')});
 for(const f of fs.readdirSync(D).filter(f=>/^film_.*\.js$/.test(f)))await p.addScriptTag({path:path.join(D,f)});
 await p.evaluate(s=>studio.setFont(eval('('+s+')')),stf);const meta=await p.evaluate(id=>studio.meta(id),id);if(errs.length)throw new Error(errs.join('\n'));
 if(mode=='apercu'){const ts=(process.argv[4]||'3,12,20,30,45,51,65,90,105,115').split(',').map(Number);fs.mkdirSync('/tmp/apercu',{recursive:true});
  for(const t of ts){const d=await p.evaluate(([id,t])=>studio.still(id,t),[id,t]);fs.writeFileSync(`/tmp/apercu/${id}_${t}.png`,Buffer.from(d.split(',')[1],'base64'))}console.log('aperçus',ts.join(' '),errs);await b.close();return}
 // bande-son
 const t0=Date.now();const w=await p.evaluate(id=>studio.audio(id),id);const wavF=`/tmp/${id}.wav`;fs.writeFileSync(wavF,Buffer.from(w,'base64'));console.log('son',((Date.now()-t0)/1000).toFixed(1)+' s');
 // images -> ffmpeg (agrandies ×2 sans lissage pour garder le pixel art net)
 const mp4=path.join(OUT,id+'.mp4');const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','24','-c:v','png','-i','-','-i',wavF,'-vf','scale=640:360:flags=neighbor','-c:v','libx264','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-preset','medium','-crf','21','-tune','animation','-g','48',
  '-af','loudnorm=I=-18:TP=-1.5:LRA=11','-ar','44100','-c:a','aac','-b:a','128k','-ac','2','-shortest','-movflags','+faststart',mp4],{stdio:['pipe','inherit','inherit']});
 const n=Math.round(meta.dur*24);for(let i=0;i<n;i+=48){const fr=await p.evaluate(([id,i])=>studio.frames(id,i,48),[id,i]);for(const s of fr){if(!ff.stdin.write(Buffer.from(s,'base64')))await new Promise(r=>ff.stdin.once('drain',r))}if(i%480==0)process.stdout.write(Math.round(i/n*100)+'% ')}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));
 // affiche (image du film) pour le lecteur
 const poster=await p.evaluate(([id,t])=>studio.still(id,t),[id,meta.poster||8]);fs.writeFileSync(path.join(OUT,id+'.png'),Buffer.from(poster.split(',')[1],'base64'));
 fs.writeFileSync(path.join(D,id+'.meta.json'),JSON.stringify(meta));console.log('\nfilm',mp4,(fs.statSync(mp4).size/1e6).toFixed(2)+' Mo',((Date.now()-t0)/1000).toFixed(0)+' s',errs);await b.close()})();
