import { highlight, escapeHtml } from './search.js';
import { getSettings } from './state.js';

export function formatAmount(rwf) {
  const { displayCurrency, rates } = getSettings();
  if (displayCurrency === 'RWF') return `${rwf.toFixed(2)} RWF`;
  const converted = rwf * (rates[displayCurrency] || 0);
  return `${converted.toFixed(2)} ${displayCurrency}`;
}

export function renderTable(list, re) {
  const tbody = document.getElementById('txn-body');
  const count = document.getElementById('result-count');
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No transactions found.</td></tr>';
  }

  for (const r of list) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Date">${highlight(r.date, re)}</td>
      <td data-label="Description">${highlight(r.description, re)}</td>
      <td data-label="Category">${highlight(r.category, re)}</td>
      <td data-label="Amount">${highlight(formatAmount(r.amount), re)}</td>
      <td data-label="Actions">
        <button type="button" class="edit-btn" data-id="${r.id}"
                aria-label="Edit ${escapeHtml(r.description)}">Edit</button>
        <button type="button" class="delete-btn" data-id="${r.id}"
                aria-label="Delete ${escapeHtml(r.description)}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  }

  count.textContent = `${list.length} transaction${list.length === 1 ? '' : 's'} shown`;
}

export function renderStats(stats, cap) {
  document.getElementById('stat-count').textContent = stats.count;
  document.getElementById('stat-total').textContent = formatAmount(stats.total);
  document.getElementById('stat-top').textContent = stats.topCategory;
  document.getElementById('stat-week').textContent = formatAmount(stats.weekTotal);

  const chart = document.getElementById('chart');
  chart.innerHTML = '';
  const max = Math.max(...stats.days.map(d => d.total), 1);
  for (const day of stats.days) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(day.total / max) * 100}%`;
    bar.title = `${day.date}: ${formatAmount(day.total)}`;
    const label = document.createElement('span');
    label.textContent = day.date.slice(5); // MM-DD
    bar.appendChild(label);
    chart.appendChild(bar);
  }

  const ok = document.getElementById('cap-ok');
  const over = document.getElementById('cap-over');
  if (!cap) {
    ok.textContent = 'No weekly cap set.';
    over.textContent = '';
  } else if (stats.weekTotal <= cap) {
    ok.textContent = `${formatAmount(cap - stats.weekTotal)} remaining of your ${formatAmount(cap)} weekly cap.`;
    over.textContent = '';
  } else {
    ok.textContent = '';
    over.textContent = `Over your weekly cap by ${formatAmount(stats.weekTotal - cap)}.`;
  }
}

export function renderCategoryList(categories) {
  const list = document.getElementById('category-list');
  list.innerHTML = '';
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c;
    list.appendChild(opt);
  }
}