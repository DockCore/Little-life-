// ===== SALLE DE SPORT : profil physique, mini-jeux, objectifs, records, défis, récompenses, interface =====
(function(){
const GY=window.GYM,isG=()=>place=='gym';
const sfx=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.03)}catch(e){}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),rnd=(a,b)=>a+Math.random()*(b-a);
// ---------- profil physique (dans la sauvegarde du jeu : N.sport) ----------
const STATS=[{k:'force',n:'Force',c:'#ff6b4a',i:'💪'},{k:'endu',n:'Endurance',c:'#3fc0f0',i:'🫀'},{k:'forme',n:'Forme physique',c:'#9be84a',i:'⚡'}];
const LVMAX=50,need=lv=>60+25*lv;
function SP(){if(!N.sport)N.sport={v:1,st:{force:{lv:1,xp:0},endu:{lv:1,xp:0},forme:{lv:1,xp:0}},tot:{seances:0,acts:0,reps:0,dist:0,velo:0,coups:0,temps:0,defis:0,obj:0,hebdo:0},rec:{},obj:{d:null,w:null},unl:[],last:null,streak:0,defis:{},restAt:0,hist:[]};
 const s=N.sport;s.tot=s.tot||{};s.rec=s.rec||{};s.unl=s.unl||[];s.defis=s.defis||{};s.hist=s.hist||[];return s}
const lvSum=()=>STATS.reduce((a,s)=>a+SP().st[s.k].lv,0);
// petits avantages (jamais obligatoires, jamais pénalisants)
const ADV={eco:()=>1-Math.min(.25,(SP().st.endu.lv-1)*.025),joie:()=>1+Math.min(.3,(SP().st.forme.lv-1)*.03),bonus:()=>Math.floor(SP().st.force.lv/5)};
// gain d'expérience : renvoie les montées de niveau
function gainXP(k,x){const s=SP().st[k],ups=[];x=Math.round(x);if(x<=0)return{x:0,ups};s.xp+=x;while(s.lv<LVMAX&&s.xp>=need(s.lv)){s.xp-=need(s.lv);s.lv++;ups.push(s.lv)}if(s.lv>=LVMAX)s.xp=Math.min(s.xp,need(s.lv));if(ups.length)objAdd('w','lv',ups.length);return{x,ups}}
// ---------- activités ----------
const ACT={
 run:{n:'Tapis de course',z:'Cardio',st:{endu:1,forme:.25},desc:'Tape à gauche puis à droite au rythme des pas : plus tu es régulier, plus tu cours vite.',ctl:'Gauche · Droite',main:'endu'},
 bike:{n:'Vélo d’appartement',z:'Cardio',st:{endu:1,forme:.25},desc:'Pédale en tapant pour garder ta cadence dans la zone verte : plat, côtes et sprints.',ctl:'Pédaler',main:'endu'},
 row:{n:'Rameur',z:'Cardio',st:{endu:.9,force:.3,forme:.2},desc:'Tire quand le curseur passe dans la zone verte pour avancer : bats ton bateau fantôme sur 300 m.',ctl:'Tirer',main:'endu'},
 lift:{n:'Haltères',z:'Musculation',st:{force:1,forme:.2},desc:'Tape quand le curseur est dans la zone verte pour réussir chaque répétition : 3 séries de 8.',ctl:'Soulever',main:'force'},
 bench:{n:'Banc de développé',z:'Musculation',st:{force:1,endu:.15},desc:'Garde le doigt appuyé pour pousser, relâche dans la zone verte en haut. Trop tôt ou trop tard : la barre redescend.',ctl:'Pousser (maintenir)',main:'force'},
 box:{n:'Sac de frappe',z:'Boxe',st:{force:.7,forme:.5},desc:'Suis la séquence : touche le bon coup avant que le cercle se referme. Les enchaînements s’allongent et s’accélèrent.',ctl:'Jab · Direct · Crochet',main:'force'},
 stretch:{n:'Étirements',z:'Étirements',st:{forme:1,endu:.15},desc:'Maintiens pour inspirer, relâche quand le cercle touche l’anneau ; appuie de nouveau quand il revient au centre.',ctl:'Respirer (maintenir)',main:'forme'},
 rest:{n:'Se reposer',z:'Repos',st:{},desc:'Assieds-toi sur le banc et bois un peu d’eau : récupère de l’énergie après l’effort.',ctl:'',main:null}};
const CARDIO=['run','bike','row'],FORCE=['lift','bench','box'];
const DIFF=[{n:'Facile',m:1},{n:'Normal',m:1.25},{n:'Intense',m:1.55,req:4}];
const recDef={run:[['dist','Plus longue distance (tapis)','m',1],['score','Meilleur score (tapis)','pts',1]],bike:[['dist','Plus longue distance (vélo)','m',1],['score','Meilleure performance (vélo)','pts',1]],row:[['time','Meilleur temps 300 m (rameur)','s',-1]],
 lift:[['reps','Plus de répétitions (haltères)','rép.',1],['score','Meilleur score (haltères)','pts',1]],bench:[['kg','Charge maximale (banc)','kg',1],['score','Meilleur score (banc)','pts',1]],box:[['score','Meilleur score (sac de frappe)','pts',1],['combo','Plus long enchaînement (sac)','coups',1]],stretch:[['acc','Meilleure précision (étirements)','%',1]]};
// ---------- objectifs quotidiens et hebdomadaires ----------
const dayId=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const weekId=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return'S'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const OD=[
 {id:'d_acts',t:'Faire 2 entraînements',c:'acts',n:2,r:{c:10,xp:{forme:15}}},
 {id:'d_reps',t:'Réussir 30 répétitions (haltères ou banc)',c:'reps',n:30,r:{c:12,xp:{force:15}}},
 {id:'d_dist',t:'Parcourir 1 km sur le tapis',c:'dist',n:1000,r:{c:12,xp:{endu:15}}},
 {id:'d_rec',t:'Battre un record personnel',c:'rec',n:1,r:{c:15,xp:{forme:10}}},
 {id:'d_velo',t:'Pédaler 2 km sur le vélo',c:'velo',n:2000,r:{c:12,xp:{endu:15}}},
 {id:'d_coups',t:'Placer 40 coups au sac de frappe',c:'coups',n:40,r:{c:12,xp:{force:12,forme:5}}},
 {id:'d_etir',t:'Faire une séance d’étirements',c:'etir',n:1,r:{c:8,xp:{forme:15}}},
 {id:'d_rame',t:'Ramer 300 m',c:'rame',n:300,r:{c:10,xp:{endu:12}}}];
const OW=[
 {id:'w_sess',t:'Réaliser 3 séances',c:'sess',n:3,r:{c:40,xp:{forme:40}}},
 {id:'w_disc',t:'Pratiquer 4 disciplines différentes',c:'disc',n:4,r:{c:35,xp:{forme:30}}},
 {id:'w_lv',t:'Gagner 2 niveaux',c:'lv',n:2,r:{c:30,xp:{forme:20}}},
 {id:'w_full',t:'Terminer une séance complète (cardio + muscu + étirements)',c:'full',n:1,r:{c:45,xp:{forme:40}}},
 {id:'w_defi',t:'Gagner un défi contre un sportif',c:'defi',n:1,r:{c:30,xp:{forme:20}}},
 {id:'w_acts',t:'Faire 10 entraînements',c:'acts',n:10,r:{c:35,xp:{endu:20,force:20}}}];
const seed=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^=h>>>16)>>>0)/4294967296}};
function objCur(){const S=SP(),d=dayId(),w=weekId();
 if(!S.obj.d||S.obj.d.id!=d){const r=seed('d'+d),rest=OD.slice(1).map(o=>[r(),o]).sort((a,b)=>a[0]-b[0]).map(x=>x[1].id);S.obj.d={id:d,list:['d_acts'].concat(rest.slice(0,3)),c:{},done:{}}}
 if(!S.obj.w||S.obj.w.id!=w){const r=seed('w'+w),extra=r()<.5?'w_defi':'w_acts';S.obj.w={id:w,list:['w_sess','w_disc','w_lv','w_full',extra],c:{},done:{},disc:[]}}return S.obj}
const objDef=id=>OD.find(o=>o.id==id)||OW.find(o=>o.id==id);
const NEWLY=[];
function objAdd(p,c,n){const O=objCur(),o=O[p];o.c[c]=(o.c[c]||0)+n;for(const id of o.list){const d=objDef(id);if(d.c!=c||o.done[id])continue;if((o.c[c]||0)>=d.n){o.done[id]=1;reward(d.r,'Objectif atteint : '+d.t);SP().tot.obj++;if(p=='w')SP().tot.hebdo++;NEWLY.push(d.t);sfx('gmLevel',.6)}}}
function objCount(p,id){const O=objCur(),o=O[p],d=objDef(id);return Math.min(d.n,o.c[d.c]||0)}
function reward(r,why){if(!r)return;if(r.c){earn(r.c)}if(r.xp)for(const k in r.xp)gainXP(k,r.xp[k]);GY.lastRw=(GY.lastRw||[]).concat([{why,r}])}
// ---------- récompenses à débloquer : tenues, accessoires, trophées, décoration ----------
const UNL=[
 {id:'running',t:'Chaussures de running',k:'ward',req:{endu:3}},{id:'tank',t:'Débardeur de sport',k:'ward',req:{force:3}},
 {id:'casq',t:'Casquette',k:'ward',req:{forme:3}},{id:'bandeau',t:'Bandeau',k:'ward',req:{forme:3}},
 {id:'jog',t:'Jogging',k:'ward',req:{endu:5}},{id:'short',t:'Short de sport',k:'ward',req:{forme:5}},{id:'legging',t:'Legging',k:'ward',req:{forme:5}},
 {id:'hoodie',t:'Sweat à capuche',k:'ward',req:{total:15}},{id:'phones',t:'Casque audio',k:'ward',req:{total:22}},
 {id:'Tapis de yoga',t:'Tapis de yoga (déco)',k:'deco',req:{forme:4},w:1,h:2},{id:'Haltères déco',t:'Haltères (déco)',k:'deco',req:{force:5},w:1,h:1},
 {id:'Affiche fitness',t:'Affiche fitness (déco)',k:'deco',req:{hebdo:1},w:1,h:1},
 {id:'Trophée de bronze',t:'Trophée de bronze',k:'deco',req:{total:8},w:1,h:1},{id:'Trophée d’argent',t:'Trophée d’argent',k:'deco',req:{total:18},w:1,h:1},{id:'Trophée d’or',t:'Trophée d’or',k:'deco',req:{total:30},w:1,h:1}];
function reqOk(q){const S=SP();for(const k in q){const v=k=='total'?lvSum():k=='hebdo'?S.tot.hebdo||0:S.st[k].lv;if(v<q[k])return false}return true}
const reqTxt=q=>Object.keys(q).map(k=>k=='total'?'Niveaux cumulés '+q[k]:k=='hebdo'?q[k]+' objectif hebdomadaire':STATS.find(s=>s.k==k).n+' niv. '+q[k]).join(' · ');
function checkUnl(){const S=SP(),got=[];for(const u of UNL){if(S.unl.includes(u.id)||!reqOk(u.req))continue;S.unl.push(u.id);got.push(u);
  if(u.k=='ward'){N.wd2=N.wd2||{own:{}};N.wd2.own=N.wd2.own||{};N.wd2.own[u.id]=true}
  else{const it={n:u.id,w:u.w,h:u.h,p:0,c:'#c0a060',d:u.t};try{const f=placeItem(it,true);if(!f){N.store=N.store||[];N.store.push(u.id)}}catch(e){N.store=N.store||[];N.store.push(u.id)}}}
 if(got.length){sfx('gmRecord');GY.lastUnl=(GY.lastUnl||[]).concat(got)}return got}
// décoration de la maison débloquée à la salle
{const D={'Trophée de bronze':'#c07a3a','Trophée d’argent':'#c9d1da','Trophée d’or':'#f5c84c'};
 const _di=drawItem;drawItem=function(f,ic){const n=f.n;
  if(D[n]){const u=f.x+.5,v=f.y+.5,c=D[n];fshadow(f);B3(u-.3,v-.3,.6,.6,0,10,'#2b3038',{t:'#3a414c'});B3(u-.07,v-.07,.14,.14,10,8,mx(c,'#000',.3),{t:c});B3(u-.22,v-.22,.44,.44,18,14,mx(c,'#000',.25),{t:mx(c,'#fff',.2),l:c,r:mx(c,'#000',.2)});
   const p=P3(u+.22,v,26);G.fillStyle='#fff8d0';G.fillRect(Math.round(p[0]),Math.round(p[1])-3,1,5);return}
  if(n=='Tapis de yoga'){const{x,y,w,h}=f;B3(x+.1,y+.1,w-.2,h-.2,0,1,'#1a8a82',{t:'#1fa8a0'});B3(x+.1,y+h-.45,w-.2,.35,1,4,'#178079',{t:'#20b8ae'});return}
  if(n=='Haltères déco'){const u=f.x+.5,v=f.y+.5;fshadow(f);[[-.2,'#e0533d'],[.2,'#3f8fd0']].forEach(([d,c])=>{B3(u-.3,v+d-.05,.6,.1,3,2,'#5a606a',{flat:1});B3(u-.32,v+d-.1,.12,.2,0,7,'#15181d',{t:c});B3(u+.2,v+d-.1,.12,.2,0,7,'#15181d',{t:c})});return}
  if(n=='Affiche fitness'){const u=f.x+.5,v=f.y+.5;fshadow(f);B3(u-.06,v-.3,.12,.6,0,6,'#2b3038');poly([P3(u,v-.38,52),P3(u,v+.38,52),P3(u,v+.38,8),P3(u,v-.38,8)],'#15181d');poly([P3(u+.01,v-.33,49),P3(u+.01,v+.33,49),P3(u+.01,v+.33,11),P3(u+.01,v-.33,11)],'#ff4fa3');
   poly([P3(u+.02,v-.33,30),P3(u+.02,v+.33,30),P3(u+.02,v+.33,11),P3(u+.02,v-.33,11)],'#3fe0ff');const p=P3(u+.02,v,40);G.fillStyle='#ffffff';G.fillRect(Math.round(p[0])-4,Math.round(p[1]),9,2);return}
  return _di(f,ic)};
 ['Trophée de bronze','Trophée d’argent','Trophée d’or','Tapis de yoga','Haltères déco','Affiche fitness'].forEach(n=>{try{ROTS[n]=[0]}catch(e){}})}
// ---------- moteur des mini-jeux ----------
let GM=null;// partie en cours
const W60=1/60;
function mk(k,d,defi){const a=ACT[k],g={k,a,d,m:DIFF[d].m,t:0,score:0,done:false,res:null,defi,msg:'',fb:[],hold:false};return Object.assign(g,GAMES[k].init(g))}
// petites notes de jugement qui montent (Parfait, Bien, Raté…)
const fbAdd=(g,txt,col)=>{g.fb.push({txt,col,t:0})};
const GAMES={
 // ---- tapis de course : rythme gauche/droite ----
 run:{dur:42,init(g){const bpm=[96,116,136][g.d],iv=60/bpm,N2=[];let t=2,l=0;while(t<this.dur-1){let lane=l;const r=Math.random();if(g.d>0&&r<(g.d==2?.22:.14))lane=l;else lane=1-l;N2.push({t,lane});l=lane;t+=iv*(g.d==2&&Math.random()<.12?.5:1)}
   return{notes:N2,TT:1.45,combo:0,maxc:0,sp:7,dist:0,hits:0,perf:0,miss:0,dur:this.dur}},
  step(g){g.t+=W60;for(const n of g.notes)if(!n.j&&g.t>n.t+.2){n.j='miss';g.miss++;g.combo=0;g.sp=Math.max(5,g.sp-1.4);fbAdd(g,'Raté','#ff6b6b');sfx('gmMiss',.5)}
   const tgt=7+9*Math.min(1,g.combo/24);g.sp+=(tgt-g.sp)*.02;g.dist+=g.sp/3.6*W60*10;if(g.t>=g.dur)g.done=true},
  input(g,b,ev){if(ev!='down')return;const lane=b=='L'?0:1;let best=null,bd=9;for(const n of g.notes){if(n.j||n.lane!=lane)continue;const d=Math.abs(n.t-g.t);if(d<bd){bd=d;best=n}}
   if(!best||bd>.2){g.sp=Math.max(5,g.sp-.5);fbAdd(g,'Faux pas','#ffb36b');sfx('gmMiss',.3);return}
   const pf=bd<=.07;best.j=pf?'p':'g';g.combo++;g.maxc=Math.max(g.maxc,g.combo);g.hits++;if(pf)g.perf++;g.score+=Math.round((pf?100:60)*Math.min(2.5,1+g.combo*.05)*g.m);fbAdd(g,pf?'Parfait':'Bien',pf?'#9be84a':'#3fc0f0');sfx(pf?'gmPerfect':'gmGood',.7);sfx('gmStep',.6)},
  draw(g,x,W,H){const hy=H-34,lw=Math.min(90,W*.22),cx=[W/2-lw*.65,W/2+lw*.65];x.fillStyle='#1d2026';x.fillRect(0,0,W,H);
   for(let k=0;k<2;k++){x.fillStyle='#262a31';x.fillRect(cx[k]-lw/2,0,lw,H);x.fillStyle='rgba(255,255,255,.06)';for(let y=((g.t*120)%24)-24;y<H;y+=24)x.fillRect(cx[k]-lw/2,y,lw,2)}
   x.fillStyle='#3a414c';x.fillRect(0,hy-2,W,4);[0,1].forEach(k=>{x.strokeStyle=k?'#ff4fa3':'#3fe0ff';x.lineWidth=3;x.strokeRect(cx[k]-lw/2+4,hy-14,lw-8,28)});
   for(const n of g.notes){if(n.j&&n.j!='miss')continue;const dy=(n.t-g.t)/g.TT;if(dy<-.2||dy>1.05)continue;const y=hy-dy*(hy-8);const c=n.lane?'#ff4fa3':'#3fe0ff';x.globalAlpha=n.j=='miss'?.3:1;rr(x,cx[n.lane]-lw/2+8,y-9,lw-16,18,9,c);x.fillStyle='rgba(255,255,255,.8)';x.fillRect(cx[n.lane]-6,y-2,12,4);x.globalAlpha=1}
   x.fillStyle='#e8edf1';x.font='600 12px system-ui';x.textAlign='center';x.fillText('G',cx[0],hy+28);x.fillText('D',cx[1],hy+28);
   x.textAlign='left';x.font='800 15px system-ui';x.fillStyle='#9be84a';x.fillText(g.sp.toFixed(1)+' km/h',8,20);x.fillStyle='#e8edf1';x.font='700 13px system-ui';x.fillText((g.dist/1000).toFixed(2)+' km',8,38);if(g.combo>2){x.fillStyle='#f5c84c';x.fillText('Combo ×'+g.combo,8,56)}},
  res(g){const tot=g.notes.length,acc=tot?g.hits/tot:0;return{score:g.score,dist:Math.round(g.dist),acc,xp:{endu:(10+g.dist/150+acc*10)*g.m,forme:4*g.m},rec:{dist:Math.round(g.dist),score:g.score},lines:[['Distance',(g.dist/1000).toFixed(2)+' km'],['Précision',Math.round(acc*100)+' %'],['Meilleur combo',g.maxc]],obj:{dist:Math.round(g.dist)}}}},
 // ---- vélo : garder la cadence dans la zone ----
 bike:{dur:40,init(g){const sh=[0,8,16][g.d],nw=[0,2,4][g.d],segs=[['Plat',60+sh,82+sh-nw,1],['Côte',68+sh,88+sh-nw,1.35],['Sprint',92+sh,112+sh-nw,1],['Côte',72+sh,90+sh-nw,1.5],['Sprint',96+sh,116+sh-nw,1.1]];return{segs,rpm:0,dist:0,inz:0,sum:0,n:0,last:-1,dur:this.dur}},
  seg(g){return g.segs[Math.min(g.segs.length-1,Math.floor(g.t/8))]},
  step(g){g.t+=W60;g.rpm=Math.max(0,g.rpm-g.rpm*.75*W60-2*W60);const s=this.seg(g),inz=g.rpm>=s[1]&&g.rpm<=s[2];if(inz){g.inz+=W60;g.score+=Math.round(60*W60*g.m*10)/10}g.sum+=g.rpm;g.n++;g.dist+=g.rpm*.33/3.6*W60*10;if(g.t>=g.dur){g.done=true;g.score=Math.round(g.score+g.dist/10)}},
  input(g,b,ev){if(ev!='down')return;const s=this.seg(g);g.rpm=Math.min(140,g.rpm+[10.5,10,9.5][g.d]/s[3]);sfx('gmPedal',.5)},
  draw(g,x,W,H){x.fillStyle='#1d2026';x.fillRect(0,0,W,H);const s=this.seg(g),gx=W/2,gy=H-26,r=Math.min(W*.36,H-40),a0=Math.PI,a1=2*Math.PI,ang=v=>a0+(a1-a0)*clamp(v/140,0,1);
   x.lineWidth=16;x.strokeStyle='#2f343c';x.beginPath();x.arc(gx,gy,r,a0,a1);x.stroke();x.strokeStyle='#2f9a5a';x.beginPath();x.arc(gx,gy,r,ang(s[1]),ang(s[2]));x.stroke();
   x.strokeStyle='#f5f5f5';x.lineWidth=4;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+Math.cos(ang(g.rpm))*(r-4),gy+Math.sin(ang(g.rpm))*(r-4));x.stroke();x.fillStyle='#f5f5f5';x.beginPath();x.arc(gx,gy,6,0,7);x.fill();
   x.textAlign='center';x.font='800 22px system-ui';x.fillStyle=g.rpm>=s[1]&&g.rpm<=s[2]?'#9be84a':'#e8edf1';x.fillText(Math.round(g.rpm)+' tr/min',gx,gy-r*.35);
   x.font='700 13px system-ui';x.fillStyle='#f5c84c';x.fillText(s[0]+' · zone '+s[1]+'–'+s[2],gx,18);x.textAlign='left';x.fillStyle='#e8edf1';x.fillText((g.dist/1000).toFixed(2)+' km',8,H-8);x.textAlign='right';x.fillText(Math.round(100*g.inz/Math.max(.1,g.t))+' % dans la zone',W-8,H-8);x.textAlign='left'},
  res(g){const zp=g.inz/g.dur;return{score:Math.round(g.score),dist:Math.round(g.dist),acc:zp,xp:{endu:(10+g.dist/300+zp*12)*g.m,forme:4*g.m},rec:{dist:Math.round(g.dist),score:Math.round(g.score)},lines:[['Distance',(g.dist/1000).toFixed(2)+' km'],['Temps dans la zone',Math.round(zp*100)+' %'],['Cadence moyenne',Math.round(g.sum/Math.max(1,g.n))+' tr/min']],obj:{velo:Math.round(g.dist)}}}},
 // ---- rameur : course de 300 m contre son fantôme ----
 row:{init(g){const best=(SP().rec.row||{}).time,gt=best||[70,60,52][g.d];return{pos:0,v:0,cur:0,dir:1,strokes:0,good:0,ghostT:gt,len:300,cool:0,sl:0,dur:180}},
  step(g){g.t+=W60;g.cur+=g.dir*W60*[1.1,1.3,1.5][g.d];if(g.cur>=1){g.cur=1;g.dir=-1}if(g.cur<=0){g.cur=0;g.dir=1}g.v=Math.max(0,g.v-g.v*.35*W60);g.pos+=g.v*W60;if(g.cool>0)g.cool-=W60;
   g.sl=g.cool>0?clamp(g.cool/.5,0,1):Math.max(0,g.sl-W60*1.5);if(g.pos>=g.len){g.done=true;g.time=g.t;g.score=Math.round(Math.max(0,(g.ghostT*1.4-g.t))*60*g.m+g.good*20)}if(g.t>180){g.done=true;g.time=g.t;g.score=Math.round(g.good*20)}},
  zone(g){return[.78-g.d*.03,1]},
  input(g,b,ev){if(ev!='down'||g.cool>0)return;const z=this.zone(g),ok=g.cur>=z[0];g.strokes++;if(ok){g.good++;g.v+=[1.9,1.75,1.65][g.d]*(g.cur>.94?1.25:1);fbAdd(g,g.cur>.94?'Parfait':'Bien',g.cur>.94?'#9be84a':'#3fc0f0');sfx('gmRow',.8)}else{g.v+=.8;fbAdd(g,'Trop tôt','#ffb36b');sfx('gmMiss',.3)}g.cool=.5;g.cur=0;g.dir=1},
  draw(g,x,W,H){x.fillStyle='#14324a';x.fillRect(0,0,W,H);for(let i=0;i<14;i++){x.fillStyle='rgba(255,255,255,.07)';x.fillRect(((i*67-g.pos*6)%W+W)%W,10+((i*29)%70),18,2)}
   const lane=(y,p,c,lab)=>{x.fillStyle='rgba(255,255,255,.1)';x.fillRect(10,y-1,W-20,2);const bx=10+(W-40)*clamp(p/g.len,0,1);x.fillStyle=c;x.beginPath();x.moveTo(bx,y-6);x.lineTo(bx+26,y);x.lineTo(bx,y+6);x.closePath();x.fill();x.fillStyle='#e8edf1';x.font='600 11px system-ui';x.fillText(lab,12,y-9)};
   lane(30,g.len*Math.min(1,g.t/g.ghostT),'rgba(200,200,255,.45)','Fantôme '+g.ghostT.toFixed(1)+' s');lane(66,g.pos,'#ff9a3a','Toi '+Math.round(g.pos)+' m');x.fillStyle='#f5f5f5';x.fillRect(W-12,14,3,64);
   const by=H-30,bw=W-40,z=this.zone(g);x.fillStyle='#2f343c';x.fillRect(20,by,bw,14);x.fillStyle='#2f9a5a';x.fillRect(20+bw*z[0],by,bw*(z[1]-z[0]),14);x.fillStyle='#9be84a';x.fillRect(20+bw*.94,by,bw*.06,14);x.fillStyle='#ffffff';x.fillRect(20+bw*g.cur-2,by-4,4,22);
   x.font='700 12px system-ui';x.fillStyle='#e8edf1';x.fillText((g.v).toFixed(1)+' m/s',20,by-8);x.textAlign='right';x.fillText(g.t.toFixed(1)+' s',W-20,by-8);x.textAlign='left'},
  res(g){const win=g.pos>=g.len&&g.time<g.ghostT;return{score:g.score,time:+g.time.toFixed(1),acc:g.strokes?g.good/g.strokes:0,xp:{endu:(10+Math.max(0,90-(g.time||90))*.2+g.good*.25)*g.m,force:3*g.m,forme:3*g.m},rec:g.pos>=g.len?{time:+g.time.toFixed(1)}:{},lines:[['Temps 300 m',g.pos>=g.len?g.time.toFixed(1)+' s':'abandon'],['Coups réussis',g.good+' / '+g.strokes],['Fantôme',win?'battu !':'pas encore']],obj:{rame:Math.round(Math.min(g.pos,g.len))}}}},
 // ---- haltères : timing ----
 lift:{init(g){const kg=[6,10,14][g.d]+2*Math.floor(SP().st.force.lv/3);return{x:0,dir:1,set:1,rep:0,reps:0,perf:0,miss:0,setMiss:0,anim:0,rest:0,kg,sets:3,per:8,dur:120}},
  zw(g){return Math.max(.05,[.17,.13,.1][g.d]*(1-.025*g.rep))},
  step(g){g.t+=W60;if(g.rest>0){g.rest-=W60;if(g.rest<=0){g.set++;g.rep=0;g.setMiss=0;sfx('gmGo',.5)}return}if(g.anim>0){g.anim-=W60;return}
   const sp=[.9,1.15,1.4][g.d]*(1+.04*g.rep);g.x+=g.dir*sp*W60;if(g.x>=1){g.x=1;g.dir=-1}if(g.x<=0){g.x=0;g.dir=1}},
  input(g,b,ev){if(ev!='down'||g.anim>0||g.rest>0||g.done)return;const d=Math.abs(g.x-.5),w=this.zw(g);
   if(d<=w){const pf=d<=w*.3;g.rep++;g.reps++;if(pf)g.perf++;g.score+=Math.round((g.kg*10+(pf?50:0))*g.m);g.anim=.7;fbAdd(g,pf?'Parfait':'Bien',pf?'#9be84a':'#3fc0f0');sfx('gmRep',.8)}
   else{g.miss++;g.setMiss++;fbAdd(g,'Raté','#ff6b6b');sfx('gmMiss',.5);g.anim=.35}
   if(g.rep>=g.per||g.setMiss>=3){if(g.set>=g.sets){g.done=true}else{g.rest=3;fbAdd(g,'Repos','#f5c84c')}}},
  draw(g,x,W,H){x.fillStyle='#1d2026';x.fillRect(0,0,W,H);const bx=20,bw=W-40,by=H/2-12,w=this.zw(g);x.fillStyle='#2f343c';x.fillRect(bx,by,bw,24);x.fillStyle='#2f9a5a';x.fillRect(bx+bw*(.5-w),by,bw*2*w,24);x.fillStyle='#9be84a';x.fillRect(bx+bw*(.5-w*.3),by,bw*.6*w,24);
   x.fillStyle=g.anim>0?'#f5c84c':'#ffffff';x.fillRect(bx+bw*g.x-3,by-8,6,40);
   x.textAlign='center';x.font='800 15px system-ui';x.fillStyle='#e8edf1';x.fillText(g.rest>0?'Repos… '+Math.ceil(g.rest)+' s':'Série '+g.set+' / '+g.sets+' · répétition '+g.rep+' / '+g.per,W/2,24);
   x.font='700 12px system-ui';x.fillStyle='#f5c84c';x.fillText(g.kg+' kg par haltère',W/2,H-12);for(let i=0;i<3;i++){x.fillStyle=i<g.setMiss?'#ff6b6b':'#3a414c';x.fillRect(W/2-24+i*18,by+34,12,6)}x.textAlign='left'},
  res(g){const acc=g.reps/Math.max(1,g.reps+g.miss);return{score:g.score,reps:g.reps,acc,xp:{force:(10+g.reps*.9+g.perf*.3)*g.m,forme:3*g.m},rec:{reps:g.reps,score:g.score},lines:[['Répétitions',g.reps+' (parfaites : '+g.perf+')'],['Charge',g.kg+' kg'],['Précision',Math.round(acc*100)+' %']],obj:{reps:g.reps}}}},
 // ---- banc : pousser en maintenant, relâcher dans la zone ----
 bench:{init(g){const kg=[20,30,40][g.d]+5*Math.floor(SP().st.force.lv/4);return{p:0,hold:false,top:0,down:0,rep:0,fail:0,kg,maxkg:0,ok:0,dur:150,reps:10}},
  zone(g){return[Math.min(.94,.82+g.rep*.012),1]},
  step(g){g.t+=W60;if(g.down>0){g.down-=W60;g.p=Math.max(0,g.p-W60*2.2);return}
   if(g.hold){const sp=[.62,.55,.48][g.d]*(1-.02*g.rep)*(1+.15*Math.sin(g.t*9));g.p=Math.min(1,g.p+sp*W60);if(g.p>=1){g.top+=W60;if(g.top>.55){g.fail++;g.hold=false;g.down=.6;g.top=0;fbAdd(g,'Bloqué','#ff6b6b');sfx('gmMiss',.5);this.end(g)}}}
   else if(g.p>0&&g.down<=0)g.p=Math.max(0,g.p-W60*1.5)},
  end(g){if(g.rep>=g.reps||g.fail>=3)g.done=true},
  input(g,b,ev){if(g.down>0||g.done)return;if(ev=='down'){g.hold=true;g.top=0;return}if(ev=='up'&&g.hold){g.hold=false;const z=this.zone(g);
   if(g.p>=z[0]&&g.top<=.55){g.rep++;g.ok++;g.maxkg=Math.max(g.maxkg,g.kg);g.score+=Math.round(g.kg*10*g.m*(g.p>.97?1.2:1));fbAdd(g,g.p>.97?'Parfait':'Validé','#9be84a');sfx('gmClank',.8);g.kg+=2.5}
   else{g.fail++;fbAdd(g,'Incomplet','#ffb36b');sfx('gmMiss',.4)}g.down=.6;g.top=0;this.end(g)}},
  draw(g,x,W,H){x.fillStyle='#1d2026';x.fillRect(0,0,W,H);const bx=W/2-18,by=16,bh=H-40,z=this.zone(g);x.fillStyle='#2f343c';x.fillRect(bx,by,36,bh);x.fillStyle='#2f9a5a';x.fillRect(bx,by+bh*(1-z[1]),36,bh*(z[1]-z[0]));
   const y=by+bh*(1-g.p);x.fillStyle=g.top>0?'#ff6b6b':'#f5f5f5';x.fillRect(bx-26,y-4,88,8);x.fillStyle='#15181d';x.fillRect(bx-34,y-12,10,24);x.fillRect(bx+60,y-12,10,24);
   x.textAlign='left';x.font='800 15px system-ui';x.fillStyle='#e8edf1';x.fillText(g.kg+' kg',12,24);x.font='700 12px system-ui';x.fillStyle='#f5c84c';x.fillText('Rép. '+g.rep+' / '+g.reps,12,44);for(let i=0;i<3;i++){x.fillStyle=i<g.fail?'#ff6b6b':'#3a414c';x.fillRect(12+i*16,54,12,6)}
   x.textAlign='right';x.fillStyle='#cfd6dc';x.font='600 11px system-ui';x.fillText(g.hold?'Pousse…':'Maintiens',W-12,24);x.fillText('relâche en haut',W-12,40);x.textAlign='left'},
  res(g){return{score:g.score,kg:g.maxkg,reps:g.ok,acc:g.ok/Math.max(1,g.ok+g.fail),xp:{force:(10+g.ok*1.5+g.maxkg*.05)*g.m,endu:3*g.m},rec:{kg:g.maxkg,score:g.score},lines:[['Répétitions validées',g.ok],['Charge maximale',g.maxkg+' kg'],['Échecs',g.fail]],obj:{reps:g.ok}}}},
 // ---- sac de frappe : séquences de réflexes ----
 box:{dur:45,init(g){return{hearts:3,seq:[],qi:0,L:2,wins:0,cue:null,gap:1,combo:0,maxc:0,hits:0,punch:0,hand:0,win:[.95,.8,.66][g.d],dur:this.dur}},
  newSeq(g){g.seq=[];for(let i=0;i<g.L;i++)g.seq.push(Math.floor(Math.random()*3));g.qi=0;g.show=1.1},
  step(g){g.t+=W60;if(g.punch>0)g.punch=Math.max(0,g.punch-W60*4);if(g.t>=g.dur||g.hearts<=0){g.done=true;return}
   if(!g.seq.length){this.newSeq(g);return}if(g.show>0){g.show-=W60;return}if(g.gap>0){g.gap-=W60;return}
   if(!g.cue){g.cue={k:g.seq[g.qi],t:0,w:Math.max(.38,g.win*(1-.03*g.wins))}}g.cue.t+=W60;if(g.cue.t>g.cue.w){this.fail(g,'Trop tard')}},
  fail(g,txt){g.hearts--;g.combo=0;g.cue=null;fbAdd(g,txt,'#ff6b6b');sfx('gmMiss',.6);g.gap=.5;this.newSeq(g)},
  input(g,b,ev){if(ev!='down'||!g.cue)return;const k={J:0,D:1,C:2}[b];if(k==null)return;g.hand=k;g.punch=1;GY.hitBag(GYM.boxBag||'sac0',k==2?1.2:1);
   if(k!==g.cue.k){this.fail(g,'Mauvais coup');return}const q=1-g.cue.t/g.cue.w;g.combo++;g.maxc=Math.max(g.maxc,g.combo);g.hits++;g.score+=Math.round((80+q*60)*Math.min(3,1+g.combo*.1)*g.m);fbAdd(g,q>.5?'Parfait':'Touché',q>.5?'#9be84a':'#3fc0f0');sfx('gmPunch',.9);
   g.cue=null;g.qi++;g.gap=.18;if(g.qi>=g.seq.length){g.wins++;if(g.wins%2==0)g.L=Math.min(6,g.L+1);g.gap=.55;fbAdd(g,'Enchaînement !','#f5c84c');this.newSeq(g)}},
  draw(g,x,W,H){x.fillStyle='#1d2026';x.fillRect(0,0,W,H);const N3=['Jab','Direct','Crochet'],C3=['#3fe0ff','#f5c84c','#ff4fa3'],cx=W/2,cy=H/2+12;
   x.fillStyle='#8b1f2a';rr(x,cx-34,cy-56,68,112,14,'#8b1f2a');x.fillStyle='#a8303a';x.fillRect(cx-30,cy-52,14,104);const tp=[[cx-44,cy-16],[cx,cy-30],[cx+44,cy-16]];
   tp.forEach((p,i)=>{x.globalAlpha=.35;x.fillStyle=C3[i];x.beginPath();x.arc(p[0],p[1],14,0,7);x.fill();x.globalAlpha=1});
   if(g.show>0){x.textAlign='center';x.font='700 12px system-ui';x.fillStyle='#e8edf1';x.fillText('Mémorise :',cx,18)}
   g.seq.forEach((k,i)=>{const sx=cx-(g.seq.length-1)*16+i*32;x.globalAlpha=i<g.qi?.3:1;x.fillStyle=C3[k];x.beginPath();x.arc(sx,34,10,0,7);x.fill();x.fillStyle='#15181d';x.font='800 10px system-ui';x.textAlign='center';x.fillText(N3[k][0],sx,38);x.globalAlpha=1});
   if(g.cue&&g.show<=0){const p=tp[g.cue.k],k=1-g.cue.t/g.cue.w;x.strokeStyle=C3[g.cue.k];x.lineWidth=4;x.beginPath();x.arc(p[0],p[1],14+34*k,0,7);x.stroke();x.fillStyle=C3[g.cue.k];x.beginPath();x.arc(p[0],p[1],14,0,7);x.fill();x.fillStyle='#15181d';x.font='800 11px system-ui';x.textAlign='center';x.fillText(N3[g.cue.k],p[0],p[1]+4)}
   x.textAlign='left';x.font='800 14px system-ui';for(let i=0;i<3;i++){x.fillStyle=i<g.hearts?'#ff4f6a':'#3a414c';x.fillText('♥',10+i*16,H-10)}x.textAlign='right';x.fillStyle='#f5c84c';x.font='700 12px system-ui';x.fillText(g.combo>1?'Combo ×'+g.combo:'',W-10,H-10);x.textAlign='left'},
  res(g){const acc=g.hits/Math.max(1,g.hits+(3-g.hearts));return{score:g.score,combo:g.maxc,acc,xp:{force:(10+Math.min(g.hits,60)*.45)*g.m,forme:(6+Math.min(g.maxc,20)*.6)*g.m},rec:{score:g.score,combo:g.maxc},lines:[['Coups placés',g.hits],['Plus long enchaînement',g.maxc],['Séquence atteinte',g.L+' coups']],obj:{coups:g.hits}}}},
 // ---- étirements : respiration guidée ----
 stretch:{init(g){return{cyc:0,ph:'wait',r:0,acc:0,n:0,cycles:6,side:0,dur:120}},
  step(g){g.t+=W60;const rate=[.36,.42,.5][g.d];if(g.ph=='in'){g.r=Math.min(1.25,g.r+rate*W60)}else if(g.ph=='out'){g.r=Math.max(0,g.r-rate*W60);if(g.r<=0){g.ph='wait'}}},
  input(g,b,ev){if(g.done)return;if(ev=='down'&&(g.ph=='wait'||g.ph=='out')){if(g.ph=='out'){const q=clamp(1-g.r/.25,0,1);g.acc+=q;g.n++;fbAdd(g,q>.75?'Parfait':q>.35?'Bien':'Trop tôt',q>.75?'#9be84a':q>.35?'#3fc0f0':'#ffb36b');if(g.cyc>=g.cycles){g.done=true;return}}g.ph='in';g.side=1-g.side;sfx('gmBreathIn',.6);return}
   if(ev=='up'&&g.ph=='in'){const q=clamp(1-Math.abs(g.r-1)/.25,0,1);g.acc+=q;g.n++;g.cyc++;g.score+=Math.round(q*150*g.m);fbAdd(g,q>.75?'Parfait':q>.35?'Bien':g.r<1?'Trop court':'Trop long',q>.75?'#9be84a':q>.35?'#3fc0f0':'#ffb36b');sfx('gmBreathOut',.6);g.ph='out'}},
  draw(g,x,W,H){x.fillStyle='#163a3a';x.fillRect(0,0,W,H);const cx=W/2,cy=H/2+4,R0=Math.min(W,H)*.38;x.strokeStyle='rgba(155,232,74,.85)';x.lineWidth=6;x.beginPath();x.arc(cx,cy,R0,0,7);x.stroke();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;x.beginPath();x.arc(cx,cy,R0*.12,0,7);x.stroke();
   x.fillStyle='rgba(63,224,255,.55)';x.beginPath();x.arc(cx,cy,Math.max(4,R0*g.r),0,7);x.fill();x.textAlign='center';x.font='800 15px system-ui';x.fillStyle='#e8edf1';x.fillText(g.ph=='in'?'Inspire…':g.ph=='out'?'Expire…':'Appuie pour inspirer',cx,22);
   x.font='700 12px system-ui';x.fillStyle='#f5c84c';x.fillText('Respiration '+Math.min(g.cycles,g.cyc+(g.ph=='in'?1:0))+' / '+g.cycles,cx,H-10);x.textAlign='left'},
  res(g){const acc=g.n?g.acc/g.n:0;return{score:g.score,acc,xp:{forme:(12+acc*14)*g.m,endu:3*g.m},rec:{acc:Math.round(acc*100)},lines:[['Précision du souffle',Math.round(acc*100)+' %'],['Respirations',g.cyc]],obj:{etir:1},joy:6}}}};
function rr(x,X,Y,w,h,r,c){x.fillStyle=c;x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h);x.fill()}
// ---------- le joueur sur la machine ----------
const PL={st:null,k:null};
const busy=()=>!!(GM&&!GM.res)||!!PL.go;
function mountStation(s,k){const f=s.f;PL.st=s;PL.k=k;s.who={me:true,sa:1};C.st='gym';C.gk=k;C.gt=1e9;C.gi=undefined;C.t=0;C.gf=f||null;C.path=null;C.x=s.pos[0]*12;C.y=88+s.pos[1]*5;C.tx=C.x;C.ty=C.y;C.d=1;
 if(s.seat){C.alpha=0}else C.alpha=null;if(k=='bike'&&!GY.isF(-1)){C.y=88+(s.pos[1]+.06)*5;C.ty=C.y}if(k=='box')GYM.boxBag=s.f.id;spKey=''}
function dismount(){const s=PL.st;if(s){if(s.who&&s.who.me)s.who=null;C.x=s.ap[0]*12;C.y=88+s.ap[1]*5}C.st='idle';C.idle=60;C.alpha=null;C.gf=null;C.gk=null;C.tx=C.x;C.ty=C.y;PL.st=null;PL.k=null;spKey=''}
GY.speed=()=>GM&&GM.k=='run'?clamp((GM.sp-4)/12,.2,1.2):1;
GY.rowSlide=()=>GM&&GM.k=='row'?GM.sl:(PL.k=='row'?0:0);
GY.press=()=>GM&&GM.k=='bench'?GM.p:0;
// image du joueur pendant l'activité (vêtements conservés : ce sont les images du jeu)
{const _sp=spUpdate;spUpdate=function(){if(isG()&&C.st=='gym'&&PL.k&&!creating&&!dressing){const k=PL.k,g=GM&&GM.k==k?GM:null;let nm='idle',fl=false;
  if(k=='run'){const sp=g?g.sp:0,per=clamp(9-sp/2,3,9);nm=g&&g.t>0?'r'+(Math.floor(C.t/per)%4):'idle'}
  else if(k=='bike'){const rpm=g?g.rpm:0,f=GY.isF(-1);if(rpm<5)nm=f?'bk0':'bk0';else{const per=clamp(8-rpm/22,2.5,8);nm=f?'bk'+(Math.floor(C.t/per)%6):'bk'+(Math.floor(C.t/per)%8)}}
  else if(k=='lift'){if(g&&g.anim>0&&g.anim<=.7&&g.rep>0){const ph=1-g.anim/.7;nm='cu'+[0,1,2,3,3,3,2,1,0][Math.min(8,Math.floor(ph*9))]}else nm=g&&g.rest>0?'idle':'cu0'}
  else if(k=='box')nm='cu3';
  else if(k=='stretch'){nm=g&&g.ph=='in'&&g.r>.2?'wave':'idle';fl=g?g.side==1:false}
  else if(k=='row'){const sl=g?g.sl:0;nm=sl>.6?'dn1':sl>.2?'dn2':'dn0'}
  else if(k=='bench'){const p=g?g.p:0;nm=p>.55?'dn2':p>.12?'dn1':'dn0'}
  else if(k=='rest'){nm=PL.rest&&PL.rest%240<150?'dn6':'dn0'}
  if(typeof SPR!='undefined'&&!SPR[nm]&&!SPR['F_'+nm])nm='idle';const L=N.look,key=nm+JSON.stringify(L);if(key!==spKey&&drawFrame(nm,L))spKey=key;spName=nm;SP.fl=fl;return}_sp()}}
// gants du joueur par-dessus le personnage
GY.overlay=function(){if(PL.k=='box'&&C.st=='gym'){const p=P3(C.x/12,(C.y-88)/5,0);GY.gloves(Math.round(p[0]),Math.round(p[1]),-1,GM&&GM.k=='box'?GM.punch:0,false,GM?GM.hand:0)}
 if(GM&&!GM.res&&GM.fb.length){}};
// ---------- interface (panneau du bas) ----------
const UI={tab:'act',sel:null,diff:1,npc:null};
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function root(){let r=document.getElementById('gmUI');if(!r){const v=document.getElementById('v-gym');if(!v)return null;r=el('div','gmUI');r.id='gmUI';v.append(r);const g=document.getElementById('gymG');if(g)g.style.display='none'}return r}
function title(t){const b=document.querySelector('#v-gym .opts button.on');if(b)b.textContent=t}
function profHTML(){const S=SP();return'<div class="gmProf">'+STATS.map(s=>{const o=S.st[s.k],p=o.lv>=LVMAX?100:Math.round(100*o.xp/need(o.lv));return'<div class="gmStat" data-k="'+s.k+'"><span class="gmI">'+s.i+'</span><b>'+s.n+'</b><em>Niv. '+o.lv+'</em><i><u style="width:'+p+'%;background:'+s.c+'"></u></i><small>'+(o.lv>=LVMAX?'max':o.xp+' / '+need(o.lv)+' XP')+'</small></div>'}).join('')+'</div>'}
function render(){const r=root();if(!r||!isG())return;if(GM&&!GM.res){return}{const vg=document.getElementById('v-gym');if(vg)vg.classList.remove('gmPlay')}if(GM&&GM.res){renderRes();return}
 if(UI.npc){renderNpc();return}if(UI.sel){renderPre();return}title('Salle de sport');
 r.innerHTML=profHTML()+'<div class="gmTabs">'+[['act','Activités'],['obj','Objectifs'],['rec','Records'],['rw','Récompenses']].map(([k,n])=>'<button data-t="'+k+'" class="'+(UI.tab==k?'act':'')+'">'+n+'</button>').join('')+'</div><div class="gmBody"></div>';
 r.querySelectorAll('.gmTabs button').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.t;sfx('rsTick');render()});const B=r.querySelector('.gmBody'),S=SP();
 if(UI.tab=='act'){const g=el('div','gmGrid');Object.keys(ACT).forEach(k=>{const a=ACT[k],rd=recDef[k],rv=rd&&S.rec[k]?S.rec[k][rd[0][0]]:null,b=el('button','gmTile z-'+a.z.slice(0,4).toLowerCase(),'<b>'+a.n+'</b><small>'+a.z+(rv!=null?' · record '+rv+' '+rd[0][2]:'')+'</small>');b.dataset.k=k;b.onclick=()=>choose(k);g.append(b)});B.append(g);
  B.append(el('p','gmHint','Énergie : '+Math.round(N.energy)+' % · Séances : '+(S.tot.seances||0)+' · Série : '+(S.streak||0)+' jour'+((S.streak||0)>1?'s':'')+'<br>Avantages : séances '+Math.round((1-ADV.eco())*100)+' % moins fatigantes · +'+Math.round((ADV.joie()-1)*100)+' % de bonheur'+(ADV.bonus()?' · +'+ADV.bonus()+' pièce par séance':'')))}
 if(UI.tab=='obj'){const O=objCur();[['d','Aujourd’hui'],['w','Cette semaine']].forEach(([p,t])=>{B.append(el('h4','gmH',t));O[p].list.forEach(id=>{const d=objDef(id),n=objCount(p,id),done=O[p].done[id];B.append(el('div','gmObj'+(done?' ok':''),'<b>'+(done?'✓ ':'')+d.t+'</b><i><u style="width:'+Math.round(100*n/d.n)+'%"></u></i><small>'+(d.c=='dist'||d.c=='velo'||d.c=='rame'?(n/1000).toFixed(2)+' / '+(d.n/1000).toFixed(2)+' km':n+' / '+d.n)+' · récompense '+d.r.c+' pièces</small>'))})})}
 if(UI.tab=='rec'){const L=[];Object.keys(recDef).forEach(k=>recDef[k].forEach(([f,t,u,dir])=>{const v=S.rec[k]&&S.rec[k][f];L.push('<div class="gmRec"><span>'+t+'</span><b>'+(v!=null?v+' '+u:'—')+'</b></div>')}));
  B.append(el('div','gmRecs',L.join('')));B.append(el('h4','gmH','Défis gagnés'));B.append(el('div','gmRecs',GY.NPCS.map(n=>'<div class="gmRec"><span>'+n.nom+' · '+n.role+'</span><b>'+(S.defis[n.nom]||0)+'</b></div>').join('')));
  B.append(el('p','gmHint','Totaux : '+(S.tot.acts||0)+' entraînements · '+((S.tot.dist||0)/1000).toFixed(1)+' km courus · '+((S.tot.velo||0)/1000).toFixed(1)+' km pédalés · '+(S.tot.reps||0)+' répétitions · '+(S.tot.coups||0)+' coups'))}
 if(UI.tab=='rw'){const L=UNL.map(u=>{const ok=S.unl.includes(u.id);return'<div class="gmRw'+(ok?' ok':'')+'"><b>'+(ok?'✓ ':'🔒 ')+u.t+'</b><small>'+(ok?(u.k=='ward'?'Dans ta garde-robe':'Livré à la maison'):reqTxt(u.req))+'</small></div>'});B.append(el('div','gmRws',L.join('')))}}
// choix d'une activité : description, difficulté, départ
function choose(k){if(busy())return;UI.sel=k;UI.diff=Math.min(UI.diff,1);sfx('rsTick');render()}
function renderPre(){const r=root(),k=UI.sel,a=ACT[k],S=SP();title(a.n);const main=a.main?S.st[a.main].lv:1,df=UI.defi;
 r.innerHTML='<div class="gmPre"><h3>'+a.n+(df?' · Défi':'')+'</h3><p>'+(df?df.txt:a.desc)+'</p>'+(k=='rest'?'':'<div class="gmDiff">'+DIFF.map((d,i)=>{const lock=d.req&&main<d.req;return'<button data-i="'+i+'" class="'+(UI.diff==i?'act':'')+'"'+(lock||df?' disabled':'')+'>'+d.n+(lock?'<small>niv. '+d.req+'</small>':'<small>XP ×'+d.m+'</small>')+'</button>'}).join('')+'</div>')+
  '<p class="gmHint">Commandes : '+(a.ctl||'—')+(k!='rest'?' · Énergie '+Math.round(N.energy)+' %':'')+'</p><div class="gmBtns"><button class="gmGo">'+(k=='rest'?'S’asseoir':'Commencer')+'</button><button class="gmBack">Retour</button></div></div>';
 r.querySelectorAll('.gmDiff button').forEach(b=>b.onclick=()=>{UI.diff=+b.dataset.i;sfx('rsTick');renderPre()});r.querySelector('.gmBack').onclick=()=>{UI.sel=null;UI.defi=null;render()};r.querySelector('.gmGo').onclick=()=>start(k,df?df.d:UI.diff)}
// aller au poste puis lancer
function start(k,d){if(busy())return;if(k!='rest'&&N.energy<12){say(NAME()+' est épuisé'+(N.look.g=='f'?'e':'')+' : repose-toi sur le banc ou prends un smoothie au bar.');return}
 let st=GY.free(k);if(k=='lift'&&!st.length)st=GY.free('lift');
 // un sportif occupe toutes les machines : il te laisse la place
 if(!st.length){const s=GY.ST.find(o=>o.k==k&&o.who&&!o.who.me);if(s){const n=s.who;GY.S.npc.forEach(m=>{if(m===n){s.who=null;m.st='idle';m.t2=60;m.s=null;m.gl=0;m.u=s.ap[0];m.v=s.ap[1]}});say(GY.NPCS[n.i].nom+' : « Vas-y, je te laisse la place ! »');st=[s]}}
 if(!st.length){say('Toutes les places sont prises, réessaie dans un instant.');return}
 const s=st.sort((a,b)=>Math.hypot(a.ap[0]-C.x/12,a.ap[1]-(C.y-88)/5)-Math.hypot(b.ap[0]-C.x/12,b.ap[1]-(C.y-88)/5))[0];s.res={me:true};PL.go=true;UI.sel=null;
 const run=()=>{PL.go=false;s.res=null;if(s.who&&!s.who.me){say('Quelqu’un vient de prendre la place.');render();return}mountStation(s,k);
  if(k=='rest'){PL.rest=1;GM=null;title('Repos');renderRest();return}GM=mk(k,d,UI.defi||null);UI.defi=null;GM.count=2.2;sfx('gmCount',.7);renderGame()};
 if(Math.hypot(C.x/12-s.ap[0],(C.y-88)/5-s.ap[1])<.2){run();return}title('En route…');goto(s.ap[0]*12,88+s.ap[1]*5,run);const r=root();if(r)r.innerHTML='<p class="gmHint">'+NAME()+' va au poste : '+ACT[k].n.toLowerCase()+'…</p>'}
// écran de jeu
function renderGame(){const r=root(),g=GM;title(g.a.n);r.scrollTop=0;const vg=document.getElementById('v-gym');if(vg){vg.scrollTop=0;vg.classList.add('gmPlay')}const ctl={run:[['L','Gauche'],['R','Droite']],bike:[['P','Pédaler']],row:[['T','Tirer']],lift:[['S','Soulever']],bench:[['H','Pousser']],box:[['J','Jab'],['D','Direct'],['C','Crochet']],stretch:[['B','Respirer']]}[g.k];
 r.innerHTML='<div class="gmGame"><div class="gmTop"><span class="gmSc">0</span><span class="gmTm"></span><button class="gmStop">Arrêter</button></div><div class="gmCvW"><canvas id="gmCv"></canvas><div class="gmCount"></div></div><p class="gmInst">'+g.a.desc+'</p><div class="gmCtl n'+ctl.length+'">'+ctl.map(([b,t])=>'<button data-b="'+b+'">'+t+'</button>').join('')+'</div></div>';
 r.querySelector('.gmStop').onclick=()=>stop(true);r.querySelectorAll('.gmCtl button').forEach(b=>{const id=b.dataset.b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');inp(id,'down')});
  const up=e=>{if(!b.classList.contains('on'))return;b.classList.remove('on');inp(id,'up')};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
 fitGame();setTimeout(fitGame,60);
 const cv=r.querySelector('#gmCv');cv.addEventListener('pointerdown',e=>{e.preventDefault();if(ctl.length==1){inp(ctl[0][0],'down');const u=()=>{inp(ctl[0][0],'up');removeEventListener('pointerup',u)};addEventListener('pointerup',u)}})}
// le jeu tient toujours dans l'écran : la zone de jeu prend la hauteur restante (portrait, paysage, ordinateur)
function fitGame(){const r=document.getElementById('gmUI'),cv=document.getElementById('gmCv');if(!r||!cv)return;const ins=r.querySelector('.gmInst'),gm=r.querySelector('.gmGame');if(ins)ins.style.display='';
 const avail=innerHeight-r.getBoundingClientRect().top-6,fit=()=>{cv.style.height='240px';const over=gm.getBoundingClientRect().height+12-avail;return 240-over};let h=fit();
 if(h<120&&ins){ins.style.display='none';h=fit()}cv.style.height=Math.round(Math.max(64,Math.min(240,h)))+'px'}
addEventListener('resize',()=>{if(GM&&!GM.res)setTimeout(fitGame,50)});
function inp(b,ev){const g=GM;if(!g||g.res||g.done)return;if(g.count>0)return;const H={L:'L',R:'R',P:'P',T:'T',S:'S',H:'H',J:'J',D:'D',C:'C',B:'B'}[b];GAMES[g.k].input(g,H,ev)}
addEventListener('keydown',e=>{if(!isG()||!GM||GM.res||e.repeat)return;const k=e.key,g=GM,m={run:{ArrowLeft:'L',ArrowRight:'R',f:'L',j:'R'},bike:{' ':'P',ArrowUp:'P'},row:{' ':'T'},lift:{' ':'S'},bench:{' ':'H'},box:{ArrowLeft:'J',ArrowUp:'D',ArrowRight:'C',a:'J',z:'D',e:'C'},stretch:{' ':'B'}}[g.k];if(m&&m[k]){e.preventDefault();inp(m[k],'down')}else if(k=='Escape')stop(true)});
addEventListener('keyup',e=>{if(!isG()||!GM||GM.res)return;const g=GM,m={bench:{' ':'H'},stretch:{' ':'B'}}[g.k];if(m&&m[e.key])inp(m[e.key],'up')});
function drawGame(){const g=GM;if(!g||g.res)return;const cv=document.getElementById('gmCv');if(!cv)return;const W=cv.clientWidth,H=cv.clientHeight,dpr=Math.min(2,devicePixelRatio||1);if(!W||!H)return;if(cv.width!=Math.round(W*dpr)||cv.height!=Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);GAMES[g.k].draw(g,x,W,H);
 g.fb.forEach((f,i)=>{x.globalAlpha=Math.max(0,1-f.t/.8);x.fillStyle=f.col;x.font='800 16px system-ui';x.textAlign='center';x.fillText(f.txt,W/2,H*.45-f.t*30);x.globalAlpha=1});x.textAlign='left';
 const sc=document.querySelector('.gmSc'),tm=document.querySelector('.gmTm'),ct=document.querySelector('.gmCount');if(sc)sc.textContent=g.score+' pts';
 if(tm){const d=GAMES[g.k].dur;tm.textContent=g.k=='row'?Math.round(Math.min(g.pos,g.len))+' / '+g.len+' m':d?Math.max(0,Math.ceil(d-g.t))+' s':g.k=='lift'?'Série '+g.set+'/3':g.k=='bench'?g.rep+'/10':g.cyc+'/6'}
 if(ct){ct.textContent=g.count>0?(g.count>1.6?'Prêt ?':g.count>.8?'2':'1'):'';ct.style.display=g.count>0?'flex':'none'}}
// boucle : logique à 60 images/s (avec le jeu), dessin du panneau à chaque image
GY.tick=function(){const g=GM;if(PL.k=='rest'&&C.st=='gym'){PL.rest++;if(PL.rest%60==0)add('energy',1.2*ADV.joie());if(PL.rest>=420)endRest()}
 if(!g||g.res)return;if(g.count>0){g.count-=W60;if(g.count<=0)sfx('gmGo');return}g.fb.forEach(f=>f.t+=W60);g.fb=g.fb.filter(f=>f.t<.8);GAMES[g.k].step(g);if(g.t>0&&Math.floor(g.t*60)%60==0)add('energy',-.25*ADV.eco());if(g.done)finish()};
{const _dw=drawWorld;drawWorld=function(){_dw();if(isG())try{drawGame()}catch(e){console.error(e)}}}
// fin de partie : score, expérience, caractéristiques, récompenses, records
function finish(){const g=GM,R0=GAMES[g.k].res(g),S=SP(),k=g.k;g.res=R0;R0.xpGot={};R0.ups={};R0.newRec=[];R0.firstRec=[];GY.lastRw=[];GY.lastUnl=[];NEWLY.length=0;
 // régularité et variété : la forme physique progresse avec les visites et les disciplines différentes
 const today=dayId();if(S.last!=today){const y=new Date();y.setDate(y.getDate()-1);const yid=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();S.streak=S.last==yid?(S.streak||0)+1:1;S.last=today;R0.xp.forme=(R0.xp.forme||0)+5*Math.min(5,S.streak)}
 if(!GY.visit.kinds.includes(k)){R0.xp.forme=(R0.xp.forme||0)+(GY.visit.kinds.length?6:0)}
 for(const s in R0.xp){const r=gainXP(s,R0.xp[s]);if(r.x){R0.xpGot[s]=r.x;if(r.ups.length)R0.ups[s]=r.ups[r.ups.length-1]}}
 // records personnels
 const rd=recDef[k]||[];S.rec[k]=S.rec[k]||{};for(const[f,t,u,dir]of rd){const v=R0.rec[f];if(v==null||!(v>0))continue;const old=S.rec[k][f];if(old==null||(dir>0?v>old:v<old)){if(old!=null){R0.newRec.push(t);objAdd('d','rec',1)}else R0.firstRec.push(t);S.rec[k][f]=v}}
 // compteurs, objectifs, séances
 S.tot.acts=(S.tot.acts||0)+1;S.tot.temps=(S.tot.temps||0)+Math.round(g.t);const ob=R0.obj||{};if(ob.dist)S.tot.dist=(S.tot.dist||0)+ob.dist;if(ob.velo)S.tot.velo=(S.tot.velo||0)+ob.velo;if(ob.reps)S.tot.reps=(S.tot.reps||0)+ob.reps;if(ob.coups)S.tot.coups=(S.tot.coups||0)+ob.coups;
 objAdd('d','acts',1);objAdd('w','acts',1);for(const c in ob)objAdd('d',c,ob[c]);
 const O=objCur();if(!O.w.disc.includes(k)){O.w.disc.push(k);objAdd('w','disc',1)}
 if(!GY.visit.kinds.length){S.tot.seances=(S.tot.seances||0)+1;objAdd('w','sess',1)}if(!GY.visit.kinds.includes(k))GY.visit.kinds.push(k);
 const V=GY.visit.kinds;if(!GY.visit.full&&V.some(x=>CARDIO.includes(x))&&V.some(x=>FORCE.includes(x))&&V.includes('stretch')){GY.visit.full=1;objAdd('w','full',1)}
 // défi
 if(g.defi){const df=g.defi,ok=df.ok(R0);R0.defi={ok,nom:df.nom,txt:df.goal};if(ok){S.defis[df.nom]=(S.defis[df.nom]||0)+1;S.tot.defis=(S.tot.defis||0)+1;reward({c:15+5*df.lv,xp:{forme:20}},'Défi gagné contre '+df.nom);objAdd('w','defi',1)}}
 // pièces (modestes) et effets sur les besoins
 const coins=Math.max(1,Math.min(6,1+Math.round((R0.acc||0)*3)+g.d))+ADV.bonus();earn(coins);R0.coins=coins;add('happy',(4+(R0.joy||0))*ADV.joie());add('hunger',-3);N.washAt=Math.min(Date.now(),(N.washAt||Date.now()))-3*36e5;N.gym=(N.gym||0)+1;
 R0.unl=checkUnl();R0.rw=GY.lastRw.slice();R0.objs=NEWLY.slice();S.hist.unshift({t:Date.now(),k,score:R0.score});if(S.hist.length>30)S.hist.length=30;
 try{bars()}catch(e){}save();sfx(R0.newRec.length?'gmRecord':'gmEnd');renderRes()}
function renderRes(){const r=root(),g=GM,R0=g.res;{const vg=document.getElementById('v-gym');if(vg)vg.classList.remove('gmPlay')}title('Résultats');const ups=Object.keys(R0.ups);
 r.innerHTML='<div class="gmRes"><h3>'+g.a.n+'</h3><div class="gmBig">'+R0.score+'<small>points</small></div>'+(R0.newRec.length?'<div class="gmBadge">🏆 Nouveau record : '+R0.newRec.join(' · ')+'</div>':'')+(R0.firstRec.length&&!R0.newRec.length?'<div class="gmBadge">📋 Premier record établi : '+R0.firstRec.join(' · ')+'</div>':'')+
  (R0.defi?'<div class="gmBadge '+(R0.defi.ok?'':'ko')+'">'+(R0.defi.ok?'Défi réussi contre '+R0.defi.nom+' !':'Défi perdu contre '+R0.defi.nom+' : '+R0.defi.txt)+'</div>':'')+
  '<div class="gmLines">'+R0.lines.map(([a,b])=>'<div><span>'+a+'</span><b>'+b+'</b></div>').join('')+'</div>'+
  '<div class="gmXP">'+STATS.filter(s=>R0.xpGot[s.k]).map(s=>{const o=SP().st[s.k];return'<div><span>'+s.i+' '+s.n+'</span><b>+'+R0.xpGot[s.k]+' XP</b>'+(R0.ups[s.k]?'<em>Niveau '+R0.ups[s.k]+' !</em>':'')+'<i><u style="width:'+Math.round(100*o.xp/need(o.lv))+'%;background:'+s.c+'"></u></i></div>'}).join('')+'</div>'+
  '<div class="gmRw2">+'+R0.coins+' pièces'+(R0.rw.length?' · '+R0.rw.map(x=>x.why+(x.r.c?' (+'+x.r.c+')':'')).join(' · '):'')+'</div>'+(R0.unl.length?'<div class="gmBadge">Débloqué : '+R0.unl.map(u=>u.t).join(', ')+'</div>':'')+
  '<div class="gmBtns"><button class="gmGo">Rejouer</button><button class="gmBack">Terminer</button></div></div>';
 r.querySelector('.gmGo').onclick=()=>{const k=g.k,d=g.d;GM=null;if(N.energy<12){dismount();say(NAME()+' est épuisé'+(N.look.g=='f'?'e':'')+' : une pause s’impose !');render();return}GM=mk(k,d,null);GM.count=2.2;sfx('gmCount',.7);renderGame()};
 r.querySelector('.gmBack').onclick=()=>{GM=null;dismount();say(R0.newRec.length?'Bravo, nouveau record !':ups.length?'Ça progresse !':'Bonne séance !');render()};if(ups.length)sfx('gmLevel')}
function stop(ask){const g=GM;if(!g)return;if(g.res){GM=null;dismount();render();return}GM=null;dismount();say('Activité arrêtée. Reviens quand tu veux !');render()}
function renderRest(){const r=root();r.innerHTML='<div class="gmPre"><h3>Repos</h3><p>'+NAME()+' souffle un peu et boit de l’eau. L’énergie remonte doucement.</p><div class="gmBtns"><button class="gmBack">Se lever</button></div></div>';r.querySelector('.gmBack').onclick=endRest}
function endRest(){if(PL.k!='rest')return;PL.rest=0;dismount();say(NAME()+' est reposé'+(N.look.g=='f'?'e':'')+'.');save();render()}
// ---------- sportifs : discuter, conseil, défi ----------
const TALK={Léa:['Je prépare un 10 km, le tapis c’est mon meilleur ami.','Le secret, c’est la régularité : un peu chaque jour.','Garde un rythme régulier, gauche, droite, sans forcer.'],
 Malik:['Les poings en garde, toujours !','Un bon boxeur respire en frappant.','La vitesse vient de la précision, pas de la force.'],
 Inès:['Sur le vélo, les côtes demandent moins de vitesse mais plus d’effort.','Je fais 40 km le week-end, en vrai !','Reste dans la zone verte, c’est là que tu progresses.'],
 Hugo:['Plus lourd, mais propre : c’est la règle.','Trois séries de huit, le grand classique.','N’oublie pas de t’étirer après la muscu.'],
 Zoé:['Inspire… expire… tout va bien.','Les étirements améliorent ta forme physique.','Un peu de souplesse, beaucoup de bien-être.'],
 Sam:['Bienvenue ! Les objectifs du jour sont dans l’onglet Objectifs.','Chaque discipline fait progresser une caractéristique différente.','Varie les activités : ta forme physique te dira merci.']};
const TIPS=['Le tapis et le vélo développent l’endurance ; les haltères, le banc et le sac, la force.','La forme physique progresse avec la régularité : reviens d’un jour à l’autre.','Une séance complète, c’est cardio + muscu + étirements dans la même visite.','Le mode Intense rapporte plus d’expérience, mais il se mérite (niveau 4).','Fatigué ? Assieds-toi sur le banc ou prends un smoothie au bar.','Les objectifs se renouvellent chaque jour et chaque semaine : jette un œil !','Battre un record personnel compte pour tes objectifs du jour.'];
function defiOf(d){const S=SP(),lv=S.defis[d.nom]||0,k=d.defi;const T={run:{goal:'parcourir '+((900+250*lv)/1000).toFixed(2)+' km',ok:r=>r.dist>=900+250*lv},bike:{goal:'pédaler '+((2000+500*lv)/1000).toFixed(1)+' km',ok:r=>r.dist>=2000+500*lv},
 box:{goal:'marquer '+(2500+1200*lv)+' points',ok:r=>r.score>=2500+1200*lv},lift:{goal:'réussir '+Math.min(24,14+3*lv)+' répétitions',ok:r=>r.reps>=Math.min(24,14+3*lv)},stretch:{goal:'atteindre '+Math.min(95,70+5*lv)+' % de précision',ok:r=>Math.round(r.acc*100)>=Math.min(95,70+5*lv)},bench:{goal:'soulever '+(30+5*lv)+' kg',ok:r=>r.kg>=30+5*lv}}[k];
 return{k,nom:d.nom,lv,goal:T.goal,ok:T.ok,d:lv>=3?2:1,txt:d.nom+' te lance un défi ('+ACT[k].n.toLowerCase()+') : '+T.goal+'. Victoire : '+(15+5*lv)+' pièces.'}}
function talk(d,n){if(busy())return;UI.npc={d,n,line:'Salut ! Je suis '+d.nom+' ('+d.role.toLowerCase()+').'};if(n&&n.coach)GY.S.coach.wave=90;else if(n){n.bub='chat';n.bt=90}sfx('rsTick');render()}
function renderNpc(){const r=root(),o=UI.npc,d=o.d,df=defiOf(d);title(d.nom);r.innerHTML='<div class="gmPre gmNpc"><h3>'+d.nom+' <small>'+d.role+'</small></h3><p class="gmSay">'+o.line+'</p><div class="gmBtns g3"><button data-a="t">Discuter</button><button data-a="c">Demander un conseil</button><button data-a="d">Défi</button>'+(d.coach?'<button data-a="r">Records</button><button data-a="o">Objectifs</button>':'')+'<button data-a="x">Fermer</button></div></div>';
 r.querySelectorAll('button[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;sfx('rsTick');if(a=='t')o.line=pick(TALK[d.nom]);if(a=='c')o.line='Conseil : '+pick(TIPS);if(a=='d'){UI.npc=null;UI.sel=df.k;UI.defi=df;render();return}if(a=='r'||a=='o'){UI.npc=null;UI.tab=a=='r'?'rec':'obj';render();return}if(a=='x'){UI.npc=null;render();return}renderNpc()})}
const pick=a=>a[Math.floor(Math.random()*a.length)];
// ---------- objets touchés dans la salle ----------
GY.tapFurn=function(f){const n=f.n;const map={GTapis:'run',GVelo:'bike',GRower:'row',GRack:'lift',GBench:'bench',GCable:'lift',GSac:'box',GRoll:'stretch',GBall:'stretch',GBancR:'rest'};
 if(map[n]){choose(map[n]);return true}
 if(n=='GBoard'){UI.tab='rec';UI.sel=null;UI.npc=null;render();say('Le tableau des records de la salle.');return true}
 if(n=='GDesk'){talk(GY.NPCS[5],{coach:1});return true}
 if(n=='GBar'){smoothie();return true}
 if(n=='Fontaine'){goto(1.6*12,88+5*5,()=>{C.st='cafe';C.ct=0;C.cafe=null;add('happy',2);add('energy',2);say(NAME()+' boit un grand verre d’eau fraîche.');setTimeout(()=>{if(C.st=='cafe'){C.st='idle'}},1500)});return true}
 if(n=='GLock'){const w=SP().unl.filter(id=>(UNL.find(u=>u.id==id)||{}).k=='ward').map(id=>UNL.find(u=>u.id==id).t.toLowerCase());say(w.length?'Ton casier : '+w.join(', ')+'. Ces tenues t’attendent dans ta garde-robe, à la maison.':'Ton casier est vide : gagne des niveaux pour débloquer des tenues de sport.');return true}
 if(n=='GPlates'||n=='GBoxRack'){say(n=='GPlates'?'Barres et disques de 5 à 25 kg.':'Gants, casques et cordes à sauter.');return true}return false};
function smoothie(){const r=root();if(!r||busy())return;title('Bar à smoothies');const M=[['Smoothie vert','épinards, pomme, kiwi',4,{energy:10,hunger:6}],['Smoothie fruits rouges','fraise, framboise, banane',5,{energy:12,hunger:8,happy:4}],['Protéiné','banane, lait, avoine',6,{energy:14,hunger:12}]];
 r.innerHTML='<div class="gmPre"><h3>Bar à smoothies</h3><div class="gmGrid">'+M.map((m,i)=>'<button class="gmTile" data-i="'+i+'"'+(N.coins<m[2]?' disabled':'')+'><b>'+m[0]+'</b><small>'+m[1]+' · '+m[2]+' pièces</small></button>').join('')+'</div><div class="gmBtns"><button class="gmBack">Retour</button></div></div>';
 r.querySelectorAll('.gmTile').forEach(b=>b.onclick=()=>{const m=M[+b.dataset.i];if(N.coins<m[2])return;earn(-m[2]);for(const k in m[3])add(k,m[3][k]);try{bars()}catch(e){}sfx('rsPay',.6);say(NAME()+' savoure un '+m[0].toLowerCase()+' : énergie en hausse !');save();render()});r.querySelector('.gmBack').onclick=render}
GY.busy=busy;GY.tapBusy=()=>{if(GM&&!GM.res)return;if(PL.go)return};GY.talk=talk;
GY.leave=function(){if(GM&&!GM.res){stop()}if(PL.k)dismount();goHome()};
{const _gh=goHome;goHome=function(dst){if(isG()&&(PL.k||GM)){GM=null;if(PL.k)dismount();PL.go=false;render()}return _gh(dst)}}
GY.onEnter=function(){const hb=document.getElementById('gymHome');if(hb&&!hb.__gm){hb.__gm=1;hb.addEventListener('click',()=>{if(isG()&&(PL.k||GM)){GM=null;if(PL.k)dismount();PL.go=false;render()}},true)}GY.visit={kinds:[],full:0};GM=null;PL.st=null;PL.k=null;PL.go=false;UI.sel=null;UI.npc=null;UI.defi=null;SP();objCur();setTimeout(()=>{render()},0)};
GY.onLeave=function(){{const vg=document.getElementById('v-gym');if(vg)vg.classList.remove('gmPlay')}GM=null;if(PL.k){C.alpha=null;C.gf=null}PL.st=null;PL.k=null;PL.go=false;const r=document.getElementById('gmUI');if(r)r.innerHTML=''};
// ancien panneau : remplacé par la nouvelle interface
try{gymDraw=function(){if(isG())render()}}catch(e){}
{const _sh=show;show=function(v){_sh(v);if(v=='gym')setTimeout(render,0)}}
{const _ar=arrive;arrive=function(d){_ar(d);if(d=='gym'){const fa=C.after;C.after=()=>{if(fa)fa();say('Bienvenue à la salle ! Touche une machine ou choisis une activité en bas. Sam, le coach, est à l’accueil.');render()}}}}
try{LINES.gym=['Allez, on se dépasse !','Une séance de plus, une marche de plus.','Mes records n’ont qu’à bien se tenir !','Ça fait du bien de bouger.']}catch(e){}
try{if(typeof GOALS!='undefined'&&!GOALS.some(g=>g.id=='sport3'))GOALS.push({id:'sport3',t:'Atteindre le niveau 3 en endurance',r:15,ok:()=>((N.sport&&N.sport.st.endu.lv)||0)>=3})}catch(e){}
Object.assign(GY,{ACT,GAMES,DIFF,STATS,UNL,OD,OW,SP,need,gainXP,objCur,objAdd,objCount,checkUnl,render,start,stop,finish,defiOf,mk,PL,ADV,inp,choose,dismount,smoothie,UI});Object.defineProperty(GY,'GM',{get(){return GM},set(v){GM=v},configurable:true})})();
