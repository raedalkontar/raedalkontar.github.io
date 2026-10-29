// Phone-width menu. The button ships with the `hidden` attribute and the nav
// is visible, so without JavaScript the links simply wrap as before. With it,
// the button appears and the nav collapses until tapped.
(function () {
  var head = document.querySelector('.masthead');
  var btn = head && head.querySelector('.nav-toggle');
  var nav = head && head.querySelector('nav');
  if (!btn || !nav) return;

  head.classList.add('has-toggle');
  btn.hidden = false;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      btn.focus();
    }
  });

  // Tapping outside the masthead closes it.
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !head.contains(e.target)) setOpen(false);
  });
})();
