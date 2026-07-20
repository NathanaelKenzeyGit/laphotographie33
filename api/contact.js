import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Boîte du studio, destinataire final du formulaire.
const TO_EMAIL = 'laphotographie33@gmail.com';

// Domaine vérifié côté Resend (SPF/DKIM en place) : plus besoin de passer par
// l'adresse de test onboarding@resend.dev.
const FROM_EMAIL = 'LA Photographie33 <contact@nathanaelk.fr>';

const REQUIRED_FIELDS = ['nom', 'prenom', 'email', 'message'];
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Empêche l'injection d'en-têtes SMTP (retour à la ligne dans un champ utilisé
// tel quel dans le sujet du mail).
function stripLineBreaks(value) {
  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function clip(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value ?? '')
    .trim()
    .slice(0, maxLength);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const body = req.body ?? {};

  const missing = REQUIRED_FIELDS.filter((field) => !String(body[field] ?? '').trim());
  if (missing.length > 0) {
    return res.status(400).json({ error: `Champs manquants : ${missing.join(', ')}.` });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(body.email).trim())) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  if (String(body.message).trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Message trop long.' });
  }

  const fields = {
    prestation: clip(body.prestation),
    dateDebut: clip(body.date_debut),
    dateFin: clip(body.date_fin),
    budget: clip(body.budget),
    nom: clip(body.nom),
    prenom: clip(body.prenom),
    email: clip(body.email),
    telephone: clip(body.telephone),
    connuVia: clip(body.connu_via),
    message: clip(body.message, MAX_MESSAGE_LENGTH),
  };

  const html = `
    <h2>Nouvelle demande de contact — LA Photographie33</h2>
    <p><strong>Prestation :</strong> ${escapeHtml(fields.prestation)}</p>
    <p><strong>Dates souhaitées :</strong> ${escapeHtml(fields.dateDebut)} → ${escapeHtml(fields.dateFin)}</p>
    <p><strong>Budget :</strong> ${escapeHtml(fields.budget)} €</p>
    <p><strong>Nom :</strong> ${escapeHtml(fields.prenom)} ${escapeHtml(fields.nom)}</p>
    <p><strong>Email :</strong> ${escapeHtml(fields.email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(fields.telephone)}</p>
    <p><strong>Connu via :</strong> ${escapeHtml(fields.connuVia)}</p>
    <p><strong>Message :</strong><br />${escapeHtml(fields.message).replace(/\n/g, '<br />')}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: fields.email,
      subject: `Nouvelle demande de contact — ${stripLineBreaks(fields.prestation) || 'projet photo'}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: "L'envoi a échoué, réessayez dans un instant." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Erreur serveur, réessayez plus tard.' });
  }
}
