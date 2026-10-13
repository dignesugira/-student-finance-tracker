import { validateRecord, validateAmount, validateCategory, validateImport } from './validators.js';
import * as state from './state.js';
import { compileRegex, matches } from './search.js';
import { renderTable, renderStats, renderCategoryList } from './ui.js';
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
const currencySelect = document.getElementById('display-currency');
const rateUsd = document.getElementById('rate-usd');
const rateEur = document.getElementById('rate-eur');
const categoriesInput = document.getElementById('categories');
const categoriesErr = document.getElementById('categories-err');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const seedBtn = document.getElementById('seed-btn');

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
  renderStats(computeStats(all), state.getSettings().weeklyCap);
}

function resetForm() {
  form.reset();
  idField.value = '';
  saveBtn.textContent = 'Save Transaction';
  formHeading.textContent = 'Add Transaction';
  showErrors({ description: '', amount: '', category: '', date: '' });
}

// Fill the settings inputs from saved settings on load.
function loadSettingsIntoForm() {
  const s = state.getSettings();
  capInput.value = s.weeklyCap || '';
  currencySelect.value = s.displayCurrency;
  rateUsd.value = s.rates.USD;
  rateEur.value = s.rates.EUR;
  categoriesInput.value = s.categories.join(', ');
  renderCategoryList(s.categories);
}

// ---- transactions form ----
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

searchInput.addEventListener('input', refresh);
caseBox.addEventListener('change', refresh);
sortSelect.addEventListener('change', refresh);

// ---- settings ----
capInput.addEventListener('input', () => {
  const v = capInput.value.trim();
  const msg = v ? validateAmount(v) : '';
  capErr.textContent = msg;
  capInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (!msg) {
    state.updateSettings({ weeklyCap: v ? Number(v) : 0 });
    refresh();
  }
});

currencySelect.addEventListener('change', () => {
  state.updateSettings({ displayCurrency: currencySelect.value });
  refresh();
});

function handleRate(input, code) {
  const err = document.getElementById(`${input.id}-err`);
  const v = input.value.trim();
  const ok = /^(0|[1-9]\d*)(\.\d+)?$/.test(v) && Number(v) > 0;
  err.textContent = ok ? '' : 'Enter a positive number.';
  input.setAttribute('aria-invalid', ok ? 'false' : 'true');
  if (ok) {
    const rates = { ...state.getSettings().rates, [code]: Number(v) };
    state.updateSettings({ rates });
    refresh();
  }
}
rateUsd.addEventListener('input', () => handleRate(rateUsd, 'USD'));
rateEur.addEventListener('input', () => handleRate(rateEur, 'EUR'));

categoriesInput.addEventListener('change', () => {
  const list = categoriesInput.value.split(',').map(s => s.trim()).filter(Boolean);
  const bad = list.find(c => validateCategory(c));
  if (list.length === 0 || bad) {
    categoriesErr.textContent = bad ? `"${bad}": ${validateCategory(bad)}` : 'Enter at least one category.';
    categoriesInput.setAttribute('aria-invalid', 'true');
    return;
  }
  categoriesErr.textContent = '';
  categoriesInput.setAttribute('aria-invalid', 'false');
  state.updateSettings({ categories: list });
  renderCategoryList(list);
  status.textContent = 'Categories saved.';
});

// ---- import / export ----
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state.getAll(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Exported transactions.';
});

function importRecords(text, source) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    status.textContent = `${source}: not valid JSON.`;
    return;
  }
  const { records, error } = validateImport(parsed);
  if (error) {
    status.textContent = `${source}: ${error}`;
    return;
  }
  if (!confirm(`Replace your ${state.getAll().length} transaction(s) with ${records.length} from ${source}?`)) return;
  state.setAll(records);
  status.textContent = `Imported ${records.length} transactions from ${source}.`;
  refresh();
}

importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  importRecords(await file.text(), file.name);
  importFile.value = '';
});

seedBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('seed.json');
    importRecords(await res.text(), 'seed.json');
  } catch {
    status.textContent = 'Could not load seed.json.';
  }
});

// ---- start ----
loadSettingsIntoForm();
refresh();