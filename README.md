<div align="center">

# Applications John Maibwe (AJM) — Site officiel

**Applications web et mobiles · Logiciels sur mesure · Intelligence artificielle · Transformation numérique**

Québec, Canada · ouverte au monde 🌍

### 🔗 [**johnmaibwe.com**](https://johnmaibwe.com) · [English](https://johnmaibwe.com/en/)

</div>

---

## À propos

**Applications John Maibwe (AJM)** est une entreprise québécoise de développement technologique :
applications web, applications iOS et Android, logiciels sur mesure, intelligence artificielle,
automatisation des processus, solutions cloud et bases de données, transformation numérique.

Ce dépôt contient le **site vitrine officiel** (anciennement « Maibwe Tech », renommé le 8 octobre 2026).

## ✨ Fonctionnalités

- **Bilingue** : français (`/`) et anglais (`/en/`), avec `hreflang` et sélecteur FR / EN
- **Mode clair / sombre** — clair par défaut, choix mémorisé dans le navigateur
- **100 % responsive** — ordinateur, tablette et téléphone
- Sections : Solutions, À propos, Services, Approche, Pour qui, Produits (état vérifié), En vedette,
  Pourquoi nous, Réalisations, FAQ, Contact
- **Assistant intégré** (chatbot 100 % côté client, FR/EN)
- **Formulaire de contact** via Web3Forms, avec message de confirmation
- **Bouton WhatsApp** prêt : il s'affiche dès qu'un numéro est indiqué dans `public/assets/site.js`
  (`WHATSAPP_NUMBER`)
- **SEO** : titres, descriptions, canonical, Open Graph / Twitter (FR et EN), données structurées
  schema.org (`Organization`), `sitemap.xml`, `robots.txt`, favicon et manifeste
- Pages légales des applications : `/adprotectx/…`, `/promptcam/…` (URL données à l'App Store)

## 📁 Structure

```
maibwe-tech-site/
├── public/                  # Tout ce qui est servi en ligne (et rien d'autre)
│   ├── index.html           # Accueil FR
│   ├── en/index.html        # Accueil EN
│   ├── assets/site.css      # Styles partagés FR/EN
│   ├── assets/site.js       # Scripts partagés (thème, menu, assistant, formulaire, WhatsApp)
│   ├── assets/ajm-icon.svg  # Logo AJM (source vectorielle)
│   ├── assets/og-ajm-*.png  # Images de partage social (1200×630)
│   ├── confidentialite.html, 404.html, robots.txt, sitemap.xml, site.webmanifest
│   ├── adprotectx/          # Confidentialité + assistance AdProtectX
│   └── promptcam/           # Confidentialité + assistance PromptCam
├── deploy/nginx.conf        # Config nginx (sécurité, cache, gzip, 404)
├── Dockerfile               # Image nginx non-root, port 8080
└── CREDITS.md               # Sources et licences des images
```

## 🚀 Prévisualiser en local

```bash
docker build -t ajm-site . && docker run --rm -p 8080:8080 ajm-site
# puis http://localhost:8080
```

(ou, sans Docker : `cd public && python3 -m http.server 4173`)

## 🌐 Hébergement et déploiement

- **Hébergement** : VPS OVHcloud (Beauharnois, Québec), géré par **Coolify**.
  Le proxy Traefik de Coolify termine le HTTPS (certificat Let's Encrypt renouvelé automatiquement).
- **Déploiement** : `git push` sur `main` → l'application GitHub de Coolify reçoit le webhook et
  reconstruit l'image sur le VPS. **Aucune GitHub Action, aucune minute GitHub consommée.**
- **Domaine** : `johnmaibwe.com` (canonique) ; `www.johnmaibwe.com` redirige vers lui.
  DNS chez Hostinger : seuls les enregistrements du site (A `@`) pointent vers le VPS ;
  MX, SPF, DKIM et DMARC restent ceux de Hostinger (courriel `john@johnmaibwe.com`).
- **Aucune variable d'environnement ni base de données** : site 100 % statique.

```bash
git add -A
git commit -m "Description de la modification"
git push
```

### Ancienne adresse

`maibwe-tech-site.vercel.app` redirige en **301** vers `johnmaibwe.com` (même chemin), grâce à
`vercel.json`. Vercel ne sert plus le site ; ce fichier n'existe que pour conserver les anciens liens.

## ✉️ Formulaire de contact (Web3Forms)

Le formulaire envoie les messages via **[Web3Forms](https://web3forms.com)**. La clé publique
(`access_key`, dans `public/index.html` et `public/en/index.html`) détermine l'adresse qui reçoit
les messages. Pour les recevoir sur une autre adresse, créer une clé sur web3forms.com avec cette
adresse et remplacer la valeur dans les deux pages.

## 📄 Licence

© 2026 Applications John Maibwe (AJM). Tous droits réservés.
Les crédits et licences des images figurent dans [`CREDITS.md`](CREDITS.md).
