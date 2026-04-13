# Kingshot — Informations jeu

## Contexte

Kingshot est un jeu mobile de stratégie (tower defense / guerre de royaumes). Cette application se concentre sur le mécanisme de **Bear Trap rally** : un type d'attaque coopérative où le leader prépare un piège à ours et des joueurs rejoignent le rally pour maximiser les dégâts.

---

## Le mécanisme Bear Trap Rally

### Principe
- Le **leader** du rally possède un **Bear Trap** de niveau 1–5
- Des **participants** rejoignent le rally, chacun contribuant des troupes
- La **capacité totale** du rally est fixée (ex: 2 000 000 troupes)
- L'objectif est de maximiser les **dégâts totaux** en optimisant la composition des troupes

### Types de troupes
| Type | Symbole | Rôle dans le calcul |
|---|---|---|
| Infantry | INF | Diviseur de 3 dans le ratio optimal |
| Cavalry | CAV | Référence unité (coefficient 1) |
| Archery | ARC | Bonus ×1.1 de base contre INF (bear), ×1.21 si T7+ et TG3+ |

### Tiers de troupes
| Tier | Description |
|---|---|
| T1-T6 | Troupes de bas niveau — pas de bonus archer TG |
| T7-T9 | Bonus archer TG activé si TG ≥ 3 |
| T10 | Troupes standard haut niveau |
| T11 | Troupes premium (T11+ dans certaines versions) |

### TG Level (Troop Grade)
- TG 0 : pas de grade
- TG 1–8 : grades croissants
- **TG ≥ 3 + T7+** : active le multiplicateur archer supplémentaire ×1.1

---

## Héros

### Héros de lead (Rally Leader)
Le héros du leader contribue des bonus ATK% et LET% directement aux troupes de son type.

**Générations de héros :**
| Génération | Badge | Couleur |
|---|---|---|
| G1 | G1 | Orange |
| G2 | G2 | Orange |
| G3 | G3 | Orange |
| G4 | G4 | Orange |
| G5 | G5 | Orange |
| G6 | G6 | Orange |
| Epic | Epic | Violet |
| Rare | Rare | Bleu |

**Héros de lead Infantry (G1 → Epic) :**
| Héros | Génération | ATK% | LET% | Widget |
|---|---|---|---|---|
| Amadeus | G1 | 165.3 | 131.1 | Rally ATK |
| Zoe | G2 | 0 | 150 | — |
| Eric | G3 | 100 | 0 | — |
| Alcar | G4 | 0 | 180 | — |
| Longfei | G5 | 100 | 100 | — |
| Howard | Epic | 80 | 80 | — |

**Héros de lead Cavalry (G1 → Epic) :**
| Héros | Génération | ATK% | LET% | Widget |
|---|---|---|---|---|
| Jabel | G1 | 160 | 0 | — |
| Hilde | G2 | 120 | 120 | — |
| Petra | G3 | 0 | 150 | — |
| Margot | G4 | 0 | 160 | — |
| Thrud | G5 | 90 | 110 | Rally LET |
| Gordon | Epic | 80 | 80 | — |
| Chenko | Epic | 0 | 0 | — |
| Fahd | Epic | — | — | — |

**Héros de lead Archery (G1 → Epic) :**
| Héros | Génération | ATK% | LET% | Widget |
|---|---|---|---|---|
| Saul | G1 | 155 | 0 | — |
| Marlin | G2 | 0 | 165 | — |
| Jaeger | G3 | 120 | 0 | — |
| Rosa | G4 | 140 | 0 | Rally LET |
| Vivian | G5 | 80 | 80 | — |
| Quinn | Epic | 70 | 70 | — |
| Amane | Epic | 0 | 0 | — |
| Yeonwoo | Epic | 0 | 0 | — |
| Diana | Epic | 0 | 0 | — |

### Héros joiners
Les joiners contribuent des bonus à **tous** les types de troupes simultanément.

| Héros | Skill | Bonus type | Valeurs (Lv1→Lv5) |
|---|---|---|---|
| Amane | Tri Phalanx | ATK all | +5% / +10% / +15% / +20% / +25% |
| Chenko | Stand of Arms | LET all | +5% / +10% / +15% / +20% / +25% |
| Yeonwoo | On Guard | LET all | +5% / +10% / +15% / +20% / +25% |
| Amadeus | Way of the Blade | LET all | +5% / +10% / +15% / +20% / +25% |

### Widgets (Exclusive Gear)
Le widget d'un héros est une pièce d'équipement exclusive qui peut avoir un effet sur les troupes du rally.

| Effet | Description | Héros concernés |
|---|---|---|
| `rally_atk` | Augmente l'ATK des troupes du rally | Amadeus (+15%) |
| `rally_let` | Augmente la LET des troupes du rally | Thrud, Rosa (+15%) |
| `none` | Pas d'effet rally (défense, santé…) | La majorité des héros |

---

## Formule de dommage

La formule complète de dommage estimé est basée sur les travaux de **Frakinator** et du **Kingshot Simulator** :

```
D ∝ L × Σ [ A_i × √(f_i × C) ]
```

Avec :
- `L` = facteur leader (constant pour un profil donné)
- `A_i` = facteur d'attaque du type i = `(1 + ATK_i/100) × (1 + LET_i/100)`
- `f_i` = fraction de troupes du type i
- `C` = capacité totale du rally
- Pondérations : INF ÷3, CAV ×1, ARC ×1.47 (×(4.4/3)×archerMult)

---

## Ressources et références

### Sources officielles et communauté
| Ressource | URL | Utilisation |
|---|---|---|
| **Frakinator** | https://www.frakinator.com | Formules de ratio optimal, référence principale |
| **Kingshot Simulator** | https://kingshot.gg/simulator | Vérification des calculs, données des héros |
| **kingshotdata.com** | https://kingshotdata.com | Types de héros, effets des widgets, skill data |
| **Reddit r/Kingshot** | https://www.reddit.com/r/KingshotGame/ | Communauté, mises à jour, tierlist |
| **Discord Kingshot** | (lien variable par serveur) | Support communautaire |

### Données à maintenir
Quand un nouveau héros sort ou qu'une valeur change dans le jeu :

1. **Ouvrir `src/lib/heroes.ts`**
2. Ajouter/modifier l'entrée dans `HERO_DB`
3. Ajouter le nom dans `HeroName` dans `src/types/index.ts`
4. Si c'est un joiner avec bonus, l'ajouter dans `JOINER_HEROES` et `CANDIDATES` dans `JoinerRecommender.tsx`
5. Si c'est un héros de lead, l'ajouter dans la liste `LEAD_INF/CAV/ARC_HEROES` correspondante

### Vérification des valeurs
Des données clés à vérifier régulièrement sur kingshotdata.com :
- `skill_bonuses[5]` de chaque héros joiner (peut changer avec des rebalances)
- `widget_effect` pour les héros qui reçoivent un widget exclusif
- Les multiplicateurs de tier/TG si le jeu ajoute un nouveau palier
