# Pourquoi le SEO a été fait ainsi, et pistes d'amélioration

Ce document répond à deux questions : pourquoi le SEO a été construit de cette façon
(meta description, Open Graph, `robots.txt`, `sitemap.xml`, etc.), et qu'est-ce qu'on
pourrait encore améliorer sur le site, avec la raison derrière chaque piste.

## 1. Pourquoi le SEO a été fait comme ça

Le SEO d'un site vitrine repose sur trois couches indépendantes. Chacune répond à un
problème précis — inutile d'en faire une sans les autres, elles se complètent.

### a) Ce que Google affiche dans les résultats de recherche

- **`<title>`** : c'est le texte bleu cliquable dans les résultats Google. Avant, la
  home s'appelait juste "Accueil", `contact.html` juste "Contact" — invisible pour
  Google et illisible dans un onglet de navigateur ouvert parmi 10 autres. Chaque page
  a maintenant un titre unique et descriptif (`Photographe Mariage en Gironde -
  Aurélien Lambert`) : Google affiche ce texte tel quel, et c'est aussi le premier
  signal qu'il utilise pour comprendre le sujet de la page.
- **`<meta name="description">`** : c'est le texte gris sous le lien dans les résultats
  Google. Sans elle, Google invente un extrait en piochant du texte au hasard dans la
  page — souvent un menu ou une légende de photo, pas engageant. Avec une description
  écrite à la main (et différente par page, pour ne pas se cannibaliser entre elles),
  on contrôle ce qu'un visiteur lit avant de cliquer.
- **`<link rel="canonical">`** : indique à Google quelle est l'URL "officielle" d'une
  page. Utile dès qu'une même page est accessible par plusieurs chemins (avec ou sans
  `www`, avec des paramètres de tracking, etc.) — évite que Google considère deux URLs
  comme du contenu dupliqué et dilue le référencement entre les deux.

### b) Ce qui s'affiche quand un lien est partagé (réseaux sociaux, WhatsApp, Slack…)

- **Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:locale`)** :
  sans ces balises, un lien partagé sur Instagram/Facebook/WhatsApp affiche une carte
  vide ou un aperçu générique. Avec elles, on choisit précisément le titre, le texte et
  **la photo** qui apparaissent — important pour un photographe dont le métier est
  justement de vendre par l'image. `twitter:card` fait la même chose pour X/Twitter.

### c) Ce qui aide Google (et les autres moteurs) à explorer le site efficacement

- **`robots.txt`** : dit aux robots d'indexation "vous pouvez tout explorer" (`Allow:
  /`) et leur donne l'adresse du plan du site. Sans lui, rien ne change radicalement,
  mais c'est la première chose qu'un robot lit en arrivant sur le domaine — son absence
  est un signal de site mal entretenu.
- **`sitemap.xml`** : une liste de toutes les pages importantes avec leur priorité
  relative. Sur un petit site de 11 pages, Google les trouverait de toute façon en
  suivant les liens du menu — le sitemap n'est donc pas vital ici, mais il accélère la
  découverte d'une page après une modification (`lastmod`) et ne coûte rien à
  maintenir.
- **Favicon** (`<link rel="icon">`) : sans lui, l'onglet du navigateur et les résultats
  de recherche mobile affichent une icône générique/grise. On a réutilisé le logo SVG
  déjà présent dans la navbar plutôt que de générer un nouveau fichier, pour rester
  cohérent visuellement sans travail de design supplémentaire.

### d) Un bonus structurel trouvé en testant : les balises `<h1>`

5 pages (`mariage`, `portraits`, `maternite`, `animalier`, `corporate`) n'avaient
**aucun `<h1>`** — le titre de page était un `<h2>`. Le `<h1>` est le signal de
structure le plus fort qu'on puisse donner à Google sur "de quoi parle cette page" :
sans lui, Google doit deviner. Corrigé en changeant juste le tag (`h2` → `h1`), sans
toucher au style puisque c'est la classe CSS qui pilote l'apparence, pas le tag HTML.

### Ce qui reste à faire côté SEO

- **Remplacer le domaine placeholder** `https://www.aurelien-lambert-photographe.fr`
  utilisé partout (canonical, OG, `robots.txt`, `sitemap.xml`) par le vrai nom de
  domaine une fois choisi — un simple rechercher/remplacer sur le projet.
- **Soumettre le site à Google Search Console** une fois en ligne, pour surveiller
  l'indexation réelle et détecter les erreurs d'exploration.
- **Données structurées (JSON-LD)** de type `LocalBusiness`/`Photographer` : permet à
  Google d'afficher des infos enrichies (téléphone, adresse, avis) directement dans les
  résultats de recherche. Non fait pour l'instant — plus utile une fois le site en
  ligne avec un vrai nom de domaine et une fiche Google Business bien reliée.

## 2. Pourquoi "Prestations" et "Accueil" se ressemblaient

Repéré et corrigé : le sous-titre du hero de `prestations.html` (*"Laissez-vous
surprendre par votre propre beauté à travers un regard bienveillant, à la frontière
entre authenticité et poésie lumineuse."*) était un **copier-coller exact** du
sous-titre de la home. Le titre (`<h1>`) était bien différent sur les deux pages, mais
le sous-titre, identique mot pour mot, donnait l'impression de deux pages jumelles.
Remplacé par un texte propre à Prestations (*"Mariage, portrait, maternité, animalier,
corporate : cinq univers, un même regard sincère porté sur vos plus beaux
instants."*), qui annonce le contenu réel de la page (la galerie filtrable par
thématique juste en dessous) plutôt que de répéter la promesse générale de la home.

## 2bis. Autre incohérence trouvée et corrigée : le bouton "Voir plus" souligné

Sur la home, le bouton "Voir plus" (section Prestations) s'affichait en bleu souligné
au lieu du style bouton attendu (bordure noire, texte noir, sans soulignement). Cause :
c'était un `<button>` imbriqué dans un `<a>` sans classe — une imbrication
techniquement invalide (deux éléments interactifs l'un dans l'autre), qui fait
ressortir le style de lien par défaut du navigateur malgré les classes Bootstrap
posées sur le bouton intérieur. Le reste du site utilise le bon pattern (un `<a>`
stylé directement comme bouton, ex. `.btn-accueil-primary`, `.instagram-cta`) — ces
deux boutons "Voir plus" et les 15 boutons "Réserver cette formule" (3 par page sur
`mariage.html`, `portraits.html`, `maternite.html`, `animalier.html`,
`corporate.html`) suivaient l'ancien pattern cassé. Corrigé partout en appliquant les
classes directement sur le `<a>` et en supprimant le `<button>` imbriqué.

## 3. Autres améliorations potentielles

### Contenu / business (impact direct sur les visiteurs et les conversions)

- **Section "Tarifs" à construire.** Il n'existe aujourd'hui aucune vraie grille de
  prix sur le site — seulement des "À partir de 500€" par catégorie sur la home. Un
  visiteur qui veut comparer des formules avant de contacter n'a pas cette info.
  *Pourquoi c'est utile* : réduit le nombre de messages "c'est combien ?" et pré-qualifie
  les demandes de contact.
- ~~**Formulaire de contact à brancher.**~~ **Corrigé.** Le script est maintenant
  chargé, et la soumission finale envoie un vrai email via l'API Resend (fonction
  serverless `api/contact.js`, pensée pour un déploiement Vercel). Reste à faire côté
  client : créer sa clé API sur resend.com et la renseigner dans les variables
  d'environnement du projet Vercel une fois déployé — voir `CONTEXT.md` pour le détail
  complet (adresse d'envoi de test, limite tant qu'aucun domaine n'est vérifié, etc.).
- **Pages légales manquantes** ("Mentions légales", "Politique de confidentialité" —
  liens `#` dans le footer). *Pourquoi* : obligatoire légalement en France pour un site
  professionnel qui collecte des données (formulaire de contact).
- **Page 404 personnalisée.** *Pourquoi* : un lien mort renvoie aujourd'hui vers la 404
  brute de l'hébergeur, qui casse la navigation et l'image de marque à ce moment précis.
- **Réseaux sociaux du footer** (LinkedIn, Facebook) toujours en `#`, faute de comptes
  confirmés par le client. *Pourquoi* : soit les retirer (un lien mort visible nuit à
  la crédibilité), soit les brancher si les comptes existent.

### Technique (dette qui ralentit le développement futur)

Les 4 points ci-dessous ont été corrigés :

- ~~**`npm run lint` cassé**~~ **Corrigé.** `eslint.config.mjs` importait
  `@eslint/js`/`globals` depuis un chemin `./site-photo/node_modules/...` qui n'existe
  pas dans ce repo — remplacé par des imports de package normaux (`"@eslint/js"`,
  `"globals"`). `npm install` a été lancé (73 paquets, jamais installés avant). Les
  globales injectées par les `<script>` CDN (`$`, `jQuery`, `gsap`, `ScrollTrigger`,
  `bootstrap`) ont aussi été déclarées dans la config — sans ça, eslint les signalait
  comme variables non définies alors que ce sont des globales légitimes de ce projet
  (chargées en CDN, jamais importées comme modules). `npm run lint` passe maintenant
  sans erreur.
- ~~**`darken()` déprécié**~~ **Corrigé.** Les 4 usages dans `main.scss` sont passés à
  `color.adjust($couleur, $lightness: -10%)` (ajout de `@use "sass:color";` en tête de
  fichier). Plus aucun warning de dépréciation à la compilation.
- ~~**Pas de pipeline de build automatique**~~ **Corrigé.** `sass`, `concurrently` et
  `http-server` sont maintenant de vraies `devDependencies` (avant : appelés en `npx`
  à la volée, jamais installés). Nouveaux scripts npm :
  - `npm run build:css` — compilation SCSS→CSS en une fois (équivalent à l'ancienne
    commande manuelle, mais versionnée dans `package.json`).
  - `npm run watch:css` — recompile automatiquement à chaque sauvegarde de `.scss`.
  - `npm run dev` — lance le serveur local **et** le watcher SCSS en parallèle (via
    `concurrently`), donc plus besoin de penser à relancer la compilation après une
    modif de style.
- ~~**Débordement horizontal mobile (375px)**~~ **Corrigé — et la cause réelle était
  différente de ce qui était supposé.** Ce n'était pas un piège `offset-md-1`/marge
  négative Bootstrap : c'était un effet de bord de l'animation GSAP "entrée en glissade"
  (`x: 40` sur `.bio-photographe__label/__title/__text`, `x: ±40` sur
  `.about-intro__img/__title/__content`). Avant que l'animation ne se déclenche au
  scroll, l'élément est positionné à son état de départ (décalé de 40px, invisible
  car `opacity: 0`) — sur un viewport étroit, ce décalage dépasse la largeur de l'écran
  et élargit `scrollWidth`, créant un débordement horizontal fantôme même si rien
  n'est visuellement décalé à l'œil. Fix : `overflow-x: hidden` sur les deux sections
  concernées (`.bio-photographe`, `.about-intro`) — la même précaution qu'il faudra
  reproduire sur toute future section utilisant une entrée GSAP en `x` plutôt qu'en
  `y`. Vérifié à 320/375/414/768/1024/1440px : 0px de débordement partout.

### Performance / accessibilité

- **Images non compressées de façon homogène.** Certaines images (`portrait-12.webp`)
  dépassent 1 Mo alors que la plupart sont sous 300 Ko. *Pourquoi* : sur un site-vitrine
  où les photos sont l'argument de vente, un poids d'image élevé ralentit surtout le
  premier chargement mobile — un passage systématique dans un outil de compression
  (type Squoosh) harmoniserait ça sans perte de qualité visible.
- **Audit `prefers-reduced-motion` déjà en place pour le GSAP**, mais pas vérifié pour
  les transitions CSS pures (hover, `.scrolled` navbar). *Pourquoi* : cohérence — si on
  respecte la préférence utilisateur à un endroit, autant le faire partout où il y a du
  mouvement.
- **Alt text vides** sur les logos partenaires de `contact.html` (`alt=""`).
  *Pourquoi* : `alt=""` est correct pour une image purement décorative, mais des logos
  de partenaires/clients ont une valeur informative (ils identifient qui fait confiance
  au photographe) — un lecteur d'écran ne peut pas les nommer actuellement.

### SEO avancé (une fois le site en ligne)

- Données structurées JSON-LD (voir section 1).
- Google Search Console + Bing Webmaster Tools.
- Vrai *Place ID* Google pour, à terme, remplacer/compléter le widget Elfsight par un
  appel direct à l'API Google Places si le besoin de personnalisation dépasse ce que
  permet le widget.
