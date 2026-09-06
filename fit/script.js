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
    var companyInput = form.querySelector('[name="company"], #company');
    var firstName = nameInput && nameInput.value ? nameInput.value.trim().split(/\s+/)[0] : '';
    var business = companyInput && companyInput.value ? companyInput.value.trim() : '';
    try {
      if (firstName) sessionStorage.setItem('azenFitFirstName', firstName);
      else sessionStorage.removeItem('azenFitFirstName');
      if (business) sessionStorage.setItem('azenFitBusiness', business);
      else sessionStorage.removeItem('azenFitBusiness');
    } catch (e) {}
    var thankYou = '/thank-you/';
    var q = [];
    if (firstName) q.push('firstname=' + encodeURIComponent(firstName));
    if (business) q.push('business=' + encodeURIComponent(business));
    if (q.length) thankYou += '?' + q.join('&');
    window.location.assign(thankYou);
  });
})();
