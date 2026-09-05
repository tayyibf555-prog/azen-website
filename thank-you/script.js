(function () {
  // Shared firstname resolution for H1 + calendar invite mock.
  function resolveFirstName() {
    var params = new URLSearchParams(window.location.search);
    var first = (params.get('firstname') || params.get('name') || '').trim();
    if (!first) {
      try {
        first = (sessionStorage.getItem('azenFitFirstName') || '').trim();
      } catch (e) {}
    }
    if (first) {
      first = first.split(/\s+/)[0].replace(/[^\p{L}\p{N}'-]/gu, '');
    }
    return first || '';
  }

  var first = resolveFirstName();

  // Thank-you H1: with name → "Wait, {{firstname}} — you’re not done yet."
  // Blank fallback → "You’re not done yet."
  var h1 = document.getElementById('confirm-h1');
  if (h1) {
    if (first) {
      h1.textContent = 'Wait, ' + first + ' — you’re not done yet.';
    } else {
      h1.textContent = 'You’re not done yet.';
    }
  }

  // Calendar invite mock guests: Tayyib Arbab + {{firstname}} (or "You")
  var guestName = document.getElementById('invite-guest-name');
  var guestInitial = document.getElementById('invite-guest-initial');
  if (guestName) {
    guestName.textContent = first || 'You';
  }
  if (guestInitial) {
    guestInitial.textContent = (first || 'Y').charAt(0).toUpperCase();
  }

  // TODO: when calendar/ICS URL exists, swap the calendar placeholder for a real link.
  // TODO: WhatsApp speed-to-lead + confirm email are owned by the fit form submit path, not here.
})();
