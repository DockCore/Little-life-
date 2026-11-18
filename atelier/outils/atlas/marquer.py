import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Enregistre l'état du contrôle visuel de l'atlas (jamais écrasé par une reconstruction).
#   python3 marquer.py <etat> "<remarque>" image1 image2 ...
# États : « contrôlé — conforme », « contrôlé — avec réserve », « à contrôler », « validé par l'auteur ».
import json,sys
F=A+'/../atlas/atlas.json';d=json.load(open(F))
etat,rem,ks=sys.argv[1],sys.argv[2],sys.argv[3:]
for k in ks:
    if k not in d:print('inconnue :',k);continue
    d[k]['controle']=etat;d[k]['remarque']=rem
json.dump(d,open(F,'w'),ensure_ascii=False,indent=1);print(len(ks),'images ->',etat)
