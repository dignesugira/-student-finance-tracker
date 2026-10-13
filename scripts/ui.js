import { highlight, escapeHtml } from './search.js';

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
      <td data-label="Amount">${highlight(r.amount.toFixed(2), re)}</td>
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