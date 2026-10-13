import { validateRecord } from './validators.js';

const form = document.getElementById('txn-form');
const status = document.getElementById('status');

function showErrors(errors) {
  for (const [field, msg] of Object.entries(errors)) {
    const input = document.getElementById(field);
    const err = document.getElementById(`${field}-err`);
    err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const { errors, valid } = validateRecord(data);
  showErrors(errors);

  if (!valid) {
    status.textContent = 'Please fix the errors in the form.';
    const first = Object.keys(errors).find(k => errors[k]);
    document.getElementById(first).focus();
    return;
  }
  status.textContent = `Saved "${data.description}" (${data.amount} RWF).`;
  form.reset();
});

form.addEventListener('reset', () => {
  showErrors({ description: '', amount: '', category: '', date: '' });
  status.textContent = '';
});