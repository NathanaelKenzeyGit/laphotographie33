document.querySelectorAll('.btn-next').forEach((btn) => {
  btn.addEventListener('click', () => {
    const currentStep = btn.closest('.form-step');

    if (!validateStep(currentStep)) return;

    // Passe à l'étape suivante
    const currentIndex = parseInt(currentStep.id.split('-')[1]);
    const nextStep = document.getElementById(`step-${currentIndex + 1}`);

    if (nextStep) {
      currentStep.classList.add('d-none');
      nextStep.classList.remove('d-none');
    }
  });
});

function validateStep(step) {
  const fields = step.querySelectorAll('input, select, textarea');
  let isValid = true;

  fields.forEach((field) => {
    const isEmpty =
      field.value.trim() === '' || (field.tagName === 'SELECT' && field.selectedIndex === 0);

    if (isEmpty) {
      isValid = false;
      field.classList.add('is-invalid');
    } else {
      field.classList.remove('is-invalid');
    }
  });

  return isValid;
}

const submitBtn = document.getElementById('contact-submit-btn');
const statusEl = document.getElementById('contact-form-status');

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const step3 = submitBtn.closest('.form-step');
    if (!validateStep(step3)) return;

    const payload = {};
    document.querySelectorAll('#step-1 [name], #step-2 [name], #step-3 [name]').forEach((field) => {
      payload[field.name] = field.value.trim();
    });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    statusEl.textContent = '';
    statusEl.classList.remove('text-danger', 'text-success');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      statusEl.textContent = 'Merci ! Votre message a bien été envoyé, je vous réponds sous 48h.';
      statusEl.classList.add('text-success');
      submitBtn.textContent = 'Message envoyé ✓';
    } catch (err) {
      statusEl.textContent = `${err.message} Vous pouvez aussi m'écrire directement à laphotographie33@gmail.com.`;
      statusEl.classList.add('text-danger');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Planifions votre séance';
    }
  });
}
