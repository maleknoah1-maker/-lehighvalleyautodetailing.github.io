// v2 homepage extras. script.js still handles the nav, menu, reveals,
// gallery, booking form and GA click tracking.

// ─── REVIEW MARQUEE ───
// Duplicates the cards once so the track can loop seamlessly (-50%).
// The copies are hidden from screen readers so each review is read once.
(function () {
  document.querySelectorAll('[data-marquee] .marquee-track').forEach(function (track) {
    Array.from(track.children).forEach(function (card) {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
})();

// ─── REVIEWS: "Read full review" for clamped (long) reviews ───
// Cards clamp the text in CSS; any card whose text is cut off gets a button
// that opens the whole review in a dialog. Runs after the marquee clones the
// cards, so the looping copies get the button too.
(function () {
  const cards = document.querySelectorAll('.r-card');
  if (!cards.length || typeof HTMLDialogElement === 'undefined') return;

  const dlg = document.createElement('dialog');
  dlg.className = 'review-dialog';
  dlg.setAttribute('aria-label', 'Full review');
  dlg.innerHTML = '<button class="rd-close" type="button" aria-label="Close">×</button>' +
    '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p></p><div class="rd-name"></div>' +
    '<a class="rd-google" href="https://www.google.com/maps?cid=6334011887982355620" target="_blank" rel="noopener">See all reviews on Google →</a>';
  document.body.appendChild(dlg);
  dlg.querySelector('.rd-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // backdrop click

  function addButtons() {
    cards.forEach(card => {
      const p = card.querySelector('blockquote p');
      if (!p || card.querySelector('.r-more') || p.scrollHeight <= p.clientHeight + 2) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-more';
      btn.textContent = 'Read full review';
      if (card.getAttribute('aria-hidden') === 'true') btn.tabIndex = -1;
      btn.addEventListener('click', () => {
        dlg.querySelector('p').textContent = p.textContent;
        const cap = card.querySelector('figcaption');
        dlg.querySelector('.rd-name').innerHTML = cap ? cap.innerHTML : '';
        dlg.showModal();
      });
      card.querySelector('blockquote').after(btn);
    });
  }
  // fonts change line breaks, so measure after they load
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(addButtons);
})();
