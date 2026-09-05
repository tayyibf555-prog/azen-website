(function () {
  const form = document.getElementById('fit-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // TODO: WhatsApp speed-to-lead ping on successful submit (do not invent backend).
    // TODO: send confirm email / booking handoff (do not invent backend).

    // Successful client-side validation → thank-you (stepped post-booking).
    var nameInput = form.querySelector('[name="name"], #name');
    var firstName = nameInput && nameInput.value ? nameInput.value.trim().split(/\s+/)[0] : '';
    try {
      if (firstName) sessionStorage.setItem('azenFitFirstName', firstName);
      else sessionStorage.removeItem('azenFitFirstName');
    } catch (e) {}
    var thankYou = '/thank-you/';
    if (firstName) thankYou += '?firstname=' + encodeURIComponent(firstName);
    window.location.assign(thankYou);
  });
})();
