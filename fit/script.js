(function () {
  const form = document.getElementById('fit-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelectorAll('input, textarea, select, button').forEach(function (field) { field.hidden = true; });
    form.querySelector('.form-note').hidden = true;
    form.querySelector('.form-success').hidden = false;
  });
})();
