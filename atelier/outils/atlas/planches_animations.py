import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
# Planches de validation par animation : sprite | carte | côtés (bleu = gauche écran / membre éloigné, orange = droite écran / membre proche).
exec(open(A+'/atlas/construire.py').read().split("if __name__")[0])
exec(open(A+'/atlas/planche2.py').read().split("if __name__")[0].replace("exec(open(A+'/atlas/decoupe.py').read())",""))
GROUPES=[('01_homme_debout',['idle','wave','drink','v_front','v_q','v_side','v_back']),('02_homme_marche_profil',['w0','w1','w2','w3']),('03_homme_course',['r0','r1','r2','r3']),
('04_homme_marche_face',['wf%d'%i for i in range(8)]),('05_homme_marche_dos',['wb%d'%i for i in range(8)]),('06_homme_table',['dn%d'%i for i in range(8)]),
('07_homme_bureau_halteres',['wc0','wc1','dk0','dk1','cu0','cu1','cu2','cu3']),('08_homme_velo',['bk%d'%i for i in range(8)]),
('09_femme_debout',['F_idle','F_wave','F_drink','F_v_front','F_v_q','F_v_side','F_v_back']),('10_femme_marche_course',['F_w0','F_w1','F_w2','F_w3','F_r0','F_r1','F_r2','F_r3']),
('11_femme_table',['F_dn%d'%i for i in range(8)]),('12_femme_bureau_halteres_velo',['F_wc0','F_wc1','F_dk0','F_dk1','F_cu0','F_cu1','F_cu2','F_cu3','F_bk0','F_bk1','F_bk2','F_bk3','F_bk4','F_bk5']),
('13_canape_homme',['cs0','cs1','cs2','cs3','cn0','cn1','cn2','cn3']),('14_canape_femme',['F_'+k for k in ['cs0','cs1','cs2','cs3','cn0','cn1','cn2','cn3']])]
if __name__=='__main__':
    import sys
    _o.makedirs(A+'/../sorties/atlas',exist_ok=True)
    for n,ks in GROUPES:
        if len(sys.argv)>1 and not any(a in n for a in sys.argv[1:]):continue
        planche(ks,A+'/../sorties/atlas/%s.png'%n,par=4)
