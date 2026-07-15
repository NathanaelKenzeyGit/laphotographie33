# LA Photographie33 — Aurélien Lambert Photographe

Site vitrine pour un photographe professionnel basé à Saint-André-de-Cubzac
(Gironde) : mariage, portrait, maternité, animalier, corporate.

Projet développé dans le cadre de la certification DWWM (Développeur Web et Web
Mobile) — bloc C3 "Développer la partie front-end d'une application web ou web
mobile en intégrant les recommandations de sécurité".

## Stack technique

- **HTML5** sémantique, **Sass/SCSS** (fichier unique compilé), **Bootstrap 5.3**
  (CDN) pour la grille et les composants.
- **jQuery** pour le chargement de fragments HTML (navbar/footer partagés entre les
  pages), **vanilla JS** pour le reste (lightbox, filtres de galerie, formulaire,
  animations).
- **GSAP + ScrollTrigger** pour les animations d'entrée au scroll (respecte
  `prefers-reduced-motion`).
- **Resend** pour l'envoi d'emails du formulaire de contact, via une fonction
  serverless pensée pour **Vercel**.
- **Elfsight** pour l'affichage des avis Google (chargé uniquement après consentement
  cookies).

Aucun framework JS (React/Vue/etc.) — le site reste 100% HTML/CSS/JS classique côté
front, avec une seule fonction serverless (`api/contact.js`) côté back.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvre ensuite [http://localhost:8080](http://localhost:8080). `npm run dev` lance en
parallèle le serveur local **et** la recompilation automatique du SCSS à chaque
sauvegarde — pas besoin de relancer quoi que ce soit manuellement en développant.

**Important** : les pages utilisent des chemins absolus (`/assets/...`, `/pages/...`)
et chargent la navbar/le footer en AJAX (jQuery). Ouvrir un fichier `.html`
directement dans le navigateur (`file://`) ne fonctionnera pas — toujours passer par
`http://localhost:8080`.

## Scripts disponibles

| Commande            | Effet                                                         |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Serveur local (port 8080) + recompilation SCSS automatique    |
| `npm run build:css` | Compile `sass/main.scss` → `assets/css/main.min.css` une fois |
| `npm run watch:css` | Recompile le SCSS à chaque sauvegarde, sans serveur           |
| `npm run lint`      | Vérifie le JS avec ESLint                                     |
| `npm run format`    | Reformate tout le projet avec Prettier                        |

## Structure du projet

```
index.html              Page d'accueil
pages/                   Une page par thématique + fragments partagés
  navbar.html            \ Fragments chargés dynamiquement en jQuery
  footer.html            /  (voir assets/js/main.js)
  illustration-contact.html
  mariage.html, portraits.html, maternite.html, animalier.html, corporate.html
  prestations.html        Galerie complète filtrable par thématique
  apropos.html, contact.html, faq.html, blog.html
  mentions-legales.html   Mentions légales + confidentialité + cookies
assets/
  css/main.min.css        CSS compilé (généré, ne pas éditer à la main)
  fonts/, icons/, img/     Polices custom, logo, photos (rangées par catégorie)
  js/
    main.js               Fragments jQuery + toutes les animations GSAP
    contact-script.js      Logique du formulaire multi-étapes + envoi
    cookie-consent.js       Bandeau cookies + chargement conditionnel d'Elfsight
    lightbox.js, gallery-filter.js
sass/
  main.scss                Fichier source unique (~2600 lignes, sections scopées
                            par commentaires `// PAGE : XXX` et classes `.page-xxx`)
  variables.scss            Orphelin, non utilisé par main.scss — ignorer
api/
  contact.js                Fonction serverless Vercel : envoie l'email via Resend
robots.txt, sitemap.xml    SEO
```

## Formulaire de contact & emails (Resend)

Le formulaire de contact (`pages/contact.html`) envoie un vrai email via l'API
[Resend](https://resend.com) à chaque soumission. Ça nécessite une variable
d'environnement :

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

À renseigner dans les variables d'environnement du projet Vercel (jamais dans un
fichier du repo — voir `.env.example` pour le format attendu). Le guide complet,
pas-à-pas, création de compte Resend comprise, est dans **`GUIDE-DEPLOIEMENT.md`**.

## Déploiement

Le site est pensé pour être déployé sur **Vercel** : import direct du repo GitHub,
détection automatique du dossier `/api` pour la fonction serverless, aucune commande
de build nécessaire (site statique). Chaque `git push` sur la branche connectée
redéploie automatiquement. Détail complet dans `GUIDE-DEPLOIEMENT.md`.

## SEO & données structurées

- Meta description, Open Graph et balisage JSON-LD (`schema.org`, type
  `ProfessionalService`) sur toutes les pages indexées.
- `robots.txt` + `sitemap.xml` à la racine.
- Le domaine utilisé partout (canonical, Open Graph, JSON-LD) est celui du
  déploiement Vercel actuel (`laphotographie33.vercel.app`) — à remplacer par un
  simple rechercher/remplacer sur le projet si un nom de domaine personnalisé est
  ajouté par la suite.
- Raisonnement détaillé derrière chaque choix SEO dans `AMELIORATIONS.md`.

## Cookies & RGPD

Un bandeau de consentement (`assets/js/cookie-consent.js`) conditionne le chargement
du seul cookie tiers non-essentiel du site (le widget d'avis Google Elfsight, présent
uniquement sur la home). Le choix de l'utilisateur est mémorisé (`localStorage`), rien
n'est chargé avant acceptation explicite.

**`pages/mentions-legales.html` contient des champs à compléter** (statut juridique,
SIRET, adresse postale) avant mise en ligne définitive — un bandeau d'avertissement
visible sur la page elle-même le rappelle, et la page est en `noindex` tant que ce
n'est pas fait.

## Documentation du projet

- **`CHANGELOG.md`** — historique des évolutions, par date.
- **`AMELIORATIONS.md`** — pourquoi le SEO a été fait ainsi, et pistes d'amélioration
  futures classées par catégorie, chacune avec sa justification.
- **`GUIDE-DEPLOIEMENT.md`** — guide pas-à-pas Resend + Vercel + réflexion sur un futur
  contact WhatsApp.
- **`CONTEXT.md`** — mémoire technique détaillée de chaque décision et de ce qui a été
  testé (plutôt destiné à un futur développeur/agent reprenant le projet qu'à une
  lecture régulière).

## Bugs connus / limites actuelles

Liste à jour dans `AMELIORATIONS.md` (section technique). Point notable : le
formulaire de contact fonctionne mais utilise l'adresse d'envoi de test de Resend
(`onboarding@resend.dev`), qui ne peut recevoir que sur l'adresse du compte Resend
tant qu'aucun domaine n'est vérifié — voir `GUIDE-DEPLOIEMENT.md` pour lever cette
limite.
