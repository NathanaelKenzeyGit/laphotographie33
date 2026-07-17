import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Adresse qui reçoit les demandes de contact — le studio du photographe.
const TO_EMAIL = 'laphotographie33@gmail.com';

// Tant qu'aucun domaine n'est vérifié sur le compte Resend, l'envoi doit passer par
// cette adresse de test fournie par Resend (fonctionne sans configuration DNS, mais
// n'accepte d'envoyer qu'à l'adresse du compte Resend). Dès qu'un domaine est vérifié
// (ex. contact@aurelien-lambert-photographe.fr), remplacer par cette adresse.
const FROM_EMAIL = 'LA Photographie33 <onboarding@resend.dev>';

const REQUIRED_FIELDS = ['nom', 'prenom', 'email', 'message'];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  if (!emailPattern.test(body.email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  const fields = {
    prestation: body.prestation ?? '',
    dateDebut: body.date_debut ?? '',
    dateFin: body.date_fin ?? '',
    budget: body.budget ?? '',
    nom: body.nom ?? '',
    prenom: body.prenom ?? '',
    email: body.email ?? '',
    telephone: body.telephone ?? '',
    connuVia: body.connu_via ?? '',
    message: body.message ?? '',
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
      subject: `Nouvelle demande de contact — ${fields.prestation || 'projet photo'}`,
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
