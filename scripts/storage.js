const DATA_KEY = 'sft:transactions';
const SETTINGS_KEY = 'sft:settings';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadRecords() {
  return read(DATA_KEY, []);
}

export function saveRecords(records) {
  localStorage.setItem(DATA_KEY, JSON.stringify(records));
}

export function loadSettings() {
  return read(SETTINGS_KEY, {});
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}