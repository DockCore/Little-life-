# Atlas du corps v2 — rapport de validation

Date : 2026-11-18. Cartes reconstruites à partir des sprites et de squelettes annotés à la main (atlas/squelettes/). Sprites et cartes du jeu non modifiés.

Une image est CONFORME seulement si les contrôles automatiques ne signalent rien ET si le contrôle visuel est enregistré. Aucune image n’est « avec réserve ».

| Image | Famille | État | Parties cachées par le dessin | Défauts / remarques |
|---|---|---|---|---|
| idle | face | CONFORME | — | — |
| wave | face | CONFORME | — | — |
| drink | face | CONFORME | avant-bras_d, bras_d | — |
| w0 | profil | CONFORME | bras_g | — |
| w1 | profil | CONFORME | — | — |
| w2 | profil | CONFORME | — | — |
| w3 | profil | CONFORME | — | — |
| r0 | profil | CONFORME | — | — |
| r1 | profil | CONFORME | — | — |
| r2 | profil | CONFORME | — | — |
| r3 | profil | CONFORME | — | — |
| wf0 | face | CONFORME | — | — |
| wf1 | face | CONFORME | — | — |
| wf2 | face | CONFORME | pied_g | — |
| wf3 | face | CONFORME | pied_g | — |
| wf4 | face | CONFORME | — | — |
| wf5 | face | CONFORME | — | — |
| wf6 | face | CONFORME | — | — |
| wf7 | face | CONFORME | — | — |
| wb0 | dos | CONFORME | — | — |
| wb1 | dos | CONFORME | — | — |
| wb2 | dos | CONFORME | — | — |
| wb3 | dos | CONFORME | — | — |
| wb4 | dos | CONFORME | — | — |
| wb5 | dos | CONFORME | avant-bras_g | — |
| wb6 | dos | CONFORME | — | — |
| wb7 | dos | CONFORME | — | — |
| dn0 | assis-table | NON CONFORME | bras_g | contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn1 | assis-table | NON CONFORME | bras_g | hanches : 81 px contre 24 px sur dn0 (écart anormal); contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn2 | assis-table | NON CONFORME | bras_g | hanches : 33 px contre 81 px sur dn1 (écart anormal); avant-bras : 24 px contre 48 px sur dn1 (écart anormal); repère poignet_d : saut de 11 px depuis dn1; repère main_d : saut de 16 px depuis dn1; contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn3 | assis-table | NON CONFORME | bras_g | objet / non étiqueté : 114 px contre 0 px sur dn2 (écart anormal); contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn4 | assis-table | NON CONFORME | bras_g | objet / non étiqueté : 0 px contre 114 px sur dn3 (écart anormal); contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn5 | assis-table | NON CONFORME | bras_g | cou : 24 px contre 52 px sur dn4 (écart anormal); hanches : 57 px contre 30 px sur dn4 (écart anormal); repère poignet_d : saut de 11 px depuis dn4; repère main_d : saut de 16 px depuis dn4; contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn6 | assis-table | NON CONFORME | bras_g | objet / non étiqueté : 79 px contre 0 px sur dn5 (écart anormal); repère poignet_d : saut de 13 px depuis dn5; repère main_d : saut de 17 px depuis dn5; contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| dn7 | assis-table | NON CONFORME | bras_g | bras : 117 px contre 57 px sur dn6 (écart anormal); mains : 23 px contre 49 px sur dn6 (écart anormal); objet / non étiqueté : 0 px contre 79 px sur dn6 (écart anormal); repère poignet_d : saut de 14 px depuis dn6; repère main_d : saut de 23 px depuis dn6; contrôle visuel : le dessin ne sépare pas le bras du torse : limite bras/torse estimée, pas lue sur le sprite ; hanches presque entièrement cachées par les cuisses |
| wc0 | face | CONFORME | — | — |
| wc1 | face | CONFORME | — | — |
| dk0 | dos | CONFORME | jambe_d, jambe_g, main_d, main_g, tete | — |
| dk1 | dos | CONFORME | jambe_d, jambe_g, main_d, main_g, tete | — |
| cu0 | face | CONFORME | — | — |
| cu1 | face | CONFORME | — | — |
| cu2 | face | CONFORME | main_d | — |
| cu3 | face | CONFORME | — | — |
| bk0 | profil | NON CONFORME | bras_g | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk1 | profil | NON CONFORME | bras_g | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk2 | profil | NON CONFORME | bras_g, pied_g | repère genou_d : saut de 10 px depuis bk1; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk3 | profil | NON CONFORME | bras_g | pieds : 92 px contre 42 px sur bk2 (écart anormal); contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk4 | profil | NON CONFORME | bras_g | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk5 | profil | NON CONFORME | bras_g | repère cheville_d : saut de 9 px depuis bk4; repère orteils_d : saut de 11 px depuis bk4; repère orteils_g : saut de 11 px depuis bk4; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk6 | profil | NON CONFORME | bras_g | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| bk7 | profil | NON CONFORME | bras_g | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| v_front | face | CONFORME | — | — |
| v_q | trois-quarts | CONFORME | bras_g | — |
| v_side | profil | CONFORME | bras_g, pied_g | — |
| v_back | dos | CONFORME | — | — |
| F_idle | face | CONFORME | — | — |
| F_wave | face | CONFORME | — | — |
| F_drink | face | CONFORME | bras_d | — |
| F_w0 | profil | CONFORME | — | — |
| F_w1 | profil | CONFORME | — | — |
| F_w2 | profil | CONFORME | — | — |
| F_w3 | profil | CONFORME | — | — |
| F_r0 | profil | CONFORME | — | — |
| F_r1 | profil | CONFORME | — | — |
| F_r2 | profil | CONFORME | — | — |
| F_r3 | profil | CONFORME | — | — |
| F_dn0 | assis-table | NON CONFORME | bras_g | contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn1 | assis-table | NON CONFORME | bras_g | mains : 13 px contre 33 px sur F_dn0 (écart anormal); contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn2 | assis-table | NON CONFORME | bras_g | avant-bras : 20 px contre 65 px sur F_dn1 (écart anormal); mains : 65 px contre 13 px sur F_dn1 (écart anormal); repère poignet_d : saut de 11 px depuis F_dn1; repère main_d : saut de 17 px depuis F_dn1; contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn3 | assis-table | NON CONFORME | bras_g | objet / non étiqueté : 125 px contre 0 px sur F_dn2 (écart anormal); cheveux sous la mâchoire : 55 px contre 28 px sur F_dn2 (écart anormal); contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn4 | assis-table | NON CONFORME | bras_g | objet / non étiqueté : 0 px contre 125 px sur F_dn3 (écart anormal); contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn5 | assis-table | NON CONFORME | bras_g | avant-bras : 72 px contre 18 px sur F_dn4 (écart anormal); mains : 16 px contre 60 px sur F_dn4 (écart anormal); repère poignet_d : saut de 11 px depuis F_dn4; repère main_d : saut de 17 px depuis F_dn4; contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn6 | assis-table | NON CONFORME | bras_g | cou : 16 px contre 31 px sur F_dn5 (écart anormal); bras : 25 px contre 47 px sur F_dn5 (écart anormal); avant-bras : 14 px contre 72 px sur F_dn5 (écart anormal); objet / non étiqueté : 101 px contre 0 px sur F_dn5 (écart anormal); repère poignet_d : saut de 11 px depuis F_dn5; repère main_d : saut de 17 px depuis F_dn5; contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_dn7 | assis-table | NON CONFORME | bras_g | cou : 32 px contre 16 px sur F_dn6 (écart anormal); bras : 47 px contre 25 px sur F_dn6 (écart anormal); avant-bras : 50 px contre 14 px sur F_dn6 (écart anormal); mains : 40 px contre 13 px sur F_dn6 (écart anormal); cuisses : 78 px contre 147 px sur F_dn6 (écart anormal); objet / non étiqueté : 0 px contre 101 px sur F_dn6 (écart anormal); repère poignet_d : saut de 10 px depuis F_dn6; repère main_d : saut de 18 px depuis F_dn6; contrôle visuel : dessin d’origine grossier : limite bras/torse estimée, mains et pieds approximatifs, cou très réduit |
| F_wc0 | face | CONFORME | — | — |
| F_wc1 | face | CONFORME | — | — |
| F_dk0 | dos | CONFORME | jambe_d, jambe_g, main_d, main_g, tete | — |
| F_dk1 | dos | CONFORME | jambe_d, jambe_g, main_d, main_g, tete | — |
| F_cu0 | face | CONFORME | — | — |
| F_cu1 | face | NON CONFORME | — | mains : 18 px contre 64 px sur F_cu0 (écart anormal); contrôle visuel : mains en grande partie masquées par les haltères (gris) ; bande de hanches débordant sur les bras à la ligne de taille |
| F_cu2 | face | NON CONFORME | — | contrôle visuel : mains en grande partie masquées par les haltères (gris) ; bande de hanches débordant sur les bras à la ligne de taille |
| F_cu3 | face | NON CONFORME | — | avant-bras : 14 px contre 31 px sur F_cu2 (écart anormal); contrôle visuel : mains en grande partie masquées par les haltères (gris) ; bande de hanches débordant sur les bras à la ligne de taille |
| F_bk0 | profil | NON CONFORME | — | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_bk1 | profil | NON CONFORME | — | repère cheville_g : saut de 9 px depuis F_bk0; repère orteils_g : saut de 13 px depuis F_bk0; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_bk2 | profil | NON CONFORME | — | repère cheville_g : saut de 13 px depuis F_bk1; repère orteils_g : saut de 15 px depuis F_bk1; repère genou_d : saut de 9 px depuis F_bk1; repère orteils_d : saut de 10 px depuis F_bk1; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_bk3 | profil | NON CONFORME | — | contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_bk4 | profil | NON CONFORME | — | repère cheville_g : saut de 9 px depuis F_bk3; repère orteils_g : saut de 13 px depuis F_bk3; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_bk5 | profil | NON CONFORME | — | repère cheville_g : saut de 13 px depuis F_bk4; repère orteils_g : saut de 15 px depuis F_bk4; repère genou_d : saut de 9 px depuis F_bk4; repère orteils_d : saut de 10 px depuis F_bk4; contrôle visuel : jambes en partie cachées par le vélo : séparation jambe proche / jambe éloignée incertaine, pieds réduits à quelques pixels |
| F_v_front | face | CONFORME | — | — |
| F_v_q | trois-quarts | CONFORME | bras_g | — |
| F_v_side | profil | CONFORME | bras_g, jambe_g | — |
| F_v_back | dos | CONFORME | — | — |
| cs0 | canape-assis | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cs1 | canape-assis | NON CONFORME | bras_d | ventre : 3 px contre 75 px sur cs0 (écart anormal); hanches : 122 px contre 52 px sur cs0 (écart anormal); avant-bras : 28 px contre 66 px sur cs0 (écart anormal); repère main_g : saut de 9 px depuis cs0; repère genou_d : saut de 10 px depuis cs0; repère cheville_d : saut de 12 px depuis cs0; repère orteils_d : saut de 13 px depuis cs0; contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cs2 | canape-assis | NON CONFORME | — | ventre : 50 px contre 3 px sur cs1 (écart anormal); avant-bras : 61 px contre 28 px sur cs1 (écart anormal); contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cs3 | canape-assis | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cn0 | canape-allonge | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cn1 | canape-allonge | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cn2 | canape-allonge | NON CONFORME | — | bras : 58 px contre 107 px sur cn1 (écart anormal); repère sommet : saut de 9 px depuis cn1; repère genou_g : saut de 9 px depuis cn1; repère orteils_g : saut de 9 px depuis cn1; repère orteils_d : saut de 9 px depuis cn1; contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| cn3 | canape-allonge | NON CONFORME | bras_d | épaules : 24 px contre 81 px sur cn2 (écart anormal); avant-bras : 26 px contre 64 px sur cn2 (écart anormal); repère menton : saut de 10 px depuis cn2; repère machoire_g : saut de 10 px depuis cn2; repère machoire_d : saut de 9 px depuis cn2; repère sommet : saut de 10 px depuis cn2; repère epaule_g : saut de 9 px depuis cn2; contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cs0 | canape-assis | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cs1 | canape-assis | NON CONFORME | bras_d | ventre : 13 px contre 64 px sur F_cs0 (écart anormal); bras : 45 px contre 105 px sur F_cs0 (écart anormal); avant-bras : 32 px contre 64 px sur F_cs0 (écart anormal); repère cheville_d : saut de 10 px depuis F_cs0; repère orteils_d : saut de 11 px depuis F_cs0; contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cs2 | canape-assis | NON CONFORME | — | ventre : 38 px contre 13 px sur F_cs1 (écart anormal); avant-bras : 60 px contre 32 px sur F_cs1 (écart anormal); contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cs3 | canape-assis | NON CONFORME | — | mains : 67 px contre 34 px sur F_cs2 (écart anormal); contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cn0 | canape-allonge | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cn1 | canape-allonge | NON CONFORME | — | contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cn2 | canape-allonge | NON CONFORME | — | repère sommet : saut de 10 px depuis F_cn1; contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |
| F_cn3 | canape-allonge | NON CONFORME | bras_d, pied_d | épaules : 27 px contre 92 px sur F_cn2 (écart anormal); bras : 35 px contre 80 px sur F_cn2 (écart anormal); avant-bras : 18 px contre 49 px sur F_cn2 (écart anormal); pieds : 52 px contre 128 px sur F_cn2 (écart anormal); contrôle visuel : planche du canapé (autre style) : t-shirt, bras et torse confondus par endroits, découpe des bras irrégulière |

**59 CONFORMES, 49 NON CONFORMES** sur 108 images.