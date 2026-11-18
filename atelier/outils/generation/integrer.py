import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Procédure d'intégration des calques du T-shirt blanc dans le jeu.
#   python3 integrer.py            -> vérifie seulement (aucune écriture) : le jeu contient-il exactement les calques générés ?
#   python3 integrer.py --ecrire   -> remplace la ligne « const WLAYSRC=… » de index.html par les calques générés
# À lancer après outils/generation/export.py. Ne publie rien : le commit et la publication restent manuels.
import sys
JEU=A+'/../../index.html';CAL=A+'/../sorties/tshirt-blanc_calques.js'
s=open(JEU,encoding='utf-8').read();g=open(CAL,encoding='utf-8').read().strip()
i=s.index('const WLAYSRC=');j=s.index('\n',i)
if s[i:j]==g:print('OK : le jeu contient exactement les calques générés (%d octets).'%len(g));sys.exit(0)
print('Différence entre le jeu et les calques générés.')
if '--ecrire' in sys.argv:
    open(JEU,'w',encoding='utf-8').write(s[:i]+g+s[j:]);print('index.html mis à jour. Lancez les tests avant tout commit.')
else:sys.exit(1)
