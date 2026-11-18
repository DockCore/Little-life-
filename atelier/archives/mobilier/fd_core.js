// ===== MOBILIER : registre commun =====
// Chaque meuble déclare ici sa catégorie, son prix, ses orientations et ses parties personnalisables.
// Achat, revente, couleurs, rangement et sauvegarde se servent tous de ce registre : un nouveau meuble n'a qu'à s'y inscrire.
const FCATS=[['all','Tout'],['sofa','Canapés et fauteuils'],['bed','Lits et literie'],['table','Tables et chaises'],['store','Rangements'],['rug','Tapis'],['light','Éclairage'],['deco','Décoration'],['other','Autres meubles']];
// tons d'une couleur : base, dessus, arête, ombre, ombre forte, clair, nuance
const tn=(b,x)=>Object.assign({b,t:mx(b,'#fff',.14),e:mx(b,'#fff',.28),d:mx(b,'#000',.2),dd:mx(b,'#000',.4),l:mx(b,'#fff',.45),s:mx(b,'#fff',.07)},x||{});
const PWOOD=[['Chêne','#b07a48'],['Bois clair','#d2a878'],['Bois foncé','#4a2e24'],['Blanc','#ece6dc'],['Noir','#2c2a30'],['Gris','#8a8f98'],['Vert sauge','#7f9a76'],['Bleu','#4f6f9a']],
 PFAB=[['Bleu','#3f6fb0'],['Crème','#e7d3bf'],['Gris clair','#b9bdc5'],['Gris foncé','#5c606a'],['Vert sauge','#8da57c'],['Moutarde','#d9a03a'],['Terracotta','#c7623e'],['Rose','#d593a3'],['Noir','#302d34'],['Blanc','#f4f1ec']],
 PMET=[['Laiton','#c0a060'],['Argent','#b9c0c8'],['Noir','#2c2a30'],['Cuivre','#b8734a'],['Blanc','#ece6dc']],
 PPOT=[['Terre cuite','#a65d45'],['Blanc','#e8e4dc'],['Noir','#2c2a30'],['Vert sauge','#7f9a76'],['Bleu','#4f6f9a'],['Moutarde','#d9a03a'],['Rose','#d593a3']],
 PRUG=[['Bleu nuit','#34445B'],['Crème','#e2d4bc'],['Terracotta','#a8563f'],['Vert sauge','#6f8a6a'],['Gris','#7d828c'],['Bordeaux','#7c3a40'],['Moutarde','#c9a040'],['Rose','#c98f9a']],
 PSHADE=[['Ambre','#efb35f'],['Crème','#efe2cc'],['Blanc','#f4f1ec'],['Vert sauge','#a9c29a'],['Bleu','#8fb0d9'],['Rose','#e7aab8'],['Terracotta','#d9825f']];
// la première couleur de chaque partie est celle d'origine (tons exacts du dessin), puis la liste commune
const fpal=(def,list)=>[def].concat(list.filter(e=>e[0]!=def[0]&&e[1].toLowerCase()!=def[1].toLowerCase()));
const FD={
 'Lit':{cat:'bed',p:150,w:3,h:6,c:'#F0D9BC',d:'Grand lit douillet',warn:'Sans lit, {N} ne pourra plus dormir.',parts:[{k:'s',n:'Structure',pal:fpal(['Noyer','#4a2e28',{d:'#3a2420',t:'#5a3a30'}],PWOOD)},{k:'l',n:'Literie',pal:fpal(['Bleu','#3f6fb0',{t:'#4776b8',s:'#4a7cc0',l:'#cfe0f5'}],PFAB)}]},
 'Table de chevet':{cat:'bed',p:40,w:1,h:1,c:'#8a5640',d:'Avec sa petite lampe',rots:[0,1,2,3],build:f=>fbChevet(f),parts:[{k:'b',n:'Bois',pal:fpal(['Noyer','#8a5640'],PWOOD)},{k:'f',n:'Façade',pal:fpal(['Crème','#e7d3bf'],PWOOD.concat(PFAB))},{k:'h',n:'Poignées',pal:PMET}]},
 'Bureau':{cat:'table',p:140,w:3,h:2,c:'#7a4a38',d:'Pour télétravailler',warn:'Sans bureau, plus de télétravail : « Ma maison » ouvrira la déco.',parts:[{k:'b',n:'Bois',pal:fpal(['Noyer','#8a5640',{t:'#a06a52',e:'#b8806a',d:'#6b3e30',dd:'#432a20'}],PWOOD)},{k:'c',n:'Chaise',pal:fpal(['Bleu nuit','#3a4a66',{t:'#4f6288'}],PFAB)}]},
 'Table':{cat:'table',p:90,w:4,h:2,c:'#b8794f',d:'Table et sa chaise',warn:'Sans table, {N} ne pourra plus manger assis.',parts:[{k:'p',n:'Plateau',pal:fpal(['Merisier','#b8794f',{t:'#c58f66',e:'#d9a57a',d:'#946354'}],PWOOD)},{k:'a',n:'Assise',pal:fpal(['Merisier','#a06a52',{t:'#c58f66',d:'#8e5f55'}],PFAB.concat(PWOOD))},{k:'f',n:'Pieds et structure',pal:fpal(['Prune','#694c4c'],PWOOD)}]},
 'Chaise':{cat:'table',p:30,w:1,h:1,c:'#a06a52',d:'Une chaise en plus',rots:[0,1,2,3],build:f=>fbChaise(f),parts:[{k:'a',n:'Assise',pal:fpal(['Moutarde','#d9a03a'],PFAB)},{k:'s',n:'Pieds et structure',pal:fpal(['Noyer','#6b3e30'],PWOOD.concat(PMET))}]},
 'Canapé':{cat:'sofa',p:120,w:3,h:1,c:'#3f6fb0',d:'Pour se reposer',parts:[{k:'t',n:'Tissu',pal:fpal(['Bleu','#3f6fb0',{t:'#5a8ad0',d:'#2a4f86'}],PFAB)}]},
 'Canapé cosy':{cat:'sofa',p:180,w:5,h:2,c:'#e7d3bf',d:'Trois places, coussins et plaid',rots:[0,1,2,3],seat:{long:1,word:'le canapé'},build:f=>czParts(f),parts:[{k:'k',prop:'k',n:'Tissu',pal:CZF},{k:'ck',prop:'ck',n:'Coussins',pal:CZC},{k:'pk',prop:'pk',n:'Plaid',pal:CZP}]},
 'Fauteuil':{cat:'sofa',p:90,w:2,h:2,c:'#c7623e',d:'Un fauteuil bien moelleux',rots:[0,1,2,3],seat:{word:'le fauteuil'},build:f=>fbFauteuil(f),parts:[{k:'t',n:'Tissu',pal:fpal(['Terracotta','#c7623e'],PFAB)},{k:'p',n:'Pieds',pal:fpal(['Noyer','#7a4a30'],PWOOD.concat(PMET))}]},
 'Pouf':{cat:'sofa',p:35,w:1,h:1,c:'#d0623f',d:'Pouf poire tout mou',parts:[{k:'t',n:'Tissu',pal:fpal(['Terracotta','#d0623f'],PFAB)}]},
 'Bibliothèque':{cat:'store',p:80,w:2,h:1,c:'#6b3e30',d:'Pleine de livres',parts:[{k:'b',n:'Bois',pal:fpal(['Noyer','#6b3e30',{t:'#8a5640',dd:'#3a2420'}],PWOOD)}]},
 'Commode':{cat:'store',p:110,w:2,h:1,c:'#b07a48',d:'Trois tiroirs bien rangés',rots:[0,1,2,3],build:f=>fbCommode(f),parts:[{k:'b',n:'Bois',pal:fpal(['Chêne','#b07a48'],PWOOD)},{k:'f',n:'Façades',pal:fpal(['Blanc','#ece6dc'],PWOOD.concat(PFAB))},{k:'h',n:'Poignées',pal:PMET}]},
 'Armoire':{cat:'store',p:160,w:2,h:1,c:'#8a5640',d:'Grande penderie à deux portes',rots:[0,1,2,3],build:f=>fbArmoire(f),parts:[{k:'b',n:'Bois',pal:fpal(['Noyer','#8a5640'],PWOOD)},{k:'f',n:'Façades',pal:fpal(['Noyer clair','#a8714f'],PWOOD.concat(PFAB))},{k:'h',n:'Poignées',pal:PMET}]},
 'Tapis':{cat:'rug',p:45,w:5,h:4,c:'#34445B',s:0,d:'Doux sous les pieds',parts:[{k:'f',n:'Fond',pal:fpal(['Bleu nuit','#34445B',{s:'#3d5069',t:'#3a4d66'}],PRUG)},{k:'m',n:'Motif',motif:1,pal:[['Classique'],['Uni'],['Rayures'],['Losanges'],['Damier']]},{k:'a',n:'Accent',pal:fpal(['Ambre','#E9A45F'],PRUG.concat([['Blanc','#f4f1ec']]))}]},
 'Lampe':{cat:'light',p:40,w:1,h:1,c:'#E9A45F',d:'Lampe sur pied, chaude le soir',parts:[{k:'a',n:'Abat-jour',pal:fpal(['Ambre','#efb35f',{d:'#d98f45',l:'#f8d08c',o1:'#ffe39a',o2:'#ffd27a',o3:'#fff6d0',rim:'#c47b3a'}],PSHADE)},{k:'p',n:'Pied',pal:fpal(['Brun','#3a2a24',{t:'#5a4034'}],PMET.concat(PWOOD))}]},
 'Plante':{cat:'deco',p:30,w:1,h:1,c:'#5f8f6b',d:'Un peu de vert',parts:[{k:'p',n:'Pot',pal:fpal(['Terre cuite','#a65d45',{o:'#7e4535',l:'#c47b60'}],PPOT)}]},
 'Miroir':{cat:'deco',p:45,w:1,h:1,c:'#c0a060',d:'Pour s’admirer et s’habiller',parts:[{k:'c',n:'Cadre',pal:fpal(['Laiton','#c0a060',{t:'#d8bc80'}],PMET.concat(PWOOD))}]},
 'Aquarium':{cat:'deco',p:200,w:2,h:1,c:'#5fb7d6',d:'Avec trois poissons',parts:[{k:'m',n:'Meuble',pal:fpal(['Ébène','#3a2a24',{t:'#5a4034'}],PWOOD)}]},
 'Télé':{cat:'other',p:150,w:2,h:1,c:'#26304a',d:'À regarder du canapé',parts:[{k:'m',n:'Meuble',pal:fpal(['Noyer','#5a4034',{t:'#7a5644'}],PWOOD)}]},
 'Douche':{cat:'other',p:160,w:3,h:3,c:'#bfe3f2',d:'Pour sentir bon',warn:'Sans douche, {N} ne pourra plus se laver.'},
 'WC':{cat:'other',p:120,w:2,h:2,c:'#e8eef2',d:'Indispensable, au fond',warn:'Sans toilettes, {N} ne pourra plus y aller.'}};
const fDef=n=>FD[n]||null,fCat=n=>(FD[n]||{}).cat||'other',fParts=f=>((FD[f.n]||{}).parts)||[],fRots=n=>(FD[n]&&FD[n].rots)||ROTS[n]||[0,1];
const fResale=n=>Math.max(5,Math.round(((FD[n]||{}).p||(SHOP.find(s=>s.n==n)||{p:20}).p)/2));
function fIdx(f,k){const P=fParts(f).find(p=>p.k==k);if(!P)return 0;const i=P.prop?(f[P.prop]|0):((f.cl&&f.cl[k])|0);return i>=0&&i<P.pal.length?i:0}
const FTM=new Map();
function fT(f,k){const P=fParts(f).find(p=>p.k==k);if(!P)return tn('#888888');const e=P.pal[fIdx(f,k)],key=e[1]+JSON.stringify(e[2]||0);let t=FTM.get(key);if(!t){t=tn(e[1],e[2]);FTM.set(key,t)}return t}
function fSet(f,k,i){const P=fParts(f).find(p=>p.k==k);if(!P)return;if(P.prop)f[P.prop]=i;else{f.cl=f.cl||{};f.cl[k]=i}const m=fParts(f)[0];if(m&&!m.motif&&m.pal[fIdx(f,m.k)][1])f.c=m.pal[fIdx(f,m.k)][1]}
const fNewId=()=>'f'+Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36);
// nouveau meuble posé : identifiant + couleurs gardées s'il sortait de l'inventaire
function fNew(f){f.id=f.id||fNewId();const st=N.fKeep&&N.fKeep[f.n],k=st&&st.pop();if(k){if(k.cl)f.cl=k.cl;['k','ck','pk'].forEach(p=>{if(k[p]!=null)f[p]=k[p]})}if(czIs(f)){f.k=f.k|0;f.ck=f.ck|0;f.pk=f.pk|0}const m=fParts(f)[0];if(m&&!m.motif&&m.pal[fIdx(f,m.k)][1])f.c=m.pal[fIdx(f,m.k)][1]}
// --- dessin générique des meubles « en pièces » (4 vraies orientations) ---
function gPt(f,a,d){const df=FD[f.n],L=df.w,D=df.h,r=f.r||0,x=f.x,y=f.y;return r==0?[x+a,y+d]:r==1?[x+d,y+L-a]:r==2?[x+L-a,y+D-d]:[x+D-d,y+a]}
function gBox(f,a0,a1,d0,d1){const p=gPt(f,a0,d0),q=gPt(f,a1,d1);return[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.abs(q[0]-p[0]),Math.abs(q[1]-p[1])]}
function gMake(f,main){const parts=[],OL=mx(main,'#1a1014',.72);
 const B=(a0,a1,d0,d1,z,h,T,g,ol)=>{const[u,v,w,d]=gBox(f,a0,a1,d0,d1);parts.push({u,v,w,d,z,h,g:g||'b',dr:()=>czB3(u,v,w,d,z,h,T.b,{t:T.t,l:T.b,r:T.d,e:T.e},ol===0?null:OL)})};
 return{parts,OL,B}}
function fbFauteuil(f){const T=fT(f,'t'),P=fT(f,'p'),{parts,OL,B}=gMake(f,T.b),Td=tn(T.d);
 [[.12,.12],[1.68,.12],[.12,1.68],[1.68,1.68]].forEach(([a,d])=>B(a,a+.2,d,d+.2,0,3,P,'b',0));
 B(.45,1.55,.45,2,3,7,Td);B(.45,1.55,0,.45,3,29,T,'k');B(.5,1.5,.45,.82,14,15,T,'k');
 B(0,.45,0,2,3,19,T);B(1.55,2,0,2,3,19,T);B(.5,1.5,.82,1.98,10,6,tn(T.b,{t:mx(T.b,'#fff',.2)}));return{parts,OL}}
function fbChevet(f){const W=fT(f,'b'),F=fT(f,'f'),H=fT(f,'h'),{parts,OL,B}=gMake(f,W.b);
 [[.1,.12],[.74,.12],[.1,.72],[.74,.72]].forEach(([a,d])=>B(a,a+.14,d,d+.14,0,2,tn(W.dd),'b',0));
 B(.08,.92,.1,.88,2,15,W);B(.16,.84,.88,.92,9.5,5.5,F);B(.16,.84,.88,.92,3.5,5,F);B(.45,.55,.92,.96,11.6,1.2,H,'b',0);B(.45,.55,.92,.96,5.4,1.2,H,'b',0);
 B(.04,.96,.06,.92,17,2,W);B(.4,.6,.38,.58,19,1,tn('#3a2a24'),'b',0);B(.48,.52,.46,.5,20,5,tn('#3a2a24'),'b',0);B(.32,.68,.3,.66,25,6,tn('#efb35f'));return{parts,OL}}
function fbChaise(f){const A=fT(f,'a'),S=fT(f,'s'),{parts,OL,B}=gMake(f,S.b);
 [[.18,.2],[.72,.2],[.18,.74],[.72,.74]].forEach(([a,d])=>B(a,a+.1,d,d+.1,0,12,S,'b',0));
 B(.15,.85,.18,.86,12,2.5,A);B(.17,.27,.14,.26,14.5,17,S,'k');B(.73,.83,.14,.26,14.5,17,S,'k');B(.27,.73,.15,.25,21,9,A,'k');return{parts,OL}}
function fbCommode(f){const W=fT(f,'b'),F=fT(f,'f'),H=fT(f,'h'),{parts,OL,B}=gMake(f,W.b);
 [[.1,.14],[1.76,.14],[.1,.76],[1.76,.76]].forEach(([a,d])=>B(a,a+.14,d,d+.14,0,3,tn(W.dd),'b',0));
 B(.05,1.95,.08,.92,3,19,W);[[4.4,5],[10.4,5],[16.4,5]].forEach(([z,h])=>{B(.14,1.86,.92,.96,z,h,F);B(.86,1.14,.96,1,z+h/2-.6,1.2,H,'b',0)});
 B(0,2,.04,.98,22,2,W);return{parts,OL}}
function fbArmoire(f){const W=fT(f,'b'),F=fT(f,'f'),H=fT(f,'h'),{parts,OL,B}=gMake(f,W.b);
 B(0,2,.04,.98,0,2,tn(W.dd));B(.05,1.95,.08,.92,2,48,W);B(.12,.985,.92,.96,4,44,F);B(1.015,1.88,.92,.96,4,44,F);
 B(.86,.92,.96,1,23,7,H,'b',0);B(1.08,1.14,.96,1,23,7,H,'b',0);B(0,2,.04,.98,50,3,W);return{parts,OL}}
