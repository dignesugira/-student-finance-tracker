// Returns 'YYYY-MM-DD' for a Date in local time.
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeStats(records) {
  const count = records.length;
  const total = records.reduce((sum, r) => sum + r.amount, 0);

  // top category by total amount
  const byCategory = {};
  for (const r of records) {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
  }
  const topCategory = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // last 7 days, oldest first, zero-filled
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: toDateString(d), total: 0 });
  }
  for (const r of records) {
    const day = days.find(x => x.date === r.date);
    if (day) day.total += r.amount;
  }
  const weekTotal = days.reduce((s, d) => s + d.total, 0);

  return { count, total, topCategory, days, weekTotal };
}