// All dates are plain "YYYY-MM-DD" strings so timezones never shift a log to another day.
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Monday of the week containing dateStr
function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const diff = (d.getUTCDay() + 6) % 7;
  return addDays(dateStr, -diff);
}

function range(endStr, days) {
  return Array.from({ length: days }, (_, i) => addDays(endStr, i - (days - 1)));
}

const serverToday = () => new Date().toISOString().slice(0, 10);

module.exports = { isDate, addDays, startOfWeek, range, serverToday };
