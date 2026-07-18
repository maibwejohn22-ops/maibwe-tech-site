<div align="center">

# Maibwe Tech — Site officiel

**Nous créons des solutions numériques simples, utiles et accessibles.**

*Innovation · Solutions · Succès*

Basée au Québec, ouverte au monde 🌍

</div>

---

## À propos

**Maibwe Tech (MT)** est une entreprise technologique qui accompagne les entreprises, les
organisations et les particuliers dans leur transformation numérique — de l'idée jusqu'à
l'outil qui fonctionne. Nous concevons des sites web, des applications mobiles, des logiciels
sur mesure, des bases de données et des solutions d'automatisation pour les PME, les églises,
les écoles, les associations, les communautés et les entrepreneurs, au Canada comme à
l'international.

Ce dépôt contient le **site vitrine officiel** de l'entreprise.

## ✨ Fonctionnalités du site

- **Page d'accueil animée** avec héros à diaporama automatique et cartes flottantes
- **Mode clair / sombre** avec bouton de bascule (mémorisé, respecte la préférence du système)
- **Design 100 % responsive** — ordinateur, tablette et téléphone
- **Sections complètes** : Solutions, À propos, Services, Notre approche, Pour qui, Produits,
  Produits en vedette, Pourquoi nous, Réalisations, FAQ et Contact
- **Compteurs animés**, bandeau défilant, accordéon FAQ et animations d'apparition au défilement
- **Réalisations** présentant les vrais logos des applications (Église Connect, etc.) en orbite animée
- **Assistant intégré (chatbot)** répondant aux questions fréquentes, 100 % côté client
- **Formulaire de contact** (ouvre le logiciel de courriel — aucune donnée stockée)
- **SEO optimisé** : balises Open Graph / Twitter, favicon, titre et description
- **Accessibilité** : respect de `prefers-reduced-motion`, navigation au clavier, contrastes soignés

## 🛠️ Technologie

Site **statique**, sans dépendance ni étape de compilation :

| Élément | Détail |
|---|---|
| Structure | HTML5 sémantique |
| Style | CSS3 (variables, Flexbox, Grid, animations) |
| Interactivité | JavaScript vanilla (aucun framework) |
| Police | Montserrat (Google Fonts) |
| Images | Encodées en base64 dans le fichier + copies sources dans `assets/` |
| Hébergement | Vercel (recommandé) ou GitHub Pages |

Le site tient dans un seul fichier `index.html` autonome, ce qui le rend rapide,
portable et facile à héberger n'importe où.

## 📁 Structure du projet

```
maibwe-tech-site/
├── index.html          # Le site complet (autonome, images intégrées)
├── assets/             # Copies sources des images (référence / réutilisation)
│   ├── og-cover.png            # Image de partage social (1200×630)
│   ├── photo-hero-afrique.jpg
│   ├── photo-apropos-afrique.jpg
│   ├── photo-cta-afrique.jpg
│   ├── logo-eglise-connect.jpg
│   ├── logo-cimko.jpg
│   └── logo-classy-event.jpg
├── CREDITS.md          # Sources et licences des images
├── .gitignore
└── README.md
```

## 🚀 Lancer le projet localement

Le site est statique : aucune installation n'est requise.

**Option 1 — Ouvrir directement**

Double-cliquez sur `index.html` pour l'ouvrir dans votre navigateur.

**Option 2 — Serveur local (recommandé)**

```bash
# Avec Python 3
python3 -m http.server 4173

# ou avec Node.js
npx serve .
```

Puis ouvrez <http://localhost:4173> dans votre navigateur.

## 🌐 Déploiement

Le site se déploie automatiquement à chaque `git push` sur la branche `main`
(voir la configuration d'hébergement). Comme il s'agit d'un site statique,
aucune variable d'environnement n'est nécessaire.

### Configuration optionnelle

Pour activer l'envoi du **formulaire de contact** par courriel, renseignez l'adresse
officielle dans `index.html` :

```js
// Rechercher cette ligne et y mettre votre adresse :
var CONTACT_EMAIL = 'contact@maibwetech.com';
```

## 📄 Licence

© 2026 Maibwe Tech (MT). Tous droits réservés.

Le code de ce site est la propriété de Maibwe Tech. Les crédits et licences des images
figurent dans [`CREDITS.md`](CREDITS.md).
