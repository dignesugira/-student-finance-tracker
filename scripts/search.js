
export function compileRegex(input, caseInsensitive = true) {
  if (!input) return null;
  try {
    return new RegExp(input, caseInsensitive ? 'gi' : 'g');
  } catch {
    return null;
  }
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function highlight(text, re) {
  const safe = escapeHtml(text);
  if (!re) return safe;
  re.lastIndex = 0;
  return safe.replace(re, m => (m ? `<mark>${m}</mark>` : m));
}

export function matches(record, re) {
  if (!re) return true;
  const fields = [record.description, record.category, record.date, String(record.amount)];
  return fields.some(f => {
    re.lastIndex = 0;
    return re.test(f);
  });
}