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
    window.location.assign('/thank-you/');
  });
})();
