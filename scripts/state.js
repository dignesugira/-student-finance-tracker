let records = [];
let counter = 0;

function nextId() {
  counter += 1;
  return `txn_${String(counter).padStart(4, '0')}`;
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
  return record;
}

export function remove(id) {
  records = records.filter(r => r.id !== id);
}

export function sortRecords(list, key, direction) {
  const sorted = [...list].sort((a, b) => {
    if (key === 'amount') return a.amount - b.amount;
    return String(a[key]).localeCompare(String(b[key]));
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}