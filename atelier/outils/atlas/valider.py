import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Enregistre le résultat du contrôle visuel d'images dans leurs squelettes (jamais écrasé par une reconstruction).
#   python3 valider.py ok  "<qui, date>" images...      -> contrôle visuel fait, changements de pose entre images vérifiés
#   python3 valider.py non "<raison>"     images...      -> NON CONFORME, avec la raison
import json,sys
SQ=A+'/../atlas/squelettes'
mode,txt,ks=sys.argv[1],sys.argv[2],sys.argv[3:]
for k in ks:
    f=SQ+'/%s.json'%k;d=json.load(open(f,encoding='utf-8'))
    if mode=='ok':d['controle_visuel']=txt;d['temporel_verifie']=True;d.pop('non_conforme',None)
    else:d['controle_visuel']='';d['non_conforme']=txt
    json.dump(d,open(f,'w',encoding='utf-8'),ensure_ascii=False)
print(mode,len(ks))
