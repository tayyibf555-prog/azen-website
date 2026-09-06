(function () {
  function cleanToken(value, firstWordOnly) {
    var v = (value || '').trim();
    if (!v) return '';
    if (firstWordOnly) v = v.split(/\s+/)[0];
    return v.replace(/[^\p{L}\p{N}\s'.&+-]/gu, '').trim();
  }

  function resolveField(paramKeys, storageKey, firstWordOnly) {
    var params = new URLSearchParams(window.location.search);
    var value = '';
    for (var i = 0; i < paramKeys.length; i++) {
      value = (params.get(paramKeys[i]) || '').trim();
      if (value) break;
    }
    if (!value) {
      try {
        value = (sessionStorage.getItem(storageKey) || '').trim();
      } catch (e) {}
    }
    return cleanToken(value, firstWordOnly);
  }

  var first = resolveField(['firstname', 'name'], 'azenFitFirstName', true);
  var business = resolveField(['business', 'company'], 'azenFitBusiness', false);

  // Thank-you H1 fallbacks (Copywriter lock):
  // both → Wait, {{firstname}} — for {{business}} you’re not done yet.
  // name only → Wait, {{firstname}} — you’re not done yet.
  // business only → For {{business}} you’re not done yet.
  // neither → You’re not done yet.
  var h1 = document.getElementById('confirm-h1');
  if (h1) {
    if (first && business) {
      h1.textContent = 'Wait, ' + first + ' — for ' + business + ' you’re not done yet.';
    } else if (first) {
      h1.textContent = 'Wait, ' + first + ' — you’re not done yet.';
    } else if (business) {
      h1.textContent = 'For ' + business + ' you’re not done yet.';
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
