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

  var params = new URLSearchParams(window.location.search);
  var status = (params.get('status') || '').trim().toLowerCase();
  if (!status) {
    try {
      status = (sessionStorage.getItem('azenFitStatus') || '').trim().toLowerCase();
    } catch (e) {}
  }
  if (status !== 'fail' && status !== 'pass') status = 'pass';

  var flag = (params.get('flag') || '').trim();
  if (!flag) {
    try {
      flag = (sessionStorage.getItem('azenFitFlag') || '').trim();
    } catch (e) {}
  }

  var first = resolveField(['firstname', 'name'], 'azenFitFirstName', true);
  var business = resolveField(['business', 'company'], 'azenFitBusiness', false);

  var isFail = status === 'fail';
  document.body.classList.toggle('is-fail', isFail);
  document.body.classList.toggle('is-pass', !isFail);
  if (flag === 'small-ticket') {
    document.body.classList.add('is-small-ticket');
  }

  // Hide calendar / FAQ / proof (and other pass-only blocks) on fail
  document.querySelectorAll('[data-pass-only]').forEach(function (el) {
    el.hidden = isFail;
  });

  var h1 = document.getElementById('confirm-h1');
  var sub = document.getElementById('confirm-sub');
  var second = document.getElementById('confirm-second');
  var eyebrow = document.getElementById('confirm-eyebrow');
  var title = document.querySelector('title');

  if (isFail) {
    if (eyebrow) eyebrow.textContent = 'Application';
    if (h1) {
      h1.textContent = first
        ? 'Thanks for applying, ' + first + '.'
        : 'Thanks for applying.';
    }
    if (sub) {
      sub.textContent =
        'We reviewed your application. This isn’t a fit for a build right now.';
    }
    if (second) {
      second.hidden = false;
      second.textContent =
        'That can change later if the work gets clearer. No need to follow up.';
    }
    if (title) title.textContent = 'Azen. Thanks for applying';
  } else {
    // Copywriter lock (no em dashes): period after {{firstname}}, then For {{business}}…
    // Both / name only / business only / neither.
    if (h1) {
      if (first && business) {
        h1.textContent =
          'Wait, ' + first + '. For ' + business + ' you’re not done yet.';
      } else if (first) {
        h1.textContent = 'Wait, ' + first + '. You’re not done yet.';
      } else if (business) {
        h1.textContent = 'For ' + business + ' you’re not done yet.';
      } else {
        h1.textContent = 'You’re not done yet.';
      }
    }
    if (second) second.hidden = true;
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

  // Calendar CTA is wired to Calendly on pass (see #calendar-cta in index.html).
  // TODO: WhatsApp speed-to-lead + confirm email are owned by the fit form submit path, not here.
})();
