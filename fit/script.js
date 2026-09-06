(function () {
  var form = document.getElementById('fit-form');
  if (!form) return;

  var step1 = form.querySelector('[data-step="1"]');
  var step2 = form.querySelector('[data-step="2"]');
  var nextBtn = document.getElementById('fit-next');
  var backBtn = document.getElementById('fit-back');
  var progressSteps = form.querySelectorAll('[data-progress]');

  function setStep(n) {
    var onOne = n === 1;
    if (step1) {
      step1.classList.toggle('is-active', onOne);
      step1.hidden = !onOne;
    }
    if (step2) {
      step2.classList.toggle('is-active', !onOne);
      step2.hidden = onOne;
    }
    progressSteps.forEach(function (el) {
      var active = String(el.getAttribute('data-progress')) === String(n);
      el.classList.toggle('is-active', active);
      el.classList.toggle('is-done', Number(el.getAttribute('data-progress')) < n);
    });
    var focusEl = form.querySelector(
      onOne ? '#name' : '#breaking'
    );
    if (focusEl) focusEl.focus({ preventScroll: true });
  }

  function stepFields(stepEl) {
    if (!stepEl) return [];
    return Array.prototype.slice.call(
      stepEl.querySelectorAll('input, select, textarea')
    );
  }

  function validateStep(stepEl) {
    var fields = stepFields(stepEl);
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) {
        fields[i].reportValidity();
        return false;
      }
    }
    return true;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validateStep(step1)) return;
      setStep(2);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      setStep(1);
    });
  }

  function firstNameFrom(name) {
    return (name || '').trim().split(/\s+/)[0] || '';
  }

  // Kill if: team solo or 1–2 OR budget none/exploring or under £1.5k
  // OR DM=No OR intent chatbot/free-audit
  // Pass + small-ticket if budget £1.5–3k (and not killed)
  // Pass normal if budget above £3k (and not killed)
  function qualify(data) {
    var kill =
      data.team === 'solo' ||
      data.team === '1-2' ||
      data.budget === 'none' ||
      data.budget === 'under-1.5k' ||
      data.dm === 'no' ||
      data.intent === 'chatbot' ||
      data.intent === 'free-audit';

    if (kill) {
      return { status: 'fail' };
    }
    if (data.budget === '1.5-3k') {
      return { status: 'pass', flag: 'small-ticket' };
    }
    return { status: 'pass' };
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (step2 && step2.hidden) {
      if (!validateStep(step1)) return;
      setStep(2);
      return;
    }
    if (!validateStep(step1) || !validateStep(step2)) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // TODO: WhatsApp speed-to-lead ping on successful submit (do not invent backend).
    // TODO: send confirm email (do not invent backend).
    // Pass path books via thank-you calendar CTA: https://calendly.com/tayyib-azen/30min

    var payload = {
      name: (form.elements.name && form.elements.name.value) || '',
      email: (form.elements.email && form.elements.email.value) || '',
      mobile: (form.elements.mobile && form.elements.mobile.value) || '',
      company: (form.elements.company && form.elements.company.value) || '',
      team: (form.elements.team && form.elements.team.value) || '',
      breaking: (form.elements.breaking && form.elements.breaking.value) || '',
      tools: (form.elements.tools && form.elements.tools.value) || '',
      budget: (form.elements.budget && form.elements.budget.value) || '',
      timeline: (form.elements.timeline && form.elements.timeline.value) || '',
      dm: (form.elements.dm && form.elements.dm.value) || '',
      intent: (form.elements.intent && form.elements.intent.value) || ''
    };

    var firstName = firstNameFrom(payload.name);
    var businessName = payload.company.trim();
    var mobile = (payload.mobile || '').trim();

    var result = qualify({
      team: payload.team,
      budget: payload.budget,
      dm: payload.dm,
      intent: payload.intent
    });

    var flags = result.flag ? [result.flag] : [];
    var handoff = {
      firstName: firstName,
      businessName: businessName,
      mobile: mobile,
      calendar: 'https://calendly.com/tayyib-azen/30min',
      flags: flags,
      status: result.status
    };

    try {
      if (handoff.firstName) sessionStorage.setItem('azenFitFirstName', handoff.firstName);
      else sessionStorage.removeItem('azenFitFirstName');
      if (handoff.businessName) sessionStorage.setItem('azenFitBusiness', handoff.businessName);
      else sessionStorage.removeItem('azenFitBusiness');
      if (handoff.mobile) sessionStorage.setItem('azenFitMobile', handoff.mobile);
      else sessionStorage.removeItem('azenFitMobile');
      sessionStorage.setItem('azenFitStatus', handoff.status);
      if (result.flag) sessionStorage.setItem('azenFitFlag', result.flag);
      else sessionStorage.removeItem('azenFitFlag');
    } catch (e) {}

    var q = ['status=' + encodeURIComponent(handoff.status)];
    if (handoff.firstName) q.push('firstname=' + encodeURIComponent(handoff.firstName));
    if (handoff.status === 'pass' && handoff.businessName) {
      q.push('business=' + encodeURIComponent(handoff.businessName));
    }
    if (result.flag) q.push('flag=' + encodeURIComponent(result.flag));

    window.location.assign('/thank-you/?' + q.join('&'));
  });
})();
