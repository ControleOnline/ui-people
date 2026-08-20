/**
 * Date helpers for AddCompanyModal foundation/birth date fields.
 */

export const toBrDateString = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateInput = text => {
  const numbers = String(text || '').replace(/\D/g, '').slice(0, 8);
  if (!numbers) {
    return '';
  }
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

export const parseBrDateInput = input => {
  const normalized = formatDateInput(input);
  if (normalized.length !== 10) {
    return { error: 'invalidDateFormat' };
  }
  const [day, month, year] = normalized.split('/').map(part => parseInt(part, 10));
  const candidate = new Date(year, month - 1, day);
  const validDate =
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day;
  if (!validDate) {
    return { error: 'invalidDateFormat' };
  }
  return { date: candidate };
};
