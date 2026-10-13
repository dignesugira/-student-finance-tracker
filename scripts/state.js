import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

const DEFAULT_SETTINGS = {
  baseCurrency: 'RWF',
  displayCurrency: 'RWF',
  rates: { USD: 0.00072, EUR: 0.00066 },
  weeklyCap: 0,
  categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
};

let records = loadRecords();
let settings = { ...DEFAULT_SETTINGS, ...loadSettings() };
let counter = highestCounter(records);

// Find the largest txn_NNNN so new ids never collide after a reload or import.
function highestCounter(list) {
  return list.reduce((max, r) => {
    const n = Number((r.id.match(/^txn_(\d+)$/) || [])[1]);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
}

function nextId() {
  counter += 1;
  return `txn_${String(counter).padStart(4, '0')}`;
}

function persist() {
  saveRecords(records);
}

export function getAll() {
  return [...records];
}

export function getById(id) {
  return records.find(r => r.id === id) || null;
}

export function add({ description, amount, category, date }) {
  const now = new Date().toISOString();
  const record = {
    id: nextId(),
    description,
    amount: Number(amount),
    category,
    date,
    createdAt: now,
    updatedAt: now,
  };
  records.push(record);
  persist();
  return record;
}

export function update(id, { description, amount, category, date }) {
  const record = getById(id);
  if (!record) return null;
  Object.assign(record, {
    description,
    amount: Number(amount),
    category,
    date,
    updatedAt: new Date().toISOString(),
  });
  persist();
  return record;
}

export function remove(id) {
  records = records.filter(r => r.id !== id);
  persist();
}

// Replace everything (used by import / seed).
export function setAll(list) {
  records = list;
  counter = highestCounter(records);
  persist();
}

export function sortRecords(list, key, direction) {
  const sorted = [...list].sort((a, b) => {
    if (key === 'amount') return a.amount - b.amount;
    return String(a[key]).localeCompare(String(b[key]));
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

export function getSettings() {
  return structuredClone(settings);
}

export function updateSettings(changes) {
  settings = { ...settings, ...changes };
  saveSettings(settings);
  return getSettings();
}