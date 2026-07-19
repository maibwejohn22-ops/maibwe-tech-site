<div align="center">

# Maibwe Tech — Site officiel

**Nous créons des solutions numériques simples, utiles et accessibles.**

*Innovation · Solutions · Succès*

Basée au Québec, ouverte au monde 🌍

### 🔗 [**Voir le site en ligne →**](https://maibwejohn22-ops.github.io/maibwe-tech-site/)

`https://maibwejohn22-ops.github.io/maibwe-tech-site/`

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
- **Mode clair / sombre** avec bouton de bascule — mode clair par défaut à la première visite, choix mémorisé pour les visites suivantes
- **Design 100 % responsive** — ordinateur, tablette et téléphone
- **Sections complètes** : Solutions, À propos, Services, Notre approche, Pour qui, Produits,
  Produits en vedette, Pourquoi nous, Réalisations, FAQ et Contact
- **Compteurs animés**, bandeau défilant, accordéon FAQ et animations d'apparition au défilement
- **Réalisations** présentant les vrais logos des applications (Église Connect, etc.) en orbite animée
- **Assistant intégré (chatbot)** répondant aux questions fréquentes, 100 % côté client
- **Formulaire de contact sécurisé** (Web3Forms) avec message de confirmation animé
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
| Images | Fichiers optimisés dans `assets/` (JPEG/PNG), chargées à la demande |
| Formulaire | Web3Forms (envoi sécurisé, sans backend) |
| Hébergement | GitHub Pages (actuel) · Vercel (option domaine) |

Le site est **léger et rapide** (`index.html` ~100 Ko + images optimisées) et obtient
**100/100** aux quatre catégories Lighthouse : Performance, Accessibilité, Bonnes
pratiques et SEO.

## 📁 Structure du projet

```
maibwe-tech-site/
├── index.html          # Le site (HTML + CSS + JS, ~100 Ko)
├── assets/             # Images optimisées, chargées par le site
│   ├── favicon-32.png          # Favicon
│   ├── apple-touch-icon.png    # Icône iOS (180×180)
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

Le site est hébergé sur **GitHub Pages** et se **redéploie automatiquement** à chaque
`git push` sur la branche `main` :

```bash
git add -A
git commit -m "Description de la modification"
git push
```

La mise en ligne prend environ une minute. Aucune variable d'environnement n'est
nécessaire (site statique).

> Pour passer à **Vercel** (recommandé pour un domaine personnalisé) : connectez-vous
> sur [vercel.com](https://vercel.com) avec GitHub → *Add New → Project* → importez ce
> dépôt → Framework *Other*, aucune commande de build → *Deploy*.

### Brancher un nom de domaine personnalisé

1. *Settings → Pages → Custom domain* dans le dépôt GitHub, saisissez votre domaine.
2. Chez votre registraire DNS : un `CNAME` `www` → `maibwejohn22-ops.github.io`
   (ou les enregistrements `A` de GitHub pour le domaine racine).
3. Cochez *Enforce HTTPS*.
4. Mettez à jour l'URL dans les balises `<link rel="canonical">` et `og:url` /
   `og:image` de `index.html`, puis `git push`.

## ✉️ Configurer le formulaire de contact (Web3Forms)

Le formulaire envoie les messages via **[Web3Forms](https://web3forms.com)** — votre
adresse courriel **n'apparaît jamais** dans le code, seulement une clé d'accès publique
qui route les messages vers votre boîte.

1. Créez une clé gratuite sur [web3forms.com](https://web3forms.com) (avec votre courriel).
2. Dans `index.html`, remplacez la valeur du champ caché :

```html
<input type="hidden" name="access_key" value="VOTRE_CLE_WEB3FORMS_ICI">
```

3. `git push` — le formulaire est immédiatement fonctionnel, avec message de confirmation.

Tant que la clé n'est pas renseignée, un message clair s'affiche au lieu d'un envoi.

## 📄 Licence

© 2026 Maibwe Tech (MT). Tous droits réservés.

Le code de ce site est la propriété de Maibwe Tech. Les crédits et licences des images
figurent dans [`CREDITS.md`](CREDITS.md).
