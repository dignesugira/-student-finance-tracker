import { validateRecord, validateAmount } from './validators.js';
import * as state from './state.js';
import { compileRegex, matches } from './search.js';
import { renderTable, renderStats } from './ui.js';
import { computeStats } from './stats.js';

const form = document.getElementById('txn-form');
const idField = document.getElementById('txn-id');
const saveBtn = document.getElementById('save-btn');
const formHeading = document.getElementById('add-h');
const status = document.getElementById('status');
const searchInput = document.getElementById('search');
const searchErr = document.getElementById('search-err');
const caseBox = document.getElementById('case-insensitive');
const sortSelect = document.getElementById('sort');
const tbody = document.getElementById('txn-body');
const capInput = document.getElementById('weekly-cap');
const capErr = document.getElementById('weekly-cap-err');

let weeklyCap = 0;

function showErrors(errors) {
  for (const [field, msg] of Object.entries(errors)) {
    document.getElementById(`${field}-err`).textContent = msg;
    document.getElementById(field).setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
}

function refresh() {
  const re = compileRegex(searchInput.value, caseBox.checked);
  searchErr.textContent = searchInput.value && !re ? 'Invalid regular expression.' : '';

  const [key, direction] = sortSelect.value.split('-');
  const all = state.getAll();
  const list = state.sortRecords(all.filter(r => matches(r, re)), key, direction);
  renderTable(list, re);
  renderStats(computeStats(all), weeklyCap);
}

function resetForm() {
  form.reset();
  idField.value = '';
  saveBtn.textContent = 'Save Transaction';
  formHeading.textContent = 'Add Transaction';
  showErrors({ description: '', amount: '', category: '', date: '' });
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

  if (data.id) {
    state.update(data.id, data);
    status.textContent = `Updated "${data.description}".`;
  } else {
    state.add(data);
    status.textContent = `Added "${data.description}" (${data.amount} RWF).`;
  }
  resetForm();
  refresh();
});

form.addEventListener('reset', () => {
  setTimeout(resetForm, 0);
  status.textContent = '';
});

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const record = state.getById(btn.dataset.id);
  if (!record) return;

  if (btn.classList.contains('edit-btn')) {
    idField.value = record.id;
    form.description.value = record.description;
    form.amount.value = record.amount;
    form.category.value = record.category;
    form.date.value = record.date;
    saveBtn.textContent = 'Update Transaction';
    formHeading.textContent = 'Edit Transaction';
    form.description.focus();
  }

  if (btn.classList.contains('delete-btn')) {
    if (!confirm(`Delete "${record.description}"?`)) return;
    state.remove(record.id);
    status.textContent = `Deleted "${record.description}".`;
    refresh();
  }
});

capInput.addEventListener('input', () => {
  const v = capInput.value.trim();
  const msg = v ? validateAmount(v) : '';
  capErr.textContent = msg;
  capInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (!msg) {
    weeklyCap = v ? Number(v) : 0;
    refresh();
  }
});

searchInput.addEventListener('input', refresh);
caseBox.addEventListener('change', refresh);
sortSelect.addEventListener('change', refresh);

refresh();