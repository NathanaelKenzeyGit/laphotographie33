// Lightbox générique : une seule modale Bootstrap réutilisée pour agrandir
// n'importe quelle photo cliquable de la page.
document.addEventListener('DOMContentLoaded', function () {
  const lightboxModalEl = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-modal-img');

  if (!lightboxModalEl || !lightboxImg) return;

  lightboxModalEl.addEventListener('show.bs.modal', function (event) {
    const img = event.relatedTarget && event.relatedTarget.querySelector('img');
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  });

  // La photo occupe tout l'écran (modal-fullscreen) : plus de zone de
  // fond visible pour fermer au clic. On rend toute la modale cliquable
  // pour fermer, sans avoir à viser le bouton croix.
  const modalContent = lightboxModalEl.querySelector('.modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', function () {
      const instance = bootstrap.Modal.getOrCreateInstance(lightboxModalEl);
      instance.hide();
    });
  }
});
