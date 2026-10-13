// Each rule: a regex and the message when it fails.
export const patterns = {
  description: /^\S(?:.*\S)?$/,            // no leading or trailing whitespaces
  duplicateWord: /\b(\w+)\s+\1\b/i,        // advanced: back reference
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,    // no leading zeros, maximum 2 decimals
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
};

export function validateDescription(v) {
  if (!v) return 'Description is required.';
  if (!patterns.description.test(v)) return 'No leading or trailing spaces.';
  if (patterns.duplicateWord.test(v)) return 'Remove the repeated word.';
  return '';
}

export function validateAmount(v) {
  if (!v) return 'Amount is required.';
  if (!patterns.amount.test(v)) return 'Use a number like 1500 or 12.50.';
  return '';
}

export function validateCategory(v) {
  if (!v) return 'Category is required.';
  if (!patterns.category.test(v)) return 'Letters, spaces and hyphens only.';
  return '';
}

export function validateDate(v) {
  if (!v) return 'Date is required.';
  if (!patterns.date.test(v)) return 'Use the format YYYY-MM-DD.';
  if (Number.isNaN(Date.parse(v))) return 'That date does not exist.';
  return '';
}

// Returns { errors: {field: message}, valid: boolean }
export function validateRecord(data) {
  const errors = {
    description: validateDescription(data.description),
    amount: validateAmount(data.amount),
    category: validateCategory(data.category),
    date: validateDate(data.date),
  };
  const valid = Object.values(errors).every(e => e === '');
  return { errors, valid };
}