# Atelier de vêtements — Little Life

Outils de production des vêtements dessinés de Little Life. Ce dossier n'est **jamais chargé par le jeu** : il fabrique des données que le jeu lit (`index.html`, à la racine du dépôt).

État actuel : étape 1 (outils du **T-shirt blanc** sauvegardés) et étape 2 (atlas du corps construit, en attente de validation visuelle). Rien du jeu n'a été modifié.

## Contenu

```
atelier/
├── README.md                     ce mode d'emploi
├── .gitignore                    sorties régénérables, jamais enregistrées
├── atlas/                        atlas du corps des 108 images habillées (cartes, premier plan, repères)
├── references/
│   ├── tshirt-blanc/             les 4 vues de référence validées (80×128, fond transparent) + planche + agrandissements ×8
│   └── gabarit/                  gabarit d'analyse du personnage masculin (repères du T-shirt)
├── outils/
│   ├── analyse/                  lecture des sprites du jeu et mesures du corps
│   ├── references/               les 4 vues du T-shirt, décrites pixel par pixel
│   ├── generation/               génération des 130 calques, export, intégration
│   └── controle/                 planches de contrôle image par image
├── tests/                        tests dans un vrai navigateur (Playwright + Chrome)
├── sorties/
│   └── tshirt-blanc_calques.js   calques du T-shirt tels qu'ils sont dans le jeu (référence)
└── archives/                     sources des modules précédents (canapé, garde-robe, mobilier, zoom)
```

## Les outils

### Analyse (`outils/analyse/`)

| Fichier | Rôle |
| --- | --- |
| `mesures.py` | Charge les sprites du jeu (`SPA`), les cartes du corps (`SPF`) depuis `index.html`, sans les modifier. Fournit `grab()` et `img()`, utilisés par tous les autres outils. Le reste du fichier mesure les parties du corps. |
| `idle.py` | Mesures détaillées de la pose debout de face. |
| `planche_reperes.py` | Planche de repères du gabarit du T-shirt. |
| `mesures_homme.md` | Résultat des mesures du personnage masculin. |

### Références (`outils/references/`)

| Fichier | Rôle |
| --- | --- |
| `views.py` | **Les 4 vues de référence du T-shirt blanc**, décrites ligne par ligne : `FACE` (pose `idle`), `DOS` (`wb0`), `PD` (profil droit, `w1`), `PG` (profil gauche, `w1` retourné). Coutures, ourlets, plis, ombres. |
| `hand.py` | Construit une vue à partir de sa description : contour, 4 tons, plis. |
| `tee.py` | Palette du T-shirt et chargement d'une image. |
| `asc.py` | Affiche une zone d'un sprite en texte (contrôle pixel par pixel). |
| `prev.py` | Aperçu rapide d'une vue sur son sprite. |

### Génération (`outils/generation/`)

| Fichier | Rôle |
| --- | --- |
| `gen.py` | Génération automatique du T-shirt sur une image d'animation : torse, manches, ourlet, encolure, bords de profil, avant-bras au premier plan. |
| `fdn.py`, `fdn_gen.py`, `fdn2.py` | T-shirt de la femme à table (8 images), dessiné à partir d'un contour de torse fixe. |
| `sofa.py` | T-shirt des images du canapé (16 images), à partir du T-shirt dessiné dans la planche du canapé. |
| `z.py` | Lecture des zones de couleur (`SPL`) du jeu. |
| `export.py` | Produit les 130 calques (homme, femme, canapé, versions gauche) et le fichier `sorties/tshirt-blanc_calques.js`. |
| `integrer.py` | Vérifie (par défaut) ou écrit (`--ecrire`) les calques dans `index.html`. |

### Contrôle (`outils/controle/`)

| Fichier | Rôle |
| --- | --- |
| `review.py` | Planches de contrôle de toutes les images habillées (dans `sorties/apercus/`). |
| `sheet.py` | Listes des images habillées (homme `FR_M`, femme `FR_F`) et planches avant/après. |
| `insp.py` | Agrandissement avant/après d'une sélection d'images. |
| `grid.py` | Agrandissement avec grille et coordonnées, pour dessiner ou corriger au pixel. |
| `fdn_show.py` | Planche des 8 images de la femme à table. |

## Les paramètres de génération

Tous les réglages sont dans le code, à ces endroits :

| Paramètre | Fichier | Variable |
| --- | --- | --- |
| Palette du T-shirt (4 tons + contour) | `generation/gen.py` | `OUT`, `L`, `B`, `S`, `F` |
| Familles de vue (face, dos, profil) | `generation/gen.py` | `FRONT`, `BACK`, `SIDE`, `vtype()` |
| Longueur des manches, ourlet, encolure | `generation/gen.py` | arguments de `gen()` : `afrac`, `hip`, `dip`, `cf`, `cb`, `cs` |
| Avant-bras au premier plan (zones par image) | `generation/gen.py` | `FORE` |
| Contour du torse de la femme à table | `generation/fdn2.py` | `FP` |
| Vues de référence dessinées | `references/views.py` | `FACE`, `DOS`, `PD`, `PG` |
| Images habillées et versions gauche | `controle/sheet.py`, `generation/export.py` | `FR_M`, `FR_F`, `LEFT`, `SOFA` |
| Images remplacées par les références | `generation/export.py` | `HAND` |

## L'atlas du corps (`atlas/`, outils dans `outils/atlas/`)

Base commune à tous les vêtements : pour chacune des **108 images habillées** (55 homme, 37 femme, 16 canapé), la carte des parties du corps corrigée, le masque des éléments au premier plan, les repères anatomiques, la famille d'orientation et l'état du contrôle. **Les cartes du jeu (`SPF`) ne sont jamais modifiées** : l'atlas est une copie corrigée, propre à l'atelier.

| Fichier | Contenu |
| --- | --- |
| `atlas/cartes/<image>.png` | Partie du corps de chaque pixel (PNG à palette : l'index est la partie, les couleurs sont celles de la légende). 0 vide, 1 tête, 2 cou, 3 épaules, 4 poitrine, 5 ventre, 6 hanches, 7 bras, 8 avant-bras, 9 mains, 10 cuisses, 11 mollets, 12 pieds, 13 objet / non étiqueté. |
| `atlas/premier_plan/<image>.png` | Pixels dessinés devant le torse (avant-bras croisés, objets tenus, mèches de cheveux) : un vêtement du haut passe derrière. |
| `atlas/atlas.json` | Par image : `famille` (face, dos, profil, trois-quarts, assis-table, canape-assis, canape-allonge), `activite`, `genre`, `reperes` (cou, épaules, taille, hanches, coudes, poignets, genoux, chevilles), `corrections` appliquées, `a_surveiller` (zones demandant une attention particulière), `controle` et `remarque`. |

| Outil | Rôle |
| --- | --- |
| `outils/atlas/construire.py` | Reconstruit l'atlas depuis les cartes du jeu et applique les corrections par famille. L'état du contrôle déjà enregistré n'est jamais écrasé. |
| `outils/atlas/planche.py [images…]` | Planches de validation : sprite · carte du jeu · carte de l'atlas (premier plan hachuré, repères en croix). Sorties dans `sorties/atlas/`. |
| `outils/atlas/marquer.py <état> "<remarque>" images…` | Enregistre l'état du contrôle visuel (« contrôlé — conforme », « contrôlé — avec réserve », « validé par l'auteur »…). |
| `outils/atlas/commun.py` | Liste des images, couleurs des parties, lecture des cartes du jeu. |

Corrections appliquées automatiquement (détail par image dans `atlas.json`) :
- face et dos : bras étiquetés torse ou hanches à côté du torse (marche de face et de dos, bureau, studio) rendus aux bras, avant-bras et mains ;
- profil de la femme : avant-bras étiquetés torse ou ventre hors de la largeur des épaules ;
- avant-bras dessinés devant le torse (boire, marche et vélo de la femme) : avant-bras + premier plan ;
- femme à table : torse, manche, cheveux et visage redessinés (contours validés avec le T-shirt) ;
- canapé : parties recalées sur les zones de couleur de la planche (visage, bras nus, haut, pantalon, chaussures) ;
- contours sans partie rattachés à la partie voisine ; objets tenus classés à part.

```
python3 atelier/outils/atlas/construire.py
python3 atelier/outils/atlas/planche.py           # ou une liste d'images
```

## Procédures

Prérequis : Python 3 avec `numpy`, `Pillow` et `scipy`. Pour les tests : Node.js, Playwright et Google Chrome. Les chemins de Playwright et de Chrome peuvent être fixés avec les variables d'environnement `PLAYWRIGHT` et `CHROME`.

### Régénérer le T-shirt blanc

```
python3 atelier/outils/generation/export.py      # 130 calques -> atelier/sorties/
python3 atelier/outils/generation/integrer.py    # vérifie que le jeu contient exactement ces calques
```

`integrer.py` doit répondre « OK ». Le T-shirt blanc est validé : une régénération doit redonner exactement le même fichier. Si ce n'est pas le cas, ne pas l'intégrer.

### Contrôler visuellement

```
python3 atelier/outils/controle/review.py        # planches dans atelier/sorties/apercus/
```

### Tests (dans `atelier/tests/`)

| Test | Ce qu'il vérifie |
| --- | --- |
| `calques_au_pixel.js` | Les 130 calques sont posés exactement, rien d'autre ne change, aucun pixel hors du corps, transparence intacte. |
| `animations_completes.js` | Toutes les animations en jeu réel, homme et femme : marche, course, vélo, haltères, saluer, repas, bureau, canapé dans les 4 orientations, retrait, remplacement, sauvegarde et rechargement. |
| `non_regression_vetements.js <ancien index.html>` | Les autres vêtements rendent exactement comme dans une version précédente du jeu. |
| `deplacements_dressing_sauvegarde.js` | Déplacements, dressing, garde-robe, rechargement. |
| `rendu_images_cles.js`, `pixels_du_calque.js` | Premiers tests du T-shirt (images clés). |

```
cd atelier/tests
node calques_au_pixel.js
node animations_completes.js
git show <commit précédent>:index.html > ../sorties/ancien.html
node non_regression_vetements.js ../sorties/ancien.html
```

Les résultats et captures vont dans `atelier/sorties/tests/`.

### Intégrer dans le jeu

1. `export.py`, puis contrôle visuel.
2. `integrer.py --ecrire`.
3. Les trois tests ci-dessus, sans erreur.
4. Commit. Publication sur `gh-pages` **uniquement après autorisation**.

## Règles

- Les sprites et les cartes originales du jeu ne sont jamais modifiés : les outils les lisent seulement.
- Les 4 vues de référence ne sont jamais régénérées automatiquement.
- Un résultat validé n'est jamais remplacé par une génération moins bonne.
- Aucune publication sans autorisation.

## Archives (`archives/`)

Sources des fonctionnalités précédentes, conservées pour mémoire. **Le code de référence est celui de `index.html`** : certaines de ces sources ont été retouchées ensuite directement dans le jeu.

- `canape/` : découpe de la planche du canapé et cartes du corps de ses images.
- `canape-cosy/` : module du canapé interactif et ses tests.
- `garde-robe/` : sources du moteur, du catalogue et de l'interface de la garde-robe v2 (`wd_*.js`) et leurs tests.
- `mobilier/` : registre du mobilier, boutique déco et ses tests.
- `zoom/` : module de zoom et ses tests.
