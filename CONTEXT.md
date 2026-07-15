# Contexte projet — LAPhotographie33 / Aurélien Lambert

Site vitrine statique pour un photographe professionnel (Aurélien Lambert, basé à
Saint-André-de-Cubzac / Gironde). Pas de framework JS, pas de backend actuellement.

## Stack

- HTML/SCSS/JS vanilla + jQuery (chargement de fragments) + Bootstrap 5.3.8 (CDN) + GSAP
  (animations scroll).
- SCSS source : `sass/main.scss` (fichier unique, ~2300 lignes, fusionné depuis d'anciens
  composants séparés — sections scopées par commentaires `// PAGE : XXX` et classes
  `.page-xxx` sur le `<body>` ou la section). `sass/variables.scss` existe mais **n'est
  plus utilisé par main.scss** (il compile vers `assets/css/variables.min.css`, un fichier
  orphelin non lié dans les pages — ne pas supposer que ses variables sont disponibles
  dans main.scss, elles ne le sont pas : main.scss redéfinit ses propres `$color-*` /
  `$font-*` en haut de fichier).
- **Pipeline de build npm pour le SCSS (depuis le 2026-07-15).** `sass`, `concurrently`
  et `http-server` sont de vraies `devDependencies` (`npm install` requis, plus de
  `npx --yes` à la volée). Scripts disponibles :
  - `npm run build:css` — compile une fois `sass/main.scss` → `assets/css/main.min.css`.
  - `npm run watch:css` — recompile automatiquement à chaque sauvegarde.
  - `npm run dev` — lance `watch:css` **et** le serveur local en parallèle
    (`concurrently`), donc plus besoin de relancer la compilation à la main après une
    modif de style (c'était le piège documenté ici avant cette session, cause de CSS
    périmé plusieurs fois).
  - `npm run lint` (eslint) et `npm run format` (prettier) fonctionnent aussi
    maintenant — `eslint.config.mjs` pointait vers un chemin
    `./site-photo/node_modules/...` inexistant dans ce repo, corrigé en imports de
    package normaux, et les globales CDN (`$`, `jQuery`, `gsap`, `ScrollTrigger`,
    `bootstrap`) sont déclarées dans la config pour ne pas être signalées comme non
    définies.

## Serveur local

`npm run dev` lance http-server sur le port 8080. **Important** : les pages utilisent des
chemins absolus (`/assets/...`, `/pages/...`), donc ouvrir les fichiers en `file://`
casse tout (les fetch jQuery échouent par CORS). Toujours tester via
`http://localhost:8080`.

## Structure des pages

- `index.html` — accueil.
- `pages/*.html` — une page par thématique (mariage, portraits, maternite, animalier,
  corporate, prestations, contact, apropos, blog, faq) + fragments partiels chargés en
  jQuery : `navbar.html`, `footer.html`, `illustration-contact.html`.
- `assets/img/<categorie>/` — photos rangées par thématique. Sous-catégories notables :
  `animalier/canin-*` et `animalier/equin-*` (canin vs équestre), `maternite/bebe-*` et
  `maternite/maternite-*`, `corporate/corporate-*` et `corporate/sport-*`,
  `portrait/portrait-*` et `portrait/sensualite-*`.

## Mécanisme de fragments (jQuery)

`assets/js/main.js` charge en AJAX, sur chaque page qui a le conteneur correspondant
(vérifié via `.length` avant le fetch — pas de requête inutile) :

- `#main-navbar` ← `/pages/navbar.html`
- `#main-footer` ← `/pages/footer.html`
- `#buttons-prestations` ← `/pages/illustration-contact.html` (bandeau CTA
  "Votre histoire mérite d'être racontée")

**Ce mécanisme est volontairement conservé pour navbar/footer** (répétés sur 12+ pages).
Pour du contenu spécifique à une seule page (galerie home, cartes prestations sur la
home), on **inline le HTML directement** plutôt que de créer un nouveau fragment jQuery
— cf. décision ci-dessous.

`assets/js/lightbox.js` et `assets/js/gallery-filter.js` sont indépendants de jQuery
(vanilla JS, `let`/`const` uniquement — **ne jamais utiliser `var`**, c'est une consigne
explicite du client).

## Décisions prises pendant cette session (et pourquoi)

1. **Pas de fragments jQuery pour du contenu propre à une seule page.** La galerie
   d'aperçu de la home et les cartes "Prestations photographiques" étaient à l'origine
   prévues comme fragments séparés (`section-galerie.html`, `section-prestations.html`)
   chargés en AJAX dans des divs vides. Les deux fragments ont été supprimés et leur
   contenu inliné directement dans `index.html`. Raison : c'est plus simple à maintenir,
   évite une requête réseau pour du contenu qui n'apparaît que sur une page, et évite le
   bug classique "div vide si JS ne se charge pas / mauvais chemin".

2. **Une seule modale lightbox partagée par page**, pas une modale dupliquée par photo.
   `assets/js/lightbox.js` gère l'ouverture (`show.bs.modal` → set src/alt) et surtout la
   **fermeture au clic n'importe où sur la photo** (pas seulement sur la croix) — demande
   explicite du client car `modal-fullscreen` masque la zone de backdrop cliquable par
   défaut de Bootstrap.

3. **CSS des composants partagés doit être top-level dans `sass/main.scss`, jamais
   nesté sous un `.page-xxx`.** Bug rencontré et corrigé : `.galerie-filter-btn-img`
   avait été écrit imbriqué sous `.page-prestations`, donc invisible sur la home (pas de
   cette classe sur `<body>`) → le bouton retombait sur `display:inline-block` par défaut
   du navigateur, se dimensionnait sur la taille intrinsèque de l'image (~800px) →
   débordement horizontal de toute la page. Si un futur agent voit à nouveau du scroll
   horizontal après avoir ajouté un composant : **vérifier en premier si sa règle CSS a
   été nichée par erreur dans un scope `.page-xxx`.**

4. **Boutons carrés partout (`border-radius: 0` / classe Bootstrap `rounded-0`), jamais
   ovales/pill.** Consigne explicite du client pour la hiérarchie visuelle du site — les
   boutons de filtre de la galerie (`.galerie-filter-btn`) et le CTA Instagram ont été
   corrigés en ce sens après un premier essai en `rounded-pill`.

5. **Pas de faux avis clients inventés.** **Résolu** (voir session Elfsight ci-dessous) :
   la section "Ils m'ont fait confiance" affiche maintenant un vrai widget Elfsight
   Google Reviews au lieu des placeholders `.avis-card` fabriqués. Ne jamais remplir une
   section d'avis avec des noms/témoignages inventés qui auraient l'air réels — ça reste
   la règle si on doit un jour customiser l'affichage au-delà du widget.

## Fonctionnalités externes en attente

### Formulaire de contact (`pages/contact.html`) — Resend branché (2026-07-15)

**Résolu.** Le client a choisi **Vercel** comme hébergeur (pas encore déployé au moment
de cette session, mais décidé). Implémentation :

- **`api/contact.js`** — fonction serverless Vercel (convention : tout fichier dans
  `/api` devient automatiquement une route `/api/<nom>`, pas de config
  supplémentaire nécessaire). Écrite en ESM (`import`/`export default`) car
  `package.json` a `"type": "module"` et Vercel respecte ce réglage pour le runtime
  Node des fonctions. Utilise le SDK officiel `resend` (ajouté en dépendance de
  **prod**, pas dev — c'est du code qui tourne au runtime, pas un outil de build).
  Valide les champs requis (`nom`, `prenom`, `email`, `message`) + le format email
  côté serveur (ne jamais faire confiance à la seule validation JS front), échappe le
  HTML injecté dans le corps de l'email (`escapeHtml`), renvoie 400/405/502/500 selon
  le cas. Utilise `replyTo: <email du visiteur>` pour que le photographe puisse
  répondre directement depuis sa boîte mail sans copier-coller l'adresse.
- **Adresse d'envoi ("from") : `onboarding@resend.dev`**, l'adresse de test fournie par
  Resend qui ne nécessite **aucune vérification de domaine**. Limite connue et
  volontairement acceptée pour l'instant : cette adresse ne peut envoyer qu'à l'adresse
  email du compte Resend du client (`laphotographie33@gmail.com`, codée en dur comme
  destinataire `TO_EMAIL`) — largement suffisant pour "recevoir les mails du formulaire
  de contact", qui est le seul besoin exprimé. **Dès qu'un domaine est vérifié sur le
  compte Resend** (ajout de la clé DNS SPF/DKIM chez l'hébergeur DNS du domaine, cf.
  doc Resend), remplacer `FROM_EMAIL` dans `api/contact.js` par une adresse du type
  `contact@aurelien-lambert-photographe.fr` — permettra aussi d'envoyer vers n'importe
  quelle adresse, pas seulement celle du compte.
- **`assets/js/contact-script.js` réécrit** : la logique de navigation entre étapes
  (`.btn-next`, validation des champs vides) est conservée telle quelle, extraite dans
  une fonction `validateStep()` réutilisable. Le bouton final de l'étape 3 a changé de
  classe `.btn-next` → `.btn-submit` (id `contact-submit-btn`) pour le distinguer des
  boutons "suivant" : au clic, il valide l'étape 3, rassemble tous les champs des 3
  `<form>` (via `[name]`, ajoutés à chaque input/select/textarea — **aucun n'avait de
  `name` avant**, seuls 2 selects avaient un `id`), et `fetch('/api/contact', {method:
  'POST', body: JSON.stringify(payload)})`. Bouton désactivé + texte "Envoi en
  cours…" pendant l'appel, message de succès/erreur affiché dans `#contact-form-status`
  (le message d'erreur invite explicitement à contacter par email en direct en
  fallback). Le script est maintenant chargé dans `contact.html` (`<script
  src="/assets/js/contact-script.js">`) — **c'était le bug initial** : le fichier
  existait mais n'était chargé sur aucune page.
- **Valeurs des `<select>` corrigées** : `Type de prestation` et `Comment avez-vous
  connu...` utilisaient des `value="1"`/`"2"`/... numériques — changées en valeurs
  textuelles (`value="Mariage"`, `value="Google"`, etc.) pour que l'email reçu soit
  lisible directement sans table de correspondance à retenir.
- **`eslint.config.mjs`** : ajout d'un bloc de config dédié à `api/**/*.js`
  (`sourceType: "module"` + `globals.node`), car le bloc générique du fichier force
  `sourceType: "commonjs"` sur tous les `.js` (pensé pour les scripts navigateur de
  `assets/js/`, incompatible avec `import`/`export` d'une fonction serverless Node).
- **`.env.example` créé** (`RESEND_API_KEY=re_xxx`) + `.gitignore` mis à jour
  (`.env`, `.env.local`, `.env.*.local`, `.vercel`) — **aucune vraie clé API n'a été
  commitée ni même créée dans cet environnement**, seulement un exemple. Le client doit
  générer sa propre clé sur le dashboard Resend et la renseigner dans les variables
  d'environnement du projet Vercel (Project Settings → Environment Variables), pas dans
  un fichier du repo.
- **Testé sans clé API réelle** : logique de validation de `api/contact.js` testée en
  invoquant le handler directement en Node (mock `req`/`res`) — confirmé 405 (mauvaise
  méthode), 400 (champs manquants), 400 (email invalide), 502 (clé Resend invalide,
  géré proprement sans crash). Parcours complet du formulaire (3 étapes, validation,
  succès, erreur serveur) testé en Playwright contre un petit serveur Node local qui
  simule `/api/contact` (`fail@example.com` → 502, sinon → 200) — navigation entre
  étapes OK, blocage si champs vides OK, message de succès/erreur affiché correctement,
  bouton réactivé après erreur. **Le vrai envoi d'email via Resend n'a pas pu être
  testé** (pas de clé API réelle disponible dans cet environnement) — à vérifier en
  conditions réelles une fois la clé et le déploiement Vercel en place.

### Instagram
Compte cible confirmé : **https://www.instagram.com/aurelien_lambert/**
Le bouton dédié "Voir plus sur Instagram" de la home a été retiré lors de la refonte de
la galerie (voir session Figma ci-dessous) — le lien pointe maintenant vers l'icône
Instagram du footer (`pages/footer.html`, autrefois un `href="#"` placeholder). Pas de
flux intégré. Un vrai flux embarqué nécessiterait un compte Instagram Business/Creator +
token + rafraîchissement serveur (même contrainte que Resend : pas faisable en JS pur
client-side de façon sûre). À ne considérer que si le client demande explicitement
l'étape suivante.

### Avis Google
Le client a une fiche Google Business Profile existante : recherche Google confirme un
"Knowledge Graph ID" `/g/11l29z663x` pour "Aurélien Lambert Photographe" (trouvé via
https://share.google/ziSDdHlCCAVybhzD8 → redirige vers une recherche Google avec
`kgmid=/g/11l29z663x`). **Prochaine étape concrète** : récupérer le vrai *Place ID*
(différent du kgmid, à retrouver via l'outil officiel "Place ID Finder" de Google ou via
l'API Places) puis créer une clé API Google Cloud restreinte par domaine (HTTP referrer)
pour appeler l'API Places (Place Details, champ `reviews`) directement depuis le
navigateur — pas besoin de backend contrairement à Resend/Instagram. Limite connue de
l'API : 5 avis maximum renvoyés, pas de tri/filtre possible.

## Bugs connus non corrigés (hors scope des demandes traitées jusqu'ici)

- `pages/mariage.html` : très léger débordement (3px) uniquement à 320px de large.
  Investigué : aucun élément individuel ne dépasse la viewport de plus de 0.5px (le
  script de détection par élément ne trouve aucun coupable), donc probablement une
  accumulation d'arrondis sous-pixel plutôt qu'un vrai bug de layout. Négligeable, pas
  de fix évident — à ignorer sauf si ça devient perceptible visuellement.

### Corrigé depuis : scroll horizontal sur contact.html et faq.html
Cause différente du bug de la home (celui du point 3 ci-dessus) : c'était le piège
Bootstrap classique de la `.row` avec des marges négatives non compensées.
- **`contact.html`** : les deux `.row.justify-content-center` de la section logos
  partenaires ("À leurs côtés, appareil en main") étaient des enfants directs de
  `<section>`, sans `.container`/`.container-fluid` parent — la marge négative
  `-12px` de `.row` débordait donc dans le vide. Fix : les deux `.row` ont été
  enveloppées dans un `<div class="container">`.
- **`faq.html`** : plus subtil — la `.row g-5` (colonnes Questions Fréquentes) avait
  bien un `.container` parent, mais `g-5` fixe `--bs-gutter-x: 3rem` (donc marge
  négative de -24px) **uniquement sur la row**, alors que le `.container` parent
  garde le gutter par défaut (1.5rem → padding de 12px) puisque la variable CSS ne
  remonte pas au parent. D'où un débordement net de 12px (24-12) de chaque côté. Fix :
  ajouté la classe `g-5` **aussi sur le `.container`** englobant, pour que son
  padding suive le même gutter que la row qu'il contient. **Retenir ce piège** :
  toute utilisation d'un utilitaire de gutter (`g-*`, `gx-*`) différent du défaut sur
  une `.row` doit être répercutée sur le `.container` parent, sinon débordement
  garanti.
- Liens footer "Mentions légales" et "Politique de confidentialité" pointent vers `#`
  (pages non créées) — obligatoire légalement en France pour un site pro.
  **Corrigé depuis** : l'icône Instagram du footer pointait aussi vers `#` alors que le
  vrai lien existait déjà ailleurs sur la home — elle pointe maintenant vers
  `https://www.instagram.com/aurelien_lambert/` (voir session Figma ci-dessous).
  LinkedIn/Facebook restent en `#` (pas de compte confirmé par le client pour ces
  réseaux).
- Pas de page 404 personnalisée.
- `eslint.config.mjs` importe `./site-photo/node_modules/@eslint/js/types`, un chemin
  vers un sous-dossier `site-photo/` qui n'existe pas dans ce repo (résidu d'une
  structure de dossier différente) → `npm run lint` échoue immédiatement avec
  `ERR_MODULE_NOT_FOUND`. `node_modules/` n'est en plus pas installé
  (`npm install` jamais lancé). À corriger avant de pouvoir lint.
- `darken($color-cream, 10%)` (~ligne 2325 de `main.scss`) utilise l'API couleur legacy
  de Sass, dépréciée par Dart Sass (warning à la compilation). À migrer vers
  `color.adjust($color-cream, $lightness: -10%)` avant que ça casse avec Dart Sass 2.0.

## Session SEO / GSAP / cohérence (2026-07-15)

- **SEO** : titres de page harmonisés (`Page - Aurélien Lambert Photographe` partout ;
  certains n'avaient que "Contact"/"FAQ"/"Le Blog"/"Accueil"), `meta description` +
  Open Graph + `twitter:card` + `<link rel="canonical">` ajoutés sur `index.html` et
  les 10 pages de `pages/`. Favicon = le logo SVG déjà utilisé dans la navbar
  (`/assets/icons/Fichier 8PPPP.svg`). `robots.txt` et `sitemap.xml` créés à la racine.
  **Domaine utilisé partout : `https://www.aurelien-lambert-photographe.fr` — c'est un
  placeholder, à remplacer par le vrai nom de domaine (find & replace) dès qu'il est
  choisi**, dans `robots.txt`, `sitemap.xml` et tous les `<link rel="canonical">` /
  `og:url` / `og:image`.
- **Accessibilité/SEO structurelle** : `mariage.html`, `portraits.html`,
  `maternite.html`, `animalier.html`, `corporate.html` n'avaient **aucun `<h1>`** (le
  titre de page était un `<h2 class="mariage-h2">`). Passé en `<h1 class="mariage-h2">`
  (la classe pilote le style, pas le tag, donc zéro impact visuel) — chaque page a
  maintenant exactement un `<h1>`, vérifié par script Playwright.
- **Bug de polices custom cassées sur tout le site** (trouvé pendant la vérification
  Playwright, hors scope initial mais corrigé vu l'impact) : la moitié des `@font-face`
  dans `main.scss` pointaient vers des fichiers inexistants (mauvais dossier
  `Playfair/` au lieu de `Playfair-Display/`, mauvaise extension `.ttf` au lieu de
  `.woff`, ou chemin à plat `/assets/fonts/Montserrat-Medium.ttf` sans sous-dossier).
  `$font-playfair` (= `'playfair-regular'`) et `$font-montserrat` (= `'montserrat-regular'`),
  utilisés dans la quasi-totalité des `font-family` du fichier, ainsi que les familles
  littérales `'Playfair Display'` et `'Montserrat'` (~25 usages), retombaient donc
  silencieusement sur Georgia/Arial. Tous les `src: url(...)` corrigés vers les vrais
  fichiers `.woff` existants, `font-display: swap` ajouté partout. Vérifié : zéro 404
  sur les polices sur les 11 pages testées, `getComputedStyle` confirme l'application
  des polices custom.
- **GSAP** : effets d'entrée légers ajoutés dans `assets/js/main.js` (centralisé, donc
  actif sur toutes les pages qui chargent `main.js`) — hero de la home au chargement,
  bio-photographe et galerie d'aperçu au scroll, avis clients au scroll, `<h1>` et
  `<h2 class="mariage-h2">` des pages internes. Tout est dans
  `if (!prefersReducedMotion)` (`matchMedia('(prefers-reduced-motion: reduce)')`).
  N'a pas touché à `prestations.html` (déjà géré par `gallery-filter.js`/`lightbox.js`).
- **Avis Google** : lien de fiche fourni par le client
  (`https://share.google/hYGjhQZFiIzyCbFEW`) redirige vers la même recherche déjà
  documentée plus haut, kgmid `/g/11l29z663x`. Toujours pas de vrai *Place ID* récupéré
  (nécessite l'outil "Place ID Finder" de Google ou un appel API Places manuel — non
  faisable depuis cet environnement).

## Session GSAP chiffres + refonte galerie home (2026-07-15, suite)

- **GSAP — page "À propos" (`pages/apropos.html`)** : ajout dans `assets/js/main.js` de
  `.hero-about__text` (entrée au chargement), `.about-intro__img`/`__title`/`__content`
  (scroll, même pattern que `.bio-photographe`), `.about-principles__item` (stagger au
  scroll), `.about-stats__title`/`__divider`/`__item` (fade au scroll). **Compteur animé
  sur les chiffres** (`.about-stats__number` : "500+", "50.000+", "15+") : parse la
  valeur cible et le suffixe depuis le texte existant dans le HTML (donc pas de
  duplication de données), anime un objet proxy de 0 à la cible avec GSAP
  (`scrollTrigger: { once: true }`), reformate `toLocaleString('fr-FR')` en remplaçant
  l'espace insécable par un point pour retrouver le format `50.000` d'origine. Vérifié
  en Playwright : capture mid-animation ("401+", "40.123+", "12+") puis valeur finale
  strictement identique au texte HTML d'origine.
- **Refonte de la galerie home** intégrée à partir d'un screenshot Figma fourni par le
  client (mosaïque asymétrique de 7 photos : 4 colonnes, 2 rangées, la photo
  "alliances" en noir et blanc spanning 2 colonnes). Nouvelle classe CSS
  `.galerie-mosaique-item` dans `main.scss` (`aspect-ratio: 4/3`, `8/3` pour la cellule
  qui a aussi `.col-md-6`), réutilise le bouton `.galerie-filter-btn-img` existant donc
  les 7 photos sont cliquables et ouvrent la lightbox déjà en place (`lightbox.js`,
  modale unique partagée — cf. décision #2 plus haut). **Aucune photo du Figma n'a
  d'équivalent exact dans `assets/img/`** (pas de "château/terrasse avec tables rondes"
  ni de "chien assis sur une botte de foin" identifiés après recherche visuelle sur les
  images non utilisées ailleurs) : remplacées par les photos existantes les plus proches
  thématiquement (`mariage-16.webp`, `mariage-12.webp`, `mariage-13.webp`,
  `portrait-2.webp`, `portrait-4.webp`, `canin-18.webp`, `canin-1.webp` — toutes déjà
  utilisées ailleurs sur le site sauf `mariage-16`, `canin-18` et `canin-1`, jusque-là
  inutilisées). **Si le client fournit les vraies photos du Figma**, il suffit de
  remplacer les `src`/`alt` des 7 `<img>` dans `#galerie-mosaique` de `index.html`, la
  structure/CSS n'a pas besoin de changer.
  - **Position finale (suite à une demande de correction du client)** : la mosaïque vit
    dans sa propre section `id="galerie-mosaique"`, juste sous le hero (avant
    "Prestations"), titre "Des instants vrais et spontanés", bouton "EN DÉCOUVRIR
    DAVANTAGE" (corrigé depuis "D'AVANTAGE", faute dans le Figma) → `/pages/prestations.html`.
    L'**ancienne section galerie 3-photos + bouton "VOIR PLUS SUR INSTAGRAM"** a été
    restaurée à l'identique à son emplacement d'origine, `id="section-galerie"`, entre
    `.bio-photographe` et la section avis (c'est elle que cible l'ancre
    `/index.html#section-galerie` du footer). Les deux sections ont la classe
    `.page-galerie` (police Playfair) mais des triggers GSAP distincts dans
    `assets/js/main.js` (`#galerie-mosaique` vs `#section-galerie`) pour éviter toute
    ambiguïté de sélecteur.

## Session avis Google via Elfsight (2026-07-15, suite)

- La section "Ils m'ont fait confiance" (`.avis-section` dans `index.html`) n'affiche
  plus les 3 `.avis-card` placeholder ("Client Mariage", témoignage "à venir…") : elles
  ont été remplacées par le widget **Elfsight Google Reviews** fourni par le client
  (`elfsight-app-68481708-4da3-4ad8-9b85-136a69be78ce`, script
  `https://elfsightcdn.com/platform.js`). Vérifié en Playwright : le widget charge de
  vrais avis Google (5,0★, 32 avis au moment du test, ex. avis de "Navarro Clara").
  Résout définitivement la consigne "pas de faux avis inventés" (décision #5 plus haut).
- Le GSAP de la section avis (`assets/js/main.js`) ne cible plus `.avis-card`
  (supprimées) mais `.avis-section__divider, .avis-section h3` pour garder une petite
  entrée au scroll sur le titre — le contenu du widget Elfsight lui-même est injecté
  dynamiquement par leur script et n'est pas animé (pas de contrôle sur son DOM interne).
- Pas de configuration supplémentaire faite côté Elfsight (langue, nombre d'avis
  affichés, thème clair/sombre) : c'est piloté depuis leur dashboard, pas depuis le
  code. Si le rendu ne convient pas visuellement, le réglage se fait sur
  elfsight.com, pas dans ce repo.

## Session carrousel hero + fix navbar (2026-07-15, suite)

- **Carrousel automatique dans le hero de la home** (`index.html`, `.hero-accueil`) :
  remplace l'unique `background-image: url('../img/mariage/mariage-35.webp')` fixe par
  un carrousel Bootstrap (`carousel-fade`, `data-bs-ride="carousel"`,
  `data-bs-interval="5000"`, sans flèches ni indicateurs — défilement passif) qui cycle
  sur les 5 catégories : `mariage-35.webp`, `portrait-4.webp`, `maternite-2.webp`,
  `equin-10.webp`, `corporate-7.webp`. Le carrousel est en position absolute (z-index
  0) derrière un nouveau `.hero-accueil-overlay` (dégradé noir 35%→55%, z-index 1), le
  contenu texte passe en z-index 2. **Le texte du hero (titre + sous-titre) est passé de
  `$color-text-dark` à `$color-light`** puisqu'il doit maintenant rester lisible sur 5
  photos différentes plutôt que sur une seule image choisie pour son ciel clair — sans
  cet overlay + changement de couleur, le texte foncé aurait été illisible sur au moins
  2 des 5 photos (`equin-10`, `corporate-7`, plus sombres). Vérifié en Playwright :
  fondu automatique confirmé après 5s (`mariage-35` → `portrait-4`), zéro overflow,
  zéro erreur console.
- **Bug navbar corrigé** : entre 768px et ~1150px de large, le menu horizontal (6 liens
  + bouton "Contactez-moi") débordait de sa colonne `col-md-6` et chevauchait le logo
  et le bouton (texte "Accueil" sur le logo, "FAQ"/"Blog" sous "CONTACTEZ-MOI") — le
  CSS `.nav-links a { font-size: 24px }` sans réduction responsive ne tenait pas dans
  la largeur disponible avant ~1200px. Deux corrections combinées dans
  `pages/navbar.html` et `sass/main.scss` :
  1. Le point de bascule mobile/desktop (burger vs menu horizontal) a été repoussé de
     `md` (768px) à `lg` (992px) — tous les `col-md-*`/`d-md-*`/`order-md-*` de
     `navbar.html` sont devenus `col-lg-*`/`d-lg-*`/`order-lg-*`. En dessous de 992px,
     c'est maintenant le burger (déjà fonctionnel) qui gère l'affichage.
  2. Entre 992px et 1199px (tranche encore un peu juste même après le point 1), nouvelle
     media query dans `main.scss` qui resserre `.nav-links` (`font-size: 15px`,
     `gap: 0.85rem`) et `.btn-cta--navbar` (`font-size: 14px`, padding réduit). Au-delà
     de 1200px, les tailles d'origine (24px / gap-4) s'appliquent normalement.
  Vérifié en Playwright à 768/900/991/992/1024/1100/1199/1200px : plus aucun
  chevauchement, "CONTACTEZ-MOI" reste toujours sur une ligne.
- **Section "Tarifs" absente** : vérifié via `git diff origin/main` que ce n'est **pas**
  une régression introduite pendant cette session ou une précédente — `pages/prestations.html`
  n'a jamais eu de grille tarifaire dans son corps, seulement une galerie filtrable par
  thématique (ajoutée par Juan dans un commit antérieur déjà présent sur `origin/main`).
  Les seuls prix visibles sur le site restent les "À partir de 500€" sur les cartes
  Prestations de la home (`index.html`, section `#prestations-home`, jamais modifiées).
  Le lien footer "Tarifs" pointe vers `prestations.html` qui n'a donc pas de vraie
  section tarifaire dédiée — si le client veut vraiment une grille de prix, c'est à
  construire, pas à restaurer.
- **Débordement horizontal mobile (375px) repéré en marge de ces vérifications**, non
  corrigé (hors scope de la demande) : `.bio-photographe__label/__title/__text`
  débordent de 4px sur `index.html` à 375px de large — pré-existant, sans lien avec le
  carrousel ni la navbar. Probable piège `offset-md-1` classique (cf. méthode de
  détection de débordement plus haut). À corriger dans une prochaine session si demandé.

## Session GSAP contact + doc améliorations (2026-07-15, suite)

- **`assets/js/main.js` : la logique de compteur animé a été extraite** dans une
  fonction réutilisable `animateCounters(selector, { formatDot })` (au lieu du
  `forEach` en dur écrit pour `.about-stats__number`). `formatDot: true` reformate le
  séparateur de milliers en `.` (page "À propos", ex. `50.000`) ; sans l'option, le
  format par défaut de `toLocaleString('fr-FR')` (espace) est conservé tel quel — utile
  pour la page Contact dont le HTML utilise déjà un espace (`50 000+`), pas un point.
  **Nécessité pratique notée** : l'outil Edit a échoué de façon répétée sur ce fichier
  (`String to replace not found` malgré un contenu identique relu juste avant) — cause
  probable : fins de ligne CRLF sur ce fichier alors que l'edit envoyait du LF, ou un
  processus tiers (linter/formatter en watch) qui retouche le fichier entre la lecture
  et l'écriture. Contournement qui a fonctionné : réécrire le fichier entier avec
  `Write` plutôt que `Edit` sur ce fichier précis si le problème se reproduit.
- **GSAP ajouté sur `pages/contact.html`** : le hero (`.contact-hero-title`) était déjà
  couvert par le sélecteur générique existant. Nouveau : `.contact-table .table-row`
  (fade au scroll), `animateCounters('.contact-table__bold')` pour les 4 chiffres
  ("15+ ans", "500+ séances", "50 000+ photos", "100% passion"), et `.contact-logos`
  (stagger au scroll) pour les logos partenaires en bas de page. Vérifié en Playwright :
  capture mid-animation ("12+", "411+", "41 133+", "82%") puis valeur finale identique
  au HTML d'origine, zéro overflow.
- **Sous-titre du hero de `pages/prestations.html` corrigé** : c'était un copier-coller
  exact du sous-titre de la home (*"Laissez-vous surprendre par votre propre beauté à
  travers un regard bienveillant, à la frontière entre authenticité et poésie
  lumineuse."*), qui donnait l'impression que les deux pages étaient identiques. Le
  `<h1>` différait déjà, mais pas ce paragraphe. Remplacé par un texte propre à
  Prestations qui annonce la galerie filtrable juste en dessous.
- **`AMELIORATIONS.md` créé à la racine du projet** (visible pour l'utilisateur, pas
  seulement pour un futur agent comme `CONTEXT.md`) : explique le raisonnement derrière
  chaque choix SEO (title/description/canonical = résultats Google ; Open Graph =
  aperçu de partage réseaux sociaux ; robots.txt/sitemap.xml = exploration ; favicon ;
  fix des `<h1>` manquants), et liste des pistes d'amélioration futures classées par
  catégorie (contenu/business, technique, perf/accessibilité, SEO avancé) avec le
  "pourquoi" de chacune. À tenir à jour si de nouvelles pistes sont identifiées — ce
  fichier est destiné à être lu par le client/l'utilisateur, contrairement à
  `CONTEXT.md` qui reste la mémoire technique interne du projet.

## Session correction des 4 points "dette technique" (2026-07-15, suite)

Les 4 points listés dans `AMELIORATIONS.md` sous "Technique" ont été corrigés dans la
foulée de leur identification (voir aussi la mise à jour correspondante de ce fichier
plus haut, section Stack) :

1. `eslint.config.mjs` corrigé + `npm install` lancé (voir section Stack).
2. `darken()` → `color.adjust()` (4 usages dans `main.scss`, `@use "sass:color";`
   ajouté en tête de fichier). Zéro warning de dépréciation à la compilation.
3. Scripts `build:css`/`watch:css`/`dev` avec vraies devDependencies (voir section
   Stack).
4. **Débordement horizontal mobile (375px, `.bio-photographe__label/__title/__text`)
   — cause réelle trouvée, différente de la première hypothèse.** Investigué avec
   `getBoundingClientRect()` + `getComputedStyle()` sur l'élément exact : ce n'était
   **pas** un piège Bootstrap `offset-md-1`/marge négative comme supposé initialement,
   mais un effet de bord direct des animations GSAP "entrée en glissade" ajoutées lors
   de la toute première session GSAP (`x: 40` sur `.bio-photographe__label/__title/__text`,
   `x: ±40` sur `.about-intro__img/__title/__content`). `gsap.from({x: 40, opacity: 0,
   ...})` positionne l'élément à son état de départ (décalé de 40px, invisible) dès le
   chargement de la page, **avant** que le `scrollTrigger` ne se déclenche — ce
   décalage, bien qu'invisible (`opacity: 0`), élargit quand même
   `document.documentElement.scrollWidth` sur un viewport étroit. Fix : `overflow-x:
   hidden` ajouté sur `.bio-photographe` et `.about-intro` (les deux sections
   concernées). **Point de vigilance pour tout futur ajout de GSAP** : toute entrée
   animée en `x` (glissade latérale, par opposition à `y`) doit vivre dans une section
   avec `overflow-x: hidden`, sinon même schéma de débordement fantôme. Revérifié à
   320/375/414/768/1024/1440px après le fix : 0px de débordement partout (contre 4px
   avant, uniquement en dessous de ~768px).

## Session fix police "LAMBERT" + guide déploiement (2026-07-15, suite)

- **Bug de police trouvé et corrigé : le texte en gras retombait sur Georgia Bold au
  lieu de Playfair Display Bold.** Signalé par l'utilisateur sur `pages/apropos.html`
  ("Aurélien" en Playfair mais "LAMBERT" visuellement dans une tout autre police).
  Cause précise, différente d'un simple 404 : `'playfair-regular'` (= `$font-playfair`)
  n'a qu'**une seule** graisse déclarée dans son `@font-face` (pas de `font-weight`
  précisé, donc 400 par défaut). Quand un élément stylé avec cette famille reçoit
  `font-weight: 700` (ici via la classe Bootstrap `fw-bold`), le navigateur ne trouve
  aucune face 700 pour `'playfair-regular'` et **saute au fallback suivant de la pile**
  (`Georgia`) plutôt que de synthétiser un faux gras — d'où un texte qui bascule
  intégralement sur une police différente, pas juste "moins joli". Confirmé en
  Playwright (`document.fonts` : `playfair-regular` chargé, aucun 404) puis visuellement
  par screenshot. **3 occurrences du même piège trouvées et corrigées** (recherche de
  tout `font-family: $font-playfair` combiné à `font-weight: bold/700` ou `fw-bold`
  dans le projet) :
  - `.hero-about__title span` (le "LAMBERT" signalé) — page À propos.
  - `.prestation-card-title` — classe non utilisée actuellement dans le HTML (CSS
    mort), corrigée quand même par cohérence/anticipation.
  - `.step-number` — les 4 badges numérotés (1-2-3-4) de `pages/faq.html`, bug
    réellement visible là aussi, pas juste théorique.
  Fix appliqué partout : remplacer `font-family: $font-playfair` +
  `font-weight: bold/700` par `font-family: 'playfair-display-bold', Georgia, serif`
  directement (la vraie graisse grasse, déjà utilisée ailleurs sur le site pour ce
  même usage, ex. `.section-presta__title-bold`), en supprimant la déclaration
  `font-weight` devenue inutile. **Point de vigilance pour tout futur texte en gras
  utilisant une police custom** : vérifier qu'il existe bien un `@font-face` dédié pour
  la graisse demandée (`'xxx-bold'`), sinon le navigateur ne synthétise pas
  automatiquement un gras — il change carrément de police.
- **`GUIDE-DEPLOIEMENT.md` créé à la racine** (comme `AMELIORATIONS.md`, destiné à être
  lu par l'utilisateur) : guide pas-à-pas pour créer un compte Resend + clé API,
  comprendre la limite d'envoi de l'adresse de test `onboarding@resend.dev` (ne peut
  envoyer qu'à l'adresse du compte Resend tant qu'aucun domaine n'est vérifié — adapté
  au besoin exprimé de "tester la réception avec un email de test" avant d'aller plus
  loin), importer le projet sur Vercel depuis le repo GitHub
  (`Juanrojasdc/projet-site-photo`), configurer `RESEND_API_KEY` dans les variables
  d'environnement Vercel, tester en conditions réelles, et lire les logs de la
  fonction serverless en cas d'échec. Dernière section : comparaison lien `wa.me`
  (recommandé, aucune API, quelques minutes d'intégration) vs API WhatsApp Business
  Cloud de Meta (lourd — compte Meta Business, numéro vérifié, webhooks, coût par
  conversation — à ne considérer que si un besoin d'automatisation dépasse "permettre
  de contacter facilement"), pour la feature WhatsApp évoquée comme possible étape
  suivante. Rien n'a été codé pour WhatsApp à ce stade, uniquement la recommandation
  documentée — à faire au prochain tour si le client choisit l'option `wa.me`.

## Méthode utile : détecter un débordement horizontal

Playwright est installé globalement via le cache npx (`npx playwright install
chromium` déjà exécuté sur cette machine). Lancer un navigateur headless nécessite
`dangerouslyDisableSandbox: true` sur l'outil Bash dans cet environnement, sinon le
lancement du navigateur time-out après 180s. Script type :

```js
const { chromium } = require('playwright');
// ... goto(url), puis dans page.evaluate() comparer
// document.documentElement.scrollWidth à window.innerWidth,
// et parcourir document.querySelectorAll('*') pour repérer les
// éléments dont getBoundingClientRect().right dépasse innerWidth.
```

Nécessite `npm install playwright --no-save` dans un dossier scratch (le module n'est
pas dans les dépendances du projet, seul le binaire Chromium est mis en cache
globalement par `playwright install`).

**Piège rencontré** : `package.json` du projet contient `"type": "module"`. Un script
`.js` posé **dans le dossier du projet** (ex. `projet-site-photo/scratch-check.js`) sera
donc chargé comme ES module par Node, et `require('playwright')` y échouera
immédiatement (`ReferenceError: require is not defined`). Toujours écrire ces scripts de
diagnostic Playwright **en dehors** du dossier du projet (dans un dossier scratch qui
n'a pas de `package.json` avec `"type": "module"`), ou utiliser l'extension `.cjs`, ou
convertir en `import` ESM. Un premier agent délégué sur la correction du scroll
horizontal (contact.html/faq.html) s'est bloqué/a échoué à cause de ça — ne pas répéter
l'erreur.

## Ce qui a déjà été vérifié/testé cette session

- Aucun lien mort restant (`grep -rhoE 'href="/[^"]*"'` sur tous les `.html`).
- Zéro débordement horizontal sur `index.html` et `pages/prestations.html` à 320/375/
  768/1440px (testé avec Playwright, cf. méthode ci-dessus).
- CSS recompilé et à jour avec le SCSS source à la fin de cette session.
