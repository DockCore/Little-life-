const path=require('path');const PW='/home/claude/.npm-global/lib/node_modules/playwright';const JEU='file://'+path.resolve(__dirname,'../../index.html');
const {chromium}=require(PW);
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const E=(f,a)=>p.evaluate(f,a);await p.goto(JEU);await p.waitForTimeout(2500);await E(()=>{for(const id of ['intro','title','tscr']){const e=document.getElementById(id);if(e)e.remove()}document.getElementById('crOk2').click()});await p.waitForTimeout(500);
await E(()=>{streetEnter();GAMES.bowling.open({x:300})});
const r=await E(()=>{const out=[];
 const sim=(aim,pw,spin,bi)=>{bwRack();BW.bi=bi;bwNewBall();BW.phase='aim';BW.aim=aim;BW.pw=pw;BW.spin=spin;bwThrow();let t=0;while(t<12){for(let i=0;i<4;i++)bwStep(BW_DT);t+=1/60;const b=BW.ball;if((b.pit||b.z>BW_HEAD+.3)&&!bwMoving()&&t>1)break}
  return BW.pins.filter(q=>!q.up||q.out).length};
 for(const bi of[0,2,4])for(const spin of[0,-1,-2])for(const aim of[-.9,-.5,-.25,-.1,0,.05,.1,.2,.4,.8])out.push([bi,spin,aim,sim(aim,.75,spin,bi)]);
 BW.phase='aim';return out});
const byS={};r.forEach(([bi,s,a,n])=>{(byS[bi+'/'+s]=byS[bi+'/'+s]||[]).push(a+':'+n)});console.log(byS);
const all=r.map(x=>x[3]);console.log('strikes',all.filter(n=>n==10).length,'/',all.length,'moyenne',(all.reduce((a,b)=>a+b)/all.length).toFixed(2));
await b.close()})();
