# Guide A→Z : Resend + déploiement Vercel

Ce guide part du principe que tu veux d'abord **vérifier que la réception des mails
fonctionne avec ton adresse email personnelle**, avant d'éventuellement passer à un
domaine vérifié plus tard. Il couvre aussi, à la fin, ce qu'il faut savoir avant
d'ajouter un contact WhatsApp.

Le code (`api/contact.js`, `assets/js/contact-script.js`) est déjà en place et testé
(voir `CONTEXT.md`, section "Formulaire de contact — Resend branché"). Ce qui reste,
c'est la partie "compte / déploiement", qui ne se fait pas depuis le code.

## Étape 1 — Créer un compte Resend et récupérer une clé API

1. Va sur [resend.com](https://resend.com) et crée un compte (gratuit jusqu'à 3 000
   emails/mois, largement suffisant pour un formulaire de contact).
2. Une fois connecté, vérifie ton **adresse email de compte** (celle avec laquelle tu
   t'es inscrit) — c'est cette adresse-là que Resend va laisser recevoir les tests
   tant qu'aucun domaine n'est vérifié (voir étape 2).
3. Va dans **API Keys** (menu de gauche) → **Create API Key**.
   - Nom : ce que tu veux (ex. `laphotographie33-contact`).
   - Permission : **Sending access** suffit (pas besoin de "Full access").
4. Resend affiche la clé **une seule fois** (`re_xxxxxxxxxxxxxxxxxxxxx`). Copie-la
   immédiatement dans un endroit sûr (gestionnaire de mots de passe) — impossible de
   la revoir après coup, il faudra en recréer une si tu la perds.

**Ne mets jamais cette clé dans un fichier du projet.** Le fichier `.env.example` à la
racine montre le format attendu, mais reste un exemple vide — la vraie clé va
uniquement dans les variables d'environnement Vercel (étape 4).

## Étape 2 — Comprendre la limite "sans domaine vérifié"

Dans `api/contact.js`, l'adresse d'envoi (`FROM_EMAIL`) est actuellement
`onboarding@resend.dev` — une adresse de test fournie par Resend qui ne demande
**aucune configuration DNS**. C'est volontaire pour cette phase de vérification.

**Limite à connaître** : avec cette adresse de test, Resend n'autorise l'envoi **qu'à
l'adresse email de ton propre compte Resend** (celle de l'étape 1). Concrètement :

- `TO_EMAIL` dans `api/contact.js` est codé en dur sur `laphotographie33@gmail.com`.
- Si le compte Resend a été créé avec **cette même adresse**, tout fonctionne tel quel.
- Si le compte Resend a été créé avec une **autre adresse** (ex. ton adresse perso pour
  tester d'abord), change temporairement `TO_EMAIL` dans `api/contact.js` pour qu'elle
  corresponde à l'adresse du compte Resend, le temps de la phase de test. Tu la
  remettras sur `laphotographie33@gmail.com` une fois qu'un domaine sera vérifié
  (étape 6) ou si le compte Resend est créé avec l'adresse Gmail du studio.

C'est exactement le scénario "email de test pour vérifier la bonne réception" que tu
décrivais — pas besoin d'aller plus loin pour ça.

## Étape 3 — Créer un compte Vercel et importer le projet

1. Va sur [vercel.com](https://vercel.com) → **Sign Up** → connecte-toi avec ton compte
   **GitHub** (le même que celui qui héberge
   [`Juanrojasdc/projet-site-photo`](https://github.com/Juanrojasdc/projet-site-photo)
   — ça permet à Vercel de déployer automatiquement à chaque push).
2. Une fois connecté : **Add New...** → **Project**.
3. Sélectionne le repo `projet-site-photo` dans la liste (autorise Vercel à accéder à
   ton compte GitHub s'il le demande).
4. Sur l'écran de configuration :
   - **Framework Preset** : laisse sur `Other` (le projet est un site statique + une
     fonction serverless dans `/api`, Vercel détecte ce dossier tout seul, pas besoin
     de framework spécifique).
   - **Root Directory** : si le repo GitHub contient directement `index.html`,
     `api/`, etc. à la racine, laisse tel quel. (Vérifie sur GitHub que le dossier
     `projet-site-photo` que tu utilises en local est bien la racine du repo, pas un
     sous-dossier.)
   - **Build Command** / **Output Directory** : laisse vide/par défaut — il n'y a pas
     de build à proprement parler (pas de framework React/Vue), Vercel sert les
     fichiers statiques tels quels.

**Ne clique pas encore sur "Deploy"** — configure d'abord la variable d'environnement
(étape suivante), sinon le premier déploiement partira sans la clé API et le
formulaire échouera au premier test.

## Étape 4 — Ajouter la clé Resend dans les variables d'environnement Vercel

Toujours sur l'écran de configuration du projet (ou après coup dans **Project
Settings → Environment Variables** si tu as déjà déployé) :

1. Ouvre la section **Environment Variables**.
2. Ajoute :
   - **Key** : `RESEND_API_KEY`
   - **Value** : la clé copiée à l'étape 1 (`re_xxxxxxxxxxxxxxxxxxxxx`)
   - **Environments** : coche **Production**, **Preview** et **Development** (les
     trois, pour que ça marche aussi bien sur les URLs de preview que sur le domaine
     final).
3. Clique sur **Deploy**.

Vercel construit et déploie le site (quelques dizaines de secondes). Tu obtiens une
URL du type `projet-site-photo-xxxx.vercel.app`.

## Étape 5 — Tester le formulaire en conditions réelles

1. Ouvre `https://<ton-url>.vercel.app/pages/contact.html`.
2. Remplis les 3 étapes du formulaire avec une vraie adresse email à toi (pas besoin
   que ce soit l'adresse du compte Resend — c'est l'adresse **destinataire**,
   `TO_EMAIL`, qui est contrainte, pas celle que le visiteur saisit).
3. Au clic sur "Planifions votre séance" :
   - **Si ça marche** : message vert "Merci ! Votre message a bien été envoyé...".
     Va vérifier la boîte mail de `TO_EMAIL` (pense aux spams pour ce premier test,
     `onboarding@resend.dev` n'a pas encore d'historique de réputation).
   - **Si ça échoue** : message rouge avec l'erreur. Les causes les plus probables :
     - `RESEND_API_KEY` absente/mal orthographiée dans les variables d'environnement
       Vercel → va dans **Project Settings → Environment Variables**, vérifie, et
       **redéploie** (Vercel ne relit pas automatiquement les variables sans
       redéploiement — onglet **Deployments** → "..." sur le dernier déploiement →
       **Redeploy**).
     - `TO_EMAIL` (dans `api/contact.js`) ne correspond pas à l'adresse du compte
       Resend → voir étape 2.
4. Pour du debug plus fin : **Vercel Dashboard → ton projet → Deployments → (le
   déploiement actif) → Functions → `api/contact`** affiche les logs d'exécution en
   temps réel, y compris les `console.error` du code (`Resend error: ...`,
   `Contact form error: ...`).

## Étape 6 — Plus tard : lever la limite avec un vrai domaine (optionnel)

Une fois que tu es prêt à envoyer vers n'importe quelle adresse (pas seulement celle du
compte Resend) :

1. Choisis le nom de domaine définitif du site (celui qui remplacera le placeholder
   `aurelien-lambert-photographe.fr` utilisé dans le SEO — voir `CONTEXT.md`).
2. Sur Resend : **Domains → Add Domain**, entre le domaine (idéalement un
   sous-domaine dédié type `mail.tondomaine.fr`, recommandé par Resend pour ne pas
   affecter la réputation du domaine principal).
3. Resend fournit des enregistrements DNS (SPF, DKIM, parfois un MX) à ajouter chez
   l'hébergeur DNS du domaine. La vérification prend généralement moins de 15 minutes,
   parfois jusqu'à 72h selon le fournisseur DNS.
4. Une fois vérifié, remplace dans `api/contact.js` :
   ```js
   const FROM_EMAIL = 'LA Photographie33 <contact@tondomaine.fr>';
   ```
   et remets `TO_EMAIL` sur l'adresse définitive du studio si tu l'avais changée
   temporairement à l'étape 2.

## Étape 7 — Ce qu'il faut savoir avant d'ajouter WhatsApp

Tu mentionnes vouloir peut-être ajouter un contact WhatsApp plus tard. Il y a deux
approches très différentes en coût/complexité — utile de trancher tôt pour éviter de
construire dans la mauvaise direction :

### Option A — Lien "cliquer pour discuter" (`wa.me`)

Un simple bouton/lien `https://wa.me/33651512771?text=Bonjour...` qui ouvre WhatsApp
(appli ou web) avec un message pré-rempli, prêt à envoyer. **Aucune API, aucun compte
développeur, aucun coût.** C'est ce qu'utilisent la quasi-totalité des artisans/
indépendants pour un CTA "Contactez-moi sur WhatsApp". Intégration : un `<a>` de plus
dans le footer ou la section contact, du même niveau d'effort que le lien Instagram
déjà en place.

*Recommandation* : c'est très probablement ce qu'il te faut pour "intégrer une feature
de contact par WhatsApp" telle que tu la décris — je peux l'ajouter en quelques
minutes dès que tu as le bon numéro à utiliser.

### Option B — API WhatsApp Business (Cloud API de Meta)

Permet d'envoyer/recevoir des messages **automatiquement** depuis ton propre code (ex.
confirmation automatique de prise de contact, chatbot). Nécessite :

- Un compte **Meta Business**, un numéro de téléphone dédié vérifié par Meta.
- Une app enregistrée sur [developers.facebook.com](https://developers.facebook.com),
  ou un fournisseur tiers (Twilio, 360dialog) qui simplifie l'onboarding moyennant un
  abonnement.
- Un vrai backend qui gère les webhooks entrants — même contrainte que Resend (clé/
  token à protéger côté serveur, pas de JS client), mais nettement plus lourd à mettre
  en place et à maintenir (vérification business, templates de message pré-approuvés
  par Meta pour les premiers messages sortants, etc.).
- Un coût par conversation au-delà d'un quota gratuit mensuel.

*Recommandation* : à ne considérer que si le besoin dépasse "permettre à un client de
me contacter facilement" — ce que fait déjà très bien l'option A. Le formulaire Resend
+ un lien `wa.me` couvrent l'essentiel des cas d'usage d'un site vitrine de
photographe.
