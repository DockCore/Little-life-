// ===== SYSTÈME SOCIAL : habitants, vie dans la rue, amitié, cadeaux, sorties, visites, profil, événements =====
// Les habitants sont fixes (prénom, apparence tirée de la garde-robe du jeu, personnalité, horaires, lieux favoris, goûts).
// Tout est enregistré dans la sauvegarde du jeu (N.social), donc aussi dans la sauvegarde multi-appareils existante.
(function(){
const sfx=(n,k)=>{try{if(typeof JEUSON!='undefined')JEUSON.fx(n,k||1,.05)}catch(e){}};
const pick=a=>a[Math.floor(Math.random()*a.length)],rnd=(a,b)=>a+Math.random()*(b-a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const P0=()=>NAME();
// ---------- les habitants ----------
// sched : où l'habitant passe chaque moment de la journée (matin, jour, soir, nuit) ; 'rue' = se promène dehors
const HAB=[
 {id:'leo',nom:'Léo',g:'m',perso:'gourmand',trait:'Jovial et gourmand',bio:'Commis de cuisine au restaurant de la rue, toujours une recette en tête.',
  look:{g:'m',sk:2,hc:1,wd:{cheveux:'nat|1',haut:'tee|1',bas:'jean|0',chaussures:'basket|2'}},col:'#ff9a3a',anniv:12,
  sched:{matin:'rue',jour:'resto',soir:'rue',nuit:'maison'},fav:['resto','cinema'],sorties:['resto','promenade','maison'],
  gout:{love:['Gâteau','Piment'],like:['Poisson','Table','Chaise'],hate:['Plante','Miroir']},
  faits:['Je travaille en cuisine au restaurant de la rue.','Mon plat préféré ? Tout ce qui pique un peu !','Je collectionne les vieux livres de recettes.','Mon anniversaire tombe le 12 du mois.','Le dimanche, je fais goûter mes desserts aux voisins.']},
 {id:'camille',nom:'Camille',g:'f',perso:'artiste',trait:'Créative et un peu rêveuse',bio:'Illustratrice, elle dessine les passants depuis la terrasse.',
  look:{g:'f',sk:0,hc:4,wd:{cheveux:'mi|4',haut:'pull|5',bas:'plisse|1',chaussures:'bottine|1'}},col:'#b04ad0',anniv:5,
  sched:{matin:'mode',jour:'rue',soir:'cinema',nuit:'maison'},fav:['cinema','mode'],sorties:['promenade','cafe','resto','maison'],
  gout:{love:['Miroir','Plante'],like:['Lampe','Tapis','Pomme'],hate:['Piment','Télé']},
  faits:['Je suis illustratrice : je dessine tout le quartier.','Les couleurs du soir sur la rue, c’est ma plus grande source d’inspiration.','Je ne rate jamais un film d’animation au cinéma.','Mon anniversaire, c’est le 5.','Je rêve d’exposer mes dessins un jour.']},
 {id:'theo',nom:'Théo',g:'m',perso:'geek',trait:'Passionné de jeux vidéo',bio:'Développeur le jour, champion de la salle d’arcade le soir.',
  look:{g:'m',sk:1,hc:3,wd:{cheveux:'mi|3',haut:'hoodie|2',bas:'cargo|0',chaussures:'basket|1'}},col:'#3fc0f0',anniv:21,
  sched:{matin:'maison',jour:'rue',soir:'arcade',nuit:'arcade'},fav:['arcade','bowling'],sorties:['arcade','bowling','maison'],
  gout:{love:['Télé','Bureau'],like:['Lampe','Gâteau','Pouf'],hate:['Pomme','Plante']},
  faits:['Je développe des petits jeux pendant mon temps libre.','Mon record au flipper ? Personne ne l’a jamais battu.','Je suis un vrai oiseau de nuit.','Mon anniversaire, c’est le 21.','Un jour, je créerai mon propre jeu d’arcade.']},
 {id:'rose',nom:'Rose',g:'f',perso:'reveuse',trait:'Douce et poétique',bio:'Fleuriste à mi-temps, elle écrit des poèmes sur des carnets.',
  look:{g:'f',sk:1,hc:5,wd:{cheveux:'long|5',haut:'blouse|3',bas:'jupe|2',chaussures:'ballerine|1'}},col:'#ff6a9a',anniv:3,
  sched:{matin:'rue',jour:'rue',soir:'maison',nuit:'maison'},fav:['rue','maison'],sorties:['promenade','cafe','maison','resto'],
  gout:{love:['Aquarium','Plante'],like:['Pomme','Tapis','Lampe'],hate:['Télé','Piment']},
  faits:['Je travaille chez une fleuriste le matin.','J’écris un poème par jour dans mon carnet.','Les poissons me fascinent, ils ont l’air si paisibles.','Mon anniversaire, c’est le 3.','Je rêve d’une maison avec un grand jardin.']},
 {id:'marcel',nom:'Marcel',g:'m',perso:'bougon',trait:'Bougon au grand cœur',bio:'Retraité, ancien champion de bowling du quartier, il connaît tout le monde.',
  look:{g:'m',sk:0,hc:6,wd:{cheveux:'nat|6',haut:'pull|0',bas:'chino|0',chaussures:'mocass|1',tete:'beret|0'}},col:'#8a7a5a',anniv:27,
  sched:{matin:'rue',jour:'bowling',soir:'resto',nuit:'maison'},fav:['bowling','resto'],sorties:['bowling','resto','promenade'],
  gout:{love:['Fauteuil','Poisson'],like:['Canapé','Pomme','Table de chevet'],hate:['Gâteau','Pouf']},
  faits:['J’ai été champion de bowling du quartier trois années de suite.','Le poisson du vendredi, c’est sacré.','J’habite ici depuis plus de quarante ans.','Mon anniversaire, c’est le 27. Pas de fête, hein !','Avant, cette rue était pleine de petits commerces.']},
 {id:'lea',nom:'Léa',g:'f',perso:'sportif',trait:'Énergique et motivante',bio:'Coureuse du quartier, on la croise à la salle de sport ou en footing.',
  look:{g:'f',sk:1,hc:2,wd:{cheveux:'top|2',haut:'tank|3',bas:'legging|0',chaussures:'running|1'}},col:'#9be84a',anniv:9,
  sched:{matin:'rue',jour:'sport',soir:'sport',nuit:'maison'},fav:['sport','rue'],sorties:['sport','promenade','bowling'],
  gout:{love:['Pomme','Tapis'],like:['Poisson','Miroir'],hate:['Gâteau','Télé']},
  faits:['Je prépare un 10 km pour le printemps.','Je cours tous les matins dans la rue.','Une pomme avant l’effort, c’est mon rituel.','Mon anniversaire, c’est le 9.','J’aide parfois Sam, le coach de la salle.']},
 {id:'malik',nom:'Malik',g:'m',perso:'protecteur',trait:'Chaleureux et protecteur',bio:'Boxeur amateur, il donne des cours aux jeunes du quartier.',
  look:{g:'m',sk:6,hc:1,wd:{cheveux:'nat|1',haut:'tank|0',bas:'short|1',chaussures:'basket|0'}},col:'#e0533d',anniv:16,
  sched:{matin:'sport',jour:'rue',soir:'bowling',nuit:'maison'},fav:['sport','bowling'],sorties:['sport','bowling','resto'],
  gout:{love:['Poisson','Piment'],like:['Canapé','Pomme'],hate:['Miroir','Pouf']},
  faits:['Je donne des cours de boxe aux ados le mercredi.','Ma grand-mère cuisinait le meilleur poisson épicé du monde.','Le bowling, c’est ma façon de me détendre.','Mon anniversaire, c’est le 16.','Je veille sur le quartier, on ne sait jamais.']},
 {id:'zoe',nom:'Zoé',g:'f',perso:'zen',trait:'Calme et bienveillante',bio:'Professeure de yoga, elle prend le temps pour tout le monde.',
  look:{g:'f',sk:5,hc:1,wd:{cheveux:'long|1',haut:'tee|2',bas:'legging|2',chaussures:'basket|1',tete:'bandeau|0'}},col:'#1fa8a0',anniv:24,
  sched:{matin:'sport',jour:'rue',soir:'rue',nuit:'maison'},fav:['sport','rue'],sorties:['promenade','cafe','sport','maison'],
  gout:{love:['Plante','Aquarium'],like:['Pomme','Tapis','Lampe'],hate:['Télé','Piment']},
  faits:['J’enseigne le yoga à la salle de sport.','Je médite dix minutes chaque matin.','Une plante dans une pièce, ça change tout.','Mon anniversaire, c’est le 24.','J’aimerais ouvrir un petit studio près du parc.']}];
const HB=id=>HAB.find(h=>h.id==id);
// ---------- sauvegarde ----------
function SO(){if(!N.social)N.social={v:1,met:{},ev:{},notes:[]};const S=N.social;S.met=S.met||{};S.ev=S.ev||{};S.notes=S.notes||[];return S}
function rel(id,create){const S=SO();let r=S.met[id];if(!r&&create){r=S.met[id]={pts:5,first:N.day||1,talk:[],gift:{d:0,n:0},know:[],pref:{},mem:[],last:[],out:{d:0,n:0},ask:0}}return r}
const TIERS=[[0,'Inconnu'],[20,'Connaissance'],[40,'Ami'],[60,'Bon ami'],[80,'Meilleur ami']];
const tierOf=p=>{let t=0;TIERS.forEach((x,i)=>{if(p>=x[0])t=i});return t};
const tierName=(p,g)=>{const t=tierOf(p),n=TIERS[t][1];return g=='f'?{Inconnu:'Inconnue','Ami':'Amie','Bon ami':'Bonne amie','Meilleur ami':'Meilleure amie'}[n]||n:n};
function gain(id,v,why){const r=rel(id,true),old=r.pts;r.pts=clamp(Math.round((r.pts+v)*10)/10,0,100);const t0=tierOf(old),t1=tierOf(r.pts);if(t1>t0){const h=HB(id);note(h.nom+' est maintenant '+(t1==1?'une connaissance':tierName(r.pts,h.g).toLowerCase())+' !');sfx('gmLevel',.6)}save();return r.pts-old}
function note(t){const S=SO();S.notes.unshift({t,d:N.day||1});if(S.notes.length>20)S.notes.length=20;try{say(t)}catch(e){}}
// moment de la journée (le jeu : tod 0 = plein jour, 0,5 = pleine nuit)
const period=()=>{const t=tod;return t<.18||t>=.9?'jour':t<.36?'soir':t<.68?'nuit':'matin'};
const mday=()=>((N.day||1)-1)%30+1;
const isBday=h=>h.anniv==mday();
// ---------- images des habitants (garde-robe du jeu, mêmes proportions que le joueur) ----------
const NCC=new Map();let prepQ=[];
function hLook(h){const B=Object.assign({},N.look);delete B.nu;delete B.lf;return Object.assign(B,h.look,{wd:Object.assign({},h.look.wd)})}
const img=(id,nm)=>{const k=id+'|'+nm,c=NCC.get(k);if(!c&&!prepQ.some(q=>q[0]==id&&q[1]==nm))prepQ.push([id,nm]);return c};
function prepTick(n){let did=false;while(n-->0&&prepQ.length){const[id,nm]=prepQ.shift(),k=id+'|'+nm;if(NCC.has(k))continue;try{if(drawFrame(nm,hLook(HB(id)))){const c=document.createElement('canvas');c.width=CW;c.height=CH;c.getContext('2d').drawImage(sc2,0,0);NCC.set(k,c);did=true}}catch(e){}}if(did)spKey=''}
// portrait : la tête du personnage (image du jeu), agrandie en pixel art
function portrait(id,sz){sz=sz||96;const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d'),h=HB(id),im=NCC.get(id+'|idle');g.imageSmoothingEnabled=false;
 g.fillStyle=mx(h.col,'#ffffff',.55);g.beginPath();g.arc(sz/2,sz/2,sz/2,0,7);g.fill();g.fillStyle=mx(h.col,'#ffffff',.25);g.beginPath();g.arc(sz/2,sz*.62,sz*.44,0,7);g.fill();
 if(im){g.save();g.beginPath();g.arc(sz/2,sz/2,sz/2-1,0,7);g.clip();const k=sz/36;g.drawImage(im,24,48,36,36,0,sz*.08,36*k,36*k);g.restore()}else{g.fillStyle='#2b2430';g.font='700 '+Math.round(sz*.4)+'px system-ui';g.textAlign='center';g.fillText(h.nom[0],sz/2,sz*.64)}return c}
// ---------- dialogues : selon la personnalité, l'amitié, le moment, la météo, les souvenirs, l'actualité du joueur ----------
const DL={
 gourmand:{t:[['Tiens, {p} ! Tu as déjà goûté le burger du restaurant ?','Salut ! Je sens encore la pâte à crêpes, désolé.','Il fait faim, non ? Moi j’ai toujours faim.'],['Hé, {p} ! J’ai testé une nouvelle sauce, un délice.','Tu passes au restaurant ce soir ? Je te garde une part de gâteau.','Je pense à une recette pour toi, je te dirai.'],['{p} ! Mon goûteur préféré !','Si un jour tu ouvres un resto, je suis ton chef.','Toi et moi, on devrait faire un concours de crêpes.']],
  nuit:'Je rentre de mon service, les pieds en compote…',pluie:'Par ce temps, rien de tel qu’une bonne soupe.',froid:'Il fait froid : vivement un chocolat chaud !',soleil:'Un temps parfait pour un pique-nique !'},
 artiste:{t:[['Oh, bonjour… Désolée, je dessinais les passants.','Tu as vu la lumière sur les façades ? Magnifique.','Bonjour ! Je cherchais l’inspiration.'],['Salut {p} ! Je t’ai croqué(e) l’autre jour en passant.','J’ai une nouvelle idée de fresque pour la rue.','Tu veux voir mon carnet de croquis ?'],['{p} ! Tu es ma muse officielle, tu sais.','J’ai fait un portrait de toi, je te l’offrirai.','Avec toi, la rue a plus de couleurs.']],
  nuit:'La nuit, les néons dessinent des tableaux…',pluie:'La pluie fait de jolis reflets sur le trottoir.',froid:'Mes doigts gèlent, impossible de dessiner !',soleil:'Ce soleil donne envie de peindre dehors.'},
 geek:{t:[['Salut. Tu joues à l’arcade, toi ?','Yo ! Je viens de battre mon record.','Hé… tu connais le code secret du flipper ?'],['{p} ! Partie de Pong ce soir ?','J’ai trouvé un nouveau bug dans un jeu, génial.','Tu as vu le nouveau jeu de la borne ?'],['Mon coéquipier préféré ! On fait une partie ?','{p}, on battra tous les records ensemble.','Je t’ai mis(e) dans les crédits de mon jeu.']],
  nuit:'La nuit, c’est le meilleur moment pour jouer.',pluie:'Il pleut ? Parfait, journée arcade !',froid:'Il fait froid, je file au chaud devant un écran.',soleil:'Trop de soleil… mes yeux !'},
 reveuse:{t:[['Bonjour… Tu as remarqué les nuages ce matin ?','Oh, pardon, j’étais dans mes pensées.','Bonjour ! Belle journée pour flâner.'],['{p} ! J’ai écrit un petit poème sur la rue.','Tu crois que les poissons rêvent ?','Je suis contente de te croiser.'],['{p}, tu es une des plus belles rencontres du quartier.','J’ai écrit un poème sur notre amitié.','Avec toi, tout semble plus doux.']],
  nuit:'Les étoiles sont si belles ce soir…',pluie:'J’adore le bruit de la pluie.',froid:'Le froid rend les couleurs plus vives.',soleil:'Le soleil donne envie de chanter.'},
 bougon:{t:[['Mmh. Bonjour.','Encore un nouveau dans le quartier… Bon, bienvenue.','Les jeunes, toujours pressés.'],['Ah, c’est toi. Ça va, toi ?','Tu viens voir un vieux briscard jouer au bowling ?','De mon temps, la rue était plus calme.'],['{p} ! Te voilà enfin. Je t’attendais.','Tu es bien le seul à supporter mes histoires.','Si quelqu’un t’embête, tu me le dis.']],
  nuit:'Je ne dors plus beaucoup, alors je marche.',pluie:'Encore de la pluie… mes rhumatismes !',froid:'Brr. Pas un temps à mettre un chien dehors.',soleil:'Bon, il fait beau, je l’admets.'},
 sportif:{t:[['Salut ! Tu cours aussi le matin ?','Hé ! On se voit à la salle ?','Bonjour ! Une petite foulée ?'],['{p} ! Tu as battu un record cette semaine ?','Allez, on s’étire ensemble ?','Tu progresses vite, ça se voit !'],['{p}, ma partenaire d’entraînement préférée !','On s’inscrit ensemble à la course du quartier ?','Avec toi, même les séries de squats passent vite.']],
  nuit:'Je rentre de la salle, je suis vidée !',pluie:'La pluie ne m’arrête pas, je cours quand même.',froid:'Parfait pour un footing, ça réveille.',soleil:'Grand soleil : footing obligatoire !'},
 protecteur:{t:[['Salut. Tout va bien dans le quartier ?','Hé, bienvenue. Si tu as besoin, je suis là.','Bonjour ! Tu t’installes ici ?'],['{p} ! Tu veux apprendre deux-trois coups ?','Le quartier est calme aujourd’hui, tant mieux.','Tu manges bien, au moins ?'],['{p}, toi tu es de la famille maintenant.','Je serai toujours là pour toi.','Viens, je t’offre un smoothie à la salle.']],
  nuit:'Je fais un dernier tour du quartier avant de dormir.',pluie:'Couvre-toi, il pleut des cordes.',froid:'Mets un bonnet, il fait froid !',soleil:'Beau temps : parfait pour un footing.'},
 zen:{t:[['Bonjour… Respire, rien ne presse.','Bienvenue dans le quartier. Prends ton temps.','Bonjour ! Belle énergie aujourd’hui.'],['{p} ! Tu as l’air détendu(e) aujourd’hui.','Un petit étirement avec moi ?','J’ai pensé à toi pendant ma méditation.'],['{p}, ta présence apaise tout le monde.','Je suis reconnaissante de t’avoir rencontré(e).','On fait une balade en silence ? Juste profiter.']],
  nuit:'Je profite du calme de la nuit.',pluie:'La pluie nettoie l’air et l’esprit.',froid:'Le froid, c’est bon pour la circulation !',soleil:'Ce soleil, quelle énergie !'}};
const GIFT_R={love:['Oh ! Comment tu as su ? J’adore !','C’est exactement ce qu’il me fallait !','Merci, merci, merci !'],like:['Oh, c’est gentil, merci !','Ça me fait vraiment plaisir.','Quelle bonne idée !'],neutral:['Merci… c’est gentil.','Ah, d’accord. Merci quand même.','C’est une attention, merci.'],hate:['Euh… ce n’est pas trop mon truc.','Oh… je n’aime pas vraiment ça.','Hmm. Merci, mais non.']};
const SORT={resto:{n:'Restaurant',b:'resto',ok:()=>!!(STC.buildings.find(b=>b.id=='resto')||{}).available,txt:'Dîner ensemble au restaurant'},
 arcade:{n:'Arcade',b:'arcade',ok:()=>!!(STC.buildings.find(b=>b.id=='arcade')||{}).available,txt:'Une partie à la salle d’arcade'},
 bowling:{n:'Bowling',b:'bowling',ok:()=>!!(STC.buildings.find(b=>b.id=='bowling')||{}).available,txt:'Quelques boules au bowling'},
 sport:{n:'Salle de sport',b:'sport',ok:()=>!!(STC.buildings.find(b=>b.id=='sport')||{}).available,txt:'S’entraîner ensemble'},
 cafe:{n:'Café',b:'cafe',ok:()=>!!(STC.buildings.find(b=>b.id=='cafe')||{}).available,txt:'Prendre un verre ensemble au café'},
 promenade:{n:'Promenade',b:null,ok:()=>true,txt:'Marcher ensemble dans la rue'},
 maison:{n:'Visite à domicile',b:'maison',ok:()=>true,txt:'L’inviter chez toi',min:40}};
function line(h,kind){const r=rel(h.id,true),D=DL[h.perso],t=Math.min(2,Math.floor(tierOf(r.pts)/1.5)),pool=[];
 if(kind=='hello'){if(isBday(h))pool.push('C’est mon anniversaire aujourd’hui ! Tu y as pensé ?');pool.push(...D.t[t]);const pr=period();if(pr=='nuit')pool.push(D.nuit);if(N.wx&&D[N.wx])pool.push(D[N.wx]);
  // souvenirs et actualité du joueur
  const m=r.mem[0];if(m&&(N.day||1)-m.d<=3)pool.push({resto:'On remet ça au restaurant bientôt ?',arcade:'Notre partie d’arcade, quel moment !',bowling:'Notre bowling, j’en ris encore.',sport:'Mes jambes se souviennent de notre séance !',promenade:'Merci pour la balade de l’autre jour.',maison:'Merci encore pour l’invitation chez toi !'}[m.k]||'Content(e) de te revoir !');
  try{const sp=N.sport;if(sp&&sp.hist&&sp.hist[0]&&Date.now()-sp.hist[0].t<6e5&&(h.perso=='sportif'||h.perso=='protecteur'||h.perso=='zen'))pool.push('Tu sors de la salle de sport ? Ça se voit, tu as la forme !')}catch(e){}
  try{const rs=N.resto;if(rs&&rs.hist&&rs.hist[0]&&Date.now()-rs.hist[0].t<6e5&&h.perso=='gourmand')pool.push('Alors, tu as aimé ce que tu as mangé au restaurant ?')}catch(e){}
  if(N.hunger<25)pool.push('Tu as l’air affamé(e)… va manger un morceau !');if(N.energy<20)pool.push('Tu as l’air épuisé(e), repose-toi un peu.')}
 // jamais deux fois de suite la même phrase
 let c=pool.filter(s=>!r.last.includes(s));if(!c.length)c=pool.filter(s=>s!==r.last[0]);if(!c.length)c=pool;const s=pick(c);r.last.unshift(s);if(r.last.length>6)r.last.length=6;return s.replace(/\{p\}/g,P0()).replace(/\(e\)/g,N.look&&N.look.g=='f'?'e':'')}
// ---------- actions : discuter, faire connaissance, cadeau, sortie ----------
// rendement décroissant : chaque discussion récente rapporte moins
function talk(id){const h=HB(id),r=rel(id,true),now=Date.now();r.talk=r.talk.filter(t=>now-t<8*60e3);const n=r.talk.length;r.talk.push(now);const base=[3,2,1,.5,0][Math.min(4,n)]*(isFete()?1.5:1)*(isBday(h)?1.5:1);const g=gain(id,base);sfx('rsTick');return{txt:line(h,'hello'),g,tired:n>=3}}
function know(id){const h=HB(id),r=rel(id,true);const left=h.faits.map((f,i)=>i).filter(i=>!r.know.includes(i));if(!left.length)return{txt:pick(['Tu sais déjà presque tout de moi !','On se connaît bien maintenant, non ?']),g:0,done:true};
 const need=[0,0,20,20,40][r.know.length]||0;if(r.pts<need)return{txt:pick(['On se connaît encore un peu… Laisse-moi un peu de temps.','Ça, je te le dirai quand on se connaîtra mieux.']),g:0,lock:need};
 const i=left[0];r.know.push(i);const g=gain(id,3);return{txt:h.faits[i],g,fact:true}}
// inventaire offrable : nourriture du placard et objets rangés (jamais retirés avant confirmation)
function gifts(){const L=[];FOODS.forEach((f,i)=>{const n=(N.stock||[])[i]||0;if(n>0)L.push({k:'food',i,n:f.n,c:n})});const st={};(N.store||[]).forEach(n=>{st[n]=(st[n]||0)+1});Object.keys(st).forEach(n=>L.push({k:'store',n,c:st[n]}));return L}
const prefOf=(h,n)=>h.gout.love.includes(n)?'love':h.gout.like.includes(n)?'like':h.gout.hate.includes(n)?'hate':'neutral';
function give(id,it){const h=HB(id),r=rel(id,true);// retrait de l'objet seulement ici, après confirmation
 if(it.k=='food'){if(!(N.stock[it.i]>0))return null;N.stock[it.i]--;try{refreshChips()}catch(e){}}else{const j=(N.store||[]).indexOf(it.n);if(j<0)return null;N.store.splice(j,1)}
 const p=prefOf(h,it.n),day=N.day||1;if(r.gift.d!=day){r.gift={d:day,n:0}}const k=[1,.5,.25][Math.min(2,r.gift.n)];r.gift.n++;let v={love:15,like:9,neutral:3,hate:-8}[p];if(v>0)v*=k*(isBday(h)?1.5:1);const g=gain(id,v);r.pref[it.n]=p;
 if(p=='love'||(isBday(h)&&p!='hate'))mem(id,'cadeau',(isBday(h)?'Cadeau d’anniversaire : ':'Cadeau adoré : ')+it.n);sfx(p=='hate'?'gmMiss':'rsPay',.6);save();return{p,g,txt:pick(GIFT_R[p])+(isBday(h)&&p!='hate'?' Et pour mon anniversaire en plus !':'')}}
function mem(id,k,txt){const r=rel(id,true);r.mem.unshift({k,txt,d:N.day||1,t:Date.now()});if(r.mem.length>12)r.mem.length=12}
// ---------- sorties ----------
let OUT=null;// {id,k,ph:'go'|'on',did,t,dist}
function canInvite(h,k){const r=rel(h.id,true),S=SORT[k];if(!S.ok())return{ok:false,why:'Ce lieu n’est pas encore ouvert.'};if(r.pts<(S.min||20))return{ok:false,why:S.min?'Il faut être ami'+(h.g=='f'?'e':'')+' ('+S.min+' points) pour l’inviter chez toi.':'Faites d’abord connaissance (20 points).'};if(OUT)return{ok:false,why:'Une sortie est déjà en cours.'};return{ok:true}}
function invite(id,k){const h=HB(id),r=rel(id,true),c=canInvite(h,k);if(!c.ok)return{ok:false,txt:c.why};
 // réponse cohérente : même question le même jour → même réponse
 const pr=period(),fav=h.sorties.includes(k)||h.fav.includes(SORT[k].b),day=N.day||1;let ch=[0,.55,.8,.9,1][tierOf(r.pts)]+(fav?.15:0)-(pr=='nuit'&&h.perso!='geek'?.35:0);
 const sd=((day*131+id.length*17+k.length*7+(h.anniv*3))%100)/100;if(r.ask==day+':'+k)return{ok:false,txt:'Je t’ai déjà répondu pour aujourd’hui !'};if(sd>ch){r.ask=day+':'+k;return{ok:false,txt:pick(pr=='nuit'?['Il est tard, je vais me coucher. Une autre fois ?','Pas ce soir, je suis épuisé'+(h.g=='f'?'e':'')+'.']:['Pas aujourd’hui, j’ai déjà quelque chose de prévu.','Une autre fois avec plaisir !','Je ne peux pas maintenant, désolé'+(h.g=='f'?'e':'')+'.'])}}
 OUT={id,k,ph:'go',did:false,t:0,dist:0,base:snapOut()};note(h.nom+' accepte : '+SORT[k].txt.toLowerCase()+' !');sfx('gmGo',.5);
 // on y va ensemble à pied dans la rue
 if(k=='promenade'){OUT.ph='on';say(h.nom+' : « Allons-y, on marche un peu ! »')}
 else{const b=STC.buildings.find(x=>x.id==SORT[k].b);if(STV.on&&b){STV.auto={x:stDoorX(b),then:()=>{stEnterB(b)}}}}
 return{ok:true,txt:pick(['Avec plaisir !','Oh oui, bonne idée !','Carrément, on y va !','J’en serais ravi'+(h.g=='f'?'e':'')+' !'])}}
function snapOut(){return{repas:(N.resto&&N.resto.repas)||0,plats:N.resto?Object.values(N.resto.plats||{}).reduce((a,b)=>a+b,0):0,acts:(N.sport&&N.sport.tot&&N.sport.tot.acts)||0,arc:0,bw:0}}
function conclude(cancel){const o=OUT;if(!o)return;OUT=null;const h=HB(o.id),r=rel(o.id,true),day=N.day||1;
 if(cancel){note('Sortie avec '+h.nom+' annulée.');return}
 if(!o.did){const g=gain(o.id,1);showEnd(h,false,g,'La sortie a tourné court… '+h.nom+' : « Une autre fois peut-être ! »');return}
 if(r.out.d!=day)r.out={d:day,n:0};const k=[1,.5,.3][Math.min(2,r.out.n)];r.out.n++;const fav=h.sorties.includes(o.k)||h.fav.includes(SORT[o.k].b);const g=gain(o.id,(fav?15:11)*k);
 const T={cafe:'Moment au café',resto:'Dîner au restaurant',arcade:'Partie à la salle d’arcade',bowling:'Partie de bowling',sport:'Séance de sport à deux',promenade:'Promenade dans la rue',maison:'Visite à la maison'}[o.k];mem(o.id,o.k,T+(o.extra?' : '+o.extra:''));
 SO().stats=SO().stats||{};SO().stats.sorties=(SO().stats.sorties||0)+1;save();showEnd(h,true,g,pick(['Merci, c’était super !','Quelle bonne idée tu as eue !','On recommence quand tu veux !','J’ai passé un très bon moment.']))}
// ---------- habitants dans la rue ----------
const ST={list:[],seen:{},t:0,chat:null,lastP:null};
const LANE=[ST_WALK-5,ST_WALK+5];
function bx(id){const b=STC.buildings.find(x=>x.id==id);return b?stDoorX(b):null}
function streetPop(){// qui est dehors selon l'heure ? (4 au plus, moins la nuit)
 const pr=period(),fete=isFete(),max=pr=='nuit'?(fete?3:1):fete?5:4;const want=HAB.filter(h=>h.sched[pr]=='rue'||fete&&pr=='soir').map(h=>h.id);
 // les autres sortent de temps en temps d'un commerce pour y retourner ensuite
 ST.list.forEach(w=>{if(!want.includes(w.id)&&w.st!='enter'&&w.st!='talk'&&!(OUT&&OUT.id==w.id)){const dest=HB(w.id).sched[pr];const x=dest=='rue'?null:bx(dest);if(x!=null){w.goal={x,enter:dest}}else if(!w.leave){w.leave=1;w.goal={x:w.x<STC.len/2?STC.minX-30:STC.maxX+30,out:1}}}});
 for(const id of want){if(ST.list.length>=max)break;if(ST.list.some(w=>w.id==id))continue;const h=HB(id);const from=h.sched[pr]=='rue'?pick(['bord','porte']):'porte';let x,a=1,st='walk';
  const doorId=pick(['maison','resto','sport','cinema','mode','arcade','bowling'].filter(i=>bx(i)!=null&&!ST.list.some(o=>Math.abs(o.x-bx(i))<30)));if(from=='porte'){x=bx(doorId);a=0;st='exit'}else x=Math.random()<.5?STV.cam-30:STV.cam+STV.W+30;
  ST.list.push({id,x,lane:Math.random()<.5?0:1,dir:1,sp:rnd(.7,1.1),st,a,t:0,ph:0,goal:null,wait:0,bub:null,bt:0})}}
function newGoal(w){const h=HB(w.id),r=Math.random();// promenade, arrêt devant une vitrine, ou petite course dans un commerce favori
 if(r<.25){const f=h.fav.filter(b=>bx(b)!=null);if(f.length){const b=pick(f);w.goal={x:bx(b),enter:b,errand:1};return}}
 w.goal={x:clamp(w.x+rnd(-260,260),STC.minX+10,STC.maxX-10),stop:Math.random()<.45}}
function stTickS(){if(!STV.on)return;ST.t++;prepTick(prepQ.length>20?4:2);if(ST.t%90==1)streetPop();
 const pX=STV.px,list=ST.list;
 for(const w of list){w.t++;if(w.bt>0&&--w.bt==0)w.bub=null;HAB.find(h=>h.id==w.id)&&['idle','w0','w1','w2','w3','wave'].forEach(nm=>img(w.id,nm));
  if(OUT&&OUT.id==w.id&&w.st!='enter'){w.st='follow'}
  if(w.st=='exit'){w.a=Math.min(1,w.a+.05);if(w.a>=1){w.st='walk';w.goal=null}continue}
  if(w.st=='enter'){w.a=Math.max(0,w.a-.05);if(w.a<=0){w.gone=1;if(w.goal&&w.goal.errand){ST.seen[w.id]={back:ST.t+rnd(600,1500),door:w.goal.x}}}continue}
  if(w.st=='talk'){w.dir=pX>w.x?1:-1;continue}
  if(w.st=='follow'){// accompagne le joueur pendant une sortie
   const tx=pX-C.d*26;const d=tx-w.x;if(Math.abs(d)>2){w.x+=Math.sign(d)*Math.min(Math.abs(d),2.4);w.dir=Math.sign(d);w.ph++}else w.dir=C.d;w.lane=0;continue}
  if(w.st=='chat'){if(--w.wait<=0){w.st='walk';w.goal=null;w.bub=null}else if(!w.bub&&Math.random()<.02){w.bub='chat';w.bt=70}continue}
  if(w.wait>0){w.wait--;continue}
  if(!w.goal)newGoal(w);const g=w.goal,d=g.x-w.x;
  if(Math.abs(d)<2){if(g.enter){w.st='enter';w.dir=1;continue}if(g.out){w.gone=1;continue}w.goal=null;if(g.stop)w.wait=Math.floor(rnd(80,260));continue}
  let dir=Math.sign(d),sp=w.sp;
  // éviter les collisions : on change de file, on ralentit ou on attend
  const ahead=list.find(o=>o!==w&&!o.gone&&o.lane==w.lane&&o.a>.5&&Math.sign(o.x-w.x)==dir&&Math.abs(o.x-w.x)<30);
  if(ahead){const other=1-w.lane;if(!list.some(o=>o!==w&&o.lane==other&&Math.abs(o.x-w.x)<30))w.lane=other;else if(ahead.st=='walk'&&ahead.dir!=dir&&!ST.chat&&Math.random()<.5&&!(OUT&&(OUT.id==ahead.id||OUT.id==w.id))){// ils se croisent : petite discussion
    w.st=ahead.st='chat';w.wait=ahead.wait=Math.floor(rnd(240,420));w.dir=Math.sign(ahead.x-w.x);ahead.dir=-w.dir;w.bub='chat';w.bt=80;ahead.goal=null;continue}else{w.wait=20;continue}}
  // trop près d'un autre habitant dans la même file : on s'écarte
  const tight=list.find(o=>o!==w&&!o.gone&&o.lane==w.lane&&o.a>.5&&Math.abs(o.x-w.x)<12);if(tight&&list.indexOf(tight)<list.indexOf(w)){const other=1-w.lane;if(!list.some(o=>o!==w&&o.lane==other&&Math.abs(o.x-w.x)<14)){w.lane=other}else{w.x-=dir*sp;w.wait=10;continue}}
  if(Math.abs(w.x-pX)<14&&w.lane==1)w.lane=0;
  w.x+=dir*sp;w.dir=dir;w.ph++}
 ST.list=list.filter(w=>!w.gone);
 // retour d'une course dans un commerce
 for(const id in ST.seen){const s=ST.seen[id];if(ST.t>=s.back){delete ST.seen[id];if(!ST.list.some(w=>w.id==id)&&ST.list.length<5)ST.list.push({id,x:s.door,lane:1,dir:-1,sp:rnd(.7,1.1),st:'exit',a:0,t:0,ph:0,goal:null,wait:0})}}
 // compagnon de sortie absent de la rue : il apparaît à côté du joueur
 if(OUT&&!ST.list.some(w=>w.id==OUT.id)){ST.list.push({id:OUT.id,x:pX-C.d*26,lane:0,dir:C.d,sp:1,st:'follow',a:1,t:0,ph:0,goal:null,wait:0})}
 // promenade : la sortie avance avec les pas faits ensemble
 if(OUT&&OUT.k=='promenade'){if(ST.lastP!=null)OUT.dist+=Math.abs(pX-ST.lastP);if(!OUT.did&&OUT.dist>=480){OUT.did=true;OUT.extra=Math.round(OUT.dist/10)+' pas';const w=ST.list.find(x=>x.id==OUT.id);if(w){w.bub='love';w.bt=90}}
  if(ST.t%420==0){const w=ST.list.find(x=>x.id==OUT.id),b=stNearB();if(w){w.bub='chat';w.bt=90}const h=HB(OUT.id);say(h.nom+' : « '+(b?pick(['Tiens, '+b.name.toLowerCase()+' ! J’y vais souvent.','J’aime bien cet endroit, '+b.name.toLowerCase()+'.']):line(h,'hello'))+' »')}
  if(OUT.did&&ST.t%60==0&&OUT.dist>=480&&!OUT.endAsk){OUT.endAsk=1;say(HB(OUT.id).nom+' : « Belle balade ! On s’arrête là ? »');socPanel(true)}}
 if(ST.t%120==0){const S=SO();const u=ST.list.find(w=>!rel(w.id)&&w.st=='walk'&&w.a>=1&&Math.abs(w.x-pX)<160&&!S.ev['greet:'+w.id]);if(u&&!OUT){S.ev['greet:'+u.id]=N.day||1;u.goal={x:pX+(u.x<pX?-24:24)};u.bub='hey';u.bt=120;say('Quelqu’un te fait signe dans la rue…')}}
 ST.lastP=pX;
 // retour dans la rue après une sortie dans un lieu : conclusion
 if(OUT&&OUT.ph=='in'&&STV.on){conclude()}
 evTick();socPanel()}
function nearW(){const pX=STV.px;let best=null,bd=46;for(const w of ST.list){if(w.a<.8||w.st=='enter')continue;const d=Math.abs(w.x-pX);if(d<bd){bd=d;best=w}}return best}
function stDrawS(x,lane){if(!STV.on)return;const near=nearW();
 for(const w of ST.list.filter(w=>w.lane==lane).sort((a,b)=>a.x-b.x)){const X=Math.round(w.x-STV.cam);if(X<-50||X>STV.W+50)continue;const Y=LANE[lane],mv=(w.st=='walk'||w.st=='follow')&&w.wait<=0&&(w.st!='follow'||STV.mv||Math.abs((STV.px-C.d*26)-w.x)>2),
  nm=mv?'w'+(Math.floor(w.ph/7)%4):(w.st=='chat'&&w.t%200<80?'wave':'idle'),im=img(w.id,nm)||img(w.id,'idle');if(!im)continue;
  x.globalAlpha=w.a;x.fillStyle='rgba(20,14,28,.25)';x.fillRect(X-11,Y-2,22,3);x.save();if(w.dir<0){x.translate(X,0);x.scale(-1,1);x.drawImage(im,0,0,CW,CH,-40,Y-127,CW,CH)}else x.drawImage(im,0,0,CW,CH,X-40,Y-127,CW,CH);x.restore();x.globalAlpha=1;
  if(w.bub)bubble(x,X,Y-122,w.bub);
  if(w===near||OUT&&OUT.id==w.id){const h=HB(w.id),r=rel(w.id),t=r?h.nom:'?';stTag(x,X,Y-136,(r?'':'Habitant ')+t+(isBday(h)&&r?' 🎂':''))}}}
function bubble(x,X,Y,k){x.fillStyle=ST_OL;x.fillRect(X-9,Y-9,19,13);x.fillRect(X-2,Y+4,3,3);x.fillStyle='#ffffff';x.fillRect(X-8,Y-8,17,11);
 if(k=='chat'){x.fillStyle='#5a646e';for(let i=0;i<3;i++)if(Math.floor(tick/12)%4>i)x.fillRect(X-5+i*5,Y-3,3,3)}
 else if(k=='love'){x.fillStyle='#e0506a';x.fillRect(X-4,Y-6,3,3);x.fillRect(X+1,Y-6,3,3);x.fillRect(X-4,Y-4,8,3);x.fillRect(X-2,Y-1,4,2)}
 else if(k=='hey'){x.fillStyle='#f5a020';x.fillRect(X-1,Y-7,3,6);x.fillRect(X-1,Y,3,2)}}
window.SOC_ST={tick:stTickS,draw:stDrawS};
// toucher un habitant dans la rue
function stTapS(e){if(!STV.on||STV.modal||UI.open)return;const cv=document.getElementById('stCv'),r=cv.getBoundingClientRect(),mx2=(e.clientX-r.left)/r.width*STV.W+STV.cam,my=(e.clientY-r.top)/r.height*STV.H-STV.oy;
 const w=ST.list.filter(w=>w.a>.6&&w.st!='enter').sort((a,b)=>b.lane-a.lane).find(w=>Math.abs(mx2-w.x)<15&&my<LANE[w.lane]+2&&my>LANE[w.lane]-112);if(!w)return;e.stopImmediatePropagation();e.preventDefault();
 if(Math.abs(w.x-STV.px)<40)openCard(w.id);else STV.auto={x:w.x+(STV.px<w.x?-24:24),then:()=>openCard(w.id)}}
// ---------- panneau de la rue : parler, amis, fin de promenade ----------
function socPanel(force){let row=document.getElementById('stSoc');if(!row){const op=document.querySelector('#v-street .opts');if(!op)return;row=document.createElement('div');row.id='stSoc';row.className='stSoc';op.insertAdjacentElement('afterend',row)}
 let b=document.getElementById('stTalk');if(!b){b=document.createElement('button');b.id='stTalk';b.className='stTalk';row.appendChild(b);b.onclick=()=>{const w=nearW();if(OUT&&OUT.k=='promenade'&&OUT.did&&(!w||w.id==OUT.id)){endWalk();return}if(w)openCard(w.id)}}
 let a=document.getElementById('stFriends');if(!a){a=document.createElement('button');a.id='stFriends';a.className='stTalk soc';a.textContent='Mes amis';row.appendChild(a);a.onclick=()=>openMenu()}
 const w=nearW(),k=(w?w.id:'')+(OUT?OUT.k+OUT.did:'');if(!force&&k===ST.pk)return;ST.pk=k;
 if(OUT&&OUT.k=='promenade'&&OUT.did){b.hidden=false;b.textContent='Finir la balade';return}
 if(w){const r=rel(w.id);b.hidden=false;b.textContent='Parler à '+(r?HB(w.id).nom:'l’habitant'+(HB(w.id).g=='f'?'e':''))}else b.hidden=true}
function endWalk(){const w=ST.list.find(x=>OUT&&x.id==OUT.id);conclude();if(w){w.st='walk';w.goal=null}socPanel(true)}
// ---------- carte d'interaction (fenêtre élégante, adaptée au tactile) ----------
const UI={open:null,view:'main',say:'',sel:null};
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function over(){let o=document.getElementById('socOver');if(!o){o=el('div','socOver');o.id='socOver';o.hidden=true;o.innerHTML='<div class="socCard" role="dialog"></div>';document.body.appendChild(o);o.addEventListener('pointerdown',e=>{if(e.target===o)closeCard()})}return o}
function openCard(id,first){const h=HB(id);let r=rel(id);const isNew=!r;r=rel(id,true);UI.open=id;UI.view='main';UI.menu=false;
 const w=ST.list.find(x=>x.id==id);if(w&&w.st!='follow'){w.st='talk';w.dir=STV.px>w.x?1:-1}STV.modal=true;
 UI.say=isNew?pick(['Bonjour ! Je ne crois pas qu’on se connaisse… Moi, c’est '+h.nom+'.','Salut ! Tu es nouveau'+(N.look.g=='f'?'lle':'')+' ici ? Je m’appelle '+h.nom+'.']):line(h,'hello');
 if(isNew){note('Nouvelle rencontre : '+h.nom+' ('+h.trait.toLowerCase()+').');mem(id,'rencontre','Première rencontre dans la rue')}render();const o=over();o.hidden=false;requestAnimationFrame(()=>o.classList.add('on'));sfx('rsPage')}
function closeCard(){const o=over();o.classList.remove('on');setTimeout(()=>{if(!o.classList.contains('on'))o.hidden=true},200);const w=ST.list.find(x=>x.id==UI.open);if(w&&w.st=='talk'){w.st='walk';w.goal=null;w.wait=40}UI.open=null;UI.menu=false;STV.modal=false;socPanel(true);save()}
function head(h){const r=rel(h.id,true),t=tierOf(r.pts);return'<div class="socHead"><div class="socPor"></div><div><b>'+h.nom+(isBday(h)?' 🎂':'')+'</b><small>'+h.trait+'</small><div class="socGauge"><i><u style="width:'+r.pts+'%"></u></i><span>'+tierName(r.pts,h.g)+' · '+Math.round(r.pts)+' / 100</span></div></div><button class="socX" aria-label="Fermer">✕</button></div>'}
function render(){const id=UI.open,h=HB(id);if(!h)return;const card=over().querySelector('.socCard'),r=rel(id,true);
 const inv=SO().inv,hasInv=inv&&inv.id==id&&(N.day||1)-inv.d<=1&&!OUT;
 if(UI.view=='main'){card.innerHTML=head(h)+'<p class="socSay">'+UI.say+'</p><div class="socBtns">'+(hasInv?'<button data-a="acc" class="wide go">Accepter son invitation : '+SORT[inv.k].n+'</button>':'')+'<button data-a="talk">Discuter</button><button data-a="know">Faire connaissance</button><button data-a="gift">Offrir un cadeau</button><button data-a="out">Proposer une sortie</button><button data-a="prof" class="wide">Consulter son profil</button></div>'}
 if(UI.view=='gift'){const L=gifts();card.innerHTML=head(h)+'<p class="socSay">'+(UI.sel?'Offrir <b>'+UI.sel.n+'</b> à '+h.nom+' ?':'Que veux-tu offrir à '+h.nom+' ?')+'</p>'+(UI.sel?'<div class="socBtns"><button data-a="ok" class="go">Oui, offrir</button><button data-a="cancel">Annuler</button></div>':
  (L.length?'<div class="socList">'+L.map((g,i)=>'<button data-g="'+i+'"><b>'+g.n+'</b><small>×'+g.c+(r.pref[g.n]?' · '+{love:'adore',like:'aime',neutral:'neutre',hate:'n’aime pas'}[r.pref[g.n]]:'')+'</small></button>').join('')+'</div>':'<p class="socHint">Rien à offrir pour l’instant : achète de quoi manger dans la boutique de la maison, ou range un objet de déco.</p>')+'<div class="socBtns"><button data-a="back">Retour</button></div>');UI.gl=L}
 if(UI.view=='out'){card.innerHTML=head(h)+'<p class="socSay">Que proposes-tu à '+h.nom+' ?</p><div class="socList">'+Object.keys(SORT).map(k=>{const S=SORT[k],c=canInvite(h,k),fav=h.sorties.includes(k);return'<button data-o="'+k+'"'+(c.ok?'':' disabled')+'><b>'+S.n+(fav?' ★':'')+'</b><small>'+(c.ok?S.txt:c.why)+'</small></button>'}).join('')+'</div><div class="socBtns"><button data-a="back">Retour</button></div>'}
 if(UI.view=='prof'){card.innerHTML=head(h)+profHTML(h)+'<div class="socBtns"><button data-a="back">Retour</button></div>'}
 const pc=card.querySelector('.socPor');if(pc){pc.append(portrait(id,64))}
 card.querySelector('.socX').onclick=closeCard;card.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
 card.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{UI.sel=UI.gl[+b.dataset.g];sfx('rsTick');render()});
 card.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const k=b.dataset.o,res=invite(id,k);UI.view='main';UI.say=(res.ok?'':'')+res.txt;render();if(res.ok){setTimeout(()=>{if(UI.open==id)closeCard()},900);if(k=='maison'&&!STV.on&&place=='home')visitStart(id)}})}
function act(a){const id=UI.open,h=HB(id);if(a=='talk'){const r=talk(id);UI.say=r.txt+(r.tired?' <i>(Vous avez déjà beaucoup parlé.)</i>':'')}
 if(a=='know'){const r=know(id);UI.say=r.txt+(r.fact?' <i>(nouveau souvenir dans son profil)</i>':'')}
 if(a=='gift'){UI.view='gift';UI.sel=null}
 if(a=='ok'&&UI.sel){const res=give(id,UI.sel);UI.view='main';UI.sel=null;UI.say=res?res.txt:'Cet objet n’est plus disponible.'}
 if(a=='cancel'){UI.sel=null}
 if(a=='acc'){const inv=SO().inv;if(inv&&inv.id==id){SO().inv=null;OUT={id,k:inv.k,ph:'go',did:false,t:0,dist:0,base:snapOut()};note(h.nom+' est ravi'+(h.g=='f'?'e':'')+' que tu acceptes !');UI.say='Génial ! Allons-y.';if(inv.k=='promenade')OUT.ph='on';else{const b=STC.buildings.find(x=>x.id==SORT[inv.k].b);if(STV.on&&b)STV.auto={x:stDoorX(b),then:()=>stEnterB(b)}}render();setTimeout(()=>{if(UI.open==id)closeCard()},900);return}}
 if(a=='out')UI.view='out';if(a=='prof')UI.view='prof';if(a=='back'){UI.view=UI.menu?'list':'main';UI.sel=null;if(UI.menu){renderMenu();return}}
 render()}
function nextSteps(h){const r=rel(h.id,true),L=[],t=tierOf(r.pts);if(t<4)L.push('Encore '+Math.ceil(TIERS[t+1][0]-r.pts)+' points pour devenir '+TIERS[t+1][1].toLowerCase()+'.');
 if(r.pts<20)L.push('Faites connaissance pour débloquer les sorties.');else if(r.pts<40)L.push('À 40 points, tu pourras l’inviter chez toi.');
 const left=h.faits.length-r.know.length;if(left)L.push(left+' chose'+(left>1?'s':'')+' à découvrir sur '+(h.g=='f'?'elle':'lui')+'.');
 const d=((h.anniv-mday())+30)%30;L.push(d==0?'C’est son anniversaire aujourd’hui !':'Anniversaire dans '+d+' jour'+(d>1?'s':'')+'.');
 const pr=period(),where=h.sched[pr];L.push('En ce moment : '+(where=='rue'?'dans la rue':where=='maison'?'chez '+(h.g=='f'?'elle':'lui'):'au lieu « '+((STC.buildings.find(b=>b.id==where)||{}).name||where).toLowerCase()+' »')+'.');return L}
function profHTML(h){const r=rel(h.id,true),pf=Object.keys(r.pref);return'<div class="socProf"><p class="socBio">'+h.bio+'</p>'+
 '<h4>Personnalité</h4><p>'+h.trait+' · lieux favoris : '+h.fav.map(b=>b=='rue'?'la rue':((STC.buildings.find(x=>x.id==b)||{}).name||b)).join(', ')+'</p>'+
 '<h4>Ce que tu sais</h4>'+(r.know.length?'<ul>'+r.know.map(i=>'<li>'+h.faits[i]+'</li>').join('')+'</ul>':'<p class="socHint">Fais connaissance pour en savoir plus.</p>')+
 '<h4>Cadeaux découverts</h4>'+(pf.length?'<p>'+pf.map(n=>'<span class="socTag '+r.pref[n]+'">'+n+' · '+{love:'adore',like:'aime',neutral:'neutre',hate:'déteste'}[r.pref[n]]+'</span>').join(' ')+'</p>':'<p class="socHint">Offre-lui quelque chose pour découvrir ses goûts.</p>')+
 '<h4>Souvenirs partagés</h4>'+(r.mem.length?'<ul>'+r.mem.slice(0,6).map(m=>'<li>Jour '+m.d+' · '+m.txt+'</li>').join('')+'</ul>':'<p class="socHint">Aucun souvenir pour l’instant.</p>')+
 '<h4>Prochaines possibilités</h4><ul>'+nextSteps(h).map(s=>'<li>'+s+'</li>').join('')+'</ul></div>'}
// fin de sortie : petite carte de conclusion
function showEnd(h,ok,g,txt){UI.open=h.id;UI.view='end';const card=over().querySelector('.socCard');card.innerHTML=head(h)+'<p class="socSay">'+txt+'</p><p class="socRes '+(ok?'ok':'')+'">'+(ok?'Sortie réussie':'Sortie écourtée')+' · amitié '+(g>=0?'+':'')+Math.round(g*10)/10+'</p><div class="socBtns"><button data-a="close" class="go">Super</button></div>';
 card.querySelector('.socPor').append(portrait(h.id,64));card.querySelector('.socX').onclick=closeCard;card.querySelector('[data-a="close"]').onclick=closeCard;const o=over();o.hidden=false;requestAnimationFrame(()=>o.classList.add('on'));if(STV.on)STV.modal=true;sfx(ok?'gmEnd':'rsTick')}
// ---------- menu « Mes amis » ----------
function openMenu(){UI.menu=true;UI.view='list';renderMenu();const o=over();o.hidden=false;requestAnimationFrame(()=>o.classList.add('on'));if(STV.on)STV.modal=true;sfx('rsPage')}
function renderMenu(){const card=over().querySelector('.socCard'),S=SO(),met=HAB.filter(h=>S.met[h.id]),unk=HAB.length-met.length;
 card.innerHTML='<div class="socHead"><div><b>Mes amis</b><small>Jour '+(N.day||1)+' · '+(period())+(isFete()?' · Fête de quartier !':'')+'</small></div><button class="socX" aria-label="Fermer">✕</button></div>'+
  '<div class="socFriends">'+(met.length?met.sort((a,b)=>S.met[b.id].pts-S.met[a.id].pts).map(h=>{const r=S.met[h.id];return'<button class="socF" data-id="'+h.id+'"><span class="socPor"></span><span class="socFT"><b>'+h.nom+(isBday(h)?' 🎂':'')+'</b><small>'+tierName(r.pts,h.g)+' · '+h.trait+'</small><i><u style="width:'+r.pts+'%"></u></i></span></button>'}).join(''):'<p class="socHint">Tu n’as encore rencontré personne : promène-toi dans la rue et touche un habitant pour lui parler.</p>')+'</div>'+
  (unk?'<p class="socHint">'+unk+' habitant'+(unk>1?'s':'')+' encore à rencontrer dans le quartier.</p>':'')+(S.notes.length?'<h4>Dernières nouvelles</h4><ul class="socNotes">'+S.notes.slice(0,5).map(n=>'<li>Jour '+n.d+' · '+n.t+'</li>').join('')+'</ul>':'');
 card.querySelectorAll('.socF').forEach(b=>{b.querySelector('.socPor').append(portrait(b.dataset.id,48));b.onclick=()=>{UI.open=b.dataset.id;UI.view='prof';render()}});card.querySelector('.socX').onclick=closeCard}
// ---------- sorties dans les lieux : le compagnon suit le joueur ----------
const CP={on:false,u:0,v:0,t:0,path:null,fl:false,fr:'idle',bub:null,bt:0,wait:0};
function cpEnter(){if(!OUT)return;CP.on=true;CP.id=OUT.id;CP.u=-.45;CP.v=DOORS[1];CP.path=null;CP.t=0;CP.enter=40;CP.a=0;CP.joined=false;OUT.ph='place';OUT.place=place;['idle','w0','w1','w2','w3','wave','dn0','dn1','dn2','dn3','dn4','dn6','cu0','cu3'].forEach(nm=>img(OUT.id,nm));try{doorT=1}catch(e){}}
function cpTick(){if(!CP.on||!OUT)return;CP.t++;if(CP.bt>0&&--CP.bt==0)CP.bub=null;
 if(CP.enter>0){CP.enter--;CP.u+=.05;CP.a=Math.min(1,CP.a+.05);if(CP.enter==0){CP.a=1;try{if(!['door','enter','leave'].includes(C.st))doorT=0}catch(e){}}return}
 const pu=C.x/12,pv=(C.y-88)/5,d=Math.hypot(pu-CP.u,pv-CP.v);
 if(CP.path){const w=CP.path[0],du=w[0]-CP.u,dv=w[1]-CP.v,l=Math.hypot(du,dv);if(Math.abs(du-dv)>.02)CP.fl=(du-dv)<0;if(l<=.05){CP.u=w[0];CP.v=w[1];CP.path.shift();if(!CP.path.length)CP.path=null}else{CP.u+=du/l*.05;CP.v+=dv/l*.05}return}
 if(d>2.2&&CP.t%20==0&&!(C.st=='rsit')){const tu=pu-.9,tv=pv+.6;try{CP.path=findPath([CP.u,CP.v],walkable(tu,tv)?[tu,tv]:[pu,pv])}catch(e){CP.path=null}if(CP.path&&CP.path.length&&Math.hypot(CP.path[CP.path.length-1][0]-pu,CP.path[CP.path.length-1][1]-pv)<.3)CP.path.pop()}
 if(!CP.path){CP.fl=(pu-CP.u)-(pv-CP.v)<0;if(CP.t%600==300){CP.bub=pick(['chat','love','hey']);CP.bt=90}}}
function cpDraw(f){if(!CP.on||!OUT)return;const mv=!!CP.path||CP.enter>0,nm=mv?'w'+(Math.floor(CP.t/7)%4):'idle',im=img(CP.id,nm)||img(CP.id,'idle');if(!im)return;const p=P3(CP.u,CP.v,0);rx.globalAlpha=CP.a==null?1:CP.a;gshadow(p[0],p[1],22);charDraw(im,p[0],p[1],CP.fl,CW,CH);rx.globalAlpha=1;
 if(CP.bub){const X=Math.round(p[0]),Y=Math.round(p[1])-130;bubble(rx,X,Y,CP.bub)}}
PLD.SComp=cpDraw;
function cpEntry(){if(!CP.on||CP.hide)return null;return{n:'SComp',s:0,x:CP.u,y:CP.v,w:0,h:.6}}
// à la maison, le décor vient des meubles du joueur : l'ami invité y est ajouté comme les animaux (trié en profondeur avec les meubles)
try{const _ab=aniBoxes;aniBoxes=function(){const L=_ab()||[];if(VS.on&&CP.on&&place=='home'){const e=cpEntry();if(e)return L.concat([e])}return L}}catch(e){}
// visite : le joueur est à la maison avec son invité (arrivée, discussion, départ)
const VS={on:false};
function visitStart(id){const h=HB(id);if(!OUT)OUT={id,k:'maison',ph:'go',did:false,t:0,dist:0,base:snapOut()};VS.on=true;VS.id=id;VS.st='knock';VS.t=0;VS.n=0;sfx('rsDoor',.8);say('Toc toc ! '+h.nom+' arrive à la porte.');
 ['idle','w0','w1','w2','w3','wave','dn0','dn6'].forEach(nm=>img(id,nm))}
function visitTick(){if(!VS.on)return;if(place!='home'){visitEnd(true);return}VS.t++;
 if(VS.st=='knock'&&VS.t>50){CP.on=true;CP.id=VS.id;CP.u=-.45;CP.v=DOORS[1];CP.t=0;CP.enter=40;CP.a=0;CP.path=null;CP.hide=false;VS.st='in';try{doorT=1}catch(e){}}
 if(VS.st=='in'&&CP.enter<=0&&VS.t>100){VS.st='talk';const h=HB(VS.id);UI.open=VS.id;UI.view='visit';UI.say=pick(['Coucou ! Merci de m’accueillir, c’est joli chez toi !','Wouah, c’est donc ici que tu vis ? J’adore !','Merci pour l’invitation ! Je peux entrer ?']);renderVisit();const o=over();o.hidden=false;requestAnimationFrame(()=>o.classList.add('on'));CP.bub='love';CP.bt=90}
 if(VS.st=='leave'){if(!CP.path&&CP.t%10==0){try{CP.path=findPath([CP.u,CP.v],[1.3,DOORS[1]])}catch(e){CP.path=[[1.3,DOORS[1]]]}VS.st='leaving'}}
 if(VS.st=='leaving'&&!CP.path){CP.u-=.05;CP.a=Math.max(0,CP.a-.05);try{doorT=1}catch(e){}if(CP.a<=0){try{doorT=0}catch(e){}visitEnd()}}}
function renderVisit(){const h=HB(VS.id),card=over().querySelector('.socCard'),food=FOODS.map((f,i)=>({n:f.n,i,c:(N.stock||[])[i]||0})).filter(f=>f.c>0);
 card.innerHTML=head(h)+'<p class="socSay">'+UI.say+'</p><div class="socBtns"><button data-v="talk">Discuter</button><button data-v="tour">Faire visiter</button>'+(food.length?food.map(f=>'<button data-v="eat" data-i="'+f.i+'">Partager : '+f.n+'</button>').join(''):'<button disabled>Rien à grignoter</button>')+'<button data-v="bye" class="wide go">Raccompagner '+h.nom+'</button></div>';
 card.querySelector('.socPor').append(portrait(h.id,64));card.querySelector('.socX').onclick=()=>visitAct('bye');card.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>visitAct(b.dataset.v,b.dataset.i))}
function visitAct(a,i){const h=HB(VS.id);if(!VS.on)return;
 if(a=='talk'){const r=talk(VS.id);UI.say=r.txt;VS.n++}
 if(a=='tour'){const F=N.furn.map(f=>f.n),pts=[];if(F.includes('Aquarium'))pts.push('Ton aquarium est magnifique !');if(F.some(n=>/Canapé/.test(n)))pts.push('Ce canapé a l’air si confortable.');if(F.includes('Plante'))pts.push('Les plantes rendent la pièce vivante.');if(F.includes('Télé'))pts.push('Belle télé ! On regarde un film un jour ?');if(F.some(n=>/Trophée/.test(n)))pts.push('Des trophées ? Impressionnant !');
  if(!pts.length)pts.push('C’est simple et chaleureux, j’aime bien.');UI.say=pick(pts)+' ('+F.length+' objets dans la pièce)';if(!VS.tour){VS.tour=1;gain(VS.id,2)}VS.n++}
 if(a=='eat'){const it={k:'food',i:+i,n:FOODS[+i].n};const res=give(VS.id,it);if(res){UI.say=res.txt+' ('+it.n+' partagé'+(it.n=='Pomme'?'e':'')+' ensemble)';add('happy',4);VS.n++;OUT&&(OUT.extra=it.n+' partagé')}}
 if(a=='bye'){if(VS.n>0&&OUT)OUT.did=true;VS.st='leave';UI.say=pick(['Merci pour ce moment, à bientôt !','C’était super, on se revoit vite !']);const o=over();o.classList.remove('on');setTimeout(()=>{o.hidden=true},200);UI.open=null;CP.bub='love';CP.bt=60;return}
 renderVisit()}
function visitEnd(abort){const id=VS.id;VS.on=false;CP.on=false;if(OUT&&OUT.k=='maison'){if(abort){OUT.did=OUT.did||false}conclude()}}
// ---------- événements sociaux (architecture extensible) ----------
const isFete=()=>(N.day||1)%7==0&&(period()=='soir'||period()=='jour');
const EV=[
 {id:'anniv',cd:30,each:1,cond:h=>isBday(h)&&rel(h.id),run:h=>note('🎂 C’est l’anniversaire de '+h.nom+' aujourd’hui ! Un cadeau lui ferait très plaisir.')},
 {id:'surprise',cd:5,each:1,cond:h=>(rel(h.id)||{pts:0}).pts>=80&&Math.random()<.35,run:h=>{const r=Math.random();if(r<.5){earn(10);note('🎁 '+h.nom+' t’a laissé une surprise : 10 pièces !')}else{const i=Math.floor(Math.random()*3);if((N.stock[i]||0)<9){N.stock[i]++;try{refreshChips()}catch(e){}}note('🎁 '+h.nom+' t’offre : '+FOODS[i].n+' !')}mem(h.id,'cadeau','Cadeau surprise reçu')}},
 {id:'invit',cd:3,each:1,cond:h=>(rel(h.id)||{pts:0}).pts>=60&&!OUT&&Math.random()<.25,run:h=>{SO().inv={id:h.id,d:N.day||1,k:pick(h.sorties.filter(k=>SORT[k].ok()&&k!='maison'))};note('💌 '+h.nom+' t’invite : '+SORT[SO().inv.k].txt.toLowerCase()+'. Va lui parler dans la rue !')}},
 {id:'fete',cd:7,each:0,cond:()=>isFete(),run:()=>note('🎉 Fête de quartier ce soir dans la rue : les habitants sont de sortie, les discussions comptent double !')},
 {id:'amis',cd:6,each:0,cond:()=>HAB.filter(h=>(rel(h.id)||{pts:0}).pts>=40).length>=2&&Math.random()<.3,run:()=>{const L=HAB.filter(h=>(rel(h.id)||{pts:0}).pts>=40),a=L[0],b=L[1];gain(a.id,2);gain(b.id,2);mem(a.id,'amis','Moment entre amis avec '+b.nom);mem(b.id,'amis','Moment entre amis avec '+a.nom);note('👋 '+a.nom+' et '+b.nom+' parlent de toi en bien : votre petit groupe d’amis se forme !')}}];
function evTick(){const S=SO(),day=N.day||1;if(S.evDay===day)return;S.evDay=day;// une fois par jour du jeu, conditions précises, délais entre deux fois
 for(const e of EV){const targets=e.each?HAB.filter(h=>rel(h.id)):[null];for(const h of targets){const k=e.id+(h?':'+h.id:'');if(S.ev[k]!=null&&day-S.ev[k]<e.cd)continue;try{if(e.cond(h)){S.ev[k]=day;e.run(h);}}catch(err){}}}save()}
// les habitants rendent visite d'eux-mêmes (bons amis, à la maison, pas trop souvent)
function homeVisitTick(){if(place!='home'||VS.on||OUT||C.st=='sleep'||curV!='home')return;const S=SO(),day=N.day||1;if(tick%600!=0)return;if(S.hv&&day-S.hv<3)return;
 const c=HAB.filter(h=>(rel(h.id)||{pts:0}).pts>=60);if(!c.length||Math.random()>.35)return;const h=pick(c);S.hv=day;OUT={id:h.id,k:'maison',ph:'go',did:false,t:0,dist:0,base:snapOut(),them:1};visitStart(h.id)}
// ---------- intégration aux lieux ----------
{const _ar=arrive;arrive=function(d){_ar(d);try{if(OUT&&OUT.k!='promenade'){const want=SORT[OUT.k].b=='sport'?'gym':SORT[OUT.k].b=='maison'?'home':SORT[OUT.k].b;if(d==want){if(d=='home'){OUT.ph='place';visitStart(OUT.id)}else{cpEnter();say(HB(OUT.id).nom+' entre avec toi.')}}else if(d!='street'){conclude(true)}}}catch(e){console.error(e)}}}
{const _up=update;update=function(){_up();try{if(!STV.on)prepTick(2);
  if(OUT&&OUT.ph=='place'&&!STV.on&&place){// ce qui compte comme « activité partagée »
   const b=OUT.base,k=OUT.k;if(k=='resto'){const rs=N.resto||{},pl=Object.values(rs.plats||{}).reduce((a,x)=>a+x,0);if(pl>b.plats||(rs.repas||0)>b.repas){OUT.did=true;OUT.extra='repas partagé'}
    // le compagnon rejoint la table du joueur
    if(window.RESTO&&!CP.joined&&C.st=='rsit'){const R0=RESTO.R,me=R0.me,s=me&&me.seat;if(s){const o=s.f.seats.find(x=>x!==s&&!x.who&&!x.res);if(o){const h=HB(OUT.id);let li=RESTO.LOOKS.findIndex(L=>L.__soc==h.id);if(li<0){li=RESTO.LOOKS.push(Object.assign({__soc:h.id},h.look))-1}const d=RESTO.newClient(o,false,li);d.u=CP.u;d.v=CP.v;d.a=1;CP.joined=true;CP.hide=true;say(h.nom+' s’installe à ta table.')}}}}
   if(k=='sport'){const a=(N.sport&&N.sport.tot&&N.sport.tot.acts)||0;if(a>b.acts){OUT.did=true;OUT.extra='entraînement à deux';if(!OUT.cheer){OUT.cheer=1;CP.bub='love';CP.bt=90}}if(window.GYM&&GYM.GM&&!GYM.GM.res&&CP.t%240==0){CP.bub='hey';CP.bt=60}}
   cpTick();if(CP.on&&place!='home'&&PLACES[place]){const L=PLACES[place].furn.filter(f=>f.n!='SComp'),e=cpEntry();PLACES[place].furn=e?L.concat([e]):L}}
  if(VS.on){visitTick();cpTick()}homeVisitTick();
  // arcade et bowling (jeux plein écran) : une partie jouée ensemble compte
  if(OUT&&(OUT.k=='arcade'||OUT.k=='bowling')){const on=OUT.k=='arcade'?(typeof ARC!='undefined'&&ARC.on):(typeof BW!='undefined'&&BW.on);if(on){OUT.ph='in';cpBadge(true);if(OUT.k=='arcade'&&ARC.state=='over'){OUT.did=true;OUT.extra='partie à la borne'}}else cpBadge(false)}else cpBadge(false)
  if(OUT&&OUT.ph=='place'&&STV.on){OUT.ph='in'}
 }catch(e){console.error(e)}}}
// conclusion des sorties dans un lieu : au retour dans la rue
{const _se=streetEnter;streetEnter=function(x){CP.on=false;CP.hide=false;const r=_se(x);if(OUT&&OUT.ph=='place')OUT.ph='in';return r}}
try{const _bwe=bwEnd;bwEnd=function(s){if(s&&OUT&&OUT.k=='bowling'){OUT.did=true;OUT.extra='partie complète'}return _bwe(s)}}catch(e){}
// petit badge pendant l'arcade et le bowling (le compagnon encourage)
function cpBadge(on){let b=document.getElementById('socBadge');if(!on){if(b)b.hidden=true;return}if(!b){b=el('div','socBadge');b.id='socBadge';document.body.appendChild(b)}if(b.hidden||b.dataset.id!=OUT.id){b.dataset.id=OUT.id;b.innerHTML='';b.append(portrait(OUT.id,40));b.append(el('span',null,HB(OUT.id).nom+' joue avec toi'))}b.hidden=false}
// ---------- branchements : tuile « Mes amis », toucher dans la rue ----------
(function init(){const cv=document.getElementById('stCv');if(cv)cv.addEventListener('pointerdown',stTapS,true);
 const out=document.querySelector('#v-out .gog');if(out&&!out.querySelector('[data-go="amis"]')){const t=document.createElement('button');t.className='tile';t.dataset.go='amis';t.innerHTML='<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.6"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M15 14.6c2.8-.3 5.6 1.3 6.3 4.9"/></svg>Mes amis<small>Habitants rencontrés</small>';out.appendChild(t);t.onclick=e=>{e.stopPropagation();openMenu()}}
 addEventListener('keydown',e=>{if(!STV.on||UI.open||STV.modal)return;if(e.code=='KeyT'){const w=nearW();if(w){e.preventDefault();openCard(w.id)}}})})();
window.SOCIAL={mem,note,rel2:rel,HAB,HB,SO,rel,tierOf,tierName,gain,talk,know,gifts,give,invite,conclude,openCard,closeCard,openMenu,period,mday,isBday,isFete,EV,evTick,ST,CP,VS,visitStart,visitAct,line,portrait,prefOf,SORT,canInvite,UI,get OUT(){return OUT},set OUT(v){OUT=v},nearW,img,act,endWalk}})();
