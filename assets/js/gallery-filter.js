// ======================================================
// Filtre de galerie par thématique (page prestations)
// ======================================================

document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.galerie-filter-btn');
  const items = document.querySelectorAll('.galerie-filter-item');

  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;

      filterButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      items.forEach(function (item) {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('d-none', !show);
      });
    });
  });
});
