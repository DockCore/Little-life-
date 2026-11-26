// ===== LE CAFÉ : fenêtres (carte, habitants, jeux, journal, téléphone) =====
// Plein écran par-dessus la scène, sans jamais la déplacer ; boutons tactiles larges ; tout est enregistré dans N.cafe2.
(function(){
const K=()=>window.CAFE,S0=()=>window.SOCIAL;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sfx=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.05)}catch(e){}};
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const coin=p=>'<span class="rsCoin"></span>'+p;
const fem=()=>N.look&&N.look.g=='f';
let OV=null,CUR=null;
function over(){if(OV)return OV;OV=el('div','rsOver cfOver');OV.id='cfOver';OV.hidden=true;OV.innerHTML='<div class="rsCard cfCard" role="dialog" aria-modal="true"></div>';OV.addEventListener('pointerdown',e=>{if(e.target===OV)close()});document.body.appendChild(OV);return OV}
function card(){return over().querySelector('.cfCard')}
function open(k,html){CUR=k;const o=over(),c=card();c.className='rsCard cfCard cf-'+k;c.innerHTML=html;o.hidden=false;requestAnimationFrame(()=>o.classList.add('on'));sfx('rsPage');return c}
function close(){if(!OV||OV.hidden)return;const k=CUR;OV.classList.remove('on');setTimeout(()=>{if(!OV.classList.contains('on'))OV.hidden=true},200);CUR=null;
 if(k=='game'||k=='journal'||k=='phone'){try{K().stopAct()}catch(e){}}try{K().cfUI(true)}catch(e){}}
const isOpen=()=>!!OV&&!OV.hidden;
const head=(t,s)=>'<div class="rsHead cfHead"><div><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</div><button class="rsX" aria-label="Fermer">✕</button></div>';
function wire(c){const x=c.querySelector('.rsX');if(x)x.onclick=close}
// ---------- petites illustrations de la carte ----------
function icon(m,sz){const c=document.createElement('canvas');c.width=c.height=sz||64;const g=c.getContext('2d'),s=c.width/64;g.save();g.scale(s,s);
 const E=(x,y,a,b,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,a,b,0,0,7);g.fill()},R=(x,y,w,h,col,r)=>{g.fillStyle=col;g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r||0);else g.rect(x,y,w,h);g.fill()};
 E(32,54,24,5,'rgba(60,30,20,.15)');
 if(m.u=='cup'){E(32,50,22,5,'#e0d6c4');E(32,48,20,4.5,'#ffffff');R(18,26,28,22,'#ffffff',6);R(44,32,8,10,'#ffffff',5);R(47,35,3,4,'#e0d6c4');E(32,27,14,4,m.k=='cappuccino'?'#f4e6cc':'#6a3a20');if(m.k=='cappuccino'){E(32,27,5,1.6,'#c89a6a')}else E(30,26,6,1.4,'#b88050')}
 else if(m.u=='mug'){R(18,22,26,28,m.k=='the'?'#c85a3a':'#2f6f68',5);R(42,28,9,12,m.k=='the'?'#c85a3a':'#2f6f68',5);R(45,31,4,6,'#fbf5e8',2);E(31,23,12,3.5,m.k=='the'?'#b86a2a':'#6a3a22');if(m.k=='chocolat'){E(31,20,10,5,'#fffaf0');E(34,17,5,3,'#fffaf0')}if(m.k=='the'){R(40,10,2,14,'#e8d0a0');R(37,8,8,5,'#f5f0e0')}}
 else if(m.u=='glass'){R(22,16,20,34,'rgba(200,230,240,.9)',3);R(24,22,16,26,'#f5a020',2);R(26,24,3,20,'rgba(255,255,255,.45)');E(40,16,7,7,'#ffb84a');E(40,16,4.5,4.5,'#ffd27a');R(34,6,3,16,'#e84a4a')}
 else{E(32,48,24,6,'#d8d0c4');E(32,46,23,5.5,'#ffffff');
  if(m.k=='croissant'){g.fillStyle='#c8803a';g.beginPath();g.moveTo(10,42);g.quadraticCurveTo(32,14,54,42);g.quadraticCurveTo(32,36,10,42);g.fill();g.fillStyle='#e8b060';for(let i=0;i<4;i++){g.beginPath();g.ellipse(18+i*9,34-(i==1||i==2?5:0),5,8,(i-1.5)*.5,0,7);g.fill()}}
  else if(m.k=='cookie'){E(32,38,18,13,'#a8642a');E(32,36,17,12,'#d08a48');[[25,32],[36,30],[30,40],[40,38],[22,38]].forEach(([x,y])=>E(x,y,2.6,2,'#3a1a10'))}
  else{g.fillStyle='#3a1a10';g.beginPath();g.moveTo(14,44);g.lineTo(46,44);g.lineTo(42,22);g.lineTo(14,30);g.closePath();g.fill();g.fillStyle='#6a3a22';g.fillRect(14,33,30,4);g.fillStyle='#fffaf0';E(36,20,8,5,'#fffaf0');E(36,15,3,3,'#e0304a')}}
 g.restore();return c}
// ---------- la carte ----------
let cart=[],gift=false,tab='b';
function menu(cat){const C0=K();if(!C0)return;if(cat)tab=cat;cart=[];gift=false;renderMenu()}
function renderMenu(){const C0=K(),f=C0.R.friend,fn=f?S0().HB(f.hab).nom:'',seated=C.st=='csit';
 const c=open('menu',head('Café du coin','La carte · '+(seated?'service à table':'au comptoir'))+
  '<div class="rsTabs"><button data-t="b"'+(tab=='b'?' class="act"':'')+'>Boissons</button><button data-t="f"'+(tab=='f'?' class="act"':'')+'>Gourmandises</button></div>'+
  '<div class="rsList cfList"></div><div class="cfFoot"><div class="cfCart"></div>'+(f?'<label class="cfGift"><input type="checkbox"'+(gift?' checked':'')+'> Offrir la même chose à '+fn+'</label>':'')+'<button class="cfGo"></button></div>');wire(c);
 c.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;sfx('rsTick');renderMenu()});
 const L=c.querySelector('.cfList');C0.CM.filter(m=>m.c==tab).forEach(m=>{const n=cart.filter(x=>x===m).length,b=el('button','cfItem'+(n?' sel':''));b.append(icon(m,64));
  b.append(el('span','cfTxt','<b>'+m.n+'</b><small>'+m.d+'</small><em>'+m.fx+'</em>'));b.append(el('span','cfPr',coin(m.p)+(n?'<i>×'+n+'</i>':'')));
  b.onclick=()=>{if(cart.length>=3){cart.splice(cart.indexOf(m)>=0?cart.lastIndexOf(m):0,1)}else cart.push(m);sfx('rsTick');renderMenu()};L.append(b)});
 const g=c.querySelector('.cfGift input');if(g)g.onchange=()=>{gift=g.checked;renderMenu()};
 const tot=cart.reduce((a,m)=>a+m.p,0)*(gift?2:1),ok=cart.length&&(N.coins||0)>=tot;
 c.querySelector('.cfCart').innerHTML=cart.length?cart.map(m=>m.n).join(' · ')+(gift?' <small>(+ '+fn+')</small>':''):'Touche une boisson ou une gourmandise (3 au plus).';
 const go=c.querySelector('.cfGo');go.innerHTML=cart.length?'Commander · '+coin(tot):'Choisis d’abord';go.disabled=!ok;if(cart.length&&!ok)go.innerHTML='Il manque '+(tot-(N.coins|0))+' pièce'+(tot-(N.coins|0)>1?'s':'');
 go.onclick=()=>{if(K().placeOrder(cart.slice(),gift?cart.slice():null))close()}}
// ---------- habitants : dire bonjour, discuter, faire connaissance, raconter, se revoir ----------
let HID=null,HSAY='';
function hab(id,o){HID=id;const So=S0(),h=So.HB(id),S=K().SV(),day=N.day||1,met=!!So.SO().met[id];
 const rdv=S.rdv.find(r=>r.id==id&&r.d==day);
 HSAY=!met?pick(['Oh, bonjour ! On ne se connaît pas, je crois.','Salut ! Tu viens souvent ici ?']):rdv?'Te voilà ! J’avais hâte qu’on se retrouve au café.':So.line?So.line(h,'hello'):'Bonjour !';
 if(rdv&&!rdv.ok){rdv.ok=1;const g=So.gain(id,5);So.mem(id,'cafe','Rendez-vous au café');S.rdv=S.rdv.filter(r=>r!==rdv);HSAY+=' <i>(rendez-vous tenu : amitié +'+g+')</i>';save()}
 renderHab();if(o){o.bub='hey';o.bt=80}}
function renderHab(){const So=S0(),id=HID,h=So.HB(id),r=So.SO().met[id],met=!!r,pts=met?r.pts:0,S=K().SV(),day=N.day||1,f=K().R.friend,isF=f&&f.hab==id,dk=day+':'+id;
 const hello=S.bonjour[dk],told=S.raconte[dk],rdvLater=S.rdv.some(x=>x.id==id&&x.d>day);
 const c=open('hab','<div class="socHead"><div class="socPor"></div><div><b>'+h.nom+'</b><small>'+h.trait+'</small>'+(met?'<div class="socGauge"><i><u style="width:'+pts+'%"></u></i><span>'+So.tierName(pts,h.g)+' · '+Math.round(pts)+' / 100</span></div>':'<div class="socGauge"><span>Pas encore rencontré'+(h.g=='f'?'e':'')+'</span></div>')+'</div><button class="socX" aria-label="Fermer">✕</button></div>'+
  '<p class="socSay">'+HSAY+'</p><div class="socBtns">'+
  '<button data-a="hello"'+(hello?' disabled':'')+'>Dire bonjour</button>'+
  '<button data-a="talk"'+(met?'':' disabled')+'>Discuter</button>'+
  '<button data-a="know"'+(met?'':' disabled')+'>Faire connaissance</button>'+
  '<button data-a="tell"'+(met&&!told?'':' disabled')+'>Raconter quelque chose</button>'+
  '<button data-a="rdv"'+(met&&pts>=15&&!rdvLater&&!isF?'':' disabled')+'>'+(rdvLater?'Rendez-vous pris':'Proposer de se revoir')+'</button>'+
  '<button data-a="play"'+(met?'':' disabled')+'>Jouer ensemble</button>'+
  (isF?'<button data-a="gift" class="wide go">Offrir un verre à '+h.nom+'</button>':'')+
  '<button data-a="prof" class="wide"'+(met?'':' disabled')+'>Voir son profil</button></div>');
 const pc=c.querySelector('.socPor');try{pc.append(So.portrait(id,64))}catch(e){}c.querySelector('.socX').onclick=close;
 c.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>habAct(b.dataset.a))}
// anecdotes : tirées de la vie du personnage (sorties, travail, animaux, restaurant, sport…)
function anecdotes(){const L=[],P=NAME();
 try{const s=S0().SO();const m=Object.values(s.met||{}).flatMap(r=>r.mem||[]).sort((a,b)=>(b.t||0)-(a.t||0))[0];if(m)L.push('Tu racontes ta dernière sortie : « '+m.txt.toLowerCase()+' ».')}catch(e){}
 if((N.pets||[]).length)L.push('Tu parles de '+N.pets[0].n+', ton animal, et de ses dernières bêtises.');
 if(N.resto&&N.resto.repas)L.push('Tu racontes ton dernier repas au restaurant de la rue.');
 if(N.sport&&N.sport.tot&&N.sport.tot.acts)L.push('Tu parles de tes séances à la salle de sport.');
 if(N.wx=='pluie')L.push('Tu racontes comment tu as couru sous la pluie pour arriver jusqu’ici.');
 L.push('Tu racontes une anecdote drôle arrivée au travail cette semaine.','Tu décris le film que tu aimerais voir au cinéma.','Tu parles de la déco de ton appartement et de tes projets.');return L}
const LIKE={gourmand:['restaurant','repas','gâteau'],artiste:['film','déco','cinéma'],geek:['travail','film','arcade'],reveuse:['animal','pluie','déco'],bougon:['restaurant','travail'],sportif:['sport','pluie'],protecteur:['sport','animal'],zen:['animal','déco']};
function habAct(a){const So=S0(),id=HID,h=So.HB(id),S=K().SV(),day=N.day||1,dk=day+':'+id,f=K().R.friend,isF=f&&f.hab==id,bonus=(K().R.ev||[]).some(e=>e.bonus)?2:1;
 if(a=='hello'){const met=!!So.SO().met[id];const r=So.rel2(id,true);S.bonjour[dk]=1;
  if(!met){So.mem(id,'rencontre','Première rencontre au café');So.note('Nouvelle rencontre au café : '+h.nom+' ('+h.trait.toLowerCase()+').');HSAY='Enchanté'+(h.g=='f'?'e':'')+' ! Moi, c’est '+h.nom+'. '+h.bio}
  else{const g=So.gain(id,1);HSAY=pick(['Bonjour '+NAME()+' ! Ça me fait plaisir de te voir ici.','Salut ! Tu prends quoi aujourd’hui ?','Coucou ! Installe-toi si tu veux.'])+' <i>(+'+g+')</i>'}sfx('rsTick')}
 if(a=='talk'){const r=So.talk(id);HSAY=r.txt+(r.tired?' <i>(Vous avez déjà beaucoup parlé.)</i>':'');if(isF)K().friendShared(null,'longue discussion')}
 if(a=='know'){const r=So.know(id);HSAY=r.txt+(r.fact?' <i>(nouveau souvenir dans son profil)</i>':'')}
 if(a=='tell'){const t=pick(anecdotes()),like=(LIKE[h.perso]||[]).some(k=>t.includes(k));const g=So.gain(id,(like?3:1.5)*bonus);S.raconte[dk]=1;
  HSAY=t+' '+(like?h.nom+' adore : « Raconte-moi tout ! »':h.nom+' t’écoute avec le sourire.')+' <i>(+'+g+')</i>';if(isF)K().friendShared(null,'des histoires partagées')}
 if(a=='rdv'){const r=So.SO().met[id];const ok=r.pts>=40||((day*7+id.length*3)%10)<7;if(ok){S.rdv.push({id,d:day+1});So.mem(id,'cafe','Rendez-vous pris au café pour le jour '+(day+1));HSAY='Avec plaisir ! On se retrouve ici demain. <i>(rendez-vous noté : jour '+(day+1)+')</i>';sfx('gmGo',.4)}
  else HSAY='Demain, ça va être compliqué pour moi… Une autre fois !'}
 if(a=='play'){close();setTimeout(()=>games(id),220);return}
 if(a=='gift'){close();setTimeout(()=>menu('b'),220);gift=true;return}
 if(a=='prof'){close();setTimeout(()=>{try{So.openCard(id)}catch(e){}},220);return}
 save();renderHab();try{K().cfUI(true)}catch(e){}}
// ---------- jeux ----------
let GM=null;
function opponents(pref){const C0=K(),L=[];if(pref)L.push(pref);if(C0.R.friend&&!L.includes(C0.R.friend.hab))L.push(C0.R.friend.hab);
 C0.R.npc.filter(n=>n.hab&&n.st=='table'&&S0().SO().met[n.hab]).forEach(n=>{if(!L.includes(n.hab))L.push(n.hab)});return L}
function games(pref){const C0=K();if(C.st!='csit'){C0.placeMe();say('Installe-toi d’abord à une table pour jouer.');return}
 const opp=opponents(pref),S=C0.SV(),st=k=>{const p=S.parties[k]||{j:0,g:0};return p.j?p.g+' victoire'+(p.g>1?'s':'')+' sur '+p.j:'Jamais joué'};
 const who=opp.length?S0().HB(opp[0]).nom:'Gaston, un habitué';
 const c=open('pick',head('Jeux du café','Adversaire : '+who)+'<div class="cfGames">'+
  '<button data-g="echecs"><b>♞ Échecs</b><small>Le grand classique · '+st('echecs')+'</small></button>'+
  '<button data-g="cartes"><b>🂡 Cartes : 21</b><small>Approche-toi de 21 sans dépasser · '+st('cartes')+'</small></button>'+
  '<button data-g="p4"><b>● Puissance 4</b><small>Aligne quatre jetons · '+st('p4')+'</small></button></div>'+
  (opp.length>1?'<div class="cfOpp">'+opp.map((id,i)=>'<button data-o="'+id+'"'+(i==0?' class="act"':'')+'>'+S0().HB(id).nom+'</button>').join('')+'</div>':''));wire(c);
 let O=opp[0]||null;c.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{O=b.dataset.o;c.querySelectorAll('[data-o]').forEach(x=>x.classList.toggle('act',x===b));c.querySelector('.cfHead small').textContent='Adversaire : '+S0().HB(O).nom});
 c.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>startGame(b.dataset.g,O))}
function startGame(k,opp){const C0=K();C0.startAct('jeu');const s=C0.me().seat;C0.R.game={k,f:s?C0.tableOf(s):null};GM={k,opp,over:false};sfx(k=='cartes'?'cfCard':'cfChess',.6);
 if(k=='echecs')chessNew();if(k=='cartes')bjNew();if(k=='p4')p4New();renderGame()}
const oppName=()=>GM&&GM.opp?S0().HB(GM.opp).nom:'Gaston';
function endGame(res){// res : 1 gagné, 0 nul, -1 perdu
 if(GM.over)return;GM.over=true;const C0=K(),S=C0.SV(),p=S.parties[GM.k]=S.parties[GM.k]||{j:0,g:0};p.j++;if(res>0)p.g++;
 add('happy',res>0?4:res==0?2:1);try{bars()}catch(e){}
 if(GM.opp){const bonus=(C0.R.ev||[]).some(e=>e.bonus)?2:1,g=S0().gain(GM.opp,(res>=0?2.5:2)*bonus);GM.msg+=' <i>(amitié avec '+oppName()+' +'+g+')</i>';if(C0.R.friend&&C0.R.friend.hab==GM.opp)C0.friendShared(null,'partie de '+({echecs:'échecs',cartes:'cartes',p4:'Puissance 4'}[GM.k]))}
 sfx(res>0?'gmEnd':'rsTick',.6);save()}
function renderGame(){const c=open('game',head({echecs:'Échecs',cartes:'Cartes : 21',p4:'Puissance 4'}[GM.k],'Contre '+oppName())+'<div class="cfBoard"></div><p class="cfMsg"></p><div class="cfRow"></div>');wire(c);
 ({echecs:chessDraw,cartes:bjDraw,p4:p4Draw})[GM.k](c)}
function footer(c,btns){const r=c.querySelector('.cfRow');r.innerHTML='';btns.forEach(([t,fn,cls,dis])=>{const b=el('button',cls||'',t);b.disabled=!!dis;b.onclick=fn;r.append(b)})}
// --- échecs (règles complètes sauf roque et prise en passant ; promotion en dame) ---
const PV={P:1,N:3,B:3,R:5,Q:9,K:0},GLY={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟'};
function chessNew(){const b=Array(64).fill(null),row='RNBQKBNR';for(let i=0;i<8;i++){b[i]={c:'b',t:row[i]};b[8+i]={c:'b',t:'P'};b[48+i]={c:'w',t:'P'};b[56+i]={c:'w',t:row[i]}}GM.b=b;GM.turn='w';GM.sel=-1;GM.msg='À toi de jouer : tu as les blancs.';GM.last=null}
function pseudo(b,c){const M=[],add=(f,t)=>M.push([f,t]);for(let i=0;i<64;i++){const p=b[i];if(!p||p.c!=c)continue;const x=i%8,y=i>>3;
 const ray=(dx,dy,one)=>{let X=x+dx,Y=y+dy;while(X>=0&&X<8&&Y>=0&&Y<8){const j=Y*8+X,q=b[j];if(q){if(q.c!=c)add(i,j);break}add(i,j);if(one)break;X+=dx;Y+=dy}};
 if(p.t=='P'){const d=c=='w'?-1:1,Y=y+d;if(Y>=0&&Y<8){if(!b[Y*8+x]){add(i,Y*8+x);const st=c=='w'?6:1;if(y==st&&!b[(y+2*d)*8+x])add(i,(y+2*d)*8+x)}[-1,1].forEach(dx=>{const X=x+dx;if(X>=0&&X<8){const q=b[Y*8+X];if(q&&q.c!=c)add(i,Y*8+X)}})}}
 if(p.t=='N')[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dx,dy])=>ray(dx,dy,1));
 if(p.t=='B'||p.t=='Q')[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dy])=>ray(dx,dy));
 if(p.t=='R'||p.t=='Q')[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>ray(dx,dy));
 if(p.t=='K')[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dy])=>ray(dx,dy,1))}return M}
function play(b,m){const n=b.slice(),p=n[m[0]];n[m[1]]=p&&p.t=='P'&&(m[1]<8||m[1]>55)?{c:p.c,t:'Q'}:p;n[m[0]]=null;return n}
function inCheck(b,c){const k=b.findIndex(p=>p&&p.c==c&&p.t=='K');if(k<0)return true;return pseudo(b,c=='w'?'b':'w').some(m=>m[1]==k)}
function legal(b,c){return pseudo(b,c).filter(m=>!inCheck(play(b,m),c))}
function evalB(b){let s=0;b.forEach((p,i)=>{if(!p)return;const x=i%8,y=i>>3,cen=3.5-Math.max(Math.abs(x-3.5),Math.abs(y-3.5)),v=PV[p.t]+cen*.05*(p.t=='K'?0:1)+(p.t=='P'?(p.c=='b'?y:7-y)*.04:0);s+=p.c=='b'?v:-v});return s}
function search(b,c,depth,a,bt){const L=legal(b,c);if(!L.length)return inCheck(b,c)?(c=='b'?-999:999):0;if(!depth)return evalB(b);
 if(c=='b'){let best=-1e9;for(const m of L){best=Math.max(best,search(play(b,m),'w',depth-1,a,bt));a=Math.max(a,best);if(a>=bt)break}return best}
 let best=1e9;for(const m of L){best=Math.min(best,search(play(b,m),'b',depth-1,a,bt));bt=Math.min(bt,best);if(a>=bt)break}return best}
function aiMove(){const L=legal(GM.b,'b');if(!L.length)return null;const sc=L.map(m=>({m,v:search(play(GM.b,m),'w',1,-1e9,1e9)+(GM.b[m[1]]?PV[GM.b[m[1]].t]*.01:0)+Math.random()*.25}));sc.sort((a,b)=>b.v-a.v);return sc[0].m}
function chessState(){const c=GM.turn,L=legal(GM.b,c);if(L.length)return inCheck(GM.b,c)?'check':'';return inCheck(GM.b,c)?'mate':'pat'}
function chessDraw(c){const B=c.querySelector('.cfBoard');B.className='cfBoard cfChess';const L=GM.sel>=0?legal(GM.b,'w').filter(m=>m[0]==GM.sel).map(m=>m[1]):[];
 GM.b.forEach((p,i)=>{const x=i%8,y=i>>3,b=el('button','sq '+((x+y)%2?'d':'l')+(i==GM.sel?' sel':'')+(L.includes(i)?' can':'')+(GM.last&&GM.last.includes(i)?' last':''),p?'<span class="pc '+p.c+'">'+GLY[p.t]+'</span>':'');b.onclick=()=>chessTap(i);B.append(b)});
 c.querySelector('.cfMsg').innerHTML=GM.msg;footer(c,GM.over?[['Rejouer',()=>{GM.over=false;chessNew();renderGame()},'go'],['Fermer',close]]:[['Abandonner',()=>{GM.msg='Tu abandonnes : '+oppName()+' gagne la partie.';endGame(-1);renderGame()}],['Fermer',close]])}
function chessTap(i){if(GM.over||GM.turn!='w')return;const p=GM.b[i];if(p&&p.c=='w'){GM.sel=i;sfx('rsTick',.4);renderGame();return}if(GM.sel<0)return;
 const m=legal(GM.b,'w').find(m=>m[0]==GM.sel&&m[1]==i);if(!m){GM.sel=-1;renderGame();return}GM.b=play(GM.b,m);GM.last=m;GM.sel=-1;GM.turn='b';sfx('cfChess',.7);
 const s=chessState();if(s=='mate'){GM.msg='Échec et mat ! Tu gagnes la partie.';endGame(1);renderGame();return}if(s=='pat'){GM.msg='Pat : match nul.';endGame(0);renderGame();return}
 GM.msg=oppName()+' réfléchit…';renderGame();setTimeout(()=>{if(!GM||GM.k!='echecs'||GM.over)return;const a=aiMove();if(a){GM.b=play(GM.b,a);GM.last=a;sfx('cfChess',.5)}GM.turn='w';const t=chessState();
  if(t=='mate'){GM.msg='Échec et mat… '+oppName()+' gagne cette fois.';endGame(-1)}else if(t=='pat'){GM.msg='Pat : match nul.';endGame(0)}else GM.msg=t=='check'?'Échec ! Protège ton roi.':'À toi de jouer.';if(CUR=='game')renderGame()},450)}
// --- cartes : 21 ---
const SUITS=['♠','♥','♦','♣'],RK=['A','2','3','4','5','6','7','8','9','10','V','D','R'];
function bjNew(){const d=[];SUITS.forEach(s=>RK.forEach(r=>d.push({s,r})));for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}GM.deck=d;GM.me=[d.pop(),d.pop()];GM.op=[d.pop(),d.pop()];GM.show=false;GM.msg='Tire une carte ou reste. Celui qui s’approche le plus de 21 sans dépasser gagne.';if(bjV(GM.me)==21)bjStand()}
function bjV(h){let v=0,a=0;h.forEach(c=>{if(c.r=='A'){a++;v+=11}else v+=['V','D','R'].includes(c.r)?10:+c.r});while(v>21&&a){v-=10;a--}return v}
function cardH(c,hide){return hide?'<span class="cd back"></span>':'<span class="cd'+(['♥','♦'].includes(c.s)?' red':'')+'"><b>'+c.r+'</b>'+c.s+'</span>'}
function bjDraw(c){const B=c.querySelector('.cfBoard');B.className='cfBoard cfCards';B.innerHTML='<div class="hand"><small>'+oppName()+(GM.show?' · '+bjV(GM.op):'')+'</small><div>'+GM.op.map((x,i)=>cardH(x,!GM.show&&i==1)).join('')+'</div></div><div class="hand"><small>Toi · '+bjV(GM.me)+'</small><div>'+GM.me.map(x=>cardH(x)).join('')+'</div></div>';
 c.querySelector('.cfMsg').innerHTML=GM.msg;footer(c,GM.over?[['Nouvelle main',()=>{GM.over=false;bjNew();renderGame()},'go'],['Fermer',close]]:[['Tirer une carte',()=>{GM.me.push(GM.deck.pop());sfx('cfCard',.6);const v=bjV(GM.me);if(v>21){GM.show=true;GM.msg='Tu dépasses 21 ('+v+') : perdu !';endGame(-1)}else if(v==21)return bjStand();renderGame()},'go'],['Rester',bjStand],['Fermer',close]])}
function bjStand(){GM.show=true;while(bjV(GM.op)<17)GM.op.push(GM.deck.pop());const a=bjV(GM.me),b=bjV(GM.op);sfx('cfCard',.6);
 if(b>21||a>b){GM.msg='Gagné ! '+a+' contre '+b+(b>21?' ('+oppName()+' dépasse)':'')+'.';endGame(1)}else if(a==b){GM.msg='Égalité à '+a+'.';endGame(0)}else{GM.msg='Perdu : '+a+' contre '+b+'.';endGame(-1)}renderGame()}
// --- Puissance 4 ---
function p4New(){GM.g=Array(42).fill(0);GM.msg='Touche une colonne pour lâcher ton jeton jaune.';GM.win=null}
const p4At=(g,x,y)=>g[y*7+x];
function p4Drop(g,x,v){for(let y=5;y>=0;y--)if(!g[y*7+x]){const n=g.slice();n[y*7+x]=v;return n}return null}
function p4Line(g,v){for(let y=0;y<6;y++)for(let x=0;x<7;x++)for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){const L=[];for(let k=0;k<4;k++){const X=x+dx*k,Y=y+dy*k;if(X<0||X>6||Y<0||Y>5||p4At(g,X,Y)!=v)break;L.push(Y*7+X)}if(L.length==4)return L}return null}
function p4Ai(){const cols=[3,2,4,1,5,0,6].filter(x=>!GM.g[x]);for(const x of cols){const n=p4Drop(GM.g,x,2);if(p4Line(n,2))return x}for(const x of cols){const n=p4Drop(GM.g,x,1);if(p4Line(n,1))return x}
 const safe=cols.filter(x=>{const n=p4Drop(GM.g,x,2);return!cols.some(y=>{const m=p4Drop(n,y,1);return m&&p4Line(m,1)})});const L=safe.length?safe:cols;return Math.random()<.7?L[0]:pick(L)}
function p4Draw(c){const B=c.querySelector('.cfBoard');B.className='cfBoard cfP4';for(let y=0;y<6;y++)for(let x=0;x<7;x++){const v=p4At(GM.g,x,y),b=el('button','hole'+(v==1?' y':v==2?' r':'')+(GM.win&&GM.win.includes(y*7+x)?' win':''));b.onclick=()=>p4Tap(x);B.append(b)}
 c.querySelector('.cfMsg').innerHTML=GM.msg;footer(c,GM.over?[['Rejouer',()=>{GM.over=false;p4New();renderGame()},'go'],['Fermer',close]]:[['Fermer',close]])}
function p4Tap(x){if(GM.over||GM.busy)return;const n=p4Drop(GM.g,x,1);if(!n)return;GM.g=n;sfx('cfChess',.5);let w=p4Line(GM.g,1);if(w){GM.win=w;GM.msg='Quatre alignés : tu gagnes !';endGame(1);renderGame();return}
 if(GM.g.every(v=>v)){GM.msg='Grille pleine : match nul.';endGame(0);renderGame();return}GM.busy=1;GM.msg=oppName()+' joue…';renderGame();
 setTimeout(()=>{GM.busy=0;if(!GM||GM.k!='p4'||GM.over)return;GM.g=p4Drop(GM.g,p4Ai(),2);sfx('cfChess',.4);const w2=p4Line(GM.g,2);if(w2){GM.win=w2;GM.msg=oppName()+' aligne quatre jetons rouges : perdu !';endGame(-1)}else if(GM.g.every(v=>v)){GM.msg='Grille pleine : match nul.';endGame(0)}else GM.msg='À toi !';if(CUR=='game')renderGame()},420)}
// ---------- la Gazette du quartier ----------
function journal(){const C0=K(),S=C0.SV(),So=S0(),day=N.day||1;if(C.st=='csit')C0.startAct('journal');const first=!S.jour.journal;if(first){S.jour.journal=1;add('happy',2);try{bars()}catch(e){}save()}
 const notes=(So.SO().notes||[]).slice(0,3),wx={soleil:'Grand soleil sur la rue commerçante',pluie:'Averses : pensez au parapluie',froid:'Temps frais : sortez les écharpes'}[N.wx]||'Temps doux sur le quartier';
 const nb=STC.buildings.filter(b=>b.available).length,Q=quiz(day,nb);
 const c=open('journal',head('La Gazette du quartier','Jour '+day+(first?' · lecture du jour : bonheur +2':''))+'<div class="cfPaper">'+
  '<h3>'+pick(['Le Café du coin fait le plein','Ambiance chaleureuse dans la rue','Les habitants se retrouvent autour d’un café'])+'</h3>'+
  '<p class="lead">'+wx+'. '+(S.visites>1?'Le café a accueilli '+NAME()+' pour la '+S.visites+'<sup>e</sup> fois.':'Un nouveau visage au café : bienvenue à '+NAME()+' !')+'</p>'+
  '<h4>Dans le quartier</h4><ul>'+(notes.length?notes.map(n=>'<li>'+n.t+'</li>').join(''):'<li>Rien de neuf… pour l’instant. Allez dire bonjour à vos voisins !</li>')+'<li>'+pick(['Le restaurant propose un nouveau steak-frites.','La salle de sport organise des défis chaque semaine.','Le cinéma affiche complet ce week-end.','Le bowling cherche de nouveaux champions.'])+'</li></ul>'+
  '<h4>La question du jour</h4><p>'+Q.q+'</p><div class="cfQuiz">'+Q.o.map((o,i)=>'<button data-q="'+i+'"'+(S.jour.quiz!=null?' disabled':'')+(S.jour.quiz!=null&&i==Q.a?' class="ok"':'')+'>'+o+'</button>').join('')+'</div><p class="cfQr">'+(S.jour.quiz!=null?(S.jour.quiz==Q.a?'Bonne réponse ! Bonheur +3.':'Raté, la bonne réponse est en vert. Retente demain !'):'')+'</p>'+
  '<h4>L’horoscope du café</h4><p>'+pick(['Une rencontre inattendue pourrait égayer ta journée.','Un cappuccino et tout ira mieux.','C’est le bon jour pour inviter un ami.','La chance sourit à ceux qui jouent aux échecs.'])+'</p></div>');wire(c);
 c.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{S.jour.quiz=+b.dataset.q;if(+b.dataset.q==Q.a){add('happy',3);try{bars()}catch(e){}sfx('gmEnd',.5)}else sfx('rsTick');save();journal()})}
function quiz(day,nb){const Q=[{q:'Combien de commerces et de lieux ont une porte dans la rue ?',o:[nb-1,nb,nb+2].map(String),a:1},{q:'Quelle boisson du café donne le plus d’énergie ?',o:['Chocolat chaud','Espresso','Thé'],a:1},
 {q:'Qui prépare les boissons au Café du coin ?',o:['Jade','Nino','Sam'],a:0},{q:'Combien de jetons faut-il aligner au Puissance 4 ?',o:['3','4','5'],a:1},{q:'Au 21, que vaut un roi ?',o:['10','13','1'],a:0}];return Q[day%Q.length]}
// ---------- téléphone : messages et invitations ----------
function phone(){const C0=K(),S=C0.SV(),So=S0();if(C.st=='csit')C0.startAct('tel');if(!S.jour.tel){S.jour.tel=1;add('happy',1);try{bars()}catch(e){}save()}
 const met=So.HAB.filter(h=>So.SO().met[h.id]),O=So.OUT,f=C0.R.friend;
 const msgs=met.filter(h=>So.SO().met[h.id].pts>=30).slice(0,3).map(h=>({h,t:pick(['On se voit bientôt ?','Tu es au café ? J’y passe peut-être !','Merci pour la dernière fois 😊','Tu as vu le film au cinéma ?'])}));
 const c=open('phone','<div class="cfPhone"><div class="cfPhTop"><span>'+String(Math.floor(((tod+.5)%1)*24)).padStart(2,'0')+':'+String(Math.floor(((tod*24*60)%60))).padStart(2,'0')+'</span><b>Mon téléphone</b><button class="rsX" aria-label="Fermer">✕</button></div>'+
  '<h4>Messages</h4><div class="cfMsgs">'+(msgs.length?msgs.map(m=>'<div><b>'+m.h.nom+'</b> '+m.t+'</div>').join(''):'<div class="cfEmpty">Pas de nouveau message. Fais-toi des amis dans le quartier !</div>')+'</div>'+
  '<h4>Inviter un ami au café</h4><div class="cfInv">'+(met.length?met.map(h=>{const r=So.SO().met[h.id],c2=So.canInvite(h,'cafe');const here=f&&f.hab==h.id,inC=C0.R.npc.some(n=>n.hab==h.id&&!n.friend);return'<button data-i="'+h.id+'"'+(c2.ok&&!f&&!here?'':' disabled')+'><span class="cfPor" data-p="'+h.id+'"></span><b>'+h.nom+'</b><small>'+(here?'Déjà avec toi':f?'Un ami est déjà avec toi':c2.ok?So.tierName(r.pts,h.g)+(inC?' · est au café':''):c2.why)+'</small></button>'}).join(''):'<div class="cfEmpty">Tu n’as encore rencontré personne. Parle aux habitants du café ou de la rue.</div>')+'</div>'+
  '<p class="cfPhMsg"></p></div>');c.querySelector('.rsX').onclick=close;c.querySelectorAll('[data-p]').forEach(s=>{try{s.append(So.portrait(s.dataset.p,32))}catch(e){}});
 c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const id=b.dataset.i,res=So.invite(id,'cafe');const m=c.querySelector('.cfPhMsg');sfx('cfPhone',.6);
  if(res.ok){const O=So.OUT,inC=C0.R.npc.some(n=>n.hab==id&&!n.friend);if(O){O.ph='late';O.arr=tick+(inC?20:360)}m.innerHTML='<b>'+So.HB(id).nom+'</b> : « '+res.txt+' J’arrive au café ! »';setTimeout(()=>{if(CUR=='phone')close()},1400)}else m.innerHTML='<b>'+So.HB(id).nom+'</b> : « '+res.txt+' »'})}
function closeAll(){close();GM=null}
window.CAFEUI={menu,hab,games,journal,phone,close,closeAll,isOpen,get GM(){return GM},icon,startGame,chessTap,p4Tap}})();
