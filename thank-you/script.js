(function () {
  // Thank-you H1: with name → "Wait, {{firstname}} — you’re not done yet."
  // Blank fallback → "You’re not done yet."
  var h1 = document.getElementById('confirm-h1');
  if (!h1) return;

  var params = new URLSearchParams(window.location.search);
  var first = (params.get('firstname') || params.get('name') || '').trim();
  if (!first) {
    try {
      first = (sessionStorage.getItem('azenFitFirstName') || '').trim();
    } catch (e) {}
  }
  // Use first token only; strip junk
  if (first) {
    first = first.split(/\s+/)[0].replace(/[^\p{L}\p{N}'-]/gu, '');
  }
  if (first) {
    h1.textContent = 'Wait, ' + first + ' — you’re not done yet.';
  } else {
    h1.textContent = 'You’re not done yet.';
  }

  // TODO: when calendar/ICS URL exists, swap the calendar placeholder for a real link.
  // TODO: WhatsApp speed-to-lead + confirm email are owned by the fit form submit path, not here.
})();
