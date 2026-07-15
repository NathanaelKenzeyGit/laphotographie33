import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Chargés via <script> CDN dans les pages HTML (jQuery, GSAP, Bootstrap),
        // jamais importés comme modules — donc pas connus d'eslint sans ça.
        $: 'readonly',
        jQuery: 'readonly',
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        bootstrap: 'readonly',
      },
    },
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    // Fonctions serverless Vercel (api/**) : Node.js + ESM (import/export), pas du
    // JS navigateur — contrairement au reste du dossier assets/js.
    files: ['api/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node,
    },
  },
]);
