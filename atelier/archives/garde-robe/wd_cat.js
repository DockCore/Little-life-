// --- catalogue : première collection (g : m = garçon, f = fille, u = les deux ; p = prix, 0 = offert ; col = collection) ---
const WPC={
 tee:[['Blanc','#efede8'],['Noir','#2c2c33'],['Gris chiné','#9a9ca4'],['Marine','#2b3c6b'],['Rouge','#c23b38'],['Vert sauge','#7f9a76'],['Moutarde','#d9a03a'],['Rose','#e7a4b4'],['Ciel','#8fb6dd'],['Terracotta','#c7623e']],
 shirt:[['Blanc','#f1efe9'],['Ciel','#a9c6e6'],['Rose pâle','#f0c9cf'],['Sable','#d9c7a4'],['Noir','#2c2c33'],['Kaki','#7a7a52']],
 flan:[['Rouge','#b8453d'],['Vert','#4f7a55'],['Bleu','#3f5f8f'],['Moutarde','#c9a040']],
 knit:[['Crème','#e8dcc0'],['Sapin','#3f6f52'],['Bordeaux','#7c2b3a'],['Marine','#26304a'],['Moutarde','#d9a03a'],['Gris','#8a8d96'],['Rose','#d98aa8'],['Ciel','#7fb0e0']],
 sport:[['Gris chiné','#9a9ca4'],['Noir','#2a2a32'],['Marine','#26304a'],['Rouge','#c23b38'],['Vert','#4f9f6a'],['Lilas','#9a86c8'],['Rose','#e087a6']],
 denim:[['Brut','#2f4a78'],['Délavé','#6d8fbf'],['Noir','#2a2c34'],['Gris','#7d838f'],['Blanc','#e8e4dc']],
 chino:[['Beige','#c8b48c'],['Kaki','#7a7a52'],['Marine','#273a66'],['Bordeaux','#6c2a35'],['Gris','#6d7080'],['Noir','#26262e']],
 skirt:[['Noir','#2a2a32'],['Marine','#26304a'],['Rouge','#b8453d'],['Rose','#e7a4b4'],['Moutarde','#d9a03a'],['Vert sauge','#7f9a76'],['Écossais','#7c2b3a']],
 dress:[['Bleu ciel','#8fb6dd'],['Jaune','#e8c86a'],['Corail','#e07a6a'],['Lilas','#b6a2d8'],['Vert d’eau','#8cc4b0'],['Noir','#2a2a32'],['Rouge','#b83a3a']],
 coat:[['Camel','#b8875a'],['Noir','#26262e'],['Gris','#6d7080'],['Marine','#26304a'],['Bordeaux','#6c2a35'],['Vert sapin','#2f5a44']],
 puffer:[['Noir','#26262e'],['Rouge','#c23b38'],['Jaune','#e0b23c'],['Marine','#26304a'],['Kaki','#6f6f45'],['Lilas','#9a86c8']],
 shoe:[['Blanc','#ece8df'],['Noir','#2e2c38'],['Gris','#8a8a96'],['Rouge','#c8403a'],['Bleu','#3f6fd0'],['Vert','#4f9f6a'],['Rose','#e087a6']],
 leather:[['Cognac','#8a5434'],['Noir','#2a2228'],['Chocolat','#5a3a2a'],['Sable','#c8b090']],
 wool:[['Rouge','#c23b38'],['Crème','#e8dcc0'],['Moutarde','#d9a03a'],['Gris','#8a8d96'],['Vert','#3f6f52'],['Marine','#26304a']],
 gold:[['Or','#d6b05a']],
 band:[['Rouge','#c8403a'],['Rose','#e087a6'],['Noir','#2a2a32'],['Blanc','#f1efe9'],['Moutarde','#e0b23c']]};
const WSLOTS=[['haut','Hauts'],['bas','Bas'],['robe','Robes et jupes'],['veste','Vestes et manteaux'],['chaussures','Chaussures'],['acc','Accessoires'],['cheveux','Coiffures'],['tenues','Tenues'],['ens','Ensembles']];
const WCAT={};
[
 // hauts
 ['tee','haut','T-shirt','u',0,'Essentiels','tee',{t:1,a:.42,fx:['collar']}],
 ['teev','haut','T-shirt col V','u',15,'Essentiels','tee',{t:1,a:.42,fx:['vneck']}],
 ['tank','haut','Débardeur','u',10,'Été','tee',{t:1,a:0,fx:['tank']}],
 ['crop','haut','Crop top','f',20,'Été','tee',{t:1,tl:.55,a:.32}],
 ['mari','haut','Marinière','u',30,'Ville','shirt',{t:1,a:.95,pat:'stripes',fx:['cuffs']},'#26304a'],
 ['shirt','haut','Chemise','u',35,'Ville','shirt',{t:1,a:.97,hp:1,hl:1,fx:['wcollar','buttons','cuffs']}],
 ['flan','haut','Chemise à carreaux','u',40,'Ville','flan',{t:1,a:.97,hp:1,hl:1,pat:'check',fx:['collar','buttons']},'#f1efe9'],
 ['blouse','haut','Blouse','f',35,'Ville','shirt',{t:1,a:.72,fx:['wcollar','buttons']}],
 ['polo','haut','Polo','m',30,'Ville','tee',{t:1,a:.42,fx:['collar','placket']}],
 ['pull','haut','Pull','u',45,'Hiver','knit',{t:1,a:.97,hp:1,hl:.95,pat:'knit',fx:['cuffs']}],
 ['roll','haut','Pull col roulé','u',55,'Hiver','knit',{t:1,nk:1,a:.97,hp:1,hl:.95,pat:'rib',fx:['cuffs']}],
 ['hoodie','haut','Sweat à capuche','u',50,'Sport','sport',{t:1,a:.97,hp:1,fx:['pocket','cords','cuffs']},'#f1efe9'],
 // bas
 ['jean','bas','Jean','u',0,'Essentiels','denim',{hp:1,l:1,pat:'denim',fx:['seams','pockets','belt']}],
 ['chino','bas','Pantalon chino','u',30,'Ville','chino',{hp:1,l:1,fx:['crease','pockets']}],
 ['jog','bas','Jogging','u',30,'Sport','sport',{hp:1,l:1,fx:['sidestripe','cuffleg']},'#f1efe9'],
 ['cargo','bas','Pantalon cargo','m',40,'Ville','chino',{hp:1,l:1,pat:'camo',fx:['cargo','belt']}],
 ['short','bas','Short','u',15,'Été','chino',{hp:1,l:.32,fx:['hem']}],
 ['bermuda','bas','Bermuda','m',20,'Été','denim',{hp:1,l:.55,pat:'denim',fx:['hem','seams']}],
 ['shortj','bas','Short en jean','f',20,'Été','denim',{hp:1,l:.24,pat:'denim',fx:['seams']}],
 ['legging','bas','Legging','f',20,'Sport','sport',{hp:1,l:.97}],
 // robes et jupes (filles)
 ['jupe','bas','Jupe courte','f',0,'Essentiels','skirt',{hp:1,l:.34,ext:1,fx:['hem']},null,'robe'],
 ['plisse','bas','Jupe plissée','f',30,'Ville','skirt',{hp:1,l:.46,ext:2,pat:'pleats'},null,'robe'],
 ['longue','bas','Jupe longue','f',35,'Ville','dress',{hp:1,l:.92,ext:2,pat:'flowers'},null,'robe'],
 ['rete','robe','Robe d’été','f',45,'Été','dress',{t:1,a:0,hp:1,l:.42,ext:2,pat:'dots',fx:['straps']}],
 ['rpull','robe','Robe pull','f',55,'Hiver','knit',{t:1,nk:1,a:.97,hp:1,l:.36,ext:1,pat:'knit',fx:['cuffs']}],
 ['rsoir','robe','Robe de soirée','f',80,'Soirée','dress',{t:1,a:0,hp:1,l:.96,ext:2,fx:['tank','shine']}],
 // vestes et manteaux
 ['vjean','veste','Veste en jean','u',50,'Ville','denim',{t:1,a:.97,open:1,pat:'denim',fx:['collar','cuffs']}],
 ['blouson','veste','Blouson','u',60,'Ville','leather',{t:1,a:.97,hp:1,hl:.9,fx:['zip','furcollar','cuffs']}],
 ['blazer','veste','Blazer','u',70,'Ville','coat',{t:1,a:.97,hp:1,open:1,fx:['lapel','cuffs']}],
 ['cardi','veste','Gilet','u',40,'Hiver','knit',{t:1,a:.97,hp:1,open:1,pat:'knit',fx:['cuffs']}],
 ['manteau','veste','Manteau long','u',90,'Hiver','coat',{t:1,a:.97,hp:1,l:.55,ext:1,fx:['lapel','buttons','cuffs']},'#d6b05a'],
 ['doud','veste','Doudoune','u',80,'Hiver','puffer',{t:1,a:.97,hp:1,hl:.95,pat:'puffer',fx:['zip']}],
 // chaussures
 ['basket','chaussures','Baskets','u',0,'Essentiels','shoe',{f:1,fx:['sole','laces']},'#f6f3ec'],
 ['running','chaussures','Running','u',45,'Sport','shoe',{f:1,fx:['sole']},'#f6f3ec'],
 ['bottine','chaussures','Bottines','u',40,'Hiver','leather',{f:1,ank:1}],
 ['bottes','chaussures','Bottes hautes','f',60,'Hiver','leather',{f:1,lf:.5}],
 ['mocass','chaussures','Mocassins','m',35,'Ville','leather',{f:1,fx:['sole']},'#2a2228'],
 ['ballerine','chaussures','Ballerines','f',25,'Ville','shoe',{f:1}],
 ['sandale','chaussures','Sandales','u',20,'Été','leather',{f:1,fx:['sandal']}],
 // accessoires (casquette, bonnet, casque, lunettes : dessins d'origine image par image)
 ['casq','tete','Casquette','u',35,'Sport',null,{},null,'acc',{hat:'casq',k:'hac'}],
 ['bonnet','tete','Bonnet','u',30,'Hiver',null,{},null,'acc',{hat:'bonnet',k:'hac'}],
 ['phones','tete','Casque audio','u',90,'Ville',null,{},null,'acc',{hat:'phones',k:'phc'}],
 ['bandeau','tete','Bandeau','f',15,'Été','band',{acc:'band'},null,'acc'],
 ['glass','yeux','Lunettes','u',45,'Ville',null,{},null,'acc',{gl:'glass',k:'glc'}],
 ['sun','yeux','Lunettes de soleil','u',55,'Été',null,{},null,'acc',{gl:'sun',k:'glc'}],
 ['echarpe','cou','Écharpe','u',25,'Hiver','wool',{acc:'scarf'},null,'acc'],
 ['collier','bijou','Collier','f',30,'Soirée','gold',{acc:'necklace'},null,'acc'],
 ['ceinture','taille','Ceinture','u',20,'Ville','leather',{acc:'belt'},null,'acc'],
 ['sac','sac','Sac bandoulière','u',40,'Ville','leather',{acc:'bag'},null,'acc'],
 // coiffures (la couleur = couleur des cheveux du personnage)
 ['nat','cheveux','Naturelle','u',0,'Essentiels','hair',{hair:'none'}],
 ['mi','cheveux','Mi-longs','m',20,'Ville','hair',{hair:'mid'}],
 ['top','cheveux','Chignon haut','m',20,'Ville','hair',{hair:'top'}],
 ['long','cheveux','Cheveux longs','f',0,'Essentiels','hair',{hair:'long'}],
 ['bun','cheveux','Chignon','f',20,'Ville','hair',{hair:'bun'}],
 ['tails','cheveux','Couettes','f',20,'Été','hair',{hair:'tails'}]
].forEach(([id,slot,n,g,p,col,pal,S,c2,tab,leg])=>{WCAT[id]={id,slot,n,g,p,col,S:S||{},c2:c2||null,tab:tab||(slot=='tete'||slot=='yeux'||slot=='cou'||slot=='bijou'||slot=='taille'||slot=='sac'?'acc':slot),legacy:leg||null,
 pal:leg?(leg.k=='phc'?PHC.map((c,i)=>[PHN[i],c]):leg.k=='glc'?GLC.map((c,i)=>[GLN[i],c]):HATC.map((c,i)=>[HATN[i],c])):pal=='hair'?HRP.map((c,i)=>[HRN[i],c]):WPC[pal]}});
// ensembles (achat groupé avec remise, port en un geste)
const WENS=[
 {id:'e_ete',n:'Été tranquille',g:'u',its:['tank','short','sandale','sun'],col:'Été'},
 {id:'e_hiver',n:'Hiver douillet',g:'u',its:['roll','manteau','jean','bottine','echarpe','bonnet'],col:'Hiver'},
 {id:'e_sport',n:'Sport',g:'u',its:['hoodie','jog','running','casq'],col:'Sport'},
 {id:'e_ville',n:'Ville chic',g:'m',its:['shirt','chino','blazer','mocass','ceinture'],col:'Ville'},
 {id:'e_soir',n:'Soirée',g:'f',its:['rsoir','ballerine','collier','bun'],col:'Soirée'},
 {id:'e_rentree',n:'Rentrée',g:'f',its:['blouse','plisse','cardi','bottes','sac'],col:'Ville'}];
